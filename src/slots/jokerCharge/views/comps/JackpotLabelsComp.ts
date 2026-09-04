import { ResponsiveView } from '@core/pixiwrapper/ResponsiveView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';
import { AdjustableTextBox } from '@core/pixiwrapper/AdjustableTextBox';

const MULTIPLIERS = {
  mini: 10,
  minor: 20,
  major: 30,
  grand: 500,
};

export class JackpotLabelsComp extends ResponsiveView {
  private readonly grandValueText: AdjustableTextBox;
  private readonly majorValueText: AdjustableTextBox;
  private readonly minorValueText: AdjustableTextBox;
  private readonly miniValueText: AdjustableTextBox;

  constructor(configData: any) {
    super(configData);
    this.grandValueText = this.elementsList['grandValueText'];
    this.majorValueText = this.elementsList['majorValueText'];
    this.minorValueText = this.elementsList['minorValueText'];
    this.miniValueText = this.elementsList['miniValueText'];

    EventHandler.addEventListener(SlotEvents.UPDATE_TOTALBET, this.updateValues.bind(this));
    this.updateValues();
  }

  private updateValues(): void {
    const bet = appModel.getTotalBet();
    this.grandValueText.text = Util.formatCurrency(bet * MULTIPLIERS.grand);
    this.majorValueText.text = Util.formatCurrency(bet * MULTIPLIERS.major);
    this.minorValueText.text = Util.formatCurrency(bet * MULTIPLIERS.minor);
    this.miniValueText.text = Util.formatCurrency(bet * MULTIPLIERS.mini);
  }
}
