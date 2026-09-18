import { Container } from 'pixi.js';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { UIUtil } from '@core/utils/UIUtilService';
import { BONUS_SPINE_NAME, BONUS_SYMBOLS_DATA } from '../../config/BonusSymbolsConfig';

// One bonus-round top-panel symbol. There's no animation to play or stop here and nothing to pool
// or rebuild between spins - reel_sym_add's only animation is empty, so both the symbol and its
// blurred variant are a single setSkin() call (see BonusSymbolsConfig).
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

  // PixSpine's own teardown - a plain Container.destroy() leaves its skeleton/atlas GPU resources
  // behind unless {children: true} is passed all the way down.
  public destroy(options?: any): void {
    this.spine.destroySpine();
    super.destroy(options);
  }
}
