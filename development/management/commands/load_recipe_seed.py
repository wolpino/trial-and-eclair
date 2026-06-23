"""
Load seed/data/*.json into the database for local development.
"""

import json
from datetime import timedelta
from decimal import Decimal, InvalidOperation
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from accounts.models import SubscriptionStatus, UserRole
from catalog.base import StandardUnit
from catalog.models import Ingredient
from development.models import DevelopmentRecipe, Idea, RecipeStep, VersionIngredientLine
from development.services import create_development_recipe
from library.models import Reference

SEED_DIR = Path(settings.BASE_DIR) / "seed" / "data"
User = get_user_model()
VALID_UNITS = {choice.value for choice in StandardUnit}


class Command(BaseCommand):
    help = "Load seed/data ideas, references, and recipes into the database for local dev"

    def add_arguments(self, parser) -> None:
        parser.add_argument(
            "--username",
            default="dev",
            help="User to own seeded records (created if missing)",
        )
        parser.add_argument(
            "--password",
            default="devpass123",
            help="Password when creating the seed user",
        )
        parser.add_argument(
            "--force",
            action="store_true",
            help="Replace existing seeded ideas, references, and recipes for this user",
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

    def handle(self, *args, **options) -> None:
        username: str = options["username"]
        password: str = options["password"]
        force: bool = options["force"]
        ideas_only: bool = options["ideas_only"]
        recipes_only: bool = options["recipes_only"]

        if ideas_only and recipes_only:
            raise CommandError("Use at most one of --ideas-only and --recipes-only.")

        user = self._get_or_create_user(username, password)
        ideas_created = 0
        references_created = 0
        recipes_created = 0

        if recipes_only:
            recipes_created = self._load_recipes(user, force=force)
        elif ideas_only:
            ideas_created = self._load_ideas(user, force=force)
        else:
            ideas_created = self._load_ideas(user, force=force)
            references_created = self._load_references(user, force=force)
            recipes_created = self._load_recipes(user, force=force)

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed loaded for {username}: "
                f"{ideas_created} ideas, {references_created} references, "
                f"{recipes_created} recipes"
            )
        )

    def _get_or_create_user(self, username: str, password: str) -> User:
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "role": UserRole.DEVELOPER,
                "subscription_status": SubscriptionStatus.TRIAL,
                "trial_ends_at": timezone.now() + timedelta(days=14),
            },
        )
        if created:
            user.set_password(password)
            user.save(update_fields=["password"])
            self.stdout.write(f"Created developer user {username!r} (password: {password!r})")
            return user

        updated_fields: list[str] = []
        if user.role != UserRole.DEVELOPER:
            user.role = UserRole.DEVELOPER
            updated_fields.append("role")
        if user.subscription_status not in (
            SubscriptionStatus.TRIAL,
            SubscriptionStatus.ACTIVE,
        ):
            user.subscription_status = SubscriptionStatus.TRIAL
            user.trial_ends_at = timezone.now() + timedelta(days=14)
            updated_fields.extend(["subscription_status", "trial_ends_at"])
        if updated_fields:
            user.save(update_fields=updated_fields)
            self.stdout.write(f"Updated {username!r} to developer with trial access")
        return user

    def _load_ideas(self, user: User, *, force: bool) -> int:
        path = SEED_DIR / "ideas_seed.json"
        if not path.exists():
            raise CommandError(f"Missing {path}. Run export_recipe_seed first.")

        rows = json.loads(path.read_text(encoding="utf-8"))
        if force:
            deleted, _ = Idea.objects.filter(user=user).delete()
            if deleted:
                self.stdout.write(f"Cleared {deleted} existing ideas for {user.username}")

        existing_titles = set(
            Idea.objects.filter(user=user).values_list("title", flat=True)
        )
        to_create = [
            Idea(
                user=user,
                title=row["title"],
                category_tag=row.get("category_tag", ""),
            )
            for row in rows
            if row.get("title") and row["title"] not in existing_titles
        ]
        Idea.objects.bulk_create(to_create, batch_size=500)
        return len(to_create)

    def _load_references(self, user: User, *, force: bool) -> int:
        path = SEED_DIR / "references_seed.json"
        if not path.exists():
            raise CommandError(f"Missing {path}. Run export_recipe_seed first.")

        rows = json.loads(path.read_text(encoding="utf-8"))
        if force:
            deleted, _ = Reference.objects.filter(user=user).delete()
            if deleted:
                self.stdout.write(
                    f"Cleared {deleted} existing references for {user.username}"
                )

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

    def _load_recipes(self, user: User, *, force: bool) -> int:
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
    def _create_recipe_from_row(self, user: User, row: dict) -> DevelopmentRecipe:
        title = row["title"].strip()
        recipe = create_development_recipe(user, title=title)
        version = recipe.current_version
        assert version is not None

        notes_parts: list[str] = []
        if row.get("source_url"):
            notes_parts.append(str(row["source_url"]))
        if row.get("source_attribution"):
            notes_parts.append(str(row["source_attribution"]))

        version.description = row.get("description", "")
        version.version_notes = "\n".join(notes_parts)
        version.story = row.get("story", "")
        version.prep_minutes = row.get("prep_minutes")
        version.cook_minutes = row.get("cook_minutes")
        version.save()

        for sort_order, line in enumerate(row.get("ingredients") or []):
            name = (line.get("name") or "").strip()
            if not name:
                continue
            ingredient, _ = Ingredient.objects.get_or_create(name=name)
            quantity = self._parse_quantity(line.get("quantity", "0"))
            unit, custom_unit = self._resolve_units(line)
            VersionIngredientLine.objects.create(
                version=version,
                ingredient=ingredient,
                quantity=quantity,
                unit=unit,
                custom_unit=custom_unit,
                prep_note=line.get("prep_note", ""),
                sort_order=sort_order,
            )

        for order, body in enumerate(row.get("steps") or [], start=1):
            text = (body or "").strip()
            if text:
                RecipeStep.objects.create(version=version, order=order, body=text)

        return recipe

    @staticmethod
    def _parse_quantity(raw: str | int | float) -> Decimal:
        try:
            return Decimal(str(raw))
        except (InvalidOperation, TypeError) as exc:
            raise CommandError(f"Invalid quantity {raw!r}") from exc

    @staticmethod
    def _resolve_units(line: dict) -> tuple[str, str]:
        unit = (line.get("unit") or "").strip().lower()
        custom_unit = (line.get("custom_unit") or "").strip()
        if unit in VALID_UNITS:
            return unit, ""
        if unit:
            return "", unit
        return "", custom_unit
