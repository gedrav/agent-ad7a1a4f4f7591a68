import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { JackpotTier, PICK_ICON_EVENT, PickBonusJackpotIconComp } from './pickBonusJackpotIcon';
import { PICK_BONUS_JACKPOT_ICON_CONFIG } from '@slots/meowmeowmeow/config/screens/pickBonusjackpotIconCofig';
import { MessageProxy } from '@brand/models/MessageServiceProxy';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';

export class PickBonusJackpotComp extends ResponsiveChildrenView {
  private static readonly COLS = 4;
  private static readonly ROWS = 3;
  private static readonly H_SPACING = 0;
  private static readonly V_SPACING = 0;

  private readonly icons: PickBonusJackpotIconComp[] = [];
  private response: any[] = [];
  private responseIterator: number = 0;
  private responseLength: number = 0;

  constructor(config) {
    super(config);
    this.visible = false;

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

    if (this.responseIterator === this.responseLength) {
      this.scheduleExit();
    }
  }

  private scheduleExit(): void {
    setTimeout(() => this.exit(), 2500);
  }

  private exit(): void {
    this.resetFeature();
    StateManager.next();
  }

  private resetFeature(): void {
    this.response = [];
    this.responseIterator = 0;
    this.icons.forEach((icon) => icon.reset());
  }
}
