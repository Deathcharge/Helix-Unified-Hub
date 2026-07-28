export const SAFE_STATUSES = new Set(['included', 'external', 'archive']);

export function normalizeQuery(value) {
  return String(value || '').trim().toLocaleLowerCase();
}

export function safeHref(value) {
  const href = String(value || '').trim();
  if (!href || /[\u0000-\u001f\\]/.test(href) || href.startsWith('//')) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) {
    try {
      const url = new URL(href);
      return url.protocol === 'https:' ? url.href.replace(/\/$/, '') : null;
    } catch {
      return null;
    }
  }
  if (href.startsWith('/') || href.split('/').includes('..')) return null;
  return href;
}

export function filterEntries(entries, filters) {
  const query = normalizeQuery(filters.query);
  return entries.filter((entry) => {
    if (filters.category !== 'all' && entry.category !== filters.category) return false;
    if (filters.status !== 'all' && entry.status !== filters.status) return false;
    if (!query) return true;
    const searchable = [entry.name, entry.description, entry.category, ...(entry.tags || [])]
      .join(' ')
      .toLocaleLowerCase();
    return searchable.includes(query);
  });
}

export function statusLabel(status) {
  return { included: 'Included here', external: 'External', archive: 'Archive' }[status] || 'Unknown';
}
