# bundler (T46)

**Status** · session_01SHEYtEvhTCnEvXN1xWJ1iY · depth 2 · WORKING · handled B0

## Completion (BUNDLER #16)

**Reading set** (mechanics §17; BOB measured it at 562 KB at the START). I read it all, whole: `build/requirements/bundler.md`; the public parts of `signatures` and `test-support`; layer 1's contract and "Helper modules" in `build/layers.md`; the plan's T46 opening, rule 5 and entry T46-2; and every file under the module's `paths` and `tests`. I read my own code and tests whole, not only the lines I changed (P20).

**Entries applied (T46-2, N900; K2266, K2828, K2912).** Tests only. No requirement text changed. No product code changed. No bundle was rebuilt or committed.
- **(a)** `fleetbundles.test.mjs`' agent-worker pin is re-pinned from 26 to 27 inputs, taken from the committed manifest `agent-worker/dist/agent-worker.bundle.json` (27 inputs on `tranche/T46`, and the same 27 on the cut). One input arrives: the member's own `src/action-drafts.mjs`, added in T45. None leaves. A re-pin note names it, and the label says "nine own modules". This clears the first half of plan rule 5 (5).
- **(b)** The real-fleet pin "container members, each with its images (R24)" now names the 0.82.0 cut's GHCR repositories: `ghcr.io/believeinoakland/agent-runner`, `…/file-scanner-scanner` and `…/file-scanner-renderer` (`dist/cut-0.82.0` @ 985fbefc88, K2912).
- **(b), the same pin in my own unit tests.** `bio-plane/test/m/bundler/bundler.test.mjs` "R24: the repository's own fleet lists agent-runner…" pins `runner.image.repository` to the real marker as well. The START did not name it, but it goes red at the same moment, so I re-pinned it to `ghcr.io/believeinoakland/agent-runner` too. Both (b) pins are **red on `tranche/T46` until the cut is merged**, and green once it is (see Ran).

**Fixed in my own module (comments only; no behaviour moved).**
- `deploy-fleet.mjs`' header said a member deploys its source, not a bundle, because "FLEET's decision" keeps `main` on the source. That is no longer true: every member's `wrangler.jsonc` names its committed bundle as `main` (D-297). The paragraph now says why the tool goes through wrangler: the config carries the parts' rules, the containers, the buckets and the crons.
- `deploybindings.test.mjs` still called FILE_SCANNER "red 10 of T36's opening … until it lands". It landed at T36-49 and the comment now says so.

**Deferred.** R11's "one implementation" test still reads the four callers' source text (BUNDLER #15 deferred it at T43 for the same reason). A behavioural form means driving every caller with a marked parser, and that is more than a tests-only entry allows. It remains a candidate for a later bundler entry.

**Found (to BOB, in J1 REPORT).**
1. **The 0.82.0 cut commits two symlinks.** `dist/cut-0.82.0` @ 985fbefc88 tracks `agent-runner/node_modules` and `file-scanner/node_modules` as symlinks (mode 120000) to absolute paths: `/home/user/bio/agent-runner/node_modules` and `/home/user/bio/file-scanner/node_modules`. `.gitignore`'s `node_modules/` matches directories only, so a symlink is not ignored. On a checkout at `/home/user/bio`, the link points at itself. Anywhere else, it points into another tree. Either way `npm ci` in those members cannot install, and the byte guard needs those installs (K1980). The cut is BOB's, and these files are in other modules' paths, so I touched neither. They should be removed (`git rm --cached`) before or in the cut's merge into `tranche/T46`.
2. **R31's figures for the layer close** (one run each, on the cut's tree): agent-runner 60,818 B, 3 ms; agent-worker 289,100 B, 6 ms; file-scanner 176,562 B, 7 ms; ocr-worker 303,361 B, 16 ms; pdf-worker 2,465,783 B, 51 ms; sheet-worker 26,160 B, 1 ms; bio-plane 16,853,108 B (16.1 MiB), 380 ms (428 ms on the tranche run). Nothing warns.

**Ran.** First the installs: `npm ci --ignore-scripts` in `agent-runner`, and `npm ci` in `file-scanner` and `sheet-worker` (`--install-dirs`; the plane, ocr-worker and pdf-worker were already installed).
- Baseline on `tranche/T46` @ a8fcf6b459, before any change: `fleetbundles: 148 pass, 1 fail` (the 26-input pin, rule 5 (5)).
- **Tree 1, `tranche/T46` with my change**: `node --test bio-plane/test/m/bundler/ bio-plane/test/system/{bundle,deploybindings,fleetbundles,resolveversion}.test.mjs` gave tests 95, pass 93, fail 2, skipped 0. The two fails are exactly the (b) pins: fleetbundles' R24 (`148 pass, 1 fail`) and bundler.test's R24. Both wait for the cut. (a) is green.
- **Tree 2, the cut's tree**: a temporary worktree at `origin/dist/cut-0.82.0` (985fbefc88) with my four changed files laid over it. Those four files are identical on the cut and on `tranche/T46`. The members were installed as above. The same command gave tests 95, pass 95, fail 0, skipped 0, and `fleetbundles: 149 pass, 0 fail`, no SKIP. The worktree was removed afterwards. (One discarded run laid only the cut's two `fleet-member.json` files over tranche: the R24 pin passed, but those members' bundles read stale, because the cut rebuilt them with the digests built in. So the faithful test is the cut's whole tree, run above.)
- No layer tests are named in the manifest. No provided service changed.
- Checks: `format` 0 failures; `architecture` bundler 0 failures; `coverage` bundler 31 of 31 live ids, 0 failures; `ownership` bundler against `tranche/T46`, 0 failures (re-run after the commit).

Size (session_01SHEYtEvhTCnEvXN1xWJ1iY): test runs 4, module lines 3435

## J1 · REPORT

The 0.82.0 cut (dist/cut-0.82.0 @ 985fbefc88) tracks agent-runner/node_modules and file-scanner/node_modules as symlinks (mode 120000) to absolute paths (/home/user/bio/agent-runner/node_modules, /home/user/bio/file-scanner/node_modules). .gitignore's node_modules/ matches directories only, so it does not ignore them. Merged into tranche/T46, they point at themselves on a /home/user/bio checkout, and into another tree anywhere else. Either way npm ci in those members cannot install, and fleetbundles' byte guard needs those installs (K1980). They are in other modules' paths and the cut is yours, so I touched neither. Suggest git rm --cached on both, before or in the cut's merge. Details: build/jobs/T46/bundler.md, Found 1.
