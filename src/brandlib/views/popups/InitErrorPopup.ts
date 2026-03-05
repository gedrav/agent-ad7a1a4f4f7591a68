import { ResponsesiveChildrenView } from '@core/pixiwrapper/ResponsesiveChildrenView';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { PixText } from '@core/pixiwrapper/PixText';
import { UIUtil } from '@core/utils/UIUtilService';

export class InitErrorPopup extends ResponsesiveChildrenView {
  private refreshBtn: PixFancyButton;
  private errorText: PixText;
  private bg: any;

  constructor(config: any) {
    super(config);
    this.visible = false;
    this.errorText = this.elementsList['popupCont'].elementsList['errorText'];
    this.refreshBtn = this.elementsList['popupCont'].elementsList['refreshBtn'];
    this.bg = this.elementsList['popupCont'].elementsList['bg'];
  }

  public showMessage(str: string) {
    this.errorText.text = str ? str : '';
    UIUtil.updateWordWrapWidth(this.errorText, this.bg.width * 0.88);
    setTimeout(() => {
      this.visible = true;
      this.errorText.text = str ? str + ' ' : '';
    }, 500);
  }
}
