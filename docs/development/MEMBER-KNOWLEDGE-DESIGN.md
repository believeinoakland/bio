# Member knowledge — the firsthand observation, the lead, and attribution (D-184, D-194)

**Status** · v0.1 DESIGN, written by session BOB #14 under Bob's standing delegation (mechanism is the architect's; the doctrine it serves was ruled by Bob on 2026-09-14 and is quoted, not restated). Amended the same day with five decisions from MK-1's build (§2, §3, §7). It closes the design act D-184 and D-194 owed — which BOB #14 had wrongly marked "verified: Program B" in a build order, until CONDUCT #4 found no such design at the artifact. **§2 and the §7 refusals that fall to MK-1 are BUILT by MK-1 (IC-133, IC-134, C-53) — `op=testify` writing the canonical-header bytes (`bio-testimony/1`, `Store.testimonyBytes`), the register's `authored` flag and its fence at `op=promote`, and the publication fence at `op=ratify`/`op=caseratify` (C-53.10–.12), which MK-3 lifts; §4 and §6 are not built (§3 is MK-2's, below); §5 (THE LEAD) IS BUILT by MK-4 (2026-09-18, IC-135 on I5, IC-136 on I3): the `leads` table, `op=lead`, `op=leadlook` writing `observation_log` under `authority_kind = 'lead'`, `op=leadread`, `op=leadshare`, and §7's lead-as-leg refusal as C-54.1 at every leg grammar; its visibility is BOB #14's ruling of 2026-09-18 as built: the author, a project's joined participants after the author's `op=leadshare`, a machine credential only within a member's minted scope, and no one else. The rest is not built by MK-4.** **§3 (THE GRADE) IS BUILT by MK-2 (2026-09-18, IC-142 on I3): `testimony` is a third axis in `GRADE_AXES` and `Store.STRENGTH_AXES`, at `TESTIMONY_GRADE` D and no other letter, earned from the register's `authored` flag and from nothing else (no attestation raises it); DEC-32's arithmetic composes it over its own population; a connection grade on an observation leg is graded like any leg's (BOB #15); §7's leg refusals are C-2.8 by name (`testimony-leg-capture-graded`, `testimony-grade-not-d`, and six more); a case member resting on testimony freezes a third strength row beside the two, and an ordinary one freezes exactly the two it always did. The case document's strength PRESENTATION on a member surface is Program B's and is not built (delegated to UI).** Amended 2026-09-18 by BOB #15 with two decisions: §3, an observation leg carries a connection grade like any leg; §5, no `op=stats` caller receives a lead count (the `admin` class included — corrected the same day, since no class can read every lead), `observations` counts non-lead rows for every caller, and the unbuilt internet-level frontier reader and its tally must gate lead rows. **REC-129 (integrated by CONDUCT #5) BUILT a first version of §5's counter rule and the internet level:** `op=stats`/`op=selftest`/`op=livefire` withhold `leads` and `observations` from member and probe, keeping both for the admin class (IC-144 — SUPERSEDED IN PART by the corrected ruling below). **REC-131 BUILT the corrected §5 counter rule (2026-09-18, IC-148 on I3): `op=stats`, `op=selftest` and `op=livefire` publish `leads` to no class, the admin token included; the log count is published to every class as `observationsNonLead` (without `authority_kind = 'lead'` rows) and the wire carries no `observations` key; `dbBytes` is the admin class's only, under a server-set `capacity` stamp; REC-129's `operator` stamp is removed; `purge`'s proof is taken from a private whole count and is unchanged.**, and `op=frontier&level=internet` applies lead visibility before grouping through `#leadReach` (IC-143), which satisfies §5's internet-level precondition. `node tools/status.mjs 2.firsthand`, `10.lead` and `13.attribution` are the status authority. as of 2026-09-18

