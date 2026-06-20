import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class UserRole(models.TextChoices):
    HOME_COOK = "home_cook", "Home Cook"
    DEVELOPER = "developer", "Developer"


class SubscriptionStatus(models.TextChoices):
    NONE = "none", "None"
    TRIAL = "trial", "Trial"
    ACTIVE = "active", "Active"
    EXPIRED = "expired", "Expired"
    CANCELLED = "cancelled", "Cancelled"


class MeasurementPreference(models.TextChoices):
    ORIGINAL = "original", "As written"
    METRIC = "metric", "Metric"
    IMPERIAL = "imperial", "Imperial"


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.HOME_COOK,
    )
    subscription_status = models.CharField(
        max_length=20,
        choices=SubscriptionStatus.choices,
        default=SubscriptionStatus.NONE,
    )
    trial_ends_at = models.DateTimeField(null=True, blank=True)
    measurement_preference = models.CharField(
        max_length=20,
        choices=MeasurementPreference.choices,
        default=MeasurementPreference.ORIGINAL,
    )
    show_forks = models.BooleanField(
        default=True,
        help_text="When False, fork lineage is hidden on your public recipes.",
    )

    def is_developer(self):
        return self.role == UserRole.DEVELOPER

    def is_home_cook(self):
        return self.role == UserRole.HOME_COOK
