import { FancyButton } from '@pixi/ui';
import { TooltipComp } from '@brand/views/comps/TooltipComp';
import { ActionCommand } from '@core/commands/core/ActionCommand';
import { UIUtil } from '@core/utils/UIUtilService';
import { ColorMatrixFilter } from 'pixi.js';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SoundFactory } from '@core/sound/SoundServiceProxy';
export class PixFancyButton extends FancyButton {
  private readonly toolTip: TooltipComp;

  set configData(value: any) {
    this._configData = value;
  }
  private _configData: any;
  public name: string;

  constructor(btnData: any, configData: any) {
    super(btnData);
    this.configData = {};
    // cloning
    for (const p in configData) {
      this.configData[p] = configData[p];
    }
    // Play click sound on pointer-down for instant feedback bcoz onPress
    // (pointertap) only fires after release + tap-detection, which feels
    // delayed on touch. Action still runs on onPress.
    this.onDown.connect(this.playClickSound.bind(this));
    this.onPress.connect(this.onButtonPress.bind(this));

    if (this.configData.options?.animations?.disabled?.props?.faded) {
      const flt: ColorMatrixFilter = new ColorMatrixFilter();
      flt.grayscale(0.3, false);
      this.disabledView.filters = flt;
      this.disabledView.alpha = 0.8;
    }
    if (this.configData.tooltipText) {
      this.toolTip = new TooltipComp({ tooltipText: this.configData.tooltipText });
      this.addChild(this.toolTip);
      if (this.toolTip.width > this.width) {
        this.toolTip.scale.set((this.width / this.toolTip.width) * 0.9);
      }
      this.toolTip.x = 0;
      this.toolTip.y = this.height * 0.45;
    }
    this.name = this.configData.name;
  }

  public click(): void {
    this.playClickSound();
    this.onButtonPress();
  }

  protected playClickSound(): void {
    if (this.configData?.disablePlayClickSound) {
      return;
    }
    if (this.configData?.soundEvent) {
      EventHandler.dispatchEvent(this.configData?.soundEvent);
    }
  }

  public addActionCommand(actionCommand: ActionCommand): void {
    if (!this.configData.action) {
      this.configData.action = {};
    }
    this.configData.action.press = actionCommand;
  }

  protected onButtonPress(): void {
    if (this.configData?.action?.press) {
      const action: ActionCommand = this.configData.action.press;
      action?.execute(this.configData.data, this);
    }
  }

  public setData(data: any) {
    this.configData.data = data;
  }

  public updateText(str): void {
    this.textView.text = str;
  }

  public updateTextPos(): void {
    if (!this.textView || !this.configData.textConfig) return;
    if (this.configData.textConfig.x !== undefined) {
      this.textView.x = this.configData.textConfig.x;
    }
    if (this.configData.textConfig.y !== undefined) {
      this.textView.y = this.configData.textConfig.y;
    }
  }

  public get configData() {
    return this._configData;
  }

  getConfigData() {
    return this.configData;
  }
  getWidth() {
    return this.width;
  }
  getHeight() {
    return this.height;
  }
  changeTextColor(col: number): void {
    if (this.textView) {
      UIUtil.updateTextColor(this.textView as any, col);
    }
  }
}
