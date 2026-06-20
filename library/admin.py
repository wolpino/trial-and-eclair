from django.contrib import admin

from .models import Reference, ReferenceLink, SourceDocument, UrlRecipeImport


@admin.register(Reference)
class ReferenceAdmin(admin.ModelAdmin):
    list_display = ["title", "ref_type", "user"]
    list_filter = ["ref_type"]
    search_fields = ["title", "notes"]


admin.site.register(ReferenceLink)
admin.site.register(SourceDocument)
admin.site.register(UrlRecipeImport)
