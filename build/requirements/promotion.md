# promotion — requirements

**Status** · APPROVED by Bob 2026-09-26 (a product module, P17). DRAFT, reviewed for BOB #40, 2026-09-26; for Bob's approval (a product module, P17). Layer 2. Drafted for BOB #38 from the T1 extraction survey; reviewed against the code. Code today: `bio-plane/src/gate.mjs` (owned already), and `promote()` (`bio-plane/src/store.mjs` 17881–20109) and `reopen()` (7984–8250) inside `legacy-store`, extracted by this module's first job. Not yet met: R11–R15, R17, R18 (carried rows D-578, D-628, D-707, D-615, D-692, D-726, D-738, D-546, D-741, D-695, D-717), R30–R32 (D-700, D-718, D-673, entry N8 / K10). Later modules join a promotion through R39–R40 (K31).

## Public

### Purpose

The one write path by which a bundle enters or changes in the record. It holds the compare-and-swap, keeps history append-only, takes the document's own bytes as the record's word on what it is, and refuses a whole promotion when any rule fails: the bundle advances as one transaction or nothing is written. It also runs the check catalogue over a bundle or a case document at ratification (the gate), and it reopens a set-down inquiry. It does not decide what a document must say to be true; the catalogue states that.

### Provides

**`promote(pkg) → {ok:true, bundleId, bundleSha, rowVersion, owner, ...} | {ok:false, reason, ...}`**, where `pkg` is `{bundleId?, base, files, meta, snapKey, author, writer?, operation?, register?, drop?, replay?, visibility?}` plus the identity stamps the caller sets (Suggestions, "For callers").

