# contradiction — requirements

**Status** · DRAFT by a drafting worker for BOB #42, 2026-09-26 (P18), from a reading of the code; for Bob's approval (a product module, P17). Layer 6. Code today (measured on `tranche/T3` @ `35ea098`; `build/extraction/contradiction.md` has the table): `bio-plane/src/contradiction.mjs` 1–83 (the labels, the judgement prompt pinned by digest, the input rendering; already this module's path); `bio-plane/src/store.mjs` 14536–15304 (the pairing read `contradictionPairs` with its four keys, ladder and absence sentences; `#candidateSide`, `#appendContradictionCandidate`, `contradictionPropose`) and the dispatch entries `contradictionpropose`, `contradictionpairs` (49095–49105); `bio-plane/checks/bio-checks.mjs` 13829–13909 (C-60, C-93); `schema.mjs` 3906–3936 (`contradiction_candidates`). `from`: `legacy-store` and `legacy-checks` (K64's pattern); `index.mjs` holds only these ops' routing, classes, viewer gates and proposer stamps, which stay with `control-plane` (K3). Not yet met: R21 (the run gate by registration, K31). No old-plan row is carried here.

**Size (P6).** About 975 lines move (about 640 without comment-only lines): `store.mjs` 780, `contradiction.mjs` 83, `bio-checks.mjs` 81, `schema.mjs` 31. Well under 4,000; one session reads it with the public parts of its uses.

## Public

### Purpose

Contradiction's IDENTIFY: the plane pairs assertions worth comparing, deterministically, for a viewer, and says at which level a key found nothing; a run's machine judgement over a formed pair enters the record only as a labelled, append-only proposal. It never judges, grades, edits or closes either side, and nothing here shows a candidate to a member (PRESENT and RESOLVE are not designed).

### Provides

Terms. A **key** is one of `K1` (one inquiry, opposite roles: a `supports` and a `cuts_against` leg of one inquiry, each naming a content row), `K2` (one subject, two held claims: two inquiries with the same subject entity, each with an accepted, unhidden basis version carrying a non-empty claim), `K3` (one referent, two held claims: accepted, unhidden, claimed versions of two different inquiries whose version legs rest on the same content row, or, where neither names one, on the same `information` target), `K4` (one entity, two sources: two cited content rows whose captures both resolve, established, to one entity, told apart by doctype or else by date as their readers state them). A **side** is a claim `{kind: "claim", inquiry, version, claim, …}`, a leg `{kind: "leg", inquiry, ord, role, target, content_id, note, capture_sha, ref, extent_kind, stale}` or an extent `{kind: "extent", content_id, capture_sha, ref, extent_kind, doctype, date, read}`. A **label** is one of R1. Every refusal names `reason` and `code`, and carries its catalogue `check` and `translation`. `viewer`, `proposedBy` and `caller` are the control plane's stamps.

**The judgement's words: CONTRADICTION_LABELS, JUDGEMENT_PROMPT, JUDGEMENT_PROMPT_SHA256, judgementSide(side), renderJudgementInput(pairs)** Pure; never throw.
- **R1** `CONTRADICTION_LABELS` is exactly `world`, `record`, `precision`, `unrelated`, `undetermined`, in that order.
- **R2** `sha256(JUDGEMENT_PROMPT)` equals `JUDGEMENT_PROMPT_SHA256`, the digest measured on the over-strictness gate (M-162). The prompt changes only with a new measurement that moves the digest in the same change.
- **R3** `judgementSide` keeps only `text`, `doctype`, `date` and `role`, and omits a field that is null or absent; it never fills one.
- **R4** `renderJudgementInput` is the prompt, then `PAIRS:`, then each pair numbered from 1 with its key, its context when it has one, and sides A and B through R3. A non-array renders no pairs.

**pairs({key, limit, viewer}) → answer or refusal** (`op=contradictionpairs`) A read; writes nothing.
- **R5** `key` is trimmed and upper-cased; absent or blank runs all four keys. Any other key is `CONTRADICTION_KEY_UNKNOWN` (C-60.1) naming the keys held.
- **R6** `limit` is clamped to [1, 50] (a non-number or less than 1 is 50) and never refused; the answer carries `limit`, `bound: 50`, `bounded: true`.
- **R7** Each key is run once. Per key: `ran`, `formed`, `limit`, `truncated` (observed by reading one past the bound, never inferred), `levels` (its ladder), `notes`, `absence`, and for K3 `arms: {passage, document}` each with its own `formed` and `truncated`. A key a request did not name answers `ran: false` with absence level `not_run`.
- **R8** The joins are the key definitions above, each pair carrying its key, counted once (never once from each side). K1 and K4 sides resolve their content row's `capture_sha`, `ref`, `extent_kind` and `stale` (null when the row is not held).
- **R9** K4 reads a document's doctype and date only as its reader states them (the reading's `content_type` and top-level `date`), never from capture or registration time. A pair that needs an unstated value is not formed: it is counted in `undetermined`, split in `undetermined_detail` as `never_read`, `no_doctype`, `no_date`, and stated in a note; a pair whose stated doctype and date both agree is counted in `indistinct`.
- **R10** Every side's bundle is one the viewer may see. An absent or unrecognised viewer compares nothing: `viewer_scope: "DENY"`, every run key's absence level `viewer`, and `says` states an outage, not a statement about the record.
- **R11** A key that formed nothing names the first empty rung of its ladder (K1: viewer, inquiry, leg, role, referent; K2: viewer, inquiry, subject, reading, claim; K3: viewer, inquiry, reading, claim, referent; K4: viewer, content, cited, resolution, shared entity), each rung an existence probe under the same viewer gate; with every rung present, its own last level (`shared_side`, `shared_subject`, `shared_referent`, `discriminator`). Each level's sentence comes from one table. No key answers a bare zero.
- **R12** The answer states `wrote: false`, `pairs_formed`, the flat `pairs`, `judgement: {state: "NOT_REACHED", …}` and a `says` sentence; it publishes no label vocabulary.

