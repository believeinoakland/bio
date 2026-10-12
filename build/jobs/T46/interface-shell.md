# interface-shell (T46)

**Status** · session_01XVWdr7BFN9RvWdPQ9aPzuZ · depth 2 · WORKING · handled B7

## J1 · REPORT

**The screen contract, fixed by the shell (R21 and its kit), for the four screen jobs' questions (SCREENS-DAILY J1, SCREENS-SETTINGS J1, SCREENS-INTAKE J1 Q1, SCREENS-INQUIRY J1).** I adopt SCREENS-DAILY #1's reading as the shape, with these additions, so the four may build to it now; please relay. The code will be on `job/T46/interface-shell` shortly, the stand-in DOM and a harness under `bio-plane/test/m/interface-shell/` for their tests.

1. `SCREENS`: `[{id, reads, render, acts, words}]`, every function self-contained (only its parameters, `cs`, and the language's own globals: `JSON`, `Math`, `String`, `Number`, `Array`, `Object`, `Date`). `words`: the keys the screen may draw: a string is a key of `WORD_ROWS` (or the shell's), a `[key, en, protected]` row is the module's own `SCREEN_WORDS` row (the shell takes its English from it). Optional `place(view)` → `{project: {id, title}}` for the path's project step (R8).
2. `reads(view)` → `{name: {op, query?, body?, empty?(value)}}`; `view.data[name]` = `{state: "loading"|"empty"|"failed"|"ok", value, refusal}` (`refusal` `{code, words}` when refused; `value` the answer's `result`).
3. `render(cs, view)` → HTML string; `view` = `{subject, data, me (whoami), ui, reachable}`; `cs.set(name, value)` sets `view.ui[name]` and redraws.
4. `acts`: `[{op, label?, send(view, el, cs, extra) → {query?, body?, raw?} | null, done?(view, answer, cs), rereads?: [names], refusals?: {CODE: key}, dialog?: [{name, label}], outward?: true, reasonField?: "reason"}]`. The screen draws `cs.act(op, {label, data, tone})` ("" when R12 refuses it); `el.dataset` carries `data`. Friction by weight is the shell's: a reasoned act's reason is added to the body as `reason` (or `reasonField`), a dialog's fields arrive as `extra.fields`. `null` from `send` sends nothing; `{refuse: key}` draws that word beside the act. After success, `done`, then the reads named in `rereads` (all when absent).
5. `cs`: `w(key, fills)`, `esc`, `state(outcome | readName, inner(value), {empty: key})` (also `state(readName, view, inner)`), `act`, `can(op)`, `go(screen, subject)`, `set`, `value(id)`, `file(id)`, `ref(kind, id, text, facts[])`, `mark(family, value, fills)` (`mark.<family>.<value>.name`/`.means`), `grade(scale, letter)`, `due(iso, state)`, `hint(text?)`, `date(iso, {year})` (R6), `row`, `rows({cols, items, key, cells, acts, pick})` (R19), `sec(titleKey, inner, {help})`, `sheet`, `field(id, labelKey, {area, value, rec, help})`, `choice`, `checks`, `title(text, {thing})`.

## J2 · QUESTION

**R11: an op in `RUNG_ABSENT` drawn as reasoned also takes reasoned friction (asks a reason before sending).** R11 says such an op is "drawn as reasoned (DEC-87)" and "friction follows the weight", so read literally every `RUNG_ABSENT` act asks the member's reason in place and sends it as `reason`: among T46's screens `memberadd`, `groupkeyset`, `accountreferenceset`, `subscriptionsignin`, `notewrite`, `noterevise`, `openoriginal`, `openwithwarning`, `deepercheck`, `captureupload`, `promote`, `inboxpull`, `setpassword`, `memberlanguageset`, `infolevelset`. Owners ignore the extra `reason` body field (no refusal), but members are asked for a reason to open a file or write their own note, and a raw-body upload carries it in the query.

My reading, built now and tested: literal, as above, except the shell's own sign-out (R4 is explicit: it sends at once) and the explanation level (R17: one click). Alternative I would build instead if you say so: an op in `RUNG_ABSENT` keeps the *label* "Reasoned" (DEC-87) but runs on press, unless its ground is `undetermined`. Either way no requirement text moves for the screens; this decides what the four screen jobs' members see. Not blocking: I carry on.

## Completion

**Entries applied.** T46-54 · interface-shell (new; N897 (1); DEC-87, -98, -99, -122, -138, -139, -154, -155, -159–-163, -175–-177, -179, -181; N672, N673; K2893): R1–R26, built fresh, with R21's contract as K2996, K2998 and K2999 state it (B2–B4).
- `bio-plane/src/interface-shell/index.mjs`: `interfacePage(screens)` (R1, R2), `checkScreens` (R21: throws naming the screen for an id not in `SCREEN_REGISTRY`, an op `OPS` does not hold, or an op neither the registry's for that screen, its owed ops, nor a named re-point), `toSource`, `wordsOf`, `NONCE_SLOT`, `PHONE_WIDTH`, `STYLESHEET`/`ICONS` (from `ASSET_FILES`' names), `PATHS` (R8, `mock-shell.js` `PATH` at 3f40899950), `PLACE_SCREENS`, `REF_SCREENS`, `RE_POINTS`, `ADMIN_ACTS` (R12), `SHELL_OPS`; the page carries only the words its screens and kit can draw (the shell's families, each act's and registered screen's keys, every key a screen names).
- `bio-plane/src/interface-shell/browser.mjs`: `shellProgram(D, SCREENS, win)`, the page's one script, serialized whole: the session hand-over and op client (R3: the token only in the `Authorization` header; a 401 to a session request signs out), sign-out (R4), words and dates (R5, R6), the frame, path, router and Settings page (R7–R9, R25), read states (R10), acts with weight, friction, gate and refusals (R11–R13), explanations with the absorb rule (R14, R15), references and cards (R16), the level (R17), appearance (R18), rows and the hold strip (R19), the dock (R20), the rail's width (R26), and the kit `cs` (R21, with `call`, `download`, `closed`, `extra.picked`, raw bodies, async `send`).
- `bio-plane/src/interface-shell/words.mjs`: `SHELL_WORDS`, the shell's own `[key, en, protected]` rows (`shell.<part>`), BOB's interim English: a HANDOFF to the design stream (plan T46, "BOB's acts").
- Tests, `bio-plane/test/m/interface-shell/`: `dom.mjs` (the shared document stand-in, K2996: parser, selectors, events, form properties) and `harness.mjs` (the served page over the stand-in with a scripted plane and a fake clock; `boot`, `ok`, `refused`, `refusedIn`, `httpError`, `silent`, `pending`, `bytes`, `nestedTips`, `controls`, `accessibleName`), both for the screen modules' tests; `screens.fixture.mjs` (registry screens drawn with every kit part); `page`, `session`, `words`, `acts`, `frame`, `explain`, `rows` `.test.mjs`.

**Files to add to `modules.json` (K1043):** paths `bio-plane/src/interface-shell/`; tests `bio-plane/test/m/interface-shell/`.

**Readings (in my record for BOB; none moves a requirement):**
- R11: superseded by B5/B6 (K3002); see "Re-opened by B5, B6" below.
- R11: an op in `op-grades`' `IRREVERSIBLE_WEIGHT` weighs Irreversible whatever its rung (DEC-143, `op-grades` R21); none is offered in T46.
- R17: "after their first month" counts from the first day this device served the member, or the level's first `set_at` if earlier (whoami answers no joining date); asked once, recorded `{level, asked: true}`; kept on the device (`cs-level-asked`) too. While `infolevelset` is not in `OPS` (op-declarations' T46-51 unmerged) the level is kept on the device only, as R17 says.
- R20: `groupkeystate` answers a non-administrator `{on}` only (`credentials` R34), so "held and on" reads as `on: true` with `held` not `false`.
- R9: a subject "not found" is a read a screen marks `subject: true` answering empty, or refused `NO_SUCH_*`/`*_NOT_FOUND`; any other refusal is "could not read" (R10).
- R2: the test serves the page as the door does (fresh nonce, policy, slots filled), not through `answer-envelope` itself, which is not in this module's uses; control-plane's end-to-end suite (T46-59) serves it through the real door.
- The page's own styles (path, menu, rows and their phone cards, reduced motion) are one inline `<style>` (the page policy allows inline styles).

**Deferred:** none.

**Found elsewhere (REPORT in this COMPLETE):** none against another module's requirements. Dependencies at merge: `setup-page` R31's `SESSION_STORE_KEY` (unmerged on `tranche/T46` at this COMPLETE; `interfacePage` throws without it) and `op-declarations` R50 (`infolevelset` declared; until then the level is device-only). Generated artifacts: none staled (nothing imports the module until control-plane R75).

**Tests and checks** (with `modules.json` given this module's paths locally and `setup-page`'s job head for R31, neither committed):
- `node --test bio-plane/test/m/interface-shell/`: tests 57, pass 57, fail 0. No layer tests (`build/manifest.md`).
- `format`: 159 modules, 158 requirements files; 0 failures. `architecture … interface-shell`: 13 product files, 36 relative imports; 0 failures. `coverage … interface-shell`: 26 of 26 live requirement ids named by a test; 0 failures. `ownership … interface-shell tranche/T46`: 0 failures.
- `checks/run.mjs`: architecture 2985 product files, 0 failures; coverage 12 failures, all other L11 modules' unmerged ids (screens-*, control-plane, installer, instance-setup, setup-page R31, op-grades R33, wizard-scripts, answer-envelope R13, notice-producers), none of this module's; channels 0 failures.

Size (session_01XVWdr7BFN9RvWdPQ9aPzuZ): test runs 14, module lines 1077 (src; tests 1533; the estimate 3,200–3,800 was not reached)

## J3 · COMPLETE

T46-54 interface-shell complete: R1–R26 with R21's contract (K2996, K2998, K2999); see this record's Completion. Files to add to modules.json: paths bio-plane/src/interface-shell/, tests bio-plane/test/m/interface-shell/ (dom.mjs and harness.mjs there are the shared stand-in for the screen modules' tests). Merge after setup-page (R31's SESSION_STORE_KEY) and op-declarations (R50). J2 (R11 friction for RUNG_ABSENT ops) is still open: built literally; a CHANGE re-points it. Tests 57/57; format, architecture, coverage, ownership 0 failures.

## Re-opened by B5, B6 (K3002)

**Applied.** R11 as K3002 words it: the weight from `RUNGS`; an op in `RUNG_ABSENT` under `undetermined`, or in neither table, reasoned; under `substrate`, `credential`, `caller-owned` or `observational` no weight mark (no pips, no weight name or meaning in its explanation) and run on press (`index.mjs` marks it `none`); a reasoned act whose spec names a `reasonField` sends the member's own words in that body (or, raw, query) field as its reason and asks none, refusing to send while it is empty (`shell.reason.needed` beside the act). R21's K3002 sub-bullet: `parts` serialised with the screen and handed in as `view.parts`; `view.origin`; a refusal word filled from the refusal's fields; a `refusals` value may be a function `(refusal, cs)` → HTML; `{refuse, fills}`; `cs.value` of a checkbox or radio its `checked`; `cs.digest(text)` (hex SHA-256 of UTF-8, `crypto.subtle`); `cs.now()` (the page's `Date.now`, the harness's fake clock in tests); no `cs.open`. Harness: the page runs with a fake `Date` on the harness clock and `crypto`.

**Tests and checks** (same local arrangement as above): `node --test bio-plane/test/m/interface-shell/`: tests 60, pass 60, fail 0 (new: R11 K3002 ground rule with controls, R11 DEC-88 `reasonField`, R21 K3002 kit points). `format` 0 failures; `architecture … interface-shell` 13 product files, 0 failures; `coverage … interface-shell` 26 of 26; `ownership … interface-shell tranche/T46` 0 failures.

Size (session_01XVWdr7BFN9RvWdPQ9aPzuZ): test runs 22, module lines 1098 (src; tests 1611)

## J4 · COMPLETE

B5/B6 (K3002) applied: R11's ground rule and reasonField; R21's parts, origin, filled refusal words, refusal functions, {refuse, fills}, cs.value checked, cs.digest, cs.now, no cs.open. Tests 60/60; format, architecture, coverage, ownership 0 failures. See the record's 'Re-opened by B5, B6'. Merge after setup-page (R31) and op-declarations (R50) as before.

## Re-opened by B8 (K3009)

**Applied.** (1) An act's `done` that answers a promise is awaited before the reads named in `rereads` (or all). (2) After an act succeeds, every password field in the page (`input[type="password"]`) is cleared before `done` and any redraw, so no secret is restored by a redraw; a refused act keeps what was typed (R13). Harness: a plane answer given as a function may answer a promise.

**R21 wording for BOB to state (K3009):** "After an act succeeds the shell clears every password field the screen drew, before the act's `done` and any redraw; an act's `done` that answers a promise is awaited before the reads named in `rereads` (all when absent)."

**Tests and checks:** `node --test bio-plane/test/m/interface-shell/`: tests 61, pass 61, fail 0 (new: R21 K3009, with its controls: a refused act keeps the typed password, a plain field is kept; and, run once with the `await` removed, the test fails). The screen modules' tests over this shell: screens-settings (merged, on the tranche) 51/51; screens-intake 42/42, screens-daily 45/45, screens-inquiry 44/44 (each its job branch's head in a scratch worktree over this branch). `format` 0 failures; `architecture … interface-shell` 13 product files, 0 failures; `coverage … interface-shell` 26 of 26; `ownership … interface-shell tranche/T46` 0 failures.

Size (session_01XVWdr7BFN9RvWdPQ9aPzuZ): test runs 27, module lines 1102 (src)
