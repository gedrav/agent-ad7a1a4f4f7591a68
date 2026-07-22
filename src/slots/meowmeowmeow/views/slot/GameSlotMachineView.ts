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

export class GameSlotMachineView extends SlotMachineView {
  private readonly extraSpinTextTimeoutId: any;

  constructor(config: any) {
    super(config);
    EventHandler.addEventListener(SlotEvents.SHOW_COIN_ANIMATION, this.showCoinAnimations.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_PICK_FEATURE_UI, this.handlePickFeature.bind(this));
    EventHandler.addEventListener(SlotEvents.HIDE_PICK_FEATURE_UI, this.hideWheel.bind(this));
    EventHandler.addEventListener('UPDATE_REEL_LAYOUT', (size: number) => this.updateReelLayout(size));
    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_UI_END, () => this.updateReelLayout(3));
    EventHandler.addEventListener(SlotEvents.SHOW_SCATTER_TRIGGER_ONSCREEN, this.onShowExtraSpinAnim.bind(this));
  }

  private handlePickFeature(SubfeatureType: string) {
    switch (SubfeatureType.toUpperCase()) {
      case 'RED':
        //  Handle for red one
        break;
      case 'BLUE':
        this.showWheel();
        break;
      default:
        console.error('Invalid SubFeatureType:', SubfeatureType);
        break;
    }
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

  public updateReelLayout(interfaceSize: number | string): void {
    const size = Number(interfaceSize);
    const reel: any = this.slotReel;
    if (reel.reelsData.noOfRows === size) return;
    reel.reelsData.noOfRows = size;
    if (reel.winController) reel.winController.noOfRows = size;

    if (size === 4 || size === 5) {
      // Pad initialReel to prevent engine crash
      const targetLength = size + 2;
      if (reel.reelsData.initialReel) {
        for (let k = 0; k < reel.reelsData.initialReel.length; k++) {
          while (reel.reelsData.initialReel[k].length < targetLength) {
            reel.reelsData.initialReel[k].push('H1', 'L2', 'RC');
          }
        }
      }

      for (const key in reel.reelsData.deviceLayout) {
        if (reel.reelsData.deviceLayout[key]) {
          if (size === 4) {
            reel.reelsData.deviceLayout[key].symbolHeight = 246;
            reel.reelsData.deviceLayout[key].symbolScale = 0.75;
            reel.reelsData.deviceLayout[key].reelContainerPos.y = 195;
          } else if (size === 5) {
            reel.reelsData.deviceLayout[key].symbolHeight = 196;
            reel.reelsData.deviceLayout[key].symbolScale = 0.6;
            reel.reelsData.deviceLayout[key].reelContainerPos.y = 170;
          }
        }
      }
    } else {
      for (const key in reel.reelsData.deviceLayout) {
        if (reel.reelsData.deviceLayout[key]) {
          reel.reelsData.deviceLayout[key].symbolHeight = 322;
          reel.reelsData.deviceLayout[key].symbolScale = 1;
          reel.reelsData.deviceLayout[key].reelContainerPos.y = 240;
        }
      }
    }

    reel.winController?.clearSpinWin();

    reel.symbolsArray.flat().forEach((sym: any) => {
      AnimationProxy.killTweensOf(sym);
      sym.destroySymbol();
      sym.destroy();
    });
    reel.symbolsArray = [];
    reel.createReel();
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
          StateManager.goToState(STATES.FS_SPIN_START_STATE);
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
