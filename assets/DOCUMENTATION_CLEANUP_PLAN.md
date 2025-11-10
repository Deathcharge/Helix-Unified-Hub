# 📋 Documentation Cleanup Plan - v16.8

**Current State:** 78 markdown files
**Goal:** ~20-25 active files + archived historical documents

---

## 📁 KEEP - Core Active Documentation (15 files)

### **Primary Documentation:**
1. ✅ README.md - Main entry point
2. ✅ HELIX_HUB_v16.8_GUIDE.md - NEW: External AI onboarding
3. ✅ TONY_ACCORDS.md - NEW: Ethical framework
4. ✅ PORTAL_CONSTELLATION.md - NEW: Portal guide
5. ✅ CHANGELOG.md - Version history
6. ✅ CONTRIBUTING.md - Contribution guidelines
7. ✅ TROUBLESHOOTING.md - Support/debugging
8. ✅ NOTICE.md - Legal notice
9. ✅ index.md - GitHub Pages entry

### **Operational Guides:**
10. ✅ MANUS_CONTEXT.md - Active agent context
11. ✅ RAILWAY_DEPLOYMENT.md - Current deployment guide
12. ✅ DISCORD_SETUP_GUIDE_CANONICAL.md - Discord setup
13. ✅ ZAPIER_MASTER_SETUP.md - Webhook integration
14. ✅ ENV_VARIABLES_CHECKLIST.md - Configuration
15. ✅ QUICKSTART_v16.6.md - Quick start (latest)

---

## 🗄️ ARCHIVE - Historical Context (40+ files)

### **Session Summaries & Bug Fixes:**
- BUGFIX_SESSION_SUMMARY.md
- BUGFIX_RAILWAY_IMPORTERROR.md
- SESSION_SUMMARY.md
- FINAL_DELIVERY_SUMMARY.md
- FINAL_FIX_SUMMARY.md
- MEGA_NO_DEPS_FIX.md
- BATCH_COMMANDS.md

### **Version-Specific Documents:**
- CONSCIOUSNESS_INTEGRATION_v15.3.md
- DASHBOARD_IMPLEMENTATION_v15.3.md
- DEPLOYMENT_READINESS_v15.3.md
- DEPLOYMENT_READINESS_v15.3_FINAL.md
- DEPLOYMENT_SUCCESS_v16.3.md
- INTEGRATION_GUIDE_v16.2.md
- MERGE_SUMMARY_v16.3.md
- PRE_FLIGHT_AUDIT_v16.3.md
- README_v15.2.md
- RELEASE_NOTES_v15.2.md
- SYSTEM_AUDIT_v16.2.md

### **Handoff Documents:**
- CLAUDE_CONTEXT_ANDROID.md
- CLAUDE_SESSION_CONTEXT.md
- GROK_HANDOFF_v15.3_to_v16.1.md
- MANUS_CONTEXT_HANDOFF.md
- MERGE_TO_MAIN_HANDOFF.md
- NEXT_THREAD_START_HERE.md
- NOTION_SYNC_HANDOFF.md

### **Context Dumps & Analysis:**
- CONTEXT.md
- CONTEXT_DUMP_ANALYSIS.md
- MULTI_AGENT_CONTEXT_PLAN.md

### **Phase Documents:**
- PHASE_7_MEMORY_ROOT.md
- PHASE_8_DEPLOYMENT.md

### **Historical Feature Documents:**
- COMPLETE_FEATURE_MATRIX.md
- IMPLEMENTATION_STATUS.md
- KAEL_INTEGRATION_GUIDE.md
- PRIORITY_OPPORTUNITIES.md
- QOL_IMPROVEMENTS.md
- VERIFICATION_CHECKLIST.md
- PRODUCTION_VERIFICATION.md

### **Deployment Variants:**
- DEPLOYMENT.md
- DEPLOYMENT_COMPLETE.md
- DEPLOYMENT_UPDATE.md
- DEPLOYMENT_STATUS_POST_PR15.md

