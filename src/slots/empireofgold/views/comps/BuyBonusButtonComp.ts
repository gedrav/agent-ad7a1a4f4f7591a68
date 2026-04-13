import { StandardView } from '@core/pixiwrapper/StandardView';
import { appModel } from '@core/models/services/AppModelService';
import { GameProxy } from '@core/models/GameConfigProxy';
import { Util } from '@core/utils/UtilService';
import { UIUtil } from '@core/utils/UIUtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { BuyBonusClickCommand } from '@core/commands/action/BuyBonusClickCommand';

export class BuyBonusButtonComp extends StandardView {
  protected bbBetValue: any;
  protected bbBg: any;

  constructor(config: any) {
    super(config);

    this.bbBg = this.elementsList['bbBg'];
    this.bbBetValue = this.elementsList['bbBetValue'];
    this.setupInteraction();
    this.updateBBBetValue();
    EventHandler.addEventListener(SlotEvents.UPDATE_TOTALBET, this.updateBBBetValue.bind(this));
    EventHandler.addEventListener(SlotEvents.ENABLE_CONTROLPANEL, this.enableBtn.bind(this));
    EventHandler.addEventListener(SlotEvents.DISABLE_CONTROLPANEL, this.disableBtn.bind(this));
    this.disableBtn();
  }

  protected updateBBBetValue(): void {
    if (this.bbBetValue) {
      const multiplier = appModel.getBuyBonusMultiplier(GameProxy.config.selectedBB);
      this.bbBetValue.text = Util.formatCurrency(appModel.getTotalBet() * multiplier);
    }
  }

  protected setupInteraction(): void {
    UIUtil.resumeInteraction(this);
    UIUtil.setHandCursor(this, true);
    this.eventMode = 'static';
    this.cursor = 'pointer';
    UIUtil.addInteraction(this, this.onBuyBonusClicked.bind(this));
  }

  private enableBtn(): void {
    this.interactive = true;
    this.alpha = 1;
  }

  private disableBtn(): void {
    this.interactive = false;
    this.alpha = 0.9;
  }

  protected onBuyBonusClicked(): void {
    BuyBonusClickCommand.execute({ id: this.configData.data.id });
  }
}
