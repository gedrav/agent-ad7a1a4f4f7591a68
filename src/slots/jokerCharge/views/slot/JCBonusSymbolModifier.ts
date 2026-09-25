import { UIUtil } from '@core/utils/UIUtilService';
import { Util } from '@core/utils/UtilService';
import { appModel } from '@core/models/services/AppModelService';
import ReelSymbolSpineExtended from '@core/views/slotmachine/ReelSymbolSpineExtended';

const BONUS_SYMBOL_PREFIX = 'cor-';
// Shared with JCReelSymbol's static label handling (mini/minor/major) - both hat and belt/boot/
// mask rigs have this same placeholder slot.
export const ROOT_TEXT_SLOT_NAME = 'root_txt';

// Overlays a cor-Nx bonus symbol's cash value, attached to the hat rig's root_txt placeholder slot
// so it follows the symbol's own spine animation. The name carries the multiplier (cor-2x -> 2),
// which is shown as what it actually pays at the current bet.
export class JCBonusSymbolModifier {
  constructor(private readonly host: ReelSymbolSpineExtended) {}

  public create(symbolName: string, textConfig: any): void {
    this.destroy();
    if (!textConfig) return;
    const text = UIUtil.getElement(textConfig);
    text.anchor?.set(textConfig.anchor?.x ?? 0.5, textConfig.anchor?.y ?? 0.5);
    const multiplier = Number(symbolName.slice(BONUS_SYMBOL_PREFIX.length, -1));
    text.text = Util.formatCurrencyNoSymbol(multiplier * appModel.getTotalBet());
    this.host.addSlotObject(ROOT_TEXT_SLOT_NAME, text);
  }

  public destroy(): void {
    this.host.removeSlotObject(ROOT_TEXT_SLOT_NAME);
  }
}
