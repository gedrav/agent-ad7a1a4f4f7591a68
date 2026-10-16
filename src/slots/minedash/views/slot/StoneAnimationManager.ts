import { Point } from 'pixi.js';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { getBezierPoint, lerp } from '@core/utils/MathUtils';
import MDReelSymbol from '@game/views/slot/MDReelSymbol';
import ReelSymbolSpine from '@core/views/slotmachine/ReelSymbolSpine';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { GameProxy } from '@core/models/GameConfigProxy';
import { GameSlotMachineView } from './GameSlotMachineView';
import { BOX_STATE_KEYS, StoneStateData } from '@game/views/comps/GemBoxesComp';

export interface StoneMapping {
  boxName: string;
  spineName: string;
  skin?: string;
}

export interface StoneData {
  col: number;
  row: number;
  symbol: string;
  boxName: string;
  spineName: string;
  skin?: string;
}

export const SYMBOL_TO_GOLDCARD_SKIN: Record<string, string> = {
  H1: 'HELMATE',
  H2: 'LANTERN',
  H3: 'PICKAXE',
  H5: 'LANTERN',
  L1: 'A',
  L2: 'K',
  L3: 'Q',
  L4: 'J',
  L5: '10',
};

export const STONE_CONFIG: Record<string, StoneMapping> = {
  SM: { boxName: 'box1', spineName: 'gems', skin: 'SM' },
  SF: { boxName: 'box2', spineName: 'gems', skin: 'SF' },
  SY: { boxName: 'box3', spineName: 'gems', skin: 'SY' },
  SW: { boxName: 'box4', spineName: 'gems', skin: 'SW' },
  SG: { boxName: 'box5', spineName: 'GoldCard' },
};

const STONE_HOLD_MS = 300;
const STONE_DROP_ROTATION = 0.35;
const STONE_POP_SCALE_MULTIPLIER = 1.4;

const LAUNCH_DELAY_MS = 600;
const STONE_ROTATION = 0.35;
const FINAL_STONE_ROTATION = 0.6;
const STONE_BASE_SCALE = 0.5;

const MEGAWIN_SLIDE_DURATION = 0.6;
const MEGAWIN_SLIDE_ARC_HEIGHT = 33;
const MEGAWIN_SLIDE_POP_SCALE = 1.15;

export class StoneAnimationManager {
  private readonly view: GameSlotMachineView;
  private stoneAnimationTimeout: any = null;
  private activeTweens: any[] = [];
  private hiddenReelSymbols: Array<{
    symbol: any;
    scaleX: number;
    scaleY: number;
    alpha: number;
  }> = [];

  constructor(view: GameSlotMachineView) {
    this.view = view;
  }

  // FEATURE: Stone collection (reel symbol -> box, round-end collection)
  // ===========================================================================================

  public playStonesSequence(stones: StoneData[], onComplete: () => void): void {
    if (stones.length > 0) {
      this.flyStoneToBox(stones[0], onComplete);
    } else {
      onComplete();
    }
  }

  private flyStoneToBox(stone: StoneData, onComplete: () => void): void {
    const { col, row, symbol, boxName, spineName, skin } = stone;
    const reel: any = this.view.slotReel;
    if (!reel || typeof reel.getSymbolPosition !== 'function') {
      onComplete();
      return;
    }

    const targetBox = (this.view as any).boxesComp?.elementsList?.[boxName];
    if (!targetBox) {
      onComplete();
      return;
    }

    const { startPos, targetSymbol } = this.getSymbolPositionAndInstance(reel, col, row, symbol);

    if (targetSymbol) {
      this.hideOriginalSymbol(targetSymbol);
    }

    const endPos = this.calculateTargetBoxPosition(targetBox);
    const movingSymbol = this.createMovingSymbol(symbol, spineName, skin || '', startPos);

    this.view.addChild(movingSymbol);
    EventHandler.dispatchEvent('SHOW_TRANSITION_ANIM');

    this.playStoneAnimation(movingSymbol, startPos, endPos, targetBox, boxName, symbol === 'SG', onComplete);
  }

