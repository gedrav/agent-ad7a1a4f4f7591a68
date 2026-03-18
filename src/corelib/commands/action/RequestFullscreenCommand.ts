import { ActionCommand } from '@core/commands/core/ActionCommand';

class RequestFullscreenCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);

    const elem = document.documentElement;

    // Check if already in fullscreen
    if (document.fullscreenElement) {
      console.log('Already in fullscreen mode');
      return;
    }

    // Try different fullscreen APIs based on browser support
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else if ((elem as any).webkitRequestFullscreen) {
      // Safari/Chrome
      (elem as any).webkitRequestFullscreen();
    } else if ((elem as any).mozRequestFullScreen) {
      // Firefox
      (elem as any).mozRequestFullScreen();
    } else if ((elem as any).msRequestFullscreen) {
      // IE/Edge
      (elem as any).msRequestFullscreen();
    } else {
      console.warn('Fullscreen API is not supported in this browser');
    }
  }
}

export const RequestFullscreenCommand = new RequestFullscreenCmd();
