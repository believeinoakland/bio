# Process inventory: every process the system offers a user, mapped onto the path

Written 2026-08-01 (research pass). **This file asserts nothing it did not measure.**
Every claim about the code names the file it came from; anything not verified in this
pass is labelled UNVERIFIED rather than guessed.

Companion to, and NOT a replacement for: `MILESTONES.md` (the capability ladder),
`UI-PLAN.md` (the rung ladder and its 2026-07-31 gap measurement, now stale — see
§1), `NOTIFICATIONS.md` (what may be PUT in the queue),
`architecture/BIO_Case_Making_v0_1.md` (the live design pass),
`architecture/BIO_Interaction_Constructs_v0_1.md` v0.2 (the two constructs).

This file did NOT claim an area in `CLAIMS.md` — it creates one document and edits
nothing else.

## The frame this inventory is written against

**The path:** questioning → exploring → discovering (understanding) → documenting →
impacting, **and** sharing the products outward.

**The member-facing constructs are FOUR** (`BIO_Case_Making_v0_1.md`, "THEY COLLAPSE"):

| construct | is | plane status |
| --- | --- | --- |
| `information` | a captured document with provenance | BUILT — `OBJECT_TYPES.INFO`, `bio-checks.mjs:24` |
| `inquiry` | a recursive claim structure; **`inquiry`** open → **`finding`** concluded → **`case`** published | **NOT BUILT.** The plane has `focus` (`bio-checks.mjs:24`, states `surfaced/elevated/deferred/dismissed` at :57) — that is the FIRST phase only. There is no concluded phase, no published phase, and no basis recursion |
| `action` | outward engagement with a counterparty | BUILT as an object — `bio-checks.mjs:74` states, `:1288` `action_kind`/`risk_tier`/`counterparty`/`resolution`/`clock` |
| `project` | a workspace with membership and access control | BUILT — `bio-checks.mjs:65`, plus ten `project*` ops in `bio-plane/src/index.mjs:228-243` |

---

## 1. What was measured, and when

Instrument: `bio-plane/src/index.mjs` `OPS` table (lines 201-546) parsed for op names
and `classes:`; `civicos-ui/app.html` (6,864 lines) parsed for real call sites
(`rec(`/`recPost(`/`api(` and `op=` inside `URLSearchParams`), with `/* */` block
comments stripped first — **this matters: `linkproject`, `connect`, `cite`, `sever`,
`retire` and `instance` all appear in `app.html` only inside comments.** Date
2026-08-01.

| | UI-PLAN measured 2026-07-31 | measured here 2026-08-01 |
| --- | --- | --- |
| ops the plane declares | 85 | **108** |
| ops reachable by a member class (incl. `classes:null` public) | 63 | **94** |
| distinct ops the member UI reaches | 18 | **34** |
| member/public-reachable ops with NO caller in `app.html` | — | **60** |

**`UI-PLAN.md`'s "measured gap" section is stale in both directions** and should be
re-measured before it is used to schedule anything: the plane grew 23 ops (the FW-6→10
entity/progression family and REC-6/7/9) and the UI grew 16 (UI-1 … UI-9, all `done`
in `QUEUE.md`). Three of the six families it names as unsurfaced now have surfaces
(tasks, part of governance, part of members); three do not.

The 34 the UI reaches: `acquire allocid adminarith attest capture captureprogressions
concerns connections dispose entity entitybyalias image instance lease links list login
memberlist projection projectownerarith projectownerremove projectparticipants promote
proposals proposedispose publishedmanifest release resolutions search select taskforward
taskresolve tasks whoami`.

---

## 2. Processes that EXIST — a user can reach them today

"Reachable" means a call site in `civicos-ui/app.html`. Audience column: where the repo
grounds a difference it is cited; where it does not, the cell says **undifferentiated**,
which is itself the finding (see §5).

