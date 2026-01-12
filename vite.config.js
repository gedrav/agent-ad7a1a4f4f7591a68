// vite.config.js
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'node:path';

// SINGLE CONTROL POINT (with env override)
const GAME_ID = process.env.GAME_ID || 'olympus';
const BUILD_OUTPUT_ROOT = process.env.BUILD_OUTPUT_ROOT
  ? path.resolve(__dirname, process.env.BUILD_OUTPUT_ROOT)
  : path.resolve(__dirname, '../feg_games_build');
const GAME_BUILD_OUT_DIR = path.resolve(BUILD_OUTPUT_ROOT, GAME_ID);

const toPosix = (p) => p.split(path.sep).join('/');

const ASSETS_ROOT = process.env.ASSETS_ROOT
  ? path.resolve(__dirname, process.env.ASSETS_ROOT)
  : path.resolve(__dirname, '../feg_games_assets');
const GAME_ASSETS_ROOT = path.resolve(ASSETS_ROOT, GAME_ID);
const GAME_ASSETS_PATTERN = `${toPosix(GAME_ASSETS_ROOT)}/**/*`;
const GAME_ASSETS_IGNORE = `!${toPosix(GAME_ASSETS_ROOT)}/**/.DS_Store`;

const COMMON_ASSETS_ROOT = path.resolve(ASSETS_ROOT, 'common');
const COMMON_ASSETS_PATTERN = `${toPosix(COMMON_ASSETS_ROOT)}/**/*`;
const COMMON_ASSETS_IGNORE = `!${toPosix(COMMON_ASSETS_ROOT)}/**/.DS_Store`;
const SHOW_STATS_OVERLAY = false; // toggle FPS stats overlay

export default defineConfig(({ mode }) => {
  const isDevBuild = mode === 'development';

  return {
    base: './',
    server: {
      host: true,
      port: 8002,
      fs: {
        allow: [path.resolve(__dirname), ASSETS_ROOT, GAME_ASSETS_ROOT, COMMON_ASSETS_ROOT],
      },
    },
    define: {
      APP_VERSION: JSON.stringify(process.env.npm_package_version),
      // optional: expose it to the app if you want to know which game is running
      __GAME_ID__: JSON.stringify(GAME_ID),
      __SHOW_STATS__: JSON.stringify(SHOW_STATS_OVERLAY),
    },
    resolve: {
      preserveSymlinks: true, // keep symlinked asset folders resolving relative to project root
      alias: {
        // this alias points to ONE game folder based on GAME_ID
        '@game': path.resolve(__dirname, `src/slots/${GAME_ID}`),
        '@assets': GAME_ASSETS_ROOT,
        '@common': COMMON_ASSETS_ROOT,

        // your other aliases
        '@core': path.resolve(__dirname, 'src/corelib'),
        '@brand': path.resolve(__dirname, 'src/brandlib'),
        '@slots': path.resolve(__dirname, 'src/slots'),
        '@types': path.resolve(__dirname, 'src/types'),
      },
    },
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: [GAME_ASSETS_PATTERN, GAME_ASSETS_IGNORE],
            dest: 'assets',
            // preserve folder hierarchy but strip leading ../assets/<game>/ portion
            rename: (_name, _ext, srcPath) => path.relative(GAME_ASSETS_ROOT, srcPath),
          },
          {
            src: [COMMON_ASSETS_PATTERN, COMMON_ASSETS_IGNORE],
            dest: 'assets',
            rename: (_name, _ext, srcPath) => path.relative(COMMON_ASSETS_ROOT, srcPath),
          },
        ],
        watch: isDevBuild,
      }),
    ],
    build: {
      minify: !isDevBuild,
      outDir: GAME_BUILD_OUT_DIR,
      emptyOutDir: true,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/index-canvas.js',
        },
      },
    },
  };
});
