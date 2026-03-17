import '@common/panel/devUtils/devUtilities';
import '@common/panel/ts/zoomDisable';
import { GAME_CONFIG } from '@game/config/GameConfig';

// optional, if you want to use __GAME_ID__ at runtime
declare const __GAME_ID__: string;

// This path is static *after* alias resolution.
import { gameApp } from '@game/app/gameApp';

const gameTitle = GAME_CONFIG.gameName || GAME_CONFIG.gameId || __GAME_ID__;

if (gameTitle) {
  document.title = gameTitle;
}

new gameApp();
