# consequences (T46)

**Status** · session_0193uDUaniMYE18ayZQpYAsc · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R24 (N911) is built: each success record is promoted as a `SUC-` `success_record` object in the act that records it (history, export, project fence), and rows held before T46 are promoted at the module's creation with id, fields, author and time unchanged. One part of R24 cannot be met from this module: **audit**. `record.auditPass` reports every promoted success record as an offender, with two record-grammar findings:
- C-1.2 "frontmatter id 'SUC-2026-0001' does not match the canonical ID grammar" (BUNDLE_ID_RE, R1: SUC is not a bundle prefix and has no slug);
- C-2.5 "object_type 'success_record' is not a known type" (checkBundle's knownSchemas have no `success_record@1`).
record-grammar R59 deliberately gave SUC "no HEADINGS or checkBundle schema" (R3's rule for row objects), yet R24 asks for audit "as a consequence part is", and a CONS part audits clean (my R14 test pins that).

Best reading: this is record-grammar's to close (an L1 provider; I may not change it): checkBundle admits a `success_record` object, i.e. its id `SUC-<year>-<4+ digits>` without a slug and its type, with a `success_record@1` schema or the row-object exemption. Until then my R24 test asserts history, export and the project fence, and pins audit's two findings as the known gap (it does not claim a clean audit). Alternatives if you prefer: (b) R24's "audit" amended to "history and export" for T46. I carry on with the rest of the job on my reading; only the R24 audit assertion waits on your answer.

Lower-level choices I made (recorded in my record for rulings.md): new SUC ids are minted from record-core's counter (`allocId`, ID_TABLE's sequential form, R59), stepping past any T45 id (four random digits) already held; a record whose promotion the record refuses (e.g. no producing group yet) is not written (the same as a CONS part); a held T45 row the record refuses is left in the rows, read as before, and retried at the next success record written or the next creation.

## Completion

**Read.** My requirements (`build/requirements/consequences.md`) and all my code (`index.mjs`, `checks.mjs`, `schema.mjs`, `measures.mjs`) and tests (`fixture.mjs` and nine test files) were read whole by this session (P20). The used modules' public parts (record-grammar, record-core, membership, promotion, provenance, content, inquiry, strength, conformance, entities, calc-grammar, money, calculations, people, civil-time, case-authoring) were read in full by a helper in this session, which wrote a digest citing each section (mechanics §17 (3), K2032). Promotion's `#promote` and record-core's `allocId`, `mintOpaqueId` and `transact` were also read directly where R24 calls them. `words.json`'s entries for my keys were read directly.

**Entries applied (T46-30).**
- **(N911) R24.** Each success record is a `SUC-` `success_record` record object. It is promoted through `promotion` in the act that records it (`#successLand`, one transaction with its row), with history, export and its project in the front matter (promotion R53 fence). New ids come from record-core's counter, in ID_TABLE's sequential form (record-grammar R59), stepping past any T45 id already held (`#mintSuccessId`). Rows held before T46 are promoted at the module's creation (`promoteHeldSuccessRecords`) with id, fields, author and `created` time unchanged; reads are unchanged. One the record refuses stays in the rows, is read as before, and is retried at the next success record or the next creation. A record whose promotion is refused is not written, as a CONS part is not. The audit clause is deferred by BOB's ruling K2980 (N958, T47): it is a `test.todo` naming N958.
- **(N913) R25.** The seventeen rows (C-114.23–.28, .30–.33, .35, .36, .38–.42) read `refusal.<CODE>` by key from `CONSEQUENCES_WORDS` (`checks.mjs`). Each `en` is verbatim, the table is frozen, and `consequencesWords(key)` throws on a missing key. Codes, numbers, `where`s and behaviour are unmoved. C-114.29, .34 and .37 keep their T45 words, as R25 says. R19's sentences are now answered with key and words: `sequence: {text, key, says}`, and for an absent cause `cause_key` plus `cause_says` (the words; it was the key). `actions` reads none of these keys; its suite passes.

**Lower-level choices** (accepted in B2, for rulings.md): SUC ids from the counter, stepping past held T45 ids; a refused promotion writes nothing; a refused held row stays readable and is retried.

**Deferred:** R24's audit clause, which is record-grammar's `checkBundle` admitting a `success_record` object (N958, T47; K2980).

**Found in other modules.**
- record-grammar: C-1.2 and C-2.5 on every SUC object. Reported in J1 and placed as N958.
- escalation: `invariants.test.mjs` R21 expects escalation's states without T46-1's `stopped_pursuing`. It is red with or without this job, and is escalation's own T46-38.
- No generated artifact was made stale beyond the plane bundle (rule 5 (4)).

**Flaws in this module, dealt with here.**
- T45's random four-digit SUC ids could draw `SUC-2026-9999`, which my own tests use as the absent id: a 1-in-10,000 flake. The sequential mint removes it.
- The success section's comment "nothing is promoted (J1)" is now true to the code.
- No other flaw was found in the code read.

**Tests and checks.**
- `node --test test/m/consequences/`: pass 63, fail 0, todo 1.
- Users of my changed read: actions pass 110 fail 0; filings 92/0; action-grammar 61/0; action-plans 75/0; plan-work 40/0; escalation 71/1 (the red above, same on the tranche without my change).
- The other suites that name consequences (affordances, op-declarations, op-grades, conformance, reevaluation, plane compose/t45, record-grammar ids-types, case-authoring outcomes, calc-grammar figures): pass 721, fail 18. These are the same 18 with and without my change (accepted reds).
- Process checks:
  - `format`: 159 modules, 158 requirements files; 0 failures.
  - `architecture consequences`: 14 product files, 59 relative imports; 0 failures.
  - `coverage consequences`: 25 of 25 live ids named by a test; 0 failures.
  - `ownership consequences tranche/T46`: 0 failures.
  - `run.mjs` over the product: architecture 2957 files, 0 failures; coverage 29 failures, none consequences' (rule 5 (1)'s T46 not-yet-met ids); channels 0 failures.

Size (session_0193uDUaniMYE18ayZQpYAsc): test runs 14, module lines 2175

## J2 · COMPLETE

T46-30 complete on job/T46/consequences. R24 built (success records promoted as SUC- success_record objects; T45 rows promoted at creation, unchanged; audit clause a test.todo naming N958 per K2980). R25 built (17 rows and R19's two sentences read words.json by key; C-114.29/.34/.37 kept). Consequences tests 63 pass, 0 fail, 1 todo; format, architecture, coverage (25/25), ownership 0 failures; run.mjs architecture 0 failures. Details, reds found elsewhere (escalation R21 states, T46-38) and Size line in my record.
