# FEG Games

TypeScript + PixiJS v8 slot game engine. Multiple games share a common engine (`corelib`) and brand UI layer (`brandlib`), with each game isolated under `src/slots/<gameId>/`.

## Running a Single Game Locally

### Option 1: GAME_ID env var (recommended)

```bash
GAME_ID=empireofgold npm run dev
GAME_ID=empireofgoldnewconquest npm run dev
GAME_ID=royale81 npm run dev
GAME_ID=sweetsalon npm run dev
GAME_ID=frostedmarketbonanza npm run dev
```

### Option 2: Edit vite.config.js

Uncomment the desired game in `vite.config.js` under `defaultGameNames`, then run `npm run dev`.

> Default game is `royale81` if no `GAME_ID` is set. Dev server runs on port **8002**.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server for the active game |
| `npm run build` | Build all games (production) |
| `npm run build:staging` | Build all games in staging mode |
| `npm run build:development` | Build all games in development mode |
| `npm run preview` | Preview the built output |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |

Build output goes to `../feg_games_build/<gameId>/`. Game assets are loaded from `../feg_games_assets/<gameId>/` and `../feg_games_assets/common/` (outside this repo).

---

## Architecture

### Layer overview

```
src/
  corelib/     Engine layer - app lifecycle, state machine, proxies, commands, pixi wrappers, utils
  brandlib/    Brand UI layer - preloader, splash, popups, control panel, bet panel, menus
  slots/<id>/  Game layer - game-specific app, configs, views, states
  types/       Global TypeScript declarations
```

### Path aliases

| Alias | Resolves to |
|-------|-------------|
| `@core` | `src/corelib` |
| `@brand` | `src/brandlib` |
| `@game` | `src/slots/<GAME_ID>` (env-driven at build/dev time) |
| `@slots` | `src/slots` |
| `@assets` | `../feg_games_assets/<GAME_ID>` |
| `@common` | `../feg_games_assets/common` |

`@game` is the only alias that changes per game. All game code imports its own config, views, and states via `@game/...`.

---

## App Startup Flow

`src/main.ts` instantiates `new gameApp()` from `@game/app/gameApp`. Every game's `gameApp` extends `SlotGameApp` (`@core/app/SlotGameApp`) and calls `this.setupApp(GAME_CONFIG, ASSET_CONFIG, GAME_SOUND_CONFIG, STATES_CONFIG)`.

`setupApp` sequence:
1. PixiJS `Application` init - iOS gets capped resolution (max 2x) and no antialias
2. `GameProxy.setGameConfig(gameConfig)` - stores game config
3. `StateManager.setStates(statesConfig)` - registers the state machine
4. `WrapperProxy.readURLParams()` - extracts player token, language, currency from URL
5. Asset loading pipeline (see below)
6. `MessageProxy.requestGameInit()` - sends gameinit request to server

Asset loading pipeline (sequential bundles):
```
preloader -> splash -> primary -> sounds -> [game started] -> secondary (lazy) -> features (lazy)
```

After `primary` + `sounds` + `gameInit` all arrive, `createView()` is called on the game class and the game becomes interactive.

---

## State Machine

Game flow is a linear state machine in `StateManager` (`@core/states/StateManagerService`). Each game registers its states in `config/StatesConfig.ts`. Core states live in `@core/commands/states/`.

Standard spin cycle:
```
CheckUnfinishedState
  -> GameIdleState          (wait for spin click)
  -> SpinStartState         (send spin request)
  -> SpinResponseReceivedState (receive result, stop reels)
  -> SpinStoppedState
  -> PreSpinWinState        (game can override for custom pre-win logic)
  -> ShowSpinWinState       (animate win)
  -> CheckFeatureState      (freespins / buy bonus check)
  -> CompleteGameRoundState (balance update, cleanup)
  -> CheckAutoSpinState
  -> StartAutoSpinState
```

Games override individual states by importing a custom class and substituting it in `StatesConfig.ts`. Example: `royale81` uses `GamePreWinState` instead of `PreSpinWinState`.

State commands implement three methods:
- `execute(data?)` - entry point, start the state
- `doNextStep(data?)` - advance within the state
- `destroy()` - cleanup before transitioning out

---

## Key Singletons

| Singleton | Import | Purpose |
|-----------|--------|---------|
| `appModel` | `@core/models/services/AppModelService` | Central data store: game result, bet position, balance, free spin session, autoplay session, cascade/tumble index |
| `GameProxy` | `@core/models/GameConfigProxy` | Game config + API URLs (from env vars) |
| `DeviceProxy` | `@core/models/DeviceConfigProxy` | Window dimensions, DPR, iOS/mobile detection |
| `WrapperProxy` | `@brand/models/WrapperServiceProxy` | URL params, player token, postMessage to parent iframe |
| `ContentProxy` | `@core/models/ContentServiceProxy` | i18n text lookups |
| `StateManager` | `@core/states/StateManagerService` | State machine runner |
| `EventHandler` | `@core/pixiwrapper/EventHandlerService` | Global event bus (wraps PixiJS EventEmitter on `app.stage`) |

