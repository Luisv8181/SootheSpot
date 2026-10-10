#!/usr/bin/env python3
"""Validate SootheSpot's external resource and bibliographic book catalogs.

Unknown metadata is reported rather than guessed. Books use bibliographic fields
such as page_count; page counts are never interpreted as media duration.
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
    "id", "name", "publisher", "resource_type", "official_url",
    "description", "tags", "access", "review_status", "last_verified_at",
}
STATUSES = {"unreviewed", "screened", "clinically_reviewed", "verified", "deprecated"}
SHELVES = {
    "read", "listen", "practice", "watch", "sleep-rest",
    "understand-yourself", "reach-out",
}
NEEDS = {
    "calm", "sleep", "understand", "practice", "listen", "watch", "read",
    "support", "stress", "anxiety", "mood", "trauma", "self-compassion",
    "grief", "substance-use",
}
TRACKED_METADATA = (
    "languages", "access", "accessibility", "regions", "limitations",
    "last_verified_at", "source_notes", "shelf", "needs",
)


def fail(message: str) -> None:
    print(f"ERROR: {message}")
    raise SystemExit(1)


def nonempty(value: object) -> bool:
    return value is not None and value != "" and value != []


def is_https_url(value: object) -> bool:
    if not isinstance(value, str):
        return False
    parsed = urlparse(value)
    return parsed.scheme == "https" and bool(parsed.netloc)


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
    all_records: list[dict] = []
    catalogs: dict[str, list[dict]] = {}
    for path in CATALOG_FILES:
        records = load_catalog(path)
        catalogs[path.name] = records
        for index, record in enumerate(records):
            missing = REQUIRED - record.keys()
            rid = record.get("id", f"{path.name}:{index}")
            if missing:
                fail(f"{rid} missing required fields: {sorted(missing)}")
            if not isinstance(record["id"], str) or not record["id"].strip():
                fail(f"{rid}: id must be a non-empty string")
            if not is_https_url(record["official_url"]):
                fail(f"{rid}: official_url must be an HTTPS URL")
            if record["review_status"] not in STATUSES:
                fail(f"{rid}: invalid review_status")
            if not isinstance(record["tags"], list) or not record["tags"]:
                fail(f"{rid}: tags must be a non-empty array")
            if not isinstance(record["access"], list):
                fail(f"{rid}: access must be an array")

            primary_shelf = record.get("shelf")
            if primary_shelf is not None and primary_shelf not in SHELVES:
                fail(f"{rid}: invalid primary shelf {primary_shelf!r}")
            secondary_shelves = record.get("shelves", [])
            if not isinstance(secondary_shelves, list):
                fail(f"{rid}: shelves must be an array when provided")
            if any(shelf not in SHELVES for shelf in secondary_shelves):
                invalid = sorted({s for s in secondary_shelves if s not in SHELVES})
                fail(f"{rid}: invalid secondary shelves {invalid}")
            if primary_shelf in secondary_shelves:
                fail(f"{rid}: primary shelf must not be repeated in secondary shelves")
            if len(secondary_shelves) != len(set(secondary_shelves)):
                fail(f"{rid}: secondary shelves must not contain duplicates")

            needs = record.get("needs")
            if needs is not None:
                if not isinstance(needs, list):
                    fail(f"{rid}: needs must be an array when provided")
                invalid_needs = sorted({n for n in needs if n not in NEEDS})
                if invalid_needs:
                    fail(f"{rid}: invalid needs {invalid_needs}")
                if len(needs) != len(set(needs)):
                    fail(f"{rid}: needs must not contain duplicates")

            duration = record.get("duration_options_minutes")
            if duration is not None and (
                not isinstance(duration, list)
                or any(
                    isinstance(minutes, bool)
                    or not isinstance(minutes, (int, float))
                    or minutes <= 0
                    for minutes in duration
                )
            ):
                fail(f"{rid}: duration_options_minutes must contain positive numbers")
            if record.get("resource_type") == "book" and duration is not None:
                fail(f"{rid}: book records must not use media duration_options_minutes")
            page_count = record.get("page_count")
            if page_count is not None and (
                isinstance(page_count, bool)
                or not isinstance(page_count, int)
                or page_count <= 0
            ):
                fail(f"{rid}: page_count must be a positive integer")

            sources = record.get("source_notes")
            if sources is not None and (
                not isinstance(sources, list)
                or any(not is_https_url(source) for source in sources)
            ):
                fail(f"{rid}: source_notes must be an array of HTTPS URLs")
            if record["review_status"] in {"verified", "clinically_reviewed"}:
                if not sources:
                    fail(f"{rid}: reviewed records require source_notes")
                if not record.get("last_verified_at"):
                    fail(f"{rid}: reviewed records require last_verified_at")

            if record.get("resource_type") == "book":
                if not isinstance(record.get("authors"), list) or not record["authors"]:
                    fail(f"{rid}: book records require an authors array")
                if (
                    isinstance(page_count, bool)
                    or not isinstance(page_count, int)
                    or page_count <= 0
                ):
                    fail(f"{rid}: book records require a positive integer page_count")
                if not isinstance(record.get("isbn"), str) or not record["isbn"].strip():
                    fail(f"{rid}: book records require ISBN metadata")
            all_records.append(record)

    ids = [record["id"] for record in all_records]
    duplicates = sorted({rid for rid in ids if ids.count(rid) > 1})
    if duplicates:
        fail(f"duplicate resource IDs across catalogs: {duplicates}")

    gaps = {
        record["id"]: [
            field for field in TRACKED_METADATA
            if not nonempty(record.get(field))
        ]
        for record in all_records
    }
    gaps = {rid: fields for rid, fields in gaps.items() if fields}
    print(
        f"Validated {len(all_records)} records across {len(CATALOG_FILES)} catalogs "
        f"({', '.join(f'{name}: {len(records)}' for name, records in catalogs.items())})."
    )
    print(
        "Checked cross-catalog IDs, HTTPS provenance, review status, primary/secondary "
        "shelf consistency, need vocabulary, duration values, and book-specific fields."
    )
    if gaps:
        gap_count = sum(len(fields) for fields in gaps.values())
        print(f"Metadata quality report: {len(gaps)} records have {gap_count} tracked field gap(s).")
        for rid, fields in gaps.items():
            print(f"  {rid}: missing or unknown {', '.join(fields)}")
        print("Gaps are reported, not silently filled; unknown facts must remain unknown.")
    else:
        print("Metadata quality report: all tracked metadata fields are present.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
