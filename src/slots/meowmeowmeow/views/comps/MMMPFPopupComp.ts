import { PixText } from '@core/pixiwrapper/PixText';
import { PixView } from '@core/pixiwrapper/PixView';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { PickBonusJackpotComp } from './pickBonusJackpot';
import { PFPopupComp } from '@brand/views/popups/PickFeaturePopupComp';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SHOW_FEATURE_WIN_ANIM } from './MMMBigWinsComp';
import { Util } from '@core/utils/UtilService';
import { SlotEvents } from '@core/events/SlotEvents';
import { Texture } from 'pixi.js';

const OUTRO_FEATURE_ICON_BY_SUBTYPE: Record<string, string> = {
  RED: 'MEOW',
  GREEN: 'MII',
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
  wheelPrizeIconGreen: 10,
  wheelPrizeOr1: 20,
  wheelPrizeIconRed: 21,
  wheelPrizeText2: 15,
  wheelPrizeCashText: 10,
};

const RED_PRIZE_ROW_ORDER = ['redPrizeIconGrand', 'redPrizeIconMajor', 'redPrizeIconMinor', 'redPrizeIconMini'];
const RED_PRIZE_ROW_GAP = 20;
const RED_PRIZE_ROW_Y_OFFSETS: Record<string, number> = {};

const BLUE_OUTRO_LINE_GAP = 20;

export class MMMPFPopupComp extends PFPopupComp {
  private readonly congratText: PixText;
  private readonly wheelPrizeText1: PixText;
  private readonly wheelPrizeRow: PixView;
  private readonly redPrizeText1: PixText;
  private readonly redPrizeRow: PixView;
  private readonly blueOutroRow: PixView;
  private readonly blueOutroPrefixText: PixText;
  private readonly blueOutroAmountText: PixText;
  private readonly blueOutroFeatureIcon: PixSprite;

  constructor(config: any) {
    super(config);
    this.congratText = this.elementsList['congratText'];
    this.wheelPrizeText1 = this.elementsList['wheelPrizeText1'];
    this.wheelPrizeRow = this.elementsList['wheelPrizeRow'];
    this.redPrizeText1 = this.elementsList['redPrizeText1'];
    this.redPrizeRow = this.elementsList['redPrizeRow'];
    this.blueOutroRow = this.elementsList['blueOutroRow'];
    this.blueOutroPrefixText = this.blueOutroRow?.elementsList['blueOutroPrefixText'];
    this.blueOutroAmountText = this.blueOutroRow?.elementsList['blueOutroAmountText'];
    this.blueOutroFeatureIcon = this.blueOutroRow?.elementsList['blueOutroFeatureIcon'];
    this.layoutPrizeRow(this.wheelPrizeRow, WHEEL_PRIZE_ROW_ORDER, WHEEL_PRIZE_ROW_GAP, WHEEL_PRIZE_ROW_Y_OFFSETS);
    this.layoutPrizeRow(this.redPrizeRow, RED_PRIZE_ROW_ORDER, RED_PRIZE_ROW_GAP, RED_PRIZE_ROW_Y_OFFSETS);
    if (this.okBtn) {
      this.okBtn.visible = false;
    }
    const panelBG = this.elementsList['popupbg'];
    if (panelBG) {
      panelBG.interactive = true;
      panelBG.cursor = 'pointer';
      panelBG.on('pointerdown', this.onCloseClicked.bind(this));
    }
    this.interactive = true;
    this.cursor = 'pointer';
    this.on('pointerdown', this.onCloseClicked.bind(this));
  }

  protected override async onCloseClicked() {
    super.onCloseClicked();
    EventHandler.dispatchEvent('RESET_KITTIEBANK_ANIM');
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
    if (this.congratText) {
      this.congratText.visible = true;
      this.congratText.text = Util.getContent('CongratTitle');
    }
    this.titleText.text = Util.getContent('FeatureAwardedTitle');
    const featureSubType = appModel.getNextSubFeatureType()
      ? appModel.getNextSubFeatureType()
      : appModel.getFeatureSubType();
    const isBlueFeatureEntry = !!data.entryPopUp && featureSubType.toUpperCase() === 'BLUE';
    const isRedFeatureEntry = !!data.entryPopUp && featureSubType.toUpperCase() === 'RED';
    const isBlueFeatureExit = !data.entryPopUp && featureSubType.toUpperCase() === 'BLUE';
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
      this.blueOutroAmountText.text = Util.formatCurrency(appModel.getPickFeatureWinnings());
      this.layoutStackedCenter(this.blueOutroRow, ['blueOutroPrefixText', 'blueOutroAmountText'], BLUE_OUTRO_LINE_GAP);
      this.blueOutroPrefixText.y = 20;
    }
  }
  protected async showPFPopup(data: any) {
    const featureSubType = appModel.getFeatureSubType();
    if (!data.entryPopUp && featureSubType.toUpperCase() === 'RED') {
      EventHandler.dispatchEvent(SHOW_FEATURE_WIN_ANIM, { callback: data.callbackFunction });
      return;
    }
    EventHandler.dispatchEvent(SlotEvents.SHOW_MODAL_VIEW);
    this.parent?.addChild(this);

    super.showPFPopup(data);
    const scale = this.scale.x;
    const yy = this.y;
    const xx = this.x;

    const dropOffset = 550;
    this.y -= dropOffset;
    this.x = xx;

    const mewSpine = this.elementsList['mew'] as PixSpine;
    if (mewSpine?.configData.idle) {
      const featName = appModel.getNextSubFeatureType()
        ? appModel.getNextSubFeatureType()
        : appModel.getFeatureSubType();
      const animName = featName.toUpperCase() === 'RED' ? '3_RED_Ideal' : '2_BLUE_Ideal';
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
