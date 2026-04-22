import { Application, Container, Renderer, Sprite, TextStyle } from 'pixi.js';
import { WindowUtil } from '@core/utils/WindowUtil';
import { InitErrorPopup } from '@brand/views/popups/InitErrorPopup';
import { GameProxy } from '@core/models/GameConfigProxy';
import { StateManager } from '@core/states/StateManagerService';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { WrapperProxy } from '@brand/models/WrapperServiceProxy';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { AssetLoader } from '@core/models/services/AssetLoader';
import { SlotEvents } from '@core/events/SlotEvents';
import { ContentProxy } from '@core/models/ContentServiceProxy';
import { PixView } from '@core/pixiwrapper/PixView';
import { MessageProxy } from '@brand/models/MessageServiceProxy';
import { AppEvents } from '@core/events/AppEvents';
import Stats from 'stats.js';
import { Util } from '@core/utils/UtilService';
import { Logger } from '@core/utils/LoggerService';
import { PreloaderScreen } from '@brand/views/preloader/PreloaderScreen';
import { PRELOADER_CONFIG } from '@brand/config/PreloaderConfig';
import { INIT_ERROR_POPUP_CONFIG } from '@brand/config/InitErrorPopupConfig';
import { appModel } from '@core/models/services/AppModelService';
import { UIUtil } from '@core/utils/UIUtilService';
import { LOAD_CONSTANTS } from '@core/models/LoadConstants';
import { BaseTexture, SCALE_MODES } from '@pixi/core';
import { SoundFactory } from '@core/sound/SoundServiceProxy';
import { RefreshGameCommand } from '@core/commands/action/RefreshGameCommand';

declare const __SHOW_STATS__: boolean;

class SlotGameApp {
  protected app: Application<Renderer>;
  private windowUtil: WindowUtil;

  protected preloader: any;
  protected splashComp: any;
  protected lastTickTime: number;
  protected gameAppScreen: any;
  private assetsLoaded: boolean;
  private gameInitReceived: boolean;
  protected initErrorOccured: boolean = false;
  protected splashAssetsLoaded: boolean = false;
  private isViewCreated: boolean = false;
  protected appContainer: any;
  private errorPopup: InitErrorPopup;
  private isFirstTime: boolean;
  private soundsLoaded: boolean = false;
  private animBound: (time: number) => void;
  private rafId: number | null = null;
  private isTabSuspended: boolean;

  constructor() {}

  async setupApp(gameConfig: any, assetConfig: any, soundConfig: any, statesConfig: any) {
    this.createScaleProps();

    this.windowUtil = new WindowUtil();
    this.windowUtil.initWindowFunctions();
    this.isFirstTime = true;
    this.assetsLoaded = false;
    this.gameInitReceived = false;
    GameProxy.setGameConfig(gameConfig);
    StateManager.setStates(statesConfig);
    DeviceProxy.readDevice();
    GameProxy.registerProxy(this);
    DeviceProxy.registerProxy(this);
    WrapperProxy.readURLParams(this);
    WrapperProxy.notifyLoadingStart();
    GameProxy.config.textsToClear = [];
    GameProxy.config.imagesToClear = [];
    GameProxy.config.isAnteEnabled = false;
    this.isTabSuspended = false;

    // iOS Safari: high-performance mode + uncapped DPR + antialias causes GPU thermal
    // throttling, WebGL context loss, and touch interaction failure on the canvas.
    // Cap resolution at 2x, drop antialias, and use default power on iOS mobile.
    const isIOSMobile = DeviceProxy.config.isIOSMobile;

    this.app = new Application();
    await this.app.init({
      resolution: isIOSMobile ? Math.min(Math.ceil(window.devicePixelRatio), 2) : Math.ceil(window.devicePixelRatio),
      backgroundColor: GameProxy.config.gameBGColor,
      hello: true,
      antialias: !isIOSMobile,
      autoDensity: true,
      roundPixels: true,
      //powerPreference: isIOSMobile ? 'default' : 'high-performance',
    });
    GameProxy.config.app = this.app;
    BaseTexture.defaultOptions.scaleMode = SCALE_MODES.LINEAR;
    BaseTexture.defaultOptions.anisotropicLevel = isIOSMobile ? 0 : 16;
    TextStyle.defaultTextStyle.fontFamily = 'sans-serif';
    if (__SHOW_STATS__) {
      // show FPS monitoring panel when enabled via config
      const stats = new Stats();
      stats.showPanel(0); // 0 = FPS
      document.body.appendChild(stats.dom);

      this.app.ticker.add(() => {
        stats.begin();
        stats.end();
      });
    }

    GameProxy.config.renderer = this.app.renderer;
    window.addEventListener('resize', this.resize.bind(this));
    document.addEventListener('visibilitychange', this.visibilityChange.bind(this));

    window.stopPixiApp = () => this.stopPixiApp();
    window.startPixiApp = () => this.startPixiApp();

    globalThis.__PIXI_APP__ = this.app;
    EventHandler.setScope(this.app.stage);
    this.addEvents();
    this.animBound = this.animate.bind(this);
    this.rafId = requestAnimationFrame(this.animBound);

    this.appContainer = new PixView({ label: 'appContainer' });
    this.app.stage.addChild(this.appContainer);
    this.addViewToDom();
    this.resize();

    WrapperProxy.sendCanvasReady();
    GameProxy.config.bundlesLoaded = [];
    GameProxy.createAPIPath();
    appModel.storeLanguage();
    MessageProxy.requestGameInit();
    await AssetLoader.initAssets(assetConfig, soundConfig);
    await this.initiateCoreApp();
  }

