import process from 'node:process';
import { EXIT_CODES, runCli } from '../scripts/registry-cli.mjs';

const registry = String(process.env.INPUT_REGISTRY || '').trim();
const lifecycle = String(process.env.INPUT_LIFECYCLE || 'review,production').trim();
const requireCandidates = String(process.env.INPUT_REQUIRE_CANDIDATES || 'true').trim().toLocaleLowerCase();
const now = String(process.env.INPUT_NOW || '').trim();

if (!registry) {
  console.error('::error title=Agent readiness action::The registry input is required.');
  process.exitCode = EXIT_CODES.usage;
} else if (!['true', 'false'].includes(requireCandidates)) {
  console.error('::error title=Agent readiness action::require-candidates must be true or false.');
  process.exitCode = EXIT_CODES.usage;
} else {
  const args = ['check', registry, '--format', 'github', '--lifecycle', lifecycle];
  if (requireCandidates === 'true') args.push('--require-candidates');
  if (now) args.push('--now', now);
  process.exitCode = await runCli(args);
}
