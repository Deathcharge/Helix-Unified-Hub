export const REGISTRY_SCHEMA_VERSION = 1;
export const MAX_IMPORT_BYTES = 1024 * 1024;
export const MAX_AGENTS = 500;
export const EVIDENCE_GATES = Object.freeze([
  'purpose',
  'ownership',
  'interface',
  'authentication',
  'data',
  'evaluation',
  'security',
  'oversight',
  'operations'
]);

export const GATE_LABELS = Object.freeze({
  purpose: 'Purpose',
  ownership: 'Ownership',
  interface: 'Interface',
  authentication: 'Authentication',
  data: 'Data handling',
  evaluation: 'Evaluation',
  security: 'Security',
  oversight: 'Human oversight',
  operations: 'Operations'
});

const GATE_WEIGHTS = Object.freeze({
  purpose: 12,
  ownership: 12,
  interface: 11,
  authentication: 10,
  data: 12,
  evaluation: 12,
  security: 12,
  oversight: 10,
  operations: 9
});
const EVIDENCE_VALUE = Object.freeze({ missing: 0, declared: 0.5, verified: 1 });
const LIFECYCLES = new Set(['concept', 'development', 'review', 'production', 'paused', 'retired']);
const RISKS = new Set(['unassessed', 'low', 'moderate', 'high', 'critical']);
const DATA_CLASSIFICATIONS = new Set(['unassessed', 'public', 'internal', 'confidential', 'restricted']);
const EVIDENCE_STATUSES = new Set(Object.keys(EVIDENCE_VALUE));
const CREDENTIAL_KEYS = new Set([
  'apikey',
  'token',
  'accesstoken',
  'refreshtoken',
  'secret',
  'clientsecret',
  'password',
  'authorization',
  'cookie',
  'privatekey',
  'credential',
  'credentials'
]);

export class RegistryValidationError extends Error {
  constructor(issues) {
    super(issues.join(' '));
    this.name = 'RegistryValidationError';
    this.issues = issues;
  }
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizedKey(value) {
  return String(value).toLocaleLowerCase().replace(/[^a-z0-9]/g, '');
}

export function assertNoCredentialFields(value) {
  const pending = [{ value, path: '$' }];
  let visited = 0;
  while (pending.length) {
    const current = pending.pop();
    visited += 1;
    if (visited > 50_000) throw new RegistryValidationError(['The import is too structurally complex.']);
    if (Array.isArray(current.value)) {
      current.value.forEach((entry, index) => pending.push({ value: entry, path: `${current.path}[${index}]` }));
      continue;
    }
    if (!isObject(current.value)) continue;
    for (const [key, entry] of Object.entries(current.value)) {
      if (CREDENTIAL_KEYS.has(normalizedKey(key))) {
        throw new RegistryValidationError([
          `${current.path}.${key} looks like a credential-bearing field. Remove secrets and import only metadata.`
        ]);
      }
      pending.push({ value: entry, path: `${current.path}.${key}` });
    }
  }
}

function boundedString(value, label, issues, { max = 500, required = false } = {}) {
  if (value === undefined || value === null) value = '';
  if (typeof value !== 'string') {
    issues.push(`${label} must be text.`);
    return '';
  }
  const result = value.trim();
  if (required && !result) issues.push(`${label} is required.`);
  if (result.length > max) issues.push(`${label} must be ${max} characters or fewer.`);
  return result.slice(0, max);
}

function boundedArray(value, label, issues, max) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    issues.push(`${label} must be an array.`);
    return [];
  }
  if (value.length > max) issues.push(`${label} must contain ${max} items or fewer.`);
  return value.slice(0, max);
}

function enumValue(value, allowed, fallback, label, issues) {
  const result = boundedString(value, label, issues, { max: 40 }) || fallback;
  if (!allowed.has(result)) {
    issues.push(`${label} has unsupported value “${result}”.`);
    return fallback;
  }
  return result;
}

function validDate(value, label, issues) {
  const result = boundedString(value, label, issues, { max: 40 });
  if (!result) return '';
  if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z)?$/.test(result)
    || Number.isNaN(Date.parse(result))) {
    issues.push(`${label} must be an ISO date or UTC timestamp.`);
    return '';
  }
  return result;
}

