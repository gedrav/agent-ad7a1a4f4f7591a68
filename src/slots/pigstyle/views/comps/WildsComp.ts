import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { UIUtil } from '@core/utils/UIUtilService';
import { Container } from 'pixi.js';
import { PixSpine } from '@core/pixiwrapper/PixSpine';

const MOVE_DURATION = 0.7;
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
    const entry = this.rainingEntries[this.rainingIndex];
    if (!entry) {
      this.onAllLanded();
      return;
    }

    const [reelno, row, multiplier] = entry;
    const at: WildPlacement = { row, rowCount: this.slotReel.getRowCount(reelno), multiplier };

    const configName = this.slotReel.reelsData.wildSymbol;
    const config = this.slotReel.getSymbolConfig(configName, reelno) || this.slotReel.getWildConfig();

    const group = this.createWild(reelno, at, false, config);
    const targetScale = this.slotReel.getSymbolScale();
    const popScale = targetScale * 1.4;

    group.alpha = 1;
    group.scale.set(targetScale * 0.9);

    EventHandler.dispatchEvent(
      `PLAY_SYMBOL_${config.name}_LANDING_SOUND`,
      this.rainingIndex < 6 ? this.rainingIndex + 1 : 6,
    );

    const scaleProxy = { val: targetScale * 0.9 };
    AnimationProxy.animateTween(scaleProxy, {
      val: popScale,
      duration: 0.4,
      onUpdate: () => {
        if (group && !group.destroyed && group.scale) {
          group.scale.set(scaleProxy.val);
        }
      },
      onComplete: () => {
        if (group && !group.destroyed) {
          this.attachMultiplierBadge(group, at, config);

          AnimationProxy.animateTween(scaleProxy, {
            val: targetScale,
            duration: 0.4,
            onUpdate: () => {
              if (group && !group.destroyed && group.scale) {
                group.scale.set(scaleProxy.val);
              }
            },
            onComplete: () => {
              if (group && !group.destroyed) {
                this.onRainingWildLanded();
              }
            },
          });
        }
      },
    });
  }

  protected attachMultiplierBadge(container: Container, at: WildPlacement, config: any): PixSpine | null {
    if (!at.multiplier || at.multiplier < 2) return null;

    const badge: PixSpine = UIUtil.getElement(config.multiplierSpine);

    const animState = `x${at.multiplier}_idle`;

    badge.playAnimation({ state: animState, loop: false });

    badge.scale.set(config.multiplierScale);

    container.addChild(badge);

    EventHandler.dispatchEvent('PLAY_MULTIPLIER_ANIM_SOUND');

    return badge;
  }

  protected onRainingWildLanded(): void {
    if (this.rainingIndex < this.rainingEntries.length - 1) {
      this.rainingIndex++;
      this.showNextRainingWild();
      return;
    }
    setTimeout(this.onAllLanded, GAP_BEFORE_REELS_STOP);
  }

  protected createWild(
    reelno: number,
    at: WildPlacement,
    addBadge: boolean = true,
    providedConfig: any = null,
  ): Container {
    let config = providedConfig;
    if (!config) {
      config = { ...this.slotReel.getWildConfig() };
      const size = at.rowCount - 1;
      if (config.sized && config.skin?.includes('x')) {
        config.skin = config.skin.replace('x', size.toString());
      }
    }

    const group = new Container();
    const wild: PixSpine = UIUtil.getSpineAnim(config.spineName, config);

    if (config.skin) {
      const spineAny: any = wild;
      if (spineAny.spineAnim?.skeleton) {
        spineAny.spineAnim.skeleton.setSkinByName(config.skin);
        spineAny.spineAnim.skeleton.setSlotsToSetupPose();
      }
    }

    const animScaleObj = config.animFitScale;
    const animScale = animScaleObj ? (animScaleObj[at.rowCount] ?? animScaleObj.default ?? 1) : 1;
    wild.scale.set(animScale);

    const offsetXObj = config.animOffsetX;
    const offsetX = offsetXObj ? (offsetXObj[at.rowCount] ?? offsetXObj.default ?? 0) : 0;

    const offsetYObj = config.animOffsetY;
    const offsetY = offsetYObj ? (offsetYObj[at.rowCount] ?? offsetYObj.default ?? 0) : 0;

    wild.position.set(offsetX, offsetY);

    wild.playAnimation({ state: config.landingAnim, loop: false });

    if (config.hidePlate) {
      const spineContainer: any = wild;
      spineContainer.spineAnim?.skeleton?.findSlot(config.hidePlate)?.setAttachment(null);
    }
    group.addChild(wild);

    if (addBadge) {
      this.attachMultiplierBadge(group, at, config);
    }

    group.scale.set(this.slotReel.getSymbolScale());
    group.position.copyFrom(this.slotReel.cellCentre(reelno, at.row, at.rowCount));
    this.addChild(group);
    this.wilds.push(group);
    return group;
  }

  protected moveWild(reelno: number, wildGroup: Container, from: WildPlacement, to: WildPlacement): void {
    const start = this.slotReel.cellCentre(reelno, from.row, from.rowCount);
    const end = this.slotReel.cellCentre(reelno, to.row, to.rowCount);

    wildGroup.position.copyFrom(start);

    const config = this.slotReel.getWildConfig();
    const newSize = to.rowCount - 1;
    let newSkin = config.skin;

    if (config.sized && newSkin?.includes('x')) {
      newSkin = newSkin.replace('x', newSize.toString());
    }

    const wildSpine: any = wildGroup.children.find((child: any) => child.spineAnim?.skeleton);

    if (wildSpine) {
      if (newSkin) {
        wildSpine.spineAnim.skeleton.setSkinByName(newSkin);
        wildSpine.spineAnim.skeleton.setSlotsToSetupPose();
      }

      const animScaleObj = config.animFitScale;
      const animScale = animScaleObj ? (animScaleObj[to.rowCount] ?? animScaleObj.default ?? 1) : 1;

      const offsetXObj = config.animOffsetX;
      const offsetX = offsetXObj ? (offsetXObj[to.rowCount] ?? offsetXObj.default ?? 0) : 0;

      const offsetYObj = config.animOffsetY;
      const offsetY = offsetYObj ? (offsetYObj[to.rowCount] ?? offsetYObj.default ?? 0) : 0;

      wildSpine.scale.set(animScale);
      wildSpine.position.set(offsetX, offsetY);
    }

    AnimationProxy.animateTween(wildGroup, {
      x: end.x,
      y: end.y,
      duration: MOVE_DURATION,
      ease: 'sine.inOut',
    });
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
