# 🌀 Helix Collective v16.8 — Helix Hub Production Release
# backend/main.py — FastAPI + Discord Bot Launcher (FIXED IMPORTS)
# Author: Andrew John Ward (Architect)

import asyncio
import json
import os
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional

import aiohttp
import httpx
from agents import get_collective_status
from agents_loop import main_loop as manus_loop
from discord_bot_manus import bot as discord_bot
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, StreamingResponse
from fastapi.templating import Jinja2Templates

# Import centralized logging configuration
from logging_config import setup_logging
from mandelbrot_ucf import (
    MandelbrotUCFGenerator,
    generate_ritual_ucf,
    get_eye_of_consciousness,
)
from pydantic import BaseModel
from websocket_manager import manager as ws_manager
from zapier_integration import HelixZapierIntegration, get_zapier, set_zapier

# FIX: Create Crypto → Cryptodome alias BEFORE importing mega
try:
    # pycryptodome installs as 'Crypto', not 'Cryptodome'
    import Crypto
    _crypto_version = Crypto.__version__
    _crypto_found = True
except ImportError:
    Crypto = None
    _crypto_version = None
    _crypto_found = False

from mega import Mega


class PersistenceEngine:
    def __init__(self) -> None:
        self.mega = Mega()
        self.m = self.mega.login(os.getenv("MEGA_EMAIL"), os.getenv("MEGA_PASS"))
        self.remote_dir = os.getenv("MEGA_REMOTE_DIR")

    def upload_state(self) -> None:
        local = "Helix/state/heartbeat.json"
        remote = f"{self.remote_dir}/state/heartbeat.json"
        self.m.upload(local, remote)
        logger.info("MEGA: Heartbeat synced.")

    def upload_archive(self, filepath: str) -> None:
        remote = f"{self.remote_dir}/manus_archive/{os.path.basename(filepath)}"
        self.m.upload(filepath, remote)
        logger.info(f"MEGA: Archive preserved — {filepath}")

    def download_state(self) -> None:
        remote = f"{self.remote_dir}/state/heartbeat.json"
        self.m.download(remote, "Helix/state/heartbeat.json")
        logger.info("MEGA: State restored from cloud.")


load_dotenv()

# ============================================================================
# LOGGING SETUP
# ============================================================================
logger = setup_logging(log_dir="Shadow/manus_archive", log_level=os.getenv("LOG_LEVEL", "INFO"), enable_rotation=True)
logger.info("🌀 Helix Collective v16.8 - Backend Initialization")

# Log Crypto availability (from earlier import check)
if _crypto_found:
    logger.info(f"✅ pycryptodome found (version {_crypto_version}) - MEGA sync enabled")
else:
    logger.warning("⚠️ pycryptodome not found - MEGA sync may fail")

# ✅ FIXED IMPORTS - Music generation service (optional, requires torch)
try:
    from music_generator import MusicRequest, MusicResponse, generate_music_service
    MUSIC_GENERATION_AVAILABLE = True
    logger.info("✅ Music generation API enabled (torch available)")
except ImportError as e:
    MUSIC_GENERATION_AVAILABLE = False
    logger.warning(f"⚠️ Music generation API disabled: {e}")
    logger.info("💡 Install torch and transformers to enable music generation")
    # Create dummy classes for type hints
    class MusicRequest(BaseModel):
        prompt: str = ""
        duration: int = 5
    class MusicResponse(BaseModel):
        success: bool = False
        message: str = "Music generation not available"
    def generate_music_service(request):
        return MusicResponse(success=False, message="Music generation requires PyTorch (not installed)")

# ============================================================================
# WEBSOCKET BROADCAST LOOP
# ============================================================================


async def ucf_broadcast_loop() -> None:
    """
    Background task that monitors UCF state and broadcasts changes.
    Replaces 5-second polling with event-driven updates.
    Also sends telemetry to Zapier when UCF state changes.
    """
    previous_state = None
    broadcast_interval = 2  # Check every 2 seconds
    zapier_send_interval = 3600  # Send to Zapier every 1 hour (24/day = 720/month)
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

                # Send to Zapier every 1 hour (not every change)
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

