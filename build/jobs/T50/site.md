# site (T50)

**Status** · session_01SZFkuRbesMACkG3pVPf1q4 · depth 2 · WORKING · handled B1

## J1 · COMPLETE

Entries applied (T50-37): R13 (the empty state draws lede, none sentence and the listing rule; no row, no listing note), R14 (`joinPlaces`, DEC-247 (3) join; `screen.site.steps.name.noplace` drawn when no profile is ready; `placesReady` now returns "" instead of throwing), R15 (rule note and details in both states, already drawn by the design at the commit; tests added), R16 (`SITE_COMMIT` = `7be06eb4cb`; `pages.mjs` regenerated in "team" words; `site/build.mjs --check` fresh, clearing rule 5 (13)). New test ids R13, R14, R15, R16 each have a test and a control.
Red, by name: `R16: SITE_COMMIT is interface-assets' ASSETS_COMMIT` fails because `ASSETS_COMMIT` is still `f498560a37` on `tranche/T50` and on `job/T50/interface-assets` (505f190715). It turns green when interface-assets' job moves it to `7be06eb4cb` (merge order puts it before site). Nothing in my module to change.
Deferred: none. Found in another module: none.
Tests: `node --test site/test/` 35 tests, 34 pass, 1 fail (the one above); browser pairs at 1280 and 390 px pass.
Checks: format 171 modules, 170 requirements files; 0 failures · architecture 9 product files, 10 relative imports; 0 failures · coverage 1 modules, 16 of 16 live requirement ids named by a test; 0 failures · ownership 4 files changed by site; 0 failures · `node site/build.mjs --check` fresh.
Size (session_01SZFkuRbesMACkG3pVPf1q4): test runs 4, module lines 468
