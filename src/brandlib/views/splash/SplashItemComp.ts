import { StandardView } from '@core/pixiwrapper/StandardView';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { PixText } from '@core/pixiwrapper/PixText';
import { Util } from '@core/utils/UtilService';

export class SplashItemComp extends StandardView {
  private splashImage: PixSprite;
  private contentTxt: PixText;

  constructor(config: any) {
    super(config);

    this.splashImage = UIUtil.getSprite(this.configData.image);
    this.contentTxt = UIUtil.getText(this.configData.textStyle);
    UIUtil.updateWordWrapWidth(this.contentTxt, this.splashImage.width * 0.9);
    this.contentTxt.text = Util.getContent(this.configData.content);
    this.contentTxt.anchor.set(0.5, 0);

    this.addChild(this.splashImage, this.contentTxt);
    this.contentTxt.x = this.splashImage.width / 2;
    this.contentTxt.y = this.configData.textY;
  }
}
