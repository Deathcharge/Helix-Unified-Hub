import {
  MAX_IMPORT_BYTES,
  RegistryValidationError,
  normalizeRegistryDocument,
  serializeRegistry
} from './readiness.mjs';

// Prepare atomically: neither source is mutated, and the saved/exported form must
// fit the same limit as a file import so a successful workspace can be restored.
export function prepareRegistryImport(current, incoming, mode = 'replace') {
  if (!['replace', 'add'].includes(mode)) {
    throw new RegistryValidationError(['Choose Replace inventory or Add agents before importing.']);
  }
  const imported = normalizeRegistryDocument(incoming);
  let result = imported;
  if (mode === 'add') {
    if (!current) throw new RegistryValidationError(['Import an inventory with Replace inventory before adding agents.']);
    const existing = normalizeRegistryDocument(current);
    result = normalizeRegistryDocument({ ...existing, agents: [...existing.agents, ...imported.agents] });
  }
  if (new TextEncoder().encode(serializeRegistry(result)).byteLength > MAX_IMPORT_BYTES) {
    throw new RegistryValidationError(['The resulting inventory exceeds the 1024 KiB saved/exported size limit. Split it into smaller inventories.']);
  }
  return result;
}
