import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import GridReelView from './GridReelView';

export class GameSlotMachineView extends ResponsiveChildrenView {
  private readonly gridReelView: GridReelView;
  private pendingResultGrid: any[][] = [];

  constructor(config: any) {
    super(config);
    this.gridReelView = this.elementsList['gridReelView'];

    EventHandler.addEventListener(SlotEvents.START_SPIN, this.onStartSpin.bind(this));
    EventHandler.addEventListener(SlotEvents.CREATE_FINAL_REEL_SYMBOLS, this.onCreateFinalReelSymbols.bind(this));
    EventHandler.addEventListener(SlotEvents.STOP_SPIN_AFTER_RESPONSE, this.onStopSpinAfterResponse.bind(this));
  }

  protected onStartSpin(): void {
    this.gridReelView.startSpin();
  }

  protected onCreateFinalReelSymbols(): void {
    // TODO: backend isn't developed yet - replace this with the real response shape
    // (appModel.gameResult?.grid or whatever the finalized contract turns out to be).
    this.pendingResultGrid = this.getDummyResultGrid();
  }

  private getDummyResultGrid(): any[][] {
    // TODO: dummy data only - remove once a real/mock spin response is wired up.
    return [
      [{ name: 'Blanks' }, { name: 'mini' }, { name: 'cor-2x' }],
      [{ name: 'boost' }, { name: 'Blanks' }, { name: 'mystery' }],
      [{ name: 'cor-4x' }, { name: 'minor' }, { name: 'Blanks' }],
    ];
  }

  protected onStopSpinAfterResponse(): void {
    this.gridReelView.stopSpin(this.pendingResultGrid, () => {
      StateManager.doNextStep();
    });
  }
}
