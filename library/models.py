import uuid

from django.conf import settings
from django.db import models

from catalog.base import TimestampedModel


class ReferenceType(models.TextChoices):
    COOKBOOK = "cookbook", "Cookbook"
    BLOG = "blog", "Blog"
    CHEF = "chef", "Chef / Baker"
    ARTICLE = "article", "Article"
    TOOL = "tool", "Tool"


class Reference(TimestampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="references",
    )
    ref_type = models.CharField(max_length=20, choices=ReferenceType.choices)
    title = models.CharField(max_length=255)
    url = models.URLField(blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return self.title


class ReferenceLink(TimestampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference = models.ForeignKey(
        Reference,
        on_delete=models.CASCADE,
        related_name="links",
    )
    idea = models.ForeignKey(
        "development.Idea",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="reference_links",
    )
    recipe_version = models.ForeignKey(
        "development.RecipeVersion",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="reference_links",
    )
    note = models.CharField(max_length=255, blank=True)


class SourceDocument(TimestampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="source_documents",
    )
    file = models.FileField(upload_to="imports/")
    original_filename = models.CharField(max_length=255)
    mime_type = models.CharField(max_length=100, blank=True)
    extracted_text = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]


class UrlRecipeImport(TimestampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    normalized_url = models.URLField(unique=True, max_length=2048)
    source_title = models.CharField(max_length=255, blank=True)
    source_author = models.CharField(max_length=255, blank=True)
    source_site = models.CharField(max_length=255, blank=True)
    parsed_data = models.JSONField(default=dict)
    last_fetched_at = models.DateTimeField(null=True, blank=True)
    fetch_error = models.TextField(blank=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return self.source_title or self.normalized_url
