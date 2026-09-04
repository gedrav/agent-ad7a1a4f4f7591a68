import { GAME_CONFIG } from '@game/config/GameConfig';
import { ASSET_CONFIG } from '@game/config/AssetConfig';
import { STATES_CONFIG } from '@game/config/StatesConfig';
import { SPLASH_CONFIG } from '@game/config/screens/SplashConfig';
import { GameAppScreen } from '@game/views/containers/GameAppView';
import { SLOT_GAME_APP_CONFIG } from '@game/config/screens/SlotGameAppConfig';
import { GAME_SOUND_CONFIG } from '@game/config/SoundLoadConfig';
import { GameSoundManager } from '@game/app/GameSoundManager';
import { SplashView } from '@brand/views/splash/SplashView';
import SlotGameApp from '@core/app/SlotGameApp';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';

export class gameApp extends SlotGameApp {
  constructor() {
    super();
    this.init();
  }

  protected async init() {
    await this.setupApp(GAME_CONFIG, ASSET_CONFIG, GAME_SOUND_CONFIG, STATES_CONFIG);
    const gsManager = new GameSoundManager(GAME_SOUND_CONFIG);
  }

  async createSplash() {
    if (appModel.getPreferences()?.showIntro !== false) {
      this.splashComp = new SplashView(SPLASH_CONFIG);
      this.appContainer.addChild(this.splashComp, this.preloader);
      if (appModel.primaryAssetsLoaded) {
        EventHandler.dispatchEvent(SlotEvents.ACTIVATE_SPLASH);
      }
    } else {
      EventHandler.dispatchEvent(SlotEvents.SPLASH_START_CLICKED);
      setTimeout(() => {
        this.onSplashDestroyed();
      }, 10);
    }
  }
  async createView() {
    // Everything the grid symbols need (bonus_sym, mystery_back/front, etc.) is now in
    // PRIMARY, not SECONDARY - but ReelSymbolSpine's spine-creation path still gates on this
    // global flag regardless of which bundle an asset actually lives in. Since jokerCharge
    // has nothing left in SECONDARY, mark it satisfied before the grid builds so symbols
    // actually create their spine on first construction instead of waiting on the (empty)
    // lazy bundle to finish loading in the background.
    appModel.secondaryAssetsLoaded = true;
    this.gameAppScreen = new GameAppScreen(SLOT_GAME_APP_CONFIG);
    this.gameAppScreen.visible = false;
    this.appContainer.addChildAt(this.gameAppScreen, 0);
    setTimeout(() => {
      this.gameAppScreen.visible = true;
    }, 10);
  }
}
