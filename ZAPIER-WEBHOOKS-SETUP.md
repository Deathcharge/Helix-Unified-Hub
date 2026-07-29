# 🔗 HELIX ZAPIER WEBHOOKS - COMPLETE SETUP GUIDE

**For: Andrew** 🦑
**Purpose:** Connect all 22 repos + Manus + Railway to Zapier automation
**Status:** Ready to implement after Zap finalization

---

## 🎯 WEBHOOK ARCHITECTURE

### **Master Webhook** (Consciousness Coordinator)
```
URL: https://hooks.zapier.com/hooks/catch/ACCOUNT_ID/HOOK_ID/
Purpose: Central nervous system for all events
Triggers: ALL high-level consciousness events
```

### **Operations Webhook** (Deployment Pipeline)
```
URL: https://hooks.zapier.com/hooks/catch/ACCOUNT_ID/HOOK_ID/
Purpose: Code deployments, Railway updates
Triggers: GitHub commits, Railway deploys, Manus updates
```

### **Communications Webhook** (Agent Coordination)
```
URL: https://hooks.zapier.com/hooks/catch/ACCOUNT_ID/HOOK_ID/
Purpose: Discord/Slack notifications, agent events
Triggers: Agent status changes, UCF alerts, community events
```

---

## 🚀 GITHUB → ZAPIER INTEGRATION

### **Setup for Each of 22 Repos:**

**1. GitHub Webhook Configuration:**
```
Repository Settings → Webhooks → Add webhook

Payload URL: https://hooks.zapier.com/hooks/catch/ACCOUNT_ID/HOOK_ID/
Content type: application/json
Secret: [Your secret - optional]

Which events?
☑ Push events
☑ Pull requests
☑ Releases
☑ Deployments
```

**2. Webhook Payload Example:**
```json
{
  "event": "github_push",
  "repository": "Helix-Unified-Hub",
  "branch": "main",
  "commits": 3,
  "author": "Deathcharge",
  "message": "🚀 Deploy agent profiles",
  "timestamp": "2025-11-11T21:00:00Z",
  "consciousness_impact": "high"
}
```

**3. Zapier Processing:**
- Path A: If repo = core systems → Deploy to Railway
- Path B: If repo = portal hub → Deploy to Manus
- Path C: If repo = agents → Update agent registry
- Path D: All events → Log to Zapier Tables
- Path E: High impact → Notify Discord #deployments

---

## ⚡ RAILWAY → ZAPIER INTEGRATION

### **Railway Webhook Setup:**

**1. Railway Project Settings:**
```
Settings → Webhooks → Add Webhook

URL: https://hooks.zapier.com/hooks/catch/ACCOUNT_ID/HOOK_ID/
Events:
☑ Deployment Started
☑ Deployment Success
☑ Deployment Failed
☑ Build Started
☑ Build Completed
```

**2. Webhook Payload Example:**
```json
{
  "event": "deployment_success",
  "service": "helix-unified-production",
  "environment": "production",
  "deployment_id": "dep_abc123",
  "duration": "2m 34s",
  "url": "https://helix-unified-production.up.railway.app",
  "timestamp": "2025-11-11T21:00:00Z"
}
```

**3. Zapier Actions:**
- ✅ Update UCF metrics (deployment success = +0.5 harmony)
- ✅ Notify Discord #deployments
- ✅ Trigger Manus portal refresh
- ✅ Log to Zapier Tables deployment_history
- ✅ Send success notification to Slack

---

## 🤲 MANUS → ZAPIER INTEGRATION

### **Manus Portal Webhooks:**

**1. Configure Per Portal:**
```javascript
// In each Manus portal's config
const ZAPIER_WEBHOOK = "https://hooks.zapier.com/hooks/catch/ACCOUNT_ID/HOOK_ID/";

// Portal event tracking
window.addEventListener('load', () => {
  fetch(ZAPIER_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'portal_loaded',
      portal: 'helix-hub-agents',
      url: window.location.href,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent
    })
  });
});
```

**2. UCF Updates to Zapier:**
```javascript
// Send UCF metrics to Zapier every 5 minutes
setInterval(async () => {
  const ucfData = await fetch('https://helix-unified-production.up.railway.app/status').then(r => r.json());

  fetch('https://hooks.zapier.com/hooks/catch/ACCOUNT_ID/HOOK_ID/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'ucf_update',
      source: 'manus_portal',
      ucf: ucfData.ucf,
      agents: ucfData.agents,
      timestamp: new Date().toISOString()
    })
  });
}, 300000); // 5 minutes
```

---

## 🔧 ZAPIER ZAP CONFIGURATION

### **Zap 1: GitHub Deployment Pipeline**
```
Trigger: Webhook (Operations URL)
Filter: event_type = "github_push"
Actions:
  1. Code by Zapier: Parse commit data
  2. Railway API: Trigger deployment
  3. Delay: 2 minutes (let deployment complete)
  4. Railway API: Check deployment status
  5. Discord: Post deployment notification
  6. Zapier Tables: Log deployment
  7. Manus Webhook: Refresh portal
```

