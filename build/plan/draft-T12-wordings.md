# T12 wordings for N308, N309, N311, N312 (a worker for BOB #61, 2026-09-29; P18)

Not folded: the requirements they change are read by T11's running legacy jobs. BOB folds them when T11 closes, with rulings: N308 by a cursor (R38 decides who may sign, so no partial answer); N311 by an entry cursor (option a); N309/N312 per the table. Corrections to the plan text: N309's "inquiry" is intent (no change needed), and `NOT_NONCOMPLIANT` is two conditions, not a conformance helper.

# T12 wordings: N308, N311, N309, N312 (drafting worker for BOB)

Read on `tranche/T11`: `build/requirements/README.md`; `build/plan/next.md` N308–N312; `build/rulings.md` K231, K238, K275, K338, K368–K370; requirements for publication, ratification, actions, monitoring, conformance, consequences, escalation, standards, membership, intent, promotion, filings; the minting sites in `bio-plane/src`; the module order in `build/modules.json`.

Every change below is wording under meaning Bob has already approved: bounds, cursors, helpers and code names. Codes are interface detail (K238), and a published bound or cursor is wording (K338). No meaning question for Bob. Two points are BOB's own to choose (marked **BOB choice**); neither is Bob's.

---

## 1. N308: publication R38 `ratifiedFindingsRestingOn`

**What the code does** (`src/publication/index.mjs` 3158). The function reads every distinct pinned roster row (case, member, pinned sha) of every ratified case edition. It then calls `textAtSha` and parses the front matter for each row. The only caller is `ratification` R5's evidence arm (`src/ratification/index.mjs` 782). That arm admits a bundle when *some* resting finding's project passes `caseAuthority`. Otherwise it refuses.

**Recommendation: a cursor, not `limit`/`truncated`.** The answer decides who may sign. If the list were cut with `truncated`, R5 would have two choices. It could admit or refuse on part of the answer, which is wrong. Or it could refuse when `truncated` is set, which is a new refusal and would change meaning. A cursor keeps R5's outcome exactly as it is today. Each call reads at most 1,000 pinned members' bytes. R5 stops at the first page with a project that admits the act. It reads to the end only when it is about to refuse. This is the pattern of R42 and R43, and of reevaluation R14's `<holder>#<ord>`.

**publication.md, R38 (replaces it):**

