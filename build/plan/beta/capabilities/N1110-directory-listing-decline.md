# N1110 a steward may decline or remove a listing: requirement drafts, what blocks, options (CAPABILITIES worker, 2026-10-27)

**Status** · DRAFT, not READY; written by a worker for CAPABILITIES #1 (lane/capabilities); nothing outside this file was edited, nothing committed. Ids are draft ids ("next free after the highest `**Rn**` in the module's file, PLANNING renumbers").
**Read whole:** `stewards.md` R1-R23 lines I cite (R1, R3, R5, R12-R15, R22, R23, Purpose, Suggestions, Mail note); `site.md` R4, R13, R15, R16 and its Deployment and Listed groups notes; `network-notices.md` Purpose, R22, R23, R30; DEC-255, DEC-270, DEC-132 (3) and DEC-111; Publication §5E and §5B (the directory paragraphs); K3359, K3384, K3296; N1110, N923, N1159 in `next.md`.
**Not read whole:** `site.md` (13 KB: lines 1-63 skimmed by search), `network-notices.md` private part, `stewards.md` Private part, `BIO_Publication_v0_1.md` (read §5E and the directory lines only).

## 0. The finding that changes the entry

`next.md` N1110 and `archive/T52-R1.md` say the entry "waits (the rule's text awaits Bob's approval)". **That is out of date.** Bob approved the rule's text on 2026-10-15 ("rule: approved", DEC-270; Publication §5E is marked APPROVED; K3384). `site` R15 already draws the rule on civicsmith.org's groups page in both states, as Bob's protected text. K3359 (2026-10-14) is the earlier statement. What still blocks N1110 is that **no listing machinery exists to decline or remove from, and Bob has not said which "directory" he means.**

There are two things called "the directory":
1. **civicsmith.org's "Groups at work"** (`site` R4): one row per group in `LISTED_GROUPS`, kept by hand by the stewards "from groups' submissions" until a directory exists (`site` Listed groups note). DEC-255 governs this one ("May the stewards of civicsmith.org decline or remove a group's listing?").
2. **The network directory at believeincities.org/<place>**: lives outside Civicsmith, held by Bob "as holder of the domains, not Civicsmith's rules" (Publication §5B); it reads groups' signed notices; Civicsmith offers links out and a prefilled submission (`network-notices` R23). DEC-255 and the approved rule do not mention it. The words "the directory is not built" in DEC-255's reversal cost and in N1110 refer to a service that would hold requests and decisions; `network-notices` R23 only prepares a submission.

What already exists for a decline or removal, and what does not:

| DEC-255's owed items | exists today | gap |
|---|---|---|
| a steward may remove a listing | `stewards` R12 `withdraw` with `service: public_listing` and an `item`, a required reason (1-4,000), appended with the steward's name and time; R13 `reinstate`; R22 the public register of standing withdrawals | nothing applies the register to `LISTED_GROUPS` (`stewards` Callers' obligations: "no public listing exists yet"); `site` has no line reading it |
| recorded with the rule's part | none: the reason is free text | no `rule_part` field; nothing ties a decision to parts (1)-(4) of the approved rule |
| told to the group's administrators | `stewards` R14: nothing is ever sent to a reporter or a group; R22 Suggestions: telling a group "is a steward's own act by mail where a contact is known" | no channel: the stewards hold no group's contact; the product sends no email (`screens-settings` R23) |
| touching only the directory | R12's control: `withdraw` naming a group, a record or a bundle is refused; the stewards' service reaches no record (Purpose) | holds |
| the group may ask again | R13 `reinstate` exists | no path for a group to ask |
| how a group asks to be listed in the first place | `site` says "from groups' submissions (`network-notices` R23)" | R23 prefills a **case** (link, title, summary, slug) for the network directory; **no requirement prefills a group's own listing request** (name, place, focus, cases as listed) for civicsmith.org |
| the stewards' service open | `stewards` R1: closed until Bob names the contact address and the retention figures (N923, N1159, K2799) | everything below waits on it being open |

