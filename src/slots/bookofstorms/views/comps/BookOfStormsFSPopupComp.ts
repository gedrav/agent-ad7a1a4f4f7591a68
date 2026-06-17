import { FSPopupComp } from '@brand/views/popups/FSPopupComp';
import { BookOpenComp } from '@game/views/comps/BookOpenComp';

export class BookOfStormsFSPopupComp extends FSPopupComp {
  private bookOpenComp: BookOpenComp;

  constructor(config: any) {
    super(config);
    this.bookOpenComp = this.elementsList['bookOpenComp'];
  }
  protected updateMessagePositions(data: any): void {
    if (data.message2 && this.messageText2.visible !== false) {
      this.messageText1.y = 430; // unfinished case
      this.messageText2.text = data.message2;
    } else {
      this.messageText1.y = 495; //normal case

      this.bookOpenComp.playBookAnimation('H1');
    }
  }
}
