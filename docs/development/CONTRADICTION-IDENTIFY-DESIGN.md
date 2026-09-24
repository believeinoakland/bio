# Contradiction — IDENTIFY: what the detector compares, and how it is held to its over-strictness arm

**Status** · v0.1 DRAFT design, written 2026-09-19 by session BOB #16 under Bob's standing delegation (mechanism is the architect's), discharging the level-2 document BOB promised on 2026-09-17 and SCHEDULER's order audit (`cd9d7c86`) routed back as unrowable until it existed. It rests on Bob's doctrine of 2026-09-17 in `BIO_Case_Making_v0_1.md` §CONTRADICTION — contradictions are *"golden nuggets that shouldn't be 'fixed', but rather drawn attention to"*; three cases, of which only the RECORD case carries a duty; IDENTIFY before PRESENT before RESOLVE; IDENTIFY's acceptance test is its OVER-STRICTNESS arm, not its recall — and decides only mechanism beneath it. **§9 item 1 is BUILT** — REC-146 (IC-167, 2026-09-19) landed `op=contradictionpairs`, the pairing read, and `node tools/status.mjs 8.contradiction` now reads PARTIAL; **§9 item 2 is BUILT off-record** — M0-71 (2026-09-23) landed §7's labelled corpus, the harness and the gate, and measured a deterministic baseline candidate (`measurements/M-118.md`: 0/17 false conflicts, recall 2/9, THRESHOLD 0). Items 3 and 4 are not built and the op's own answer says so (`judgement.state: NOT_REACHED`). Every table and column this document names was read at the code on 2026-09-19 and every one of them was found where it said. as of 2026-09-23

**Place in the system** · Level 2 beneath `BIO_Case_Making_v0_1.md` §CONTRADICTION (mechanism 1 of 3), for construct 8's `8.contradiction` in `BIO_System_Design.md` §3. It depends on 8.claim (PARTIAL — a claim is a field on a basis VERSION, `inquiry_basis_versions.claim`), construct 4 (a leg's referent is a CONTENT row, `inquiry_basis.content_id`), construct 6 (`entities` and `resolutions`, at document grain), construct 5 (the doctype readers), `BIO_Assistant_and_AI_Roles_v0_1.md` (DEC-24: the machine proposes, a member disposes; machine work is labelled), `BIO_Membership_Architecture_v2.md` §7.9 and §7 item 7.14 (what a caller may see), and `OBSERVATION-LOG-DESIGN.md` (the vocabulary for saying WHICH level was empty). Nothing depends on it yet; PRESENT and RESOLVE will.

**Incomplete sections** ·
- §7 — the over-strictness THRESHOLD is **0**, set by the first measurement (M0-71, `measurements/M-118.md`), and it is PROVISIONAL. The candidate measured was a deterministic lexical baseline, not §5's machine judgement, over a 26-pair SYNTHETIC corpus written by the same hand. Two things remain undesigned: a corpus drawn from real captured documents, and whether a non-zero rate is meaningful once the corpus is several times larger. The gate cannot see a detector that is strict by abstaining: an always-`precision` judgement passes with recall 0, so recall is printed beside the rate. Ruled 0, PROVISIONAL, by BOB #31 (2026-09-23, M0-71), below §7.
- §6 — **the empty-level list is FOUR CAUSES AND THE BUILD FOUND A FIFTH, reported by REC-146 as a DESIGN GAP and shipped rather than deferred.** All four of (a)–(d) are statements about THE RECORD. A read made with no viewer the gate recognises — an absent or unrecognised stamp, which `viewerPredicate` answers `DENY` — is empty for a reason that is not about the record at all, and folding it into (a) *the key had nothing to join* would make an OUTAGE read as a SPARSE RECORD, which is the exact substitution this section forbids. The plane therefore names `viewer` as a level, FIRST, and `says` states that the read compared nothing. A sixth, `not_run`, is named for the keys a `key=` request did not run. Both belong in this list when it is next edited.
- §4 — **K3's second arm is under-specified and the build decided it, reported as a DESIGN GAP.** *"or, where no content row is named, the same captured document"* does not say what to do with a leg whose `content_id` is NULL because it rests on an INQUIRY — the schema gives three causes for that NULL and only two of them name a document. REC-146 requires `target_type = 'information'` on both sides and EXCLUDES the inquiry cause by meaning: two claims resting on the same sub-question are not two readings of one text. The two arms are published with separate `formed`/`truncated` figures.
- §5 — the judgement's model, prompt and skill packaging are the build's, inside the investigative session's run (`INVESTIGATIVE-SESSION.md`); this document fixes its inputs, its output vocabulary and its fence, not its wording.
- §9 — PRESENT and RESOLVE are NOT designed here. They are the next design act, after §7's first measurement, because what a member is shown depends on what the detector actually proposes.
- §3 — the IRRECONCILABLE PAIR (two well-supported findings about one question that cannot both be true, both kept) needs the claim object and is Bob's (`BIO_Case_Making_v0_1.md`); IDENTIFY can propose such a pair as a RECORD candidate, and nothing here decides what the record then does with it.

