# Promo FreeSpins — Game Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a player consume an awarded Promo FreeSpins credit from inside the game client — an explicit two-choice opt-in popup (Start / Continue Playing), player-initiated spins, a live spin counter, and a bet-selector lock while active — matching the approved design spec.

**Architecture:** Implemented once in the shared `corelib`/`brandlib` layer (mirrors `AppModelService`, `MessageServiceProxy`, `FSPopupComp`), applies to all 9 games via each game's `SlotGameAppConfig.ts`. A half-built prototype of this exact feature already exists in the codebase (commented-out `PromoFSPopupComp`/`PromoFSPopupConfig`, an inert `PromoFSInfoComp`, and orphaned dead state-machine files referencing states that no longer exist) — this plan finishes/fixes the live parts and deletes the dead ones, rather than building fresh.

**Tech Stack:** TypeScript, PixiJS (via this repo's `PixView`/`ResponsiveChildrenView` wrapper), a custom linear `StateManager`, a global `EventHandler`/`SlotEvents` event bus.

## Global Constraints

- No automated test infrastructure exists in this repo (no test script, no test files, confirmed by direct search). Verification per task is `npx tsc --noEmit -p tsconfig.json` (typecheck) and, on the final task, `npm run lint`. UI-behavior steps are manual-verification notes, since an agent cannot click through a running Pixi canvas.
- Backend contract (already shipped, `feg_slot_be`/`feg_rgs_be`): `/init`, `/spin`, `/feature` responses optionally carry `data.promoInfo: { promoId, status: 'ACTIVE'|'IN_PROGRESS'|'COMPLETED', playCount, remainingPlayCount, betAmount, totalWin, skipCount }`. The client sends only `usePromo?: boolean` on `/spin` — never `promoId`.
- Client-side field naming: store the response's `promoInfo` into `appModel.promoSpinInfo` (matches the naming the existing dead prototype already expects — do not rename to `promoInfo` client-side, that would require touching more files than necessary).
- Spin counter format is CL's exact convention: **spins used so far / total**, 1-indexed — `Math.min(playCount, playCount - remainingPlayCount + 1) + ' / ' + playCount` (e.g. "3/10" on the 3rd spin), never "remaining / total".
- No dedicated `StateManager` states for the promo flow — spins stay player-initiated, reusing the existing `SPIN_START_STATE` flow unchanged. Do not resurrect the dead `CheckPromoFSTriggerState`/`ResumePromoFSState`/`CheckPromoFSState`/`ExitPromoFSState` pattern (Task 10 deletes these files).
- Two trigger points only, both collapse into a single check inside `GameIdleState` (idle is re-entered after every completed round, including the very first entry after init): (a) the very first idle entry after game load, and (b) any idle entry where balance is exactly 0. Do not show the popup on every idle entry while `status === 'ACTIVE'` — that would fire after every real-money spin.
- New localization content keys referenced by this plan (`promoContinueBtnText` for the new Continue button) live in a separate repo (`feg_games_assets`) not available in this session — out of scope for this plan. The button will render with blank/fallback text until that key is added there; this does not block functional testing of clicks/flow and is an accepted POC gap per the approved spec.
- Spec reference: `docs/superpowers/specs/2026-08-08-promo-freespins-frontend-design.md`.

---

### Task 1: New SlotEvents constants

**Files:**
- Modify: `src/corelib/events/SlotEvents.ts`

**Interfaces:**
- Produces: 5 new string constants on the `SlotEvents` object, consumed by every later task.

- [ ] **Step 1: Add the new event constants**

Open `src/corelib/events/SlotEvents.ts`. Find the flat `as const` object (it has no section comments, just one long list — add these five anywhere in the list, grouped together for readability):

```ts
  SHOW_PROMO_SPIN_ENTRY_POPUP: 'SHOW_PROMO_SPIN_ENTRY_POPUP',
  SHOW_PROMO_SPIN_EXIT_POPUP: 'SHOW_PROMO_SPIN_EXIT_POPUP',
  UPDATE_PROMO_FS_INFO: 'UPDATE_PROMO_FS_INFO',
  LOCK_BET_SELECTION: 'LOCK_BET_SELECTION',
  UNLOCK_BET_SELECTION: 'UNLOCK_BET_SELECTION',
```

Do not remove or rename any existing entry. Do not touch the `SlotEvent`/`SlotEventValue` derived types below the object — they're generated from the object's keys automatically.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/corelib/events/SlotEvents.ts
git commit -m "feat: add promo freespins event constants"
```

---

### Task 2: Promo state on AppModelService

**Files:**
- Modify: `src/corelib/models/services/AppModelService.ts`

**Interfaces:**
- Consumes: nothing new (uses existing class fields/patterns).
- Produces: `appModel.promoSpinInfo` (getter, type `any` matching the rest of this file's convention), `appModel.startPromoFSSession()`, `appModel.getIsPromoFSSession(): boolean`, `appModel.endPromoFSSession()` — consumed by Tasks 3-8.

- [ ] **Step 1: Add the backing field and session-flag methods**

Open `src/corelib/models/services/AppModelService.ts`. Near the existing `_freeSpinsSession`/`startFreeSpinsSession`/`getIsFreeSpinsSession`/`endFreeSpinsSession` group, add:

```ts
  private _promoSpinInfo: any = null;
  private _promoActive: boolean = false;

  get promoSpinInfo(): any {
    return this._promoSpinInfo;
  }
  set promoSpinInfo(value: any) {
    this._promoSpinInfo = value;
  }

  public startPromoFSSession(): void {
    this._promoActive = true;
  }
  public getIsPromoFSSession(): boolean {
    return this._promoActive;
  }
  public endPromoFSSession(): void {
    this._promoActive = false;
  }
```

- [ ] **Step 2: Store `promoInfo` on every response that carries it, and fail-closed if a promo spin's response doesn't confirm the promo**

In `storeGameInitData(data: any)`, add near the top of the method body (after existing field assignments, order doesn't matter since this doesn't depend on anything else in the method):

```ts
    this.promoSpinInfo = data.promoInfo ?? null;
```

In `storeSpinResult(data: any)`, add the same line, but this one needs the fail-closed check — the server may have silently fallen back to a real-money bet if the client's `usePromo: true` lost a race or the credit expired mid-request. Add:

```ts
    this.promoSpinInfo = data.promoInfo ?? null;
    if (this._promoActive && this._promoSpinInfo?.status !== 'IN_PROGRESS' && this._promoSpinInfo?.status !== 'COMPLETED') {
      // Client thought it was in a promo, but the server's response doesn't confirm it -
      // the server processed this as a normal real-money bet. Reconcile silently, no exit popup
      // (there's nothing to acknowledge, this wasn't a promo spin).
      this.endPromoFSSession();
    }
```

In `storeFeatureResult(data: any)`, add the identical two-statement block (same reconciliation logic applies to feature/bonus responses that also carry `promoInfo`).

Place these additions at the very end of each method body (after all existing logic in that method), so they don't interfere with existing field ordering/derived calculations already in those methods.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/corelib/models/services/AppModelService.ts
git commit -m "feat: store promoInfo and add promo session flag on AppModelService"
```

---

### Task 3: Send usePromo on the spin request

**Files:**
- Modify: `src/brandlib/models/MessageServiceProxy.ts`

**Interfaces:**
- Consumes: `appModel.getIsPromoFSSession()` (Task 2).
- Produces: `usePromo: true` field on the encrypted spin request object when in an active promo session.

- [ ] **Step 1: Add the usePromo flag**

Open `src/brandlib/models/MessageServiceProxy.ts`. In `getSpinRequestObject(isBuyBonus)`, immediately after the existing ante block:

```ts
    finalObj.extraData = {};
    if (GameProxy.config.isAnteEnabled) {
      finalObj.extraData.ante = true;
    }
    if (appModel.getIsPromoFSSession()) {
      finalObj.usePromo = true;
    }
```

(The `if (appModel.getIsPromoFSSession())` block is new — add it right after the existing `isAnteEnabled` block, before the `cheatObject` block that follows it.)

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/brandlib/models/MessageServiceProxy.ts
git commit -m "feat: send usePromo flag on spin request during an active promo session"
```

---

### Task 4: Fix and finish the entry/exit popup

**Files:**
- Modify: `src/brandlib/config/PromoFSPopupConfig.ts`
- Modify: `src/brandlib/views/containers/PromoFSPopupComp.ts`

**Interfaces:**
- Consumes: `SlotEvents.SHOW_PROMO_SPIN_ENTRY_POPUP`/`SHOW_PROMO_SPIN_EXIT_POPUP`/`UPDATE_PROMO_FS_INFO`/`LOCK_BET_SELECTION`/`UNLOCK_BET_SELECTION` (Task 1), `appModel.promoSpinInfo`/`startPromoFSSession`/`endPromoFSSession` (Task 2).
- Produces: a working 2-button entry popup and 1-button exit popup. Task 7 wires this component's visibility into `SlotAppView`.

- [ ] **Step 1: Fix the button name mismatch and add the second button**

Open `src/brandlib/config/PromoFSPopupConfig.ts`. The `entryContainer`'s button is currently named `setBtn` (line ~107) but the component reads `elementsList['startBtn']` — rename it, and add a second button next to it:

Replace:
```ts
            {
              name: 'setBtn',
              type: 'Button',
              scale: 1,
              //  action: {
              //    press: CloseBetPanelCommand,
              //  },
              data: true,
              options: {
                defaultView: 'okBtn',
                hoverView: 'okBtn',
                pressedView: 'okBtn',
                disabledView: 'okBtn',
                animations: CoreUIConfig.buttonStates,
              },
              textConfig: {
                name: 'btnText',
                type: 'Text',
                content: 'startBtnText',
                style: { fontFamily: 'commonFont', fill: 0x000000, fontSize: 28, fontWeight: 700 },
              },
              x: 355,
              y: 745,
            },
```

With:
```ts
            {
              name: 'startBtn',
              type: 'Button',
              scale: 1,
              data: true,
              options: {
                defaultView: 'okBtn',
                hoverView: 'okBtn',
                pressedView: 'okBtn',
                disabledView: 'okBtn',
                animations: CoreUIConfig.buttonStates,
              },
              textConfig: {
                name: 'btnText',
                type: 'Text',
                content: 'startBtnText',
                style: { fontFamily: 'commonFont', fill: 0x000000, fontSize: 28, fontWeight: 700 },
              },
              x: 230,
              y: 745,
            },
            {
              name: 'continueBtn',
              type: 'Button',
              scale: 1,
              data: false,
              options: {
                defaultView: 'cancelBtn',
                hoverView: 'cancelBtn',
                pressedView: 'cancelBtn',
                disabledView: 'cancelBtn',
                animations: CoreUIConfig.buttonStates,
              },
              textConfig: {
                name: 'btnText',
                type: 'Text',
                content: 'promoContinueBtnText',
                style: { fontFamily: 'commonFont', fill: 0xffffff, fontSize: 28, fontWeight: 700 },
              },
              x: 480,
              y: 745,
            },
```

(Two buttons side by side, `startBtn` reusing the existing `okBtn` visual state set, `continueBtn` reusing the existing `cancelBtn` visual state set — both asset sets already exist and are used elsewhere in this same file's `exitContainer`, no new assets needed. `promoContinueBtnText` is the new content key noted in Global Constraints — out of scope to add here.)

- [ ] **Step 2: Wire the component's constructor to the fixed button name, add the continueBtn field, connect both buttons, and uncomment the real listeners**

Open `src/brandlib/views/containers/PromoFSPopupComp.ts`. Replace the whole file with:

```ts
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixView } from '@core/pixiwrapper/PixView';
import { PixText } from '@core/pixiwrapper/PixText';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';
import { GameProxy } from '@core/models/GameConfigProxy';

