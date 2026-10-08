# file-scanner (T37)

**Status** · session_01PZFJ33yTU9MSNkxXuSiLhJ · depth 2 · COMPLETE · handled B1

## Completion (T37-5)

**Reading set (B1, mechanics §17).** Measured: own requirements 23 KB; code and tests under `file-scanner/` (no `dist/`, no lock file) 273 KB; with the used modules' named services and layer 1's row, just over 300 KB. So option (3). Read whole myself: `build/requirements/file-scanner.md`; layer 1's row of `build/layers.md`; the plan's T37-5 entry, its rules at the opening, and K2099, K2155, K2161; `src/store.mjs`, `handler.mjs`, `worker.mjs`, `limits.mjs`, `clamav.mjs`, `render.mjs`; every file under `src/providers/`; `fleet-member.json`, `wrangler.jsonc`, `package.json`; `test/helpers.mjs`, `vendors.mjs`, `scan.test.mjs`, `contract.test.mjs`, `worker.test.mjs`, `adapters.test.mjs`. Used services: `sha256hex` (reputation.mjs imports it), and bundler's `writeMember` and `discoverMembers` through `scripts/build.mjs` and the R10 tests. My worker read the rest whole: `container/*.mjs`, both Dockerfiles, `.dockerignore`, `.gitignore`, `packages-*.json`, `scripts/build.mjs`, `test/mirror.test.mjs`, `test/render.test.mjs`, `test/stubs/runtime.mjs`. Its summary is about 6 KB, each statement citing file and line. It found nothing this entry changes in those files: no `ghcr.io`, no R2 key, no `config`. One thing it found mattered and is fixed below (renderer's hard-coded fallbacks). I then read the parts of `render.test.mjs` I extended (its head and the R7 refusals).

**Entries applied.**
- **R2 (N753).** A target may carry `area: "derived"`. It is then read from `${store}/derived/<sha>` (each part too, from the same area). It is sized and digest-checked exactly as a capture is, then answered by `/scan`, `/render` and the outside tools' routes, which share `normaliseTarget`. Any other `area` is `BAD_TARGET`. Code: `src/store.mjs` (`AREAS`, `objectKey`).
- **R5 (N764).** The guarded network's refusal of an address with a user name or password is now `TOOL_ADDRESS_HAS_CREDENTIAL` (`src/providers/net.mjs`:67).
- **R10 (N773).** Both images are now `docker.io/civicos/file-scanner-scanner` and `docker.io/civicos/file-scanner-renderer`, in `fleet-member.json` and `wrangler.jsonc` alike. Digests stay `null` / `UNPUBLISHED` for the release cut. No image was built.
- **R19, R21, R29 (N777).**
  - Every descriptor states `config: [{name, label, required}]`, frozen. `validateDescriptor` refuses a malformed list as `DESCRIPTOR_MALFORMED` `config`.
  - The lists name exactly what each adapter reads:
    - icap: `engine_family`\*, `handling`\*, `source_urls`, `service`, `tls`
    - defender-storage: `tenant_id`\*, `storage_account`\*, `container`\*
    - falcon-sandbox: `environment_id`
    - cloudflare-intel: `account_id`\*
    - sentinel: `tenant_id`\*, `endpoint`\*, `dcr_id`\*, `stream`\*
    - google-secops: `project`\*, `location`\*, `instance`\*, `log_type`\*
    - elastic: `index`
    - syslog-tls: `engine_family`, `handling`\*, `source_urls`
    - https-webhook: the same three, and `path`
    - every other tool: `[]`

    \* required. Each template's `handling` is required, per R20: "the administrator supplies".
  - `checkSpec` checks the spec's `config` before the template is resolved and before anything is read or sent. A required field that is absent, `null` or `''` answers `CONFIG_MISSING` naming the field.
  - A field the list does not name is dropped, so it is never read or sent. My reading: R21's "never sent" is met by dropping such a field, and the refusal by name (`CONFIG_UNKNOWN`) is file-safety R28's, on the plane's side. If BOB wants the member to refuse an unnamed field too, it is a one-line change.
  - `/providers` answers each descriptor's and template's list (R29).

**Fixed in my own module, beyond the entry.**
- `resolveDescriptor` threw a TypeError (a 500) when a template's `engine_family` was not a list. It now passes the value on, and R19 refuses it as `DESCRIPTOR_MALFORMED` `engine_family`.
- The renderer image fell back to hard-coded `150`/`500` and passed on a NaN or 0. It now falls back to `SAFE_VIEW_DPI`/`SAFE_VIEW_PAGES_MAX` and takes only positive whole numbers.
- The committed bundle was regenerated with `npm run build`. It is my own artifact, and `fleetbundles` shows it byte-identical to a fresh build.

