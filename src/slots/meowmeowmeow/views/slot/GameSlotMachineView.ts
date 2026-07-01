import { SlotMachineView } from '@core/views/slotmachine/SlotMachineView';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import ReelSymbolSprite from '@core/views/slotmachine/ReelSymbolSprite';
import { MenuCompAmbientSoundToggleCommand } from '@core/commands/action/MenuCompAmbientSoundToggleCommand';
import { Point } from 'pixi.js';
import { getBezierPoint, lerp } from '@core/utils/MathUtils';

export class GameSlotMachineView extends SlotMachineView {
  constructor(config: any) {
    super(config);

    // setTimeout(() => this.expandRowsTo4(), 5000);

    // setTimeout(() => this.reverseRowsTo3(), 10000);
    setTimeout(() => this.animateSymbolToKittyBank(3, 3, 'meow'), 2000);
  }

  public animateSymbolToKittyBank(col: number, row: number, bankName: 'meow' | 'mew' | 'mii') {
    const kittieBankComp = this.elementsList['kittiebankComp'];
    if (!kittieBankComp) return;

    const targetBank = kittieBankComp.elementsList[bankName];
    console.log(targetBank);
    if (!targetBank) return;

    const strtGlobalPos = this.slotReel.getSymbolPosition(col, row);
    const startPos = this.slotReel.toLocal(strtGlobalPos);

    const endGlobalPos = targetBank.getGlobalPosition();
    const endPos = this.slotReel.toLocal(endGlobalPos);

    endPos.x += targetBank.width / 2;
    endPos.y += targetBank.height / 2;

    const movingSymbol = new ReelSymbolSprite({
      data: {
        name: 'paw_red',
        spineName: '',
        skin: 'default',
        idleAnim: 'Idle',
        winAnim: 'Win',
      },
    });

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
          reel.reelsData.initialReel[k].push('H1', 'L2', 'paw_red');
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
