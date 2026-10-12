import { FSPopupComp } from '@brand/views/popups/FSPopupComp';

export class GameFSPopupComp extends FSPopupComp {
  constructor(config: any) {
    super(config);
  }

  protected updateMessagePositions(data: any): void {
    if (data.message2 && this.messageText2.visible !== false) {
      this.messageText2.text = data.message2;
    }
  }
}
