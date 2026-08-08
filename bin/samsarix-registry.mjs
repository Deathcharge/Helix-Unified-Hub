#!/usr/bin/env node

import process from 'node:process';
import { runCli } from '../scripts/registry-cli.mjs';

process.exitCode = await runCli(process.argv.slice(2));
