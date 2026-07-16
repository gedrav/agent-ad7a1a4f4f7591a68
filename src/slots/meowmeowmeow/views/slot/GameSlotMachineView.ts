import { SlotMachineView } from '@core/views/slotmachine/SlotMachineView';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import ReelSymbolSprite from '@core/views/slotmachine/ReelSymbolSprite';
import { MenuCompAmbientSoundToggleCommand } from '@core/commands/action/MenuCompAmbientSoundToggleCommand';
import { Point, Texture } from 'pixi.js';
import { getBezierPoint, lerp } from '@core/utils/MathUtils';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { SlotEvents } from '@core/events/SlotEvents';

export class GameSlotMachineView extends SlotMachineView {
  constructor(config: any) {
    super(config);
    EventHandler.addEventListener(SlotEvents.SHOW_COIN_ANIMATION, this.showCoinAnimations.bind(this));
    EventHandler.addEventListener('UPDATE_REEL_LAYOUT', (size: number) => this.updateReelLayout(size));
    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_UI_END, () => this.updateReelLayout(3));
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
              allCoins.push({ col, row, bank: 'mew', symbol: 'BC' });
            } else if (symbolName === 'GC') {
              allCoins.push({ col, row, bank: 'mii', symbol: 'GC' });
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

    const movingSymbol = new ReelSymbolSprite({
      data: {
        name: symbolName,
        spineName: '',
        skin: 'default',
        idleAnim: 'Idle',
        winAnim: 'Win',
      },
    });

    const reel: any = this.slotReel;
    const targetSymbol = reel.symbolsArray?.[col]?.[symbolRow];
    if (targetSymbol?.symbol) {
      targetSymbol.symbol.texture = Texture.from(symbolName + '_grey');
      targetSymbol.symbol.alpha = 0.2;
    }

    movingSymbol.position.copyFrom(startPos);
    movingSymbol.scale.set(1);

    // Dynamically find exactly where the target bank is, and add the coin just below it!
    const targetIndex = kittieBankComp.getChildIndex(targetBankComp);
    kittieBankComp.addChildAt(movingSymbol, targetIndex);

    kittieBankComp.children.forEach((child: any, idx: number) => {
      const childName = child.name || 'MovingCoin';
      console.log(`  [${idx}] -> ${childName}`);
    });

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
        console.log(`Symbol successfully reached the ${bankName} bank!`);
      },
    });
  }

  public updateReelLayout(interfaceSize: number | string): void {
    const size = Number(interfaceSize);
    const reel: any = this.slotReel;
    if (reel.reelsData.noOfRows === size) return;
    reel.reelsData.noOfRows = size;

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

    reel.symbolsArray.flat().forEach((sym: any) => {
      AnimationProxy.killTweensOf(sym);
      sym.destroySymbol();
      sym.destroy();
    });
    reel.symbolsArray = [];
    reel.createReel();
  }
}
