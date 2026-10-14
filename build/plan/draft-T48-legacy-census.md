# legacy-ui census: what `civicos-ui/` serves that `/app` does not (T47 close; K3052, K3070, T48-41)

Read-only worker for BOB, on `tranche/T47`. Abbreviations: **A** = `civicos-ui/app.html`; **REQ/x** = `build/requirements/x.md`; **REG** = `docs/development/ux-substrate/screens/registry.json`; **MOCK** = `.../screens/mock-screens.js`; **SRC/x** = `bio-plane/src/x`.

**Method and its limit.** `build/requirements/legacy-ui.md` does not exist; legacy-ui has no requirements file (`build/modules.json:169`, `legacy: true`). A is one 26,550-line page. I read its whole structure: the gate (A:870–897), the rail (A:1569–1592), the router (A:1713–1734), the boot route chain (A:1557–1560), its own self-description `SURFACES` (A:2128–2549), every act flow (`ACT_FLOW`, A:10439; `ROSTER_ACTS`, A:9109; custodial acts, A:14756–14912) and the render and act functions of every screen. I also cross-checked against the plane's copy of legacy-ui's screen list (SRC/plane/screens.mjs:12–84). I did not read every comment line. Every op named below as a gap is still a live op (`op-declarations` OPS, 978 ops). The `/app` side is the ten screen modules' requirements, read whole, plus the ops each `bio-plane/src/screens-*/*.mjs` file actually sends.

## (1) Each legacy screen or act, and what serves it in /app

