import { StandardView } from '@core/pixiwrapper/StandardView';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';

export class ReelStripBG extends StandardView {
  private bg1: PixSprite;
  private bg2: PixSprite;
  private bg3: PixSprite;
  private bg4: PixSprite;
  private totalStrips: number;

  constructor(config: any) {
    super(config);
    this.bg1 = this.elementsList['bg1'];
    this.bg2 = this.elementsList['bg2'];
    this.bg3 = this.elementsList['bg3'];
    this.bg4 = this.elementsList['bg4'];
    EventHandler.addEventListener(SlotEvents.START_SPIN, this.onSpinStart.bind(this));
    this.totalStrips = 4;
  }
  protected onSpinStart(): void {
    this.showStripAnim();
  }
  protected showStripAnim(): void {
    for (let i = 0; i < this.totalStrips; i++) {
      AnimationProxy.animateTween(this['bg' + (i + 1)], {
        duration: 0.2,
        alpha: 0.4,
        delay: i * 0.2,
        onComplete: this.doFadeIn.bind(this, this['bg' + (i + 1)]),
      });
    }
  }
  protected doFadeIn(element): void {
    AnimationProxy.animateTween(element, {
      duration: 0.2,
      alpha: 1,
    });
  }
}
