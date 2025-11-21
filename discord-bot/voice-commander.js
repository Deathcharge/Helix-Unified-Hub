/**
 * Discord Voice Commander Bot
 * 
 * Listens to voice channels and processes voice commands for portal deployment.
 * Integrates with the 51-portal orchestration system.
 * 
 * Setup:
 * 1. Create Discord bot at https://discord.com/developers/applications
 * 2. Enable "Message Content Intent" and "Voice" permissions
 * 3. Add bot to your server
 * 4. Set DISCORD_BOT_TOKEN in .env
 * 5. Run: node discord-bot/voice-commander.js
 */

import { Client, GatewayIntentBits, Events } from 'discord.js';
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  EndBehaviorType
} from '@discordjs/voice';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import prism from 'prism-media';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';

const execAsync = promisify(exec);

// Configuration
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const ADMIN_USER_ID = process.env.DISCORD_ADMIN_USER_ID; // Your Discord user ID
const VOICE_CHANNEL_ID = process.env.DISCORD_VOICE_CHANNEL_ID; // Optional: specific channel

if (!DISCORD_BOT_TOKEN) {
  console.error('❌ DISCORD_BOT_TOKEN environment variable is required');
  process.exit(1);
}

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Voice command parser
function parseVoiceCommand(transcript) {
  const text = transcript.toLowerCase().trim();
  
  // Deploy commands
  if (text.includes('deploy') || text.includes('create')) {
    if (text.includes('all') || text.includes('everything') || text.includes('51')) {
      return {
        action: 'deploy',
        target: 'all',
        message: 'Deploying all 51 portals',
      };
    }
    
    if (text.includes('core')) {
      return {
        action: 'deploy',
        target: 'core',
        message: 'Deploying 12 core portals',
      };
    }
    
    if (text.includes('agent') || text.includes('ai')) {
      return {
        action: 'deploy',
        target: 'agents',
        message: 'Deploying 17 AI agent portals',
      };
    }
    
    if (text.includes('consciousness') || text.includes('awareness')) {
      return {
        action: 'deploy',
        target: 'consciousness',
        message: 'Deploying 17 consciousness portals',
      };
    }
    
    if (text.includes('system')) {
      return {
        action: 'deploy',
        target: 'system',
        message: 'Deploying 6 system portals',
      };
    }
    
    // Single portal deployment
    const portalMatch = text.match(/deploy\s+(\w+[-\w]*)/);
    if (portalMatch) {
      return {
        action: 'deploy',
        target: 'single',
        portalId: portalMatch[1],
        message: `Deploying portal: ${portalMatch[1]}`,
      };
    }
  }
  
  // Status commands
  if (text.includes('status') || text.includes('check')) {
    return {
      action: 'status',
      message: 'Checking portal status',
    };
  }
  
  // Help commands
  if (text.includes('help') || text.includes('command')) {
    return {
      action: 'help',
      message: 'Showing available commands',
    };
  }
  
  return null;
}

// Execute portal deployment
async function executeDeployment(command) {
  try {
    if (command.target === 'all') {
      console.log('🚀 Deploying all 51 portals...');
      const { stdout } = await execAsync('node portal-orchestrator/scripts/generate-portal.js --all');
      return {
        success: true,
        message: 'All 51 portals queued for deployment',
        details: stdout,
      };
    }
    
    if (command.target === 'single' && command.portalId) {
      console.log(`🚀 Deploying portal: ${command.portalId}`);
      const { stdout } = await execAsync(`node portal-orchestrator/scripts/generate-portal.js --portal ${command.portalId}`);
      return {
        success: true,
        message: `Portal ${command.portalId} deployed successfully`,
        details: stdout,
      };
    }
    
    if (['core', 'agents', 'consciousness', 'system'].includes(command.target)) {
      console.log(`🚀 Deploying ${command.target} portals...`);
      const { stdout } = await execAsync(`node portal-orchestrator/scripts/generate-portal.js --type ${command.target}`);
      return {
        success: true,
        message: `${command.target} portals queued for deployment`,
        details: stdout,
      };
    }
    
    return {
      success: false,
      message: 'Unknown deployment target',
    };
  } catch (error) {
    console.error('❌ Deployment error:', error);
    return {
      success: false,
      message: `Deployment failed: ${error.message}`,
    };
  }
}

// Get portal status
async function getPortalStatus() {
  try {
    const { stdout } = await execAsync('node portal-orchestrator/scripts/generate-portal.js --status');
    return {
      success: true,
      message: 'Portal status retrieved',
      details: stdout,
    };
  } catch (error) {
    return {
      success: false,
      message: `Status check failed: ${error.message}`,
    };
  }
}

// Show help
function showHelp() {
  return {
    success: true,
    message: 'Available voice commands',
    details: `
Voice Commands:
- "Deploy all portals" or "Deploy everything" - Deploy all 51 portals
- "Deploy core portals" - Deploy 12 core infrastructure portals
- "Deploy AI agents" - Deploy 17 AI agent portals
- "Deploy consciousness portals" - Deploy 17 consciousness portals
- "Deploy system portals" - Deploy 6 system portals
- "Deploy [portal-name]" - Deploy a specific portal
- "Check status" - Get current portal deployment status
- "Help" - Show this help message

Examples:
- "Deploy helix hub"
- "Deploy all consciousness portals"
- "Check portal status"
    `.trim(),
  };
}

