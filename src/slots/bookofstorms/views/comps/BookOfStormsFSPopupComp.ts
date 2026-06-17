import { FSPopupComp } from '@brand/views/popups/FSPopupComp';
import { BookOpenComp } from '@game/views/comps/BookOpenComp';
import { appModel } from '@core/models/services/AppModelService';

export class BookOfStormsFSPopupComp extends FSPopupComp {
  private bookOpenComp: BookOpenComp;

  constructor(config: any) {
    super(config);
    this.bookOpenComp = this.elementsList['bookOpenComp'];
  }
  protected updateMessagePositions(data: any): void {
    const symbol = appModel.featureResult?.bookSymbol;

    if (data.message2 && this.messageText2.visible !== false) {
      this.messageText2.text = data.message2;
    }

    this.bookOpenComp.cleanBookComp();
    this.bookOpenComp.playBookAnimation(symbol);
  }

  protected async onCloseClicked() {
    this.bookOpenComp.cleanBookComp();
    super.onCloseClicked();
  }
}
