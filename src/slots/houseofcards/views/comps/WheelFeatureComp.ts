import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';

export class WheelFeatureComp extends ResponsiveChildrenView {
  private readonly backAnim: any;
  constructor(config: any) {
    super(config);
    this.backAnim = this.elementsList['backAnim'];

    // this.backAnim.playAnimation({ state: this.backAnim.configData.defaultState, loop: true });
    this.visible = false;
  }
}
