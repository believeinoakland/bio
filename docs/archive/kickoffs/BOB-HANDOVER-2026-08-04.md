# BOB session handover — 2026-08-04

The previous BOB session lost remote access and ended mid-stream. **Everything durable
was committed and pushed as it happened** — verified against `origin/main` at handover;
nothing is stranded in that session's tree or scratchpad. This file is the resume point:
what the day produced, what is open, and where the live edges are.

## The day's arc, in the order it happened

1. **The disk filled to zero and blocked publishing.** Cause measured, not guessed: the
   test battery leaks one OS temp dir per miniflare instance — 23,263 dirs, 41 GB.
   Reclaimed 37.2 GB (deleting only dirs older than the then-running battery). Recorded
   as **D-186**, fix queued as **M0-8** (dispose in `finally`; orphan sweep that spares a
   live battery; the count-must-not-grow assertion).
2. **Workers PAID confirmed by provoking the platform** (`MEASUREMENTS.md` 2026-08-04):
   the upload Free refused with code 100328 now returns HTTP 200 with
   `limits:{"cpu_ms":50000}` echoed. Probe worker deleted, 404-verified. This cleared
   DEC-42's one blocker; CPDF-12's deployed tesseract probe is CONDUCT's to run.
3. **Four rulings recorded** — DEC-32 (plurality inside one finding; falsifier-count
   test; elicitation by consequence questions), DEC-39 (the plane publishes the
   co-attestation fence and it states the QUESTION answered), **DEC-40 (the threshold
   stances are REFUSED as a construct — supersedes shipped UI-18 code**; a reader-supplied
   pair of floors; a filtered rendering states its filter or the harness fails), DEC-41
   (the container carries its PDF; a case without one is IMPORT-ONLY and says so).
4. **DEC-44 — Bob asked for a fact check and the build was wrong**: a published case is
   a CONTAINER OVER ONE OR MORE FINDINGS, not one inquiry. One-case-one-inquiry was
   assumed, never chosen; DEC-32 closes the composition workaround. D-187. A case never
   derives a case-level strength. (CONDUCT has since landed multi-finding work — see
   QUEUE for its report.)
