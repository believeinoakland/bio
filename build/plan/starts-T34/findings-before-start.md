# Findings about modules made before their T34 jobs start (§5.3 (2)); each goes into that job's START body

- entities (T34-16): `test/m/entities/idmatch.test.mjs:26` (R20) pins id-spaces' list as nine literal names; red from id-spaces' merge (T34-7, twelve spaces) until this job drops the literal (the next assertion already compares with `spaces()`). From ID-SPACES #4 J1.
- action-clocks (T34-50): civil-time's offset cache landed (K1726); its `governedView` can go.
- agent-runner (T34-74): bundler's REPORT of the fields its `fleet-member.json` lacks for a container member (`bundle`, `class_name`, `max_instances`, `bind`, a pinned digest), K1730.
