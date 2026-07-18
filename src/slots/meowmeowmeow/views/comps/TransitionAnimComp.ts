import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { ResponsiveView } from '@core/pixiwrapper/ResponsiveView';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { PixView } from '@core/pixiwrapper/PixView';

export class TransitionAnimComp extends ResponsiveView {
  private bg: PixSprite;
  private door: PixSprite;
  private castle: PixSprite;
  private cont: PixView;

  constructor(config: any) {
    super(config);
    this.visible = false;
  }
  protected onViewCreated(): void {
    this.cont = this.elementsList['cont'];
    this.cont.pivot.set(0);
    this.bg = this.cont.elementsList['bg'];
    this.door = this.cont.elementsList['door'];
    this.castle = this.cont.elementsList['castle'];
    /*setTimeout(() => {
      this.showTransition();
    }, 2000);*/
  }

  protected showTransition(): void {
    this.resizeView();
    this.visible = true;
    UIUtil.adjustElement(this);
    const xpos = this.cont.x;
    this.cont.x = this.cont.width;
    AnimationProxy.animateTween(this.cont, {
      duration: 2,
      x: xpos,
      ease: 'power2.in',
      onComplete: () => {
        this.onDoorAnimComplete();
      },
    });
  }
  protected onDoorAnimComplete(): void {
    /*AnimationProxy.animateTween(this.cont, {
      duration: 2,
      scaleX: 0.5,
      scaleY: 0.5,
      ease: 'power2.in',
      onComplete: () => {
        this.onSceneZoomedOut();
      },
    });*/
  }
  protected onSceneZoomedOut(): void {}

  protected resizeView() {
    super.resizeView();
    if (this.door) {
    }
  }
}
