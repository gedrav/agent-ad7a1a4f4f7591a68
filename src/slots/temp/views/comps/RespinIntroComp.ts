import { Rectangle } from 'pixi.js';
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { JCEvents } from '@slots/temp/events/JCEvents';

export interface RespinIntroData {
  // Fires once the player taps to dismiss - see RespinIntroState.
  onConfirm?: () => void;
}

// The "BONUS GAME" info screen. Lives at app level (see SlotGameAppConfig) so it covers the whole
// game, and carries its own dim rather than using corelib's ModalView.
export class RespinIntroComp extends ResponsiveChildrenView {
  private onConfirm: (() => void) | null = null;

  constructor(config: any) {
    super(config);
    this.visible = false;
    this.eventMode = 'static';
    // A Container is only hit where its children are, but a tap anywhere on screen should count.
    this.hitArea = new Rectangle(-5000, -5000, 10000, 10000);
    this.on('pointertap', this.onTapped, this);
    EventHandler.addEventListener(JCEvents.SHOW_RESPIN_INTRO, this.show.bind(this));
  }

  public show(data?: RespinIntroData): void {
    this.onConfirm = data?.onConfirm ?? null;
    this.visible = true;
  }

  public hide(): void {
    this.visible = false;
  }

  private onTapped(): void {
    if (!this.visible) return;
    this.hide();
    // Cleared before firing so a double tap can't advance the state machine twice.
    const confirm = this.onConfirm;
    this.onConfirm = null;
    confirm?.();
  }
}
