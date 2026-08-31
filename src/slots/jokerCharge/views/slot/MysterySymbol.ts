import { UIUtil } from '@core/utils/UIUtilService';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { PixText } from '@core/pixiwrapper/PixText';
import GridReelSymbol from './GridReelSymbol';
import MysteryRevealStrip from './MysteryRevealStrip';

const LABEL_TEXT_STYLE = {
  fontFamily: 'gameFont1',
  fontWeight: 700,
  fill: 0xffffff,
  stroke: 0x000000,
  strokeThickness: 4,
  fontSize: 32,
  align: 'center',
};

const STRIP_TEXT_STYLE = {
  fontFamily: 'gameFont1',
  fontWeight: 700,
  fill: 0xffed54,
  stroke: 0x000000,
  strokeThickness: 3,
  fontSize: 36,
};

export default class MysterySymbol extends GridReelSymbol {
  private readonly backAnim: PixSpine;
  private readonly frontAnim: PixSpine;
  private readonly labelText: PixText;
  private readonly revealStrip: MysteryRevealStrip;

  constructor(configData: any) {
    super(configData);

    this.backAnim = UIUtil.getSpineAnim(this.configData.data.backSpine ?? 'mystery_back', {
      spineName: this.configData.data.backSpine ?? 'mystery_back',
    });
    this.frontAnim = UIUtil.getSpineAnim(this.configData.data.frontSpine ?? 'mystery_front', {
      spineName: this.configData.data.frontSpine ?? 'mystery_front',
    });
    this.revealStrip = new MysteryRevealStrip(STRIP_TEXT_STYLE);
    this.labelText = UIUtil.getText({
      name: 'mysteryLabel',
      contentText: this.getLabel(),
      style: { ...LABEL_TEXT_STYLE },
    });
    this.labelText.anchor.set(0.5, 0.5);

    // Back -> spinning value strip -> front, so front's bezel/frame art sits on top.
    this.addChild(this.backAnim);
    this.addChild(this.revealStrip);
    this.addChild(this.labelText);
    this.addChild(this.frontAnim);

    this.showIdlePlaceholder();
  }

  private getLabel(): string {
    return this.configData.data.name === 'mystery jackpot' ? 'Mystery\nJackpot' : 'Mystery';
  }

  // Base-game resting state: static "Mystery"/"Mystery Jackpot" label, no spinning strip.
  public showIdlePlaceholder(): void {
    this.backAnim.playAnimation({ state: 'idle', loop: true });
    this.frontAnim.playAnimation({ state: 'idle', loop: true });
    this.labelText.visible = true;
    this.revealStrip.visible = false;
  }

  // Bonus-game reveal: label hidden, strip cycles through the possible outcomes for this symbol.
  public startReveal(candidates: string[]): void {
    this.labelText.visible = false;
    this.revealStrip.visible = true;
    this.backAnim.playAnimation({ state: 'spin', loop: true });
    this.frontAnim.playAnimation({ state: 'spin', loop: true });
    this.revealStrip.startSpin(candidates);
  }

  // Stops the strip on finalLabel, plays the win celebration, then the hide animation,
  // and calls onComplete - the caller (GridReel) is responsible for swapping in the actual
  // revealed symbol once this resolves.
  public stopReveal(finalLabel: string, onComplete?: () => void): void {
    this.revealStrip.stopAt(finalLabel, () => {
      this.playWinThenHide(onComplete);
    });
  }

  private playWinThenHide(onComplete?: () => void): void {
    const winListener = this.backAnim.addEventListener('complete', () => {
      this.backAnim.removeSpineEvent(winListener);
      this.playHide(onComplete);
    });
    this.backAnim.playAnimation({ state: 'win', loop: false });
    this.frontAnim.playAnimation({ state: 'win', loop: false });
  }

  private playHide(onComplete?: () => void): void {
    const hideListener = this.backAnim.addEventListener('complete', () => {
      this.backAnim.removeSpineEvent(hideListener);
      onComplete?.();
    });
    this.backAnim.playAnimation({ state: 'hide', loop: false });
    this.frontAnim.playAnimation({ state: 'hide', loop: false });
  }
}
