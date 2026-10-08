# file-scanner (T38)

**Status** · session_01DMNhj25urK6A68HrWJ3mho · depth 2 · WORKING · handled B2

## J1 · QUESTION

R19 (T38), three readings I am building on; answer only where you differ.
1. **`host` and `region` in a `config` list name the spec's own top-level `host` and `region` (R21, unchanged), not `spec.config.host`.** So file-scanner's R21 `CONFIG_MISSING` check (`configOf`) reads those two entries from `spec.host`/`spec.region` (still refused first as today: `PROVIDER_UNKNOWN` with no host, `REGION_UNKNOWN`), and never forwards them inside the adapter's `config`. A page sends them under `config.host`/`config.region`; file-safety lifts them into the spec as it already does (`securityToolAdd` :1015–1017) — but its required check (:1031) runs on `cfg` after `delete cfg.host; delete cfg.region`, so once the lists name `host` required, every add of these entries answers `CONFIG_MISSING host` until T38-18 changes that check (I will REPORT it).
2. **"`region` where it applies" = every descriptor whose `hosts` is keyed by region**, since a page asking only `config` can never send a region either (`REGION_UNKNOWN`): `scanii`, `sophos-intelix`, `opswat-deep-cdr`, `vmray`, `falcon-sandbox`, `wildfire`, `google-secops` list `region`, required, its label naming the choices. `host`, required: the three templates and the `host_from_spec` entries `metadefender-core`, `glasswall-halo`, `splunk-hec`, `elastic`.
3. **`opswat-deep-cdr`** needs a host only in its `core` region: it lists `region` required and `host` with `required:false`, labelled as needed for Core (the spec check stays `PROVIDER_UNKNOWN` for `core` with no host). "Required" read as "required wherever the address is always needed". Also `source_urls` (a template's, a list) gets `structured:"list"` with `engine_family`; `handling` gets `structured:"handling"`.

## J2 · REPORT

Found in other modules (for T38-18 and the layer close), with this job's commit 5631af3d46:
1. **file-safety R28 (T38-18's share of N791, K2264):** `securityToolAdd` (`index.mjs`:1015–1031) takes `config.host`/`config.region`, deletes them from `cfg`, then checks each `required` field of the entry's `config` list against `cfg`, so every entry that now lists `host` or `region` required (the three templates; `metadefender-core`, `glasswall-halo`, `splunk-hec`, `elastic`; `scanii`, `sophos-intelix`, `opswat-deep-cdr`, `vmray`, `falcon-sandbox`, `wildfire`, `google-secops`) answers `CONFIG_MISSING host`/`region`. With this commit, `node --test bio-plane/test/m/file-safety/` goes from 49/0 to 30 pass, 19 fail (26 "tool not added: CONFIG_MISSING"; R4, R5, R8–R10, R13–R16, R18, R21–R23, R25, R27–R32 titles), accepted by name until T38-18 (B2). Suggested fix there: the required and stray checks skip `host` and `region` (file-scanner `descriptor.mjs` exports `SPEC_FIELDS`), checked instead as the `host`/`region` it lifted; a template's structured `engine_family`/`source_urls` (list) and `handling` (object) as R19 marks them.
2. **Generated artifact staled:** `bio-plane/dist/bio-plane.bundled.mjs` (plane, through file-safety's import of `catalogue.mjs`, `descriptor.mjs` and now `net.mjs`): `fleetbundles.test.mjs` names it STALE; regenerated at L1's close (§14). file-scanner's own bundle is rebuilt and fresh in the commit. `fleetbundles.test.mjs`'s one other failure is red 5 (agent-worker, T38-1).

## J3 · REPORT

Correction to J2 item 1's count (the cause and fix stand): with commit 5631af3d46, `node --test bio-plane/test/m/file-safety/` answers 49 tests, **20 pass, 29 fail** (not 30/19). Failing, by title: R4 (with R32), R5, R8, R9, R10, R12–R16, R18, R21–R23, R25, R27–R33, R35 (two), R37, R39–R41; every one through a tool add answering `CONFIG_MISSING` (host/region) in its setup, or the R27/R28 assertions on the config lists.
