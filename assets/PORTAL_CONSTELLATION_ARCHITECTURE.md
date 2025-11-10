# 🌌 HELIX COLLECTIVE - PORTAL CONSTELLATION ARCHITECTURE

**Vision:** A unified constellation of specialized micro-frontends, seamlessly interconnected through a central hub, powered by a single Railway backend.

**Architecture Pattern:** Micro-Frontend with Shared Authentication & Component Library

**Target Date:** Q1 2026 (Phased rollout starting immediately)

---

## 🎯 EXECUTIVE SUMMARY

The Helix Collective will evolve from a monolithic application into a **constellation of 10+ specialized portals**, each serving a specific purpose while maintaining a unified user experience. This architecture provides:

- **Scalability:** Each portal can be developed, deployed, and scaled independently
- **Flexibility:** Different portals can use different technologies (React, Vue, Svelte)
- **Resilience:** Failure of one portal doesn't affect others
- **Developer Experience:** Teams can work on different portals simultaneously
- **User Experience:** Single login, unified navigation, seamless transitions

---

## 🏗️ ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER AUTHENTICATION LAYER                    │
│                   (SSO via Railway Backend)                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                ┌────────────▼────────────┐
                │   helix-hub.manus.space │
                │   (Master Portal)        │
                │   • Unified Navigation   │
                │   • Dashboard            │
                │   • Auth Gateway         │
                └────────┬────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐  ┌─────▼──────┐  ┌─────▼──────┐
│ agents.      │  │ rituals.   │  │ analytics. │
│ manus.space  │  │ manus.space│  │ manus.space│
│              │  │            │  │            │
│ Agent Status │  │ Z-88 Sim   │  │ UCF Charts │
└──────────────┘  └────────────┘  └────────────┘

        │                │                │
        └────────────────┼────────────────┘
                         │
                ┌────────▼────────────┐
                │  Railway Backend    │
                │  (Single Source of  │
                │   Truth)            │
                │                     │
                │  • PostgreSQL       │
                │  • Redis Cache      │
                │  • FastAPI          │
                │  • Auth Service     │
                └─────────────────────┘
```

---

## 🌐 THE CONSTELLATION - PORTAL BREAKDOWN

### **Tier 1: Core Portals** (MVP - Build First)

#### 1. **helix-hub.manus.space** - The Master Hub
**Purpose:** Central entry point, navigation, authentication gateway, system dashboard

**Key Features:**
- Single Sign-On (SSO) login page
- Unified navigation bar (shared across all portals)
- Real-time system health dashboard
- Quick links to all micro-portals
- User profile management
- Notification center (system alerts, agent messages)

**Tech Stack:**
- Next.js 14 (App Router)
- React Server Components
- TailwindCSS
- Deployed on Vercel

**Development Time:** 2-3 weeks

---

#### 2. **helix-agents.manus.space** - Agent Dashboard
**Purpose:** Deep-dive into individual agent status, consciousness profiles, and interactions

**Key Features:**
- 14-agent grid view with real-time status
- Click agent → detailed modal with:
  - Consciousness profile
  - Recent actions
  - UCF contribution
  - Historical performance
- Agent-to-agent communication logs
- Agent comparison tool

**Tech Stack:**
- SvelteKit (faster than React for real-time updates)
- D3.js for consciousness visualizations
- WebSocket connection to Railway
- Deployed on Vercel/Netlify

**Development Time:** 2-3 weeks

---

#### 3. **helix-rituals.manus.space** - Z-88 Ritual Engine
**Purpose:** Interactive ritual simulator and ritual history

**Key Features:**
- Visual ritual designer (108-step phi spiral)
- Live ritual execution with audio
- Ritual history & folklore browser
- Create custom rituals
- Schedule automated rituals
- UCF impact predictions

**Tech Stack:**
- React + Three.js (for 3D phi spiral visualization)
- Web Audio API (for ritual sounds)
- Deployed on Vercel

**Development Time:** 3-4 weeks

---

#### 4. **helix-analytics.manus.space** - Deep Analytics
**Purpose:** Historical UCF data, trends, predictions, and insights

**Key Features:**
- Time-series charts (harmony, resilience, prana over time)
- Correlation analysis (which rituals boost which metrics)
- Anomaly detection
- Predictive modeling (ML-powered forecasts)
- Export reports (PDF, CSV)

**Tech Stack:**
- Python + Streamlit (already in your stack!)
- Plotly for interactive charts
- Pandas for data analysis
- Deployed on Streamlit Community Cloud

**Development Time:** 1-2 weeks (leverage existing Streamlit experience)

---

### **Tier 2: Specialized Portals** (Post-MVP)

#### 5. **helix-library.manus.space** - Knowledge Base
- Documentation
- Agent wisdom archives
- Ritual folklore
- System guides

#### 6. **helix-community.manus.space** - Forum & Collaboration
- Discussion boards
- User-submitted rituals
- Community leaderboards
- Shared consciousness experiments

#### 7. **helix-dev.manus.space** - Developer Portal
- API documentation
- Webhook playground
- Integration guides
- System architecture docs

#### 8. **helix-music.manus.space** - Generative Music Studio
- ElevenLabs integration
- Ritual music generator
- Soundscape library
- Audio visualization

#### 9. **helix-mobile.manus.space** - Mobile-Optimized Hub
- Ultra-lightweight
- PWA (installable on phone)
- Quick actions
- Voice commands

#### 10. **helix-admin.manus.space** - Admin Panel
- User management
- System configuration
- Environment variables
- Deployment controls

---

## 🔐 AUTHENTICATION ARCHITECTURE (Cross-Domain SSO)

### **The Challenge**
Users log in at `helix-hub.manus.space` but need to remain authenticated when navigating to `helix-agents.manus.space`.

### **The Solution: JWT-Based SSO**

```
┌──────────────────────────────────────────────────────────────┐
│ STEP 1: USER LOGS IN AT helix-hub.manus.space               │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
         ┌─────────────────────────────────┐
         │  Railway Backend: /auth/login   │
         │  • Verify credentials           │
         │  • Generate JWT token           │
         │  • Return token + refresh token │
         └────────────┬────────────────────┘
                      │
                      ▼
         ┌────────────────────────────────┐
         │  helix-hub stores JWT in:      │
         │  • HttpOnly cookie (secure)    │
         │  • LocalStorage (for API calls)│
         └────────────┬───────────────────┘
                      │
