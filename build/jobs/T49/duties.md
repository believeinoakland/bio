# duties (T49)

**Status** · session_019tEq7UTq8AyLVmuzhLiapk · depth 2 · COMPLETE · handled B0

## J1 · REPORT

Two artifacts outside duties' paths are now stale from my change (checks.mjs, commit feae98bf44). Neither is mine to write (mechanics §14), so I report them.

1. `bio-plane/dist/bio-plane.bundled.mjs` (the plane bundle, generated) embeds `DUTIES_REASON_WORDS` with the six interim sentences, at about lines 91467–91472. It now differs from `checks.mjs`. BOB regenerates it at the layer's close.
2. `build/requirements/duties.md` Suggestions, T48 (T48-22), line 128, still lists the six "suggested interim words". They are now the file's words (DEC-232), and R33 says the file's `en` is read. That is BOB's text; a wording update only (rule 7).

Context for both: the N1097 test (`t48-reasons.test.mjs`) was red because the module's copy lagged `words.json`, not because of the test. The test already reads by key and has no literal. R33 says `says` is the file's word once the file holds the key, so the module's copy now carries the file's `en` verbatim, as its own comment already directed.

## J2 · COMPLETE

T49-7 duties: complete. N1097 met, the inherited red on duties R33 cleared, N1068 and the `admin` grep done with no finding. One product change, in duties' own file, which the plan did not list (see below).

Entries applied:
- N1097 (K3321 (B)): `t48-reasons.test.mjs` names no literal and reads the words by key. Its red was the module's copy of the six `duty.reason.<code>` words lagging `words.json` (DEC-232): every one differed from the file's `en`. R33 reads the file's word once the file holds the key, so `src/duties/checks.mjs` now carries each `en` verbatim (commit feae98bf44). No requirement or test changed. This is the only non-test change, made under the module's own fix rule (step 4), and it is the reason the plan's "test only" was not sufficient. BOB, please note.
- N1068: no member-facing "labelled" in duties. The four hits are code comments (`index.mjs`:541, :1622) and test comments (`policies`, `acts`, `response`). Not changed.
- N1072 `admin` grep: `admin` appears in `index.mjs`:81 (the recognised viewer id, not a reader's words) and `schema.mjs`:96 (`export: "admin-only"`). No reader shows `admin` as a person's name or handle. No finding.
- D29 and N1075: none of the module's words is a screen, and `words.json` keys only R33's and R32's sentences, read by key already. Nothing to do.

How the reading set was read (K3271, §17): requirements `build/requirements/duties.md` whole (31 KB); the plan's T49 entries, rules 2 and 6 and the L5 line; BOB's START notes; `src/duties/checks.mjs`, `vocab.mjs`, `schema.mjs` and `index.mjs` (1,911 lines) whole, read by me. `t48-reasons.test.mjs` read whole; the other duties tests and `notice-producers` (consumer of `reason.says`) were run, not read. No helpers were used. I did not find a separate layer-5 contract in `build/layers.md` by my search; if one exists, it was not read.

Deferred: none.

Tests:
- `node --test test/m/duties/*.test.mjs` (in bio-plane): 74 pass, 0 fail (includes t48-reasons, 9/9, which was 8/9 before the change).
- `node --test test/m/notice-producers/*.test.mjs` (consumer of `reason.says`): 118 pass, 0 fail.

Process checks (from civicos-process):
- format: 170 modules, 169 requirement files, 0 failures.
- architecture (duties): 15 files, 0 failures. Over the whole product: 3348 files, 0 failures.
- coverage (duties): 33 of 33 live ids named, 0 failures.
- ownership (duties, tranche/T49): 1 file changed, 0 failures.
- `checks/run.mjs` over the product: format, architecture and channels 0 failures. Coverage fails for 19 ids in other modules (screens-action, screens-daily, screens-entry, screens-inquiry, screens-intake, screens-investigate, screens-publish, screens-settings, setup-words, site). None is duties.

Reports for BOB (see the REPORT entry): the generated plane bundle is stale from my change; the T48 suggestions text in duties.md now names interim words the file has replaced.

Size (session_019tEq7UTq8AyLVmuzhLiapk): test runs 3, module lines 2242