export class PromoFSPopupComp extends ResponsiveChildrenView {
  private readonly bg: PixSprite;
  private readonly panelBG: PixSprite;
  private readonly entryContainer: PixView;
  private readonly valueText1: PixText;
  private readonly promoBetValue: PixText;
  private readonly startBtn: PixFancyButton;
  private readonly continueBtn: PixFancyButton;
  private readonly exitContainer: PixView;
  private readonly valueText3: PixText;
  private readonly closeBtn: PixFancyButton;

  constructor(config) {
    super(config);
    this.bg = this.elementsList['bg'];
    UIUtil.setModalState(this.bg);

    this.panelBG = this.elementsList['parentContainer'].elementsList['panelBG'];
    this.entryContainer = this.elementsList['parentContainer'].elementsList['entryContainer'];
    this.entryContainer.visible = true;

    this.valueText1 = this.entryContainer.elementsList['valueText1'];
    this.promoBetValue = this.entryContainer.elementsList['promoBetValue'];
    this.valueText1.text = '';
    this.startBtn = this.entryContainer.elementsList['startBtn'];
    this.startBtn.onPress.connect(this.startBtnClick.bind(this));
    this.startBtn.enabled = true;
    this.continueBtn = this.entryContainer.elementsList['continueBtn'];
    this.continueBtn.onPress.connect(this.continueBtnClick.bind(this));
    this.continueBtn.enabled = true;

    this.exitContainer = this.elementsList['parentContainer'].elementsList['exitContainer'];
    this.exitContainer.visible = false;

    this.valueText3 = this.exitContainer.elementsList['valueText3'];
    this.valueText3.text = '';
    this.closeBtn = this.exitContainer.elementsList['closeBtn'];
    this.closeBtn.enabled = true;
    this.closeBtn.onPress.connect(this.closeBtnClick.bind(this));

    this.visible = false;
    EventHandler.addEventListener(SlotEvents.SHOW_PROMO_SPIN_ENTRY_POPUP, this.showPromoEntryPopup.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_PROMO_SPIN_EXIT_POPUP, this.showPromoExitPopup.bind(this));
  }

