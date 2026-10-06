# capture-requests (T34)

**Status** · session_01NQivx3o1He46wHNbuAEsHJ · depth 2 · COMPLETE · handled B1

## Completion (CAPTURE-REQUESTS #12)

**Entries applied.**
- **T34-34, N587 (R48).** `capturedFor({document, captures, viewer})`, registered once at creation as `capture.registerReader("captured-for", "capture-requests", fn)` (capture R83). From the `captured` requests whose `capture_sha` is one of `captures` (so R39's re-requests of a held capture count), one entry per (`target`, `principal_plane`): `question` the target, `asker` the plane principal (never `principal_claude`), `visible` by R23's sight (membership's predicate), `title` the target's title when visible, `title` and `asker` null when not, `waiting` true when the target is in `open` or its alias `surfaced` (inquiry R1), seen or not. No matching request gives `questions: []`; `lead_inquiry` is never a question; it writes nothing; any failure answers null (capture then says undetermined). Synchronous. Digests are bound 100 per read. A new index `capture_requests_sha (capture_sha, state)` keeps it one lookup per digest. Openness and title are read from record-core's `bundles` read contract, as R3's sight already is. inquiry provides no synchronous read of either (its Provides), so Uses' "inquiry: whether an inquiry is open, and its title" is met through the bundle row inquiry projects. Recorded here as this job's reading.
- **T34-34, N585.** The four `plane.test.mjs` tests that open a run now bind `ACCOUNT_SEAL_SECRET` and connect the opener's (ruth's) account through `op=accountreferenceset` before `op=airunopen` (ai-runs R52). This clears K1708's "capture-requests ×4".
- **T34-86 (DEC-149).** The strings BOB's grep named: `checks.mjs` C-28.8, C-28.16 and C-28.21, and `index.mjs`'s unconfigured drain detail. The job also found more member-facing ones, case-insensitive and across line wraps, and changed them: C-28.1, C-28.4, C-28.6, C-28.17 and C-28.20 translations, `MEMBER_ROUTE` ("your group's Civicsmith uses no login for it"), and the platform mark's two failure details ("the reason was not recorded"). Left as they are, because they are model- or operator-facing: the door's answers to the run (`captureRequest`'s details), the drain's conduct details, and comments. `t34.test.mjs` names each changed string. It also asserts that no C-28 translation says "this instance", "this copy" or "this plane".

**Rows awaiting stamp** (plan Rules (5) 4; T35's promotion job stamps them). C-28.1, C-28.4, C-28.6, C-28.8, C-28.16, C-28.17, C-28.20 and C-28.21: translations changed (DEC-149), `awaiting stamp`.

**Deferred.** Nothing.

**Other modules.**
- Generated artifacts made stale (mechanics §14; BOB regenerates at layer close). These carry the old C-28 translations and drain detail: `bio-plane/dist/bio-plane.bundled.mjs`, `release/bio-plane.bundled.mjs`, `newgroup/src/release.mjs` and `newgroup/dist/newgroup.bundled.mjs`.
- `acquisition/checks.mjs` and `extraction/checks.mjs` still have a member-facing "in a form this instance does not …" (DEC-149). These are L3/L4 modules, already closed for T34; this is a candidate for N664's T35 share.

**Tests and checks.**
- capture-requests (`bio-plane/test/m/capture-requests/`): 86 pass, 0 fail. New tests: `t34.test.mjs` (4 R48 tests through the registered reader, and 1 DEC-149 test), plus 1 R48 test in `plane.test.mjs` (`op=heldcaptures` in Miniflare shows the question and asker through real `capture`). Before this job the module had 4 failing tests (N585); they now pass.
- capture (the reader's consumer, `bio-plane/test/m/capture/`): 127 pass, 0 fail.
- `test/system/row-census.test.mjs`: red, as accepted. Its C-28 movements are the eight rows above. The others (C-126.2, C-133.*, C-91.*) are not this module's.
- `format`: 0 failures. `architecture capture-requests`: 0 failures. `coverage capture-requests`: 48 of 48 live ids named, 0 failures. `ownership capture-requests tranche/T34`: 7 files, 0 failures.

Size (session_01NQivx3o1He46wHNbuAEsHJ): test runs 9, module lines 2010

## J1 · COMPLETE

T34-34 (R48 captured-for reader registered into capture R83; N585: the four plane tests connect the opener's account, clearing K1708's capture-requests x4) and T34-86 (DEC-149: BOB's four lines plus C-28.1, .4, .6, .17, .20, MEMBER_ROUTE and the platform mark's details) applied. capture-requests 86/86 pass, capture 127/127. format, architecture, coverage (48/48), ownership: 0 failures. Row census: C-28.1/.4/.6/.8/.16/.17/.20/.21 awaiting stamp. Stale generated bundles and an L3/L4 DEC-149 leftover reported in the record. Record: build/jobs/T34/capture-requests.md, Completion.
