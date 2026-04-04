import { SlotMachineView } from '@core/views/slotmachine/SlotMachineView';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { AnteBetComp } from '@game/views/comps/AnteBetComp';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixSpine } from '@core/pixiwrapper/PixSpine';

export class GameSlotMachineView extends SlotMachineView {
  private bbBtn: PixFancyButton;
  private anteBetComp: AnteBetComp;
  private kingAnim: PixSpine;
  constructor(config: any) {
    super(config);
    this.bbBtn = this.elementsList['bbBtn'];
    this.anteBetComp = this.elementsList['anteBetComp'];
    this.kingAnim = this.slotReel.elementsList['kingAnim'];
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
