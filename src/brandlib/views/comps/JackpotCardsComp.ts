import { PixView } from '@core/pixiwrapper/PixView';
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { JackpotCard } from './JackpotCard';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { appModel } from '@core/models/services/AppModelService';
import { MessageProxy } from '@brand/models/MessageServiceProxy';
import { IJackpotPick, IJackpotRound, JACKPOT_SKINS, JACKPOT_TIERS, JackpotTier } from '@core/models/jackpot.types';

const REVEAL_HOLD_MS = 1500;
const OPEN_FALLBACK_MS = 3000;

export class JackpotCardsComp extends ResponsiveChildrenView {
  cardsContainer: PixView;
  cardsConfig: any;
  cardArray: JackpotCard[] = [];
  protected pickInFlight = false;
  protected expectedOpenPosition: number | null = null;
  protected revealFinished = false;
  protected openFallbackId: number;
  protected finishTimeoutId: number;
  constructor(config) {
    super(config);
    this.cardsConfig = this.configData.cardsConfig;
    this.cardsContainer = this.elementsList['cardsContainer'];
    this.createCards();
    this.cardsContainer.visible = false;
    EventHandler.addEventListener(SlotEvents.SHOW_JACKPOT_CARD_GAME, this.showJackPotCard.bind(this));
    EventHandler.addEventListener(SlotEvents.HIDE_JACKPOT_BG, this.hideJPCards.bind(this));
    EventHandler.addEventListener(SlotEvents.JACKPOT_PICK_RESULT, this.onPickResult.bind(this));
    EventHandler.addEventListener(SlotEvents.HANDLE_SERVER_ERROR, this.onServerError.bind(this));
  }
  hideJPCards() {
    EventHandler.dispatchEvent('STOP_JACKPOT_BGM');
    EventHandler.dispatchEvent('RESUME_BG_SOUND');
    clearTimeout(this.finishTimeoutId);
    this.pickInFlight = false;
    this.clearOpenWait();
    this.revealFinished = false;
    this.resetCards();
    this.cardsContainer.visible = false;
  }
  protected onCardPressed(index: number) {
    if (this.pickInFlight || !appModel.jackpotRound || appModel.jackpotRound.status === 'COMPLETED') return;
    this.pickInFlight = true;
    this.setAllLocked(true);
    MessageProxy.requestJackpotPick(index);
  }
  protected onCardOpened() {
    if (this.finishAfterOpen) {
      this.clearOpenWait();
      this.revealFinished = false;
      this.finishReveal();
    }
  }
  protected onServerError() {
    if (!this.pickInFlight) return;
    this.pickInFlight = false;
    this.setAllLocked(false);
  }
  protected onPickResult(round: IJackpotRound) {
    if (!round) {
      this.pickInFlight = false;
      this.setAllLocked(false);
      return;
    }
    this.pickInFlight = false;
    const pick = round.pick;
    round.picks.forEach((p) => {
      if (p.position !== pick?.position) this.cardArray[p.position]?.openStatic(this.skinOf(p.tier));
    });
    const pickedCard = pick ? this.cardArray[pick.position] : null;
    const animatePick = !!pickedCard?.isClosed();
    if (round.status !== 'COMPLETED') {
      if (animatePick) pickedCard.openAnimated(this.skinOf(pick.tier));
      this.setAllLocked(false);
      return;
    }
    this.setAllLocked(true);
    if (animatePick) {
      this.expectedOpenPosition = pick.position;
      this.openFallbackId = window.setTimeout(() => {
        this.clearOpenWait();
        this.finishReveal();
      }, OPEN_FALLBACK_MS);
      pickedCard.openAnimated(this.skinOf(pick.tier));
    } else {
      this.finishReveal();
    }
  }
  protected finishReveal() {
    const round = appModel.jackpotRound;
    if (!round || this.revealFinished) return;
    this.revealFinished = true;
    const rest = round.remaining ?? [];
    rest.forEach((p) => this.cardArray[p.position]?.openStatic(this.skinOf(p.tier)));
    const winning = [...round.picks, ...rest].filter((p) => p.tier === round.wonTier).map((p) => p.position);
    this.highlightWinning(winning);
    clearTimeout(this.finishTimeoutId);
    this.finishTimeoutId = window.setTimeout(() => StateManager.doNextStep(), REVEAL_HOLD_MS);
  }
  /** Hook for the FE team: mark the cards of the won tier. */
  protected highlightWinning(positions: number[]) {}
  protected skinOf(tier: JackpotTier): string {
    return JACKPOT_SKINS[JACKPOT_TIERS.indexOf(tier)];
  }
  protected setAllLocked(locked: boolean) {
    this.cardArray.forEach((card) => card.setLocked(locked));
  }
  protected showJackPotCard() {
    EventHandler.dispatchEvent('STOP_BG_SOUND');
    EventHandler.dispatchEvent('PLAY_JACKPOT_BGM');
    this.resetCards();
    this.pickInFlight = false;
    this.clearOpenWait();
    this.revealFinished = false;
    appModel.jackpotRound?.picks.forEach((p: IJackpotPick) =>
      this.cardArray[p.position]?.openStatic(this.skinOf(p.tier)),
    );
    this.cardsContainer.visible = true;
  }
  protected createCards() {
    // card count never changes, only how many of them fit in a row
    const total = this.cardsConfig.maxcCol * this.cardsConfig.maxRow;

    for (let i = 0; i < total; i++) {
      const card = new JackpotCard(this.cardsConfig.cardConfig);
      this.cardsContainer.addChild(card);
      this.cardArray.push(card);
      card.on('onCardPressed', () => this.onCardPressed(i));
      card.on('onCardOpened', () => this.onCardOpened(i));
    }
    this.layoutCards(this.cardsConfig.maxcCol);
  }
  resetCards() {
    this.cardArray.forEach((card) => {
      card.reset();
    });
  }

  /** Cards sit side by side; once `col` of them fill a row the rest wrap below. */
  protected layoutCards(col: number): void {
    const rowGap = this.cardsConfig.rowGap;
    const colGap = this.cardsConfig.colGap;
    const cardWidth = this.cardsConfig.cardWidth;
    const cardHeight = this.cardsConfig.cardHeight;

    this.cardArray.forEach((card, index) => {
      card.x = (index % col) * (cardWidth + colGap);
      card.y = Math.floor(index / col) * (cardHeight + rowGap);
    });
  }
  protected resizeView(): void {
    super.resizeView();
    // desktop keeps the layout it was built with; only devices reflow on orientation
    if (DeviceProxy.isDevice()) {
      const col = DeviceProxy.config.isPortrait ? this.cardsConfig.pCol : this.cardsConfig.maxcCol;
      this.layoutCards(col);
    }
  }
}
