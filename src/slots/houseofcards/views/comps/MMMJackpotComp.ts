import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { JPItemComp } from '@slots/houseofcards/views/comps/JPItemComp';
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
  private readonly itemsByTier: Record<string, JPItemComp>;
  private readonly winningAnimOn: boolean;
  private idleAnimInterval: ReturnType<typeof setInterval> | null = null;
  constructor(config: any) {
    super(config);

    this.grandJP = this.elementsList['grand'];
    this.majorJP = this.elementsList['major'];
    this.minorJP = this.elementsList['minor'];
    this.miniJP = this.elementsList['mini'];
    this.items = [this.grandJP, this.majorJP, this.minorJP, this.miniJP];
    this.itemsByTier = {
      GRAND: this.grandJP,
      MAJOR: this.majorJP,
      MINOR: this.minorJP,
      MINI: this.miniJP,
    };
    // for (let i = 0; i < this.items.length; i++) {
    //   this.items[i].stopAnimation();
    // }

    this.winningAnimOn = false;
    EventHandler.addEventListener(SlotEvents.UPDATE_TOTALBET, this.setJPValues.bind(this));
    this.setJPValues();
    // this.startIdleAnim();
    // EventHandler.addEventListener(SlotEvents.SHOW_PICK_FEATURE_UI, this.stopIdleAnim.bind(this));
    // EventHandler.addEventListener(SlotEvents.HIDE_PICK_FEATURE_UI, this.startIdleAnim.bind(this));
  }
  public startIdleAnim(): void {
    if (this.idleAnimInterval) {
      clearInterval(this.idleAnimInterval);
    }
    this.idleAnimInterval = setInterval(this.showJPIdleAnim.bind(this), 10000);
  }

  public stopIdleAnim(): void {
    if (this.idleAnimInterval) {
      clearInterval(this.idleAnimInterval);
      this.idleAnimInterval = null;
    }
  }

  protected showJPIdleAnim(): void {
    if (!this.winningAnimOn) {
      this.items[Util.getRandomRange(0, 3)].showIdle();
    }
  }

  public playIdleAnim(jackpotName: string): void {
    this.itemsByTier[jackpotName?.toUpperCase()]?.showIdle();
  }

  public playWinAnim(jackpotName: string): void {
    this.itemsByTier[jackpotName?.toUpperCase()]?.showWin();
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
