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
        targetBank.playAnimation({
          state: idlePlayAnim,
          loop: false,
          nextState: defaultAnim,
          nextLoop: true,
        });
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

    if (targetBank && typeof targetBank.playAnimation === 'function') {
      targetBank.playAnimation({
        state: blastAnim,
        loop: false,
        nextState: idleAnim,
        nextLoop: true,
      });

      if (callback) {
        let duration = 2000; // default fallback
        try {
          if (targetBank.spineAnim) {
            const anim = targetBank.spineAnim.state.data.skeletonData.findAnimation(blastAnim);
            if (anim) {
              duration = anim.duration * 500;
            }
          }
        } catch (e) {
          console.warn('Could not determine spine animation duration for', blastAnim);
        }
        setTimeout(callback, duration);
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
}
