import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { SplashItemComp } from '@brand/views/splash/SplashItemComp';
import { PixView } from '@core/pixiwrapper/PixView';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { UIUtil } from '@core/utils/UIUtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { PixToggleButton } from '@core/pixiwrapper/PixToggleButton';
import { Util } from '@core/utils/UtilService';
import { SplashButton } from '@brand/views/comps/SplashButton';
import { appModel } from '@core/models/services/AppModelService';
import { SoundFactory } from '@core/sound/SoundServiceProxy';
import { SoundStateChangeCommand } from '@core/commands/action/SoundStateChangeCommand';
import { MessageProxy } from '@brand/models/MessageServiceProxy';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { AppEvents } from '@core/events/AppEvents';
import { PRELOADER_CONFIG } from '@brand/config/PreloaderConfig';
import { PreloaderScreen } from '@brand/views/preloader/PreloaderScreen';
import { SplashPreloaderComp } from '@brand/views/comps/SplashPreloaderComp';
import { SPLASH_PRELOADER_CONFIG } from '@brand/config/SplashPreloaderConfig';

type OrientationMode = 'portrait' | 'landscape' | 'desktop';

export class SplashView extends ResponsiveChildrenView {
  private gameTitle: PixSprite | PixSpine;
  private itemsArray: SplashItemComp[] = [];
  private itemContainer: PixView;
  private startBtn: PixFancyButton;
  private soundBtn: SplashButton;
  private showIntroBtn: SplashButton;
  private controlsContainer: PixView;
  private cGuideRect: PixGraphics;
  private preloaderComp: SplashPreloaderComp;

  constructor(config: any) {
    super(config);

    this.gameTitle = this.elementsList['gameTitle'];
    this.itemContainer = UIUtil.getContainer();
    this.controlsContainer = this.elementsList?.['controlsContainer'];

    this.startBtn = this.controlsContainer.elementsList?.['startBtn'];
    this.startBtn.visible = false;
    this.cGuideRect = this.controlsContainer.elementsList?.['guideRect'];
    this.soundBtn = this.controlsContainer.elementsList?.['soundBtn'];
    this.soundBtn.addInteraction(this.onSoundBtnClick.bind(this));

    this.showIntroBtn = this.controlsContainer.elementsList?.['showIntroBtn'];
    this.showIntroBtn.addInteraction(this.onshowIntroBtnClick.bind(this));

    this.soundBtn.on('BUTTON_PRESSED', this.onSoundBtnClick.bind(this));
    this.showIntroBtn.on('BUTTON_PRESSED', this.onshowIntroBtnClick.bind(this));

    EventHandler.addEventListener(AppEvents.PRIMARY_ASSETS_LOADED, this.onPrimaryLoaded.bind(this));

    const prefs = appModel.getPreferences();
    this.soundBtn.setSelected(!prefs.sound);
    this.showIntroBtn.setSelected(!prefs.showIntro);
    SoundFactory.ambientState = prefs.sound;
    SoundFactory.sfxState = prefs.sound;

    this.addChild(this.itemContainer);
    this.initItems();
    this.visible = false;
    this.createPreloader();
    setTimeout(() => {
      this.visible = true;
    }, 50);
  }
  protected createPreloader(): void {
    this.preloaderComp = new SplashPreloaderComp(SPLASH_PRELOADER_CONFIG);
    this.controlsContainer.addChild(this.preloaderComp);
    this.preloaderComp.y = this.startBtn.height / 2;
  }
  protected onPrimaryLoaded(): void {
    this.preloaderComp.destroy();
    this.startBtn.visible = true;
  }
  protected onshowIntroBtnClick(): void {
    const flag = this.showIntroBtn.isSelected();
    this.showIntroBtn.setSelected(!flag);
    appModel.setPreferencesShow(flag);
    MessageProxy.savePreferences(appModel.getPreferences());
    EventHandler.dispatchEvent(SlotEvents.SHOW_INTRO_STATE_CHANGED, false);
  }
  protected onSoundBtnClick(): void {
    const flag = this.soundBtn.isSelected();
    this.soundBtn.setSelected(!flag);
    SoundStateChangeCommand.execute(flag);
  }

