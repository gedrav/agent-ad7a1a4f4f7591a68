import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { PixText } from '@core/pixiwrapper/PixText';
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { UIUtil } from '@core/utils/UIUtilService';
import { Util } from '@core/utils/UtilService';
import { utils } from '@pixi/core';

export class JackPotItem extends ResponsiveChildrenView {
  private readonly jackpotBg: PixSpine;
  private readonly value: PixText;
  constructor(config) {
    super(config);
    this.jackpotBg = this.elementsList['jackpotBg'];
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
  }
}
