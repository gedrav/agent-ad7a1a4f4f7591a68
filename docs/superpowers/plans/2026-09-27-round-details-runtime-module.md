# Round Details Runtime Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show round details inside the game (and inside the CMS) as an in-page overlay backed by a single shared web component, so players never leave the app and `game_history_fe` stays the one source of truth for the round view.

**Architecture:** `game_history_fe` gains a props-driven shared viewer, a `<round-history-viewer>` custom element (Shadow DOM) built as one versioned ES module, and a `no-cache` nginx rule so redeploys reach clients immediately. The game and the CMS both `import()` that module at runtime, mount the element inside their own overlay/dialog chrome, and fall back to today's `window.open` if the module fails to load.

**Tech Stack:** React 19 (`game_history_fe`), TypeScript/Pixi (games, no framework), React 18 + Radix Dialog (CMS), Vite 5/6 for all three.

**Spec:** `docs/superpowers/specs/2026-09-27-round-details-runtime-module-design.md` (same repo). This plan implements that spec; read both together.

## Global Constraints

- No unit tests. Every "verify" step below is manual (curl, browser, devtools) per the project's CLAUDE.md and the spec's section 10.
- No em dashes anywhere in code, comments, or docs. Use a colon or hyphen.
- Comments: max one line, only where the "why" isn't obvious from the code. Do not comment every statement.
- Do not run a project build unless a step below explicitly says to.
- The standalone URL contract (`<history host>/?token=&roundId=&lang=`) must keep working exactly as today. It is the compatibility guarantee both CMS's "Open in new tab" and the game's fallback depend on.
- Element contract v1 (fixed for this plan): tag `round-history-viewer`; attributes `round-id`, `lang`, optional `api-base`, `asset-base`, `hide-close`; property `token` (never an attribute, never in a URL); events `rh-close` and `rh-error` (`detail: { message }`), both `bubbles: true, composed: true`.
- No new environment variables. The module URL and asset base are derived from the existing `VITE_EXTERNAL_HISTORY_URL` (games) and `VITE_BET_HISTORY_PAGE_BASE_URL` (CMS).
- On any load or render failure, both the game and CMS must offer a player-initiated `window.open` to the existing external URL. Never fail silently and never auto-redirect out of the app.
- Games code changes live only under `feg_games_assets/common/panel/ts/` (shared by every game; one deploy updates all of them). Do not touch any per-game folder.
- Use the `react-specialist` agent for `game_history_fe` and CMS React work, `typescript-pro` for the games TypeScript work, and `code-reviewer` for review, per the user's tooling preference. Fall back to `general-purpose` only if those are unavailable.
- No git worktrees without the user's explicit, separate confirmation.

## Review Focus

- **Double-tap before the module resolves:** a player (or a CMS user) taps the row/round twice in quick succession while the module is still loading. Both the game (`isOpen` guard in Task 4) and CMS (retry uses the same in-flight promise in Task 6) must not start a second load or open a second overlay.
- **Closing while the fetch or module load is in flight:** the player closes the History panel (game) or the dialog (CMS) before the round data or the module has resolved. No console error, no "update state after unmount" warning, no orphaned host element left in the DOM.
- **Token empty or expired at the moment of open**, not just missing at page load (e.g. a CMS session that expired while the transaction list was open). The viewer's own error card must show, not an infinite spinner.
- **A locale other than `en` whose file 404s on the deployed host.** `loadContent` must fall back to `en` through the same resolved asset base as the primary request, not a broken relative path.
- **Retrying after a load failure must not silently reuse the same failed request.** The `?r=` cache-busting query on retry (game and CMS loaders) must actually produce a different URL each time, not the same one the browser already has a rejected result for.

---

### Task 1: Centralize asset resolution

**Files:**
- Create: `game_history_fe/src/lib/assetBase.js`
- Modify: `game_history_fe/src/app/constants/symbolImageMap.js`
- Modify: `game_history_fe/src/app/constants/config.js`
- Modify: `game_history_fe/src/app/components/PickFeatureView.jsx`

