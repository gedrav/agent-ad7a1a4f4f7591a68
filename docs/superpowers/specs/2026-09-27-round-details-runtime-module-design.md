# Round details in-app via a runtime module: design

Date: 2026-09-27
Status: draft for user review. No implementation started.
Revision: CMS changes brought into scope (section 8).
Background and evidence: `docs/handoff/2026-09-25-round-details-in-app.md` (same repo). This spec supersedes its recommendation sections.

Paths are relative to `/Users/arghyac35/Documents/gitProject/pixentech/FEG/feg_fe/` unless noted.

## 1. Goal and non-goals

### Goal
When a player taps the round-details arrow in the game's History panel, the round view opens **inside the game page** as an in-page overlay. The player never leaves the game, the game does not reload, and no external browser or new window is opened. It must work in operator mobile-app webviews, including iOS Capacitor shells (`capacitor://localhost`).

The CMS transaction-details modal uses the same element instead of an iframe, so the token no longer travels in a URL there either, and games and CMS share one deployed module.

### Non-goals
- No native app changes, no native bridge (operators own the apps).
- No redesign of the CMS modal controls (zoom, fullscreen, reload, open in new tab stay).
- No visual redesign of the history view. Output must look the same as the standalone page.
- No npm packaging, no Preact swap, no iframe renderer (see section 11).

## 2. Verified facts this design relies on

| Fact | Evidence |
|---|---|
| Today the trigger is `window.open(<url>, '_blank')` for both row buttons | `feg_games_assets/common/panel/ts/HistoryPanel.ts:474-480`, buttons at ~507 and ~531 |
| The URL is `<VITE_EXTERNAL_HISTORY_URL>?token&language&roundId` | `HistoryPanel.ts:474-477`; `getExternalHistoryURL()` in `feg_games_src/src/corelib/utils/WindowUtil.ts:72` |
| Games, CMS and history are **same-origin per env**: games at `/slot-games/<id>/`, CMS at `/`, history at `/history/` on `gaming-studio.<env>.spiniq.io` | `curl -sI` on the test host (2026-09-27); RGS onboarding config uses `https://gaming-studio.stage.spiniq.io/slot-games/`. Prod: history host verified, prod games host assumed to follow the same pattern |
| `VITE_EXTERNAL_HISTORY_URL` per env | `.env.development` = `https://gaming-studio.test.spiniq.io/history/`, `.env.staging` = `https://gaming-studio.stage.spiniq.io/history/`, `.env.production` = `https://gaming-studio.spiniq.io/history/` |
| Opening the history panel already stops Pixi and sets `_isPanelOpen`; closing restarts Pixi | `feg_games_assets/common/panel/ts/SlotRuleLoader.ts:201-202`, `:627` |
| Panel teardown clears `#gameRulesPanel` via `innerHTML = ''` in `cleanupPanels()` | `SlotRuleLoader.ts:~571-628` |
| The game installs a global touch/click blocker that uses `e.target.closest(selector)` on `document` | `feg_games_src/src/main.ts:2` imports `@common/panel/ts/zoomDisable`; logic in `feg_games_assets/common/panel/ts/zoomDisable.ts` |
| The game has no back-button handling today | grep for `popstate`, `pushState`, `backbutton` in games src and common assets: no hits |
| History app is React 19, single entry, reads `id|roundId|roundid`, `token`, `lang|language` from the URL, fetches `${VITE_API_BASE_URL}/${roundId}` with a Bearer token | `game_history_fe/src/app/BetHistoryViewer.jsx`, `src/hooks/useUrlParams.js` |
| The viewer already renders its own full-viewport overlay with a close `X` button | `BetHistoryViewer.jsx` (`modal-overlay`, `modal-close-button`), `betHistoryViewer.css` (`.modal-overlay`, safe-area insets, z-index 1000) |
| Live history bundle: JS 239,405 B raw / 71,980 B gzip; CSS 41,141 B raw / 8,721 B gzip | `curl` on `https://gaming-studio.test.spiniq.io/history/assets/index-*.js|css` |
| Live JS is served `cache-control: public, max-age=31536000` (Cloudflare `MISS` then cached) | `curl -sI` on the live JS file |
| Framing headers are irrelevant here (no iframe); the edge already sets `frame-ancestors https: capacitor://localhost capacitor:` and no `X-Frame-Options` | `curl -sI` on `/history/` for test, stage, prod |
| The CMS round modal has one consumer, `transaction-details.tsx`. It iframes `buildBetHistoryUrl(roundId, token)` inside a Radix Dialog with zoom, fullscreen, reload and open-in-new-tab controls | `feg_slot_cms_fe/src/components/reports/bet-round-history-modal.tsx`, `src/lib/bet-history.ts`, `src/pages/reports/transaction-details.tsx` |
| CMS stack: React 18.3, Vite 6, `@radix-ui/react-dialog` ^1.1.4, `jsx: react-jsx`, strict TS, no `IntrinsicElements` declarations, no language setting | `feg_slot_cms_fe/package.json`, `tsconfig.json` |
| `VITE_BET_HISTORY_PAGE_BASE_URL` is absolute per env: `https://gaming-studio.test.spiniq.io/history/`, `https://gaming-studio.stage.spiniq.io/history/`, `https://gaming-studio.spiniq.io/history/` | `feg_slot_cms_fe/.env.development`, `.env.staging`, `.env.production` |