| # | process | what the user is trying to do | path verb | constructs | plane ops backing it TODAY | where | audience |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P1 | **Sign in and learn what I may do** | find out my capability surface before I try something | — | — | `login`, `whoami` | `app.html` `buildRail` :857 (a capability a member lacks is ABSENT, not greyed) | undifferentiated |
| P2 | **Orient — what needs me** | see the record's asks in one place | questioning | inquiry (as `focus`) | `tasks`, `proposals` | Home, UI-8, `renderHome` | undifferentiated |
| P3 | **Read the record** | see everything the group holds | exploring | all four | `list`, `projection`, `image` | Record screen, `renderRecord` :951 | undifferentiated |
| P4 | **Search the record** | find material by term/field | exploring | information | `search` | `renderSearchScreen` | undifferentiated |
| P5 | **Read one document in depth** | understand a document and its standing | exploring, discovering | information | `image`, `capture` (GET), `links`, `resolutions`, `connections`, `captureprogressions` | `openBundle` :1250, four strata (U3), structure panel (UI-9) | undifferentiated |
| P6 | **Open the captured bytes and verify them myself** | confirm the record holds what it says | discovering | information | `capture` GET by hash | `resolveSnapshot` :1345-1391 (U4/U7): one altered byte refuses the whole render | undifferentiated |
| P7 | **Capture a document into the record** | put evidence in, with provenance | documenting | information | `acquire`, `capture`, `allocid`, `lease`, `promote` | Add surface, U8, `renderAdd` :6469 | undifferentiated |
| P8 | **Write down a question / a line of work / something to do** | record what I know or want to pursue | questioning | inquiry (as `focus`), project, action | `allocid`, `promote` | Add surface, `ADD_TYPES` :6457 — four kinds offered | undifferentiated |
| P9 | **Triage a question** | defer or dismiss a focus, with a reason on the record | questioning | inquiry (as `focus`) | `select` + `dispose` | UI-2, the first ACT: choose · pre-flight refusal · author (never prefilled) · receipt | undifferentiated |
| P10 | **Release collected → verified** | put my name behind "this is what it claims to be" | documenting | information | `search` → `select` → `release` | U5, Review screen + per-document; `canRelease()` :722 | undifferentiated |
| P11 | **Co-attest a capture** | strengthen a capture's standing via a timestamp authority | documenting | information | `attest` | UI-6; honest about the ceiling — `ATTEST_YIELDS_GRADE="B"`, never claims Grade A | undifferentiated |
| P12 | **Judge a derived proposal** | adopt / defer / dismiss a question the record raised | questioning | inquiry (as `focus`) | `proposals`, `promote` (adopt), `proposedispose` (defer/dismiss) | UI-5; carries the D-82 DERIVED badge | undifferentiated |
| P13 | **Dispatch a task addressed to me** | resolve or forward what the record asks of me | (attention layer — points at an act) | — | `tasks`, `taskforward`, `taskresolve`, `memberlist` | UI-1; partitioned Yours / Unassigned / With-others; `NOT_YOURS` fenced in the plane (REC-4) | undifferentiated |
| P14 | **Look up a subject** | see everything the record knows about an entity | exploring, discovering | information | `entity`, `entitybyalias`, `concerns`, `connections` | UI-4; Grade C rendered "plausible, not established" | undifferentiated |
| P15 | **See who holds power** | read the roster and the governance arithmetic | — | project | `memberlist`, `adminarith`, `projectownerarith`, `projectparticipants` | UI-7, read-only. States the founding-admin gap rather than inventing a row | undifferentiated |
| P16 | **Vote to remove a project owner** | cast a multi-party governance act | — | project | `projectownerarith` (denominator) + `projectownerremove` | UI-3. **This is the ONLY ballot with a surface**; the other nine `project*` ops have none | undifferentiated |
| P17 | **Watch what changed** | see re-eval flags and watched sources | exploring | information | `search`/`list` fields (`reeval_flag`, `monitor_enabled`) | `renderMonitoring` — **read-only; it does not call `op=monitor`** | undifferentiated |
| P18 | **Read the published record** | (public) read what the group stands behind | sharing | inquiry-as-`case` | `publishedmanifest` | `enterPublished` :6841 → `pubList`. **`pubOpen` is a stub** that says so: "Rendering the full public reading surface is gap G1" | media, activists, admins, lawyers — but the surface renders nothing to differentiate |

**Eighteen processes exist. Fifteen of them serve questioning / exploring / discovering.
Three serve documenting (P7, P10, P11). One serves sharing, and it is a stub. NONE
serves impacting.**

