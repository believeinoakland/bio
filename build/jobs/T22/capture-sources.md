# capture-sources (T22)

**Status** · session_01JxNV4GvVR6ZVqJhsquLGcC · depth 2 · COMPLETE · handled B2

## Completion

**Entries applied** (B1, `build/plan/current.md` T22 layer 3; B2, K1032).
- **(1) A10, R37** (Memento, RFC 7089), built to R37's nine services as B2 worded them: new `bio-plane/src/capture-sources/memento.mjs` (263 lines, pure: no fetch, no hash, no clock), `WAYBACK_MEMENTO`, `mementoEndpoints`, `acceptDatetime`, `parseLinkFormat`, `parseTimeMap`, `timeMapCandidates`, `readMementoAnswer`, `mementoRow`, `mementoHop`, plus `readHttpDate` (the RFC 1123 reader (3), (5) and (7) share; exported for its own test). A memento feeds `selectCapture` unchanged (R29–R31), so the 200 rule, the bound and the empty-body exclusion are the CDX path's own; the hop is R34's shape for any archive, its `document_address` the archive's `rel="original"`, never the address asked (R35). `cdx.mjs` is unchanged: its exports and answers are as R29–R36 state them, and its R29–R36 tests are unchanged and green.
- **Tests:** the todo at `test/m/capture-sources/cdx.test.mjs`:162 replaced by a pointer; `test/m/capture-sources/memento.test.mjs`, eight tests each naming R37, over fixtures under `test/m/capture-sources/fixtures/memento/` (no network), with B1's three negative controls (a malformed link-format entry, `timemap-malformed.txt`; a memento outside the window, `timeMapCandidates` and `selectCapture` with `notAfter`; a TimeGate answer with no `Memento-Datetime`, `memento-no-datetime.json`) and others (no `rel=original`, an undated TimeMap entry, an empty memento, a 301 memento, a bad datetime, the asked address differing from the archive's original). **The fixtures were written by hand** in RFC 7089's answer shapes (one follows its §5.1.1 example) and the Wayback Machine's Memento endpoints' forms, not captured: this session's egress refused `web.archive.org` (connection reset, 2026-10-02); their README says so.
- **Re-scan of my paths** (N469, N471, N480): no note names a T20-deleted file, `tools/` or the deleted plane `index.mjs` as live. `browserrender.mjs`:29 names `src/index.mjs` as the plane's entry then and `src/plane/index.mjs` today, and :21 the old `test/rendered-capture.test.mjs` as a measurement's provenance: both stay.

