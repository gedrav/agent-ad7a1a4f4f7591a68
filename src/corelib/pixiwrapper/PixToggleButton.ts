import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { PixAnimatedSprite } from '@core/pixiwrapper/PixAnimatedSprite';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { UIUtil } from '@core/utils/UIUtilService';

export class PixToggleButton extends PixFancyButton {
  public isSelected: boolean = false;
  protected selectedState: PixAnimatedSprite | PixSprite;

  constructor(btnData: any, configData: any) {
    super(btnData, configData);

    if (configData.lscale !== undefined) this.configData.lscale = configData.lscale;
    if (configData.lx !== undefined) this.configData.lx = configData.lx;
    if (configData.ly !== undefined) this.configData.ly = configData.ly;
    if (configData.px !== undefined) this.configData.px = configData.px;
    if (configData.py !== undefined) this.configData.py = configData.py;

    if (this.configData.Elements) {
      this.configData.Elements.forEach((elementConfig: any) => {
        const element = UIUtil.getElement(elementConfig);
        this.addChild(element);
      });
    }
  }

  public setSelected(selected: boolean) {
    this.isSelected = selected;
    if (this.isSelected) {
      this.defaultView = UIUtil.getSprite(this.configData.selectedOptions.defaultView);
      this.hoverView = UIUtil.getSprite(this.configData.selectedOptions.hoverView);
      this.pressedView = UIUtil.getSprite(this.configData.selectedOptions.pressedView);
    } else {
      this.defaultView = UIUtil.getSprite(this.configData.options.defaultView);
      this.hoverView = UIUtil.getSprite(this.configData.options.hoverView);
      this.pressedView = UIUtil.getSprite(this.configData.options.pressedView);
    }
    if (this.textView && this.configData.textConfig?.style) {
      if (this.isSelected) {
        this.changeTextColor(this.configData.textConfig.style.selectedStateColor);
      } else {
        this.changeTextColor(this.configData.textConfig.style.nonSelectedStateColor);
      }
    }
  }
}