**Interfaces:**
- Produces: `resolveAsset(path: string): string` and `setAssetBase(url: string | null): void` from `src/lib/assetBase.js`. `resolveAsset` returns an absolute URL for a relative path, resolved against whatever base was last set (or `document.baseURI` if none was set, which is exactly today's standalone behavior). `getSymbolImageMap(gameAlias, gameName)` keeps its existing signature but now returns absolute URLs. `loadContent(lang)` keeps its existing signature and behavior.
- Consumes: nothing new (browser `URL`/`document.baseURI`).

- [ ] **Step 1: Create the asset base helper**

```js
// game_history_fe/src/lib/assetBase.js
// Resolves relative asset paths (symbols, locale files, the frame image)
// against the current asset base, so they work standalone, embedded in a
// game, and embedded in the CMS. See docs/superpowers/specs/2026-09-27-round-details-runtime-module-design.md section 6.4.
let assetBase = null;

export function setAssetBase(url) {
  assetBase = url ? String(url) : null;
}

export function resolveAsset(path) {
  if (!path) return '';
  const clean = String(path).replace(/^\//, '');
  return new URL(clean, assetBase || document.baseURI).href;
}
```

- [ ] **Step 2: Route `symbolImageMap.js` through `resolveAsset`**

In `game_history_fe/src/app/constants/symbolImageMap.js`, add the import near the top:

```js
import { resolveAsset } from '../../lib/assetBase';
```

Rename the existing `getSymbolImageMap` function to `getRawSymbolImageMap` (keep its body exactly as-is), then add a new `getSymbolImageMap` that resolves every value:

```js
// Resolves every path in the map to an absolute URL against the current
// asset base, so images load whether this app runs standalone or embedded.
export const getSymbolImageMap = (gameAlias, gameName) => {
  const raw = getRawSymbolImageMap(gameAlias, gameName);
  const resolved = {};
  for (const [key, value] of Object.entries(raw)) {
    resolved[key] = resolveAsset(value);
  }
  return resolved;
};
```

Only `getSymbolImageMap` stays exported; `getRawSymbolImageMap` and `resolveSymbolKey` keep their current export/no-export status (`resolveSymbolKey` is already exported, keep it that way; `getRawSymbolImageMap` is internal, do not export it).

- [ ] **Step 3: Route `config.js` locale loading through `resolveAsset`**

In `game_history_fe/src/app/constants/config.js`, add the import:

```js
import { resolveAsset } from '../../lib/assetBase';
```

Replace the body of `loadContent`:

```js
export const loadContent = async (lang) => {
  currentLanguage = lang;
  try {
    const filename = lang === 'en' ? 'commonContent.json' : `commonContent_${lang}.json`;
    const url = resolveAsset(`locales/${lang}/${filename}`);

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const module = await response.json();
    setContent(module);
  } catch (error) {
    console.warn(`[I18N] Failed to load language '${lang}', falling back to 'en'`, error);
    try {
      const fallbackResponse = await fetch(resolveAsset('locales/en/commonContent.json'));
      const fallback = await fallbackResponse.json();
      setContent(fallback);
    } catch (e) {
      console.error("[I18N] Failed to load fallback 'en'", e);
    }
  }
};
```

- [ ] **Step 4: Route `PickFeatureView.jsx` through `resolveAsset`**

In `game_history_fe/src/app/components/PickFeatureView.jsx`, replace the import block and delete the local `getAsset` helper:

```jsx
import React from "react";
import { formatCurrency, getContent } from "../constants/config";
import { resolveAsset } from "../../lib/assetBase";
import "./styles/pickfeatureview.css";

const PickFeatureView = ({ features, currency, symbolImageMap, gameAlias, baseBetAmount }) => {
  if (!features || features.length === 0) return null;
```

Then replace every remaining call to `getAsset(` with `resolveAsset(` in this file (there are 6: the tier legend icon, the "Hidden" pick tile, the pick-tile family icon, the two `meowmeowmeow` wheel images, and the direct-win family icon). `resolveAsset` and `getAsset` have the same `(path) => absoluteUrl` shape, so this is a plain rename at each call site.

- [ ] **Step 5: Manually verify**

Run `cd game_history_fe && npm run dev`, then open (adjust the dev API host if your `.env.development` differs):

`http://localhost:5173/?token=<a valid dev token>&roundId=<a completed round with free spins and, ideally, a pick feature and a highlighted/wild symbol>`

Confirm in the browser:
- Symbol images render in the base game, free spins, and (if present) pick feature tabs.
- Network tab shows symbol image requests going to the dev history host, not 404s.
- Add `&lang=cs` to the URL and reload: the page text switches to Czech (confirms `resolveAsset` still finds `locales/cs/commonContent_cs.json`).
- Temporarily change one real locale filename on disk (or use devtools request blocking) to force the `cs` fetch to fail, reload with `&lang=cs`, and confirm the page still renders in English (the fallback fetch also resolves correctly). Undo the temporary change afterward.

- [ ] **Step 6: Commit**

```bash
git add game_history_fe/src/lib/assetBase.js game_history_fe/src/app/constants/symbolImageMap.js game_history_fe/src/app/constants/config.js game_history_fe/src/app/components/PickFeatureView.jsx
git commit -m "feat(history): centralize asset resolution behind resolveAsset"
```

---

### Task 2: Refactor BetHistoryViewer into a props-driven shared component

**Files:**
- Modify: `game_history_fe/src/app/BetHistoryViewer.jsx`
- Modify: `game_history_fe/src/App.jsx`
- Modify: `game_history_fe/src/app/betHistoryViewer.css`

**Interfaces:**
- Consumes: nothing from Task 1 directly (this component doesn't touch assets itself; `SlotResultDisplay` and its children already do, via Task 1).
- Produces: `BetHistoryViewer({ roundId, token, lang = "en", apiBase = import.meta.env.VITE_API_BASE_URL, hideClose = false, embedded = false, onClose, onLoaded })` as the default export. `App.jsx` becomes the standalone-only URL-parsing wrapper (not exported for reuse). New CSS classes `bhv-cover` and `bhv-embed` in `betHistoryViewer.css`, consumed by Task 3's embed entry.

- [ ] **Step 1: Rewrite `BetHistoryViewer.jsx` to take props instead of reading the URL**

Replace the full file:

```jsx
import { useEffect, useState, useRef } from "react";
import SlotResultDisplay from "./components/SlotResultDisplay";
import "./betHistoryViewer.css";
import { getContent, loadContent } from "./constants/config";
import { preloadGameAssets } from "./utils/assetPreloader";

export default function BetHistoryViewer({
  roundId,
  token,
  lang = "en",
  apiBase = import.meta.env.VITE_API_BASE_URL,
  hideClose = false,
  embedded = false,
  onClose,
  onLoaded,
}) {
  const [roundData, setRoundData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [langLoaded, setLangLoaded] = useState(false);
  const [error, setError] = useState(null);

  const containerRef = useRef(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!roundId) {
      loadContent(lang).then(() => {
        if (cancelled) return;
        setLangLoaded(true);
        setError({ title: getContent("error"), message: getContent("roundIdRequired") });
        setLoading(false);
      });
      return () => { cancelled = true; };
    }

    (async () => {
      try {
        const apiUrl = `${apiBase}/${roundId}`;
        const requestOptions = {
          method: 'GET',
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            ...(token && { "Authorization": `Bearer ${token}` })
          }
        };

        const langPromise = loadContent(lang).then(() => {
          if (!cancelled) setLangLoaded(true);
        });

        const [res] = await Promise.all([
          fetch(apiUrl, requestOptions),
          langPromise
        ]);

        if (cancelled) return;

        if (!res.ok) {
          let errorTitle;
          let errorMessage;
          try {
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const errorJson = await res.json();
              if (errorJson.title) errorTitle = errorJson.title;
              if (errorJson.message) errorMessage = errorJson.message;
              else errorMessage = JSON.stringify(errorJson, null, 2);
            } else {
              errorMessage = await res.text();
            }
          } catch (e) {
            errorMessage = getContent("unableToReadError");
          }
          const err = new Error(errorMessage || `HTTP ${res.status}`);
          if (errorTitle) err.title = errorTitle;
          throw err;
        }

        const detail = await res.json();

        if (!detail) throw new Error(getContent("dataNotFound"));

        // Preload assets for this game before showing the UI
        await preloadGameAssets(detail.gameAlias, detail.gameName);

        if (cancelled) return;
        setRoundData(detail);
        onLoaded?.(detail);
      } catch (err) {
        if (cancelled) return;
        setError({
          title: err.title || getContent("error"),
          message: err.message
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [roundId, token, lang, apiBase]);

  useEffect(() => {
    if (!loading && !error && roundData && containerRef.current) {
      const imgs = Array.from(containerRef.current.querySelectorAll('img'));
      const incomplete = imgs.filter(img => !img.complete);
      if (incomplete.length === 0) {
        setImagesLoaded(true);
      } else {
        let loadedCount = 0;
        const onImageLoad = () => {
          loadedCount++;
          if (loadedCount === incomplete.length) setImagesLoaded(true);
        };
        incomplete.forEach(img => {
          img.addEventListener('load', onImageLoad, { once: true });
          img.addEventListener('error', onImageLoad, { once: true });
        });
      }
    }
  }, [loading, error, roundData]);

  /* ---------- render ---------- */
  if (error) {
    const errorTitle = typeof error === 'object' && error.title ? error.title : getContent("error");
    const errorMessage = typeof error === 'object' && error.message ? error.message : String(error);

    return (
      <div className="container" style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="wrapper" style={{ width: '100%' }}>
          <div className="error-card main-error-card">
            <span className="error-icon">⚠️</span>
            <div className="error-content">
              <h4 className="error-title">{errorTitle}</h4>
              <p className="error-text">{errorMessage}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const coverClass = embedded ? "container bhv-cover bhv-embed" : "container bhv-cover";
  const overlayClass = embedded ? "modal-overlay bhv-embed" : "modal-overlay";

  return (
    <>
      {!langLoaded && (
        <div className={embedded ? "bhv-cover bhv-embed" : "bhv-cover"} style={{ background: 'var(--bg-color, #0b0c10)' }} />
      )}

      {(langLoaded && (loading || (roundData && !imagesLoaded))) && (
        <div className={coverClass} style={{ background: 'var(--bg-color, #0b0c10)' }}>
          <div className="wrapper">
            <div className="initializing-message">
              <div className="loading-spinner-ring" />
              <p>{getContent("loading")}</p>
            </div>
          </div>
        </div>
      )}

      {(!loading && roundData) && (
        <div
          className={overlayClass}
          ref={containerRef}
          style={{ opacity: imagesLoaded ? 1 : 0, transition: 'opacity 0.2s ease-in' }}
        >
          <div className="modal-content auto-height-modal">
            {!hideClose && (
              <button
                className="modal-close-button"
                onClick={() => onClose?.()}
                aria-label={getContent("close")}
              >
                X
              </button>
            )}
            <div className="modal-content-container">
              <SlotResultDisplay roundData={roundData} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

Changes from the original: URL/`useSearchParams` reading is gone (moved to `App.jsx`); `session`/`server` are gone (they were already unused outside the effect's dependency list); `handleClose` (`window.close()`/`about:blank`) is gone (moved to `App.jsx`'s `onClose`); a `cancelled` guard stops state updates after the component unmounts mid-fetch (Review Focus: closing while a fetch is in flight); `hideClose` conditionally hides the built-in close button; `embedded` swaps three fixed-position containers to classes so Task 3 can override their positioning without touching this file again.

- [ ] **Step 2: Add the new CSS classes**

In `game_history_fe/src/app/betHistoryViewer.css`, add after the existing `.modal-overlay` rule (do not remove `.modal-overlay`, this is additive):

```css
.bhv-cover {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
}

/* The CMS applies a CSS transform (zoom) to an ancestor, which makes any
   fixed-position descendant fix relative to that ancestor instead of the
   viewport. Embedded contexts fill an already-positioned host, so absolute
   positioning is correct there regardless of an ancestor transform. */
.bhv-embed.modal-overlay,
.bhv-embed.bhv-cover {
  position: absolute;
}
```

- [ ] **Step 3: Rewrite `App.jsx` as the standalone URL wrapper**

Replace the full file:

```jsx
import { Suspense } from "react";
import "./App.css";
import BetHistoryViewer from "./app/BetHistoryViewer";
import { getContent } from "./app/constants/config";
import { useSearchParams } from "./hooks/useUrlParams";

function App() {
  const [searchParams] = useSearchParams();

  let roundId = searchParams.get("id") || searchParams.get("roundId") || searchParams.get("roundid");
  if (roundId && roundId.includes('$')) {
    roundId = roundId.split('$')[0];
  }
  const token = searchParams.get("token");
  const lang = searchParams.get("lang") || searchParams.get("language") || "en";

  const handleClose = () => {
    if (typeof window !== "undefined") {
      window.close();
      // fallback for hosts that refuse to close a tab they didn't open
      setTimeout(() => (window.location.href = "about:blank"), 100);
    }
  };

  const handleLoaded = (detail) => {
    if (detail?.gameName) document.title = detail.gameName;
  };

  return (
    <div className="app-container">
      <Suspense fallback={<div>{getContent("loadingDots")}</div>}>
        <BetHistoryViewer
          roundId={roundId}
          token={token}
          lang={lang}
          onClose={handleClose}
          onLoaded={handleLoaded}
        />
      </Suspense>
    </div>
  );
}

export default App;
```

- [ ] **Step 4: Manually verify (standalone regression)**

Run `cd game_history_fe && npm run dev`, open the same URL as Task 1's verification (`?token=...&roundId=...`), and confirm:
- Page renders identically to before this task (spinner, then the round modal, close button visible).
- Browser tab title changes to the game's name.
- Clicking the `X` closes the tab (or navigates to `about:blank` if the browser refuses to close it).
- Opening with no `roundId` in the URL shows the "roundId is required" error card, exactly as before.

- [ ] **Step 5: Commit**

```bash
git add game_history_fe/src/app/BetHistoryViewer.jsx game_history_fe/src/App.jsx game_history_fe/src/app/betHistoryViewer.css
git commit -m "refactor(history): make BetHistoryViewer props-driven, move URL parsing to App"
```

---

### Task 3: Embed entry, element contract, build, and cache header

**Files:**
- Create: `game_history_fe/src/embed/ErrorBoundary.jsx`
- Create: `game_history_fe/src/embed/main.jsx`
- Create: `game_history_fe/vite.embed.config.js`
- Modify: `game_history_fe/package.json`
- Modify: `game_history_fe/infra/nginx/default.conf`
- Modify: `game_history_fe/src/app/components/styles/reeldisplay.css`
- Modify: `game_history_fe/src/app/components/styles/tumbleview.css`
- Modify: `game_history_fe/src/app/betHistoryViewer.css`

**Interfaces:**
- Consumes: `BetHistoryViewer` (Task 2), `setAssetBase`/`resolveAsset` (Task 1).
- Produces: the `round-history-viewer` custom element, registered as a side effect of loading `dist/embed/v1/round-history-viewer.js`. Contract: attributes `round-id`, `lang`, `api-base`, `asset-base`, `hide-close`; property `token`; events `rh-close`, `rh-error` (`detail: { message: string }`). This is what Task 4 and Task 7 load and mount.

- [ ] **Step 1: Add the frame-image CSS variable**

In `game_history_fe/src/app/components/styles/reeldisplay.css`, change line 117:

```css
  border-image: var(--rh-frame-image, url('/assets/common/UI_Frame.png')) 32 stretch;
```

In `game_history_fe/src/app/components/styles/tumbleview.css`, change line 214 the same way:

```css
  border-image: var(--rh-frame-image, url('/assets/common/UI_Frame.png')) 32 stretch;
```

Standalone never sets `--rh-frame-image`, so both keep using the existing root-relative URL exactly as today. The embed entry (Step 3 below) sets this variable to an absolute URL built from the asset base.

- [ ] **Step 2: Add shadow-root scrollbar theming**

In `game_history_fe/src/app/betHistoryViewer.css`, add directly after the existing `html { scrollbar-width: thin; scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track); }` block:

```css
/* :root and html selectors above don't match anything inside a shadow
   tree; this gives the embedded viewer the same themed scrollbars. */
:host {
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb, #ffffff) var(--scrollbar-track, #0a0a0a);
}
```

- [ ] **Step 3: Create the error boundary**

```jsx
// game_history_fe/src/embed/ErrorBoundary.jsx
import { Component } from "react";

// React has no hook-based error boundary; a class component is required.
// Catches render errors from BetHistoryViewer and reports them as an
// rh-error event instead of leaving the embed silently blank.
export class ViewerErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    this.props.onError?.(error?.message || String(error));
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
```

- [ ] **Step 4: Create the embed entry and custom element**

```jsx
// game_history_fe/src/embed/main.jsx
// Registers <round-history-viewer>: the same BetHistoryViewer, in a Shadow
// DOM, loaded at runtime by the game and the CMS. Contract (v1): attributes
// round-id / lang / api-base / asset-base / hide-close, property token,
// events rh-close / rh-error. See the design spec section 5.
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import BetHistoryViewer from "../app/BetHistoryViewer";
import { ViewerErrorBoundary } from "./ErrorBoundary";
import { setAssetBase } from "../lib/assetBase";
import indexCss from "../index.css?inline";
import betHistoryViewerCss from "../app/betHistoryViewer.css?inline";
import slotResultDisplayCss from "../app/components/styles/slotresultdisplay.css?inline";
import baseGameViewCss from "../app/components/styles/basegameview.css?inline";
import freeSpinsViewCss from "../app/components/styles/freespinsview.css?inline";
import reelDisplayCss from "../app/components/styles/reeldisplay.css?inline";
import tumbleViewCss from "../app/components/styles/tumbleview.css?inline";
import pickFeatureViewCss from "../app/components/styles/pickfeatureview.css?inline";

const TAG_NAME = "round-history-viewer";

// index.css's html/body/#root/:root rules match nothing inside a shadow
// tree (there is no real document root there), so only its *, a, h1 and
// button reset actually takes effect here; the rest safely no-ops.
const ALL_CSS = [
  indexCss,
  betHistoryViewerCss,
  slotResultDisplayCss,
  baseGameViewCss,
  freeSpinsViewCss,
  reelDisplayCss,
  tumbleViewCss,
  pickFeatureViewCss,
].join("\n");

function computeDefaultAssetBase() {
  return new URL("../../", import.meta.url).href;
}

class RoundHistoryViewerElement extends HTMLElement {
  static get observedAttributes() {
    return ["round-id", "lang", "api-base", "asset-base", "hide-close"];
  }

  constructor() {
    super();
    this._root = null;
    this._token = "";
    this._shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = ALL_CSS;
    this._shadow.appendChild(style);

    this._mount = document.createElement("div");
    this._mount.style.cssText = "width:100%;height:100%;";
    this._shadow.appendChild(style);
    this._shadow.appendChild(this._mount);
  }

  connectedCallback() {
    this._applyFrameImage();
    this._render();
  }

  disconnectedCallback() {
    this._root?.unmount();
    this._root = null;
  }

  attributeChangedCallback() {
    if (this._root) this._render();
  }

  set token(value) {
    this._token = value || "";
    if (this._root) this._render();
  }

  get token() {
    return this._token;
  }

  _resolvedAssetBase() {
    return this.getAttribute("asset-base") || computeDefaultAssetBase();
  }

  _applyFrameImage() {
    const assetBase = this._resolvedAssetBase();
    setAssetBase(assetBase);
    const frameUrl = new URL("assets/common/UI_Frame.png", assetBase).href;
    this.style.setProperty("--rh-frame-image", `url("${frameUrl}")`);
  }

  _render() {
    if (!this._root) this._root = createRoot(this._mount);

    const roundId = this.getAttribute("round-id") || "";
    const lang = this.getAttribute("lang") || "en";
    const apiBase = this.getAttribute("api-base") || import.meta.env.VITE_API_BASE_URL;
    const hideClose = this.hasAttribute("hide-close");

    this._root.render(
      createElement(
        ViewerErrorBoundary,
        {
          onError: (message) =>
            this.dispatchEvent(new CustomEvent("rh-error", { detail: { message }, bubbles: true, composed: true })),
        },
        createElement(BetHistoryViewer, {
          roundId,
          token: this._token,
          lang,
          apiBase,
          hideClose,
          embedded: true,
          onClose: () => this.dispatchEvent(new CustomEvent("rh-close", { bubbles: true, composed: true })),
        }),
      ),
    );
  }
}

if (!customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, RoundHistoryViewerElement);
}
```

Note the constructor appends `style` before `this._mount` is defined in the wrong order in a first draft; the version above appends `style` once (into `_shadow`) and then appends `_mount` once, giving the shadow root exactly two children: the `<style>` and the mount `<div>`.

- [ ] **Step 5: Create the embed build config**

```js
// game_history_fe/vite.embed.config.js
// Builds the embed entry as a single ES module (no chunk graph, CSS
// inlined via ?inline imports in main.jsx) at a fixed, versioned path.
// Run after the standalone build: emptyOutDir is false so it doesn't
// wipe what `vite build` (the default config) just produced.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  base: './',
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: 'dist/embed/v1',
    emptyOutDir: false,
    copyPublicDir: false,
    cssCodeSplit: false,
    lib: {
      entry: path.resolve(__dirname, 'src/embed/main.jsx'),
      name: 'RoundHistoryViewer',
      formats: ['es'],
      fileName: () => 'round-history-viewer.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
})
```

- [ ] **Step 6: Chain the embed build into every mode script**

In `game_history_fe/package.json`, change the four mode scripts (leave `"build"` and every other script untouched):

```json
"build:development": "vite build --mode development && vite build --config vite.embed.config.js --mode development",
"build:staging": "vite build --mode staging && vite build --config vite.embed.config.js --mode staging",
"build:production": "vite build --mode production && vite build --config vite.embed.config.js --mode production",
"build:pxt": "vite build --mode pxt && vite build --config vite.embed.config.js --mode pxt",
```

- [ ] **Step 7: Add the nginx cache rule**

In `game_history_fe/infra/nginx/default.conf`, add a new location (placement in the file doesn't affect precedence here since `^~` always wins over the regex location below it, but keep it near the top for readability):

```
location ^~ /embed/ {
    add_header X-Content-Type-Options  "nosniff" always;
    add_header Referrer-Policy         "strict-origin-when-cross-origin" always;
    add_header Cache-Control "no-cache";
}
```

- [ ] **Step 8: Manually verify the build and the element in isolation**

```bash
cd game_history_fe
npm run build:development
ls dist/embed/v1/round-history-viewer.js   # must exist
ls dist/index.html dist/assets              # standalone bundle must still exist
```

Serve the build locally (pick whichever is available):

```bash
npx serve dist -l 4173
```

Create a throwaway harness page in the project's `temp/` folder (do not commit it) at `game_history_fe/temp/embed-harness.html`:

```html
<!doctype html>
<html>
<body style="margin:0;height:100vh;background:#111;">
<script type="module">
  await import('http://localhost:4173/embed/v1/round-history-viewer.js');
  const el = document.createElement('round-history-viewer');
  el.setAttribute('round-id', 'PUT-A-REAL-COMPLETED-DEV-ROUND-ID-HERE');
  el.setAttribute('lang', 'en');
  el.token = 'PUT-A-VALID-DEV-TOKEN-HERE';
  el.style.cssText = 'display:block;width:100%;height:100%;';
  document.body.appendChild(el);
  el.addEventListener('rh-close', () => alert('rh-close fired'));
  el.addEventListener('rh-error', (e) => alert('rh-error: ' + e.detail.message));
