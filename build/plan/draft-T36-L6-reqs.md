# Draft: T36 L6 requirement wordings (T36-20 … T36-24)

Drafted for BOB #136 from `plan/current.md` T36-20–T36-24, its "Rules at the opening" (rule 7 (a): M-Q2 is not measured, so N708's relay and T36-50 stay out, K2111), and their rulings (K1941, K2063, K1993, K1880, K1899, K1944, K1983, K2007, K1489, K1991, K2122, K1864, K2087, K2114, K31), N695, N715, N727, N729, N731, DEC-164 (4). Each line is ready to paste; new ids continue after each file's highest. Today's facts were read on `tranche/T36` @ `2a200f7f4b`.

## hypotheses (T36-20) — highest today R15

**Is a wording needed?** Not strictly: K2007 rules that R12 and R14 already forbid the defect, and the fix is implementation. But R12 forbids saying "how many they **keep**", and a shared sequence also shows how many notes others **wrote and deleted**, which R12 does not name in so many words. R14 already carries the related rule ("a later note never takes a deleted note's number"), so one appended sentence names the rule and gives the test a line to cite. Recommended: append it (no new id).

Today: `member_notes.note_id` is `INTEGER PRIMARY KEY AUTOINCREMENT` (`bio-plane/src/hypotheses/schema.mjs`:45), one sequence for the whole group, so the gaps between a member's own note numbers count everyone else's notes.

**R14, appended** (N727): (T36; N727; K2007, K1489) No note's number is drawn from a sequence shared across members: the numbers a member's notes carry, their order and their gaps depend only on that member's own notes, so they reveal nothing of whether, or how many, notes any other member keeps, kept or deleted; a note kept before this rule is answered by such a number too. *(not yet met: T36)*

**Uses changes.** None.

**Suggestions.**
- A per-member sequence keeps every interface as it is: R11's "a number of its own", R12's newest-first order and its `after` cursor, R13's `note` argument. An opaque id would break R12's order and cursor, so it would need R12 re-worded. The per-member number needs a per-member high-water mark, not `MAX(note)`, or deleting a member's latest note would let its number be taken again (R14). Existing notes are renumbered per member at the upgrade, in their present order, and their turns follow them. The old numbers are kept nowhere, as R14 says of history.
- **Test** (`bio-plane/test/m/hypotheses/notes-t36.test.mjs`, citing R12, R14): ann keeps 3 notes; vera keeps 50 and deletes 20; ann keeps 3 more. Ann's six numbers, her `notesOf` answer and every refusal she can provoke (`NO_SUCH_NOTE` on numbers around her own) must be byte-identical to a world where vera kept nothing. Control: ann deletes her own latest note, and her next note does not take its number. Also: a store with group-wide numbers is migrated, after which each member's numbers are dense from 1 and `noteTurn`'s turns still sit on the right notes.
- **P6:** 763 lines (`bio-plane/src/hypotheses/`, 3 files). The fix adds a few dozen.

## citation (T36-21) — highest today R12

New heading after R5 (Provides), before Private:

**recordedBy({captureSha, extent?, limit?, viewer})**, registered with `retrieval` (T36; N715; K2063 (1))
- **R13** At start this module registers its read once, through `retrieval.registerRecordedBy("citation", fn)` (its R76). The read answers in `events` R49's shape (with K2114's wording), `module: "citation"`, over the citations held in the citing objects' current bytes whose document is pinned to the capture (R2: the leg's or edge's `extent_capture`, else its content row's capture). Its items are each leg of an inquiry's `basis[]` (`kind: "leg"`, `field: "basis"`, `extent` the leg's part, or `document` when the leg names none) and each `cites` edge of a project's `references[]` (`kind: "cites"`, `field: "references"`, `extent` `document`). In each item, `record` is the citing object's id; `by` is the member (or `class:<cls>`) whose act first wrote that leg or edge into the citing object, and `at` is that act's instant, both as the object's history holds them; `withdrawn` is true for a `severed` edge (R4), else false. A leg no longer in a basis is not an item. Sight is the citing object's (R9 for a project, the inquiry's for a question): one the viewer may not see is neither answered nor counted. It writes nothing and never throws. (N715; DEC-164 (4); K1941, K2063) *(not yet met: T36)*

