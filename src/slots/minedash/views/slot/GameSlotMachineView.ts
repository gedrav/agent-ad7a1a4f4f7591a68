import { Point, Graphics, Text, Container, FillGradient, TextStyle } from 'pixi.js';
import ReelSymbolSpine from '@core/views/slotmachine/ReelSymbolSpine';
import { SlotMachineView } from '@core/views/slotmachine/SlotMachineView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { StateManager } from '@core/states/StateManagerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { GemBoxesComp, BOX_STATE_KEYS, StoneStateData } from '@game/views/comps/GemBoxesComp';
import { StoneAnimationManager, StoneData, STONE_CONFIG } from '@game/views/slot/StoneAnimationManager';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { Sine } from 'gsap';

const LAUNCH_DELAY_MS = 600;
const STONE_ROTATION = 0.35;
const FINAL_STONE_ROTATION = 0.6;
const STONE_BASE_SCALE = 0.5;

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

  protected resizeView(): void {
    super.resizeView();
    const minerChara = this.elementsList?.['minerChara'];
    if (!minerChara || !this.slotReel) return;

    const reelIndex = this.getChildIndex(this.slotReel);
    const isBehind = this.getChildIndex(minerChara) < reelIndex;
    const shouldBeBehind = DeviceProxy.config.isPortrait;
    if (isBehind !== shouldBeBehind) {
      this.setChildIndex(minerChara, reelIndex);
    }
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

    this.currentStoneState = { ...this.currentStoneState, ...nextState };
    this.updateBoxLabels();
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
    const positions: number[] = data.positions || [];
    const value = data.value || 0;

    if (positions.length === 0) {
      StateManager.doNextStep();
      return;
    }

    this.playMultiplierStoneFlight(positions, 'box1', value, () => {
      this.applyBoxState('box1', true);
      StateManager.doNextStep();
    });
  }

  private createPipDepleter(boxName: string, fallbackCount: number): () => void {
    const key = BOX_STATE_KEYS[boxName]?.key;
    let remainingPips = Math.max(
      0,
      Math.min(5, (key ? (this.currentStoneState as any)?.[key]?.pips : undefined) ?? fallbackCount),
    );
    return () => {
      remainingPips = Math.max(0, remainingPips - 1);
      this.applyBoxState(boxName, true, remainingPips);
    };
  }

  private createFlightStone(startPos: Point, name: string, spineName: string, skin: string, idleAnim: string): any {
    const stone = new (ReelSymbolSpine as any)({
      data: { name, spineName, skin, idleAnim, winAnim: idleAnim, animScale: 1 },
    });
    stone.position.copyFrom(startPos);
    stone.scale.set(STONE_BASE_SCALE);
    stone.showWinning(null, true);
    this.addChild(stone);
    return stone;
  }

  private spawnHitParticle(endPos: Point, animScale: number): void {
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
    this.addChild(particle);
    particle.showWinning(() => {
      if (particle.parent) particle.parent.removeChild(particle);
      particle.destroy();
    }, false);
  }

  private playMultiplierStoneFlight(
    positions: number[],
    boxName: string,
    value: number,
    onAllLanded: () => void,
  ): void {
    const slotReel = this.slotReel as any;
    const normalScale = slotReel.reelsData?.symbolScale || 0.84;
    const depleteCrateStone = this.createPipDepleter(boxName, positions.length);

    const createStone = (startPos: Point): any => {
      return this.createFlightStone(startPos, 'SM', STONE_CONFIG['SM'].spineName, STONE_CONFIG['SM'].skin || '', 'Win');
    };

    this.flyStonesToSymbols(
      positions,
      boxName,
      createStone,
      () => depleteCrateStone(),
      ({ symbol, endPos, reportDone }) => {
        this.spawnHitParticle(endPos, 1.2);

        const symbolBadge = this.createMultiplierBadge(endPos, value);
        setTimeout(() => {
          AnimationProxy.animateTween(symbolBadge.scale, {
            duration: 0.3,
            x: 0,
            y: 0,
            ease: 'back.in(2)',
            onComplete: () => {
              if (symbolBadge.parent) symbolBadge.parent.removeChild(symbolBadge);
              symbolBadge.destroy();
            },
          });
        }, 500);

        AnimationProxy.animateTween(symbol.scale, {
          duration: 0.15,
          x: normalScale * 1.12,
          y: normalScale * 1.12,
          ease: 'power1.out',
          onComplete: () => {
            AnimationProxy.animateTween(symbol.scale, {
              duration: 0.2,
              x: normalScale,
              y: normalScale,
              ease: 'back.out(2)',
              onComplete: () => reportDone(),
            });
          },
        });
      },
      () => {
        this.applyBoxState(boxName, true);
        onAllLanded();
      },
    );
  }

  private createMultiplierBadge(position: Point, value: number): Container {
    const container = new Container();
    container.name = 'multiBadge';

    const shadow = new Graphics();
    shadow.beginFill(0x000000, 0.75);
    shadow.drawRoundedRect(-44, -24, 96, 56, 28);
    shadow.endFill();
    container.addChild(shadow);

    const bg = new Graphics();
    bg.beginFill(0x990000, 1);
    bg.lineStyle(4, 0xffd700, 1);
    bg.drawRoundedRect(-48, -28, 96, 56, 28);
    bg.endFill();

    bg.lineStyle(2, 0x4a0000, 1);
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
      resolution: 2,
    });
    text.anchor.set(0.5);
    text.position.set(0, -2);

    container.addChild(text);

    container.position.set(position.x, position.y + 35);
    this.addChild(container);

    container.scale.set(0);
    AnimationProxy.animateTween(container.scale, {
      duration: 0.5,
      x: 1,
      y: 1,
      ease: 'back.out(2.5)',
    });

    return container;
  }

  private flyStonesToSymbols(
    positions: number[],
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
    const slotReel = this.slotReel as any;

    if (!positions || positions.length === 0) {
      onAllDone();
      return;
    }

    const orderedPositions = [...positions].sort((a, b) => (a % 5) - (b % 5));
    const total = orderedPositions.length;
    let completed = 0;

    const targetBox = (this.boxesComp as any)?.elementsList?.[boxName];
    let startPos = new Point(0, 0);
    const boxBaseScale = new Point(targetBox?.scale?.x ?? 1, targetBox?.scale?.y ?? 1);

    if (targetBox) {
      const boxLocal =
        typeof targetBox.playAnimation === 'function'
          ? new Point(0, -20)
          : new Point(targetBox.width * 0.5, targetBox.height * 0.25);
      const boxGlobal = targetBox.toGlobal(boxLocal);
      startPos = this.toLocal(boxGlobal);
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
      const pos = orderedPositions[index];
      const col = pos % 5;
      const row = Math.floor(pos / 5);
      const symbol = slotReel.symbolsArray?.[col]?.[row + 1]; // +1 for the top buffer symbol

      if (!symbol) {
        reportDone();
        launchNext(index);
        return;
      }

      const symbolPos =
        typeof symbol.getGlobalPosition === 'function'
          ? symbol.getGlobalPosition()
          : slotReel.getSymbolPosition(col, row + 1);
      const endPos = this.toLocal(symbolPos);

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
      let lastTrailT = 0;

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

          if (t - lastTrailT >= 0.12) {
            lastTrailT = t;
            this.stoneAnimationManager.spawnTrailDot(new Point(movingStone.x, movingStone.y));
          }
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

  private playFeatureExpansion(positions: number[], boxName: string, respectedSymbol: string, isWild: boolean): void {
    const slotReel = this.slotReel as any;

    if (!positions || positions.length === 0 || !respectedSymbol) {
      StateManager.doNextStep();
      return;
    }

    const normalScale = slotReel.reelsData?.symbolScale || 0.84;
    const depleteCrateStone = this.createPipDepleter(boxName, positions.length);

    const createStone = (startPos: Point): any => {
      let movingName: string;
      let spineName: string;
      let skin: string;
      let idleAnim: string;

      if (isWild) {
        movingName = 'SW';
        spineName = STONE_CONFIG['SW'].spineName;
        skin = STONE_CONFIG['SW'].skin || '';
        idleAnim = 'Win';
      } else {
        movingName = `SG_${respectedSymbol}`;
        const symbolConfig = slotReel.reelsData?.symbolsData?.[movingName];
        spineName = symbolConfig?.spineName || 'gems';
        skin = symbolConfig?.skin || '';
        idleAnim = symbolConfig?.idleAnim || 'Static';
      }

      return this.createFlightStone(startPos, movingName, spineName, skin, idleAnim);
    };

    this.flyStonesToSymbols(
      positions,
      boxName,
      createStone,
      () => depleteCrateStone(),
      ({ symbol, col, row, endPos, isFinale, reportDone }) => {
        this.spawnHitParticle(endPos, 1.5);

        AnimationProxy.animateTween(symbol.scale, {
          duration: 0.4,
          x: 0,
          y: 0,
          ease: Sine.easeIn,
          onComplete: () => {
            if (isWild) {
              EventHandler.dispatchEvent('Wildappear', { reelID: col, rowID: row, isLast: isFinale });
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

            const winContainer = (this.slotReel as any).winController?.winSymbolsContainer;
            const originalParent = symbol.parent;
            const originalX = symbol.x;
            const originalY = symbol.y;

            if (winContainer) {
              const globalPos = symbol.getGlobalPosition();
              const localPos = winContainer.toLocal(globalPos);
              symbol.position.set(localPos.x, localPos.y);
              winContainer.addChild(symbol);
            }

            symbol.showWinning(() => {
              if (winContainer && originalParent) {
                originalParent.addChild(symbol);
                symbol.position.set(originalX, originalY);
              }
              reportDone();
            }, false);
          },
        });
      },
      () => {
        if (this.boxesComp && typeof this.boxesComp.applyState === 'function') {
          this.boxesComp.applyState(boxName, this.currentStoneState, true);
        }
        StateManager.doNextStep();
      },
    );
  }

  // Lifecycle
  public destroy(options?: any): void {
    if ((this as any)._initTimeout) clearTimeout((this as any)._initTimeout);
    this.stoneAnimationManager.clearActiveAnimations();
    super.destroy(options);
  }
}
