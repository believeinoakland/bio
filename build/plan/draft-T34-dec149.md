# DEC-149 grep, layers 8–11 (Task B, for BOB #124, 2026-10-06)

Scope: each L8–L11 module's `paths` in `build/modules.json` (tranche/T34 working tree), `.mjs`/`.js`/`.html`, tests, `dist/`, `node_modules/` and the generated `newgroup/src/release.mjs` (an embedded copy of the plane's bundle) left out. String literals concatenated with `+` across lines are joined before matching; template literals are read whole with embedded `/* */`, `<!-- -->`, `//` and SQL `--` comments removed; `civicos-ui/app.html` and `bio-plane/public/newgroup/index.html` are read line by line outside JS and HTML comments (phrases split across lines there were checked: every split one is in a comment). Pattern: "this/the/your/your own/your group's/our/its" + ("Civicsmith" or "group's")? + instance/copy/plane, and "server(s)", case-insensitive. One row per source line holding a match (a string spanning several lines can give several rows).

Classes: **M** member- or founder-facing (a check's `translation`, a refusal's `why`/`detail`/`says` a member can read, page and queue text, case-document text) — owed; **P** public-reader-facing (no credential; not a member or founder, so DEC-149's letter does not reach it, but the same voice is owed by BOB's call); **X** excluded, with the reason (review copy or a document's copy; addressed to the model, an agent or an operator; names ops, ids or bindings; the control plane's stamp to a caller with none; comments).

## Per module

| L | module | M | P | X | T34 entry | DEC-149 in its entry |
|---|---|---|---|---|---|---|
| 8 | case-authoring | 13 | 0 | 0 | T34-48 | T34-48 |
| 8 | case-carriage | 4 | 0 | 0 | T34-43 | no |
| 8 | case-checker | 0 | 1 | 0 | T34-47 | no |
| 8 | case-disclosures | 3 | 0 | 1 | **none** | no |
| 8 | case-grammar | 1 | 0 | 0 | **none** | no |
| 8 | case-import | 6 | 0 | 2 | **none** | no |
| 8 | case-tensions | 0 | 0 | 1 | **none** | no |
| 8 | corpus-export | 0 | 0 | 0 | T34-42 | no |
| 8 | docket | 2 | 0 | 0 | T34-45 | no |
| 8 | network-notices | 4 | 0 | 0 | **none** | no |
| 8 | project-stage | 0 | 0 | 0 | **none** | no |
| 8 | public-read | 0 | 26 | 1 | T34-46 | no |
| 8 | publication | 0 | 0 | 1 | T34-44 T34-79 | T34-79 |
| 8 | ratification | 2 | 0 | 6 | T34-85 | T34-85 |
| 8 | review | 2 | 0 | 7 | **none** | no |
| 9 | action-clocks | 2 | 0 | 0 | T34-50 | no |
| 9 | action-grammar | 3 | 0 | 0 | **none** | no |
| 9 | action-plans | 1 | 0 | 1 | T34-61 | no |
| 9 | actions | 3 | 0 | 2 | T34-67 | no |
| 9 | conformance | 2 | 0 | 0 | **none** | no |
| 9 | consequences | 0 | 0 | 0 | T34-49 | no |
| 9 | escalation | 1 | 0 | 1 | **none** | no |
| 9 | filing-templates | 2 | 0 | 0 | **none** | no |
| 9 | filings | 4 | 0 | 0 | T34-62 | no |
| 10 | following | 0 | 0 | 0 | T34-70 | no |
| 10 | link-sweep | 0 | 0 | 1 | **none** | no |
| 10 | monitoring | 6 | 0 | 4 | **none** | no |
| 10 | scheduler | 0 | 0 | 0 | T34-51 | no |
| 11 | admission | 7 | 0 | 7 | T34-59 | no |
| 11 | affordances | 0 | 0 | 30 | T34-75 | no |
| 11 | control-plane | 18 | 0 | 1 | T34-60 | no |
| 11 | installer | 105 | 0 | 1 | T34-84 T34-71 | T34-84 |
| 11 | instance-setup | 58 | 0 | 0 | T34-57 T34-81 | T34-81 (claim page, R53, only) |
| 11 | legacy-ui | 36 | 0 | 21 | T34-77 | no |
| 11 | notice-producers | 2 | 0 | 0 | T34-55 | no |
| 11 | op-declarations | 0 | 0 | 1 | T34-58 T34-83 | no |
| 11 | plane | 4 | 0 | 1 | T34-76 | no |
| 11 | queue | 0 | 0 | 6 | T34-56 | no |
| 11 | queue-producers | 8 | 0 | 6 | T34-54 T34-82 | no |
| 11 | tasks | 0 | 0 | 0 | T34-53 | no |
| 11 | wizard-scripts | 1 | 0 | 0 | T34-52 T34-80 | no |

## Rows (M and P)

