# U41: Areas 3 and 4 checked against requirements and code

Repo `/home/user/bio`, branch `tranche/T32` @ `cd7a0b9c9e`. Code paths are from `build/modules.json` 77–81: `bio-plane/src/standards/`, `conformance/`, `filings/`. I ran `node --test` on the three modules' test dirs: 137 pass, 0 fail. None of the three requirement files has a "(not yet met" marker. DEC-88's reasons, which the Status lines list as "not yet met (T22)", were met at K1089 (`build/plan/archive/T22.md:225`).

## AREA 3: Law and regulation

### Built (with requirement ids)
- **standards R1–R8, R17 (declare, read, list, in force).** A standard is held with its cite (200 characters at most), kind, issuer, captured text, in-force period, an optional `supersedes`, and the declarer's **reason**. The reason is required (`STANDARD_NO_REASON`, R1, DEC-88). Requirements: `build/requirements/standards.md:21-31`. Code: `bio-plane/src/standards/index.mjs:204-262` (declare), `:351` (`inForce`), `:361-381` (`standardsIn`).
- **R3, the source match.** The cite is matched against the profile's `standard_sources` (`standards.md:24`, `index.mjs:145-180`). A cite that matches nothing is held as `undetermined`.
- **R5, a changed text is noticed.** The read flags a newer capture of the text's document that no longer holds the passage (`content.passageNotice`, `standards.md:28`).
- **R6, the supersedes chain.** It is one link, one successor at most (`standards.md:29`; `schema.mjs:19`, `supersedes TEXT UNIQUE`; `index.mjs:248-259`).
- **R9–R10, proposals and adoption.** A machine or a member may propose a standard (`standardPropose`); a member adopts it (`standards.md:37-38`). The claim leaves these out.
- **R11–R16 (invariants).** Only a member writes a standard. Nothing is ever edited (append-only). A standard is its own record type, `STD-`, and is instance-wide (`standards.md:56-60,74`).
- **conformance R1–R24, determinations per standard.** One outcome per standard, never combined into a single verdict (R4, `conformance.md:24`). A determination rests on published findings (R2) and refuses a standard that was not in force at the act's date (R3). It is flagged `basis_changed` when a standard it names is superseded or its text is recaptured (R10, `conformance.md:32`). Supersession needs a reason (R7). Comparisons can be proposed (R12) and can start from a contradiction (R21). A cause can be recorded (R22). Code: `bio-plane/src/conformance/index.mjs:566` (`determine`), `:853`, `:911`.

### Claim corrections
- "standards R1–R8" is incomplete. The module is R1–R17. The claim leaves out proposals and adoption (R9–R10, the Legal/Policy Lookup path), the required declarer's reason (R1), the record-object type with history and export (R15), and the text-recapture notice (R5).
- "a supersedes chain" is true but narrow. Each standard supersedes at most one, and is superseded by at most one (R6). So:
  - one amending ordinance that changes three sections means three new standards;
  - one standard cannot merge or split several;
  - a repeal with no replacement cannot be recorded after the fact, because a period is fixed when the standard is declared and never edited (R4). It can only be expressed by declaring a superseding standard.
- "determinations per standard" is correct. Add that each determination is per act and per project, rests on published findings, and is flagged when a standard is superseded or its text changes.

### Gaps confirmed
1. **No code → chapter → section structure.** A standard is a flat row with no parent and no "part of" link (`schema.mjs` `standards` table). Partial coverage exists elsewhere:
   - `jurisdictions` R23's `code?` field (`jurisdictions.md:32`) and `vocabulary.codes` (`:26`) describe a code that is cited by section. But `standards.sourceOf` never reads `code` (`index.mjs:145-180`).
   - `docprofile` reads `code_section` references (`{code, section}`) and `instrument` references out of ordinance and staff-report text (`docprofile/doctypes/regulation.mjs:257-259`, `staff-report.mjs:301`). It also detects codifying language ("hereby amended/added/repealed", `regulation.mjs:76`).
   - `standardsIn`'s `cite` filter is a substring match (`index.mjs:372`), so "all of Chapter 8.28" works only as a text search.
   - Nothing turns these references into standards or proposals. `standards.md:75` (Suggestions) leaves that reader to an AI run. Nothing calls `standardPropose` outside the op surface.
