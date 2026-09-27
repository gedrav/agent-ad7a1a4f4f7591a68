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
    if (this.configData.content1) {
      this.contentTxt1 = UIUtil.getText(this.configData.textStyle1);
      UIUtil.updateWordWrapWidth(this.contentTxt1, this.splashImage.width * 0.75);
      this.contentTxt1.text = Util.getContent(this.configData.content1);
      this.contentTxt1.anchor.set(0.5, 0);
      this.contentTxt1.x = this.configData.textX ? this.configData.textX : this.splashImage.width / 2;
    }
    UIUtil.updateWordWrapWidth(this.contentTxt, this.splashImage.width * 0.75);

    this.contentTxt.text = Util.getContent(this.configData.content);
    this.contentTxt.anchor.set(0.5, 0);

    this.addChild(this.splashImage, this.contentTxt);
    this.contentTxt.x = this.configData.textX ? this.configData.textX : this.splashImage.width / 2;
    // Center text vertically, clamped so it never goes above textY (prevents overlapping reel images)
    const centeredY = this.configData.textY + (this.configData.textAreaHeight - this.contentTxt.height) / 2;
    this.contentTxt.y = Math.max(this.configData.textY, centeredY);
    if (this.contentTxt1) {
      this.addChild(this.contentTxt1);
      this.contentTxt1.y = this.contentTxt.y + this.configData.text1YPadding;
    }
  }
}
