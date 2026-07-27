# Show Platform DisplayMessage in Error Popups - Design

## Context

RGS now propagates a platform-specific, player-facing `displayMessage` (e.g. FEG's localized `DisplayMessage`, naming the player's exact daily betting limit) end-to-end through pack-alpha's error response, at `extensions.public.displayMessage`. Today this text never reaches the player - the frontend only ever shows a small set of generic, locally-curated bucket messages (`generic_error`, `session_expired_error`, etc.), regardless of what specific reason the platform actually gave.

### Current-state findings (investigation, not assumptions)

1. `SlotGameApp.ts`'s `onServerError` (the handler for `/spin`/bet-win-time errors) has a dead-code bug:
   ```js
   data.message = obj?.data?.extensions?.code ? Util.getContent(ERROR_CODES[obj?.data?.extensions?.code]) : null;
   if (!data.msg) {                 // `.msg` is never assigned anywhere in this file
     data.message = Util.getContent('generic_error');   // always overwrites the line above
   }
   ```
   `data.msg` is never set - only `data.message` is. `!data.msg` is unconditionally `true`, so every server error today shows the generic bucket text, regardless of whether `ERROR_CODES` had a correct, specific mapping. This defeats the entire `ERROR_CODES` table today, not just for this feature.
2. `displayInitError` (the handler for `/init`-time errors) does not have this bug - it already falls back through `ERROR_CODES` mapped text, then `obj?.data?.message`, then `generic_error`. `/init` hits the same FEG wallet and can return the same error catalog (e.g. `"Session expired."`), so it's a valid second surface for `displayMessage`.
3. `displayMessage` is referenced nowhere in this repo today - confirmed by grep.
4. `Util.getContent(str)` (`UtilService.ts:68-75`) on an undefined/missing content key returns `undefined` without throwing - `parseMessage`'s replace loop never executes when the format-args array is empty (the default), so it just returns the input unchanged. This means a code with no `ErrorCodes.ts` entry safely falls through to the generic bucket once the `.msg` bug is fixed - no crash risk from missing entries.
5. `MessagePopupView.ts`'s `codeText` badge already displays the raw numeric error code (`data.code`) next to the message - no change needed there, it will simply show whichever code (e.g. 2500) the backend sent.

## Goals

- The player sees FEG's specific, accurate, localized `displayMessage` when the platform provides one, instead of a generic bucket message.
- `/init`-time and `/spin`-time (bet/win) errors both benefit, since both can originate from the same FEG wallet error catalog.
- No regression to the existing fallback behavior (generic bucket text, offline message) for errors that don't carry a `displayMessage`.

## Design

**File:** `feg_games_src/src/corelib/app/SlotGameApp.ts` only.

**Fix 1 - the dead-code bug** (`onServerError`): change `if (!data.msg)` to `if (!data.message)`, so a message already resolved by the line above (or, after Fix 2, by `displayMessage`) is no longer unconditionally discarded.

**Fix 2 - prefer `displayMessage`** in both error paths, ahead of the existing `ERROR_CODES`-mapped generic text:

- `onServerError`:
  ```js
  data.message = obj?.data?.extensions?.public?.displayMessage
    ?? (obj?.data?.extensions?.code ? Util.getContent(ERROR_CODES[obj?.data?.extensions?.code]) : null);
  ```
  The rest of the existing fallback chain (generic bucket text if `extensions` present, offline message otherwise) is unchanged, now gated on the fixed `!data.message` check.

- `displayInitError`:
  ```js
  let msg = obj?.data?.extensions?.public?.displayMessage
    ?? (obj?.data?.extensions?.code ? Util.getContent(ERROR_CODES[obj?.data?.extensions?.code]) : obj?.data?.message);
  ```
  Unchanged fallback to `generic_error` if still falsy.

**No `ErrorCodes.ts` changes** - confirmed safe to omit; missing entries for the four new RGS codes (2500-2503) fall through to the generic bucket exactly as any other unmapped code does today, per finding 4 above.

**Accepted tradeoff (explicit user decision):** `displayMessage` is shown verbatim, unreviewed by the game studio's own content/translation team ahead of time - the platform's copy, in whatever language its lobby locale produced. Confirmed acceptable.

## Explicitly Out of Scope

- Adding `ErrorCodes.ts` entries for the new codes (2500-2503) - not needed, per finding 4.
- Any secondary/curated-message-plus-platform-detail display pattern - `displayMessage` is shown as the primary message, not supplementary text.
- Any change to `MessagePopupView.ts` or the `codeText` badge - already displays whatever numeric code is sent, no change needed.

## Testing Notes

(Per project convention, tests are not written unless explicitly requested. This section is for the implementer's own manual verification during development.)

- Trigger a bet-time error carrying a `displayMessage` (e.g. replay the betting-limit-exceeded scenario end-to-end) and confirm the popup shows FEG's exact text, not `generic_error`.
- Trigger a bet-time error with no `displayMessage` (e.g. a genuinely unmapped/unknown code) and confirm the popup still shows `generic_error` text, unchanged from today.
- Trigger an offline/network-level failure (no `extensions` at all) and confirm the offline-message path is unaffected.
- Trigger an `/init`-time error with a `displayMessage` and confirm `displayInitError` shows it.
