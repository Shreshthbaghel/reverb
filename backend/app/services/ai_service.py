import json
import os
import re
from typing import Optional, List, Tuple

from groq import Groq, APIError, APIConnectionError, APIStatusError


# Fast, free-tier friendly default on Groq
DEFAULT_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")


class AgentAIService:
    """Service for interacting with Groq LLM to generate agent responses."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        self.model = DEFAULT_MODEL
        self.client = Groq(api_key=self.api_key) if self.api_key else None

    def _require_client(self) -> Groq:
        if not self.client or not self.api_key or self.api_key == "your-api-key-here":
            raise Exception(
                "GROQ_API_KEY is not configured. Get a free key at https://console.groq.com"
            )
        return self.client

    def generate_response(
        self,
        system_prompt: str,
        user_message: str,
        conversation_history: Optional[List[dict]] = None
    ) -> Tuple[str, List[dict]]:
        """
        Generate an AI response for the voice agent.

        Returns:
            Tuple of (response_text, updated_history)
        """
        if conversation_history is None:
            conversation_history = []

        conversation_history.append({
            "role": "user",
            "content": user_message
        })

        messages = [{"role": "system", "content": system_prompt}] + conversation_history

        try:
            response = self._require_client().chat.completions.create(
                model=self.model,
                max_tokens=500,
                temperature=0.7,
                messages=messages,
            )

            ai_response = response.choices[0].message.content or ""

            conversation_history.append({
                "role": "assistant",
                "content": ai_response
            })

            return ai_response, conversation_history

        except (APIError, APIConnectionError, APIStatusError) as e:
            raise Exception(f"Groq API error: {str(e)}")

    def generate_system_prompt(
        self,
        description: str,
        name: Optional[str] = None,
        tone: Optional[str] = None,
    ) -> str:
        """Turn a short product description into a master system prompt."""
        tone = (tone or "professional, clear, and helpful").strip()
        name_line = f'Agent name: "{name}".' if name else ""

        try:
            response = self._require_client().chat.completions.create(
                model=self.model,
                max_tokens=700,
                temperature=0.4,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You write master system prompts for production voice/chat agents. "
                            "Return ONLY the system prompt text — no markdown fences, no commentary. "
                            "Include: role, goals, tone, what to ask for, what never to do, "
                            "and how to handle uncertainty. Keep it under 350 words."
                        ),
                    },
                    {
                        "role": "user",
                        "content": (
                            f"{name_line}\n"
                            f"Desired tone: {tone}\n"
                            f"Business / agent description:\n{description.strip()}"
                        ),
                    },
                ],
            )
            text = (response.choices[0].message.content or "").strip()
            text = re.sub(r"^```(?:\w+)?\s*|\s*```$", "", text, flags=re.IGNORECASE).strip()
            if not text:
                raise Exception("Empty prompt from model")
            return text
        except (APIError, APIConnectionError, APIStatusError) as e:
            raise Exception(f"Groq API error: {str(e)}")

    def analyze_transcript(self, transcript: str) -> dict:
        """
        Analyze a call transcript for quality score and key topics.
        """
        fallback = {
            "quality_score": 0.75,
            "summary": "Analysis unavailable",
            "sentiment": "neutral",
        }

        try:
            response = self._require_client().chat.completions.create(
                model=self.model,
                max_tokens=200,
                temperature=0.2,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a call quality analyst. Analyze the given transcript "
                            "and return ONLY a valid JSON object with keys: "
                            "quality_score (number 0.0-1.0), summary (one sentence string), "
                            "sentiment (positive, neutral, or negative). No markdown."
                        ),
                    },
                    {
                        "role": "user",
                        "content": f"Analyze this transcript:\n\n{transcript}",
                    },
                ],
            )

            text = (response.choices[0].message.content or "").strip()
            # Strip optional markdown fences
            text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.IGNORECASE).strip()
            data = json.loads(text)

            score = float(data.get("quality_score", 0.75))
            score = max(0.0, min(1.0, score))

            return {
                "quality_score": score,
                "summary": str(data.get("summary", ""))[:200] or fallback["summary"],
                "sentiment": str(data.get("sentiment", "neutral")).lower(),
            }

        except Exception:
            return fallback


# Singleton instance
ai_service = AgentAIService()
