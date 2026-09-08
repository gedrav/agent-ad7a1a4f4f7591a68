import { FSPopupComp } from '@brand/views/popups/FSPopupComp';
import { BookOpenComp } from '@game/views/comps/BookOpenComp';
import { appModel } from '@core/models/services/AppModelService';
import { PixNineSpliceSprite } from '@core/pixiwrapper/PixNineSpliceSprite';
import { PixText } from '@core/pixiwrapper/PixText';
import { UIUtil } from '@core/utils/UIUtilService';

export class MinedashFSPopupComp extends FSPopupComp {
  private readonly bookOpenComp: BookOpenComp;
  private readonly popupbg: PixNineSpliceSprite;
  private readonly expandingSymbolText: PixText;

  constructor(config: any) {
    super(config);
    this.bookOpenComp = this.elementsList['bookOpenComp'];
    this.popupbg = this.elementsList['popupbg'];
    this.expandingSymbolText = this.elementsList['expandingSymbolText'];
    if (this.bookOpenComp) {
      this.bookOpenComp.on('BOOK_ANIMATION_COMPLETE', this.onBookAnimationComplete.bind(this));
    }
  }

  protected updateMessagePositions(data: any): void {
    const symbol = appModel.featureResult?.bookSymbol || 'H2';

    if (data.message2 && this.messageText2.visible !== false) {
      this.messageText2.text = data.message2;
    }

    if (data.entryPopUp) {
      if (this.bookOpenComp) {
        this.okBtn.enabled = false;
        this.bookOpenComp.visible = true;
        this.bookOpenComp.cleanBookComp();
        this.bookOpenComp.playBookAnimation(symbol);
      } else {
        this.okBtn.enabled = true;
      }

      if (this.popupbg) this.popupbg.height = 1200;
      if (this.expandingSymbolText) this.expandingSymbolText.visible = true;

      // positions for expanded popup
      this.messageText1.y = 270;
      if (this.expandingSymbolText) this.expandingSymbolText.y = 730;
      this.messageText2.y = 842;
      this.okBtn.y = 994;

      //positioning when there is no message2
      if (!data.message2) {
        if (this.popupbg) this.popupbg.height = 1150;

        this.titleText.y = 200;
        this.messageText1.y = 317;
        if (this.bookOpenComp) this.bookOpenComp.y = -29;
        if (this.expandingSymbolText) this.expandingSymbolText.y = 805;
        this.okBtn.y = 969;
      }
    } else {
      this.okBtn.enabled = true;

      if (this.popupbg) this.popupbg.height = 900;
      if (this.bookOpenComp) this.bookOpenComp.visible = false;

      this.titleText.y = 322;
      this.messageText1.y = 535;
      UIUtil.updateWordWrapWidth(this.messageText1, 790);
      if (this.expandingSymbolText) this.expandingSymbolText.visible = false;
      this.okBtn.y = 842;
    }
  }

  private onBookAnimationComplete(): void {
    this.okBtn.enabled = true;
  }

  protected async onCloseClicked() {
    if (this.bookOpenComp.visible) {
      this.bookOpenComp.cleanBookComp();
    }
    super.onCloseClicked();
  }
}