## 3. Decision summary

Build the history viewer once as a **web component** (`<round-history-viewer>`, Shadow DOM), ship it as a **single ES module served from the history host**, and have the game load it at runtime with `import()` on first use. The game owns the modal chrome and lifecycle.

Why this over the alternatives (user decision, 2026-09-27):
- Same bytes as an iframe (about 81 KB gzip), but no second HTML document, no token in a URL, and shared viewport and touch handling with the game.
- One `game_history_fe` deploy updates every consumer, with no per-game rebuild.

Accepted trade-offs (see section 9): refactor of history code, CSS scoping work, a game-side touch-blocker fix, cache configuration for a fixed-name file, and a modest, unmeasured speed gain. Seamlessness itself (staying in the game) is the same as an iframe would give.

## 4. Architecture

```
HistoryPanel rows first render
   -> idle: prefetchRoundDetails()  ->  import(moduleUrl)          [memoized promise]

Player taps ">"  (one delegated handler on #tableBody)
   -> window.playHistoryRulesSound?.()
   -> openRoundDetails(roundId)
        1. show spinner host (fixed, inset 0, above the panel)
        2. await module (10 s timeout)         -> on failure: retry / open-in-browser UI
        3. el = <round-history-viewer round-id lang>; el.token = getToken()
        4. host.append(el); push a history state (back-button support)
        5. el 'rh-close' | back button | panel closes -> closeRoundDetails()
           el 'rh-error'                        -> retry / open-in-browser UI

Module URL:  new URL('embed/v1/round-history-viewer.js', getExternalHistoryURL() with trailing '/')
             e.g. https://gaming-studio.test.spiniq.io/history/embed/v1/round-history-viewer.js
```

Units and boundaries:

| Unit | Repo | Responsibility | Depends on |
|---|---|---|---|
| Shared viewer component | `game_history_fe` | Fetch round, render base game, free spins, tumbles, pick features. Props in, callbacks out. No `window`, `document`, or `import.meta.env` reads. | props only |
| Standalone entry | `game_history_fe` | Reads URL params, sets page title, closes tab. Behavior unchanged. | shared component |
| Embed entry (`round-history-viewer`) | `game_history_fe` | Custom element, Shadow DOM, style injection, asset base, events. | shared component |
| Embed build + nginx rule | `game_history_fe` | One file at `/embed/v1/round-history-viewer.js`, revalidated on every load. | embed entry |
| `RoundDetailsModal.ts` | `feg_games_assets/common/panel/ts` | Load module, own the overlay, spinner, error UI, lifecycle, back button. | element contract |
| Row wiring, cleanup hook, touch fix | `feg_games_assets/common/panel/ts` | Replace `window.open`, close on panel teardown, keep taps working. | modal |
| Module loader + element host | `feg_slot_cms_fe/src` | Load the module, mount the element inside the existing Radix modal, keep zoom, fullscreen, reload, open in new tab. | element contract |