</script>
</body>
</html>
```

Open `game_history_fe/temp/embed-harness.html` directly in a browser (or serve it from the same `serve` instance) and confirm:
- The round renders inside the element (symbols, frame highlight on a winning symbol if the test round has one, correct locale text).
- Network tab shows the round-data request going to the dev API host and symbol/frame images going to `http://localhost:4173/...` (the embed's asset base), not 404s.
- Setting `el.token = ''` before append (edit the harness temporarily) shows the viewer's own "session has ended"-style error card, not a blank screen or an infinite spinner (Review Focus: empty/expired token).
- No `rh-error` fires under normal conditions.

Then check headers (this only reflects the real deployed environment once the OpenShift build ships; local `serve`/`http.server` won't replicate nginx, so this specific check is a note for the deploying engineer, not something this step can fully close out):

```bash
curl -I http://localhost:4173/embed/v1/round-history-viewer.js
```

Delete `game_history_fe/temp/embed-harness.html` before committing (it is a throwaway QA artifact, not part of the shipped code).

- [ ] **Step 9: Commit**

```bash
git add game_history_fe/src/embed game_history_fe/vite.embed.config.js game_history_fe/package.json game_history_fe/infra/nginx/default.conf game_history_fe/src/app/components/styles/reeldisplay.css game_history_fe/src/app/components/styles/tumbleview.css game_history_fe/src/app/betHistoryViewer.css
git commit -m "feat(history): add round-history-viewer embed entry, build, and cache header"
```

---

### Task 4: Round-details modal for the game

**Files:**
- Create: `feg_games_assets/common/panel/ts/RoundDetailsModal.ts`

**Interfaces:**
- Consumes: the `round-history-viewer` element contract (Task 3); `window.getExternalHistoryURL()`, `window.getToken()`, `window.getGameLang()` (existing, `feg_games_src/src/corelib/utils/WindowUtil.ts`); `getCommonText(key, fallback)` (existing export from `./HistoryPanel`).
- Produces: `prefetchRoundDetails(): void`, `openRoundDetails(roundId: string): void`, `closeRoundDetails(fromPopstate?: boolean): void` from `RoundDetailsModal.ts`, used by Task 5.

- [ ] **Step 1: Create the module**

```ts
// RoundDetailsModal.ts
// Owns: loading the round-history-viewer element module at its versioned
// URL, the fixed overlay host, and its loading/error/retry UI. Games call
// prefetchRoundDetails/openRoundDetails/closeRoundDetails; SlotRuleLoader
// hooks prefetch and cleanup into the existing panel lifecycle (Task 5).

import { getCommonText } from './HistoryPanel';

const TAG_NAME = 'round-history-viewer';
const LOAD_TIMEOUT_MS = 10_000;

let modulePromise: Promise<void> | null = null;
let retryCount = 0;
let isOpen = false;
let hostEl: HTMLElement | null = null;
let currentEl: HTMLElement | null = null;
let popstateHandler: (() => void) | null = null;
let pushedState = false;

function moduleUrl(): string {
  const base = (window as any).getExternalHistoryURL?.() || '';
  const normalized = base.endsWith('/') ? base : `${base}/`;
  const cacheBust = retryCount > 0 ? `?r=${retryCount}` : '';
  return `${normalized}embed/v1/round-history-viewer.js${cacheBust}`;
}

function loadModule(): Promise<void> {
  if (modulePromise) return modulePromise;

  const url = moduleUrl();
  const timeout = new Promise<void>((_resolve, reject) => {
    setTimeout(() => reject(new Error('[RoundDetailsModal] module load timeout')), LOAD_TIMEOUT_MS);
  });

  modulePromise = Promise.race([
    import(/* @vite-ignore */ url).then(() => undefined),
    timeout,
  ]).catch((err) => {
    modulePromise = null; // allow the next attempt (retry) to re-import
    throw err;
  });

  return modulePromise;
}

/** Fire-and-forget: called once the first history rows have rendered. */
export function prefetchRoundDetails(): void {
  loadModule().catch(() => { /* silent: opening will retry and show the error UI */ });
}

function ensureHost(): HTMLElement {
  if (hostEl) return hostEl;
  hostEl = document.createElement('div');
  hostEl.id = 'roundDetailsHost';
  hostEl.style.cssText = 'position:fixed;inset:0;z-index:10500;display:none;';
  document.body.appendChild(hostEl);
  return hostEl;
}

function loadingMarkup(): string {
  return '<div style="display:flex;justify-content:center;align-items:center;width:100%;height:100%;background:rgba(0,0,0,0.9);"><img src="assets/images/loader.webp" alt="Loading" style="width:30px;height:40px;object-fit:contain;" /></div>';
}

function errorMarkup(): string {
  const message = getCommonText('roundDetailsLoadError', 'Could not load round details.');
  const retryLabel = getCommonText('retry', 'Retry');
  const openLabel = getCommonText('openInBrowser', 'Open in browser');
  return `
    <div style="display:flex;flex-direction:column;gap:16px;justify-content:center;align-items:center;width:100%;height:100%;background:rgba(0,0,0,0.95);color:#ffd700;font-family:sans-serif;text-align:center;padding:24px;">
      <span>${message}</span>
      <div style="display:flex;gap:12px;">
        <button id="roundDetailsRetry" style="padding:10px 20px;border-radius:8px;border:none;background:#ffd700;color:#000;font-weight:600;">${retryLabel}</button>
        <button id="roundDetailsOpenExternal" style="padding:10px 20px;border-radius:8px;border:1px solid #ffd700;background:transparent;color:#ffd700;">${openLabel}</button>
      </div>
    </div>`;
}

function openExternalFallback(roundId: string): void {
  const base = (window as any).getExternalHistoryURL?.() || '';
  if (!base) return;
  const token = (window as any).getToken?.() || '';
  const lang = (window as any).getGameLang?.() || 'en';
  const separator = base.indexOf('?') !== -1 ? '&' : '?';
  const url = `${base}${separator}token=${encodeURIComponent(token)}&language=${encodeURIComponent(lang)}&roundId=${encodeURIComponent(roundId)}`;
  window.open(url, '_blank');
}

function showErrorUI(roundId: string, onRetry: () => void): void {
  const host = ensureHost();
  currentEl?.remove();
  currentEl = null;
  host.innerHTML = errorMarkup();
  host.querySelector('#roundDetailsRetry')?.addEventListener('click', onRetry, { once: true });
  host.querySelector('#roundDetailsOpenExternal')?.addEventListener('click', () => openExternalFallback(roundId), { once: true });
}

function mountElement(roundId: string): void {
  const host = ensureHost();
  host.innerHTML = '';

  const el = document.createElement(TAG_NAME) as HTMLElement & { token?: string };
  el.setAttribute('round-id', roundId);
  el.setAttribute('lang', (window as any).getGameLang?.() || 'en');
  el.token = (window as any).getToken?.() || '';
  el.style.cssText = 'display:block;width:100%;height:100%;';

  el.addEventListener('rh-close', () => closeRoundDetails(false));
  el.addEventListener('rh-error', () => {
    if (!isOpen) return;
    showErrorUI(roundId, () => {
      retryCount += 1;
      loadAndMount(roundId);
    });
  });

  currentEl = el;
  host.appendChild(el);
}

function loadAndMount(roundId: string): void {
  const host = ensureHost();
  host.style.display = 'block';
  host.innerHTML = loadingMarkup();

  loadModule()
    .then(() => {
      if (!isOpen) return;
      mountElement(roundId);
    })
    .catch(() => {
      if (!isOpen) return;
      showErrorUI(roundId, () => {
        retryCount += 1;
        loadAndMount(roundId);
      });
    });
}

function attachBackHandler(): void {
  popstateHandler = () => {
    if (!isOpen) return;
    closeRoundDetails(true);
  };
  window.addEventListener('popstate', popstateHandler);
}

function detachBackHandler(): void {
  if (popstateHandler) {
    window.removeEventListener('popstate', popstateHandler);
    popstateHandler = null;
  }
}

export function openRoundDetails(roundId: string): void {
  if (isOpen || !roundId) return;
  isOpen = true;
  retryCount = 0;

  try {
    history.pushState({ roundDetails: true }, '');
    pushedState = true;
  } catch (_err) {
    pushedState = false;
  }
  attachBackHandler();

  loadAndMount(roundId);
}

export function closeRoundDetails(fromPopstate = false): void {
  if (!isOpen) return;
  isOpen = false;

  currentEl?.remove();
  currentEl = null;

  const host = ensureHost();
  host.style.display = 'none';
  host.innerHTML = '';

  detachBackHandler();

  if (pushedState && !fromPopstate) {
    pushedState = false;
    history.back();
  } else {
    pushedState = false;
  }
}
```

- [ ] **Step 2: Manually verify in isolation**

This module can't be exercised standalone yet (it needs `window.getExternalHistoryURL` etc., which only exist once a game is running), so defer functional verification to Task 5's step, which exercises it end-to-end inside a running game. For this task, verify only that the file compiles:

```bash
cd feg_games_src
GAME_ID=royale81 npx tsc --noEmit -p tsconfig.json 2>&1 | grep -i RoundDetailsModal || echo "no RoundDetailsModal errors"
```

(If the project's `tsconfig.json` doesn't cover `feg_games_assets` directly, confirm instead that `GAME_ID=royale81 npm run dev` starts without a Vite/esbuild error mentioning `RoundDetailsModal.ts`.)

- [ ] **Step 3: Commit**

```bash
git add feg_games_assets/common/panel/ts/RoundDetailsModal.ts
git commit -m "feat(games): add RoundDetailsModal loader/host for round-history-viewer"
```

---

### Task 5: Wire the modal into the game's history panel and lifecycle

**Files:**
- Modify: `feg_games_assets/common/panel/ts/HistoryPanel.ts`
- Modify: `feg_games_assets/common/panel/ts/SlotRuleLoader.ts`
- Modify: `feg_games_assets/common/panel/ts/zoomDisable.ts`

**Interfaces:**
- Consumes: `prefetchRoundDetails`, `openRoundDetails`, `closeRoundDetails` (Task 4).
- Produces: the game's `>` row buttons now call `openRoundDetails` instead of `window.open`; closing the History/rules panel now also closes the round-details overlay; rapid taps inside the overlay are no longer swallowed by the game's touch blocker.

- [ ] **Step 1: Simplify `createRow` in `HistoryPanel.ts`**

Change the function signature (drop the now-unused `token`, `extURL`, `lang` parameters):

```ts
  function createRow(b: any, fmt: (amt: number) => string): string {
```

Remove the URL-building block that follows it:

```ts
    let finalURL = extURL;
    if (finalURL) {
      const separator = finalURL.indexOf('?') !== -1 ? '&' : '?';
      finalURL = `${finalURL}${separator}token=${encodeURIComponent(token)}&language=${encodeURIComponent(lang)}&roundId=${encodeURIComponent(b.roundId)}`;
    }

    const openApp = `window.open('${finalURL}', '_blank')`;
```

Replace both occurrences of the action button markup:

```html
<button class="action-button" onclick="window.playHistoryRulesSound?.(); ${openApp}">›</button>
```

with:

```html
<button class="action-button" data-round-id="${b.roundId}">›</button>
```

(one inside `.portrait-top-right`, one inside `.actions-column`; both become identical since the click handler now lives in one delegated listener, not inline).

- [ ] **Step 2: Simplify the call site in `appendRows`**

Remove:

```ts
    const token = (window as any).getToken?.() || '';
    const extURL = (window as any).getExternalHistoryURL?.() || '';

    const rowsHTML = data.map(b => createRow(b, getFmt(b.currencyCode), token, extURL, lang)).join('');
```

Replace with:

```ts
    const rowsHTML = data.map(b => createRow(b, getFmt(b.currencyCode))).join('');
```

- [ ] **Step 3: Add the delegated click handler and the prefetch trigger in `initHistoryFetch`**

Add the import at the top of `HistoryPanel.ts`, alongside the existing `GameRulesPanel` import:

```ts
import { openRoundDetails, prefetchRoundDetails } from './RoundDetailsModal';
```

At the top of `initHistoryFetch()`, right after the idempotency guard, add the delegated handler and a prefetch flag:

```ts
export function initHistoryFetch(): void {
  if ((window as any).historyFetchInitialized) return;
  (window as any).historyFetchInitialized = true;

  const tableBody = document.getElementById('tableBody');
  tableBody?.addEventListener('click', (e: Event) => {
    const target = (e.target as HTMLElement).closest('[data-round-id]') as HTMLElement | null;
    if (!target) return;
    const roundId = target.getAttribute('data-round-id');
    if (!roundId) return;
    (window as any).playHistoryRulesSound?.();
    openRoundDetails(roundId);
  });

  let hasPrefetchedRoundDetails = false;
  let currentPage = 1;
```

(the rest of the existing `let` declarations and the function body continue unchanged below `let currentPage = 1;`).

At the end of `appendRows`, right after `hasMore = data.length >= 50;`, add:

```ts
    if (!append && !hasPrefetchedRoundDetails) {
      hasPrefetchedRoundDetails = true;
      const schedule = (window as any).requestIdleCallback || ((fn: () => void) => setTimeout(fn, 200));
      schedule(() => prefetchRoundDetails());
    }
```

- [ ] **Step 4: Hook cleanup into `cleanupPanels()` in `SlotRuleLoader.ts`**

Add the import at the top:

```ts
import { closeRoundDetails } from './RoundDetailsModal';
```

In `cleanupPanels()`, add the call right before the `// 4. Tear down DOM` comment:

```ts
  closeRoundDetails();

  // 4. Tear down DOM
  const gp = document.getElementById('gameRulesPanel');
```

- [ ] **Step 5: Fix the touch blocker in `zoomDisable.ts`**

Change `INTERACTIVE_SELECTOR`:

```ts
const INTERACTIVE_SELECTOR = `
  button, a, input, textarea, select,
  [onclick], [role="button"],
  .footer-item, .tab-button, [data-section],
  #close_btn, #h-close_btn, .close-btn,
  round-history-viewer
`;
```

(A tap event inside the shadow root is retargeted to the custom element at the document level, so `closest(selector)` needs the tag name here, or the game's double-tap/rapid-click guard cancels taps inside the viewer.)

- [ ] **Step 6: Manually verify end-to-end**

Requires the embed module from Task 3 to be reachable at the URL `getExternalHistoryURL()` resolves to for your dev env. If your dev history deploy doesn't have Task 3's build yet, run `game_history_fe`'s dev server or a local static build and temporarily point `.env.development`'s `VITE_EXTERNAL_HISTORY_URL` at it, or serve Task 3's `dist/` locally and use that URL instead; revert any temporary env change afterward.

```bash
cd feg_games_src
GAME_ID=royale81 npm run dev
```

Open the game, trigger a completed round with a known round ID, open the History panel, and confirm:
- Tapping `>` on a row opens the round details in-page (no new tab, no external browser).
- The X on the overlay (or the game's normal close control, depending on where you're testing from) closes it and returns to the game; Pixi resumes rendering.
- Closing the whole History panel while the round-details overlay is open also closes the overlay (no leftover element in devtools' Elements panel under `#roundDetailsHost`).
- Two rapid taps on a free-spins tab inside the overlay both register (not swallowed by the game's tap-debounce).
- Tapping `>` twice in quick succession opens only one overlay, not two (Review Focus: double-tap before the module resolves).
- With the module URL temporarily blocked (devtools request blocking on `embed/v1/round-history-viewer.js`), tapping `>` shows the Retry / Open in browser UI, and "Open in browser" opens the same URL the old `window.open` used.
- Android: physical back button closes the overlay instead of leaving the game or the panel. iOS: swipe-back gesture, if the shell supports it, does the same.

- [ ] **Step 7: Commit**

```bash
git add feg_games_assets/common/panel/ts/HistoryPanel.ts feg_games_assets/common/panel/ts/SlotRuleLoader.ts feg_games_assets/common/panel/ts/zoomDisable.ts
git commit -m "feat(games): open round details in-app via RoundDetailsModal"
```

---

### Task 6: Module loader for CMS

**Files:**
- Modify: `feg_slot_cms_fe/src/lib/bet-history.ts`
- Create: `feg_slot_cms_fe/src/lib/bet-history-module.ts`

**Interfaces:**
- Consumes: `config.betHistory.baseUrl` (existing, `feg_slot_cms_fe/src/lib/config.ts`).
- Produces: `buildBetHistoryModuleUrl(): string` (added to `bet-history.ts`); `loadRoundHistoryViewer(): Promise<void>`, `prefetchRoundHistoryViewer(): void`, `retryLoadRoundHistoryViewer(): Promise<void>` from the new `bet-history-module.ts`, used by Task 7.

- [ ] **Step 1: Add the module URL builder**

In `feg_slot_cms_fe/src/lib/bet-history.ts`, add after the existing `buildBetHistoryUrl` function (keep everything else in the file unchanged):

```ts
export function buildBetHistoryModuleUrl(): string {
  const base = config.betHistory.baseUrl
  if (!base) return ''
  const normalized = base.endsWith('/') ? base : `${base}/`
  return `${normalized}embed/v1/round-history-viewer.js`
}
```

- [ ] **Step 2: Create the loader**

```ts
// feg_slot_cms_fe/src/lib/bet-history-module.ts
// Loads the round-history-viewer custom element module from the history
// host. Mirrors the game's loader (RoundDetailsModal.ts in
// feg_games_assets/common/panel/ts) so both consumers share one deployed
// module and the same retry behavior.

import { buildBetHistoryModuleUrl } from './bet-history'

const LOAD_TIMEOUT_MS = 10_000

let modulePromise: Promise<void> | null = null
let retryCount = 0

function moduleUrl(): string {
  const base = buildBetHistoryModuleUrl()
  const cacheBust = retryCount > 0 ? `?r=${retryCount}` : ''
  return base ? `${base}${cacheBust}` : ''
}

export function loadRoundHistoryViewer(): Promise<void> {
  if (modulePromise) return modulePromise

  const url = moduleUrl()
  if (!url) return Promise.reject(new Error('Bet round history module is not configured'))

  const timeout = new Promise<void>((_resolve, reject) => {
    setTimeout(() => reject(new Error('round-history-viewer module load timeout')), LOAD_TIMEOUT_MS)
  })

  modulePromise = Promise.race([
    import(/* @vite-ignore */ url).then(() => undefined),
    timeout,
  ]).catch((err) => {
    modulePromise = null
    throw err
  })

  return modulePromise
}

export function prefetchRoundHistoryViewer(): void {
  loadRoundHistoryViewer().catch(() => { /* silent: opening the modal will retry and show the error state */ })
}

export function retryLoadRoundHistoryViewer(): Promise<void> {
  retryCount += 1
  modulePromise = null
  return loadRoundHistoryViewer()
}
```

- [ ] **Step 3: Manually verify**

```bash
cd feg_slot_cms_fe
npx tsc --noEmit
```

Confirm no new type errors are reported for `src/lib/bet-history.ts` or `src/lib/bet-history-module.ts`.

- [ ] **Step 4: Commit**

```bash
git add feg_slot_cms_fe/src/lib/bet-history.ts feg_slot_cms_fe/src/lib/bet-history-module.ts
git commit -m "feat(cms): add round-history-viewer module loader"
```

---

### Task 7: CMS round-history modal on the shared element

**Files:**
- Modify: `feg_slot_cms_fe/src/components/reports/bet-round-history-modal.tsx`
- Modify: `feg_slot_cms_fe/src/pages/reports/transaction-details.tsx`

**Interfaces:**
- Consumes: the `round-history-viewer` element contract (Task 3); `loadRoundHistoryViewer`, `prefetchRoundHistoryViewer`, `retryLoadRoundHistoryViewer` (Task 6); `buildBetHistoryUrl`, `isBetHistoryConfigured`, `canViewBetHistory` (existing, unchanged).
- Produces: `BetRoundHistoryModal` keeps its existing external props `{ isOpen, onClose, roundId, externalPlayerId }` (no change for callers); `TransactionDetailsPage` gains a prefetch effect.

- [ ] **Step 1: Spike the Radix Dialog + Shadow DOM scroll interaction**

Before rewriting the real modal, confirm whether Radix Dialog's scroll lock cancels scrolling inside a shadow root. Create a throwaway file `feg_slot_cms_fe/temp/radix-shadow-spike.tsx` (do not commit it) with a `Dialog` containing a custom element with a long, internally-scrollable shadow-root `<div>` (a few thousand pixels tall, plain content is fine, no need for the real viewer). Render it from a temporary route or `main.tsx` swap, run `npm run dev`, open the dialog, and try wheel-scrolling and touch-scrolling inside the shadow content, plus `Tab` and `Esc`.

- If scrolling works normally: proceed to Step 2 without the `stopPropagation` listeners it mentions (skip that part of the code below), but still note it as verified in the task's own manual check.
- If scrolling is blocked or janky: keep the `stopPropagation` listeners in Step 3 below (this is the expected/likely outcome per the design spec's analysis of `react-remove-scroll`).

Delete `feg_slot_cms_fe/temp/radix-shadow-spike.tsx` and revert any temporary route/`main.tsx` change before continuing.

- [ ] **Step 2: Rewrite the modal**

Replace the full file `feg_slot_cms_fe/src/components/reports/bet-round-history-modal.tsx`:

```tsx
/**
 * Bet Round History modal: mounts the shared round-history-viewer element
 * for one transaction. The URL rules (and why only completed rounds
 * resolve) live in lib/bet-history.ts; the module loader lives in
 * lib/bet-history-module.ts.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  ExternalLink,
  Loader2,
  Maximize2,
  Minimize2,
  MonitorPlay,
  RefreshCw,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CopyableId } from '@/components/ui/copyable-id'
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog'
import { apiClient } from '@/lib/api/client'
import { buildBetHistoryUrl, isBetHistoryConfigured } from '@/lib/bet-history'
import { loadRoundHistoryViewer, retryLoadRoundHistoryViewer } from '@/lib/bet-history-module'
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/store/hooks'

const ZOOM_MIN = 50
const ZOOM_MAX = 200
const ZOOM_STEP = 25
const TAG_NAME = 'round-history-viewer'

interface BetRoundHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  roundId: string
  externalPlayerId?: string
}

export function BetRoundHistoryModal({
  isOpen,
  onClose,
  roundId,
  externalPlayerId,
}: BetRoundHistoryModalProps) {
  const [zoom, setZoom] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mountKey, setMountKey] = useState(0)
  const [moduleState, setModuleState] = useState<'loading' | 'ready' | 'error'>('loading')

  const hostRef = useRef<HTMLDivElement | null>(null)

  const storedToken = useAppSelector(state => state.auth.token)
  const token = storedToken || apiClient.getTokens().token || ''

  const externalUrl = useMemo(() => buildBetHistoryUrl(roundId, token), [roundId, token])

  const configError = !isBetHistoryConfigured()
    ? 'The bet round history page is not configured for this environment.'
    : !roundId
      ? 'This transaction carries no round id to replay.'
      : !token
        ? 'Your session has ended. Sign in again to view the bet round history.'
        : ''

  const error =
    configError ||
    (moduleState === 'error'
      ? 'The bet round history viewer could not be loaded. It may be temporarily unavailable.'
      : '')

  // Reopening must start clean: zoom, fullscreen and module state are per-view.
  useEffect(() => {
    if (isOpen) return
    setZoom(100)
    setIsFullscreen(false)
    setModuleState('loading')
  }, [isOpen])

  // Load the module once the modal actually needs it.
  useEffect(() => {
    if (!isOpen || configError) return
    let cancelled = false
    setModuleState('loading')
    loadRoundHistoryViewer()
      .then(() => { if (!cancelled) setModuleState('ready') })
      .catch(() => { if (!cancelled) setModuleState('error') })
    return () => { cancelled = true }
  }, [isOpen, configError, mountKey])

  // Mount the element once the module is ready; unmount on close, reload,
  // or an unrelated re-render.
  useEffect(() => {
    if (moduleState !== 'ready' || !hostRef.current) return

    const host = hostRef.current
    const el = document.createElement(TAG_NAME) as HTMLElement & { token?: string }
    el.setAttribute('round-id', roundId)
    el.setAttribute('hide-close', '')
    el.token = token
    el.style.cssText = 'display:block;width:100%;height:100%;'

    const handleError = () => setModuleState('error')
    el.addEventListener('rh-error', handleError)

    // The dialog's scroll lock / focus trap listens on the document; a
    // shadow root retargets its own wheel/touch events to this element,
    // so forward them no further to avoid the lock treating this content
    // as unscrollable.
    const stopPropagation = (e: Event) => e.stopPropagation()
    el.addEventListener('wheel', stopPropagation, { passive: true })
    el.addEventListener('touchmove', stopPropagation, { passive: true })

    host.innerHTML = ''
    host.appendChild(el)

    return () => {
      el.removeEventListener('rh-error', handleError)
      el.removeEventListener('wheel', stopPropagation)
      el.removeEventListener('touchmove', stopPropagation)
      el.remove()
    }
  }, [moduleState, roundId, token, mountKey])

  const handleReload = () => {
    setModuleState('loading')
    setMountKey(key => key + 1)
  }

  const handleRetry = () => {
    setModuleState('loading')
    retryLoadRoundHistoryViewer()
      .then(() => setModuleState('ready'))
      .catch(() => setModuleState('error'))
  }

  const handleOpenExternal = () => {
    if (externalUrl) window.open(externalUrl, '_blank', 'noopener,noreferrer')
  }

  const changeZoom = (delta: number) =>
    setZoom(current => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, current + delta)))

  const zoomControls = (
    <div className='flex items-center gap-0.5 rounded-lg bg-muted/40 p-0.5'>
      <Button
        variant='ghost'
        size='icon-sm'
        className='h-7 w-7'
        onClick={() => changeZoom(-ZOOM_STEP)}
        disabled={zoom <= ZOOM_MIN}
        title='Zoom out'
      >
        <ZoomOut className='h-3.5 w-3.5' />
      </Button>
      <button
        type='button'
        onClick={() => setZoom(100)}
        title='Reset zoom'
        className='min-w-[3rem] px-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground'
      >
        {zoom}%
      </button>
      <Button
        variant='ghost'
        size='icon-sm'
        className='h-7 w-7'
        onClick={() => changeZoom(ZOOM_STEP)}
        disabled={zoom >= ZOOM_MAX}
        title='Zoom in'
      >
        <ZoomIn className='h-3.5 w-3.5' />
      </Button>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden border border-border/60 bg-background shadow-2xl duration-200',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            isFullscreen
              ? 'h-screen w-screen rounded-none border-0'
              : 'h-[92vh] w-[96vw] max-w-7xl rounded-2xl sm:h-[88vh]'
          )}
        >
          {/* Header */}
          <div className='flex shrink-0 flex-col gap-3 border-b border-border/60 bg-muted/20 p-3 backdrop-blur-sm sm:p-4 lg:flex-row lg:items-center lg:justify-between'>
            <div className='flex min-w-0 flex-1 flex-col gap-2.5'>
              <div className='flex items-center gap-3'>
                <div className='gradient-bg flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-lg shadow-primary/25'>
                  <MonitorPlay className='h-4 w-4 text-white' />
                </div>
                <div className='min-w-0'>
                  <DialogTitle className='truncate text-base sm:text-lg'>
                    Bet Round History
                  </DialogTitle>
                  <DialogDescription className='truncate text-xs'>
                    Round replay for this transaction
                  </DialogDescription>
                </div>
              </div>

              <div className='flex flex-wrap items-center gap-2'>
                {roundId && (
                  <Badge variant='outline' className='gap-1.5 py-1 font-normal'>
                    <span className='text-muted-foreground'>Round</span>
                    <CopyableId id={roundId} className='text-xs text-foreground' />
                  </Badge>
                )}
                {externalPlayerId && (
                  <Badge variant='outline' className='gap-1.5 py-1 font-normal'>
                    <span className='text-muted-foreground'>Player</span>
                    <CopyableId id={externalPlayerId} className='text-xs text-foreground' />
                  </Badge>
                )}
              </div>
            </div>

            <div className='flex items-center justify-end gap-1 lg:shrink-0'>
              {!error && (
                <>
                  <div className='mr-1 hidden sm:block'>{zoomControls}</div>
                  <Button
                    variant='ghost'
                    size='icon-sm'
                    onClick={() => setIsFullscreen(value => !value)}
                    title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                  >
                    {isFullscreen ? (
                      <Minimize2 className='h-4 w-4' />
                    ) : (
                      <Maximize2 className='h-4 w-4' />
                    )}
                  </Button>
                  <Button variant='ghost' size='icon-sm' onClick={handleReload} title='Reload'>
                    <RefreshCw className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon-sm'
                    onClick={handleOpenExternal}
                    title='Open in new tab'
                  >
                    <ExternalLink className='h-4 w-4' />
                  </Button>
                </>
              )}
              <span className='mx-1 h-6 w-px bg-border' aria-hidden />
              <DialogPrimitive.Close asChild>
                <Button
                  variant='ghost'
                  size='icon-sm'
                  className='hover:bg-destructive/10 hover:text-destructive'
                  title='Close'
                >
                  <X className='h-4 w-4' />
                  <span className='sr-only'>Close</span>
                </Button>
              </DialogPrimitive.Close>
            </div>

            {!error && <div className='flex w-full justify-center sm:hidden'>{zoomControls}</div>}
          </div>

          {/* Viewer */}
          <div className='relative flex-1 overflow-hidden bg-muted/10'>
            <AnimatePresence mode='wait'>
              {error ? (
                <motion.div
                  key='error'
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className='absolute inset-0 flex items-center justify-center p-6'
                >
                  <div className='max-w-md space-y-4 text-center'>
                    <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10'>
                      <AlertCircle className='h-7 w-7 text-destructive' />
                    </div>
                    <div className='space-y-1.5'>
                      <h3 className='text-base font-semibold'>Bet round history unavailable</h3>
                      <p className='text-sm text-muted-foreground'>{error}</p>
                    </div>
                    {moduleState === 'error' && !configError && (
                      <div className='flex flex-wrap items-center justify-center gap-2'>
                        <Button variant='outline' size='sm' onClick={handleRetry}>
                          <RefreshCw className='h-3.5 w-3.5' />
                          Try again
                        </Button>
                        <Button variant='ghost' size='sm' onClick={handleOpenExternal}>
                          <ExternalLink className='h-3.5 w-3.5' />
                          Open in new tab
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key='viewer'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className='relative h-full w-full'
                >
                  {moduleState === 'loading' && (
                    <div className='absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm'>
                      <div className='space-y-4 px-6 text-center'>
                        <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10'>
                          <Loader2 className='h-7 w-7 animate-spin text-primary' />
                        </div>
                        <p className='text-sm font-medium'>Loading bet round history...</p>
                      </div>
                    </div>
                  )}

                  {/* Zoom scales the viewer, so the wrapper grows by the inverse to stay filled. */}
                  <div
                    className='h-full w-full overflow-auto'
                    style={{
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: 'top left',
                      width: `${10000 / zoom}%`,
                      height: `${10000 / zoom}%`,
                    }}
                  >
                    <div
                      key={mountKey}
                      ref={hostRef}
                      className={cn(
                        'h-full w-full transition-opacity duration-300',
                        moduleState === 'ready' ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
```

- [ ] **Step 3: Add the prefetch effect to `transaction-details.tsx`**

Change the top import:

```tsx
import { useEffect, useState } from 'react'
```

Add the prefetch import alongside the existing `bet-history` import:

```tsx
import { canViewBetHistory, isBetHistoryConfigured } from '@/lib/bet-history'
import { prefetchRoundHistoryViewer } from '@/lib/bet-history-module'
```

Right after the `useTransactionDetails` call (before `const round = data?.rounds`, and before the `isLoading`/`isError` early returns, so the hook is never called conditionally), add:

```tsx
  useEffect(() => {
    const r = data?.rounds
    if (!r?.roundId || !isBetHistoryConfigured() || !canViewBetHistory(r.status)) return
    prefetchRoundHistoryViewer()
  }, [data?.rounds?.roundId, data?.rounds?.status])
```

- [ ] **Step 4: Manually verify**

Requires the embed module reachable at `VITE_BET_HISTORY_PAGE_BASE_URL` for the environment you run against (same caveat as Task 5 step 6 if your dev deploy doesn't have Task 3's build yet).

```bash
cd feg_slot_cms_fe
npm run dev
```

Open a transaction with status `credit_completed` and a `roundId`, then confirm:
- "Bet Round History" opens the viewer inline (no iframe in the Elements panel; a `round-history-viewer` custom element instead).
- It looks the same as the previous iframe version for base game, free spins, tumble, and pick feature rounds (spot-check against Task 3's harness page rendering of the same round if convenient).
- Zoom in/out/reset, fullscreen, reload, and "Open in new tab" all work; reload shows the loading spinner again and re-renders correctly.
- Wheel-scrolling and touch-scrolling inside a long round works inside the dialog; `Tab` cycles focus and `Esc` closes the dialog.
- The viewer's own close button is not shown (the dialog's own `X` is the only close control).
- With a missing/blank token (temporarily clear it via devtools or log out in another tab first), the error panel shows the expected message and no infinite spinner (Review Focus: expired token mid-view).
- Blocking the module URL in devtools shows the error panel with Try again / Open in new tab; Try again recovers once the block is removed.
- Closing the dialog immediately after opening (before the module finishes loading) produces no console error and no leftover custom element under the dialog in the Elements panel.

- [ ] **Step 5: Commit**

```bash
git add feg_slot_cms_fe/src/components/reports/bet-round-history-modal.tsx feg_slot_cms_fe/src/pages/reports/transaction-details.tsx
git commit -m "feat(cms): mount round-history-viewer instead of an iframe"
```

---

## Self-Review

**Spec coverage:** Section 5 (element contract) → Task 3. Section 6.1-6.6 (`game_history_fe` refactor, CSS, build, nginx) → Tasks 1-3. Section 7.1-7.6 (games modal, wiring, touch fix, back button, sound) → Tasks 4-5 (sound is unchanged by design, no task needed). Section 8.1-8.6 (CMS scope, files, host, dev, bundle) → Tasks 6-7. Section 9 risks 1-14 are each covered by a specific step above (touch blocker: Task 5 step 5; cache: Task 3 steps 5-7; version skew: the `/embed/v1/` path itself; CSS leakage: Task 3 steps 1-2 and `:host { all }`-equivalent scoping via Shadow DOM's natural isolation, no separate step needed since Shadow DOM already isolates by construction; asset paths: Task 1; blast radius: Task 3's error boundary; back button: Task 4-5; bad deploy: rollout order, out of this plan's scope, an operational step; leaks: Task 4/7 cleanup; build clobbering: Task 3 step 5's `emptyOutDir:false`; standalone regression: Task 2 step 4; speed gain: not gated, no task needed; Radix scroll: Task 7 step 1). Section 10's manual checks are folded into each task's own verification step rather than a separate end-to-end task, since no single task produces a deployed environment to test the full chain in without the others.

**Placeholder scan:** no "TBD"/"TODO" strings; every step has literal, complete code, not a description of code.

**Type consistency:** `resolveAsset(path)`/`setAssetBase(url)` (Task 1) match their only two callers, the embed entry (Task 3) and the three refactored files (Task 1 itself). `BetHistoryViewer`'s prop names (`roundId`, `token`, `lang`, `apiBase`, `hideClose`, `embedded`, `onClose`, `onLoaded`) are defined once in Task 2 and consumed identically by `App.jsx` (Task 2) and the embed entry (Task 3); no renamed field anywhere downstream. The element's attribute/property/event names (`round-id`, `lang`, `api-base`, `asset-base`, `hide-close`, `.token`, `rh-close`, `rh-error`) are defined once in Task 3 and used identically, spelling for spelling, in Task 4's `mountElement` and Task 7's mount effect. `prefetchRoundDetails`/`openRoundDetails`/`closeRoundDetails` (Task 4) match their call sites in Task 5 exactly. `buildBetHistoryModuleUrl`/`loadRoundHistoryViewer`/`prefetchRoundHistoryViewer`/`retryLoadRoundHistoryViewer` (Task 6) match their call sites in Task 7 exactly.

**Review Focus:** all five items are pinned to an explicit manual-check bullet in the task that owns the relevant code (Task 4 step 6 and Task 6/7 step 4 for the double-tap and in-flight-close cases; Task 3 step 8 and Task 7 step 4 for the token case; Task 1 step 5 for the locale fallback case; Task 4's `retryCount`/`?r=` design and Task 6's identical mechanism for the retry case).
