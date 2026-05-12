import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { BigWinsComp } from '@brand/views/comps/BigWinsComp';
import SlotReel from '@core/views/slotmachine/SlotReel';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { UIUtil } from '@core/utils/UIUtilService';

export class SlotMachineView extends ResponsiveChildrenView {
  get slotReel(): SlotReel {
    return this._slotReel;
  }

  set slotReel(value: SlotReel) {
    this._slotReel = value;
  }
  protected bigWinsComp: BigWinsComp;
  private _slotReel: SlotReel;
  constructor(config: any) {
    super(config);
    this.slotReel = this.elementsList['slotReel'];
    this.slotReel.guideRect = this.guideRect;
    this.bigWinsComp = this.elementsList['bigWinsComp'];
    EventHandler.addEventListener(SlotEvents.SHOW_SPIN_WIN, this.showSpinWin.bind(this));
    EventHandler.addEventListener(SlotEvents.CLEAR_WINS, this.clearSpinWin.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_LINE_WIN, this.showLineWin.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_SCATTER_TRIGGER, this.showScatterTrigger.bind(this));
    EventHandler.addEventListener(SlotEvents.RESET_REEL_FOR_ERROR, this.resetReelForError.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_TUMBLE_WIN, this.showTumbleWin.bind(this));
  }

  protected showSpinWin(): void {
    this.slotReel.showSpinWin();
    this.bigWinsComp?.showSpinWin();
  }
  protected showTumbleWin(): void {
    this.slotReel.showTumbleWin();
    this.bigWinsComp?.showTumbleWin();
  }
  protected clearSpinWin(): void {
    this.slotReel.clearSpinWin();
    this.bigWinsComp?.clearSpinWin();
  }
  protected showLineWin(): void {
    this.slotReel.showLineWin();
  }
  protected showScatterTrigger(): void {
    this.slotReel.showScatterTrigger();
  }
  protected resetReelForError(): void {
    this.slotReel.resetReelForError();
  }
}
