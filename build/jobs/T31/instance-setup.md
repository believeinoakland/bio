# instance-setup (T31)

**Status** · session_01AmKb3df9mFbA8hcqHTnRp1 · depth 2 · COMPLETE · handled B1

## Completion (INSTANCE-SETUP #11)

**Entries applied** (`plan/current.md` L11, BOB's B1):
- **N538 · R8** (DEC-124; K1365 (5)): the check now fetches `https://<domain>/.well-known/civicsmith-group.json`; only when that answer is `absent` (404, 410, a redirect) does it fetch `/.well-known/civicos-group.json` the same way (governor admit, then report; no redirect followed; at most 16 KiB), and the second answer decides. One dated verdict is recorded either way; its `detail` names both files when both were read. The governed read is one private helper, `#readWellKnown`, used for both files. `GROUP_WELL_KNOWN_PATH` is the new file; `GROUP_WELL_KNOWN_PATH_BEFORE_T31` the old one (new export).
- **N538 · re-point**: `setup.mjs` imports and calls `acquisition`'s `civicsmithUserAgent` (its R24) instead of the `civicosUserAgent` alias; the comment beside it reads "Civicsmith". The comment naming the `civicos-ui/app.html` path is a path and is left as it is.
- **N528 · R49**: already met in code (system font stacks, no outside load); now tested (`loads.test.mjs`).

**Tests at the interface.**
- R8: `identity.test.mjs`, four tests replacing the one before. (1) Every answer except `absent` decides by itself, and the old file is never fetched (set and alarm). (2) Each of five `absent` answers on the new file followed by each of 17 answers on the old one: the old file's verdict decides, one row recorded, the public domain shown only when verified. Also the governor holding the host at the second fetch (undetermined, old file not fetched), and an old-file-only group staying verified on the alarm. (3) Undetermined, never absent, with no slug, no address or the governor holding the host. (4) The 16 KiB bound on each file. Every fetch is checked for `redirect: manual`, `civicsmithUserAgent` and admit-then-report.
- R49: `loads.test.mjs`. (1) The served bytes in all four group-line states, one of them a hostile display name, carry no off-origin `src`, `srcset`, `href` (except a followed `<a href>`), `@import`, `url()` or script address; there is no `@font-face`, and every font stack ends in a generic family. (2) Negative controls: ten broken pages are each refused (remote stylesheet, preconnect, `@import`, `url()`, script, scheme-relative image, srcset, an off-origin fetch, a web font, a stack with no generic family), and a followed link is accepted. (3) The page's script is driven through claim, sign-in, enrolment, the panel and profiles, browse, a record with files, history and the publish panel, the inbox, members and keys, and intake with a capture. Every URL it fetches is on its own origin, and every container it draws passes the same reading.

**Tests and checks run**
- `node --test bio-plane/test/m/instance-setup/`: tests 94, pass 94, fail 0, skipped 0.
- Users of this module: `control-plane` 147 tests, 146 pass, 1 fail; `plane` (with `migrate-released`) 77 tests, 76 pass, 1 fail. Both failures happen identically on `tranche/T31` without this job's change (run with the change stashed). They are case-import's new ops (`control-plane` "R49, R2, R26: each of case-import's eight ops…" and `plane` "R17, R5: every op of case-import's map…"), owed by those two modules' own T31 jobs (N534), not by this module. The installer: `newgroup-bundle-fresh` pass 1, fail 0 (`setup-fleet.mjs` unchanged). Legacy-ui's `civicos-ui/test/group-identity-surface.test.mjs`, which scripts only the old file: pass 1, fail 0 (the fallback reads it).
- `checks/format.mjs`: 98 modules, 97 requirements files; 0 failures. `checks/architecture.mjs … instance-setup`: 0 failures. `checks/coverage.mjs … instance-setup`: 49 of 49 live ids named by a test; 0 failures. `checks/ownership.mjs … instance-setup tranche/T31`: 0 failures.

**For BOB**
- The `*(not yet met: T31)*` marks on R8 and R49 in `build/requirements/instance-setup.md` can be struck; that file is not this job's to write.
- Generated artifact made stale (mechanics §14): `bio-plane/dist/bio-plane.bundled.mjs` (and its `.bundle.json`), owner `not_product`, carries `setup.mjs`; regenerated at the layer close. `release/bio-plane.bundled.mjs` is the release process's.
- Another module: `civicos-ui/test/group-identity-surface.test.mjs` (legacy-ui, Bob's: UX) still scripts only `/.well-known/civicos-group.json`. It passes through the fallback, but it no longer exercises the file a group is now told to publish. That is for that stream when it next touches the suite.

Deferred: none.

Size (session_01AmKb3df9mFbA8hcqHTnRp1): test runs 9, module lines 3002

## J1 · COMPLETE

Complete. N538 R8: civicsmith-group.json first, civicos-group.json only on absent, the second answer decides; re-pointed to civicsmithUserAgent. N528 R49: tested (loads.test.mjs, with negative controls and the page driven through every section). Module suite 94/94; format, architecture, coverage (49/49), ownership 0 failures. control-plane and plane each have 1 red that is identical on tranche/T31 without this change (case-import's ops, their own N534 work). Stale: bio-plane/dist/bio-plane.bundled.mjs. R8 and R49 marks can be struck. Details in the record.
