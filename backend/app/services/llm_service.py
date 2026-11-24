import os
import json
import logging
from typing import Dict, Any, List, Optional
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

class LLMService:
    """
    Provider-independent LLM service supporting OpenAI-compatible APIs,
    Gemini, Anthropic, and smart offline heuristic fallback.
    """

    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        self.api_key = settings.LLM_API_KEY
        self.model = settings.LLM_MODEL or "gpt-4o-mini"
        self.base_url = settings.LLM_BASE_URL or "https://api.openai.com/v1"
        self.temperature = settings.LLM_TEMPERATURE

    def is_configured(self) -> bool:
        """Returns True if a live external LLM provider API key is present."""
        return bool(self.api_key and self.provider != "local")

    async def generate_chat_completion(self, system_prompt: str, user_prompt: str, response_format_json: bool = False) -> str:
        """Send chat completion to configured provider, or return fallback."""
        if not self.is_configured():
            logger.info("No external LLM key provided. Operating in intelligent local/demo mode.")
            return ""

        try:
            if self.provider in ["openai", "groq", "ollama", "openrouter", "deepseek"]:
                return await self._call_openai_compatible(system_prompt, user_prompt, response_format_json)
            elif self.provider in ["gemini", "google"]:
                return await self._call_gemini(system_prompt, user_prompt)
            elif self.provider in ["anthropic", "claude"]:
                return await self._call_anthropic(system_prompt, user_prompt)
            else:
                logger.warning(f"Unknown LLM provider '{self.provider}'. Falling back to local agent.")
                return ""
        except Exception as e:
            logger.error(f"LLM API call failed: {e}. Falling back to local heuristic intelligence.")
            return ""

    async def _call_openai_compatible(self, system_prompt: str, user_prompt: str, response_format_json: bool) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        url = f"{self.base_url.rstrip('/')}/chat/completions"
        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": self.temperature
        }
        if response_format_json:
            payload["response_format"] = {"type": "json_object"}

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    async def _call_gemini(self, system_prompt: str, user_prompt: str) -> str:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": f"System Instructions:\n{system_prompt}\n\nTask:\n{user_prompt}"}]
                }
            ],
            "generationConfig": {
                "temperature": self.temperature
            }
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]

    async def _call_anthropic(self, system_prompt: str, user_prompt: str) -> str:
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        payload = {
            "model": self.model or "claude-3-5-sonnet-20241022",
            "max_tokens": 2048,
            "system": system_prompt,
            "messages": [{"role": "user", "content": user_prompt}]
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            return data["content"][0]["text"]

llm_service = LLMService()
