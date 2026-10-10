#!/usr/bin/env python3
"""Validate the SootheSpot resource and book catalogs together."""

import json
import pathlib
import re
import sys
from datetime import date
from urllib.parse import urlparse

ROOT = pathlib.Path(__file__).resolve().parents[1]
CATALOGS = {"resources": ROOT / "resources/resources.json", "books": ROOT / "resources/books.json"}
REQUIRED = {"id", "name", "publisher", "resource_type", "official_url", "description", "tags", "access", "review_status", "last_verified_at"}
STATUSES = {"unreviewed", "screened", "clinically_reviewed", "verified", "deprecated"}
SHELVES = {"read", "listen", "practice", "watch", "sleep-rest", "understand-yourself", "reach-out"}
ARRAY_FIELDS = {"platforms", "languages", "locales", "regions", "availability_regions", "accessibility", "needs", "shelves", "authors", "source_notes", "intended_population", "use_context", "tags", "access"}


def is_https(value):
    if not isinstance(value, str):
        return False
    parsed = urlparse(value)
    return parsed.scheme == "https" and bool(parsed.hostname) and not parsed.username and not parsed.password


def valid_isbn(value):
    if not isinstance(value, str):
        return False
    isbn = re.sub(r"[-\\s]", "", value).upper()
    if re.fullmatch(r"\\d{13}", isbn):
        total = sum(int(d) * (1 if i % 2 == 0 else 3) for i, d in enumerate(isbn[:12]))
        return (10 - total % 10) % 10 == int(isbn[12])
    if re.fullmatch(r"\\d{9}[\\dX]", isbn):
        return sum((10 - i) * (10 if d == "X" else int(d)) for i, d in enumerate(isbn)) % 11 == 0
    return False


def validate_catalogs(catalogs):
    seen, counts = set(), {}
    for name, records in catalogs.items():
        if not isinstance(records, list):
            raise ValueError(f"{name}: catalog must be a JSON array")
        counts[name] = len(records)
        for index, record in enumerate(records):
            label = f"{name} record {index}"
            if not isinstance(record, dict):
                raise ValueError(f"{label}: expected an object")
            missing = REQUIRED - record.keys()
            if missing:
                raise ValueError(f"{label}: missing fields: {sorted(missing)}")
            for field in ("id", "name", "publisher", "resource_type", "official_url", "description", "review_status", "last_verified_at"):
                if not isinstance(record[field], str) or not record[field].strip():
                    raise ValueError(f"{label}: {field} must be a non-empty string")
            rid = record["id"]
            if rid in seen:
                raise ValueError(f"{label}: duplicate ID across catalogs: {rid}")
            seen.add(rid)
            if not is_https(record["official_url"]):
                raise ValueError(f"{rid}: official_url must be HTTPS without embedded credentials")
            if record["review_status"] not in STATUSES:
                raise ValueError(f"{rid}: invalid review_status")
            try:
                parsed = date.fromisoformat(record["last_verified_at"])
            except ValueError:
                raise ValueError(f"{rid}: invalid last_verified_at; expected YYYY-MM-DD") from None
            if parsed.isoformat() != record["last_verified_at"]:
                raise ValueError(f"{rid}: last_verified_at must use YYYY-MM-DD")
            for field in ARRAY_FIELDS:
                if field in record and (not isinstance(record[field], list) or any(not isinstance(v, str) or not v.strip() for v in record[field])):
                    raise ValueError(f"{rid}: {field} must be an array of non-empty strings")
            for field in ("privacy_notes", "limitations", "license_notes", "evidence_notes", "publisher_region"):
                if field in record and not isinstance(record[field], str):
                    raise ValueError(f"{rid}: {field} must be a string")
            if not isinstance(record["tags"], list) or not record["tags"]:
                raise ValueError(f"{rid}: tags must be non-empty")
            if "shelf" in record and record["shelf"] not in SHELVES:
                raise ValueError(f"{rid}: invalid primary shelf")
            if "shelves" in record and any(s not in SHELVES for s in record["shelves"]):
                raise ValueError(f"{rid}: invalid secondary shelf")
            if "duration_options_minutes" in record:
                durations = record["duration_options_minutes"]
                if not isinstance(durations, list) or any(isinstance(v, bool) or not isinstance(v, (int, float)) or v <= 0 for v in durations):
                    raise ValueError(f"{rid}: duration options must be positive numbers")
            if "publication_year" in record and (isinstance(record["publication_year"], bool) or not isinstance(record["publication_year"], int) or not 1450 <= record["publication_year"] <= date.today().year + 1):
                raise ValueError(f"{rid}: invalid publication_year")
            if "page_count" in record and (isinstance(record["page_count"], bool) or not isinstance(record["page_count"], int) or record["page_count"] < 1):
                raise ValueError(f"{rid}: invalid page_count")
            if record["review_status"] == "verified":
                sources = record.get("source_notes", [])
                if not isinstance(sources, list) or not any(is_https(source) for source in sources):
                    raise ValueError(f"{rid}: verified records require an HTTPS provenance URL")
            if record["resource_type"].lower() == "book":
                if record.get("shelf") != "read":
                    raise ValueError(f"{rid}: book must use the Read shelf")
                if not isinstance(record.get("authors"), list) or not record["authors"]:
                    raise ValueError(f"{rid}: book requires authors")
                if not valid_isbn(record.get("isbn")):
                    raise ValueError(f"{rid}: book requires a valid ISBN checksum")
                if not isinstance(record.get("publication_year"), int):
                    raise ValueError(f"{rid}: book requires publication_year")
                if not isinstance(record.get("license_notes"), str) or not record["license_notes"].strip():
                    raise ValueError(f"{rid}: book requires bibliographic/license boundary notes")
    return counts


def main():
    catalogs = {}
    try:
        for name, path in CATALOGS.items():
            catalogs[name] = json.loads(path.read_text(encoding="utf-8"))
        counts = validate_catalogs(catalogs)
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        print(f"ERROR: {exc}")
        return 1
    print("Validated " + str(sum(counts.values())) + " records: " + ", ".join(f"{k}={v}" for k, v in counts.items()))
    return 0


if __name__ == "__main__":
    sys.exit(main())
