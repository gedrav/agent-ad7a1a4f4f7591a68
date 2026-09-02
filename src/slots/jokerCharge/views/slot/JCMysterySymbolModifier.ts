import { Container } from 'pixi.js';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { UIUtil } from '@core/utils/UIUtilService';

const FRONT_SPINE_NAME = 'mystery_front';

// mystery / mystery jackpot render as two spines played together: ReelSymbolSpine already
// creates the "mystery_back" layer (configData.data.spineName), this handles the extra
// "mystery_front" layer on top of it. Not pooled via SpinePool - that pool keys entries by
// symbol name, and mixing a back-layer and front-layer spine under the same name would
// hand out the wrong skeleton on reuse.
export class JCMysterySymbolModifier {
  private frontSpine: PixSpine | null = null;

  constructor(private readonly host: Container) {}

  public create(animScale?: number): void {
    this.destroy();
    this.frontSpine = UIUtil.getSpineAnim(FRONT_SPINE_NAME, { spineName: FRONT_SPINE_NAME });
    this.frontSpine.stopAnimation();
    if (animScale) {
      this.frontSpine.scale.set(animScale);
    }
    this.host.addChild(this.frontSpine);
    this.setVisible(false);
  }

  public play(state: string, loop: boolean, skin?: string): void {
    if (!this.frontSpine) return;
    if (skin) {
      this.frontSpine.setSkin(skin);
    }
    this.frontSpine.playAnimation({ state, loop });
  }

  public setVisible(flag: boolean): void {
    if (this.frontSpine) {
      this.frontSpine.visible = flag;
    }
  }

  public destroy(): void {
    if (!this.frontSpine) return;
    this.frontSpine.stopAnimation();
    this.frontSpine.removeEventListners();
    this.frontSpine.destroySpine();
    this.frontSpine = null;
  }
}