---

## Event System

All cross-component communication goes through `EventHandler`:

```ts
// dispatch
EventHandler.dispatchEvent(SlotEvents.SPIN_CLICKED, data);

// listen
EventHandler.addEventListener(SlotEvents.SPIN_CLICKED, this.onSpinClicked.bind(this));

// remove
EventHandler.removeEventListener(SlotEvents.SPIN_CLICKED, this.onSpinClicked.bind(this));
```

Event name constants:
- `@core/events/SlotEvents.ts` - game-specific events (spin, win, freespins, errors)
- `@core/events/AppEvents.ts` - engine events (resize, frame update, asset bundles, focus change)

---

## Commands Pattern

**Action commands** (`@core/commands/action/`) handle user interactions. They are stateless and called directly:

```ts
SpinClickCommand.execute();
BetClickCommand.execute();
AutoplayClickCommand.execute();
```

UI config objects reference command classes directly (not instances):

```ts
btn: {
  action: { press: SpinClickCommand }
}
```

**State commands** (`@core/commands/states/`) handle game flow. They are registered in `StatesConfig.ts` and driven by `StateManager`. Extend `StateCommand` from `@core/commands/core/StateCommand`.

---

## Game Config Structure

Every game under `src/slots/<id>/config/` must provide:

| File | Purpose |
|------|---------|
| `GameConfig.ts` | Game dimensions, colors, version, creditValue, totalLines, supported languages, bigWinValues, font names |
| `AssetConfig.ts` | Asset bundle definitions (preloader, splash, primary, secondary, features) |
| `SoundLoadConfig.ts` | Sound file mappings per bundle |
| `StatesConfig.ts` | State machine array - ordered list of `{ name, state }` objects |
| `UIConfig.ts` | UI element positions, sizes, offsets (extends/overrides CoreUIConfig from brandlib) |

Screen-level configs (positions, scales, texture names for each view) live in `config/screens/`.

---

## Adding a New Game

1. Copy an existing game folder: `cp -r src/slots/royale81 src/slots/<newGameId>`
2. Update `config/GameConfig.ts`: set `gameId`, `gameName`, `gameVersion`, dimensions
3. Update `config/AssetConfig.ts`: point bundle paths to new asset folder
4. Update `config/StatesConfig.ts`: add/remove states as needed
5. Add `<newGameId>` to `CONFIGURED_GAME_IDS` in `scripts/build-all.js`
6. Add assets to `../feg_games_assets/<newGameId>/`

---

## Environment Variables

Each `.env.<mode>` file sets:

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Backend game API base URL |
| `VITE_SOCKET_URL` | WebSocket server URL |
| `VITE_EXTERNAL_URL` | External service base URL |
| `VITE_HISTORY_URL` | Bet history page URL |
| `VITE_HISTORY_API_URL` | Bet history API endpoint |
| `VITE_GAME_VERSION` | Version string logged to console on load |

URLs are injected into `GameProxy.config` at runtime via `GameProxy.createAPIPath()`.

---

## Build Chunks

Vite splits output into three chunks per game:

| Chunk | Contains |
|-------|---------|
| `vendor-pixi` | All `node_modules` (pixi, gsap, howler, i18next, etc.) |
| `core-engine` | `corelib` + `brandlib` |
| `game-<id>` | Game-specific code under `src/slots/<id>` |

Production builds apply gzip + Brotli compression. Entry point is always `assets/index-canvas.js`.

---

## Development Patterns

### Responsive layout
Views extend `ResponsiveView` or `StandardView` from `@core/pixiwrapper/`. They listen for `AppEvents.APP_RESIZE` via `EventHandler` and reposition/rescale children. Use `DeviceProxy.config.windowWidth/windowHeight` for current dimensions.

### Proxy registration
Proxies that need to call back into the app (e.g., for server responses) call `registerProxy(facade)` passing the `SlotGameApp` instance. Avoid coupling proxies to views directly.

### Asset loading
Assets are loaded as named bundles via `AssetLoader`. Check `appModel.primaryAssetsLoaded` / `appModel.secondaryAssetsLoaded` before accessing textures from secondary bundles.

### Win type thresholds
`appModel.getWinType()` computes big win tiers from `GameProxy.config.bigWinValues` (array of 4 bet multipliers: big, mega, gigantic, unbelievable). Configure per game in `GameConfig.ts`.

### Turbo mode
`GameProxy.config.isTurboOn` controls turbo. Action command `TurboStateChangeCommand` toggles it. State commands check this flag to skip or shorten animations.

### Free spins session
`appModel.startFreeSpinsSession()` / `endFreeSpinsSession()` mark FS boundaries. Use `appModel.getIsFreeSpinsSession()` inside states and views to branch FS vs base game logic.

### Cascade/tumble games
`appModel.tumbleIndex` advances per cascade. `appModel.isCascadeGame()` and `appModel.isTumbleRemaining()` drive cascade loops in state commands. Use `appModel.getCascadeReelsView()` to get the correct reel view for the current tumble step.
