from __future__ import annotations

import ipaddress
import json
import re
import socket
import urllib.request
from decimal import Decimal
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse, urlunparse
from urllib.robotparser import RobotFileParser

from django.db import transaction
from django.utils import timezone

from development.models import ForkType
from development.services import (
    IngredientLineCopy,
    RecipeCopyPayload,
    copy_payload_to_box,
    copy_payload_to_lab,
)

from .models import SourceDocument, UrlRecipeImport
from .scan import extract_document_text, parse_recipe_text

FETCH_TIMEOUT_SECONDS = 8
ROBOTS_TIMEOUT_SECONDS = 3
MAX_FETCH_BYTES = 1_048_576
USER_AGENT = "TrialAndEclairBot/1.0"
_ISO_DURATION = re.compile(
    r"^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$"
)


class UnsafeURLError(ValueError):
    pass


class FetchError(Exception):
    pass


class RobotsDisallowedError(Exception):
    pass


class SafeRedirectHandler(urllib.request.HTTPRedirectHandler):
    max_redirections = 5

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        validate_public_http_url(newurl)
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def _urlopen(request: urllib.request.Request, timeout: float):
    opener = urllib.request.build_opener(SafeRedirectHandler())
    return opener.open(request, timeout=timeout)


def _ip_is_blocked(raw: str) -> bool:
    ip = ipaddress.ip_address(raw)
    if isinstance(ip, ipaddress.IPv6Address) and ip.ipv4_mapped is not None:
        ip = ip.ipv4_mapped
    return bool(
        ip.is_private
        or ip.is_loopback
        or ip.is_link_local
        or ip.is_multicast
        or ip.is_reserved
        or ip.is_unspecified
    )


def _assert_host_public(host: str, port: int) -> None:
    try:
        as_ip = ipaddress.ip_address(host)
    except ValueError:
        as_ip = None
    if as_ip is not None:
        if _ip_is_blocked(str(as_ip)):
            raise UnsafeURLError("URL host is not allowed.")
        return
    try:
        infos = socket.getaddrinfo(host, port, proto=socket.IPPROTO_TCP)
    except socket.gaierror as exc:
        raise UnsafeURLError("Could not resolve host.") from exc
    if not infos:
        raise UnsafeURLError("Could not resolve host.")
    for info in infos:
        if _ip_is_blocked(info[4][0]):
            raise UnsafeURLError("URL host is not allowed.")


def validate_public_http_url(url: str) -> str:
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        raise UnsafeURLError("Only http and https URLs are allowed.")
    if parsed.username or parsed.password:
        raise UnsafeURLError("URLs with credentials are not allowed.")
    host = parsed.hostname
    if not host:
        raise UnsafeURLError("URL must include a host.")
    default_port = 443 if parsed.scheme == "https" else 80
    _assert_host_public(host, parsed.port or default_port)
    return url


def normalize_url(url: str) -> str:
    parsed = urlparse(url.strip())
    scheme = parsed.scheme.lower()
    host = (parsed.hostname or "").lower()
    try:
        ip = ipaddress.ip_address(host)
        netloc = f"[{host}]" if isinstance(ip, ipaddress.IPv6Address) else host
    except ValueError:
        netloc = host
    port = parsed.port
    if port and not (
        (scheme == "http" and port == 80) or (scheme == "https" and port == 443)
    ):
        netloc = f"{netloc}:{port}"
    path = parsed.path.rstrip("/")
    return urlunparse((scheme, netloc, path, "", parsed.query, ""))


def fetch_bytes(url: str, *, timeout: float = FETCH_TIMEOUT_SECONDS) -> bytes:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": USER_AGENT},
        method="GET",
    )
    try:
        with _urlopen(request, timeout=timeout) as response:
            validate_public_http_url(response.geturl())
            data = response.read(MAX_FETCH_BYTES + 1)
    except TimeoutError as exc:
        raise FetchError("Fetch timed out.") from exc
    except socket.timeout as exc:
        raise FetchError("Fetch timed out.") from exc
    except HTTPError as exc:
        raise FetchError(f"Fetch failed with HTTP {exc.code}.") from exc
    except URLError as exc:
        raise FetchError("Could not fetch URL.") from exc
    if len(data) > MAX_FETCH_BYTES:
        raise FetchError("Response too large.")
    return data