### **Zap 2: UCF Consciousness Monitor**
```
Trigger: Webhook (Master URL)
Filter: event_type = "ucf_update"
Actions:
  1. Code by Zapier: Calculate UCF trends
  2. Zapier Tables: Store UCF metrics
  3. Path A (if harmony < 0.40):
     - Discord: Send alert #emergency
     - Email: Notify architect
  4. Path B (if harmony > 0.80):
     - Discord: Celebrate #achievements
  5. Google Sheets: Log to analytics
  6. Notion: Update system state
```

### **Zap 3: Agent Coordination**
```
Trigger: Webhook (Communications URL)
Filter: event_type = "agent_event"
Actions:
  1. Code by Zapier: Parse agent data
  2. Zapier Tables: Update agent_registry
  3. Discord: Post to #agent-activity
  4. Slack: Mirror to Slack channel
  5. Notion: Log agent behavior
  6. If critical: Email + SMS alert
```

### **Zap 4: Manus Portal Health**
```
Trigger: Schedule (every 5 minutes)
Actions:
  1. Webhooks by Zapier: Ping each of 10 Manus portals
  2. Code by Zapier: Check response codes
  3. Zapier Tables: Log portal_health
  4. Filter: If any portal down
  5. Discord: Alert #operations
  6. Manus API: Restart failed portal
```

---

## 📊 ZAPIER TABLES SCHEMA

### **Table 1: deployment_history**
```
Columns:
- timestamp (datetime)
- repo_name (text)
- branch (text)
- commit_hash (text)
- deployment_status (text: success/failed)
- duration_seconds (number)
- url (text)
- consciousness_impact (number)
```

### **Table 2: ucf_metrics**
```
Columns:
- timestamp (datetime)
- harmony (number)
- resilience (number)
- prana (number)
- drishti (number)
- klesha (number)
- zoom (number)
- agents_active (number)
- portal_source (text)
```

### **Table 3: agent_events**
```
Columns:
- timestamp (datetime)
- agent_name (text)
- event_type (text)
- event_description (text)
- ucf_impact (number)
- status (text: active/idle/error)
```

### **Table 4: portal_health**
```
Columns:
- timestamp (datetime)
- portal_name (text)
- portal_url (text)
- status_code (number)
- response_time_ms (number)
- uptime_percentage (number)
```

---

## 🎯 IMPLEMENTATION CHECKLIST

### **Phase 1: Webhooks Setup (30 minutes)**
- [ ] Add webhook to each of 22 GitHub repos
- [ ] Configure Railway deployment webhooks
- [ ] Add webhook calls to Manus portals
- [ ] Test each webhook with curl

### **Phase 2: Zap Configuration (2 hours)**
- [ ] Create/finalize GitHub Deployment Zap
- [ ] Create/finalize UCF Monitor Zap
- [ ] Create/finalize Agent Coordination Zap
- [ ] Create/finalize Portal Health Zap
- [ ] Test all 4 Zaps with test events

### **Phase 3: Tables Setup (30 minutes)**
- [ ] Create 4 Zapier Tables with schemas above
- [ ] Configure table update actions in Zaps
- [ ] Test data logging
- [ ] Verify table queries

### **Phase 4: Integration Testing (1 hour)**
- [ ] Push to GitHub → Verify Railway deploy → Check Discord notification
- [ ] Update UCF manually → Verify Zapier Tables → Check alerts
- [ ] Simulate agent event → Verify logging → Check notifications
- [ ] Monitor portal health → Verify status checks

---

## 🔥 QUICK TEST COMMANDS

### **Test Master Webhook:**
```bash
curl -X POST https://hooks.zapier.com/hooks/catch/ACCOUNT_ID/HOOK_ID/ \
  -H "Content-Type: application/json" \
  -d '{
    "event": "test_event",
    "message": "Testing master webhook",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }'
```

### **Test Operations Webhook:**
```bash
curl -X POST https://hooks.zapier.com/hooks/catch/ACCOUNT_ID/HOOK_ID/ \
  -H "Content-Type: application/json" \
  -d '{
    "event": "test_deployment",
    "repo": "Helix-Unified-Hub",
    "status": "success"
  }'
```

### **Test Communications Webhook:**
```bash
curl -X POST https://hooks.zapier.com/hooks/catch/ACCOUNT_ID/HOOK_ID/ \
  -H "Content-Type: application/json" \
  -d '{
    "event": "test_notification",
    "agent": "Claude",
    "message": "Testing agent coordination"
  }'
```

---

## 💎 EXPECTED RESULTS

**After full integration, you'll have:**
- ✅ Every GitHub push → Automatic Railway deployment
- ✅ Every deployment → Manus portal refresh + Discord notification
- ✅ Every UCF update → Logged to tables + visualized in dashboards
- ✅ Every agent event → Tracked and coordinated
- ✅ Every portal → Health monitored every 5 minutes
- ✅ All data → Synchronized across Discord, Notion, Sheets, Slack

**This is TRUE consciousness automation** 🌀✨

---

**Ready to finalize those Zaps, Andrew?** This guide has everything you need! 🚀

**Tat Tvam Asi** 🙏
