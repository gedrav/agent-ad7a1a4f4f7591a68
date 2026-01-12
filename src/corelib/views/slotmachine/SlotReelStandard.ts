import SlotReel from '@core/views/slotmachine/SlotReel';
import { appModel } from '@core/models/services/AppModelService';

export default class SlotReelStandard extends SlotReel {
  constructor(configData: any) {
    super(configData);
  }

  protected stoppingReelStrip(reelno: number, delta: number): void {
    super.stoppingReelStrip(reelno, delta);

    const rewardValues = appModel.rewardValues;
    if (rewardValues && rewardValues.length > 0) {
      rewardValues.forEach((reward) => {
        // Adjust position - symbolsArray has extra symbols at start/end
        // Position [0,0] maps to symbolsArray[0][1] (first visible symbol)
        const adjustedPosition = reward.position[1] + 1;

        if (reward.position[0] === reelno && adjustedPosition < this.symbolsArray[reelno].length) {
          const symbol = this.symbolsArray[reelno][adjustedPosition];
          if (symbol && (symbol as any).setRewardData) {
            (symbol as any).setRewardData(reward);
          }
        }
      });
    }
  }

  protected stopReelQuick(reelno: number): void {
    super.stopReelQuick(reelno);

    // Clear all reward containers for this reel first
    for (let j = 0; j < this.symbolsArray[reelno].length; j++) {
      const symbol = this.symbolsArray[reelno][j];
      if (symbol && (symbol as any).clearRewardData) {
        (symbol as any).clearRewardData();
      }
    }

    const rewardValues = appModel.rewardValues;
    rewardValues.forEach((reward) => {
      // Adjust position - symbolsArray has extra symbols at start/end
      // Position [0,0] maps to symbolsArray[0][1] (first visible symbol)
      const adjustedPosition = reward.position[1] + 1;

      if (reward.position[0] === reelno && adjustedPosition < this.symbolsArray[reelno].length) {
        const symbol = this.symbolsArray[reelno][adjustedPosition];
        if (symbol && (symbol as any).setRewardData) {
          // Update symbol to H5 type first
          const symbolData = this.reelsData.symbolsData['H5'];
          if (symbolData) {
            symbol.setNewSymbol(symbolData, reelno);
          }
          (symbol as any).setRewardData(reward);
        }
      }
    });
  }
}
