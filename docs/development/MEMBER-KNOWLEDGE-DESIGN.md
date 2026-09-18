# Member knowledge — the firsthand observation, the lead, and attribution (D-184, D-194)

**Status** · v0.1 DESIGN, written by session BOB #14 under Bob's standing delegation (mechanism is the architect's; the doctrine it serves was ruled by Bob on 2026-09-14 and is quoted, not restated). Amended the same day with five decisions from MK-1's build (§2, §3, §7). It closes the design act D-184 and D-194 owed — which BOB #14 had wrongly marked "verified: Program B" in a build order, until CONDUCT #4 found no such design at the artifact. **§2 and the §7 refusals that fall to MK-1 are BUILT by MK-1 (IC-133, IC-134, C-53) — `op=testify` writing the canonical-header bytes (`bio-testimony/1`, `Store.testimonyBytes`), the register's `authored` flag and its fence at `op=promote`, and the publication fence at `op=ratify`/`op=caseratify` (C-53.10–.12), which MK-3 lifts; §3–§6 are not built.** `node tools/status.mjs 2.firsthand`, `10.lead` and `13.attribution` are the status authority. as of 2026-09-18

**Place in the system** · Level 2. Serves construct 2 (intake), construct 8 (the inquiry's legs and strength), construct 10 (the frontier — the lead is its authored half) and construct 13 (attribution in a published case) of `docs/architecture/BIO_System_Design.md` §3. The doctrine is `docs/architecture/BIO_Content_Framework_v0_10.md` §14.4 and `docs/development/CONTENT-EXTENT-DESIGN-SPACE.md` §5.6 as amended; the attribution rule is `docs/architecture/BIO_Publication_v0_1.md` §7. It extends the capture-or-testify structure already built for correspondence (`schema.mjs`, the `correspondence` table, C-2.10) rather than inventing a second one.

**Incomplete sections** ·
- §3 — the interface arithmetic for a third axis (how `STRENGTH_AXES` and DEC-32's weakest-leg rule present a testimony axis in `op=inquirystrength` and the case document) is named here and not worked through line by line; the builder of item MK-2 verifies it against `store.mjs` `STRENGTH_AXES` and DEC-32 before minting the interface change, and says whether the change is additive or breaking.
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
(`node tools/status.mjs 10.lead`). What the look finds enters the record the ordinary way (a capture, then content); a lead
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
