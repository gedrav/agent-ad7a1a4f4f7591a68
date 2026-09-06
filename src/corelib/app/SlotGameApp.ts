import { Application, Container, Renderer, Sprite, TextStyle, TextureSource, loadTextures } from 'pixi.js';
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
import { RealtimeConnection } from '@core/models/services/RealtimeConnectionService';
import { UIUtil } from '@core/utils/UIUtilService';
import { LOAD_CONSTANTS } from '@core/models/LoadConstants';
import { BaseTexture, SCALE_MODES } from '@pixi/core';
import { SoundFactory } from '@core/sound/SoundServiceProxy';
import { RefreshGameCommand } from '@core/commands/action/RefreshGameCommand';
import { ERROR_CODES } from '@brand/utils/ErrorCodes';
import { STATES } from '@core/states/StateConstants';

declare const __SHOW_STATS__: boolean;

class SlotGameApp {
  protected app: Application<Renderer>;
  private windowUtil: WindowUtil;

  protected preloader: any;
  protected splashComp: any;
  protected lastTickTime: number;
  protected gameAppScreen: any;
  protected transitionAnimComp: any;
  private assetsLoaded: boolean;
  private gameInitReceived: boolean;
  protected initErrorOccured: boolean = false;
  protected splashAssetsLoaded: boolean = false;
  private isViewCreated: boolean = false;
  protected appContainer: any;
  private errorPopup: InitErrorPopup;
  private pendingInitErrorObj: any = null;
  private isFirstTime: boolean;
  private soundsLoaded: boolean = false;
  private animBound: (time: number) => void;
  private rafId: number | null = null;
  private isTabSuspended: boolean;
  private boundResize: () => void;
  private boundVisibilityChange: () => void;
  private readonly boundOnline: () => void;
  private readonly boundOffline: () => void;
  protected isNetworkOnline: boolean = navigator.onLine;
  private boundContextLost: (e: Event) => void;
  private boundContextRestored: () => void;
  private readonly boundEventHandlers: Array<{ event: string; handler: (data?: any) => void }> = [];

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
    RealtimeConnection.connect(WrapperProxy.playerData.newToken);
    WrapperProxy.notifyLoadingStart();
    GameProxy.config.textsToClear = [];
    GameProxy.config.imagesToClear = [];
    GameProxy.config.isAnteEnabled = false;
    this.isTabSuspended = false;

    // iOS Safari: high-performance mode + uncapped DPR + antialias causes GPU thermal
    // throttling, WebGL context loss, and touch interaction failure on the canvas.
    // Cap resolution at 2x, drop antialias, and use default power on iOS mobile.
    DeviceProxy.readDevice();
    const isIOSMobile = DeviceProxy.config.isIOSMobile;

    this.app = new Application();
    if (isIOSMobile) {
      await this.app.init({
        resolution: Math.min(Math.ceil(window.devicePixelRatio), 2),
        backgroundColor: GameProxy.config.gameBGColor,
        hello: true,
        preference: ['webgl'] as any,
        antialias: false,
        autoDensity: true,
        roundPixels: true,
        powerPreference: 'low-power',
        preferWebGLVersion: 1, // A/B test this on iOS
        backgroundAlpha: 1,
        textureGCActive: true,
        textureGCCheckCountMax: 300,
        textureGCMaxIdle: 900,
        gcActive: true,
        gcMaxUnusedTime: 8_000,
        gcFrequency: 2_000,
      });
    } else {
      // Cap DPR at 2 on desktop too. On Retina 4K/5K, uncapped DPR (3x) makes
      // the WebGL backbuffer 200-400MB on its own — invisible visual gain,
      // huge memory cost. Capping at 2 keeps sharpness and slashes GPU memory.
      await this.app.init({
        resolution: Math.min(Math.ceil(window.devicePixelRatio), 2),
        backgroundColor: GameProxy.config.gameBGColor,
        hello: true,
        antialias: true,
        autoDensity: true,
        roundPixels: true,
        powerPreference: 'high-performance',
      });
    }