export function safeRemoteUrl(value) {
  const candidate = String(value || '').trim();
  if (!candidate) return '';
  if (candidate.length > 2048 || /[\u0000-\u001f\\]/.test(candidate)) return null;
  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    return url.href.replace(/\/$/, '');
  } catch {
    return null;
  }
}

function normalizeInterfaces(value, label, issues) {
  return boundedArray(value, label, issues, 20).map((entry, index) => {
    const path = `${label}[${index}]`;
    if (!isObject(entry)) {
      issues.push(`${path} must be an object.`);
      return { protocol: '', version: '', url: '' };
    }
    const protocol = boundedString(entry.protocol || entry.protocolBinding, `${path}.protocol`, issues, { max: 80, required: true });
    const version = boundedString(entry.version || entry.protocolVersion, `${path}.version`, issues, { max: 80 });
    const rawUrl = boundedString(entry.url, `${path}.url`, issues, { max: 2048 });
    const url = safeRemoteUrl(rawUrl);
    if (rawUrl && !url) issues.push(`${path}.url must be an HTTPS URL without embedded credentials.`);
    return { protocol, version, url: url || '' };
  });
}

function normalizeSkills(value, label, issues) {
  return boundedArray(value, label, issues, 50).map((entry, index) => {
    if (typeof entry === 'string') return boundedString(entry, `${label}[${index}]`, issues, { max: 120, required: true });
    if (isObject(entry)) {
      return boundedString(entry.name || entry.id, `${label}[${index}].name`, issues, { max: 120, required: true });
    }
    issues.push(`${label}[${index}] must be text or an object with a name.`);
    return '';
  }).filter(Boolean);
}

function normalizeEvidence(value, label, issues) {
  const source = isObject(value) ? value : {};
  if (value !== undefined && !isObject(value)) issues.push(`${label} must be an object.`);
  const normalized = {};
  for (const gate of EVIDENCE_GATES) {
    const path = `${label}.${gate}`;
    const item = isObject(source[gate]) ? source[gate] : {};
    if (source[gate] !== undefined && !isObject(source[gate])) issues.push(`${path} must be an object.`);
    const status = enumValue(item.status, EVIDENCE_STATUSES, 'missing', `${path}.status`, issues);
    const reference = boundedString(item.reference, `${path}.reference`, issues, { max: 500 });
    const reviewedAt = validDate(item.reviewedAt, `${path}.reviewedAt`, issues);
    if (status === 'verified' && (!reference || !reviewedAt)) {
      issues.push(`${path} needs a reference and reviewedAt date when status is verified.`);
    }
    normalized[gate] = { status, reference, reviewedAt };
  }
  return normalized;
}

function normalizeAgent(value, index, issues) {
  const label = `agents[${index}]`;
  if (!isObject(value)) {
    issues.push(`${label} must be an object.`);
    value = {};
  }
  const id = boundedString(value.id, `${label}.id`, issues, { max: 64, required: true });
  if (id && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) issues.push(`${label}.id must be a lowercase kebab-case identifier.`);
  const owner = isObject(value.owner) ? value.owner : {};
  if (value.owner !== undefined && !isObject(value.owner)) issues.push(`${label}.owner must be an object.`);
  const authentication = isObject(value.authentication) ? value.authentication : {};
  if (value.authentication !== undefined && !isObject(value.authentication)) issues.push(`${label}.authentication must be an object.`);
  const data = isObject(value.data) ? value.data : {};
  if (value.data !== undefined && !isObject(value.data)) issues.push(`${label}.data must be an object.`);
  const deployment = isObject(value.deployment) ? value.deployment : {};
  if (value.deployment !== undefined && !isObject(value.deployment)) issues.push(`${label}.deployment must be an object.`);
  return {
    id,
    name: boundedString(value.name, `${label}.name`, issues, { max: 120, required: true }),
    summary: boundedString(value.summary || value.description, `${label}.summary`, issues, { max: 600, required: true }),
    version: boundedString(value.version, `${label}.version`, issues, { max: 80 }),
    lifecycle: enumValue(value.lifecycle, LIFECYCLES, 'concept', `${label}.lifecycle`, issues),
    risk: enumValue(value.risk, RISKS, 'unassessed', `${label}.risk`, issues),
    owner: {
      name: boundedString(owner.name, `${label}.owner.name`, issues, { max: 160 }),
      contact: boundedString(owner.contact, `${label}.owner.contact`, issues, { max: 254 })
    },
    authentication: {
      schemes: normalizeSkills(authentication.schemes, `${label}.authentication.schemes`, issues),
      notes: boundedString(authentication.notes, `${label}.authentication.notes`, issues, { max: 500 })
    },
    interfaces: normalizeInterfaces(value.interfaces, `${label}.interfaces`, issues),
    skills: normalizeSkills(value.skills, `${label}.skills`, issues),
    data: {
      classification: enumValue(data.classification, DATA_CLASSIFICATIONS, 'unassessed', `${label}.data.classification`, issues),
      sources: normalizeSkills(data.sources, `${label}.data.sources`, issues),
      retention: boundedString(data.retention, `${label}.data.retention`, issues, { max: 500 })
    },
    deployment: {
      environment: boundedString(deployment.environment, `${label}.deployment.environment`, issues, { max: 120 }),
      monitoringOwner: boundedString(deployment.monitoringOwner, `${label}.deployment.monitoringOwner`, issues, { max: 160 }),
      incidentContact: boundedString(deployment.incidentContact, `${label}.deployment.incidentContact`, issues, { max: 254 }),
      runbook: boundedString(deployment.runbook, `${label}.deployment.runbook`, issues, { max: 500 })
    },
    evidence: normalizeEvidence(value.evidence, `${label}.evidence`, issues)
  };
}

