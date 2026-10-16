# Draft: the server-side share of DEC-120, DEC-121, DEC-122 and DEC-123 (N528, T31)

**Status** · DRAFT by a worker for BOB, 2026-10-03, on `tranche/T30` @ 99de11aa8f (DEC-120–DEC-124 on `main` since PR #9, K1361). It is for BOB's review, and Bob approves where §5 says so. Entry N528 of `plan/next.md` (:9). Nothing here is folded into `build/requirements/` yet. Each fold restates a ruling Bob has made; only the wording is new.

Conventions are those of `plan/draft-T24-dec113-115.md`:
- A new requirement takes its module's next free id, and retired ids are never reused.
- Every new or changed line ends `*(not yet met: T31)*` and cites its DEC.
- "Index" is the module's position in `build/modules.json`'s total order, and a module uses only earlier ones (P4).
- Screens, interface words and visual design belong to the UX stream. `legacy-ui` (`civicos-ui/`) is Bob's UX and is left as it is (K633). Nothing is proposed there.

Earlier coverage, checked:
- `archive/T29.md`:42, :94: N528 was held out for a hard reason, because the DECs were not on `main`.
- `archive/T28.md`:71–72 and `archive/T29.md`:76–77: rows B4/B5 (N144, N232) and A54 (skills R10) are "Bob's (UX): ruled, waits on the new interface" (K899 (2), `rulings.md`:901; K1266, :1268).
- K262 (4) (`rulings.md`:266): N232 "needs a placement decision before any job builds it". The decision is that skills R10 reads recipe steps' `act` against catalogue acts, while recipes name ops.
- `rulings.md` holds no ruling on DEC-120–DEC-123 other than K1361 (:1363), which unblocked N528. Nothing else covers them.

---

## 1. Per DEC

### DEC-120: wizards, wizard scripts, drafts in fields (`DECISIONS.md`:1936; amended :1947)

**Owed** (:1949): "wizard scripts runnable without the assistant (a script runner beside the assistant's own planning); the skill pack's recipe layer renamed and fed from the governed script library once its design is ruled; the wizard's draft-in-field step (labelled, adopted by the member) replacing ASSISTANT-PILOT §3's no-prefill rule; who authors and approves scripts, still open with Bob."

**Server-side share:**
- The plane serves wizard scripts to every member's session with no AI credential and no key:
  - the scripts that start on a screen;
  - one script whole;
  - a check of a script's steps.

  The runner itself is the interface's.
- The step grammar: a screen, an optional act, what to do, why, and an optional labelled draft. A draft is the script's own text, an offered filing-template version, or a named machine-draft read that already exists (`case-authoring` R39 `whatchangedpropose`, `escalationreasondraft`, K1019).
- The plane checks a draft's source. It never presses the act: the act runs its own checks, reason and receipt as today.
- The pack's `recipes` layer is renamed `wizard_scripts` and fed from the library (skills R9, R10).
- "Who authors and approves" is answered by DEC-121.

**UX only:** the docked guide, opening each screen, outlining the real control, placing the draft and its "Draft · edit before sending" label (principles 6.4, 6.6), and observing that a step is done.

**Not server, and not a module:** ASSISTANT-PILOT §3's no-prefill sentence (`ASSISTANT-PILOT.md`:121–125) and §1's "Recipes" row (:66). These are canon text (`requirements/README.md`:46) that BOB amends in place, pointing to DEC-120 and DEC-121.

**Already exists:**
- skills R9–R10 (`requirements/skills.md`:32–33) is the recipe layer. It is a stated absence today: `published.recipes` and `published.surfaces` are absent (SK-5, N144). R10's build-failing check is the model for the script checks below.
- affordances R17 (`requirements/affordances.md`:81) is the no-target answer that carries `published`.
- `filing-templates` R25 (`offeredVersion`) is the template draft source.
- The labelled machine drafts already built:
  - `case-authoring` R39 `whatchangedpropose` and `escalationreasondraft` (DEC-101, K1019);
  - skills R31's labelled-draft doctrine.
- The no-assistant runner needs no AI scope. `agent-worker` R37 lists the AI's reads and is unaffected.

**Not yet built anywhere:** the assistant itself, which has no prompt entry point, plan or wizard (`ASSISTANT-PILOT.md`:10–11, :15).

### DEC-121: authoring, checking, approving, finding and sharing scripts (`DECISIONS.md`:1951)

**Owed** (:1972): "a governed wizard-script library per group (versions, review, approval, widening, retirement; machine never approves), mirroring filing-templates; the walk-through recorder (screens and acts only); the step touch-up and the advanced editor behind an administrator's grant; the checks (refusals and warnings) as code; the assistant's script-authoring guidance in its instruction pack; required flows in the CivicOS library, their failure blocking the release; optional flows withdrawn when broken, with the owner's notice; the starting-point mark and its hover, click and record-from-here; candidate suggestions and per-script use counts; sharing as a signed file and import with approval (later); the design session's step-3 candidate list and step-5 scripts."

**Server-side share** (nearly all of the owed line except the screens):
1. The governed library, modelled on `filing-templates` R1–R25 (`requirements/filing-templates.md`):
   - origins `civicos` and `group` (`imported` reserved);
   - versions that are never edited after submission;
   - approval by a project owner, never the sole author;
   - widening by an administrator;
   - retirement, never deletion;
   - a machine proposes only.
2. The recorder's server half: a draft made from a recording accepts only `{screen, act}` per step and refuses any other key, so it never holds a typed value.
3. Touch-up and the editor: any author may reword, delete or reorder the steps of their own draft. Adding a step that was not recorded, or starting from blank, needs an administrator's editor grant.
4. The checks as code:
   - refusals: an unknown screen or act; a step without a "why"; a step that concludes (§5 B3);
   - warnings: one step only; a duplicate of an offered script.
5. Required and optional:
   - `required` scripts exist only in the CivicOS library, and no group act edits or retires them.
   - A required script that fails the checks fails the plane's release suite.
   - An optional script that fails against the current screens and acts is withheld from members, and its owner gets a queue item. It returns when it passes again.
6. Finding: a read of the offered scripts that start on a screen, each with its name, step count, approver and finish count. The author's own drafts are included, marked as such.
7. Use: unattributed tallies of starts, steps reached and finishes per version. Abandonment is derived from these, so it is never an event of its own (DEC-120's "non-event").
8. Candidates: unattributed tallies of where scripts are abandoned and which acts are refused, by op and code.
9. The authoring guidance: a skills layer.

**UX only:** the mark's look, place, hover and tap; recording in the browser; the touch-up editor; the library page; the step-3 and step-5 lists, and the scripts' content (the CivicOS library's content is Bob's, skills R10 and N144).

**Later, by the ruling:** sharing as a signed file and through the network directory (DEC-121 (8): "Designed now, built later").

**Already exists:**
- `filing-templates` as the pattern: R3–R11 for the lifecycle, R6 for the machine proposal, R10 for approval and widening, R11 for retirement, R16–R17 and R22 for attribution, append-only rows and the machine fence.
- `membership` R64 (`isAdministrator`) and R65 (`projectOwners`).
- `queue-producers` R20 for a library's queue items (`requirements/queue-producers.md`:42).
- No screen registry exists. The one built is legacy-ui's `SURFACES` (`civicos-ui/app.html`; K262 (4)), and it is not used.

### DEC-122: phones, themes, nothing from outside (`DECISIONS.md`:1974)

**Owed** (:1986): "the phone's act set (reversible and reasoned only, for now) and its "finish on a larger screen" handoff; light and dark themes with contrast checked in both; the interface's typefaces, icons and scripts bundled in the release, the old interface's Google Fonts load removed, and no outside requests from member screens or the public case."

**(1) Phone act set.**
- **Server-side:** the plane publishes for each act whether it is a phone act, so no surface holds a copy of the rule (DEC-8; affordances R21, `affordances.md`:109). It is advisory: no op refuses by device, and the plane cannot know one.
- **UX:** the handoff's words and how it shows.
- **Already exists:** every act's `rung` is published (affordances R2, R11, R17; `affordances.md`:19, :66, :81). But rung alone does not give DEC-122's set:
  - `filingsent` is `reasoned` (`bio-plane/src/affordances.mjs`:1068), yet "sending" is named as a larger-screen act;
  - `captureaccount` is `attested` (:861), yet "capturing a document" is a phone act;
  - capture and acquire carry no rung (ground `substrate`, :1119–1120);
  - signer-key ops are ground `credential` (:1169–1174).

  So a published per-act answer is needed (§5 B5).

**(2) Light and dark.**
- **Server-side:** only that the complete edition is always light. `case-grammar` R14 (`case-grammar.md`:65) already sets its own light colours (`complete.mjs`:52) with no external reference. It does not declare a colour scheme, so a browser's forced-dark handling could restyle it.
- **UX:** both themes, contrast in both, the print stylesheet, and the public page following the reader.
- **BOB's reading (§5 B6):** the member's theme choice is a device setting with no plane state.

**(3) Nothing from outside.**
- **Server-side:**
  - (a) Every HTML page the plane serves makes no request to another origin.
  - (b) The installer's pages do the same.
  - (c) The release carries the interface's typefaces, icons and scripts, served from the group's own copy. The new interface does not exist yet, so (c) is deferred (§4).
- **Already exists:**
  - The signer page: `signatures` R25 (`signatures.md`:77; `sign-release.html`:9) has no `http(s)` `src` or `href`.
  - The setup page uses system fonts only (`setup.mjs`:129–130), but no requirement pins it.
  - The installer Worker's pages use system fonts (`newgroup/src/ui.mjs`:43).
- **Not met:**
  - The installer's invitation page loads Google Fonts (`bio-plane/public/newgroup/index.html`:8–10, :16–18). It is `installer`'s path (`modules.json`; `installer.md`:95).
  - The old interface's Google Fonts load (`civicos-ui/app.html`:10) is legacy-ui's: Bob's UX, K633. Nothing is proposed.
  - No plane HTML response carries a policy that stops outside loads (`control-plane/index.mjs`:679, :709 serve the signer page).

### DEC-123: the design principles as the yardstick (`DECISIONS.md`:1988)

**Owed** (:2000): "none to the build directly (each principle's own ruling carries its owed work); the design session checks every step 2–5 deliverable against the page."

**There is no server-side share.** Nothing is proposed. The principles that carry build work do so through their own rulings: 6.6 and 6.7 through DEC-120 and DEC-121; 8.6, 8.8 and 9.6 through DEC-122.

---

## 2. Proposed requirement changes, in `modules.json` order

### skills (layer 6; next free id R32)

- **R5 amended:** in `disclosed`, `recipes` becomes `wizard_scripts`, and `wizard_authoring` (R32) follows `edition_statement`. (DEC-120: "recipe" retired) *(not yet met: T31)*
- **R9 becomes:** Until `published.wizard_scripts` is a list, `wizard_scripts` has `load_when` `"never, in this edition"`, `sourcing` `absent`, `body` `[]` and a non-empty `absent_because`. **published** gains `screens` `[{id, acts, …}]` and `wizard_scripts` `[{id, version, origin, required, steps: [{screen, act, what, why, draft?}], …}]`, the offered scripts as `wizard-scripts` R11 answers them, passed in unchanged (`affordances` R37). (DEC-120, DEC-121) *(not yet met: T31)*
- **R10 becomes:** When `published.wizard_scripts` is a list, `wizard_scripts` has `sourcing` `driven`, a non-empty `load_when` and `body` the scripts unchanged. `renderPack` throws, naming the script, the step and the unknown name, and renders nothing, when a script has no steps, or a step names a screen not in `published.screens` or an act that is not an op of the screen it names. The act check reads `published.screens[].acts` and no longer reads `published.catalog` (this resolves K262 (4): steps name ops). (DEC-120; N144, N232) *(not yet met: T31)*
- **R32 (new)** (DEC-121 (3); `BIO_Interaction_Constructs_v0_1.md` §P "RULED 2026-10-03") The `wizard_authoring` layer:
  - `sourcing` `authored`;
  - `load_when` "the run drafts a wizard script, or critiques one recorded by a member";
  - body: the clauses found in §P by R21's normaliser (the checks' sentence: screens or acts that do not exist, a step's "why", "what to conclude"; machine work proposes and a member approves), and `acts` read from `published.catalog` by id as R30's are: the proposal act `wizardpropose` and the member-only acts `wizarddraft`, `wizardrevise`, `wizardsubmit`, `wizardapprove` (`wizard-scripts` R3–R7).

  When the catalogue holds no `wizardpropose`, the layer renders as a stated absence in R9's form. No clause carries control-flow authority (R16, R24). *(not yet met: T31)*
- **Satisfies** gains DEC-120, DEC-121 (3). **Suggestions:** delete :93 (its registry is legacy-ui's).

### case-grammar (layer 8; R14 amended)

- **R14 gains:** "The complete edition is always light: it sets its own colours and declares only the light colour scheme, so a reader's dark setting does not restyle it." (DEC-122 (2)) *(not yet met: T31)*. Suggestion: `<meta name="color-scheme" content="light">`.

### wizard-scripts (NEW, layer 11, first, before `affordances`; R1–R20)

Its creation is Bob's (§5 B1). Placement and uses are BOB's (§5 B2). The requirements file is to be written from these lines.

**Purpose.** The library of wizard scripts:
- the CivicOS library, shipped with the release and read-only;
- each group's own library, governed like filing templates.

It holds the checks every script passes, serves the scripts that start on a screen, and keeps unattributed use tallies. A machine proposes and never approves. It runs no wizard: the runner is the interface's.

**Uses:** `record-grammar` (`isMachineIdentity`, `proposalLabel`), `record-core`, `membership` (R54, R64, R65, `viewerPredicate`), `filing-templates` (R25 `offeredVersion`, for a template draft).

**Registered at start (K31's pattern):**
- the screen registry `[{id, acts}]`;
- the member op table, with the set of acts a machine is refused (`affordances` `MACHINE_REFUSALS`, R7);
- the CivicOS library.

A second registration is refused. With none registered, every screen is unknown.

- **R1** A script is `{id, origin, scope, name, start, required, versions}`:
  - `origin`: `civicos` | `group` (`imported` reserved, never written);
  - `scope`: `{project}` | `group`;
  - `start`: the screen it begins on;
  - `required`: true only for origin `civicos`.

  A version is `{script, version, steps, sha, state, author, contributors, derived_from, approved, ended}`. `state` is `draft`, `submitted`, `approved`, `updated` or `withdrawn`, and once out of `draft` the steps and `sha` never change. *(not yet met: T31)*
- **R2** A step is `{screen, act, what, why, draft?}`:
  - `act` is null or an op of `screen`;
  - `what` and `why` are 1–300 characters each;
  - `draft`, if present, is one of `{text}` (at most 4,000 characters), `{template}` (a version `filing-templates` R25 offers) or `{machine: <op>}` (a registered machine-draft read).

  It is always labelled with its kind. *(not yet met: T31)*
- **R3** `wizardDraft({project, name, recorded | from, author, viewer})` (`op=wizarddraft`):
  - `recorded` is a list of `{screen, act}` and nothing else; any other key is refused `WIZARD_RECORDING_CARRIES_VALUES` (DEC-121 (2): screens and acts, never values).
  - `from` is a proposal (R5) or an approved version the author may see (a derivative).
  - With neither, a blank start, the author needs a live editor grant (R8).

  Refusals: `MACHINE_CANNOT_DRAFT_WIZARD`; `WIZARD_SCOPE_REFUSED` (not a joined participant, `membership` R54); `WIZARD_EDITOR_NOT_GRANTED`; R12's refusals. *(not yet met: T31)*
- **R4** `wizardRevise({version, steps, author, viewer})` replaces a draft's steps and keeps each revision. Without an editor grant, the new list's `(screen, act)` pairs must be a sub-multiset of the version's recorded or adopted ones (reword, delete, reorder); otherwise it is refused `WIZARD_EDITOR_NOT_GRANTED`. The author may run their own draft (R11) before approval. (DEC-121 (2)) *(not yet met: T31)*
- **R5** `wizardPropose({project | script, steps, why, proposer, viewer})`: any credential, stored apart, labelled `proposalLabel(proposer, "wizard")`. It becomes a draft only when a member names it as `from` or adopts it, and the run then joins `contributors`. (DEC-121 (2)–(3), as `filing-templates` R6) *(not yet met: T31)*
- **R6** `wizardSubmit({version, author, viewer})` moves a draft to `submitted` and fixes its steps, refused while R12 refuses them. *(not yet met: T31)*
- **R7** `wizardApprove({version, widen?, by, viewer})`, in order:
  - `MACHINE_CANNOT_APPROVE_WIZARD`;
  - `NOT_AN_APPROVER`: a project owner approves (`membership` R65), and `widen: true` makes it group-wide, which needs an administrator (R64);
  - `APPROVER_IS_AUTHOR` (`filing-templates` R10's rule);
  - R12's refusals, run again.

  The earlier approved version becomes `updated`. (DEC-121 (1)) *(not yet met: T31)*
- **R8** `wizardEditorGrant({member, by})` / `wizardEditorRevoke({grant, by})`: administrators only (`NOT_AN_ADMIN`, `membership` R84). Grants are recorded and revocations appended. (DEC-121 (2)) *(not yet met: T31)*
- **R9** `wizardRetire({script, version?, reason, by, viewer})`, as `filing-templates` R11: a whole script retired by an approver, or a draft withdrawn by its author; `reason` is 1–500 characters. A `civicos` script answers `WIZARD_NOT_THE_GROUPS` to every write (DEC-121 (5): groups cannot edit or retire required flows). *(not yet met: T31)*
- **R10** `wizards({state?, viewer})` and `wizardRead({script, version?, viewer})`: the library for owners and administrators, each version with its attribution, state, `broken` (R13) and use (R15). *(not yet met: T31)*
- **R11** `wizardsAt({screen, viewer})` (`op=wizardsat`) answers the offered scripts starting at `screen`, each `{id, version, name, steps, approver, finished}`, plus the caller's own drafts marked `draft: true`. "Offered" means approved or updated, not retired, not `broken`, and visible.
  - It needs no AI credential or key, and is reached by every member's session (DEC-120 (1)).
  - Writes nothing.

  *(not yet met: T31)*
- **R12** `checkScript(steps, {screens, ops, machineRefused})` is pure and answers `{refusals, warnings}`.
  - Refusals:
    - `WIZARD_NO_STEPS`;
    - `WIZARD_SCREEN_UNKNOWN`;
    - `WIZARD_ACT_UNKNOWN` (an act that is not an op of its screen);
    - `WIZARD_STEP_NO_WHY`;
    - `WIZARD_DRAFT_REFUSED` (a draft whose source is not R2's, or a `{template}` not offered);
    - `WIZARD_STEP_CONCLUDES` (a step with a `draft` whose act is in `machineRefused`: the member's conclusion is never pre-filled, §5 B3).
  - Warnings: `WIZARD_TRIVIAL` (one step) and `WIZARD_DUPLICATE` (the same `(screen, act)` list as an offered script).

  Each refusal names the step. `op=wizardcheck` serves it as a read to any credential, `ai` included, so a plan the assistant makes on the fly passes the same checks (DEC-120 (1)). (DEC-121 (4)) *(not yet met: T31)*
- **R13** At each registration (R1's start), every offered `group` script is checked again (R12):
  - A script that fails is `broken`: withheld from R11 and recorded with the first refusal and when it was found. It is never shown broken.
  - It returns when it passes again.
  - `brokenScripts({after?, limit?, viewer})` lists each break and each return for `queue-producers` R32.

  (DEC-121 (5)) *(not yet met: T31)*
- **R14** `requiredFailures(registry)` is pure. It answers each `required` CivicOS script that R12 refuses, with its refusal. For the plane's release suite (`plane` R19). (DEC-121 (5)) *(not yet met: T31)*
- **R15** `wizardProgress({script, version, event, step?})` (`op=wizardprogress`; `event` `start`, `step` or `finish`) adds one to an unattributed tally per (version, event, step) and per day.
  - No member id, viewer, project or instant finer than the day is kept.
  - An abandonment is never sent: it is the drop between step counts.
  - `wizardUse({script, viewer})` answers the tallies to the script's owners and authors.

  (DEC-121 (6); DEC-120 "a non-event") *(not yet met: T31)*
- **R16** `tallyRefusal(op, code)` adds one to an unattributed daily tally, called by `control-plane` R50. `wizardCandidates({viewer})` answers, to owners and administrators, the screens and steps where scripts are most abandoned and the (op, code) pairs most refused, never a member, target or project. (DEC-121 (6): "suggests candidate flows") *(not yet met: T31)*
- **R17** `submittedFor({after?, limit?, viewer})` lists submitted versions with the project's owners who may approve them, for `queue-producers` R33. *(not yet met: T31)*
- **Invariants** (filing-templates R16, R17, R22–R24 restated):
  - **R18** Nothing is deleted. Every table is append-only and declared to purge. Names in attribution are held by value.
  - **R19** A machine writes only a proposal (R5) and the tally (R15).
  - **R20** Visibility is `filing-templates` R24's rule, with `NO_SUCH_WIZARD` as the one answer for absent and unseen alike. Rows are in its own `checks.mjs` (a new family). No place is named.

  *(not yet met: T31)*

Suggested tables, from the filing-templates pattern: `wizard_scripts`, `wizard_versions`, `wizard_revisions`, `wizard_proposals`, `wizard_editor_grants`, `wizard_tallies`, `wizard_refusal_tallies`. The CivicOS library is a data file in the plane's bundle (path BOB's).

### affordances (layer 11; next free id R36)

- **R36 (new)** (DEC-122 (1)) Every decorated act (R11), capture act and set act carries `phone`, `true` or `false`:
  - `false` when its rung is `terminal`, `attested` or `irreversible`, when its absence ground is `credential`, or when it is in the frozen `LARGER_SCREEN_ACTS`;
  - `true` otherwise, so reads, captures and everyday acts are phone acts.

  `LARGER_SCREEN_ACTS` is published as `VOCABULARIES.larger_screen_acts` and holds `filingsent` (§5 B5). Nothing refuses by device. A change of the phone set is a change here only. R11's shape gains the key, so a queue option and an `op=affordances` act stay one shape. *(not yet met: T31)*
- **R37 (new)** (DEC-120, DEC-121) The ops of `wizard-scripts` (`op-declarations` R15), with R12's totality holding:
  - `RUNGS` assigns `reasoned` to `wizardretire` (a reason is required, as `templateretire`, R30).
  - `RUNG_ABSENT` holds:
    - `wizarddraft`, `wizardrevise`, `wizardpropose`, `wizardsubmit` and `wizardapprove`, ground `undetermined`, on R27's rule, as the template acts;
    - `wizardeditorgrant` and `wizardeditorrevoke`, ground `credential`;
    - `wizardprogress`, ground `observational` (an unattributed tally).
  - `NON_ACTS` gives each its reason ("wizard-directed: keyed by a script or version, reached from the library or a screen's mark; moves no bundle"; the reads "read: …").
  - The no-target answer (R17) gains `screens` (the registry, `wizard-scripts`' registration) and `wizard_scripts` (the offered scripts, all screens) for the pack (`skills` R9).

  *(not yet met: T31)*

### queue-producers (layer 11; next free id R32)

- **R32 (new)** (DEC-121 (5): "its owner is told why") FINDINGs `wizard-withdrawn` and `wizard-restored`: one per entry `wizard-scripts.brokenScripts` answers (its R13), keyed `FINDING::wizard-<kind>::<script>@<version>::<at>`. Each goes to the script's project owners and its author only, names the first refusal in plain words, is raised once and leaves when disposed (DEC-69, DEC-70). *(not yet met: T31)*
- **R33 (new)** (DEC-121 (1)) OBLIGATIONs `wizard-approval-requested`: one per (version, owner) `wizard-scripts.submittedFor` answers (its R17), to that owner only, as R20's. It leaves on approval, withdrawal or retirement. *(not yet met: T31)*
- **R8 gains** R32 and R33.

### instance-setup (layer 11; next free id R49)

- **R49 (new)** (DEC-122 (3)) Every page this module serves (R20 and the enrolment and record-browser pages) names no resource on another origin in any `src`, `href`, `@import`, `url()` or script fetch, and uses only typefaces installed on the device or bundled with the plane. *(not yet met: T31: met in code, `setup.mjs`:129–130, with no test)*

### op-declarations (layer 11; next free id R15)

- **R15 (new)** `OPS` holds a spec for each `wizard-scripts` op, each in `SESSION_OPS.member` and `SESSION_OPS.admin`, with the stamps the act lists name:
  - `NEEDS` `contribute` for `wizarddraft`, `wizardrevise`, `wizardsubmit`, `wizardapprove`, `wizardretire` (stamped `author`/`by` and `viewer`);
  - `wizardeditorgrant` and `wizardeditorrevoke` (stamped `by`; an administrator's);
  - `wizardpropose`: any credential, `ai` included, stamped `proposer`;
  - `wizardprogress`: a member's session, stamped nothing that names the member;
  - the reads `wizards`, `wizardread`, `wizardsat`, `wizarduse`, `wizardcandidates`, and `wizardcheck` (also `ai`).

  *(not yet met: T31)*

### control-plane (layer 11; next free id R50)

- **R50 (new)** (DEC-120, DEC-121) The door routes `wizard-scripts`' ops through its own map (R26), with `op-declarations` R15's stamps and none taken from the caller (R29). For `wizardprogress` it passes no member id to the module. For every refusal it answers to a member's session, it calls `wizard-scripts.tallyRefusal(op, code)` and nothing else about the call. *(not yet met: T31)*
- **R51 (new)** (DEC-122 (3)) Every `text/html` response the plane serves (the signer page and the setup pages among them, :679, :709) carries a policy under which a browser loads no script, style, font, image or connection from another origin and sends nothing elsewhere. Suggestion: `Content-Security-Policy: default-src 'self'; …` with the inline allowances the pages need. *(not yet met: T31)*

### plane (layer 11; next free id R19)

- **R19 (new)** (DEC-120, DEC-121 (1), (5)) The composition root:
  - builds `wizard-scripts` at its place in R2's order and runs its migration (R3);
  - at start, registers with it the screen registry carried in the plane's bundle (empty until the new interface ships one), the member op table (`op-declarations`), `affordances`' `MACHINE_REFUSALS`, and the CivicOS library carried in the bundle.

  The plane's release suite holds `requiredFailures` empty for the bundled registry. A required script that fails fails the suite, and a release requires that suite (K619's release checks). *(not yet met: T31)*

### installer (layer 11; next free id R35)

- **R35 (new)** (DEC-122 (3); §5 B7) Every page the installer serves, and the invitation page (`bio-plane/public/newgroup/index.html`), names no resource on another origin in any `src`, `href`, `@import` or `url()`. Typefaces are the device's or carried beside the page, and a link the reader follows (to the hosting provider's sign-up, say) is not a load. *(not yet met: T31: the invitation page loads Google Fonts, :8–10)*

**Unchanged:** `signatures` R25 (met), `public-read` (it serves data, and the public page is the UX stream's), `membership`, `filing-templates` (used as built), and `agent-worker` (its AI reads are unchanged; the assistant is unbuilt, §4).

---

## 3. Proposed entries, by layer (T31)

| layer | entry | modules | merge order |
| --- | --- | --- | --- |
| 6 | N528-a: the pack's `wizard_scripts` rename (R5, R9, R10) and the `wizard_authoring` layer (R32) | skills | independent: pure, fed `published` |
| 8 | N528-b: the complete edition declares light only (R14) | case-grammar | independent |
| 11 | N528-c: the library, its checks, finding, tallies (R1–R20), **on Bob's B1** | wizard-scripts (new) | **first** in layer 11 |
| 11 | N528-d: phone acts (R36); wizard ops graded and published (R37) | affordances | after wizard-scripts (R37's `screens`, `wizard_scripts`); R36 alone may go first |
| 11 | N528-e: the withdrawn/restored notices and approval to-dos (R32, R33) | queue-producers | after wizard-scripts |
| 11 | N528-f: no outside loads on setup pages (R49) | instance-setup | independent |
| 11 | N528-g: op specs (R15) | op-declarations | after wizard-scripts and affordances |
| 11 | N528-h: routes, the refusal tally (R50); the HTML policy (R51) | control-plane | after op-declarations |
| 11 | N528-i: composition, registrations, release suite (R19) | plane | after control-plane |
| 11 | N528-j: installer pages make no outside loads (R35) | installer | independent |
| — | N528-k: amend ASSISTANT-PILOT §3 (:113–125) and §1's Recipes row (:66) in place, pointing to DEC-120/121; `modules.json` and `layers.md` gain `wizard-scripts` (after B1) | BOB (canon and build files) | at the opening, before layer 11 |

If Bob does not approve B1 in time, N528-c, N528-d's R37, and N528-e, g, h's R50 and i move to the next tranche together. N528-a's R9 and R10 still stand (they render a stated absence until `published.wizard_scripts` exists). N528-b, d's R36, f, h's R51 and j need nothing new.

---

## 4. Out / deferred

| item | reason |
| --- | --- |
| The runner, docked guide, outlined control, draft placement and label, record-from-here, touch-up editor, library page, the mark (look, place, hover, tap), the phone handoff's words, both themes and contrast, the print stylesheet | the UX stream's (K633; DEC-121 (6): "its look decided in the visual language") |
| `civicos-ui/app.html`:10's Google Fonts load (owed by DEC-122) | legacy-ui is Bob's UX, left as it is (K633 (1)); the new interface replaces it |
| The interface's typefaces, icons and scripts carried in the release and served by the group's copy (DEC-122 (3)) | dependency not yet built: the new interface has no assets. Today the interface is a separate dev Worker (`civicos-ui/README.md`, "Not the plane"). It waits for the first new-interface screens, and becomes `bundler`, `plane` and `installer` lines then |
| The screen registry's content | dependency not yet built: the new interface's (UX stream). `plane` R19 registers it empty until then, so every group script is refused `WIZARD_SCREEN_UNKNOWN` |
| The CivicOS library's scripts, including the required ones | the UX stream's step 3 (candidates) and step 5 (scripts), with content approved by Bob (DEC-121 (1), (9)) |
| The assistant planning a wizard on the fly; its use of `wizardcheck` | dependency not yet built: the assistant pilot (`ASSISTANT-PILOT.md`:10–11, :15; §7 steps 4–5) |
| Sharing as a signed file and through the network directory; import as "Another group's" | Bob's ruling: "Designed now, built later" (DEC-121 (8)) |
| The plane-served pages (setup, signer, installer) in light and dark | the UX stream's visual language (tokens) does not exist yet; §5 B6 |
| Releases' run of the required-scripts suite | K633 (2): no release until Bob says so |

---

## 5. Open points

**Bob's** (each a product capability or a change of meaning, P17):

- **B1. A new product-capability module, `wizard-scripts`.** DEC-121 rules the library. Creating it as a module, and building it before the new interface's screens exist, is Bob's. K899 (2) ruled "surfaces and recipes … needed, but wait for the new interface" (`rulings.md`:901), and DEC-120 and DEC-121 since rule their design.
  - **Recommendation:** approve the module now and build it in T31. Its server half needs no screen (the registry is registered, and is tested with a test registry). Scripts written in step 5 can then be checked as they are written (DEC-121 (9)). N144, N232 and A54 close into N528.
- **B3. "Tells a member what to conclude" as code.** Code can refuse a step that pre-fills a judgement act's field (R12 `WIZARD_STEP_CONCLUDES`: a draft on an act a machine is refused). It cannot read the meaning of a step's words. The words are checked by the assistant's critique (skills R32) and the approver, who is a member.
  - **Recommendation:** accept that split. Bob's because DEC-121 (4) lists the check as a refusal, and part of it would be judgement rather than code.
- **B4. Recording starts, steps and refusals.** DEC-120 makes abandoning "a non-event", and ASSISTANT-PILOT §3 says "No record entry, no nag". DEC-121 (6) asks for use counts and candidate suggestions "from where members abandon or are refused".
  - **Recommendation:** unattributed daily tallies only (R15, R16): no member, target or project, and no abandon event. This reconciles the two rulings, and Bob confirms because it records something about members' use.

**BOB's** (lower-level; recorded in `rulings.md` and reported to Bob):

- **B5. The phone set.** DEC-122's "reversible and reasoned" is read with its named examples. Phone acts are reads, captures and acts that are not terminal, attested or irreversible. Larger-screen acts are signer-key ops (`credential`) and the named `filingsent` ("sending", although rung `reasoned`). `captureaccount` (attested) stays larger-screen, so a phone capture's signed account is added later at a laptop, which is principle 8.6's own example. Recommend as drafted (affordances R36).
- **B6. The theme choice** is a device setting with no plane state. Plane-served pages follow the visual language when the UX stream issues it. Recommend.
- **B7. The installer's invitation page** is the publisher's, not a group's copy. DEC-122 (3) names "member screens or the public case". Recommend including it: same reason (DEC-31; principle 9.6), one file, and no change of meaning.
- **B8. Placement:** `wizard-scripts` first in layer 11. It is before `affordances`, so affordances can grade and publish its ops (R37) and `queue-producers` can raise its items. The op table, `MACHINE_REFUSALS` and the screen registry are registered at start (K31) rather than used. This answers K262 (4)'s placement question: steps name ops of a screen. Recommend.
- **B9. Governance details mirrored from `filing-templates`:**
  - `APPROVER_IS_AUTHOR`;
  - no review step (DEC-121 names approval only);
  - an `updated` version stays readable but only the latest is offered (a wizard has no use for an older one);
  - a broken script returns automatically when it passes again, with its owner told (R13, queue-producers R32).

  Recommend.
- **B10. ASSISTANT-PILOT §3 and §1** amended in place by BOB (N528-k). `design-principles.html` is not added to the canon list: DEC-123 makes it the design session's yardstick, and its build share comes through each principle's own DEC. Recommend.
- **B11. Release gate location.** The required-scripts check is a `plane` suite (R19) rather than `bundler`, because bundler (layer 1) cannot use a layer-11 module (P4). Recommend.
