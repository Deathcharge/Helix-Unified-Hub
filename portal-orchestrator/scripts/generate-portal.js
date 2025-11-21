#!/usr/bin/env node

/**
 * Helix Portal Generator
 * Generates a complete portal from template based on configuration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load portal configurations
const portalsConfig = require('../config/51-portals-complete.json');

// Template variables
const TEMPLATE_VARS = {
  '{{PORTAL_ID}}': '',
  '{{PORTAL_NAME}}': '',
  '{{PORTAL_DOMAIN}}': '',
  '{{PORTAL_ICON}}': '',
  '{{PORTAL_DESCRIPTION}}': '',
  '{{BACKEND_URL}}': portalsConfig.backend.production,
  '{{WEBSOCKET_URL}}': portalsConfig.backend.websocket,
  '{{PORTAL_TIER}}': '',
  '{{PORTAL_TYPE}}': '',
};

/**
 * Generate a portal from configuration
 * @param {string} portalId - Portal identifier
 * @param {string} category - Portal category (core, agents, consciousness, system)
 */
function generatePortal(portalId, category = 'core') {
  console.log(`\n🌀 Generating portal: ${portalId} (${category})`);
  
  // Find portal config
  const portals = portalsConfig.portals[category];
  const portal = portals.find(p => p.id === portalId);
  
  if (!portal) {
    console.error(`❌ Portal "${portalId}" not found in category "${category}"`);
    process.exit(1);
  }
  
  console.log(`✅ Found configuration for ${portal.name}`);
  
  // Create output directory
  const outputDir = path.join(__dirname, '../generated', portal.id);
  if (fs.existsSync(outputDir)) {
    console.log(`⚠️  Portal directory already exists, cleaning...`);
    fs.rmSync(outputDir, { recursive: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });
  
  // Copy base template
  const templateDir = path.join(__dirname, '../templates/base-portal');
  console.log(`📋 Copying base template...`);
  copyDirectory(templateDir, outputDir);
  
  // Replace template variables
  const vars = {
    '{{PORTAL_ID}}': portal.id,
    '{{PORTAL_NAME}}': portal.name,
    '{{PORTAL_DOMAIN}}': portal.domain,
    '{{PORTAL_ICON}}': portal.icon,
    '{{PORTAL_DESCRIPTION}}': portal.description,
    '{{BACKEND_URL}}': portalsConfig.backend.production,
    '{{WEBSOCKET_URL}}': portalsConfig.backend.websocket,
    '{{PORTAL_TIER}}': portal.tier.toString(),
    '{{PORTAL_TYPE}}': category,
  };
  
  console.log(`🔧 Replacing template variables...`);
  replaceInDirectory(outputDir, vars);
  
  // Create portal-specific configuration
  const portalConfig = {
    ...portal,
    backend: portalsConfig.backend,
    generatedAt: new Date().toISOString(),
  };
  
  fs.writeFileSync(
    path.join(outputDir, 'portal.config.json'),
    JSON.stringify(portalConfig, null, 2)
  );
  
  console.log(`✅ Portal generated successfully at: ${outputDir}`);
  console.log(`\n📦 Next steps:`);
  console.log(`   cd ${outputDir}`);
  console.log(`   pnpm install`);
  console.log(`   pnpm dev`);
  console.log(`\n🚀 Deploy to Manus:`);
  console.log(`   # Use Manus UI to create new project from ${outputDir}`);
  
  return outputDir;
}

/**
 * Copy directory recursively
 */
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Replace template variables in all files
 */
function replaceInDirectory(dir, vars) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      replaceInDirectory(fullPath, vars);
    } else {
      // Only process text files
      if (isTextFile(entry.name)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        
        // Replace all variables
        for (const [key, value] of Object.entries(vars)) {
          content = content.replace(new RegExp(key, 'g'), value);
        }
        
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

/**
 * Check if file is a text file
 */
function isTextFile(filename) {
  const textExtensions = [
    '.js', '.ts', '.tsx', '.jsx', '.json', '.md', '.txt',
    '.css', '.scss', '.html', '.xml', '.yaml', '.yml',
    '.env', '.gitignore', '.npmrc', '.prettierrc'
  ];
  
  return textExtensions.some(ext => filename.endsWith(ext)) || !filename.includes('.');
}

/**
 * Generate all portals in a category
 */
function generateAllPortals(category) {
  console.log(`\n🌌 Generating all ${category} portals...`);
  
  const portals = portalsConfig.portals[category];
  if (!portals) {
    console.error(`❌ Category "${category}" not found`);
    process.exit(1);
  }
  
  const results = [];
  for (const portal of portals) {
    try {
      const outputDir = generatePortal(portal.id, category);
      results.push({ id: portal.id, status: 'success', path: outputDir });
    } catch (error) {
      console.error(`❌ Failed to generate ${portal.id}:`, error.message);
      results.push({ id: portal.id, status: 'failed', error: error.message });
    }
  }
  
  console.log(`\n📊 Generation Summary:`);
  console.log(`   Total: ${results.length}`);
  console.log(`   Success: ${results.filter(r => r.status === 'success').length}`);
  console.log(`   Failed: ${results.filter(r => r.status === 'failed').length}`);
  
  return results;
}

/**
 * Generate ALL 51 portals
 */
function generateAll51Portals() {
  console.log(`\n🚀 Generating ALL 51 portals...`);
  
  const categories = ['core', 'agents', 'consciousness', 'system'];
  const allResults = [];
  
  for (const category of categories) {
    const results = generateAllPortals(category);
    allResults.push(...results);
  }
  
  console.log(`\n🎉 Complete! Generated ${allResults.length} portals`);
  
  // Save generation report
  const report = {
    generatedAt: new Date().toISOString(),
    totalPortals: allResults.length,
    results: allResults,
  };
  
  fs.writeFileSync(
    path.join(__dirname, '../generated/generation-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log(`📄 Report saved to: generated/generation-report.json`);
}

// CLI interface
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
🌀 Helix Portal Generator

Usage:
  node generate-portal.js <portal-id> [category]
  node generate-portal.js --all-<category>
  node generate-portal.js --all

Examples:
  node generate-portal.js master-hub core
  node generate-portal.js super-ninja agents
  node generate-portal.js --all-core
  node generate-portal.js --all

Categories: core, agents, consciousness, system
  `);
  process.exit(0);
}

const command = args[0];

if (command === '--all') {
  generateAll51Portals();
} else if (command.startsWith('--all-')) {
  const category = command.replace('--all-', '');
  generateAllPortals(category);
} else {
  const portalId = args[0];
  const category = args[1] || 'core';
  generatePortal(portalId, category);
}
