import { StandardView } from '@core/pixiwrapper/StandardView';
import { UIUtil } from '@core/utils/UIUtilService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { GlowFilter } from 'pixi-filters';
import { GameProxy } from '@core/models/GameConfigProxy';
import { PixSprite } from '@core/pixiwrapper/PixSprite';

export class MultiComp extends StandardView {
  private multi: PixSprite;
  private glowSprite: PixSprite;

  constructor(config: any) {
    super(config);

    this.multi = this.elementsList['multi'];
    this.addScreenshotFeature();
    this.showInactiveState();
  }

  public showInactiveState(): void {
    this.alpha = 0.65;
    this.glowSprite.visible = false;
  }

  public showHighlight(): void {
    this.alpha = 1;
    this.glowSprite.visible = true;
    this.glowSprite.alpha = 0;
    this.glowSprite.scale.set(1, 1);
    AnimationProxy.animateTween(this.glowSprite, { duration: 0.5, alpha: 1, yoyo: true, repeat: -1 });
  }

  private addScreenshotFeature(): void {
    const glowFilter = new GlowFilter({
      distance: 40,
      outerStrength: 2,
      color: 0xff0000,
      quality: 0.5,
    });
    this.glowSprite = UIUtil.getGlowInstance(this.multi, glowFilter);
    if (this.glowSprite) {
      this.glowSprite.anchor.set(0.5, 0.5);
      this.glowSprite.x = this.multi.x;
      this.glowSprite.y = this.multi.y;
      this.addChild(this.glowSprite);
      this.glowSprite.visible = false;
    }
  }
}