  // ─── Initialisation ────────────────────────────────────────────────────────

  private initItems(): void {
    const contents = this.configData.contents ?? [];
    for (const content of contents) {
      const item = new SplashItemComp(content);
      this.itemContainer.addChild(item);
      this.itemsArray.push(item);
    }
  }

  // ─── Resize / Layout ───────────────────────────────────────────────────────

  protected resizeView(): void {
    if (this.isDestroyed) return;
    super.resizeView();
    this.positionElements();
  }

  protected positionElements(): void {
    if (DeviceProxy.config.isDesktop) {
      this.guideRect.width = UIUtil.getGameWidth() * 0.96;
      this.guideRect.height = UIUtil.getGameHeight() * 0.5;
      this.guideRect.x = (UIUtil.getGameWidth() - this.guideRect.width) / 2;
      this.guideRect.y = UIUtil.getGameHeight() * 0.2;
    } else {
      if (DeviceProxy.config.isPortrait) {
        this.guideRect.width = UIUtil.getGameWidth() * 0.96;
        this.guideRect.height = UIUtil.getGameHeight() * 0.5;
        this.guideRect.x = (UIUtil.getGameWidth() - this.guideRect.width) / 2;
        this.guideRect.y = UIUtil.getGameHeight() * 0.2;
      } else {
        this.guideRect.width = UIUtil.getGameWidth() * 0.6;
        this.guideRect.height = UIUtil.getGameHeight() * 0.96;
        this.guideRect.x = UIUtil.getGameWidth() * 0.02;
        this.guideRect.y = UIUtil.getGameHeight() * 0.02;
      }
    }

    if (DeviceProxy.config.isPortrait) {
      this.alignForPortrait();
    } else {
      if (DeviceProxy.config.isDesktop) {
        this.alignForDesktop();
      } else {
        this.alignForLandscape();
      }
    }
  }

  protected alignForPortrait(): void {
    const len = this.itemsArray.length;
    if (len > 0) {
      for (const item of this.itemsArray) {
        item.x = 0;
        item.y = 0;
      }
      if (len === 2) {
        for (let k = 0; k < len; k++) {
          this.itemsArray[k].x = 0;
          this.itemsArray[k].y =
            k === 0 ? 0 : this.itemsArray[k - 1].y + this.itemsArray[k - 1].height + UIUtil.getGameHeight() * 0.02;
        }
      } else {
        const colGap = UIUtil.getGameWidth() * 0.05;
        const rowGap = UIUtil.getGameHeight() * 0.02;
        let colWidth = 0;
        const rowHeights: number[] = [];

        for (let i = 0; i < len; i += 2) {
          const item1 = this.itemsArray[i];
          const item2 = this.itemsArray[i + 1];
          colWidth = Math.max(colWidth, item1.width);
          if (item2) colWidth = Math.max(colWidth, item2.width);
        }

        let yOffset = 0;
        for (let i = 0; i < len; i += 2) {
          const item1 = this.itemsArray[i];
          const item2 = this.itemsArray[i + 1];

          if (!item2 && len % 2 !== 0) {
            item1.x = colWidth + colGap / 2 - item1.width / 2;
            item1.y = yOffset;
          } else {
            item1.x = 0;
            item1.y = yOffset;

            item2.x = colWidth + colGap;
            item2.y = yOffset;

            const rowHeight = Math.max(item1.height, item2.height);
            yOffset += rowHeight + rowGap;
          }
        }
      }

      this.itemContainer.scale.set(1);
      const sc = this.guideRect.width / this.itemContainer.width;
      const hsc = this.guideRect.height / this.itemContainer.height;
      this.itemContainer.scale.set(Math.min(sc, hsc));

      this.itemContainer.x = this.guideRect.x + (this.guideRect.width - this.itemContainer.width) / 2;
      this.itemContainer.y = this.guideRect.y + (this.guideRect.height - this.itemContainer.height) / 2;
    }
  }

