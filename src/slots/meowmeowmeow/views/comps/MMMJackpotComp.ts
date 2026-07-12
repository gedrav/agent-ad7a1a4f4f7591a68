import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { JPItemComp } from '@slots/meowmeowmeow/views/comps/JPItemComp';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';

export class MMMJackpotComp extends ResponsiveChildrenView {
  private readonly grandJP: JPItemComp;
  private readonly majorJP: JPItemComp;
  private readonly minorJP: JPItemComp;
  private readonly miniJP: JPItemComp;
  private readonly items: JPItemComp[] = [];
  private readonly winningAnimOn: boolean;
  constructor(config: any) {
    super(config);

    this.grandJP = this.elementsList['grand'];
    this.majorJP = this.elementsList['major'];
    this.minorJP = this.elementsList['minor'];
    this.miniJP = this.elementsList['mini'];
    this.items = [this.grandJP, this.majorJP, this.minorJP, this.miniJP];
    for (let i = 0; i < this.items.length; i++) {
      this.items[i].stopAnimation();
    }

    this.winningAnimOn = false;
    EventHandler.addEventListener(SlotEvents.UPDATE_TOTALBET, this.setJPValues.bind(this));
    this.setJPValues();
    this.startIdleAnim();
  }
  protected startIdleAnim(): void {
    setInterval(this.showJPIdleAnim.bind(this), 10000);
  }

  protected showJPIdleAnim(): void {
    if (!this.winningAnimOn) {
      this.items[Util.getRandomRange(0, 3)].showIdle();
    }
  }

  protected setJPValues(): void {
    const multipliers = appModel.gameData.jackpotMultipliers;
    if (!multipliers) return;
    this.miniJP.updateJPValue(Util.formatCurrency(appModel.getTotalBet() * multipliers.Mini));
    this.minorJP.updateJPValue(Util.formatCurrency(appModel.getTotalBet() * multipliers.Minor));
    this.majorJP.updateJPValue(Util.formatCurrency(appModel.getTotalBet() * multipliers.Major));
    this.grandJP.updateJPValue(Util.formatCurrency(appModel.getTotalBet() * multipliers.Grand));
  }
}
