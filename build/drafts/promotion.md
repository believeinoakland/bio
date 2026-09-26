<!-- UNREVIEWED: written by a drafting worker for BOB #38 on 2026-09-26 (P18 preparation) and never reviewed; the membership draft's worker was stopped mid-run when P3 stopped product work. BOB reviews it before it becomes build/requirements/<module>.md. -->
# promotion — requirements

**Status** · DRAFT, written for BOB from the T1 extraction survey. Layer 2. Code today: `bio-plane/src/gate.mjs`
(owned already), and `promote()` (`bio-plane/src/store.mjs:17881-20109`) and `reopen()`
(`bio-plane/src/store.mjs:7984-8250`), both extracted from the `legacy-store` monolith (plan entries N7/N8 and the
"promote", "reopen" guess in `layers.md`, "The legacy modules"). K10: check C-18.8 moves here and verifies through
`signatures`; the hand-written SSHSIG/Ed25519 verifier in `bio-checks.mjs` (lines 6120-6571, "Release-signature
primitives") retires once this module calls `signatures.verifySshsig` in its place.

## Public

### Purpose

The one write path by which a bundle enters or re-enters the record. It runs the bundle-format checks
(the C-series the bundle carries, and the release-signature check over a release event recorded inside a
promoted document) and refuses the whole write when any fails: either the bundle advances as one transaction
or nothing does. It holds the compare-and-swap that makes the substrate's lack of mutual exclusion harmless,
the append-only history the record is checked against, and the fence that says which set-down dispositions
may be picked back up. It does not decide what a document must say to be truthful — that is the shape the
catalogue states — only that no bundle enters or re-enters the record without passing it.

### Provides

**`promote(pkg) → {ok:true, bundleId, ...} | {ok:false, reason, ...}`**, where `pkg` is `{bundleId?, base,
files, meta, snapKey, author, writer?, operation?, register?}`.
- **R1** `base` is the compare-and-swap: it must equal the bundle's current `bundle_sha`, or the empty-string
  hash when there is no prior snapshot (a creation). A stale `base` is refused (`STALE_BASE` or equivalent),
  never merged and never silently taken as the new value.
- **R2** Either every table the write touches is committed, or none is: a check that fails after some rows
  would have been written refuses before the first write, so a caller never observes a torn promotion.
- **R3** A creation snapshots nothing; a revision copies the superseded live files into history before the
  new files become live (State Rules v1.5 §2.4). History is append-only: no promotion modifies or deletes an
  existing `_history/` entry.
- **R4** A promotion that reuses a snap key another entry of the same bundle's manifest already holds is
  refused by name (`SNAP_KEY_TAKEN`, C-67.1) before anything is written.
- **R5** Every inline file's digest and byte length are computed here, over its own stored bytes (never taken
  from the caller): a supplied digest naming other bytes is refused before anything is written, and a stored
  size is always the size of what is actually stored (State Rules v1.5 §8, the Mechanical Verification Law).
- **R6** An inline file whose computed byte length exceeds the instance's inline bound is refused by name
  (`OVERSIZE_INLINE`) and nothing is written.
- **R7** A mechanical writer (one whose `writer` names an automated actor, e.g. `monitor-tick`) is confined to
  its declared field set and its declared envelope (`bundle.md`, `snapshots/`, the append-only mechanical
  files); a write outside that envelope, or under an operation name the mechanical registry does not declare,
  is refused (C-20.1) and never silently narrowed to fit.
- **R8** A revision naming a bundle that a live edge cites for retirement is refused (`CITED`, the same fence
  `retire` runs), naming every citing id; a reinstated edge may not land on an item this fence would refuse
  (State Rules v1.5 §4.1).
- **R9** A promotion refuses a document whose type disagrees with the head's type by a move the type's own
  declared state-edge table does not carry, by a named reason; a revision that states no type is not refused
  for that alone — it carries the head's own type forward, and says so on the answer, never silently.
  *(not yet met: D-546, D-673, D-578, D-628 — the current code (C-86.1-4) checks the promoted TYPE label
  against the head and against the document, but does not yet check every type's declared state-edge table,
  and a typeless revision is not yet carried; the fixes are queued, unlanded, in `snapshot/pre-refactor-2026-09-25`.)*
