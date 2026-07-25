import { ResponsiveView } from '@core/pixiwrapper/ResponsiveView';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { UIUtil } from '@core/utils/UIUtilService';
import { GameProxy } from '@core/models/GameConfigProxy';

interface WildTransitionData {
  container: any;
  getLocalPosition: () => { x: number; y: number };
  onSymbolDisappear?: () => void;
  onSymbolAppear?: () => void;
}

interface ActiveSpine {
  spine: PixSpine;
  data: WildTransitionData;
  eventListener: any;
  completeListener: any;
}

export class LightningStrikeComp extends ResponsiveView {
  private activeSpines: ActiveSpine[] = [];
  private pendingItems: WildTransitionData[] = [];
  private cloud: PixSpine | null = null;
  private cloudEventListener: any = null;
  private cloudCompleteListener: any = null;
  private strikeOrigin: { x: number; y: number } | null = null;
  private completedCount = 0;
  private totalCount = 0;
  private onAllComplete: (() => void) | null = null;

  constructor(config: any) {
    super(config);
    this.visible = false;
    EventHandler.addEventListener(SlotEvents.SHOW_WILD_TRANSITION, this.showAllTransitions.bind(this));
  }

  private computeOrigin(): { x: number; y: number } {
    const screen = GameProxy.config.renderer.screen;
    return this.toLocal({ x: screen.width / 2, y: this.y });
  }

  protected resizeView(): void {
    super.resizeView();
    if (this.cloud) {
      this.strikeOrigin = this.computeOrigin();
      this.cloud.x = this.strikeOrigin.x;
      this.cloud.y = this.strikeOrigin.y;
    }
  }

  private showAllTransitions(payload: { items: WildTransitionData[]; onComplete?: () => void }): void {
    this.pendingItems = payload.items;
    this.completedCount = 0;
    this.totalCount = payload.items.length;
    this.onAllComplete = payload.onComplete ?? null;
    this.visible = true;
    this.strikeOrigin = this.computeOrigin();

    const cloud = this.createTransitionSpine();
    this.cloud = cloud;
    cloud.x = this.strikeOrigin.x;
    cloud.y = this.strikeOrigin.y;
    this.addChild(cloud);
    this.cloudEventListener = cloud.addEventListener('event', this.onCloudEvent.bind(this));
    this.cloudCompleteListener = cloud.addEventListener('complete', this.onCloudComplete.bind(this));

    cloud.playAnimation({
      state: 'cloud_start',
      trackIndex: 0,
      loop: false,
      defaultMix: 0,
      nextState: 'cloud_loop',
      nextLoop: false,
      delay: 0,
    });
    EventHandler.dispatchEvent(SlotEvents.PLAY_LIGHTNING_STRIKE_SOUND);
  }

  protected onCloudEvent(event: any): void {
    if (event?.data?.name === 'light_burst') {
      this.startThunderAnimation(this.pendingItems);
    }
  }

  protected onCloudComplete(entry: any): void {
    if (!this.cloud) return;
    if (entry?.animation?.name === 'cloud_loop') {
      this.cloud.playAnimation({ state: 'cloud_end', trackIndex: 0, loop: false, defaultMix: 0, reset: false });
    } else if (entry?.animation?.name === 'cloud_end') {
      this.cloud.removeSpineEvent(this.cloudEventListener);
      this.cloud.removeSpineEvent(this.cloudCompleteListener);
      this.cloudEventListener = null;
      this.cloudCompleteListener = null;
      this.removeChild(this.cloud);
      this.cloud.destroySpine();
      this.cloud = null;
    }
  }

  private startThunderAnimation(items: WildTransitionData[]): void {
    if (!this.strikeOrigin) return;

    for (const data of items) {
      const spine = this.createTransitionSpine();
      const localPos = data.getLocalPosition();
      data.container.addChild(spine);
      spine.x = localPos.x;
      spine.y = localPos.y;
      spine.rotation = this.getAimRotation(localPos, data.container.toLocal(this.toGlobal(this.strikeOrigin)));

      const eventListener = spine.addEventListener('event', this.onThunderEvent.bind(this));
      const completeListener = spine.addEventListener('complete', this.onThunderComplete.bind(this));
      this.activeSpines.push({ spine, data, eventListener, completeListener });

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

  protected onThunderEvent(event: any, spine: PixSpine): void {
    const data = this.activeSpines.find((active) => active.spine === spine)?.data;
    if (event?.data?.name === 'symbol_disappear') {
      data?.onSymbolDisappear?.();
    }
    if (event?.data?.name === 'symbol_appear') {
      data?.onSymbolAppear?.();
    }
  }

  protected onThunderComplete(entry: any, spine: PixSpine): void {
    if (entry?.animation?.name === 'thunder_sfx') {
      EventHandler.dispatchEvent(SlotEvents.PLAY_WILD_CONVERSION_SOUND);
    } else if (entry?.animation?.name === 'burst') {
      this.onOneComplete(spine);
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
    const active = this.activeSpines.find((active) => active.spine === spine);
    spine.removeSpineEvent(active?.eventListener);
    spine.removeSpineEvent(active?.completeListener);
    active?.data.container.removeChild(spine);
    spine.destroySpine();
    this.activeSpines = this.activeSpines.filter((active) => active.spine !== spine);
    this.completedCount++;
    if (this.completedCount === this.totalCount) {
      this.visible = false;
      this.strikeOrigin = null;
      const callback = this.onAllComplete;
      this.onAllComplete = null;
      callback?.();
    }
  }
}