| module | file:line | phrase | class | string (source line, trimmed) |
|---|---|---|---|---|
| case-authoring | `bio-plane/src/case-authoring/checks.mjs:43` | the instance | M | translation: 'A calculation a load-bearing finding rests on gives a different result when the instance recomputes ' |
| case-authoring | `bio-plane/src/case-authoring/document.mjs:513` | the plane | M | + "computed by the plane and frozen here. A lens adopted afterwards does not change this " |
| case-authoring | `bio-plane/src/case-authoring/document.mjs:521` | the instance | M | + "refused their effect; the instance statement stands in the set hashed above."] |
| case-authoring | `bio-plane/src/case-authoring/document.mjs:526` | this instance | M | + "adopted for this instance or this project. That is stated, not left blank — it is a different " |
| case-authoring | `bio-plane/src/case-authoring/document.mjs:595` | this instance | M | "Each calculation below was recomputed by this instance when the case was published, never on a later read. A " |
| case-authoring | `bio-plane/src/case-authoring/index.mjs:384` | this instance | M | + "finding rests on a calculation that gives a different result when this instance recomputes it, or on " |
| case-authoring | `bio-plane/src/case-authoring/index.mjs:542` | this plane | M | + "from the findings' titles: a scope this plane wrote is not a scope the group made " |
| case-authoring | `bio-plane/src/case-authoring/index.mjs:1226` | this plane | M | ? '${proj}'s latest entry about this question names an act this plane does not know, so ' |
| case-authoring | `bio-plane/src/case-authoring/index.mjs:1874` | the plane | M | ? 'this draft records no author for its exclusion statement: it was written before the ' |
| case-authoring | `bio-plane/src/case-authoring/index.mjs:1879` | the plane | M | + 'An acknowledgement is a SECOND person's reading (BIO_Publication §3 rule 11), and the ' |
| case-authoring | `bio-plane/src/case-authoring/index.mjs:2155` | the plane | M | + 'that draft records no author for this sentence — it was written before the plane stamped ' |
| case-authoring | `bio-plane/src/case-authoring/index.mjs:2188` | this plane | M | + '(${unreadable.join(", ")}) hold arguments this plane cannot read, so whether this ' |
| case-authoring | `bio-plane/src/case-authoring/index.mjs:2198` | the plane | M | .join(", ")}) records no author — it was written before the plane stamped one — so who ' |
| case-carriage | `bio-plane/src/case-carriage/index.mjs:124` | this copy | M | else miss("observation", "this copy holds no text of that observation at its digest"); |
| case-carriage | `bio-plane/src/case-carriage/index.mjs:129` | this copy | M | else { miss("document", "this copy holds no bytes of that document at its digest"); continue; } |
| case-carriage | `bio-plane/src/case-carriage/index.mjs:139` | this copy | M | else miss("extracted_text", "this copy holds no whole extracted text of that document at its stated digest"); |
| case-carriage | `bio-plane/src/case-carriage/index.mjs:162` | this copy | M | why: "this copy could not record it" })), ...unheld].slice(0, UNHELD_MAX) }; |
| case-checker | `bio-plane/src/case-checker/index.mjs:40` | this copy | P — public reader (no credential); same voice owed, BOB to confirm | detail: '${v === null ? "no version was named" : "this copy holds no specification of that version"}; it holds ' |
| case-disclosures | `bio-plane/src/case-disclosures/checks.mjs:74` | this copy | M | translation: 'A finding this case relies on rests on material this copy does not hold whole, and everything a case ' |
| case-disclosures | `bio-plane/src/case-disclosures/document.mjs:108` | this copy | M | + "with the case. One that only a supporting finding reaches, and that this copy does not hold whole, is listed " |
| case-disclosures | `bio-plane/src/case-disclosures/index.mjs:405` | this copy | M | + 'whole by this copy (' + byMember.map((x) => '${x.target}: ' + x.materials.map((m) => '${m.ref} ' |
| case-grammar | `bio-plane/src/case-grammar/complete.mjs:62` | this instance | M | not_recomputed: "not recomputed here: a workbook this instance's engine did not recompute", |
| case-import | `bio-plane/src/case-import/checks.mjs:35` | this copy | M | translation: "What was given is not a case file this copy can read: each way it departs from the case-file format " |
| case-import | `bio-plane/src/case-import/checks.mjs:45` | This copy | M | translation: "This copy already holds this edition of the case, and the case file given differs from it. An edition " |
| case-import | `bio-plane/src/case-import/checks.mjs:55` | This copy | M | translation: "This copy holds no imported edition by that name. Nothing was written.", |
| case-import | `bio-plane/src/case-import/index.mjs:102` | this copy | M | + "not a statement that none was made: it says only what this copy's reads have seen, as of the last read."; |
| case-import | `bio-plane/src/case-import/index.mjs:275` | this copy | M | ? 'this copy does not hold the method version ${method} (it holds ${CALC_METHOD}): the value was computed by the publishing copy's engine and is not r |
| case-import | `bio-plane/src/case-import/index.mjs:294` | this copy | M | if (b.length > CALC_INPUT_MAX) { missing.push({ input: inp.name, sha: inp.sha, why: 'the input is over ${CALC_INPUT_MAX} bytes, more than this copy re |
| docket | `bio-plane/src/docket/checks.mjs:101` | This copy | M | translation: "This copy has no group name recorded, and a docket entry is never anonymous. Record the group's " |
| docket | `bio-plane/src/docket/checks.mjs:131` | This copy | M | translation: "This copy holds no prepared docket entry from you with this fingerprint, it was prepared more " |
| network-notices | `bio-plane/src/network-notices/checks.mjs:25` | This copy | M | translation: "This copy has no group name recorded, and a notice is never anonymous. Record the group's name " |
| network-notices | `bio-plane/src/network-notices/checks.mjs:30` | This copy | M | translation: "This copy holds no signing key of its own, so it cannot sign the activity level a notice is always " |
| network-notices | `bio-plane/src/network-notices/checks.mjs:63` | This copy | M | translation: "This copy holds no prepared notice from you with this fingerprint, or it was prepared more than an " |
| network-notices | `bio-plane/src/network-notices/index.mjs:101` | this copy | M | export const COPY_KEY_LABEL = "this copy's key"; |
| public-read | `bio-plane/src/public-read/checks.mjs:44` | This copy | P — public reader (no credential); same voice owed, BOB to confirm | translation: 'This copy of the record was set up without the storage it keeps its published documents in, ' |
| public-read | `bio-plane/src/public-read/checks.mjs:46` | this copy | P — public reader (no credential); same voice owed, BOB to confirm | + 'about how this copy was set up, not about the document or this request, and nothing was changed. ' |
| public-read | `bio-plane/src/public-read/checks.mjs:47` | this copy | P — public reader (no credential); same voice owed, BOB to confirm | + 'Whoever runs this copy can connect that storage.', |
| public-read | `bio-plane/src/public-read/checks.mjs:82` | this copy | P — public reader (no credential); same voice owed, BOB to confirm | translation: 'Nothing this copy of the record has published matches that fingerprint. Something that was never ' |
| public-read | `bio-plane/src/public-read/checks.mjs:89` | this copy | P — public reader (no credential); same voice owed, BOB to confirm | translation: 'This document is published, but this copy of the record cannot find its contents in its storage, ' |
| public-read | `bio-plane/src/public-read/checks.mjs:91` | this copy | P — public reader (no credential); same voice owed, BOB to confirm | + 'Whoever runs this copy can restore the missing contents.', |
| public-read | `bio-plane/src/public-read/checks.mjs:103` | this copy | P — public reader (no credential); same voice owed, BOB to confirm | translation: 'This case file is published, but this copy of the record cannot read the list of its contents, ' |
| public-read | `bio-plane/src/public-read/checks.mjs:104` | this copy | P — public reader (no credential); same voice owed, BOB to confirm | + 'so it cannot put the case file together as one download. Nothing was changed. Whoever runs this copy can ' |
| public-read | `bio-plane/src/public-read/checks.mjs:110` | this copy | P — public reader (no credential); same voice owed, BOB to confirm | translation: 'This case file is published, but this copy of the record cannot find one of the documents it ' |
| public-read | `bio-plane/src/public-read/checks.mjs:112` | this copy | P — public reader (no credential); same voice owed, BOB to confirm | + 'the others can still be asked for one at a time. Nothing was changed. Whoever runs this copy can restore it.', |
| public-read | `bio-plane/src/public-read/checks.mjs:118` | This copy | P — public reader (no credential); same voice owed, BOB to confirm | + 'could be read two ways. This copy will not hand over a case file that says two things about one name. ' |
| public-read | `bio-plane/src/public-read/checks.mjs:130` | this copy | P — public reader (no credential); same voice owed, BOB to confirm | translation: 'Nothing this copy of the record has published answers to what you asked for. A case that was ' |
| public-read | `bio-plane/src/public-read/checks.mjs:140` | this copy | P — public reader (no credential); same voice owed, BOB to confirm | translation: 'This case document is published and signed, but this copy of the record could not produce its exact ' |
| public-read | `bio-plane/src/public-read/checks.mjs:142` | this copy | P — public reader (no credential); same voice owed, BOB to confirm | + 'can still be checked. Nothing was changed. Whoever runs this copy can repair it.', |
| public-read | `bio-plane/src/public-read/checks.mjs:151` | This copy | P — public reader (no credential); same voice owed, BOB to confirm | translation: 'This copy of the record offers no public read by that name. Nothing was changed.', |
| public-read | `bio-plane/src/public-read/index.mjs:262` | this copy | P — public reader (no credential); same voice owed, BOB to confirm | detail: 'no public read named ${JSON.stringify(n)} is registered on this copy of the record, so there ' |
| public-read | `bio-plane/src/public-read/index.mjs:471` | this instance | P — public reader (no credential); same voice owed, BOB to confirm | detail: "every hash here is verifiable by anyone with ssh-keygen and the doorbell, without this " |
| public-read | `bio-plane/src/public-read/index.mjs:1048` | this plane | P — public reader (no credential); same voice owed, BOB to confirm | + "under — the last of these is a DISCLOSURE the reader weighs, never a verdict this " |
| public-read | `bio-plane/src/publication/worker.mjs:112` | this instance | P — public reader (no credential); same voice owed, BOB to confirm | detail: "that hash is published, and this instance's published store holds no bytes for it, so " |
| public-read | `bio-plane/src/publication/worker.mjs:346` | this instance | P — public reader (no credential); same voice owed, BOB to confirm | + "makes one detectable by anyone holding it, without this instance's cooperation. Each " |
| public-read | `bio-plane/src/publication/worker.mjs:366` | this instance | P — public reader (no credential); same voice owed, BOB to confirm | + "that signature to this instance — the authenticated session that performed the act, a " |
| public-read | `bio-plane/src/publication/worker.mjs:367` | this instance | P — public reader (no credential); same voice owed, BOB to confirm | + "member or the instance's founder — and it is this instance's record, not covered by any " |
| public-read | `bio-plane/src/publication/worker.mjs:544` | this instance | P — public reader (no credential); same voice owed, BOB to confirm | detail: "this instance has no published object store configured, so its published bytes are " |
| public-read | `bio-plane/src/publication/worker.mjs:545` | this instance | P — public reader (no credential); same voice owed, BOB to confirm | + "not servable. The hash is genuine and this instance cannot hand over the bytes." }, 503); |
| public-read | `bio-plane/src/publication/worker.mjs:753` | this instance | P — public reader (no credential); same voice owed, BOB to confirm | detail: "this instance cannot hand over the bytes of that edition, so its conclusion is not " |
| public-read | `bio-plane/src/publication/worker.mjs:832` | this instance | P — public reader (no credential); same voice owed, BOB to confirm | + "detectable by anyone holding it, without this instance's cooperation.", |
| ratification | `bio-plane/src/ratification/checks.mjs:1016` | this copy | M | + 'is one of the operator\'s access tokens for this copy, not a person: a valid signature does ' |
| ratification | `bio-plane/src/ratification/checks.mjs:1025` | this copy | M | + 'asked here is one of the operator\'s access tokens for this copy, not a person, and a valid ' |
| review | `bio-plane/src/review/checks.mjs:114` | the plane | M | translation: 'This draft\'s arguments are larger than the plane will store: the limit is 64 KiB, the same ' |
| review | `bio-plane/src/review/index.mjs:83` | this instance | M | export const REVIEW_MARKING = "REVIEW COPY — NOT A PUBLICATION. This is a draft of a case, shown inside this " |
| action-clocks | `bio-plane/src/action-clocks/count.mjs:176` | this instance | M | + "a closure list is not confirmed on this instance"); |
| action-clocks | `bio-plane/src/action-clocks/count.mjs:177` | this instance | M | if (!readable) return { status: "not_read", years, says: ["the calendar's confirmation on this instance was not read", ...says] }; |
| action-grammar | `bio-plane/src/action-grammar/checks.mjs:627` | The plane | M | says: 'Each entry is dated as recorded and names the entry it follows. The plane derives only the days ' |
| action-grammar | `bio-plane/src/action-grammar/checks.mjs:719` | this instance | M | findings.push(f('C-2.10', 'error', 'action_kind '${fm.action_kind}' is not a kind this instance offers')); |
| action-grammar | `bio-plane/src/action-grammar/checks.mjs:1143` | this instance | M | translation: 'An action is one of the kinds this instance offers: a records request, a request for comment, ' |
| action-plans | `bio-plane/src/action-plans/checks.mjs:301` | this instance | M | + 'is not on this instance yet, so the plan is not answered in part. Nothing was written.', |
| actions | `bio-plane/src/actions/index.mjs:149` | this instance | M | const CONTACT_NOT_A_MEMBER_DETAIL = "contact names a member of this instance by member id, and this one names none. " |
| actions | `bio-plane/src/actions/index.mjs:578` | this instance | M | return refuse("ACTION_KIND_UNKNOWN", 'action_kind '${String(nextFm.action_kind).slice(0, 40)}' is not a kind this ' |
| actions | `bio-plane/src/actions/index.mjs:913` | this instance | M | + "this instance yet, so none could be found. Nothing was written.", |
| conformance | `bio-plane/src/conformance/checks.mjs:157` | The plane | M | translation: 'Name which side of the question states what the standard requires, a or b. The plane never chooses ' |
| conformance | `bio-plane/src/conformance/index.mjs:1178` | the plane | M | + "b: the plane never chooses it. Nothing was written.", { contradiction: from.inquiry }); |
| escalation | `bio-plane/src/escalation/checks.mjs:224` | this instance | M | translation: 'Part of the record this answer depends on cannot be read on this instance yet, so nothing is ' |
| filing-templates | `bio-plane/src/filing-templates/checks.mjs:59` | this instance | M | translation: "A template is written for jurisdiction profiles this instance holds, or for none in particular " |
| filing-templates | `bio-plane/src/filing-templates/checks.mjs:113` | the instance | M | translation: "A review grant opens by a secret link the instance makes, and none was made for this request. " |
| filings | `bio-plane/src/filings/checks.mjs:65` | The instance | M | translation: "Only a named member can record that a filing was sent. The instance sends nothing itself.", |
| filings | `bio-plane/src/filings/index.mjs:234` | this instance | M | return { view: null, conflicts: [], why: "no jurisdiction profile is active on this instance" }; |
| filings | `bio-plane/src/filings/index.mjs:498` | this instance | M | return v ? { value: v, source: SOURCE } : { why: "no producing group is recorded for this instance" }; |
| filings | `bio-plane/src/filings/index.mjs:814` | The instance | M | says: "approved by the member named: the text is theirs. The instance transmits nothing; a member files it " |
| monitoring | `bio-plane/src/monitoring/checks.mjs:55` | this instance | M | + 'changed — what is known is that this instance could not see the document today.', |
| monitoring | `bio-plane/src/monitoring/checks.mjs:67` | This instance | M | + 'was sending a document and sent a web page instead. This instance reads the bytes rather ' |
| monitoring | `bio-plane/src/monitoring/index.mjs:662` | this instance | M | detail: driveTick.why + " A shape this instance cannot read is a shape it cannot promise to " |
| monitoring | `bio-plane/src/monitoring/index.mjs:1058` | this instance | M | ? ' — fetched ${driveTick.exportAddress}, the OpenDocument export this instance composed ' |
| monitoring | `bio-plane/src/monitoring/index.mjs:1511` | this plane | M | ? "cadence is a meeting schedule this plane does not hold" |
| monitoring | `bio-plane/src/monitoring/index.mjs:2258` | this plane | M | return { ok: false, reason: null, detail: "the landing did not complete and this plane did not record why" }; |
| admission | `bio-plane/src/admission/checks.mjs:21` | this instance | M | translation: 'Nothing in this request said who you are. Sign in, or send a credential this ' |
| admission | `bio-plane/src/admission/checks.mjs:57` | This instance | M | + 'has issued. This instance holds a recorded decision to that effect and names it beside ' |
| admission | `bio-plane/src/admission/checks.mjs:111` | this instance | M | translation: 'No signed-in session reaches this operation, and this instance holds no recorded ' |
| admission | `bio-plane/src/admission/checks.mjs:161` | this copy | M | translation: 'This request named a part of the record that does not exist on this copy, so nothing was ' |
| admission | `bio-plane/src/admission/checks.mjs:224` | this instance | M | translation: 'The list of things this credential may change names something this instance does ' |
| admission | `bio-plane/src/admission/checks.mjs:282` | this copy | M | + 'them. The credential that asked here is one of the operator\'s access tokens for this copy, ' |
| admission | `bio-plane/src/admission/checks.mjs:297` | this copy | M | + 'operator\'s access tokens for this copy, not a person, so it cannot be that administrator. Sign in as ' |
| control-plane | `bio-plane/src/control-plane/checks.mjs:25` | This copy | M | translation: 'This copy has no operation by that name. A copy running an older or newer version can have ' |
| control-plane | `bio-plane/src/control-plane/checks.mjs:36` | This copy | M | translation: 'This copy of the record could not consult its own records just now, so nothing in this reply is a ' |
| control-plane | `bio-plane/src/control-plane/checks.mjs:48` | This copy | M | translation: 'This copy failed while handling the request, before it could produce an answer. That is a fault ' |
| control-plane | `bio-plane/src/control-plane/checks.mjs:49` | This copy | M | + 'in this copy, not a statement about what the record holds or about your request; whether any part of it ' |
| control-plane | `bio-plane/src/control-plane/checks.mjs:50` | this copy | M | + 'took effect is not known from here. The administrator can find the details in this copy\'s logs under the ' |
| control-plane | `bio-plane/src/control-plane/checks.mjs:60` | This copy | M | translation: 'This copy failed inside its own record while carrying out the request, so no answer was produced. ' |
| control-plane | `bio-plane/src/control-plane/checks.mjs:61` | This copy | M | + 'That is a fault in this copy, not a statement about what the record holds or about your request; whether ' |
| control-plane | `bio-plane/src/control-plane/checks.mjs:62` | this copy | M | + 'any part of it took effect is not known from here. The administrator can find the details in this copy\'s ' |
| control-plane | `bio-plane/src/control-plane/checks.mjs:73` | This copy | M | translation: 'This copy is preserving records under a litigation hold, and this removal would reach material the ' |
| control-plane | `bio-plane/src/control-plane/checks.mjs:86` | This copy | M | translation: 'This copy has no administrator token set, so it cannot be claimed yet. Whoever installed it ' |
| control-plane | `bio-plane/src/control-plane/checks.mjs:92` | This copy | M | translation: 'This copy\'s administrator token is a value published in the project\'s public repository, ' |
| control-plane | `bio-plane/src/control-plane/checks.mjs:93` | This copy | M | + 'so it can never be used to claim the copy: anyone can read it. Whoever installed the copy sets a ' |
| control-plane | `bio-plane/src/control-plane/checks.mjs:99` | this copy | M | translation: 'The administrator token given does not match the one this copy holds, so the copy was not ' |
| control-plane | `bio-plane/src/control-plane/checks.mjs:123` | the plane | M | translation: 'This save says it is a replay of the record\'s own history, and the plane could not check that ' |
| control-plane | `bio-plane/src/control-plane/index.mjs:372` | this instance | M | "this instance could not consult its own record, so nothing here is a statement about the record. " |
| control-plane | `bio-plane/src/control-plane/index.mjs:2891` | this instance | M | tokenIsShownOnce: "This is the only time this instance will show this value. It is not stored " |
| control-plane | `bio-plane/src/control-plane/index.mjs:2916` | this instance | M | secretIsShownOnce: "This is the only time this instance will show this value. It is stored only as a " |
| control-plane | `bio-plane/src/control-plane/index.mjs:2938` | this instance | M | secretIsShownOnce: "This is the only time this instance will show this value. It is stored only as a " |
| installer | `bio-plane/public/newgroup/index.html:6` | your group's copy | M | <title>Start your group's copy — Civicsmith</title> |
| installer | `bio-plane/public/newgroup/index.html:58` | Your own copy | M | <li>Your own copy of Civicsmith, running in your own Cloudflare account, at |
| installer | `bio-plane/public/newgroup/index.html:72` | Your copy | M | <li><b>The Workers Paid plan,</b> $5 a month from Cloudflare. Your copy reads |
| installer | `bio-plane/public/newgroup/index.html:76` | your copy | M | turns on the file storage your copy keeps its evidence in. The installer |
| installer | `bio-plane/public/newgroup/index.html:82` | your copy | M | only with their own API key. The assistant is optional, and your copy holds no |
| installer | `newgroup/src/index.mjs:149` | The plane | M | + (lim.detail ? " (" + lim.detail + ")" : "") + ". The plane's limits are a decision the signed release states, and " |
| installer | `newgroup/src/index.mjs:317` | your copy | M | ? 'the software your Cloudflare account holds for your copy could not be read back, so it is not confirmed to be the ${release.version} release's own  |
| installer | `newgroup/src/index.mjs:318` | your copy | M | : 'the software your Cloudflare account holds for your copy is not the ${release.version} release's own bytes (read back, it hashes to ${got.slice(0,  |
| installer | `newgroup/src/index.mjs:445` | your copy | M | if (mode === "update") return "An update never changes whether your copy offers the assistant; an administrator changes it on your copy."; |
| installer | `newgroup/src/index.mjs:481` | the plane | M | const LIMITS_NOT_STATED = { none: "states no limits for the plane", unreadable: "states the plane's limits unreadably" }; |
| installer | `newgroup/src/index.mjs:494` | your copy | M | if (mode === "update") return "An update never changes which jurisdiction profiles your copy reads; an administrator changes them on your copy's setup |
| installer | `newgroup/src/index.mjs:780` | your copy | M | emit.step("fleet", "Installing the capability workers beside your copy"); |
| installer | `newgroup/src/index.mjs:784` | Your copy | M | + "installed this time. Your copy works without them; the next update adds them."); |
| installer | `newgroup/src/index.mjs:790` | your copy | M | + "is a fact about the release, not about your copy."); |
| installer | `newgroup/src/index.mjs:795` | The plane | M | + "(which install only under a verified fleet signature) were left out. The plane " |
| installer | `newgroup/src/index.mjs:811` | The plane | M | + ") — so none were installed. The plane itself installed normally; a corrected " |
| installer | `newgroup/src/index.mjs:818` | The plane | M | + "capability workers were installed. The plane itself installed normally and is safe."); |
| installer | `newgroup/src/index.mjs:875` | your copy | M | + (containerPartOf(m).length ? "; your copy offers the assistant only through a member's own API key until it is installed" : "") }); |
| installer | `newgroup/src/index.mjs:887` | Your copy | M | + ". Your copy works without them; the next update retries exactly this step." + probeNote); |
| installer | `newgroup/src/index.mjs:906` | your copy | M | emit.step("bind", "Connecting your copy to its capability workers"); |
| installer | `newgroup/src/index.mjs:910` | Your copy | M | emit.ok("bind", "Your copy is connected to " + added.join(", ") + "."); |
| installer | `newgroup/src/index.mjs:913` | your copy | M | emit.no("bind", "The capability workers were installed, but connecting your copy to them was refused (" |
| installer | `newgroup/src/index.mjs:914` | Your copy | M | + added.join(", ") + "). Your copy works without them; running the updater on this copy connects them. " |
| installer | `newgroup/src/index.mjs:983` | your copy | M | .map((l) => 'the capability worker ${l.member} could not be installed, so your copy has no ${BINDING_OF.get(l.member)}' |
| installer | `newgroup/src/index.mjs:989` | your copy | M | lags.push("your copy's address did not answer", ...failedLags(failed)); |
| installer | `newgroup/src/index.mjs:992` | your copy | M | if (j.version !== want) lags.push('your copy's address answers ${j.version ? j.version : "with no version"}'); |
| installer | `newgroup/src/index.mjs:995` | your copy | M | if (!("storeVersion" in j)) lags.push("your copy's record store has not reported its version, so it is still running a release from before this one"); |
| installer | `newgroup/src/index.mjs:996` | your copy | M | else if (j.storeVersion === null) lags.push("your copy's record store cannot say which version it runs"); |
| installer | `newgroup/src/index.mjs:997` | your copy | M | else if (j.storeVersion !== want) lags.push('your copy's record store still runs ${j.storeVersion}'); |
| installer | `newgroup/src/index.mjs:1000` | your copy | M | lags.push("your copy did not report its capability workers"); |
| installer | `newgroup/src/index.mjs:1005` | your copy | M | else if (s === "MISNAMED") lags.push('your copy's connection to ${name} reaches a different worker (${st.name \|\| "unnamed"})'); |
| installer | `newgroup/src/index.mjs:1006` | your copy | M | else if (s === "SILENT") lags.push('your copy cannot get an answer from the capability worker ${name}' |
| installer | `newgroup/src/index.mjs:1009` | your copy | M | lags.push('the capability worker ${name} was installed, but your copy holds no connection to it, so it cannot use it'); |
| installer | `newgroup/src/index.mjs:1012` | your copy | M | if (!(name in mv)) lags.push('the capability worker ${name} was installed, but your copy does not know it'); |
| installer | `newgroup/src/index.mjs:1038` | your copy | M | const UNDETERMINED_BUILDS = "This release cannot report which version your copy's record store or its capability " |
| installer | `newgroup/src/index.mjs:1039` | your copy | M | + "workers are running, so only your copy's address was checked; those parts are not confirmed either way."; |
| installer | `newgroup/src/index.mjs:1109` | your copy | M | if (carried) return emit.ok("ai", "The organisation AI credential you gave was stored in your copy as a secret " |
| installer | `newgroup/src/index.mjs:1110` | your copy | M | + "(it is not shown here). Your copy uses it to resume assistant runs that credential opened."); |
| installer | `newgroup/src/index.mjs:1112` | your copy | M | ? "No organisation AI credential was given, so none was sent. One your copy already holds is kept unchanged; " |
| installer | `newgroup/src/index.mjs:1114` | your copy | M | : "No organisation AI credential was given, so your copy has none: it will not resume paused assistant runs on its " |
| installer | `newgroup/src/index.mjs:1115` | your copy | M | + "own. A member mints one on the copy; running the updater with it adds it. This installer never creates one."); |
| installer | `newgroup/src/index.mjs:1122` | Your copy | M | if (!held) return emit.no("keys", "Your copy's settings could not be read, so the installer could not tell whether it " |
| installer | `newgroup/src/index.mjs:1126` | Your copy | M | ? "Your copy now holds the secret that seals each member's own Claude account or API key (it is not shown here)." |
| installer | `newgroup/src/index.mjs:1127` | Your copy | M | : "Your copy already held the secret that seals each member's own Claude account or API key; it is kept unchanged."]; |
| installer | `newgroup/src/index.mjs:1132` | your copy | M | said.push("The group-wide Claude credential your copy held was removed: a copy holds none now."); |
| installer | `newgroup/src/index.mjs:1135` | Your copy | M | said.push("Your copy holds a group-wide Claude credential from before, and removing it was refused (Cloudflare said: " |
| installer | `newgroup/src/index.mjs:1144` | Your copy | M | export const ASSISTANT_OWN_ACCOUNTS = "Your copy holds no Claude account of its own: each member who wants the assistant " |
| installer | `newgroup/src/index.mjs:1145` | Your copy | M | + "connects their own Claude subscription or API key inside the copy, and is told then that their questions, and the " |
| installer | `newgroup/src/index.mjs:1150` | your copy | M | ? "You chose to offer the assistant on your copy. " |
| installer | `newgroup/src/index.mjs:1153` | your copy | M | + ASSISTANT_OWN_ACCOUNTS + (choice === "on" ? "" : " An administrator can turn it on later on your copy.")); |
| installer | `newgroup/src/index.mjs:1161` | your group's copy | M | "To continue: install your group's copy into a Cloudflare account that holds no copy, or, if this account's copy is " |
| installer | `newgroup/src/index.mjs:1215` | your copy | M | return emit.fail("This installer cannot say which limits your copy runs under", |
| installer | `newgroup/src/index.mjs:1247` | Your copy | M | "Your copy runs on Cloudflare Workers, and the work it does — reading captured documents, " |
| installer | `newgroup/src/index.mjs:1282` | Your copy | M | "Your copy keeps captured documents (PDFs, web pages, timestamp certificates) in Cloudflare's file " |
| installer | `newgroup/src/index.mjs:1321` | Your copy | M | emit.ok("install", "Your copy is installed. One optional part — the part that lets it re-check " |
| installer | `newgroup/src/index.mjs:1323` | this copy | M | + "was held up. Running the updater on this copy later turns it on. (Cloudflare said: " |
| installer | `newgroup/src/index.mjs:1357` | Your copy | M | return emit.fail("Your copy installed but has no address yet", |
| installer | `newgroup/src/index.mjs:1377` | Your copy | M | if (st && verdict.confirmed) emit.ok("verify", capable ? undefined : "Your copy answers. " + UNDETERMINED_BUILDS); |
| installer | `newgroup/src/index.mjs:1378` | Your copy | M | else if (st) emit.no("verify", "Your copy answers, but not every part is confirmed running " + release.version + " yet"); |
| installer | `newgroup/src/index.mjs:1388` | Your copy | M | ? '<b>Your copy is running.</b> It lives in your |
| installer | `newgroup/src/index.mjs:1392` | Your copy | M | ? '<b>Your copy is installed${verified ? " and answering" : ""}, but not every part of it is confirmed running this release.</b> |
| installer | `newgroup/src/index.mjs:1395` | Your copy | M | : '<b>Your copy is installed. Its new address has not woken up yet.</b> Brand-new |
| installer | `newgroup/src/index.mjs:1441` | your copy | M | const at = base ? esc(base) : "your copy&#39;s address"; |
| installer | `newgroup/src/index.mjs:1443` | Your copy | M | ? 'Your copy ran ${esc(before)} before this update, and a copy that held a record before ${FIRST_GROUP_RELEASE} |
| installer | `newgroup/src/index.mjs:1446` | your copy | M | : 'The installer could not read which version your copy ran before this update, so it cannot tell whether this |
| installer | `newgroup/src/index.mjs:1447` | your copy | M | applies to you. It does if your copy held a record before ${FIRST_GROUP_RELEASE}: such a copy does not know which |
| installer | `newgroup/src/index.mjs:1451` | your copy | M | <p>${why} Until it is recorded, your copy refuses the writes that must name their producing group &mdash; testimony, |
| installer | `newgroup/src/index.mjs:1454` | your copy | M | <p>To record it, send one request carrying your copy&#39;s ADMIN_TOKEN (the one-time password the installer showed you, |
| installer | `newgroup/src/index.mjs:1460` | this copy | M | <p class="small">A suggestion, not a default: this copy was installed under the name <span class="mono">${esc(slug)}</span>. |
| installer | `newgroup/src/index.mjs:1492` | your copy | M | emit.step("find", 'Finding your copy named "${slug}"'); |
| installer | `newgroup/src/index.mjs:1513` | your copy | M | return emit.fail("This update cannot say which limits your copy runs under", |
| installer | `newgroup/src/index.mjs:1514` | Your copy | M | "Your copy is still running the version it had before. Nothing about it changed. " + release.refused, |
| installer | `newgroup/src/index.mjs:1534` | Your copy | M | ? 'Your copy already runs ${release.version}. Re-uploading the same version' |
| installer | `newgroup/src/index.mjs:1549` | Your copy | M | "Your copy is still running the version it had before. Nothing about it changed.", |
| installer | `newgroup/src/index.mjs:1570` | your copy | M | emit.step("addr", "Finding your copy's address"); |
| installer | `newgroup/src/index.mjs:1587` | Your copy | M | if (verdict.confirmed) emit.ok("verify", capable ? undefined : "Your copy's address answers " + release.version |
| installer | `newgroup/src/index.mjs:1589` | your copy | M | else emit.no("verify", "Not every part of your copy is running " + release.version + " yet. That is normal for a " |
| installer | `newgroup/src/index.mjs:1601` | your copy | M | ? '<div class="notice"><p style="margin:0"><b>Nothing changed: your copy was already running ${esc(release.version)}.</b> |
| installer | `newgroup/src/index.mjs:1606` | your copy | M | + (lagging ? '<div class="notice"><p style="margin:0">Not every part of your copy is confirmed running ${esc(release.version)}:</p>${lagList(verdict)} |
| installer | `newgroup/src/index.mjs:1610` | your copy | M | The upload finished, but not every part of your copy is confirmed running the new version:</p> |
| installer | `newgroup/src/index.mjs:1612` | your copy | M | open your copy a little later and check again; if the same part is still named, run this update again. Your |
| installer | `newgroup/src/index.mjs:1616` | your copy | M | ? (capable ? "Every part of your copy answers " + esc(release.version) + ": its address, its record store, and each capability worker it is connected  |
| installer | `newgroup/src/index.mjs:1618` | your copy | M | : "The upload finished successfully. The address can take a few minutes to start serving the new version, so open your copy a little later and its pag |
| installer | `newgroup/src/index.mjs:1622` | your copy | M | + (base ? '<div class="actions"><a class="btnlink" href="${esc(base)}/">Open your copy</a></div>' : "")); |
| installer | `newgroup/src/index.mjs:1699` | your copy | M | const title = saved.mode === "update" ? "Updating your copy" : "Setting up your copy"; |
| installer | `newgroup/src/ui.mjs:27` | Your copy | M | export const PROFILES_NONE = 'Choosing none is allowed. Your copy then reads no jurisdiction's local facts (identifier |
| installer | `newgroup/src/ui.mjs:29` | your copy | M | guessing. An administrator can choose profiles later on your copy's setup page.'; |
| installer | `newgroup/src/ui.mjs:31` | Your copy | M | <p>Your copy reads local facts from jurisdiction profiles. Choose the ones that cover where your group works, in the |
| installer | `newgroup/src/ui.mjs:42` | Your copy | M | export const ASSISTANT_OFFER = 'The assistant is off unless your group chooses it. Your copy holds no Claude account of |
| installer | `newgroup/src/ui.mjs:43` | Your copy | M | its own: each member who wants the assistant connects their own Claude subscription or API key inside the copy, and is |
| installer | `newgroup/src/ui.mjs:45` | your copy | M | administrator can change this choice later on your copy.'; |
| installer | `newgroup/src/ui.mjs:48` | your copy | M | <legend class="small">Offer the assistant on your copy?</legend> |
| installer | `newgroup/src/ui.mjs:176` | your group's copy | M | title: 'Set up your group's copy of ${PRODUCT}', |
| installer | `newgroup/src/ui.mjs:184` | your copy | M | things turned on. First, the <b>Workers Paid plan</b> ($5 a month): your copy |
| installer | `newgroup/src/ui.mjs:187` | your copy | M | the account: Cloudflare requires one before it turns on the file storage your |
| installer | `newgroup/src/ui.mjs:216` | your copy | M | <h2>Name your copy</h2>', |
| installer | `newgroup/src/ui.mjs:229` | your copy | M | title: 'Update your copy of ${PRODUCT}', |
| installer | `newgroup/src/ui.mjs:232` | the copy | M | lede: 'This brings the copy of ${PRODUCT} your group already runs up to the current |
| installer | `newgroup/src/ui.mjs:238` | your copy | M | <p>Cloudflare shows you the permission screen. If your copy was installed |
| installer | `newgroup/src/ui.mjs:246` | the copy | M | slugLabel: "The name of the copy to update", |
| installer | `newgroup/src/ui.mjs:247` | your copy | M | slugHint: "The first part of your copy's address, before the first dot.", |
| installer | `newgroup/src/ui.mjs:251` | your copy | M | <input id="ai" type="password" autocomplete="off" spellcheck="false" placeholder="leave empty to keep what your copy has"> |
| installer | `newgroup/src/ui.mjs:252` | your copy | M | <p class="hint">Only if a member of your group minted an organisation AI credential on this copy and you want the copy |
| installer | `newgroup/src/ui.mjs:253` | this copy | M | to resume paused assistant runs on its own. It is stored in your copy as a secret and never shown. Left empty, the |
| installer | `newgroup/src/ui.mjs:254` | the copy | M | update sends none and keeps any your copy already holds. This installer never creates one.</p>', |
| instance-setup | `bio-plane/src/setup-fleet.mjs:22` | this copy | M | heading: "Before you choose a password: who controls this copy", |
| instance-setup | `bio-plane/src/setup-fleet.mjs:24` | this copy | M | "Whoever can sign in to the hosting account this copy runs in (its Cloudflare account) controls the copy. They " |
| instance-setup | `bio-plane/src/setup-fleet.mjs:25` | this copy | M | + "can replace the one-time password, claim the copy again, read everything in it and lock everyone else out, " |
| instance-setup | `bio-plane/src/setup-fleet.mjs:31` | the copy | M | + "value in this worker's settings, and the copy can be claimed again.", |
| instance-setup | `bio-plane/src/setup.mjs:87` | This copy | M | + "This copy could not read its group just now</p>"; |
| instance-setup | `bio-plane/src/setup.mjs:115` | this copy | M | return '<p class="eyebrow" id="instance-group" data-group="none">No group is recorded for this copy yet</p>'; |
| instance-setup | `bio-plane/src/setup.mjs:204` | this copy | M | <p class="small">Checking the state of this copy.</p> |
| instance-setup | `bio-plane/src/setup.mjs:208` | this copy | M | <h1>This copy has no one-time password yet</h1> |
| instance-setup | `bio-plane/src/setup.mjs:210` | This copy | M | to the Cloudflare account this copy runs in, open this worker's settings, |
| instance-setup | `bio-plane/src/setup.mjs:219` | your copy | M | <h1>Claim your copy</h1> |
| instance-setup | `bio-plane/src/setup.mjs:226` | this copy | M | this copy can be claimed again. Nothing stored in the record is affected.</p> |
| instance-setup | `bio-plane/src/setup.mjs:240` | this copy | M | <button id="do-claim">Claim this copy</button> |
| instance-setup | `bio-plane/src/setup.mjs:246` | this copy | M | <p>This copy is claimed. Members sign in with their own name and password. |
| instance-setup | `bio-plane/src/setup.mjs:256` | the copy | M | the copy again.</p> |
| instance-setup | `bio-plane/src/setup.mjs:260` | the copy | M | <h1>Your copy is healthy</h1> |
| instance-setup | `bio-plane/src/setup.mjs:286` | this copy | M | <h2>Where this copy's local facts come from</h2> |
| instance-setup | `bio-plane/src/setup.mjs:289` | this copy | M | <p class="small">Choose the jurisdiction profiles this copy reads its local facts from, in the order they |
| instance-setup | `bio-plane/src/setup.mjs:304` | This copy | M | <p class="small">The assistant is optional. This copy holds no account for it: each member who wants it connects |
| instance-setup | `bio-plane/src/setup.mjs:322` | This copy | M | <p class="crumb"><a id="crumb-panel">This copy</a> &rsaquo; Record</p> |
| instance-setup | `bio-plane/src/setup.mjs:329` | This copy | M | <p class="crumb"><a id="crumb-panel2">This copy</a> &rsaquo; <a id="crumb-browse">Record</a> &rsaquo; <span id="crumb-id" class="mono"></span></p> |
| instance-setup | `bio-plane/src/setup.mjs:343` | This copy | M | <p class="crumb"><a class="crumb-home">This copy</a> &rsaquo; New</p> |
| instance-setup | `bio-plane/src/setup.mjs:376` | this copy | M | this copy will fetch it, hash it at the moment it arrives, keep the bytes, and record where |
| instance-setup | `bio-plane/src/setup.mjs:381` | This copy | M | <p class="hint">Must be an https address on a public site. This copy will not fetch anything else.</p> |
| instance-setup | `bio-plane/src/setup.mjs:455` | This copy | M | <p class="crumb"><a class="crumb-home">This copy</a> &rsaquo; <a id="e-back">Record</a> &rsaquo; Edit</p> |
| instance-setup | `bio-plane/src/setup.mjs:467` | This copy | M | <p class="crumb"><a class="crumb-home">This copy</a> &rsaquo; Inbox</p> |
| instance-setup | `bio-plane/src/setup.mjs:476` | This copy | M | <p class="crumb"><a class="crumb-home">This copy</a> &rsaquo; Members</p> |
| instance-setup | `bio-plane/src/setup.mjs:502` | this copy | M | on this copy's signing page. It runs entirely in their browser and sends nothing |
| instance-setup | `bio-plane/src/setup.mjs:594` | This copy | M | catch(e){ $("#s-loading h1").textContent = "This copy is not answering"; |
| instance-setup | `bio-plane/src/setup.mjs:616` | This copy | M | ? "This copy was already claimed. If that was not you, replace ADMIN_TOKEN in the Cloudflare dashboard and reload." |
| instance-setup | `bio-plane/src/setup.mjs:828` | this copy | M | : "Listed by snapshot key: this copy of the record does not carry the order they were written, and key order is not necessarily the order they were wr |
| instance-setup | `bio-plane/src/setup.mjs:890` | this copy | M | if (why === "NO_SIGNERS") return "No keys are registered on this copy yet, so nothing can be published. An administrator registers keys under Members  |
| instance-setup | `bio-plane/src/setup.mjs:1425` | this copy | M | return "this key cannot sign, and this copy has not been told why"; |
| instance-setup | `bio-plane/src/setup.mjs:1523` | This copy | M | $("#pf-active").innerHTML = '<p class="small" style="margin:0">This copy could not read its jurisdiction profiles just now.</p>'; |
| instance-setup | `bio-plane/src/setup.mjs:1530` | this copy | M | : '<p class="small" style="margin:0">No profile is active: this copy reads no local facts, and every one is answered as undetermined.' |
| instance-setup | `bio-plane/src/setup.mjs:1542` | This copy | M | : '<p class="small" style="margin:0">This copy holds no profile to choose.</p>'; |
| instance-setup | `bio-plane/src/setup.mjs:1553` | this copy | M | ? "From now on, this copy reads its local facts from " + order.map(name).join(", then ") |
| instance-setup | `bio-plane/src/setup.mjs:1555` | this copy | M | : "You chose no profile. From now on this copy reads no local facts, and every one is answered as undetermined. Local facts will read differently from |
| instance-setup | `bio-plane/src/setup.mjs:1585` | This copy | M | $("#as-state").innerHTML = '<p class="small" style="margin:0">This copy could not read whether the assistant is on just now.</p>'; |
| instance-setup | `bio-plane/src/setup.mjs:1590` | this copy | M | + (res.on ? "The assistant is on for this copy." : "The assistant is off for this copy.") |
| instance-setup | `bio-plane/src/setup.mjs:1701` | This copy | M | translation: 'This copy\'s group is already recorded, and it is recorded once: the name travels inside every ' |
| instance-setup | `bio-plane/src/setup.mjs:1731` | this copy | M | + 'profiles this copy reads its local facts from. Nothing was changed.', |
| instance-setup | `bio-plane/src/setup.mjs:1742` | This copy | M | translation: 'This copy holds no jurisdiction profile by that name, so it cannot read local facts from it. ' |
| instance-setup | `bio-plane/src/setup.mjs:1755` | this copy | M | translation: 'The assistant is switched off for this copy, so no question is put to it and nothing runs. One of ' |
| instance-setup | `bio-plane/src/setup.mjs:2245` | the plane | M | + "the plane stamps who is asking from the signed-in session rather than taking it from the caller. This " |
| instance-setup | `bio-plane/src/setup.mjs:2351` | this plane | M | detail: 'the fetch of ${path} did not complete, and this plane did not record why' }; |
| instance-setup | `bio-plane/src/setup.mjs:2368` | this instance | M | return { verdict: "verified", status, detail: '${path} names this instance (${address}) and its slug (${slug})' }; |
| instance-setup | `bio-plane/src/setup.mjs:2371` | this plane | M | ? '${path} is not the JSON object this plane reads ({ instance, group })' |
| instance-setup | `bio-plane/src/setup.mjs:2373` | this instance | M | + '${JSON.stringify(grp).slice(0, 60)}; this instance is ${address} and its slug is ${slug}' }; |
| instance-setup | `bio-plane/src/setup.mjs:2451` | this copy | M | if (unknown.length) why = 'the installer bound ${unknown.map((x) => JSON.stringify(x)).join(", ")}, which this copy does not hold'; |
| instance-setup | `bio-plane/src/setup.mjs:2479` | this copy | M | out.detail = "no active profile: this copy reads no local facts, which is valid, and every fact that needs one " |
| instance-setup | `bio-plane/src/setup.mjs:2493` | the plane | M | "choosing the jurisdiction profiles is an administrator's act, and the plane stamps who is asking from the " |
| instance-setup | `bio-plane/src/setup.mjs:2502` | this copy | M | return refusal("UNKNOWN_PROFILE", 'this copy holds no profile ${unknown.map((x) => JSON.stringify(x)).join(", ")}. ' |
| instance-setup | `bio-plane/src/setup.mjs:2925` | this copy | M | detail: "the assistant has never been switched on for this copy, so it is off" }; |
| instance-setup | `bio-plane/src/setup.mjs:2933` | this copy | M | return notAnAdmin(by ?? null, "switching the assistant on or off for this copy"); |
| instance-setup | `bio-plane/src/setup.mjs:2945` | this copy | M | ? "the assistant is on for this copy. The copy holds no account of its own: each member who wants it " |
| instance-setup | `bio-plane/src/setup.mjs:2947` | this copy | M | : "the assistant is off for this copy: no ask is put to it and no run starts. Nothing already recorded " |
| instance-setup | `bio-plane/src/setup.mjs:2958` | this copy | M | ? 'an administrator switched the assistant off for this copy on ${st.set_at}; no ask is put to it and no run starts.' |
| instance-setup | `bio-plane/src/setup.mjs:2959` | this copy | M | : "the assistant has never been switched on for this copy; no ask is put to it and no run starts.", |
| legacy-ui | `civicos-ui/app.html:909` | This copy | M | <div class="brand"><button class="mback hidden" id="mback" onclick="navBack()" title="back to where you were, at the same place on the page">&larr;</b |
| legacy-ui | `civicos-ui/app.html:922` | This copy | M | <div class="idstr" id="m-idstr" data-group="silent">This copy could not read its group just now</div> |
| legacy-ui | `civicos-ui/app.html:931` | This copy | M | <div><div class="gname" id="p-gname" data-group="silent">This copy could not read its group just now</div><div class="gid" id="p-gid"></div></div> |
| legacy-ui | `civicos-ui/app.html:1007` | this copy | M | none:   "No group is recorded for this copy yet", |
| legacy-ui | `civicos-ui/app.html:1008` | This copy | M | silent: "This copy could not read its group just now", |
| legacy-ui | `civicos-ui/app.html:1153` | the plane | M | const j = await r.json().catch(()=>({ok:false,error:"the plane did not return JSON"})); |
| legacy-ui | `civicos-ui/app.html:1204` | the plane | M | const j = await r.json().catch(()=>({ok:false,error:"the plane did not return JSON"})); |
| legacy-ui | `civicos-ui/app.html:1342` | the plane | M | const msg = err && (words \|\| err.reason) ? [err.reason, words].filter(Boolean).join(" · ") : "Could not reach the plane. If this is a local file aga |
| legacy-ui | `civicos-ui/app.html:2102` | this instance | M | enables:["read the statements and what they rest on","adopt it for this instance or for a project","send it back to draft"], |
| legacy-ui | `civicos-ui/app.html:2120` | The plane | M | monitored:   { chip:"monitored", mark:"M",  meaning:"The plane re-checks the live source on a schedule and flags drift." }, |
| legacy-ui | `civicos-ui/app.html:2201` | the instance | M | purpose: "The whole record as rows: every bundle the instance holds, with its type and its state.", |
| legacy-ui | `civicos-ui/app.html:2255` | this instance | M | purpose: "Who holds what in this instance: the roster, each member's capabilities, and the invitations outstanding — and, for an administrator's sessi |
| legacy-ui | `civicos-ui/app.html:2340` | this instance | M | purpose: "The cases this instance has published, readable by somebody holding no credential at all.", |
| legacy-ui | `civicos-ui/app.html:2354` | the instance | M — 'the instance' as the review copy's boundary; borderline, counted M | purpose: "A draft of a case shown, before and without publication, to the people it is addressed to, inside this record: marked as what it is, as comp |
| legacy-ui | `civicos-ui/app.html:2361` | the plane | M | purpose: "One published case at one edition, with the plane's own account of why it carries no single case-level strength and of what its index does a |
| legacy-ui | `civicos-ui/app.html:2565` | The plane | M | "SSHSIG":     "OpenSSH's signature format. The plane's releases are signed with it, and anyone can check a signature with stock ssh-keygen.", |
| legacy-ui | `civicos-ui/app.html:7249` | The plane | M | if(!doc \|\| !snap.manifest_sha256) return { ok:false, why:"The plane returned no manifest for the completed capture." }; |
| legacy-ui | `civicos-ui/app.html:13442` | this plane | M | return head + '<p class="subj-note">This record does not publish a way to search what its captured documents SAY, so this route was not asked. It is n |
| legacy-ui | `civicos-ui/app.html:13933` | The plane | M | const head = esc([e.reason, e.error].filter(Boolean).join(" \u00b7 ") \|\| "The plane refused."); |
| legacy-ui | `civicos-ui/app.html:14191` | The plane | M | <p class="dz-rlede">The plane recorded the act. It now reads as <span class="chip ${esc(to)}">${esc(to)}</span> in the record, and its Session Log car |
| legacy-ui | `civicos-ui/app.html:14298` | the plane | M | <p class="bl-note">At <b>two</b> owners this parts company with the administrator rule, where a removal at two is impossible. Here the departing owner |
| legacy-ui | `civicos-ui/app.html:14787` | This instance | M | + '${k.attests?"":' <span class="chip collected" title="This instance would refuse a signature from this key right now.">cannot sign now</span>'}</td> |
| legacy-ui | `civicos-ui/app.html:16201` | this plane | M | return '<div class="q-feed absent" data-feed="${esc(f.id)}"><b>This op is not on this plane.</b> ${esc(f.what)} — the read this needs is not registere |
| legacy-ui | `civicos-ui/app.html:16203` | The plane | M | return '<div class="q-feed failed" data-feed="${esc(f.id)}"><b>This feed failed: ${esc(f.label)}.</b> ${esc(f.what)} — and the record could not answer |
| legacy-ui | `civicos-ui/app.html:16218` | this plane | M | return '<div class="q-allclear"><b>Nothing needs anybody right now.</b> Every feed this surface reads answered, and every one of them was empty. An al |
| legacy-ui | `civicos-ui/app.html:16475` | The plane | M | const msg = [e && e.reason, refusalWords(e)].filter(Boolean).join(" · ") \|\| "The plane did not accept that."; |
| legacy-ui | `civicos-ui/app.html:19127` | This instance | M | { id:"storage", title:"This instance can store evidence", pass:storage }, |
| legacy-ui | `civicos-ui/app.html:19341` | The plane | M | const head = esc([e&&e.reason, e&&e.error].filter(Boolean).join(" · ") \|\| "The plane refused, and stored nothing."); |
| legacy-ui | `civicos-ui/app.html:19684` | The plane | M | const ADD_CAPTURE_TEACH = '<div class="teach" style="margin-top:14px"><b>What gets recorded.</b> The plane |
| legacy-ui | `civicos-ui/app.html:19729` | the plane | M | something you hold. Give an address and the plane fetches it, hashes it at receipt, and |
| legacy-ui | `civicos-ui/app.html:20415` | the plane | M | const msg = e && (words \|\| e.reason) ? [e.reason, words].filter(Boolean).join(" · ") : "Could not reach the plane."; |
| legacy-ui | `civicos-ui/app.html:24856` | this plane | M | return "<b>" + esc(queueClassLabel(cls)) + "</b> — nothing on this plane raises one of these yet. This part of the " |
| legacy-ui | `civicos-ui/app.html:25028` | this plane | M | + 'nothing on this plane looks yet — and which one is true is said here per class rather than ' |
| legacy-ui | `civicos-ui/app.html:26107` | this copy | M | + '<button class="btn ghost" id="rv-export" onclick="rvcExport()">Export this copy to a file</button></div>'; |
| legacy-ui | `civicos-ui/app.html:26122` | the copy | M | + '<p class="subj-note">A review copy is a draft of a case, shown to the people you address it to, inside this group&rsquo;s record. It is not a publi |
| legacy-ui | `civicos-ui/app.html:26148` | the copy | M | + (RVC.draft ? ' <button class="btn ghost" onclick="rvcOpen(\'' + esc(RVC.draft) + '\')">Back to the copy</button>' : ''); |
| notice-producers | `bio-plane/src/notice-producers/index.mjs:357` | this copy | M | : "the assistant's half of standing questions is switched off on this copy"; |
| notice-producers | `bio-plane/src/notice-producers/index.mjs:360` | this copy | M | if (h.condition === "not_deployed") return "the assistant is not available on this copy"; |
| plane | `bio-plane/src/plane/ask.mjs:36` | this plane | M | return json({ ok: false, reason: "AGENT_WORKER_UNBOUND", detail: "no assistant member is bound to this plane. Nothing was asked." }, 503); |
| plane | `bio-plane/src/plane/screens.mjs:16` | the instance | M | "The whole record as rows: every bundle the instance holds, with its type and its state."), |
| plane | `bio-plane/src/plane/screens.mjs:33` | this instance | M | "Who holds what in this instance: the roster, each member's capabilities, and the invitations outstanding."), |
| plane | `bio-plane/src/plane/screens.mjs:56` | this instance | M | "The cases this instance has published, readable by somebody holding no credential at all."), |
| queue-producers | `bio-plane/src/queue-producers/index.mjs:218` | this instance | M | static ZONE_UNDETERMINED = "no time zone is held for it on this instance, so the local day it is counted from is " |
| queue-producers | `bio-plane/src/queue-producers/index.mjs:1623` | this instance | M | detail: 'An export of the ${r.scope} left this instance with the root-of-trust credential ' |
| queue-producers | `bio-plane/src/queue-producers/index.mjs:3197` | this copy | M | detail: "no instance key was bound when it fell due, so this copy could not sign the notice's activity " |
| queue-producers | `bio-plane/src/queue-producers/index.mjs:3226` | this copy | M | detail: "this copy signed the closing into the notice's public record. An owner may still stop the notice " |
| queue-producers | `bio-plane/src/queue-producers/index.mjs:3487` | this copy | M | + "docket, a verified entry this copy read. It is read here, never raised, and nothing was regraded." }, |
| queue-producers | `bio-plane/src/queue-producers/index.mjs:3560` | this copy | M | detail: 'Entry ${e.seq} of the docket, ${kindWords}${e.date ? ', dated ${e.date}' : ""}, was read and verified by this copy. ' |
| queue-producers | `bio-plane/src/queue-producers/index.mjs:3612` | this copy | M | summary: 'an entry on the publisher's docket for ${whose(e)}, which you follow, failed this copy's checks', |
| queue-producers | `bio-plane/src/queue-producers/index.mjs:3741` | this copy | M | : "It passed its checks again when this copy started, and members are offered it as before. This is told once.", |
| wizard-scripts | `bio-plane/src/wizard-scripts/checks.mjs:116` | the instance | M | + "the instance registers, and this one is none of them.", |

## Rows excluded (X)

| module | file:line | phrase | reason |
|---|---|---|---|
| case-disclosures | `bio-plane/src/case-disclosures/document.mjs:23` | the copy | a capture's copy (a document's copy) |
| case-import | `bio-plane/src/case-import/index.mjs:457` | this copy | names a module or binding not composed: operator-facing |
| case-import | `bio-plane/src/case-import/index.mjs:553` | this copy | names a module or binding not composed: operator-facing |
| case-tensions | `bio-plane/src/case-tensions/index.mjs:571` | the plane | the control plane's stamp named to a caller that has none (T34-78's exclusion) |
| public-read | `bio-plane/src/container.mjs:116` | the plane | refusal detail naming ops, addressed to the calling agent |
| publication | `bio-plane/src/publication/index.mjs:155` | this plane | refusal detail naming ops, addressed to the calling agent |
| ratification | `bio-plane/src/ratification/checks.mjs:554` | this plane | C-41 finding message (remedy names op=publish), agent-facing; not a translation (borderline: shown via GATE_REFUSED) |
| ratification | `bio-plane/src/ratification/checks.mjs:574` | this instance | C-41 finding message (remedy names op=publish), agent-facing; not a translation (borderline: shown via GATE_REFUSED) |
| ratification | `bio-plane/src/ratification/checks.mjs:701` | the plane | C-41 finding message (remedy names op=publish), agent-facing; not a translation (borderline: shown via GATE_REFUSED) |
| ratification | `bio-plane/src/ratification/checks.mjs:734` | the plane | C-41 finding message (remedy names op=publish), agent-facing; not a translation (borderline: shown via GATE_REFUSED) |
| ratification | `bio-plane/src/ratification/checks.mjs:735` | server | C-41 finding message (remedy names op=publish), agent-facing; not a translation (borderline: shown via GATE_REFUSED) |
| ratification | `bio-plane/src/ratification/index.mjs:729` | this plane | refusal detail naming ops, addressed to the calling agent |
| review | `bio-plane/src/review/checks.mjs:121` | this copy | a review copy (DEC-149 keeps it) |
| review | `bio-plane/src/review/checks.mjs:127` | the copy | a review copy (DEC-149 keeps it) |
| review | `bio-plane/src/review/index.mjs:213` | this copy | a review copy (DEC-149 keeps it) |
| review | `bio-plane/src/review/index.mjs:220` | THE COPY | a review copy (DEC-149 keeps it) |
| review | `bio-plane/src/review/index.mjs:221` | THE COPY | a review copy (DEC-149 keeps it) |
| review | `bio-plane/src/review/index.mjs:222` | the copy | a review copy (DEC-149 keeps it) |
| review | `bio-plane/src/review/index.mjs:449` | this copy | a review copy (DEC-149 keeps it) |
| action-plans | `bio-plane/src/action-plans/index.mjs:1818` | this instance | names a module or binding not composed: operator-facing |
| actions | `bio-plane/src/actions/index.mjs:2204` | The plane | the control plane's stamp named to a caller that has none (T34-78's exclusion) |
| actions | `bio-plane/src/actions/index.mjs:2727` | this instance | names a module or binding not composed: operator-facing |
| escalation | `bio-plane/src/escalation/index.mjs:1535` | this instance | names a module or binding not composed: operator-facing |
| link-sweep | `bio-plane/src/link-sweep/checks.mjs:117` | this instance | field validation naming the schema path: agent-facing |
| monitoring | `bio-plane/src/monitoring/index.mjs:263` | the instance | addressed to the model (a run's instructions) |
| monitoring | `bio-plane/src/monitoring/index.mjs:544` | this instance | an operator's storage binding (R2) |
| monitoring | `bio-plane/src/monitoring/index.mjs:987` | this instance | an operator's storage binding (R2) |
| monitoring | `bio-plane/src/monitoring/index.mjs:1240` | this plane | names a contract code; developer-facing |
| admission | `bio-plane/src/admission/index.mjs:60` | this instance | credential-scope detail naming ops or namespaces: operator/agent-facing |
| admission | `bio-plane/src/admission/index.mjs:116` | this instance | credential-scope detail naming ops or namespaces: operator/agent-facing |
| admission | `bio-plane/src/admission/index.mjs:240` | this instance | credential-scope detail naming ops or namespaces: operator/agent-facing |
| admission | `bio-plane/src/admission/index.mjs:338` | this instance | credential-scope detail naming ops or namespaces: operator/agent-facing |
| admission | `bio-plane/src/admission/index.mjs:357` | This instance | credential-scope detail naming ops or namespaces: operator/agent-facing |
| admission | `bio-plane/src/admission/index.mjs:363` | this instance | credential-scope detail naming ops or namespaces: operator/agent-facing |
| admission | `bio-plane/src/admission/index.mjs:364` | this instance | credential-scope detail naming ops or namespaces: operator/agent-facing |
| affordances | `bio-plane/src/affordances.mjs:600` | server | grading note (NON_ACTS/RUNG reason) for the surface and the model, not member text |
| affordances | `bio-plane/src/affordances.mjs:609` | the plane | grading note (NON_ACTS/RUNG reason) for the surface and the model, not member text |
| affordances | `bio-plane/src/affordances.mjs:1173` | the instance | grading note (NON_ACTS/RUNG reason) for the surface and the model, not member text |
| affordances | `bio-plane/src/affordances.mjs:1192` | this instance | grading note (NON_ACTS/RUNG reason) for the surface and the model, not member text |
| affordances | `bio-plane/src/affordances.mjs:1210` | the instance | grading note (NON_ACTS/RUNG reason) for the surface and the model, not member text |
| affordances | `bio-plane/src/affordances.mjs:1235` | the instance | grading note (NON_ACTS/RUNG reason) for the surface and the model, not member text |
| affordances | `bio-plane/src/affordances.mjs:1239` | server | grading note (NON_ACTS/RUNG reason) for the surface and the model, not member text |
| affordances | `bio-plane/src/affordances.mjs:2375` | the plane | grading note (NON_ACTS/RUNG reason) for the surface and the model, not member text |
| affordances | `bio-plane/src/affordances.mjs:2569` | the instance | grading note (NON_ACTS/RUNG reason) for the surface and the model, not member text |
| affordances | `bio-plane/src/affordances.mjs:2573` | the instance | grading note (NON_ACTS/RUNG reason) for the surface and the model, not member text |
| affordances | `bio-plane/src/affordances.mjs:2574` | the instance | grading note (NON_ACTS/RUNG reason) for the surface and the model, not member text |
| affordances | `bio-plane/src/affordances.mjs:2578` | the instance | grading note (NON_ACTS/RUNG reason) for the surface and the model, not member text |
| affordances | `bio-plane/src/affordances.mjs:2587` | the instance | grading note (NON_ACTS/RUNG reason) for the surface and the model, not member text |
| affordances | `bio-plane/src/affordances.mjs:2713` | this instance | grading note (NON_ACTS/RUNG reason) for the surface and the model, not member text |
| affordances | `bio-plane/src/affordances.mjs:2872` | this copy | grading note (NON_ACTS/RUNG reason) for the surface and the model, not member text |
| affordances | `bio-plane/src/affordances/t33.mjs:131` | the copy | grading note (NON_ACTS/RUNG reason) for the surface and the model, not member text |
| affordances | `bio-plane/src/affordances/t33.mjs:134` | the copy | grading note (NON_ACTS/RUNG reason) for the surface and the model, not member text |
| affordances | `bio-plane/src/affordances/t33.mjs:144` | the copy | grading note (NON_ACTS/RUNG reason) for the surface and the model, not member text |
| affordances | `bio-plane/src/affordances/t33.mjs:150` | the copy | grading note (NON_ACTS/RUNG reason) for the surface and the model, not member text |
| affordances | `bio-plane/src/affordances/t33.mjs:152` | this copy | grading note (NON_ACTS/RUNG reason) for the surface and the model, not member text |
| affordances | `bio-plane/src/affordances/t33.mjs:165` | the instance | grading note (NON_ACTS/RUNG reason) for the surface and the model, not member text |
| affordances | `bio-plane/src/affordances/t33.mjs:299` | the copy | grading note (NON_ACTS/RUNG reason) for the surface and the model, not member text |
| affordances | `bio-plane/src/affordances/t33.mjs:302` | the copy | grading note (NON_ACTS/RUNG reason) for the surface and the model, not member text |
| affordances | `bio-plane/src/affordances/t33.mjs:336` | the copy | grading note (NON_ACTS/RUNG reason) for the surface and the model, not member text |
| affordances | `bio-plane/src/affordances/t33.mjs:353` | the copy | grading note (NON_ACTS/RUNG reason) for the surface and the model, not member text |
| affordances | `bio-plane/src/affordances/t33.mjs:355` | the copy | grading note (NON_ACTS/RUNG reason) for the surface and the model, not member text |
| affordances | `bio-plane/src/affordances/t33.mjs:362` | the instance | grading note (NON_ACTS/RUNG reason) for the surface and the model, not member text |
| affordances | `bio-plane/src/affordances/t33.mjs:363` | the copy | grading note (NON_ACTS/RUNG reason) for the surface and the model, not member text |
| affordances | `bio-plane/src/affordances/t33.mjs:366` | the instance | grading note (NON_ACTS/RUNG reason) for the surface and the model, not member text |
| affordances | `bio-plane/src/affordances/t33.mjs:369` | this copy | grading note (NON_ACTS/RUNG reason) for the surface and the model, not member text |
| control-plane | `bio-plane/src/control-plane/index.mjs:1976` | the plane | names provenanceCapture: agent-facing |
| installer | `bio-plane/public/newgroup/index.html:53` | servers | other companies' servers, not the group's Civicsmith |
| legacy-ui | `civicos-ui/app.html:4084` | server | an HTTP header name |
| legacy-ui | `civicos-ui/app.html:25811` | this copy | a review copy (DEC-149 keeps it) |
| legacy-ui | `civicos-ui/app.html:25986` | this copy | a review copy (DEC-149 keeps it) |
| legacy-ui | `civicos-ui/app.html:25990` | the copy | a review copy (DEC-149 keeps it) |
| legacy-ui | `civicos-ui/app.html:25992` | this copy | a review copy (DEC-149 keeps it) |
| legacy-ui | `civicos-ui/app.html:26011` | the copy | a review copy (DEC-149 keeps it) |
| legacy-ui | `civicos-ui/app.html:26037` | the copy | a review copy (DEC-149 keeps it) |
| legacy-ui | `civicos-ui/app.html:26102` | this copy | a review copy (DEC-149 keeps it) |
| legacy-ui | `civicos-ui/app.html:26198` | the copy | a review copy (DEC-149 keeps it) |
| legacy-ui | `civicos-ui/app.html:26234` | the copy | a review copy (DEC-149 keeps it) |
| legacy-ui | `civicos-ui/check-mock-envelope.mjs:343` | the plane | test harness, developer-facing |
| legacy-ui | `civicos-ui/check-mock-envelope.mjs:355` | the plane | test harness, developer-facing |
| legacy-ui | `civicos-ui/check-mock-envelope.mjs:357` | the plane | test harness, developer-facing |
| legacy-ui | `civicos-ui/check-mock-envelope.mjs:527` | the plane | test harness, developer-facing |
| legacy-ui | `civicos-ui/check-mock-envelope.mjs:545` | the plane | test harness, developer-facing |
| legacy-ui | `civicos-ui/check-mock-envelope.mjs:546` | the plane | test harness, developer-facing |
| legacy-ui | `civicos-ui/check-mock-envelope.mjs:566` | the plane | test harness, developer-facing |
| legacy-ui | `civicos-ui/check-mock-envelope.mjs:573` | the plane | test harness, developer-facing |
| legacy-ui | `civicos-ui/check-mock-envelope.mjs:580` | the plane | test harness, developer-facing |
| legacy-ui | `civicos-ui/check-mock-envelope.mjs:583` | the plane | test harness, developer-facing |
| legacy-ui | `civicos-ui/check-mock-envelope.mjs:590` | the plane | test harness, developer-facing |
| op-declarations | `bio-plane/src/op-declarations/index.mjs:2897` | THE INSTANCE | an OPS row's provenance quote: developer-facing |
| plane | `bio-plane/src/plane/wiring.mjs:95` | this plane | names a module or binding not composed: operator-facing |
| queue | `bio-plane/src/queue/index.mjs:1435` | this plane | API-parameter guidance to the caller (send an instant, item vs case+kinds) |
| queue | `bio-plane/src/queue/index.mjs:1680` | this plane | API-parameter guidance to the caller (send an instant, item vs case+kinds) |
| queue | `bio-plane/src/queue/index.mjs:1711` | this plane | API-parameter guidance to the caller (send an instant, item vs case+kinds) |
| queue | `bio-plane/src/queue/index.mjs:1812` | this plane | API-parameter guidance to the caller (send an instant, item vs case+kinds) |
| queue | `bio-plane/src/queue/index.mjs:1828` | this copy | API-parameter guidance to the caller (send an instant, item vs case+kinds) |
| queue | `bio-plane/src/queue/index.mjs:1834` | this copy | API-parameter guidance to the caller (send an instant, item vs case+kinds) |
| queue-producers | `bio-plane/src/queue-producers/index.mjs:487` | this instance | doctrine or internal ids (D-, DEC-, R) in the text: developer-facing |
| queue-producers | `bio-plane/src/queue-producers/index.mjs:758` | the plane | doctrine or internal ids (D-, DEC-, R) in the text: developer-facing |
| queue-producers | `bio-plane/src/queue-producers/index.mjs:1222` | the plane | doctrine or internal ids (D-, DEC-, R) in the text: developer-facing |
| queue-producers | `bio-plane/src/queue-producers/index.mjs:2013` | this instance | doctrine or internal ids (D-, DEC-, R) in the text: developer-facing |
| queue-producers | `bio-plane/src/queue-producers/index.mjs:3649` | this copy | doctrine or internal ids (D-, DEC-, R) in the text: developer-facing |
| queue-producers | `bio-plane/src/queue-producers/index.mjs:3675` | this copy | doctrine or internal ids (D-, DEC-, R) in the text: developer-facing |

## Notes for BOB

- Plan entries T34-79 and K1790 place "No keys are registered on this copy yet" in publication's pages; it is `bio-plane/src/setup.mjs:890`, `instance-setup`'s (T34-81 names only the claim page, R53). publication's own paths hold no member-facing match (`publication/index.mjs:155` is an agent-facing detail; `publication/worker.mjs` is `public-read`'s by its explicit path and counted there only).
- ratification has no pages of its own: its two member-facing strings are the catalogue translations C-32.14 and C-32.15 (`ratification/checks.mjs:1016`, `:1025`), drafted as ratification R47. Its C-41 finding messages (`checks.mjs:554`, `:574`, `:701`, `:734`) say "this plane"/"this instance" but are check messages naming `op=publish` as the remedy; excluded as agent-facing, borderline since `GATE_REFUSED` relays them.
- admission `checks.mjs:282`, `:297` repeat ratification's "operator's access tokens for this copy" sentence (C-32 rows of admission's own); the same re-wording fits.
- public-read's 26 P rows include its catalogue translations C-98.* ("This copy of the record …"), and `public-read` R17's requirement text itself spells C-98.10's translation with "This copy of the record"; a change there is a requirement change.
- instance-setup's 58 rows are mostly the setup page (`setup.mjs` 87–616: "Claim this copy", "Your copy is healthy", crumbs "This copy") and the assistant switch's sentences (2925–2959); T34-81 names only R53's claim page.
- installer's 105 rows are "your copy" throughout `newgroup/src/index.mjs` and `ui.mjs` and the landing page; DEC-149 allows "installation" there only where the hosting is the subject. T34-84 covers them.
- legacy-ui (`civicos-ui/app.html`) has 36 M rows ("This copy could not read its group", "the plane did not return JSON", screen purposes "this instance"); its T34-77 entry does not carry DEC-149. Its review-copy rows (25811–26234) are excluded.
- affordances' 30 rows are NON_ACTS/RUNG reasons ("the copy's configuration …"), read by the surface and the model; excluded, BOB to confirm, since R21 makes them "surface-facing text" a surface may render.
