import { MenuComp } from '@brand/views/comps/MenuComp';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { Point } from 'pixi.js';

export class MenuCompMobile extends MenuComp {
  private topbar: PixGraphics;
  private closeBtn: PixFancyButton;
  private menubg: PixSprite;
  constructor(config: any) {
    super(config);
    this.topbar = this.elementsList['topbar'];
    this.closeBtn = this.elementsList['closeBtn'];
    this.menubg = this.elementsList['menubg'];
    if (this.closeBtn) {
      this.closeBtn.onPress.connect(this.hideMenu.bind(this));
    }
    setTimeout(this.resizeView.bind(this), 500);
  }

  protected resizeView() {
    this.menubg.scale.set(1);
    this.menubg.height = UIUtil.getGameHeight();
    if (DeviceProxy.config.isLandscape) {
      this.menubg.height = UIUtil.getGameWidth() * 0.04;
    } else {
      this.menubg.height = UIUtil.getGameWidth() * 0.06;
    }
    super.resizeView();

    const btns: string[] = [
      'homeBtn',
      'soundOnBtn',
      'soundOffBtn',
      'transactionHistoryBtn',
      'infoBtn',
      'gameHistoryBtn',
      'depositBtn',
      'promotionBtn',
    ];
    const len = btns.length;
    this.elementsList['homeBtn'].scale.set(1);
    for (let i = 0; i < len; i++) {
      const btn = this.elementsList[btns[i]];
      btn.resizeView();
      if (i == 0) {
        btn.y = this.topbar.y + this.topbar.height;
      }
      if (i > 0) {
        btn.y = this.elementsList[btns[i - 1]].y + btn.height;
      }
      if (i == 2) {
        btn.y = this.elementsList[btns[i - 1]].y;
      }
    }
  }
}
