import { ResponsiveView } from '@core/pixiwrapper/ResponsiveView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';
import { AdjustableTextBox } from '@core/pixiwrapper/AdjustableTextBox';
import { JCEvents } from '../../events/JCEvents';
import { getLineBet } from '../../models/JCLinesState';

const DEFAULT_MULTIPLIERS = { Grand: 500, Major: 50, Minor: 20, Mini: 10 };

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
    EventHandler.addEventListener(JCEvents.SELECTED_LINES, this.updateValues.bind(this));
    this.updateValues();
  }

  private updateValues(): void {
    const bet = getLineBet();
    const multipliers = { ...DEFAULT_MULTIPLIERS, ...appModel.gameData?.jackpotMultiplier };
    this.grandValueText.text = Util.formatCurrency(bet * multipliers.Grand);
    this.majorValueText.text = Util.formatCurrency(bet * multipliers.Major);
    this.minorValueText.text = Util.formatCurrency(bet * multipliers.Minor);
    this.miniValueText.text = Util.formatCurrency(bet * multipliers.Mini);
  }
}
