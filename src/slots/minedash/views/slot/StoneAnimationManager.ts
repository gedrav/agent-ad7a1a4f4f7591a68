import { Point } from 'pixi.js';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { getBezierPoint, lerp } from '@core/utils/MathUtils';
import MDReelSymbol from '@game/views/slot/MDReelSymbol';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { GameProxy } from '@core/models/GameConfigProxy';
import { GameSlotMachineView } from './GameSlotMachineView';
import { StoneStateData } from '@game/views/comps/GemBoxesComp';

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
  H4: 'HELMATE',
  H5: 'LANTERN',
  L1: 'A',
  L2: 'K',
  L3: 'Q',
  L4: 'J',
  L5: '10',
};

export const STONE_CONFIG: Record<string, StoneMapping> = {
  SM: { boxName: 'box1', spineName: 'gems', skin: 'Crystal' },
  SF: { boxName: 'box2', spineName: 'gems', skin: 'Triangle' },
  SY: { boxName: 'box3', spineName: 'gems', skin: 'Drop' },
  SW: { boxName: 'box4', spineName: 'gems', skin: 'Eye' },
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

    this.holdRemovedSymbol(targetSymbol);
  }

  private holdRemovedSymbol(targetSymbol: any): void {
    if (typeof targetSymbol.resetSymbol !== 'function' || typeof targetSymbol.setNewSymbol !== 'function') {
      return;
    }

    const originalResetSymbol = targetSymbol.resetSymbol.bind(targetSymbol);
    const originalSetNewSymbol = targetSymbol.setNewSymbol.bind(targetSymbol);

    // Block the reel's automatic reset so the symbol stays hidden when spin starts.
    targetSymbol.resetSymbol = () => {
      // intentional no-op
    };

    // Once the reel actually recycles this symbol with a new result, let it land fresh.
    targetSymbol.setNewSymbol = (data: any, reelno: number) => {
      targetSymbol.resetSymbol = originalResetSymbol;
      targetSymbol.setNewSymbol = originalSetNewSymbol;

      const normalScale = this.getNormalSymbolScale();
      targetSymbol.alpha = 1;
      targetSymbol.scale.set(normalScale, normalScale);
      this.setSymbolVisibility(targetSymbol, true);

      originalSetNewSymbol(data, reelno);
    };
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

    return movingSymbol;
  }
  // playing animation for stone
  private playStoneAnimation(
    movingSymbol: MDReelSymbol,
    startPos: Point,
    endPos: Point,
    targetBox: any,
    boxName: string,
    onComplete: () => void,
  ): void {
    const peakY = startPos.y - 30;
    const targetDropScale = 0.2;

    // Step 1: Popout (no extra scaling, spine handles it)
    const popTween = AnimationProxy.animateTween(movingSymbol, {
      duration: 0.25,
      y: peakY,
      ease: 'back.out(2)',
      onComplete: () => {
        this.removeActiveTween(popTween);

        // Step 2: Hold briefly, then drop
        this.stoneAnimationTimeout = setTimeout(() => {
          this.playDropAnimation(movingSymbol, endPos, 1, targetDropScale, targetBox, boxName, onComplete);
        }, 600);
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

    const dropTween = AnimationProxy.animateTween(movingSymbol, {
      duration: 0.25,
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
      }, 300);
    }, 100);
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
      this.hiddenReelSymbol = null;
    }
  }
}
