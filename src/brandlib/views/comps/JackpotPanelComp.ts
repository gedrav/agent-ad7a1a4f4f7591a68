import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { JackPotItem } from './JackPotItem';
import { PixView } from '@core/pixiwrapper/PixView';
import { UIUtil } from '@core/utils/UIUtilService';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { Graphics, Text } from 'pixi.js';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { WinTicker } from '@core/views/comps/WinTicker';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { appModel } from '@core/models/services/AppModelService';
import { IJackpotInfo } from '@core/models/jackpot.types';

const METER_TWEEN_SECONDS = 1;
const NOTICE_TEXT = { demo: 'DEMO JACKPOT', unavailable: 'JACKPOT UNAVAILABLE' };

interface RowLayout {
  widthPerc: number;
  heightPerc: number;
  maxScale: number;
  minScale: number;
  hPaddingPerc: number;
}

const DESKTOP_ROW: RowLayout = { widthPerc: 0.2, heightPerc: 0.2, maxScale: 0.34, minScale: 0.01, hPaddingPerc: 0.2 };
const LANDSCAPE_ROW: RowLayout = {
  widthPerc: 0.16,
  heightPerc: 0.16,
  maxScale: 0.2,
  minScale: 0.01,
  hPaddingPerc: 0.24,
};
const ROW_Y_PERC = 0.4;
const GRID_COLUMNS = 2;

export class JackpotPanelComp extends ResponsiveChildrenView {
  protected overlayRect: Graphics;
  protected jackPotsArr: JackPotItem[] = [];
  protected jackpotConfig: any;
  protected jackpotContainer: PixView;
  protected jackpotIntroAnimHor: PixSpine;
  protected jackpotIntroAnimVer: PixSpine;
  protected isJackpotIntroAnim: boolean;
  protected isJackpotOutroAnim: boolean;
  protected isJPSkipping: boolean;
  protected jackPotOutroAnimation: PixSpine;
  protected jackpotWinContainer: PixView;
  protected jpguideRect: PixView;
  protected youwinJPTextimg: PixSprite;
  protected winTickerJP: WinTicker;
  protected timeoutId: number;
  protected noticeText: Text;
  constructor(config) {
    super(config);
    this.jackpotConfig = this.configData.jackpotConfig;
    this.overlayRect = this.elementsList['overlayRect'];
    this.guideRect = this.elementsList['guideRect'];
    this.jackpotContainer = this.elementsList['jackpotContainer'];
    this.jackpotIntroAnimHor = this.elementsList['jackpotIntroAnimHor'];
    this.jackpotIntroAnimVer = this.elementsList['jackpotIntroAnimVer'];
    this.jackpotWinContainer = this.elementsList['jackpotWinContainer'];
    this.jpguideRect = this.jackpotWinContainer.elementsList['jpguideRect'];
    this.youwinJPTextimg = this.jackpotWinContainer.elementsList['youwinJPTextimg'];
    this.jackPotOutroAnimation = this.jackpotWinContainer.elementsList['jackPotOutroAnimation'];
    this.winTickerJP = this.jackpotWinContainer.elementsList['winTickerJP'];

    this.hideJackpotIntroAnim();

    this.notifyWinDone();
    this.createJackPotElement();
    this.winTickerJP?.on('COUNTUP_COMPLETED', this.onCountUpUpdateBW.bind(this));
    this.winTickerJP?.on('COUNTUP_UPDATE', this.adjustTextSize.bind(this));
    this.jackPotOutroAnimation.addEventListener('complete', this.onJackpotOutroAnimComplete.bind(this));
    this.jackpotIntroAnimHor.addEventListener('complete', this.onIntroAnimComplete.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_JACKPOT_INTRO_ANIM, this.showJackpotIntroAnim.bind(this));
    EventHandler.addEventListener(SlotEvents.JACKPOT_WIN_TICKER_ANIM, this.showJackpotWinAnimation.bind(this));
    EventHandler.addEventListener(SlotEvents.JACKPOT_INFO_READY, this.onJackpotInfoReady.bind(this));
    EventHandler.addEventListener(SlotEvents.JACKPOT_METERS_UPDATE, this.onMetersUpdate.bind(this));
    EventHandler.addEventListener(SlotEvents.HIDE_JACKPOT_BG, this.onRevealEnd.bind(this));
    this.onJackpotInfoReady(appModel.jackpotInfo);
    UIUtil.addInteraction(this.overlayRect, this.onOverlayClicked.bind(this));
    UIUtil.setClickable(this.overlayRect, true);
  }
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
    this.adjustTextSize();
    this.punchWinTickerJP();
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
    this.youwinJPTextimg.visible = false;
    AnimationProxy.killTweensOf(this.youwinJPTextimg);
    this.winTickerJP.visible = false;
    AnimationProxy.killTweensOf(this.winTickerJP);
    this.overlayRect.visible = false;

