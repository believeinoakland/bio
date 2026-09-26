# Plan: next tranche

**Status** · Entries that arose after the T5 triage, awaiting the tranche they join (PROCESS-MECHANICS §5). The carried rows of the old plan are listed in `docs/development/transition/old-plan/index.csv` and join T8's first plan there. Grouped by module, modules by layer.

## Layer 1

**jurisdictions**
- N1 · 2026-09-25 · Create the module and its first profile, Oakland and Alameda County, holding every local fact now in code: identifier spaces and forms, publishing systems, coverage floors, recogniser vocabulary, default search terms, each with its measurement. Rule: `layers.md`, "No jurisdiction in the product".

**id-spaces**
- N2 · 2026-09-25 · Take identifier spaces, systems and floors from a profile. Rename the spaces for any jurisdiction (`enactment`, `project`, `fund`, `parcel`), per `requirements/id-spaces.md`.

**docprofile**
- N3 · 2026-09-25 · Move the Oakland council headers, municipal-code citation patterns and other local vocabulary (12 files) into the profile. The recognisers match whatever the active profiles supply.

**signatures**
- N7 · 2026-09-25 · BOB #37 ruled: the signing page's source (`tools/sign-release.html`) and its generator (`bio-plane/scripts/embed-signpage.mjs`) move into `signatures`, which serves the page, so the module's own tests can check that the page it serves is the current render. `modules.json` gains the two paths when the files move.

**pdf-worker**
- D-622 · 2026-09-26 · Decoders for JBIG2 and JPX image-only pages (old-plan row D-622), held out of T1 as too large for the certification run. (N9 moved to T1.)

## Later layers

- N12 · 2026-09-26 · **legacy-index**: `bio-plane/scripts/deploy.mjs` and `resolve-version.mjs` read JSONC through `tools/jsonc.mjs`, which is not product: the reader they need comes into the product (its own small helper, or inside `legacy-index`). `bio-plane/scripts/op-claims.mjs` serves the old process's claims ledger and is removed. Found by the architecture check, 2026-09-26.
- N13 · 2026-09-26 · **affordances**, **queue**: `store.mjs` imports `affordances.mjs` and `queuestate.mjs`, both later in the order. What the store needs from them moves to the module that owns it, earlier in the order, when each is extracted. Found by the architecture check.
- N14 · 2026-09-26 · **legacy-tests**: 60 imports by the old battery of the old process's tooling (`tools/`, 28 files), and `civicos-ui/check-semantics.mjs`'s import of `tools/bundle-docprofile.mjs`. Those tests and that check retire with the tooling they test, or take what they need into product. Found by the architecture check.

- N8 · 2026-09-25 · **promotion**: BOB #37 ruled that check C-18.8 (release-signature primitives, a second hand-written SSHSIG verifier in `bio-checks.mjs`, kept only for the Apps Script gate, which `gate.mjs` records as decommissioned) moves to `promotion`, which checks release records in bundles, and verifies through `signatures` instead. The duplicate verifier is retired.

- N4 · 2026-09-25 · `store.mjs` `readingNamePlan` defaults its search terms to "oakland": take them from the active profiles. The owning module is confirmed at extraction.
- N5 · 2026-09-25 · **installer**: the outward text names CivicOS and the installing group. Believe in Oakland appears only as the release's publisher and signer. The example group name is not a place.
- N6 · 2026-09-25 · **entities**: `op=idmatch` takes the renamed spaces (N2), passes the combined profile view, and passes each end's addresses from the record. **affordances**: `idmatch`'s outward text names no local system (it says "C.M.S.", "APN" and "Legistar's floor" today).
- N10 · 2026-09-25 · **record-core**, **installer**, **instance-setup**: the instance holds the list of its active jurisdiction profiles as a setting, and the installer offers the choice. Rule 2 of "No jurisdiction in the product".
- California's records law as a kind name (`cpra_request`) and in outward text is carried as old-plan row REC-201 against `actions`; the profile's `records_laws` section is where the law's name comes from.
