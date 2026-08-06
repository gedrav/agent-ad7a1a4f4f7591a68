import { BigWinsComp } from '@brand/views/comps/BigWinsComp';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { UIUtil } from '@core/utils/UIUtilService';
import { CONSTANTS } from '@core/utils/CONSTANTS';

const STATES: string[] = [CONSTANTS.BIG_WIN, CONSTANTS.SUPER_WIN, CONSTANTS.MEGA_WIN, CONSTANTS.EPIC_WIN];

export class CTBigWinsComp extends BigWinsComp {
  private readonly bigWinAnimsByState: { [key: string]: PixSpine } = {};

  async onSecondaryAssetsLoaded() {
    await super.onSecondaryAssetsLoaded();
    const configs = this.configData.data.bigWinAnims;
    if (!configs) return;

    for (const state in configs) {
      const spine: PixSpine = UIUtil.getElement(configs[state]);
      spine.stopAnimation();
      spine.visible = false;
      spine.addEventListener('complete', this.onAnimComplete.bind(this));
      this.bigWinAnimsByState[state] = spine;
      this.addChild(spine);
    }
    this.bigWinAnim = this.bigWinAnimsByState[CONSTANTS.BIG_WIN];

    // re-assert z-order so the ticker/text/skip-rect stay above the win spines
    const winTickerBW = this.elementsList['winTickerBW'];
    const bigWinText = this.elementsList['bigWinText'];
    const skipRect = this.elementsList['skipRect'];
    if (this.winTicker) this.addChild(this.winTicker);
    if (winTickerBW) this.addChild(winTickerBW);
    if (bigWinText) this.addChild(bigWinText);
    if (skipRect) this.addChild(skipRect);
  }

  private activateBigWinAnim(state: string): void {
    const next = this.bigWinAnimsByState[state];
    if (!next || next === this.bigWinAnim) return;
    this.bigWinAnim?.stopAnimation();
    if (this.bigWinAnim) this.bigWinAnim.visible = false;
    next.visible = true;
    this.bigWinAnim = next;
  }

  protected playNextWinAnimation(): void {
    this.activateBigWinAnim(this.currentState);
    super.playNextWinAnimation();
  }

  protected onSkipClicked(): void {
    if (this.targetLevel > 0) {
      this.activateBigWinAnim(STATES[this.targetLevel - 1]);
    }
    super.onSkipClicked();
  }
  public override resizeView(): void {
    super.resizeView();
  }
}
