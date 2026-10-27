# Diagnosis S-1: setup parts after the claim stay "Still loading"

Tip `07a3dfe6a1` (tranche/T51); copy biosmoke8 (0.86.0). Read-only; no product change.

## Root cause (confirmed live and in a unit run)

`bio-plane/src/screens-entry/setup.mjs` declares two module-level constants, `ZONE_PATH` (line 23) and `ZONES` (line 24), and uses them inside screen functions: `reads` (line 42, `zone: {op: "factstatus", query: {path: ZONE_PATH}}`), `render` (256, 267, 268) and an act's `body` (498, `path: ZONE_PATH`).

The served page carries each screen as the function's own text: `interface-shell/index.mjs:236-246` `toSource` is `fn.toString()`, per the screen contract R21 ("self-contained"). Module scope does not travel. In the shipped bundle (`/app/shell-0.86.0.js`) the `setup` screen's `reads` still reads `query:{path:ZONE_PATH}`, and `ZONE_PATH` is declared nowhere in the bundle (`grep -c` finds one occurrence, the use). So on the page `reads(view)` throws `ReferenceError: ZONE_PATH is not defined` when it reaches the founder branch (the early returns for a visitor or a handle-less founder do not touch it, which is why the claim itself works).

`browser.mjs:446` `readAll` wraps the call: `try { specs = inst.spec.reads(inst.view) || {} } catch { specs = {} }`. The ReferenceError is swallowed, `specs` is `{}`, no read is sent, nothing is drawn as "failed", the parts keep `{state: "loading"}`'s absence ("Still loading"), no console error. `readsOf` (line 389) has the same catch, so no re-read ever finds the reads either.

The hypothesis of the brief is refuted: `whoami` is right and `ME` is set before `show()` (route, browser.mjs:1626-1635).

## Evidence

Live, signed in as the founder through the front screen, Chromium through the proxy, values not printed:
- `whoami` keys: tokenClass, session, member, handle, administer, rootOfTrust, capabilities, vocabulary, confinedTo, detail. Types: session boolean true, member string, handle string, rootOfTrust true, administer true. So every field `reads` tests is present and right.
- Request ops after `goto /app/setup` (8 s): whoami, interfacewords, wizardsat, bootstrap, assistantstate, accountreference, subscriptionsignin, groupkeystate, interfacewords. None of groupidentity, recoverycodesstate, profiles, factstatus, placewantedstate, ...
- Instrumented copy of the served shell (a test-only local rewrite in my own browser; nothing sent to the copy): `readAll m setup`, ME true, S true, ME keys as above, `specs 0`. Other screens (home) got 17 specs in the same session.
- Unit: `toSource(setup.reads)` evaluated outside the module throws `ReferenceError: ZONE_PATH is not defined`.

When it broke: `git log -S ZONE_PATH` gives only `35627dcb71` (screens-entry R34, "the team's time zone step", 2026-10-26), merged by `f88c07c57f`/`c0ceb21aec`. Before it, setup.mjs had no module-level `const`, so alpha walk A and re-walk 10 (copy already claimed in A.md; setup parts not reached in rewalk10-A either) could not have shown it earlier. No interface-shell change is involved.

## Why the tests missed it

`bio-plane/test/m/screens-entry/kit.mjs` `open()` imports `SCREENS` from `screens-entry/index.mjs` and calls the module's own functions, where `ZONE_PATH` and `ZONES` are in scope (setup.test.mjs `claimed()`/`returned()`). `page.test.mjs` boots `interfacePage(SCREENS)` but only for the claim, the no-session frame and the sign-in hand-over, never a signed founder's reads or the zone step. The shell's catch hides the throw.

## Owner and smallest fix

Owner: module `screens-entry` (setup.mjs). Fix: no module-scope values used by a screen function. Move `ZONE_PATH` and `ZONES` inside each function that uses them (`reads`, `render`, the act body function), or put them in `parts`/the screen object read as `view.parts`, or write the literals. Four use sites: lines 42, 256-268, 498. Nothing else changes. Worth a sweep of the other screen modules for module-level constants used inside screen functions (not done here).

Hardening (shell, optional, separate): `readAll`'s `catch { specs = {} }` should surface a failed `reads` (a console error and a refusal drawn), so this class is loud.

## Test red now at the walker's case

In `bio-plane/test/m/screens-entry/` (verified red at the tip: `ReferenceError: ZONE_PATH is not defined`; green once the constants are inside the functions):

```js
import { toSource } from "../../../src/interface-shell/index.mjs";
const asPage = (fn) => (0, eval)("(" + toSource(fn) + ")");   // as served: no module scope
test("S-1 setup: the founder's reads, as the served page holds them", () => {
  const setup = SCREENS.find((s) => s.id === "setup");
  const me = { session: true, member: "m1", handle: "sparky", rootOfTrust: true, administer: true };
  const reads = asPage(setup.reads)({ me });
  assert.deepEqual(Object.keys(reads).sort(), Object.keys(setup.reads({ me })).sort());
  assert.deepEqual(reads.zone, { op: "factstatus", query: { path: "@team/time_zone" } });
});
```
Also run `render` and the act body through `asPage` (the same ReferenceError awaits there on `ZONES`/`ZONE_PATH`), and a page-level case: `interfacePage(SCREENS)` booted with a signed founder who has a handle, at `/app/setup`, expecting `factstatus` and `recoverycodesstate` among the requests.

## Confidence

High (about 95%): the throw is reproduced on the shipped bundle's text, the missing declaration is shown in the served file, and the swallowed catch matches every symptom (no request, no error, loading forever). Not run: the fix itself on the copy (read-only).