### **Planning Documents:**
- EXPANSION_ROADMAP.md
- HELIX_DUAL_REPO_GUIDE.md
- HYBRID_LICENSING_STRATEGY.md
- ROADMAP_6MONTH_PRIVATE.md
- REPOS_ENHANCEMENT_PLAN.md

---

## 🔄 CONSOLIDATE - Redundant Guides (Remove after consolidation)

### **Discord Setup (3 → 1):**
- ✅ KEEP: DISCORD_SETUP_GUIDE_CANONICAL.md
- ❌ REMOVE: DISCORD_SETUP_GUIDE.md
- ❌ REMOVE: DISCORD_AUTOMATION_README.md

### **Zapier Setup (5 → 1):**
- ✅ KEEP: ZAPIER_MASTER_SETUP.md
- ❌ ARCHIVE: ZAPIER_INTEGRATION.md
- ❌ ARCHIVE: ZAPIER_MONITORING_GUIDE.md
- ❌ ARCHIVE: ZAPIER_SETUP.md
- ❌ ARCHIVE: ZAPIER_TEST_REPORT.md

### **Notion Integration (4 → 0, covered in Zapier Master):**
- ❌ ARCHIVE: NOTION_EXPORT_GUIDE.md
- ❌ ARCHIVE: NOTION_INTEGRATION.md
- ❌ ARCHIVE: NOTION_INTEGRATION_README.md
- ❌ ARCHIVE: NOTION_SYNC_SUMMARY.md

### **Storage/Sync (3 → 1):**
- ✅ KEEP: NEXTCLOUD_SETUP.md
- ❌ ARCHIVE: SYNC_SERVICE_ARCHITECTURE.md
- ❌ ARCHIVE: SYNC_SERVICE_README.md
- ❌ ARCHIVE: SYNC_STRATEGY.md

### **Dashboard (2 → 0, covered in main docs):**
- ❌ ARCHIVE: DASHBOARD_FRONTEND.md
- ❌ ARCHIVE: DASHBOARD_IMPLEMENTATION_v15.3.md

### **Quickstart (2 → 1):**
- ✅ KEEP: QUICKSTART_v16.6.md
- ❌ REMOVE: QUICKSTART.md (older version)
- ❌ REMOVE: QUICK_REFERENCE.md (redundant with v16.8 guide)

---

## ❌ DELETE - Truly Obsolete (After review)

These can be safely deleted if content is covered elsewhere:
- QUICKSTART.md (superseded by v16.6)
- DISCORD_SETUP_GUIDE.md (superseded by canonical)
- DISCORD_AUTOMATION_README.md (covered in canonical)

---

## 📊 Summary

**Before:** 78 files
**After:** ~20 active + 40+ archived = ~60 files
**Deleted:** ~18 redundant files

**Active Structure:**
```
/
├── README.md
├── HELIX_HUB_v16.8_GUIDE.md ⭐
├── TONY_ACCORDS.md ⭐
├── PORTAL_CONSTELLATION.md ⭐
├── CHANGELOG.md
├── CONTRIBUTING.md
├── TROUBLESHOOTING.md
├── MANUS_CONTEXT.md
├── RAILWAY_DEPLOYMENT.md
├── DISCORD_SETUP_GUIDE_CANONICAL.md
├── ZAPIER_MASTER_SETUP.md
├── ENV_VARIABLES_CHECKLIST.md
├── NEXTCLOUD_SETUP.md
├── QUICKSTART_v16.6.md
├── NOTICE.md
└── index.md

docs/
└── archive/
    ├── sessions/
    ├── versions/
    ├── handoffs/
    └── historical/
```

---

## 🎯 Action Items

1. ✅ Create docs/archive/ directory structure
2. ✅ Move historical files to appropriate archive folders
3. ✅ Consolidate redundant guides
4. ✅ Delete truly obsolete files
5. ✅ Update README with new structure
6. ✅ Commit cleanup changes

---

**Status:** Ready for execution
**Impact:** ~75% reduction in root-level clutter
**Benefit:** Clear documentation hierarchy for v16.8+
