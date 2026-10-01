import { Container } from 'pixi.js';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { UIUtil } from '@core/utils/UIUtilService';
import { BONUS_SPINE_NAME, BONUS_SYMBOLS_DATA } from '../../config/BonusSymbolsConfig';

// reel_sym_add's only animation is empty, so there's nothing to play here - picking a symbol and
// blurring it are both just setSkin() (see BonusSymbolsConfig).
export default class BonusReelSymbol extends Container {
  private readonly spine: PixSpine;
  private symbolName: string;
  private blurred = false;

  constructor(symbolName: string, scale: number) {
    super();
    this.symbolName = symbolName;
    this.spine = UIUtil.getSpineAnim(BONUS_SPINE_NAME, {
      spineName: BONUS_SPINE_NAME,
      defaultSkin: BONUS_SYMBOLS_DATA[symbolName]?.staticSkin,
    });
    this.spine.label = 'bonusSymbol';
    this.spine.scale.set(scale);
    this.addChild(this.spine);
  }

  public getSymbolName(): string {
    return this.symbolName;
  }

  public setSymbol(symbolName: string): void {
    this.symbolName = symbolName;
    this.applySkin();
  }

  public setBlurred(flag: boolean): void {
    this.blurred = flag;
    this.applySkin();
  }

  private applySkin(): void {
    const data = BONUS_SYMBOLS_DATA[this.symbolName];
    if (!data) return;
    this.spine.setSkin(this.blurred ? data.blurSkin : data.staticSkin);
  }

  // Container.destroy() alone leaves the skeleton/atlas GPU resources behind.
  public destroy(options?: any): void {
    this.spine.destroySpine();
    super.destroy(options);
  }
}
