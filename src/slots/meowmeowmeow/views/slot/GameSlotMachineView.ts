import { SlotMachineView } from '@core/views/slotmachine/SlotMachineView';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import ReelSymbolSpine from '@core/views/slotmachine/ReelSymbolSpine';
import { Point, Texture } from 'pixi.js';
import { getBezierPoint, lerp } from '@core/utils/MathUtils';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
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
  private readonly wheelRim: PixSprite;
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
    EventHandler.addEventListener(SlotEvents.HIDE_PICK_FEATURE_UI, this.hideWheel.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_SCATTER_TRIGGER_ONSCREEN, this.onShowExtraSpinAnim.bind(this));
    EventHandler.addEventListener('SHOW_GREEN_TRANSITION', this.showGreenTransition.bind(this));
    EventHandler.addEventListener('SHOW_PICK_FEATURE_TRANSITION', this.showPickFeatureTransition.bind(this));
    EventHandler.addEventListener('SHOW_GREEN_KITTIEBANK_BREAK', this.showGreenKittieBankBreak.bind(this));
    EventHandler.addEventListener('SHOW_KITTIEBANK_BREAK', this.showKittieBankBreak.bind(this));
    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_UI_END, this.resetMachineLayout.bind(this));

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
    this.wheelRim = this.elementsList['wheelRim'];
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

  protected showGreenTransition(): void {
    if (this.slotReel && (this.slotReel as any).winController) {
      clearTimeout((this.slotReel as any).winController.timeoutId);
    }
    this.slotReel.visible = false;
    this.gameTitle.visible = false;
    this.jackpotContainer.visible = false;
    this.kittiebankComp.visible = false;
    this.changeReelInterface();
    this.animateWheelDoor();
  }

  protected showGreenKittieBankBreak(): void {
    EventHandler.dispatchEvent('PLAY_KITTIE_BLAST', {
      bankName: 'mew',
      callback: () => {
        StateManager.doNextStep();
      },
    });
  }

  protected showPickFeatureTransition(): void {
    this.slotReel.visible = false;
    this.jackpotContainer.visible = false;
    this.kittiebankComp.visible = false;
    const isRedFeature = appModel.getNextSubFeatureType() !== 'Blue';
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

  private getInterfaceSize(): number {
    const interfaceSize = Number(appModel.featureResult?.featureData?.interfaceSize);
    if (!isNaN(interfaceSize) && interfaceSize !== 0) {
      return interfaceSize;
    }
    if (!appModel.getNextFeatureType()) {
      return 0;
    }
    return appModel.getNextSubFeatureType() === 'Green' ? 5 : 4;
  }

  private changeReelInterface(): void {
    EventHandler.dispatchEvent('UPDATE_REEL_LAYOUT', this.getInterfaceSize());
  }

  protected animateWheelDoor(onDoorOpened?: () => void): void {
    if (appModel.getNextSubFeatureType() === 'Green') {
      this.slotReel.visible = true;
      this.wheelBaseGreen.visible = true;
      this.feautreHeadingGreen.visible = true;
    } else {
      this.wheelBaseGreen.visible = false;
      this.feautreHeadingGreen.visible = false;
    }
    this.kittiebankComp.visible = true;
    this.addChild(this.kittiebankComp);

    this.updateAllConfigs('FreeSpins');
    if (this.configData?.layoutData?.Portrait) {
    }

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
    const shiftX = 1506;

    if (this.vaultClosedX && this.vaultAnim?.configData?.layoutData) {
      this.vaultAnim.configData.layoutData.Desktop.x = this.vaultClosedX.Desktop - shiftX;
      this.vaultAnim.configData.layoutData.Portrait.x = this.vaultClosedX.Portrait - shiftX;
      this.vaultAnim.configData.layoutData.Landscape.x = this.vaultClosedX.Landscape - shiftX;
    }

    AnimationProxy.animateTween(this.vaultAnim, {
      duration: 1.2,
      x: this.vaultAnim.x - shiftX,
      onComplete: () => {
        this.vaultAnim.visible = false;
        this.makeWheelInteractive();
        onDoorOpened?.();
        StateManager.doNextStep();
      },
    });
  }

  private onShowExtraSpinAnim(): void {
    const extraSpinTextCenter: any = this.slotReel?.elementsList?.['extraSpinTextCenter'];

    if (!extraSpinTextCenter) {
      console.warn('Missing extraSpinTextCenter element');
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
  }

  private showWheel(): void {
    this.wheelBaseBlue.visible = true;
    this.feautreHeadingBlue.visible = true;
    const wheelBG = this.elementsList['wheelContainer'];
    wheelBG.visible = true;
    wheelBG.renderable = true;
  }

  private makeWheelInteractive(): void {
    const wheelBG = this.elementsList['wheelContainer'];
    wheelBG.interactive = true;
  }

  private hideWheel(): void {
    this.wheelBaseRed.visible = false;
    this.wheelBaseBlue.visible = false;
    this.feautreHeadingBlue.visible = false;
    this.feautreHeadingGreen.visible = false;
    this.feautreHeadingRed.visible = false;
    this.wheelBaseGreen.visible = false;
    this.feautreHeadingGreen.visible = false;
    this.gameTitle.visible = true;
    const wheelBG = this.elementsList['wheelContainer'];
    wheelBG.visible = false;
    wheelBG.renderable = false;
    wheelBG.interactive = false;
    this.slotReel.visible = true;
    this.resetMachineLayout();
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
    targetSymbol.resetSymbol = () => {};

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
    const endGlobalPos = targetBank.getGlobalPosition();

    const startPos = this.toLocal(strtGlobalPos);
    const endPos = this.toLocal(endGlobalPos);

    const skinName = bankName === 'meow' ? 'red' : bankName === 'mew' ? 'Green' : 'Blue';
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
    const c2 = new Point(endPos.x, endPos.y + arcHeight);
    const self = this;

    AnimationProxy.animateTween(movingSymbol, {
      duration: 1,
      onUpdate: function () {
        const t = this.progress();
        const bezierPoint = getBezierPoint(t, startPos, c1, c2, endPos);

        if (t > 0.85 && movingSymbol.parent !== kittieBankComp && kittieBankComp.visible) {
          const targetIndex = kittieBankComp.getChildIndex(targetBankComp);
          kittieBankComp.addChildAt(movingSymbol, targetIndex);
        }

        if (movingSymbol.parent === kittieBankComp) {
          const localPos = kittieBankComp.toLocal(bezierPoint, self);
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

        const animPrefix = bankName === 'meow' ? '3_RED' : bankName === 'mew' ? '1_GREEN' : '2_BLUE';
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
    const bankName = subFeatureType === 'RED' ? 'meow' : subFeatureType === 'GREEN' ? 'mew' : 'mii';
    EventHandler.dispatchEvent('PLAY_KITTIE_BLAST', {
      bankName,
      callback: () => {
        StateManager.doNextStep();
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

        if (this.configData?.layoutData?.Portrait) {
          this.configData.layoutData.Portrait.vPaddingPerc = -0.08;
          this.configData.layoutData.Portrait.hPaddingPerc = -0.02;
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
            reelLd.Portrait.x = 306;
            reelLd.Portrait.y = 966;
            reelLd.Portrait.scale = 0.65;
            reelLd.Landscape.x = 650;
            reelLd.Landscape.y = 436;
            reelLd.Landscape.scale = 0.65;
          } else if (interfaceSize === 5) {
            reelLd.Desktop.x = 718;
            reelLd.Desktop.y = 457;
            reelLd.Desktop.scale = 0.58;
            reelLd.Portrait.x = 374;
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
          const subFeatureType =
            appModel.getNextSubFeatureType() ||
            appModel.getUnfinishedFeatureSubType() ||
            appModel.featureResult?.featureData?.subFeatureType ||
            '';
          const isRedFeature = subFeatureType.toUpperCase() === 'RED';

          const actualReelRows = (this.slotReel as any)?.reelsData?.noOfRows;
          const currentInterfaceSize = actualReelRows === 3 ? 0 : interfaceSize;

          const applyOrientationPos = (el: any, cfg: any) => {
            if (!el || !cfg) return;
            const ox = isPortrait ? cfg.px : cfg.lx;
            const oy = isPortrait ? cfg.py : cfg.ly;
            el.x = ox != undefined ? ox : cfg.x;
            el.y = oy != undefined ? oy : cfg.y;
          };
          const els = this.bigWinsComp.elementsList ?? {};
          applyOrientationPos((this.bigWinsComp as any).bigWinAnim, this.bigWinsComp.configData?.data?.bigWinAnim);
          applyOrientationPos(els['bigWinText'], els['bigWinText']?.configData);
          applyOrientationPos(els['featureWinText'], els['featureWinText']?.configData);

          if (currentInterfaceSize === 4 && !isRedFeature) {
            this.bigWinsComp.scale.set(0.65);
            this.bigWinsComp.position.set(...(isPortrait ? [374, 1048] : [718, 518]));
            if (winTicker) {
              winTicker.x = 772;
              winTicker.y = 320;
            }
          } else if (currentInterfaceSize === 5 && !isRedFeature) {
            this.bigWinsComp.scale.set(0.58);
            this.bigWinsComp.position.set(...(isPortrait ? [428, 1190] : [772, 660]));
            if (winTicker) {
              winTicker.x = 762;
              winTicker.y = 180;
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
          }
        }
        break;
    }
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

    (this.slotReel as any).resizeView();

    this.wheelBase.alpha = 1;
    this.wheelRim.alpha = 0.5;
    if (this.vaultAnim) this.vaultAnim.visible = false;
    this.doorMask.visible = false;
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
      console.warn('wheelTest or wheelRim missing, cannot apply mask');
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
  }
}
