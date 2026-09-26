# bias — requirements

**Status** · DRAFT by a drafting worker for BOB #42, 2026-09-26 (P18), from a reading of the code; for Bob's approval (a product module, P17). Layer 5. Code today (measured on `tranche/T3` @ `7d91579`, after membership's early merge; `build/extraction/bias.md` has the table): `bio-plane/src/store.mjs` 49011–49666 (`biasAdopt`, `biasManifest`, `biasInhale` and their bounds), 18833–18971 and 19436–19488 (the bias arms inside `promote`: the state edge, the set refusal, the statement projection and the re-pin), and the dispatch entries `biasmanifest`, `biasadopt`, `biasinhale` (50202–50234). `bio-plane/checks/bio-checks.mjs` 835–856 (`BIAS_STATEMENT_KINDS`), 5102–5325 (`checkBiasExtension` and its three predicates), 8905–9104 (`BIAS_CHECKS`, C-26.1–C-26.12). `schema.mjs` 2387–2459: `bias_statements`, `bias_adoptions`. `from`: `legacy-store` and `legacy-checks` (K64's pattern); `index.mjs` holds only these ops' routing, gates and stamps, which stay with `control-plane` (K3). The bias-debt sweep (store.mjs 46240–46828, C-26.13–C-26.19, three tables) is keyed by AI run and goes to `ai-runs` (map §5.1). Not yet met: R24, R25, R26 (no rows; Open for Bob 2). No old-plan row is carried here (D-189, the only one naming bias, was dropped as UI).

**Size (P6).** About 1,400 lines move (about 640 without comment-only and blank lines): `store.mjs` 881, `bio-checks.mjs` 446, `schema.mjs` 73. With the debt sweep it would be about 2,130. Well under 4,000.

## Public

### Purpose

Declared bias is how a group says, in the record and in public, the lens it reads evidence through, so a reader can discount it. A bias set is a bundle of statements of three kinds (scrutiny, inference, pattern), each with a subject from the registry and a justification, held to a rule that it may never issue a verdict on a source. A member's authored adoption puts a set in force for the instance or for one project, pinned to the revision adopted. This module checks a set's structure, keeps its statements and adoptions, computes the effective lens in force for a scope with a hash that identifies it, and reads an outside organisation's policy into a proposal without ever installing it. Bias is disclosed and never blocks work.

### Provides

Terms. A **statement** is `{id, kind, subject, text, justification, citations?, locked?, nullifies?}` in a bias bundle's frontmatter `statements[]`. A **scope** is `instance`, or `project` with a project id. A **pin** is the adopted revision's sha and the policy source, retrieval date and hash its frontmatter carries. A **lens** is a scope's effective statement set; its **hash** is R17's `statements_sha`. Every refusal carries its `check` and `translation`. Authors and viewers are the control plane's stamps, read through `membership`.

**checkBiasSet(fm, files) → findings** (the gate and the write path run it through `promotion`, K31)
- **R1** Only a bundle whose type normalises to `bias` is judged; any other answers no findings.
- **R2** C-26.1: no `statements[]`; an entry that is not an object; no id; an id repeated in the bundle; a kind not `scrutiny`, `inference` or `pattern`; neither text nor `nullifies`.
- **R3** C-26.2: a subject that is not a registry key (`ENT-YYYY-NNNN`). C-26.3: no justification, on every kind, a nullification included.
- **R4** C-26.4: a `pattern` statement with no non-empty citation, in a set not at `draft`.
- **R5** C-26.5: text that assigns a truth verdict wholesale (everything or all from a subject is false, lies or fabricated) or calls a speaker a liar or never credible. Strong scrutiny language without a verdict passes.
- **R6** C-26.6: a statement carrying `required_strength` or `bar`, or text setting a threshold (a count of sources, a grade floor): a bar, not a lens.
- **R7** C-26.7: an `adopted` set whose `## What This Does Not Enforce` section is absent or empty.

**Its share of a promotion** (checks and a projection registered with `promotion`, K31)
- **R8** A promotion whose promoted type is `bias`, or whose head is a bias set, moves only along the bias machine: `draft` to `proposed` or `retired`; `proposed` to `draft`, `adopted` or `retired`; `adopted` to `retired`; none from `retired`. Any other move is `BIAS_ILLEGAL_TRANSITION` (C-26.12) naming from, to and the legal moves, refused before any write; a revision that keeps the state is not a move.
- **R9** A promotion of a bias set with any R2–R7 finding is `BIAS_REFUSED` (C-26.11) naming each finding by its code, refused before any write; a replay is not judged.
- **R10** In the promotion's transaction the bundle's statement rows are replaced by the promoted document's (removed for every type, written only for `bias`), and a promotion to `adopted` re-pins every adoption of that bundle, instance and project alike, to the revision minted, its source fields copied from the same bytes; the adopter and instant are not rewritten.

