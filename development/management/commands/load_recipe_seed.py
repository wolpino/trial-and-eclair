"""
Load seed/data/*.json into the database for local development.
"""

from __future__ import annotations

import json
from datetime import timedelta
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from accounts.models import SubscriptionStatus, UserRole
from catalog.base import StandardUnit
from catalog.models import Ingredient
from collection.models import CollectionIngredientLine, CollectionRecipe
from collection.services import create_box_recipe
from development.models import (
    Cookbook,
    CookbookRecipe,
    DevelopmentRecipe,
    ForkType,
    Idea,
    IdeaStatus,
    JournalEntry,
    RecipeFork,
    RecipeStep,
    RecipeVersion,
    TestSession,
    VersionIngredientLine,
)
from development.services import (
    add_cookbook_entry,
    create_development_recipe,
    fork_to_box,
    fork_to_lab,
    promote_idea,
    publish_cookbook,
    publish_recipe,
    save_new_version,
    unpublish_recipe,
)
from library.models import Reference, ReferenceLink

SEED_DIR = Path(settings.BASE_DIR) / "seed" / "data"
MEDIA_DIR = SEED_DIR / "photos"
User = get_user_model()
VALID_UNITS = {choice.value for choice in StandardUnit}

WALKTHROUGH_USERS = (
    ("dev", "devpass123", UserRole.DEVELOPER),
    ("cook", "cookpass123", UserRole.HOME_COOK),
    ("baker", "bakerpass123", UserRole.DEVELOPER),
)


