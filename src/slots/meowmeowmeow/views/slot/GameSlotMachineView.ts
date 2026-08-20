import { SlotMachineView } from '@core/views/slotmachine/SlotMachineView';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import ReelSymbolSpine from '@core/views/slotmachine/ReelSymbolSpine';
import { Point, Texture } from 'pixi.js';
import { getBezierPoint, lerp } from '@core/utils/MathUtils';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { GameProxy } from '@core/models/GameConfigProxy';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { SlotEvents } from '@core/events/SlotEvents';
import { AppEvents } from '@core/events/AppEvents';
import { Util } from '@core/utils/UtilService';
import { MMMJackpotComp } from '@slots/meowmeowmeow/views/comps/MMMJackpotComp';
import { KittieBankComp } from '@slots/meowmeowmeow/views/comps/KittieBankComp';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { UIUtil } from '@core/utils/UIUtilService';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { FEATURE_NAMES } from '@slots/meowmeowmeow/config/FeatureNames';

const BACKGROUND_NAMES = ['maingameBG', 'BGRed', 'BGblue', 'BGgreen'];
const WHEEL_RIM_NAMES = ['wheelRim', 'redWheelRim', 'blueWheelRim', 'greenWheelRim'];

const BACKGROUND_BY_COLOR: Record<string, string> = {
  normal: 'maingameBG',
  red: 'BGRed',
  blue: 'BGblue',
  green: 'BGgreen',
};
const WHEEL_RIM_BY_COLOR: Record<string, string> = {
  normal: 'wheelRim',
  red: 'redWheelRim',
  blue: 'blueWheelRim',
  green: 'greenWheelRim',
};

export class GameSlotMachineView extends SlotMachineView {
  private readonly jackpotContainer: MMMJackpotComp;
  private readonly kittiebankComp: KittieBankComp;
  private readonly gameTitle: PixSpine;
  private readonly wheelBase: PixSprite;
  private readonly wheelBaseGreen: PixSprite;
  private readonly wheelBaseBlue: PixSprite;
  private readonly wheelBaseRed: PixSprite;
  private readonly feautreHeadingGreen: PixSprite;
  private readonly feautreHeadingBlue: PixSprite;
  private readonly feautreHeadingRed: PixSprite;
  private readonly wheelContainer: PixSprite;
  private readonly doorMask: PixGraphics;
  private readonly vaultAnim: PixSpine;
  private wheelMask: PixGraphics | null = null;

  // Stores the closed position of the door to restore on feature exit
  private readonly vaultClosedX: { Desktop: number; Portrait: number; Landscape: number } | null = null;

  private readonly kittiebankBaseX: { Desktop: number; Portrait: number; Landscape: number } | null = null;

  private readonly reelBaseLayoutData: {
    Desktop: { x: number; y: number; scale?: number };
    Portrait: { x: number; y: number; scale?: number };
    Landscape: { x: number; y: number; scale?: number };
  } | null = null;

  private readonly gameTitleBaseLayoutData: any = null;
  private readonly coinAnimationTimeouts: ReturnType<typeof setTimeout>[] = [];

  private readonly machineBasePaddingPortrait: { v: number; h: number } | null = null;

  private readonly kittiebankBasePortraitY: number | null = null;

  constructor(config: any) {
    super(config);
    this.sortableChildren = true;
    EventHandler.addEventListener(SlotEvents.SHOW_COIN_ANIMATION, this.showCoinAnimations.bind(this));
    // EventHandler.addEventListener(SlotEvents.SHOW_PICK_FEATURE_UI, this.handlePickFeature.bind(this));
    EventHandler.addEventListener('RESET_BG_UI', this.hidePickFeatureUI.bind(this));
    EventHandler.addEventListener('RESET_PICK_BONUS', this.hidePickBonusUI.bind(this));
    EventHandler.addEventListener('CLOSE_VAULT', this.closeWheelDoor.bind(this));

    EventHandler.addEventListener(SlotEvents.SHOW_SCATTER_TRIGGER_ONSCREEN, this.onShowExtraSpinAnim.bind(this));
    EventHandler.addEventListener('SHOW_GREEN_TRANSITION', this.showGreenTransition.bind(this));
    EventHandler.addEventListener('SHOW_PICK_FEATURE_TRANSITION', this.showPickFeatureTransition.bind(this));
    EventHandler.addEventListener('HIDE_WHEEL_FEATURE_UI', this.hideWheelFeatureUI.bind(this));
    EventHandler.addEventListener('SHOW_GREEN_KITTIEBANK_BREAK', this.showGreenKittieBankBreak.bind(this));
    EventHandler.addEventListener('SHOW_KITTIEBANK_BREAK', this.showKittieBankBreak.bind(this));
    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_UI_END, this.resetMachineLayout.bind(this));
    EventHandler.addEventListener('TRANSITION', (data: { show: boolean; callback?: () => void }) =>
      this.animateGameElementsTransition(data.show, data.callback),
    );
    EventHandler.addEventListener('TRANSITION_BACKGROUND', (data: { to: string }) =>
      this.transitionBackground(data.to),
    );

