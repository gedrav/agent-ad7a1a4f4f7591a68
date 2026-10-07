import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { StandardView } from '@core/pixiwrapper/StandardView';
import { UIUtil } from '@core/utils/UIUtilService';
import { Graphics } from 'pixi.js';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';

enum CardStatus {
  CLOSE = 'CLOSE',
  OPEN = 'OPEN',
}
const animationState = {
  BACK: 'back',
  ROTATION: 'rotation',
  STATIC: 'static',
};
export class JackpotCard extends StandardView {
  protected cardGuideRect: Graphics;
  protected card: PixSpine;
  private cardStatus: CardStatus;
  constructor(config) {
    super(config);
    this.configData = config;
    this.cardStatus = CardStatus.CLOSE;
    this.createCard();
  }
  private createCard() {
    this.cardGuideRect = UIUtil.getElement(this.configData.guideRect);
    this.addChild(this.cardGuideRect);
    this.card = UIUtil.getSpineAnim(this.configData.card.spineName, this.configData.card);
    this.addChild(this.card);
    this.card.x = this.card.configData.x;
    this.card.y = this.card.configData.y;
    this.reset();
    this.card.addEventListener('complete', this.onAnimationComplete.bind(this));
    this.cardGuideRect.interactive = true;
    UIUtil.addInteraction(this.cardGuideRect, this.onCardClick.bind(this));
  }
  private onAnimationComplete(e) {
    if (e.animation.name === animationState.ROTATION) {
      EventHandler.dispatchEvent('PLAY_JACKPOT_CARD_TURN');
      this.emit('onCardOpened');
      this.playCardAnimation({ state: animationState.STATIC, loop: false });
    }
  }
  public onSkinChange(skinName: string) {
    this.card.setSkin(skinName);
  }
  private playCardAnimation({ state, loop }) {
    this.card.playAnimation({ state, loop, reset: false });
  }
  private onCardClick() {
    if (this.cardStatus === CardStatus.CLOSE) {
      this.emit('onCardPressed');
    }
  }
  public isClosed(): boolean {
    return this.cardStatus === CardStatus.CLOSE;
  }
  public setLocked(locked: boolean) {
    this.cardGuideRect.interactive = !locked && this.isClosed();
  }
  public openAnimated(skinName: string) {
    if (!this.isClosed()) return;
    this.onSkinChange(skinName);
    this.cardGuideRect.interactive = false;
    this.cardStatus = CardStatus.OPEN;
    EventHandler.dispatchEvent('PLAY_JACKPOT_CARD_CLICK');
    this.playCardAnimation({ state: animationState.ROTATION, loop: false });
  }
  public openStatic(skinName: string) {
    if (!this.isClosed()) return;
    this.onSkinChange(skinName);
    this.cardGuideRect.interactive = false;
    this.cardStatus = CardStatus.OPEN;
    this.playCardAnimation({ state: animationState.STATIC, loop: false });
  }
  public reset() {
    this.cardGuideRect.interactive = true;
    this.cardStatus = CardStatus.CLOSE;
    this.playCardAnimation({ state: animationState.BACK, loop: false });
  }
}
