# Plan T40

**Status** · OPEN · BOB #144 · session_017eYwzMF5vwqLhpqcuC3iU8 · depth 1

**Jobs** · record-grammar: RECORD-GRAMMAR #11 session_01DoeyeHeM15vrBLPc7ti25M

**At T40's opening (K2389):** T39 closed by PR #18 (`main` @ `fc8d9c9f36`, K2388), after PR #16 (DEC-184–DEC-187) merged into `main` (K2388), so rule 3's condition holds and N797–N799 and N811 enter. `tranche/T40` from `main` @ `fc8d9c9f36`. Drafted during T39 (P18) by a worker for BOB #144, reviewed (K2376) and re-checked at the opening (K2389).

**Sources** · `next.md` N748, N751, N780, N794, N796–N799, N809, N811–N814; T39's `current.md` rule 3 (reds) and "Left out"; `plan/draft-T40-N812.md` (adopted, K2373; parts C–E); rulings K2348, K2350, K2352, K2353, K2343, K2351, K2370, K2371, K2373, K657; sizes measured on `tranche/T39` today over `modules.json` paths (K1821).

## Legacy census (§5.2 (2))

| legacy module | in T40 | hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`) | stays | Bob's (UX), K633, K1849: it stays until the new interface replaces it; a dependency not yet built: the new member screens and their shell (N672, N559). N794 (its red) left out for the same reason. |

## Rules at the opening

1. T39's rules 1–2 hold in kind: merge order within a layer is `modules.json` order unless a layer says otherwise; requirement text is applied to each module's file before its layer's START (K2343's pattern).
2. **The opening's acts (K657, K1043, K2373):** `ai-use` enters `modules.json` in layer 6 directly before `ai-runs` (empty `paths` and `tests`; uses and the users' edges as `draft-T40-N812.md` part C's edge list), `layers.md` row 6 lists it, and membership's `MODULE_ORDER` (R83) entry is T40-M, all in one act. The canon and register folds of K2373 (Capability Ladders §10, Assistant and AI Roles §6, `terms/anthropic.md` "Bob's choices", `credentials`' Purpose) and the NOTICE to UX-DESIGN (part E) are made at the opening.
3. **N797–N799 and N811 enter only if PR #16 (DEC-184–DEC-187) is merged into `main` at T39's close** (K2348, §5.7 (1)). If it is, their requirement text is to draft before its layer's START (BOB's wording; the words are the DECs' keys). If it is not, they move to "Left out" with rule 3's reason.
4. **Accepted reds at the opening** (re-confirmed against T39's close): (1) coverage: every id marked `*(not yet met: T40)*` until its module's merge. (2) row census: rows T39's L3–L11 jobs added or re-worded (C-122.7's among them, K2370) stay `awaiting stamp` until T40-4; rows T40's L3+ jobs add (ai-use's family, run-rules' retirements, L8's keys) until T41's stamp. (3) the UI's DEC-88 tests (Bob's), carried. (4) legacy-ui `statement-ack.test.mjs` (N794, K633). (5) membership R83's `MODULE_ORDER` tests from the opening's insertion of `ai-use` until T40-M. (6) the L11 users of the retired ceiling codes (`AI_USE_CEILING_REACHED`, `AI_USE_COPY_CEILING_REACHED`: wizard-scripts, instance-setup, store-door, op-declarations' `aiceilingset`, control-plane, plane) from T40-6/T40-8's merges until their L11 jobs; named exactly at L6's close from the checks. (7) the plane bundle and `program.mjs`, staled by any merge, regenerated at each layer's close. (8) any red T39 closes with, carried by name from `archive/T39.md` (filings `outward.test.mjs`:136, R25, until T40-9a).

## Entries

### L1
- **T40-1 · record-grammar** · (N809) `checkBundle` answers an inherited-key `object_type` (`toString`, `constructor`, `__proto__`) as an unknown type, never throws, with a test · K2285, K2343 · req: its R, BOB's wording, to draft before L1's START.
- **T40-2 · pdf-reader** · (N813) a `FE FF` or odd-length string answers its raw bytes beside its text, with a test; R22's `streamDecoded` states it answers a Promise · K2351 · req: R20/R22, BOB's wording, to draft before L1's START · **P6:** 3,152 + ~40.

No merge order (independent).

### L2
- **T40-M · membership** · (N812) R122 `notTheOwner`; R83's `MODULE_ORDER` names `ai-use`; (N797) `handlecheck({invite, handle})`: free, taken or not allowed, never who; refused without a live invitation, limited against probing (K1881); (N799) `handlechange`: own handle until first published (refused naming the case; R12, R16 refusals), earlier handles kept ("formerly"), the published-work fact from a guard a later module registers (publication, composed by plane; R116's listener form) · K2373, K657, DEC-184, DEC-186 · req: `draft-T40-N812.md` C (R122, R83); N797/N799's requirement text to draft before L2's START. Handles are membership's (R12, R16, R119), so N797 is placed here, not in project-roster. **P6:** 3,306 + ~250.
- **T40-3 · credentials** · (N812) Purpose, R30, R54–R59 (project account, `USE_KINDS` switches, the cascade, material limits, project-key notice, suspended project accounts) · K2373, K2352, K2353 · req: `draft-T40-N812.md` C · codes against R122 once T40-M merges · **P6:** 2,834 → ~3,250.
- **T40-4 · promotion** · stamps every row awaiting stamp at T39's close (rule 4 (2)) and T40's L1–L2 rows (credentials', membership's handle codes) · T39 rule 3 (2), K2370 · req: the rows' behaviour, BOB's wording.

**L2 merge order:** membership, credentials, promotion last.

### L9
- **T40-9a · filings** (tests only) · (N819) `outward.test.mjs`:136's ungraded exhibit recorded without a receipt in its fixture · K2387.

### L6
- **T40-5 · inquiry** · (N814) R39 re-written: deferral and dismissal are each project's own act; no set-aside shared, no refusal depending on how many projects draw on the question; R20–R21's shared move only for a question no project draws on · K2371 · req: R39 (meaning Bob's, K2371), BOB's wording, to draft before L6's START.
- **T40-6 · run-rules** · (N812) R20: the two ceiling codes retired; `AI_NO_ACCOUNT`'s translation · K2373 · req: draft C.
- **T40-7 · ai-use (new)** · (N812) R1–R9 (count, limits, judge, reads, `limitsReached`, `exploreAllowed`, `exploreAsk`/`exploreApprove`), the ceilings' migration; builds by copy of `ai-runs/index.mjs`:2591–2940 (K624) · K2373, K2350 · req: draft C · ~900 lines.
- **T40-8 · ai-runs** · (N812) R48–R51 retired (moved to ai-use R1–R4), its copy deleted and re-pointed; R52 amended · K2373 · req: draft C · after T40-7's merge · 3,295 → ~3,000.
- **T40-9 · answers** · (N812) R30: an ask's `project`, `accountFor`, `useCheck`, R2's kept-away rows, R19 · K2373 · req: draft C.
- **T40-10 · agent-model** · (N812) Purpose, R11 (`project` level), R13 `MODEL_PRICES`, `estimated_cost_usd` · K2373 · req: draft C.
- **T40-11 · agent-worker** · (N812) R71: `level` `project`; a project's sign-in runs as the member's own · K2373 · req: draft C.

**L6 merge order (N812 part E):** inquiry (independent), run-rules, ai-use, ai-runs (copy then delete), then answers, agent-model, agent-worker.

### L8 (rule 3)
- **T40-12 · case-carriage** · (N818, K2383) a refused `onReceipt` registration a start-up fault; (N816, K2380) R15: `copyWake` null while no store is bound; (N798, N811) photo words by key: `photo.withdraw.refused.machine`, `.nomark`, `.already`, `.noreason` replacing C-141.7–.10; `photo.refused.unchecked` re-worded; labels `photo.published.label`, `photo.obscured.label` · DEC-185, DEC-187, K2248, K2348 · req: to draft before L8's START.
- **T40-13 · publication** · (N811) `photo.refused.changed.signed` for C-122.6 answered after signing (R57 at the commit); (N799) the fact "this member's work appears in a published case, naming it", registered as membership's handle-change guard; a published case keeps its signing handle · DEC-186, DEC-187 · req: to draft before L8's START · **P6:** 3,799 + ~60: the job measures first and reports before building if it would pass ~4,000 (K617).
- **T40-14 · public-read** · (N798, N811) every published photo's label by key · DEC-185, DEC-187 · req: to draft.
- **T40-15 · ratification** · (N811) R42's scheduled stop answers `photo.refused.changed.signed` after signing (N805's stop) · DEC-187, K2370 · req: to draft · after T40-13.
- **T40-16 · case-disclosures** · (N798, N811) the labels by key; the ceremony's sentence the screens' · DEC-185, DEC-187 · req: to draft · after T40-12; runs case-authoring's suite (P11; T39-18's pattern if red).

**L8 merge order:** case-carriage, publication, public-read, ratification, case-disclosures.

### L11
- **T40-17 · wizard-scripts** · (N812) R27 · draft C.
- **T40-18 · op-grades** · (N797, N799; N812 if its ops are graded) the new ops' grades · req: fixed at L11's START.
- **T40-19 · affordances** · (N797, N799, N812) shares of the new codes and ops · req: fixed at L11's START.
- **T40-20 · notice-producers** · (N812) R16 (limit reached, project account suspended) · draft C.
- **T40-21 · queue** · (N814) `op=proposedispose` takes the project arm always (R27); R20–R21's shared move kept only for a question no project draws on · K2371 · req: BOB's wording, to draft before L11's START. Also N812's new item kinds in R1 (see doubts).
- **T40-22 · instance-setup** · (N812) R65, R67 · draft C · only after T39-16a/b (T39 L11's split, K2337): 3,299 → ~3,305.
- **T40-23 · op-declarations** · (N812) R41's ops, `aiceilingset`/`aicopyceilingset` retired; (N797, N799) `handlecheck`, `handlechange` · draft C; handle ops to draft · **P6:** 3,283 → ~3,430.
- **T40-24 · store-door** · (N812) R10 · draft C.
- **T40-25 · control-plane** · (N812) R69; (N797, N799) the handle ops' routes (`handlecheck` before sign-in, with an invitation) · draft C; to draft · **P6:** 3,270 → ~3,370.
- **T40-26 · plane** · (N812) composes `ai-use`; (N799) registers publication's guard with membership; whatever L1–L8's new codes owe (answer-envelope shares among them) · fixed at L11's START from the merged codes.

**L11 merge order (part E):** `modules.json` order; plane last.

## Left out of T40 (one hard reason each)

| entry | hard reason |
|---|---|
| N748 | Bob's (P17): D1–D4, D6–D8, D12–D14, D16–D24 and the lane's D27–D30, D35 open (K2064, K2361) |
| N751 | a measurement: no fresh policies (K2079) |
| N780 | a deployment: the next release cut (K1501) |
| N794 | Bob's (K633, K1849) |
| N796 | Bob's (P17): held with the investigation design lane's question (K2334) |
| N817 | Bob's (P17): "Not today" (D43, K2382); started after the investigation lane hands off its design |
| N815 (N812's explorer) | Bob's (P17): D35, D36's member scope and the step model (D32) open with the lane |
| stamp of T40's L3+ rows | the order: promotion (L2) runs before they exist; T41's stamp |
| T38's carried rows (`archive/T38.md` "Left out") | their reasons unchanged; re-read at the opening |

## Doubts for BOB (best readings)

1. **ai-use R1 reads later in the order (P4).** Its fallback "counted at the highest price in `agent-model`'s table" reads `agent-model` (87) from `ai-use` (80), against part C's own trap note. Reading: move the fallback into agent-model R13 (a `null` figure on `apikey` priced at the model's highest rate), ai-use R1 only sums; BOB's wording before L6's START.
2. **N812's queue items are uncatalogued.** notice-producers R16's items and ai-use R9's daily "Ask" item need kinds in queue R1 (`classOfKind` answers null otherwise), and ai-use (L6) cannot mint a queue item itself. Reading: notice-producers (862 lines, not queue-producers at 3,429) mints all three from ai-use and credentials reads; queue R1 gains the kinds in T40-21; words the design stream's (NOTICE).
3. **credentials R55 gives a sign-in a `standing` switch** ("closing K2275's gap"), which would let a sign-in run unattended standing questions, the question N796 holds with Bob. Reading: build the switch, R32 still refuses a sign-in's standing questions `STANDING_SWITCH_OFF` while N796 is held.
4. **N797 placement** (membership or project-roster): read as membership (handles live there). **N799's packaging:** a membership guard registered by publication, composed by plane (no edge points later).
5. op-grades and affordances are not in part E; included as L11 shares, fixed at L11's START.
6. The explorer's `next.md` entry owed by B9/K2373 is not yet written.
