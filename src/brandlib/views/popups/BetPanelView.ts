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
  private stakeChangeContainer: PixView;

  constructor(config: any) {
    super(config);
    EventHandler.addEventListener(SlotEvents.SHOW_BET_PANEL, this.showBetPanel.bind(this));
    EventHandler.addEventListener(SlotEvents.HIDE_BET_PANEL, this.hideBetPanel.bind(this));
    EventHandler.addEventListener(SlotEvents.UPDATE_TOTALBET, this.updateBetPanel.bind(this));
    EventHandler.addEventListener(SlotEvents.MODAL_VIEW_CLICKED, this.hideBetPanel.bind(this));

    this.stakeChangeContainer = this.elementsList['stakeChangeContainer'];
    this.betPanelBg = this.elementsList['betPanelBg'];
    this.btnContainer = this.elementsList['btnContainer'];
    this.closeBtn = this.elementsList['closeBtn'];
    this.upStakeBtn = this.stakeChangeContainer.elementsList['upStakeBtn'];
    this.downStakeBtn = this.stakeChangeContainer.elementsList['downStakeBtn'];
    this.stakeText = this.stakeChangeContainer.elementsList['stakeText'];

    const totalBetsArray = Util.cloneArray(appModel.getAllBets());

    this.betBtnsArray = [];
    const len = totalBetsArray.length;
    if (len > 0) {
      for (let i = 0; i < len; i++) {
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
    const columns: number = 4;
    let rowIndex: number = 0;
    let colIndex: number = 0;
    for (let i = 0; i < len; i++) {
      this.betBtnsArray[i].x = rowIndex++ * 300;
      this.betBtnsArray[i].y = colIndex * 150;
      if (rowIndex == columns) {
        colIndex++;
        rowIndex = 0;
      }
    }

    this.btnContainer.x = (this.betPanelBg.width - this.btnContainer.width) / 2 + this.betBtnsArray[0].width / 2;
    this.stakeChangeContainer.x =
      (this.betPanelBg.width - this.stakeChangeContainer.width) / 2 + this.upStakeBtn.width / 2;
    this.stakeChangeContainer.y = this.btnContainer.y + this.btnContainer.height * 1.05;

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
  }
}
