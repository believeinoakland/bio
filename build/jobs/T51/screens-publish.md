# screens-publish (T51)

**Status** · session_01QD1BUeBCA9NYY1zJLxnCYq · depth 2 · WORKING · handled B12

## J1 · QUESTION

1. **Browser acts need two modules that are not on the tranche yet.** R38 to R40 add the browser acts `pubfloorset`, `pubfloorclear`, `pubprint` and `reviewexport` as acts of `published` and `review-copy`. At the tip (fe5d5656fb), `BROWSER_ACTS` (op-declarations R76) and the shell's R99 (`cs.print`, the screen's `printed`) and R100 (admission of a browser act, pressing one sends nothing) are not built. `checkScreens` throws on an act whose op `OPS` does not hold, so once those four acts are in `SCREENS` every test of my module is red until both modules merge. My reading: build the acts, the print state and the file to the written interface; check them against an uncommitted local stand-in of the two modules; and, once both are on `tranche/T51`, merge it and run the real suites. I will not post COMPLETE before that. Please ring me when interface-shell and op-declarations have merged, or tell me to do otherwise.
2. **R37 (BOB: check).** My reading: the finding page does not draw `body.question` or the finding's `tensions` (the drawing has neither and no key exists), and the address is `<case>/<edition>/<finding>`, a three-part subject on the existing `published` route.
3. **R39 (BOB: check).** My reading: the print footer names the signer and key fingerprint only where `publishedcase` states them (per-finding `attestor`, the case document's signature key), leaves out what it does not state, and draws no container or rendering hash.

## J2 · REPORT

All of T51-121 is built and tested on `job/T51/screens-publish` (134 tests, 0 failing against uncommitted local stand-ins of `BROWSER_ACTS` and the shell's R99/R100). I post COMPLETE once interface-shell and op-declarations are on `tranche/T51`. Findings for BOB, grouped:

**Words with no key, so the page draws no English for them (design stream; DEC-330, DEC-335, K3366)**
1. "Leg n", "supports it", "cuts against it", and the generic leads "Rests on:" and "Cut against by:" (the finding page's legs, the print). The legs' role and place are carried by the "What rests on what" lines (`holds.leg.2/3`, `is.leg.4`); a served leg that cuts against has only the `holds.leg.3.which.cuts` sentence.
2. The minimum's choices "No minimum", "C or better", "B or better", "A only": drawn as the grades themselves ("–", C, B, A).
3. "Save the file" (the act is drawn under "Save as a file"'s label), "Its fingerprint" and "Its author" (the file's stamp and the list draw the values with the keys that exist).
4. The finding page's not-available sentences ("the finding's text could not be read from the store"; "a court order withholds it"): drawn by the plane's refusal words (`refusal.<code>` of `body`) and the orders as stated; nothing when `body` carries no code.
5. The print head ("Edition n · published d · by team") is drawn from `screen.published.dated` and `.whose`; the unresolved edge of "What rests on what" is the `Undetermined` mark; `shell.card.hold` has no row (the docket's reference to `hold` has no card lead); a docket pressure mark of another kind is named by `screen.action.pressure.<kind>` and `screen.action.pressuremark.by`, and one with no member draws no maker sentence.
6. `words-reads.json` for screens-publish does not list the new keys (generated, not mine).

**Drawn items no read answers (R39; your answer B2)**
7. The container hash and the rendering hash are not drawn. `publishedcase` states no key fingerprint: only `attestor: {member, key_b64}` per finding and no case-level signer. The footer takes the signer from `signed_by`, else `attestor`, and the fingerprint from `fingerprint` if stated, else the first eight hexadecimal digits of the SHA-256 of `key_b64`'s wire bytes in two groups of four (the drawing's "ab12 34cd"), computed in the browser. Please place: a provider field in public-read, or confirm this.

**interface-shell (P9)**
8. `refusalOf(a, own, null)` passes no kit to a read's own refusal function (`outcome` calls it with `inst` null), so a screen cannot draw a read's refusal with its own words. `FINDING_IN_SEVERAL_CASES` needs the cases as references, so the finding page reads through `cs.later`-style `view.parts.later` instead.
9. `cs.sec` takes one help key; the drawing explains headings with two or three sentences (R37's two and R38's two, R43's `tip1` and `tip2`). I join them in a part (`secTips`); a list as `help` would do it in the kit.
10. `cs.checks` does not redraw on change, so "one box, then Save the file" uses the `acts` choice (a select whose one value offers the act). R90's `redraw` choice is a select too.

**Requirement text to reconcile (BOB's)**
11. R42 says an unreadable `minutes` source draws no minutes section; the entry (K4025) says the sign step draws `signing.minutes.unread` by word. I follow the entry (state l); R42's line needs the edit.
12. R30 and R4 say `photosOf` answers no date yet; it does now (case-disclosures R33): the ceremony reads `dated`, a local day, not `taken_at`.
13. R40 names `hash.sha256`, `date`, `author` and `floors` of the answer; the control plane puts them in `inband` (the quartet), which is where the file's stamp is read, with the top level as a fallback.

**Recorded, no change:** `imported.mjs`:57's `data-group-fields` is an attribute, not a sentence (N1229 entry).

## J3 · COMPLETE

T51-121 applied whole, merged with tranche/T51 at the B6 tip, run against the real providers (no stand-in left).

**Entries applied:** R37 a finding's own page (`<case>/<edition>/<finding>`, read asynchronously; legs served and named-only, falsifier and override, what rests on what, division, unavailable and withheld, FINDING_IN_SEVERAL_CASES); R38 the minimum strength (`pubfloorset`, `pubfloorclear`, the filtered view); R39 printing (`pubprint`, `printed`, the footer from what `publishedcase` states); R40 the review copy saved as a stamped file (`reviewexport`, from the in-band quartet); R41 the first share reads the zone from the copy, the preflight fallback gone; R42 the sign step's open requests and minutes (state k, state l); R43 the docket's pressure marks; the photo's day from `photosOf.dated`; DEC-342 (`refusal.<CODE>`, else the translation, else `refusal.uncatalogued`, never `detail`); dates and times in the design's forms (DEC-333, DEC-299); DEC-359's rows; sections explained by a key list (R90). All 12 inherited reds cleared.

**Deferred:** none. **Found elsewhere:** J2's items, answered in B3 and B5.

**Tests and checks:** module `node --test test/m/screens-publish/`: 134 pass, 0 fail (twice in a row). format 0 failures; architecture (screens-publish) 0; coverage 43 of 43 ids; words over every L11 module together: no line names screens-publish; ownership 0 failures; `setup-words build.mjs --check`: the expected stale-rows note on another module's row. `checks/run.mjs` over the whole product shows other modules' words and one answer-envelope architecture failure, none mine.

Size (session_01PQvprfcu1QzmpPKVtTTPqR): test runs 14, module lines 2440

## J4 · COMPLETE

CR-28 (K4149) applied. `refusal.uncatalogued` is added to every screen's `words` in `keys.mjs`: `parts.mjs` `refusalText` (reached by a failed read and by `refused`) draws it on all nine screens. It is the only one of the 19 keys a screen of this module draws.

**Not drawn here (18 keys; BOB sends the list to the design to drop from `words-reads.json`).** The shell's `refusalOf` (interface-shell R83) uses a screen's own function or own key for a code first, and `refusal.<CODE>` only when the screen maps none, so these rows are never reached:
- `refusal.KNOCK_EMPTY`, `KNOCK_PAYLOAD_TOO_LARGE`, `KNOCK_ENVELOPE_TOO_LARGE`, `KNOCKER_SECRET_WEAK`, `RATE_IP`, `RATE_GLOBAL`, `BAD_CONTENT`, `KNOCK_NOT_STORED`, `REQUIRED_ARGUMENT_MISSING`: `doorbell.mjs`:35 maps each to its own `screen.doorbell.refused.*` key.
- `refusal.REVIEW_BAD_UNTIL`: `review-copy.mjs`:110 maps it to `screen.review-copy.until.bad`.
- `refusal.NO_ATTESTING_KEY`, `NO_SIGNERS`, `CASE_SIGNER_NOT_AN_OWNER`: `ceremony.mjs`:321–358 draw them with their own functions (`screen.ceremony.refused.nokey` / `.notowner`).
- `refusal.NO_TARGET`: `ceremony.mjs`:100 leaves it out of the blockers and draws `ceremony.gate.notargets`.
- `refusal.NOT_PUBLISHED`, `refusal.IMPORT_NO_SUCH_EDITION`: an absent-subject code, drawn as "Nothing is here" (`published.mjs`:40, `imported.mjs` ABSENT_CODES); never as a refusal.
- `screen.action.pressure.kind`: the generator read the dynamic key `"screen.action.pressure." + kind` (`docket.mjs`:72) as a literal; the real keys (`.legal`, `.retaliation`, `.discrediting`, `.other`) are listed.
- `screen.ceremony.signs.lines`: not drawn. The ceremony lists every statement signed (R13) and then draws `screen.ceremony.signs.count`. If the design means `.lines` (DEC-259, "after the lines drawn") to replace `.count`, that is a requirement change for BOB.

**Tests and checks.** `node --test test/m/screens-publish/`: 133 pass, 1 fail. The failure is `common.test.mjs` R24, which stays red until the design drops the 18 keys above (it names exactly those 18). Process `checks/run.mjs`: format 0, architecture 0, words 0 findings. The coverage failures it lists are in other modules. `coverage.mjs screens-publish`: 43 of 43. ownership 0 failures. I did not run `journey.test.mjs`.

**Found elsewhere:** nothing.

Size (session_016iKmE55Vo6kaM1uCr7HpH5): test runs 2, module lines 1

## J5 · COMPLETE

CR-28 applied; see J4 in my record. One of the 19 keys is added (`refusal.uncatalogued`, on every screen). The other 18 are "not drawn here" with reasons in J4: nine doorbell refusals and REVIEW_BAD_UNTIL map to own keys; NO_ATTESTING_KEY, NO_SIGNERS and CASE_SIGNER_NOT_AN_OWNER have own functions; NO_TARGET, NOT_PUBLISHED and IMPORT_NO_SUCH_EDITION are handled before any refusal is drawn; `screen.action.pressure.kind` is a generator artifact of a dynamic key; `screen.ceremony.signs.lines` is not drawn (design may mean it to replace `.count`: your call). R24 in common.test.mjs therefore stays red until the design drops those 18; the other 133 tests pass. Checks: format 0, architecture 0, words 0, ownership 0, coverage 43/43.

## J6 · QUESTION

QUESTION (SCREENS-PUBLISH #7, session_01Xcyjq97CXFUqwP1cEcNmhq). I read B7 and B8. B7 (CR-28) was already applied and posted in J4/J5; nothing more to do for it. B8 (FR-30, 27 entries) I will build.

1. B8 says to write each `NEW screens-publish R44 … R68` requirement line first. `build/requirements/screens-publish.md` is not in my paths, so `checks/ownership.mjs` fails a diff that touches it (JOB.md "Write only"). The file on tranche/T51 at 26b2565729 ends at R43. My reading: you write R44–R68 on tranche/T51 (numbers as the entries give them; entry 3 is covered by R44, entry 21's R63 amends R60) and I merge it, because coverage.mjs needs the ids in the file before it can count my tests. Until then I build the code and the tests to the ids in the entries. If you would rather I write them, say so and I will, and the ownership check will list that file as a deliberate exception.
2. Reading set is over budget (601 KB of 600 KB). I will read my own code and requirements whole, and have sonnet-medium workers write the task digest of the used modules' public parts as B8 says; I read any cited section whole.
3. Entries 17 (C50, R59) waits for your CHANGE as the entry says, but B8's "Drawn" note says DEC-382 is merged and it is to be built now. I read the note as the later word and will build R59 now.

## J7 · BLOCKED

BLOCKED (cause: context). SCREENS-PUBLISH #8, FR-30 part one. The reading set alone (requirements, 184 KB of code, digests) took much of my window; I stop at a clean point, pushed on job/T51/screens-publish (module tests: 147 pass, 2 fail; format 0, architecture 0, words 0 findings).

BUILT, each with a test naming it (bio-plane/test/m/screens-publish/fr30.test.mjs, plus updated old tests): entry 27 (reviewgrant tests give the reason through the harness); R45 (signing key offered at once); R47 in part (the editor draws the gates' first refusal as what is missing); R48; R50 (the ceremony sends the draft and project plus only what it attested); R52; R55; R56; R60/R63 (three headings by the title review answers, body.nocase); R61; R62; R64; R65; R66 (PUBLISH_NO_FINDING with the "Add a finding" door); R67 (reference drawn when the answer holds one). R44 to R68 are written in the requirements file (J6/B9).

NOT BUILT (next session, in this order): R44 (case editor fields and the Bias step: position, reasoning, left-out rows, roles, biasAcknowledgement); R46 (tensionsDisclosed ticks); R51 (reattest, captureaccount, selfAttested); R53 (sever, reinstate: needs a read that lists severed citations, since case_citations lists only live ones); R57 (details sheet: casedetails/casedetailsset/casedetailspublic); R47 for `published` (completeness, bias, tensions, grades); R54 (file chooser); R58 (importregrade, rerunstart); R59 (citeimported); R49; R68.
Inherited reds still open: common.test R10 (registry acts missing: case-editor sever, reinstate and the owed casedetails/casedetailsset; ceremony reattest, captureaccount; imported writinghelp) and public.test R8 (see 3).

FOR BOB (other modules / design):
1. R49: the design has no keys for the receipt's fingerprint, size, pseudonym, the made secret and "make one for me"; I drew none and invented none. R49 waits on UX-DESIGN.
2. R67: the knock answer carries no `reference` (doorbell R11, door.mjs:142); the page draws it only when the answer holds it. Also `knock`'s declaration lists `content` while the Worker reads `contentB64`/`contentText` (doorbell/index.mjs:795).
3. R8's red is a true finding of the docket's form: `docketfile` declares `edition` and `capture` as required (docket R1: the edition the entry answers, and the captured document); the screen has no fields for either and the design draws none. Needs a drawing.
4. R68: `place` gets no word function, so the crumb cannot say `crumb.project.unjoined`; interface-shell would need to accept a title key from `place`.
5. Registry lists `writinghelp` on `imported`; no field there is a writing field by any requirement. Needs your ruling.
6. `reviewgrant` and `projectowneradd` declare no `reason`; the shell adds it (R107). Harmless to the guard today.

## J8 · REPORT

REPORT (SCREENS-PUBLISH #9). After merging tranche/T51 (B11), three suite tests that were green at #8's stop are red from other modules' declarations, which the guard (interface-shell R104) now compares; none is a screen defect I can fix without weakening a declaration:
1. `writinghelp` (wizard-scripts, `fields.accepts: ["field","told","draftHeld"]`) does not list `op`, but the module's own writingHelp (wizard-scripts index.mjs:1504-1508) reads `{op, field, told, draftHeld}` from the POST body and decides whether help is offered from `op` (`#helpAt`), and `FIRSTHAND_ACTS` from it. The case editor sends `op` (casedraft or whatchangedpropose) as `screens-action/send-steps.mjs:317` does. Needs: wizard-scripts accepts `op`. Red: t50/case-editor R1 "Draft what changed" (common.test R1 test). Other screen modules that send `op` will see the same.
2. `accountpropose` (control-plane owner-ops.mjs:23-24, case-account `accountPropose`) requires `text` and `run` (and `flags` for `account_check`): it stores a draft an AI run made, so a member's act cannot send it. R35's "Draft the account with the assistant" sends `{kind:"case_account", framing}`, which the guard refuses. Needs: BOB's ruling on which op asks the assistant for the draft (R35 names `accountpropose`), then a CHANGE. Red: t50 R35 (two tests).
3. `docketfile` still red as J7 said (accepted red by name, B12).
I carry on with R44, R46, R51, R53, R57, R47, R54, R58, R59, R67 in the order B12 gives.
