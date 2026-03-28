import { SlotMachineView } from '@core/views/slotmachine/SlotMachineView';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import ReelSymbolSprite from '@core/views/slotmachine/ReelSymbolSprite';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { StateManager } from '@core/states/StateManagerService';
import { Point } from 'pixi.js';
import { getBezierPoint, lerp } from '@core/utils/MathUtils';
import { UIUtil } from '../../../../corelib/utils/UIUtilService';

export class GameSlotMachineView extends SlotMachineView {
  constructor(config: any) {
    super(config);
  }
}