function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 52) || 'unnamed-agent';
}

function looksLikeA2ACard(value) {
  return isObject(value)
    && typeof value.name === 'string'
    && (Array.isArray(value.supportedInterfaces) || typeof value.url === 'string' || Array.isArray(value.skills));
}

function mcpServerFromDocument(value) {
  const candidate = isObject(value?.server) ? value.server : value;
  if (!isObject(candidate) || typeof candidate.name !== 'string') return null;
  const schema = typeof candidate.$schema === 'string' ? candidate.$schema : '';
  const hasDistribution = Array.isArray(candidate.packages) || Array.isArray(candidate.remotes);
  return hasDistribution && /\/server\.schema\.json$/.test(schema) ? candidate : null;
}

function normalizeMCPRemoteUrl(value, label, issues) {
  const candidate = boundedString(value, label, issues, { max: 2048, required: true });
  if (!candidate) return '';
  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    parsed = null;
  }
  if (parsed && [...parsed.searchParams].some(([name, queryValue]) => (
    credentialLikeInputName(name)
    && !/^\{[A-Za-z][A-Za-z0-9_]*\}$/.test(queryValue)
  ))) {
    issues.push(`${label} must not embed a credential-like query value.`);
  }
  if (candidate.includes('{') || candidate.includes('}')) {
    const concrete = candidate.replace(/\{[A-Za-z][A-Za-z0-9_]*\}/g, 'template-value');
    if (concrete.includes('{') || concrete.includes('}') || !safeRemoteUrl(concrete)) {
      issues.push(`${label} must be an HTTPS URL or a valid HTTPS variable template without embedded credentials.`);
    }
    return '';
  }
  const url = safeRemoteUrl(candidate);
  if (!url) issues.push(`${label} must be an HTTPS URL without embedded credentials.`);
  return url || '';
}

function hasDeclaredValue(value) {
  if (value === undefined || value === null) return false;
  if (typeof value !== 'string') return true;
  const candidate = value.trim();
  return Boolean(candidate) && !/^\{[A-Za-z][A-Za-z0-9_]*\}$/.test(candidate);
}

function credentialLikeInputName(value) {
  return /(?:^|[_-])(api[_-]?key|authorization|cookie|credential|password|private[_-]?key|secret|token)(?:$|[_-])/i
    .test(String(value || ''));
}