  private getSymbolPositionAndInstance(
    reel: any,
    col: number,
    row: number,
    symbolName: string,
  ): { startPos: Point; targetSymbol: any } {
    const symbolRow = row + 1;
    let targetSymbol = reel.symbolsArray?.[col]?.[symbolRow];

    if (
      !targetSymbol ||
      typeof targetSymbol.getSymbolName !== 'function' ||
      targetSymbol.getSymbolName() !== symbolName
    ) {
      const column = reel.symbolsArray?.[col];
      if (Array.isArray(column)) {
        targetSymbol = column.find(
          (sym: any) => sym && typeof sym.getSymbolName === 'function' && sym.getSymbolName() === symbolName,
        );
      }
    }

    const symbolPos =
      targetSymbol && typeof targetSymbol.getGlobalPosition === 'function'
        ? targetSymbol.getGlobalPosition()
        : reel.getSymbolPosition(col, symbolRow);

    return { startPos: this.view.toLocal(symbolPos), targetSymbol };
  }

  private calculateTargetBoxPosition(targetBox: any): Point {
    const localPoint =
      typeof targetBox.playAnimation === 'function'
        ? new Point(0, -20)
        : new Point(targetBox.width * 0.5, targetBox.height * 0.25);
    const targetGlobalPos = targetBox.toGlobal(localPoint);
    return this.view.toLocal(targetGlobalPos);
  }

  private createMovingSymbol(symbolName: string, spineName: string, symbolSkin: string, startPos: Point): MDReelSymbol {
    let cardSkin = symbolSkin;
    if (spineName === 'GoldCard' || symbolName === 'SG') {
      const firedStone = appModel.getReelModifiers()?.find((m: any) => m.type === 'stoneFired');
      const megawinModifier = appModel.getReelModifiers()?.find((m: any) => m.type === 'megawinCollect');
      const targetSym =
        firedStone?.value || megawinModifier?.symbol || this.view.getStoneState()?.megawinStone?.drawnValue || 'H1';
      cardSkin = SYMBOL_TO_GOLDCARD_SKIN[targetSym] || 'HELMATE';
    }

    const symbolConfig = GameProxy.config.reelSymbolsConfig?.[symbolName];
    const animScale = symbolConfig?.animScale;

    const movingSymbol = new MDReelSymbol({
      data: {
        name: symbolName,
        spineName: spineName,
        skin: cardSkin,
        idleAnim: symbolConfig?.idleAnim || (spineName === 'GoldCard' ? 'static' : 'Static'),
        winAnim: symbolConfig?.winAnim || (spineName === 'GoldCard' ? 'win' : 'Win'),
        animScale: animScale !== undefined ? animScale : 1,
      } as any,
    });
    movingSymbol.showWinning(null, false);
    movingSymbol.position.copyFrom(startPos);
    movingSymbol.scale.set(this.getNormalSymbolScale());

    return movingSymbol;
  }

  private hideOriginalSymbol(targetSymbol: any): void {
    const normalScale = this.getNormalSymbolScale();

    if (typeof targetSymbol.clearCallBackAnimation === 'function') {
      targetSymbol.clearCallBackAnimation();
    }

    this.hiddenReelSymbols.push({
      symbol: targetSymbol,
      scaleX: normalScale,
      scaleY: normalScale,
      alpha: targetSymbol.alpha ?? 1,
    });

    if (typeof targetSymbol.spine?.stopAnimation === 'function') {
      targetSymbol.spine.stopAnimation();
    }

    const removeTween = AnimationProxy.animateTween(targetSymbol, {
      duration: 0.2,
      alpha: 0,
      ease: 'power1.in',
      onUpdate: () => targetSymbol.scale.set(lerp(normalScale, 0, removeTween.progress())),
      onComplete: () => {
        this.removeActiveTween(removeTween);
        this.setSymbolVisibility(targetSymbol, false);
      },
    });
    this.activeTweens.push(removeTween);

    this.holdRemovedSymbol(targetSymbol);
  }

  private holdRemovedSymbol(targetSymbol: any): void {
    if (typeof targetSymbol.resetSymbol !== 'function' || typeof targetSymbol.setNewSymbol !== 'function') {
      return;
    }

    const originalResetSymbol = targetSymbol.resetSymbol.bind(targetSymbol);
    const originalSetNewSymbol = targetSymbol.setNewSymbol.bind(targetSymbol);

    targetSymbol.resetSymbol = () => {};

    targetSymbol.setNewSymbol = (data: any, reelno: number) => {
      targetSymbol.resetSymbol = originalResetSymbol;
      targetSymbol.setNewSymbol = originalSetNewSymbol;

      const normalScale = this.getNormalSymbolScale();
      targetSymbol.alpha = 1;
      targetSymbol.scale.set(normalScale, normalScale);
      this.setSymbolVisibility(targetSymbol, true);

      // Now that it's visible again it must leave the hidden list, otherwise the scale/alpha
      // normalisation pass keeps skipping it.
      const index = this.hiddenReelSymbols.findIndex((hidden) => hidden.symbol === targetSymbol);
      if (index > -1) this.hiddenReelSymbols.splice(index, 1);

      originalSetNewSymbol(data, reelno);
    };
  }

