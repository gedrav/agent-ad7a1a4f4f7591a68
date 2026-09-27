# Handoff: show round details inside the app (no external browser)

Date: 2026-09-25
Status: brainstorming in progress. **No design approved. No code changed.**
Path (superpowers:brainstorming): architectural (spans games, shared assets, `game_history_fe`, CMS FE, hosting headers).
Update 2026-09-27: framing is already allowed on live hosts (see section 3), so the iframe route has no infra blocker. Sections 4 and 5 reflect that.

All paths are relative to `/Users/arghyac35/Documents/gitProject/pixentech/FEG/feg_fe/` unless noted.

## 1. Problem

Games run inside operator mobile-app webviews. In the game's History panel, tapping the round-details arrow calls `window.open(<history url>, '_blank')`. The native shell handles `_blank` by sending it to the system browser, so the player leaves the app. Goal: show the same round details inside the app, in the game (modal) and in CMS transaction details, while keeping the `game_history_fe` code the same.

## 2. Decisions made so far

| Decision | Value |
|---|---|
| Who owns the mobile apps | Operators. **No native changes, no native bridge.** Solution must be fully in-page. |
| Framing policy (only if the iframe route is used) | `Content-Security-Policy: frame-ancestors https: capacitor://localhost capacitor:;` (user-confirmed: some iOS native apps use Capacitor, whose page origin is `capacitor://localhost`; the `https:` keyword does not match the `capacitor:` scheme, so it is listed separately) |
| Safety net | Keep today's `window.open` as the fallback when the in-page viewer fails to load |
| Code reuse | `game_history_fe` code stays the source of truth for both game and CMS |

## 3. What exists today (verified by reading code)

### Game side (`feg_games_src` + `feg_games_assets`)
- `feg_games_assets/common/panel/ts/HistoryPanel.ts:474-480` (`createRow`): builds `<extURL>?token=&language=&roundId=` and emits `onclick="window.open('<url>', '_blank')"` for both the portrait and landscape `>` buttons (lines ~507 and ~531). `extURL` comes from `getExternalHistoryURL()` at line ~581.
- `feg_games_src/src/corelib/utils/WindowUtil.ts:72` exposes `window.getExternalHistoryURL`. `GameConfigProxy.ts:21-23` reads `VITE_HISTORY_URL`, `VITE_HISTORY_API_URL`, `VITE_EXTERNAL_HISTORY_URL`.
- `VITE_EXTERNAL_HISTORY_URL` (current working tree): `.env.development` = `https://gaming-studio.test.spiniq.io/history/`, `.env.staging` = `https://gaming-studio.stage.spiniq.io/history/`, `.env.production` = `https://gaming-studio.spiniq.io/history/`. (An earlier read showed `feg-game-history-fe-<env>.pixentech.com` hosts and no prod value; the working tree has changed since, so that reading is obsolete.)
- History panel is plain DOM injected by `SlotRuleLoader.ts` (`historyV2.html`, `injectAndInitHistoryPanel`). `common/` is shared by all games, so one change covers every game.
- `feg_games_src/src/corelib/sound/SoundServiceProxy.ts:235`: workaround for iOS AudioContext going `interrupted` when the tab is hidden by `window.open`. An in-page viewer removes the cause. Keep the workaround.
- Games are Pixi 8 + TypeScript, **no React**. Vite chunks: `vendor-pixi`, `core-engine`, `game-<id>`.
- `WrapperServiceProxy.ts:79` uses `window.parent.postMessage`; `HomeClickedCommand.ts:12` uses `window.top.location.href`. Whether the game is top-level or iframed by the operator is **unverified**.

### History app (`game_history_fe`)
- React 19, only `react` + `react-dom`. About 1,545 lines of JSX in `src/app` (about 4.5k lines including CSS/JS, approx).
- Inputs come from `window.location.search`: `id|roundId|roundid` (a `$` suffix is stripped), `token`, `lang|language`, `session`, `server`.
- Fetches `${VITE_API_BASE_URL}/${roundId}` with `Authorization: Bearer <token>`.
- Host-coupled code that a web component must remove or replace:
  - `src/app/BetHistoryViewer.jsx:127-129`: `window.close()` then `about:blank` (close handler)
  - `BetHistoryViewer.jsx:100`: writes `document.title`
  - `src/hooks/useUrlParams.js`: reads `window.location`
  - `src/app/constants/config.js`, `BetHistoryViewer.jsx:40`: `import.meta.env.BASE_URL` (locales) and `VITE_API_BASE_URL`
  - `src/app/components/styles/reeldisplay.css:117`, `tumbleview.css:214`: `border-image: url('/assets/common/UI_Frame.png')` (root-relative)
  - `src/index.css`, `src/app/betHistoryViewer.css:392-421`: global `html`, `body`, `#root`, `a`, `h1`, `button`, `:root`, `::-webkit-scrollbar` rules
  - `src/main.jsx` imports `zoomDisable.js` (global gesture blockers; games already have their own)
  - `src/services/authService.js`: unused (dead code)
