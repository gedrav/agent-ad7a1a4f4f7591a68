import { StandardView } from '@core/pixiwrapper/StandardView';
import { AnimationStateListener, Spine } from '@esotericsoftware/spine-pixi-v8';
import { UIUtil } from '@core/utils/UIUtilService';
import { Util } from '@core/utils/UtilService';
import { GameProxy } from '@core/models/GameConfigProxy';

export class PixSpine extends StandardView {
  protected anchor: any;
  private readonly spineAnim: any;
  private readonly stateListeners: AnimationStateListener[] = [];

  constructor(configData: any) {
    super(configData);
    this.spineAnim = Spine.from({
      skeleton: this.configData.spineName + 'Data',
      atlas: this.configData.spineName + 'Atlas',
      scale: 1,
    });
    //this.anchor = { x: 0.5, y: 0.5 };
    this.configData = {};
    for (const p in configData) {
      this.configData[p] = configData[p];
    }
    if (this.configData.defaultSkin != undefined) {
      this.setSkin(this.configData.defaultSkin);
    }
    this.spineAnim.eventMode = 'none';
    this.addChild(this.spineAnim);
    if (this.configData.boundingBox) {
      this.guideRect = UIUtil.getRectangle(
        this.configData.boundingBox.width,
        this.configData.boundingBox.height,
        0xff0000,
      );
      this.guideRect.alpha = 0;
      this.spineAnim.x = this.guideRect.width / 2 + Util.getDefaultValue(this.configData.boundingBox.xPadding, 0);
      this.spineAnim.y = this.guideRect.height / 2 + Util.getDefaultValue(this.configData.boundingBox.yPadding, 0);
      this.addChildAt(this.guideRect, 0);
    }
    this.uploadToGPU();
  }

  private async uploadToGPU() {
    this.spineAnim.skeleton.setToSetupPose();
    this.spineAnim.update(0);
    await GameProxy.config.renderer.prepare.upload(this.spineAnim);
  }

  public setAnimationSpeed(num: number): void {
    if (this.spineAnim?.state) this.spineAnim.state.timeScale = num;
  }

  setSkin(name: string): void {
    this.spineAnim.skeleton.setSkinByName(name);
    this.spineAnim.skeleton.setSlotsToSetupPose(); //resets all slot attachments (images, meshes, etc.) on the skeleton back to what's defined in the current skin's setup pose.
    this.spineAnim.update(0);
  }

  // Slots bound to skinRequired bones not declared by the current skin keep an inactive bone.
  // The animation skips them (applyAttachmentTimeline returns early for inactive bones), so they
  // render frozen at their setup-pose attachment. Clear those so they stay hidden until a skin
  // that activates their bone re-shows + animates them.
  public hideInactiveBoneSlots(): void {
    const slots = this.spineAnim?.skeleton?.slots;
    if (!slots) return;
    for (const slot of slots) {
      if (!slot.bone.active && slot.getAttachment()) {
        slot.setAttachment(null);
      }
    }
  }

  addEventListener(event: string, callback: any): AnimationStateListener | null {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that: PixSpine = this;
    let listener: AnimationStateListener | null = null;
    if (event === 'complete') {
      listener = {
        complete: function (entry) {
          callback(entry, that);
        },
      };
    } else if (event === 'event') {
      listener = {
        event: function (entry, event) {
          callback(event, that);
        },
      };
    }
    if (listener) {
      this.spineAnim.state.addListener(listener);
      this.stateListeners.push(listener);
    }
    return listener;
  }

  removeEventListners() {
    if (!this.spineAnim) return;
    for (const listener of this.stateListeners) {
      this.spineAnim.state.removeListener(listener);
    }
    this.stateListeners.length = 0;
  }

