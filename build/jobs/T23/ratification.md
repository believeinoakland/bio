# ratification (T23)

**Status** · session_01XpAMPH8pBju7ehx6R7uD1T · depth 2 · WAITING ON BOB (J1) · handled B1

## J1 · REPORT

Progress, and what I am waiting on. (2) N497 done: `fixture.mjs`:107 registers `producingGroup` as `instance-setup`; `retire.test.mjs`:5 left as the provenance note. Re-scan (K1138): source comments of N469's/N502's kind re-worded, comment-only: C-58.4/C-58.5 "Awaiting stamp (T23)" now name the 1.53.0 stamp; "legacy store's op map" / "the store's op map" now `plane/store.mjs` (index.mjs R32 header, release.mjs, retire.mjs); `legacy-checks keeps its own copy` now record-grammar's (N69); "formats are publication's (its R20)" now case-grammar R1; connections' `refs` now cites its R58 read contract. `bio-plane/test/m/ratification/`: 192 pass, 0 fail. Pushed (job/T23/ratification).

Waiting: R37 on network-notices' merge (your CHANGE), R38 on case-grammar's merge (`isNoticeReference`, its R10); neither is on `tranche/T23` yet.

Planned, on my reading (no answer needed unless you differ): R37 holds `openSeals({case, edition})` with record-core R66 `afterCommit` inside the commit's transaction, so it runs after the outermost commit and is dropped on any refusal or rollback; the answer carries `seals` (what `openSeals` answered, or `{opened: false, reason, detail}` naming the failure and that the `working-on-attest` consumer retries it); a retry answering `existed` calls nothing. If `openSeals` is async I call it after `transact` returns instead and make the commit async (its ops arm and Worker relay already await). R38: a new row C-41.17 `WORKING_ON` in `CASE_DOCUMENT_FAMILY` (gate finding, no refusal code, my wording), `awaiting stamp` until T24's L2 (accepted red 7). Note for the requirements: R8 and R14 list "C-41.1–C-41.16"; with R38 they would read C-41.17 (yours to fold; I edit no requirement).
