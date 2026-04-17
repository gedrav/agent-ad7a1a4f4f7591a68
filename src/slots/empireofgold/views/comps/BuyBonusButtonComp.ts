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
    EventHandler.addEventListener(SlotEvents.UPDATE_ANTE_BET_STATUS, this.onAnteBetStatusUpdate.bind(this));
    this.disableBtn();
  }
  protected onAnteBetStatusUpdate(): void {
    if (GameProxy.config.isAnteEnabled) {
      this.disableBtn();
    } else {
      this.enableBtn();
    }
  }

  protected updateBBBetValue(): void {
    if (this.bbBetValue) {
      const multiplier = appModel.getBuyBonusMultiplier(GameProxy.config.selectedBB);
      this.bbBetValue.scale.set(1);
      this.bbBetValue.text = Util.formatCurrency(appModel.getTotalBet() * multiplier);
      if (this.bbBetValue.width > this.bbBg.width * 0.8) {
        this.bbBetValue.scale.set((this.bbBg.width * 0.8) / this.bbBetValue.width);
      }
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
    if (GameProxy.config.isAnteEnabled) {
      this.interactive = true;
      this.alpha = 1;
    }
  }

  private disableBtn(): void {
    this.interactive = false;
    this.alpha = 0.6;
  }

  protected onBuyBonusClicked(): void {
    BuyBonusClickCommand.execute({ id: this.configData.data.id });
  }
}
