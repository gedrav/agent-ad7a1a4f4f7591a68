import { StandardView } from '../../pixiwrapper/StandardView';
import { UIUtil } from '../../utils/UIUtilService';
import { PixSprite } from '../../pixiwrapper/PixSprite';
import { PixText } from '../../pixiwrapper/PixText';
import { Util } from '../../utils/UtilService';

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