---

## 3. Processes the path implies and NOTHING provides

This is the part that matters. Grouped by the path verb they belong to.

### 3a. DOCUMENTING — the middle of the path

| process | what the user is trying to do | constructs | plane ops today | state |
| --- | --- | --- | --- | --- |
| **Cite evidence into a workspace** | say "this document supports what I am working on" | information → project | `op=cite` EXISTS (`index.mjs:327`, weight `report`, selection-backed) | **built in the plane, unreachable.** No caller anywhere outside docs and `coverage.mjs` — verified by repo-wide grep. This is UI-PLAN's U9, "the rung that turns a record into a case," and it was never built; QUEUE's UI-9 is a DIFFERENT item (document-page presentation). **The name collision is a live hazard.** |
| **Withdraw or restore a citation** | stop relying on something without deleting it | information → project | `sever`, `reinstate` (`index.mjs:348-349`, both require a reason) | **built in the plane, unreachable.** As planned the UI accumulates citations and can never withdraw one |
| **Retire a document** | mark material no longer relied on (terminal) | information | `retire` (`index.mjs:335`) | **built in the plane, unreachable** |
| **State a conclusion** | write down what I found, what it rests on, what would falsify it | **inquiry (finding phase)** | **NONE** | **not built anywhere.** `focus` has no concluded state (`bio-checks.mjs:57`: `surfaced/elevated/deferred/dismissed` — `elevated` is a terminal promotion, not a conclusion). A finding today is prose inside a project's `bundle.md` |
| **Rest one conclusion on another** | build a layered argument | inquiry (basis recursion) | **NONE.** `references[]` targets a bundle; `REL_VOCAB` carries `supersedes` (per the design pass) but nothing composes claims | **not built.** The design pass's central move — "a conclusion resting on conclusions is free" — has no schema |
| **Derive a claim's strength** | know whether this clears the bar my audience needs | inquiry | **NONE.** `op=connections`/`op=instance` compute a §8.1 grade over the *weakest end / weakest link* for DOCUMENT connections — the mechanism exists at the wrong altitude | **designed, not built.** `BIO_Case_Making_v0_1.md` obs. 3 + §"Division" item 4 |
| **Divide a malformed inquiry into two** | separate a thin leg from a strong one so the strong claim can publish honestly | inquiry | **NONE** | **designed, not built.** RULED by Bob; the design pass argues it is a doctrine requirement, not a convenience, because weakest-link composition otherwise forces overclaim-or-silence |
| **Hold a contradiction inside one case** | keep tension without resolving it (D-80) | inquiry | **NONE** | **not designed.** Open question 5 of the design pass |

### 3b. SHARING / OUTPUTTING — the end of the path

| process | what the user is trying to do | constructs | plane ops today | state |
| --- | --- | --- | --- | --- |
| **Publish what the group stands behind** | perform the boundary act — irreversible, signed | inquiry (case phase) | `op=ratify` EXISTS (`index.mjs:401`, capability `publish`, `NEEDS.ratify` :763) | **built in the plane, UNREACHABLE END TO END.** `ratify` has ZERO occurrences in `civicos-ui/app.html`. `tools/sign-release.html:401` produces the SSHSIG and tells the operator to "paste this into the ratify box on the instance page" — **there is no such box.** The ceremonial top rung of the weight ladder has no surface |
| **State what was excluded from a case, and why** | make the completeness claim attributable | inquiry (case phase) | **NONE** | **designed, not built.** The design pass's single surviving reason for `case` to exist; the gate is "has the author stated what was excluded", never prefilled |
| **Read a published case as narrative** | (public) read start to finish, check a hash, print it whole | inquiry (case phase) | `publishedmanifest` (reached), `publishedlist` + `verify` (unreached) | **designed (U12/G1), not built.** `pubOpen` in `app.html` is an honest stub |
| **Render a case for a particular audience** | select what clears this reader's threshold and say what was excluded | inquiry | **NONE** | **designed, not built.** Depends on strength, which depends on the finding phase |

### 3c. IMPACTING — the fifth verb

`action` is the substrate and it exists as an object. **Nothing operates it.**

