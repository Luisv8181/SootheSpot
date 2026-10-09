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
            script_text = VALIDATOR.read_text(encoding="utf-8")
            script_text = script_text.replace(
                'ROOT = pathlib.Path(__file__).resolve().parents[1]',
                f'ROOT = pathlib.Path({str(temp_root)!r})'
            )
            (temp_root / "scripts" / "validate_resource_catalog.py").write_text(script_text, encoding="utf-8")
            return subprocess.run(
                [sys.executable, str(temp_root / "scripts" / "validate_resource_catalog.py")],
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

    def test_accepts_valid_records_and_reports_unknown_metadata(self):
        completed = self.run_validator([self.record()], [])
        self.assertEqual(completed.returncode, 0, completed.stderr + completed.stdout)
        self.assertIn("Validated 1 records across 2 catalogs.", completed.stdout)
        self.assertIn("Metadata quality report:", completed.stdout)

    def test_rejects_duplicate_ids_across_catalogs(self):
        completed = self.run_validator([self.record()], [self.record()])
        self.assertNotEqual(completed.returncode, 0)
        self.assertIn("duplicate resource IDs across catalogs", completed.stdout)

    def test_rejects_unknown_shelf(self):
        completed = self.run_validator([self.record(shelf="comfort-zone")], [])
        self.assertNotEqual(completed.returncode, 0)
        self.assertIn("invalid explicit shelf", completed.stdout)

    def test_rejects_unknown_secondary_shelf(self):
        completed = self.run_validator([self.record(shelves=["imaginary-shelf"])], [])
        self.assertNotEqual(completed.returncode, 0)
        self.assertIn("invalid secondary shelves", completed.stdout)

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


if __name__ == "__main__":
    unittest.main()
