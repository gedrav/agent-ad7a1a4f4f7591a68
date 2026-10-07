# Shared Jackpot (Jackpot Cards): Game Frontend (feg_games_src) Design

- Date: 2026-10-05
- Status: Approved (2026-10-07)
- Branch: `feature/shared-jackpot` (also in `feg_games_assets` for cheat entries)
- Scope: plumbing only (data, events, API calls, state flow, cheats). Visual and UX polish stays with the FE team.
- Development and test game: `carpathiantreasures` (already mounts the jackpot screens)
- Backend spec: `feg_slot_be/docs/superpowers/specs/2026-10-04-shared-jackpot-design.md` (sections 7, 8, 9 are the server side of this contract)

---

## 1. Goal

Wire the existing jackpot UI (meter panel, 12-card pick game, intro/outro, win ticker) to the real shared-jackpot backend so that the FE team can take it forward on visuals only.

Done means, on `carpathiantreasures` against a staging pool:

1. Meters show real pool values from init and update live from realtime, hidden when the game has no pool.
2. A triggered jackpot (natural or via cheat) runs the card game with server-revealed cards, ends at the 3rd matching tier, shows the real amount and updates the balance.
3. Reloading mid-reveal resumes with already opened cards.
4. The winner never sees the meter reset before the reveal ends.
5. Builds already deployed keep working unchanged (no jackpot events reach them).

## 2. What exists today (feg-main `bcaf311c`)

| Piece | File | State |
| ----- | ---- | ----- |
| Meter panel | `src/brandlib/views/comps/JackpotPanelComp.ts`, `JackPotItem.ts`, `src/brandlib/config/JackpotPanelConfig.ts` | 4 items, skins `bronze/silver/gold/diamond`; values from a dummy ticker (`dummyNumber += 0.1`); win ticker counts to a hard-coded 500 |
| Card game | `src/brandlib/views/comps/JackpotCardsComp.ts`, `JackpotCard.ts`, `src/brandlib/config/JackpotCardConfig.ts` | 12 cards; all skins assigned up front from a dummy array; finishes only after all 12 are clicked |
| Background | `src/brandlib/views/comps/JackpotGameBGComp.ts`, `JackpotBGConfig.ts` | Shown/hidden by events |
| State | `src/corelib/commands/states/ShowJackpotGameState.ts` | intro -> cards -> win ticker -> hide; entered from `CompleteGameRoundState` when `appModel.storeJackpotData` is truthy (never set today) |
| Mounting | `src/slots/carpathiantreasures/config/screens/SlotGameAppConfig.ts`, `config/StatesConfig.ts` | Only game with the jackpot screens and state |
| Realtime | `src/corelib/models/services/RealtimeConnectionService.ts`, `src/corelib/app/SlotGameApp.ts` | Connects `/sse/balance`; every event is dispatched as `REALTIME_BALANCE_UPDATE`; `onRealTimeUpdate` consumes `spinRequestSent` and dispatches `UPDATE_BALANCE` for any event |
| Cheats | `feg_games_assets/<game>/panel/cheat.json`, `MessageServiceProxy.getSpinRequestObject` | Entries with `extraData` are merged into the spin request |
| Unfinished | `CheckUnfinishedState.ts` (used by carpathiantreasures), `CheckUnfinishedStateV2.ts` | No jackpot branch |

## 3. Backend contract consumed

All amounts are in the player's currency, already rounded down by the server. Tier order is always `MINI, MINOR, MAJOR, GRAND`.

### 3.1 Init (`POST games/init`)

```ts
interface IJackpotInfo {
  poolId: string;
  configVersion: number;
  demo: boolean;            // true: meters only, never triggers; show "not available in demo"
  available: boolean;       // false: pool paused or jackpot temporarily unavailable
  currency: string;
  rtp: number;              // jackpot RTP % (rules: base + this)
  minEligibleBet: number;   // bets below this do not take part
  eligibleBetTypes: ['BASE'];
  tiers: { tier: JackpotTier; suit: string; value: number }[];
  v: number;                // meter version
}
type JackpotTier = 'MINI' | 'MINOR' | 'MAJOR' | 'GRAND';
// init response: jackpotInfo: IJackpotInfo | null   (null = no jackpot UI)
```

Unfinished round with a pending reveal: `unfinishedInfo.jackpot: IJackpotRound` (3.3) with `status: 'PENDING'`.

