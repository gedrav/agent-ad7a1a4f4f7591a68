import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { JPItemComp } from '@slots/meowmeowmeow/views/comps/JPItemComp';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';
import { StandardView } from '@core/pixiwrapper/StandardView';

export class JPBannerAnimComp extends StandardView {
  constructor(config: any) {
    super(config);
  }
}
