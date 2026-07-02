import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { JPItemComp } from '@slots/meowmeowmeow/views/comps/JPItemComp';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';

export class JackpotComp extends ResponsiveChildrenView {
  private readonly grandJP: JPItemComp;
  private readonly majorJP: JPItemComp;
  private readonly minorJP: JPItemComp;
  private readonly miniJP: JPItemComp;
  constructor(config: any) {
    super(config);

    this.grandJP = this.elementsList['grand'];
    this.majorJP = this.elementsList['major'];
    this.minorJP = this.elementsList['minor'];
    this.miniJP = this.elementsList['mini'];

    EventHandler.addEventListener(SlotEvents.UPDATE_TOTALBET, this.setJPValues.bind(this));
    this.setJPValues();
  }

  protected setJPValues(): void {
    const multipliers = [20, 50, 100, 200000];
    this.miniJP.updateJPValue(Util.formatCurrency(appModel.getTotalBet() * multipliers[0]));
    this.minorJP.updateJPValue(Util.formatCurrency(appModel.getTotalBet() * multipliers[1]));
    this.majorJP.updateJPValue(Util.formatCurrency(appModel.getTotalBet() * multipliers[2]));
    this.grandJP.updateJPValue(Util.formatCurrency(appModel.getTotalBet() * multipliers[3]));
  }
}
