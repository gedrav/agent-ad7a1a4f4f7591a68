import { FancyButton } from '@pixi/ui';
import { TooltipComp } from '@core/views/comps/TooltipComp';
import { ActionCommand } from '@core/commands/core/ActionCommand';
import { UIUtil } from '@core/utils/UIUtilService';
import { ColorMatrixFilter } from 'pixi.js';
export class PixFancyButton extends FancyButton {
  private toolTip: TooltipComp;

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
    this.onPress.connect(this.onButtonPress.bind(this));

    if (this.configData.options?.animations?.disabled?.props?.faded) {
      const flt: ColorMatrixFilter = new ColorMatrixFilter();
      flt.grayscale(0.3, false);
      this.disabledView.filters = flt;
      this.disabledView.alpha = 0.8;
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