| Legacy screen / act (A:line) | /app screen · module (citation) | Verdict |
|---|---|---|
| Gate: sign in by handle and password (`signIn`, A:1474) | `front` · screens-entry (REQ/screens-entry:17–18) | served |
| Gate: "Plane address" field, "Preview the design" (A:874–876, `previewShell` A:1455) | — | development scaffolding, not a member act; nothing owed |
| "View the public record" (A:890; `enterPublished` A:22615; case files `pubList` A:21748, `publishedmanifest`) | `front` lists `publishedlist` (REQ/screens-entry:17) | served |
| Published case (`pubOpen` A:22062, `publishedcase`); several cases offered as choices | `published` · screens-publish (REQ/screens-publish:29) | served |
| Published: "Check the signature" (`pubVerify` A:22481, `verify`) | `published` act `verify` (SRC/screens-publish/published.mjs:78–86) | served |
| Published: open a part's bytes (`pubBytes` A:22508, `publishedbytes`); a "Verify" panel for any hash (`pubVerifyPanel` A:22567) | `published` lists evidence by a short hash only and fetches nothing (published.mjs:67–71) | **GAP P1** |
| Published: the reader's floor picker (`pubSetFloor` A:22113) | — | **GAP P2** |
| Queue: resolve, forward, dispose a proposal, adopt (`resolveTask` A:16427, `forwardTask` A:16438, `doProposalDispose` A:18687, `doProposalAdopt` A:18864) | `queue` · screens-daily (REQ/screens-daily:21–22, 45) | served |
| Queue: mute one item (`queueMuteItem` A:16042) | `queue` `queuemute` with `item` (SRC/screens-daily/queue.mjs:213–214) | served |
| Queue: mute kinds for a case (`queueMuteCase` A:16006) | `queue` sends the item form only (queue.mjs:214) | **GAP Q1** |
| Queue: list of mutes, unmute item or case (`queueMuteReportHtml` A:16069, `queueUnmuteItem` A:16144, `queueUnmuteCase` A:16157) | — | **GAP Q2** |
| Record: every bundle as rows, by type and state (`renderRecord` A:2745, `list`) | `finder` needs words to search (REQ/screens-daily:25) | **GAP F1** |
| Find: text and field search, hold picked rows, let the set go (`renderFinder` A:12759) | `finder` · screens-daily (REQ/screens-daily:25) | served |
| Find: scopes Questions, Actions, Watched, Needs a second look (A:1716–1717, 1730; `finderScopes` A:12599) | — | **GAP F1** |
| Find: passage route (`meaningrows`, A:12873), subjects or meaning route (`concerns`, A:12931) | `find-in` finds within a chosen scope only (REQ/screens-daily:28) | **GAP F2** |
| Find: hold everything a query matches (A:13677–13682); ask what moved (`finderCheckSelection` A:13612); cite over the held set (A:13641) | `finder` holds only picked rows (finder.mjs `select`, `kind: "enumerated"`); `find-in` cites one result at a time (REQ/screens-daily:28) | **GAP F3** |
| Subjects: find a subject; its relations, the documents that concern it, connections (`renderSubjectView` A:16533, `showEntity` A:16584) | `people`/`person` cover people and organizations only (REQ/screens-investigate:18, 50–51) | **GAP S1** for other kinds (office, ordinance, source) |
| Subjects: create a subject (`entityCreateGo` A:17139) | `people` "Add someone the record follows"; `proceeding`; `places` offices (REQ/screens-investigate:51, 33; REQ/screens-settings:53) | served for those kinds; other kinds are S1 |
| Subjects: another name (`aliasGo` A:17211, `entityalias`); declare a relation (`relationGo` A:17265, `relationdeclare`); resolve mentions (`resolveGo` A:17583, `resolve`, `readingname`); testify a resolution (`testifyGo` A:17637, `resolvetestify`); work out connections (`connectGo` A:17656, `connect`) | — (`identityclaim` on `person`/`document` is a different act) | **GAP S2** |
| Progressions: declare or revise a flow, read an instance, thread a document, discharge a step (`renderProgressions` A:17691; `progDefineGo` A:17787; `progThreadGo` A:18050; `dischargeGo` A:18073) | — | **GAP S3** |
| Themes: list, search, declare, open, place, confirm a hunch (`thmRenderList` A:26341, `thmDeclare` A:26362, `thmPlace` A:26435) | — | **GAP S4** |
| Projects list (`renderProjects` A:8843) | `projects` · screens-daily (REQ/screens-daily:42) | served |
| Project: invite, join (`ROSTER_ACTS` A:9109–9145) | `project` (REQ/screens-inquiry:18) | served |
| Project: ask to leave, remove a participant, add an owner, rescue a stranded project, fork (`ROSTER_ACTS` A:9109–9145; `projectleave`, `projectremove`, `projectowneradd`, `projectownerrescue`, `projectfork`) | — (`projectownerrescue` is only listed in SRC/interface-shell/index.mjs:110) | **GAP R1** |
| Project: owner removal by ballot, with its arithmetic (`openBallotDialog` A:14365, `doBallot` A:14458; `projectownerremove`, `projectownerarith`) | — | **GAP R1** |
| Project: who may see it, set by the owner (`projectVisibilityHtml` A:9243, `doProjectVisibility` A:9275); chosen at creation and at fork (A:19738, 9134) | — | **GAP R2** |
| Project: its contents (questions, actions, documents) and its draft cases (`projectContentsHtml` A:8976, `projectDraftsHtml` A:9028) | `project` lists questions (REQ/screens-inquiry:39); `case-editor` lists drafts (REQ/screens-publish:18) | served (see Observation 1) |
| Review: collected, not yet vouched for; release with acknowledgment (`renderReview` A:13789, `doRelease` A:13903) | `held` · screens-intake (REQ/screens-intake:23) | served |
| Members: roster, invite, change status (`renderMembers` A:14914; `doCustodialAct` A:14873 with `memberadd`, `memberset`) | `members` · screens-settings (REQ/screens-settings:18–19) | served |
| Members: withdraw a member's key (`signerset`) | `members` (REQ/screens-settings:57) | served |
| Members: an administrator registers a key for a member (`signeradd`) | — | ruled to need no screen: DEC-213 (3) (`docs/development/DECISIONS.md:3423`), K3105 (`build/rulings.md:3106`) |
| Members: governance panel, the administrator arithmetic (`governanceHtml` A:14676, `adminarith`) | — | **GAP M1** |
| Add: capture from an address (`addCapture` A:20312, `acquire`), watch it, attest | `capture` · screens-intake (REQ/screens-intake:18, 40, 45); `document` `attest` (REQ/screens-inquiry:25) | served |
| Add: write what you know, with no document (`ADD_TYPES` A:19386, `addGo` A:19860) | `capture` "What I saw or heard" (`testify`, REQ/screens-intake:20) | served; DEC-213 (3) rules that the intake form needs no screen |
| Add: a question with no project | questions open inside a project (REQ/screens-inquiry:41); from a chain on `explore` (REQ/screens-investigate:21); from a hint on `queue` | served by those routes |
| Add: a project with its visibility | `projects`/`home` "Start a project" (REQ/screens-daily:18, 42); its visibility is R2 | partly served (R2) |
| Add: an action of any kind, with counterparty, basis, clock and risk tier (`addActionPaneHtml` A:19491) | `request` (records request), `plan` → `start-send` (REQ/screens-action:18–25) | served under the v0.2 Action design; the risk tier is A1 |
| Document: the record's copy, grade, passages, cite, release, attest, retire, monitor, versions, what cites it (`openBundle` A:7325) | `document` · screens-inquiry (REQ/screens-inquiry:25, 48) | served |
| Document: the bundle's own written body, and the rendered source snapshot, opened and checked against its hashes (A:7394–7397; `openArtifact` A:3069) | `document` draws no body; `open-file` serves the original (REQ/screens-intake:26–27) | **GAP D1** (the body) |
| Document: the links the captured page carried, and the "leave the record" warning (A:7427, `leaveTheRecord` A:7011, `links`) | — | **GAP D2** |
| Document: finish an unfinished capture (`continueCapture` A:7125) | — | **GAP D3** |
| Document: history, earlier revisions with a diff (A:7462, `toggleDiff` A:3219) | — | DEC-213 (3) says each document's page serves the bundle history (`DECISIONS.md:3423`), but `document` draws none (document.mjs:89–198). **GAP D4** |
| Document: subjects it names, connections, choose the determining mention (`docKnowsPanel` A:18140, `docChooseOnPoint` A:18288, `connectionchoose`); progressions it sits in (`captureprogressions`) | `document` draws people named, with `identityclaim` only (document.mjs:154–166) | **GAP D5** |
| Document/question: Defer or Dismiss a question (disposition; `openDisposeDialog` A:14087, `doDispose` A:14144, `dispose`) | `question` offers `narrow`, `conclude`, `withdrawconclusion` and no disposition (REQ/screens-inquiry:21) | **GAP D6** |
| Document: sever or reinstate on the document's strip (`ACT_FLOW` A:10439) | `question` `sever`/`reinstate` on each leg (REQ/screens-inquiry:42) | served |
| Question: as authored, legs, both strengths, conclude with or without a falsifier (`openInquiry` A:8562, `doConclude` A:10931) | `question` (REQ/screens-inquiry:21, 42) | served |
| Question: elicitation, grouping the legs into sets of reasons (`openElicit` A:11203, `doElicit` A:11417; `inquiryground`, `partitionindependence`) | — | **GAP V1** |
| Question: "What relies on this" (A:8744, `backlinks`) | — | **GAP V5** (read only) |
| Question: ask whether a newer version of a leg's document exists (`askVersionNotice` A:8302) | `queue` items `adoptversion`/`keepversion` (REQ/screens-daily:22) | served, as a pushed item rather than a pulled read |
| Question: the publication statement (`publicationEntryHtml` A:7988) | `ceremony` · screens-publish (REQ/screens-publish:24–26, 45–48) | served (superseded by the full ceremony) |
| Versions: rotate between readings, hide one (`versionReviewOpen` A:24014, `versionHideSend` A:23965; `versionhide`) | `question` reads `basisversions` but draws no rotation and no hide (REQ/screens-inquiry:21) | **GAP V2** |
| Accept ceremony: accept, reject, consider, revert a reading, with the affirmation per set (`acceptCeremonyOpen` A:24604, `acerSend` A:24529) | — | **GAP V3** |
| Stance: the reading a project stands on (`stanceOpen` A:25495, `stanceSend` A:25446, `versioncurrent`); its conclusion and withdrawal | `question` `conclude`/`withdrawconclusion` (REQ/screens-inquiry:21) | conclusion served; **GAP V4** for `versioncurrent` |
| Action: move, record a reply (`openActionMove` A:9810, `openActionCorrespond` A:9918) | `action` · screens-action (REQ/screens-action:28) | served |
| Action: the laws it goes under, on the action (`openActionLaws` A:10043), and the proposals beside them (`actionlawspropose`) | `request` `actionlaws` at authoring only (REQ/screens-action:25) | partly served; **GAP A2** for revising on an existing action and the proposals |
| Action: revise the risk tier with a reason (`openActionRiskTier` A:10155, `actionrisktier`) | — | **GAP A1** |
| Action: record a non-response as a finding (`openNonResponseInquiry` A:10247) | — | **GAP A3** |
| AI session: indicator, run, its connections (`aiSessionOpen` A:23430) | assistant dock · screens-inquiry (REQ/screens-inquiry:28, 43) | served. Legacy's connection review writes nothing (A:23413) |
| Review copy, member door: draft, edit, grant, revoke, comment, acknowledge (`rvcSave` A:25865, `rvcGrant` A:25878, `rvcRevoke` A:25888, `rvcComment` A:25897, `rvcAcknowledge` A:25788) | `case-editor`, `review-copy` · screens-publish (REQ/screens-publish:18, 21) | served |
| Review copy: export to a file, the quartet on every page (`rvcExport` A:26080) | — | **GAP C1** |
| Review copy, recipient door: read, comment (`rvsOpen` A:26203, `rvsComment` A:26221) | `review-outside` (REQ/screens-publish:50) | served |
| Review copy, recipient door: acknowledge what it leaves out (`rvsAcknowledge` A:25797, `statementack` by secret) | `review-outside` has `reviewcomment` only (REQ/screens-publish:50; REG `review-outside`) | **GAP C2** |

