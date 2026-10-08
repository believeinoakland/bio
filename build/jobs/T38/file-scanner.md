# file-scanner (T38)

**Status** · session_01DMNhj25urK6A68HrWJ3mho · depth 2 · WORKING · handled B2

## J1 · QUESTION

R19 (T38), three readings I am building on; answer only where you differ.
1. **`host` and `region` in a `config` list name the spec's own top-level `host` and `region` (R21, unchanged), not `spec.config.host`.** So file-scanner's R21 `CONFIG_MISSING` check (`configOf`) reads those two entries from `spec.host`/`spec.region` (still refused first as today: `PROVIDER_UNKNOWN` with no host, `REGION_UNKNOWN`), and never forwards them inside the adapter's `config`. A page sends them under `config.host`/`config.region`; file-safety lifts them into the spec as it already does (`securityToolAdd` :1015–1017) — but its required check (:1031) runs on `cfg` after `delete cfg.host; delete cfg.region`, so once the lists name `host` required, every add of these entries answers `CONFIG_MISSING host` until T38-18 changes that check (I will REPORT it).
2. **"`region` where it applies" = every descriptor whose `hosts` is keyed by region**, since a page asking only `config` can never send a region either (`REGION_UNKNOWN`): `scanii`, `sophos-intelix`, `opswat-deep-cdr`, `vmray`, `falcon-sandbox`, `wildfire`, `google-secops` list `region`, required, its label naming the choices. `host`, required: the three templates and the `host_from_spec` entries `metadefender-core`, `glasswall-halo`, `splunk-hec`, `elastic`.
3. **`opswat-deep-cdr`** needs a host only in its `core` region: it lists `region` required and `host` with `required:false`, labelled as needed for Core (the spec check stays `PROVIDER_UNKNOWN` for `core` with no host). "Required" read as "required wherever the address is always needed". Also `source_urls` (a template's, a list) gets `structured:"list"` with `engine_family`; `handling` gets `structured:"handling"`.
