import { SlotMachineView } from '@core/views/slotmachine/SlotMachineView';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import ReelSymbolSprite from '@core/views/slotmachine/ReelSymbolSprite';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { AnimationStateListener } from '@esotericsoftware/spine-pixi-v8';
import { StateManager } from '@core/states/StateManagerService';

export class GameSlotMachineView extends SlotMachineView {
  private potAnim: PixSpine;
  private wildSymbolPositions = {
    1: [{ x: 0, y: -178, angle: 0 }],
    2: [
      { x: -76.5, y: -190, angle: -9 },
      { x: 64, y: -190, angle: 9 },
    ],
    3: [
      { x: 80, y: -188, angle: 26 },
      { x: -90, y: -188, angle: -26 },
      { x: 0, y: -178, angle: 0 },
    ],
  };
  private skipWildAnim: boolean = true;
  constructor(config: any) {
    super(config);

    this.potAnim = this.slotReel.elementsList['potAnim'];

    EventHandler.addEventListener('SHOW_WILD_BLAST', this.showWildBlast.bind(this));
  }

  protected resizeComponents(): void {}

  protected skipWildAnimation() {
    this.skipWildAnim = true;
  }

  protected showWildBlast(data: any): void {
    this.skipWildAnim = false;
    const symbolPositions: Array<[number, number]> = data.wildPositions;
    const numberOfWilds = symbolPositions.length;
    EventHandler.dispatchEvent(`PLAY_WILD_BLAST_${numberOfWilds}`);

    if (!symbolPositions) return;

    if (!this.skipWildAnim) {
      this.potAnim.stopAnimation();

      const listener: AnimationStateListener = {
        event: (_, event) => {
          if (event.data.name.startsWith('Sym')) {
            const index = parseInt(event.data.name.split('_').at(-1)); // Sym_{numberOfWilds}_{index}
            this.playSymbolTween(index - 1, symbolPositions);
          }
        },
        complete: () => {
          this.potAnim.stopAnimation();
          this.potAnim.playAnimation({ state: 'idle', loop: true });
          symbolPositions.forEach((position) => this.replaceWildOnReels(position));
        },
      };
      this.potAnim.playAnimation({ state: `Win_anim${numberOfWilds}`, listener });
    } else {
      symbolPositions.forEach((position) => this.replaceWildOnReels(position));
    }
  }

  protected playSymbolTween(index: number, symbolPositions: Array<[number, number]>) {
    if (this.skipWildAnim) {
      this.potAnim.stopAnimation();
      this.potAnim.playAnimation({ state: 'idle', loop: true });
      return;
    }
    const numberOfWilds = symbolPositions.length;
    const reelPosition = symbolPositions[index];
    const wildPositions = this.wildSymbolPositions[numberOfWilds];

    const movingSymbol = new ReelSymbolSprite({
      data: {
        name: 'WD',
        spineName: 'wild_Spine',
        skin: 'default',
        idleAnim: 'Idle',
        winAnim: 'Win',
      },
    });

    const moveTo = this.getSymbolPositions(reelPosition[0], reelPosition[1]);

    movingSymbol.scale.set(0.8);
    movingSymbol.x = this.potAnim.x + wildPositions[index].x;
    movingSymbol.y = this.potAnim.y + wildPositions[index].y;
    movingSymbol.rotation = (wildPositions[index].angle * Math.PI) / 180;
    movingSymbol.alpha = 0;
    this.slotReel.addChild(movingSymbol);

    AnimationProxy.animateTween(movingSymbol, {
      duration: 0.4,
      x: moveTo.x,
      y: moveTo.y,
      delay: 0.08,
      rotation: 0,
      alpha: 1,
      scale: 1,
      onComplete: () => {
        this.replaceWildOnReels(reelPosition);
        this.slotReel.removeChild(movingSymbol);
        this.onFinalSymbolTween(index, numberOfWilds);
      },
      onUpdate: () => {
        if (this.skipWildAnim) {
          movingSymbol.visible = false;
        }
      },
    });
  }

  protected replaceWildOnReels(position: [number, number]) {
    this.slotReel.swapSymbol(position[0], position[1] + 1, 'WD');
  }

  protected onFinalSymbolTween(index: number, numberOfWilds: number) {
    if (index === numberOfWilds - 1) {
      setTimeout(() => StateManager.doNextStep(), 600); // If no delay is added the WILD symbol doesnt animate on line win
    }
  }

  protected getSymbolPositions(x: number, y: number) {
    const globalPosition = this.slotReel.getSymbolPosition(x, y + 1);
    const local = this.slotReel.toLocal(globalPosition);
    return local;
  }
}
