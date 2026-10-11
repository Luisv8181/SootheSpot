#!/usr/bin/env python3
"""Validate both SootheSpot catalogs and report unknown metadata without guessing."""

import json
import pathlib
import sys
from collections import defaultdict
from datetime import date, timedelta
from urllib.parse import urlparse

ROOT = pathlib.Path(__file__).resolve().parents[1]
CATALOG_FILES = {
    "resources": ROOT / "resources" / "resources.json",
    "books": ROOT / "resources" / "books.json",
}
REQUIRED = {
    "id", "name", "publisher", "resource_type", "official_url", "description",
    "tags", "access", "review_status", "last_verified_at", "shelf", "needs",
}
STATUSES = {"unreviewed", "screened", "clinically_reviewed", "verified", "deprecated"}
SHELVES = {"read", "listen", "practice", "watch", "sleep-rest", "understand-yourself", "reach-out"}
NEEDS = {
    "calm", "sleep", "understand", "practice", "listen", "watch", "read", "support",
    "stress", "anxiety", "mood", "trauma", "self-compassion", "grief", "substance-use",
}
ARRAY_FIELDS = {
    "platforms", "formats", "languages", "locales", "regions", "availability_regions",
    "accessibility", "needs", "shelves", "authors", "source_notes", "intended_population",
    "use_context", "tags", "access",
}
GAP_FIELDS = (
    "formats", "locales", "publisher_region", "availability_regions", "accessibility",
    "privacy_notes", "cultural_context", "limitations", "source_notes", "license_notes",
)
STALE_DAYS = 180


def https_url(value):
    if not isinstance(value, str):
        return False
    try:
        parsed = urlparse(value)
        return parsed.scheme == "https" and bool(parsed.hostname) and not parsed.username and not parsed.password
    except ValueError:
        return False


def valid_isbn(value):
    if not isinstance(value, str):
        return False
    isbn = value.replace("-", "").replace(" ", "").upper()
    if len(isbn) == 13 and isbn.isdigit():
        total = sum(int(d) * (1 if i % 2 == 0 else 3) for i, d in enumerate(isbn[:12]))
        return (10 - total % 10) % 10 == int(isbn[12])
    if len(isbn) == 10 and isbn[:9].isdigit() and (isbn[9].isdigit() or isbn[9] == "X"):
        return sum((10 - i) * (10 if d == "X" else int(d)) for i, d in enumerate(isbn)) % 11 == 0
    return False


