#!/usr/bin/env node
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const slotsDir = path.resolve(projectRoot, 'src', 'slots');

const CONFIGURED_GAME_IDS = ['empireofgold', 'royale81', 'empireofgoldnewconquest', 'sweetsalon', 'frostedmarketbonanza','bookofstorms'];

// Resolve build mode: --mode <value> CLI arg > NODE_ENV > fallback 'production'
const modeArgIndex = process.argv.indexOf('--mode');
const BUILD_MODE = modeArgIndex !== -1 ? process.argv[modeArgIndex + 1] : process.env.NODE_ENV || 'production';

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

const viteBin = path.resolve(projectRoot, 'node_modules', '.bin', process.platform === 'win32' ? 'vite.cmd' : 'vite');

const runBuild = (gameId) =>
  new Promise((resolve, reject) => {
    console.log(`\n=== Building ${gameId} ===`);
    const child = spawn(viteBin, ['build', '--mode', BUILD_MODE], {
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

const buildRoot = process.env.BUILD_OUTPUT_ROOT || path.resolve(projectRoot, '../feg_games_build');
console.log(`\nBuilds complete. Output root: ${buildRoot}`);

// ── Generate root index.html ───────────────────────────────────
// Azure Static Web Apps (and the SWA CLI) require an index.html
// at the root of the upload folder. Each game lives in its own
// sub-folder, so we generate a minimal root index that redirects
// to the first game (or shows a list when there are multiple).
const defaultGame = targetGames[0];
const gameLinks = targetGames.map((id) => `<li><a href="./${id}/">${id}</a></li>`).join('\n    ');

const rootIndex =
  targetGames.length === 1
    ? `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0; url=./${defaultGame}/" />
    <title>Redirecting…</title>
  </head>
  <body>
    <p>Redirecting to <a href="./${defaultGame}/">${defaultGame}</a>…</p>
  </body>
</html>`
    : `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>FEG Games</title>
    <style>body{font-family:sans-serif;padding:2rem;}ul{list-style:none;padding:0;}li{margin:0.5rem 0;}a{font-size:1.2rem;}</style>
  </head>
  <body>
    <h1>FEG Games</h1>
    <ul>
    ${gameLinks}
    </ul>
  </body>
</html>`;

fs.writeFileSync(path.resolve(buildRoot, 'index.html'), rootIndex);
console.log(`Root index.html generated → ${defaultGame} (${targetGames.length} game(s))`);
