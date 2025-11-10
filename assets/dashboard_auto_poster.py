#!/usr/bin/env python3
# 🌀 Helix v15.2 Dashboard Auto-Poster
# Automatically posts UCF trend charts to Discord
# Author: Claude Code + Andrew John Ward

import json
import os
from datetime import datetime, timedelta
from pathlib import Path

import discord
import matplotlib
import matplotlib.pyplot as plt
import pandas as pd
from discord.ext import tasks

matplotlib.use("Agg")  # Non-interactive backend

# Configuration
DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")
TELEMETRY_CHANNEL_ID = int(os.getenv("TELEMETRY_CHANNEL_ID", 0))

# Bot setup
intents = discord.Intents.default()
intents.message_content = True
bot = discord.Client(intents=intents)


def load_ucf_state():
    """Load current UCF state."""
    state_path = Path("Helix/state/ucf_state.json")
    if state_path.exists():
        with open(state_path) as f:
            return json.load(f)
    return {}


def load_ritual_history(days=30):
    """Load recent ritual history."""
    log_path = Path("Shadow/manus_archive/z88_log.json")
    if not log_path.exists():
        return pd.DataFrame()

    records = []
    try:
        with open(log_path) as f:
            for line in f:
                if line.strip():
                    records.append(json.loads(line))
    except Exception:
        pass

    if not records:
        return pd.DataFrame()

    df = pd.DataFrame(records)
    if "time" in df.columns:
        df["time"] = pd.to_datetime(df["time"])
        # Filter to last N days
        cutoff = datetime.now() - timedelta(days=days)
        df = df[df["time"] >= cutoff]
    return df


