import { UIUtil } from '@core/utils/UIUtilService';
import ReelSymbolSpineExtended from '@core/views/slotmachine/ReelSymbolSpineExtended';

const BONUS_SYMBOL_PREFIX = 'cor-';
// Shared with JCReelSymbol's static label handling (mini/minor/major) - both hat and belt/boot/
// mask rigs have this same placeholder slot.
export const ROOT_TEXT_SLOT_NAME = 'root_txt';

// Overlays the "Nx" multiplier value on top of a cor-Nx bonus symbol (e.g. cor-2x -> "2"), attached
// to the hat rig's root_txt placeholder slot so it follows the symbol's own spine animation.
export class JCBonusSymbolModifier {
  constructor(private readonly host: ReelSymbolSpineExtended) {}

  public create(symbolName: string, textConfig: any): void {
    this.destroy();
    if (!textConfig) return;
    const text = UIUtil.getElement(textConfig);
    text.anchor?.set(textConfig.anchor?.x ?? 0.5, textConfig.anchor?.y ?? 0.5);
    text.text = symbolName.slice(BONUS_SYMBOL_PREFIX.length, -1);
    this.host.addSlotObject(ROOT_TEXT_SLOT_NAME, text);
  }

  public destroy(): void {
    this.host.removeSlotObject(ROOT_TEXT_SLOT_NAME);
  }
}
