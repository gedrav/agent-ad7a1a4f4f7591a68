import { ActionCommand } from '@core/commands/core/ActionCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';

class RequestFullscreenCmd extends ActionCommand {
  constructor() {
    super();
    // Listen for any fullscreen state change (button click or Escape key) to update the icon
    document.addEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
  }

  // Dispatches fullscreen state so the UI can swap enter/exit icons
  private onFullscreenChange(): void {
    EventHandler.dispatchEvent(SlotEvents.SHOW_FULLSCREEN_MODE, !!document.fullscreenElement);
  }

  public execute() {
    super.execute();

    // Try different fullscreen APIs based on browser support
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => {});
    } else if ((elem as any).webkitRequestFullscreen) {
      (elem as any).webkitRequestFullscreen(); // Safari/Chrome
    } else if ((elem as any).mozRequestFullScreen) {
      (elem as any).mozRequestFullScreen(); // Firefox
    } else if ((elem as any).msRequestFullscreen) {
      (elem as any).msRequestFullscreen(); // IE/Edge
    }
  }
}

export const RequestFullscreenCommand = new RequestFullscreenCmd();
