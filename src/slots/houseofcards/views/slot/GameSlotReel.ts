import SlotReelStandard from '@core/views/slotmachine/SlotReelStandard';
import { SymbolsFrameContainer } from '@game/views/comps/SymbolsFrameContainer';

export default class GameSlotReel extends SlotReelStandard {
  private readonly symbolsFrameContainer: SymbolsFrameContainer;

  constructor(configData: any) {
    super(configData);
    this.symbolsFrameContainer = this.elementsList['symbolsFrameContainer'];
    this.repositionFrameContainer();
  }

  protected repositionView(): void {
    super.repositionView();
    this.repositionFrameContainer();
  }

  private repositionFrameContainer(): void {
    if (!this.symbolsFrameContainer) return;
    if (this.reelsData.reelContainerPos) {
      this.symbolsFrameContainer.x = this.reelsData.reelContainerPos.x;
      this.symbolsFrameContainer.y = this.reelsData.reelContainerPos.y;
    }
    this.symbolsFrameContainer.setReelGrid(this.reelsData.reelPositionX, this.reelsData.symbolHeight);
  }
}