function normalizeMCPInputDescriptors(packages, remotes, issues) {
  const descriptors = [];
  let descriptorLimitReported = false;
  const addDescriptor = (descriptor) => {
    if (descriptors.length < 2000) {
      descriptors.push(descriptor);
    } else if (!descriptorLimitReported) {
      issues.push('MCP metadata must contain 2000 input descriptors or fewer.');
      descriptorLimitReported = true;
    }
  };
  const addArrayDescriptors = (value, label, kind, requireName = false) => {
    boundedArray(value, label, issues, 100).forEach((input, inputIndex) => addDescriptor({
      input,
      label: `${label}[${inputIndex}]`,
      kind,
      requireName
    }));
  };
  packages.forEach((entry, packageIndex) => {
    if (!isObject(entry)) return;
    addArrayDescriptors(
      entry.environmentVariables,
      `MCP packages[${packageIndex}].environmentVariables`,
      'environment variable',
      true
    );
    addArrayDescriptors(entry.packageArguments, `MCP packages[${packageIndex}].packageArguments`, 'package argument');
    addArrayDescriptors(entry.runtimeArguments, `MCP packages[${packageIndex}].runtimeArguments`, 'runtime argument');
  });
  remotes.forEach((entry, remoteIndex) => {
    if (!isObject(entry)) return;
    addArrayDescriptors(entry.headers, `MCP remotes[${remoteIndex}].headers`, 'HTTP header', true);
    if (entry.variables === undefined || entry.variables === null) return;
    if (!isObject(entry.variables)) {
      issues.push(`MCP remotes[${remoteIndex}].variables must be an object.`);
      return;
    }
    const variables = Object.entries(entry.variables);
    if (variables.length > 100) issues.push(`MCP remotes[${remoteIndex}].variables must contain 100 items or fewer.`);
    variables.slice(0, 100).forEach(([name, input]) => addDescriptor({
      input: isObject(input) ? { ...input, name } : input,
      label: `MCP remotes[${remoteIndex}].variables.${name}`,
      kind: 'URL variable',
      requireName: true
    }));
  });

  const secretInputs = [];
  for (let descriptorIndex = 0; descriptorIndex < descriptors.length; descriptorIndex += 1) {
    const { input, label, kind, requireName } = descriptors[descriptorIndex];
    if (!isObject(input)) {
      issues.push(`${label} must be an object.`);
      continue;
    }
    const name = boundedString(input.name, `${label}.name`, issues, { max: 120, required: requireName });
    const secret = input.isSecret === true || credentialLikeInputName(name);
    if (secret && (hasDeclaredValue(input.value) || hasDeclaredValue(input.default))) {
      issues.push(`${label} declares a secret value or default. Remove values and import metadata only.`);
    }
    if (secret) secretInputs.push(`${kind}: ${name || `input ${descriptorIndex + 1}`}`);
    if (input.variables === undefined || input.variables === null) continue;
    if (!isObject(input.variables)) {
      issues.push(`${label}.variables must be an object.`);
      continue;
    }
    const variables = Object.entries(input.variables);
    if (variables.length > 100) issues.push(`${label}.variables must contain 100 items or fewer.`);
    variables.slice(0, 100).forEach(([variableName, variable]) => addDescriptor({
      input: isObject(variable) ? { ...variable, name: variableName } : variable,
      label: `${label}.variables.${variableName}`,
      kind: `${kind} variable`,
      requireName: true
    }));
  }
  return [...new Set(secretInputs)].slice(0, 20);
}