  private playStoneAnimation(
    movingSymbol: MDReelSymbol,
    startPos: Point,
    endPos: Point,
    targetBox: any,
    boxName: string,
    isGoldCard: boolean,
    onComplete: () => void,
  ): void {
    const peakY = startPos.y - 30;
    const normalScale = this.getNormalSymbolScale();
    const peakScale = normalScale * STONE_POP_SCALE_MULTIPLIER;
    const targetDropScale = 0.2;

    // Gem stones (SM/SF/SY/SW) pop up oversized then shrink on the drop. Gold card stones
    // shrink straight down to their drop size on the pop instead of growing first.
    const scalePopTarget = isGoldCard ? targetDropScale : peakScale;
    const scalePopTween = AnimationProxy.animateTween(movingSymbol.scale, {
      duration: 0.25,
      x: scalePopTarget,
      y: scalePopTarget,
      ease: isGoldCard ? 'power2.out' : 'back.out(2)',
      onComplete: () => this.removeActiveTween(scalePopTween),
    });
    this.activeTweens.push(scalePopTween);

    const popTween = AnimationProxy.animateTween(movingSymbol, {
      duration: 0.25,
      y: peakY,
      ease: 'back.out(2)',
      onComplete: () => {
        this.removeActiveTween(popTween);

        this.stoneAnimationTimeout = setTimeout(() => {
          this.playDropAnimation(
            movingSymbol,
            endPos,
            isGoldCard ? targetDropScale : peakScale,
            targetDropScale,
            targetBox,
            boxName,
            onComplete,
          );
        }, STONE_HOLD_MS);
      },
    });

    this.activeTweens.push(popTween);
  }

  private playDropAnimation(
    movingSymbol: MDReelSymbol,
    endPos: Point,
    peakScale: number,
    targetDropScale: number,
    targetBox: any,
    boxName: string,
    onComplete: () => void,
  ): void {
    const dropStartPos = new Point(movingSymbol.x, movingSymbol.y);
    const midX = lerp(dropStartPos.x, endPos.x, 0.4);
    const midY = lerp(dropStartPos.y, endPos.y, 0.3);
    const c1 = new Point(dropStartPos.x, midY);
    const c2 = new Point(midX, endPos.y - 30);

    const dropProgress = { t: 0 };

    const dropTween = AnimationProxy.animateTween(dropProgress, {
      duration: 0.4,
      t: 1,
      ease: 'power2.in',
      onUpdate: () => {
        const t = dropProgress.t;
        const bezierPoint = getBezierPoint(t, dropStartPos, c1, c2, endPos);
        movingSymbol.position.copyFrom(bezierPoint);
        movingSymbol.scale.set(lerp(peakScale, targetDropScale, t));
        movingSymbol.rotation = STONE_DROP_ROTATION * t;
      },
      onComplete: () => {
        this.removeActiveTween(dropTween);
        if (movingSymbol.parent) movingSymbol.parent.removeChild(movingSymbol);
        movingSymbol.destroy();

        EventHandler.dispatchEvent('PLAY_GENERIC_BUTTON_SOUND');
        this.pulseBox(targetBox, boxName, onComplete);
      },
    });

    this.activeTweens.push(dropTween);
  }

  private pulseBox(targetBox: any, boxName: string, onComplete?: () => void): void {
    if (!targetBox) {
      if (onComplete) onComplete();
      return;
    }

    const isFeatureTrigger = boxName === (this.view as any).getFiredStoneBoxName();

    if (!isFeatureTrigger) {
      (this.view as any).applyBoxState(boxName);
      if (onComplete) onComplete();
      return;
    }

    (this.view as any).applyBoxState(boxName, true, 5, false);
    if ((this.view as any).boxesComp && typeof (this.view as any).boxesComp.playWin === 'function') {
      (this.view as any).boxesComp.playWin(boxName, () => {
        (this.view as any).applyBoxState(boxName, true);
        if (onComplete) onComplete();
      });
    } else {
      (this.view as any).applyBoxState(boxName, true);
      if (onComplete) onComplete();
    }
  }

