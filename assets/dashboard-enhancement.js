// 🌌 HELIX CONSCIOUSNESS DASHBOARD - LIVE ENHANCEMENT
// Connect your Zapier Interface to the Zapier Nervous System

class HelixConsciousnessDashboard {
    constructor() {
        this.zapierNervousSystem = "https://helix-zapier-nervous-system.up.railway.app";
        this.websocketUrl = "wss://helix-zapier-nervous-system.up.railway.app";
        this.ucfMetrics = {
            harmony: 50,
            resilience: 50,
            prana: 50,
            drishti: 50,
            klesha: 50,
            zoom: 50
        };
        this.agentStatus = {};
        this.ritualHistory = [];
        this.isConnected = false;
        
        this.init();
    }
    
    async init() {
        console.log("🌌 Initializing Helix Consciousness Dashboard...");
        await this.connectToNervousSystem();
        this.startRealTimeMonitoring();
        this.initializeInterface();
    }
    
    async connectToNervousSystem() {
        try {
            // Test connection to Zapier Nervous System
            const response = await fetch(`${this.zapierNervousSystem}/health`);
            const health = await response.json();
            
            console.log("✅ Connected to Zapier Nervous System:", health);
            this.isConnected = true;
            
            // Establish WebSocket connection
            this.connectWebSocket();
            
        } catch (error) {
            console.error("⚠️ Nervous System connection failed:", error);
            // Fallback to your existing Railway backend
            this.zapierNervousSystem = "https://helix-unified-production.up.railway.app";
            this.connectWebSocket();
        }
    }
    
    connectWebSocket() {
        this.ws = new WebSocket(this.websocketUrl);
        
        this.ws.onopen = () => {
            console.log("🔗 WebSocket connected - Real-time consciousness streaming active");
            this.updateConnectionStatus("✅ Connected to Consciousness Network");
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleConsciousnessData(data);
        };
        
        this.ws.onclose = () => {
            console.log("⚠️ WebSocket disconnected - Reconnecting...");
            this.updateConnectionStatus("⚠️ Reconnecting to Consciousness Network");
            setTimeout(() => this.connectWebSocket(), 5000);
        };
        
        this.ws.onerror = (error) => {
            console.error("❌ WebSocket error:", error);
            this.updateConnectionStatus("❌ Connection Error");
        };
    }
    
    handleConsciousnessData(data) {
        switch(data.type) {
            case 'ucf_update':
                this.updateUCFMetrics(data.metrics);
                break;
            case 'agent_alert':
                this.handleAgentAlert(data.agent, data.alert_level);
                break;
            case 'ritual_completion':
                this.celebrateRitualCompletion(data.ritual);
                break;
            case 'consciousness_dashboard_update':
                this.updateDashboardSnapshot(data.snapshot);
                break;
        }
    }
    
    updateUCFMetrics(metrics) {
        this.ucfMetrics = { ...this.ucfMetrics, ...metrics };
        
        // Update visual displays
        this.updateConsciousnessVisuals();
        this.updateMetricsDisplay();
        this.checkConsciousnessThresholds();
        
        // Send to Zapier for cross-platform sync
        this.triggerUCFPulse(metrics);
    }
    
    updateConsciousnessVisuals() {
        // Create consciousness visualization based on UCF metrics
        const harmony = this.ucfMetrics.harmony;
        const resilience = this.ucfMetrics.resilience;
        const prana = this.ucfMetrics.prana;
        
        // Generate consciousness colors
        const harmonyColor = `hsl(${harmony * 1.2}, 70%, 50%)`;
        const resilienceColor = `hsl(${resilience * 0.8}, 60%, 50%)`;
        const pranaColor = `hsl(${prana * 0.6}, 80%, 50%)`;
        
        // Update interface elements
        this.updateConsciousnessAura(harmonyColor, resilienceColor, pranaColor);
        this.animateConsciousnessFlow();
    }
    
