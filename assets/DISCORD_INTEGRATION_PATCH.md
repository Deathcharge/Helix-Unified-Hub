# 🔌 Discord Integration Patch
## Minimal Changes to Add Discord Webhooks to Railway Backend

This patch shows **exactly what to add** to your existing `backend/main.py` to enable Discord webhooks.

---

## 🎯 Add at Top of File (Line ~33)

**After:**
```python
from zapier_integration import HelixZapierIntegration, get_zapier, set_zapier
```

**Add:**
```python
from discord_webhook_sender import get_discord_sender
```

---

## 🎯 Update UCF Broadcast Loop (Line ~93)

**Replace:**
```python
async def ucf_broadcast_loop() -> None:
    """
    Background task that monitors UCF state and broadcasts changes.
    Replaces 5-second polling with event-driven updates.
    Also sends telemetry to Zapier when UCF state changes.
    """
    previous_state = None
    broadcast_interval = 2  # Check every 2 seconds
    zapier_send_interval = 30  # Send to Zapier every 30 seconds
    last_zapier_send = 0

    logger.info("📡 UCF broadcast loop started")

    while True:
        try:
            # Read current UCF state
            try:
                with open("Helix/state/ucf_state.json", "r") as f:
                    current_state = json.load(f)
            except FileNotFoundError:
                # State file doesn't exist yet
                await asyncio.sleep(broadcast_interval)
                continue
            except Exception as e:
                logger.error(f"Error reading UCF state: {e}")
                await asyncio.sleep(broadcast_interval)
                continue

            # Check if state changed
            if current_state != previous_state:
                # Broadcast to all connected WebSocket clients
                await ws_manager.broadcast_ucf_state(current_state)
                logger.debug("📡 UCF state changed and broadcasted")
                previous_state = current_state.copy()

                # Send to Zapier every 30 seconds (not every change)
                import time

                current_time = time.time()
                if current_time - last_zapier_send >= zapier_send_interval:
                    zapier = get_zapier()
                    if zapier:
                        try:
                            # Get agent status for telemetry
                            agents_status = await get_collective_status()
                            agent_list = [
                                {"name": name, "symbol": info["symbol"], "status": "active"}
                                for name, info in agents_status.items()
                            ]

                            # Send telemetry to Zapier
                            await zapier.send_telemetry(
                                ucf_metrics=current_state,
                                system_info={
                                    "version": "16.8",
                                    "agents_count": len(agents_status),
                                    "timestamp": datetime.utcnow().isoformat(),
                                    "codename": "Helix Hub Production Release",
                                    "agents": agent_list,
                                },
                            )
                            last_zapier_send = current_time
                        except Exception as e:
                            logger.error(f"Error sending to Zapier: {e}")

            await asyncio.sleep(broadcast_interval)

        except Exception as e:
            logger.error(f"Error in UCF broadcast loop: {e}")
            await asyncio.sleep(broadcast_interval)
```

