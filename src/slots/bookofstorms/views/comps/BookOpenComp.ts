import { StandardView } from '@core/pixiwrapper/StandardView';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixSpine } from '@core/pixiwrapper/PixSpine';

export class BookOpenComp extends StandardView {
  private bookOpenAnim: PixSpine;

  constructor(config: any) {
    super(config);
  }

  async onSecondaryAssetsLoaded() {
    super.onSecondaryAssetsLoaded();
    const config: any = {
      name: 'bookOpenAnim',
      type: 'Spine',
      spineName: 'book_open',
      defaultState: 'book_open_static',
    };
    this.bookOpenAnim = UIUtil.getElement(config);
    this.addChild(this.bookOpenAnim);
    this.bookOpenAnim.playAnimation({ state: 'static_left', loop: true });
    this.bookOpenAnim.x = this.guideRect.width / 2;
    this.bookOpenAnim.y = this.guideRect.height / 2;
  }
}
