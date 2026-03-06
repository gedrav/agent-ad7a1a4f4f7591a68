import { ResponsesiveChildrenView } from '@core/pixiwrapper/ResponsesiveChildrenView';
import { PixToggleButton } from '@core/pixiwrapper/PixToggleButton';
import { Util } from '@core/utils/UtilService';
import { appModel } from '@core/models/services/AppModelService';
import { UIUtil } from '@core/utils/UIUtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { AssetLoader } from '@core/models/services/AssetLoader';
import { ChangeTotalBetCommand } from '@core/commands/action/ChangeTotalBetCommand';
import { CoreUIConfig } from '@brand/config/CoreUIConfig';
import { PixView } from '@core/pixiwrapper/PixView';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { GameProxy } from '@core/models/GameConfigProxy';

const btnConfig: any = {
  name: 'btn1',
  type: 'PixToggleButton',
  scale: 1,
  action: {
    press: ChangeTotalBetCommand,
  },
  options: {
    defaultView: 'betSelectionBtn',
    hoverView: 'betSelectionBtn',
    pressedView: 'betSelectionBtn',
    disabledView: 'betSelectionBtn',
    animations: CoreUIConfig.buttonStates,
  },
  selectedOptions: {
    defaultView: 'betSelectionSelectedBtn',
    hoverView: 'betSelectionSelectedBtn',
    pressedView: 'betSelectionSelectedBtn',
    disabledView: 'betSelectionSelectedBtn',
  },
  textConfig: {
    name: 'btn1Text',
    type: 'Text',
    contentText: '',
    style: {
      fontFamily: 'commonFont',
      fontSize: 50,
      nonSelectedStateColor: 0x000000,
      selectedStateColor: 0xffffff,
    },
  },
};
export class BetPanelView extends ResponsesiveChildrenView {
  private closeBtn: any;
  private betBtnsArray: PixToggleButton[] = [];
  private upStakeBtn: any;
  private downStakeBtn: any;
  private stakeText: any;
  private btnContainer: PixView;
  private betPanelBg: PixGraphics;
  private maxBetBtn: PixToggleButton;

  constructor(config: any) {
    super(config);
    EventHandler.addEventListener(SlotEvents.SHOW_BET_PANEL, this.showBetPanel.bind(this));
    EventHandler.addEventListener(SlotEvents.HIDE_BET_PANEL, this.hideBetPanel.bind(this));
    EventHandler.addEventListener(SlotEvents.UPDATE_TOTALBET, this.updateBetPanel.bind(this));
    EventHandler.addEventListener(SlotEvents.UPDATE_TOTALBET_TEMP, this.updateBetPanel.bind(this));
    EventHandler.addEventListener(SlotEvents.MODAL_VIEW_CLICKED, this.hideBetPanel.bind(this));

    this.betPanelBg = this.elementsList['betPanelBg'];
    this.btnContainer = this.elementsList['btnContainer'];
    this.closeBtn = this.elementsList['closeBtn'];
    this.upStakeBtn = this.btnContainer.elementsList['upStakeBtn'];
    this.downStakeBtn = this.btnContainer.elementsList['downStakeBtn'];
    this.stakeText = this.btnContainer.elementsList['stakeText'];

    const totalBetsArray = Util.cloneArray(appModel.getAllBets());

    this.betBtnsArray = [];
    const len = totalBetsArray.length;
    const lowbets = 8;
    const highbets = 8;
    if (len > 0) {
      const noOfBtns: number = 16;
      for (let i = 0; i < noOfBtns; i++) {
        const btn = UIUtil.getElement(btnConfig);
        if (btn) {
          if (btn.textView) {
            btn.updateText(Util.formatCurrencyNoSymbol(totalBetsArray[i]));
            btn.setData(totalBetsArray[i]);
            btn.textView.anchor.set(0.5, 0.5);
          }
          this.betBtnsArray.push(btn);
          this.btnContainer.addChild(btn);
          btn.setSelected(false);
        }
      }
    }
    this.maxBetBtn = UIUtil.getElement(btnConfig);
    if (this.maxBetBtn.textView) {
      this.maxBetBtn.updateText(Util.getContent('maxBet'));
      this.maxBetBtn.textView.anchor.set(0.5, 0.5);
      this.maxBetBtn.setData(totalBetsArray[totalBetsArray.length - 1]);
    }
    this.btnContainer.addChild(this.maxBetBtn);
    this.maxBetBtn.setSelected(false);

    this.positionButtons();

    this.visible = false;

    UIUtil.stopPropagation(this);
  }

