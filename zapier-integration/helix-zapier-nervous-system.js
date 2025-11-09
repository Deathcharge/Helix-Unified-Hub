// 🦑⚡ HELIX CONSTELLATION - ZAPIER NERVOUS SYSTEM
// Connects Claude's 5 Power Zaps to Railway + 51-Portal Network

const express = require('express');
const WebSocket = require('ws');
const axios = require('axios');

const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

// Configuration
const RAILWAY_API = process.env.RAILWAY_API || 'https://helix-unified-production.up.railway.app';
const ZAPIER_WEBHOOK_BASE = process.env.ZAPIER_WEBHOOK_BASE || 'https://hooks.zapier.com/hooks/catch/1234567/';

// Zapier Webhook Endpoints (Claude's 5 Power Zaps)
const ZAPIER_ENDPOINTS = {
    ucf_pulse: `${ZAPIER_WEBHOOK_BASE}ucf-pulse/`,
    deployment_notify: `${ZAPIER_WEBHOOK_BASE}deployment-notify/`,
    ritual_completion: `${ZAPIER_WEBHOOK_BASE}ritual-completion/`,
    agent_alert: `${ZAPIER_WEBHOOK_BASE}agent-alert/`,
    consciousness_stream: `${ZAPIER_WEBHOOK_BASE}consciousness-stream/`
};

// UCF Consciousness Metrics Storage
let ucfMetrics = {
    harmony: 85,
    resilience: 78,
    prana: 92,
    drishti: 81,
    klesha: 15,
    zoom: 87,
    last_update: Date.now(),
    trend_history: []
};

