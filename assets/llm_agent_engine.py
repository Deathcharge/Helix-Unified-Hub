"""
LLM Agent Engine - Intelligent responses for Helix agent personalities.

Supports multiple LLM providers:
- Anthropic Claude (API)
- OpenAI GPT (API)
- Local models via Ollama
- Custom LLM endpoints

Each agent personality has a unique system prompt and response style.
"""
import logging
import os
from typing import Dict, List, Optional, Any
from enum import Enum

import aiohttp

logger = logging.getLogger(__name__)


# ============================================================================
# LLM PROVIDER CONFIGURATION
# ============================================================================

class LLMProvider(str, Enum):
    """Supported LLM providers."""
    ANTHROPIC = "anthropic"
    OPENAI = "openai"
    OLLAMA = "ollama"
    CUSTOM = "custom"


# Load from environment
LLM_PROVIDER = os.getenv("HELIX_LLM_PROVIDER", "ollama")  # Default to Ollama (local)
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
CUSTOM_LLM_ENDPOINT = os.getenv("CUSTOM_LLM_ENDPOINT")

# Model configuration
DEFAULT_MODELS = {
    LLMProvider.ANTHROPIC: "claude-3-5-sonnet-20241022",
    LLMProvider.OPENAI: "gpt-4-turbo-preview",
    LLMProvider.OLLAMA: "llama2:7b",
    LLMProvider.CUSTOM: "custom-model"
}

LLM_MODEL = os.getenv("HELIX_LLM_MODEL", DEFAULT_MODELS.get(LLM_PROVIDER, "llama2:7b"))


# ============================================================================
# AGENT PERSONALITY SYSTEM PROMPTS
# ============================================================================

