"""
Fill the two staging demo accounts from seed/data, with passwords from env vars.

Safe on a shared URL: no password is in the repo or the output, and an
account that already has content is left alone so testers' changes survive
a restart. To reset, delete the demo users in /admin/ and redeploy.
"""

from __future__ import annotations

import os
from typing import Any

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import transaction

from accounts.models import SubscriptionStatus, UserRole
from collection.models import CollectionRecipe
from development.management.commands.load_recipe_seed import Command as SeedCommand
from development.management.commands.load_recipe_seed import User
from development.models import Cookbook, DevelopmentRecipe, Idea
from library.models import Reference


class Command(SeedCommand):
    help = "Create and fill the staging demo accounts (DEMO_* env vars) if missing or empty"

    def add_arguments(self, parser) -> None:
        pass

    def handle(self, *args: object, **options: Any) -> None:
        accounts = (
            ("DEMO_DEVELOPER", "demo-developer", UserRole.DEVELOPER),
            ("DEMO_COOK", "demo-cook", UserRole.HOME_COOK),
        )
        logins: list[tuple[str, str, str]] = []
        problems: list[str] = []
        for prefix, default_username, role in accounts:
            username = os.environ.get(f"{prefix}_USERNAME", "").strip() or default_username
            password = os.environ.get(f"{prefix}_PASSWORD", "")
            if not password:
                problems.append(f"{prefix}_PASSWORD is not set")
                continue
            try:
                validate_password(password, User(username=username))
            except ValidationError:
                problems.append(f"{prefix}_PASSWORD does not pass the password validators")
                continue
            logins.append((username, password, role))

        if problems:
            for problem in problems:
                self.stdout.write(f"Demo data skipped: {problem}.")
            return

        data = self._walkthrough_data()
        for username, password, role in logins:
            self._fill_account(username, password, role, data)

    @transaction.atomic
    def _fill_account(
        self, username: str, password: str, role: str, data: dict[str, Any]
    ) -> None:
        user, created = User.objects.get_or_create(username=username, defaults={"role": role})
        if created:
            user.set_password(password)
        elif self._has_content(user):
            self.stdout.write(f"Demo account {username!r} already has content; left as is.")
            return
        user.role = role
        if role == UserRole.DEVELOPER:
            user.subscription_status = SubscriptionStatus.ACTIVE
        user.save()

        if role == UserRole.DEVELOPER:
            self._fill_developer(user, data)
        else:
            self._load_references(user, force=False)
            self._load_recipe_box(user, data.get("recipe_box") or [])
        self.stdout.write(self.style.SUCCESS(f"Demo account {username!r} filled."))

    def _fill_developer(self, user: Any, data: dict[str, Any]) -> None:
        # Not public: nothing is published, so no /r/ or /c/ pages and no slug clashes.
        lab = {
            key: value
            for key, value in (data.get("lab") or {}).items()
            if key not in ("publish", "unpublish_after_publish")
        }
        cookbooks = [{**row, "status": "draft"} for row in data.get("cookbooks") or []]
        self._load_ideas(user, force=False)
        self._load_references(user, force=False)
        self._load_recipes(user, force=False)
        self._enrich_ideas(user, data.get("idea_enrichment") or [])
        self._shape_lab(user, lab)
        self._load_cookbooks(user, cookbooks)
        self._enrich_references(user, data)

    @staticmethod
    def _has_content(user: Any) -> bool:
        return any(
            model.objects.filter(user=user).exists()
            for model in (Idea, DevelopmentRecipe, Reference, Cookbook, CollectionRecipe)
        )
