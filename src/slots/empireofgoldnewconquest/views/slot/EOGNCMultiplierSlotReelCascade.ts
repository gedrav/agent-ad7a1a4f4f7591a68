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
import { DeviceProxy } from '@core/models/DeviceConfigProxy';

type ChangedPosition = [column: number, row: number];

const dStats = { x: 1614, y: 694, scale: 0.6 };
const lStats = { x: 1554, y: 694, scale: 0.6 };
const pStats = { x: 1110, y: -178, scale: 0.6 };
const FIREBALL_TRAVEL_DURATION = 1;

export default class EOGNCMultiplierSlotReelCascade extends MultiplierSlotReelCascade {
  private newSymAppearanceCompleteCount = 0;
  private totalSymbolsToConvert = 0;
  private targetSymbolData: any = null;
  private fireballSpines: PixSpine[] = [];
  private fireballArrivedCount = 0;
  private appearAnimIndex = 0;

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
    let index = 0;
    for (const [column, row] of changedPositions) {
      const symbol = this.symbolsArray?.[column]?.[row] as CascadeReelSymbol;
      if (!symbol) continue;

      const spine = UIUtil.getSpineAnim('Fire_ball_FX', { spineName: 'Fire_ball_FX' });
      const pos = this.toLocal(symbol.getGlobalPosition());
      if (DeviceProxy.config.isDesktop) {
        spine.x = dStats.x;
        spine.y = dStats.y;
        spine.scale.set(dStats.scale);
      } else {
        if (DeviceProxy.config.isPortrait) {
          spine.x = pStats.x;
          spine.y = pStats.y;
          spine.scale.set(pStats.scale);
        } else {
          spine.x = lStats.x;
          spine.y = lStats.y;
          spine.scale.set(lStats.scale);
        }
      }
      spine.playAnimation({ state: 'Fire_ball_static', loop: true });
      this.addChild(spine);
      this.fireballSpines.push(spine);

      AnimationProxy.animateTween(spine, {
        x: pos.x,
        y: pos.y,
        delay: index * 0.05,
        scaleX: 1,
        scaleY: 1,
        duration: FIREBALL_TRAVEL_DURATION,
        ease: 'power2.in',
        onInterrupt: this.onFireballArrived.bind(this, totalFireballs),
        onComplete: this.onFireballArrived.bind(this, totalFireballs),
      });
      EventHandler.dispatchEvent(SlotEvents.PLAY_SHOT_RELEASE_SOUND);
      index++;
    }
  }

  private async onFireballArrived(totalFireballs: number): Promise<void> {
    this.fireballSpines[this.fireballArrivedCount].playAnimation({
      state: 'Fire_ball_start',
      defaultMix: 0.01,
      reset: false,
      loop: false,
    });
    this.fireballArrivedCount++;
    if (this.fireballArrivedCount === totalFireballs) {
      await Util.addDelays(500); // added delay to show fireball animation over symbol
      this.onAllFireballsArrived();
    }
  }

  private async onAllFireballsArrived() {
    for (const spine of this.fireballSpines) {
      spine.addEventListener('event', (param: any) => {
        const event = param?.data?.name;
        if (event === 'SYMBOL_APPEAR') {
          this.makeSymbolsAppear();
        }
      });
      spine.addEventListener('complete', (entry: any) => {
        const animName = entry?.animation?.name;
        if (animName === 'Blast') {
          EventHandler.dispatchEvent(SlotEvents.PLAY_SYMBOL_APPEAR_SOUND);
          spine.playAnimation({ state: 'Appear', loop: false });
        } else if (animName === 'Appear') {
          this.onNewSymbolAppeared();
        }
      });
      this.makeSymbolsDisappear();
      spine.playAnimation({ state: 'Blast', loop: false });
      EventHandler.dispatchEvent(SlotEvents.PLAY_SYMBOL_DISAPPEAR_SOUND);
    }
  }

  private makeSymbolsDisappear() {
    const result = appModel.getReelModifiersData();
    const changedPositions: ChangedPosition[] = result?.changedPositions ?? [];
    if (!changedPositions.length) return;

    for (let i = 0; i < changedPositions.length; i++) {
      const [column, row] = changedPositions[i];
      const symbol = this.symbolsArray?.[column]?.[row] as CascadeReelSymbol;
      symbol.visible = false;
    }
  }

  private makeSymbolsAppear() {
    const result = appModel.getReelModifiersData();
    const changedPositions: ChangedPosition[] = result?.changedPositions ?? [];
    if (!changedPositions.length) return;
    const [column, row] = changedPositions[this.appearAnimIndex++];
    const symbol = this.symbolsArray?.[column]?.[row] as CascadeReelSymbol;
    symbol.visible = true;
    symbol.showAppearingAnim(this.targetSymbolData, column, this.onNewSymbolAppeared.bind(this));
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
    for (const spine of this.fireballSpines) {
      AnimationProxy.killTweensOf(spine);
      this.removeChild(spine);
      spine.removeEventListners?.();
      spine.destroySpine?.();
      spine.destroy();
    }
    this.fireballSpines = [];
    this.fireballArrivedCount = 0;
    this.appearAnimIndex = 0;
    this.targetSymbolData = null;
  }
}
