# review — requirements

**Status** · DRAFT by a drafting worker for BOB #42, 2026-09-26 (P18), from a reading of the code; for Bob's approval (a product module, P17). Layer 6. Code today (measured on `tranche/T3` @ `35ea098`; `build/extraction/review.md` has the table): `bio-plane/src/store.mjs` 10271–11047 (the review copy: its constants, the dead answer, `reviewAct` with `#caseDraft`, `#reviewGrant`, `#reviewRevoke`, the draft identity and edition helpers, `#reviewGates`, `#draftPublisher`, the grant and sight predicates, `#reviewLastChange`, `reviewCopy`, `reviewComment`), 11806–11845 (`caseDraftList`), 1340–1347 (the `statement_by` migration) and the dispatch entries `casedraft`, `reviewgrant`, `reviewrevoke`, `reviewcopy`, `reviewcomment`, `casedrafts` (49765–49780, 49786–49789); `bio-plane/checks/bio-checks.mjs` 14303–14420 (C-87) and the C-32.16 row (9383–9390); `schema.mjs` 3505–3574 (`case_drafts`, `review_grants`, `review_comments`). `from`: `legacy-store` and `legacy-checks`. `index.mjs` holds the ungated door that hashes a recipient's secret (6400–6445), the grant's secret mint (13401–13428), the answer shape with DEC-31's in-band quartet (`reviewAnswer`, 3678–3709) and the classes and stamps; all stay with `control-plane` (K3; the Worker holds the secret, map §2). Not yet met: none. No old-plan row is carried here (D-656 was dropped as a test defect). Open for Bob 1 asks where the module sits.

**Size (P6).** About 1,040 lines move (about 580 without comment-only lines): `store.mjs` 845, `bio-checks.mjs` 126, `schema.mjs` 70. With the statement acknowledgements (store.mjs 11048–11805, C-82; about 830 more), which this draft places with `publication` (map §5.2), it would be about 1,870. Under 4,000 either way.

## Public

### Purpose

The review copy (Publication §6A): a draft of a case a project's editors prepare, shown inside the instance to members with standing and to named recipients through a revocable, read-and-comment grant, marked as not a publication, as complete as a publication would be, and naming what a publication would still refuse. It never publishes, signs, or leaves the instance; publishing stays one irreversible act.

### Provides

Terms. A **draft** is `{draft_id, project_id, case_id, params, created_by, created_at, updated_by, updated_at, statement_by}`, where `params` holds only the fields `op=publish` takes (`targets`, `target`, `caseId`, `newCase`, `scope`, `statement`, `excluded`, `subjectPosition`, `subjectJustification`, `biasAcknowledgement`, `roles`). A **grant** is `{grant_id, draft_id, case_id, edition, recipient, secret_sha, issued_by, issued_at, revoked_by, revoked_at}`; the recipient is a label, never a member. A **secret fingerprint** is the SHA-256 the control plane took of a secret it generated; nothing here receives a secret's value. **The dead answer** is `NO_REVIEW_COPY` (C-87.1), built from no argument. Every refusal names `reason` and `code` and carries its `check` and `translation`. `author`, `viewer`, `secretSha` and `bySecret` are the control plane's stamps.

**act({act, author, …}) → answer or refusal** (`op=casedraft`, `op=reviewgrant`, `op=reviewrevoke`)
- **R1** An empty or machine `author` is `MACHINE_CANNOT_REVIEW` (C-32.16) before any act is chosen; an act other than `draft`, `grant`, `revoke` is `REVIEW_UNKNOWN_ACT` (C-87.2).
- **R2** Authority: `draft` needs the project's edit permission; `grant` and `revoke` need ownership of the producing project, with no administrator arm. A caller without it gets `REVIEW_NOT_PROJECT_OWNER` (C-87.3), the same answer as for a project, draft or grant that does not exist; its detail varies only with the act.

