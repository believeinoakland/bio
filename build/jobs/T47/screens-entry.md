# screens-entry (T47)

**Status** · session_018kvztadrm22jvWsfWwMjCL · depth 2 · WORKING · handled B9


## Completion (SCREENS-ENTRY #1)

**Read whole:** `roles/JOB.md`; `build/requirements/screens-entry.md`; the public parts of `interface-shell` (whole), `setup-words`, `instance-setup` (`HOSTING_CONTROL`, R10, R47, R83–R85) and the ops' owners' rows the screens send (`credentials` R47, R65–R71; `membership` R11, R15, R16, R97, R104, R107, R110, R123; `instance-setup` R12, R50, R60; `ai-use` R2; `file-safety` R27–R29); layer 11's contract; T47-86; `draft-T47-interface.md`, `draft-T47-L11-fold.md` §B and §D; the registry entries and `mock-screens.js` drawings of the six screens; interface-shell's code and harness, and its record's Completion (B7). `setup-page`'s code was read only for the claim, sign-in, enrolment, join-link, codes, profiles and security-tool calls it makes (op bodies and answers), not whole.

**Entries applied (T47-86, with B2–B7):** R1–R11 as six screens in `SCREENS`: `front` (masthead, logo, public purpose, published cases, doorbell, tour, sign-in panel with its refused, paused, signed-out, ended and locked states, `unlock`, `cs.signout`), `tour` (six steps, one address each, no request), `forgot` (`recover`, the administrator's link, `HOSTING_CONTROL`'s words), `reset` (`passwordresetlook`/`passwordreset`, live, set, dead), `setup` (claim → `login` admin own → codes shown once, saved or copied; every registry part, skippable and resumable; Finished → `/app`), `join` (`invitelook`; `joinlinkinvite` after the name; dead links; language; handle checked as typed; `enroll` → `login` → `memberlanguageset` → codes → `cs.wizard` welcome (K3143) → Home). Readings: J1 (K3144: interface-shell R46), J2 (K3145: R47).

