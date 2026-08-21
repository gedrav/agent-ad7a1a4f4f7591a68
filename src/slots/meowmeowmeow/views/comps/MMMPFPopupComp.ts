import { PixText } from '@core/pixiwrapper/PixText';
import { PixView } from '@core/pixiwrapper/PixView';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { PFPopupComp } from '@brand/views/popups/PickFeaturePopupComp';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { Util } from '@core/utils/UtilService';
import { SlotEvents } from '@core/events/SlotEvents';
import { isMobile, Texture } from 'pixi.js';
import { FEATURE_NAMES, FeatureName } from '@slots/meowmeowmeow/config/FeatureNames';

const OUTRO_FEATURE_ICON_BY_SUBTYPE: Record<string, string> = {
  [FEATURE_NAMES.RED]: 'MEOW',
  [FEATURE_NAMES.GREEN]: 'MII',
};
const WHEEL_PRIZE_ROW_ORDER = [
  'wheelPrizeIconGreen',
  'wheelPrizeOr1',
  'wheelPrizeIconRed',
  'wheelPrizeText2',
  'wheelPrizeCashText',
];
const WHEEL_PRIZE_ROW_GAP = 40;
const WHEEL_PRIZE_ROW_Y_OFFSETS: Record<string, number> = {
  wheelPrizeIconGreen: 0,
  wheelPrizeOr1: 15,
  wheelPrizeIconRed: 7,
  wheelPrizeText2: 15,
  wheelPrizeCashText: 12,
};

const RED_PRIZE_ROW_ORDER = ['redPrizeIconGrand', 'redPrizeIconMajor', 'redPrizeIconMinor', 'redPrizeIconMini'];
const RED_PRIZE_ROW_GAP = 20;
const RED_PRIZE_ROW_Y_OFFSETS: Record<string, number> = {};

const BLUE_OUTRO_LINE_GAP = 20;

export class MMMPFPopupComp extends PFPopupComp {
  private readonly wheelPrizeText1: PixText;
  private readonly wheelPrizeRow: PixView;
  private readonly redPrizeText1: PixText;
  private readonly redPrizeRow: PixView;
  private readonly blueOutroRow: PixView;
  private readonly blueOutroPrefixText: PixText;
  private readonly blueOutroAmountText: PixText;
  private readonly blueOutroFeatureIcon: PixSprite;
  private readonly playBtn: PixView;
  private popupData: any;
  private isClosing = false;

  constructor(config: any) {
    super(config);
    this.wheelPrizeText1 = this.elementsList['wheelPrizeText1'];
    this.wheelPrizeRow = this.elementsList['wheelPrizeRow'];
    this.redPrizeText1 = this.elementsList['redPrizeText1'];
    this.redPrizeRow = this.elementsList['redPrizeRow'];
    this.blueOutroRow = this.elementsList['blueOutroRow'];
    this.blueOutroPrefixText = this.blueOutroRow?.elementsList['blueOutroPrefixText'];
    this.blueOutroAmountText = this.blueOutroRow?.elementsList['blueOutroAmountText'];
    this.blueOutroFeatureIcon = this.blueOutroRow?.elementsList['blueOutroFeatureIcon'];
    this.playBtn = this.elementsList['playBtn'];
    this.layoutPrizeRow(this.wheelPrizeRow, WHEEL_PRIZE_ROW_ORDER, WHEEL_PRIZE_ROW_GAP, WHEEL_PRIZE_ROW_Y_OFFSETS);
    this.layoutPrizeRow(this.redPrizeRow, RED_PRIZE_ROW_ORDER, RED_PRIZE_ROW_GAP, RED_PRIZE_ROW_Y_OFFSETS);
    if (this.okBtn) {
      this.okBtn.visible = false;
    }
    if (this.playBtn) {
      this.playBtn.interactive = true;
      this.playBtn.cursor = 'pointer';
      this.playBtn.on('pointerdown', this.onCloseClicked.bind(this));
    }
  }

