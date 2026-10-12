import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { GameProxy } from '@core/models/GameConfigProxy';
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
  box2: { key: 'freespinsStone', suffix: '', title: 'FREESPIN' },
  box3: { key: 'mysteryStone', suffix: 'x', title: 'MYSTERY' },
  box4: { key: 'wildsStone', suffix: '', title: 'WILD' },
  box5: { key: 'megawinStone', suffix: '', title: 'MEGA' },
};

const BOX_LABEL_COLORS: Record<string, string> = {
  box1: '#24ff00', // MULTI
  box2: '#ffea00', // FREESPIN
  box3: '#d162ff', // MYSTERY
  box4: '#ff3c00', // WILD
  box5: '#ffaa00', // MEGA (Gold)
};
const DEFAULT_LABEL_COLOR = '#ffffff';
const LABEL_STROKE_COLOR = '#1a0b00';
const CART_CENTER_X = -4;

const CART_SYMBOL_TO_SKIN: Record<string, string> = {
  H1: 'Helmate',
  H2: 'Lantern',
  H3: 'Pickaxe',
  H4: 'Helmate',
  H5: 'Lantern',
  L1: 'A',
  L2: 'K',
  L3: 'Q',
  L4: 'J',
  L5: '10',
};

export class GemBoxesComp extends ResponsiveChildrenView {
  private boxLabels: Record<string, { titleLabel: Text; valueLabel: Text }> = {};
  private currentBoxPipStates: Record<string, number> = {};

  private get labelStyle(): any {
    return this.configData?.labelStyle || {};
  }

  private resolveFont(alias: string): string {
    return GameProxy.config.FontFaces?.[alias] || alias;
  }

  private xOffsetFor(boxName: string): number {
    return this.labelStyle.xOffsets?.[boxName] ?? this.labelStyle.xOffset ?? CART_CENTER_X;
  }

  private get titleY(): number {
    return this.labelStyle.title?.y ?? 0;
  }

  private get titleFontSize(): number {
    return this.labelStyle.title?.fontSize || 80;
  }

  private getBox(boxName: string): any {
    return this.elementsList?.[boxName];
  }

  private initBoxLabel(boxName: string): void {
    const box = this.getBox(boxName);
    if (!box || this.boxLabels[boxName]) return;

    const labelColor = BOX_LABEL_COLORS[boxName] || DEFAULT_LABEL_COLOR;

    const titleLabel = new Text({
      text: BOX_STATE_KEYS[boxName]?.title ?? '',
      style: {
        fontFamily: this.resolveFont(this.labelStyle.title?.fontFamily || 'gameFont1'),
        fontSize: this.titleFontSize,
        fontWeight: '900',
        fill: labelColor,
        stroke: { color: LABEL_STROKE_COLOR, width: 10, join: 'round' },
        dropShadow: {
          alpha: 0.95,
          angle: Math.PI / 2,
          blur: 1,
          color: '#000000',
          distance: 5,
        },
        align: 'center',
      },
    });
    titleLabel.anchor.set(0.5);

    const valueLabel = new Text({
      text: '',
      style: {
        fontFamily: this.resolveFont(this.labelStyle.value?.fontFamily || 'gameFont1'),
        fontSize: this.labelStyle.value?.fontSize || 50,
        fontWeight: '900',
        fill: labelColor,
        stroke: { color: LABEL_STROKE_COLOR, width: 8, join: 'round' },
        dropShadow: {
          alpha: 0.9,
          angle: Math.PI / 2,
          blur: 2,
          color: '#000000',
          distance: 4,
        },
        align: 'center',
      },
    });
    valueLabel.anchor.set(0.5);

    if (typeof box.playAnimation === 'function') {
      titleLabel.position.set(this.xOffsetFor(boxName), this.titleY);
      valueLabel.position.set(this.xOffsetFor(boxName), this.labelStyle.value?.y || 0);
    } else {
      titleLabel.position.set(box.width * 0.5 + this.xOffsetFor(boxName), box.height * 0.55);
      valueLabel.position.set(box.width * 0.5 + this.xOffsetFor(boxName), box.height * 0.8);
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
    const box = this.getBox(boxName);
    const isSpine = typeof box?.playAnimation === 'function';

    if (boxName === 'box5') {
      const rawVal = feature?.bankedValue ?? feature?.drawnValue;
      group.valueLabel.text = '';
      group.titleLabel.text = rawVal ? '' : BOX_STATE_KEYS[boxName].title;

      if (isSpine && typeof box.setSkin === 'function') {
        const skinName = rawVal ? CART_SYMBOL_TO_SKIN[String(rawVal)] || 'default' : 'default';
        box.setSkin(skinName);
      }
    } else {
      group.valueLabel.text = valStr;
    }

    if (isSpine) {
      group.titleLabel.position.set(this.xOffsetFor(boxName), this.titleY);
      group.valueLabel.position.set(this.xOffsetFor(boxName), this.labelStyle.value?.y || 0);
    } else {
      group.titleLabel.position.set(box.width * 0.5 + this.xOffsetFor(boxName), box.height * 0.55);
      group.valueLabel.position.set(box.width * 0.5 + this.xOffsetFor(boxName), box.height * 0.8);
    }
    group.titleLabel.style.fontSize = this.titleFontSize;
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
    box.playAnimation({ state: `Normal/Gem${clampedPips}`, loop: false });
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

  public playWin(boxName: string, onComplete?: () => void): void {
    const box = this.getBox(boxName);
    if (box && typeof box.playAnimation === 'function') {
      box.playAnimation({ state: 'Normal/Win', loop: false });
      setTimeout(() => {
        box.playAnimation({ state: 'Normal/Win', loop: false });
        if (onComplete) {
          setTimeout(onComplete, 1000);
        }
      }, 1000);
    } else if (onComplete) {
      onComplete();
    }
  }
}
