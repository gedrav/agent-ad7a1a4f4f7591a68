import SlotReelStandard from '@core/views/slotmachine/SlotReelStandard';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { Sine } from 'gsap';
import { StateManager } from '@core/states/StateManagerService';
import { SlotEvents } from '@core/events/SlotEvents';

export class GameSlotReel extends SlotReelStandard {
  private readonly totalAnims: number;
  private readonly animIndex: number;

  constructor(config: any) {
    super(config);
  }

  public changeReelSize(size: number): void {}
}