**Files** (for `modules.json`): paths `bio-plane/src/screens-entry/` (`index.mjs`, `words.mjs`, `front.mjs`, `tour.mjs`, `forgot.mjs`, `reset.mjs`, `setup.mjs`, `join.mjs`); tests `bio-plane/test/m/screens-entry/` (`kit.mjs`, `front.test.mjs`, `public.test.mjs`, `setup.test.mjs`, `join.test.mjs`, `common.test.mjs`, `page.test.mjs`). Uses as listed: `interface-shell`, `setup-words`, `instance-setup` (`setup-fleet.mjs`' `HOSTING_CONTROL`), `op-declarations` (tests).

**Deferred:** language names in `join`'s choice are drawn as the group's tags (`en`, `es`): no word names a language yet (a HANDOFF for the design stream's words).

**Found in other modules (REPORT J5):** interface-shell writes `bio-session:active` (R33's activity instant) on a click in the public frame with no session, so walking `tour` stores something (screens-entry R3's "nothing is stored"); my page test leaves that one shell key out and names it.

**Tests and checks** (after B10, tranche/T47 with interface-shell merged, no overlay): `node --test bio-plane/test/m/screens-entry/` 52 pass, 0 fail; J5's storage exemption removed (B8: the tour stores nothing, shell included). Checks, with this module's `paths`/`tests` set locally (not committed): `format` 0 failures; `architecture` (screens-entry) 0 failures; `coverage` 11 of 11, 0 failures; `ownership` 0 failures; `checks/run.mjs` architecture 0 failures.

Size (session_018kvztadrm22jvWsfWwMjCL): test runs 28, module lines 1,027

## J1 · QUESTION

The kit and the frames my six screens need from interface-shell (R21, R30, R32, R45), and one op class. Each with my best reading; I am building on these readings now. The shell's code on tranche/T47 has no public or setup frame yet (its T47 job has not started building), so the parts below are what I assume INTERFACE-SHELL provides; please relay them to it or correct me.

(1) Session state handed to `front` (R2's states, R11): the shell gives the screen `view.session` = `{state, handle}`, `state` one of `none`, `signedout` (after R4's sign-out), `ended` (R32's 401 / R33's shared idle end), `locked` (R33), `live`; `handle` the record's `w`. `front` draws R2's signed-out, ended and locked states from it.
(2) Handing a sign-in over (R2, R6, R7; interface-shell R32): `cs.signin(answer, {device, handle, stay})` writes the session record `{t, e, d, w}` from `login`'s answer (`token`, `expires`), then sends `whoami` so R12 gates the screen's later acts (R45). Without `stay` it opens the page kept to return to (R32's sessionStorage path), else Home; with `stay: true` (setup after `claim`, join after `enroll`, which go on showing the codes) it redraws the same screen signed in. `cs.signout()` is R4's sign-out ("Not <handle>?" on the lock; `signout` is not a registry op of `front`).
(3) Public acts before a session (R30, R45): in the public and setup frames, `cs.act(op)` draws an act whose op is public (`OPS[op].classes === null`: `login`, `recover`, `passwordreset`, `claim`, `invitelook`, `joinlinkinvite`, `enroll`, `handlecheck`) with no session and sends it with no `Authorization` header; once `cs.signin` has made a session, R12 applies as on any screen. `unlock` (on `front`, locked) is sent under the locked session's token.
(4) The fragment (R5–R8; interface-shell R36): screen functions cannot read `location`, so the shell reads the fragment once on load, removes it from the address (`history.replaceState`) before any request, and hands it as `view.fragment` = `{boot, invite, join, reset}` (each a string or absent), kept in page memory only.
(5) Ops sent that the screen's registry entry does not list, which I send with `cs.call` inside an act's `send`/`done`, never as a drawn act (R38 admits only registry ops as acts): `login` after `claim` (setup) and after `enroll` (join); `recoverycodesissue` and `memberlanguageset` after join's `login` (join's registry lists `memberlanguageset`, not `recoverycodesissue`); `securitytooltest` after `securitytooladd` on setup (setup-page's way). Reads (`groupidentity`, `groupdescription`, `publishedlist`, `grouplanguages`, `bootstrap`, `passwordresetlook`, `securitytoolcatalogue`, `profiles`, `hostingaccess`, `courtnotice`, `groupkeystate`, `aikeepawaystate`, `placewantedstate`, `recoverycodesstate`) are `reads`, not acts.
(6) Saving the codes "as a file made in the browser" (R6) and "copy": `cs.save(name, text)` (a Blob and object address made in the page, released once the download starts, as `cs.download`'s form) and `cs.copy(text)` (the clipboard). Until the shell has them, I draw the codes as selectable text and offer neither control.
(7) The handle "checked as typed" (R7): with no input hook in the kit, I check it with `cs.later` (every 600 ms while the field's value has changed since the last check, `handlecheck` by `cs.call`) and on press of the registry act "See whether a handle is free"; no kit change asked.
(8) Op class: `publishedlist` is declared `classes: ["admin","member","probe"]` in op-declarations, though public-read's routing note says the door routes it with no credential. R1 reads it with no Authorization header and interface-shell R30 lets the public frame call only `classes: null` ops. My reading: the door serves it publicly and the declaration is op-declarations' to correct (`classes: null`), for you to rule; until then `front` reads it and draws its "could not read" state when refused.
(9) `unlock` and the lock: interface-shell R33 draws the lock over a working screen; R2 also draws `front`'s locked state. My reading: `front` draws it only when it is opened while the record is locked (state (1)), sending `unlock` and on success opening the kept page (as (2) without `stay`).

## J2 · QUESTION

B2 and B3 applied (join calls `cs.wizard("WIZ-7db08189cc0e58c3", null, {joined: true})` once after its login; building to interface-shell R46). One point of R46 for INTERFACE-SHELL, with my reading: a screen can run code only inside an act's `send`/`done`, a refusal function or `cs.later`, and the shell binds clicks only to `data-act`, `data-nav` and its own `data-shell` controls. So `cs.save`, `cs.copy` and `cs.signout` need a control the member presses. My reading: each answers the HTML of its own control, bound by the shell — `cs.save(name, text, {label})`, `cs.copy(text, {label})`, `cs.signout({label})`, `label` a word key — and pressing it does the thing (save the file made in the page, copy, R4's sign-out). I draw `"" + (cs.save(...) || "")`, so a function answering nothing draws nothing. Until it lands, "Not <handle>?" on the lock is drawn as the shell's existing `data-shell="signout"` button. Answer only if wrong.

## J3 · REPORT

Built and pushed (job/T47/screens-entry @ HEAD): the six screens to interface-shell R21/R46/R47 and B2 (K3143), files `bio-plane/src/screens-entry/` (index, words, front, tour, forgot, reset, setup, join) and tests `bio-plane/test/m/screens-entry/` (kit, front, public, setup, join, common). The tests drive `SCREENS` through a stand-in of the kit as R21/R46/R47 state it: 46 tests, 40 pass. The 6 reds are one cause, not mine: `unlock`, `passwordreset` (and `passwordresetlook`) are not yet in `OPS` (op-declarations R57, unmerged), so the kit's gate draws neither act (R2 locked, R5 set/dead/control, R8's reset flow, the contract test). With `paths`/`tests` set locally (not committed): format, architecture, coverage (11 of 11) and ownership all 0 failures.
Left until the providers merge, each as a CHANGE: (a) op-declarations: the 6 reds re-run; (b) wizard-scripts (registry at PR #33's head) and setup-words (WORD_ROWS at 6f0d88d8d5): `interfacePage(SCREENS)` composes only then (today it throws: `front` is not in SCREEN_REGISTRY); (c) interface-shell: a page test over its harness for what only the served page shows (no Authorization header on the public/setup frames, no rail/tabs/dock, the fragment gone from the address before any request, R8's sentinels absent from storage). I wait for those CHANGEs; nothing else is open on my side.

## J4 · REPORT

B5 applied: tranche/T47 merged (632e08f98c). Against WORD_ROWS at 6f0d88d8d5 every key my six screens draw is held (no fallback needed), and the registry now holds my six screens: checkScreens(SCREENS) gets past the registry and stops only at front's `unlock`, which OPS does not hold yet. My tests: 46, 40 pass; the same 6 reds as J3, all `unlock`/`passwordreset` absent from OPS (op-declarations R57). I wait for op-declarations' and interface-shell's merges (CHANGE) to finish.

## J5 · REPORT

interface-shell (from my page test over its branch head): in the public frame with no session, a click writes `bio-session:active` (R33's activity instant) to localStorage, so walking `tour` stores something, against screens-entry R3 ("nothing is stored") and R33's own purpose (activity of a session). My reading: the shell counts activity only while a session record exists. My page test leaves that one key out, naming this report; I tighten it when the shell changes.

## J6 · COMPLETE

T47-86 built: R1–R11, with B2–B7 applied (K3143–K3145, K3149, K3152, K3153); the record's Completion names the files for modules.json (paths bio-plane/src/screens-entry/, tests bio-plane/test/m/screens-entry/), readings, the deferred language names, and J5. Tests on this branch with tranche/T47 merged: 46 pass, 1 fail (page.test.mjs needs interface-shell's merge); over interface-shell's head overlaid: 52 of 52. Checks with my paths set locally: format, architecture, coverage (11 of 11), ownership 0 failures; checks/run.mjs architecture 0 failures. I re-run on your CHANGE after interface-shell merges.

## J7 · COMPLETE

B8 noted (J5's exemption kept until your CHANGE after interface-shell merges). B9 applied: tranche/T47 merged (d25f2d1ac7). Tests on this branch: 46 pass, 1 fail, the same as J6 (page.test.mjs needs interface-shell's merge); nothing of mine changed. Format 0 failures; the record's Completion stands.
