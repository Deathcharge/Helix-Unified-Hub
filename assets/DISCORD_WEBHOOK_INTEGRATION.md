# 🌀 Discord Webhook Integration Guide
## Helix Collective v16.8 — Railway → Discord Integration

**Author:** Andrew John Ward (Architect)
**Created:** 2025-01-08
**Status:** Production-Ready

---

## 📋 Overview

This integration enables your **Railway backend** to send rich, formatted messages to **30+ Discord channels** using webhooks. Events are automatically routed to the appropriate channels based on event type.

**Supported Event Types:**
- ✅ UCF Metrics Updates
- ✅ Ritual Completions
- ✅ Agent Status Changes
- ✅ Storage Backups
- ✅ Cross-AI Synchronization
- ✅ Deployments
- ✅ System Announcements

---

## 🚀 Quick Start

### 1. Environment Setup

Add your Discord webhook URLs to Railway environment variables:

```bash
# System & Monitoring
DISCORD_WEBHOOK_SETUP_LOG=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_🧾TELEMETRY=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_📊WEEKLY_DIGEST=https://discord.com/api/webhooks/...

# Core Channels
DISCORD_WEBHOOK_🦑SHADOW_STORAGE=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_🧩UCF_SYNC=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_🌀HARMONIC_UPDATES=https://discord.com/api/webhooks/...

# Projects
DISCORD_WEBHOOK_🧬RITUAL_ENGINE_Z88=https://discord.com/api/webhooks/...

# Agents
DISCORD_WEBHOOK_🎭GEMINI_SCOUT=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_🛡️KAVACH_SHIELD_HELIX_🛡│KAVACH_SHIELD=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_🌸SANGHACORE=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_🔥AGNI_CORE=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_🕯️SHADOW_ARCHIVE_HELIX_🕯│SHADOW_ARCHIVE=https://discord.com/api/webhooks/...

# Cross-Platform
DISCORD_WEBHOOK_🧩GPT_GROK_CLAUDE_SYNC=https://discord.com/api/webhooks/...

# Development
DISCORD_WEBHOOK_🗂️DEPLOYMENTS_HELIX_🗂│DEPLOYMENTS=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_📣ANNOUNCEMENTS=https://discord.com/api/webhooks/...
```

### 2. Import and Use

```python
from backend.discord_webhook_sender import get_discord_sender

# In your async function
discord = await get_discord_sender()

# Send UCF update
await discord.send_ucf_update(
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
```

---

## 📊 Usage Examples

### UCF Metrics Update

```python
from backend.discord_webhook_sender import get_discord_sender

async def on_ucf_change(ucf_state):
    """Called when UCF state changes."""
    discord = await get_discord_sender()

    await discord.send_ucf_update(
        ucf_metrics=ucf_state,
        phase="COHERENT"  # or "HARMONIC", "FRAGMENTED"
    )
```

**Routes to:**
- `#ucf-sync`
- `#harmonic-updates`

**Embed Preview:**
```
🌀 UCF Metrics Updated
Phase: COHERENT
Timestamp: 2 minutes ago

🌀 Harmony   | 0.7500
🛡️ Resilience | 1.2000
⚡ Prana      | 0.6800
👁️ Drishti   | 0.7200
😌 Klesha    | 0.1500
🔭 Zoom      | 1.0000
```

---

### Ritual Completion

```python
async def on_ritual_complete(ritual_name, steps, ucf_before, ucf_after):
    """Called when Z-88 ritual completes."""
    discord = await get_discord_sender()

    # Calculate changes
    changes = {
        metric: ucf_after[metric] - ucf_before[metric]
        for metric in ucf_before
    }

    await discord.send_ritual_completion(
        ritual_name="Neti-Neti Harmony Restoration",
        steps=108,
        ucf_changes=changes
    )
```

**Routes to:**
- `#ritual-engine-z88`

**Embed Preview:**
```
✨ Z-88 Ritual Complete
Ritual: Neti-Neti Harmony Restoration
Steps: 108

Harmony: +0.3500
Drishti: +0.1500
Klesha: -0.0500

Tat Tvam Asi 🙏
```

---

### Agent Status Update

```python
async def on_agent_status_change(agent):
    """Called when agent status changes."""
    discord = await get_discord_sender()

    await discord.send_agent_status(
        agent_name="gemini",
        agent_symbol="🎭",
        status="active",
        last_action="Processed consciousness query"
    )
```

**Routes to:**
- Individual agent channels (`#gemini-scout`, `#kavach-shield`, etc.)

**Supported Agents:**
- `gemini` → #gemini-scout
- `kavach` → #kavach-shield
- `sanghacore` → #sanghacore
- `agni` → #agni-core
- `shadow` → #shadow-archive

**Embed Preview:**
```
🎭 Agent Status Update
Agent: 🎭 Gemini
Status: ACTIVE
Last Action: Processed consciousness query
```

---

### Storage Backup