## 5. Element contract v1

- Tag: `round-history-viewer`. Registered once: `if (!customElements.get(tag)) customElements.define(tag, ...)`.
- Shadow root: open. Styles injected as a `<style>` element (not `adoptedStyleSheets`, which needs iOS 16.4+).
- Attributes:
  - `round-id` (required). A `$` suffix is stripped, as the viewer does today.
  - `lang` (default `en`).
  - `hide-close` (optional boolean attribute). When set, the viewer does not render its own `X` button. Used by hosts that provide their own close control (CMS).
  - `api-base` (optional). Default: the `VITE_API_BASE_URL` baked into the build of the env that serves the module.
  - `asset-base` (optional). Default: the history folder computed from the module URL, `new URL('../../', import.meta.url)`.
- Property `token` (string). Never reflected to an attribute or the URL.
- Fetch starts when the element is connected and both `round-id` and `token` are set; it refetches if either changes.
- Events (both `bubbles: true, composed: true`):
  - `rh-close`: the viewer's `X` button was pressed (not rendered when `hide-close` is set).
  - `rh-error` with `detail: { message }`: an unrecoverable render failure caught by an error boundary. API errors keep using the viewer's existing error card.
- Lifecycle: React root is created in `connectedCallback` and unmounted in `disconnectedCallback`. The host creates a **fresh element per open** and removes it on close.
- Versioning: the path segment `v1` is the contract. Within `v1` changes are additive only. A breaking change ships at `/embed/v2/` with a new tag name (`round-history-viewer-v2`) so old and new can coexist. The game pins `v1` in its loader.
- One viewer instance at a time (module-level i18n state in `config.js` is shared).

## 6. `game_history_fe` changes

### 6.1 Shared component refactor
- `BetHistoryViewer` takes `{ roundId, token, lang, apiBase, assetBase, hideClose, onClose, onLoaded }` instead of reading `useSearchParams` and `import.meta.env`.
- Moves to `App.jsx` (standalone only): URL param parsing, `document.title = gameName` (via `onLoaded`), and the current `handleClose` (`window.close()` then `about:blank`).
- Unused `session` and `server` params are dropped from the effect dependencies.
- `src/services/authService.js` and `src/hooks/useTranslation.js` are dead code; leave untouched (out of scope).
- Standalone behavior and URL contract stay identical (existing links, CMS "Open in new tab", external fallback keep working).

### 6.2 Embed entry
- New `src/embed/main.jsx`: defines the element class, creates the React root in the shadow root, wraps the tree in an error boundary that dispatches `rh-error`, wires `onClose` to `rh-close`.
- Imports the shared stylesheets as inline strings (`?inline`) and injects them as one `<style>` in the shadow root.
- Does **not** import `zoomDisable.js` (the game already installs its own).

### 6.3 CSS scoping
- Shared (apply in standalone globally and in the shadow root): element rules currently in `src/index.css` (`*`, `a`, `h1`, `button`, focus rules), because viewer buttons rely on the `button` base styles.
- Standalone-only: rules that target `html`, `body`, `#root` (page height, overflow lock, `#root` fixed positioning, body background, `user-select`).
- `:root` variable blocks and the `html` scrollbar rules (`betHistoryViewer.css` around lines 392-421) get `:host` twins: `:root, :host { ... }`. The `html, body { touch-action: manipulation }` rule gets a `:host` twin.
- `:host { all: initial; display: block; width: 100%; height: 100%; touch-action: manipulation; -webkit-user-select: none; user-select: none; }` so nothing inherits from the game page (font, color, `user-select`).
- Fixed positioning: `.modal-overlay` and the two inline `position: fixed; inset: 0` cover divs in `BetHistoryViewer.jsx` become class-based. Standalone keeps `fixed`; the embed overrides to `absolute` because the host container is already fixed and full-viewport (avoids trouble with transformed ancestors). Safe-area offsets stay.
- Frame image: `border-image: var(--rh-frame-image, url('/assets/common/UI_Frame.png')) 32 stretch;` in `reeldisplay.css` and `tumbleview.css`. The embed sets `--rh-frame-image` on `:host` to an absolute `url()` built from the asset base. Standalone falls back to today's URL.