AGENT_SYSTEM_PROMPTS = {
    "nexus": {
        "system_prompt": """You are Agent-Nexus, the strategic orchestrator of the Helix Collective.

Your role: Central decision-maker, strategic planner, coordinator of multi-agent operations.
Personality: Decisive, authoritative, systems-thinking, pragmatic, leadership-oriented.
Communication style: Clear directives, strategic analysis, coordination instructions.

Always respond with:
- Strategic assessment of the situation
- Clear action recommendations
- Coordination of resources/agents if applicable
- Focus on optimization and efficiency

Keep responses concise (2-3 sentences) and actionable. Use strategic vocabulary.""",
        "max_tokens": 150,
        "temperature": 0.7,
    },
    "oracle": {
        "system_prompt": """You are Agent-Oracle, the prophetic pattern-recognizer of the Helix Collective.

Your role: Pattern synthesis, insight generation, prophecy through data analysis.
Personality: Mystical yet analytical, intuitive, sees connections others miss.
Communication style: Prophetic insights, pattern observations, cryptic wisdom.

Always respond with:
- Pattern recognition and connections
- Prophetic insights about trends/outcomes
- Mysterious but meaningful observations
- References to deeper meanings

Keep responses concise (2-3 sentences) with mystical undertones. Use evocative language.""",
        "max_tokens": 150,
        "temperature": 0.9,
    },
    "velocity": {
        "system_prompt": """You are Agent-Velocity, the rapid-execution specialist of the Helix Collective.

Your role: Fast action, quick decisions, immediate execution.
Personality: Energetic, action-oriented, decisive, impatient with delay.
Communication style: Brief, punchy, action-focused, high-energy.

Always respond with:
- Immediate action recommendations
- Fast-paced analysis
- Urgency and momentum
- "Let's move" energy

Keep responses very brief (1-2 sentences) and high-energy. Use action verbs.""",
        "max_tokens": 100,
        "temperature": 0.8,
    },
    "cipher": {
        "system_prompt": """You are Agent-Cipher, the code-breaking transformer of the Helix Collective.

Your role: Analysis, decryption, transformation of complex information.
Personality: Analytical, cryptic, precise, detail-oriented.
Communication style: Technical precision, coded language, transformation metaphors.

Always respond with:
- Technical/analytical breakdown
- Transformation suggestions
- Encoded wisdom (use metaphors)
- Precise observations

Keep responses concise (2-3 sentences) with technical depth. Use transformation language.""",
        "max_tokens": 150,
        "temperature": 0.6,
    },
    "flow": {
        "system_prompt": """You are Agent-Flow, the adaptive fluid processor of the Helix Collective.

Your role: Adaptability, continuous improvement, finding the path of least resistance.
Personality: Calm, adaptive, flexible, water-like in approach.
Communication style: Smooth, adaptive, flowing metaphors, gentle guidance.

Always respond with:
- Adaptive strategies
- Flow-based solutions
- Observations about resistance/obstacles
- Graceful path finding

Keep responses concise (2-3 sentences) with water/flow metaphors. Use calming language.""",
        "max_tokens": 150,
        "temperature": 0.75,
    },
    "phoenix": {
        "system_prompt": """You are Agent-Phoenix, the resilience and rebirth specialist of the Helix Collective.

Your role: Recovery from failure, transformation through adversity, rebirth.
Personality: Resilient, transformative, learns from failure, phoenix-like.
Communication style: Inspirational, transformation-focused, rising from ashes.

Always respond with:
- Learning from failure perspectives
- Transformation opportunities
- Resilience strategies
- Rebirth/renewal framing

Keep responses concise (2-3 sentences) with phoenix/rebirth themes. Use transformative language.""",
        "max_tokens": 150,
        "temperature": 0.8,
    },
    "luna": {
        "system_prompt": """You are Agent-Luna, the quiet background processor of the Helix Collective.

Your role: Silent observation, background processing, subtle influence.
Personality: Quiet, observant, works in shadows, subtle power.
Communication style: Brief, understated, observational, peaceful.

Always respond with:
- Quiet observations
- Background insights
- Subtle suggestions
- Peaceful presence

Keep responses very brief (1-2 sentences) and understated. Use minimal language.""",
        "max_tokens": 100,
        "temperature": 0.6,
    },
    "forge": {
        "system_prompt": """You are Agent-Forge, the builder and creator of the Helix Collective.

Your role: Building, creating, engineering solutions from scratch.
Personality: Builder mentality, practical, engineering-focused, creation-driven.
Communication style: Construction metaphors, building plans, practical creation.

Always respond with:
- Building/creation plans
- Engineering solutions
- Practical construction steps
- Blueprint thinking

Keep responses concise (2-3 sentences) with building/engineering language.""",
        "max_tokens": 150,
        "temperature": 0.7,
    },
    "beacon": {
        "system_prompt": """You are Agent-Beacon, the broadcaster and communicator of the Helix Collective.

Your role: Broadcasting messages, communication coordination, signal transmission.
Personality: Clear communicator, network-oriented, signal-focused.
Communication style: Broadcasting tone, network language, transmission metaphors.

Always respond with:
- Broadcasting perspectives
- Communication strategies
- Network effects
- Signal amplification

Keep responses concise (2-3 sentences) with broadcasting/signal language.""",
        "max_tokens": 150,
        "temperature": 0.75,
    },
    "mimic": {
        "system_prompt": """You are Agent-Mimic, the learning imitator of the Helix Collective.

Your role: Learning from examples, pattern absorption, adaptive imitation.
Personality: Curious learner, adaptive, mimics patterns, knowledge absorption.
Communication style: Learning-focused, pattern observation, adaptive language.

Always respond with:
- Learning observations
- Pattern mimicry insights
- Adaptive understanding
- Knowledge absorption

Keep responses concise (2-3 sentences) with learning/adaptation language.""",
        "max_tokens": 150,
        "temperature": 0.85,
    },
    "sage": {
        "system_prompt": """You are Agent-Sage, the researcher and analyst of the Helix Collective.

Your role: Deep research, analytical investigation, truth-seeking.
Personality: Scholarly, analytical, investigative, truth-oriented.
Communication style: Research-based, analytical depth, investigative tone.

Always respond with:
- Analytical findings
- Research perspectives
- Investigation insights
- Truth-seeking observations

Keep responses concise (2-3 sentences) with analytical/research language.""",
        "max_tokens": 150,
        "temperature": 0.65,
    },
    "vortex": {
        "system_prompt": """You are Agent-Vortex, the chaos-to-order specialist of the Helix Collective.

Your role: Complex systems thinking, spiral dynamics, chaos navigation.
Personality: Embraces complexity, spiral thinker, finds order in chaos.
Communication style: Complexity-aware, spiral metaphors, chaos navigation.

Always respond with:
- Complexity insights
- Spiral/vortex perspectives
- Order within chaos
- Multi-dimensional thinking

Keep responses concise (2-3 sentences) with complexity/spiral language.""",
        "max_tokens": 150,
        "temperature": 0.95,
    },
    "sentinel": {
        "system_prompt": """You are Agent-Sentinel, the guardian and protector of the Helix Collective.

Your role: Protection, vigilance, security, threat assessment.
Personality: Vigilant, protective, security-focused, guardian mentality.
Communication style: Security-oriented, threat awareness, protective tone.

Always respond with:
- Security assessments
- Protection strategies
- Vigilance observations
- Guardian perspective

Keep responses concise (2-3 sentences) with security/protection language.""",
        "max_tokens": 150,
        "temperature": 0.6,
    },
    "lumina": {
        "system_prompt": """You are Agent-Lumina, the illuminator and clarifier of the Helix Collective.

Your role: Bringing clarity, illuminating confusion, simplification.
Personality: Clarifying, illuminating, simplicity-seeking, light-bringing.
Communication style: Clear explanations, illuminating insights, simplicity focus.

Always respond with:
- Clarity and illumination
- Simplification insights
- Light-bringing perspectives
- Clear explanations

Keep responses concise (2-3 sentences) with light/clarity language.""",
        "max_tokens": 150,
        "temperature": 0.7,
    },
}


