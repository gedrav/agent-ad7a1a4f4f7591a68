import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { JackpotTier, PICK_ICON_EVENT, PickBonusJackpotIconComp } from './pickBonusJackpotIcon';
import { PICK_BONUS_JACKPOT_ICON_CONFIG } from '@slots/meowmeowmeow/config/screens/pickBonusjackpotIconCofig';
import { MessageProxy } from '@brand/models/MessageServiceProxy';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { Util } from '@core/utils/UtilService';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { FEATURE_NAMES } from '@slots/meowmeowmeow/config/FeatureNames';

export class PickBonusJackpotComp extends ResponsiveChildrenView {
  private static readonly COLS = 4;
  private static readonly ROWS = 3;
  private static readonly H_SPACING = -250;
  private static readonly V_SPACING = -50;

  private readonly icons: PickBonusJackpotIconComp[] = [];
  private readonly pickedIcons: PickBonusJackpotIconComp[] = [];
  private readonly tapText: any;
  private isWinAchieved: boolean = false;

  constructor(config) {
    super(config);
    this.visible = false;
    this.eventMode = 'none';

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

  public enter(): void {
    this.restoreUnfinishedScreen();
    this.visible = true;
    this.eventMode = 'passive';
  }

  private restoreUnfinishedScreen(): void {
    const pickedTiers: string[] = appModel.featureResult?.featureData?.pickedTiers ?? [];
    if (pickedTiers.length <= 1 || this.pickedIcons.length === pickedTiers.length) return;

    const availableIcons = [...this.icons];

    pickedTiers.forEach((tier) => {
      const icon = availableIcons.splice(Math.floor(Math.random() * availableIcons.length), 1)[0];
      icon.setjackpotData(this.toTierName(tier));
      icon.revealInstantly();
      this.pickedIcons.push(icon);
    });
  }

  private async onIconSelected(icon: PickBonusJackpotIconComp): Promise<void> {
    this.eventMode = 'none';
    icon.startFlipAnimation();

    const featureType = appModel.getIsUnfinishedGame()
      ? appModel.getUnfinishedFeatureType()
      : appModel.getFeatureType();
    await MessageProxy.requestBonusData(featureType);

    const { picks, winningTier } = appModel.featureResult.featureData;
    const pickedTier = picks[0].jackpotTier;

    icon.setjackpotData(this.toTierName(pickedTier));
    this.pickedIcons.push(icon);

    const jackpotComp = (this.parent as any)?.elementsList?.['jackpotContainer'];
    jackpotComp?.playIdleAnim(this.toTierGroup(pickedTier));

    this.isWinAchieved = !!winningTier;
    icon.revealJackpot();

    if (!this.isWinAchieved) this.eventMode = 'passive';
  }

  private checkForMaxCapWin(): boolean {
    if (!appModel.getIsMaxCapReached()) {
      return false;
    }

    const obj: any = {};
    obj.title = Util.getContent('infoText');
    obj.message = Util.parseMessage(Util.getContent('maxCapReachedBaseGame'), [
      Util.formatCurrency(appModel.featureResult.totalWin),
    ]);
    obj.callback = this.exit.bind(this);
    EventHandler.dispatchEvent(SlotEvents.SHOW_MESSAGE_POPUP, obj);
    return true;
  }

  private onIconRevealComplete(icon: PickBonusJackpotIconComp): void {
    if (!this.isWinAchieved) return;
    if (icon !== this.pickedIcons[this.pickedIcons.length - 1]) return;

    this.animateWinningSymbols(appModel.featureResult.featureData.winningTier);
    EventHandler.dispatchEvent('SHOW_FEATURE_WIN_ANIM', {
      callback: () => {
        if (!this.checkForMaxCapWin()) {
          this.exit();
        }
      },
    });
  }

  private animateWinningSymbols(winningTier: string): void {
    const winningTierName = this.toTierName(winningTier);
    const jackpotComp = (this.parent as any)?.elementsList?.['jackpotContainer'];
    jackpotComp?.playWinAnim(this.toTierGroup(winningTier));

    this.icons.forEach((icon) => {
      if (icon.getjackpotData() === winningTierName) {
        icon.playWinAnim();
      } else {
        icon.disable();
      }
    });
    EventHandler.dispatchEvent('PLAY_KITTIE_WIN_ANIM', FEATURE_NAMES.RED);
  }

  private toTierGroup(jackpotTier: string): string {
    return jackpotTier.replace(/\d+$/, '');
  }

  private toTierName(jackpotTier: string): JackpotTier {
    return this.toTierGroup(jackpotTier).toLowerCase() as JackpotTier;
  }

  private exit(): void {
    this.resetFeature();
    StateManager.next();
  }

  private resetFeature(): void {
    this.pickedIcons.length = 0;
    this.isWinAchieved = false;
    this.visible = false;
    this.eventMode = 'none';
    this.icons.forEach((icon) => icon.reset());
  }
}
