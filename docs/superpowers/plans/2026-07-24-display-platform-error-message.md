# Show Platform DisplayMessage in Error Popups Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the platform's specific, localized `displayMessage` (e.g. FEG's exact reason for a bet rejection) in error popups instead of a generic bucket message, and fix the dead-code bug that currently discards any specific error text regardless of source.

**Architecture:** Two isolated fixes in one file (`SlotGameApp.ts`): correct a typo'd condition check that unconditionally overwrites any resolved message with generic text, and add `displayMessage` as the highest-priority message source in both the spin-error and init-error handlers, ahead of the existing `ERROR_CODES`-mapped fallback.

**Tech Stack:** TypeScript, PixiJS-based slot game frontend.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-24-display-platform-error-message-design.md` - read it before starting if anything below is unclear.
- Do NOT write unit tests unless explicitly asked (project convention). Manual verification steps are provided instead.
- Ignore eslint/prettier errors. Do not run a full build unless asked. Do not use em dashes anywhere in code, comments, or commit messages - use a colon or hyphen instead.
- No `ErrorCodes.ts` changes - confirmed unnecessary; `Util.getContent` on a missing key returns `undefined` without throwing, so unmapped codes safely fall through to the existing generic bucket once the bug below is fixed.
- No changes to `MessagePopupView.ts` - it already displays whatever numeric `data.code` is passed to it.

---

### Task 1: Fix the message-discarding bug and wire displayMessage through both error paths

**Files:**
- Modify: `feg_games_src/src/corelib/app/SlotGameApp.ts:425-469`

**Interfaces:**
- Consumes: `obj.data.extensions.public.displayMessage` (new field, present when the backend's error response carries one - absent/`undefined` otherwise, safe to read via optional chaining).
- Produces: no new exports - this is a self-contained behavior fix within `SlotGameApp`'s two existing private/protected methods.

- [ ] **Step 1: Fix `onServerError`'s dead-code bug and prefer `displayMessage`**

In `feg_games_src/src/corelib/app/SlotGameApp.ts`, replace:

```typescript
  protected onServerError(obj: any): void {
    if (obj.msgName == 'gameinit') {
      this.initErrorOccured = true;
      // gameinit error can arrive before commonContent.json/gameContent.json
      // finish loading (PRELOADER bundle). Without content, getContent returns
      // empty and the popup shows blank text. Defer until content is ready.
      if (ContentProxy.isLoaded) {
        this.displayInitError(obj);
      } else {
        this.pendingInitErrorObj = obj;
      }
    } else {
      appModel.resetGameResult();
      const data: any = {};
      let isOfflineError = false;
      data.title = Util.getContent('infoText');
      data.message = obj?.data?.extensions?.code ? Util.getContent(ERROR_CODES[obj?.data?.extensions?.code]) : null;
      if (!data.msg) {
        if (obj.data.extensions) {
          data.message = Util.getContent('generic_error');
        } else {
          data.message = Util.getContent('networkDisconnectedMessage');
          isOfflineError = !this.isOnline();
          EventHandler.dispatchEvent(SlotEvents.STOP_REEL_FOR_ERROR);
        }
      }
      data.code = obj?.data?.extensions?.code ? obj?.data?.extensions?.code : 9999;
      if (!isOfflineError) {
        data.callback = this.refreshGame.bind(this);
      }
      EventHandler.dispatchEvent(SlotEvents.SHOW_MESSAGE_POPUP, data);
    }
  }
