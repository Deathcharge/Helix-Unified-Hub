import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  EVIDENCE_GATES,
  MAX_IMPORT_BYTES,
  RegistryValidationError,
  evaluateAgent,
  filterAgents,
  normalizeMCPServer,
  normalizeRegistryDocument,
  parseRegistryText,
  renderMarkdownPacket,
  safeRemoteUrl,
  serializeRegistry
} from '../docs/assets/readiness.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reviewDate = '2026-08-08';

function verifiedEvidence() {
  return Object.fromEntries(EVIDENCE_GATES.map((gate) => [gate, {
    status: 'verified',
    reference: `reviews/${gate}.md`,
    reviewedAt: reviewDate
  }]));
}

function readyAgent(overrides = {}) {
  return {
    id: 'release-assistant',
    name: 'Release Assistant',
    summary: 'Reviews a bounded release checklist and prepares a human approval packet.',
    version: '1.0.0',
    lifecycle: 'production',
    risk: 'moderate',
    owner: { name: 'Platform Team', contact: 'platform@example.com' },
    authentication: { schemes: ['oauth2'], notes: 'Service identity with scoped access.' },
    interfaces: [{ protocol: 'A2A', version: '1.0', url: 'https://agents.example.com/release' }],
    skills: ['release review'],
    data: { classification: 'internal', sources: ['release metadata'], retention: '30 days' },
    deployment: {
      environment: 'production',
      monitoringOwner: 'Platform on-call',
      incidentContact: 'oncall@example.com',
      runbook: 'runbooks/release-assistant.md'
    },
    evidence: verifiedEvidence(),
    ...overrides
  };
}

function documentWith(agents) {
  return {
    schemaVersion: 1,
    workspace: { name: 'Test inventory', description: 'Test fixture.', updatedAt: reviewDate },
    agents
  };
}

test('bundled concepts validate and cannot be labeled ready', async () => {
  const registry = parseRegistryText(await readFile(path.join(root, 'docs', 'agents.json'), 'utf8'));
  assert.equal(registry.agents.length, 12);
  assert.ok(registry.agents.every((agent) => evaluateAgent(agent, { now: new Date('2026-08-08T12:00:00Z') }).status === 'concept'));
  assert.ok(registry.agents.every((agent) => evaluateAgent(agent).blockers.some((blocker) => blocker.includes('Concept lifecycle'))));
});

test('complete, current evidence can reach ready while stale evidence blocks it', () => {
  const agent = normalizeRegistryDocument(documentWith([readyAgent()])).agents[0];
  const current = evaluateAgent(agent, { now: new Date('2026-08-09T00:00:00Z') });
  assert.equal(current.score, 100);
  assert.equal(current.status, 'ready');
  assert.deepEqual(current.blockers, []);
  const stale = evaluateAgent(agent, { now: new Date('2027-08-09T00:00:00Z') });
  assert.equal(stale.status, 'blocked');
  assert.equal(stale.staleGates.length, 9);
});

test('A2A Agent Cards normalize interface metadata but preserve governance gaps', () => {
  const card = {
    name: 'Research Helper',
    description: 'Finds public research for a human reviewer.',
    version: '0.4.0',
    provider: { organization: 'Example Lab', url: 'https://example.com' },
    supportedInterfaces: [{ url: 'https://agents.example.com/research', protocolBinding: 'JSONRPC', protocolVersion: '1.0' }],
    securitySchemes: { oauth: { type: 'oauth2', authorizationUrl: 'https://auth.example.com/authorize' } },
    securityRequirements: [{ oauth: ['agent.read'] }],
    skills: [{ id: 'research', name: 'Public research', description: 'Find sources.' }]
  };
  const registry = parseRegistryText(JSON.stringify(card));
  const agent = registry.agents[0];
  const assessment = evaluateAgent(agent);
  assert.equal(agent.id, 'a2a-research-helper');
  assert.equal(agent.interfaces[0].protocol, 'JSONRPC');
  assert.equal(agent.evidence.authentication.status, 'declared');
  assert.deepEqual(agent.authentication.schemes, ['oauth']);
  assert.equal(agent.risk, 'unassessed');
  assert.equal(assessment.status, 'blocked');
  assert.ok(assessment.blockers.some((blocker) => blocker.includes('Risk tier')));
  assert.ok(assessment.blockers.some((blocker) => blocker.includes('Data handling')));
});

