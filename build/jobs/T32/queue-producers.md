# queue-producers (T32)

**Status** · session_01Fk6NZizVdw2PkBBvxaGQW3 · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied.** N546 (L11): R35's two findings now age from case-import R20's `seen_at`, the instant this copy first read the entry, in place of `no_seen_instant`. This covers `followed-case-entry` (verified entries) and, under K1419, `cited-docket-entry-refused` (refused entries). Each item's `age` is `{state: "determined", since: seen_at, ms: now − seen_at}`, and its basis names `seen_at`. A refused entry whose copies make one item ages from the earliest copy read. A missing or unreadable `seen_at` stays `undetermined` (`no_seen_instant`): never the publisher's date, never this read's clock. The `cited-docket-unreadable` CONDITION already aged from the read's `at` and is unchanged. Code: `bio-plane/src/queue-producers/index.mjs` (`#watchItems`, new `#seenAge`).

**Deferred.** None.

**Found for BOB (this module's requirements file, not code).**
- R35's `*(not yet met: T32)*` mark can be struck.
- The Uses list's `membership` line does not name `memberFacts`. `#watchRecipients` (R35: "no longer an active member") reads it, under membership R68. Add it to the Uses line; this is wording only.

**Tests.** A new R35 test in `cited.test.mjs` checks the following ages at the interface:
- a verified entry ages from `seen_at`, not from the publisher's date;
- a duplicate copy ages from the first read;
- a missing or unparseable `seen_at` gives `undetermined` with no `since` or `ms`;
- a refused entry's copies age from the earliest dated copy, including when an undated copy came first;
- a later read is older by exactly the interval.

The existing R35 fixture also carries `seen_at` now.
- `node --test bio-plane/test/m/queue-producers/`: tests 80, pass 80, fail 0.
- `node --test bio-plane/test/m/queue/` (the user of `feedItems`; its shape is unchanged): tests 111, pass 111, fail 0.
- Layer tests: none named by `build/manifest.md`.
- `checks/format.mjs`: 98 modules, 97 requirements files; 0 failures.
- `checks/architecture.mjs … queue-producers`: 17 product files, 66 relative imports; 0 failures.
- `checks/coverage.mjs … queue-producers`: 35 of 35 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs … queue-producers tranche/T32`: 0 failures (re-run after the commit).

Size (session_01Fk6NZizVdw2PkBBvxaGQW3): test runs 2, module lines 3873

## J1 · COMPLETE

N546 applied: R35's followed-case-entry and cited-docket-entry-refused age from case-import R20's seen_at (refused copies of one entry from the earliest; missing or unreadable seen_at stays undetermined, never the publisher's date or this read's clock). queue-producers 80/80; queue 111/111; format, architecture, coverage (35/35), ownership: 0 failures. Nothing deferred. For BOB (requirements wording): R35's '(not yet met: T32)' can be struck; the Uses' membership line should name memberFacts (R35's 'no longer active', membership R68). Record: build/jobs/T32/queue-producers.md on job/T32/queue-producers.