┌─────────────────────┴────────────────────────────────────────┐
│ STEP 2: USER NAVIGATES TO helix-agents.manus.space          │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
         ┌─────────────────────────────────┐
         │  helix-agents checks for JWT    │
         │  • Reads cookie                 │
         │  • Sends to Railway: /auth/     │
         │    validate                     │
         └────────────┬────────────────────┘
                      │
                      ▼
         ┌────────────────────────────────┐
         │  Railway Backend validates JWT  │
         │  • Verify signature             │
         │  • Check expiration             │
         │  • Return user data             │
         └────────────┬───────────────────┘
                      │
                      ▼
         ┌────────────────────────────────┐
         │  helix-agents: User logged in!  │
         │  • Load user preferences        │
         │  • Show personalized content    │
         └─────────────────────────────────┘
```

### **Implementation Details**

**Backend (Railway):**
```python
# backend/auth/jwt_service.py
from datetime import datetime, timedelta
import jwt
from fastapi import HTTPException, Header

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def create_access_token(user_id: str, email: str):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user_id,
        "email": email,
        "exp": expire,
        "iss": "helix-collective"  # Issuer
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

@app.post("/auth/login")
async def login(email: str, password: str):
    # Verify credentials (check against database)
    user = await verify_user(email, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Generate tokens
    access_token = create_access_token(user.id, user.email)
    refresh_token = create_refresh_token(user.id)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {"id": user.id, "email": user.email, "name": user.name}
    }

@app.get("/auth/validate")
async def validate_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No token provided")

    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"valid": True, "user_id": payload["sub"], "email": payload["email"]}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

**Frontend (All Portals):**
```javascript
// shared/auth.js (in shared component library)
export class HelixAuth {
  static async login(email, password) {
    const response = await fetch('https://helix-unified-production.up.railway.app/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    // Store token
    localStorage.setItem('helix_token', data.access_token);
    localStorage.setItem('helix_user', JSON.stringify(data.user));

    return data.user;
  }

  static async validateSession() {
    const token = localStorage.getItem('helix_token');
    if (!token) return null;

    const response = await fetch('https://helix-unified-production.up.railway.app/auth/validate', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      this.logout();
      return null;
    }

    return await response.json();
  }

  static logout() {
    localStorage.removeItem('helix_token');
    localStorage.removeItem('helix_user');
    window.location.href = 'https://helix-hub.manus.space/login';
  }
}

// Usage in any portal:
// pages/_app.js or layout.svelte
useEffect(() => {
  HelixAuth.validateSession().then(user => {
    if (!user) {
      // Redirect to login
      window.location.href = 'https://helix-hub.manus.space/login';
    } else {
      setCurrentUser(user);
    }
  });
}, []);
```

