import { StandardView } from '@core/pixiwrapper/StandardView';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { Skin } from '@esotericsoftware/spine-pixi-v8';

export class BookOpenComp extends StandardView {
  private mainBook: PixSpine;
  private bookLeft: PixSpine;
  private bookRight: PixSpine;
  private bookRightStatic: PixSpine;

  constructor(config: any) {
    super(config);
    setTimeout(this.playBookAnimation.bind(this, 'H2'), 1000);
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

    // Apply the runtime patches to inject missing right pages into custom skins
    this.patchSpineDataAtRuntime(this.mainBook);
    this.patchSpineDataAtRuntime(this.bookLeft);
    this.patchSpineDataAtRuntime(this.bookRight);
    this.patchSpineDataAtRuntime(this.bookRightStatic);
  }

  private patchSpineDataAtRuntime(spineObj: PixSpine) {
    try {
      const spineAnim = (spineObj as any).spineAnim;
      if (!spineAnim || !spineAnim.skeleton || !spineAnim.skeleton.data) {
        console.warn('patchSpineDataAtRuntime: spineAnim missing');
        return;
      }

      const data = spineAnim.skeleton.data;
      const defaultSkin = data.findSkin('default');

      let slotIndexR = -1;
      let slotIndexL = -1;
      for (let i = 0; i < data.slots.length; i++) {
        if (data.slots[i].name === 'symbol_r') slotIndexR = i;
        if (data.slots[i].name === 'symbol_l') slotIndexL = i;
      }

      if (!defaultSkin || slotIndexR < 0 || slotIndexL < 0) {
        console.warn('patchSpineDataAtRuntime: slots/skin missing', {
          defaultSkin: !!defaultSkin,
          slotIndexR,
          slotIndexL,
        });
        return;
      }

      const baseSymbolR =
        defaultSkin.getAttachment(slotIndexR, 'symbol_r') || defaultSkin.getAttachment(slotIndexR, 'symb_null');
      if (!baseSymbolR) {
        console.warn('patchSpineDataAtRuntime: baseSymbolR missing in default skin');
        return;
      }

      for (const skin of data.skins) {
        if (skin.name === 'default') continue;

        // Ensure the left slot also has the 'symb_null' name available
        const symbolLMesh = skin.getAttachment(slotIndexL, 'symbol_l') || skin.getAttachment(slotIndexL, 'symb_null');
        if (symbolLMesh && !skin.getAttachment(slotIndexL, 'symb_null')) {
          skin.setAttachment(slotIndexL, 'symb_null', symbolLMesh);
        }

        const existing = skin.getAttachment(slotIndexR, 'symbol_r') || skin.getAttachment(slotIndexR, 'symb_null');
        if (!existing) {
          const newMesh = (baseSymbolR as any).copy();
          if (symbolLMesh && (symbolLMesh as any).region) {
            newMesh.region = (symbolLMesh as any).region;
            if (typeof newMesh.updateRegion === 'function') newMesh.updateRegion();
            skin.setAttachment(slotIndexR, 'symbol_r', newMesh);
            skin.setAttachment(slotIndexR, 'symb_null', newMesh);
            console.log(`patchSpineDataAtRuntime: Successfully patched skin ${skin.name}`);
          } else {
            console.warn(`patchSpineDataAtRuntime: Skin ${skin.name} missing symbol_l mesh or region`);
          }
        }
      }
    } catch (e: any) {
      console.error('patchSpineDataAtRuntime Error:', e);
    }
  }

  private availableSkins: string[] = ['10', 'A', 'J', 'K', 'Q', 'eagle', 'castle', 'man', 'mask'];
  private currentSymbol: string = '';
  private nextSymbol: string = '';
  private nextLeftSymbol: string = '';

  private getRandomSkin(): string {
    return this.availableSkins[Math.floor(Math.random() * this.availableSkins.length)];
  }

  protected playBookAnimation(): void {
    this.mainBook.visible = true;

    this.currentSymbol = this.getRandomSkin();
    this.nextSymbol = this.getRandomSkin();

    this.mainBook.setSkin(this.currentSymbol);
    this.mainBook.playAnimation({ state: 'open_static', loop: false });
    this.bookLeft.setSkin(this.currentSymbol);
    this.bookRight.setSkin(this.currentSymbol);
    this.bookRightStatic.setSkin(this.currentSymbol);

    this.bookLeft.playAnimation({ state: 'static_left', loop: false });
    this.bookRightStatic.playAnimation({ state: 'static_right', loop: false });
    this.bookRight.playAnimation({ state: 'static_right', loop: false });
    this.mainBook.playAnimation({ state: 'start', loop: false });
  }

  protected onMainBookAnimEnd(data: any): void {
    console.log('main book anim end -- ', data);
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
    this.bookRightStatic.setSkin(this.nextSymbol);
    this.bookRightStatic.playAnimation({ state: 'static_right', loop: false });
    this.bookRight.playAnimation({ state: 'flipping', loop: false });
  }

  protected onRightBookAnimEnd(data: any): void {
    console.log('right book anim end -- ', data);

    if (data.animation.name === 'flipping') {
      //this.startNextFlip();
    }
  }
  protected onRightBookChangeSkin(data: any): void {
    console.log('aaaaaaaaaaaaaa == ', data);
    this.bookRight.setSkin(this.getRandomSkin());
  }
}
