import { StandardView } from '@core/pixiwrapper/StandardView';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { Util } from '@core/utils/UtilService';
import { UIUtil } from '@core/utils/UIUtilService';

export default class ReelSymbol extends StandardView {
  protected symbol: PixSprite;
  protected spine: PixSpine;
  protected isBlurred: boolean;

  constructor(configData: any) {
    super(configData);
  }

  public showIdle(): void {
    console.log('show idle');
  }
  public stopIdleAnim(): void {}
  public resetSymbol(): void {
    if (this.symbol) {
      this.symbol.x = 0;
      this.symbol.y = 0;
      this.symbol.rotation = Util.getRadians(0);
      this.symbol.alpha = 1;
      this.symbol.scale.set(Util.getDefaultValue(this.configData.data.scale, 1));
    }
  }
  public showLanding(): void {}
  public setBlurredTexture(): void {}
  public setNormalTexture(): void {}
  public setNewSymbol(symbol: any, reelno: number): void {}
  public showFaded(): void {}

  public replaceSymbol(symb: string) {
    this.swapSymbolTexture(symb);
  }
  public showFeatureTriggerAnimation(): void {}

  public swapSymbolTexture(name: string) {
    this.configData.data.name = name;
    if (this.isBlurred) {
      this.symbol.texture = UIUtil.getTexture(this.configData.data.name + '_blur');
    } else {
      this.symbol.texture = UIUtil.getTexture(this.configData.data.name);
    }
  }
}
