import { FSPopupComp } from '@brand/views/popups/FSPopupComp';
import { BookOpenComp } from '@game/views/comps/BookOpenComp';
import { appModel } from '@core/models/services/AppModelService';
import { PixNineSpliceSprite } from '@core/pixiwrapper/PixNineSpliceSprite';
import { PixText } from '@core/pixiwrapper/PixText';
import { UIUtil } from '@core/utils/UIUtilService';

export class BookOfStormsFSPopupComp extends FSPopupComp {
  private bookOpenComp: BookOpenComp;
  private popupbg: PixNineSpliceSprite;
  private expandingSymbolText: PixText;

  constructor(config: any) {
    super(config);
    this.bookOpenComp = this.elementsList['bookOpenComp'];
    this.popupbg = this.elementsList['popupbg'];
    this.expandingSymbolText = this.elementsList['expandingSymbolText'];
    this.bookOpenComp.on('BOOK_ANIMATION_COMPLETE', this.onBookAnimationComplete.bind(this));
  }

  protected updateMessagePositions(data: any): void {
    const symbol = appModel.featureResult?.bookSymbol || 'H2';

    if (data.message2 && this.messageText2.visible !== false) {
      this.messageText2.text = data.message2;
    }

    if (data.entryPopUp) {
      this.okBtn.enabled = false;

      this.popupbg.height = 1200;
      this.bookOpenComp.visible = true;
      this.bookOpenComp.cleanBookComp();
      this.bookOpenComp.playBookAnimation(symbol);

      // positions for expanded popup
      this.messageText1.y = 270;
      this.expandingSymbolText.y = 743;
      this.messageText2.y = 842;
      this.okBtn.y = 994;
    } else {
      this.okBtn.enabled = true;

      this.popupbg.height = 900;
      this.bookOpenComp.visible = false;

      this.titleText.y = 322;
      this.messageText1.y = 535;
      UIUtil.updateWordWrapWidth(this.messageText1, 800);
      this.expandingSymbolText.visible = false;
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