  public playAnimation(options: any = null) {
    options = options || {};
    if (options.state == undefined) {
      options.state = this.configData.defaultState;
    }

    const shouldReset = Util.getDefaultValue(options.reset, true);
    this.spineAnim.state.data.defaultMix = Util.getDefaultValue(options.defaultMix, 1);
    if (shouldReset) {
      this.spineAnim.state.setEmptyAnimation(0, 0);
      this.spineAnim.state.clearTracks();
      this.spineAnim.skeleton.setToSetupPose();
      this.spineAnim.state.tracks = [];
    }
    this.spineAnim.state.timeScale = 1;
    options.trackIndex = Util.getDefaultValue(options.trackIndex, 0);
    this.spineAnim.state.setAnimation(options.trackIndex, options.state, options.loop);
    if (options.nextState) {
      this.spineAnim.state.addAnimation(
        options.trackIndex,
        options.nextState,
        Util.getDefaultValue(options.nextLoop, true),
        Util.getDefaultValue(options.delay, 0),
      );
    }
    if (options.stopAtFirst) {
      this.spineAnim.state.timeScale = 0;
      this.spineAnim.skeleton.setToSetupPose();
    }
    this.spineAnim.update(0);
  }
  public playReverseAnimation(): void {
    //this.spineAnim.state.timeScale = -1;
  }
  update(val: number): void {
    this.spineAnim.update(val);
  }
  stopAnimation() {
    this.spineAnim.state.timeScale = 0;
    this.spineAnim.state.data.defaultMix = 1;
    //this.spineAnim.state.setEmptyAnimation(0, 0);
    //this.spineAnim.state.clearTracks();
    this.spineAnim.skeleton.setToSetupPose();
    this.spineAnim.update(0);
  }

  public setAutoUpdate(enabled: boolean): void {
    if (!this.spineAnim) return;
    this.spineAnim.autoUpdate = enabled;
  }
  public getWidth(): number {
    if (this.configData.boundingBox) {
      return this.configData.boundingBox.width * this.scale.x;
    } else {
      return this.width;
    }
  }
  public getHeight(): number {
    if (this.configData.boundingBox) {
      return this.configData.boundingBox.height * this.scale.y;
    } else {
      return this.height;
    }
  }
  public removeSpineEvent(listener: AnimationStateListener): void {
    if (!this.spineAnim || !listener) return;
    this.spineAnim.state.removeListener(listener);
    const idx = this.stateListeners.indexOf(listener);
    if (idx !== -1) this.stateListeners.splice(idx, 1);
  }
  public destroySpine() {
    if (!this.spineAnim) return;

    // 1) IMPORTANT: stop auto-updating (unhooks from Ticker.shared)
    this.spineAnim.autoUpdate = false;

    // 2) Stop animations + remove AnimationState listeners (prevents leaks)
    this.spineAnim.state.clearTracks();
    this.spineAnim.state.clearListeners();
    this.stateListeners.length = 0;

    // 3) If you attached Pixi objects to slots, remove them
    this.spineAnim.removeSlotObjects?.();

    // 4) Remove any Pixi/Federated event handlers YOU added (pointerdown etc.)
    // If you kept handler refs, prefer spine.off('pointerdown', handler)
    this.spineAnim.removeAllListeners?.();

    // 5) Detach and destroy
    this.removeChild(this.spineAnim);
    this.parent?.removeChild(this);
    this.spineAnim.destroy({ children: true }); // D
  }

  public patchSpineDataAtRuntime() {
    try {
      const spineAnim = (this as any).spineAnim;
      if (!spineAnim?.skeleton?.data) {
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
          const newMesh = baseSymbolR.copy();
          if (symbolLMesh?.region) {
            newMesh.region = symbolLMesh.region;
            if (typeof newMesh.updateRegion === 'function') newMesh.updateRegion();
            skin.setAttachment(slotIndexR, 'symbol_r', newMesh);
            skin.setAttachment(slotIndexR, 'symb_null', newMesh);
          } else {
            console.warn(`patchSpineDataAtRuntime: Skin ${skin.name} missing symbol_l mesh or region`);
          }
        }
      }
    } catch (e: any) {
      console.error('patchSpineDataAtRuntime Error:', e);
    }
  }
}
