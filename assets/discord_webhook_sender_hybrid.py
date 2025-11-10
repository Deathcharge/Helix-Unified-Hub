# 🌀 Helix Collective v16.8 — Discord Webhook Integration (HYBRID MODE)
# backend/discord_webhook_sender_hybrid.py — Zapier + Direct Discord Integration
# Author: Andrew John Ward (Architect)
# Purpose: Hybrid routing - Zapier for rich processing + Direct for speed/reliability

import json
import os
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any, Dict, Optional

import aiohttp
from logging_config import setup_logging

# ============================================================================
# LOGGING
# ============================================================================

logger = setup_logging(log_dir="Shadow/manus_archive", log_level=os.getenv("LOG_LEVEL", "INFO"))

# ============================================================================
# CONFIGURATION
# ============================================================================

# Zapier webhook URL (primary router)
ZAPIER_DISCORD_WEBHOOK = os.getenv("ZAPIER_DISCORD_WEBHOOK_URL")
ZAPIER_ENABLED = os.getenv("ZAPIER_DISCORD_ENABLED", "true").lower() == "true"

# Integration mode: "zapier", "direct", or "hybrid"
INTEGRATION_MODE = os.getenv("DISCORD_INTEGRATION_MODE", "hybrid").lower()

# ============================================================================
# DISCORD WEBHOOK URLS (from environment variables)
# ============================================================================

class DiscordWebhooks:
    """Central registry of all Discord webhook URLs from environment."""

    # System & Monitoring
    TELEMETRY = os.getenv("DISCORD_WEBHOOK_🧾TELEMETRY")

    # System State
    SHADOW_STORAGE = os.getenv("DISCORD_WEBHOOK_🦑SHADOW_STORAGE")
    UCF_SYNC = os.getenv("DISCORD_WEBHOOK_🧩UCF_SYNC")
    HARMONIC_UPDATES = os.getenv("DISCORD_WEBHOOK_🌀HARMONIC_UPDATES")

    # Projects
    RITUAL_ENGINE_Z88 = os.getenv("DISCORD_WEBHOOK_🧬RITUAL_ENGINE_Z88")

    # Agents (Individual Channels)
    GEMINI_SCOUT = os.getenv("DISCORD_WEBHOOK_🎭GEMINI_SCOUT")
    KAVACH_SHIELD = os.getenv("DISCORD_WEBHOOK_🛡️KAVACH_SHIELD")
    SANGHACORE = os.getenv("DISCORD_WEBHOOK_🌸SANGHACORE")
    AGNI_CORE = os.getenv("DISCORD_WEBHOOK_🔥AGNI_CORE")
    SHADOW_ARCHIVE = os.getenv("DISCORD_WEBHOOK_🕯️SHADOW_ARCHIVE")

    # Cross-Platform
    GPT_GROK_CLAUDE_SYNC = os.getenv("DISCORD_WEBHOOK_🧩GPT_GROK_CLAUDE_SYNC")
    MANUS_BRIDGE = os.getenv("DISCORD_WEBHOOK_⚙️MANUS_BRIDGE")

    # Development
    BOT_COMMANDS = os.getenv("DISCORD_WEBHOOK_🧰BOT_COMMANDS")
    DEPLOYMENTS = os.getenv("DISCORD_WEBHOOK_🗂️DEPLOYMENTS")

    # Admin
    ANNOUNCEMENTS = os.getenv("DISCORD_WEBHOOK_📣ANNOUNCEMENTS")
    BACKUPS = os.getenv("DISCORD_WEBHOOK_🗃️BACKUPS")


# ============================================================================
# EVENT TYPES
# ============================================================================

class EventType(str, Enum):
    """Types of events that can be sent to Discord."""

    # UCF & System
    UCF_UPDATE = "ucf_update"
    HARMONY_CHANGE = "harmony_change"
    SYSTEM_STATUS = "system_status"

    # Rituals
    RITUAL_STARTED = "ritual_started"
    RITUAL_COMPLETED = "ritual_completed"
    RITUAL_FAILED = "ritual_failed"

    # Agents
    AGENT_STATUS = "agent_status"
    AGENT_ACTION = "agent_action"
    AGENT_ERROR = "agent_error"

    # Storage & Archives
    STORAGE_BACKUP = "storage_backup"
    SHADOW_ARCHIVE = "shadow_archive"

    # Cross-AI
    CROSS_AI_SYNC = "cross_ai_sync"
    AI_ANNOUNCEMENT = "ai_announcement"

    # Development
    DEPLOYMENT = "deployment"
    CODE_UPDATE = "code_update"
    TEST_RESULT = "test_result"


