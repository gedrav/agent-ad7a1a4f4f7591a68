import { StandardView } from '@core/pixiwrapper/StandardView';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';

export class LogoComp extends StandardView {
  private readonly logoAnim: PixSpine;

  constructor(config: any) {
    super(config);
    this.logoAnim = this.elementsList['logoAnim'];
    this.logoAnim.addEventListener('complete', this.onAnimComplete.bind(this));
    EventHandler.addEventListener('PLAY_LOGO_COLLECT_ANIM', this.playCollect.bind(this));
    this.playIdle();
  }

  public playIdle(): void {
    this.logoAnim.playAnimation({ state: 'idle', loop: true });
  }

  public playIdle2(): void {
    this.logoAnim.playAnimation({ state: 'idle2', loop: true });
  }

  public playCollect(): void {
    this.logoAnim.playAnimation({ state: 'collect', loop: false });
  }

  protected onAnimComplete(e: any): void {
    if (e.animation.name === 'collect') {
      this.playIdle();
    }
  }
}
