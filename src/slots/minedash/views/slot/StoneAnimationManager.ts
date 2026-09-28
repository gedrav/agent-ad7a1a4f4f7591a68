import { Point } from 'pixi.js';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { getBezierPoint, lerp } from '@core/utils/MathUtils';
import ReelSymbolSpine from '@core/views/slotmachine/ReelSymbolSpine';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { GameSlotMachineView } from './GameSlotMachineView';
import { StoneStateData } from '@game/views/comps/GemBoxesComp';

export interface StoneMapping {
  boxName: string;
  spineName: string;
}

export interface StoneData {
  col: number;
  row: number;
  symbol: string;
  boxName: string;
  spineName: string;
}

export const SYMBOL_TO_GOLDCARD_SKIN: Record<string, string> = {
  H1: 'Helmate',
  H2: 'Lamp',
  H3: 'Pickaxe',
  H4: 'Helmate',
  H5: 'Lamp',
  L1: 'A',
  L2: 'K',
  L3: 'Q',
  L4: 'J',
  L5: '10',
};

export const STONE_CONFIG: Record<string, StoneMapping> = {
  SM: { boxName: 'box1', spineName: 'Gem_Green' },
  SF: { boxName: 'box2', spineName: 'Gem_Orange' },
  SY: { boxName: 'box3', spineName: 'Gem_Pink' },
  SW: { boxName: 'box4', spineName: 'Gem_Red' },
  SG: { boxName: 'box5', spineName: 'GoldCard' },
};

export class StoneAnimationManager {
  private readonly view: GameSlotMachineView;
  private stoneAnimationTimeout: any = null;
  private activeTweens: any[] = [];
  private hiddenReelSymbol: {
    symbol: any;
    scaleX: number;
    scaleY: number;
    alpha: number;
  } | null = null;

  constructor(view: GameSlotMachineView) {
    this.view = view;
  }

  public playStonesSequence(stones: StoneData[], onComplete: () => void): void {
    if (stones.length > 0) {
      this.animateStoneToCartBox(stones[0], onComplete);
    } else {
      onComplete();
    }
  }