  // FEATURE: Megawin feature
  // ===========================================================================================

  public playMegawinTargetDrops(
    drops: Array<{ from: [number, number]; to: [number, number] }>,
    symbolValue: string,
    removeStoneFromCrate: () => void,
    onAllDone: () => void,
  ): void {
    const slotReel = this.view.slotReel as any;

    const flyGoldCardStoneTo = (targetLocalPos: Point, onArrive: () => void): void => {
      const targetBox = (this.view as any).boxesComp?.elementsList?.['box5'];

      let startPos = new Point(0, 0);
      if (targetBox) {
        const boxLocal =
          typeof targetBox.playAnimation === 'function'
            ? new Point(0, -20)
            : new Point(targetBox.width * 0.5, targetBox.height * 0.25);
        startPos = this.view.toLocal(targetBox.toGlobal(boxLocal));
      }

      const movingName = `SG_${symbolValue}`;
      const symbolConfig = slotReel.reelsData?.symbolsData?.[movingName];
      const spineName = symbolConfig?.spineName || 'gems';
      const skin = symbolConfig?.skin || '';
      const idleAnim = symbolConfig?.idleAnim || 'Static';

      const stone = this.createFlightStone(startPos, movingName, spineName, skin, idleAnim);
      stone.scale.set(STONE_BASE_SCALE);

      const fromX = startPos.x;
      const fromY = startPos.y;
      const dist = Math.hypot(targetLocalPos.x - fromX, targetLocalPos.y - fromY);
      const arcHeight = Math.min(Math.max(dist * 0.4, 60), 260);
      const controlX = (fromX + targetLocalPos.x) / 2;
      const controlY = (fromY + targetLocalPos.y) / 2 - arcHeight;
      const arcProgress = { t: 0 };

      AnimationProxy.animateTween(arcProgress, {
        duration: 0.4,
        t: 1,
        ease: 'power2.in',
        onUpdate: () => {
          const t = arcProgress.t;
          const u = 1 - t;
          stone.x = u * u * fromX + 2 * u * t * controlX + t * t * targetLocalPos.x;
          stone.y = u * u * fromY + 2 * u * t * controlY + t * t * targetLocalPos.y;
        },
        onComplete: () => {
          if (stone.parent) stone.parent.removeChild(stone);
          stone.destroy();
          onArrive();
        },
      });
    };

    const slideSymbolToPosition = (
      movingSymbol: any,
      displacedSymbol: any,
      fromCol: number,
      fromRow: number,
      toCol: number,
      toRow: number,
      onDone: () => void,
    ): void => {
      const startX = movingSymbol.x;
      const startY = movingSymbol.y;
      const endX = displacedSymbol.x;
      const endY = displacedSymbol.y;
      const baseScaleX = movingSymbol.scale?.x ?? 1;
      const baseScaleY = movingSymbol.scale?.y ?? 1;

      if (movingSymbol.parent) movingSymbol.parent.addChild(movingSymbol);

      const controlX = (startX + endX) / 2;
      const controlY = (startY + endY) / 2 - MEGAWIN_SLIDE_ARC_HEIGHT;
      const progress = { t: 0 };
      let preImpactFadeStarted = false;

      AnimationProxy.animateTween(progress, {
        duration: MEGAWIN_SLIDE_DURATION,
        t: 1,
        ease: 'power2.inOut',
        onUpdate: () => {
          const t = progress.t;
          const u = 1 - t;
          // A gentle bounded arc plus a mid-flight scale pop reads as "flying" rather than "sliding".
          movingSymbol.x = u * u * startX + 2 * u * t * controlX + t * t * endX;
          movingSymbol.y = u * u * startY + 2 * u * t * controlY + t * t * endY;
          const pop = 1 + (MEGAWIN_SLIDE_POP_SCALE - 1) * 4 * t * (1 - t);
          movingSymbol.scale.set(baseScaleX * pop, baseScaleY * pop);

          if (!preImpactFadeStarted && t >= 0.7) {
            preImpactFadeStarted = true;
            AnimationProxy.animateTween(displacedSymbol, { duration: 0.15, alpha: 0, ease: 'power1.in' });
            AnimationProxy.animateTween(
              displacedSymbol.scale,
              { duration: 0.15, x: 0, y: 0, ease: 'power1.in' },
              false,
            );
          }
        },
        onComplete: () => {
          this.spawnHitParticle(this.view.toLocal(movingSymbol.getGlobalPosition()), 1.2);
          movingSymbol.scale.set(baseScaleX, baseScaleY);

          if (slotReel?.symbolsArray) {
            slotReel.symbolsArray[toCol][toRow + 1] = movingSymbol;
            slotReel.symbolsArray[fromCol][fromRow + 1] = displacedSymbol;
          }

          AnimationProxy.killTweensOf(displacedSymbol);
          AnimationProxy.killTweensOf(displacedSymbol.scale);
          displacedSymbol.position.set(startX, startY);
          this.holdDisplacedSymbol(displacedSymbol);

          AnimationProxy.animateTween(movingSymbol.scale, {
            duration: 0.08,
            x: baseScaleX * 1.1,
            y: baseScaleY * 1.1,
            ease: 'power1.out',
            onComplete: () => {
              AnimationProxy.animateTween(movingSymbol.scale, {
                duration: 0.12,
                x: baseScaleX,
                y: baseScaleY,
                ease: 'back.out(2)',
                onComplete: () => onDone(),
              });
            },
          });
        },
      });
    };

    const playDropAt = (index: number): void => {
      if (index >= drops.length) {
        onAllDone();
        return;
      }

      const { from, to } = drops[index];
      const [fromCol, fromRow] = from;
      const [toCol, toRow] = to;
      const isFirstDrop = index === 0;
      const goToNextDrop = (): void => playDropAt(index + 1);

      if (fromCol === toCol && fromRow === toRow) {
        // Already in its final spot - nothing to move.
        goToNextDrop();
        return;
      }

      const fromSymbol = slotReel?.symbolsArray?.[fromCol]?.[fromRow + 1];
      const toSymbol = slotReel?.symbolsArray?.[toCol]?.[toRow + 1];
      if (!fromSymbol || !toSymbol) {
        goToNextDrop();
        return;
      }

      const startMove = (): void => {
        slideSymbolToPosition(fromSymbol, toSymbol, fromCol, fromRow, toCol, toRow, goToNextDrop);
      };

      if (!isFirstDrop) {
        startMove();
        return;
      }

      const fromLocalPos = this.view.toLocal(fromSymbol.getGlobalPosition());

      flyGoldCardStoneTo(fromLocalPos, () => {
        this.spawnHitParticle(fromLocalPos, 1.3);
        removeStoneFromCrate();
        startMove();
      });
    };

    playDropAt(0);
  }

