"""
Load seed/data/*.json into the database for local development.
"""

import json
from datetime import timedelta
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from accounts.models import SubscriptionStatus, UserRole
from development.models import Idea
from library.models import Reference

SEED_DIR = Path(settings.BASE_DIR) / "seed" / "data"
User = get_user_model()


class Command(BaseCommand):
    help = "Load seed/data ideas and references into the database for local dev"

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
            help="Replace existing seeded ideas and references for this user",
        )
        parser.add_argument(
            "--ideas-only",
            action="store_true",
            help="Load ideas_seed.json only",
        )

    def handle(self, *args, **options) -> None:
        username: str = options["username"]
        password: str = options["password"]
        force: bool = options["force"]
        ideas_only: bool = options["ideas_only"]

        user = self._get_or_create_user(username, password)
        ideas_created = self._load_ideas(user, force=force)
        references_created = 0
        if not ideas_only:
            references_created = self._load_references(user, force=force)

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed loaded for {username}: "
                f"{ideas_created} ideas, {references_created} references"
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
