import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    """Cookbook entries get their own copy (issue #133). Schema only.

    ``snapshot_version`` becomes nullable here so 0007 can drop it and still
    be reversed. 0006 fills ``snapshot``.
    """

    dependencies = [
        ("development", "0004_sample_content"),
    ]

    operations = [
        migrations.AddField(
            model_name="cookbookrecipe",
            name="snapshot",
            field=models.JSONField(default=dict),
        ),
        migrations.AlterField(
            model_name="cookbookrecipe",
            name="recipe",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="cookbook_entries",
                to="development.developmentrecipe",
            ),
        ),
        migrations.AlterField(
            model_name="cookbookrecipe",
            name="snapshot_version",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="cookbook_snapshots",
                to="development.recipeversion",
            ),
        ),
    ]