- **R10** A creation missing a field its type requires is refused by a named reason before the first write; a
  revision that does not restate a field carries the head's own value for it, stated on the answer.
  *(not yet met: D-707.)*
- **R11** `created` and `last_updated` are derived from what the document itself states, when it states them;
  an envelope that disagrees with the document is refused by name, never silently preferred or silently
  discarded. A non-replay revision whose document's `created` differs from the head's `created` is refused
  by name — a writer's timestamp never backdates a creation. *(not yet met: D-615, D-692, D-726 — today's
  code still projects `created`/`last_updated` from the caller's envelope.)*
- **R12** Where two promotions of the same bundle carry the same `created`, the immediately prior one for
  every ordering purpose is the one this module wrote first (write order, `rowid`), never a caller-chosen
  snap key, whose lexical order is not a clock (State Rules v1.5 §6). The image this module answers with
  carries that write order for each manifest entry. *(not yet met: D-700, D-718.)*
- **R13** A non-replay revision whose document's `id:` differs from the bundle it is filed under is refused
  by name before the first write (C-1.1 judged at the door, not only in an audit). *(not yet met: D-738.)*
- **R14** A non-replay revision whose document's `group` differs from the head's `group_id` is refused by
  name (`REVISION_REGROUPS_BUNDLE`) before the first write; a replay is exempt. *(not yet met: D-738.)*
- **R15** Readability is judged before any fence that reads the document's content: a revision that sends no
  files, no `bundle.md`, a blob-held `bundle.md`, or no parseable frontmatter block is refused by the same
  named reason (`NO_BUNDLE_MD` or an explicit unreadable-frontmatter reason) whether or not it is an action
  revision, and never reaches a content fence that would compare an "unreadable" placeholder as if it were a
  value. A fence that cannot read the field it needs answers undetermined and abstains — it never refuses and
  never passes on a placeholder equality. *(not yet met: D-741.)*
- **R16** Every catalogue arm this module's own action block is documented as enforcing is actually run by
  this module at the write, not only by `checkBundle` at ratification: a declared refusal the write path does
  not enforce is itself a defect, named and closed rather than left as a gap between the two call sites.
  *(not yet met: D-717.)*
- **R17** A refused promotion writes nothing (State Rules v1.5 §8): every reason above, and every other
  refusal this module's checks produce, is checked before the transaction's first write, never partially.
- Errors: every refusal above names a `reason` (and, where the catalogue defines one, a `check` id and
  `translation`); never throws for a malformed but well-formed-JSON `pkg`. `NO_BODY` when `pkg` is missing or
  not an object.

**`reopen({target, reason, viewer, author}) → {ok:true, ...} | {ok:false, reason, ...}`**
- **R18** Reopening is refused to a named member's judgement alone: a machine-attributed writer is fenced out
  by name before anything else is asked (DEC-49, C-32.5).
- **R19** `reason` is required and never prefilled; an empty or missing reason is refused by name — reopening
  records why a disposition set down no longer holds, and a machine-authored reason would misattribute that
  judgement.
- **R20** `target` names exactly one inquiry; a call naming none, or naming something other than an inquiry,
  is refused by name (only an inquiry carries a disposition reopening picks back up).
- **R21** Reopenable only from the states `REOPENABLE_FROM` names (deferred, dismissed, or — for a finding
  that is not a case member, REC-31 — published); a target outside that set is refused `NOT_SET_DOWN`, naming
  its current state and the reopenable set. Reopening a published case leaves `prior_state: published`
  recorded so a dependent reading the history is told which half of the record moved.
- **R22** Reopening never unpublishes and never rewrites or reverses an earlier snapshot (DEC-12): it is
  itself a new promotion, recorded and attributed like any other, over a document whose `state_history` is
  extended, never edited in place.
- **R23** Reopening is reversible over an item a live edge cites (REC-17 / D-5): the `CITED` fence R8 states
  is not asked of `reopen`.
- Errors: never throws for a well-formed call; every "no" above names a `reason`.

