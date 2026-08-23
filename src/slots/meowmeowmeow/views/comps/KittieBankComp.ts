import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { Util } from '@core/utils/UtilService';
import { SlotEvents } from '@core/events/SlotEvents';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { FEATURE_NAMES, FeatureName } from '@slots/meowmeowmeow/config/FeatureNames';

export class KittieBankComp extends ResponsiveChildrenView {
  public static readonly FEATURE_BANK_MAP: Record<FeatureName, 'meow' | 'mew' | 'mii'> = {
    [FEATURE_NAMES.RED]: 'meow',
    [FEATURE_NAMES.GREEN]: 'mew',
    [FEATURE_NAMES.BLUE]: 'mii',
  };

  private static readonly FEATURE_REVEAL_POSITION = {
    x: 266,
    y: 1600,
  };

  private static readonly PORTRAIT_FEATURE_REVEAL_POSITION = {
    x: 618,
    y: 314,
  };

  private idleAnimTimeoutId: any;
  private activeRevealBank: 'meow' | 'mew' | 'mii' | null = null;

  constructor(config: any) {
    super(config);
    EventHandler.addEventListener('PLAY_KITTIE_BLAST', this.playKittyBankBlast.bind(this));
    EventHandler.addEventListener('PLAY_KITTIE_ANTICIPATION', this.playKittyBankAnticipation.bind(this));
    EventHandler.addEventListener('PLAY_KITTIE_WIN_ANIM', this.playWinAnimation.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_SYMBOL_IDLE_ANIMATION, this.restartIdleAnim.bind(this));
    EventHandler.addEventListener(SlotEvents.START_SPIN, this.stopIdleAnim.bind(this));
    EventHandler.addEventListener('RESET_KITTIEBANK_ANIM', this.resetToNormal.bind(this));
    EventHandler.addEventListener('SET_KITTIBANK_FEATURE_STATE', this.showSelectedFeatureBank.bind(this));
    EventHandler.addEventListener('HIDE_KITTIBANK', this.hide.bind(this));
  }

  public hide(): void {
    this.visible = false;
  }

  public resetToNormal(): void {
    this.activeRevealBank = null;
    const bankNames = ['meow', 'mew', 'mii'];
    for (const bank of bankNames) {
      const targetBankComp = this.elementsList[bank];
      if (targetBankComp) {
        targetBankComp.visible = true;
        this.setDevicePosition(targetBankComp, targetBankComp.configData || {});
        const targetBank = targetBankComp.elementsList?.['spineAnim'] || targetBankComp;
        const animPrefix = bank === 'meow' ? '3_RED' : bank === 'mew' ? '1_GREEN' : '2_BLUE';
        const defaultAnim = targetBankComp.configData?.defaultState || `${animPrefix}_Static`;
        if (targetBank && typeof targetBank.playAnimation === 'function') {
          targetBank.playAnimation({
            state: defaultAnim,
            loop: true,
          });
        }
      }
    }

    const coinsComp = this.elementsList['fspopupcoins'];
    if (coinsComp) {
      coinsComp.visible = false;
    }
  }

  public showSelectedFeatureBank(featureName: string): void {
    const targetBank = KittieBankComp.FEATURE_BANK_MAP[featureName?.toUpperCase() as FeatureName];
    const showGreen = targetBank === 'mew';

    const bankNames = ['meow', 'mew', 'mii'];
    for (const bank of bankNames) {
      const bankComp = this.elementsList[bank];
      if (bankComp) {
        bankComp.visible = showGreen && bank === 'mew';
      }
    }

    this.activeRevealBank = showGreen ? 'mew' : null;

    if (showGreen) {
      const targetBankComp = this.elementsList['mew'];
      if (targetBankComp) {
        this.applyRevealPosition(targetBankComp);

        const spineAnim = targetBankComp.elementsList?.['spineAnim'] || targetBankComp;
        const staticAnim = targetBankComp.configData?.defaultState || '1_GREEN_Static';
        if (spineAnim && staticAnim && typeof spineAnim.playAnimation === 'function') {
          spineAnim.playAnimation({
            state: staticAnim,
            loop: true,
          });
        }
      }
    }

    const coinsComp = this.elementsList['fspopupcoins'];
    if (coinsComp) {
      coinsComp.visible = showGreen && !DeviceProxy.isDevice();
    }
  }

  // resizeView() re-applies each bank's default configData position on every APP_RESIZE
  // (e.g. exiting free spins/pick feature triggers resetMachineLayout -> APP_RESIZE), which would
  // clobber the reveal position set here. repositionView() is called right after that, so re-assert it.
  protected repositionView(): void {
    if (!this.activeRevealBank) return;
    const targetBankComp = this.elementsList[this.activeRevealBank];
    if (targetBankComp) {
      this.applyRevealPosition(targetBankComp);
    }
  }

  private applyRevealPosition(targetBankComp: any): void {
    const isMobile = DeviceProxy.isDevice();
    if (isMobile) {
      if (DeviceProxy.config.isPortrait) {
        targetBankComp.x = KittieBankComp.PORTRAIT_FEATURE_REVEAL_POSITION.x;
        targetBankComp.y = KittieBankComp.PORTRAIT_FEATURE_REVEAL_POSITION.y;
      } else {
        this.setDevicePosition(targetBankComp, targetBankComp.configData || {});
      }
    } else {
      this.setDevicePosition(targetBankComp, KittieBankComp.FEATURE_REVEAL_POSITION);
    }
  }

