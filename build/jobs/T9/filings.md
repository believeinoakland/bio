# filings (T9)

**Status** · session_015K2Cx7f4RGi8SiBt9nBb4r · depth 2 · COMPLETE · handled B0

## Completion (FILINGS #2, K316)

**Entries applied** (B1 START; no plan bullets):
- **R11** (K316): `counselPacketRead`, and so `counselPacketExport` and `theoryPropose({packet})`, answer a packet version only to a viewer who may see its action AND the project of the determination it draws on (consequences are parts of that determination, consequences R1, so in its project), by membership's `inSight` (its R80, the sight conformance R15 and consequences R13 withhold by); otherwise `NO_SUCH_PACKET`, the same answer as an absent packet. The check is per version; `versions` lists only the versions the viewer may see. It fails closed: an unreadable project, or no membership module, is not seen.
- **R13** (K316): `filingsFor` leaves out every draft and packet version drawing on a determination in a project the viewer may not see, and names nothing of it (id, determination, words, `basis_changed`). Rows are read in bounded pages, each spread before sight is asked, so `truncated` counts only seen rows.
- **Found in my module and fixed:** `filingApprove` and `filingRecordSent` reached a draft through its action alone, so a non-member could get `FILING_STALE` naming the hidden determination and its successor. `#draft` now uses the same sight (R6, R7, R19: `NO_SUCH_FILING`). R12's `standard_superseded` cause no longer names a superseding standard the viewer may not see. A draft's basis now stores its determination's project; older rows fall back to the plane's read of the determination.
- **Cursor and pattern cap:** the module test world's `sql.exec` now answers a workerd-shaped cursor (iterable, `toArray`, `one`, no `[0]`) and refuses LIKE/GLOB patterns over 50 bytes (K313). All 33 filings tests pass over it. The module has no LIKE or GLOB, and its `#rows` and `#one` already iterate.

**Red first:** the three new tests in `test/m/filings/sight.test.mjs` (R11; R13; R6 R7 R19) ran on today's code and failed where the leak was: quinn got the packet (`reason` undefined), quinn's `filingsFor` listed bo's draft, and quinn's approval got `FILING_STALE`. All three pass now. Every test is at the interface, run by a non-member (quinn) and by members (bo, cy), with a machine as the control.

**Deferred:** none.

**Found in other modules / artifacts:**
- The plane bundle `bio-plane/dist/bio-plane.bundled.mjs` is stale from `src/filings/index.mjs` (mechanics §14). Reported, not rebuilt.
- None otherwise. `escalation`'s cursor flaw is already ESCALATION #3's (K316).

**Tests and checks run:**
- `node --test bio-plane/test/m/filings/`: tests 33, pass 33, fail 0 (was 30/30 before, all passing again over the cursor fixture).
- Users of `filingsFor`: `test/m/escalation/` 28 pass 0 fail; `test/m/affordances/` 73 pass 0 fail 1 todo. Both identical to the tranche base.
- `format`: 69 modules, 64 requirements files; 0 failures. `architecture filings`: 10 product files, 37 relative imports; 0 failures. `coverage filings`: 21 of 21 live requirement ids named by a test; 0 failures. `ownership filings tranche/T9`: 4 files changed; 0 failures.

Size (session_015K2Cx7f4RGi8SiBt9nBb4r): test runs 9, module lines 1387