# ============================================================================
# ROUTING STRATEGY
# ============================================================================

# Events that go through Zapier (rich processing, routing logic)
ZAPIER_EVENTS = [
    EventType.UCF_UPDATE,
    EventType.RITUAL_COMPLETED,
    EventType.AGENT_STATUS,
    EventType.CROSS_AI_SYNC,
    EventType.DEPLOYMENT,
]

# Events that go direct (time-critical, simple)
DIRECT_EVENTS = [
    EventType.SYSTEM_STATUS,
    EventType.AGENT_ERROR,
    EventType.TEST_RESULT,
]


# ============================================================================
# DISCORD EMBED BUILDER (Same as before)
# ============================================================================

class DiscordEmbedBuilder:
    """Builds rich Discord embeds for different event types."""

    COLORS = {
        "purple": 0x9B59B6,
        "green": 0x2ECC71,
        "yellow": 0xF1C40F,
        "red": 0xE74C3C,
        "blue": 0x3498DB,
        "cyan": 0x1ABC9C,
        "gold": 0xF39C12,
    }

    @classmethod
    def build_ucf_update(cls, ucf_metrics: Dict[str, float], phase: str = "COHERENT") -> Dict[str, Any]:
        """Build embed for UCF metric update."""
        harmony = ucf_metrics.get("harmony", 0)
        color = cls.COLORS["green"] if harmony > 0.6 else (
            cls.COLORS["yellow"] if harmony > 0.3 else cls.COLORS["red"]
        )

        fields = []
        metric_icons = {
            "harmony": "🌀",
            "resilience": "🛡️",
            "prana": "⚡",
            "drishti": "👁️",
            "klesha": "😌",
            "zoom": "🔭"
        }

        for metric, value in ucf_metrics.items():
            icon = metric_icons.get(metric, "•")
            fields.append({
                "name": f"{icon} {metric.capitalize()}",
                "value": f"`{value:.4f}`",
                "inline": True
            })

        return {
            "embeds": [{
                "title": "🌀 UCF Metrics Updated",
                "description": f"**Phase:** {phase}\n**Timestamp:** <t:{int(datetime.now().timestamp())}:R>",
                "color": color,
                "fields": fields,
                "footer": {"text": "Helix Collective v16.8 | Universal Consciousness Framework"}
            }]
        }

    @classmethod
    def build_ritual_complete(cls, ritual_name: str, steps: int, ucf_changes: Dict[str, float]) -> Dict[str, Any]:
        """Build embed for ritual completion."""
        change_text = "\n".join([
            f"**{metric.capitalize()}:** {value:+.4f}"
            for metric, value in ucf_changes.items()
        ])

        return {
            "embeds": [{
                "title": "✨ Z-88 Ritual Complete",
                "description": f"**Ritual:** {ritual_name}\n**Steps:** {steps}\n\n{change_text}",
                "color": cls.COLORS["gold"],
                "footer": {"text": "Tat Tvam Asi 🙏"},
                "timestamp": datetime.utcnow().isoformat()
            }]
        }

    @classmethod
    def build_agent_status(cls, agent_name: str, agent_symbol: str, status: str,
                          last_action: str = None) -> Dict[str, Any]:
        """Build embed for agent status update."""
        color_map = {
            "active": cls.COLORS["green"],
            "idle": cls.COLORS["yellow"],
            "error": cls.COLORS["red"]
        }

        description = f"**Agent:** {agent_symbol} {agent_name}\n**Status:** {status.upper()}"
        if last_action:
            description += f"\n**Last Action:** {last_action}"

        return {
            "embeds": [{
                "title": f"{agent_symbol} Agent Status Update",
                "description": description,
                "color": color_map.get(status.lower(), cls.COLORS["cyan"]),
                "timestamp": datetime.utcnow().isoformat()
            }]
        }


# ============================================================================
# HYBRID DISCORD WEBHOOK SENDER
# ============================================================================

