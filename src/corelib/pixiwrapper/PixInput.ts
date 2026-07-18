import { Input, type InputOptions } from '@pixi/ui';
import { CanvasTextMetrics } from 'pixi.js';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';

/** Options accepted by PixInput on top of the base @pixi/ui Input options. */
export interface PixInputOptions extends InputOptions {
  /**
   * Restrict input to a numeric amount: digits plus a single decimal point.
   * Invalid characters are dropped as the user types, with the caret preserved.
   * Leading zeros are allowed while typing ("09") and left for the app to
   * normalise on commit. Default: false.
   */
  numeric?: boolean;
  /** Max decimal places when `numeric` is on. Default: 2. */
  decimals?: number;
  /**
   * Max number of integer (pre-decimal) digits when `numeric` is on. Extra
   * integer digits are dropped as the user types. Default: unlimited. Prefer
   * {@link PixInput.setMaxValue} when you have the max allowed value, so the
   * digit count is derived for you.
   */
  maxIntegerDigits?: number;
  /**
   * Max allowed numeric value when `numeric` is on. PixInput derives the
   * integer-digit cap from this (e.g. 1000 -> 4 digits). Usually set at runtime
   * via {@link PixInput.setMaxValue} once the limit is known (e.g. a slider max).
   */
  maxValue?: number;
}

/**
 * PixInput fixes @pixi/ui Input on mobile (Android in particular) and adds
 * optional numeric-input handling.
 *
 * The stock Input reconstructs its value from `keydown` events and wipes the
 * backing DOM <input> (`input.value = ''`) after every keystroke. Android soft
 * keyboards / IMEs deliver composed or `Unidentified` keydown events out of
 * order, which corrupts the reconstructed value:
 *   - "123" is displayed as "312" (reorder)
 *   - "12.3" is displayed as "126" (decimal dropped / chars reordered)
 *
 * The real DOM <input> already handles IME composition, caret position and
 * ordering correctly. This subclass makes the DOM element the single source of
 * truth: on every native `input` event we copy `input.value` straight into the
 * pixi Input's value and re-emit onChange, and we stop the base class from
 * clearing the DOM value. Special keys (Enter/Escape) still commit/close.
 *
 * With `numeric: true` the value is sanitised (digits + single dot, capped to
 * `decimals` places) directly here, with the caret preserved, so consumers'
 * onChange handlers receive already-clean text and never have to fight the
 * caret. On-screen caret tracks the real DOM caret so Left/Right/Home/End/click
 * all move it.
 */
export class PixInput extends Input {
  declare protected options: PixInputOptions;

  // Caret index into the value (0 = before first char). Mirrors the DOM
  // <input>'s selectionStart so the on-screen cursor sits at the real edit
  // position, and Left/Right/Home/End/click all move it.
  private caretIndex = 0;

  // Watches for taps anywhere while editing. A tap NOT on this field (the
  // modal, the panel, another control, empty space) commits and closes the
  // keyboard. Registered only while editing (see createInputField/stopEditing).
  // While editing the base DOM <input> overlays the field, so a tap on the
  // field has that <input> as its event target — that is our "inside" signal.
  private readonly onDocumentPointerDown = (e: Event): void => {
    if (!this.editing || !this.input) return;
    const pe = e as PointerEvent;
    // Keep the keyboard open only for taps on the visible field itself; any tap
    // outside it (modal, panel, another control, empty space) closes it. Tested
    // against the field's on-screen rectangle so it is reliable on mobile, where
    // the tap target is the canvas rather than the (offset) DOM <input>.
    if (this.isPointOnField(pe.clientX, pe.clientY)) return;
    this.activation = false; // stop the base handler re-opening on this tap
    this.closeKeyboard();
  };

  // Is a viewport (client) coordinate inside the visible field's rectangle?
  private isPointOnField(clientX: number, clientY: number): boolean {
    const canvas =
      document.querySelector<HTMLCanvasElement>('#gameStage canvas') ??
      document.querySelector<HTMLCanvasElement>('canvas');
    const cr = canvas?.getBoundingClientRect();
    if (!cr) return false;

    const res = DeviceProxy.config?.appResolution || 1;
    const b: any = this.getBounds();
    const r = b?.rectangle ?? b; // pixi v8 Bounds.rectangle, or v7 Rectangle
    const left = cr.left + r.x / res;
    const top = cr.top + r.y / res;
    const right = left + r.width / res;
    const bottom = top + r.height / res;
    return clientX >= left && clientX <= right && clientY >= top && clientY <= bottom;
  }

  // Max integer digits for numeric mode (0 / undefined = unlimited).
  private maxIntegerDigits = 0;

  /**
   * Cap the number of integer (pre-decimal) digits accepted in numeric mode.
   * Pass the digit count directly, e.g. 4 to allow up to 4 integer digits.
   * A value <= 0 removes the cap.
   */
  public setMaxIntegerDigits(count: number): void {
    this.maxIntegerDigits = count > 0 ? Math.floor(count) : 0;
  }

