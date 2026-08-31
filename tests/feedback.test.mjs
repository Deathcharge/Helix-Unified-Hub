import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8');
// JSON is an intentional YAML subset here, not a general YAML parser. These
// tests cover our form contract, not GitHub's hosted UI or submitted content.
const form = JSON.parse(await read('.github/ISSUE_TEMPLATE/workflow-feedback.yml'));
const config = JSON.parse(await read('.github/ISSUE_TEMPLATE/config.yml'));

test('feedback form has deliberate, unique fields and valid configured input shapes', () => {
  assert.equal(form.name, 'Registry workflow feedback');
  assert.equal(typeof form.description, 'string');
  assert.ok(form.description.length > 0);
  const ids = new Set();
  const labels = new Set();
  for (const field of form.body) {
    assert.ok(['markdown', 'checkboxes', 'dropdown', 'input', 'textarea'].includes(field.type));
    assert.ok(field.attributes);
    if (field.type === 'markdown') {
      assert.equal(typeof field.attributes.value, 'string');
      continue;
    }
    assert.match(field.id, /^[a-z0-9_-]+$/);
    assert.equal(ids.has(field.id), false);
    ids.add(field.id);
    assert.ok(field.attributes.label.length);
    assert.equal(labels.has(field.attributes.label), false);
    labels.add(field.attributes.label);
    assert.equal(field.attributes.value, undefined, 'do not prefill user outcomes');
    if (field.type === 'dropdown') {
      const choices = field.attributes.options;
      assert.ok(choices.length >= 2 && choices.every((item) => typeof item === 'string'));
      assert.equal(new Set(choices).size, choices.length);
      assert.equal(field.attributes.default, undefined, 'evidence basis must be chosen, not inferred');
    }
  }
  assert.deepEqual([...ids], ['privacy', 'kind', 'surface', 'environment', 'evidence', 'job', 'observation', 'outcome', 'frequency']);
});

test('feedback requests reproducible context without demanding identifiable data or attachments', () => {
  const byId = Object.fromEntries(form.body.filter((field) => field.id).map((field) => [field.id, field]));
  for (const id of ['kind', 'surface', 'environment', 'evidence', 'job', 'observation', 'outcome']) {
    assert.equal(byId[id].validations.required, true, id);
  }
  assert.equal(byId.frequency.validations.required, false);
  assert.ok(byId.evidence.attributes.options.includes('Proposal not yet tried'));
  for (const field of form.body.filter((entry) => entry.type === 'textarea')) {
    assert.equal(field.attributes.render, 'text', 'keep the initial form text-only rather than inviting attachment uploads');
  }
  assert.equal(form.body.some((field) => field.type === 'upload'), false);
  for (const key of ['assignees', 'projects', 'labels']) assert.equal(form[key], undefined);
});

test('public feedback explicitly routes sensitive and security reports away from issues', () => {
  const notice = form.body[0].attributes.value;
  assert.match(notice, /PUBLIC GitHub issue, not local browser storage/);
  for (const boundary of ['inventories', 'private URLs', 'credentials', 'personal data', 'support@samsarix.com']) {
    assert.ok(notice.includes(boundary));
  }
  const privacy = form.body.find((field) => field.id === 'privacy');
  assert.equal(privacy.attributes.options[0].required, true);
  assert.match(privacy.attributes.options[0].label, /not an unpatched security disclosure/);
  assert.equal(config.blank_issues_enabled, true, 'preserve the existing general issue path');
  assert.equal(config.contact_links.length, 1);
  assert.equal(config.contact_links[0].url, 'https://github.com/Deathcharge/Helix-Unified-Hub/blob/main/SECURITY.md');
});

test('onboarding links lead to the actual form and existing pilot/owner-evidence sections', async () => {
  for (const file of ['README.md', 'CONTRIBUTING.md', 'docs/AGENT_REGISTRY_PRODUCT.md']) {
    assert.ok((await read(file)).includes('issues/new?template=workflow-feedback.yml'), file);
  }
  const product = await read('docs/AGENT_REGISTRY_PRODUCT.md');
  const record = await read('docs/PRODUCTIZATION.md');
  const roadmap = await read('ROADMAP.md');
  assert.match(product, /^## First-use pilot protocol$/m);
  assert.match(product, /no completed target-user pilot is recorded/);
  assert.match(record, /^## Owner evidence checklist$/m);
  for (let gate = 1; gate <= 6; gate += 1) assert.ok(record.includes(`G${gate} —`));
  assert.match(roadmap, /standalone, local-first agent inventory/);
  assert.doesNotMatch(roadmap, /Current disposition:.*consolidation source/);
  for (const source of [product, record, roadmap]) {
    const headings = [...source.matchAll(/^## (.+)$/gm)].map((match) => match[1]);
    assert.equal(new Set(headings).size, headings.length, 'top-level documentation anchors must stay unique');
  }
});
