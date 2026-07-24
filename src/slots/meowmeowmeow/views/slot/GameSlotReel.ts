import SlotReelStandard from '@core/views/slotmachine/SlotReelStandard';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { Sine } from 'gsap';
import { StateManager } from '@core/states/StateManagerService';
import { SlotEvents } from '@core/events/SlotEvents';

export class GameSlotReel extends SlotReelStandard {
  private readonly totalAnims: number;
  private readonly animIndex: number;

  constructor(config: any) {
    super(config);
    EventHandler.addEventListener('UPDATE_REEL_LAYOUT', (size: number) => this.changeReelSize(size));
    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_UI_END, () => this.changeReelSize(3));
  }

  public changeReelSize(interfaceSize: number | string): void {
    const size = Number(interfaceSize);

    // Toggle the correct reel frame based on the size
    const parentView = this.parent as any;
    if (parentView?.elementsList) {
      const reelFrameComp = parentView.elementsList['reelFrame'];
      if (reelFrameComp) {
        const reelFrame = reelFrameComp.elementsList['reelFrame'];
        const frame4 = reelFrameComp.elementsList['frame4'];
        const frame5 = reelFrameComp.elementsList['frame5'];
        if (reelFrame) reelFrame.visible = size === 3;
        if (frame4) frame4.visible = size === 4;
        if (frame5) frame5.visible = size === 5;
      }
    }

    if (this.reelsData.noOfRows === size) return;
    this.reelsData.noOfRows = size;
    if (this.winController) this.winController.noOfRows = size;

    if (size === 4 || size === 5) {
      // Pad initialReel to prevent engine crash
      const targetLength = size + 2;
      if (this.reelsData.initialReel) {
        for (let k = 0; k < this.reelsData.initialReel.length; k++) {
          while (this.reelsData.initialReel[k].length < targetLength) {
            this.reelsData.initialReel[k].push('H1', 'L2', 'RC');
          }
        }
      }

      for (const key in this.reelsData.deviceLayout) {
        if (this.reelsData.deviceLayout[key]) {
          if (size === 4) {
            this.reelsData.deviceLayout[key].symbolHeight = 246;
            this.reelsData.deviceLayout[key].symbolScale = 0.75;
            this.reelsData.deviceLayout[key].reelContainerPos.y = 195;
          } else if (size === 5) {
            //this.reelsData.deviceLayout[key].symbolHeight = 196;
            this.reelsData.deviceLayout[key].symbolScale = 1;
            this.reelsData.deviceLayout[key].reelContainerPos.y = 170;
          }
        }
      }
    } else {
      for (const key in this.reelsData.deviceLayout) {
        if (this.reelsData.deviceLayout[key]) {
          this.reelsData.deviceLayout[key].symbolHeight = 322;
          this.reelsData.deviceLayout[key].symbolScale = 1;
          this.reelsData.deviceLayout[key].reelContainerPos.y = 240;
        }
      }
    }

    this.winController?.clearSpinWin();

    this.symbolsArray.flat().forEach((sym: any) => {
      AnimationProxy.killTweensOf(sym);
      sym.destroySymbol();
      sym.destroy();
    });
    this.symbolsArray = [];
    this.createReel();
  }
}
