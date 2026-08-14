from datetime import timedelta

from django.utils import timezone

from .models import SubscriptionStatus, User, UserRole

TRIAL_DAYS = 14


class TrialUnavailable(ValueError):
    pass


def start_developer_trial(user: User) -> User:
    if user.has_developer_access():
        raise TrialUnavailable("You already have developer access.")
    if user.subscription_status in {
        SubscriptionStatus.EXPIRED,
        SubscriptionStatus.CANCELLED,
    }:
        raise TrialUnavailable("Paid billing is not available yet.")
    if user.trial_ends_at is not None:
        raise TrialUnavailable("Your trial has ended. Paid billing is not available yet.")
    user.role = UserRole.DEVELOPER
    user.subscription_status = SubscriptionStatus.TRIAL
    user.trial_ends_at = timezone.now() + timedelta(days=TRIAL_DAYS)
    user.save(update_fields=["role", "subscription_status", "trial_ends_at"])
    return user
