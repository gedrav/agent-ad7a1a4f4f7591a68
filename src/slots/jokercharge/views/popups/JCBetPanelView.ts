import { BetPanelView } from '@brand/views/popups/BetPanelView';
import { PixToggleButton } from '@core/pixiwrapper/PixToggleButton';
import { PixText } from '@core/pixiwrapper/PixText';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';
import { JCEvents } from '../../events/JCEvents';

// BetPanelView builds one preset button per bet, once, at start-up - against the full list, before
// the line count first narrows it (see JCBetsState). So the buttons are relabelled for whichever
// bets the lines in play allow, and the ones left over are hidden, rather than ever rebuilt.
export class JCBetPanelView extends BetPanelView {
  constructor(config: any) {
    super(config);
    // After gameApp's own SELECTED_LINES listener, which narrows the list this reads.
    EventHandler.addEventListener(JCEvents.SELECTED_LINES, this.syncBetButtons.bind(this));
  }

  // BetPanelView keeps these private; reached into here rather than copying its button config.
  private syncBetButtons(): void {
    const bets = appModel.getAllBets();
    const buttons: PixToggleButton[] = (this as any).betBtnsArray;
    buttons.forEach((button, index) => {
      const bet = bets[index];
      button.visible = bet !== undefined;
      if (bet === undefined) return;
      button.updateText(Util.formatCurrencyNoSymbol(bet));
      button.setData(bet);
    });
    const minMaxText: PixText = (this as any).minmaxbetText;
    minMaxText.text = Util.parseMessage(Util.getContent('minMaxBetText'), [
      Util.formatCurrency(appModel.getMinBet()),
      Util.formatCurrency(appModel.getMaxBet()),
    ]);
    this.resizeView();
  }
}
