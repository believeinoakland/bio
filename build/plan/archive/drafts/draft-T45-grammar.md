# Draft: T45 requirement text, action-grammar (L9, position 117) — for BOB's review

**Status** · A fold worker's draft for BOB (fold brief), 2026-10-11, on `tranche/T44`. Not adopted, nothing committed. Requirements are BOB's (P5); every line is a proposal for BOB to word, number and place.

Sources (read whole): `REQUIREMENTS-HANDOFF.md`, `canon-draft/BIO_Action_v0_2.md`, `DESIGN.md` (whole), `research/S1-synthesis.md` §B1, §C, §D (on `origin/design/actions`); `build/plan/next.md`; `build/requirements/README.md`; `action-grammar.md`; the drafts `draft-T45-l9a.md` (its "Owed to others → action-grammar"), `draft-T45-l9b.md`, `draft-T45-l8.md`, and `draft-T45-lower.md`, `draft-T45-upper.md` for what they expect of this module; the used services `jurisdictions` R37 (`isLocale`), R58; `civil-time` `isCalendarDate`; `record-grammar` R46–R47 (`idPattern`); `actions` R9, R25, R45. Code read only to word change vs new: `action-grammar/grammar.mjs` (the vocabularies, `lifecycleFindings`), `checks.mjs` (`counterpartyFindings`, `checkActionExtension`, the C-117 rows: highest C-117.29), `actions/index.mjs` (where `premise_override` and `lifecycleFindings` are asked), `action-clocks/index.mjs`:90 (`BASIS_KINDS`).

