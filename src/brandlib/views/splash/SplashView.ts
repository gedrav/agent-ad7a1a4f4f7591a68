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

type OrientationMode = 'portrait' | 'landscape' | 'desktop';

export class SplashView extends ResponsiveChildrenView {
  private gameTitle: PixSprite | PixSpine;
  private itemsArray: SplashItemComp[] = [];
  private itemContainer: PixView;
  private startBtn: PixFancyButton;
  private soundBtn: SplashButton;
  private showIntroBtn: SplashButton;
  private controlsContainer: PixView;

  constructor(config: any) {
    super(config);

    this.gameTitle = this.elementsList['gameTitle'];
    this.itemContainer = UIUtil.getContainer();
    this.controlsContainer = this.elementsList?.['controlsContainer'];

    this.startBtn = this.controlsContainer.elementsList?.['startBtn'];
    this.soundBtn = this.controlsContainer.elementsList?.['soundBtn'];
    this.soundBtn.addInteraction(this.onSoundBtnClick.bind(this));

    this.showIntroBtn = this.controlsContainer.elementsList?.['showIntroBtn'];
    this.showIntroBtn.addInteraction(this.onshowIntroBtnClick.bind(this));

    this.soundBtn.on('BUTTON_PRESSED', this.onSoundBtnClick.bind(this));
    this.showIntroBtn.on('BUTTON_PRESSED', this.onshowIntroBtnClick.bind(this));

    const prefs = appModel.getPreferences();
    this.soundBtn.setSelected(prefs.sound);
    this.showIntroBtn.setSelected(!prefs.showIntro);
    SoundFactory.ambientState = prefs.sound;
    SoundFactory.sfxState = prefs.sound;

    this.addChild(this.itemContainer);
    this.initItems();
    this.resizeView();
  }
  protected onshowIntroBtnClick(): void {
    const flag = this.soundBtn.isSelected();
    this.showIntroBtn.setSelected(!flag);
    appModel.setPreferencesShow(flag);
    appModel.savePreferences();
    EventHandler.dispatchEvent(SlotEvents.SHOW_INTRO_STATE_CHANGED, false);
  }
  protected onSoundBtnClick(): void {
    const flag = this.soundBtn.isSelected();
    this.soundBtn.setSelected(!flag);
    SoundStateChangeCommand.execute(false);
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
    const mode = this.getOrientationMode();
    this.layoutGuideRect(mode);
    this.layoutItems(mode);
  }

  private getOrientationMode(): OrientationMode {
    if (DeviceProxy.config.isDesktop) return 'desktop';
    if (DeviceProxy.config.isPortrait) return 'portrait';
    return 'landscape';
  }

  private layoutGuideRect(mode: OrientationMode): void {
    const gw = UIUtil.getGameWidth();
    const gh = UIUtil.getGameHeight();

    switch (mode) {
      case 'desktop':
        this.guideRect.width = gw * 0.8;
        this.guideRect.height = gh * 0.4;
        this.guideRect.x = (gw - this.guideRect.width) / 2;
        this.guideRect.y = gh * 0.45 - this.guideRect.height / 2;

        break;

      case 'portrait':
        this.guideRect.width = gw * 0.9;
        this.guideRect.height = gh * 0.5;
        this.guideRect.x = (gw - this.guideRect.width) / 2;
        this.guideRect.y = gh * 0.44 - this.guideRect.height / 2;

        break;

      case 'landscape':
        this.guideRect.width = gw * 0.6;
        this.guideRect.height = gh * 0.8;
        this.guideRect.x = gw * 0.02;
        this.guideRect.y = gh * 0.5 - this.guideRect.height / 2;

        break;
    }
  }

  private layoutItems(mode: OrientationMode): void {
    if (this.itemsArray.length === 0) return;

    switch (mode) {
      case 'portrait':
        this.alignForPortrait();
        break;
      case 'landscape':
        this.alignForLandscape();
        break;
      case 'desktop':
        this.alignForDesktop();
        break;
    }
  }

  // ─── Item Alignment ────────────────────────────────────────────────────────

  protected alignForPortrait(): void {
    this.setScaleForStartBtn();
    this.stackItemsVertically();
    this.fitAndCenterItemContainer();
  }

