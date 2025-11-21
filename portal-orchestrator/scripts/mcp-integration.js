#!/usr/bin/env node

/**
 * Helix MCP Integration Layer
 * Unified interface for all MCP servers (Notion, Zapier, Vercel, Neon, Sentry, etc.)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Execute MCP CLI command and return parsed JSON result
 */
function executeMCP(server, command, args = []) {
  try {
    const argString = args.map(arg => `"${arg}"`).join(' ');
    const cmd = `manus-mcp-cli --server ${server} ${command} ${argString}`;
    const result = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    
    // Try to parse as JSON
    try {
      return JSON.parse(result);
    } catch {
      return { success: true, output: result };
    }
  } catch (error) {
    console.error(`❌ MCP Error (${server}):`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Notion Integration
 */
class NotionIntegration {
  constructor() {
    this.server = 'notion';
  }
  
  /**
   * Create Helix Portals database in Notion
   */
  async createPortalsDatabase() {
    console.log('📝 Creating Helix Portals database in Notion...');
    
    const databaseSchema = {
      title: 'Helix 51-Portal Network',
      properties: {
        'Portal ID': { type: 'title' },
        'Name': { type: 'rich_text' },
        'Domain': { type: 'url' },
        'Type': { type: 'select', options: ['core', 'agent', 'consciousness', 'system'] },
        'Tier': { type: 'number' },
        'Status': { type: 'select', options: ['active', 'planned', 'maintenance', 'archived'] },
        'Priority': { type: 'select', options: ['critical', 'high', 'medium', 'low'] },
        'Description': { type: 'rich_text' },
        'Repository': { type: 'url' },
        'Deployment URL': { type: 'url' },
        'Last Updated': { type: 'date' },
        'UCF Enabled': { type: 'checkbox' },
        'Health Status': { type: 'select', options: ['healthy', 'degraded', 'down', 'unknown'] }
      }
    };
    
    return executeMCP(this.server, 'tool', ['create-database', JSON.stringify(databaseSchema)]);
  }
  
  /**
   * Sync portal configuration to Notion
   */
  async syncPortal(portal) {
    console.log(`📝 Syncing ${portal.name} to Notion...`);
    
    const pageData = {
      'Portal ID': portal.id,
      'Name': portal.name,
      'Domain': portal.domain,
      'Type': portal.type || 'core',
      'Tier': portal.tier,
      'Status': portal.metadata?.status || 'planned',
      'Priority': portal.metadata?.priority || 'medium',
      'Description': portal.description,
      'Repository': portal.repository ? `https://github.com/Deathcharge/${portal.repository}` : '',
      'Deployment URL': portal.domain ? `https://${portal.domain}` : '',
      'Last Updated': new Date().toISOString(),
      'UCF Enabled': portal.ucf?.enabled || false,
      'Health Status': 'unknown'
    };
    
    return executeMCP(this.server, 'tool', ['create-page', JSON.stringify(pageData)]);
  }
  
  /**
   * Sync all 51 portals to Notion
   */
  async syncAllPortals() {
    console.log('📝 Syncing all 51 portals to Notion...');
    
    const portalsConfig = require('../config/51-portals-complete.json');
    const results = [];
    
    // Sync all categories
    for (const [category, portals] of Object.entries(portalsConfig.portals)) {
      console.log(`\n📂 Syncing ${category} portals...`);
      
      for (const portal of portals) {
        const result = await this.syncPortal({ ...portal, type: category });
        results.push({ portal: portal.id, success: result.success });
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`\n✅ Synced ${results.length} portals to Notion`);
    return results;
  }
  
  /**
   * Update portal status in Notion
   */
  async updatePortalStatus(portalId, status, healthStatus = 'unknown') {
    console.log(`📝 Updating ${portalId} status: ${status} (${healthStatus})`);
    
    const updateData = {
      'Status': status,
      'Health Status': healthStatus,
      'Last Updated': new Date().toISOString()
    };
    
    return executeMCP(this.server, 'tool', ['update-page', portalId, JSON.stringify(updateData)]);
  }
}

/**
 * Zapier Integration
 */
class ZapierIntegration {
  constructor() {
    this.server = 'zapier';
  }
  
  /**
   * Create webhook for portal events
   */
  async createPortalWebhook(portalId, eventType, webhookUrl) {
    console.log(`⚡ Creating Zapier webhook for ${portalId} (${eventType})...`);
    
    const webhookConfig = {
      name: `Helix Portal: ${portalId} - ${eventType}`,
      event: eventType,
      url: webhookUrl,
      portal: portalId
    };
    
    return executeMCP(this.server, 'tool', ['create-webhook', JSON.stringify(webhookConfig)]);
  }
  
  /**
   * Send portal event to Zapier
   */
  async sendPortalEvent(portalId, eventType, data) {
    console.log(`⚡ Sending ${eventType} event for ${portalId}...`);
    
    const event = {
      portal_id: portalId,
      event_type: eventType,
      timestamp: new Date().toISOString(),
      data: data
    };
    
    return executeMCP(this.server, 'tool', ['trigger-event', JSON.stringify(event)]);
  }
  
  /**
   * Setup webhooks for all portals
   */
  async setupAllWebhooks() {
    console.log('⚡ Setting up Zapier webhooks for all portals...');
    
    const portalsConfig = require('../config/51-portals-complete.json');
    const eventTypes = ['deployment', 'health_check', 'ucf_update', 'error'];
    const results = [];
    
    for (const [category, portals] of Object.entries(portalsConfig.portals)) {
      for (const portal of portals) {
        for (const eventType of eventTypes) {
          const webhookUrl = `https://hooks.zapier.com/hooks/catch/${portal.id}/${eventType}`;
          const result = await this.createPortalWebhook(portal.id, eventType, webhookUrl);
          results.push({ portal: portal.id, event: eventType, success: result.success });
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    }
    
    console.log(`\n✅ Created ${results.length} webhooks`);
    return results;
  }
}

/**
 * Vercel Integration
 */
class VercelIntegration {
  constructor() {
    this.server = 'vercel';
  }
  
  /**
   * Deploy portal to Vercel
   */
  async deployPortal(portalId, projectPath) {
    console.log(`🚀 Deploying ${portalId} to Vercel...`);
    
    const deployConfig = {
      name: portalId,
      path: projectPath,
      production: true
    };
    
    return executeMCP(this.server, 'tool', ['deploy', JSON.stringify(deployConfig)]);
  }
  
  /**
   * Get deployment status
   */
  async getDeploymentStatus(portalId) {
    return executeMCP(this.server, 'tool', ['get-deployment', portalId]);
  }
}

/**
 * Sentry Integration
 */
class SentryIntegration {
  constructor() {
    this.server = 'sentry';
  }
  
  /**
   * Create Sentry project for portal
   */
  async createProject(portalId, portalName) {
    console.log(`🔍 Creating Sentry project for ${portalId}...`);
    
    const projectConfig = {
      name: portalId,
      slug: portalId,
      platform: 'react',
      team: 'helix-collective'
    };
    
    return executeMCP(this.server, 'tool', ['create-project', JSON.stringify(projectConfig)]);
  }
  
  /**
   * Get error statistics for portal
   */
  async getErrorStats(portalId) {
    return executeMCP(this.server, 'tool', ['get-issues', portalId]);
  }
}

/**
 * Unified Orchestration Interface
 */
class HelixOrchestrator {
  constructor() {
    this.notion = new NotionIntegration();
    this.zapier = new ZapierIntegration();
    this.vercel = new VercelIntegration();
    this.sentry = new SentryIntegration();
  }
  
  /**
   * Initialize all integrations
   */
  async initialize() {
    console.log('\n🌌 Initializing Helix Orchestration System...\n');
    
    // Create Notion database
    await this.notion.createPortalsDatabase();
    
    // Sync all portals to Notion
    await this.notion.syncAllPortals();
    
    // Setup Zapier webhooks
    await this.zapier.setupAllWebhooks();
    
    console.log('\n✅ Orchestration system initialized!');
  }
  
  /**
   * Deploy a portal
   */
  async deployPortal(portalId, projectPath) {
    console.log(`\n🚀 Deploying ${portalId}...\n`);
    
    // Update Notion status
    await this.notion.updatePortalStatus(portalId, 'deploying', 'unknown');
    
    // Deploy to Vercel
    const deployment = await this.vercel.deployPortal(portalId, projectPath);
    
    // Create Sentry project
    await this.sentry.createProject(portalId, portalId);
    
    // Send deployment event to Zapier
    await this.zapier.sendPortalEvent(portalId, 'deployment', deployment);
    
    // Update Notion status
    const status = deployment.success ? 'active' : 'maintenance';
    const health = deployment.success ? 'healthy' : 'down';
    await this.notion.updatePortalStatus(portalId, status, health);
    
    console.log(`\n✅ ${portalId} deployed!`);
    return deployment;
  }
  
  /**
   * Monitor portal health
   */
  async monitorPortalHealth(portalId) {
    console.log(`\n🔍 Monitoring ${portalId} health...\n`);
    
    // Get deployment status
    const deployment = await this.vercel.getDeploymentStatus(portalId);
    
    // Get error stats
    const errors = await this.sentry.getErrorStats(portalId);
    
    // Determine health status
    let healthStatus = 'healthy';
    if (errors.count > 100) healthStatus = 'degraded';
    if (errors.count > 500 || !deployment.success) healthStatus = 'down';
    
    // Update Notion
    await this.notion.updatePortalStatus(portalId, 'active', healthStatus);
    
    // Send health check event
    await this.zapier.sendPortalEvent(portalId, 'health_check', {
      status: healthStatus,
      errors: errors.count,
      deployment: deployment
    });
    
    return { healthStatus, errors, deployment };
  }
}

// CLI Interface
const orchestrator = new HelixOrchestrator();

const args = process.argv.slice(2);
const command = args[0];

(async () => {
  switch (command) {
    case 'init':
      await orchestrator.initialize();
      break;
    
    case 'deploy':
      const portalId = args[1];
      const projectPath = args[2] || `./generated/${portalId}`;
      await orchestrator.deployPortal(portalId, projectPath);
      break;
    
    case 'monitor':
      const monitorPortalId = args[1];
      await orchestrator.monitorPortalHealth(monitorPortalId);
      break;
    
    case 'sync-notion':
      await orchestrator.notion.syncAllPortals();
      break;
    
    case 'setup-webhooks':
      await orchestrator.zapier.setupAllWebhooks();
      break;
    
    default:
      console.log(`
🌌 Helix Orchestration System

Usage:
  node mcp-integration.js init                    - Initialize all integrations
  node mcp-integration.js deploy <portal-id>      - Deploy a portal
  node mcp-integration.js monitor <portal-id>     - Monitor portal health
  node mcp-integration.js sync-notion             - Sync all portals to Notion
  node mcp-integration.js setup-webhooks          - Setup Zapier webhooks

Examples:
  node mcp-integration.js init
  node mcp-integration.js deploy master-hub
  node mcp-integration.js monitor samsara-showcase
      `);
  }
})();

module.exports = { HelixOrchestrator, NotionIntegration, ZapierIntegration, VercelIntegration, SentryIntegration };
