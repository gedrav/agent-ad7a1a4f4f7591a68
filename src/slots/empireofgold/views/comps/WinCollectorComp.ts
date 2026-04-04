import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { StandardView } from '@core/pixiwrapper/StandardView';
import { WinSymbolStrip } from './WinSymbolStrip';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { CustomBounce } from 'gsap/CustomBounce';
import { FancyButton } from '@pixi/ui';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';

gsap.registerPlugin(CustomEase, CustomBounce);

const maxVisibleSymbInBox: number = 5;
export class WinCollectorComp extends StandardView {
  protected winBoxContainer: StandardView;
  protected maskRect: PixGraphics;
  protected upBtn: PixFancyButton;
  protected downBtn: PixFancyButton;

  protected winStripArray: WinSymbolStrip[];
  protected collectorFilled: boolean;

  constructor(config) {
    super(config);
    this.winBoxContainer = this.elementsList['winBoxContainer'];
    this.maskRect = this.elementsList['maskRect'];
    this.upBtn = this.elementsList['upBtn'];
    this.downBtn = this.elementsList['downBtn'];

    this.winStripArray = [];
    this.collectorFilled = false;
    if (this.winBoxContainer) {
      this.winBoxContainer.mask = this.maskRect;
    }

    EventHandler.addEventListener(SlotEvents.SHOW_SPIN_WIN, this.onCollectWinSymbols.bind(this));
    EventHandler.addEventListener(SlotEvents.CLEAR_ROUND, this.onResetWinCollector.bind(this));

    this.upBtn?.onPress.connect(this.onUpBtnClicked.bind(this));
    this.downBtn?.onPress.connect(this.onDownBtnClicked.bind(this));

    this.showButtons(false);
  }

  protected onCollectWinSymbols(): void {
    const tumbleData = appModel.getSpinBlastData();
    const decValue = this.winStripArray.length < maxVisibleSymbInBox ? maxVisibleSymbInBox : this.winStripArray.length;
    if (this.winStripArray.length + tumbleData.length > maxVisibleSymbInBox) {
      // to check if after adding new strips if the max capacity is reached or not
      this.collectorFilled = true;
      const yPosMultiplier = this.winStripArray.length + tumbleData.length - decValue; // to calc multi that how much winBoox will move down
      this.enableBtnInteraction(false);
      AnimationProxy.animateTween(this.winBoxContainer, {
        y: this.winBoxContainer.y + yPosMultiplier * (this.maskRect.height / maxVisibleSymbInBox),
        duration: 0.25,
      });
    }
    this.collectNewWinstrips(tumbleData);
  }

  protected collectNewWinstrips(tumbleData) {
    tumbleData.forEach((element: any, index: number) => {
      const winStrip = new WinSymbolStrip(element);
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
        onComplete: this.onSymbolStripCollected.bind(this, tumbleData, index),
      });
    });
  }

  protected onSymbolStripCollected(tumbleData, index) {
    if (index == tumbleData.length - 1 && this.collectorFilled) {
      this.checkToEnableButtons();
    }
  }

  protected checkToEnableButtons() {
    this.enableBtnInteraction(true);
    const minY = this.winBoxContainer.configData.y;
    const maxY =
      minY + (this.winStripArray.length - maxVisibleSymbInBox) * (this.maskRect.height / maxVisibleSymbInBox);
    if (this.winBoxContainer.y > minY && this.winBoxContainer.y < maxY) {
      this.showButtons(true);
    } else if (this.winBoxContainer.y == minY) {
      this.upBtn.visible = true;
      this.downBtn.visible = false;
    } else if (this.winBoxContainer.y == maxY) {
      this.upBtn.visible = false;
      this.downBtn.visible = true;
    }
  }

  protected onUpBtnClicked() {
    const maxY =
      this.winBoxContainer.configData.y +
      (this.winStripArray.length - maxVisibleSymbInBox) * (this.maskRect.height / maxVisibleSymbInBox);
    const ht = this.winStripArray[0].height;
    const newY = this.winBoxContainer.y + ht >= maxY ? maxY : this.winBoxContainer.y + ht;
    this.winBoxContainer.y = newY;
    this.checkToEnableButtons();
  }

  protected onDownBtnClicked() {
    const minY = this.winBoxContainer.configData.y;
    const ht = this.winStripArray[0].height;
    const newY = this.winBoxContainer.y - ht <= minY ? minY : this.winBoxContainer.y - ht;
    this.winBoxContainer.y = newY;
    this.checkToEnableButtons();
  }

  protected enableBtnInteraction(flag: boolean) {
    this.upBtn.interactive = this.downBtn.interactive = flag;
  }

  protected showButtons(flag: boolean) {
    if (this.upBtn) {
      this.upBtn.visible = this.downBtn.visible = flag;
    }
  }

  protected onResetWinCollector(): void {
    this.collectorFilled = false;
    this.winBoxContainer.y = this.winBoxContainer.configData.y;
    this.winStripArray.forEach((strip) => {
      this.winBoxContainer.removeChild(strip);
      strip.destroy();
    });
    this.winStripArray = [];
    this.showButtons(false);
  }
}
