from django.db import migrations


class Migration(migrations.Migration):
    """Entries read only their own copy now. Reversing re-adds a nullable FK."""

    dependencies = [
        ("development", "0006_fill_cookbook_snapshots"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="cookbookrecipe",
            name="snapshot_version",
        ),
    ]