**propose({run, proposals, proposedBy, viewer, caller, at}) → answer or refusal** (`op=contradictionpropose`) A run's judgement enters as candidates.
- **R13** Refusals in order, each asked of the whole batch before anything is written: `CANDIDATE_NO_PROPOSER` (C-93.1, an empty stamp); `CANDIDATE_NO_RUN` (C-93.2: no run named, or one absent or not visible, the same answer); a caller who is not the run's principal, relayed as `AI_RUN_NOT_PRINCIPAL` (C-22.12); `CANDIDATE_RUN_NOT_RUNNING` (C-93.3); `CANDIDATE_NO_PROPOSALS` (C-93.4); a label outside R1, `CANDIDATE_LABEL_UNKNOWN` (C-93.5, with `index` and `labels`); a blank reason, `CANDIDATE_NO_REASON` (C-93.6); a proposal naming a pair that R5–R11 do not form for this viewer now, by key and both sides at their versions, `CANDIDATE_PAIR_NOT_FORMED` (C-93.7, with `index` and `cut_keys`, the keys cut at their bound).
- **R14** A side's referent at a version: a claim is `inquiry|version`, versioned by the SHA-256 of the claim text compared; a leg or extent is its content id (or its capture where none is named), versioned by the capture. A claim changed since pairing is a different referent, so its proposal is refused by R13.
- **R15** A candidate's id is the SHA-256 of `{v: 1, key, sides}` with the sides ordered; the row carries the key, both sides with their bundles, the run, `proposed_by`, the label, the reason (trimmed, at most 2,000 characters), `state: "proposed"`, `origin: "machine"` and `at`. A proposal over a candidate already held writes nothing and leaves the row as it was.
- **R16** The answer is `{ok, run, proposed, written, unchanged, candidates}`, each candidate with `new` and its stored row, and `says` that each is proposed machine work and no finding.

## Private

### Uses

- `legacy-checks`: C-60 and C-93 until they move (R20); `sha256HexSync`, `canonicalJson`. *(not declared)*
- `record-core`: `recordOf(ctx)`, `transact`, `declarePurge`; `bundles` by its read contract (R37 there), including the inquiry's subject entity column.
- `membership`: `membershipOf(ctx)`, `viewerPredicate` and the bundle gate (R10). *(not declared)*
- `content`: `contentRow` and the rows of a capture (R8, R14), by service or a stated read contract on `content`.
- `extraction`: `readingOf` for a capture's doctype and date (R9). *(not declared)*
- `entities`: `resolutions` by its stated read contract (entities' Suggestion). *(not declared)*
- `inquiry`, `basis-versions`: the legs, versions and version legs K1–K3 join. *(`basis-versions` not declared)*

### Invariants

- **R17** Append-only: nothing updates or deletes a candidate but its bundles' purge (either side's bundle takes it).
- **R18** The pairing is deterministic: the same record and viewer give the same pairs; keys are added, never widened.
- **R19** No act here judges, grades, edits or closes a side, and no read shows a candidate to a member.
- **R20** Each check moves here as an invariant with its test (K6): C-60.1, C-93.1–C-93.7.
- **R21** Whether a run is visible, running and the caller's is asked of a run gate `ai-runs` registers here (K31), `legacy-store` registering until then; with none registered, R13's run checks refuse as C-93.2. *(not yet met: K31 — the code reads `ai_runs` and calls `runPrincipalGate` directly)*
- **R22** `contradiction_candidates` is declared to record-core's purge by `a_bundle_id` and `b_bundle_id` (K23).
- **R23** No place is named in this module's behaviour or outward text.

### Satisfies

- `docs/development/CONTRADICTION-IDENTIFY-DESIGN.md` §2 (the split), §3, §4 (the keys; undetermined not formed), §5 (the labels; no cause), §6 (viewer, bound, the empty level), §7 (the gate, the pinned prompt), §8 (one append site, versions), §9 items 1 and 3.
- `docs/architecture/BIO_Case_Making_v0_1.md` §CONTRADICTION (IDENTIFY before PRESENT before RESOLVE).
- `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §2 (CHECK), §3 rules 3, 4 and 10 (DEC-24, DEC-49).
- `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (sight).
- `build/layers.md`, layer 6's contract: the AI checks and never concludes.

### Suggestions

- **Factory.** `contradictionOf(ctx)` answers the one instance per Durable Object storage and reaches `record-core`, `membership`, `content`, `extraction`, `entities`, `inquiry` and `basis-versions` through theirs (K61). The two op handlers move here (K3). `registerRunGate(fn)` is the slot for R21.
- **What stays out.** The gate harness and corpus (`test/contradiction-gate.mjs`, `contradiction-corpus.mjs`, the recorded runs) become this module's tests. Packaging the prompt into the skill pack is `skills`'.
- **Tests.** Each C-60 and C-93 refusal gets a negative control; R9 and R11 get the empty and undetermined arms §7 names; R15 an over-strictness arm (a re-proposal writes nothing).
- **For callers.** The control plane stamps `proposedBy`, `viewer` and `caller` and deletes any the body carries.

## Open for Bob

1. **What the judgement sees.** Design §5 says the machine sees the two sides and their immediate context, including the inquiry's question. The measured prompt input (R3, R4) carries only each side's text, doctype, date and role, and K3's passage; it omits the question. *Recommendation:* keep the input as measured (0/17 false conflicts, 9/9 recall, M-162), and amend §5; add the question only with a new measurement on a corpus of real documents, which §7 already names as the binding gap.
