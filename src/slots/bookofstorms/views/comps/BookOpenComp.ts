import { StandardView } from '@core/pixiwrapper/StandardView';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixSpine } from '@core/pixiwrapper/PixSpine';

export class BookOpenComp extends StandardView {
  private mainBook: PixSpine;
  private bookLeft: PixSpine;
  private bookRight: PixSpine;

  constructor(config: any) {
    super(config);
    setTimeout(this.playBookAnimation.bind(this), 3000);
  }

  async onSecondaryAssetsLoaded() {
    super.onSecondaryAssetsLoaded();
    const config: any = {
      name: 'bookOpenAnim',
      type: 'Spine',
      spineName: 'book_open',
      defaultState: 'book_open_static',
    };
    this.mainBook = UIUtil.getElement(config);
    this.addChild(this.mainBook);
    this.mainBook.x = this.guideRect.width / 2;
    this.mainBook.y = this.guideRect.height / 2;
    this.mainBook.visible = false;
    this.mainBook.addEventListener('complete', this.onMainBookAnimEnd.bind(this));

    this.bookLeft = UIUtil.getElement(config);
    this.addChild(this.bookLeft);
    this.bookLeft.x = this.guideRect.width / 2;
    this.bookLeft.y = this.guideRect.height / 2;
    this.bookLeft.visible = false;

    this.bookRight = UIUtil.getElement(config);
    this.addChild(this.bookRight);
    this.bookRight.x = this.guideRect.width / 2;
    this.bookRight.y = this.guideRect.height / 2;
    this.bookRight.visible = false;
    this.bookRight.addEventListener('complete', this.onRightBookAnimEnd.bind(this));
  }

  protected playBookAnimation1(): void {
    this.bookLeft.visible = true;
    this.bookLeft.setSkin('10');
    this.bookLeft.playAnimation({ state: 'static_left', loop: false });
  }
  protected playBookAnimation(): void {
    this.mainBook.visible = true;
    this.mainBook.setSkin('J');
    this.bookLeft.setSkin('eagle');
    this.bookRight.setSkin('10');
    this.mainBook.playAnimation({ state: 'start', loop: false });
  }

  protected onMainBookAnimEnd(data: any): void {
    console.log('main book anim end -- ', data);
    if (data.animation.name === 'start') {
      this.mainBook.playAnimation({ state: 'open', loop: false });
    } else if (data.animation.name === 'open') {
      this.bookLeft.visible = true;
      this.bookRight.visible = true;
      this.bookLeft.setSkin('eagle');
      this.bookLeft.playAnimation({ state: 'static_left', loop: false });
      this.bookRight.playAnimation({ state: 'flipping', loop: false });
    }
  }
  protected onRightBookAnimEnd(data: any): void {
    console.log('right book anim end -- ', data);
    if (data.animation.name === 'flipping') {
      this.bookLeft.setSkin('10');
      this.bookLeft.playAnimation({ state: 'open_static', loop: false });
      this.bookRight.setSkin('A');
      this.bookRight.playAnimation({ state: 'flipping', loop: false });
    }
  }
}
