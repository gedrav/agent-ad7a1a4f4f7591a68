import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { ColorMatrixFilter } from 'pixi.js';
import gsap from 'gsap';

type IconState = 'closed' | 'awaitingData' | 'opening' | 'open' | 'disabled' | 'won';

export type JackpotTier = 'grand' | 'major' | 'minor' | 'mini';

const ANIM = {
  IDLE: ['Ideal', 'Ideal2'],
  HOVER: 'Hover_over',
  FLIP_LOOP: 'Flip/Flip',
} as const;

const IDLE_START_DELAY_MAX_MS = 300;

const FLIP_ANIM_BY_TIER: Record<JackpotTier, string> = {
  grand: 'Flip/Red_Flip_Grand',
  major: 'Flip/Purple_Flip_Major',
  minor: 'Flip/Blue_Flip_Minor',
  mini: 'Flip/Green_Flip_Mini',
};

const BACK_STATIC_ANIM_BY_TIER: Record<JackpotTier, string> = {
  grand: 'Back/Red_Static',
  major: 'Back/Purple_Static',
  minor: 'Back/BLue_Static',
  mini: 'Back/Green_Static',
};

const WIN_ANIM = {
  SCALE_UP: 1.08,
  SCALE_DURATION: 0.5,
  EASE: 'sine.inOut',
} as const;
const DISABLED_BRIGHTNESS = 0.35;

export const PICK_ICON_EVENT = {
  SELECTED: 'pickIconSelected',
  REVEAL_COMPLETE: 'pickIconRevealComplete',
} as const;

export class PickBonusJackpotIconComp extends ResponsiveChildrenView {
  private readonly jackpotSym: PixSpine;
  private readonly tierSprites: Record<JackpotTier, PixSprite>;
  private state: IconState = 'closed';
  private isHovering: boolean = false;
  private isActive: boolean = true;
  private jackpotData: JackpotTier;
  private pendingTier: JackpotTier | null = null;
  private flipLoopListener: any = null;
  private winTween: gsap.core.Tween | null = null;
  private idleTimeout: ReturnType<typeof setTimeout> | null = null;
  private dimFilter: ColorMatrixFilter | null = null;

  constructor(config) {
    super(config);
    this.jackpotSym = this.elementsList['jackpotIcon'];
    this.jackpotSym.setInteractive(true);
    this.setupInteraction();
    this.playIdle();
  }

  private setupInteraction(): void {
    this.eventMode = 'static';
    this.cursor = 'pointer';

    this.on('pointerover', this.onPointerOver, this);
    this.on('pointerout', this.onPointerOut, this);
    this.on('pointertap', this.onPointerTap, this);
  }

  private onPointerOver(): void {
    if (!this.canInteract()) return;
    this.isHovering = true;
    this.playHover();
  }

  private onPointerOut(): void {
    if (!this.canInteract()) return;
    this.isHovering = false;
    this.playIdle();
  }

  private onPointerTap(): void {
    if (!this.canInteract()) return;
    this.isActive = false;
    EventHandler.dispatchEvent('PLAY_COIN_CLICK_SOUND');
    this.emit(PICK_ICON_EVENT.SELECTED, this);
  }

  private canInteract(): boolean {
    return this.isActive && this.state === 'closed';
  }