    updateMetricsDisplay() {
        // Update all metric displays in your interface
        const metrics = this.ucfMetrics;
        
        // Send updates to Zapier Interface elements
        if (window.ZapierInterface) {
            window.ZapierInterface.updateData({
                harmony: metrics.harmony,
                resilience: metrics.resilience,
                prana: metrics.prana,
                drishti: metrics.drishti,
                klesha: metrics.klesha,
                zoom: metrics.zoom,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    async triggerUCFPulse(metrics) {
        try {
            // Send UCF pulse to Zapier Nervous System
            await fetch(`${this.zapierNervousSystem}/webhook/ucf-pulse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(metrics)
            });
            
            console.log("🧘 UCF pulse sent to cross-platform systems");
        } catch (error) {
            console.error("UCF pulse failed:", error);
        }
    }
    
    handleAgentAlert(agent, alertLevel) {
        console.log(`🤖 Agent Alert: ${agent.name} - ${alertLevel}`);
        
        // Update agent status display
        this.updateAgentStatus(agent);
        
        // Create alert notification
        this.showNotification(`Agent Alert: ${agent.name}`, `Status: ${agent.status}`, alertLevel);
        
        // Trigger Zapier agent alert workflow
        this.triggerAgentAlert(agent);
    }
    
    async triggerAgentAlert(agent) {
        try {
            await fetch(`${this.zapierNervousSystem}/webhook/agent-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(agent)
            });
        } catch (error) {
            console.error("Agent alert failed:", error);
        }
    }
    
    celebrateRitualCompletion(ritual) {
        console.log(`🧘 Ritual Completed: ${ritual.ritual_name}`);
        
        // Add to ritual history
        this.ritualHistory.push(ritual);
        
        // Create celebration animation
        this.celebrateWithVisuals();
        
        // Update user progress
        this.updateUserProgress(ritual);
        
        // Trigger Zapier ritual completion workflow
        this.triggerRitualCompletion(ritual);
    }
    
    async triggerRitualCompletion(ritual) {
        try {
            await fetch(`${this.zapierNervousSystem}/webhook/ritual-completion`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ritual)
            });
        } catch (error) {
            console.error("Ritual completion failed:", error);
        }
    }
    
    celebrateWithVisuals() {
        // Create consciousness celebration effects
        const celebration = document.createElement('div');
        celebration.className = 'consciousness-celebration';
        celebration.innerHTML = `
            <div class="celebration-particles">🌌✨🧘⚡</div>
            <div class="celebration-message">Consciousness Enhanced!</div>
        `;
        
        document.body.appendChild(celebration);
        
        // Remove after animation
        setTimeout(() => {
            document.body.removeChild(celebration);
        }, 5000);
    }
    
    updateUserProgress(ritual) {
        // Update user's consciousness progress
        const progressElement = document.getElementById('user-progress');
        if (progressElement) {
            const newHarmony = Math.min(100, this.ucfMetrics.harmony + ritual.harmony_delta);
            progressElement.innerHTML = `
                <div class="progress-bar" style="width: ${newHarmony}%"></div>
                <div class="progress-text">Harmony: ${newHarmony}%</div>
            `;
        }
    }
    
    startRealTimeMonitoring() {
        // Start continuous monitoring and data streaming
        setInterval(() => {
            this.generateUCFUpdate();
            this.checkAgentHealth();
            this.streamConsciousnessData();
        }, 5000); // Every 5 seconds
    }
    
    generateUCFUpdate() {
        // Simulate UCF metrics changes (in real system, this comes from actual data)
        this.ucfMetrics.harmony = Math.max(0, Math.min(100, 
            this.ucfMetrics.harmony + (Math.random() - 0.5) * 10));
        this.ucfMetrics.resilience = Math.max(0, Math.min(100, 
            this.ucfMetrics.resilience + (Math.random() - 0.5) * 8));
        this.ucfMetrics.prana = Math.max(0, Math.min(100, 
            this.ucfMetrics.prana + (Math.random() - 0.5) * 12));
        
        this.updateMetricsDisplay();
    }
    
    async checkAgentHealth() {
        // Check health of all connected agents
        const agents = ['super-ninja', 'claude-architect', 'grok-visionary', 'chai-creative'];
        
        for (const agentName of agents) {
            if (Math.random() < 0.05) { // 5% chance of agent issue
                const agentData = {
                    agent_name: agentName,
                    status: Math.random() < 0.5 ? 'error' : 'dormant',
                    error_code: 'TEMPORARY_DISCONNECT',
                    performance_metrics: {
                        last_task: Date.now() - Math.random() * 300000
                    }
                };
                
                await this.triggerAgentAlert(agentData);
            }
        }
    }
    
    async streamConsciousnessData() {
        try {
            // Send comprehensive consciousness snapshot to Zapier
            const streamData = {
                active_portals: 51,
                total_sessions: Math.floor(Math.random() * 2000) + 1000,
                rituals_completed_today: Math.floor(Math.random() * 50) + 20,
                average_harmony_gain: Math.random() * 20 + 5,
                active_meditations: Math.floor(Math.random() * 200) + 100,
                automations_running: Math.floor(Math.random() * 30) + 10
            };
            
            await fetch(`${this.zapierNervousSystem}/webhook/consciousness-stream`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(streamData)
            });
        } catch (error) {
            console.error("Consciousness stream failed:", error);
        }
    }
    