### 3.2 Spin and feature (`POST games/spin`, `POST games/feature`)

Unchanged request. Response gains a top-level field (outside `result`, so it never clashes with in-game jackpots such as jokercharge):

```ts
jackpot?: IJackpotRound | null;   // present only when this round triggered the shared jackpot
```

When `jackpot.status === 'PENDING'` the round is still open (`closed: false`); the base game win is not yet credited and arrives with the final pick.

### 3.3 Pick (`POST games/jackpot/pick`)

Request (encrypted like the others via `encryptObject`):

```ts
{ gameId, playerId, token, epoch?, roundId, position }   // position 0..11
```

Response:

```ts
interface IJackpotPick { position: number; tier: JackpotTier; suit: string }

interface IJackpotRound {
  status: 'PENDING' | 'COMPLETED';
  roundId: string;
  cards: 12;
  frozenMeters: number[];        // 4 values at trigger time, for display during the reveal
  picks: IJackpotPick[];         // all opened so far, in order
  pick?: IJackpotPick;           // the card opened by this request (pick response only)
  // only when COMPLETED:
  wonTier?: JackpotTier;
  amount?: number;               // jackpot win
  totalWin?: number;             // base game win + jackpot win
  remaining?: IJackpotPick[];    // the unopened cards, revealed at the end
}

// pick response
{ gameId, roundId, closed: boolean, playerInfo: { playerId, balance?, endTime? }, jackpot: IJackpotRound }
```

Rules the client relies on:

- The face of a card comes only from the server. Which position is clicked never changes the outcome (cards are dealt in reveal order).
- Picking an already opened position returns the current state unchanged.
- If the server auto-completed the reveal (timeout), any pick returns `status: 'COMPLETED'` with the final result; the client shows the end screen.
- `closed: true` and `playerInfo.balance` arrive with the completing pick.

### 3.4 Realtime (same stream, now `/sse/events`, opt-in)

The client must append `?jp=1` to the stream URL. Without it the server never sends jackpot events (protects deployed builds).

```
event: jackpot_meters
data: {"p":"<poolId>","v":88123401,"c":"CZK","t":[650.12,2800.40,10750.00,121000.55],"demo":false}

event: jackpot_won
data: {"p":"<poolId>","tier":"GRAND","amt":121000.55,"c":"CZK"}

event: jackpot_pool_changed
data: {"p":"<poolId>"}
```

- Payloads never contain `balance`.
- The server suppresses `jackpot_meters` for the winner (all their tabs) during a reveal; the client still applies the freeze rule in 4.3 for the tab that spun.
- Ticks arrive about once per second only when values change.

## 4. Design

### 4.1 New events (`src/corelib/events/SlotEvents.ts`)

| Event | Payload | Dispatched by |
| ----- | ------- | ------------- |
| `JACKPOT_INFO_READY` | `IJackpotInfo \| null` | `AppModelService.storeGameInitData` |
| `JACKPOT_METERS_UPDATE` | `{ values: number[], v: number }` | `RealtimeConnectionService` (after filtering, 4.3) |
| `JACKPOT_WON` | `{ tier, amount, currency }` | `RealtimeConnectionService` (hook only, no UI) |
| `JACKPOT_POOL_CHANGED` | `{ poolId }` | `RealtimeConnectionService` |
| `JACKPOT_PICK_RESULT` | `IJackpotRound` | `MessageServiceProxy` after a pick response |

Existing `SHOW_JACKPOT_INTRO_ANIM`, `SHOW_JACKPOT_CARD_GAME`, `JACKPOT_WIN_TICKER_ANIM`, `HIDE_JACKPOT_BG` are kept.

### 4.2 Model (`src/corelib/models/services/AppModelService.ts`)

New state:

```ts
jackpotInfo: IJackpotInfo | null;
jackpotRound: IJackpotRound | null;   // set when a round triggers, cleared when the reveal ends
jackpotMetersFrozen: boolean;         // see 4.3
jackpotMetersV: number;               // last applied meter version
jackpotMeters: number[];              // last displayed values
get jackpotPending(): boolean         // jackpotRound?.status === 'PENDING' or COMPLETED but not yet shown
```

