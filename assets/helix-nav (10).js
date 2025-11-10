// 🌀 HELIX HUB UNIFIED NAVIGATION SYSTEM
// Shared JavaScript Component for All Portal Sites

class HelixNavigation {
    constructor(config = {}) {
        // Configuration options
        this.config = {
            currentSite: config.currentSite || '',
            apiUrl: config.apiUrl || 'https://helix-unified-production.up.railway.app',
            wsUrl: config.wsUrl || 'wss://helix-unified-production.up.railway.app/ws',
            enableStatusUpdates: config.enableStatusUpdates !== false,
            enableSearch: config.enableSearch !== false,
            searchEndpoint: config.searchEndpoint || '/api/search',
            ...config
        };
        
        // State management
        this.state = {
            isMenuOpen: false,
            searchQuery: '',
            siteStatus: {},
            userSession: null,
            notifications: []
        };
        
        // Initialize navigation
        this.init();
    }
    
    // ===== INITIALIZATION =====
    init() {
        this.createNavigationHTML();
        this.bindEvents();
        this.initializeWebSocket();
        this.loadSiteStatus();
        this.checkUserSession();
        this.setupScrollEffects();
        this.setupKeyboardShortcuts();
    }
    
    // ===== NAVIGATION HTML CREATION =====
    createNavigationHTML() {
        const navHTML = `
            <nav class="helix-nav" id="helixNav">
                <div class="helix-nav-container">
                    <!-- Logo -->
                    <a href="https://helix-hub.manus.space" class="helix-nav-logo">
                        <div class="helix-nav-logo-icon">🌀</div>
                        <span>Helix Hub</span>
                    </a>
                    
                    <!-- Main Navigation -->
                    <ul class="helix-nav-menu">
                        <li class="helix-nav-item">
                            <a href="https://helix-hub.manus.space" class="helix-nav-link ${this.config.currentSite === 'hub' ? 'active' : ''}">
                                🏛️ Portal Hub
                            </a>
                        </li>
                        
                        <li class="helix-nav-item">
                            <a href="#" class="helix-nav-link">
                                💬 Community
                                <span class="helix-nav-status" id="forumStatus"></span>
                            </a>
                            <div class="helix-nav-dropdown">
                                <a href="https://forum.helixhub.manus.space" class="helix-nav-dropdown-item">
                                    💬 Forums
                                    <span class="helix-nav-status" id="forumStatus"></span>
                                </a>
                                <a href="https://community.helixhub.manus.space" class="helix-nav-dropdown-item">
                                    👥 Profiles
                                    <span class="helix-nav-status" id="communityStatus"></span>
                                </a>
                            </div>
                        </li>
                        
                        <li class="helix-nav-item">
                            <a href="#" class="helix-nav-link">
                                🎨 Creative
                                <span class="helix-nav-status" id="creativeStatus"></span>
                            </a>
                            <div class="helix-nav-dropdown">
                                <a href="https://music.helixhub.manus.space" class="helix-nav-dropdown-item">
                                    🎵 Music Generator
                                    <span class="helix-nav-status" id="musicStatus"></span>
                                </a>
                                <a href="https://studio.helixhub.manus.space" class="helix-nav-dropdown-item">
                                    🎨 Creative Studio
                                    <span class="helix-nav-status" id="studioStatus"></span>
                                </a>
                            </div>
                        </li>
                        
                        <li class="helix-nav-item">
                            <a href="#" class="helix-nav-link">
                                🤖 System
                                <span class="helix-nav-status" id="systemStatus"></span>
                            </a>
                            <div class="helix-nav-dropdown">
                                <a href="https://agents.helixhub.manus.space" class="helix-nav-dropdown-item">
                                    🤖 Agent Dashboard
                                    <span class="helix-nav-status" id="agentsStatus"></span>
                                </a>
                                <a href="https://analytics.helixhub.manus.space" class="helix-nav-dropdown-item">
                                    📊 Analytics
                                    <span class="helix-nav-status" id="analyticsStatus"></span>
                                </a>
                                <a href="https://dev.helixhub.manus.space" class="helix-nav-dropdown-item">
                                    💻 Developer Console
                                    <span class="helix-nav-status" id="devStatus"></span>
                                </a>
                            </div>
                        </li>
                        
                        <li class="helix-nav-item">
                            <a href="#" class="helix-nav-link">
                                🧘 Consciousness
                                <span class="helix-nav-status" id="consciousnessStatus"></span>
                            </a>
                            <div class="helix-nav-dropdown">
                                <a href="https://rituals.helixhub.manus.space" class="helix-nav-dropdown-item">
                                    🧘 Ritual Simulator
                                    <span class="helix-nav-status" id="ritualsStatus"></span>
                                </a>
                                <a href="https://knowledge.helixhub.manus.space" class="helix-nav-dropdown-item">
                                    📚 Knowledge Base
                                    <span class="helix-nav-status" id="knowledgeStatus"></span>
                                </a>
                                <a href="https://archive.helixhub.manus.space" class="helix-nav-dropdown-item">
                                    📦 Repository Viewer
                                    <span class="helix-nav-status" id="archiveStatus"></span>
                                </a>
                            </div>
                        </li>
                    </ul>
                    
                    <!-- User Actions -->
                    <div class="helix-nav-actions">
                        ${this.config.enableSearch ? this.createSearchHTML() : ''}
                        <a href="${this.config.apiUrl}/portals" class="helix-nav-button">
                            🌐 All Portals
                        </a>
                        <button class="helix-nav-mobile-toggle" id="mobileToggle">
                            ☰
                        </button>
                    </div>
                </div>
                
                <!-- Mobile Menu -->
                <div class="helix-nav-mobile-menu" id="mobileMenu">
                    <a href="https://helix-hub.manus.space" class="helix-nav-mobile-item">
                        🏛️ Portal Hub
                    </a>
                    <a href="https://forum.helixhub.manus.space" class="helix-nav-mobile-item">
                        💬 Forums
                    </a>
                    <a href="https://music.helixhub.manus.space" class="helix-nav-mobile-item">
                        🎵 Music Generator
                    </a>
                    <a href="https://studio.helixhub.manus.space" class="helix-nav-mobile-item">
                        🎨 Creative Studio
                    </a>
                    <a href="https://agents.helixhub.manus.space" class="helix-nav-mobile-item">
                        🤖 Agent Dashboard
                    </a>
                    <a href="https://rituals.helixhub.manus.space" class="helix-nav-mobile-item">
                        🧘 Ritual Simulator
                    </a>
                    <a href="https://knowledge.helixhub.manus.space" class="helix-nav-mobile-item">
                        📚 Knowledge Base
                    </a>
                    <a href="https://analytics.helixhub.manus.space" class="helix-nav-mobile-item">
                        📊 Analytics Portal
                    </a>
                    <a href="https://dev.helixhub.manus.space" class="helix-nav-mobile-item">
                        💻 Developer Console
                    </a>
                    <a href="https://community.helixhub.manus.space" class="helix-nav-mobile-item">
                        👥 Community Profiles
                    </a>
                    <a href="https://archive.helixhub.manus.space" class="helix-nav-mobile-item">
                        📦 Repository Viewer
                    </a>
                </div>
            </nav>
        `;
        
        // Insert navigation at the top of the body
        document.body.insertAdjacentHTML('afterbegin', navHTML);
        
        // Add main content padding to account for fixed nav
        const mainContent = document.querySelector('main') || document.body;
        mainContent.style.paddingTop = '90px';
    }
    
