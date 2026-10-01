// One beat of an animation sequence. It calls onComplete when it has finished, and steps run in
// order, each starting when the last one ends.
export type EffectStep = (onComplete: () => void) => void;

// Runs the steps in order and calls onComplete after the last of them.
export function playEffectSteps(steps: EffectStep[], index: number, onComplete: () => void): void {
  if (index >= steps.length) {
    onComplete();
    return;
  }
  steps[index](() => playEffectSteps(steps, index + 1, onComplete));
}

// One beat made of several effects at once: it ends when the last of them does.
export function playTogether(onComplete: () => void, ...effects: EffectStep[]): void {
  let remaining = effects.length;
  effects.forEach((effect) =>
    effect(() => {
      if (--remaining === 0) onComplete();
    }),
  );
}

// Every column index of a top-panel row, for the effects that cover the whole grid.
export function everyColumn(modifierRow: string[]): number[] {
  return modifierRow.map((_, column) => column);
}