## (2) Each GAP: has the design stream drawn it?

I searched REG, `library.json`, `words.json`, MOCK and `mock-acts.js` for each gap op (by `"<op>"`) and for its words (leave, fork, owner, visibility, theme, progression, alias, risk tier, readings, unmute, dismiss and defer, links, stranded, elicit). Only two are drawn.

**Drawn. Entry text for the owning module's T48 L11 job:**

- **P1 · screens-publish.** *Entry:* "`published` (R6) gains the evidence a reader can check without the group, as the registry draws it: REG:3323 ('evidence; checkable without the group'), MOCK:1284 (each finding's 'the evidence' link) and MOCK:1287 ('Download the complete edition'). Each evidence row opens its bytes through the public `publishedbytes` by its full `sha256`, with no `Authorization` header (interface-shell R30), as a link the reader can follow or save. The complete edition is offered as a download through `publishedcase` (`cs.download`). Today the screen lists evidence by a 12-character hash prefix and fetches nothing (SRC/screens-publish/published.mjs:67–71). This replaces legacy-ui's `pubBytes` (A:22508). Test: each evidence row's address is `publishedbytes` with its sha and no header. Control: a row with no sha draws no link."
  Not drawn: legacy-ui's free 'Verify any hash' panel (A:22567), which no new entry carries.
