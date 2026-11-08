"""Read-only sample board and notebook for home cooks (issue #86)."""

from __future__ import annotations

import io

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from .models import DevelopmentRecipe, Idea, RecipeVersion, TestSession

User = get_user_model()

IDEAS_URL = "/api/v1/sample-ideas/"
RECIPES_URL = "/api/v1/sample-recipes/"


def _load() -> None:
    call_command("load_sample_kitchen", stdout=io.StringIO())


class LoadSampleKitchenTests(TestCase):
    def test_command_is_idempotent_and_creates_no_users(self) -> None:
        _load()
        counts = (
            Idea.objects.count(),
            DevelopmentRecipe.objects.count(),
            RecipeVersion.objects.count(),
            TestSession.objects.count(),
        )
        _load()

        self.assertEqual(User.objects.count(), 0)
        self.assertGreater(counts[0], 0)
        self.assertGreater(counts[1], 0)
        self.assertEqual(
            counts,
            (
                Idea.objects.count(),
                DevelopmentRecipe.objects.count(),
                RecipeVersion.objects.count(),
                TestSession.objects.count(),
            ),
        )
        self.assertFalse(Idea.objects.filter(is_sample=True, user__isnull=False).exists())
        self.assertFalse(
            DevelopmentRecipe.objects.filter(is_sample=True, user__isnull=False).exists()
        )

    def test_command_leaves_developer_data_alone(self) -> None:
        dev = User.objects.create_user(username="dev", password="strong-pass-1", role="developer")
        own_idea = Idea.objects.create(user=dev, title="Brown butter cornbread")

        _load()
        _load()

        own_idea.refresh_from_db()
        self.assertEqual(own_idea.user, dev)
        self.assertFalse(own_idea.is_sample)
        self.assertEqual(Idea.objects.filter(user=dev).count(), 1)
        self.assertEqual(User.objects.count(), 1)

    def test_sample_recipe_has_versions_and_current_version(self) -> None:
        _load()
        recipe = DevelopmentRecipe.objects.get(is_sample=True, title="Brown Butter Cornbread")

        self.assertEqual(recipe.versions.count(), 2)
        self.assertEqual(recipe.current_version.version_number, 2)
        self.assertTrue(recipe.current_version.ingredient_lines.exists())
        self.assertTrue(recipe.current_version.steps.exists())
        idea = Idea.objects.get(is_sample=True, title="Brown butter cornbread")
        self.assertEqual(idea.promoted_recipe, recipe)


class SampleKitchenAPITests(TestCase):
    def setUp(self) -> None:
        _load()
        self.client = APIClient()
        self.cook = User.objects.create_user(
            username="cook", password="strong-pass-1", role="home_cook"
        )
        self.dev = User.objects.create_user(
            username="dev", password="strong-pass-1", role="developer"
        )
        self.idea = Idea.objects.filter(is_sample=True).first()
        self.recipe = DevelopmentRecipe.objects.get(
            is_sample=True, title="Brown Butter Cornbread"
        )

    def test_home_cook_reads_sample_ideas(self) -> None:
        self.client.force_login(self.cook)

        response = self.client.get(IDEAS_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = {row["title"] for row in response.data}
        self.assertIn("Miso caramel sauce", titles)
        self.assertEqual(len(titles), Idea.objects.filter(is_sample=True).count())

    def test_home_cook_reads_sample_recipes_with_versions_and_bake_log(self) -> None:
        self.client.force_login(self.cook)

        listing = self.client.get(RECIPES_URL)
        detail = self.client.get(f"{RECIPES_URL}{self.recipe.id}/")

        self.assertEqual(listing.status_code, status.HTTP_200_OK)
        self.assertIn("Brown Butter Cornbread", {row["title"] for row in listing.data})
        self.assertEqual(detail.status_code, status.HTTP_200_OK)
        self.assertEqual(detail.data["current_version"]["version_number"], 2)
        self.assertEqual([v["version_number"] for v in detail.data["versions"]], [1, 2])
        self.assertTrue(detail.data["versions"][1]["ingredient_lines"])
        self.assertTrue(detail.data["versions"][1]["steps"])
        self.assertEqual(detail.data["versions"][1]["test_sessions"][0]["rating"], 5)

    def test_sample_endpoints_list_no_developer_content(self) -> None:
        Idea.objects.create(user=self.dev, title="Secret idea")
        self.client.force_login(self.cook)

        response = self.client.get(IDEAS_URL)

        self.assertNotIn("Secret idea", {row["title"] for row in response.data})

    def test_writes_to_sample_content_are_refused(self) -> None:
        for user in (self.cook, self.dev):
            self.client.force_login(user)
            attempts = [
                self.client.post(IDEAS_URL, {"title": "New"}, format="json"),
                self.client.patch(f"{IDEAS_URL}{self.idea.id}/", {"title": "x"}, format="json"),
                self.client.put(f"{IDEAS_URL}{self.idea.id}/", {"title": "x"}, format="json"),
                self.client.delete(f"{IDEAS_URL}{self.idea.id}/"),
                self.client.post(RECIPES_URL, {"title": "New"}, format="json"),
                self.client.patch(
                    f"{RECIPES_URL}{self.recipe.id}/", {"title": "x"}, format="json"
                ),
                self.client.delete(f"{RECIPES_URL}{self.recipe.id}/"),
            ]
            for response in attempts:
                self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
                self.assertEqual(response.data["code"], "sample_read_only")
                self.assertEqual(response.data["detail"], "Sample content is read-only.")

        self.idea.refresh_from_db()
        self.recipe.refresh_from_db()
        self.assertNotEqual(self.idea.title, "x")
        self.assertEqual(self.recipe.title, "Brown Butter Cornbread")

    def test_developer_endpoints_do_not_reach_sample_content(self) -> None:
        self.client.force_login(self.dev)

        ideas = self.client.get("/api/v1/ideas/")
        recipes = self.client.get("/api/v1/recipes/")
        patch = self.client.patch(
            f"/api/v1/ideas/{self.idea.id}/", {"title": "x"}, format="json"
        )
        delete = self.client.delete(f"/api/v1/recipes/{self.recipe.id}/")

        self.assertEqual(ideas.data, [])
        self.assertEqual(recipes.data, [])
        self.assertEqual(patch.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(delete.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(DevelopmentRecipe.objects.filter(id=self.recipe.id).exists())

    def test_anonymous_cannot_read_samples(self) -> None:
        response = self.client.get(IDEAS_URL)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