- `storeGameInitData`: store `data.jackpotInfo`, seed `jackpotMeters`/`jackpotMetersV`, dispatch `JACKPOT_INFO_READY`; if `data.unfinishedInfo?.jackpot` exists, store it in `jackpotRound`.
- `storeSpinResult` / `storeFeatureResult`: `jackpotRound = data.jackpot ?? null`. If null, set `jackpotMetersFrozen = false`.
- `storeJackpotPick(data)`: update `jackpotRound`; on `COMPLETED` set balance from `playerInfo.balance`.
- `storeJackpotData` is replaced by `jackpotPending` (the old field is removed).

### 4.3 Meter freeze rule (spoiler prevention, client side)

- `MessageServiceProxy.requestSpinResult` and `requestBonusData` set `appModel.jackpotMetersFrozen = true` before sending.
- When the response arrives with no `jackpot`: unfreeze and apply the latest buffered tick.
- When the response has a pending jackpot: stay frozen and display `jackpotRound.frozenMeters`.
- When the reveal ends (`HIDE_JACKPOT_BG`): unfreeze and apply the latest buffered tick.
- While frozen, incoming ticks are kept as "latest" but not displayed. Ticks with `v <= jackpotMetersV` are dropped at all times.

### 4.4 Realtime (`src/corelib/models/services/RealtimeConnectionService.ts`)

- URL becomes `${VITE_REALTIME_URL}/sse/events?jp=1` (renamed from `/sse/balance`, which the server keeps as an alias for builds not yet updated; non-jackpot games move to `/sse/events` too).
- `onmessage` routes by `msg.event`:
  - `balance_updated`: unchanged, `REALTIME_BALANCE_UPDATE`.
  - `jackpot_meters`: ignore if `appModel.jackpotInfo` is null or `p` differs from `jackpotInfo.poolId`; apply 4.3; dispatch `JACKPOT_METERS_UPDATE`.
  - `jackpot_won`: dispatch `JACKPOT_WON`.
  - `jackpot_pool_changed`: dispatch `JACKPOT_POOL_CHANGED`; the game re-requests init when idle (next `GameIdleState`) to pick up the new `jackpotInfo`.
  - Unknown events: ignored (no longer forwarded as balance).

### 4.5 Meter panel (`JackpotPanelComp`, `JackPotItem`)

- Remove the dummy ticker. On `JACKPOT_INFO_READY`: `null` hides the panel; otherwise show and set the 4 values.
- On `JACKPOT_METERS_UPDATE`: tween each item from its current value to the new one over the tick interval (count-up), using the existing `Util.formatCurrency`.
- During the reveal show `jackpotRound.frozenMeters`.
- `demo: true` or `available: false`: expose a flag on the panel (`setNotice('demo' | 'unavailable' | null)`) with a placeholder text; visuals are FE team work.
- Win ticker (`showJackpotWinAnimation`) counts to `jackpotRound.amount` instead of 500.
- Index mapping item `i` <-> tier: `0 MINI (bronze)`, `1 MINOR (silver)`, `2 MAJOR (gold)`, `3 GRAND (diamond)`, matching `jackpotAnimSkin`.

### 4.6 Message proxy (`src/brandlib/models/MessageServiceProxy.ts`)

- `requestJackpotPick(position)`: builds `{ gameId, playerId, token, epoch, roundId: appModel.jackpotRound.roundId, position }`, encrypts, calls `getServerResponse('jackpotPick', req, 'jackpot/pick', 'POST')`.
- `handleServerResponse('jackpotPick')`: `appModel.storeJackpotPick(data)`, dispatch `JACKPOT_PICK_RESULT`.
- Errors go through the existing `HANDLE_SERVER_ERROR` path. The jackpot is never lost: a reload resumes it (4.9).

### 4.7 Round flow (`CompleteGameRoundState`, `ShowJackpotGameState`)

- `CompleteGameRoundState`: `if (appModel.jackpotPending) goToState(SHOW_JACKPOT_GAME_STATE)` replaces the `storeJackpotData` check. Runs after the base win is shown, as today.
- If autoplay is running when a jackpot triggers, stop it (reuse `AutoStopSpinCommand` behaviour) so the player picks manually.
- `ShowJackpotGameState` keeps its steps: intro -> `SHOW_JACKPOT_CARD_GAME` -> (cards complete) -> `JACKPOT_WIN_TICKER_ANIM` -> `HIDE_JACKPOT_BG` -> next. On exit: `appModel.jackpotRound = null`, unfreeze meters, `UPDATE_BALANCE`.

