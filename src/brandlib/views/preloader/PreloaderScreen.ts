import { ResponsesiveView } from '@core/pixiwrapper/ResponsesiveView';
import { PixText } from '@core/pixiwrapper/PixText';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { AppEvents } from '@core/events/AppEvents';
import { Util } from '@core/utils/UtilService';
import { PixAnimatedSprite } from '@core/pixiwrapper/PixAnimatedSprite';
import { Graphics } from 'pixi.js';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';

export class PreloaderScreen extends ResponsesiveView {
  private loadingText: PixText;
  private preloader: PixAnimatedSprite;
  private bar: PixGraphics;
  private circle2: PixGraphics;

  constructor(config: any) {
    super(config);
    this.loadingText = this.elementsList['loadingText'];
    this.bar = this.elementsList['progressBar'].elementsList['bar'];
    this.circle2 = this.elementsList['progressBar'].elementsList['circle2'];
    EventHandler.addEventListener(AppEvents.LOAD_PROGRESS, this.onLoadProgress.bind(this));
  }

  protected onLoadProgress(progress: number): void {
    this.bar.scale.x = progress / 100;
    this.circle2.x = this.bar.x + this.bar.width;
  }
  public removePreloader(): void {
    this.preloader?.destroy();
    this.elementsList['progressBar'].destroy();
    this.loadingText?.destroy(true);
    this.destroyView();
    this.isDestroyed = true;
  }
}
