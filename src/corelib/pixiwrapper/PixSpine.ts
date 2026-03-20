import { StandardView } from '@core/pixiwrapper/StandardView';
import { AnimationStateListener, Spine } from '@esotericsoftware/spine-pixi-v8';
import { UIUtil } from '@core/utils/UIUtilService';
import { Util } from '@core/utils/UtilService';

interface BoundingBoxConfig {
  width: number;
  height: number;
  xPadding?: number;
  yPadding?: number;
}

interface SpineConfig {
  spineName: string;
  defaultSkin?: string;
  defaultState?: string;
  boundingBox?: BoundingBoxConfig;
  [key: string]: unknown;
}

interface AnimationOptions {
  state?: string;
  loop?: boolean;
  trackIndex?: number;
  stopAtFirst?: boolean;
  listener?: AnimationStateListener;
  timeScale?: number;
}

export class PixSpine extends StandardView {
  private spineAnim: Spine;

  constructor(configData: SpineConfig) {
    super(configData);

    this.configData = { ...configData };

    this.spineAnim = Spine.from({
      skeleton: `${configData.spineName}Data`,
      atlas: `${configData.spineName}Atlas`,
      scale: 1,
    });

    if (configData.defaultSkin) {
      this.setSkin(configData.defaultSkin);
    }

    this.addChild(this.spineAnim);
    this.initBoundingBox(configData.boundingBox);
  }

  private initBoundingBox(boundingBox?: BoundingBoxConfig): void {
    if (!boundingBox) return;

    this.guideRect = UIUtil.getRectangle(boundingBox.width, boundingBox.height, 0xff0000);
    this.spineAnim.x = boundingBox.width / 2 + Util.getDefaultValue(boundingBox.xPadding, 0);
    this.spineAnim.y = boundingBox.height / 2 + Util.getDefaultValue(boundingBox.yPadding, 0);
    this.addChildAt(this.guideRect, 0);
  }

  public setSkin(name: string): void {
    this.spineAnim.skeleton.setSkinByName(name);
  }

  public onSpineEvent(listener: AnimationStateListener): void {
    this.spineAnim.state.addListener(listener);
  }

  public removeSpineEvent(listener: AnimationStateListener): void {
    this.spineAnim.state.removeListener(listener);
  }

  public clearSpineEvents(): void {
    this.spineAnim.state.clearListeners();
  }

  public prepareAnimation(options: AnimationOptions = {}): void {
    const resolvedOptions = this.resolveAnimationOptions(options);

    this.spineAnim.state.data.defaultMix = 0;
    this.spineAnim.state.setEmptyAnimation(0, 0);
    this.spineAnim.state.clearTracks();
    this.spineAnim.skeleton.setToSetupPose();
    this.spineAnim.state.timeScale = resolvedOptions.timeScale;
    this.spineAnim.state.tracks = [];
    this.spineAnim.state.setAnimation(0, resolvedOptions.state!, resolvedOptions.loop);
    this.spineAnim.state.timeScale = 0;
  }

  public playAnimation(options: AnimationOptions = {}): void {
    this.prepareAnimation(options);
    const resolvedOptions = this.resolveAnimationOptions(options);

    this.spineAnim.state.data.defaultMix = 0;
    this.spineAnim.state.timeScale = resolvedOptions.timeScale;
    this.spineAnim.state.setAnimation(0, resolvedOptions.state!, resolvedOptions.loop);

    if (resolvedOptions.listener) {
      this.spineAnim.state.addListener(resolvedOptions.listener);
    }
  }

  public stopAnimation(): void {
    this.spineAnim.state.timeScale = 0;
    this.spineAnim.state.data.defaultMix = 0;
    this.spineAnim.skeleton.setToSetupPose();
    this.spineAnim.state.clearListeners();
    this.spineAnim.removeAllListeners();
  }

  public getWidth(): number {
    return this.configData.boundingBox ? this.configData.boundingBox.width * this.scale.x : this.width;
  }

  public getHeight(): number {
    return this.configData.boundingBox ? this.configData.boundingBox.height * this.scale.y : this.height;
  }

  private resolveAnimationOptions(options: AnimationOptions): AnimationOptions {
    return {
      ...options,
      state: options.state ?? this.configData.defaultState,
      timeScale: options.timeScale ?? 1,
    };
  }
}
