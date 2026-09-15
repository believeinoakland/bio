# BIO Publication, Audiences and Communications

**Status** · v0.1 DRAFT, written 2026-09-14 by session BOB #11 as the level-1 home of construct 13 of `BIO_System_Design.md` §3 (publication, audiences and communications), which that map named as having no current level-1 document. Awaiting Bob's review. It RULES NOTHING: every rule below is restated from the ledger it was ruled in — DEC-12, DEC-13, DEC-19, DEC-20, DEC-31, DEC-33, DEC-44, DEC-72, the publication fence of 2026-07-31, the audiences ruling of 2026-09-13 and the attribution ruling of 2026-09-14 — and cited. Completeness: complete at its level for what is ruled and built; the ceremony (DEC-33), the addressed output acts (DEC-31), the attribution surface and the catalogue of standards by audience are the explicit frontier (§9), each on a named trigger or in Program B. The one caveat a reader needs: `BIO_Communications_Platforms.md`, the April 2026 document that owned the platform half of this construct, predates the plane entirely and disagrees with the Roadmap on one vendor; this document takes the construct and leaves that document the platform selection it still owns. as of 2026-09-14

**Place in the system** · Level 1; the authority for construct 13. Depends on `BIO_Content_Framework_v0_10.md` Part I §12 and `BIO_Case_Making_v0_1.md` (the inquiry, the finding, the case as a production — construct 8), `BIO_Declared_Bias_v0_1.md` (the acknowledgement that accompanies every published case — construct 7), `BIO_Membership_Architecture_v2.md` §3 (cover and handle, on which the attribution levels rest — construct 1), `BIO_Intake_Doctrine_v1_1.md` and `docs/development/AUTHORITY-AND-TRUST.md` (the provenance chain the fence sits on — construct 2), `BIO_State_Rules_Consistency_v1_5.md` (the published states and `risk_tier` — construct 3). Level-2 beneath it: `BIO_Communications_Platforms.md` (the platform half: cross-group discussion, work-product hosting, the directory, the risk tiers) and `docs/archive/research/AUDIENCES.md` (the audiences pass, banner-corrected, cited as history). Depended on by `BIO_Interaction_Constructs_v0_1.md` (the rung ladder's top rung), `MILESTONES.md` M10, QUEUE REC-15 and UI-17, `MULTI-INSTANCE-ISOLATION.md` (the shared published bucket). Supersedes the construct-ownership claim in `BIO_Communications_Platforms.md`'s front matter and the scattered restatements in `BIO_Complete_Roadmap_v5.md` §8 and `BIO_Technical_Architecture_Decisions_v10.md` §Distribution risk tiering, which remain as the mission's and the decisions' words.

**Incomplete sections** ·
- §5 — the ceremony (UI-17) and the preflight (REC-15) are DEFERRED on DEC-33's trigger; the section says what they are, that UI-18 has landed (the trigger's first clause), that the second is unmet by measurement, and when the rows reopen (decided 2026-09-14).
- §6 — three output-act divergences (certification, persistence, addressing) are named and unmade; addressed delivery is deferred by DEC-31 on its own trigger with one binding rule.
- §7 — the attribution levels are ruled and have no surface; the catalogue of standards by audience and output act is owed and does not exist; both are Program B's.
- §8 — the risk tiers are half-built: the UI writes placeholder values that satisfy the check (D-182); stated, not fixed here.