- 133 unique class names, not namespaced. No `@font-face` (system fonts).
- `public/assets` is 4.6 MB: per-game symbol folders `bookofstroms`, `empireofgold`, `empireofgoldnewconquest`, `frostedmarketbonanza`, `royale81`, `sweetsalon`, plus `common`. `UI_Frame.png` (25 KB) is in `public/assets/common/` and **not** in `feg_games_assets`.
- The history page already handles safe-area insets and a fixed scrolling root, so it should behave when embedded.

### CMS (`feg_slot_cms_fe`)
- React 18.3, Vite 6, Radix Dialog + framer-motion.
- `src/components/reports/bet-round-history-modal.tsx` **already iframes** the history page (sandboxed, zoom controls, 15s "may not allow embedding" hint, "Open in new tab").
- `src/lib/bet-history.ts` builds the URL from `VITE_BET_HISTORY_PAGE_BASE_URL`, token and `roundId`. Only status `credit_completed` is replayable.

### Framing: NOT a blocker (corrected 2026-09-27)
Earlier versions of this doc claimed `X-Frame-Options: SAMEORIGIN` blocks the iframe route. That was wrong. It was read from the repo, not from live hosts.
- `infra/nginx/default.conf` in the repo still sets `X-Frame-Options: SAMEORIGIN` in `game_history_fe`, games, CMS and lobby.
- Live check (`curl -sI`, 2026-09-27) on `https://gaming-studio.test.spiniq.io/history/`, `https://gaming-studio.stage.spiniq.io/history/` and `https://gaming-studio.spiniq.io/history/`: **no `X-Frame-Options`**, and `content-security-policy: frame-ancestors https: capacitor://localhost capacitor:`. The same CSP is on `/` (CMS) of the test host. `server: cloudflare`.
- The origin's other nginx headers (`x-content-type-options`, `referrer-policy`) do reach the client while `X-Frame-Options` does not, so something in front (inferred: a Cloudflare header rule) strips it and sets the CSP. The repo nginx config is out of sync with live behavior.
- Real deployments are path-based on one host per env (`gaming-studio.<env>.spiniq.io`: CMS at `/`, history at `/history/`), which is why the CMS iframe modal works today.
- Not checked: the header state of the games host itself (its URL is unknown to this doc).

### Package distribution
- Nexus proxy registry for npm; hosted repo `https://nexus.svc.ifortuna.cz/repository/gaming-studio-npm/` for scope `@pixentech`.
- `feg_common` (`/Users/arghyac35/Documents/gitProject/pixentech/FEG/feg_common`) publishes `@pixentech/feg_be_common` with `release-it`. It is a backend lib.
- No FE repo (games, CMS, history, lobby) consumes `@pixentech` packages. Their `.npmrc` files do not map the `@pixentech` scope.

## 4. Approaches evaluated

| ID | Approach | Verdict |
|---|---|---|
| A | Iframe modal in game and CMS (framing already allowed at the edge) | Simplest, **no infra change**. Cost: full document cold-boot per open, token in the URL. CMS already does this. |
| B | Serve history under the games origin, same-origin iframe | Rejected. Couples deploys for no gain now that framing is already allowed. |
| C | Navigate the same window, back to return | Rejected. Reloads the game, loses session and audio. |
| D | Web component (Shadow DOM) built from `game_history_fe` | **Current leaning.** Better perf and no token in URL. Larger effort. |
| E | Rewrite in Lit or vanilla | Rejected. Violates "history code stays same". |

Iframe performance note (unverified on device): on iOS WKWebView and Android WebView a cross-origin iframe typically shares the process and main thread with the game, so isolation gains are small while boot cost is full.

### Web component design sketch
- New `embed` build in `game_history_fe` (Vite library mode): `src/embed.jsx` registers `<round-history-viewer>` with Shadow DOM. CSS is inlined and scoped to `:host`.
- Contract: attributes `round-id`, `token` (also settable as a property), `lang`, `api-base`, `asset-base`; event `close`. The host (game modal or CMS dialog) provides the chrome.
- `UI_Frame.png` stays as the same PNG. Only its URL changes: built from `asset-base` (absolute URL to the history host) and applied as `border-image`. Symbol images use the same rule. No CORS needed for CSS images.
- The standalone app stays: `main.jsx` mounts the same element from URL params, so existing links keep working and there is one code path.
- CMS is React 18: use a small wrapper (set props via ref).

### Distribution options for the component
| Option | How it ships | Pros | Cons |
|---|---|---|---|
| **Runtime module (leaning)** | Built ES module hosted on the history host, e.g. `/embed/v1/round-history-viewer.js`; consumers `await import(/* @vite-ignore */ url)` on first use, prefetched when the history panel opens | One history deploy updates every game and CMS; nothing added to consumer bundles | Needs CORS (`Access-Control-Allow-Origin: *` also covers `capacitor://localhost` origins, and needs no per-shell allowlist) + `Cache-Control: no-cache` on the file; cross-origin cold load on first open; code from another origin runs with game page privileges (no SRI for `import()`); breaking contract changes need a versioned path (`v2`) |
| npm package | Publish to `gaming-studio-npm`, consumers depend on it | Pinned, reviewed at each consumer build | Every history fix or new game (symbol map, assets) means publish + bump + rebuild + redeploy 7 games and CMS; needs `.npmrc` scope mapping in consumers |

