import { filterEntries, safeHref, statusLabel } from './catalog.mjs';

const elements = {
  category: document.querySelector('#category-filter'),
  count: document.querySelector('#result-count'),
  error: document.querySelector('#catalog-error'),
  grid: document.querySelector('#portal-grid'),
  search: document.querySelector('#catalog-search'),
  status: document.querySelector('#status-filter'),
  summary: document.querySelector('#catalog-summary')
};
const state = { entries: [], query: '', category: 'all', status: 'all' };

function createTextElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function createCard(entry) {
  const card = document.createElement('article');
  card.className = 'portal-card';
  const meta = document.createElement('div');
  meta.className = 'card-meta';
  meta.append(
    createTextElement('span', `status status-${entry.status}`, statusLabel(entry.status)),
    createTextElement('span', 'category', entry.category)
  );
  const tags = document.createElement('ul');
  tags.className = 'tag-list';
  tags.setAttribute('aria-label', `${entry.name} tags`);
  for (const tag of entry.tags) tags.append(createTextElement('li', '', tag));
  const href = safeHref(entry.href);
  const link = document.createElement('a');
  link.className = 'card-link';
  link.href = href || '#';
  link.textContent = entry.status === 'archive' ? 'View archive' : 'Open destination';
  if (!href) {
    link.setAttribute('aria-disabled', 'true');
    link.addEventListener('click', (event) => event.preventDefault());
  } else if (href.startsWith('https://')) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  card.append(
    meta,
    createTextElement('h3', '', entry.name),
    createTextElement('p', 'card-description', entry.description),
    tags,
    link
  );
  return card;
}

function render() {
  const filtered = filterEntries(state.entries, state);
  elements.grid.replaceChildren(...filtered.map(createCard));
  elements.count.textContent = `${filtered.length} ${filtered.length === 1 ? 'destination' : 'destinations'}`;
  elements.grid.hidden = filtered.length === 0;
  document.querySelector('#empty-state').hidden = filtered.length !== 0;
}

function populateCategories() {
  const categories = [...new Set(state.entries.map((entry) => entry.category))].sort();
  for (const category of categories) {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    elements.category.append(option);
  }
}

function updateSummary() {
  const counts = { included: 0, external: 0, archive: 0 };
  for (const entry of state.entries) counts[entry.status] += 1;
  elements.summary.textContent = `${counts.included} bundled · ${counts.external} external · ${counts.archive} archived`;
}

async function loadCatalog() {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch('./portals.json', { signal: controller.signal });
    if (!response.ok) throw new Error(`Catalog returned HTTP ${response.status}.`);
    const registry = await response.json();
    if (registry.schemaVersion !== 1 || !Array.isArray(registry.entries)) throw new Error('Unsupported catalog format.');
    state.entries = registry.entries;
    populateCategories();
    updateSummary();
    render();
  } catch (error) {
    elements.grid.hidden = true;
    elements.error.hidden = false;
    elements.error.textContent = error.name === 'AbortError'
      ? 'The local catalog took too long to load. Reload the page to try again.'
      : 'The local catalog could not be loaded. The source repository remains available from the header.';
  } finally {
    window.clearTimeout(timer);
    document.querySelector('#catalog-loading').hidden = true;
  }
}

elements.search.addEventListener('input', (event) => { state.query = event.currentTarget.value; render(); });
elements.category.addEventListener('change', (event) => { state.category = event.currentTarget.value; render(); });
elements.status.addEventListener('change', (event) => { state.status = event.currentTarget.value; render(); });
loadCatalog();
