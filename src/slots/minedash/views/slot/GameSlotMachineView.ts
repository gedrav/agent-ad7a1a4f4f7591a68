import { Point, Graphics, Text, Container, BitmapText, FillGradient, TextStyle } from 'pixi.js';
import ReelSymbolSpineExtended from '@core/views/slotmachine/ReelSymbolSpineExtended';
import { SlotMachineView } from '@core/views/slotmachine/SlotMachineView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { StateManager } from '@core/states/StateManagerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { GemBoxesComp, BOX_STATE_KEYS, StoneStateData } from '@game/views/comps/GemBoxesComp';
import { StoneAnimationManager, StoneData, STONE_CONFIG } from '@game/views/slot/StoneAnimationManager';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { GameProxy } from '@core/models/GameConfigProxy';
import { Sine } from 'gsap';

export class GameSlotMachineView extends SlotMachineView {
  private readonly stoneAnimationManager: StoneAnimationManager;
  private currentStoneState: StoneStateData = {};
  public pendingCollectionBoxes: Set<string> = new Set();

  public get boxesComp(): GemBoxesComp | undefined {
    return (this.slotReel as any)?.elementsList?.['boxesContainer'];
  }

  constructor(config: any) {
    super(config);
    this.stoneAnimationManager = new StoneAnimationManager(this);

    EventHandler.addEventListener('SHOW_STONE_TRANSITION', this.showStoneTransition.bind(this));
    EventHandler.addEventListener('EXPAND_WILD', this.expandWildSym.bind(this));
    EventHandler.addEventListener('SHOW_MEGA_WIN', this.showMegaWin.bind(this));
    EventHandler.addEventListener('SHOW_MULTI_WIN', this.showMultiWin.bind(this));

    EventHandler.addEventListener(SlotEvents.CLEAR_ROUND, () => {
      this.stoneAnimationManager.clearActiveAnimations();
      this.pendingCollectionBoxes.clear();
    });
    EventHandler.addEventListener(
      SlotEvents.START_SPIN,
      this.stoneAnimationManager.clearActiveAnimations.bind(this.stoneAnimationManager),
    );
    EventHandler.addEventListener(SlotEvents.GAME_INIT_SUCCESS, () => this.updateStoneState());
    EventHandler.addEventListener(SlotEvents.SHOW_MAINGAME_ELEMENTS, () => this.updateStoneState());
    EventHandler.addEventListener(SlotEvents.STOP_SPIN_AFTER_RESPONSE, () => {
      this.pendingCollectionBoxes = this.detectPendingStoneBoxes();
      this.updateStoneState();
      this.stoneAnimationManager.resetAllReelSymbolsScale();
    });

    const initTimeout = setTimeout(() => {
      this.updateStoneState();
    }, 100);
    // Ideally this timeout should be cleared on destroy, handled here briefly:
    (this as any)._initTimeout = initTimeout;
  }

  public getStoneState(): StoneStateData {
    return this.currentStoneState;
  }

  // Box state
  public getFiredStoneBoxName(): string | undefined {
    const firedStone = appModel.getReelModifiers()?.find((m: any) => m.type === 'stoneFired');
    const firedStoneKey = firedStone?.stone as keyof StoneStateData | undefined;
    if (!firedStoneKey) return undefined;
    return Object.keys(BOX_STATE_KEYS).find((name) => BOX_STATE_KEYS[name].key === firedStoneKey);
  }

  private detectPendingStoneBoxes(): Set<string> {
    const boxes = new Set<string>();
    const reelView = (appModel as any).getReelsView() || (appModel as any).gameResult?.reelView;
    if (Array.isArray(reelView)) {
      reelView.forEach((column: any) => {
        if (Array.isArray(column)) {
          column.forEach((symbolName: string) => {
            const stoneKey = typeof symbolName === 'string' && symbolName.startsWith('SG_') ? 'SG' : symbolName;
            if (STONE_CONFIG[stoneKey]) {
              boxes.add(STONE_CONFIG[stoneKey].boxName);
            }
          });
        }
      });
    }
    const firedStoneBoxName = this.getFiredStoneBoxName();
    if (firedStoneBoxName) boxes.add(firedStoneBoxName);
    return boxes;
  }

