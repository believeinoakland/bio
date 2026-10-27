# Why files on biosmoke8 are not scanned (diagnosis, 2026-10-20 ~03:50 UTC)

Read-only. biosmoke8 release 0.86.0; file-scanner 0.86.0 (version 907671cc).

## Cause

The scanner has no virus signatures, and cannot get any. Its daily mirror run asks `database.clamav.net` for `main.cvd` with the
User-Agent `file-scanner/<version> (signature mirror; as cvdupdate)`. ClamAV's Cloudflare front door answers **403** to that
User-Agent. The mirror fails on its first file and writes nothing to `clamav/`. With no `clamav/current.json`, every
`POST /scan` answers `not_scanned / SIGNATURES_ABSENT` without touching a container. The plane records a `not_scanned` note, and a
`not_scanned` note does not count as a scan, so the file stays "due". The 27 stay at 27 for ever. Nothing is wrong with the
plane's queue, the daemon, the service binding, the cron or the containers.

Owning module: **file-scanner** (`file-scanner/src/clamav.mjs`, `runMirror`). Secondary, plane-side (file-safety): see "Also".

## The path, with file:line

1. Capture enters the queue: a file row in `fs_files`; no separate queue. "Waiting" is `#due()`, bio-plane/src/file-safety/index.mjs:918-927:
   every file with no ClamAV note whose result is not `not_scanned` (line 922), or whose newest real scan is older than RESCAN_INTERVAL_MS.
2. Admin screen number: `scanStatus` (index.mjs:978-998): `queued: due.length`, `held` from `fs_holds`. That is "27 / 0".
3. Drain: the plane's own scheduler, not the cron. scheduler/index.mjs:286 `"file-scan": consumer("filescan", "scanWake", ... scanBatch({at}))`.
   `scanWake` (index.mjs:1616-1630) returns `now` while `remaining>0`, else the earliest due time, but not sooner than
   last run + `FILE_SAFETY_POLL_MS` = 300 000 ms (index.mjs:59). So an unscannable file is retried about every 5 minutes.
4. `scanBatch` (index.mjs:933-967) sends `POST /scan` through the FILE_SCANNER binding. It writes one note per verdict (`#writeNote`) and counts `not_scanned`.
5. Scanner Worker: file-scanner/src/worker.mjs default export `fetch` -> handler.mjs `handle` -> clamav.mjs `scan` (lines 59-113).
   `scan` reads `clamav/current.json` (line 66). If absent, `setReason='SIGNATURES_ABSENT'` (line 77); if older than 3 days
   (`SIGNATURES_MAX_AGE_MS`, limits.mjs:15) `SIGNATURES_STALE`. Either way every target gets `notScanned(...)` at line 91, and the
   `FileScanner` container is never called (`ensureSet` is skipped).
6. Mirror: worker.mjs `scheduled()` -> `runMirror` (clamav.mjs:126-176). Cron `17 4 * * *` (file-scanner/wrangler.jsonc). User-Agent set at clamav.mjs:140.
   A non-200/304 throws `REFUSED:<db>:<status>` (line 146), caught at line 171, written to `clamav/state.json`; no set is written.

## Live state of each link

| Link | State | Evidence |
|---|---|---|
| Plane sees queue | 27 waiting, 27 overdue, held 0 | `op=scanstatus` as admin: `queued:27, overdue:27, held:0, signatures_age_ms:null` |
| FILE_SCANNER binding | works | same answer carries `scanner.bound:true, version:0.86.0, clamav_version 1.4.3`; tail shows `/version` 200 |
| Drain daemon | runs about every 5 min and is answered | `wrangler tail file-scanner` 03:48-03:50Z: 5x `POST /scan` 200 (280-856 ms wall, 0-1 ms CPU: too fast to have loaded a container), 1x `/render` 200 |
| Cron | scheduled, ran | API `workers/scripts/file-scanner/schedules`: `17 4 * * *` (created 2026-10-15). `clamav/state.json` last_attempt 2026-10-19T04:17:27Z. Next run 04:17Z today |
| Mirror | fails every day | `clamav/state.json` = `{"last_attempt":"2026-10-19T04:17:27.391Z","last_error":"REFUSED:main.cvd:403"}`; same text in scanstatus `signatures.last_error` |
| Signature bucket | empty | R2 list (GET) `bio-captures` prefix `clamav/`: one object, `state.json`. No `current.json`, no `sets/`. `reputation/` empty |
| ClamAV front door | blocks our User-Agent | From this sandbox, `main.cvd` range GET: `file-scanner/0.86.0 (signature mirror; as cvdupdate)` 403; `file-scanner/0.86.0` 403; `cvdupdate/1.1.0` 403; `curl/8` 403; `CVDUPDATE/1.1.0 (manual download)` 200/206; `ClamAV/1.4.3` 206 |
| Containers | healthy, idle, not the problem | API `containers/applications`: file-scanner-filescanner v2, 3 max / 3 instances, healthy 2, assigned 1, failed 0; safeviewrenderer healthy 3, failed 0. Image tags pulled. The scan path never reaches them while signatures are absent |
| Op to drain by hand | refused to a person | `op=scanbatch` as admin: `MACHINE_CREDENTIAL_REQUIRED` (unattended path). Not run; nothing changed |

Caveat: the User-Agent test ran from this sandbox, not from a Worker's address. It shows the User-Agent decides the answer
(same address, 403 vs 206). Whether Worker egress is also filtered cannot be told from here; the first run after the fix will tell.

## Minimal fix

In `file-scanner/src/clamav.mjs:140`, send a User-Agent ClamAV's service accepts: cvdupdate's own form,
`CVDUPDATE/<ver> (manual download)` (what cvdupdate sends, and what R6 says the mirror imitates), instead of
`file-scanner/{v} (signature mirror; as cvdupdate)`. Keep the version of the member in the comment, not the string, if the front door
matches only the prefix. Update the string in the setup-words entry `file-scanner.clamav.file_scanner_v1_signature_mirror`.
Then deploy and run `POST /mirror` once rather than wait for 04:17Z; the next daily cron also works. Once `current.json` exists the
next batch (within 5 min) loads the set into FileScanner and the 27 are scanned; the first real use of the container.

## Test at the module interface

file-scanner/test/mirror.test.mjs:54 currently asserts the wrong thing (`user-agent` startsWith `file-scanner/`). Replace with:
drive `handle(new Request('https://x/mirror',{method:'POST'}), deps)` with a fake `deps.fetch` that answers 403 to any
User-Agent not matching `/^CVDUPDATE\/\S+ \(manual download\)$/` and a valid CVD otherwise; assert `ok:true`, `clamav/current.json`
written. Fails today (`REFUSED:main.cvd:403`, no current.json), passes after the fix.

## Also (separate, plane-side, file-safety)

- The screen says "waiting to be scanned" for files that were tried and answered `not_scanned / SIGNATURES_ABSENT`. A tried-and-failed file
  looks the same as one not yet tried, for days. `scanStatus` already holds `scanner.signatures.last_error`; the Security screen should
  say "The scanner has no signatures (last attempt failed: REFUSED:main.cvd:403)" when `signatures.versions` is null. Test at
  `scanStatus`: a scanner answering `/version` with null signatures and a `last_error` gives a named reason in the result.
- A first deploy leaves the bucket empty until 04:17Z next day; the release could call `POST /mirror` once after deploying file-scanner so the first day is not lost.
