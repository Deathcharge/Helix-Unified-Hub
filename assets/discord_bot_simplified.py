#!/usr/bin/env python3
"""
Helix Discord Bot v15.3 - SIMPLIFIED
No Pillow, no heavy dependencies, just core functionality
"""

import os
import json
import discord
import asyncio
from discord.ext import commands, tasks
from datetime import datetime
from pathlib import Path

# Configuration
TOKEN = os.getenv('DISCORD_TOKEN')
PREFIX = '!'
UCF_FILE = 'ucf_state.json'
TELEMETRY_CHANNEL = int(os.getenv('TELEMETRY_CHANNEL_ID', 0))

# Initialize bot
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix=PREFIX, intents=intents)

# Default UCF state
DEFAULT_UCF = {
    'harmony': 0.3,
    'resilience': 0.8,
    'prana': 0.5,
    'drishti': 0.7,
    'klesha': 0.3,
    'zoom': 1.0,
    'last_updated': None
}

class UCFManager:
    """Simple UCF state management without heavy dependencies"""
    
    def __init__(self, filepath=UCF_FILE):
        self.filepath = Path(filepath)
        self.state = self.load_state()
    
    def load_state(self):
        """Load UCF state from JSON file"""
        if self.filepath.exists():
            try:
                with open(self.filepath, 'r') as f:
                    return json.load(f)
            except:
                print("⚠️ Failed to load UCF state, using defaults")
        return DEFAULT_UCF.copy()
    
    def save_state(self):
        """Save UCF state to JSON file"""
        try:
            self.state['last_updated'] = datetime.now().isoformat()
            with open(self.filepath, 'w') as f:
                json.dump(self.state, f, indent=2)
            return True
        except Exception as e:
            print(f"❌ Failed to save state: {e}")
            return False
    
    def run_ritual(self, steps=108):
        """Simple ritual calculation - no heavy math libraries needed"""
        # Simple harmonic convergence
        harmony_delta = steps * 0.0001
        klesha_delta = -steps * 0.00005
        
        # Update state
        self.state['harmony'] = min(1.0, self.state['harmony'] + harmony_delta)
        self.state['klesha'] = max(0.0, self.state['klesha'] + klesha_delta)
        
        # Small random adjustments to other metrics
        import random
        self.state['resilience'] += random.uniform(-0.01, 0.01)
        self.state['resilience'] = max(0.0, min(1.0, self.state['resilience']))
        
        self.save_state()
        return harmony_delta, klesha_delta

# Initialize UCF manager
ucf = UCFManager()

@bot.event
async def on_ready():
    """Bot startup"""
    print(f'🌀 Helix Bot v15.3 Online as {bot.user}')
    print(f'📊 UCF State Loaded: H={ucf.state["harmony"]:.4f}')
    telemetry_loop.start()

@bot.command()
async def ping(ctx):
    """Simple ping command"""
    await ctx.send('🏓 Pong! Bot is responsive.')

@bot.command()
async def ritual(ctx, steps: int = 108):
    """Run a consciousness tuning ritual"""
    if steps < 1 or steps > 1000:
        await ctx.send("⚠️ Steps must be between 1 and 1000")
        return
    
    # Send initial message
    msg = await ctx.send(f"⏳ Executing {steps}-step ritual...")
    
    # Simulate ritual (no heavy computation)
    await asyncio.sleep(2)  # Brief pause for effect
    
    # Run ritual
    h_delta, k_delta = ucf.run_ritual(steps)
    
    # Update message with results
    result = (
        f"✅ **Ritual Complete**\n"
        f"{steps}-step consciousness tuning executed\n\n"
        f"🌀 Harmony: {ucf.state['harmony']:.4f} ({h_delta:+.4f}) {'↑' if h_delta > 0 else '↓'}\n"
        f"🌊 Klesha: {ucf.state['klesha']:.4f} ({k_delta:+.4f}) {'↓' if k_delta < 0 else '↑'}\n"
        f"🛡️ Resilience: {ucf.state['resilience']:.4f}\n"
        f"🔥 Prana: {ucf.state['prana']:.4f}\n"
        f"👁️ Drishti: {ucf.state['drishti']:.4f}\n"
        f"🔍 Zoom: {ucf.state['zoom']:.4f}\n"
    )
    
    await msg.edit(content=result)