**draft** (`act: "draft"`, with `draft?`, `project?`, `viewer`, the fields above)
- **R3** Refusals in order: a new draft under a discoverable project the caller is outside, membership's existence refusal (C-70.1); a named draft not held, C-87.3; no project, `REVIEW_NO_PROJECT` (C-87.4); a named project other than the draft's, `REVIEW_DRAFT_CHANGES_PROJECT` (C-87.5); no edit permission, C-87.3; a named case this project has not published, `REVIEW_NO_SUCH_CASE` (C-87.6), the same for a case of another project; arguments over 64 KiB as JSON, `REVIEW_DRAFT_TOO_LARGE` (C-87.7).
- **R4** Success creates a draft under an opaque `DRAFT` id (never a counter), or edits the named one in place; only the fields above are kept. `statement_by` is the member whose write changed the statement as a case document would print it: an edit leaving that text unchanged keeps it, an emptied statement has none. The answer is `{ok, draftId, project, edited, caseId, edition, caseIdentity, read}`.
- **R5** A draft's case identity is read from the published record every time, never stored: a named case stands at its highest published edition plus one; a draft naming none stands at edition 1 internally. The stated `edition` is null for a draft naming no case without `newCase` (its case is derived at publication). `caseIdentity` is one of four sentences: the next edition of a named case; a named case and `newCase` together (undetermined, publication refuses the pair); a new case; a derived case (undetermined here).

**grant** (`act: "grant"`, with `draft`, `recipient`, `secretSha`)
- **R6** Refusals in order: a draft not held or a caller not its project's owner, C-87.3; a recipient empty, over 200 characters or holding a line break, `REVIEW_NO_RECIPIENT` (C-87.8); a fingerprint that is not 64 lowercase hex, `REVIEW_NO_SECRET` (C-87.9). Success writes a grant under an opaque `RVG` id bound to the draft's case identity at issue, and answers it with the stated edition and a `boundTo` sentence.

**revoke** (`act: "revoke"`, with `grant`)
- **R7** No grant named is `REVIEW_NO_GRANT` (C-87.10); a grant not held or a caller not its project's owner, C-87.3. A grant already revoked answers `existed: true` with the first revocation, unchanged; otherwise the revoker and instant are recorded.

**The grant and the sight: liveGrant(secretSha), grantAdmitsCaseEdition(secretSha, caseId, edition), draftForMember(draftId, viewer), seesProjectDrafts(projectId, viewer), draftIdentity(draft)** The one place each is judged; `publication`'s case document and acknowledgements call them.
- **R8** A grant is live only while it exists with that fingerprint, is not revoked, its draft exists, and the draft still stands at the case identity the grant was bound to; a grant whose edition was published and signed is dead exactly as a revoked one. A malformed fingerprint is never live.
- **R9** A member has standing in a project's drafts only where the sight predicate over the producing project admits the viewer (a participant, invited or joined, or an active administrator); an absent or unrecognised viewer has none.