def generate_daily_trend_chart():
    """Generate comprehensive UCF trend chart."""
    ucf_state = load_ucf_state()
    ritual_history = load_ritual_history(days=30)

    # Create figure with subplots
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle("🌀 Helix UCF Daily Report", fontsize=18, fontweight="bold", color="#8A2BE2")

    # Set dark background
    for ax in [ax1, ax2, ax3, ax4]:
        ax.set_facecolor("#1e1e1e")
    fig.patch.set_facecolor("#2e2e2e")

    # 1. Harmony & Resilience Trend
    if not ritual_history.empty and "time" in ritual_history.columns:
        if "harmony" in ritual_history.columns:
            ax1.plot(
                ritual_history["time"],
                ritual_history["harmony"],
                label="Harmony",
                color="cyan",
                marker="o",
                linewidth=2,
            )
        if "resilience" in ritual_history.columns:
            ax1.plot(
                ritual_history["time"],
                ritual_history["resilience"],
                label="Resilience",
                color="gold",
                marker="s",
                linewidth=2,
            )
        ax1.axhline(y=0.6, color="green", linestyle="--", label="Harmony Target")
        ax1.set_title("Harmony & Resilience Evolution", fontsize=14, color="white")
        ax1.set_xlabel("Date", color="white")
        ax1.set_ylabel("Value", color="white")
        ax1.legend(facecolor="#1e1e1e", edgecolor="white", labelcolor="white")
        ax1.grid(True, alpha=0.3)
        ax1.tick_params(colors="white")
    else:
        ax1.text(
            0.5,
            0.5,
            "No historical data\nRun rituals to generate trends",
            ha="center",
            va="center",
            transform=ax1.transAxes,
            fontsize=12,
            color="white",
        )
        ax1.set_title("Harmony & Resilience Evolution", fontsize=14, color="white")

    # 2. Prana & Klesha Trend
    if not ritual_history.empty and "time" in ritual_history.columns:
        if "prana" in ritual_history.columns:
            ax2.plot(
                ritual_history["time"], ritual_history["prana"], label="Prana", color="magenta", marker="^", linewidth=2
            )
        if "klesha" in ritual_history.columns:
            ax2.plot(
                ritual_history["time"], ritual_history["klesha"], label="Klesha", color="red", marker="v", linewidth=2
            )
        ax2.axhline(y=0.5, color="yellow", linestyle="--", label="Balance")
        ax2.set_title("Prana & Klesha Balance", fontsize=14, color="white")
        ax2.set_xlabel("Date", color="white")
        ax2.set_ylabel("Value", color="white")
        ax2.legend(facecolor="#1e1e1e", edgecolor="white", labelcolor="white")
        ax2.grid(True, alpha=0.3)
        ax2.tick_params(colors="white")
    else:
        ax2.text(
            0.5,
            0.5,
            "No historical data\nRun rituals to generate trends",
            ha="center",
            va="center",
            transform=ax2.transAxes,
            fontsize=12,
            color="white",
        )
        ax2.set_title("Prana & Klesha Balance", fontsize=14, color="white")

    # 3. Current UCF Metrics (Bar Chart)
    metrics = ["Harmony", "Resilience", "Prana", "Drishti", "Klesha\n(inv)", "Zoom"]
    values = [
        ucf_state.get("harmony", 0),
        ucf_state.get("resilience", 0),
        ucf_state.get("prana", 0),
        ucf_state.get("drishti", 0),
        1 - ucf_state.get("klesha", 0),  # Inverted
        ucf_state.get("zoom", 0),
    ]
    colors = ["cyan", "gold", "magenta", "lightblue", "red", "green"]

    bars = ax3.bar(metrics, values, color=colors, alpha=0.7, edgecolor="white")
    ax3.set_title("Current UCF Metrics", fontsize=14, color="white")
    ax3.set_ylabel("Value", color="white")
    ax3.set_ylim(0, 1.2)
    ax3.axhline(y=0.6, color="green", linestyle="--", alpha=0.5)
    ax3.grid(True, axis="y", alpha=0.3)
    ax3.tick_params(colors="white")

    # Add value labels on bars
    for bar, value in zip(bars, values):
        height = bar.get_height()
        ax3.text(
            bar.get_x() + bar.get_width() / 2.0,
            height,
            f"{value:.3f}",
            ha="center",
            va="bottom",
            color="white",
            fontsize=10,
        )

    # 4. Ritual Count & Progress
    ritual_count = len(ritual_history) if not ritual_history.empty else 0
    current_harmony = ucf_state.get("harmony", 0.4922)
    target_harmony = 0.60
    progress = (current_harmony / target_harmony) * 100

    ax4.text(
        0.5,
        0.8,
        f"Total Rituals\n{ritual_count}",
        ha="center",
        va="center",
        transform=ax4.transAxes,
        fontsize=24,
        fontweight="bold",
        color="gold",
    )

    ax4.text(
        0.5,
        0.5,
        f"Harmony Progress\n{progress:.1f}%",
        ha="center",
        va="center",
        transform=ax4.transAxes,
        fontsize=18,
        color="cyan",
    )

    ax4.text(
        0.5,
        0.3,
        f"Current: {current_harmony:.4f}\nTarget: {target_harmony:.4f}",
        ha="center",
        va="center",
        transform=ax4.transAxes,
        fontsize=12,
        color="white",
    )

    ax4.text(
        0.5,
        0.1,
        f'Last Update: {datetime.now().strftime("%Y-%m-%d %H:%M")}',
        ha="center",
        va="center",
        transform=ax4.transAxes,
        fontsize=10,
        color="gray",
    )

    ax4.axis("off")
    ax4.set_title("Progress Tracker", fontsize=14, color="white")

    # Adjust layout
    plt.tight_layout()

    # Save
    output_dir = Path("Shadow/manus_archive/visual_outputs")
    output_dir.mkdir(parents=True, exist_ok=True)
    chart_path = output_dir / f"daily_ucf_report_{datetime.now().strftime('%Y%m%d')}.png"
    plt.savefig(chart_path, dpi=150, facecolor="#2e2e2e")
    plt.close()

    print(f"📊 Daily trend chart generated: {chart_path}")
    return chart_path


