import { GameSlotMachineView } from '@game/views/slot/GameSlotMachineView';
import GridReelView from '@slots/jokerCharge/views/slot/GridReelView';
import GridReelSymbol from '@slots/jokerCharge/views/slot/GridReelSymbol';
import { GRID_SYMBOL_POOL, GRID_SYMBOL_CLASS_MAP } from '@slots/jokerCharge/config/GridReelsConfig';

export const SLOT_MACHINE_CONFIG: any = {
  name: 'slotMachineView',
  type: 'Comp',
  class: GameSlotMachineView,
  Elements: [
    {
      name: 'guideRect',
      type: 'Graphics',
      color: 0xff0000,
      width: 1400,
      height: 1060,
      alpha: 0,
    },
    {
      name: 'gridReelView',
      type: 'Comp',
      class: GridReelView,
      data: {
        columns: 3,
        rows: 3,
        // TODO: placeholder cell size - adjust once the grid's real dimensions/art are in.
        cellWidth: 300,
        cellHeight: 300,
        defaultSymbolClass: GridReelSymbol,
        symbolPool: GRID_SYMBOL_POOL,
        symbolClassMap: GRID_SYMBOL_CLASS_MAP,
      },
    },
  ],
  layoutData: {
    Desktop: {
      widthPerc: 0.7,
      heightPerc: 0.8,
      hAlign: 'center',
      vAlign: 'middle',
      vPaddingPerc: -0.02,
      hPaddingPerc: 0,
    },
    Portrait: { widthPerc: 1, heightPerc: 0.6, hAlign: 'center', vAlign: 'middle', vPaddingPerc: -0.02 },
    Landscape: { widthPerc: 0.7, heightPerc: 0.94, hAlign: 'center', vAlign: 'middle', vPaddingPerc: 0.002 },
    SmallLandscape: { widthPerc: 0.7, heightPerc: 0.88, hAlign: 'center', vAlign: 'top', vPaddingPerc: 0.002 },
  },
};
