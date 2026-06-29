import { ResponsiveView } from '@core/pixiwrapper/ResponsiveView';
import { PixText } from '@core/pixiwrapper/PixText';

export class BrandNameComp extends ResponsiveView {
  private readonly clockText: PixText;
  constructor(configData: any) {
    super(configData);
  }
}
