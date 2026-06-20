"""
Export recipes folder + Google Sheets into seed/data/*.json for Phase 0.
"""

import json
import re
import subprocess
import urllib.parse
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

RECIPES_DIR = Path(settings.BASE_DIR) / "recipes"
SEED_DIR = Path(settings.BASE_DIR) / "seed" / "data"

SHEETS = {
    "post_ideas": {
        "id": "17dkoA4-Fjlx7uVK8gO0Hru9-lpeeHUk1Va3J5E8KcPg",
        "tabs": [
            "Post ideas",
            "Blogs",
            "Restaurant/Bakery",
            "Cookbooks",
            "Pastry Chefs/Bakers",
            "ReFerence/Search",
        ],
    },
    "wipwip": {
        "id": "1pIg5-E_hG_lG6nrO6qsZEJ3Bqe5JrO8swJs62Hm1nsE",
        "tabs": [
            "WIPWIP",
            "Assorted",
            "Bars",
            "Bon Bon",
            "Breads",
            "Cake/Muffin",
            "Cookies",
            "Shortbread",
            "Crackers",
            "Ice Cream",
            "Junk Remakes",
        ],
    },
}


def fetch_sheet_tab(sheet_id: str, tab_name: str) -> list[list[str]]:
    enc = urllib.parse.quote(tab_name, safe="")
    url = (
        f"https://docs.google.com/spreadsheets/d/{sheet_id}/gviz/tq"
        f"?tqx=out:json&sheet={enc}"
    )
    try:
        result = subprocess.run(
            ["curl", "-sL", url],
            capture_output=True,
            text=True,
            timeout=30,
            check=False,
        )
        match = re.search(r"setResponse\((.*)\);", result.stdout, re.S)
        if not match:
            return []
        data = json.loads(match.group(1))
        rows = []
        for row in data.get("table", {}).get("rows", []):
            cells = [
                "" if c is None else str(c.get("v", "") or "")
                for c in (row.get("c") or [])
            ]
            if any(c.strip() for c in cells):
                rows.append(cells)
        return rows
    except (OSError, json.JSONDecodeError):
        return []


def export_text_sources() -> dict:
    sources = {}
    for name in ["Original Notes plus Recipe ideas.txt", "recipedump.md", "initialbraindump.md"]:
        path = RECIPES_DIR / name
        if path.exists():
            sources[name] = path.read_text(encoding="utf-8")
    return sources


def export_docx_inventory() -> list[dict]:
    docx_dir = RECIPES_DIR / "Recipes"
    if not docx_dir.exists():
        return []
    return [
        {"filename": p.name, "path": str(p.relative_to(settings.BASE_DIR))}
        for p in sorted(docx_dir.glob("*.docx"))
    ]


def classify_ideas_from_wipwip(wipwip_data: dict) -> list[dict]:
    ideas = []
    for tab, rows in wipwip_data.items():
        for row in rows:
            for cell in row:
                cell = cell.strip()
                if cell and cell not in ("MAKE",) and len(cell) > 2:
                    ideas.append(
                        {
                            "title": cell[:255],
                            "category_tag": tab,
                            "source": "wipwip",
                        }
                    )
                    break
    return ideas


def classify_references(post_ideas_data: dict) -> list[dict]:
    refs = []
    type_map = {
        "Blogs": "blog",
        "Cookbooks": "cookbook",
        "Pastry Chefs/Bakers": "chef",
        "ReFerence/Search": "tool",
    }
    for tab, rows in post_ideas_data.items():
        ref_type = type_map.get(tab, "article")
        for row in rows:
            title = (row[0] if row else "").strip()
            if not title or title in ("Category", "Name", "Reference/Learning"):
                continue
            if tab == "Post ideas":
                continue
            refs.append({"title": title[:255], "ref_type": ref_type, "notes": " | ".join(row[1:3]).strip()})
    return refs


class Command(BaseCommand):
    help = "Export recipes folder and Google Sheets to seed/data/*.json"

    def handle(self, *args, **options):
        SEED_DIR.mkdir(parents=True, exist_ok=True)

        self.stdout.write("Exporting local text sources...")
        text_sources = export_text_sources()
        (SEED_DIR / "text_sources.json").write_text(
            json.dumps(text_sources, indent=2), encoding="utf-8"
        )

        self.stdout.write("Exporting docx inventory...")
        docx_inventory = export_docx_inventory()
        (SEED_DIR / "docx_inventory.json").write_text(
            json.dumps(docx_inventory, indent=2), encoding="utf-8"
        )

        for workbook_key, cfg in SHEETS.items():
            self.stdout.write(f"Fetching workbook: {workbook_key}...")
            workbook_data = {}
            for tab in cfg["tabs"]:
                rows = fetch_sheet_tab(cfg["id"], tab)
                workbook_data[tab] = rows
                self.stdout.write(f"  {tab}: {len(rows)} rows")
            (SEED_DIR / f"{workbook_key}.json").write_text(
                json.dumps(workbook_data, indent=2), encoding="utf-8"
            )

        wipwip = json.loads((SEED_DIR / "wipwip.json").read_text(encoding="utf-8"))
        post_ideas = json.loads((SEED_DIR / "post_ideas.json").read_text(encoding="utf-8"))

        ideas = classify_ideas_from_wipwip(wipwip)
        (SEED_DIR / "ideas_seed.json").write_text(
            json.dumps(ideas, indent=2), encoding="utf-8"
        )
        self.stdout.write(f"Classified {len(ideas)} ideas from WIPWIP")

        references = classify_references(post_ideas)
        (SEED_DIR / "references_seed.json").write_text(
            json.dumps(references, indent=2), encoding="utf-8"
        )
        self.stdout.write(f"Classified {len(references)} references")

        manifest = {
            "files": [
                "text_sources.json",
                "docx_inventory.json",
                "post_ideas.json",
                "wipwip.json",
                "ideas_seed.json",
                "references_seed.json",
            ],
            "counts": {
                "ideas": len(ideas),
                "references": len(references),
                "docx_files": len(docx_inventory),
            },
        }
        (SEED_DIR / "manifest.json").write_text(
            json.dumps(manifest, indent=2), encoding="utf-8"
        )

        self.stdout.write(self.style.SUCCESS(f"Seed data written to {SEED_DIR}"))