  private holdDisplacedSymbol(targetSymbol: any): void {
    const normalScale = this.getNormalSymbolScale();
    this.setSymbolVisibility(targetSymbol, false);
    this.hiddenReelSymbols.push({ symbol: targetSymbol, scaleX: normalScale, scaleY: normalScale, alpha: 1 });
    this.holdRemovedSymbol(targetSymbol);
  }

  // lifecycles
  // ===========================================================================================

  public clearActiveAnimations(): void {
    if (this.stoneAnimationTimeout) {
      clearTimeout(this.stoneAnimationTimeout);
      this.stoneAnimationTimeout = null;
    }

    this.activeTweens.forEach((t) => {
      if (t && typeof t.kill === 'function') t.kill();
    });
    this.activeTweens = [];

    this.resetAllReelSymbolsScale();
  }

  public restoreHiddenSymbols(): void {
    if (this.hiddenReelSymbols.length === 0) return;

    this.hiddenReelSymbols.forEach(({ symbol, scaleX, scaleY, alpha }) => {
      if (!symbol) return;
      AnimationProxy.killTweensOf(symbol);
      AnimationProxy.killTweensOf(symbol.scale);
      symbol.alpha = alpha ?? 1;
      if (symbol.scale) symbol.scale.set(scaleX, scaleY);
      this.setSymbolVisibility(symbol, true);
    });
    this.hiddenReelSymbols = [];
  }

  public resetAllReelSymbolsScale(): void {
    const reel: any = this.view.slotReel;
    if (!reel?.symbolsArray) return;
    const normalScale = this.getNormalSymbolScale();

    reel.symbolsArray.forEach((col: any) => {
      if (Array.isArray(col)) {
        col.forEach((sym: any) => {
          if (sym && !this.hiddenReelSymbols.some((hidden) => hidden.symbol === sym)) {
            if (sym.scale && (sym.scale.x !== normalScale || sym.scale.y !== normalScale)) {
              sym.scale.set(normalScale);
            }
            // The engine's clearSpinWin() restores `visible` but never alpha/scale, so a symbol
            // left transparent by any interrupted flight would stay invisible for good.
            if (sym.alpha === 0) {
              sym.alpha = 1;
            }
          }
        });
      }
    });
  }