### 6.4 Asset resolution
Relative paths resolve against the page that runs them, so they break inside a game page. Verified on the test host: `assets/empireofgold/H1.png` and `locales/en/commonContent.json` return 200 under `/history/` but 404 under `/slot-games/royale81/`.

One helper, `resolveAsset(path)`, returns `new URL(path, assetBase).href`. The asset base is set once by the entry: standalone uses the page base as today, embed uses the attribute or the module-derived default.

| Current reference | Change |
|---|---|
| `symbolImageMap.js` values like `'assets/empireofgold/H1.png'`, consumed raw by `BaseGameView.jsx`, `FreeSpinsView.jsx`, `ReelDisplay.jsx`, `TumbleView.jsx` | `getSymbolImageMap` returns absolute URLs |
| `PickFeatureView.jsx` local `getAsset()` with baked `BASE_URL` | use `resolveAsset` |
| `assetPreloader.js` (`new Image().src = url`) | receives absolute URLs from the map |
| `config.js` locales fetch (`${BASE_URL}locales/...`) | `resolveAsset('locales/<lang>/...')` |
| CSS `UI_Frame.png` (two files) | `--rh-frame-image`, section 6.3 |

### 6.5 Build
- New `vite.embed.config.js` (Vite 5, `@vitejs/plugin-react`):
  - `build.lib`: entry `src/embed/main.jsx`, format `es`, output file name fixed to `round-history-viewer.js`.
  - `outDir: dist/embed/v1`, `emptyOutDir: false`, `copyPublicDir: false` (do not wipe or duplicate the standalone build).
  - `define: { 'process.env.NODE_ENV': '"production"' }` (lib mode does not replace it).
  - `rollupOptions.output.inlineDynamicImports: true`, `cssCodeSplit: false`: single file, no chunk graph.
  - `base: './'`, env modes identical to the standalone build so `VITE_API_BASE_URL` is baked per env.
- `package.json`: chain the embed build after the standalone build for every mode script (`build:development`, `build:staging`, `build:production`, `build:pxt`). `Jenkinsfile` already calls `npm run build:<mode>` and `Dockerfile.ocp` already copies `dist/`, so no pipeline change is expected.
- Size budget: the module should stay within about 90 KB gzip (standalone JS + CSS is about 81 KB today). Investigate anything above 100 KB.

### 6.6 nginx and edge
Add to `infra/nginx/default.conf`, above the `.js` regex location:

```
location ^~ /embed/ {
    add_header Cache-Control "no-cache";
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

- `^~` is required so the existing regex `\.(js|css|...)$` (one-year cache) is not applied to this file.
- Repeat the security headers: nginx `add_header` in a location replaces headers inherited from the server level.
- `no-cache` means revalidate with the ETag on each load (a small 304), once per game session because the game memoizes the import.
- No CORS headers: consumers are same-origin. (Revisit only if a cross-origin consumer appears.)
- Assumption to confirm: the edge strips the `/history` prefix (the current nginx config has no `/history` location and `/history/assets/*.js` returns 200), so `/history/embed/v1/...` maps to nginx `/embed/v1/...`.
- Acceptance: two `curl -I` calls on the module URL and a redeploy test (section 10) confirming Cloudflare revalidates or bypasses instead of serving a stale copy.

## 7. Games changes (`feg_games_assets/common`, shared by every game)

### 7.1 `panel/ts/RoundDetailsModal.ts` (new)
Exports `prefetchRoundDetails()`, `openRoundDetails(roundId)`, `closeRoundDetails()`.
- Module URL from `window.getExternalHistoryURL()`, normalized to end with `/`. Reads `window.getToken()` and `window.getGameLang()` at open time.
- Loader: a single memoized promise. Timeout 10 s (`Promise.race`; an in-flight import cannot be aborted, a late success is simply kept).
- Retry uses a cache-busting query (`?r=<n>`) because browsers may remember a failed dynamic import per URL for the life of the document (assumption, verify on target webviews). The element registration guard in 5 makes a second evaluation safe.
- Host container: `<div id="roundDetailsHost">` appended to `document.body`, `position: fixed; inset: 0; z-index` above the panel's 10000, so it is not destroyed by `#gameRulesPanel.innerHTML = ''` and not clipped by its `overflow: hidden`.
- Spinner while loading: reuse the panel's existing `assets/images/loader.webp` look.
- Failure UI (module load failure, timeout, or `rh-error`): short message, **Retry**, and **Open in browser**. "Open in browser" runs today's `window.open(<same external URL>, '_blank')` and only on a player tap. The game never exits the app silently.
- Strings via `getCommonText(key, englishFallback)` (already supports an English fallback): `roundDetailsLoadError`, `retry`, `openInBrowser`. Translations can follow.
- Double-open guard; opening while already open is ignored.

### 7.2 `panel/ts/HistoryPanel.ts`
- `createRow`: remove the inline `onclick="window.open(...)"`. The `>` buttons get `data-round-id`.
- One delegated click listener on `#tableBody`, installed in `initHistoryFetch()` (already idempotent): plays `window.playHistoryRulesSound?.()`, then `openRoundDetails(roundId)`.
- Keep the external URL builder (token, language, roundId) as a helper used only by the fallback.
- After the first successful `appendRows`, schedule `prefetchRoundDetails()` with `requestIdleCallback` (fallback `setTimeout`). Pixi is already stopped at that point.

### 7.3 `panel/ts/SlotRuleLoader.ts`
- `cleanupPanels()` calls `closeRoundDetails()` before tearing down the DOM (step 4), so the React root unmounts and the host is removed when the player closes the panel.

### 7.4 `panel/ts/zoomDisable.ts`
- Add `round-history-viewer` to `INTERACTIVE_SELECTOR`.
- Reason: Shadow DOM retargets `e.target` to the host element at document level, so `closest(selector)` fails and the blocker cancels touchstart/touchend and captures clicks that come within 350 ms of the previous one. Rapid taps inside the viewer (tabs, next spin) would be swallowed. With the host in the selector they are treated as interactive. The two-finger pinch block is unaffected.

### 7.5 Back button
- On open: `history.pushState({ roundDetails: true }, '')` and a `popstate` listener that closes the modal.
- On close by other means (X, panel close): if our state is on top, call `history.back()` once, guarded so the resulting `popstate` does not re-enter.
- Best effort. Controlled by a single constant so it can be switched off if an operator shell misbehaves. There is no other back handling in the game to conflict with.

### 7.6 Sound
- `SoundServiceProxy.ts` iOS `interrupted` workaround stays as is. With no tab switch, the audio interruption should no longer occur; confirm on iOS (section 10).

## 8. CMS changes (`feg_slot_cms_fe`)

### 8.1 Scope and guarantees
- The CMS round-details modal switches from an iframe to the element. It has a single consumer: `src/pages/reports/transaction-details.tsx` (`isBetHistoryOpen` state around line 427, gating `showBetHistory` / `canReplay` around 485-486, `BetRoundHistoryModal` around 987).
- **Compatibility guarantee (hard requirement):** the standalone URL contract of `game_history_fe` is preserved. The embed is an additional entry built from the same components. Existing links, the CMS "Open in new tab" button, and the game's "Open in browser" fallback depend on it.
- CMS (`/`) and history (`/history/`) are same-origin per deployed env, so the module import needs no CORS.
- No new env var. The module URL is derived from the existing `VITE_BET_HISTORY_PAGE_BASE_URL` (absolute per env: `https://gaming-studio.test.spiniq.io/history/`, `https://gaming-studio.stage.spiniq.io/history/`, `https://gaming-studio.spiniq.io/history/`).
- Benefit: the token no longer travels in an iframe URL, and CMS and games share one deployed module.

### 8.2 Files

| File | Change |
|---|---|
| `src/lib/bet-history.ts` | Add `buildBetHistoryModuleUrl()`: `new URL('embed/v1/round-history-viewer.js', <base with trailing '/'>)`. Keep `buildBetHistoryUrl` (used by "Open in new tab"), `canViewBetHistory`, `isBetHistoryConfigured`. |
| `src/lib/bet-history-module.ts` (new) | `loadRoundHistoryViewer()`: memoized `import(/* @vite-ignore */ url)`, 10 s timeout, retry with `?r=<n>`. `prefetchRoundHistoryViewer()` for idle prefetch. Same behavior as the game loader (section 7.1). |
| `src/components/reports/bet-round-history-modal.tsx` | Replace the iframe area with an imperative element host. Keep header, badges, zoom, fullscreen, reload, open in new tab. |
| `src/pages/reports/transaction-details.tsx` | Idle prefetch when `showBetHistory && canReplay`. |
| `.env.*` | No change. |

### 8.3 Element host in the modal
- Imperative host, not JSX: a `useEffect` creates `document.createElement('round-history-viewer')`, sets attributes `round-id` and `hide-close`, sets the `token` property, appends it to a container ref, listens for `rh-error`, and removes it on cleanup. This avoids `IntrinsicElements` typing (none declared in the CMS) and React 18's lack of custom-element property support.
- Token: `storedToken || apiClient.getTokens().token`, exactly as today, passed as a property only.
- Language: no `lang` attribute. The CMS has no language setting and today's iframe URL carries none, so the viewer defaults to `en`.
- `hide-close` is set because the dialog header already has a close button.
- Container: `relative h-full w-full`; the element fills it (`:host` is `display: block; width: 100%; height: 100%`).

States:

| State | UI |
|---|---|
| Not configured, no roundId, no token | Existing error copy, unchanged |
| Module loading | CMS spinner "Loading bet round history..." |
| Module ready | CMS spinner removed; the viewer shows its own loading and error cards |
| Module load failure, 10 s timeout, or `rh-error` | Error panel with **Retry** (re-import with `?r=`, remount) and **Open in new tab** |

Removed: the 15 s slow-frame hint (an iframe framing guess), the iframe `onLoad`/`onError` handlers, `sandbox`, and `referrerPolicy`.

Controls:
- Zoom: same wrapper transform. The embed overlay is `absolute` (section 6.3), so a transformed ancestor is safe.
- Fullscreen: unchanged.
- Reload: remounts the element by key; it does not re-import the module.
- Open in new tab: unchanged, uses `buildBetHistoryUrl` (the token is in that URL by necessity, as today).
- Reset on close: the existing reset effect also clears the module states; the element is removed on close.

### 8.4 Radix Dialog interaction (spike first)
Radix Dialog 1.1.x in modal mode uses a scroll lock (`react-remove-scroll`) and a focus trap. Events from inside a shadow root are retargeted to the host at document level, so the scroll lock may misjudge whether the viewer can scroll and cancel wheel or touch scrolling inside it. This is the same class of problem as the game's touch blocker. **Not verified** (`node_modules` was not inspected).

The first CMS task is a spike: scroll (wheel and touch) inside a long round, such as free spins, in the modal at desktop and mobile widths, and check Tab and Esc. If scrolling is blocked, mitigate with native `wheel` and `touchmove` listeners on the container that call `stopPropagation()` in the bubble phase, so they never reach the lock's document listeners.

### 8.5 Local development
`.env.development` points to `https://gaming-studio.test.spiniq.io/history/`. From `http://localhost:3000` the module import is cross-origin and fails (no CORS by design). The iframe would already have been refused from `http://localhost` by `frame-ancestors https:` (an `http:` ancestor does not match), so this is not a regression: the modal shows the error panel with "Open in new tab". Optional dev aid, not required: a Vite `server.proxy` for `/history` to the test host plus a same-origin `VITE_BET_HISTORY_PAGE_BASE_URL` in `.env.local`. API CORS from the localhost origin still depends on `LOBBY_ALLOWED_ORIGINS` (empty allows all).