  public applyBoxState(
    boxName: string,
    force: boolean = false,
    pipsOverride?: number,
    clearPending: boolean = true,
  ): void {
    this.boxesComp?.applyState(boxName, this.currentStoneState, force, pipsOverride);
    if (clearPending) {
      this.pendingCollectionBoxes.delete(boxName);
    }
  }

  private updateBoxLabels(): void {
    this.boxesComp?.applyAll(this.currentStoneState, this.pendingCollectionBoxes);
  }

  public updateStoneState(state?: StoneStateData): void {
    const res = (appModel as any).gameResult;
    const nextState =
      state || res?.progressData?.stoneState || res?.stoneState || appModel.gameData?.progressData?.stoneState;

    if (nextState) {
      this.currentStoneState = { ...this.currentStoneState, ...nextState };
      this.updateBoxLabels();
    }
  }

  // Stone animation
  public showStoneTransition(): void {
    this.stoneAnimationManager.clearActiveAnimations();

    const allStones = this.extractAllStones();
    this.pendingCollectionBoxes = new Set(allStones.map((s) => s.boxName));
    this.updateStoneState();

    if (allStones.length === 0) {
      StateManager.doNextStep();
      return;
    }

    this.stoneAnimationManager.playStonesSequence(allStones, () => StateManager.doNextStep());
  }

  private extractAllStones(): StoneData[] {
    const allStones: StoneData[] = [];

    // 1. Scan appModel reelView
    const reelView = (appModel as any).getReelsView() || (appModel as any).gameResult?.reelView;
    if (Array.isArray(reelView)) {
      reelView.forEach((column: any, col: number) => {
        if (Array.isArray(column)) {
          column.forEach((symbolName: string, row: number) => {
            if (!symbolName) return;
            const stoneKey = typeof symbolName === 'string' && symbolName.startsWith('SG_') ? 'SG' : symbolName;
            if (STONE_CONFIG[stoneKey]) {
              allStones.push({
                col,
                row,
                symbol: symbolName,
                boxName: STONE_CONFIG[stoneKey].boxName,
                spineName: STONE_CONFIG[stoneKey].spineName,
                skin: STONE_CONFIG[stoneKey].skin,
              });
            }
          });
        }
      });
    }

    return allStones;
  }

  private expandWildSym(positions: number[]): void {
    this.playFeatureExpansion(positions, 'box4', 'WD', true);
  }

  private showMegaWin(data: { positions: number[]; symbol: string; triggerPosition?: number[] }): void {
    if (!data.positions || !data.symbol) {
      StateManager.doNextStep();
      return;
    }
    this.playFeatureExpansion(data.positions, 'box5', data.symbol, false);
  }

  private showMultiWin(data: any): void {
    const slotReel = this.slotReel as any;
    const positions: number[] = data.positions || [];
    const value = data.value || 0;

    if (positions.length === 0) {
      StateManager.doNextStep();
      return;
    }

    if (this.boxesComp && typeof this.boxesComp.playWin === 'function') {
      this.boxesComp.playWin('box1');
    }

    // After box win, show multiplier on the symbols
    setTimeout(() => {
      const badges: Container[] = [];
      positions.forEach((pos) => {
        const col = pos % 5;
        const row = Math.floor(pos / 5);
        const symbol = slotReel.symbolsArray?.[col]?.[row + 1];

        if (symbol) {
          // create a multiplier badge and add it to the symbol
          const badge = this.createMultiplierBadge(symbol, value, slotReel, col, row + 1);
          if (badge) badges.push(badge);
        }
      });

      // Wait 1.5 seconds then continue
      setTimeout(() => {
        if (badges.length > 0) {
          badges.forEach((b) => {
            AnimationProxy.animateTween(b.scale, {
              duration: 0.4,
              x: 0,
              y: 0,
              ease: 'back.in(2)',
              onComplete: () => {
                if (b.parent) b.parent.removeChild(b);
                b.destroy();
              },
            });
          });

          // Wait for the disappear animation to finish before moving to next step
          setTimeout(() => {
            this.applyBoxState('box1', true);
            StateManager.doNextStep();
          }, 400);
        } else {
          this.applyBoxState('box1', true);
          StateManager.doNextStep();
        }
      }, 1500);
    }, 1000);
  }