**`not yet met` marks:** R37's mark (`build/requirements/capture-sources.md`, "*(not yet met: T22)*") is met by this job; BOB strikes it at the merge. The Status line's "R37 (Memento; stays here, unscheduled, K48)" is also stale now (BOB's text).

**Catalogue rows:** none added or changed (R37's refusals are answer codes with no row, K1032); `row-census.test.mjs` green.

**What acquisition would call** (N492, T23): `mementoEndpoints(archive, address)` → GET the TimeGate with `Accept-Datetime: acceptDatetime(notAfter)` (or GET the TimeMap → `parseTimeMap` → `timeMapCandidates`, newest first) → `readMementoAnswer` (following a `redirect`'s `location`) → GET `archive.raw ? archive.raw(memento_uri) : memento_uri` → `readMementoAnswer` with its own SHA-256 and byte count → `mementoRow` → `selectCapture` → `mementoHop(chosen, fetchedUri, {archive, answer})`.

**Deferred:** none.

**Other modules:** none. The plane bundle is not staled: `cdx.mjs` is unchanged and nothing imports `memento.mjs` yet; `fleetbundles.test.mjs` green on this branch. When acquisition imports it (N492), the bundle stales then.

**Tests and checks** (on `job/T22/capture-sources` with `tranche/T22` merged at f3564d3fbc):
- `node --test test/m/capture-sources/` (in `bio-plane/`): tests 82, pass 82, fail 0, todo 0
- `node --test test/m/acquisition/`: tests 59, pass 59, fail 0
- `node --test test/m/`: tests 4822, pass 4803, fail 0, cancelled 0, skipped 0, todo 19. No red (the opening's membership reds are cleared, K1026); test-support R2 passed here.
- `node --test test/system/fleetbundles.test.mjs test/system/row-census.test.mjs`: pass 2, fail 0, skipped 0
- `node checks/format.mjs`: 85 modules, 84 requirements files; 0 failures
- `node checks/architecture.mjs … capture-sources`: 20 product files, 22 relative imports; 0 failures
- `node checks/coverage.mjs … capture-sources`: 63 of 63 live requirement ids named by a test; 0 failures
- `node checks/ownership.mjs … capture-sources tranche/T22`: 12 files changed; 0 failures

Size (session_01JxNV4GvVR6ZVqJhsquLGcC): test runs 6, module lines 2518

## J1 · QUESTION

R37's interface, proposed (B1 asks before I write one). New file `bio-plane/src/capture-sources/memento.mjs`, pure like `cdx.mjs` (no fetch, no hash, no clock); `cdx.mjs` untouched, so its exports and answers stay as R29–R36 state them and the plane bundle is not staled by it. Refusal reasons are answer codes like `CDX_UNPARSEABLE`, with no catalogue row (none of cdx.mjs' reasons has one), so no row is added and `row-census` stays green. My best reading, which I build on meanwhile:

1. **`WAYBACK_MEMENTO`**, frozen: an archive descriptor `{name: "Internet Archive Wayback Machine", via: "archive.org", timegate: "https://web.archive.org/web/", timemap: "https://web.archive.org/web/timemap/link/", raw}` where `raw(mementoUri)` answers the raw-bytes form (`/web/<14 digits>/` → `/web/<14 digits>id_/`, as R32). Any compliant archive is another descriptor `{name, via, timegate, timemap, raw?}` (no `raw`: the memento URI as given). The Wayback CDX stays one source; Memento is the interface.
2. **`mementoEndpoints(archive, address) → {timegate, timemap} | null`**: the archive's TimeGate and TimeMap URIs for `address` (prefix + address); `null` for a descriptor without both prefixes as `https:` URLs or an address that is not an `http(s):` URL.
3. **`acceptDatetime(at) → string | null`**: RFC 7089 §2.1.1's `Accept-Datetime` value (RFC 1123, GMT) for an instant (ISO string, 14-digit timestamp, or ms); `null` when unreadable.
4. **`parseLinkFormat(text) → {ok: true, links: [{uri, rel: [..], datetime?, type?, from?, until?}]}` | `{ok: false, reason: "MEMENTO_LINK_MALFORMED", entry, detail}`** (RFC 6690 as RFC 7089 §5 uses it, and the `Link` header's syntax): one malformed entry refuses the whole text, naming its index, since a mis-split entry would shift every later one.
5. **`parseTimeMap(text) → {ok: true, original, timegate, timemap, mementos: [{uri, datetime, timestamp, archived_at}], refused: [{uri, refused}]}` | refusal** (§5): `MEMENTO_LINK_MALFORMED` (4), `MEMENTO_NO_ORIGINAL` (no `rel=original`). A memento entry whose `datetime` is absent or not RFC 1123 is listed in `refused`, never placed in time. `mementos` newest first.
6. **`timeMapCandidates(timemap, {notAfter}) → {ok: true, candidates, considered} | {ok: false, reason: "NO_USABLE_CAPTURE", detail, considered}`**: the mementos at or before `notAfter` (14 digits, as `selectCapture`), newest first; each later one listed in `considered` as `{timestamp, refused: "later than the requested bound …"}` (R30's words), with (5)'s `refused` carried in.
7. **`readMementoAnswer({url, status, headers}) → answer | refusal`** (§4, §2.1): for a TimeGate's 302 without `Memento-Datetime`, `{ok: true, kind: "redirect", location, vary_accept_datetime}` (`MEMENTO_NOT_NEGOTIATED` when it has no `Location`); for a memento, `{ok: true, kind: "memento", memento_uri: url, memento_datetime (verbatim), timestamp, archived_at, status, mimetype, original, timegate, timemap}`, `original` from the answer's `Link rel=original` only. Refusals: `MEMENTO_NO_DATETIME` (no `Memento-Datetime`: not a memento), `MEMENTO_BAD_DATETIME`, `MEMENTO_NO_ORIGINAL`.
8. **`mementoRow(answer, {sha256, bytes}) → row | null`**: the memento as a row `selectCapture` reads unchanged (R29–R31: the same 200 rule, the same window, the same empty-body exclusion): `{urlkey: null, timestamp, original, mimetype, statuscode, digest, length: undefined}`, `digest` the plane's SHA-256 over the bytes it received, or `EMPTY_BODY_DIGEST` when `bytes` is 0 (it is base32 SHA-1 of the empty body whoever computes it), so an empty memento is refused by R29's own reason; `null` for a non-memento answer or a `sha256` that is not 64 hex.
9. **`mementoHop(chosen, mementoUri, {archive, answer}) → hop`**: R34's shape for any archive: `who` = `archive.name`, `via` = `archive.via`, the same `asserts` sentence, `evidence` naming the Memento-Datetime as the archive answered it, the memento URI fetched, the `original`, `timegate` and `timemap` links the answer gave, the MIME type, and the digest stated as the plane's SHA-256 over the bytes received (never as the archive's), `bound: false`, `unsigned_reason` naming the archive, `document_address` = `chosen.original` (from the answer's `rel=original`, R35, never the request).

What acquisition would call (not mine to wire): `mementoEndpoints` → GET the TimeGate with `Accept-Datetime: acceptDatetime(notAfter)` (or the TimeMap → `parseTimeMap` → `timeMapCandidates`) → `readMementoAnswer` (following `location`) → GET `archive.raw(memento_uri)` → `readMementoAnswer` + its own SHA-256 → `mementoRow` → `selectCapture` → `mementoHop`.

Question: may BOB word (1)–(9) into my Provides as R37's services (or tell me what to change)? Tests name R37 for each, over recorded TimeMap and TimeGate fixtures under `test/m/capture-sources/fixtures/memento/`, with the three negative controls B1 names.

## J2 · COMPLETE

R37 met as B2 words it (K1032): `bio-plane/src/capture-sources/memento.mjs` (new, pure, 263 lines), tests `test/m/capture-sources/memento.test.mjs` (8, each naming R37, B1's three negative controls and more) over hand-written fixtures in RFC 7089's shapes (egress refused web.archive.org; their README says so). Strike R37's mark at the merge (and the Status line's 'R37 ... unscheduled'). `cdx.mjs` unchanged; R29–R36 tests unchanged and green. No catalogue row added; row-census green. Plane bundle not staled (nothing imports memento.mjs yet; fleetbundles green). What acquisition would call (N492) is in my record's Completion. test/m: 4822 tests, 0 fail, 19 todo. Checks: format, architecture, coverage (63/63), ownership: 0 failures. Pushed at b52f3438cc.