## 1. Bob's points

**B1. Which directory does the rule govern in the beta, and is a built listing desk wanted (architecture and policy).**
*Explanation.* Today a group is listed on civicsmith.org because a steward types it into a file; the approved rule says when a steward may refuse or remove it. There is no place where a group asks, a steward decides and the group can see the answer. The question is how much of that to build for the beta.
*Options.*
- **D1. Keep the hand-kept list; build only the record and the application.** A steward's removal is recorded with the rule's part and a reason (section 3, stewards R24), the site applies the register when it is next generated (site R17), and a group's request is a prefilled message it sends the stewards by their address (network-notices R32). Telling the group, and a group asking again, stay by mail between people. Smallest; every listing change still waits for Bob's deploy of the site (K1715). It satisfies DEC-255's "recorded with the rule's part and the reason ... touching nothing but the directory" in the product, and leaves "told" and "may ask again" as the stewards' own acts.
- **D2. A listing desk in the stewards' service** (recommended only if Bob wants "told" and "ask again" inside the product). Requests, decisions and each group's answer are held by the stewards' service; a group's administrator reads its own answer with a key given at the request (no account, no email, nothing pushed, the same pull model as the docket and the notices); the stewards' decisions produce the `LISTED_GROUPS` file the site is generated from. Drafted as option lines in section 4. New capability inside an existing module (`stewards`), so Bob's.
- **D3. The network directory at believeincities.org.** Outside Civicsmith and Bob's own; the approved rule does not cover it. If Bob wants the same rule there, that is his rule for his site, not a product requirement.
*Recommendation.* D1 for the beta, with D2 held until a second listed group makes manual telling a burden; D3 untouched. D1 delivers what Bob's DEC-255 says the product records, with the least new machinery and no new personal data.
*Decision wanted from Bob:* D1, D2 or D1 now and D2 later; and confirm the rule governs civicsmith.org's list only.

**B2. How a group learns the reason (privacy).**
Whatever the group is told includes which part of the rule applied and why; for part (4) ("aims at a private person") or part (2) ("pretends to be another group") the reason can itself be sensitive or reputationally harmful if public.
*Options.* **T1. By mail from the stewards' address, by hand, where the group gave a contact** (an optional contact line on its listing request, kept only while the listing or its decision stands and then erased on the stewards' retention, 90 days after the decision as `stewards` R15 does for a reporter). **T2. A key the group is given at its request** (D2): it reads its own state, part and reason at a stewards' address; only a hash of the key is kept; nothing is public. **T3. A public status line on civicsmith.org for the group** ("not listed: declined under part 2"). T3 is not recommended: a public record of why a group was declined is a judgement of a group in public, which the rule's own spirit avoids.
*Recommendation.* T1 with D1; T2 with D2; never T3. The public register of withdrawals (R22) continues to show only `{service, item, since, kind}` and never the part or the reason.

**B3. Whether the rule's four parts are a closed list in code (doctrine).** The approved text has four numbered parts, then "We never decline or remove ... for a group's views, its conclusions, or whom it holds to account". Recording a part means code holds a closed list of four. A change to the rule's text is Bob's (`site` R15: "a change is his"); the list would change with it, and a decision made under the old text keeps its old number. *Recommendation:* a closed `RULE_PARTS` of `1`-`4` plus the rule's text version (the date of Bob's approval, `2026-10-15`) stored with each decision; nothing in code writes the rule's words (R24).

## 2. What blocks, exactly