  private animateStoneToCartBox(stone: StoneData, onComplete: () => void): void {
    const { col, row, symbol, boxName, spineName } = stone;
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
    const movingSymbol = this.createMovingSymbol(symbol, spineName, startPos);

    this.view.addChild(movingSymbol);
    EventHandler.dispatchEvent('SHOW_TRANSITION_ANIM');

    this.playStoneAnimation(movingSymbol, startPos, endPos, targetBox, boxName, onComplete);
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

  private hideOriginalSymbol(targetSymbol: any): void {
    const normalScale = this.getNormalSymbolScale();

    if (typeof targetSymbol.clearCallBackAnimation === 'function') {
      targetSymbol.clearCallBackAnimation();
    }

    this.hiddenReelSymbol = {
      symbol: targetSymbol,
      scaleX: normalScale,
      scaleY: normalScale,
      alpha: targetSymbol.alpha ?? 1,
    };

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
  }

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

  private calculateTargetBoxPosition(targetBox: any): Point {
    const localPoint =
      typeof targetBox.playAnimation === 'function'
        ? new Point(0, -20)
        : new Point(targetBox.width * 0.5, targetBox.height * 0.25);
    const targetGlobalPos = targetBox.toGlobal(localPoint);
    return this.view.toLocal(targetGlobalPos);
  }

  private createMovingSymbol(symbolName: string, spineName: string, startPos: Point): ReelSymbolSpine {
    let cardSkin = '';
    if (spineName === 'GoldCard' || symbolName === 'SG') {
      const firedStone = appModel.getReelModifiers()?.find((m: any) => m.type === 'stoneFired');
      const megawinModifier = appModel.getReelModifiers()?.find((m: any) => m.type === 'megawinCollect');
      const targetSym =
        firedStone?.value || megawinModifier?.symbol || this.view.getStoneState()?.megawinStone?.drawnValue || 'H1';
      cardSkin = SYMBOL_TO_GOLDCARD_SKIN[targetSym] || 'Helmate';
    }

    const movingSymbol = new ReelSymbolSpine({
      data: {
        name: symbolName,
        spineName: spineName,
        skin: cardSkin,
        idleAnim: 'Static',
        winAnim: 'Static',
        animScale: 0.25,
      } as any,
    });
    movingSymbol.showWinning(null, true);
    movingSymbol.position.copyFrom(startPos);
    movingSymbol.scale.set(0.9);

    return movingSymbol;
  }
  // playing animation for stone
  private playStoneAnimation(
    movingSymbol: ReelSymbolSpine,
    startPos: Point,
    endPos: Point,
    targetBox: any,
    boxName: string,
    onComplete: () => void,
  ): void {
    const peakY = startPos.y - 30;
    const peakScale = 1.4;
    const targetDropScale = 0.2;

    // Step 1: Popout and increase size
    const popTween = AnimationProxy.animateTween(movingSymbol, {
      duration: 0.25,
      y: peakY,
      ease: 'back.out(2)',
      onUpdate: () => movingSymbol.scale.set(lerp(0.9, peakScale, popTween.progress())),
      onComplete: () => {
        this.removeActiveTween(popTween);

        // Step 2: Hold for 1 second, then drop
        this.stoneAnimationTimeout = setTimeout(() => {
          this.playDropAnimation(movingSymbol, endPos, peakScale, targetDropScale, targetBox, boxName, onComplete);
        }, 1000);
      },
    });

    this.activeTweens.push(popTween);
  }

  private playDropAnimation(
    movingSymbol: ReelSymbolSpine,
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

    const dropTween = AnimationProxy.animateTween(movingSymbol, {
      duration: 0.35,
      ease: 'power2.in',
      onUpdate: () => {
        const t = dropTween.progress();
        const bezierPoint = getBezierPoint(t, dropStartPos, c1, c2, endPos);
        movingSymbol.position.copyFrom(bezierPoint);
        movingSymbol.scale.set(lerp(peakScale, targetDropScale, t));
      },
      onComplete: () => {
        this.removeActiveTween(dropTween);
        if (movingSymbol.parent) movingSymbol.parent.removeChild(movingSymbol);
        movingSymbol.destroy();

        EventHandler.dispatchEvent('PLAY_GENERIC_BUTTON_SOUND');
        this.pulseCartBox(targetBox, boxName, onComplete);
      },
    });

    this.activeTweens.push(dropTween);
  }
  // box
  private pulseCartBox(targetBox: any, boxName: string, onComplete?: () => void): void {
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

    this.stoneAnimationTimeout = setTimeout(() => {
      (this.view as any).boxesComp?.playWin(boxName);

      this.stoneAnimationTimeout = setTimeout(() => {
        (this.view as any).applyBoxState(boxName, true);
        if (onComplete) onComplete();
      }, 3200);
    }, 500);
  }

  private getNormalSymbolScale(): number {
    return (this.view.slotReel as any)?.reelsData?.symbolScale || 0.84;
  }

  public resetAllReelSymbolsScale(): void {
    const reel: any = this.view.slotReel;
    if (!reel?.symbolsArray) return;
    const normalScale = this.getNormalSymbolScale();

    reel.symbolsArray.forEach((col: any) => {
      if (Array.isArray(col)) {
        col.forEach((sym: any) => {
          if (sym && this.hiddenReelSymbol?.symbol !== sym) {
            if (sym.scale && (sym.scale.x !== normalScale || sym.scale.y !== normalScale)) {
              sym.scale.set(normalScale);
            }
          }
        });
      }
    });
  }

  private removeActiveTween(tween: any): void {
    const index = this.activeTweens.indexOf(tween);
    if (index > -1) {
      this.activeTweens.splice(index, 1);
    }
  }

  public clearActiveAnimations(): void {
    if (this.stoneAnimationTimeout) {
      clearTimeout(this.stoneAnimationTimeout);
      this.stoneAnimationTimeout = null;
    }

    this.activeTweens.forEach((t) => {
      if (t && typeof t.kill === 'function') t.kill();
    });
    this.activeTweens = [];

    this.restoreAllHiddenSymbols();
    this.resetAllReelSymbolsScale();
  }

  private restoreAllHiddenSymbols(): void {
    if (this.hiddenReelSymbol) {
      const normalScale = this.getNormalSymbolScale();
      const sym = this.hiddenReelSymbol.symbol;
      if (sym) {
        sym.alpha = this.hiddenReelSymbol.alpha ?? 1;
        sym.scale.set(normalScale, normalScale);
        this.setSymbolVisibility(sym, true);
        if (sym.spine && sym.configData?.data?.animScale) {
          sym.spine.scale.set(sym.configData.data.animScale);
        }
      }
      this.hiddenReelSymbol = null;
    }
  }
}
