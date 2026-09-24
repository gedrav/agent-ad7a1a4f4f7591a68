import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { Text } from 'pixi.js';

export interface StoneFeature {
  pips: number;
  bankedValue: number | string;
  drawnValue: number | string;
}

export interface StoneStateData {
  multiStone?: StoneFeature;
  freespinsStone?: StoneFeature;
  mysteryStone?: StoneFeature;
  wildsStone?: StoneFeature;
  megawinStone?: StoneFeature;
}

export const BOX_STATE_KEYS: Record<string, { key: keyof StoneStateData; suffix: string; title: string }> = {
  box1: { key: 'multiStone', suffix: 'x', title: 'MULTI' },
  box2: { key: 'freespinsStone', suffix: '', title: 'FREE SPIN' },
  box3: { key: 'mysteryStone', suffix: 'x', title: 'MYSTERY' },
  box4: { key: 'wildsStone', suffix: '', title: 'WILD' },
  box5: { key: 'megawinStone', suffix: '', title: 'MEGA' },
};

export class GemBoxesComp extends ResponsiveChildrenView {
  private boxLabels: Record<string, { titleLabel: Text; valueLabel: Text }> = {};
  private currentBoxPipStates: Record<string, number> = {};

  private get labelStyle(): any {
    return this.configData?.labelStyle || {};
  }

  private getBox(boxName: string): any {
    return this.elementsList?.[boxName];
  }

  private initBoxLabel(boxName: string): void {
    const box = this.getBox(boxName);
    if (!box || this.boxLabels[boxName]) return;

    const titleLabel = new Text({
      text: BOX_STATE_KEYS[boxName]?.title ?? '',
      style: {
        fontFamily: this.labelStyle.title?.fontFamily,
        fontSize: this.labelStyle.title?.fontSizeAlone,
        fontWeight: this.labelStyle.title?.fontWeight,
        fill: this.labelStyle.title?.fill,
        stroke: this.labelStyle.title?.stroke,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: box.width || 220,
      },
    });
    titleLabel.anchor.set(0.5);

    const valueLabel = new Text({
      text: '',
      style: {
        fontFamily: this.labelStyle.value?.fontFamily || 'gameFont1',
        fontSize: this.labelStyle.value?.fontSize || 20,
        fontWeight: this.labelStyle.value?.fontWeight || 'normal',
        fill: this.labelStyle.value?.fill || 0xffffff,
        stroke: this.labelStyle.value?.stroke,
        align: 'center',
      },
    });
    valueLabel.anchor.set(0.5);

    if (typeof box.playAnimation === 'function') {
      titleLabel.position.set(0, this.labelStyle.title?.yAlone || 0);
      valueLabel.position.set(0, this.labelStyle.value?.y || 0);
    } else {
      titleLabel.position.set(box.width * 0.5, box.height * 0.55);
      valueLabel.position.set(box.width * 0.5, box.height * 0.8);
    }

    box.addChild(titleLabel);
    box.addChild(valueLabel);

    this.boxLabels[boxName] = { titleLabel, valueLabel };
  }

  private formatBoxValue(feature?: StoneFeature, suffix: string = ''): string {
    if (!feature) return '';
    const val = feature.bankedValue ?? feature.drawnValue;
    if (val !== undefined && val !== null && val !== 0 && val !== '0' && val !== '') {
      return `${val}${suffix}`;
    }
    return '';
  }

  private setBoxLabelText(boxName: string, feature?: StoneFeature, suffix: string = ''): void {
    this.initBoxLabel(boxName);
    const group = this.boxLabels[boxName];
    if (!group) return;

    const valStr = this.formatBoxValue(feature, suffix);
    group.valueLabel.text = valStr;

    const box = this.getBox(boxName);
    const isSpine = typeof box?.playAnimation === 'function';

    if (valStr !== '') {
      if (isSpine) {
        group.titleLabel.position.set(0, this.labelStyle.title?.yWithValue || 0);
        group.titleLabel.style.fontSize = this.labelStyle.title?.fontSizeWithValue || 24;
        group.valueLabel.position.set(0, this.labelStyle.value?.y || 0);
      } else {
        group.titleLabel.position.set(box.width * 0.5, box.height * 0.5);
        group.valueLabel.position.set(box.width * 0.5, box.height * 0.8);
      }
    } else if (isSpine) {
      group.titleLabel.position.set(0, this.labelStyle.title?.yAlone || 0);
      group.titleLabel.style.fontSize = this.labelStyle.title?.fontSizeAlone || 28;
    } else {
      group.titleLabel.position.set(box.width * 0.5, box.height * 0.65);
    }
  }

  private updateBoxSpineAnimation(boxName: string, feature?: StoneFeature, force: boolean = false): void {
    const box = this.getBox(boxName);
    if (!box || typeof box.playAnimation !== 'function') return;

    const pips = feature?.pips ?? 0;
    const clampedPips = Math.max(0, Math.min(5, pips));

    if (!force && this.currentBoxPipStates[boxName] === clampedPips) {
      return;
    }

    this.currentBoxPipStates[boxName] = clampedPips;
    box.playAnimation({ state: `Gem${clampedPips}`, loop: false });
  }

  public applyState(
    boxName: string,
    stoneState: StoneStateData | undefined,
    force: boolean = false,
    pipsOverride?: number,
  ): void {
    const entry = BOX_STATE_KEYS[boxName];
    if (!entry) return;
    const feature = stoneState?.[entry.key];
    this.setBoxLabelText(boxName, feature, entry.suffix);
    const spineFeature = pipsOverride !== undefined ? ({ ...feature, pips: pipsOverride } as StoneFeature) : feature;
    this.updateBoxSpineAnimation(boxName, spineFeature, force);
  }

  public applyAll(stoneState: StoneStateData | undefined, excludeBoxNames: Set<string> = new Set()): void {
    if (!stoneState) return;
    for (const boxName of Object.keys(BOX_STATE_KEYS)) {
      if (excludeBoxNames.has(boxName)) continue;
      this.applyState(boxName, stoneState);
    }
  }

  public playWin(boxName: string): void {
    const box = this.getBox(boxName);
    if (box && typeof box.playAnimation === 'function') {
      // Looped: the Win clip is short and would otherwise finish and sit static well before
      // pulseCartBox's hold window ends. Looping keeps it visibly animating until that hold
      // is over and the box is explicitly settled back to its resting Gem state.
      box.playAnimation({ state: 'Win', loop: true });
    }
  }
}