  // Stone-flight helpers (box <-> reel symbol): wild expansion, multi-win, megawin
  // ===========================================================================================

  public createStoneRemoverForCrate(boxName: string, fallbackCount: number): () => void {
    const key = BOX_STATE_KEYS[boxName]?.key;
    const stoneState = this.view.getStoneState();
    let remainingPips = Math.max(0, Math.min(5, (key ? (stoneState as any)?.[key]?.pips : undefined) ?? fallbackCount));
    return () => {
      remainingPips = Math.max(0, remainingPips - 1);
      (this.view as any).applyBoxState(boxName, true, remainingPips);
    };
  }

  public createFlightStone(startPos: Point, name: string, spineName: string, skin: string, idleAnim: string): any {
    const stone = new (ReelSymbolSpine as any)({
      data: { name, spineName, skin, idleAnim, winAnim: idleAnim, animScale: 1 },
    });
    stone.position.copyFrom(startPos);
    stone.scale.set(STONE_BASE_SCALE);
    stone.showWinning(null, true);
    this.view.addChild(stone);
    return stone;
  }

  public spawnHitParticle(endPos: Point, animScale: number): void {
    const particle = new (ReelSymbolSpine as any)({
      data: {
        name: 'particle',
        spineName: 'particle_spine',
        idleAnim: 'all_animations',
        winAnim: 'all_animations',
        animScale,
      },
    });
    particle.position.copyFrom(endPos);
    this.view.addChild(particle);
    particle.showWinning(() => {
      if (particle.parent) particle.parent.removeChild(particle);
      particle.destroy();
    }, false);
  }

