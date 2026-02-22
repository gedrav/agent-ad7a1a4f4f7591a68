import { StandardView } from '@core/pixiwrapper/StandardView';
import { Spine } from '@esotericsoftware/spine-pixi-v8';
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
      this.spineAnim.x = this.guideRect.width / 2 + Util.getDefaultValue(this.configData.boundingBox.xPadding, 0);
      this.spineAnim.y = this.guideRect.height / 2 + Util.getDefaultValue(this.configData.boundingBox.yPadding, 0);
      this.addChildAt(this.guideRect, 0);
      this.guideRect.alpha = 0;
    }
  }

  public setAnimationSpeed(num: number): void {}

  setSkin(name: string): void {
    this.spineAnim.skeleton.setSkinByName(name);
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

  public prepareAnimation(options: any = null) {
    if (options && options.state == undefined) {
      options.state = this.configData.defaultState;
    }

    this.spineAnim.state.data.defaultMix = 1;
    this.spineAnim.state.setEmptyAnimation(0, 0);
    this.spineAnim.state.clearTracks();
    this.spineAnim.skeleton.setToSetupPose();
    this.spineAnim.state.timeScale = 1;
    this.spineAnim.state.tracks = [];
    options.trackIndex = 0;
    this.spineAnim.state.setAnimation(options.trackIndex, options.state, options.loop);
    this.spineAnim.state.timeScale = 0;
  }

  public playAnimation(options: any = null) {
    if (options && options.state == undefined) {
      options.state = this.configData.defaultState;
    }

    this.spineAnim.state.data.defaultMix = 1;
    this.spineAnim.state.setEmptyAnimation(0, 0);
    this.spineAnim.state.clearTracks();
    this.spineAnim.skeleton.setToSetupPose();
    this.spineAnim.state.timeScale = 1;
    this.spineAnim.state.tracks = [];
    options.trackIndex = 0;
    this.spineAnim.state.setAnimation(options.trackIndex, options.state, options.loop);
    if (options.stopAtFirst) {
      this.spineAnim.state.timeScale = 0;
      this.spineAnim.skeleton.setToSetupPose();
    }
  }
  public playReverseAnimation(): void {
    //this.spineAnim.state.timeScale = -1;
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
}
