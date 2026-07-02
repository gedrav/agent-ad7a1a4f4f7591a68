import { StandardView } from '@core/pixiwrapper/StandardView';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { UIUtil } from '@core/utils/UIUtilService';

interface WildTransitionData {
  x: number;
  y: number;
  onEventEmit?: () => void;
}

export class WildTransitionComp extends StandardView {
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

    for (const data of items) {
      const spine = this.createTransitionSpine();
      const localPos = this.parent.toLocal({ x: data.x, y: data.y });
      spine.x = localPos.x;
      spine.y = localPos.y;
      this.addChild(spine);
      this.activeSpines.push(spine);

      spine.addEventListener('event', (event: any) => {
        if (event?.data?.name === 'symbol_change') data.onEventEmit?.();
      });
      spine.addEventListener('complete', () => this.onOneComplete(spine));

      spine.playAnimation({ state: 'wild_transition', loop: false, defaultMix: 0 });
    }
  }

  private createTransitionSpine(): PixSpine {
    return UIUtil.getSpineAnim('wildTransitionAnim', {
      spineName: 'wild_transition',
      defaultState: 'wild_transition',
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
