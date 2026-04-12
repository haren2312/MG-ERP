"""
WhatsApp Cloud API client.

Maps to this endpoint shape:
POST https://graph.facebook.com/<api_version>/<account_ID>/messages
"""
from __future__ import annotations

import logging
from typing import Any, Dict

import httpx

from config import (
    WHATSAPP_ACCESS_TOKEN,
    WHATSAPP_ACCOUNT_ID,
    WHATSAPP_API_VERSION,
    WHATSAPP_GRAPH_BASE_URL,
    WHATSAPP_REQUEST_TIMEOUT_SECONDS,
)


logger = logging.getLogger(__name__)


class WhatsAppClient:
    """Simple client for sending WhatsApp text messages via Graph API."""

    def __init__(
        self,
        *,
        api_version: str = WHATSAPP_API_VERSION,
        account_id: str = WHATSAPP_ACCOUNT_ID,
        access_token: str = WHATSAPP_ACCESS_TOKEN,
        graph_base_url: str = WHATSAPP_GRAPH_BASE_URL,
        timeout_seconds: float = WHATSAPP_REQUEST_TIMEOUT_SECONDS,
    ) -> None:
        self.api_version = api_version.strip()
        self.account_id = account_id.strip()
        self.access_token = access_token.strip()
        self.graph_base_url = graph_base_url.rstrip("/")
        self.timeout_seconds = timeout_seconds

    def _endpoint(self) -> str:
        if not self.api_version or not self.account_id:
            raise ValueError(
                "WhatsApp endpoint config missing: set WHATSAPP_API_VERSION and WHATSAPP_ACCOUNT_ID"
            )
        return f"{self.graph_base_url}/{self.api_version}/{self.account_id}/messages"

    def _headers(self) -> Dict[str, str]:
        if not self.access_token:
            raise ValueError("WhatsApp access token missing: set WHATSAPP_ACCESS_TOKEN")

        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
        }

    def _masked_token(self) -> str:
        if len(self.access_token) <= 12:
            return "***"
        return f"{self.access_token[:6]}...{self.access_token[-4:]}"

    def send_text_message(self, recipient: str, text: str) -> Dict[str, Any]:
        """
        Send a WhatsApp text message.

        Input params (from your {..} placeholders):
        - recipient
        - text
        """
        if not recipient or not recipient.strip():
            raise ValueError("recipient is required")
        if not text or not text.strip():
            raise ValueError("text is required")

        payload = {
            "messaging_product": "whatsapp",
            "preview_url": False,
            "recipient_type": "individual",
            "to": recipient.strip(),
            "type": "text",
            "text": {
                "body": text.strip(),
            },
        }

        endpoint = self._endpoint()
        logger.info(
            "WhatsApp send request | endpoint=%s | to=%s | token=%s",
            endpoint,
            payload["to"],
            self._masked_token(),
        )
        logger.debug("WhatsApp send payload: %s", payload)

        with httpx.Client(timeout=self.timeout_seconds) as client:
            try:
                response = client.post(
                    endpoint,
                    headers=self._headers(),
                    json=payload,
                )
            except httpx.RequestError:
                logger.exception(
                    "WhatsApp HTTP request error | endpoint=%s | to=%s",
                    endpoint,
                    payload["to"],
                )
                raise

        logger.info(
            "WhatsApp send response | status=%s | endpoint=%s",
            response.status_code,
            endpoint,
        )
        logger.debug("WhatsApp send response headers: %s", dict(response.headers))
        logger.debug("WhatsApp send response body: %s", response.text)

        try:
            response.raise_for_status()
        except httpx.HTTPStatusError:
            logger.exception(
                "WhatsApp HTTP status error | status=%s | endpoint=%s | body=%s",
                response.status_code,
                endpoint,
                response.text,
            )
            raise
        return response.json()