def validate_catalogs(catalogs, today=None):
    today = today or date.today()
    counts, seen, gaps, stale = {}, {}, defaultdict(list), []
    for catalog_name, records in catalogs.items():
        if not isinstance(records, list):
            raise ValueError(f"{catalog_name}: catalog must be a JSON array")
        counts[catalog_name] = len(records)
        for index, record in enumerate(records):
            label = f"{catalog_name} record {index}"
            if not isinstance(record, dict):
                raise ValueError(f"{label}: expected an object")
            missing = REQUIRED - record.keys()
            if missing:
                raise ValueError(f"{label}: missing required fields: {sorted(missing)}")
            for field in ("id", "name", "publisher", "resource_type", "official_url", "description", "review_status", "last_verified_at"):
                if not isinstance(record[field], str) or not record[field].strip():
                    raise ValueError(f"{label}: {field} must be a non-empty string")
            rid = record["id"]
            if rid in seen:
                raise ValueError(f"{label}: duplicate ID {rid!r} also appears in {seen[rid]}")
            seen[rid] = catalog_name
            if not https_url(record["official_url"]):
                raise ValueError(f"{rid}: official_url must be HTTPS without embedded credentials")
            if record["review_status"] not in STATUSES:
                raise ValueError(f"{rid}: invalid review_status")
            try:
                checked = date.fromisoformat(record["last_verified_at"])
            except (TypeError, ValueError):
                raise ValueError(f"{rid}: last_verified_at must use YYYY-MM-DD") from None
            if checked.isoformat() != record["last_verified_at"] or checked > today:
                raise ValueError(f"{rid}: last_verified_at must be a real date no later than today")
            if today - checked > timedelta(days=STALE_DAYS):
                stale.append(rid)
            for field in ARRAY_FIELDS:
                if field in record and (not isinstance(record[field], list) or any(not isinstance(x, str) or not x.strip() for x in record[field])):
                    raise ValueError(f"{rid}: {field} must be an array of non-empty strings")
            if not record["tags"]:
                raise ValueError(f"{rid}: tags must be non-empty")
            if record["shelf"] not in SHELVES:
                raise ValueError(f"{rid}: invalid primary shelf {record['shelf']!r}")
            secondary = record.get("shelves", [])
            if any(shelf not in SHELVES for shelf in secondary):
                raise ValueError(f"{rid}: invalid secondary shelf")
            if len(secondary) != len(set(secondary)) or record["shelf"] in secondary:
                raise ValueError(f"{rid}: shelves must be unique and must not repeat the primary shelf")
            if not set(record["needs"]) <= NEEDS:
                raise ValueError(f"{rid}: invalid needs {sorted(set(record['needs']) - NEEDS)}")
            if len(record["needs"]) != len(set(record["needs"])):
                raise ValueError(f"{rid}: needs must not contain duplicates")
            durations = record.get("duration_options_minutes")
            if durations is not None and (not isinstance(durations, list) or any(isinstance(n, bool) or not isinstance(n, (int, float)) or n <= 0 for n in durations)):
                raise ValueError(f"{rid}: duration_options_minutes must contain positive numbers")
            if record.get("data_practices_url") is not None and not https_url(record["data_practices_url"]):
                raise ValueError(f"{rid}: data_practices_url must be HTTPS")
            sources = record.get("source_notes", [])
            if not isinstance(sources, list) or any(not https_url(url) for url in sources):
                raise ValueError(f"{rid}: source_notes must contain HTTPS URLs")
            if record["review_status"] in {"verified", "clinically_reviewed"} and not sources:
                raise ValueError(f"{rid}: reviewed records require HTTPS source_notes provenance")
            cultural = record.get("cultural_context")
            if cultural is not None:
                allowed = {"unknown", "translated", "localized", "culturally_adapted", "community_informed"}
                if not isinstance(cultural, dict) or cultural.get("adaptation_status") not in allowed:
                    raise ValueError(f"{rid}: cultural_context needs a recognized adaptation_status")
                if "source_notes" in cultural and (not isinstance(cultural["source_notes"], list) or any(not https_url(url) for url in cultural["source_notes"])):
                    raise ValueError(f"{rid}: cultural_context.source_notes must contain HTTPS URLs")
            if record["resource_type"].lower() == "book":
                if record["shelf"] != "read":
                    raise ValueError(f"{rid}: books must use the Read shelf")
                if not isinstance(record.get("authors"), list) or not record["authors"]:
                    raise ValueError(f"{rid}: books require at least one author")
                if not valid_isbn(record.get("isbn")):
                    raise ValueError(f"{rid}: books require a valid ISBN checksum")
                year = record.get("publication_year")
                if isinstance(year, bool) or not isinstance(year, int) or not 1450 <= year <= today.year + 1:
                    raise ValueError(f"{rid}: books require a valid publication_year")
                pages = record.get("page_count")
                if isinstance(pages, bool) or not isinstance(pages, int) or pages < 1:
                    raise ValueError(f"{rid}: books require a positive integer page_count")
                if "duration_options_minutes" in record:
                    raise ValueError(f"{rid}: books must not use media duration_options_minutes")
                license_notes = record.get("license_notes", "").lower()
                if not any(term in license_notes for term in ("bibliographic", "metadata only", "no copyrighted")):
                    raise ValueError(f"{rid}: book license_notes must state the metadata-only boundary")
            for field in GAP_FIELDS:
                if record.get(field) in (None, "", []):
                    gaps[field].append(rid)
            if record["resource_type"].lower() != "book" and not record.get("duration_options_minutes"):
                gaps["duration_options_minutes"].append(rid)
    return {"counts": counts, "total": sum(counts.values()), "gaps": dict(gaps), "stale": sorted(stale)}


def main():
    catalogs = {}
    try:
        for name, path in CATALOG_FILES.items():
            catalogs[name] = json.loads(path.read_text(encoding="utf-8"))
        report = validate_catalogs(catalogs)
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        print(f"ERROR: {exc}")
        return 1
    counts = ", ".join(f"{name}={count}" for name, count in report["counts"].items())
    print(f"Validated {report['total']} records across {len(report['counts'])} catalogs ({counts}).")
    print("Metadata gaps are non-blocking and are not auto-filled:")
    for field, ids in sorted(report["gaps"].items()):
        print(f"  {field}: {len(ids)} record(s)")
    if report["stale"]:
        print(f"Review freshness warning (> {STALE_DAYS} days): " + ", ".join(report["stale"]))
    else:
        print(f"Review freshness: no records older than {STALE_DAYS} days.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
