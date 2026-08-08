# Promo FreeSpins — Game Frontend (feg_games_src) Design

**Status:** Approved (POC scope — FE team will revisit UI/UX/visual design later)

## Goal

Let a player consume an awarded Promo FreeSpins credit from inside the game client: an explicit opt-in choice (not Crash.live's silent auto-hijack), player-initiated spins (no auto-play cascade), resumable across sessions and interruptible to play a different game.

## Background

Backend contract is already shipped (`feg_slot_be`/`feg_rgs_be`, branch `feat/promo-freespins`):

- `/init`, `/spin`, `/feature` responses carry an optional `promoInfo` field:
  ```ts
  interface IPromoInfo {
    promoId: string;
    status: 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED';
    playCount: number;
    remainingPlayCount: number;
    betAmount: number;
    totalWin: number;
    skipCount: number;
  }
  ```
- The client sends only `usePromo?: boolean` on `/spin` — no `promoId`. The server auto-detects the applicable credit from the session (userId+brand+game), matching Crash.live's own auto-detect precedent. `skipCount` exists on the type but has no client-side UI in this POC (no "skip this spin" action was requested).
- `status: 'ACTIVE'` = awarded, not yet started. `'IN_PROGRESS'` = started, must be finished (server enforces this regardless of what the client sends). `'COMPLETED'` = just finished (present once, on the settling response).

Reference: Crash.live's actual client implementation was audited (`clgaming_games_src`, shared `corelib`/`brandlib` layer, 3 games). Its popup only has one button per screen (acknowledge, not choose) and auto-plays every spin via a dedicated `StateManager` state chain (`CheckPromoFSTriggerState` → `ResumePromoFSState` → `CheckPromoFSState` → `ExitPromoFSState`). Both are deliberately not carried over — FEG's spec requires a real choice and player-initiated spins.

## Architecture

Implemented once in the shared `corelib`/`brandlib` layer (mirrors how `AppModelService`, `MessageServiceProxy`, `BetPanelView` already work) — no per-game duplication, applies automatically to whichever games get promo profiles configured on the backend.

### 1. Storage — `AppModelService` (`src/corelib/models/services/AppModelService.ts`)

- New field `_promoInfo: IPromoInfo | null` with getter/setter `promoInfo`, populated from `data.promoInfo` inside the existing `storeGameInitData`, `storeSpinResult`, `storeFeatureResult` handlers (same pattern already used for other response fields in those three methods).
- New session flag `_promoActive: boolean`, with a getter following the existing naming convention (`getIsPromoFSSession()`, mirroring the existing `getIsFreeSpinsSession()`/`getIsLightningSession()` getters). This flag — not `promoInfo.status` directly — is what gates the `usePromo` request flag and the bet-panel lock, so the client's own "am I opted in" state survives a response that omits `promoInfo` (see Error Handling).
- `getIsPromoFSSession()` returns `true` when `_promoActive` is true. It is set:
  - `true` — when the player clicks "Start" on the entry popup, or immediately on `/init` if the resumed `promoInfo.status === 'IN_PROGRESS'` (no popup in that case, see §2).
  - `false` — when `promoInfo` is next received with `status === 'COMPLETED'`, or `remainingPlayCount <= 0`, or `promoInfo` is absent on a response following a promo spin (fail-closed, see Error Handling), or the player clicks "Continue Playing" instead of "Start" (never set true to begin with).

### 2. Entry popup — new `PromoFSPopupComp` (`src/brandlib/views/popups/`)

Modeled structurally on the existing `FSPopupComp` (same `ResponsiveChildrenView` base, same `SHOW_MODAL_VIEW`/`GameProxy.config.isPopupOpened` wiring, same single-callback close pattern) — reusing that convention rather than inventing a new one. Two states:

- **Entry** (shown when `status === 'ACTIVE'`): title/message text (spin count, bet amount — same content fields `promoFStxt1`/`valueText1`/`promoBetValue` etc. Crash.live already uses, content only, no visual redesign needed for a POC) plus **two** buttons instead of one:
  - `startBtn` → `appModel` sets `_promoActive = true`, dispatch `SlotEvents.HIDE_MODAL_VIEW`, disable bet panel (§3), continue into the normal idle/bet-ready flow.
  - `continueBtn` → dispatch `SlotEvents.HIDE_MODAL_VIEW`, do nothing else — normal real-money play continues, `promoInfo.status` stays `'ACTIVE'` server-side, popup can reappear at the next trigger point.
- **Exit** (shown when a promo spin's response brings `status === 'COMPLETED'`): single `okBtn`, near-verbatim reuse of `FSPopupComp`'s existing pattern — shows `totalWin`, closing it re-enables the bet panel and clears `_promoActive` (already false by this point per §1, this is just the UI acknowledgement).

No new visual assets required for the POC — reuses whatever sprite/button assets `FSPopupComp` already references.

### 3. Trigger points and bet-panel lock

Two trigger points, both confirmed: no extra network calls needed for either, since `promoInfo` is refreshed on every `/init`/`/spin`/`/feature` response and the client always has the latest value in `appModel.promoInfo`.

- **Game load** — after `storeGameInitData` processes the `/init` response: if `promoInfo?.status === 'ACTIVE'`, show the entry popup. If `promoInfo?.status === 'IN_PROGRESS'` (player left the game mid-promo, came back), skip the popup entirely — set `_promoActive = true` directly and lock the bet panel, matching "must finish once started."
- **Balance reaches 0 mid-session** — hook into wherever the client currently reacts to a balance update reaching 0 (no existing check found in this codebase; this is new logic, added at the same point balance is updated after a spin/feature settles). If `appModel.promoInfo?.status === 'ACTIVE'` at that moment, show the entry popup. `'IN_PROGRESS'`/`'COMPLETED'`/absent → nothing.
- **Bet panel lock**: while `getIsPromoFSSession()` is true, disable the stake selector in `BetPanelView`/the control panel (reusing whichever existing disable mechanism already exists for the ante flow — the exact hook point is an implementation detail to confirm against the real ante wiring, not a design decision) and show a plain text readout `${promoInfo.remainingPlayCount} / ${promoInfo.playCount} free spins left` somewhere in the existing HUD. No bespoke widget, no removal of buttons (that's Crash.live's heavier treatment) — disable only, POC-appropriate.

### 4. Spin request — `MessageServiceProxy.getSpinRequestObject()`

One addition, same style as the existing `ante` flag (`src/brandlib/models/MessageServiceProxy.ts:98-101`):

```ts
if (appModel.getIsPromoFSSession()) {
  finalObj.usePromo = true;
}
```

No `promoId`, no other promo fields on the request — the entire client→server promo contract is this one boolean.

### 5. Error handling

- `promoInfo` malformed or absent on any response where it wasn't expected: treat as "no promo," never throw.
- **Fail-closed reconciliation** (mirrors the server's own fail-closed behavior for a stale/lost-race promo): if the client sent `usePromo: true` on a spin (i.e. `_promoActive` was true) but the response comes back with `promoInfo` absent or `status` not `'IN_PROGRESS'`/`'COMPLETED'`, the server silently processed it as a normal real-money bet — the client must detect this and clear `_promoActive`, re-enable the bet panel, and NOT show the exit popup (there's nothing to acknowledge, it was a real-money spin). This prevents the UI getting stuck showing "in promo" after the server has already fallen back to real money.

## Out of scope for this POC

- Visual/animation polish, dedicated art assets, spine/lottie work — FE team follow-up.
- `skipCount` / any "skip this spin" UI action.
- Auto-play or any Crash.live-style dedicated `StateManager` state chain — not needed since spins stay player-initiated.
- A resumed-on-a-different-game notification — per spec, resuming is silent (§3's `IN_PROGRESS` init-time check handles it without any popup).

## Testing

No automated test infra in this codebase for game-client UI (Pixi/canvas, manual QA is the existing norm). Verification is manual: confirm the popup appears/doesn't at the right trigger points, `usePromo` is set correctly on the network request, the bet panel locks/unlocks correctly, and the exit acknowledgement shows the right `totalWin`.