- **Q1 · screens-daily.** *Entry:* "`queue`'s `queuemute` gains the case form, as the registry labels it, 'Mute a kind' (REG:1300), and MOCK:638 draws it, 'Stop this kind of hint for the project': on a CONDITION item, the act sends `{case, kinds: [the item's kind]}` (`queue` R19, R20) and draws `muted_kinds` from the answer. The item form stays where it is drawn now (SRC/screens-daily/queue.mjs:213–214). This replaces legacy-ui's `queueMuteCase` (A:16006). Test: the case form's body. Control: an OBLIGATION item draws no mute."

**Not drawn (each keeps legacy-ui, with the gap named, under the T48 plan's only hard reason, `build/plan/draft-T48-plan.md:11`):**

| Gap | What a user loses | Owning screen module if drawn |
|---|---|---|
| P2 | The reader's floor picker on a published case | screens-publish |
| Q2 | Seeing one's mutes and unmuting (`queuemute` `unmute`) | screens-daily |
| F1 | Browsing the whole record, and the Questions, Actions, Watched and Needs-a-second-look lists | screens-daily |
| F2 | Corpus-wide passage search (`meaningrows`) and meaning-layer search (`concerns`, `searchfields`' scopes) | screens-daily |
| F3 | Holding a query rather than rows; asking what moved; citing over a held set | screens-daily |
| S1 | A subject page for kinds other than person and organization (office, ordinance, source) | screens-investigate |
| S2 | `entityalias`, `relationdeclare`, `resolve`/`readingname`, `resolvetestify`, `connect` | screens-investigate |
| S3 | Progressions: `progressiondefine`, `progression`, `thread`, `discharge`, `captureprogressions` | screens-investigate |
| S4 | Themes: `themeread`, `themedeclare`, `themeplace` | screens-investigate |
| R1 | `projectleave`, `projectremove`, `projectowneradd`, `projectownerremove` (ballot, `projectownerarith`), `projectownerrescue`, `projectfork`. MOCK:839 draws only invite and join | screens-inquiry (`project`) |
| R2 | Project visibility: `projectvisibility`, `projectvisibilityset`, and the choice at creation. MOCK:289 and `words.json:1387` mention a hidden project but draw no setting | screens-inquiry / screens-daily |
| M1 | The administrator arithmetic (`adminarith`) | screens-settings |
| D1 | A bundle's own written body; the rendered, hash-checked source snapshot | screens-inquiry (`document`) |
| D2 | The captured page's links (`links`) and the leave-the-record warning | screens-inquiry |
| D3 | Finishing an unfinished capture (`acquire` `continue`) | screens-inquiry / screens-intake |
| D4 | Bundle history and revision diff. DEC-213 (3) assumes `document` serves it; nothing draws it | screens-inquiry |
| D5 | Subjects, connections and the determining mention (`connectionchoose`); progressions on a document | screens-inquiry |
| D6 | Defer or Dismiss a question (`dispose`) | screens-inquiry (`question`) |
| V1 | Elicitation (`inquiryground`, `partitionindependence`) | screens-inquiry |
| V2 | Rotating between readings, `versionhide` | screens-inquiry |
| V3 | The accept ceremony (`versionaccept`, `versionreject`, `versionconsider`, `versionrevert`, `versionstrength`) | screens-inquiry |
| V4 | The project's stance (`versioncurrent`) | screens-inquiry |
| V5 | "What relies on this" on a question (`backlinks`) | screens-inquiry |
| A1 | Revising an action's risk tier (`actionrisktier`) | screens-action |
| A2 | `actionlaws` on an existing action; `actionlawspropose` | screens-action |
| A3 | A non-response opened as a question with the action as its reference. MOCK:237 and MOCK:629 show 'no reply recorded' with no act | screens-action |
| C1 | Exporting a review copy to a file | screens-publish |
| C2 | A recipient acknowledging the statement (`statementack` by secret) | screens-publish |

I recommend that BOB put this list to UX-DESIGN in one channel act. A gap the stream rules out (as DEC-213 (3) did for `signeradd`) then becomes "dropped, with its reason" rather than a reason to keep legacy-ui. Until then, T48-41 cannot merge under K3052 (`build/rulings-active.md:58`) without leaving users these capabilities.

## (3) Non-legacy dependencies on `civicos-ui/` or the `civicos` Worker

- **No code imports from `civicos-ui/`.** No `import`, `readFileSync` or `require` of a `civicos-ui` file exists outside `civicos-ui/` (searched `*.mjs`/`*.js`, excluding `dist/` and `release/`). Every other hit is a comment: SRC/affordances.mjs:338, :517, :613; SRC/queue/index.mjs:1388, :1461; SRC/control-plane/index.mjs:664, :2630; SRC/admission/checks.mjs:141; SRC/record-grammar/labels.mjs:292, and others. These turn historical when the folder is deleted. Re-wording them is optional.
- **plane · SRC/plane/screens.mjs:1–84** (plane R24, `build/requirements/plane.md:101`; T33-90 at :165 says "the design stream replaces them when its interface ships"). This file is legacy-ui's screen list, handed to `answers`' explain read (SRC/plane/store.mjs:94, :257) and checked by SRC/plane/wizards.mjs:7, :40, and by `test/m/plane/release.test.mjs:8` and `t43.test.mjs:13`. Once legacy-ui is gone, the explain read describes screens that no longer exist. It needs a plane entry before or with T48-41 that re-points R24 to `SCREEN_REGISTRY` or retires it.
- **CI · `.github/workflows/regression.yml:52`** runs `civicos-ui/test/*.test.mjs` among the "kept suites". The glob must be dropped in the T48-41 change. No module owns `.github/`.
- **bundler · `bio-plane/scripts/deploy.mjs:102–116`** (`NOT_A_PLANE.civicos`, which refuses to deploy the plane over the UI Worker) and **`bio-plane/scripts/deploy-fleet.mjs:7, :86, :93`** (a message naming `civicos-ui/deploy-ui.mjs`). Both are guards and wording, not a runtime dependency; drop or re-word them after the Worker is retired.
- **journey-check · SRC/journey-check/walker.mjs:14, :83** (`LEGACY_UI_WORKER = "civicos"`) fails a walk that reaches the old Worker. It stays valid after the retirement.
- **The `civicos` Worker.** No `wrangler.jsonc` in the repository binds to it. The plane's services (`bio-plane/wrangler.jsonc:121–128`) are pdf-worker, agent-worker, ocr-worker, sheet-worker, file-scanner and itself. The dependency runs the other way: `civicos` binds `PLANE → biosmoke7` (`civicos-ui/deploy-ui.mjs:19`; `worker.template.mjs:13–19`). The installer and the release do not ship `app.html` (no match in `newgroup/` or `release/`). Taking the Worker off `biosmoke7` breaks nothing in the repository.

## (4) Tests to move before the delete

**None needs to move.** Every file in `civicos-ui/test/` drives `app.html` through `extract.mjs`/`appScript`, so what it asserts is legacy-ui's. Where a suite also asserts something about a plane module, the module's own test already holds it:

- `meaning-arms.test.mjs:155–195` (`searchfields`' meaning half; `op=search` compiles `leg:`, `resolves:`, `content:`; `grade:` is an unknown field): held by `test/m/retrieval/search.test.mjs:130–147` (R16, `meaning` equals `meaningVocabulary()`) and `test/m/query-language/grammar.test.mjs:141–145` (plus its "unknown field" arm). The one arm not held anywhere else is the `syntax` line matching `leg:.*resolves:.*concerns:.*MEANING layer` (:173). It is optional: if BOB wants it kept, it goes to retrieval's R16 test.
- `statement-ack.test.mjs:367–392` (every `STATEMENT_ACK_*` code has a row or a detail): held by `test/m/case-inputs/statement.test.mjs:23` and `t46-words.test.mjs:64–76`. This arm also reads a stale path, `case-authoring/index.mjs` (red N794).
- `review-copy.test.mjs:470, :543, :666` (`NO_REVIEW_COPY`; `casedrafts`; the `inband` quartet hash): held by `test/m/review/doors.test.mjs`/`acts.test.mjs` and `test/m/control-plane/t46-door.test.mjs:152–157`, `stamps.test.mjs:209–229`.
- `several-cases-choice.test.mjs:255–273` (the `FINDING_IN_SEVERAL_CASES` translation): held by `test/m/public-read/checks.test.mjs` and `published.test.mjs`.
- `progression-revision.test.mjs` (a revision needs a basis and a citation; v2 appended): held by `test/m/progressions/define.test.mjs:130` (R4, R23).
- `queue-recipients.test.mjs:205–210` (bias-debt recipients): held by `test/m/queue-producers/*` (recipients) and `bias/`.
- `notifications.test.mjs:349–359` (`classOfKind`): held by `test/m/queue/noticed.test.mjs`, `signals.test.mjs`.
- `stdio-census.test.mjs` takes a census of `civicos-ui` suites only. `bio-plane/test/stdio.mjs` is test-support's, tested in `test/m/test-support/test-support.test.mjs:24, :310`.
- `finder.test.mjs:205–224`, `document-page.test.mjs:11`, `elicitation.test.mjs:74`, `analyst-vocabulary*.mjs` read plane source or constants only to check the page's own mirror of them. They are legacy.
- `member-token-retired.test.mjs:113` tests `worker.template.mjs`, which is legacy.
- `bio-plane/test/budget.mjs` and `bio-plane/test/caseceremony.mjs` are helpers, imported only by `civicos-ui/test/review-copy.test.mjs:110`, `statement-ack.test.mjs:76` and `several-cases-choice.test.mjs:68`. No non-legacy test imports either, so both can be deleted with the rest.

## Observations (outside the census, owned by /app)

1. **What `/app` builds but cannot reach from the project.** `project` links only to its questions, `projectai` and `find-in` (SRC/screens-inquiry/project.mjs:171, :216, :284, :307). Nothing in `/app` links to `plan`, `timeline`, `money`, `calculation`, `proceeding`, `standard`, `case-editor`, `review-copy`, `ceremony`, `docket` or `imported`: a search of all screen modules for `cs.go`/`href` finds none, and `REF_SCREENS` (SRC/interface-shell/index.mjs:80–81) has no kind for them. Legacy's project workspace reached its draft cases and contents directly (A:8976, :9028). Unless something else links them, a member reaches these screens only by typing the address. This is screens-inquiry's (R1 `planopen`), journey-check's to catch.
2. **Ops that are only partly served.** `release` and `retire` on `document` make their own selection (document.mjs:230, :251). Legacy-ui's batch release over a held set is served by `held`'s hold strip, not by `finder`.
