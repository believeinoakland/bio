# sources (T33)

**Status** · session_01S93E38cTcZCwGhXxLCywuU · depth 2 · WORKING · handled B2

## J1 · QUESTION

T33-22 (R16–R19). I am building on these readings; only (1) blocks my COMPLETE.

1. **`uses` edge.** R17 needs `provenance.captureGrade` (and R16 `provenance.homeOf` to find a capture's home), and requirements' Uses already lists provenance, but `modules.json` gives sources `["record-grammar","record-core","membership","capture"]`, so `architecture.mjs` fails my import. Best reading (K1505 (7)): you add `provenance` (layer 3, before sources) to sources' `uses`. Final uses: record-grammar, record-core, membership, capture, provenance.
2. **Where a capture's `actor` is read (R16).** No service answers it. Best reading: `provenance.homeOf(sha)` gives the home bundle; record-core `readFile(home, "data/provenance.json")` gives the document whose `capture.sha256` is the sha; its `capture.actor` (acquisition R16) is compared with `by` as member ids (`member:x` = `x`). No home, or no such document: `NO_SUCH_CAPTURE`. A null actor (daemon or probe capture): `NOT_YOUR_CAPTURE`.
3. **Rows for R16's codes.** Each refusal carries its row (Provides). Best reading: C-121.7 `MACHINE_CANNOT_MARK`, C-121.8 `NOT_YOUR_CAPTURE`, C-121.9 `NO_SUCH_CAPTURE`, C-121.10 `NO_SERVICE`, in this module's table (R14), with these translations, to be folded into the table under R14:
   - `MACHINE_CANNOT_MARK`: "Only a member, acting for themselves, can mark a result from a paid or account-gated service; no machine, scheduled task or unattended process can. Nothing was written."
   - `NOT_YOUR_CAPTURE`: "Only the member who captured a result can mark it as from their own account on a paid service. Nothing was written."
   - `NO_SUCH_CAPTURE`: "No capture the record holds answers to that digest. Nothing was written."
   - `NO_SERVICE`: "A result from a paid or account-gated service names the service it came from. Name it. Nothing was written."
   Order: `MACHINE_CANNOT_MARK` (any `by` naming no active member: absent, a machine, a daemon, a scheduled consumer, a revoked member), `NO_SERVICE`, `NO_SUCH_CAPTURE` (also a non-64-hex or list `captureSha`: one capture per act), `NOT_YOUR_CAPTURE`.
4. **`terms`.** Optional (null when absent); a non-string or one over 2,000 characters is refused `NO_SERVICE` naming `field: "terms"`; `service` at most 200 characters. Any other field in the call (a query, search terms, other results) is ignored and stored nowhere (R18).
5. **A second mark** of the same capture: an identical one (same service, terms, member) writes nothing and answers `existed: true`; a different one is appended, and `keyedResultOf` answers the latest (R2's supersession on read). The earlier stays.
6. **`grade_cap` when `captureGrade` answers no letter** (doorbell, unrecorded, unruled route: `grade: null` with `ceiling`): one rank below the `ceiling` it names (B → C), the letter a leg on it could at most carry; an authored observation (no ceiling; testimony D): D. A letter: one rank below it, D staying D.
7. **R19's classes.** All `purge: exempt`, `expunge: none`, `derive: stored`. `export: never` for source_entries, source_sight, source_reads, the marks (`source_keyed_marks`) as R19 says, and also for `sources` (it holds the knocker digest) and `source_consents` (its evidence describes the source); `admin-only` for `source_knocks` (R15's receipts, no value). `sight`: `group` for sources and source_knocks; `source` for the rest. `version_chain: true` for the append-only histories (source_entries, source_consents, the marks), else false.
8. The op is `sourcekeyed` (by stamp); `keyedResultOf` is in-process only (people, strength). `affordances` must grade `op=sourcekeyed` (its R40): reported to you, not mine.