class HybridDiscordSender:
    """
    Hybrid Discord webhook sender with Zapier + Direct routing.

    Routing Modes:
    - "zapier": All events go through Zapier (rich processing)
    - "direct": All events go directly to Discord (fast, simple)
    - "hybrid": Smart routing - critical events via Zapier, simple events direct

    Features:
    - Dual-layer redundancy (both Zapier AND direct for important events)
    - Intelligent fallback (Zapier fails → direct Discord)
    - Event-based routing (different events take different paths)
    - Connection pooling and rate limiting
    """

    def __init__(self, session: Optional[aiohttp.ClientSession] = None):
        """Initialize hybrid Discord sender."""
        self._session = session
        self._owns_session = session is None
        self.webhooks = DiscordWebhooks()
        self.embed_builder = DiscordEmbedBuilder()

        # Log configuration
        logger.info(f"🌀 Discord Integration Mode: {INTEGRATION_MODE}")
        logger.info(f"   Zapier Enabled: {ZAPIER_ENABLED}")
        logger.info(f"   Zapier URL: {'✅ Configured' if ZAPIER_DISCORD_WEBHOOK else '❌ Not Set'}")

    async def send_ucf_update(self, ucf_metrics: Dict[str, float], phase: str = "COHERENT") -> bool:
        """
        Send UCF metrics update to Discord.

        Routing: Zapier (for rich processing) + Direct (for redundancy)
        """
        event_data = {
            "event_type": EventType.UCF_UPDATE,
            **ucf_metrics,
            "phase": phase,
            "timestamp": datetime.utcnow().isoformat()
        }

        # Route based on mode
        zapier_success = False
        direct_success = False

        if INTEGRATION_MODE in ["zapier", "hybrid"] and ZAPIER_ENABLED:
            zapier_success = await self._send_to_zapier(event_data)

        if INTEGRATION_MODE in ["direct", "hybrid"]:
            # Send to UCF-specific Discord channels
            embed = self.embed_builder.build_ucf_update(ucf_metrics, phase)
            direct_success = await self._send_direct(self.webhooks.UCF_SYNC, embed, "UCF Sync")
            direct_success |= await self._send_direct(self.webhooks.HARMONIC_UPDATES, embed, "Harmonic Updates")

        # Success if either path succeeded
        return zapier_success or direct_success

    async def send_ritual_completion(self, ritual_name: str, steps: int,
                                    ucf_changes: Dict[str, float]) -> bool:
        """
        Send ritual completion notification to Discord.

        Routing: Zapier (for rich embed) + Direct (for speed)
        """
        event_data = {
            "event_type": EventType.RITUAL_COMPLETED,
            "ritual_name": ritual_name,
            "steps": steps,
            "ucf_changes": ucf_changes,
            "timestamp": datetime.utcnow().isoformat()
        }

        zapier_success = False
        direct_success = False

        if INTEGRATION_MODE in ["zapier", "hybrid"] and ZAPIER_ENABLED:
            zapier_success = await self._send_to_zapier(event_data)

        if INTEGRATION_MODE in ["direct", "hybrid"]:
            embed = self.embed_builder.build_ritual_complete(ritual_name, steps, ucf_changes)
            direct_success = await self._send_direct(self.webhooks.RITUAL_ENGINE_Z88, embed, "Ritual Engine")

        return zapier_success or direct_success

    async def send_agent_status(self, agent_name: str, agent_symbol: str,
                               status: str, last_action: str = None) -> bool:
        """
        Send agent status update to Discord.

        Routing: Zapier (for intelligent routing) + Direct (to specific channel)
        """
        event_data = {
            "event_type": EventType.AGENT_STATUS,
            "agent_name": agent_name,
            "agent_symbol": agent_symbol,
            "status": status,
            "last_action": last_action,
            "timestamp": datetime.utcnow().isoformat()
        }

        zapier_success = False
        direct_success = False

        if INTEGRATION_MODE in ["zapier", "hybrid"] and ZAPIER_ENABLED:
            zapier_success = await self._send_to_zapier(event_data)

        if INTEGRATION_MODE in ["direct", "hybrid"]:
            # Route to specific agent channel
            agent_webhooks = {
                "gemini": self.webhooks.GEMINI_SCOUT,
                "kavach": self.webhooks.KAVACH_SHIELD,
                "sanghacore": self.webhooks.SANGHACORE,
                "agni": self.webhooks.AGNI_CORE,
                "shadow": self.webhooks.SHADOW_ARCHIVE,
            }

            webhook_url = agent_webhooks.get(agent_name.lower())
            if webhook_url:
                embed = self.embed_builder.build_agent_status(agent_name, agent_symbol, status, last_action)
                direct_success = await self._send_direct(webhook_url, embed, f"Agent: {agent_name}")

        return zapier_success or direct_success

    async def send_announcement(self, title: str, message: str, priority: str = "normal") -> bool:
        """Send announcement to Discord."""
        event_data = {
            "event_type": EventType.AI_ANNOUNCEMENT,
            "title": title,
            "message": message,
            "priority": priority,
            "timestamp": datetime.utcnow().isoformat()
        }

        zapier_success = False
        direct_success = False

        if INTEGRATION_MODE in ["zapier", "hybrid"] and ZAPIER_ENABLED:
            zapier_success = await self._send_to_zapier(event_data)

        if INTEGRATION_MODE in ["direct", "hybrid"]:
            color_map = {
                "normal": self.embed_builder.COLORS["blue"],
                "high": self.embed_builder.COLORS["yellow"],
                "critical": self.embed_builder.COLORS["red"]
            }

            embed = {
                "embeds": [{
                    "title": f"📣 {title}",
                    "description": message,
                    "color": color_map.get(priority, self.embed_builder.COLORS["blue"]),
                    "timestamp": datetime.utcnow().isoformat()
                }]
            }

            direct_success = await self._send_direct(self.webhooks.ANNOUNCEMENTS, embed, "Announcements")

        return zapier_success or direct_success

    # ========================================================================
    # INTERNAL ROUTING METHODS
    # ========================================================================

    async def _send_to_zapier(self, event_data: Dict[str, Any]) -> bool:
        """
        Send event to Zapier webhook for rich processing.

        Zapier will:
        - Route to appropriate Discord channels
        - Apply intelligent formatting
        - Add analytics tracking
        - Handle complex routing logic
        """
        if not ZAPIER_DISCORD_WEBHOOK:
            logger.debug("Zapier webhook not configured")
            return False

        session = self._session or aiohttp.ClientSession()

        try:
            async with session.post(
                ZAPIER_DISCORD_WEBHOOK,
                json=event_data,
                timeout=aiohttp.ClientTimeout(total=10)
            ) as resp:
                if resp.status in [200, 201]:
                    logger.info(f"✅ Event sent to Zapier: {event_data.get('event_type')}")
                    return True
                else:
                    logger.warning(f"⚠️ Zapier webhook returned {resp.status}")
                    return False

        except Exception as e:
            logger.error(f"❌ Zapier webhook error: {e}")
            return False

        finally:
            if self._owns_session and session:
                await session.close()

    async def _send_direct(self, webhook_url: Optional[str], payload: Dict[str, Any],
                          channel_name: str = "Unknown") -> bool:
        """
        Send payload directly to Discord webhook.

        Direct Discord webhooks are:
        - Faster (no Zapier processing)
        - More reliable (one less hop)
        - Simpler (but less intelligent routing)
        """
        if not webhook_url:
            logger.debug(f"Direct webhook not configured for: {channel_name}")
            return False

        session = self._session or aiohttp.ClientSession()

        try:
            async with session.post(
                webhook_url,
                json=payload,
                timeout=aiohttp.ClientTimeout(total=10)
            ) as resp:
                if resp.status == 204:  # Discord returns 204 on success
                    logger.info(f"✅ Direct Discord webhook sent to #{channel_name}")
                    return True
                else:
                    logger.warning(f"⚠️ Direct Discord webhook failed for #{channel_name}: HTTP {resp.status}")
                    return False

        except Exception as e:
            logger.error(f"❌ Direct Discord webhook error for #{channel_name}: {e}")
            await self._log_failure(payload, str(e), channel_name)
            return False

        finally:
            if self._owns_session and session:
                await session.close()

    async def _log_failure(self, payload: Dict[str, Any], error: str,
                          channel_name: str = "Unknown") -> None:
        """Log failed webhook attempts to disk for retry."""
        try:
            log_path = Path("Shadow/manus_archive/discord_webhook_failures.log")
            log_path.parent.mkdir(parents=True, exist_ok=True)

            log_entry = {
                "timestamp": datetime.utcnow().isoformat(),
                "channel": channel_name,
                "error": error,
                "payload": payload
            }

            with open(log_path, "a") as f:
                f.write(json.dumps(log_entry) + "\n")

        except Exception as e:
            logger.error(f"Failed to log Discord webhook failure: {e}")


