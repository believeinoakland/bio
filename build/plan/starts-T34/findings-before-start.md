# Findings about modules made before their T34 jobs start (§5.3 (2)); each goes into that job's START body

- entities (T34-16): `test/m/entities/idmatch.test.mjs:26` (R20) pins id-spaces' list as nine literal names; red from id-spaces' merge (T34-7, twelve spaces) until this job drops the literal (the next assertion already compares with `spaces()`). From ID-SPACES #4 J1.
- action-clocks (T34-50): civil-time's offset cache landed (K1726); its `governedView` can go.
- agent-runner (T34-74): bundler's REPORT of the fields its `fleet-member.json` lacks for a container member (`bundle`, `class_name`, `max_instances`, `bind`, a pinned digest), K1730.
- installer (T34-71): sheet-worker's limits statement is a double-quoted literal `bio-member-limits/1 cpu_ms=300000` in its bundle text, on the default handler (SHEET-WORKER #2 J1, K1731); read as installer R20 reads the plane's.
- record-core (T34-9): `t33.test.mjs` R76 pins the opaque set as five and R62's `mintExhausted` has no sentence for `calculation`; red since record-grammar's merge (CALC opaque, K1728, K1732); this job updates them.
- calculations (T34-27): `calculations.test.mjs:49` (R4) expects a sequential fresh `CALC-` id; red since record-grammar's merge (K1732); this job expects the opaque form.
- standards (T34-21): `law.mjs:312` labels law proposals through `standard`; record-grammar R49's `law_relation` subject is now there (K1732).
- entities (T34-16): with id-spaces' twelve spaces (K1729), R20's literal list is three short; drop the literal (ID-SPACES #4 J4).
- agent-runner (T34-74): BUNDLER #8 J2 (K1734): its marker needs `bundle` (the Worker hosting `AgentRunner`), `class_name`, `max_instances`, `bind` (e.g. agent-worker's RUNNER), `image.digest` (`sha256:<64 hex>`, written at the release), and its wrangler.jsonc `containers`; the fleet gate needs no edit (fleetbundles admits it; resolveversion ARM 7b is a floor).
- calculations (T34-27): calc-grammar's streamed evaluate answers a streamed table result as `{fields, rows}`; read it through `rows()` when storing one (K1734).
- intent (T34-40): it imports calc-grammar/decimal.mjs's inner names; import through calc-grammar's index (CALC-GRAMMAR #2 J2, K1736).
- entities (T34-16): `t33.test.mjs:102` (R43) pins UNKNOWN_SCHEME's `schemes` to the test profile's old list; the test profile now also holds `ellery_body`, `ellery_seat`, `marlow_registry` (jurisdictions R62). Red from jurisdictions' merge until this job (JURISDICTIONS #7 J2).
- events (T34-17): `participants.test.mjs:9` (R11) "no vote values" uses `testView()`, which now carries `vote_values`; `follow.test.mjs:33` (R22) and `:189` (R41) add their own `legistar_body` in space `object`, now behind the profile's `ellery_body` in space `body`: switch to the `body` space (N569). Red from jurisdictions' merge until this job.
- following (T34-70): `body.test.mjs:71` (R2), the same `legistar_body` fixture: switch to the `body` space. Red from jurisdictions' merge until this job.
- action-clocks (T34-50): Oakland's counterparties are now "Finance Department" and "Office Of The City Auditor" (R61, K1690); data or tests keyed on the old body names find no office.
- reading-pipeline (T34-66): since docprofile's merge (no default types, K1737) 16 of its tests read through docprofile without registering doctypes' types: convert-chain ×3, convert-ocr ×3, convert-tiers ×1, emitted ×1, hooks ×1, pieces ×1, read ×5, staffdirectory ×1. Each suite registers the readers (doctypes' `registerDoctypes(registerDoctype)`); add `doctypes` to its test uses.
- plane (T34-76): its acquisition profile tests ×2 likewise (register through `registerReaders()`) (K1737).
