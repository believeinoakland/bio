> **BOB #200's review status (not yet folded).** A reading worker's draft (sonnet, medium), committed unfolded so it is not lost; BOB folds it before L11's START after reading it whole. Known faults: doubt 17 is wrong (`build/extraction/translations.md` exists, committed by K3616: fold T50-23's deletion from it); the installer lines R63–R65 and site/journey-check R13–R16 were written after the worker's context reset and must be checked against `build/plan/install-situations.md` and the sources before use.

# T50 L11a: requirement lines for the non-screen L11 jobs (draft)

**What this is.** Lines to paste into `build/requirements/<module>.md`, from the L11 non-screen entries of `plan/current.md` ("Text: fold"), `plan/fold-T50-owners.md`, the N entries and DEC-249 to DEC-301 they cite, and K3615, K3627, K3637, K3641, K3643, K3644, checked against the tree at `tranche/T50`. Modules: wizard-scripts (T50-17), op-grades (T50-18), affordances (T50-19), queue-producers (T50-20), machinery-producers (T50-52), queue (T50-21), instance-setup (T50-23), op-declarations (T50-24), admission (T50-79), interface-assets (T50-26), notice-producers (T50-82), control-plane (T50-35), plane (T50-36), installer (T50-78), site (T50-37), journey-check (T50-38). Skipped as told: T50-22 translations, T50-25 answer-envelope, T50-50 store-door.

Next free ids (grep of each file): wizard-scripts R41, op-grades R45, affordances R63, queue-producers R41, machinery-producers R15, notice-producers R24, queue R55, instance-setup R92, op-declarations R73, admission R29, interface-assets R9, control-plane R102, plane R58, installer R59 (R56 to R58 exist), site R13, journey-check R15. Every line ends *(not yet met: T50)*. Member-facing sentences are keys of `docs/development/ux-substrate/screens/words.json`; a key that does not exist is under "Keys owed". The identifiers `group`, `groupFields`, `group_fields` stay; no sentence people read says "group". Plan rule 6 (words by key, "team", labeled spelling, hand-lists read from owners) is generic and gets no line, as in `fold-T50-L7L10.md`.