  protected alignForLandscape(): void {
    // this.loadingBtn.scale.set(1);
    const len = this.itemsArray.length;
    if (len > 0) {
      for (const item of this.itemsArray) {
        item.x = 0;
        item.y = 0;
      }
      if (len === 2) {
        for (let k = 0; k < len; k++) {
          this.itemsArray[k].x =
            k === 0 ? 0 : this.itemsArray[k - 1].x + this.itemsArray[k - 1].width + UIUtil.getGameWidth() * 0.01;
          this.itemsArray[k].y = 0;
        }
      } else {
        const colGap = UIUtil.getGameWidth() * 0.05;
        const rowGap = UIUtil.getGameHeight() * 0.02;
        let colWidth = 0;
        const rowHeights: number[] = [];

        for (let i = 0; i < len; i += 2) {
          const item1 = this.itemsArray[i];
          const item2 = this.itemsArray[i + 1];
          colWidth = Math.max(colWidth, item1.width);
          if (item2) colWidth = Math.max(colWidth, item2.width);
        }

        let yOffset = 0;
        for (let i = 0; i < len; i += 2) {
          const item1 = this.itemsArray[i];
          const item2 = this.itemsArray[i + 1];

          if (!item2 && len % 2 !== 0) {
            item1.x = colWidth + colGap / 2 - item1.width / 2;
            item1.y = yOffset;
          } else {
            item1.x = 0;
            item1.y = yOffset;

            item2.x = colWidth + colGap;
            item2.y = yOffset;

            const rowHeight = Math.max(item1.height, item2.height);
            yOffset += rowHeight + rowGap;
          }
        }
      }

      this.itemContainer.scale.set(1);
      const sc = this.guideRect.width / this.itemContainer.width;
      const hsc = this.guideRect.height / this.itemContainer.height;
      this.itemContainer.scale.set(Math.min(sc, hsc));

      this.itemContainer.x = this.guideRect.x + (this.guideRect.width - this.itemContainer.width) / 2;
      this.itemContainer.y = this.guideRect.y + (this.guideRect.height - this.itemContainer.height) / 2;
    }
  }
  protected alignForDesktop(): void {
    // this.loadingBtn.scale.set(1);
    const len = this.itemsArray.length;
    if (len > 0) {
      for (const item of this.itemsArray) {
        item.x = 0;
        item.y = 0;
      }
      if (len === 3) {
        for (let k = 0; k < len; k++) {
          this.itemsArray[k].x =
            k === 0 ? 0 : this.itemsArray[k - 1].x + this.itemsArray[k - 1].width + UIUtil.getGameWidth() * 0.01;
          this.itemsArray[k].y = 0;
        }
      } else {
        const colGap = UIUtil.getGameWidth() * 0.05;
        const rowGap = UIUtil.getGameHeight() * 0.02;
        let colWidth = 0;
        const rowHeights: number[] = [];

        for (let i = 0; i < len; i += 2) {
          const item1 = this.itemsArray[i];
          const item2 = this.itemsArray[i + 1];
          colWidth = Math.max(colWidth, item1.width);
          if (item2) colWidth = Math.max(colWidth, item2.width);
        }

        let yOffset = 0;
        for (let i = 0; i < len; i += 2) {
          const item1 = this.itemsArray[i];
          const item2 = this.itemsArray[i + 1];

          if (!item2 && len % 2 !== 0) {
            item1.x = colWidth + colGap / 2 - item1.width / 2;
            item1.y = yOffset;
          } else {
            item1.x = 0;
            item1.y = yOffset;

            item2.x = colWidth + colGap;
            item2.y = yOffset;

            const rowHeight = Math.max(item1.height, item2.height);
            yOffset += rowHeight + rowGap;
          }
        }
      }

      this.itemContainer.scale.set(1);
      const sc = this.guideRect.width / this.itemContainer.width;
      const hsc = this.guideRect.height / this.itemContainer.height;
      this.itemContainer.scale.set(Math.min(sc, hsc));

      this.itemContainer.x = this.guideRect.x + (this.guideRect.width - this.itemContainer.width) / 2;
      this.itemContainer.y = this.guideRect.y + (this.guideRect.height - this.itemContainer.height) / 2;
    }
  }
  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  public removeSplash(): void {
    this.onFadedOut();
  }

  protected async onFadedOut(): Promise<void> {
    await this.destroyElements();
    EventHandler.dispatchEvent(SlotEvents.SPLASH_DESTROYED);
  }
}
