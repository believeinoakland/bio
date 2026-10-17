# interface-shell (T50)

**Status** · session_01PqxJHbxLFfNn4PzXTg5JgZ · depth 2 · COMPLETE · handled B1

## Completion · T50-27 interface-shell (R73–R84, R86–R89; R85 retired)

**Entries applied.**
- R73 `RE_POINTS` is `{explore: [stepsourcewithdraw]}` and nothing else (R72's list, R38's `unlock`/`ratify`, R71's `founderhandleset`, R55's `planask`/`stepsource` removed); an owed act is admitted under its op name (the registry as merged by wizard-scripts, `f49c079f32`); `unlock` on a screen drawn without a session is R46's (`LOCKED_OPS`), not a re-point.
- R74 an act button answers the press: `aria-busy` and a polite live region (`#cs-live`, `shell.working`) while the request is out, a second press ignored, `data-done` after success (cleared at two seconds of the page clock; `disabled` for a Terminal, Signed, Irreversible or outward act until a read started after it redraws the screen; none for a read), a refusal clears both. The buttons are patched in place (a redraw would drop a chosen file the act's `done` still reads). Sounds: `cs.sounds()`, kept on the device (`cs-sounds`), off for a new member, a soft click on a press and a low tone on a refusal beside an act, made with the page's `AudioContext`.
- R75 "Your menu" (`shell.menu.*`), the first month's question once, on Home only, of a member at the default level (`level.keep.*`, sent as `infolevelset` with `asked: true`), the password dialog (`session.reauth.head/go/go_does/cancel_does`, `session.reauth.wrong` beside the field).
- R76 the explanations button `shell.level.button.prompt|pause`; at the phone width every masthead icon keeps its name and its tap shows it, the team's name wraps whole; an act's explanation is its sentence, none when it has none.
- R77 a Reversible act (and a Reversible kit mark) draws no dots or name; `weight.dots.means` once per device (`cs-dots-said`); public pages carry no mark.
- R78 `call` reads an `application/x-ndjson` body as it arrives when a request carries `onEvent` (from `cs.call` or an act's `send`), redrawing at each line; without it the body is read whole.
- R79 `parse` draws `unavailable` (`unavailable.public`, `unavailable.public.go` to `/`) in the public frame for any path outside `/`, `/app`, `/doorbell`, `/tour`; `/doorbell` and `/tour` draw their screens in the public frame at that address; `bootstrap` carries no session on those pages; `forward()` only on `/`.
- R80 `cs.checks` takes `{value, text, on}` record data and a `{text}` legend. R81 `REF_SCREENS` gains request, matter, action, dash-project, theme, published, archive; R88 `docket-public` in the public frame; the `published` and `archive` cards are their keys alone, `theme`'s the item's facts.
- R82 the To-do count's explanation `shell.queue.waiting` + `shell.queue.open` (only when the queue read answered), the team's name `shell.group.open` (opens `group-identity` when registered), path steps `shell.crumb.back`, and `cs.icon(kind)` for `shell.icon.<kind>` (a new kit function; no screen draws it yet).
- R83 a coded refusal with no word and no translation is `refusal.uncatalogued` + the code + R39's reference; `shell.unread` for no refusal.
- R84 the tab title (`page.title`, `page.title.public`), explanations placed below or above, tables with no header row at the phone width, 44 px targets. R87 `interfacePage` throws for a `reasonField` that names no field; every Reasoned act asks or sends the member's own words. R89 the phone rules in `STYLE`.
- R86 the load order (measure below).

**M-T50-6 (R86).** biosmoke8 live: `/app` and `/` answer the same 2,302,116-byte page (TTFB 0.35 s warm, 1.7 s cold, `cache-control: no-store`). No session credential is held by this job (`whoami` answers `NOT_AUTHENTICATED` to the member token), so a signed-in live load could not be timed. Measured instead in headless Chromium against the page this module composes from the nine real screens, over a stub plane answering every call after 150 ms (median of three; `scratchpad/measure.mjs`), `/app`: BEFORE frame drawn 148 ms, Home drawn 483 ms, settled 660 ms; the request chain `bootstrap, whoami` → `interfacewords` → the frame's reads and the screen's reads (three serial hops); AFTER frame 140 ms, Home 311 ms, settled 498 ms; `bootstrap, whoami` → everything else together (two hops). `/`: 671 ms → 518 ms. The shell's own share (a round trip) is cut; what remains of the shell is the 2.4 MB script (frame at 140 ms): the shell program 129 KB, the words 950 KB (`refusal.*` 403 KB, 1,983 rows), the screens 1.32 MB.

**Deferred / for BOB (REPORT).**
1. R86: a cause outside the shell. The served page is one no-store 2.4 MB script: 1.32 MB are the screens' code, and the page carries every `refusal.*` English row (403 KB) whether or not a refusal comes. A cacheable, versioned script (`control-plane`), and refusal words read on demand through `interfacewords` (`instance-setup`), would cut the parse and the transfer; neither can be done here.
2. R89 and R84 put the phone rules (row `auto minmax(0,1fr)`, one-column label list, wrapping tabs, 44 px targets, the team's name wrapping) in `STYLE`, as R89 says ("the shell's own layout"), though R65 says `STYLE` keeps only two things; they belong in `shell.css` (interface-assets, a design rule). Measured only through the stand-in (no Chromium layout test of the screens at 390 px yet: `journey-check` R6).
3. R82's `shell.icon.<kind>`: `cs.icon(kind)` is added; screens that draw a row icon must call it (screens-daily, screens-investigate).
4. R84 `page.title.public` names the team by `shell.group.unnamed` on a public page, since no group read is made there; a screen that reads `groupidentity` does not feed the title.
5. R80's "a chosen appearance option shows as chosen" is `aria-pressed` on the buttons (the design's class is unknown to me).

**Found in other modules.**
1. screens-settings: the `members` screen names `groupkeyset`, `groupkeyswitch`, `groupkeyremove`, `accountusesset`, `ailimitset`, `aikeepaway`, which the design's registry (as merged) does not list for `members`; screens-investigate: `person` names the op `person`, not listed for `person`. R73 admits only the registry's acts, so `interfacePage` throws over the real screens: 233 tests of the screen modules and `control-plane`'s page tests are red at the tranche head (115 and 105 of them these two errors), and my R73 test (every act of the nine real SCREENS composes) is red until those two jobs remove or re-home the acts.
2. screens-settings `members.test.mjs:213` compares the page's HTML while an act is pending; R74 adds `aria-busy="true"` to the pressed button and the live region's text, so it must ignore them. With the seven acts admitted by a local patch, my branch adds this one failing screens test to the 16 failing at the tranche head.
3. op-grades and op-declarations had not merged into `tranche/T50` when I finished: R77 and R11 read `MARKS`/`RUNGS`; if either changed, a `CHANGE` re-opens the R77 tests.

**Tests and checks.**
- `node --test bio-plane/test/m/interface-shell/`: tests 165, pass 164, fail 1 (R73's real-screens line, above). 17 new tests in `t50.test.mjs` name R73–R84, R86–R89; 21 older tests changed to the amended requirements (R11, R17, R28, R38, R55, R57, R60, R62, R64, R70, R71, R10/R61; the R72 test is removed with R72's list).
- Used by interface-shell and run: `screens-*` and `control-plane/t46-app`: 233 failing at the tranche head, 233 on this branch (the same set), 16 and 17 with the seven acts admitted (above).
- `node checks/format.mjs ../bio`: 171 modules, 170 requirements files; 0 failures. `architecture ../bio interface-shell`: 20 product files, 90 relative imports; 0 failures. `coverage ../bio interface-shell`: 86 of 86 live requirement ids named by a test; 0 failures. `ownership ../bio interface-shell origin/tranche/T50`: 0 failures.

Size (session_01PqxJHbxLFfNn4PzXTg5JgZ): test runs 24, module lines 2480

## J1 · COMPLETE

COMPLETE: interface-shell T50-27. R73-R84 and R86-R89 applied (R85 retired); record 'Completion' section on job/T50/interface-shell. Module tests 164 of 165 pass; the one red is R73's 'every act of the nine real SCREENS composes': screens-settings' members names six acts and screens-investigate's person one that the design registry does not list for them (233 screen-module and control-plane page tests are red at the tranche head from the same cause). Checks: format, architecture, coverage, ownership 0 failures. M-T50-6 (stub plane, 150 ms a call): /app 660 -> 498 ms, / 671 -> 518 ms, one round trip cut; live biosmoke8 signed-in time not measurable (no session credential); causes outside the shell (2.4 MB no-store script, 403 KB of refusal words) reported in the record. op-grades and op-declarations had not merged when I finished: a CHANGE re-opens R77/R11 tests if they moved MARKS or RUNGS.

## Change · B2–B5

B2: R78 as worded (`cs.call` `onEvent`, an act's `send` result carries `onEvent`; already so). B3: `cs.ring` opens every closed `<details>` enclosing the control (in `ringDraw`, so it survives the redraw); test "R31 cs.ring opens every closed details…" with a control. B4/B5: merged `tranche/T50` (wizard-scripts regenerated); the shell reads every act from `SCREEN_REGISTRY` (no copy), `REF_SCREENS` already holds request, matter, action, published. Module tests 165 of 166 pass; the one red is still R73's real-screens line (screens-settings `members` six acts, screens-investigate `person`).
