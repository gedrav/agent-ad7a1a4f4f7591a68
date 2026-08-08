# Promo FreeSpins - Frontend Integration Guide

Audience: engineers on `feg_games_src` (Phaser/PixiJS game client). This covers what the backend contract gives you and where to hook the UI into the existing state machine / event system. No prior context assumed.

## What is Promo FreeSpins

An operator (or FEG CMS admin) can award a player a fixed number of free spins at a fixed bet amount on one or more specific games. The player is explicitly offered a choice - start the free spins now, or keep playing normal mode. This is **not** a game-triggered bonus feature (that's the existing `FSPopupComp` / `EnterFreespinsState` flow) - it's an operator-granted credit that sits alongside normal play. Each promo spin costs the player **$0 real money**; the backend debits 0 for the round while still tracking a nominal bet amount for display.

The backend design is fully implemented in `feg_slot_be`. This doc only covers the client side, which has not been built yet.

## The `promoInfo` shape

```ts
interface IPromoInfo {
  promoId: string;               // the award's id - needed by the client to reference which award to start
  status: 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED';
  playCount: number;             // total spins awarded - pair with remainingPlayCount for "3 / 10 free spins left"
  remainingPlayCount: number;    // drives your "N free spins left" counter
  betAmount: number;             // server-authoritative stake for the promo, in minor currency units
  totalWin: number;              // running win total across the promo's spins so far
  skipCount: number;             // analytics only - how many times the player has declined the offer
}
```

`promoInfo` is optional and only present when the player has a matching promo award for the current game. It can appear on:

| Response | When present |
|---|---|
| `/init` | Whenever a matching `ACTIVE`/`IN_PROGRESS` award exists for this game - present unconditionally on every game load/session, not gated on balance. |
| `/spin` (round complete) | After the round settles, reflecting post-spin state (decremented count, possible transition out of `IN_PROGRESS`). |
| `/feature` (mid-feature step, and on feature completion) | Same as spin - present once the round settles or updates. |

If `promoInfo` is absent from a response, the player has no active promo for this game - nothing to show. A fully consumed promo transitions to `status: 'COMPLETED'` and will stop appearing in future `/init` responses.

## The UX contract

- **`status === 'ACTIVE'`**: player has an unstarted promo. Before their next bet, show an opt-in prompt: "Start Free Spins" vs "Continue Normal Play". If they choose to start, send `usePromo: true` on the `/spin` call that follows - this is what transitions the award to `IN_PROGRESS` server-side.
- **`status === 'IN_PROGRESS'`**: the promo has started. The RGS will auto-continue consuming it on every subsequent `/spin` **regardless of what `usePromo` is set to** - this is a server-enforced "must finish once started" rule. You don't need to keep sending `usePromo: true` after the first spin, but it doesn't hurt to.
- **Stake is server-authoritative**: while a promo is `IN_PROGRESS`, use `promoInfo.betAmount` for display and do not let the player change the stake. Don't send a different `betAmount` expecting it to apply to the promo spin - the server ignores the client's notion of stake for promo rounds.
- **Counter**: drive an on-screen progress indicator using both fields: `${playCount - remainingPlayCount} / ${playCount}` for spins used, or `${remainingPlayCount} / ${playCount}` for spins remaining, updated after each `/spin`/`/feature` response. Optionally display `totalWin` as a "won so far" total during the promo.
- **Deferral**: if the player picks "Continue Normal Play" while `status === 'ACTIVE'`, nothing is consumed - just don't send `usePromo: true`. The offer resurfaces on your own logic; re-check `promoInfo` on the next `/init` (a fresh session, or a balance-zero re-entry) and re-offer the prompt. Declining bumps `skipCount` server-side for analytics; you don't need to track that client-side.

## What you explicitly do NOT need to do

- **No `promoId` handling.** There is no field on the `/spin` request to echo an id back. The backend auto-detects which promo applies by `userId` + `brand` + `game` (business rules guarantee at most one active promo at a time). The only client-side signal is the boolean `usePromo` on `/spin`.
- **No local persistence of promo state** across sessions or page reloads. The server is authoritative; state is always re-derived from the next `/init` call.
- **No client-side spin-count or stake enforcement.** If your UI sends a mismatched value, the server rejects/corrects it - you don't need defensive logic for this.

## Where to hook this in

Based on the actual structure of this repo (`src/corelib`, `src/brandlib`, `src/slots/<game>`):

### 1. Request payload - `src/brandlib/models/MessageServiceProxy.ts`

`getSpinRequestObject(isBuyBonus)` (around line 81) builds the `/spin` request body sent by `requestSpinResult()`. Add a `usePromo` flag here the same way `buyBonus.bb` is added today:

```ts
getSpinRequestObject(isBuyBonus) {
  const finalObj: any = {};
  ...
  if (appModel.getShouldUsePromo()) {
    finalObj.usePromo = true;
  }
  ...
}
```

(`getShouldUsePromo()` is a method you'd add to `appModel` - true once the player has opted in via the prompt, or once `promoInfo.status === 'IN_PROGRESS'` so it keeps being sent on the resumed round.)

### 2. Storing `promoInfo` - `src/corelib/models/services/AppModelService.ts`

`promoInfo` isn't captured anywhere in `appModel` today. It needs to be added in three places that mirror how other server data is already stored:

- `storeGameInitData(data)` (line 254) - store `data.promoInfo` alongside `this.gameInfo`/`this.playerInfo`.
- `storeSpinResult(data)` (line 344) - store `data.promoInfo` (present once the round settles).
- `storeFeatureResult(data)` (line 365) - same, for mid-feature/completion responses.

Add corresponding getters (`getPromoInfo()`, `getIsPromoActive()`, `getIsPromoInProgress()`, `getPromoRemainingCount()`) next to the existing free-spin getters (`getIsFreeSpinsSession()`, `getTotalFreespins()`, etc. around line 934) - the existing free-spin session state is a reasonable pattern to follow, but keep it a distinct flag since this is not the same thing as an in-game bonus feature.

### 3. Surfacing the opt-in prompt

The event `GAME_INIT_SUCCESS` (`SlotEvents.ts` line 14) fires from `MessageServiceProxy.handleServerResponse` right after `storeGameInitData()` runs - this is the natural hook to check `promoInfo.status === 'ACTIVE'` on game load and show the prompt. For deferred re-offers during play (balance-zero re-entry within a session), `GameIdleState.enableGame()` (`src/corelib/commands/states/GameIdleState.ts`) is where the game returns to an idle, bettable state after each round - a reasonable second checkpoint to re-check `promoInfo` and resurface the prompt if it's still `ACTIVE` and the player hasn't been shown it yet this idle cycle.

### 4. Popup UI - reuse the existing modal pattern

There's no promo-specific popup yet, but there is a well-established reusable pattern for exactly this kind of player-facing prompt:

- `src/brandlib/views/popups/FSPopupComp.ts` and `MessagePopupView.ts` show how popups are built: listen for a `SlotEvents` event (e.g. `SHOW_FS_POPUP`), set `GameProxy.config.isPopupOpened = true`, dispatch `SlotEvents.SHOW_MODAL_VIEW` to dim/block the game, and dispatch `SlotEvents.HIDE_MODAL_VIEW` + `isPopupOpened = false` on close.
- Popups are registered as listeners in `src/corelib/views/containers/SlotAppView.ts` (see `SHOW_MESSAGE_POPUP` / `SHOW_FS_POPUP` listeners around line 65).
- A new `PromoOptInPopupComp` (or similar) should follow this exact convention: two buttons ("Start Free Spins" / "Continue Normal Play"), dispatched via a new `SHOW_PROMO_POPUP` event added to `src/corelib/events/SlotEvents.ts`, with the "Start" callback setting the opt-in flag on `appModel` before the next `/spin` fires.

Note: `FSPopupComp` itself is for the natural in-game bonus feature entry (`EnterFreespinsState`/`ExitFreespinsState`/`CheckFSState`), not promo freespins - don't reuse the component, reuse the *pattern*.

### 5. Bet controls while `IN_PROGRESS`

`src/brandlib/views/popups/BetPanelView.ts` drives bet selection via `disabledView` config entries (`betSelectionBtn`, `betSelectionSelectedBtn`). While `promoInfo.status === 'IN_PROGRESS'`, disable bet selection the same way other forced-bet flows already do (e.g. the ante flow dispatches `SlotEvents.DISALBE_ANTE_BB_BUTTON` to lock bet controls) - display `promoInfo.betAmount` instead of the player-selected stake, and re-enable normal bet selection once the promo's `remainingPlayCount` reaches 0 and `promoInfo` stops appearing.

## Quick reference: response fields per call

```ts
// POST /init  -> IInitResponse
{ ...gameInfo, playerInfo, promoInfo?: IPromoInfo }

// POST /spin -> ISpinResponse
{ gameId, roundId, closed, result, playerInfo, promoInfo?: IPromoInfo }

// POST /feature -> IFeatureResponse
{ gameId, closed, playerInfo, result, betType, promoInfo?: IPromoInfo }
```