### 4.8 Card game (`JackpotCardsComp`, `JackpotCard`)

- Remove the dummy array; cards start face down with no skin assigned.
- On show: apply `jackpotRound.picks` (resume) by setting those cards open with their tier skins, without animation.
- Click on a closed card (only one request in flight at a time; other cards non-interactive while waiting):
  1. `MessageProxy.requestJackpotPick(index)`.
  2. On `JACKPOT_PICK_RESULT`: set the clicked card's skin from `pick.tier` (tier -> skin map 4.5), play the existing rotation.
  3. If `status === 'COMPLETED'`: disable all cards, highlight the 3 cards of `wonTier` (hook for FE team), reveal `remaining` on their positions, then `StateManager.doNextStep()` to the win ticker.
- If a completing response arrives for a different card than clicked (server auto-completed), the client renders the server state as-is.
- `card.reset()` on hide, as today.

### 4.9 Unfinished rounds (`CheckUnfinishedState`, `CheckUnfinishedStateV2`)

- First branch in both: if `appModel.jackpotRound?.status === 'PENDING'`, go to `SHOW_JACKPOT_GAME_STATE` (cards restored from `picks`, meters frozen at `frozenMeters`). This takes priority over the feature checks, because the shared jackpot is always the last step of a round.

### 4.10 Cheats (`feg_games_assets/carpathiantreasures/panel/cheat.json`)

No client code. Entries use the existing `extraData` path; game-core honours them only when `devMode` is on:

```json
{
  "JP Force MINI":  { "extraData": { "jpCheat": { "tier": "MINI" } } },
  "JP Force MINOR": { "extraData": { "jpCheat": { "tier": "MINOR" } } },
  "JP Force MAJOR": { "extraData": { "jpCheat": { "tier": "MAJOR" } } },
  "JP Force GRAND": { "extraData": { "jpCheat": { "tier": "GRAND" } } }
}
```

Merged into the existing carpathiantreasures cheat list (existing entries untouched).

## 5. Files touched

| Repo | File | Change |
| ---- | ---- | ------ |
| feg_games_src | `src/corelib/events/SlotEvents.ts` | 5 new events |
| feg_games_src | `src/types/index.d.ts` (or a new `src/corelib/models/jackpot.types.ts`) | `IJackpotInfo`, `IJackpotRound`, `IJackpotPick`, `JackpotTier` |
| feg_games_src | `src/corelib/models/services/AppModelService.ts` | 4.2 |
| feg_games_src | `src/corelib/models/services/RealtimeConnectionService.ts` | 4.4 |
| feg_games_src | `src/brandlib/models/MessageServiceProxy.ts` | 4.3, 4.6 |
| feg_games_src | `src/corelib/commands/states/CompleteGameRoundState.ts`, `ShowJackpotGameState.ts` | 4.7 |
| feg_games_src | `src/corelib/commands/states/CheckUnfinishedState.ts`, `CheckUnfinishedStateV2.ts` | 4.9 |
| feg_games_src | `src/brandlib/views/comps/JackpotPanelComp.ts`, `JackPotItem.ts` | 4.5 |
| feg_games_src | `src/brandlib/views/comps/JackpotCardsComp.ts`, `JackpotCard.ts` | 4.8 |
| feg_games_assets | `carpathiantreasures/panel/cheat.json` | 4.10 |

No changes to games other than through the shared `corelib`/`brandlib`. Games that do not mount the jackpot configs are unaffected (no `jackpotInfo` -> nothing shown; `jackpot` never present in their responses unless their pool includes them).

## 6. Out of scope

- Visual design, animations, sounds, "you won" polish, win announcement toast UI, demo/unavailable notice visuals.
- Mounting the jackpot screens in other games (FE team, after pilot games are chosen).
- Lobby meters, game history jackpot view (`game_history_fe`, separate work).
- Automated tests.

## 7. Verification (manual, carpathiantreasures on staging)

1. Game in a LIVE pool: meters visible with init values, ticking.
2. Game not in a pool: no panel, no jackpot events on the stream.
3. Cheat each tier: card game runs, ends on the 3rd matching tier, amount and balance correct, meters resume.
4. Reload during the reveal: resumes with opened cards and frozen meters.
5. Second tab of the same player during a reveal: meters do not change until the reveal ends.
6. Old build (without `?jp=1`) against the same backend: balance push still works, no jackpot events received.