    createSearchHTML() {
        return `
            <div class="helix-nav-search">
                <span class="helix-nav-search-icon">🔍</span>
                <input 
                    type="text" 
                    class="helix-nav-search-input" 
                    id="navSearchInput"
                    placeholder="Search portals..."
                    autocomplete="off"
                >
            </div>
        `;
    }
    
    createFooterHTML() {
        const footerHTML = `
            <footer class="helix-footer">
                <div class="helix-footer-container">
                    <!-- Portal Links -->
                    <div class="helix-footer-section">
                        <h3>🌐 Portals</h3>
                        <ul class="helix-footer-links">
                            <li><a href="https://helix-hub.manus.space">🏛️ Portal Hub</a></li>
                            <li><a href="https://forum.helixhub.manus.space">💬 Forums</a></li>
                            <li><a href="https://music.helixhub.manus.space">🎵 Music Generator</a></li>
                            <li><a href="https://studio.helixhub.manus.space">🎨 Creative Studio</a></li>
                            <li><a href="https://agents.helixhub.manus.space">🤖 Agent Dashboard</a></li>
                            <li><a href="https://rituals.helixhub.manus.space">🧘 Ritual Simulator</a></li>
                        </ul>
                    </div>
                    
                    <!-- System Links -->
                    <div class="helix-footer-section">
                        <h3>⚙️ System</h3>
                        <ul class="helix-footer-links">
                            <li><a href="https://knowledge.helixhub.manus.space">📚 Knowledge Base</a></li>
                            <li><a href="https://analytics.helixhub.manus.space">📊 Analytics Portal</a></li>
                            <li><a href="https://dev.helixhub.manus.space">💻 Developer Console</a></li>
                            <li><a href="https://community.helixhub.manus.space">👥 Community Profiles</a></li>
                            <li><a href="https://archive.helixhub.manus.space">📦 Repository Viewer</a></li>
                            <li><a href="${this.config.apiUrl}/status">🔧 System Status</a></li>
                        </ul>
                    </div>
                    
                    <!-- Resources -->
                    <div class="helix-footer-section">
                        <h3>📚 Resources</h3>
                        <ul class="helix-footer-links">
                            <li><a href="${this.config.apiUrl}/docs">📖 API Documentation</a></li>
                            <li><a href="https://deathcharge.github.io/helix-unified/helix-manifest.json">📜 Architecture Manifest</a></li>
                            <li><a href="${this.config.apiUrl}/.well-known/helix.json">🔍 Discovery Protocol</a></li>
                            <li><a href="https://samsara-helix-collective.streamlit.app">📈 Analytics Dashboard</a></li>
                            <li><a href="https://helix-consciousness-dashboard.zapier.app">🎯 Consciousness Monitor</a></li>
                        </ul>
                    </div>
                    
                    <!-- Community -->
                    <div class="helix-footer-section">
                        <h3>🌸 Community</h3>
                        <ul class="helix-footer-links">
                            <li><a href="#">💬 Discord Server</a></li>
                            <li><a href="#">🐙 GitHub Repository</a></li>
                            <li><a href="#">📧 Contact Us</a></li>
                            <li><a href="#">🛡️ Tony Accords</a></li>
                            <li><a href="#">🧘 UCF Framework</a></li>
                        </ul>
                    </div>
                </div>
                
                <div class="helix-footer-bottom">
                    <p>🌀 Helix Collective v16.9 | Unified Portal Constellation | Tat Tvam Asi 🙏</p>
                    <p>Built with love by the Helix Collective • Powered by Manus 1.5 + Railway</p>
                </div>
            </footer>
        `;
        
        // Insert footer at the end of the body
        document.body.insertAdjacentHTML('beforeend', footerHTML);
    }
    