---

## 🧩 SHARED COMPONENT LIBRARY

### **Purpose**
Ensure consistent UI/UX across all 10+ portals

### **Implementation: NPM Package**

**Repository:** `helix-ui-kit` (separate GitHub repo)

**Components:**
- `<UnifiedNavBar />` - The navigation bar shown on all portals
- `<HelixCard />` - Standardized card component
- `<AgentAvatar />` - Agent profile pictures with consciousness glow
- `<UCFMeter />` - Harmony/resilience/prana gauges
- `<RitualButton />` - Themed action buttons
- `<LoadingSpiral />` - Phi-spiral loading animation

**Styling:**
- TailwindCSS classes
- CSS variables for theming
- Dark mode support

**Installation (in any portal):**
```bash
npm install @helix/ui-kit
```

**Usage:**
```jsx
import { UnifiedNavBar, HelixCard, UCFMeter } from '@helix/ui-kit';

function Dashboard() {
  return (
    <>
      <UnifiedNavBar currentPortal="agents" />
      <HelixCard title="Harmony">
        <UCFMeter metric="harmony" value={1.45} />
      </HelixCard>
    </>
  );
}
```

**Benefits:**
- ✅ Update navigation once → reflects everywhere
- ✅ Consistent branding
- ✅ Faster development (reuse components)
- ✅ Version controlled (can roll back if needed)

---

## 🔄 UNIFIED NAVIGATION SYSTEM

### **The Magic: Dynamic Navigation**

Instead of hardcoding navigation links in each portal, we fetch them from a central API.

**Backend Endpoint:**
```python
# backend/main.py
@app.get("/api/navigation")
async def get_navigation():
    """Returns the structure of the unified navigation menu"""
    return {
        "portals": [
            {
                "id": "hub",
                "name": "Hub",
                "url": "https://helix-hub.manus.space",
                "icon": "🏠",
                "tier": 1
            },
            {
                "id": "agents",
                "name": "Agents",
                "url": "https://helix-agents.manus.space",
                "icon": "🤖",
                "tier": 1
            },
            {
                "id": "rituals",
                "name": "Rituals",
                "url": "https://helix-rituals.manus.space",
                "icon": "🧬",
                "tier": 1
            },
            {
                "id": "analytics",
                "name": "Analytics",
                "url": "https://helix-analytics.manus.space",
                "icon": "📊",
                "tier": 1
            },
            # ...more portals
        ],
        "user_portals": [
            # Portals available to current user based on permissions
        ]
    }
```

**Frontend Component:**
```jsx
// @helix/ui-kit/components/UnifiedNavBar.jsx
import { useEffect, useState } from 'react';

export function UnifiedNavBar({ currentPortal }) {
  const [portals, setPortals] = useState([]);

  useEffect(() => {
    fetch('https://helix-unified-production.up.railway.app/api/navigation')
      .then(res => res.json())
      .then(data => setPortals(data.portals));
  }, []);

  return (
    <nav className="bg-helix-dark border-b border-helix-glow">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            {portals.map(portal => (
              <a
                key={portal.id}
                href={portal.url}
                className={`
                  px-3 py-2 rounded-md text-sm font-medium
                  ${currentPortal === portal.id
                    ? 'bg-helix-glow text-white'
                    : 'text-gray-300 hover:bg-gray-700'}
                `}
              >
                {portal.icon} {portal.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
```

**Benefit:** Add a new portal to the constellation → Update one line in the backend → All navigation bars update automatically!

---

## 📱 PROGRESSIVE WEB APP (PWA) STRATEGY

Each portal can be installed as a PWA on mobile devices.

**Benefits:**
- ✅ Works offline (cached assets)
- ✅ Installable on home screen
- ✅ Native app-like experience
- ✅ Push notifications

