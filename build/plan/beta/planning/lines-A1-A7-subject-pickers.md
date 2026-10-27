# Requirement-line draft: A1 a question's subject (DEC-457) and A7 the document picker's two scopes (DEC-463)

**Status** · DRAFT for BOB · PLANNING L2, 2026-10-27. Drafted by a Sonnet reading worker from inquiry, inquiry-grammar and screens-inquiry read whole; reviewed by PLANNING. Layer order holds (inquiry L6 uses entities L5; screens-inquiry L11). PLANNING's notes: (1) the subject is front matter, so naming or changing it is a revision through promotion and moves strength: R87 refuses a change the existing legs cannot carry rather than lowering grades (R32), which keeps Bob's "never auto-lower" doctrine; (2) A7 governs three screens modules (screens-inquiry, screens-investigate, screens-publish), and screens-investigate R34 and R52 disagree today: PLANNING recommends one picker element in interface-shell cited by each (BOB's); (3) also owed outside these files: leg-earning R1 names "no subject named" as a distinct `why`. Bob's open points: A1 §6.1 (offices among "people and organizations"), A7 §7.1 (the rest of what she may see, or only her projects).


Read in full: `inquiry.md`, `inquiry-grammar.md`, `screens-inquiry.md`. Also read: `leg-earning` R1, `entities` R51/R67, `capture` R77/R88, `screens-investigate` R34/R52, `screens-settings` R70, `screens-publish` R8, `questions-alpha-walk.html`. No repo file edited.

## A1 (DEC-457): a question's subject

### 1. Existing lines
- The subject exists: front-matter `subject_entity` (`inquiry-grammar` R1, R12); `inquiry` R11 (unknown id: `SUBJECT_REFUSED`), R12/R40/R43 (`inquiry_subject_entity`, `subjectEntityOf`), R6 (a resolution needs one); `leg-earning` R1 (`earnedForDoc` reads the front matter's `subject_entity`, else none). Also read by `contradiction` K2, `docket`, `question-explorer` R2; `case-authoring` R60 reads a published member's pinned bytes.
- **Stored in front matter: yes. So naming or changing it later is a record write**: a revision of the question's document (a promotion with a base). It re-derives every leg's earned connection grade, so it moves strength.
- No screen sends it today: `screens-inquiry` R11 and R43 write the inquiry with `project:` only.
- Bound by: R35 (published member cannot be re-grouped), R64/R86 (`divided` closed; `dividedCannotRestructure`), R33, R30, R59/R63 (private-person warning already reads `subject`), R27/R28/R65 (model: reasoned act, strength pair, history), R32 (no grade given to a leg).
- Contradicts nothing. It replaces the provisional "screens create questions with no subject" (R11, R43 by silence); `question`'s acts (R2) gain one.

### 2. Highest ids
`inquiry` **R86** (no retired id above); `inquiry-grammar` R70; `screens-inquiry` **R139** (R119 retired, below).

### 3. Draft lines

**inquiry**
- **R87** NEW (amends R35; shape of R27/R28) `setSubject({target, subject, reason, viewer, author})` (`op=inquirysubject`, name BOB's) names, changes or clears (`subject` empty) the document's `subject_entity`, nothing else changes (legs, grounds, state, conclusion). Refusals in order, each writing nothing: `MACHINE_CANNOT_SET_SUBJECT` (new; row in `inquiry-grammar` R7 beside `MACHINE_CANNOT_GROUND`); `NO_TARGET`; `NO_SUCH_BUNDLE` (absent or invisible, R33); `NOT_AN_INQUIRY`; `PUBLISHED_CANNOT_RESTRUCTURE` (case member, R35); `DIVIDED_CANNOT_RESTRUCTURE` (through `dividedCannotRestructure`, R64/R86); `NO_DOCUMENT`; `NO_REASON` (every later naming, change or clearing has one; naming at creation is the creation); `BAD_REASON` (over 500, as R23); `SUBJECT_UNCHANGED` (new; includes none to none); then R11's judging of the candidate: an unregistered entity is `SUBJECT_REFUSED` (same code, K231); a graded leg stating a connection or resolution grade above what the new subject earns (R6; nothing is earned with none) is `BASIS_REFUSED` with each leg named in `findings[]`, and no grade is lowered for the member (R32). The state does not move. Answer: `{ok, target, subject, previous, reason, strength_before, strength_after}` (R28's registered `onGrounded`; none: `strength_absent`). Afterwards `subjectEntityOf` answers the new value. Any non-machine member who sees the question may do it (as `ground`). Test: name, change and clear each land; document, `subjectEntityOf` and both pairs read right. Controls: each refusal leaves document and `inquiry_basis` unchanged; unknown id `SUBJECT_REFUSED`; a leg at connection B whose new subject earns C is `BASIS_REFUSED` naming it; divided and published refused; a concluded question accepts it and keeps its conclusion.
- **R88** NEW `subjectHistory({id, viewer})` (`op=inquirysubjecthistory`, name BOB's) answers `{ok: true, id, subject, changes, strength_now}`: `subject` `{entity_id, label, kind}` as the held document states it, else null (`label` null, stated, when the registry cannot be read). `changes`, oldest first, never edited: `{at, by, act, from, to, reason, strength_before, strength_after}`, `act` `named`, `changed`, `cleared`, or `opened` when the creating promotion stated a subject (`reason` null, pair null). A question whose subject was stated before this requirement has `subject` and no `opened` entry (stated, never composed). Pairs as R65 (null with `strength_absent`). Invisible or not a question: answered as absent (R33). Read in any state. Never throws. Test: opened with a subject, changed with a reason, cleared: three entries in order, both pairs, `subject: null`; a never-named question answers `subject: null, changes: []`. Controls: invisible as absent; a published question is read.
- **R89** NEW (amends R59, R63) R59's warning also covers the subject: a promotion creating an inquiry that states a `subject_entity`, and `setSubject`, naming a person in no public role (`personFacts({text, subject, viewer})`) carry it, never an error; her choice is recorded (wire shape: 6.5). Test: a private person draws the warning and writes after her choice; an officeholder carries none. Control: clearing carries none.
- **R90** NEW (amends R86) `DECLARED_OPS` also carries `inquirysubject` (accepts and requires `target`, `subject`, `reason`; empty `subject` clears) and `inquirysubjecthistory` (`id`), weight as `inquiryground`. Test: `declared-ops.test.mjs` extended.

**screens-inquiry**
- **R140** NEW (amends R11, R43) **Opening asks who it is about.** The opening forms ("Open a question", "Your first question") draw an optional choice, "Who is this question about?" (key owed by design), among the people and organizations the team follows. In the record that is every registered entity (`entities` R67, R51): `entitieskind` for `person` and the organisation kinds (`institution`, `body`, `movement`; offices: 6.1), paged by `next`, by label and kind in words, never an id (R39), narrowed by typing (`form.choose.search`, `.none`). Nothing chosen sends no `subject_entity` (never an empty one); a choice sends the entity id in the new document. R59's warning for a private person is drawn before the question is written; `SUBJECT_REFUSED` by its words; a failed registry read draws the choice failed (R20) and the question still opens without it. Test: choosing Chen opens a question whose `subject_entity` is that id, read back on the page; no choice sends none. Controls: a refused subject opens nothing; a failed read still opens the question.
- **R141** NEW (amends R2, R24; R117) **The question page says who it is about and lets a member change it.** A block "Who this question is about" from `subjectHistory`: the subject by label as a reference opening `person` or its kind's screen (R95); with none, one plain sentence (no subject named, so connections cannot be graded) and the act "Name who it is about"; with one, "Change who it is about…" and "Take it off…" (nothing preselected). The act uses R140's choice and a required reason (empty: nothing sent, said in place), sends `inquirysubject`, and draws the answer's pair as `question.rests.changed` does (R24). The history follows, newest first: who, when, from and to by label, reason, strength before and after (null `strength_after` said as not recorded, R54). Refusals by words (`DIVIDED_CANNOT_RESTRUCTURE` points to the child); a `BASIS_REFUSED` draws its first finding's detail (R117) naming the leg; the typed reason is kept. The act is offered to a non-machine member who sees the question (absent, never greyed) and not on a divided question or a published member. Where a connection grade reads undetermined for lack of a subject, the page says so, not "Unrated" (4). Test: no subject draws the sentence and the act; naming with a reason sends `inquirysubject`, draws the history entry and pair; an empty reason sends nothing. Controls: with a subject, no "no subject" sentence; divided: no act.

### 4. Uses and placement
- Exists: `entities.entitiesOfKind`, `readEntity`, `inquiry.subjectEntityOf`, `strength` R17's registration, `op-declarations` R80-81 pattern.
- Not yet existing: R87, R88 above; two code rows; the new act in the registry's `question` list and in `op-declarations`; **`leg-earning` R1 must state "no subject named" as a distinct `why`** (today only "each carries a `why`"), outside my two files; BOB places it.
- Placement is right (subject is `inquiry`'s). `inquiry-grammar` needs only the one code row (its R1/R12 already accept the field).

### 5. Screen needs
Opening: optional searchable choice of entities by label, plain "no one" state. Page: subject or plain "none" with its act; reason field; pair before/after; history; private-person warning; refusals naming a leg; the no-subject reason where connection grades read undetermined. Registry: one act on `question`.

### 6. Open points
1. **Kinds offered** (Bob's, small). "People and organizations" = person + `institution`/`body`/`movement`; `office` is its own kind. Recommend include offices (a question about the Controller's Bureau is natural; `earned` resolves to any entity).
2. **Clearing** (BOB's): recommend allowed with a reason (decision says "add or change").
3. **Concluded question** (BOB's; tell Bob if he sees doctrine): recommend allowed, conclusion kept, pair shown; alternative: withdraw the conclusion first.
4. **Grades the new subject cannot carry** (BOB's): refuse (R87), never auto-lower (R32, DEC-18).
5. **Warning wire shape for a revision** (BOB's): R59 gives no shape; fix once for both acts.
6. **Re-evaluation** (BOB's): none raised (strength is live-derived); confirm citing projects and cases need no notice.
7. **Who may change** (BOB's): recommend any non-machine member who sees the question, as `ground`.

## A7 (DEC-463): the document picker's two scopes

### 1. Existing lines
- `screens-inquiry` **R137** (one picker for "Connections you assert" and "This contradicts another document") lists "every document of the team the member can see … grouped by project (this document's project first, the member's other projects, then `…pick.noproject`)". **A7 amends it**: this project's documents by default, the rest on request. Everything else in R137 stands (find box, none-found, archive rows, one radio choice, 20 a page by `next`, `screen.list.showing`/`.more`, prev/next, contradict's passage choice, no document: fold not drawn).
- Other pickers here choose questions (R49/R61/R96(2): already "own project first, then others"), imports (R110) or list project documents only (R128, R79). No contradiction. `capture` R77/R88 already support the split: `heldcaptures` takes `project` (home plus documents seen there, `also_here`), `state: held_and_vouched`, `fields: picker`; rows carry `project`.

### 2. Highest id
`screens-inquiry` R139; A1 takes R140-R141, so this is R142.

### 3. Draft line
- **R142** NEW (amends R137; DEC-463) **The picker shows this project's documents first, the rest on request.** It opens with this document's project only (`heldcaptures` filtered by `project`, `state: held_and_vouched`, `fields: picker`; documents seen here carry their home project). Beneath, "Show documents from your other projects" (key owed by design) adds the rest: every other document the member may see, from a second read without the filter, rows already listed dropped, each with its project's name (a group heading satisfies this; no project: `screen.document.pick.noproject`). That second read is not made before the press. Once added they stay for the visit and the control is not drawn again. A chosen document stays chosen from either scope; typing narrows what is shown; `screen.document.pick.none` is drawn when nothing shown matches, with the control still offered. An archive keeps its files with it, in its own scope; paging and truncation statements (R137, G20) hold per read. With no project known for this document there is no first scope: the list is the second read, labeled, with no control. A failed read is drawn failed (R20), not as empty. Test: a project-A document, with documents in A and B: only A's listed and no unfiltered read sent; the press adds B's labeled B, A's not repeated; choosing a B document sends its digest. Controls: no known project: all labeled, no control; one project only: no control; a failed second read is drawn failed and A's list stands.

### 4. Uses
Nothing new.

### 5. Other screens modules the rule should cover
- **`screens-investigate` R34 and R52 (R46)**: every "Which document" choice of `person`, `timeline`, `money`, `calculation`, `proceeding`, `standard`, a matter's thread and discharge folds, and `explore`'s source, Standard-text and court-link pickers. R34 says "this project's documents first" while R52 reads every held and vouched document and Explore "the viewer's visible documents": they disagree now; A7 settles it. Largest set.
- **`screens-publish` R8**: the docket's picker ("every held document"), a project screen.
- **`screens-settings` R70** (`grouprules`): group-level, no "this project"; the rule does not apply as written. Say so when the lines are written.
- `screens-intake` (question chooser) and `screens-daily` R57 (cite the held set) are not document pickers. `screens-action` uses `screens-investigate` R52 for its folds.

### 6. Placement and screen needs
- The decision names `screens-inquiry` only, yet three modules draw the picker. Recommend BOB place the rule once as a kit element in `interface-shell` (it holds `cs.choice`, `passagePick`, R91; earlier layer) and have each module cite it. BOB's.
- Needs: primary list; "show others" control; project label on added rows; search over what is shown; a "none match here" state that still offers the control; paging statements per scope.

### 7. Open points
1. **"Your other projects" vs "the rest"** (meaning, Bob's, small): the decision adds "the rest" (all she may see) but the control says "your". If she sees documents of projects she is not in, ask design to word it without "your". Recommend: all she may see, labeled.
2. **No-project documents** (BOB's): recommend in the added scope, labeled `…pick.noproject`.
3. **Unknown home project** (BOB's): recommend no first scope, as drafted.
4. **A document filed here from elsewhere** counts as this project's, labeled with its home (follows `capture` R77).