**biasAdopt({bundleId, scope, scopeId, author, viewer, identity}) → adoption or refusal** (`op=biasadopt`)
- **R11** Refusals, in order: `BIAS_ADOPTION_NOT_AUTHORED` (C-26.9: no stamped author, or a machine identity); `BIAS_ADOPTION_NOT_PROPOSED` (C-26.10: no bundle id; not a bias set; a set at neither `proposed` nor `adopted`; a project scope with no project id); for a project scope, the project's existence refusal (C-70.1) and then `owner` authority. *(an instance scope asks no position: Open for Bob 1)*
- **R12** Success keeps one adoption per (scope, project id, bundle), replaced on re-adoption, pinning the bundle's head revision and the source, retrieval date and lower-cased hash from that revision's frontmatter (null where absent), with author and instant. It answers the pin, `in_force` (the pinned revision stands at `adopted`), `pins_proposed` (it stands at `proposed`) and a note saying that an adoption of a proposed revision replaces the scope's lens with those bytes and puts it in force only once that revision is adopted.

**biasManifest({scope, scopeId, viewer, limit, offset}) → manifest** (`op=biasmanifest`); synchronous, so a transaction may call it.
- **R13** A project scope with no id, or one the viewer may not see, answers `in_force: false` and "no manifest was in force", identically.
- **R14** The adoptions read are the instance's, and for a project scope the project's too, of sets not retired and visible to the viewer, each read from its pinned revision's bytes. A pinned revision not at `adopted` is listed in `pins_proposed` (set, revision, its own state, adopter, instant) with `pins_proposed_stated`, and puts nothing in force; both keys are absent when there is none. A pin whose bytes the record cannot produce answers `in_force: null`, `unresolved_pins`, and a sentence saying which statements are in force cannot be computed.
- **R15** With nothing in force: `in_force: false` and "no manifest was in force", never an empty lens.
- **R16** The effective set is the instance statements, then the project's: a nullification of an unlocked instance statement removes it; one of a locked statement keeps it and is reported in `lock_violations`; a statement with text adds itself or replaces the one it nullifies. It is ordered by bundle id, then statement id.
- **R17** `statements_sha` is SHA-256 over the whole effective set (bundle, id, kind, subject, text, justification, locked) before any paging, so two computations of one lens give one hash whatever the page.
- **R18** The answer also carries `bundles` (id, revision, scope, adopter, instant and the pinned source fields), each adoption's `residue` from its pinned revision's `## What This Does Not Enforce` section with whether it is stated, the page of `statements` (200 by default, at most 2,000, with `offset`), `total` and `truncated`.

**biasInhale({policy, source, retrieved, adopt, limit}) → proposal** (`op=biasinhale`)
- **R19** Any truthy `adopt` is `BIAS_INHALE_CANNOT_ADOPT` (C-26.8). The method writes nothing, ever.
- **R20** The policy is split at blank lines and after `.`, `;` and `:`; sentences of 12 characters or fewer are dropped; at most 500 are read, and `coverage` states how many were read, of how many, and whether the input was cut. Each sentence in order: a threshold phrasing (R6's predicate) is a bar addressed to `required_strength`; a verdict (R5's predicate) goes to the residue with C-26.5; an inference cue is an `inference` statement; a scrutiny cue that is not pattern-shaped is a `scrutiny` statement; anything else goes to the residue with why. No statement is ever proposed as `pattern`.
- **R21** The answer says `installed: false`, `adopted: false`, `writes: 0` and what a member does next, and carries `bars`, `statements` (each `proposed: true, authored: false`) and `residue`, each capped (200 by default, at most 1,000) with its count, `coverage`, the pin echoed, and `truncated`.

**lensFingerprint() → string; onLensChange(module, fn)** For the debt sweep (`ai-runs`), K31's pattern.
- **R22** The fingerprint changes when any input of any lens changes: the number of adoptions, and for the first 1,000 each adoption's scope, project id, bundle, the bundle's head sha and its state. It is synchronous and small.
- **R23** A successful `biasAdopt`, and a promotion that moves a bias set's head, notify each registered module once, after the write.

**Not yet built** (Declared Bias, "Bias bundles and adoption", safeguards 1–4)
- **R24** A project statement whose subject is also an instance statement's, and which names no statement it overrides, is listed in the manifest as an interaction, and must carry a justification addressing it. *(not yet met: no row; Open for Bob 2)*
- **R25** A statement whose subject is not in the registry is listed for the same review. *(not yet met: no row; Open for Bob 2)*
- **R26** A project statement whose effect loosens an instance statement on the same subject is an override whatever it calls itself, and where statements conflict with no named override the strictest applies. *(not yet met: no row; Open for Bob 2)*