  /**
   * Cap input by the maximum allowed VALUE. PixInput derives the integer-digit
   * cap from it (e.g. 1000 -> 4 digits), so callers don't repeat that maths.
   * A value <= 0 removes the cap.
   */
  public setMaxValue(value: number): void {
    const intPart = Math.floor(Number(value) || 0);
    this.setMaxIntegerDigits(intPart > 0 ? String(intPart).length : 0);
  }

  // Resolve the effective integer-digit cap: runtime setter wins, then the
  // maxValue option, then the maxIntegerDigits option, else unlimited (0).
  private resolveMaxIntegerDigits(): number {
    if (this.maxIntegerDigits > 0) return this.maxIntegerDigits;
    const optMax = Math.floor(Number(this.options.maxValue) || 0);
    if (optMax > 0) return String(optMax).length;
    return this.options.maxIntegerDigits || 0;
  }

  // Sync value from the DOM element instead of from keydown reconstruction.
  protected onInput(e: InputEvent): void {
    super.onInput(e);
    if (!this.editing || !this.input) return;

    let domValue = this.input.value;
    let caret = this.input.selectionStart ?? domValue.length;

    // Numeric mode: strip anything that can never be valid, keeping the caret
    // aligned to the characters that survive.
    if (this.options.numeric) {
      const maxIntDigits = this.resolveMaxIntegerDigits();
      const sanitized = PixInput.sanitizeNumeric(domValue, caret, this.options.decimals ?? 2, maxIntDigits);
      domValue = sanitized.value;
      caret = sanitized.caret;
    }

    // Preserve the base class maxLength behaviour (base enforced it in _add,
    // which we no longer route through).
    const max = this.options.maxLength;
    if (max && domValue.length > max) {
      domValue = domValue.slice(0, max);
      caret = Math.min(caret, max);
    }

    // Reflect the (possibly rewritten) value + caret back into the DOM so the
    // display and the native caret stay in sync.
    if (this.input.value !== domValue) {
      this.input.value = domValue;
      this.input.setSelectionRange?.(caret, caret);
    }
    this.caretIndex = caret;

    if (domValue === this.value) return;
    this.value = domValue; // setter re-renders the display text + re-aligns
    this.onChange.emit(this.value);
  }

  // Characters (and Backspace) are already reflected by the native `input`
  // event, so skip keydown-based reconstruction and, crucially, do NOT clear
  // `this.input.value` (the base class does, which breaks Android). Only handle
  // the control keys that commit or close the field.
  protected onKeyUp(e: KeyboardEvent): void {
    if (e.metaKey || e.ctrlKey) return;
    if (e.key === 'Enter' || e.key === 'Escape') {
      this.stopEditing();
    }
  }

  // The DOM <input> is our source of truth while editing. When code sets the
  // value programmatically (e.g. onChange handlers clamping input), the base
  // setter only updates the pixi display and leaves the DOM stale, so the next
  // keystroke re-reads the old text. This kept the field "frozen" after invalid
  // input. Mirror every programmatic change into the DOM element too.
  set value(text: string) {
    super.value = text;
    if (this.input && this.input.value !== text) {
      this.input.value = text;
    }
  }

  get value(): string {
    return super.value;
  }

  /** Current caret index (mirrors the DOM <input> selectionStart). */
  public getCaret(): number {
    return this.input?.selectionStart ?? this.caretIndex;
  }

  /**
   * Set the value AND the caret position in one shot, keeping the DOM <input>,
   * the pixi display and the on-screen cursor in sync. Use this from onChange
   * handlers that clamp input, so rewriting the text does not shove the caret
   * to the end.
   * @param text - the new value
   * @param caret - caret index to place; defaults to end of text
   */
  public setValue(text: string, caret: number = text.length): void {
    this.value = text; // setter mirrors into this.input.value too
    const pos = Math.max(0, Math.min(caret, text.length));
    this.caretIndex = pos;
    this.input?.setSelectionRange?.(pos, pos);
    this.align();
  }

  /** Whether the field is currently being edited (keyboard open). */
  public get isEditing(): boolean {
    return this.editing;
  }

  /**
   * Commit and dismiss the on-screen keyboard, if open. Safe to call when not
   * editing. Use this to close the keyboard on outside interactions (tapping
   * the modal, the panel, another control, etc.).
   */
  public closeKeyboard(): void {
    if (this.editing) this.stopEditing();
  }

  // The base class always creates a fresh, EMPTY DOM <input> when editing
  // starts, even if the field already holds a value. Because we drive editing
  // from the DOM, an empty DOM means Backspace has nothing to delete and no
  // `input` event fires, so refocusing an existing value left it uneditable.
  // Seed the DOM with the current value and put the caret at the end.
  protected createInputField(): void {
    super.createInputField();
    if (this.input && !this.options.cleanOnFocus) {
      this.input.value = this.value;
      const end = this.value.length;
      // On Android focus is deferred (setTimeout), so defer the caret too.
      this.input.setSelectionRange?.(end, end);
    }
    this.caretIndex = this.value.length;

    // While editing, watch for taps outside this field to close the keyboard.
    document.removeEventListener('pointerdown', this.onDocumentPointerDown, true);
    document.addEventListener('pointerdown', this.onDocumentPointerDown, true);
  }