export function normalizeMCPServer(server) {
  if (!isObject(server)) throw new RegistryValidationError(['MCP server.json must contain one JSON object.']);
  assertNoCredentialFields(server);
  const issues = [];
  const schema = boundedString(server.$schema, 'MCP $schema', issues, { max: 500, required: true });
  const schemaMatch = /^https:\/\/static\.modelcontextprotocol\.io\/schemas\/(\d{4}-\d{2}-\d{2})\/server\.schema\.json$/.exec(schema);
  if (!schemaMatch) issues.push('MCP $schema must identify an official dated server.schema.json over HTTPS.');
  const registryName = boundedString(server.name, 'MCP name', issues, { max: 160, required: true });
  const title = boundedString(server.title || registryName.split('/').at(-1), 'MCP title', issues, { max: 120, required: true });
  const packages = boundedArray(server.packages, 'MCP packages', issues, 20);
  const remotes = boundedArray(server.remotes, 'MCP remotes', issues, 20);
  if (!packages.length && !remotes.length) issues.push('MCP server.json needs at least one package or remote transport.');
  const secretInputs = normalizeMCPInputDescriptors(packages, remotes, issues);
  const interfaces = [];
  packages.forEach((entry, index) => {
    if (!isObject(entry)) {
      issues.push(`MCP packages[${index}] must be an object.`);
      return;
    }
    const registryType = boundedString(entry.registryType, `MCP packages[${index}].registryType`, issues, { max: 40, required: true });
    const transport = isObject(entry.transport) ? entry.transport : {};
    if (!isObject(entry.transport)) issues.push(`MCP packages[${index}].transport must be an object.`);
    const transportType = boundedString(transport.type, `MCP packages[${index}].transport.type`, issues, { max: 40, required: true });
    interfaces.push({ protocol: `MCP ${transportType}${registryType ? ` (${registryType})` : ''}`, version: '', url: '' });
  });
  remotes.forEach((entry, index) => {
    if (!isObject(entry)) {
      issues.push(`MCP remotes[${index}] must be an object.`);
      return;
    }
    const transportType = boundedString(entry.type, `MCP remotes[${index}].type`, issues, { max: 40, required: true });
    interfaces.push({
      protocol: `MCP ${transportType}`,
      version: '',
      url: normalizeMCPRemoteUrl(entry.url, `MCP remotes[${index}].url`, issues)
    });
  });
  const repository = isObject(server.repository) ? server.repository : {};
  if (server.repository !== undefined && !isObject(server.repository)) issues.push('MCP repository must be an object.');
  const rawRepositoryUrl = boundedString(repository.url, 'MCP repository.url', issues, { max: 2048 });
  const repositoryUrl = rawRepositoryUrl ? safeRemoteUrl(rawRepositoryUrl) : '';
  if (rawRepositoryUrl && !repositoryUrl) issues.push('MCP repository.url must be an HTTPS URL without embedded credentials.');
  const description = boundedString(server.description, 'MCP description', issues, { max: 600 });
  const secretInputNote = secretInputs.length
    ? `Declared secret configuration inputs (not authentication proof): ${secretInputs.join(', ')}.`.slice(0, 500)
    : '';
  const rawAgent = {
    id: `mcp-${slugify(registryName)}`,
    name: title,
    summary: description || 'Imported MCP server with no description.',
    version: server.version || '',
    lifecycle: 'development',
    risk: 'unassessed',
    owner: { name: '', contact: '' },
    authentication: { schemes: [], notes: secretInputNote },
    interfaces,
    skills: [],
    data: { classification: 'unassessed', sources: [], retention: '' },
    deployment: { environment: '', monitoringOwner: '', incidentContact: '', runbook: '' },
    evidence: {
      purpose: {
        status: description ? 'declared' : 'missing',
        reference: repositoryUrl || (description ? 'Imported MCP server.json description.' : '')
      },
      interface: {
        status: interfaces.length ? 'declared' : 'missing',
        reference: interfaces.length ? 'Imported MCP server.json package and remote transport metadata.' : ''
      },
      authentication: {
        status: 'missing',
        reference: secretInputs.length ? 'MCP secret-input declarations do not establish an authentication scheme.' : ''
      }
    }
  };
  const agent = normalizeAgent(rawAgent, 0, issues);
  if (issues.length) throw new RegistryValidationError(issues);
  return {
    schemaVersion: REGISTRY_SCHEMA_VERSION,
    workspace: {
      name: `${title} readiness review`,
      description: `Created locally from an MCP Registry server.json${schemaMatch ? ` (${schemaMatch[1]})` : ''}. Discovery and configuration metadata are declared evidence; governance evidence remains missing.`,
      updatedAt: ''
    },
    agents: [agent]
  };
}

