import { StandardView } from '@core/pixiwrapper/StandardView';
import { ResponsesiveChildrenView } from '@core/pixiwrapper/ResponsesiveChildrenView';

export class FsTotalMultiplierComp extends ResponsesiveChildrenView {
  private totalMultiplierCount: number = 0;

  constructor(config) {
    super(config);
  }
}
