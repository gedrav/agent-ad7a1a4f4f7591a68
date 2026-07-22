import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { JackPotItem } from './JackPotItem';
import { PixView } from '@core/pixiwrapper/PixView';
import { UIUtil } from '@core/utils/UIUtilService';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';

interface RowLayout {
  widthPerc: number;
  heightPerc: number;
  maxScale: number;
  minScale: number;
  hPaddingPerc: number;
}

const DESKTOP_ROW: RowLayout = { widthPerc: 0.2, heightPerc: 0.2, maxScale: 0.34, minScale: 0.01, hPaddingPerc: 0.2 };
const LANDSCAPE_ROW: RowLayout = {
  widthPerc: 0.16,
  heightPerc: 0.16,
  maxScale: 0.2,
  minScale: 0.01,
  hPaddingPerc: 0.24,
};
const ROW_Y_PERC = 0.4;
const GRID_COLUMNS = 2;

export class JackpotPanelComp extends ResponsiveChildrenView {
  jackPotsArr: JackPotItem[] = [];
  jackpotConfig: any;
  jackpotContainer: PixView;
  constructor(config) {
    super(config);
    this.jackpotConfig = this.configData.jackpotConfig;
    this.guideRect = this.elementsList['guideRect'];
    this.jackpotContainer = this.elementsList['jackpotContainer'];
    this.createJackPotElement();
  }
  createJackPotElement() {
    const itemCount = this.jackpotConfig.noOfElement;

    for (let i = 0; i < itemCount; i++) {
      const item = new JackPotItem(this.jackpotConfig.items);
      this.addChild(item);
      this.jackPotsArr.push(item);
    }
    this.resizeView();
  }
  protected resizeView() {
    super.resizeView();
    if (!DeviceProxy.isDesktop() && DeviceProxy.config.isPortrait) {
      this.jackPotsArr.forEach((item, index) => this.layoutAsGrid(item, index));
      return;
    }
    const layout = DeviceProxy.isDesktop() ? DESKTOP_ROW : LANDSCAPE_ROW;
    this.jackPotsArr.forEach((item, index) => this.layoutAsRow(item, index, layout));
  }

  /** Single row: items 0 and 2 anchor to the panel edges, the rest sit next to the previous item. */
  private layoutAsRow(item: JackPotItem, index: number, layout: RowLayout) {
    UIUtil.setRelativeScale(item, layout.widthPerc, layout.heightPerc, null, layout.maxScale, layout.minScale);
    item.y = item.height * ROW_Y_PERC;

    if (index === 0) {
      UIUtil.alignHorizontal(item, { hAlign: 'left', hPaddingPerc: layout.hPaddingPerc });
    } else if (index === 2) {
      UIUtil.alignHorizontal(item, { hAlign: 'right', hPaddingPerc: -layout.hPaddingPerc });
    } else {
      const prev = this.jackPotsArr[index - 1];
      item.x = prev.x + prev.width;
    }
  }

  /** Two columns: even indices go left, odd go right; each row hangs below the row above it. */
  private layoutAsGrid(item: JackPotItem, index: number) {
    UIUtil.setRelativeScale(item, 0.24, 0.24, null, 0.24, 0.17);

    const isLeftColumn = index % GRID_COLUMNS === 0;
    item.x = isLeftColumn ? item.width * 0.45 : UIUtil.getGameWidth() - item.width * 0.5;

    if (index < GRID_COLUMNS) {
      UIUtil.alignVertical(item, { vAlign: 'top', vPaddingPerc: 0.1 });
    } else {
      const above = this.jackPotsArr[index - GRID_COLUMNS];
      item.y = above.y + item.height * 0.8;
    }
  }
}
