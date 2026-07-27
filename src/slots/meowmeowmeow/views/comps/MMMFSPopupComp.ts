import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { StandardView } from '@core/pixiwrapper/StandardView';
import { PixText } from '@core/pixiwrapper/PixText';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { FSPopupComp } from '@brand/views/popups/FSPopupComp';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';

export class MMMFSPopupComp extends FSPopupComp {
  constructor(config: any) {
    super(config);
  }

  protected async showFSPopup(data: any) {
    super.showFSPopup(data);
    const scale = this.scale.x;
    const yy = this.y;
    const xx = this.x;
    this.scale.set(0);
    this.y += 550;
    this.x += 200;
    AnimationProxy.animateTween(this, {
      scaleX: scale,
      scaleY: scale,
      duration: 0.6,
      y: yy,
      x: xx,
      ease: 'power2.out',
    });
  }
}