**The 15 new ops** this fold declares and grades (ids from the owners' folds): `lookedat` (membership R148), `browse` (retrieval R85), `watchitem`, `secondlook`, `secondlookclear` (following R32, R33), `opencaptures` (acquisition R46), `capturegrade` (capture R95), `inquirypartition` (inquiry R65), `instances` (progressions R44; K3643), `projectstakeset`, `projectstake`, `projectownersgone` (project-roster R31 to R33), `actionstake`, `actioninquiry` (action-records R17, R19), `stakeatpreparation` (filings R62). Existing ops with a changed body or answer: `importedcases`, `timeline` (`captures`), `entitycreate` (`forum_kind`), `acquire` (`for`), `inboxpull`, `inboxresolve` (viewer), `airunlog`, `airuntick`, `meaningrows`.

---

## T50-17 wizard-scripts

- **R41** (T50; N1130 and the plan's T50-17 entry; K2241; `screen-registry` and `civicsmith-library` in `bio-plane/src/wizard-scripts/build-data.mjs`; amends R38, R39) **The registry and the library are re-taken as generated artifacts.** `screen-registry.mjs` is regenerated from `docs/development/ux-substrate/screens/registry.json` (SCREEN_REGISTRY_SOURCE moves from `4664e8efd4` to the commit named at START; the tree's file holds 70 screens and 404 acts, 264 declared, 125 function, 15 owed, against R38's 67 and 329, and adds `more`, `teamai`, `theme`). The build script takes `--check`, which fails when the carried file differs from what the source would generate, and `build/manifest.md` carries a row for both generated files (a manifest row is BOB's act, not the job's). The five owed T50 acts `watchitem`, `secondlook`, `projectstakeset`, `actionstake`, `actioninquiry` are registered as plane acts once `op-declarations` declares them (R73 there); the four install acts (`installupdate`, `installalongside`, `installremove`, `installremoveconfirm`) are the installer's routes, not plane ops, and stay out of the plane's registry check. Test: `--check` passes on the committed files and fails after a one-byte change; every registry `function` act is in the ops map or an alias, except the four install acts; each of the five owed acts is found once declared. Control: a registry act with no declaration fails the test by name. *(not yet met: T50)*
- **R42** (T50; N1130; DEC-281; K2241; U14) **The carried library is the file's latest content.** `civicsmith-library.mjs` is regenerated from `library.json` (23 scripts, one version each; library source moves from `d129238bf3`). Sixteen of the 23 carried scripts differ from the file (four by name, DEC-281: "Say who your team is", "Update your team's Civicsmith", "Use another team's case", "Comment for the team"); seven are the same. The only owed op the library carries is `updatestart`. A script's name and steps are read from the file; no sentence is held here. Test: the regenerated file equals the library's latest content, script by script; the four renamed scripts carry their DEC-281 names. Control: a script whose steps name an op that is neither declared nor owed fails. *(not yet met: T50)*
- **R43** (T50; N1194; R10, R39) **A saved draft is listed.** `wizards({state: "draft"})` lists a saved draft for its author and for an administrator, and for no other member. Test: a member saves a draft; she and the administrator list it; a second member does not. Control: a draft that was never saved lists for no one. *(not yet met: T50)*

Ops touched: the registry's five owed acts (R41), no new op. Uses: a new edge `setup-words` (the module reads names by key; doubt 20).

## T50-18 op-grades

- **R45** (T50; K3643, K3627, K3637; DEC-295; R3; `t45.mjs:57` `declaredstakeset`) **The new ops are graded.** Reversible, on R3's rule and with the same basis as `declaredstakeset`: `watchitem`, `secondlook`, `secondlookclear`, `projectstakeset`, `actionstake`. `actioninquiry` takes RUNG_ABSENT with ground `undetermined`, and R3's undetermined tally rises by one. The reads `lookedat`, `browse`, `opencaptures`, `capturegrade`, `inquirypartition`, `instances`, `projectstake`, `projectownersgone`, `stakeatpreparation` are NON_ACTS with the reason "read: ..." (one reason per op, naming what it reads). The ops that direct another module's act (`secondlook` and its clear, `actionstake`, `projectstakeset`, `actioninquiry`) are not read ops, so they carry no NON_ACTS reason; where an op is directed at a subject and moves no bundle, its NON_ACTS reason says "...-directed ... moves no bundle". No `MACHINE_REFUSALS` or `ACTS` rows are added. Test: each of the 15 ops has exactly one grade or one NON_ACTS row; the five reversible rows cite R3; the tally of undetermined is the old tally plus one. Control: an op with both a NON_ACTS row and a grade fails. *(not yet met: T50)*
- **R46** (T50; DEC-295; `marks.mjs` MARKS_KIT_COMMIT `fa3c8b7e8e`) **The marks are re-taken against the registry and the kit.** `watchitem`, `secondlook` and `actioninquiry` leave MARKS (they fall to the default, Reasoned; `marks.mjs` lines 31, 128, 151). `projectstakeset` and `actionstake` take kit weight 2 (Reasoned). The commit named at START is recorded as MARKS_KIT_COMMIT. Test: the marks table equals the kit's weights at that commit. Control: a graded op above Reversible with no mark fails (DEC-295 marks only above Reversible; see doubt 6). *(not yet met: T50)*

Ops touched: all 15, plus `instances` in the T50-18 and T50-24 lists (K3643). Uses: none new.

## T50-19 affordances

- **R63** (T50; N1108; DEC-253; T49-14 R62; `affordances/words.mjs`) **Met in code, now stated: labels are read by key.** The code already reads DEC-253 label keys, in the order the design key, then the owner word, then the provisional plain word (`vocabulary()` and `provisional`). The requirement now states it: each act label is `word("act.<op>.label", vars)`, the name `act.<op>.name`, with no English held in `affordances.mjs`. What stays open is the residue (R64). Test: for every act the module offers, the label equals `word(key)`; no test holds the English. Control: an act with no key draws the provisional word and is named in the test's report, never silently. *(not yet met: T50)*
- **R64** (T50; N1108; DEC-253) **The residue: the provisional words and the events.** Act labels in `affordances.mjs` (about lines 681 to 1606) are still English; each moves to its key. The provisional plain word an event draws is read from the owner, never written here. ACTS ids with no `act.<op>.name` key (`retire`, `conclude`, `reopen`, `projectleave`) get their keys (Keys owed 1). Test: no string literal in the label tables is a sentence. Control: the four named ids draw their keys once the keys exist. *(not yet met: T50)*
- **R65** (T50; N1108; `affordances/act-help.mjs` `ACT_HELP_OPS`, `KEY_EXCEPTIONS`) **The T50 acts' help.** `watchitem`, `secondlook`, `projectstakeset`, `actionstake`, `actioninquiry` are in `ACT_HELP_OPS`, each explained by `act.owed_<op>.does`; the reads a screen draws from, and `secondlookclear` (an act the design has not explained), are in `ACT_HELP_ABSENT`. The T50 acts carry no ACTS rows (NON_ACTS only; doubt 8). Keys that exist and are used: `prompt.inquirydivide`, `prompt.inquiryground`, `prompt.attest.fence`, `refusal.uncatalogued`, `act.reauth.does`, `act.<op>.name.selected` for the four per-item acts. Test: each of the five ops answers its `does` key; each ABSENT op is listed. Control: an op in neither list fails. *(not yet met: T50)*

Ops touched: the five owed acts (help only). Uses: affordances to `retrieval` and `acquisition` if its tests import them (doubt 20).

## T50-20 queue-producers

- **R41** (T50; N1091; DEC-299; `participation`, `project-roster`) **A project invitation is an obligation.** A new kind `project-invitation` (OBLIGATION) is produced for a member when `participation` has her `invited` to a project, and withdrawn when the state changes. Its summary is `queue.project-invitation.summary`, its detail `queue.project-invitation.detail`, its act `act.projectjoin.label.queue`; the inviter's name is read, and an unnamed founder draws `member.founder.unnamed`. The inviter and instant are not exposed today (membership R74 returns `{state, owner}`, projectlist R34 only the state string), so the producer needs the proposed `project-roster` R35 `projectInvitations` (Proposed additions; doubt 14). Test: an invited member has one item; accepting clears it. Control: a member not invited has none. *(not yet met: T50)*
- **R42** (T50; N1091; `project-roster` R14 `projectRequests`) **A project request is an obligation for owners.** A new kind `project-request` (OBLIGATION) goes to each owner of the project while a request stands, from `projectRequests`; keys `queue.project-request.summary`, `.detail`, act `act.projectrequestanswer.label.queue` (owed, Keys owed 5). Test: a request makes one item per owner and an answer clears them all. Control: a non-owner has none. *(not yet met: T50)*

Ops touched: none. Uses: new edges `setup-words`, `project-roster`.

## T50-52 machinery-producers

- **R15** (T50; N1143; capture-requests R56; `run-rules` `runPrincipalOf`) **A capture request is told in keys.** `#conditionsCaptureRequested` (`index.mjs:606` to `640`), which still composes English, reads `word()` for the item: `...request.summary`, `...request.summary.unnamed`, `...request.detail`, `...request.detail.assistant`, `...request.detail.unnamed`, and the grade note `...gradenote` (all exist). The `at_the_request_of` is `{member, inquiry}` (capture-requests R56) or `{run, inquiry}`; for a run, the member is read from `principals.plane` through `run-rules` `runPrincipalOf`. A title that is absent falls back to `screen.held.untitled`. The grade note is appended by both producers (R13's bundle producer too). Test: a request by a member and one by a run each draw their detail, the run's with the member named; an untitled subject draws the fallback. Control: a run whose member cannot be read draws the unnamed form. *(not yet met: T50)*

Ops touched: none. Uses: new edge `run-rules`.

## T50-21 queue

- **R55** (T50; N1118; `queue.muted.*`) **The muted list.** `queue({muted: true})` lists what the member has muted, one row per kind (and per case where one is muted): the kind's name, the case, who muted it, and when. Keys that exist: `queue.muted.title`, `.help`, `.kind`, `.case`, `.by`, `.unmute`. `unmute` already exists in `queueMute` and is the row's act. The `queue_state` table (`queue/schema.mjs:42`) holds no per-kind instant, so a per-kind `muted_at` needs new storage (`queue_item_mutes` already has `muted_at`). A whole-project mute does not exist (R4, NO_KINDS) although `queue.muted.case` ("Everything from {project}") does; the row is drawn only if the mute is added (doubt 13). Test: mute a kind and a case; the list shows both with their instants; unmute removes the row. Control: another member's mutes are not listed. *(not yet met: T50)*
- **R56** (T50; retrieval R80; `queue/index.mjs:1080`) **Every item names its subject.** `subject.title` is on every item, `null` when there is none, as `retrieval` R80 does. Task items, whose subject is `{kind: "bundle", id}`, carry the bundle's title. Test: an item with a titled subject answers it; Control: an item with none answers `null`, not a missing field. *(not yet met: T50)*
- **R57** (T50; N1091, N1143; `classOfKind`) **The new kinds' classes.** `classOfKind` adds `project-invitation` (OBLIGATION; its act `projectjoin`), `project-request` (OBLIGATION; `projectrequestanswer`) and `watched-changed` (FINDING, told to its watcher alone, as `standing-answer` is; `queuemute` is its act). Test: each kind answers its class. Control: an unknown kind still answers the refusal it does today. *(not yet met: T50)*

Ops touched: `queuemute` (unmute), `inboxpull`, `inboxresolve` (viewer, control-plane R107). Uses: new edge `setup-words`.

## T50-23 instance-setup

- **R92** (T50; the plan's T50-23; plane R12) **The update check is given its clock.** `tick(now)` passes the alarm's `now` into `#runUpdateCheck` (`setup.mjs:1223`, `3263`; today `at = this.#iso()`), so the check's recorded instant is the alarm's and the plane's R12 red clears. Test: an alarm at a fixed `now` records that instant. Control: a check outside an alarm still reads the clock. *(not yet met: T50)*
- **R93** (T50; `jurisdictions` R94; `setup.mjs:1919`) **The offices seed carries each profile's forums.** `officesSeed` seeds, for each active profile, its `forums` (`{label, forum_kind, ids?, basis}`) as `body` entities carrying `forum_kind`; a repeat answers `already` and writes nothing. Test: seeding twice writes each forum once. Control: a profile with no `forums` writes none. *(not yet met: T50)*
- **N1084 deletion: per the map.** The deletion is done as `build/extraction/translations.md` maps it. That file does not exist yet; no line is written until it does (doubt 17). N1103 is test-only (`recovery.test.mjs:36`); no line.

Ops touched: none new. Uses: none new.

## T50-24 op-declarations

- **R73** (T50; K3643, K3627, K3637; `op-declarations/index.mjs:135` OP_KINDS; `t49.mjs` T49_SHARES) **The 15 new ops are declared.** A `t50.mjs` carries `T50_SHARES {owner: {cite, ops: {op: kind}}}`, as `t49.mjs` does, with: `own`: `watchitem`; `member`: `secondlook`, `secondlookclear`, `actionstake`, `actioninquiry`; `ownread`: `lookedat`, `opencaptures`, `projectstake`, `projectownersgone`; `read`: `browse`, `capturegrade`, `inquirypartition`, `instances`, `stakeatpreparation`; `owners`: `projectstakeset`. Each op's spec and NEEDS come from its kind; a family row for an op with a hand row in `op-capabilities` throws, so none is added there. `ACT_HELP` explains `watchitem`, `secondlook`, `projectstakeset`, `actionstake`, `actioninquiry` through `act.owed_<op>.does`; the rest are in `ACT_HELP_ABSENT`. Test: every op is declared once, with the kind above, and the declaration reproduces its owner's R-line. Control: a declared op with no owner line fails. *(not yet met: T50)*
- **R74** (T50; R67) **Gained body fields are declared.** `importedcases`, `timeline` (`captures`), `entitycreate` (`forum_kind`), `acquire` (`for`), `inboxpull`/`inboxresolve` (the viewer), `airunlog`, `airuntick` and `meaningrows` declare their gained fields, as R67 did. Test: each op's declared body fields equal its owner's. Control: an undeclared field is refused at the door. *(not yet met: T50)*

Ops touched: all 15 and the nine above. Uses: edge `progressions` if its tests import the ops map (doubt 20).

## T50-79 admission

- **R29** (T50; N1179; membership R84) **The administrator is asked first.** The `REAUTH` check (`admission/index.mjs:703` to `709`) runs after the owner's `NOT_AN_ADMIN`: an administrator-only act asked by a non-administrator is refused `NOT_AN_ADMIN`, never asked to sign in again. The administrator-only acts are `adminendorse`, `adminremove`, `memberset`, `memberadd` (role admin) and `groupkeyset`; the list is read from the owners and is unsettled (doubt 15). Test: each such act by a member answers `NOT_AN_ADMIN`; by an administrator whose session is old, `REAUTH`. Control: an ordinary act by an old session still answers `REAUTH`. *(not yet met: T50)*
- **R30** (T50; N1186; credentials R79, membership R149) **An AI caller is seen with its project.** `callerViewer` (`admission/index.mjs:808`) and `readerOf` (`:823`) use the project-carrying viewer from `aiCredentialLook`, not the member alone. Test: an AI caller on a project sees what that project's viewer sees. Control: a human caller's viewer is unchanged. *(not yet met: T50)*

N1146 is test-only; no line. Ops touched: none. Uses: none new.

## T50-26 interface-assets

- **R9** (T50; DEC-249, DEC-279, DEC-280; K3641) **The visual language since the last re-take.** `ASSETS_COMMIT` is the design-branch commit named at START (R1 says "of main"; design branches merge into `tranche/T50`, K3641, @`93cbaf2b55`; doubt 16). `civicsmith.css` since `f498560a37` carries `.cs-btn[aria-busy]` and `.cs-btn[data-done]` (DEC-280), `.cs-testband` (DEC-249), `.cs-part` (DEC-279) and `.cs-choice`; `.cs-band[data-band="test"]` is already carried (R8). `shell.css` is regenerated. Test: each class is found in the served stylesheet and the files equal the design's at `ASSETS_COMMIT`. Control: a hand edit of the served file fails the equality. *(not yet met: T50)*

Ops touched: none. Uses: none new.

## T50-82 notice-producers

- **R24** (T50; DEC-238; following R32 to R34; retrieval `browse`) **A watched item that changed is told to its watcher.** For each member's watch mark, a finding `watched-changed` is produced when the item's `last_changed` is later than the mark's instant, read from `retrieval.browse({only: "watched"})` (title and `last_changed`). Its key is `FINDING::watched-changed::<item>::<last_changed>`, so one change makes one item; its summary is `queue.watched-changed.summary` ("{what} changed"), its detail `queue.watched-changed.detail` ({date}). The mark's instant needs a following read (proposed following R35, `watchedBy`, since R34's function returns ids only; doubt 14). Entities never change, so none is told. Test: a change after the mark makes one finding; the same change twice makes one. Control: a change before the mark, or by no one, makes none. *(not yet met: T50)*

Ops touched: none. Uses: new edge `retrieval`.

## T50-35 control-plane

- **R102** (T50; N933) **The review copy carries its project's team.** The review copy's group (the team of the draft's project) is read for the draft's project, not the member's default. Test: a draft on project P shows P's team. Control: a draft with no project shows the default. *(not yet met: T50)*
- **R103** (T50) **The T50 ops are routed.** The 15 ops are routed through the owner maps or the door's own map, never by a new case in the door. Test: each op answers through the door. Control: an undeclared path is refused (R104). *(not yet met: T50)*
- **R104** (T50; DEC-301 (3), DEC-299 (11); `index.mjs:643`, `:705`; `app.mjs:23`) **An unknown address draws a page.** A browser address that is not a page draws the 404 page with `unavailable.public` and `unavailable.public.go`; `/doorbell` and `/tour` are aliases. The favicon (`:643` to `645`) and the app route (`:672`) are as they are. An op name or an `/api` path still answers `UNKNOWN_OP` as JSON. Test: `/nonesuch` draws the page; `/api/nonesuch` answers JSON. Control: `/tour` draws the tour. *(not yet met: T50)*
- **R105** (T50; `acquisition` BAD_FOR; C-139.21) **`acquire` with a `for` the member may not see.** The door refuses it with acquisition's `BAD_FOR` (one code, one sentence), the same as a `for` that does not exist. The door answers a document or a named refusal within a stated bound (value unsettled; owners §7 says diagnose first by a timed live `acquire`; doubt 12). Test: a `for` naming an unseen question answers `BAD_FOR`. Control: one the member may see is accepted. *(not yet met: T50)*
- **R106** (T50; N1186) **The viewer of an AI caller is project-carrying** (as admission R30), passed to every op the door calls. Test: the viewer an op receives carries the project. Control: a human's does not. *(not yet met: T50)*
- **R107** (T50; doorbell R13, merged at K3644) **The stamped viewer is passed to `inboxpull` and `inboxresolve`.** Test: both receive it. Control: a request with none is refused. *(not yet met: T50)*

Ops touched: `acquire`, `inboxpull`, `inboxresolve`. Uses: new edge `action-records`.

## T50-36 plane

- **R58** (T50; following; membership R150) **The plane composes the T50 ops.** The plane registers `following`'s `registerBrowseMarks` (following registers itself and uses `retrieval`). `membership` R150 `registerProjectReach` has no provider in `provenance` or `connections` and no T50 job, so the plane registers readers (`provenance.capturesOf`, `connections` cites; doubt 11). Test: each op reaches its owner; the reach readers answer. Control: an op with no owner fails the registry check. *(not yet met: T50)*
- **R59** (T50; N1195) **The ask stream passes through as written.** The stream the ask op answers reaches the caller chunk by chunk, unbuffered. `plane/ask.mjs` `watched()` (`:245`) already pipes chunk by chunk and `askOp` returns the DO RPC `ask`; where the buffering is, if anywhere, is unknown, so the job diagnoses it and REPORTs before changing anything. Test: a slow producer's first chunk arrives before the last is made. Control: a short answer arrives whole. *(not yet met: T50)*
- **R60** (T50; promotion STEP_ORDER, membership R146 MODULE_ORDER) **The store tests read order from `modules.json`.** The store's R2 and R10 tests read module order from `build/modules.json`, not a list. Test-only. *(not yet met: T50)*

Ops touched: the 15, composed. Uses: none new.

## T50-78 installer

R56 to R58 are already folded (K3615; R56 and R58 await the proof). New lines:

- **R59** (T50; N1162; `agent-worker/wrangler.jsonc:103` SegmentDriver) **The installed worker binds SEGMENTS.** Test: the generated wrangler config binds it. Control: a config without it fails. *(not yet met: T50)*
- **R60** (T50; bundler R33) **`instance_type` is passed to the container create.** Test: the create call carries the named type. Control: none named, none passed. *(not yet met: T50)*
- **R61** (T50; N1150; R11, R26) **Every part comes from the release's own signed fleet manifest.** Test: a part not in the manifest is refused. Control: a part with a bad signature is refused. *(not yet met: T50)*
- **R62** (T50; N1148, DEC-282, K3471; replaces R32's refusal) **An account that already holds a Civicsmith is offered three choices.** Update (R55 requires V), alongside, or removal (confirmed), in place of the R32 refusal. Keys that exist: `screen.install.exists.*` (14), `screen.install.remove.*` (10), `screen.install.otp.*`, `screen.install.stopped.*`, `installer.update.*` (19), `act.bootstrap.*`. The installer is stateless (R27), so each choice after consent is a new `/begin` (doubt 3). Test: each choice runs its path. Control: no choice, no change. *(not yet met: T50)*
- **R63** (T50; N1157; `build/plan/install-situations.md` S5 to S9) **Outcome-level lines for S5 to S9.** Each situation ends in a named outcome; the values of the bounds are from the file. *(not yet met: T50)*
- **R64** (T50; N1157; S11, S12) **S11 and S12.** The S11 release-side half has no owner (doubt 19). *(not yet met: T50)*
- **R65** (T50; N1157; F1 to F10) **The ten failures end with a named refusal and nothing half-made.** *(not yet met: T50)*
- **R66** (T50; DEC-257, DEC-258) **Words by key and "team".** R42's two lines are the keys `public-read.free_software_groups` and `public-read.neighborhood_issue_groups`. The installer and instance-setup have no `reads` list in `words-reads.json` (instance-setup appears as `setup.mjs` and `setup-fleet.mjs`); the installer takes a `setup-words` edge, with the bundle's size noted (`rows.mjs` is 2.08 MB; the bundle is 23 MB; doubt 21). *(not yet met: T50)*

The installer's four owed acts are not plane ops (doubt 18). Uses: new edge `setup-words`.

## T50-37 site

- **R13** (T50; R4; DEC-247) **The empty state of Groups at work.** With no group listed, the page draws `screen.site.groups.none` in place of the rows and the note. Test: an empty list draws the key's word and no row, no note. Control: one group draws its row and the note. *(not yet met: T50)*
- **R14** (T50) **The places sentence.** "Start a group" draws `screen.site.steps.name` with `{places}`, read from the released profiles at generation (R11). With no place ready the sentence has no key (owed, Keys owed 2). Test: two places draw both. Control: none draws the empty form. *(not yet met: T50)*
- **R15** (T50; U13) **The listing rule.** The page draws the listing rule as `site.groups.rule.head` and `site.groups.rule.text` beside `site.groups.rule`. Test: each key's word. Control: none missing. *(not yet met: T50)*
- **R16** (T50; plan rule 5 (13)) **SITE_COMMIT is the design commit in the tree** with "team" and `SCR.site` states a to d; this clears rule 5 (13). R2's two lines are `screen.site.line1` and `screen.site.line2`. R9 now says states `a` to `d`. Test: pages equal the design's at SITE_COMMIT, as R9 says. Control: no page says "group" for a team. *(not yet met: T50)*

Ops touched: none. Uses: none new.

## T50-38 journey-check

- **R15** (T50; agent-worker R109) **The local world binds SEGMENTS** (as installer R59). Test: the local walk finds the binding. Control: without it the walk fails by name. *(not yet met: T50)*
- **R16** (T50; DEC-251) **The walk's own reading.** The walk's conclusion step reads `question.conclude.own.choice`, `.field`, `.help`, `question.reading.by.member`, `question.empty.conclude.own`, and Sign out reads `shell.menu.signout`. Test: each key's word is on the page. Control: none missing. *(not yet met: T50)*
- **R17** (T50) **No served page or word row says "group" for a team** outside the design's `GROUP_SENSE` (`build_words.mjs:45` to `55`). Test: a scan of every served page and word row. Control: a sense in `GROUP_SENSE` is allowed. *(not yet met: T50)*
- **R18** (T50; DEC-250) **R13 follows the design's journey 29 as it stands.** "From installing to a first conclusion" is 18 steps: install start and done; setup claim and `groupkeyset`; home newgroup; security ordinary; projects empty and project empty (`promote`); question new, running, ended (`airunopen`), new (`search`); capture (`acquire`); document held (`release`) and `cite`; question proposal (`versionaccept`); question `conclude`; question concluded. Test: the walk visits each in order. Control: a step missing in the design fails by number. *(not yet met: T50)*

The REMOTE-for-RUNNER change (agent-worker R109) is not in the plan entry; conditional on the proof (doubt 22). Ops touched: none. Uses: none new.

---

## Proposed additions to folded files

- **project-roster R35 `projectInvitations`** (for queue-producers R41): `projectInvitations(member)` answers, for each project she is invited to, `{project, invited_by, invited_at}`. Read only; writes nothing.
- **following R35 `watchedBy`** (for notice-producers R24): `watchedBy(item)` answers the members watching an item and each mark's instant (R34's function returns ids only).

## Keys owed (words.json keys that do not exist)

1. `act.retire.name`, `act.conclude.name`, `act.reopen.name`, `act.projectleave.name`.
2. The empty-places site sentence (for example `screen.site.steps.name.noplace`).
3. A site key for an unnamed or empty-place state, if the design wants one.
4. A reads list for the installer and instance-setup in `words-reads.json` (design lane).
5. `act.projectrequestanswer.label.queue` and the queue's Grant and Decline words (screens-daily's, minor).
6. `refusal.SIGNIN_EXPIRED` and `refusal.LOCAL_RUNNER_DISABLED` are missing but belong to K3615's fold.

## New `uses` edges (earlier in order only)

wizard-scripts (137) to setup-words (1); queue-producers (143) to setup-words and project-roster (37); queue (145) to setup-words; machinery-producers (141) to run-rules (84); notice-producers (144) to retrieval (71); installer (168) to setup-words; control-plane (165) to action-records; op-declarations (149) to progressions (63) if its tests import the ops map; affordances (139) to retrieval and acquisition if its tests import them. Not needed: op-grades, admission, journey-check, site.

## Doubts

1. **Registry and library re-take, generated or by hand.** (a) Generated with `--check` and a manifest row. (b) By hand. Recommend (a).
2. **Alongside install.** Per-slug names (R13/R24 MULTI-INSTANCE-ISOLATION unmet). (a) Build it with per-slug names. (b) Defer alongside, ship update and removal. Recommend (b).
3. **Installer statelessness.** R27 holds no state. (a) Each choice after consent is a new `/begin`. (b) Add state. Recommend (a).
4. **Source of the "what it holds" counts.** (a) The existing account's own worker. (b) The release manifest. Recommend (a), asked once.
5. **N1157 bound values** (the times and counts of S5 to S12). Recommend the file's own values, quoted.
6. **Rungs.** `projectstakeset` and `actionstake` are Reversible (R3 rule) while the kit weighs them 2 (Reasoned) and DEC-295 marks only above Reversible. (a) Reversible plus a UX ask. (b) Reasoned. Recommend (a). `actioninquiry`: undetermined (recommended) or Reversible.
7. **Order of label words.** Design key first versus N1108's text. Recommend the code's order (design key, owner word, provisional word).
8. **ACTS rows for the T50 acts.** Recommend none (NON_ACTS only).
9. **Four missing act names** (Keys owed 1). Recommend the design lane mints them.
10. **`op-capabilities` has no T50 job.** NEEDS rows come from kinds. Recommend no new job; `watchitem` is `own` though following R19 says contribute: (a) `own` (b) `member`. Recommend `own`.
11. **Reach readers for membership R150.** (a) The plane registers `provenance.capturesOf` and `connections` cites. (b) A T51 job. Recommend (a).
12. **`acquire` door time bound.** Value unsettled. Recommend diagnosing by a timed live `acquire` first, then stating the bound.
13. **Whole-project mute and `muted_at` storage.** (a) Add both. (b) Per-kind and per-case only, draw no project row. Recommend (b).
14. **Two new reads**: project-roster `projectInvitations` and following `watchedBy`. Recommend adding both as R35 in each.
15. **REAUTH administrator-only act list** (`adminendorse`, `adminremove`, `memberset`, `memberadd` role admin, `groupkeyset`). Recommend reading the list from the owners' kinds, not hand-listing.
16. **ASSETS_COMMIT**: R1 says "of main", design branches merge into `tranche/T50`. Recommend the design-branch commit named at START and R1 reworded.
17. **N1084 deletion** waits on `build/extraction/translations.md`. Recommend no line until it exists.
18. **Installer's four owed acts are not plane ops.** Recommend the registry check excludes them by name.
19. **S11 release-side half has no owner.** Recommend the release job (agent-worker lane) takes it, or BOB names one.
20. **Extra `uses` edges** (op-declarations to progressions, affordances to retrieval and acquisition, wizard-scripts to setup-words). Recommend adding only if the tests import them.
21. **Installer to setup-words size.** `rows.mjs` is 2.08 MB; the bundle is 23 MB. Recommend the edge, and a reads list that keeps the installer to its own keys.
22. **REMOTE for RUNNER in journey-check** (agent-worker R109) is outside the entry. Recommend conditional on the proof.
23. **`timeline` `captures` transport** (events R53 is silent). Recommend the body field, declared in R74.
24. **U14 approval wording.** K2241 says no Bob approval; U14's note says "as before". Recommend K2241.
25. **Unmet `ASSETS_COMMIT`/`SITE_COMMIT` two commits.** Recommend one design commit at START for both.
