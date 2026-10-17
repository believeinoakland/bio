# DEC-149 grep, layers 1–7 (the L1–L7 re-sweep: N690, N691, N692; for BOB, 2026-10-06)

Scope: each L1–L7 module's `paths` in `build/modules.json` (tranche/T34 working tree), `.mjs`/`.js`/`.cjs`/`.html`; tests (each module's `tests` and any `/test/` or `.test.` file, so `test-support` is out whole), `dist/`, `node_modules/` and `vendor/` left out. String literals concatenated with `+` across lines are joined before matching; template literals are read whole, `${…}` held as a placeholder; `//` and `/* */` comments are dropped, and SQL `--` comments inside schema templates are excluded as comments. `bio-plane/src/sign-release.html` is read line by line outside HTML comments, and the JS comments in its script are excluded by hand. Pattern (as T34's): "this/the/your/your own/your group's/our/its" + ("Civicsmith" or "group's")? + instance/copy/plane, and "server(s)", case-insensitive. One row per source line holding a match (a string spanning several lines can give several rows; a phrase split across lines is listed at the line it starts on, or as a range). A plain line grep was run as a cross-check: every extra line it found is a comment or code.

Classes: **M** member- or founder-facing (a check's `translation`, a refusal's `why`/`detail`/`note`/`says`/`basis` a member can read, page text, trace notes) — owed; **M?** member-facing by reading but in a module whose other text BOB ruled not member-facing (T34-86) — BOB to confirm; **P** public-reader-facing (a doorbell knocker: no credential, not a member, so DEC-149's letter does not reach it, but the same voice is owed by BOB's call; proposed text says "this group's", not "your group's"); **X** excluded, with the reason.

Rule for X (not member-facing, stays): comments (code, SQL and the page's script comments); identifiers and constants' names; developer errors (`throw new Error`, build faults raised as errors); operator script output (deploy/build tooling `console`); text addressed to the model, an agent or an operator (agent-harness, agent-model, agent-runner, agent-worker op `why`s and run traces, skill doctrine and pack, ai-runs' principal note, run-rules' deployment record); text naming ops, ids, fields or bindings (`op=…`, `bundleId`, `R2`, `RENDERER`, `OCR_WORKER`); the control plane's stamp named to a caller with none ("this call carries nobody. The plane stamps …"); generated copies (`signpage.mjs`, embedded from `sign-release.html`); and other word senses — "instance" as an occurrence of a recurrence or an instance of a progression, "copy" as a document's copy, "server" as a website's or HTTP server.

Proposed text: "this instance/copy/plane", "the instance/plane" become "your group's Civicsmith" ("in your group's Civicsmith" for "on/in this instance"); "whoever runs/hosts this instance/copy" becomes "whoever hosts your group's Civicsmith"; a possessive ("this instance's key") is turned round ("the key of your group's Civicsmith") rather than doubled; where the name adds nothing it is dropped ("the plane's inference from position" → "an inference from position"; "stamped by the plane from the signed-in session" → "taken from the signed-in session"). "bound" for a key or store is said "set" / "set up" where it was the only binding word. The wording is BOB's to take or change; each check row whose translation moves is named in the C-id column and then awaits stamp.

## Per module

| L | module | M | P | X | check rows whose wording moves (await stamp) |
|---|---|---|---|---|---|
| 1 | bundler | 0 | 0 | 15 | — |
| 1 | civil-time | 3 | 0 | 1 | — |
| 1 | runtime-limits | 1 | 0 | 0 | — |
| 1 | sheet-worker | 0 | 0 | 3 | — |
| 1 | signatures | 11 | 0 | 7 | — |
| 1 | site-profiles | 0 | 0 | 1 | — |
| 2 | credentials | 17 | 0 | 5 | C-29.1, C-29.3, C-29.5, C-29.22, C-63.1, C-63.2 |
| 2 | membership | 11 | 0 | 1 | C-55.1, C-96.11, C-102.11, C-102.12 |
| 2 | promotion | 15 | 0 | 5 | C-64.1, C-86.3, C-102.4, C-102.5, C-102.6, C-102.7, C-102.8 |
| 2 | record-core | 26 | 0 | 3 | C-59.6, C-59.7, C-59.8, C-59.9, C-102.1, C-102.2, C-102.13, C-102.14, C-102.15, C-102.16, C-102.17, C-102.18, C-102.19, C-102.20, C-102.21, C-102.22, C-102.23, C-102.24, C-102.25, C-102.26, C-102.27 |
| 3 | acquisition | 18 | 0 | 2 | C-28.13, C-48.1, C-48.4, C-48.7, C-68.1, C-83.1, C-83.3, C-83.4, C-83.5, C-83.8, C-128.1 |
| 3 | attestation | 9 | 0 | 2 | C-89.1 |
| 3 | capture | 6 | 5 | 6 | C-85.3, C-85.4 |
| 3 | capture-sources | 19 | 0 | 0 | C-105.8 |
| 3 | host-governor | 1 | 0 | 1 | — |
| 3 | provenance | 7 | 0 | 6 | C-103.7 |
| 3 | provenance-routes | 0 | 0 | 5 | — |
| 4 | calibration | 7 | 0 | 3 | — |
| 4 | content | 6 | 0 | 4 | — |
| 4 | extraction | 7 | 0 | 6 | C-51.1, C-51.4 |
| 4 | reading-pipeline | 2 | 0 | 1 | — |
| 5 | bias | 2 | 0 | 3 | — |
| 5 | connections | 2 | 0 | 7 | — |
| 5 | observation-log | 4 | 0 | 6 | — |
| 5 | progressions | 0 | 0 | 12 | — |
| 5 | retrieval | 0 | 0 | 1 | — |
| 5 | standards | 2 | 0 | 5 | — |
| 5 | workbooks | 2 | 0 | 0 | — |
| 6 | agent-harness | 0 | 0 | 7 | — |
| 6 | agent-model | 0 | 0 | 3 | — |
| 6 | agent-runner | 0 | 0 | 1 | — |
| 6 | agent-worker | 7 | 0 | 35 | — |
| 6 | ai-runs | 1 | 0 | 9 | — |
| 6 | answers | 5 | 0 | 0 | C-135.6, C-135.8 |
| 6 | basis-versions | 0 | 0 | 2 | — |
| 6 | capture-requests | 8 | 0 | 6 | — |
| 6 | citation | 1 | 0 | 0 | — |
| 6 | contradiction | 0 | 0 | 1 | — |
| 6 | inquiry | 0 | 0 | 2 | — |
| 6 | run-productions | 0 | 0 | 3 | — |
| 6 | run-rules | 0 | 0 | 5 | — |
| 6 | skills | 0 | 0 | 21 | — |
| 7 | intent | 1 | 0 | 3 | C-111.24 |
| 7 | reevaluation | 1 | 0 | 0 | C-110.1 |
| | **total** | **202** | **5** | **209** | **60 rows** |

M counts include the 7 M? rows (agent-worker). Modules with M or P rows: 29; rows to change: 207.

## Rows to change (M, M? and P)

| module | file:line | C-id | class | current text | proposed text |
|---|---|---|---|---|---|
| civil-time | `bio-plane/src/civil-time/calendar.mjs:78` | — | M | "is disputed on this instance" / `cannot be read on this instance${…}` | "is disputed in your group's Civicsmith" / `cannot be read in your group's Civicsmith${…}` |
| civil-time | `bio-plane/src/civil-time/calendar.mjs:112` | — | M | `counted on a correction that governs on this instance, now ${r.status}…` | `counted on a correction that governs in your group's Civicsmith, now ${r.status}…` |
| civil-time | `bio-plane/src/civil-time/calendar.mjs:113` | — | M | `counted on a calendar corrected on this instance${…}` | `counted on a calendar corrected in your group's Civicsmith${…}` |
| runtime-limits | `bio-plane/src/tokens.mjs:62` | — | M | "This group's copy holds no Claude account, and none can be set for it: …" | "Your group's Civicsmith holds no Claude account, and none can be set for it: …" |
| signatures | `bio-plane/src/sign-release.html:146` | — | M | Copy the record id and its current hash from the instance page. | Copy the record id and its current hash from its page in your group's Civicsmith. |
| signatures | `bio-plane/src/sign-release.html:164` | — | M | Copy the notice id, its revision number and its hash from the instance page. | Copy the notice id, its revision number and its hash from its page in your group's Civicsmith. |
| signatures | `bio-plane/src/sign-release.html:185` | — | M | Copy the case id, the entry number and the entry hash from the instance page. | Copy the case id, the entry number and the entry hash from its page in your group's Civicsmith. |
| signatures | `bio-plane/src/sign-release.html:456` | — | M | "Signature: paste this into the ratify box on the instance page" | "Signature: paste this into the ratify box in your group's Civicsmith" |
| signatures | `bio-plane/src/sign-release.html:458` | — | M | you submit it, the instance refuses this signature and you sign the new hash. | you submit it, your group's Civicsmith refuses this signature and you sign the new hash. |
| signatures | `bio-plane/src/sign-release.html:472` | — | M | Paste the notice id, as the instance page shows it. | Paste the notice id, as your group's Civicsmith shows it. |
| signatures | `bio-plane/src/sign-release.html:479` | — | M | "Signature: paste this into the notice box on the instance page" | "Signature: paste this into the notice box in your group's Civicsmith" |
| signatures | `bio-plane/src/sign-release.html:481` | — | M | you post it, the instance refuses this signature and you sign the new hash. | you post it, your group's Civicsmith refuses this signature and you sign the new hash. |
| signatures | `bio-plane/src/sign-release.html:491` | — | M | Paste the case id, as the instance page shows it. | Paste the case id, as your group's Civicsmith shows it. |
| signatures | `bio-plane/src/sign-release.html:498` | — | M | "Signature: paste this into the docket box on the instance page" | "Signature: paste this into the docket box in your group's Civicsmith" |
| signatures | `bio-plane/src/sign-release.html:500` | — | M | you post it, the instance refuses this signature and you prepare and sign it again. | you post it, your group's Civicsmith refuses this signature and you prepare and sign it again. |
| credentials | `bio-plane/src/credentials/checks.mjs:21` | C-63.1 | M | until then this instance would refuse anything signed with it | until then your group's Civicsmith would refuse anything signed with it |
| credentials | `bio-plane/src/credentials/checks.mjs:27` | C-63.2 | M | so this instance would refuse anything signed with their key | so your group's Civicsmith would refuse anything signed with their key |
| credentials | `bio-plane/src/credentials/checks.mjs:39` | C-29.1 | M | Only a named person signed in to this instance can create an agent credential. | Only a named person signed in to your group's Civicsmith can create an agent credential. |
| credentials | `bio-plane/src/credentials/checks.mjs:53` | C-29.3 | M | That name already belongs to an agent credential on this instance. | That name already belongs to an agent credential in your group's Civicsmith. |
| credentials | `bio-plane/src/credentials/checks.mjs:66` | C-29.5 | M | There is no agent credential by that name on this instance, so nothing was … | There is no agent credential by that name in your group's Civicsmith, so nothing was … |
| credentials | `bio-plane/src/credentials/checks.mjs:153` | C-29.22 | M | This copy cannot keep a key sealed right now, because its sealing secret is not set or has changed. | Your group's Civicsmith cannot keep a key sealed right now, because its sealing secret is not set or has changed. |
| credentials | `bio-plane/src/credentials/checks.mjs:154` | C-29.22 | M | Ask whoever hosts this copy to set it. | Ask whoever hosts your group's Civicsmith to set it. |
| credentials | `bio-plane/src/credentials/index.mjs:231` | — | M | Either this instance holds no active credential under that role | Either your group's Civicsmith holds no active credential under that role |
| credentials | `bio-plane/src/credentials/index.mjs:237` | — | M | … which roles hold a credential on this instance. | … which roles hold a credential in your group's Civicsmith. |
| credentials | `bio-plane/src/credentials/index.mjs:342` | — | M | one this instance would refuse. Nothing was written. | one your group's Civicsmith would refuse. Nothing was written. |
| credentials | `bio-plane/src/credentials/index.mjs:588` | — | M | `'${id}' already names a credential on this instance.` | `'${id}' already names a credential in your group's Civicsmith.` |
| credentials | `bio-plane/src/credentials/index.mjs:631` | — | M | `no credential on this instance is called '${id}'.` | `no credential in your group's Civicsmith is called '${id}'.` |
| credentials | `bio-plane/src/credentials/index.mjs:794` | — | M | this copy has no seal secret bound, so a key cannot be kept sealed or read. | your group's Civicsmith has no seal secret set, so a key cannot be kept sealed or read. |
| credentials | `bio-plane/src/credentials/index.mjs:822` | — | M | `the kinds this copy holds are ${…}.` | `the kinds your group's Civicsmith holds are ${…}.` |
| credentials | `bio-plane/src/credentials/index.mjs:880` | — | M | the reference does not open under this copy's seal secret, which has changed | the reference does not open under the seal secret of your group's Civicsmith, which has changed |
| credentials | `bio-plane/src/credentials/index.mjs:1060` | — | M | the group's key does not open under this copy's seal secret, which has changed | the group's key does not open under the seal secret of your group's Civicsmith, which has changed |
| credentials | `bio-plane/src/credentials/index.mjs:1243` | — | M | the key does not open under this copy's seal secret, which has changed | the key does not open under the seal secret of your group's Civicsmith, which has changed |
| membership | `bio-plane/src/membership/checks.mjs:72` | C-102.11 | M | A part of this instance tried to register a listener … | A part of your group's Civicsmith tried to register a listener … |
| membership | `bio-plane/src/membership/checks.mjs:73` | C-102.11 | M | This is a fault in how the instance was built, not in the record | This is a fault in how your group's Civicsmith was built, not in the record |
| membership | `bio-plane/src/membership/checks.mjs:78` | C-102.12 | M | A part of this instance tried to register a listener it had already registered | A part of your group's Civicsmith tried to register a listener it had already registered |
| membership | `bio-plane/src/membership/checks.mjs:80` | C-102.12 | M | fault in how the instance was built, not in the record | fault in how your group's Civicsmith was built, not in the record |
| membership | `bio-plane/src/membership/checks.mjs:236` | C-55.1 | M | `admin` is the name this instance gives its founding administrator | `admin` is the name your group's Civicsmith gives its founding administrator |
| membership | `bio-plane/src/membership/checks.mjs:318` | C-96.11 | M | This records who holds access to the hosting account the group's instance runs in | This records who holds access to the hosting account your group's Civicsmith runs in |
| membership | `bio-plane/src/membership/index.mjs:139` | — | M | `… is an administrator's act (…), and the plane stamps who is asking from the signed-in session` | `… is an administrator's act (…), and your group's Civicsmith takes who is asking from the signed-in session` |
| membership | `bio-plane/src/membership/index.mjs:801` | — | M | Being a registered signer of this instance is not authority over a project. | Being a registered signer in your group's Civicsmith is not authority over a project. |
| membership | `bio-plane/src/membership/index.mjs:2246` | — | M | because the instance runs in somebody's hosting account | because your group's Civicsmith runs in somebody's hosting account |
| membership | `bio-plane/src/membership/index.mjs:2323` | — | M | `'${ROOT_ADMIN}' names this instance's founding administrator` | `'${ROOT_ADMIN}' names the founding administrator of your group's Civicsmith` |
| membership | `bio-plane/src/membership/index.mjs:2963` | — | M | "Your group's copy keeps this from the public and the people the group looks into." | "Your group's Civicsmith keeps this from the public and the people the group looks into." |
| promotion | `bio-plane/src/gate.mjs:972` | — | M | `registered capture is held only in parts: this plane's acquisition receipt names the whole hash` | `registered capture is held only in parts: the acquisition receipt of your group's Civicsmith names the whole hash` |
| promotion | `bio-plane/src/promotion/checks.mjs:165` | C-86.3 | M | names are held unique across the instance | names are held unique across your group's Civicsmith |
| promotion | `bio-plane/src/promotion/checks.mjs:290` | C-64.1 | M | This copy has not recorded which group it belongs to | Your group's Civicsmith has not recorded which group it belongs to |
| promotion | `bio-plane/src/promotion/checks.mjs:291` | C-64.1 | M | A copy records its group once: when it is first installed, … | It records its group once: when it is first installed, … (same row; "A copy" is outside the grep pattern, read with the row) |
| promotion | `bio-plane/src/promotion/checks.mjs:336` | C-102.4 | M | No part of this instance answers that question yet | No part of your group's Civicsmith answers that question yet |
| promotion | `bio-plane/src/promotion/checks.mjs:342` | C-102.5 | M | The part of this instance that answers that question stopped with an error | The part of your group's Civicsmith that answers that question stopped with an error |
| promotion | `bio-plane/src/promotion/checks.mjs:349` | C-102.6 | M | A part of this instance tried to offer an answer to a question … | A part of your group's Civicsmith tried to offer an answer to a question … |
| promotion | `bio-plane/src/promotion/checks.mjs:350` | C-102.6 | M | This is a fault in how the instance was built, | This is a fault in how your group's Civicsmith was built, |
| promotion | `bio-plane/src/promotion/checks.mjs:356` | C-102.7 | M | A part of this instance tried to add its own check to every promotion … | A part of your group's Civicsmith tried to add its own check to every promotion … |
| promotion | `bio-plane/src/promotion/checks.mjs:357` | C-102.7 | M | This is a fault in how the instance was built, not in the record | This is a fault in how your group's Civicsmith was built, not in the record |
| promotion | `bio-plane/src/promotion/checks.mjs:363` | C-102.8 | M | A part of this instance tried to register something it had already registered | A part of your group's Civicsmith tried to register something it had already registered |
| promotion | `bio-plane/src/promotion/checks.mjs:365` | C-102.8 | M | This is a fault in how the instance was built, not in the record, … | This is a fault in how your group's Civicsmith was built, not in the record, … |
| promotion | `bio-plane/src/promotion/index.mjs:169` | — | M | a project by that name already exists on this instance, compared without regard to case or spacing. | a project by that name already exists in your group's Civicsmith, compared without regard to case or spacing. |
| promotion | `bio-plane/src/promotion/index.mjs:624` | — | M | a project needs a name, and it must be unique across this instance | a project needs a name, and it must be unique across your group's Civicsmith |
| promotion | `bio-plane/src/promotion/names.mjs:84` | — | M | give the project a title unique across the instance | give the project a title unique across your group's Civicsmith |
| record-core | `bio-plane/src/record-core/checks.mjs:33` | C-102.1, .2, .15–.24, .26, .27; C-59.7, C-59.9 (via BUILD_FAULT) | M | BUILD_FAULT = 'This is a fault in how the instance was built, not in the record, and nothing in the record changed.' | BUILD_FAULT = 'This is a fault in how your group's Civicsmith was built, not in the record, and nothing in the record changed.' |
| record-core | `bio-plane/src/record-core/checks.mjs:38` | C-59.6 | M | The plane could not find a free identifier for this | Your group's Civicsmith could not find a free identifier for this |
| record-core | `bio-plane/src/record-core/checks.mjs:40–41` | C-59.6 | M | if it keeps happening, tell whoever runs this instance. | if it keeps happening, tell whoever hosts your group's Civicsmith. |
| record-core | `bio-plane/src/record-core/checks.mjs:45` | C-102.13 | M | A part of this instance tried to report a figure another part already reports | A part of your group's Civicsmith tried to report a figure another part already reports |
| record-core | `bio-plane/src/record-core/checks.mjs:46–47` | C-102.13 | M | This is a fault in how the instance was built | This is a fault in how your group's Civicsmith was built |
| record-core | `bio-plane/src/record-core/checks.mjs:51` | C-102.14 | M | A part of this instance tried to register its figures without naming itself | A part of your group's Civicsmith tried to register its figures without naming itself |
| record-core | `bio-plane/src/record-core/checks.mjs:52` | C-102.14 | M | This is a fault in how the instance was built, not in the … | This is a fault in how your group's Civicsmith was built, not in the … |
| record-core | `bio-plane/src/record-core/checks.mjs:65` | C-102.1 | M | A part of this instance tried to register its audit check a second time. | A part of your group's Civicsmith tried to register its audit check a second time. |
| record-core | `bio-plane/src/record-core/checks.mjs:70` | C-102.2 | M | A part of this instance tried to register an audit check without naming itself | A part of your group's Civicsmith tried to register an audit check without naming itself |
| record-core | `bio-plane/src/record-core/checks.mjs:82` | C-102.15 | M | A part of this instance tried to register a document grammar a second time | A part of your group's Civicsmith tried to register a document grammar a second time |
| record-core | `bio-plane/src/record-core/checks.mjs:88` | C-102.16 | M | A part of this instance tried to register a document grammar without naming itself | A part of your group's Civicsmith tried to register a document grammar without naming itself |
| record-core | `bio-plane/src/record-core/checks.mjs:95` | C-102.17 | M | A part of this instance tried to supply the instance's figures when another part already supplies them | A part of your group's Civicsmith tried to supply its figures when another part already supplies them |
| record-core | `bio-plane/src/record-core/checks.mjs:100` | C-102.18 | M | A part of this instance tried to supply the instance's figures without naming itself | A part of your group's Civicsmith tried to supply its figures without naming itself |
| record-core | `bio-plane/src/record-core/checks.mjs:107` | C-59.7 | M | A part of this instance tried to reserve an identifier without giving one | A part of your group's Civicsmith tried to reserve an identifier without giving one |
| record-core | `bio-plane/src/record-core/checks.mjs:114` | C-59.8 | M | if it keeps happening, tell whoever runs this instance. | if it keeps happening, tell whoever hosts your group's Civicsmith. |
| record-core | `bio-plane/src/record-core/checks.mjs:118` | C-59.9 | M | A part of this instance tried to reserve an identifier outside the change that would use it | A part of your group's Civicsmith tried to reserve an identifier outside the change that would use it |
| record-core | `bio-plane/src/record-core/checks.mjs:124` | C-102.19 | M | A part of this instance tried to name the identifiers it holds a second time | A part of your group's Civicsmith tried to name the identifiers it holds a second time |
| record-core | `bio-plane/src/record-core/checks.mjs:129` | C-102.20 | M | A part of this instance tried to name the identifiers it holds without naming itself | A part of your group's Civicsmith tried to name the identifiers it holds without naming itself |
| record-core | `bio-plane/src/record-core/checks.mjs:135` | C-102.21 | M | A part of this instance tried to declare a table without saying how it is purged, … | A part of your group's Civicsmith tried to declare a table without saying how it is purged, … |
| record-core | `bio-plane/src/record-core/checks.mjs:140` | C-102.22 | M | A part of this instance tried to declare a table with a class the record does not know | A part of your group's Civicsmith tried to declare a table with a class the record does not know |
| record-core | `bio-plane/src/record-core/checks.mjs:146` | C-102.26 | M | A part of this instance tried to declare a table whose name, … | A part of your group's Civicsmith tried to declare a table whose name, … |
| record-core | `bio-plane/src/record-core/checks.mjs:151` | C-102.27 | M | A part of this instance tried to declare a table that is already declared | A part of your group's Civicsmith tried to declare a table that is already declared |
| record-core | `bio-plane/src/record-core/checks.mjs:157` | C-102.23 | M | A part of this instance tried to register the checks of a table that already has them | A part of your group's Civicsmith tried to register the checks of a table that already has them |
| record-core | `bio-plane/src/record-core/checks.mjs:162` | C-102.24 | M | A part of this instance tried to register or run the checks of a table without naming itself | A part of your group's Civicsmith tried to register or run the checks of a table without naming itself |
| record-core | `bio-plane/src/record-core/checks.mjs:169` | C-102.25 | M | If it keeps happening, tell whoever runs this instance. | If it keeps happening, tell whoever hosts your group's Civicsmith. |
| record-core | `bio-plane/src/record-core/index.mjs:129` | — | M | `the plane could not find a free ${what}id: every one it drew was already taken.` | `your group's Civicsmith could not find a free ${what}id: every one it drew was already taken.` |
| acquisition | `bio-plane/src/acquisition/checks.mjs:45` | C-28.13 | M | Only this instance's own background worker fetches documents | Only the background worker of your group's Civicsmith fetches documents |
| acquisition | `bio-plane/src/acquisition/checks.mjs:66` | C-83.1 | M | a rendered capture in a form this instance does not recognise | a rendered capture in a form your group's Civicsmith does not recognise |
| acquisition | `bio-plane/src/acquisition/checks.mjs:84` | C-83.3 | M | This instance has no working page renderer | Your group's Civicsmith has no working page renderer |
| acquisition | `bio-plane/src/acquisition/checks.mjs:94` | C-83.4 | M | held by renders this instance is running right now | held by renders your group's Civicsmith is running right now |
| acquisition | `bio-plane/src/acquisition/checks.mjs:103` | C-83.5 | M | This instance is giving that website a rest after it asked us to slow down | Your group's Civicsmith is giving that website a rest after it asked us to slow down |
| acquisition | `bio-plane/src/acquisition/checks.mjs:131` | C-83.8 | M | This instance is already rendering as many pages at once as it allows | Your group's Civicsmith is already rendering as many pages at once as it allows |
| acquisition | `bio-plane/src/acquisition/checks.mjs:155` | C-48.1 | M | Those are facts this instance establishes by doing the fetch itself | Those are facts your group's Civicsmith establishes by doing the fetch itself |
| acquisition | `bio-plane/src/acquisition/checks.mjs:183` | C-48.4 | M | a Google Drive address in a form this instance does not recognise | a Google Drive address in a form your group's Civicsmith does not recognise |
| acquisition | `bio-plane/src/acquisition/checks.mjs:212` | C-48.7 | M | This instance checks the bytes rather than taking the label | Your group's Civicsmith checks the bytes rather than taking the label |
| acquisition | `bio-plane/src/acquisition/checks.mjs:226` | C-68.1 | M | This copy was installed without the storage it keeps captured documents in | Your group's Civicsmith was installed without the storage it keeps captured documents in |
| acquisition | `bio-plane/src/acquisition/checks.mjs:227` | C-68.1 | M | That is a fact about how the copy was set up | That is a fact about how your group's Civicsmith was set up |
| acquisition | `bio-plane/src/acquisition/checks.mjs:242` | C-128.1 | M | A sweep asked this instance to fetch a document | A sweep asked your group's Civicsmith to fetch a document |
| acquisition | `bio-plane/src/acquisition/index.mjs:536` | — | M | "this instance has no evidence storage configured" | "your group's Civicsmith has no evidence storage configured" |
| acquisition | `bio-plane/src/acquisition/index.mjs:544` | — | M | this instance fetches a requested document only from inside its own drain | your group's Civicsmith fetches a requested document only from inside its own drain |
| acquisition | `bio-plane/src/acquisition/index.mjs:625` | — | M | the producer are DERIVED by this instance from the … | the producer are DERIVED by your group's Civicsmith from the … |
| acquisition | `bio-plane/src/acquisition/index.mjs:715` | — | M | `${n} renders are running on this instance, which runs at most ${cap} at once` | `${n} renders are running in your group's Civicsmith, which runs at most ${cap} at once` |
| acquisition | `bio-plane/src/acquisition/index.mjs:826` | — | M | `${exportAddress}, which this instance composed from the ${kind} …` | `${exportAddress}, which your group's Civicsmith composed from the ${kind} …` |
| acquisition | `bio-plane/src/acquisition/keyed.mjs:64` | — | M | `the keyed services this copy speaks to are ${…}; nothing was fetched` | `the keyed services your group's Civicsmith speaks to are ${…}; nothing was fetched` |
| attestation | `bio-plane/src/attestation/checks.mjs:26` | C-89.1 | M | … as one file, and this instance has no record of fetching it itself. | … as one file, and your group's Civicsmith has no record of fetching it itself. |
| attestation | `bio-plane/src/attestation/checks.mjs:27` | C-89.1 | M | A timestamp is only requested for bytes this instance can vouch for | A timestamp is only requested for bytes your group's Civicsmith can vouch for |
| attestation | `bio-plane/src/attestation/checks.mjs:29` | C-89.1 | M | If the instance fetches it from its address, it can then be co-attested. | If your group's Civicsmith fetches it from its address, it can then be co-attested. |
| attestation | `bio-plane/src/attestation/index.mjs:107` | — | M | This plane hashed the whole document as it arrived | Your group's Civicsmith hashed the whole document as it arrived |
| attestation | `bio-plane/src/attestation/index.mjs:117` | — | M | this plane holds no receipt of having acquired them | your group's Civicsmith holds no receipt of having acquired them |
| attestation | `bio-plane/src/attestation/index.mjs:124` | — | M | this plane holds no receipt of having acquired it | your group's Civicsmith holds no receipt of having acquired it |
| attestation | `bio-plane/src/attestation/index.mjs:201` | — | M | this plane obtains and stores it, and does not claim to have verified the signature. | your group's Civicsmith obtains and stores it, and does not claim to have verified the signature. |
| attestation | `bio-plane/src/attestation/index.mjs:239` | — | M | this instance holds no receipt-signing key it can read, so nothing is signed. | your group's Civicsmith holds no receipt-signing key it can read, so nothing is signed. |
| attestation | `bio-plane/src/attestation/ops.mjs:28` | — | M | "this instance has no evidence storage configured" | "your group's Civicsmith has no evidence storage configured" |
| capture | `bio-plane/src/capture/checks.mjs:131` | C-85.3 | P | The size this instance will read is published beside this message. | The size this inbox will read is published beside this message. |
| capture | `bio-plane/src/capture/checks.mjs:139` | C-85.4 | P | larger than this instance stores. That is a fact about how this group has set its instance up | larger than this inbox stores. That is a fact about how this group has set its Civicsmith up |
| capture | `bio-plane/src/capture/doorbell.mjs:24` | — | P | `at most ${n} knocks to this instance in any ${m} minutes` | `at most ${n} knocks to this group's inbox in any ${m} minutes` |
| capture | `bio-plane/src/capture/doorbell.mjs:51` | — | P | "this instance stores knocks inline; large material needs its evidence storage configured" | "this group's inbox stores knocks inline; large material needs its evidence storage configured" |
| capture | `bio-plane/src/capture/index.mjs:447` | — | M | no knock carrying a secret has been received at this instance | no knock carrying a secret has been received by your group's Civicsmith |
| capture | `bio-plane/src/capture/index.mjs:770` | — | P | this instance has no evidence storage configured, so the knock's bytes cannot be held | this group's Civicsmith has no evidence storage configured, so the knock's bytes cannot be held |
| capture | `bio-plane/src/capture/index.mjs:857` | — | M | `these bytes were received at this instance's doorbell as knock ${id}` | `these bytes were received at the doorbell of your group's Civicsmith as knock ${id}` |
| capture | `bio-plane/src/capture/index.mjs:1033` | — | M | the archived locator is not a replay this instance can read raw | the archived locator is not a replay your group's Civicsmith can read raw |
| capture | `bio-plane/src/capture/index.mjs:1045` | — | M | the replay is larger than this instance compares | the replay is larger than your group's Civicsmith compares |
| capture | `bio-plane/src/capture/index.mjs:1414` | — | M | `${running} renders are running and this instance runs at most ${capN} at once` | `${running} renders are running and your group's Civicsmith runs at most ${capN} at once` |
| capture | `bio-plane/src/capture/ops.mjs:150` | — | M | "this instance has no evidence storage configured" | "your group's Civicsmith has no evidence storage configured" |
| capture-sources | `bio-plane/src/capture-sources/credentials.mjs:60` | C-105.8 | M | No encryption key is bound to this instance, so no credential is stored or used. | No encryption key is set for your group's Civicsmith, so no credential is stored or used. |
| capture-sources | `bio-plane/src/capture-sources/credentials.mjs:268` | — | M | the supplier named is not an active member of this instance | the supplier named is not an active member of your group |
| capture-sources | `bio-plane/src/capture-sources/credentials.mjs:302` | — | M | no encryption key is bound to this instance, so nothing is stored in the clear | no encryption key is set for your group's Civicsmith, so nothing is stored in the clear |
| capture-sources | `bio-plane/src/capture-sources/credentials.mjs:360` | — | M | CAPTURE_CREDENTIAL_NO_KEY: no encryption key is bound to this instance, so no credential is used … | CAPTURE_CREDENTIAL_NO_KEY: no encryption key is set for your group's Civicsmith, so no credential is used … |
| capture-sources | `bio-plane/src/capture-sources/credentials.mjs:368` | — | M | `credential ${id} will not decrypt under this instance's key, …` | `credential ${id} will not decrypt under the key of your group's Civicsmith, …` |
| capture-sources | `bio-plane/src/capture-sources/memento.mjs:256` | — | M | `SHA-256 ${digest}, computed by this instance over the bytes it received, …` | `SHA-256 ${digest}, computed by your group's Civicsmith over the bytes it received, …` |
| capture-sources | `bio-plane/src/drive.mjs:216` | — | M | A Drive address whose shape is unread is not a document this instance can promise to have captured. | A Drive address whose shape is unread is not a document your group's Civicsmith can promise to have captured. |
| capture-sources | `bio-plane/src/drive.mjs:254` | — | M | `the export address was COMPOSED BY THIS INSTANCE from the file id and the kind carried in …` | `the export address was COMPOSED BY YOUR GROUP'S CIVICSMITH from the file id and the kind carried in …` |
| capture-sources | `bio-plane/src/drive.mjs:444` | — | M | `the plane recorded fetching the export address, but ${said}; …` | `your group's Civicsmith recorded fetching the export address, but ${said}; …` |
| capture-sources | `bio-plane/src/drive.mjs:445` | — | M | `the plane recorded fetching the export address ${…} (CAP-8), and ${said}` | `your group's Civicsmith recorded fetching the export address ${…} (CAP-8), and ${said}` |
| capture-sources | `bio-plane/src/drive.mjs:448` | — | M | `the plane recorded fetching ${fetchedAddress}, not the export, but ${said}; …` | `your group's Civicsmith recorded fetching ${fetchedAddress}, not the export, but ${said}; …` |
| capture-sources | `bio-plane/src/drive.mjs:449` | — | M | `the plane recorded fetching ${fetchedAddress}, not the export address — …` | `your group's Civicsmith recorded fetching ${fetchedAddress}, not the export address — …` |
| capture-sources | `bio-plane/src/drive.mjs:451` | — | M | `the plane recorded these bytes from BOTH the export and ${…}; …` | `your group's Civicsmith recorded these bytes from BOTH the export and ${…}; …` |
| capture-sources | `bio-plane/src/drive.mjs:454` | — | M | `…; the plane holds no retrieval record for these bytes` | `…; your group's Civicsmith holds no retrieval record for these bytes` |
| capture-sources | `bio-plane/src/drive.mjs:456` | — | M | `…; the plane holds no retrieval record for these bytes, so this rests on the register alone` | `…; your group's Civicsmith holds no retrieval record for these bytes, so this rests on the register alone` |
| capture-sources | `bio-plane/src/drive.mjs:458` | — | M | `the plane holds no direct retrieval record for these bytes and ${said}` | `your group's Civicsmith holds no direct retrieval record for these bytes and ${said}` |
| capture-sources | `bio-plane/src/render.mjs:343` | — | M | `the plane could not keep the bytes (${…})` | `your group's Civicsmith could not keep the bytes (${…})` |
| capture-sources | `bio-plane/src/render.mjs:384` | — | M | "the plane did not keep this render's subresource bytes" | "your group's Civicsmith did not keep this render's subresource bytes" |
| capture-sources | `bio-plane/src/render.mjs:480` | — | M | `… condition this plane asked for nor a timeout` | `… condition your group's Civicsmith asked for nor a timeout` |
| host-governor | `bio-plane/src/host-governor/index.mjs:44` | — | M | appetite_per_min must be a positive number, or omit it to reset to the instance default | appetite_per_min must be a positive number, or omit it to reset to your group's default |
| provenance | `bio-plane/src/provenance/checks.mjs:138` | C-103.7 | M | This instance holds no key to sign its receipts with | Your group's Civicsmith holds no key to sign its receipts with |
| provenance | `bio-plane/src/provenance/checks.mjs:139` | C-103.7 | M | Whoever runs the instance can add one. | Whoever hosts your group's Civicsmith can add one. |
| provenance | `bio-plane/src/provenance/index.mjs:899` | — | M | `this instance fetched these bytes directly from their address, …` | `your group's Civicsmith fetched these bytes directly from their address, …` |
| provenance | `bio-plane/src/provenance/index.mjs:905` | — | M | `this instance fetched these bytes only through an archive replay (${…}), …` | `your group's Civicsmith fetched these bytes only through an archive replay (${…}), …` |
| provenance | `bio-plane/src/provenance/index.mjs:923` | — | M | `… is proven by this plane's own receipt at ${r.address}` | `… is proven by the receipt your group's Civicsmith itself made at ${r.address}` |
| provenance | `bio-plane/src/provenance/index.mjs:1387` | — | M | `The author is stamped by the plane from the signed-in session.` | `The author is taken from the signed-in session, not from the request.` |
| provenance | `bio-plane/src/provenance/index.mjs:1402` | — | M | `the author of these bytes is the signed-in member the plane stamped from the session at op=testify, …` | `the author of these bytes is the signed-in member taken from the session at op=testify, …` |
| calibration | `bio-plane/src/calibration.mjs:126` | — | M | `… day(s), on this instance's own account` | `… day(s), which your group's Civicsmith runs on its own account` |
| calibration | `bio-plane/src/calibration.mjs:287` | — | M | `… so an automatic upgrade here would be the plane making a claim nobody authored (DEC-4)` | `… so an automatic upgrade here would be your group's Civicsmith making a claim nobody authored (DEC-4)` |
| calibration | `bio-plane/src/calibration/index.mjs:269` | — | M | `. No module derives obligations from calibrations in this instance, so …` | `. No module derives obligations from calibrations in your group's Civicsmith, so …` |
| calibration | `bio-plane/src/calibration/index.mjs:301` | — | M | `this instance probes ${n} engine(s) on its own account — ` | `your group's Civicsmith probes ${n} engine(s) on its own account — ` |
| calibration | `bio-plane/src/calibration/index.mjs:302` | — | M | `no engine is registered for calibration in this instance, so no probe is scheduled …` | `no engine is registered for calibration in your group's Civicsmith, so no probe is scheduled …` |
| calibration | `bio-plane/src/calibration/index.mjs:391` | — | M | `${engine} is registered for calibration in this instance.` | `${engine} is registered for calibration in your group's Civicsmith.` |
| calibration | `bio-plane/src/calibration/index.mjs:436` | — | M | `… are due a calibration probe. This plane runs no derivation engine of its own, …` | `… are due a calibration probe. Your group's Civicsmith runs no derivation engine of its own, …` |
| content | `bio-plane/src/content/extent-core.mjs:281` | — | M | `… Nothing in this plane produces a dom address yet (CONTENT-HTML), …` | `… Nothing in your group's Civicsmith produces a dom address yet (CONTENT-HTML), …` |
| content | `bio-plane/src/content/extent-core.mjs:291` | — | M | `extent kind '${kind}' (${human}) is named in the grammar and this plane cannot yet evaluate what it covers` | `extent kind '${kind}' (${human}) is named in the grammar and your group's Civicsmith cannot yet evaluate what it covers` |
| content | `bio-plane/src/content/index.mjs:758` | — | M | `this plane cannot yet evaluate what a ${kind} extent covers, …` | `your group's Civicsmith cannot yet evaluate what a ${kind} extent covers, …` |
| content | `bio-plane/src/content/index.mjs:989` | — | M | `${extent} is a part this plane cannot check a typing against — …` | `${extent} is a part your group's Civicsmith cannot check a typing against — …` |
| content | `bio-plane/src/content/index.mjs:1404` | — | M | this instance has no evidence store bound, so the capture's bytes cannot be read | your group's Civicsmith has no evidence store set up, so the capture's bytes cannot be read |
| content | `bio-plane/src/content/index.mjs:1405` | — | M | That is a fact about this instance, not about the image | That is a fact about how your group's Civicsmith is set up, not about the image |
| extraction | `bio-plane/src/extraction/checks.mjs:29` | C-51.1 | M | a re-read in a form this instance does not recognise | a re-read in a form your group's Civicsmith does not recognise |
| extraction | `bio-plane/src/extraction/checks.mjs:57` | C-51.4 | M | This instance has no OCR engine installed | Your group's Civicsmith has no OCR engine installed |
| extraction | `bio-plane/src/extraction/filemembership.mjs:119` | — | M | this pairing is the plane's inference from position, to be confirmed | this pairing is an inference from position, to be confirmed |
| extraction | `bio-plane/src/extraction/index.mjs:935` | — | M | this instance did not compose this reading: a caller carried it in | your group's Civicsmith did not compose this reading: a caller carried it in |
| extraction | `bio-plane/src/extraction/index.mjs:937` | — | M | this instance read the capture's bytes and composed this reading | your group's Civicsmith read the capture's bytes and composed this reading |
| extraction | `bio-plane/src/extraction/index.mjs:1212` | — | M | this instance has no evidence store bound, so the stored bytes cannot be read again | your group's Civicsmith has no evidence store set up, so the stored bytes cannot be read again |
| extraction | `bio-plane/src/extraction/index.mjs:1443` | — | M | what this instance's fleet can read; this one is re-read now | what your group's Civicsmith can read; this one is re-read now |
| reading-pipeline | `bio-plane/src/reading-pipeline/index.mjs:591–592` | — | M | no OCR engine is installed in this instance, so nothing is claimed about what it says | no OCR engine is installed in your group's Civicsmith, so nothing is claimed about what it says |
| reading-pipeline | `bio-plane/src/reading-pipeline/index.mjs:945` | — | M | this instance has no evidence store bound, so the capture's bytes cannot be read | your group's Civicsmith has no evidence store set up, so the capture's bytes cannot be read |
| bias | `bio-plane/src/bias/index.mjs:469–470` | — | M | a project override naming a LOCKED instance statement is a conformance error; the instance statement stands | a project override naming a LOCKED group statement is a conformance error; the group statement stands |
| bias | `bio-plane/src/bias/index.mjs:554–556` | — | M | a project statement on a subject an instance statement in force also addresses … addressing the instance statement | a project statement on a subject a group statement in force also addresses … addressing the group statement |
| connections | `bio-plane/src/connections/index.mjs:1198` | — | M | `… ${derived}, the plane's inference from position, never the publisher's own link` | `… ${derived}, an inference from position, never the publisher's own link` |
| connections | `bio-plane/src/connections/index.mjs:1296` | — | M | so this is the plane's inference, to be confirmed, never the publisher's own link | so this is an inference from position, to be confirmed, never the publisher's own link |
| observation-log | `bio-plane/src/observation-log/vocabulary.mjs:176` | — | M | plane: "the plane's own scheduler looked, with no member and no machine behind it" | plane: "the scheduler of your group's Civicsmith looked, with no member and no machine behind it" |
| observation-log | `bio-plane/src/observation-log/vocabulary.mjs:198` | — | M | objective: "a standing objective the instance is monitoring for" | objective: "a standing objective your group's Civicsmith is monitoring for" |
| observation-log | `bio-plane/src/observation-log/vocabulary.mjs:626` | — | M | this document has pages no engine bound to this instance could read | this document has pages no engine in your group's Civicsmith could read |
| observation-log | `bio-plane/src/observation-log/vocabulary.mjs:1409` | — | M | "render-deferred": "a render this instance could not do is held under its C-83 reason …" | "render-deferred": "a render your group's Civicsmith could not do is held under its C-83 reason …" |
| standards | `bio-plane/src/standards/index.mjs:203` | — | M | the instance has no active jurisdiction profile, so no source of standards is known | your group's Civicsmith has no active jurisdiction profile, so no source of standards is known |
| standards | `bio-plane/src/standards/index.mjs:206` | — | M | the instance's active jurisdiction profiles could not be combined (…) | the active jurisdiction profiles of your group's Civicsmith could not be combined (…) |
| workbooks | `bio-plane/src/workbooks/index.mjs:40` | — | M | RECOMPUTE_MEANING = "agreement between the file's engine and the instance's engine, never accuracy" | RECOMPUTE_MEANING = "agreement between the file's engine and the engine your group's Civicsmith runs, never accuracy" |
| workbooks | `bio-plane/src/workbooks/index.mjs:625` | — | M | `recomputed by the instance's engine (${engine} ${version}); open it in any spreadsheet program` | `recomputed by the engine your group's Civicsmith runs (${engine} ${version}); open it in any spreadsheet program` |
| agent-worker | `agent-worker/src/ask.mjs:158` | — | M? | the plane refused this ask under the member's grant. Its refusal is passed through exactly as the plane worded it. | the record refused this ask under the member's grant. Its refusal is passed through exactly as it was worded. |
| agent-worker | `agent-worker/src/ask.mjs:161` | — | M? | the plane could not be reached, so nothing was read and no model was called. | the record could not be reached, so nothing was read and no model was called. |
| agent-worker | `agent-worker/src/ask.mjs:177` | — | M? | the plane published no skill pack this ask can be instructed by, so no model was called | no skill pack this ask can be instructed by was published, so no model was called |
| agent-worker | `agent-worker/src/ask.mjs:280` | — | M? | the plane could not be reached to check the answer, so nothing is returned | the record could not be reached to check the answer, so nothing is returned |
| agent-worker | `agent-worker/src/ask.mjs:285` | — | M? | the plane refused to check the answer, so nothing is returned. | the record refused to check the answer, so nothing is returned. |
| agent-worker | `agent-worker/src/ask.mjs:286` | — | M? | Its refusal is passed through exactly as the plane worded it. | Its refusal is passed through exactly as it was worded. |
| agent-worker | `agent-worker/src/ask.mjs:290` | — | M? | the plane's checks answered without a checked answer, so nothing is returned | the record's checks answered without a checked answer, so nothing is returned |
| ai-runs | `bio-plane/src/ai-runs/index.mjs:895` | — | M | `the mode '${mode}' is not deployed on this instance: the modes deploy in one order, …` | `the mode '${mode}' is not deployed in your group's Civicsmith: the modes deploy in one order, …` |
| answers | `bio-plane/src/answers/checks.mjs:26` | C-135.6 | M | No rule service of that name is held in this copy. Nothing was read. | No rule service of that name is held in your group's Civicsmith. Nothing was read. |
| answers | `bio-plane/src/answers/checks.mjs:30` | C-135.8 | M | The record's rule services are switched off in this copy until the assistant's measured bar is met. | The record's rule services are switched off in your group's Civicsmith until the assistant's measured bar is met. |
| answers | `bio-plane/src/answers/index.mjs:202` | — | M | "the rule services are switched off in this copy" | "the rule services are switched off in your group's Civicsmith" |
| answers | `bio-plane/src/answers/rules.mjs:60` | — | M | "no jurisdiction profile is active in this copy" | "no jurisdiction profile is active in your group's Civicsmith" |
| answers | `bio-plane/src/answers/rules.mjs:83` | — | M | "no jurisdiction profile is active in this copy" | "no jurisdiction profile is active in your group's Civicsmith" |
| capture-requests | `bio-plane/src/capture-requests/index.mjs:255` | — | M | this address has no host this plane can read, and the per-host pacing DEC-47 requires is computed from one. | this address has no host your group's Civicsmith can read, and the per-host pacing DEC-47 requires is computed from one. |
| capture-requests | `bio-plane/src/capture-requests/index.mjs:390` | — | M | requested. This instance does not fetch on a caller's timing: the daemon drains this queue | requested. Your group's Civicsmith does not fetch on a caller's timing: the daemon drains this queue |
| capture-requests | `bio-plane/src/capture-requests/index.mjs:712` | — | M | `… is not one of the purposes this instance can truthfully name: ${…}.` | `… is not one of the purposes your group's Civicsmith can truthfully name: ${…}.` |
| capture-requests | `bio-plane/src/capture-requests/index.mjs:757` | — | M | `… because a stranger's server has no relationship with this instance.` | `… because a stranger's server has no relationship with your group's Civicsmith.` |
| capture-requests | `bio-plane/src/capture-requests/index.mjs:779` | — | M | `no scope check is registered on this instance, so nothing can say that ${name} is …` | `no scope check is registered in your group's Civicsmith, so nothing can say that ${name} is …` |
| capture-requests | `bio-plane/src/capture-requests/index.mjs:864` | — | M | "the fetch did not complete and this plane did not record why" | "the fetch did not complete and your group's Civicsmith did not record why" |
| capture-requests | `bio-plane/src/capture-requests/index.mjs:933` | — | M | "the promotion did not complete and this plane did not record why" | "the promotion did not complete and your group's Civicsmith did not record why" |
| capture-requests | `bio-plane/src/capture-requests/index.mjs:1316` | — | M | unknown: "is not a sweep this instance holds" | unknown: "is not a sweep your group's Civicsmith holds" |
| citation | `bio-plane/src/citation/index.mjs:378` | — | M | … registry, and this instance was created without them, so nothing was written. | … registry, and your group's Civicsmith was created without them, so nothing was written. |
| intent | `bio-plane/src/intent/checks.mjs:134` | C-111.24 | M | A source registers once, when the plane starts. | A source registers once, when your group's Civicsmith starts. |
| reevaluation | `bio-plane/src/reevaluation/checks.mjs:120` | C-110.1 | M | The assistant and the plane's own credentials may say a newer version exists | The assistant and the record's own machine credentials may say a newer version exists |

## Check rows awaiting stamp

- credentials: C-29.1, C-29.3, C-29.5, C-29.22, C-63.1, C-63.2
- membership: C-55.1, C-96.11, C-102.11, C-102.12
- promotion: C-64.1, C-86.3, C-102.4, C-102.5, C-102.6, C-102.7, C-102.8
- record-core: C-59.6, C-59.7, C-59.8, C-59.9, C-102.1, C-102.2, C-102.13, C-102.14, C-102.15, C-102.16, C-102.17, C-102.18, C-102.19, C-102.20, C-102.21, C-102.22, C-102.23, C-102.24, C-102.25, C-102.26, C-102.27
- acquisition: C-28.13, C-48.1, C-48.4, C-48.7, C-68.1, C-83.1, C-83.3, C-83.4, C-83.5, C-83.8, C-128.1
- attestation: C-89.1
- capture: C-85.3, C-85.4
- capture-sources: C-105.8
- provenance: C-103.7
- extraction: C-51.1, C-51.4
- answers: C-135.6, C-135.8
- intent: C-111.24
- reevaluation: C-110.1

record-core's `BUILD_FAULT` constant (`checks.mjs`:33) is appended to 16 translations (C-102.1, .2, .15–.24, .26, .27; C-59.7, C-59.9): one edit moves all 16, and C-102.13, C-102.14 spell the same sentence inline.

## Rows excluded (X)

| module | file:line | phrase | reason |
|---|---|---|---|
| bundler | `bio-plane/scripts/deploy-fleet.mjs:96` | The plane | operator script output (console, deploy/build tooling) |
| bundler | `bio-plane/scripts/deploy-fleet.mjs:184` | The instance | operator script output (console, deploy/build tooling) |
| bundler | `bio-plane/scripts/deploy.mjs:87` | the instance | operator script output (console, deploy/build tooling) |
| bundler | `bio-plane/scripts/deploy.mjs:88` | the instance | operator script output (console, deploy/build tooling) |
| bundler | `bio-plane/scripts/deploy.mjs:121` | the plane | operator script output (console, deploy/build tooling) |
| bundler | `bio-plane/scripts/deploy.mjs:263` | the plane | operator script output (console, deploy/build tooling) |
| bundler | `bio-plane/scripts/deploy.mjs:315` | the instance | operator script output (console, deploy/build tooling) |
| bundler | `bio-plane/scripts/deploy.mjs:359` | The instance | operator script output (console, deploy/build tooling) |
| bundler | `bio-plane/scripts/derive-bindings.mjs:53` | the instance | operator script output (console, deploy/build tooling) |
| bundler | `bio-plane/scripts/derive-bindings.mjs:139` | the plane | operator script output (console, deploy/build tooling) |
| bundler | `bio-plane/scripts/release-assemble.mjs:450` | the plane | operator script output (console, deploy/build tooling) |
| bundler | `bio-plane/scripts/release-assemble.mjs:468` | the plane | operator script output (console, deploy/build tooling) |
| bundler | `bio-plane/scripts/release-assemble.mjs:471` | The plane | operator script output (console, deploy/build tooling) |
| bundler | `bio-plane/scripts/release-assemble.mjs:474` | the plane | operator script output (console, deploy/build tooling) |
| bundler | `bio-plane/scripts/resolve-version.mjs:108` | the plane | operator script output (console, deploy/build tooling) |
| civil-time | `bio-plane/src/civil-time/recurrence.mjs:197` | the instance | word sense: "instance" is an occurrence of a recurrence, not the Civicsmith |
| sheet-worker | `sheet-worker/scripts/build-engine.mjs:55` | the instance | build-appended code comment |
| sheet-worker | `sheet-worker/src/contract.mjs:76` | this instance | service reason from the sheet-worker member to the plane, naming a deploy step; BOB to confirm |
| sheet-worker | `sheet-worker/src/enginelib.mjs:328` | server | vendored wasm-bindgen glue; "server" is an HTTP server |
| signatures | `bio-plane/src/sign-release.html:462` | the plane | comment (JS comment inside the page) |
| signatures | `bio-plane/src/sign-release.html:464` | the plane | comment (JS comment inside the page) |
| signatures | `bio-plane/src/sign-release.html:465` | the plane | comment (JS comment inside the page) |
| signatures | `bio-plane/src/sign-release.html:466` | the plane | comment (JS comment inside the page) |
| signatures | `bio-plane/src/sign-release.html:485` | the plane | comment (JS comment inside the page) |
| signatures | `bio-plane/src/sign-release.html:487` | the plane | comment (JS comment inside the page) |
| signatures | `bio-plane/src/signpage.mjs:2` | the instance | generated embedded copy of `sign-release.html` (written by `scripts/embed-signpage.mjs`); counted there |
| site-profiles | `site-profiles/handlers/aspnet-webforms.mjs:47` | server | "server" is an HTTP response header |
| credentials | `bio-plane/src/credentials/schema.mjs:9` | the instance | comment (code or SQL) |
| credentials | `bio-plane/src/credentials/schema.mjs:36` | the plane | comment (code or SQL) |
| credentials | `bio-plane/src/credentials/schema.mjs:66` | the plane | comment (code or SQL) |
| credentials | `bio-plane/src/credentials/schema.mjs:80` | the plane | comment (code or SQL) |
| credentials | `bio-plane/src/credentials/schema.mjs:154` | the copy | comment (code or SQL) |
| membership | `bio-plane/src/membership/schema.mjs:29` | server | comment (code or SQL) |
| promotion | `bio-plane/src/gate.mjs:857` | this instance | developer error (`new Error`) for a build fault |
| promotion | `bio-plane/src/promotion/index.mjs:405` | the plane | names ids/fields an API caller sent (bundleId, newId) |
| promotion | `bio-plane/src/promotion/index.mjs:413` | the plane | names ids/fields an API caller sent (bundleId, newId) |
| promotion | `bio-plane/src/promotion/index.mjs:416` | The plane | names ids/fields an API caller sent (bundleId, newId) |
| promotion | `bio-plane/src/promotion/index.mjs:903` | the plane | names ids/fields an API caller sent (bundleId, newId) |
| record-core | `bio-plane/src/record-core/index.mjs:472` | the plane | names ops (op=allocid) |
| record-core | `bio-plane/src/record-core/index.mjs:1045` | the instance | build-fault detail naming a module; its translation (C-row) is counted |
| record-core | `bio-plane/src/record-core/schema.mjs:120` | the instance | comment (code or SQL) |
| acquisition | `bio-plane/src/acquisition/index.mjs:691` | this plane | names bindings (BROWSER, RENDERER) |
| acquisition | `bio-plane/src/acquisition/index.mjs:693` | this instance | names bindings (BROWSER, RENDERER) |
| attestation | `bio-plane/src/attestation/schema.mjs:7` | THE INSTANCE | comment (code or SQL) |
| attestation | `bio-plane/src/attestation/schema.mjs:9` | the instance | comment (code or SQL) |
| capture | `bio-plane/src/capture/ops.mjs:74` | this instance | names a binding (R2 / CAPTURES) |
| capture | `bio-plane/src/capture/schema.mjs:188` | server | comment (code or SQL) |
| capture | `bio-plane/src/capture/schema.mjs:336` | the instance | comment (code or SQL) |
| capture | `bio-plane/src/capture/schema.mjs:340` | this instance | comment (code or SQL) |
| capture | `bio-plane/src/capture/schema.mjs:342` | this instance | comment (code or SQL) |
| capture | `bio-plane/src/capture/schema.mjs:368` | this instance | comment (code or SQL) |
| host-governor | `bio-plane/src/host-governor/schema.mjs:9` | the instance | comment (code or SQL) |
| provenance | `bio-plane/src/provenance/index.mjs:1053` | The plane | names ops (op=versionchain, address=) |
| provenance | `bio-plane/src/provenance/index.mjs:1304` | The plane | the control plane's stamp named to a caller with none ("this call carries nobody") |
| provenance | `bio-plane/src/provenance/index.mjs:1309` | the plane | the control plane's stamp named to a caller with none ("this call carries nobody") |
| provenance | `bio-plane/src/provenance/schema.mjs:26` | the plane | comment (code or SQL) |
| provenance | `bio-plane/src/provenance/schema.mjs:65` | the plane | comment (code or SQL) |
| provenance | `bio-plane/src/provenance/schema.mjs:70` | the plane | comment (code or SQL) |
| provenance-routes | `bio-plane/src/provenance-routes/schema.mjs:18` | THIS INSTANCE | comment (code or SQL) |
| provenance-routes | `bio-plane/src/provenance-routes/schema.mjs:19` | the instance | comment (code or SQL) |
| provenance-routes | `bio-plane/src/provenance-routes/schema.mjs:59` | this instance | comment (code or SQL) |
| provenance-routes | `bio-plane/src/provenance-routes/schema.mjs:67` | this plane | comment (code or SQL) |
| provenance-routes | `bio-plane/src/provenance-routes/schema.mjs:75` | this plane | comment (code or SQL) |
| calibration | `bio-plane/src/calibration/schema.mjs:68` | THIS INSTANCE | comment (code or SQL) |
| calibration | `bio-plane/src/calibration/schema.mjs:75` | the instance | comment (code or SQL) |
| calibration | `bio-plane/src/calibration/schema.mjs:80` | this instance | comment (code or SQL) |
| content | `bio-plane/src/content/checks.mjs:61` | the copy | word sense: a document's copy |
| content | `bio-plane/src/content/index.mjs:472` | The plane | the control plane's stamp named to a caller with none ("this call carries nobody") |
| content | `bio-plane/src/content/index.mjs:954` | The plane | the control plane's stamp named to a caller with none ("this call carries nobody") |
| content | `bio-plane/src/content/schema.mjs:93` | this plane | comment (code or SQL) |
| extraction | `bio-plane/src/extraction/index.mjs:1311` | this instance | names a binding (OCR_WORKER) |
| extraction | `bio-plane/src/extraction/ops.mjs:56` | this instance | names a binding (R2 / CAPTURES) |
| extraction | `bio-plane/src/extraction/schema.mjs:43` | this instance | comment (code or SQL) |
| extraction | `bio-plane/src/extraction/schema.mjs:44` | this instance | comment (code or SQL) |
| extraction | `bio-plane/src/extraction/schema.mjs:389` | THIS INSTANCE | comment (code or SQL) |
| extraction | `bio-plane/src/extraction/schema.mjs:391` | this instance | comment (code or SQL) |
| reading-pipeline | `bio-plane/src/reading-pipeline/index.mjs:116` | this instance | names a binding (pdf-worker member) |
| bias | `bio-plane/src/bias/index.mjs:303` | The plane | names ops (op=biasadopt) |
| bias | `bio-plane/src/bias/schema.mjs:48` | the instance | comment (code or SQL) |
| bias | `bio-plane/src/bias/schema.mjs:85` | server | comment (code or SQL) |
| connections | `bio-plane/src/connections/index.mjs:1112` | the plane | the control plane's stamp named to a caller with none ("this call carries nobody") |
| connections | `bio-plane/src/connections/schema.mjs:216` | the plane | comment (code or SQL) |
| connections | `bio-plane/src/connections/schema.mjs:217` | server | comment (code or SQL) |
| connections | `bio-plane/src/connections/themes.mjs:120` | The plane | the control plane's stamp named to a caller with none ("this call carries nobody") |
| connections | `bio-plane/src/connections/themes.mjs:156` | The plane | the control plane's stamp named to a caller with none ("this call carries nobody") |
| connections | `bio-plane/src/connections/themes.mjs:192` | The plane | the control plane's stamp named to a caller with none ("this call carries nobody") |
| connections | `bio-plane/src/connections/themes.mjs:225` | The plane | the control plane's stamp named to a caller with none ("this call carries nobody") |
| observation-log | `bio-plane/src/observation-log/index.mjs:784` | The plane | the control plane's stamp named to a caller with none ("this call carries nobody") |
| observation-log | `bio-plane/src/observation-log/index.mjs:885` | The plane | the control plane's stamp named to a caller with none ("this call carries nobody") |
| observation-log | `bio-plane/src/observation-log/schema.mjs:62` | the plane | comment (code or SQL) |
| observation-log | `bio-plane/src/observation-log/schema.mjs:109` | the plane | comment (code or SQL) |
| observation-log | `bio-plane/src/observation-log/schema.mjs:110` | server | comment (code or SQL) |
| observation-log | `bio-plane/src/observation-log/schema.mjs:131` | server | comment (code or SQL) |
| progressions | `bio-plane/src/progressions/checks.mjs:113` | this instance | word sense: "instance" is an instance of a progression |
| progressions | `bio-plane/src/progressions/checks.mjs:115` | the instance | word sense: "instance" is an instance of a progression |
| progressions | `bio-plane/src/progressions/index.mjs:689` | the instance | word sense: "instance" is an instance of a progression |
| progressions | `bio-plane/src/progressions/index.mjs:983` | its instances | word sense: "instance" is an instance of a progression |
| progressions | `bio-plane/src/progressions/index.mjs:992` | the instance | word sense: "instance" is an instance of a progression |
| progressions | `bio-plane/src/progressions/index.mjs:1225` | the instance | word sense: "instance" is an instance of a progression |
| progressions | `bio-plane/src/progressions/schema.mjs:98` | The INSTANCE | comment (code or SQL) |
| progressions | `bio-plane/src/progressions/schema.mjs:112` | server | comment (code or SQL) |
| progressions | `bio-plane/src/progressions/schema.mjs:122` | the instance | comment (code or SQL) |
| progressions | `bio-plane/src/progressions/schema.mjs:234` | the instances | comment (code or SQL) |
| progressions | `bio-plane/src/progressions/schema.mjs:251` | server | comment (code or SQL) |
| progressions | `bio-plane/src/progressions/schema.mjs:254` | the instance | comment (code or SQL) |
| retrieval | `bio-plane/src/retrieval/frontier.mjs:448` | the plane | names ops and fields (op=concerns, missing_unexplained); the frontier's explanation of its fence |
| standards | `bio-plane/src/standards/checks.mjs:114` | its copy | word sense: a document's copy |
| standards | `bio-plane/src/standards/index.mjs:385` | the copy | word sense: a document's copy |
| standards | `bio-plane/src/standards/index.mjs:626` | this copy | word sense: a document's copy |
| standards | `bio-plane/src/standards/index.mjs:853` | the plane | the control plane's stamp named to a caller with none ("this call carries nobody") |
| standards | `bio-plane/src/standards/index.mjs:1037` | the plane | the control plane's stamp named to a caller with none ("this call carries nobody") |
| agent-harness | `agent-harness/src/harness.mjs:257` | the PLANE | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-harness | `agent-harness/src/harness.mjs:260` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-harness | `agent-harness/src/harness.mjs:342` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-harness | `agent-harness/src/harness.mjs:678` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-harness | `agent-harness/src/harness.mjs:1038` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-harness | `agent-harness/src/subsession.mjs:232` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-harness | `agent-harness/src/subsession.mjs:588` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-model | `agent-model/src/model.mjs:188` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-model | `agent-model/src/model.mjs:207` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-model | `agent-model/src/model.mjs:279` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-runner | `agent-runner/src/entry.mjs:16` | server | import path |
| agent-worker | `agent-worker/src/ask.mjs:53` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/ask.mjs:71` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/ask.mjs:120` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/ask.mjs:246` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/cascade.mjs:73` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/cascade.mjs:75` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/index.mjs:296` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/index.mjs:359` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/index.mjs:360` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/index.mjs:394` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/index.mjs:396` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/index.mjs:643` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/index.mjs:983` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/index.mjs:1022` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/index.mjs:1032` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/index.mjs:1064` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/index.mjs:1162` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/index.mjs:1186` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/index.mjs:1207` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/index.mjs:1208` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/index.mjs:1376` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/index.mjs:1382` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/index.mjs:1383` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/index.mjs:1425` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/index.mjs:1442` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/index.mjs:1467` | this plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/index.mjs:1468` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/index.mjs:1499` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/index.mjs:1509` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/index.mjs:1510` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/ops.mjs:24` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/ops.mjs:32` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/ops.mjs:36` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/ops.mjs:43` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| agent-worker | `agent-worker/src/ops.mjs:78` | the plane | addressed to the model, an agent or an operator (agent-harness, agent-model, agent-worker op `why`s and run traces; T34-86) |
| ai-runs | `bio-plane/src/ai-runs/index.mjs:867` | the plane | ai-runs principal note, addressed to an operator (T34-86) |
| ai-runs | `bio-plane/src/ai-runs/index.mjs:1688` | the instance | run-dispatch trace naming the organisation credential and agent-worker; operator-facing |
| ai-runs | `bio-plane/src/ai-runs/index.mjs:1694` | the instance | run-dispatch trace naming the organisation credential and agent-worker; operator-facing |
| ai-runs | `bio-plane/src/ai-runs/index.mjs:1698` | the instance | run-dispatch trace naming the organisation credential and agent-worker; operator-facing |
| ai-runs | `bio-plane/src/ai-runs/index.mjs:1699` | the instance | run-dispatch trace naming the organisation credential and agent-worker; operator-facing |
| ai-runs | `bio-plane/src/ai-runs/schema.mjs:24` | the plane | comment (code or SQL) |
| ai-runs | `bio-plane/src/ai-runs/schema.mjs:30` | the plane | comment (code or SQL) |
| ai-runs | `bio-plane/src/ai-runs/schema.mjs:89` | the plane | comment (code or SQL) |
| ai-runs | `bio-plane/src/ai-runs/schema.mjs:123` | the copy | comment (code or SQL) |
| basis-versions | `bio-plane/src/basis-versions/checks.mjs:944` | the copy | word sense: a document's copy |
| basis-versions | `bio-plane/src/basis-versions/index.mjs:1483` | this copy | word sense: a document's copy |
| capture-requests | `bio-plane/src/capture-requests/index.mjs:702` | the plane | names a principal (the plane principal) |
| capture-requests | `bio-plane/src/capture-requests/index.mjs:756` | server | "server" is a website's server |
| capture-requests | `bio-plane/src/capture-requests/schema.mjs:30` | the plane | comment (code or SQL) |
| capture-requests | `bio-plane/src/capture-requests/schema.mjs:40` | this plane | comment (code or SQL) |
| capture-requests | `bio-plane/src/capture-requests/schema.mjs:119` | this instance | comment (code or SQL) |
| capture-requests | `bio-plane/src/capture-requests/schema.mjs:130` | this instance | comment (code or SQL) |
| contradiction | `bio-plane/src/contradiction/index.mjs:2595` | the plane | the control plane's stamp named to a caller with none ("this call carries nobody") |
| inquiry | `bio-plane/src/inquiry/schema.mjs:48` | server | comment (code or SQL) |
| inquiry | `bio-plane/src/inquiry/schema.mjs:50` | this plane | comment (code or SQL) |
| run-productions | `bio-plane/src/run-productions/index.mjs:587` | The plane | the control plane's stamp named to a caller with none ("this call carries nobody") |
| run-productions | `bio-plane/src/run-productions/schema.mjs:8` | the plane | comment (code or SQL) |
| run-productions | `bio-plane/src/run-productions/schema.mjs:107` | server | comment (code or SQL) |
| run-rules | `bio-plane/src/run-rules/deployment.mjs:91` | the instance | deployment record for an operator (run-rules deployment.mjs) |
| run-rules | `bio-plane/src/run-rules/deployment.mjs:132` | The plane | deployment record for an operator (run-rules deployment.mjs) |
| run-rules | `bio-plane/src/run-rules/deployment.mjs:134` | the plane | deployment record for an operator (run-rules deployment.mjs) |
| run-rules | `bio-plane/src/run-rules/rules.mjs:578` | the plane | refusal to a run's machine caller about a budget field |
| run-rules | `bio-plane/src/run-rules/rules.mjs:601` | the plane | refusal to a run's machine caller about a budget field |
| skills | `bio-plane/src/skilldoctrine.mjs:385` | the plane | skill doctrine/pack text addressed to the model, or build errors |
| skills | `bio-plane/src/skilldoctrine.mjs:640` | this plane | skill doctrine/pack text addressed to the model, or build errors |
| skills | `bio-plane/src/skilldoctrine.mjs:667` | the plane | skill doctrine/pack text addressed to the model, or build errors |
| skills | `bio-plane/src/skilldoctrine.mjs:878` | the plane | skill doctrine/pack text addressed to the model, or build errors |
| skills | `bio-plane/src/skilldoctrine.mjs:894` | the plane | skill doctrine/pack text addressed to the model, or build errors |
| skills | `bio-plane/src/skilldoctrine.mjs:941` | The instance | skill doctrine/pack text addressed to the model, or build errors |
| skills | `bio-plane/src/skilldoctrine.mjs:986` | the plane | skill doctrine/pack text addressed to the model, or build errors |
| skills | `bio-plane/src/skilldoctrine.mjs:1064` | the plane | skill doctrine/pack text addressed to the model, or build errors |
| skills | `bio-plane/src/skilldoctrine.mjs:1154` | the plane | skill doctrine/pack text addressed to the model, or build errors |
| skills | `bio-plane/src/skilldoctrine.mjs:1201` | the plane | skill doctrine/pack text addressed to the model, or build errors |
| skills | `bio-plane/src/skilldoctrine.mjs:1252` | the plane | skill doctrine/pack text addressed to the model, or build errors |
| skills | `bio-plane/src/skilldoctrine.mjs:1314` | the plane | skill doctrine/pack text addressed to the model, or build errors |
| skills | `bio-plane/src/skilldoctrine.mjs:1566` | the plane | skill doctrine/pack text addressed to the model, or build errors |
| skills | `bio-plane/src/skillpack.mjs:346` | the plane | skill doctrine/pack text addressed to the model, or build errors |
| skills | `bio-plane/src/skillpack.mjs:349` | the plane | skill doctrine/pack text addressed to the model, or build errors |
| skills | `bio-plane/src/skillpack.mjs:354` | the plane | skill doctrine/pack text addressed to the model, or build errors |
| skills | `bio-plane/src/skillpack.mjs:393` | the plane | skill doctrine/pack text addressed to the model, or build errors |
| skills | `bio-plane/src/skillpack.mjs:512` | The plane | skill doctrine/pack text addressed to the model, or build errors |
| skills | `bio-plane/src/skillpack.mjs:514` | the plane | skill doctrine/pack text addressed to the model, or build errors |
| skills | `bio-plane/src/skillpack.mjs:536` | the plane | skill doctrine/pack text addressed to the model, or build errors |
| skills | `bio-plane/src/skillpack.mjs:541` | the plane | skill doctrine/pack text addressed to the model, or build errors |
| intent | `bio-plane/src/intent/index.mjs:429` | this instance | word sense: "instance" is an instance of a progression |
| intent | `bio-plane/src/intent/index.mjs:454` | the instance | word sense: "instance" is an instance of a progression |
| intent | `bio-plane/src/intent/index.mjs:586` | this instance | word sense: "instance" is an instance of a progression |

## Modules with nothing to change

budget-doctypes (L1), bundler (L1), calc-grammar (L1), connection-grammar (L1), court-citations (L1), court-doctypes (L1), docprofile (L1), doctypes (L1), format-registry (L1), id-spaces (L1), image-codecs (L1), jurisdictions (L1), legistar-reader (L1), ocr-worker (L1), odf-reader (L1), office-readers (L1), ooxml (L1), pdf-pixels (L1), pdf-reader (L1), pdf-worker (L1), record-grammar (L1), roster-reader (L1), sheet-worker (L1), site-profiles (L1), subresources (L1), test-support (L1), text-chain (L1), provenance-routes (L3), sources (L3), calculations (L5), duties (L5), entities (L5), events (L5), explore (L5), lines (L5), local-facts (L5), money (L5), money-checks (L5), people (L5), progressions (L5), query-language (L5), retrieval (L5), accepted-work (L6), agent-harness (L6), agent-model (L6), agent-runner (L6), basis-versions (L6), contradiction (L6), hypotheses (L6), inquiry (L6), inquiry-grammar (L6), leg-earning (L6), run-productions (L6), run-rules (L6), skills (L6), strength (L6).

## Notes for BOB

- **N690 (civil-time, L1).** The four strings it names are three source lines: `calendar.mjs`:78 (two strings, "is disputed on this instance" and "cannot be read on this instance"), :112, :113. `recurrence.mjs`:197 ("the instance is the time after the gap") is an occurrence of a recurrence, not the Civicsmith, and stays.
- **N691 (capture-sources, L3).** `drive.mjs`:216 is confirmed; the same file has ten more rows of the same kind (:254 "COMPOSED BY THIS INSTANCE", :444–:458 "the plane recorded …"/"the plane holds no retrieval record …"), with `render.mjs`:343, :384, :480, `capture-sources/credentials.mjs` (C-105.8 and four refusals) and `memento.mjs`:256: 19 rows in all.
- **N692 (capture-requests).** `index.mjs`:864 and :933 are confirmed. `build/modules.json` places capture-requests in **layer 6**, not 3 as N692 says. Six more rows in the same file (:255, :390, :712, :757, :779, :1316) were missed by T34-86's grep, which read one line at a time. Its T34-86 rows (`checks.mjs`:172, :266, :336, `index.mjs`:472) no longer match, and neither do T34-78's L5 rows or T34-86's other L6 rows: those shares are in.
- **Biggest shares.** record-core (26: build-fault translations "A part of this instance …", with the `BUILD_FAULT` constant shared by 16 rows), capture-sources (19), acquisition (18), credentials (17), promotion (15), signatures (11, the signing page `sign-release.html`: "the instance page", "the instance refuses this signature"), membership (11).
- **Unsure whether member-facing:**
  - agent-worker `ask.mjs` (7 rows, M?). These are the refusals of a member's own ask (`PLANE_REFUSED`, `PLANE_SILENT`, `PACK_UNDETERMINED`, the answer check). They reach the member's device. T34-86 ruled agent-worker's op `why`s not member-facing, and these are a different path. The proposal says "the record" in place of "the plane".
  - agent-worker `cascade.mjs`:73, :75, the account-availability detail ("the plane sends it in its place", "the plane's to answer"). Excluded under T34-86, but it is worded for a member.
  - sheet-worker `contract.mjs`:76, `NOT_ENABLED` ("not enabled on this instance; an administrator enables it …"). Excluded as a service reason to the plane, but a workbook's recompute record may carry it.
  - ai-runs `index.mjs`:895 (the `AI_RUN_MODE_NOT_DEPLOYED` note) is taken as M. Its dispatch trace at :1688–:1699 ("the instance's organisation credential") is excluded as an operator trace.
  - provenance `index.mjs`:1387, :1402, and membership `index.mjs`:139. These describe the stamp to a caller who has a session, in a member-readable record or refusal, so they are taken as M. The "this call carries nobody" refusals are excluded as in T34.
  - capture's doorbell rows (C-85.3, C-85.4, `doorbell.mjs`:24, :51, `index.mjs`:770) are P: they are said to a knocker, who has no credential. `index.mjs`:447 and :857 are the members' view of a knock, so they are M.
  - promotion `names.mjs`:84 and `index.mjs`:624 are refusal remedies a member sees when naming a project, so M. `index.mjs`:405, :413, :416 and :903 tell an API caller not to send `bundleId`/`newId`, so X.
- **Terms rather than names.** bias' "instance statement" (`index.mjs`:469–470, :554–556) is the bias vocabulary's word for the group-wide statement. The proposal calls it the "group statement", but the term also lives in bias' requirements, schema comments and checks (C-row text not matched here), so renaming it is a vocabulary change. host-governor's "the instance default" becomes "your group's default".
- **One row outside the pattern.** promotion C-64.1 (`checks.mjs`:291) continues the matched sentence with "A copy records its group once", and the same re-wording reaches it.
- **Not run.** No test was run and nothing was edited. Each module's job adds a test naming each changed string (as T34-78/T34-86).
