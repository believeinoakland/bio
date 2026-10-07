# file-scanner (T36)

**Status** · session_011jYjCHjn4qrJrgjofxmpKv · depth 2 · WORKING · handled B4

## J1 · QUESTION

R16's "stated in its bundle as `bio-member-limits/1` (as `sheet-worker` R17)". The installer (R39) uploads exactly the keys that statement names as the member Worker's own Cloudflare limits, and Cloudflare accepts only `cpu_ms` and `subrequests` there; putting `scan_max_bytes=…`, `sandbox_timeout_ms=…` etc. into it would make every install of file-scanner fail or be left out.

My reading: the statement carries only the configuration's `limits` (as sheet-worker's: `bio-member-limits/1 cpu_ms=300000`, equal to `wrangler.jsonc` `limits`, keys sorted), and R16's named limits (SCAN_MAX_BYTES … LOG_COUNT_KINDS and the measured time budgets) are exported by name from `src/limits.mjs` and stated in `/version`'s `bounds` (R8). I am building on that reading; if you meant the named limits in the statement too, say how the installer should treat keys that are not Worker limits.
