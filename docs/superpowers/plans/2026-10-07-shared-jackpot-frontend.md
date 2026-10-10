# Shared Jackpot Game Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the existing jackpot UI in feg_games_src (meter panel, 12-card pick game, intro/outro, win ticker) to the real shared-jackpot backend, with carpathiantreasures as the test game.

**Architecture:** Server data flows through `AppModelService` (init `jackpotInfo`, spin/feature `jackpot`, pick responses) and `RealtimeConnectionService` (meters, wins, pool changes on `/sse/events?jp=1`); views react to new `SlotEvents`; the round flow enters `ShowJackpotGameState` when a jackpot is pending, including after reload.

**Tech Stack:** TypeScript, Vite, PixiJS game framework in `src/corelib` / `src/brandlib`, `@microsoft/fetch-event-source`, npm.

**Spec:** `docs/superpowers/specs/2026-10-05-shared-jackpot-frontend-design.md` (approved; read it first, sections 3 and 4 are the contract and design). Also read the repo `CLAUDE.md`.

## Global Constraints

- Branch `feature/shared-jackpot` in feg_games_src and feg_games_assets. Commit after each task with explicit paths.
- Scope is plumbing only (data, events, API calls, state flow, cheats); no visual redesign.
- Backend contract (verified against feg_slot_be game-core):
  - Pick: `POST games/jackpot/pick`, body DTO fields `gameId`, `token`, `roundId`, `position` (0..11), `epoch?` only. The spec also lists `playerId`; check the game-core validation pipe before sending extra fields (send `playerId` only if the existing request builders always send it and the server accepts unknown fields).
  - Cheat: game-core reads `extraData.jpCheat.tier` (dev mode only).
  - Realtime stream path is `/sse/events` (server keeps `/sse/balance` as an alias); jackpot events need `?jp=1`; `jackpot_won` payload is `{ p, tier, amt, c }` (no brand).
- Tier order `BRONZE, SILVER, GOLD, DIAMOND`; tier <-> panel index 0..3 <-> skins `bronze, silver, gold, diamond`.
- Amounts arrive in player currency already rounded down; never recompute money client-side.
- Games that do not mount jackpot screens must behave exactly as before (no `jackpotInfo` -> nothing shown, unknown realtime events ignored, balance events unchanged).
- During implementation tasks do NOT run type-check, lint, build or tests (user rule); Task 6 runs them once. No new npm dependencies.
- No em dashes. Comments only for non-obvious "why", max one line.

## Review Focus

- Deployed and non-jackpot builds: realtime events other than `balance_updated` must never dispatch `REALTIME_BALANCE_UPDATE` (today every event does).
- Double clicks on cards: only one pick request in flight; other cards non-interactive until the response arrives; an error re-enables the closed cards.
- Out-of-order meter ticks: ticks with `v <= jackpotMetersV` are dropped; ticks during a freeze are buffered (latest only) and applied on unfreeze.
- Server auto-complete during the reveal: a pick returning `COMPLETED` for a different card (or with no `pick`) renders server state as-is and goes to the win ticker.
- Reload mid-reveal: `unfinishedInfo.jackpot` takes priority over feature resume checks in both unfinished states.

---

### Task 1: Types, events and model state

**Files:**
- Create: `src/corelib/models/jackpot.types.ts`
- Modify: `src/corelib/events/SlotEvents.ts`, `src/corelib/models/services/AppModelService.ts`, `src/corelib/app/SlotGameApp.ts` (only where it references `storeJackpotData`), `src/corelib/commands/states/CompleteGameRoundState.ts` (only the `storeJackpotData` reference)

**Interfaces:**
- Produces types (spec 3.1-3.3): `JackpotTier`, `IJackpotInfo`, `IJackpotPick`, `IJackpotRound`, `IJackpotPickResponse` (`{ gameId; roundId; closed: boolean; playerInfo: { playerId; balance?; endTime? }; jackpot: IJackpotRound }`), `JACKPOT_TIERS` const, `JACKPOT_SKINS = ['bronze','silver','gold','diamond']`.
- Produces events (spec 4.1): `JACKPOT_INFO_READY`, `JACKPOT_METERS_UPDATE`, `JACKPOT_WON`, `JACKPOT_POOL_CHANGED`, `JACKPOT_PICK_RESULT`, following the existing `SlotEvents` naming/declaration style.
- Produces `AppModelService` members (spec 4.2): `jackpotInfo`, `jackpotRound`, `jackpotMetersFrozen`, `jackpotMetersV`, `jackpotMeters`, `latestJackpotTick: { values: number[]; v: number } | null`, getter `jackpotPending`, methods `storeJackpotPick(data: IJackpotPickResponse)`, `applyJackpotTick(tick)` (drops `v <= jackpotMetersV`; when frozen stores it in `latestJackpotTick`, else updates `jackpotMeters`/`jackpotMetersV` and dispatches `JACKPOT_METERS_UPDATE`), `freezeJackpotMeters()`, `unfreezeJackpotMeters()` (applies `latestJackpotTick` if newer).