export function normalizeA2AAgentCard(card) {
  assertNoCredentialFields(card);
  const issues = [];
  const name = boundedString(card.name, 'Agent Card name', issues, { max: 120, required: true });
  const supported = Array.isArray(card.supportedInterfaces)
    ? card.supportedInterfaces.map((entry) => ({
        protocol: entry?.protocolBinding || 'A2A',
        version: entry?.protocolVersion || card.protocolVersion || '',
        url: entry?.url || ''
      }))
    : [{ protocol: 'A2A', version: card.protocolVersion || '', url: card.url || '' }];
  const provider = isObject(card.provider) ? card.provider : {};
  const hasSecurityMetadata = Boolean(
    (isObject(card.securitySchemes) && Object.keys(card.securitySchemes).length)
    || (Array.isArray(card.securityRequirements) && card.securityRequirements.length)
    || (Array.isArray(card.security) && card.security.length)
  );
  const schemeNames = [
    ...Object.keys(isObject(card.securitySchemes) ? card.securitySchemes : {}),
    ...boundedArray(card.securityRequirements || card.security, 'Agent Card security requirements', issues, 20)
      .flatMap((requirement) => isObject(requirement) ? Object.keys(requirement) : [])
  ];
  const rawAgent = {
    id: `a2a-${slugify(name)}`,
    name,
    summary: card.description || 'Imported A2A agent with no description.',
    version: card.version || '',
    lifecycle: 'development',
    risk: 'unassessed',
    owner: { name: provider.organization || provider.name || '', contact: '' },
    authentication: { schemes: [...new Set(schemeNames)], notes: hasSecurityMetadata ? 'Declared by imported A2A Agent Card.' : '' },
    interfaces: supported,
    skills: Array.isArray(card.skills) ? card.skills : [],
    data: { classification: 'unassessed', sources: [], retention: '' },
    deployment: { environment: '', monitoringOwner: '', incidentContact: '', runbook: '' },
    evidence: {
      purpose: {
        status: card.description || card.skills?.length ? 'declared' : 'missing',
        reference: 'Imported A2A Agent Card description and skills.'
      },
      ownership: {
        status: provider.organization || provider.name ? 'declared' : 'missing',
        reference: provider.organization || provider.name ? 'Imported A2A Agent Card provider.' : ''
      },
      interface: { status: supported.some((entry) => entry.url) ? 'declared' : 'missing', reference: 'Imported A2A Agent Card interface metadata.' },
      authentication: { status: hasSecurityMetadata ? 'declared' : 'missing', reference: hasSecurityMetadata ? 'Imported A2A Agent Card security requirements.' : '' }
    }
  };
  const agent = normalizeAgent(rawAgent, 0, issues);
  if (issues.length) throw new RegistryValidationError(issues);
  return {
    schemaVersion: REGISTRY_SCHEMA_VERSION,
    workspace: {
      name: `${name} readiness review`,
      description: 'Created locally from an A2A Agent Card. Governance evidence not present in the card remains missing.',
      updatedAt: ''
    },
    agents: [agent]
  };
}

export function normalizeRegistryDocument(value) {
  assertNoCredentialFields(value);
  const mcpServer = mcpServerFromDocument(value);
  if (mcpServer && !Array.isArray(value.agents)) return normalizeMCPServer(mcpServer);
  if (looksLikeA2ACard(value) && !Array.isArray(value.agents)) return normalizeA2AAgentCard(value);
  const issues = [];
  if (!isObject(value)) throw new RegistryValidationError(['The import must contain one JSON object.']);
  if (value.schemaVersion !== REGISTRY_SCHEMA_VERSION) {
    issues.push(`schemaVersion must be ${REGISTRY_SCHEMA_VERSION}.`);
  }
  const workspace = isObject(value.workspace) ? value.workspace : {};
  if (!isObject(value.workspace)) issues.push('workspace must be an object.');
  const rawAgents = boundedArray(value.agents, 'agents', issues, MAX_AGENTS);
  if (!rawAgents.length) issues.push('agents must contain at least one agent.');
  const agents = rawAgents.map((agent, index) => normalizeAgent(agent, index, issues));
  const normalizedWorkspace = {
    name: boundedString(workspace.name, 'workspace.name', issues, { max: 120, required: true }),
    description: boundedString(workspace.description, 'workspace.description', issues, { max: 600 }),
    updatedAt: validDate(workspace.updatedAt, 'workspace.updatedAt', issues)
  };
  const ids = new Set();
  for (const agent of agents) {
    if (ids.has(agent.id)) issues.push(`Duplicate agent id “${agent.id}”.`);
    ids.add(agent.id);
  }
  if (issues.length) throw new RegistryValidationError(issues);
  return {
    schemaVersion: REGISTRY_SCHEMA_VERSION,
    workspace: normalizedWorkspace,
    agents
  };
}

