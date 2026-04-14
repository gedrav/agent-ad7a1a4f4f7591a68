import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { PixText } from '@core/pixiwrapper/PixText';
import { StandardView } from '@core/pixiwrapper/StandardView';
import { UIUtil } from '@core/utils/UIUtilService';
import { Util } from '@core/utils/UtilService';
import { DestroyOptions } from 'pixi.js';

export class WinSymbolStrip extends StandardView {
  protected stripBg: PixSprite;
  protected symbolCountText: PixText;
  protected winvalueText: PixText;
  protected symbImage: PixSprite;

  constructor(config) {
    super(config);
    this.stripBg = UIUtil.getSprite('add_line');
    this.stripBg.scale.set(1, 0.96);
    const tConfig = {
      name: 'symbolCountText',
      type: 'Text',
      toUpperCase: true,
      contentText: 'x10',
      anchor: { x: 1, y: 0.5 },
      style: { fontFamily: 'commonFontBold', fill: 0xffffff, fontSize: 40 },
    };
    this.symbolCountText = UIUtil.getElement(tConfig);
    this.symbolCountText.text = this.configData.size;
    tConfig.name = 'winValueText';
    this.winvalueText = UIUtil.getElement(tConfig);
    this.winvalueText.text = Util.formatCurrency(this.configData.winAmount);
    this.symbImage = UIUtil.getSprite(this.configData.symbol);
    this.symbImage.anchor.set(0.5);
    this.stripBg.x = -4;
    this.symbolCountText.x = 60;
    this.symbolCountText.y = this.stripBg.height / 2;
    this.winvalueText.x = 330;
    this.winvalueText.y = this.stripBg.height / 2;
    this.symbImage.x = 100;
    this.symbImage.y = this.stripBg.height / 2;
    this.addChild(this.stripBg);
    this.addChild(this.symbolCountText);
    this.addChild(this.winvalueText);
    this.addChild(this.symbImage);
    this.checkForScaling();
  }

  protected checkForScaling() {
    this.symbImage.scale.set(1);
    if (this.symbImage.height > this.stripBg.height * 0.8) {
      const scaleFactor = (this.stripBg.height * 0.8) / this.symbImage.height;
      this.symbImage.scale.set(scaleFactor);
    }
  }

  public destroy(options?: DestroyOptions): void {
    super.destroy(options);
    this.removeChildren();
    this.stripBg.destroy();
    this.symbolCountText.destroy();
    this.winvalueText.destroy();
    this.symbImage.destroy();
  }
}
