import { SlotMachineView } from '@core/views/slotmachine/SlotMachineView';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { AnteBetComp } from '@game/views/comps/AnteBetComp';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import SlotReelTumble from '@core/views/slotmachine/SlotReelTumble';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';

export class GameSlotMachineView extends SlotMachineView {
  private bbBtn: PixFancyButton;
  private anteBetComp: AnteBetComp;
  private kingAnim: PixSpine;
  protected tumbleSlotReel: SlotReelTumble;

  constructor(config: any) {
    super(config);
    this.bbBtn = this.elementsList['bbBtn'];
    this.anteBetComp = this.elementsList['anteBetComp'];
    this.kingAnim = this.slotReel.elementsList['kingAnim'];
    this.tumbleSlotReel = this.elementsList['slotReel'];
    EventHandler.addEventListener(SlotEvents.SHOW_TUMBLE_WIN, this.showTumbleWin.bind(this));
  }

  protected showSpinWin(): void {
    this.bigWinsComp.showSpinWin();
  }

  protected showTumbleWin(): void {
    this.tumbleSlotReel.showTumbleWin();
    this.bigWinsComp.showTumbleWin();
  }

  protected resizeView() {
    super.resizeView();
    if (DeviceProxy.config.isDevice) {
      if (DeviceProxy.config.isPortrait) {
        this.slotReel.addChildAt(this.kingAnim, 1);
        this.positionEdgeButtons();
      } else {
        this.slotReel.addChild(this.kingAnim);
      }
    }
  }

  private positionEdgeButtons(): void {
    const gameWidth = UIUtil.getGameWidth();
    const localLeft = (0 - this.x) / this.scale.x;
    const localRight = (gameWidth - this.x) / this.scale.x;
    this.bbBtn.x = localLeft + this.bbBtn.width * 0.5;
    this.anteBetComp.x = localRight - this.anteBetComp.width;
  }
}
