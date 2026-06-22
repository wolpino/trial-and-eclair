from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from .models import SubscriptionStatus, UserRole

User = get_user_model()


class AuthAPITests(TestCase):
    def setUp(self) -> None:
        self.client = APIClient(enforce_csrf_checks=False)
        self.register_url = "/api/v1/auth/register/"
        self.login_url = "/api/v1/auth/login/"
        self.logout_url = "/api/v1/auth/logout/"
        self.me_url = "/api/v1/auth/me/"

    def test_register_creates_home_cook_and_logs_in(self) -> None:
        response = self.client.post(
            self.register_url,
            {
                "username": "cook",
                "email": "cook@example.com",
                "password": "strong-pass-1",
                "password_confirm": "strong-pass-1",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["role"], UserRole.HOME_COOK)
        self.assertEqual(response.data["subscription_status"], SubscriptionStatus.NONE)
        self.assertIsNone(response.data["trial_ends_at"])

        me_response = self.client.get(self.me_url)
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data["username"], "cook")

    def test_register_rejects_mismatched_passwords(self) -> None:
        response = self.client.post(
            self.register_url,
            {
                "username": "cook",
                "password": "strong-pass-1",
                "password_confirm": "different-pass",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password_confirm", response.data)

    def test_login_returns_user(self) -> None:
        User.objects.create_user(username="dev", password="strong-pass-1")

        response = self.client.post(
            self.login_url,
            {"username": "dev", "password": "strong-pass-1"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "dev")

    def test_login_rejects_invalid_credentials(self) -> None:
        User.objects.create_user(username="dev", password="strong-pass-1")

        response = self.client.post(
            self.login_url,
            {"username": "dev", "password": "wrong-password"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_me_requires_authentication(self) -> None:
        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_me_returns_trial_fields_for_developer(self) -> None:
        trial_ends_at = timezone.now() + timedelta(days=14)
        user = User.objects.create_user(
            username="dev",
            password="strong-pass-1",
            role=UserRole.DEVELOPER,
            subscription_status=SubscriptionStatus.TRIAL,
            trial_ends_at=trial_ends_at,
        )
        self.client.force_login(user)

        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["role"], UserRole.DEVELOPER)
        self.assertEqual(response.data["subscription_status"], SubscriptionStatus.TRIAL)
        self.assertIsNotNone(response.data["trial_ends_at"])

    def test_logout_clears_session(self) -> None:
        user = User.objects.create_user(username="dev", password="strong-pass-1")
        self.client.force_login(user)

        logout_response = self.client.post(self.logout_url)
        self.assertEqual(logout_response.status_code, status.HTTP_204_NO_CONTENT)

        me_response = self.client.get(self.me_url)
        self.assertEqual(me_response.status_code, status.HTTP_403_FORBIDDEN)