  private createMultiplierBadge(symbol: any, value: number, slotReel: any, col: number, row: number): Container {
    const container = new Container();
    container.name = 'multiBadge';

    // Drop shadow behind the badge
    const shadow = new Graphics();
    shadow.beginFill(0x000000, 0.75);
    shadow.drawRoundedRect(-44, -24, 96, 56, 28); // Offset down and right
    shadow.endFill();
    container.addChild(shadow);

    // Main background (Vibrant Ruby Red for high contrast and premium feel)
    const bg = new Graphics();
    bg.beginFill(0x990000, 1);
    bg.lineStyle(4, 0xffd700, 1); // Bright premium gold outer border
    bg.drawRoundedRect(-48, -28, 96, 56, 28); // Fully rounded pill shape
    bg.endFill();

    // Inner border for a polished gem/plaque effect
    bg.lineStyle(2, 0x4a0000, 1); // Dark red inner ring for depth
    bg.drawRoundedRect(-42, -22, 84, 44, 22);

    container.addChild(bg);

    const goldGradient = new FillGradient(0, 0, 0, 50);
    goldGradient.addColorStop(0, '#FFFBE0');
    goldGradient.addColorStop(0.35, '#FFE14D');
    goldGradient.addColorStop(0.65, '#FFB01F');
    goldGradient.addColorStop(1, '#E06A00');

    const multiplierStyle = new TextStyle({
      fontFamily: ['Oswald-Bold', 'Arial Black', 'sans-serif'],
      fontSize: 42,
      fill: goldGradient,
      stroke: { color: '#3A0F00', width: 8, join: 'round' },
      dropShadow: { color: '#000000', alpha: 0.7, blur: 4, angle: Math.PI / 2, distance: 4 },
      letterSpacing: 1,
      padding: 12,
    });

    const text = new Text({
      text: `x${value}`,
      style: multiplierStyle,
      resolution: 2, // High resolution for crisper text rendering
    });
    text.anchor.set(0.5);
    text.position.set(0, -2); // Optical center adjustment

    container.addChild(text);

    // Position it appropriately on the symbol (bottom center of the gem)
    const symbolPos =
      typeof symbol.getGlobalPosition === 'function'
        ? symbol.getGlobalPosition()
        : slotReel.getSymbolPosition(col, row);
    const localPos = this.toLocal(symbolPos);

    container.position.set(localPos.x, localPos.y + 35);
    this.addChild(container);

    // Add satisfying pop-in bounce animation
    container.scale.set(0);
    AnimationProxy.animateTween(container.scale, {
      duration: 0.5,
      x: 1,
      y: 1,
      ease: 'back.out(2.5)', // Extra springy
    });

    return container;
  }

