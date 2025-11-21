# Discord Voice Commander Bot

Deploy Helix portals using voice commands in Discord!

## Features

- 🎤 **Voice Command Recognition** - Speak commands in voice channels
- 📝 **Text Command Fallback** - Use `!helix` commands in text channels
- 🔐 **Admin-Only Access** - Restrict portal deployment to specific users
- 🚀 **Full Portal Control** - Deploy single portals, categories, or all 51 portals
- ✅ **Real-time Feedback** - Get deployment status in text channels
- 🎯 **Natural Language** - Understands various command phrasings

## Quick Start

### 1. Create Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name it "Helix Voice Commander"
4. Go to "Bot" tab
5. Click "Add Bot"
6. Enable these **Privileged Gateway Intents**:
   - ✅ Message Content Intent
   - ✅ Server Members Intent
7. Copy the bot token

### 2. Configure Bot Permissions

In the "OAuth2" → "URL Generator" section:

**Scopes**:
- ✅ bot
- ✅ applications.commands

**Bot Permissions**:
- ✅ Read Messages/View Channels
- ✅ Send Messages
- ✅ Connect (Voice)
- ✅ Speak (Voice)
- ✅ Use Voice Activity

Copy the generated URL and use it to add the bot to your server.

### 3. Set Up Environment Variables

Create `.env` file in the `discord-bot/` directory:

```bash
# Required
DISCORD_BOT_TOKEN=your_bot_token_here

# Optional: Restrict to specific admin user
DISCORD_ADMIN_USER_ID=your_discord_user_id

# Optional: Specific voice channel to monitor
DISCORD_VOICE_CHANNEL_ID=channel_id
```

**How to get your Discord User ID**:
1. Enable Developer Mode in Discord (Settings → Advanced → Developer Mode)
2. Right-click your username
3. Click "Copy ID"

### 4. Install Dependencies

```bash
cd discord-bot
npm install
```

### 5. Run the Bot

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

## Voice Commands

### Deploy Commands

| Command | Action |
|---------|--------|
| "Deploy all portals" | Deploy all 51 portals |
| "Deploy everything" | Deploy all 51 portals |
| "Deploy core portals" | Deploy 12 core infrastructure portals |
| "Deploy AI agents" | Deploy 17 AI agent portals |
| "Deploy consciousness portals" | Deploy 17 consciousness portals |
| "Deploy system portals" | Deploy 6 system portals |
| "Deploy helix hub" | Deploy specific portal by name |

### Status Commands

| Command | Action |
|---------|--------|
| "Check status" | Get current portal deployment status |
| "Portal status" | Get current portal deployment status |

### Help Commands

| Command | Action |
|---------|--------|
| "Help" | Show available commands |
| "Commands" | Show available commands |

## Text Commands (Fallback)

If voice recognition isn't working, use text commands in any channel:

```
!helix deploy all portals
!helix deploy core
!helix check status
!helix help
```

## Usage Examples

### Example 1: Deploy All Portals

1. Join a voice channel
2. Say: **"Deploy all portals"**
3. Bot responds in text channel: "✅ All 51 portals queued for deployment"

### Example 2: Deploy Specific Category

1. Join a voice channel
2. Say: **"Deploy consciousness portals"**
3. Bot responds: "✅ 17 consciousness portals queued for deployment"

### Example 3: Check Status

1. Join a voice channel
2. Say: **"Check portal status"**
3. Bot responds with current deployment status

## Architecture

```
Discord Voice Channel
    ↓
Voice Audio Stream
    ↓
Speech-to-Text (Whisper/Google/Azure)
    ↓
Command Parser
    ↓
Portal Orchestrator
    ↓
Deployment System
    ↓
Text Channel Feedback
```

## Speech-to-Text Integration

The bot supports multiple speech-to-text providers. Choose one:

### Option 1: OpenAI Whisper API (Recommended)

```bash
# Add to .env
OPENAI_API_KEY=your_openai_api_key
```

Update `transcribeAudio()` function to use Whisper API.

### Option 2: Google Speech-to-Text

```bash
# Add to .env
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

Install Google Cloud SDK and update `transcribeAudio()` function.

### Option 3: Azure Speech Services

```bash
# Add to .env
AZURE_SPEECH_KEY=your_azure_key
AZURE_SPEECH_REGION=your_region
```

Install Azure SDK and update `transcribeAudio()` function.

## Security

### Admin-Only Access

Set `DISCORD_ADMIN_USER_ID` in `.env` to restrict portal deployment to a specific user:

```bash
DISCORD_ADMIN_USER_ID=123456789012345678
```

Without this, **anyone** in the voice channel can deploy portals.

### Rate Limiting

Consider adding rate limiting to prevent abuse:

```javascript
const rateLimits = new Map();

function checkRateLimit(userId) {
  const now = Date.now();
  const userLimit = rateLimits.get(userId) || { count: 0, resetAt: now + 60000 };
  
  if (now > userLimit.resetAt) {
    userLimit.count = 0;
    userLimit.resetAt = now + 60000;
  }
  
  if (userLimit.count >= 5) {
    return false; // Rate limited
  }
  
  userLimit.count++;
  rateLimits.set(userId, userLimit);
  return true;
}
```

## Troubleshooting

### Bot doesn't join voice channel

- Check bot has "Connect" and "Speak" permissions
- Verify voice channel isn't full or restricted
- Check console for error messages

### Voice commands not recognized

- Ensure speech-to-text service is configured
- Check microphone permissions in Discord
- Try text commands as fallback (`!helix`)

### Deployment fails

- Verify portal orchestrator scripts are accessible
- Check file permissions
- Review deployment logs

### Bot disconnects frequently

- Check network stability
- Increase timeout values in code
- Review Discord API rate limits

## Advanced Configuration

### Custom Command Prefix

Change the text command prefix from `!helix` to something else:

```javascript
if (message.content.startsWith('!deploy')) {
  // Your custom prefix
}
```

### Multiple Admin Users

Allow multiple users to deploy portals:

```javascript
const ADMIN_USER_IDS = [
  '123456789012345678',
  '987654321098765432',
];

if (!ADMIN_USER_IDS.includes(userId)) {
  // Access denied
}
```

### Custom Voice Channel

Monitor a specific voice channel only:

```javascript
if (newState.channelId === VOICE_CHANNEL_ID) {
  // Join and listen
}
```

## Integration with Helix Ecosystem

The Discord bot integrates seamlessly with:

- **Portal Orchestrator** - Uses `generate-portal.js` scripts
- **51-Portal Configuration** - Reads from `51-portals-complete.json`
- **Manus Deployment** - Triggers actual portal deployments
- **Notion Logging** - Can log deployments to Notion (optional)
- **Zapier Webhooks** - Can trigger additional workflows (optional)

## Roadmap

- [ ] Implement actual speech-to-text integration
- [ ] Add deployment progress tracking
- [ ] Support for rollback commands
- [ ] Voice feedback (bot speaks responses)
- [ ] Multi-language support
- [ ] Deployment scheduling via voice
- [ ] Portal health monitoring commands

## Support

For issues or questions:
- GitHub: https://github.com/Deathcharge/Helix-Unified-Hub
- Discord: Create an issue in the repository

---

**Built with consciousness by the Helix Collective** 🌀✨
