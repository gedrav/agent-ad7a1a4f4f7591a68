import CascadeReelSymbol from '@brand/views/slot/CascadeReelSymbol';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';

export default class EOGNCCascadeReelSymbol extends CascadeReelSymbol {
  public showAppearingAnim(data: any, column: number, callback: () => void): void {
    this.setNewSymbol(data, column);
    this.symbol.alpha = 0;
    AnimationProxy.animateTween(this.symbol, {
      duration: 0.5,
      alpha: 1,
      onComplete: this.onNewSymbolAppeared.bind(this, callback),
    });
  }

  private onNewSymbolAppeared(callback: () => void): void {
    callback();
  }
}
