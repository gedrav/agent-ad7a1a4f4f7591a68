import { Slider } from '@pixi/ui';
import { GameProxy } from '@core/models/GameConfigProxy';
import { UIUtil } from '@core/utils/UIUtilService';

export class PixSlider extends Slider {
  set configData(value: any) {
    this._configData = value;
  }
  private _configData: any;
  public name: string;
  declare protected sliderOptions: any;
  private labelText: any;
  private initialValue: number;

  constructor(sliderData: any, configData: any) {
    if (sliderData.valueTextStyle?.fontFamily && GameProxy.config.FontFaces) {
      sliderData.valueTextStyle.fontFamily =
        GameProxy.config.FontFaces[sliderData.valueTextStyle.fontFamily] || sliderData.valueTextStyle.fontFamily;
    }
    super(sliderData);
    this.sliderOptions = sliderData;
    this.configData = {};
    this.initialValue = sliderData.value || 0;

    // cloning
    for (const p in configData) {
      this.configData[p] = configData[p];
    }
    // Copy landscape/portrait properties from sliderData to configData
    if (sliderData.lx !== undefined) this.configData.lx = sliderData.lx;
    if (sliderData.ly !== undefined) this.configData.ly = sliderData.ly;
    if (sliderData.px !== undefined) this.configData.px = sliderData.px;
    if (sliderData.py !== undefined) this.configData.py = sliderData.py;
    if (sliderData.lscale !== undefined) this.configData.lscale = sliderData.lscale;
    if (sliderData.lbgWidth !== undefined) this.configData.lbgWidth = sliderData.lbgWidth;
    if (sliderData.lbgHeight !== undefined) this.configData.lbgHeight = sliderData.lbgHeight;
    if (sliderData.pbgWidth !== undefined) this.configData.pbgWidth = sliderData.pbgWidth;
    if (sliderData.pbgHeight !== undefined) this.configData.pbgHeight = sliderData.pbgHeight;
    this.onChange.connect(this.onSliderChange.bind(this));
    this.onUpdate.connect(this.onSliderUpdate.bind(this));

    // Create Elements if provided
    if (sliderData.Elements && sliderData.Elements.length > 0) {
      sliderData.Elements.forEach((element: any) => {
        const createdElement = UIUtil.getElement(element);
        if (createdElement) {
          // Store reference to text elements and preserve original config
          if (element.type === 'Text' && !this.labelText) {
            this.labelText = createdElement;
            this.labelText.originalConfig = element;
          }
          this.addChild(createdElement);
        }
      });
    }

    // Fallback: Create label text if textConfig provided (backward compatibility)
    if (!this.labelText && sliderData.textConfig) {
      this.labelText = UIUtil.getText(sliderData.textConfig);
      if (sliderData.textConfig.anchor) {
        this.labelText.anchor.set(sliderData.textConfig.anchor.x, sliderData.textConfig.anchor.y);
      } else {
        this.labelText.anchor.set(0, 0.5);
      }
      this.addChild(this.labelText);
    }

    // Apply sizing after slider is fully initialized
    setTimeout(() => {
      this.applySpriteSizing();
      this.updateSlider(); // Ensure proper positioning after sizing
      // Set initial color
      if (this.sliderOptions.valueTextStyle?.initialColor && this.value1Text) {
        UIUtil.updateTextColor(this.value1Text as any, this.sliderOptions.valueTextStyle.initialColor);
      }
    }, 0);
  }

  private applySpriteSizing() {
    // Background sizing and scaling
    if (this.bg) {
      if (this.sliderOptions.bgWidth) this.bg.width = this.sliderOptions.bgWidth;
      if (this.sliderOptions.bgHeight) this.bg.height = this.sliderOptions.bgHeight;
      if (this.sliderOptions.bgScale) {
        if (typeof this.sliderOptions.bgScale === 'object') {
          this.bg.scale.set(this.sliderOptions.bgScale.x || 1, this.sliderOptions.bgScale.y || 1);
        } else {
          this.bg.scale.set(this.sliderOptions.bgScale);
        }
      }
    }

    // Fill sizing and scaling - use fill properties if defined, otherwise use bg properties
    if (this.fill) {
      const fillWidth = this.sliderOptions.fillWidth ?? this.sliderOptions.bgWidth;
      const fillHeight = this.sliderOptions.fillHeight ?? this.sliderOptions.bgHeight;
      const fillScale = this.sliderOptions.fillScale ?? this.sliderOptions.bgScale;

      if (fillWidth) this.fill.width = fillWidth;
      if (fillHeight) this.fill.height = fillHeight;
      if (fillScale) {
        if (typeof fillScale === 'object') {
          this.fill.scale.set(fillScale.x || 1, fillScale.y || 1);
        } else {
          this.fill.scale.set(fillScale);
        }
      }

      // Apply fillPaddings if provided
      if (this.sliderOptions.fillPaddings) {
        const paddings = this.sliderOptions.fillPaddings;
        if (paddings.top !== undefined) this.fill.y = paddings.top;
        if (paddings.left !== undefined) this.fill.x = paddings.left;
        if (paddings.right !== undefined) this.fill.width -= paddings.right;
        if (paddings.bottom !== undefined) this.fill.height -= paddings.bottom;
      }
    }

    // Slider knob sizing and scaling
    if (this._slider1) {
      if (this.sliderOptions.sliderWidth) this._slider1.width = this.sliderOptions.sliderWidth;
      if (this.sliderOptions.sliderHeight) this._slider1.height = this.sliderOptions.sliderHeight;
      if (this.sliderOptions.sliderScale) {
        if (typeof this.sliderOptions.sliderScale === 'object') {
          this._slider1.scale.set(this.sliderOptions.sliderScale.x || 1, this.sliderOptions.sliderScale.y || 1);
        } else {
          this._slider1.scale.set(this.sliderOptions.sliderScale);
        }
      }
    }
  }

