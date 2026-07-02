import { StandardView } from '@core/pixiwrapper/StandardView';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixText } from '@core/pixiwrapper/PixText';
import { PixNineSpliceSprite } from '@core/pixiwrapper/PixNineSpliceSprite';

export class WinValueComp extends StandardView {
  private readonly text: PixText;
  private readonly bg: PixNineSpliceSprite;

  constructor(config: any) {
    super(config);

    const bg: any = {
      name: 'bg',
      type: 'NineSliceSprite',
      image: 'winValueBG',
      nineSlice: [16, 16, 16, 16],
    };
    this.bg = UIUtil.getElement(bg);
    this.bg.anchor.set(0.5, 0.5);
    this.addChild(this.bg);

    const tConfig = {
      name: 'symbWinAmount',
      type: 'BitmapText',
      anchor: { x: 0.5, y: 0.5 },
      style: {
        fontFamily: 'bitmapFont',
        fill: 0xffffff,
        fontSize: 150,
        letterSpacing: 0,
      },
    };
    this.text = UIUtil.getElement(tConfig);
    this.addChild(this.text);
    this.text.y = -30;
    this.bg.alpha = 0.8;
  }

  public showValue(str: string): void {
    this.text.text = str;
    this.bg.width = this.text.width + 80;
    this.text.x = -4;
  }

  public destroyComp(): void {
    this.text.destroy(true);
    this.destroy();
  }
}
