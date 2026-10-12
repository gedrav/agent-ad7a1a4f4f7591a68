import { PixView } from '@core/pixiwrapper/PixView';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { JackpotCard } from './JackpotCard';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { UIUtil } from '@core/utils/UIUtilService';
import { Graphics } from 'pixi.js';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { WinTicker } from '@core/views/comps/WinTicker';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { appModel } from '@core/models/services/AppModelService';
import { MessageProxy } from '@brand/models/MessageServiceProxy';
import { IJackpotPick, IJackpotRound, JACKPOT_SKINS, JACKPOT_TIERS, JackpotTier } from '@core/models/jackpot.types';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { PixText } from '@core/pixiwrapper/PixText';

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
  protected overlayRect: Graphics;
  protected jackpotIntroAnimHor: PixSpine;
  protected jackpotIntroAnimVer: PixSpine;
  protected isJackpotIntroAnim: boolean;
  protected isJackpotOutroAnim: boolean;
  protected isJPSkipping: boolean;
  protected jackPotOutroAnimation: PixSpine;
  protected jackpotWinContainer: PixView;
  protected jpguideRect: PixView;
  protected youwinJPTextimg: PixSprite;
  protected typeOfJPTextimg: PixSprite;
  protected winTickerJP: WinTicker;
  protected timeoutId: number;
  protected cardGuideRect: PixGraphics;
  protected pendingIntroAnim = false;
  private instructionText: PixText;
  private jackpotTextScale: number = 1;
  constructor(config) {
    super(config);
    this.cardsConfig = this.configData.cardsConfig;

    EventHandler.addEventListener(SlotEvents.SHOW_JACKPOT_INTRO_ANIM, this.showJackpotIntroAnim.bind(this));
    EventHandler.addEventListener(SlotEvents.HIDE_JACKPOT_BG, this.hideJPCards.bind(this));
    EventHandler.addEventListener(SlotEvents.JACKPOT_PICK_RESULT, this.onPickResult.bind(this));
    EventHandler.addEventListener(SlotEvents.HANDLE_SERVER_ERROR, this.onServerError.bind(this));
  }

  protected onViewCreated(): void {
    super.onViewCreated();
    this.overlayRect = this.elementsList['overlayRect'];
    this.cardsContainer = this.elementsList['cardsContainer'];
    this.cardGuideRect = this.cardsContainer.elementsList['guideRect'];
    this.instructionText = this.cardsContainer.elementsList['instructionText'];

    this.jackpotIntroAnimHor = this.elementsList['jackpotIntroAnimHor'];
    this.jackpotIntroAnimVer = this.elementsList['jackpotIntroAnimVer'];
    this.jackpotWinContainer = this.elementsList['jackpotWinContainer'];
    this.jpguideRect = this.jackpotWinContainer.elementsList['jpguideRect'];
    this.youwinJPTextimg = this.jackpotWinContainer.elementsList['youwinJPTextimg'];
    this.typeOfJPTextimg = this.jackpotWinContainer.elementsList['typeOfJPTextimg'];
    this.jackPotOutroAnimation = this.jackpotWinContainer.elementsList['jackPotOutroAnimation'];
    this.winTickerJP = this.jackpotWinContainer.elementsList['winTickerJP'];

    this.hideJackpotIntroAnim();

    this.notifyWinDone();
    this.createCards();

    this.cardsContainer.visible = false;
    this.winTickerJP?.on('COUNTUP_COMPLETED', this.onCountUpUpdateBW.bind(this));
    this.winTickerJP?.on('COUNTUP_UPDATE', this.adjustTextSize.bind(this));
    this.jackPotOutroAnimation.addEventListener('complete', this.onJackpotOutroAnimComplete.bind(this));
    this.jackpotIntroAnimHor.addEventListener('complete', this.onIntroAnimComplete.bind(this));

    UIUtil.addInteraction(this.overlayRect, this.onOverlayClicked.bind(this));
    UIUtil.setClickable(this.overlayRect, true);
    this.viewCreated = true;
    if (this.pendingIntroAnim) {
      this.pendingIntroAnim = false;
      this.showJackpotIntroAnim();
    }
  }

  //jackpot win animation functionality
  //click to show final win value
  protected onOverlayClicked() {
    if (this.isJackpotOutroAnim && !this.isJPSkipping) {
      this.isJPSkipping = true;
      this.winTickerJP.skipToFinalValue();
      this.onCountUpUpdateBW();
    }
  }
  public adjustTextSize() {
    this.winTickerJP.scale.set(1);
    if (this.winTickerJP.width > this.jpguideRect.width) {
      this.winTickerJP.width = this.jpguideRect.width * 0.8;
      this.winTickerJP.scale.set(this.winTickerJP.scale.x);
    }
  }
  onCountUpUpdateBW() {
    clearTimeout(this.timeoutId);
    if (DeviceProxy.isDevice && DeviceProxy.config.isPortrait) {
      this.adjustTextSize();
    }
    // this.punchWinTickerJP();
    this.timeoutId = setTimeout(this.notifyWinDone.bind(this), 1000);
  }
  protected punchWinTickerJP() {
    AnimationProxy.killTweensOf(this.winTickerJP);
    const normalScale = this.winTickerJP.scale.x;
    this.winTickerJP.scale.set(normalScale * 1.3);
    AnimationProxy.animateTween(this.winTickerJP, {
      scaleX: normalScale,
      scaleY: normalScale,
      duration: 0.3,
      ease: 'back.out(2)',
    });
  }
  notifyWinDone() {
    this.adjustTextSize();
    this.typeOfJPTextimg.visible = false;
    this.youwinJPTextimg.visible = false;
    AnimationProxy.killTweensOf(this.youwinJPTextimg);
    AnimationProxy.killTweensOf(this.typeOfJPTextimg);
    this.winTickerJP.visible = false;
    AnimationProxy.killTweensOf(this.winTickerJP);
    this.overlayRect.visible = false;

    this.jackPotOutroAnimation.stopAnimation();
    this.jackPotOutroAnimation.renderable = false;
    if (this.isJackpotOutroAnim) {
      this.isJackpotOutroAnim = false;
      StateManager.doNextStep();
    }
  }
  onJackpotOutroAnimComplete(e) {
    if (e.animation.name === 'start_land') {
      this.jackPotOutroAnimation.playAnimation({ state: 'idle_land', loop: true });
    }
  }
  adjustJackpotTextScale() {
    this.typeOfJPTextimg.scale.set(1);
    this.jackpotTextScale = 1;
    if (DeviceProxy.isDevice()) {
      if (DeviceProxy.config.isPortrait) {
        if (this.typeOfJPTextimg.width > this.jpguideRect.width) {
          this.jackpotTextScale = (this.jpguideRect.width * 0.9) / this.typeOfJPTextimg.width;
          this.typeOfJPTextimg.scale.set(this.jackpotTextScale);
        }
      }
    }
  }
  showJackpotWinAnimation() {
    const round = appModel.jackpotRound;
    if (!round) return;

    this.isJackpotOutroAnim = true;
    this.isJPSkipping = false;
    const { amount: winAmount = 0, wonTier } = appModel.jackpotRound;
    this.winTickerJP.reset();
    this.winTickerJP.visible = true;
    this.winTickerJP.countUpValue(winAmount, 5000);
    AnimationProxy.fadeIn(this.overlayRect, 0.2, null, 0.35);
    this.jackPotOutroAnimation.renderable = true;
    this.adjustJackpotTextScale();

    this.youwinJPTextimg.scale.set(0.1);
    this.typeOfJPTextimg.scale.set(0.1);

    this.youwinJPTextimg.visible = true;

    this.typeOfJPTextimg.texture = UIUtil.getTexture(`${this.skinOf(wonTier)}_JP`);
    this.typeOfJPTextimg.visible = true;

    this.showStartAnimation();
    this.jackPotOutroAnimation.playAnimation({ state: 'start_land', loop: false });
  }
  private showStartAnimation() {
    AnimationProxy.animateTween(this.youwinJPTextimg, { scaleX: 1, scaleY: 1, duration: 0.3 });
    AnimationProxy.animateTween(this.typeOfJPTextimg, {
      scaleX: this.jackpotTextScale,
      scaleY: this.jackpotTextScale,
      duration: 0.3,
      onComplete: this.pulseJPWinText.bind(this),
    });
  }
  playIntroAnimations({ state, stateP, loop, timeScale = 1, reset = false }) {
    this.jackpotIntroAnimHor.playAnimation({ state, loop, timeScale, reset });
    this.jackpotIntroAnimVer.playAnimation({ state: stateP, loop, timeScale, reset });
  }
  protected pulseJPWinText() {
    AnimationProxy.killTweensOf(this.youwinJPTextimg);
    this.youwinJPTextimg.scale.set(1);
    AnimationProxy.animateTween(this.youwinJPTextimg, {
      scaleX: 0.9,
      scaleY: 0.9,
      repeat: -1,
      yoyo: true,
      duration: 0.5,
    });

    AnimationProxy.killTweensOf(this.typeOfJPTextimg);
    this.typeOfJPTextimg.scale.set(this.jackpotTextScale);
    AnimationProxy.animateTween(this.typeOfJPTextimg, {
      scaleX: this.jackpotTextScale * 0.9,
      scaleY: this.jackpotTextScale * 0.9,
      repeat: -1,
      yoyo: true,
      duration: 0.5,
    });
  }
  hideJackPotOutroAnim() {
    this.typeOfJPTextimg.visible = false;
    this.youwinJPTextimg.visible = false;
    this.jackPotOutroAnimation.visible = false;
    this.jackPotOutroAnimation.stopAnimation();
    AnimationProxy.killTweensOf(this.youwinJPTextimg);
    AnimationProxy.killTweensOf(this.typeOfJPTextimg);
  }
  onIntroAnimComplete(e) {
    const animationName = e.animation.name;

    switch (animationName) {
      case 'start_land':
        this.playIntroAnimations({ state: 'idle_land', loop: true, stateP: 'idle_port' });
        break;
      case 'idle_land':
        this.playIntroAnimations({ state: 'end_land', loop: false, stateP: 'end_port', timeScale: 1.2 });
        break;
      case 'end_land':
        this.hideJackpotIntroAnim();
        break;
      default:
        break;
    }
  }
  protected hideJackpotIntroAnim() {
    this.jackpotIntroAnimHor.visible = false;
    this.jackpotIntroAnimVer.visible = false;
    this.jackpotIntroAnimHor.stopAnimation();
    this.jackpotIntroAnimVer.stopAnimation();
    if (this.isJackpotIntroAnim) {
      this.isJackpotIntroAnim = false;
      this.showJackPotCard();
    }
  }
  protected showJackpotIntroAnim() {
    if (!this.viewCreated) {
      this.pendingIntroAnim = true;
      return;
    }
    this.pendingIntroAnim = false;
    if (!this.isJackpotIntroAnim) {
      this.isJackpotIntroAnim = true;
      this.jackpotIntroAnimHor.visible = true;
      this.jackpotIntroAnimVer.visible = true;
      this.resizeJackpotWinAnimation();
      this.playIntroAnimations({ state: 'start_land', stateP: 'start_port', loop: false, reset: true });
    }
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
  protected onCardOpened(index: number) {
    if (this.expectedOpenPosition !== index) return;
    this.clearOpenWait();
    this.finishReveal();
  }
  protected clearOpenWait() {
    clearTimeout(this.openFallbackId);
    this.expectedOpenPosition = null;
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
      this.openFallbackId = setTimeout(() => {
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
    const winning = [...round.picks, ...rest].filter((p) => p.tier === round.wonTier).map((p) => p.position);

    rest.forEach((p) => {
      const card = this.cardArray[p.position];
      if (card?.isClosed()) {
        card.openAnimated(this.skinOf(p.tier));
      }
    });
    setTimeout(() => this.highlightWinning(winning), 500);
  }
  /** Hook for the FE team: mark the cards of the won tier. */
  protected highlightWinning(positions: number[]) {
    let pending = 0;
    const onShowWinComplete = () => {
      pending--;
      if (pending === 0) {
        this.showJackpotWinAnimation();
      }
    };
    this.cardArray.forEach((card, index) => {
      if (!positions.includes(index)) {
        card.disableCard();
      } else {
        pending++;
        card.showWin(onShowWinComplete);
      }
    });
    if (pending === 0) {
      clearTimeout(this.finishTimeoutId);
      this.finishTimeoutId = setTimeout(() => StateManager.doNextStep(), REVEAL_HOLD_MS);
    }
  }
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
  /** Single row: items 0 and 2 anchor to the panel edges, the rest sit next to the previous item. */
  protected resizeJackpotWinAnimation() {
    if (!this.isJackpotIntroAnim) return;

    if (DeviceProxy.isDevice()) {
      if (DeviceProxy.config.isPortrait) {
        this.jackpotIntroAnimHor.renderable = false;
        this.jackpotIntroAnimVer.renderable = true;
      } else {
        this.jackpotIntroAnimHor.renderable = true;
        this.jackpotIntroAnimVer.renderable = false;
      }
    } else {
      this.jackpotIntroAnimHor.renderable = true;
      this.jackpotIntroAnimVer.renderable = false;
    }
  }
  protected resizeView(): void {
    UIUtil.adjustElement(this.cardGuideRect);
    super.resizeView();
    this.resizeJackpotWinAnimation();
    // desktop keeps the layout it was built with; only devices reflow on orientation
    if (DeviceProxy.isDevice()) {
      UIUtil.adjustElement(this.instructionText);
      const col = DeviceProxy.config.isPortrait ? this.cardsConfig.pCol : this.cardsConfig.maxcCol;
      this.layoutCards(col);
    }
  }
}
