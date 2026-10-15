import { Point, Graphics, Text, Container, FillGradient, TextStyle } from 'pixi.js';
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

    EventHandler.addEventListener('SHOW_STONE_TRANSITION', () => this.showStoneTransition());
    EventHandler.addEventListener('EXPAND_WILD', (positions: Array<[number, number]>) => this.expandWildSym(positions));
    EventHandler.addEventListener('SHOW_MEGAWIN', (data: any) => this.showMegawinRedirect(data));
    EventHandler.addEventListener('SHOW_MULTI_WIN', (data: any) => this.showMultiWin(data));

    EventHandler.addEventListener(SlotEvents.START_SPIN, () => this.stoneAnimationManager.clearActiveAnimations());
    EventHandler.addEventListener(SlotEvents.GAME_INIT_SUCCESS, () => this.updateStoneState());
    EventHandler.addEventListener(SlotEvents.SHOW_MAINGAME_ELEMENTS, () => this.updateStoneState());
    EventHandler.addEventListener(SlotEvents.CLEAR_ROUND, () => {
      this.stoneAnimationManager.clearActiveAnimations();
      this.pendingCollectionBoxes.clear();
    });
    EventHandler.addEventListener(SlotEvents.STOP_SPIN_AFTER_RESPONSE, () => {
      this.pendingCollectionBoxes = this.detectPendingStoneBoxes();
      this.updateStoneState();
      this.stoneAnimationManager.restoreHiddenSymbols();
      this.stoneAnimationManager.resetAllReelSymbolsScale();
    });

    const initTimeout = setTimeout(() => {
      this.updateStoneState();
    }, 100);
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

  public destroy(options?: any): void {
    if ((this as any)._initTimeout) clearTimeout((this as any)._initTimeout);
    this.stoneAnimationManager.clearActiveAnimations();
    super.destroy(options);
  }

  // Stone collection (stones dropping into their collection boxes)
  // ==================================================================================================================

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

  public getStoneState(): StoneStateData {
    return this.currentStoneState;
  }

  public getFiredStoneBoxName(): string | undefined {
    const firedStone = appModel.getReelModifiers()?.find((m: any) => m.type === 'stoneFired');
    const firedStoneKey = firedStone?.stone as keyof StoneStateData | undefined;
    if (!firedStoneKey) return undefined;
    return Object.keys(BOX_STATE_KEYS).find((name) => BOX_STATE_KEYS[name].key === firedStoneKey);
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

  public updateStoneState(state?: StoneStateData): void {
    const res = (appModel as any).gameResult;
    const nextState =
      state || res?.progressData?.stoneState || res?.stoneState || appModel.gameData?.progressData?.stoneState;

    this.currentStoneState = { ...this.currentStoneState, ...nextState };
    this.updateBoxLabels();
  }

  private extractAllStones(): StoneData[] {
    const allStones: StoneData[] = [];

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

  private updateBoxLabels(): void {
    this.boxesComp?.applyAll(this.currentStoneState, this.pendingCollectionBoxes);
  }

  // FEATURE: Wild expansion
  // ==================================================================================================================

  private expandWildSym(positions: Array<[number, number]>): void {
    this.playFeatureExpansion(positions, 'box4', 'WD', true);
  }

  private playFeatureExpansion(
    positions: Array<[number, number]>,
    boxName: string,
    respectedSymbol: string,
    isWild: boolean,
  ): void {
    const slotReel = this.slotReel as any;

    if (!positions || positions.length === 0 || !respectedSymbol) {
      StateManager.doNextStep();
      return;
    }

    const normalScale = slotReel.reelsData?.symbolScale || 0.84;
    const removeStoneFromCrate = this.stoneAnimationManager.createStoneRemoverForCrate(boxName, positions.length);

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

      return this.stoneAnimationManager.createFlightStone(startPos, movingName, spineName, skin, idleAnim);
    };

    this.stoneAnimationManager.flyStonesToSymbols(
      positions,
      boxName,
      createStone,
      () => removeStoneFromCrate(),
      ({ symbol, col, row, endPos, isFinale, reportDone }) => {
        this.stoneAnimationManager.spawnHitParticle(endPos, 1.5);

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

  // FEATURE: Megawin redirect
  // ==================================================================================================================

  private showMegawinRedirect(data: {
    redirectedDrops: Array<{ from: [number, number]; to: [number, number] }>;
    symbol: string;
    triggerPosition?: [number, number];
  }): void {
    const { redirectedDrops, symbol } = data;
    if (!redirectedDrops || redirectedDrops.length === 0) {
      StateManager.doNextStep();
      return;
    }

    const removeStoneFromCrate = this.stoneAnimationManager.createStoneRemoverForCrate('box5', redirectedDrops.length);
    this.stoneAnimationManager.playMegawinTargetDrops(redirectedDrops, symbol, removeStoneFromCrate, () =>
      StateManager.doNextStep(),
    );
  }

  // FEATURE: Multi win
  // ==================================================================================================================

  private showMultiWin(data: any): void {
    const positions: Array<[number, number]> = data.positions || [];
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

  private playMultiplierStoneFlight(
    positions: Array<[number, number]>,
    boxName: string,
    value: number,
    onAllLanded: () => void,
  ): void {
    const slotReel = this.slotReel as any;
    const normalScale = slotReel.reelsData?.symbolScale || 0.84;
    const removeStoneFromCrate = this.stoneAnimationManager.createStoneRemoverForCrate(boxName, positions.length);

    const createStone = (startPos: Point): any => {
      return this.stoneAnimationManager.createFlightStone(
        startPos,
        'SM',
        STONE_CONFIG['SM'].spineName,
        STONE_CONFIG['SM'].skin || '',
        'Win',
      );
    };

    this.stoneAnimationManager.flyStonesToSymbols(
      positions,
      boxName,
      createStone,
      () => removeStoneFromCrate(),
      ({ symbol, endPos, reportDone }) => {
        this.stoneAnimationManager.spawnHitParticle(endPos, 1.2);

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
}
