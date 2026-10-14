**Status** · UNREVIEWED worker draft (BOB #169, 2026-10-14): N1026–N1047 folded into draft-T48-plan.md; BOB reviews it whole before T48 opens.

# T48 fold: N1026–N1047 into `draft-T48-plan.md`

Read-only worker for BOB, 2026-10-14, against `tranche/T47` @ 0caa52f6c8. Sources: `next.md` N1026–N1047, `draft-T48-plan.md`, `draft-updates.md`, `modules.json`, `rulings-active.md`, `rulings.md` K3138, K3146, K3158.

**Rule applied.** Most of these entries say "hard reason: the order". That means the provider's layer was already closed *in T47*. T48 reopens every layer from L1, so that reason lapses for T48 (P10, P19). The same goes for "one job per module" where the T47 job was already used (N1042, N1045, part of N1046). Every entry below therefore joins T48 unless a different hard reason still holds.

## Joins T48: merged into entries the draft already has (one job per module)

- **T48-3 · ai-accounts** gains:
  - (N1026; DEC-215 (1), K3138) a read of AI use per day over thirty days, and per period against each limit, summed and naming no member (K1450);
  - (N1041, K3148) `aiKeptAway` answers its one row (R35, now ai-accounts R7) fail-closed when it cannot be reached, or stays silent as R6's 502. The function moves here, so this is not credentials' work.
  - Both are added on top of the copy, as new ids after R33. The copy stays byte-identical to credentials' code, apart from these two.
- **T48-5 · membership** gains (N1036) the "since the viewer last looked" mark that the Home's "what members did" reads, only if no module already holds one (re-tested at START; see (b)).
- **T48-7 · credentials** gains (N1045, K3150) `passwordresetlink` reads `member` from the query as well.
- **T48-29 · actions** gains:
  - (N1035, K3145) `action` answers its project and title; a read of `actionpressure`'s marks;
  - (N1040, K3147) `actionsOps` stops spreading `actionRecordsOps` (plane R45 spreads it).
- **T48-30 · wizard-scripts** gains (N1036, DEC-218) `dash-home` retired from `screen-registry.mjs`.
- **T48-32 · notice-producers** gains (N1044) the undetermined queue item shows duties' member-facing reason instead of `why`. It runs after T48-49.
- **T48-34 · op-declarations** gains:
  - (N1039) its frozen tables are built lazily;
  - (N1045) R56's control holds at the door: a member-scoped `ai` credential is refused `sourceof` (with T48-59);
  - (N1047) specs for the new update ops: the notice read and the decision act.
- **T48-35 · answer-envelope** gains (N1039) its frozen tables are built lazily, so they add nothing to the plane's global scope.
- **T48-38 · screens-daily** gains (N1036; DEC-218, DEC-219, K3146) the Home as every member's nerve centre, arrangement C, as drawn on PR #33. This covers:
  - the strip; what needs you; what needs the group; each area at a glance, across four areas;
  - the projects table (T48-6); members' acts since the viewer last looked; "What happened?";
  - the new member's and new group's homes; no reading at zero; the rail kept.
  - Each read it draws is named at START, from its provider's T48 job or from an existing read. Text BOB's.
- **T48-40 · plane** gains:
  - (N1039, K3147) court-data, the checker program and assets are carried as upload parts or parsed on first use, so the global scope is under its 500 ms budget (509 ms median today). The budget is tested at the plane's shape;
  - (N1047) the daily update check: a plain GET at a time spread per group, sending no group, member or credential. It verifies the notice with T48-42's release keys, refuses a downgrade or replay, caps the notes and keeps them text-only. It stores the notice and the administrator's decision (Update, Not now, Skip with a reason, recorded with who and when). A security release returns after a snooze.

## Joins T48: new entries (T48-42…T48-66)

### L1
- **T48-42 · signatures** · (N1047; K3158; draft-updates §1–2) the release keys in one place, used by both the installer (`ARMED_SIGNERS`) and the plane, plus a verify of a release notice under its own namespace, tested with a tampered note and an old version · text BOB's · provider for T48-40 and T48-66.
- **T48-43 · bundler** · (N1047) `release-assemble.mjs` writes the release notice beside the assets: version, date, the manifest's sha256, a security mark, and notes in members' words (for members, for administrators, and an administrator's must-do). The notes are inside what is signed. The workflow's signing and publishing step is `not_product` (`.github/`, BOB's act between tranches) · after T48-42.
- **T48-44 · court-citations** · (N1039, K3147) court-data held as data, parsed on first use (or as an upload part), so it adds nothing to the plane's global scope; tested.
- **T48-45 · ooxml** · (N1039) its frozen tables built lazily on first use; tested.

**L1 merge order:** record-grammar, signatures, bundler, court-citations, ooxml, file-scanner.

### L5 (new to T48)
- **T48-46 · events** · (N1031, K3145) the timeline's items carry participants and grades. A relation records "which came first" when no dated attestation orders two events · text BOB's.
- **T48-47 · connections** · (N1030, K3145) an act attaching a source to a declared step that explore walks · text BOB's · provider for T48-51.
- **T48-48 · standards** · (N1029, K3145) a read listing the standards proposed for a project, counting only what the viewer may see · text BOB's.
- **T48-49 · duties** · (N1044, K3150) `occurrencesOf` answers, beside `why`, a member-facing reason: a code with its words in `words.json`, naming no ISO date, zone id or ruling number · text BOB's.
- **T48-50 · people** · (N1032, K3145) `person` answers the identity claims on the cluster, with their ids, so `withdrawidentityclaim` can name one.
- **T48-51 · explore** · (N1027; DEC-215 (2), K3138; N1030) the connections read two rings out from a centre: each step's kind, word, grade and citation, and where the limit stopped (K1469, K1487). A walk stopped at its depth says so (not only `truncated`). `exploreverify` works over a chain · text BOB's · after T48-47.
- **T48-52 · calculations** · (N1033, K3145) `spotcheckvisit`'s author check compares under membership's one viewer spelling, so the founder's `member:admin` testimony matches `admin`; tested for an administrator's session. The comparison site is `calculations/index.mjs`:1703; see (b) · text BOB's.

**L5 merge order:** events, connections, standards, duties, people, explore, calculations.

### L8 (additions)
- **T48-53 · case-checker** · (N1039) the checker program is carried as an upload part, not inlined in the plane's global scope. `program.mjs` is regenerated before the bundles (K1540).
- **T48-54 · review** · (N1038, K3147) `reviewgrant` takes the reader's end date (`until`), and the grant lapses at it (R2, DEC-100); tested · text BOB's.

**L8 merge order:** case-grammar, publication, public-read, case-checker, case-import, review.

### L9 (additions)
- **T48-55 · filings** · (N1034, K3145) a read that answers a prepared draft's text, blanks and fills after `filingprepare` or `communicationprepare`, so a reload does not lose it · text BOB's.
- **T48-56 · action-plans** · (N1043, K3149) "Ask the assistant for options" starts a planning run (R30/R31's machine proposal), never a member's own proposal; tested · text BOB's.

**L9 merge order:** action-records, conformance, action-grammar, actions, filings, action-plans.

### L11 (additions)
- **T48-57 · op-grades** · (N1042, K3149) `translationdraft` is graded (not `undetermined`); `groupdescriptiondraft` and `securitymap` get rows. (N1047) The new update ops are graded, and Skip is a reasoned act.
- **T48-58 · queue-producers** · (N1047) one administrator to-do per verified newer release; a newer release replaces an unanswered older one; the to-do leaves once the running version answers it · after T48-40's provider half (see the merge order).
- **T48-59 · admission** · (N1045, K3150) a member-scoped `ai` credential is not admitted to `sourceof` (op-declarations R56's control enforced at the door); tested · with T48-34.
- **T48-60 · interface-assets** · (N1028; DEC-215 (3), K3138) the three kind tokens (`kind-money`, `kind-part`, `kind-mention`), light and dark. (N1039) Assets are carried as upload parts.
- **T48-61 · screens-settings** · (N1026) the Members and "AI for this project" account panels gain thirty days of bars (estimated dollars a day) and a meter against the limit, drawn from T48-3.
- **T48-62 · screens-inquiry** · (N1026) the same bars and meter on "The assistant" panel, from T48-3.
- **T48-63 · screens-investigate** · (N1027) the connection graph on `explore`, `person` ("Connections") and the money trail, from T48-51, with T48-60's tokens. It also draws:
  - (N1029) the `standard` screen's proposals from T48-48;
  - (N1030) "stopped at its depth";
  - (N1031) participants, grades and order on the timeline (T48-46);
  - (N1032) withdrawing an identity claim by id (T48-50).
- **T48-64 · screens-publish** · (N1038) the reader's link shows its end date, from T48-54.
- **T48-65 · screens-action** · draws:
  - (N1034) the prepared draft, re-read on reload (T48-55);
  - (N1035) the action's project, title and pressure marks (T48-29);
  - (N1043) "Ask the assistant for options" as a planning run (T48-56).
- **T48-66 · installer** · (N1047; installer R1, R52, R54) `/update` takes the chosen version and refuses any other. It installs only a signed release whose hashes match, verified with T48-42's keys. Deploying it is Bob's act (K1716) · text BOB's.

**L11 merge order:** wizard-scripts, op-grades, affordances, notice-producers, queue-producers, instance-setup, op-declarations, admission, answer-envelope, store-door, signin-door, interface-assets, screens-settings, screens-daily, screens-inquiry, screens-investigate, screens-publish, screens-action, control-plane, plane, installer, legacy-ui.

**Exception to `modules.json` order: queue-producers.** It needs the plane's stored notice, but plane is later in L11, so queue-producers cannot use it. Two options:
- *Recommend:* plane registers the to-do through a producer hook that queue-producers exposes, so no edge points later.
- *Alternative:* the store moves to an earlier provider. That is BOB's packaging; see (b) 1.

**L5 opens in T48.** The draft had no L5 jobs.

## Left out of T48 (rows for the table)

| entry | hard reason |
|---|---|
| N1037 (`regression` runs `npm ci` in journey-check) | none owed as a job: `not_product` (`.github/`), process tooling done by BOB between tranches (K3146) |
| N1046 (an op answering a template's text by handle; plane, filing-templates) | a dependency not yet built: no offered script carries a `{template}` draft (wizard-scripts R22), and the `@records-request` templates wait on N858's reviewer (Bob's, K3081, K3120) |
| N1047's Settings › Updates screen, the to-do's words, and `words.json` text | the design stream's: not drawn (draft-updates "screens owed to the design stream", HANDOFF) |
| N1028's per-area dashboards beyond the Home (DEC-216's rail on each, DEC-214 (4)) | the design stream's: not drawn. S20 is no longer Bob's (DEC-218, K3146), so re-word the draft's "dashboards (S20 …) Bob's" row |

## (a) Distinct modules with a T48 job after folding

Draft 41 + 25 new = **66**:

- **L1 (6):** record-grammar, signatures*, bundler*, court-citations*, ooxml*, file-scanner
- **L2 (6):** ai-accounts, record-core, membership, project-roster, credentials, promotion
- **L3 (2):** provenance, acquisition
- **L4 (2):** reading-pipeline, extraction
- **L5 (7):** events*, connections*, standards*, duties*, people*, explore*, calculations*
- **L6 (9):** inquiry, basis-versions, ai-use, ai-runs, run-productions, skills, question-explorer, answers, agent-worker
- **L7 (0)**
- **L8 (6):** case-grammar, publication, public-read, case-checker*, case-import, review*
- **L9 (6):** action-records, conformance, action-grammar, actions, filings*, action-plans*
- **L10 (0)**, apart from the carried T47-45 and T47-46 if left open
- **L11 (22):** wizard-scripts, op-grades*, affordances, notice-producers, queue-producers*, instance-setup, op-declarations, admission*, answer-envelope, store-door, signin-door, interface-assets*, screens-settings*, screens-daily, screens-inquiry*, screens-investigate*, screens-publish*, screens-action*, control-plane, plane, installer*, legacy-ui

(* = new to T48)

## (b) Not fully settled

1. **N1047, where the update notice and decision are stored.** draft-updates names the plane. The plane is last in L11, after queue-producers, so the to-do cannot "use" it without an edge pointing later. BOB's packaging options:
   - put the store in `instance-setup` (L11, before plane; it holds the group's setup state), but it must also sit before queue-producers in `modules.json`, which it does not (145 vs 140);
   - give queue-producers a producer that plane registers.
   Also open: whether the daily schedule belongs in `scheduler` (L10, the cron hub) rather than plane. If so, scheduler gains a T48 job in L10.
2. **N1033.** The check sits in calculations (:1703). The spelling could instead be fixed at the author (provenance's testify, L3) or by a membership helper (T48-5). I chose calculations, as the comparison site, calling membership's existing viewer normalisation. next.md says "to confirm and route at T48's opening".
3. **N1036's reads.** Its per-area reads have not been mapped to providers. "Members' acts since the viewer last looked" and the release, security level and group key's use readings may each need a provider line: membership T48-5, instance-setup T48-33, ai-accounts T48-3. `queue` (L11) may need a job for "the queue's items by kind and whose move". Settle each at screens-daily's START census. Each line that is missing joins its provider's T48 job, or becomes a hard-reason row.
4. **N1041's home.** The function moves to ai-accounts in T48-3, so the fix goes there. This means a copy job also carries a change. Alternative: credentials' T48-7 fixes it before the copy is taken, which would break the copy-first order. Keep it in T48-3.
5. **Side note.** N1025 is marked applied in T47 (T47-93, K3150), so the draft's T48-6 (project-roster) drops unless T47's Outcome leaves T47-93 open. In that case L2 would be 5 and the total 65.