  showPromoEntryPopup() {
    GameProxy.config.isPopupOpened = true;
    EventHandler.dispatchEvent(SlotEvents.SHOW_MODAL_VIEW);
    this.exitContainer.visible = false;
    this.entryContainer.visible = true;
    const data = appModel.promoSpinInfo;
    this.valueText1.text = data?.playCount ?? '';
    this.promoBetValue.text = data ? Util.formatCurrency(data.betAmount) : '';
    this.panelBG.height = 865;
    this.visible = true;
  }

  showPromoExitPopup() {
    GameProxy.config.isPopupOpened = true;
    EventHandler.dispatchEvent(SlotEvents.SHOW_MODAL_VIEW);
    this.exitContainer.visible = true;
    this.entryContainer.visible = false;
    const data = appModel.promoSpinInfo;
    this.valueText3.text = data ? Util.formatCurrency(data.totalWin) : '';
    this.panelBG.width = 712;
    this.panelBG.height = 752;
    this.visible = true;
  }

  startBtnClick() {
    appModel.startPromoFSSession();
    EventHandler.dispatchEvent(SlotEvents.LOCK_BET_SELECTION);
    EventHandler.dispatchEvent(SlotEvents.UPDATE_PROMO_FS_INFO);
    this.closePopup();
  }

