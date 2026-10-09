// Every field is optional - some elements (topPanelBg/topPanelFrame) only need showing, others
// only a scale.
export interface BonusLayoutOverride {
  x?: number;
  y?: number;
  alpha?: number;
  // Prefer this over alpha where the element has nothing to fade: alpha 0 still renders.
  visible?: boolean;
  scaleX?: number;
  scaleY?: number;
}

// Per-element x/y/alpha applied by GameSlotMachineView.setBonusTriggerLayout(true), keyed by
// element name in SlotMachineConfig.ts's Elements array; setBonusTriggerLayout(false) restores
// each element's original values.
//
// These are machine-space coordinates and the machine's internal layout is the same in every
// orientation (only the whole comp's scale and screen position change), so all three orientations
// share one map. The buy/lines row is not listed here: it is hidden outright for the duration of
// the feature, in GameSlotMachineView.setBonusTriggerLayout.
type ElementLayoutMap = Record<string, BonusLayoutOverride>;

const DESKTOP_BONUS_TRIGGER_LAYOUT: ElementLayoutMap = {
  reelsBgDark: { x: 0, y: 133 },
  reelbgAnim: { scaleX: 0.66, scaleY: 0.81 },
  reelsFrame: { x: 0, y: 450 },
  topPanelBg: { visible: true },
  topPanelFrame: { visible: true },
  bonusReelsContainer: { visible: true },
  logoComp: { x: 0, y: -70 },
  holdNWinReelsContainer: { x: 706, y: 617 },
  jackpotLabelsComp: { x: 0, y: -72 },
  respinCounterComp: { x: 706, y: 1103 },
  // Faded rather than hidden: ReelTickerComp sets its own visible back on every round's
  // CLEAR_ROUND, which would bring it back mid-feature.
  tickerComp: { alpha: 0 },
  // Same reason: autoplay can carry on into the feature, and the counter shows itself for it.
  fsAutoCounterComp: { alpha: 0 },
};

export const BONUS_TRIGGER_LAYOUT: Record<'Desktop' | 'Portrait' | 'Landscape', ElementLayoutMap> = {
  Desktop: DESKTOP_BONUS_TRIGGER_LAYOUT,
  Portrait: DESKTOP_BONUS_TRIGGER_LAYOUT,
  Landscape: DESKTOP_BONUS_TRIGGER_LAYOUT,
};
