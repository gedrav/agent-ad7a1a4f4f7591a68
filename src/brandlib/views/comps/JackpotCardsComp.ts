import { PixView } from '@core/pixiwrapper/PixView';
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { JackpotCard } from './JackpotCard';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';

const skinsName = {
  BRONZE: 'bronze',
  DIAMOND: 'diamond',
  GOLD: 'gold',
  SILVER: 'silver',
};

// dummy server response, one entry per card - replace with the real payload
const dummyArray = [
  'BRONZE',
  'SILVER',
  'DIAMOND',
  'SILVER',
  'GOLD',
  'BRONZE',
  'SILVER',
  'DIAMOND',
  'BRONZE',
  'GOLD',
  'SILVER',
  'DIAMOND',
];

export class JackpotCardsComp extends ResponsiveChildrenView {
  cardsContainer: PixView;
  cardsConfig: any;
  cardArray: JackpotCard[] = [];
  cardClickCount: number;
  constructor(config) {
    super(config);
    this.cardClickCount = 0;
    this.cardsConfig = this.configData.cardsConfig;
    this.cardsContainer = this.elementsList['cardsContainer'];
    this.createCards();
    this.cardsContainer.visible = false;
    EventHandler.addEventListener(SlotEvents.SHOW_JACKPOT_CARD_GAME, this.showJackPotCard.bind(this));
    EventHandler.addEventListener(SlotEvents.HIDE_JACKPOT_BG, this.hideJPCards.bind(this));
  }
  hideJPCards() {
    this.resetCards();
    this.cardsContainer.visible = false;
  }
  onCardClick() {
    this.cardClickCount++;
    if (dummyArray.length === this.cardClickCount) {
      this.cardClickCount = 0;
      StateManager.doNextStep();
    }
  }
  protected showJackPotCard() {
    this.updateCards();
    this.cardsContainer.visible = true;
  }
  protected createCards() {
    // card count never changes, only how many of them fit in a row
    const total = this.cardsConfig.maxcCol * this.cardsConfig.maxRow;

    for (let i = 0; i < total; i++) {
      const card = new JackpotCard(this.cardsConfig.cardConfig);
      this.cardsContainer.addChild(card);
      this.cardArray.push(card);
      card.on('onCardClick', this.onCardClick.bind(this));
    }
    this.layoutCards(this.cardsConfig.maxcCol);
  }
  updateCards(cardData: string[] = dummyArray) {
    this.cardArray.forEach((card, index) => {
      card.onSkinChange(skinsName[cardData[index]]); //show dummy cards
    });
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
