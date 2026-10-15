import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("catalog", "0001_initial"),
        ("collection", "0002_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="collectionrecipe",
            name="servings",
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="collectionrecipe",
            name="source_type",
            field=models.CharField(
                choices=[
                    ("typed", "Typed"),
                    ("handwritten", "Handwritten"),
                    ("recipe_card", "Recipe card"),
                    ("cookbook", "Cookbook"),
                    ("web", "Web"),
                    ("scan", "Scan"),
                ],
                default="typed",
                max_length=16,
            ),
        ),
        migrations.AddField(
            model_name="collectioningredientline",
            name="raw_text",
            field=models.TextField(blank=True),
        ),
        migrations.AlterField(
            model_name="collectioningredientline",
            name="ingredient",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="collection_lines",
                to="catalog.ingredient",
            ),
        ),
        migrations.AlterField(
            model_name="collectioningredientline",
            name="quantity",
            field=models.DecimalField(
                blank=True, decimal_places=3, max_digits=10, null=True
            ),
        ),
    ]
