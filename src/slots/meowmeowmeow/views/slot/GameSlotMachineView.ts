import { SlotMachineView } from '@core/views/slotmachine/SlotMachineView';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import ReelSymbolSprite from '@core/views/slotmachine/ReelSymbolSprite';
import ReelSymbolSpine from '@core/views/slotmachine/ReelSymbolSpine';
import { MenuCompAmbientSoundToggleCommand } from '@core/commands/action/MenuCompAmbientSoundToggleCommand';
import { Point, Texture } from 'pixi.js';
import { getBezierPoint, lerp } from '@core/utils/MathUtils';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { SlotEvents } from '@core/events/SlotEvents';
import { Util } from '@core/utils/UtilService';
import { MMMJackpotComp } from '@slots/meowmeowmeow/views/comps/MMMJackpotComp';
import { KittieBankComp } from '@slots/meowmeowmeow/views/comps/KittieBankComp';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { PixSpine } from '@core/pixiwrapper/PixSpine';

export class GameSlotMachineView extends SlotMachineView {
  private readonly extraSpinTextTimeoutId: any;
  private readonly jackpotContainer: MMMJackpotComp;
  private readonly kittiebankComp: KittieBankComp;
  private readonly gameTitle: PixSprite;
  private readonly wheelBase: PixSprite;
  private readonly wheelDoor: PixSprite;
  private readonly wheelRim: PixSprite;
  private readonly doorMask: PixGraphics;
  private readonly vaultAnim: PixSpine;

  // Stores the closed position of the door to restore on feature exit
  private readonly doorClosedX: { Desktop: number; Portrait: number; Landscape: number } | null = null;
  private readonly vaultClosedX: { Desktop: number; Portrait: number; Landscape: number } | null = null;
  private readonly reelBaseLayoutData: {
    Desktop: { x: number; y: number; scale?: number };
    Portrait: { x: number; y: number; scale?: number };
    Landscape: { x: number; y: number; scale?: number };
  } | null = null;

  constructor(config: any) {
    super(config);
    EventHandler.addEventListener(SlotEvents.SHOW_COIN_ANIMATION, this.showCoinAnimations.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_PICK_FEATURE_UI, this.handlePickFeature.bind(this));
    EventHandler.addEventListener(SlotEvents.HIDE_PICK_FEATURE_UI, this.hideWheel.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_SCATTER_TRIGGER_ONSCREEN, this.onShowExtraSpinAnim.bind(this));
    EventHandler.addEventListener('SHOW_GREEN_TRANSITION', this.showGreenTransition.bind(this));
    EventHandler.addEventListener('SHOW_GREEN_KITTIEBANK_BREAK', this.showGreenKittieBankBreak.bind(this));
    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_UI_END, this.resetMachineLayout.bind(this));

    this.jackpotContainer = this.elementsList['jackpotContainer'];
    this.kittiebankComp = this.elementsList['kittiebankComp'];
    this.gameTitle = this.elementsList['gameTitle'];
    this.wheelBase = this.elementsList['wheelBase'];
    this.wheelDoor = this.elementsList['wheelDoor'];
    this.wheelRim = this.elementsList['wheelRim'];
    this.doorMask = this.elementsList['doorMask'];
    this.vaultAnim = this.elementsList['vaultAnim'];
    this.wheelDoor.mask = this.doorMask;

