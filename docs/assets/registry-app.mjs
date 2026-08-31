import {
  EVIDENCE_GATES,
  GATE_LABELS,
  MAX_IMPORT_BYTES,
  RegistryValidationError,
  evaluateAgent,
  filterAgents,
  parseRegistryText,
  readinessLabel,
  renderMarkdownPacket,
  serializeRegistry
} from './readiness.mjs';
import { prepareRegistryImport } from './registry-import.mjs';

const STORAGE_KEY = 'samsarix.agent-readiness-registry.v1';
const elements = {
  blocked: document.querySelector('#metric-blocked'),
  detail: document.querySelector('#agent-detail'),
  empty: document.querySelector('#agent-empty'),
  error: document.querySelector('#workspace-error'),
  exportJson: document.querySelector('#export-json'),
  exportMarkdown: document.querySelector('#export-markdown'),
  file: document.querySelector('#registry-file'),
  importMode: document.querySelector('#import-mode'),
  lifecycle: document.querySelector('#lifecycle-filter'),
  layout: document.querySelector('.registry-layout'),
  list: document.querySelector('#agent-list'),
  message: document.querySelector('#workspace-message'),
  ready: document.querySelector('#metric-ready'),
  readiness: document.querySelector('#readiness-filter'),
  reset: document.querySelector('#reset-registry'),
  resultCount: document.querySelector('#agent-result-count'),
  risk: document.querySelector('#risk-filter'),
  search: document.querySelector('#agent-search'),
  stale: document.querySelector('#metric-stale'),
  total: document.querySelector('#metric-total'),
  workspaceDescription: document.querySelector('#workspace-description'),
  workspaceTitle: document.querySelector('#workspace-title')
};

const state = {
  bundled: null,
  filters: { query: '', lifecycle: 'all', risk: 'all', readiness: 'all' },
  importVersion: 0,
  hasUserRegistry: true,
  registry: null,
  resetTimer: null,
  selectedId: ''
};

function createTextElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function showMessage(text, kind = '') {
  elements.message.textContent = text;
  if (kind) elements.message.dataset.kind = kind;
  else delete elements.message.dataset.kind;
}

function showError(error) {
  const issues = error instanceof RegistryValidationError ? error.issues : [error.message || 'Unknown import error.'];
  elements.error.textContent = issues.slice(0, 5).join(' ');
  elements.error.hidden = false;
}

function clearError() {
  elements.error.hidden = true;
  elements.error.textContent = '';
}

function setControlsEnabled(enabled) {
  for (const element of [elements.exportJson, elements.exportMarkdown, elements.file, elements.importMode, elements.lifecycle, elements.readiness, elements.risk, elements.search]) {
    element.disabled = !enabled;
  }
  elements.reset.disabled = !enabled || !state.bundled;
}

function createAgentRow(agent, assessment) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'agent-row';
  button.dataset.agentId = agent.id;
  button.setAttribute('aria-controls', 'agent-detail');
  button.setAttribute('aria-pressed', String(agent.id === state.selectedId));
  const top = document.createElement('div');
  top.className = 'agent-row-top';
  top.append(
    createTextElement('strong', '', agent.name),
    createTextElement('span', `readiness-badge readiness-${assessment.status}`, readinessLabel(assessment.status))
  );
  const meta = document.createElement('div');
  meta.className = 'agent-row-meta';
  meta.append(
    createTextElement('span', '', `${assessment.score}/100`),
    createTextElement('span', '', agent.lifecycle),
    createTextElement('span', '', `${agent.risk} risk`)
  );
  button.append(top, createTextElement('p', '', agent.summary), meta);
  button.addEventListener('click', () => {
    state.selectedId = agent.id;
    const listScroll = elements.list.scrollTop;
    render();
    elements.list.scrollTop = listScroll;
    // Focus the short heading, not an off-screen or partially visible article.
    elements.detail.querySelector('.detail-title').focus();
  });
  return button;
}

function createList(items, className, emptyText) {
  const list = document.createElement('ul');
  list.className = className;
  const values = items.length ? items : [emptyText];
  for (const item of values) list.append(createTextElement('li', '', item));
  return list;
}

