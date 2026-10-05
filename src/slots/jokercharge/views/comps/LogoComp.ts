import { ResponsiveView } from '@core/pixiwrapper/ResponsiveView';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { UIUtil } from '@core/utils/UIUtilService';
import { Util } from '@core/utils/UtilService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { appModel } from '@core/models/services/AppModelService';
import { PixText } from '@core/pixiwrapper/PixText';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { JCEvents } from '@slots/jokercharge/events/JCEvents';
import {
  TOTAL_WIN_DIM_ALPHA,
  TOTAL_WIN_DIM_DURATION,
  TOTAL_WIN_LABEL_CONFIG,
  TOTAL_WIN_LABEL_SLOT,
  TOTAL_WIN_PRESENT_DURATION,
  TOTAL_WIN_PRESENT_EASE,
  TOTAL_WIN_PRESENT_HOLD_MS,
  TOTAL_WIN_PRESENT_SCALE,
  TOTAL_WIN_VALUE_CONFIG,
  TOTAL_WIN_VALUE_SLOT,
} from '@slots/jokercharge/config/screens/TotalWinPanelConfig';

// Same shape as the feature's other requests: the state waits only if a listener claims it.
export interface TotalWinPanelData {
  hold: boolean;
  onComplete: () => void;
}

const TOTAL_WIN_SHOW_STATE = 'show';
const TOTAL_WIN_HIDE_STATE = 'hide';

export class LogoComp extends ResponsiveView {
  private readonly logoAnim: PixSpine;
  private readonly totalWinPanel: PixSpine;
  private totalWinListener: any = null;
  private totalWinValueText: PixText | null = null;
  // In bet multiples, the units the backend sends.
  private totalWin = 0;
  // The count-up runs on this, not on a display object, so teardown kills it by hand.
  private totalWinCountTarget: { value: number } | null = null;
  private readonly totalWinDim: PixGraphics | null = null;
  // Where the panel sits on the logo, so the present can put it back.
  private panelRestX = 0;
  private panelRestY = 0;
  private panelRestScale = 1;
  // Where this comp sits among its siblings, so the raise the dim needs can be undone.
  private restChildIndex = -1;

  constructor(config: any) {
    super(config);
    this.logoAnim = this.elementsList['logoAnim'];
    this.totalWinPanel = this.elementsList['totalWinPanel'];
    this.totalWinDim = this.elementsList['totalWinDim'];
    this.captureTotalWinRest();
    this.logoAnim.addEventListener('complete', this.onAnimComplete.bind(this));
    EventHandler.addEventListener(JCEvents.PLAY_LOGO_COLLECT_ANIM, this.playCollect.bind(this));
    EventHandler.addEventListener(JCEvents.SHOW_TOTAL_WIN_PANEL, this.onShowTotalWinPanel.bind(this));
    EventHandler.addEventListener(JCEvents.PRESENT_TOTAL_WIN_PANEL, this.onPresentTotalWinPanel.bind(this));
    this.createTotalWinLabel();
    this.createTotalWinValue();
    this.playIdle();
  }

  // Built once with the rig: the panel is a single long-lived spine, nothing to tear down.
  private createTotalWinLabel(): void {
    if (!this.totalWinPanel?.addSlotObject) return;
    this.totalWinPanel.addSlotObject(TOTAL_WIN_LABEL_SLOT, UIUtil.getElement(TOTAL_WIN_LABEL_CONFIG));
  }

  private createTotalWinValue(): void {
    if (!this.totalWinPanel?.addSlotObject) return;
    this.totalWinValueText = UIUtil.getElement(TOTAL_WIN_VALUE_CONFIG);
    this.totalWinPanel.addSlotObject(TOTAL_WIN_VALUE_SLOT, this.totalWinValueText);
    this.resetTotalWin();
  }

  public resetTotalWin(): void {
    this.killTotalWinCount();
    this.totalWin = 0;
    this.writeTotalWin(0);
  }

  // One cell's share, counted up from whatever is already showing.
  public addTotalWin(value: number, duration: number, onComplete?: () => void): void {
    this.killTotalWinCount();
    const target = { value: this.totalWin };
    const finalValue = this.totalWin + value;
    this.totalWin = finalValue;
    this.totalWinCountTarget = target;
    AnimationProxy.animateTween(target, {
      duration,
      value: finalValue,
      onUpdate: () => this.writeTotalWin(target.value),
      onComplete: () => {
        this.totalWinCountTarget = null;
        // Set outright rather than left on the tween's last frame, which stops a hair short.
        this.writeTotalWin(finalValue);
        onComplete?.();
      },
    });
  }

  private writeTotalWin(value: number): void {
    if (!this.totalWinValueText) return;
    this.totalWinValueText.text = Util.formatCurrencyNoSymbol(value * appModel.getTotalBet());
  }

  private killTotalWinCount(): void {
    if (!this.totalWinCountTarget) return;
    AnimationProxy.killTweensOf(this.totalWinCountTarget);
    this.totalWinCountTarget = null;
  }

