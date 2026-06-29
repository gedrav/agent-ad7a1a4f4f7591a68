import { StandardView } from '@core/pixiwrapper/StandardView';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { UIUtil } from '@core/utils/UIUtilService';
import { appModel } from '@core/models/services/AppModelService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { Point } from 'pixi.js';
import { Power4 } from 'gsap/gsap-core';
import { Util } from '@core/utils/UtilService';

type ChangedPosition = [column: number, row: number];
type Shot = { sb: PixSpine; target: any; column: number; row: number };
type Side = 'L' | 'R';

export class ArtilleryComp extends StandardView {
  protected artilleryL: PixSpine;
  protected artilleryR: PixSpine;
  private snowballs: PixSpine[] = [];
  private leftQueue: Shot[] = [];
  private rightQueue: Shot[] = [];
  private burstCompleteCount = 0;
  private landedCount = 0;
  private totalShots = 0;

  constructor(config: any) {
    super(config);
    this.artilleryL = this.elementsList['artilleryL'];
    this.artilleryR = this.elementsList['artilleryR'];
    this.visible = false;
    EventHandler.addEventListener(SlotEvents.LOWPAY_SYMBOL_CONVERSION, this.setupForSymbolConversion.bind(this));
  }

  private setupForSymbolConversion(): void {
    this.visible = true;
    this.burstCompleteCount = 0;
    this.landedCount = 0;
    this.spawnSnowballs();
    this.totalShots = this.snowballs.length;
    this.playStartBoth(() => this.fireRandomly());
  }

  private spawnSnowballs(): void {
    this.destroySnowballs();
    this.leftQueue = [];
    this.rightQueue = [];
    const changedPositions = this.getChangedPositions();
    const symbolsArray = this.getSymbolsArray();
    for (const [column, row] of changedPositions) {
      this.createShot(column, row, symbolsArray);
    }
  }

  private createShot(column: number, row: number, symbolsArray: any): void {
    const side: Side = column < 3 ? 'L' : 'R';
    const sb = this.createSnowballSpine();
    const origin = this.getArtillery(side);
    sb.x = origin.x;
    sb.y = origin.y;
    sb.visible = false;
    this.addChildAt(sb, 0);
    this.snowballs.push(sb);
    this.getQueue(side).push({ sb, target: symbolsArray?.[column]?.[row], column, row });
  }

  private createSnowballSpine(): PixSpine {
    return UIUtil.getSpineAnim('snow_ball', {
      spineName: 'Cannon_spine',
      defaultState: 'snow_ball_Static',
      loop: true,
    });
  }

  private playStartBoth(onBothComplete: () => void): void {
    let done = 0;
    const onOneDone = () => {
      if (++done === 2) onBothComplete();
    };
    this.playOnceThen(this.artilleryL, 'Start', onOneDone);
    this.playOnceThen(this.artilleryR, 'Start', onOneDone);
  }

  private fireRandomly(): void {
    const side = this.pickRandomPendingSide();
    if (!side) return;
    const spine = this.getArtillery(side);
    const shot = this.getQueue(side).pop();
    this.fireShot(spine, shot);
  }

  private fireShot(spine: PixSpine, shot: Shot): void {
    EventHandler.dispatchEvent(SlotEvents.PLAY_SHOT_RELEASE_SOUND);
    this.aimAtTarget(spine, shot.target);
    this.playOnceThen(spine, 'Fire', () => this.fireRandomly());
    const timeScale = appModel.turboMode ? 2.4 : 1.2;
    spine.setAnimationSpeed(timeScale);
    this.launchSnowball(shot);
  }

  private pickRandomPendingSide(): Side | null {
    const sides: Side[] = [];
    if (this.leftQueue.length) sides.push('L');
    if (this.rightQueue.length) sides.push('R');
    if (!sides.length) return null;
    return sides[Math.floor(Math.random() * sides.length)];
  }

  private launchSnowball(shot: Shot): void {
    const { sb, target } = shot;
    sb.scale.set(0);
    sb.visible = true;
    if (!target) {
      this.onSnowballLanded(target);
      return;
    }
    const local = this.toLocal(target.toGlobal(new Point(0, 0)));
    const duration = appModel.turboMode ? 0.1 : 0.2;
    AnimationProxy.animateTween(sb, {
      duration: duration,
      x: local.x,
      y: local.y,
      scale: 1.1,
      ease: Power4.easeOut,
      onComplete: () => this.onSnowballLanded(target),
    });
  }

  private onSnowballLanded(target?: any): void {
    if (target) target.visible = false;
    if (++this.landedCount === this.totalShots) this.burstAll();
  }

  private async burstAll(): Promise<void> {
    EventHandler.dispatchEvent(SlotEvents.PLAY_SYMBOL_DISAPPEAR_SOUND);
    EventHandler.dispatchEvent(SlotEvents.INITIATE_SYMBOL_CONVERSION);
    await Util.addDelays(350);
    for (const sb of this.snowballs) {
      sb.scale.set(0.9);
      this.playOnceThen(sb, 'Snow_ball_burst', () => this.onBurstDone());
    }
  }

  private onBurstDone(): void {
    if (++this.burstCompleteCount !== this.totalShots) return;
    this.playEnd();
  }

  public playEnd(): void {
    this.playOnceThen(this.artilleryL, 'End', () => {
      this.visible = false;
      this.destroySnowballs();
    });
    this.artilleryR.playAnimation({ state: 'End', loop: false });
  }

  private aimAtTarget(spine: PixSpine, target: any): void {
    if (!target) return;
    const local = this.toLocal(target.toGlobal(new Point(0, 0)));
    const dx = local.x - spine.x;
    const dy = local.y - spine.y;
    spine.rotation = Math.atan2(-dx, dy);
  }

  private playOnceThen(spine: PixSpine, state: string, onComplete: () => void): void {
    const listener = spine.addEventListener('complete', (entry: any) => {
      if (entry.animation.name !== state) return;
      spine.removeSpineEvent(listener);
      onComplete();
    });
    spine.playAnimation({ state, loop: false });
  }

  private destroySnowballs(): void {
    for (const sb of this.snowballs) sb.destroySpine();
    this.snowballs = [];
    this.rightQueue = [];
    this.leftQueue = [];
    this.artilleryL.angle = 0;
    this.artilleryR.angle = 0;
    this.burstCompleteCount = 0;
    this.landedCount = 0;
    this.totalShots = 0;
  }

  private getChangedPositions(): ChangedPosition[] {
    return appModel.getReelModifiersData()?.changedPositions ?? [];
  }

  private getSymbolsArray(): any {
    return (this.parent as any)?.symbolsArray;
  }

  private getArtillery(side: Side): PixSpine {
    return side === 'L' ? this.artilleryL : this.artilleryR;
  }

  private getQueue(side: Side): Shot[] {
    return side === 'L' ? this.leftQueue : this.rightQueue;
  }
}
