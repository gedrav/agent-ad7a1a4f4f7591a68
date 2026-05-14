# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run a single game in dev mode (port 8002)
GAME_ID=royale81 npm run dev
GAME_ID=empireofgold npm run dev
GAME_ID=empireofgoldnewconquest npm run dev
GAME_ID=sweetsalon npm run dev
GAME_ID=frostedmarketbonanza npm run dev

# Or edit vite.config.js defaultGameNames and run:
npm run dev

# Build all games (outputs to ../feg_games_build/<gameId>/)
npm run build
npm run build:staging
npm run build:development

# Lint
npm run lint
npm run lint:fix
```

## Architecture

### Layer structure

```
src/
  corelib/     - Engine: app lifecycle, state machine, proxies, commands, pixi wrappers
  brandlib/    - Brand UI: preloader, splash, popups, control panel, bet panel, menus
  slots/<id>/  - Game-specific: app, config, views, states
  types/       - Global TypeScript declarations
```

### Path aliases (vite.config.js)

| Alias | Resolves to |
|-------|-------------|
| `@core` | `src/corelib` |
| `@brand` | `src/brandlib` |
| `@game` | `src/slots/<GAME_ID>` (env-driven) |
| `@slots` | `src/slots` |
| `@assets` | `../feg_games_assets/<GAME_ID>` |
| `@common` | `../feg_games_assets/common` |

Assets live outside this repo under `../feg_games_assets/`.

### App startup flow

`src/main.ts` instantiates `@game/app/gameApp`, which extends `SlotGameApp` (`@core/app/SlotGameApp`).

`SlotGameApp.setupApp()` wires up:
1. PixiJS Application init (iOS-aware resolution caps)
2. `GameProxy.setGameConfig()` - stores GAME_CONFIG
3. `StateManager.setStates()` - loads state machine config
4. Asset loading pipeline: preloader -> splash -> primary -> sounds -> secondary (lazy) -> features (lazy)
5. `MessageProxy.requestGameInit()` - fetches server game-init data

Each game's `gameApp` overrides `createSplash()`, `createView()`, and `makeGameVisible()`.

### State machine

Game flow is a linear state machine managed by `StateManager` (`@core/states/StateManagerService`). States are configured in each game's `config/StatesConfig.ts`. Core states (all in `@core/commands/states/`):

```
CheckUnfinishedState -> GameIdleState -> SpinStartState -> SpinResponseReceivedState
-> SpinStoppedState -> PreSpinWinState -> ShowSpinWinState -> CheckFeatureState
-> CompleteGameRoundState -> CheckAutoSpinState -> StartAutoSpinState
```

Games can override individual states (e.g., `GamePreWinState` in `src/slots/royale81/states/`).

### Key singletons

- `appModel` (`@core/models/services/AppModelService`) - central data store: game result, bets, balance, free spin session, autoplay session, cascade/tumble index
- `GameProxy` (`@core/models/GameConfigProxy`) - game config + env URLs (injected from `VITE_API_URL` etc.)
- `DeviceProxy` (`@core/models/DeviceConfigProxy`) - device/window dimensions, iOS detection
- `WrapperProxy` (`@brand/models/WrapperServiceProxy`) - URL params, player token, postMessage to parent iframe
- `EventHandler` (`@core/pixiwrapper/EventHandlerService`) - global event bus wrapping PixiJS EventEmitter on `app.stage`

### Event system

All game-wide events go through `EventHandler.dispatchEvent(eventName, data)`. Event name constants are in `@core/events/SlotEvents.ts` and `@core/events/AppEvents.ts`.

### Commands pattern

- **Action commands** (`@core/commands/action/`) - user interactions (SpinClickCommand, BetClickCommand, AutoplayClickCommand, etc.)
- **State commands** (`@core/commands/states/`) - game flow steps; each implements `execute()`, `doNextStep()`, `destroy()`

### Adding a new game

1. Create `src/slots/<newGameId>/` mirroring an existing game's structure
2. Required files: `config/GameConfig.ts`, `config/AssetConfig.ts`, `config/SoundLoadConfig.ts`, `config/StatesConfig.ts`, `app/gameApp.ts`
3. Add `newGameId` to `CONFIGURED_GAME_IDS` in `scripts/build-all.js`
4. Add assets under `../feg_games_assets/<newGameId>/`

### Build output

`scripts/build-all.js` runs `vite build` sequentially per game with `GAME_ID` env var. Output goes to `../feg_games_build/<gameId>/`. Chunks: `vendor-pixi` (all node_modules), `core-engine` (corelib + brandlib), `game-<id>` (game code). Gzip + Brotli compression applied in production.

### Environment variables

Defined per environment in `.env.development`, `.env.staging`, `.env.production`:
- `VITE_API_URL` - backend game API base
- `VITE_SOCKET_URL` - WebSocket URL
- `VITE_EXTERNAL_URL` - external service URL
- `VITE_HISTORY_URL` / `VITE_HISTORY_API_URL` - bet history endpoints
- `VITE_GAME_VERSION` - displayed in console on preloader load
