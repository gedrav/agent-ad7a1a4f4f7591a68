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

    this.app = new Application();
    await this.app.init({
      // resolution: Math.min(window.devicePixelRatio, 2),
      resolution: 1,
      backgroundColor: GameProxy.config.gameBGColor,
      hello: true,
      antialias: false,
    });
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

    GameProxy.config.app = this.app;
    GameProxy.config.renderer = this.app.renderer;
    window.addEventListener('resize', this.resize.bind(this));
    document.addEventListener('visibilitychange', this.visibilityChange.bind(this));

    globalThis.__PIXI_APP__ = this.app;
    EventHandler.setScope(this.app.stage);
    this.addEvents();
    requestAnimationFrame(this.animate.bind(this));

    this.appContainer = new PixView({ label: 'appContainer' });
    this.app.stage.addChild(this.appContainer);
    this.addViewToDom();
    this.resize();

    WrapperProxy.sendCanvasReady();
    GameProxy.config.bundlesLoaded = [];
    GameProxy.createAPIPath();
    console.log('C' + GameProxy.config.coreVersion + '_G' + GameProxy.config.gameVersion);
    await MessageProxy.requestGameInit();
    this.gameInitReceived = true;
    await AssetLoader.initAssets(assetConfig, soundConfig);
    await this.initiateCoreApp();
  }

  async initiateCoreApp() {
    await AssetLoader.activateLoader();
    await AssetLoader.loadPreloader();
  }

  protected printConsole(): void {
    console.log(
      `%c ⡷⣸ ⡎⢱ ⡇⢸ ⣎⣱ ⡎⠑ ⣏⡱ ⣏⡉ ⢎⡑ ⢹⠁   ⡎⠑ ⣎⣱ ⡷⢾ ⡇ ⡷⣸ ⡎⠑
 ⠇⠹ ⠣⠜ ⠸⠃ ⠇⠸ ⠣⠔ ⠇⠱ ⠧⠤ ⠢⠜ ⠸    ⠣⠝ ⠇⠸ ⠇⠸ ⠇ ⠇⠹ ⠣⠝
                                                              
%cNOVACREST Game Engine %c${' :: C' + GameProxy.config.coreVersion + '_G' + GameProxy.config.gameVersion}`,
      'color: #6169f5ff; font-size: 10px; font-weight: 700; font-family: monospace;',
      'color: #CCCCCC; font-size: 12px; font-weight: 400;',
      'color: #CCCCCC; font-size: 12px; font-weight: 700;',
    );
  }
  protected async onBundleLoaded(bundleName: string) {
    GameProxy.config.bundlesLoaded.push(bundleName);
    console.log('bundle loaded == ', bundleName);
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
  }
  protected async onPreloaderLoaded() {
    GameProxy.updateCommonConfig();
    ContentProxy.initiate();
    if (!this.initErrorOccured) {
      this.preloader = new PreloaderScreen(PRELOADER_CONFIG);
      this.appContainer.addChild(this.preloader);
      this.resize();
      await AssetLoader.loadSplash();
    }
  }
  protected initiateApp() {}

  protected async onSplashAssetsLoaded() {
    this.splashAssetsLoaded = true;
    await this.checkToCreateSplash();
  }

  protected async checkToCreateSplash() {
    if (this.initErrorOccured) {
      return;
    }
    if (this.splashAssetsLoaded) {
      this.createSplash();
      this.removePreloader();
      await AssetLoader.loadPrimary();
    }
  }
  async onPrimaryAssetsLoaded() {
    this.assetsLoaded = true;
    appModel.primaryAssetsLoaded = true;
    await this.checkToCreateView();
  }

  protected async checkToCreateView() {
    console.log('checking to create view == ', this.gameInitReceived, this.assetsLoaded, this.isViewCreated);
    if (this.gameInitReceived && this.assetsLoaded && !this.isViewCreated) {
      await AssetLoader.loadSounds();
    }
  }
  protected onSoundsLoaded() {
    if (!appModel.isErrorOccurred) {
      if (!this.isViewCreated) {
        this.createView();
        this.isViewCreated = true;
        EventHandler.dispatchEvent(AppEvents.PRIMARY_ASSETS_LOADED);
        this.loadLazyFiles();
      }
    }
  }
  protected loadLazyFiles() {
    console.log('loading lazy files');
    AssetLoader.loadSecondarySounds();
    AssetLoader.loadSecondary();
  }
  async onSecondaryAssetsLoaded() {
    console.log('secondary assets loaded');
    appModel.secondaryAssetsLoaded = true;
    await AssetLoader.loadFeatures();
  }
  async onFeatureAssetsLoaded() {
    console.log('feature assets loaded');
    appModel.featureAssetsLoaded = true;
  }
  protected createSplash() {}
  protected createView() {}
  protected async onSplashStartClicked() {
    this.splashComp.removeSplash();
  }
  protected async onSplashDestroyed() {
    StateManager.initiate();
  }

  protected onServerError(obj: any): void {
    //Logger.logObj(obj, 'server error');
    console.log('server error newwwwwwwwwwwww == ', obj);
    if (obj.msgName == 'gameinit') {
      this.initErrorOccured = true;
      this.errorPopup = new InitErrorPopup(INIT_ERROR_POPUP_CONFIG);
      this.appContainer.addChild(this.errorPopup);
      this.errorPopup.showMessage(obj.data?.message);
      this.removePreloader();
    } else {
      const data: any = {};
      data.title = Util.getContent('infoText');
      data.message = obj.data?.response?.data?.message;
      EventHandler.dispatchEvent(SlotEvents.SHOW_MESSAGE_POPUP, data);
    }
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
    requestAnimationFrame(this.animate.bind(this));
  }

  protected refreshView(time: number): void {
    const delta = time - this.lastTickTime;
    EventHandler.dispatchEvent(AppEvents.ON_FRAME_UPDATE, delta);
    this.lastTickTime = time;
  }

  protected resize(): void {
    this.resizeNow();
    setTimeout(this.resizeNow.bind(this), 250);
    setTimeout(this.resizeNow.bind(this), 500);
    setTimeout(this.resizeNow.bind(this), 1000);
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
      //console.log(' visibility --- HIDDEN');
      //SoundFactory.muteAllSounds();
      //EventHandler.dispatchEvent(AppEvents.ON_FOCUS_CHANGE, false);
      //this.app.stop();
    } else {
      //console.log(' visibility --- SHOW');
      //EventHandler.dispatchEvent(AppEvents.ON_FOCUS_CHANGE, true);
      //SoundFactory.unmuteAllSounds();
      //this.app.start();
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
