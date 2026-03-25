import '@pixi/gif';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { Assets } from 'pixi.js';
import { GameProxy } from '@core/models/GameConfigProxy';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { AppEvents } from '@core/events/AppEvents';
import { SoundFactory } from '@core/sound/SoundServiceProxy';
import { LOAD_CONSTANTS } from '@core/models/LoadConstants';
import { appModel } from '@core/models/services/AppModelService';

class AssetLoaderClass {
  private commonFontPath: string;
  private soundConfig: any;
  private langFontPath: string;
  private progressPercentage: number;
  get bundles(): any[] {
    return this._bundles;
  }

  set bundles(value: any[]) {
    this._bundles = value;
  }
  private spritePath: string = '';
  private fontPath: string = '';
  private spinePath: string = '';
  private contentPath: string = '';
  private envPath: string = '';
  private assetsManifest: any;
  private loadedBundles: string[] = [];
  private soundPath: string;
  private bmpFontPath: string;
  private assetConfig: any;
  private commonPath: string;
  private commonContentPath: string;
  private langSpritePath: string = '';
  private langSpinePath: string = '';
  private _bundles: any[];

  constructor() {
    // No need to call createPaths here; it's done in initAssets
  }

  private createPaths() {
    //const pathPrefix = DeviceProxy.getIsLocal() ? '' : 'canvas/';
    this.envPath = 'assets/env/';
    this.spritePath = 'assets/images/' + DeviceProxy.config.assetResolution + '/';
    this.fontPath = 'assets/fonts/' + 'en' + '/';
    this.langFontPath = 'assets/fonts/' + appModel.language + '/';
    this.commonFontPath = 'assets/fonts/' + 'en' + '/';
    this.bmpFontPath = 'assets/fonts/' + 'bmp' + '/';
    this.spinePath = 'assets/spines/' + DeviceProxy.config.assetResolution + '/';
    this.commonPath = 'assets/images/' + DeviceProxy.config.assetResolution + '/';
    this.contentPath = 'assets/locale/' + appModel.language + '/';
    this.commonContentPath = 'assets/locale/' + appModel.language + '/';
    this.soundPath = 'assets/sounds/';
    this.langSpritePath = 'assets/images/' + DeviceProxy.config.assetResolution + '/' + appModel.language + '/';
    this.langSpinePath = 'assets/spines/' + DeviceProxy.config.assetResolution + '/' + appModel.language + '/';
    this.loadedBundles = [];
  }

  public async initAssets(config: any, soundConfig: any) {
    this.assetConfig = config;
    this.soundConfig = soundConfig;
    this.bundles = config;
  }

  public async activateLoader() {
    this.createPaths();
    this.progressPercentage = 0;
    this.assetsManifest = this.createAssetsManifest();
    const len: number = this.assetsManifest.bundles.length;
    if (len > 0) {
      for (let k = 0; k < len; k++) {
        const data: any = this.assetsManifest.bundles[k];
        Assets.addBundle(data.name, data.assets);
      }
    }
  }

  public async loadPreloader() {
    const allBundles = this.assetsManifest.bundles.map((item: any) => item.name);
    await this.loadBundles(LOAD_CONSTANTS.PRELOADER);
  }

  public async loadSplash() {
    await this.loadBundles(LOAD_CONSTANTS.COMMON);
    await this.loadBundles(LOAD_CONSTANTS.SPLASH);
  }

  public async loadPrimary() {
    await this.loadBundles(LOAD_CONSTANTS.PRIMARY);
  }
  public async loadSecondary() {
    await this.loadBundles(LOAD_CONSTANTS.SECONDARY);
  }
  public async loadFeatures() {
    const allBundles = this.assetsManifest.bundles.map((item: any) => item.name);
    await this.loadBundles(LOAD_CONSTANTS.FEATURES);
  }
  public async loadBundle(bundle: string) {
    await this.loadBundles(bundle);
  }

