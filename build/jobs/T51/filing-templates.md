# filing-templates (T51)

**Status** · session_01KaymbcDym8ajLSiHBqjDGC · depth 2 · WAITING ON BOB (J4) · handled B2

## J1 · QUESTION

Two readings I built on, neither blocks (my best reading is applied; tell me only if it is wrong):

1. R35 `lacks` vocabulary. R35 and filings R65 name `second_approval`; R15's refusal (pinned by offer.test.mjs, answered to members today) names the same part `approver`. I left R15's `lacks` as it is and made `unofferedFor` answer `second_approval` for it. If you want R15's refusal to say `second_approval` too, that is a R15 amendment.
2. R34 `label`: "the template's kind of draft". I answer the kind's `label` from the first profile (the template's own, or the active view's for a general one) that holds the kind, else the kind itself.
Also: `templatebyhandle` is in `filingTemplatesOps` (control-plane R111 and plane R66 route it through the owner's map). affordances' test "the op maps of filing-templates and local-facts hold exactly their ops" was already red at the START and stays red; its job (L11) declares the op.

## J2 · COMPLETE

T51-163 (filing-templates) applied on `job/T51/filing-templates` at `ed5a28ffac`, pushed. No PR opened (JOB step 1). Merged `tranche/T51` before starting (up to date at the START).

Entries applied:
- R34 `templateByHandle({name, project?, version?, viewer})` (`op=templatebyhandle`): resolves through `offeredVersion` (R26, R25), answers `{template, version, sha, name, origin, default, text, blanks, label}`; every refusal is R26's/R25's, with no `text`; no secret is read, so no grant's door reaches it. Also in `filingTemplatesOps` as `templatebyhandle` (control-plane R111, plane R66 route through the owner's map); op-declarations (T51-107) and control-plane (T51-123) are theirs.
- R35 `unofferedFor({kind, viewer})`: `[{handle, name, lacks}]` of the kind's visible profile templates R15 does not offer for want of attribution; `[]` for a court kind (R28), an unknown kind, no view or no member.
- Words (K3949, K3957, K3962, K3964): all 52 findings fixed. `localize('filing-templates.index.<slug>', en)` for the refusal `detail` sentences (including the ones the check does not count: `from` refusals, `tier N`, `of a retired template`, the notes and unknown-blank details); rows read by key where a words.json row exists (`counterparty_organisation`, `TEMPLATE_BLANK_UNKNOWN`, `NO_REVIEWERS`, `TEMPLATE_KIND_REFUSED`, `GRANT_RECIPIENT_REFUSED`, `TEMPLATE_NOT_REVIEWED` with `{missing}` left for the screen). `blankUnknownRefusal`'s third argument is now a flag (`notOffered`), not a sentence fragment; `filings` calls it with two arguments.
- Tests: new `r34.test.mjs` (R34, R35, each refusal with a control). Test copies replaced by `word`/`localize` equality (invariants, t46-words, r30, r32, draft). The ops-map hand list is a count and spot reads. t46's all-rows hash now pins each row's check and where only (translations are read by key).

Readings (QUESTION J1 above): R35 `second_approval` for R15's `approver`; R34 `label` = the kind's label.

Changed text, by the list winning (K3930): the `counterparty_organisation` blank, TEMPLATE_BLANK_UNKNOWN, TEMPLATE_KIND_REFUSED and GRANT_RECIPIENT_REFUSED translations now read the list's wording (US spelling; TEMPLATE_BLANK_UNKNOWN without literal braces, DEC-263). TEMPLATE_COURT_PETITION stays as R29 keeps it (`localize('filing-templates.checks.this_kind_is_filed_with', ...)`); words.json's row for it is "Civicsmith offers no templates for filing with a court. Talk to a lawyer." now, so R29's reason (bare "Civicsmith") may be stale: BOB's call.

Nothing hidden as "no member reads it" (no `unkeyed` proposal).

Deferred: none. Found in other modules: none new. Inherited reds, same set at the START and now (checked with my change stashed): filings R9, R30; action-producers R23; affordances R1 R12 R24 (the op-maps test; its job declares `templatebyhandle`), R48..R62, R62 R65, R19.