2. **No amendment history beyond what members declare.** Confirmed. Supersession is only a member's act (R6, R11). The partial coverage:
   - `docprofile` sees that an ordinance amends a code section and which sections it names (above).
   - `id-spaces` normalises enactment numbers (`id-spaces.md:13,23`).
   - `content.passageNotice` notices a changed text (R5).
   - None of these builds an amendment chain, records which instrument amended which section, or proposes a supersession.
3. **Missed by the claim:**
   - No "which standards cite or incorporate other standards" relation.
   - No record of the enacting instrument (ordinance or resolution number) on a standard, beyond free text in its cite.
   - A standard is instance-wide. There is no project-scoped or group-specific reading of it.

### Natural home for each gap
- **Code/chapter/section hierarchy.** `standards`: a `part_of` link, or a parent id, on a declaration, read by `standardRead` and `standardsIn`. Use `jurisdictions` R23's `code` and `vocabulary.codes` as the code's key, which needs a `jurisdictions` change for chapter and section forms. `docprofile`'s `code_section` references are the reader.
- **Amendment history.** `standards`, by widening R6: an "amended by" link to an instrument, and possibly several predecessors per standard. Machine detection of amendments would go through R9 proposals, fed by `docprofile`'s codifying and `instrument` references, run as an AI run (`ai-runs` / `skills`, the Legal/Policy Lookup skill, Roadmap §9 Skill 4). It would never be an automatic supersession (R11).

## AREA 4: Court cases and precedent

### Built (with requirement ids)
- **`court` as a standard kind.** `court` is one of the six kinds (`standards.md:22`; `jurisdictions/index.mjs:27` `SOURCE_KINDS`; `standards/index.mjs:45`). So a court decision can be held as a standard, and a later decision can supersede it through R6, which names "a later decision" (`standards.md:29`).
- **`court` as a venue's means.** Court is one of the ways a filing reaches a venue (`jurisdictions.md:34`, R25 `venue.how`).
- **filings R1–R32: much more than a counsel packet.**
  - Tier 1–2 pre-filled filings from a template, or from the member's own words (R1–R7, R28–R29; `filings/index.mjs:546`). The Roadmap places "CPRA court petitions" at Tier 2 (`docs/architecture/BIO_Complete_Roadmap_v5.md:527`), so a court petition can be a templated filing.
  - Approval and a record that the filing was sent (R6–R7).
  - Communications (R23, `index.mjs:661`).
  - Candidate legal theories against named standards (R14, `index.mjs:1417`).
  - The evidence package's available-actions block, and `availableActions` (R15, R21, `index.mjs:1548`).
  - The counsel packet at every tier, required only at Tier 3 (R8–R12, R31, `index.mjs:1142`). It deliberately holds no caption, court heading or prayer (R10, `filings.md:33`).
- **Court and appeal stages on an action's correspondence ledger (built; the claim misses this).** The records-request lifecycle (`action-grammar` R2, R5; `build/requirements/action-grammar.md:19,28`) defines:
  - `sent` stages `appeal` and `court_filing`;
  - `received` stages `appeal_decision` and `court_decision`;
  - outcomes `granted`, `denied`, `partial`, `reversed`, `affirmed`, `none_stated`;
  - an appeal must name the decision it appeals (`APPEAL_NAMES_NO_DECISION`).

  Code: `bio-plane/src/action-grammar/grammar.mjs:391-396,429-433`. Canon: `docs/architecture/BIO_Case_Making_v0_1.md:236-239` (D-147).