  private createAssetsManifest() {
    const manifest: any = { bundles: [] };
    const pathMap = this.createPathMap();
    const len = this.assetConfig.length;
    if (len > 0) {
      for (let i = 0; i < len; i++) {
        const data: any = { name: this.assetConfig[i].name, assets: [] };
        if (this.assetConfig[i]?.assets?.length > 0) {
          this.assetConfig[i].assets.forEach((item: any) => {
            const { TYPE, NAME, ASSETTYPE, file, TEXTURES } = item;
            if (ASSETTYPE === 'svg' || ASSETTYPE === 'png' || ASSETTYPE === 'jpg' || ASSETTYPE == 'gif') {
              if (TYPE == 'common') {
                data.assets.push({ alias: NAME, src: [this.commonPath + NAME + '.' + ASSETTYPE] });
              } else if (TYPE == 'lang') {
                data.assets.push({ alias: NAME, src: [this.langSpritePath + NAME + '.' + ASSETTYPE] });
              } else {
                data.assets.push({ alias: NAME, src: [this.spritePath + NAME + '.' + ASSETTYPE] });
              }
            } else if (ASSETTYPE === 'spine') {
              // Load spine JSON data
              data.assets.push({
                alias: NAME + 'Data',
                src: this.spinePath + NAME + '.json',
              });

              // Load single atlas file
              data.assets.push({
                alias: NAME + 'Atlas',
                src: this.spinePath + NAME + '.atlas',
              });
              // Handle multiple texture images
              if (TEXTURES && Array.isArray(TEXTURES) && TEXTURES.length > 1) {
                // Load multiple PNG texture files
                TEXTURES.forEach((textureIndex: string) => {
                  data.assets.push({
                    alias: textureIndex,
                    src: this.spinePath + textureIndex + '.png',
                  });
                });
              } else {
                // Single texture file (default behavior)
                data.assets.push({
                  alias: NAME + 'Texture',
                  src: this.spinePath + NAME + '.png',
                });
              }
            } else {
              const assetSrc = this.getAssetPath(TYPE, NAME, ASSETTYPE, file, pathMap);
              console.log('here --- ', NAME, TYPE, ASSETTYPE);
              data.assets.push({
                alias: NAME,
                src: Array.isArray(assetSrc) ? assetSrc : [assetSrc],
              });
              if (item.ASSETTYPE === 'font') {
                this.loadFont(NAME, assetSrc);
              }
            }
          });
          manifest.bundles.push(data);
        }
      }
    }
    return manifest;
  }

  private createPathMap() {
    return {
      commonConfig: (name: string) => `${this.envPath}${name}`,
      content: (name: string) => `${this.contentPath}${name}`,
      commoncontent: (name: string) => `${this.commonContentPath}${name}`,
      common: (name: string, assetType: string) => {
        const assetPaths: Record<string, string> = {
          spine: `assets/spines/${DeviceProxy.config.assetResolution}/${name}.json`,
          atlas: `assets/spines/${DeviceProxy.config.assetResolution}/${name}.atlas`,
          sprite: `assets/images/${DeviceProxy.config.assetResolution}/${name}.json`,
          sound: `assets/sounds/${name}`,
          font: `${this.commonFontPath}${name}`,
          bmpfont: `assets/fonts/bmp/}`, // Handle fonts in the common path
        };
        return assetPaths[assetType] || `assets/${name}`; // Default path
      },
      game: (name: string, assetType: string) => {
        const assetPaths: Record<string, string> = {
          spine: `${this.spinePath}${name}.json`,
          atlas: `${this.spinePath}${name}.atlas`,
          sprite: `${this.spritePath}${name}.json`,
          sound: `canvas/assets/sounds/${name}`,
          font: `${this.fontPath}${name}`, // Handle fonts in the game path
          bmpfont: `${this.bmpFontPath}${name}`, // Handle fonts in the game path
        };
        return assetPaths[assetType] || `${this.spritePath}${name}`; // Default to sprite path
      },
      lang: (name: string, assetType: string) => {
        const assetPaths: Record<string, string> = {
          spine: `${this.langSpinePath}${name}.json`,
          atlas: `${this.langSpinePath}${name}.atlas`,
          sprite: `${this.langSpritePath}${name}.json`,
        };
        return assetPaths[assetType] || `${this.spritePath}${name}`; // Default to sprite path
      },
    };
  }

