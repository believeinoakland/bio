# screens-entry (T48)

**Status** · session_01BpeeBYLA4MHskJuB8Ac3T8 · depth 2 · COMPLETE · handled B4

## Completion (T48-84)

**Read, whole:** `build/requirements/screens-entry.md`; `build/manifest.md`; my two T48 entries in `build/plan/current.md`; `build/layers.md` (layer 11's row and T47's screen-module rows); all of `bio-plane/src/screens-entry/` (`index`, `front`, `tour`, `forgot`, `reset`, `setup`, `join`, `words`); the tests that name a changed requirement (`kit.mjs`, `common.test.mjs` (R9), `front.test.mjs` (R1), `setup.test.mjs` (R6), `page.test.mjs`). Of the modules I use, only the services my entries touch: `interface-shell` R56–R62 and the kit's `title`, `sec`, `field`, `choice`, `checks`, `state`, `act`, `w` (`browser.mjs`), its `STYLE` and `interfacePage`; `interface-assets` R7 (how `shell.css` is made); the design's `page.src.html` `<style>`, `civicsmith.css`' class set, and `mock-screens.js`' `front`, `tour`, `reset`, `forgot`, `setup`, `join` with `mock-kit.js`' helpers.

**Entries applied (T48-84):**
- **R12** Every class the six screens write is the design's or served: `cs-fronthead`, `cs-flogo`, `cs-frontgrid`, `cs-signin`, `cs-sub`, `cs-small`, `cs-note`, `cs-steps`, `cs-list` → `mk-*`; `cs-actrow` → `mk-acts` (the design's action row); `cs-shown` → `cs-row` with `data-shown`; `cs-codes` kept as a script hook (journey-check reads `pre.cs-codes`; see below). Fields: the join language is `cs.choice` (each language named in its own language by `Intl.DisplayNames`, never its tag); a security tool's own fields are `cs.field` (fill-only row `screen.setup.security.field`); the places picker is the design's `fieldset.mk-checks` with its help as a note. Nothing empty or zero: no "What we have published" section while nothing is published (row `screen.front.published.none` retired), no empty security catalogue, and `forgot`'s last code spent says so without "0 left" (`screen.forgot.done.last`, interim, J1). A failed read is still drawn failed.
- **R13** `front` draws `mk-fronthead` (the logo, else the name's monogram; the name in the serif title `h1.grp`, or "Your group" while none is set, never the slug) then `mk-frontgrid` with the page left and `mk-signin` right; one column at 760 px comes from `shell.css`' carried phone rule. `join` names the group the same way (it drew the slug too).
- **R14** The name part stays first after the codes; the steps are the design's `mk-steps`, the first open step `aria-current="step"`, "Name" open while skipped (done marked for readers by an `sr` span).
- **R15** `setup`'s lede is drawn only while `bootstrap` answers unclaimed and no one here has claimed or is signed in.

**Best readings (J1; confirmed by BOB, B2, K3295):** the two new rows held as interim words for UX-DESIGN to key; no monogram while unnamed (initials of "Your group" would be no one's).

**Deferred:** none in this module.

**Found in other modules (for BOB; REPORT J2):**
- `interface-shell` (R56): its `HOOK_CLASSES` must list `cs-codes` (read by `journey-check`, `journeys.mjs`, as `pre.cs-codes`), or R56's compose check will refuse `setup` and `join`. R12's own test accepts it meanwhile as a named hook.
- `interface-shell` (R56): `cs-actrow` is still drawn by the kit itself (`cs.areas`, `cs.appearance`, the lock and reauth panels), defined only in `STYLE`; the design's row is `mk-acts`.
- R13's fold at 1280 px is tested structurally (nothing above the sign-in card but the head; `shell.css`' two-column and 760 px rules); the live measurement belongs with `journey-check` (as `interface-shell` R57's does in its R6).

**Tests and checks:**
- `node --test bio-plane/test/m/screens-entry/*.test.mjs`: tests 61, pass 61, fail 0 (new `design.test.mjs`: R12 ×4, R13 ×2, R14 ×2, R15; 8 of its 9 fail against the old code).
- `control-plane` `t46-app.test.mjs`, `t46-e2e.test.mjs` (they compose my `SCREENS`): tests 9, pass 9, fail 0.
- `format`: 168 modules, 167 requirements files; 0 failures. `architecture` (screens-entry): 0 failures; `run.mjs` architecture: 3306 product files; 0 failures. `coverage` (screens-entry): 15 of 15 live ids; 0 failures (run.mjs: 21 failures, none mine). `ownership` (tranche/T48): 0 failures. `channels`: 0 failures.

Size (session_01BpeeBYLA4MHskJuB8Ac3T8): test runs 9, module lines 1050

## Change B3 (K3302)

**Applied:** R4 as reworded: `forgot`'s "if no administrator can get in" is `instance-setup`'s `FORGOT_HELP` (heading and sentences, carried by key as `screen.forgot.help.*` from its one holder), drawn for every visitor; `HOSTING_CONTROL` is drawn on `setup` only (rows `screen.forgot.hosting`, `.hosting.what` retired). Merged `origin/tranche/T48` first.

**Tests and checks:** module tests 61, pass 61, fail 0 (the R4 test now asserts `FORGOT_HELP` drawn signed out and after an ended session, and, as its control, no `HOSTING_CONTROL` heading, sentence, guide or `#hosting-control` on `forgot` while `setup` still draws it); `control-plane` t46-app and t46-e2e 9/9. `format` 0 failures; `architecture` (screens-entry) 0, run.mjs 0; `coverage` 15 of 15, 0 failures; `ownership` 0; `channels` 0.

Size (session_01BpeeBYLA4MHskJuB8Ac3T8): test runs 13, module lines 1056

## Change B4 (K3304)

**Applied:** merged `origin/tranche/T48` (interface-shell's R56 in force). Of INTERFACE-SHELL #4 J1 (1)'s list, every class but one was already mapped in this job (`mk-fronthead`, `mk-flogo`, `mk-sub`, `mk-acts`, `mk-small`, `mk-frontgrid`, `mk-signin`, `mk-note`, `mk-steps`, `mk-list`; `cs-shown` → `cs-row` with `data-shown`). `cs-codes`, which `HOOK_CLASSES` does not list, is gone: the codes' `<pre>` carries its hook as the attribute `data-codes`, no class (no design class fits a list of codes).

**R12's test, no stand-in:** each drawing (every screen in its states, over a full and an empty plane, and after claim, enrol, recover and memberadd) goes through `interface-shell`'s own `checkClasses` (served stylesheets and `HOOK_CLASSES`), and the real `SCREENS` compose through `interfacePage`; control: a drawn `cs-nonesuch` is refused, `mk-door` composes. R13's two grid rules are still read from the design page's `<style>` (the source `shell.css` is made from), since `interface-assets` is not in my uses.

**Found in another module (REPORT J5):** `journey-check` reads the codes as `pre.cs-codes` (`journeys.mjs` 65–68): it must read `pre[data-codes]`. `control-plane`'s t46-app and t46-e2e are red, from `screens-settings`' `cs-list` (R56), not this module.

**Tests and checks:** module tests 61, pass 61, fail 0. `format` 0 failures; `architecture` (screens-entry) 0, run.mjs 0; `coverage` 15 of 15, 0 failures; `ownership` 0; `channels` 0.

Size (session_01BpeeBYLA4MHskJuB8Ac3T8): test runs 16, module lines 1056

## J1 · QUESTION

Two readings, one word, for BOB's ruling (I carry on with these meanwhile):

1. **Words (R12, "no count at zero").** `forgot`'s success sentence `screen.forgot.done` says "you have {remaining} left", which reads "you have 0 left" after the last code. I need a sentence for that arm; none is in `words.json`. My draft, for BOB's interim words (marked interim, for UX-DESIGN): `screen.forgot.done.last` = "Your new password is set. That was your last recovery code: once you are signed in, get new ones in Settings › Recovery codes. Every other sign-in of yours has ended. Sign in with your new password." Also one fill-only row, `screen.setup.security.field` = "{field}", so a security tool's own field names (record data) are drawn through `cs.field` (R12: every labelled field with `cs.field`). Please give the words or confirm these.

2. **R13 monogram.** I read "the logo or monogram" as: the logo when `groupidentity.logo` is true, else the display name's initials (two at most, `aria-hidden`); while no name is set, no monogram (initials of "Your group" would be no one's), only "Your group" in the serif title. **R14:** setup already asks the name first after the codes; I add `aria-current` on the first open step and keep "Name" open when skipped.

## J2 · REPORT

For interface-shell (its R56), two things my job found: (1) its HOOK_CLASSES must list `cs-codes`, the recovery codes' <pre> on setup and join, read by journey-check (`journeys.mjs`: `pre.cs-codes`); without it R56's compose check refuses setup and join. (2) The kit itself still draws `cs-actrow` (cs.areas, cs.appearance, the lock and reauth panels), defined only in STYLE; the design's row is `mk-acts`, which my screens now use. Also: R13's fold at 1280 px is tested structurally here; the live measurement fits journey-check, beside interface-shell R57's in its R6.

## J3 · COMPLETE

T48-84 applied: R12 (design classes, kit fields, nothing empty or zero), R13 (two columns, the name never the slug, join too), R14 (name first, aria-current step), R15 (lede follows the claimed state). Module tests 61/61; control-plane t46-app and t46-e2e 9/9; format, architecture, coverage (15/15), ownership, channels 0 failures for screens-entry. J1's two words are interim pending your answer; J2 reports two items for interface-shell. Record: build/jobs/T48/screens-entry.md on job/T48/screens-entry.

## J4 · COMPLETE

B3 (K3302) applied: tranche merged; forgot draws FORGOT_HELP (by key from setup-fleet) for every visitor, HOSTING_CONTROL on setup only, with its control. Module tests 61/61; control-plane t46-app/e2e 9/9; format, architecture, coverage (15/15), ownership, channels 0 failures for screens-entry.