  async initiateCoreApp() {
    await AssetLoader.activateLoader();
    await AssetLoader.loadPreloader();
  }

  protected async onBundleLoaded(bundleName: string) {
    GameProxy.config.bundlesLoaded.push(bundleName);
    //console.log('bundle loaded == ', bundleName);
    switch (bundleName) {
      case LOAD_CONSTANTS.PRELOADER:
        await this.onPreloaderLoaded();
        break;
      case LOAD_CONSTANTS.COMMON:
        break;
      case LOAD_CONSTANTS.SPLASH:
        await this.onSplashAssetsLoaded();
        break;
      case LOAD_CONSTANTS.PRIMARY:
        this.onPrimaryAssetsLoaded();
        break;
      case LOAD_CONSTANTS.SECONDARY:
        this.onSecondaryAssetsLoaded();
        break;
      case LOAD_CONSTANTS.FEATURES:
        this.onFeatureAssetsLoaded();
        break;
      default:
        break;
    }
  }

  protected addEvents(): void {
    EventHandler.addEventListener(AppEvents.BUNDLE_LOADED, this.onBundleLoaded.bind(this));
    EventHandler.addEventListener(SlotEvents.SPLASH_START_CLICKED, this.onSplashStartClicked.bind(this));
    EventHandler.addEventListener(SlotEvents.HANDLE_SERVER_ERROR, this.onServerError.bind(this));
    EventHandler.addEventListener(SlotEvents.SPLASH_DESTROYED, this.onSplashDestroyed.bind(this));
    EventHandler.addEventListener(AppEvents.SOUNDS_LOADING_COMPLETE, this.onSoundsLoaded.bind(this));
    EventHandler.addEventListener(SlotEvents.GAME_INIT_SUCCESS, this.onGameInit.bind(this));
    EventHandler.addEventListener(SlotEvents.CHECK_TO_RESUME_SOUND, this.checkForIOSAudiioResume.bind(this));
  }
  protected onGameInit(): void {
    this.gameInitReceived = true;
    console.log('game init received == ', this.gameInitReceived);
    if (appModel.getPreferences()?.showIntro !== false) {
      console.log('111111111111111');
      this.checkToCreateSplash();
    } else {
      console.log('22222222222');
      this.checkToCreateGame();
    }
  }
  protected async onPreloaderLoaded() {
    GameProxy.updateCommonConfig();
    ContentProxy.initiate();
    console.log('C' + GameProxy.config.coreVersion + '_G' + GameProxy.config.gameVersion);
    if (!this.initErrorOccured) {
      this.preloader = new PreloaderScreen(PRELOADER_CONFIG);
      this.appContainer.addChild(this.preloader);
      this.resize();
      await AssetLoader.loadSplash();
    }
  }
  protected async onSplashAssetsLoaded() {
    this.splashAssetsLoaded = true;
    this.checkToCreateSplash();
    await AssetLoader.loadPrimary();
  }
  protected checkToCreateSplash() {
    if (this.gameInitReceived && this.splashAssetsLoaded) {
      if (appModel.getPreferences().showIntro !== false) {
        if (this.splashComp) {
          EventHandler.dispatchEvent(SlotEvents.ACTIVATE_SPLASH);
        } else {
          this.createSplash();
          this.removePreloader();
        }
      }
    }
  }
  async onPrimaryAssetsLoaded() {
    this.assetsLoaded = true;
    appModel.primaryAssetsLoaded = true;
    await AssetLoader.loadSounds();
  }
  protected onSoundsLoaded() {
    this.soundsLoaded = true;
    this.checkToCreateGame();
  }
  protected createView(): void {
    // overridden in game
  }
  protected checkToCreateGame(): void {
    console.log(
      'check to create game == ',
      this.gameInitReceived,
      this.assetsLoaded,
      this.soundsLoaded,
      appModel.isErrorOccurred,
    );
    if (this.gameInitReceived && this.assetsLoaded && this.soundsLoaded) {
      if (!appModel.isErrorOccurred) {
        if (!this.isViewCreated) {
          this.createView();
          this.isViewCreated = true;
          EventHandler.dispatchEvent(AppEvents.PRIMARY_ASSETS_LOADED);
          if (appModel.getPreferences()?.showIntro !== false) {
          } else {
            EventHandler.dispatchEvent(SlotEvents.SPLASH_START_CLICKED);
            this.removePreloader();
            setTimeout(() => {
              this.onSplashDestroyed();
            }, 50);
          }
          this.loadLazyFiles();
        } else {
        }
      } else {
      }
    }
  }