| process | what the user is trying to do | constructs | plane ops today | state |
| --- | --- | --- | --- | --- |
| **Plan an outward action** | name a counterparty, a kind, a risk tier | action | `promote` writes the bundle | **half-built and dishonest.** `app.html` `mdFor` :1752 writes `action_kind: other`, `risk_tier: 1`, `counterparty: to be named` as literal placeholders. `bio-checks.mjs:1288` demands a real `action_kind` from a suite of seven and a non-empty `counterparty` — the UI satisfies the check with a stub the member cannot then edit |
| **Move an action through its lifecycle** | planned → active → awaiting_response → resolved/abandoned | action | **NONE.** `op=dispose` is focus-only; `op=retire` and `op=release` are information-only (`index.mjs:330-341`) | **not built.** No op moves an `action`'s state at all |
| **Record correspondence with a counterparty** | log what we sent and what came back | action | **NONE.** `## Correspondence` is a required heading (`bio-checks.mjs:47`) with no writer | **not built** |
| **Track an action's clock** | know when a statutory response is due | action | **NONE.** `bio-checks.mjs` C-11 validates a `clock` array with `pending/met/overdue/waived`; nothing writes or ages it | **not built.** D-86 (bias debt + temporal expectations are one shape) is deferred in REC-8 |
| **Link an action to the findings that justified it** | say WHY we wrote to the city | action ↔ inquiry | **NONE** | **not designed.** `BIO_Case_Making_v0_1.md` obs. 2: "the loop from evidence to action to consequence is the thing that is unbuilt" |
| **Record the consequence, and feed it back as evidence** | measure how the system responded to us | action → information | **NONE** | **not designed.** D-128's declared-vs-actual flow applied to our own intervention |
| **See a list of actions at all** | find the actions this group has open | action | `list`/`search` return them | **no surface.** `RAIL` (`app.html`:844) has Focuses and Projects and **no Actions entry**; `renderFiltered` is called for `focus` and `project` only. Actions appear only mixed into the Record list |

### 3d. JOINING, GOVERNING, LEAVING — process around the work

| process | plane ops today | state |
| --- | --- | --- |
| **Ask to join a group** (the doorbell) | `knock`, `inbox`, `inboxget`, `inboxresolve` | **built in the plane, unreachable.** `op=knock` has NO caller in any user-facing artifact — verified by repo-wide grep. A stranger cannot ask |
| **Accept an invitation** | `invitelook`, `enroll` | **built in the plane, unreachable.** No caller anywhere |
| **Claim a new instance** | `claim` | **built in the plane, unreachable** from any surface measured here |
| **Invite/join/leave/remove on a project** | `projectinvite`, `projectjoin`, `projectleave`, `projectremove`, `projectowneradd`, `projectfork`, `projectownerrescue` | **built in the plane, unreachable.** Seven of the ten S-12 §7 ops. Only `projectownerremove` (UI-3) and `projectparticipants` (read) have surfaces |
| **Declare / confirm expertise** | `expertisedeclare`, `expertiseconfirm`, `expertiselist` | **built in the plane, unreachable.** Two different claims by two different people — which is the point — and neither can be made. Also the input to D-98's task routing, so routing runs on a table no one can populate |
| **Export the record and know an export happened** | `export` (admin-token only), `exportlog` | **built in the plane, unreachable.** The sovereignty promise has no surface, and D-52's missing notification is unbuilt |
| **Register a subject / declare a relation** | `entitycreate`, `entityalias`, `relationdeclare`, `resolve`, `resolvetestify` | **built in the plane, unreachable.** UI-4 READS the registry (P14) and nothing WRITES it. The registry populates only via `op=promote`'s reading extraction plus REC-5's auto-derive |
| **Declare how an institution is supposed to work** | `progressiondefine`, `thread`, `discharge`, `progression`, `exceptions` | **built in the plane, unreachable.** This is D-128's DECLARED flow — the reference model the whole delta analysis rests on — and no member can author one |

### 3e. THE QUEUE ITSELF

`NOTIFICATIONS.md` catalogues ~30 generators in three classes. Measured against the
plane: the only task kind that exists is authority-undetermined (recorded in UI-1's
landing note), and `tasks` carries `open`/`forwarded`/`resolved` with no per-member
state and no clock (D-125). So:

