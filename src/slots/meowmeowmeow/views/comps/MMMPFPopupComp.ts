import { PixText } from '@core/pixiwrapper/PixText';
import { PickBonusJackpotComp } from './pickBonusJackpot';
import { PFPopupComp } from '@brand/views/popups/PickFeaturePopupComp';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { appModel } from '@core/models/services/AppModelService';

export class MMMPFPopupComp extends PFPopupComp {
  private readonly congratText: PixText;

  constructor(config: any) {
    super(config);
    this.congratText = this.elementsList['congratText'];
  }

  protected override updateMessagePositions(data: any) {
    super.updateMessagePositions(data);
    this.messageText1.y = 1040;
  }
  protected async showPFPopup(data: any) {
    super.showPFPopup(data);
    const scale = this.scale.x;
    const yy = this.y;
    const xx = this.x;

    const dropOffset = 550;
    this.y -= dropOffset;
    this.x = xx;

    const mewSpine = this.elementsList['mew'] as PixSpine;
    if (mewSpine?.configData.idle) {
      const featName = appModel.getFeatureSubType().toUpperCase();
      const animName = featName === 'RED' ? '3_RED_Ideal' : '2_BLUE_Ideal';
      mewSpine.playAnimation({ state: animName, loop: true });
    }

    AnimationProxy.animateTween(this, {
      scaleX: scale,
      scaleY: scale,
      duration: 0.6,
      y: yy,
      x: xx,
      ease: 'bounce.out',
    });
  }
}