export function parseRegistryText(text) {
  if (typeof text !== 'string') throw new RegistryValidationError(['The import must be UTF-8 JSON text.']);
  if (new TextEncoder().encode(text).byteLength > MAX_IMPORT_BYTES) {
    throw new RegistryValidationError([`The import exceeds the ${MAX_IMPORT_BYTES / 1024} KiB limit.`]);
  }
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    throw new RegistryValidationError(['The selected file is not valid JSON.']);
  }
  return normalizeRegistryDocument(value);
}

function daysSince(value, now) {
  if (!value) return 0;
  return Math.floor((now.getTime() - new Date(value).getTime()) / 86_400_000);
}

export function evaluateAgent(agent, { now = new Date(), staleAfterDays = 180 } = {}) {
  const gates = {};
  let score = 0;
  const staleGates = [];
  for (const gate of EVIDENCE_GATES) {
    const evidence = agent.evidence[gate];
    score += GATE_WEIGHTS[gate] * EVIDENCE_VALUE[evidence.status];
    const stale = Boolean(evidence.reviewedAt) && daysSince(evidence.reviewedAt, now) > staleAfterDays;
    if (stale) staleGates.push(gate);
    gates[gate] = { ...evidence, weight: GATE_WEIGHTS[gate], stale };
  }
  score = Math.round(score);
  const blockers = [];
  if (agent.lifecycle === 'concept') blockers.push('Concept lifecycle cannot be treated as deployable.');
  if (agent.lifecycle === 'paused' || agent.lifecycle === 'retired') blockers.push(`${agent.lifecycle === 'paused' ? 'Paused' : 'Retired'} agents are not active deployment candidates.`);
  if (agent.risk === 'unassessed') blockers.push('Risk tier is unassessed.');
  if (agent.risk === 'critical') blockers.push('Critical-risk agents require an explicit exception outside this registry.');
  if (!agent.owner.name || !agent.owner.contact) blockers.push('An accountable owner and contact are required.');
  if (!agent.summary || !agent.skills.length) blockers.push('A bounded purpose and at least one skill are required.');
  if (!['concept', 'paused', 'retired'].includes(agent.lifecycle) && !agent.interfaces.length) blockers.push('An active agent needs a versioned interface declaration.');
  if (['review', 'production'].includes(agent.lifecycle) && !agent.authentication.schemes.length) blockers.push('A review or production agent needs a declared authentication scheme.');
  if (['review', 'production'].includes(agent.lifecycle) && agent.data.classification === 'unassessed') blockers.push('A review or production agent needs an assessed data classification.');
  if (['review', 'production'].includes(agent.lifecycle) && (!agent.data.sources.length || !agent.data.retention)) blockers.push('A review or production agent needs data sources and retention notes.');
  if (['review', 'production'].includes(agent.lifecycle)
    && (!agent.deployment.environment || !agent.deployment.monitoringOwner || !agent.deployment.incidentContact || !agent.deployment.runbook)) {
    blockers.push('A review or production agent needs environment, monitoring owner, incident contact, and runbook metadata.');
  }
  const requiredGates = agent.lifecycle === 'development'
    ? ['purpose', 'ownership', 'data', 'security']
    : agent.lifecycle === 'review' || agent.lifecycle === 'production'
      ? EVIDENCE_GATES
      : [];
  for (const gate of requiredGates) {
    if (agent.evidence[gate].status === 'missing') blockers.push(`${GATE_LABELS[gate]} evidence is missing.`);
  }
  if (staleGates.length) blockers.push(`Evidence is stale in ${staleGates.map((gate) => GATE_LABELS[gate]).join(', ')}.`);
  const uniqueBlockers = [...new Set(blockers)];
  let status = 'review';
  if (agent.lifecycle === 'concept') status = 'concept';
  else if (agent.lifecycle === 'paused' || agent.lifecycle === 'retired') status = 'inactive';
  else if (uniqueBlockers.length) status = 'blocked';
  else if (score >= 85 && (agent.lifecycle === 'review' || agent.lifecycle === 'production')) status = 'ready';
  return { score, status, blockers: uniqueBlockers, gates, staleGates };
}

export function readinessLabel(value) {
  return {
    ready: 'Ready for governed use',
    review: 'Needs review',
    blocked: 'Blocked',
    concept: 'Concept only',
    inactive: 'Inactive'
  }[value] || 'Unknown';
}