Optional size lever: alias `react` to `preact/compat` in the embed build. React + ReactDOM is roughly 55-60 KB gzip (approx, not measured) vs about 5 KB for Preact. Needs a compat check (hooks, Suspense).

Fallback on any load failure: reject from `import()` then `window.open` (today's behavior).

## 5. Open decisions (need the user)

1. Distribution: runtime module or npm package?
2. Preact alias from the start, or React first and optimize later?
3. Final choice between web component (D) and iframe (A) if the trust trade-off of runtime code loading is a concern.
4. Phasing (assistant's recommendation after the framing correction): ship A first (game modal only; CMS already works; no infra change; add prefetch/preconnect when the history panel opens), measure cold-boot time and memory on real iOS and Android webviews, and move to D only if the numbers justify the extra effort. Needs user confirmation.

## 6. To verify before or during the spec

- Who owns the edge rule that strips `X-Frame-Options` and sets the framing CSP, and whether it is captured in any repo (the repo nginx configs still say `SAMEORIGIN`, which misleads readers).
- Headers on the games host itself (history page headers are already verified on test, stage, prod).
- Whether operators load the game top-level in the webview or iframe it. Known now: some iOS operators use Capacitor (`capacitor://localhost`). If any of them iframe the game from that page, the games nginx `X-Frame-Options: SAMEORIGIN` would already block it, so either prod headers differ from the repo or they load the game top-level (Capacitor `server.url`). Confirm with `curl -I` on prod.
- Android Capacitor origin: `https://localhost` by default in recent Capacitor, but older versions use `http://localhost`, which `https:` does not cover. Check operator Capacitor versions and add `http://localhost` to the policy if needed. Other shells (`ionic://localhost`, `file:`) would each need adding too.
- Whether the game pauses its Pixi ticker while a panel is open (relevant to a component that renders inside the game page).
- Minimum operator webview versions for dynamic `import()` (Safari 11.1+, Chrome 63+); the fallback covers older ones.
- Android hardware back button and iOS swipe-back behavior with the modal open.
- Any CSP on CMS that would block cross-origin module scripts (none seen in repo).
- Process for adding a new game's symbols to `symbolImageMap.js` and `public/assets` (affects update flow for either approach).
- Inline `onclick="window.open('...')"` string in `createRow`: replace with a delegated click handler and a `data-` attribute when changing it.

## 7. Where the brainstorming stands

Done: context exploration, intent and constraints, approaches, design section 1 (units and per-repo changes, iframe version), web component comparison.

Remaining (superpowers:brainstorming, architectural path):
1. Get answers to section 5.
2. Re-issue design section 1 for the chosen approach.
3. Design section 2: in-game modal behavior (layout, close, Android back, loading, error and fallback, cleanup when the history panel closes, orientation and safe-area).
4. Design section 3: token handling, failure modes, manual test matrix.
5. Write the spec to `feg_games_src/docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`, self-review, user review.
6. Only then invoke `superpowers:writing-plans`. **No implementation before the spec is approved.**

## 8. Project rules to respect (from user and repo CLAUDE.md)

- No unit tests unless asked. No project builds unless asked. Ignore linter errors.
- No em dashes anywhere (output, comments, files). Comments: one line max, only for non-obvious why.
- No git worktrees without explicit double-confirmation.
- Temp files go in a `temp` folder inside the project, never `/tmp`.
- Do not look into `node_modules`. Do not auto-edit any project `CLAUDE.md`.
- Use specialized agents: `typescript-pro` for TS, `react-specialist` for React, `code-reviewer` for reviews, `general-purpose` only as fallback.

## 9. Key files

- `feg_games_assets/common/panel/ts/HistoryPanel.ts` (trigger, `createRow`)
- `feg_games_assets/common/panel/ts/SlotRuleLoader.ts` (panel injection)
- `feg_games_assets/common/history/historyV2.html`
- `feg_games_src/src/corelib/utils/WindowUtil.ts`, `src/corelib/models/GameConfigProxy.ts`
- `feg_games_src/src/corelib/sound/SoundServiceProxy.ts`
- `game_history_fe/src/app/BetHistoryViewer.jsx`, `src/hooks/useUrlParams.js`, `src/app/constants/config.js`, `src/index.css`, `src/app/betHistoryViewer.css`, `src/main.jsx`
- `game_history_fe/infra/nginx/default.conf` (framing headers)
- `feg_slot_cms_fe/src/components/reports/bet-round-history-modal.tsx`, `src/lib/bet-history.ts`
