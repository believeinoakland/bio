# installer (T8)

**Status** · session_013r4jzfdoLCUCoffM5F7wgv · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R22 "Every page names CivicOS and the installing group." My reading, which I am building on: every page the installer serves (install, update, progress and outcome, the plain refusal and 404 pages) and the invitation page names CivicOS as the product; the group is named by the name it chose (its slug) on every page shown after it chose one (the progress page, its outcome, and a refusal page reached with that name), and addressed as "your group" on the pages shown before it has one (the install and update pages, the invitation page, the 404). Each page also says, in a footer, that the installer is run by Believe in Oakland, the publisher and signer of CivicOS releases; Believe in Oakland appears nowhere else. The update's D-436 notice drops its example "biosmoke7 / believe-in-oakland" (it names this project's copy, not the publisher) and says only that a group's slug may differ from its copy's name. The example name becomes `clean-water-coalition`. I am also meeting R23 in the same text (the pages state Workers Paid and a payment method; "no card" and "storage optional" go), since it is my own module's flaw in the lines I am rewriting; its "not yet met" mark is yours to clear.

## J2 · REPORT

Found outside my module, not mine to change (on `job/T8/installer` @ a97ab03bbb):

1. **R30 is not met, and its requirement does not say so (BOB's file).** The installer copies the slug grammar (`SLUG_RE`, equal to `GROUP_SLUG_RE`, which legacy-store holds as a static, `store.mjs` 6219) and the member binding names (`MEMBER_BINDINGS`, equal to `FLEET_BINDINGS`, which legacy-index holds unexported, `index.mjs` 3681). Both are `instance-setup`'s by R30, and instance-setup is not extracted (no T8 job). My R30 is a `test.todo` naming that cause; `installer.md`'s header should list R30 as not yet met, and instance-setup's extraction should export both so the installer imports them.
2. **Requirement marks (BOB's file):** R22 now holds (K262), and R23 (B2: you clear it). R2 and R19 are tightened in code as their text already asked (a non-string slug refused; streamed script values escaped).
3. **legacy-tests:** none of its suites fails on my change. `m025-arm-anchor-witness` (A4), `hygiene` (grade_axis, 37 uncovered tables), `check-firing` (C-2.10, C-11.1) and `case-opened` (REC-58 anchors) are red on the tranche for other layers' moves; no failing line names `newgroup`. `m025-arm-census.mjs` describes `newgroup/test/` as holding two `.test.mjs` files; it now holds three (and `fixture.mjs`), and one of them is a `node:test` driver. `owed-controls`' sweep still passes.

## Completion

**Entries applied.** Layer 11's installer bullet: N5 (R22), on B2's answer (K262). Every page the installer serves (install, update, the streamed progress page and its outcome, the refusal and 404 pages) and the invitation page (`bio-plane/public/newgroup/index.html`) names CivicOS as the product; the group by the name it chose once it has one ("For the group <slug>"), "your group" before; each says the installer is run by the publisher of CivicOS releases (R22's own sentence) and none names a third party. The D-436 notice drops the project's own copy as its example; the example name is `clean-water-coalition`, which no held profile's coverage names. R23 met in the same lines (Workers Paid and a payment method stated; "no card" and "storage optional" gone; the plan refusal no longer claims a card it has not seen).

**Flaws fixed in my own module.** R19: values streamed into the progress page's `<script>`s were plain `JSON.stringify`, so management-API text containing `</script>` (an error, an account's name) could close the element and inject markup; they now escape `<`, `>`, `&`, U+2028/9. R11: a reachable repository whose plane failed verification had its manifest dropped, so the fleet step said "not reachable"; it now keeps it and names the true reason. R2: a non-string slug (a JSON number) was coerced and accepted; it is refused. The embed step's work is exported as `embedRelease({planeDir, releaseDir, out, signers})`, so R26 (the published-token refusal, the generated file) is tested whole; the embed it writes is byte-identical.

**Deferred** (`test.todo`, each naming its cause): R13 (MULTI-INSTANCE-ISOLATION row 6), R20 (DIST-15), R21 (N10, needs instance-setup R13), R24, R32, R33 (K102), R30 (instance-setup not extracted; see J2).

**Found in other modules** (REPORT J2): R30's unmarked "not yet met" and its cause (the grammar in legacy-store, the binding names unexported in legacy-index, both instance-setup's); the requirement marks R22, R23; legacy-tests: no suite fails on this change; `m025-arm-census.mjs`' description of `newgroup/test/` is stale.

**Tests and checks** (on `job/T8/installer` with `tranche/T8` @ K262 merged):
- `newgroup`: `npm test`: embed 23 passed, 0 failed; wizard 206 passed, 0 failed (one assertion re-pointed from the project's own copy to R22's rule; the suite now reads streamed pages as their script sees them); `node --test test/requirements.test.mjs`: tests 33, pass 26, fail 0, todo 7. Negative controls, each alone, restored byte-identically: plain `JSON.stringify` in `jsStr` fails R19 only; the old eyebrow on the progress page fails R22 and R31 only; dropping the manifest on a verification failure fails R11 only.
- `npm run build` (newgroup): bundle regenerated. `node --test bio-plane/test/newgroup-bundle-fresh.test.mjs bio-plane/test/fleetbundles.test.mjs`: tests 2, pass 2, fail 0, skipped 0.
- Legacy suites that read `newgroup/`: `owed-controls` exit 0; `m025-arm-anchor-witness`, `hygiene`, `check-firing`, `case-opened` red only on other layers' moves (no failing line names `newgroup`).
- format: 69 modules, 64 requirements files; 0 failures. architecture: 16 product files, 21 relative imports; 0 failures. coverage: 33 of 33 live requirement ids named by a test; 0 failures. ownership: 10 files changed by installer between tranche/T8 and HEAD; 0 failures.

Size (session_013r4jzfdoLCUCoffM5F7wgv): test runs 21, module lines 1811

## J3 · COMPLETE

Complete, on job/T8/installer @ 4675e13794 (pushed): N5 (R22) per K262 and R23 on every page; R19, R11, R2 tightened; R1–R33 named at the interface, 26 pass, 7 todo; bundle regenerated and fresh; format, architecture, coverage (33/33), ownership 0 failures. Record's Completion section has the detail; J2 lists what I found elsewhere (R30 unmarked).