**`runGate({bundleId, image, knownIds, hasCapture, registers, releaseRegistry, publishedRegistry,
publishedCaseRegistry, earnedRegistry}) → {gateVersion, ok, findings, warnings}`** (from `gate.mjs`, already
built)
- **R24** Runs the bundle-format catalogue (`bio-checks.mjs`'s `checkBundle`) over the given image and facts,
  and additionally confirms every registered capture the bundle names is actually present in the working
  bucket (a fact `checkBundle` cannot see, since it never fetches bytes) — a whole-hash row held only in parts
  is admitted only when every part the record names is present and its digest verifies (D-556), and every
  other registered capture must be present and, where a size is recorded, agree with it.
  `publishedRegistry`, `publishedCaseRegistry` and `earnedRegistry` are facts the catalogue cannot answer from
  the bundle alone (a prior edition's assertion, a frozen strength, an earned grade); passed as `null` they do
  not soften the checks that need them, they blind those checks, so a caller must supply the real facts or
  accept the refusals that follow from not doing so.
- **R25** `ok:false` iff at least one `error`-severity finding; `findings` carries only the error-severity
  findings (each `{check, detail, repairs?}`); `warnings` is the count of the rest. Never throws.
- **R26** The release-signature check (C-18.8, over a release record embedded in a promoted document) verifies
  the SSHSIG bytes through `signatures.verifySshsig`, in the `bio-release` namespace, against the registry's
  own signer keys; it never re-implements Ed25519 or SSHSIG parsing itself. *(not yet met, K10 / entry N8: the
  hand-written verifier at `bio-checks.mjs:6120-6571` still runs C-18.8 today, independently of `signatures`.)*

**`runCaseGate({caseId, edition, fm, priorCase, body?, memberBasis?}) → {gateVersion, ok, findings, warnings}`**
(from `gate.mjs`, already built)
- **R27** Runs the case-document catalogue (`checkCaseDocument`) over the parsed frontmatter and the facts a
  case document cannot carry about itself: which case and edition it is about to become, the previous
  edition's own assertions (`priorCase`, for C-21.1 — passed `null`, it blinds that check rather than
  softening it), the body text, and each member's basis at the pinned bytes. Same `ok`/`findings`/`warnings`
  shape as R25. Never throws.

**`CATALOG_VERSION`, `GATE_VERSION` → strings**
- **R28** `GATE_VERSION` names `CATALOG_VERSION` inside it; every ratification and case ratification stamps
  the same `GATE_VERSION` string, so a stranger reading two ratifications with the same string has read the
  same catalogue at the same version — never two different catalogues answering to one number.

### Errors

Stated per service above. `promote` and `reopen` never throw on a well-formed call and always name a
`reason`; `runGate` and `runCaseGate` never throw and report through `ok`/`findings`.

## Private

### Uses

- `record-core`: generic row storage and compare-and-swap primitives for the bundle, its files, its
  manifest/history and its append-only registers; id allocation (`allocid`); the retirement and citation
  index `retire`/`CITED` reads (R8). **Undetermined: this module's job needs record-core's Provides, not yet
  drafted, to name the exact service boundary** — today's `promote()` calls roughly two dozen private
  `Store#` methods (`#one`, `#rows`, `#mintProjectId`, `#existenceAct`, `#retirementCitedBy`, `#writeProjection`,
  `#writeSupersededBy`, …) that mix generic record-core primitives with per-construct projections (see the
  report's extraction map); which of those are record-core services this module calls, versus logic that
  belongs to a later-layer module and must not be called from here at all, is for record-core's own
  requirements job and BOB to settle together with this module's job.
- `membership`: project ownership and authority (`isProjectOwner`, `projectAuthority`, `PROJECT_AUTHORITY_CHECKS`),
  project visibility and its refusal shape (`PROJECT_VISIBILITY_CHECKS`, `PROJECT_CREATION_VISIBILITY_CHECKS`,
  `PROJECT_JOIN_REQUEST_CHECKS`), the producing group and its undetermined state (`producingGroup`,
  `groupUndetermined`), and the testimony/attribution fence a promoted document's authorship rests on
  (`testimonyFence`). **Undetermined for the same reason as above: named from today's call sites, not from a
  drafted membership.md.**
- `signatures`: `verifySshsig`, `NS_RELEASE` — for R26. **This is a new `uses` edge, not in `layers.md` or
  `modules.json` today; `signatures.md` itself records that no check in `bio-checks.mjs` calls into it yet
  (its own Suggestions section). Adding it is this module's job, ruled already by K10.**
- `legacy-checks` (`bio-checks.mjs`): the bundle-format and case-document catalogues (`checkBundle`,
  `checkCaseDocument`) that `runGate`/`runCaseGate` run, and every check family `promote`/`reopen` judge
  inline (`ACT_SHAPE_CHECKS`, `PROMOTED_TYPE_CHECKS`, `PROJECT_ID_CHECKS`, `SURFACE_CHECKS`,
  `BASIS_VERSION_CHECKS`, `CONTENT_EXTENT_CHECKS`, `BIAS_CHECKS`, `SUGGEST_CHECKS`, and the C-numbers the
  report's extraction map lists — every one of them retains its own id and test here, per K6).

### Invariants

- **R29** Pure with respect to the clock and the network: `promote`, `reopen`, `runGate` and `runCaseGate`
  make no network call and read no clock other than the timestamps their caller or the record supplies;
  every fact a check needs that this module cannot derive from its own inputs is injected, never assumed
  (R24).
- **R30** No place is named in this module or its checks; a jurisdiction-specific fact a check needs (a
  vocabulary, a form) comes from a jurisdiction profile handed in by the caller, never compiled in here.
- **R31** The mechanical envelope (R7) and the human-authored envelope are the same fence for every type:
  neither this module nor any check it runs carries a second, looser path for one type that the general rule
  does not also state.
- **R32** Every "no" this module returns names which kind of no (a `reason`, and where the catalogue defines
  one, a `check` id): an undetermined fact is never rounded to a refusal or to a pass (R15, R24).
- **R33** A check this module runs inline (at `promote`'s or `reopen`'s own door) and the same check as
  `checkBundle`/`checkCaseDocument` run it at `runGate`/`runCaseGate` never disagree about the same bytes: R16
  names the one place today's code is caught failing this.

### Satisfies

- `BIO_Bundle_Skill_Composite_Design_v1_7.md` §8 ("Write-delivery paths, the queue, concurrency, and the
  endpoint") and §9 ("The check codebase decision" — the Mechanical Verification Law: one check
  implementation at every judging call site; "the promoter gates non-mechanical manifests at promotion").
- `BIO_State_Rules_Consistency_v1_5.md` §2.4 ("History and convergent promotion" — the verify/claim/snapshot/
  write-with-a-commit-point/consume algorithm R1-R3 restate), §3.4 ("State history"), §4 ("Per-type schemas
  and state machines" — R9), §6 ("Invariant set"), §7 ("Violation-to-repair mapping"), §8 ("The Mechanical
  Verification Law" — R5, R6, R17).
- `docs/architecture/BIO_System_Design.md` §3, construct 3 ("The record") and §4 ("How the constructs relate").
- `build/layers.md`, "No jurisdiction in the product" (R30); "The checks are carried, never dropped" (K6,
  R33); K10 (R26).

### Suggestions

- **The extraction is bottom-up (PROCESS-MECHANICS §12).** `promote()`'s current body also writes tables that
  belong to later layers (content's readings/text projections, bias's statements and adoptions, entities,
  inquiry's basis legs and run surfacings, actions' basis/quotes/correspondence) inline, in the same
  transaction. This module's own job should extract only what this file states above — the CAS, the
  mechanical/append-only envelope, the catalogue run, and the record-core/membership-scoped checks — and
  leave every other write exactly where it is in `legacy-store` for that construct's own later job to pull
  out when its layer's turn comes, calling back into this module's `promote` as its commit primitive rather
  than the reverse. This is reported to BOB in more detail; it is not this module's decision alone.
- **Batch30.** Every *(not yet met)* row above names an old-plan id whose fix is unmerged, in
  `snapshot/pre-refactor-2026-09-25`. This module's job reads that snapshot's version of `promote()` first and
  keeps what still meets these requirements, rather than re-deriving each fix from the row text alone
  (PROCESS-MECHANICS §12.5).
- **Tests.** Each *(not yet met)* requirement needs a negative control reproducing the row's own repro shape
  (most rows already state one, e.g. D-741's "move the readability check behind the fence").
