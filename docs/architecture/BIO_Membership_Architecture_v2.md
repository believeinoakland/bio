# BIO Membership Architecture

**Status** · The membership construct: cover and handle, administrators and the two-administrator floor, capabilities, burner-URL invitations, project participation and ownership, secure verified export. "v2.0, July 26, 2026", a "first-class architecture document, peer to BIO_Technical_Architecture_Decisions, BIO_State_Rules_Consistency, and BIO_Functional_Architecture", "specified by Bob Krause in session, July 24 and July 26, 2026", with per-section "Confirmed" dates; it supersedes v1.4 with a change table of every difference and is the specification the build works from. Complete at its level for §§1–8 and §10; §9 is self-declared architecture debt and §11 a pre-ship list with two cross-document items unenacted. The caveat: the root of trust is unmodelled, so every claim about it reads as "whoever controls the hosting account." §7 gained the design for D-422 (the founder's session sees what an administrator sees; one session resolver; the id `admin` reserved) on 2026-09-18, built by REC-132; and §4's *direct nothing* ENFORCED at every act that changes a project, built by REC-134 (IC-152, C-56) — a positional check, never the visibility gate, with §7.13 the one administrator path; and §7.9's *uninvited* position ENFORCED at every project-targeted ACT, built by REC-138 (IC-155, D-426) — a project the caller cannot see answers exactly as one that does not exist, and sight is asked before position; and §7's case-ratification bullet BUILT by REC-137 (IC-154, C-57): a case is committed only under an OWNER's signature, and delivered only by a joined participant of the project or the founder; and BOB #15's *what a refusal may say about a project the caller cannot see* PARTLY BUILT by REC-139 (IC-156, D-428) — `NAME_TAKEN` names no other project, a run's report counts only the citing projects its caller can see; plane-minted project ids decided by BOB #15 and BUILT in the plane by REC-141 (IC-158, C-59), with an OPAQUE random suffix per BOB #16 (a minted id carries no count); the surface half is UI-66 (landed together); and the case-ratification bullet applied at `op=ratify` by REC-140 (IC-157, D-429): a project bundle is refused outright, and a finding a ratified case pins takes the same two questions through one helper. §7.14 designs Bob's DISCOVERABLE-or-HIDDEN ruling and the request to join (BOB #16, 2026-09-19), and its step 1 is BUILT by REC-149 (IC-231, C-70, 2026-09-23): the owner's recorded setting, `Store#sight`'s three levels, the positional refusal at EXISTENCE and the directory — and its step 2, THE REQUEST TO JOIN, is BUILT by REC-150 (IC-320, C-95, 2026-09-25): ask at EXISTENCE (one open per member per project), withdraw, an owner's GRANT that writes `invited` and never `joined`, DECLINE, the LAPSE when a project goes hidden, and the requests read; and BOB #32's ruling (a) BUILT by REC-196 (2026-09-25): a READ naming a discoverable project's OWN id is answered positionally at EXISTENCE too (C-70.1, one check at the store's door over `Store.PROJECT_NAMING_READS`), while a read naming anything inside it still answers as absent; and BOB #32's ruling (b) BUILT by REC-197 (2026-09-25, C-97): create and fork take one optional `visibility`, absent is HIDDEN, an ownerless creation's `discoverable` is refused by name; the DEC-63 amendment's application is stated in §7 and BUILT by REC-145 (IC-162, 2026-09-19): a run over a question consults no project, a run over a project keeps the joined gate. A minted id of a gated object carries no count (BOB #16, 2026-09-19); the gated set is that PREDICATE rather than a closed list, and `TASK` is in it (BOB #17, 2026-09-19) — BUILT for every gated prefix by REC-141 and REC-151 (IC-164, C-59.5): one CSPRNG minter `Store#mintOpaqueId`, and `op=allocid` refuses every gated prefix; and since D-432 (IC-170, 2026-09-21) a gated id is NEVER DRAWN AGAIN, purge or not — the minter consults a purge-exempt ledger, `minted_ids`, beside `seq`, so a citation of a purged object keeps meaning that object. Tick and close are the run's principal's (BOB #16, 2026-09-19), BUILT by REC-152 (IC-165, C-22.12); a run's context kind is checked, a machine sees no more than its principal and the kind is a closed vocabulary (BOB #16), BUILT by REC-153 (IC-163, C-22.11); the stored mislabelled runs counted at 0 (M-68). §4.7's vote and §4.9's capability edit BUILT by D-136 (2026-09-19): `op=adminendorse`, `op=adminremove` and `op=membercaps` reach a signed-in administrator's session and their `by` is stamped by the SERVER, so the consensus arithmetic no longer rests on an attribution the caller supplies; an operator bearer token is refused by name (C-32.17), D-421's ruling applied to a roster position rather than a signature. The three sit in BOTH session sets because `kind` is `admin` for the FOUNDER'S session alone — the one design call, argued in §4.7. REC-156 (2026-09-21) closed the fourth: `op=memberadd`'s `by` is server-stamped too, so a proposal records its proposer's own endorsement and nobody else's, and a bearer's records none; a bearer is not refused, RULED by BOB #22 (§4.7). REC-159 (2026-09-23) closed §4.9's four custodial acts: `op=memberadd`, `op=memberset`, `op=signeradd` and `op=signerset` reach EVERY administrator's session (both session sets, `CUSTODIAL_ACTIONS`), their `by` is server-stamped, a member who is not an active administrator is refused `NOT_AN_ADMIN` by the store before any lookup, and the last three record the stamped actor in a new `status_by` column that reads `not recorded` where nothing stamped it; the operator's `admin` and `probe` bearers keep all four (BOB #22), and the MEMBER_TOKEN bearer and an `ai` credential stay refused (§4.7). Since D-610 (2026-09-25, on BOB #35's ruling in §4.9) EVERY writer of `members.status` writes `status_by`, naming the actor whose act caused that transition — the inviter or proposer at `memberadd`, the administrator whose vote completed a §4.7 endorsement or removal (the removal's cascade onto the member's keys too), the enrolling member at `enroll` — so no status reads under an actor who did not set it; rows written before read as they are, never back-filled. `op=governorconfig` is the OPERATOR's act — the founder's session and the ADMIN_TOKEN holder — and not an administrator's (§4.9, RULED by BOB #23, 2026-09-21); its refusal's corrected sentence is BUILT since REC-162 (2026-09-25): `SESSION_ROLE_CANNOT_REACH_OP` names the SESSION that reaches the op, derived from the `SESSION_OPS` set that holds it — *reserved to the founder's session*, `reachedBy: founder` — and no longer calls the op an administrator's nor an enrolled administrator's role `member`; with it, `AI_SCOPE_BEYOND_MEMBER_REACH`'s detail says a custodial act is reached by a member only from their own session rather than by no member. An id the counter issued for `CASE`, `DRAFT` or `RVG` before REC-151 is never drawn by the opaque minter, used or not (§7, RULED by BOB #23), as D-432 built it. §6's enrolment is BINDING ON SIGNING KEYS since D-158 (2026-09-20, C-63): `op=signeradd` and `op=signerset`'s activation refuse a member who is not `active`, and `op=signerlist` serves `member_status` and a derived `attests` from the SAME predicate `op=ratify` weighs a signature against — the roster had been reading `active` for a key the gate answers `SIG_UNKNOWN_KEY`, and the two were made to agree by the roster telling the truth rather than by the gate relaxing. 2026-09-21, at D-158's integration: the one body change is the residue count's citation, renumbered M-78 → M-79 because the id collided with a measurement taken on `main` without the allocator. §4.10 RULES REC-155's seven session routes (BOB #19, 2026-09-21), and its FIRST landing is BUILT by REC-155 (2026-09-25): the provenance pair and the three calibration writes reach both session sets, each driven from a member's, an enrolled administrator's and the founder's session to the op's own result; `livefire` and `reproject` are recorded unattended by decision and answer every session `MACHINE_CREDENTIAL_REQUIRED` citing §4.10; no class list moved; the provenance pair's bearer write closes in the second landing (REC-158), NOT BUILT. §8.1's NOTIFICATION half is BUILT since D-52 (2026-09-23): every `export_log` row is an `export-performed` FINDING (catalogue id N-1) in every administrator's queue and in nobody else's; transport beyond the app stays Bob's (D-98). WHICH PART OF THE RECORD a credential addresses is BUILT exact since D-456 (2026-09-23, IC-237, C-78): a `store=` naming anything but `bio` or `scratch` — a namespace that does not exist, a case variant, an empty value — is refused by name (`NAMESPACE_UNKNOWN`) for every class and the no-credential path, where it used to fall through to the real record; an absent `store=` is unchanged (probe → `scratch`, every other class → `bio`), so no credential is confined to `scratch` for life (NOT built; RECORD's). And since D-461 (2026-09-24, IC-250, C-78.2) naming `scratch` cannot silently reach the record either: the public ops that always answer from `bio` — thirteen on the c19-batch11 union (`knock`, `claim` and `reviewcomment` among them, which write) — refuse `store=scratch` by name (`NAMESPACE_PINNED`) where they used to answer from `bio`; the four that do address scratch (`invitelook`, `enroll`, `instancegroup`, and `groupidentity`, which joined the list at that union) are unchanged. §7.9 reached the RANKED READ by D-447 (IC-238, 2026-09-23): `op=search` computes relevance over the rows the viewer can see and publishes an ORDER, never a score, so revising a project an uninvited member cannot see leaves every field of that member's search answer byte-identical (measured before and after, MEASUREMENTS M-122; `project-sight.test.mjs` §7). §7.9 reached the COUNTS by D-464 (IC-254, 2026-09-24): every count a member session is served is taken through that member's own sight (M-124; `project-sight.test.mjs` §8). §7.9 reached the OBSERVATION LOG by D-486 (IC-258, 2026-09-24, on BOB #32): the five tallies a run's observation log feeds are taken through the reader's own sight, so a RUN over a project the reader cannot see leaves its attribution out while the evidence it produced stays shared — a hidden project's run had been published whole. §11 item 8's CATALOG half BUILT by D-50 (2026-09-23, C-77): `checkProjectNameUniqueness` judges a HANDED corpus and names every colliding pair of projects, deactivated ones included, by the ONE key the write path's `NAME_TAKEN` uses — `projectNameKey` moved into the catalog and `Store.projectNameKey` is that same function, asserted by identity. §7.14's DIRECTORY is BOUNDED since D-479 (2026-09-24, on SCHEDULER #17's finding at REC-149's integration): the one read that carries a discoverable project's existence to somebody outside it answers at most `PROJECT_DIRECTORY_LIMIT` projects, publishes the bound it applied and says whether more exists — measured by reading one past the cap, so a cut page and a complete one can never read alike; what a silent cut would have said about a project past it is exactly what this section reserves for a HIDDEN project; and its CANDIDATE READ is bounded IN SQL since D-497 (2026-09-24, the row D-479 reported rather than took) — sight gained the row source it reads, `project_sight`, an index derived from the owners' acts by one statement (`Store#reindexProjectSight`) and read by `Store#visibilityOf`, so the directory is ONE statement joining that index with `viewerPredicate`'s own compiled predicate NEGATED, the number of statements no longer grows with the group's projects, and the rule about what an owner's acts mean is stated in exactly one place. as of 2026-09-25 (UI-70: §7.14 step 3 built — the create and fork forms ask discoverable or hidden with neither preselected and send nothing unchosen, and the workspace carries the owner's control, read-only to everyone else; REC-197: BOB #32's (b) built, a creation or fork carries its setting and a machine's `discoverable` is refused by name; D-610: every writer of `members.status` names the actor that caused the transition; REC-196: BOB #32's (a) built, a read naming a discoverable project's own id answers positionally; REC-155: §4.10's first landing BUILT, five ops reach both session sets and `livefire`/`reproject` are recorded unattended by decision; REC-162: `governorconfig`'s refusal names the founder's session; REC-150: §7.14's request to join built; D-480: §7.9 reached the queue's shared-question candidates, a hidden project's citations take no slot in a bounded page; BOB #31: §7 leave and join ruled; REC-159: §4.9's custodial acts are every administrator's; D-461 the pinned public ops; D-464: §7.9 reached the counts; D-479: §7.14's directory bounded; D-497: its candidate read bounded in SQL over a sight index; BOB #32 and D-486: §7.9 reached the observation log, and a hidden project's run attribution is withheld while its evidence stays shared).

**Place in the system** · Owns construct 1 of `BIO_System_Design.md` §3 (membership and authority). It supersedes one decision of `BIO_Technical_Architecture_Decisions_v10.md` §10 (per-member tokens) and depends on `BIO_State_Rules_Consistency_v1_5.md` §4.3 (the project object) and §5.1–5.3 (the relationship vocabulary and edge ownership). It adds accountability and access control, not integrity; the store schema realises it.

**Incomplete sections** ·
- §9 — the root of trust is "recorded rather than fixed"; open as DEC-2 (deferred, with its trigger).
- §10 — a data-model "sketch"; "Concrete DDL belongs with the implementation."
- §11 — two cross-document obligations are unenacted: the Technical Architecture §10 annotation pointing here, and the project-name-uniqueness annotation on State Rules §4.3; the list also numbers two items "8."
- §4 (the 4.10 block) — REC-155's seven session routes are RULED (BOB #19, 2026-09-21) and the FIRST landing is BUILT (REC-155, 2026-09-25); the SECOND is not: the provenance pair's bearer WRITE stays open until REC-158 closes it by name. The capability a session needs for the five is `contribute`, PROVISIONAL — §4.10 ruled reach and is silent on capability, and `provenancechain`'s report arm (which writes nothing) is gated with its apply arm because `NEEDS` gates an op, not an arm.
- §7 — DEC-72 clause 5 adds an owner-only act (publish) absent here, and D-310/D-311 record that the affordance surface does not yet publish owner-gated publish or the roster acts.
- §7 — whether a PROJECT's own bundle may be published through `op=ratify` at all, and if so under whose signature and by whose delivery, is UNDECIDED (D-429): the case-ratification bullet decides a CASE, and REC-137 measured that an administrator with no role can publish a project's own document under a non-owner's signature. `op=caseratify` itself is BUILT (REC-137, IC-154).
- §7 — the hierarchy is stated in Focus terms "until the rename arc lands"; the live state machine is `inquiry` and the catalog marks `focus` legacy.
- §7 — 7.1 against 7.9 is RULED by Bob (2026-09-18, *"Keep project names unique"*): refusing a name tells an uninvited member only that a project with THAT name exists; `NAME_TAKEN` names nothing else (REC-139). Plane-minted ids are BUILT in the plane by REC-141 (next line).
- §7 — *"HOW the plane mints a project id"* is BUILT in the plane (REC-141, IC-158, C-59) and on the surface by UI-66 (landed together: the Add surface and the fork form send no id and show the minted one). The minted PROJ id carries NO count (BOB #16): its suffix is random from the CSPRNG, never `allocId`'s counter. The opaque-id rule for `CASE`, `DRAFT`, `RVG` (and `TASK`, by the bullet's own criterion) and `op=allocid`'s refusal of every gated prefix are BUILT by REC-151 (IC-164, C-59.5), through ONE minter `Store#mintOpaqueId`. An opaque id is no longer reissuable across a purge: D-432 (IC-170) gave the minter a purge-exempt ledger it consults, seeded at every boot from each gated kind's live rows and from the counter's pre-REC-151 range for `CASE`, `DRAFT` and `RVG`. What is not, and cannot be: an id that left every live table BEFORE D-432 landed and that no counter recorded — a `PROJ` or `TASK` counter id whose slug is gone, or an opaque id minted and purged before the ledger existed — because nothing in the store remembers it; an exact reissue of one needs its slug and its four digits again. `TASK`'s gating was ruled by BOB #17 (the §7 amendment dated 2026-09-19) and is no longer the builder's reading.
- §7 — DEC-63's run verdict: RULED by Bob (2026-09-18) and BUILT by REC-145 (IC-162). Who may TICK and CLOSE a run (the gap REC-145 pinned as built at ARM H6) was DECIDED by BOB #16 — the run's principal alone — and is BUILT by REC-152 (IC-165, C-22.12). The context KIND is checked at the open (REC-153, IC-163); the runs stored before it under a mislabelled kind were COUNTED at 0 on this account's instances (MEASUREMENTS M-68, DIST's `op=stats` reading), so nothing remains stored in that state here; an instance another group installed is unmeasured.
- §7 — a legacy project's caller-chosen id still answers `EXISTS` to a creation of another type at it: a stated LIMITATION with its closing path (the bullet "The legacy residue"); the opaque-id rule is BUILT for every gated prefix (REC-141 for `PROJ`, REC-151 for `CASE`/`DRAFT`/`RVG`/`TASK` and `op=allocid`). The legacy non-`PROJ-` project ids in the record namespace were COUNTED by REC-151 (MEASUREMENTS M-69): 0 on `biosmoke7` and 0 on `civicos` at 2026-09-19T11:17Z; an instance in another group's account is not reachable and is not counted.
- §7 (item 7.14) — DISCOVERABLE or HIDDEN and the request to join: DESIGNED (BOB #16, 2026-09-19); step 1 BUILT by REC-149 (IC-231, C-70, 2026-09-23), and every existing project reads HIDDEN; the directory PAGED with its bound published by D-479 (2026-09-24, SCHEDULER #17's finding — `PROJECT_DIRECTORY_LIMIT`, `limit` and `truncated`) and its CANDIDATE READ bounded in SQL by D-497 (2026-09-24 — `project_sight`, the owner-set-derived index the sight predicate itself reads, so the scan is no longer linear in the group's projects and the sight rule is stated once). Step 2, the request to join, BUILT by REC-150 (IC-320, C-95, 2026-09-25) — see §7.14's "Step (2) BUILT" paragraph. A creation or fork CARRIES its setting since REC-197 (2026-09-25, BOB #32's ruling (b)): one optional `visibility`, absent is HIDDEN, and an ownerless (machine) creation's `discoverable` is refused C-97.1. Step 3 BUILT by UI-70 (2026-09-25): the Add form's project arm and the fork form ask the creator, with NEITHER option preselected, and send nothing until one is chosen; the project workspace shows the setting as `op=projectvisibility` reads it, the OWNER changes it there, and every other viewer reads it with no control. NOT BUILT: step 4's surfaces (the directory, the request, the owner's request queue, the requester's own requests). UNDECIDED (REC-150's DESIGN GAP): a GRANT to a requester who has meanwhile been invited directly is REFUSED (C-95.8) and leaves the request open for the owner to decline or the requester to withdraw — the design names no rule for an invitation made while a request is open. REC-149's DESIGN GAP — a READ that names a project by id answering a caller at EXISTENCE as for a project that does not exist — RULED by BOB #32 (a) (2026-09-23) and BUILT by REC-196 (2026-09-25): every id-carrying read op is classified in `Store.PROJECT_NAMING_READS` (its bundle-id parameters) or `Store.PROJECT_NAMING_READS_NOT` (never a bundle id, with the reason), swept by `project-sight.test.mjs` §11; a read the control plane composes under another route name is seen only where it is mapped by hand (`affordances`).
- §4 (the 4.7 block) — `governorconfig` is RULED the OPERATOR's, not an administrator's (BOB #23, §4.9): it stays the founder's session's and the bearer's, and since REC-159 moved the four custodial acts into both session sets it is the ONE op the founder's session alone reaches; its refusal called the op an administrator's and an enrolled administrator's role `member` until REC-162 (2026-09-25) corrected it to name the founder's session, graded by `bio-plane/test/adminvote.test.mjs` §10 and `d270-refusal-truth.test.mjs` §5. (The four custodial acts themselves are CLOSED by REC-159, 2026-09-23, graded by `bio-plane/test/adminvote.test.mjs` §9.) A `status_by` recorded before REC-159 does not exist: every member and key row changed before it reads `not recorded`, which is stated rather than back-filled.
- §6 — a signing key registered BEFORE D-158 landed can still sit in an instance's `signers` table under a member who never enrolled. It is REPORTED honestly by `op=signerlist` (`attests:false`, `attests_why: member_invited`) and is NOT rewritten; no op can create another. COUNTED at 0 on both of this account's instances, 2026-09-20 (MEASUREMENTS M-79, read live against 0.68.0); an instance in another group's account is not reachable and is not counted.
- §7 (item 7.9) — COUNTS: BUILT by D-464 (2026-09-24, IC-254, MEASUREMENTS M-124; first measured by D-447, M-122). `op=stats` (and its `selftest` and `livefire` relays), `op=searchindexcheck`'s `counts.indexed` and `op=selectionlist`'s `bytes` are taken through the caller's `viewerPredicate`: a row naming a bundle the caller cannot see is not counted, so creating and revising a hidden project leaves a member's answers byte-identical (`project-sight.test.mjs` §8); an unfiltered credential's figures are unchanged. DECIDED 2026-09-24 by BOB #32 (02:30Z) on the question D-464 routed — *a hidden project's run output is the PROJECT'S THINKING until something outside uses it; the bytes stay shared, only the run's ATTRIBUTION is withheld* — and BUILT by D-486 (IC-258, MEASUREMENTS M-131): ONE predicate (`Store#hiddenSets`) drops a log row whose `authority_kind` is `run` and whose run's context is a project the caller cannot see, at ALL FIVE readers of `observation_log` together — `op=stats`' `aiRunLog` and `observationsNonLead`, and the document, content and meaning frontier `tally` fields (`project-sight.test.mjs` §9). The EVIDENCE is untouched: a capture, a content row or a reading such a run produced stays in every corpus count it was ever in (asserted, same section). `op=purge`'s `observations` stays WHOLE (§5), and the internet level's tally was already viewer-scoped (IC-143). REC-110's ungated-tally ruling (D-386) is NARROWED BY ONE ROW CLASS, not reopened: its premises (2) and (3) are untouched because this is an indexed SET SUBTRACTION and not a per-row resolver, and its premise (1) — that `op=stats` answers the same question to the same audience — is kept true by moving both doors in ONE landing. D-486 also fixed a defect its own arm found: `#frontierMeaning` gated a `capture` and a `reference` and returned true for everything else, reasoned for an ENTITY, so a run row (`subject_kind = 'unstated'`, a FOURTH kind) was published WHOLE with its run id to an uninvited member; it is now withheld row-whole through `aiRunLog`, the document arm's delegation. STILL NOT decided: `#missingContentCause` and `#missingMeaningCause` classify an absent look against `MIN(at)` over the WHOLE log, so a hidden project's run writing the earliest row at a level re-dates that watermark and flips an outsider's `missing_cause` from `purged` to `never_looked` for unrelated subjects — a RECLASSIFICATION rather than a disclosure (no id of the run, its project or its subjects appears), INTERMITTENT on a second-granularity comparison, and routed to Bob by D-486 because gating the watermark is exactly what `OBSERVATION-LOG-DESIGN.md` §6 argues against for a signed completeness statement (D-196). `#contentAxisTally` reads the same watermark and was not driven. And §7.9 reached the QUEUE'S SHARED-QUESTION CANDIDATES by D-480 (2026-09-24, MEASUREMENTS M-142): `#queueSharedInquiryCandidates` grouped over the UNGATED `refs` and took the first 64 `target_id`s, so a question only hidden projects shared became a candidate and TOOK A SLOT — measured at the op, two hidden projects citing 70 questions an uninvited member cannot see removed her own divergence FINDING from `op=queue` outright (`item_count` 1 -> 0) and would have moved the `inquiries_truncated` every item of this feed publishes. The read now subtracts `Store#hiddenSets`' `hid` at BOTH ends of the edge — the citing bundle and the target — which is D-464's and D-486's one set subtraction rather than a second sight rule, and is why it is not the per-viewer scan the method's own comment had refused. A `target_id` naming no bundle is in no hidden set and is untouched. (`project-sight.test.mjs` §10; control arms `d480-citers-ungated`, `d480-targets-ungated`, `d480-not-in-inverted`.) The `rows=passage` snippet over `capture_text_fts` is the same statistics-free FTS5 function as the search snippet and its rows order by identity, not by score — reasoned from the code, NOT driven by a hidden-revision arm.
- §4 (4.9) — the member SURFACE for the four custodial acts is BUILT by D-134 (2026-09-25; the paragraph closing 4.9's REC-159 block). Still without a member surface: the §4.7 votes (`adminendorse`, `adminremove`), `membercaps` and `expertiseconfirm`. Who INVITED a member is recorded (`members.invited_by`, BOB #35's ruling, BUILT by D-134 on every `memberadd` path, NULL before it reading `not recorded`); the three `members.status` writers that leave `status_by` untouched are D-610.

**Contents**
- [1. Why membership exists](#1-why-membership-exists)
- [2. What membership is NOT](#2-what-membership-is-not)
- [3. Cover and handle](#3-cover-and-handle)
- [4. Administrators](#4-administrators)
- [5. Capabilities](#5-capabilities)
- [6. Invitations](#6-invitations)
- [7. Projects](#7-projects)
- [8. Secure verified export](#8-secure-verified-export)
- [9. Architecture debt: the root of trust is unmodelled](#9-architecture-debt-the-root-of-trust-is-unmodelled)
- [10. Data model sketch](#10-data-model-sketch)
- [11. What must be true before this ships](#11-what-must-be-true-before-this-ships)

---

> **Editorial note, July 27, 2026 (Bob's directive):** the construct formerly
> named **Problem** is renamed **Focus** throughout, which conveys its purpose
> non-judgmentally. Machine literals shown here use the target vocabulary
> (`focus`, `focus@1`, `focuses/`, `focus.md`); the legacy literals (`problem`,
> `problem@1`, `problems/`, `problem.md`) remain valid aliases in existing
> append-only history and in code until the rename arc lands.

**v2.0, July 26, 2026.** First-class architecture document, peer to
BIO_Technical_Architecture_Decisions, BIO_State_Rules_Consistency, and
BIO_Functional_Architecture. Specified by Bob Krause in session, July 24 and
July 26, 2026.

**Supersedes v1.4.** Sections 2, 3, 6, 8 and 9 are carried forward unchanged.
The changes, all specified July 26, 2026:

| Where | v1.4 | v2.0 |
|---|---|---|
| 5 | administrators hold the capabilities on their row | administrators hold every working capability |
| 7.1 | project names unconstrained | project names unique across the instance |
| 7.2 | the owner invites participants | unchanged, and only owners invite |
| 7.7 | **only an administrator removes a participant** | **only an owner removes a participant** |
| 7.10 | absent | ownership is a set, with its own addition and removal process |
| 7.11 | absent | deactivation and reactivation, owner-only, as lifecycle states |
| 7.12 | absent | fork |
| 7.13 | absent | what happens when every owner of a project is inactive |
| 1.3, 4.9 | expertise is declared | declared by the member, confirmed by an administrator |

**7.7 is a reversal and not a gap.** v1.4 placed removal with administrators
deliberately, reasoning from Design Requirement 1 that authority over people
belongs to the custodial role. v2.0 places it with project owners instead:
participation in a project is a working relationship rather than a membership
one, and the people who can judge it are the people doing the work. Authority
over MEMBERSHIP stays custodial and is untouched. Any implementation carrying a
comment citing 7.7 for administrator removal is now wrong and must be corrected
rather than left to disagree in silence.

**Relationship to other documents.** This document supersedes one decision
in BIO_Technical_Architecture_Decisions v10 Section 10 (token mechanics),
which states that "per-member tokens are deliberately not used; the group
shares its infrastructure." That decision was made when every caller was a
script, a chat session, or the endpoint daemon. It did not contemplate
members holding browsers. Where this document and that decision disagree,
this document governs, and the earlier text should be annotated rather than
silently left standing.

Everything else in the existing architecture is unchanged. In particular,
the integrity model is untouched: record integrity continues to rest on
store-authoritative semantics (content addressing, base-sha CAS,
append-only history, the gate, signature-gated publication) and not on
identifying callers. Membership adds accountability and access control. It
does not add integrity, and must never be described as though it does.

---

## 1. Why membership exists

Four purposes, in the order they matter.

**1.1 A stable name, possibly anonymous.** A group needs a stable way to refer
to a participant across time without necessarily knowing, recording, or
being able to reveal who that participant is in the world.

**1.2 Attribution of consequential acts.** Specific acts must be
attributable to a specific participant:

- the source of hand-carried material entering the fence, as distinct from
  anonymous material arriving through the doorbell;
- ratification, the act that moves material from the working corpus into
  the published record.

An organization whose product is provenance must be able to account for
its own. Today every write is authored by the string "member," which is no
account at all.

**1.3 Declared expertise, and confirmed licenses.** A group needs to know
which participants are lawyers, CPAs, engineers, doctors, barbers. This is
operational routing information: who should look at a franchise-fee question,
who can read an ACFR, who is qualified to judge a Brown Act claim. It parallels
the group profile fields (expertise, credentials) in the Roadmap's Settings
category, moved to the level where the knowledge actually sits.

**An entry is declared by the member and confirmed by an administrator**, and
those are two different claims by two different people, kept separate for the
same reason BIO_Intake_Doctrine keeps who issued a document separate from how
faithfully it was captured. The member says what they hold. An administrator
says whether the group has satisfied itself that they hold it. Neither stands in
for the other, and the roster shows which of the two it is looking at.

**Confirmation gates nothing.** An unconfirmed entry costs its holder no
capability, no visibility, and no access of any kind. A member with an
unconfirmed law license does everything a member with a confirmed one does.
Confirmation records that an administrator vouched, so a group routing a Brown
Act question knows whether it is trusting a self-report or a checked one, and
that is its entire function. This is Section 5's rule that expertise informs
humans and gates nothing, holding exactly as written.

**Withdrawal supersedes rather than overwrites.** An administrator who
withdraws a confirmation writes a second entry recording who withdrew it and
when. The original confirmation stays readable. Every other record in this
system is append-only, and because confirmation gates nothing the reason here is
honesty of the roster rather than security: a group that can see a confirmation
was once given and later withdrawn is better informed than one that sees only
today's answer.

**1.4 Project participation.** Which participants are working on which
projects, and what they may see and do there.

## 2. What membership is NOT

**Not a security boundary.** The load-bearing fence is between the working
corpus and the published record: two buckets, and the published projection
has never held unratified material. Project visibility is organization,
not secrecy. Any participant credential, if compromised, exposes what that
participant could see. Interfaces must not imply otherwise, because a
member who believes projects are private will put things in the working
record that should not be there.

**Not integrity.** See the preamble. A hostile authenticated member can
corrupt the record no more than an anonymous one can.

**Not a network construct.** Membership is scoped to one group's instance.
An administrator is an administrator of that instance and nothing else.
This is what preserves Design Requirement 1: the network remains
distributed with no hierarchy, no headquarters, and no central authority,
because nothing here crosses a group boundary.

## 3. Cover and handle

Two names, assigned by two different parties, for two different purposes.

**Cover** is assigned by an administrator when the invitation is created.
It distinguishes one participant from another in the administrator's
roster. The word is deliberate: a cover is what an administrator needs to
tell participants apart, and it is explicitly NOT a claim about who
someone is in the world. "Ruth C.", "the CPA from the Tuesday meeting",
and "volunteer-7" are all valid covers. A group operating under pressure
should choose covers that do not resolve to civil identities. The term
was chosen over "identity" precisely because "identity" invites an
administrator to type a legal name, and the field must not invite that.

Cover is **required**. A roster of anonymous handles with no
administrator-held distinguishing label offers no defense against a
participant who accumulates handles, submits garbage evidence, or ratifies
indiscriminately. The administrator must be able to say "these two handles
are the same person" or "this handle is the person we vetted."

**Handle** is chosen by the member at enrolment and must be unique across
the instance. It is what appears in the record: the author of a promotion,
the attestor of a ratification, the source of hand-carried material, the
participant list of a project. Members and the public see handles.

**Pairing.** Only administrators see cover and handle together. Whether
a given pairing is published is a per-member decision that either the
member or an administrator may make, which is what allows known and
anonymous members to coexist in the same group without structural
difference.

**Residual risk, stated plainly.** The cover-to-handle table is an
artifact that does not exist under shared tokens, and it lives in
infrastructure subject to legal process. The mitigation is that a cover is
a label rather than a legal name, and it only works if groups actually use
it that way, which is a documentation and interface obligation rather than
a technical guarantee. Naming the field "cover" is the first and cheapest
part of that obligation.

## 4. Administrators

**4.1 A group of one.** The solo participant is the administrator. No
invitation, no handle ceremony, no approval step. Design Requirement 2
requires the system be genuinely useful to one person, so the entire
membership apparatus stays invisible until a second person exists.

**4.2 The second member must be an administrator.** The first invitation a
group issues creates a second administrator. This satisfies Design
Requirement 1 ("administrative access is shared among at least two
individuals and can be transferred") and Design Requirement 14 (no single
point of failure) at the earliest moment it is possible to satisfy them.

**4.3 No ordinary members until there are two administrators.** The group
cannot grow past the two-administrator floor in any other order.

**4.4 Administrator status cannot be taken away.** No administrator may
strip another. This prevents an instance from being captured by whoever
acts first in a dispute.

**4.5 An administrator may resign, but only while more than two exist.**
Resignation is the transfer mechanism: promote the successor, then step
down. The two-administrator floor holds at all times.

**4.6 The root of trust, and the limit of administrator irrevocability.**

Because 4.4 makes administrator status irrevocable, a co-opted, coerced,
or compromised administrator cannot be removed by the other
administrators. The escape hatch is replacing ADMIN_TOKEN in the hosting
dashboard, which returns the instance to an unclaimed state and lets it be
claimed afresh.

That escape hatch cuts both ways, and the document should say so plainly:
whoever can set ADMIN_TOKEN can take the group over. There is no
arrangement in which nobody holds that power, because the instance runs in
somebody's hosting account. **The holders of ADMIN_TOKEN are the root of
trust for that group**, and every other rule in this document sits beneath
them. Membership does not and cannot constrain them.

Two obligations follow. First, holding ADMIN_TOKEN must be a deliberate,
named arrangement rather than an accident of who created the account, and
per Design Requirement 1 it is shared among at least two individuals and
is transferable. Second, no interface may describe the administrator model
as though it bounds this power, because it does not.

**4.7 Adding and removing administrators.** Confirmed July 24, 2026.

**Addition.** The first administrator may add a second administrator
unilaterally, because a group of one has nobody to consult and Design
Requirement 1 wants the second holder to exist as early as possible. Every
subsequent addition requires the consensus of all existing
administrators.

Consensus on addition is the load-bearing half of this rule. Without it, a
captured administrator recruits confederates and manufactures the majority
that then ejects the honest ones. Closing that door is what makes the
removal rule below safe.

**WHO PROPOSES, AND WHAT A PROPOSAL IS WORTH — RULED 2026-09-21 by BOB #22** (REC-156's
questions, carried by CONDUCT #10), from §4.6 and this section, verified at the code (`index.mjs`'s
`by` stamp; `Store#memberAdd`). **An administrator's proposal, made from their own session, IS their
endorsement, and counts once:** consensus means every existing administrator has assented, and
proposing is assent; a second act from the proposer would protect nothing the others' endorsements do
not. **The ADMIN_TOKEN holder is NOT refused** at `memberadd`, and by the same ruling at §4.9's
`memberset`, `signeradd` and `signerset` (C-32.17 refuses a bearer only at the three VOTES): a bearer's
`by` is stamped `class:admin`, on no roster, so it endorses for nobody and is recorded as the operator's
act, and what it can still do (an invitation, the second administrator, a proposal awaiting every
administrator) is the root of trust's power under §4.6, which refusing it here would only pretend to
bound. An addition beyond the second issues no invitation until every existing administrator has
endorsed it from their own session.

**Removal.** A majority of all administrators, counting the target in the
denominator but not permitting them to vote. Ties do not eject. The
arithmetic:

| Administrators | Votes needed | Eligible voters | Effect |
|---|---|---|---|
| 2 | 2 | 1 | impossible, which is correct |
| 3 | 2 | 2 | unanimity of the others |
| 4 | 3 | 3 | unanimity of the others |
| 5 | 3 | 4 | three of four |
| 7 | 4 | 6 | four of six |

Counting the target in the denominator is what makes removal impossible at
two without needing a special case, demands unanimity while the group is
small enough for unanimity to be reasonable, and loosens as the group
grows. A lone captured administrator can never eject anyone. The rule
fails only to a colluding majority, and nothing survives a colluding
majority.

Removals are recorded with the deciding administrators and a reason.

**4.8 Hosting access is separated from administrator status.** Confirmed
July 24, 2026.

An in-app removal cannot reach someone who controls the machine. An
ejected administrator who holds the hosting account simply sets
ADMIN_TOKEN, reclaims the instance, and bans everyone else. Governance
decides who runs this copy; it cannot decide who runs the machine, and no
interface may imply otherwise.

Therefore hosting-account access and administrator status are separate
things held by different people wherever a group can manage it. The
hosting account must never be a single person's personal login; the
platform supports multiple account members and a group uses that.

**When this is enforced.** Not at install, because Design Requirement 2
demands the system be genuinely useful to one person, and a solo
participant is necessarily both the hosting holder and the administrator.
The obligation activates at the moment a group stops being one person:
when the second administrator is added, the group is required to record
who holds hosting access and prompted to make that a different person or,
at minimum, a second account member. That is the first moment the question
is meaningful and the last moment the group is paying attention to setup.

**Ejection is a two-part act.** Removing an administrator in the
application is half of it. The other half is rotating ADMIN_TOKEN and
reviewing hosting-account membership. The interface states this at the
moment of ejection rather than leaving a group to discover it after the
fact.

**4.9 What an administrator does.** Confirmed July 26, 2026. *(BOB #32, 2026-09-23, on REC-159's finding: the founder's
session is refused `NOT_AN_ADMIN` at the four custodial acts on an UNCLAIMED store such as scratch. That stands, and
it fails closed. Authority does not carry across namespaces, so a live verification claims an administrator in
scratch first.)*

An administrator holds the custodial powers over MEMBERSHIP, and only those:

- **Add a member.** Section 6's invitation, with the cover and the initial
  capabilities attached at that moment.
- **Deactivate a member.** Deactivation is what "removing" a member means here,
  and it is the only thing it can mean. **A member row is never deleted.** An
  active member ratifies, authors, and is cited, and those acts are part of the
  record; a record that refers to a member who no longer exists is a record with
  a hole in it. Deactivation ends access and leaves the history intact.
- **Reactivate a deactivated member.** It follows from the row surviving. The
  same person, the same handle, the same history.
- **Set a member's capabilities**, per Section 5.
- **Confirm and withdraw confirmation of a member's declared expertise**, per
  Section 1.3, including for another administrator. An administrator vouching
  for an administrator's license is the same act as any other and there is no
  reason to forbid it.
- **Approve signing keys**, per Section 5's `administer`.

**Two limits, and they are the load-bearing part of this clause.**

**Deactivating an administrator still requires the Section 4.7 vote.** The power
to deactivate a member does not reach another administrator's membership. If it
did, 4.4 and 4.7 would be decorative: any administrator could eject any other by
deactivating them as a member rather than by removing them as an administrator,
which is the same outcome by a different door. Administrator status and
membership are not separable that way.

**Reactivating a former administrator goes through the Section 4.7 addition
process.** A single administrator restoring someone the group voted out would
undo a group decision with one click, and 4.7's consensus-on-addition rule
exists precisely so that administrators cannot be manufactured unilaterally.
Reactivating them as an ordinary member is a single administrator's call;
restoring their administrator status is not.

**THE SECTION 4.7 VOTE COULD NOT BE CAST BY A PERSON, AND THAT WAS AN OMISSION RATHER
THAN A DECISION (D-136/D-134, RULED 2026-09-19 by BOB #17, read at the code).
BUILT 2026-09-19 by D-136 — the finding below is kept in the PAST TENSE, with what
landed stated after it, because the reasoning is what licenses the fence.**
`op=adminendorse` and `op=adminremove` carry `classes: ["admin", "probe"]` and appear in
no session set, so the ONLY caller that can cast a 4.7 vote is a bearer credential. And
`by` is server-stamped only for `PROJECT_ACTIONS` plus `projectparticipants` and
`projectownerarith` (`index.mjs`), which these three are not — **so on the one reachable
path the CALLER NAMES THE VOTER.** The plane's own comment beside that stamp already
states the rule: *"a caller-supplied `by` is overwritten rather than honoured: 'only an
owner may remove' is worth nothing if the caller names who they are."* Read it against
this section and it says: **"every subsequent addition requires the consensus of all
existing administrators" is worth nothing if the caller names who consented.** Seven
releases of enforced arithmetic rest on attributions the caller supplies. This is D-421's
class, which BOB #14 already ruled for `op=ratify` and `op=caseratify` (C-32.14/C-32.15):
no operator bearer token delivers an authored act.

**THE FIX, named so the rows can be placed, and it is ONE item rather than two.**
Server-stamp `by` from the session on `adminendorse`, `adminremove` and `membercaps`, AND
give those three session reach, **in the same landing**. Either alone is worse than
neither: stamping without reach makes the 4.7 vote unreachable by anybody, because a
bearer token would stamp as a machine and be refused with no session route to replace it;
reach without stamping leaves the vote forgeable by the caller that names the voter. The
member SURFACE (D-134's half — zero of the admin-only mutating ops appear in `app.html`)
comes AFTER the fence and never before it, because a surface over an unfenced act is a
second path to it.

**Until it lands, the plane must not tell a member that this absence is a decision** — see
the refusal rule (IC-55/D-262): *this verb is not for a person* is a design claim the
plane may make only where such a decision exists, and here none does. **That obligation is
DISCHARGED: the absence has stopped being an absence.**

**WHAT LANDED (D-136, 2026-09-19), AND THE ONE DESIGN CALL IT FORCED.** The three ops carry
`classes: ["admin","member","probe"]`, appear in BOTH of `SESSION_OPS`' sets, and their `by`
is stamped by the server from the signed-in session through `GOVERNANCE_ACTIONS` — one array
consumed by the reach, the stamp and the fence together, so the halves cannot ship apart. The
store READS the stamp on all three: `adminEndorse` and `adminRemove` already checked `by`
against the live administrator roster and now receive it from the query rather than the
caller's body; `memberCaps` gained the same check, because a stamp nothing consults is a
mechanism believed on the strength of its existence. An operator's bearer token is refused at
the door by name (`OPERATOR_TOKEN_CANNOT_GOVERN`, C-32.17), which is D-421's ruling — *the
credential that delivers an act decides when the record changes, and the record names the
actor* — applied to a §4.7 vote with the signature replaced by a roster position.

**THE DESIGN CALL: the three are in BOTH session sets, not the administrator's alone, and
this section is where that is recorded.** The plane's `kind` is `admin` only for the
FOUNDER'S password session; every enrolled administrator holds `member:<id>` however their
roster row reads, and a class list without `member` refuses their browser before the session
gate is reached — both measured at the code, the second by an enrolled administrator being
refused CLASS_FORBIDDEN at her own endorsement. Reach in the administrator set alone would
therefore have given §4.7's vote to ONE person while closing the bearer route to everyone
else, leaving a group of three unable to add or remove an administrator at all: this
section's own failure mode arrived at one administrator instead of zero. **What decides these
acts is the ROSTER, and the store asks it** — an ordinary member reaching them is told
`NOT_AN_ADMIN`, the thing that is true, which is `op=expertiseconfirm`'s recorded posture for
an administrator-only act. It discloses nothing new: §3's handle roster with its roles is
already a member's to read. The member SURFACE (D-134) came after this fence, as ruled; it is
built for 4.9's four custodial acts (the paragraph closing the REC-159 block below).

**WHAT D-136 DID NOT CLOSE, AND REC-156 DID (2026-09-21).** D-136 left `op=memberadd`'s `by`
unstamped while `Store#memberAdd` WROTE an `admin_votes` row from it, so the proposer of an
administrator could record one endorsement in another administrator's name — the same class in a
fourth op its ruling did not name. REC-156 stamps it by ONE disjunct on the same `by` expression,
and the store relays the stamp from the query over any body copy, so a proposal records its
proposer's own endorsement and nobody else's: the founder's session is counted as the founder, and
a bearer, which holds no roster position, opens the proposal and endorses nothing. `memberadd` is
NOT added to `GOVERNANCE_ACTIONS`, because that array also carries member-set reach and the
operator fence, and this landing moves neither.

**A BEARER REACHING `op=memberadd` IS NOT REFUSED — REC-156's PROVISIONAL decision, RULED 2026-09-21 by
BOB #22** (*WHO PROPOSES, AND WHAT A PROPOSAL IS WORTH*, above; this heading corrected by BOB #23, which found it
still reading as open). Once stamped, a bearer's `by` names nobody, and what the op still does for one — the §6
invitation, 4.2's second administrator, a proposal awaiting every administrator — attributes no
act to any administrator and sits with the ADMIN_TOKEN holder under 4.6. C-32.17's sentence would
be false here. Refusing it would take away the route by which 99 battery suites, five probes and
the live VF-4 verification create members (MEASUREMENTS M-84); reversing it is one disjunct on the
operator fence plus a founder-session fixture for each of those callers.

**WHAT IS STILL NOT CLOSED, stated rather than rounded off.** `op=memberadd` reaches the FOUNDER'S
session alone — `SESSION_OPS.admin` is the founder's password session, the measurement above — so
an enrolled administrator cannot propose an addition or invite a member from her own browser, and
is refused with a sentence saying the op is reserved to an administrator, which is false of her.
`memberset`, `signeradd` and `signerset` stand the same way against 4.9's list. The fix is this
section's own design call applied again (both session sets, a stamped `by`, the roster refusing a
non-administrator by name); it moves reach, so REC-156 routed it with the fix named rather than
taking it.

**CLOSED 2026-09-23 BY REC-159, as the paragraph above named it.** `CUSTODIAL_ACTIONS` —
`memberadd`, `memberset`, `signeradd`, `signerset` — is spread into BOTH session sets, and `member`
joins each op's class list so an enrolled administrator's session (whose `kind` is `member`) passes
the class check. The `by` stamp's `memberadd` disjunct became `CUSTODIAL_ACTIONS`, one expression
still, and the store's relays read `by` from the query over the body. `Store#custodialBar` asks the
roster FIRST, before any lookup: a member-named `by` that is not an active administrator is refused
`NOT_AN_ADMIN` — the thing that is true — so an ordinary member reaches the op and is refused by what
knows, D-136's posture. **The array is NOT `GOVERNANCE_ACTIONS`**, because that array carries the
operator fence and BOB #22 ruled the operator's bearer keeps these acts; instead each row carries
`machineClasses: ["admin","probe"]`, the bearer classes it held before, against which a caller that
did not arrive by a session is judged — so granting `member` to a session admits neither the
MEMBER_TOKEN bearer nor an `ai` credential. Per BOB #31's amended scope, `memberset`, `signeradd` and
`signerset` write the stamped actor into `members.status_by` / `signers.status_by` (a revocation's
cascade onto a member's keys names the same actor); the column is nullable and never back-filled,
and a row nothing stamped reads `not recorded`. A bearer's act is recorded as `class:<cls>` — the
credential, never a person. **RULED 2026-09-25 by BOB #35 (D-134's question): EVERY writer of
`members.status` writes `status_by`, naming the actor whose act caused THAT transition** — enrolment the enrolling
member; an invitation the inviter (`memberadd`, the ordinary path and the second administrator's alike); a §4.7
endorsement or removal the administrator whose vote COMPLETED it; a re-invitation or revocation its stamped actor.
Measured at `964da679`: the re-invitation, revocation and enrolment writers leave `status_by` untouched, so a row
`memberset` stamped can later read a status its stamper never set — the record claiming an attribution it does not
hold. **And who INVITED a member is its own fact** (`members.invited_by`, nullable, never back-filled; `not recorded`
before it), because `status_by` names only the LATEST transition and enrolment overwrites it. The two plane comments that justified `governorconfig`'s class by
*"the same line memberset and signerset draw"* were corrected in the same landing, as the ruling
below required.

**THE SURFACE, BUILT 2026-09-25 BY D-134.** An administrator's session performs the four from the Members
screen of `civicos-ui/app.html`: invite (and, beyond the second administrator, propose), deactivate or
reactivate a member, register a member's signing key, revoke or reactivate a key. The controls exist only
for a session `op=whoami` says administers, the founder's or an enrolled administrator's; a member's session
renders none of them, absent rather than greyed (DEC-69). The page never sends who is acting; the plane
stamps it. Every refusal the surface can receive carries a canned translation (`CUSTODIAL_CHECKS`, C-96).
Because the control plane attaches a family's translation to EVERY refusal carrying its code, each sentence
was written to be true at every site that mints the code. `adminRemove`'s refusal of a TARGET who is not an
administrator, which had shared `NOT_AN_ADMIN` with the caller case, is its own code (TARGET_NOT_AN_ADMIN,
C-96.9). WHO INVITED a member is `members.invited_by` (BOB #35's ruling above), written by `memberadd` on
every path from the plane's stamp (a bearer's reads `class:<cls>`), and a row invited before it reads
`not recorded`; the roster shows it in those words.

**AND ADMINISTRATORS DO NOT RUN THE INSTANCE: `op=governorconfig` IS THE OPERATOR'S — RULED 2026-09-21 by BOB #23**
(the REC-156 DELEGATION's item 3, carried by CONDUCT #10), read at the code (`index.mjs`'s OPS row and `SESSION_OPS`;
`Store#governorAdmit`). Setting a host's appetite is not a custodial power over membership, so this section does not give
it to an administrator, and nothing else does. It stays where D-103 put it: the founder's session and the ADMIN_TOKEN
holder's bearer, the root of trust in its two forms (4.6), because the founder's session is the one the claim made from
that token. **The reason is a precedence the governor already applies:** a host's configured appetite OUTRANKS the
instance's `GOVERNOR_APPETITE_PER_MIN`, a binding set in the hosting account, so a roster position holding it could
override, host by host, what whoever runs the machine chose for the whole instance — governance deciding who runs the
machine, which 4.8 forbids. The cost of leaning on another party's server falls on people outside the group and on the
group's standing with them (`SOURCE-ACCESS.md`); a configured appetite never outlasts a counterparty's refusal
(`governorReport`'s cool-off wins), but how hard the instance leans until then is the operator's to answer for. Design
Requirement 1 is met by 4.6's own obligation, that ADMIN_TOKEN is held by at least two people, not by widening this to
the roster. An administrator keeps SIGHT: `op=governorstate` reaches every session, the separation drawn below for
projects — audit everything, direct nothing. **Two acts follow, carried in the BOB INBOX:** once the four 4.9 ops above
join both session sets (REC-159), `governorconfig` is the one op the founder's session alone reaches, and its refusal must say
that (*reserved to the founder's session*) instead of calling the op an administrator's and the enrolled administrator's
role `member`; and the two plane comments that justify its class by the line *"memberset and signerset draw"* are
corrected in the same landing, because that landing makes them false.

**BUILT 2026-09-25 BY REC-162.** The first act is taken: the session gate's (b) refusal names the session that
reaches the op, derived from the `SESSION_OPS` set that holds it — an op the founder's set alone holds is *reserved to
the founder's session* (`reachedBy: "founder"`), one the member set alone holds *to a member's own session* — and it
carries the session's kind as `session` where it carried `role`, which read `member` of an enrolled administrator. An
enrolled administrator and a member are each refused `governorconfig` with that sentence, and the founder's session and
the ADMIN_TOKEN bearer still set an appetite (`adminvote.test.mjs` §10). The second act, the two comments, REC-159 had
already taken, as its paragraph above records.

**And administrators do not touch project participation.** They do not invite to
projects, do not remove from projects, and do not activate or deactivate
projects. That authority sits with project owners, per Section 7, with the
single narrow exception in 7.13. Administrators do continue to SEE every project
and every participant list, per 7.3 and 7.8. Sight and authority are separated
here on purpose: the custodial role can audit everything and direct nothing.

**4.10 The seven ops no session reached, and no decision explained: RULED 2026-09-21 by BOB #19 (REC-155), landed by
BOB #20 after re-reading each citation at the code.**
`index.mjs`' `UNATTENDED_BY_DECISION` header names `provenancechain`, `provenanceroute`, `calibrate`,
`calibrationsubject`, `calibrationsignal`, `livefire` and `reproject` as refused to every session with no decision on
record. The plane answers each one `SESSION_ROUTE_NOT_RECORDED`, which is honest, and asks for exactly this ruling. Each
answer below was read from the op's own row or its handler, at the artifact.

- **`provenancechain` and `provenanceroute` JOIN BOTH SESSION SETS**, each with a driven arm. Their OPS rows state the
  doctrine: *"deciding that the evidence supports a route is a named member's judgement"*, and *"a standing statement in
  the record with nobody's name on it is not a statement."* A signed-in session is the one caller that carries a name.
  Today a bearer token reaches both, and the author it is stamped with is `token:<class>` (`MACHINE_AUTHOR_PREFIX`),
  which is nobody's name. **So the bearer WRITE route then closes, BY NAME, in a SECOND landing**, on the pattern of
  D-421 (C-32.14/.15) and D-136 (C-32.17). For `provenancechain` that is its `apply=1` arm; its default REPORT arm
  writes nothing and stays open. For `provenanceroute` it is the op, which writes and does nothing else. The second
  landing comes AFTER the session route is driven, so D-200's chain-absent population keeps a route to repair it. It is
  also where REC-65's known-open identity pin (`identity-claims.test.mjs`, which names `provenancechain` beside
  `proposedispose`) is corrected, because that pin fails when a fence appears, and the first landing adds none.
- **`calibrate`, `calibrationsubject` and `calibrationsignal` JOIN BOTH SESSION SETS**, each with a driven arm. Their OPS
  row rules the question already: *"The fence that matters here is therefore NOT about who may measure; it is that a
  measurement may never move a GRADE"* (`CAL_CANNOT_REGRADE`). A person may measure, and may record that a vendor
  announced something, on the same terms as a probe. The bearer route stays, because a scheduled re-probe is a machine
  act by construction.
- **`livefire` and `reproject` are UNATTENDED BY DECISION**, and each joins `UNATTENDED_BY_DECISION` with the citation a
  caller can check. `livefire` is the deployment's live-fire battery: *"the only channel available for reaching a
  deployment may be a plain fetch of a URL. Confined to the scratch namespace"* (`src/livefire.mjs`, header).
  `reproject` is a deploy's maintenance pass: *"Exposed because a deploy runs the bounded pass once at construction and
  a large store may need more than one"* (`src/store.mjs`, `reproject`). Neither is a member's act; each is addressed to
  the operator's credential. Recording that is a decision, which is what the table exists to hold.

**What this does not change:** no class list moves in the first landing, so every caller keeps its reach and sessions
gain it. **The first landing is BUILT (REC-155, 2026-09-25)**: `PROVENANCE_JUDGEMENT_ACTIONS` and
`CALIBRATION_WRITE_ACTIONS` are spread into both `SESSION_OPS` sets, `livefire` and `reproject` are rows of
`UNATTENDED_BY_DECISION` citing this section and the artifact it quotes, and `rec155-session-routes.test.mjs` drives
each op from three sessions. With all seven ruled, the real plane has NO omission left for the gate's third sentence
(`SESSION_ROUTE_NOT_RECORDED`); the sentence stays the answer owed to an op added without a ruling, and is driven through
an in-memory fixture op. The second landing is the one that refuses a caller, and it is BREAKING for bearer writers of the provenance
pair. It states its IC as MAJOR.

## 5. Capabilities

Capabilities are set by an administrator when the invitation is created
and are editable afterward by an administrator. A capability a member does
not hold is absent from their interface, not present and refused.

- **contribute** — create and revise bundles in the working corpus.
- **publish** — ratify, which additionally requires a registered signing
  key. The capability governs the surface; the key governs the authority.
- **create projects**.
- **administer** — the roster, capabilities, key approval, and member
  lifecycle, subject to Section 4. It does NOT cover project participation.

**An administrator holds every working capability.** Confirmed July 26, 2026.
An administrator contributes, publishes and creates projects, in addition to
their custodial powers, and this is not something an administrator has to be
granted or can be denied. Two reasons, and the second is the decisive one.

The first is that it is what a group means. Someone trusted with the roster, with
everyone else's capabilities, and with approving the keys that make publication
possible is not meaningfully withheld the ability to contribute.

The second is that the alternative has no exit. Section 4.4 makes administrator
status irrevocable, and any rule that let one administrator edit another's
capabilities would be a rule that let one administrator strip another down to
nothing while leaving the title in place, which is 4.4 defeated by arithmetic. So
an administrator's capability field cannot be editable by anyone, including
themselves. A field nobody can edit is not a variable, and treating it as one
would mean an administrator's powers were frozen forever at whatever their
invitation happened to set. Reading the field as not consulted at all is the only
reading with no trap in it.

**Capabilities gate a session, not a credential.** A machine credential has no
member behind it and therefore holds no capabilities. What bounds a machine
caller is the operation table and the confinement rules, not this section, and an
interface must not report a token class as holding capabilities it cannot have.

Declared expertise and confirmed licenses (Section 1.3) are metadata, not
capability. They inform humans; they gate nothing, confirmed or not.

## 6. Invitations

An invitation produces a **burner URL** carrying a one-time code. The
administrator transmits it to the prospective member by whatever channel
they judge appropriate; the system takes no position on that channel and
keeps no record of it.

The URL is spent on use. After enrolment it resolves to nothing and
carries no record of what it formerly addressed, so a leaked or archived
link is inert and reveals neither the group nor the invitee.

At enrolment the member chooses a handle, which the system enforces as
unique across the instance, and a password. The administrator-assigned
cover and capabilities are already attached and are not visible to the
member as editable fields.

> **A SIGNING KEY IS REGISTERED TO A MEMBER WHO CAN ATTEST — built by D-158,
> 2026-09-20 (C-63).** Enrolment is the moment a person takes up a membership,
> so nothing may attest in that membership's name before it. `op=signeradd`, and
> `op=signerset` when it ACTIVATES, refuse a member whose status is not `active`
> — `SIGNER_MEMBER_NOT_ENROLLED` when no handle has been chosen,
> `SIGNER_MEMBER_NOT_ACTIVE` when one has and the membership is not standing.
> Before this, `op=signerlist` read the `signers` table alone while `op=ratify`
> weighed a signature against the member's standing as well, so a key registered
> for somebody who had never enrolled read `active` on the roster and came back
> `SIG_UNKNOWN_KEY` at the gate (measured 2026-08-02 over real signatures;
> re-measured 2026-09-20). **The two were made to agree by the ROSTER telling the
> truth and not by the gate relaxing**: accepting the key would let a signature
> attest in the name of a roster slot no person holds, which is §4.7's forgery
> class one act over. `op=signerlist` now serves, beside the key's own `status`,
> the stored `member_status` and a derived `attests` — whether `op=ratify` would
> accept this key right now — computed from the SAME predicate the two gate
> readers use, with `attests_why` naming a stored fact and carrying the literal
> `undetermined` for a combination the plane cannot account for. Nothing is
> hidden: a roster that dropped the keys it could not confirm would make the two
> views agree by claiming LESS than the record supports, which is a different
> defect. NOT closed: a key registered before this landed still sits in an
> instance's `signers` table; it is REPORTED honestly by the roster and is not
> rewritten, because the record says what it holds.

## 7. Projects

A project in BIO is a record object (BIO_State_Rules_Consistency Section
4.3): a bundle with an objective, an analysis record, a work-product
readiness ladder, recorded evaluations, and a lifecycle of forming,
investigating, matured, closed. The Roadmap's "Projects" category is the
workspace view onto that object. This document adds participation to it
and changes nothing about the object itself.

**Authority over a project belongs to its owners.** Confirmed July 26, 2026,
and it reverses v1.4's 7.7. Administrators hold the custodial powers over
membership; they hold none over projects. They see everything and direct
nothing, and the single narrow exception is 7.13. The reasoning is that
participation in a project is a working relationship rather than a membership
one: whether someone belongs on a piece of work is a judgment the people doing
the work are positioned to make and the custodial role is not. Authority over
membership itself stays custodial and is untouched by this.

**7.1 Creation.** A member with the create-projects capability creates a
project and is its sole initial owner. A project created by a machine credential
has no owner, because there is no member behind a credential and inventing one
would put a name on the record that nobody holds.

**Unicode-equivalent titles are ONE name** (BOB #32, 2026-09-23, D-50's gap). The name key normalises to NFC before
the comparison below. Two titles a member cannot tell apart on screen must not be two names, or a lookalike could
claim a name that is taken. Existing titles stay as written, and a pair the census finds colliding after normalising
is STATED, never renamed. NOT BUILT (REC-208).

**A project's name is unique across the instance.** Confirmed July 26, 2026.
The name is the `title` field of the project bundle's frontmatter, which is
already a required field for every bundle. Two projects in one group may not
share a name, so a name identifies a project rather than merely describing it.

Three consequences, decided here because leaving them to the implementation
would mean deciding them by accident:

- **Comparison is case-insensitive and collapses runs of whitespace.** Handle
  uniqueness is a plain unique index over the trimmed string and is therefore
  case-sensitive, so `Alice` and `alice` are two handles today. Inheriting that
  rule here would let "Sewer Fund Transfers" and "Sewer fund transfers" coexist,
  which is the collision the rule exists to prevent. Uniqueness that a reader
  cannot see is not uniqueness.
- **It holds across every lifecycle state, deactivated projects included.** A
  deactivated project has not gone anywhere: it is `closed` with a
  `closed_reason` of `abandoned` per 7.11, it is still cited, and its name still
  has to resolve to the thing that was cited. Freeing a name on deactivation
  would let a later project silently inherit an earlier one's references.
- **This is a rule about the project object, not about participation**, so it
  reaches past this document into BIO_State_Rules_Consistency Section 4.3 and
  into the check catalog, which is where it has to be enforced. Section 11
  carries the obligation.

**7.2 Invitation.** An owner invites other members by handle. Only owners
invite.

**7.3 Visibility.** A member sees only the projects they have been invited
to, whether or not they have accepted. Administrators see all projects and
all participant lists. Administrator sight survives the reversal in 7.7
deliberately: the custodial role can audit every project without being able to
act in any of them.

**7.4 Joining.** An invited member joins by selecting the checkbox beside
the project. There is no acceptance ceremony beyond that.

**7.5 Participation rights.** An invited member who has not joined has
view rights only. A joined member has the working rights their
capabilities allow.

**7.6 Requesting to leave.** A joined member unchecks the same checkbox.
This does not remove them; it greys the checkmark to record a request to
leave. The member may attach a short explanatory comment.

**7.7 Removal. REVERSED in v2.0.** Only an owner removes a participant from a
project, whether or not a request to leave is outstanding. The removing owner
may attach a short explanatory comment. **Administrators do not remove project
participants**, which is the opposite of what v1.4 said in this clause. An
owner may not remove another owner by this route; that is 7.10.

**7.8 Participant lists.** Every participant of a project can see the
handles of all other participants of that project, and which of them are
owners. Administrators see all of them, and every entry in the administrator's
roster lists the projects that member participates in.

**7.9 Containment, and what non-participants see. RESOLVED.**

The containment hierarchy, expressed in the closed relationship
vocabulary of BIO_State_Rules_Consistency Section 5.1:

- Information is the raw material and refers to nothing above it.
- A Focus `cites` zero or more pieces of Information, not necessarily
  uniquely: the same Information may be cited by many Focuses.
- A Project stands above zero or more Focuses (the Focus carries the
  `elevated_into` edge; the reverse is derived by the index and never
  hand-maintained) and `cites` zero or more pieces of Information
  directly.
- A Project `initiates` zero or more Actions.

Nothing in this hierarchy is exclusive. An Information cited by one
Project may be cited by another, and by Focuses under neither.

**Three positions, not two.** Visibility depends on which of three
positions a member occupies with respect to a project:

- **Uninvited.** The project is not visible at all. Not its existence, not
  its name, not its references, not its participants.
- **Invited, not joined.** The project's SKELETON is visible: the Focuses
  it stands above, the Information it cites, and the Actions it initiates.
  View rights only.
- **Joined.** Everything, subject to the member's capabilities.

Administrators see all projects and all participant lists.

**"Not its existence" holds at the ACTS, not only at the reads — BUILT 2026-09-18 by REC-138 (IC-155, D-426).** Every act
that names a project answers a caller who cannot see it exactly as it answers an id that names nothing, byte for byte
(IC-141's rule), through one sight predicate (`Store#inSight`, over `viewerPredicate`) and one not-found
(`Store.#noSuchProject`). Sight is asked BEFORE position, so a positional refusal (C-56, the roster acts' owner and
administrator tests) is only ever said to a caller who can already see the project — the invited and the
administrators — and tells them nothing new. The per-act measurement is IC-155's; driven in
`bio-plane/test/project-sight.test.mjs` and `project-sight.control.mjs`. Not closed, because it is two rulings pulling
against each other: a creation at a hidden project's id, and 7.1's name uniqueness (D-428). The creation half is closed
by REC-141 (IC-158): the plane mints project ids and a creation naming one gets one answer, taken or not.

**THE FOUNDER IS AN ADMINISTRATOR HERE TOO — how a session reaches this rule (designed 2026-09-18 by BOB #15 for D-422).**
The founder's own session read as `member:admin`, and `viewerPredicate`'s administrator arm looks for an active `members` row
with role admin, which the founding administrator by design never has (`Store#activeAdmins`). So the founder saw only the
projects it participates in — contrary to the sentence above and to §4, and measured (`op=list` shows a project to the admin
token and not to the founder's session). **Design:**
- **ONE resolution of a session to what it may SEE, used by every session-stamped read.** `sessionCaseViewer` in
  `src/index.mjs` (REC-128, IC-147, case documents only) is the seed and becomes that one resolver; no read keeps its own.
  It returns TWO things kept apart: the VISIBILITY viewer (the founder's is the administrator viewer, so every project and
  every participant list, as this section says) and the POSITIONAL identity (who the session IS — `member:admin` — for
  authorship, ownership, votes and D-310's positional questions). A site that asks *who* never reads the visibility half.
- **The widening stops where a ruling names someone narrower than an administrator.** A LEAD is readable by its author and
  by participants it was shared to, never by administrators (`MEMBER-KNOWLEDGE-DESIGN.md` §5; `#leadVisibleTo` bypasses the
  administrator arm on purpose) — so the founder sees its own leads by position and no one else's. Any read whose ruling names
  participants or authors keeps its own predicate and is listed as such in the item's scope; the builder greps
  `viewerPredicate`'s callers and states, per site, which arm governs.
- **The id `admin` is RESERVED.** `memberAdd` refuses it, because every name-keyed check (`#isAdminMember`, `#activeAdmins`)
  would read such a member as the founder. An instance already holding a member with that id is REPORTED by `op=audit`,
  never renamed silently.
- **SIGHT IS NOT AUTHORITY — and this is Bob's doctrine, not a new ruling** (§4: *"Sight and authority are separated
  here on purpose: the custodial role can audit everything and direct nothing"*; the single exception is §7.13). The
  founder's session matches an enrolled administrator for what it may SEE. REC-132's builder found that several acts on a
  project take the visibility gate as their ONLY barrier, so every administrator — enrolled or founder — can already DO
  them on a project it is not in. **That is a defect against this doctrine, decided 2026-09-18 by BOB #15, and its fix is
  its own task:** every act that changes a project, its participation, its productions or their grants carries a
  POSITIONAL check (the actor's own role in that project), never the visibility gate alone; §7.13's add-an-owner act is
  the one administrator path, and it keeps its condition, its vote and its record. Narrowing only the founder would make it
  narrower than every enrolled administrator and fix nothing. The builder enumerates the acts by grep and states, per act,
  which positional role it requires.
- **BUILT 2026-09-18 by REC-134 (IC-152).** One helper, `Store#projectAuthority`, asks the POSITIONAL identity (never the
  viewer) at every act that changes a project: a JOINED participant (§7.5) for revising the project's document
  (`op=promote`), its citation edges (`cite`, `sever`, `reinstate`), its stance (`versioncurrent`), its conclusion
  (`conclude&project=`) and its feed's judgements (`proposedispose`); an OWNER for adopting a bias set into its scope
  (`biasadopt`, *"Project managers define project bias"* with DEC-72 (5)). Refusals C-56.1/.2. The acts that already asked a
  position (roster, publish, the review copy, the run verbs, the lead share) are unchanged; §7.13 is not behind the check,
  and a control proves that applying it there breaks the rescue. Machine credentials hold no position and are unchanged. The
  per-act table is IC-152's. `op=caseratify`'s position is DECIDED in the next bullet and BUILT by REC-137 (IC-154). Driven in
  `bio-plane/test/project-authority.test.mjs` and `project-authority.control.mjs`.
- **A CASE RATIFICATION: who AUTHORISES it and who may DELIVER it** (decided 2026-09-18 by BOB #15 on REC-134's gap; it
  reconciles two of Bob's rulings rather than making a new one). **The authority is the SIGNATURES, and they must include
  an OWNER of the publishing project** — DEC-72 clause 5 makes publishing the owner's act; the handler today asks only
  for the instance-wide `publish` capability, so the builder verifies at the code whether an owner signature is required
  and adds it if not. **Delivering is carriage, not direction** (AI Roles rule 4: the record states signer and deliverer
  apart): a member with a role in the project may deliver, and so may the FOUNDER, as DEC-33's interim publishing route
  (*"publishing currently runs through the group's operator"*) until the member-facing ceremony exists. **An enrolled
  administrator with no role in the project may not deliver** — DEC-33 names the group's operator, not every
  administrator, and administrators direct nothing (§4).
- **BUILT 2026-09-18 by REC-137 (IC-154).** Verified at the code first: the plane asked for no owner anywhere — any
  registered signer of the instance committed a case, and a joined non-owner's own signature was driven to a commit.
  `Store#ratifyCaseDocument` now asks two questions before anything is written and before the idempotent retry. DELIVERY:
  the session's principal (REC-128) is the FOUNDER, or passes REC-134's `#projectAuthority(..., "joined", "caseratify")`
  (C-56.1) — "a member with a role" read as a JOINED participant (owners included; invited-not-joined has view rights
  only, §7.5). AUTHORITY: the verified signer is an OWNER of the publishing project (`#isProjectOwner`), whoever delivers
  (C-57.1 `CASE_SIGNER_NOT_AN_OWNER`). Driven in `bio-plane/test/case-authority.test.mjs` and `case-authority.control.mjs`.
  `op=ratify` of a PROJECT bundle was driven against the same rule and does NOT meet it (D-429, a design gap above).
  **CLOSED 2026-09-18 by REC-140 (IC-157)** under BOB #15's ruling in `BIO_Publication_v0_1.md` §3 rule 2: `op=ratify`
  refuses a project bundle outright (C-58.1), and a finding a ratified case pins takes THIS bullet's two questions —
  moved out of `ratifyCaseDocument` into `Store#caseAuthority`, which both acts call, so the rule has one spelling. Driven
  in `bio-plane/test/ratify-authority.test.mjs`; what `op=ratify` still publishes outside a case is D-431.
- **What a refusal may say about a project the caller cannot see** (decided 2026-09-18 by BOB #15 from REC-138/D-428,
  except the one point marked OPEN). A refusal never names or describes a project the caller cannot see: `NAME_TAKEN`
  echoes neither the other project's id nor its title. **The plane MINTS project ids** (a caller no longer chooses one),
  which closes the `EXISTS` channel outright. An inquiry run's report lists only the citing projects its member can
  see, and counts none of the others: DEC-63 decides who may START a run and requires no such disclosure, so a run naming
  a hidden project is a §7.9 defect, not a conflict between rulings. **RULED BY BOB, 2026-09-18 (two of his July 26 rulings met):**
  *"Keep project names unique across instances."* Refusing a name therefore tells an uninvited member that a project with
  THAT name exists — the one thing §7.9 yields to §7.1 — and the refusal reveals nothing beyond the name the caller supplied.
  **BUILT 2026-09-18 by REC-139 (IC-156), in part.** `NAME_TAKEN` (at `promote` and `forkProject`) carries neither the other
  project's id nor its title, for every caller — one payload, so no sight question is asked. The three run verbs'
  `projectGate.projects` counts only the citing projects in the caller's sight (`Store#inSight`, the viewer stamped by the
  control plane); DEC-63's verdict still reads every citing project. Plane-minted ids are NOT built by it: the next bullet DECIDES how (BOB #15, after REC-139 stopped), and the remainder is re-rowed. Driven in
  `bio-plane/test/project-disclosure.test.mjs` and `project-disclosure.control.mjs`.
- **HOW the plane mints a project id** (decided 2026-09-18 by BOB #15 on REC-139's stop): a caller-supplied id on a NEW
  project is REFUSED — never silently ignored — with one byte-identical answer whether or not that id exists; a fork's
  `newId` is minted the same way; and the plane WRITES the minted id into the document's `id:` frontmatter before it
  hashes and registers the bytes, refusing bytes that already carry one, and returns the id and the final sha (the
  precedent is the testimony header the plane already writes, `bio-testimony/1`). The Add surface and the fork form
  stop asking a member for an id (a UI task).
- **RULED BY BOB #32, 2026-09-24 02:30Z — A HIDDEN PROJECT'S RUN OUTPUT IS THE PROJECT'S THINKING, AND ONLY THE RUN'S
  ATTRIBUTION IS WITHHELD.** *"A hidden project's run output is the PROJECT'S THINKING until something outside uses it;
  the bytes stay shared, only the run's attribution is withheld."* This answers the question D-464 (IC-254) explicitly
  ROUTED rather than decided: whether what a hidden project's RUN produced at the evidence levels belongs to the shared
  corpus or to the project. **Both halves bind.** The EVIDENCE half: a capture, a content row, a proposed reading or a
  capture request such a run produced stays in the shared corpus and in every count of it, so no fence is built there —
  compartmenting evidence is the thing §7.9's own gate refuses (see `viewerPredicate`'s note, *the evidence corpus stays
  shared*). The ATTRIBUTION half: the `observation_log` row that says a RUN LOOKED is a coverage claim about the project,
  and a count of those rows is §7.9's *"not its existence"* arriving as an aggregate — so it leaves every tally a caller
  outside the project's sight reads. BUILT by D-486 (2026-09-24, IC-258, MEASUREMENTS M-131) at all five readers together,
  through ONE predicate (`Store#hiddenSets`); `op=purge`'s proof stays whole. **What is NOT ruled and is stated rather
  than rounded in:** whether the log's own earliest-row WATERMARK — which `#missingContentCause` and
  `#missingMeaningCause` use to tell *purged* from *never looked* — may be moved by a run nobody outside can see. D-486
  routed it to Bob; gating it is what `OBSERVATION-LOG-DESIGN.md` §6 argues against for a signed completeness statement.

- **A BOUNDED READ'S OWN PAGE IS PART OF *"NOT ITS EXISTENCE"* — BUILT 2026-09-24 by D-480 (MEASUREMENTS M-142).**
  Found by D-464's worker and routed with its fix. The queue's two shared-question producers take their candidates
  from one grouped read of `refs` bounded at `Store.QUEUE_SHARED_INQUIRIES_MAX` and ordered by `target_id`, and that
  read was UNGATED on purpose: the gate runs afterwards in `#projectsDrawingOn` and can only narrow. **That reasoning
  is sound about every candidate the page REACHES and says nothing about the page's EDGE**, which is where the
  disclosure lived: a question only hidden projects share qualified as shared, took a slot, and displaced one the
  caller could see — so the `inquiries_truncated` this feed publishes on every item moved, and, measured at the op, a
  member's own divergence FINDING left her queue altogether because two people created a project she cannot see. The
  candidate read now subtracts `Store#hiddenSets`' `hid` — D-464's and D-486's ONE set, not a second sight rule — at
  BOTH ends of the edge, the citing bundle and the target, since a target the caller cannot see was spending a slot
  on its way to being dropped. **The general form, and it is the reason this is recorded in §7.9 rather than as a
  bug fix: where a bounded read publishes what it could not reach, the BOUND is an answer, so whatever is allowed to
  fill the page is subject to this section exactly as the rows are.** What is NOT changed: a `target_id` naming no
  bundle is in no hidden set and still fills a slot, because it discloses nothing and refusing it would be a fence
  tighter than its rule; and the second-step gate and severed-status confirmation are untouched.

- **A MINTED ID CARRIES NO COUNT — decided 2026-09-19 by BOB #16 on REC-141's gap, from §7.9 and BOB #15's ruling that
  *a COUNT is a disclosure of existence* (`MEMBER-KNOWLEDGE-DESIGN.md` §5).** `allocId`'s sequence is PER PREFIX PER YEAR
  (`seq.scope = PROJ-2026`), so `PROJ-<year>-<seq>-<slug>` tells a creator how many projects were made before theirs,
  hidden ones included — one hidden project's existence, read off a number. The same holds for every prefix whose objects
  a read withholds from some caller: `CASE` (an unratified case answers as absent, REC-130), `DRAFT` and `RVG` (the review
  copy, §6A), and `PROJ`. **So: an id of a gated object is minted OPAQUE** — a random suffix from the store's CSPRNG,
  checked unique before use, never a counter — and **`op=allocid` refuses those prefixes** (the plane mints them; no caller
  allocates one). A prefix whose objects every caller may see (the shared corpus: `INFO`, `ENT`, `REL`) keeps its counter,
  because counting what everyone can see discloses nothing. The builder enumerates every `allocId` caller and states per
  prefix which rule governs, as REC-132 did for sight. **Existing ids are never rewritten** — ids are cited — so the rule
  binds new mints only, and ordering by id carries no meaning from here on. `op=allocid` exposing the same counts before
  REC-141 is the same defect, not a reason to accept it.
- **AMENDED 2026-09-19 by BOB #17 — the gated set is the PREDICATE, and `TASK` satisfies it.** The bullet above names
  `CASE`, `DRAFT`, `RVG` and `PROJ`; that was the ENUMERATION made when the rule was written, not a closed set. The
  rule is the sentence before that list — *every prefix whose objects a read withholds from some caller* — and the
  bullet's own instruction to the builder is to *enumerate every `allocId` caller and state per prefix which rule
  governs*. REC-151's builder did exactly that and added **`TASK`**, which is CORRECT and STAYS. The read that
  withholds a task is `taskList`'s `#bundleGate("tk.refers_to", viewer)` (REC-30): a task whose `refers_to` bundle the
  viewer cannot see is withheld whole, and that site's own comment already reasons that *"a count here would say a
  project exists"* — so a counted `TASK` suffix tells a member how many tasks exist that they may not read, which is
  the disclosure this rule exists to close. **Read at the code on `main`** (`bio-plane/src/store.mjs`, `taskList`),
  not from the branch that raised the question, so it does not rest on REC-151 landing. **The set is therefore
  `PROJ`, `CASE`, `DRAFT`, `RVG`, `TASK`** (`Store.GATED_ID_PREFIXES`), and a prefix added later is added by the same
  test, stated with the read that withholds it. A builder applying the predicate to a prefix this document has not
  yet named is FOLLOWING the rule, not widening it — but the landing folds the new prefix in here, so the next reader
  finds the set and the reason together.
- **The legacy residue, stated as a LIMITATION with its closing path (BOB #16, 2026-09-19).** A project created before
  plane-minted ids holds a caller-chosen id, and a creation of ANOTHER bundle type at that exact id answers `EXISTS`, so a
  caller who guesses a hidden legacy project's id learns it exists. Closing it needs either rewriting cited ids (refused:
  citations must keep resolving) or the plane minting EVERY bundle's id (a larger design, not yet made). Until then it is
  stated here, bounded to legacy project ids a caller can guess exactly, and counted: the builder reports how many legacy
  non-`PROJ-` project ids exist in the record namespace.
- **BUILT 2026-09-18 by REC-141 (IC-158, C-59), the plane half.** `Store#promote`: a `base: null` creation typed
  `project`, or any creation whose id is in the `PROJ-` namespace, that names a `bundleId` is refused
  `PROJECT_ID_SUPPLIED` (C-59.1) BEFORE any id is looked up — one answer, taken or not, echoing no id; with none, the
  plane mints `PROJ-<year>-<rand>-<slug of the name>` — `<rand>` four digits from the CSPRNG (`crypto.getRandomValues`), NEVER `allocId`'s counter (BOB #16, *"A MINTED ID CARRIES NO COUNT"*), retried on collision — inside the promote transaction, writes
  `id:` as the first frontmatter line, recomputes the bytes and sha256, and answers `bundleId` and `bundleSha`. Bytes
  already carrying a top-level `id:` are refused `PROJECT_ID_IN_BYTES` (C-59.2), and bytes it cannot write into
  `PROJECT_DOCUMENT_UNREADABLE` (C-59.4). `forkProject` refuses a named `newId` first (`PROJECT_FORK_ID_SUPPLIED`,
  C-59.3), removes the origin's `id:` from the clone, and is minted by the same path, answering the minted `newId`.
  Every other type still names its own id. Driven in `bio-plane/test/project-mint.test.mjs` and
  `project-mint.control.mjs`; the installer's own intake page (`src/setup.mjs`) was corrected with it. The surface half
  is UI-66, DELEGATED.
- **BUILT 2026-09-19 by REC-151 (IC-164, C-59.5), the remaining gated prefixes.** `Store#mintOpaqueId` is the ONE
  minter (REC-141's draw lifted out of `#mintProjectId`): `<P>-<year>-<four digits from crypto.getRandomValues>[-slug]`,
  checked unique against the live rows of its kind, redrawn on collision, never reading or stepping `allocId`'s counter.
  `publishCase` (CASE), `#caseDraft` (DRAFT), `#reviewGrant` (RVG), `taskDrain` (TASK) and `#mintProjectId` (PROJ) all
  call it; `Store.GATED_ID_PREFIXES` is the one list. `op=allocid` refuses every gated prefix — decided on the counter's
  scope, so the dash cannot be moved to reach one — with `ALLOCID_PREFIX_GATED` (C-59.5), allocating nothing; `INFO`,
  `ENT`, `REL` and the caller-allocated bundle prefixes keep their counters. The per-prefix table of every `allocId`
  caller is in IC-164. Existing ids are not rewritten. The legacy residue was counted: 0 (MEASUREMENTS M-69). Driven in
  `bio-plane/test/opaque-ids.test.mjs` and `opaque-ids.control.mjs` (the counter restored for CASE fails by name; a
  `Math.random` or counter-derived suffix passes every behavioural arm and fails the source pins). An opaque id could be
  drawn again after a purge — **CLOSED 2026-09-21 by D-432 (IC-170)**, the next bullet.
- **BUILT 2026-09-21 by D-432 (IC-170) — AN ID THAT HAS EXISTED IS NEVER DRAWN AGAIN, PURGE OR NOT.** The `op=purge`
  comment's rule — *"allocid must never reissue an identifier that has already existed"* — held for the counter because
  `purge` keeps `seq`; the opaque minter had no counter and checked each draw against the LIVE rows of its kind, which a
  purge deletes (every one of them in a whole-store purge, a project's in a single-bundle one), so a citation of a purged
  object could silently resolve to a NEW one minted at its id — the legacy-residue bullet's *"citations must keep
  resolving"*, broken from the other side. `minted_ids`, a table beside `seq` and exempt from `purge` on `seq`'s
  reasoning (it is not derived from the corpus: clearing it is the defect it closes), is the minter's memory:
  `Store#mintOpaqueId` asks it AS WELL AS the live rows on every draw and records every id it hands out, in the minting
  act's own transaction — an act that rolls back (the review copy's dry run of the publish gates) takes its row back with
  it. It records at the DRAW rather than at each caller's own write because `publishCase` stamps a new case id into its
  members' bytes before it writes the case document, so a publish refused between the two left the id in the corpus and
  in no table the old check read. The write is a plain insert into the ledger's key, so were the read ever lost the act
  would fail loudly rather than hand a spent id out. `#migrate` seeds the ledger at every boot from each gated kind's live
  rows and, for the prefixes minted with no tail (`CASE`, `DRAFT`, `RVG`), from the range `seq` says the counter issued
  before REC-151 — used or not, since an allocation handed out is an identifier that has existed. **RULED 2026-09-21 by
  BOB #23, so this is no longer only the builder's reading: that range is SPENT FOR GOOD.** The opaque minter never draws
  an id the counter issued, used or not, on the `op=purge` comment's rule that an identifier which has existed names one
  object and ambiguity is worse than a gap; an allocation never used may still have been written down outside the store,
  and nothing can tell which were. The cost is those numbers leaving that prefix's draws for their year. Nothing counts or lists
  it: a count is how many gated objects were ever minted, hidden ones included (BOB #16). NOT reachable by any seed,
  stated: an id that left every live table before this landing and that no counter recorded (a `PROJ` or `TASK` counter
  id whose slug is gone, an opaque id minted and purged before the ledger existed). Driven in
  `bio-plane/test/mint-ledger.test.mjs` under a FORCED draw — a build whose only edit makes the first attempt return the
  purged id's own suffix, so only the ledger can refuse it — including a legacy build's store upgraded in place; controls
  in `mint-ledger.control.mjs`.
- **BUILT 2026-09-19 by UI-66, the surface half.** `civicos-ui/app.html`'s Add surface creates a project with no
  `op=allocid`, no `bundleId` and no `id:` line, and opens the `bundleId` the plane answers; the fork form asks for the
  fork's name only and its receipt shows the `newId` the plane answers. A C-59 refusal renders in its canned
  translation. Driven against the real plane in `civicos-ui/test/project-id-surface.test.mjs` (the id shown is the
  `id:` line of the registered bytes; no id is SENT) and `project-id-surface.control.mjs`.
- **RULED BY BOB, 2026-09-18 — a project does not own a line of inquiry.** *"Anybody can ask a question related to
  anything - even something also being explored in a project they're not a member of. A project doesn't own an area of
  enquiry to the exclusion of others."* So any member may ask any question and run an investigation on any question they
  can see; **the run verdict never consults a project the member cannot see**, which closes the one-bit disclosure REC-139
  found. DEC-63 is amended accordingly: project participation no longer gates a run over a question the member can see.
  **How it applies at the code (BOB #16, 2026-09-19, read at `airun.mjs projectGate` and `Store#aiRunProjectGate`):** a
  run whose context is an INQUIRY consults no project for its verdict — `AI_RUN_NOT_PROJECT_MEMBER` is never said over a
  question — and its stated count stays the citing projects the caller can see; a run whose context is a PROJECT keeps
  the joined-participant gate, because a project's contents are private to its participants. **BUILT 2026-09-19 by
  REC-145 (IC-162):** `airun.mjs runConsultsProjects` is the one answer to which contexts are gated (a PROJECT only),
  read by `projectGate` and by `Store#aiRunProjectGate` before it asks any participation question; every question
  answers on ONE ground, `INQUIRY` (which replaces `PROJECTLESS` — that ground was said only when no project cited the
  question, so its absence carried the same bit); C-22.8's translation now speaks of a project, not a question. Driven
  in `bio-plane/test/project-disclosure.test.mjs` §3 and `airun-projectgate.test.mjs`; controls in
  `project-disclosure.control.mjs` and `nc-pl18.mjs`.
  **WHO MAY TICK AND CLOSE A RUN — decided 2026-09-19 by BOB #16 on REC-145's gap.** Opening was the only act the gate
  ever asked about; tick and close shared it, so once the project gate stopped applying over a question, any member with
  `contribute` could drive or end ANOTHER member's run. **Tick and close are the run's PRINCIPAL's acts** — the member
  (or that member's minted machine credential) the plane stamped as `ai_runs.principal_plane` at open — because a run's
  work is attributed to its principal (DEC-24; AI Roles rule 4), so a tick by anyone else writes acts under a name that
  did not take them, and closing it directs someone else's work (administrators included: they direct nothing, §4). A
  run nobody drives ends by its own lease and bounds (`#aiRunReap`); no member ends another's. A caller who cannot see
  the run's context is answered as for a run that does not exist; one who can is refused positionally. This narrows
  today's project-context behaviour too (a joined participant could tick or close a co-participant's run), deliberately.
  **BUILT 2026-09-19 by REC-152 (IC-165, C-22.12 `AI_RUN_NOT_PRINCIPAL`):** the control plane stamps the caller's
  principal on the tick and the close by the expression that stamps `principal_plane` at open; `airun.mjs
  runPrincipalGate` compares the two, reading a member and a credential minted for her as one principal (the part
  before the `/`) and a token class or an organisation-kind key whole; sight (`op=airun`'s own predicate) is asked
  first. The reaper does not pass through either door. Driven in `bio-plane/test/airun-principal.test.mjs`, including
  a caller who SENDS the principal's id; controls in `airun-principal.control.mjs`.
  **AND THE CONTEXT KIND IS CHECKED (the same day, same source):** `aiRunOpen` never compared `contextType` with the
  named bundle's type, so a run labelled `inquiry` over a PROJECT's id consulted no project — a way around the project
  context's gate that predates REC-145 (such an id is cited by nothing, so it read PROJECTLESS). A run's `contextType`
  must equal the named bundle's type; a mismatch is refused, and an id the caller cannot see answers as absent.
  **Two more, decided 2026-09-19 by BOB #16 on REC-153's findings:** (i) **a machine credential sees no more than its
  principal member** — the lead rule, *a machine credential only within a member's minted scope, never unfiltered* — so
  an `ai` credential's open over an id its principal cannot see answers as absent, exactly as that member's own open
  does, whatever kind it names; (ii) **the context kind is the closed vocabulary `RUN_CONTEXTS` (`inquiry`, `project`)**,
  and any other word is REFUSED, never matched against the bundle's type (a closed vocabulary refuses, it does not
  ignore — `EXPERTISE_IS_NOT_ASSIGNED`'s precedent). Runs already stored under a mislabelled kind are never rewritten
  (the log is append-only); the builder COUNTS them in the record namespace and states the number, UNDETERMINED until
  counted. **BUILT 2026-09-19 by REC-153 (IC-163, C-22.11 `AI_RUN_NO_SUCH_CONTEXT`), all three:** `airun.mjs
  checkRunContextKind` decides at the open, before the gate, in this order — the word is `RUN_CONTEXTS`' or refused; an
  id the caller cannot see (`Store#inSight`, failing closed without the viewer stamp; an `ai` credential sees as its
  principal) is refused as absent for EVERY caller and kind; a seen bundle of another type is refused. One refusal, built
  only from what the caller sent, so mismatch, absent and hidden are one object. Because sight now comes before position
  here too, C-22.8 is said only over a project the caller can see. The stored mislabelled runs are **UNDETERMINED — not
  counted** (MEASUREMENTS M-68: no op enumerates runs, and the operator read that would total them was not run by the
  builder). Driven in `bio-plane/test/airun-contextkind.test.mjs`; control `airun-contextkind.control.mjs`.
- **RULED BY BOB, 2026-09-18 — EACH PROJECT CHOOSES whether it is DISCOVERABLE or HIDDEN.** *"The project's contents
  might be private, though the existence of the project may not be. In this way, somebody who sees the project can ask to
  be added as a member of the project"*; asked whether every project or each project, Bob: *"2, each project chooses"*.
  **This amends §7.9's *Uninvited* row.** A DISCOVERABLE project shows every member its existence and name (its contents
  stay private to participants) and accepts a REQUEST TO JOIN, which its owners grant or decline (§7: owners manage
  participation; the request and the answer are recorded). A HIDDEN project is exactly §7.9 as written — invisible to the
  uninvited, answering as if it did not exist — and everything built for that stays correct for it. **Recommended default:
  DISCOVERABLE** (BOB #15; the setting is the owner's, recorded and dated). The setting, the join request, and each surface that lists projects are DESIGNED in §7.14 (BOB #16,
  2026-09-19), which replaces the recommended default with a choice the creator is asked to make.
- **Contract:** the founder gains sight, so it is an I3 change with its own IC (classification is the integrator's).
  **Negative controls:** the founder's session lists a project it was never invited to; it still cannot read another
  member's unshared lead; `memberAdd` with id `admin` is refused; the admin token's answers are byte-identical before and after.
- **BUILT 2026-09-18 by REC-132 (IC-149).** `sessionCaseViewer` became `resolveSession` (`src/index.mjs`), returning
  `viewer`, `identity` and the folded `member`; the store asks WHO through one helper, `#positionalMember`, at the lead
  reads, the internet frontier and D-310's owner fact; `MEMBER_ID_RESERVED` is C-55.1; `op=audit` carries `membership`.
  The per-site table of which arm governs is IC-149's. All four controls DRIVEN in `bio-plane/test/founder-sight.test.mjs`
  and `founder-sight.control.mjs`.

**What the skeleton excludes**, for the invited: the project's own
content, its analysis record, its work product, its evaluations, its
session log, and its participant list.

**The interest graph does not leak, and this is a property of the edge
model rather than a concession.** Per BIO_State_Rules_Consistency Section
5.2, `cites` lives on the citing object, so a Project's interest in a
piece of Information is a property of the Project. The Information carries
no record of who cites it. A member who cannot see a project therefore
cannot see what it cites, and cannot recover it by inspecting the
Information either.

The one place the graph could escape is the index, which derives the
reverse-edge graph (Section 5.3). Because the index is regenerable,
per-group, and explicitly never authoritative, **derived reverse edges
into projects MUST be filtered by the viewer's position**. This is an
implementation obligation, not a design tradeoff, and it costs nothing
doctrinally. An unfiltered index would leak the interest graph to every
member and would be a defect.

**Why the evidence corpus stays shared.** Information and Focuses remain
visible to the group's members generally. Compartmenting the evidence
would fracture the thing the record exists to be, and would mean a member
working on one project could not see material another project had already
gathered. What project participation scopes is the group's thinking:
where an argument has got to, what has been ruled out, what is being
prepared. That is the material with strategic and tactical value before
publication.

**7.10 Ownership, and how it changes.** Confirmed July 26, 2026.

Ownership is a set, not a single seat. It follows the Section 4.7 process for
administrators, with one deliberate divergence and one relaxed floor.

**The floor is one owner.** Unlike the two-administrator floor of 4.2, which
exists to satisfy Design Requirement 1 at the instance level, a project run by
one person is a normal and permanent condition. Nothing pushes a project toward
a second owner.

**Addition.** The sole owner may add a second owner unilaterally. Every
subsequent addition requires the consensus of all existing owners. This is 4.7's
rule unchanged, and for 4.7's reason: without consensus on addition, one owner
recruits confederates and manufactures the majority that then removes the
others. Closing that door is what makes the removal rule safe.

**Removal.** A majority of all owners, counting the target in the denominator
but not permitting them to vote, except at exactly two owners, where removal
requires both owners to agree and the target is one of them. Ties do not remove.

| Owners | Votes needed | Eligible voters | Effect |
|---|---|---|---|
| 1 | — | — | impossible; one owner is the floor |
| 2 | 2 | 2 | both agree, the departing owner included |
| 3 | 2 | 2 | unanimity of the others |
| 4 | 3 | 3 | unanimity of the others |
| 5 | 3 | 4 | three of four |
| 7 | 4 | 6 | four of six |

**Why two diverges from 4.7, and why it is still safe.** For administrators,
removal at two is impossible and that impossibility is the point: it prevents
capture at the smallest size, and the floor of two means a group never has to
get below it. Projects have a floor of one, so if removal at two were impossible
the floor would be reachable only by never adding a second owner, and adding a
second owner would be permanent. Letting the target vote at two describes what
the act actually is at that size: one owner resigning, with the other's assent.
It opens nothing, because the only removal it permits at two is one the target
has agreed to. A hostile removal at two remains impossible, exactly as in 4.7.

**Owners are participants.** An owner is a joined participant with the owner
flag. Removing someone's ownership by this process leaves them a participant;
removing them from the project entirely is then 7.7.

Ownership changes are recorded with the deciding owners and a reason.

**7.11 Deactivation and reactivation.** Confirmed July 26, 2026.

A project is deactivated to communicate that its participants are no longer
pursuing it, and reactivated when they resume. **This is the lifecycle the
project object already has and not a second switch beside it.** Deactivation is
the `closed` state with a `closed_reason` of `abandoned`; reactivation is the
`closed` to `investigating` transition, which is the one reverse transition the
state machine has and is there for this. Nothing new is added to the state
vocabulary.

`abandoned` is what distinguishes a deactivated project from a finished one,
which closes as `resolved`, and from one overtaken by another, which closes as
`superseded`. A reader of the record can tell the three apart.

Keeping this in the lifecycle rather than in a separate flag is not a
presentation preference. A project whose status lived in two places would have
two answers to the same question and no rule saying which one wins.

**Only owners deactivate and reactivate.** Administrators do not, per the
opening of this section.

**7.12 Fork.** Confirmed July 26, 2026.

Any JOINED participant of a project may fork it, creating a clone.

**Joined, and not merely invited.** An invited participant who has not joined
sees the skeleton only, per 7.9: the Focuses, the Information and the Actions,
and none of the project's content, analysis record, work product or evaluations.
A fork by such a member would either copy material they cannot read, which
leaks it, or copy only what they can see, which is a different and lesser
operation wearing the same name. Restricting fork to joined participants makes
the leak impossible rather than managed, and leaves fork meaning one thing.

- **The name must differ** from the original's, and must be unique across the
  instance like every project name, per 7.1. The second requirement subsumes the
  first, and both are stated because a fork is the one operation where a caller
  is working from an existing name and most likely to reach for it.
- **The forker becomes the clone's sole owner**, regardless of who owned the
  original and regardless of whether the forker owned it.
- **The clone carries no other participants.** The forker invites whom they
  choose, from nobody. Copying the original's roster would let a forker
  manufacture visibility for people the original's owners had chosen, which is
  7.3 defeated by a button.
- **The forker must hold create-projects.** A fork creates a project, and
  without this requirement fork is a route around the capability by which any
  participant creates projects they were not trusted to create.
- **The clone records its origin** as a `derived_from` reference to the
  original, which is already in the closed relationship vocabulary of
  BIO_State_Rules_Consistency Section 5.1 and needs nothing added to it. The
  reverse view arrives from the index, filtered by the viewer's position like
  every other derived edge, so a fork does not disclose the original to someone
  who could not already see it.

Fork is the remedy available to participants when they disagree with where a
project is going and cannot change it by the owner process.

**7.13 When every owner is inactive.** Confirmed July 26, 2026.

Only owners manage participation and lifecycle, and administrators may
deactivate members. Those two rules together strand a project: an administrator
can end the access of a project's only owner and then be unable to touch the
project, which accepts no new participants, cannot be reactivated, and cannot
change hands.

**An administrator may add one owner to a project when every existing owner of
that project is inactive.** That is the whole of the exception.

- **The condition is objective and cannot be manufactured piecemeal.** It is
  every owner, not any owner, so an administrator cannot reach a live project by
  deactivating one inconvenient person. Reaching a project with an
  administrator among its owners additionally requires the 4.7 vote, per 4.9.
- **It adds rather than replaces.** The inactive owners keep their rows. If one
  is later reactivated they are an owner again, alongside the added one, and
  removing them is then the ordinary 7.10 process. Nothing about this exception
  strips anyone, which is what keeps it from becoming a route around 7.10.
- **It is recorded** with the acting administrator, the named new owner, and a
  reason, and it is visible to every participant of the project.

The narrower alternative, that deactivating a member vacates their ownership
outright, was considered and rejected: it makes a member's deactivation silently
destroy project state, and it hands administrators the ability to empty a
project's ownership one member at a time.

**7.14 Discoverable or hidden, and the request to join.** Designed 2026-09-19 by BOB #16 from Bob's ruling of 2026-09-18
(the §7.9 bullet above: *"each project chooses"*; *"somebody who sees the project can ask to be added as a member"*). It
decides mechanism only; where a choice touches people outside the project it follows an existing ruling, named.

**The setting.** A project is DISCOVERABLE or HIDDEN, and nothing else.
- **HIDDEN is §7.9 exactly as written and built** (REC-138): the uninvited see nothing, and every act and read answers
  them as for a project that does not exist. Nothing built for §7.9 changes for a hidden project.
- **DISCOVERABLE adds ONE thing for the uninvited: the project's EXISTENCE and NAME** (its `title`, §7.1), and the one
  act that existence is for — asking to join. Its contents stay private exactly as for a hidden project: not its
  references, not its Focuses, its Information or its Actions, not its participants or owners, not its lifecycle
  state, and not its presence in any derived reverse edge (the interest-graph rule above is unchanged). Bob's words
  are the boundary: *"the project's contents might be private, though the existence of the project may not be."*
- **Only an OWNER sets it** (the opening of §7: owners hold authority over a project; administrators direct nothing).
  It is NOT a field of the project document, because a JOINED participant may revise that document (REC-134) and
  would then set an owner's choice. It is an owner's ACT, recorded append-only with the owner, the date and an
  optional reason (Bob: the setting is recorded and dated); the current setting is the latest record. Administrators
  and the founder see the setting and its history (sight, §7.3) and cannot change it. §7.13's rescue does not set it.
- **Every project that exists when this is built is HIDDEN.** Each was created under §7.9's promise that the uninvited
  see *"not its existence"*; making it discoverable without its owner choosing would break that promise to people who
  relied on it. Its owners may change it. So a project with no visibility record reads HIDDEN, and no migration writes one.
- **A new project is created with its setting CHOSEN.** The create and fork surfaces ask the creator, with NEITHER option
  preselected — *each project chooses* is taken literally, and a preselection would be the surface choosing. BOB #15
  had recommended DISCOVERABLE as the default; that recommendation is superseded by the forced choice, and Bob may
  overrule it. **At the plane, a creation or fork that carries no setting is HIDDEN** (fail closed: a machine
  credential, a legacy caller, or a forgotten field discloses nothing). A fork does not inherit the original's
  setting; it is a creation (§7.12) and its forker chooses.

**Sight, now three levels, still ONE predicate.** `#inSight` answers NONE, EXISTENCE, or the invited/joined sight it
answers today. EXISTENCE is returned only for a DISCOVERABLE project to a member SESSION outside its participants.
Machine credentials are unchanged (they already see every bundle); administrators and the founder are unchanged (they
already see everything). Because every project-targeted act asks this one predicate (REC-138), the change lands at one
point, and at every act:
- NONE → `#noSuchProject`, byte for byte, as today.
- EXISTENCE → the join request is permitted; every other act is refused POSITIONALLY with a new code saying the caller
  is not a participant, carrying the project's id and name and NOTHING else. A "does not exist" answer here would be
  a false statement about a project the directory has just shown the caller — the record claiming what is untrue.
- The invited/joined levels → as today.
**Record reads do not widen.** `viewerPredicate` is NOT changed: a discoverable project stays out of every record read,
search, citation list, reverse edge and run report of the uninvited, because those reads return CONTENTS. Existence
reaches the uninvited through exactly one new read, the DIRECTORY, and through the positional refusal above.

**RULED 2026-09-23 by BOB #32 (REC-149's gaps; SCHEDULER #17's 22:56Z questions).** (a) **A read naming a discoverable PROJECT'S
OWN id is answered POSITIONALLY at EXISTENCE**, exactly like an act: otherwise the record would call a project the
directory has just shown the caller nonexistent. A read naming anything INSIDE the project (a bundle, a reference, a run)
answers exactly as it does today, because that thing's existence is contents; `viewerPredicate` stays unchanged.
(b) **Create and fork take one optional field, `visibility` (`discoverable` or `hidden`)**, and an absent one is HIDDEN.
A MACHINE credential never sets it: the setting is an owner's act, and an ownerless project has no owner to choose. Its
creation is therefore HIDDEN, and a `visibility=discoverable` it sends is refused by name. An owner who arrives later
may set it.
**(a) BUILT 2026-09-25 by REC-196.** One check at the store's door, before any read runs: for a read op in
`Store.PROJECT_NAMING_READS`, each parameter that carries a bundle id is asked `#existenceAct`, and a discoverable project
the caller sees at EXISTENCE answers C-70.1 — the id and the name, nothing else, exactly the act's refusal. Anything else
(an id inside the project, an absent id, a hidden project, a caller with full sight) reaches the read unchanged. Every
read op that carries an id-named parameter is classified in that table or in `Store.PROJECT_NAMING_READS_NOT` with the
reason its parameters never name a bundle; `project-sight.test.mjs` §11 sweeps them, so a new read cannot land
unclassified. The roster read (`op=projectparticipants`) now takes the control plane's viewer stamp for this check alone.
**(b) BUILT 2026-09-25 by REC-197.** The field is `visibility`, exactly as ruled, on the two creations: `op=promote`
creating a project (a project bundle with no base) and `op=projectfork` (which creates through `promote`, so one rule
serves both). A PRESENT value from a creation with an owner is recorded as that owner's act — one row of
`project_visibility`, `set_by` the owner, no reason (the owner gave none), in the creation's own transaction — and
`hidden` is recorded too, because the owner chose it. An ABSENT value writes NOTHING, so the project reads HIDDEN through
the sight index's one default and no second copy of the default exists; a fork does not inherit. WHO IS A MACHINE is
decided by OWNERLESSNESS, the ruling's own reason, never by a class list: the control plane stamps `ownerMemberId` for a
member session alone (deleted first for every caller), so a creation with none has no owner to choose. Its
`visibility=discoverable` is refused by name (C-97.1, `PROJECT_VISIBILITY_NO_OWNER`) and nothing is created; its
`visibility=hidden` is accepted and writes nothing, since it asks for exactly what an ownerless creation gets. Two
refusals follow from the field existing, each named: a value that is not a setting answers C-70.3 (one helper, shared
with the owner's act, so the two doors cannot disagree about what a setting is), and a `visibility` on anything that is
not a project's creation — a revision, another type — answers C-97.2 (`PROJECT_VISIBILITY_NOT_A_CREATION`) rather than
being ignored, since an `ok` over it would tell the caller a choice landed that nobody recorded. The creation's answer
carries `visibility`, READ BACK from the record. `project-sight.test.mjs` §12 drives every arm through the ops.

**The directory.** One read, for a member session: the DISCOVERABLE projects the caller does not participate in —
each project's id and name, and the state of the caller's OWN request to it if any. Nothing else. A hidden project is
never in it, so its absence from the directory is the same answer for "hidden" and "does not exist".
**IT IS PAGED, AND THE PAGE IS PUBLISHED** (D-479, 2026-09-24, on SCHEDULER #17's finding; the design decides
mechanism, so this belongs here): the read answers at most a named cap (`PROJECT_DIRECTORY_LIMIT`), which a caller may
LOWER and not raise, and it publishes beside its list the bound it APPLIED and whether more exists. `truncated` is
MEASURED, by looking one project past the cap, never derived from the list returned — a full page and a complete
answer read alike otherwise. WHY THE BOUND IS PART OF THE DESIGN AND NOT AN IMPLEMENTATION DETAIL: this is the ONE
read through which a discoverable project's existence reaches somebody outside it ("Record reads do not widen"), so a
project silently past the cut would be, to that member, a project that does not exist — which is precisely the answer
this section reserves for a project its owner chose to HIDE. A cut that is not said turns an owner's choice into its
opposite.

**The request to join.**
- **Who may ask:** a member session with EXISTENCE sight of the project — uninvited, active, not already a participant.
  At most ONE OPEN request per member per project. The request may carry a short comment (§7.6's precedent).
  A request to a HIDDEN project, or to one the caller cannot see, is answered `#noSuchProject`, byte for byte.
- **Who answers:** an OWNER (§7.2: only owners invite). GRANT is an invitation: it writes the requester's participation
  as `invited` with `invited_by` = the granting owner, exactly as §7.2's invite does, and the requester then JOINS by the
  checkbox (§7.4) — a grant is not a join, because §7.4 makes joining the member's own act. DECLINE is recorded with an
  optional comment. Administrators see requests (§7.3) and answer none.
- **Who sees a request:** the requester (their own, always — it is their act), the project's owners, and administrators.
  Not other participants: a pending requester is not a participant (§7.8 lists participants).
- **The requester may withdraw** an open request. After a decline or a withdrawal they may ask again; owners decline
  again. Ownership is the remedy for a nuisance, not a cooldown nobody ruled.
- **Setting a project HIDDEN LAPSES every open request to it**, recorded as lapsed. The directory stops listing it, and
  every act answers the lapsed requester as NONE — except that a requester keeps sight of their OWN request record,
  which names only what they already saw.
- **A project whose owners are all inactive** still records requests; they wait for an owner, and §7.13 is the remedy.
  The requester is told the request is open, never why it is unanswered.
- **Recorded, append-only**: the request, its comment, its answer, the answering owner, the dates.

**What this does not change:** §7.1's name uniqueness (a hidden project's name still refuses a new project's by
`NAME_TAKEN`, which names nothing, REC-139); DEC-63 as amended (the run verdict consults no unseen project, and a
discoverable project is unseen for that purpose, since only its existence is visible); §7.12's fork (joined only); the
reverse-edge filter; the evidence corpus, which stays shared.

**Decomposition** (the BOB INBOX, 2026-09-19): (1) the setting, the three-level sight at the one predicate, the directory
and the positional refusal — plane, I3, one IC; (2) the request lifecycle — plane, I3, one IC, after (1); (3) the create
and fork surfaces' forced choice and the owner's setting control — UI, after (1); (4) the directory, the request, the
owner's request queue and the requester's own requests — UI, after (1) and (2). Each builder boots a predecessor's store
(every existing project reads HIDDEN) and drives the negative controls in the inbox entry.

**Step (1) BUILT 2026-09-23 by REC-149 (IC-231, C-70).** The setting is `op=projectvisibilityset` (owner only, through
`#isProjectOwner`; everyone else C-70.2, an unknown word C-70.3), recorded append-only in `project_visibility` — the
latest row is the setting and no row is HIDDEN, so no migration was written. `op=projectvisibility` serves the setting and
its history to a caller with full sight. `Store#sight` answers the three levels: FULL is `#inSight`, asked first and
unchanged (`viewerPredicate` is NOT changed); EXISTENCE is asked only after, only of a project, only of a viewer naming a
member, only when the project reads discoverable. Every project-targeted act asks `#existenceAct` just before its REC-138
sight line, so NONE still reaches that line and its byte-identical absent answer; at EXISTENCE the act answers C-70.1
(`PROJECT_SEEN_NOT_A_PARTICIPANT`), carrying the project's id and name and nothing else. `op=projectdirectory` asks
`#sight` over every project and lists those at EXISTENCE with `request: null` (C-70.4 refuses a credential with no
member). Driven in `bio-plane/test/project-discoverable.test.mjs`, which boots a predecessor's store; control
`project-discoverable.control.mjs`, whose `widen-viewerPredicate` arm fails the contents arms by name.
**Step (2) BUILT 2026-09-25 by REC-150 (IC-320, C-95).** The record is `project_join_requests`, APPEND-ONLY AT THE FIELD:
the asking fields (project, member, the name the member was shown, the comment, the date) are written once, and the
closing fields (state, `closed_by`, the closing comment, the date) are written once by the one statement that moves an
OPEN row (`Store#closeJoinRequests`, `WHERE state='open'`); a partial unique index holds at most one OPEN request per member
per project. `op=projectrequest` is the one act open at EXISTENCE: a member session asks, with an optional comment; NONE
(hidden, absent, not a project) is `#noSuchProject` byte for byte; FULL (an invited or joined participant, an administrator,
the founder) is refused C-95.2 because that caller can already see the project; a credential with no member behind it
C-95.1; a second open request C-95.3. `op=projectrequestwithdraw` is the requester's own, and with nothing open answers
C-95.4 whatever the id names. `op=projectrequestanswer` is an OWNER's (C-95.5 for everyone else, administrators, the founder
and machines included; C-95.6 for a word that is not `grant` or `decline`): GRANT writes the participation `invited` with
`invited_by` the granting owner — the row §7.2's invitation writes — and NEVER `joined`, so the requester joins by the
checkbox (§7.4); it is refused C-95.7 for a requester no longer active and C-95.8 for one already a participant, leaving the
request open. `op=projectvisibilityset` to HIDDEN lapses every open request, recorded with the owner who hid it.
`op=projectrequests` serves a project's requests (requester's handle, comment, state, answering owner, dates) to its owners
and administrators — C-95.9 for any other participant, C-70.1 at EXISTENCE, the absent answer at NONE — and, with no
project named, the caller's OWN requests, each naming the project by the id and the name the caller was shown when asking
and never the answering owner (who owns a project is contents); both lists are bounded by `PROJECT_REQUESTS_LIMIT`, publishing
`limit` and `truncated`. The directory's `request` is the caller's own latest request state. Driven in
`bio-plane/test/project-join-request.test.mjs`; control `project-join-request.control.mjs`, whose `grant-writes-joined`
arm fails the invited-not-joined read-back by name.
**RULED 2026-09-23 by BOB #31 — leaving and joining, where the store had gone further than §7.4/§7.6 said (D-311's gap; REC-186).**
(a) A project always has an owner: its LAST owner may not leave, and is refused by name ("transfer ownership first");
op=affordances does not offer leave to that owner, and an owner who is not the last may leave. (b) `op=projectjoin` stays
idempotent, but op=affordances offers an act only where it would change something, so a joined participant is not offered join.

## 8. Secure verified export

Scheduled July 24, 2026. Export is the only real answer to a captured root
of trust, because a group that cannot leave is a group that can be held.
It is also, and this is the whole difficulty, exactly the capability an
attacker wants most.

**The tension, stated before the design.** A full export of the working
corpus is the group's entire unpublished position: what it has found, what
it is preparing, what it has ruled out. If any administrator can take
that, then a single captured administrator exfiltrates everything, and
the export feature becomes the most efficient attack in the system. An
export capability that is safe to leave lying around is not an export
capability worth having.

**Two paths, because there are two situations.**

**8.1 Full working-corpus export requires the root of trust.** Not
in-app administrator status: the ADMIN_TOKEN-class credential. The
export is recorded in the append-only history, so it can never happen
silently, and every administrator is notified. This is the path for a
group deliberately moving hosts, splitting, or dissolving. A captured
in-app administrator cannot use it.

**WHAT OF 8.1 IS BUILT (D-52; stated 2026-09-19 by BOB #17 as the requirement
it then was, and BUILT 2026-09-23).** Both halves are built. The RECORD half:
`export_log` writes the append-only row and `op=exportlog` makes it readable.
The NOTIFICATION half: every `export_log` row is raised as the FINDING
`export-performed` — catalogue id N-1, the first `N-<n>` allocated — in EVERY
administrator's queue (each in-app administrator, the founder's session, and
the ADMIN_TOKEN credential) and in no one else's, its `basis` naming the log
row and its one option the producer's own, reading the log
(`store.mjs #findingsExportPerformed`, derived on read from the log itself;
`bio-plane/test/exportnotice.test.mjs`). The channel is the QUEUE — one queue
with three homes (`NOTIFICATIONS.md`, Bob, 2026-08-01), BOB #19's narrowing of
2026-09-21. **Two limits, stated rather than left to be found.** Only
TRANSPORT beyond the app — email, or the communications surface the Roadmap
describes — stays Bob's (D-98), so an administrator who never opens the app is
still not reached. And no act yet clears the notice from a list: a disposition
is scoped to a project and an export has none, and a member's personal mute of
a finding (D-125) is ruled and not built, so the notice is bounded to the log's
newest 200 rows and says so.

**8.2 Published-record reconstruction requires nothing at all.** Published
material is content-addressed, and its hashes are public and verifiable by
anyone with `ssh-keygen` and the doorbell. Any member, or any stranger,
can rebuild and independently verify the published record without the
cooperation, permission, or continued existence of the instance it came
from. Nothing can be withheld here, by construction, because withholding
it was never possible.

**The honest limit.** If the root of trust itself is captured, the
remaining members leave with everything published and lose the unpublished
thinking. That is a real loss and it should be stated to groups plainly
rather than glossed. It is also the correct trade: the unpublished
material is precisely what must not be extractable by whoever acquired a
credential. A group worried about this holds its own local copies through
normal use, which the bundle format already supports.

**What "verified" must mean.** An export carries its own manifest and is
checked on both sides: every file hashed on the way out, every bundle's
history chain and base links re-derived on the way in, every registered
capture byte-compared. The receiving instance trusts nothing the sending
instance asserts. The migration tooling already demonstrates a full
verified transfer of the real record, so this is a productization of a
proven path rather than new ground.

**Why this belongs in this document.** Exit is what makes every other rule
here enforceable. Consensus on adding administrators, majority on removing
them, and separation of hosting access all assume that a group which loses
those arguments can still walk away with its work. Requirement 3 says
groups form and dissolve freely; Requirement 13 says compromising one
group must not compromise the network. Applied inward, a captured instance
is a captured group, and the prescribed response is to fork away from it.

## 9. Architecture debt: the root of trust is unmodelled

Recorded July 24, 2026 as debt, deliberately not resolved.

This document leans on "the root of trust" in three places: as the
backstop when an administrator is captured (4.6), as the reason hosting
access must be separated from administrator status (4.8), and as the
credential that gates full working-corpus export (8.1). In each case the
concept does real load-bearing work.

**The system has no first-class representation of it.** What exists is
ADMIN_TOKEN, a bootstrap credential living in the Worker's own settings,
which was designed for a different job: to be spent once when a group
claims its instance, and to serve as the recovery path when a password is
lost. It became the root of trust by accident of being the only thing that
can reclaim an instance.

Four consequences, all of them debt rather than defects:

1. **It is a proxy, not the thing itself.** Anyone with hosting access can
   read or replace ADMIN_TOKEN. So gating export on ADMIN_TOKEN really
   gates it on hosting access, which is the correct effect reached by an
   unmodelled route. Section 4.8 asks groups to separate hosting access
   from administrator status, and the software cannot verify that they
   did, cannot show them whether they did, and cannot behave differently
   if they did not.

2. **It has no custody model.** There is one string. There is no m-of-n,
   no split custody, no way for a group to require two of its three
   trusted holders to act together. For the single most consequential
   power in a group's instance, that is thin.

3. **It is not auditable.** A change of ADMIN_TOKEN happens in a hosting
   dashboard and leaves no trace in the record. The instance can observe
   that its bootstrap credential no longer matches what it saw before, and
   in fact does exactly that to offer re-claiming, but a group cannot ask
   the record who held the root of trust and when that changed.

4. **It cannot be rotated without ceremony.** Replacing it returns the
   instance to unclaimed, which is appropriate for recovery and much too
   heavy for hygiene. So in practice it will not be rotated, and a
   credential that is never rotated accumulates exposure.

**Why this is recorded rather than fixed.** Doing it properly means
deciding what the root of trust IS for a BIO group: a set of named key
holders, a threshold policy, an out-of-band recovery instrument, or
something that deliberately lives outside the software. That is a doctrine
question of the same weight as the membership model itself, and it
deserves its own analysis rather than being settled as a footnote to this
one. Until then, every claim in this document about the root of trust
should be read as "whoever controls the hosting account," because that is
what it actually means today.

## 10. Data model sketch

Extends the existing `members` and `signers` tables rather than replacing
them. Concrete DDL belongs with the implementation; the shape is:

- `members`: handle (primary key, unique instance-wide), cover
  (required, administrator-assigned), pairing_published (boolean),
  capabilities (set), status, timestamps. **No expertise column**; see below.
- `member_expertise`: handle, label, declared_at, confirmed_by, confirmed_at,
  withdrawn_by, withdrawn_at. One row per claim per member. v1.4 modelled
  expertise as a list on the member row, which cannot carry a confirmation
  state, a confirmer, or a withdrawal per entry, all of which Section 1.3 now
  requires. The member writes `label` and never the confirmation fields; an
  administrator writes the confirmation fields and never `label`, so a
  confirmation cannot become an assignment.
- `invitations`: code hash, cover, capabilities, created, spent_at.
  Spent rows retain no addressing information.
- `projects`: bundle_id (the PROJ- bundle), created. **No owner_handle
  column**; ownership is a set and lives on the participant row, per 7.10.
  v1.4's single owner column cannot represent it.
- `project_participants`: bundle_id, handle, state (invited, joined,
  leave_requested), owner (boolean), comment, timestamps, acted_by.
- `project_owner_votes`: bundle_id, subject_handle, action (add, remove),
  voter_handle, created. The Section 7.10 process, recorded the way Section
  4.7's administrator votes are.

Handles are the join key everywhere, so the record never stores a cover
alongside content.

**A project's active state is not in this sketch on purpose.** Per 7.11 it is
the `current_state` and `closed_reason` of the project bundle's own document,
and duplicating it into a table would give it two homes.

## 11. What must be true before this ships

1. The index MUST filter derived reverse edges by the viewer's position
   with respect to each project. An unfiltered index leaks the interest
   graph and is a defect, not a tradeoff.
2. The cover field labelled and documented as a distinguishing label
   rather than a legal name, wherever it appears.
3. BIO_Technical_Architecture_Decisions v10 Section 10 annotated to point
   at this document, so the two do not disagree in silence.
4. The one-person case verified to touch none of this.
5. **Any implementation comment or test citing 7.7 for administrator removal of
   project participants corrected**, not exempted. v1.4's 7.7 said the opposite
   of v2.0's and code was written against it. A rule that breaks the tests
   asserting the old rule is doing its job.
6. **The 7.10 owner arithmetic verified at two owners specifically**, because it
   is the one row where it diverges from Section 4.7 and therefore the one row a
   shared implementation would get wrong by reuse.
7. **Fork verified to require create-projects, to require JOINED participation,
   and to copy no participants.** All three are the difference between a fork
   and a privilege-escalation route.
8. **Project name uniqueness enforced in the check catalog and at the write
   path, not in the interface.** Per 7.1 it is case-insensitive,
   whitespace-collapsed, and holds across deactivated projects. It is a rule
   about the project object, so BIO_State_Rules_Consistency Section 4.3 needs
   the same annotation as item 3 gives the token-mechanics decision.
   *(BUILT at both halves, 2026-09-23: the write path by `promote` and the fork, `NAME_TAKEN`; the catalog by D-50,
   C-77, `checkProjectNameUniqueness` over a handed corpus, through the one `projectNameKey` both import. The State
   Rules §4.3 annotation is still unenacted — see the front matter's Incomplete sections.)*
9. **The live record checked for existing collisions before the constraint is
   enforced.** Checked July 26, 2026 against the working instance: 30 bundles,
   one project, no collisions, so the constraint costs no migration TODAY. It
   must be rechecked against any instance before the rule is turned on there,
   because a uniqueness constraint applied to a record that already violates it
   fails at the wrong moment.
8. **A capability a member does not hold verified absent from the interface, and
   refused by the operation layer anyway.** Section 5 requires the first. The
   second is required because an interface is not a boundary, and a member
   without publish reaching ratify and being stopped only by the absence of a
   signing key is the key doing the capability's job.
