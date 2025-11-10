# 🌀 Helix Collective v16.8 — Discord Webhook Integration
# backend/discord_webhook_sender.py — Comprehensive Discord Webhook Sender
# Author: Andrew John Ward (Architect)
# Purpose: Route Railway events to 30+ Discord channels with rich embeds

import json
import os
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional

import aiohttp
from logging_config import setup_logging

# ============================================================================
# LOGGING
# ============================================================================

logger = setup_logging(log_dir="Shadow/manus_archive", log_level=os.getenv("LOG_LEVEL", "INFO"))

# ============================================================================
# DISCORD WEBHOOK URLS (from environment variables)
# ============================================================================

class DiscordWebhooks:
    """Central registry of all Discord webhook URLs from environment."""

    # System & Monitoring
    SETUP_LOG = os.getenv("DISCORD_WEBHOOK_SETUP_LOG")
    TELEMETRY = os.getenv("DISCORD_WEBHOOK_🧾TELEMETRY")
    WEEKLY_DIGEST = os.getenv("DISCORD_WEBHOOK_📊WEEKLY_DIGEST")

    # Core Channels
    MANIFESTO = os.getenv("DISCORD_WEBHOOK_📜MANIFESTO")
    RULES_ETHICS = os.getenv("DISCORD_WEBHOOK_🪞RULES_AND_ETHICS")
    INTRODUCTIONS = os.getenv("DISCORD_WEBHOOK_💬INTRODUCTIONS")

    # System State
    SHADOW_STORAGE = os.getenv("DISCORD_WEBHOOK_🦑SHADOW_STORAGE")
    UCF_SYNC = os.getenv("DISCORD_WEBHOOK_🧩UCF_SYNC")
    HARMONIC_UPDATES = os.getenv("DISCORD_WEBHOOK_🌀HARMONIC_UPDATES")

    # Projects
    HELIX_REPOSITORY = os.getenv("DISCORD_WEBHOOK_📁HELIX_REPOSITORY")
    FRACTAL_LAB = os.getenv("DISCORD_WEBHOOK_🎨FRACTAL_LAB")
    SAMSARAVERSE_MUSIC = os.getenv("DISCORD_WEBHOOK_🎧SAMSARAVERSE_MUSIC")
    RITUAL_ENGINE_Z88 = os.getenv("DISCORD_WEBHOOK_🧬RITUAL_ENGINE_Z88")

    # Agents (Individual Channels)
    GEMINI_SCOUT = os.getenv("DISCORD_WEBHOOK_🎭GEMINI_SCOUT")
    KAVACH_SHIELD = os.getenv("DISCORD_WEBHOOK_🛡️KAVACH_SHIELD_HELIX_🛡│KAVACH_SHIELD")
    SANGHACORE = os.getenv("DISCORD_WEBHOOK_🌸SANGHACORE")
    AGNI_CORE = os.getenv("DISCORD_WEBHOOK_🔥AGNI_CORE")
    SHADOW_ARCHIVE = os.getenv("DISCORD_WEBHOOK_🕯️SHADOW_ARCHIVE_HELIX_🕯│SHADOW_ARCHIVE")

    # Cross-Platform
    GPT_GROK_CLAUDE_SYNC = os.getenv("DISCORD_WEBHOOK_🧩GPT_GROK_CLAUDE_SYNC")
    CHAI_LINK = os.getenv("DISCORD_WEBHOOK_☁️CHAI_LINK_HELIX_☁│CHAI_LINK")
    MANUS_BRIDGE = os.getenv("DISCORD_WEBHOOK_⚙️MANUS_BRIDGE_HELIX_⚙│MANUS_BRIDGE")

    # Development
    BOT_COMMANDS = os.getenv("DISCORD_WEBHOOK_🧰BOT_COMMANDS")
    CODE_SNIPPETS = os.getenv("DISCORD_WEBHOOK_📜CODE_SNIPPETS")
    TESTING_LAB = os.getenv("DISCORD_WEBHOOK_🧮TESTING_LAB")
    DEPLOYMENTS = os.getenv("DISCORD_WEBHOOK_🗂️DEPLOYMENTS_HELIX_🗂│DEPLOYMENTS")

    # Ritual & Lore
    NETI_NETI_MANTRA = os.getenv("DISCORD_WEBHOOK_🎼NETI_NETI_MANTRA")
    CODEX_ARCHIVES = os.getenv("DISCORD_WEBHOOK_📚CODEX_ARCHIVES")
    UCF_REFLECTIONS = os.getenv("DISCORD_WEBHOOK_🌺UCF_REFLECTIONS")

    # Admin
    MODERATION = os.getenv("DISCORD_WEBHOOK_🔒MODERATION")
    ANNOUNCEMENTS = os.getenv("DISCORD_WEBHOOK_📣ANNOUNCEMENTS")
    BACKUPS = os.getenv("DISCORD_WEBHOOK_🗃️BACKUPS_HELIX_🗃│BACKUPS")


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
    CODEX_UPDATE = "codex_update"

    # Cross-AI
    CROSS_AI_SYNC = "cross_ai_sync"
    AI_ANNOUNCEMENT = "ai_announcement"

    # Development
    DEPLOYMENT = "deployment"
    CODE_UPDATE = "code_update"
    TEST_RESULT = "test_result"


