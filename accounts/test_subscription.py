from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from .models import SubscriptionStatus, UserRole

User = get_user_model()


class DeveloperSubscriptionTests(TestCase):
    def setUp(self) -> None:
        self.client = APIClient(enforce_csrf_checks=False)
        self.ideas_url = "/api/v1/ideas/"

    def _developer(self, **kwargs) -> User:
        defaults = {
            "username": "dev",
            "password": "strong-pass-1",
            "role": UserRole.DEVELOPER,
            "subscription_status": SubscriptionStatus.TRIAL,
            "trial_ends_at": timezone.now() + timedelta(days=14),
        }
        defaults.update(kwargs)
        return User.objects.create_user(**defaults)

    def test_active_subscription_allows_developer_endpoints(self) -> None:
        user = self._developer(subscription_status=SubscriptionStatus.ACTIVE, trial_ends_at=None)
        self.client.force_login(user)

        response = self.client.get(self.ideas_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_valid_trial_allows_developer_endpoints(self) -> None:
        user = self._developer()
        self.client.force_login(user)

        response = self.client.get(self.ideas_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_expired_trial_blocks_developer_endpoints(self) -> None:
        user = self._developer(
            trial_ends_at=timezone.now() - timedelta(days=1),
        )
        self.client.force_login(user)

        response = self.client.get(self.ideas_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_expired_status_blocks_developer_endpoints(self) -> None:
        user = self._developer(
            subscription_status=SubscriptionStatus.EXPIRED,
            trial_ends_at=None,
        )
        self.client.force_login(user)

        response = self.client.get(self.ideas_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_cancelled_status_blocks_developer_endpoints(self) -> None:
        user = self._developer(
            subscription_status=SubscriptionStatus.CANCELLED,
            trial_ends_at=None,
        )
        self.client.force_login(user)

        response = self.client.get(self.ideas_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_promoted_developer_with_none_status_allowed(self) -> None:
        user = self._developer(
            subscription_status=SubscriptionStatus.NONE,
            trial_ends_at=None,
        )
        self.client.force_login(user)

        response = self.client.get(self.ideas_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_has_developer_access_on_user_model(self) -> None:
        active = self._developer(subscription_status=SubscriptionStatus.ACTIVE, trial_ends_at=None)
        expired_trial = self._developer(
            username="expired",
            trial_ends_at=timezone.now() - timedelta(hours=1),
        )

        self.assertTrue(active.has_developer_access())
        self.assertFalse(expired_trial.has_developer_access())
