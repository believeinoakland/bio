# T33: findings for jobs not yet started (§5.3 (2))

**Status** · Kept by BOB on `tranche/T33`. Each line goes into the named job's `START` body when its layer starts.

- **workbooks (T33-42), installer (T33-91), and whichever job first binds `SHEET_WORKER` in the plane** (K1531, from SHEET-WORKER #1 J2): instance-setup's `FLEET_BINDINGS`, control-plane's `members-pin.test.mjs` (sheet-worker's `NAMESPACES`/`PLANE_OPS`, its R11) and bundler's `deploybindings.test.mjs` gain the member; each job changes only its own module's part and reports the rest.
- **plane, and installer/bundler where they bind Worker secrets (L11)** (K1541, from CREDENTIALS #3 J1): credentials seals each member's reference with a key derived from a Worker secret `ACCOUNT_SEAL_SECRET`, read as `credentialsOf(ctx, {sealSecret})`; plane hands it in and the copy binds it. Without it, setting a reference is refused `ACCOUNT_SEAL_UNAVAILABLE`.
- **answers (T33-53, L6)** (K1541): credentials' `AI_GRANT_OPS` is a frozen, sorted list of plane op names (R28); answers' `ASK_SCOPE` equals it with the copy test; a different spelling is a REPORT to BOB.
