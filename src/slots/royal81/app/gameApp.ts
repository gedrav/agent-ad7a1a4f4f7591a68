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
    } else {
      EventHandler.dispatchEvent(SlotEvents.SPLASH_START_CLICKED);
      setTimeout(() => {
        this.onSplashDestroyed();
      }, 10);
    }
  }
  async createView() {
    this.gameAppScreen = new GameAppScreen(SLOT_GAME_APP_CONFIG);
  }
  protected makeGameVisible() {
    this.gameAppScreen.visible = false;
    this.appContainer.addChild(this.gameAppScreen);
    setTimeout(() => {
      this.gameAppScreen.visible = true;
    }, 10);
  }
}