5. **Import designed ahead** — DEC-45 (per-finding project association), then corrected
   by **DEC-46** (Bob's five bias points): the travelling bias manifest PRESERVES a lens
   but cannot APPLY it (dangling bundle ids), so **import lands in a NEW project per
   distinct source bias**; the warning is REGRADE run before association commits, its
   honest limit shipped with the diff; the export-time bias acknowledgement is AUTHORED,
   never a checkbox; D-188 (say HUNCH DEBT — Bob misread his own DEC-20, which is the
   evidence the vocabulary is broken); D-189 (project bias must be visible on surfaces).
6. **The store-as-cache reframing** (`STORE-AS-CACHE.md`, researched with cited external
   strands): **read-through acquisition over a write-once archive** — archives record
   absence, caches retry it away. BIO already has most of a cache under other names.
   Then Bob corrected it twice, and the corrections are the substance:
   - **Three axes** — document / content / meaning — one read-through pattern at three
     altitudes, each with its own miss, repair and state model. Route 1 (query compiler,
     34 fields + 5 FTS columns) is documents; route 2 (meaning tables, unreachable by the
     compiler) is content/meaning. The scalar projections create false coverage.
   - **Four levels searched in any order** — meaning, content, documents, THE INTERNET —
     and never assume the lower levels are complete. Now doctrine in `CLAUDE.md`
     ("CONTENT IS THE UNIT, AND A DOCUMENT IS NOT THE ANSWER" — written there because Bob
     had to re-make the point repeatedly, which is a record failure).
   - New debt: D-190 (unrecorded 10 GB DO ceiling), D-191 (composite temporal spread),
     D-192 (replay integrity), D-194 (a member's LEAD has no home; an empty search is
     not recorded — the authored frontier, pair with D-184). D-129 widened twice (four
     states + graded retention + the authority rule).
7. **The search-completeness research** (`research/SEARCH-COMPLETENESS.md`, seven
   strands, all returned): no field has a completeness threshold; all substitute
   disclosed process + proportionality + burden-on-challenger. Elusion testing refuted
   by its inventors. **Correlated searchers are the universal killer (six fields
   independently) → D-195: DEC-32's OR-max needs a derivable INDEPENDENCE check** —
   content-addressed provenance makes BIO the one system that can compute shared
   upstream origin. **D-196: the completeness statement is prose; the observation log is
   its missing evidence — the two designs are one.** Callaghan's hypergeometric bound is
   the one honest stopping method if anything is ever quantified. Perfect work measures
   at 70%; never ship a recall number; a stop is a presumption a member overrides.
8. **DEC-54 — the policy inhale, ruled BUILD**: Bob's unification — *claiming a standard
   you don't follow and denying a bias you do have are the same failure*. Split an
   inhaled policy into BARS (`required_strength`) and BIAS statements; **publish the
   unenforceable residue as prominently as the extraction** (the countable half is the
   half that does not protect); adoption authored, never installed; the policy pinned
   with source/date/hash and cases name the version.
9. **DEC-55 — AI integration, ruled**: my subscription-forces-member-side recommendation
   was WITHDRAWN on Bob's four corrections (kept visible in the entry — read it before
   reasoning about AI architecture). Corrected shape: **the AI is an agent against the
   plane's endpoint surface** (the App Script lesson: the endpoint surface IS the fence;
   CONDUCT is the unattended existence proof). Bob ruled: **AI-specific tokens, perhaps
   task-specific** → one `ai` class carrying a declared task scope (`scopeFor`'s shape);
   minting is a member act; the record names the principal (org key vs member key);
   REC-46's one-predicate refactor (landed the same day) makes every `MACHINE_CANNOT_*`
   fence catch `token:ai` by construction — the negative control ships with the class.
10. **The Assistant is the pilot** (`ASSISTANT-PILOT.md`): training is SELF-DESCRIPTION
    in five layers by drift rate (recipes are data that FAIL THE BUILD naming a
    nonexistent surface/op; ~305 teaching-grade refusals surfaced verbatim); pilot
    `ai`-token scope is READ-ONLY; answers reporting absence must NAME THEIR LEVEL; the
    wizard navigates and stops — no DOM access, no field entry, no Submit; conversation
    ephemeral (BOB determination, **flagged for Bob's veto**); build starts with the
    surface registry + recipe validation, which needs no AI.

## Open decisions (8, all for Bob) — the working queue for this session

- **DEC-43** — when does `#monitorToken()`'s ADMIN_TOKEN fallback retire (fleet
  visibility first was the recommendation).
- **DEC-47** — may an instance FETCH FROM A SOURCE NOBODY NAMED? (Egress, not AI.
  Recommendation on record: acquire only on an authored act; plans propose in bulk.)
- **DEC-48** — CONDUCT's: should a group get a portable hash-verifiable zip of a single
  captured DOCUMENT (non-case)? **Note: a numbering collision happened here** — my
  evidence-standards ruling briefly overwrote this entry's status and was renumbered
  DEC-54. CONDUCT's DEC-48 is intact and open.
- **DEC-49–53** — CONDUCT-raised while this session ran; the outgoing session did NOT
  review them. Read them fresh.

## Live edges and cautions

- **plancheck may FAIL on unpublished changes and the exit code is the evidence** — run
  it UNPIPED (`cmd | tail` reports tail's status; this bit both CONDUCT and BOB today).
- **CONDUCT runs unattended and writes DECISIONS.md concurrently.** Before adding a
  DEC-n, re-fetch and take max+1 — that is how the DEC-48 collision happened.
- The Ephemerality determination (assistant conversations not part of the record) and
  the DEC-40 enactment (stance selector removal supersedes shipped UI-18 code) are the
  two places Bob most plausibly pushes back — surface them, don't re-argue them.
- Scratchpad artifacts of the old session (cache-inventory notes, the plan-probe script)
  are DEAD with it; their durable content is in `STORE-AS-CACHE.md` and
  `MEASUREMENTS.md` respectively. Do not go looking for them.