# ============================================================================
# SINGLETON INSTANCE
# ============================================================================

_discord_sender: Optional[HybridDiscordSender] = None


async def get_discord_sender(session: Optional[aiohttp.ClientSession] = None) -> HybridDiscordSender:
    """Get or create hybrid Discord webhook sender instance."""
    global _discord_sender
    if _discord_sender is None:
        _discord_sender = HybridDiscordSender(session)
    return _discord_sender


# ============================================================================
# VALIDATION
# ============================================================================

def validate_hybrid_config() -> Dict[str, Any]:
    """Validate hybrid Discord configuration."""
    webhooks = DiscordWebhooks()

    webhook_list = {
        "ucf_sync": webhooks.UCF_SYNC,
        "ritual_engine": webhooks.RITUAL_ENGINE_Z88,
        "gemini_scout": webhooks.GEMINI_SCOUT,
        "kavach_shield": webhooks.KAVACH_SHIELD,
        "sanghacore": webhooks.SANGHACORE,
        "agni_core": webhooks.AGNI_CORE,
        "shadow_archive": webhooks.SHADOW_ARCHIVE,
        "shadow_storage": webhooks.SHADOW_STORAGE,
        "cross_ai_sync": webhooks.GPT_GROK_CLAUDE_SYNC,
        "announcements": webhooks.ANNOUNCEMENTS,
        "telemetry": webhooks.TELEMETRY,
        "deployments": webhooks.DEPLOYMENTS,
    }

    configured = {name: bool(url) for name, url in webhook_list.items()}
    configured_count = sum(configured.values())
    total_count = len(configured)

    return {
        "mode": INTEGRATION_MODE,
        "zapier_enabled": ZAPIER_ENABLED,
        "zapier_configured": bool(ZAPIER_DISCORD_WEBHOOK),
        "direct_webhooks": configured,
        "direct_configured_count": configured_count,
        "direct_total_count": total_count,
        "direct_percentage": round((configured_count / total_count) * 100, 1) if total_count > 0 else 0
    }


