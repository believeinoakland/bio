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
