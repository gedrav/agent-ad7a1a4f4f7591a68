import { StandardView } from '@core/pixiwrapper/StandardView';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { Sine } from 'gsap/gsap-core';
import { GameProxy } from '@core/models/GameConfigProxy';
import { ColorMatrixFilter } from 'pixi.js';
import { WrapperProxy } from '@brand/models/WrapperServiceProxy';

export class AnteBetComp extends StandardView {
  protected betAmnt: any;
  protected toggleContainer: any;
  protected toggleFrame: PixSprite;
  protected toggleFrameBox: PixSprite;
  protected toggleBtn: PixSprite;
  protected toggleArrow: PixSprite;
  protected toggleTick: PixSprite;
  protected toggleOff: PixSprite;
  protected toggleOn: PixSprite;
  protected toggleHit: any;
  protected toggleBtnOnX: number;
  protected toggleArrowOffsetX: number;
  private readonly anteFrameGold: PixSprite;
  private readonly anteFrameSilver: PixSprite;

  constructor(config: any) {
    super(config);

    this.betAmnt = this.elementsList['betAmnt'];
    this.toggleContainer = this.elementsList['anteToggleContainer'];
    this.toggleFrameBox = this.toggleContainer.elementsList['anteToggleFrameBox'];
    this.toggleFrame = this.toggleContainer.elementsList['anteToggleFrame'];
    this.toggleBtn = this.toggleContainer.elementsList['anteToggleBtn'];
    this.toggleArrow = this.toggleContainer.elementsList['anteToggleArrow'];
    this.toggleTick = this.toggleContainer.elementsList['anteToggleTick'];
    this.toggleOff = this.toggleContainer.elementsList['anteToggleOff'];
    this.toggleOn = this.toggleContainer.elementsList['anteToggleOn'];
    this.toggleHit = this.toggleContainer.elementsList['anteToggleHit'];
    this.toggleBtnOnX = Math.round(this.toggleTick.x + this.toggleTick.width * 0.5 - this.toggleBtn.width * 0.53);
    this.toggleArrowOffsetX = this.toggleArrow.x - this.toggleBtn.x;
    GameProxy.config.isAnteEnabled = false;
    this.anteFrameGold = this.elementsList['anteFrameGold'];
    this.anteFrameSilver = this.elementsList['anteFrameSilver'];
    this.anteFrameGold.visible = false;

    this.setupToggle();
    this.updateValue();
    EventHandler.addEventListener(SlotEvents.UPDATE_TOTALBET, this.updateValue.bind(this));
    EventHandler.addEventListener(SlotEvents.ENABLE_CONTROLPANEL, this.updateValue.bind(this));
    EventHandler.addEventListener(SlotEvents.ENABLE_ANTE_BB_BUTTON, this.updateValue.bind(this));
    EventHandler.addEventListener(SlotEvents.DISABLE_CONTROLPANEL, this.disableBtn.bind(this));
    EventHandler.addEventListener(SlotEvents.DISALBE_ANTE_BB_BUTTON, this.disableBtn.bind(this));
    EventHandler.addEventListener(SlotEvents.UPDATE_UNFINISHED_ANTE_BET, this.setForUnfinished.bind(this));
    EventHandler.addEventListener(SlotEvents.HIDE_ANTE_BUTTON, this.hideThis.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_ANTE_BUTTON, this.showThis.bind(this));
    this.disableBtn();
  }
  protected hideThis(): void {
    this.visible = false;
  }
  protected showThis(): void {
    this.visible = true;
  }

  protected setForUnfinished(): void {
    this.onToggleClicked();
  }
  private updateValue() {
    const multiplier = GameProxy.config.isAnteEnabled ? 1 : GameProxy.config.anteBetMultiplier;
    if (appModel.getTotalBet() * multiplier > appModel.getMaxBet()) {
      this.betAmnt.text = Util.formatCurrency(appModel.getAnteBetValue());
      this.fitBetAmountText();
      this.disableBtn();
      this.setDeselected();
    } else {
      this.enableBtn();
      this.betAmnt.text = Util.formatCurrency(appModel.getAnteBetValue());
      this.fitBetAmountText();
    }
  }

  protected setupToggle(): void {
    if (!this.toggleBtn) {
      return;
    }
    UIUtil.resumeInteraction(this);
    UIUtil.setHandCursor(this, true);
    this.eventMode = 'static';
    this.cursor = 'pointer';
    UIUtil.addInteraction(this, this.onUserToggleClicked.bind(this));
    this.updateToggleVisuals(false);
    if (GameProxy.config.isAnteEnabled) {
      this.toggleBtn.filters = null;
    } else {
      const flt: ColorMatrixFilter = new ColorMatrixFilter();
      flt.greyscale(0.5, true);
      this.toggleBtn.filters = [flt];
    }
  }
  protected setDeselected(): void {
    GameProxy.config.isAnteEnabled = false;
    this.updateToggleVisuals(true);
    if (GameProxy.config.isAnteEnabled) {
      appModel.setAnteBet(GameProxy.config.anteBetMultiplier);
    } else {
      appModel.setAnteBet(1);
    }
    if (GameProxy.config.isAnteEnabled) {
      this.toggleBtn.filters = null;
    } else {
      const flt: ColorMatrixFilter = new ColorMatrixFilter();
      flt.greyscale(0.5, true);
      this.toggleBtn.filters = [flt];
    }
    EventHandler.dispatchEvent(SlotEvents.UPDATE_BB_STATE);
  }

