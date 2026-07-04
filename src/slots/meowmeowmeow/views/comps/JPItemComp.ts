import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { StandardView } from '@core/pixiwrapper/StandardView';
import { PixText } from '@core/pixiwrapper/PixText';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { PixSpine } from '@core/pixiwrapper/PixSpine';

export class JPItemComp extends StandardView {
  private readonly valueText: PixText;
  private readonly titleImage: PixSprite;
  private readonly bg: PixSpine;

  constructor(config: any) {
    super(config);
    this.valueText = this.elementsList['value'];
    this.titleImage = this.elementsList['title'];
    this.bg = this.elementsList['bg'];
  }

  public updateJPValue(value: string): void {
    this.valueText.text = value;
    this.valueText.scale.set(1);
    if (this.valueText.width >= this.titleImage.width) {
      this.valueText.scale.set((this.titleImage.width * 0.9) / this.valueText.width);
    }
  }
  public showIdle(): void {
    this.bg.playAnimation({ state: this.bg.configData.idleState, loop: false });
  }
  public showWin(): void {
    this.bg.playAnimation({ state: this.bg.configData.winState, loop: false });
  }
  public stopAnimation(): void {
    this.bg.stopAnimation();
  }
}
