import { StandardView } from '@core/pixiwrapper/StandardView';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { Sine } from 'gsap/gsap-core';
import { GameProxy } from '@core/models/GameConfigProxy';
import { PixText } from '@core/pixiwrapper/PixText';
import { PixNineSpliceSprite } from '@core/pixiwrapper/PixNineSpliceSprite';

export class WinValueComp extends StandardView {
  private text: PixText;
  private bg: PixNineSpliceSprite;

  constructor(config: any) {
    super(config);

    const bg: any = {
      name: 'bg',
      type: 'NineSliceSprite',
      image: 'winValueBG',
      nineSlice: [16, 16, 16, 16],
    };
    this.bg = UIUtil.getElement(bg);
    this.addChild(this.bg);

    const tConfig = {
      name: 'symbWinAmount',
      type: 'BitmapText',
      anchor: { x: 0.5, y: 0.5 },
      style: {
        fontFamily: 'bitmapFont',
        fill: 0xffffff,
        fontSize: 150,
        letterSpacing: -20,
      },
    };
    this.text = UIUtil.getElement(tConfig);
    this.addChild(this.text);
    this.text.x = this.bg.width * 0.5;
    this.text.y = 36;
    this.bg.alpha = 0.7;
  }

  public showValue(str: string): void {
    this.text.text = str;
    this.bg.width = this.text.width + 80;
    this.text.x = this.bg.width * 0.45;
  }

  public destroyComp(): void {
    this.text.destroy(true);
    this.destroy();
  }
}
