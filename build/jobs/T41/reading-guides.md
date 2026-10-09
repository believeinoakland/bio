# reading-guides (T41)

**Status** · session_01RMvYVRFkcmUHsvFuW1MH5Z · depth 2 · WORKING · handled B0

## J1 · QUESTION

Seven readings; I build on each now and change course only if your answer differs.
1. **Family number.** R11's new family takes **C-143** (C-141 is the highest held; I read T41's four new families in `modules.json` order: steps C-142, reading-guides C-143, question-explorer C-144, investigation C-145, so no two jobs collide). Rows C-143.1 onward, `awaiting stamp` (rule 4 item 2).
2. **R12's label.** `record-grammar`'s `PROPOSAL_STATES` has no reading-guide subject (R42 is `template`'s: "wording proposed for a filing template", wrong for a guide). Reading: the label is `{by, state, machine_work, says}` exactly as `proposalLabel` shapes it, `state` from `lawProposalState(by)`, `says` this module's own sentence. If you want a `reading_guide` subject in record-grammar instead, that is a later CHANGE to record-grammar; I would then call `proposalLabel(by, "reading_guide")`.
3. **R1's content.** No guide has been approved by Bob or measured yet, so `CIVICSMITH_GUIDES` ships **frozen and empty**. Each entry's shape (`approved_by`, `measured_use` required, origin `civicsmith`, state `group`, items passing R4) is checked by an exported `civicsmithGuideRefusal(entry)` and tested whole; the instance takes `deps.civicsmith` so tests drive R5's Civicsmith arm. I invent no guide or approval record.
4. **R6's slug.** The group's slug is `promotion`'s `producingGroup` fact; `promotion` is not in my uses. Reading: the instance takes `deps.groupSlug()` (the plane composes it from that fact); with none, `guideOffer` and `guideProposeToCivicsmith` refuse `GUIDE_NO_GROUP_SLUG`.
5. **`kind`.** A key of `doctypes`' `DOCTYPES` (the eight). Court and budget kinds are other modules (not in my uses) and are refused `GUIDE_KIND_UNKNOWN` until a requirement says otherwise.
6. **R7's "approver of its scope".** A guide `usable_by_author` or `draft`: its author. A `group` (or adopted, once approved) guide: any active member who is not its author (R3's approvers). Civicsmith's are read-only to every act (`GUIDE_READ_ONLY`).
7. **Sight (R8, R9).** Every group guide, in any state, and every machine proposal is visible to a viewer membership admits (an active member, an administrator, a machine credential) and to an internal call with no viewer; a viewer `viewerPredicate` answers `DENY` sees Civicsmith's alone. The registrations' own refusals (`PROVIDER_DECLARED`, `PROVIDER_MALFORMED`) carry no row, as public-read R18 and connections R5 do (a starting module's error).
Noted, not a question: R4's frozen list makes "may" conduct, so "Look for the May budget" is refused (the month). I keep the list as written.
