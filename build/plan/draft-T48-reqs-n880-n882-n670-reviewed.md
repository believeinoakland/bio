**Status** · Read-only review for BOB (2026-10-14) of `build/plan/draft-T48-reqs-n880-n882-n670.md`, on `tranche/T47` @ c0d3e13418. Read whole: the draft; the requirements of `filing-templates`, `filings`, `action-replies`, `case-inputs`, `following`, `run-rules`, `skills`, `agent-worker`, `plane`, `instance-setup` (every id line; R64–R88 region in full); `rulings-active.md`. Read in the parts the lines touch: `op-declarations` (R34, R61–R63), `op-grades` (R1, R30, R33–R37), `control-plane` (R57, R66), `affordances` (R48–R56), `events` (R22, R27, R34, R38), `actions` (R10, R30, R65), `action-clocks` (R1–R18), `hypotheses` (R11–R14), `network-notices` (R22), `screens-investigate` (R6), `case-authoring` (R34), `action-grammar` (R2, R6); `next.md` N880, N882, N1051 (N670 has no line in `next.md`: its text is `archive/next-T35.md`:66 and N1051 carries it); K2744, K2745, K2748, K2749, K2953, K3183, K3189; H13–H19 on `origin/design/actions`; DEC-127; `draft-T48-plan.md` and `draft-T48-fold.md` (entry numbers); `modules.json` (order); the code at the sites named. Nothing in `/home/user/bio` was changed.

# T48 requirements for N880, N882, N670: corrected, ready to fold

**Verdict.** The draft's shape is right and its §0 (most of N880 and N882 met in T45) holds. It cannot be folded as written: its plan numbers collide with the fold's T48-42…T48-66; it re-opens `rfc.quoting`, which K2953 kept off `words.json`; it mints a second code for one condition (K231); it misses the five new ops' declarations, grades and routes; it treats notes as shareable (they never are, `hypotheses` R14); it puts check rows in `plane`, which holds none; and it adds a new follow op where the design already drew "Follow its register" on the proceeding screen. Every correction is listed in §5.

**Ids.** Each id below is the module's next free id on `tranche/T47` (retired ids counted). The N1026–N1047 fold and N847 have written no requirement lines yet. Whichever fold writes first into `filings`, `instance-setup`, `op-declarations`, `op-grades`, `plane` or `control-plane` takes the next ids, and the later fold renumbers by the count taken. That is allowed before Bob's approval (README rule 6).

**Module positions** (`modules.json`, 1-based): case-inputs 114 (L8); actions 122, action-clocks 124, action-replies 125, filing-templates 126, filings 127 (L9); following 132 (L10); run-rules 82, skills 88, agent-worker 94 (L6); op-grades 136, instance-setup 146, op-declarations 147, screens-investigate 160, control-plane 163, plane 164 (L11). The draft's numbers are one lower throughout.

Every new or amended line ends *(not yet met: T48)*.

## 1. N880 (Actions D13, H17)

**What is left.**
- The template half of "the rule stated in every request-for-comment text".
- One site for the rule's check.
- A reply that "says otherwise", recorded and shown once at signing.

### filing-templates (L9)

