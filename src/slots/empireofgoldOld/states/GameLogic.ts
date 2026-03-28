import { appModel } from '@core/models/services/AppModelService';

class Royal81GameLogic {
  constructor() {}

  public isPreWinFeatureTriggered(): boolean {
    const result = appModel.getSpinResult();
    if (result.addWildFeatureTriggered) {
      return true;
    }
    return false;
  }
}

export const gameLogic = new Royal81GameLogic();
