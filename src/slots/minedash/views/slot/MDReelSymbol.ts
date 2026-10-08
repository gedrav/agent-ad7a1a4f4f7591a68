import { Container } from 'pixi.js';
import ReelSymbolSpine from '@core/views/slotmachine/ReelSymbolSpine';
import { UIUtil } from '@core/utils/UIUtilService';
import { appModel } from '@core/models/services/AppModelService';
import { StoneFeature, StoneStateData } from '@game/views/comps/GemBoxesComp';

const SPINE_TEXT_SLOT = 'Txt_Value';

const STONE_STATE_KEY_MAP: Record<string, keyof StoneStateData> = {
  SM: 'multiStone',
  SF: 'freespinsStone',
  SY: 'mysteryStone',
  SW: 'wildsStone',
};

const STONE_SUFFIX_MAP: Record<string, string> = {
  SM: 'x',
  SF: '',
  SY: 'x',
  SW: '',
};

export default class MDReelSymbol extends ReelSymbolSpine {
  private readonly slotObjects: Map<string, Container> = new Map();

  constructor(configData: any) {
    super(configData);
    this.updateStoneText();
  }

  public addSlotObject(slotName: string, container: Container, followAttachmentTimeline = false): void {
    if (!this.spine) return;
    this.removeSlotObject(slotName);
    this.spine.addSlotObject(slotName, container, { followAttachmentTimeline });
    this.slotObjects.set(slotName, container);
  }

  public removeSlotObject(slotName: string): void {
    const container = this.slotObjects.get(slotName);
    if (!container) return;
    this.spine?.removeSlotObject(slotName);
    container.destroy();
    this.slotObjects.delete(slotName);
  }

  public getSlotObject(slotName: string): Container | undefined {
    return this.slotObjects.get(slotName);
  }

  protected destroySpine(): void {
    for (const slotName of Array.from(this.slotObjects.keys())) {
      this.removeSlotObject(slotName);
    }
    super.destroySpine();
  }

  public setNewSymbol(data: any, reelno: number): void {
    super.setNewSymbol(data, reelno);
    this.updateStoneText();
  }

  protected createExtraElements(): void {
    super.createExtraElements();
    this.updateStoneText();
  }

  private getStoneValueText(symbolName: string): string {
    const stateKey = STONE_STATE_KEY_MAP[symbolName];
    if (!stateKey) return '';

    const res = (appModel as any).gameResult;
    const stoneState: StoneStateData | undefined =
      res?.progressData?.stoneState || res?.stoneState || appModel.gameData?.progressData?.stoneState;

    const feature: StoneFeature | undefined = stoneState?.[stateKey];
    if (!feature) return '';

    const val = feature.bankedValue ?? feature.drawnValue;
    if (val === undefined || val === null || val === 0 || val === '0' || val === '') return '';

    return `${val}${STONE_SUFFIX_MAP[symbolName] || ''}`;
  }

  private updateStoneText(): void {
    if (!this.spine?.addSlotObject) return;

    const symbolName = this.configData?.data?.name;
    const textContent = this.getStoneValueText(symbolName);

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

    const fillColors = ['0xFFFFFF', '0xFFE9A8', '0xFFFFFF'];
    const fontSize = 90;

    const config = {
      name: 'stoneText',
      type: 'Text',
      contentText: textContent,
      style: {
        fontFamily: 'gameFont1',
        fontSize: fontSize,
        fontWeight: '900',
        fill: fillColors,
        fillGradientStops: [0, 0.5, 1],
        stroke: {
          fill: '0x1A0B00',
          width: 12,
          join: 'round',
        },
        dropShadow: {
          alpha: 0.9,
          angle: Math.PI / 2,
          blur: 4,
          color: '0x000000',
          distance: 6,
        },
        align: 'center',
      },
    };

    const label = UIUtil.getElement(config);
    label.anchor?.set(0.5);
    if (label.position) {
      label.position.set(0, 0);
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