  protected setScaleForStartBtn(): void {
    this.startBtn.scale.set(1);
    const { isDevice, isPortrait } = DeviceProxy.config;
    if (isDevice && isPortrait) {
      const scale = (UIUtil.getGameWidth() * 0.85) / this.startBtn.width;
      this.startBtn.scale.set(scale);
    }
  }

  protected alignForLandscape(): void {
    this.setScaleForStartBtn();
    if (this.itemsArray.length < 3) {
      this.stackItemsVertically();
    } else if (this.itemsArray.length >= 3) {
      this.arrangeItemsInGrid();
    }
    this.fitAndCenterItemContainer(1);
  }

  protected alignForDesktop(): void {
    this.stackItemsHorizontally();
    this.fitAndCenterItemContainer(Util.getDefaultValue(this.configData.itemsDesktopScale, 1));
  }

  // ─── Item Arrangement Primitives ───────────────────────────────────────────

  /**
   * Arranges items in a single column, top to bottom.
   */
  protected stackItemsVertically(gap = UIUtil.getGameHeight() * 0.02): void {
    this.itemsArray.forEach((item, k) => {
      item.x = 0;
      item.y = k === 0 ? 0 : this.itemsArray[k - 1].y + this.itemsArray[k - 1].height + gap;
    });
  }

  /**
   * Arranges items in a single row, left to right.
   */
  protected stackItemsHorizontally(gap = UIUtil.getGameWidth() * 0.02): void {
    this.itemsArray.forEach((item, k) => {
      item.y = 0;
      item.x = k === 0 ? 0 : this.itemsArray[k - 1].x + this.itemsArray[k - 1].width + gap;
    });
  }

  /**
   * Arranges items in an n-column grid, row by row.
   * An odd trailing item is centred across the full grid width.
   * @param cols   - Number of columns (default: 2).
   * @param colGap - Horizontal gap between columns.
   * @param rowGap - Vertical gap between rows.
   */
  protected arrangeItemsInGrid(
    cols = 2,
    colGap = UIUtil.getGameWidth() * 0.05,
    rowGap = UIUtil.getGameHeight() * 0.02,
  ): void {
    const len = this.itemsArray.length;

    const colWidths = Array<number>(cols).fill(0);
    this.itemsArray.forEach((item, i) => {
      const col = i % cols;
      colWidths[col] = Math.max(colWidths[col], item.width);
    });

    const colOrigins = colWidths.reduce<number[]>((acc, w, i) => {
      acc.push(i === 0 ? 0 : acc[i - 1] + colWidths[i - 1] + colGap);
      return acc;
    }, []);

    const totalGridWidth = colOrigins[cols - 1] + colWidths[cols - 1];
    let yOffset = 0;

    for (let rowStart = 0; rowStart < len; rowStart += cols) {
      const rowItems = this.itemsArray.slice(rowStart, rowStart + cols);
      const rowHeight = rowItems.reduce((h, item) => Math.max(h, item.height), 0);
      const isLastOddRow = rowItems.length < cols;

      if (isLastOddRow) {
        rowItems[0].x = (totalGridWidth - rowItems[0].width) / 2;
        rowItems[0].y = yOffset;
      } else {
        rowItems.forEach((item, col) => {
          item.x = colOrigins[col];
          item.y = yOffset;
        });
        yOffset += rowHeight + rowGap;
      }
    }
  }

  /**
   * Scales the item container to fit within the guide rect, then centres it.
   * @param maxScale - Optional upper bound for scale (default: Infinity).
   */
  private fitAndCenterItemContainer(maxScale = Infinity): void {
    this.itemContainer.scale.set(1);

    const scaleX = this.guideRect.width / this.itemContainer.width;
    const scaleY = this.guideRect.height / this.itemContainer.height;
    this.itemContainer.scale.set(Math.min(scaleX, scaleY, maxScale));

    this.itemContainer.x = this.guideRect.x + (this.guideRect.width - this.itemContainer.width) / 2;
    this.itemContainer.y = this.guideRect.y + (this.guideRect.height - this.itemContainer.height) / 2;
  }

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  public removeSplash(): void {
    this.onFadedOut();
  }

  protected async onFadedOut(): Promise<void> {
    await this.destroyElements();
    EventHandler.dispatchEvent('START_MAINGAME_BG_MUSIC');
    EventHandler.dispatchEvent(SlotEvents.SPLASH_DESTROYED);
  }
}
