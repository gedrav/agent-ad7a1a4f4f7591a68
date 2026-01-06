import { Application, Container, Renderer, Sprite } from 'pixi.js';
import { WindowUtil } from '@core/utils/WindowUtil';
import { InitErrorPopup } from '@core/views/popups/InitErrorPopup';
import { GameProxy } from '@core/models/GameConfigProxy';
import { StateManager } from '@core/states/StateManagerService';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { WrapperProxy } from '@core/models/WrapperServiceProxy';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { AssetLoader } from '@core/models/services/AssetLoader';
import { SlotEvents } from '@core/events/SlotEvents';
import { ContentProxy } from '@core/models/ContentServiceProxy';
import { PixView } from '@core/pixiwrapper/PixView';
import { MessageProxy } from '@core/models/MessageServiceProxy';
import { AppEvents } from '@core/events/AppEvents';
import { INIT_ERROR_POPUP_CONFIG } from '@core/config/InitErrorPopupConfig';
import Stats from 'stats.js';
import { Util } from '@core/utils/UtilService';
import { Logger } from '@core/utils/LoggerService';
import { PreloaderScreen } from '@core/views/preloader/PreloaderScreen';
import { PRELOADER_CONFIG } from '@core/config/PreloaderConfig';

declare const __SHOW_STATS__: boolean;

export class SlotGameApp {
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

  constructor() {}

  async setupApp(gameConfig: any, assetConfig: any, soundConfig: any, statesConfig: any) {
    this.createScaleProps();

    this.windowUtil = new WindowUtil();
    this.windowUtil.initWindowFunctions();

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
      resolution: Math.min(window.devicePixelRatio, 2),
      //resolution: 1,
      backgroundColor: GameProxy.config.gameBGColor,
      hello: true,
      antialias: false,
    });

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
    await AssetLoader.initAssets(assetConfig, soundConfig);
    await AssetLoader.loadPreloader();

    GameProxy.updateConfigFromCommon();

    console.log('FEG Games :: C' + GameProxy.config.coreVersion + '_G' + GameProxy.config.gameVersion);

    WrapperProxy.sendCanvasReady();
    await this.initiateApp();
  }

  protected addEvents(): void {
    EventHandler.addEventListener(SlotEvents.SPLASH_START_CLICKED, this.onSplashStartClicked.bind(this));
    EventHandler.addEventListener(SlotEvents.HANDLE_SERVER_ERROR, this.onServerError.bind(this));
    EventHandler.addEventListener(SlotEvents.SPLASH_DESTROYED, this.onSplashDestroyed.bind(this));
    EventHandler.addEventListener(AppEvents.SOUNDS_LOADING_COMPLETE, this.onSoundsLoaded.bind(this));
  }

  async initiateApp() {}
  async initiateCoreApp() {
    ContentProxy.initiate();
    this.appContainer = new PixView({ label: 'appContainer' });
    this.app.stage.addChild(this.appContainer);
    this.preloader = new PreloaderScreen(PRELOADER_CONFIG);
    this.appContainer.addChild(this.preloader);
    this.resize();
    this.addViewToDom();
    this.requestGameInit();
  }
  async requestGameInit() {
    await MessageProxy.requestGameInit();
    await this.loadSplashAssets();
    this.gameInitReceived = true;
    await this.checkToCreateSplash();
  }
  async loadSplashAssets() {
    await AssetLoader.loadSplash();
    this.splashAssetsLoaded = true;
    this.checkToCreateSplash();
  }
  async checkToCreateSplash() {
    if (this.initErrorOccured) {
      return;
    }
    if (this.splashAssetsLoaded && this.gameInitReceived) {
      await this.createSplash();
      this.removePreloader();
      this.loadPrimaryAssets();
    }
  }
  async loadPrimaryAssets() {
    await AssetLoader.loadPrimary();
    this.assetsLoaded = true;
    this.checkToCreateView();
  }

  async checkToCreateView() {
    if (this.gameInitReceived && this.assetsLoaded && !this.isViewCreated) {
      await AssetLoader.loadSounds();
    }
  }
  async onSoundsLoaded() {
    await this.createView();
    this.isViewCreated = true;
    EventHandler.dispatchEvent(AppEvents.PRIMARY_ASSETS_LOADED);
  }
  async createSplash() {}
  async createView() {}
  protected async onSplashStartClicked() {
    //EventHandler.dispatchEvent(StateEvents.EXIT_STATE);
    this.splashComp.removeSplash();
  }
  protected async onSplashDestroyed() {
    /*UIUtil.cleanUpGPU();
    await Assets.unloadBundle(this.splashComp.assetBundles)*/
    this.splashComp = null;
    StateManager.initiate();
  }

  protected onServerError(obj: any): void {
    Logger.logObj(obj, 'server error');
    if (obj.msgName == 'gameinit') {
      if (this.splashComp) {
        this.splashComp.removeSplash();
      }
      this.initErrorOccured = true;
      this.errorPopup = new InitErrorPopup(INIT_ERROR_POPUP_CONFIG);
      this.appContainer.addChild(this.errorPopup);
      this.errorPopup.showMessage(obj.data?.response?.statusText);
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
    DeviceProxy.readDevice();

    const canvaswid = DeviceProxy.config.windowWidth * DeviceProxy.config.appResolution;
    const canvasht = DeviceProxy.config.windowHeight * DeviceProxy.config.appResolution;

    // Update canvas style dimensions and scroll window up to avoid issues on mobile resize
    this.app.renderer.canvas.style.width = `${DeviceProxy.config.windowWidth}px`;
    this.app.renderer.canvas.style.height = `${DeviceProxy.config.windowHeight}px`;
    window.scrollTo(0, 0);
    this.app.renderer.resize(canvaswid, canvasht);

    EventHandler.dispatchEvent(AppEvents.APP_RESIZE);
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
