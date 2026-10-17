# screens-wizards (T50)

**Status** · session_01AGe71oQir7m4tvcnQTRyA6 · depth 2 · COMPLETE · handled B1

## Completion (T50-51)

**Entries applied** (R13–R17, all five `*(not yet met: T50)*` ids of this module):
- **R13** words by key: `words.mjs` now holds key lists only (`SCREEN_WORDS` empty; the 142 keys of `words-reads.json` plus `screen.wizards.own.fold`/`.says`, `wizard.subject.*`, `refusal.uncatalogued`); `index.mjs` lists them per part. A step refusal is drawn by `refusal.<CODE>` with its `{step}` fill, else R83's way.
- **R14** `library.test.mjs` R1 and R8 assert refusals by `hasWord` and draw against `word`, never the stub translation (titles now carry R14).
- **R15** the state choice is one button per state (`data-state`), one press sends `wizards` in that state and re-reads it; "See the whole library" is the offered state's button. After "Save as a draft" the guide names the draft and opens `wizards/draft` (the library reads the state its address names); the recorded steps are a `ul` (the word carries the number: no double numbering).
- **R16** the chip reads `wizard.marks.chip(.one)` (already by key); `connect` draws none while `view.reachable`. `wizards` draws the wizards in use and the state buttons first; record, copy, revise, submit, approve, widen, withdraw, retire and the base's change sit in one closed `<details class="mk-details" data-wizards-own>` (`screen.wizards.own.fold`, first line `.own.says`), as a second table of rows (`own`, `ownproposals`).
- **R17** `PARTS.open` asks in the dock (`cs.choice`, `wz-subject`, Next as `subjectgo`) for a project (`projectlist`), a question (`list` `inquiry`) or a document (`list` `information`) when a step's screen needs one and the run holds none; none to choose for a project: `wizard.subject.none.project` in an open fold with `.none.summary` and Next; for a question or a document: opened as before. Kept in `ui.chosen` for the run (page memory only).

**Deferred:** none.

**Found in other modules (REPORT to BOB):**
1. interface-shell: `cs.ring` finds the control by `data-act` and opens its row panel but not a closed `<details>`; a wizard step that rings an authoring act (`wizardsubmit` …) now rings a control inside the closed fold (R16), hidden until the member opens it.
2. interface-shell: a `<select>`'s change has no hook for a screen (only R49's `cs.choice` driving one act with a button), so R15's "choosing a state reads at once" is built as one button per state, not a select.
3. screens-action/R17: DEC-320 draws `plan` as the project-asking screen, but `plan` reads `op=plan` with `id: view.subject`; the guide opens `plan` on the project id chosen (`plan/<project>`). If `plan` takes a plan id, screens-action must read a project there. The kinds I ask for are `plan`, `project`, `projectai`, `timeline`, `money` (project), `question`, `document`; others open as today (R17 allows).
4. interface-shell R83 (`refusal.uncatalogued` for an unkeyed code) is not in the tree yet; my step-refusal function does the same for its own codes and is tested directly.
5. Failing before my change, not mine: interface-shell `R7 the band …` and `R28 every screen …` (both red on `tranche/T50`); screens-daily `contract.test.mjs` "each screen's acts are exactly its registered acts" (`projects` lacks `themeread`).

**Tests and checks:**
- `node --test bio-plane/test/m/screens-wizards/`: tests 51, pass 51, fail 0 (was 37 pass, 2 fail at START: the two R14 reds).
- Used by: `node --test bio-plane/test/m/control-plane/t47-e2e.test.mjs bio-plane/test/m/control-plane/t46-app.test.mjs bio-plane/test/m/screens-daily/ bio-plane/test/m/interface-shell/`: 268 tests, 265 pass, the 3 above fail (2 and 1 not mine).
- `node checks/format.mjs /home/user/bio`: 171 modules, 170 requirements files; 0 failures. `architecture … screens-wizards`: 13 product files, 38 relative imports; 0 failures. `coverage … screens-wizards`: 17 of 17 live requirement ids named by a test; 0 failures. `ownership … screens-wizards origin/tranche/T50`: 12 files changed; 0 failures.

Size (session_01AGe71oQir7m4tvcnQTRyA6): test runs 14, module lines 872
