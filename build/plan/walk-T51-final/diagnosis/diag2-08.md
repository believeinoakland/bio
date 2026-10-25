# Diagnosis of walk-T51-final 08-law BROKEN rows (K4426)

Record: `origin/prep/final-08-law` `08-law.md` (read whole; 27 BROKEN rows). Product read at `origin/tranche/T51` (`dafb6199eb`); nothing edited. Every file:line below was read there; the script was not re-run.

Earlier diagnoses (diag-04, diag-09, diag-10a-05) cover no row of this record. `build/plan/fix-round-10-T51.md` and `build/plan/later-ux.md` (grepped for standards, law, court, proceeding, profile, jurisdiction, glossary, records help, preselect, content id) place none of these causes: no row is ALREADY PLACED.

"Platform" means dependence on workerd/Miniflare behaviour rather than pure module logic: none of the fixes below has it. The walker's row ids (R70.x ...) are coverage ids, not requirement numbers.

## C1. No proceeding can be registered: R74.3, R74.4 (D1, BLOCKER)

Verdict: DEFECT (missing profile data against `jurisdictions` R51 and `screens-investigate` R36/R47).

1. Root cause with evidence.
   - `jurisdictions/profiles/oakland-alameda.mjs` has `spaces.proceeding` (line 135, the case-number forms `alameda-civil`, `alameda-legacy`) but no `proceeding_kinds`, no `proceeding_flows` and no `forums` key at all. Its top-level sections are `systems`, `mixed_hosts`, `search_terms`, `records_laws`, `standard_sources`, `counterparties`, `action_kinds`, `deadlines`, `computation`, `fiscal_year`, `identifier_schemes`, `lawful_demands`, `legal_facts`, `legal_organisations`, `pointers`, `holidays`; Only `jurisdictions/profiles/test-port-ellery.mjs:408-418` has `proceeding_kinds: [{ kind: "commitment_suit", label, forum_kind: "court", basis: "TEST" }, ...]` and `proceeding_flows`.
   - `entities/index.mjs:1268-1272` reads the combined view's kinds: `const kinds = (Array.isArray(view.proceeding_kinds) ? view.proceeding_kinds : [])...; const pk = kinds.find((k) => k.kind === f.kind.trim()); if (!pk) return { ok: false, reason: "PROCEEDING_KIND_UNKNOWN", kind: ..., kinds: [], detail: ... "they name none" }`. With the only shipped profile active the list is `[]`, so every kind, `civil`, `writ`, `appeal`, `petition`, is refused as the walker saw; a call naming no kind is refused earlier by `PROCEEDING_FACET_MISSING` (`:1262`).
   - `affordances/facts.mjs:477-483` answers `proceeding_kinds = []` (no active kinds), and `screens-investigate/proceeding.mjs:48-51` reads that list; an empty list draws `state.empty` ("Nothing here") and sends nothing, as specified by `screens-investigate` R47 ("`[]` draws `state.empty` in place of the choice and sends nothing"). So the screen is correct; the data is missing.
   - The four kinds' words are held (`setup-words/rows.mjs:5630-5633`, DEC-301; `screens-investigate` R36 names them).
   - R74.5 to R74.11 are NOT REACHED for this reason alone.