**Uses changes.** `retrieval`: `registerRecordedBy` (its R76), for R13 (an existing edge). `content`: `canonicalExtent` (its R2), `extentRelation` (its R6), for R13 (an existing edge). `events`: R49's shape is named, never called, so no edge. `record-core` and `promotion`: the citing object's bytes and history, for R13's `by` and `at` (existing edges).

**Suggestions.**
- R6 still holds: the read keeps no row of its own. It reads the legs through their projection (`inquiry_basis.content_id`, which names capture and extent). A project's `cites` edges carry their pin only in the document's bytes, and `refs` holds no capture, so the job chooses how to find a capture's edges without reading every project (for example, `refs` joined to the documents that hold the capture, then those bytes read). No author is projected per leg, so `by` and `at` come from the citing object's promotion history (the first version whose bytes carry the leg or edge).
- Registration happens where the plane's boot makes this module, against the same `retrieval` instance `findIn` runs on (`retrieval.recordedReads()`). Once citation registers, `findIn` no longer answers `{module: null, why: "no later module's records were read: none registered"}` (retrieval R73). The job checks the whole-plane suites for that line.
- **Tests:** a `found` match cited onto an inquiry (R1), then the same `findIn` naming its member under `recorded` with `relation: "same"`; a narrower part answered `narrower`; a project edge answered with `extent` `document`, then answered `withdrawn: true` after `sever`; a citation inside a hidden project neither answered nor counted, its `truncated` unchanged; an earlier capture's leg absent from a later capture's read; a second registration refused `LISTENER_DECLARED`; `VIEWER_MISSING` and `EXTENT_MALFORMED` answered as `events` R49 (K2114) with no catalogue row added.
- **P6:** 1,186 lines (`bio-plane/src/citation/`, 3 files). R13 is estimated at +120 to +200.

## skills (T36-22) — highest today R38

