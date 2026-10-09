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
import { AppEvents } from '@core/events/AppEvents';
import { setSecondaryAssetsReady } from '@slots/jokercharge/models/JCAssetsState';
import { applyLineBets } from '@slots/jokercharge/models/JCBetsState';
import { getSelectedLines, MAX_LINES, MIN_LINES, setSelectedLines } from '@slots/jokercharge/models/JCLinesState';
import { JCEvents } from '@slots/jokercharge/events/JCEvents';
import { getStickyState } from '@slots/jokercharge/models/JCSpinData';

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

  // Set for the start-up announcement only: a session coming back with a bet of its own - sticky
  // locks, or a round left unfinished - keeps it rather than taking the line count's.
  private keepBetOnLines = false;

  async createView() {
    // Everything the grid symbols need is in PRIMARY, but ReelSymbolSpine only builds a symbol's
    // spine behind this global flag, whatever bundle the art is in - so it is set before the grid
    // builds. SECONDARY holds only the feature's art, tracked separately in JCAssetsState.
    appModel.secondaryAssetsLoaded = true;
    // Registered ahead of every view, so it runs first when SECONDARY arrives.
    EventHandler.addEventListener(AppEvents.SECONDARY_ASSETS_LOADED, setSecondaryAssetsReady);
    // Also ahead of every view: the bet list is narrowed for the new line count before anything
    // answering the same announcement reads it - see JCBetsState.
    EventHandler.addEventListener(JCEvents.SELECTED_LINES, this.onSelectedLines.bind(this));
    const restored = this.restoreStickySession();
    this.gameAppScreen = new GameAppScreen(SLOT_GAME_APP_CONFIG);
    this.gameAppScreen.visible = false;
    this.appContainer.addChildAt(this.gameAppScreen, 0);
    // Announced once the views exist, restored or not: anything that read the count while it was
    // being built catches up, and the bet and its list are set for it - the default count included.
    // A restored bet is kept, so the locks made at it hold.
    this.keepBetOnLines = restored || appModel.getIsUnfinishedGame();
    EventHandler.dispatchEvent(JCEvents.SELECTED_LINES, getSelectedLines());
    this.keepBetOnLines = false;
    setTimeout(() => {
      this.gameAppScreen.visible = true;
    }, 10);
  }

  // The line count sets the bet - see JCBetsState. UPDATE_TOTALBET only when that moved it.
  private onSelectedLines(): void {
    if (applyLineBets(getSelectedLines(), this.keepBetOnLines)) {
      EventHandler.dispatchEvent(SlotEvents.UPDATE_TOTALBET);
    }
  }
}
