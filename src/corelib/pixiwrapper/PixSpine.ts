import { StandardView } from '@core/pixiwrapper/StandardView';
import { AnimationStateListener, Spine } from '@esotericsoftware/spine-pixi-v8';
import { UIUtil } from '@core/utils/UIUtilService';
import { Util } from '@core/utils/UtilService';

export class PixSpine extends StandardView {
  protected anchor: any;
  private spineAnim: any;

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
    this.addChild(this.spineAnim);
    if (this.configData.boundingBox) {
      this.guideRect = UIUtil.getRectangle(
        this.configData.boundingBox.width,
        this.configData.boundingBox.height,
        0xff0000,
      );
      //this.guideRect.alpha = 0;
      this.spineAnim.x = this.guideRect.width / 2 + Util.getDefaultValue(this.configData.boundingBox.xPadding, 0);
      this.spineAnim.y = this.guideRect.height / 2 + Util.getDefaultValue(this.configData.boundingBox.yPadding, 0);
      this.addChildAt(this.guideRect, 0);
    }
  }

  public setAnimationSpeed(num: number): void {}

  setSkin(name: string): void {
    this.spineAnim.skeleton.setSkinByName(name);
    this.spineAnim.skeleton.setSlotsToSetupPose(); //resets all slot attachments (images, meshes, etc.) on the skeleton back to what's defined in the current skin's setup pose.
  }

  addEventListener(event: string, callback: any) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that: PixSpine = this;
    if (event === 'complete') {
      this.spineAnim.state.addListener({
        complete: function (entry) {
          callback(entry, that);
        },
      });
    } else if (event === 'event') {
      this.spineAnim.state.addListener({
        event: function (entry, event) {
          callback(event, that);
        },
      });
    }
  }
  removeEventListners() {
    //this.spineAnim.state.removeListener();
  }

  /*public prepareAnimation(options: any = null) {
    options = options || {};
    if (options.state == undefined) {
      options.state = this.configData.defaultState;
    }

    this.spineAnim.state.data.defaultMix = Util.getDefaultValue(options.defaultMix, 1);
    this.spineAnim.state.setEmptyAnimation(0, 0);
    this.spineAnim.state.clearTracks();
    this.spineAnim.skeleton.setToSetupPose();
    this.spineAnim.state.timeScale = 1;
    this.spineAnim.state.tracks = [];
    options.trackIndex = 0;
    this.spineAnim.state.setAnimation(options.trackIndex, options.state, options.loop);
    this.spineAnim.state.timeScale = 0;
  }*/

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
    this.spineAnim.state.removeListener(listener);
  }
  public destroySpine() {
    if (!this.spineAnim) return;

    // 1) IMPORTANT: stop auto-updating (unhooks from Ticker.shared)
    this.spineAnim.autoUpdate = false;

    // 2) Stop animations + remove AnimationState listeners (prevents leaks)
    this.spineAnim.state.clearTracks();
    this.spineAnim.state.clearListeners();

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
}