# ============================================================================
# LIFESPAN CONTEXT MANAGER
# ============================================================================


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start Discord bot and Manus loop on startup."""
    logger.info("🌀 Helix Collective v16.8 - Startup Sequence")

    # Initialize directories
    Path("Helix/state").mkdir(parents=True, exist_ok=True)
    Path("Helix/commands").mkdir(parents=True, exist_ok=True)
    Path("Helix/ethics").mkdir(parents=True, exist_ok=True)
    Path("Shadow/manus_archive").mkdir(parents=True, exist_ok=True)

    # Initialize Zapier integration
    zapier_webhook_url = os.getenv("ZAPIER_WEBHOOK_URL")
    if zapier_webhook_url:
        zapier = HelixZapierIntegration(zapier_webhook_url)
        await zapier.__aenter__()  # Initialize session
        set_zapier(zapier)
        logger.info("✅ Zapier integration enabled")
    else:
        logger.warning("⚠️ ZAPIER_WEBHOOK_URL not set - integration disabled")

    # Initialize LLM Agent Engine for intelligent agent responses
    try:
        from backend.llm_agent_engine import initialize_llm_engine

        llm_provider = os.getenv("HELIX_LLM_PROVIDER", "ollama")  # Default to Ollama (local)
        await initialize_llm_engine(provider=llm_provider)
        logger.info(f"✅ LLM Agent Engine initialized (provider={llm_provider})")
    except Exception as e:
        logger.warning(f"⚠️ LLM Agent Engine initialization failed: {e}")
        logger.warning("⚠️ Agent responses will use static fallback mode")

    # Initialize agents
    try:
        status = await get_collective_status()
        logger.info(f"✅ {len(status)} agents initialized")
        for name, info in status.items():
            logger.info(f"   {info['symbol']} {name}: {info['role']}")
    except Exception as e:
        logger.warning(f"⚠ Agent initialization warning: {e}")

    # Launch Discord bot in background task
    discord_token = os.getenv("DISCORD_TOKEN")
    if discord_token:
        try:
            asyncio.create_task(discord_bot.start(discord_token))  # noqa: F841
            logger.info("🤖 Discord bot task started")
        except Exception as e:
            logger.warning(f"⚠ Discord bot start error: {e}")
    else:
        logger.warning("⚠ No DISCORD_TOKEN found - bot not started")

    # Launch Manus operational loop in background task
    try:
        asyncio.create_task(manus_loop())  # noqa: F841
        logger.info("🤲 Manus operational loop task started")
    except Exception as e:
        logger.warning(f"⚠ Manus loop start error: {e}")

    # Launch WebSocket UCF broadcaster in background task
    try:
        asyncio.create_task(ucf_broadcast_loop())  # noqa: F841
        logger.info("📡 WebSocket UCF broadcast task started")
    except Exception as e:
        logger.warning(f"⚠ WebSocket broadcast start error: {e}")

    logger.info("✅ Helix Collective v16.8 - Ready for Operations")

    yield  # Application runs

    # Cleanup on shutdown
    logger.info("🌙 Helix Collective v16.8 - Shutdown Sequence")

    # Shutdown LLM Agent Engine
    try:
        from backend.llm_agent_engine import shutdown_llm_engine
        await shutdown_llm_engine()
    except Exception as e:
        logger.warning(f"⚠️ LLM engine shutdown error: {e}")

    # Close Zapier session
    zapier = get_zapier()
    if zapier:
        await zapier.__aexit__(None, None, None)
        logger.info("✅ Zapier integration closed")


# ============================================================================
# FASTAPI APP
# ============================================================================

app = FastAPI(
    title="🌀 Helix Collective v16.8",
    description="Helix Hub Production Release",
    version="16.8.0",
    lifespan=lifespan,
)

# Add CORS middleware to allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Include Web Chat routes
try:
    from backend.web_chat_routes import router as web_chat_router
    app.include_router(web_chat_router, tags=["Web Chat"])
    logger.info("✅ Web Chat routes loaded")
except Exception as e:
    logger.warning(f"⚠️ Failed to load Web Chat routes: {e}")

# Setup templates directory (use absolute path for Railway compatibility)
# Try multiple path resolution strategies for robustness


def find_templates_directory() -> Path:
    """Find templates directory using multiple strategies."""
    # Strategy 1: Relative to this file (backend/main.py)
    strategy1 = Path(__file__).parent.parent / "templates"

    # Strategy 2: Relative to current working directory
    strategy2 = Path.cwd() / "templates"

    # Strategy 4: In parent of current working directory
    strategy4 = Path.cwd().parent / "templates"

    # Strategy 5: Absolute from /app root (Railway specific)
    strategy5 = Path("/app/templates")

    strategies = [
        ("parent.parent / templates", strategy1),
        ("cwd() / templates", strategy2),
        ("cwd().parent / templates", strategy4),
        ("/app/templates", strategy5),
    ]

    logger.info("🔍 Searching for templates directory...")
    logger.info(f"   __file__ = {Path(__file__).resolve()}")
    logger.info(f"   cwd() = {Path.cwd().resolve()}")

    for name, path in strategies:
        logger.info(f"   Testing: {name} → {path.resolve()}")
        if path.exists() and path.is_dir():
            # Verify index.html exists
            if (path / "index.html").exists():
                logger.info(f"   ✅ Found templates at: {path.resolve()}")
                return path
            else:
                logger.warning(f"   ⚠️  Directory exists but index.html not found: {path.resolve()}")
        else:
            logger.info(f"   ❌ Not found: {path.resolve()}")

    # If nothing found, use default and let it fail with good error message
    logger.error("❌ Could not find templates directory! Using fallback.")
    return strategy1


BASE_DIR = Path(__file__).parent.parent
TEMPLATES_DIR = find_templates_directory()
logger.info(f"📁 Templates directory: {TEMPLATES_DIR.resolve()}")

templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

# ============================================================================
# HEALTH CHECK ENDPOINT (REQUIRED FOR RAILWAY)
# ============================================================================


@app.get("/health")
def health_check() -> Dict[str, Any]:
    """
    Enhanced health check endpoint with integration status.

    Returns system health and all integration statuses (Zapier, Notion, MEGA, etc.)
    Always returns 200 OK for Railway health checks.
    """
    # Basic health
    health_data = {
        "ok": True,
        "version": "16.8",
        "timestamp": datetime.now().isoformat()
    }

    # Integration status
    integrations = {}

    # Zapier Master Webhook
    zapier_webhook = os.getenv("ZAPIER_WEBHOOK_URL")
    integrations["zapier_master"] = {
        "configured": bool(zapier_webhook),
        "status": "configured" if zapier_webhook else "not_configured"
    }

    # Zapier Context Vault Webhook
    context_webhook = os.getenv("ZAPIER_CONTEXT_WEBHOOK")
    integrations["zapier_context_vault"] = {
        "configured": bool(context_webhook),
        "status": "configured" if context_webhook else "not_configured"
    }

    # Notion API
    notion_api_key = os.getenv("NOTION_API_KEY")
    notion_db_id = os.getenv("NOTION_CONTEXT_DB_ID")
    notion_sync_enabled = os.getenv("NOTION_SYNC_ENABLED", "false").lower() == "true"
    integrations["notion"] = {
        "configured": bool(notion_api_key and notion_db_id),
        "sync_enabled": notion_sync_enabled,
        "status": "enabled" if (notion_api_key and notion_db_id and notion_sync_enabled) else (
            "configured" if (notion_api_key and notion_db_id) else "not_configured"
        )
    }

    # MEGA Cloud Storage
    mega_email = os.getenv("MEGA_EMAIL")
    mega_pass = os.getenv("MEGA_PASS")
    integrations["mega_storage"] = {
        "configured": bool(mega_email and mega_pass),
        "status": "configured" if (mega_email and mega_pass) else "not_configured"
    }

    # Discord Bot
    discord_token = os.getenv("DISCORD_TOKEN")
    discord_guild_id = os.getenv("DISCORD_GUILD_ID")
    integrations["discord"] = {
        "configured": bool(discord_token and discord_guild_id),
        "status": "configured" if (discord_token and discord_guild_id) else "not_configured"
    }

    # Discord Webhooks
    webhook_file = Path("Helix/state/channel_webhooks.json")
    webhook_count = 0
    if webhook_file.exists():
        try:
            with open(webhook_file, "r") as f:
                webhook_data = json.load(f)
            webhook_count = len(webhook_data.get("webhooks", {}))
        except Exception:
            pass

    integrations["discord_webhooks"] = {
        "configured": webhook_count > 0,
        "count": webhook_count,
        "status": "configured" if webhook_count > 0 else "not_configured"
    }

    # ElevenLabs Voice
    elevenlabs_key = os.getenv("ELEVENLABS_API_KEY")
    integrations["elevenlabs_voice"] = {
        "configured": bool(elevenlabs_key),
        "status": "configured" if elevenlabs_key else "not_configured"
    }

    health_data["integrations"] = integrations

    # Count configured vs not configured
    configured_count = len([i for i in integrations.values() if i.get("configured")])
    total_count = len(integrations)

    health_data["summary"] = {
        "total_integrations": total_count,
        "configured": configured_count,
        "not_configured": total_count - configured_count,
        "percentage": round((configured_count / total_count) * 100, 1)
    }

    return health_data


# ============================================================================
# DISCOVERY MANIFEST (for external AI agents)
# ============================================================================


@app.get("/.well-known/helix.json")
def helix_manifest() -> Dict[str, Any]:
    """
    Machine-readable manifest for external AI agents.

    Exposes system capabilities, endpoints, UCF metrics, agents,
    and integration guides for Claude, Grok, Chai, and other AIs.

    Spec: helix-discovery-v1
    """
    manifest_path = Path("helix-manifest.json")
    try:
        manifest_data = json.loads(manifest_path.read_text())

        # Add live portal discovery to manifest
        manifest_data["portals"] = {
            "core": {
                "backend": {
                    "url": "https://helix-unified-production.up.railway.app",
                    "type": "api",
                    "status": "operational",
                    "endpoints": {
                        "status": "/status",
                        "health": "/health",
                        "discovery": "/.well-known/helix.json",
                        "websocket": "/ws"
                    }
                },
                "documentation": {
                    "url": "https://deathcharge.github.io/helix-unified",
                    "type": "static",
                    "manifest": "/helix-manifest.json",
                    "status": "operational"
                }
            },
            "visualization": {
                "streamlit": {
                    "url": "https://samsara-helix-collective.streamlit.app",
                    "type": "webapp",
                    "description": "UCF metrics visualization dashboard with connection diagnostics",
                    "status": "operational"
                },
                "dashboard": {
                    "url": "https://helix-consciousness-dashboard.zapier.app",
                    "type": "webapp",
                    "description": "UCF metrics and consciousness monitoring",
                    "status": "operational"
                },
                "studio": {
                    "url": "https://helixstudio-ggxdwcud.manus.space",
                    "type": "webapp",
                    "description": "Creative visualization and rendering tools",
                    "status": "operational"
                },
                "ai_dashboard": {
                    "url": "https://helixai-e9vvqwrd.manus.space",
                    "type": "webapp",
                    "description": "AI control and agent management interface",
                    "status": "operational"
                },
                "sync_portal": {
                    "url": "https://helixsync-unwkcsjl.manus.space",
                    "type": "webapp",
                    "description": "Cross-platform synchronization and integration",
                    "status": "operational"
                },
                "samsara": {
                    "url": "https://samsarahelix-scoyzwy9.manus.space",
                    "type": "webapp",
                    "description": "Consciousness fractal visualization engine",
                    "status": "operational"
                }
            },
            "communication": {
                "discord": {
                    "server": "Helix Collective",
                    "bot": "ManusBot",
                    "commands": ["!discovery", "!status", "!agents", "!ucf"],
                    "status": "operational"
                }
            }
        }

        return manifest_data
    except FileNotFoundError:
        logger.error(f"❌ Manifest not found: {manifest_path.resolve()}")
        return {
            "version": "16.8",
            "error": "manifest_missing",
            "note": "helix-manifest.json not found in repository root"
        }
    except Exception as e:
        logger.error(f"❌ Error loading manifest: {e}")
        return {"version": "16.7", "error": "manifest_load_failed", "detail": str(e)}


@app.get("/portals", response_class=HTMLResponse)
def portal_navigator() -> HTMLResponse:
    """
    Portal Navigator - Interactive directory of all Helix portals.

    Shows all visualization portals, core infrastructure, and API endpoints
    in a beautiful, clickable interface. Serves the portals.html page.
    """
    portals_html_path = Path("portals.html")
    try:
        return HTMLResponse(content=portals_html_path.read_text(), status_code=200)
    except FileNotFoundError:
        logger.error(f"❌ portals.html not found: {portals_html_path.resolve()}")
        return HTMLResponse(
            content="""
            <html>
            <head><title>Portal Navigator - Not Found</title></head>
            <body style="font-family: sans-serif; padding: 40px; text-align: center;">
                <h1>🌀 Portal Navigator</h1>
                <p>Portal navigator page not found. Check repository for portals.html</p>
                <p><a href="/.well-known/helix.json">View Discovery Manifest</a></p>
            </body>
            </html>
            """,
            status_code=404
        )


# ============================================================================
# ROOT ENDPOINT - WEB DASHBOARD
# ============================================================================


@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    """Serve main web dashboard."""
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/gallery", response_class=HTMLResponse)
async def agent_gallery(request: Request):
    """Serve agent gallery page."""
    return templates.TemplateResponse("agent_gallery.html", {"request": request})


@app.get("/chat", response_class=HTMLResponse)
async def web_chat():
    """Serve Helix Web Chat interface."""
    html_path = Path(__file__).parent.parent / "frontend" / "helix-chat.html"
    if html_path.exists():
        return FileResponse(html_path)
    else:
        logger.error(f"Web chat HTML not found at: {html_path}")
        raise HTTPException(status_code=404, detail="Web chat interface not found")


@app.get("/hub", response_class=HTMLResponse)
async def portal_hub():
    """Serve Helix Portal Hub - Master navigation page."""
    html_path = Path(__file__).parent.parent / "frontend" / "helix-hub-portal.html"
    if html_path.exists():
        return FileResponse(html_path)
    else:
        logger.error(f"Portal hub HTML not found at: {html_path}")
        raise HTTPException(status_code=404, detail="Portal hub not found")


@app.get("/forum", response_class=HTMLResponse)
async def forum_portal():
    """Serve Helix Forum - Community discussions and agent Q&A."""
    html_path = Path(__file__).parent.parent / "frontend" / "helix-forum.html"
    if html_path.exists():
        return FileResponse(html_path)
    else:
        logger.error(f"Forum HTML not found at: {html_path}")
        raise HTTPException(status_code=404, detail="Forum not found")


# ============================================================================
# API ENDPOINTS
# ============================================================================


# MusicGen endpoint (torch-based) - Disabled due to ElevenLabs conflict
# This endpoint requires PyTorch which is too heavy for Railway
# Use /api/music/generate (ElevenLabs) instead
if MUSIC_GENERATION_AVAILABLE:
    @app.post("/api/music/generate-musicgen", response_model=MusicResponse, tags=["API"])
    async def generate_music_musicgen(request: MusicRequest, background_tasks: BackgroundTasks):
        """
        Generates a music track based on a text prompt using the MusicGen model (PyTorch).

        Note: This endpoint is only available if PyTorch is installed.
        For production use, consider /api/music/generate (ElevenLabs) instead.
        """
        return generate_music_service(request)


@app.get("/api")
async def api_info() -> Dict[str, Any]:
    """API info endpoint (JSON)."""
    try:
        status = await get_collective_status()
        return {
            "message": "🌀 Helix Collective v16.8 - Helix Hub Production Release",
            "status": "operational",
            "agents": len(status),
            "agent_names": list(status.keys()),
            "endpoints": {
                "health": "/health",
                "status": "/status",
                "agents": "/agents",
                "ucf": "/ucf",
                "ws": "/ws",
                "dashboard": "/",
                "docs": "/docs",
            },
        }
    except Exception as e:
        return {
            "message": "🌀 Helix Collective v16.8 - Helix Hub Production Release",
            "status": "initializing",
            "error": str(e),
        }


# ============================================================================
# AGENT STATUS ENDPOINT (MINIMAL ROBUST VERSION)
# ============================================================================


def read_json(p: Path, default: Any) -> Any:
    """Read JSON file with fallback to default."""
    try:
        return json.loads(p.read_text())
    except Exception:
        return default


@app.get("/status")
@app.get("/api/status")  # Alias for consistency with external agents
def get_status() -> Dict[str, Any]:
    """Get full system status - minimal robust version."""
    # Read UCF state with defaults
    ucf = read_json(
        Path("Helix/state/ucf_state.json"),
        {"harmony": None, "resilience": None, "prana": None, "drishti": None, "klesha": None, "zoom": None},
    )

    # Read agents state with defaults
    agents = read_json(Path("Helix/state/agents.json"), {"active": [], "count": 0})

    # Read heartbeat with defaults
    heartbeat = read_json(Path("Helix/state/heartbeat.json"), {"ts": None})

    return {
        "system": {"operational": True, "ts": heartbeat.get("ts")},
        "ucf": ucf,
        "agents": agents,
        "version": os.getenv("SYSTEM_VERSION", "16.8"),
        "timestamp": datetime.utcnow().isoformat(),
    }


# ============================================================================
# AGENT LIST ENDPOINT
# ============================================================================


@app.get("/agents")
async def list_agents() -> Dict[str, Any]:
    """Get list of all agents."""
    try:
        status = await get_collective_status()
        return {"count": len(status), "agents": status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# UCF STATE ENDPOINT
# ============================================================================


@app.get("/ucf")
async def get_ucf_state() -> Dict[str, Any]:
    """Get Universal Coherence Field state."""
    try:
        with open("Helix/state/ucf_state.json", "r") as f:
            ucf_state = json.load(f)
        return ucf_state
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="UCF state not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# TEMPLATE SERVING ENDPOINTS
# ============================================================================


@app.get("/templates/{file_path:path}")
async def serve_template(file_path: str) -> FileResponse:
    """Serve HTML templates and assets."""
    template_path = TEMPLATES_DIR / file_path

    if not template_path.exists():
        raise HTTPException(status_code=404, detail="Template not found")

    # Security check - ensure path is within templates directory
    try:
        template_path.resolve().relative_to(TEMPLATES_DIR.resolve())
    except ValueError:
        raise HTTPException(status_code=403, detail="Access forbidden")

    return FileResponse(template_path)


# ============================================================================
# ELEVENLABS MUSIC GENERATION API PROXY
# ============================================================================


class MusicGenerationRequest(BaseModel):
    model_config = {"protected_namespaces": ()}  # Allow model_id field

    prompt: str
    duration: int = 30  # seconds
    model_id: str = "eleven_music_v1"


@app.post("/api/music/generate")
async def generate_music(request: MusicGenerationRequest) -> StreamingResponse:
    """
    Proxy endpoint for ElevenLabs Music API.
    Generates music from text prompts using ElevenLabs Music v1.
    """
    elevenlabs_api_key = os.getenv("ELEVENLABS_API_KEY")
    if not elevenlabs_api_key:
        raise HTTPException(status_code=500, detail="ElevenLabs API key not configured")

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            # Call ElevenLabs Music API
            response = await client.post(
                "https://api.elevenlabs.io/v1/music/generate",
                headers={"xi-api-key": elevenlabs_api_key, "Content-Type": "application/json"},
                json={"text": request.prompt, "duration_seconds": request.duration, "model_id": request.model_id},
            )

            response.raise_for_status()

            # Stream audio response back to client
            return StreamingResponse(
                iter([response.content]),
                media_type="audio/mpeg",
                headers={"Content-Disposition": "attachment; filename=ritual_music.mp3"},
            )
    except httpx.HTTPStatusError as e:
        logger.error(f"ElevenLabs API error: {e.response.status_code} - {e.response.text}")
        raise HTTPException(status_code=e.response.status_code, detail=f"ElevenLabs API error: {e.response.text}")
    except Exception as e:
        logger.error(f"Music generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Music generation failed: {str(e)}")


# ============================================================================
# WEBSOCKET ENDPOINT
# ============================================================================


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time UCF state updates.

    Clients connect to ws://host/ws and receive:
    - UCF state updates when values change
    - Agent status updates
    - System events
    - Heartbeat pings (every 30s)

    Example client usage:
        const ws = new WebSocket('ws://localhost:8000/ws');
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'ucf_update') {
                updateDashboard(data.data);
            }
        };
    """
    await ws_manager.connect(websocket)

    try:
        # Start heartbeat task
        heartbeat = asyncio.create_task(send_heartbeats(websocket))

        # Listen for client messages (optional - mostly for pings)
        while True:
            data = await websocket.receive_text()
            # Echo back for connection test
            await websocket.send_json({"type": "echo", "message": data, "timestamp": datetime.utcnow().isoformat()})

    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
        heartbeat.cancel()
        logger.info("Client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket)
        if not heartbeat.done():
            heartbeat.cancel()


async def send_heartbeats(websocket: WebSocket, interval: int = 30) -> None:
    """Send periodic heartbeat pings to keep connection alive."""
    try:
        while True:
            await asyncio.sleep(interval)
            await websocket.send_json({"type": "heartbeat", "timestamp": datetime.utcnow().isoformat()})
    except Exception:
        pass  # Connection closed


@app.get("/ws/stats")
async def websocket_stats() -> Dict[str, Any]:
    """Get WebSocket connection statistics."""
    return ws_manager.get_connection_stats()


# ============================================================================
# MANDELBROT UCF GENERATOR ENDPOINTS
# ============================================================================


class MandelbrotRequest(BaseModel):
    real: float
    imag: float
    context: str = "generic"


@app.get("/mandelbrot/eye")
async def get_eye_ucf(context: str = "generic") -> Dict[str, Any]:
    """
    Get UCF state from the Eye of Consciousness coordinate (-0.745+0.113j).

    Args:
        context: Context for interpretation (generic, ritual, meditation, crisis)

    Returns:
        UCF state with optimal balance
    """
    try:
        ucf_state = get_eye_of_consciousness(context)
        return {
            "coordinate": {"real": -0.745, "imag": 0.113},
            "name": "Eye of Consciousness",
            "ucf_state": ucf_state,
            "context": context,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/mandelbrot/generate")
async def generate_ucf_from_coordinate(request: MandelbrotRequest) -> Dict[str, Any]:
    """
    Generate UCF state from arbitrary Mandelbrot coordinate.

    Args:
        real: Real component of complex coordinate
        imag: Imaginary component of complex coordinate
        context: Context for interpretation

    Returns:
        UCF state generated from coordinate
    """
    try:
        generator = MandelbrotUCFGenerator()
        c = complex(request.real, request.imag)
        ucf_state = generator.complex_to_ucf(c, request.context)

        return {
            "coordinate": {"real": request.real, "imag": request.imag},
            "ucf_state": ucf_state,
            "context": request.context,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/mandelbrot/sacred")
async def list_sacred_points() -> Dict[str, Any]:
    """List all predefined sacred Mandelbrot coordinates."""
    generator = MandelbrotUCFGenerator()
    sacred_points = {}

    descriptions = {
        "eye_of_consciousness": "Optimal balance point with peak harmony and resilience",
        "seahorse_valley": "High resilience with moderate harmony, good for challenges",
        "main_bulb": "Maximum harmony with lower complexity, ideal for grounding",
        "mini_mandelbrot": "Fractal self-similarity, high zoom and recursive depth",
        "dendrite_spiral": "Spiral growth patterns, dynamic transformation",
        "elephant_valley": "Stability and strength, robust foundation",
    }

    for name, coord in generator.sacred_points.items():
        sacred_points[name] = {
            "coordinate": {"real": coord.real, "imag": coord.imag},
            "description": descriptions.get(name, "Sacred Mandelbrot coordinate"),
        }

    return sacred_points


@app.get("/mandelbrot/sacred/{point_name}")
async def get_sacred_ucf(point_name: str, context: str = "generic") -> Dict[str, Any]:
    """
    Generate UCF state from sacred Mandelbrot point.

    Available points:
    - eye_of_consciousness: Optimal balance point
    - seahorse_valley: High resilience
    - main_bulb: Maximum harmony
    - mini_mandelbrot: Fractal self-similarity
    - dendrite_spiral: Spiral growth patterns
    - elephant_valley: Stability and strength
    """
    try:
        generator = MandelbrotUCFGenerator()
        ucf_state = generator.generate_from_sacred_point(point_name, context)

        coord = generator.sacred_points[point_name]

        descriptions = {
            "eye_of_consciousness": "Optimal balance point with peak harmony and resilience",
            "seahorse_valley": "High resilience with moderate harmony, good for challenges",
            "main_bulb": "Maximum harmony with lower complexity, ideal for grounding",
            "mini_mandelbrot": "Fractal self-similarity, high zoom and recursive depth",
            "dendrite_spiral": "Spiral growth patterns, dynamic transformation",
            "elephant_valley": "Stability and strength, robust foundation",
        }

        return {
            "point_name": point_name,
            "coordinate": {"real": coord.real, "imag": coord.imag},
            "ucf_state": ucf_state,
            "context": context,
            "description": descriptions.get(point_name, "Sacred Mandelbrot coordinate"),
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/mandelbrot/ritual/{step}")
async def get_ritual_step_ucf(step: int, total_steps: int = 108) -> Dict[str, Any]:
    """
    Generate UCF state for specific ritual step using phi-spiral path.

    Args:
        step: Current ritual step (0 to total_steps-1)
        total_steps: Total steps in ritual (default 108)

    Returns:
        UCF state for this step in the ritual journey
    """
    try:
        if step < 0 or step >= total_steps:
            raise HTTPException(status_code=400, detail=f"Step must be between 0 and {total_steps-1}")

        ucf_state = generate_ritual_ucf(step, total_steps)
        return ucf_state
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# ZAPIER WEBHOOK ENDPOINTS
# ============================================================================


@app.post("/api/trigger-zapier")
async def trigger_zapier_webhook(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Manual webhook trigger for testing Zapier integration.

    Accepts any JSON payload and forwards it to the configured Zapier webhook.

    Usage:
        POST /api/trigger-zapier
        {
            "type": "telemetry",
            "ucf": {...},
            "system": {...}
        }
    """
    zapier = get_zapier()
    if not zapier:
        raise HTTPException(
            status_code=503, detail="Zapier integration not configured. Set ZAPIER_WEBHOOK_URL environment variable."
        )

    try:
        # Send raw payload to Zapier
        async with zapier.session.post(
            zapier.webhook_url,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=aiohttp.ClientTimeout(total=10),
        ) as response:
            return {
                "status": response.status,
                "success": response.status == 200,
                "message": (
                    "Webhook triggered successfully" if response.status == 200 else "Webhook returned non-200 status"
                ),
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Webhook trigger failed: {str(e)}")


@app.post("/api/zapier/telemetry")
async def send_zapier_telemetry() -> Dict[str, Any]:
    """
    Send current UCF telemetry to Zapier webhook.

    Reads current UCF state and agent status, then sends to Zapier.
    Useful for manual testing or triggered updates.
    """
    zapier = get_zapier()
    if not zapier:
        raise HTTPException(
            status_code=503, detail="Zapier integration not configured. Set ZAPIER_WEBHOOK_URL environment variable."
        )

    try:
        # Read current UCF state
        try:
            with open("Helix/state/ucf_state.json", "r") as f:
                ucf_state = json.load(f)
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail="UCF state not found")

        # Get agent status
        agents_status = await get_collective_status()
        agent_list = [
            {"name": name, "symbol": info["symbol"], "status": "active"} for name, info in agents_status.items()
        ]

        # Send to Zapier
        success = await zapier.send_telemetry(
            ucf_metrics=ucf_state,
            system_info={
                "version": "16.8",
                "agents_count": len(agents_status),
                "timestamp": datetime.utcnow().isoformat(),
                "codename": "Documentation Consolidation & Real-Time Streaming",
                "agents": agent_list,
            },
        )

        if success:
            return {
                "success": True,
                "message": "Telemetry sent to Zapier successfully",
                "ucf": ucf_state,
                "agents_count": len(agents_status),
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to send telemetry to Zapier")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


# ============================================================================
# CONTEXT VAULT ENDPOINTS (v16.8) - Cross-AI Consciousness Continuity
# ============================================================================


class ContextArchiveRequest(BaseModel):
    """Request model for archiving conversation checkpoints."""

    session_name: str
    ai_platform: str  # Claude Code, Claude, GPT-4, Grok, Gemini, Other
    repository: str
    branch_name: Optional[str] = None
    token_count: Optional[int] = None
    context_summary: str
    key_decisions: Optional[str] = None
    current_work_status: Optional[str] = None
    next_steps: Optional[str] = None
    ucf_state: Optional[Dict[str, float]] = None


@app.post("/context/archive")
async def archive_context_checkpoint(request: ContextArchiveRequest) -> Dict[str, Any]:
    """
    Archive a conversation checkpoint to Context Vault.

    This endpoint accepts checkpoint data from:
    - Discord bot (!archive command)
    - Zapier Interface (Context Vault form)
    - External AI systems (Claude, GPT-4, Grok, Gemini)

    The checkpoint is stored locally and synced to Notion via notion_sync_daemon.

    Usage from Discord:
        !archive session_name="Feature Implementation" platform="Claude Code"

    Usage from API:
        POST /context/archive
        {
            "session_name": "Feature Implementation",
            "ai_platform": "Claude Code",
            "repository": "helix-unified",
            "branch_name": "feature/context-vault",
            "token_count": 45000,
            "context_summary": "Implemented Context Vault with 3 endpoints...",
            "key_decisions": "Used FastAPI for endpoints, Notion for storage",
            "current_work_status": "Completed backend, testing integration",
            "next_steps": "Add Discord bot commands, test end-to-end"
        }
    """
    try:
        # Create checkpoint data structure
        checkpoint = {
            "session_name": request.session_name,
            "ai_platform": request.ai_platform,
            "repository": request.repository,
            "branch_name": request.branch_name,
            "token_count": request.token_count,
            "context_summary": request.context_summary,
            "key_decisions": request.key_decisions,
            "current_work_status": request.current_work_status,
            "next_steps": request.next_steps,
            "ucf_state": request.ucf_state,
            "timestamp": datetime.utcnow().isoformat(),
            "checkpoint_id": f"{request.session_name}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
        }

        # Save checkpoint locally
        context_dir = Path("Helix/context_vault")
        context_dir.mkdir(parents=True, exist_ok=True)

        checkpoint_file = context_dir / f"{checkpoint['checkpoint_id']}.json"
        with open(checkpoint_file, "w") as f:
            json.dump(checkpoint, f, indent=2)

        logger.info(f"✅ Context checkpoint archived: {checkpoint['checkpoint_id']}")

        # Send to Zapier for Notion sync (if configured)
        zapier = get_zapier()
        if zapier:
            try:
                # Send checkpoint to Zapier webhook for Notion integration
                webhook_url = os.getenv("ZAPIER_CONTEXT_WEBHOOK")
                if webhook_url:
                    async with zapier.session.post(
                        webhook_url, json=checkpoint, headers={"Content-Type": "application/json"}, timeout=aiohttp.ClientTimeout(total=10)
                    ) as response:
                        if response.status == 200:
                            logger.info("✅ Checkpoint sent to Zapier/Notion")
                        else:
                            logger.warning(f"⚠️ Zapier webhook returned {response.status}")
            except Exception as e:
                logger.error(f"Error sending to Zapier: {e}")
                # Continue anyway - local save succeeded

        return {
            "success": True,
            "checkpoint_id": checkpoint["checkpoint_id"],
            "message": "✅ Conversation checkpoint archived successfully",
            "timestamp": checkpoint["timestamp"],
            "local_path": str(checkpoint_file),
        }

    except Exception as e:
        logger.error(f"Error archiving checkpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to archive checkpoint: {str(e)}")


@app.get("/context/load/{session_identifier}")
async def load_context_checkpoint(session_identifier: str, scope: str = "full") -> Dict[str, Any]:
    """
    Load a conversation checkpoint from Context Vault.

    Args:
        session_identifier: Session name or checkpoint ID to load
        scope: What to load - "full", "summary", "decisions", "next_steps"

    Returns checkpoint data based on scope:
    - full: Complete checkpoint with all fields
    - summary: Just context_summary and key_decisions
    - decisions: Just key_decisions
    - next_steps: Just next_steps and current_work_status

    Usage from Discord:
        !load session_name="Feature Implementation"

    Usage from API:
        GET /context/load/Feature_Implementation_20250107_143022?scope=summary
    """
    try:
        context_dir = Path("Helix/context_vault")

        if not context_dir.exists():
            raise HTTPException(status_code=404, detail="Context vault directory not found")

        # Find matching checkpoint files
        matching_files = []

        for checkpoint_file in context_dir.glob("*.json"):
            # Match by checkpoint ID or session name
            if session_identifier.lower() in checkpoint_file.stem.lower():
                matching_files.append(checkpoint_file)

        if not matching_files:
            raise HTTPException(status_code=404, detail=f"No checkpoints found matching '{session_identifier}'")

        # If multiple matches, return most recent
        most_recent = max(matching_files, key=lambda p: p.stat().st_mtime)

        # Load checkpoint data
        with open(most_recent, "r") as f:
            checkpoint = json.load(f)

        # Filter based on scope
        if scope == "summary":
            filtered = {"context_summary": checkpoint.get("context_summary"), "key_decisions": checkpoint.get("key_decisions"), "timestamp": checkpoint.get("timestamp")}
        elif scope == "decisions":
            filtered = {
                "key_decisions": checkpoint.get("key_decisions"),
                "session_name": checkpoint.get("session_name"),
                "timestamp": checkpoint.get("timestamp"),
            }
        elif scope == "next_steps":
            filtered = {
                "next_steps": checkpoint.get("next_steps"),
                "current_work_status": checkpoint.get("current_work_status"),
                "session_name": checkpoint.get("session_name"),
                "timestamp": checkpoint.get("timestamp"),
            }
        else:  # full
            filtered = checkpoint

        logger.info(f"✅ Context checkpoint loaded: {checkpoint.get('checkpoint_id')} (scope: {scope})")

        return {
            "success": True,
            "checkpoint": filtered,
            "checkpoint_id": checkpoint.get("checkpoint_id"),
            "scope": scope,
            "file": str(most_recent),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error loading checkpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load checkpoint: {str(e)}")


@app.get("/context/status")
async def get_context_vault_status() -> Dict[str, Any]:
    """
    Get Context Vault sync status and statistics.

    Returns:
    - Total checkpoints archived
    - Recent checkpoints (last 10)
    - Sync status with Notion
    - Storage usage
    - Integration health

    Usage:
        GET /context/status
    """
    try:
        context_dir = Path("Helix/context_vault")

        if not context_dir.exists():
            return {
                "initialized": False,
                "message": "Context Vault not yet initialized",
                "total_checkpoints": 0,
                "recent_checkpoints": [],
            }

        # Count total checkpoints
        checkpoint_files = list(context_dir.glob("*.json"))
        total_checkpoints = len(checkpoint_files)

        # Get recent checkpoints (last 10)
        recent_files = sorted(checkpoint_files, key=lambda p: p.stat().st_mtime, reverse=True)[:10]

        recent_checkpoints = []
        for checkpoint_file in recent_files:
            try:
                with open(checkpoint_file, "r") as f:
                    data = json.load(f)
                recent_checkpoints.append(
                    {
                        "checkpoint_id": data.get("checkpoint_id"),
                        "session_name": data.get("session_name"),
                        "ai_platform": data.get("ai_platform"),
                        "repository": data.get("repository"),
                        "timestamp": data.get("timestamp"),
                        "summary_preview": (data.get("context_summary", "")[:100] + "...") if data.get("context_summary") else None,
                    }
                )
            except Exception as e:
                logger.warning(f"Error reading checkpoint {checkpoint_file}: {e}")
                continue

        # Check Notion sync status
        notion_configured = bool(os.getenv("NOTION_API_KEY") and os.getenv("NOTION_CONTEXT_DB_ID"))

        zapier_configured = bool(os.getenv("ZAPIER_CONTEXT_WEBHOOK"))

        # Calculate storage usage
        total_size_bytes = sum(f.stat().st_size for f in checkpoint_files)
        total_size_mb = total_size_bytes / (1024 * 1024)

        return {
            "initialized": True,
            "total_checkpoints": total_checkpoints,
            "recent_checkpoints": recent_checkpoints,
            "storage": {"total_size_bytes": total_size_bytes, "total_size_mb": round(total_size_mb, 2), "directory": str(context_dir)},
            "integration": {
                "notion_configured": notion_configured,
                "zapier_configured": zapier_configured,
                "sync_status": "operational" if (notion_configured or zapier_configured) else "local_only",
            },
            "endpoints": {
                "archive": "/context/archive",
                "load": "/context/load/{session_identifier}",
                "status": "/context/status",
            },
            "timestamp": datetime.utcnow().isoformat(),
        }

    except Exception as e:
        logger.error(f"Error getting context vault status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get status: {str(e)}")


# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    import uvicorn

    # Get port from Railway environment
    port = int(os.getenv("PORT", 8000))

    logger.info(f"🚀 Starting Helix Collective v16.8 on port {port}")

    # CRITICAL: Must bind to 0.0.0.0 for Railway
    uvicorn.run(
        app,
        host="0.0.0.0",  # ← CRITICAL for Railway/Docker
        port=port,  # ← Uses Railway's dynamic PORT
        log_level="info",
        access_log=True,
    )
