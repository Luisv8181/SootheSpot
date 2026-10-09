#!/usr/bin/env python3
"""Validate the SootheSpot resource registry and bibliographic book catalog.

Missing descriptive metadata is allowed during migration, but every such gap is
reported. Verified records must have primary-source provenance and an explicit
last-verification date. Records must not rely on a filled field to imply that
clinical efficacy, cultural adaptation, accessibility, or regional availability
has been established.
"""

import json
import pathlib
import sys
from urllib.parse import urlparse

ROOT = pathlib.Path(__file__).resolve().parents[1]
CATALOG_FILES = (
    ROOT / "resources" / "resources.json",
    ROOT / "resources" / "books.json",
)
REQUIRED = {
    "id",
    "name",
    "publisher",
    "resource_type",
    "official_url",
    "description",
    "tags",
    "access",
    "review_status",
    "last_verified_at",
}
STATUSES = {"unreviewed", "screened", "clinically_reviewed", "verified", "deprecated"}
SHELVES = {"read", "listen", "practice", "watch", "sleep-rest", "understand-yourself", "reach-out"}
NEEDS = {
    "calm", "sleep", "understand", "practice", "listen", "watch", "read",
    "support", "stress", "anxiety", "mood", "trauma", "self-compassion",
    "grief", "substance-use",
}
TRACKED_METADATA = (
    "languages",
    "access",
    "accessibility",
    "regions",
    "limitations",
    "last_verified_at",
    "source_notes",
    "shelf",
    "needs",
)


def fail(message: str) -> None:
    print(f"ERROR: {message}")
    raise SystemExit(1)


def nonempty(value: object) -> bool:
    return value is not None and value != "" and value != []


def load_catalog(path: pathlib.Path) -> list[dict]:
    try:
        records = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        fail(f"could not parse {path.relative_to(ROOT)}: {exc}")
    if not isinstance(records, list):
        fail(f"{path.relative_to(ROOT)} must contain a JSON array")
    for index, record in enumerate(records):
        if not isinstance(record, dict):
            fail(f"{path.relative_to(ROOT)} record {index} is not an object")
    return records


def main() -> int:
    all_records = []
    for path in CATALOG_FILES:
        records = load_catalog(path)
        for record in records:
            missing = REQUIRED - record.keys()
            if missing:
                fail(f"{record.get('id', path.name)} missing required fields: {sorted(missing)}")

            rid = record["id"]
            parsed = urlparse(record["official_url"])
            if parsed.scheme != "https" or not parsed.netloc:
                fail(f"{rid}: official_url must be an HTTPS URL")
            if record["review_status"] not in STATUSES:
                fail(f"{rid}: invalid review_status")
            if not isinstance(record["tags"], list) or not record["tags"]:
                fail(f"{rid}: tags must be a non-empty array")
            if not isinstance(record["access"], list):
                fail(f"{rid}: access must be an array")

            if record.get("shelf") is not None and record["shelf"] not in SHELVES:
                fail(f"{rid}: invalid explicit shelf {record['shelf']!r}")
            if record.get("needs") is not None:
                if not isinstance(record["needs"], list):
                    fail(f"{rid}: needs must be an array when provided")
                invalid_needs = sorted(set(record["needs"]) - NEEDS)
                if invalid_needs:
                    fail(f"{rid}: invalid needs {invalid_needs}")

            duration = record.get("duration_options_minutes")
            if duration is not None:
                if not isinstance(duration, list) or any(
                    not isinstance(minutes, (int, float)) or minutes <= 0
                    for minutes in duration
                ):
                    fail(f"{rid}: duration_options_minutes must contain positive numbers")

            source_notes = record.get("source_notes")
            if source_notes is not None and (
                not isinstance(source_notes, list)
                or any(not isinstance(url, str) or urlparse(url).scheme != "https" or not urlparse(url).netloc for url in source_notes)
            ):
                fail(f"{rid}: source_notes must be an array of HTTPS URLs")
            if record["review_status"] in {"verified", "clinically_reviewed"}:
                if not source_notes:
                    fail(f"{rid}: reviewed records require source_notes")
                if not record.get("last_verified_at"):
                    fail(f"{rid}: reviewed records require last_verified_at")

            all_records.append(record)

    ids = [record["id"] for record in all_records]
    if len(ids) != len(set(ids)):
        duplicates = sorted({rid for rid in ids if ids.count(rid) > 1})
        fail(f"duplicate resource IDs across catalogs: {duplicates}")

    gaps = {
        record["id"]: [field for field in TRACKED_METADATA if not nonempty(record.get(field))]
        for record in all_records
    }
    gaps = {rid: fields for rid, fields in gaps.items() if fields}
    print(f"Validated {len(all_records)} records across {len(CATALOG_FILES)} catalogs.")
    print(f"Checked unique IDs, HTTPS provenance, review status, shelf/need vocabulary, and duration metadata.")
    if gaps:
        gap_count = sum(len(fields) for fields in gaps.values())
        print(f"Metadata quality report: {len(gaps)} records have {gap_count} tracked field gap(s).")
        for rid, fields in gaps.items():
            print(f"  {rid}: missing or unknown {', '.join(fields)}")
        print("Gaps are reported, not silently filled; use explicit 'unknown' notes when a source was checked but does not state a value.")
    else:
        print("Metadata quality report: all tracked metadata fields are present.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