- [ ] **Step 1:** Write `jackpot.types.ts` from spec 3.1-3.3.
- [ ] **Step 2:** Add the 5 events.
- [ ] **Step 3:** `AppModelService`: add the state and methods above. `storeGameInitData`: store `data.jackpotInfo ?? null`, seed meters from `tiers[i].value` and `v`, dispatch `JACKPOT_INFO_READY`; if `data.unfinishedInfo?.jackpot` set `jackpotRound`. `storeSpinResult` / `storeFeatureResult`: `jackpotRound = data.jackpot ?? null`; when null call `unfreezeJackpotMeters()`. `storeJackpotPick`: update `jackpotRound`; on `COMPLETED` with `playerInfo.balance` update the balance the same way spin results do.
- [ ] **Step 4:** Remove `storeJackpotData` (field, getter/setter) and switch its two readers (`SlotGameApp`, `CompleteGameRoundState`) to `jackpotPending` (the full `CompleteGameRoundState` flow is Task 4; here only keep it compiling).
- [ ] **Step 5:** Commit: `feat(jackpot): jackpot types, events and model state`.

### Task 2: Realtime routing, meter freeze and pick request

**Files:**
- Modify: `src/corelib/models/services/RealtimeConnectionService.ts`, `src/brandlib/models/MessageServiceProxy.ts`

**Interfaces:**
- Consumes: Task 1 model methods and events.
- Produces: `MessageServiceProxy.requestJackpotPick(position: number): void` and the `'jackpotPick'` response handling that calls `appModel.storeJackpotPick(data)` then dispatches `JACKPOT_PICK_RESULT` with `appModel.jackpotRound`.

- [ ] **Step 1:** Realtime: URL `${baseUrl}/sse/events?jp=1`. `onmessage` routes by `msg.event`: `balance_updated` -> unchanged balance path; `jackpot_meters` -> ignore when `appModel.jackpotInfo` is null or `p !== jackpotInfo.poolId`, else `appModel.applyJackpotTick({ values: t, v })`; `jackpot_won` -> dispatch `JACKPOT_WON` `{ tier, amount: amt, currency: c }`; `jackpot_pool_changed` -> dispatch `JACKPOT_POOL_CHANGED` `{ poolId: p }`; any other event ignored (no longer forwarded as balance). Keep reconnect/online/offline behaviour.
- [ ] **Step 2:** Freeze rule (spec 4.3): `requestSpinResult` and `requestBonusData` call `appModel.freezeJackpotMeters()` before sending; the model already unfreezes when the response has no jackpot (Task 1).
- [ ] **Step 3:** `requestJackpotPick(position)`: build the request like the spin request builder (same token/epoch/gameId sources), fields per the Global Constraints, `roundId: appModel.jackpotRound.roundId`, encrypt with `encryptObject`, `getServerResponse('jackpotPick', req, 'jackpot/pick', 'POST')`; handle `'jackpotPick'` in `handleServerResponse`. Errors use the existing `HANDLE_SERVER_ERROR` path.
- [ ] **Step 4:** Pool changed: on `JACKPOT_POOL_CHANGED`, set a model flag `jackpotReinitPending = true`; the game re-requests init at the next idle (`GameIdleState`: if the flag is set, clear it and call the existing init request path that refreshes `jackpotInfo`; if re-requesting init is not supported mid-session, instead hide the panel by dispatching `JACKPOT_INFO_READY` with `null`). Pick whichever the existing code supports and note the choice in the report.
- [ ] **Step 5:** Commit: `feat(jackpot): realtime jackpot events, meter freeze and pick request`.

### Task 3: Meter panel and card game

**Files:**
- Modify: `src/brandlib/views/comps/JackpotPanelComp.ts`, `src/brandlib/views/comps/JackPotItem.ts`, `src/brandlib/views/comps/JackpotCardsComp.ts`, `src/brandlib/views/comps/JackpotCard.ts`

