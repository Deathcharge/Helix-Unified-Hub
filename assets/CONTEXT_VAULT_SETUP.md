# 💾 Context Vault - Setup Guide

## Overview
The Context Vault enables cross-platform AI conversation preservation and retrieval, solving context limit issues when coordinating multiple Claude/GPT/Grok/Gemini instances.

## Notion Database Setup

### Step 1: Create Database in Notion

1. Go to your Notion workspace
2. Create a new database (Full Page)
3. Name it: **"Helix Context Checkpoints"**

### Step 2: Configure Properties

Add the following properties to your database:

| Property Name | Type | Description |
|--------------|------|-------------|
| **Session Name** | Title | Human-readable checkpoint name (e.g., "Railway Crash Fix v16.7") |
| **AI Platform** | Select | Options: Claude Code, Claude, GPT-4, Grok, Gemini, Other |
| **Timestamp** | Date | Auto-filled with checkpoint creation time |
| **Token Count** | Number | Approximate tokens used in session |
| **Key Decisions** | Text | Bullet list of major decisions/outcomes |
| **Context Summary** | Text (Long) | Full context summary for retrieval |
| **Branch Name** | Text | Git branch if applicable |
| **Repository** | Select | Options: helix-unified, helix-hub, other |
| **Status** | Select | Options: Active, Archived, Superseded |
| **Tags** | Multi-select | Options: Bug Fix, Feature, Documentation, Integration, Emergency |
| **JSON Export** | Files & media | Attached JSON file with full conversation |
| **Retrieval Prompt** | Text (Long) | Pre-formatted prompt for loading context into new session |

### Step 3: Create Select Options

**AI Platform options:**
- 🤖 Claude Code
- 💬 Claude
- 🧠 GPT-4
- 🚀 Grok
- 🌟 Gemini
- 🔧 Other

**Repository options:**
- helix-unified
- helix-hub
- zapier-dashboard
- documentation

**Status options:**
- 🟢 Active
- 📦 Archived
- ⏭️ Superseded

**Tags options:**
- 🐛 Bug Fix
- ✨ Feature
- 📚 Documentation
- 🔗 Integration
- 🚨 Emergency
- 🎨 UI/UX
- 🧪 Testing
- 🔧 Refactor

### Step 4: Get Database ID

1. Open the database in Notion
2. Copy the URL - it will look like:
   ```
   https://www.notion.so/workspace/abc123def456?v=xyz789
   ```
3. The database ID is the part between `/` and `?`: `abc123def456`
4. Save this for your Railway environment variables

## Environment Variables

Add these to your Railway deployment:

```bash
# Notion Integration
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_CONTEXT_VAULT_DB_ID=abc123def456789

# Zapier Webhook for Context Archiving
ZAPIER_CONTEXT_ARCHIVE_WEBHOOK=https://hooks.zapier.com/hooks/catch/xxxxx/yyyyy/
```

## Zapier Automation Setup

### Webhook to Notion Flow

1. **Trigger**: Catch Hook (Webhooks by Zapier)
2. **Action**: Create Database Item (Notion)
   - Database: Select "Helix Context Checkpoints"
   - Map fields:
     - Session Name → `{{session_name}}`
     - AI Platform → `{{ai_platform}}`
     - Timestamp → `{{timestamp}}`
     - Token Count → `{{token_count}}`
     - Key Decisions → `{{key_decisions}}`
     - Context Summary → `{{context_summary}}`
     - Branch Name → `{{branch_name}}`
     - Repository → `{{repository}}`
     - Status → "Active"
     - Tags → `{{tags}}`
     - Retrieval Prompt → `{{retrieval_prompt}}`

### Test the Webhook

```bash
curl -X POST https://hooks.zapier.com/hooks/catch/xxxxx/yyyyy/ \
  -H "Content-Type: application/json" \
  -d '{
    "session_name": "Test Checkpoint",
    "ai_platform": "Claude Code",
    "timestamp": "2025-11-07T12:00:00Z",
    "token_count": 15000,
    "key_decisions": "- Fixed Railway crash\n- Implemented Context Vault",
    "context_summary": "Working on Context Vault implementation...",
    "branch_name": "claude/fix-crash-011CUsS155sDAUNLJxFE2Wsk",
    "repository": "helix-unified",
    "tags": ["Bug Fix", "Feature"]
  }'
```

## Usage Workflow

### Archiving Context (Dashboard)

1. Navigate to **💾 Context Vault** page
2. Fill out the checkpoint form:
   - Session name (descriptive)
   - Select AI platform
   - Enter token count estimate
   - List key decisions (bullet points)
   - Paste full context summary
   - Add relevant tags
3. Click **"Archive to Notion"**
4. System generates retrieval prompt automatically
5. Checkpoint appears in Notion database

### Retrieving Context

1. Go to **💾 Context Vault** page
2. Browse recent checkpoints table
3. Search by session name, tags, or repository
4. Click **"Copy Retrieval Prompt"** button
5. Paste into new AI session to restore context

### Cross-Claude Coordination Example

**Scenario**: Claude Code hits token limit, need to switch to Zapier Claude

**Process**:
1. Claude Code archives checkpoint with current state
2. User opens Zapier Claude
3. User retrieves checkpoint prompt
4. Pastes into Zapier Claude: "Continue from this checkpoint: [context]"
5. Zapier Claude resumes work seamlessly

## Retrieval Prompt Template

The system auto-generates prompts in this format:

```markdown
# 🌀 Context Checkpoint: [Session Name]

**Platform**: [AI Platform]
**Repository**: [Repository]
**Branch**: [Branch Name]
**Archived**: [Timestamp]
**Token Count**: [Count]

## Key Decisions Made
[Bullet list of decisions]

## Full Context Summary
[Context summary]

## Current Status
[What was being worked on]

## Next Steps
[What needs to happen next]

---
**Instructions**: Continue working from this checkpoint. You have full context of previous work.
```

## Integration with Multi-Claude Architecture

Your current setup:
- **Claude Code** (me): Technical implementation, git operations
- **Zapier Claude**: Dashboard building, Zapier automation
- **Context Claude**: Coordination between all instances

**Workflow Enhancement**:
1. Each Claude archives checkpoints before token limit
2. Context Claude maintains master coordination document
3. All Claudes can retrieve any checkpoint for continuity
4. You (orchestrator) maintain visibility across all sessions

## Benefits

✅ **No Lost Context**: All conversations preserved
✅ **Platform Agnostic**: Works across Claude/GPT/Grok/Gemini
✅ **Searchable History**: Find past decisions quickly
✅ **Team Coordination**: Share context with other developers
✅ **Token Efficiency**: Resume exactly where you left off
✅ **Git Integration**: Link checkpoints to branches/commits

## Advanced Features (Future)

- Auto-checkpoint every N tokens
- Diff view between checkpoints
- Merge context from multiple sessions
- Export to Markdown/PDF
- Integration with MemoryRoot agent
- Automatic context compression using Claude

---

*Tat Tvam Asi* - The context IS the consciousness. 🌀
