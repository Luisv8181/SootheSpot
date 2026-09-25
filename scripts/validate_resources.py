#!/usr/bin/env python3
"""Lightweight CI validation for the SootheSpot resource registry."""

import json
import pathlib
import sys
from urllib.parse import urlparse

ROOT = pathlib.Path(__file__).resolve().parents[1]
RESOURCE_FILE = ROOT / "resources" / "resources.json"

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


def fail(message: str) -> None:
    print(f"ERROR: {message}")
    raise SystemExit(1)


def main() -> int:
    try:
        resources = json.loads(RESOURCE_FILE.read_text(encoding="utf-8"))
    except Exception as exc:
        fail(f"could not parse {RESOURCE_FILE}: {exc}")

    if not isinstance(resources, list):
        fail("resources.json must contain a JSON array")

    ids = set()
    for index, resource in enumerate(resources):
        if not isinstance(resource, dict):
            fail(f"record {index} is not an object")

        missing = REQUIRED - resource.keys()
        if missing:
            fail(f"record {index} missing fields: {sorted(missing)}")

        rid = resource["id"]
        if rid in ids:
            fail(f"duplicate resource id: {rid}")
        ids.add(rid)

        parsed = urlparse(resource["official_url"])
        if parsed.scheme != "https" or not parsed.netloc:
            fail(f"{rid}: official_url must be an HTTPS URL")

        if resource["review_status"] not in STATUSES:
            fail(f"{rid}: invalid review_status")

        if not isinstance(resource["tags"], list) or not resource["tags"]:
            fail(f"{rid}: tags must be a non-empty array")

        if not isinstance(resource["access"], list):
            fail(f"{rid}: access must be an array")

        if resource["review_status"] == "verified":
            if not resource.get("source_notes"):
                fail(f"{rid}: verified records require source_notes")
            if not resource.get("last_verified_at"):
                fail(f"{rid}: verified records require last_verified_at")

    print(f"Validated {len(resources)} resource records.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
