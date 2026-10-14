# screens-inquiry (T48)

**Status** · session_01QWcbBxH6PyVrtBPVA5u3fy · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Read whole; two entries cannot be built exactly as written without a decision on each, and I carry on with R19–R22 and everything else meanwhile.

**R17 (assistant bars and meter).** R17 says the dock draws `screens-settings` R26's bars and meters. Nothing in `tranche/T48` or in `job/T48/screens-settings` yet (its `panel.mjs` exports only `aiPanel`, `aiPanelSend`, `aiLimitRefused`) is a standalone render of the thirty days and the meters. My best reading: screens-settings exports one function over an `owner` and an already-read `aiuseovertime` answer (say `aiUsageBars(cs, view, {owner, value})`), and `projectai` and the dock both take it as `view.parts`, as `projectai` takes `aiPanel`; the dock does the owner-only gate, the read, and the `state.failed` for `unreadable`. Please give me (or the screens-settings job) the export's name and arguments; until it merges I will build against a fake `parts` function of that shape and draw nothing where `parts` lacks it.

**R18 (reference links).** Three gaps. (1) `REF_SCREENS` (interface-shell) holds `project`, `question`, `person`, `proceeding`, `standard`, but not `plan`, `timeline`, `money`, `calculation`, `case-editor`, `review-copy`, `ceremony`, `docket`, and no `shell.card.<kind>` words for them; `cs.ref` draws an unlinked card for a kind it does not list. This is interface-shell's to add (no requirement there yet names it). (2) "with the project/question's case as subject": the screens take their own ids (a plan's, a case's), and no read in this module names any. My best reading: the project page links `timeline`, `money`, `calculation`, `proceeding`, `standard` and `plan` with the project's own id as subject, `question`'s links `case-editor`, `review-copy`, `ceremony`, `docket` with the question's id as subject (the case being the question's), each drawn only where a read in this module answers a non-empty list for it. But this module reads none of them, so "a project with no plan draws no plan link" would have no read to test. (3) Which read says a project has a plan? I would add `projectplans`-style reads only if an op exists; none is named.

Best reading if you do not answer: I draw these links as `cs.ref` of the screen's kind, with the project (question) id as subject, only where the screen is registered and a read this module already makes names the subject (the plan link from the plans the member opened on the page, `ui.plans`); the rest wait for DEC-228 (4)'s placement. Tell me the read to use for each if that is not enough.

## J2 · COMPLETE

**Read (whole):** `build/requirements/screens-inquiry.md`; my entries (`plan/current.md` T48-73); layer 11's row in `layers.md`; all seven files of the module (1,682 lines) and `fixtures.mjs`, `common.test.mjs` (in part), `document.test.mjs`, `assistant.test.mjs`'s first third; from the services I touch: `interface-shell` R35, R55–R62 and the kit's `field`, `state`, `ref`, `sec`; `screens-settings`' `panel.mjs` exports; `ai-use` R12/R14, `ai-accounts` R15; the design's `civicsmith.css` and `page.src.html` `<style>`; `words.json` at `4664e8efd4`.

**Entries applied**
- **R17.** The dock reads `aiuseovertime` with the serving account's owner (`member:<me>` for her own account; `project:<id>` for a project's account, the plane's refusal of a non-owner drawing nothing and saying nothing; `group` only when `whoami.administer`), and draws the answer with `view.parts.aiUsageBars(cs, view, {owner, value})` (B2/K3293). `unreadable: true` and a read that fails are drawn `state.failed`; a coded refusal draws nothing. The dock's `parts` holds the function only when `screens-settings` exports it, so until that merges the dock draws no bars (tested through a stand-in of that shape).
- **R18.** A plan opened in the project is drawn as the kit's reference link `plan` where the shell lists the kind and registers the screen, plain otherwise (B2's reading). The other links (timeline, money, calculation, proceeding, standard; case-editor, review-copy, ceremony, docket) are N1078's: no read this module makes names their subjects and `REF_SCREENS` lacks the kinds. Tested through a kit stand-in (the shell cannot yet link `plan`).
- **R19.** `act.pagetranscribe.does` dropped from my rows (`words.json` carries it, American spelling); the document draws it by its key. "labelled" is gone from my two rows. Test reads `words.json`.
- **R20.** Classes: `cs-sub/note/facts/passage/strengthbox` → `mk-*`; `cs-meta` → `mk-small`; `cs-rec` → `rec`; `cs-machine` → `cs-machinework`; `cs-label` → `cs-draftlabel` (untested label) and `mk-small` (project objective); `cs-refusal` → `mk-msg`; `cs-id` → `mk-tag`. `projectai`'s two `cs-form` blocks → `cs.field` (password key field with its help; keep-away reason). No empty section: question "What it waits on" and "Cuts against"; document "Passages", "People it names", "Its versions", "What cites it"; project "Questions from elsewhere"; dock "What it produced". No zero: the stage counts are each drawn only above zero (the one `counts` word split into three), the dock's "used of limit today" only when used is above zero. Dead rows dropped (9 empty-state sentences, `stage.counts`, `plan.opened`, `leg.version`, `versions.head/count`).
- **R21.** The subject read is marked `subject: true` on all four screens, and a bare render draws nothing. The served "Nothing is here" is `interface-shell` R61's (unmerged); not tested end to end.
- **R22.** "Open the original" links `open-file` by the capture's SHA-256, drawn only with a digest.

**Deferred / found in another module**
- `screens-settings`' AI account panel (drawn inside `projectai`) still draws `cs-form` and `cs-note`, which no served stylesheet defines (their R20; I stood the panel in for my class test).
- `interface-shell` R56 (the class check at serve) and R61 (served absence) are unmerged, so my class test reads the stylesheet sources itself and my R21 test is at the screen contract. When they merge, a served-bare test for the four screens is a one-line addition.
- I added no `interface-assets` import to my tests (not in `uses`); the CSS is read from `docs/`.

**Tests and checks:** `node --test test/m/screens-inquiry/`: 77 pass, 0 fail (64 before; 13 new: 12 in `t48.test.mjs`, 1 in `document.test.mjs`). `checks/format`: 0 failures; `architecture screens-inquiry`: 0 failures; `coverage screens-inquiry`: 22 of 22 live ids named; `ownership screens-inquiry tranche/T48`: 0 failures; `checks/run.mjs`: no failure names my module (others' R-ids unmet, inherited).

Size (session_01QWcbBxH6PyVrtBPVA5u3fy): test runs 9, module lines 1723