- **~29 of ~30 catalogued generators have no producer.** The catalogue is an inventory
  of what exists to be numbered, and it says so; naming it here is not a criticism of
  the document but a measurement of the distance.
- **The `N-` id allocation, the `options`-from-the-producer rule, and the `per-item`
  weight have no implementation.** UI-1's screen is a task list, not the QUEUE
  construct: it does not group by case (DEC-10), carries no `class`, no `basis`, no
  producer-published options.
- **Mute/snooze/notification preference is designed (D-125) and unbuilt**, including the
  hazard the design names first: muting is personal, dismissing is a record act.

---

## 4. Processes that exist in the plane but NO user can reach

The requested flag, measured. 60 member-or-public-reachable ops have no `app.html`
caller. Removing plumbing and diagnostics that legitimately want no member surface
(`selftest`, `index`, `taskdrain`, `searchindexcheck`, `file`, `dangling`, `stats`,
`runtime`, `bootstrap` — the last is reached by `newgroup/src/index.mjs`), the
substantive orphans are:

**Ceremonial / doctrinal, and the most serious:**
`ratify` · `cite` · `sever` · `reinstate` · `retire` · `export`

**The whole joining path:** `knock` · `invitelook` · `enroll` · `claim` · `inbox` ·
`inboxget` · `inboxresolve`

**Project governance (7 of 10):** `projectinvite` · `projectjoin` · `projectleave` ·
`projectremove` · `projectowneradd` · `projectfork` · `projectownerrescue`

**Expertise:** `expertisedeclare` · `expertiseconfirm` · `expertiselist`

**Registry & framework writes:** `entitycreate` · `entityalias` · `relationdeclare` ·
`resolve` · `resolvetestify` · `connect` · `progressiondefine` · `thread` · `discharge`

**Reads a member would want and cannot get:** `searchfields` (the UI hand-composes
query syntax instead — the exact drift the op was published to prevent),
`selection`/`selectionlist`/`selectionrelease` (so the UI holds no keep-alive and never
learns what drifted), `sourcereach`, `archivelookup`, `governorstate` (so a stalled
capture still looks broken rather than PACED), `monitor`, `audit`, `pdfstructure`,
`reading`/`readingref`, `relation`, `progression`, `exceptions`, `signerlist`,
`exportlog`, `publishedlist`, `verify`, `linkproject`

**Two of these are worth stating as single sentences:**

1. **`op=ratify` — the act the whole two-bucket fence exists to gate — has no member
   surface, and the offline signing tool tells the operator to paste the signature into
   a box that does not exist.** Nothing this group produces can leave.
2. **`op=knock` has no caller anywhere.** Nobody can ask to join.

---

## 5. Audiences: what the repo actually grounds

The audiences (media / activists / government administrators / lawyers / open list) are
Bob's frame in `BIO_Case_Making_v0_1.md`. Measured against the code:

**The only place in the codebase where an audience-shaped vocabulary exists is
`bio-checks.mjs:1288`:**

    ['cpra_request', 'grand_jury', 'controller_referral', 'public_comment',
     'media', 'litigation_support', 'other']

That suite maps recognisably onto the audience list — `media` for reporting,
`litigation_support` for lawyers, `public_comment`/`controller_referral` for
administrators, `cpra_request`/`grand_jury` for activists and lawyers both. **It is a
field on `action`, and no surface writes it: `app.html` hardcodes `action_kind: other`.**
So the one audience-differentiated construct in the system is unreachable.

Everywhere else, differentiation is by CAPABILITY, not by audience —
`contribute` / `publish` / `administer` / view (`index.mjs` `NEEDS`, :690). That is a
different axis and it does not encode who a person is or what they will do with a case.

Consequences worth stating plainly rather than padding the tables with a column that
would read "undifferentiated" eighteen times:

- **Every built process (P1–P18) is used identically by all four audiences.** No surface
  branches on audience, and none should yet — the design pass's caution (§5, "designing
  for four archetypes simultaneously is the reliable way to build something that is
  nobody's") argues against inventing one before the second archetype arrives.
