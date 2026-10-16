from django.test import TestCase


class IpCheckTests(TestCase):
    def test_reports_forwarded_for_and_drf_pick(self):
        resp = self.client.get(
            "/api/v1/ipcheck/", HTTP_X_FORWARDED_FOR="1.2.3.4, 203.0.113.7, 104.23.0.1"
        )
        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertEqual(body["x_forwarded_for"], "1.2.3.4, 203.0.113.7, 104.23.0.1")
        self.assertEqual(
            body["client_ip_if_num_proxies"],
            {"1": "104.23.0.1", "2": "203.0.113.7", "3": "1.2.3.4"},
        )

    def test_without_header(self):
        body = self.client.get("/api/v1/ipcheck/").json()
        self.assertEqual(body["client_ip_if_num_proxies"], {})