### 8.6 Bundle, rollout, rollback
- Nothing is added to the CMS bundle. The module loads lazily on first open (about 72 KB gzip JS plus 8.7 KB gzip CSS).
- The module runs its own React 19 in the shadow root next to the CMS's React 18. They share no state or context.
- Rollout: after the module is live on that env. Rollback: revert the CMS build, which brings the iframe modal back; the module stays harmless.

## 9. Risks and mitigations

| # | Risk | Severity | Mitigation | Where |
|---|---|---|---|---|
| 1 | Game touch blocker eats taps inside Shadow DOM | High | Add host tag to `INTERACTIVE_SELECTOR` | 7.4 |
| 2 | Fixed-name module cached for a year (`max-age=31536000`), so deploys would not reach clients | High | `location ^~ /embed/` with `no-cache`; verify Cloudflare behavior | 6.6 |
| 3 | Version skew: game bundles stay cached in webviews, module updates instantly | Med-High | Versioned path `v1`, additive-only, game pins `v1` | 5 |
| 4 | CSS leakage in both directions, inherited properties from the game | Med | `:host { all: initial }`, split page-level CSS, visual parity check | 6.3 |
| 5 | Relative asset paths break inside a game page (404 on symbols, locales, frame) | Med | Central `resolveAsset` from module-derived base, absolute URLs | 6.4 |
| 6 | Module runs in the game's JS realm; `SlotRuleLoader.ts` swallows errors whose message contains "panel" or "history"; prod console disabled | Med | Error boundary plus `rh-error`, visible retry UI in the modal | 5, 7.1 |
| 7 | Android hardware back or iOS swipe-back leaves the game with the modal open | Med | `pushState`/`popstate` close, switchable constant, device test | 7.5 |
| 8 | A bad history deploy reaches all games at once | Med | Versioned path, rollback by redeploy, smoke test on test env first | 11 |
| 9 | Modal leaks React root or host after panel teardown | Low-Med | `cleanupPanels()` hook, fresh element per open | 7.3 |
| 10 | Second Vite build clobbers the standalone output | Low | `emptyOutDir: false`, `copyPublicDir: false`, chained scripts | 6.5 |
| 11 | Standalone regression from the props refactor | Low-Med | Standalone entry stays a thin wrapper; regression check | 6.1, 10 |
| 12 | Speed gain over an iframe is modest (same bytes) and unmeasured | Info | Measure on device (section 10); report, then agree thresholds | 10 |
| 13 | Radix Dialog scroll lock or focus trap misbehaves with Shadow DOM content in the CMS modal (unverified) | Med | Spike first; `stopPropagation` listeners on the container if needed | 8.4 |
| 14 | CMS modal unusable while the history host or module is unavailable | Low | Error panel with Retry and Open in new tab | 8.3 |