- **The one place audience difference is designed to live is claim strength** —
  "records suggest" vs "the record establishes" — and it depends entirely on the
  finding phase, which does not exist. So the audience question is not independently
  blocked; it is downstream of §3a.
- **The administrator case has one genuinely open sub-question** (design pass open
  question 7): an administrator's instance holds the body's own material, so what does
  the two-bucket fence protect there, and from whom. Nothing in the code addresses it.
  This is the ONLY audience-specific unknown that is not simply "build the finding".

---

## 6. Where the frame is contradicted, or the docs contradict each other

Named as findings, per the instruction.

1. **`focus` is not `inquiry`, and the collapse is not implemented.** The frame's central
   construct is one object with three phase names. `bio-checks.mjs:24` has `focus`;
   `:57` gives it `surfaced/elevated/deferred/dismissed`. There is no `concluded`, no
   `published`, no basis recursion, no completeness field. **The frame describes a
   ruling, not the code**, and any session reading the frame as a description of the
   system will build against something that is not there. Also: the rename cost the
   design pass states honestly (`problem` → `focus` → `inquiry`, a third name) has not
   been paid, and `LEGACY_TYPE_ALIASES` (`bio-checks.mjs:25`) is the precedent that
   will carry it.

2. **`DEBT.md` D-127 still carries the claim the design pass CORRECTED.** Row D-127
   item (d) reads "**The government-administrator archetype INVERTS the threat model**".
   `BIO_Case_Making_v0_1.md` §4 records Bob correcting exactly that on 2026-08-01 and
   marks the correction as doctrine — an administrator is a stakeholder like any other.
   The debt row is stale against a ruling made the same day, and D-127 is the row a
   session scheduling case-making will read first.

3. **UI-9 in `QUEUE.md` is not U9 in `UI-PLAN.md`.** `UI-PLAN.md`'s U9 is triage AND
   `cite`; `QUEUE.md`'s UI-9 is document-page presentation. UI-2 built the triage half;
   **the `cite` half was never built and is now invisible**, because a reader of QUEUE
   sees UI-1…UI-9 all `done`. `UI-PLAN.md`'s "Next session kickoff" section still says
   U9 is next.

4. **The milestone ladder still has no rung for the thing the system is for.** D-127
   says this explicitly and `MILESTONES.md` M0–M8 is unchanged: substrate and surfaces,
   no rung reading "a member can make a case". Consistent with the design pass being
   open — recorded so it is not read as an oversight.

5. **`information` is a member-facing construct in the frame and a construct the member
   drives in the code.** The design pass flagged this as "a real question rather than a
   formality" (is it a process construct?). Measured answer: the Add surface's primary
   affordance is creating one (`ADD_TYPES` :6457, the document block appears only for
   Information), and three of the eighteen built processes (P7, P10, P11) act on nothing
   else. **The code says yes, it is a process construct**, which supports the frame's
   inclusion of it.

6. **`action` passes its check with a placeholder.** `bio-checks.mjs:1291` refuses an
   empty `counterparty`; `app.html:1752` writes the literal string `to be named`. The
   check is satisfied and the record claims a counterparty it does not have. That is the
   overclaiming failure class this project's discipline exists to catch, in the one
   construct that carries impact.

---

## 7. Summary count

| path verb | processes reachable | processes with a plane op but no surface | processes with nothing at all |
| --- | --- | --- | --- |
| questioning | 4 (P2, P8, P9, P12) | 0 | 0 |
| exploring | 5 (P3, P4, P5, P14, P17) | ~12 reads | 0 |
| discovering | 3 (P5, P6, P14) | `resolve`, `connect`, `thread`, `progressiondefine`, `discharge`, `entitycreate`, `entityalias`, `relationdeclare`, `resolvetestify` | claim strength |
| **documenting** | 3 (P7, P10, P11) | `cite`, `sever`, `reinstate`, `retire` | **the finding phase, basis recursion, division, contradiction** |
| **impacting** | 0 | 0 | **everything: lifecycle, correspondence, clock, evidence→action link, consequence, even a list screen** |
| **sharing** | 1, and it is a stub (P18) | **`ratify`**, `publishedlist`, `verify`, `export` | **the completeness claim, audience rendering, the narrative surface** |