// Process voice command
async function processVoiceCommand(transcript, userId, channel) {
  console.log(`🎤 Voice command received: "${transcript}" from user ${userId}`);
  
  // Check if user is admin
  if (ADMIN_USER_ID && userId !== ADMIN_USER_ID) {
    await channel.send(`❌ Access denied. Only the admin can deploy portals.`);
    return;
  }
  
  const command = parseVoiceCommand(transcript);
  
  if (!command) {
    await channel.send(`❓ I didn't understand that command. Say "help" for available commands.`);
    return;
  }
  
  await channel.send(`⏳ ${command.message}...`);
  
  let result;
  if (command.action === 'deploy') {
    result = await executeDeployment(command);
  } else if (command.action === 'status') {
    result = await getPortalStatus();
  } else if (command.action === 'help') {
    result = showHelp();
  }
  
  if (result.success) {
    await channel.send(`✅ ${result.message}`);
    if (result.details) {
      // Send details in code block if not too long
      const details = result.details.substring(0, 1900);
      await channel.send(`\`\`\`\n${details}\n\`\`\``);
    }
  } else {
    await channel.send(`❌ ${result.message}`);
  }
}

// Transcribe audio using Whisper or similar service
async function transcribeAudio(audioFilePath) {
  try {
    // Option 1: Use OpenAI Whisper API (requires OPENAI_API_KEY)
    // Option 2: Use local Whisper model
    // Option 3: Use Google Speech-to-Text
    // For now, return placeholder - implement based on your preference
    
    console.log(`🎧 Transcribing audio: ${audioFilePath}`);
    
    // Placeholder: In production, integrate with actual speech-to-text service
    return "deploy all portals"; // Example transcription
  } catch (error) {
    console.error('❌ Transcription error:', error);
    return null;
  }
}

// Handle voice state updates
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  // User joined a voice channel
  if (!oldState.channelId && newState.channelId) {
    console.log(`👤 User ${newState.member.user.tag} joined voice channel ${newState.channel.name}`);
    
    // If admin joins, bot joins too
    if (ADMIN_USER_ID && newState.member.id === ADMIN_USER_ID) {
      try {
        const connection = joinVoiceChannel({
          channelId: newState.channelId,
          guildId: newState.guild.id,
          adapterCreator: newState.guild.voiceAdapterCreator,
          selfDeaf: false,
          selfMute: false,
        });
        
        console.log(`🤖 Bot joined voice channel: ${newState.channel.name}`);
        
        // Listen to audio
        connection.receiver.speaking.on('start', async (userId) => {
          console.log(`🎤 User ${userId} started speaking`);
          
          const audioStream = connection.receiver.subscribe(userId, {
            end: {
              behavior: EndBehaviorType.AfterSilence,
              duration: 1000,
            },
          });
          
          const audioFilePath = `/tmp/discord-voice-${userId}-${Date.now()}.pcm`;
          const writeStream = createWriteStream(audioFilePath);
          
          const opusDecoder = new prism.opus.Decoder({
            frameSize: 960,
            channels: 2,
            rate: 48000,
          });
          
          pipeline(audioStream, opusDecoder, writeStream).then(async () => {
            console.log(`✅ Audio saved: ${audioFilePath}`);
            
            // Transcribe audio
            const transcript = await transcribeAudio(audioFilePath);
            
            if (transcript) {
              // Get text channel for responses
              const textChannel = newState.guild.channels.cache.find(
                ch => ch.name === 'helix-commands' || ch.name === 'general'
              );
              
              if (textChannel) {
                await processVoiceCommand(transcript, userId, textChannel);
              }
            }
            
            // Clean up audio file
            await fs.unlink(audioFilePath).catch(console.error);
          }).catch(console.error);
        });
        
        // Handle connection state changes
        connection.on(VoiceConnectionStatus.Disconnected, async () => {
          try {
            await Promise.race([
              entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
              entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
            ]);
          } catch (error) {
            connection.destroy();
          }
        });
        
      } catch (error) {
        console.error('❌ Error joining voice channel:', error);
      }
    }
  }
});

// Handle text commands as fallback
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  
  if (message.content.startsWith('!helix')) {
    const command = message.content.substring(7).trim();
    
    if (command) {
      await processVoiceCommand(command, message.author.id, message.channel);
    } else {
      await message.reply('Usage: `!helix <command>` or use voice commands in voice channel');
    }
  }
});

// Bot ready event
client.on(Events.ClientReady, () => {
  console.log(`✅ Discord Voice Commander Bot logged in as ${client.user.tag}`);
  console.log(`🎤 Listening for voice commands from admin: ${ADMIN_USER_ID || 'any user'}`);
  console.log(`📝 Text command prefix: !helix`);
});

// Start bot
client.login(DISCORD_BOT_TOKEN);
