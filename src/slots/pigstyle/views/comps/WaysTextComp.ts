import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { PixBMPText } from '@core/pixiwrapper/PixBMPText';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';

export class WaysTextComp extends ResponsiveChildrenView {
  private readonly countText: PixBMPText;

  constructor(configData: any) {
    super(configData);
    this.countText = this.elementsList['megawaysCountText'];

    EventHandler.addEventListener('WAYS_COUNT_UPDATE', this.onWaysCountUpdate.bind(this));
    EventHandler.addEventListener('WAYS_COUNT_RESET', this.onWaysCountReset.bind(this));
  }

  private onWaysCountUpdate(ways: number): void {
    this.countText.text = String(ways);
  }

  private onWaysCountReset(): void {
    this.countText.text = '';
  }
}
