import { PixText } from '@core/pixiwrapper/PixText';
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';

export class JackpotComp extends ResponsiveChildrenView {
  private readonly valueText: PixText;
  constructor(config) {
    super(config);
  }
  protected resizeView() {
    super.resizeView();
  }
}
