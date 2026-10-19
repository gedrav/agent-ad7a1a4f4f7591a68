import { Container } from 'pixi.js';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { appModel } from '@core/models/services/AppModelService';
import { GameEvent } from '@game/events/GameEvent';
import { getFrameBoardDiff } from '@game/states/HOCFrameBoardTracker';
import { FrameComp } from '@game/views/comps/FrameComp';

const NO_OF_REELS = 5;

export class SymbolsFrameContainer extends Container {
  private readonly frames: Map<number, FrameComp> = new Map();
  private pendingCount = 0;
  private reelPositionX: number[] = [];
  private symbolHeight = 0;

  constructor(_config?: any) {
    super();
    EventHandler.addEventListener(GameEvent.UPDATE_FRAME_BOARD, this.onUpdateFrameBoard.bind(this));
    EventHandler.addEventListener(SlotEvents.CLEAR_WINS_FS, this.clearFrames.bind(this));
  }

  // CLEAR_WINS_FS is only ever dispatched when a freespins round is ending (core's
  // ExitFreespinsState), never mid-round, so this is the right place to reset for next time.
  private clearFrames(): void {
    this.frames.forEach((frame) => frame.destroyFrame());
    this.frames.clear();
    this.pendingCount = 0;
  }

  public setReelGrid(reelPositionX: number[], symbolHeight: number): void {
    this.reelPositionX = reelPositionX;
    this.symbolHeight = symbolHeight;
  }

  private onUpdateFrameBoard(): void {
    const board: number[] = appModel.featureResult?.featureData?.board ?? [];
    const diff = getFrameBoardDiff(board);

    if (diff.length === 0) {
      StateManager.doNextStep();
      return;
    }

    this.pendingCount = diff.length;
    diff.forEach((entry) => {
      const frame = this.getOrCreateFrame(entry.position);
      frame.playTier(entry.from, entry.to, this.onFrameAnimComplete.bind(this));
    });
  }

  private getOrCreateFrame(position: number): FrameComp {
    let frame = this.frames.get(position);
    if (!frame) {
      const reel = position % NO_OF_REELS;
      const row = Math.floor(position / NO_OF_REELS);
      const x = this.reelPositionX[reel];
      const y = row * this.symbolHeight;

      frame = new FrameComp(x, y);
      this.addChild(frame);
      this.frames.set(position, frame);
    }
    return frame;
  }

  private onFrameAnimComplete(): void {
    this.pendingCount--;
    if (this.pendingCount <= 0) {
      setTimeout(() => StateManager.doNextStep(), 1000);
    }
  }
}