export function filterAgents(agents, filters = {}, options = {}) {
  const query = String(filters.query || '').trim().toLocaleLowerCase();
  return agents.filter((agent) => {
    const assessment = evaluateAgent(agent, options);
    if (filters.lifecycle && filters.lifecycle !== 'all' && agent.lifecycle !== filters.lifecycle) return false;
    if (filters.risk && filters.risk !== 'all' && agent.risk !== filters.risk) return false;
    if (filters.readiness === 'stale' && !assessment.staleGates.length) return false;
    if (filters.readiness && !['all', 'stale'].includes(filters.readiness) && assessment.status !== filters.readiness) return false;
    if (!query) return true;
    return [agent.name, agent.summary, agent.id, agent.owner.name, ...agent.skills]
      .join(' ')
      .toLocaleLowerCase()
      .includes(query);
  });
}

function canonicalAgent(agent) {
  return {
    id: agent.id,
    name: agent.name,
    summary: agent.summary,
    version: agent.version,
    lifecycle: agent.lifecycle,
    risk: agent.risk,
    owner: { ...agent.owner },
    authentication: { ...agent.authentication, schemes: [...agent.authentication.schemes] },
    interfaces: agent.interfaces.map((entry) => ({ ...entry })),
    skills: [...agent.skills],
    data: { ...agent.data, sources: [...agent.data.sources] },
    deployment: { ...agent.deployment },
    evidence: Object.fromEntries(EVIDENCE_GATES.map((gate) => [gate, { ...agent.evidence[gate] }]))
  };
}

export function serializeRegistry(value) {
  const registry = normalizeRegistryDocument(value);
  const canonical = {
    schemaVersion: REGISTRY_SCHEMA_VERSION,
    workspace: { ...registry.workspace },
    agents: [...registry.agents].sort((a, b) => a.id.localeCompare(b.id)).map(canonicalAgent)
  };
  return `${JSON.stringify(canonical, null, 2)}\n`;
}

function markdownText(value) {
  return String(value || '').replace(/[\r\n]+/g, ' ').replace(/([\\`*_{}[\]()#+.!|>-])/g, '\\$1');
}

export function renderMarkdownPacket(value, options = {}) {
  const registry = normalizeRegistryDocument(value);
  const agents = [...registry.agents].sort((a, b) => a.id.localeCompare(b.id));
  const lines = [
    `# ${markdownText(registry.workspace.name)} readiness review`,
    '',
    `Registry updated: ${registry.workspace.updatedAt || 'not provided'}`,
    `Agents assessed: ${agents.length}`,
    '',
    '> Readiness scores are workflow signals, not compliance certifications, safety warranties, or substitutes for testing.',
    ''
  ];
  if (registry.workspace.description) lines.push(markdownText(registry.workspace.description), '');
  for (const agent of agents) {
    const assessment = evaluateAgent(agent, options);
    lines.push(
      `## ${markdownText(agent.name)}`,
      '',
      `- Readiness: **${readinessLabel(assessment.status)} (${assessment.score}/100)**`,
      `- Lifecycle: ${markdownText(agent.lifecycle)}`,
      `- Risk: ${markdownText(agent.risk)}`,
      `- Owner: ${markdownText(agent.owner.name || 'missing')} — ${markdownText(agent.owner.contact || 'missing')}`,
      `- Version: ${markdownText(agent.version || 'not provided')}`,
      '',
      markdownText(agent.summary),
      '',
      '### Blockers',
      ''
    );
    if (assessment.blockers.length) assessment.blockers.forEach((blocker) => lines.push(`- ${markdownText(blocker)}`));
    else lines.push('- None recorded by this policy.');
    lines.push('', '### Evidence', '', '| Gate | Status | Reference | Reviewed |', '| --- | --- | --- | --- |');
    for (const gate of EVIDENCE_GATES) {
      const evidence = assessment.gates[gate];
      lines.push(`| ${GATE_LABELS[gate]} | ${evidence.status}${evidence.stale ? ' (stale)' : ''} | ${markdownText(evidence.reference || '—')} | ${markdownText(evidence.reviewedAt || '—')} |`);
    }
    lines.push('');
  }
  return `${lines.join('\n').trim()}\n`;
}