    GameProxy.config.app = this.app;
    BaseTexture.defaultOptions.scaleMode = SCALE_MODES.LINEAR;
    // anisotropicLevel: 16 was excessive — visual diff vs 4 is invisible on
    // slot art, and high levels increase sample cost and per-texture memory.
    // Cap at 4 on desktop, 0 on iOS.
    BaseTexture.defaultOptions.anisotropicLevel = isIOSMobile ? 0 : 4;
    // Disable automatic mipmap generation. Mipmaps add ~33% GPU memory per
    // texture and slot atlases display near 1:1 — no minification quality
    // gain to justify the cost. Saves ~150 MB GPU on cascade games.
    TextureSource.defaultOptions.autoGenerateMipmaps = false;
    TextStyle.defaultTextStyle.fontFamily = 'sans-serif';
    // v8 defaults to createImageBitmap, which retains a decoded raw-pixel
    // ImageBitmap on the JS heap alongside the GPU copy — doubling memory per
    // texture vs v6. Switch to HTMLImageElement so the browser owns the decoded
    // bitmap and frees it after GPU upload. preferWorkers must also be off,
    // since workers require createImageBitmap.
    loadTextures.config.preferCreateImageBitmap = false;
    loadTextures.config.preferWorkers = false;

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
    this.boundResize = this.resize.bind(this);
    this.boundVisibilityChange = this.visibilityChange.bind(this);
    window.addEventListener('resize', this.boundResize);
    document.addEventListener('fullscreenchange', this.boundResize);
    document.addEventListener('visibilitychange', this.boundVisibilityChange);

