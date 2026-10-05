# T33: findings for jobs not yet started (§5.3 (2))

**Status** · Kept by BOB on `tranche/T33`. Each line goes into the named job's `START` body when its layer starts.

- **workbooks (T33-42), installer (T33-91), and whichever job first binds `SHEET_WORKER` in the plane** (K1531, from SHEET-WORKER #1 J2): instance-setup's `FLEET_BINDINGS`, control-plane's `members-pin.test.mjs` (sheet-worker's `NAMESPACES`/`PLANE_OPS`, its R11) and bundler's `deploybindings.test.mjs` gain the member; each job changes only its own module's part and reports the rest.
