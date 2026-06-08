import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { PixText } from '@core/pixiwrapper/PixText';
import { UIUtil } from '@core/utils/UIUtilService';
import { Util } from '@core/utils/UtilService';

export class InitErrorPopup extends ResponsiveChildrenView {
  private refreshBtn: PixFancyButton;
  private errorText: PixText;
  private bg: any;
  private codeText: PixText;

  constructor(config: any) {
    super(config);
    this.visible = false;
    this.errorText = this.elementsList['popupCont'].elementsList['errorText'];
    this.refreshBtn = this.elementsList['popupCont'].elementsList['refreshBtn'];
    this.codeText = this.elementsList['popupCont'].elementsList['codeText'];
    this.bg = this.elementsList['popupCont'].elementsList['bg'];
  }

  public showMessage(str: string, code: string = '') {
    this.errorText.text = str ? str : '';
    UIUtil.updateWordWrapWidth(this.errorText, this.bg.width * 0.88);
    this.codeText.text = code ? Util.getContent('codeTextTitle') + code.toString() : '';

    setTimeout(() => {
      this.visible = true;
      this.errorText.text = str ? str + ' ' : '';
    }, 500);
  }
}
