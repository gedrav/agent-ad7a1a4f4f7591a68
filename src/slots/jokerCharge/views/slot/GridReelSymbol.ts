import ReelSymbolSpine from '@core/views/slotmachine/ReelSymbolSpine';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { UIUtil } from '@core/utils/UIUtilService';

export default class GridReelSymbol extends ReelSymbolSpine {
  private sticky: boolean = false;
  private stickyOverlay: PixSpine;

  public setSticky(flag: boolean): void {
    if (this.sticky === flag) return;
    this.sticky = flag;
    if (flag) {
      this.showStickyOverlay();
    } else {
      this.hideStickyOverlay();
    }
  }

  public isSticky(): boolean {
    return this.sticky;
  }

  public setNewSymbol(data: any, reelno: number): void {
    if (this.sticky) return;
    super.setNewSymbol(data, reelno);
  }

  public resetSymbol(): void {
    if (this.sticky) return;
    super.resetSymbol();
  }

  public replaceSymbol(data: any, reelno: number, onComplete?: () => void): void {
    if (this.sticky) {
      onComplete?.();
      return;
    }
    super.replaceSymbol(data, reelno, onComplete);
  }

  public showAppear(onComplete?: () => void): void {
    this.spineAnimCompleteCallback = onComplete;
    if (!this.playSpineAnimation(this.configData.data.appearAnim ?? 'appear', false)) {
      this.spineAnimCompleteCallback = null;
      onComplete?.();
    }
  }

  public showCollect(onComplete?: () => void): void {
    this.spineAnimCompleteCallback = onComplete;
    if (!this.playSpineAnimation(this.configData.data.collectAnim ?? 'collect', false)) {
      this.spineAnimCompleteCallback = null;
      onComplete?.();
    }
  }

  // Called by GridReel once a final symbol is set, to play whatever "arriving" sequence
  // this symbol type needs. Base behaviour is just the landing animation; symbol types with
  // a distinct appear animation (e.g. BonusSymbol) override this to chain appear -> landing.
  public playLandSequence(onComplete?: () => void): void {
    this.showLanding();
    onComplete?.();
  }

  protected showStickyOverlay(): void {
    if (!this.stickyOverlay) {
      this.stickyOverlay = UIUtil.getSpineAnim(this.configData.data.stickyOverlaySpine ?? 'Chain_lock_sym', {
        spineName: this.configData.data.stickyOverlaySpine ?? 'Chain_lock_sym',
      });
      this.addChild(this.stickyOverlay);
    }
    this.stickyOverlay.visible = true;
    this.stickyOverlay.playAnimation({ state: 'appearing', loop: false, nextState: 'idle', nextLoop: true });
  }

  protected hideStickyOverlay(): void {
    if (!this.stickyOverlay) return;
    this.stickyOverlay.playAnimation({ state: 'disappearing', loop: false });
  }
}
