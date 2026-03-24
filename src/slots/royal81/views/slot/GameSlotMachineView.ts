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
  private potAnim: PixSpine;
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
  private skipWildAnim: boolean = true;
  private gameTitle: PixSpine;
  private movingSymbolArray: ReelSymbolSprite[] = [];

  constructor(config: any) {
    super(config);

    this.potAnim = this.slotReel.elementsList['potAnim'];
    this.gameTitle = this.slotReel.elementsList['gameTitle'];
    this.startGameLogoAnimation();
    EventHandler.addEventListener('SHOW_WILD_BLAST', this.showWildBlast.bind(this));
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

  protected skipWildAnimation() {
    this.skipWildAnim = true;
  }

  protected showWildBlast(data: any): void {
    this.skipWildAnim = false;
    const symbolPositions: Array<[number, number]> = data.wildPositions;
    const numberOfWilds = symbolPositions.length;

    if (!symbolPositions) return;

    if (!this.skipWildAnim) {
      this.potAnim.stopAnimation();
      this.potAnim.playAnimation({ state: 'Win_anim' });
      this.playSymbolComingOut(symbolPositions);
      setTimeout(() => EventHandler.dispatchEvent(`PLAY_WILD_BLAST_${numberOfWilds}`), 1166);
    } else {
      symbolPositions.forEach((position) => this.replaceWildOnReels(position));
    }
  }

  protected playSymbolComingOut(symbolPositions: Array<[number, number]>) {
    if (!symbolPositions || symbolPositions.length < 1) return;

    const potAnimIndex = this.slotReel.children.indexOf(this.potAnim);
    const numberOfWilds = symbolPositions.length;
    const wildConfig = this.wildConfig[numberOfWilds];
    const totalDuration = 1.166;
    const delay = 0.9;

    wildConfig.forEach((wildPosition, index) => {
      const finalRotation = (wildPosition.angle * Math.PI) / 180;

      const movingSymbol = new ReelSymbolSprite({
        data: {
          name: 'WD',
          spineName: 'wild_Spine',
          skin: 'default',
          idleAnim: 'Idle',
          winAnim: 'Win',
        },
      });

      movingSymbol.scale.set(0.8);
      movingSymbol.x = this.potAnim.x;
      movingSymbol.y = this.potAnim.y;
      this.movingSymbolArray.push(movingSymbol);
      this.slotReel.addChildAt(movingSymbol, potAnimIndex - 1);

      AnimationProxy.animateTween(movingSymbol, {
        duration: totalDuration - delay,
        delay: delay,
        x: this.potAnim.x + wildPosition.x,
        y: this.potAnim.y + wildPosition.y,
        rotation: finalRotation,
        onComplete: () => {
          this.playSymbolMoveTween(index, symbolPositions);
        },
      });
    });
  }

  protected playSymbolMoveTween(index: number, symbolPositions: Array<[number, number]>) {
    const potAnimIndex = this.slotReel.children.indexOf(this.potAnim);
    const numberOfWilds = symbolPositions.length;
    const reelPosition = symbolPositions[index];
    const movingSymbol = this.movingSymbolArray[index];

    const controlPointYOffset = this.potAnim.y < 0 ? -UIUtil.getGameHeight() : this.potAnim.y * 0.5;
    const startPoint = movingSymbol.position.clone();
    const end = this.getSymbolPositions(reelPosition[0], reelPosition[1]);
    const c1 = new Point(this.potAnim.x, controlPointYOffset);
    const c2 = new Point(end.x * 0.5, controlPointYOffset);

    movingSymbol.scale.set(0.8);
    this.slotReel.addChildAt(movingSymbol, potAnimIndex + 1);

    AnimationProxy.animateTween(movingSymbol, {
      duration: 1,
      delay: 0.25 * index,
      rotation: 0,
      onComplete: () => {
        EventHandler.dispatchEvent(`PLAY_WILD_LAND_${index + 1}`);
        this.replaceWildOnReels(reelPosition);
        this.slotReel.removeChild(movingSymbol);
        this.onFinalSymbolTween(index, numberOfWilds);
      },
      onUpdate: function () {
        const t = this.progress();
        if (this.skipWildAnim) {
          movingSymbol.visible = false;
        }
        const beizerPoint = getBezierPoint(t, startPoint, c1, c2, end);
        movingSymbol.position.copyFrom(beizerPoint);
        movingSymbol.scale.set(lerp(0.8, 1, t));
      },
    });
  }

  protected replaceWildOnReels(position: [number, number]) {
    this.slotReel.swapSymbol(position[0], position[1] + 1, 'WD');
  }

  protected onFinalSymbolTween(index: number, numberOfWilds: number) {
    if (index === numberOfWilds - 1) {
      this.movingSymbolArray = [];
      this.potAnim.playAnimation({ state: 'idle', loop: true });
      setTimeout(() => StateManager.doNextStep(), 600); // If no delay is added the WILD symbol doesnt animate on line win
    }
  }

  protected getSymbolPositions(x: number, y: number) {
    const globalPosition = this.slotReel.getSymbolPosition(x, y + 1);
    const local = this.slotReel.toLocal(globalPosition);
    return local;
  }
}