  private playIdle(): void {
    if (this.state !== 'closed' && this.state !== 'disabled') return;
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = null;
    }
    const idleAnim = ANIM.IDLE[Math.floor(Math.random() * ANIM.IDLE.length)];
    const delay = Math.random() * IDLE_START_DELAY_MAX_MS;
    this.idleTimeout = setTimeout(() => {
      this.idleTimeout = null;
      if (this.state !== 'closed' && this.state !== 'disabled') return;
      this.jackpotSym.playAnimation({ state: idleAnim, loop: true });
    }, delay);
  }

  private playHover(): void {
    if (this.state !== 'closed') return;
    this.jackpotSym.playAnimation({ state: ANIM.HOVER, loop: true });
  }

  public setjackpotData(data: JackpotTier): void {
    this.jackpotData = data;
  }

  public getjackpotData(): JackpotTier {
    return this.jackpotData;
  }

  public startFlipAnimation(): void {
    if (this.state !== 'closed') return;

    this.state = 'awaitingData';
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = null;
    }

    EventHandler.dispatchEvent('PLAY_COIN_TURN_SOUND');
    this.jackpotSym.playAnimation({ state: ANIM.FLIP_LOOP, loop: true });

    this.flipLoopListener = this.jackpotSym.addEventListener('complete', (entry: any) => {
      if (this.pendingTier == null || entry?.animation?.name !== ANIM.FLIP_LOOP) return;
      const tier = this.pendingTier;
      this.pendingTier = null;
      this.clearFlipLoopListener();
      this.playTierFlip(tier);
    });
  }

  public revealJackpot(): void {
    if (this.state === 'awaitingData') {
      this.isActive = false;
      this.pendingTier = this.jackpotData;
      return;
    }
    if (this.state !== 'closed') return;

    this.isActive = false;
    this.playTierFlip(this.jackpotData);
  }

  private playTierFlip(tier: JackpotTier): void {
    this.state = 'opening';
    const flipAnim = FLIP_ANIM_BY_TIER[tier];

    this.jackpotSym.playAnimation({ state: flipAnim, loop: false });
    const listener = this.jackpotSym.addEventListener('complete', (entry: any) => {
      if (entry?.animation?.name !== flipAnim) return;
      this.jackpotSym.removeSpineEvent(listener);
      this.onFlipComplete(tier);
    });
  }

  private clearFlipLoopListener(): void {
    if (!this.flipLoopListener) return;
    this.jackpotSym.removeSpineEvent(this.flipLoopListener);
    this.flipLoopListener = null;
  }

  public revealInstantly(): void {
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = null;
    }
    this.isActive = false;
    this.state = 'open';
    this.jackpotSym.playAnimation({ state: BACK_STATIC_ANIM_BY_TIER[this.jackpotData], loop: true });
  }

  private onFlipComplete(tier: JackpotTier): void {
    this.state = 'open';
    this.jackpotSym.playAnimation({ state: BACK_STATIC_ANIM_BY_TIER[tier], loop: true });
    this.emit(PICK_ICON_EVENT.REVEAL_COMPLETE, this, tier);
  }

  private setInteractive(value: boolean): void {
    this.isActive = value;
    if (!value) {
      this.playIdle();
    }
  }

  public disable(): void {
    this.state = 'disabled';
    this.isActive = false;
    this.isHovering = false;
    this.eventMode = 'none';
    this.cursor = 'default';
    this.pendingTier = null;
    this.clearFlipLoopListener();
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = null;
    }
    this.jackpotSym.stopAnimation();
    if (!this.dimFilter) {
      this.dimFilter = new ColorMatrixFilter();
      this.dimFilter.brightness(DISABLED_BRIGHTNESS, false);
      this.dimFilter.resolution = Math.min(Math.ceil(window.devicePixelRatio), 2);
    }
    this.filters = [this.dimFilter];
  }

  public playWinAnim(): void {
    this.state = 'won';
    this.isActive = false;
    this.isHovering = false;
    this.eventMode = 'none';
    this.cursor = 'default';

    this.killWinAnim();

    this.winTween = gsap.to(this.scale, {
      x: WIN_ANIM.SCALE_UP,
      y: WIN_ANIM.SCALE_UP,
      duration: WIN_ANIM.SCALE_DURATION,
      ease: WIN_ANIM.EASE,
      yoyo: true,
      repeat: -1,
    });
  }

  private killWinAnim(): void {
    if (this.winTween) {
      this.winTween.kill();
      this.winTween = null;
    }
    this.scale.set(1, 1);
  }

  public reset(): void {
    this.killWinAnim();
    this.clearFlipLoopListener();
    this.filters = null;
    this.state = 'closed';
    this.isActive = true;
    this.isHovering = false;
    this.jackpotData = undefined;
    this.pendingTier = null;
    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.jackpotSym.stopAnimation();
    this.playIdle();
  }
}
