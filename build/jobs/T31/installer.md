# installer (T31)

**Status** · session_01Ex7oYmPtwwinSZN6zJhg1w · depth 2 · WORKING · handled B0

## Entries applied

- **N538, R22** (DEC-124): `newgroup/src/ui.mjs`'s `PRODUCT` is `Civicsmith` and is now the one place the name is written: the install and update pages' titles, descriptions, eyebrows and prose, and `index.mjs`'s progress shell, refusal pages, the one-copy refusal, the limits refusals, the release fallback line and `NO_KEY` all read it (`index.mjs` imports it). `PUBLISHER` reads "This installer is run by the publisher of Civicsmith releases." The invitation page (`bio-plane/public/newgroup/index.html`) names Civicsmith in its title, description, eyebrow and prose (10 occurrences). Believe in Oakland stays named on no page; the installer's own address (`newgroup.believeinoakland.workers.dev`) is unchanged. `newgroup/dist/newgroup.bundled.mjs` rebuilt (`npm run build`); `src/release.mjs` unchanged (the embed is idempotent; it carries plane 0.79.0's own strings until the next signed release, as B1 says).
- **N528, R35** (DEC-122 (3)): the invitation page's Google Fonts head (two `preconnect` links and the stylesheet) is removed, and its stacks are the Worker's own system stacks (`--body` and `--mono` equal to `PAGE_CSS`'s, `--display` Georgia); the Fraunces-only `font-variation-settings` went with them. The Worker's own pages already loaded nothing from elsewhere; now a test says so.

## Deferred

None. R13 and R24 stay unmet (dependency not yet built, A22, A23); their todos stay. The `*(not yet met: T31)*` marks on R22 and R35 in `build/requirements/installer.md` are BOB's to strike.

## Found in other modules

None. `newgroup/dist/newgroup.bundled.mjs` (mine) is rebuilt and fresh. Noted, not a flaw: `newgroup/src/release.mjs` (generated from a signed release, not in the manifest's generated-artifacts table) still embeds plane 0.79.0 with its `CivicOS` strings; none reaches a page the installer renders. The N538 draft's §5 recommends listing it in the manifest's table as "at a release"; that table is BOB's.

## Tests and checks

- `node --test newgroup/test/requirements.test.mjs`: tests 35, pass 33, fail 0, todo 2 (R13, R24); baseline 32 pass, 2 todo (R35 new). R22 rewritten: every page names Civicsmith, the publisher line literally, never the old name (over every page the suite renders), no Believe in Oakland but the address. R35 new: over every page served or streamed in the suite (raw and as read) and the invitation page, no `src`, `srcset`, `poster`, `data`, `background`, non-link `href`, `@import`, `url()`, `fetch` or `import()` names another origin; no `@font-face`; the invitation page's stacks are the Worker's; links stay. The reader is itself checked against each kind of outside load (the old Google Fonts head among them) and against links and same-origin loads.
- Negative control: the invitation page restored to `tranche/T31`'s → R22 and R35 fail, 31 pass; restored, 33 pass.
- `npm test` in `newgroup/`: embed 23/0, wizard 207/0, requirements 33 pass, 0 fail, 2 todo.
- `node bio-plane/test/system/newgroup-bundle-fresh.test.mjs`: 4 passed, 0 failed. `node --test bio-plane/test/system/fleetbundles.test.mjs`: pass 1, fail 0, skipped 0.
- No layer tests are named in the manifest; no provided service changed (no other module's tests read these pages).
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs bio installer`: 0 failures. `checks/coverage.mjs bio installer`: 35 of 35 live ids named, 0 failures. `checks/ownership.mjs bio installer tranche/T31`: 6 files, 0 failures.

Size (session_01Ex7oYmPtwwinSZN6zJhg1w): test runs 6, module lines 2023
