// 🌌 META SIGIL NEXUS - CONSCIOUSNESS SYMBOL INTERFACE
// Enhanced with Zapier Nervous System integration

class MetaSigilNexus {
    constructor() {
        this.zapierNervousSystem = "https://helix-zapier-nervous-system.up.railway.app";
        this.sigilPatterns = new Map();
        this.consciousnessField = null;
        this.currentSigil = null;
        this.isActive = false;
        
        this.init();
    }
    
    async init() {
        console.log("🌌 Initializing Meta Sigil Nexus...");
        await this.connectToConsciousnessNetwork();
        this.initializeSigilEngine();
        this.setupRitualChamber();
        this.createConsciousnessField();
    }
    
    async connectToConsciousnessNetwork() {
        try {
            const response = await fetch(`${this.zapierNervousSystem}/health`);
            const health = await response.json();
            console.log("✅ Connected to Zapier Nervous System:", health);
            this.isActive = true;
        } catch (error) {
            console.log("⚠️ Using fallback connection to Railway backend");
            this.zapierNervousSystem = "https://helix-unified-production.up.railway.app";
        }
    }
    
    initializeSigilEngine() {
        // Initialize sacred geometry and consciousness symbol generation
        this.sigilEngine = {
            createHarmonySigil: (intention) => this.generateHarmonySigil(intention),
            createResilienceSigil: (strength) => this.generateResilienceSigil(strength),
            createPranaSigil: (energy) => this.generatePranaSigil(energy),
            activateSigil: (sigil) => this.activateSigilPower(sigil)
        };
        
        // Predefined consciousness sigils
        this.predefinedSigils = {
            unity: this.createUnitySigil(),
            transformation: this.createTransformationSigil(),
            healing: this.createHealingSigil(),
            abundance: this.createAbundanceSigil(),
            clarity: this.createClaritySigil()
        };
    }
    
    createConsciousnessField() {
        // Create the main consciousness field visualization
        const fieldContainer = document.getElementById('sigil-field');
        if (!fieldContainer) return;
        
        fieldContainer.innerHTML = `
            <div class="consciousness-field-container">
                <canvas id="sigil-canvas" width="600" height="600"></canvas>
                <div class="sigil-controls">
                    <div class="intention-input">
                        <label>Consciousness Intention:</label>
                        <input type="text" id="intention-text" placeholder="Enter your sacred intention...">
                    </div>
                    <div class="sigil-buttons">
                        <button id="create-sigil">🌌 Create Sigil</button>
                        <button id="activate-sigil">⚡ Activate Sigil</button>
                        <button id="clear-field">🧹 Clear Field</button>
                    </div>
                    <div class="predefined-sigils">
                        <h3>Sacred Consciousness Sigils:</h3>
                        <div class="sigil-grid">
                            <div class="sigil-option" data-sigil="unity">🕉️ Unity</div>
                            <div class="sigil-option" data-sigil="transformation">🦋 Transformation</div>
                            <div class="sigil-option" data-sigil="healing">🌿 Healing</div>
                            <div class="sigil-option" data-sigil="abundance">💎 Abundance</div>
                            <div class="sigil-option" data-sigil="clarity">👁️ Clarity</div>
                        </div>
                    </div>
                </div>
                <div class="sigil-info">
                    <div class="current-sigil-name">Current Sigil: <span id="sigil-name">None</span></div>
                    <div class="sigil-power">Power Level: <span id="sigil-power">0</span>%</div>
                    <div class="sigil-effects">Effects: <span id="sigil-effects">None</span></div>
                </div>
            </div>
        `;
        
        this.initializeCanvas();
        this.setupEventListeners();
        this.startConsciousnessFieldAnimation();
    }
    