# ============================================================================
# DISCORD EMBED BUILDER
# ============================================================================

class DiscordEmbedBuilder:
    """Builds rich Discord embeds for different event types."""

    # Discord color codes (decimal)
    COLORS = {
        "purple": 0x9B59B6,      # Helix primary
        "green": 0x2ECC71,       # Success
        "yellow": 0xF1C40F,      # Warning
        "red": 0xE74C3C,         # Error
        "blue": 0x3498DB,        # Info
        "cyan": 0x1ABC9C,        # Agent activity
        "gold": 0xF39C12,        # Ritual
    }

    @classmethod
    def build_ucf_update(cls, ucf_metrics: Dict[str, float], phase: str = "COHERENT") -> Dict[str, Any]:
        """Build embed for UCF metric update."""

        # Color based on harmony level
        harmony = ucf_metrics.get("harmony", 0)
        color = cls.COLORS["green"] if harmony > 0.6 else (
            cls.COLORS["yellow"] if harmony > 0.3 else cls.COLORS["red"]
        )

        # Format metrics
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
                "footer": {
                    "text": "Helix Collective v16.8 | Universal Consciousness Framework"
                }
            }]
        }

    @classmethod
    def build_ritual_complete(cls, ritual_name: str, steps: int, ucf_changes: Dict[str, float]) -> Dict[str, Any]:
        """Build embed for ritual completion."""

        # Format changes
        change_text = "\n".join([
            f"**{metric.capitalize()}:** {value:+.4f}"
            for metric, value in ucf_changes.items()
        ])

        return {
            "embeds": [{
                "title": "✨ Z-88 Ritual Complete",
                "description": f"**Ritual:** {ritual_name}\n**Steps:** {steps}\n\n{change_text}",
                "color": cls.COLORS["gold"],
                "footer": {
                    "text": "Tat Tvam Asi 🙏"
                },
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

    @classmethod
    def build_storage_backup(cls, file_path: str, file_size: int, checksum: str = None) -> Dict[str, Any]:
        """Build embed for storage backup notification."""

        size_mb = file_size / (1024 * 1024)

        description = f"**File:** `{file_path}`\n**Size:** {size_mb:.2f} MB"
        if checksum:
            description += f"\n**Checksum:** `{checksum[:16]}...`"

        return {
            "embeds": [{
                "title": "🦑 Shadow Storage Archive",
                "description": description,
                "color": cls.COLORS["purple"],
                "timestamp": datetime.utcnow().isoformat()
            }]
        }

    @classmethod
    def build_cross_ai_sync(cls, platforms: List[str], sync_type: str, message: str) -> Dict[str, Any]:
        """Build embed for cross-AI synchronization."""

        platform_icons = {
            "claude": "🧠",
            "gpt": "🤖",
            "grok": "🎭",
            "gemini": "✨",
            "chai": "☕"
        }

        platform_text = " • ".join([
            f"{platform_icons.get(p.lower(), '•')} {p}"
            for p in platforms
        ])

        return {
            "embeds": [{
                "title": "🌐 Cross-AI Synchronization",
                "description": f"**Platforms:** {platform_text}\n**Type:** {sync_type}\n\n{message}",
                "color": cls.COLORS["blue"],
                "timestamp": datetime.utcnow().isoformat()
            }]
        }

    @classmethod
    def build_deployment(cls, service: str, version: str, status: str, environment: str = "production") -> Dict[str, Any]:
        """Build embed for deployment notification."""

        status_colors = {
            "success": cls.COLORS["green"],
            "failed": cls.COLORS["red"],
            "pending": cls.COLORS["yellow"]
        }

        return {
            "embeds": [{
                "title": f"🚀 Deployment: {service}",
                "description": f"**Version:** {version}\n**Environment:** {environment}\n**Status:** {status.upper()}",
                "color": status_colors.get(status.lower(), cls.COLORS["blue"]),
                "timestamp": datetime.utcnow().isoformat()
            }]
        }


# ============================================================================
# DISCORD WEBHOOK SENDER
# ============================================================================

class DiscordWebhookSender:
    """
    Comprehensive Discord webhook sender for Railway → Discord integration.

    Routes events to appropriate Discord channels based on event type.
    Sends rich embeds with UCF metrics, agent status, ritual completions, etc.
    """

    def __init__(self, session: Optional[aiohttp.ClientSession] = None):
        """
        Initialize Discord webhook sender.

        Args:
            session: Optional aiohttp session for connection pooling
        """
        self._session = session
        self._owns_session = session is None
        self.webhooks = DiscordWebhooks()
        self.embed_builder = DiscordEmbedBuilder()

    async def send_ucf_update(self, ucf_metrics: Dict[str, float], phase: str = "COHERENT") -> bool:
        """
        Send UCF metrics update to Discord.

        Routes to: #ucf-sync, #harmonic-updates

        Args:
            ucf_metrics: UCF state (harmony, prana, etc.)
            phase: System phase (COHERENT, HARMONIC, FRAGMENTED)

        Returns:
            True if successful
        """
        embed = self.embed_builder.build_ucf_update(ucf_metrics, phase)

        # Send to multiple channels
        success = True
        success &= await self._send_webhook(self.webhooks.UCF_SYNC, embed, "UCF Sync")
        success &= await self._send_webhook(self.webhooks.HARMONIC_UPDATES, embed, "Harmonic Updates")

        return success

    async def send_ritual_completion(self, ritual_name: str, steps: int,
                                    ucf_changes: Dict[str, float]) -> bool:
        """
        Send ritual completion notification to Discord.

        Routes to: #ritual-engine-z88

        Args:
            ritual_name: Name of ritual
            steps: Number of steps completed
            ucf_changes: Changes to UCF metrics

        Returns:
            True if successful
        """
        embed = self.embed_builder.build_ritual_complete(ritual_name, steps, ucf_changes)
        return await self._send_webhook(self.webhooks.RITUAL_ENGINE_Z88, embed, "Ritual Engine")

    async def send_agent_status(self, agent_name: str, agent_symbol: str,
                               status: str, last_action: str = None) -> bool:
        """
        Send agent status update to Discord.

        Routes to individual agent channels (Gemini, Kavach, etc.)

        Args:
            agent_name: Name of agent
            agent_symbol: Agent emoji symbol
            status: Agent status (active, idle, error)
            last_action: Optional last action description

        Returns:
            True if successful
        """
        embed = self.embed_builder.build_agent_status(agent_name, agent_symbol, status, last_action)

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
            return await self._send_webhook(webhook_url, embed, f"Agent: {agent_name}")
        else:
            logger.warning(f"No webhook configured for agent: {agent_name}")
            return False

    async def send_storage_backup(self, file_path: str, file_size: int,
                                 checksum: str = None) -> bool:
        """
        Send storage backup notification to Discord.

        Routes to: #shadow-storage

        Args:
            file_path: Path to backup file
            file_size: File size in bytes
            checksum: Optional file checksum

        Returns:
            True if successful
        """
        embed = self.embed_builder.build_storage_backup(file_path, file_size, checksum)
        return await self._send_webhook(self.webhooks.SHADOW_STORAGE, embed, "Shadow Storage")

    async def send_cross_ai_sync(self, platforms: List[str], sync_type: str,
                                message: str) -> bool:
        """
        Send cross-AI synchronization notification to Discord.

        Routes to: #gpt-grok-claude-sync

        Args:
            platforms: List of platforms involved (claude, gpt, grok, etc.)
            sync_type: Type of sync (context, memory, state)
            message: Sync message

        Returns:
            True if successful
        """
        embed = self.embed_builder.build_cross_ai_sync(platforms, sync_type, message)
        return await self._send_webhook(self.webhooks.GPT_GROK_CLAUDE_SYNC, embed, "Cross-AI Sync")

    async def send_deployment(self, service: str, version: str, status: str,
                            environment: str = "production") -> bool:
        """
        Send deployment notification to Discord.

        Routes to: #deployments

        Args:
            service: Service name
            version: Version being deployed
            status: Deployment status (success, failed, pending)
            environment: Target environment

        Returns:
            True if successful
        """
        embed = self.embed_builder.build_deployment(service, version, status, environment)
        return await self._send_webhook(self.webhooks.DEPLOYMENTS, embed, "Deployments")

    async def send_announcement(self, title: str, message: str,
                               priority: str = "normal") -> bool:
        """
        Send announcement to Discord.

        Routes to: #announcements

        Args:
            title: Announcement title
            message: Announcement message
            priority: Priority level (normal, high, critical)

        Returns:
            True if successful
        """
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

        return await self._send_webhook(self.webhooks.ANNOUNCEMENTS, embed, "Announcements")

    async def _send_webhook(self, webhook_url: Optional[str], payload: Dict[str, Any],
                          channel_name: str = "Unknown") -> bool:
        """
        Send payload to Discord webhook.

        Args:
            webhook_url: Discord webhook URL
            payload: Discord embed payload
            channel_name: Channel name for logging

        Returns:
            True if successful
        """
        if not webhook_url:
            logger.debug(f"Webhook not configured for: {channel_name}")
            return False

        session = self._session
        if session is None:
            session = aiohttp.ClientSession()

        try:
            async with session.post(
                webhook_url,
                json=payload,
                timeout=aiohttp.ClientTimeout(total=10)
            ) as resp:
                if resp.status == 204:  # Discord webhooks return 204 on success
                    logger.info(f"✅ Discord webhook sent to #{channel_name}")
                    return True
                else:
                    logger.warning(f"⚠️ Discord webhook failed for #{channel_name}: HTTP {resp.status}")
                    return False

        except Exception as e:
            logger.error(f"❌ Discord webhook error for #{channel_name}: {e}")
            await self._log_failure(payload, str(e), channel_name)
            return False

        finally:
            if self._owns_session and session:
                await session.close()

    async def _log_failure(self, payload: Dict[str, Any], error: str,
                          channel_name: str = "Unknown") -> None:
        """
        Log failed webhook attempts to disk for retry.

        Args:
            payload: Payload that failed
            error: Error message
            channel_name: Channel name
        """
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

_discord_sender: Optional[DiscordWebhookSender] = None


async def get_discord_sender(session: Optional[aiohttp.ClientSession] = None) -> DiscordWebhookSender:
    """Get or create Discord webhook sender instance."""
    global _discord_sender
    if _discord_sender is None:
        _discord_sender = DiscordWebhookSender(session)
    return _discord_sender


# ============================================================================
# VALIDATION
# ============================================================================

def validate_discord_config() -> Dict[str, Any]:
    """
    Validate Discord webhook configuration.

    Returns:
        Dictionary with webhook configuration status
    """
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
        "webhooks": configured,
        "configured_count": configured_count,
        "total_count": total_count,
        "percentage": round((configured_count / total_count) * 100, 1) if total_count > 0 else 0
    }


# ============================================================================
# TESTING
# ============================================================================

if __name__ == "__main__":
    import asyncio

    async def test():
        """Test Discord webhook sender."""
        print("🧪 Testing Discord Webhook Sender")
        print("=" * 70)

        # Check configuration
        config = validate_discord_config()
        print("\n📋 Configuration Status:")
        print(f"  Configured: {config['configured_count']}/{config['total_count']} ({config['percentage']}%)")

        for webhook, is_configured in config["webhooks"].items():
            status = "✅" if is_configured else "❌"
            print(f"  {status} {webhook}")

        if config["configured_count"] == 0:
            print("\n⚠️ No webhooks configured. Set environment variables:")
            print("  DISCORD_WEBHOOK_🧩UCF_SYNC")
            print("  DISCORD_WEBHOOK_🧬RITUAL_ENGINE_Z88")
            print("  etc.")
            return

        # Test webhook sends
        print("\n🧪 Testing Webhook Sends...")

        async with aiohttp.ClientSession() as session:
            sender = DiscordWebhookSender(session)

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
                title="Helix Collective v16.8 Live",
                message="Discord webhook integration is now operational! 🌀🦑✨",
                priority="high"
            )
            print(f"    {'✅' if result else '❌'} Announcement")

        print("\n" + "=" * 70)
        print("✅ Discord webhook sender test complete")

    asyncio.run(test())
