import { StandardView } from '@core/pixiwrapper/StandardView';
import { UIUtil } from '@core/utils/UIUtilService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { GlowFilter } from 'pixi-filters';
import { GameProxy } from '@core/models/GameConfigProxy';
import { PixSprite } from '@core/pixiwrapper/PixSprite';

export class AnteBetComp extends StandardView {
  private multi: PixSprite;

  constructor(config: any) {
    super(config);
  }
}
