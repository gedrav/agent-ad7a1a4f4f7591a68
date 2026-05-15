import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { PixToggleButton } from '@core/pixiwrapper/PixToggleButton';
import { Util } from '@core/utils/UtilService';
import { appModel } from '@core/models/services/AppModelService';
import { UIUtil } from '@core/utils/UIUtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { ChangeTotalBetCommand } from '@core/commands/action/ChangeTotalBetCommand';
import { CoreUIConfig } from '@brand/config/CoreUIConfig';
import { PixView } from '@core/pixiwrapper/PixView';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { PixText } from '@core/pixiwrapper/PixText';
import { PixNineSpliceSprite } from '@core/pixiwrapper/PixNineSpliceSprite';
import { PixSprite } from '@core/pixiwrapper/PixSprite';

const btnConfig: any = {
  name: 'btn1',
  type: 'PixToggleButton',
  scale: 1,
  action: {
    press: ChangeTotalBetCommand,
  },
  soundEvent: 'PLAY_GENERIC_BUTTON_SOUND',
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
      fontSize: 28,
      fontWeight: 400,
      nonSelectedStateColor: 0xffffff,
      selectedStateColor: 0xffffff,
    },
  },
};
export class BetPanelView extends ResponsiveChildrenView {
  private betBtnsArray: PixToggleButton[] = [];
  private upStakeBtn: any;
  private downStakeBtn: any;
  private stakeText: any;
  private btnContainer: PixView;
  private betPanelBg: PixNineSpliceSprite;
  private titleText: PixText;
  private cancelBtn: PixFancyButton;
  private setBtn: PixFancyButton;
  private tempBetPos: number = 0;
  private stakebg: PixSprite;
  private stakeContainer: PixView;
  private minmaxbetText: PixText;
  private minmaxbetBG: PixSprite;