**copy({draft, secretSha, viewer, bySecret, limit}) → answer or the dead answer** (`op=reviewcopy`)
- **R10** Two doors: a recipient through a live grant (a named draft must be the grant's own), or a member with standing (R9). Every other caller, including a revoked, moved, malformed or never-issued secret and a draft that does not exist, receives the dead answer, byte-identical.
- **R11** The answer: `kind: "review-copy"`, the marking sentence, `published: false`, `signature: {signed: false, …}`, `draft`, `project`, `reader`, `case: {case_id, edition, identity, newCase}`, `authored` (the six authored fields), `findings`, `gates`, `missing`, `evaluated`, `comments` with `comments_truncated` and `list_limit`, `statement_acknowledgements`, `observations`, `updated_by`, `updated_at`, `last_change`, `statement_by` with its sentence, the grant part, and `required_strength` (the project's bar as `op=publish` would freeze it).
- **R12** Each finding is read as the draft's last editor may see it, for both doors: present with its type, state, role and text; or absent with its role kept and a sentence. A recipient never sees what the editor could not.
- **R13** `missing` is the publish gates' own answer: publication's act is run over the draft's arguments, as the member who would publish (the last editor when an owner, else the project's lowest-id owner, else the editor), inside a transaction that is always rolled back. Passed: `missing` empty and nothing published. Refused: the first refusal only, and `evaluated` says later gates are undetermined. No answer: undetermined. Nothing persists.
- **R14** Comments and the member door's grant roster are read under a cap: `limit` clamped to [1, 500], 500 when absent or unreadable, each list saying whether it was cut. A recipient sees only its own grant; the roster marks each grant `live` against the draft's identity now, stating a no-case grant's edition only while live.
- **R15** The acknowledgement list is publication's list of the statement as it now stands, at this draft's identity, with the statement writer's own rows withheld and counted (`withheld`, `withheld_stated`; an undetermined writer withholds every participant row, counted), never listed.
- **R16** `observations` lists every observation the edition would reach from its present findings, each with whether its author has chosen an attribution level for this case edition; for a draft naming no case, each is unchosen and says why.
- **R17** `last_change` is the newest dated act the answer carries (the draft's edit, the comments, grants and revocations and acknowledgements served), ordered by instant, never by string; an unparseable stamp is not ranked. Acts within one whole-second stamp of it are named in `undetermined_within`; `stated` also names what the answer draws live and dates nowhere (finding text, the gates' verdict, the floors).

**comment({draft, secretSha, viewer, bySecret, text})** (`op=reviewcomment`)
- **R18** R10's doors, then text trimmed of 1 to 4,000 characters, else `REVIEW_NO_COMMENT_TEXT` (C-87.11). A recipient's comment is attributed to the grant (`author_kind: "recipient"`), a member's to the member. The answer is the stored comment.

**list({project, viewer, limit})** (`op=casedrafts`) Writes nothing.
- **R19** Fenced exactly as R9: a project that does not exist or a viewer without standing receives the dead answer. `limit` as R14; the answer carries `drafts` (each with its case identity per R5, creators, editors, `statement_by` and its read), `count`, `total`, `limit`, `truncated`.

## Private

### Uses

- `legacy-checks`: C-87 and C-32.16 until they move (R23), `isMachineIdentity`.
- `record-core`: `recordOf(ctx)`, `transact`, `mintOpaqueId`, `declarePurge`; `bundles` and `files` for findings (R12).
- `membership`: `isProjectEditor`, `isProjectOwner`, `projectOwners`, `existenceAct`, `viewerPredicate`.
- `strength`: the project's bar (`#projectBar`, R11).
- `provenance`: `testimonyReach` (R16). *(not declared)*
- `publication`: the publish act run dry (R13), the published edition and a case's owner (R3, R5), the acknowledgement list (R15), the attribution in force (R16). *(not declared, and later in the order: Open for Bob 1)*
- `inquiry`, `basis-versions`: declared; nothing in this module's share calls them.

### Invariants

- **R20** Nothing here writes the published projection, the published bucket, a case document or a signature; a review copy never leaves the instance.
- **R21** No secret's value is received or stored; only its fingerprint.
- **R22** Every authorship field is the control plane's stamp, never a body's.
- **R23** Each check moves here as an invariant with its test (K6): C-87.1–C-87.11, C-32.16.
- **R24** `case_drafts`, `review_grants` and `review_comments` are declared to record-core's purge as whole-store tables (K23).
- **R25** No place is named in this module's behaviour or outward text.

### Satisfies

- `docs/architecture/BIO_Publication_v0_1.md` §6A (6A.1–6A.4), §3 rules 11, 13 and 15 (a), as they touch the draft.
- Bob's DEC-31 (the review copy) and DEC-72 (publishing is the owner's).
- `docs/architecture/BIO_Membership_Architecture_v2.md` §4 (administrators direct nothing), §7 (sight).
- `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §3 rules 4 and 10.

### Suggestions

- **Factory.** `reviewOf(ctx)` answers the one instance per Durable Object storage and reaches its uses through theirs (K61); the six op handlers move here (K3).
- **For callers.** The control plane generates the grant's secret, returns it once and passes only its SHA-256; hashes any presented secret before calling; stamps `author` and `viewer`; and builds the copy's in-band quartet (hash, date from `last_change.at`, author `updated_by`, floors from `required_strength`) and the 404 status for the dead answer.
- **Tests.** Each C-87 refusal and C-32.16 gets a negative control; R10 and R19 get the identical-bytes arms; R13 an arm proving the rolled-back transaction left no row.

## Open for Bob

1. **Where the review copy sits.** The module was placed in layer 6 by its name. Its canon home is Publication §6A, and its code runs publication's own act dry (R13), reads the published edition (R5) and publication's acknowledgement and attribution reads (R15, R16), while publication reads the draft, the grant and the sight (R8, R9) when it publishes from a draft, serves an unsigned case document to a recipient, and takes an acknowledgement. Layer 6 may not use layer 8. *Recommendation:* move `review` into layer 8, directly after `publication`: publication offers three registrations it fills (the draft to publish from, the grant door on the case document, the acknowledgement doors), and `review` uses `publication`. Keeping it in layer 6 would need publication to register four things here instead (the dry run, the edition, acknowledgements, attribution); merging it into `publication` would enlarge a module still unmeasured.
