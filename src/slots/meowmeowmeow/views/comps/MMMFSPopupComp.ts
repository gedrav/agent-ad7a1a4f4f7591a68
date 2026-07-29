import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { StandardView } from '@core/pixiwrapper/StandardView';
import { PixText } from '@core/pixiwrapper/PixText';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { FSPopupComp } from '@brand/views/popups/FSPopupComp';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { Util } from '@core/utils/UtilService';

export class MMMFSPopupComp extends FSPopupComp {
  private readonly congratText: PixText;

  constructor(config: any) {
    super(config);
    this.congratText = this.elementsList['congratText'];

    if (this.okBtn) {
      this.okBtn.visible = false;
    }

    if (this.panelBG) {
      this.panelBG.interactive = true;
      this.panelBG.cursor = 'pointer';
      this.panelBG.on('pointerdown', this.onCloseClicked.bind(this));
    }

    this.interactive = true;
    this.cursor = 'pointer';
    this.on('pointerdown', this.onCloseClicked.bind(this));
  }

  protected updateMessagePositions(data: any): void {
    super.updateMessagePositions(data);

    const freeGamesCountText = this.elementsList['freeGamesCountText'];
    const freeGamesLabelText = this.elementsList['freeGamesLabelText'];
    const waysCountText = this.elementsList['waysCountText'];
    const waysLabelText = this.elementsList['waysLabelText'];

    if (this.congratText) {
      this.congratText.visible = true;
      this.congratText.text = Util.getContent('CongratTitle') || 'CONGRATULATIONS!';
      this.congratText.y = 150;
    }

    if (data.entryPopUp) {
      if (this.titleText) {
        this.titleText.visible = true;
        this.titleText.text = Util.getContent('FeatureAwardedTitle') || 'FEATURE AWARDED';
        this.titleText.y = 880;
      }
      if (freeGamesCountText) {
        freeGamesCountText.visible = true;
        if (data.totalCount !== undefined) {
          freeGamesCountText.text = String(data.totalCount);
        }
      }
      if (freeGamesLabelText) freeGamesLabelText.visible = true;
      if (waysCountText) waysCountText.visible = true;
      if (waysLabelText) waysLabelText.visible = true;
      if (this.messageText1) this.messageText1.visible = false;
      if (this.messageText2) {
        this.messageText2.visible = true;
        this.messageText2.text = 'PRESS ► TO CONTINUE';
      }
    } else {
      if (this.titleText) {
        this.titleText.visible = false;
      }
      if (freeGamesCountText) freeGamesCountText.visible = false;
      if (freeGamesLabelText) freeGamesLabelText.visible = false;
      if (waysCountText) waysCountText.visible = false;
      if (waysLabelText) waysLabelText.visible = false;

      if (this.messageText1) {
        this.messageText1.visible = true;
        this.messageText1.y = 1020;
      }
      if (this.messageText2) {
        this.messageText2.visible = true;
        this.messageText2.text = 'PRESS ► TO CONTINUE';
      }
    }
  }

  protected async showFSPopup(data: any) {
    super.showFSPopup(data);
    const scale = this.scale.x;
    const yy = this.y;
    const xx = this.x;
    this.scale.set(0);
    this.y += 550;
    this.x += 200;

    const mewSpine = this.elementsList['mew'] as PixSpine;
    if (mewSpine?.configData.idle) {
      mewSpine.playAnimation({ state: mewSpine.configData.idle, loop: mewSpine.configData.loop || true });
    }
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