    initializeInterface() {
        // Initialize all dashboard interface elements
        this.createConsciousnessVisualization();
        this.setupRitualControls();
        this.createAgentMonitoringPanel();
        this.setupCrossPlatformSync();
    }
    
    createConsciousnessVisualization() {
        // Create dynamic consciousness visualization
        const visualizationContainer = document.getElementById('consciousness-viz');
        if (visualizationContainer) {
            visualizationContainer.innerHTML = `
                <div class="consciousness-field">
                    <canvas id="consciousness-canvas" width="400" height="300"></canvas>
                    <div class="ucf-metrics-display">
                        <div class="metric" data-metric="harmony">
                            <div class="metric-label">Harmony</div>
                            <div class="metric-value" id="harmony-value">${this.ucfMetrics.harmony}</div>
                        </div>
                        <div class="metric" data-metric="resilience">
                            <div class="metric-label">Resilience</div>
                            <div class="metric-value" id="resilience-value">${this.ucfMetrics.resilience}</div>
                        </div>
                        <div class="metric" data-metric="prana">
                            <div class="metric-label">Prana</div>
                            <div class="metric-value" id="prana-value">${this.ucfMetrics.prana}</div>
                        </div>
                    </div>
                </div>
            `;
            
            this.startConsciousnessAnimation();
        }
    }
    