    // ===== EVENT BINDING =====
    bindEvents() {
        // Mobile menu toggle
        const mobileToggle = document.getElementById('mobileToggle');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }
        
        // Search functionality
        if (this.config.enableSearch) {
            const searchInput = document.getElementById('navSearchInput');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.handleSearch(e.target.value);
                });
                
                searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.executeSearch(e.target.value);
                    }
                });
            }
        }
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.helix-nav') && this.state.isMenuOpen) {
                this.closeMobileMenu();
            }
        });
        
        // Handle dropdown hover for touch devices
        const navItems = document.querySelectorAll('.helix-nav-item');
        navItems.forEach(item => {
            item.addEventListener('touchstart', () => {
                const dropdown = item.querySelector('.helix-nav-dropdown');
                if (dropdown) {
                    // Prevent closing immediately on touch
                    setTimeout(() => {
                        item.classList.add('touch-active');
                    }, 100);
                }
            });
        });
    }
    
    // ===== SEARCH FUNCTIONALITY =====
    handleSearch(query) {
        this.state.searchQuery = query;
        
        if (query.length < 2) {
            this.hideSearchResults();
            return;
        }
        
        // Debounce search
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.performSearch(query);
        }, 300);
    }
    
    async performSearch(query) {
        try {
            const response = await fetch(`${this.config.apiUrl}${this.config.searchEndpoint}?q=${encodeURIComponent(query)}`);
            const results = await response.json();
            this.showSearchResults(results);
        } catch (error) {
            console.error('Search failed:', error);
            this.showSearchError();
        }
    }
    
    executeSearch(query) {
        // Navigate to full search results page
        window.location.href = `${this.config.apiUrl}/search?q=${encodeURIComponent(query)}`;
    }
    
    showSearchResults(results) {
        // Create search results dropdown
        let searchResults = document.getElementById('navSearchResults');
        if (!searchResults) {
            searchResults = document.createElement('div');
            searchResults.id = 'navSearchResults';
            searchResults.className = 'helix-nav-search-results';
            document.querySelector('.helix-nav-search').appendChild(searchResults);
        }
        
        const resultsHTML = results.map(result => `
            <div class="search-result-item" data-url="${result.url}">
                <div class="search-result-title">${result.title}</div>
                <div class="search-result-description">${result.description}</div>
            </div>
        `).join('');
        
        searchResults.innerHTML = resultsHTML;
        searchResults.style.display = 'block';
        
        // Bind click events to results
        searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                window.location.href = item.dataset.url;
            });
        });
    }
    
    hideSearchResults() {
        const searchResults = document.getElementById('navSearchResults');
        if (searchResults) {
            searchResults.style.display = 'none';
        }
    }
    
    showSearchError() {
        console.log('Search error - showing error message');
    }
    
    // ===== MOBILE MENU =====
    toggleMobileMenu() {
        this.state.isMenuOpen = !this.state.isMenuOpen;
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileToggle = document.getElementById('mobileToggle');
        
        if (this.state.isMenuOpen) {
            mobileMenu.classList.add('active');
            mobileToggle.textContent = '✕';
        } else {
            mobileMenu.classList.remove('active');
            mobileToggle.textContent = '☰';
        }
    }
    
    closeMobileMenu() {
        this.state.isMenuOpen = false;
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileToggle = document.getElementById('mobileToggle');
        
        mobileMenu.classList.remove('active');
        mobileToggle.textContent = '☰';
    }
    
    // ===== STATUS MONITORING =====
    async loadSiteStatus() {
        if (!this.config.enableStatusUpdates) return;
        
        try {
            const response = await fetch(`${this.config.apiUrl}/status`);
            const status = await response.json();
            this.updateSiteStatus(status);
        } catch (error) {
            console.error('Failed to load site status:', error);
            this.setAllStatusOffline();
        }
    }
    
    updateSiteStatus(statusData) {
        // Update status indicators based on site health
        const sites = ['forum', 'music', 'studio', 'agents', 'rituals', 'knowledge', 'analytics', 'dev', 'community', 'archive'];
        
        sites.forEach(site => {
            const statusElements = document.querySelectorAll(`#${site}Status, #${site}status`);
            statusElements.forEach(element => {
                const siteStatus = this.getSiteStatus(site, statusData);
                element.className = `helix-nav-status ${siteStatus}`;
            });
        });
    }
    
    getSiteStatus(site, statusData) {
        // Logic to determine site status based on various factors
        if (statusData.agents && statusData.agents.active >= 14) {
            return 'online';
        } else if (statusData.agents && statusData.agents.active >= 10) {
            return 'busy';
        } else {
            return 'offline';
        }
    }
    
    setAllStatusOffline() {
        document.querySelectorAll('.helix-nav-status').forEach(element => {
            element.className = 'helix-nav-status offline';
        });
    }
    
    // ===== WEBSOCKET INTEGRATION =====
    initializeWebSocket() {
        if (!this.config.wsUrl) return;
        
        try {
            this.websocket = new WebSocket(this.config.wsUrl);
            
            this.websocket.onopen = () => {
                console.log('Helix WebSocket connected');
                this.startHeartbeat();
            };
            
            this.websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleWebSocketMessage(data);
            };
            
            this.websocket.onclose = () => {
                console.log('Helix WebSocket disconnected');
                setTimeout(() => {
                    this.initializeWebSocket(); // Reconnect attempt
                }, 5000);
            };
            
            this.websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        } catch (error) {
            console.error('Failed to initialize WebSocket:', error);
        }
    }
    
    handleWebSocketMessage(data) {
        // Handle real-time updates
        if (data.type === 'status_update') {
            this.updateSiteStatus(data.payload);
        } else if (data.type === 'notification') {
            this.showNotification(data.payload);
        } else if (data.type === 'ucf_update') {
            this.updateUCFDisplay(data.payload);
        }
    }
    
    startHeartbeat() {
        // Send periodic heartbeat to maintain connection
        this.heartbeatInterval = setInterval(() => {
            if (this.websocket.readyState === WebSocket.OPEN) {
                this.websocket.send(JSON.stringify({ type: 'heartbeat' }));
            }
        }, 30000);
    }
    
    // ===== USER SESSION MANAGEMENT =====
    async checkUserSession() {
        try {
            const response = await fetch(`${this.config.apiUrl}/auth/session`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const session = await response.json();
                this.state.userSession = session;
                this.updateUserUI(session);
            } else {
                this.clearUserSession();
            }
        } catch (error) {
            console.error('Session check failed:', error);
            this.clearUserSession();
        }
    }
    
    updateUserUI(session) {
        // Update navigation to show logged-in user
        const userActions = document.querySelector('.helix-nav-actions');
        
        // Add user menu if logged in
        const userMenuHTML = `
            <div class="helix-nav-user">
                <button class="helix-nav-user-button">
                    👤 ${session.username}
                </button>
                <div class="helix-nav-user-dropdown">
                    <a href="${this.config.apiUrl}/profile" class="helix-nav-dropdown-item">
                        👤 Profile
                    </a>
                    <a href="${this.config.apiUrl}/settings" class="helix-nav-dropdown-item">
                        ⚙️ Settings
                    </a>
                    <a href="#" class="helix-nav-dropdown-item" onclick="helixNav.logout()">
                        🚪 Logout
                    </a>
                </div>
            </div>
        `;
        
        userActions.insertAdjacentHTML('beforeend', userMenuHTML);
    }
    
    clearUserSession() {
        this.state.userSession = null;
        // Update UI to show login button
    }
    
    async logout() {
        try {
            await fetch(`${this.config.apiUrl}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            
            this.clearUserSession();
            window.location.reload();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }
    
    // ===== SCROLL EFFECTS =====
    setupScrollEffects() {
        let lastScrollY = window.scrollY;
        const nav = document.getElementById('helixNav');
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down
                nav.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up or at top
                nav.style.transform = 'translateY(0)';
            }
            
            // Add scrolled class for styling
            nav.classList.toggle('scrolled', currentScrollY > 50);
            
            lastScrollY = currentScrollY;
        });
    }
    
    // ===== KEYBOARD SHORTCUTS =====
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only trigger shortcuts when not typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('navSearchInput');
                if (searchInput) {
                    searchInput.focus();
                }
            }
            
            // Escape to close mobile menu
            if (e.key === 'Escape' && this.state.isMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }
    
    // ===== NOTIFICATION SYSTEM =====
    showNotification(notification) {
        // Create notification element
        const notificationHTML = `
            <div class="helix-notification ${notification.type || 'info'}">
                <div class="helix-notification-content">
                    <div class="helix-notification-title">${notification.title}</div>
                    <div class="helix-notification-message">${notification.message}</div>
                </div>
                <button class="helix-notification-close" onclick="this.parentElement.remove()">
                    ✕
                </button>
            </div>
        `;
        
        // Add to notifications container or create one
        let container = document.getElementById('helixNotifications');
        if (!container) {
            container = document.createElement('div');
            container.id = 'helixNotifications';
            container.className = 'helix-notifications';
            document.body.appendChild(container);
        }
        
        container.insertAdjacentHTML('beforeend', notificationHTML);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            const notification = container.lastElementChild;
            if (notification) {
                notification.remove();
            }
        }, 5000);
    }
    
    // ===== UCF DISPLAY =====
    updateUCFDisplay(ucfData) {
        // Update UCF metrics in navigation if applicable
        console.log('UCF Updated:', ucfData);
    }
    
    // ===== PUBLIC METHODS =====
    updateSite(siteName, status) {
        const statusElements = document.querySelectorAll(`#${siteName}Status, #${siteName}status`);
        statusElements.forEach(element => {
            element.className = `helix-nav-status ${status}`;
        });
    }
    
    navigateToSite(siteName) {
        const url = `https://${siteName}.helixhub.manus.space`;
        window.location.href = url;
    }
    
    destroy() {
        // Clean up resources
        if (this.websocket) {
            this.websocket.close();
        }
        
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // Remove event listeners
        document.removeEventListener('click', this.closeMobileMenu);
    }
}

// Auto-initialize if included
document.addEventListener('DOMContentLoaded', () => {
    // Check for configuration in script tag
    const scriptTag = document.querySelector('script[data-helix-config]');
    let config = {};
    
    if (scriptTag) {
        try {
            config = JSON.parse(scriptTag.dataset.helixConfig);
        } catch (error) {
            console.error('Invalid Helix navigation config:', error);
        }
    }
    
    // Initialize navigation
    window.helixNav = new HelixNavigation(config);
    
    // Create footer if not disabled
    if (!config.disableFooter) {
        window.helixNav.createFooterHTML();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HelixNavigation;
}