1. **Bob's answer to B1** (which option, which directory). Without it neither "the directory's module" nor its place in `modules.json` can be named; `modules.json` has no directory module and `stewards` and `site` are the only candidates.
2. **The stewards' service must be open** (`stewards` R1): Bob names the contact address and the retention figures (K2799, N923; N1159 is Bob's Email Routing acts on account `20b533579290b9b93168345edd3b7f72`). R24-R26 can be built and tested closed; they cannot serve a real decision until it opens.
3. **Bob's domain for civicsmith.org** (K3296: pages on `workers.dev` until his domain is set up) and **his deploy of the site for each listing change** (`site` Deployment note, K1715).
4. **B2's answer** if D2 or a contact line is wanted.
5. Nothing blocks on the rule text: it is approved (DEC-270).

## 3. Requirement lines drafted now (D1; all `*(not yet met: T53)*`)

### 3.1 stewards (next free R24)

- **R24** (T53; N1110; DEC-255, DEC-270; Publication §5E; amends R12, R13) *(not yet met: T53)* **A listing's withdrawal carries the rule's part.** When `decision` is `withdraw` and `withdraw.service` is `public_listing`, `withdraw` also takes `rule_part`, one of `RULE_PARTS` (`1`, `2`, `3`, `4`, exported, the parts of the approved listing rule in the order Bob's text gives them: not a group using Civicsmith or advertising or spam; pretending to be another group, person or office; published against a court's order or unlawful to publish; aimed at a private person's home, family or private life) and `rule_text_version` (the date of Bob's approval of the text applied, set by the service from its configuration, `2026-10-15` today). A `public_listing` withdrawal without `rule_part` is refused `RULE_PART_REQUIRED`, one outside the list `RULE_PART_UNKNOWN`, each after R12's earlier refusals and writing nothing. No refusal exists for "views", "conclusions" or "whom it holds to account": there is no part for them, and no `rule_part` can name one. The stored decision keeps the part and version beside the reason; the part and the reason are readable by a steward only and are never in R13's public list, R22's register, any page outside `/steward/` or R14's notification. Other services (`shared_profile`, `template_library`) take no `rule_part`; one sent is refused `RULE_PART_NOT_APPLICABLE`. Test: a `public_listing` withdrawal with part `2` and a reason is stored with part, version, steward and time; the same without a part is refused; part `5` is refused; the public register shows `{service, item, since, kind}` and neither the part nor the reason; a `template_library` withdrawal with a part is refused. Control: R12's withdrawals of the other two services answer as before.
- **R25** (T53; N1110; DEC-255; amends R13, R22) *(not yet met: T53)* **Reinstating a listing records why it is fixed.** `reinstate` of a `public_listing` withdrawal takes a reason (R13's) and ends the withdrawal; the earlier decision, its part and its reason stay in the steward-visible history, and the register (R22) drops the item. A group asking again is a new report or a new listing request handled by a steward as before; nothing makes a past decision binding on the next (the rule says "once it is fixed, the group can ask again"). Test: a withdrawn item is reinstated with a reason and leaves the register while its history keeps the part; a second request after reinstatement can be withdrawn again with a new part. Control: a reinstatement of an item not withdrawn is `NOT_WITHDRAWN` as R13 states.
- **R26** (T53; N1110; DEC-255 owed "told to the group's administrators"; B2) *(not yet met: T53)* **The service gives the steward what to tell the group, and tells no one itself.** For a `public_listing` withdrawal the steward's page shows a ready sentence by key from the part, the rule's number and the reason, for the steward to send by their own mail where a contact is known (R22 Suggestions); the service sends nothing to a group and holds no group contact. If Bob rules D2 and T2, this line is replaced by the desk's R-lines (section 4). Test: the steward's page for a withdrawn listing carries the key's sentence with the part and reason; the service's mail binding records zero messages to anyone but `STEWARDS_ADDRESS` (R14). Control: R14's one notification per accepted report is unchanged.

### 3.2 site (next free R17)

- **R17** (T53; N1110; DEC-255; `stewards` R13, R22, Callers' obligations; amends R4) *(not yet met: T53)* **The listed groups exclude a standing withdrawal.** At generation the site reads the stewards' public register (a file the deploy supplies with its SHA-256, as the maintainers of the shared services apply the register at their next release) and draws no row for a `LISTED_GROUPS` entry whose slug stands in it as a `public_listing` item; with no register file it draws `LISTED_GROUPS` whole and says nothing about it; a register that is present but malformed fails the generation loudly and publishes nothing new. The page never says that a group was withdrawn, why, or under which part; it draws no trace of the row. The site makes no outbound call and stores nothing (its Purpose). Test: two listed groups and a register withdrawing one draw one row and no word of the other; after reinstatement (an empty register) both draw; a malformed register fails the build. Control: with no register, both rows draw and the empty-state rules of R13 hold.

### 3.3 network-notices (next free R32)

- **R32** (T53; N1110; DEC-132 (3), DEC-247; outward-act warning, principle 4.5; amends R23's neighbour) *(not yet met: T53)* **`listingRequest({viewer})` prefills a group's request to be listed on civicsmith.org.** For an administrator at `FULL` sight, it answers the fields of the request: the group's display name, its place, its focus, and its published cases as the site's row shows them (`site` R4), each only if the group has set it public (DEC-132 (3)); an administrator copies them or opens the stewards' address with them. It sends nothing, calls nothing and records that nothing was requested; the act carries the outward-act warning that the people the group examines will see what it is watching (DEC-132 (3)). A group that keeps itself to its members answers `{listed: false}` and fields none. Test: a group with a public focus answers the four fields; a members-only group answers none; no network call is made. Control: `directorySubmission` (R23) answers as before.

## 4. Option lines, only if Bob rules D2 (a listing desk in `stewards`; drafted so the cost can be seen, not to be built unasked)

- **R-D2a** (`stewards`, next ids after R26) **A listing request.** `POST /listing/request` takes `{slug, name, place, focus, cases[], contact?}` from anyone, no account, rate-bounded as R3's intake is, returns `{ok, ref, key}` where `key` is a 160-bit secret shown once and only its SHA-256 is kept; the request waits for a steward. Refusals as R3's (envelope, field).
- **R-D2b** **A steward's decision.** A steward lists, declines (with `rule_part` and a reason, R24's rules) or removes; each is appended as R12 appends; the listed set is exported with its digest as the file the site's deploy reads (R17).
- **R-D2c** **A group reads its answer.** `GET /listing/status` with the key answers `{state: requested | listed | declined | removed, since, rule_part?, rule_text?, reason?}`; a wrong key answers one dead answer, byte-identical to an unknown one (the review-copy grant's door, `filing-templates` R8, is the pattern); the key is erased 90 days after the last decision. A group asks again with a new request.
- **R-D2d** **Retention.** A request's `contact` is erased as R15 erases a reporter's; a declined or removed request is kept as long as the withdrawal stands.
Each carries Test/Control lines I have not written: they depend on Bob's B1 and B2 answers and on `stewards` growing past its 900-line size note (P6), which may force a split first.

## 5. Tests for D1 (for PLANNING)

1. `stewards` store tests with the fake mail binding: R24's refusals in order, the public-register shape, the history.
2. A site generation test with fixtures: two listed groups, a register, an empty register, a malformed register.
3. A seam test that the register `stewards` serves is the file the site reads (same canonical JSON and digest, `stewards` R13).
4. A static check that no module outside `/steward/` names a part or a reason, and that the rule's English is only the key `site.groups.rule.text` (`site` R15's control).
5. Never an account but `20b533579290b9b93168345edd3b7f72` in any live check; the stewards' Email Routing test delivery is Bob's act (N1159).

## 6. Suggestions (bind nothing)

- When N1110 is placed, `next.md` should drop the "rule awaits Bob's approval" half of its hard reason and keep only B1's answer and the stewards' opening.
- The rule's part numbers are stable ids; the key words (`screen.steward.rule.part.1` ...) can be reworded by the design stream without a requirement change.