  protected onToggleClicked(): void {
    GameProxy.config.isAnteEnabled = !GameProxy.config.isAnteEnabled;
    this.updateToggleVisuals(true);
    if (GameProxy.config.isAnteEnabled) {
      appModel.setAnteBet(GameProxy.config.anteBetMultiplier);
    } else {
      appModel.setAnteBet(1);
    }
    if (GameProxy.config.isAnteEnabled) {
      this.toggleBtn.filters = null;
    } else {
      const flt: ColorMatrixFilter = new ColorMatrixFilter();
      flt.greyscale(0.5, true);
      this.toggleBtn.filters = [flt];
    }
    EventHandler.dispatchEvent(SlotEvents.UPDATE_TOTALBET);
    EventHandler.dispatchEvent(SlotEvents.UPDATE_ANTE_BET_STATUS, GameProxy.config.isAnteEnabled);
  }

  private onUserToggleClicked(): void {
    this.onToggleClicked();
    WrapperProxy.postActivityEvent('ingame_casino_antebet', { value: GameProxy.config.isAnteEnabled ? 'on' : 'off' });
  }

  protected updateToggleVisuals(animate: boolean): void {
    const targetX = GameProxy.config.isAnteEnabled ? this.toggleBtnOnX : this.toggleBtn.configData.x;
    const arrowTargetX = targetX + this.toggleArrowOffsetX;
    const tickTargetX = GameProxy.config.isAnteEnabled ? this.toggleTick.configData.x : this.toggleTick.x;
    const onAlpha = GameProxy.config.isAnteEnabled ? 1 : 0;
    const offAlpha = GameProxy.config.isAnteEnabled ? 0 : 1;
    const frameTint = GameProxy.config.isAnteEnabled ? 0x028d09 : 0xcccccc;
    this.anteFrameGold.visible = GameProxy.config.isAnteEnabled;
    this.anteFrameSilver.visible = !GameProxy.config.isAnteEnabled;

    AnimationProxy.killTweensOf(this.toggleBtn);
    AnimationProxy.killTweensOf(this.toggleArrow);
    AnimationProxy.killTweensOf(this.toggleTick);
    AnimationProxy.killTweensOf(this.toggleOff);
    AnimationProxy.killTweensOf(this.toggleOn);
    AnimationProxy.killTweensOf(this.toggleFrame);
    AnimationProxy.killTweensOf(this.toggleBtn.scale);
    this.toggleFrame.tint = frameTint;

    //Animations

    AnimationProxy.animateTween(this.toggleBtn, {
      duration: 0.14,
      x: targetX,
      y: this.toggleBtn.configData.y,
      ease: Sine.easeInOut,
    });
    AnimationProxy.animateTween(this.toggleBtn.scale, {
      duration: 0.07,
      x: 0.96,
      y: 0.96,
      yoyo: true,
      repeat: 1,
      ease: Sine.easeInOut,
    });
    AnimationProxy.animateTween(this.toggleArrow, {
      duration: 0.08,
      x: arrowTargetX,
      y: this.toggleArrow.configData.y,
      alpha: offAlpha,
      ease: Sine.easeInOut,
    });
    AnimationProxy.animateTween(this.toggleTick, {
      duration: 0.08,
      x: tickTargetX,
      y: this.toggleTick.configData.y,
      alpha: onAlpha,
      ease: Sine.easeInOut,
    });
    AnimationProxy.animateTween(this.toggleOff, {
      duration: 0.08,
      delay: GameProxy.config.isAnteEnabled ? 0.02 : 0.06,
      x: this.toggleOff.configData.x,
      y: this.toggleOff.configData.y,
      alpha: offAlpha,
    });
    AnimationProxy.animateTween(this.toggleOn, {
      duration: 0.08,
      delay: GameProxy.config.isAnteEnabled ? 0.06 : 0.02,
      x: this.toggleOn.configData.x,
      y: this.toggleOn.configData.y,
      alpha: onAlpha,
    });
    AnimationProxy.animateTween(this.toggleFrame, { duration: 0.12, alpha: 0.88, yoyo: true, repeat: 1 }, false);
  }

  private enableBtn(): void {
    if (appModel.getIsPromoFSSession()) {
      return;
    }
    this.interactive = true;
    this.alpha = 1;
  }

  private disableBtn(): void {
    this.interactive = false;
    this.alpha = 0.6;
  }

  private fitBetAmountText(): void {
    const bg = this.elementsList['anteBG'];
    const maxWidth = bg ? bg.width * 0.8 : 180;

    this.betAmnt.scale.set(1);

    if (this.betAmnt.width > maxWidth) {
      const scale = maxWidth / this.betAmnt.width;
      this.betAmnt.scale.set(scale);
    }
  }
}