**R38, amended** (whole line, replacing today's; its (a) and (b) are unchanged):
- **R38** (K1880; K1888; T36: N731, K1993) `research_boundary` also carries three clauses, each found by R21's normaliser in the canon sentence that states the ruling: (a) K1880: the assistant may search and read any public site to find what a question needs; nothing it reads that way enters the record; whatever enters the record is fetched by the substrate's capture at a member's or the record's request, never by the assistant; (b) K1888: the assistant reads inside a file only as the text the plane's readers extracted from it, and is told the file's `active` list (its macros, scripts and embedded files) as a fact about the file; it never opens an embedded file, runs a macro or asks for a file's bytes; (c) (N731; K1899's F2 rule; K1993) the assistant's own capture request names only an address the record already holds, and any other is refused by name (`capture-requests` R49, C-28.24); a page it found on a public site that the record does not hold is the member's to acquire: the assistant names it to the member and never asks for its capture. No clause carries control-flow authority (R16, R24): what the assistant may reach is fenced in code (`agent-worker`, `agent-runner` R10, `capture-requests`), and these clauses are instructions only. `renderPack` throws, naming the clause, and renders nothing when any of the three is not found (R37's form). *(not yet met: T36)*

**R33, appended** (T36; N731): (T36; N731) The capture clause this layer carries is R38 (a)'s and (c)'s, the same objects the resident layer carries, so the two never differ. *(not yet met: T36)*

**R28, appended** (T36; N731): (T36; N731) Its capture clause is R38 (a)'s and (c)'s, as R33's. *(not yet met: T36)*

**Satisfies**, its K1880 line re-worded: "K1880 (R28, R33, R38 (a)); K1888 (R38 (b)); K1899 F2's rule and K1993 (R38 (c)); `BIO_Assistant_and_AI_Roles_v0_1.md` §3 rules 11 and 12."

**The canon sentence (BOB's act before L6's START, R21).** The file is `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md`, §3. Rule 11 today (line 72) is **Bob's ruled text**: K1944 folded K1880 and K1888 into it "verbatim … no change of meaning", and it is headed "(Bob, K1880; K1888)". Recommended: **leave rule 11 unchanged and add a rule 12**, labelled as BOB's, so Bob's words stay his and nothing BOB ruled is presented as Bob's:

> 12. **What the assistant may ask to capture** (BOB, K1899: F2's rule under K1880; K1993). The assistant's own capture request names only an address the record already holds (one a held capture was fetched from, or a link in a held capture), and any other is refused by name; a page the assistant found on a public site that the record does not hold is the member's to acquire: the assistant names it to the member and never asks for its capture.

(The alternative the entry names, appending the same sentence to rule 11, would put a BOB rule under Bob's heading. See For BOB 1.)

**Uses changes.** None.

**Suggestions.**
- The new clause is a third constant beside `DISCOVERY_IS_NOT_CAPTURE` (`skilldoctrine.mjs`:1227). It is held once and named from the resident layer, `legal_lookup` and `action_planning`. R1's check in `renderPack` (`skillpack.mjs`:385, today over clauses 0–2) widens to cover all four.
- Every pack's version moves (R11). After the release, a run recorded under the old pack is refused `SKILL_VERSION_MISMATCH` by `agent-worker` R48 on its next segment, as at every pack change.
- **Tests** (`boundary.test.mjs`): (c) found verbatim in Roles §3 rule 12 by the normaliser; present in a rendered pack's `resident.research_boundary`, and the same object in `legal_lookup` and `action_planning`; listed by no `disclosable` entry; R16 finds no control-flow authority in it; `renderPack` throws naming it when it is removed; the pack's version differs from T35's.
- **P6:** 2,351 lines (`skilldoctrine.mjs` 1,739, `skillpack.mjs` 612). The change adds about +20.

## answers (T36-23) — highest today R29

**R28, amended**: in R28's parenthesis, replace "a selection is frozen at set time into the enumerated ids it then holds, refused `SCOPE_TOO_LARGE` over 200, since a selection expires and a standing find outlives it, K1982" with:

"a selection is frozen at set time into the enumerated ids it then holds, read through `retrieval.selectionRead` (its R77), never `selectionResolve`, so setting a find extends no selection's life and each refusal (`NO_SUCH_SELECTION`, `NOT_YOURS`, `SCOPE_TOO_LARGE` over 200) writes nothing, since a selection expires and a standing find outlives it, K1982; T36: N729, K1991"

and mark the line *(not yet met: T36)*.

**Uses changes.** `retrieval`: `selectionRead` (its R77), for R28, beside `findIn` (an existing edge).

**Suggestions.**
- Today `standing.mjs`:158 calls `retrieval.selectionResolve({…, weight: "report"})`, which moves `selections.touched` and `expires` before the 200 check refuses. The re-point is one call: `selectionRead({handle, viewer, owner})` (no `weight`), with its refusals relayed unchanged.
- **Red 21 (K2122 (c)).** In `standingfind.test.mjs`, `findWorld` makes the four recording modules as the plane's boot does: `w.retrieval.recordedReads()` beside `w.retrieval.zone()`. That way the first `findIn` creates no tables and :46's "a refusal writes nothing" holds. This is a test-fixture change only, with no requirement.
- **Tests:** a selection of 201 ids refused `SCOPE_TOO_LARGE`, with its `selections` row (`touched`, `expires`) and every table byte-identical before and after; an expired selection not yet swept refused `NO_SUCH_SELECTION` and left as it was; another owner's handle `NOT_YOURS`; a 3-id selection frozen and set, its `expires` unchanged.
- **P6:** 1,551 lines (`bio-plane/src/answers/`, 9 files). The change is a few lines.

## agent-worker (T36-24) — highest today R65

N708's relay (the other share named in the entry) is **not** worded: rule 7 (a) is unmet, because M-Q2 is not measured (K2111). The status line's N708 sentence and R6 stay as they are.

**R48, amended** (whole line, replacing today's):
- **R48** A run's model is instructed by the pack the run names. When model turns run (R40), this member reads the rendered pack apart from the rest of what the plane publishes, from `op=agentpack` (`control-plane` R41: `{ok: true, fences, pack}`, the composed machine fences and the pack the control plane renders over them with `skills.renderPack`, or `pack: null` with `pack_absent`), and never from the untargeted `op=affordances` answer. A run reads it under its `ai` credential, an ask under its grant (R54) and a draft under its grant when one arrived (R59). It renders nothing itself and imports neither the check catalogue nor `skills`' code. It refuses a segment whose run's recorded skill version is not that pack's version, before any turn and as it refuses a run whose recorded payer differs (R10): a 409 refusal carrying both versions, or, for an answer carrying no pack, one stating its version undetermined and naming `pack_absent` when given. Until turns run it changes nothing. (T36; N695, K1864, K2063 (9)) *(not yet met: T36)*

**R37, amended** (whole line, replacing today's):
- **R37** It judges no scope: it has no op allow-list, scope or class. `PLANE_OPS` is exactly `whoami`, `airun`, `airunlog`, `airunspawn`, `meaningrows`, `basisversions`, `search`, `versionchain`, `agentpack` (reads; `agentpack` for R48's rendered pack, K181, K649 (5), N695) and `airuntick`, `suggest`, `capturerequest`, `airunclose` (writes the plane makes); it calls no other op, and none of them returns document bytes. (Q1-4; the canon audit's R37 row) An ask's reach is not `PLANE_OPS`: it is R55's list, read only under the ask's grant; a run's `PLANE_OPS` is unchanged by it. (T36; N695) No call of this module, whether a run's, an ask's or a draft's, reads `op=affordances`. *(not yet met: T36)*

**R59, amended**: in R59's first parenthesis, replace "with a grant the pack is read by `op=affordances` under it, R48, R60" with "with a grant the pack is read by `op=agentpack` under it, R48, R60", and mark the line *(not yet met: T36)*.

**Uses changes.** None: `op=agentpack` is reached over the wire, as `op=affordances` was. (`control-plane` R41's "until `agent-worker` reads them apart" and its removal of the two keys are control-plane's, T36-37.)

**Suggestions.**
- The code reads `affordances` in three places (`index.mjs`:402 for a run, `ask.mjs`:177, `draft.mjs`:129), and `ops.mjs` names it in `PLANE_OPS` and `ASK_PLANE_OPS`. Each becomes `agentpack`. `publishedPack` reads `pack` and `pack_absent` from the `agentpack` answer, which already has the same keys. The door admits `agentpack` under a grant (`GRANT_OWN_OPS`, control-plane `index.mjs`:416), and its spec and session sets equal the untargeted `affordances`' (op-declarations R30, `op-declarations/index.mjs`:521), so a run's credential reaches it wherever it reached `affordances`.
- **Release order.** Agent-worker and the plane ship in T36's one release. Once T36-37 drops the two keys from `op=affordances`, an agent-worker older than this job would refuse every segment (`SKILL_VERSION_MISMATCH`, pack undetermined) and every ask (`PACK_UNDETERMINED`). So the release deploys this member before, or with, the plane. T36-37's START checks that no other reader remains (K2087).
- **Tests:** every plane mock and `test/inprocess.mjs` answers `agentpack`. A capture of every request at the `PLANE` binding during a run, an ask and a draft with a grant finds `op=agentpack` once and `op=affordances` never, with the credential still in the header (R60). With `pack: null` and `pack_absent`, a run is refused 409 naming it, and an ask and a draft answer 502 `PACK_UNDETERMINED` with no model call. The `R44` copies and `PLANE_OPS` equal R37's list. The bundle is regenerated (R45).
- **P6:** 2,477 lines of source (`agent-worker/src/`, 6 files), plus 176 lines of configuration and build. The committed bundle (4,638 lines, generated) and `test/` are excluded. The change is about ±20 lines.

## Choices made (BOB's, P17)

1. hypotheses: an appended sentence to R14, not a new id. The requirement names the property, not the mechanism; the per-member sequence is a Suggestion.
2. citation: the read answers the citations in the citing objects' **current** bytes. A severed edge is answered `withdrawn: true` (sever is a status change, R4). A leg removed from a basis is not answered: citation keeps no withdrawn state for legs, and the basis versions are `basis-versions`', not citation's. `record` is the citing object's id. `kind` is `leg` or `cites`. A citation counts whoever wrote it (`cite` or another act on the bytes), since the question is "who recorded this passage".
3. skills: (c) is a resident clause beside (a), and R33 and R28 name it as their capture clause, so the clause the run reads and the rule `capture-requests` enforces say the same thing.
4. answers: only R28's parenthesis is re-pointed. `selectionRead` takes no `weight` (R77 answers at `report`).
5. agent-worker: R48, R37 and R59 are re-pointed to `agentpack` for all three callers (run, ask, draft), because a read of `affordances` left in any one of them would block T36-37.

## For BOB

1. **The canon sentence (skills R38 (c)) may be Bob's to see.** Rule 11's text is Bob's (K1880, folded verbatim by K1944). The held-address limit is BOB's F2 rule (K1899, K1941: "K1880 as Bob ruled it"). Code has enforced it since T35 (`capture-requests` R49), and it is consistent with rule 11 as worded ("at a member's or the record's request, never by the assistant"). But it narrows one thing Bob said in K1880: "the researcher delegates the capture to the civicsmith substrate". Under F2, the assistant cannot delegate the capture of a page it found that the record does not hold; a member must acquire it. The security review had also classed F2 as **Bob's** ("it changes what PL-4 and DEC-55 let the AI do unattended"), and it recommended "waits for a member to approve it", not a refusal. Appending the sentence to rule 11 would therefore change what Bob's rule says. Adding it as rule 12, labelled BOB's, does not, but it still puts in front of every run a limit Bob has not seen worded. **Recommendation:** add rule 12 as drafted, and report it to Bob in plain words. If you judge the narrowing a change of policy rather than a reading of K1880, ask him before L6's START, with the options "held addresses only, a member acquires the rest" (today) or "a found page waits for a member's approval".
2. **Gap: skills R33 and R28 are marked met but are not fully met.** Both already state the held-address clause and say it is "found … in the canon sentence that states K1880". No canon sentence holds it, and the code carries only R38 (a)'s clause (`skilldoctrine.mjs`:1227, :1251, :911). SKILLS #14 was merged with its marks struck (K1985). R38 (c), the appends to R33 and R28 and the canon rule close the gap. Nothing was wrong in effect, since C-28.24 refuses by name (N731).
3. **hypotheses: is a wording needed?** K2007 says no. I recommend the one appended sentence: R12's "how many they keep" does not plainly cover notes written and deleted, which is what the numbers leak. The renumbering of existing notes at upgrade is BOB's detail and is stated in the Suggestions.
4. **citation's cost is the job's to watch.** A capture's project edges have no index (their pin lives only in bytes), and per-leg authorship is not projected, so `by` and `at` come from history. If the job finds either needs a new projection, that is a table under P6 and R6, which BOB decides when the job reports it.
5. **Release order (agent-worker before or with the plane).** This interacts with T36-37 (see the agent-worker Suggestions); it is BOB's at the release.
6. **Not read or not finished:** `op-declarations` R30's grant admission was read in code only (`agentpack`'s classes `admin`, `member`, `probe` equal `affordances`'), and I did not trace how a run's `ai` credential passes that class check. N695's own `next` entry was not found in the archives; its T35 shares were read from `draft-T36.md` and `current.md`. The whole-plane suites that might assert retrieval's "none registered" line were found by grep, not run.
