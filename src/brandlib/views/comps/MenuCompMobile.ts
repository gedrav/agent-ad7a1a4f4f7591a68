import { MenuComp } from '@brand/views/comps/MenuComp';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { PixSprite } from '@core/pixiwrapper/PixSprite';

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
    if (DeviceProxy.config.isLandscape) {
      const ht: number = UIUtil.getGameHeight() * 0.96 - this.topbar.height;
      const totalButtons = btns.length - 1;
      const btnHeight = Math.round(ht / totalButtons);
      const sc: number = btnHeight / this.elementsList['homeBtn'].height;
      if (sc < 1) {
        for (let i = 0; i < len; i++) {
          this.elementsList[btns[i]].scale.set(sc);
          if (i > 0) {
            this.elementsList[btns[i]].y = this.elementsList[btns[i - 1]].y + btnHeight;
          }
          if (i == 2) {
            this.elementsList[btns[i]].y = this.elementsList[btns[i - 1]].y;
          }
          this.elementsList[btns[i]].x = this.elementsList[btns[i]].width / 2;
        }
      }
    } else {
      this.elementsList['homeBtn'].scale.set(1);

      for (let i = 0; i < len; i++) {
        const btn = this.elementsList[btns[i]];
        btn.scale.set(1);
        btn.defaultView.scale.set(1);
        const sc = ((UIUtil.getGameHeight() - this.topbar.height) * 0.06) / btn.height;
        const wsc = UIUtil.getGameWidth() / btn.defaultView.width;
        btn.scale.set(Math.min(wsc, sc));
        btn.x = btn.width / 2;
        if (i == 0) {
          btn.y = this.topbar.y + this.topbar.height + btn.height / 2;
        }
        if (i > 0) {
          btn.y = this.elementsList[btns[i - 1]].y + btn.height * 1.25;
        }
        if (i == 2) {
          btn.y = this.elementsList[btns[i - 1]].y;
        }
        btn.defaultView.width = (UIUtil.getGameWidth() * 1) / btn.scale.x;
      }
    }
  }
}
