import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { StandardView } from '@core/pixiwrapper/StandardView';
import { CONSTANTS } from '@core/utils/CONSTANTS';
import { Util } from '@core/utils/UtilService';
import { MultiComp } from '@game/views/comps/MultiComp';

const inactiveAlphaValue = 0.65;

export class MultiplierComp extends StandardView {
  private mg_1: MultiComp;
  private mg_2: MultiComp;
  private mg_3: MultiComp;
  private mg_4: MultiComp;
  private fs_1: MultiComp;
  private fs_2: MultiComp;
  private fs_3: MultiComp;
  private fs_4: MultiComp;
  private mgMultipliers: MultiComp[];
  private fsMultipliers: MultiComp[];
  private multiplierAnimating: boolean;
  private idleResetVersion: number = 0;

  constructor(config: any) {
    super(config);
    this.multiplierAnimating = false;
    this.mg_1 = this.elementsList['mg_x1'];
    this.mg_2 = this.elementsList['mg_x2'];
    this.mg_3 = this.elementsList['mg_x3'];
    this.mg_4 = this.elementsList['mg_x5'];
    this.fs_1 = this.elementsList['fs_x2'];
    this.fs_2 = this.elementsList['fs_x4'];
    this.fs_3 = this.elementsList['fs_x6'];
    this.fs_4 = this.elementsList['fs_x10'];
    this.mgMultipliers = [this.mg_1, this.mg_2, this.mg_3, this.mg_4];
    this.fsMultipliers = [this.fs_1, this.fs_2, this.fs_3, this.fs_4];
    this.setFSMultipliersVisible(false);
    this.setMGDefault();
    EventHandler.addEventListener(SlotEvents.RESET_MULTIPLIER, this.setMGDefault.bind(this));
    EventHandler.addEventListener(SlotEvents.IDLE_STATE_ENTRY, this.resetMultiplierINIdleState.bind(this));
    EventHandler.addEventListener(SlotEvents.MULTIPLIER_SET_TO_LEVEL, this.setMultiplierLvl.bind(this));
    EventHandler.addEventListener(SlotEvents.SET_MG_MULTIPLIERS_VISIBLITY, this.setMGMultipliersVisible.bind(this));
    EventHandler.addEventListener(SlotEvents.SET_FS_MULTIPLIERS_VISIBLITY, this.setFSMultipliersVisible.bind(this));
  }

  public setMGDefault(): void {
    const len = this.mgMultipliers.length;
    for (let i = 0; i < len; i++) {
      const isFeatureTriggered = appModel.getIsFeatureTriggered();
      const multi = isFeatureTriggered ? this.fsMultipliers[i] : this.mgMultipliers[i];
      multi.showInactiveState();
    }
    //maingame multipliers
    this.mg_1.alpha = 1;
    this.mg_2.alpha = inactiveAlphaValue;
    this.mg_3.alpha = inactiveAlphaValue;
    this.mg_4.alpha = inactiveAlphaValue;
    //fs multipliers
    this.fs_1.alpha = 1;
    this.fs_2.alpha = inactiveAlphaValue;
    this.fs_3.alpha = inactiveAlphaValue;
    this.fs_4.alpha = inactiveAlphaValue;
  }

  public setMGMultipliersVisible(isVisible: boolean): void {
    this.mgMultipliers.forEach((mgMulti) => {
      mgMulti.visible = isVisible;
    });
  }

  public setFSMultipliersVisible(isVisible: boolean): void {
    this.fsMultipliers.forEach((fsMulti) => {
      fsMulti.visible = isVisible;
    });
  }

  public setMultiplierLvl(lvl: number): void {
    const len = this.mgMultipliers.length;
    if (len === 0) return;
    if (!Number.isFinite(lvl)) return;

    const clampedLvl = Math.max(1, Math.min(Math.floor(lvl), len));
    const activeIndex = clampedLvl - 1;
    for (let i = 0; i < len; i++) {
      const isFeatureTriggered = appModel.getIsFeatureTriggered();
      const multi = isFeatureTriggered ? this.fsMultipliers[i] : this.mgMultipliers[i];
      if (i === activeIndex) multi.showHighlight();
      else multi.showInactiveState();
    }

    this.idleResetVersion++; // to cancel any pending idle reset
    this.multiplierAnimating = true;
  }

  private async resetMultiplierINIdleState() {
    //reset multiplier after 2 sec of going in idle state
    if (this.multiplierAnimating) {
      const resetVersion = ++this.idleResetVersion;
      await Util.addDelays(2000);
      if (resetVersion === this.idleResetVersion) {
        this.setMGDefault();
        this.multiplierAnimating = false;
      }
    }
  }
}