  protected onSliderChange(value: number): void {
    if (this.sliderOptions.valueTextStyle && this.value1Text) {
      const color =
        value === 0 ? this.sliderOptions.valueTextStyle.initialColor : this.sliderOptions.valueTextStyle.updatedColor;
      if (color) UIUtil.updateTextColor(this.value1Text as any, color);
    }
    if (this.configData?.action?.change) {
      this.configData.action.change.execute({ value, data: this.configData.data });
    }
  }

  protected onSliderUpdate(value: number): void {
    if (this.sliderOptions.valueTextStyle && this.value1Text) {
      const color =
        value === 0 ? this.sliderOptions.valueTextStyle.initialColor : this.sliderOptions.valueTextStyle.updatedColor;
      if (color) UIUtil.updateTextColor(this.value1Text as any, color);
    }
    if (this.configData?.action?.update) {
      this.configData.action.update.execute({ value, data: this.configData.data });
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

  getValue() {
    return this.value;
  }

  protected updateSlider() {
    if (!this._slider1) return;

    // Ensure knob anchor x is 0.5 (keep y as-is if present)
    if ((this._slider1 as any).anchor) {
      const a = (this._slider1 as any).anchor;
      a.set?.(0.5, a.y ?? 0.5);
      a.x = 0.5;
    }

    this.progress = (((this.value ?? this.min) - this.min) / (this.max - this.min)) * 100;

    const bgLeft = this.bg?.x ?? 0;
    const bgWidth = this.bg?.width ?? 0;

    // Use the knob's local bounds to determine its left edge and width,
    // instead of relying on a possibly non-existent 'anchor' property.
    const knobBounds = this._slider1.getLocalBounds();
    const knobWidth = knobBounds.width ?? 0;
    const knobLocalLeft = knobBounds.x ?? 0;

    // Travel distance for the knob's left edge across the background
    const travel = Math.max(bgWidth - knobWidth, 0);

    // Desired x position for the knob's left edge (aligns with bg left at progress=0)
    const desiredLeft = bgLeft + travel * (this.progress / 100);

    // Set the knob's x so its left edge matches desiredLeft (accounts for local bounds offset)
    this._slider1.x = desiredLeft - knobLocalLeft;

    this._slider1.y = (this.bg?.height ?? 0) / 2;

    if (this.sliderOptions?.showValue && this.value1Text) {
      this.value1Text.text = this.value === 0 ? 'None' : `${Math.round(this.value)}`;

      // Force set anchor for value text every time (overrides PixiJS UI default)
      if (this.sliderOptions.valueTextAnchor) {
        this.value1Text.anchor.set(this.sliderOptions.valueTextAnchor.x, this.sliderOptions.valueTextAnchor.y);
      } else {
        this.value1Text.anchor.set(1, 0.5); // Default to right-aligned
      }

      // Fix text above the slider at the end
      this.value1Text.x = (this.bg?.width ?? 0) + (this.sliderOptions.valueTextOffset?.x ?? 0);
      this.value1Text.y = this.sliderOptions.valueTextOffset?.y ?? 0;
    }

    // Position label text only if no explicit positioning was set in Elements
    if (this.labelText && !this.labelText.originalConfig?.x && !this.labelText.originalConfig?.y) {
      const labelOffset = this.sliderOptions.textOffset || this.sliderOptions.valueTextOffset;
      this.labelText.x = labelOffset?.x ?? 0;
      this.labelText.y = labelOffset?.y ?? 0;
    }
  }
}