    this.jackpotContainer = this.elementsList['jackpotContainer'];
    this.kittiebankComp = this.elementsList['kittiebankComp'];
    this.gameTitle = this.elementsList['gameTitle'];
    this.wheelBase = this.elementsList['wheelBase'];
    this.wheelBaseRed = this.elementsList['redBG'];
    this.wheelBaseBlue = this.elementsList['blueBG'];
    this.wheelBaseGreen = this.elementsList['greenBG'];
    this.feautreHeadingBlue = this.elementsList['BlueMeow'];
    this.feautreHeadingGreen = this.elementsList['GreenMeow'];
    this.feautreHeadingRed = this.elementsList['RedMeow'];
    this.wheelContainer = this.elementsList['wheelContainer'];
    this.doorMask = this.elementsList['doorMask'];
    this.vaultAnim = this.elementsList['vaultAnim'];

    // Snapshot the closed x values from config to restore on feature exit
    const vld = this.vaultAnim?.configData?.layoutData;
    if (vld) {
      this.vaultClosedX = {
        Desktop: vld.Desktop.x,
        Portrait: vld.Portrait.x,
        Landscape: vld.Landscape.x,
      };
    }
    const kld = this.kittiebankComp?.configData?.layoutData;
    if (kld) {
      this.kittiebankBaseX = {
        Desktop: kld.Desktop.x,
        Portrait: kld.Portrait.x,
        Landscape: kld.Landscape.x,
      };
      this.kittiebankBasePortraitY = kld.Portrait.y;
    }
    const mld = this.configData?.layoutData?.Portrait;
    if (mld) {
      this.machineBasePaddingPortrait = {
        v: mld.vPaddingPerc ?? 0,
        h: mld.hPaddingPerc ?? 0,
      };
    }
    const rld = this.slotReel?.configData?.layoutData;
    if (rld) {
      this.reelBaseLayoutData = {
        Desktop: { x: rld.Desktop.x, y: rld.Desktop.y, scale: rld.Desktop.scale || 1 },
        Portrait: { x: rld.Portrait.x, y: rld.Portrait.y, scale: rld.Portrait.scale || 1 },
        Landscape: { x: rld.Landscape.x, y: rld.Landscape.y, scale: rld.Landscape.scale || 1 },
      };
    }
    this.gameTitleBaseLayoutData = this.gameTitle?.configData?.layoutData;

    [this.gameTitle, this.jackpotContainer, this.kittiebankComp, this.slotReel]
      .filter(Boolean)
      .forEach((target: any) => {
        this.transitionBasePositions.set(target, { x: target.x, y: target.y });
      });