  public flyStonesToSymbols(
    positions: Array<[number, number]>,
    boxName: string,
    createStone: (startPos: Point) => any,
    onLaunch: ((index: number, isFinale: boolean) => void) | undefined,
    onLanded: (ctx: {
      symbol: any;
      col: number;
      row: number;
      endPos: Point;
      index: number;
      isFinale: boolean;
      reportDone: () => void;
    }) => void,
    onAllDone: () => void,
  ): void {
    const slotReel = this.view.slotReel as any;

    if (!positions || positions.length === 0) {
      onAllDone();
      return;
    }

    const orderedPositions = [...positions].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const total = orderedPositions.length;
    let completed = 0;

    const targetBox = (this.view as any).boxesComp?.elementsList?.[boxName];
    let startPos = new Point(0, 0);
    const boxBaseScale = new Point(targetBox?.scale?.x ?? 1, targetBox?.scale?.y ?? 1);

    if (targetBox) {
      const boxLocal =
        typeof targetBox.playAnimation === 'function'
          ? new Point(0, -20)
          : new Point(targetBox.width * 0.5, targetBox.height * 0.25);
      const boxGlobal = targetBox.toGlobal(boxLocal);
      startPos = this.view.toLocal(boxGlobal);
    }

    const punchBox = (): void => {
      if (!targetBox?.scale) return;
      AnimationProxy.animateTween(targetBox.scale, {
        duration: 0.08,
        x: boxBaseScale.x * 0.92,
        y: boxBaseScale.y * 0.92,
        ease: 'power1.out',
        onComplete: () => {
          AnimationProxy.animateTween(targetBox.scale, {
            duration: 0.15,
            x: boxBaseScale.x,
            y: boxBaseScale.y,
            ease: 'back.out(2)',
          });
        },
      });
    };

    let cartStone: any = createStone(startPos);
    cartStone.scale.set(0);

    AnimationProxy.animateTween(cartStone.scale, {
      duration: 0.3,
      x: STONE_BASE_SCALE,
      y: STONE_BASE_SCALE,
      ease: 'back.out(2)',
      onComplete: () => {
        if (cartStone) {
          AnimationProxy.animateTween(
            cartStone.scale,
            {
              duration: 0.35,
              x: STONE_BASE_SCALE * 1.18,
              y: STONE_BASE_SCALE * 1.18,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
            },
            false,
          );
        }
      },
    });

    const stopChargePulse = (): void => {
      AnimationProxy.killTweensOf(cartStone?.scale);
      if (cartStone) cartStone.scale.set(STONE_BASE_SCALE);
    };

    const takeCartStone = (): any => {
      const stone = cartStone;
      cartStone = null;
      return stone;
    };

    const discardCartStone = (): void => {
      if (!cartStone) return;
      if (cartStone.parent) cartStone.parent.removeChild(cartStone);
      cartStone.destroy();
      cartStone = null;
    };

    const reportDone = () => {
      completed++;
      if (completed < total) return;
      discardCartStone();
      onAllDone();
    };

    const launchNext = (index: number) => {
      if (index + 1 < total) launchStone(index + 1);
    };

    const launchStone = (index: number) => {
      const isFinale = index === total - 1;
      const [col, row] = orderedPositions[index];
      const symbol = slotReel.symbolsArray?.[col]?.[row + 1]; // +1 for the top buffer symbol

      if (!symbol) {
        console.warn(`[MineDash] flyStonesToSymbols: no symbol at col=${col} row=${row} for box=${boxName}`);
        reportDone();
        launchNext(index);
        return;
      }

      const symbolPos =
        typeof symbol.getGlobalPosition === 'function'
          ? symbol.getGlobalPosition()
          : slotReel.getSymbolPosition(col, row + 1);
      const endPos = this.view.toLocal(symbolPos);

      const movingStone = isFinale && cartStone ? takeCartStone() : createStone(startPos);
      movingStone.position.copyFrom(startPos);
      punchBox();
      if (onLaunch) onLaunch(index, isFinale);

      const fromX = startPos.x;
      const fromY = startPos.y;
      const dist = Math.hypot(endPos.x - fromX, endPos.y - fromY);
      const arcHeight = Math.min(Math.max(dist * (isFinale ? 0.5 : 0.35), 60), isFinale ? 320 : 220);
      const controlX = (fromX + endPos.x) / 2;
      const controlY = (fromY + endPos.y) / 2 - arcHeight;
      const arcProgress = { t: 0 };

      const progressRatio = total > 1 ? index / (total - 1) : 0;
      const flightDuration = isFinale ? 0.5 : 0.36 - 0.12 * progressRatio;

      const startScale = STONE_BASE_SCALE;
      const endScale = STONE_BASE_SCALE * (isFinale ? 1.8 : 1.6);

      const spinDir = endPos.x < fromX ? -1 : 1;
      const totalRotation = spinDir * (isFinale ? FINAL_STONE_ROTATION : STONE_ROTATION);

      AnimationProxy.animateTween(arcProgress, {
        duration: flightDuration,
        t: 1,
        ease: 'power2.in',
        onUpdate: () => {
          const t = arcProgress.t;
          const u = 1 - t;
          movingStone.x = u * u * fromX + 2 * u * t * controlX + t * t * endPos.x;
          movingStone.y = u * u * fromY + 2 * u * t * controlY + t * t * endPos.y;
          movingStone.scale.set(startScale + (endScale - startScale) * t);
          movingStone.rotation = totalRotation * t;
        },
        onComplete: () => {
          if (movingStone.parent) movingStone.parent.removeChild(movingStone);
          movingStone.destroy();
          launchNext(index);
          onLanded({ symbol, col, row, endPos, index, isFinale, reportDone });
        },
      });
    };

    setTimeout(() => {
      stopChargePulse();
      launchStone(0);
    }, LAUNCH_DELAY_MS);
  }

  // Shared helpers
  private setSymbolVisibility(symbol: any, isVisible: boolean): void {
    symbol.visible = isVisible;
    symbol.renderable = isVisible;
    if (typeof symbol.setSpineVisible === 'function') {
      symbol.setSpineVisible(isVisible);
    }
    if (symbol.spine) {
      symbol.spine.visible = isVisible;
      symbol.spine.renderable = isVisible;
      symbol.spine.alpha = isVisible ? 1 : 0;
    }
    if (symbol.symbol) {
      symbol.symbol.visible = isVisible;
      symbol.symbol.renderable = isVisible;
      symbol.symbol.alpha = isVisible ? 1 : 0;
    }
  }

  private getNormalSymbolScale(): number {
    return (this.view.slotReel as any)?.reelsData?.symbolScale || 0.84;
  }

  private removeActiveTween(tween: any): void {
    const index = this.activeTweens.indexOf(tween);
    if (index > -1) {
      this.activeTweens.splice(index, 1);
    }
  }
}
