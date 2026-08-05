# The Assistant — pilot design for the first AI integration

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
- **An ANSWER names its level.** The four-level rule (CLAUDE.md) binds the assistant
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

1. **No PURSUE/EXTRACT/CHECK** — those are DEC-24 roles with their own scopes; the pilot
   is DEC-27's surface only. CHECK is sequenced first AFTER the pilot (DEC-55).
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