  private onShowTotalWinPanel(request: TotalWinPanelData): void {
    if (!this.totalWinPanel) return;
    request.hold = true;
    this.releaseTotalWinListener();
    this.totalWinPanel.visible = true;
    this.totalWinListener = this.totalWinPanel.addEventListener('complete', () => {
      this.releaseTotalWinListener();
      request.onComplete();
    });
    this.totalWinPanel.playAnimation({ state: TOTAL_WIN_SHOW_STATE, loop: false });
  }

  private captureTotalWinRest(): void {
    if (this.totalWinDim) this.totalWinDim.visible = false;
    if (!this.totalWinPanel) return;
    this.panelRestX = this.totalWinPanel.x;
    this.panelRestY = this.totalWinPanel.y;
    this.panelRestScale = this.totalWinPanel.scale.x;
  }

  // The panel's last beat: it leaves the logo for the middle of the screen over a dim, holds there,
  // hides, and everything is put back.
  public presentTotalWinPanel(onComplete?: () => void): void {
    const panel = this.totalWinPanel;
    if (!panel?.visible) {
      onComplete?.();
      return;
    }
    // The dim only covers this comp, so the comp has to come forward over the elements drawn after
    // it: the jackpot labels, the counter.
    this.raiseAboveSiblings();
    this.fadeTotalWinDim(TOTAL_WIN_DIM_ALPHA, TOTAL_WIN_DIM_DURATION);

    const center = this.toLocal({ x: UIUtil.getGameWidth() / 2, y: UIUtil.getGameHeight() / 2 });
    AnimationProxy.animateTween(panel, {
      duration: TOTAL_WIN_PRESENT_DURATION,
      x: center.x,
      y: center.y,
      ease: TOTAL_WIN_PRESENT_EASE,
    });
    AnimationProxy.animateTween(panel.scale, {
      duration: TOTAL_WIN_PRESENT_DURATION,
      x: this.panelRestScale * TOTAL_WIN_PRESENT_SCALE,
      y: this.panelRestScale * TOTAL_WIN_PRESENT_SCALE,
      ease: TOTAL_WIN_PRESENT_EASE,
      onComplete: () => setTimeout(() => this.hideTotalWinPanelAnimated(onComplete), TOTAL_WIN_PRESENT_HOLD_MS),
    });
  }

  private hideTotalWinPanelAnimated(onComplete?: () => void): void {
    const panel = this.totalWinPanel;
    if (!panel) {
      onComplete?.();
      return;
    }
    this.releaseTotalWinListener();
    this.totalWinListener = panel.addEventListener('complete', () => {
      this.releaseTotalWinListener();
      this.hideTotalWinPanel();
      onComplete?.();
    });
    this.fadeTotalWinDim(0, TOTAL_WIN_DIM_DURATION);
    panel.playAnimation({ state: TOTAL_WIN_HIDE_STATE, loop: false });
  }

  private raiseAboveSiblings(): void {
    if (!this.parent || this.restChildIndex >= 0) return;
    this.restChildIndex = this.parent.getChildIndex(this);
    this.parent.setChildIndex(this, this.parent.children.length - 1);
  }

  // Back where it was, or the logo keeps drawing over the counter for the rest of the session.
  private restoreChildIndex(): void {
    if (!this.parent || this.restChildIndex < 0) return;
    this.parent.setChildIndex(this, Math.min(this.restChildIndex, this.parent.children.length - 1));
    this.restChildIndex = -1;
  }

  private fadeTotalWinDim(alpha: number, duration: number): void {
    const dim = this.totalWinDim;
    if (!dim) return;
    dim.visible = true;
    AnimationProxy.animateTween(dim, { duration, alpha, onComplete: () => (dim.visible = dim.alpha > 0) });
  }

  private onPresentTotalWinPanel(request: TotalWinPanelData): void {
    if (!this.totalWinPanel?.visible) return;
    request.hold = true;
    this.presentTotalWinPanel(request.onComplete);
  }

  // Put away as the next feature opens, or it would still be on the logo from the last one.
  public hideTotalWinPanel(): void {
    if (!this.totalWinPanel) return;
    this.releaseTotalWinListener();
    this.resetTotalWin();
    this.totalWinPanel.stopAnimation();
    this.totalWinPanel.visible = false;
    AnimationProxy.killTweensOf(this.totalWinPanel);
    AnimationProxy.killTweensOf(this.totalWinPanel.scale);
    this.totalWinPanel.position.set(this.panelRestX, this.panelRestY);
    this.totalWinPanel.scale.set(this.panelRestScale);
    this.restoreChildIndex();
    if (this.totalWinDim) {
      AnimationProxy.killTweensOf(this.totalWinDim);
      this.totalWinDim.alpha = 0;
      this.totalWinDim.visible = false;
    }
  }

  private releaseTotalWinListener(): void {
    if (!this.totalWinListener) return;
    this.totalWinPanel.removeSpineEvent(this.totalWinListener);
    this.totalWinListener = null;
  }

  public playIdle(): void {
    this.logoAnim.playAnimation({ state: 'idle', loop: true });
  }

  public playIdle2(): void {
    this.logoAnim.playAnimation({ state: 'idle2', loop: true });
  }

  public playCollect(): void {
    this.logoAnim.playAnimation({ state: 'collect', loop: false });
  }

  protected onAnimComplete(e: any): void {
    if (e.animation.name === 'collect') {
      this.playIdle();
    }
  }
}