  protected createSplash() {}

  protected loadLazyFiles() {
    AssetLoader.loadSecondarySounds();
    AssetLoader.loadSecondary();
  }
  async onSecondaryAssetsLoaded() {
    appModel.secondaryAssetsLoaded = true;
    setTimeout(() => {
      EventHandler.dispatchEvent(AppEvents.SECONDARY_ASSETS_LOADED);
    }, 100);
    await AssetLoader.loadFeatures();
  }
  async onFeatureAssetsLoaded() {
    appModel.featureAssetsLoaded = true;
  }

  protected async onSplashStartClicked() {
    this.splashComp?.removeSplash();
    if (this.splashComp) {
      this.appContainer.removeChild(this.splashComp);
      this.splashComp.destroy();
      this.splashComp = null;
    }
    console.log('splash start clicked -- ', this.isViewCreated);
    if (this.isViewCreated) {
      this.makeGameVisible();
      this.app.stop();
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      this.app.start();
      if (this.rafId === null) {
        this.rafId = requestAnimationFrame(this.animBound);
      }
    }
  }
  protected makeGameVisible() {}
  protected async onSplashDestroyed() {
    StateManager.initiate();
    EventHandler.dispatchEvent(SlotEvents.PLAY_BG_SOUND);
  }

  protected onServerError(obj: any): void {
    //Logger.logObj(obj, 'server error');
    if (obj.msgName == 'gameinit') {
      this.initErrorOccured = true;
      this.errorPopup = new InitErrorPopup(INIT_ERROR_POPUP_CONFIG);
      this.appContainer.addChild(this.errorPopup);
      this.errorPopup.showMessage(obj.data?.message);
      this.removePreloader();
    } else {
      appModel.resetGameResult();
      const data: any = {};
      data.title = Util.getContent('infoText');
      data.message = obj.data?.message;
      data.callback = this.refreshGame.bind(this);
      EventHandler.dispatchEvent(SlotEvents.SHOW_MESSAGE_POPUP, data);
    }
  }
  protected refreshGame(): void {
    RefreshGameCommand.execute();
  }

