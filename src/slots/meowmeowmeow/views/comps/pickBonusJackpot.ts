import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { PICK_ICON_EVENT, PickBonusJackpotIconComp } from './pickBonusJackpotIcon';
import { PICK_BONUS_JACKPOT_ICON_CONFIG } from '@slots/meowmeowmeow/config/screens/pickBonusjackpotIconCofig';
import { MessageProxy } from '@brand/models/MessageServiceProxy';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { Util } from '@core/utils/UtilService';

export class PickBonusJackpotComp extends ResponsiveChildrenView {
  private static readonly COLS = 4;
  private static readonly ROWS = 3;
  private static readonly H_SPACING = -250;
  private static readonly V_SPACING = -50;

  private readonly icons: PickBonusJackpotIconComp[] = [];
  private readonly pickedIcons: PickBonusJackpotIconComp[] = [];
  private readonly tapText: any;
  private response: any[] = [];
  private responseIterator: number = 0;
  private responseLength: number = 0;

  constructor(config) {
    super(config);
    this.visible = false;

    this.tapText = this.elementsList['tapText'];
    this.tapText.text = Util.getContent('PickACatText');

    this.createIcons();
    this.setupIcons();
  }

  private createIcons(): void {
    const total = PickBonusJackpotComp.COLS * PickBonusJackpotComp.ROWS;
    for (let i = 0; i < total; i++) {
      const icon = new PickBonusJackpotIconComp(PICK_BONUS_JACKPOT_ICON_CONFIG);
      this.addChild(icon);
      this.icons.push(icon);
    }
  }

  private setupIcons(): void {
    const { COLS, H_SPACING, V_SPACING } = PickBonusJackpotComp;

    this.icons.forEach((icon, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);

      icon.x = col * (icon.width + H_SPACING);
      icon.y = row * (icon.height + V_SPACING);

      icon.on(PICK_ICON_EVENT.SELECTED, this.onIconSelected, this);
      icon.on(PICK_ICON_EVENT.REVEAL_COMPLETE, this.onIconRevealComplete, this);
    });
  }

  public async enter(): Promise<void> {
    await this.fetchBonusData();
    this.visible = true;
  }

  private async fetchBonusData(): Promise<void> {
    await MessageProxy.requestBonusData(appModel.getFeatureType());
    this.response = appModel.featureResult.featureData.picks;
    this.responseLength = this.response.length;
  }

  private onIconSelected(icon: PickBonusJackpotIconComp): void {
    const pick = this.response[this.responseIterator];
    icon.setjackpotData(pick.jackpotTier.replace(/\d+$/, '').toLowerCase());
    this.responseIterator++;
    const jackpotComp = (this.parent as any)?.elementsList?.['jackpotContainer'];
    jackpotComp?.playIdleAnim(pick.jackpotTier.replace(/\d+$/, ''));
    this.pickedIcons.push(icon);
  }

  private onIconRevealComplete(): void {
    if (this.pickedIcons.length === this.responseLength) {
      this.animateWinningSymbols();
      this.scheduleExit();
    }
  }

  private animateWinningSymbols() {
    this.icons.forEach((icon) => {
      if (icon.getjackpotData() === appModel.featureResult.featureData.winningTier.replace(/\d+$/, '').toLowerCase()) {
        const jackpotComp = (this.parent as any)?.elementsList?.['jackpotContainer'];
        jackpotComp?.playWinAnim(appModel.featureResult.featureData.winningTier.replace(/\d+$/, ''));
        icon.playWinAnim();
      } else {
        icon.disable();
      }
    });
  }

  private scheduleExit(): void {
    setTimeout(() => this.exit(), 3000);
  }

  private exit(): void {
    this.resetFeature();
    StateManager.next();
  }

  private resetFeature(): void {
    this.response = [];
    this.responseIterator = 0;
    this.pickedIcons.length = 0;
    this.visible = false;
    this.icons.forEach((icon) => icon.reset());
  }
}