    this.startGameLogoAnimation();
  }

  protected startGameLogoAnimation(): void {
    if (this.gameTitle) {
      this.gameTitle.playAnimation({ state: 'idle', loop: false });
      setTimeout(
        () => {
          this.startGameLogoAnimation();
        },
        Math.random() * 5000 + 5000,
      );
    }
  }

  protected showSpinWin(): void {
    this.updateBigWinsCompScale();
    if (this.bigWinsComp) {
      this.addChild(this.bigWinsComp);
    }
    super.showSpinWin();
  }

  protected transitionBackground(to: string): void {
    const color = this.getColorName(to);
    this.transitionElementGroup(BACKGROUND_NAMES, BACKGROUND_BY_COLOR[color]);
    this.transitionElementGroup(WHEEL_RIM_NAMES, WHEEL_RIM_BY_COLOR[color]);
    this.vaultAnim?.setSkin(color);
  }

  private transitionElementGroup(groupNames: string[], toName: string): void {
    const toEl = this.resolveTransitionElement(toName);
    if (!toEl) return;

    const fromName = groupNames.find((name) => name !== toName && this.resolveTransitionElement(name)?.visible);
    const fromEl = fromName ? this.resolveTransitionElement(fromName) : null;

    groupNames.forEach((name) => {
      if (name === toName || name === fromName) return;
      const el = this.resolveTransitionElement(name);
      if (el) el.visible = false;
    });

    toEl.visible = true;
    toEl.alpha = 1;
    if (!fromEl) return;

    AnimationProxy.killTweensOf(fromEl);
    if (fromEl.parent && fromEl.parent === toEl.parent) {
      fromEl.parent.addChildAt(toEl, fromEl.parent.getChildIndex(fromEl));
    }

    AnimationProxy.animateTween(fromEl, {
      alpha: 0,
      duration: 1.5,
      ease: 'sine.inOut',
      onComplete: () => {
        fromEl.visible = false;
        if (groupNames === WHEEL_RIM_NAMES) {
          this.maskWheelTestToRim();
        }
      },
    });
  }

  private resolveTransitionElement(name: string): any {
    return this.elementsList[name] ?? (this.parent as any)?.elementsList?.['gameBGView']?.elementsList?.[name];
  }

  private get wheelRim(): PixSprite {
    const visibleName = WHEEL_RIM_NAMES.find((name) => this.elementsList[name]?.visible);
    return this.elementsList[visibleName ?? 'wheelRim'];
  }

  private getColorName(name: string): string {
    if (/red/i.test(name)) return 'red';
    if (/blue/i.test(name)) return 'blue';
    if (/green/i.test(name)) return 'green';
    return 'normal';
  }

  protected showGreenTransition(data?: { callback?: () => void }): void {
    if (this.slotReel && (this.slotReel as any).winController) {
      clearTimeout((this.slotReel as any).winController.timeoutId);
    }
    this.slotReel.visible = false;
    this.gameTitle.visible = false;
    this.jackpotContainer.visible = false;
    this.kittiebankComp.visible = false;
    this.changeReelInterface();
    this.slotReel.alpha = 1;
    this.animateWheelDoor(data?.callback);
  }

  protected showGreenKittieBankBreak(): void {
    EventHandler.dispatchEvent('PLAY_KITTIE_BLAST', {
      bankName: 'mew',
      callback: () => {
        this.animateGameElementsTransition(false, () => {
          setTimeout(() => {
            StateManager.doNextStep();
          }, 500);
        });
      },
    });
  }

  protected showPickFeatureTransition(): void {
    this.slotReel.visible = false;
    this.jackpotContainer.visible = false;
    this.kittiebankComp.visible = false;
    const featureSubType = appModel.getIsUnfinishedGame()
      ? appModel.getUnfinishedFeatureSubType()
      : appModel.getFeatureSubType();
    const isRedFeature = GameProxy.config.subFeatureAwardAnnounced
      ? true
      : featureSubType?.toUpperCase() !== FEATURE_NAMES.BLUE;
    if (isRedFeature) {
      this.showPickJackpotFeatureScreen();
    } else {
      this.showWheel();
    }
    this.animateWheelDoor(isRedFeature ? this.revealJackpotContainer.bind(this) : undefined);
    this.gameTitle.visible = false;
  }

  private revealJackpotContainer(): void {
    this.jackpotContainer.visible = true;
    this.jackpotContainer.alpha = 0;
    this.jackpotContainer.zIndex = 2;

    const jackpotLd = this.jackpotContainer.configData?.layoutData?.Portrait;
    if (jackpotLd) {
      jackpotLd.px = 238;
      jackpotLd.py = 605;
      UIUtil.adjustElement(this.jackpotContainer);
    }

    AnimationProxy.animateTween(this.jackpotContainer, {
      alpha: 1,
      duration: 0.5,
      ease: 'back.out(1.7)',
    });
  }

  private readonly transitionBasePositions = new Map<any, { x: number; y: number }>();

  private restoreFromTransition(target: any): void {
    AnimationProxy.killTweensOf(target);
    target.visible = true;
    target.alpha = 1;
    const base = this.transitionBasePositions.get(target);
    if (base) {
      target.x = base.x;
      target.y = base.y;
    }
  }

  public animateGameElementsTransition(show: boolean, onComplete?: () => void): void {
    const targets = [this.gameTitle, this.jackpotContainer, this.kittiebankComp, this.slotReel].filter(Boolean);
    const stagger = 0.08;

    if (targets.length === 0) {
      onComplete?.();
      return;
    }

    let remaining = targets.length;
    const settle = () => {
      remaining--;
      if (remaining === 0) onComplete?.();
    };

    targets.forEach((target: any, index: number) => {
      AnimationProxy.killTweensOf(target);
      const delay = index * stagger;

      if (show) {
        target.visible = true;
        target.alpha = 0;
        AnimationProxy.animateTween(target, {
          alpha: 1,
          duration: 0.6,
          delay,
          ease: 'sine.out',
          onComplete: settle,
        });
      } else if (target.visible) {
        AnimationProxy.animateTween(target, {
          alpha: 0,
          duration: 0.4,
          delay,
          ease: 'sine.in',
          onComplete: () => {
            target.visible = false;
            settle();
          },
        });
      } else {
        settle();
      }
    });
  }

  private getInterfaceSize(): number {
    const interfaceSize = Number(appModel.featureResult?.featureData?.interfaceSize);
    if (!isNaN(interfaceSize) && interfaceSize !== 0) {
      return interfaceSize;
    }
    if (!appModel.getNextFeatureType()) {
      return 0;
    }
    const subFeatureType =
      appModel.getNextSubFeatureType()?.toUpperCase() ?? appModel.getFeatureSubType()?.toUpperCase();
    return subFeatureType === FEATURE_NAMES.GREEN ? 5 : 4;
  }

  private changeReelInterface(): void {
    EventHandler.dispatchEvent('UPDATE_REEL_LAYOUT', this.getInterfaceSize());
  }

  protected animateWheelDoor(onDoorOpened?: () => void): void {
    const doorSubFeatureType =
      appModel.getNextSubFeatureType()?.toUpperCase() ?? appModel.getFeatureSubType()?.toUpperCase();
    if (doorSubFeatureType === FEATURE_NAMES.GREEN) {
      this.slotReel.visible = true;
      this.wheelBaseGreen.visible = true;
      this.feautreHeadingGreen.visible = true;
    } else {
      this.wheelBaseGreen.visible = false;
      this.feautreHeadingGreen.visible = false;
    }
    this.restoreFromTransition(this.kittiebankComp);
    this.addChild(this.kittiebankComp);

    this.updateAllConfigs('FreeSpins');

    UIUtil.adjustElement(this.gameTitle);
    (this.kittiebankComp as any).resizeView();

    const interfaceSize = this.getInterfaceSize();
    if (interfaceSize === 4 || interfaceSize === 5) {
      this.resizeView();
    }

    (this.slotReel as any).resizeView();

    if (this.vaultAnim) {
      this.doorMask.visible = true;
      this.vaultAnim.mask = this.doorMask;
      this.vaultAnim.scale.set(0.6);
      this.vaultAnim.visible = true;
    }
    const featureHeadings = [this.feautreHeadingGreen, this.feautreHeadingBlue, this.feautreHeadingRed];
    this.removeChild(...featureHeadings);
    this.addChild(this.vaultAnim, this.wheelRim);
    this.addChild(...featureHeadings);
    this.wheelRim.alpha = 1;

    if (GameProxy.config.subFeatureAwardAnnounced && doorSubFeatureType !== FEATURE_NAMES.GREEN) {
      if (this.vaultAnim) {
        // this.vaultAnim.visible = false;
      }
      this.makeWheelInteractive();
      onDoorOpened?.();
      return;
    }

    if (this.vaultAnim) {
      this.vaultAnim.playAnimation({
        state: 'Unlock',
        loop: false,
        reset: true,
      });

      this.vaultAnim.addEventListener('complete', () => {
        this.vaultAnim.removeEventListners();
        this.moveWheelDoor(onDoorOpened);
      });
    }
  }
  protected moveWheelDoor(onDoorOpened?: () => void): void {
    if (!this.vaultAnim) return;

    // Calculate open position
    const shiftX = 1556;

    if (this.vaultClosedX && this.vaultAnim?.configData?.layoutData) {
      this.vaultAnim.configData.layoutData.Desktop.x = this.vaultClosedX.Desktop - shiftX;
      this.vaultAnim.configData.layoutData.Portrait.x = this.vaultClosedX.Portrait - shiftX;
      this.vaultAnim.configData.layoutData.Landscape.x = this.vaultClosedX.Landscape - shiftX;
    }

    AnimationProxy.animateTween(this.vaultAnim, {
      duration: 1.2,
      x: this.vaultAnim.x - shiftX,
      onComplete: () => {
        // this.vaultAnim.visible = false;
        this.makeWheelInteractive();
        onDoorOpened?.();
        StateManager.doNextStep();
      },
    });
  }

  protected closeWheelDoor(onDoorClosed?: () => void): void {
    if (!this.vaultAnim) {
      onDoorClosed?.();
      return;
    }

    this.doorMask.visible = true;
    this.vaultAnim.mask = this.doorMask;
    this.vaultAnim.scale.set(0.6);
    this.vaultAnim.visible = true;

    const shiftX = 1556;

    if (this.vaultClosedX && this.vaultAnim?.configData?.layoutData) {
      this.vaultAnim.configData.layoutData.Desktop.x = this.vaultClosedX.Desktop;
      this.vaultAnim.configData.layoutData.Portrait.x = this.vaultClosedX.Portrait;
      this.vaultAnim.configData.layoutData.Landscape.x = this.vaultClosedX.Landscape;
    }

    AnimationProxy.animateTween(this.vaultAnim, {
      duration: 1.2,
      x: this.vaultAnim.x + shiftX,
      onComplete: () => {
        this.vaultAnim.playAnimation({
          state: 'lock',
          loop: false,
          reset: true,
        });

        // this.vaultAnim.addEventListener('complete', () => {
        this.vaultAnim.removeEventListners();
        setTimeout(() => {
          // this.vaultAnim.visible = false;
        }, 1000);
        onDoorClosed?.();
        // });
        // this.hidePickFeatureUI({ callback: onDoorClosed })
      },
    });
  }

  private onShowExtraSpinAnim(): void {
    const extraSpinTextCenter: any = this.slotReel?.elementsList?.['extraSpinTextCenter'];

    if (!extraSpinTextCenter) {
      StateManager.goToState(STATES.FS_SPIN_START_STATE);
      return;
    }

    const text = Util.getContent('ExtraSpinText');
    extraSpinTextCenter.text = text;

    AnimationProxy.killTweensOf(extraSpinTextCenter);

    const ENTER_DURATION = 0.5;
    const HOLD_DURATION = 1.0;
    const EXIT_DURATION = 0.4;
    const OFFSET_Y = 300;

    if (extraSpinTextCenter._naturalY === undefined) {
      extraSpinTextCenter._naturalY = extraSpinTextCenter.y;
    }
    const naturalY = extraSpinTextCenter._naturalY;

    // Set initial state: start below the reel center, invisible
    extraSpinTextCenter.scale.set(1);
    extraSpinTextCenter.y = naturalY + OFFSET_Y; // start at reel bottom
    extraSpinTextCenter.alpha = 0;

    // ENTER: slide up from bottom to center + fade in
    AnimationProxy.animateTween(extraSpinTextCenter, {
      duration: ENTER_DURATION,
      y: naturalY,
      alpha: 1,
      ease: 'power2.out',
    });

    AnimationProxy.animateTween(
      extraSpinTextCenter,
      {
        duration: EXIT_DURATION,
        y: naturalY - OFFSET_Y, // exits toward top of reel
        alpha: 0,
        ease: 'power2.in',
        delay: ENTER_DURATION + HOLD_DURATION,
      },
      false,
    );
  }

  private showPickJackpotFeatureScreen() {
    this.wheelBaseRed.visible = true;
    this.feautreHeadingRed.visible = true;
    const pickjackoptFeatureScreen = this.elementsList['pickjackpotContainer'];
    pickjackoptFeatureScreen.enter();
    EventHandler.dispatchEvent('STOP_BLUE_WHEEL_BG_SOUND');
    EventHandler.dispatchEvent(SlotEvents.PLAY_PICK_FEATURE_BG_SOUND);
  }

  private showWheel(): void {
    this.wheelBaseBlue.visible = true;
    this.feautreHeadingBlue.visible = true;
    const wheelBG = this.elementsList['wheelContainer'];
    wheelBG.visible = true;
    wheelBG.renderable = true;
    EventHandler.dispatchEvent(SlotEvents.STOP_PICK_FEATURE_BG_SOUND);
    EventHandler.dispatchEvent('PLAY_BLUE_WHEEL_BG_SOUND');
  }

  private makeWheelInteractive(): void {
    const wheelBG = this.elementsList['wheelContainer'];
    wheelBG.interactive = true;
  }

  private hideWheelFeatureUI() {
    this.feautreHeadingBlue.visible = false;
    this.wheelBaseBlue.visible = false;
    const wheelBG = this.elementsList['wheelContainer'];
    wheelBG.visible = false;
    wheelBG.renderable = false;
    wheelBG.interactive = false;
    if (
      appModel.getFeatureSubType().toUpperCase() === FEATURE_NAMES.BLUE &&
      appModel.getNextSubFeatureType()?.toUpperCase() === FEATURE_NAMES.RED
    ) {
      this.animateWheelDoor(this.revealJackpotContainer.bind(this));
    }
  }

  private hidePickBonusUI() {
    this.feautreHeadingRed.visible = false;
    this.jackpotContainer.visible = false;
  }

  private hidePickFeatureUI(data?: { callback?: () => void }): void {
    this.feautreHeadingRed.visible = false;
    this.resetMachineLayout();
    EventHandler.dispatchEvent('RESET_KITTIEBANK_ANIM');
    this.animateGameElementsTransition(true, () => {
      this.wheelBaseRed.visible = false;
      this.wheelBaseGreen.visible = false;
      this.feautreHeadingGreen.visible = false;
      this.hideWheelFeatureUI();

      data?.callback?.();
    });
  }

  public showCoinAnimations() {
    // 1. Gather all coins into a single array by scanning the actual physical reels on the screen
    const allCoins: { col: number; row: number; bank: 'meow' | 'mew' | 'mii'; symbol: string }[] = [];

    const reel: any = this.slotReel;
    const maxRow = (reel.reelsData.noOfRows || 3) - 1;

    for (let col = 0; col < reel.symbolsArray.length; col++) {
      if (Array.isArray(reel.symbolsArray[col])) {
        for (let row = 0; row <= maxRow; row++) {
          const symbolRow = row + 1; // +1 to skip top padding
          const targetSymbol = reel.symbolsArray[col][symbolRow];
          if (targetSymbol && typeof targetSymbol.getSymbolName === 'function') {
            const symbolName = targetSymbol.getSymbolName();
            if (symbolName === 'RC') {
              allCoins.push({ col, row, bank: 'meow', symbol: 'RC' });
            } else if (symbolName === 'BC') {
              allCoins.push({ col, row, bank: 'mii', symbol: 'BC' });
            } else if (symbolName === 'GC') {
              allCoins.push({ col, row, bank: 'mew', symbol: 'GC' });
            }
          }
        }
      }
    }

    if (allCoins.length > 0) {
      // 2. Sort coins left-to-right (by column, then row if in same column)
      allCoins.sort((a, b) => {
        if (a.col === b.col) return a.row - b.row;
        return a.col - b.col;
      });

      // 3. Animate with staggered timing (coins can overlap slightly)
      let currentDelay = 0;
      const animationDuration = 1000;
      const delayBetweenCoins = 400;

      allCoins.forEach((coin) => {
        const timeoutId = setTimeout(() => {
          this.animateSymbolToKittyBank(coin.col, coin.row, coin.bank, coin.symbol);
        }, currentDelay);
        this.coinAnimationTimeouts.push(timeoutId);
        currentDelay += delayBetweenCoins;
      });

      // 4. Move to next state after the very last animation finishes
      const totalWaitTime = currentDelay + animationDuration;
      setTimeout(() => {
        StateManager.doNextStep();
      }, totalWaitTime);
    } else {
      StateManager.doNextStep();
    }
  }

  private holdGreyedOutSymbol(targetSymbol: any): void {
    if (typeof targetSymbol.resetSymbol !== 'function' || typeof targetSymbol.setNewSymbol !== 'function') {
      return;
    }

    const originalResetSymbol = targetSymbol.resetSymbol.bind(targetSymbol);
    const originalSetNewSymbol = targetSymbol.setNewSymbol.bind(targetSymbol);

    // Block the reel's automatic reset so the symbol keeps scrolling in grey.
    targetSymbol.resetSymbol = () => {
      // intentional no-op
    };

    // Once the reel actually recycles this symbol with a new result, let it land fresh.
    targetSymbol.setNewSymbol = (data: any, reelno: number) => {
      targetSymbol.resetSymbol = originalResetSymbol;
      targetSymbol.setNewSymbol = originalSetNewSymbol;
      originalSetNewSymbol(data, reelno);
      if (targetSymbol.symbol) {
        targetSymbol.symbol.alpha = 1;
      }
    };
  }

  public animateSymbolToKittyBank(col: number, row: number, bankName: 'meow' | 'mew' | 'mii', symbolName: string) {
    const kittieBankComp = this.elementsList['kittiebankComp'];
    if (!kittieBankComp) {
      return;
    }

    const targetBankComp = kittieBankComp.elementsList[bankName];
    if (!targetBankComp) {
      return;
    }

    const symbolRow = row + 1;

    const strtGlobalPos = this.slotReel.getSymbolPosition(col, symbolRow);
    const targetBank = targetBankComp.elementsList?.['spineAnim'] || targetBankComp;

    const startPos = this.toLocal(strtGlobalPos);

    const skinNameByBank: Record<'meow' | 'mew' | 'mii', string> = { meow: 'red', mew: 'Green', mii: 'Blue' };
    const skinName = skinNameByBank[bankName];
    const movingSymbol = new ReelSymbolSpine({
      data: {
        name: symbolName,
        spineName: 'Coin',
        skin: skinName,
        idleAnim: 'none',
        winAnim: 'Win',
      },
    });
    movingSymbol.showWinning();

    const reel: any = this.slotReel;
    const targetSymbol = reel.symbolsArray?.[col]?.[symbolRow];
    if (targetSymbol) {
      if (typeof targetSymbol.clearCallBackAnimation === 'function') {
        targetSymbol.clearCallBackAnimation();
      }
      if (targetSymbol.symbol) {
        targetSymbol.symbol.texture = Texture.from(symbolName + '_grey');
        targetSymbol.symbol.alpha = 0.2;
        this.holdGreyedOutSymbol(targetSymbol);
      }
    }

    movingSymbol.position.copyFrom(startPos);
    movingSymbol.scale.set(1);

    this.addChild(movingSymbol);

    const arcHeight = -700;
    const c1 = new Point(startPos.x, startPos.y + arcHeight);

    EventHandler.dispatchEvent('PLAY_TRAIL_SOUND');

    const tween = AnimationProxy.animateTween(movingSymbol, {
      duration: 1,
      onUpdate: () => {
        const t = tween.progress();

        // Dynamically recalculate end position to handle resize during animation
        const currentEndGlobalPos = targetBank.getGlobalPosition();
        const currentEndPos = this.toLocal(currentEndGlobalPos);
        const currentC2 = new Point(currentEndPos.x, currentEndPos.y + arcHeight);

        const bezierPoint = getBezierPoint(t, startPos, c1, currentC2, currentEndPos);

        if (t > 0.85 && movingSymbol.parent !== kittieBankComp && kittieBankComp.visible) {
          const targetIndex = kittieBankComp.getChildIndex(targetBankComp);
          kittieBankComp.addChildAt(movingSymbol, targetIndex);
        }

        if (movingSymbol.parent === kittieBankComp) {
          const localPos = kittieBankComp.toLocal(bezierPoint, this);
          movingSymbol.position.copyFrom(localPos);
        } else {
          movingSymbol.position.copyFrom(bezierPoint);
        }

        movingSymbol.scale.set(lerp(1, 0.5, t));
      },
      onComplete: () => {
        if (movingSymbol.parent) {
          movingSymbol.parent.removeChild(movingSymbol);
        }
        movingSymbol.destroy();

        EventHandler.dispatchEvent('PLAY_COLLECT_SOUND');

        const animPrefixByBank: Record<'meow' | 'mew' | 'mii', string> = {
          meow: '3_RED',
          mew: '1_GREEN',
          mii: '2_BLUE',
        };
        const animPrefix = animPrefixByBank[bankName];
        const collectAnim = `${animPrefix}_Collect`;
        const idleAnim = targetBankComp.configData?.defaultState || `${animPrefix}_Static`;

        if (targetBank && typeof targetBank.playAnimation === 'function') {
          targetBank.playAnimation({
            state: collectAnim,
            loop: false,
            reset: false,
            defaultMix: 0.1,
            nextState: idleAnim,
            nextLoop: true,
          });
        }
      },
    });
  }

  private showKittieBankBreak(): void {
    const subFeatureType = appModel.getNextSubFeatureType()?.toUpperCase();
    let bankName: 'meow' | 'mew' | 'mii' = 'mii';
    if (subFeatureType === FEATURE_NAMES.RED) {
      bankName = 'meow';
    } else if (subFeatureType === FEATURE_NAMES.GREEN) {
      bankName = 'mew';
    }
    EventHandler.dispatchEvent('PLAY_KITTIE_BLAST', {
      bankName,
      callback: () => {
        this.animateGameElementsTransition(false, () => {
          setTimeout(() => {
            StateManager.doNextStep();
          }, 500);
        });
      },
    });
  }

  public updateAllConfigs(featureName: string): void {
    const interfaceSize = this.getInterfaceSize();

    switch (featureName) {
      case 'Base':
        if (this.configData?.layoutData?.Portrait && this.machineBasePaddingPortrait) {
          this.configData.layoutData.Portrait.vPaddingPerc = this.machineBasePaddingPortrait.v;
          this.configData.layoutData.Portrait.hPaddingPerc = this.machineBasePaddingPortrait.h;
        }

        if (this.vaultClosedX && this.vaultAnim?.configData?.layoutData) {
          this.vaultAnim.configData.layoutData.Desktop.x = this.vaultClosedX.Desktop;
          this.vaultAnim.configData.layoutData.Portrait.x = this.vaultClosedX.Portrait;
          this.vaultAnim.configData.layoutData.Landscape.x = this.vaultClosedX.Landscape;
          this.vaultAnim.rotation = 0;
        }

        if (this.reelBaseLayoutData && this.slotReel?.configData?.layoutData) {
          Object.assign(this.slotReel.configData.layoutData.Desktop, this.reelBaseLayoutData.Desktop);
          Object.assign(this.slotReel.configData.layoutData.Portrait, this.reelBaseLayoutData.Portrait);
          Object.assign(this.slotReel.configData.layoutData.Landscape, this.reelBaseLayoutData.Landscape);
        }

        if (this.kittiebankBaseX && this.kittiebankComp?.configData?.layoutData) {
          const kld = this.kittiebankComp.configData.layoutData;
          kld.Desktop.x = this.kittiebankBaseX.Desktop;
          kld.Portrait.x = this.kittiebankBaseX.Portrait;
          kld.Landscape.x = this.kittiebankBaseX.Landscape;
          if (this.kittiebankBasePortraitY !== null) {
            kld.Portrait.y = this.kittiebankBasePortraitY;
          }
        }

        if (this.gameTitleBaseLayoutData && this.gameTitle?.configData) {
          this.gameTitle.configData.layoutData = this.gameTitleBaseLayoutData;
        }
        break;

      case 'FreeSpins':
        if (this.gameTitle?.configData?.fsLayoutData) {
          this.gameTitle.configData.layoutData = this.gameTitle.configData.fsLayoutData;
        }

        const kld = this.kittiebankComp?.configData?.layoutData;
        if (this.kittiebankBaseX && kld) {
          const shift = 60;
          kld.Desktop.x = this.kittiebankBaseX.Desktop - shift;
          kld.Portrait.x = 230;
          kld.Landscape.x = this.kittiebankBaseX.Landscape - shift;
          kld.Portrait.y = -90;
        }

        const reelLd = this.slotReel?.configData?.layoutData;
        if (reelLd) {
          if (interfaceSize === 4) {
            reelLd.Desktop.x = 650;
            reelLd.Desktop.y = 436;
            reelLd.Desktop.scale = 0.65;
            reelLd.Portrait.x = 320;
            reelLd.Portrait.y = 966;
            reelLd.Portrait.scale = 0.65;
            reelLd.Landscape.x = 650;
            reelLd.Landscape.y = 436;
            reelLd.Landscape.scale = 0.65;
          } else if (interfaceSize === 5) {
            reelLd.Desktop.x = 718;
            reelLd.Desktop.y = 457;
            reelLd.Desktop.scale = 0.58;
            reelLd.Portrait.x = 394;
            reelLd.Portrait.y = 987;
            reelLd.Portrait.scale = 0.58;
            reelLd.Landscape.x = 718;
            reelLd.Landscape.y = 457;
            reelLd.Landscape.scale = 0.58;
          }
        }

        // Apply the resize after all layout configurations have been updated
        this.resizeView();

        // CRITICAL: adjust the main container ONLY AFTER the children have been resized!
        UIUtil.adjustElement(this);
        break;

      case 'BigWin':
        if (this.bigWinsComp) {
          const isPortrait = DeviceProxy.config.isPortrait;
          const winTicker = this.bigWinsComp.elementsList?.['winTicker'];

          const actualReelRows = (this.slotReel as any)?.reelsData?.noOfRows;
          const currentInterfaceSize = actualReelRows === 3 ? 0 : interfaceSize;

          const applyOrientationPos = (el: any, cfg: any) => {
            if (!el || !cfg) return;
            const ox = isPortrait ? cfg.px : cfg.lx;
            const oy = isPortrait ? cfg.py : cfg.ly;
            el.x = ox == undefined ? cfg.x : ox;
            el.y = oy == undefined ? cfg.y : oy;
          };
          const els = this.bigWinsComp.elementsList ?? {};
          const bigWinAnim = (this.bigWinsComp as any).bigWinAnim;
          applyOrientationPos(bigWinAnim, this.bigWinsComp.configData?.data?.bigWinAnim);
          applyOrientationPos(els['bigWinText'], els['bigWinText']?.configData);
          applyOrientationPos(els['featureWinText'], els['featureWinText']?.configData);
          applyOrientationPos(els['winTickerBW'], els['winTickerBW']?.configData);

          const guideRect = els['guideRect'];
          const setGuideRect = (x: number, y: number, width: number, height: number) => {
            if (!guideRect) return;
            guideRect.position.set(x, y);
            guideRect.width = width;
            guideRect.height = height;
          };

          if (currentInterfaceSize === 4) {
            this.bigWinsComp.scale.set(0.65);
            this.bigWinsComp.position.set(...(isPortrait ? [374, 1048] : [718, 510]));
            if (winTicker) {
              winTicker.x = 772;
              winTicker.y = 320;
            }
            setGuideRect(-60, -297, 1660, 1313.6);
            if (bigWinAnim) {
              bigWinAnim.x = 755;
              bigWinAnim.scale.set(isPortrait ? 1 : 0.84);
              if (!isPortrait) bigWinAnim.y = 640;
            }
            if (els['bigWinText']) {
              if (isPortrait) {
                els['bigWinText'].x = 756;
              } else {
                els['bigWinText'].y = -120;
              }
            }
            if (els['winTickerBW']) {
              if (isPortrait) {
                els['winTickerBW'].x = 800;
              } else {
                els['winTickerBW'].x = 755;
                if (isPortrait) els['winTicker'].x = 855;
              }
            }
          } else if (currentInterfaceSize === 5) {
            this.bigWinsComp.scale.set(0.58);
            this.bigWinsComp.position.set(...(isPortrait ? [428, 1190] : [772, 660]));
            if (winTicker) {
              winTicker.x = 762;
              winTicker.y = 180;
            }
            setGuideRect(-65, -603, 1660, 1623);
            if (bigWinAnim) {
              bigWinAnim.x = 752;
              bigWinAnim.scale.set(isPortrait ? 1 : 0.84);
              if (!isPortrait) bigWinAnim.y = 650;
            }
            if (els['bigWinText']) {
              if (isPortrait) {
                els['bigWinText'].x = 756;
              } else {
                els['bigWinText'].y = -120;
              }
            }
            if (els['winTickerBW']) {
              if (isPortrait) {
                els['winTickerBW'].x = 778;
              } else {
                els['winTickerBW'].x = 752;
              }
            }
          } else {
            this.bigWinsComp.scale.set(1);
            const bwBase = this.bigWinsComp.configData?.layoutData?.[isPortrait ? 'Portrait' : 'Landscape'];
            if (bwBase) {
              this.bigWinsComp.position.set(bwBase.x, bwBase.y);
            }
            if (winTicker) {
              winTicker.x = 755;
              winTicker.y = 480;
            }
            if (bigWinAnim) {
              bigWinAnim.x = isPortrait ? 838 : 744;
              bigWinAnim.y = 711;
              bigWinAnim.scale.set(0.7);
            }
            if (els['winTickerBW']) {
              els['winTickerBW'].x = isPortrait ? 800 : 750;
              els['winTickerBW'].y = 887;
            }
            setGuideRect(isPortrait ? 28 : -62, isPortrait ? 56 : 46, 1660, 980);
          }
        }
        break;
    }
    if (DeviceProxy.config.isPortrait) this.bigWinsComp.elementsList['winTicker'].x = 855;
  }

  // reset all layout mutations made during free spins
  private resetMachineLayout(): void {
    this.updateAllConfigs('Base');

    EventHandler.dispatchEvent('UPDATE_REEL_LAYOUT', 3);

    const jackpotLd = this.jackpotContainer?.configData?.layoutData?.Portrait;
    if (jackpotLd) {
      delete jackpotLd.px;
      delete jackpotLd.py;
    }

    if (this.jackpotContainer) {
      this.jackpotContainer.zIndex = 0;
    }

    (this.slotReel as any).resizeView();

    this.wheelBase.alpha = 1;
    // if (this.vaultAnim) this.vaultAnim.visible = false;
    // this.doorMask.visible = false;
    this.wheelBaseGreen.visible = false;
    this.feautreHeadingGreen.visible = false;

    this.jackpotContainer.visible = true;
    this.kittiebankComp.visible = true;
    this.gameTitle.visible = true;

    this.addChild(this.jackpotContainer, this.slotReel, this.gameTitle, this.kittiebankComp);
    this.resizeView();

    EventHandler.dispatchEvent(AppEvents.APP_RESIZE);
  }

  public updateBigWinsCompScale(): void {
    this.updateAllConfigs('BigWin');
  }

  private maskWheelTestToRim(): void {
    if (!this.wheelContainer || !this.wheelRim) {
      return;
    }

    if (!this.wheelMask) {
      this.wheelMask = new PixGraphics();
      this.addChild(this.wheelMask);
      this.wheelContainer.mask = this.wheelMask;
    }

    const rimBounds = this.wheelRim.getBounds();
    const rimGlobalCenter = new Point(rimBounds.x + rimBounds.width / 2, rimBounds.y + rimBounds.height / 2);
    const globalRadius = (Math.min(rimBounds.width, rimBounds.height) / 2) * 0.9;

    // Convert both center and an edge point into `this`'s local space,
    // so the radius correctly accounts for any ancestor scaling.
    const rimGlobalEdge = new Point(rimGlobalCenter.x + globalRadius, rimGlobalCenter.y);

    const rimLocalCenter = this.toLocal(rimGlobalCenter);
    const rimLocalEdge = this.toLocal(rimGlobalEdge);
    const radius = rimLocalEdge.x - rimLocalCenter.x;

    this.wheelMask.clear();
    this.wheelMask.circle(rimLocalCenter.x, rimLocalCenter.y, radius).fill(0xffffff);
  }

  protected override resizeView(): void {
    super.resizeView();
    this.maskWheelTestToRim();
    this.updateBigWinsCompScale();
    const featureType = appModel.getNextSubFeatureType()?.toUpperCase() ?? appModel.getFeatureSubType()?.toUpperCase();
    const isFeatureActive = this.wheelBaseRed?.visible || this.wheelBaseBlue?.visible || this.wheelBaseGreen?.visible;
    if ((featureType === 'RED' || featureType === 'BLUE') && isFeatureActive) {
      this.gameTitle.visible = false;
    }
  }
}
