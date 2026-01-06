import { StandardView } from '@core/pixiwrapper/StandardView';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { Util } from '@core/utils/UtilService';
import { UIUtil } from '@core/utils/UIUtilService';

export default class ReelSymbol extends StandardView {
  protected symbol: PixSprite;
  protected spine: PixSpine;
  protected isBlurred: boolean;
  protected _symbolName: string;

  constructor(configData: any) {
    super(configData);
    this._symbolName = configData.data.name;
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

  public setBlurredTexture(): void {}
  public setNormalTexture(): void {}
  public setNewSymbol(symbol: any, reelno: number): void {}
  public showFaded(): void {}

  public replaceSymbol(symb: string) {
    this.swapSymbolTexture(symb);
  }
  public showFeatureTriggerAnimation(): void {}

  public swapSymbolTexture(name: string) {
    this._symbolName = name;
    this.symbol.texture = UIUtil.getTexture(name);
  }

  get symbolName(): string {
    return this._symbolName;
  }

  set symbolName(value: string) {
    this._symbolName = value;
  }
}