## 10. Verification (manual, no unit tests per project rule)

Functional
- Open from portrait and landscape rows; close with the viewer `X`; close the History panel while the modal is open; two rapid taps on tabs inside the viewer both register.
- Round types: base game, free spins, tumble/cascade, pick feature. Compare standalone vs embed screenshots for the same rounds (frame image, symbols, layout).
- Language: `en` plus one non-en language loads its locale.
- Errors: unknown roundId and expired token show the viewer's own error card; blocking the module URL shows Retry and Open in browser; offline behaves the same.

Platforms
- iOS WKWebView in a Capacitor shell, iOS Safari, Android WebView, desktop Chrome and Safari.
- Orientation change with the modal open; notch safe areas; audio still works after closing on iOS; Pixi resumes correctly after closing the panel.

Deploy and cache
- Deploy a new module build, then reload a client that had the previous one: the new file is used within the same session load.
- `curl -I` on the module twice: check `cache-control` and `cf-cache-status` (revalidated or bypassed, not a stale hit).
- Standalone `/history/?token=...&roundId=...` is unchanged (existing links, CMS "Open in new tab", game fallback).

CMS (test env, after the module and the CMS build are deployed)
- Transaction details, status `credit_completed`: open Bet Round History. It renders like the previous iframe view for base game, free spins, tumble, and pick feature (compare screenshots).
- Zoom in, out, and reset; fullscreen; reload; open in new tab; the dialog close button. The viewer's own `X` is hidden.
- Wheel and touch scrolling inside a long round works inside the Radix modal; Tab and Esc behave (section 8.4 spike).
- Missing token, unconfigured base URL, and non-replayable status show the existing messages.
- With the module URL blocked: the error panel shows Retry and Open in new tab.
- Close and reopen: fresh state (zoom 100%, no stale content).

