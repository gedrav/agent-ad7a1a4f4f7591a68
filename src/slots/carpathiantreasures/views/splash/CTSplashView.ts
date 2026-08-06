import { SplashView } from '@brand/views/splash/SplashView';

export class CTSplashView extends SplashView {
  protected override alignForPortrait(): void {
    this.guideRect.y += 40;
    super.alignForPortrait();
  }
}
