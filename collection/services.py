from django.db import transaction
from rest_framework.exceptions import PermissionDenied

from .models import CollectionRecipe, RecipeBoxItem

GUEST_CARD_LIMIT = 5
GUEST_CARD_LIMIT_CODE = "guest_card_limit"


def assert_can_add_card(user) -> None:
    if not user.is_guest:
        return
    if RecipeBoxItem.objects.filter(user=user).count() >= GUEST_CARD_LIMIT:
        raise PermissionDenied(
            {
                "detail": f"Guests can keep up to {GUEST_CARD_LIMIT} cards. Sign up to save more.",
                "code": GUEST_CARD_LIMIT_CODE,
            }
        )


@transaction.atomic
def create_box_recipe(user, *, title: str, **fields) -> CollectionRecipe:
    assert_can_add_card(user)
    recipe = CollectionRecipe.objects.create(user=user, title=title, **fields)
    RecipeBoxItem.objects.create(user=user, recipe=recipe)
    return recipe
