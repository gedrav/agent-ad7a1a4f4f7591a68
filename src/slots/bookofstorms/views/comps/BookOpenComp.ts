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
    setTimeout(this.playBookAnimation.bind(this), 1000);
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

    this.bookRight = UIUtil.getElement(config);
    this.addChild(this.bookRight);
    this.bookRight.x = this.guideRect.width / 2;
    this.bookRight.y = this.guideRect.height / 2;
    this.bookRight.visible = false;
    this.bookRight.addEventListener('complete', this.onRightBookAnimEnd.bind(this));

    this.bookRightStatic = UIUtil.getElement(config);
    this.addChild(this.bookRightStatic);
    this.bookRightStatic.x = this.guideRect.width / 2;
    this.bookRightStatic.y = this.guideRect.height / 2;
    this.bookRightStatic.visible = false;

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

  private applyMixedSkin(spineObj: PixSpine, frontSkinName: string, backSkinName: string) {
    const spineAnim = (spineObj as any).spineAnim;
    if (!spineAnim || !spineAnim.skeleton || !spineAnim.skeleton.data) return;

    const customSkin = new Skin('mixed_flip_skin');
    const skeletonData = spineAnim.skeleton.data;

    const defaultSkin = skeletonData.findSkin('default');
    if (defaultSkin) {
      customSkin.addSkin(defaultSkin);
    }

    const frontSkin = skeletonData.findSkin(frontSkinName);
    if (frontSkin) {
      let slotIndexR = -1;
      for (let i = 0; i < skeletonData.slots.length; i++) {
        if (skeletonData.slots[i].name === 'symbol_r') {
          slotIndexR = i;
          break;
        }
      }
      if (slotIndexR >= 0) {
        const attachment =
          frontSkin.getAttachment(slotIndexR, 'symbol_r') || frontSkin.getAttachment(slotIndexR, 'symb_null');
        if (attachment) {
          customSkin.setAttachment(slotIndexR, 'symbol_r', attachment);
          customSkin.setAttachment(slotIndexR, 'symb_null', attachment);
        }
      }
    }

    const backSkin = skeletonData.findSkin(backSkinName);
    if (backSkin) {
      let slotIndexL = -1;
      for (let i = 0; i < skeletonData.slots.length; i++) {
        if (skeletonData.slots[i].name === 'symbol_l') {
          slotIndexL = i;
          break;
        }
      }
      if (slotIndexL >= 0) {
        const attachment =
          backSkin.getAttachment(slotIndexL, 'symbol_l') || backSkin.getAttachment(slotIndexL, 'symb_null');
        if (attachment) {
          customSkin.setAttachment(slotIndexL, 'symbol_l', attachment);
          customSkin.setAttachment(slotIndexL, 'symb_null', attachment);
        }
      }
    }

    spineAnim.skeleton.setSkin(customSkin);
    spineAnim.skeleton.setSlotsToSetupPose();
    spineAnim.update(0);
  }

  private availableSkins: string[] = ['10', 'A', 'J', 'K', 'Q', 'eagle', 'castle', 'man', 'mask'];
  private leftSymbol: string = '';
  private rightSymbol: string = '';
  private nextLeftSymbol: string = '';

  private getRandomSkin(): string {
    return this.availableSkins[Math.floor(Math.random() * this.availableSkins.length)];
  }

  protected playBookAnimation1(): void {
    this.bookLeft.visible = true;
    this.bookLeft.setSkin('10');
    this.bookLeft.playAnimation({ state: 'static_left', loop: false });
  }
  protected playBookAnimation(): void {
    this.mainBook.visible = true;

    this.leftSymbol = this.getRandomSkin();
    this.rightSymbol = this.getRandomSkin();

    this.mainBook.setSkin(this.leftSymbol);
    this.bookLeft.setSkin(this.leftSymbol);
    this.bookRightStatic.setSkin(this.rightSymbol);

    this.mainBook.playAnimation({ state: 'start', loop: false });
  }

  protected onMainBookAnimEnd(data: any): void {
    console.log('main book anim end -- ', data);
    if (data.animation.name === 'start') {
      this.mainBook.playAnimation({ state: 'open', loop: false });
    } else if (data.animation.name === 'open') {
      this.bookLeft.visible = true;
      this.bookRight.visible = true;
      this.bookRightStatic.visible = true;

      // Make sure the static right page doesn't overlap the flip incorrectly
      this.setChildIndex(this.bookRightStatic, this.getChildIndex(this.bookRight) - 1);

      this.bookLeft.playAnimation({ state: 'static_left', loop: false });
      this.bookRightStatic.playAnimation({ state: 'static_right', loop: false });
      this.startNextFlip();
    }
  }

  private startNextFlip(): void {
    try {
      const frontSymbol = this.rightSymbol;
      const backSymbol = this.getRandomSkin();
      const revealedRightSymbol = this.getRandomSkin();

      // Update the static right page to the newly revealed symbol underneath
      this.bookRightStatic.setSkin(revealedRightSymbol);
      this.bookRightStatic.playAnimation({ state: 'static_right', loop: false });

      // Setup the flipping page using our new runtime mixed skin generator
      this.applyMixedSkin(this.bookRight, frontSymbol, backSymbol);
      this.bookRight.playAnimation({ state: 'flipping', loop: false });

      // Store state for when the flip lands
      this.nextLeftSymbol = backSymbol;
      this.rightSymbol = revealedRightSymbol;
    } catch (e: any) {
      console.error('startNextFlip Error:', e);
    }
  }

  protected onRightBookAnimEnd(data: any): void {
    console.log('right book anim end -- ', data);
    if (data.animation.name === 'flipping') {
      // 1. The flip lands on the left, so the left page becomes the back side of the flipped page
      this.leftSymbol = this.nextLeftSymbol;
      this.bookLeft.setSkin(this.leftSymbol);
      this.bookLeft.playAnimation({ state: 'static_left', loop: false });

      // 2. Start the next physical page turn
      this.startNextFlip();
    }
  }
}