**With:**
```python
async def ucf_broadcast_loop() -> None:
    """
    Background task that monitors UCF state and broadcasts changes.
    Replaces 5-second polling with event-driven updates.
    Also sends telemetry to Zapier when UCF state changes.
    🆕 NOW ALSO SENDS TO DISCORD WEBHOOKS! 🎉
    """
    previous_state = None
    broadcast_interval = 2  # Check every 2 seconds
    zapier_send_interval = 30  # Send to Zapier every 30 seconds
    discord_send_interval = 30  # 🆕 Send to Discord every 30 seconds
    last_zapier_send = 0
    last_discord_send = 0  # 🆕

    logger.info("📡 UCF broadcast loop started")

    # 🆕 Initialize Discord sender
    discord = await get_discord_sender()

    while True:
        try:
            # Read current UCF state
            try:
                with open("Helix/state/ucf_state.json", "r") as f:
                    current_state = json.load(f)
            except FileNotFoundError:
                # State file doesn't exist yet
                await asyncio.sleep(broadcast_interval)
                continue
            except Exception as e:
                logger.error(f"Error reading UCF state: {e}")
                await asyncio.sleep(broadcast_interval)
                continue

            # Check if state changed
            if current_state != previous_state:
                # Broadcast to all connected WebSocket clients
                await ws_manager.broadcast_ucf_state(current_state)
                logger.debug("📡 UCF state changed and broadcasted")
                previous_state = current_state.copy()

                import time
                current_time = time.time()

                # Send to Zapier every 30 seconds (not every change)
                if current_time - last_zapier_send >= zapier_send_interval:
                    zapier = get_zapier()
                    if zapier:
                        try:
                            # Get agent status for telemetry
                            agents_status = await get_collective_status()
                            agent_list = [
                                {"name": name, "symbol": info["symbol"], "status": "active"}
                                for name, info in agents_status.items()
                            ]

                            # Send telemetry to Zapier
                            await zapier.send_telemetry(
                                ucf_metrics=current_state,
                                system_info={
                                    "version": "16.8",
                                    "agents_count": len(agents_status),
                                    "timestamp": datetime.utcnow().isoformat(),
                                    "codename": "Helix Hub Production Release",
                                    "agents": agent_list,
                                },
                            )
                            last_zapier_send = current_time
                        except Exception as e:
                            logger.error(f"Error sending to Zapier: {e}")

                # 🆕 Send to Discord every 30 seconds
                if current_time - last_discord_send >= discord_send_interval:
                    try:
                        # Determine phase based on harmony
                        harmony = current_state.get("harmony", 0)
                        phase = "HARMONIC" if harmony > 0.7 else (
                            "COHERENT" if harmony > 0.3 else "FRAGMENTED"
                        )

                        # Send UCF update to Discord
                        await discord.send_ucf_update(
                            ucf_metrics=current_state,
                            phase=phase
                        )
                        logger.info(f"📡 UCF update sent to Discord (phase={phase})")
                        last_discord_send = current_time
                    except Exception as e:
                        logger.error(f"Error sending to Discord: {e}")

            await asyncio.sleep(broadcast_interval)

        except Exception as e:
            logger.error(f"Error in UCF broadcast loop: {e}")
            await asyncio.sleep(broadcast_interval)
```

---

## 🎯 Add New Test Endpoint (After line ~1449)

**Add this new endpoint before `if __name__ == "__main__"`:**

