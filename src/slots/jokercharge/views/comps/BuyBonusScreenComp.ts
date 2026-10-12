import { Rectangle } from 'pixi.js';
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { appModel } from '@core/models/services/AppModelService';
import { GameProxy } from '@core/models/GameConfigProxy';
import { BuyBonusConfirmedCommand } from '@core/commands/action/BuyBonusConfirmedCommand';
import { getFullBets, holdBet, releaseHeldBet } from '@slots/jokercharge/models/JCBetsState';
import { Util } from '@core/utils/UtilService';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { PixText } from '@core/pixiwrapper/PixText';
import {
  BUY_BONUS_CLOSE_DURATION,
  BUY_BONUS_CLOSE_EASE,
  BUY_BONUS_CONTENT_PIVOT,
  BUY_BONUS_DIM_ALPHA,
  BUY_BONUS_FEATURE_IDS,
  BUY_BONUS_OPEN_DURATION,
  BUY_BONUS_OPEN_EASE,
  BUY_BONUS_START_SCALE,
} from '@slots/jokercharge/config/screens/BuyBonusScreenConfig';
import { JCEvents } from '@slots/jokercharge/events/JCEvents';
import { setupButtonInteraction } from '@slots/jokercharge/views/comps/buttonInteraction';

// The Buy Bonus screen: three cards and a bet selector, over its own dim. Lives at app level (see
// SlotGameAppConfig) so it covers the whole game.
export class BuyBonusScreenComp extends ResponsiveChildrenView {
  private readonly dim: PixGraphics;
  // Typed loosely: UIUtil builds config Containers with an elementsList of their own.
  private readonly content: any;
  private readonly cards: any[] = [];
  private readonly betValue: PixText;
  // Into getFullBets(): the bonus is priced on the backend's whole list, whatever the lines in play,
  // so this has a bet of its own rather than moving the game's.
  private betIndex = 0;

  constructor(config: any) {
    super(config);
    this.visible = false;
    // Modal: swallows taps so nothing behind the dim can be clicked.
    this.eventMode = 'static';
    this.hitArea = new Rectangle(-5000, -5000, 10000, 10000);

    this.dim = this.elementsList['dim'];
    this.content = this.elementsList['content'];
    // Pivot and position together leave the children where the config put them, while giving the
    // group a centre to scale around.
    this.content.pivot.set(BUY_BONUS_CONTENT_PIVOT.x, BUY_BONUS_CONTENT_PIVOT.y);
    this.content.position.set(BUY_BONUS_CONTENT_PIVOT.x, BUY_BONUS_CONTENT_PIVOT.y);

    const betBar = this.content.elementsList['betBar'];
    this.betValue = betBar.elementsList['betValue'];
    setupButtonInteraction(betBar.elementsList['minusBtn'], () => this.changeBet(-1));
    setupButtonInteraction(betBar.elementsList['plusBtn'], () => this.changeBet(1));

    for (let index = 0; index < BUY_BONUS_FEATURE_IDS.length; index++) {
      const card = this.content.elementsList[`card${index}`];
      this.cards.push(card);
      setupButtonInteraction(card.elementsList['buyGroup'], () => this.buy(index));
    }

    setupButtonInteraction(this.content.elementsList['closeBtn'], () => this.hide());
    EventHandler.addEventListener(JCEvents.SHOW_BUY_BONUS_SCREEN, this.show.bind(this));
  }

  public show(): void {
    if (this.visible) return;
    // Opens on the game's bet, a member of the full list too.
    this.betIndex = Math.max(getFullBets().indexOf(appModel.getTotalBet()), 0);
    this.refresh();
    this.visible = true;

    this.dim.alpha = 0;
    this.content.alpha = 0;
    this.content.scale.set(BUY_BONUS_START_SCALE);

    AnimationProxy.animateTween(this.dim, { duration: BUY_BONUS_OPEN_DURATION, alpha: BUY_BONUS_DIM_ALPHA });
    AnimationProxy.animateTween(this.content, { duration: BUY_BONUS_OPEN_DURATION, alpha: 1 });
    AnimationProxy.animateTween(this.content.scale, {
      duration: BUY_BONUS_OPEN_DURATION,
      x: 1,
      y: 1,
      ease: BUY_BONUS_OPEN_EASE,
    });
  }

  public hide(): void {
    if (!this.visible) return;
    AnimationProxy.animateTween(this.dim, { duration: BUY_BONUS_CLOSE_DURATION, alpha: 0 });
    AnimationProxy.animateTween(this.content.scale, {
      duration: BUY_BONUS_CLOSE_DURATION,
      x: BUY_BONUS_START_SCALE,
      y: BUY_BONUS_START_SCALE,
      ease: BUY_BONUS_CLOSE_EASE,
    });
    AnimationProxy.animateTween(this.content, {
      duration: BUY_BONUS_CLOSE_DURATION,
      alpha: 0,
      // Only hidden once it has shrunk away, or the tween would play behind an invisible screen.
      onComplete: () => {
        this.visible = false;
      },
    });
  }

  private getBet(): number {
    return getFullBets()[this.betIndex];
  }

  // Prices follow the bet, at each card's own multiplier from bbBetMultiplierSettings.
  private refresh(): void {
    const bet = this.getBet();
    this.betValue.text = Util.formatCurrencyNoSymbol(bet);
    this.cards.forEach((card, index) => {
      const multiplier = appModel.getBuyBonusMultiplier(BUY_BONUS_FEATURE_IDS[index]);
      card.elementsList['buyGroup'].elementsList['priceText'].text = Util.formatCurrencyNoSymbol(multiplier * bet);
    });
  }

  private changeBet(step: number): void {
    const position = Math.min(Math.max(this.betIndex + step, 0), getFullBets().length - 1);
    if (position === this.betIndex) return;
    this.betIndex = position;
    this.refresh();
  }

  // The same path brandlib's own Buy Bonus popup takes: BuyBonusConfirmedCommand checks the balance
  // covers bet x the card's multiplier (or shows the low-balance popup), then BBSpinStartState copies
  // selectedBB into the request's buyBonus.feature and its multiplier from bbBetMultiplierSettings,
  // so the backend is told which of the three was bought, and spins.
  //
  // corelib reads the bet off appModel for all of that, so this screen's bet is held in play for
  // the bought round - see JCBetsState - and the game's own comes back once it is over. The command
  // checks the held bet, so it goes back only after: when the balance falls short (the command shows
  // its popup) or a jackpot is pending (it does nothing), no round starts to give it back at its end.
  private buy(index: number): void {
    const featureId = BUY_BONUS_FEATURE_IDS[index];
    GameProxy.config.selectedBB = featureId;
    this.hide();
    holdBet(this.getBet());
    const starts = !appModel.jackpotPending && appModel.getIsBBSpinStartPossible(featureId);
    if (starts) EventHandler.dispatchEvent(SlotEvents.UPDATE_TOTALBET);
    BuyBonusConfirmedCommand.execute();
    if (!starts) releaseHeldBet();
  }
}
