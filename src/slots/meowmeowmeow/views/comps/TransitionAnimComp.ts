import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { ResponsiveView } from '@core/pixiwrapper/ResponsiveView';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { PixView } from '@core/pixiwrapper/PixView';
import { Power2 } from 'gsap/gsap-core';

export class TransitionAnimComp extends ResponsiveChildrenView {
  private bg: PixSprite;
  private door: PixSprite;
  private readonly cont: PixView;

  constructor(config: any) {
    super(config);
    this.visible = false;
  }
  protected onViewCreated(): void {
    super.onViewCreated();
    this.bg = this.elementsList['bg'];
    this.door = this.elementsList['door'];
    /*setTimeout(() => {
      this.showTransition();
    }, 2000);*/
  }

  protected showTransition(): void {
    this.resizeView();
    this.bg.visible = false;
    this.door.y = -this.door.height;
    this.visible = true;
    UIUtil.adjustElement(this);
    AnimationProxy.animateTween(this.door, {
      duration: 2,
      y: 0,
      ease: Power2.easeIn,
      onComplete: () => {
        this.onDoorReachedBottom();
      },
    });
  }
  protected onDoorReachedBottom(): void {
    this.bg.visible = true;
    AnimationProxy.animateTween(this.door, {
      duration: 2,
      y: -this.door.height,
      ease: Power2.easeIn,
      onComplete: () => {
        this.onDoorReachedTop();
      },
    });
  }
  protected onDoorReachedTop(): void {}
}