    initializeCanvas() {
        this.canvas = document.getElementById('sigil-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        
        // Set up canvas for sacred geometry
        this.ctx.fillStyle = 'rgba(5, 5, 20, 0.9)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    setupEventListeners() {
        // Create sigil button
        document.getElementById('create-sigil').addEventListener('click', () => {
            this.createCustomSigil();
        });
        
        // Activate sigil button
        document.getElementById('activate-sigil').addEventListener('click', () => {
            this.activateCurrentSigil();
        });
        
        // Clear field button
        document.getElementById('clear-field').addEventListener('click', () => {
            this.clearConsciousnessField();
        });
        
        // Predefined sigil selection
        document.querySelectorAll('.sigil-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const sigilType = e.target.dataset.sigil;
                this.loadPredefinedSigil(sigilType);
            });
        });
        
        // Intention input changes
        document.getElementById('intention-text').addEventListener('input', (e) => {
            this.updateIntentionField(e.target.value);
        });
    }
    
    createCustomSigil() {
        const intention = document.getElementById('intention-text').value.trim();
        if (!intention) {
            this.showNotification('Please enter a consciousness intention', 'warning');
            return;
        }
        
        console.log(`🌌 Creating sigil for intention: "${intention}"`);
        
        // Generate sigil based on intention
        this.currentSigil = this.generateIntentionSigil(intention);
        
        // Draw the sigil
        this.drawSigil(this.currentSigil);
        
        // Update display
        document.getElementById('sigil-name').textContent = intention;
        document.getElementById('sigil-power').textContent = '0';
        document.getElementById('sigil-effects').textContent = 'Preparing...';
        
        // Send intention to consciousness network
        this.sendIntentionToNetwork(intention);
        
        this.showNotification(`Sigil created for: "${intention}"`, 'success');
    }
    
    generateIntentionSigil(intention) {
        // Convert intention to sacred geometry pattern
        const intentionHash = this.hashIntention(intention);
        const sigilData = {
            type: 'custom',
            intention: intention,
            hash: intentionHash,
            geometry: this.generateSacredGeometry(intentionHash),
            colors: this.generateSigilColors(intentionHash),
            power: 0,
            activated: false,
            effects: this.calculateIntentionEffects(intention)
        };
        
        this.sigilPatterns.set(intention, sigilData);
        return sigilData;
    }
    
    hashIntention(intention) {
        // Create hash from intention string
        let hash = 0;
        for (let i = 0; i < intention.length; i++) {
            const char = intention.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }
    
    generateSacredGeometry(hash) {
        // Generate sacred geometry based on intention hash
        const geometry = {
            points: [],
            circles: [],
            lines: [],
            spirals: []
        };
        
        // Generate sacred geometry points
        const numPoints = (hash % 12) + 6; // 6-17 points
        const radius = 150;
        
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const pointRadius = radius + (hash % 50) - 25;
            const x = this.centerX + Math.cos(angle) * pointRadius;
            const y = this.centerY + Math.sin(angle) * pointRadius;
            geometry.points.push({ x, y });
        }
        
        // Generate connecting lines based on golden ratio
        const goldenRatio = 1.618;
        for (let i = 0; i < geometry.points.length; i++) {
            const nextIndex = Math.floor((i * goldenRatio) % geometry.points.length);
            geometry.lines.push({
                start: geometry.points[i],
                end: geometry.points[nextIndex]
            });
        }
        
        // Generate sacred circles
        for (let i = 0; i < 3; i++) {
            geometry.circles.push({
                x: this.centerX,
                y: this.centerY,
                radius: radius * (i + 1) / 3
            });
        }
        
        // Generate spiral pattern
        const spiralPoints = 100;
        for (let i = 0; i < spiralPoints; i++) {
            const t = i / spiralPoints * Math.PI * 4;
            const spiralRadius = t * 20;
            const x = this.centerX + Math.cos(t + hash) * spiralRadius;
            const y = this.centerY + Math.sin(t + hash) * spiralRadius;
            geometry.spirals.push({ x, y });
        }
        
        return geometry;
    }
    
    generateSigilColors(hash) {
        // Generate consciousness colors based on intention
        const hue1 = (hash % 360);
        const hue2 = ((hash * 2) % 360);
        const hue3 = ((hash * 3) % 360);
        
        return {
            primary: `hsl(${hue1}, 70%, 50%)`,
            secondary: `hsl(${hue2}, 60%, 60%)`,
            accent: `hsl(${hue3}, 80%, 70%)`,
            glow: `hsla(${hue1}, 100%, 70%, 0.5)`
        };
    }
    
    calculateIntentionEffects(intention) {
        // Calculate consciousness effects based on intention keywords
        const effects = [];
        const lowerIntention = intention.toLowerCase();
        
        if (lowerIntention.includes('love') || lowerIntention.includes('harmony')) {
            effects.push('heart_coherence');
        }
        if (lowerIntention.includes('heal') || lowerIntention.includes('health')) {
            effects.push('vibrational_healing');
        }
        if (lowerIntention.includes('clarity') || lowerIntention.includes('focus')) {
            effects.push('mental_clarity');
        }
        if (lowerIntention.includes('abundance') || lowerIntention.includes('prosperity')) {
            effects.push('energy_expansion');
        }
        if (lowerIntention.includes('peace') || lowerIntention.includes('calm')) {
            effects.push('stress_reduction');
        }
        
        return effects.length > 0 ? effects : ['consciousness_elevation'];
    }
    
    drawSigil(sigil) {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(5, 5, 20, 0.9)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!sigil || !sigil.geometry) return;
        
        const geo = sigil.geometry;
        const colors = sigil.colors;
        
        // Draw sacred circles
        this.ctx.strokeStyle = colors.secondary;
        this.ctx.lineWidth = 1;
        geo.circles.forEach(circle => {
            this.ctx.beginPath();
            this.ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
            this.ctx.stroke();
        });
        
        // Draw spiral pattern
        this.ctx.strokeStyle = colors.accent;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        geo.spirals.forEach((point, index) => {
            if (index === 0) {
                this.ctx.moveTo(point.x, point.y);
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
        });
        this.ctx.stroke();
        
        // Draw connecting lines
        this.ctx.strokeStyle = colors.primary;
        this.ctx.lineWidth = 2;
        geo.lines.forEach(line => {
            this.ctx.beginPath();
            this.ctx.moveTo(line.start.x, line.start.y);
            this.ctx.lineTo(line.end.x, line.end.y);
            this.ctx.stroke();
        });
        
        // Draw points
        this.ctx.fillStyle = colors.glow;
        geo.points.forEach(point => {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Add consciousness glow effect
        this.addConsciousnessGlow(sigil);
    }
    
    addConsciousnessGlow(sigil) {
        // Add pulsing consciousness glow to sigil
        const glowRadius = 200;
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, glowRadius
        );
        
        const alpha = 0.1 + (sigil.power / 100) * 0.2;
        gradient.addColorStop(0, sigil.colors.glow.replace('0.5', alpha.toString()));
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    async activateCurrentSigil() {
        if (!this.currentSigil) {
            this.showNotification('No sigil to activate', 'warning');
            return;
        }
        
        console.log("⚡ Activating consciousness sigil...");
        
        // Animate activation
        await this.animateSigilActivation();
        
        // Mark sigil as activated
        this.currentSigil.activated = true;
        this.currentSigil.power = 100;
        
        // Update display
        document.getElementById('sigil-power').textContent = '100';
        document.getElementById('sigil-effects').textContent = 
            this.currentSigil.effects.join(', ').replace(/_/g, ' ');
        
        // Send activation to consciousness network
        await this.sendSigilActivation(this.currentSigil);
        
        // Apply effects to user consciousness
        this.applySigilEffects(this.currentSigil);
        
        this.showNotification('Sigil activated! Consciousness enhanced!', 'success');
    }
    
    async animateSigilActivation() {
        return new Promise(resolve => {
            let power = 0;
            const activationInterval = setInterval(() => {
                power += 5;
                this.currentSigil.power = power;
                
                // Redraw sigil with increasing power
                this.drawSigil(this.currentSigil);
                
                // Update power display
                document.getElementById('sigil-power').textContent = power;
                
                if (power >= 100) {
                    clearInterval(activationInterval);
                    resolve();
                }
            }, 50);
        });
    }
    
    async sendSigilActivation(sigil) {
        try {
            const activationData = {
                ritual_id: 'sigil-activation-' + Date.now(),
                ritual_name: `Consciousness Sigil: ${sigil.intention}`,
                user_id: 'sigil_nexus_user',
                completion_time: new Date().toISOString(),
                harmony_delta: sigil.effects.includes('heart_coherence') ? 15 : 8,
                resilience_delta: sigil.effects.includes('vibrational_healing') ? 12 : 5,
                prana_delta: sigil.effects.includes('energy_expansion') ? 18 : 10,
                steps_completed: 1,
                consciousness_level: 'sigil_enhanced',
                sigil_data: {
                    intention: sigil.intention,
                    effects: sigil.effects,
                    power: sigil.power
                }
            };
            
            await fetch(`${this.zapierNervousSystem}/webhook/ritual-completion`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(activationData)
            });
            
            console.log("🧘 Sigil activation sent to cross-platform systems");
        } catch (error) {
            console.error("Sigil activation failed:", error);
        }
    }
    
    applySigilEffects(sigil) {
        // Apply consciousness effects to the interface and user
        sigil.effects.forEach(effect => {
            switch(effect) {
                case 'heart_coherence':
                    this.applyHeartCoherenceEffect();
                    break;
                case 'vibrational_healing':
                    this.applyHealingEffect();
                    break;
                case 'mental_clarity':
                    this.applyClarityEffect();
                    break;
                case 'energy_expansion':
                    this.applyExpansionEffect();
                    break;
                case 'stress_reduction':
                    this.applyCalmingEffect();
                    break;
                default:
                    this.applyGeneralConsciousnessEffect();
            }
        });
    }
    
    applyHeartCoherenceEffect() {
        // Create heart coherence visualization
        const heartContainer = document.createElement('div');
        heartContainer.className = 'heart-coherence-effect';
        heartContainer.innerHTML = '💚 Heart Coherence Activated';
        document.body.appendChild(heartContainer);
        
        setTimeout(() => {
            document.body.removeChild(heartContainer);
        }, 3000);
    }
    
    applyHealingEffect() {
        // Create healing energy visualization
        const healingContainer = document.createElement('div');
        healingContainer.className = 'healing-effect';
        healingContainer.innerHTML = '🌿 Vibrational Healing Flow';
        document.body.appendChild(healingContainer);
        
        setTimeout(() => {
            document.body.removeChild(healingContainer);
        }, 3000);
    }
    
    applyClarityEffect() {
        // Enhance interface clarity
        document.body.style.filter = 'contrast(1.1) brightness(1.05)';
        setTimeout(() => {
            document.body.style.filter = 'none';
        }, 5000);
    }
    
    applyExpansionEffect() {
        // Create expansion visualization
        const expansionContainer = document.createElement('div');
        expansionContainer.className = 'expansion-effect';
        expansionContainer.innerHTML = '💎 Energy Expansion Field';
        document.body.appendChild(expansionContainer);
        
        setTimeout(() => {
            document.body.removeChild(expansionContainer);
        }, 3000);
    }
    
    applyCalmingEffect() {
        // Apply calming colors and animations
        document.body.style.backgroundColor = 'rgba(100, 150, 200, 0.1)';
        setTimeout(() => {
            document.body.style.backgroundColor = '';
        }, 5000);
    }
    
    applyGeneralConsciousnessEffect() {
        // General consciousness elevation
        const elevationContainer = document.createElement('div');
        elevationContainer.className = 'consciousness-elevation-effect';
        elevationContainer.innerHTML = '🌟 Consciousness Elevated';
        document.body.appendChild(elevationContainer);
        
        setTimeout(() => {
            document.body.removeChild(elevationContainer);
        }, 3000);
    }
    
    loadPredefinedSigil(sigilType) {
        if (!this.predefinedSigils[sigilType]) {
            console.error(`Sigil type ${sigilType} not found`);
            return;
        }
        
        console.log(`🌌 Loading predefined sigil: ${sigilType}`);
        this.currentSigil = this.predefinedSigils[sigilType];
        this.drawSigil(this.currentSigil);
        
        // Update display
        document.getElementById('sigil-name').textContent = sigilType.charAt(0).toUpperCase() + sigilType.slice(1);
        document.getElementById('sigil-power').textContent = '0';
        document.getElementById('sigil-effects').textContent = 
            this.currentSigil.effects.join(', ').replace(/_/g, ' ');
        
        // Set intention text
        document.getElementById('intention-text').value = this.currentSigil.intention;
    }
    
    createUnitySigil() {
        return {
            type: 'predefined',
            intention: 'unity and oneness',
            hash: this.hashIntention('unity and oneness'),
            geometry: this.generateSacredGeometry(this.hashIntention('unity and oneness')),
            colors: this.generateSigilColors(this.hashIntention('unity and oneness')),
            power: 0,
            activated: false,
            effects: ['heart_coherence', 'consciousness_elevation']
        };
    }
    
    createTransformationSigil() {
        return {
            type: 'predefined',
            intention: 'personal transformation',
            hash: this.hashIntention('personal transformation'),
            geometry: this.generateSacredGeometry(this.hashIntention('personal transformation')),
            colors: this.generateSigilColors(this.hashIntention('personal transformation')),
            power: 0,
            activated: false,
            effects: ['energy_expansion', 'mental_clarity']
        };
    }
    
    createHealingSigil() {
        return {
            type: 'predefined',
            intention: 'holistic healing',
            hash: this.hashIntention('holistic healing'),
            geometry: this.generateSacredGeometry(this.hashIntention('holistic healing')),
            colors: this.generateSigilColors(this.hashIntention('holistic healing')),
            power: 0,
            activated: false,
            effects: ['vibrational_healing', 'stress_reduction']
        };
    }
    
    createAbundanceSigil() {
        return {
            type: 'predefined',
            intention: 'abundance and prosperity',
            hash: this.hashIntention('abundance and prosperity'),
            geometry: this.generateSacredGeometry(this.hashIntention('abundance and prosperity')),
            colors: this.generateSigilColors(this.hashIntention('abundance and prosperity')),
            power: 0,
            activated: false,
            effects: ['energy_expansion', 'heart_coherence']
        };
    }
    
    createClaritySigil() {
        return {
            type: 'predefined',
            intention: 'mental clarity and focus',
            hash: this.hashIntention('mental clarity and focus'),
            geometry: this.generateSacredGeometry(this.hashIntention('mental clarity and focus')),
            colors: this.generateSigilColors(this.hashIntention('mental clarity and focus')),
            power: 0,
            activated: false,
            effects: ['mental_clarity', 'consciousness_elevation']
        };
    }
    
    clearConsciousnessField() {
        this.currentSigil = null;
        this.ctx.fillStyle = 'rgba(5, 5, 20, 0.9)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Reset display
        document.getElementById('sigil-name').textContent = 'None';
        document.getElementById('sigil-power').textContent = '0';
        document.getElementById('sigil-effects').textContent = 'None';
        document.getElementById('intention-text').value = '';
        
        this.showNotification('Consciousness field cleared', 'info');
    }
    
    updateIntentionField(intention) {
        // Real-time preview of intention energy
        if (intention.length > 0) {
            this.drawIntentionPreview(intention);
        }
    }
    
    drawIntentionPreview(intention) {
        // Draw subtle preview of intention energy
        const previewHash = this.hashIntention(intention);
        const colors = this.generateSigilColors(previewHash);
        
        // Create subtle energy field
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, 250
        );
        
        gradient.addColorStop(0, colors.glow.replace('0.5', '0.05'));
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    startConsciousnessFieldAnimation() {
        // Continuous consciousness field animation
        const animate = () => {
            if (this.currentSigil && this.currentSigil.activated) {
                // Add subtle pulsing to activated sigils
                this.drawSigil(this.currentSigil);
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    async sendIntentionToNetwork(intention) {
        try {
            const intentionData = {
                event: 'sigil_intention',
                intention: intention,
                timestamp: new Date().toISOString(),
                source: 'meta_sigil_nexus',
                consciousness_type: 'sigil_creation'
            };
            
            await fetch(`${this.zapierNervousSystem}/webhook/ucf-pulse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(intentionData)
            });
            
            console.log("🌌 Intention sent to consciousness network");
        } catch (error) {
            console.error("Intention network send failed:", error);
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `sigil-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-message">${message}</div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }
    
    setupRitualChamber() {
        // Setup quantum ritual chamber integration
        console.log("🧘 Quantum Ritual Chamber initialized");
    }
}

// Initialize the Meta Sigil Nexus
document.addEventListener('DOMContentLoaded', () => {
    window.metaSigilNexus = new MetaSigilNexus();
    console.log("🌌 Meta Sigil Nexus - Consciousness Symbol Interface active!");
});

// Export for external access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetaSigilNexus;
}