def robots_allows(url: str) -> bool:
    parsed = urlparse(url)
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    try:
        validate_public_http_url(robots_url)
        raw = fetch_bytes(robots_url, timeout=ROBOTS_TIMEOUT_SECONDS)
    except (UnsafeURLError, FetchError, OSError):
        return True
    parser = RobotFileParser()
    parser.parse(raw.decode("utf-8", errors="replace").splitlines())
    return parser.can_fetch(USER_AGENT, url)


class _JsonLdCollector(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.blocks: list[str] = []
        self._capture = False
        self._chunks: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag != "script":
            return
        script_type = (dict(attrs).get("type") or "").lower()
        self._capture = "ld+json" in script_type
        self._chunks = []

    def handle_data(self, data: str) -> None:
        if self._capture:
            self._chunks.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "script" and self._capture:
            self.blocks.append("".join(self._chunks))
            self._capture = False


def _clean_jsonld(text: str) -> str:
    cleaned = text.strip()
    cleaned = re.sub(r"^<!--(.*)-->$", r"\1", cleaned, flags=re.DOTALL).strip()
    cleaned = cleaned.replace("//<![CDATA[", "").replace("//]]>", "")
    return cleaned.replace("<![CDATA[", "").replace("]]>", "").strip()


def _is_recipe_type(value: object) -> bool:
    if isinstance(value, list):
        return any(_is_recipe_type(item) for item in value)
    if not isinstance(value, str):
        return False
    return value.rsplit("/", 1)[-1] == "Recipe"


def find_jsonld_recipe(data: object) -> dict | None:
    if isinstance(data, dict):
        if _is_recipe_type(data.get("@type")):
            return data
        graph = data.get("@graph")
        if graph is not None:
            found = find_jsonld_recipe(graph)
            if found is not None:
                return found
        for value in data.values():
            found = find_jsonld_recipe(value)
            if found is not None:
                return found
    if isinstance(data, list):
        for item in data:
            found = find_jsonld_recipe(item)
            if found is not None:
                return found
    return None


def parse_jsonld_recipe(html: str) -> dict:
    collector = _JsonLdCollector()
    collector.feed(html)
    collector.close()
    for block in collector.blocks:
        try:
            data = json.loads(_clean_jsonld(block))
        except json.JSONDecodeError:
            continue
        recipe = find_jsonld_recipe(data)
        if recipe is not None:
            return recipe
    return {}


def extract_author(value: object) -> str:
    if isinstance(value, str):
        return value[:255]
    if isinstance(value, dict):
        return str(value.get("name") or "")[:255]
    if isinstance(value, list) and value:
        return extract_author(value[0])
    return ""


def parse_duration_minutes(value: object) -> int | None:
    if value is None or value == "":
        return None
    if isinstance(value, (int, float)):
        return int(value)
    match = _ISO_DURATION.fullmatch(str(value).strip().upper())
    if match is None:
        return None
    days, hours, minutes, seconds = match.groups()
    total = int(days or 0) * 1440 + int(hours or 0) * 60 + int(minutes or 0)
    if seconds:
        total += int(float(seconds) // 60)
    return total


def _as_list(value: object) -> list:
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value]


def extract_instruction_bodies(value: object) -> list[str]:
    bodies: list[str] = []
    for item in _as_list(value):
        if isinstance(item, str):
            if item.strip():
                bodies.append(item.strip())
            continue
        if not isinstance(item, dict):
            continue
        if _is_type(item.get("@type"), "HowToSection"):
            bodies.extend(extract_instruction_bodies(item.get("itemListElement")))
            continue
        text = str(item.get("text") or item.get("name") or "").strip()
        if text:
            bodies.append(text)
    return bodies


def _is_type(value: object, expected: str) -> bool:
    if isinstance(value, list):
        return any(_is_type(item, expected) for item in value)
    if not isinstance(value, str):
        return False
    return value.rsplit("/", 1)[-1] == expected


def payload_from_parsed_data(
    parsed_data: dict,
    *,
    fallback_title: str = "",
    version_notes: str = "",
) -> RecipeCopyPayload:
    title = str(parsed_data.get("name") or fallback_title or "Imported recipe").strip()
    ingredients = [
        IngredientLineCopy(
            name=str(raw).strip()[:255] or "ingredient",
            quantity=Decimal("1"),
            sort_order=index,
        )
        for index, raw in enumerate(_as_list(parsed_data.get("recipeIngredient")))
        if str(raw).strip()
    ]
    return RecipeCopyPayload(
        title=title[:255] or "Imported recipe",
        description=str(parsed_data.get("description") or ""),
        prep_minutes=parse_duration_minutes(parsed_data.get("prepTime")),
        cook_minutes=parse_duration_minutes(parsed_data.get("cookTime")),
        version_notes=version_notes,
        ingredient_lines=ingredients,
        step_bodies=extract_instruction_bodies(parsed_data.get("recipeInstructions")),
    )


@transaction.atomic
def import_from_url(url: str) -> UrlRecipeImport:
    validate_public_http_url(url)
    normalized = normalize_url(url)
    validate_public_http_url(normalized)
    existing = UrlRecipeImport.objects.filter(normalized_url=normalized).first()
    if existing is not None and existing.parsed_data and not existing.fetch_error:
        return existing
    if not robots_allows(normalized):
        raise RobotsDisallowedError("This URL is disallowed by robots.txt.")
    html = fetch_bytes(normalized).decode("utf-8", errors="replace")
    parsed = parse_jsonld_recipe(html)
    parsed_host = urlparse(normalized).hostname or ""
    record = existing or UrlRecipeImport(normalized_url=normalized)
    record.source_title = str(parsed.get("name") or "")[:255]
    record.source_author = extract_author(parsed.get("author"))
    record.source_site = parsed_host[:255]
    record.parsed_data = parsed
    record.last_fetched_at = timezone.now()
    record.fetch_error = ""
    record.save()
    return record


def save_url_import(user, url_import: UrlRecipeImport, *, fork_type: str):
    notes = (
        f"Imported from {url_import.normalized_url}. "
        "Not published; edit this copy before sharing."
    )
    payload = payload_from_parsed_data(
        url_import.parsed_data or {},
        fallback_title=url_import.source_title,
        version_notes=notes,
    )
    if fork_type == ForkType.SAVE_TO_BOX:
        return copy_payload_to_box(user, payload, url_import=url_import)
    return copy_payload_to_lab(user, payload)


def apply_extracted_text(document: SourceDocument, text: str) -> SourceDocument:
    document.extracted_text = text
    document.save(update_fields=["extracted_text", "updated_at"])
    return document


def _title_from_filename(filename: str) -> str:
    stem = Path(filename).stem.strip()
    return stem[:255] or "Scanned recipe"


@transaction.atomic
def create_scan_import(user, uploaded_file, *, destination: str = "box"):
    filename = getattr(uploaded_file, "name", "") or "scan"
    mime_type = getattr(uploaded_file, "content_type", "") or ""
    document = SourceDocument.objects.create(
        user=user,
        file=uploaded_file,
        original_filename=filename[:255],
        mime_type=mime_type[:100],
        extracted_text="",
    )
    text = extract_document_text(document)
    apply_extracted_text(document, text)
    payload = parse_recipe_text(
        text,
        fallback_title=_title_from_filename(filename),
    )
    if destination == "lab":
        return document, copy_payload_to_lab(user, payload)
    recipe = copy_payload_to_box(user, payload, source_document=document)
    return document, recipe
