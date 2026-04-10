import { SlotMachineView } from '@core/views/slotmachine/SlotMachineView';
import { AnteBetComp } from '@game/views/comps/AnteBetComp';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import SlotReelTumble from '@core/views/slotmachine/SlotReelTumble';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { BuyBonusButtonComp } from '../comps/BuyBonusButtonComp';
import { CharacterController } from '../comps/CharacterController';

export class GameSlotMachineView extends SlotMachineView {
  private buyBonusComp: BuyBonusButtonComp;
  private anteBetComp: AnteBetComp;
  private character: CharacterController;
  protected tumbleSlotReel: SlotReelTumble;

  constructor(config: any) {
    super(config);
    this.buyBonusComp = this.elementsList['buyBonusComp'];
    this.anteBetComp = this.elementsList['anteBetComp'];
    this.character = this.slotReel.elementsList['character'];
    this.tumbleSlotReel = this.elementsList['slotReel'];
    EventHandler.addEventListener(SlotEvents.SHOW_TUMBLE_WIN, this.showTumbleWin.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_MAINGAME_ELEMENTS, this.showMainGameElements.bind(this));
    EventHandler.addEventListener(SlotEvents.HIDE_MAINGAME_ELEMENTS, this.hideMainGameElements.bind(this));
  }

  protected showSpinWin(): void {
    this.bigWinsComp.showSpinWin();
  }

  protected showTumbleWin(): void {
    this.tumbleSlotReel.showTumbleWin();
    this.bigWinsComp.showTumbleWin();
  }

  protected showMainGameElements(): void {
    this.buyBonusComp.visible = true;
    this.anteBetComp.visible = true;
  }

  protected hideMainGameElements(): void {
    this.buyBonusComp.visible = false;
    this.anteBetComp.visible = false;
  }

  protected resizeView() {
    super.resizeView();
    if (DeviceProxy.config.isDevice) {
      if (DeviceProxy.config.isPortrait) {
        this.slotReel.addChildAt(this.character, 1);
        this.positionEdgeButtons();
      } else {
        this.slotReel.addChild(this.character);
      }
    }
  }

  private positionEdgeButtons(): void {
    const gameWidth = UIUtil.getGameWidth();
    const localLeft = (0 - this.x) / this.scale.x;
    const localRight = (gameWidth - this.x) / this.scale.x;
    this.buyBonusComp.x = localLeft + 5; // hardcoded this 5 value to give padding from edges
    this.anteBetComp.x = localRight - this.anteBetComp.width - 10; // hardcoded this 10 value to give padding from edges
  }
}
