import { ResponsesiveChildrenView } from '@core/pixiwrapper/ResponsesiveChildrenView';
import { BalanceComp } from '@core/views/comps/BalanceComp';
import { BetComp } from '@core/views/comps/BetComp';
import { MenuComp } from '@core/views/comps/MenuComp';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { PixText } from '@core/pixiwrapper/PixText';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { GameProxy } from '@core/models/GameConfigProxy';
import { UIUtil } from '@core/utils/UIUtilService';
import { Util } from '@core/utils/UtilService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { Sine } from 'gsap';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { PixSpine } from '@core/pixiwrapper/PixSpine';

export class ControlPanelView extends ResponsesiveChildrenView {
  private balanceComp: BalanceComp;
  private betComp: BetComp;
  private menuComp: MenuComp;
  private soundOnBtn: PixFancyButton;
  private soundOffBtn: PixFancyButton;
  private turboSelectedBtn: PixFancyButton;
  private turboBtn: PixFancyButton;
  private cheatBtn: PixFancyButton;
  private menuBtn: PixFancyButton;
  private spinBtn: PixFancyButton;
  private stopSpinBtn: PixFancyButton;
  private autoSpinBtn: PixFancyButton;
  private betBtn: PixFancyButton;
  private clickOutsideHandler: any;
  private autoCounterBG: PixSprite;
  private autoCounterText: PixText;
  private autoStopBtn: PixFancyButton;
  private bbButtonsArray: PixFancyButton[];
  private gameNameTxt: PixText;
  private gameLogo: PixSprite | PixSpine;
  constructor(config: any) {
    super(config);

    this.balanceComp = this.elementsList['balanceComp'];
    this.betComp = this.elementsList['betComp'];
    this.menuComp = this.elementsList['menuComp'];
    this.soundOnBtn = this.elementsList['soundOnBtn'];
    this.soundOffBtn = this.elementsList['soundOffBtn'];
    this.turboBtn = this.elementsList['turboBtn'];
    this.turboSelectedBtn = this.elementsList['turboSelectedBtn'];
    this.cheatBtn = this.elementsList['cheatBtn'];
    this.menuBtn = this.elementsList['menuBtn'];
    this.spinBtn = this.elementsList['spinBtn'];
    this.stopSpinBtn = this.elementsList['stopSpinBtn'];
    this.autoSpinBtn = this.elementsList['autoSpinBtn'];
    this.autoStopBtn = this.elementsList['autoStopBtn'];
    this.betBtn = this.elementsList['betBtn'];
    this.autoCounterBG = this.elementsList['autoCounter'].elementsList['autoCounterBG'];
    this.autoCounterText = this.elementsList['autoCounter'].elementsList['autoCounterText'];
    this.gameNameTxt = this.elementsList['gameNameTxt'];
    this.menuComp.visible = false;
    this.autoCounterText.visible = false;
    this.autoCounterBG.visible = false;
    EventHandler.addEventListener(SlotEvents.UPDATE_BALANCE_FOR_SPIN, this.updateBalanceForSpin.bind(this));
    EventHandler.addEventListener(SlotEvents.UPDATE_BALANCE_FOR_BB_SPIN, this.updateBalanceForBBSpin.bind(this));
    EventHandler.addEventListener(SlotEvents.UPDATE_BALANCE, this.updateBalance.bind(this));
    EventHandler.addEventListener(SlotEvents.UPDATE_TOTALBET, this.updateTotalbet.bind(this));
    EventHandler.addEventListener(SlotEvents.SOUND_STATE_CHANGED, this.onSoundStateChanged.bind(this));
    EventHandler.addEventListener(SlotEvents.TURBO_STATE_CHANGED, this.onTurboStateChanged.bind(this));
    EventHandler.addEventListener(SlotEvents.HIDE_MENU, this.hideMenu.bind(this));

    EventHandler.addEventListener(SlotEvents.MENU_CLICKED, this.onMenuClicked.bind(this));

    EventHandler.addEventListener(SlotEvents.ENABLE_CONTROLPANEL, this.enablePanel.bind(this));
    EventHandler.addEventListener(SlotEvents.DISABLE_CONTROLPANEL, this.disablePanel.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_SPIN_BUTTON, this.showSpinButton.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_STOPSPIN_BUTTON, this.showStopSpinButton.bind(this));
    EventHandler.addEventListener(SlotEvents.DISABLE_STOPSPIN_BUTTON, this.disableStopSpinButton.bind(this));

    EventHandler.addEventListener(SlotEvents.AUTOPLAY_UPDATE_UI_START, this.updateUIForAutoStart.bind(this));
    EventHandler.addEventListener(SlotEvents.AUTOPLAY_UPDATE_COUNT, this.updateUIAutoCount.bind(this));
    EventHandler.addEventListener(SlotEvents.AUTOPLAY_ENDED, this.onAutoplayEnded.bind(this));
    EventHandler.addEventListener(SlotEvents.AUTOPLAY_UPDATE_UI_STOP, this.onAutoplayEnded.bind(this));

    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_UI_START, this.updateUIForFreeSpinsStart.bind(this));
    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_COUNT, this.updateUIFreeSpinsCount.bind(this));
    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_UI_END, this.onFreeSpinsEnded.bind(this));
    this.createBBButtons();
    this.createGameTitle();
    this.addChild(this.menuComp);
    this.resizeView();
    this.updateBalance();
    this.updateTotalbet();
    this.disablePanel();
  }
  protected createGameTitle() {
    if (GameProxy.config.gameLogo) {
      this.gameLogo = UIUtil.getElement(GameProxy.config.gameLogo);
      this.addChild(this.gameLogo);
      this.elementsList[this.gameLogo.configData.name] = this.gameLogo;
    }
  }
  protected createBBButtons(): void {
    this.bbButtonsArray = [];
    const len = GameProxy.config.buyBonusData.features.length;
    if (len > 0) {
      for (let k = 0; k < len; k++) {
        const btn = UIUtil.getElement(GameProxy.config.buyBonusData.features[k].btn);
        const bbBet = this.getMultiplier(GameProxy.config.buyBonusData.features[k].featureId) * appModel.getTotalBet();
        const bbBetAmt = Util.formatCurrency(bbBet);
        if (k == 0) {
          //btn.tText.text = Util.parseMessage(Util.getContent('BuyFreeSpinText'), [bbBetAmt]);
        } else {
          //btn.tText.text = Util.parseMessage(Util.getContent('BuySuperFreeSpinText'), [bbBetAmt]);
        }
        this.bbButtonsArray.push(btn);
        this.addChild(btn);
        // Connect the button's action command if it exists
        /*if (btn.configData && btn.configData.action && btn.configData.action.press) {
          btn.onPress.connect(() => {
            btn.configData.action.press.execute(btn);
          });
        }*/
        //btn.onPress.connect(this.onBBBtnClicked.bind(this));
      }
    }
  }
  protected onBBBtnClicked(btn: any): void {}
  getMultiplier(featureId) {
    if (appModel.getbbBetMultiplierSettings()) {
      return appModel.getbbBetMultiplierSettings()[featureId];
    } else {
      return null;
    }
  }

  protected updateBalanceForSpin(): void {
    this.updateBalance(appModel.getBalance() - appModel.getTotalBet());
  }
  protected updateBalanceForBBSpin(): void {
    const multiplier = appModel.getBuyBonusMultiplier(GameProxy.config.selectedBB);
    this.updateBalance(appModel.getBalance() - appModel.getTotalBet() * multiplier);
  }
  protected updateBalance(value: number = undefined) {
    this.balanceComp.updateValue(value == undefined ? appModel.getBalance() : value);
  }
  protected updateTotalbet(value: number = null) {
    this.betComp.updateValue(value == undefined ? appModel.getTotalBet() : value);
  }
  protected onSoundStateChanged(flag: boolean): void {
    this.soundOnBtn.visible = flag;
    this.soundOffBtn.visible = !flag;
  }
  protected onTurboStateChanged(): void {
    this.turboBtn.visible = !appModel.turboMode;
    this.turboSelectedBtn.visible = appModel.turboMode;
  }
  hideMenu(): void {
    AnimationProxy.animateTween(this.menuComp, {
      duration: 0.25,
      x: -this.menuComp.width * 1.2,
      ease: Sine.easeOut,
      onComplete: this.onMenuCompHidden.bind(this),
    });
    this.removeClickOutsideListener();
  }
  onMenuClicked() {
    AnimationProxy.killTweensOf(this.menuComp);
    if (this.menuComp.visible) {
      AnimationProxy.animateTween(this.menuComp, {
        duration: 0.25,
        x: -this.menuComp.width * 1.2,
        ease: Sine.easeOut,
        onComplete: this.onMenuCompHidden.bind(this),
      });
      this.removeClickOutsideListener();
    } else {
      this.menuComp.visible = true;
      this.menuComp.x = -this.menuComp.width;
      AnimationProxy.animateTween(this.menuComp, { duration: 0.25, x: 0, ease: Sine.easeOut });
      this.addClickOutsideListener();
    }
  }
  protected onMenuCompHidden(): void {
    this.menuComp.visible = false;
  }

  private addClickOutsideListener() {
    setTimeout(() => {
      this.clickOutsideHandler = (e: any) => {
        const bounds = this.menuComp.getBounds();
        const { x, y } = e.global;
        if (x < bounds.x || x > bounds.x + bounds.width || y < bounds.y || y > bounds.y + bounds.height) {
          AnimationProxy.animateTween(this.menuComp, {
            duration: 0.25,
            x: -this.menuComp.width * 1.2,
            ease: Sine.easeOut,
            onComplete: this.onMenuCompHidden.bind(this),
          });
          this.removeClickOutsideListener();
        }
      };
      if (this.parent) {
        (this.parent as any).eventMode = 'static';
        this.parent.on('pointerdown', this.clickOutsideHandler);
      }
    }, 100);
  }

  private removeClickOutsideListener() {
    if (this.clickOutsideHandler && this.parent) {
      this.parent.off('pointerdown', this.clickOutsideHandler);
      this.clickOutsideHandler = null;
    }
  }

  protected enablePanel(): void {
    this.spinBtn.enabled = true;
    this.autoSpinBtn.enabled = true;
    this.betBtn.enabled = true;
    this.menuBtn.enabled = true;

    // Enable buy bonus buttons
    if (this.bbButtonsArray) {
      this.bbButtonsArray.forEach((btn) => (btn.enabled = true));
    }
  }
  protected disablePanel(): void {
    this.spinBtn.enabled = false;
    this.autoSpinBtn.enabled = false;
    this.betBtn.enabled = false;

    // Disable buy bonus buttons during spins
    if (this.bbButtonsArray) {
      this.bbButtonsArray.forEach((btn) => (btn.enabled = false));
    }
  }

  protected showSpinButton(): void {
    this.stopSpinBtn.visible = false;
    this.spinBtn.visible = true;
  }
  protected showStopSpinButton(): void {
    this.stopSpinBtn.visible = true;
    this.spinBtn.visible = false;
  }
  protected disableStopSpinButton(): void {
    this.stopSpinBtn.visible = false;
    this.showSpinButton();
  }

  protected updateUIForAutoStart(): void {
    this.spinBtn.renderable = false;
    this.stopSpinBtn.renderable = false;
    this.autoCounterBG.visible = true;
    this.autoCounterText.visible = true;
    this.autoSpinBtn.visible = false;
    this.autoStopBtn.visible = true;
    this.resizeView();
  }

  protected updateUIAutoCount(): void {
    this.autoCounterText.text = appModel.getAutoSpinRemainingCount();
  }

  // Re-enable control panel buttons when autoplay completes
  protected onAutoplayEnded(): void {
    this.spinBtn.renderable = true;
    this.stopSpinBtn.renderable = true;
    this.showSpinButton();
    this.autoSpinBtn.visible = true;
    this.autoStopBtn.visible = false;
    this.autoCounterBG.visible = false;
    this.autoCounterText.visible = false;
  }

  protected updateUIForFreeSpinsStart(): void {
    this.spinBtn.renderable = false;
    this.stopSpinBtn.renderable = false;
    this.autoCounterBG.visible = true;
    this.autoCounterText.visible = true;
    this.autoSpinBtn.visible = true;
    this.autoStopBtn.visible = false;
    this.betBtn.enabled = false;
    this.resizeView();
  }

  protected updateUIFreeSpinsCount(): void {
    this.autoCounterText.text = appModel.getCurrentFreeSpin() + '/' + appModel.getTotalFreespins();
  }

  protected onFreeSpinsEnded(): void {
    this.spinBtn.renderable = true;
    this.stopSpinBtn.renderable = true;
    this.showSpinButton();
    this.autoSpinBtn.visible = true;
    this.autoCounterBG.visible = false;
    this.autoCounterText.visible = false;
    this.updateBalance();
    this.enablePanel();
  }

  protected repositionView() {
    super.repositionView();
    const len = this.bbButtonsArray.length;
    if (len > 0) {
      for (let k = 0; k < len; k++) {
        if (DeviceProxy.config.isDesktop) {
          UIUtil.setPercentageScale(this.bbButtonsArray[k], 0.1, 0.15, 1);
          this.bbButtonsArray[k].y =
            this.soundOnBtn.y - (k + 1) * 0.6 * this.bbButtonsArray[k].height - UIUtil.getPercentageHeight(0.03);

          if (DeviceProxy.config.isPortrait) {
            UIUtil.setPercentageScale(this.bbButtonsArray[k], 0.1, 0.1, 1);
            this.bbButtonsArray[k].y =
              this.soundOnBtn.y - (k + 1) * 0.6 * this.bbButtonsArray[k].height - UIUtil.getPercentageHeight(0.03);
          }
        } else {
          if (DeviceProxy.config.isPortrait) {
            UIUtil.setPercentageScale(this.bbButtonsArray[k], 0.2, 0.1, 1);
            this.bbButtonsArray[k].y =
              this.autoSpinBtn.y - (k + 1) * 0.5 * this.bbButtonsArray[k].height - UIUtil.getPercentageHeight(0.05);
          } else {
            UIUtil.setPercentageScale(this.bbButtonsArray[k], 0.14, 0.14, 1);
            this.bbButtonsArray[k].y =
              this.soundOnBtn.y - (k + 1) * 0.75 * this.bbButtonsArray[k].height - UIUtil.getPercentageHeight(0.03);
          }
        }

        this.bbButtonsArray[k].x = this.menuBtn.x + (this.bbButtonsArray[k].width - this.soundOnBtn.width) / 2;
      }
    }
  }
}