  protected override async onCloseClicked() {
    if (this.isClosing) return;
    this.isClosing = true;

    this.animateElementsDropOut(() => {
      this.isClosing = false;
      super.onCloseClicked();
      if (this.popupData?.entryPopUp) {
        const featureName = appModel.getNextSubFeatureType()
          ? appModel.getNextSubFeatureType()
          : appModel.getFeatureSubType();
        EventHandler.dispatchEvent('SET_KITTIBANK_FEATURE_STATE', featureName.toUpperCase() as FeatureName);
        if (
          appModel.getFeatureSubType().toUpperCase() === FEATURE_NAMES.BLUE &&
          (appModel.getNextSubFeatureType()?.toUpperCase() === FEATURE_NAMES.RED ||
            appModel.getNextSubFeatureType()?.toUpperCase() === FEATURE_NAMES.GREEN)
        ) {
          EventHandler.dispatchEvent('HIDE_WHEEL_FEATURE_UI');
        }
      } else {
        EventHandler.dispatchEvent('RESET_BG_UI');
      }
    });
  }

  private layoutPrizeRow(row: PixView, order: string[], gap: number, yOffsets: Record<string, number>): void {
    const children = order.map((name) => row.elementsList[name]);
    let x = 0;
    children.forEach((child, i) => {
      child.y = yOffsets[order[i]] ?? 0;
      if (i > 0) {
        const prev = children[i - 1];
        const prevAnchorX = prev.anchor?.x ?? 0.5;
        const anchorX = child.anchor?.x ?? 0.5;
        x += prev.width * (1 - prevAnchorX) + gap + child.width * anchorX;
      }
      child.x = x;
    });
  }

  private layoutStackedCenter(row: PixView, order: string[], gap: number): void {
    const children = order.map((name) => row.elementsList[name]);
    let y = 0;
    children.forEach((child, i) => {
      child.x = 0;
      if (i > 0) {
        y += children[i - 1].height / 2 + gap + child.height / 2;
      }
      child.y = y;
    });
  }

  protected override updateMessagePositions(data: any) {
    super.updateMessagePositions(data);
    this.messageText1.y = 1040;

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

    this.titleText.visible = !!data.entryPopUp && !data.hideFeatureAwardedTitle;
    this.titleText.text = Util.getContent('FeatureAwardedTitle');
    const featureSubType = appModel.getNextSubFeatureType()
      ? appModel.getNextSubFeatureType()
      : appModel.getFeatureSubType();
    const isBlueFeatureEntry = !!data.entryPopUp && featureSubType.toUpperCase() === FEATURE_NAMES.BLUE;
    const isRedFeatureEntry = !!data.entryPopUp && featureSubType.toUpperCase() === FEATURE_NAMES.RED;
    const isBlueFeatureExit = !data.entryPopUp && featureSubType.toUpperCase() === FEATURE_NAMES.BLUE;
    this.showBlueFeatureEntryContent(isBlueFeatureEntry);
    this.showRedFeatureEntryContent(isRedFeatureEntry);
    this.showBlueFeatureExitContent(isBlueFeatureExit);
    this.messageText1.visible = !isBlueFeatureEntry && !isRedFeatureEntry && !isBlueFeatureExit;
    // if (this.messageText2) {
    //   this.messageText2.visible = true;
    //   this.messageText2.text = Util.getContent('pressToContinue');
    // }
  }

  private showBlueFeatureEntryContent(isBlueFeatureEntry: boolean): void {
    this.wheelPrizeText1.visible = isBlueFeatureEntry;
    this.wheelPrizeRow.visible = isBlueFeatureEntry;
  }

  private showRedFeatureEntryContent(isRedFeatureEntry: boolean): void {
    this.redPrizeText1.visible = isRedFeatureEntry;
    this.redPrizeRow.visible = isRedFeatureEntry;
  }

