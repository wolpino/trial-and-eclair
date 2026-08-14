from __future__ import annotations

import shutil
import subprocess
from collections.abc import Sequence
from decimal import Decimal
from pathlib import Path

from development.services import IngredientLineCopy, RecipeCopyPayload

from .models import SourceDocument

SCAN_DRAFT_NOTE = (
    "Imported from a scan. Ingredients and steps still need to be added."
)
SCAN_REVIEW_NOTE = "Imported from a scan. Review extracted ingredients and steps."
MAX_TEXT_BYTES = 100_000
OCR_TIMEOUT_SECONDS = 30

_INGREDIENT_HEADERS = frozenset(
    {
        "ingredient",
        "ingredients",
        "you will need",
        "what you need",
    }
)
_STEP_HEADERS = frozenset(
    {
        "direction",
        "directions",
        "instruction",
        "instructions",
        "method",
        "steps",
        "preparation",
        "to make",
        "make it",
    }
)
_IMAGE_SUFFIXES = frozenset(
    {".jpg", ".jpeg", ".png", ".webp", ".gif", ".tif", ".tiff", ".bmp"}
)


def extract_document_text(document: SourceDocument) -> str:
    mime = (document.mime_type or "").lower()
    name = (document.original_filename or "").lower()
    if mime.startswith("text/") or name.endswith(".txt"):
        return _read_text_file(document)
    path = _local_path(document)
    if path is None:
        return ""
    if mime == "application/pdf" or name.endswith(".pdf"):
        return _run_extractor(["pdftotext", "-layout", str(path), "-"])
    if mime.startswith("image/") or Path(name).suffix in _IMAGE_SUFFIXES:
        return _run_extractor(["tesseract", str(path), "stdout", "--psm", "6"])
    return ""


def parse_recipe_text(text: str, *, fallback_title: str) -> RecipeCopyPayload:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    title = fallback_title[:255] or "Scanned recipe"
    if not lines:
        return _empty_payload(title)
    body_start = 0
    if _header_kind(lines[0]) is None:
        title = lines[0][:255]
        body_start = 1
    return _payload_from_body(lines[body_start:], title=title)


def _empty_payload(title: str) -> RecipeCopyPayload:
    return RecipeCopyPayload(
        title=title,
        description=SCAN_DRAFT_NOTE,
        version_notes=SCAN_DRAFT_NOTE,
    )


def _payload_from_body(lines: list[str], *, title: str) -> RecipeCopyPayload:
    ingredients: list[str] = []
    steps: list[str] = []
    preamble: list[str] = []
    mode = "preamble"
    for line in lines:
        kind = _header_kind(line)
        if kind is not None:
            mode = kind
            continue
        if mode == "ingredients":
            ingredients.append(line)
        elif mode == "steps":
            steps.append(line)
        else:
            preamble.append(line)
    has_structure = bool(ingredients or steps)
    description = "\n".join(preamble)
    if not has_structure and not description:
        description = SCAN_DRAFT_NOTE
    notes = SCAN_REVIEW_NOTE if has_structure else SCAN_DRAFT_NOTE
    return RecipeCopyPayload(
        title=title,
        description=description,
        version_notes=notes,
        ingredient_lines=_ingredient_copies(ingredients),
        step_bodies=steps,
    )


def _ingredient_copies(names: Sequence[str]) -> list[IngredientLineCopy]:
    return [
        IngredientLineCopy(name=name[:255], quantity=Decimal("1"), sort_order=index)
        for index, name in enumerate(names)
    ]


def _header_kind(line: str) -> str | None:
    key = line.strip().rstrip(":").lower()
    if key in _INGREDIENT_HEADERS:
        return "ingredients"
    if key in _STEP_HEADERS:
        return "steps"
    return None


def _read_text_file(document: SourceDocument) -> str:
    with document.file.open("rb") as handle:
        raw = handle.read(MAX_TEXT_BYTES + 1)
    return raw[:MAX_TEXT_BYTES].decode("utf-8", errors="replace").strip()


def _local_path(document: SourceDocument) -> Path | None:
    try:
        return Path(document.file.path)
    except (NotImplementedError, ValueError):
        return None


def _run_extractor(argv: Sequence[str]) -> str:
    binary = shutil.which(argv[0])
    if binary is None:
        return ""
    command = [binary, *argv[1:]]
    try:
        completed = subprocess.run(
            command,
            capture_output=True,
            timeout=OCR_TIMEOUT_SECONDS,
            check=False,
        )
    except (OSError, subprocess.TimeoutExpired):
        return ""
    if completed.returncode != 0:
        return ""
    return completed.stdout.decode("utf-8", errors="replace").strip()