**Order and layer.** `action-grammar` is position 117 in `build/modules.json`, layer 9, after `consequences` (116), before `actions` (118). Its uses today: `record-grammar`, `jurisdictions`, `civil-time`, `connections`, `inquiry-grammar`, all earlier. Pure (R10): every fact a check needs (the profile view, the response statuses, the document's own id) is handed in.

**Next free id: R15** (highest R14; none retired). New ids used: R15–R25. Amended: Purpose, R2, R5, R7, R8, R9, R11, Satisfies.

Citations: "v0.2 rule n" is `BIO_Action_v0_2.md` §4; "Actions D n" the lane's register.

---

## 1. Changes

**Purpose**, append: (T45; N884, N861, N892; Actions D1, D11, D28b; v0.2 rules 2, 9, 21; DESIGN §10 "Assertion phrasings") It also holds the grammar of the fields T45 adds to an action and its correspondence (R15, R20–R25), and the **phrasing lists**: per language, the phrasings Civicsmith holds that make a sentence read as an assertion of a breach, a policy position, or an ask for the group's own benefit, which a profile may extend, and the pure finder that points out the sentences of a text matching them (R16–R19). Pointing out at approval, and recording the member's resolution, are the callers' (`filings`, `actions`). *(not yet met: T45)*

### 1.1 The vocabularies

- **R2 amended**, append: (T45; Actions D12, D13, D15, D18, D4; v0.2 rules 2, 6, 8, 15, 16; S1 §C 7, §C 10) Also exported frozen, one binding each, read by every module and published by `affordances` as the others are: `OVERRIDE_GROUNDS` (`legal_deadline`, `irreversible_act`; R15); `PHRASING_KINDS` (`assertion`, `position`, `own_benefit_ask`; R16); `ASSERTION_RESOLUTIONS` (`only_asks`, `breach_claim`; R19); `PRESS_RECORD_TERMS` (`on_record`, `background`, `off_record`; R21); `FOUND_ELSEWHERE_KINDS` (`press`, `report`, `decision`, `statement`, `other`; R22); `BEARINGS` (`new_evidence`, `disputed_without_evidence`, `not_addressed`; R24); `PROMISE_KINDS` (`embargo`, `anonymity`, `other`; `actions` R88); `CLOCK_OWED_BY` (`group`, `body`, `undetermined`; R7). Every earlier export keeps its value: `PRODUCT_KINDS` stays the three of v0.2 §6, `RESOLUTIONS` the five, `CORRESPONDENCE_OUTCOMES` the seven (Doubt 10). *(not yet met: T45)*
  - Control: each earlier export is byte-identical to T44's.

### 1.2 The gate: the override's ground (rule 2; D3, D18)

- **R15 new** (T45; N884; Actions D3, D18; v0.2 rule 2) `overrideGroundFindings(override, findings)`, pure, never throws, pushes C-2.10 findings with codes. `override.ground` is one of:
  - `{kind: "legal_deadline", citation, date}`: `citation` 1 to `CITATION_MAX` (200) characters with no quote, backslash or line break; `date` a real calendar date (`civil-time.isCalendarDate`);
  - `{kind: "irreversible_act", what, when}`: `what` 1 to 500 characters, same text rule; `when` a real calendar date or `YYYY-MM-DDTHH:MM` with a real date and a time from 00:00 to 23:59.

  A `ground` absent, not an object, or of another `kind` pushes `OVERRIDE_NO_GROUND`, its message naming both grounds; a part missing or malformed, or a key the kind does not have, pushes `OVERRIDE_GROUND_REFUSED`, naming the part. `actions` asks it at the write that states an override (its R74) and mints the refusal with `grounds` and `quick_route`. The `reason` stays `actions`' (its R8, R14). *(not yet met: T45)*
  - Controls: each ground well formed pushes nothing; `{kind: "legal_deadline", citation, date: "2026-02-30"}` pushes `OVERRIDE_GROUND_REFUSED`; no ground pushes `OVERRIDE_NO_GROUND`.

### 1.3 The phrasing lists and the finder (rules 2, 9, 21; D1, D11, D28b)

- **R16 new** (T45; N884, N861, N892 (b); Actions D1, D11, D28b; v0.2 rule 2 "a list of phrasings Civicsmith holds for each language", rule 9, rule 21) `PHRASINGS` is exported frozen: per language (a BCP 47 primary language subtag), per kind of `PHRASING_KINDS`, a list of phrasings, each a string of 2 to 100 characters on one line. It is product data, holds no place (R11) and names no office, person or party. At T45 it holds English (`en`) for each kind (Doubt 3), at least these phrasings, which the tests pin:
  - `assertion`: "illegal", "illegally", "unlawful", "unlawfully", "violated", "in violation of", "broke the law", "in breach of", "breached", "failed to comply with", "covered up";
  - `position`: "we support", "we oppose", "should adopt", "should pass", "should reject", "vote yes", "vote no", "vote for", "vote against";
  - `own_benefit_ask`: "pay us", "pay our", "fund our", "hire us", "contract with us", "donate to us".

  The job may add phrasings from the canon's and S1's examples (S1 §B1: "staff illegally split the contract", "the City routinely hides records"); it never removes one of these without a requirement change (Doubt 4). *(not yet met: T45)*
  - Control: every pinned phrasing is present in its kind; no kind's list is empty for `en`.

- **R17 new** (T45; Actions D1; v0.2 rule 2 "which a profile may extend"; DESIGN §10) `phrasingsFor({language, kind, view?})`, pure, never throws, answers the phrasings that apply: `{state: "read", language, phrases: [{phrase, origin}], ignored}`.
  - `language` is a tag `jurisdictions.isLocale` accepts (its R37); a list is found by the whole tag, case-insensitive, else by its primary language subtag (`en-US` reads `en`).
  - `origin` is `product` (R16) or `profile`: each item of `view.phrasings` (the active profiles' combined view, which the caller reads from `jurisdictions` and hands in, as `actionKinds(view)` takes it; the section is owed to `jurisdictions`, §3) whose `locale` matches as above and whose `kind` is `kind`, its shape `{locale, kind, phrase, basis}`, `phrase` as R16's.
  - A profile **extends only**: nothing in the view removes or narrows a product phrasing. A profile phrasing equal to a product one (after R18's normalisation) is answered once, `origin: "product"`. A malformed profile item is not used and is named in `ignored` with why.
  - `{state: "undetermined", why}`: `why` is `language_malformed` (a tag `isLocale` refuses), `kind_unknown`, or `no_list` (neither the product nor the view holds a phrasing for that language and kind). It never answers an empty `phrases` as `read`.
  
  *(not yet met: T45)*
  - Controls: `en` with a view adding one English phrasing answers both origins; `es` with no view answers `undetermined` `no_list`; `es` with a view holding a Spanish phrasing answers it `read`.

- **R18 new** (T45; N884, N861, N892 (b); Actions D1, D11, D28b; v0.2 rules 2, 9, 21) `pointOut({sentences, language, kind, view?})`, pure, never throws: the sentences of a text that match a phrasing R17 answers for `language` and `kind`.
  - `sentences` is the text already split by the caller (`filings` splits it once, as its record check does): a list of 0 to 5,000 strings, each at most 10,000 characters. Anything else answers `{state: "undetermined", why: "not_sentences"}`, never a partial read.
  - Matching: each sentence and phrasing is read in Unicode NFC, case-folded, with typographic apostrophes and quotes read as their plain forms and each run of white space as one space; a phrasing matches where it occurs with no letter, mark or digit immediately before or after it.
  - It answers `{state: "read", language, kind, pointed: [{index, phrase, origin, start, end}]}`: every match in every sentence, in sentence order then position (`start`, `end` the offsets in the sentence as given). A question is not exempt (Doubt 7). R17's `undetermined` answers pass through unchanged, with no `pointed`.
  - It decides nothing: it never says a sentence asserts, takes a position or asks for benefit, only that it matches; a sentence not pointed out is not thereby cleared (rule 2: "No tool has the final word").
  
  *(not yet met: T45)*
  - Controls: "Staff illegally split the contract." points out "illegally"; "We ask the Auditor to examine five purchase orders." points out nothing (`read`, `pointed: []`); "Illegality" does not match "illegal" (word boundary); "IN  BREACH OF" matches "in breach of"; `sentences: "text"` answers `undetermined`.

- **R19 new** (T45; N884; Actions D1; v0.2 rule 2 "the member resolves each one: she rewrites it, confirms in her own recorded words that the act only asks, or treats the act as a breach claim"; S1 §B1) The grammar of a member's resolutions. `assertionResolutionFindings({sentences, pointed, resolutions}, findings)` and `assertionsUnresolved({sentences, pointed, resolutions})`, pure, never throw.
  - `pointed` is R18's answer for `kind: "assertion"` over `sentences` as they now stand. A rewritten sentence that R18 no longer points out needs no resolution: rewriting is the first way, recorded by the text itself.
  - `resolutions` is a list of `{sentence, resolution, words?}`: `sentence` the exact text of a pointed-out sentence; `resolution` one of `ASSERTION_RESOLUTIONS`; `words` required for `only_asks`, the member's own words that the act only asks, 1 to 500 characters on one line, and refused on `breach_claim`. A resolution naming no pointed-out sentence, a second resolution of one sentence, or a malformed one pushes `ASSERTION_RESOLUTION_REFUSED`, naming the item.
  - `assertionsUnresolved` answers `{unresolved: [index], breach_claim: boolean}`: the pointed-out sentences with no well-formed resolution, and whether any resolution treats the act as a breach claim. A resolution binds the exact text: an edited sentence is unresolved again. An `undetermined` `pointed` answers `{state: "undetermined"}`, never `unresolved: []`.
  - Who resolves (a member, never a machine), where the resolution is recorded, and the refusal at approval are the caller's (§3, Doubt 6).
  
  *(not yet met: T45)*
  - Controls: an `only_asks` with words resolves its sentence; the same without words pushes the refusal; after the sentence is edited it is unresolved again; one `breach_claim` answers `breach_claim: true`.

### 1.4 Addressing (rule 7; D12, D16; S1 §C 4)

- **R8 amended**, append: (T45; N879; Actions D12; v0.2 rule 7 "A reporter's name is kept inside the group as the role's holder") `counterpartyFindings` accepts on the press arm `holder: {name}`, `name` 1 to 200 characters with no quote, backslash or line break; `holder` malformed, or on any other arm (office, organisation, group, audience, undetermined), pushes a C-2.10 finding naming the arm `holder`, which `actions` answers `COUNTERPARTY_REFUSED` (its R9). Every finding on a counterparty without `holder` is byte-identical to T44's. *(not yet met: T45)*
  - Control: a press counterparty with a holder pushes nothing; the same holder on an office pushes the finding.

- **R20 new** (T45; N883; Actions D12, D16; v0.2 rule 7, §6 `partners`; S1 §C 4) `copiedFindings(fm, findings)` and `partnersFindings(fm, findings)`, pure, never throw, C-2.10 with codes:
  - `copied`: absent, or a list of 0 to 20 (`COPIED_MAX`) addressees, each a named arm of R8 (office, or press, organisation or group by role), never `audience` or `undetermined`; each checked as R8 checks a named counterparty, the finding naming `copied[i]` (code `COUNTERPARTY_REFUSED`); two equal entries, or more than 20, push the same code. An office in `copied` equal to the counterparty office (equal `entity_id`, else equal `{role, body}`, `counterpartyOffice`) pushes `COPIED_IS_ADDRESSEE`.
  - `partners`: absent, or a list of 0 to 20 (`PARTNERS_MAX`) organisations by role, each `{role, organisation, entity_id?}`: `role` and `organisation` 1 to 200 characters with R8's text rule, `entity_id` an `ENT-` id by `record-grammar`'s `idPattern` (R12); any other key (a `name`, a person) or a repeated organisation (equal `entity_id`, else equal case-folded `organisation`) pushes `PARTNERS_REFUSED`, naming the entry. Whether an `entity_id` names an organisation and not a person is `actions`' (it reads `entities`).
  
  *(not yet met: T45)*
  - Controls: a copied office distinct from the addressee and a well-formed partner push nothing; `copied` holding the addressee's office pushes `COPIED_IS_ADDRESSEE`; a partner `{name: "Jo Smith"}` pushes `PARTNERS_REFUSED`.

- **R21 new** (T45; N879; Actions D12; v0.2 rule 8 "Press terms (on the record, embargo, release time) are noted on each press action") `pressTermsFindings(fm, findings)`, pure, never throws: `press_terms` absent, or `{on_record, embargo_until?, release_at?, note?}`, `on_record` one of `PRESS_RECORD_TERMS`, `embargo_until` and `release_at` each `YYYY-MM-DDTHH:MM` with a real date and time, `note` at most 500 characters with R8's text rule; malformed or carrying another key pushes `PRESS_TERMS_REFUSED`; stated on an action whose counterparty is not the press arm pushes `PRESS_TERMS_NOT_PRESS`. *(not yet met: T45)*
  - Control: well-formed terms on a press action push nothing; the same on an office action push `PRESS_TERMS_NOT_PRESS`.

### 1.5 Correspondence and the action's own fields (rules 6, 8, 16; §5; S1 §C 2, 5, 8, 10, 11)

- **R22 new** (T45; N879, N880; Actions D12, D13; v0.2 rules 8, 16, §6; DESIGN §10 "Outcomes"; S1 §C 5, 10, 11) `entryFieldFindings(entries, i, facts?)`, pure, never throws, for one correspondence entry (run at `actions`' R15 as `lifecycleFindings` is, and in the audit, R7):
  - `office_status: {words, status?}` only on a `received` entry carrying an `outcome` (R5's fixed vocabulary, never replaced), else `OFFICE_STATUS_WITHOUT_OUTCOME`; `words` the office's own status wording, 1 to 500 characters with no line break, else `OFFICE_STATUS_WITHOUT_OUTCOME` naming `words`. `status`, when stated, must be one of `facts.responseStatuses` (the active profiles' `response_statuses` for the action's kind, `jurisdictions` R58, read and handed in by the caller), else `OFFICE_STATUS_UNKNOWN`; with no `facts.responseStatuses`, a stated `status` is `OFFICE_STATUS_UNKNOWN` and `words` alone is accepted. The audit hands no facts and judges `words` and the outcome only, as `due_cite` is judged at the act and not over history (R5; Doubt 9).
  - `found_elsewhere: {kind, note?}` only on a `received` entry, `kind` one of `FOUND_ELSEWHERE_KINDS`, `note` at most 500 characters; else `FOUND_ELSEWHERE_REFUSED`. An entry stating it with no `artifact_sha` (an account alone) pushes `FOUND_ELSEWHERE_NEEDS_CAPTURE`.
  - `speaker` only on a `sent` entry, a member id as `actions`' `contactId` reads one (`member:<id>` or bare), 1 to 200 characters; on another direction, or malformed, `SPEAKER_REFUSED`. Whether it names a member of the instance is `actions`' (`CONTACT_NOT_A_MEMBER`, its R45, R94).
  
  An entry with none of the three pushes nothing new: every finding on a ledger written before T45 is byte-identical. *(not yet met: T45)*
  - Controls: `office_status` with an outcome and a held status pushes nothing; without `outcome` pushes `OFFICE_STATUS_WITHOUT_OUTCOME`; `found_elsewhere` on a `sent` entry pushes `FOUND_ELSEWHERE_REFUSED`; `speaker` on a `received` entry pushes `SPEAKER_REFUSED`.

- **R23 new** (T45; S1 §C 2, §C 8; v0.2 rule 6 "never records silence as non-response", §5 "new actions linked to it") `actionFieldFindings(fm, ctx, findings)`, pure, never throws:
  - `reply_owed`: absent (owed), `true` (owed) or `false` (no reply owed); any other value pushes `REPLY_OWED_REFUSED`. Refusing a `no_response` entry while `false` is `actions`' at the act (its R82), not this module's over history.
  - `follows_action`: absent, or `{action, ord?}`, `action` an action bundle id (`BUNDLE_ID_RE`, its prefix of type `action` in `OBJECT_TYPES`), `ord` a non-negative integer; malformed or carrying another key pushes `FOLLOWS_ACTION_REFUSED`; equal to `ctx.bundleId` (the document's own id, handed in by the caller) pushes `FOLLOWS_ACTION_SELF`. That it names an action the author may see, and is never rewritten, is `actions`' (its R86).
  
  *(not yet met: T45)*
  - Controls: `reply_owed: false` and a link to another action push nothing; `reply_owed: "no"` and a self-link push their codes.

- **R24 new** (T45; N880; Actions D13; v0.2 rule 16 "laid out claim by claim (new evidence, disputed without evidence, not addressed)"; S1 §C 7) `bearingFindings(claims, legTargets, findings)`, pure, never throws: `claims` a list of 1 to 50 `{claim, bearing, note?}`, `claim` one of `legTargets` (the action's `advances` and `rests_on` leg targets, handed in), none twice, `bearing` one of `BEARINGS`, `note` at most 500 characters; any fault pushes `BEARING_REFUSED`, naming the item. `actions` asks it at its R84 (the member's layout and the assistant's proposal alike). *(not yet met: T45)*
  - Control: one claim per leg with a listed bearing pushes nothing; a claim not among the legs pushes `BEARING_REFUSED`.

- **R25 new** (T45; N858; v0.2 §5 "Which stages a law has comes from the profile"; S1 §C 18, §D 15; `jurisdictions` R76 in `draft-T45-lower.md`) Stages per law, pure, never throw:
  - `lawStagesFindings(stages)` answers one finding `LAW_STAGE_UNKNOWN` per item of a records law's profile `stages` (`[{stage, label, citation}]`) whose `stage` is not a stage of `CORRESPONDENCE_STAGES` (either direction), naming it; `[]` for a well-formed list. It is the check `jurisdictions` cannot make (it is earlier) of the names its `stages` holds.
  - `stageInLaw(stage, stages)` answers `in_law`, `not_in_law`, or `undetermined` when `stages` is absent or not a list (the law's stages not held), never `in_law` by default. A stage `lawStagesFindings` reports is never `in_law`. `actions` reads it at its R85 (`STAGE_NOT_IN_LAW`).
  
  *(not yet met: T45)*
  - Controls: a CPRA-like list without `fee_waiver_request` answers `not_in_law` for it and `in_law` for `appeal`; no list answers `undetermined`; `{stage: "mediation"}` is reported `LAW_STAGE_UNKNOWN`.

### 1.6 The lifecycle, the audit and the rows

- **R5 amended**, append: (T45; S1 §D 14, verified) The lifecycle grammar is the same for every kind: its stages are keyed by direction, never by kind, so an `acknowledgement` on a `request_for_comment`'s `received` entry is accepted (`grammar.mjs`, `CORRESPONDENCE_STAGES`; `actions` asks it for every kind). *(met as built; the test is owed: T45)*
  - Control: an `acknowledgement` on a `sent` entry still pushes `STAGE_NOT_OF_DIRECTION`.

- **R7 amended**, append: (T45; N882; Actions D15; v0.2 rule 6 "What the group itself owes a venue … is held as the group's own deadlines") The audit also reports, over the document, R15 (only for a `premise_override` that states a `ground`: an override written before T45 with none reads as written, `ground: null`, and is not reported; Doubt 8), R8's `holder`, R20, R21, R22 (with no facts), R23 (with `ctx.bundleId` when the caller has it), and C-11.1's `owed_by` arm: a clock entry's `owed_by`, when stated, is one of `CLOCK_OWED_BY`, else a C-11.1 finding; absent reads `undetermined`, never defaulted (`action-clocks` R18 in `draft-T45-l9b.md` reads it). For a corpus of action documents written before T45, the findings are byte-identical, in order, to T44's. *(not yet met: T45)*
  - Controls: a clock entry `owed_by: "us"` is reported; one `owed_by: "group"` and one without `owed_by` are not; the pre-T45 corpus is unchanged.

- **R9 amended**, append: (T45; `draft-T45-l9a.md` rows) The module also holds, each `{check, where, translation}` with its `where` naming the site that raises it, the next numbers of C-117 from C-117.30, numbered at the job's stamp: `actions`' new refusals (`DETERMINATION_NOT_NONCOMPLIANT`, `OVERRIDE_NO_GROUND`, `OVERRIDE_GROUND_REFUSED`, `COPIED_IS_ADDRESSEE`, `MACHINE_CANNOT_SET_PARTNERS`, `PARTNERS_REFUSED`, `MACHINE_CANNOT_SET_PRESS_TERMS`, `PRESS_TERMS_NOT_PRESS`, `PRESS_TERMS_REFUSED`, `RECEIPT_NOT_ON_SENT`, `OFFICE_STATUS_UNKNOWN`, `OFFICE_STATUS_WITHOUT_OUTCOME`, `MACHINE_CANNOT_SET_REPLY_OWED`, `NO_REPLY_OWED`, `FOUND_ELSEWHERE_NEEDS_CAPTURE`, `MACHINE_CANNOT_RECORD_BEARING`, `BEARING_NOT_RFC`, `BEARING_REFUSED`, `STAGE_NOT_IN_LAW`, `FOLLOWS_ACTION_REWRITTEN`, `FOLLOWS_ACTION_SELF`, `MACHINE_CANNOT_SET_SCOPE`, `SCOPE_NO_REASON`, `SCOPE_UNCHANGED`, `MACHINE_CANNOT_RECORD_PROMISE`, `PROMISE_REFUSED`, `HOLD_PLACE_REFUSED`, `MACHINE_CANNOT_SEND`, `HOLD_NOT_IN_PLACE`, `MACHINE_CANNOT_LINK`, `AROSE_FROM_NOT_A_RESPONSE`, `AROSE_FROM_LINKED`) and the codes this draft adds for the fields' shapes (`FOUND_ELSEWHERE_REFUSED`, `SPEAKER_REFUSED`, `REPLY_OWED_REFUSED`, `FOLLOWS_ACTION_REFUSED`, `LAW_STAGE_UNKNOWN`). C-117.22 (`HOLD_NO_LEGAL_MARK`) is retired, its number never reused; the list's "C-117.20–.22" reads "C-117.20, .21 (and .22, retired T45)". The translations are BOB's drafts, the UX stream's to revise. Each new code's finding (R15, R20–R25) carries the same code as its row. *(not yet met: T45)*

- **R11 amended**, append: (T45) The phrasing lists (R16) name no place, office or person; the test profile extends them (one phrasing per kind in English and one in a second language), and the tests read a text in that language with and without the profile's phrasings. *(not yet met: T45)*

**Satisfies:** replace "`BIO_Action_v0_1.md` (canon whole, K608): §3, §4 rules 2, 5, 6, 7, 12 and 13" with "`BIO_Action_v0_2.md` (canon whole, K2775): §3, §4 rules 2, 6, 7, 8, 9, 15, 16, 21, §5, §6"; add Actions D1, D3, D12, D13, D15, D16, D18, D28b; DESIGN §10 ("Assertion phrasings", "Outcomes"); S1 §C 2, 4, 5, 7, 8, 10, 11, 18; S1 §D 14, 15. The rest unchanged.

**Suggestions**, add: (T45) The job writes every new field grammar as `actions`' earlier arms are written (K653's pattern: a pure finding with its code, `actions` mints the refusal from the first). The English lists are data in their own file beside `grammar.mjs`. Tests: each of R15–R25 with the controls above; the pre-T45 corpus byte-identical (R7); R9's new rows by the catalogue-census arm.

## 2. Uses

No new edge. Changed names within existing edges:
- `jurisdictions` (L1): adds `isLocale` (its R37; R17). The view's `phrasings` section is read from the object the caller hands in, as `actionKinds(view)` reads `action_kinds`.
- `civil-time` (L1): adds `isCalendarDate` (R15).
- `record-grammar` (L1): `idPattern('ENT')` (R20), `BUNDLE_ID_RE`, `OBJECT_TYPES` (R23), already used.

No edge points later. `actions` (118), `filings` (121), `action-clocks` (119), `affordances` (L11) and `agent-worker` (L6, earlier: it reads nothing here, Doubt 12) stay readers of this module or independent of it.

## 3. Owed to others

- **jurisdictions** (L1; not in `draft-T45-lower.md`): a profile section `phrasings`, `[{locale, kind, phrase, basis}]`, `locale` by `isLocale`, `kind` one of three names (`assertion`, `position`, `own_benefit_ask`, spelled in the profile grammar since `jurisdictions` cannot read this module), `phrase` 2 to 100 characters on one line; unioned in `combine` (R14); the test profile holds R11's items. The first profile holds none until a group asks (rule 11).
- **filings**: run `pointOut` over every prepared outward text (`assertion`, rule 2), over public comment and testimony "for the group" (`position`, rule 9; its R39 in `draft-T45-l9b.md`), and over a chance-to-fix notice or demand (`own_benefit_ask`, rule 21; its R38); union the list's answer with the assistant's `textcheck` (`agent-worker` R76 in `draft-T45-lower.md`, labelled machine work); record each member's resolution (R19) with the approval and refuse approval while `assertionsUnresolved` is non-empty or `undetermined` (rows in its C-115 family: e.g. `ASSERTION_UNRESOLVED`, `ASSERTION_RESOLUTION_REFUSED`); a `breach_claim` resolution makes the action a breach action through `actions`' revision (R8's gate). Language handed in: the draft's language as the member states it.
- **actions**: ask R15, R20–R23 at its writes (its R74, R77–R79, R81–R83, R86, R94) and R24, R25 at its R84, R85, minting each refusal from the first finding; hand `facts.responseStatuses` and `ctx.bundleId`; accept and pass a clock entry's `owed_by` at its write (owed by `draft-T45-l9b.md`, `<actions: clock entry's owed_by>`).
- **action-clocks**: read `CLOCK_OWED_BY` (its R18); its `BASIS_KINDS` (`stated`, its R7) stays its own.
- **agent-worker** (lower draft R76): its `reads_as` names match `PHRASING_KINDS` (`assertion`, `position`, `own_benefit_ask`) plus its own `staff_named`; it cannot import them (it is earlier), so the names are spelled there and the plane's composition test checks the match.
- **affordances** (L11): publish the new vocabularies (R2) as it publishes the others.
- **Who runs `lawStagesFindings` on a loaded profile** (instance-setup or affordances, L11): BOB names it (Doubt 11).
- **UX design stream** (keyed sentences, words theirs): `phrasing.assertion.pointed`, `phrasing.position.pointed`, `phrasing.own_benefit_ask.pointed` (why a sentence is pointed out); `phrasing.no_list` (no list held for this language: nothing could be pointed out); the three resolution choices and the prompt for "in your own words, this only asks" (`assertion.resolve.rewrite`, `.only_asks`, `.breach_claim`); labels for `PRESS_RECORD_TERMS`, `FOUND_ELSEWHERE_KINDS`, `BEARINGS`, `PROMISE_KINDS`, `CLOCK_OWED_BY`, `OVERRIDE_GROUNDS`; the translations of the new rows (R9).

## 4. Doubts

**BOB's (technical or wording; recommended reading):**
1. **Three lists here, not only the assertion list.** l9a owes the assertion list; l9b's `filings` R38 wants the own-benefit list "held where the assertion list is", and R39 a position list with no home. *Reading:* one mechanism, three kinds, here.
2. **The finder takes sentences, not text.** No earlier module exports a sentence splitter; `filings` already splits for its record check (R34), and one split keeps the indexes of the two checks aligned. *Reading:* as drafted.
4. **The phrasings' content.** They are detection data, not member-facing words, so not the UX stream's; the anchors are drawn from canon's and S1's examples. *Reading:* BOB reviews the list at the job's merge. Suggested M-note (BOB numbers it): measure the English lists over a corpus of real complaint, comment and demand letters (how many sentences pointed out, how many members would rewrite) before they grow.
6. **Where the resolution is recorded.** l9a puts the resolution at `filings`' approval; `draft-T45-upper.md` lists "assertion resolution per sentence" among `actions`' acts, and l9b calls it "`actions`' gate, `filings`' approval". *Reading:* `filings`, which holds the text and the approval; the grammar here serves either.
7. **Questions are not exempt.** Rule 3 never flags a question in the record check, but a rhetorical question can assert ("Why does the City keep breaking the law?"). *Reading:* point it out; the member resolves it as "only asks" in one act.
8. **Overrides written before T45** have no ground; the audit does not report them (l9a Doubt 6's reading, carried into the audit).
9. **`office_status.status` is judged at the act only** (the profile's statuses can change; the `due_cite` precedent, R5).
11. **Who checks a profile's `stages` names at load.** `jurisdictions` cannot read this module. *Reading:* `actions` reads an unknown stage as not in the law (R25), and the L11 module that validates the loaded view (instance-setup) reports `LAW_STAGE_UNKNOWN`; BOB names it.
12. **agent-worker spells the kind names itself** (it is L6). *Reading:* names spelled twice, a composition test pins them.
13. **New shape codes not in l9a's list** (`FOUND_ELSEWHERE_REFUSED`, `SPEAKER_REFUSED`, `REPLY_OWED_REFUSED`, `FOLLOWS_ACTION_REFUSED`, `LAW_STAGE_UNKNOWN`): l9a named no code for these malformed shapes; BOB aligns `actions`' refusal lists.
14. **Press terms' order** (a `release_at` before `embargo_until`) is not checked: nothing ruled it. Add only if UX asks.
15. **S1 §D 14, verified in code:** `lifecycleFindings` keys stages by direction only and `actions` asks it for every kind (`actions/index.mjs`:1465), so an acknowledgement on a request for comment is accepted. R5 pins it; nothing else changes.

**Possibly Bob's (options and a recommendation):**
3. **Which languages have a list at T45** (rule 2's protection for members working in other languages). Canon: "a list of phrasings Civicsmith holds for each language". Options: (a) English now; any other language reads `undetermined` ("no list held"), never "nothing found", until a group asks, and a profile may add phrasings at once (rule 11's pattern); (b) English and Spanish now, which needs a fluent reviewer to write Spanish detection phrasings; (c) English only, silent elsewhere. *Recommendation: (a)*, told to Bob as the reading of "for each language" (each language a group works in, as it asks). (c) would hide the gap.
5. **The own-benefit list and remedy asks** (ties to l9b Doubt 7). Rule 21 allows asking "for remedy of the harm"; a phrasing such as "reimburse" or "refund our fee" is often exactly that, and l9b's R38 refuses approval on a match with no override. Options: (a) keep the list narrow to phrasings that cannot be a remedy ("pay us", "hire us"), as R16 drafts, refusal stays as l9b drafts; (b) any phrasing, but a match is resolved like an assertion (the member confirms in her own words that it asks only for remedy), which softens D28b's "never prepared"; *Recommendation: (a)*, which keeps Bob's ruling's words and avoids refusing remedies.
10. **`none_exists` and canon §6's outcome list.** Canon §6 lists the outcomes "granted, denied, partial, reversed, affirmed, none stated"; `none_exists` was added at T41 (K2505, H30 (1)) and canon does not name it. Options: (a) keep it, BOB recording that §6 is read with K2505 and telling Bob; (b) retire it (`R13` changes meaning, and records answered "no record exists" become `none_stated`). *Recommendation: (a).*

## 5. Size

Today 1,951 non-test lines (`checks.mjs` 1,475, `grammar.mjs` 471, `index.mjs` 5). This adds an estimated 750–950: the field grammars about 300, the lists, `phrasingsFor`, `pointOut` and the resolution grammar about 250 (data included), about 37 rows at about 6 lines each, about 220, the audit arms about 60. About 2,700–2,900: under the ~4,000 mark (K617), no split. l9a's estimate of about 250 here covered the field grammars only.

## 6. N-entries

- **Fully applied by this draft:** none; each entry spans other modules.
- **Parts applied here** (each moves to applied when the last of its owning drafts is adopted): N884 (the ground's grammar R15, the assertion list and finder R16–R19; the override act is `actions`', the disclosure `filings`'); N861 (the position list, R16, R18; pointing out in testimony is `filings` R39); N892 (b) (the own-benefit list; the refusal is `filings` R38); N879 (the press `holder` and terms grammar, R8, R21; the speaker's shape, R22); N883 (`partners`' grammar, R20); N880 (`BEARINGS` and their grammar, R24); N882 (`CLOCK_OWED_BY` and its audit arm, R7); N858 (stages per law, R25).
- **Nothing here** for N828, N855, N881, N885, N887, N890.
- Hard reason for every remaining part: it lives in another module's draft in this fold.

## 7. Each hand-off line touching action-grammar, and where it went

The hand-off names no line for `action-grammar`; these are the lines whose grammar is this module's (its Purpose: the action vocabularies and the arms over an action's document), and l9a's owed list.

| hand-off line (its module) | placed |
|---|---|
| actions, the gate: "assertion sentences pointed out from a per-language phrasing list (profile-extendable) plus AI where enabled, each resolved by the member (rewrite / confirm-asks, recorded / treat as claim)" | R16, R17, R18 (list, extension, finder); R19 (resolutions); recording and approval → `filings` (§3); AI → `agent-worker` (lower draft) |
| actions, the gate: "only the two grounds (cited legal deadline with date; imminent irreversible act, what and when)" | R15; R2 `OVERRIDE_GROUNDS`; the refusal → `actions` R74 |
| actions, addressing: partners as organisations by role (field); one action per office, others copied; reporter's name kept as the role's holder | R20 (`partners`, `copied`); R8 amended (`holder`) |
| actions, press terms note | R21; R2 `PRESS_RECORD_TERMS` |
| actions, receipt; "no reply owed"; outcomes with the office's own wording; found elsewhere; claim by claim | `reply_owed` R23; `office_status` and `found_elsewhere` R22; `BEARINGS` R24; receipt's record is `actions` R80 (no grammar owed here) |
| actions, several speakers | R22 (`speaker`) |
| actions, promises to people | R2 `PROMISE_KINDS` (the act is `actions` R88) |
| actions, kinds and shapes: records request, reconsideration a stage, mediation/ethics/petition linked actions, stages per law from the profile | R23 (`follows_action`); R25 (`stageInLaw`, `lawStagesFindings`); `PRODUCT_KINDS` unchanged (v0.2 §6) |
| filings, election notice and position sentences pointed out | R16 (`position` list), R18 |
| filings, chance-to-fix notice: asks limited to the standard, remedy and the law's routes | R16 (`own_benefit_ask` list), R18; Doubt 5 |
| action-clocks, our deadlines (`owed_by`) | R7 amended, R2 `CLOCK_OWED_BY` |
| jurisdictions, stage vocabulary per law | R25 (lower draft R76 owes it here) |
| l9a owed: the new rows | R9 amended |
| S1 §D 14 (acknowledgement on a request for comment) | R5 amended (verified) |
| S1 §D 15 (fee-waiver stages without a CPRA counterpart) | R25 |
| action-clocks, the fifth basis kind | not here: `action-clocks`' `BASIS_KINDS` (l9b R7) |