  private showBlueFeatureExitContent(isBlueFeatureExit: boolean): void {
    this.blueOutroRow.visible = isBlueFeatureExit;
    if (!isBlueFeatureExit) return;

    const nextSubFeature = appModel.getNextSubFeatureType()?.toUpperCase();
    const featureIconImage = nextSubFeature && OUTRO_FEATURE_ICON_BY_SUBTYPE[nextSubFeature];

    if (featureIconImage) {
      this.blueOutroAmountText.visible = false;
      this.blueOutroFeatureIcon.visible = true;
      this.blueOutroFeatureIcon.texture = Texture.from(featureIconImage);
      this.layoutStackedCenter(this.blueOutroRow, ['blueOutroPrefixText', 'blueOutroFeatureIcon'], BLUE_OUTRO_LINE_GAP);
      this.blueOutroPrefixText.y = -40;
      this.blueOutroFeatureIcon.y = 100;
    } else {
      this.blueOutroFeatureIcon.visible = false;
      this.blueOutroAmountText.visible = true;
      const amountText = Util.formatCurrency(appModel.getPickFeatureWinnings());
      this.blueOutroAmountText.text = amountText.charAt(0) + ' ' + amountText.slice(1);
      this.layoutStackedCenter(this.blueOutroRow, ['blueOutroPrefixText', 'blueOutroAmountText'], BLUE_OUTRO_LINE_GAP);
      this.blueOutroPrefixText.y = 20;
      this.blueOutroAmountText.x = -72;
      this.blueOutroAmountText.y = 245;
    }
  }
  protected async showPFPopup(data: any) {
    EventHandler.dispatchEvent('HIDE_KITTIBANK');
    EventHandler.dispatchEvent('TRANSITION', {
      show: false,
      callback: () => {
        this.popupData = data;
        const featureSubType = appModel.getFeatureSubType();
        if (!data.entryPopUp && featureSubType.toUpperCase() === FEATURE_NAMES.RED) {
          data.callbackFunction();
          EventHandler.dispatchEvent('RESET_BG_UI');
          return;
        }
        if (!data.skipModalDim) {
          EventHandler.dispatchEvent(SlotEvents.SHOW_MODAL_VIEW);
        }
        this.parent?.addChild(this);

        super.showPFPopup(data);
        (this as any).resizeView?.();

        const mewSpine = this.elementsList['mew'] as PixSpine;
        if (mewSpine?.configData.idle) {
          let featName = appModel.getNextSubFeatureType()
            ? appModel.getNextSubFeatureType()
            : appModel.getFeatureSubType();
          if (!data.entryPopUp && appModel.getFeatureSubType().toUpperCase() === FEATURE_NAMES.BLUE) {
            featName = FEATURE_NAMES.BLUE;
          }
          const animName = featName.toUpperCase() === FEATURE_NAMES.RED ? '3_RED_Ideal' : '2_BLUE_Ideal';
          mewSpine.playAnimation({ state: animName, loop: true });
          if (animName === '2_BLUE_Ideal' && isMobile) {
            mewSpine.scale.set(0.6);
          } else {
            mewSpine.scale.set(0.5);
          }
        }

        this.animateElementsDropIn();
      },
    });
  }

  private animateElementsDropIn(): void {
    const particleSpine = this.elementsList['particleSpine'] as PixSpine;
    // if (particleSpine) {
    //   particleSpine.visible = false;
    // }
    // particleSpine.playAnimation({ state: particleSpine.configData.idle, loop: true });

    this.alpha = 0;
    AnimationProxy.killTweensOf(this);

    AnimationProxy.animateTween(this, {
      alpha: 1,
      duration: 1,
      ease: 'sine.out',
      onComplete: () => {
        if (particleSpine?.configData.idle) {
          particleSpine.visible = true;
          if (this.popupData.entryPopUp) {
            const featName = appModel.getNextSubFeatureType()
              ? appModel.getNextSubFeatureType()
              : appModel.getFeatureSubType();
            EventHandler.dispatchEvent('TRANSITION_BACKGROUND', {
              to: featName.toUpperCase() ? featName.toUpperCase() : 'BG',
            });
          } else {
            EventHandler.dispatchEvent('TRANSITION_BACKGROUND', { to: 'BG' });
          }
        }
      },
    });
  }

  private animateElementsDropOut(onComplete?: () => void): void {
    const particleSpine = this.elementsList['particleSpine'] as PixSpine;
    if (particleSpine) {
      particleSpine.visible = false;
    }

    AnimationProxy.killTweensOf(this);

    AnimationProxy.animateTween(this, {
      alpha: 0,
      duration: 1,
      ease: 'sine.out',
      onComplete: () => {
        this.alpha = 1;
        onComplete?.();
      },
    });
  }
}