- **Legal pressure and litigation hold (actions R48, R52–R59).** A received entry can be marked as legal pressure against the group, and a litigation hold placed and released (`build/requirements/actions.md:78,82-91,99`).
- **Escalation stage 5, `legal_tools`.** Breach actions with their filings or packets are attached; the response evaluation reads complied, partial, denied or none (`build/requirements/escalation.md:28-31`).

### Claim corrections
- "filings builds a counsel packet only" is **wrong**. filings prepares, approves and records the sending of Tier 1–2 filings, which can include a Tier 2 court petition. It also prepares communications, holds candidate theories, and supplies the available-actions block. The counsel packet is one of several outputs, and is available at every tier.
- "'court' is a standard and source kind" is correct. Add that it is also a venue's means (`jurisdictions` R25).
- "Seen missing: tracking a court case (filings, rulings, appeals)" **overstates the gap**. A court filing, a court decision, an appeal and an appeal decision, with outcomes, can already be recorded as dated, chained entries on the group's own action (`action-grammar` R5). What is missing is a court case as its own object:
  - no case number, court, parties or judge;
  - no filings by other parties;
  - no case the group is not a party to;
  - no case that spans several actions;
  - no hearing dates beyond a member's `due_by`;
  - nothing beyond the request-to-counterparty frame that ledger was designed for.

### Gaps confirmed
1. **A court case as its own tracked object** (case number, court, parties, docket of filings by all parties, rulings, appeals across levels) is not in any requirement or code. A grep of `bio-plane/src`, `jurisdictions` and `docprofile` for `case_number`, `docket_number` or `interprets` finds nothing. Three partial covers, none of which is a court case:
   - the action ledger stages above (only the group's own action, one counterparty);
   - `standards` (a decision held as a standard, with no proceeding);
   - `monitoring` / `sources` (a court's public docket page can be captured and watched as an ordinary source; `monitoring.md:126`, R33).
2. **No "interprets" link** between a decision and the standard it construes. A standard has only `supersedes` (R6). There is no edge type for it, and no precedent or authority relation (binding versus persuasive, jurisdiction or level of the court). A later decision can only *supersede* (R6), which is wrong for a decision that construes a statute and leaves it in force.
3. **Missed by the claim:** the Legal/Policy Lookup skill is defined to map "case law" (`BIO_Complete_Roadmap_v5.md:592`). Today it can only *propose* standards (R9), with no precedent structure. Ingesting court records is named in the canon (`BIO_Complete_Roadmap_v5.md:587`), but no `docprofile` doctype exists for a court opinion or docket.
4. **Do not confuse with the product's own terms:**
   - `docket` (layer 8) is the public response log beside a *published case* of the group's own investigation (`build/requirements/docket.md:11`).
   - `case-import`'s "docket watch" reads another group's published-case docket (`build/requirements/case-import.md:21-23`).
   - "case" in `case-authoring`, `case-carriage` and `case-grammar` is the group's own published investigation.
   - None of these is a court case or court docket.

### Natural home for each gap
- **"interprets" link (decision → standard).** `standards`: a second link beside `supersedes`, from a `court`-kind standard to the standards it construes, both reads naming it. `conformance` R3/R10 could then show the interpreting decisions beside each standard.
- **Court-case tracking.** Two options:
  - as a narrow widening, `actions` / `action-grammar`: add case number, court and parties to an action whose venue's `how` is `court`, building on the existing `court_filing`, `court_decision` and `appeal` stages;
  - for cases the group is not party to, or that span actions, a new layer-9 module, since this is not docket's or case-import's concept.

  Either way: the court and its levels as `jurisdictions` profile data, captured filings and rulings through `capture` / `sources`, docket-page watching through `monitoring`, and a court-opinion or docket doctype in `docprofile`.
- **Precedent and authority (binding or persuasive, court level).** `standards`, with the court hierarchy as `jurisdictions` data. That fits R13's rule that no place is named in the code.