- **R1** `base` is the compare-and-swap. A creation sends `base: null`, and is refused `EXISTS` when the bundle is held. A revision sends the bundle's current `bundle_sha`: a revision of a bundle not held is refused `ABSENT`, and one whose `base` is not the current `bundle_sha` is refused `CAS_STALE`, naming `expected` and `got`. A stale base is never merged and never taken as the new value.
- **R2** A refused promotion leaves the record exactly as it was: no manifest entry, no history, no live file, no id spent. An accepted one commits every row it writes in one transaction. A caller never observes a partial promotion.
- **R3** Each accepted promotion appends exactly one manifest entry for the bundle: its snap key, kind (`promotion`, or `promotion-replay` when `replay` is set), base, author, time, the files with their digests, and `writer`/`operation`. A creation's entry has the empty-string SHA-256 as its base and snapshots nothing; a revision first copies every live file into history under its snap key, then replaces the live files. No promotion modifies or removes an existing manifest entry or history row (State Rules v1.5 §2.4).
- **R4** A promotion under a snap key the bundle already holds is answered by comparison. When the held entry records this same promotion (same base, every file by name and digest, kind, writer, operation and author), the answer is `ok:true, idempotent:true, wrote:false` and nothing is written. Otherwise it is refused `SNAP_KEY_TAKEN` (C-67.1). A file whose digest either side does not state makes the two different.
- **R5** Every stored digest and size is of the stored bytes. An inline file's SHA-256 and byte length are computed over the UTF-8 encoding of its text. A blob-backed file's digest must equal its `blobSha`. A supplied digest that differs is refused `FILE_DIGEST_MISMATCH`, naming the paths. A supplied inline size that differs is replaced by the computed one, never stored (State Rules v1.5 §8).
- **R6** An inline file whose computed length exceeds the instance's inline bound (1 MiB) is refused `OVERSIZE_INLINE`, naming the path and its length.
- **R7** A package with no `bundleId` (other than a project's creation, R19), no `files` array or no `meta` is refused `MALFORMED`. A package with no `bundle.md` is refused `NO_BUNDLE_MD`. References or basis legs sent in the payload rather than in `bundle.md` are refused `REFS_IN_PAYLOAD` / `BASIS_IN_PAYLOAD`. A non-replay revision that omits a path the previous revision held, without naming it in `drop`, is refused `FILES_DROPPED`, listing the paths.
- **R8** A promotion with `writer: "mechanical"` must name an `operation` the catalogue declares a field set for, or it is refused `UNDECLARED_OPERATION`, naming the declared ones. The writer and operation are recorded in the manifest entry (R3), so the gate holds the promotion to that operation's envelope (R30).
- **R9** The document is the record's word on itself. Its type, title, `current_state`, `prior_state` and `closed_reason` are read from `bundle.md`; `meta` is used only where the document states nothing. An envelope stating a value the document contradicts is refused by name (`ENVELOPE_TYPE_DISAGREES`, `ENVELOPE_TITLE_DISAGREES`, `ENVELOPE_STATE_DISAGREES`, C-86.1, C-86.3, C-86.4), never obeyed or silently overridden. A replay is exempt from these refusals and not from the derivation.
- **R10** A non-replay revision whose document states a type other than the head's is refused `REVISION_RETYPES_BUNDLE` (C-86.2), naming both types.
- **R11** A missing field is refused by name, never answered with a raw error. A revision that states no type, `current_state`, `created` or `last_updated` carries the head's value forward and says so on the answer. A creation that states none of one is refused by name (`PROMOTED_TYPE_UNSTATED`, `PROMOTED_FIELD_UNSTATED`). A missing snap key, a file with no path, an inline file with no content and a blob file with no byte count are each refused by name. *(not yet met: D-578, D-628, D-707)*
- **R12** `created` and `last_updated` are read from the document (R9's rule). An envelope that disagrees is refused by name (`ENVELOPE_DATES_DISAGREE`). A non-replay revision whose document's `created` differs from the head's is refused by name (`REVISION_REDATES_CREATION`): a writer's timestamp never re-dates a creation. *(not yet met: D-615, D-692)*
- **R13** A creation takes the instance's recorded producing group, written into its document, unless it is a replay. With no recorded group, the document's `group`, else the envelope's, is kept, and a creation stating none is refused (C-64.1). A revision keeps its creation's group, and a non-replay revision whose document states a different `group` is refused by name (`REVISION_REGROUPS_BUNDLE`). *(not yet met: D-726, for the revision refusal)*
- **R14** A non-replay creation or revision whose document's `id:` differs from the bundle it is filed under is refused by name (C-1.1). *(not yet met: D-738)*
- **R15** A revision that moves `current_state` (a new state different from the head's) along an edge the type's declared state table does not carry is refused by name. For a bias set that name is `BIAS_ILLEGAL_TRANSITION` (C-26.12), and for every other type `STATE_MOVE_UNDECLARED`. The table is the catalogue's. A creation is not a move, and a replay is not exempt. *(not yet met: D-546; only bias sets are fenced today)*
- **R16** A promotion that moves an information item into `retired` while a live edge cites it is refused `CITED`, naming every citing id: the same fence `retire` runs (State Rules v1.5 §4.1). An edit of an item already retired is not asked this.
- **R17** Readability is judged before any fence that reads the document's content. A revision that sends no files, no `bundle.md`, a blob-held `bundle.md` or no parseable front-matter block gets the same readability refusal (`NO_BUNDLE_MD`, or a named front-matter-unreadable reason) whatever its type. A fence that cannot read the value it compares answers undetermined and abstains: it neither refuses nor passes on it. *(not yet met: D-741)*
- **R18** Every refusal the catalogue assigns to the promote act (its row names this write path as its site) is enforced at the write, not only by the audit. *(not yet met: D-695, the records-law arm C-2.10; D-717, five action-catalogue arms)*
- **R19** Projects, at this door. A project's creation (type `project`, or any creation in the `PROJ-` namespace) that names an id is refused `PROJECT_ID_SUPPLIED`. Its `bundle.md` must be inline with a front-matter block (else `PROJECT_DOCUMENT_UNREADABLE`) and carry no top-level `id:` (else `PROJECT_ID_IN_BYTES`). The plane mints the id and writes it into the document before hashing, so the returned `bundleSha` is of what is held. A project's title is unique across the instance, compared ignoring case and runs of whitespace, deactivated projects included; a clash is refused `NAME_TAKEN` and names no other project. Only an owner may deactivate (close as `abandoned`) or reactivate a project (else `NOT_THE_OWNER`). Any other revision of a project needs an actor who has joined it. The creating member is written as the project's sole owner in the same transaction. `visibility` is accepted only on a project's creation (else `PROJECT_VISIBILITY_NOT_A_CREATION`), and `discoverable` only when there is an owner (else `PROJECT_VISIBILITY_NO_OWNER`).
- **R20** A revision of a bundle the stamped actor may not see is answered exactly as a revision of one that does not exist (`ABSENT`). That check comes before every other answer that reads the head.
- Errors: every refusal names a `reason`, and where the catalogue has a row for it, its `check` id and `translation`. *(not yet met: `CAS_STALE`, `EXISTS`, `ABSENT` and other early refusals carry neither; no entry yet, BOB to make one)* `NO_BODY` when `pkg` is missing or not an object. Never throws for any JSON package. *(not yet met: D-578, D-628, D-707)*

**`reopen({target, reason, viewer, author}) → {ok:true, target, from, to:"open", why, author, at, weight:"single"} | {ok:false, reason, ...}`**

- **R21** An empty `author` or a machine identity is refused `MACHINE_CANNOT_REOPEN` before anything else is asked (DEC-49, C-32.5). Reopening is a named member's judgement.
- **R22** `reason` is required and never prefilled. An empty one is refused `NO_REASON`. One longer than the edge-reason bound, or containing a quote, a backslash or a newline, is refused `BAD_REASON`.
- **R23** No `target` is refused `NO_TARGET`. A target that is absent, or that the viewer may not see, is refused `NO_SUCH_BUNDLE`, identically in both cases. A target that is not an inquiry is refused `NOT_AN_INQUIRY`. An inquiry with no readable `bundle.md` is refused `NO_DOCUMENT`.
- **R24** An inquiry is reopenable when its state is a disposition (`deferred`, `dismissed`: `REOPENABLE_FROM`), or when its current version is a member of a published or prepared case edition. Any other is refused `NOT_SET_DOWN`, naming its state and the reopenable set. A concluded inquiry in no case is refused. A move to `open` that the type's declared state table does not carry is refused `ILLEGAL_TRANSITION`.
- **R25** Reopening is a new promotion over the current head, through `promote` (so every rule above applies, and its refusal is returned with `target`). The document gains a `state_history` entry (time, from, `open`, the reason, the author) and a Session Log entry. `prior_state` becomes the old state, `current_state` becomes `open`, `disposition_reason` is cleared, `case_edition` is cleared (`case_id` stays) and `last_updated` is the act's time. Nothing is unpublished and no earlier snapshot or edition changes (DEC-12). A `state_history` block that cannot be extended in place is refused `UNSPLICEABLE_STATE_HISTORY`.
- **R26** Reopening is not refused because a live edge cites the target (REC-17 / D-5).
- Errors: never throws for a well-formed call; every refusal names a `reason`.

**`runGate({bundleId, image, knownIds, hasCapture, registers, releaseRegistry, publishedRegistry, publishedCaseRegistry, earnedRegistry}) → Promise<{gateVersion, ok, findings, warnings}>`**

- **R27** Runs the whole bundle-format catalogue (`checkBundle`) over `image`. Inline text entries are the files. A blob reference is declared elided, never fetched: it counts for existence and is not read as bytes. `knownIds` answers whether a reference resolves. `releaseRegistry`, `publishedRegistry`, `publishedCaseRegistry` and `earnedRegistry` are facts the bundle cannot carry about itself; passed `null`, they blind the checks that need them, never soften them.
- **R28** Every registered capture in `registers` must be present in the working store, as `hasCapture` answers. An absent one is refused `PLANE_MISSING_BYTES`, and a size that differs from the register is refused `PLANE_SIZE`. A whole-hash capture held in parts is admitted only when every part the record names is present and verifies and the parts' sizes sum to the registered size (D-556). Otherwise it is refused `PLANE_PART_MISSING` or `PLANE_PART_UNVERIFIED`, naming the parts, or `PLANE_HELD_IN_PARTS` when the record names no parts. When `hasCapture` rejects, `runGate` rejects: an unanswered probe is never counted as present.
- **R29** `ok` is false exactly when at least one error-severity finding exists. `findings` holds only those, each `{check, detail, repairs?, where?}`. `warnings` is the count of the rest. `gateVersion` is `GATE_VERSION`.
- **R30** Every check that needs a bundle's prior promotion takes the manifest entries in the order they were recorded (write order), never snap-key order: C-20.1, which holds a mechanical promotion to its operation's declared field set and envelope (`bundle.md`, `snapshots/`, the mechanical append-only files), and C-17.2's divergence classification. *(not yet met: D-700, D-718)*
- **R31** The release-signature check (C-18.8) fails closed. For an information bundle at `information@2`, each release (`collected → verified`) at or after the registry's migration instant must have a signed release record. Its signer must equal the transition's author and must not be a machine identity. Its namespace must be the registry's (by default `bio-release`), and its signature file must be present. It must verify over the canonical release message against a key the registry holds for that signer at that instant. That applies only once the registry has verified against its pinned root. Below `information@2`, a post-migration release is an error. An unreadable registry is an error at every schema. Every SSHSIG and Ed25519 verification in this check, the registry root's included, goes through `signatures.verifySshsig`; the module holds no second implementation. *(not yet met: N8 / K10; the hand-written verifier in `bio-checks.mjs` "Release-signature primitives" still runs it)*
- **R32** A transition in a document's own `state_history` along an edge its type's table does not declare is an error (C-4.2). It is reported as a move made under earlier rules only where the record's own history of promotions shows the same move at or before the state-edge fence (R15) took effect; a writer's timestamp alone never earns that reading. *(not yet met: D-673)*

**`runCaseGate({caseId, edition, fm, priorCase, body?, memberBasis?}) → {gateVersion, ok, findings, warnings}`**

- **R33** Runs the case-document catalogue (`checkCaseDocument`) over the parsed front matter, with the facts a case document cannot carry about itself: the case and edition it is about to become, the previous edition's assertions (`priorCase`, for C-21.1), the body, and each member's basis at its pinned bytes. Passing `null` for any of them blinds the checks that need it. The result has R29's shape. Never throws.

**`CATALOG_VERSION`, `GATE_VERSION` → strings**

- **R34** `GATE_VERSION` contains `CATALOG_VERSION`, and both gates report the same `GATE_VERSION`. One version names one catalogue: `CATALOG_VERSION` changes whenever a check is added, removed or changed, so two ratifications carrying the same string were judged by the same catalogue.

**registerStep(module, {check?, project?}) → void; registerFact(name, module, fn) → void**
- **R39** A later module registers, once at start, a `check` run before the write and a `project`ion
  written after it, both inside the promotion's one `record-core.transact`. A registered check's refusal
  refuses the promotion under R2, with its own `reason`. Steps run in the modules' total order. A step
  or fact registered twice by one module is refused `STEP_DECLARED`.
- **R40** A fact this module needs from a later module (the citation index behind `CITED`, R16; case
  membership, R24) is read through `registerFact`. A fact with no registered provider refuses the act
  that needs it with `FACT_UNAVAILABLE`, naming the fact; it is never read as false.
- Errors: never throws.

## Private

### Uses

- `legacy-checks`: the catalogues `checkBundle` and `checkCaseDocument`; the parser, `normalizeType`, `vocabFor`/`STATES`, `isMachineIdentity`, `MECHANICAL_FIELD_SETS`; and the check rows whose ids and translations this module's refusals carry (`ACT_SHAPE_CHECKS`, `PROMOTED_TYPE_CHECKS`, `PROJECT_ID_CHECKS`, `PROJECT_CREATION_VISIBILITY_CHECKS`, `BIAS_CHECKS`).
- `record-core`: `transact` and `commit` (R2, R3; every row R3 writes goes through them), `mintOpaqueId` (a project's id, R19), `bundleInfo`, and `readImage`, whose write order R30 depends on (record-core R16).
- `membership`: the producing group (R13), project ownership and joined authority (R19), and the sight predicate (R20, R23).
- `signatures`: `verifySshsig` (R31). `modules.json` does not yet list this edge; K10 rules it (layer 1, earlier, so it is allowed).
- Later modules' facts, checks and projections reach this module only through R39–R40, never by a use.

### Invariants

- **R35** `promote`, `reopen` and `runCaseGate` make no network call; `runGate`'s only outside question is the injected `hasCapture`. A time this module records is its own clock's stamp or the document's stated time. No ordering this module or its checks performs uses a caller-supplied time.
- **R36** No place is named in this module or its checks. A local fact a check needs comes from a jurisdiction profile the caller supplies.
- **R37** Every "no" names which kind of no. An undetermined fact is never rounded to a refusal or a pass (R17, R27).
- **R38** A rule enforced both at this module's doors and in the catalogue is one catalogue function run at both, never two implementations. The two never disagree about the same bytes (State Rules v1.5 §8; `layers.md`, "The checks are carried").

### Satisfies

- `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §2.4 (history and convergent promotion), §3.4 (state history), §4 (per-type schemas and state machines), §6 (invariant set), §8 (the Mechanical Verification Law), §9 (write protocol obligations).
- `docs/architecture/BIO_Bundle_Skill_Composite_Design_v1_7.md` §8 (write-delivery paths and concurrency), §9 (the check codebase decision).
- `docs/architecture/BIO_Case_Making_v0_1.md` §2 (the promote corrections: the document states what it is).
- `docs/architecture/BIO_System_Design.md` §3, construct 3 (the record), and §4.
- `build/layers.md`, "No jurisdiction in the product" (R36) and "The checks are carried, never dropped" (R38); rulings K6 and K10.

### Suggestions

- **Later modules' work inside `promote` (K31).** Today `promote()` runs later modules' checks and projections inline (inquiry basis, versions, supersession and division; bias sets; actions; `surfaced_by`; migration replays; testimony and the `register`; content minting; entities; readings and the text index; the case revision flag). This module's first job extracts only what this file states and has `legacy-store` register the rest through R39–R40; each later module registers its own when it is extracted.
- **Fork and project names come here (K31).** `forkProject` (store.mjs 37041) and project name uniqueness (C-77) move to this module from `membership`, with §7.12's rules; their requirements are written before this module's first job (entry N16).
- **Batch30.** Every *(not yet met)* row above has its fix built and unmerged on `snapshot/pre-refactor-2026-09-25` (PROCESS-MECHANICS §12.5). The job reads that snapshot's `promote()` first and keeps what meets these requirements. D-741 and D-738 are queued rows with no built branch.
- **R31.** `verifySshsig` is asynchronous and reads keys, not principals. Resolving a principal and its validity window stays in C-18.8. The Apps Script runtime that justified a hand-written verifier is decommissioned (`gate.mjs` header; N8).
- **Answer enrichments from later layers.** `reopen` adds `reevaluation.raised` and the `op=promote` handler arms the scheduler. Both are later-layer effects that move out with their modules; `op` handlers move with the construct (K3).
- **Tests.** Each *(not yet met)* requirement gets a negative control reproducing its row's repro shape.
- **For callers.** The identity stamps `actorIdentity`, `actorViewer`, `actorMemberId`, `ownerMemberId`, `assistantPrincipal` and `migrationReplay` are set by the control plane from the session and deleted first from any caller's body. This module trusts them as given; that obligation is the control plane's.