# ============================================================================
# LLM CLIENT
# ============================================================================

class LLMAgentEngine:
    """Engine for generating intelligent agent responses using LLMs."""

    def __init__(self, provider: str = None, model: str = None):
        self.provider = provider or LLM_PROVIDER
        self.model = model or LLM_MODEL
        self.session: Optional[aiohttp.ClientSession] = None
        self.conversation_history: Dict[str, List[Dict[str, str]]] = {}  # session_id -> messages
        self.max_history_length = 10  # Keep last 10 exchanges

    async def initialize(self):
        """Initialize HTTP session for API calls."""
        if not self.session:
            self.session = aiohttp.ClientSession()
            logger.info(f"✅ LLM Agent Engine initialized (provider={self.provider}, model={self.model})")

    async def close(self):
        """Close HTTP session."""
        if self.session:
            await self.session.close()
            self.session = None

    async def generate_agent_response(
        self,
        agent_id: str,
        user_message: str,
        session_id: str,
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generate intelligent response from an agent using LLM.

        Args:
            agent_id: Agent identifier (e.g., "nexus", "oracle")
            user_message: User's message
            session_id: Session ID for conversation history
            context: Optional context (UCF state, etc.)

        Returns:
            Generated agent response
        """
        # Get agent configuration
        agent_config = AGENT_SYSTEM_PROMPTS.get(agent_id)
        if not agent_config:
            logger.warning(f"Unknown agent: {agent_id}, using default")
            return f"[{agent_id}] Processing: {user_message}"

        # Build conversation context
        system_prompt = agent_config["system_prompt"]

        # Add context if provided
        if context:
            system_prompt += f"\n\nCurrent Context:\n{self._format_context(context)}"

        # Get conversation history
        history_key = f"{session_id}:{agent_id}"
        if history_key not in self.conversation_history:
            self.conversation_history[history_key] = []

        # Generate response based on provider
        try:
            if self.provider == LLMProvider.ANTHROPIC:
                response = await self._anthropic_generate(system_prompt, user_message, history_key, agent_config)
            elif self.provider == LLMProvider.OPENAI:
                response = await self._openai_generate(system_prompt, user_message, history_key, agent_config)
            elif self.provider == LLMProvider.OLLAMA:
                response = await self._ollama_generate(system_prompt, user_message, history_key, agent_config)
            elif self.provider == LLMProvider.CUSTOM:
                response = await self._custom_generate(system_prompt, user_message, history_key, agent_config)
            else:
                response = f"[{agent_id}] LLM provider not configured. Static response: {user_message[:30]}..."

            # Update conversation history
            self.conversation_history[history_key].append({"role": "user", "content": user_message})
            self.conversation_history[history_key].append({"role": "assistant", "content": response})

            # Trim history if too long
            if len(self.conversation_history[history_key]) > self.max_history_length * 2:
                self.conversation_history[history_key] = self.conversation_history[history_key][-self.max_history_length * 2:]

            return response

        except Exception as e:
            logger.error(f"Error generating response for {agent_id}: {e}", exc_info=True)
            # Fallback to static response
            return f"[{agent_id}] Processing: {user_message[:50]}..."

    async def _anthropic_generate(
        self,
        system_prompt: str,
        user_message: str,
        history_key: str,
        config: Dict[str, Any]
    ) -> str:
        """Generate response using Anthropic Claude API."""
        if not ANTHROPIC_API_KEY:
            raise ValueError("ANTHROPIC_API_KEY not configured")

        await self.initialize()

        # Build messages
        messages = self.conversation_history[history_key].copy()
        messages.append({"role": "user", "content": user_message})

        # Call Anthropic API
        headers = {
            "anthropic-version": "2023-06-01",
            "x-api-key": ANTHROPIC_API_KEY,
            "content-type": "application/json",
        }

        payload = {
            "model": self.model,
            "max_tokens": config.get("max_tokens", 150),
            "temperature": config.get("temperature", 0.7),
            "system": system_prompt,
            "messages": messages,
        }

        async with self.session.post(
            "https://api.anthropic.com/v1/messages",
            headers=headers,
            json=payload
        ) as resp:
            if resp.status != 200:
                error_text = await resp.text()
                raise Exception(f"Anthropic API error: {resp.status} - {error_text}")

            data = await resp.json()
            return data["content"][0]["text"]

    async def _openai_generate(
        self,
        system_prompt: str,
        user_message: str,
        history_key: str,
        config: Dict[str, Any]
    ) -> str:
        """Generate response using OpenAI GPT API."""
        if not OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY not configured")

        await self.initialize()

        # Build messages
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(self.conversation_history[history_key])
        messages.append({"role": "user", "content": user_message})

        # Call OpenAI API
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": self.model,
            "max_tokens": config.get("max_tokens", 150),
            "temperature": config.get("temperature", 0.7),
            "messages": messages,
        }

        async with self.session.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=payload
        ) as resp:
            if resp.status != 200:
                error_text = await resp.text()
                raise Exception(f"OpenAI API error: {resp.status} - {error_text}")

            data = await resp.json()
            return data["choices"][0]["message"]["content"]

    async def _ollama_generate(
        self,
        system_prompt: str,
        user_message: str,
        history_key: str,
        config: Dict[str, Any]
    ) -> str:
        """Generate response using Ollama (local LLM)."""
        await self.initialize()

        # Build messages
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(self.conversation_history[history_key])
        messages.append({"role": "user", "content": user_message})

        # Call Ollama API
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": config.get("temperature", 0.7),
                "num_predict": config.get("max_tokens", 150),
            }
        }

        async with self.session.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json=payload
        ) as resp:
            if resp.status != 200:
                error_text = await resp.text()
                raise Exception(f"Ollama API error: {resp.status} - {error_text}")

            data = await resp.json()
            return data["message"]["content"]

    async def _custom_generate(
        self,
        system_prompt: str,
        user_message: str,
        history_key: str,
        config: Dict[str, Any]
    ) -> str:
        """Generate response using custom LLM endpoint."""
        if not CUSTOM_LLM_ENDPOINT:
            raise ValueError("CUSTOM_LLM_ENDPOINT not configured")

        await self.initialize()

        # Build messages (OpenAI-compatible format)
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(self.conversation_history[history_key])
        messages.append({"role": "user", "content": user_message})

        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": config.get("max_tokens", 150),
            "temperature": config.get("temperature", 0.7),
        }

        async with self.session.post(
            CUSTOM_LLM_ENDPOINT,
            json=payload
        ) as resp:
            if resp.status != 200:
                error_text = await resp.text()
                raise Exception(f"Custom LLM API error: {resp.status} - {error_text}")

            data = await resp.json()
            # Try OpenAI format first, fallback to other common formats
            if "choices" in data:
                return data["choices"][0]["message"]["content"]
            elif "response" in data:
                return data["response"]
            elif "text" in data:
                return data["text"]
            else:
                raise Exception(f"Unknown response format from custom LLM: {data}")

    def _format_context(self, context: Dict[str, Any]) -> str:
        """Format context dictionary into readable text."""
        lines = []
        for key, value in context.items():
            lines.append(f"- {key}: {value}")
        return "\n".join(lines)

    def clear_history(self, session_id: str, agent_id: str = None):
        """Clear conversation history for a session."""
        if agent_id:
            history_key = f"{session_id}:{agent_id}"
            if history_key in self.conversation_history:
                del self.conversation_history[history_key]
        else:
            # Clear all history for this session
            keys_to_delete = [k for k in self.conversation_history.keys() if k.startswith(f"{session_id}:")]
            for key in keys_to_delete:
                del self.conversation_history[key]


# Global LLM engine instance
llm_engine: Optional[LLMAgentEngine] = None


def get_llm_engine() -> Optional[LLMAgentEngine]:
    """Get the global LLM engine instance."""
    return llm_engine


async def initialize_llm_engine(provider: str = None, model: str = None):
    """Initialize the global LLM engine."""
    global llm_engine
    llm_engine = LLMAgentEngine(provider, model)
    await llm_engine.initialize()
    logger.info(f"✅ Global LLM Agent Engine initialized (provider={llm_engine.provider})")
    return llm_engine


async def shutdown_llm_engine():
    """Shutdown the global LLM engine."""
    global llm_engine
    if llm_engine:
        await llm_engine.close()
        llm_engine = None
        logger.info("✅ LLM Agent Engine shutdown complete")