**Place in the system** · Level 2. Serves construct 2 (intake), construct 8 (the inquiry's legs and strength), construct 10 (the frontier — the lead is its authored half) and construct 13 (attribution in a published case) of `docs/architecture/BIO_System_Design.md` §3. The doctrine is `docs/architecture/BIO_Content_Framework_v0_10.md` §14.4 and `docs/development/CONTENT-EXTENT-DESIGN-SPACE.md` §5.6 as amended; the attribution rule is `docs/architecture/BIO_Publication_v0_1.md` §7. It extends the capture-or-testify structure already built for correspondence (`schema.mjs`, the `correspondence` table, C-2.10) rather than inventing a second one.

**Incomplete sections** ·
- §3 — DISCHARGED by MK-2 (2026-09-18) as to the plane: the arithmetic was verified against `STRENGTH_AXES` and DEC-32 and is recorded in IC-142, which states the change additive in every answer but ONE — bare `leg:testimony` in the query language is now ambiguous (source or axis), and a refused arm is dropped while the rest of the query runs, so a caller ignoring the warning receives a superset; IC-142 argues both classifications and recommends MAJOR. STILL OPEN: how a member SURFACE presents a third axis beside the pair (Program B; delegated to UI in `CLAIMS.md`), and whether the ambiguous-arm treatment should refuse the whole query rather than drop the arm — a property of the query language since DEC-21's `leg:capture`, not of this axis, raised for the query language's owner rather than decided here.
- §4 — the attribution level is recorded at the act that brings a contribution into a CASE; which act that is — `op=caseratify`, or a per-member contribution act before it — is to be confirmed against how the case document's members are assembled (`published_case_members`) when MK-3 is built.
- §5 — the lead's surface (how a member writes one, where it is shown) is Program B's, the member-surfaces programme; only the object and its writer are here.
- §6 — an OPINION as a case element names its attribution and its exclusion from the basis; where it sits in the case document's layout is Program B's.

**Contents**
- [1. What is ruled](#1-what-is-ruled)
- [2. The mechanism: the member's words are the document](#2-the-mechanism-the-members-words-are-the-document)
- [3. The grade: a third axis, testimony](#3-the-grade-a-third-axis-testimony)
- [4. Attribution: chosen by the attesting member, carried with the act](#4-attribution-chosen-by-the-attesting-member-carried-with-the-act)
- [5. The lead: the same knowledge, before the search](#5-the-lead-the-same-knowledge-before-the-search)
- [6. An opinion is not evidence](#6-an-opinion-is-not-evidence)
- [7. What this refuses, and the negative controls](#7-what-this-refuses-and-the-negative-controls)
- [8. The decomposition](#8-the-decomposition)

---

## 1. What is ruled

Bob, 2026-09-14, in `CONTENT-EXTENT-DESIGN-SPACE.md` §5.6: *"absolutely, a member's own eyewitness knowledge can be
evidence — though it stands on the trust held by that member."* Amended the same day: *"A source may have agreed to speak
off the record to preserve their anonymity, which is also valid. A member may also express an opinion, which could be
attributed in a published case to the group, the project, to the member's cover, or to the member by name. The choice of
that attribution should be made by the attesting member."* And `BIO_Content_Framework_v0_10.md` §14.4: *a member's
firsthand observation is evidence — authored content standing on that member's trust, graded as testimony … the record
carries the chosen level with the act (designed with the member's lead).*

So four things are fixed and none is reopened here: an observation **is content**; it is **graded as testimony (D)** on the
member's trust; its **attribution** in a published case is the attesting member's choice among **group · project · cover ·
name**; and an **off-the-record source's anonymity is valid**.

## 2. The mechanism: the member's words are the document

**Decision: an observation is an authored INFORMATION bundle whose bytes are exactly the member's words**, registered like
any capture, so that it IS content in the record's one sense of the word — a `content` row requires a `capture_sha` in the
register (`schema.mjs`, `content.capture_sha NOT NULL`, *"the register's trust root"*) — and every reader already built
works on it unchanged: passage search over `capture_text`, extents, citation by `op=cite`, the published projection, and
byte verification.

**Why not a separate testimony table beside `content`** (the other shape): a second object that legs can point at is a
second citation path, and every reader — search, grading, the case document, verify — would have to learn it. That is
D-164's failure, the primitive built twice and drifting, arriving in the evidence model.

**What keeps this honest, and it is the half that matters.** A capture of a publisher's document and a member's authored
statement are different acts, and the register must never let one pass for the other:

- The bundle's register entry declares **origin `member` and actor class `member`** — both values already exist
  (`bio-checks.mjs` `ORIGIN_KINDS`, `ACTOR_CLASSES`) — and a new **`authored: true`** that only the testimony path can set.
  A member UPLOADING a document they obtained (origin `member`, not authored) stays what it is today.
- The author is **server-stamped** from the session, as every authorship in this plane is (the correspondence table's own
  rule: a caller naming the author would be a caller signing as somebody else).
- Two dates, kept apart as correspondence keeps them: **`observed_at`** (when the member saw it — authored) and the
  record's own time of writing.
- The bytes are the member's words **as written**. Nothing paraphrases, summarises or cleans them; an edit is a new bundle
  that supersedes, never a rewrite.
- **`observed_at` is REQUIRED** — a date or a UTC instant, never later than the record's clock (decided 2026-09-18 from
  MK-1's build; reversing it is small).
- **Two members' identical words are two testimonies and must not collide** (§3: a second witness authors their own
  observation). The register is keyed by the sha of the bytes, so the authored bytes carry a canonical HEADER above the
  words — the testimony's own id and its `observed_at` — which makes each testimony's sha unique **without an I5 key
  change**. **No author identity is ever in the bytes**: who the author is lives in the server-stamped record, and what a
  reader of a published case sees is governed by the attribution level (§4), which bytes carrying a name would defeat.
  (Found by MK-1's build, where C-53.6 refused the second of two identical observations.)

## 3. The grade: a third axis, testimony

`GRADE_AXES` is `['capture', 'connection']` (`bio-checks.mjs`) and `CAPTURE_GRADES` is `['A','B','C']`. DEC-21's amendment
defines the capture axis as *the act of reading a document in*. **Testimony is not that act**, so its D is NOT a capture
grade: grading an authored statement "capture D" would make one axis mean two things — how faithfully we obtained a
source's bytes, and whose word the bytes are — which is the combining DEC-21 exists to prevent.

**Decision: a third axis, `testimony`.** A leg that cites an authored bundle carries **`testimony: D`** and its capture axis
is **not applicable, and stated** — never an A, which would be true of the bytes (we hold exactly what the member wrote)
and would read as strength it does not have. A second member's attestation of an observation does NOT raise it: the
ruling is that it stands on the observing member's trust, and a co-signature is not a second observation. (A second member
who saw the same thing authors their own observation; the case then rests on two testimonies, each D.)

**The register's capture-grade requirement (C-18.1) gains an AUTHORED arm** — an authored bundle carries no capture grade
because none applies, and the check says so rather than demanding one (built that way by MK-1).

**Decision: a leg on an authored bundle carries a CONNECTION grade, graded exactly as any leg's is — neither refused nor
exempt** (decided 2026-09-18 by BOB #15 on MK-2's design gap). The two axes answer different questions: `testimony: D` says
WHOSE WORD the evidence is; `connection` says HOW DIRECTLY those words bear on the proposition — *"I saw the vendor's truck
at the Clerk's house"* is testimony D either way, and bears on *"the vendor was favoured"* only by inference. DEC-21 keeps
axes apart for exactly this reason, so a direct connection reported beside testimony D is the honest statement, not a
contradiction. **Refusing the connection grade would be the overclaiming direction**: with capture not applicable, an
observation leg would carry nothing on either axis the bar reads (the bar stays capture + connection), and a leg the bar
cannot see is a leg it cannot fail. The existing `grade_source = 'testimony'` on a CONNECTION grade — a member vouching for a
link between two documents — is a different thing that shares the word; MK-2's refusal of a bare `leg:testimony` naming both
readings is endorsed as the resolution. Reversal is small until a published case freezes a testimony leg's grades.

Strength arithmetic is unchanged in rule — DEC-32's weakest leg across AND, strongest branch across OR — and simply sees one
more axis. The interface consequence is §Incomplete's first entry.

## 4. Attribution: chosen by the attesting member, carried with the act

**Decision: the attribution level is recorded on the act that brings a member's contribution into a CASE**, per case
edition and per contribution, as one of `group | project | cover | name`. It is NOT stored on the observation, because the
same observation may be attributed differently in two cases, and the ruling puts the choice at attestation.

- **No default.** The level is a required field of the act, never prefilled (the reasoned rung of the weight ladder, and
  DEC-69's "the operative word is FORCED"): a member who has not chosen has not attested.
- **`name` publishes the member's actual name; `cover` publishes their cover** (Membership v2 §3); `group` and `project`
  publish the group or the project and no person. The record always knows the author (server-stamped); the level governs
  only what the PUBLISHED projection shows.
- **An off-the-record source is recorded by the member as a source's account inside their own observation, with no field
  that could hold the source's identity at all.** Anonymity is structural, not a redaction: a column that exists can leak,
  and one that does not cannot.

## 5. The lead: the same knowledge, before the search

§5.6's own framing: *the same member knowledge, before and after the search*. **After**, it is an observation (§2).
**Before**, it is a **LEAD** — *"I was told the contract was amended; look at the Clerk's March agenda."*

**Decision: a LEAD is an authored row** (`lead_id`, server-stamped author, the member's words, an optional locator the
member suggests, `at`) and it is **never evidence** — it cannot be a basis leg. It is the frontier's authored half:
following it is a look recorded in `observation_log` with **`authority_kind = 'lead'`, `authority = <lead_id>`** — a value
the table's vocabulary already reserves (`schema.mjs` `observation_log.authority_kind`) and that has no writer today
(`node tools/status.mjs 10.lead`). **Who may see a lead (decided 2026-09-18 from MK-4's build):** its AUTHOR; a project's
participants only after the author SHARES it to that project, as an authored, dated act; a machine credential only within
the scope a member minted for it — never an unfiltered machine read; and **everyone else receives exactly the answer a lead
that does not exist would receive**, so a lead's existence is not itself disclosed. A lead is a tip, and a tip leaked is a
source exposed.

**A COUNT IS A DISCLOSURE OF EXISTENCE, so the rule above binds counters too** (decided 2026-09-18 by BOB #15 from REC-129's
candidate, CONFIRMED at the code: `op=stats` admits `admin`, `member` and `probe` and returned `leads` instance-wide, so a
member diffing it across a colleague's authoring learns a lead was just written). **CORRECTED THE SAME DAY BY BOB #15, and the
correction is the ruling.** The first version handed these counts to *a caller who could read every row — for an
instance-wide count, the `admin` class*. **That caller does not exist:** `#leadVisibleTo` reaches no `class:*` credential and
deliberately bypasses `viewerPredicate`'s administrator arm, because the ruling names authors and participants and never
administrators. So the `admin` token reads no lead, and giving it the count was the overclaim the test was written to refuse
(REC-129 built that first version provisionally as IC-144; this supersedes it). **Decision:**
- **`leads` leaves `op=stats` for EVERY class.** D-113's purge proof — the reason the counter exists — is taken by `op=purge`
  from the store's own `stats()` before and after, not from the wire op, so nothing that needs the number loses it. Class
  versus the `administer` right does not arise: neither can read a lead.
- **`observations` stays on `op=stats` for every class, counting the log WITHOUT `authority_kind = 'lead'` rows**, the same
  number for every caller, and says so at the key. One meaning for every caller is not rule 7's defect; re-meaning a key per
  class would be. This keeps `OBSERVATION-LOG-DESIGN.md` §6's REC-110 premise 1 true: every tally at the three BUILT levels
  counts only non-lead rows (lead looks are level `internet`), and `op=stats` still publishes the whole non-lead count to the
  same audience. The purge proof's own count stays whole.
- **A SIZE IS A SIGNAL TOO** (decided 2026-09-18 by BOB #15 on REC-131's finding): `dbBytes` moves by whole pages when a
  lead of up to 128 KiB is written, so the rule reaches it — any observable whose change discloses that a lead exists.
  **`dbBytes` leaves `op=stats` for `member` and `probe`**; the `admin` class keeps it, because capacity is an
  operator need and its reading mixes every write — a coarse, stated residue, unlike the exact lead COUNT it no longer
  gets. **And one name, one quantity:** `op=stats`' narrower `observations` takes its OWN key; `op=purge`'s
  whole-log `observations` keeps the name it always had (`BOB.md` rule 7).
  **AS BUILT by REC-131 (IC-148, integrated by CONDUCT #5, 2026-09-18):** the wire key is **`observationsNonLead`**. It names its predicate, so a later existence-private construct cannot join the exclusion without another rename, and therefore without an IC. `op=stats` carries no `observations` key. `dbBytes` goes to the `admin` class only, through a SERVER-SET `capacity` stamp that governs `dbBytes` and nothing else and defaults CLOSED, so a door that forgets to stamp drops it. Measured on the suite: one lead near the 128 KiB cap grew the database by ~364 KiB, while a short lead moved nothing. (This bullet replaces the worker's own two bullets, which it wrote before BOB's ruling above had landed; BOB's text is the authority, and the worker's version is superseded by the merge.)
- **THE SCOPE of this rule is constructs whose EXISTENCE is ruled undisclosed — today the lead and its looks, and nothing
  else** (searched 2026-09-18: no other ruling in the corpus says a thing's existence is withheld). Every other `op=stats`
  counter (bundles, runs, content, …) stands under REC-110's ruling that an aggregate naming no bundle, subject or address is an
  operator fact. A construct later ruled existence-private joins this rule by that ruling, and its counter moves with it.
**And a precondition on the INTERNET level of the frontier — SATISFIED by REC-129 (IC-143, `#leadReach`), kept as the rule its reader must go on meeting:** `op=leadlook` writes `observation_log`
at level `internet` with the LEAD'S WORDS as `subject`, so whoever builds that level's reader MUST gate `authority_kind =
'lead'` rows by this visibility rule before serving them — and its TALLY must not count them for a caller who cannot see them — — an ungated reader there discloses the tip itself, not merely its
count. The document, content and meaning readers never see these rows (each filters on its own level; checked 2026-09-18). **Authoring writes only the row; the look is a separate op that MK-4 builds** (§3 forbids a look entry at authoring). What the look finds enters the record the ordinary way (a capture, then content); a lead
that finds nothing records `LOOKED_ABSENT` against itself, which is the internet level of the frontier (`status.mjs
9.internet`) finally having a writer.

## 6. An opinion is not evidence

The amendment lets a member express an **opinion** attributed in a published case. **Decision: an opinion is a case
ELEMENT, never a basis leg** — it carries the same four-level attribution (§4) and is refused as a leg by name, because a
leg is evidence and an opinion is a view about it. Keeping it out of the basis is what stops "I believe the vendor was
favoured" from reading as a supported finding.

## 7. What this refuses, and the negative controls

Each is a refusal in the catalogue and a control arm in the item that builds it:

- an authored bundle whose register entry claims origin other than `member`, or a non-authored bundle claiming `authored`;
- a leg on an authored bundle carrying any capture grade, or any testimony grade other than D;
- a second member's attestation raising a testimony leg;
- a case contribution act with no attribution level, or a level outside the four;
- an off-the-record account carrying a source identity (the control: add the field and watch the suite fail);
- a lead or an opinion cited as a basis leg;
- an author field supplied by the caller rather than stamped.
- **an authored bundle crossing the publication fence before the attribution-honouring projection exists (MK-3).** The
  author's handle is in the bundle's provenance document and the session log, so a published observation before MK-3
  would name its author with no choice made — and publish an off-the-record account by construction. The fence refuses
  an authored bundle, and a case whose members include one, BY NAME until MK-3 lifts it as its own act;
- **an import or replay path that writes an authored bundle other than through the testimony path** — the fence already
  refuses such a bundle (C-53.8); any future import or replay path must route through testimony, never around it.

## 8. The decomposition

Each item names its interface; none is queued until its design section here is read at the artifact by the builder.

| item | what | interface | depends on |
| --- | --- | --- | --- |
| MK-1 | the authored bundle: `op` to author an observation, register entry with `authored`, server-stamped author, `observed_at`; content rows over it | I5 (register), I3 (the op) | nothing |
| MK-2 | the `testimony` axis: grading, `STRENGTH_AXES`, DEC-32 arithmetic, the case document's strength presentation | I3 — additive or breaking, stated by the builder (§Incomplete) | MK-1 |
| MK-3 | attribution on the case contribution act, and the published projection honouring it — **its first acceptance condition is that no authored bundle can be published until this projection exists, and lifting the fence refusal (§7) is this item's own act**; off-the-record as a structural absence | I3 | MK-1; the case act identified (§Incomplete) |
| MK-4 | the LEAD: the row, its writer into `observation_log` (`authority_kind = 'lead'`), `LOOKED_ABSENT` against a lead | I3, I5 | nothing |
| MK-5 | the opinion as a case element with attribution, refused as a leg | I3 | MK-3 |

Surfaces for all five are Program B's and are not rowed here.