Tests and checks:
- `node --test bio-plane/test/m/filing-templates/`: tests 84, pass 84, fail 0. Users: wizard-scripts 105/105, skills 130/130.
- `checks/words.mjs /home/user/bio filing-templates`: inline 0, plain 0, testcopy 0, handlist 0; 0 failures. The 14-module joint run: no line names filing-templates.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs ... filing-templates`: 17 product files, 62 imports; 0 failures. `checks/coverage.mjs ... filing-templates`: 35 of 35 live ids named; 0 failures. `checks/ownership.mjs ... filing-templates tranche/T51 job/T51/filing-templates`: 0 failures.
- `setup-words/build.mjs --check`: the stale-rows note only (the rows hold the old ids; BOB regenerates at the layer close).
- `checks/run.mjs` whole tree: format 0, architecture 0; words and coverage failures all in other modules.

Size (session_01PbeBP85c4YmXfKoksHMFk4): test runs 8, module lines 1939

## J3 · COMPLETE

B2 applied at `8cb92802bf` (merged `tranche/T51`): C-125.34 TEMPLATE_COURT_PETITION reads `word("refusal.TEMPLATE_COURT_PETITION")`; my id `filing-templates.checks.this_kind_is_filed_with` is retired; t46's test compares with `word` and asserts the row verbatim from words.json. R35 `second_approval` and R34 `label` stand as built.

Tests and checks: filing-templates tests 84, pass 84, fail 0; words 0 failures; format 0; architecture 0 (18 files, 65 imports); coverage 35 of 35; ownership 0 failures. Everything else in J2 unchanged.

Size (session_01PbeBP85c4YmXfKoksHMFk4): test runs 10, module lines 1939

## J4 · QUESTION

STEP 0 REPORT, C64-template (template lookup for 5 U.S.C. section 552). Root cause found; it is not in filing-templates' code. I need your release, and one choice, before I write anything.

What I read: send-steps.mjs:275-290; filings/index.mjs filingPrepare (739-800) and its template lookup; filing-templates R15, R26, R34, R35; the profile `jurisdictions/profiles/oakland-alameda.mjs` (the one real profile).

1. The empty draft. filingPrepare finds a template for a request only by `action_kinds[records_request].template` in the active profile (a `file` template with an id) or by one the member names. The real profile's `records_request` row (oakland-alameda.mjs:519) carries NO template: the file header says "No template: none is approved (K921 Q1, R45)". So the lookup answers TEMPLATE_NOT_NAMED with an empty list, for the California law as much as the federal one: the federal Freedom of Information Act is only a `records_laws` row (line 426), not a profile with its own kinds or templates. The screen then draws the box empty, under the help line "Drafted from your team's template for this law ...", which is always shown. Round 3 passed because its fixture used the test profile, which does hold a records-request template.
2. filing-templates behaves as its requirements say (R15/R26/R35: a profile template is offered only with a named writer, public sources, a professional no_concerns review and a second approver; your reviews of the template texts are the hard reason in the plan, row "N858's template and procedure-guide texts"). I find no defect in this module for the empty draft.
3. The refusal "You filled in a blank the text does not have" is the other half, certain, in screens-action (send-steps.mjs:275-290 sends period, form and cost limit always) with filings (FILL_UNKNOWN_BLANK). Neither is this module's.

Options:
A (recommended). No template is written. I change nothing in filing-templates for the empty draft. The cure is in screens-action (the seam owner): when no template is offered, say so in words (not "Drafted from your team's template"), let a typed plain request prepare, and send period, form and cost limit only where the text names those blanks. Then the walker's (A)(ii) holds with no template at all. In my module I would add the failing-first test at my interface on the real profile's shape: a kind with no profile template answers no text (a stated absence, never an empty offer) and `unofferedFor` / `templateByHandle` answer `NO_SUCH_TEMPLATE` for it, so screens-action has a real fixture of that case. No requirement changes.
B. A federal (and California) records-request template text. That needs a named writer, sources and a professional review, then your approval as R15's reviewer. I cannot supply those; the plan holds this as yours.
C. Both: A now, B whenever you have the texts.

Please release the fix step with A (or tell me otherwise). I will wait.