  continueBtnClick() {
    this.closePopup();
  }

  closeBtnClick() {
    EventHandler.dispatchEvent(SlotEvents.UNLOCK_BET_SELECTION);
    this.closePopup();
  }

  private closePopup(): void {
    GameProxy.config.isPopupOpened = false;
    EventHandler.dispatchEvent(SlotEvents.HIDE_MODAL_VIEW);
    this.visible = false;
    this.parent?.removeChild(this);
  }

  resizeView() {
    super.resizeView();
    this.bg.width = UIUtil.getGameWidth();
    this.bg.height = UIUtil.getGameHeight();
  }
}
```

Key behavior changes from the dead prototype: both buttons are now connected; `startBtnClick` starts the session, locks the bet selector, and triggers a counter update, instead of just calling `StateManager.doNextStep()` (which isn't needed since there's no dedicated promo state to advance into — the game just continues its normal flow); `continueBtnClick` does nothing but close (declining, real-money play continues); `closeBtnClick` (exit-popup acknowledgement) unlocks the bet selector (the session was already ended by `AppModelService`'s reconciliation in Task 2 by the time `COMPLETED` is seen, this just restores the UI). `StateManager`/`STATES` imports are removed since they're no longer used by this file.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/brandlib/config/PromoFSPopupConfig.ts src/brandlib/views/containers/PromoFSPopupComp.ts
git commit -m "feat: fix and finish the promo freespins entry/exit popup"
```

