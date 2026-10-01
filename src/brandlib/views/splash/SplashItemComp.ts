import { StandardView } from '@core/pixiwrapper/StandardView';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { PixText } from '@core/pixiwrapper/PixText';
import { Util } from '@core/utils/UtilService';

export class SplashItemComp extends StandardView {
  private readonly splashImage: PixSprite;
  private readonly contentTxt: PixText;
  private readonly contentTxt1: PixText;

  constructor(config: any) {
    super(config);

    this.splashImage = UIUtil.getSprite(this.configData.image);
    this.contentTxt = UIUtil.getText(this.configData.textStyle);
    UIUtil.updateWordWrapWidth(this.contentTxt, this.splashImage.width * 0.75);

    this.contentTxt.text = Util.getContent(this.configData.content);
    this.contentTxt.anchor.set(0.5, 0);

    this.addChild(this.splashImage, this.contentTxt);
    this.contentTxt.x = this.configData.textX ? this.configData.textX : this.splashImage.width / 2;
    // Center text vertically, clamped so it never goes above textY (prevents overlapping reel images)
    const centeredY = this.configData.textY + (this.configData.textAreaHeight - this.contentTxt.height) / 2;
    this.contentTxt.y = Math.max(this.configData.textY, centeredY);
  }
}
