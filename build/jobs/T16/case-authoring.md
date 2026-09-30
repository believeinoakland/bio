# case-authoring (T16)

**Status** · session_01Q1akymVhSfhfv5f25VnNRw · depth 2 · WORKING · handled B2

## J1 · QUESTION

Six readings I am building on now; each is my best reading, and (1) must match what PUBLICATION parses (its R2, R10, R20), so please rule it for both jobs.

(1) THE `/5` BLOCKS' SPELLING (publication R20; my R14, R35–R37). The restricted grammar holds only arrays of flat rows, so R20's nested `acknowledgement?` and `accounts[]` cannot be written as worded. I write:
- `captures:` one row per capture: `capture`, `member`, `grade` (letter or null), `grade_basis` (provenance.captureGrade's `basis`), `co_attested`, `timestamp_at`, `co_archive` (locator or null), `late`, `self_attested_only`, `acknowledgement_reason`, `acknowledged_by`, `acknowledged_at` (the last three null unless self-attested), `accounts` (a count), `sentence` (R36's fixed sentence when self-attested, else null).
- `capture_accounts:` one row per signed account (capture.captureAccountsOf): `capture`, `seq`, `by`, `at`, `key_b64`, `text` (grammar-safe), `text_sha256` and `signature_sha256` (over the verbatim text and armored signature); the body prints each account's text and armored signature verbatim, since neither fits the grammar.
- `sources:` one row per statement: `capture`, `kind`, `attribute`, `stated` (the value publishableAt answered, or "an unnamed source"), `basis` (`consent`, `public_elsewhere`, or null for the unnamed row), `claim` (a hostile entry's claim sentence, else null), `receipt_sha256`, `receipt_at` (on the unnamed row only).
No source id or entry id is written: an opaque id in two published cases would link them, which is itself an identity detail (K509 (4)). So publication's R51 re-derives each row's entry at commit from the capture (sources.sourceOf) and matches kind, attribute and stated value. If you rule otherwise (for example `case_captures:`, or ids), I follow the ruling.

(2) WHICH CAPTURES (R35 vs publication R20). R35 says "each capture a load-bearing member rests on"; R20 says "one entry per capture a member rests on". I state every member's captures (a superset satisfies R35) and require the acknowledgement (C-120.4) only for a load-bearing Grade B capture that is not co-attested. An acknowledgement of a supporting member's non-co-attested capture is standing (it is in the case), and marks it self-attested (R36).

(3) WHAT "RESTS ON" READS. Each member's direct document legs at its pinned bytes (both roles), one level deep as R29/R31 are: a leg's content row's capture, else every capture its target registers (provenance R48's `register`). An inquiry leg contributes nothing here (that finding discloses its own when published).

(4) SOURCES NEEDS `sourceOf` TOO. publishableAt takes a source id, and a capture's source id is minted by sources on first read (its R1), so I call `sources.sourceOf({captureSha, viewer})` (the act's viewer) and then `publishableAt({source, audience: "public"})`. The edge exists; the Uses line names only publishableAt. A source minted this way inside a rolled-back pre-flight rolls back with it.

(5) RATIFICATION R18's ANSWER SHAPE. Not worded. I read it as `{ok: true, refusals: [...]}`, each refusal byte-identical to the act's, and fold `refusals` into R34's `blockers`. Please give me ratification's actual shape when it merges.

(6) R34's `first`, `ready`, `blockers`. `first` is op=publish's refusal, or null when op=publish would succeed. `blockers` lists every other refusal reachable independently: each failing (load-bearing member, axis) under R6, R12, R35's, R31's as R32 reads it, then ratification R18's list (reachable only when op=publish succeeds, since it needs the text; otherwise the answer says it was not reached). `ready` is true only when `first` is null and `blockers` is empty. R34 skips reevaluation's raise (R15) inside its rolled-back run: raise tells its listeners synchronously, and a pre-flight must not tell them of an edition that never happened.