**Interfaces:**
- Consumes: `JACKPOT_INFO_READY`, `JACKPOT_METERS_UPDATE`, `JACKPOT_PICK_RESULT`, `appModel.jackpotRound`, `appModel.jackpotMeters`, `MessageServiceProxy.requestJackpotPick`, `JACKPOT_TIERS`, `JACKPOT_SKINS`.
- Produces: `JackpotPanelComp.setNotice(kind: 'demo' | 'unavailable' | null)`, `JackpotPanelComp.showFrozen(values: number[])`.

- [ ] **Step 1:** Panel (spec 4.5): remove the dummy ticker; `JACKPOT_INFO_READY` null hides the panel, otherwise show and set 4 values; `JACKPOT_METERS_UPDATE` tweens each item from current to new value over about 1 s using the existing `Util.formatCurrency`; during a reveal show `jackpotRound.frozenMeters`; `setNotice('demo')` when `jackpotInfo.demo`, `setNotice('unavailable')` when `!jackpotInfo.available` (placeholder text); win ticker (`showJackpotWinAnimation`) counts to `jackpotRound.amount` instead of 500.
- [ ] **Step 2:** Cards (spec 4.8): remove the dummy skin array; cards start face down; on show restore `jackpotRound.picks` (open with tier skins, no animation); click on a closed card: lock all cards, `requestJackpotPick(index)`; on `JACKPOT_PICK_RESULT`: set the picked card's skin from `pick.tier` and play the existing rotation; if `status === 'COMPLETED'`: disable all, mark the 3 cards of `wonTier` (hook method `highlightWinning(positions)`), reveal `remaining` on their positions, then `StateManager.doNextStep()`; else unlock the closed cards. On a server error unlock closed cards. A completing response for a different card than clicked renders server state as-is. `card.reset()` on hide stays.
- [ ] **Step 3:** Commit: `feat(jackpot): real meter values and server-driven card game`.

### Task 4: Round flow and unfinished resume

**Files:**
- Modify: `src/corelib/commands/states/CompleteGameRoundState.ts`, `src/corelib/commands/states/ShowJackpotGameState.ts`, `src/corelib/commands/states/CheckUnfinishedState.ts`, `src/corelib/commands/states/CheckUnfinishedStateV2.ts`

- [ ] **Step 1:** `CompleteGameRoundState`: `if (appModel.jackpotPending) goToState(SHOW_JACKPOT_GAME_STATE)`; if autoplay is running, stop it first using the existing auto-stop command so the player picks manually.
- [ ] **Step 2:** `ShowJackpotGameState`: keep intro -> `SHOW_JACKPOT_CARD_GAME` -> (cards complete) -> `JACKPOT_WIN_TICKER_ANIM` -> `HIDE_JACKPOT_BG` -> next; show frozen meters on entry; on exit `appModel.jackpotRound = null`, `appModel.unfreezeJackpotMeters()`, dispatch `UPDATE_BALANCE`.
- [ ] **Step 3:** Both unfinished states: first branch `if (appModel.jackpotRound?.status === 'PENDING')` -> freeze meters, go to `SHOW_JACKPOT_GAME_STATE` (before any feature resume checks).
- [ ] **Step 4:** Commit: `feat(jackpot): jackpot round flow and reveal resume after reload`.

### Task 5: Cheats (feg_games_assets)

**Files:**
- Modify: `/Users/arghyac35/Documents/gitProject/pixentech/FEG/feg_fe/feg_games_assets/carpathiantreasures/panel/cheat.json`

- [ ] **Step 1:** Read the file's existing structure and add four entries in the same format: "JP Force BRONZE|SILVER|GOLD|DIAMOND" with `extraData: { jpCheat: { tier: "<TIER>" } }` (existing entries untouched).
- [ ] **Step 2:** Commit in feg_games_assets: `feat(jackpot): carpathiantreasures jackpot cheats`.

### Task 6: Verification

- [ ] **Step 1:** `npx tsc --noEmit -p tsconfig.json` in feg_games_src; fix errors in files from Tasks 1-4.
- [ ] **Step 2:** `npx eslint` on the changed files only (the full `npm run lint` scans all of `src`); fix errors in changed files.
- [ ] **Step 3:** Build carpathiantreasures (read `scripts/build-all.js` for a single-game option; if none, run `npm run build:development`) and confirm success.
- [ ] **Step 4:** Commit fixes: `fix(jackpot): type-check and lint fixes for jackpot wiring`.
