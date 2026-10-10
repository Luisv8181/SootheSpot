import json
import pathlib
import subprocess
import sys
import tempfile
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
VALIDATOR = ROOT / "scripts" / "validate_resource_catalog.py"


class ResourceCatalogValidatorTests(unittest.TestCase):
    def run_validator(self, resources, books):
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_root = pathlib.Path(temp_dir)
            (temp_root / "resources").mkdir()
            (temp_root / "scripts").mkdir()
            (temp_root / "resources" / "resources.json").write_text(json.dumps(resources), encoding="utf-8")
            (temp_root / "resources" / "books.json").write_text(json.dumps(books), encoding="utf-8")
            script_text = VALIDATOR.read_text(encoding="utf-8").replace(
                'ROOT = pathlib.Path(__file__).resolve().parents[1]',
                f'ROOT = pathlib.Path({str(temp_root)!r})',
            )
            script_path = temp_root / "scripts" / "validate_resource_catalog.py"
            script_path.write_text(script_text, encoding="utf-8")
            return subprocess.run(
                [sys.executable, str(script_path)],
                text=True,
                capture_output=True,
                check=False,
            )

    def record(self, **overrides):
        base = {
            "id": "sample",
            "name": "Sample resource",
            "publisher": "Public Health Agency",
            "resource_type": "article",
            "official_url": "https://example.org/resource",
            "description": "A metadata-only sample record.",
            "tags": ["education"],
            "access": ["free"],
            "review_status": "verified",
            "last_verified_at": "2026-10-08",
            "source_notes": ["https://example.org/source"],
            "shelf": "read",
            "needs": ["understand"],
            "duration_options_minutes": [5],
        }
        base.update(overrides)
        return base

    def book(self, **overrides):
        base = self.record(
            id="book-sample",
            name="Sample bibliographic book",
            resource_type="book",
            shelf="read",
            tags=["book", "read"],
        )
        base.pop("duration_options_minutes", None)
        base.update({
            "authors": ["Example Author"],
            "page_count": 200,
            "isbn": "9780000000002",
            "platforms": ["Print"],
        })
        base.update(overrides)
        return base

    def test_accepts_valid_records_and_reports_unknown_metadata(self):
        completed = self.run_validator([self.record()], [])
        self.assertEqual(completed.returncode, 0, completed.stderr + completed.stdout)
        self.assertIn("Validated 1 records across 2 catalogs", completed.stdout)
        self.assertIn("Metadata quality report:", completed.stdout)

    def test_rejects_duplicate_ids_across_catalogs(self):
        completed = self.run_validator([self.record()], [self.record()])
        self.assertNotEqual(completed.returncode, 0)
        self.assertIn("duplicate resource IDs across catalogs", completed.stdout)

    def test_rejects_unknown_primary_shelf(self):
        completed = self.run_validator([self.record(shelf="comfort-zone")], [])
        self.assertNotEqual(completed.returncode, 0)
        self.assertIn("invalid primary shelf", completed.stdout)

    def test_rejects_unknown_secondary_shelf(self):
        completed = self.run_validator([self.record(shelves=["imaginary-shelf"])], [])
        self.assertNotEqual(completed.returncode, 0)
        self.assertIn("invalid secondary shelves", completed.stdout)

    def test_rejects_primary_shelf_repeated_as_secondary(self):
        completed = self.run_validator([self.record(shelves=["read"])], [])
        self.assertNotEqual(completed.returncode, 0)
        self.assertIn("primary shelf must not be repeated", completed.stdout)

    def test_rejects_duplicate_secondary_shelves(self):
        completed = self.run_validator([self.record(shelves=["watch", "watch"])], [])
        self.assertNotEqual(completed.returncode, 0)
        self.assertIn("secondary shelves must not contain duplicates", completed.stdout)

    def test_rejects_unknown_need(self):
        completed = self.run_validator([self.record(needs=["instant-cure"])], [])
        self.assertNotEqual(completed.returncode, 0)
        self.assertIn("invalid needs", completed.stdout)

    def test_rejects_non_https_provenance(self):
        completed = self.run_validator([self.record(source_notes=["http://example.org/source"])], [])
        self.assertNotEqual(completed.returncode, 0)
        self.assertIn("source_notes must be an array of HTTPS URLs", completed.stdout)

    def test_rejects_non_positive_duration(self):
        completed = self.run_validator([self.record(duration_options_minutes=[0])], [])
        self.assertNotEqual(completed.returncode, 0)
        self.assertIn("must contain positive numbers", completed.stdout)

    def test_rejects_boolean_duration(self):
        completed = self.run_validator([self.record(duration_options_minutes=[True])], [])
        self.assertNotEqual(completed.returncode, 0)
        self.assertIn("must contain positive numbers", completed.stdout)

    def test_unknown_duration_remains_valid_and_unfilled(self):
        record = self.record()
        record.pop("duration_options_minutes")
        completed = self.run_validator([record], [])
        self.assertEqual(completed.returncode, 0, completed.stderr + completed.stdout)
        self.assertIn("Validated 1 records", completed.stdout)

    def test_rejects_duration_on_book_record(self):
        completed = self.run_validator([], [self.book(duration_options_minutes=[10])])
        self.assertNotEqual(completed.returncode, 0)
        self.assertIn("must not use media duration_options_minutes", completed.stdout)

    def test_requires_bibliographic_fields_for_books(self):
        completed = self.run_validator([], [self.book(authors=[])])
        self.assertNotEqual(completed.returncode, 0)
        self.assertIn("book records require an authors array", completed.stdout)

    def test_rejects_non_positive_page_count(self):
        completed = self.run_validator([], [self.book(page_count=0)])
        self.assertNotEqual(completed.returncode, 0)
        self.assertIn("positive integer page_count", completed.stdout)

    def test_rejects_invalid_need_type(self):
        completed = self.run_validator([self.record(needs="understand")], [])
        self.assertNotEqual(completed.returncode, 0)
        self.assertIn("needs must be an array", completed.stdout)


if __name__ == "__main__":
    unittest.main()
