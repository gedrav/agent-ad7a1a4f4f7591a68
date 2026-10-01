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
import { getSelectedLines, MAX_LINES, MIN_LINES, setSelectedLines } from '@slots/temp/models/JCLinesState';
import { JCEvents } from '@slots/temp/events/JCEvents';
import { getStickyState } from '@slots/temp/models/JCSpinData';

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
  // The backend can hand back cells it is still holding from an earlier session, and a lock only
  // holds for the bet and line count it was made at. Both go back before a single view is built,
  // so the panel and the lines selector come up already showing them rather than correcting
  // themselves in front of the player. No UPDATE_TOTALBET with it: nothing has been built to hear
  // it yet, and the grid treats that event as the player changing the bet, which drops the locks.
  private restoreStickySession(): boolean {
    const sticky = getStickyState();
    if (!sticky?.cells?.length) return false;
    if (sticky.betAmount != null && appModel.getAllBets().includes(sticky.betAmount)) {
      appModel.setTotalBet(sticky.betAmount);
    }
    if (sticky.activePaylines != null) {
      setSelectedLines(Math.min(Math.max(sticky.activePaylines, MIN_LINES), MAX_LINES));
    }
    return true;
  }

  async createView() {
    // Everything the grid symbols need (bonus_sym, mystery_back/front, etc.) is now in
    // PRIMARY, not SECONDARY - but ReelSymbolSpine's spine-creation path still gates on this
    // global flag regardless of which bundle an asset actually lives in. Since jokerCharge
    // has nothing left in SECONDARY, mark it satisfied before the grid builds so symbols
    // actually create their spine on first construction instead of waiting on the (empty)
    // lazy bundle to finish loading in the background.
    appModel.secondaryAssetsLoaded = true;
    const restored = this.restoreStickySession();
    this.gameAppScreen = new GameAppScreen(SLOT_GAME_APP_CONFIG);
    this.gameAppScreen.visible = false;
    this.appContainer.addChildAt(this.gameAppScreen, 0);
    // Announced once the views exist, so anything that read the count while it was being built
    // catches up. Safe for the locks: the grid releases them on a change of bet or line count,
    // and this is the very value it recorded them at.
    if (restored) {
      EventHandler.dispatchEvent(JCEvents.SELECTED_LINES, getSelectedLines());
    }
    setTimeout(() => {
      this.gameAppScreen.visible = true;
    }, 10);
  }
}
