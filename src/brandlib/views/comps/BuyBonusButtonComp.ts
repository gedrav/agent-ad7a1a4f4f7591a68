import { StandardView } from '@core/pixiwrapper/StandardView';
import { appModel } from '@core/models/services/AppModelService';
import { GameProxy } from '@core/models/GameConfigProxy';
import { Util } from '@core/utils/UtilService';
import { UIUtil } from '@core/utils/UIUtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { BuyBonusClickCommand } from '@core/commands/action/BuyBonusClickCommand';
import { ColorMatrixFilter } from 'pixi.js';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { PixText } from '@core/pixiwrapper/PixText';

export class BuyBonusButtonComp extends StandardView {
  protected bbBetValue: PixText;
  protected bbBtnText: PixText;
  protected bbBg: PixSprite;
  private flt: ColorMatrixFilter;

  constructor(config: any) {
    super(config);

    this.bbBg = this.elementsList['bbBg'];
    this.bbBetValue = this.elementsList['bbBetValue'];
    this.bbBtnText = this.elementsList['bbBtnText'];
    this.setupInteraction();
    this.updateBBBetValue();
    EventHandler.addEventListener(SlotEvents.UPDATE_TOTALBET, this.updateBBBetValue.bind(this));
    EventHandler.addEventListener(SlotEvents.UPDATE_BB_STATE, this.updateBBBetValue.bind(this));
    EventHandler.addEventListener(SlotEvents.ENABLE_CONTROLPANEL, this.enableBtn.bind(this));
    EventHandler.addEventListener(SlotEvents.DISABLE_CONTROLPANEL, this.disableBtn.bind(this));
    EventHandler.addEventListener(SlotEvents.UPDATE_ANTE_BET_STATUS, this.onAnteBetStatusUpdate.bind(this));
    EventHandler.addEventListener(SlotEvents.DISALBE_ANTE_BB_BUTTON, this.disableBtn.bind(this));
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
      const factor = GameProxy.config.isAnteEnabled ? GameProxy.config.anteBetMultiplier : 1;
      this.bbBetValue.text = Util.formatCurrency((appModel.getTotalBet() * multiplier) / factor);
      if (this.bbBetValue.width > this.bbBg.width * 0.8) {
        this.bbBetValue.scale.set((this.bbBg.width * 0.8) / this.bbBetValue.width);
      }
    }
    this.enableBtn();
  }

  protected setupInteraction(): void {
    UIUtil.resumeInteraction(this);
    UIUtil.setHandCursor(this, true);
    this.eventMode = 'static';
    this.cursor = 'pointer';
    // Play click sound on press for instant feedback; the action stays on
    // release (addInteraction = touchend/mouseup), which otherwise feels delayed.
    UIUtil.addDownInteraction(this, this.playClickSound.bind(this));
    UIUtil.addInteraction(this, this.onBuyBonusClicked.bind(this));
  }

  protected playClickSound(): void {
    EventHandler.dispatchEvent(SlotEvents.PLAY_BUY_BONUS_CLICKED_SOUND);
  }

  private enableBtn(): void {
    if (!GameProxy.config.isAnteEnabled) {
      this.interactive = true;
      this.bbBg.filters = null;
      this.bbBetValue.alpha = 1;
      this.bbBtnText.alpha = 1;
    }
  }

  private disableBtn(): void {
    this.interactive = false;
    if (!this.flt) {
      this.flt = new ColorMatrixFilter();
      this.flt.greyscale(0.32, true);
      this.flt.resolution = Math.min(Math.ceil(window.devicePixelRatio), 2);
    }
    this.bbBg.filters = [this.flt]; //applying filter on bg only and not on whole object as that will result in observable jerk in both text while toggling
    this.bbBetValue.alpha = 0.6;
    this.bbBtnText.alpha = 0.6;
  }

  protected onBuyBonusClicked(): void {
    BuyBonusClickCommand.execute({ id: this.configData.data.id });
  }
}