  // Tear down the outside-tap watcher whenever editing ends (Enter/Escape,
  // blur, or closeKeyboard()).
  protected stopEditing(): void {
    document.removeEventListener('pointerdown', this.onDocumentPointerDown, true);
    super.stopEditing();
  }

  // Keep the pixi caret glued to the DOM caret. The base `update` tick already
  // runs every frame while editing (it blinks the cursor), so poll
  // selectionStart here: this catches arrow keys, Home/End, mouse clicks and
  // touch selection uniformly without wiring a listener per event type.
  protected update(dt: number): void {
    super.update(dt);
    if (!this.editing || !this.input) return;
    const domCaret = this.input.selectionStart ?? this.value.length;
    if (domCaret !== this.caretIndex) {
      this.caretIndex = domCaret;
      this.align(); // repositions the cursor via getCursorPosX()
    }
  }

  // Draw the cursor at the actual caret index instead of always at the end.
  // The displayed text (inputField.text) is used for measurement so it stays
  // correct in secure mode (where each char shows as '*', still 1:1 by index).
  protected getCursorPosX(): number {
    const field: any = (this as any).inputField;
    if (!field) return 0;

    const display: string = field.text ?? '';
    const caret = Math.max(0, Math.min(this.caretIndex, display.length));
    const before = display.slice(0, caret);

    // Width of the text left of the caret, in the field's own style.
    const widthBefore = before.length ? CanvasTextMetrics.measureText(before, field.style).width : 0;

    // field.x is anchored at field.anchor.x, so the visual left edge is:
    const anchorX = field.anchor?.x ?? 0;
    const leftEdge = field.x - field.width * anchorX;
    return leftEdge + widthBefore;
  }

  /**
   * Sanitise a raw amount string as a numeric field and report where the caret
   * should land. Strips characters that can never be valid (non-digits, extra
   * decimal points, decimals beyond `maxDecimals`) and enforces `maxIntDigits`.
   * Leading zeros are intentionally preserved (normalise them on commit).
   *
   * When there are too many integer digits, the excess is removed from the
   * digits ENDING AT the caret (i.e. the ones just typed), not from the end of
   * the number. So with a 4-digit cap, "55.00" + typing "000" before the first
   * 5 gives "0055.00" (one of the three new zeros is rejected), not "0005.00".
   * @param maxIntDigits - max integer digits, 0 = unlimited
   */
  private static sanitizeNumeric(
    text: string,
    caret: number,
    maxDecimals: number,
    maxIntDigits = 0,
  ): { value: string; caret: number } {
    // Pass 1: strip invalid chars and cap decimals only (no integer cap yet).
    let out = '';
    let dotUsed = false;
    let decimals = 0;
    let newCaret = 0;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      let keep = false;

      if (ch >= '0' && ch <= '9') {
        if (dotUsed) {
          if (decimals < maxDecimals) {
            decimals++;
            keep = true;
          }
        } else {
          keep = true; // integer digit: keep for now, integer cap applied below
        }
      } else if (ch === '.' && !dotUsed && maxDecimals > 0) {
        dotUsed = true;
        keep = true;
      }

      if (keep) out += ch;
      if (i < caret && keep) newCaret++;
    }

    if (maxIntDigits <= 0) return { value: out, caret: newCaret };

    // Pass 2: enforce the integer-digit cap. Count integer digits (everything
    // before the first '.').
    const dotAt = out.indexOf('.');
    const intEnd = dotAt === -1 ? out.length : dotAt;
    let intDigitCount = 0;
    for (let i = 0; i < intEnd; i++) {
      if (out[i] >= '0' && out[i] <= '9') intDigitCount++;
    }

    let excess = intDigitCount - maxIntDigits;
    if (excess <= 0) return { value: out, caret: newCaret };

    // Remove `excess` integer digits, taking them from just LEFT of the caret
    // (the freshly typed ones). Walk left from the caret; if there aren't enough
    // there, continue removing from the remaining integer digits to the right.
    const chars = out.split('');
    const removeAt: boolean[] = new Array(chars.length).fill(false);

    const isIntDigit = (idx: number) => idx < intEnd && chars[idx] >= '0' && chars[idx] <= '9';

    // First sweep: leftwards from the caret.
    for (let i = newCaret - 1; i >= 0 && excess > 0; i--) {
      if (isIntDigit(i)) {
        removeAt[i] = true;
        excess--;
      }
    }
    // Second sweep (rare): rightwards from the caret if still over cap.
    for (let i = newCaret; i < intEnd && excess > 0; i++) {
      if (isIntDigit(i)) {
        removeAt[i] = true;
        excess--;
      }
    }

    let finalOut = '';
    let finalCaret = 0;
    for (let i = 0; i < chars.length; i++) {
      if (removeAt[i]) continue; // dropped; a removal left of the caret shifts it left
      finalOut += chars[i];
      if (i < newCaret) finalCaret++;
    }

    return { value: finalOut, caret: finalCaret };
  }
}
