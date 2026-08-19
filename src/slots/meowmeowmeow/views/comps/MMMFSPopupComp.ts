import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { StandardView } from '@core/pixiwrapper/StandardView';
import { PixText } from '@core/pixiwrapper/PixText';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { FSPopupComp } from '@brand/views/popups/FSPopupComp';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { Util } from '@core/utils/UtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { FEATURE_NAMES } from '@slots/meowmeowmeow/config/FeatureNames';
import { appModel } from '@core/models/services/AppModelService';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';

export class MMMFSPopupComp extends FSPopupComp {
  private readonly congratText: PixText;
  private readonly playBtn: PixSprite;
  protected _isClicked: boolean = false;
  private popupData: any;

  constructor(config: any) {
    super(config);
    this.congratText = this.elementsList['congratText'];
    this.playBtn = this.elementsList['playBtn'];

    if (this.okBtn) {
      this.okBtn.visible = false;
    }

    if (this.playBtn) {
      this.playBtn.interactive = true;
      this.playBtn.cursor = 'pointer';
      this.playBtn.on('pointerdown', this.onCloseClicked.bind(this));
    }
  }

  protected updateMessagePositions(data: any): void {
    super.updateMessagePositions(data);

    const playBtnText = (this.playBtn as any)?.elementsList?.['playBtnText'] as PixText;
    if (playBtnText) {
      playBtnText.text = data.entryPopUp
        ? Util.getContent('play_heading') || 'PLAY'
        : Util.getContent('ContinueBtnText') || 'CONTINUE';

      playBtnText.scale.set(1);
      const playBtnImage = (this.playBtn as any)?.elementsList?.['playBtnImage'];
      if (playBtnImage) {
        const maxWidth = playBtnImage.width * 0.75;
        if (playBtnText.width > maxWidth) {
          playBtnText.scale.set(maxWidth / playBtnText.width);
        }
      }
    }

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
        this.titleText.y = 687;
      }
      const temp = DeviceProxy.isDevice() ? 1050 : 1150;
      if (freeGamesCountText && freeGamesLabelText) {
        freeGamesCountText.visible = true;
        freeGamesLabelText.visible = true;
        if (data.totalCount !== undefined) {
          freeGamesCountText.text = String(data.totalCount);
        }
        const spacing = 15;
        const totalWidth = freeGamesCountText.width + spacing + freeGamesLabelText.width;
        const startX = temp - totalWidth / 2;
        freeGamesCountText.anchor.x = 0;
        freeGamesCountText.x = startX;
        freeGamesLabelText.anchor.x = 0;
        freeGamesLabelText.x = startX + freeGamesCountText.width + spacing;
      }

      if (waysCountText && waysLabelText) {
        waysCountText.visible = true;
        waysLabelText.visible = true;
        const spacing = 15;
        const totalWidth = waysCountText.width + spacing + waysLabelText.width;
        const startX = temp - totalWidth / 2;
        waysCountText.anchor.x = 0;
        waysCountText.x = startX;
        waysLabelText.anchor.x = 0;
        waysLabelText.x = startX + waysCountText.width + spacing;
      }
      if (this.messageText1) this.messageText1.visible = false;
      // if (this.messageText2) {
      //   this.messageText2.visible = true;
      //   this.messageText2.text = Util.getContent('pressToContinue');
      // }
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
      // if (this.messageText2) {
      //   this.messageText2.visible = true;
      //   this.messageText2.text = Util.getContent('pressToContinue');
      // }
    }
  }

  protected async showFSPopup(data: any) {
    this._isClicked = false;
    this.popupData = data;

    if (data.entryPopUp == undefined && data.title === (Util.getContent('CongratTitle') || 'CONGRATULATIONS!')) {
      if (data.callbackFunction) {
        data.callbackFunction();
      }
      return;
    }
    const showBaseGameUI = data.entryPopUp ? false : true;

    if (
      !showBaseGameUI &&
      !(
        appModel.getFeatureSubType()?.toUpperCase() === FEATURE_NAMES.BLUE &&
        appModel.getNextSubFeatureType()?.toUpperCase() === FEATURE_NAMES.GREEN
      )
    ) {
      EventHandler.dispatchEvent('TRANSITION', {
        show: showBaseGameUI,
        callback: () => {
          super.showFSPopup(data);
          this.parent?.addChild(this);

          const mewSpine = this.elementsList['mew'] as PixSpine;
          if (mewSpine?.configData.idle) {
            mewSpine.playAnimation({ state: mewSpine.configData.idle, loop: mewSpine.configData.loop || true });
          }

          this.animateElementsDropIn();
        },
      });
    } else {
      super.showFSPopup(data);
      this.parent?.addChild(this);
      const mewSpine = this.elementsList['mew'] as PixSpine;
      if (mewSpine?.configData.idle) {
        mewSpine.playAnimation({ state: mewSpine.configData.idle, loop: mewSpine.configData.loop || true });
      }
      this.animateElementsDropIn();
    }
  }

  protected async onCloseClicked() {
    if (this._isClicked || !this.parent) return;
    this._isClicked = true;

    const isBlueToGreen =
      !!this.popupData?.entryPopUp &&
      appModel.getFeatureSubType()?.toUpperCase() === FEATURE_NAMES.BLUE &&
      appModel.getNextSubFeatureType()?.toUpperCase() === FEATURE_NAMES.GREEN;

    if (this.popupData?.entryPopUp) {
      EventHandler.dispatchEvent('SET_KITTIBANK_FEATURE_STATE', FEATURE_NAMES.GREEN);
      if (isBlueToGreen) {
        const stateCallback = this.callbackFunction;
        this.callbackFunction = null;
        EventHandler.dispatchEvent('HIDE_WHEEL_FEATURE_UI');
        EventHandler.dispatchEvent('SHOW_GREEN_TRANSITION', { callback: () => stateCallback?.() });
      }
    }
    this.animateElementsDropOut(() => {
      this._isClicked = false;
      super.onCloseClicked();
      if (!this.popupData.entryPopUp) {
        EventHandler.dispatchEvent('RESET_KITTIEBANK_ANIM');
        EventHandler.dispatchEvent('TRANSITION', {
          show: true,
          callback: () => {},
        });
      }
    });
  }

  private animateElementsDropIn(): void {
    const dropStartY = -600;

    AnimationProxy.killTweensOf(this);
    const restY = this.y;
    this.alpha = 0;
    this.y = dropStartY;

    AnimationProxy.animateTween(this, {
      alpha: 1,
      y: restY,
      duration: 0.5,
      ease: 'power1.out',
      onComplete: () => {
        const particleSpine = this.elementsList['particleSpine'] as PixSpine;
        if (particleSpine?.configData.idle) {
          particleSpine.visible = true;
          particleSpine.playAnimation({ state: particleSpine.configData.idle, loop: true });
          EventHandler.dispatchEvent('TRANSITION_BACKGROUND', {
            to: this.popupData?.entryPopUp ? 'GREEN' : 'BG',
          });
        }
      },
    });
  }

  private animateElementsDropOut(onComplete?: () => void): void {
    const dropDistance = 700;

    const particleSpine = this.elementsList['particleSpine'] as PixSpine;
    if (particleSpine) {
      particleSpine.visible = false;
      particleSpine.stopAnimation();
    }

    AnimationProxy.killTweensOf(this);
    const restY = this.y;

    AnimationProxy.animateTween(this, {
      alpha: 0,
      y: restY + dropDistance,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        this.y = restY;
        this.alpha = 1;
        onComplete?.();
      },
    });
  }
}
