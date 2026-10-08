import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { UIUtil } from '@core/utils/UIUtilService';
import { Container } from 'pixi.js';
import { PixSpine } from '@core/pixiwrapper/PixSpine';

const TICKS_PER_SECOND = 60;
const MOVE_DURATION = 0.7;
const MOVE_CLIP_DURATION = 0.8;
const GAP_BETWEEN_WILDS = 500;
const GAP_BEFORE_REELS_STOP = 600;

interface WildPlacement {
  row: number;
  rowCount: number;
  multiplier: number;
}

export class WildsComp extends ResponsiveChildrenView {
  private wilds: Container[] = [];
  private previousPlacements: WildPlacement[] = [];
  private rainingEntries: number[][] = [];
  private rainingIndex = 0;
  private slotReel: any;
  private onAllLanded: () => void;

  protected onViewCreated(): void {
    super.onViewCreated();
    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_UI_END, this.resetWilds.bind(this));
  }

  public showStickyWilds(entries: number[][], isStickyRound: boolean, slotReel: any): void {
    if (!isStickyRound) {
      this.resetWilds();
      return;
    }
    this.slotReel = slotReel;

    const previous = this.previousPlacements;
    this.previousPlacements = [];
    this.clearWilds();

    for (const [reelno, row, multiplier] of entries) {
      const to: WildPlacement = { row, rowCount: slotReel.getRowCount(reelno), multiplier };
      const wild = this.createWild(reelno, to);
      const from = previous[reelno];
      if (from?.multiplier === multiplier && (from.row !== row || from.rowCount !== to.rowCount)) {
        this.moveWild(reelno, wild, from, to);
      }
      this.previousPlacements[reelno] = to;
    }
  }

  public showRainingWilds(entries: number[][], slotReel: any, onAllLanded: () => void): void {
    this.resetWilds();
    this.rainingEntries = entries;
    this.rainingIndex = 0;
    this.slotReel = slotReel;
    this.onAllLanded = onAllLanded;
    this.showNextRainingWild();
  }

  protected showNextRainingWild(): void {
    const [reelno, row, multiplier] = this.rainingEntries[this.rainingIndex];
    this.createWild(reelno, { row, rowCount: this.slotReel.getRowCount(reelno), multiplier });
    EventHandler.dispatchEvent(`PLAY_SYMBOL_${this.slotReel.getWildConfig().name}_LANDING_SOUND`, this.wilds.length);
    setTimeout(this.onRainingWildLanded.bind(this), GAP_BETWEEN_WILDS);
  }

  protected onRainingWildLanded(): void {
    if (this.rainingIndex < this.rainingEntries.length - 1) {
      this.rainingIndex++;
      this.showNextRainingWild();
      return;
    }
    setTimeout(this.onAllLanded, GAP_BEFORE_REELS_STOP);
  }

  protected createWild(reelno: number, at: WildPlacement): Container {
    // Clone the config to safely modify the skin without mutating the base data
    const config = { ...this.slotReel.getWildConfig() };
    const size = at.rowCount - 1;

    if (config.sized && config.skin?.includes('x')) {
      config.skin = config.skin.replace('x', size.toString());
    }

    const group = new Container();

    const wild: PixSpine = UIUtil.getSpineAnim(config.spineName, config);
    wild.scale.set(config.animScale);

    // Fix: Play the base landing animation without appending the size
    wild.playAnimation({ state: config.landingAnim, loop: false });

    if (config.hidePlate) {
      wild.spineAnim.skeleton.findSlot(config.hidePlate)?.setAttachment(null);
    }
    group.addChild(wild);

    if (at.multiplier >= 2) {
      const badge: PixSpine = UIUtil.getElement(config.multiplierSpine);
      badge.playAnimation({ state: `X${at.multiplier}_idle`, loop: false });
      badge.scale.set(wild.scale.x * config.multiplierScale);
      group.addChild(badge);
    }

    group.scale.set(this.slotReel.getSymbolScale());
    group.position.copyFrom(this.slotReel.cellCentre(reelno, at.row, at.rowCount));
    this.addChild(group);
    this.wilds.push(group);
    return group;
  }

  protected moveWild(reelno: number, wild: Container, from: WildPlacement, to: WildPlacement): void {
    const start = this.slotReel.cellCentre(reelno, from.row, from.rowCount);
    const end = this.slotReel.cellCentre(reelno, to.row, to.rowCount);
    wild.position.copyFrom(start);

    const clip = this.createMoveClip(from.rowCount, to.rowCount);
    if (clip) {
      wild.visible = false;
      clip.position.copyFrom(start);
      this.addChild(clip);
      clip.playAnimation({ loop: false });
      AnimationProxy.animateTween(clip, {
        ...end,
        duration: MOVE_DURATION,
        onComplete: () => {
          clip.destroy();
          wild.visible = true;
        },
      });
    }
    AnimationProxy.animateTween(wild, { ...end, duration: MOVE_DURATION });
  }

  protected createMoveClip(fromRowCount: number, toRowCount: number): any {
    const frames = this.slotReel.getSlideFrames();
    const clip = UIUtil.getElement({
      ...frames,
      animation: { ...frames.animation, prefix: `${fromRowCount} to ${toRowCount}_` },
    });
    if (!clip.totalFrames) {
      return null;
    }
    clip.scale.set(this.slotReel.getSymbolScale());
    clip.setAnimationSpeed(clip.totalFrames / (MOVE_CLIP_DURATION * TICKS_PER_SECOND));
    return clip;
  }

  public clearWilds(): void {
    this.wilds.forEach((wild) => wild.destroy());
    this.wilds = [];
  }

  public resetWilds(): void {
    this.clearWilds();
    this.previousPlacements = [];
  }
}
