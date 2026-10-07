# content (T35)

**Status** · session_01GAiJw8zvm2zqiaKruewFW7 · depth 2 · WORKING · handled B1

## Completion (T35-26)

**Entries applied.** T35-26, the DEC-149 sweep's six rows (BOB's START rule: field and identifier names stay; "the plane" and "the instance" go; member-facing text says "your group's Civicsmith" or names the thing). Where the sentence is about what the software cannot yet do, the name is dropped (DEC-149: "where 'Civicsmith' could mean the software, the sentence is reworded"); where it is about this installation, it says "your group's Civicsmith":
- `extent-core.mjs`:281 (now :283), C-45.4's detail: "Nothing produces a dom address yet (CONTENT-HTML), …".
- `extent-core.mjs`:291 (now :293), C-45.3's unlanded-kind detail: "… is named in the grammar and what it covers cannot yet be evaluated, so it mints nothing. …".
- `index.mjs`:758, R21's `why`: "what a <kind> extent covers cannot yet be evaluated, so …".
- `index.mjs`:989, C-52.5's detail: "<part> is a part no typing can be checked against — …".
- `index.mjs`:1404–1405, R32's `CROP_NO_EVIDENCE_STORE` detail: "your group's Civicsmith has no evidence store set up, so the capture's bytes cannot be read and no crop was made. That is a fact about how your group's Civicsmith is set up, not about the image".
Codes, checks and translations unchanged, so no check row awaits stamp. The sweep's four X rows (`checks.mjs`:61, `index.mjs`:472, :954, `schema.mjs`:93) stay, and so do the code comments still saying "this plane"/"this instance" (X: comments). `extent-core.mjs`' header now says these two details were reworded under DEC-149 (J1 states my reading of R48's "unchanged"; applied on that reading, the answer not yet in).

**Tests.** New `bio-plane/test/m/content/words.test.mjs`: one test per row (titles R1 ×2, R21, R23, R32, each naming its file and line), each driving the string at the interface and holding the full new sentence and the absence of plane/instance/copy/server, with code, check and translation unchanged. The :291 arm is unreachable through text-chain's table today (every kind has landed, its R92), so its test adds one unlanded kind to `textchain.mjs`' `CONTENT_EXTENT_KINDS` for the test and removes it after. `reads.test.mjs`:89's R21 match follows the new wording (`/cannot yet be evaluated/`).

**Deferred.** None.

**Found in other modules / stale artifacts (REPORT J2).** (1) The plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (bundler's generated artifact, §14) embeds content's old sentences (:35932, :35943, :48778 and the crop detail); my change made it stale; it is regenerated at L4's close. (2) Not mine and already in the sweep: extraction `index.mjs`:1212 and reading-pipeline `index.mjs`:945 ("this instance has no evidence store bound"), T35-25 and T35-24. (3) calculations `index.mjs`:328 says "your group's Civicsmith has no evidence store bound"; the sweep's rule says "set up" where "bound" was the only binding word (calculations is L5, not in the sweep: a wording note for BOB).

**Ran.** `node --test bio-plane/test/m/content/`: tests 131, pass 131, fail 0. Layer tests: none named in `build/manifest.md`. No provided service changed (wording only). Checks (civicos-process): `format.mjs`: 129 modules, 128 requirements files; 0 failures. `architecture.mjs … content`: 24 product files, 72 relative imports; 0 failures. `coverage.mjs … content`: 55 of 55 live requirement ids named by a test; 0 failures. `ownership.mjs … content tranche/T35`: 0 failures.

Size (session_01GAiJw8zvm2zqiaKruewFW7): test runs 1, module lines 3712

## J1 · QUESTION

R48 says the extent core (`extent-core.mjs`) is "copied from the catalogue unchanged (each answer, finding and refusal the same as the catalogue's)", and its header says the code is "the catalogue's text line for line". Two of my sweep rows (:281, :291) are `detail` sentences inside that core. My best reading, on which I am proceeding: the catalogue is deleted (T19), so R48's "the same" binds code, check, translation and which arm answers, and DEC-149 (T35-26) rewords these two details; I note the change in the file's header ("two details reworded under DEC-149, T35-26"). No requirement change needed; if you want R48's text to say so, that is yours.

Wording (your START's rule; DEC-149's "where 'Civicsmith' could mean the software, the sentence is reworded"): four of the six rows state what the software cannot yet do, so I drop the name rather than say "your group's Civicsmith": :281 "Nothing produces a dom address yet (CONTENT-HTML)"; :291 "is named in the grammar and what it covers cannot yet be evaluated"; :758 "what a <kind> extent covers cannot yet be evaluated"; :989 "is a part no typing can be checked against". The crop rows :1404–:1405 are about this installation, so they take the sweep's text: "your group's Civicsmith has no evidence store set up …" / "That is a fact about how your group's Civicsmith is set up, not about the image". Say if you want the sweep's proposed texts verbatim instead.

## J2 · REPORT

Stale artifact and two notes (record, Completion): (1) my rewording makes the plane bundle bio-plane/dist/bio-plane.bundled.mjs stale (it embeds content's old sentences at :35932, :35943, :48778 and the crop detail); bundler's to regenerate at L4's close (§14). (2) extraction index.mjs:1212 and reading-pipeline index.mjs:945 still say 'this instance has no evidence store bound': already their sweep rows (T35-25, T35-24). (3) calculations index.mjs:328 (L5, not in the sweep) says 'your group's Civicsmith has no evidence store bound'; the sweep's rule says 'set up' where 'bound' is the only binding word.
