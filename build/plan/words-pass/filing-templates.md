# filing-templates: the words check after the conversion (K3949)

Layer 9. 11 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/filing-templates/invariants.test.mjs:202` [?] ops: templateapprove, templatecomment, templatecomments, ... (13 of 13 not the module's own)
- inline `bio-plane/src/filing-templates/checks.mjs:31` [copy] "This template isn't offered yet: it lacks {missing}." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/filing-templates/checks.mjs:95` "The words name a blank that no filing fills. Use only the blanks fi..."
- inline `bio-plane/src/filing-templates/index.mjs:126` "{{{}}} is not a blank filings fill{}"
- inline `bio-plane/src/filing-templates/index.mjs:996` [copy] "an undetermined tier"
- testcopy `bio-plane/test/m/filing-templates/invariants.test.mjs:138` [part] "Two templates you can see go by that name here, so neither was chosen." — part test copy
- testcopy `bio-plane/test/m/filing-templates/invariants.test.mjs:139` [part] "Pick the template by its id. Nothing was drafted."
- testcopy `bio-plane/test/m/filing-templates/invariants.test.mjs:233` [part] "A template is written for jurisdiction profiles your team's Civicsmith" — part test copy
- testcopy `bio-plane/test/m/filing-templates/invariants.test.mjs:234` [part] "holds, or for none in particular (general), and a profile named is ..." — part test copy
- testcopy `bio-plane/test/m/filing-templates/invariants.test.mjs:235` [part] "A review grant opens by a secret link your team's Civicsmith makes,..." — part test copy
- testcopy `bio-plane/test/m/filing-templates/invariants.test.mjs:236` [part] "was made for this request. Nothing was granted."

## Plain findings (K3957)

42 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('filing-templates.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/filing-templates/blanks.mjs:15` "the organisation of a reporter, an organisation or another team the action is addressed to"
- plain `bio-plane/src/filing-templates/index.mjs:145` "a request for comment carries the sentence that the reply may be quoted unless it says ..."
- plain `bio-plane/src/filing-templates/index.mjs:213` "no member is named as the one acting: this call carries nobody"
- plain `bio-plane/src/filing-templates/index.mjs:222` "no template by that id is readable here; one you may not see answers the same"
- plain `bio-plane/src/filing-templates/index.mjs:535` "a kind is lower-case letters, digits and underscores, beginning with a letter"
- plain `bio-plane/src/filing-templates/index.mjs:544` "a template's use is file or brief"
- plain `bio-plane/src/filing-templates/index.mjs:546` "a template names the profiles it is written for, or general"
- plain `bio-plane/src/filing-templates/index.mjs:551` "the kind's tier is 3: no file template is kept for it; a brief template may serve it"
- plain `bio-plane/src/filing-templates/index.mjs:558` "the scope's library already holds a template by this name"
- plain `bio-plane/src/filing-templates/index.mjs:620` "a template is drafted by a joined participant of its project"
- plain `bio-plane/src/filing-templates/index.mjs:704` "a profile's template is read-only here"
- plain `bio-plane/src/filing-templates/index.mjs:704` "a draft is revised by a joined participant of its project"
- plain `bio-plane/src/filing-templates/index.mjs:742` "no stamped proposer: a proposal names who made it"
- plain `bio-plane/src/filing-templates/index.mjs:790` "a profile's template is read-only here"
- plain `bio-plane/src/filing-templates/index.mjs:790` "a draft is submitted by a joined participant of its project"
- plain `bio-plane/src/filing-templates/index.mjs:806` "name a member to review it, or open a review grant on the version first"
- plain `bio-plane/src/filing-templates/index.mjs:835` "a profile's template is read-only here"
- plain `bio-plane/src/filing-templates/index.mjs:835` "a review grant is opened by a joined participant of the template's project"
- plain `bio-plane/src/filing-templates/index.mjs:844` "no fresh secret digest was stamped for this grant: your team's Civicsmith makes the secret"
- plain `bio-plane/src/filing-templates/index.mjs:868` "no review grant by that id is readable here"
- plain `bio-plane/src/filing-templates/index.mjs:872` "a review grant is revoked by a joined participant of the template's project"
- plain `bio-plane/src/filing-templates/index.mjs:933` "the text reviewed is not the version's present text"
- plain `bio-plane/src/filing-templates/index.mjs:966` "a profile's template is already offered to the whole team"
- plain `bio-plane/src/filing-templates/index.mjs:971` "an administrator makes a template team-wide"
- plain `bio-plane/src/filing-templates/index.mjs:980` "an owner of the template's project approves it"
- plain `bio-plane/src/filing-templates/index.mjs:984` "you are the version's author and its only member contributor: another member approves it"
- plain `bio-plane/src/filing-templates/index.mjs:994` "a review requesting changes stands"
- plain `bio-plane/src/filing-templates/index.mjs:995` "a Tier 1 kind needs one member's review with no concerns"
- plain `bio-plane/src/filing-templates/index.mjs:1034` "a profile's template is read-only here"
- plain `bio-plane/src/filing-templates/index.mjs:1035` "an administrator retires a team-wide template"
- plain `bio-plane/src/filing-templates/index.mjs:1035` "an owner of the template's project retires it"
- plain `bio-plane/src/filing-templates/index.mjs:1038` "the template was already retired"
- plain `bio-plane/src/filing-templates/index.mjs:1051` "a version is withdrawn by its author"
- plain `bio-plane/src/filing-templates/index.mjs:1058` "the version was already withdrawn"
- plain `bio-plane/src/filing-templates/index.mjs:1092` "a comment names who wrote it: this call carries nobody"
- plain `bio-plane/src/filing-templates/index.mjs:1096` "a note is added by a member who may revise the template"
- plain `bio-plane/src/filing-templates/index.mjs:1223` "runs joined by single hyphens"
- plain `bio-plane/src/filing-templates/index.mjs:1236` "chosen: name the template by its id"
- plain `bio-plane/src/filing-templates/index.mjs:1250` "a template is named by its id or by its name, not both"
- plain `bio-plane/src/filing-templates/index.mjs:1251` "no template is named: give its id, or @ and its name"
- plain `bio-plane/src/filing-templates/index.mjs:1272` "no such version of this template"
- plain `bio-plane/src/filing-templates/index.mjs:1272` "the template has no approved version"

## Test copies of code sentences (K3962)

2 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/filing-templates/t46-words.test.mjs:32` "\"This kind is filed with a court, so no template the team files in i...\""
- testcopy `bio-plane/test/m/filing-templates/t46-words.test.mjs:33` "\"a licensed professional can certify one. A template that is the bas...\""
