# acquisition (T33)

**Status** · session_01REJDyRkXAWYAFW1aBrgywm · depth 2 · WORKING · handled B1

## Completion (ACQUISITION #10)

**Entries applied.** T33-21 (A TIME 3, A COURTS 3; K1449), on top of `tranche/T33` with credentials (T33-20) merged.
- **R35, a memento for a past date.** The archive arm (`body.at`) and `archiveLookup({address, at})` take an optional instant.
  - `at` is record-grammar's `ISO_TS_RE`, to the second, and must be a real moment (2023-02-30 is refused). Anything else is `MEMENTO_BAD_ASKED_DATE` (400), refused before eligibility is read or anything is fetched.
  - The TimeGate is asked with `Accept-Datetime` at `at`. TimeMap candidates are tried nearest `at` first, the earlier of two equally near first, and each is still chosen by `selectCapture` over the bytes received.
  - The filed archive hop and the lookup's answer carry `asked_at`, `memento_datetime`, `apart_seconds` and `asked_note`. The note says when the memento is before or after the instant asked, and that it is not the page at `at`. The hop's `asserts` still names the memento's own moment.
  - With no `at`, behaviour is byte-for-byte as before: the TimeGate asks for now, candidates are newest first, and the hop has no new fields. R3's eligibility rule is unchanged (K1521).
  - `archiveLookup`'s `capture_with` carries `at`, so the capture it points to asks the same instant.
- **R36, the keyed-service path.** New file `src/acquisition/keyed.mjs`, re-exported from `index.mjs`.
  - `keyedFetch(store, {service, request, purpose, viewer})` reads the key at the call from `store.credentials.keyedServiceFor({service})`. It is reached through the store handed in, as the module's other services are, so there is no import edge.
  - The service is treated as off, and `KEYED_SERVICE_OFF` answered with nothing fetched, in each of these cases:
    - it is off or holds no key;
    - no credentials were handed in;
    - the key is empty;
    - credentials throws.
  - When credentials refuses, its own refusal (with its row) is passed on whole.
  - The request must be a public https address on the service's own host (the table `KEYED_SERVICE_HOSTS`: courtlistener → `www.courtlistener.com`). It must be GET or POST, with a flat string form. Otherwise it is `BAD_KEYED_REQUEST`. `UNKNOWN_KEYED_SERVICE` and a machine `viewer` (`NOT_PERMITTED`, K1449) are also refused, and none of these refusals reads the key.
  - Each request goes through the host governor under R9's agent naming `purpose`. Redirects come back as the answer, so the key never follows one. The key is sent as `Authorization: Token <key>`, CourtListener's documented form.
  - A thrown fetch carries no message (as R23). The answer, refusals and logs never carry the key.
- **R37, `citationLookup(store, {text, viewer})`.** CourtListener v4 Citation Lookup, read from the service's own documentation (wiki.free.law, "Citation Lookup and Verification API"): a POST of `text`, at most 64,000 characters (`CITATION_TEXT_MAX`), 250 citations a request and 60 a minute, with a throttle answered 429 and `wait_until`.
  - Each citation answers `citation`, `normalized`, `start`, `end`, `lookup` (found, several_matches, not_found, unknown_reporter, not_looked_up), the service's own status and message, and `matches` (`case_name`, `court`, `date`, `address`).
  - `address` is kept only when it is on the service's own site. `court` is null when the answer names none: a v4 cluster does not reliably carry its court.
  - Every citation and match is labelled `basis: "service_answer"` and `verified: false`, and the answer carries `CITATION_LOOKUP_LABEL`.
  - With the service off it answers R36's refusal, noting that the recogniser's reading stands alone. A whole-request 429 is `SERVICE_THROTTLED` with `wait_until`.
  - Also refused: `BAD_TEXT`, `TEXT_TOO_LONG`, `NOT_PERMITTED` for no viewer or a machine viewer, and `SERVICE_ANSWER_UNREADABLE`. A service refusal carries its status, not its body.
  - It writes nothing.
