import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { Ticker } from 'pixi.js';
import gsap from 'gsap';

type IconState = 'closed' | 'opening' | 'open' | 'disabled' | 'won';

export type JackpotTier = 'grand' | 'major' | 'minor' | 'mini';

const ANIM = {
  IDLE: 'Ideal',
  HOVER: 'Hover_over',
} as const;

const FLIP_ANIM_BY_TIER: Record<JackpotTier, string> = {
  grand: 'flIP_Red',
  major: 'flIP_Purple',
  minor: 'flIP_Blue',
  mini: 'flIP_Green',
};

const WIN_ANIM = {
  SCALE_UP: 1.15,
  SCALE_DURATION: 0.5,
  EASE: 'sine.inOut',
} as const;

const TEXT_SLOT_NAME = 'Text';

export const PICK_ICON_EVENT = {
  SELECTED: 'pickIconSelected',
  REVEAL_COMPLETE: 'pickIconRevealComplete',
} as const;

export class PickBonusJackpotIconComp extends ResponsiveChildrenView {
  private readonly jackpotSym: PixSpine;
  private readonly grand: PixSprite;
  private readonly major: PixSprite;
  private readonly minor: PixSprite;
  private readonly mini: PixSprite;
  private readonly tierSprites: Record<JackpotTier, PixSprite>;
  private state: IconState = 'closed';
  private isHovering: boolean = false;
  private isActive: boolean = true;
  private jackpotData: JackpotTier;
  private revealedTier: JackpotTier | null = null;
  private winTween: gsap.core.Tween | null = null;
  private slotSprite: PixSprite | null = null;
  private readonly syncSlotSprite = (): void => this.updateSlotSpriteTransform();

  constructor(config) {
    super(config);
    this.jackpotSym = this.elementsList['jackpotIcon'];
    this.grand = this.elementsList['Grand'];
    this.major = this.elementsList['Major'];
    this.minor = this.elementsList['Minor'];
    this.mini = this.elementsList['Mini'];
    this.tierSprites = {
      grand: this.grand,
      major: this.major,
      minor: this.minor,
      mini: this.mini,
    };

    this.grand.visible = false;
    this.major.visible = false;
    this.minor.visible = false;
    this.mini.visible = false;

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
    this.emit(PICK_ICON_EVENT.SELECTED, this);
    this.revealJackpot(this.jackpotData);
  }

  private canInteract(): boolean {
    return this.isActive && this.state === 'closed';
  }

  private playIdle(): void {
    if (this.state !== 'closed' && this.state !== 'disabled') return;
    this.jackpotSym.playAnimation({ state: ANIM.IDLE, loop: true });
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

  private revealJackpot(tier: JackpotTier): void {
    if (this.state !== 'closed') return;

    this.state = 'opening';
    this.isActive = false;
    const flipAnim = FLIP_ANIM_BY_TIER[tier];

    this.revealedTier = tier;

    const sprite = this.tierSprites[tier];
    sprite.visible = true;
    this.attachSpriteToSlot(TEXT_SLOT_NAME, sprite);

    this.jackpotSym.playAnimation({ state: flipAnim, loop: false });
    const listener = this.jackpotSym.addEventListener('complete', () => {
      this.jackpotSym.removeSpineEvent(listener);
      this.onFlipComplete(tier);
    });
  }

  private onFlipComplete(tier: JackpotTier): void {
    this.state = 'open';
    this.emit(PICK_ICON_EVENT.REVEAL_COMPLETE, this, tier);
  }

  private setInteractive(value: boolean): void {
    this.isActive = value;
    if (!value) {
      this.jackpotSym.playAnimation({ state: ANIM.IDLE, loop: true });
    }
  }

  public disable(): void {
    this.state = 'disabled';
    this.isActive = false;
    this.isHovering = false;
    this.eventMode = 'none';
    this.cursor = 'default';
    this.playIdle();
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

    if (this.revealedTier) {
      const sprite = this.tierSprites[this.revealedTier];
      this.detachSpriteFromSlot(sprite);
      sprite.visible = false;
      this.revealedTier = null;
    }

    this.state = 'closed';
    this.isActive = true;
    this.isHovering = false;
    this.jackpotData = undefined;
    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.jackpotSym.stopAnimation();
    this.playIdle();
  }

  private getSpineSkeleton(): any {
    return (this.jackpotSym as any)?.spineAnim?.skeleton ?? null;
  }

  private attachSpriteToSlot(slotName: string, sprite: PixSprite): void {
    const skeleton = this.getSpineSkeleton();
    if (!skeleton) {
      console.warn('attachSpriteToSlot: spine skeleton not available');
      return;
    }

    const slot = skeleton.findSlot(slotName);
    if (!slot) {
      console.warn(`attachSpriteToSlot: slot "${slotName}" not found`);
      return;
    }

    if (!sprite.parent) {
      this.addChild(sprite as any);
    }

    this.slotSprite = sprite;
    this.updateSlotSpriteTransform();
    Ticker.shared.add(this.syncSlotSprite);
  }

  private detachSpriteFromSlot(sprite: PixSprite): void {
    if (this.slotSprite === sprite) {
      Ticker.shared.remove(this.syncSlotSprite);
      this.slotSprite = null;
    }
    if (sprite.parent) {
      sprite.parent.removeChild(sprite as any);
    }
  }

  private updateSlotSpriteTransform(): void {
    if (!this.slotSprite) return;

    const skeleton = this.getSpineSkeleton();
    const slot = skeleton?.findSlot(TEXT_SLOT_NAME);
    const bone = slot?.bone;
    if (!bone) return;

    this.slotSprite.x = bone.worldX;
    this.slotSprite.y = bone.worldY;
    this.slotSprite.rotation = Math.atan2(bone.c, bone.a);
    this.slotSprite.scale.set(
      Math.sqrt(bone.a * bone.a + bone.c * bone.c),
      Math.sqrt(bone.b * bone.b + bone.d * bone.d),
    );
  }
}
