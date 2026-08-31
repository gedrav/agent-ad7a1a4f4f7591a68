import { UIUtil } from '@core/utils/UIUtilService';
import { PixText } from '@core/pixiwrapper/PixText';
import GridReelSymbol from './GridReelSymbol';

const MAX_MULTIPLIER = 5;
const NORMAL_SKIN = 'gold';
const MAX_SKIN = 'blue';

const NORMAL_TEXT_STYLE = {
  fontFamily: 'gameFont1',
  fontWeight: 700,
  fill: 0xffffff,
  stroke: 0x000000,
  strokeThickness: 4,
  fontSize: 48,
};

const MAX_TEXT_STYLE = {
  fontFamily: 'gameFont1',
  fontWeight: 700,
  fill: [0xffed54, 0xf5a100],
  stroke: 0x000000,
  strokeThickness: 4,
  fontSize: 54,
};

export default class BonusSymbol extends GridReelSymbol {
  private multiplierText: PixText;

  constructor(configData: any) {
    super(configData);
    this.updateMultiplierText();
  }

  public setNewSymbol(data: any, reelno: number): void {
    super.setNewSymbol(data, reelno);
    if (!this.isSticky()) {
      this.updateMultiplierText();
    }
  }

  public getMultiplier(): number {
    const data = this.configData.data;
    if (data?.multiplier != undefined) {
      return data.multiplier;
    }
    const match = /cor-(\d)x/i.exec(data?.name ?? '');
    return match ? parseInt(match[1], 10) : 1;
  }

  public isMaxMultiplier(): boolean {
    return this.getMultiplier() >= MAX_MULTIPLIER;
  }

  private updateMultiplierText(): void {
    const multiplier = this.getMultiplier();
    const isMax = this.isMaxMultiplier();

    // bonus_sym has a 'gold' skin for 1x-4x and a 'blue' skin for the max (5x) value -
    // playSpineAnimation() re-applies configData.data.skin on every animation call, so
    // updating it here is enough for the next idle/landing/win to pick it up.
    this.configData.data.skin = isMax ? MAX_SKIN : NORMAL_SKIN;

    const style = isMax ? MAX_TEXT_STYLE : NORMAL_TEXT_STYLE;
    if (this.multiplierText) {
      this.removeChild(this.multiplierText);
      this.multiplierText.destroy();
    }
    this.multiplierText = UIUtil.getText({
      name: 'multiplierText',
      contentText: `${multiplier}X`,
      style: { ...style },
    });
    this.multiplierText.anchor.set(0.5, 0.5);
    // TODO: placeholder offset - adjust once the bonus_sym art's text placement is confirmed.
    this.multiplierText.y = -80;
    this.addChild(this.multiplierText);
  }
}
