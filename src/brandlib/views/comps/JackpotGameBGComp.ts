import { SlotEvents } from '@core/events/SlotEvents';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { Util } from '@core/utils/UtilService';

export class JackpotGameBGComp extends ResponsiveChildrenView {
  constructor(config: any) {
    super(config);
    this.visible = false;
    this.alpha = 0;
    EventHandler.addEventListener(SlotEvents.SHOW_JACKPOT_INTRO_ANIM, this.showBG.bind(this));
    EventHandler.addEventListener(SlotEvents.HIDE_JACKPOT_BG, this.hideJackpotBG.bind(this));
  }
  hideJackpotBG() {
    AnimationProxy.fadeOut(this, 0.1, null);
  }
  showBG() {
    AnimationProxy.fadeIn(this, 0.1, null);
  }
}
