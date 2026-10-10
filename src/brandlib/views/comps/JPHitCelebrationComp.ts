import { StandardView } from '@core/pixiwrapper/StandardView';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { Sine } from 'gsap/gsap-core';
import { GameProxy } from '@core/models/GameConfigProxy';
import { ColorMatrixFilter } from 'pixi.js';
import { WrapperProxy } from '@brand/models/WrapperServiceProxy';
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { PixText } from '@core/pixiwrapper/PixText';

export class JPHitCelebrationComp extends ResponsiveChildrenView {
  private readonly msgText: PixText;
  constructor(config: any) {
    super(config);
    this.msgText = this.elementsList['msgText'];
    EventHandler.addEventListener(SlotEvents.JACKPOT_WON, this.onOtherPlayerJPWon.bind(this));
    this.visible = false;
  }

  protected onOtherPlayerJPWon(data: any): void {
    const str = Util.getContent('JPHitNotificationText');
    this.msgText.text = Util.parseMessage(str, [data.playerId, Util.formatCurrency(data.amount), data.tier]);
    this.visible = true;
    AnimationProxy.fadeIn(this, 0.25, this.onFadedIn.bind(this));
  }
  protected onFadedIn(): void {
    AnimationProxy.animateTween(this, { duration: 0.5, alpha: 0, delay: 4, onComplete: this.onFadedOut.bind(this) });
  }
  protected onFadedOut(): void {
    this.visible = false;
    this.alpha = 0;
  }
}