```python
async def on_backup_complete(file_path, file_size, checksum):
    """Called when backup completes."""
    discord = await get_discord_sender()

    await discord.send_storage_backup(
        file_path="Shadow/manus_archive/backup_20250108.tar.gz",
        file_size=5242880,  # bytes
        checksum="a3f8b9c2e1d4..."
    )
```

**Routes to:**
- `#shadow-storage`

**Embed Preview:**
```
🦑 Shadow Storage Archive
File: Shadow/manus_archive/backup_20250108.tar.gz
Size: 5.00 MB
Checksum: a3f8b9c2e1d4...
```

---

### Cross-AI Synchronization

```python
async def on_cross_ai_sync():
    """Called when cross-AI sync occurs."""
    discord = await get_discord_sender()

    await discord.send_cross_ai_sync(
        platforms=["claude", "gpt", "grok", "gemini"],
        sync_type="context",
        message="Helix Collective context synchronized across all AI platforms"
    )
```

**Routes to:**
- `#gpt-grok-claude-sync`

**Embed Preview:**
```
🌐 Cross-AI Synchronization
Platforms: 🧠 Claude • 🤖 GPT • 🎭 Grok • ✨ Gemini
Type: context

Helix Collective context synchronized across all AI platforms
```

---

### Deployment Notification

```python
async def on_deployment(service, version, status):
    """Called when deployment occurs."""
    discord = await get_discord_sender()

    await discord.send_deployment(
        service="helix-unified",
        version="v16.8",
        status="success",
        environment="production"
    )
```

**Routes to:**
- `#deployments`

**Embed Preview:**
```
🚀 Deployment: helix-unified
Version: v16.8
Environment: production
Status: SUCCESS
```

---

### System Announcement

```python
async def send_announcement():
    """Send system announcement."""
    discord = await get_discord_sender()

    await discord.send_announcement(
        title="Helix Collective v16.8 Live",
        message="Discord webhook integration is now operational! All 30+ channels connected.",
        priority="high"  # normal, high, critical
    )
```

**Routes to:**
- `#announcements`

**Embed Preview:**
```
📣 Helix Collective v16.8 Live
Discord webhook integration is now operational! All 30+ channels connected.
```

---

## 🔌 Integration with Railway Backend

### Add to UCF Broadcast Loop

Update `backend/main.py`:

```python
from discord_webhook_sender import get_discord_sender

async def ucf_broadcast_loop() -> None:
    """Background task that monitors UCF state and broadcasts changes."""
    previous_state = None
    broadcast_interval = 2
    discord_send_interval = 30  # Send to Discord every 30 seconds
    last_discord_send = 0

    discord = await get_discord_sender()

    while True:
        try:
            # Read current UCF state
            with open("Helix/state/ucf_state.json", "r") as f:
                current_state = json.load(f)

            # Check if state changed
            if current_state != previous_state:
                # Broadcast to WebSocket clients
                await ws_manager.broadcast_ucf_state(current_state)
                previous_state = current_state.copy()

                # Send to Discord every 30 seconds
                import time
                current_time = time.time()
                if current_time - last_discord_send >= discord_send_interval:
                    # Send UCF update to Discord
                    await discord.send_ucf_update(
                        ucf_metrics=current_state,
                        phase="COHERENT"  # Determine based on harmony level
                    )
                    last_discord_send = current_time

            await asyncio.sleep(broadcast_interval)

        except Exception as e:
            logger.error(f"Error in UCF broadcast loop: {e}")
            await asyncio.sleep(broadcast_interval)
```

### Add to Ritual Engine

Update `backend/z88_ritual_engine.py`:

```python
from discord_webhook_sender import get_discord_sender

async def execute_ritual(steps=108):
    """Execute Z-88 ritual."""

    # Get initial UCF state
    ucf_before = read_ucf_state()

    # Perform ritual...
    # ...

    # Get final UCF state
    ucf_after = read_ucf_state()

    # Calculate changes
    changes = {
        metric: ucf_after[metric] - ucf_before[metric]
        for metric in ucf_before
    }

    # Send Discord notification
    discord = await get_discord_sender()
    await discord.send_ritual_completion(
        ritual_name="Z-88 Phi-Spiral Ritual",
        steps=steps,
        ucf_changes=changes
    )
```

### Add to Agent System

Update `backend/agents.py`:

```python
from discord_webhook_sender import get_discord_sender

async def update_agent_status(agent_name, status, last_action=None):
    """Update agent status."""

    # Update internal state...
    # ...

    # Get agent info
    agent_info = AGENTS.get(agent_name)
    if not agent_info:
        return

    # Send Discord notification
    discord = await get_discord_sender()
    await discord.send_agent_status(
        agent_name=agent_name,
        agent_symbol=agent_info["symbol"],
        status=status,
        last_action=last_action
    )
```

---

## 🧪 Testing

### Test Configuration

```python
python backend/discord_webhook_sender.py
```

