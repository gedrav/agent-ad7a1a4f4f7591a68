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
import { Texture } from 'pixi.js';
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
const WHEEL_PRIZE_ROW_GAP = 20;
const WHEEL_PRIZE_ROW_Y_OFFSETS: Record<string, number> = {
  wheelPrizeIconGreen: 43.5,
  wheelPrizeOr1: 35,
  wheelPrizeIconRed: 33.5,
  wheelPrizeText2: 35,
  wheelPrizeCashText: 28.5,
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
  private readonly playBtn: PixSprite;
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
          appModel.getNextSubFeatureType()?.toUpperCase() === FEATURE_NAMES.RED
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
        x += children[i - 1].width / 2 + gap + child.width / 2;
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

    this.titleText.visible = !data.hideFeatureAwardedTitle;
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
    if (this.messageText2) {
      this.messageText2.visible = true;
      this.messageText2.text = 'PRESS ► TO CONTINUE';
    }
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
    }
  }
  protected async showPFPopup(data: any) {
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
        }

        this.animateElementsDropIn();
      },
    });
  }

  private animateElementsDropIn(): void {
    const dropStartY = -600;
    const stagger = 0.15;

    const children = (this.children as any[])
      .filter(
        (child) =>
          child.visible !== false &&
          child.configData?.name !== 'guideRect' &&
          child.configData?.name !== 'particleSpine',
      )
      .reverse();

    children.forEach((child: any, index: number) => {
      AnimationProxy.killTweensOf(child);
      const restY = child.y;
      child.alpha = 0;
      child.y = dropStartY;
      AnimationProxy.animateTween(child, {
        alpha: 1,
        y: restY,
        duration: 0.3,
        delay: index * stagger,
        ease: 'bounce.out',
      });
    });
  }

  private animateElementsDropOut(onComplete?: () => void): void {
    const dropDistance = 700;
    const stagger = 0.2;

    const children = (this.children as any[])
      .filter(
        (child) =>
          child.visible !== false &&
          child.configData?.name !== 'guideRect' &&
          child.configData?.name !== 'particleSpine',
      )
      .reverse();

    if (children.length === 0) {
      onComplete?.();
      return;
    }

    const restPositions = children.map((child: any) => ({ child, y: child.y }));

    children.forEach((child: any, index: number) => {
      AnimationProxy.killTweensOf(child);
      const restY = restPositions[index].y;
      const isLast = index === children.length - 1;
      AnimationProxy.animateTween(child, {
        alpha: 0,
        y: restY + dropDistance,
        duration: 0.4,
        delay: index * stagger,
        ease: 'power2.in',
        onComplete: () => {
          if (!isLast) return;
          restPositions.forEach(({ child: c, y }) => {
            c.y = y;
            c.alpha = 1;
          });
          onComplete?.();
        },
      });
    });
  }
}
