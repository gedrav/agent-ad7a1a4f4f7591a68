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
import { Util } from '@core/utils/UtilService';
import { appModel } from '@core/models/services/AppModelService';

export class GameSlotMachineView extends SlotMachineView {
  private buyBonusComp: BuyBonusButtonComp;
  private anteBetComp: AnteBetComp;
  private character: CharacterController;
  protected tumbleSlotReel: SlotReelTumble;
  private gameTitle: PixSpine;

  constructor(config: any) {
    super(config);
    this.buyBonusComp = this.elementsList['buyBonusComp'];
    this.anteBetComp = this.elementsList['anteBetComp'];
    this.character = this.slotReel.elementsList['character'];
    this.gameTitle = this.slotReel.elementsList['gameTitle'];
    this.tumbleSlotReel = this.elementsList['slotReel'];
    this.startGameLogoAnimation();
    this.checkToAddBBComp();
    EventHandler.addEventListener(SlotEvents.SHOW_MAINGAME_ELEMENTS, this.showMainGameElements.bind(this));
    EventHandler.addEventListener(SlotEvents.HIDE_MAINGAME_ELEMENTS, this.hideMainGameElements.bind(this));
  }

  private checkToAddBBComp() {
    if (!appModel.getIsBuyBonusAvailable()) {
      this.removeChild(this.buyBonusComp);
    }
  }

  protected showTumbleWin(): void {
    super.showTumbleWin();
    this.gameTitle.playAnimation({ state: 'Win', loop: false });
  }
  protected startGameLogoAnimation(): void {
    this.gameTitle.playAnimation({ state: 'idle', loop: false });
    setTimeout(
      () => {
        this.startGameLogoAnimation();
      },
      Util.getRandomRange(1, 5000) + 5000,
    );
  }

  protected enablePanel(): void {
    this.buyBonusComp.interactive = true;
    this.anteBetComp.interactive = true;
  }
  protected disablePanel(): void {
    this.buyBonusComp.interactive = false;
    this.anteBetComp.interactive = false;
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
        if (this.character) {
          this.slotReel.addChildAt(this.character, 1);
        }
        this.positionEdgeButtons();
      } else {
        if (this.character) {
          this.slotReel.addChild(this.character);
        }
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
