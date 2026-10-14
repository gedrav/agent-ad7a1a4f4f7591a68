import { Container } from 'pixi.js';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { AnimationStateListener } from '@esotericsoftware/spine-pixi-v8';

const TIER_SPAWN_ANIMATIONS = ['bronze', 'silver', 'gold'];
// 'bronge_idle' / 'bronge_to_silver' are typos in the source frames.json spine data itself (not ours) - must match exactly.
const TIER_IDLE_ANIMATIONS = ['bronge_idle', 'silver_idle', 'gold_idle'];
const TIER_UPGRADE_ANIMATIONS: (string | null)[] = [null, 'bronge_to_silver', 'silver_to_gold'];

export class FrameComp extends Container {
  private readonly spine: PixSpine;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
    this.spine = new PixSpine({ spineName: 'frames' });
    this.addChild(this.spine);
  }

  public playTier(fromValue: number, toValue: number, onComplete: () => void): void {
    const toTierIndex = toValue - 1;
    const isNewFrame = fromValue === 0;
    const spawnState = isNewFrame ? TIER_SPAWN_ANIMATIONS[toTierIndex] : TIER_UPGRADE_ANIMATIONS[toTierIndex];
    const idleState = TIER_IDLE_ANIMATIONS[toTierIndex];

    let listener: AnimationStateListener | null = null;
    listener = this.spine.addEventListener('complete', () => {
      if (listener) this.spine.removeSpineEvent(listener);
      onComplete();
    });
    this.spine.playAnimation({ state: spawnState, loop: false, nextState: idleState, nextLoop: true });
  }

  public destroyFrame(): void {
    this.spine.destroySpine();
    this.parent?.removeChild(this);
    this.destroy({ children: true });
  }
}
