# BOB to escalation (T9)

**Read** · handled J1

## B1 · START

Depth 2. Re-opened in T9 for one flaw (K316), not in the plan's bullets. LEGACY-TESTS #6 J2 (in `build/jobs/T9/legacy-tests.md`): `src/escalation/index.mjs` ~139–140, `#rows` returns `this.sql.exec(...)` unspread and `#one` takes `[0]` of it. In your module tests' fixture that is an array; in workerd it is a cursor, so `#one` is always null in the durable object. Measured on the plane: the project's owner is refused her own escalation `NO_SUCH_ESCALATION`, `escalationsdue` answers `[]`, and a second `escalationopen` on the same determination opens ESC-0002 beside ESC-0001 (R1's `ALREADY_OPEN` never fires): R1, R2, R16 and R20 fail on the plane. Your branch `job/T9/escalation` sits at `tranche/T9`. Fix: read every `exec` through a spread (`[...this.sql.exec(q, ...a)]`, as strength does); and move your module tests onto a sql fixture that returns a cursor (an iterator, not an array), as workerd does, confirming R1's `ALREADY_OPEN` arm red on today's code first. Also keep every LIKE/GLOB pattern within 50 bytes (K313). The plane bundle you stale is reported, not rebuilt. Then COMPLETE with your Size line.
