import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixText } from '@core/pixiwrapper/PixText';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';

export class PromoFSInfoComp extends ResponsiveChildrenView {
  private readonly bg: PixSprite;
  private readonly spinTitleText: PixText;
  private readonly spinValueText: PixText;
  private readonly winTitleText: PixText;
  private readonly winValueText: PixText;
  constructor(config) {
    super(config);
    this.bg = UIUtil.getSprite('promofsInfoBG');
    this.addChild(this.bg);

    // const title = {
    //   name: 'countTitle',
    //   type: 'Text',
    //   content: 'spinCountTxt',
    //   fontMLProps: {
    //     id: {
    //       fontSize: 20,
    //     },
    //   },
    //   style: {
    //     fontFamily: 'gameFont1',
    //     fontSize: 28,
    //     fill: 0xf5c95b,
    //   },
    //   anchor: { x: 0.5, y: 0.5 },
    // };
    // const value = {
    //   name: 'countTitle',
    //   type: 'Text',
    //   content: 'spinCountTxt',
    //   style: { fontFamily: 'commonFontBold', fontSize: 30, fill: 0xf5c95b },
    //   anchor: { x: 0.5, y: 0.5 },
    // };
    // this.spinTitleText = UIUtil.getElement(title);
    // this.addChild(this.spinTitleText);
    // this.spinTitleText.x = this.bg.width / 2;
    // this.spinTitleText.y = 50;
    // this.spinValueText = UIUtil.getElement(value);
    // this.addChild(this.spinValueText);
    // this.spinValueText.x = this.bg.width / 2;
    // this.spinValueText.y = 90;
    // this.spinValueText.text = '8/10';

    // title.content = 'TotalWinText';
    // this.winTitleText = UIUtil.getElement(title);
    // this.addChild(this.winTitleText);
    // this.winTitleText.x = this.bg.width / 2;
    // this.winTitleText.y = 150;
    // this.winValueText = UIUtil.getElement(value);
    // this.addChild(this.winValueText);
    // this.winValueText.x = this.bg.width / 2;
    // this.winValueText.y = 190;
    // this.winValueText.text = '5870';

    // EventHandler.addEventListener(SlotEvents.UPDATE_PROMO_FS_INFO, this.updatePromoFS.bind(this));
  }

  //   updatePromoFS() {
  //     const data = appModel.promoSpinInfo;
  //     if (data) {
  //       const count = Math.min(data.playCount, data.playCount - data.remainingPlayCount + 1);
  //       this.spinValueText.text = count + ' / ' + data.playCount;
  //       this.winValueText.text = Util.formatCurrency(data.totalWin);
  //     }
  //   }
}
