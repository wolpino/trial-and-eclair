from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    fieldsets = DjangoUserAdmin.fieldsets + (
        (
            "Trial & Eclair",
            {
                "fields": (
                    "role",
                    "subscription_status",
                    "trial_ends_at",
                    "measurement_preference",
                    "show_forks",
                )
            },
        ),
    )
    list_display = DjangoUserAdmin.list_display + ("role", "subscription_status")
    list_filter = DjangoUserAdmin.list_filter + ("role", "subscription_status")