## Private

### Uses

- `legacy-checks`: the C-26 rows until they move here (R29), `normalizeType`, `STATES` (the bias machine R8 reads), `MACHINE_AUTHOR_PREFIX`, `ENTITY_ID_RE`, `parseFrontmatter`, `createSha256`.
- `record-core`: `recordOf(ctx)`, `transact`, `declarePurge`; a bundle's head and a revision's bytes.
- `membership`: sight of a project and of each bias bundle; the existence refusal and project authority (R11).
- `promotion`: `registerStep` for R8–R10. *(not declared in `modules.json`)*
- `entities`: the registry R25 asks.

### Invariants

- **R27** Nothing puts a lens in force but a member's authored adoption whose pinned revision stands at `adopted`; no machine credential adopts (C-26.9), and reading a policy never installs one (R19).
- **R28** Bias is disclosed and never blocks: nothing here refuses publication, ratification or a run because a lens exists or has changed (DEC-20). Only a set's own structure is refused (R2–R9).
- **R29** Each check moves here as an invariant with its test (K6): C-26.1–C-26.12. C-26.13–C-26.19 go with the debt to `ai-runs`.
- **R30** `bias_statements` carries `bundle_id`, and `bias_adoptions` both `bundle_id` and the project id; both are declared to record-core's purge (K23).
- **R31** One predicate, one place: the verdict and bar predicates R5 and R6 use for a member's statement are the ones R20 uses for the machine's proposal.
- **R32** No place is named in this module's behaviour or outward text.

### Satisfies

- `docs/architecture/BIO_Declared_Bias_v0_1.md`: "The construct" (the three kinds, the malformedness rule, statement anatomy); "Bias bundles and adoption" (instance and project level, locks, the five safeguards, effective bias and the manifest, the ruling of 2026-09-24 on adopting a proposed revision, the ruling of 2026-08-01 on subjects); "Bias debt, and HUNCH DEBT" (DEC-20: disclosed, never blocking).
- DEC-54 (a)–(d), as the inhale and the adoption carry them; DEC-46; DEC-17 (a bar is `required_strength`).
- `docs/architecture/BIO_System_Design.md` §3, the declared-bias construct.
- `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (sight), and DEC-72 clause 5 (a project's managers are its owners).

### Suggestions

- **Factory.** `biasOf(ctx)` answers the one instance per Durable Object storage and reaches `record-core`, `membership` and `promotion` through theirs (K61). The op handlers move here (K3); `legacy-store` registers R8–R10 with `promotion` until this module does.
- **What stays out.** The run's bias block (`#biasForRun`), the debt sweep, its settlements, `op=biasdebt` and `op=biasdebtresolve` are `ai-runs`' (map §5.1), calling R18 and R22 and registering on R23. The frozen manifest in a published case and the bias acknowledgement are `publication`'s, calling R18. HUNCH debt is `inquiry`'s. The regrade and the cross-group rerun ("Differential traversal") come last in the doctrine's own sequencing and are not this module's today.
- Tests: each C-26 row gets a negative control, and R5 and R6 get over-strictness arms (an evidenced scrutiny statement about a source's reliability passes; a policy sentence that talks about sources without a count is not a bar). R17 gets a paging arm (the hash is unchanged at `limit=1`). R19 is asserted on the method's source, as `bias.test.mjs` does today.

## Open for Bob

1. **Who may adopt a lens for the whole instance?** The doctrine says "Admins define instance bias". The code lets any member with contribute rights adopt at the instance scope, on the reasoning that the act is signed and published with the group's work. A project adoption, by contrast, is refused to anyone but that project's owners. *Recommendation:* administrators only, matching the doctrine and the project rule; the signature remains.
2. **Which of the masking safeguards belong in this module now?** Adoption, locks, the pin and the malformedness rule are built. Safeguards 1–4 are not: override judged by effect, strictest-wins, subject collisions made loud, and a subject outside the registry flagged. Safeguard 5, the group as backstop, needs no machinery. *Recommendation:* build safeguards 3 and 4 with the module (R24, R25), since both are mechanical and make a masking attempt visible at ratification. Defer 1 and 2 (R26) until evaluation findings exist to apply a lens to (`strength`, `review`), with that as their trigger.
3. **Does bias debt attach to members' own work as well as the assistant's runs?** The doctrine says debt "is tracked per work product" when a lens changes. The code tracks it only for AI runs, so a finding a member wrote under a project lens that has since changed carries no mark. *Recommendation:* yes, disclosed and never blocking, for a question's findings under a project lens. That would make the debt mechanism this module's, taking work products registered by `ai-runs` and `inquiry`, instead of `ai-runs`' alone as the map proposes today.