  private setDevicePosition(
    target: any,
    position: { x?: number; y?: number; px?: number; py?: number; lx?: number; ly?: number },
  ): void {
    if (DeviceProxy.isDevice()) {
      if (DeviceProxy.config.isPortrait) {
        if (position.px != undefined) target.x = position.px;
        if (position.py != undefined) target.y = position.py;
      } else {
        if (position.lx != undefined) target.x = position.lx;
        if (position.ly != undefined) target.y = position.ly;
      }
    } else {
      if (position.x != undefined) target.x = position.x;
      if (position.y != undefined) target.y = position.y;
    }
  }

  private restartIdleAnim(): void {
    this.showIdleAnim(true);
  }

  private stopIdleAnim(): void {
    this.showIdleAnim(false);
  }

  protected showIdleAnim(flag: boolean): void {
    if (flag) {
      clearTimeout(this.idleAnimTimeoutId);
      this.idleAnimTimeoutId = setTimeout(this.playIdleAnim.bind(this), 3000);
    } else {
      clearTimeout(this.idleAnimTimeoutId);
    }
  }

  protected playIdleAnim(): void {
    const bankNames = ['meow', 'mew', 'mii'];
    const randomBank = bankNames[Util.getRandomRange(0, 2)];

    const targetBankComp = this.elementsList[randomBank];
    if (targetBankComp) {
      const targetBank = targetBankComp.elementsList?.['spineAnim'] || targetBankComp;
      const animPrefix = randomBank === 'meow' ? '3_RED' : randomBank === 'mew' ? '1_GREEN' : '2_BLUE';
      const idlePlayAnim = targetBankComp.configData?.idle || `${animPrefix}_Ideal`;
      const defaultAnim = targetBankComp.configData?.defaultState || `${animPrefix}_Static`;

      if (targetBank && typeof targetBank.playAnimation === 'function') {
        if (idlePlayAnim.includes('Blast')) {
          targetBank.playAnimation({
            state: idlePlayAnim,
            loop: false,
          });
        } else {
          targetBank.playAnimation({
            state: idlePlayAnim,
            loop: false,
            nextState: defaultAnim,
            nextLoop: true,
          });
        }
      }
    }

    this.showIdleAnim(true);
  }

  public destroy(options?: any): void {
    clearTimeout(this.idleAnimTimeoutId);
    super.destroy(options);
  }

  public playKittyBankBlast(data: any): void {
    const bankName = typeof data === 'string' ? data : data.bankName;
    const callback = typeof data === 'object' ? data.callback : null;

    const targetBankComp = this.elementsList[bankName];
    if (!targetBankComp) {
      if (callback) callback();
      return;
    }

    const targetBank = targetBankComp.elementsList?.['spineAnim'] || targetBankComp;
    const animPrefix = bankName === 'meow' ? '3_RED' : bankName === 'mew' ? '1_GREEN' : '2_BLUE';
    const blastAnim = `${animPrefix}_Blast`;
    const idleAnim = targetBankComp.configData?.defaultState || `${animPrefix}_Static`;

    const soundEvent =
      bankName === 'meow'
        ? 'PLAY_RED_CAT_TRIGGER'
        : bankName === 'mew'
          ? 'PLAY_GREEN_CAT_TRIGGER'
          : 'PLAY_BLUE_CAT_TRIGGER';
    EventHandler.dispatchEvent(soundEvent);

    this.stopIdleAnim(); // Stop random idle animations from interrupting

    if (targetBank && typeof targetBank.playAnimation === 'function') {
      targetBank.playAnimation({
        state: blastAnim,
        loop: false,
      });

      if (callback) {
        setTimeout(callback, 1600);
      }
    } else if (callback) callback();
  }

  public playKittyBankAnticipation(bankName: 'meow' | 'mew' | 'mii'): void {
    const targetBankComp = this.elementsList[bankName];
    if (!targetBankComp) return;

    const targetBank = targetBankComp.elementsList?.['spineAnim'] || targetBankComp;
    const animPrefix = bankName === 'meow' ? '3_RED' : bankName === 'mew' ? '1_GREEN' : '2_BLUE';
    const anticipationAnim = `${animPrefix}_Anticipation`;
    const idleAnim = targetBankComp.configData?.defaultState || `${animPrefix}_Static`;

    if (targetBank && typeof targetBank.playAnimation === 'function') {
      targetBank.playAnimation({
        state: anticipationAnim,
        loop: false,
        nextState: idleAnim,
        nextLoop: true,
      });
    }
  }

  public playWinAnimation(featureName: FeatureName): void {
    const bankName = KittieBankComp.FEATURE_BANK_MAP[featureName?.toUpperCase() as FeatureName];
    if (!bankName) return;
    const targetBankComp = this.elementsList[bankName];
    if (!targetBankComp) return;

    const targetBank = targetBankComp.elementsList?.['spineAnim'] || targetBankComp;
    const animPrefix = bankName === 'meow' ? '3_RED' : bankName === 'mew' ? '1_GREEN' : '2_BLUE';
    const collectAnim = `${animPrefix}_Collect`;

    if (targetBank && typeof targetBank.playAnimation === 'function') {
      targetBank.playAnimation({
        state: collectAnim,
        loop: true,
      });
    }
  }
}
