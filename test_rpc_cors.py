#!/usr/bin/env python3
"""CORS / Origin allowlist tests for blockchain_rpc_server.

Runs the handler on an ephemeral loopback port in-process; no network access.
Usage: python3 test_rpc_cors.py
"""
import json
import os
import sys
import threading
import unittest
from http.client import HTTPConnection
from http.server import HTTPServer

from blockchain_rpc_server import BlockchainRPCHandler

BODY = json.dumps({"jsonrpc": "2.0", "method": "server_info", "params": [], "id": 1})


class CorsAllowlistTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.httpd = HTTPServer(("127.0.0.1", 0), BlockchainRPCHandler)
        cls.port = cls.httpd.server_address[1]
        cls.thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()

    def setUp(self):
        os.environ.pop("RPC_ALLOWED_ORIGINS", None)

    def request(self, method, headers=None, body=None):
        conn = HTTPConnection("127.0.0.1", self.port, timeout=5)
        conn.request(method, "/", body=body, headers=headers or {})
        resp = conn.getresponse()
        data = resp.read()
        result = (resp.status, {k.lower(): v for k, v in resp.getheaders()}, data)
        conn.close()
        return result

    def test_no_wildcard_cors_header(self):
        status, headers, _ = self.request("POST", {"Content-Type": "application/json"}, BODY)
        self.assertEqual(status, 200)
        self.assertNotIn("access-control-allow-origin", headers)

    def test_non_browser_client_without_origin_is_served(self):
        status, _, data = self.request("POST", {"Content-Type": "application/json"}, BODY)
        self.assertEqual(status, 200)
        self.assertIn("result", json.loads(data))

    def test_cross_site_origin_rejected_by_default(self):
        status, headers, data = self.request(
            "POST", {"Content-Type": "text/plain", "Origin": "https://evil.example"}, BODY)
        self.assertEqual(status, 403)
        self.assertNotIn("access-control-allow-origin", headers)
        self.assertEqual(json.loads(data)["error"]["message"], "Origin not allowed")

    def test_allowlisted_origin_is_echoed_not_wildcard(self):
        os.environ["RPC_ALLOWED_ORIGINS"] = "https://0xcon.org, http://localhost:3000/"
        status, headers, _ = self.request(
            "POST", {"Content-Type": "application/json", "Origin": "http://localhost:3000"}, BODY)
        self.assertEqual(status, 200)
        self.assertEqual(headers.get("access-control-allow-origin"), "http://localhost:3000")
        self.assertEqual(headers.get("vary"), "Origin")

    def test_preflight_only_for_allowlisted_origin(self):
        status, _, _ = self.request("OPTIONS", {"Origin": "https://evil.example"})
        self.assertEqual(status, 403)
        os.environ["RPC_ALLOWED_ORIGINS"] = "https://0xcon.org"
        status, headers, _ = self.request("OPTIONS", {"Origin": "https://0xcon.org"})
        self.assertEqual(status, 204)
        self.assertEqual(headers.get("access-control-allow-origin"), "https://0xcon.org")


if __name__ == "__main__":
    sys.exit(0 if unittest.main(exit=False).result.wasSuccessful() else 1)
