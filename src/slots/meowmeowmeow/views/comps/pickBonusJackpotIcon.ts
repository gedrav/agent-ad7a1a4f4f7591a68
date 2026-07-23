import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';

type IconState = 'closed' | 'opening' | 'open';

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
    if (this.state !== 'closed') return;
    this.jackpotSym.playAnimation({ state: ANIM.IDLE, loop: true });
  }

  private playHover(): void {
    if (this.state !== 'closed') return;
    this.jackpotSym.playAnimation({ state: ANIM.HOVER, loop: true });
  }

  public setjackpotData(data: JackpotTier): void {
    this.jackpotData = data;
  }

  private revealJackpot(tier: JackpotTier): void {
    if (this.state !== 'closed') return;

    this.state = 'opening';
    this.isActive = false;
    const flipAnim = FLIP_ANIM_BY_TIER[tier];
    this.tierSprites[tier].visible = true;
    this.revealedTier = tier;
    // this.jackpotSym.addObjectToSlot('Text', this.tierSprites[tier])
    this.jackpotSym.playAnimation({ state: flipAnim, loop: false });
    this.onFlipComplete(tier);
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

  public reset(): void {
    if (this.revealedTier) {
      //     const sprite = this.tierSprites[this.revealedTier];
      //     if (sprite) {
      //         // this.jackpotSym.removeObjectFromSlot('Text', sprite);
      //         sprite.visible = false;
      this.tierSprites[this.revealedTier].visible = false;
      //     }
      this.revealedTier = null;
    }
    this.state = 'closed';
    this.isActive = true;
    this.isHovering = false;
    this.jackpotData = undefined;
    this.jackpotSym.stopAnimation();
    this.playIdle();
  }
}
