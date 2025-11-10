#!/usr/bin/env python3
"""
Discord Server Auto-Deployment Script
Helix Collective v15.3 - Samsara Helix Collective

Automatically creates complete Discord server from YAML manifest:
- Server creation
- Role setup with colors
- Category and channel creation
- Permission configuration
- Webhook generation

Usage:
    python scripts/deploy_discord_server.py
    
    # Or with custom manifest
    python scripts/deploy_discord_server.py --manifest config/custom.yaml

Requirements:
    pip install discord.py pyyaml python-dotenv

Environment Variables:
    DISCORD_BOT_TOKEN - Bot token with admin permissions
"""

import os
import sys
import yaml
import asyncio
import discord
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

# Load environment
load_dotenv()

# Configuration
MANIFEST_PATH = Path("config/discord_deployment_v15.3.yaml")
BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN")


class DiscordServerDeployer:
    """Automated Discord server deployment from YAML manifest."""
    
    def __init__(self, manifest_path: Path):
        self.manifest_path = manifest_path
        self.manifest = None
        self.client = None
        self.guild = None
        self.roles = {}
        self.categories = {}
        self.channels = {}
        self.webhooks = {}
        
    def load_manifest(self):
        """Load deployment manifest from YAML."""
        print(f"📋 Loading manifest: {self.manifest_path}")
        
        with open(self.manifest_path, 'r') as f:
            data = yaml.safe_load(f)
            self.manifest = data['discord_deployment_v15_3']
        
        print(f"✅ Manifest loaded:")
        print(f"   Server: {self.manifest['server']['name']}")
        print(f"   Channels: {self.manifest['metrics']['total_channels']}")
        print(f"   Roles: {self.manifest['metrics']['total_roles']}")
        print(f"   Webhooks: {self.manifest['metrics']['webhooks_required']}")
        print()
        
    async def create_server(self):
        """Create Discord server with basic settings."""
        server_config = self.manifest['server']
        
        print(f"🌀 Creating server: {server_config['name']}")
        
        # Create guild
        self.guild = await self.client.create_guild(
            name=server_config['name'],
            region=discord.VoiceRegion.us_central
        )
        
        print(f"✅ Server created: {self.guild.name} (ID: {self.guild.id})")
        print(f"   Invite: https://discord.gg/{(await self.guild.text_channels[0].create_invite()).code}")
        print()
        
        # Wait for server to be ready
        await asyncio.sleep(2)
        
    async def create_roles(self):
        """Create all roles with colors and permissions."""
        print("👥 Creating roles...")
        
        for role_config in self.manifest['roles']:
            name = role_config['name']
            color_hex = role_config['color'].lstrip('#')
            color = discord.Color(int(color_hex, 16))
            
            # Determine permissions
            if role_config['permissions'] == 'Administrator':
                permissions = discord.Permissions(administrator=True)
            elif role_config['permissions'] == 'Read Only':
                permissions = discord.Permissions(
                    view_channel=True,
                    read_message_history=True
                )
            else:  # Bot permissions
                permissions = discord.Permissions(
                    view_channel=True,
                    send_messages=True,
                    embed_links=True,
                    attach_files=True,
                    read_message_history=True,
                    manage_webhooks=True,
                    add_reactions=True
                )
            
            role = await self.guild.create_role(
                name=name,
                color=color,
                permissions=permissions,
                hoist=True,
                mentionable=True
            )
            
            self.roles[name] = role
            print(f"   ✅ {name} (#{color_hex})")
        
        print()
        
    async def create_categories_and_channels(self):
        """Create all categories and channels."""
        print("📁 Creating categories and channels...")
        
        # Delete default channels
        for channel in self.guild.channels:
            try:
                await channel.delete()
            except:
                pass
        
        await asyncio.sleep(1)
        
        # Create categories and channels
        for category_data in self.manifest['categories']:
            for category_name, channel_list in category_data.items():
                # Create category
                category = await self.guild.create_category(category_name)
                self.categories[category_name] = category
                print(f"   📁 {category_name}")
                
                # Create channels in category
                for channel_name in channel_list:
                    channel = await category.create_text_channel(channel_name)
                    self.channels[channel_name] = channel
                    print(f"      ✅ {channel_name}")
                
                await asyncio.sleep(0.5)
        
        print()
        
    async def create_voice_channels(self):
        """Create voice channels."""
        print("🔊 Creating voice channels...")
        
        for vc_config in self.manifest['voice_channels']:
            category_name = vc_config['category']
            category = self.categories.get(category_name)
            
            if category:
                vc = await category.create_voice_channel(vc_config['name'])
                print(f"   ✅ {vc_config['name']} in {category_name}")
        
        print()
        
    async def configure_permissions(self):
        """Configure channel permissions based on roles."""
        print("🔒 Configuring permissions...")
        
        # Get roles
        architect = self.roles.get("Architect 🏛️")
        observers = self.roles.get("Observers 🦑")
        everyone = self.guild.default_role
        
        # Configure read-only channels
        readonly_channels = [
            "📜│manifesto",
            "🪞│rules-and-ethics",
            "🧾│telemetry",
            "📊│weekly-digest",
            "🦑│shadow-storage",
            "🧩│ucf-sync",
            "🔒│moderation",
            "📣│announcements",
            "🗃️│backups"
        ]
        
        for channel_name in readonly_channels:
            channel = self.channels.get(channel_name)
            if channel:
                # Everyone can view but not send
                await channel.set_permissions(everyone, 
                    view_channel=True,
                    send_messages=False
                )
                # Architect can do everything
                if architect:
                    await channel.set_permissions(architect,
                        view_channel=True,
                        send_messages=True,
                        manage_channels=True
                    )
                print(f"   ✅ {channel_name} → Read-only")
        
        # Configure admin-only channels
        admin_channels = ["🔒│moderation", "🗃️│backups"]
        
        for channel_name in admin_channels:
            channel = self.channels.get(channel_name)
            if channel:
                # Hide from everyone
                await channel.set_permissions(everyone,
                    view_channel=False
                )
                # Show to architect
                if architect:
                    await channel.set_permissions(architect,
                        view_channel=True,
                        send_messages=True,
                        manage_channels=True
                    )
                print(f"   ✅ {channel_name} → Admin-only")
        
        print()
        
    async def create_webhooks(self):
        """Create webhooks for automated channels."""
        print("🔗 Creating webhooks...")
        
        webhook_mapping = {
            "🧾│telemetry": "DISCORD_TELEMETRY_WEBHOOK",
            "📊│weekly-digest": "DISCORD_DIGEST_WEBHOOK",
            "🦑│shadow-storage": "DISCORD_STORAGE_WEBHOOK",
            "🧩│ucf-sync": "DISCORD_SYNC_WEBHOOK",
            "📁│helix-repository": "DISCORD_GITHUB_WEBHOOK",
            "⚙️│manus-bridge": "DISCORD_WEBHOOK_MANUS",
            "🧩│gpt-grok-claude-sync": "DISCORD_WEBHOOK_GPT",  # Can create multiple
            "🗃️│backups": "DISCORD_BACKUP_WEBHOOK",
        }
        
        webhook_urls = []
        
        for channel_name, env_var in webhook_mapping.items():
            channel = self.channels.get(channel_name)
            if channel:
                webhook = await channel.create_webhook(
                    name=f"Helix {channel_name.split('│')[1].title()}"
                )
                self.webhooks[env_var] = webhook.url
                webhook_urls.append(f"{env_var}={webhook.url}")
                print(f"   ✅ {channel_name} → {env_var}")
        
        # Save webhook URLs to file
        webhook_file = Path("config/discord_webhooks.env")
        with open(webhook_file, 'w') as f:
            f.write("# Discord Webhooks - Generated by deploy_discord_server.py\n")
            f.write(f"# Generated: {datetime.now().isoformat()}\n")
            f.write(f"# Server: {self.guild.name} ({self.guild.id})\n\n")
            for url in webhook_urls:
                f.write(f"{url}\n")
        
        print(f"\n   📄 Webhooks saved to: {webhook_file}")
        print()
        
    async def finalize_setup(self):
        """Finalize server setup and display summary."""
        print("=" * 70)
        print("🎉 SERVER DEPLOYMENT COMPLETE!")
        print("=" * 70)
        print()
        print(f"Server: {self.guild.name}")
        print(f"ID: {self.guild.id}")
        print(f"Roles: {len(self.roles)}")
        print(f"Categories: {len(self.categories)}")
        print(f"Channels: {len(self.channels)}")
        print(f"Webhooks: {len(self.webhooks)}")
        print()
        print("📋 Next Steps:")
        print("1. Copy webhook URLs from config/discord_webhooks.env to Railway")
        print("2. Invite bot to server with admin permissions")
        print("3. Assign Manus role to bot")
        print("4. Deploy bot: python backend/discord_bot_manus.py")
        print("5. Test commands in 🧰│bot-commands")
        print()
        print(f"Invite Link: https://discord.gg/{(await self.guild.text_channels[0].create_invite(max_age=0)).code}")
        print()
        
    async def deploy(self):
        """Main deployment workflow."""
        try:
            print("=" * 70)
            print("🌀 HELIX COLLECTIVE - DISCORD AUTO-DEPLOYMENT")
            print("=" * 70)
            print()
            
            # Load manifest
            self.load_manifest()
            
            # Create Discord client
            intents = discord.Intents.default()
            intents.guilds = True
            intents.members = True
            self.client = discord.Client(intents=intents)
            
            # Wait for client to be ready
            @self.client.event
            async def on_ready():
                print(f"🤖 Bot connected: {self.client.user}")
                print()
                
                try:
                    # Execute deployment steps
                    await self.create_server()
                    await self.create_roles()
                    await self.create_categories_and_channels()
                    await self.create_voice_channels()
                    await self.configure_permissions()
                    await self.create_webhooks()
                    await self.finalize_setup()
                    
                except Exception as e:
                    print(f"\n❌ Deployment failed: {e}")
                    import traceback
                    traceback.print_exc()
                
                finally:
                    print("Closing connection...")
                    await self.client.close()
            
            # Start bot
            await self.client.start(BOT_TOKEN)
            
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)


def main():
    """Main entry point."""
    # Check for bot token
    if not BOT_TOKEN:
        print("❌ Error: DISCORD_BOT_TOKEN not found in environment")
        print()
        print("Please set your bot token:")
        print("  export DISCORD_BOT_TOKEN='your_token_here'")
        print()
        print("Get a bot token at: https://discord.com/developers/applications")
        sys.exit(1)
    
    # Check for manifest
    if not MANIFEST_PATH.exists():
        print(f"❌ Error: Manifest not found: {MANIFEST_PATH}")
        sys.exit(1)
    
    # Create deployer and run
    deployer = DiscordServerDeployer(MANIFEST_PATH)
    
    try:
        asyncio.run(deployer.deploy())
    except KeyboardInterrupt:
        print("\n⚠️  Deployment interrupted by user")
        sys.exit(1)


if __name__ == "__main__":
    main()