  private playFeatureExpansion(positions: number[], boxName: string, respectedSymbol: string, isWild: boolean): void {
    const slotReel = this.slotReel as any;

    if (!positions || positions.length === 0 || !respectedSymbol) {
      StateManager.doNextStep();
      return;
    }

    const normalScale = slotReel.reelsData?.symbolScale || 0.84;
    const total = positions.length;
    let currentIndex = 0;

    if (this.boxesComp && typeof this.boxesComp.playWin === 'function') {
      this.boxesComp.playWin(boxName);
    }

    const targetBox = (this.boxesComp as any)?.elementsList?.[boxName];
    let startPos = new Point(0, 0);

    if (targetBox) {
      const boxLocal =
        typeof targetBox.playAnimation === 'function'
          ? new Point(0, -20)
          : new Point(targetBox.width * 0.5, targetBox.height * 0.25);
      const boxGlobal = targetBox.toGlobal(boxLocal);
      startPos = this.toLocal(boxGlobal);
    }

    const processNext = () => {
      if (currentIndex >= total) {
        if (this.boxesComp && typeof this.boxesComp.applyState === 'function') {
          this.boxesComp.applyState(boxName, this.currentStoneState, true);
        }
        StateManager.doNextStep();
        return;
      }

      const pos = positions[currentIndex];
      const col = pos % 5;
      const row = Math.floor(pos / 5);
      const symbol = slotReel.symbolsArray?.[col]?.[row + 1]; // +1 for the top buffer symbol

      if (!symbol) {
        currentIndex++;
        processNext();
        return;
      }

      const symbolPos =
        typeof symbol.getGlobalPosition === 'function'
          ? symbol.getGlobalPosition()
          : slotReel.getSymbolPosition(col, row + 1);
      const endPos = this.toLocal(symbolPos);

      const doSwap = () => {
        AnimationProxy.animateTween(symbol.scale, {
          duration: 0.4,
          x: 0,
          y: 0,
          ease: Sine.easeIn,
          onComplete: () => {
            if (isWild) {
              EventHandler.dispatchEvent('Wildappear', { reelID: col, rowID: row, isLast: currentIndex === total - 1 });
            }
            symbol.setNewSymbol(slotReel.reelsData.symbolsData[respectedSymbol], col);

            symbol.scale.set(0);
            AnimationProxy.animateTween(symbol.scale, {
              duration: 0.4,
              delay: 0.2,
              x: normalScale,
              y: normalScale,
              ease: 'back.out(1.5)',
            });

            // Play particle animation
            const particle = new (ReelSymbolSpineExtended as any)({
              data: {
                name: 'particle',
                spineName: 'particle_spine',
                idleAnim: 'all_animations',
                winAnim: 'all_animations',
                animScale: 1.5,
              },
            });
            particle.position.copyFrom(endPos);
            this.addChild(particle);
            particle.showWinning(() => {
              if (particle.parent) particle.parent.removeChild(particle);
              particle.destroy();
            }, false);

            symbol.showWinning(() => {
              currentIndex++;
              processNext();
            }, false);
          },
        });
      };

      if (currentIndex === 0) {
        // Create moving gem from box to symbol for the FIRST one only
        let spineName = 'gems';
        let skin = '';
        let idleAnim = 'Static';
        let winAnim = 'Static';
        let movingName = '';

        if (isWild) {
          movingName = 'SW';
          spineName = STONE_CONFIG['SW'].spineName;
          skin = STONE_CONFIG['SW'].skin || '';
        } else {
          movingName = `SG_${respectedSymbol}`;
          const symbolConfig = slotReel.reelsData?.symbolsData?.[movingName];
          spineName = symbolConfig?.spineName || 'gems';
          skin = symbolConfig?.skin || '';
          idleAnim = symbolConfig?.idleAnim || 'Static';
          winAnim = symbolConfig?.winAnim || 'Static';
        }

        const movingGem = new (ReelSymbolSpineExtended as any)({
          data: {
            name: movingName,
            spineName: spineName,
            skin: skin,
            idleAnim: idleAnim,
            winAnim: winAnim,
            animScale: 1,
          },
        });
        movingGem.position.copyFrom(startPos);
        movingGem.scale.set(0.5); // Reduce size of flying gem
        movingGem.showWinning(null, true);
        this.addChild(movingGem);

        // Fly the gem to the symbol
        AnimationProxy.animateTween(movingGem, {
          duration: 1.2,
          x: endPos.x,
          y: endPos.y,
          ease: 'power4.in',
          onComplete: () => {
            if (movingGem.parent) movingGem.parent.removeChild(movingGem);
            movingGem.destroy();
            doSwap();
          },
        });
      } else {
        doSwap();
      }
    };

    // Start the process after crate win animation finishes
    setTimeout(() => {
      processNext();
    }, 1000);
  }

  // Lifecycle
  public destroy(options?: any): void {
    if ((this as any)._initTimeout) clearTimeout((this as any)._initTimeout);
    this.stoneAnimationManager.clearActiveAnimations();
    super.destroy(options);
  }
}
