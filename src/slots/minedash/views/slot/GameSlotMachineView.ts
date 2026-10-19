import { Point, Graphics, Container } from 'pixi.js';
import { SlotMachineView } from '@core/views/slotmachine/SlotMachineView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { StateManager } from '@core/states/StateManagerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { UIUtil } from '@core/utils/UIUtilService';
import { GemBoxesComp, BOX_STATE_KEYS, StoneStateData } from '@game/views/comps/GemBoxesComp';
import { StoneAnimationManager, StoneData, STONE_CONFIG } from '@game/views/slot/StoneAnimationManager';
import { MULTIPLIER_BADGE_CONFIG, MULTIPLIER_BADGE_TEXT_STYLE } from '@game/config/screens/StoneTextConfig';
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
    const { height: h, padX, minWidth, shadow, rim, face, text: textPos } = MULTIPLIER_BADGE_CONFIG;

    const label: any = UIUtil.getElement({
      name: 'multiplierBadgeText',
      type: 'Text',
      contentText: `x${value}`,
      style: MULTIPLIER_BADGE_TEXT_STYLE,
    });
    label.anchor?.set(0.5);
    label.position.set(textPos.x, textPos.y);

    const w = Math.max(minWidth, label.width + padX * 2);
    const r = h / 2;

    const bg = new Graphics()
      .roundRect(-w / 2, -r + shadow.offsetY, w, h, r)
      .fill({ color: shadow.color, alpha: shadow.alpha })
      .roundRect(-w / 2, -r, w, h, r)
      .fill(face.color)
      .stroke({ color: rim.color, width: rim.width, alignment: 1 })
      .roundRect(-w / 2 - rim.width, -r - rim.width, w + rim.width * 2, h + rim.width * 2, r + rim.width)
      .stroke({ color: rim.edge, width: 1.5 })
      .roundRect(-w / 2 + 10, -r + 5, w - 20, h * 0.35, h * 0.2)
      .fill({ color: 0xffffff, alpha: face.gloss });

    const container = new Container({ children: [bg, label] });
    container.name = 'multiBadge';

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