    // Snapshot the closed x values from config to restore on feature exit
    const ld = this.wheelDoor.configData?.layoutData;
    const vld = this.vaultAnim?.configData?.layoutData;
    if (ld) {
      this.doorClosedX = {
        Desktop: ld.Desktop.x,
        Portrait: ld.Portrait.x,
        Landscape: ld.Landscape.x,
      };
    }
    if (vld) {
      this.vaultClosedX = {
        Desktop: vld.Desktop.x,
        Portrait: vld.Portrait.x,
        Landscape: vld.Landscape.x,
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
  }

  protected showGreenTransition(): void {
    this.slotReel.visible = false;
    this.gameTitle.visible = false;
    this.jackpotContainer.visible = false;
    this.kittiebankComp.visible = false;
    this.wheelDoor.alpha = 1;
    this.changeReelInterface();
    this.animateWheelDoor();
  }
  private changeReelInterface(): void {
    const interfaceSize = Number(appModel.featureResult?.featureData?.interfaceSize) || 4;
    EventHandler.dispatchEvent('UPDATE_REEL_LAYOUT', interfaceSize);
  }

  // reset all layout mutations made during free spins
  private resetMachineLayout(): void {
    // Restore vPaddingPerc that was set during animateWheelDoor
    if (this.configData?.layoutData?.Portrait) {
      this.configData.layoutData.Portrait.vPaddingPerc = 0;
    }

    // Restore door to closed position
    if (this.doorClosedX && this.wheelDoor?.configData?.layoutData) {
      this.wheelDoor.configData.layoutData.Desktop.x = this.doorClosedX.Desktop;
      this.wheelDoor.configData.layoutData.Portrait.x = this.doorClosedX.Portrait;
      this.wheelDoor.configData.layoutData.Landscape.x = this.doorClosedX.Landscape;
      this.wheelDoor.rotation = 0;
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
      (this.slotReel as any).resizeView();
    }

    this.wheelBase.alpha = 0.5;
    this.wheelRim.alpha = 0.5;
    this.wheelDoor.alpha = 0.5;
    if (this.vaultAnim) this.vaultAnim.visible = false;

    this.gameTitle.scale.set(1);
    this.jackpotContainer.visible = true;
    this.kittiebankComp.visible = true;

    this.addChild(this.jackpotContainer, this.slotReel, this.gameTitle, this.kittiebankComp);
    this.resizeView();
  }

  protected animateWheelDoor(): void {
    this.slotReel.visible = true;
    this.gameTitle.scale.set(0.72);

    if (DeviceProxy.config.isPortrait) {
      this.gameTitle.x = 871;
      this.gameTitle.y = 716;
    } else {
      this.gameTitle.x = 1215;
      this.gameTitle.y = 190;
    }
    const interfaceSize = Number(appModel.featureResult?.featureData?.interfaceSize) || 4;
    if (interfaceSize === 4 || interfaceSize === 5) {
      if (this.configData.layoutData.Portrait) {
        this.configData.layoutData.Portrait.vPaddingPerc = 0.05;
      }
    }

    // Parent sets the reel position for free spins (boss's pattern)
    const reelLd = this.slotReel.configData?.layoutData;
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
      this.slotReel.resizeView();
    }

    if (this.vaultAnim) {
      this.vaultAnim.mask = this.doorMask;
      this.vaultAnim.scale.set(0.5);
      this.vaultAnim.visible = false;
    }
    this.addChild(this.wheelDoor, this.vaultAnim, this.wheelRim);
    this.gameTitle.visible = true;

    //Spin the golden door
    AnimationProxy.animateTween(this.wheelDoor, {
      duration: 0.25,
      rotation: Util.getRadians(30),
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.moveWheelDoor();
      },
    });
  }
  protected moveWheelDoor(): void {
    if (!this.vaultAnim) return;
    this.vaultAnim.visible = true;
    this.vaultAnim.playAnimation({
      state: 'Unlock',
      loop: false,
      reset: true,
    });

    this.vaultAnim.addEventListener('complete', () => {
      this.vaultAnim.removeEventListners();

      // Calculate open position
      const shiftX = this.wheelDoor.width;

      if (this.doorClosedX && this.wheelDoor.configData?.layoutData) {
        this.wheelDoor.configData.layoutData.Desktop.x = this.doorClosedX.Desktop - shiftX;
        this.wheelDoor.configData.layoutData.Portrait.x = this.doorClosedX.Portrait - shiftX;
        this.wheelDoor.configData.layoutData.Landscape.x = this.doorClosedX.Landscape - shiftX;
      }
      if (this.vaultClosedX && this.vaultAnim?.configData?.layoutData) {
        this.vaultAnim.configData.layoutData.Desktop.x = this.vaultClosedX.Desktop - shiftX;
        this.vaultAnim.configData.layoutData.Portrait.x = this.vaultClosedX.Portrait - shiftX;
        this.vaultAnim.configData.layoutData.Landscape.x = this.vaultClosedX.Landscape - shiftX;
      }

      // Tween the golden door
      AnimationProxy.animateTween(this.wheelDoor, {
        duration: 1.2,
        x: this.wheelDoor.x - shiftX,
        rotation: Util.getRadians(90),
        onComplete: () => {
          this.vaultAnim.visible = false;
          StateManager.doNextStep();
        },
      });

      // Tween the dark vault door at the EXACT same time
      AnimationProxy.animateTween(this.vaultAnim, {
        duration: 1.2,
        x: this.vaultAnim.x - shiftX,
        rotation: Util.getRadians(90),
      });
    });
  }
  private handlePickFeature(SubfeatureType: string) {
    console.warn(SubfeatureType);
    switch (SubfeatureType.toUpperCase()) {
      case 'RED':
        //  Handle for red one
        this.showPickJackpotFeatureScreen();
        break;
      case 'BLUE':
        this.showWheel();
        break;
      default:
        console.error('Invalid SubFeatureType:', SubfeatureType);
        break;
    }
  }

  private showPickJackpotFeatureScreen() {
    const pickjackoptFeatureScreen = this.elementsList['pickjackpotContainer'];
    pickjackoptFeatureScreen.enter();
  }

  private showWheel(): void {
    const wheelBG = this.elementsList['wheelContainer'];
    wheelBG.visible = true;
    wheelBG.renderable = true;
    wheelBG.interactive = true;
  }

  private hideWheel(): void {
    const wheelBG = this.elementsList['wheelContainer'];
    wheelBG.visible = false;
    wheelBG.renderable = false;
    wheelBG.interactive = false;
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

      // 3. Animate sequentially with a small stagger delay
      let currentDelay = 0;
      const delayBetweenCoins = 300;
      const animationDuration = 1000;

      allCoins.forEach((coin) => {
        setTimeout(() => {
          this.animateSymbolToKittyBank(coin.col, coin.row, coin.bank, coin.symbol);
        }, currentDelay);
        currentDelay += delayBetweenCoins;
      });

      // 4. Move to next state after the very last animation finishes
      const totalWaitTime = (allCoins.length - 1) * delayBetweenCoins + animationDuration;
      setTimeout(() => {
        StateManager.doNextStep();
      }, totalWaitTime);
    } else {
      StateManager.doNextStep();
    }
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
    const startPos = kittieBankComp.toLocal(strtGlobalPos);

    // Target the spine directly instead of the outer Comp
    const targetBank = targetBankComp.elementsList?.['spineAnim'] || targetBankComp;

    const endGlobalPos = targetBank.getGlobalPosition();
    const endPos = kittieBankComp.toLocal(endGlobalPos);

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
      }
    }

    movingSymbol.position.copyFrom(startPos);
    movingSymbol.scale.set(1);

    // Dynamically find exactly where the target bank is, and add the coin just below it!
    const targetIndex = kittieBankComp.getChildIndex(targetBankComp);
    kittieBankComp.addChildAt(movingSymbol, targetIndex);

    const arcHeight = -700;
    const c1 = new Point(startPos.x, startPos.y + arcHeight);
    const c2 = new Point(endPos.x, endPos.y + arcHeight);

    AnimationProxy.animateTween(movingSymbol, {
      duration: 1,
      onUpdate: function () {
        const t = this.progress();
        const bezierPoint = getBezierPoint(t, startPos, c1, c2, endPos);
        movingSymbol.position.copyFrom(bezierPoint);
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

  protected showGreenKittieBankBreak(): void {
    EventHandler.dispatchEvent('PLAY_KITTIE_BLAST', {
      bankName: 'mew',
      callback: () => {
        StateManager.doNextStep();
      },
    });
  }

  private onShowExtraSpinAnim(): void {
    const extraSpinText: any = this.slotReel?.elementsList?.['extraSpinText'];
    const extraSpinTextCenter: any = this.slotReel?.elementsList?.['extraSpinTextCenter'];

    if (!extraSpinText || !extraSpinTextCenter) {
      console.warn('Missing extraSpinText elements');
      StateManager.goToState(STATES.FS_SPIN_START_STATE);
      return;
    }

    const text = Util.getContent('ExtraSpinText');
    extraSpinText.text = text;
    extraSpinTextCenter.text = text;

    AnimationProxy.killTweensOf(extraSpinText);
    AnimationProxy.killTweensOf(extraSpinTextCenter);

    EventHandler.dispatchEvent(SlotEvents.REEL_WIN_TICKER_VISIBLE);

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
    extraSpinText.alpha = 0;

    // ENTER: slide up from bottom to center + fade in
    AnimationProxy.animateTween(extraSpinTextCenter, {
      duration: ENTER_DURATION,
      y: naturalY,
      alpha: 1,
      ease: 'power2.out',
    });

    // Fade in the bottom ticker as text arrives
    AnimationProxy.animateTween(extraSpinText, {
      duration: 0.3,
      alpha: 1,
    });

    AnimationProxy.animateTween(
      extraSpinTextCenter,
      {
        duration: EXIT_DURATION,
        y: naturalY - OFFSET_Y, // exits toward top of reel
        alpha: 0,
        ease: 'power2.in',
        delay: ENTER_DURATION + HOLD_DURATION,
        onComplete: () => {
          EventHandler.dispatchEvent(SlotEvents.REEL_WIN_TICKER_HIDDEN);
        },
      },
      false,
    );

    // Fade out the bottom ticker in sync with the exit
    AnimationProxy.animateTween(
      extraSpinText,
      {
        duration: EXIT_DURATION,
        alpha: 0,
        delay: ENTER_DURATION + HOLD_DURATION,
      },
      false,
    );
  }
}
