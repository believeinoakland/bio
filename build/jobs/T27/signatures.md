# signatures (T27)

**Status** · session_01N3t7Hfj37rLM9MSN2KgSNZ · depth 2 · WORKING · handled B1

## Entries applied

- **N520, R1** (amended to five): `NS_DOCKET` joins `NS_RELEASE`, `NS_RATIFY`, `NS_FLEET`, `NS_NOTICE`; the five are compiled constants, pairwise distinct (`bio-plane/src/sshsig.mjs`).
- **N520, R39**: `NS_DOCKET = "bio-docket"`. The offline signer page (`src/sign-release.html`, re-rendered to `src/signpage.mjs` by `scripts/embed-signpage.mjs`) gains a "Sign a docket entry" tab: case id, entry number and entry hash, signed with the ratification key (the member's registered attesting key, which docket R5 checks against `credentials.attestingKeys()`) in `bio-docket`, over exactly `docketStatement`'s bytes; it refuses, signing nothing, wherever `docketStatement` would throw. The page's header comment names the namespace. The page's notice id pattern is renamed `OPAQUE_ID_RE`, now shared by both tabs.
- **N520, R40**: `docketStatement(caseId, seq, sha)` returns `` `bio-docket ${caseId} ${seq} ${sha}\n` `` and throws (`Error`, "docketStatement: …") on a case id not matching the opaque-id pattern (record-core R6's shape, K1115, the one `noticeStatement` uses), an entry number that is not a safe integer of at least 1, or a sha that is not 64 lowercase hex. Its leading token `bio-docket` differs from every other statement's (`bio-ratify`, `bio-ratify-case`, `bio-working-on`, `bio-release-fleet/2`).
- N502/N508 re-scan of the module: nothing of that kind (no legacy-store dispatcher note, no `awaiting stamp`).
- **Catalogue rows**: none added, so none reads `awaiting stamp` (accepted red 2 has no signatures row from this job).

## Deferred

- **R39's "browser signer"**: as at T23 (J2 there), no in-app browser signer exists in code; `civicos-ui/` signs nothing. The signer page, served by the plane as `SIGN_HTML` and opened offline, now signs docket entries in `bio-docket`. A docket-signing step in the member UI is legacy-ui's and the UX stream's (Bob's: UX; the plan's legacy census lists "the docket's screens").
- The tab's text gives no outward-act warning of its own: docket R4's warning is answered by `docketPrepare`, in the UX stream's words, and this page does not mint them.

## Found in other modules (REPORT J1)

- **Generated artifact staled (§14)**: the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (and `.bundle.json`); my change edits two of its inputs, `src/sshsig.mjs` and `src/signpage.mjs`. `test/system/fleetbundles.test.mjs` names both STALE (1 test, fail). Not regenerated: BOB's at the layer close. The installer bundle (`newgroup/dist/newgroup.bundled.mjs`) also takes `sshsig.mjs`; `newgroup-bundle-fresh.test.mjs` still passes (1/1).

## Tests and checks

- `node --test bio-plane/test/m/signatures/`: tests 68, pass 68, fail 0, skipped 0 (ssh-keygen and openssl present). New: R40 ×3, R39 ×3 (namespace, page, stock ssh-keygen); R1, R26, R27, R28, R32 widened to the fifth namespace and statement.
- Users of `sshsig.mjs`/`signpage.mjs` (no service changed, run as a guard): public-read `convert-casesign`, network-notices (whole), publication `door`, capture `figures`/`knocker`/`services`, control-plane `doors`/`converts`, ratification (whole): tests 323, pass 323, fail 0.
- `newgroup-bundle-fresh.test.mjs`: 1 pass. `fleetbundles.test.mjs`: 1 fail, the plane bundle staled (above).
- `node checks/format.mjs`: 92 modules, 91 requirements files; 0 failures.
- `node checks/architecture.mjs … signatures`: 8 product files, 7 relative imports; 0 failures.
- `node checks/coverage.mjs … signatures`: 40 of 40 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … signatures tranche/T27`: 5 files changed; 0 failures.

Size (session_01N3t7Hfj37rLM9MSN2KgSNZ): test runs 4, module lines 1308
