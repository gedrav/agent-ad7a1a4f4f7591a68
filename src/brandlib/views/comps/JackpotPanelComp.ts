import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { JackPotItem } from './JackPotItem';
import { PixView } from '@core/pixiwrapper/PixView';
import { UIUtil } from '@core/utils/UIUtilService';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { Text } from 'pixi.js';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { IJackpotInfo } from '@core/models/jackpot.types';

const METER_TWEEN_SECONDS = 0.9;
const NOTICE_TEXT = { demo: 'DEMO JACKPOT', unavailable: 'JACKPOT UNAVAILABLE' };

interface RowLayout {
  widthPerc: number;
  heightPerc: number;
  maxScale: number;
  minScale: number;
  hPaddingPerc: number;
}

const DESKTOP_ROW: RowLayout = { widthPerc: 0.2, heightPerc: 0.2, maxScale: 0.34, minScale: 0.01, hPaddingPerc: 0.2 };
const LANDSCAPE_ROW: RowLayout = {
  widthPerc: 0.16,
  heightPerc: 0.16,
  maxScale: 0.2,
  minScale: 0.01,
  hPaddingPerc: 0.24,
};
const ROW_Y_PERC = 0.4;
const GRID_COLUMNS = 2;

export class JackpotPanelComp extends ResponsiveChildrenView {
  protected jackPotsArr: JackPotItem[] = [];
  protected jackpotConfig: any;
  // protected jackpotContainer: PixView;
  protected noticeText: Text;
  protected panelContainer: PixView;
  protected bronzeJP: JackPotItem;
  protected silverJP: JackPotItem;
  protected goldJP: JackPotItem;
  protected diamondJP: JackPotItem;
  constructor(config) {
    super(config);
    this.jackpotConfig = this.configData.jackpotConfig;
    this.guideRect = this.elementsList['guideRect'];
    this.panelContainer = this.elementsList['panelContainer'];
    this.panelContainer = this.elementsList['panelContainer'];
    this.bronzeJP = this.panelContainer.elementsList['bronzeJackpot'];
    this.silverJP = this.panelContainer.elementsList['silverJackpot'];
    this.goldJP = this.panelContainer.elementsList['goldJackpot'];
    this.diamondJP = this.panelContainer.elementsList['diamondJackpot'];
    this.jackPotsArr = [this.bronzeJP, this.silverJP, this.goldJP, this.diamondJP];
    this.createJackPotElement();
    EventHandler.addEventListener(SlotEvents.JACKPOT_INFO_READY, this.onJackpotInfoReady.bind(this));
    EventHandler.addEventListener(SlotEvents.JACKPOT_METERS_UPDATE, this.onMetersUpdate.bind(this));
    EventHandler.addEventListener(SlotEvents.HIDE_JACKPOT_BG, this.onRevealEnd.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_JACKPOT_INTRO_ANIM, this.showFrozenFromRound.bind(this));

    this.onJackpotInfoReady(appModel.jackpotInfo);
  }

  createJackPotElement() {
    const itemCount = this.jackpotConfig.noOfElement;

    this.jackPotsArr.forEach((item, i) => {
      item.initialView({
        skinName: this.jackpotConfig.jackpotAnimSkin[i],
        colorcode: this.jackpotConfig.jackpotTextColor[i],
      });
      item.visible = false;
    });
    this.resizeView();
  }
  protected onJackpotInfoReady(info: IJackpotInfo | null) {
    const hasInfo = !!info;
    this.jackPotsArr.forEach((item) => (item.visible = hasInfo));
    if (!info) {
      this.setNotice(null);
      return;
    }
    if (appModel.jackpotRound) {
      this.showFrozenFromRound();
    } else {
      this.showFrozen(appModel.jackpotMeters);
    }
    this.setNotice(info.demo ? 'demo' : !info.available ? 'unavailable' : null);
  }
  protected onMetersUpdate(data: { values: number[]; v: number }) {
    if (!data) return;
    this.jackPotsArr.forEach((item, i) => {
      if (data.values[i] !== undefined) item.tweenToValue(data.values[i], METER_TWEEN_SECONDS);
    });
  }
  protected showFrozenFromRound() {
    const frozen = appModel.jackpotRound?.frozenMeters;
    if (frozen?.length) this.showFrozen(frozen);
  }
  protected onRevealEnd() {
    // tweening from the frozen value to the live one; a buffered tick may follow right after
    this.onMetersUpdate({ values: appModel.jackpotMeters, v: appModel.jackpotMetersV });
  }
  public showFrozen(values: number[]) {
    this.jackPotsArr.forEach((item, i) => {
      if (values[i] !== undefined) item.setValue(values[i]);
    });
  }
  public setNotice(kind: 'demo' | 'unavailable' | null) {
    if (!kind) {
      if (this.noticeText) this.noticeText.visible = false;
      return;
    }
    if (!this.noticeText) {
      this.noticeText = new Text({ text: '', style: { fill: 0xffffff, fontSize: 24 } });
      this.noticeText.anchor.set(0.5, 0);
      this.addChild(this.noticeText);
    }
    this.noticeText.text = NOTICE_TEXT[kind];
    this.noticeText.visible = true;
    this.noticeText.x = UIUtil.getGameWidth() / 2;
  }
  protected resizeView() {
    super.resizeView();
    if (this.noticeText) this.noticeText.x = UIUtil.getGameWidth() / 2;
    if (DeviceProxy.isDevice()) {
      UIUtil.adjustElement(this.panelContainer.elementsList['guideRect']);
      if (DeviceProxy.config.isPortrait) {
        const len = this.jackPotsArr.length;
        for (let k = 0; k < len; k++) {
          this.jackPotsArr[k].x = this.jackpotConfig.pxPos[k];
          this.jackPotsArr[k].y = this.jackpotConfig.pyPos[k];
        }
      } else {
        const len = this.jackPotsArr.length;
        for (let k = 0; k < len; k++) {
          this.jackPotsArr[k].x = this.jackpotConfig.lxPos[k];
          this.jackPotsArr[k].y = this.jackpotConfig.lyPos[k];
        }
      }
    }
    super.resizeView();
  }
}
