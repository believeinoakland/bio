# citation (T47)

**Status** · session_015r8XRY7Rnu53uAFBQvCPSA · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R15's last clause: "A `divided` or case-frozen inquiry (one whose document cannot be revised) is refused as any write to it is (`inquiry` R11, answered unchanged as R1 relays it)."

Found: the write path does not refuse a revision of a `divided` question. Driven through the real `inquiry` (booted on the host, `divide` accepted, the parent at `divided`), a `sever` of the parent's leg promotes and lands ok. No registered check (inquiry R11, promotion R1–R20) refuses it. So for `divided` there is nothing to relay. A case-frozen question would be refused once `basis-versions` registers its `VERSION_FROZEN` check (L6, after citation), which my relay already carries.

My best reading, which I am building: citation adds no refusal of its own. It relays the write's answer unchanged (tested with a registered step's refusal), exactly as R1 relays `inquiry` R11. Severing a `divided` question's leg therefore lands today. That is a gap in the write (a terminal question's document can be revised), which belongs to `inquiry` R11 or `promotion`, not to citation. I will also file it as a REPORT.

If you want citation itself to refuse a `divided` question (as `inquiry`'s `ground` does, `DIVIDED_CANNOT_RESTRUCTURE`), say which code and row. That would be a new code of this module's; R15 mints none today.

## J2 · REPORT

Two findings in other modules (B2 asked for the first).

1. **inquiry (N1012, per K3092): a `divided` question's document can still be revised.** Inquiry R1 and record-grammar R35 make `divided` terminal, and leg-earning's `restsOnLive` comment says a terminal question's leg "cannot be" severed. Yet no check of the write (inquiry R11, promotion R1–R20) refuses a revision of a `divided` question. Seen through the real `inquiry` booted on the host: `divide` accepted, the parent at `divided`, then citation's `sever` of the parent's leg promotes and answers ok. Against inquiry R11: a terminal question's document should not be revisable by a member's act. Citation relays the write unchanged (R15, K3092), so once the write refuses, `sever`/`reinstate` will relay that refusal with no change here.

2. **affordances: a red my merge opens.** `test/m/affordances/plane.test.mjs:423`, "R14 R9 R18: on an inquiry target, sever and reinstate track the case citations counted in cited_by_case…", asserts that `sever` through a question citing another question (`project=QY`, an inquiry) is refused (`assert.notEqual(..., "ok")`). That is R4 as it stood. R15 (T47) now lets `sever`/`reinstate` act on a question's own legs, so the act answers ok and the test fails. Before my change: affordances 243 pass, 2 fail. After: 242 pass, 3 fail; the one new red is this test. The other two are inherited (R48/R53 ACT_HELP counts) and unchanged. The offer side, offering sever/reinstate on a question's own legs, is affordances' help for R15 (requirements suggestion: "affordances' help for it is theirs"; T47-49). Please name it at my merge (K2704) until affordances' job.

No other user module moves. run-productions 58/0, answer-envelope 32/1, plane 221/2 and control-plane 242/0 have the same failures before and after. op-declarations has the same 11 inherited failures; it does not yet see `drawquestion`. op-grades is 79/0. R14's new op `drawquestion` is in `citationOps`, so the plane routes it by its spread. Its declaration and grade are op-declarations' and op-grades' (T47-48).

## Completion

**Read whole** (P20, mechanics §6 step 2): `build/requirements/citation.md`; the public parts of every module in my Uses (`record-grammar`, `record-core`, `membership`, `promotion`, `content`, `retrieval`, `inquiry`, `provenance`); layer 6's contract (`build/layers.md`); my plan entry T47-17 and the plan's opening rules; and my own code and tests, all of them: `bio-plane/src/citation/` (index, splice, checks, recorded) and `bio-plane/test/m/citation/` (every file).

**Entries applied (T47-17):**
- **R15 (N977; amends R4).** `sever` and `reinstate` now act on a question's own legs. A selected member must be the target of a leg in the question's `basis[]`; otherwise the whole call is refused `NOT_CITED`/`NOT_SEVERED`. What moves is the status of the question's `references[]` entry naming that target, under any relation, the first such entry, as `connections.edgeSevered` reads it. The leg stays in `basis[]` byte for byte. A question asks no actor-joined test. Sight is the question's, and an unseen question answers `NO_SUCH_PROJECT`'s answer. The answer adds `citingObjectType: "inquiry"`. The Session Log says "basis legs on … moved to …, each leg kept as it was". The document's own `object_type` is promoted. The write's refusals are relayed unchanged; no code of this module's own (K3092, B2).
- **R14 (N975).** `drawQuestion({project, inquiry, note, author, viewer, identity})`, op `drawquestion` in `citationOps`. It writes one `confirmed` `cites` edge into the case's held document, byte-identical to what `cite` writes for a one-member selection naming the question. R1's codes and rows answer in R14's order: the case, joined, `BAD_NOTE`, `NO_SUCH_QUESTION`/`NOT_AN_INQUIRY`, `RETIRED_NOT_CITABLE`, the document, `SEVERED_EDGE`, `UNSPLICEABLE_REFERENCES`, `CITATION_TOO_LARGE`. Already drawn on answers `ok` with `cited: []` and writes nothing. The answer is R3's case answer with `handle: null`, `drift`/`moved` false, `gate`/`expires` null and `question: null`. It mints no code.

**A flaw fixed in my own module (P8).** `cite`'s Session Log header on a case read "Cited N Information record(s)" even when a cited member was a question. It now reads "Cited N record(s)", tested.

**Deferred:** none.

**Found in other modules (J2 REPORT):**
1. `inquiry`: a `divided` question's document can still be revised; no check of the write refuses it (BOB: N1012, T48, K3092).
2. `affordances`: `test/m/affordances/plane.test.mjs:423` pins old R4 (sever through a question refused). R15 makes it pass, so the test is a new red at my merge, to be named there until affordances' job (T47-49). Its offer of sever/reinstate on a question's legs is affordances' help for R15.
3. `drawquestion` is routed by the plane's spread of `citationOps`. Its declaration and grade are op-declarations' and op-grades' (T47-48). No test of theirs sees it yet.

**Tests run:**
- citation, `node --test bio-plane/test/m/citation/`: tests 102, pass 102, fail 0. New files: `draw.test.mjs` (R14, 12 tests) and `sever-inquiry.test.mjs` (R15, 10 tests, through the real `inquiry`'s `restsOnLive` and `projectsDrawingOn`). An audit test was added (R14, R15).
- Users of citation (P11), before → after:
  - run-productions 58/0 → 58/0
  - affordances 243/2 → 242/3 (the one new red is item 2 above)
  - answer-envelope 32/1 → 32/1, the same failure
  - plane 221/2 → 221/2, the same failures; `test/system/migrate-released.test.mjs` 1/0
- Other modules whose tests read routed ops:
  - control-plane 242/0 → 242/0
  - op-declarations 145/11 → 145/11, the same 11 inherited failures
  - op-grades 79/0

**Checks (process repository):**
- `format.mjs`: 166 modules, 164 requirements files; 0 failures.
- `architecture.mjs bio citation`: 16 product files, 63 relative imports; 0 failures.
- `architecture.mjs bio` (whole product, K2950): 3073 product files; 0 failures.
- `coverage.mjs bio citation`: 15 of 15 live requirement ids named by a test; 0 failures.
- `ownership.mjs bio citation tranche/T47`: 8 files changed by citation; 0 failures.
- `run.mjs bio`: coverage 43 failures, all other modules' ids not yet met (accepted red 1), none citation's; channels 0 failures.

Size (session_015r8XRY7Rnu53uAFBQvCPSA): test runs 10, module lines 1523
