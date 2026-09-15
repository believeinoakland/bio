# The Assistant — pilot design for the first AI integration

**Status** · The pilot design for **the assistant**, written 2026-08-04 by session BOB at Bob's direction (*"Let's use the Assistant feature as the initial pilot AI integration case"*), expanding Bob's own sketch of the workflow; amended in place 2026-08-05 with DEC-60's note inside §4, and re-pointed 2026-09-14 by CPDF-17 so §2's four-level bullet names the framework section that carries the rule. It amends no ruling: DEC-27, DEC-24, DEC-55, D-82 and D-90 govern and this is the mechanism under them. **PARTIALLY COMPLETE AS A DESIGN AND LARGELY UNBUILT — and the title is the first thing a reader who has not lived in the repo must discount, because the assistant pilot is NOT the first AI integration that was actually built: the investigative session was (`docs/archive/IS-BUILD-PLAN.md`, closed at 43/43), and `BIO_System_Design.md` §3 row 11 reads "investigative session built; assistant pilot designed".** What of the pilot stands today, in the framework's vocabulary (the checker reads the FIRST `as of` in a Status, so this Status carries exactly one, at its end). §1's five-layer training pack is **[BUILT] in four of its five layers, but as the INVESTIGATIVE SESSION's pack rather than an assistant's**: doctrine, vocabulary and capabilities are `bio-plane/src/skillpack.mjs` and `skilldoctrine.mjs` (SK-1..SK-4), which cite this section by name and hold no typed copy of any emitted vocabulary; surfaces are `SURFACES` in `civicos-ui/app.html` (18 registered, walked out of the runtime's own routing in both directions by `civicos-ui/test/surface-registry.test.mjs`); the recipe FORMAT and its build-time validation are **[BUILT]** (3 recipes, a step naming a surface or op that does not exist fails the build) while the pack's own recipe layer is **[ABSENT]** and says so in an `absent_because`, blocked on SK-5. §2's flow and §3's wizard are **[DESIGNED-not-built] in full** — no prompt entry point, no INTERPRET step, no classifier and no wizard exist anywhere. §4 is **[BUILT] as the `ai` CREDENTIAL CLASS** (`op=aicredentialmint` / `aicredentialrevoke` / `aicredentials`, the C-29 family, `AI_SCOPE_BEYOND_MEMBER_REACH` judged against the OPS table's own member reach) and **[ABSENT] as the pilot's read-only scope**, because no pilot credential is minted anywhere; its two-principal account model has been overtaken by FL-6's three-level cascade. §5's exclusions still stand as the pilot's own rules while two of their stated reasons have gone stale. §6 is a rationale table, never revised. §7's build order is **[BUILT] at steps 1 and 3**, built-for-the-sibling at step 2, and **[ABSENT] at steps 4, 5 and 6**. Every one of those calls is bulleted below with what was measured. as of 2026-09-14.

**Place in the system** · A level-2 design serving construct 11, **The assistant and the AI roles**, of `docs/architecture/BIO_System_Design.md` §3. **Its level-1 home is `BIO_Assistant_and_AI_Roles_v0_1.md` (since 2026-09-14), whose §5 places this design and whose §6 supersedes §4's two-principal model**; before that document existed, this file, `INVESTIGATIVE-SESSION.md` and `kickoffs/SKILL.md` were the construct's only description, and this line said so rather than inventing a home. **Its sibling is `INVESTIGATIVE-SESSION.md`** — DEC-60 made the two consumers of one `ai` class and one running-session surface (§14a there), and the two doctrine packs write one `ai_runs.skill_version` column, which is why that column's value names a pack. What depends on it: `bio-plane/src/skillpack.mjs` cites §1 for the five layers by drift rate and §1's surface-the-refusal rule; `civicos-ui/app.html`'s surface-registry block cites §7 step 1 as the item it builds; DEC-60 (2026-08-07) cites it when it rules that the no-unstated-propositions limit is superseded for the investigative session and **STANDS for this pilot**. Nothing supersedes it; DEC-60 amends §4 in place.

