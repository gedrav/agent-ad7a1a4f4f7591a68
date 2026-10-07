import { Container, Text } from 'pixi.js';
import ReelSymbolSpineExtended from '@core/views/slotmachine/ReelSymbolSpineExtended';
import { UIUtil } from '@core/utils/UIUtilService';

const SPINE_TEXT_SLOT = 'Txt_Value';

const STONE_TEXT_MAP: Record<string, string> = {
  SM: 'MULTI',
  SF: 'FREE SPIN\n',
  SY: 'MYSTERY',
  SW: 'WILD',
};

const STONE_ANGLE_MAP: Record<string, number> = {
  SM: -60, // MULTI
  SF: 0, // FREE SPIN
  SY: 0, // MYSTERY
  SW: 55, // WILD
};

export default class MDReelSymbol extends ReelSymbolSpineExtended {
  constructor(configData: any) {
    super(configData);
    this.updateStoneText();
  }

  public setNewSymbol(data: any, reelno: number): void {
    super.setNewSymbol(data, reelno);
    this.updateStoneText();
  }

  protected createExtraElements(): void {
    super.createExtraElements();
    this.updateStoneText();
  }

  private updateStoneText(): void {
    if (!this.spine?.addSlotObject) return;

    const symbolName = this.configData?.data?.name;
    const textContent = STONE_TEXT_MAP[symbolName];

    if (!textContent) {
      this.clearLabelHolder();
      return;
    }

    let existing: any;
    try {
      existing = this.spine.getSlotObject(SPINE_TEXT_SLOT);
    } catch (e) {
      return; // Slot doesn't exist
    }

    if (existing?.labelKey === textContent) {
      return;
    }

    if (existing) {
      this.clearLabelHolder();
    }

    const holder: any = new Container();
    holder.label = 'stoneTextHolder';
    holder.labelKey = textContent;

    let fillColors = ['0xFFFFFF', '0xCCCCCC'];
    if (symbolName === 'SM')
      fillColors = ['0xD2F09A', '0x3D9E27', '0x0A3A14']; // Green for Multi
    else if (symbolName === 'SF')
      fillColors = ['0xBFD9FF', '0x2A63D8', '0x081C5E']; // Blue for Free Spin
    else if (symbolName === 'SY')
      fillColors = ['0xF7A8DC', '0xB01F78', '0x3D0333']; // Pink/Purple for Mystery
    else if (symbolName === 'SW') fillColors = ['0xFF7A5E', '0xE62B18', '0xB0130B']; // Red for Wild

    let fontSize = 70;
    if (symbolName === 'SY')
      fontSize = 55; // Mystery is a longer word, needs to be much smaller to fit inside facets
    else if (symbolName === 'SF') fontSize = 60; // Free spin is two lines

    const config = {
      name: 'stoneText',
      type: 'Text',
      contentText: STONE_TEXT_MAP[symbolName] === 'FREE SPIN\n' ? 'FREE\nSPIN' : textContent,
      style: {
        fontFamily: 'gameFont1',
        fontSize: fontSize,
        fontWeight: '900',
        fill: fillColors,
        fillGradientStops: [0, 0.5, 1],
        stroke: {
          fill: ['0xFFD700', '0xE8890C'],
          width: 14,
          join: 'round',
        },
        dropShadow: {
          alpha: 0.95,
          angle: Math.PI / 2,
          blur: 1,
          color: '0x000000',
          distance: 5,
        },
        align: 'center',
        wordWrap: true,
        wordWrapWidth: 350,
      },
    };

    const label = UIUtil.getElement(config);
    label.anchor?.set(0.5);
    if (label.position) {
      label.position.set(0, 0);
    }
    if ('angle' in label) {
      label.angle = STONE_ANGLE_MAP[symbolName] || 0;
    }

    holder.addChild(label);
    try {
      this.addSlotObject(SPINE_TEXT_SLOT, holder, false);
    } catch (e) {
      // Ignore
    }
  }

  private clearLabelHolder(): void {
    if (!this.spine?.getSlotObject) return;
    try {
      const holder: any = this.spine.getSlotObject(SPINE_TEXT_SLOT);
      if (!holder) return;
      this.removeSlotObject(SPINE_TEXT_SLOT);
    } catch (e) {
      // Ignore
    }
  }
}
