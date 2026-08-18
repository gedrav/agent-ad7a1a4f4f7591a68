import { BigWinsComp } from '@brand/views/comps/BigWinsComp';
import { PixText } from '@core/pixiwrapper/PixText';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { CONSTANTS } from '@core/utils/CONSTANTS';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { FillGradient } from 'pixi.js';

function buildFillGradient(colors: number[], offsets: number[] = []): FillGradient {
  const colorStops = colors.map((color, i) => ({
    offset: offsets[i] ?? i / Math.max(colors.length - 1, 1),
    color,
  }));

  return new FillGradient({
    type: 'linear',
    textureSpace: 'local',
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
    colorStops,
  });
}

const FEATURE_WIN_COUNTUP_DURATION = 4000;
const FEATURE_WIN_EXIT_PAUSE_MS = 500;
const FEATURE_WIN_EXIT_FADE_DURATION = 0.5;

const TIER_TEXT_FILL: Record<string, number[]> = {
  grand: [0xffe3e3, 0xff5252, 0xe00000, 0x8e0000],
  major: [0xfcdff9, 0xf151f9, 0xeb20fa, 0xcc00cf, 0x6e0047],
  minor: [0xe0ffff, 0x66d9ff, 0x1e90ff, 0x0047ab],
  mini: [0xe8ffe0, 0x7ed957, 0x2fa84f, 0x145a32],
};

export class MMMBigWinsComp extends BigWinsComp {
  private readonly featureWinText: PixText;
  private featureWinCallback: (() => void) | null = null;
  private isFeatureWinActive: boolean = false;
  private guideRectBounds: { x: number; y: number; width: number; height: number } | null = null;

  constructor(config: any) {
    super(config);
    this.featureWinText = this.elementsList['featureWinText'];
    if (this.featureWinText) {
      this.featureWinText.visible = false;
    }
    EventHandler.addEventListener('SHOW_FEATURE_WIN_ANIM', this.showFeatureWin.bind(this));
    EventHandler.addEventListener(SlotEvents.START_SPIN, this.clearSpinWin.bind(this));
  }

  protected override playCurrentBigWinSound(): void {
    if (this.isFeatureWinActive) {
      const winningTier: string = appModel.featureResult?.featureData?.winningTier ?? '';
      const tierName = winningTier.replace(/\d+$/, '').toLowerCase();

      switch (tierName) {
        case 'grand':
          EventHandler.dispatchEvent(SlotEvents.STOP_BIG_WIN_SOUND);
          EventHandler.dispatchEvent('PLAY_GRAND_JACKPOT_WIN_SOUND');
          return;
        case 'major':
          EventHandler.dispatchEvent(SlotEvents.STOP_BIG_WIN_SOUND);
          EventHandler.dispatchEvent('PLAY_MAJOR_JACKPOT_WIN_SOUND');
          return;
        case 'minor':
          EventHandler.dispatchEvent(SlotEvents.STOP_BIG_WIN_SOUND);
          EventHandler.dispatchEvent('PLAY_MINOR_JACKPOT_WIN_SOUND');
          return;
        case 'mini':
          EventHandler.dispatchEvent(SlotEvents.STOP_BIG_WIN_SOUND);
          EventHandler.dispatchEvent('PLAY_MINI_JACKPOT_WIN_SOUND');
          return;
      }
    }
    super.playCurrentBigWinSound();
  }

  protected showFeatureWin(data: { callback?: () => void }): void {
    this.featureWinCallback = data?.callback ?? null;
    this.isFeatureWinActive = true;
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
        this.expandGuideRectToScreen();
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
    const tierName = winningTier.slice(0, -1);
    this.featureWinText.text = Util.getContent('FeatureWinCongratsText', [tierName]);
    const tierFill = TIER_TEXT_FILL[tierName.toLowerCase()];
    if (tierFill) {
      this.featureWinText.style.fill = buildFillGradient(tierFill);
    }
    this.featureWinText.visible = true;
    this.featureWinText.alpha = 1;
    this.addChild(this.featureWinText);

    this.showWinTickerType('bigwin');
    this.playCurrentBigWinSound();
    this.elementsList['winTickerBW'].countUpValue(
      appModel.featureResult?.featureData?.jackpotWin,
      FEATURE_WIN_COUNTUP_DURATION,
    );
    EventHandler.dispatchEvent(SlotEvents.SHOW_REELTICKER_WIN, {
      value: appModel.featureResult?.totalWin,
      duration: 0,
    });
    EventHandler.dispatchEvent('TRANSITION_BACKGROUND', { to: 'BG' });
  }

  // The configured guideRect only spans the board area. For a feature win the dim needs to reach the
  // screen edges, so it is stretched to the game bounds mapped into this comp's own space.
  private expandGuideRectToScreen(): void {
    if (!this.guideRect) return;

    if (!this.guideRectBounds) {
      this.guideRectBounds = {
        x: this.guideRect.x,
        y: this.guideRect.y,
        width: this.guideRect.width,
        height: this.guideRect.height,
      };
    }

    const topLeft = this.toLocal({ x: 0, y: 0 });
    const bottomRight = this.toLocal({ x: DeviceProxy.config.gameWidth, y: DeviceProxy.config.gameHeight });

    this.guideRect.x = topLeft.x;
    this.guideRect.y = topLeft.y;
    this.guideRect.width = bottomRight.x - topLeft.x;
    this.guideRect.height = bottomRight.y - topLeft.y;
  }

  // Put the board-sized bounds back, since the comp's layout scale and the win ticker clamp are both
  // measured off guideRect.
  private restoreGuideRectBounds(): void {
    if (!this.guideRect || !this.guideRectBounds) return;

    this.guideRect.x = this.guideRectBounds.x;
    this.guideRect.y = this.guideRectBounds.y;
    this.guideRect.width = this.guideRectBounds.width;
    this.guideRect.height = this.guideRectBounds.height;
  }

  protected override onSkipClicked(): void {
    if (this.isFeatureWinActive) return;
    super.onSkipClicked();
  }

  public override clearSpinWin() {
    this.isFeatureWinActive = false;
    super.clearSpinWin();
    this.restoreGuideRectBounds();
    if (this.featureWinText) {
      this.featureWinText.visible = false;
      this.featureWinText.alpha = 1;
    }
    if (this.bigWinAnim) {
      this.bigWinAnim.stopAnimation();
      this.bigWinAnim.visible = false;
    }
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

    setTimeout(() => {
      const fadeTargets = [this.bigWinAnim, this.featureWinText].filter(Boolean);
      AnimationProxy.animateTween(fadeTargets, {
        alpha: 0,
        duration: FEATURE_WIN_EXIT_FADE_DURATION,
        onComplete: () => {
          this.isFeatureWinActive = false;
          this.clearSpinWin();
          if (this.featureWinText) {
            this.featureWinText.visible = false;
            this.featureWinText.alpha = 1;
          }
          if (this.bigWinAnim) {
            this.bigWinAnim.alpha = 1;
          }
          callback();
        },
      });
    }, FEATURE_WIN_EXIT_PAUSE_MS);
  }
}
