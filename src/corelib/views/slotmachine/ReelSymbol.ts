import { StandardView } from '@core/pixiwrapper/StandardView';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { Util } from '@core/utils/UtilService';
import { UIUtil } from '@core/utils/UIUtilService';

interface SymbolData {
  name: string;
  spineName: string;
  skin: string;
  idleAnim: string;
  winAnim: string;
  reelNumber?: number;
}

export interface SymbolConfig {
  data: SymbolData;
}

export default class ReelSymbol extends StandardView {
  protected symbol: PixSprite;
  protected spine: PixSpine;
  protected isBlurred: boolean = false;

  constructor(configData: SymbolConfig) {
    super(configData);
  }

  public getSymbolName(): string {
    return this.configData.data.name;
  }
  public showIdle(): void {}

  public stopIdleAnim(): void {}

  public resetSymbol(): void {
    if (!this.symbol) return;
    this.isBlurred = false;
    this.symbol.texture = this.resolveTexture();
    this.symbol.x = 0;
    this.symbol.y = 0;
    this.symbol.visible = true;
    this.symbol.rotation = Util.getRadians(0);
    this.symbol.alpha = 1;
    this.symbol.scale.set(Util.getDefaultValue(this.configData.data.scale, 1));
    this.setSpineVisible(false);
  }
  protected resolveTexture() {
    const name = this.isBlurred ? `${this.configData.data.name}_blur` : this.configData.data.name;
    return UIUtil.getTexture(name);
  }

  protected setSpineVisible(flag: boolean): void {
    if (!this.spine) return;
    this.symbol.visible = !flag;
    this.spine.visible = flag;
    // Detach hidden spines from Ticker.shared so they don't consume CPU/GPU
    // while invisible (idle symbols on screen, popups closed, etc.).
    this.spine.setAutoUpdate?.(flag);
  }

  public swapSymbolTexture(data: any, reelno: number): void {
    this.setNewSymbol(data, reelno);

    const textureName = this.isBlurred ? `${this.configData.data.name}_blur` : this.configData.data.name;

    this.symbol.texture = UIUtil.getTexture(textureName);
  }

  public replaceSymbol(symb: any, reelno: number, onComplete?: () => void): void {
    this.swapSymbolTexture(symb, reelno);
  }

  // Overridable hooks for subclasses
  public showLanding(): void {}
  public showFaded(): void {}
  public showFeatureTriggerAnimation(): void {}
  public setBlurredTexture(): void {}
  public setNormalTexture(): void {}
  public setNewSymbol(symbol: any, reelno: number): void {}
  public recreateAnimation(): void {}
}