---

### Task 5: Finish the spin counter widget

**Files:**
- Modify: `src/corelib/views/comps/PromoFSInfoComp.ts`
- Create: `src/brandlib/config/PromoFSInfoConfig.ts`

**Interfaces:**
- Consumes: `SlotEvents.UPDATE_PROMO_FS_INFO` (Task 1), `appModel.promoSpinInfo` (Task 2).
- Produces: `PROMOFS_INFO_CONFIG` — a top-level screen config entry, consumed by Task 9's per-game wiring. Matches the same top-level-Elements pattern already used by the natural free-spins counter (`FSAutoCounterConfig.ts`/`FSAutoCounterComp`), not the (currently unused by every game) `createControlPanelConfig(freespinInfoCompConfig)` optional param.

- [ ] **Step 1: Finish PromoFSInfoComp.ts**

Replace the whole file with:

```ts
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixText } from '@core/pixiwrapper/PixText';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';

export class PromoFSInfoComp extends ResponsiveChildrenView {
  private readonly bg: PixSprite;
  private readonly spinValueText: PixText;
  private readonly winValueText: PixText;

  constructor(config) {
    super(config);
    this.bg = UIUtil.getSprite('promofsInfoBG');
    this.addChild(this.bg);

    this.spinValueText = this.elementsList['spinValueText'];
    this.addChild(this.spinValueText);
    this.spinValueText.x = this.bg.width / 2;
    this.spinValueText.y = 50;

    this.winValueText = this.elementsList['winValueText'];
    this.addChild(this.winValueText);
    this.winValueText.x = this.bg.width / 2;
    this.winValueText.y = 150;

    this.visible = false;
    EventHandler.addEventListener(SlotEvents.UPDATE_PROMO_FS_INFO, this.updatePromoFS.bind(this));
  }

  private updatePromoFS(): void {
    const data = appModel.promoSpinInfo;
    if (!data) {
      this.visible = false;
      return;
    }
    this.visible = true;
    const count = Math.min(data.playCount, data.playCount - data.remainingPlayCount + 1);
    this.spinValueText.text = count + ' / ' + data.playCount;
    this.winValueText.text = Util.formatCurrency(data.totalWin);
  }
}
```

