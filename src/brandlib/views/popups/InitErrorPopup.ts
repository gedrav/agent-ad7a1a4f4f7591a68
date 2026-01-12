import { ResponsesiveChildrenView } from '@core/pixiwrapper/ResponsesiveChildrenView';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';

export class InitErrorPopup extends ResponsesiveChildrenView {
  private refreshBtn: PixFancyButton;

  constructor(config: any) {
    super(config);
    this.refreshBtn = this.elementsList['popupCont'].elementsList['refreshBtn'];
  }

  public showMessage(str: string) {
    this.elementsList['popupCont'].elementsList['errorText'].text = str ? str : '';
  }
}
