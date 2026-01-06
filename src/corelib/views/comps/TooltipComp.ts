import { StandardView } from '@core/pixiwrapper/StandardView';
import { UIUtil } from '@core/utils/UIUtilService';

export class TooltipComp extends StandardView {
  constructor(config: any) {
    super(config);
    const bg = UIUtil.getSprite('tooltipbg');
    bg.anchor.set(0.5);
    this.addChild(bg);
    this.setTooltipText();
  }
  protected setTooltipText() {
    const config = {
      name: 'ttText',
      type: 'Text',
      toUpperCase: true,
      content: this.configData.tooltipText,
      style: { fontFamily: 'commonFont', fill: 0xffffff, fontSize: 30 },
    };
    const tooltipText = UIUtil.getElement(config);
    tooltipText.anchor.set(0.5);
    tooltipText.x = 0;
    tooltipText.y = 0;
    this.addChild(tooltipText);
  }
}
