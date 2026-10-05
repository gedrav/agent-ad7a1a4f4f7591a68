import { FSPopupComp } from '@brand/views/popups/FSPopupComp';
import { UIUtil } from '@core/utils/UIUtilService';

export class HOCFSPopupComp extends FSPopupComp {
  protected updateMessagePositions(data: any): void {
    const positions = this.configData.messagePositions;

    if (data.message2 && this.messageText2.visible !== false) {
      this.messageText2.text = data.message2;
    }

    if (data.entryPopUp) {
      if (!data.message2) {
        const { messageText1Y } = positions.entryWithoutMessage2;
        this.messageText1.y = messageText1Y;
      } else {
        const { messageText1Y, messageText2Y } = positions.entryWithMessage2;
        this.messageText1.y = messageText1Y;
        this.messageText2.y = messageText2Y;
      }
    } else {
      const { messageText1Y, messageText1WordWrapWidth } = positions.default;
      this.messageText1.y = messageText1Y;
      UIUtil.updateWordWrapWidth(this.messageText1, messageText1WordWrapWidth);
    }
  }
}
