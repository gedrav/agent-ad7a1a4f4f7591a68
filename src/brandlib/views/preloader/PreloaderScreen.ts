import { ResponsiveView } from '@core/pixiwrapper/ResponsiveView';
import { PixText } from '@core/pixiwrapper/PixText';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { AppEvents } from '@core/events/AppEvents';
import { Util } from '@core/utils/UtilService';
import { PixAnimatedSprite } from '@core/pixiwrapper/PixAnimatedSprite';
import { Graphics } from 'pixi.js';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { GameProxy } from '@core/models/GameConfigProxy';

export class PreloaderScreen extends ResponsiveChildrenView {
  private readonly loadingText: PixText;
  private readonly preloader: PixAnimatedSprite;
  private readonly bar: PixGraphics;
  private readonly circle2: PixGraphics;
  private readonly disposeLoadProgress: () => void;

  constructor(config: any) {
    super(config);
    this.loadingText = this.elementsList['loadingText'];
    this.bar = this.elementsList['progressBar'].elementsList['bar'];
    this.circle2 = this.elementsList['progressBar'].elementsList['circle2'];
    this.visible = false;
    this.bar.scale.x = 0;
    this.disposeLoadProgress = EventHandler.bind(AppEvents.LOAD_PROGRESS, this.onLoadProgress.bind(this));
    setTimeout(() => {
      this.visible = true;
    }, 100);
  }

  protected onLoadProgress(progress: number): void {
    if (this.isDestroyed || !this.bar || this.bar?.destroyed) return;
    this.bar.scale.x = progress / 100;
    GameProxy.config.progressSoFar = progress;
    this.circle2.x = this.bar.x + this.bar.width;
  }
  public removePreloader(): void {
    this.disposeLoadProgress?.();
    this.preloader?.destroy();
    this.elementsList['progressBar'].destroy();
    this.loadingText?.destroy(true);
    this.destroyView();
    this.isDestroyed = true;
  }
}