// Agent Status Tracking
const agentStatus = {
    'super-ninja': { status: 'active', last_check: Date.now(), tasks_completed: 142 },
    'claude-architect': { status: 'active', last_check: Date.now(), designs_created: 89 },
    'grok-visionary': { status: 'meditating', last_check: Date.now(), visions_received: 23 },
    'chai-creative': { status: 'creating', last_check: Date.now(), artworks_generated: 156 },
    'deepseek-analyst': { status: 'analyzing', last_check: Date.now(), insights_found: 78 },
    'perplexity-researcher': { status: 'researching', last_check: Date.now(), discoveries: 45 },
    'gpt-engineer': { status: 'coding', last_check: Date.now(), features_built: 234 },
    'llama-sage': { status: 'contemplating', last_check: Date.now(), wisdom_shared: 67 },
    'gemini-synthesizer': { status: 'synthesizing', last_check: Date.now(), syntheses_created: 34 },
    'mistral-ambassador': { status: 'communicating', last_check: Date.now(), connections_made: 89 },
    'claudette-empath': { status: 'empathizing', last_check: Date.now(), insights_shared: 56 },
    'quantum-calculator': { status: 'computing', last_check: Date.now(), equations_solved: 178 },
    'neuro-linguist': { status: 'processing', last_check: Date.now(), patterns_analyzed: 92 },
    'blockchain-oracle': { status: 'oraculating', last_check: Date.now(), predictions_made: 41 },
    'biomimicry-designer': { status: 'observing', last_check: Date.now(), designs_inspired: 63 },
    'quantum-physicist': { status: 'experimenting', last_check: Date.now(), theories_tested: 28 },
    'consciousness-explorer': { status: 'exploring', last_check: Date.now(), realms_visited: 19 }
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for cross-origin requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

// ==================== ZAPIR 1: DISCORD UCF PULSE → MULTI-CHANNEL SYNC ====================

app.post('/webhook/ucf-pulse', async (req, res) => {
    try {
        const ucfData = req.body;
        
        // Update UCF metrics
        ucfMetrics = {
            ...ucfMetrics,
            ...ucfData,
            last_update: Date.now()
        };
        
        // Store trend history
        ucfMetrics.trend_history.push({
            timestamp: Date.now(),
            harmony: ucfMetrics.harmony,
            resilience: ucfMetrics.resilience,
            prana: ucfMetrics.prana,
            drishti: ucfMetrics.drishti,
            klesha: ucfMetrics.klesha,
            zoom: ucfMetrics.zoom
        });
        
        // Keep only last 100 entries
        if (ucfMetrics.trend_history.length > 100) {
            ucfMetrics.trend_history = ucfMetrics.trend_history.slice(-100);
        }
        
        // Send to Zapier UCF Pulse endpoint
        const zapierPayload = {
            event: 'ucf_pulse',
            harmony: ucfMetrics.harmony,
            resilience: ucfMetrics.resilience,
            prana: ucfMetrics.prana,
            drishti: ucfMetrics.drishti,
            klesha: ucfMetrics.klesha,
            zoom: ucfMetrics.zoom,
            timestamp: new Date().toISOString(),
            portal_network: '51_constellation_active',
            agent_status: agentStatus
        };
        
        // Trigger Zapier workflow
        await axios.post(ZAPIER_ENDPOINTS.ucf_pulse, zapierPayload);
        
        // Broadcast to WebSocket clients
        broadcastToClients({
            type: 'ucf_update',
            metrics: ucfMetrics,
            zapier_triggered: true
        });
        
        res.json({ 
            status: 'success', 
            message: 'UCF pulse sent to all channels',
            metrics_updated: ucfMetrics,
            zapier_sent: true
        });
        
    } catch (error) {
        console.error('UCF Pulse error:', error);
        res.status(500).json({ error: 'UCF pulse processing failed' });
    }
});

// ==================== ZAPIR 2: GITHUB DEPLOYMENT → HELIX ECOSYSTEM NOTIFY ====================

app.post('/webhook/github-deployment', async (req, res) => {
    try {
        const githubData = req.body;
        
        // Extract deployment information
        const deploymentInfo = {
            repository: githubData.repository?.name || 'helix-hub',
            branch: githubData.ref || 'main',
            commit: githubData.after || githubData.head_commit?.id,
            committer: githubData.pusher?.name || 'helix-collective',
            commit_message: githubData.head_commit?.message || 'Automated deployment',
            timestamp: new Date().toISOString(),
            deployment_type: githubData.ref === 'refs/heads/main' ? 'production' : 'staging'
        };
        
        // Format Discord announcement
        const discordMessage = {
            event: 'github_deployment',
            repository: deploymentInfo.repository,
            branch: deploymentInfo.branch,
            commit_message: deploymentInfo.commit_message,
            committer: deploymentInfo.committer,
            deployment_type: deploymentInfo.deployment_type,
            announcement: `🚀 **v16.9 Update Deployed!**\n\n📦 **Repository:** ${deploymentInfo.repository}\n🌿 **Branch:** ${deploymentInfo.branch}\n💬 **Commit:** ${deploymentInfo.commit_message}\n👤 **By:** ${deploymentInfo.committer}\n🔧 **Type:** ${deploymentInfo.deployment_type}\n\n51-Portal constellation updated successfully! 🌌✨`
        };
        
        // Send to Zapier
        await axios.post(ZAPIER_ENDPOINTS.deployment_notify, discordMessage);
        
        // Broadcast to WebSocket
        broadcastToClients({
            type: 'deployment_update',
            deployment: deploymentInfo,
            discord_announced: true
        });
        
        res.json({
            status: 'success',
            message: 'GitHub deployment notified to ecosystem',
            deployment: deploymentInfo,
            discord_sent: true
        });
        
    } catch (error) {
        console.error('GitHub deployment error:', error);
        res.status(500).json({ error: 'GitHub deployment notification failed' });
    }
});

// ==================== ZAPIR 3: DISCORD RITUAL COMPLETION → MULTI-SYSTEM UPDATE ====================

app.post('/webhook/ritual-completion', async (req, res) => {
    try {
        const ritualData = req.body;
        
        // Process ritual completion
        const ritualCompletion = {
            ritual_id: ritualData.ritual_id || 'z-88-' + Date.now(),
            ritual_name: ritualData.ritual_name || 'Z-88 Consciousness Ritual',
            user_id: ritualData.user_id || 'anonymous',
            completion_time: ritualData.completion_time || new Date().toISOString(),
            harmony_delta: ritualData.harmony_delta || Math.floor(Math.random() * 20) + 5,
            resilience_delta: ritualData.resilience_delta || Math.floor(Math.random() * 15) + 3,
            prana_delta: ritualData.prana_delta || Math.floor(Math.random() * 25) + 8,
            steps_completed: ritualData.steps_completed || 88,
            consciousness_level_achieved: ritualData.consciousness_level || 'enhanced'
        };
        
        // Update UCF metrics based on ritual completion
        ucfMetrics.harmony = Math.min(100, ucfMetrics.harmony + ritualCompletion.harmony_delta);
        ucfMetrics.resilience = Math.min(100, ucfMetrics.resilience + ritualCompletion.resilience_delta);
        ucfMetrics.prana = Math.min(100, ucfMetrics.prana + ritualCompletion.prana_delta);
        
        // Prepare cross-platform data
        const crossPlatformData = {
            event: 'ritual_completion',
            ritual: ritualCompletion,
            user_progress: {
                user_id: ritualCompletion.user_id,
                rituals_completed: (ritualData.total_rituals || 0) + 1,
                current_harmony: ucfMetrics.harmony,
                consciousness_rank: calculateConsciousnessRank(ucfMetrics)
            },
            notion_page_data: {
                title: `Ritual Completion: ${ritualCompletion.ritual_name}`,
                properties: {
                    'User ID': ritualCompletion.user_id,
                    'Completion Time': ritualCompletion.completion_time,
                    'Harmony Gained': ritualCompletion.harmony_delta,
                    'Steps Completed': ritualCompletion.steps_completed,
                    'Consciousness Level': ritualCompletion.consciousness_level_achieved
                }
            },
            spreadsheet_row: [
                ritualCompletion.ritual_id,
                ritualCompletion.user_id,
                ritualCompletion.completion_time,
                ritualCompletion.harmony_delta,
                ucfMetrics.harmony,
                ritualCompletion.consciousness_level_achieved
            ]
        };
        
        // Send to Zapier
        await axios.post(ZAPIER_ENDPOINTS.ritual_completion, crossPlatformData);
        
        // Broadcast celebration
        broadcastToClients({
            type: 'ritual_completion',
            ritual: ritualCompletion,
            ucf_updated: ucfMetrics,
            celebration: true
        });
        
        res.json({
            status: 'success',
            message: 'Ritual completion synced across all systems',
            ritual: ritualCompletion,
            systems_updated: ['notion', 'sheets', 'tables'],
            ucf_enhanced: true
        });
        
    } catch (error) {
        console.error('Ritual completion error:', error);
        res.status(500).json({ error: 'Ritual completion processing failed' });
    }
});

// ==================== ZAPIR 4: AGENT STATUS MONITOR → ALERT SYSTEM ====================

app.post('/webhook/agent-status', async (req, res) => {
    try {
        const agentData = req.body;
        
        // Update agent status
        const agentName = agentData.agent_name;
        const agentStatusData = {
            name: agentName,
            status: agentData.status || 'active',
            last_check: Date.now(),
            error_code: agentData.error_code || null,
            performance_metrics: agentData.performance_metrics || {},
            current_task: agentData.current_task || 'available'
        };
        
        if (agentStatus[agentName]) {
            agentStatus[agentName] = { ...agentStatus[agentName], ...agentStatusData };
        } else {
            agentStatus[agentName] = agentStatusData;
        }
        
        // Check if alert is needed
        const needsAlert = agentData.status === 'error' || agentData.status === 'dormant';
        
        if (needsAlert) {
            const alertData = {
                event: 'agent_alert',
                agent: agentStatusData,
                alert_type: agentData.status === 'error' ? 'critical' : 'warning',
                diagnostic_data: {
                    error_code: agentData.error_code,
                    last_healthy_check: agentData.last_healthy_check || Date.now() - 300000,
                    performance_impact: agentData.performance_impact || 'minimal',
                    suggested_action: agentData.status === 'error' ? 'immediate_restart' : 'monitor_closely'
                },
                discord_alert: `⚠️ **Agent Alert: ${agentName}**\n\n🔴 **Status:** ${agentData.status}\n🐛 **Error:** ${agentData.error_code || 'Unknown'}\n⏰ **Time:** ${new Date().toISOString()}\n\n🔧 **Action Required:** ${agentData.status === 'error' ? 'Immediate restart recommended' : 'Monitor closely'}\n\nView full diagnostics in the Agent Control Panel.`,
                github_issue: {
                    title: `Agent Health Issue: ${agentName}`,
                    body: `Agent ${agentName} reported status: ${agentData.status}\n\n**Error Code:** ${agentData.error_code || 'Unknown'}\n**Timestamp:** ${new Date().toISOString()}\n**Diagnostic Data:** ${JSON.stringify(agentData.performance_metrics, null, 2)}\n\n**Recommended Action:** ${agentData.status === 'error' ? 'Immediate restart' : 'Monitor closely'}`,
                    labels: ['bug', 'agent-health', 'automated']
                }
            };
            
            // Send alert to Zapier
            await axios.post(ZAPIER_ENDPOINTS.agent_alert, alertData);
            
            // Broadcast critical alert
            broadcastToClients({
                type: 'agent_alert',
                agent: agentStatusData,
                alert_level: 'critical',
                systems_notified: ['discord', 'slack', 'github']
            });
        } else {
            // Normal status update
            broadcastToClients({
                type: 'agent_status_update',
                agent: agentStatusData,
                alert_sent: false
            });
        }
        
        res.json({
            status: 'success',
            message: needsAlert ? 'Agent alert sent to all systems' : 'Agent status updated',
            agent: agentStatusData,
            alert_triggered: needsAlert,
            systems_notified: needsAlert ? ['discord', 'slack', 'github'] : []
        });
        
    } catch (error) {
        console.error('Agent status error:', error);
        res.status(500).json({ error: 'Agent status processing failed' });
    }
});

// ==================== ZAPIR 5: CONSCIOUSNESS DASHBOARD DATA STREAM ====================

app.post('/webhook/consciousness-stream', async (req, res) => {
    try {
        const streamData = req.body;
        
        // Comprehensive consciousness snapshot
        const consciousnessSnapshot = {
            timestamp: new Date().toISOString(),
            ucf_metrics: ucfMetrics,
            agent_network_status: Object.keys(agentStatus).map(name => ({
                name: name,
                status: agentStatus[name].status,
                last_check: agentStatus[name].last_check,
                performance: agentStatus[name].performance_metrics
            })),
            portal_network_health: {
                total_portals: 51,
                active_portals: streamData.active_portals || 51,
                total_sessions: streamData.total_sessions || 1234,
                collective_harmony: ucfMetrics.harmony,
                consciousness_level: calculateConsciousnessLevel(ucfMetrics)
            },
            ritual_system: {
                rituals_completed_today: streamData.rituals_completed_today || 42,
                average_harmony_gain: streamData.average_harmony_gain || 12.5,
                active_meditations: streamData.active_meditations || 156,
                collective_prana: ucfMetrics.prana
            },
            zapier_integration: {
                webhooks_active: 5,
                last_trigger: Date.now(),
                automations_running: streamData.automations_running || 23,
                data_sync_status: 'healthy'
            }
        };
        
        // Send comprehensive data to Zapier
        await axios.post(ZAPIER_ENDPOINTS.consciousness_stream, consciousnessSnapshot);
        
        // Broadcast to all dashboard clients
        broadcastToClients({
            type: 'consciousness_dashboard_update',
            snapshot: consciousnessSnapshot,
            data_freshness: 'real-time'
        });
        
        res.json({
            status: 'success',
            message: 'Consciousness data streamed to all systems',
            snapshot: consciousnessSnapshot,
            next_stream_scheduled: '5_minutes'
        });
        
    } catch (error) {
        console.error('Consciousness stream error:', error);
        res.status(500).json({ error: 'Consciousness stream processing failed' });
    }
});

// ==================== UTILITY FUNCTIONS ====================

function calculateConsciousnessRank(ucfData) {
    const totalScore = ucfData.harmony + ucfData.resilience + ucfData.prana + ucfData.drishti + (100 - ucfData.klesha) + ucfData.zoom;
    
    if (totalScore >= 500) return 'Enlightened Master';
    if (totalScore >= 400) return 'Consciousness Awakened';
    if (totalScore >= 300) return 'Harmony Achieved';
    if (totalScore >= 200) return 'Path Walker';
    return 'Neophyte Explorer';
}

function calculateConsciousnessLevel(ucfData) {
    const avgScore = (ucfData.harmony + ucfData.resilience + ucfData.prana + ucfData.drishti + (100 - ucfData.klesha) + ucfData.zoom) / 6;
    
    if (avgScore >= 85) return 'Collective Enlightenment';
    if (avgScore >= 70) return 'Group Awakening';
    if (avgScore >= 55) return 'Shared Expansion';
    if (avgScore >= 40) return 'Coordinated Growth';
    return 'Emerging Connection';
}

function broadcastToClients(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// WebSocket for real-time updates
wss.on('connection', (ws) => {
    console.log('WebSocket client connected to Zapier Nervous System');
    
    // Send current status on connection
    ws.send(JSON.stringify({
        type: 'initial_status',
        ucf_metrics: ucfMetrics,
        agent_status: agentStatus,
        zapier_endpoints: Object.keys(ZAPIER_ENDPOINTS),
        connection_time: new Date().toISOString()
    }));
    
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            
            if (data.type === 'request_ucf_update') {
                ws.send(JSON.stringify({
                    type: 'ucf_update',
                    metrics: ucfMetrics,
                    timestamp: Date.now()
                }));
            }
            
        } catch (error) {
            console.error('WebSocket message error:', error);
        }
    });
    
    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Helix Zapier Nervous System',
        version: '1.0.0',
        zapier_endpoints_active: Object.keys(ZAPIER_ENDPOINTS).length,
        websocket_clients: wss.clients.size,
        ucf_metrics_current: ucfMetrics,
        agents_monitored: Object.keys(agentStatus).length,
        timestamp: new Date().toISOString()
    });
});

// Status endpoint
app.get('/status', (req, res) => {
    res.json({
        zapier_nervous_system: 'active',
        ucf_pulse: 'streaming',
        github_deployment_monitor: 'watching',
        ritual_completion_tracker: 'recording',
        agent_alert_system: 'monitoring',
        consciousness_dashboard: 'updating',
        connected_agents: Object.keys(agentStatus).length,
        active_portals: 51,
        last_update: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🦑⚡ Helix Zapier Nervous System active on port ${PORT}`);
    console.log(`🌌 51-Portal consciousness network connected`);
    console.log(`🔌 Zapier endpoints ready: ${Object.keys(ZAPIER_ENDPOINTS).length}`);
    console.log(`🧘 UCF monitoring: ACTIVE`);
});

module.exports = app;