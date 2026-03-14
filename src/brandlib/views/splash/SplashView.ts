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

type OrientationMode = 'portrait' | 'landscape' | 'desktop';

export class SplashView extends ResponsiveChildrenView {
  private gameTitle: PixSprite | PixSpine;
  private itemsArray: SplashItemComp[] = [];
  private itemContainer: PixView;
  private startBtn: PixFancyButton;
  private playButtonGuideRect: PixView;
  private soundSettingsContainer: PixView;
  private dontShowMessage: PixToggleButton;
  private startBtnSize = { width: 548, height: 88 };
  private soundContainerSize = { width: 305, height: 64 };
  private dontShowMessageSize = { width: 524, height: 60 };

  constructor(config: any) {
    super(config);

    this.gameTitle = this.elementsList['gameTitle'];
    this.startBtn = this.elementsList?.['startBtn'];
    this.playButtonGuideRect = this.elementsList?.['playButtonGuideRect'];
    this.itemContainer = UIUtil.getContainer();
    this.soundSettingsContainer = this.elementsList?.['soundSettingsContainer'];
    this.dontShowMessage = this.elementsList?.['dontShowMessage'];

    this.addChild(this.itemContainer);
    this.initItems();
    this.resizeView();
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
    this.layoutGameTitle(mode);
    this.layoutItems(mode);
    this.layoutStartBtn(mode);
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

        this.playButtonGuideRect.width = gw * 0.45;
        this.playButtonGuideRect.height = gh * 0.3;
        this.playButtonGuideRect.x = (gw - this.playButtonGuideRect.width) / 2;
        this.playButtonGuideRect.y = gh * 0.81 - this.playButtonGuideRect.height / 2;
        break;

      case 'portrait':
        this.guideRect.width = gw * 0.9;
        this.guideRect.height = gh * 0.6;
        this.guideRect.x = (gw - this.guideRect.width) / 2;
        this.guideRect.y = gh * 0.45 - this.guideRect.height / 2;

        this.playButtonGuideRect.width = gw * 0.9;
        this.playButtonGuideRect.height = gh * 0.2;
        this.playButtonGuideRect.x = (gw - this.playButtonGuideRect.width) / 2;
        this.playButtonGuideRect.y =
          this.guideRect.y + this.guideRect.height + gh * 0.12 - this.playButtonGuideRect.height / 2;
        break;

      case 'landscape':
        this.guideRect.width = gw * 0.6;
        this.guideRect.height = gh * 0.8;
        this.guideRect.x = gw * 0.02;
        this.guideRect.y = gh * 0.5 - this.guideRect.height / 2;

        this.playButtonGuideRect.width = gw * 0.35;
        this.playButtonGuideRect.height = gh * 0.8;
        this.playButtonGuideRect.x = this.guideRect.x + this.guideRect.width + gw * 0.01;
        this.playButtonGuideRect.y = this.guideRect.y;
        break;
    }
  }

  private layoutGameTitle(mode: OrientationMode): void {
    const gw = UIUtil.getGameWidth();
    const gh = UIUtil.getGameHeight();

    if (mode === 'landscape') {
      const availableWidth = gw - this.guideRect.x - this.guideRect.width;
      this.gameTitle.scale.set(1);
      this.gameTitle.scale.set((availableWidth * 0.7) / this.gameTitle.width);
      this.gameTitle.x = this.guideRect.x + this.guideRect.width + availableWidth * 0.5;
      this.gameTitle.y = this.guideRect.y + this.gameTitle.height * 0.5;
    } else {
      this.gameTitle.x = gw * 0.5;
      this.gameTitle.y = gh * 0.1;
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

  private layoutStartBtn(mode: OrientationMode): void {
    const gh = UIUtil.getGameHeight();
    const gap = gh * 0.02;
    const cx = this.playButtonGuideRect.x + this.playButtonGuideRect.width / 2;

    const scaleStartBtn =
      this.startBtnSize.width > this.playButtonGuideRect.width
        ? this.playButtonGuideRect.width / this.startBtnSize.width
        : 1;

    const scaleSoundBtn =
      this.soundContainerSize.width > this.playButtonGuideRect.width
        ? this.playButtonGuideRect.width / this.soundContainerSize.width
        : 1;

    const scaleDontShowBtn =
      this.dontShowMessage.width > this.playButtonGuideRect.width
        ? this.playButtonGuideRect.width / this.dontShowMessage.width
        : 1;

    this.startBtn.scale.set(scaleStartBtn * 0.9);
    this.soundSettingsContainer.scale.set(scaleSoundBtn * 0.7);
    this.dontShowMessage.scale.set(scaleDontShowBtn * 0.6);

    this.startBtn.x = cx;
    this.soundSettingsContainer.x = cx - this.soundSettingsContainer.width / 2;
    this.dontShowMessage.x = cx - this.dontShowMessage.width / 2 + 20;

    switch (mode) {
      case 'portrait':
      case 'desktop':
        this.startBtn.y = this.playButtonGuideRect.y + this.startBtn.height * 0.5;
        break;
      case 'landscape':
        this.startBtn.y = this.playButtonGuideRect.y + this.gameTitle.height + this.startBtn.height * 0.5 + gap;
        break;
    }

    // Stack soundSettingsContainer and dontShowMessage vertically below startBtn
    this.dontShowMessage.y = this.playButtonGuideRect.y + this.playButtonGuideRect.height - 20; // Align to bottom with gap
    this.soundSettingsContainer.y = this.dontShowMessage.y - this.soundSettingsContainer.height - gap; // Above dontShowMessage with gap
  }

  // ─── Item Alignment ────────────────────────────────────────────────────────

  protected alignForPortrait(): void {
    this.stackItemsVertically();
    this.fitAndCenterItemContainer();
  }

  protected alignForLandscape(): void {
    if (this.itemsArray.length < 4) {
      this.stackItemsHorizontally();
    } else {
      this.arrangeItemsInGrid();
    }
    this.fitAndCenterItemContainer(1);
  }

  protected alignForDesktop(): void {
    this.stackItemsHorizontally();
    this.fitAndCenterItemContainer(1);
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
    EventHandler.dispatchEvent(SlotEvents.SPLASH_DESTROYED);
  }
}