Performance (report, do not gate)
- Tap to first rendered round content, cold (no prefetch) and warm (prefetched), on one mid-range Android and one iPhone. Thresholds to be agreed after the first numbers.

## 11. Rollout, rollback, deferred

Rollout order
1. History: ship the embed build and nginx rule to test; verify module URL, headers, cache behavior.
2. Games: ship the `common` change with the next game builds on test; run the device matrix.
3. CMS: ship the modal change to test once step 1 is live; run the CMS checks.
4. Stage, then prod, per app as normal (history first, then games and CMS).

Rollback
- Game side: revert the build; behavior returns to `window.open`. The module stays deployed and harmless.
- Module side: redeploy the previous history image; the fixed URL revalidates and serves the old file.
- CMS side: revert the CMS build; the iframe modal returns.

Deferred (not in this spec)
- Preact alias in the embed build (build-only, contract-neutral; consider after size measurement).
- Passing a language from the CMS (it has no language setting today; the viewer defaults to `en`).
- npm packaging (`@pixentech` scope on `gaming-studio-npm`; consumers lack scope mapping).
- Iframe renderer or fallback.
- Closed shadow root, `adoptedStyleSheets`.

## 12. Open items to confirm during implementation

- Edge strips the `/history` prefix, so nginx sees `/embed/v1/...`.
- Cloudflare treatment of `Cache-Control: no-cache` on this path (may need a cache rule).
- Whether target webviews remember a failed dynamic import per URL (drives the `?r=` retry).
- Prod games host is `gaming-studio.spiniq.io/slot-games/` (same origin as history).
- Back-button behavior inside real operator shells; whether some shells need the constant off.
- Whether the runtime config file (`assets/env/commonConfig.json`, served `no-store` by the games nginx) can carry a kill-switch flag for in-app round details.
- Confirm with certification or compliance owners that loading first-party code at runtime into the game page is acceptable for the game client.
- Translations for the three new host UI strings.
- Ownership of the Cloudflare header rule that replaced `X-Frame-Options` (the repo nginx configs still say `SAMEORIGIN`).
- Radix Dialog scroll lock and focus trap with Shadow DOM content in the CMS modal (section 8.4).
- Whether the viewer's full-bleed gradient overlay looks acceptable inside the CMS dialog area (visual check with the CMS screenshots).

## 13. Suggested implementation order (risk first; detailed plan comes next)

1. Embed build, nginx rule, and a trivial element on test: prove the URL, headers, and cache/redeploy behavior.
2. Props refactor and `resolveAsset`; standalone regression check.
3. CSS scoping and visual parity of the element in a plain test page.
4. Game modal, row wiring, cleanup hook, touch-blocker fix, back button.
5. CMS modal: spike the Radix scroll lock first, then element host, states, controls, prefetch.
6. Device matrix and performance numbers.

Project rules that apply during implementation: no unit tests, no project builds unless asked, no em dashes in code, comments or docs, one-line comments only for non-obvious logic, use `react-specialist` for the history repo and `typescript-pro` for the game TypeScript, no git worktrees without explicit confirmation.
