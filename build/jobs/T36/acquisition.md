# acquisition (T36)

**Status** · session_01UBPYqfwtexSRDSTDJARv1u · depth 2 · WORKING · handled B0

## Reading set (mechanics §17, N739)

Measured at the start: own requirements 49 KB; code 191 KB; tests 330 KB (`reading-sets.py` counts code only). The set is over 300 KB, so I used §17's order: (1) trim: nothing; (2) split: none in T36; (3) a summary for this task only.
- **Read whole myself:**
  - my requirements;
  - layer 3's row of `build/layers.md`;
  - the code this entry changes: `index.mjs`, `unpack.mjs`, `checks.mjs`;
  - the tests it changes or relies on: `fixture.mjs`, `checks.test.mjs`, `archivelist.test.mjs`, `own-host.test.mjs`;
  - the services my Uses names for the entry: `file-scanner` R21 and R25 (with its `handler.mjs` routing and `providerReputation`), `provenance` R13 and R61, `format-registry` R28;
  - plan T36's opening rules and my entry.
- **The summary:** a worker read whole `keyed.mjs` and the other 14 test files and wrote a task summary (about 14 KB) for T36-10, citing file:line throughout. It covered: every catalogue-id reference; how the tests drive `acquire` and observe receipts; every fetch-count, fetch-order and governor-count assertion; every whole-object assertion; R41's fixtures.
- **What it changed:** it confirmed that no test pins a C-137 literal outside `checks.test.mjs`, and that a reputation call through `globalThis.fetch` or the host governor would break about 60 assertions. So the scanner is reached through its binding's own `fetch` (the RENDERER pattern), and `reputation` sits in the answer's body, not in `document`. Nothing it left out mattered.

## Entries applied (T36-10)

- **N720, R41.** `archiveList` refuses `NOT_AN_ARCHIVE` (C-139.20, with its row) for a capture held and visible that R17's rule does not profile as `zip`; an office or OpenDocument file is included.
  - **An archive never opened** is profiled by R17's own function, `profileOf`, over its held parts. That covers both arms: the read within the bound, and the past-bound listing over the stored parts.
  - **An opened one** is judged from its recorded listing: a directory naming `[Content_Types].xml` or `mimetype` is an office or OpenDocument file (format-registry R28). This catches one a member opened by hand with `op=unpack`.
  - **Sight comes first:** a hidden capture answers `ARCHIVE_NOT_HELD`, so the refusal says nothing about what a hidden capture is.
  - The new DEC-49 region is `is-not-an-archive` in `unpack.mjs archiveList`.
- **N738, R29.** The archive family is renumbered C-137.1–C-137.19 → C-139.1–C-139.19, in the same order, each code, translation and `where` unchanged. No row of this module carries a C-137 id, and the test asserts it. Red 8 is cleared: `following`'s tests are 49 of 49 green with this change, against 48 of 49 on the tranche tip.
- **N714, N710, R44.** `acquire` takes `reputation` (the spec or null) and `fileScanner` (the binding) from its caller's opts. It falls back to the store handed in (`cap.reputation`, `cap.fileScanner`, then `cap.env.FILE_SCANNER`), as R42's `ownHosts` does; a body never supplies either.
  - **When it asks:** once, before the first fetch of the document, on the direct, Drive, archive, render and capture-request arms. It asks after every pre-fetch refusal, so an act refused before any fetch asks nothing. A continuation asks nothing.
  - **What it sends:** `{address, tool}` only, to `POST /provider/reputation`. The address is the locator, the Drive link as given, or the archive arm's `address`.
  - **What it records:** `reputation: {tool, listed, categories, checked_at}` on the receipt, and the same object in the answer's body.
  - **No answer:** recorded as `{tool, listed: null, categories: [], checked_at, unanswered}`, never as `listed: false`. `unanswered` is `NO_TOOL`, the scanner's refusal code, or `SCANNER_UNREACHABLE` (no binding, a thrown call, an answer that is not R25's, or no answer within the bound).
  - **What it never does:** refuse, change or grade the capture. It never records the spec's credentials or config; only `tool_id` travels.

## Detail decisions (BOB's to record in `rulings.md`, P17)

1. `REPUTATION_TIMEOUT_MS = 5000`: the lookup's bound (chosen, not measured). It is exported, and a scanner silent past it answers `SCANNER_UNREACHABLE`.
2. The reputation is carried only on a filed capture's answer and receipt. Not on refusals; not on R22's 304 "unchanged" answer, which files nothing and writes no receipt; not on files cut out of an archive, which are not fetched.
3. `categories` keeps only strings from the scanner's answer, and `listed` is `true` only when the answer says `true`.
4. The scanner is reached by `binding.fetch("https://file-scanner/provider/reputation", POST JSON)`. The member routes on the path only.

## Found in other modules and in my own (REPORT J2)

1. **acquisition R38 (my own, needs a requirement change).** `unpack` does not check R17's profile, so a member's `op=unpack` opens an office or OpenDocument file as an archive and files its parts. R41 now answers such a file `NOT_AN_ARCHIVE`, so the two disagree. I recommend that R38 also refuse `NOT_AN_ARCHIVE`. I did not change it: that would amend R38's contract, and `unpack.test.mjs`:242 pins R38's answer for a plain file (`ARCHIVE_UNREADABLE`). Deferred to BOB.
2. **promotion (`gate.mjs`:757–758).** Its stamp names acquisition's C-137.1–.19. In T37 the renumbered rows are C-139.1–.19, and C-139.20 is new (as START says).
3. **Generated artifact.** `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) is stale from this change; it is regenerated at the layer close.
4. **Stale line citations.** The DEC-149 line citations in `dec149.test.mjs`'s titles and in my requirements' Suggestions were already stale at the tranche tip; for example, `index.mjs`:826 named the sweep-redirect region at HEAD. They are T35's historical citations and the lookups are by code, so nothing fails. I kept `checks.mjs`'s lines up to :242 unshifted.

## Tests and checks

- `node --test bio-plane/test/m/acquisition/*.test.mjs`: tests 151, pass 151, fail 0. The new files and tests are `reputation.test.mjs` (R44) and two R41 tests in `archivelist.test.mjs`.
- **Users of acquisition**, each module's tests run:
  - all green: capture 149 pass; capture-requests 103; following 49; monitoring 121; ratification 213; standards 66; docket 59; instance-setup 108; control-plane 167; plane 130; reading-pipeline 88.
  - answer-envelope: 25 pass, 1 fail (R7 `NO_REASON`); the same on the tranche tip (inherited red 11).
  - op-declarations: 90 pass, 3 fail; the same three on the tranche tip (inherited reds 13 and 17).
- `node checks/format.mjs`: 0 failures.
- `node checks/architecture.mjs … acquisition`: 0 failures.
- `node checks/coverage.mjs … acquisition`: 44 of 44 live ids; 0 failures.
- `node checks/ownership.mjs … acquisition tranche/T36`: 7 files; 0 failures.
- **P6:** the module is 2,927 lines of source (tests 4,400), under the mark.

Size (session_01UBPYqfwtexSRDSTDJARv1u): test runs 9, module lines 2927