    this.jackPotOutroAnimation.stopAnimation();
    this.jackPotOutroAnimation.visible = false;
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
  showJackpotWinAnimation() {
    this.isJackpotOutroAnim = true;
    this.isJPSkipping = false;
    const winValue = appModel.jackpotRound?.amount ?? 0;
    this.winTickerJP.reset();
    this.winTickerJP.visible = true;
    this.winTickerJP.countUpValue(winValue, 5000);
    AnimationProxy.fadeIn(this.overlayRect, 0.2, null, 0.35);
    this.jackPotOutroAnimation.visible = true;
    this.youwinJPTextimg.visible = true;
    this.pulseJPWinText();
    this.jackPotOutroAnimation.playAnimation({ state: 'start_land', loop: false });
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
  }
  hideJackPotOutroAnim() {
    this.youwinJPTextimg.visible = false;
    this.jackPotOutroAnimation.visible = false;
    this.jackPotOutroAnimation.stopAnimation();
    AnimationProxy.killTweensOf(this.youwinJPTextimg);
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
      StateManager.doNextStep();
    }
  }
  protected showJackpotIntroAnim() {
    if (!this.isJackpotIntroAnim) {
      this.isJackpotIntroAnim = true;
      this.jackpotIntroAnimHor.visible = true;
      this.jackpotIntroAnimVer.visible = true;
      this.resizeJackpotWinAnimation();
      this.playIntroAnimations({ state: 'start_land', stateP: 'start_port', loop: false });
      this.showFrozenFromRound();
    }
  }

  playIntroAnimations({ state, stateP, loop, timeScale = 1 }) {
    this.jackpotIntroAnimHor.playAnimation({ state, loop, reset: false, timeScale });
    this.jackpotIntroAnimVer.playAnimation({ state: stateP, loop, reset: false, timeScale });
  }

  createJackPotElement() {
    const itemCount = this.jackpotConfig.noOfElement;

    for (let i = 0; i < itemCount; i++) {
      const item = new JackPotItem(this.jackpotConfig.items);
      this.addChildAt(item, 0);
      this.jackPotsArr.push(item);
      item.initialView({
        skinName: this.jackpotConfig.jackpotAnimSkin[i],
        colorcode: this.jackpotConfig.jackpotTextColor[i],
      });
    }
    this.jackPotsArr.forEach((item) => (item.visible = false));
    this.resizeView();
  }
  protected onJackpotInfoReady(info: IJackpotInfo | null) {
    const hasInfo = !!info;
    this.jackPotsArr.forEach((item) => (item.visible = hasInfo));
    if (!info) {
      this.setNotice(null);
      return;
    }
    if (appModel.jackpotRound) {
      this.showFrozenFromRound();
    } else {
      this.showFrozen(appModel.jackpotMeters);
    }
    this.setNotice(info.demo ? 'demo' : !info.available ? 'unavailable' : null);
  }
  protected onMetersUpdate(data: { values: number[]; v: number }) {
    if (!data) return;
    this.jackPotsArr.forEach((item, i) => {
      if (data.values[i] !== undefined) item.tweenToValue(data.values[i], METER_TWEEN_SECONDS);
    });
  }
  protected showFrozenFromRound() {
    const frozen = appModel.jackpotRound?.frozenMeters;
    if (frozen?.length) this.showFrozen(frozen);
  }
  protected onRevealEnd() {
    // tweening from the frozen value to the live one; a buffered tick may follow right after
    this.onMetersUpdate({ values: appModel.jackpotMeters, v: appModel.jackpotMetersV });
  }
  public showFrozen(values: number[]) {
    this.jackPotsArr.forEach((item, i) => {
      if (values[i] !== undefined) item.setValue(values[i]);
    });
  }
  public setNotice(kind: 'demo' | 'unavailable' | null) {
    if (!kind) {
      if (this.noticeText) this.noticeText.visible = false;
      return;
    }
    if (!this.noticeText) {
      this.noticeText = new Text({ text: '', style: { fill: 0xffffff, fontSize: 24 } });
      this.noticeText.anchor.set(0.5, 0);
      this.addChild(this.noticeText);
    }
    this.noticeText.text = NOTICE_TEXT[kind];
    this.noticeText.visible = true;
    this.noticeText.x = UIUtil.getGameWidth() / 2;
  }
  protected resizeView() {
    super.resizeView();
    this.resizeJackpotWinAnimation();
    if (this.noticeText) this.noticeText.x = UIUtil.getGameWidth() / 2;
    this.overlayRect.width = UIUtil.getGameWidth();
    this.overlayRect.height = UIUtil.getGameHeight();

    if (!DeviceProxy.isDesktop() && DeviceProxy.config.isPortrait) {
      this.jackPotsArr.forEach((item, index) => this.layoutAsGrid(item, index));
      return;
    }
    const layout = DeviceProxy.isDesktop() ? DESKTOP_ROW : LANDSCAPE_ROW;
    this.jackPotsArr.forEach((item, index) => this.layoutAsRow(item, index, layout));
  }

  /** Single row: items 0 and 2 anchor to the panel edges, the rest sit next to the previous item. */
  private layoutAsRow(item: JackPotItem, index: number, layout: RowLayout) {
    UIUtil.setRelativeScale(item, layout.widthPerc, layout.heightPerc, null, layout.maxScale, layout.minScale);
    item.y = item.height * ROW_Y_PERC;

    if (index === 0) {
      UIUtil.alignHorizontal(item, { hAlign: 'left', hPaddingPerc: layout.hPaddingPerc });
    } else if (index === 2) {
      UIUtil.alignHorizontal(item, { hAlign: 'right', hPaddingPerc: -layout.hPaddingPerc });
    } else {
      const prev = this.jackPotsArr[index - 1];
      item.x = prev.x + prev.width;
    }
  }

  /** Two columns: even indices go left, odd go right; each row hangs below the row above it. */
  private layoutAsGrid(item: JackPotItem, index: number) {
    UIUtil.setRelativeScale(item, 0.17, 0.17, null, 0.16, 0.2);

    const isLeftColumn = index % GRID_COLUMNS === 0;
    item.x = isLeftColumn ? item.width * 0.34 : UIUtil.getGameWidth() - item.width * 0.62;

    if (index < GRID_COLUMNS) {
      UIUtil.alignVertical(item, { vAlign: 'top', vPaddingPerc: 0.11 });
    } else {
      const above = this.jackPotsArr[index - GRID_COLUMNS];
      item.y = above.y + item.height * 0.8;
    }
  }
  protected resizeJackpotWinAnimation() {
    UIUtil.adjustElement(this.jpguideRect);
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
}
