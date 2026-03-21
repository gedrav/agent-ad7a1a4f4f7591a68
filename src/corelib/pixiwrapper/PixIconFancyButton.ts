import { FancyButton } from '@pixi/ui';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { UIUtil } from '@core/utils/UIUtilService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { ActionCommand } from '@core/commands/core/ActionCommand';
import { TooltipComp } from '@brand/views/comps/TooltipComp';

export class PixIconFancyButton extends FancyButton {
  private icon: PixSprite;
  private toolTip: TooltipComp;
  set configData(value: any) {
    this._configData = value;
  }
  private _configData: any;
  public name: string;

  constructor(btnData: any, configData: any) {
    const modifiedBtnData = { ...btnData };
    if (configData.options?.icon) {
      delete modifiedBtnData.icon;
    }
    if (configData.options?.animations) {
      modifiedBtnData.animations = {
        ...configData.options.animations,
        default: {
          ...configData.options.animations.default,
          props: { ...configData.options.animations.default.props, scale: { x: 1, y: 1 } },
        },
        hover: {
          ...configData.options.animations.hover,
          props: { ...configData.options.animations.hover.props, scale: { x: 1, y: 1 } },
        },
        pressed: {
          ...configData.options.animations.pressed,
          props: { ...configData.options.animations.pressed.props, scale: { x: 1, y: 1 } },
        },
      };
    }
    super(modifiedBtnData);
    this.configData = {};
    for (const p in configData) {
      this.configData[p] = configData[p];
    }
    if (this.configData.hitArea) {
      this.hitArea = this.configData.hitArea;
      console.log('hitArea', this.hitArea);
    }

    this.onPress.connect(this.onButtonPress.bind(this));

    if (this.configData.options?.icon) {
      this.icon = new PixSprite(UIUtil.getTexture(this.configData.options.icon));
      if (this.configData.options.iconOffset) {
        this.icon.x = this.configData.options.iconOffset.x;
        this.icon.y = this.configData.options.iconOffset.y;
      }
      this.icon.anchor.set(0.5);
      this.icon.scale.set(1);
      this.addChild(this.icon);

      this.onDown.connect(() => this.onCustomDown());
      this.onUp.connect(() => this.onCustomUp());
      this.onHover.connect(() => this.onCustomHover());
      this.onOut.connect(() => this.onCustomOut());
    }
    if (this.configData.tooltipText) {
      this.toolTip = new TooltipComp({ tooltipText: this.configData.tooltipText });
      this.addChild(this.toolTip);
      if (this.toolTip.width > this.width) {
        this.toolTip.scale.set((this.width / this.toolTip.width) * 0.9);
      }
      this.toolTip.x = 0;
      this.toolTip.y = this.height * 0.3;
    }
  }

  protected onCustomDown(): void {
    if (this.configData.options.iconPressed) {
      this.icon.texture = UIUtil.getTexture(this.configData.options.iconPressed);
    }
    if (this.configData.options.animations?.pressed) {
      const data = this.configData.options.animations.pressed;
      AnimationProxy.animateTween(this.icon.scale, {
        duration: data.duration / 1000,
        x: data.props.scale.x,
        y: data.props.scale.y,
      });
    }
  }

  protected onCustomUp(): void {
    if (this.state === 'hover') {
      this.onCustomHover();
    } else {
      this.onCustomOut();
    }
  }

  protected onCustomHover(): void {
    if (this.state === 'pressed') return;
    if (this.configData.options.iconHover) {
      this.icon.texture = UIUtil.getTexture(this.configData.options.iconHover);
    }
    if (this.configData.options.animations?.hover) {
      const data = this.configData.options.animations.hover;
      AnimationProxy.animateTween(this.icon.scale, {
        duration: data.duration / 1000,
        x: data.props.scale.x,
        y: data.props.scale.y,
      });
    }
  }

  protected onCustomOut(): void {
    if (this.state === 'pressed') return;
    if (this.configData.options.icon) {
      this.icon.texture = UIUtil.getTexture(this.configData.options.icon);
    }
    if (this.configData.options.animations?.default) {
      const data = this.configData.options.animations.default;
      AnimationProxy.animateTween(this.icon.scale, {
        duration: data.duration / 1000,
        x: data.props.scale.x,
        y: data.props.scale.y,
      });
    }
  }

  protected onButtonPress(): void {
    if (this.configData?.action?.press) {
      const action: ActionCommand = this.configData.action.press;
      action?.execute(this.configData.data);
    }
  }

  public setData(data: any) {
    this.configData.data = data;
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

  disble() {
    this.interactive = false;
    this.alpha = 0.8;
  }

  enable() {
    this.interactive = true;
    this.alpha = 1;
  }
}
