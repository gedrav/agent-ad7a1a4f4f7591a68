import { Container } from 'pixi.js';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { UIUtil } from '@core/utils/UIUtilService';

const FRONT_SPINE_NAME = 'mystery_front';

// mystery / mystery jackpot render as two spines: ReelSymbolSpine creates the "mystery_back"
// layer, this adds "mystery_front" on top. Not pooled via SpinePool - that pool keys by symbol
// name, and mixing back/front spines under the same name would hand out the wrong skeleton on reuse.
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
