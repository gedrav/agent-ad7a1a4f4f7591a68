import { SlotMachineView } from '@core/views/slotmachine/SlotMachineView';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import ReelSymbolSprite from '@core/views/slotmachine/ReelSymbolSprite';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { AnimationStateListener } from '@esotericsoftware/spine-pixi-v8';

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
  constructor(config: any) {
    super(config);

    this.potAnim = this.slotReel.elementsList['potAnim'];

    EventHandler.addEventListener('SHOW_WILD_BLAST', this.showWildBlast.bind(this));
  }

  protected resizeComponents(): void {}

  protected showWildBlast(data: any): void {
    const numberOfWilds = data.numberOfWilds;
    const symbolPositions = data.wildPositions;

    const listener: AnimationStateListener = {
      event: (_, event) => {
        if (event.data.name.startsWith('Sym')) {
          const index = parseInt(event.data.name.split('_').at(-1)); // Sym_{numberOfWilds}_{index}
          this.playSymbolTween(index - 1, symbolPositions);
        }
      },
      complete: () => {
        this.potAnim.stopAnimation();
      },
    };
    this.potAnim.playAnimation({ state: `Win_anim${numberOfWilds}`, listener });
  }

  protected playSymbolTween(index: number, symbolPositions: Array<[number, number]>) {
    const numberOfWilds = symbolPositions.length;
    const position = symbolPositions[index];
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

    const moveTo = this.getSymbolPositions(position[0], position[1]);

    movingSymbol.scale.set(0.8);
    movingSymbol.x = this.potAnim.x + wildPositions[index].x;
    movingSymbol.y = this.potAnim.y + wildPositions[index].y;
    movingSymbol.rotation = (wildPositions[index].angle * Math.PI) / 180;
    movingSymbol.alpha = 0;
    this.slotReel.addChild(movingSymbol);

    AnimationProxy.animateTween(movingSymbol, {
      duration: 0.5,
      x: moveTo.x,
      y: moveTo.y,
      delay: 0.08,
      rotation: 0,
      alpha: 1,
      scale: 1,
      onComplete: () => {
        this.slotReel.swapSymbol(position[0], position[1] + 1, 'WD');
        this.slotReel.removeChild(movingSymbol);
      },
    });
  }

  protected getSymbolPositions(x: number, y: number) {
    const globalPosition = this.slotReel.getSymbolPosition(x, y + 1);
    const local = this.slotReel.toLocal(globalPosition);
    return local;
  }
}
