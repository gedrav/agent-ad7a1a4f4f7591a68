// x/y are optional - some elements (topPanelBg/topPanelFrame) only need alpha changed.
export interface BonusLayoutOverride {
  x?: number;
  y?: number;
  alpha?: number;
}

// Per-element x/y/alpha applied by GameSlotMachineView.setBonusTriggerLayout(true), keyed by
// element name in SlotMachineConfig.ts's Elements array; setBonusTriggerLayout(false) restores
// each element's original values.
//
// TODO: Portrait/Landscape are duplicated from Desktop as a placeholder until real per-orientation
// positions exist.
type ElementLayoutMap = Record<string, BonusLayoutOverride>;

const DESKTOP_BONUS_TRIGGER_LAYOUT: ElementLayoutMap = {
  reelsBgDark: { x: 0, y: 133 },
  reelsFrame: { x: 0, y: 133 },
  topPanelBg: { alpha: 1 },
  topPanelFrame: { alpha: 1 },
  bonusReelsContainer: { alpha: 1 },
  logoComp: { x: 0, y: -70 },
  holdNWinReelsContainer: { x: 706, y: 617 },
  jackpotLabelsComp: { x: 0, y: -72 },
  respinCounterComp: { x: 706, y: 1103 },
};

export const BONUS_TRIGGER_LAYOUT: Record<'Desktop' | 'Portrait' | 'Landscape', ElementLayoutMap> = {
  Desktop: DESKTOP_BONUS_TRIGGER_LAYOUT,
  Portrait: DESKTOP_BONUS_TRIGGER_LAYOUT,
  Landscape: DESKTOP_BONUS_TRIGGER_LAYOUT,
};