```

with:

```typescript
  protected onServerError(obj: any): void {
    if (obj.msgName == 'gameinit') {
      this.initErrorOccured = true;
      // gameinit error can arrive before commonContent.json/gameContent.json
      // finish loading (PRELOADER bundle). Without content, getContent returns
      // empty and the popup shows blank text. Defer until content is ready.
      if (ContentProxy.isLoaded) {
        this.displayInitError(obj);
      } else {
        this.pendingInitErrorObj = obj;
      }
    } else {
      appModel.resetGameResult();
      const data: any = {};
      let isOfflineError = false;
      data.title = Util.getContent('infoText');
      // Prefer the platform's own specific, localized message (e.g. FEG's exact
      // reason for a bet rejection) over our generic ERROR_CODES-mapped bucket text.
      data.message =
        obj?.data?.extensions?.public?.displayMessage ??
        (obj?.data?.extensions?.code ? Util.getContent(ERROR_CODES[obj?.data?.extensions?.code]) : null);
      if (!data.message) {
        if (obj.data.extensions) {
          data.message = Util.getContent('generic_error');
        } else {
          data.message = Util.getContent('networkDisconnectedMessage');
          isOfflineError = !this.isOnline();
          EventHandler.dispatchEvent(SlotEvents.STOP_REEL_FOR_ERROR);
        }
      }
      data.code = obj?.data?.extensions?.code ? obj?.data?.extensions?.code : 9999;
      if (!isOfflineError) {
        data.callback = this.refreshGame.bind(this);
      }
      EventHandler.dispatchEvent(SlotEvents.SHOW_MESSAGE_POPUP, data);
    }
  }
```

(The fix is `if (!data.msg)` → `if (!data.message)` - `data.msg` was never assigned anywhere in this file, so the check was always true and always discarded whatever `data.message` had just been set to, two lines above.)

- [ ] **Step 2: Prefer displayMessage in `displayInitError`**

In the same file, replace:

```typescript
  private displayInitError(obj: any): void {
    this.errorPopup = new InitErrorPopup(INIT_ERROR_POPUP_CONFIG);
    this.appContainer.addChild(this.errorPopup);
    let msg = obj?.data?.extensions?.code
      ? Util.getContent(ERROR_CODES[obj?.data?.extensions?.code])
      : obj?.data?.message;
    if (!msg) {
      msg = Util.getContent('generic_error');
    }
    this.errorPopup.showMessage(msg, obj?.data?.extensions?.code);
    this.removePreloader();
  }
```

with:

```typescript
  private displayInitError(obj: any): void {
    this.errorPopup = new InitErrorPopup(INIT_ERROR_POPUP_CONFIG);
    this.appContainer.addChild(this.errorPopup);
    let msg =
      obj?.data?.extensions?.public?.displayMessage ??
      (obj?.data?.extensions?.code ? Util.getContent(ERROR_CODES[obj?.data?.extensions?.code]) : obj?.data?.message);
    if (!msg) {
      msg = Util.getContent('generic_error');
    }
    this.errorPopup.showMessage(msg, obj?.data?.extensions?.code);
    this.removePreloader();
  }
```

- [ ] **Step 3: Typecheck**

Run the project's typecheck command (check `package.json`'s `scripts` for the exact name, e.g. `yarn typecheck` or `tsc --noEmit`).
Expected: no errors.

- [ ] **Step 4: Manual verification**

Using dev tools or a local mock of the `/spin`/`/init` response, verify each scenario:
- A response with `extensions.public.displayMessage` set (e.g. `"Žao nam je, ali vaša dnevna granica oklade..."`) shows that exact text in the error popup, for both a spin-time error (`onServerError`) and an init-time error (`displayInitError`).
- A response with `extensions.code` set but no `displayMessage`, where that code has a real `ErrorCodes.ts` entry (e.g. 2429, `minimum_bet_error`) still shows the correctly translated generic-bucket text, unchanged from today.
- A response with `extensions.code` set to one of the new codes (2500-2503, no `ErrorCodes.ts` entry) and no `displayMessage` falls through to `generic_error` text, no crash, no blank popup.
- A response with no `extensions` at all (network-level failure) still shows the offline/network-disconnected message path, unaffected.

- [ ] **Step 5: Commit**

```bash
git add src/corelib/app/SlotGameApp.ts
git commit -m "fix: show platform displayMessage in error popups, fix message-discarding bug"
```