**Contents**
- [1. What the construct is, and why it is major](#1-what-the-construct-is-and-why-it-is-major)
- [2. The objects](#2-the-objects)
- [3. The rules, stated once](#3-the-rules-stated-once)
- [4. What is built](#4-what-is-built)
- [5. The ceremony, deferred on a trigger](#5-the-ceremony-deferred-on-a-trigger)
- [6. Audiences and output acts](#6-audiences-and-output-acts)
- [7. Attribution, and the catalogue owed](#7-attribution-and-the-catalogue-owed)
- [8. Risk tiers, and what is dishonest today](#8-risk-tiers-and-what-is-dishonest-today)
- [9. Where it stands, and the frontier](#9-where-it-stands-and-the-frontier)
- [10. What this document does not own](#10-what-this-document-does-not-own)

---

## 1. What the construct is, and why it is major

Publication is the point where the record's trustworthiness becomes public and irreversible. Everything below it is the group's own — captures with provenance, content, meaning, inquiries and findings held to a bar — and publication is the act by which the group STANDS BEHIND a production and lets a stranger, with no credential and without this instance's cooperation, verify that the group said what it claims and rested it on what it says it did. It is the last rung of the authored ladder (release → stand behind → ground → conclude → accept → ratify → publish) and the only one that cannot be walked back: *"Publishing IS an irreversible act! It's (one of?) the only irreversible acts"* (Bob, 2026-08-03, DEC-19).

Three consequences give the construct its shape. The record must be able to prove later what it published — so the published projection is content-addressed, signed, and readable by tooling that is not BIO. What is published must not claim more than the record supports — so the fence sits on the provenance chain, the bar on the project, and the bias travels with the case. And a correction moves forward, never back — so a published case is revised as a new EDITION, and the history is what may never change.

## 2. The objects

| object | what it is | ruled |
| --- | --- | --- |
| **a case** | a production of a PROJECT, composed of one or more findings, some load-bearing; *"a case is a different object, not just a different phase of a finding"* | DEC-72, DEC-44 |
| **the bar** | the standard of evidence a production is held to — a property of the project (`required_strength`, strictest wins), never of an inquiry or claim; every load-bearing finding meets it; non-load-bearing findings may appear and are not presented as load-bearing | DEC-72 |
| **an edition** | a published case is revised as a new edition, incremented, treated as a separate document; a citation names an edition; supersession is surfaced, not followed; what may change between editions is everything and what may not is the history | DEC-12 |
| **the exclusion statement** | the authored statement of what was left out — authored fresh per edition, never byte-identical to the last (C-21.1); a case cannot be signed before it is authored | DEC-12; M10 |
| **the bias acknowledgement** | the declared bias the case was produced under, public, accompanying every published case; hunches are the one bias that must be cleared first | DEC-20 |
| **the case document** | the signed artefact, format `bio-case-document/1`: id, edition, project, scope, findings roster with the load-bearing partition, the version hash per member, the completeness block, the exclusion list, `required_strength` (C-41.1 … C-41.12) | CASE-5b |
| **the published projection** | the `published_*` tables and the `PUBLISHED` R2 bucket — a second, structurally separate store that the public read path answers from and nothing else does | §4 |

## 3. The rules, stated once

1. **One-way.** Publication cannot be undone; below it, acts *"cannot be undone SILENTLY"* and a correction always moves forward (DEC-19). A claim can be removed from a finding, rescinding it to an inquiry; the published edition stays.
2. **Only a project publishes, and only its manager.** *"Only findings that are part of a project can be published"*; the publisher is a manager of the project, by default its owner; a case requires at least one load-bearing member (DEC-72).
3. **The fence is on the provenance chain, not the content axis.** A bundle at or past `verified` carries a chain per captured document; every hop names WHO; content authority may be undetermined but must be *"STATED, dated, and carried into what the public reads. Silence is refused"* (C-18.9; Bob, 2026-07-31). What a published hash claims is *"these bytes, this address, this date, this chain of custody"* — and no more. The fence moved here from the content axis so that a gate never pressures anyone into inventing an attribution.
4. **Bias is public; hunches are cleared first.** *"Not all bias needs to be cleared before a piece is published. The only bias type that must be clear before publication is hunches"* (DEC-20); hunch debt is publication-disqualifying (`schema.mjs`), and since PL-8 it is enumerable (`leg:hunch`).
5. **Inheritance is per axis.** A leg on a published case says `grade_source: inherited`, names an edition, and cannot be stronger than the case beneath it on either axis (C-21.2).
6. **The subject's right of reply is a declaration, not a gate**: the publisher's determination and justification are an element of the group's recorded bias (DEC-13).
7. **Attribution is the attesting member's choice.** A member's material contribution to a published case — an observation or an opinion — is attributed at one of four levels, chosen by that member: the group, the project, the member's cover, or the member by name; a source who spoke off the record to preserve anonymity is valid (Bob, 2026-09-14, amending the same day's naming rule). The record carries the chosen level with the act. Cover and handle (Membership v2 §3) resolve in favour of member choice, the cover being one of the four.
8. **The standard of proof attaches to the production, set by the project's bar and the audience's needs** — not to a claim object, which is not needed for it to vary, and not to an individual member's role (Bob, 2026-09-14, confirming the record's shape with one correction accepted: *"Okay"*).
9. **Anything leaving the instance addressed to someone carries hash, date, author and both threshold floors in-band** (DEC-31's one binding rule, ahead of the deferred design).
10. **The public read path is credential-free and pinned to the record namespace**: `op=verify` and `op=publishedmanifest` answer from the published projection only, need no credential, and let *"any member or any stranger rebuild and independently verify the published record without this instance's cooperation, permission, or continued existence"*; a scratch namespace is deliberately unreadable there.

## 4. What is built

- **The acts and the reads** (`index.mjs`): `publish` (the state act, REC-14), `ratify`, `caseratify` (the case-document signing ceremony, CASE-5b), `caseflags`, `casedocument`, `publishedcase`, `publishedbytes` (with the container form), `publishedmanifest`, `verify`, `basisversions`, `versionchain`, `affordances`; `export` is refused via a session because the public record needs no credential.
- **The checks** (`bio-checks.mjs`): C-18.9 the fence (three distinct refusal codes for an absent, malformed or empty chain); C-21.1 the completeness gate (statement and acknowledgement fresh per edition); C-21.2 inheritance per axis; C-41.1–.12 the case-document family; C-2.8 the published-state entry requirements (edition ≥ 1, `published_strength` on both axes, grounds per branch); C-3.1 the required headings; C-29.1 the store's refusal of a machine stamp.
- **The projection and the fence, structurally**: the `published_*` tables and the `PUBLISHED` bucket, a second store the public path reads and nothing writes except the publish act; the installer creates the bucket. The fence across GROUPS is not yet structural — one account's instances share one bucket today (`MULTI-INSTANCE-ISOLATION.md` row 2).
- **The surfaces**: O2, the published case (UI-18); the public verification surface (UI-35/36/37/40 — including the correction that a plane refusal must never render as a substantive negative); the DEC-33 placeholder entry point (UI-17a).
- **The case arc** (CASE-1 … CASE-6, CASE-5b): a case as a production, its flags, its roles, its document and its ceremony of signing — all landed.

## 5. The ceremony, deferred on a trigger

Bob, 2026-08-03: *"The publication process is very involved. Defer anything related to the process, though create a placeholder surface"* (DEC-33). Deferred: UI-17 (the five-step ceremony) and REC-15 (the preflight that refuses `UNCLEARED_HUNCH` and `BELOW_PROJECT_STRENGTH` before any signature exists). Not deferred, and since landed: editions, the published reads, the published case surface. The re-entry condition as recorded: *"the chain through UI-18 has landed and a group needs to publish without its operator."* UI-18 has landed. The second clause is not met, by measurement: the only instances the record names are the project's own and the smoke instance, both operator-run. Decided 2026-09-14 by BOB #11 at Bob's delegation: the ceremony is designed inside Program B when Bob turns to the member surfaces, and REC-15 and UI-17 reopen then or when a sovereign group is installed, whichever comes first — no further ruling is needed. Until then a member reaches the placeholder and is told, once, what is not yet there (DEC-69).

## 6. Audiences and output acts

The eight audiences are the professional roles (Bob, 2026-09-13) — and an audience is a READER of a published case, distinct from the requirements' user types and archetypes, though one person may be both (D-156). `AUDIENCES.md` §10 catalogues their output acts, and its verdict is the rule this construct builds by: every divergence between audiences is *"a property of the OUTPUT ACT rather than of the case: who certifies it, whether it persists, and to whom it is delivered."* The falsifiable form: *"If the second audience built costs a new `action_kind` and a rendering, this is right. If it costs a field on the case, it is wrong."*

Three divergences are named and unmade:

| divergence | what it is | where it stands |
| --- | --- | --- |
| **certification** | who stands behind the rendering — the group, or a named professional whose licence the output act needs | unmade; the attribution levels (§7) are the member's half of it |
| **persistence** | whether the rendering persists as a published edition or is produced for one use | unmade |
| **addressing** | delivery to a named recipient with no public bucket | DEFERRED by DEC-31 on its own trigger, with the in-band rule (§3.9) binding now |

## 7. Attribution, and the catalogue owed

Two things Bob ruled on 2026-09-13 and 2026-09-14 are designed in Program B and rowed nowhere yet: the attribution SURFACE — the attesting member's choice among the four levels, made at the act and carried with it, the off-the-record source and the whistleblower case as instances of that choice rather than exceptions to a naming rule — and the CATALOGUE OF STANDARDS by audience and output act, which is the research §5.5 of the D-164 study says is owed once the claim object was found unnecessary. The catalogue is what lets a project set its bar against what its audience actually needs; without it `required_strength` is a number a project picks.

## 8. Risk tiers, and what is dishonest today

Evidence packages are classified in three tiers — file freely; file with caution; do not file without counsel, publishing the evidence and withholding the filing templates — because *"a poorly filed Tier 3 case could create adverse precedent that forecloses future, properly constructed challenges"* (`BIO_Communications_Platforms.md`; Roadmap §8). The field is `risk_tier` on the action schema (State Rules v1.5). What is built is half of it and the half is dishonest: the UI writes `risk_tier: 1`, `action_kind: other`, `counterparty: to be named` as placeholders that satisfy the check (D-182; the process inventory's P-48) — a required field filled to clear a gate, the defect this document's construct exists to refuse. Stated here so it is not derivable only from a debt row.

## 9. Where it stands, and the frontier

| | status |
| --- | --- |
| one-way publication, editions, the bar on the project, the fence on the chain, bias public, per-axis inheritance, right of reply as declaration | RULED and BUILT |
| the case as a production, its document, its signing ceremony, the published projection, the public verify surface | BUILT (CASE arc; UI-18, UI-35–40) |
| the ceremony (UI-17) and the preflight (REC-15) | DEFERRED (DEC-33) — UI-18 has landed; the second clause is unmet by measurement; reopens with Program B or the first sovereign group, whichever first (decided 2026-09-14) |
| attribution levels; off-the-record sources | RULED 2026-09-14; no surface (Program B) |
| the catalogue of standards by audience and output act | OWED (§5.5 of the D-164 study); does not exist |
| certification and persistence divergences | unmade |
| addressed delivery | DEFERRED (DEC-31); the in-band rule binding |
| the completeness statement's search record | DESIGNED (`OBSERVATION-LOG-DESIGN.md` §6, D-196); not built |
| risk tiers | half-built and dishonest (D-182) |
| the directory (Function 3) and cross-group discussion (Function 1) | selection recorded in `BIO_Communications_Platforms.md`; no built surface serves the directory |
| the publication fence across groups in one account | not structural (`MULTI-INSTANCE-ISOLATION.md` row 2) |
| a loosened fence filed in the open | IC-61 / D-280(a) |

## 10. What this document does not own

The inquiry and the finding (`BIO_Case_Making_v0_1.md`; Part I §12); the bias doctrine (`BIO_Declared_Bias_v0_1.md`); cover, handle and who may act (`BIO_Membership_Architecture_v2.md`); the platform selection and its prices (`BIO_Communications_Platforms.md`); the interaction constructs the ceremony will run in (`BIO_Interaction_Constructs_v0_1.md`); the isolation of the published bucket per instance (`BIO_Distribution_v0_1.md`, `MULTI-INSTANCE-ISOLATION.md`); and every ruling, which stays in the ledger it was ruled in.