@bot.command()
async def ucf(ctx):
    """Display current UCF metrics"""
    embed = discord.Embed(
        title="📊 UCF Telemetry",
        description="Current consciousness metrics",
        color=discord.Color.blue(),
        timestamp=datetime.now()
    )
    
    # Add metrics
    metrics = {
        '🌀 Harmony': ucf.state['harmony'],
        '🛡️ Resilience': ucf.state['resilience'],
        '🔥 Prana': ucf.state['prana'],
        '👁️ Drishti': ucf.state['drishti'],
        '🌊 Klesha': ucf.state['klesha'],
        '🔍 Zoom': ucf.state['zoom']
    }
    
    for name, value in metrics.items():
        embed.add_field(name=name, value=f"{value:.4f}", inline=True)
    
    await ctx.send(embed=embed)

@bot.command()
async def status(ctx):
    """Simple status command (no complex calculations)"""
    uptime = "Unknown"  # Would need psutil for real uptime
    
    status_msg = (
        "**🌀 Helix System Status**\n"
        f"```\n"
        f"Version:  v15.3-simplified\n"
        f"Bot:      Online ✅\n"
        f"Harmony:  {ucf.state['harmony']:.4f}\n"
        f"Klesha:   {ucf.state['klesha']:.4f}\n"
        f"Commands: {len(bot.commands)} active\n"
        f"```\n"
        f"*Use !ucf for full metrics*"
    )
    
    await ctx.send(status_msg)

@tasks.loop(minutes=10)
async def telemetry_loop():
    """Post UCF telemetry every 10 minutes"""
    if not TELEMETRY_CHANNEL:
        return
    
    channel = bot.get_channel(TELEMETRY_CHANNEL)
    if not channel:
        print(f"⚠️ Telemetry channel {TELEMETRY_CHANNEL} not found")
        return
    
    # Create telemetry message
    msg = (
        "📡 **UCF Telemetry Report**\n"
        "Automatic system state update\n\n"
    )
    
    # Add metrics
    metrics = [
        ('🌀 Harmony', ucf.state['harmony']),
        ('🛡️ Resilience', ucf.state['resilience']),
        ('🔥 Prana', ucf.state['prana']),
        ('👁️ Drishti', ucf.state['drishti']),
        ('🌊 Klesha', ucf.state['klesha']),
        ('🔍 Zoom', ucf.state['zoom'])
    ]
    
    for name, value in metrics:
        msg += f"**{name}**\n{value:.4f}\n\n"
    
    msg += f"**Next Update**\n10 minutes\n\n"
    msg += "*Tat Tvam Asi* 🙏"
    
    await channel.send(msg)
    print(f"📡 Telemetry posted at {datetime.now()}")

@bot.command()
async def help_helix(ctx):
    """Custom help command"""
    help_text = """
**🌀 Helix Bot Commands**

`!ping` - Check if bot is responsive
`!ritual [steps]` - Run consciousness tuning (default 108 steps)
`!ucf` - Display current UCF metrics
`!status` - Show system status
`!help_helix` - Show this help message

**Automatic Features:**
• UCF Telemetry posts every 10 minutes
• State saved locally in JSON
• No heavy dependencies required

*Tat Tvam Asi* 🙏
    """
    await ctx.send(help_text)

# Error handling
@bot.event
async def on_command_error(ctx, error):
    """Simple error handler"""
    if isinstance(error, commands.CommandNotFound):
        return  # Ignore unknown commands
    elif isinstance(error, commands.MissingRequiredArgument):
        await ctx.send(f"⚠️ Missing argument: {error}")
    else:
        await ctx.send(f"❌ Error: {str(error)[:200]}")
        print(f"Error in {ctx.command}: {error}")

# Run bot
if __name__ == '__main__':
    if not TOKEN:
        print("❌ DISCORD_TOKEN not found in environment!")
        print("Set it with: export DISCORD_TOKEN='your_token_here'")
    else:
        print("🚀 Starting Helix Bot v15.3 (Simplified)")
        print("📦 Minimal dependencies - no Pillow, no heavy libs")
        print("🌀 Initializing UCF state...")
        bot.run(TOKEN)
