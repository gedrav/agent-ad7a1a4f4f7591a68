import GridReelSymbol from './GridReelSymbol';

export default class BoostSymbol extends GridReelSymbol {
  public playLandSequence(onComplete?: () => void): void {
    this.showAppear(() => {
      this.showLanding();
      onComplete?.();
    });
  }
}
