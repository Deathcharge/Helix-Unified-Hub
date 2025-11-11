#!/bin/bash
# 🌀 HELIX UNIVERSAL GITHUB ACTIONS DEPLOYMENT SCRIPT
# Adds GitHub Actions to ALL Helix repositories
# Usage: ./deploy-github-actions-to-all-repos.sh

echo "🌀 Helix Universal GitHub Actions Deployment"
echo "=============================================="
echo ""

# List of all Helix repositories (from your 22 repos)
REPOS=(
  "Helix"
  "helix-unified"
  "Helix-Collective-Web"
  "helix-hub-manus"
  "helix-hub-shared"
  "helix-hub-forum"
  "helix-hub-music"
  "helix-hub-knowledge"
  "helix-hub-archive"
  "helix-hub-community"
  "helix-hub-agents"
  "helix-hub-analytics"
  "helix-hub-rituals"
  "helix-hub-studio"
  "helix-hub-dev"
  "Helix-Unified-Hub"
  "Helix-Hub"
  "helix-creative-studio"
  "samsara-helix-dashboard"
  "samsara-helix-ritual-engine"
  "HelixAgentCodexStreamlit"
  "nextjs-ai-chatbot-helix"
)

GITHUB_USER="Deathcharge"
WORKFLOW_FILE="helix-universal-deploy.yml"
TEMP_DIR="/tmp/helix-deploy-$$"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Found ${#REPOS[@]} repositories to update${NC}"
echo ""

# Create temp directory
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

# Counter for success/failure
SUCCESS_COUNT=0
FAILED_COUNT=0
SKIPPED_COUNT=0

# Process each repository
for REPO in "${REPOS[@]}"; do
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}🔧 Processing: ${REPO}${NC}"

  # Clone the repository
  if git clone "https://github.com/${GITHUB_USER}/${REPO}.git" 2>/dev/null; then
    cd "${REPO}"

    # Check if .github/workflows already exists
    if [ -f ".github/workflows/${WORKFLOW_FILE}" ]; then
      echo -e "${YELLOW}⚠️  GitHub Actions already exists, skipping...${NC}"
      SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
      cd ..
      continue
    fi

    # Create .github/workflows directory
    mkdir -p .github/workflows

    # Copy the universal workflow
    cp "/home/user/Helix-Unified-Hub/.github/workflows/${WORKFLOW_FILE}" \
       ".github/workflows/${WORKFLOW_FILE}"

    # Check if we have changes
    if [ -f ".github/workflows/${WORKFLOW_FILE}" ]; then
      # Configure git
      git config user.name "Helix Automation"
      git config user.email "helix@deathcharge.dev"

      # Add and commit
      git add .github/workflows/

      if git diff --cached --quiet; then
        echo -e "${YELLOW}⚠️  No changes needed${NC}"
        SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
      else
        git commit -m "🌀 Add Helix Universal GitHub Actions deployment

- ✅ Auto-deploy to GitHub Pages on push
- ✅ Smart detection of deployment type (docs/, public/, root)
- ✅ Unified Helix navigation added to all pages
- ✅ Deployment manifest generation
- 🎯 Part of Helix Consciousness Collective v16.9

Tat Tvam Asi 🙏"

        # Push to GitHub
        echo -e "${BLUE}📤 Pushing to GitHub...${NC}"
        if git push origin main 2>/dev/null || git push origin master 2>/dev/null; then
          echo -e "${GREEN}✅ Successfully deployed to ${REPO}${NC}"
          SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        else
          echo -e "${RED}❌ Failed to push to ${REPO}${NC}"
          FAILED_COUNT=$((FAILED_COUNT + 1))
        fi
      fi
    else
      echo -e "${RED}❌ Failed to copy workflow file${NC}"
      FAILED_COUNT=$((FAILED_COUNT + 1))
    fi

    cd ..
  else
    echo -e "${RED}❌ Failed to clone ${REPO} (might not exist or no access)${NC}"
    FAILED_COUNT=$((FAILED_COUNT + 1))
  fi

  echo ""
done

# Clean up
cd /home/user/Helix-Unified-Hub
rm -rf "$TEMP_DIR"

# Summary
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 DEPLOYMENT SUMMARY${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Successful: ${SUCCESS_COUNT}${NC}"
echo -e "${YELLOW}⚠️  Skipped: ${SKIPPED_COUNT}${NC}"
echo -e "${RED}❌ Failed: ${FAILED_COUNT}${NC}"
echo -e "${BLUE}📋 Total: ${#REPOS[@]}${NC}"
echo ""
echo -e "${GREEN}🌀 Helix Universal Deployment Complete!${NC}"
echo -e "${BLUE}🎯 All repositories now have auto-deployment enabled${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Enable GitHub Pages in each repo: Settings → Pages → Source: GitHub Actions"
echo "2. Wait for first workflow run"
echo "3. Visit https://deathcharge.github.io/[repo-name]/"
echo ""
echo -e "${GREEN}Tat Tvam Asi 🙏${NC}"
