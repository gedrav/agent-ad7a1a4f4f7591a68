import { ResponsiveView } from '@core/pixiwrapper/ResponsiveView';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { JCEvents } from '@slots/temp/events/JCEvents';
import { TOTAL_RESPINS } from '@slots/temp/models/JCRespinState';
export class RespinCounterComp extends ResponsiveView {
  private readonly lightBgs: PixSprite[];
  private readonly darkBgs: PixSprite[];

  constructor(configData: any) {
    super(configData);
    this.lightBgs = [this.elementsList['light1'], this.elementsList['light2'], this.elementsList['light3']];
    this.darkBgs = [this.elementsList['dark1'], this.elementsList['dark2'], this.elementsList['dark3']];
    this.setRemainingRespins(TOTAL_RESPINS);
    EventHandler.addEventListener(JCEvents.UPDATE_RESPIN_COUNTER, this.setRemainingRespins.bind(this));
  }
  public setRemainingRespins(remaining: number): void {
    for (let i = 0; i < TOTAL_RESPINS; i++) {
      const isLight = i + 1 <= remaining;
      this.lightBgs[i].visible = isLight;
      this.darkBgs[i].visible = !isLight;
    }
  }
}
