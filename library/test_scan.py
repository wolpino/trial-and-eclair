from django.test import SimpleTestCase

from library.scan import SCAN_DRAFT_NOTE, SCAN_REVIEW_NOTE, parse_recipe_text

RECIPE_TEXT = """
Grandma Cookies

Ingredients
2 cups flour
1 cup sugar

Directions
Mix dry ingredients.
Bake until golden.
"""


class ParseRecipeTextTests(SimpleTestCase):
    def test_headers_fill_title_ingredients_and_steps(self) -> None:
        payload = parse_recipe_text(RECIPE_TEXT, fallback_title="scan")

        self.assertEqual(payload.title, "Grandma Cookies")
        self.assertEqual(
            [line.name for line in payload.ingredient_lines],
            ["2 cups flour", "1 cup sugar"],
        )
        self.assertEqual(
            payload.step_bodies,
            ["Mix dry ingredients.", "Bake until golden."],
        )
        self.assertEqual(payload.version_notes, SCAN_REVIEW_NOTE)
        self.assertEqual(payload.description, "")

    def test_empty_text_uses_fallback_title_and_draft_note(self) -> None:
        payload = parse_recipe_text("  \n", fallback_title="lab-scan")

        self.assertEqual(payload.title, "lab-scan")
        self.assertEqual(payload.description, SCAN_DRAFT_NOTE)
        self.assertEqual(payload.version_notes, SCAN_DRAFT_NOTE)
        self.assertEqual(payload.ingredient_lines, [])
        self.assertEqual(payload.step_bodies, [])

    def test_plain_body_without_headers_stays_in_description(self) -> None:
        payload = parse_recipe_text(
            "Sourdough notes\nFeed the starter.\nBake hot.",
            fallback_title="notes",
        )

        self.assertEqual(payload.title, "Sourdough notes")
        self.assertEqual(payload.description, "Feed the starter.\nBake hot.")
        self.assertEqual(payload.version_notes, SCAN_DRAFT_NOTE)
        self.assertEqual(payload.ingredient_lines, [])
        self.assertEqual(payload.step_bodies, [])