**Deferred (minor, my worker's reading, not an entry):** each item stays within R7 today.
- The office route sends any ZIP as `.docx` and any OLE2 as `.doc`. A spreadsheet fails at the converter (`RENDER_FAILED`) rather than up front (`NOT_RENDERABLE`).
- `renderer.mjs` reads the whole source into memory, up to 256 MiB, for the encryption sniff.

**Found in another module.**
- **bundler (its test):** `bio-plane/test/system/fleetbundles.test.mjs`:124 pins file-scanner's images as `ghcr.io/believeinoakland/file-scanner-{scanner,renderer}`. With R10 met it fails (0 pass, 1 fail, all on that line). Every file-scanner arm (fresh, byte-identical, manifest hash) passes. The fix is bundler's: the expectation becomes `docker.io/civicos/file-scanner-scanner` and `docker.io/civicos/file-scanner-renderer`.
- **installer:** `newgroup/test/requirements.test.mjs`:1063's `ghcr` case is intentional (it checks that a ghcr.io image is refused) and stays right.
- **promotion (T37-7):** no promotion row carries `CREDENTIAL_IN_ADDRESS` from this module. That code is only admission's (C-38.10). `TOOL_ADDRESS_HAS_CREDENTIAL` and `CONFIG_MISSING` are answers of the member's own surface; I found no row naming them. So I name nothing for T37-7 to stamp from this job, unless the row census lists the member's codes, which BOB knows.

**Tests and checks.**
- `node --test file-scanner/test/`: tests 60, pass 60, fail 0, skipped 0. That is up from 52 with ClamAV, LibreOffice and Poppler installed locally; without ClamAV, 9 skip. New tests:
  - R2 for `/scan`, `/provider/scan` and `/render`
  - R5 `TOOL_ADDRESS_HAS_CREDENTIAL`
  - R10 Docker Hub
  - R19 `config`
  - R21 `CONFIG_MISSING` and unnamed fields never sent
  - R29 `config` in `/providers`

  One R20 assertion now expects `CONFIG_MISSING` where `DESCRIPTOR_MALFORMED` answered before, and adds three malformed-family cases.
- Layer tests: none named in `build/manifest.md`.
- `node --test bio-plane/test/system/fleetbundles.test.mjs`: 0 pass, 1 fail, bundler's line above, reported.
- `checks/format.mjs`: 136 modules, 135 requirements files; 0 failures.
- `checks/architecture.mjs file-scanner`: 45 product files, 86 relative imports; 0 failures.
- `checks/coverage.mjs file-scanner`: 31 of 31 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs file-scanner tranche/T37`: 17 files changed; 0 failures.

**P6.**
- Source (`src/`, `container/`, `scripts/`): 2,475 lines, from 2,413 by the same count at the opening (BOB's figure 2,433).
- Tests: 1,777 lines, from 1,595.

Size (session_01PZFJ33yTU9MSNkxXuSiLhJ): test runs 14, module lines 2475

## J1 · REPORT

bundler (its test): bio-plane/test/system/fleetbundles.test.mjs:124 still expects file-scanner's images as ghcr.io/believeinoakland/file-scanner-{scanner,renderer}. With R10 met (N773) the suite answers 0 pass, 1 fail, on that line alone; every file-scanner arm (no staleness, byte-identical fresh build, manifest hash) passes. Fix, bundler's: expect docker.io/civicos/file-scanner-scanner and docker.io/civicos/file-scanner-renderer. newgroup/test/requirements.test.mjs:1063's ghcr case is installer's deliberate refusal test and stays right.

## J2 · COMPLETE

T37-5 applied: R2 (area "derived" read from ${store}/derived/<sha>, checked and answered as a capture; any other area BAD_TARGET; /scan, /render and the outside tools' routes), R5 (TOOL_ADDRESS_HAS_CREDENTIAL), R10 (docker.io/civicos/file-scanner-{scanner,renderer}, marker and wrangler.jsonc, digests unpublished), R19/R21/R29 (config [{name,label,required}] on every descriptor and template, CONFIG_MISSING naming the field, unnamed fields dropped and never sent, /providers answers the lists). Also fixed: a template's non-list engine_family threw (now DESCRIPTOR_MALFORMED), and the renderer's fallback bounds now come from limits.mjs. Tests 60/0/0 skip (ClamAV, LibreOffice, Poppler installed locally). Checks: format, architecture, coverage (31/31), ownership (17 files): 0 failures each. One red outside my module: bundler's fleetbundles.test.mjs:124 (my REPORT J1). Promotion (T37-7): no row I found carries a code this job renamed; CREDENTIAL_IN_ADDRESS stays admission's C-38.10. One reading to confirm: R21's 'a field the list does not name is never sent' is met by dropping it; refusing it by name (CONFIG_UNKNOWN) is file-safety R28's. P6: 2,475 source lines (2,413 by the same count at the opening), tests 1,777. Record: build/jobs/T37/file-scanner.md, Completion (T37-5).