function renderDetail(agent, assessment) {
  elements.detail.replaceChildren();
  const heading = document.createElement('div');
  heading.className = 'detail-heading';
  const title = document.createElement('div');
  const name = createTextElement('h2', 'detail-title', agent.name);
  name.id = 'selected-agent-title';
  name.tabIndex = -1;
  title.append(
    createTextElement('p', 'eyebrow', readinessLabel(assessment.status)),
    name
  );
  const score = createTextElement('div', 'score-ring', String(assessment.score));
  score.setAttribute('aria-label', `Readiness score ${assessment.score} out of 100`);
  heading.append(title, score);

  const back = createTextElement('button', 'button detail-back', 'Back to agent list');
  back.type = 'button';
  back.setAttribute('aria-controls', 'agent-list');
  back.addEventListener('click', () => {
    // Resolve the current row after render; never interpolate imported IDs into selectors.
    const row = Array.from(elements.list.children).find((item) => item.dataset.agentId === agent.id);
    row?.focus();
  });

  const meta = document.createElement('div');
  meta.className = 'detail-meta';
  meta.append(
    createTextElement('span', '', `Lifecycle: ${agent.lifecycle}`),
    createTextElement('span', '', `Risk: ${agent.risk}`),
    createTextElement('span', '', `Version: ${agent.version || 'not provided'}`),
    createTextElement('span', '', `Data: ${agent.data.classification}`)
  );

  const blockers = document.createElement('section');
  blockers.className = 'detail-section';
  blockers.append(
    createTextElement('h3', '', 'Deployment blockers and warnings'),
    createList(assessment.blockers, 'blocker-list', 'No blockers recorded by this policy. Independent testing and approval are still required.')
  );

  const ownership = document.createElement('section');
  ownership.className = 'detail-section';
  ownership.append(
    createTextElement('h3', '', 'Ownership and scope'),
    createList([
      `Owner: ${agent.owner.name || 'missing'}`,
      `Contact: ${agent.owner.contact || 'missing'}`,
      `Authentication: ${agent.authentication.schemes.length ? agent.authentication.schemes.join(', ') : 'not declared'}`,
      `Skills: ${agent.skills.length ? agent.skills.join(', ') : 'missing'}`,
      `Data sources: ${agent.data.sources.length ? agent.data.sources.join(', ') : 'not declared'}`,
      `Retention: ${agent.data.retention || 'not declared'}`
    ], 'plain-list', '')
  );

  const interfaces = document.createElement('section');
  interfaces.className = 'detail-section';
  interfaces.append(
    createTextElement('h3', '', 'Declared interfaces'),
    createList(
      agent.interfaces.map((entry) => [entry.protocol, entry.version, entry.url].filter(Boolean).join(' · ')),
      'plain-list',
      'No interface declared.'
    )
  );

  const evidence = document.createElement('section');
  evidence.className = 'detail-section';
  evidence.append(createTextElement('h3', '', 'Evidence gates'));
  const scrollHelp = createTextElement('p', 'evidence-scroll-help', 'If columns extend beyond the table, scroll horizontally. With the table focused, use Left and Right arrow keys.');
  scrollHelp.id = 'evidence-scroll-help';
  evidence.append(scrollHelp);
  const tableWrap = document.createElement('div');
  tableWrap.className = 'evidence-table-wrap';
  tableWrap.tabIndex = 0;
  tableWrap.setAttribute('role', 'region');
  tableWrap.setAttribute('aria-label', `${agent.name} readiness evidence`);
  tableWrap.setAttribute('aria-describedby', 'evidence-scroll-help');
  const table = document.createElement('table');
  table.className = 'evidence-table';
  const caption = createTextElement('caption', 'visually-hidden', `${agent.name} readiness evidence`);
  const head = document.createElement('thead');
  const headRow = document.createElement('tr');
  for (const value of ['Gate', 'Status', 'Evidence', 'Reviewed']) {
    const cell = createTextElement('th', '', value);
    cell.scope = 'col';
    headRow.append(cell);
  }
  head.append(headRow);
  const body = document.createElement('tbody');
  for (const gate of EVIDENCE_GATES) {
    const item = assessment.gates[gate];
    const row = document.createElement('tr');
    const statusCell = document.createElement('td');
    statusCell.append(createTextElement('span', `evidence-status evidence-${item.status}`, item.status));
    if (item.stale) statusCell.append(' ', createTextElement('span', 'stale-flag', 'stale'));
    row.append(
      createTextElement('td', '', GATE_LABELS[gate]),
      statusCell,
      createTextElement('td', '', item.reference || 'No evidence reference.'),
      createTextElement('td', '', item.reviewedAt || '—')
    );
    body.append(row);
  }
  table.append(caption, head, body);
  tableWrap.append(table);
  evidence.append(tableWrap);

  elements.detail.append(heading, back, createTextElement('p', 'detail-summary', agent.summary), meta, blockers, ownership, interfaces, evidence);
}

