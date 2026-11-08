from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from catalog.models import Ingredient
from collection.models import CollectionRecipe

from .models import (
    DevelopmentRecipe,
    ForkType,
    RecipeFork,
    RecipeStep,
    VersionIngredientLine,
)

User = get_user_model()


class ForkAPITests(TestCase):
    def setUp(self) -> None:
        self.client = APIClient(enforce_csrf_checks=False)
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
        self.flour = Ingredient.objects.create(name="All-purpose flour")
        self.sugar = Ingredient.objects.create(name="Sugar")

    def _publish_source(self) -> DevelopmentRecipe:
        self.client.force_login(self.developer)
        response = self.client.post(
            "/api/v1/recipes/",
            {"title": "Corn muffin"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        recipe = DevelopmentRecipe.objects.get(id=response.data["id"])
        version = recipe.current_version
        version.description = "Weekend treat"
        version.equipment_notes = "Muffin tin"
        version.prep_minutes = 10
        version.cook_minutes = 20
        version.story = "From the bakery window"
        version.save()
        VersionIngredientLine.objects.create(
            version=version,
            ingredient=self.flour,
            quantity=Decimal("2.000"),
            unit="cup",
            sort_order=0,
        )
        VersionIngredientLine.objects.create(
            version=version,
            ingredient=self.sugar,
            quantity=Decimal("0.500"),
            unit="cup",
            sort_order=1,
        )
        RecipeStep.objects.create(version=version, order=1, body="Mix the batter.")
        RecipeStep.objects.create(version=version, order=2, body="Bake until golden.")
        publish = self.client.post(
            f"/api/v1/recipes/{recipe.id}/publish/",
            {"slug": "corn-muffin", "story": "From the bakery window"},
            format="json",
        )
        self.assertEqual(publish.status_code, status.HTTP_200_OK)
        recipe.refresh_from_db()
        return recipe

    def test_guest_at_limit_cannot_save_to_box(self) -> None:
        from collection import services

        self._publish_source()
        guest = User.objects.create_user(username="guest-x", is_guest=True)
        for i in range(services.GUEST_CARD_LIMIT):
            services.create_box_recipe(guest, title=f"Card {i}")
        self.client.force_login(guest)

        response = self.client.post(
            "/api/v1/public/recipes/corn-muffin/fork/",
            {"fork_type": ForkType.SAVE_TO_BOX},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["code"], "guest_card_limit")
        self.assertEqual(guest.recipe_box_items.count(), services.GUEST_CARD_LIMIT)

    def test_guest_cannot_rework(self) -> None:
        self._publish_source()
        guest = User.objects.create_user(username="guest-x", is_guest=True)
        self.client.force_login(guest)

        response = self.client.post(
            "/api/v1/public/recipes/corn-muffin/fork/",
            {"fork_type": ForkType.REWORK},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_home_cook_forks_to_box_and_copies_lines_and_steps(self) -> None:
        source = self._publish_source()
        original_line_count = source.published_version.ingredient_lines.count()
        original_step_count = source.published_version.steps.count()
        original_title = source.published_version.title
        self.client.force_login(self.home_cook)

        response = self.client.post(
            "/api/v1/public/recipes/corn-muffin/fork/",
            {"fork_type": ForkType.SAVE_TO_BOX},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["fork_type"], ForkType.SAVE_TO_BOX)
        recipe = CollectionRecipe.objects.get(id=response.data["recipe"]["id"])
        self.assertEqual(recipe.user, self.home_cook)
        self.assertEqual(recipe.title, "Corn muffin")
        self.assertEqual(recipe.description, "Weekend treat")
        self.assertEqual(recipe.equipment_notes, "Muffin tin")
        self.assertEqual(recipe.prep_minutes, 10)
        self.assertEqual(recipe.cook_minutes, 20)
        self.assertEqual(recipe.ingredient_lines.count(), 2)
        self.assertEqual(recipe.steps.count(), 2)
        self.assertEqual(recipe.fork_record.fork_type, ForkType.SAVE_TO_BOX)
        self.assertEqual(recipe.fork_record.forked_from_user, self.developer)
        source.refresh_from_db()
        self.assertEqual(source.published_version.title, original_title)
        self.assertEqual(source.published_version.ingredient_lines.count(), original_line_count)
        self.assertEqual(source.published_version.steps.count(), original_step_count)
        self.assertEqual(RecipeFork.objects.filter(user=self.home_cook).count(), 1)

    def test_developer_forks_to_lab_and_copies_lines_and_steps(self) -> None:
        source = self._publish_source()
        self.client.force_login(self.developer)

        response = self.client.post(
            "/api/v1/public/recipes/corn-muffin/fork/",
            {"fork_type": ForkType.REWORK},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["fork_type"], ForkType.REWORK)
        recipe = DevelopmentRecipe.objects.get(id=response.data["recipe"]["id"])
        self.assertNotEqual(recipe.id, source.id)
        self.assertEqual(recipe.user, self.developer)
        self.assertEqual(recipe.title, "Corn muffin")
        current = recipe.current_version
        self.assertEqual(current.version_number, 1)
        self.assertEqual(current.description, "Weekend treat")
        self.assertEqual(current.equipment_notes, "Muffin tin")
        self.assertEqual(current.story, "From the bakery window")
        self.assertEqual(current.ingredient_lines.count(), 2)
        self.assertEqual(current.steps.count(), 2)
        self.assertEqual(
            list(current.steps.order_by("order").values_list("body", flat=True)),
            ["Mix the batter.", "Bake until golden."],
        )
        self.assertEqual(recipe.fork_record.fork_type, ForkType.REWORK)
        self.assertEqual(recipe.status, "draft")
        source.refresh_from_db()
        self.assertEqual(source.status, "published")
        self.assertEqual(source.published_version.ingredient_lines.count(), 2)

    def test_home_cook_cannot_rework(self) -> None:
        self._publish_source()
        self.client.force_login(self.home_cook)

        response = self.client.post(
            "/api/v1/public/recipes/corn-muffin/fork/",
            {"fork_type": ForkType.REWORK},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(
            DevelopmentRecipe.objects.filter(user=self.home_cook).exists()
        )

    def test_unpublished_slug_returns_404(self) -> None:
        source = self._publish_source()
        self.client.post(f"/api/v1/recipes/{source.id}/unpublish/", {}, format="json")
        self.client.force_login(self.home_cook)

        response = self.client.post(
            "/api/v1/public/recipes/corn-muffin/fork/",
            {"fork_type": ForkType.SAVE_TO_BOX},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(CollectionRecipe.objects.filter(user=self.home_cook).exists())

    def test_unknown_slug_returns_404(self) -> None:
        self.client.force_login(self.home_cook)

        response = self.client.post(
            "/api/v1/public/recipes/missing-loaf/fork/",
            {"fork_type": ForkType.SAVE_TO_BOX},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class ForkOutlivesOriginalTests(TestCase):
    """Forks keep their copied content when the original or its author goes."""

    def setUp(self) -> None:
        self.client = APIClient(enforce_csrf_checks=False)
        self.author = User.objects.create_user(
            username="author", password="strong-pass-1", role="developer"
        )
        self.forker = User.objects.create_user(
            username="forker", password="strong-pass-1", role="developer"
        )
        self.home_cook = User.objects.create_user(
            username="cook", password="strong-pass-1", role="home_cook"
        )
        self.source = self._publish_source()
        self.lab_fork = self._fork(self.forker, ForkType.REWORK)
        self.box_fork = self._fork(self.home_cook, ForkType.SAVE_TO_BOX)
        self.client.force_login(self.forker)
        published = self.client.post(
            f"/api/v1/recipes/{self.lab_fork.id}/publish/",
            {"slug": "my-muffin"},
            format="json",
        )
        self.assertEqual(published.status_code, status.HTTP_200_OK)

    def _publish_source(self) -> DevelopmentRecipe:
        self.client.force_login(self.author)
        created = self.client.post(
            "/api/v1/recipes/", {"title": "Corn muffin"}, format="json"
        )
        recipe = DevelopmentRecipe.objects.get(id=created.data["id"])
        RecipeStep.objects.create(
            version=recipe.current_version, order=1, body="Bake until golden."
        )
        published = self.client.post(
            f"/api/v1/recipes/{recipe.id}/publish/",
            {"slug": "corn-muffin"},
            format="json",
        )
        self.assertEqual(published.status_code, status.HTTP_200_OK)
        recipe.refresh_from_db()
        return recipe

    def _fork(self, user, fork_type: str) -> DevelopmentRecipe | CollectionRecipe:
        self.client.force_login(user)
        response = self.client.post(
            "/api/v1/public/recipes/corn-muffin/fork/",
            {"fork_type": fork_type},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        model = DevelopmentRecipe if fork_type == ForkType.REWORK else CollectionRecipe
        return model.objects.get(id=response.data["recipe"]["id"])

    def _lineage(self) -> dict:
        self.client.logout()
        response = self.client.get("/api/v1/public/recipes/my-muffin/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data["fork_lineage"]

    def test_deleting_forked_recipe_keeps_forks_and_shows_original_removed(self) -> None:
        self.client.force_login(self.author)

        response = self.client.delete(f"/api/v1/recipes/{self.source.id}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(DevelopmentRecipe.objects.filter(id=self.source.id).exists())
        self.lab_fork.refresh_from_db()
        self.box_fork.refresh_from_db()
        self.assertEqual(self.lab_fork.title, "Corn muffin")
        self.assertEqual(self.lab_fork.current_version.steps.count(), 1)
        self.assertEqual(self.box_fork.steps.count(), 1)
        self.assertIsNone(self.lab_fork.fork_record.forked_from_version)
        self.assertIsNone(self.box_fork.fork_record.forked_from_version)
        lineage = self._lineage()
        self.assertIsNone(lineage["title"])
        self.assertIsNone(lineage["slug"])
        self.assertEqual(lineage["author"], "author")

    def test_deleting_original_author_keeps_forks_and_shows_deleted_user(self) -> None:
        self.author.delete()

        self.lab_fork.refresh_from_db()
        self.box_fork.refresh_from_db()
        self.assertEqual(self.lab_fork.title, "Corn muffin")
        self.assertEqual(self.box_fork.steps.count(), 1)
        self.assertIsNone(self.lab_fork.fork_record.forked_from_user)
        self.assertIsNone(self.box_fork.fork_record.forked_from_user)
        lineage = self._lineage()
        self.assertIsNone(lineage["author"])
        self.assertIsNone(lineage["title"])
        self.assertIsNone(lineage["slug"])

    def test_lineage_with_original_but_no_author_shows_deleted_user(self) -> None:
        RecipeFork.objects.filter(id=self.lab_fork.fork_record_id).update(
            forked_from_user=None
        )

        lineage = self._lineage()

        self.assertEqual(lineage["title"], "Corn muffin")
        self.assertEqual(lineage["slug"], "corn-muffin")
        self.assertIsNone(lineage["author"])

    def test_deleting_forker_still_deletes_their_fork(self) -> None:
        fork_ids = [self.lab_fork.fork_record_id, self.box_fork.fork_record_id]

        self.forker.delete()
        self.home_cook.delete()

        self.assertFalse(DevelopmentRecipe.objects.filter(id=self.lab_fork.id).exists())
        self.assertFalse(CollectionRecipe.objects.filter(id=self.box_fork.id).exists())
        self.assertFalse(RecipeFork.objects.filter(id__in=fork_ids).exists())
        self.assertTrue(DevelopmentRecipe.objects.filter(id=self.source.id).exists())