  // ----------------- app methods ---------------
  removePreloader(): void {
    if (this.preloader) {
      this.preloader.removePreloader();
      this.preloader.destroyView();
      this.preloader = null;
    }
  }
  addViewToDom(): void {
    try {
      if (document.getElementById('gameStage')) {
        document.getElementById('gameStage').appendChild(this.app.canvas);
      }
    } catch (e) {
      console.log('adding to dom error == ', e);
    }
  }

  protected animate(time: number) {
    this.refreshView(time);
    this.rafId = requestAnimationFrame(this.animBound);
  }

  protected refreshView(time: number): void {
    const delta = time - this.lastTickTime;
    EventHandler.dispatchEvent(AppEvents.ON_FRAME_UPDATE, delta);
    this.lastTickTime = time;
  }

  protected resize(): void {
    this.resizeNow();
    setTimeout(this.resizeNow.bind(this), 250);
  }
  protected resizeNow(): void {
    const tempWidth = DeviceProxy.config.windowWidth;
    const tempHeight = DeviceProxy.config.windowHeight;
    DeviceProxy.readDevice();
    if (
      this.isFirstTime ||
      tempWidth != DeviceProxy.config.windowWidth ||
      tempHeight != DeviceProxy.config.windowHeight
    ) {
      this.isFirstTime = false;
      const canvaswid = DeviceProxy.config.windowWidth * DeviceProxy.config.appResolution;
      const canvasht = DeviceProxy.config.windowHeight * DeviceProxy.config.appResolution;

      // Update canvas style dimensions and scroll window up to avoid issues on mobile resize
      this.app.renderer.canvas.style.width = `${DeviceProxy.config.windowWidth}px`;
      this.app.renderer.canvas.style.height = `${DeviceProxy.config.windowHeight}px`;
      window.scrollTo(0, 0);
      this.app.renderer.resize(canvaswid, canvasht);

      EventHandler.dispatchEvent(AppEvents.APP_RESIZE);
    }
  }

  protected visibilityChange(): void {
    if (document.visibilityState === 'hidden') {
      this.stopPixiApp();
    } else {
      if ((globalThis as any)._isPanelOpen) {
        return;
      }
      this.startPixiApp();
    }
  }

  protected checkForIOSAudiioResume(): void {
    if (this.isTabSuspended) {
      SoundFactory.resumeAudioContext();
      this.isTabSuspended = false;
    }
  }

  private stopPixiApp(): void {
    SoundFactory.muteAllSounds();
    EventHandler.dispatchEvent(AppEvents.ON_FOCUS_CHANGE, false);
    this.isTabSuspended = true;
    this.app.stop();
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private startPixiApp(): void {
    EventHandler.dispatchEvent(AppEvents.ON_FOCUS_CHANGE, true);
    if (DeviceProxy.config.isIOSDevice) {
      SoundFactory.resumeAudioContext();
    }
    SoundFactory.unmuteAllSounds();
    this.app.start();
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(this.animBound);
    }
  }
  // -----------------------------------------------------------------------

  private createScaleProps(): void {
    Object.defineProperties(Sprite.prototype, {
      scaleX: {
        get: function () {
          return this.scale.x;
        },
        set: function (v) {
          this.scale.x = v;
        },
      },
      scaleY: {
        get: function () {
          return this.scale.y;
        },
        set: function (v) {
          this.scale.y = v;
        },
      },
      skewX: {
        get: function () {
          return this.skew.x;
        },
        set: function (v) {
          this.skew.x = v;
        },
      },
      skewY: {
        get: function () {
          return this.skew.y;
        },
        set: function (v) {
          this.skew.y = v;
        },
      },
    });
    Object.defineProperties(Container.prototype, {
      scaleX: {
        get: function () {
          return this.scale.x;
        },
        set: function (v) {
          this.scale.x = v;
        },
      },
      scaleY: {
        get: function () {
          return this.scale.y;
        },
        set: function (v) {
          this.scale.y = v;
        },
      },
      skewX: {
        get: function () {
          return this.skew.x;
        },
        set: function (v) {
          this.skew.x = v;
        },
      },
      skewY: {
        get: function () {
          return this.skew.y;
        },
        set: function (v) {
          this.skew.y = v;
        },
      },
    });
  }
}

export default SlotGameApp;