  constructor(config: any) {
    super(config);
    EventHandler.addEventListener(SlotEvents.SHOW_BET_PANEL, this.showBetPanel.bind(this));
    EventHandler.addEventListener(SlotEvents.HIDE_BET_PANEL, this.hideBetPanel.bind(this));
    EventHandler.addEventListener(SlotEvents.CONFIRM_BET, this.onConfirmBet.bind(this));
    EventHandler.addEventListener(SlotEvents.UPDATE_TOTALBET, this.updateBetPanel.bind(this));
    EventHandler.addEventListener(SlotEvents.UPDATE_TOTALBET_TEMP, this.onTempBetUpdate.bind(this));
    EventHandler.addEventListener(SlotEvents.UPDATE_TOTALBET_INCR_DECR_TEMP, this.onTempBetIncrDecrUpdate.bind(this));
    EventHandler.addEventListener(SlotEvents.MODAL_VIEW_CLICKED, this.hideBetPanel.bind(this));

    this.betPanelBg = this.elementsList['betPanelBg'];
    this.titleText = this.elementsList['titleText'];
    this.btnContainer = this.elementsList['btnContainer'];
    this.stakeContainer = this.elementsList['stakeContainer'];
    this.upStakeBtn = this.stakeContainer.elementsList['upStakeBtn'];
    this.downStakeBtn = this.stakeContainer.elementsList['downStakeBtn'];
    this.stakeText = this.stakeContainer.elementsList['stakeText'];
    this.stakebg = this.stakeContainer.elementsList['stakebg'];
    this.cancelBtn = this.elementsList['cancelBtn'];
    this.setBtn = this.elementsList['setBtn'];
    this.minmaxbetBG = this.stakeContainer.elementsList['minmaxbetBG'];
    this.minmaxbetText = this.stakeContainer.elementsList['minmaxbetText'];
    this.minmaxbetText.text = Util.parseMessage(Util.getContent('minMaxBetText'), [
      Util.formatCurrency(appModel.getMinBet()),
      Util.formatCurrency(appModel.getMaxBet()),
    ]);

    const totalBetsArray = Util.cloneArray(appModel.getAllBets());

    this.betBtnsArray = [];
    const len = totalBetsArray.length;
    if (len > 0) {
      // Use however many bets come from BE, capped at 11 (max btn is the 12th)
      const noOfBtns: number = totalBetsArray.length;
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

    this.positionButtons();
    UIUtil.stopPropagation(this);
  }

  protected async hideBetPanel() {
    if (this.visible) {
      EventHandler.dispatchEvent(SlotEvents.HIDE_MODAL_VIEW);
    }
  }

  protected async showBetPanel() {
    EventHandler.dispatchEvent(SlotEvents.SHOW_MODAL_VIEW);
    this.tempBetPos = appModel.getBetPos();
    this.updateBetPanel();
    this.visible = true;
    this.resizeView();
  }

  protected onTempBetIncrDecrUpdate(data: number): void {
    this.tempBetPos = this.tempBetPos + data;
    this.updateBetPanel();
  }
  protected onTempBetUpdate(data: any): void {
    const allBets = appModel.getAllBets();
    const pos = allBets.indexOf(data);
    if (pos !== -1) this.tempBetPos = pos;
    this.updateBetPanel();
  }

  protected onConfirmBet(): void {
    appModel.setTotalBet(appModel.getAllBets()[this.tempBetPos]);
    EventHandler.dispatchEvent(SlotEvents.UPDATE_TOTALBET);
    EventHandler.dispatchEvent(SlotEvents.HIDE_BET_PANEL);
  }

  protected updateBetPanel(data: any = null): void {
    if (!this.viewCreated) return;
    const allBets = appModel.getAllBets();
    const displayBet = allBets[this.tempBetPos];
    this.stakeText.text = Util.formatCurrency(displayBet);
    const len = this.betBtnsArray.length;
    for (let i = 0; i < len; i++) {
      this.betBtnsArray[i].setSelected(this.betBtnsArray[i].configData.data === displayBet);
    }
    this.downStakeBtn.enabled = this.tempBetPos > 0;
    this.upStakeBtn.enabled = this.tempBetPos < allBets.length - 1;
  }

  protected positionButtons() {
    if (this.betBtnsArray.length === 0) return;
    let columns: number = 0;
    let gap = 160;
    if (DeviceProxy.config.isDesktop) {
      columns = 6;
      gap = 160;
      let rowIndex: number = 0;
      let colIndex: number = 0;
      const len2 = this.betBtnsArray.length;
      for (let i = 0; i < len2; i++) {
        this.betBtnsArray[i].x = rowIndex++ * gap;
        this.betBtnsArray[i].y = colIndex * 80;
        if (rowIndex == columns) {
          colIndex++;
          rowIndex = 0;
        }
      }
    } else {
      if (DeviceProxy.config.isPortrait) {
        gap = 160;
        columns = 4;
        let rowIndex: number = 0;
        let colIndex: number = 0;
        const len2 = this.betBtnsArray.length;
        for (let i = 0; i < len2; i++) {
          this.betBtnsArray[i].x = rowIndex++ * gap;
          this.betBtnsArray[i].y = colIndex * 80;
          if (rowIndex == columns) {
            colIndex++;
            rowIndex = 0;
          }
        }
      } else {
        columns = 6;
        gap = 160;
        let rowIndex: number = 0;
        let colIndex: number = 0;
        const len2 = this.betBtnsArray.length;
        for (let i = 0; i < len2; i++) {
          this.betBtnsArray[i].x = rowIndex++ * gap;
          this.betBtnsArray[i].y = colIndex * 80;
          if (rowIndex == columns) {
            colIndex++;
            rowIndex = 0;
          }
        }
      }
      this.betPanelBg.scale.set(1);
    }

    this.betPanelBg.width = this.btnContainer.width * 1.16;

    this.titleText.x = this.betPanelBg.width / 2;

    // derive rowHeight from actual button y positions
    const rowHeight = this.betBtnsArray.length > columns ? this.betBtnsArray[columns].y - this.betBtnsArray[0].y : 80;

    // landscape uses 2 rows (last row index = 1), portrait/desktop uses 3 rows (last row index = 2)
    const lastRowIndex = DeviceProxy.config.isDesktop || DeviceProxy.config.isPortrait ? 2 : 1;
    const lastRowY = lastRowIndex * rowHeight;
    const btnsInLastRow = this.betBtnsArray.filter((btn) => btn.y === lastRowY);

    // fixed grid width keeps container position stable regardless of button count
    const fixedGridWidth = columns * gap;
    this.btnContainer.x = (this.betPanelBg.width - fixedGridWidth) / 2 + this.betBtnsArray[0].width / 2;
    this.stakeContainer.x = (this.betPanelBg.width - this.stakeContainer.width) / 2;
    this.stakeContainer.y = this.btnContainer.y + this.btnContainer.height * 0.92;

    this.cancelBtn.x = this.betPanelBg.width * 0.48 - this.cancelBtn.width * 0.5;
    this.setBtn.x = this.betPanelBg.width * 0.52 + this.setBtn.width * 0.5;

    this.cancelBtn.y = this.stakeContainer.y + this.stakeContainer.height + this.minmaxbetBG.height * 1.5;
    this.setBtn.y = this.cancelBtn.y;
    this.betPanelBg.height = this.setBtn.y + this.setBtn.height * 1.5;
  }

  protected resizeView() {
    this.positionButtons();
    super.resizeView();
  }
}
