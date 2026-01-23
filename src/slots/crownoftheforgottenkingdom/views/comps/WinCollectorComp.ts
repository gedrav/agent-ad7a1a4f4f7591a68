import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { StandardView } from '@core/pixiwrapper/StandardView';
import { TumbleWinStrip } from './TumbleWinStrip';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { CustomBounce } from 'gsap/CustomBounce';

gsap.registerPlugin(CustomEase, CustomBounce);

const maxVisibleSymbInBox: number = 5;
export class WinCollectorComp extends StandardView {
  protected winStripArray: TumbleWinStrip[];
  protected winBoxContainer: StandardView;
  protected maskRect: PixGraphics;
  protected collectorFilled: boolean;
  constructor(config) {
    super(config);
    this.winStripArray = [];
    this.collectorFilled = false;
    this.winBoxContainer = this.elementsList['winBoxContainer'];
    this.maskRect = this.elementsList['maskRect'];
    this.winBoxContainer.mask = this.maskRect;
    EventHandler.addEventListener(SlotEvents.SHOW_SPIN_WIN, this.onCollectWinSymbols.bind(this));
    EventHandler.addEventListener(SlotEvents.CLEAR_ROUND, this.onResetWinCollector.bind(this));
  }

  protected onCollectWinSymbols(): void {
    const tumbleData = appModel.getSpinBlastData();
    // let tumbleData = [...tumbleDataT, ...tumbleDataT, ...tumbleDataT, ...tumbleDataT];
    const decValue = this.winStripArray.length < 5 ? maxVisibleSymbInBox : this.winStripArray.length;
    if (this.winStripArray.length + tumbleData.length > maxVisibleSymbInBox) {
      const yPosMultiplier = this.winStripArray.length + tumbleData.length - decValue; // to calc multi that how much winBoox will move down
      this.collectorFilled = true;
      AnimationProxy.animateTween(this.winBoxContainer, {
        y: this.winBoxContainer.y + yPosMultiplier * (this.maskRect.height / maxVisibleSymbInBox),
        duration: 0.25,
        onComplete: this.checkToEnableButtons.bind(this),
      });
    }
    this.collectNewWinstrips(tumbleData);
  }

  protected collectNewWinstrips(tumbleData) {
    tumbleData.forEach((element: any, index: number) => {
      const winStrip = new TumbleWinStrip(element);
      this.winBoxContainer.addChild(winStrip);
      this.winStripArray.push(winStrip);
      const len = this.winStripArray.length;
      winStrip.y = -winStrip.height * this.winStripArray.length;
      AnimationProxy.animateTween(winStrip, {
        y: this.maskRect.height - len * winStrip.height,
        duration: 0.4 + index * 0.05,
        ease: CustomBounce.create('myBounce', {
          strength: 0.28,
          endAtStart: false,
          squash: 1,
          squashID: 'myBounce-squash',
        }),
      });
    });
  }

  protected checkToEnableButtons() {}

  protected onResetWinCollector(): void {
    this.collectorFilled = false;
    this.winBoxContainer.y = this.winBoxContainer.configData.y;
    this.winStripArray.forEach((strip) => {
      this.winBoxContainer.removeChild(strip);
      strip.destroy();
    });
    this.winStripArray = [];
    this.collectorFilled = false;
  }
}
