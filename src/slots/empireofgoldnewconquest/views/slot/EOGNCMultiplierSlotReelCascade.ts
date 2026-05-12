import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import CascadeReelSymbol from '@brand/views/slot/CascadeReelSymbol';
import MultiplierSlotReelCascade from '@brand/views/slotmachine/MultiplierSlotReelCascade';
import { StateManager } from '@core/states/StateManagerService';
import { appModel } from '@core/models/services/AppModelService';
import { CharacterController } from '../comps/CharacterController';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { UIUtil } from '@core/utils/UIUtilService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { Util } from '@core/utils/UtilService';
import EOGNCCascadeReelSymbol from './EOGNCCascadeReelSymbol';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';

type ChangedPosition = [column: number, row: number];

const lStats = { x: 1614, y: 694, scale: 0 };
const pStats = { x: 1110, y: -178, scale: 0 };
const FIREBALL_TRAVEL_DURATION = 1;

export default class EOGNCMultiplierSlotReelCascade extends MultiplierSlotReelCascade {
  private newSymAppearanceCompleteCount = 0;
  private totalSymbolsToConvert = 0;
  private targetSymbolData: any = null;
  private fireballSpines: PixSpine[] = [];
  private fireballArrivedCount = 0;

  constructor(configData: any) {
    super(configData);
    EventHandler.addEventListener(SlotEvents.INITIATE_SYMBOL_CONVERSION, this.setupForSymbolConversion.bind(this));
  }

  protected setupForSymbolConversion() {
    this.clearFireballSpines();
    const result = appModel.getReelModifiersData();
    const selectedHigh = result?.selectedHigh;
    this.targetSymbolData = selectedHigh ? this.reelsData.symbolsData[selectedHigh] : null;
    const changedPositions: ChangedPosition[] = result?.changedPositions ?? [];
    if (!changedPositions.length || !this.targetSymbolData) {
      this.allSymbolsConverted();
      return;
    }
    this.fireballArrivedCount = 0;
    this.newSymAppearanceCompleteCount = 0;
    this.totalSymbolsToConvert = changedPositions.length;
    const totalFireballs = changedPositions.length;

    for (const [column, row] of changedPositions) {
      const symbol = this.symbolsArray?.[column]?.[row] as EOGNCCascadeReelSymbol;
      if (!symbol) continue;

      const spine = UIUtil.getSpineAnim('Fire_ball_FX', { spineName: 'Fire_ball_FX' });
      const pos = this.toLocal(symbol.getGlobalPosition());
      if (DeviceProxy.config.isPortrait) {
        spine.x = pStats.x;
        spine.y = pStats.y;
        spine.scale.set(pStats.scale);
      } else {
        spine.x = lStats.x;
        spine.y = lStats.y;
        spine.scale.set(lStats.scale);
      }
      spine.rotation = Math.PI / 2;
      spine.playAnimation({ state: 'Fire_ball', loop: true });
      this.addChild(spine);
      this.fireballSpines.push(spine);

      AnimationProxy.animateTween(spine, {
        x: pos.x,
        y: pos.y,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        duration: FIREBALL_TRAVEL_DURATION,
        ease: 'power2.in',
        onInterrupt: this.onFireballArrived.bind(this, totalFireballs),
        onComplete: this.onFireballArrived.bind(this, totalFireballs),
      });
    }
  }

  private async onFireballArrived(totalFireballs: number): Promise<void> {
    this.fireballArrivedCount++;
    if (this.fireballArrivedCount === totalFireballs) {
      await Util.addDelays(150);
      this.onAllFireballsArrived();
    }
  }

  private async onAllFireballsArrived() {
    for (const spine of this.fireballSpines) {
      spine.addEventListener('complete', (entry: any) => {
        const animName = entry?.animation?.name;
        if (animName === 'Blast') {
          spine.playAnimation({ state: 'Appear', loop: false });
          this.makeSymbolsAppear();
        } else if (animName === 'Appear') {
          this.onNewSymbolAppeared();
        }
      });
      this.makeSymbolsDisappear();
      spine.playAnimation({ state: 'Blast', loop: false });
    }
  }

  private makeSymbolsDisappear() {
    const result = appModel.getReelModifiersData();
    const changedPositions: ChangedPosition[] = result?.changedPositions ?? [];
    if (!changedPositions.length) return;

    for (let i = 0; i < changedPositions.length; i++) {
      const [column, row] = changedPositions[i];
      const symbol = this.symbolsArray?.[column]?.[row] as EOGNCCascadeReelSymbol;
      symbol.visible = false;
    }
  }

  private makeSymbolsAppear() {
    const result = appModel.getReelModifiersData();
    const changedPositions: ChangedPosition[] = result?.changedPositions ?? [];
    if (!changedPositions.length) return;

    console.log('aaaaaaaa', this.targetSymbolData);
    for (let i = 0; i < changedPositions.length; i++) {
      const [column, row] = changedPositions[i];
      const symbol = this.symbolsArray?.[column]?.[row] as EOGNCCascadeReelSymbol;
      symbol.visible = true;
      symbol.showAppearingAnim(this.targetSymbolData, column, this.onNewSymbolAppeared.bind(this));
    }
  }
  protected onNewSymbolAppeared(): void {
    this.newSymAppearanceCompleteCount++;
    // checking for *2 because onNewSymbolAppeared is called twice. Once when appear animation of fireball completes and once when symbol appear animation is played.
    if (this.newSymAppearanceCompleteCount === this.totalSymbolsToConvert * 2) {
      this.allSymbolsConverted();
    }
  }
  protected allSymbolsConverted() {
    this.clearFireballSpines();
    StateManager.doNextStep();
  }

  private clearFireballSpines() {
    for (const s of this.fireballSpines) {
      AnimationProxy.killTweensOf(s);
      s.removeEventListners?.();
      s.destroySpine?.();
      s.destroy();
    }
    this.fireballSpines = [];
    this.fireballArrivedCount = 0;
    this.targetSymbolData = null;
  }
}