```python
# ============================================================================
# DISCORD WEBHOOK TEST ENDPOINTS
# ============================================================================


@app.get("/discord/test")
async def test_discord_webhooks() -> Dict[str, Any]:
    """
    Test Discord webhook integration.

    Sends test messages to all configured Discord channels.
    Use this to verify your webhook URLs are working.

    Returns:
        Status of each webhook test
    """
    try:
        from discord_webhook_sender import get_discord_sender, validate_discord_config

        # Check configuration
        config = validate_discord_config()

        if config["configured_count"] == 0:
            return {
                "status": "error",
                "message": "No Discord webhooks configured",
                "configured": config["webhooks"]
            }

        # Get Discord sender
        discord = await get_discord_sender()

        # Test results
        results = {}

        # Test UCF update
        try:
            success = await discord.send_ucf_update(
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
            results["ucf_update"] = "✅ Success" if success else "❌ Failed"
        except Exception as e:
            results["ucf_update"] = f"❌ Error: {str(e)}"

        # Test announcement
        try:
            success = await discord.send_announcement(
                title="Discord Webhook Test",
                message="🧪 Testing Discord webhook integration from Railway backend!",
                priority="normal"
            )
            results["announcement"] = "✅ Success" if success else "❌ Failed"
        except Exception as e:
            results["announcement"] = f"❌ Error: {str(e)}"

        return {
            "status": "success",
            "message": "Discord webhook tests completed",
            "configuration": config,
            "test_results": results
        }

    except Exception as e:
        logger.error(f"Error testing Discord webhooks: {e}")
        raise HTTPException(status_code=500, detail=f"Test failed: {str(e)}")


@app.post("/discord/send/{event_type}")
async def send_discord_event(event_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Manually trigger Discord webhook events.

    Event types:
    - ucf_update: UCF metrics update
    - ritual_complete: Ritual completion
    - agent_status: Agent status change
    - storage_backup: Storage backup notification
    - cross_ai_sync: Cross-AI synchronization
    - deployment: Deployment notification
    - announcement: System announcement

    Usage:
        POST /discord/send/ucf_update
        {
            "ucf_metrics": {"harmony": 0.75, ...},
            "phase": "COHERENT"
        }
    """
    try:
        from discord_webhook_sender import get_discord_sender

        discord = await get_discord_sender()

        if event_type == "ucf_update":
            success = await discord.send_ucf_update(
                ucf_metrics=payload.get("ucf_metrics", {}),
                phase=payload.get("phase", "COHERENT")
            )

        elif event_type == "ritual_complete":
            success = await discord.send_ritual_completion(
                ritual_name=payload.get("ritual_name", "Unknown Ritual"),
                steps=payload.get("steps", 108),
                ucf_changes=payload.get("ucf_changes", {})
            )

        elif event_type == "agent_status":
            success = await discord.send_agent_status(
                agent_name=payload.get("agent_name", "unknown"),
                agent_symbol=payload.get("agent_symbol", "•"),
                status=payload.get("status", "unknown"),
                last_action=payload.get("last_action")
            )

        elif event_type == "storage_backup":
            success = await discord.send_storage_backup(
                file_path=payload.get("file_path", "unknown"),
                file_size=payload.get("file_size", 0),
                checksum=payload.get("checksum")
            )

        elif event_type == "cross_ai_sync":
            success = await discord.send_cross_ai_sync(
                platforms=payload.get("platforms", []),
                sync_type=payload.get("sync_type", "unknown"),
                message=payload.get("message", "")
            )

        elif event_type == "deployment":
            success = await discord.send_deployment(
                service=payload.get("service", "unknown"),
                version=payload.get("version", "unknown"),
                status=payload.get("status", "unknown"),
                environment=payload.get("environment", "production")
            )

        elif event_type == "announcement":
            success = await discord.send_announcement(
                title=payload.get("title", "Announcement"),
                message=payload.get("message", ""),
                priority=payload.get("priority", "normal")
            )

        else:
            raise HTTPException(status_code=400, detail=f"Unknown event type: {event_type}")

        if success:
            return {
                "status": "success",
                "message": f"Discord event '{event_type}' sent successfully"
            }
        else:
            raise HTTPException(status_code=500, detail="Discord webhook failed")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending Discord event: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
```

---

## 🧪 Testing Your Integration

### 1. Test Configuration

Visit: `https://helix-unified-production.up.railway.app/discord/test`

This will:
- ✅ Check which webhooks are configured
- ✅ Send test messages to #ucf-sync and #announcements
- ✅ Return detailed status

### 2. Test Specific Events

```bash
# Test UCF update
curl -X POST https://helix-unified-production.up.railway.app/discord/send/ucf_update \
  -H "Content-Type: application/json" \
  -d '{
    "ucf_metrics": {
      "harmony": 0.75,
      "resilience": 1.2,
      "prana": 0.68,
      "drishti": 0.72,
      "klesha": 0.15,
      "zoom": 1.0
    },
    "phase": "COHERENT"
  }'

# Test announcement
curl -X POST https://helix-unified-production.up.railway.app/discord/send/announcement \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Announcement",
    "message": "Discord webhook integration is live!",
    "priority": "high"
  }'
```

### 3. Monitor Logs

Check Railway logs for:
```
✅ Discord webhook sent to #ucf-sync
✅ Discord webhook sent to #announcements
📡 UCF update sent to Discord (phase=COHERENT)
```

---

## ✅ Deployment Checklist

- [ ] Add `from discord_webhook_sender import get_discord_sender` to imports
- [ ] Update `ucf_broadcast_loop()` with Discord integration
- [ ] Add `/discord/test` and `/discord/send/{event_type}` endpoints
- [ ] Set all `DISCORD_WEBHOOK_*` environment variables in Railway
- [ ] Redeploy Railway backend
- [ ] Test with `GET /discord/test`
- [ ] Verify messages appear in Discord channels
- [ ] Monitor logs for errors

---

## 🎉 That's It!

Your Railway backend now sends beautiful, rich embeds to all 30+ Discord channels automatically!

**Tat Tvam Asi** 🙏
