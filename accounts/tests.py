from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from .models import SubscriptionStatus, UserRole

User = get_user_model()


class AuthAPITests(TestCase):
    def setUp(self) -> None:
        cache.clear()
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

    def test_me_patches_show_forks(self) -> None:
        user = User.objects.create_user(username="dev", password="strong-pass-1")
        self.client.force_login(user)

        response = self.client.patch(
            self.me_url,
            {"show_forks": False},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["show_forks"])
        user.refresh_from_db()
        self.assertFalse(user.show_forks)


class GuestAPITests(TestCase):
    def setUp(self) -> None:
        cache.clear()
        self.client = APIClient(enforce_csrf_checks=False)
        self.guest_url = "/api/v1/auth/guest/"
        self.me_url = "/api/v1/auth/me/"
        self.register_payload = {
            "username": "cook",
            "password": "strong-pass-1",
            "password_confirm": "strong-pass-1",
        }

    def test_guest_creates_passwordless_home_cook_and_logs_in(self) -> None:
        response = self.client.post(self.guest_url)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["is_guest"])
        self.assertEqual(response.data["role"], UserRole.HOME_COOK)
        user = User.objects.get(id=response.data["id"])
        self.assertFalse(user.has_usable_password())
        me = self.client.get(self.me_url)
        self.assertEqual(me.status_code, status.HTTP_200_OK)
        self.assertEqual(me.data["id"], response.data["id"])
        self.assertTrue(me.data["is_guest"])

    def test_guest_again_while_signed_in_returns_same_user(self) -> None:
        first = self.client.post(self.guest_url)
        second = self.client.post(self.guest_url)

        self.assertEqual(second.status_code, status.HTTP_200_OK)
        self.assertEqual(second.data["id"], first.data["id"])
        self.assertEqual(User.objects.filter(is_guest=True).count(), 1)

    def test_me_reports_registered_user_is_not_guest(self) -> None:
        user = User.objects.create_user(username="cook", password="strong-pass-1")
        self.client.force_login(user)

        self.assertFalse(self.client.get(self.me_url).data["is_guest"])

    def test_register_upgrades_signed_in_guest_in_place(self) -> None:
        from collection import services

        guest_id = self.client.post(self.guest_url).data["id"]
        guest = User.objects.get(id=guest_id)
        services.create_box_recipe(guest, title="Corn muffin")
        old_session_key = self.client.session.session_key

        response = self.client.post(
            "/api/v1/auth/register/",
            self.register_payload,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["id"], guest_id)
        self.assertFalse(response.data["is_guest"])
        self.assertEqual(response.data["username"], "cook")
        guest.refresh_from_db()
        self.assertTrue(guest.check_password("strong-pass-1"))
        self.assertEqual(guest.recipe_box_items.count(), 1)
        self.assertNotEqual(self.client.session.session_key, old_session_key)
        self.assertEqual(User.objects.count(), 1)

    def test_register_upgrade_rejects_taken_username(self) -> None:
        User.objects.create_user(username="cook", password="strong-pass-1")
        self.client.post(self.guest_url)

        response = self.client.post(
            "/api/v1/auth/register/",
            self.register_payload,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(self.client.get(self.me_url).data["is_guest"])

    def test_guest_blocked_from_start_trial_and_patch_me(self) -> None:
        self.client.post(self.guest_url)

        trial = self.client.post("/api/v1/auth/start-trial/")
        patch = self.client.patch(self.me_url, {"show_forks": False}, format="json")

        self.assertEqual(trial.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(patch.status_code, status.HTTP_403_FORBIDDEN)


def _rate_count(scope: str) -> int:
    return int(settings.REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"][scope].split("/")[0])


class AuthThrottleTests(TestCase):
    def setUp(self) -> None:
        cache.clear()
        self.addCleanup(cache.clear)

    def _exhaust(self, url: str, scope: str, payload: dict, ip: str = "10.0.0.1") -> None:
        for _ in range(_rate_count(scope)):
            response = APIClient().post(url, payload, format="json", REMOTE_ADDR=ip)
            self.assertNotEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    def _assert_throttled(self, response) -> None:
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertIn("Retry-After", response.headers)

    def test_guest_create_is_throttled_per_ip(self) -> None:
        url = "/api/v1/auth/guest/"
        self._exhaust(url, "guest_create", {})

        self._assert_throttled(APIClient().post(url, REMOTE_ADDR="10.0.0.1"))
        other_ip = APIClient().post(url, REMOTE_ADDR="10.0.0.2")
        self.assertEqual(other_ip.status_code, status.HTTP_201_CREATED)

    def test_register_is_throttled_per_ip(self) -> None:
        url = "/api/v1/auth/register/"
        self._exhaust(url, "register", {"username": "x"})

        response = APIClient().post(
            url,
            {"username": "cook", "password": "strong-pass-1", "password_confirm": "strong-pass-1"},
            format="json",
            REMOTE_ADDR="10.0.0.1",
        )
        self._assert_throttled(response)
        self.assertFalse(User.objects.filter(username="cook").exists())

    def test_register_by_signed_in_guest_counts_against_ip(self) -> None:
        url = "/api/v1/auth/register/"
        self._exhaust(url, "register", {"username": "x"})
        guest = User.objects.create_user(username="guest-1", is_guest=True)
        client = APIClient()
        client.force_login(guest)

        self._assert_throttled(client.post(url, {"username": "x"}, format="json", REMOTE_ADDR="10.0.0.1"))

    def test_login_is_throttled_per_ip(self) -> None:
        User.objects.create_user(username="dev", password="strong-pass-1")
        url = "/api/v1/auth/login/"
        self._exhaust(url, "login", {"username": "dev", "password": "wrong"})

        good = {"username": "dev", "password": "strong-pass-1"}
        self._assert_throttled(APIClient().post(url, good, format="json", REMOTE_ADDR="10.0.0.1"))
        other_ip = APIClient().post(url, good, format="json", REMOTE_ADDR="10.0.0.2")
        self.assertEqual(other_ip.status_code, status.HTTP_200_OK)
