import { Container } from 'pixi.js';
import { UIUtil } from '@core/utils/UIUtilService';

const BONUS_SYMBOL_PREFIX = 'cor-';

// Overlays the "Nx" multiplier value on top of a cor-Nx bonus symbol (e.g. cor-2x -> "2").
export class JCBonusSymbolModifier {
  private text: any = null;

  constructor(private readonly host: Container) {}

  public create(symbolName: string, textConfig: any): void {
    this.destroy();
    if (!textConfig) return;
    this.text = UIUtil.getElement(textConfig);
    this.text.anchor?.set(textConfig.anchor?.x ?? 0.5, textConfig.anchor?.y ?? 0.5);
    this.text.x = textConfig.x ?? 0;
    this.text.y = textConfig.y ?? 0;
    this.text.text = symbolName.slice(BONUS_SYMBOL_PREFIX.length, -1);
    this.host.addChild(this.text);
  }

  public destroy(): void {
    if (!this.text) return;
    this.host.removeChild(this.text);
    this.text.destroy();
    this.text = null;
  }
}
