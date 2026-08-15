from django.test import TestCase
from rest_framework import status


class DeploySurfaceTests(TestCase):
    def test_healthz_is_public(self) -> None:
        response = self.client.get("/healthz")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_unknown_api_path_is_not_spa(self) -> None:
        response = self.client.get("/api/v1/does-not-exist/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertNotEqual(response.headers.get("Content-Type", ""), "text/html")
