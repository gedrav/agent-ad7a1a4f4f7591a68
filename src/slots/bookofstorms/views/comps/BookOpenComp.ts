import { StandardView } from '@core/pixiwrapper/StandardView';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { Skin } from '@esotericsoftware/spine-pixi-v8';

export class BookOpenComp extends StandardView {
  private mainBook: PixSpine;
  private bookLeft: PixSpine;
  private bookRight: PixSpine;
  private bookRightStatic: PixSpine;
  private winFrameComp: PixSpine;

  constructor(config: any) {
    super(config);
    //setTimeout(this.playBookAnimation.bind(this, 'L3'), 1000);
  }

  async onSecondaryAssetsLoaded() {
    super.onSecondaryAssetsLoaded();
    const config: any = {
      name: 'bookOpenAnim',
      type: 'Spine',
      spineName: 'book_feature',
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

    this.bookRightStatic = UIUtil.getElement(config);
    this.addChild(this.bookRightStatic);
    this.bookRightStatic.x = this.guideRect.width / 2;
    this.bookRightStatic.y = this.guideRect.height / 2;
    this.bookRightStatic.visible = false;

    this.bookRight = UIUtil.getElement(config);
    this.addChild(this.bookRight);
    this.bookRight.x = this.guideRect.width / 2;
    this.bookRight.y = this.guideRect.height / 2;
    this.bookRight.visible = false;
    this.bookRight.addEventListener('complete', this.onRightBookAnimEnd.bind(this));
    this.bookRight.addEventListener('event', this.onRightBookChangeSkin.bind(this));

    const config1: any = {
      name: 'winFrame',
      type: 'Spine',
      spineName: 'book_win_frame',
      defaultState: 'start',
    };
    this.winFrameComp = UIUtil.getElement(config1);
    this.addChild(this.winFrameComp);
    this.winFrameComp.x = 645;
    this.winFrameComp.y = 595;
    this.winFrameComp.scale.set(1.1);
    this.winFrameComp.visible = false;
    this.winFrameComp.addEventListener('complete', this.onWinFrameAnimComplete.bind(this));

    // Apply the runtime patches to inject missing right pages into custom skins
    this.mainBook.patchSpineDataAtRuntime();
    this.bookLeft.patchSpineDataAtRuntime();
    this.bookRight.patchSpineDataAtRuntime();
    this.bookRightStatic.patchSpineDataAtRuntime();
  }

  private availableSkins: string[] = ['10', 'A', 'J', 'K', 'Q', 'eagle', 'castle', 'man', 'mask'];

  private symbolToSkinMap: { [key: string]: string } = {
    H1: 'man',
    H2: 'eagle',
    H3: 'mask',
    H4: 'castle',
    L1: 'A',
    L2: 'K',
    L3: 'Q',
    L4: 'J',
    L5: '10',
  };

  private currentSymbol: string = '';
  private nextSymbol: string = '';
  private nextLeftSymbol: string = '';
  private currentTurn: number = 0;
  private targetTurns: number = 9;

  private getRandomSkin(): string {
    return this.availableSkins[Math.floor(Math.random() * this.availableSkins.length)];
  }

  public playBookAnimation(targetSymbolCode: string): void {
    if (!this.mainBook) {
      console.warn('Assets not loaded yet, waiting...');
      setTimeout(this.playBookAnimation.bind(this, targetSymbolCode), 500);
      return;
    }
    this.nextLeftSymbol = this.symbolToSkinMap[targetSymbolCode] || targetSymbolCode;

    this.currentTurn = 0;
    this.mainBook.visible = true;

    this.currentSymbol = this.getRandomSkin();
    this.nextSymbol = this.getRandomSkin();

    this.mainBook.setSkin(this.currentSymbol);
    this.mainBook.playAnimation({ state: 'open_static', loop: false });
    this.bookLeft.setSkin(this.currentSymbol);
    this.bookRight.setSkin(this.currentSymbol);
    this.bookRightStatic.setSkin(this.nextSymbol);

    this.bookLeft.playAnimation({ state: 'static_left', loop: false });
    this.bookRightStatic.playAnimation({ state: 'static_right', loop: false });
    this.bookRight.playAnimation({ state: 'static_right', loop: false });
    this.mainBook.playAnimation({ state: 'start', loop: false });
  }

  protected onMainBookAnimEnd(data: any): void {
    if (data.animation.name === 'start') {
      this.mainBook.playAnimation({ state: 'open', loop: false });
    } else if (data.animation.name === 'open') {
      this.bookLeft.visible = true;
      this.bookRightStatic.visible = true;
      this.bookRight.visible = true;
      this.startNextFlip();
    }
  }

  private startNextFlip(): void {
    this.bookRightStatic.playAnimation({ state: 'static_right', loop: false });
    this.bookRight.playAnimation({ state: 'flipping', loop: false });

    if (this.currentTurn > 0) {
      this.bookRight.setSkin(this.nextSymbol);
    }

    this.nextSymbol = this.getRandomSkin();
    this.bookRightStatic.setSkin(this.nextSymbol);
  }

  protected onRightBookAnimEnd(data: any): void {
    if (data.animation.name === 'flipping') {
      this.bookLeft.setSkin(this.currentSymbol);
      this.currentTurn++;
      if (this.currentTurn <= this.targetTurns) {
        this.startNextFlip();
      } else {
        //this.bookRight.visible = false;
        this.winFrameComp.visible = true;
        this.winFrameComp.playAnimation({ state: 'start', loop: false });
      }
    }
  }
  protected onRightBookChangeSkin(data: any): void {
    if (this.currentTurn === this.targetTurns) {
      this.currentSymbol = this.nextLeftSymbol;
    } else {
      this.currentSymbol = this.getRandomSkin();
    }
    this.bookRight.setSkin(this.currentSymbol);
  }

  protected onWinFrameAnimComplete(data: any): void {
    if (data.animation.name === 'start') {
      this.winFrameComp.playAnimation({ state: 'loop', loop: true });
    }
  }

  public cleanBookComp(): void {}
}