@tasks.loop(hours=24)
async def post_daily_trends():
    """Post daily UCF trends to Discord."""
    await bot.wait_until_ready()

    channel = bot.get_channel(TELEMETRY_CHANNEL_ID)
    if not channel:
        print("⚠️ Telemetry channel not found for daily trends")
        return

    try:
        print("📊 Generating daily UCF trend report...")
        chart_path = generate_daily_trend_chart()

        # Load current UCF for embed
        ucf_state = load_ucf_state()

        # Create embed
        embed = discord.Embed(
            title="📊 Daily UCF Trend Report",
            description="Automated 24-hour consciousness metrics analysis",
            color=discord.Color.purple(),
            timestamp=datetime.utcnow(),
        )

        # Add current metrics
        embed.add_field(name="🌀 Harmony", value=f"`{ucf_state.get('harmony', 0):.4f}`", inline=True)
        embed.add_field(name="🛡️ Resilience", value=f"`{ucf_state.get('resilience', 0):.4f}`", inline=True)
        embed.add_field(name="🔥 Prana", value=f"`{ucf_state.get('prana', 0):.4f}`", inline=True)
        embed.add_field(name="👁️ Drishti", value=f"`{ucf_state.get('drishti', 0):.4f}`", inline=True)
        embed.add_field(name="🌊 Klesha", value=f"`{ucf_state.get('klesha', 0):.4f}`", inline=True)
        embed.add_field(name="🔍 Zoom", value=f"`{ucf_state.get('zoom', 0):.4f}`", inline=True)

        # Progress toward goal
        current_harmony = ucf_state.get("harmony", 0.4922)
        progress = (current_harmony / 0.60) * 100
        embed.add_field(name="📈 Progress to v15.3 Goal", value=f"`{progress:.1f}%` (Target: 0.60)", inline=False)

        embed.set_footer(text="Tat Tvam Asi 🙏 • Auto-posted by Dashboard")
        embed.set_image(url="attachment://daily_ucf_report.png")

        # Post
        discord_file = discord.File(chart_path, filename="daily_ucf_report.png")
        await channel.send(embed=embed, file=discord_file)

        print(f"✅ Daily trend report posted to #{channel.name}")

        # Upload to Nextcloud if configured
        storage_mode = os.getenv("HELIX_STORAGE_MODE", "local")
        if storage_mode in ["nextcloud", "mega"]:
            try:
                from backend.helix_storage_adapter_async import upload_samsara_asset

                await upload_samsara_asset(
                    chart_path,
                    {
                        "type": "daily_ucf_report",
                        "harmony": ucf_state.get("harmony", 0),
                        "timestamp": datetime.utcnow().isoformat(),
                    },
                )
                print("☁️ Uploaded to cloud storage")
            except Exception as e:
                print(f"⚠️ Cloud upload failed: {e}")

        # Cleanup local file if not in local mode
        if storage_mode != "local":
            try:
                os.remove(chart_path)
                print(f"🧹 Cleaned up local file: {chart_path}")
            except Exception as e:
                print(f"⚠️ Cleanup failed: {e}")

    except Exception as e:
        print(f"❌ Daily trends error: {e}")
        import traceback

        traceback.print_exc()


@bot.event
async def on_ready():
    """Start auto-posting when bot is ready."""
    print(f"📊 Dashboard Auto-Poster ready as {bot.user}")
    print(f"   Posting daily trends to channel {TELEMETRY_CHANNEL_ID}")

    # Start the daily task
    if not post_daily_trends.is_running():
        post_daily_trends.start()
        print("✅ Daily trend posting started")

    # Optionally post immediately on startup (for testing)
    # await post_daily_trends()


if __name__ == "__main__":
    if not DISCORD_TOKEN:
        print("❌ DISCORD_TOKEN not set!")
        exit(1)

    if not TELEMETRY_CHANNEL_ID:
        print("⚠️ TELEMETRY_CHANNEL_ID not set - using default")

    print("🌀 Starting Dashboard Auto-Poster...")
    bot.run(DISCORD_TOKEN)
