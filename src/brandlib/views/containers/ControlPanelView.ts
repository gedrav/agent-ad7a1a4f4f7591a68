import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { BalanceComp } from '@core/views/comps/BalanceComp';
import { BetComp } from '@core/views/comps/BetComp';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { GameProxy } from '@core/models/GameConfigProxy';
import { UIUtil } from '@core/utils/UIUtilService';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { ActionCommand } from '@core/commands/core/ActionCommand';
import { SpinClickCommand } from '@core/commands/action/SpinClickCommand';
import { AutoplayClickCommand } from '@core/commands/action/AutoplayClickCommand';
import { SlotMachineView } from '@core/views/slotmachine/SlotMachineView';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { Point } from 'pixi.js';
import { SoundFactory } from '@core/sound/SoundServiceProxy';

let longPressTimer: ReturnType<typeof setTimeout> | null = null;

const LONG_PRESS_DURATION = 500; // ms
export class ControlPanelView extends ResponsiveChildrenView {
  private slotGuideRect: PixGraphics;
  private longPressSprite: PixSprite;
  get slotView(): SlotMachineView {
    return this._slotView;
  }

  set slotView(value: SlotMachineView) {
    this._slotView = value;
  }
  private balanceComp: BalanceComp;
  private betComp: BetComp;
  private soundOnBtn: PixFancyButton;
  private soundOffBtn: PixFancyButton;
  private turboSelectedBtn: PixFancyButton;
  private turboBtn: PixFancyButton;
  private cheatBtn: PixFancyButton;
  private stopAutoBtn: PixFancyButton;
  private menuBtn: PixFancyButton;
  private spinBtn: PixFancyButton;
  private stopSpinBtn: PixFancyButton;
  private betBtn: PixFancyButton;
  private clickOutsideHandler: any;
  private bbButtonsArray: PixFancyButton[];
  private gameLogo: PixSprite | PixSpine;
  private infoBtn: PixFancyButton;
  private brandLogo: PixSprite;
  private _slotView: SlotMachineView;
  constructor(config: any) {
    super(config);
    GameProxy.config.isLongPressTriggered = false;
    this.slotGuideRect = this.elementsList['slotGuideRect'];
    this.balanceComp = this.elementsList['balanceComp'];
    this.betComp = this.elementsList['betComp'];
    this.soundOnBtn = this.elementsList['soundOnBtn'];
    this.soundOffBtn = this.elementsList['soundOffBtn'];
    this.turboBtn = this.elementsList['turboBtn'];
    this.turboSelectedBtn = this.elementsList['turboSelectedBtn'];
    this.cheatBtn = this.elementsList['cheatBtn'];
    this.menuBtn = this.elementsList['menuBtn'];
    this.infoBtn = this.elementsList['infoBtn'];
    this.spinBtn = this.elementsList['spinBtn'];
    this.stopSpinBtn = this.elementsList['stopSpinBtn'];
    this.stopAutoBtn = this.elementsList['stopAutoBtn'];
    this.betBtn = this.elementsList['betBtn'];
    this.brandLogo = this.elementsList['brandLogo'];

    if (!appModel.getIsCheatMode()) {
      this.removeChild(this.cheatBtn);
    }

    // Hide home button if getHomeURL is null or empty

    this.longPressSprite = UIUtil.getSprite('longPressText');
    this.spinBtn.addChild(this.longPressSprite);
    this.longPressSprite.scale.set(0.95);
    this.longPressSprite.anchor.set(0.5);

    EventHandler.addEventListener(SlotEvents.UPDATE_BALANCE_FOR_SPIN, this.updateBalanceForSpin.bind(this));
    EventHandler.addEventListener(SlotEvents.UPDATE_BALANCE_FOR_BB_SPIN, this.updateBalanceForBBSpin.bind(this));
    EventHandler.addEventListener(SlotEvents.UPDATE_BALANCE, this.updateBalance.bind(this));
    EventHandler.addEventListener(SlotEvents.UPDATE_TOTALBET, this.updateTotalbet.bind(this));
    EventHandler.addEventListener(SlotEvents.SOUND_STATE_CHANGED, this.onSoundStateChanged.bind(this));

    EventHandler.addEventListener(SlotEvents.TURBO_STATE_CHANGED, this.onTurboStateChanged.bind(this));

    EventHandler.addEventListener(SlotEvents.ENABLE_CONTROLPANEL, this.enablePanel.bind(this));
    EventHandler.addEventListener(SlotEvents.DISABLE_CONTROLPANEL, this.disablePanel.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_SPIN_BUTTON, this.showSpinButton.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_STOPSPIN_BUTTON, this.showStopSpinButton.bind(this));
    EventHandler.addEventListener(SlotEvents.DISABLE_STOPSPIN_BUTTON, this.disableStopSpinButton.bind(this));

    EventHandler.addEventListener(SlotEvents.AUTOPLAY_UPDATE_UI_START, this.updateUIForAutoStart.bind(this));
    EventHandler.addEventListener(SlotEvents.AUTOPLAY_UPDATE_UI_STOP, this.onAutoplayEnded.bind(this));
    EventHandler.addEventListener(SlotEvents.AUTOPLAY_UPDATE_UI_FORCE_STOP, this.onAutoplayEnded.bind(this));

    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_UI_START, this.updateUIForFreeSpinsStart.bind(this));
    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_COUNT, this.updateUIFreeSpinsCount.bind(this));
    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_UI_END, this.onFreeSpinsEnded.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_FULLSCREEN_MODE, this.onFullScreenModeChange.bind(this));

    const soundOn = !appModel.getPreferences()?.sound === false;
    this.onSoundStateChanged(soundOn);
    SoundFactory.ambientState = soundOn;
    SoundFactory.sfxState = soundOn;
    this.addKeyboardEvents();
    this.createBBButtons();
    this.onTurboStateChanged();
    this.createGameTitle();
    this.resizeView();
    this.updateBalance();
    this.updateTotalbet();
    this.disablePanel();

    this.spinBtn.on('pointerdown', this.startPress.bind(this));
    this.spinBtn.on('pointerup', this.endPress.bind(this));
    this.spinBtn.on('pointerupoutside', this.cancelPress.bind(this));
    this.spinBtn.on('pointerout', this.cancelPress.bind(this));
    this.spinBtn.on('pointercancel', this.cancelPress.bind(this));
  }
  protected onFullScreenModeChange(): void {
    if (DeviceProxy.config.isDevice) {
      return;
    }
  }
  protected onLongPress() {
    GameProxy.config.isLongPressTriggered = true;
    const action: ActionCommand = AutoplayClickCommand;
    action.execute(this.spinBtn);
  }
  protected startPress(): void {
    GameProxy.config.isLongPressTriggered = false;
    this.longPressSprite.scale.set(0.88);
    longPressTimer = setTimeout(() => {
      this.onLongPress();
      longPressTimer = null;
    }, LONG_PRESS_DURATION);
  }
  protected endPress(): void {
    if (!GameProxy.config.isLongPressTriggered) {
      if (this.spinBtn.configData?.soundEvent) {
        EventHandler.dispatchEvent(this.spinBtn.configData?.soundEvent);
      }
      const action: ActionCommand = SpinClickCommand;
      action.execute(this.spinBtn);
    }
    this.cancelPress();
  }
  protected cancelPress(): void {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
    this.longPressSprite.scale.set(0.95);
    GameProxy.config.isLongPressTriggered = false;
  }
  protected addKeyboardEvents(): void {
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }
  protected handleKeyUp(e: any): void {
    if (e.code === 'Space' && e.keyCode === 32) {
      if (GameProxy.config.isModalOpened || appModel.getIsFreeSpinsSession() || GameProxy.config.exterPageOpened) {
        return;
      }
      if (this.spinBtn.enabled) {
        if (appModel.getIsAutoSession()) {
          return;
        }
        const action: ActionCommand = SpinClickCommand;
        action.execute(this.spinBtn);
      } else if (this.stopSpinBtn.enabled && this.stopSpinBtn.visible && !this.spinBtn.visible) {
        this.stopSpinBtn.click();
      }
    }
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
    const len = GameProxy.config.buyBonusData?.features.length;
    if (len > 0) {
      for (let k = 0; k < len; k++) {
        const btn = UIUtil.getElement(GameProxy.config.buyBonusData.features[k].btn);
        const bbBet = this.getMultiplier(GameProxy.config.buyBonusData.features[k].featureId) * appModel.getTotalBet();
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
    appModel.setAfterSpinBalance();
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

  private removeClickOutsideListener() {
    if (this.clickOutsideHandler && this.parent) {
      this.parent.off('pointerdown', this.clickOutsideHandler);
      (this.parent as any).eventMode = 'auto';
      this.clickOutsideHandler = null;
    }
  }

  protected enablePanel(): void {
    this.spinBtn.enabled = true;
    this.betBtn.enabled = true;
    this.menuBtn.enabled = true;
    this.infoBtn.enabled = true;

    // Enable buy bonus buttons
    if (this.bbButtonsArray) {
      this.bbButtonsArray.forEach((btn) => (btn.enabled = true));
    }
  }
  protected disablePanel(): void {
    this.spinBtn.enabled = false;
    this.betBtn.enabled = false;
    this.menuBtn.enabled = false;
    this.infoBtn.enabled = false;

    // Disable buy bonus buttons during spins
    if (this.bbButtonsArray) {
      const len = this.bbButtonsArray.length;
      if (len > 0) {
        for (let k = 0; k < len; k++) {
          this.bbButtonsArray[k].enabled = false;
        }
      }
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
    this.stopAutoBtn.visible = true;
    this.stopAutoBtn.renderable = true;
    this.resizeView();
  }

  // Re-enable control panel buttons when autoplay completes
  protected onAutoplayEnded(): void {
    this.spinBtn.renderable = true;
    this.stopSpinBtn.renderable = true;
    this.stopAutoBtn.visible = false;
    this.stopAutoBtn.renderable = false;
    this.showSpinButton();
  }

  protected updateUIForFreeSpinsStart(): void {
    this.resizeView();
  }

  protected updateUIFreeSpinsCount(): void {
    //this.autoCounterText.text = appModel.getCurrentFreeSpin() + '/' + appModel.getTotalFreespins();
  }

  protected onFreeSpinsEnded(): void {
    this.showSpinButton();
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
            this.soundOnBtn.y - (k + 1) * this.bbButtonsArray[k].height * 0.4 - UIUtil.getPercentageHeight(0.1);

          if (DeviceProxy.config.isPortrait) {
            UIUtil.setPercentageScale(this.bbButtonsArray[k], 0.1, 0.1, 1);
            this.bbButtonsArray[k].y =
              this.soundOnBtn.y - (k + 1) * 0.6 * this.bbButtonsArray[k].height - UIUtil.getPercentageHeight(0.03);
          }
        } else {
          if (DeviceProxy.config.isPortrait) {
            UIUtil.setPercentageScale(this.bbButtonsArray[k], 0.16, 0.1, 1);
            this.bbButtonsArray[k].y =
              this.turboBtn.y - k * 0.5 * this.bbButtonsArray[k].height - UIUtil.getPercentageHeight(0.05);
          } else {
            UIUtil.setPercentageScale(this.bbButtonsArray[k], 0.18, 0.18, 1);
            this.bbButtonsArray[k].y = UIUtil.getGameHeight() * 0.5; //k + 1) * 0.75 * this.bbButtonsArray[k].height - UIUtil.getPercentageHeight(0.03);
          }
        }
        if (DeviceProxy.config.isDevice && DeviceProxy.config.isPortrait) {
          if (
            this.bbButtonsArray[k].y - this.bbButtonsArray[k].height * 0.5 <
            this.slotGuideRect.y + this.slotGuideRect.height
          ) {
            this.bbButtonsArray[k].scale.set(this.spinBtn.scale.x * 0.8);
            this.bbButtonsArray[k].y = this.slotGuideRect.y + this.slotGuideRect.height + this.spinBtn.height * 0.3;
          }
        }

        this.bbButtonsArray[k].x = this.soundOnBtn.x + (this.bbButtonsArray[k].width - this.soundOnBtn.width) / 2;
      }
    }
  }

  protected resizeView(): void {
    super.resizeView();
    this.setSlotViewProps();
    if (DeviceProxy.config.isDesktop) {
      if (DeviceProxy.config.isPortrait) {
        this.resizeForDesktopPortrait();
      } else {
        this.resizeForDesktopLandscape();
      }
    } else {
      if (DeviceProxy.config.isPortrait) {
        this.resizeForMobilePortrait();
      } else {
        this.resizeForMobileLandscape();
      }
    }
    this.repositionView();
  }
  protected setSlotViewProps(): void {
    if (this.slotView && this.slotGuideRect) {
      const rect = this.slotView.guideRect;
      this.slotGuideRect.width = rect.getBounds().width;
      this.slotGuideRect.height = rect.getBounds().height;
      const local = this.slotView.toGlobal(new Point(rect.x, rect.y));
      this.slotGuideRect.x = local.x;
      this.slotGuideRect.y = local.y;
    }
  }
  protected resizeForMobilePortrait(): void {
    const hPaddingPerc: number = 0.04;
    const vPaddingPerc: number = 0.01;
    const bigBtnVPaddingPerc: number = 0.2;
    const midBtnPaddingPerc: number = 0.1;
    const smallBtnHPaddingPerc: number = 0.04;

    UIUtil.setRelativeScale(this.balanceComp, 0.36, 0.08, null, 1, 0.32);
    UIUtil.alignHorizontal(this.balanceComp, { hAlign: 'left', hPaddingPerc: hPaddingPerc });
    UIUtil.alignVertical(this.balanceComp, { vAlign: 'bottom', vPaddingPerc: -vPaddingPerc });

    UIUtil.setRelativeScale(this.betComp, 0.32, 0.06, null, 1, 0.32);
    UIUtil.alignHorizontal(this.betComp, { hAlign: 'right', hPaddingPerc: -hPaddingPerc });
    UIUtil.alignVertical(this.betComp, { vAlign: 'bottom', vPaddingPerc: -vPaddingPerc });

    UIUtil.setRelativeScale(this.spinBtn, 0.24, 0.16, null, 1, 0.4);
    UIUtil.alignHorizontal(this.spinBtn, { hAlign: 'center', hPaddingPerc: 0 });
    UIUtil.alignVertical(this.spinBtn, { vAlign: 'bottom', vPaddingPerc: -0.12 });

    if (this.spinBtn.y - this.spinBtn.height * 0.5 < this.slotGuideRect.y + this.slotGuideRect.height) {
      this.spinBtn.scale.set(this.spinBtn.scale.x * 0.8);
      this.spinBtn.y = this.slotGuideRect.y + this.slotGuideRect.height + this.spinBtn.height * 0.6;
    }

    UIUtil.setRelativeScale(this.stopSpinBtn, 1, 1, this.spinBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.stopSpinBtn, { refComponent: 'spinBtn', hAlign: 'center', hPaddingPerc: 0 });
    UIUtil.alignVertical(this.stopSpinBtn, { refComponent: 'spinBtn', vAlign: 'middle', vPaddingPerc: 0 });

    UIUtil.setRelativeScale(this.stopAutoBtn, 1, 1, this.spinBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.stopAutoBtn, { refComponent: 'spinBtn', hAlign: 'center', hPaddingPerc: 0 });
    UIUtil.alignVertical(this.stopAutoBtn, { refComponent: 'spinBtn', vAlign: 'middle', vPaddingPerc: 0 });

    UIUtil.setRelativeScale(this.betBtn, 0.5, 0.5, this.spinBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.betBtn, {
      refComponent: 'spinBtn',
      hAlign: 'rightAfter',
      hPaddingPerc: midBtnPaddingPerc,
    });
    UIUtil.alignVertical(this.betBtn, { refComponent: 'spinBtn', vAlign: 'middle', vPaddingPerc: 0 });

    UIUtil.setRelativeScale(this.turboBtn, 1, 1, this.betBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.turboBtn, {
      refComponent: 'spinBtn',
      hAlign: 'leftBefore',
      hPaddingPerc: -midBtnPaddingPerc,
    });
    UIUtil.alignVertical(this.turboBtn, {
      refComponent: 'spinBtn',
      vAlign: 'middle',
      vPaddingPerc: 0,
    });
    UIUtil.setRelativeScale(this.turboSelectedBtn, 1, 1, this.betBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.turboSelectedBtn, { refComponent: 'turboBtn', hAlign: 'center', hPaddingPerc: 0 });
    UIUtil.alignVertical(this.turboSelectedBtn, {
      refComponent: 'turboBtn',
      vAlign: 'middle',
      vPaddingPerc: 0,
    });

    UIUtil.setRelativeScale(this.menuBtn, 0.04, 0.05, null, 1, 0.4);
    UIUtil.alignHorizontal(this.menuBtn, { hAlign: 'right', hPaddingPerc: -hPaddingPerc });
    UIUtil.alignVertical(this.menuBtn, { vAlign: 'top', vPaddingPerc: vPaddingPerc });

    UIUtil.setRelativeScale(this.infoBtn, 1, 1, this.menuBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.infoBtn, {
      refComponent: 'menuBtn',
      hAlign: 'leftBefore',
      hPaddingPerc: -smallBtnHPaddingPerc,
    });
    UIUtil.alignVertical(this.infoBtn, { refComponent: 'menuBtn', vAlign: 'middle', vPaddingPerc: 0 });

    UIUtil.setRelativeScale(this.soundOnBtn, 1, 1, this.menuBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.soundOnBtn, {
      hAlign: 'left',
      hPaddingPerc: hPaddingPerc,
    });
    UIUtil.alignVertical(this.soundOnBtn, {
      refComponent: 'balanceComp',
      vAlign: 'topUp',
      vPaddingPerc: -smallBtnHPaddingPerc,
    });

    UIUtil.setRelativeScale(this.soundOffBtn, 1, 1, this.menuBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.soundOffBtn, {
      refComponent: 'soundOnBtn',
      hAlign: 'center',
      hPaddingPerc: 0,
    });
    UIUtil.alignVertical(this.soundOffBtn, { refComponent: 'soundOnBtn', vAlign: 'middle', vPaddingPerc: 0 });

    UIUtil.setRelativeScale(this.cheatBtn, 1, 1, this.menuBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.cheatBtn, {
      refComponent: 'soundOnBtn',
      hAlign: 'rightAfter',
      hPaddingPerc: smallBtnHPaddingPerc,
    });
    UIUtil.alignVertical(this.cheatBtn, {
      refComponent: 'soundOnBtn',
      vAlign: 'middle',
      vPaddingPerc: 0,
    });
  }
  protected resizeForMobileLandscape(): void {
    const hPaddingPerc: number = 0.02;
    const vPaddingPerc: number = 0.02;
    const bigBtnHPaddingPerc: number = 0.032;
    const midBtnPaddingPerc: number = 0.05;
    const smallBtnHPaddingPerc: number = 0.04;
    UIUtil.setRelativeScale(this.balanceComp, 0.14, 0.06, null, 1, 0.5);
    UIUtil.alignHorizontal(this.balanceComp, { hAlign: 'left', hPaddingPerc: hPaddingPerc });
    UIUtil.alignVertical(this.balanceComp, { vAlign: 'bottom', vPaddingPerc: -vPaddingPerc });

    UIUtil.setRelativeScale(this.betComp, 0.14, 0.06, null, 1, 0.5);
    UIUtil.alignHorizontal(this.betComp, { hAlign: 'right', hPaddingPerc: -hPaddingPerc });
    UIUtil.alignVertical(this.betComp, { vAlign: 'bottom', vPaddingPerc: -vPaddingPerc });

    UIUtil.setRelativeScale(this.spinBtn, 0.14, 0.16, null, 1, 0.4);
    UIUtil.alignHorizontal(this.spinBtn, { hAlign: 'center', hPaddingPerc: 0 });
    UIUtil.alignVertical(this.spinBtn, { vAlign: 'top', vPaddingPerc: 0.74 });

    UIUtil.setRelativeScale(this.spinBtn, 0.08, 0.15, null, 1, 0.4);
    UIUtil.alignHorizontal(this.spinBtn, { hAlign: 'right', hPaddingPerc: -bigBtnHPaddingPerc });
    UIUtil.alignVertical(this.spinBtn, { vAlign: 'middle', vPaddingPerc: 0 });

    UIUtil.setRelativeScale(this.stopSpinBtn, 1, 1, this.spinBtn, 1, 0.25);
    UIUtil.alignHorizontal(this.stopSpinBtn, { refComponent: 'spinBtn', hAlign: 'center', hPaddingPerc: 0 });
    UIUtil.alignVertical(this.stopSpinBtn, { refComponent: 'spinBtn', vAlign: 'middle', vPaddingPerc: 0 });

    UIUtil.setRelativeScale(this.stopAutoBtn, 1, 1, this.spinBtn, 1, 0.25);
    UIUtil.alignHorizontal(this.stopAutoBtn, { refComponent: 'spinBtn', hAlign: 'center', hPaddingPerc: 0 });
    UIUtil.alignVertical(this.stopAutoBtn, { refComponent: 'spinBtn', vAlign: 'middle', vPaddingPerc: 0 });

    UIUtil.setRelativeScale(this.betBtn, 0.5, 0.5, this.spinBtn, 1, 0.25);
    UIUtil.alignHorizontal(this.betBtn, { refComponent: 'spinBtn', hAlign: 'center', hPaddingPerc: 0 });
    UIUtil.alignVertical(this.betBtn, { refComponent: 'spinBtn', vAlign: 'topUp', vPaddingPerc: -midBtnPaddingPerc });

    UIUtil.setRelativeScale(this.turboBtn, 1, 1, this.betBtn, 1, 0.25);
    UIUtil.alignHorizontal(this.turboBtn, { refComponent: 'spinBtn', hAlign: 'center', hPaddingPerc: 0 });
    UIUtil.alignVertical(this.turboBtn, {
      refComponent: 'spinBtn',
      vAlign: 'bottomDown',
      vPaddingPerc: midBtnPaddingPerc,
    });
    UIUtil.setRelativeScale(this.turboSelectedBtn, 1, 1, this.betBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.turboSelectedBtn, { refComponent: 'turboBtn', hAlign: 'center', hPaddingPerc: 0 });
    UIUtil.alignVertical(this.turboSelectedBtn, {
      refComponent: 'turboBtn',
      vAlign: 'middle',
      vPaddingPerc: 0,
    });

    UIUtil.setRelativeScale(this.menuBtn, 0.05, 0.04, null, 1, 0.4);
    UIUtil.alignHorizontal(this.menuBtn, { hAlign: 'right', hPaddingPerc: -hPaddingPerc });
    UIUtil.alignVertical(this.menuBtn, { vAlign: 'top', vPaddingPerc: vPaddingPerc });

    UIUtil.setRelativeScale(this.infoBtn, 1, 1, this.menuBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.infoBtn, {
      refComponent: 'menuBtn',
      hAlign: 'leftBefore',
      hPaddingPerc: -smallBtnHPaddingPerc,
    });
    UIUtil.alignVertical(this.infoBtn, { refComponent: 'menuBtn', vAlign: 'middle', vPaddingPerc: 0 });

    UIUtil.setRelativeScale(this.soundOnBtn, 1, 1, this.menuBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.soundOnBtn, {
      hAlign: 'left',
      hPaddingPerc: hPaddingPerc,
    });
    UIUtil.alignVertical(this.soundOnBtn, {
      refComponent: 'balanceComp',
      vAlign: 'topUp',
      vPaddingPerc: -smallBtnHPaddingPerc,
    });

    UIUtil.setRelativeScale(this.soundOffBtn, 1, 1, this.menuBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.soundOffBtn, {
      refComponent: 'soundOnBtn',
      hAlign: 'center',
      hPaddingPerc: 0,
    });
    UIUtil.alignVertical(this.soundOffBtn, { refComponent: 'soundOnBtn', vAlign: 'middle', vPaddingPerc: 0 });

    UIUtil.setRelativeScale(this.cheatBtn, 1, 1, this.menuBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.cheatBtn, {
      refComponent: 'soundOnBtn',
      hAlign: 'rightAfter',
      hPaddingPerc: smallBtnHPaddingPerc,
    });
    UIUtil.alignVertical(this.cheatBtn, {
      refComponent: 'soundOnBtn',
      vAlign: 'middle',
      vPaddingPerc: 0,
    });

    if (this.turboBtn.y + this.turboBtn.height * 0.5 > this.betComp.y) {
      this.placeSpinButtonsBeforeBetComp();
    }
  }

  protected placeSpinButtonsBeforeBetComp(): void {
    const bigBtnHPaddingPerc: number = 0.15;
    const midBtnPaddingPerc: number = 0.05;

    UIUtil.setRelativeScale(this.spinBtn, 0.08, 0.12, null, 1, 0.3);
    UIUtil.alignHorizontal(this.spinBtn, {
      refComponent: 'betComp',
      hAlign: 'leftBefore',
      hPaddingPerc: bigBtnHPaddingPerc,
    });
    UIUtil.alignVertical(this.spinBtn, { vAlign: 'middle', vPaddingPerc: 0 });

    UIUtil.setRelativeScale(this.stopSpinBtn, 1, 1, this.spinBtn, 1, 0.25);
    UIUtil.alignHorizontal(this.stopSpinBtn, { refComponent: 'spinBtn', hAlign: 'center', hPaddingPerc: 0 });
    UIUtil.alignVertical(this.stopSpinBtn, { refComponent: 'spinBtn', vAlign: 'middle', vPaddingPerc: 0 });

    UIUtil.setRelativeScale(this.stopAutoBtn, 1, 1, this.spinBtn, 1, 0.25);
    UIUtil.alignHorizontal(this.stopAutoBtn, { refComponent: 'spinBtn', hAlign: 'center', hPaddingPerc: 0 });
    UIUtil.alignVertical(this.stopAutoBtn, { refComponent: 'spinBtn', vAlign: 'middle', vPaddingPerc: 0 });

    UIUtil.setRelativeScale(this.betBtn, 0.5, 0.5, this.spinBtn, 1, 0.25);
    UIUtil.alignHorizontal(this.betBtn, { refComponent: 'spinBtn', hAlign: 'center', hPaddingPerc: 0 });
    UIUtil.alignVertical(this.betBtn, { refComponent: 'spinBtn', vAlign: 'topUp', vPaddingPerc: -midBtnPaddingPerc });

    UIUtil.setRelativeScale(this.turboBtn, 1, 1, this.betBtn, 1, 0.25);
    UIUtil.alignHorizontal(this.turboBtn, { refComponent: 'spinBtn', hAlign: 'center', hPaddingPerc: 0 });
    UIUtil.alignVertical(this.turboBtn, {
      refComponent: 'spinBtn',
      vAlign: 'bottomDown',
      vPaddingPerc: midBtnPaddingPerc,
    });
    UIUtil.setRelativeScale(this.turboSelectedBtn, 1, 1, this.betBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.turboSelectedBtn, { refComponent: 'turboBtn', hAlign: 'center', hPaddingPerc: 0 });
    UIUtil.alignVertical(this.turboSelectedBtn, {
      refComponent: 'turboBtn',
      vAlign: 'middle',
      vPaddingPerc: 0,
    });
  }
  protected placeSpinButtonsCloseToReel(): void {
    if (!this.slotView) {
      return;
    }
    const bigBtnHPaddingPerc: number = 0.08;
    const midBtnPaddingPerc: number = 0.05;

    UIUtil.setRelativeScale(this.spinBtn, 0.08, 0.12, null, 1, 0.25);
    UIUtil.alignHorizontal(this.spinBtn, {
      refComponent: 'slotGuideRect',
      hAlign: 'rightAfter',
      hPaddingPerc: bigBtnHPaddingPerc,
    });
    UIUtil.alignVertical(this.spinBtn, { vAlign: 'middle', vPaddingPerc: 0 });

    UIUtil.setRelativeScale(this.stopSpinBtn, 1, 1, this.spinBtn, 1, 0.25);
    UIUtil.alignHorizontal(this.stopSpinBtn, { refComponent: 'spinBtn', hAlign: 'center', hPaddingPerc: 0 });
    UIUtil.alignVertical(this.stopSpinBtn, { refComponent: 'spinBtn', vAlign: 'middle', vPaddingPerc: 0 });

    UIUtil.setRelativeScale(this.stopAutoBtn, 1, 1, this.spinBtn, 1, 0.25);
    UIUtil.alignHorizontal(this.stopAutoBtn, { refComponent: 'spinBtn', hAlign: 'center', hPaddingPerc: 0 });
    UIUtil.alignVertical(this.stopAutoBtn, { refComponent: 'spinBtn', vAlign: 'middle', vPaddingPerc: 0 });

    UIUtil.setRelativeScale(this.betBtn, 0.5, 0.5, this.spinBtn, 1, 0.25);
    UIUtil.alignHorizontal(this.betBtn, { refComponent: 'spinBtn', hAlign: 'center', hPaddingPerc: 0 });
    UIUtil.alignVertical(this.betBtn, { refComponent: 'spinBtn', vAlign: 'topUp', vPaddingPerc: -midBtnPaddingPerc });

    UIUtil.setRelativeScale(this.turboBtn, 1, 1, this.betBtn, 1, 0.25);
    UIUtil.alignHorizontal(this.turboBtn, { refComponent: 'spinBtn', hAlign: 'center', hPaddingPerc: 0 });
    UIUtil.alignVertical(this.turboBtn, {
      refComponent: 'spinBtn',
      vAlign: 'bottomDown',
      vPaddingPerc: midBtnPaddingPerc,
    });
    UIUtil.setRelativeScale(this.turboSelectedBtn, 1, 1, this.betBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.turboSelectedBtn, { refComponent: 'turboBtn', hAlign: 'center', hPaddingPerc: 0 });
    UIUtil.alignVertical(this.turboSelectedBtn, {
      refComponent: 'turboBtn',
      vAlign: 'middle',
      vPaddingPerc: 0,
    });
  }
  protected resizeForDesktopLandscape(): void {
    const hPaddingPerc: number = 0.005;
    const vPaddingPerc: number = 0.008;
    const bigBtnHPaddingPerc: number = 0.02;
    const midBtnPaddingPerc: number = 0.1;
    const smallBtnHPaddingPerc: number = 0.04;
    UIUtil.setRelativeScale(this.balanceComp, 0.14, 0.06, null, 1, 0.5);
    UIUtil.alignHorizontal(this.balanceComp, { hAlign: 'left', hPaddingPerc: hPaddingPerc });
    UIUtil.alignVertical(this.balanceComp, { vAlign: 'bottom', vPaddingPerc: -vPaddingPerc });

    UIUtil.setRelativeScale(this.betComp, 0.14, 0.06, null, 1, 0.5);
    UIUtil.alignHorizontal(this.betComp, { hAlign: 'right', hPaddingPerc: -hPaddingPerc });
    UIUtil.alignVertical(this.betComp, { vAlign: 'bottom', vPaddingPerc: -vPaddingPerc });

    UIUtil.setRelativeScale(this.spinBtn, 0.08, 0.16, null, 1, 0.4);
    UIUtil.alignHorizontal(this.spinBtn, { hAlign: 'right', hPaddingPerc: -bigBtnHPaddingPerc });
    UIUtil.alignVertical(this.spinBtn, { vAlign: 'middle', vPaddingPerc: 0 });

    UIUtil.setRelativeScale(this.stopSpinBtn, 1, 1, this.spinBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.stopSpinBtn, { refComponent: 'spinBtn', hAlign: 'center', hPaddingPerc: 0 });
    UIUtil.alignVertical(this.stopSpinBtn, { refComponent: 'spinBtn', vAlign: 'middle', vPaddingPerc: 0 });

    UIUtil.setRelativeScale(this.stopAutoBtn, 1, 1, this.spinBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.stopAutoBtn, { refComponent: 'spinBtn', hAlign: 'center', hPaddingPerc: 0 });
    UIUtil.alignVertical(this.stopAutoBtn, { refComponent: 'spinBtn', vAlign: 'middle', vPaddingPerc: 0 });

    UIUtil.setRelativeScale(this.betBtn, 0.5, 0.5, this.spinBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.betBtn, { refComponent: 'spinBtn', hAlign: 'center', hPaddingPerc: 0 });
    UIUtil.alignVertical(this.betBtn, { refComponent: 'spinBtn', vAlign: 'topUp', vPaddingPerc: -midBtnPaddingPerc });

    UIUtil.setRelativeScale(this.turboBtn, 1, 1, this.betBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.turboBtn, { refComponent: 'spinBtn', hAlign: 'center', hPaddingPerc: 0 });
    UIUtil.alignVertical(this.turboBtn, {
      refComponent: 'spinBtn',
      vAlign: 'bottomDown',
      vPaddingPerc: midBtnPaddingPerc,
    });
    UIUtil.setRelativeScale(this.turboSelectedBtn, 1, 1, this.betBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.turboSelectedBtn, { refComponent: 'turboBtn', hAlign: 'center', hPaddingPerc: 0 });
    UIUtil.alignVertical(this.turboSelectedBtn, {
      refComponent: 'turboBtn',
      vAlign: 'middle',
      vPaddingPerc: 0,
    });

    UIUtil.setRelativeScale(this.menuBtn, 0.05, 0.04, null, 1, 0.4);
    UIUtil.alignHorizontal(this.menuBtn, { hAlign: 'right', hPaddingPerc: -hPaddingPerc });
    UIUtil.alignVertical(this.menuBtn, { vAlign: 'top', vPaddingPerc: vPaddingPerc });

    UIUtil.setRelativeScale(this.infoBtn, 1, 1, this.menuBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.infoBtn, {
      refComponent: 'menuBtn',
      hAlign: 'leftBefore',
      hPaddingPerc: -smallBtnHPaddingPerc,
    });
    UIUtil.alignVertical(this.infoBtn, { refComponent: 'menuBtn', vAlign: 'middle', vPaddingPerc: 0 });

    UIUtil.setRelativeScale(this.soundOnBtn, 1, 1, this.menuBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.soundOnBtn, {
      hAlign: 'left',
      hPaddingPerc: hPaddingPerc,
    });
    UIUtil.alignVertical(this.soundOnBtn, {
      refComponent: 'balanceComp',
      vAlign: 'topUp',
      vPaddingPerc: -smallBtnHPaddingPerc,
    });

    UIUtil.setRelativeScale(this.soundOffBtn, 1, 1, this.menuBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.soundOffBtn, {
      refComponent: 'soundOnBtn',
      hAlign: 'center',
      hPaddingPerc: 0,
    });
    UIUtil.alignVertical(this.soundOffBtn, { refComponent: 'soundOnBtn', vAlign: 'middle', vPaddingPerc: 0 });

    UIUtil.setRelativeScale(this.cheatBtn, 1, 1, this.menuBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.cheatBtn, {
      refComponent: 'soundOnBtn',
      hAlign: 'rightAfter',
      hPaddingPerc: smallBtnHPaddingPerc,
    });
    UIUtil.alignVertical(this.cheatBtn, {
      refComponent: 'soundOnBtn',
      vAlign: 'middle',
      vPaddingPerc: 0,
    });
    if (this.spinBtn.x - (this.slotGuideRect.x + this.slotGuideRect.width) > 700) {
      this.placeSpinButtonsCloseToReel();
    }
  }
  protected resizeForDesktopPortrait(): void {
    const hPaddingPerc: number = 0.005;
    const vPaddingPerc: number = 0.008;
    const bigBtnVPaddingPerc: number = 0.032;
    const midBtnPaddingPerc: number = 0.1;
    const smallBtnHPaddingPerc: number = 0.04;

    UIUtil.setRelativeScale(this.balanceComp, 0.32, 0.06, null, 1, 0.32);
    UIUtil.alignHorizontal(this.balanceComp, { hAlign: 'left', hPaddingPerc: hPaddingPerc });
    UIUtil.alignVertical(this.balanceComp, { vAlign: 'bottom', vPaddingPerc: -vPaddingPerc });

    UIUtil.setRelativeScale(this.betComp, 0.32, 0.06, null, 1, 0.32);
    UIUtil.alignHorizontal(this.betComp, { hAlign: 'right', hPaddingPerc: -hPaddingPerc });
    UIUtil.alignVertical(this.betComp, { vAlign: 'bottom', vPaddingPerc: -vPaddingPerc });

    UIUtil.setRelativeScale(this.spinBtn, 0.12, 0.16, null, 1, 0.32);
    UIUtil.alignHorizontal(this.spinBtn, { hAlign: 'center', hPaddingPerc: 0 });
    UIUtil.alignVertical(this.spinBtn, { vAlign: 'bottom', vPaddingPerc: -bigBtnVPaddingPerc });

    UIUtil.setRelativeScale(this.stopSpinBtn, 1, 1, this.spinBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.stopSpinBtn, { refComponent: 'spinBtn', hAlign: 'center', hPaddingPerc: 0 });
    UIUtil.alignVertical(this.stopSpinBtn, { refComponent: 'spinBtn', vAlign: 'middle', vPaddingPerc: 0 });

    UIUtil.setRelativeScale(this.stopAutoBtn, 1, 1, this.spinBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.stopAutoBtn, { refComponent: 'spinBtn', hAlign: 'center', hPaddingPerc: 0 });
    UIUtil.alignVertical(this.stopAutoBtn, { refComponent: 'spinBtn', vAlign: 'middle', vPaddingPerc: 0 });

    UIUtil.setRelativeScale(this.betBtn, 0.5, 0.5, this.spinBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.betBtn, {
      refComponent: 'spinBtn',
      hAlign: 'rightAfter',
      hPaddingPerc: midBtnPaddingPerc,
    });
    UIUtil.alignVertical(this.betBtn, { refComponent: 'spinBtn', vAlign: 'middle', vPaddingPerc: 0 });

    UIUtil.setRelativeScale(this.turboBtn, 1, 1, this.betBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.turboBtn, {
      refComponent: 'spinBtn',
      hAlign: 'leftBefore',
      hPaddingPerc: -midBtnPaddingPerc,
    });
    UIUtil.alignVertical(this.turboBtn, {
      refComponent: 'spinBtn',
      vAlign: 'middle',
      vPaddingPerc: 0,
    });
    UIUtil.setRelativeScale(this.turboSelectedBtn, 1, 1, this.betBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.turboSelectedBtn, { refComponent: 'turboBtn', hAlign: 'center', hPaddingPerc: 0 });
    UIUtil.alignVertical(this.turboSelectedBtn, {
      refComponent: 'turboBtn',
      vAlign: 'middle',
      vPaddingPerc: 0,
    });

    UIUtil.setRelativeScale(this.menuBtn, 0.04, 0.05, null, 1, 0.4);
    UIUtil.alignHorizontal(this.menuBtn, { hAlign: 'right', hPaddingPerc: -hPaddingPerc });
    UIUtil.alignVertical(this.menuBtn, { vAlign: 'top', vPaddingPerc: vPaddingPerc });

    UIUtil.setRelativeScale(this.infoBtn, 1, 1, this.menuBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.infoBtn, {
      refComponent: 'menuBtn',
      hAlign: 'leftBefore',
      hPaddingPerc: -smallBtnHPaddingPerc,
    });
    UIUtil.alignVertical(this.infoBtn, { refComponent: 'menuBtn', vAlign: 'middle', vPaddingPerc: 0 });

    UIUtil.setRelativeScale(this.soundOnBtn, 1, 1, this.menuBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.soundOnBtn, {
      hAlign: 'left',
      hPaddingPerc: hPaddingPerc,
    });
    UIUtil.alignVertical(this.soundOnBtn, {
      refComponent: 'balanceComp',
      vAlign: 'topUp',
      vPaddingPerc: -smallBtnHPaddingPerc,
    });

    UIUtil.setRelativeScale(this.soundOffBtn, 1, 1, this.menuBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.soundOffBtn, {
      refComponent: 'soundOnBtn',
      hAlign: 'center',
      hPaddingPerc: 0,
    });
    UIUtil.alignVertical(this.soundOffBtn, { refComponent: 'soundOnBtn', vAlign: 'middle', vPaddingPerc: 0 });

    UIUtil.setRelativeScale(this.cheatBtn, 1, 1, this.menuBtn, 1, 0.4);
    UIUtil.alignHorizontal(this.cheatBtn, {
      refComponent: 'soundOnBtn',
      hAlign: 'rightAfter',
      hPaddingPerc: smallBtnHPaddingPerc,
    });
    UIUtil.alignVertical(this.cheatBtn, {
      refComponent: 'soundOnBtn',
      vAlign: 'middle',
      vPaddingPerc: 0,
    });
  }
}
