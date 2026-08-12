import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { PixText } from '@core/pixiwrapper/PixText';
import { StandardView } from '@core/pixiwrapper/StandardView';
import { UIUtil } from '@core/utils/UIUtilService';
import { Util } from '@core/utils/UtilService';

export class JackPotItem extends StandardView {
  private readonly jackpotBg: PixSpine;
  private readonly txtRect: PixGraphics;
  private readonly value: PixText;
  constructor(config) {
    super(config);
    this.jackpotBg = this.elementsList['jackpotBg'];
    this.txtRect = this.elementsList['txtRect'];
    this.value = this.elementsList['value'];
  }
  public initialView({ skinName, colorcode }) {
    this.jackpotBg.setSkin(skinName);
    UIUtil.updateTextColor(this.value, colorcode);
  }
  public changeAnimation({ state, loop }) {
    this.jackpotBg.playAnimation({ state, loop, reset: false });
  }
  public updateJackpotValue(value: number) {
    this.value.text = Util.formatCurrency(value);
    this.adjustTextSize();
  }
  public adjustTextSize() {
    this.value.scale.set(1);
    if (this.value.width > this.txtRect.width) {
      this.value.width = this.txtRect.width * 0.96;
      this.value.scale.set(this.value.scale.x);
    }
  }
}