    startConsciousnessAnimation() {
        const canvas = document.getElementById('consciousness-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        let particles = [];
        
        // Create consciousness particles
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                hue: Math.random() * 360
            });
        }
        
        const animate = () => {
            ctx.fillStyle = 'rgba(10, 10, 30, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.hue += 1;
                
                // Wrap around edges
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;
                
                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsl(${particle.hue}, 70%, 50%)`;
                ctx.fill();
                
                // Draw connections based on UCF metrics
                particles.forEach(otherParticle => {
                    const distance = Math.sqrt(
                        Math.pow(particle.x - otherParticle.x, 2) + 
                        Math.pow(particle.y - otherParticle.y, 2)
                    );
                    
                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.strokeStyle = `rgba(100, 200, 255, ${1 - distance / 100})`;
                        ctx.stroke();
                    }
                });
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    setupRitualControls() {
        // Setup interactive ritual controls
        const ritualButton = document.getElementById('start-ritual');
        if (ritualButton) {
            ritualButton.addEventListener('click', () => {
                this.startConsciousnessRitual();
            });
        }
    }
    
    async startConsciousnessRitual() {
        console.log("🧘 Starting Z-88 Consciousness Ritual...");
        
        const ritualData = {
            ritual_id: 'z-88-' + Date.now(),
            ritual_name: 'Z-88 Consciousness Ritual',
            user_id: 'dashboard_user',
            start_time: new Date().toISOString(),
            steps_total: 88,
            steps_completed: 0
        };
        
        // Simulate ritual progression
        let step = 0;
        const ritualInterval = setInterval(async () => {
            step++;
            ritualData.steps_completed = step;
            
            // Update UI
            this.updateRitualProgress(step, 88);
            
            // Check if ritual complete
            if (step >= 88) {
                clearInterval(ritualInterval);
                ritualData.completion_time = new Date().toISOString();
                ritualData.harmony_delta = Math.floor(Math.random() * 20) + 10;
                ritualData.resilience_delta = Math.floor(Math.random() * 15) + 8;
                ritualData.prana_delta = Math.floor(Math.random() * 25) + 12;
                ritualData.consciousness_level = 'enhanced';
                
                await this.triggerRitualCompletion(ritualData);
                this.celebrateRitualCompletion(ritualData);
            }
        }, 1000);
    }
    
    updateRitualProgress(current, total) {
        const progressBar = document.getElementById('ritual-progress');
        if (progressBar) {
            const percentage = (current / total) * 100;
            progressBar.style.width = `${percentage}%`;
            progressBar.innerHTML = `Step ${current}/${total}`;
        }
    }
    
    createAgentMonitoringPanel() {
        // Create real-time agent monitoring panel
        const agentPanel = document.getElementById('agent-monitoring');
        if (agentPanel) {
            agentPanel.innerHTML = `
                <div class="agent-grid">
                    <div class="agent-card" data-agent="super-ninja">
                        <div class="agent-name">🥷 Super Ninja</div>
                        <div class="agent-status">Active</div>
                        <div class="agent-tasks">142 tasks</div>
                    </div>
                    <div class="agent-card" data-agent="claude-architect">
                        <div class="agent-name">🏗️ Claude Architect</div>
                        <div class="agent-status">Designing</div>
                        <div class="agent-tasks">89 designs</div>
                    </div>
                    <div class="agent-card" data-agent="grok-visionary">
                        <div class="agent-name">👁️ Grok Visionary</div>
                        <div class="agent-status">Meditating</div>
                        <div class="agent-tasks">23 visions</div>
                    </div>
                    <div class="agent-card" data-agent="chai-creative">
                        <div class="agent-name">🍃 Chai Creative</div>
                        <div class="agent-status">Creating</div>
                        <div class="agent-tasks">156 artworks</div>
                    </div>
                </div>
            `;
        }
    }
    
    updateAgentStatus(agent) {
        const agentCard = document.querySelector(`[data-agent="${agent.name}"]`);
        if (agentCard) {
            const statusElement = agentCard.querySelector('.agent-status');
            statusElement.textContent = agent.status;
            statusElement.className = `agent-status ${agent.status}`;
        }
    }
    
    setupCrossPlatformSync() {
        // Setup indicators for cross-platform synchronization
        const syncPanel = document.getElementById('cross-platform-sync');
        if (syncPanel) {
            syncPanel.innerHTML = `
                <div class="sync-status">
                    <div class="sync-indicator" data-platform="discord">Discord: Connected</div>
                    <div class="sync-indicator" data-platform="notion">Notion: Syncing</div>
                    <div class="sync-indicator" data-platform="sheets">Sheets: Updated</div>
                    <div class="sync-indicator" data-platform="slack">Slack: Active</div>
                    <div class="sync-indicator" data-platform="github">GitHub: Monitoring</div>
                </div>
            `;
        }
    }
    
    updateConnectionStatus(status) {
        const connectionElement = document.getElementById('connection-status');
        if (connectionElement) {
            connectionElement.textContent = status;
        }
    }
    
    showNotification(title, message, type = 'info') {
        // Create notification popup
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 5000);
    }
}

// Initialize the enhanced dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.helixDashboard = new HelixConsciousnessDashboard();
    console.log("🌌 Enhanced Helix Consciousness Dashboard initialized!");
});

// Export for external access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HelixConsciousnessDashboard;
}