function renderMetrics() {
  const assessments = state.registry.agents.map((agent) => evaluateAgent(agent));
  elements.total.textContent = String(assessments.length);
  elements.ready.textContent = String(assessments.filter((entry) => entry.status === 'ready').length);
  elements.blocked.textContent = String(assessments.filter((entry) => ['blocked', 'concept'].includes(entry.status)).length);
  elements.stale.textContent = String(assessments.filter((entry) => entry.staleGates.length).length);
}

function render() {
  if (!state.registry) return;
  elements.workspaceTitle.textContent = state.registry.workspace.name;
  elements.workspaceDescription.textContent = state.registry.workspace.description || 'No workspace description provided.';
  renderMetrics();
  const visible = filterAgents(state.registry.agents, state.filters);
  if (!visible.some((agent) => agent.id === state.selectedId)) state.selectedId = visible[0]?.id || '';
  elements.list.replaceChildren(...visible.map((agent) => createAgentRow(agent, evaluateAgent(agent))));
  elements.list.hidden = visible.length === 0;
  elements.detail.hidden = visible.length === 0;
  elements.layout.hidden = visible.length === 0;
  elements.empty.hidden = visible.length !== 0;
  elements.resultCount.textContent = `${visible.length} of ${state.registry.agents.length} ${state.registry.agents.length === 1 ? 'agent' : 'agents'}`;
  const selected = state.registry.agents.find((agent) => agent.id === state.selectedId);
  if (selected) renderDetail(selected, evaluateAgent(selected));
}

function persistRegistry() {
  try {
    localStorage.setItem(STORAGE_KEY, serializeRegistry(state.registry));
    return true;
  } catch {
    showMessage('The registry is open, but this browser did not allow local persistence. Export before leaving.', '');
    return false;
  }
}

function fileSlug() {
  return state.registry.workspace.name.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'agent-registry';
}

function downloadText(filename, type, content) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

async function importFile(file) {
  if (!file) return;
  const version = ++state.importVersion;
  const mode = elements.importMode.value;
  disarmReset();
  clearError();
  // Capture the File above, then allow even the same rejected file to be retried.
  elements.file.value = '';
  if (file.size > MAX_IMPORT_BYTES) {
    showError(new RegistryValidationError([`The selected file exceeds the ${MAX_IMPORT_BYTES / 1024} KiB limit.`]));
    showMessage('Import rejected. The current registry was not changed.');
    return;
  }
  showMessage(`Validating ${file.name} locally…`);
  try {
    const text = await file.text();
    // A newer selection or confirmed reset owns the workspace now.
    if (version !== state.importVersion) return;
    const imported = parseRegistryText(text);
    const next = prepareRegistryImport(state.registry, imported, mode);
    disarmReset();
    if (mode === 'replace' && state.hasUserRegistry && !window.confirm(
      `Replace your current inventory with ${imported.agents.length} imported ${imported.agents.length === 1 ? 'agent' : 'agents'}? This also replaces its browser-saved copy. Cancel and export JSON first to keep a backup, or choose Add agents to combine distinct IDs.`
    )) {
      showMessage('Import cancelled. The current registry was not changed.');
      return;
    }
    state.registry = next;
    state.hasUserRegistry = true;
    state.selectedId = imported.agents[0].id;
    setControlsEnabled(true);
    const persisted = persistRegistry();
    render();
    showMessage(
      `${mode === 'add' ? 'Added' : 'Imported'} ${imported.agents.length} ${imported.agents.length === 1 ? 'agent' : 'agents'} from ${file.name}.${mode === 'add' ? ` Inventory now contains ${next.agents.length} agents; workspace details were kept.` : ''} Nothing was uploaded.${persisted ? '' : ' Browser persistence is unavailable; export before leaving.'}`,
      persisted ? 'success' : ''
    );
  } catch (error) {
    if (version !== state.importVersion) return;
    showError(error);
    showMessage('Import rejected. The current registry was not changed.');
  }
}

function disarmReset() {
  window.clearTimeout(state.resetTimer);
  state.resetTimer = null;
  delete elements.reset.dataset.armed;
  elements.reset.textContent = 'Reset sample';
}

function removeSavedRegistry() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

