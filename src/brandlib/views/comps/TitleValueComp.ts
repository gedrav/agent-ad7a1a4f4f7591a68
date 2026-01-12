import { PixText } from '@core/pixiwrapper/PixText';
import { ResponsesiveView } from '@core/pixiwrapper/ResponsesiveView';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';

export class TitleValueComp extends ResponsesiveView {
  private valueText: PixText;
  constructor(config) {
    super(config);
    this.valueText = this.elementsList['valueText'];
  }

  updateValue(value: string) {
    this.valueText.text = value;
  }
  animateValue(): void {
    this.valueText.scale.set(1, 1);
    AnimationProxy.killTweensOf(this.valueText);
  }

  protected onAnimComplete(): void {
    this.valueText.scale.set(1, 1);
  }
}