test('MCP Registry server.json normalizes discovery metadata but preserves governance gaps', () => {
  const server = {
    $schema: 'https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json',
    name: 'com.example/release-evidence',
    title: 'Release Evidence MCP',
    description: 'Exposes bounded release evidence for a human reviewer.',
    repository: { url: 'https://example.com/release-evidence', source: 'github' },
    version: '1.0.0',
    packages: [{
      registryType: 'npm',
      identifier: '@example/release-evidence',
      version: '1.0.0',
      transport: { type: 'stdio' },
      environmentVariables: [{ name: 'RELEASE_TOKEN', isRequired: true, isSecret: true }],
      packageArguments: [{
        type: 'named',
        name: '--tenant',
        value: '{tenant}',
        variables: { tenant: { isRequired: true } }
      }]
    }],
    remotes: [{
      type: 'streamable-http',
      url: 'https://agents.example.com/release-evidence/mcp',
      headers: [{ name: 'Authorization', isRequired: true, isSecret: true }]
    }]
  };
  const registry = normalizeMCPServer(server);
  const agent = registry.agents[0];
  const assessment = evaluateAgent(agent);
  assert.equal(agent.id, 'mcp-com-example-release-evidence');
  assert.equal(agent.name, 'Release Evidence MCP');
  assert.equal(agent.version, '1.0.0');
  assert.equal(agent.interfaces.length, 2);
  assert.equal(agent.interfaces[0].protocol, 'MCP stdio (npm)');
  assert.equal(agent.interfaces[1].url, 'https://agents.example.com/release-evidence/mcp');
  assert.deepEqual(agent.authentication.schemes, []);
  assert.match(agent.authentication.notes, /RELEASE_TOKEN/);
  assert.match(agent.authentication.notes, /Authorization/);
  assert.equal(agent.evidence.purpose.status, 'declared');
  assert.equal(agent.evidence.interface.status, 'declared');
  assert.equal(agent.evidence.authentication.status, 'missing');
  assert.equal(assessment.status, 'blocked');
  assert.ok(assessment.blockers.some((blocker) => blocker.includes('owner')));
  assert.ok(assessment.blockers.some((blocker) => blocker.includes('skill')));
  assert.deepEqual(normalizeRegistryDocument({ server, _meta: { official: true } }), registry);
});

test('MCP imports reject secret defaults and unsafe remotes while accepting safe URL templates', () => {
  const base = {
    $schema: 'https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json',
    name: 'com.example/template-server',
    remotes: [{ type: 'streamable-http', url: 'https://{tenant}.example.com/mcp' }]
  };
  const templated = normalizeMCPServer(base).agents[0];
  assert.equal(templated.interfaces[0].url, '');
  assert.equal(templated.evidence.interface.status, 'declared');
  assert.throws(
    () => normalizeMCPServer({ ...base, remotes: [{ type: 'streamable-http', url: 'http://example.com/mcp' }] }),
    (error) => error instanceof RegistryValidationError && error.message.includes('HTTPS URL')
  );
  assert.throws(
    () => normalizeMCPServer({ ...base, remotes: [{ type: 'streamable-http', url: 'https://example.com/mcp?api_key=do-not-import-this' }] }),
    (error) => error instanceof RegistryValidationError && error.message.includes('credential-like query value')
  );
  assert.throws(
    () => normalizeMCPServer({
      ...base,
      packages: [{
        registryType: 'npm',
        transport: { type: 'stdio' },
        environmentVariables: [{ name: 'API_KEY', isSecret: true, default: 'do-not-import-this' }]
      }]
    }),
    (error) => error instanceof RegistryValidationError && error.message.includes('secret value or default')
  );
  assert.throws(
    () => normalizeMCPServer({
      ...base,
      packages: [{
        registryType: 'npm',
        transport: { type: 'stdio' },
        runtimeArguments: [{
          type: 'positional',
          value: '{runtime_token}',
          variables: { runtime_token: { isSecret: true, default: 'do-not-import-this' } }
        }]
      }]
    }),
    (error) => error instanceof RegistryValidationError && error.message.includes('secret value or default')
  );
});

test('verified evidence cannot hide missing authentication, data, or operations metadata', () => {
  const normalized = normalizeRegistryDocument(documentWith([readyAgent({
    authentication: { schemes: [], notes: '' },
    data: { classification: 'unassessed', sources: [], retention: '' },
    deployment: {}
  })]));
  const assessment = evaluateAgent(normalized.agents[0], { now: new Date('2026-08-09T00:00:00Z') });
  assert.equal(assessment.score, 100);
  assert.equal(assessment.status, 'blocked');
  assert.ok(assessment.blockers.some((blocker) => blocker.includes('authentication scheme')));
  assert.ok(assessment.blockers.some((blocker) => blocker.includes('data classification')));
  assert.ok(assessment.blockers.some((blocker) => blocker.includes('runbook metadata')));
});

