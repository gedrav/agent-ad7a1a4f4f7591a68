import { StandardView } from '@core/pixiwrapper/StandardView';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { UIUtil } from '@core/utils/UIUtilService';
import { GameProxy } from '@core/models/GameConfigProxy';

interface WildTransitionData {
  x: number;
  y: number;
  onSymbolDisappear?: () => void;
  onSymbolAppear?: () => void;
}

export class LightningStrikeComp extends StandardView {
  private activeSpines: PixSpine[] = [];
  private completedCount = 0;
  private totalCount = 0;
  private onAllComplete: (() => void) | null = null;

  constructor(config: any) {
    super(config);
    this.visible = false;
    EventHandler.addEventListener(SlotEvents.SHOW_WILD_TRANSITION, this.showAllTransitions.bind(this));
  }

  private showAllTransitions(payload: { items: WildTransitionData[]; onComplete?: () => void }): void {
    const { items, onComplete } = payload;
    this.completedCount = 0;
    this.totalCount = items.length;
    this.onAllComplete = onComplete ?? null;
    this.visible = true;

    const screen = GameProxy.config.renderer.screen;
    const origin = this.parent.toLocal({ x: screen.width / 2, y: 0 });

    for (const data of items) {
      const spine = this.createTransitionSpine();
      const localPos = this.parent.toLocal({ x: data.x, y: data.y });
      spine.x = localPos.x;
      spine.y = localPos.y;
      spine.rotation = this.getAimRotation(localPos, origin);
      this.addChild(spine);
      this.activeSpines.push(spine);

      spine.addEventListener('event', (event: any) => {
        if (event?.data?.name === 'symbol_disappear') data.onSymbolDisappear?.();
        if (event?.data?.name === 'symbol_appear') data.onSymbolAppear?.();
      });
      spine.addEventListener('complete', (event: any) => {
        if (event?.animation?.name === 'burst') this.onOneComplete(spine);
      });

      spine.playAnimation({
        state: 'thunder_sfx',
        trackIndex: 0,
        loop: false,
        defaultMix: 0,
        nextState: 'burst',
        nextLoop: false,
        delay: 0,
      });
    }
  }

  private getAimRotation(localPos: { x: number; y: number }, origin: { x: number; y: number }): number {
    const dx = origin.x - localPos.x;
    const dy = origin.y - localPos.y;
    return Math.atan2(dx, -dy);
  }

  private createTransitionSpine(): PixSpine {
    return UIUtil.getSpineAnim('lightningStrike', {
      spineName: 'lightning_fx',
      loop: false,
    });
  }

  private onOneComplete(spine: PixSpine): void {
    this.removeChild(spine);
    spine.destroySpine();
    this.activeSpines = this.activeSpines.filter((s) => s !== spine);
    this.completedCount++;
    if (this.completedCount === this.totalCount) {
      this.visible = false;
      const callback = this.onAllComplete;
      this.onAllComplete = null;
      callback?.();
    }
  }
}
