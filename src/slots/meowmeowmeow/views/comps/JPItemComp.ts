import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { StandardView } from '@core/pixiwrapper/StandardView';
import { PixText } from '@core/pixiwrapper/PixText';
import { PixSprite } from '@core/pixiwrapper/PixSprite';

export class JPItemComp extends StandardView {
  private readonly valueText: PixText;
  private readonly titleImage: PixSprite;

  constructor(config: any) {
    super(config);
    this.valueText = this.elementsList['value'];
    this.titleImage = this.elementsList['title'];
  }

  public updateJPValue(value: string): void {
    this.valueText.text = value;
    this.valueText.scale.set(1);
    if (this.valueText.width >= this.titleImage.width) {
      this.valueText.scale.set((this.titleImage.width * 0.9) / this.valueText.width);
    }
  }
}
