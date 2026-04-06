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
      } else {
        this.slotReel.addChild(this.kingAnim);
      }
    }
    const isShortPhone = UIUtil.isShortPhone();
    if (isShortPhone) {
      if (DeviceProxy.config.isDevice && DeviceProxy.config.isPortrait) {
        this.bbBtn.x -= UIUtil.getGameWidth() * 0.3;
        this.anteBetComp.x += UIUtil.getGameWidth() * 0.3;
      }
    }
  }
}
