# capture-requests (T35)

**Status** · session_01PzYjuzUZfjcPzgKVMKJo96 · depth 2 · COMPLETE · handled B2

## Completion (T35-45)

**Entries applied.**
- (F2, K1880; BOB's review (2); K1881) **R49**: an address must be one the record already holds, query and fragment included, and at most 2,048 characters. It is judged at the door (R2), after the host check and before anything is written, and again at the drain (R14), directly after attribution, where a failure is terminal. "Held" means equal, character for character once scheme and host are lower-cased, to a receipt's address or retrieval locator (provenance R48's `captured_locators`) or to a held capture's outbound link with its fragment (capture R27/R57's `links`), of a capture the viewer may see (through `register`; unfiled is visible). At the drain, sight is that of the row's plane principal (`runPrincipalOf`). Candidates are found on the indexed `address_norm` through `normalizeAddress` (K1982). There is no sweep exception: a sweep row is judged before its scope check is asked. Rows C-28.23 and C-28.24.
- (K1888) **R50**: `co_archive` (true, false, or null/absent) is a member's choice only (`runPrincipalOf(caller)` is `member:`). It is refused `…_NOT_A_MEMBERS` or `…_MALFORMED` (C-28.25, C-28.26) before anything is written. It is stored (additive column), answered by R6, R24 and R43, and passed to the fetch as `captureRequest.coArchive` (acquisition R43); none is passed for null.
- (N646; K1724, K1740) **R51–R53**: the `records_requests` table, declared with keys `standard`, purge `clear`, export `yes` and sight `bundle`. `recordsRequestOpen`, `recordsRequestAnswer`, `recordsRequests` (paged by id, with `truncated` and `next`; unseen rows skipped and never counted) and `recordsRequestById`. Ops `recordsrequestopen`, `recordsrequestanswer`, `recordsrequests`, with `by` from the principal stamp. Standards is reached as `standardsOf(host)` (K1982), and an absent or unseen standard answers standards' own `NO_SUCH_STANDARD`, relayed. Rows C-28.27 to C-28.33.
- (N692, DEC-149) **R54**: the eight rows (:255, :390, :712, :757, :779, :864, :933, :1316) now say "your group's Civicsmith". Each is driven and named by a test (`t35.test.mjs`). "a stranger's server" keeps its word.
- **R34**: C-28.23 to C-28.33 added, each awaiting stamp (accepted red 2).
- Existing tests were brought under R49: the fixture gained `hold()`, writing the read-contract tables. The plane tests now make their addresses held the product's way: a member captures an index page whose links are the asked addresses.

**Deferred.** None in this module.

**Found in other modules (REPORT J2).**
- Three tests outside this module turn red under R49, because each files a request for an address its scene never captured (BOB decides: named red, or a CHANGE to each owner):
  - `scheduler`: `bio-plane/test/m/scheduler/plane.test.mjs`:151 (R12) files `https://www.held.example.org/doc.pdf`.
  - `plane`: `bio-plane/test/m/plane/sweep.test.mjs`:29 and :41 (R2 and its negative control), through `drainedSweepRefusal`: the request is now refused `CAPTURE_REQUEST_ADDRESS_NOT_HELD` before the sweep check is asked.
  - The fix in each case is to make the address held first: a member's `op=acquire` of a page linking to it with `subresources: true` (as this module's `plane.test.mjs` now does), or a receipt.
- `agent-worker`: `test/plane-capturerequest.mjs`, the plane mock, does not hold R49. It accepts an address the plane now refuses `C-28.24`, so the mock no longer states the plane's order. That conflicts with its own header ("a mock that accepts anything is the liar").
- `skills` (R36, R38): the run's doctrine should say a capture is requested only for an address the record holds. Discovery reads anywhere (K1880).
- `provenance`: `captured_locators.retrieval_locator` has no index. R49's third read, the retrieval-locator arm (asked only when the indexed reads find nothing), scans it. An index there is provenance's to add.
- Generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` (not_product) is stale with this module's source, and is regenerated at L6's close (§14).
- Already red on `tranche/T35` before this change, not this module's: `following` C-137 R1; op-declarations R19/R6, R21/R27, R21/R5 (reds 9, 23, 29); agent-worker `requirements.test.mjs` R45 ×2 (its committed bundle; no input of this module).

**Tests and checks.**
- Module: `node --test bio-plane/test/m/capture-requests/`: 103 pass, 0 fail (86 at the start).
- Users: intent, link-sweep, scheduler, machinery-producers, queue-producers, monitoring, following, plane/sweep, op-declarations, skills, answers, admission, acquisition: 835 tests, 828 pass, 7 fail. Of the 7, the same suites on `tranche/T35` @ 08843d299f fail 4; the 3 new reds are listed above.
- agent-worker `fanout`, `harness`: pass. `requirements` 291 pass, 2 fail (R45, as before).
- `checks/format.mjs`: 0 failures. `architecture.mjs capture-requests`: 13 files, 47 imports, 0 failures. `coverage.mjs capture-requests`: 54 of 54, 0 failures. `ownership.mjs capture-requests tranche/T35`: 14 files, 0 failures.

Size (session_01PzYjuzUZfjcPzgKVMKJo96): test runs 16, module lines 2449

## J1 · QUESTION

Two `modules.json` edges for capture-requests (requirements Uses mark them "a new edge; BOB's"):

1. `standards` (layer 5): R51–R53 read `standardRead` (sight, issuer, `held`, the citation). My best reading: the instance is reached as `standardsOf(host)` by default (K61), and `noSuchStandard`'s answer is relayed from `standardRead`'s own refusal, so no code is minted here.
2. `subresources` (layer 1): R49 compares an address to `captured_locators.address`/`retrieval_locator` and to `links.address` with its fragment, after lower-casing scheme and host. To find the candidates on the indexed `address_norm` columns, and not by scanning both tables on every request, I import `normalizeAddress`, then compare exactly in code.

`provenance` is not needed as an import: R49 reads `captured_locators` and `register` through provenance R48's stated read contract, in SQL. `capture`'s `links` is read the same way (capture R57; already a use).

Best reading: BOB adds `standards` and `subresources` to capture-requests' `uses`. I am writing the code on that reading. Until the edges are on `tranche/T35`, the architecture check will report the two imports.

## J2 · REPORT

Found in other modules (details in my record's Completion section):

1. **Three new reds from R49, outside this module.** Each test files a capture request for an address its scene never captured, so the door (or, for the sweep tests, the drain) now refuses it `CAPTURE_REQUEST_ADDRESS_NOT_HELD`:
   - `scheduler`: `bio-plane/test/m/scheduler/plane.test.mjs`:151 (R12).
   - `plane`: `bio-plane/test/m/plane/sweep.test.mjs`:29 and :41 (R2 and its negative control, via `drainedSweepRefusal`).
   The fix in each is to make the address held first: a member's `op=acquire` of a page linking to it with `subresources: true` (as capture-requests' own `plane.test.mjs` now does), or a receipt. Yours to name as a red or send as a CHANGE.
2. **agent-worker** `test/plane-capturerequest.mjs`: the plane mock lacks R49. It accepts addresses the plane refuses (C-28.24).
3. **skills** R36/R38: the doctrine should say a capture is requested only for an address the record holds.
4. **provenance**: `captured_locators.retrieval_locator` has no index. R49's retrieval-locator read (asked only after the indexed reads miss) scans it.
5. **Generated artifact**: the plane bundle is stale with this module's source (L6 close).
