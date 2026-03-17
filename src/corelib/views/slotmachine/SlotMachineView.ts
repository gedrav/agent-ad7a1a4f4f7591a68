import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { BigWinsComp } from '@brand/views/comps/BigWinsComp';
import SlotReel from '@core/views/slotmachine/SlotReel';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';

export class SlotMachineView extends ResponsiveChildrenView {
  protected bigWinsComp: BigWinsComp;
  protected slotReel: SlotReel;
  constructor(config: any) {
    super(config);
    this.slotReel = this.elementsList['slotReel'];
    this.bigWinsComp = this.elementsList['bigWinsComp'];
    EventHandler.addEventListener(SlotEvents.SHOW_SPIN_WIN, this.showSpinWin.bind(this));
    EventHandler.addEventListener(SlotEvents.CLEAR_WINS, this.clearSpinWin.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_LINE_WIN, this.showLineWin.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_SCATTER_TRIGGER, this.showScatterTrigger.bind(this));
    EventHandler.addEventListener(SlotEvents.RESET_REEL_FOR_ERROR, this.resetReelForError.bind(this));
  }

  protected showSpinWin(): void {
    this.slotReel.showSpinWin();
    this.bigWinsComp?.showSpinWin();
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