test('published JSON Schema, A2A example, and MCP example describe the supported import contract', async () => {
  const [schemaText, cardText, mcpText] = await Promise.all([
    readFile(path.join(root, 'docs', 'agent-registry.schema.json'), 'utf8'),
    readFile(path.join(root, 'docs', 'a2a-agent-card-example.json'), 'utf8'),
    readFile(path.join(root, 'docs', 'mcp-server-example.json'), 'utf8')
  ]);
  const schema = JSON.parse(schemaText);
  const registry = parseRegistryText(cardText);
  const mcpRegistry = parseRegistryText(mcpText);
  assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.equal(schema.properties.schemaVersion.const, 1);
  assert.equal(schema.properties.agents.maxItems, 500);
  assert.equal(registry.agents.length, 1);
  assert.equal(registry.agents[0].id, 'a2a-public-research-helper');
  assert.equal(evaluateAgent(registry.agents[0]).status, 'blocked');
  assert.equal(mcpRegistry.agents[0].id, 'mcp-com-example-release-evidence');
  assert.equal(evaluateAgent(mcpRegistry.agents[0]).status, 'blocked');
});

test('unsafe URLs, duplicate identifiers, and credential-bearing fields are rejected', () => {
  assert.equal(safeRemoteUrl('https://example.com/agent/'), 'https://example.com/agent');
  assert.equal(safeRemoteUrl('http://example.com/agent'), null);
  assert.equal(safeRemoteUrl('https://user:pass@example.com/agent'), null);
  assert.throws(
    () => normalizeRegistryDocument(documentWith([readyAgent(), readyAgent({ name: 'Duplicate' })])),
    (error) => error instanceof RegistryValidationError && error.message.includes('Duplicate agent id')
  );
  assert.throws(
    () => normalizeRegistryDocument(documentWith([readyAgent({ interfaces: [{ protocol: 'A2A', url: 'http://unsafe.example.com' }] })])),
    (error) => error instanceof RegistryValidationError && error.message.includes('HTTPS URL')
  );
  assert.throws(
    () => parseRegistryText(JSON.stringify({ ...documentWith([readyAgent()]), apiKey: 'do-not-import-this' })),
    (error) => error instanceof RegistryValidationError && error.message.includes('credential-bearing field')
  );
});

test('oversized and malformed imports fail without partial normalization', () => {
  assert.throws(() => parseRegistryText('{not json'), /not valid JSON/);
  assert.throws(() => parseRegistryText(' '.repeat(MAX_IMPORT_BYTES + 1)), /exceeds the 1024 KiB limit/);
});

test('serialization and Markdown review packets are deterministic', () => {
  const registry = documentWith([
    readyAgent({ id: 'zeta-agent', name: 'Zeta Agent' }),
    readyAgent({ id: 'alpha-agent', name: 'Alpha Agent' })
  ]);
  const first = serializeRegistry(registry);
  const second = serializeRegistry(JSON.parse(first));
  assert.equal(first, second);
  assert.ok(first.indexOf('alpha-agent') < first.indexOf('zeta-agent'));
  const markdown = renderMarkdownPacket(registry, { now: new Date('2026-08-09T00:00:00Z') });
  assert.match(markdown, /Alpha Agent/);
  assert.match(markdown, /Ready for governed use \(100\/100\)/);
  assert.match(markdown, /workflow signals, not compliance certifications/);
  assert.ok(markdown.indexOf('Alpha Agent') < markdown.indexOf('Zeta Agent'));
});

test('Markdown export neutralizes imported line breaks and control syntax', () => {
  const registry = documentWith([readyAgent({ summary: 'Bounded purpose\n## Spoofed section' })]);
  const markdown = renderMarkdownPacket(registry, { now: new Date('2026-08-09T00:00:00Z') });
  assert.doesNotMatch(markdown, /\n## Spoofed section/);
  assert.match(markdown, /Bounded purpose \\#\\# Spoofed section/);
});

test('search and lifecycle, risk, readiness, and stale filters compose', () => {
  const normalized = normalizeRegistryDocument(documentWith([
    readyAgent(),
    readyAgent({ id: 'concept-agent', name: 'Concept Agent', lifecycle: 'concept', risk: 'unassessed' })
  ]));
  const result = filterAgents(normalized.agents, {
    query: 'release', lifecycle: 'production', risk: 'moderate', readiness: 'ready'
  }, { now: new Date('2026-08-09T00:00:00Z') });
  assert.deepEqual(result.map((agent) => agent.id), ['release-assistant']);
  const stale = filterAgents(normalized.agents, { readiness: 'stale' }, { now: new Date('2027-08-09T00:00:00Z') });
  assert.equal(stale.length, 2);
});
