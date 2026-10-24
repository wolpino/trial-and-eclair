import importlib
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.test import TestCase, TransactionTestCase
from rest_framework import status
from rest_framework.test import APIClient

from catalog.models import Ingredient

from . import services
from .models import Cookbook, CookbookRecipe, DevelopmentRecipe, RecipeStep, VersionIngredientLine

User = get_user_model()


class CookbookAPITests(TestCase):
    def setUp(self) -> None:
        self.client = APIClient(enforce_csrf_checks=False)
        self.cookbooks_url = "/api/v1/cookbooks/"
        self.developer = User.objects.create_user(
            username="dev",
            password="strong-pass-1",
            role="developer",
        )
        self.home_cook = User.objects.create_user(
            username="cook",
            password="strong-pass-1",
            role="home_cook",
        )
        self.recipe = services.create_development_recipe(self.developer, title="Corn muffin")
        services.publish_recipe(self.recipe, slug="corn-muffin")

    def test_home_cook_cannot_access_cookbooks(self) -> None:
        self.client.force_login(self.home_cook)

        response = self.client.get(self.cookbooks_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_developer_creates_cookbook_and_adds_recipe_entry(self) -> None:
        self.client.force_login(self.developer)

        create_response = self.client.post(
            self.cookbooks_url,
            {"title": "Weekend bakes", "description": "Favorites"},
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        cookbook_id = create_response.data["id"]

        entry_response = self.client.post(
            f"{self.cookbooks_url}{cookbook_id}/entries/",
            {"recipe": str(self.recipe.id)},
            format="json",
        )
        self.assertEqual(entry_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(entry_response.data["snapshot"]["title"], "Corn muffin")

    def test_publish_cookbook_and_view_publicly(self) -> None:
        cookbook = Cookbook.objects.create(
            user=self.developer,
            title="Weekend bakes",
            description="Favorites",
        )
        services.add_cookbook_entry(cookbook, self.recipe)
        self.client.force_login(self.developer)

        publish_response = self.client.post(
            f"{self.cookbooks_url}{cookbook.id}/publish/",
            {"slug": "weekend-bakes"},
            format="json",
        )
        self.assertEqual(publish_response.status_code, status.HTTP_200_OK)
        self.assertEqual(publish_response.data["status"], "published")

        public_response = self.client.get("/api/v1/public/cookbooks/weekend-bakes/")
        self.assertEqual(public_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(public_response.data["recipes"]), 1)
        self.assertEqual(public_response.data["recipes"][0]["recipe_slug"], "corn-muffin")

    def test_unpublished_recipe_stays_in_public_cookbook_without_link(self) -> None:
        cookbook = Cookbook.objects.create(user=self.developer, title="Weekend bakes")
        services.add_cookbook_entry(cookbook, self.recipe)
        services.publish_cookbook(cookbook, slug="weekend-bakes")
        services.unpublish_recipe(self.recipe)

        public_response = self.client.get("/api/v1/public/cookbooks/weekend-bakes/")

        self.assertEqual(public_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(public_response.data["recipes"]), 1)
        self.assertEqual(public_response.data["recipes"][0]["title"], "Corn muffin")
        self.assertIsNone(public_response.data["recipes"][0]["recipe_slug"])

    def test_unpublish_cookbook_hides_public_page(self) -> None:
        cookbook = Cookbook.objects.create(user=self.developer, title="Weekend bakes")
        services.publish_cookbook(cookbook, slug="weekend-bakes")
        self.client.force_login(self.developer)

        self.client.post(f"{self.cookbooks_url}{cookbook.id}/unpublish/", {}, format="json")

        public_response = self.client.get("/api/v1/public/cookbooks/weekend-bakes/")
        self.assertEqual(public_response.status_code, status.HTTP_404_NOT_FOUND)

    def test_entry_copy_does_not_change_when_new_version_saved(self) -> None:
        cookbook = Cookbook.objects.create(user=self.developer, title="Weekend bakes")
        entry = services.add_cookbook_entry(cookbook, self.recipe)

        services.save_new_version(self.recipe)
        self.recipe.refresh_from_db()
        self.recipe.current_version.title = "Renamed on v2"
        self.recipe.current_version.save(update_fields=["title", "updated_at"])

        entry.refresh_from_db()
        self.assertEqual(entry.snapshot["title"], "Corn muffin")
        services.publish_cookbook(cookbook, slug="weekend-bakes")
        public_response = self.client.get("/api/v1/public/cookbooks/weekend-bakes/")
        self.assertEqual(public_response.data["recipes"][0]["title"], "Corn muffin")


class CookbookCopyTests(TestCase):
    """A cookbook entry is a copy of the recipe, owned by the cookbook."""

    def setUp(self) -> None:
        self.client = APIClient(enforce_csrf_checks=False)
        self.developer = User.objects.create_user(
            username="dev",
            password="strong-pass-1",
            role="developer",
        )
        self.recipe = services.create_development_recipe(self.developer, title="Corn muffin")
        version = self.recipe.current_version
        version.description = "Tender crumb"
        version.save(update_fields=["description", "updated_at"])
        flour = Ingredient.objects.create(name="Cornmeal")
        self.line = VersionIngredientLine.objects.create(
            version=version,
            ingredient=flour,
            quantity=Decimal("1.500"),
            unit="cup",
            sort_order=1,
        )
        self.step = RecipeStep.objects.create(version=version, order=1, body="Whisk dry.")
        self.cookbook = Cookbook.objects.create(user=self.developer, title="Weekend bakes")
        self.entry = services.add_cookbook_entry(self.cookbook, self.recipe)

    def _public_recipes(self) -> list:
        services.publish_cookbook(self.cookbook, slug="weekend-bakes")
        response = self.client.get("/api/v1/public/cookbooks/weekend-bakes/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data["recipes"]

    def _assert_original_copy(self, recipe: dict) -> None:
        self.assertEqual(recipe["title"], "Corn muffin")
        self.assertEqual(recipe["description"], "Tender crumb")
        self.assertEqual(len(recipe["ingredient_lines"]), 1)
        self.assertEqual(recipe["ingredient_lines"][0]["ingredient_name"], "Cornmeal")
        self.assertEqual(recipe["ingredient_lines"][0]["quantity"], "1.500")
        self.assertEqual(recipe["ingredient_lines"][0]["unit"], "cup")
        self.assertEqual([step["body"] for step in recipe["steps"]], ["Whisk dry."])

    def test_editing_lab_version_leaves_entry_copy_unchanged(self) -> None:
        version = self.recipe.current_version
        version.title = "Renamed in the Lab"
        version.save(update_fields=["title", "updated_at"])
        self.line.quantity = Decimal("3.000")
        self.line.save(update_fields=["quantity", "updated_at"])
        self.step.body = "Changed step."
        self.step.save(update_fields=["body", "updated_at"])
        RecipeStep.objects.create(version=version, order=2, body="Added later.")

        self.client.force_login(self.developer)
        response = self.client.get(f"/api/v1/cookbooks/{self.cookbook.id}/entries/{self.entry.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self._assert_original_copy(response.data["snapshot"])
        self._assert_original_copy(self._public_recipes()[0])

    def test_deleting_lab_recipe_keeps_entry_and_public_copy(self) -> None:
        self.recipe.delete()

        self.entry.refresh_from_db()
        self.assertIsNone(self.entry.recipe_id)
        recipes = self._public_recipes()
        self.assertEqual(len(recipes), 1)
        self._assert_original_copy(recipes[0])
        self.assertIsNone(recipes[0]["recipe_slug"])

    def test_deleting_developer_deletes_cookbooks_and_entries(self) -> None:
        self.developer.delete()

        self.assertFalse(Cookbook.objects.exists())
        self.assertFalse(CookbookRecipe.objects.exists())
        self.assertFalse(DevelopmentRecipe.objects.exists())

    def test_public_entry_has_fixed_keys(self) -> None:
        self.entry.snapshot["injected"] = "<script>alert(1)</script>"
        self.entry.save(update_fields=["snapshot", "updated_at"])

        recipe = self._public_recipes()[0]

        self.assertNotIn("injected", recipe)


class CookbookSnapshotMigrationTests(TransactionTestCase):
    """The data migration copies FK-pinned entries into ``snapshot``."""

    serialized_rollback = True
    before = [("development", "0005_cookbook_entry_snapshot")]

    def tearDown(self) -> None:
        call_command("migrate", verbosity=0)

    def test_fill_snapshots_copies_pinned_version(self) -> None:
        executor = MigrationExecutor(connection)
        executor.migrate(self.before)
        executor.loader.build_graph()
        old_apps = executor.loader.project_state(self.before).apps
        user = old_apps.get_model("accounts", "User").objects.create(
            username="olddev", role="developer"
        )
        recipe = old_apps.get_model("development", "DevelopmentRecipe").objects.create(
            user=user, title="Old muffin"
        )
        version = old_apps.get_model("development", "RecipeVersion").objects.create(
            recipe=recipe, version_number=2, title="Old muffin", description="Pinned"
        )
        ingredient = old_apps.get_model("catalog", "Ingredient").objects.create(name="Oat flour")
        old_apps.get_model("development", "VersionIngredientLine").objects.create(
            version=version, ingredient=ingredient, quantity=Decimal("2.000"), unit="cup"
        )
        old_apps.get_model("development", "RecipeStep").objects.create(
            version=version, order=1, body="Stir."
        )
        cookbook = old_apps.get_model("development", "Cookbook").objects.create(
            user=user, title="Old book"
        )
        Entry = old_apps.get_model("development", "CookbookRecipe")
        entry = Entry.objects.create(cookbook=cookbook, recipe=recipe, snapshot_version=version)

        migration = importlib.import_module("development.migrations.0006_fill_cookbook_snapshots")
        migration.fill_snapshots(old_apps, None)
        migration.fill_snapshots(old_apps, None)  # idempotent

        snapshot = Entry.objects.get(pk=entry.pk).snapshot
        self.assertEqual(snapshot["title"], "Old muffin")
        self.assertEqual(snapshot["description"], "Pinned")
        self.assertEqual(snapshot["version_number"], 2)
        self.assertEqual(snapshot["steps"], ["Stir."])
        self.assertEqual(snapshot["ingredient_lines"][0]["ingredient_name"], "Oat flour")
        self.assertEqual(snapshot["ingredient_lines"][0]["quantity"], "2.000")


class CookbookShelfTests(TestCase):
    def setUp(self) -> None:
        self.client = APIClient(enforce_csrf_checks=False)
        self.developer = User.objects.create_user(
            username="dev",
            password="strong-pass-1",
            role="developer",
        )
        self.other_developer = User.objects.create_user(
            username="baker",
            password="strong-pass-1",
            role="developer",
        )
        self.cookbook = Cookbook.objects.create(user=self.developer, title="Weekend bakes")
        self.url = f"/api/v1/cookbooks/{self.cookbook.id}/"

    def test_on_shelf_defaults_to_false(self) -> None:
        self.client.force_login(self.developer)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIs(response.data["on_shelf"], False)

    def test_owner_sets_and_clears_on_shelf(self) -> None:
        self.client.force_login(self.developer)

        on = self.client.patch(self.url, {"on_shelf": True}, format="json")
        self.assertEqual(on.status_code, status.HTTP_200_OK)
        self.assertIs(on.data["on_shelf"], True)
        self.cookbook.refresh_from_db()
        self.assertTrue(self.cookbook.on_shelf)

        off = self.client.patch(self.url, {"on_shelf": False}, format="json")
        self.assertEqual(off.status_code, status.HTTP_200_OK)
        self.assertIs(off.data["on_shelf"], False)
        self.cookbook.refresh_from_db()
        self.assertFalse(self.cookbook.on_shelf)

    def test_other_user_cannot_change_on_shelf(self) -> None:
        self.client.force_login(self.other_developer)

        response = self.client.patch(self.url, {"on_shelf": True}, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.cookbook.refresh_from_db()
        self.assertFalse(self.cookbook.on_shelf)
