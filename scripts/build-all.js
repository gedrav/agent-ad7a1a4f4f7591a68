#!/usr/bin/env node
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const slotsDir = path.resolve(projectRoot, 'src', 'slots');

const CONFIGURED_GAME_IDS = [
  'empireofgold',
];

const parseList = (value = '') =>
  value
    .toString()
    .split(/[,\s]+/)
    .map((v) => v.trim())
    .filter(Boolean);

const availableGameIds = fs
  .readdirSync(slotsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

if (!availableGameIds.length) {
  console.error('No games found under src/slots');
  process.exit(1);
}

const configuredRequested = parseList(
  Array.isArray(CONFIGURED_GAME_IDS) ? CONFIGURED_GAME_IDS.join(' ') : CONFIGURED_GAME_IDS,
);
const envRequested = parseList(process.env.GAMES || process.env.GAME_IDS || process.env.BUILD_GAMES);
const requestedSet = new Set(configuredRequested.length ? configuredRequested : envRequested);
const requestedGameIds = [...requestedSet];

if (requestedGameIds.length) {
  const unknown = requestedGameIds.filter((id) => !availableGameIds.includes(id));
  if (unknown.length) {
    console.error(`Unknown game(s): ${unknown.join(', ')}`);
    console.error(`Available games: ${availableGameIds.join(', ')}`);
    process.exit(1);
  }
}

const targetGames = requestedGameIds.length ? requestedGameIds : availableGameIds;

const viteBin = path.resolve(
  projectRoot,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'vite.cmd' : 'vite',
);

const runBuild = (gameId) =>
  new Promise((resolve, reject) => {
    console.log(`\n=== Building ${gameId} ===`);
    const child = spawn(viteBin, ['build', '--mode', 'production'], {
      cwd: projectRoot,
      stdio: 'inherit',
      env: { ...process.env, GAME_ID: gameId },
      shell: process.platform === 'win32',
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Build failed for ${gameId} (exit ${code})`));
      }
    });
  });

console.log(`Building games: ${targetGames.join(', ')}`);

for (const gameId of targetGames) {
  await runBuild(gameId);
}

const buildRoot =
  process.env.BUILD_OUTPUT_ROOT || path.resolve(projectRoot, '../slotv2_game_builds');
console.log(`\nBuilds complete. Output root: ${buildRoot}`);