> - **R38** `pinnedCaseEditionsOf(id, sha)` answers the ratified case editions whose signed document pins bundle `id` at `sha`, and `caseClaimsOf(id)` the cases a finding is pinned or prepared into; both bounded and viewer-free. `ratifiedFindingsRestingOn(id, {after, limit})` → `{findings: [{case_id, finding, project}], limit, cursor}` answers the ratified findings whose published basis, read at the bytes a ratified case edition pinned, rests on `id`; it reads at most `limit` pins (a ratified case edition's member with a pinned sha, other than `id`; default 1,000, clamped to 1–1,000), in case id, member id and pinned sha order after `after`, and `cursor` is the last pin read (`<case>#<member>#<sha>`) when more follow, else null, so a page may answer no finding while `cursor` is set. Viewer-free, it writes nothing. The three are read by `ratification` R5's scope arms (K240). *(not yet met: K240)* *(not yet met: N308)*

**ratification.md, R5 (one phrase changes).** Replace "(by `publication.publishedGraphEdges`)" with:

> (by `publication.ratifiedFindingsRestingOn`, its R38, read from the start through each `cursor` to null, and no further once a resting finding's project admits the act) *(not yet met: N308)*

Notes:
- R5 does not say which project's refusal is answered when none admits. Reading every page before refusing therefore meets it as written. Today's code, which picks the first project in id order, still does.
- A pin whose bytes the store cannot read rests on nothing (the code comment, D-431). This is today's behaviour, and R38 does not state it. Stating it is optional. I left it out so that no meaning is added.
- Interface test at the bound: 1,001 pins, with the one finding that rests on `id` on the second page. The first page answers `findings: []` and a cursor. The second page answers the finding. R5 admits the act.

---

## 2. N311: actions R31 `pendingClocks`, an entry that paging cannot reach

**Recommendation: (a), an entry-level cursor `<action>#<position>`.** Option (b) does not close the defect. R3 would bound the pending clock entries per action at 500, but `limit` is the caller's and can be lower than 500. Any `limit` below an action's pending count cuts that action again. Option (b) also adds an authoring refusal on members' documents. Option (a) makes every entry reachable at any `limit`, and it retires `cut_inside`. The precedent is reevaluation R14 (`<holder>#<ord>`).

**actions.md, R31 (replaces it whole; the signature gains `after?`):**

> - **R31** `pendingClocks({before, after?, limit?, viewer})` refuses a `before` that is not a date `PENDING_CLOCKS_BAD_BEFORE` (its own row; K368), and otherwise lists every `pending` clock entry dated before `before` across visible actions: action, entry position, date, basis, text, and whether it is past at `before`; at most 500 per page, `truncated` stated. This is the read `monitoring` watches. *(not yet met: layer 10's contract, "watches the actions' clocks")* (N237, N311) A page runs in (action id, entry position) order after `after`, a previous page's `cursor` or an action id (read as after all that action's entries), reads at most 500 actions, and may end inside an action; `cursor` is the last entry answered (`<action>#<position>`) when `truncated`, else null, so every entry is reached by paging from the start through each `cursor` to null. *(not yet met: N311)*

**R3: unchanged.**

**monitoring: no change.** R44 reads the first page on every run, with `DEADLINE_RECHECK_MAX` 500 and no `after`. The entries it marks leave `pending`, so later runs reach the rest. Nothing in monitoring reads `cursor` or `cut_inside`.

Consequences for actions' job:
- `cut_inside` goes, along with its test in `test/m/actions/t11.test.mjs`.
- `cursor` is now null on a last page. Today it is the last action even when nothing follows. No caller reads it.
- Interface test at the bound: one action with 501 pending entries at `limit` 500. Page 1 is `truncated` with `cursor` `<action>#<pos of the 500th>`. Page 2 answers the 501st entry with `cursor: null`. Add the same case at `limit` 10.

---

## 3. N309 and N312: one site per shared code (K231, K275)

Module order (`modules.json`): membership 20, promotion 21, intent 46, standards 52, conformance 53, consequences 54, actions 55, filings 56, escalation 57.

### Decisions per code

| Code | Minted by today | One condition? | Decision |
|---|---|---|---|
| `NO_SUCH_STANDARD` | standards `refuseNoSuchStandard` (C-112.10); conformance `#readStandards` (C-113.9) | Yes: no standard the caller may read | **standards** provides `noSuchStandard`, new **R17**. conformance R1 calls it. C-113.9 gives way. |
| `NO_SUCH_DETERMINATION` | conformance `refuseNoSuchDetermination` (C-113.15); consequences `noSuchDetermination` (C-114.1); escalation `escalationOpen` (C-116.3) | Yes: absent or invisible determination (K275 names conformance) | **conformance** exports it as `noSuchDetermination`, new **R19**. consequences and escalation call it. C-114.1 and C-116.3 give way. |
| `DETERMINATION_SUPERSEDED` | escalation (C-116.4); actions R8 `#breachRefusal` (no code, no row) | Yes: the determination named has been superseded (K275 names conformance; N312) | **conformance** provides `determinationSuperseded`, new **R20**. escalation R1, actions R8 and consequences R1 (below) call it. C-116.4 gives way. |
| `ALREADY_SUPERSEDED` | conformance R7 (C-113.18); consequences R6/R9 `alreadySuperseded` (C-114.15) | No: a determination versus a consequence part | conformance R7's case is R20's condition: "`supersedes` names X, and X has been superseded". R7 answers through R20 as `DETERMINATION_SUPERSEDED`. C-113.18 is retired and its number not reused. consequences keeps `ALREADY_SUPERSEDED` as its own, now minted at one site. **BOB choice:** rename conformance's code to `DETERMINATION_ALREADY_SUPERSEDED` instead, parallel to standards' `STANDARD_ALREADY_SUPERSEDED` (K369). |
| `NOT_NONCOMPLIANT` | escalation R1 (C-116.5): *no* standard's outcome is noncompliant; consequences R1 (C-114.2): *the named* standard's outcome is not noncompliant, **or the determination is superseded** | No: two conditions, and consequences' arm holds a third | escalation keeps `NOT_NONCOMPLIANT`. consequences splits its arm: superseded becomes `DETERMINATION_SUPERSEDED` through conformance R20, then `CONSEQUENCE_NOT_NONCOMPLIANT` (its row C-114.2, renamed). N309's "a conformance helper" for this code does not fit: conformance does not mint it, and the two conditions differ. |
| `NOT_A_PARTICIPANT` | conformance R1 (C-113.3); consequences R1 (C-114.3); escalation R1 (C-116.6); membership R35, R36, R39 and promotion R43 (no code, no row) | No, per K275 and K171 (11): each layer-9 module answers its own translation of membership's `PROJECT_ACT_NOT_A_PARTICIPANT` | Rename in each module: `DETERMINATION_NOT_A_PARTICIPANT` (conformance), `CONSEQUENCE_NOT_A_PARTICIPANT` (consequences), `ESCALATION_NOT_A_PARTICIPANT` (escalation), each keeping its row number. membership's rowless `NOT_A_PARTICIPANT` stays (affordances' `projectleave` fact reads it). |
| `NOT_PROPOSED` | membership R6 `adminEndorse` (no code): the target member's status is not `proposed`; escalation R13 decline (C-116.30): the stage edge is not proposed | No | escalation renames to `EDGE_NOT_PROPOSED` (its row C-116.30). membership's stays. |
| `NO_SUCH_PROPOSAL` | intent `triage` (C-111.22): no open proposal answers to the key; conformance R18 (C-113.20): no comparison answers to the id in this project | No: two different objects | conformance renames to `NO_SUCH_COMPARISON` (R12 calls the object a comparison; row C-113.20). intent keeps `NO_SUCH_PROPOSAL`. |

N309 lists **inquiry** among its modules, but inquiry mints none of these codes (checked by grep). The intended module is probably **intent**, and intent needs no change. The modules that change are **standards, conformance, consequences, actions and escalation**. membership and promotion do not change.

**Residue, outside this entry (for a later plan entry).** membership's rowless `NOT_A_PARTICIPANT` still names two conditions:
- R35 and R36: no participation. promotion R43 repeats R35's condition.
- R39: "not joined", which includes an invited or leaving target.

`NOT_JOINED` is likewise minted by membership R35 and promotion R43. Neither code has a row, so the guard's arm G should not list them once the three layer-9 renames land. Check this at the jobs.

### Exact text

**standards.md: new service after R8's block, before `standardPropose` (Provides).** R5 gains the pointer shown underneath.

> **noSuchStandard(standardId, extra?) → refusal** (N309, K231, K275; a module-level function)
> - **R17** The one answer to one condition: no standard the caller may read answers to `standardId` (absent, or any id for a viewer naming no member, answered alike; R5). It answers `{ok: false, reason: "NO_SUCH_STANDARD", code: "NO_SUCH_STANDARD", check, translation, standard, detail}`: `standard` the id as asked (null when none), `detail` one fixed sentence, the same for every caller, and `check` and `translation` its catalogue row's. `extra` adds a caller's own fields and never replaces these. R5 answers through it, and every act of a later module that answers this condition answers through it (`conformance` R1; `filings` R14 passes R5's answer through), so the code is minted at one site; its one catalogue row is this module's (C-112.10), its `where` naming this function, and conformance's C-113.9 gives way to it. It writes nothing and never throws. *(not yet met: N309)*

R5: change "is `NO_SUCH_STANDARD`, one answer." to "is `NO_SUCH_STANDARD`, one answer (R17)."

**conformance.md: new service after R18 (Provides):**

> **noSuchDetermination(determinationId, extra?) → refusal; determinationSuperseded(determinationId, supersededBy, extra?) → refusal** (N309, N312, K275; module-level functions)
> - **R19** The one answer to one condition: no determination the caller may see answers to `determinationId` (absent or invisible, answered alike; R9, R15). It answers `{ok: false, reason: "NO_SUCH_DETERMINATION", code: "NO_SUCH_DETERMINATION", check, translation, determination, detail}`: `determination` the id as asked (null when none), `detail` one fixed sentence, the same for every caller, and `check` and `translation` its catalogue row's (C-113.15). `extra` adds a caller's own fields and never replaces these. R9 answers through it, and every act or read of a later module that answers this condition answers through it (`consequences` R1, R7, R9; `escalation` R1; `filings` R21 passes R9's answer through), so the code is minted at one site; its one catalogue row is this module's, its `where` naming this function, and consequences' C-114.1 and escalation's C-116.3 give way to it. It writes nothing and never throws. *(not yet met: N309)*
> - **R20** The one answer to one condition: the determination `determinationId` names has been superseded (it is not live, R10). It answers `{ok: false, reason: "DETERMINATION_SUPERSEDED", code: "DETERMINATION_SUPERSEDED", check, translation, determination, superseded_by, detail}`: `superseded_by` the determination that superseded it (null when the caller cannot read it), `detail` one fixed sentence, the same for every caller, and `check` and `translation` its catalogue row's. `extra` adds a caller's own fields and never replaces these. R7's supersession of a determination already superseded answers through it, as does every act of a later module that answers this condition (`consequences` R1, `actions` R8, `escalation` R1), so the code is minted at one site; its one catalogue row is this module's, its `where` naming this function, and escalation's C-116.4 gives way to it. It writes nothing and never throws. *(not yet met: N309, N312)*

**conformance.md: changes to existing statements:**
- R1: replace "`NOT_A_PARTICIPANT` (the author not joined: …)" with "`DETERMINATION_NOT_A_PARTICIPANT` (the author not joined: `membership.projectAuthority(project, author, "joined")`; its row C-113.3, K275)". Replace "`NO_SUCH_STANDARD`, naming it" with "`NO_SUCH_STANDARD` (`standards.noSuchStandard`, its R17), naming it". Append *(not yet met: N309)*.
- R7: replace "A determination is superseded at most once (`ALREADY_SUPERSEDED`)." with "A determination is superseded at most once: a second is `DETERMINATION_SUPERSEDED` (R20), naming the first; `ALREADY_SUPERSEDED`'s C-113.18 is retired and its number not reused (K275). *(not yet met: N309)*"
- R9: replace "is `NO_SUCH_DETERMINATION`, one answer" with "is `NO_SUCH_DETERMINATION`, one answer (R19)".
- R18: replace "(absent, invisible or of another project: `NO_SUCH_PROPOSAL`)" with "(absent, invisible or of another project: `NO_SUCH_COMPARISON`, its row C-113.20; K275, the proposal code being intent's) *(not yet met: N309)*".
- Private, the note naming `NOT_A_PARTICIPANT` ("R1's `NOT_A_PARTICIPANT` is this module's code, translated from …"): change it to `DETERMINATION_NOT_A_PARTICIPANT`.
- Uses, the `standards` line becomes: "`standards`: `standardRead`, `inForce`; `noSuchStandard` (its R17), through which R1's `NO_SUCH_STANDARD` is answered, in place of C-113.9 (N309, K231, K275)."

**consequences.md:**
- R1: replace "`NO_SUCH_DETERMINATION` (absent or invisible, one answer); `NOT_NONCOMPLIANT` (the determination's outcome for `standard` is not `noncompliant`, or it is superseded); `NOT_A_PARTICIPANT` (…)" with "`NO_SUCH_DETERMINATION` (absent or invisible, one answer; `conformance.noSuchDetermination`, its R19); `DETERMINATION_SUPERSEDED` (`conformance.determinationSuperseded`, its R20); `CONSEQUENCE_NOT_NONCOMPLIANT` (the determination's outcome for `standard` is not `noncompliant`; its row C-114.2, K275); `CONSEQUENCE_NOT_A_PARTICIPANT` (a member author not joined in its project; a machine's computed part, R2, answers no project authority, K171; its row C-114.3, K275)". Append *(not yet met: N309)*.
- Uses, the `conformance` line becomes: "`conformance`: `determinationRead` (R1); `noSuchDetermination` and `determinationSuperseded` (its R19, R20), through which R1's, R7's and R9's `NO_SUCH_DETERMINATION` and R1's `DETERMINATION_SUPERSEDED` are answered, in place of C-114.1 (N309, K275)."
- A note for the job: the helper's `detail` is fixed, so today's "Nothing was written." suffix on acts (`wrote`) goes.

**actions.md:**
- R8: replace "a superseded determination is refused `DETERMINATION_SUPERSEDED`." with "a superseded determination is refused `DETERMINATION_SUPERSEDED` (`conformance.determinationSuperseded`, its R20; N312). *(not yet met: N312)*" Today's answer carries no code, row or translation. Through the helper it gains all three.
- Uses, the `conformance` line becomes: "`conformance`: `determinationRead` (R8, R30); `determinationSuperseded` (its R20), through which R8's `DETERMINATION_SUPERSEDED` is answered (N312, K275). `consequences`: none; remove (R26 is DEC-14's, not the module's)."

**escalation.md:**
- R1: replace "`NO_SUCH_DETERMINATION` (absent or invisible, one answer); `DETERMINATION_SUPERSEDED`;" with "`NO_SUCH_DETERMINATION` (absent or invisible, one answer; `conformance.noSuchDetermination`, its R19); `DETERMINATION_SUPERSEDED` (`conformance.determinationSuperseded`, its R20);". Replace "`NOT_A_PARTICIPANT` (the author is not joined in the determination's project)" with "`ESCALATION_NOT_A_PARTICIPANT` (the author is not joined in the determination's project; its row C-116.6, K275)". Append *(not yet met: N309, N312)*.
- R13: replace "and `NOT_PROPOSED` in place of `TRIGGER_NOT_MET`" with "and `EDGE_NOT_PROPOSED` (its row C-116.30; K275, membership's `NOT_PROPOSED` naming another condition) in place of `TRIGGER_NOT_MET`". Append *(not yet met: N309)*.
- Uses, the `conformance` line becomes: "`conformance`: `determinationRead`, `determinationsFor` (R1, R4, R14); `noSuchDetermination` and `determinationSuperseded` (its R19, R20), through which R1's `NO_SUCH_DETERMINATION` and `DETERMINATION_SUPERSEDED` are answered, in place of C-116.3 and C-116.4 (N309, N312, K275)."

**Unchanged:** membership (R6 `NOT_PROPOSED`; R35, R36, R39 `NOT_A_PARTICIPANT`), promotion R43, intent (`NO_SUCH_PROPOSAL`, C-111.22), and filings (R14 and R21 already pass the owner's answer through). Optionally, intent R16 could name the code it mints, "`NO_SUCH_PROPOSAL` (no open proposal answers to the key)". It is not needed for this entry.

**Rows (N302, promotion R34 stamps them).**
- Retired, numbers not reused: C-113.9, C-113.18, C-114.1, C-116.3 and C-116.4.
- New: conformance's `DETERMINATION_SUPERSEDED` row.
- Renamed in place: C-113.3, C-113.20, C-114.2, C-114.3, C-116.6 and C-116.30.

**Callers that read these codes.** affordances' `reasoned` and `JUSTIFICATION_REFUSALS` lists, and the UI's refusal-code check (`civicos-ui/check-refusal-codes.mjs`), must be grepped for the renamed codes when the jobs run. K370's affordances R19 break is the precedent.