**Incomplete sections** ·
- §title — STALE as a claim about the world. "pilot design for the first AI integration" was true when written; the investigative session shipped first (`docs/archive/IS-BUILD-PLAN.md`, 43/43) and no part of this pilot's own flow has been built. The document is the design of the SECOND AI integration and of the first one that was designed.
- §1 — two hand-carried figures are stale and one of its premises has since become true. Measured 2026-09-14 on this tree: "~305 authored `detail:` strings" is **614** across `bio-plane/src/*.mjs` and `bio-plane/checks/*.mjs` (511 of them in `store.mjs` alone); "120 declarations with per-op `classes`" is **171** entries in `index.mjs`'s `OPS` table. The Recipes row does not distinguish the two halves it now has: the format and its build-failing validation are built in `civicos-ui/app.html`, and the pack's recipe layer is still `absent`.
- §2 — [DESIGNED-not-built] in full. Nothing in `civicos-ui/app.html` or the plane offers a prompt entry point on any surface; there is no INTERPRET step and no FIND/HELP/CREATE/ACT classifier. The one AI surface that IS built is `SURFACES["ai-session"]`, the cross-cutting running-session indicator this file's own §4 block points at, and it belongs to `INVESTIGATIVE-SESSION.md` §14a rather than to this flow.
- §3 — [DESIGNED-not-built] entirely. Nothing renders a plan as steps and nothing observes completion by re-reading state, so the section's sharpest rules (never enter a value, never press Submit, no prefill) fence nothing yet and are doctrine awaiting a builder.
- §4 — STALE in its principals. It offers two — the organisation's or the member's Claude API key — and FL-6 landed a THREE-level cascade, member then project then instance, as `CASCADE_ORDER` in `agent-worker/src/cascade.mjs`, Bob's order verbatim. The project level is a principal this section does not have. Its `MACHINE_CANNOT_*` premise has moved the other way and for the better: all **12** codes in `bio-plane/src` now carry a canned translation, where SK-1 measured 1 of 12 on 2026-08-08.
- §5 — **exclusion 1 is CORRECTED IN PLACE as of 2026-09-14 (SK-8, on BOB #11's delegation) and is no longer stale; exclusion 3 still is.** Exclusion 1 previously gave the wrong REASON for excluding PURSUE/EXTRACT/CHECK (*"those are DEC-24 roles with their own scopes"*) and a CHECK-sequencing clause SK-4 had already made false. It now says what §4 and the §6 hazard table already said — the pilot's credential writes nothing because it is READ-ONLY — and records that EXTRACT runs in DEC-62's RUN, citing `BIO_Assistant_and_AI_Roles_v0_1.md` §7.3, with the correction note saying why the old sentence was wrong. The exclusion itself is unchanged. **Exclusion 3 remains stale**: it calls DEC-47 "still open" and DEC-47 is `answered` — an investigation session may reach public sources nobody named, the inquiry and the session launch being the authorisation. That exclusion stands as the pilot's own rule; its reason no longer does.
- §6 — never revised since it was written, so it reads as six open intentions when two are now code: the D-106 hazard is answered by the self-describing registry and the build-failing recipes, and the drift-from-doctrine hazard by the refusal family's canned translations. The other four name no enforcement and none exists.
- §7 — stale as a forward plan. Step 1 is [BUILT] (UI-38); step 2 is [BUILT] for the SIBLING's pack rather than an assistant's; step 3 is [BUILT] as the `ai` credential class; steps 4 (FIND end to end), 5 (the wizard) and 6 (the pilot's own observation log) are [ABSENT] and only the recipe blocker below step 1 is queued, as SK-5.

**Contents**
- [1 · The training is SELF-DESCRIPTION, not a document — this is the load-bearing decision](#1-the-training-is-self-description-not-a-document-this-is-the-load-bearing-decision)
- [2 · The flow](#2-the-flow)
- [3 · The wizard](#3-the-wizard)
- [4 · What the assistant runs as — DEC-55 applied, and the pilot's scope is READ-ONLY](#4-what-the-assistant-runs-as-dec-55-applied-and-the-pilots-scope-is-read-only)
- [5 · What the pilot deliberately excludes](#5-what-the-pilot-deliberately-excludes)
- [6 · The failure modes this design is built against, each from this week's record](#6-the-failure-modes-this-design-is-built-against-each-from-this-weeks-record)
- [7 · Build order inside the pilot](#7-build-order-inside-the-pilot)

---

2026-08-04, session BOB, at Bob's direction: *"Let's use the Assistant feature as the
initial pilot AI integration case."* This maps how it works. The governing rulings are
DEC-27 (the assistant construct and S12), DEC-24 (the machine may do the looking, the
member does the concluding), DEC-55 (the AI is an agent against the plane's endpoint
surface, under an `ai`-class token with a declared task scope), D-82 (assistant-surfaced
must LOOK derived) and D-90 (derived informs, authored binds). Nothing here amends them;
this is the mechanism under them.

Bob's sketch, which this document expands: *"the Assistant workflow starts with a prompt.
In response to the prompt, the AI interprets it (maybe asks for a clarification) then
either provides an answer, [or] if the prompt is a request for help doing something
presents a wizard (as a popup, or more likely as a sidebar or bottom-bar), then brings up
the surface in which the user will do something. The AI probably doesn't enter values
into any fields, nor hit the Submit button."*

## 1 · The training is SELF-DESCRIPTION, not a document — this is the load-bearing decision

Bob: the assistant must know *"the 'language' of the CivicOS workflow… surfaces,
processes, projects, inquiries, the purpose of the workflow, its user types… the set of
surfaces, what can be done in each surface and how, how to do a series of steps to
accomplish a desired result."*

The wrong way to build that is a hand-written training document, because it is a
DESCRIPTION OF THE SYSTEM MAINTAINED BESIDE THE SYSTEM — the D-106 defect class (a thing
that describes itself wrongly) built in on day one. `app.html` changes weekly; a parallel
prose description of forty surfaces is stale by the second release, and a confidently
wrong assistant is worse than none, because it walks a member into the wrong act with
authority in its voice.

**So the training pack is LAYERED BY HOW FAST EACH LAYER MOVES, and every layer that can
be generated from the system IS:**

| Layer | Content | Source | Drift defence |
| --- | --- | --- | --- |
| **Doctrine** | purpose, the path verbs, user types, the boundary rules, what the assistant must refuse | authored once, versioned with releases | slow-moving; reviewed like doctrine |
| **Vocabulary** | object types, states, grades, the two axes, act labels, fence wording | **the plane's PUBLISHED vocabulary** — the same mechanism the UI already renders from (REC-16/REC-38's published prompts and labels) | the assistant renders published words, inventing none — the UI's own rule extended |
| **Capabilities** | every op, its class, its parameters, its refusals | **the op registry itself** (120 declarations with per-op `classes`; `coverage.mjs` already enumerates it) | generated, so it CANNOT drift |
| **Surfaces** | each surface: id, purpose, what can be done there, which acts it hosts | **surfaces self-describe** — a registration the UI carries per surface, the finder-scope pattern generalised | validated in the UI harness: a surface with no registration fails |
| **Recipes** | multi-step paths to a result (*"open a project to explore a tip"* → steps) | **authored as DATA, not prose** — each step names a surface id and an act/op | **mechanically validated**: a recipe naming a surface or op that does not exist FAILS THE BUILD, plancheck-style |

**And the refusal vocabulary is already training data.** The plane carries ~305 authored
`detail:` strings written as teaching text (*"a published case states what it does NOT
cover. A case silent about its own limits is claiming to cover everything…"*). When a
member hits a refusal, the assistant's job is to SURFACE that text and route, never to
paraphrase it — the investment in teaching-grade refusals becomes the assistant's answer
key, one more place where the record's own words outrank generated ones.

## 2 · The flow

```
tag (every surface) → prompt (text or voice)
  → context attaches: surface id + object in view      [mechanical, disclosed; never keystrokes]
  → INTERPRET
      ambiguous?  → ONE clarifying question, then proceed or drop to search
  → classify:
      FIND   → run read ops → ANSWER with record citations + the LEVEL searched
      HELP   → PLAN → WIZARD (sidebar/bottom-bar) → navigate to the surface → member acts
      CREATE → PLAN carrying the member's OWN WORDS as proposed structure → wizard → surface
      ACT    → wizard to the act's surface → THE ACT RUNS ITS FOUR BEATS, untouched
```

- **INTERPRET shows its reading** (DEC-27: *"this is what I read as the question, these
  as claims, these as the people and bodies named"*). Clarification is bounded — one
  question, not an interview; if still ambiguous, degrade to FIND and show what was found.
- **An ANSWER names its level.** The four-level rule (`CLAUDE.md`; the framework's own
  statement of it is Part II §14.3 of
  `docs/architecture/BIO_Content_Framework_v0_10.md`, which cites THESE lines as the
  design that requires an answer to name its level — pointer added 2026-09-14, CPDF-17,
  because citing CLAUDE.md alone left this bullet's own authority invisible from here)
  binds the assistant
  hardest of anything, because it is the component most likely to say "there is nothing":
  *no meaning derived* / *nothing extracted* / *no document held* / *not found outside* are
  four different answers, and "I found nothing" without a level is the overclaim the
  system exists to refuse. An assistant answer that reports absence MUST say which levels
  it searched and which it did not.
- **CONTEXT is the surface id and the addressed object, disclosed in the dialog** ("asking
  about: S4 · the Sewer Fund project"). Never keystrokes, never field contents the member
  has not submitted.

## 3 · The wizard

A wizard is **a PLAN rendered as steps, each step naming a surface and what the member
does there** — and the plan is a DERIVED object wearing D-82's dress: visibly
machine-made, dismissible, never blocking.

- Each step: *surface → what to do there → why it is next* (the why in one sentence,
  sourced from doctrine/recipe, not invented).
- The wizard NAVIGATES — it brings up the surface (Bob's words) — and then STOPS. The
  member does the thing. It observes completion by READING state through the same read
  ops (the object now exists; the state changed) and advances. **It never enters values
  into fields and never presses Submit** — Bob's "probably" is adopted as the pilot rule
  outright, because it is also the cheap rule: the assistant needs no DOM access to any
  surface, which kills an entire class of injection and drift hazards at birth.
- **Where a CREATE proposal carries the member's own words** (DEC-27's transcription-and-
  routing case), the wizard SHOWS them beside the surface for the member to take — the
  member's paste/typing is the adoption. No prefill in the pilot. If field-level "use
  this" affordances are wanted later, the member's per-field click is the entering act,
  and that is a post-pilot decision, not this one.
- **An abandoned wizard is a non-event.** No record entry, no nag. Guidance is not an
  obligation.

## 4 · What the assistant runs as — DEC-55 applied, and the pilot's scope is READ-ONLY

> **READ THIS BEFORE INFERRING ANYTHING ABOUT THE `ai` CLASS (added 2026-08-05, DEC-60).**
> Everything in this section stands: **the ASSISTANT PILOT is read-only and holds no
> mutating op.** But the `ai` CLASS is no longer read-only as a class. DEC-60 rules that an
> **investigative session** may formulate claims proactively and write them as SUGGESTIONS
> through one endpoint, under an `ai` credential with its own declared scope
> (`INVESTIGATIVE-SESSION.md`, the suggest endpoint and the credential scope in its §18). It is a SIBLING of this pilot, not a widening of
> it: §5's exclusions below are unaffected, and nothing here gains a mutating op. The
> distinction that matters is that DEC-55's *endpoint-surface-is-the-fence* now does real
> work rather than being belt-on-top-of-an-absent-op — for the investigative session the
> endpoint IS the entire fence, because its sole possible output is a suggestion.
>
> **AND ONE PIECE OF THAT DESIGN IS THE ASSISTANT'S TOO (Bob, 2026-08-05).** How a running
> AI session is shown to a member is CROSS-CUTTING and is designed once for every AI-based
> function, not per feature: a session runs in a CONTEXT (a claim, an inquiry, a project);
> any window focused on an object in that context shows an ANIMATED INDICATOR that a job is
> running; clicking it opens the LIVE TRANSCRIPT; and the objects DO NOT CHANGE while the
> session runs, so there is no partial state and no "come back later" notice. It also
> settles this file's ephemerality determination coherently rather than by exception — the
> transcript is LIVE BUT NOT DURABLE. See `INVESTIGATIVE-SESSION.md` §14a; the investigation
> session is the first instance of the surface, not the owner of it.

- The assistant's model runs under the ORGANISATION's or the MEMBER's Claude API key
  (DEC-55's corrected architecture; both principals legal, the record says which).
- It reaches the plane as an **`ai`-class credential whose task scope for the pilot is
  READ OPS ONLY.** This is the decisive pilot property: FIND needs reads; the wizard
  needs reads (to observe progress); CREATE/ACT proposals need NOTHING, because the
  member executes the act under their own identity in the surface. **The pilot assistant
  holds no mutating op at all**, so the `MACHINE_CANNOT_*` fences are belt on top of an
  absent op — confinement by refusal at the registry (DEC-55's endpoint-surface-is-the-
  fence), with the fences as the second wall.
- **Two identities, two steps, by construction**: the AI reads as `token:ai`; the member
  acts as themselves. The DEC-55 negative control (mint an `ai` credential, every machine
  fence fires by name) ships WITH the pilot.
- **Ephemerality**: the assistant conversation is the member's thinking space and is NOT
  part of the record — like a draft. What enters the record enters through the member's
  acts, and an object that originated from an assistant proposal carries `surfaced_by:
  agent` (D-82's machinery, already server-stamped). A member may save an exchange as
  their own note; that is an authored act like any other. (Mine under delegation; flagged
  in the inbox for Bob's veto rather than his confirmation.)

## 5 · What the pilot deliberately excludes

1. **No PURSUE/EXTRACT/CHECK on the pilot's credential — BECAUSE THAT CREDENTIAL IS
   READ-ONLY AND WRITES NOTHING, not because the roles are out of reach.** §4 is the whole
   of it: the pilot assistant holds no mutating op at all, and every one of these roles
   writes. So the exclusion is a CONSEQUENCE of the pilot's scope rather than a separate
   rule, and it is not lifted by any of them becoming buildable. **EXTRACT in particular
   now RUNS, and it runs in DEC-62's RUN** — the object that already bounds, logs, resumes
   and checks a machine credential's work — with no new runtime, no new credential class
   and no new fence; its mints are a bound on that run, and an uncited machine-minted row
   is a proposal rather than coverage. The authority is
   `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §7.3, where D-358 was answered on
   2026-09-14; the plane half is `op=extractpropose` / `op=extractproposals` (SK-8) over the
   mint door SK-7 built. **The pilot may still SHOW what an EXTRACT run produced and REQUEST
   a run on the member's own act** — a read and an authored act, neither of which widens
   anything here. CHECK is sequenced FIRST and not after: SK-4 landed with CHECK as the
   first deployed mode while this pilot is still unbuilt.

   > **Corrected in place 2026-09-14 by SK-8 (BOB #11's delegation), never exempted, and
   > this note says why the old sentence was wrong.** It read *"those are DEC-24 roles with
   > their own scopes; the pilot is DEC-27's surface only. CHECK is sequenced first AFTER
   > the pilot (DEC-55)"*, written 2026-08-04 and overtaken three times. It gave the wrong
   > REASON — it read as *these roles are somebody else's work*, when the actual defence is
   > the one §4 states and the hazard table names, that the pilot token cannot execute any
   > mutating op. A reason that is not the real reason is worse here than no reason: read
   > as written, it made lifting the exclusion look like a scope decision about the pilot,
   > which is exactly the question D-358 sat open on for a day while SK-7's door had no
   > caller. Its CHECK clause was also false in fact from SK-4. The exclusion itself is
   > unchanged and stands.
2. **No field entry, no DOM access, no Submit** — stated above; revisit only after the
   pilot has usage to argue from.
3. **No egress** — the assistant searches the four levels DOWN TO the store; reaching the
   open internet on the instance's behalf is DEC-47, still open, and the pilot does not
   preempt it. The assistant may TELL the member the fourth level exists and is theirs.
4. **No policy role** — DEC-54's inhale is the highest-risk integration and comes last.

## 6 · The failure modes this design is built against, each from this week's record

| Hazard | Defence |
| --- | --- |
| assistant describes a surface wrongly (D-106 class) | self-describing surfaces + build-failing recipes; no hand-maintained catalog |
| "there is nothing on X" read as evidence of absence | answers name their LEVEL; the four-level rule is in the doctrine layer verbatim |
| convenience back door around the act ceremony | DEC-27's rule restated as mechanism: the wizard navigates TO the ceremony; the pilot token cannot execute any mutating op |
| generated wording drifts from doctrine | vocabulary layer renders PUBLISHED words; refusals surfaced verbatim |
| member mistakes machine text for their own authorship | D-82 dress on every proposal; adoption is the member's physical act |
| prompt-injection via record content the assistant reads | the assistant's tools are read-ops returning record data; record data is DATA — the doctrine layer instructs, the capability layer bounds, and no op the token holds can mutate regardless of what any document says |

## 7 · Build order inside the pilot

1. The **surface registry** and **recipe format** with their build-time validation (no AI
   needed — this is UI-side data work and pays for itself in documentation immediately).
2. The **training pack generator** (doctrine authored; vocabulary/capabilities emitted
   from the plane; recipes compiled in).
3. The **`ai` class** with read-only scope + the DEC-55 negative control.
4. **FIND** end to end (prompt → reads → cited answer with level).
5. **Wizard** over authored recipes (HELP), then CREATE proposals.
6. Measure before widening: which prompts clarified, which wizards abandoned at which
   step, which answers cited which levels — the pilot's own observation log, so widening
   the scope is argued from use rather than appetite.