  private getAssetPath(
    TYPE: string,
    NAME: string,
    ASSETTYPE: string | undefined,
    file: any,
    pathMap: Record<string, any>,
  ) {
    const getPath = pathMap[TYPE] || ((name: string) => `${this.spritePath}${name}`);

    // Handle sequence (multiple sprite sheets) with varying number based on resolution
    if (ASSETTYPE === 'sequence') {
      const resolution = DeviceProxy.config.assetResolution;
      const numSheets = resolution === '@1x' ? file[0] : file[1];
      return Array.from({ length: numSheets }, (_, i) => getPath(`${NAME}${i}.json`, ASSETTYPE));
    }

    return getPath(NAME, ASSETTYPE);
  }

  private loadBMPFont(fontName: string, fontUrl: string) {
    const font = new FontFace(fontName, `url("${fontUrl}")`);
    font
      .load()
      .then((loadedFont) => {
        document.fonts.add(loadedFont);
        //console.log(`Font ${fontName} loaded successfully`);
      })
      .catch((error) => {
        console.error(`Error loading font ${fontName}:`, error);
      });
  }

  private loadFont(fontName: string, fontUrl: string) {
    const font = new FontFace(fontName, `url("${fontUrl}")`);
    font
      .load()
      .then((loadedFont) => {
        document.fonts.add(loadedFont);
        //console.log(`Font ${fontName} loaded successfully`);
      })
      .catch((error) => {
        console.error(`Error loading font ${fontName}:`, error);
      });
  }
  public async loadBundles(bundles: string | string[]) {
    if (typeof bundles === 'string') bundles = [bundles];
    for (const bundle of bundles) {
      if (!this.checkBundleExists(bundle)) {
        //throw new Error(`[Assets] Invalid bundle: ${bundle}`);
      }
    }

    // Filter out bundles that have already been loaded
    const loadList = bundles.filter((bundle) => !this.loadedBundles.includes(bundle));

    if (!loadList.length) return; // No new bundles to load

    try {
      await Assets.loadBundle(loadList, this.onLoadProgress.bind(this, loadList));
      EventHandler.dispatchEvent(AppEvents.BUNDLE_LOADED, loadList[0]);
    } catch (error) {
      console.error('Error loading bundles:', error);
    }

    this.loadedBundles.push(...loadList); // Append loaded bundles to the list
  }

  private async onLoadProgress(loadList: string, data: any) {
    let progress;
    if (loadList[0].indexOf(LOAD_CONSTANTS.COMMON) > -1) {
      progress = Math.round(data * 0.05 * 100);
    } else if (loadList[0].indexOf(LOAD_CONSTANTS.SPLASH) > -1) {
      progress = 5 + Math.round(data * 0.15 * 100);
    } else if (loadList[0].indexOf(LOAD_CONSTANTS.PRIMARY) > -1) {
      progress = 20 + Math.round(data * 0.6 * 100);
    }

    if (progress) {
      this.progressPercentage += progress;
      EventHandler.dispatchEvent(AppEvents.LOAD_PROGRESS, progress);
    }
  }

  private checkBundleExists(bundle: string) {
    return this.assetsManifest.bundles.some((b: any) => b.name === bundle);
  }

  async loadSounds() {
    await SoundFactory.loadSounds(this.soundConfig.soundFiles, this.soundPath);
  }
  public loadSecondarySounds() {
    if (this.soundConfig.lazySoundFiles && this.soundConfig.lazySoundFiles.length > 0) {
      SoundFactory.loadSounds(this.soundConfig.lazySoundFiles, this.soundPath);
    }
  }

  public async unloadAsset(assetName: string) {
    if (Assets.cache.has(assetName)) {
      await Assets.unload(assetName);
    }
  }
  public async unloadBundle(bundle: string) {
    await Assets.unloadBundle(bundle);
  }
}

export const AssetLoader = new AssetLoaderClass();
