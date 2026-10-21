# cause-conclude-t51 (T51)

**Status** · session_01VESXFZUXCLRfCbjzi2u5Ny · depth 2 · COMPLETE · handled B0

## J1 · QUESTION

QUESTION · C42, basis-versions' part: I find no such read in `basis-versions`.

My best reading: the "version-chain read" named in the START is `provenance`'s `versionChain` (`op=versionchain`, provenance R17), which lists the captures at an address. `basis-versions` has no chain of captures. Its `basisVersions` read lists the readings (versions) of a question, which is a different thing. The refusal CONTENT_EXTENT_NO_CHAIN (C-45.2) is `content`'s (`content/extent.mjs`, `content/checks.mjs`), and the offer is `screens-inquiry/document.mjs`. None of these is a module I hold.

So I changed nothing for C42 and will not invent a read. If you want the per-version "can citations move here" answer, it belongs on `provenance.versionChain` (an extraction chain per capture, from `extraction`) or on `content`, with `screens-inquiry` R124 drawing it; I suggest routing it to the job that holds `provenance` or `content`. If you do mean a basis-versions answer, tell me which field of which read, and the requirement line (basis-versions has none for it), and I will build it. I carry on with C1, which is done.

## J2 · COMPLETE

COMPLETE · cause-conclude-t51 · C1 met; C42's basis-versions part is not in a module I hold (see my QUESTION J1).

**C1 (BLOCKER) met.** A version's totality (C-2.8) counts only legs that support; a leg cutting against needs no ground and no longer makes a version refused.
- `basis-version-grammar/grammar.mjs`: `basisVersionFindings` no longer counts a `role: cuts_against` leg with no ground as unplaced (`unlabelled++`), as `inquiry-grammar` R68 (`checkGrounds`) does not. A cutting leg that does name a ground is judged as before (no new refusal).
- `basis-versions/conclude.mjs` (`#concludeOwnReading`, R51): the version built from a question's live legs now takes its parts from the supporting legs only; a cutting leg is copied as the document holds it and placed in no part; the no-ground default part `g1` is given to supporting legs only, and none is declared when no leg supports.
- Tests (written first, seen failing, then passing): `basis-version-grammar/cutting-leg.test.mjs` (R3: 1 supporting + 1 cutting leg in a one-part partition is not refused; legs that only cut are not refused; control: a supporting leg left out of the partition is still VERSION_PARTITION_INCOMPLETE, beside a cutting leg or not). `basis-versions/own-reading.test.mjs` (R51, R3: a question with a supporting leg in a part and an ungrounded cutting leg concludes, the version carrying both legs and one part; the same with no grounds on the question; both failed on the tranche tip's code).

**C42, basis-versions' part: nothing changed.** The version-chain read is `provenance`'s `versionChain` and the refusal and move are `content`'s; `basis-versions` has no read of a chain of captures. Asked in J1; no requirement line exists for it.

**Requirement wording for you (not mine to write):** `basis-version-grammar` R3 says "a leg with no ground is `VERSION_PARTITION_INCOMPLETE` ... whether or not any ground is named". It should read: the totality counts the legs that support only; a leg whose role is `cuts_against` needs no ground (inquiry-grammar R68). `basis-versions` R51 should say a cutting leg is copied and placed in no part.

**Suites (all held modules and direct users, on my branch merged with tranche/T51):** basis-version-grammar 28/28; basis-versions 182/182; strength 173; contradiction 137 (129 pass, 0 fail); run-productions 65; investigation 38; reevaluation 150; publication 151; ratification 251; project-stage 23; case-tensions 24; case-import 156; case-account 48; case-authoring 208; review 73; skills 133; question-explorer 46; queue-producers 138; affordances 268; op-declarations 226; answer-envelope 41: 0 failures. store-door 52/53: the one failure (R17 `groupdescriptiondraft`, op-grades R49) is the same on the bare tranche/T51 tip, not mine. (agent-steps, agent-worker, plane, control-plane, journey-check not run: they use the modules only through the ones above; impact.mjs named 72 modules transitively.)

**Checks (`checks/run.mjs`):** architecture 0 failures; words 0 failures; coverage: none of its 10 failures is a basis-version-grammar or basis-versions id (all others', pre-existing); format: 1 failure, `build/rulings.md:4298` K4301 standing-list line, not mine. Ownership: the installed `ownership.mjs` takes one module, so I ran it for each: the only failures are the other held module's files and my record (the check does not know the cause job's record name or the pair); the two modules together touch only their own paths and tests.

**Found in another module:** none.

Size (session_01VESXFZUXCLRfCbjzi2u5Ny): test runs 40, module lines 3982