  protected async hideBetPanel() {
    if (this.visible) {
      EventHandler.dispatchEvent(SlotEvents.HIDE_MODAL_VIEW);
      this.parent.removeChild(this);
    }
  }
  protected async showBetPanel() {
    EventHandler.dispatchEvent(SlotEvents.SHOW_MODAL_VIEW);
    GameProxy.config.PreviousBet = appModel.getTotalBet();
    this.updateBetPanel();
    this.resizeView();
    this.visible = true;
  }
  protected updateBetPanel(data: any = null): void {
    if (!this.viewCreated) {
      return;
    }
    this.stakeText.text = Util.formatCurrency(appModel.getTotalBet());
    const len = this.betBtnsArray.length;
    for (let i = 0; i < len; i++) {
      this.betBtnsArray[i].setSelected(false);
      if (this.betBtnsArray[i].configData.data == appModel.getTotalBet()) {
        this.betBtnsArray[i].setSelected(true);
      }
    }
    this.downStakeBtn.enabled = appModel.getBetPos() != 0;
    this.upStakeBtn.enabled = appModel.getBetPos() != appModel.getAllBets().length - 1;
    if (appModel.getTotalBet() == appModel.getMaxBet()) {
      this.maxBetBtn.setSelected(true);
    } else {
      this.maxBetBtn.setSelected(false);
    }
  }

  protected positionButtons() {
    let columns: number = 0;
    if (DeviceProxy.config.isDesktop) {
      columns = 4;
      let rowIndex: number = 0;
      let colIndex: number = 0;
      const len2 = this.betBtnsArray.length;
      for (let i = 0; i < len2; i++) {
        this.betBtnsArray[i].x = rowIndex++ * 300;
        this.betBtnsArray[i].y = colIndex * 150;
        if (rowIndex == columns) {
          colIndex++;
          rowIndex = 0;
        }
      }
    } else {
      if (DeviceProxy.config.isPortrait) {
        columns = 4;
        let rowIndex: number = 0;
        let colIndex: number = 0;
        const len2 = this.betBtnsArray.length;
        for (let i = 0; i < len2; i++) {
          this.betBtnsArray[i].x = rowIndex++ * 300;
          this.betBtnsArray[i].y = colIndex * 150;
          if (rowIndex == columns) {
            colIndex++;
            rowIndex = 0;
          }
        }
      } else {
        columns = 8;
        let rowIndex: number = 0;
        let colIndex: number = 0;
        const len2 = this.betBtnsArray.length;
        for (let i = 0; i < len2; i++) {
          this.betBtnsArray[i].x = rowIndex++ * 300;
          this.betBtnsArray[i].y = colIndex * 150;
          if (rowIndex == columns) {
            colIndex++;
            rowIndex = 0;
          }
        }
      }
    }
    this.maxBetBtn.x = this.betBtnsArray[1].x + this.maxBetBtn.width / 2;
    this.maxBetBtn.y = this.betBtnsArray[this.betBtnsArray.length - 1].y + this.betBtnsArray[0].height * 1.25;

    this.downStakeBtn.x = this.betBtnsArray[1].x - (this.betBtnsArray[1].width - this.downStakeBtn.width);
    this.downStakeBtn.y = this.maxBetBtn.y + this.maxBetBtn.height + this.downStakeBtn.height;

    this.upStakeBtn.x =
      this.betBtnsArray[columns - 2].x + (this.betBtnsArray[columns - 1].width - this.upStakeBtn.width);
    this.upStakeBtn.y = this.downStakeBtn.y;

    this.stakeText.x = this.btnContainer.width / 2 - this.betBtnsArray[0].width / 2;
    this.stakeText.y = this.upStakeBtn.y;
    this.btnContainer.x = (this.betPanelBg.width - this.btnContainer.width) / 2 + this.betBtnsArray[0].width / 2;
  }
}