class Command(BaseCommand):
    help = (
        "Load seed/data ideas, references, recipes, and walkthrough fixtures "
        "so every local persona/screen is clickable"
    )

    def add_arguments(self, parser) -> None:
        parser.add_argument(
            "--username",
            default="dev",
            help="User to own core seeded records (created if missing)",
        )
        parser.add_argument(
            "--password",
            default="devpass123",
            help="Password when creating the seed user",
        )
        parser.add_argument(
            "--force",
            action="store_true",
            help="Replace existing seeded records for walkthrough users",
        )
        parser.add_argument(
            "--ideas-only",
            action="store_true",
            help="Load ideas_seed.json only",
        )
        parser.add_argument(
            "--recipes-only",
            action="store_true",
            help="Load recipes_seed.json only",
        )

    def handle(self, *args: object, **options: Any) -> None:
        username: str = options["username"]
        password: str = options["password"]
        force: bool = options["force"]
        ideas_only: bool = options["ideas_only"]
        recipes_only: bool = options["recipes_only"]

        if ideas_only and recipes_only:
            raise CommandError("Use at most one of --ideas-only and --recipes-only.")

        user = self._ensure_user(username, password, role=UserRole.DEVELOPER)
        ideas_created = 0
        references_created = 0
        recipes_created = 0

        if recipes_only:
            recipes_created = self._load_recipes(user, force=force)
        elif ideas_only:
            ideas_created = self._load_ideas(user, force=force)
        else:
            users = self._ensure_walkthrough_users()
            if force:
                self._wipe_walkthrough_users(users)
            ideas_created = self._load_ideas(user, force=False)
            references_created = self._load_references(user, force=False)
            recipes_created = self._load_recipes(user, force=False)
            self._load_walkthrough(users)

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed loaded for {username}: "
                f"{ideas_created} ideas, {references_created} references, "
                f"{recipes_created} recipes"
            )
        )

    def _ensure_walkthrough_users(self) -> dict[str, Any]:
        users: dict[str, Any] = {}
        for username, password, role in WALKTHROUGH_USERS:
            users[username] = self._ensure_user(username, password, role=role)
        return users

    def _ensure_user(self, username: str, password: str, *, role: str) -> Any:
        defaults: dict[str, Any] = {"role": role}
        if role == UserRole.DEVELOPER:
            defaults["subscription_status"] = SubscriptionStatus.TRIAL
            defaults["trial_ends_at"] = timezone.now() + timedelta(days=14)
        user, created = User.objects.get_or_create(username=username, defaults=defaults)
        if created:
            user.set_password(password)
            user.save(update_fields=["password"])
            self.stdout.write(f"Created {role} user {username!r} (password: {password!r})")
            return user

        updated: list[str] = []
        if user.role != role:
            user.role = role
            updated.append("role")
        if role == UserRole.DEVELOPER and user.subscription_status not in (
            SubscriptionStatus.TRIAL,
            SubscriptionStatus.ACTIVE,
        ):
            user.subscription_status = SubscriptionStatus.TRIAL
            user.trial_ends_at = timezone.now() + timedelta(days=14)
            updated.extend(["subscription_status", "trial_ends_at"])
        if updated:
            user.save(update_fields=updated)
            self.stdout.write(f"Updated {username!r} ({', '.join(updated)})")
        return user

    def _wipe_walkthrough_users(self, users: dict[str, Any]) -> None:
        for key in ("cook", "dev", "baker"):
            user = users[key]
            CookbookRecipe.objects.filter(cookbook__user=user).delete()
            Cookbook.objects.filter(user=user).delete()
            JournalEntry.objects.filter(user=user).delete()
            DevelopmentRecipe.objects.filter(user=user).update(fork_record=None)
            CollectionRecipe.objects.filter(user=user).update(fork_record=None)
            RecipeFork.objects.filter(user=user).delete()
            RecipeFork.objects.filter(forked_from_user=user).delete()
            DevelopmentRecipe.objects.filter(user=user).delete()
            CollectionRecipe.objects.filter(user=user).delete()
            Idea.objects.filter(user=user).delete()
            Reference.objects.filter(user=user).delete()
            self.stdout.write(f"Cleared walkthrough records for {user.username}")

    def _load_ideas(self, user: Any, *, force: bool) -> int:
        path = SEED_DIR / "ideas_seed.json"
        if not path.exists():
            raise CommandError(f"Missing {path}. Run export_recipe_seed first.")

        rows = json.loads(path.read_text(encoding="utf-8"))
        if force:
            deleted, _ = Idea.objects.filter(user=user).delete()
            if deleted:
                self.stdout.write(f"Cleared {deleted} existing ideas for {user.username}")

        existing_titles = set(Idea.objects.filter(user=user).values_list("title", flat=True))
        to_create = [
            Idea(user=user, title=row["title"], category_tag=row.get("category_tag", ""))
            for row in rows
            if row.get("title") and row["title"] not in existing_titles
        ]
        Idea.objects.bulk_create(to_create, batch_size=500)
        return len(to_create)

    def _load_references(self, user: Any, *, force: bool) -> int:
        path = SEED_DIR / "references_seed.json"
        if not path.exists():
            raise CommandError(f"Missing {path}. Run export_recipe_seed first.")

        rows = json.loads(path.read_text(encoding="utf-8"))
        if force:
            deleted, _ = Reference.objects.filter(user=user).delete()
            if deleted:
                self.stdout.write(f"Cleared {deleted} existing references for {user.username}")

        existing_titles = set(
            Reference.objects.filter(user=user).values_list("title", flat=True)
        )
        to_create = [
            Reference(
                user=user,
                title=row["title"],
                ref_type=row["ref_type"],
                notes=row.get("notes", ""),
            )
            for row in rows
            if row.get("title") and row["title"] not in existing_titles
        ]
        Reference.objects.bulk_create(to_create, batch_size=500)
        return len(to_create)

    def _load_recipes(self, user: Any, *, force: bool) -> int:
        path = SEED_DIR / "recipes_seed.json"
        if not path.exists():
            raise CommandError(f"Missing {path}.")

        rows = json.loads(path.read_text(encoding="utf-8"))
        if force:
            deleted, _ = DevelopmentRecipe.objects.filter(user=user).delete()
            if deleted:
                self.stdout.write(
                    f"Cleared {deleted} existing development recipes for {user.username}"
                )

        existing_titles = set(
            DevelopmentRecipe.objects.filter(user=user).values_list("title", flat=True)
        )
        created = 0
        for row in rows:
            title = (row.get("title") or "").strip()
            if not title or title in existing_titles:
                continue
            self._create_recipe_from_row(user, row)
            created += 1
        return created

    @transaction.atomic
    def _create_recipe_from_row(self, user: Any, row: dict[str, Any]) -> DevelopmentRecipe:
        title = row["title"].strip()
        recipe = create_development_recipe(user, title=title)
        version = recipe.current_version
        assert version is not None
        self._fill_version_from_row(version, row)
        return recipe

    def _fill_version_from_row(self, version: RecipeVersion, row: dict[str, Any]) -> None:
        notes_parts: list[str] = []
        if row.get("source_url"):
            notes_parts.append(str(row["source_url"]))
        if row.get("source_attribution"):
            notes_parts.append(str(row["source_attribution"]))

        version.description = row.get("description", "")
        version.version_notes = "\n".join(notes_parts)
        version.story = row.get("story", "")
        version.equipment_notes = row.get("equipment_notes", "")
        version.prep_minutes = row.get("prep_minutes")
        version.cook_minutes = row.get("cook_minutes")
        version.save()
        self._add_ingredient_lines(version, row.get("ingredients") or [])
        self._add_steps(version=version, bodies=row.get("steps") or [])

    def _add_ingredient_lines(self, version: RecipeVersion, lines: list[dict[str, Any]]) -> None:
        for sort_order, line in enumerate(lines):
            name = (line.get("name") or "").strip()
            if not name:
                continue
            ingredient, _ = Ingredient.objects.get_or_create(name=name)
            unit, custom_unit = self._resolve_units(line)
            VersionIngredientLine.objects.create(
                version=version,
                ingredient=ingredient,
                quantity=self._parse_quantity(line.get("quantity", "0")),
                unit=unit,
                custom_unit=custom_unit,
                prep_note=line.get("prep_note", ""),
                sort_order=sort_order,
            )

    def _add_steps(
        self,
        *,
        version: RecipeVersion | None = None,
        collection_recipe: CollectionRecipe | None = None,
        bodies: list[str],
    ) -> None:
        for order, body in enumerate(bodies, start=1):
            text = (body or "").strip()
            if not text:
                continue
            RecipeStep.objects.create(
                version=version,
                collection_recipe=collection_recipe,
                order=order,
                body=text,
            )

    def _load_walkthrough(self, users: dict[str, Any]) -> None:
        path = SEED_DIR / "walkthrough.json"
        if not path.exists():
            raise CommandError(f"Missing {path}.")
        data = json.loads(path.read_text(encoding="utf-8"))
        self._enrich_ideas(users["dev"], data.get("idea_enrichment") or [])
        self._shape_lab(users["dev"], data.get("lab") or {})
        baker_recipe = self._create_recipe_from_row(users["baker"], data["baker_recipe"])
        publish_recipe(
            baker_recipe,
            slug=data["baker_recipe"]["slug"],
            story=data["baker_recipe"].get("story", ""),
        )
        self._load_cookbooks(users["dev"], data.get("cookbooks") or [])
        self._load_recipe_box(users["cook"], data.get("recipe_box") or [])
        self._enrich_references(users["dev"], data)
        self._load_forks(users, data.get("forks") or [])
        self.stdout.write(
            "Walkthrough ready — logins: dev/devpass123, cook/cookpass123, baker/bakerpass123"
        )
        self.stdout.write(
            "Public: /r/raisin-bran-muffins /r/whole-wheat-english-muffins "
            "/r/brown-butter-blondies /c/brunch-notes"
        )

    def _enrich_ideas(self, user: Any, rows: list[dict[str, Any]]) -> None:
        for row in rows:
            idea = Idea.objects.filter(user=user, title=row["title"]).first()
            if idea is None:
                continue
            idea.notes = row.get("notes", "")
            idea.status = row.get("status", IdeaStatus.RESEARCHING)
            idea.is_pinned = bool(row.get("is_pinned", True))
            idea.save(update_fields=["notes", "status", "is_pinned", "updated_at"])
            if row.get("image"):
                self._attach_image(idea.image, row["image"])
            if row.get("promote") and idea.promoted_recipe_id is None:
                promote_idea(idea)

    def _shape_lab(self, user: Any, lab: dict[str, Any]) -> None:
        extra = lab.get("extra_version") or {}
        if extra.get("title"):
            recipe = self._dev_recipe(user, extra["title"])
            save_new_version(recipe, version_notes=extra.get("version_notes", ""))
        for item in lab.get("publish") or []:
            recipe = self._dev_recipe(user, item["title"])
            kwargs: dict[str, Any] = {
                "slug": item.get("slug", ""),
                "story": item.get("story", ""),
            }
            published = publish_recipe(recipe, **kwargs)
            if item.get("hero") and published.published_version is not None:
                self._attach_image(published.published_version.hero_image, item["hero"])
        for title in lab.get("unpublish_after_publish") or []:
            recipe = self._dev_recipe(user, title)
            publish_recipe(recipe)
            unpublish_recipe(recipe)
        for item in lab.get("journal") or []:
            recipe = self._dev_recipe(user, item["recipe"])
            JournalEntry.objects.create(
                user=user,
                recipe=recipe,
                version_snapshot=recipe.current_version,
                title=item.get("title", ""),
                body=item["body"],
            )
        for item in lab.get("test_sessions") or []:
            recipe = self._dev_recipe(user, item["recipe"])
            version = recipe.current_version
            assert version is not None
            TestSession.objects.create(
                version=version,
                notes=item.get("notes", ""),
                outcome=item.get("outcome", ""),
            )

    def _load_cookbooks(self, user: Any, rows: list[dict[str, Any]]) -> None:
        for row in rows:
            cookbook = Cookbook.objects.create(
                user=user,
                title=row["title"],
                description=row.get("description", ""),
            )
            for index, title in enumerate(row.get("entries") or []):
                add_cookbook_entry(
                    cookbook,
                    self._dev_recipe(user, title),
                    sort_order=index,
                )
            if row.get("status") == "published":
                publish_cookbook(cookbook, slug=row.get("slug", ""))

    def _load_recipe_box(self, user: Any, rows: list[dict[str, Any]]) -> None:
        for row in rows:
            recipe = create_box_recipe(
                user,
                title=row["title"],
                description=row.get("description", ""),
                equipment_notes=row.get("equipment_notes", ""),
                prep_minutes=row.get("prep_minutes"),
                cook_minutes=row.get("cook_minutes"),
            )
            self._add_collection_lines(recipe, row.get("ingredients") or [])
            self._add_steps(collection_recipe=recipe, bodies=row.get("steps") or [])

    def _add_collection_lines(
        self,
        recipe: CollectionRecipe,
        lines: list[dict[str, Any]],
    ) -> None:
        for sort_order, line in enumerate(lines):
            name = (line.get("name") or "").strip()
            if not name:
                continue
            ingredient, _ = Ingredient.objects.get_or_create(name=name)
            unit, custom_unit = self._resolve_units(line)
            CollectionIngredientLine.objects.create(
                recipe=recipe,
                ingredient=ingredient,
                quantity=self._parse_quantity(line.get("quantity", "0")),
                unit=unit,
                custom_unit=custom_unit,
                prep_note=line.get("prep_note", ""),
                sort_order=sort_order,
            )

    def _enrich_references(self, user: Any, data: dict[str, Any]) -> None:
        for row in data.get("reference_urls") or []:
            Reference.objects.filter(user=user, title=row["title"]).update(url=row["url"])
        for row in data.get("reference_links") or []:
            reference = Reference.objects.filter(user=user, title=row["reference"]).first()
            idea = Idea.objects.filter(user=user, title=row["idea"]).first()
            if reference is None or idea is None:
                continue
            ReferenceLink.objects.get_or_create(
                reference=reference,
                idea=idea,
                defaults={"note": row.get("note", "")},
            )

    def _load_forks(self, users: dict[str, Any], rows: list[dict[str, Any]]) -> None:
        for row in rows:
            source = self._dev_recipe(users[row["from_user"]], row["from_title"])
            version = source.published_version or source.current_version
            if version is None:
                raise CommandError(f"No version to fork for {row['from_title']!r}")
            dest = users[row["to_user"]]
            if row["fork_type"] == ForkType.SAVE_TO_BOX:
                fork_to_box(dest, version, source.user)
            else:
                recipe = fork_to_lab(
                    dest,
                    version,
                    source.user,
                    title=row.get("rework_title"),
                    story=row.get("story", ""),
                )
                if row.get("publish_slug"):
                    publish_recipe(
                        recipe,
                        slug=row["publish_slug"],
                        story=row.get("story", ""),
                    )

    def _dev_recipe(self, user: Any, title: str) -> DevelopmentRecipe:
        recipe = DevelopmentRecipe.objects.filter(user=user, title=title).first()
        if recipe is None:
            raise CommandError(f"Missing development recipe {title!r} for {user.username}")
        return recipe

    def _attach_image(self, field: Any, filename: str) -> None:
        path = MEDIA_DIR / filename
        if not path.exists():
            raise CommandError(f"Missing seed image {path}")
        field.save(filename, ContentFile(path.read_bytes()), save=True)

    @staticmethod
    def _parse_quantity(raw: str | int | float) -> Decimal:
        try:
            return Decimal(str(raw))
        except (InvalidOperation, TypeError) as exc:
            raise CommandError(f"Invalid quantity {raw!r}") from exc

    @staticmethod
    def _resolve_units(line: dict[str, Any]) -> tuple[str, str]:
        unit = (line.get("unit") or "").strip().lower()
        custom_unit = (line.get("custom_unit") or "").strip()
        if unit in VALID_UNITS:
            return unit, ""
        if unit:
            return "", unit
        return "", custom_unit
