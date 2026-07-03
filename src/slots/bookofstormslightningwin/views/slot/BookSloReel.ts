import SlotReelStandard from '@core/views/slotmachine/SlotReelStandard';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { Sine } from 'gsap';
import { StateManager } from '@core/states/StateManagerService';
import { SlotEvents } from '@core/events/SlotEvents';

export class BookSlotReel extends SlotReelStandard {
  private totalAnims: number;
  private animIndex: number;

  constructor(config: any) {
    super(config);
    EventHandler.addEventListener(SlotEvents.SHOW_SYMBOL_EXPANSION, this.showSymbolExpansion.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_LIGHTNING_STRIKE, this.showLightningStrike.bind(this));
  }

  protected showSymbolExpansion(): void {
    const expansionData = appModel.getSymbolExpansionData();
    if (!expansionData) {
      StateManager.doNextStep();
      return;
    }

    const { expandedReels, expandedReelView, initialReelView } = expansionData;
    if (!expandedReels || expandedReels.length === 0) {
      StateManager.doNextStep();
      return;
    }

    // Get unique reels to expand
    const reelsToExpand = [...new Set(expandedReels.map((pos: number[]) => pos[0]))];

    this.totalAnims = reelsToExpand.length;
    this.animIndex = 0;

    reelsToExpand.forEach((reelIndex: any) => {
      // Get the specific rows on this reel that are part of the expansion
      const reelExpandedPositions = expandedReels.filter((pos: number[]) => pos[0] === reelIndex);

      const rowsToAnimate: number[] = [];
      const rowsToGlow: number[] = [];
      let specialSymbolConfig: any = null;

      reelExpandedPositions.forEach((pos: number[], index: number) => {
        const row = pos[1];
        rowsToGlow.push(row);

        const currentSymbolName = initialReelView[reelIndex][row + 1];
        const expandedSymbolName = expandedReelView[reelIndex][index];

        if (!specialSymbolConfig) {
          specialSymbolConfig = this.reelsData.symbolsData[expandedSymbolName];
        }

        if (currentSymbolName !== expandedSymbolName) {
          rowsToAnimate.push(row);
        }
      });

      const applyGlowToExpanded = () => {
        rowsToGlow.forEach((row) => {
          const targetSymbol = this.symbolsArray[reelIndex][row + 1];
          if (typeof (targetSymbol as any).showGlowCard === 'function') {
            (targetSymbol as any).showGlowCard();
          }
        });
      };

      if (rowsToAnimate.length === 0) {
        // All symbols are already matching, just add glow and finish
        applyGlowToExpanded();
        this.onSymbolExpansionAnimEnd();
        return;
      }

      // Step 1: Animate non-matching symbols inwards (shrink to scale 0)
      let shrinkCompletedCount = 0;
      rowsToAnimate.forEach((row) => {
        const symbol = this.symbolsArray[reelIndex][row + 1];
        if (symbol) {
          AnimationProxy.animateTween(symbol.scale, {
            duration: 0.5,
            x: 0,
            y: 0,
            ease: Sine.easeIn,
            onComplete: () => {
              shrinkCompletedCount++;
              if (shrinkCompletedCount === rowsToAnimate.length) {
                // Step 2: Once shrunk, change the symbol textures to the special symbol and animate outwards
                let growCompletedCount = 0;
                rowsToAnimate.forEach((r) => {
                  const targetSymbol = this.symbolsArray[reelIndex][r + 1];
                  targetSymbol.setNewSymbol(specialSymbolConfig, reelIndex);

                  EventHandler.dispatchEvent(SlotEvents.PLAY_SYMBOL_EXPANSION);

                  AnimationProxy.animateTween(targetSymbol.scale, {
                    duration: 0.6,
                    x: this.reelsData.symbolScale,
                    y: this.reelsData.symbolScale,
                    ease: Sine.easeOut,
                    onComplete: () => {
                      growCompletedCount++;
                      if (growCompletedCount === rowsToAnimate.length) {
                        applyGlowToExpanded();
                        this.onSymbolExpansionAnimEnd();
                      }
                    },
                  });
                });
              }
            },
          });
        } else {
          // Fallback if symbol is undefined
          shrinkCompletedCount++;
        }
      });
    });
  }

  protected showLightningStrike(): void {
    const lightningData = appModel.getReelModifiers()?.[0];
    if (!lightningData?.lightningStrikeWildPositions?.length) {
      StateManager.doNextStep();
      return;
    }

    const wildSymbolConfig = this.reelsData.symbolsData['WD'];
    const items = lightningData.lightningStrikeWildPositions.map(([reelIndex, row]: number[]) => {
      const symbol = this.symbolsArray[reelIndex]?.[row + 1];
      const bounds = symbol?.getBounds();
      return {
        x: bounds?.x + bounds?.width / 2,
        y: bounds?.y + bounds?.height / 2,
        onEventEmit: () => symbol?.setNewSymbol(wildSymbolConfig, reelIndex),
      };
    });

    EventHandler.dispatchEvent(SlotEvents.SHOW_WILD_TRANSITION, {
      items,
      onComplete: () => StateManager.doNextStep(),
    });
  }

  protected onSymbolExpansionAnimEnd(): void {
    this.animIndex++;
    if (this.animIndex === this.totalAnims) {
      StateManager.doNextStep();
    }
  }
}
