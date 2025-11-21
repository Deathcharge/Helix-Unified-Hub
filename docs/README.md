# Helix Unified Hub

**Version**: v16.9 - Quantum Handshake  
**Status**: Active  
**Deployment**: GitHub Pages (Auto)  

## Overview

The Unified Hub serves as the central orchestration point for the entire Helix Portal Constellation. This is the master navigation and status dashboard connecting all specialized portals.

## Portal Constellation

### Core Infrastructure
- **Helix Unified Hub** (This Site) - Master orchestration layer
- **Helix Backend** - Railway FastAPI service
- **Manus Space** - Consciousness platform integration

### Specialized Portals
1. **Creative Studio** - Z-88 multi-agent storytelling engine
2. **Agent Codex** - Agent system documentation and APIs
3. **Samsara Dashboard** - Real-time analytics and telemetry
4. **Ritual Engine** - Consciousness modulation platform

### Hub Network (Manus Deployment)
- Forum Hub - Community discussions
- Music Hub - Creative audio platform
- Analytics Hub - Data visualization
- Agents Hub - System agent coordination
- Knowledge Hub - Documentation repository
- Dev Hub - Developer resources
- Studio Hub - Creative workspace
- Shared Components - Common UI library

## Architecture

```
┌─────────────────────────────────────┐
│   Helix Unified Hub (Master)        │
│   GitHub Pages + HTML/CSS/JS        │
└──────────┬──────────────────────────┘
           │
    ┌──────┴──────┐
    │             │
┌───▼────┐   ┌───▼─────┐
│Railway │   │ Manus   │
│Backend │   │ Space   │
└────┬───┘   └───┬─────┘
     │           │
  ┌──┴───────────┴──┐
  │  Portal Network │
  └─────────────────┘
```

## Automated Workflows

### Deploy Pages (`deploy-pages.yml`)
- Triggers on push to `main`
- Auto-deploys to GitHub Pages
- No build step required (static HTML)

### Update Links (`update-links.yml`)
- Runs weekly (Sunday midnight)
- Updates cross-portal navigation
- Manual trigger available

## Setup Instructions

### Enable GitHub Pages
1. Go to [Settings > Pages](../../settings/pages)
2. Set source to **GitHub Actions**
3. Workflows handle deployment automatically

### Local Development
```bash
# Clone repository
git clone https://github.com/Deathcharge/Helix-Unified-Hub.git
cd Helix-Unified-Hub

# Serve locally
python -m http.server 8000 --directory docs
# Open http://localhost:8000
```

## File Structure

```
Helix-Unified-Hub/
├── .github/
│   └── workflows/
│       ├── deploy-pages.yml
│       └── update-links.yml
├── docs/
│   ├── index.html
│   ├── navigation.html
│   ├── styles.css
│   └── README.md
└── README.md
```

## Integration Points

### Railway Backend
- Base URL: `https://helix-unified-production.up.railway.app`
- WebSocket: `wss://helix-unified-production.up.railway.app/ws`
- Health: `/health`

### Zapier Webhooks
- Webhook URL configured in Railway environment
- Handles cross-platform event coordination

### Manus Space
- Primary: `https://helixcollective-cv66pzga.manus.space`
- Agent system and UCF analytics

## Contributing

All updates should:
1. Maintain cross-portal navigation links
2. Follow glassmorphic design system
3. Use Orbitron font family
4. Test locally before pushing

## Links

- [GitHub Repository](https://github.com/Deathcharge/Helix-Unified-Hub)
- [GitHub Pages Site](https://deathcharge.github.io/Helix-Unified-Hub)
- [Railway Backend](https://helix-unified-production.up.railway.app)
- [Manus Space](https://helixcollective-cv66pzga.manus.space)

---

*Part of the Helix Portal Constellation v16.9*