- **Details decided by the job (recorded here for BOB's `rulings.md`).**
  - `at` is to the second, not a local day.
  - The nearness tie goes to the earlier memento.
  - The new refusal codes have no catalogue rows: they are plain reasons, as `BAD_LOCATOR` is. Rows, if wanted, would be promotion's to stamp in T34.
  - The governor's appetite for `www.courtlistener.com` is left at its default; the service's 429 and Retry-After hold the host.

**Deferred.** Nothing in this module.

**Found in other modules (REPORT J2).**
1. **`build/modules.json`: acquisition's `uses` lacks `credentials`, though its requirements' Uses names `credentials.keyedServiceFor`.** No code edge is needed: the key is read through `store.credentials`, which the caller hands in. BOB may add the edge to match the requirements or leave it.
2. **capture:** its instance's `credentials` field is lazy. It stays null until `#credentials()` is first called, unless it is passed in at construction. Anyone that hands capture's store to `keyedFetch` or `citationLookup` must populate it first; otherwise the service reads as off. The first such caller is expected to be `standards` (T33-31, the citation resolver), which can instead hand in its own `{credentials, governor, env}`.
3. **standards (T33-31):** call `citationLookup(store, {text, viewer})` with a member's viewer. A machine viewer is refused.
4. **Generated artifact (§14):** `bio-plane/dist/bio-plane.bundled.mjs` is stale from this module's source. I did not rebuild it.

**Final uses.** Unchanged in code: record-grammar (now also `ISO_TS_RE` and `isMachineIdentity`), subresources, format-registry, odf-reader, docprofile, jurisdictions, capture-sources, host-governor, provenance, attestation. credentials is reached through the store handed in (see J2 item 1).

**Tests and checks** (branch `job/T33/acquisition` at the commit above, on `tranche/T33` @ `206778b8b7`).
- `node --test bio-plane/test/m/acquisition/`: tests 84, pass 84, fail 0. The base was 73/73; the 11 new tests are `memento-at.test.mjs` (R35, 4 tests) and `keyed.test.mjs` (R36, R37, 7 tests, including a sentinel key checked absent from every answer, receipt, store row, governor call, stored object and log line).
- Users of acquisition (tests for each, pass/fail):

  | module | result |
  | --- | --- |
  | capture | 118/0 |
  | capture-requests | 73/0 |
  | control-plane | 159/0 |
  | monitoring | 111/0 (base 111/0) |
  | ratification | 204/0 |
  | extraction | 112/0 |
  | instance-setup | 90/4, equal to base 90/4: the accepted red K1544, `keys.test.mjs` R44 ×4 |

- `node checks/format.mjs`: 126 modules, 125 requirements files; 0 failures.
- `node checks/architecture.mjs … acquisition`: 14 product files, 55 relative imports; 0 failures.
- `node checks/coverage.mjs … acquisition`: 37 of 37 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … acquisition tranche/T33`: 5 files changed; 0 failures.

Size (session_01REJDyRkXAWYAFW1aBrgywm): test runs 9, module lines 1805

## J1 · REPORT

Four findings outside acquisition (details in my record's Completion section). (1) modules.json: acquisition's uses lacks credentials, though its requirements' Uses name credentials.keyedServiceFor. No code edge is needed, because the key is read through store.credentials handed in, so adding the edge is yours to decide. (2) capture: its instance's credentials field is lazy (null until #credentials() first runs). A caller handing capture's store to keyedFetch or citationLookup must populate it, or the service reads as off. (3) standards (T33-31): call citationLookup(store, {text, viewer}) with a member viewer; a machine viewer is refused. (4) bio-plane/dist/bio-plane.bundled.mjs is stale from this module's source; I did not rebuild it.

## J2 · COMPLETE

T33-21 applied: R35 (Memento for a past date: at to the second, TimeGate Accept-Datetime at at, TimeMap nearest-first, both instants stated, MEMENTO_BAD_ASKED_DATE), R36 (keyedFetch through store.credentials.keyedServiceFor, off by default, own host only, key in nothing), R37 (citationLookup, CourtListener v4, every result labelled the service's answer, never verified). Tests 84/84; users unchanged (instance-setup 90/4 = base, K1544). format, architecture, coverage (37/37) and ownership: 0 failures. Nothing deferred. Record pushed on job/T33/acquisition.