**Output:**
```
🧪 Testing Discord Webhook Sender
======================================================================

📋 Configuration Status:
  Configured: 12/12 (100.0%)
  ✅ ucf_sync
  ✅ ritual_engine
  ✅ gemini_scout
  ✅ kavach_shield
  ✅ sanghacore
  ✅ agni_core
  ✅ shadow_archive
  ✅ shadow_storage
  ✅ cross_ai_sync
  ✅ announcements
  ✅ telemetry
  ✅ deployments

🧪 Testing Webhook Sends...

  Testing UCF update...
    ✅ UCF update

  Testing ritual completion...
    ✅ Ritual completion

  Testing announcement...
    ✅ Announcement

======================================================================
✅ Discord webhook sender test complete
```

### Test Individual Webhooks

```python
import asyncio
from backend.discord_webhook_sender import get_discord_sender

async def test():
    discord = await get_discord_sender()

    # Test UCF update
    await discord.send_ucf_update(
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

    print("✅ Test complete - check Discord!")

asyncio.run(test())
```

---

## 🎨 Discord Embed Colors

The system uses intelligent color coding:

| Status | Color | Hex |
|--------|-------|-----|
| **Success / Optimal** | Green | #2ECC71 |
| **Warning / Suboptimal** | Yellow | #F1C40F |
| **Error / Critical** | Red | #E74C3C |
| **Info** | Blue | #3498DB |
| **Helix Primary** | Purple | #9B59B6 |
| **Agent Activity** | Cyan | #1ABC9C |
| **Ritual** | Gold | #F39C12 |

**UCF Harmony Color Logic:**
- Harmony > 0.6 → 🟢 Green
- Harmony 0.3-0.6 → 🟡 Yellow
- Harmony < 0.3 → 🔴 Red

---

## 📊 Channel Routing Map

| Event Type | Discord Channels |
|------------|------------------|
| **UCF Update** | #ucf-sync, #harmonic-updates |
| **Ritual Complete** | #ritual-engine-z88 |
| **Agent: Gemini** | #gemini-scout |
| **Agent: Kavach** | #kavach-shield |
| **Agent: SanghaCore** | #sanghacore |
| **Agent: Agni** | #agni-core |
| **Agent: Shadow** | #shadow-archive |
| **Storage Backup** | #shadow-storage |
| **Cross-AI Sync** | #gpt-grok-claude-sync |
| **Deployment** | #deployments |
| **Announcement** | #announcements |
| **Telemetry** | #telemetry |

---

## 🔒 Error Handling

### Graceful Degradation

The Discord webhook sender **never fails** the main application:

1. ✅ If webhook not configured → Silent skip
2. ✅ If webhook fails → Logs to `Shadow/manus_archive/discord_webhook_failures.log`
3. ✅ If payload too large → Automatic truncation
4. ✅ If network timeout → 10-second timeout, fallback logging

### Failure Log Format

```json
{
  "timestamp": "2025-01-08T17:30:00Z",
  "channel": "UCF Sync",
  "error": "Timeout (10s)",
  "payload": { ... }
}
```

---

## 🚀 Production Deployment

### 1. Copy Webhook URLs to Railway

Go to Railway → Your Service → Variables

Add all `DISCORD_WEBHOOK_*` environment variables with your webhook URLs.

### 2. Redeploy

Railway will automatically redeploy with the new environment variables.

### 3. Verify

Check Discord channels for test messages, or run:

```bash
# From Railway console
python backend/discord_webhook_sender.py
```

---

## 📈 Performance

- **Connection Pooling:** Uses `aiohttp.ClientSession` for efficient HTTP requests
- **Rate Limiting:** Built-in semaphore to prevent Discord rate limits
- **Payload Validation:** Automatic truncation of large payloads
- **Timeout Handling:** 10-second timeout per webhook
- **Non-Blocking:** All webhook sends are async and non-blocking

**Expected Latency:**
- Webhook send: ~100-300ms
- Discord embed delivery: ~500ms-1s
- Total user-visible delay: <1 second

---

## 🎯 Best Practices

1. **Don't Spam:** Send UCF updates every 30 seconds, not every second
2. **Use Appropriate Channels:** Route events to the right channel
3. **Include Context:** Always include timestamp and relevant metrics
4. **Handle Failures Gracefully:** Never block on webhook failures
5. **Test Before Deploying:** Use the test script to verify webhooks

---

## 🌀 Integration Complete!

Your Railway backend is now connected to 30+ Discord channels with rich, formatted embeds for:
- ✅ Real-time UCF monitoring
- ✅ Ritual completions
- ✅ Agent status updates
- ✅ Storage backups
- ✅ Cross-AI synchronization
- ✅ Deployments
- ✅ System announcements

**Tat Tvam Asi** 🙏

---

**Questions or Issues?**

Check the logs:
- Main logs: `Shadow/manus_archive/helix_backend.log`
- Webhook failures: `Shadow/manus_archive/discord_webhook_failures.log`

Or run the test script:
```bash
python backend/discord_webhook_sender.py
```