    this.attachWebGLContextHandlers();

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
    this.bindEvent(AppEvents.BUNDLE_LOADED, this.onBundleLoaded);
    this.bindEvent(SlotEvents.SPLASH_START_CLICKED, this.onSplashStartClicked);
    this.bindEvent(SlotEvents.HANDLE_SERVER_ERROR, this.onServerError);
    this.bindEvent(SlotEvents.SPLASH_DESTROYED, this.onSplashDestroyed);
    this.bindEvent(AppEvents.SOUNDS_LOADING_COMPLETE, this.onSoundsLoaded);
    this.bindEvent(SlotEvents.GAME_INIT_SUCCESS, this.onGameInit);
    this.bindEvent(SlotEvents.CHECK_TO_RESUME_SOUND, this.checkForIOSAudiioResume);
  }

  private bindEvent(event: string, method: (...args: any[]) => void): void {
    const handler = method.bind(this);
    EventHandler.addEventListener(event, handler);
    this.boundEventHandlers.push({ event, handler });
  }

  private attachWebGLContextHandlers(): void {
    const canvas: HTMLCanvasElement | undefined = this.app?.canvas;
    if (!canvas) return;
    this.boundContextLost = (e: Event) => {
      // iOS Safari kills the WebGL context under GPU memory pressure. Default
      // browser behavior loses the context permanently; preventDefault keeps it
      // recoverable so the restored handler can rebuild GPU state.
      e.preventDefault();
      console.warn('[SlotGameApp] WebGL context lost');
      EventHandler.dispatchEvent(AppEvents.ON_FOCUS_CHANGE, false);
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      this.app?.stop();
    };
    this.boundContextRestored = () => {
      console.warn('[SlotGameApp] WebGL context restored — reloading to rebuild GPU state');
      // PixiJS v8 cannot reliably re-upload all textures/spines after a context
      // loss on iOS Safari. A reload is the safest recovery path and prevents
      // the indefinite black-screen state users currently experience.
      window.location.reload();
    };
    canvas.addEventListener('webglcontextlost', this.boundContextLost, false);
    canvas.addEventListener('webglcontextrestored', this.boundContextRestored, false);
  }

  public destroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.boundResize) {
      window.removeEventListener('resize', this.boundResize);
      document.removeEventListener('fullscreenchange', this.boundResize);
    }
    if (this.boundVisibilityChange) {
      document.removeEventListener('visibilitychange', this.boundVisibilityChange);
    }
    const canvas: HTMLCanvasElement | undefined = this.app?.canvas;
    if (canvas) {
      if (this.boundContextLost) {
        canvas.removeEventListener('webglcontextlost', this.boundContextLost);
      }
      if (this.boundContextRestored) {
        canvas.removeEventListener('webglcontextrestored', this.boundContextRestored);
      }
    }
    for (const { event, handler } of this.boundEventHandlers) {
      EventHandler.removeEventListener(event, handler);
    }
    this.boundEventHandlers.length = 0;
  }
  protected onGameInit(): void {
    this.gameInitReceived = true;
    if (appModel.getPreferences()?.showIntro !== false) {
      this.checkToCreateSplash();
    } else {
    }
    this.checkToCreateGame();
  }
  protected async onPreloaderLoaded() {
    ContentProxy.initiate();
    console.log('Version: ' + import.meta.env.VITE_GAME_VERSION + '_' + GameProxy.config.gameVersion);
    if (this.pendingInitErrorObj) {
      // Error arrived before content loaded; render it now that text is available.
      this.displayInitError(this.pendingInitErrorObj);
      this.pendingInitErrorObj = null;
      return;
    }
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
  protected createTransitionView(): void {}
  protected checkToCreateGame(): void {
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
            setTimeout(this.handleNextStep.bind(this), 50);
          }
          this.checkForConfigError();
          setTimeout(this.loadLazyFiles.bind(this), 100);
        } else {
        }
      } else {
      }
    }
  }
  protected handleNextStep() {
    this.onSplashDestroyed();
  }
  protected checkForConfigError(): void {
    if (appModel.isConfigError()) {
      const data: any = {};
      data.title = Util.getContent('infoText');
      data.message = Util.getContent('configError');
      data.callback = this.refreshGame.bind(this);
      EventHandler.dispatchEvent(SlotEvents.SHOW_MESSAGE_POPUP, data);
    }
  }

  protected createSplash() {}

  protected loadLazyFiles() {
    AssetLoader.loadSecondarySounds();
    setTimeout(() => {
      AssetLoader.loadSecondary();
    }, 0);
  }
  protected onSecondaryAssetsLoaded() {
    appModel.secondaryAssetsLoaded = true;
    setTimeout(() => {
      EventHandler.dispatchEvent(AppEvents.SECONDARY_ASSETS_LOADED);
      AssetLoader.loadFeatures();
      this.createTransitionView();
    }, 100);
  }
  async onFeatureAssetsLoaded() {
    appModel.featureAssetsLoaded = true;
  }

  protected async onSplashStartClicked() {
    if (this.splashComp) {
      // Await full async teardown so AssetLoader.unloadBundle('SPLASH')
      // completes before we proceed. Previously this was fire-and-forget,
      // causing destroyElements() to race against an immediate sync destroy()
      // and risk skipping the bundle unload.
      const splash = this.splashComp;
      this.splashComp = null;
      await splash.removeSplash();
      this.appContainer.removeChild(splash);
      // destroyElements() already destroys when unloadAssets is set, so no
      // explicit destroy() here.
    }
    if (this.isViewCreated) {
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
    // demo purpose added this can remove once socket connected
    // const timer = setTimeout(()=>{
    //   appModel.storeJackpotData = true;
    //   StateManager.goToState(STATES.SHOW_JACKPOT_GAME_STATE);
    // },5000);
  }
  protected makeGameVisible() {}
  protected async onSplashDestroyed() {
    StateManager.initiate();
    WrapperProxy.postLifecycleEvent('GameReady');
    EventHandler.dispatchEvent(SlotEvents.PLAY_BG_SOUND);
  }

  protected onServerError(obj: any): void {
    if (obj.msgName == 'gameinit') {
      this.initErrorOccured = true;
      WrapperProxy.postLifecycleEvent('GameError', {
        error: {
          code: 'LAUNCH_FAILED',
          description: obj?.data?.extensions?.public?.displayMessage ?? obj?.data?.message ?? 'Game failed to load',
          recoverable: false,
        },
      });
      // gameinit error can arrive before commonContent.json/gameContent.json
      // finish loading (PRELOADER bundle). Without content, getContent returns
      // empty and the popup shows blank text. Defer until content is ready.
      if (ContentProxy.isLoaded) {
        this.displayInitError(obj);
      } else {
        this.pendingInitErrorObj = obj;
      }
    } else {
      appModel.resetGameResult();
      const data: any = {};
      let isOfflineError = false;
      data.title = Util.getContent('infoText');
      // Prefer the platform's own specific, localized message (e.g. FEG's exact
      // reason for a bet rejection) over our generic ERROR_CODES-mapped bucket text.
      data.message =
        obj?.data?.extensions?.public?.displayMessage ??
        (obj?.data?.extensions?.code ? Util.getContent(ERROR_CODES[obj?.data?.extensions?.code]) : null);
      if (!data.message) {
        if (obj.data.extensions) {
          data.message = Util.getContent('generic_error');
        } else {
          data.message = Util.getContent('networkDisconnectedMessage');
          isOfflineError = !this.isOnline();
          EventHandler.dispatchEvent(SlotEvents.STOP_REEL_FOR_ERROR);
        }
      }
      data.code = obj?.data?.extensions?.code ? obj?.data?.extensions?.code : 9999;
      if (!isOfflineError) {
        data.callback = this.refreshGame.bind(this);
      }
      WrapperProxy.postLifecycleEvent('GameError', {
        error: {
          code: isOfflineError ? 'CONNECTION_ERROR' : 'GENERIC_ERROR',
          description: data.message,
          recoverable: !isOfflineError,
        },
      });
      EventHandler.dispatchEvent(SlotEvents.SHOW_MESSAGE_POPUP, data);
    }
  }
  private displayInitError(obj: any): void {
    this.errorPopup = new InitErrorPopup(INIT_ERROR_POPUP_CONFIG);
    this.appContainer.addChild(this.errorPopup);
    let msg =
      obj?.data?.extensions?.public?.displayMessage ??
      (obj?.data?.extensions?.code ? Util.getContent(ERROR_CODES[obj?.data?.extensions?.code]) : obj?.data?.message);
    if (!msg) {
      msg = Util.getContent('generic_error');
    }
    this.errorPopup.showMessage(msg, obj?.data?.extensions?.code);
    this.removePreloader();
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
    const previousOrientation = DeviceProxy.config.orientation;
    this.trackOrientationChange(previousOrientation);
    if (!DeviceProxy.config.isIOSDevice) {
      this.resizeNow();
    }
    setTimeout(() => {
      this.resizeNow();
      this.trackOrientationChange(previousOrientation);
    }, 250);
  }
  private trackOrientationChange(previousOrientation: number): void {
    if (previousOrientation !== undefined && DeviceProxy.config.orientation !== previousOrientation) {
      WrapperProxy.postActivityEvent('ingame_casino_orientation', {
        value: DeviceProxy.config.isLandscape ? 'landscape' : 'portrait',
      });
    }
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
        // Panel still open (returning from the detailed-history tab): keep
        // Pixi stopped, but kick the iOS audio context now — it comes back
        // 'interrupted' and Howler stays muted until the panel closes, so
        // this is inaudible and lets audio recover before the close click.
        if (DeviceProxy.config.isIOSDevice) {
          SoundFactory.resumeAudioContext();
        }
        return;
      }
      this.startPixiApp();
    }
  }

  public isOnline(): boolean {
    return navigator.onLine;
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
    // Drop the pool of reusable RenderTargets when the tab is backgrounded.
    // They get re-created on demand when the tab returns; meanwhile we free
    // 30-80 MB of GPU memory for whatever the user switches to.
    (this.app.renderer as any).texturePool?.clear?.();
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
