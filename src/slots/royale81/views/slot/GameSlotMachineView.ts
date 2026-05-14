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
  private gameTitle: PixSpine;
  private movingSymbolArray: ReelSymbolSprite[] = [];
  private activeTweens: gsap.core.Tween[] = [];
  private currentSymbolPositions: Array<[number, number]> | null = null;
  private wildBlastSoundTimeout: number | null = null;
  private skipInProgress: boolean = false;
  private stateAdvanced: boolean = false;

  constructor(config: any) {
    super(config);

    this.potAnim = this.slotReel.elementsList['potAnim'];
    this.gameTitle = this.slotReel.elementsList['gameTitle'];
    this.potAnim.addEventListener('complete', this.onPotAnimCompleted.bind(this));
    this.startGameLogoAnimation();
    EventHandler.addEventListener('SHOW_WILD_BLAST', this.showWildBlast.bind(this));
    EventHandler.addEventListener('SHOW_WILD_BLAST_ANTICIPATION', this.showWildBlastAnticipation.bind(this));
    EventHandler.addEventListener(AppEvents.APP_RESIZE, this.onResizeInterrupt.bind(this));
  }

  protected onPotAnimCompleted(data: any): void {
    if (data.animation.name == 'anticipation') {
      this.potAnim.playAnimation({ state: 'idle', loop: true });
      StateManager.doNextStep();
    }
  }

  protected showWildBlastAnticipation(): void {
    this.potAnim.stopAnimation();

    // Play anticipation animation
    this.potAnim.playAnimation({
      state: 'anticipation',
      loop: false,
      nextState: 'idle',
      nextLoop: true,
    });
    EventHandler.dispatchEvent('PLAY_POT_SHAKE_SOUND');
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

  protected showWildBlast(data: any): void {
    const symbolPositions: Array<[number, number]> = data.wildPositions;
    if (!symbolPositions) return;

    const numberOfWilds = symbolPositions.length;
    this.stateAdvanced = false;
    this.potAnim.stopAnimation();
    this.potAnim.playAnimation({ state: 'Win_anim' });
    this.playSymbolComingOut(symbolPositions);
    EventHandler.dispatchEvent('PLAY_POT_SHAKE_SOUND');
    this.wildBlastSoundTimeout = window.setTimeout(() => {
      EventHandler.dispatchEvent(`PLAY_WILD_BLAST_${numberOfWilds}`);
      this.wildBlastSoundTimeout = null;
    }, 1166);
  }

  protected playSymbolComingOut(symbolPositions: Array<[number, number]>) {
    if (!symbolPositions || symbolPositions.length < 1) return;

    this.currentSymbolPositions = symbolPositions;
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

      const tween = AnimationProxy.animateTween(movingSymbol, {
        duration: totalDuration - delay,
        delay: delay,
        x: this.potAnim.x + wildPosition.x,
        y: this.potAnim.y + wildPosition.y,
        rotation: finalRotation,
        onComplete: () => {
          this.removeActiveTween(tween);
          this.playSymbolMoveTween(index, symbolPositions);
        },
      });
      this.activeTweens.push(tween);
    });
  }

  protected playSymbolMoveTween(index: number, symbolPositions: Array<[number, number]>) {
    const gameTitleIndex = this.slotReel.children.indexOf(this.gameTitle);
    const numberOfWilds = symbolPositions.length;
    const reelPosition = symbolPositions[index];
    const movingSymbol = this.movingSymbolArray[index];

    const controlPointYOffset = this.potAnim.y * 0.5;
    const startPoint = movingSymbol.position.clone();
    const end = this.getSymbolPositions(reelPosition[0], reelPosition[1]);
    const c1 = new Point(this.potAnim.x, controlPointYOffset);
    const c2 = new Point(end.x * 0.5, controlPointYOffset);

    this.slotReel.addChildAt(movingSymbol, gameTitleIndex + 1);

    const tween = AnimationProxy.animateTween(movingSymbol, {
      duration: 1,
      delay: 0.25 * index,
      rotation: 0,
      onComplete: () => {
        this.removeActiveTween(tween);
        EventHandler.dispatchEvent(`PLAY_WILD_LAND_${index + 1}`);
        this.replaceWildOnReels(reelPosition);
        this.slotReel.removeChild(movingSymbol);
        this.onFinalSymbolTween(index, numberOfWilds);
      },
      onUpdate: function () {
        const t = this.progress();
        const beizerPoint = getBezierPoint(t, startPoint, c1, c2, end);
        movingSymbol.position.copyFrom(beizerPoint);
        movingSymbol.scale.set(lerp(0.8, 1, t));
      },
    });
    this.activeTweens.push(tween);
  }

  protected replaceWildOnReels(position: [number, number]) {
    this.slotReel.swapSymbol(position[0], position[1] + 1, 'WD');
  }

  protected onFinalSymbolTween(index: number, numberOfWilds: number) {
    if (index === numberOfWilds - 1) {
      this.movingSymbolArray = [];
      this.currentSymbolPositions = null;
      this.potAnim.playAnimation({ state: 'idle', loop: true });
      setTimeout(() => this.advanceState(), 600); // If no delay is added the WILD symbol doesnt animate on line win
    }
  }

  protected advanceState(): void {
    if (this.stateAdvanced) return;
    this.stateAdvanced = true;
    StateManager.doNextStep();
  }

  protected removeActiveTween(tween: gsap.core.Tween): void {
    const i = this.activeTweens.indexOf(tween);
    if (i !== -1) this.activeTweens.splice(i, 1);
  }

  protected onResizeInterrupt(): void {
    if (DeviceProxy.config.isDesktop) return;
    if (this.skipInProgress) return;
    if (!this.currentSymbolPositions || this.movingSymbolArray.length === 0) return;

    this.skipInProgress = true;

    if (this.wildBlastSoundTimeout != null) {
      clearTimeout(this.wildBlastSoundTimeout);
      this.wildBlastSoundTimeout = null;
    }

    this.activeTweens.forEach((t) => t.kill());
    this.activeTweens = [];

    const positions = this.currentSymbolPositions;
    const numberOfWilds = positions.length;

    this.movingSymbolArray.forEach((sprite, i) => {
      this.replaceWildOnReels(positions[i]);
      if (sprite.parent) sprite.parent.removeChild(sprite);
    });

    EventHandler.dispatchEvent(`PLAY_WILD_LAND_${numberOfWilds}`);

    this.onFinalSymbolTween(numberOfWilds - 1, numberOfWilds);

    this.skipInProgress = false;
  }

  protected getSymbolPositions(x: number, y: number) {
    const globalPosition = this.slotReel.getSymbolPosition(x, y + 1);
    const local = this.slotReel.toLocal(globalPosition);
    return local;
  }
}
