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
    EventHandler.addEventListener('MEOW_SHOW_COIN_ANIMATION', this.showCoinAnimations.bind(this));
    // setTimeout(() => this.expandRowsTo4(), 5000);
    // setTimeout(() => this.reverseRowsTo3(), 10000);
  }

  public showCoinAnimations() {
    const coinPositions = appModel.gameResult?.coinPositions;

    // 1. Gather all coins into a single array
    const allCoins: { col: number; row: number; bank: 'meow' | 'mew' | 'mii'; symbol: string }[] = [];

    if (coinPositions) {
      if (coinPositions.red) {
        coinPositions.red.forEach((pos: number[]) => {
          allCoins.push({ col: pos[0], row: pos[1], bank: 'meow', symbol: 'RC' });
        });
      }
      if (coinPositions.blue) {
        coinPositions.blue.forEach((pos: number[]) => {
          allCoins.push({ col: pos[0], row: pos[1], bank: 'mew', symbol: 'BC' });
        });
      }
      if (coinPositions.green) {
        coinPositions.green.forEach((pos: number[]) => {
          allCoins.push({ col: pos[0], row: pos[1], bank: 'mii', symbol: 'GC' });
        });
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

    const targetBank = kittieBankComp.elementsList[bankName];
    if (!targetBank) {
      return;
    }

    const symbolRow = row + 1;

    const strtGlobalPos = this.slotReel.getSymbolPosition(col, symbolRow);
    const startPos = this.slotReel.toLocal(strtGlobalPos);

    const endGlobalPos = targetBank.getGlobalPosition();
    const endPos = this.slotReel.toLocal(endGlobalPos);

    endPos.x += targetBank.width / 2;
    endPos.y += targetBank.height / 2;

    const movingSymbol = new ReelSymbolSprite({
      data: {
        name: symbolName,
        spineName: '',
        skin: 'default',
        idleAnim: 'Idle',
        winAnim: 'Win',
      },
    });

    // Swap the original symbol on the reel to its actual greyscale asset
    const reel: any = this.slotReel;
    const targetSymbol = reel.symbolsArray?.[col]?.[symbolRow];
    if (targetSymbol?.symbol) {
      targetSymbol.symbol.texture = Texture.from(symbolName + '_grey');
      targetSymbol.symbol.alpha = 0.2;
    }

    movingSymbol.position.copyFrom(startPos);
    movingSymbol.scale.set(1);

    this.slotReel.addChild(movingSymbol);

    const arcHeight = -500;
    const c1 = new Point(startPos.x, startPos.y + arcHeight);
    const c2 = new Point(endPos.x, endPos.y + arcHeight);

    AnimationProxy.animateTween(movingSymbol, {
      duration: 1,
      onUpdate: function () {
        const t = this.progress();
        // Move along the curved path and shrink to half size
        const bezierPoint = getBezierPoint(t, startPos, c1, c2, endPos);
        movingSymbol.position.copyFrom(bezierPoint);
        movingSymbol.scale.set(lerp(1, 0.5, t));
      },
      onComplete: () => {
        this.slotReel.removeChild(movingSymbol);
        movingSymbol.destroy();
        console.log(`Symbol successfully reached the ${bankName} bank!`);
      },
    });
  }

  public expandRowsTo4(): void {
    const reel: any = this.slotReel;
    if (reel.reelsData.noOfRows === 4) return;
    reel.reelsData.noOfRows = 4;

    // Pad initialReel to 6 symbols to prevent 4-row engine crash
    if (reel.reelsData.initialReel) {
      for (let k = 0; k < reel.reelsData.initialReel.length; k++) {
        if (reel.reelsData.initialReel[k].length < 6) {
          reel.reelsData.initialReel[k].push('H1', 'L2', 'RC');
        }
      }
    }

    for (const key in reel.reelsData.deviceLayout) {
      if (reel.reelsData.deviceLayout[key]) {
        reel.reelsData.deviceLayout[key].symbolHeight = 246;
        reel.reelsData.deviceLayout[key].symbolScale = 0.75;
        reel.reelsData.deviceLayout[key].reelContainerPos.y = 195;
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

  public reverseRowsTo3(): void {
    const reel: any = this.slotReel;
    if (reel.reelsData.noOfRows === 3) return;
    reel.reelsData.noOfRows = 3;

    for (const key in reel.reelsData.deviceLayout) {
      if (reel.reelsData.deviceLayout[key]) {
        reel.reelsData.deviceLayout[key].symbolHeight = 322;
        reel.reelsData.deviceLayout[key].symbolScale = 1;
        reel.reelsData.deviceLayout[key].reelContainerPos.y = 240;
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
