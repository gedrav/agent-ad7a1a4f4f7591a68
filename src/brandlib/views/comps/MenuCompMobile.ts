import { MenuComp } from '@brand/views/comps/MenuComp';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';

export class MenuCompMobile extends MenuComp {
  private topbar: PixGraphics;
  constructor(config: any) {
    super(config);
    this.topbar = this.elementsList['topbar'];
  }

  protected resizeView() {
    super.resizeView();
    const btns: string[] = [
      'homeBtn',
      'soundOnBtn',
      'soundOffBtn',
      'transactionHistoryBtn',
      'infoBtn',
      'gameRulesBtn',
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
      const btnHeight = this.elementsList['homeBtn'].height;
      for (let i = 0; i < len; i++) {
        this.elementsList[btns[i]].scale.set(1);
        if (i == 0) {
          this.elementsList[btns[i]].y = this.topbar.y + this.topbar.height + this.elementsList['homeBtn'].height / 2;
        }
        if (i > 0) {
          this.elementsList[btns[i]].y = this.elementsList[btns[i - 1]].y + btnHeight;
        }
        if (i == 2) {
          this.elementsList[btns[i]].y = this.elementsList[btns[i - 1]].y;
        }
        this.elementsList[btns[i]].x = this.elementsList[btns[i]].width / 2;
      }
    }
  }
}
