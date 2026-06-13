import { SlotMachineView } from '@core/views/slotmachine/SlotMachineView';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import ReelSymbolSprite from '@core/views/slotmachine/ReelSymbolSprite';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { StateManager } from '@core/states/StateManagerService';
import { Point } from 'pixi.js';
import { getBezierPoint, lerp } from '@core/utils/MathUtils';
import { AppEvents } from '@core/events/AppEvents';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';

export class GameSlotMachineView extends SlotMachineView {
  private wildConfig = {
    1: [{ x: 0, y: -210, angle: 0 }],
    2: [
      { x: -76.5, y: -210, angle: -9 },
      { x: 64, y: -210, angle: 9 },
    ],
    3: [
      { x: 80, y: -200, angle: 26 },
      { x: -90, y: -200, angle: -26 },
      { x: 0, y: -210, angle: 0 },
    ],
  };
  private gameTitle: PixSpine;
  private movingSymbolArray: ReelSymbolSprite[] = [];
  private activeTweens: gsap.core.Tween[] = [];
  private currentSymbolPositions: Array<[number, number]> | null = null;
  private wildBlastSoundTimeout: number | null = null;
  private skipInProgress: boolean = false;
  private stateAdvanced: boolean = false;

  constructor(config: any) {
    super(config);

    this.gameTitle = this.slotReel.elementsList['gameTitle'];
    this.startGameLogoAnimation();
  }

  protected startGameLogoAnimation(): void {
    this.gameTitle.playAnimation({ state: 'Idle', loop: false });
    setTimeout(
      () => {
        this.startGameLogoAnimation();
      },
      Math.random() * 5000 + 5000,
    );
  }

  protected resizeComponents(): void {}

  protected advanceState(): void {
    if (this.stateAdvanced) return;
    this.stateAdvanced = true;
    StateManager.doNextStep();
  }

  protected removeActiveTween(tween: gsap.core.Tween): void {
    const i = this.activeTweens.indexOf(tween);
    if (i !== -1) this.activeTweens.splice(i, 1);
  }

  protected getSymbolPositions(x: number, y: number) {
    const globalPosition = this.slotReel.getSymbolPosition(x, y + 1);
    const local = this.slotReel.toLocal(globalPosition);
    return local;
  }
}
