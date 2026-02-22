import { ResponsesiveView } from '@core/pixiwrapper/ResponsesiveView';
import { PixText } from '@core/pixiwrapper/PixText';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { AppEvents } from '@core/events/AppEvents';
import { Util } from '@core/utils/UtilService';
import { PixAnimatedSprite } from '@core/pixiwrapper/PixAnimatedSprite';

export class PreloaderScreen extends ResponsesiveView {
  private loadingText: PixText;
  private preloader: PixAnimatedSprite;

  constructor(config: any) {
    super(config);
    this.loadingText = this.elementsList['loadingText'];
    EventHandler.addEventListener(AppEvents.LOAD_PROGRESS, this.onLoadProgress.bind(this));
  }

  protected onLoadProgress(progress: number): void {
    //this.elementsList['loaderBar'].elementsList['bar'].scale.x = progress / 100;
    //this.loadingText.text = Util.getContent('loadingText', [progress]);
  }
  public removePreloader(): void {
    this.preloader?.destroy();
    this.loadingText?.destroy(true);
    this.destroyView();
    this.isDestroyed = true;
  }
}