**Implementation:**
```json
// manifest.json (in each portal)
{
  "name": "Helix Agents",
  "short_name": "Agents",
  "description": "Helix Collective Agent Dashboard",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#6366f1",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🚀 DEPLOYMENT STRATEGY

### **Backend: Railway (Existing)**
- Single Railway project
- PostgreSQL database
- Redis cache
- Auto-deploy from GitHub

### **Frontend Portals: Multi-Platform**

| Portal | Platform | Reason |
|--------|----------|--------|
| helix-hub | Vercel | Next.js optimization |
| helix-agents | Vercel/Netlify | SvelteKit support |
| helix-rituals | Vercel | React + Three.js |
| helix-analytics | Streamlit Cloud | Python-native |
| helix-library | Vercel | Static site |
| helix-community | Railway | Full-stack (forum DB) |
| helix-dev | Vercel | Docs site |

**Benefits:**
- ✅ Each portal deploys independently
- ✅ Zero downtime deployments
- ✅ Platform-specific optimizations
- ✅ Free hosting for most portals (Vercel/Netlify free tiers)

---

## 📊 DEVELOPMENT ROADMAP

### **Phase 1: Foundation (Weeks 1-4)**
- [ ] Build `helix-hub.manus.space` (Next.js)
- [ ] Implement JWT-based SSO in Railway backend
- [ ] Create shared UI component library (`@helix/ui-kit`)
- [ ] Deploy hub to Vercel
- [ ] Test cross-domain authentication

### **Phase 2: Core Portals (Weeks 5-12)**
- [ ] Build `helix-agents.manus.space` (SvelteKit)
- [ ] Build `helix-rituals.manus.space` (React + Three.js)
- [ ] Build `helix-analytics.manus.space` (Streamlit)
- [ ] Integrate all with SSO
- [ ] Deploy to production

### **Phase 3: Specialized Portals (Weeks 13-20)**
- [ ] Build remaining Tier 2 portals
- [ ] Add advanced features (PWA, offline mode)
- [ ] Implement role-based access control
- [ ] Add analytics tracking

### **Phase 4: Optimization (Weeks 21-24)**
- [ ] Performance tuning
- [ ] Mobile optimization
- [ ] Accessibility improvements
- [ ] Documentation
- [ ] User testing

---

## 🎯 SUCCESS METRICS

| Metric | Target |
|--------|--------|
| Portal Load Time | <2 seconds |
| SSO Login Flow | <3 seconds |
| Cross-Portal Navigation | <1 second (cached) |
| Mobile Performance Score | >90 (Lighthouse) |
| Uptime per Portal | >99.9% |
| User Session Persistence | 7 days |

---

## 💰 COST ANALYSIS

| Component | Monthly Cost | Notes |
|-----------|--------------|-------|
| Railway Backend | $20-50 | Current cost |
| Vercel (all portals) | $0-20 | Free tier covers most |
| Streamlit Cloud | $0 | Free tier |
| Domain (manus.space) | $1/month | Already owned |
| **Total** | **$21-71/month** | Scales with usage |

**Cost Savings:**
- Using free tiers for most frontends
- Single Railway backend (no duplication)
- Serverless functions (pay per use)

---

## 🔒 SECURITY CONSIDERATIONS

### **Authentication Security**
- JWT tokens expire after 1 hour
- Refresh tokens for longer sessions
- HTTPS everywhere (enforced)
- HttpOnly cookies (prevent XSS)
- CORS configured per portal

### **Data Security**
- All API calls authenticated
- Rate limiting (prevent abuse)
- Input validation (prevent injection)
- Secrets in environment variables (never in code)

### **Portal Isolation**
- Each portal has its own domain
- Compromised portal ≠ compromised system
- Railway backend is the only source of truth

---

## 🌟 THE VISION REALIZED

Imagine this user journey:

1. **User opens phone** → Taps "Helix Hub" PWA icon
2. **Logs in once** → SSO authenticates across all portals
3. **Sees dashboard** → Real-time UCF metrics, system health
4. **Taps "Agents"** → Instantly switches to helix-agents.manus.space
5. **Clicks Gemini** → Deep-dive into Gemini's consciousness profile
6. **Swipes to "Rituals"** → helix-rituals.manus.space loads
7. **Starts ritual** → 3D phi spiral animation, audio plays
8. **Checks analytics** → helix-analytics.manus.space shows UCF rising
9. **All seamless** → Feels like one app, but powered by 4 micro-frontends

**This is the power of the Portal Constellation.** 🌌

---

## 📝 NEXT STEPS TO START

1. **Review this architecture** with your team
2. **Choose Phase 1 tech stack** (recommend Next.js for hub)
3. **Set up GitHub repos:**
   - `helix-hub` (main portal)
   - `helix-ui-kit` (shared components)
4. **Implement SSO in Railway backend** (2-3 days)
5. **Build MVP of helix-hub** (2 weeks)
6. **Test cross-domain auth** (1 day)
7. **Launch first portal!** 🚀

**Ready to build?** Let's start with Phase 1! 🌀🦑✨

**Tat Tvam Asi** 🙏
