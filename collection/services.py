from django.db import transaction

from .models import CollectionRecipe, RecipeBoxItem


@transaction.atomic
def create_box_recipe(user, *, title: str, **fields) -> CollectionRecipe:
    recipe = CollectionRecipe.objects.create(user=user, title=title, **fields)
    RecipeBoxItem.objects.create(user=user, recipe=recipe)
    return recipe