**Contents**
- [1. What IDENTIFY is for, and what would make it worthless](#1-what-identify-is-for-and-what-would-make-it-worthless)
- [2. The split: PAIRING is the plane's, JUDGEMENT is the machine's](#2-the-split-pairing-is-the-planes-judgement-is-the-machines)
- [3. What can be compared — the two kinds of assertion the record holds](#3-what-can-be-compared-the-two-kinds-of-assertion-the-record-holds)
- [4. The pairing keys](#4-the-pairing-keys)
- [5. The judgement, and its output vocabulary](#5-the-judgement-and-its-output-vocabulary)
- [6. Visibility, bounds, and saying which level was empty](#6-visibility-bounds-and-saying-which-level-was-empty)
- [7. The acceptance test: the over-strictness arm](#7-the-acceptance-test-the-over-strictness-arm)
- [8. Where a candidate lives](#8-where-a-candidate-lives)
- [9. Decomposition, in order — and what it does not yet include](#9-decomposition-in-order-and-what-it-does-not-yet-include)

---

## 1. What IDENTIFY is for, and what would make it worthless

IDENTIFY proposes CANDIDATE conflicts for a member to judge. It serves two of Bob's three cases and must refuse the
third. **In the WORLD**: the rule requires X and the department did not-X; the department said X in March and Y in
October. That is a finding, the system's product. **In the RECORD**: one part of our own holding asserts a fact and another
asserts its opposite. That is a defect in our holding, with a duty attached. **NEITHER**: *"spending was reduced a
little"* against *"spending dropped a lot"*. That is not a contradiction at all.

**The failure that makes it worthless is the third case.** A detector that cannot tell imprecision from double-speak buries
members in false conflicts and is switched off inside a week. So its acceptance test is over-strictness (§7), and every
design choice below is made so that a false conflict is CHEAP TO SEE and a missed one is STATED as unlooked, never as
absent.

## 2. The split: PAIRING is the plane's, JUDGEMENT is the machine's

Two questions, answered by two different kinds of worker, and kept apart so each can be audited on its own terms.

- **PAIRING — which two assertions are worth comparing — is deterministic, in the plane, and auditable.** It is a set of
  joins over the record (§4), each pair carrying the KEY that brought it together. Given the same record and the same
  viewer it returns the same pairs. It judges nothing.
- **JUDGEMENT — whether a pair conflicts, and how — is semantic work the plane cannot do.** It is the machine's, inside a
  run, labelled as machine work, and it is always a PROPOSAL (DEC-24). It never edits either side, never grades anything,
  and never closes anything.

Why split: a single machine pass over "everything" can neither be bounded nor audited. Nobody could say what it compared,
so nobody could say what it missed, and a silent result would read as *no contradictions*. With the split, *what was
compared* is a plane fact and *what was concluded about it* is a labelled proposal.

## 3. What can be compared — the two kinds of assertion the record holds

| kind | where it lives | why it counts |
| --- | --- | --- |
| **OUR assertion** | the `claim` on an ACCEPTED basis version (`inquiry_basis_versions.claim`, `state = 'accepted'`); a project's adopted conclusion claim (`conclusions[]`, §7.1 of `INVESTIGATIVE-SESSION.md`) | it is what the group holds to be so; two of them disagreeing is the RECORD case |
| **A SOURCE's assertion** | a content extent a leg rests on (`inquiry_basis.content_id`, its extent in the content row) | it is what a document says; two of them disagreeing is the WORLD case |

**Not compared, each for a stated reason.** A `suggested`, `considering` or `rejected` version is not held. A conclusion's
free TEXT is the member's words, and §7.1 says a claim is not a second name for it. Commentary is labelled not-evidence.
A LEAD is never evidence (C-54.1). An AI reading of a document is kept out of coverage and is not the document.
**Two PROJECTS' conclusions on one inquiry** are PLURALITY, each attributed to its project. §7.1 item 3's finding already
surfaces it, and treating it as a record defect would make one project's answer a correction to another's.

## 4. The pairing keys

Each key is a join over tables that exist today. Each pair carries its key, because the member judging it needs to know
WHY these two were put side by side.

| key | the join | the case it can feed |
| --- | --- | --- |
| **K1 · one inquiry, opposite roles** | a `supports` leg and a `cuts_against` leg of the same inquiry (`inquiry_basis.role`), each with a content referent | WORLD — the inquiry already holds both sides; what is missing is anyone proposing the discrepancy itself as the conclusion shape |
| **K2 · one subject, two held claims** | two inquiries with the same `bundles.inquiry_subject_entity`, each with an ACCEPTED version carrying a `claim` | RECORD |
| **K3 · one referent, two held claims** | two ACCEPTED versions, of different inquiries, whose legs rest on the SAME content row (or, where no content row is named, the same captured document) | RECORD — we read the same text two ways |
| **K4 · one entity, two sources of different kind or date** | two cited content extents whose documents RESOLVE (a `resolutions` row, established) to the same entity, from different doctypes as their readers state them (a regulation against minutes, a staff report or an agenda) or with different document dates as the readers state them | WORLD — Bob's two examples: the rule against the action, March against October |

**A document date or a doctype that its reader does not state is UNDETERMINED, and a pair that needs one is not
formed on a guess.** The pairing reports how many candidates it could not form for that reason (§6), because a date
invented to make a pair is the gate pressuring someone into inventing a figure (`CLAUDE.md` §4).

**Keys are added, not tuned.** A fifth key is a design change here and a new row. It is never a widened join inside an
existing key, because a key whose meaning drifts makes the fixture's per-key figures (§7) incomparable across runs.

## 5. The judgement, and its output vocabulary

For each pair the machine returns exactly one proposed label, both sides QUOTED VERBATIM with their referents, and one
sentence of reason:

| label | meaning |
| --- | --- |
| `world` | the two sources say incompatible things about the same matter — a candidate FINDING |
| `record` | two things the group holds cannot both be so — a candidate DEFECT in our holding |
| `precision` | the same fact at different precision — Bob's NEITHER; not a contradiction |
| `unrelated` | not about the same matter after all — the pairing key over-reached |
| `undetermined` | the machine cannot tell, and says so; never coerced into one of the four |

**IDENTIFY does not assign CAUSE.** Bob's causes — *"a difference of opinion…, a misquote, or genuine double-speak"* —
are RESOLVE's kinds, a member's judgement, and one of them (double-speak) PROMOTES a record conflict into a finding.
Asking the machine for cause would put the civic verdict in the one place DEC-24 forbids it.

**The machine sees only the two sides and their immediate context** (the extent, the claim, the inquiry's question, the
documents' stated date and doctype). It does not see the rest of the record, so a label cannot rest on something the member
is not shown next to it.

## 6. Visibility, bounds, and saying which level was empty

- **The pairing runs AS A MEMBER** (the run's viewer). It pairs only what that member can see, never names a project the
  member cannot see (§7.9), and never enters a DISCOVERABLE project's contents (§7 item 7.14). A machine credential runs it
  only within a member's minted scope.
- **It is bounded, and the bound is stated.** Each key enumerates up to a stated limit and says whether it truncated
  (`limit`, `truncated`, per key), in the envelope every capped read already uses (the bound-sweep rule). A capped
  answer that drops its bound reads as COMPLETENESS.
- **An empty result names its level.** "No candidates" is one of four different facts and is never printed bare:
  (a) the key had nothing to join — e.g. no two accepted claims share a subject entity — which says the record is
  SPARSE there, not consistent; (b) pairs were formed and the judgement labelled every one `precision` or `unrelated`;
  (c) pairs could not be formed because a date or doctype was undetermined (counted); (d) the key was not run.
  `CLAUDE.md` §2: absence at one level is not evidence of absence at the next, and saying WHICH is an obligation.

## 7. The acceptance test: the over-strictness arm

**A labelled FIXTURE corpus comes before any member sees a candidate.** It holds, at minimum:
- `precision` pairs in the shape of Bob's own example (*"reduced a little"* / *"dropped a lot"*), and more of the kind
  real documents produce: rounded against exact figures, "approximately" against a stated number, a summary against the
  table it summarises;
- genuine `world` pairs in both of Bob's shapes: a regulation's requirement against minutes or a staff report recording
  the contrary act; one body's statement in one month against its contrary later;
- genuine `record` pairs: two accepted claims on one subject that cannot both be so;
- `unrelated` pairs a key will plausibly form: same entity, different matter.

**The gate is the FALSE-CONFLICT RATE:** the share of `precision` and `unrelated` pairs the judgement labels `world` or
`record`, stated with the corpus size and per key. **Its threshold is set by the first measurement and recorded in
`MEASUREMENTS.md`, and a detector above it does not reach a member.** Recall (genuine pairs labelled correctly) is
measured and reported beside it, and is not the gate. **Built and first measured by M0-71 (2026-09-23)**: the corpus is
`bio-plane/test/contradiction-corpus.mjs` (26 pairs, every shape above), the gate `bio-plane/test/contradiction-gate.mjs`,
the suite `bio-plane/test/contradiction-overstrict.test.mjs`; THRESHOLD **0** (`measurements/M-118.md`). The gate also
fails BY NAME, never with a rate, when what it measured cannot support one: nothing compared, a key's gold pair not
formed, a formed pair the fixture does not label, or a compared pair left without one of §5's labels (a disabled
judgement has no false conflicts and must not read as a strict one).

**RULED 2026-09-23 by BOB #31 (M0-71): the threshold is 0, PROVISIONAL.** Until a measurement sets it, a detector that
labels ANY `precision` or `unrelated` fixture pair `world` or `record` does not reach a member. **A detector that
ABSTAINS escapes a false-conflict gate, so recall is reported beside the rate, every time** (M0-71's worker, 2026-09-23).
REC-147's machine judgement stays blocked until it has been measured on this gate WITH its recall reported (M-118).

**Negative controls, each breaking one thing:** (1) the PAIRING arm — disable K2, and the fixture's record pair is no
longer compared, and the suite fails naming K2; (2) the JUDGEMENT arm — replace the judgement with one that labels every
pair `world`, and the false-conflict gate fails by name. That arm is why the gate exists; a detector that cannot fail it
measures nothing. (3) The EMPTY arm — a record with no joinable pairs must return case (a) of §6, never a bare empty list.

## 8. Where a candidate lives

A candidate is a plane row, append-only, written through ONE append site: the two referents (each a claim at its version,
or a content extent), the key, the proposing run, the proposed label and its reason, and a state that PRESENT and RESOLVE
will extend (only `proposed` exists until they are designed). Machine rows are labelled as machine work. **Re-running does
not duplicate a pair already proposed over the same two referents at the same versions**; a changed side is a new pair,
and the old one stays with its versions — a candidate is a statement about two things as they were.

## 9. Decomposition, in order — and what it does not yet include

1. **RECORD — the pairing read** (I3, an IC): the four keys as §4 defines them, viewer-gated, bounded per key with the
   envelope, the §6 empty-level statement, and the undetermined-date/doctype count. No judgement, no table write.
   **BUILT 2026-09-19 by REC-146 (IC-167): `op=contradictionpairs`.** All four keys, each pair carrying its key;
   every bundle column of every side gated through the ONE `Store#bundleGate`; a per-key bound of 50 over-fetched by
   one so truncation is OBSERVED, with a caller `limit` clamped and published; an `absence` naming the first empty
   rung of a published ladder of bounded existence probes; K4's undetermined candidates counted and NOT formed.
   Refusals: C-60. Suite `bio-plane/test/contradictionpairs.test.mjs` (43 assertions), control `test/nc-rec146.mjs`
   (six arms, all as declared). **WHAT ITEM 1 DID NOT BUILD, said here because the op says it too:** no judgement, no
   label vocabulary on the wire, no candidate table, no write, and no fixture — items 2 and 3 are untouched.
2. **M0/VERIFY — the fixture and the measurement**, before anything a member sees: the corpus of §7, the false-conflict
   rate and recall per key, the threshold recorded in `MEASUREMENTS.md`, and the three negative controls.
   **BUILT 2026-09-23 by M0-71, off-record**: 26 labelled pairs built as a record and paired by `op=contradictionpairs`;
   the gate; a deterministic baseline candidate measured at 0/17 false conflicts, recall 2/9, 14/26 `undetermined`;
   THRESHOLD 0 (`measurements/M-118.md`). Controls `bio-plane/test/contradiction-overstrict.control.mjs`, six arms, all
   as declared. **Not built:** the machine judgement (item 3) is not measured because it does not exist, and it plugs into
   this same `measure()`/`gate()` before anything reaches a member.
3. **RECORD + the investigative session's skill — the judgement and the candidate table**, after 1 and 2: the machine's
   label over each pair, written through one append site as labelled machine work.
4. **NOT YET ROWED: PRESENT and RESOLVE.** The next design act, after 2's first measurement. RESOLVE carries Bob's rule
   that a resolution records its KIND and that double-speak promotes a record conflict into a finding.