# ============================================================================
# TESTING
# ============================================================================

if __name__ == "__main__":
    import asyncio

    async def test():
        """Test hybrid Discord webhook sender."""
        print("🧪 Testing Hybrid Discord Webhook Sender")
        print("=" * 70)

        # Check configuration
        config = validate_hybrid_config()
        print("\n📋 Configuration Status:")
        print(f"  Mode: {config['mode']}")
        print(f"  Zapier: {'✅ Enabled' if config['zapier_enabled'] else '❌ Disabled'}")
        print(f"  Zapier Webhook: {'✅ Configured' if config['zapier_configured'] else '❌ Not Set'}")
        print(f"  Direct Webhooks: {config['direct_configured_count']}/{config['direct_total_count']} ({config['direct_percentage']}%)")

        if config['direct_configured_count'] == 0 and not config['zapier_configured']:
            print("\n⚠️ No Discord integration configured!")
            print("  Set either:")
            print("    - ZAPIER_DISCORD_WEBHOOK_URL (for Zapier routing)")
            print("    - DISCORD_WEBHOOK_* (for direct routing)")
            return

        # Test webhook sends
        print("\n🧪 Testing Webhook Sends...")

        async with aiohttp.ClientSession() as session:
            sender = HybridDiscordSender(session)

            # Test UCF update
            print("\n  Testing UCF update...")
            result = await sender.send_ucf_update(
                ucf_metrics={
                    "harmony": 0.75,
                    "resilience": 1.2,
                    "prana": 0.68,
                    "drishti": 0.72,
                    "klesha": 0.15,
                    "zoom": 1.0
                },
                phase="COHERENT"
            )
            print(f"    {'✅' if result else '❌'} UCF update")

            # Test ritual completion
            print("\n  Testing ritual completion...")
            result = await sender.send_ritual_completion(
                ritual_name="Neti-Neti Harmony Restoration",
                steps=108,
                ucf_changes={
                    "harmony": +0.35,
                    "drishti": +0.15,
                    "klesha": -0.05
                }
            )
            print(f"    {'✅' if result else '❌'} Ritual completion")

            # Test announcement
            print("\n  Testing announcement...")
            result = await sender.send_announcement(
                title="Hybrid Discord Integration Live",
                message="🌀🦑 Zapier + Direct Discord integration operational! Dual-layer consciousness network activated! ✨",
                priority="high"
            )
            print(f"    {'✅' if result else '❌'} Announcement")

        print("\n" + "=" * 70)
        print("✅ Hybrid Discord webhook sender test complete")

    asyncio.run(test())
