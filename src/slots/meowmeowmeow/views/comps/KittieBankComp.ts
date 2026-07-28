import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { Util } from '@core/utils/UtilService';
import { SlotEvents } from '@core/events/SlotEvents';

export class KittieBankComp extends ResponsiveChildrenView {
  private idleAnimTimeoutId: any;

  constructor(config: any) {
    super(config);
    EventHandler.addEventListener('PLAY_KITTIE_BLAST', this.playKittyBankBlast.bind(this));
    EventHandler.addEventListener('PLAY_KITTIE_ANTICIPATION', this.playKittyBankAnticipation.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_SYMBOL_IDLE_ANIMATION, this.restartIdleAnim.bind(this));
    EventHandler.addEventListener(SlotEvents.START_SPIN, this.stopIdleAnim.bind(this));
    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_UI_START, this.resetToNormal.bind(this));
    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_UI_END, this.resetToNormal.bind(this));
  }

  public resetToNormal(): void {
    const bankNames = ['meow', 'mew', 'mii'];
    for (const bank of bankNames) {
      const targetBankComp = this.elementsList[bank];
      if (targetBankComp) {
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
      if (targetBank.spineAnim) {
        console.log(
          'Available animations for KittieBank:',
          targetBank.spineAnim.state.data.skeletonData.animations.map((a: any) => a.name),
        );
      }
      targetBank.playAnimation({
        state: anticipationAnim,
        loop: false,
        nextState: idleAnim,
        nextLoop: true,
      });
    }
  }
}
