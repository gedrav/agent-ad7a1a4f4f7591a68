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
    const elementsList = (this as any).elementsList;
    if (elementsList) {
      const reelstripBG = elementsList['reelstripBG'];
      const bg4 = elementsList['bg4'];
      const bg5 = elementsList['bg5'];
      if (reelstripBG) reelstripBG.visible = size === 3;
      if (bg4) bg4.visible = size === 4;
      if (bg5) bg5.visible = size === 5;

      const reelFrameComp = elementsList['reelFrame'];
      if (reelFrameComp) {
        const reelFrame = reelFrameComp.elementsList['reelFrame'];
        const frame4 = reelFrameComp.elementsList['frame4'];
        const frame5 = reelFrameComp.elementsList['frame5'];
        if (reelFrame) reelFrame.visible = size === 3;
        if (frame4) frame4.visible = size === 4;
        if (frame5) frame5.visible = size === 5;
      }

      const maskRect = elementsList['maskRect'];
      const tickerComp = elementsList['tickerComp'];
      const fsAutoCounterComp = elementsList['fsAutoCounterComp'];

      const parentElements = (this.parent as any)?.elementsList;
      const bigWinsComp = parentElements?.['bigWinsComp'] || elementsList?.['bigWinsComp'];

      if (size === 4) {
        if (maskRect) {
          maskRect.y = -170;
          maskRect.height = 1400;
        }
        if (tickerComp) tickerComp.y = 1200;
        if (fsAutoCounterComp) fsAutoCounterComp.y = 1150;

        if (bigWinsComp) {
          bigWinsComp.scale.set(0.65);
          bigWinsComp.position.set(718, 518);
          const winTicker = bigWinsComp.elementsList?.['winTicker'];
          if (winTicker) {
            winTicker.x = 774;
            winTicker.y = 300;
          }
        }
      } else if (size === 5) {
        if (maskRect) {
          maskRect.y = -261;
          maskRect.height = 1750;
        }
        if (tickerComp) tickerComp.y = 1500;
        if (fsAutoCounterComp) fsAutoCounterComp.y = 1395;

        if (bigWinsComp) {
          bigWinsComp.scale.set(0.58);
          bigWinsComp.position.set(772, 660);
          const winTicker = bigWinsComp.elementsList?.['winTicker'];
          if (winTicker) {
            winTicker.x = 774;
            winTicker.y = 200;
          }
        }
      } else {
        if (maskRect) {
          maskRect.y = 68;
          maskRect.height = 988;
        }
        if (tickerComp) tickerComp.y = 1070;
        if (fsAutoCounterComp) fsAutoCounterComp.y = 1070;

        if (bigWinsComp) {
          bigWinsComp.scale.set(1);
          bigWinsComp.position.set(450, 294);
          const winTicker = bigWinsComp.elementsList?.['winTicker'];
          if (winTicker) {
            winTicker.x = 774;
            winTicker.y = 400;
          }
        }
      }
    }

    if (this.reelsData.noOfRows === size) return;
    this.reelsData.noOfRows = size;
    if (this.winController) this.winController.noOfRows = size;

    this.reelsData.symbolHeight = 322;
    this.reelsData.reelHeight = size * 322;

    if (size === 4 || size === 5) {
      // Pad initialReel to prevent engine crash and make the falling strip longer
      const targetLength = size + 2;
      if (this.reelsData.initialReel) {
        for (let k = 0; k < this.reelsData.initialReel.length; k++) {
          while (this.reelsData.initialReel[k].length < targetLength) {
            this.reelsData.initialReel[k].push('H1', 'L2', 'RC');
          }
        }
      }
    }

    for (const key in this.reelsData.deviceLayout) {
      if (this.reelsData.deviceLayout[key]) {
        this.reelsData.deviceLayout[key].symbolHeight = 330;
        this.reelsData.deviceLayout[key].symbolScale = 1;

        if (size === 4) {
          this.reelsData.deviceLayout[key].reelContainerPos.y = 5;
          this.reelsData.deviceLayout[key].reelContainerPos.x = 210;
        } else if (size === 5) {
          this.reelsData.deviceLayout[key].reelContainerPos.y = -75;
          this.reelsData.deviceLayout[key].reelContainerPos.x = key === 'Portrait' ? 172 : 195;
        } else {
          this.reelsData.deviceLayout[key].reelContainerPos.y = 230;
          this.reelsData.deviceLayout[key].reelContainerPos.x = key === 'Portrait' ? 172 : 195;
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