(Simplified from the dead prototype: the two text elements are now defined declaratively in the config's `Elements` array — see Step 2 — and picked up via the standard `this.elementsList[...]` mechanism, same as every other component in this codebase, instead of being built imperatively with `UIUtil.getElement(...)` inline in the constructor. `spinTitleText`/`winTitleText` labels from the dead prototype are dropped for the POC — value-only display; add label text elements later if the FE team wants them.)

- [ ] **Step 2: Create the config**

Create `src/brandlib/config/PromoFSInfoConfig.ts`:

```ts
import { PromoFSInfoComp } from '@core/views/comps/PromoFSInfoComp';

export const PROMOFS_INFO_CONFIG: any = {
  name: 'promoFSInfoComp',
  type: 'Comp',
  class: PromoFSInfoComp,
  x: 42,
  y: 1070,
  Elements: [
    {
      name: 'spinValueText',
      type: 'Text',
      content: '',
      anchor: { x: 0.5, y: 0.5 },
      style: { fontFamily: 'commonFont', fontSize: 40, fill: 0xffc600, fontWeight: 700 },
    },
    {
      name: 'winValueText',
      type: 'Text',
      content: '',
      anchor: { x: 0.5, y: 0.5 },
      style: { fontFamily: 'commonFont', fontSize: 28, fill: 0xffffff, fontWeight: 400 },
    },
  ],
};
```

(Position `x: 42, y: 1070` copied from the existing `FSAutoCounterConfig.ts` as a reasonable default — this is cosmetic placement the FE team can retune later, not a behavior decision.)

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/corelib/views/comps/PromoFSInfoComp.ts src/brandlib/config/PromoFSInfoConfig.ts
git commit -m "feat: finish the promo freespins counter widget"
```

---

### Task 6: Selective bet-selector lock

**Files:**
- Modify: `src/brandlib/views/containers/ControlPanelView.ts`

**Interfaces:**
- Consumes: `SlotEvents.LOCK_BET_SELECTION`/`UNLOCK_BET_SELECTION` (Task 1).
- Produces: `betBtn` (the button that opens the bet-amount panel) disabled while a promo session is active, without touching `spinBtn`/`menuBtn`/`infoBtn` (unlike the existing all-or-nothing `enablePanel`/`disablePanel` pair, which this task does not touch or reuse).

- [ ] **Step 1: Add the selective lock/unlock methods and wire the new events**

Open `src/brandlib/views/containers/ControlPanelView.ts`. Near the existing `EventHandler.addEventListener(SlotEvents.ENABLE_CONTROLPANEL, ...)`/`DISABLE_CONTROLPANEL` lines, add:

```ts
    EventHandler.addEventListener(SlotEvents.LOCK_BET_SELECTION, this.lockBetSelection.bind(this));
    EventHandler.addEventListener(SlotEvents.UNLOCK_BET_SELECTION, this.unlockBetSelection.bind(this));
```

Then add the two new methods near the existing `enablePanel`/`disablePanel` methods (same file, find them via the `this.spinBtn.enabled = true;` / `this.spinBtn.enabled = false;` lines found earlier):

```ts
  protected lockBetSelection(): void {
    this.betBtn.enabled = false;
  }
  protected unlockBetSelection(): void {
    this.betBtn.enabled = true;
  }
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/brandlib/views/containers/ControlPanelView.ts
git commit -m "feat: add selective bet-selector lock for promo freespins"
```

---

### Task 7: Wire the popup's visibility into SlotAppView

**Files:**
- Modify: `src/corelib/views/containers/SlotAppView.ts`

**Interfaces:**
- Consumes: `PromoFSPopupComp` (Task 4), `SlotEvents.SHOW_PROMO_SPIN_ENTRY_POPUP`/`SHOW_PROMO_SPIN_EXIT_POPUP` (Task 1).
- Produces: the popup actually appears/disappears in the scene graph — without this task, `PromoFSPopupComp`'s internal `visible = true` has no effect because the component is never added to the display tree (mirrors exactly how `popupFSComp`/`SHOW_FS_POPUP` already works for the natural free-spins popup).

- [ ] **Step 1: Register the popup element and its show/hide listeners**

Open `src/corelib/views/containers/SlotAppView.ts`. Add the import:

```ts
import { PromoFSPopupComp } from '@brand/views/containers/PromoFSPopupComp';
```

Add the field declaration next to `private readonly popupFSComp: FSPopupComp;`:

```ts
  private readonly popupPromoFSComp: PromoFSPopupComp;
```

In the constructor, next to the existing `this.popupFSComp = this.elementsList['popupComp']; this.removeChild(this.popupFSComp);` lines, add:

```ts
    this.popupPromoFSComp = this.elementsList['promoFSComp'];
    this.removeChild(this.popupPromoFSComp);
```

(`'promoFSComp'` is `PROMOFS_POPUP_CONFIG.name` from `PromoFSPopupConfig.ts` — already registered in every game's `SlotGameAppConfig.ts`, confirmed present today.)

Next to the existing `EventHandler.addEventListener(SlotEvents.SHOW_FS_POPUP, this.showFSPopup.bind(this));` line, add:

```ts
    EventHandler.addEventListener(SlotEvents.SHOW_PROMO_SPIN_ENTRY_POPUP, this.showPromoFSPopup.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_PROMO_SPIN_EXIT_POPUP, this.showPromoFSPopup.bind(this));
```

(Both events reuse the same show method — `PromoFSPopupComp` itself decides which of its two internal containers, entry or exit, to display, per Task 4's `showPromoEntryPopup`/`showPromoExitPopup`; `SlotAppView`'s job is only to add the component to the tree.)

Add the handler method next to the existing `showFSPopup`:

```ts
  protected showPromoFSPopup(): void {
    this.addChild(this.popupPromoFSComp);
  }
```

Add `this.removeChild(this.popupPromoFSComp);` to the `hideAllViews()` method's existing list of `removeChild` calls (so any other popup/panel opening correctly closes this one too, matching how `popupFSComp` is already handled there).

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/corelib/views/containers/SlotAppView.ts
git commit -m "feat: wire promo freespins popup visibility into SlotAppView"
```

---

### Task 8: Trigger points (game load and balance-zero)

**Files:**
- Modify: `src/corelib/commands/states/GameIdleState.ts`

**Interfaces:**
- Consumes: `appModel.promoSpinInfo`/`getIsPromoFSSession`/`startPromoFSSession` (Task 2), `SlotEvents.SHOW_PROMO_SPIN_ENTRY_POPUP`/`LOCK_BET_SELECTION`/`UPDATE_PROMO_FS_INFO` (Task 1).
- Produces: the actual moment the popup shows, and the silent resume-in-progress path — the two trigger points from the spec, both handled at the single point the game returns to idle (this covers both "game load," since `IDLE_STATE` is reached shortly after `/init`, and "balance reaches 0," since idle is re-entered after every completed round).

- [ ] **Step 1: Add the trigger check**

Open `src/corelib/commands/states/GameIdleState.ts`. No new imports are needed — `SlotEvents`, `EventHandler`, `appModel`, and `GameProxy` are already imported.

Add a new private field to the class:

```ts
  private promoCheckedOnLoad: boolean = false;
```

Add a new private method:

```ts
  private checkPromoTrigger(): void {
    const promo = appModel.promoSpinInfo;

    if (promo?.status === 'IN_PROGRESS' && !appModel.getIsPromoFSSession()) {
      // Resumed mid-promo (new session, or came back from another game) - must finish,
      // no popup needed, the server already enforces this regardless of client input.
      appModel.startPromoFSSession();
      EventHandler.dispatchEvent(SlotEvents.LOCK_BET_SELECTION);
      EventHandler.dispatchEvent(SlotEvents.UPDATE_PROMO_FS_INFO);
      this.promoCheckedOnLoad = true;
      return;
    }

    if (!promo || promo.status !== 'ACTIVE' || appModel.getIsPromoFSSession()) {
      this.promoCheckedOnLoad = true;
      return;
    }

    const isGameLoadTrigger = !this.promoCheckedOnLoad;
    const isBalanceZeroTrigger = appModel.getBalance() === 0;
    if (isGameLoadTrigger || isBalanceZeroTrigger) {
      this.promoCheckedOnLoad = true;
      EventHandler.dispatchEvent(SlotEvents.SHOW_PROMO_SPIN_ENTRY_POPUP);
    }
  }
```

Call it from `execute()`, right after the existing `super.execute(data);` line:

```ts
  public async execute(data: any = null) {
    super.execute(data);
    this.checkPromoTrigger();
    const remainingTime = appModel.getSpinRemainingTime();
    ...
```

(The rest of `execute()` is unchanged.)

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/corelib/commands/states/GameIdleState.ts
git commit -m "feat: trigger promo freespins popup on game load and balance-zero"
```

---

### Task 9: Register the counter widget in every game

**Files:**
- Modify: `src/slots/bookofstorms/config/screens/SlotGameAppConfig.ts`
- Modify: `src/slots/bookofstormslightningwin/config/screens/SlotGameAppConfig.ts`
- Modify: `src/slots/carpathiantreasures/config/screens/SlotGameAppConfig.ts`
- Modify: `src/slots/empireofgold/config/screens/SlotGameAppConfig.ts`
- Modify: `src/slots/empireofgoldnewconquest/config/screens/SlotGameAppConfig.ts`
- Modify: `src/slots/frostedmarketbonanza/config/screens/SlotGameAppConfig.ts`
- Modify: `src/slots/meowmeowmeow/config/screens/SlotGameAppConfig.ts`
- Modify: `src/slots/royale81/config/screens/SlotGameAppConfig.ts`
- Modify: `src/slots/sweetsalon/config/screens/SlotGameAppConfig.ts`

**Interfaces:**
- Consumes: `PROMOFS_INFO_CONFIG` (Task 5).
- Produces: the counter widget actually renders in each game — `PROMOFS_POPUP_CONFIG` is already registered in all 9 of these files today (confirmed), only the counter widget is missing.

- [ ] **Step 1: Add the import and Elements entry to each of the 9 files**

Every file listed above follows the identical pattern shown in full for `meowmeowmeow` below — apply the same two changes to all 9:

Add the import near the existing `import { PROMOFS_POPUP_CONFIG } from '@brand/config/PromoFSPopupConfig';` line:

```ts
import { PROMOFS_INFO_CONFIG } from '@brand/config/PromoFSInfoConfig';
```

Add `PROMOFS_INFO_CONFIG,` to the `Elements` array, right after the existing `PROMOFS_POPUP_CONFIG,` entry:

```ts
    PROMOFS_POPUP_CONFIG,
    PROMOFS_INFO_CONFIG,
```

Verify each file's `PROMOFS_POPUP_CONFIG` import path matches exactly (`@brand/config/PromoFSPopupConfig`) before adding the new line below it — all 9 were confirmed to already import it, but double-check per file since exact surrounding import order may differ slightly game to game.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/slots/*/config/screens/SlotGameAppConfig.ts
git commit -m "feat: register promo freespins counter widget in all games"
```

---

### Task 10: Remove the orphaned dead state-chain prototype

**Files:**
- Delete: `src/corelib/commands/states/CheckPromoFSTriggerState.ts`
- Delete: `src/corelib/commands/states/CheckPromoFSState.ts`
- Delete: `src/corelib/commands/states/ResumePromoFSState.ts`
- Delete: `src/corelib/commands/states/ExitPromoFSState.ts`

**Interfaces:**
- Consumes: nothing (these files are already fully commented out, no other file imports anything live from them — confirmed by their content in the earlier investigation).
- Produces: nothing — this is deletion only.

- [ ] **Step 1: Confirm nothing imports these files**

Run: `grep -rln "CheckPromoFSTriggerState\|CheckPromoFSState\|ResumePromoFSState\|ExitPromoFSState" src --include="*.ts"`
Expected: only the 4 files themselves (each exports a name matching its filename, no other file references any of these exports — this plan's earlier investigation already confirmed all 4 files' bodies are entirely commented out except a no-op class shell). Do not proceed to Step 2 if this search finds an importer outside these 4 files — stop and report instead.

- [ ] **Step 2: Delete the files**

```bash
git rm src/corelib/commands/states/CheckPromoFSTriggerState.ts
git rm src/corelib/commands/states/CheckPromoFSState.ts
git rm src/corelib/commands/states/ResumePromoFSState.ts
git rm src/corelib/commands/states/ExitPromoFSState.ts
```

(`src/corelib/commands/action/ShowPromotionCommand.ts` is deliberately NOT touched — despite the similar name, it only dispatches `SlotEvents.HIDE_MENU` and its relationship to this feature is unclear; leave it alone rather than guess.)

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no new errors (confirms Step 1's grep was accurate — a real importer would now fail to compile).

- [ ] **Step 4: Lint (final task in this plan)**

Run: `npm run lint`
Expected: no new errors introduced by this plan's changes (pre-existing lint issues elsewhere in the codebase, if any, are not this plan's responsibility).

- [ ] **Step 5: Commit**

```bash
git commit -m "chore: remove orphaned dead promo freespins state-chain prototype"
```

---

## Manual Verification (after all tasks)

No automated tests exist for this codebase's game-client UI — verify by running the dev server (`npm run dev`) against a test account with an awarded Promo FreeSpins credit and confirming:

1. On game load with an `ACTIVE` promo credit, the entry popup appears showing spin count and bet amount, with both "Start" and "Continue Playing" buttons visible and clickable.
2. Clicking "Continue Playing" closes the popup, real-money play continues normally, bet selector remains unlocked.
3. Clicking "Start" closes the popup, locks the bet selector (the button that opens the bet-amount panel becomes unresponsive), shows the "1/N" counter, and the next `/spin` network request includes `usePromo: true`.
4. Each subsequent promo spin still requires a manual click of the spin button (no auto-play), decrements the counter correctly, and updates the win total.
5. When the promo's last spin completes (`status` becomes `COMPLETED`), the exit popup appears showing the total win; closing it unlocks the bet selector and hides the counter.
6. Playing down to a 0 balance with a still-`ACTIVE` (not-yet-started) promo credit shows the entry popup again.
7. Leaving the game mid-promo (`IN_PROGRESS`) and returning (fresh `/init`) resumes silently — no popup, bet selector already locked, counter already showing the correct in-progress count.
