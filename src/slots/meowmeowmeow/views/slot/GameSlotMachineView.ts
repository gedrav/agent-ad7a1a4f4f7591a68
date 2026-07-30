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
import { UIUtil } from '@core/utils/UIUtilService';

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
  private readonly wheelDoor: PixSprite;
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
    this.wheelDoor = this.elementsList['wheelDoor'];
    this.wheelRim = this.elementsList['wheelRim'];
    this.wheelContainer = this.elementsList['wheelContainer'];
    this.doorMask = this.elementsList['doorMask'];
    this.vaultAnim = this.elementsList['vaultAnim'];
    if (this.wheelDoor) this.wheelDoor.mask = this.doorMask;

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

  public updateBigWinsCompScale(): void {
    if (!this.bigWinsComp) return;

    const noOfRows = Number(appModel.featureResult?.featureData?.interfaceSize) || 3;

    if (noOfRows === 4) {
      this.bigWinsComp.scale.set(0.65);
      this.bigWinsComp.position.set(718, 518);
    } else if (noOfRows === 5) {
      this.bigWinsComp.scale.set(0.58);
      this.bigWinsComp.position.set(772, 660);
    } else {
      this.bigWinsComp.scale.set(1);
      this.bigWinsComp.position.set(450, 294);
    }
  }

  protected showSpinWin(): void {
    this.updateBigWinsCompScale();
    if (this.bigWinsComp) {
      this.addChild(this.bigWinsComp);
    }
    super.showSpinWin();
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

  protected showPickFeatureTransition(): void {
    this.slotReel.visible = false;
    this.gameTitle.visible = false;
    this.jackpotContainer.visible = false;
    this.kittiebankComp.visible = false;
    this.wheelDoor.alpha = 1;
    if (appModel.getNextSubFeatureType() === 'Blue') {
      this.showWheel();
    } else {
      this.showPickJackpotFeatureScreen();
    }
    this.animateWheelDoor();
  }

  private changeReelInterface(): void {
    const interfaceSize = Number(appModel.featureResult?.featureData?.interfaceSize) || 4;
    EventHandler.dispatchEvent('UPDATE_REEL_LAYOUT', interfaceSize);
  }

  // reset all layout mutations made during free spins
  private resetMachineLayout(): void {
    // Stop autoplay after free spins complete — this event fires synchronously
    // from ExitFreespinsState.exitFreespin() BEFORE StateManager.next(), so
    // CheckAutoSpinState will see _autoPlaySession=false and go to IDLE.
    if (appModel.getIsAutoSession()) {
      appModel.resetAutoplayData();
      EventHandler.dispatchEvent(SlotEvents.AUTOPLAY_UPDATE_UI_STOP);
    }

    if (this.configData?.layoutData?.Portrait) {
      this.configData.layoutData.Portrait.vPaddingPerc = 0;
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

    // Restore kitty bank position to its base (non-free-spins) x
    if (this.kittiebankBaseX && this.kittiebankComp?.configData?.layoutData) {
      const kld = this.kittiebankComp.configData.layoutData;
      kld.Desktop.x = this.kittiebankBaseX.Desktop;
      kld.Portrait.x = this.kittiebankBaseX.Portrait;
      kld.Landscape.x = this.kittiebankBaseX.Landscape;
    }

    this.wheelBase.alpha = 1;
    this.wheelRim.alpha = 0.5;
    if (this.vaultAnim) this.vaultAnim.visible = false;
    this.doorMask.visible = false;

    if (this.gameTitleBaseLayoutData && this.gameTitle?.configData) {
      this.gameTitle.configData.layoutData = this.gameTitleBaseLayoutData;
    }
    this.jackpotContainer.visible = true;
    this.kittiebankComp.visible = true;

    this.addChild(this.jackpotContainer, this.slotReel, this.gameTitle, this.kittiebankComp);
    this.resizeView();
  }

  protected animateWheelDoor(): void {
    if (appModel.getNextSubFeatureType() === 'Green') {
      this.slotReel.visible = true;
    }
    this.kittiebankComp.visible = true;
    this.addChild(this.kittiebankComp);

    if (this.gameTitle?.configData?.fsLayoutData) {
      this.gameTitle.configData.layoutData = this.gameTitle.configData.fsLayoutData;
    }
    UIUtil.adjustElement(this.gameTitle);

    // Shift the kitty banks left so they clear the vault ring during free spins
    const kld = this.kittiebankComp.configData?.layoutData;
    if (this.kittiebankBaseX && kld) {
      const shift = 60;
      kld.Desktop.x = this.kittiebankBaseX.Desktop - shift;
      kld.Portrait.x = 230;
      kld.Landscape.x = this.kittiebankBaseX.Landscape - shift;
      kld.Portrait.y = -45;
      (this.kittiebankComp as any).resizeView();
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
      (this.slotReel as any).resizeView();
    }

    if (this.vaultAnim) {
      this.doorMask.visible = true;
      this.vaultAnim.mask = this.doorMask;
      this.vaultAnim.scale.set(0.5);
      this.vaultAnim.visible = true;
    }
    this.wheelDoor.visible = false;
    const featureHeadings = [this.feautreHeadingGreen, this.feautreHeadingBlue, this.feautreHeadingRed];
    this.removeChild(...featureHeadings);
    this.addChild(this.wheelDoor, this.vaultAnim, this.wheelRim);
    this.addChild(...featureHeadings);
    this.wheelRim.alpha = 1;

    if (this.vaultAnim) {
      this.vaultAnim.playAnimation({
        state: 'Unlock',
        loop: false,
        reset: true,
      });

      setTimeout(() => {
        this.moveWheelDoor();
      }, 1500);
    }
  }
  protected moveWheelDoor(): void {
    if (!this.vaultAnim) return;

    // Calculate open position
    const shiftX = 1506;

    if (this.vaultClosedX && this.vaultAnim?.configData?.layoutData) {
      this.vaultAnim.configData.layoutData.Desktop.x = this.vaultClosedX.Desktop - shiftX;
      this.vaultAnim.configData.layoutData.Portrait.x = this.vaultClosedX.Portrait - shiftX;
      this.vaultAnim.configData.layoutData.Landscape.x = this.vaultClosedX.Landscape - shiftX;
    }

    // Move left and open fully
    AnimationProxy.animateTween(this.vaultAnim, {
      duration: 1.2,
      x: this.vaultAnim.x - shiftX,
      onComplete: () => {
        this.vaultAnim.visible = false;
        this.makeWheelInteractive();
        StateManager.doNextStep();
      },
    });
  }
  // private handlePickFeature(SubfeatureType: string) {
  //   console.warn(SubfeatureType);
  //   switch (SubfeatureType.toUpperCase()) {
  //     case 'RED':
  //       //  Handle for red one
  //       this.showPickJackpotFeatureScreen();
  //       break;
  //     case 'BLUE':
  //       this.showWheel();
  //       break;
  //     default:
  //       console.error('Invalid SubFeatureType:', SubfeatureType);
  //       break;
  //   }
  // }

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
    this.gameTitle.visible = true;
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
    const targetBank = targetBankComp.elementsList?.['spineAnim'] || targetBankComp;
    const endGlobalPos = targetBank.getGlobalPosition();

    const startPos = kittieBankComp.toLocal(strtGlobalPos);
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

  protected override resizeView(): void {
    super.resizeView();
    this.maskWheelTestToRim();
    this.updateBigWinsCompScale();
  }
}