function resetRegistry() {
  if (elements.reset.dataset.armed !== 'true') {
    elements.reset.dataset.armed = 'true';
    elements.reset.textContent = 'Confirm reset';
    showMessage('Reset will remove the browser-saved inventory and restore the bundled concepts. Select Confirm reset to continue.');
    window.clearTimeout(state.resetTimer);
    state.resetTimer = window.setTimeout(() => {
      disarmReset();
      showMessage('Reset confirmation expired. No inventory was removed.');
    }, 5000);
    return;
  }
  // Invalidate pending reads before clearing storage or changing visible state.
  state.importVersion += 1;
  disarmReset();
  const removed = removeSavedRegistry();
  state.registry = state.bundled;
  state.hasUserRegistry = !removed;
  elements.importMode.value = 'replace';
  state.selectedId = state.registry.agents[0].id;
  state.filters = { query: '', lifecycle: 'all', risk: 'all', readiness: 'all' };
  elements.search.value = '';
  elements.lifecycle.value = 'all';
  elements.risk.value = 'all';
  elements.readiness.value = 'all';
  clearError();
  render();
  if (removed) {
    showMessage('Browser-saved inventory removed. The bundled concept sample is restored.', 'success');
  } else {
    showError(new Error('Browser-saved inventory could not be removed. Clear this site’s data in browser settings if you need it deleted.'));
    showMessage('The bundled concept sample is restored in memory only. Previous saved data may return on reload.');
  }
}

async function loadBundledRegistry() {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch('./agents.json', { signal: controller.signal });
    if (!response.ok) throw new Error(`Bundled registry returned HTTP ${response.status}.`);
    state.bundled = parseRegistryText(await response.text());
    let restored = null;
    let storageNotice = '';
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) restored = parseRegistryText(saved);
    } catch (error) {
      if (error instanceof RegistryValidationError) {
        storageNotice = removeSavedRegistry()
          ? 'Invalid saved browser data was removed; the bundled inventory was restored.'
          : 'Invalid saved browser data could not be removed; showing the safe bundled inventory. Clear this site’s data in browser settings to remove the invalid saved copy.';
      } else {
        storageNotice = 'Browser storage is unavailable; the bundled inventory will not persist changes.';
      }
    }
    state.registry = restored || state.bundled;
    // If storage was unreadable or could not be cleared, require confirmation
    // before an import can replace an unseen saved copy.
    state.hasUserRegistry = Boolean(restored || storageNotice);
    // Browsers may restore select values across reloads; mode is per-session UI.
    elements.importMode.value = 'replace';
    state.selectedId = state.registry.agents[0].id;
    setControlsEnabled(true);
    render();
    showMessage(storageNotice || (restored
      ? `Restored ${restored.agents.length} locally saved ${restored.agents.length === 1 ? 'agent' : 'agents'}. No data was uploaded.`
      : 'Loaded the bundled concept inventory. Import a local registry, A2A Agent Card, or MCP server.json to assess your own metadata.'), storageNotice ? '' : 'success');
  } catch (error) {
    showError(error.name === 'AbortError'
      ? new Error('The bundled inventory took too long to load. Reload the page to try again.')
      : new Error('The bundled inventory could not be loaded. Reload the page or inspect agents.json directly.'));
    showMessage('Registry unavailable. No browser data was changed.');
    elements.importMode.value = 'replace';
    elements.file.disabled = false;
    elements.importMode.disabled = false;
  } finally {
    window.clearTimeout(timer);
  }
}

elements.file.addEventListener('change', (event) => importFile(event.currentTarget.files?.[0]));
elements.exportJson.addEventListener('click', () => {
  downloadText(`${fileSlug()}.json`, 'application/json;charset=utf-8', serializeRegistry(state.registry));
  showMessage('Exported deterministic registry JSON.', 'success');
});
elements.exportMarkdown.addEventListener('click', () => {
  downloadText(`${fileSlug()}-readiness.md`, 'text/markdown;charset=utf-8', renderMarkdownPacket(state.registry));
  showMessage('Exported a human-readable readiness review packet.', 'success');
});
elements.reset.addEventListener('click', resetRegistry);
elements.search.addEventListener('input', (event) => { state.filters.query = event.currentTarget.value; render(); });
elements.lifecycle.addEventListener('change', (event) => { state.filters.lifecycle = event.currentTarget.value; render(); });
elements.risk.addEventListener('change', (event) => { state.filters.risk = event.currentTarget.value; render(); });
elements.readiness.addEventListener('change', (event) => { state.filters.readiness = event.currentTarget.value; render(); });

loadBundledRegistry();
