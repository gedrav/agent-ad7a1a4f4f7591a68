import { SlotMachineView } from '@core/views/slotmachine/SlotMachineView';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';

export class GameSlotMachineView extends SlotMachineView {
  constructor(config: any) {
    super(config);

    // setTimeout(() => this.expandRowsTo4(), 5000);
    //
    // setTimeout(() => this.reverseRowsTo3(), 10000);
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
