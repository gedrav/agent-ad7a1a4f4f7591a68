import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { UIUtil } from '@core/utils/UIUtilService';
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { PixText } from '@core/pixiwrapper/PixText';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { CanvasTextMetrics } from 'pixi.js';

export class JPHitCelebrationComp extends ResponsiveChildrenView {
  private readonly msgText: PixText;
  private readonly baseFontSize: number;
  private readonly tagBaseFontSizes: { [tag: string]: number } = {};
  private jpData: any;
  constructor(config: any) {
    super(config);
    this.msgText = this.elementsList['msgText'];
    this.guideRect = this.elementsList['guideRect'];
    this.baseFontSize = Number(this.msgText.style.fontSize);
    const tagStyles = this.msgText.style.tagStyles || {};
    for (const tag in tagStyles) {
      this.tagBaseFontSizes[tag] = Number(tagStyles[tag].fontSize);
    }
    EventHandler.addEventListener(SlotEvents.JACKPOT_WON, this.onOtherPlayerJPWon.bind(this));
    this.visible = false;
  }

  protected onOtherPlayerJPWon(data: any): void {
    if (appModel.jackpotMetersFrozen) {
      return;
    }
    if (appModel.opConfig.dontShowOtherPlayerJPHit) {
      return;
    }
    this.jpData = data;
    const str = Util.getContent('JPHitNotificationText');
    const playerId = data.playerId.length > 6 ? `${data.playerId.slice(0, 6)}...` : data.playerId;
    const message = Util.parseMessage(str, [
      playerId,
      Util.formatJPCurrency(data.amount, data.currency),
      data.tier,
      data.gameName ? data.gameName : 'Carpathian Treasures',
    ]);
    this.msgText.scale.set(1);
    UIUtil.adjustElement(this.guideRect);
    if (DeviceProxy.config.isDevice && DeviceProxy.config.isPortrait) {
      this.msgText.style.wordWrap = true;
      this.msgText.style.wordWrapWidth = this.guideRect.width;
      this.fitMessageToLines(message, 2);
    } else {
      this.msgText.style.wordWrap = false;
      this.setFontScale(1);
    }

    this.msgText.text = message;
    UIUtil.adjustElement(this.msgText);
    UIUtil.adjustElement(this);
    this.visible = true;
    AnimationProxy.fadeIn(this, 0.25, this.onFadedIn.bind(this));
  }

  private setFontScale(scale: number): void {
    this.msgText.style.fontSize = Math.round(this.baseFontSize * scale);
    const tagStyles = this.msgText.style.tagStyles;
    for (const tag in this.tagBaseFontSizes) {
      tagStyles[tag].fontSize = Math.round(this.tagBaseFontSizes[tag] * scale);
    }
    this.msgText.style.update();
  }

  private fitMessageToLines(message: string, maxLines: number): void {
    const minScale = 0.4;
    for (let scale = 1; scale >= minScale; scale -= 0.05) {
      this.setFontScale(scale);
      const metrics = CanvasTextMetrics.measureText(message, this.msgText.style);
      if (metrics.lines.length <= maxLines) {
        return;
      }
    }
  }
  protected onFadedIn(): void {
    AnimationProxy.animateTween(this, { duration: 0.5, alpha: 0, delay: 4, onComplete: this.onFadedOut.bind(this) });
  }
  protected onFadedOut(): void {
    this.visible = false;
    this.alpha = 0;
  }
  protected resizeView(): void {
    if (!this.visible) return;
    this.onOtherPlayerJPWon(this.jpData);
  }
}
