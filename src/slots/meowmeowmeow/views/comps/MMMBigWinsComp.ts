import { BigWinsComp } from '@brand/views/comps/BigWinsComp';
import { PixText } from '@core/pixiwrapper/PixText';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { CONSTANTS } from '@core/utils/CONSTANTS';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';

export const SHOW_FEATURE_WIN_ANIM = 'SHOW_FEATURE_WIN_ANIM';

const FEATURE_WIN_COUNTUP_DURATION = 4000;

export class MMMBigWinsComp extends BigWinsComp {
  private readonly featureWinText: PixText;
  private featureWinCallback: (() => void) | null = null;

  constructor(config: any) {
    super(config);
    this.featureWinText = this.elementsList['featureWinText'];
    if (this.featureWinText) {
      this.featureWinText.visible = false;
    }
    EventHandler.addEventListener(SHOW_FEATURE_WIN_ANIM, this.showFeatureWin.bind(this));
  }

  protected showFeatureWin(data: { callback?: () => void }): void {
    this.featureWinCallback = data?.callback ?? null;
    this.currentLevel = 3;
    this.targetLevel = 4;
    this.currentState = CONSTANTS.EPIC_WIN;

    this.parent?.addChild(this);

    const bigWinText = this.elementsList['bigWinText'];
    if (bigWinText) {
      bigWinText.visible = false;
    }
    if (this.bigWinAnim) {
      if (this.configData.data.backgroundAlpha > 0) {
        this.guideRect.visible = true;
        this.guideRect.alpha = this.configData.data.backgroundAlpha;
      }
      this.bigWinAnim.visible = true;
      this.bigWinAnim.playAnimation({
        state: this.configData.data.animations[this.currentState].start,
        loop: false,
        defaultMix: 0,
      });
    }
    const winningTier: string = appModel.featureResult?.featureData?.winningTier ?? '';
    this.featureWinText.text = Util.getContent('FeatureWinCongratsText', [winningTier.slice(0, -1)]);
    this.featureWinText.visible = true;
    this.featureWinText.alpha = 1;
    this.addChild(this.featureWinText);

    this.showWinTickerType('bigwin');
    this.playCurrentBigWinSound();
    this.elementsList['winTickerBW'].countUpValue(appModel.featureResult?.totalWin, FEATURE_WIN_COUNTUP_DURATION);
  }

  protected notifyWinDone(): void {
    if (!this.featureWinCallback) {
      super.notifyWinDone();
      return;
    }

    const callback = this.featureWinCallback;
    this.featureWinCallback = null;

    EventHandler.dispatchEvent(SlotEvents.STOP_BIG_WIN_SOUND);
    EventHandler.dispatchEvent(SlotEvents.PLAY_BIG_WIN_TERMINATION_SOUND);
    this.clearSpinWin();
    if (this.featureWinText) {
      this.featureWinText.visible = false;
    }

    callback();
  }
}
