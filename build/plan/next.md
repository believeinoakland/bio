# Plan: next tranche

**Status** · Entries that arose after the T5 triage, awaiting the tranche they join (PROCESS-MECHANICS §5). The carried rows of the old plan are listed in `docs/development/transition/old-plan/index.csv` and join T8's first plan there. Grouped by module, modules by layer.

## Layer 1

**jurisdictions**
- N1 · 2026-09-25 · Create the module and its first profile, Oakland and Alameda County, holding every local fact now in code: identifier spaces and forms, publishing systems, coverage floors, recogniser vocabulary, default search terms, each with its measurement. Rule: `layers.md`, "No jurisdiction in the product".

**id-spaces**
- N2 · 2026-09-25 · Take identifier spaces, systems and floors from a profile. Rename the spaces for any jurisdiction (`enactment`, `project`, `fund`, `parcel`), per `requirements/id-spaces.md`.

**docprofile**
- N3 · 2026-09-25 · Move the Oakland council headers, municipal-code citation patterns and other local vocabulary (12 files) into the profile. The recognisers match whatever the active profiles supply.

## Later layers

- N4 · 2026-09-25 · `store.mjs` `readingNamePlan` defaults its search terms to "oakland": take them from the active profiles. The owning module is confirmed at extraction.
- N5 · 2026-09-25 · **installer**: the outward text names CivicOS and the installing group. Believe in Oakland appears only as the release's publisher and signer. The example group name is not a place.
- N6 · 2026-09-25 · **entities**: `op=idmatch` takes the renamed spaces (N2) and passes each end's addresses from the record.