2. Why the module tests missed it. Every test that registers a proceeding uses the test profile: `entities/dec149.test.mjs`, `affordances/profiles.test.mjs`, `screens-investigate/fixtures.mjs` and `proceeding.test.mjs` supply kinds from `test-port-ellery` or a stub `affordances` answer.
3. Failing-first test.
   - Pure: `jurisdictions/test/` (new file or `jurisdictions.test.mjs`): `get("oakland-alameda").proceeding_kinds` includes `civil`, `writ`, `appeal`, `complaint`, each with a `forum_kind` of `court` or `commission`, and every `proceeding_flows` kind is among them (the validator's `FLOW_INVALID` rule, `index.mjs:1244`).
   - The walker's exact case through the door: `bio-plane/test/m/control-plane/` (new file, e.g. `proceeding-oakland-door.test.mjs`, importing `r8-kit.mjs`): claim and sign in, `profilesset oakland-alameda`, `entitycreate` a body with `forum_kind: "court"`, then `entitycreate` a proceeding `{forum, kind: "civil", number: "24CV123456"}` expects `ok:true`; `affordances` answers `proceeding_kinds` of length 4; and a call with `kind: "writ"` is accepted. Then boot `/app/proceeding` on the stand-in against that plane: the kind choice is drawn with the four labels (not "Nothing here"), and "Register the proceeding" sends `entitycreate`.
4. Owning module: `jurisdictions` (`paths: jurisdictions/`; the file `jurisdictions/profiles/oakland-alameda.mjs`; layer 1, uses `record-grammar`, `setup-words`). Does not depend on the platform. Each kind needs a sourced `basis`; K1452/DEC-301 name the four.

## C2. "Relate to a law" refused when the page was opened from its project's list: R70.13.browser, R70.14 (D2)

Verdict: DEFECT (screen sends the act wrongly). A hand-sent act at the bare address works (R70.14b WORKS), so the door is right and the screen is wrong.

1. Root cause with evidence. `screens-investigate/standard.mjs:177`:
   `return { body: Object.assign({ type, from: String(view.subject || ""), to, citation }, effective ? { effective } : {}) };`
   `view.subject` is `"<STD>/<PROJ>"` for a standard reached from the project's list (C61/C62: `standard.mjs:112` builds `href="/app/standard/<STD>/<PROJ>"`). The sibling code splits it: `place` (`:15`), `reads` (`:31`), `standardinforce.send` (`:146`: `String(view.subject || "").split("/")[0]`). The plane therefore receives `from: "STD-2026-0001-ordinance/PROJ-2026-6853-..."`, finds no standard by that id and answers "No standard answers to that id here. Nothing was written." (`NO_SUCH_STANDARD`, `law-relations` `#held`, `index.mjs:181`). The member's screen is the only door to the act that sends it this way; the walker sent what the screen sends.
2. Why the module tests missed it. `screens-investigate/standard.test.mjs:56-60` and `fix2w2.test.mjs:24` open the bare address `/app/standard/<STD>` only. `fix2.test.mjs:232` opens `/app/standard/<STD>/<PROJ>` but only to read the crumb, never to press `lawrelate`. The plane is a stub, so nothing refuses `from` with a slash.
3. Failing-first test. `bio-plane/test/m/screens-investigate/standard.test.mjs`: open `/app/standard/STD-2026-0003-ordinance/PROJ-...` (the address the list's door builds), choose a law and type, fill the citation, press `lawrelate`; assert the body's `from` equals `"STD-2026-0003-ordinance"` (no slash).
4. Owning module: `screens-investigate` (`bio-plane/src/screens-investigate/`; layer 11; no platform dependence). One-line fix: split the subject at "/" as the other acts do.

## C3. The relate form asks for "The passage that says so (a content id)": R70.13, OV15.3, OV15.4, OV15.5, OV15.6 (content-id arm) (D3)

Verdict: DEFECT (the form breaks `screens-investigate` R34, which is the requirement; also a word a member cannot use).

1. Root cause with evidence.
   - `screens-investigate/standard.mjs:91`: `cs.field("st-citation", S + "citation", {})`, a free text field, and `:173-175` sends whatever is typed as `citation`.
   - The plane requires one of the `from` standard's own text content ids: `law-relations/index.mjs:187-191` `#cited`: `if (!this.k.texts(standardId).includes(citation.trim())) return false;`; with `LAW_RELATION_NO_CITATION` as the answer (law-relations R2, R20: "its citation is a content id of the `from` standard's text"). So "OMC 8.22.020" is refused: "A relation between laws is recorded with the passage that makes it ... None of those was named. Nothing was written."
   - The label is `setup-words/rows.mjs:3174`: `["screen.standard.citation","The passage that says so (a content id)", ...]`. `screens-investigate` R34 says the opposite: "no form asks for a fingerprint, a page number by itself, or a content id, and the Standard's text is a passage chosen on screen". The field is on every standard's page (hence OV15.3-OV15.6); `proceeding.mjs:133` (`courtlink`) has the same shape.
   - No place on the page shows a passage's content id: `render` (`:61-82`) draws the passage's words by `content_id` but never the id (correct under R34) so the member could not copy one even if they wanted to.
2. Why the module tests missed it. `standard.test.mjs:58` and `:72` type the id by hand (`"st-citation": "CNT-2026-0001"`) and assert it is sent unchanged: the test builds in the very input the requirement forbids.
3. Failing-first test. `screens-investigate/standard.test.mjs`: the relate form's label and help contain no "content id", and the citation is a choice among the `from` standard's own passages (drawn from the `standard` read's `texts`, by their words), not a free text field; pressing without choosing refuses in place with `screen.standard.relate.empty` and sends nothing; choosing the first passage sends its content id in `citation`.
4. Owning module: `screens-investigate` (code: choice from `view.data.standard.value.texts`; they are already read, `:35`); new label words by the UX design stream (WORDS part). No platform dependence. Same fix applies to `courtlink` in `proceeding.mjs:133`.

## C4. The standard's page draws none of the words the plane composes (`says`): R70.8, R71.13, R72.4, R72.7 (D4)

Verdict: DEFECT (screen omission of the members' words of DEC-145; `standards` R45).

1. Root cause with evidence. `standards` R45: every read of a standard carries `says`, the members' words of DEC-145 (force "Requires"/"Required"/"At the discretion of <holder>" with "criteria stated" or "no criteria stated"; "Standard · binds <body>" or "Benchmark · not binding"; "Cited, not seen"; "Looked for, not found"; "Not public" with who releases; access words; a policy with its owner). The plane composes it (`standards/index.mjs:1076-1098`; the walker saw `owner: "Public Works Department policy"`, `copy: "Kind of copy not known"`, `release_by_words: "Only admin can release it"`). The page does not draw it: the `standard` state in `screens-investigate/standard.mjs:60-84` draws only `sub` (kind, issuer), the period, `v.reason`, the passages and `text_withheld`; nothing in `render` reads `v.says`. `screens-investigate` R8 asks only for "its words as written, its source passage, its issuer, kind and when it is in force", so the screen was built to R8 and R45's words reach no one: a policy, a cited standard, an absent one and a benchmark read like any other .
2. Why the module tests missed it. `standard.test.mjs` and `fix2.test.mjs` stub `standard` with `{cite, kind, issuer, text, period, reason}`; none gives `says` and none asserts it is drawn. `standards` tests prove the plane composes `says` (R45) and screens-investigate R8 does not ask for it; the join between the two requirements was not tested.
3. Failing-first test. `screens-investigate/standard.test.mjs`: the `standard` read carries `says` with owner "Public Works Department policy", a provision force ("Required"), `held: cited` ("Cited, not seen" with the place cited) and a benchmark; the page text contains each of them, beside the provision's own words; control: a read without `says` draws no empty line.
4. Owning module: `screens-investigate` (R8 to be amended to name `says`; also the Find-in "Hold" result lines in `screens-daily` if they show the standard). No platform dependence. The words are the plane's, already composed by key (`standards` R59), so no new words are needed; where to place them on the page is a UX question (layout), the content is fixed by DEC-145.

## C5. A section number runs into its text and is found cut mid-number: R70.2b (D5)

Verdict: DEFECT.

1. Root cause with evidence. `retrieval-browse/findin.mjs:197-208` `matchRequirements`: `const re = /[^.!?;\n]+[.!?;]?/g;` (line 200) takes a sentence to be a run of characters with no `.`, `!`, `?`, `;` or newline, so "Section 8.22.050 No landlord shall increase the rent..." splits at the dots inside "8.22.050": the first piece "Section 8" and "22" carry no requirement word, and the piece "050 No landlord shall increase the rent above the limit the board sets." is the one that does. It is stored as the sentence (`sentence: s[0].trim()`), and the member holds the cut sentence as the standard's text. `retrieval-browse` R2 says "each sentence carrying one of the language's requirement words, the sentence its words" (R7: a passage's words as written).
2. Why the module tests missed it. All requirement fixtures are prose with a final stop only: `findin.test.mjs:56` ("The Clerk shall publish the agenda within seven calendar days of the meeting. The budget is $4.2 million."), `:136`, `:250`, `:274`, `:344`; `seam.test.mjs:27`, `t36.test.mjs:48`, `t37.test.mjs:167`, `t50.test.mjs:50`. No case has a dotted number, a citation or an abbreviation.
3. Failing-first test. `bio-plane/test/m/retrieval-browse/findin.test.mjs`: a unit "Section 8.22.050 No landlord shall increase the rent above the limit the board sets." and one "Section 8.22.020 No landlord shall retaliate..." with no heading; `requirements` finds each whole, starting at "Section", with `index` at the start; control: "The Clerk shall publish it. The budget is $4.2 million." still gives one sentence; a stop is a sentence end only when followed by whitespace and an upper-case letter or end of text, not inside a number or after a known abbreviation.
4. Owning module: `retrieval-browse` (`bio-plane/src/retrieval-browse/findin.mjs`); the same rule must be shared with any other sentence splitter (grep `[^.!?;` in `retrieval/`). Layer 5; no platform dependence.

## C6. The declare form says "Choose the passage on the document" and offers no way to: R70.6b (D6)

Verdict: DEFECT (`screens-investigate` R34/R52 and `standards` R47/R60).

1. Root cause with evidence. `screens-investigate/standard.mjs:134`: `P.docChoice(cs, view, "st-doc", { label: S + "text", help: S + "text.help", project: ... })` with no `drive: true` and no `P.passagePick` after it. `parts.mjs:139` draws the sentence `form.choose.passage` under the choice whenever `o.passage !== false`, but only `passagePick` (`parts.mjs:164`, used on `money.mjs:183`, `person.mjs:191`, `timeline.mjs:148`) draws the document's words to select. So `standard.mjs:156` `view.parts.chosen(cs, "st-doc")` is called without a `wordsId`, and `parts.mjs:148-157` answers `extent: { kind: "document" }` always. Hence the standard rests on the whole document; its page then shows `units.slice(0, 3)` (`standard.mjs:73`, the document's first three paragraphs), the walker's "chapter's title, 8.22.010 and 8.22.020". (`proceeding.mjs:110` is the same.)
2. Why the module tests missed it. `standard.test.mjs:56` presses declare with a document chosen and asserts the body; no test selects words, and R34's fix-round-3 line lists "person (and an organisation), money and timeline" only, so the Standard's picker was never written or tested.
3. Failing-first test. `screens-investigate/standard.test.mjs`: open the Standard screen, choose a document, select words in the passage picker (`cs.value("st-doc-<12 hex>")` as `fix2w2`/`pickers.test.mjs` do), press "Hold this as a standard"; assert `text[0].extent` is the selected unit's extent, not `{kind:"document"}`.
4. Owning module: `screens-investigate`. No platform dependence.

## C7. The Standard screen cannot hold a court decision: R73.1 (D7)

Verdict: DEFECT (screen omission; `standards` R1 allows `court`; the screen's own labels already name it).

1. Root cause with evidence. `screens-investigate/standard.mjs:133`: `["policy", "ordinance", "regulation", "statute", "commitment", "standard"].map(...)` for the kind choice; `court` is absent, though the same file draws `court` as a kind on the page (`:79`, `:113`) and holds the word `screen.standard.kind.court` ("Court decision", `rows.mjs:3154`). `screens-daily/find-in-forms.mjs:13` and `screens-daily/index.mjs:58` list all seven kinds, which is why Find in this's form offers it and R73.2 worked. `standards` R1 accepts `court`; `refusal.STANDARD_KIND_UNKNOWN` (`rows.mjs:16328`) names "a court decision or order" as a kind.
2. Why the module tests missed it. `standard.test.mjs` declares a policy only; no test iterates the plane's kinds against the screen's choice.
3. Failing-first test. `screens-investigate/standard.test.mjs`: the kind choice offers the seven kinds the plane accepts (compare to `STANDARD_KINDS` from `standards`), choosing "Court decision" and pressing sends `kind: "court"`.
4. Owning module: `screens-investigate` (the list at `standard.mjs:133`; the word exists). No platform dependence.

## C8. "Related laws" draws the other end by raw id and not which way it runs: R73.3c, OV15.3, OV15.6 (raw-id arm) (D8)

Verdict: DEFECT (raw id drawn in a member's page; R23 of `screens-investigate`: "no record id is drawn as a title") plus WORDS (the sentence for an incoming relation).

1. Root cause with evidence. `screens-investigate/standard.mjs:87-88`:
   `cs.row(`<b>${cs.w(S + "rel." + (r.type || "refers_to"))}</b>`, cs.esc(((r.direction === "in" ? r.from : r.to) || {}).standard || ""), ...)`
   draws the other end's `standard` field, a record id such as `STD-2026-0014-court`, never its citation, though the page already reads every standard (`:37` `out.laws = standards limit 200`, used for the "to" choice `:91` with `x.cite || x.id`). The type word is `rel.<type>` for both directions: an incoming relation (`direction: "in"`: the decision refers to the ordinance) reads "Refers to STD-...-court" on the ordinance's page, as if the ordinance referred to the decision. The type keys are only the outgoing verb forms (`rows.mjs:3163-3171`); no key says "Referred to by", "Implemented by", "Amended by" and so on. (`rel.interprets/applies/holds_invalid`, the `courtLink` types, have no key either; not walked.)
2. Why the module tests missed it. `standard.test.mjs`/`fix2.test.mjs` stub `lawrelations` with outgoing rows and assert the type word only; none sets `direction: "in"` and none asserts the other end is named by its citation.
3. Failing-first test. `screens-investigate/standard.test.mjs`: `lawrelations` returns one `out` and one `in` row; the page names each other end by its `cite` (from the `standards` read) and the page text has no `STD-2026-`; the incoming row is not worded as the page's standard doing the act (a distinct key); control: an `out` row is unchanged.
4. Owning module: `screens-investigate` (code) with new words keys from the UX design stream (incoming-direction sentences; goes to the design channel, not decided here). No platform dependence.

## C9. "Standard · binds {body}" cannot be reached through the screens: R71.10, R71.10b (D9)

Verdict: DEFECT in the screens for "who set it"; the plane behaviour is SPECIFIED; the missing acts are a design/requirement question (BOB to put in front of Bob only if he wants the acts on a screen, P17 level: which acts a screen offers).

1. Root cause with evidence.
   - `standards/index.mjs:771-776` `#designationFields`: `issuer_entity` is set only `if (/^ENT-/.test(f.issuer))`; any other issuer (the member's typed "City of Oakland") is kept as a label with `issuer_entity: null`. Walker's R71.10b row is the op called with the label; the plane did what `standards` specifies (the issuer "may be a registered entity"), which is why `owner.entity` stayed null (`:1084`).
   - `bindsAt` (`:2036`) compares `row.issuer_entity === body` or, with no entity, `row.issuer === body`; the body is asked by its entity id, so "City of Oakland" (a label) never equals it and the answer is `undetermined` ("Whether this binds City of Oakland is not recorded", R71.10).
   - The screens send the label: `standard.mjs:155,160` `issuer = String(cs.value("st-issuer"))` from `cs.field("st-issuer", S+"issuer")` (`:134`, free text), and `screens-daily/find-in-forms.mjs` (Hold-from-a-found-sentence) takes "Who set it" the same way. No screen offers a choice among the registered bodies, so no standard declared through a screen can name its issuer's entity.
   - No screen draws `bindsat` or offers `standardadoption`/`standardimpose` (`grep` of `screens-*` finds none; `screens-investigate` R8 registers 3 acts). So only the issuer route to "binds" exists, and the screens cannot reach it.
2. Why the module tests missed it. `standards` tests declare with an `ENT-` id directly; screen tests send any typed string and assert the body; no test joins the screen's issuer to `bindsAt`.
3. Failing-first test. `screens-investigate/standard.test.mjs`: with a registered body, "Who set it" is a choice among the registered bodies (and a way to name one that is not registered, as free text) and the body sent has `issuer` = the body's `ENT-` id; through the plane (`control-plane`, `r8-kit.mjs`): register City of Oakland, declare an ordinance through the screen choosing that body, then `bindsat` for the body on 2026-10-25 answers `binds` (the issuer arm of R43, `in_force` once the period is stated).
4. Owning modules: `screens-investigate` (Standard form) and `screens-daily` (Find in this recording form); no platform dependence. DECISION NOT BOB'S TO MAKE ALONE, ONLY IF WANTED: whether the screens also offer the adoption and imposition acts (`standardadoption`, `standardimpose`) is a UX question (which acts a screen offers); recommend it to the UX design stream with `bindsat`'s words.

## C10. A "Not public" standard cannot be held by anyone: R72.8 (D11)

Verdict: DEFECT (module disagrees with the module it reads).

1. Root cause with evidence. `standards/index.mjs:811-819`:
   `#memberCaptured(captureSha) { ... return !!r && Array.isArray(r.actors) && r.actors.some((x) => typeof x.actor === "string" && /^member:./.test(x.actor) && !isMachineIdentity(x.actor)); }`
   It accepts only an actor spelled `member:<handle>`. The capture module stores whatever string it was given: `capture/index.mjs:1394-1400` `recordCaptureActor` inserts `actor` verbatim, and `acquisition/index.mjs:1707-1709` passes `sessMember` (the door gives the bare handle; `captureaccounts` answers `"actor":"admin"` for the founder's upload and `"actor":"mia"` for a member's, as the walker saw). The capture module itself treats `member:x` and `x` as one member (`capture/index.mjs:84-85`, `memberIdOf`: "so `member:x` and `x` name one member", R69). `standards` R41 says only "a capture a member made by their own act (the capture's author a member, never a machine credential)". So `access: "paywalled"` or `reading_room` always meets `TEXT_NOT_MEMBER_CAPTURED` (`standards/index.mjs:800-805`), for the founder's upload, the founder's testimony and a second member's upload alike; "Not public, Only {who} can release it" and the withheld passage can never be produced by anyone.
2. Why the module tests missed it. The `standards` fixture's stand-in for `capture` returns whatever actors the test sets, and the tests set `V("bob")` = `member:bob` (`test/m/standards/fixture.mjs:74,141`, `t35.test.mjs:375`, `t50.test.mjs:91`). The real capture module is never asked.
3. Failing-first test. `bio-plane/test/m/standards/t35.test.mjs` (or a new file beside it): the stand-in answers the actor as the real module spells it (a bare handle) and `standarddeclare` with `access: "paywalled"` over that capture is held; control: an actor that is a machine identity is still refused.
4. Owning module: `standards` (`bio-plane/src/standards/index.mjs`, `#memberCaptured`: strip a leading `member:` and then ask `isMachineIdentity`, or ask `capture` for a normalised read). Uses `capture` (layer 5); no platform dependence (pure plus Miniflare confirmation).

## C11. Choices open on a real value: OV7.standard-list, OV7.standard-ordinance, OV7.standard-policy, OV7.standard-court (D10)

Verdict: DEFECT against doctrine check 7 ("No preselected choice ... no value entered under the member's name that she never saw"; surfaceRules).

1. Root cause with evidence. `cs.choice` (`interface-shell/browser.mjs:790-809`) marks an option `selected` only when `chosen === v`; for a choice with no seed the browser draws its first option (the shell itself says the browser's first option "is no choice" for drawn value tracking, `:1477`, so a press without touching it reads the first value). `standard.mjs:90` (`st-type`: "implements" first) and `:133` (`st-kind`: "policy" first) draw no leading empty option, and the sends cover for it: `:160` `String(cs.value("st-kind") || "policy")`, `:174` `String(cs.value("st-type") || "implements")`. So a press without choosing sends "policy"/"implements", a value the member did not pick. The document and law choices open blank only because their option lists are built apart (the walker: "blank: 1/2"). `screens-daily` R80 is the pattern (nothing chosen; a press refuses in place).
2. Why the module tests missed it. `standard.test.mjs:58-60` expects the default: the relate body has `type: "implements"` with no choice made on the form's type field (`fix2w2.test.mjs:24` fills only `st-to` and `st-citation` and presses, so the default type is what is sent), and the document stand-in shows a choice's first option as chosen (the walker's own note, "where the stand-in and the browser differ").
3. Failing-first test. `screens-investigate/standard.test.mjs`: with no choice made, pressing "Hold this as a standard" or "Relate to a law" refuses in place (`screen.standard.declare.empty`/`.relate.empty` or a new "choose a kind" key) and sends nothing; after choosing, the chosen value is sent; control: the draw has a leading empty option (no option `selected`).
4. Owning module: `screens-investigate` (`standard.mjs`; same pattern wherever a fixed-list `cs.choice` has a `|| "<first>"` fallback; also `proceeding.mjs` kind choice if it is seeded). The shell choice may need a "blank first option" parameter: if so `interface-shell` also, a small change to the kit (BOB to decide it is the kit's, not each screen's).

## C12. OV7.find-in: WALKER-ERROR

Verdict: WALKER-ERROR (a false positive of the check).

1. `screens-daily/find-in.mjs:130-136`: the question choice's first option is `{ value: "", text: cs.w("findin.question.choose") }` ("For which question", `rows.mjs:5615`, DEC-300: "a choice of the project's questions"), drawn only when the find was opened without a question, with the comment "None is preselected unless the find was opened with one: the first line only asks to choose". Its value is empty, so nothing is chosen. The walker's script (`08-law.test.mjs:873-874`) reports any select whose selected option has text, which here is the prompt. The act reads `String(cs.value("findin-question") || "")` (`:225`, `:271`), so a press without choosing sends an empty question.
2. Tests: not examined (no defect). 3. No failing test. 4. No owner; the check should test the option's `value`, not its text.

## C13. The glossary holds no law term: R216.2 (D12)

Verdict: SPECIFIED today (a requirement gap) and WORDS. The page is as `screens-settings` R59 specifies.

1. `screens-settings/glossary.mjs:21-23`: `MONEY = ["acfr","cafr","gpf","fy"]`, `HONEST = ["fingerprint","timestamp","signature","manifest","provenance"]`, `STATES = [16 item states]`, and the page draws exactly those (`:30-40`). Requirement `screens-settings` R59 (T51; DEC-330 A11) specifies "two groups of terms (money and budgets; how the record is kept honest) ... what each of the sixteen item states allows". `standard`, `in force`, `benchmark`, `discretion`, `writ`, `proceeding` are in no group, no `glossary.term.*` key exists for them, and nothing in the requirement says they should be. The walker's check (walk coverage R216) expects them; no requirement says so.
2. Tests: `screens-settings` glossary tests assert the listed terms. 3. Failing-first test (after the requirement is amended): `bio-plane/test/m/screens-settings/` glossary test: the page lists `standard`, `in force`, `benchmark`, `discretion`, `writ`, `proceeding`, each with a definition read by key. 4. Owning module: `screens-settings` (R59 amendment plus a group of terms); the definitions are words from the UX design stream (WORDS: goes there, with the list of terms). No platform dependence. Recommend to the UX design stream; not Bob's decision.

## C14. The records help page contradicts itself: R216.3 (D15; walker marks it out of this sitting's area)

Verdict: SPECIFIED seam still owed (profile data) plus WORDS.

1. Root cause with evidence. `jurisdictions/profiles/oakland-alameda.mjs` has no `records_help` block (`grep records_help` finds it only in `test-port-ellery.mjs:530`). `screens-action/help-records.mjs:89` draws `screen.help-records.notheld` ("Your team's Civicsmith doesn't hold records help for this place yet, so none is shown here. The law's own text is the place to look.", `rows.mjs:5770`) when the profile view has no block, and `:90-112` still draws the "faster" and "sources" sections from `records_laws` (`held(p)`), which the profile does hold (Cal. Gov. Code § 7922.535(a), Oakland Mun. Code § 2.20.230). `screens-action` R22 states both halves: "where the active profiles hold no `records_help` the page draws none of those sentences and says `screen.help-records.notheld`" and, in its own words, "Seam: the first profile's block is owed to `jurisdictions` (T50-54, `records_help`)". The block was never added to the first profile. So the page says "none is shown here" and then shows the laws. The place's facts (state law, the city's faster request, the portal) are the part the walker's row asks for.
2. Why the module tests missed it. `screens-action` tests use the test profile's block (`test-port-ellery.mjs:530`); the "none" case is tested with an empty view, not with the one shipped profile, whose laws it still draws.
3. Failing-first test. `jurisdictions/test/`: `get("oakland-alameda").records_help` is present and valid (R93: `law`, `days`, `extra_days`, `extension_reasons`, `citations`, `status`, `basis`).
4. Owning modules: `jurisdictions` (the sourced `records_help` block: data a worker must source from the statutes, `basis` required) and `screens-action` (words: when the block is missing but the laws are held, the sentence should not say "none is shown here" or the laws should not be drawn: UX design stream). No platform dependence.

## Also (WORKS rows whose text names a defect)

- OV4.1 (D13): a failed read draws "This could not be read. Try again in a moment." with no reason; WORDS (UX design stream). With a bare HTTP 500 the screen has no reason to give.
- R70.12 (D14): "recorded by member:admin" inside the plane's `why`, drawn as given by `standard.mjs:97` (`P.why`); a raw stamp in member text: DEFECT, owner `standards` (the `why`) with `screens-investigate` (draw `P.who`).