- **R33** (T48; N880; Actions D13, H17; v0.2 rule 8; K231, K922 (1), K2953; amends R10, R15, R23) **The quoting sentence and its one check.**
  - This module holds `RFC_QUOTING_SENTENCE`. The sentence moves here from `filings` unchanged: "Your reply may be quoted unless it says otherwise." (`filings`' `KEYED["rfc.quoting"]`).
  - It is not read from `words.json`. K2953 and `filings` R52 keep `words.json`'s re-wording returned to the design stream, because a new wording would refuse every request already prepared.
  - `rfcQuotingRefusal(text, extra)` answers C-115.47 `RFC_QUOTING_MISSING` with its row, extra fields merged, when `text` does not hold the sentence. Otherwise it answers null. Pure.
  - The row moves here from `filings` with its code, number and translation unchanged. The translation is read by key from `refusal.RFC_QUOTING_MISSING` (`filings` R51). Its `where` names this one site (R23's table), as R32 does for C-125.4.
  - `templateApprove` (R10) refuses through it, after `REVIEWS_INSUFFICIENT`, a version whose `use` is `file`, whose kind is `request_for_comment` (`action-grammar`'s `PRODUCT_KINDS`) and whose text lacks the sentence. Nothing is written.
  - A profile template of that kind and use that lacks the sentence is not offered and reads the same code (R15's form).
  - Controls: the same version with the sentence is approved. A `brief` template, and a template of another kind, is never asked.

### filings (L9)

- **R57** (T48; N880; amends R40, R51, R52; `filing-templates` R33) R40's check is `filing-templates.rfcQuotingRefusal`, asked at R6 on the approved text of every text R40 and R37 name.
  - The sentence that preparation adds is `filing-templates`' `RFC_QUOTING_SENTENCE`.
  - This module no longer holds the sentence or C-115.47's row. Both are `filing-templates`' (its R33). R52's `rfc.quoting` clause now reads "held by `filing-templates`".
  - The refusal's code, number, translation and order are unchanged.
  - Control: an approved text holding the sentence passes; one without it is refused with the provider's row, equal field for field.
- **R58** (T48; N882; Actions D9, D15, H13, H19; v0.2 rule 13) A filing prepared at governing tier 2 (R1, R2) also answers `offers: ["counsel_packet"]`, beside `advisory` (R4).
  - The offer is R8's packet: offered, never required, and no act refuses for it.
  - A Tier 1 filing answers no `offers`.
  - No answer of this module says whether the group should take an action, becoming a party included.
  - Control: a Tier 1 draft answers no `offers`.

### action-replies (L9)

- **R10** (T48; N880; Actions D13, H17; v0.2 rule 8, "unless the reply itself says otherwise") `actionReplyQuoting({target, ord, quotable, words?, author, viewer})` (`op=actionreplyquoting`). For a `received` entry of a `request_for_comment`, a member records one of two things:
  - that the reply says it may not be quoted (`quotable: false`), with the reply's own `words` that say so (1–500 characters, one line);
  - or that such a record is withdrawn (`quotable: true`).

  Refusals, in order, each writing nothing:
  - `MACHINE_CANNOT_RECORD_QUOTING` (an empty or machine author);
  - `NO_TARGET`;
  - `NO_SUCH_BUNDLE` (absent and unseen alike, through `actions.actionRead`);
  - `NOT_AN_ACTION`;
  - `QUOTING_NOT_RFC` (another kind, or an entry that is not `received`);
  - `QUOTING_REFUSED` (a `quotable` that is not a boolean, `words` missing with `false`, or malformed `words`).

  Records are appended and the latest stands. `bearingsOf` (R1) also answers, per entry, `quotable` (`true` with nothing recorded) with its words, who recorded it and when.
  - It refuses no act of any module and enters nothing published: a declaration (DEC-13).
  - The rows are C-150's next three, BOB's draft translations in DEC-83's form, with their words an ASK to UX-DESIGN.
  - Controls: `quotable: false` on a received reply lands; the same on a `sent` entry is refused `QUOTING_NOT_RFC`.
- **R11** (T48; N880; amends R3, R8) Each open-request row also answers `quotable`: `false` when R10's latest record on any received reply of the request says so, else `true`. Control: a request whose reply asks not to be quoted answers `false`; one with no record answers `true`.

### case-inputs (L8)

- **R18** (T48; N880; Actions D13; amends R8, R10, R17) A source row may answer `quotable`.
  - A value that is not a boolean makes the row malformed, so R8 reads the source `undetermined`.
  - For a row answering `quotable: false`, `openRequestLine` (R10, R17) also answers `quoting: {key: "signing.openrequest.noquote", says}`, filled with `{whom}`. The words are read by key from `words.json` once the design stream gives the key (an ASK). Until then they are BOB's plain sentence, "{whom}'s reply asks not to be quoted.", with `key: null`, as `case-authoring` R34 kept its sentences until given.
  - The line is shown once, with its row's line. It asks no reason and refuses nothing.
  - `case-authoring` R34 carries it unchanged: it spreads `openRequestLine`'s answer into each line, so `case-authoring` needs no job.
  - Control: a row answering `quotable: true`, or not answering it, carries no `quoting`.

**Uses.** None new. `filings` already uses `filing-templates`. `filing-templates` already uses `action-grammar`. `action-replies` already uses `case-inputs`.

**Merge order.** `case-inputs` merges in L8, before `action-replies` (L9) by layer; its tests stub the source. In L9, `filing-templates` merges before `filings`.

## 2. N882 (Actions D15, H19)

**What is left.**
- The counsel packet offered at Tier 2.
- The proceeding followed with its own dates (U5).

The design already offers "Follow its register" (`followregister`) on the proceeding screen (`screens-investigate` R6; `proceeding.mjs`:98). That follow does not yet name the proceeding. So `events` R38's register import ("only for a proceeding a member follows") is never called. The fix is a field on the drawn act, not a new op.

### filings (L9): R58, §1.

### following (L10)

- **R29** (T48; N882; Actions D15, H19; v0.2 rule 17; U5; amends R7, R13, R14) `followRegister` (R7) also takes `proceeding`, an entity of kind `proceeding` the author may see.
  - Refusals, after R7's and before R22's `WATCH_END_REFUSED`, each writing nothing:
    - absent or unseen: `NO_SUCH_ENTITY` (one answer, through `entities.noSuchEntity`);
    - an entity of another kind: `NOT_A_PROCEEDING` (the row `actions` R65 refuses with, held in `action-grammar`'s table, read by key).
  - Each read of such a follow hands its newest capture to `events.followedRegister({captureSha, proceeding, by})` (`events` R38). A read here is a tick (R7, R13), or `refreshRegister` for an account-gated or fee-bearing register (R8). `events` writes each register entry once, as a `filing` or `order` event concerning the proceeding.
  - A refusal `events` answers (`CAPTURE_NOT_HELD`, `NOT_A_REGISTER`) is counted in R13's `failed` with its reason. The follow stays due.
  - `follows` (R14) answers `proceeding` per follow, or null.
  - A follow without `proceeding` is unchanged.
  - Controls: a follow naming a proceeding hands each read's capture, and the events written concern that proceeding. The same follow without `proceeding` hands nothing.
- **R30** (T48; N882; Actions D15, H19; v0.2 rules 6, 17; U5) `proceedingDates({proceeding, from?, to?, viewer})` (`op=proceedingdates`; a read) answers two lanes, never interleaved:
  - **`proceeding`**: the proceeding's own events, as `events.eventsFor({entity: proceeding})` answers them to the viewer (hearings, filings, orders, comment windows), past and future. Each has its `when` as held (with its precision, or undetermined with its bounds), its kind, its label and the captures it rests on. The lane also gives today's stage as `events.proceedingStatusAt` answers it (or undetermined, with why).
  - **`group`**: the group's own deadlines on it. These are the entries `action-clocks.ourDeadlines` answers (its R18: `owed_by: group`, pending) whose action is among `actions.actionsFor({proceeding})` (its R30, R65), each with its date, basis and action. A body's deadlines are never in this lane.

  Other terms:
  - Each lane holds at most 500 items, with `truncated` (`events` R27's bound).
  - It answers no finding, states no lateness and writes nothing.
  - An absent or unseen proceeding answers as R29 refuses.
  - Control: an action linked to another proceeding adds nothing to `group`.

### screens-investigate (L11)

- **R15** (T48; N882; amends R6) On the proceeding screen, "Follow its register" (`followregister`) sends `proceeding`, the screen's own entity id. The screen's register list shows only the follows answering that proceeding. No word changes. Control: a register followed from another proceeding's screen is not listed here.

**Uses.** `following` gains `actions` (122), `action-clocks` (124) and `action-grammar` (120), all earlier. `entities` and `events` are already uses. `screens-investigate` needs none.

**Merge order.** L10 opens in T48 with `following` alone. `screens-investigate` merges in L11 after `following`'s layer.

## 3. N670 (DEC-127 (3), (6))

### The reading half: joins T48 whatever Bob answers on the offering half

- Nothing is held: each reading is answered and never stored, as R21's drafts are. A note's earlier text is "kept nowhere" (`hypotheses` R11, R14).
- The reading runs on the asking member's own account (K1502), through the plane's draft door.
- The subjects are notes, questions, findings and notices.
- The control and its labels ("Machine translation · original in …", the one tap back) are not in `words.json` or on PR #34. They are an ASK to UX-DESIGN. The draft's claim that they are already met by `interfaceWords` is withdrawn.

#### run-rules (L6)

- **R33** (T48; N670; DEC-127 (3); amends R22, R27) `DRAFT_KINDS` gains `reading`, after `statusreport`: the assistant's translation, for one member, of a passage of the group's own writing into her language.
  - In every other respect it is R21's mode: interactive; no run and no run row; read-only; R17's `ASK_BOUNDS`; started only at the asking member's own act (R18).
  - It deploys under `draft`'s own flag (`draftKindDeployed` is `true` exactly when that flag is). `action_drafts` plays no part.
  - Its test-bar part is `draft:reading` (`TEST_BAR_PARTS` follows `DRAFT_KINDS`).
  - Its reach (`DRAFT_REACH`) is `none`: only the passage the door hands in. So `draftMayRead` is `false` for it, whatever the rest.
  - Pure.
  - Control: `draftMayRead({kind: "reading", suggestions: true})` is `false`.

#### skills (L6)

- **R49** (T48; N670; DEC-127 (3), (4); DEC-157 (6)) The `reading_translation` layer, in `disclosed` after `action_drafting` (R45, R48):
  - `sourcing` `authored`.
  - `load_when`: "a member asks to read a note, question, finding or notice in her language".
  - The body holds the clauses R21's normaliser finds in DEC-127 (3), (4), DEC-157 and `BIO_Interaction_Constructs_v0_1.md` §L: the translation is labelled machine work, with the original one tap away; it never replaces the original; a member's own words stay hers; signed and published records stay in the language they were signed in; official local names stay as they are. A clause the job does not find is reported, never authored (R43, K921).
  - The task's description is this module's own words, not a clause (R48's form): translate the passage whole, adding and summarising nothing, and leave quotations, figures, dates, ids and citations as they stand.
  - `acts`: `readtranslate`, read from `published.catalog` by id (R23). Until it is declared, the layer is R9's stated absence.
  - No text carries control-flow authority (R16, R24).

#### agent-worker (L6)

- **R86** (T48; N670; `run-rules` R33; `skills` R49) `POST /draft` takes `task` `{op: "readtranslate", language, text, from_language?}`, sent by the plane's draft door.
  - `language` and `from_language` are BCP 47 tags (`instance-setup` R64's form). `text` is 1 to 20,000 characters.
  - It takes `account` and `pack` as R68 does, and never a `grant` (`DRAFT_READ_NOT_ALLOWED`).
  - Refusals come before any model call, in R68's order and codes (`BAD_TASK` for a malformed task).
  - It is instructed by `skills`' `reading_translation` layer alone. With that layer a stated absence it answers 502 `PACK_UNDETERMINED` and calls no model.
  - It is offered no tool. `text` reaches the model only in the user turn, as data (R61). R62's fixtures apply: a passage carrying an instruction is translated as words, and no plane call follows.
  - It answers `{ok: true, task, draft: {text, language, from_language}, label: {kind: "machine"}, usage, calls}`. `from_language` is as given, else as the model states it, else null.
  - It stores nothing and makes no plane call. R79's `untested` applies to it as to every task.

#### instance-setup (L11)

- **R87** (T48; N670; DEC-127 (1), (3)) `readingLanguage({member, language?})` (in-process, for the plane's door) answers the language to read in:
  - `language` when it is well formed by R64's rule, else `LANGUAGE_MALFORMED`;
  - without it, the member's own language (R64);
  - with none set, `LANGUAGE_NOT_SET` (C-64 next free; BOB's draft translation; words an ASK).

  It writes nothing and never throws.

#### plane (L11)

- **R50** (T48; N670; DEC-127 (3); amends R40, R41) The draft door takes `readtranslate`, `{subject: {kind, id, project?}, language?}`, where `kind` is one of `note`, `question`, `finding`, `notice`.
  1. It is gated by R40: `draft`'s flag, then `ai-runs.partAdmitted("draft:reading")`.
  2. It then reads the subject only as the asking member may:
     - a note through `hypotheses.notesOf` for her (her own only: notes are never shared, `hypotheses` R12, R14);
     - a question's or finding's text through `inquiry` for her;
     - a notice's wording through `network-notices.noticesOf({project})` for her.

     An absent or unseen subject answers its owner's own refusal for an absent object, passed through as given (`NO_SUCH_NOTE`; `inquiry`'s `NO_SUCH_BUNDLE`; `network-notices`' `noSuchProject`), before any account is read. This module mints no row.
  3. The language comes from `instance-setup.readingLanguage` (its R87), whose refusals pass through.
  4. A passage over 20,000 characters is refused before any account is read, with the owner's text shown. This is a protective limit (K1881).
  5. Next comes the keep-away read for the subject's project, when it has one (`ai-accounts`' `aiKeptAway`, its R7), then `answers.askAccount({member, kind: "draft"})` (R33). Each refusal is answered as given, nothing posted.
  6. It mints no grant and sends no `told`.

  It answers `{translation, language, from_language, label: {kind: "machine"}, original: {kind, id, text}}`, with `untested` as R40 states.
  - It writes nothing, and counts only the usage, to her day (`ai-runs` `countAskUsage`, mode `draft`).
  - Controls: another member's note answers `NO_SUCH_NOTE`, the same as an absent one; her own note is translated.

#### op-declarations, op-grades, control-plane (L11): §4.

**Uses.** None new. `plane` already uses `hypotheses`, `inquiry`, `network-notices`, `instance-setup`, `agent-worker`, `ai-runs`, `answers` and `run-rules`. `ai-accounts` reaches it through T48-40's re-point.

### The offering half (DEC-127 (6)): only if Bob answers A or B (§6, point 1)

- **R88** (T48; N670; DEC-127 (6); amends R75) `translationOffer({language, by})` (`op=translationoffer`). An administrator exports the group's `shown` translation of `language` as one canonical document, marked as an offer to Civicsmith's library. It answers the bytes and their SHA-256, labelled with the group's slug (`producingGroup`, R1).
  - Per word it holds the key, the English it translated, the text, the protected mark, and whether a protected word was confirmed. It holds no member id, handle or name, and no draft or mark.
  - Refusals, each writing nothing: `MACHINE_CANNOT_TRANSLATE`; `NOT_AN_ADMIN` (`membership` R84); `LANGUAGE_MALFORMED`; `TRANSLATION_NOTHING_SHOWN` (C-64 next free).
  - Each export is recorded with who, when, the language and the digest, append-only, in R75's tables.
  - The instance transmits nothing: the administrator carries the file to where Bob names. R75's "no translation … leaves the group's Civicsmith" now reads "except by R88's export, carried by an administrator's own hand".
  - If Bob rules on a licence statement (§6, point 2), the document carries it.
  - Control: the same language exported twice gives the same digest.

With C, or with no answer by instance-setup's START, R88 is left out, with hard reason "Bob's: DEC-127 (6)'s channel".

**P6.** `instance-setup` is about 3,819 lines on `tranche/T47`. T48-33 already carries N1047's update check, notice store and decision act (K3189). R87 and R88 add about 130. Its START measures this. Past about 4,000, BOB splits the translation workspace (R67–R75, R87, R88) into its own module directly after `instance-setup`.

## 4. Declarations, grades and routes for the new ops (L11)

- **op-declarations R64** (T48; N880, N882, N670; R2–R4's rules, R34) `OPS` gains these specs, each in `SESSION_OPS.member` (and `.admin` where named), none in `GOVERNANCE_ACTIONS` or `IDENTITY_ACTIONS`, none on `AI_GRANT_OPS`:
  - `actionreplyquoting`: `action-replies`' family; mutating; `author` and `viewer` stamped; body `target`, `ord`, `quotable`, `words`; `machineClasses: []`.
  - `proceedingdates`: `following`'s family; a read; `viewer` stamped; query `proceeding`, `from`, `to`.
  - `readtranslate`: the draft door; a member's session only (`machineClasses: []`); `by` and `viewer` stamped; body `{subject, language?}`; it names no project.
  - Only on Bob's A or B: `translationoffer`, in `instance-setup`'s family; `.admin`; mutating; `by` stamped; body `language`.
  - `followregister`'s spec gains the body field `proceeding`.

  `ACT_HELP_ABSENT` (R34) names each new op not yet explained ("an op the design has not yet explained"). BOB carries the list to UX-DESIGN in one QUESTION. Each is tested with a negative control.
- **op-grades R38** (T48; R33's pattern) Each op graded by R5 and R3, with `affordances` R12's totality holding, each tested by name with a negative control (K874):
  - `actionreplyquoting`: `reversible` (a later record takes it back; it asks no reason). `MACHINE_REFUSALS` gains it with `MACHINE_CANNOT_RECORD_QUOTING`.
  - `proceedingdates`: a read, `NON_ACTS` "read: …".
  - `readtranslate`: writes nothing, so it takes no rung; `NON_ACTS` "draft: …"; `phone` `true`.
  - `translationoffer` (only on A or B): `RUNG_ABSENT`, ground `undetermined`, as `guideproposetocivicsmith`.

  `IRREVERSIBLE_WEIGHT` gains none.
- **control-plane R90** (T48; R66's and R57's T46 patterns) The door routes these, each with the stamps `op-declarations` R64 declares and none taken from the caller (R29), each refused to any caller not arriving by a member's session:
  - `actionreplyquoting` through `action-replies`' map;
  - `proceedingdates` through `following`'s map;
  - `translationoffer` through `instance-setup`'s own map (only on A or B);
  - `readtranslate` to the plane's draft door (`draftOnObject`, `plane` R50), as `textcheck` is routed: no `told`, no grant, no `firsthand`, no `checkDraft`, nothing recorded.

## 5. Plan entries (one line each)

New entries take T48-67 onward, since the fold's T48-42…T48-66 are taken. Joins name the existing entry.

- **T48-67 · run-rules** · (N670; DEC-127 (3)) R33 the draft kind `reading` (`draft:reading`) · L6, before skills and agent-worker.
- **T48-18 · skills** gains (N670) R49 the `reading_translation` layer.
- **T48-21 · agent-worker** gains (N670) R86 `readtranslate` on `/draft`.
- **T48-68 · case-inputs** · (N880; Actions D13) R18 `quotable` and the no-quotation line; key `signing.openrequest.noquote` asked of UX-DESIGN (an ASK; BOB's plain sentence until given) · L8.
- **T48-69 · action-replies** · (N880; Actions D13, H17) R10 `actionreplyquoting` (C-150 next three), R11 the row's `quotable` · L9.
- **T48-70 · filing-templates** · (N880; Actions D13, H17; K231) R33 `RFC_QUOTING_SENTENCE` and `rfcQuotingRefusal`, C-115.47's row moved here, `templateApprove` and profile templates refused through it · L9, before filings.
- **T48-55 · filings** gains (N880) R57 (R40 through `filing-templates` R33; the sentence and C-115.47's row leave this module) and (N882; Actions D15) R58 `offers: ["counsel_packet"]` at Tier 2 · after T48-70.
- **T48-71 · following** · (N882; Actions D15, H19; U5) R29 `followregister` takes `proceeding` and hands its captures to `events.followedRegister`, R30 `proceedingdates`; `uses` gains `actions`, `action-clocks` and `action-grammar` · L10 (its only job).
- **T48-63 · screens-investigate** gains (N882) R15: the proceeding screen's "Follow its register" sends `proceeding` and lists that proceeding's follows.
- **T48-33 · instance-setup** gains (N670) R87 `readingLanguage`; on Bob's A or B, R88 `translationoffer` with R75 amended.
- **T48-34 · op-declarations** gains (N880, N882, N670) R64: the new ops' specs and `followregister`'s `proceeding`, with `ACT_HELP_ABSENT`.
- **T48-57 · op-grades** gains (N880, N882, N670) R38 their grades.
- **T48-39 · control-plane** gains (N880, N882, N670) R90 their routes, `readtranslate` to the draft door.
- **T48-40 · plane** gains (N670; DEC-127 (3)) R50 the `readtranslate` door · after T48-39, as now.

**Merge orders, as amended.**
- L6: inquiry, basis-versions, **run-rules**, ai-use, ai-runs, run-productions, skills, question-explorer, answers, agent-worker.
- L8: case-grammar, publication, public-read, case-checker, case-import, **case-inputs**, review.
- L9: action-records (first, doubt 5), conformance, action-grammar, actions, **action-replies**, **filing-templates**, filings, action-plans.
- L10: **following**.
- L11: unchanged apart from T48-63 now carrying R15 (it still merges after interface-assets).

**Rows.** These wait for T49's stamp, accepted red by name (rule 5 (2)):
- C-115.47 moved to `filing-templates`;
- action-replies' three new C-150 rows;
- instance-setup's `LANGUAGE_NOT_SET`, and `TRANSLATION_NOTHING_SHOWN` on A or B.

**ASKs to UX-DESIGN, in one channel act at the opening.** None is a hard reason:
- `signing.openrequest.noquote`;
- the "read in my language" control, its label and the one tap back;
- `refusal.LANGUAGE_NOT_SET`;
- the three action-replies refusals;
- help text for `actionreplyquoting`, `proceedingdates` and `readtranslate` (and `translationoffer`);
- a "dates" lane on the proceeding screen, if the design wants one.

**Count.** 18 R lines, 17 without R88:

| Entry | Lines | Count |
|---|---|---|
| N880 | filing-templates R33; filings R57; action-replies R10, R11; case-inputs R18 | 5 |
| N882 | filings R58; following R29, R30; screens-investigate R15 | 4 |
| N670 | run-rules R33; skills R49; agent-worker R86; instance-setup R87 (R88); plane R50 | 5 (6) |
| Shared | op-declarations R64; op-grades R38; control-plane R90 | 3 |

Five new plan entries (T48-67…T48-71); nine joins.

## 6. Corrections made, and why

1. **Plan numbers.** The draft's T48-42…T48-51 collide with the fold's T48-42…T48-66 (signatures, bundler, events, filings, op-grades, …). The new entries are now T48-67…T48-71. `filings` joins the fold's T48-55 and `op-grades` its T48-57; one job per module.
2. **`rfc.quoting` from `words.json` (filing-templates R33).** The draft read the sentence from `words.json`'s `rfc.quoting`. K2953 and `filings` R52 refused exactly that: `words.json` says "Your reply may be quoted, unless you say otherwise in it.", while the code holds "Your reply may be quoted unless it says otherwise.", and switching would refuse every request already prepared. The sentence now moves unchanged to `filing-templates`, the earlier module, as K922 (1) moved `FILING_BLANKS`.
3. **One code, one condition, one site (K231).** The draft minted `TEMPLATE_RFC_QUOTING_MISSING` beside `RFC_QUOTING_MISSING` for the same condition. Its translation, "Add that sentence before approving", is true at both acts. C-115.47's row now moves to `filing-templates` with its number, minted by `rfcQuotingRefusal`, as K3124 did for C-125.4. This drops the draft's new C-125 row.
4. **Row family.** action-replies' rows are C-150 (C-150.1–.7 in code), not "C-117 next". The draft also reused `BEARING_NOT_RFC`, whose sentence speaks of laying out claims and would mislead. A new `QUOTING_NOT_RFC` replaces it. `QUOTING_REFUSED` now also covers `words` missing with `false`.
5. **case-inputs merge order.** The draft merged action-replies "before" case-inputs. case-inputs is L8 and merges in L8, its tests stubbing the source. The draft's "missing key → row not yet met" is replaced by `case-authoring` R34's own precedent: BOB's plain sentence until the key is given. The note that `case-authoring` carries `quoting` with no job of its own was added (its `#openRequestsStep` spreads the line).
6. **Following a proceeding.** The draft added `followProceeding` and a register-less follow. The design already drew `followregister` "Follow its register" on the proceeding screen (`screens-investigate` R6; `proceeding.mjs`:98). The correction amends R7 with `proceeding` and adds `screens-investigate` R15, so no new op or design drawing is needed. The register-less follow read nothing and is dropped; the proceeding's dates are R30's read either way. Two further additions:
   - `events.followedRegister` needs a capture read as a court register, so its refusals are counted in `failed`.
   - `NOT_A_PROCEEDING`'s row is `action-grammar`'s (code), so `following` reads it by key through a new earlier edge.
7. **R30's group lane.** The draft listed "each pending clock entry … with `owed_by`" but cited `ourDeadlines`, which answers only `owed_by: group`. The lane is now exactly `ourDeadlines` filtered to the proceeding's actions. A body's deadlines stay out, as H19 says.
8. **Notes are never shared.** The draft's "her own, or shared with her" contradicts `hypotheses` R14 ("never … shared"; R12 answers only the keeper). Only her own note is read.
9. **"Notices" means DEC-111's.** In DEC-127 (3), "notices" is the group's 'working on' notice: brand-and-voice cites DEC-111 for "notices", and a queue item holds no member-written text, since its words are interface words. These are read through `network-notices.noticesOf`. This is BOB's reading of canon; if UX-DESIGN meant otherwise, the ASK will say so.
10. **`plane` mints no row.** The plane's Purpose says it holds "no check row". The draft's `NO_SUCH_SUBJECT` and `LANGUAGE_NOT_SET` at the plane are replaced:
    - an unseen subject answers its owner's own refusal (K231);
    - the language comes from `instance-setup` R87 (`readingLanguage`, with `LANGUAGE_NOT_SET` there).

    Because the offer moves to R88, `translationOffer` is now R88, not R87.
11. **Gate and keep-away.** "Gated by R40 under `reading`'s flag" names a flag that does not exist. `reading` deploys under `draft`'s flag with part `draft:reading` (`run-rules` R27's `statusreport` precedent). The keep-away read for the subject's project was added. `ai-accounts` is cited directly: T48-3 merges in L2, long before L11.
12. **Labels already met.** The draft said the labels were met by `interfaceWords`. They are not: no "Machine translation" key is in `words.json` or on PR #34. They are now an ASK. The `untested` label (`agent-worker` R79) was added to R86. The agent's `label` and the plane's `label` now share one shape.
13. **skills R49's placement and clauses.**
    - "After `interface_translation`" collides with R45's `action_drafting`; it now follows `action_drafting`.
    - "Adding, summarising or softening nothing" and "leave quotations, figures, dates …" are not canon sentences, so R21 and R43 forbid authoring them as clauses. They become the task's description (R48's form).
    - The clauses kept are the ones canon states (DEC-127 (3), (4), DEC-157's local names).
14. **Missing declarations, grades and routes.** The draft declared only `readtranslate`. `actionreplyquoting` and `proceedingdates` (and `translationoffer`) need specs, grades and routes. control-plane routes `instance-setup`'s translation ops explicitly (R66), and draft ops to the draft door (R57's `textcheck` clause), so `control-plane` R90 is required. The draft also sent `ACT_HELP` to `affordances` "or names it as lacking". That rule is `op-declarations` R34's `ACT_HELP_ABSENT`, so `affordances` needs no job.
15. **The offer is conditional on Bob.** The draft built R87 (now R88) unconditionally. Bob's offering half is open, and with C the export would be built for nothing. R88 now joins only on A or B. The handoff's own wording of A ("the stewards review and ship accepted ones") differed from the draft's "Civicsmith's maintainers"; §7 states it once.
16. **`filings` R58 scope.** Rule 13 names the counsel packet offered for formal party participation. The product cannot name the profile kind `party_participation` (R20: no jurisdiction in code). D9 makes a packet available at every tier, and an offer is never a requirement. So the offer at every Tier 2 filing stands. It is BOB's packaging, recorded at the fold, and states nothing Bob did not rule (no "you should").
17. **Positions.** Every module position in the draft was one lower than `modules.json`'s (for example, plane is 164, not 163). The ordering conclusions are unchanged and all edges point earlier.
18. **P6.** `instance-setup` also carries N1047's store and decision act (K3189), so the 4,000-line watch is tighter than the draft said.

## 7. Points that are Bob's

1. **Where a group's offered translation reaches Civicsmith, and who reviews it.**
   - DEC-127 (6); how real groups behave, and money.
   - The group's side (R88, an export an administrator carries) is BOB's. The receiving end does not exist: the stewards' service (K2819) takes abuse reports only, and no one is named to review a language Civicsmith's team does not read.

   | Option | What it means |
   |---|---|
   | (A) An address you name | The file is sent by hand to an address you name, like the stewards' contact (K2782). Your named reviewers (the stewards, or someone else you name) check it, and an accepted translation ships in a release. A language nobody on the team reads waits for a reviewer you name, for example a speaker granted in a second group. |
   | (B) A receiving service | Civicsmith runs an upload service with a review queue. It costs running and moderation. The member uploads, never the instance. |
   | (C) Not yet | Nothing is offered until a group asks; R88 is left out. |

   - *Recommend (A).* It needs no new service, keeps "the instance sends nothing", matches how reading guides are proposed (`reading-guides` R6), and can become (B) later. It waits on civicsmith.org's email, which is already with you.
2. **Permission to ship a group's translation to every group.** This is new and is legal exposure; it applies only with A or B.
   - A group's translation is its members' work. Shipping it in a release to every group needs the group's permission. No licence for Civicsmith's own words is recorded today (no `LICENSE`, no DEC).

   | Option | What it means |
   |---|---|
   | (a) | The offer states that the group gives it under the same terms as Civicsmith's own words. The administrator's act of exporting confirms the group may give it. Those terms are the licence you choose for Civicsmith. |
   | (b) | A separate contributor agreement, signed once per group. |
   | (c) | Decide later, with the first real offer. |

   - *Recommend (a), and name Civicsmith's licence at the same sitting.* It costs one sentence in the export and none of the groups' time.

Nothing else here is Bob's. These are BOB's, recorded once in `rulings.md` at the fold:
- holding no reading translation;
- what "notices" means (DEC-111's);
- the module placements and the sentence's move;
- the codes;
- the `quotable` record and its showing at signing (a fact line, no gate: H17, DEC-13);
- the proceeding field on `followregister`, and the dates read;
- the counsel-packet offer at Tier 2;
- the 20,000-character protective limit (K1881, reported).
