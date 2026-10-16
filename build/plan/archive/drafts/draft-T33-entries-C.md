# Entries C: stage 0 (whole), ANALYSIS and QUESTIONS at stages 0–1b, and the stage-0 substrate (T33)

Research worker for BOB, read-only, 2026-10-05, on `tranche/T32` @ HEAD. Sources: the ladder (§1–§3, §8, §9, §10), the first synthesis (§2.5, §2.6, §3.3, §4, §5A, §6, §7), the second synthesis (§4.2 (g)(i)(j), §4.3, §5, §7), rulings K1425–K1495, `modules.json`, `sizes.tsv` and the code. "ext:" names an entry outside this scope, such as `civil-time`, the `standards` move, `entities` identifiers, `money` or `events`.

**Facts checked in the code before writing:**
- **agent-worker's own source is 3,766 lines.** That is `index.mjs` 1,591, `harness.mjs` 1,253, `subsession.mjs` 588, `model.mjs` 240 and `cascade.mjs` 94. The 16.6k figure in `sizes.tsv` counts tests (about 9k) and the generated bundle (3,092).
- **Twelve id sites become thirteen.** The study counted twelve `\d{4}-\d{4}` sites. There is a 13th copy at `bio-plane/src/sign-release.html:466`, owned by `signatures`. A further copy sits in the generated `case-checker/program.mjs`, and 8 test files hold the pattern.
- **`allocId` pads to four digits.** It is at `record-core/index.mjs:401` (`padStart(4)`).
- **About 52 modules declare tables.** They do it through `record-core.declarePurge` (R21, R46).
- **The installer carries no Claude account.** It carries only `INSTANCE_AI_TOKEN`, the plane's `ai` credential (`newgroup/src/index.mjs:391–398`).
- **The plane reads `INSTANCE_CLAUDE_TOKEN`** (runtime-limits R13, R17). Nothing binds it, and nothing supplies the project-level or member-level account.
- **The cascade order already matches B16.** The order member → project → instance (agent-worker R32) is K1478's precedence.
- **Modules near or past the P6 mark:**

| module | lines |
|---|---|
| inquiry | 3,903 |
| control-plane | 3,735 |
| office-readers | 3,524 |
| content | 3,533 |
| publication | 4,625 |
| docprofile | 4,969 |

## (a) Entries

Format: `<module> · L<layer> · <kind> · <stage> · <what> · est. reqs · uses (new edges) · depends on · measure-first`.

### Stage 0: substrate (constructs-2 §4.2 (g), (i), §4.3; ladder §10 last row; TAD §10.8)

- **S0-1** `record-grammar` · L1 · extended · 0 · One id table that every validator imports: prefix → owner, counter form (sequential `\d{4,}`, or an opaque tail in `[a-z0-9]` long enough for 10^7 a year). `BUNDLE` becomes `\d{4}-\d{4,}`. `idPattern(prefix)` is exported. The new prefixes `EVT- LIN- MNY- PFA- IDC-` are reserved opaque, and `CALC-` is reserved. Existing ids stay valid. R1 amended, plus new rows for the table and its negative controls (`ENT-2026-999` refused; `ENT-2026-10000` accepted) · 3–4 · none · — · opaque-tail length vs collision bound (desk calculation).
- **S0-2** `record-core` · L2 · extended · 0 · `allocId`/`allocIdOp` (§Provides l.16–24) mint from S0-1's table: sequential prefixes have no ceiling, opaque prefixes get a random tail. `seedMintLedger` reads both forms. A test mints the 10,000th id of every prefix · 2 · none · S0-1 · none.
- **S0-3** `record-core` · L2 · extended · 0 · The table declaration. `declarePurge` becomes `declareTable(module, [{name, keys?, whole?, purge, expunge, export: yes|admin-only|never, sight, derive: stored|derived-rebuildable, version_chain}])`. A declaration missing a class is refused by a named code. One derived-cache convention: declared re-derivable, rebuilt and byte-compared by a test helper, read fail-closed when stale (`when_cache`, `bound_cache`, cluster, check results). This is the store-gate hook for one-home checks (§4.2 (i)). R21 and R46 amended, plus new rows · 5–7 · none · — · table census (count and largest tables; desk).
- **S0-4** `inquiry-grammar` · L6 · extended · 0 · `ENTITY_ID_RE` (`grammar.mjs:45`) is imported from S0-1 · 0–1 · none (already uses record-grammar) · S0-1 · none.
- **S0-5** `actions` · L9 · extended · 0 · `PLAN_ID_RE` (`index.mjs:75`) from S0-1 · 0–1 · none · S0-1 · none.
- **S0-6** `monitoring` · L10 · extended · 0 · `GATH_ID_RE` (`checks.mjs:131`) from S0-1 · 0–1 · none · S0-1 · none.
- **S0-7** `connections` · L5 · extended · 0 · `THEME_ID_RE` and `THEME_REF_RE` (`checks.mjs:206, 210`) from S0-1 · 0–1 · none · S0-1 · none.
- **S0-8** `observation-log` · L5 · extended · 0 · `LEAD_ID_RE` (`checks.mjs:208`) from S0-1 · 0–1 · none · S0-1 · none.
- **S0-9** `bias` · L5 · extended · 0 · `ENTITY_ID_RE` (`checks.mjs:13`) from S0-1 · 0–1 · none · S0-1 · none.
- **S0-10** `action-grammar` · L9 · extended · 0 · `ENTITY_ID_RE` (`checks.mjs:43`) from S0-1 · 0–1 · none · S0-1 · none.
- **S0-11** `tasks` · L11 · extended · 0 · `TASK_ID_RE` (`checks.mjs:80`) from S0-1 · 0–1 · none · S0-1 · none.
- **S0-12** `case-grammar` · L8 · extended · 0 · `NOTICE_REFERENCE_PATTERN` (`reference.mjs:20`) from S0-1. The standalone `case-checker/program.mjs` is regenerated, so its SHA changes (case-checker R13 test). Signed case files with 4-digit ids still pass · 1 · none · S0-1 · none.
- **S0-13** `signatures` · L1 · extended · 0 · `OPAQUE_ID_RE` in `sshsig.mjs:357` and its copy in `sign-release.html:466` (the 13th site) from S0-1. The page copy is regenerated by `embed-signpage` · 1 · **new edge signatures → record-grammar** (P4 holds: record-grammar is first in L1) · S0-1 · none.
- **S0-14** every table-owning module (about 52) · L2–L11 · extended · 0 · Each declares its classes under S0-3, one entry per table. This rides each module's own T33 job where it has one, otherwise one sweep job per layer. Default classes come from record-core's rule; member ties and the source link are `never` when they arrive (C7, later) · 0 each (record-core R21 governs) · none · S0-3 · none.
- **S0-15** `corpus-export` · L8 · extended · 0 · R1 widened: export every declared table by class. `yes` goes to every administrator; `admin-only` is marked; `never` is named in the manifest, never omitted silently. Tables are paged with a sha256 per page. R3's import verifies pages. Unlocks DR3/DEC-112 for the registry and every module table · 3–4 · none (record-core already used) · S0-3, S0-14 · cost of paging the largest declared table within 30 s CPU and 128 MB (needs T33 code; local fixture).

### Stage 0: the first synthesis's §7 corrections, at their owning modules

Stage 0 carries items 1, 3, 5 (its `asOf` half), 7, 8, 9, 10, 11, 12 and 13. `civil-time` absorbs items 2, 4, 5 (ranges) and 6 at stage 1a.

**Timing note.** `civil-time` (L1) precedes `actions` (L9) and `monitoring` (L10) in T33's module order. Item 3 should therefore call `civil-time` directly; an interim `Intl` fix would build the engine twice (G10). This holds unless BOB ships stage 0 in a release before `civil-time` lands.

- **C-1** `action-clocks` · L9 · extended · 0 · Item 1: `received` means the counterparty's receipt of the group's request, counted from the group's `sent` entry (`index.mjs:695–698`). Correct `clocks.test.mjs:166–179`. R-1 T-E1. The profile rule is `jurisdictions` R26 · 1–2 · none · — · none.
- **C-2** `action-clocks` · L9 · extended · 1a (absorbed) · Item 2: roll-forward, and the weekend moved out of code (`:704`, `:744`) into profile data citing CCP §§12, 12a · (counted in ext: civil-time) · civil-time · ext: civil-time, C-7 · 20 worked deadline examples (ext).
- **C-3** `actions` + `monitoring` · L9/L10 · extended · 0 (through civil-time) · Item 3, ruled K1444 (iii): `actions.actionOverdue` (`index.mjs:174–183`, R12) and `deadlineRecheck` (`monitoring/index.mjs:2746–2764`, R34) use the local day of the office's jurisdiction · 2 · actions → civil-time, monitoring → civil-time · ext: civil-time · none.
- **C-3b** `local-facts` (`:53`), `queue` (`:246`), `queue-producers` (2449, 2499, 2587, 2607, 2831), `progressions` (86,400,000 ms days) · various · extended · 1a (absorbed) · The same UTC-day defect, moved to civil-time · (ext) · civil-time · ext: civil-time · none.
- **C-4** `action-clocks`/`jurisdictions` · L9/L1 · extended · 1a (absorbed) · Item 4: R26 `extension`, and R41/R42 zone and hours, computed in civil-time · (ext) · — · ext: civil-time · none.
- **C-5a** `query-language` · L5 · extended · 0 · Item 5, second half: `overdue:` reads the cached flag and says so with an `asOf` note (`query.mjs:107–122`). No engine needed · 1 · none · — · none.
- **C-5b** `query-language` · L5 · extended · 1a (absorbed) · Item 5, first half: inclusive local-day ranges (`query.mjs:1487–1491`, 1693–1701) · 1 · → civil-time · ext: civil-time · none.
- **C-6** `inquiry-grammar` · L6 · extended · 1a (absorbed) · Item 6: `DATE_RE` (`grammar.mjs:171`) validates calendar dates through civil-time · 1 · → civil-time · ext: civil-time · none.
- **C-7** `jurisdictions` · L1 · extended (data) · 0 · Item 7, K1445: source `records_response` and the five counterparties (`oakland-alameda.mjs:207–217, 248`) from primary pages, or they stay non-applying. This is a data correction · 1 · none · — · primary-source research (CPRA Gov. Code §7922.535 etc.; desk, before T33 opens).
- **C-8** `actions` + `legacy-ui` · L9/L11 · extended · 0 · Item 8: trace which path applies R9 to the add flow's `{state:"named", name}` (`civicos-ui/app.html:19983`). Then send `{role, body}`, or fail visibly with `COUNTERPARTY_REFUSED` shown · 1 · none · — · none.
- **C-9** Item 9 is entries Q0-2 and Q0-3.
- **C-10** Item 10 is entries Q0-4 and Q0-5.
- **C-11** Item 11 is entries Q0-2 and Q0-6.
- **C-12** Canon (not a module) · — · amended · 0 · Item 12: amend TAD v10 §8.3 ("spreadsheets only as OUTPUT") and §9 ("Never a spreadsheet"), citing X113 and X135. This is BOB's canon edit (K1495) · 0 · — · — · none.
- **C-13** `release/` (`not_product`) and the design stream · — · regenerated · 0 · Item 13, in three parts:
  - (a) The stale `LAW_LEVELS` (`release/bio-plane.bundled.mjs:4746`, release 0.79.0) is regenerated at the next signed release cut.
  - (b) The `OCR_WORKER` quotation was a study-text fix only; there is no product change.
  - (c) The queue's `due` sort is design-stream work, by a NOTICE. It is not a T33 entry.
  
  0 · — · — · none.

### Stage 0: QUESTIONS Q0, the assistant runnable (ladder §9.4 Q0; K1429, K1450, K1478, K1479)

**What is code and what is deployment.** All of Q0-1 to Q0-11 is code, buildable and testable offline with a stubbed model and a stubbed container.

Four things need a deployment:
- The Cloudflare Containers image registered in the project account `20b5…7f72`.
- A deployed test copy with a bound Claude account.
- A signed release, for group copies only.
- VF-4.

- **Q0-1** `agent-worker` · L6 · split · 0 · P6/K617 force the split into stage 0, before any Q0 job. The source is 3,766 lines, and Q0 adds about 600–1,000, so it would pass 4,000. Seams:
  - (i) `agent-worker`, the Worker shell: `index.mjs` driver, R1–R12, R26–R31, `cascade.mjs`. About 1,700 lines.
  - (ii) `agent-harness`, pure: `harness.mjs` and `subsession.mjs`, covering R13–R16, R20, R41, R50. About 1,850 lines.
  - (iii) `agent-model`: `model.mjs` plus the providers (Q0-2). About 600–900 lines.
  
  No requirement changes meaning. This settles K1439's "split at stage 1" as earlier, under P6 · 0 (moved) · shell → harness, model · — · none.
- **Q0-2** `agent-model` · L6 · split + extended · 0 · Items 9 and 11. A provider switch per account reference `{kind: subscription|apikey}`.
  - The **API-key path** is the Messages API as today, plus `cache_control` on the system, tools and pack prefix (`model.mjs:68`).
  - The **subscription path** calls Q0-3's container through a Container Durable Object binding, passing the token per call. It is never stored, logged or echoed (R36 kept).
  - Both paths return `usage`: input, output, cache read and cache write tokens, plus `total_cost_usd` where the SDK states it.
  - The model per mode is chosen by measurement (§6 Questions), in place of the `claude-opus-5` default.
  
  R40 amended; new rows for provider, caching and usage · 4–5 · → none outside agent-* · Q0-1 · M-Q1, M-Q4.
- **Q0-3** `agent-runner` · L6 (fleet container) · split (new deployable, BOB's under K617/K1439) · 0 · The container image source: a Dockerfile, plus a Node entry wrapping `@anthropic-ai/claude-agent-sdk` (Claude Code as its child process), at about 300–500 lines.
  - Built-in tools off (no Bash, Read, Write or Web*), no settings sources, no disk persistence. This is the closed book (K1474 (i)) and the injection fence.
  - The subscription token arrives per call as `CLAUDE_CODE_OAUTH_TOKEN`; an API key arrives as `ANTHROPIC_API_KEY`.
  - Tool calls go back to the Worker's table, so R16/R39 control stays in the Worker. Its own module because it is the only member with an npm dependency and a Node runtime (agent-worker today "depends on nothing from npm").
  
  New requirements for its surface and its no-tools/no-persistence invariants · 5–7 · none into the plane (it reaches nothing but `api.anthropic.com`) · Q0-1 · M-Q2, M-Q4, M-Q5.
- **Q0-4** `agent-worker` (shell) · L6 · extended · 0 · Item 10. One truth for model turns: rewrite the header at l.34 ("STILL RUNS NO MODEL TURNS") against l.1457, update R40/R41 status, and make `turns_run`/`judgement_source` truthful. R35 is amended for the Container DO binding (the container reaches no plane). R53: plan's deployment becomes an explicit reviewed act, not automatic on model turns · 3–4 · → agent-model, agent-harness · Q0-1, Q0-2 · none.
- **Q0-5** `run-rules` · L6 · extended · 0 · R14 amended: `plan` is deployed only by its own flag, with item 10's explicit act. R11's table gains the ceiling refusals (`AI_USE_CEILING_REACHED`, group and member, worded plainly per D79). The bounds vocabulary gains per-ask bounds (turns, bytes, wall clock, reads; R-3 Q-E3) for Q1. The `verification_recorded` act (VF-4) is written once CHECK's first live run verifies; by the chain that enables `investigate` · 3–4 · none · — · M-Q7.
- **Q0-6** `ai-runs` · L6 · extended · 0 · Usage and the ceiling (K1450, B16 (iii)–(iv)).
  - `airuntick` carries `usage` per model call. The plane keeps a counter table `ai_usage` (account level, member or `organisation`, the group's local day, mode), declared `admin-only` under S0-3.
  - Open, continue and (at Q1) ask are refused at the group's or the member's daily ceiling.
  - Administrators read monthly use per mode (`op=aiusage`); members see no per-answer cost.
  - The counter is not a run or observation row. It keeps K1450's "nothing kept" for content.
  
  · 4–6 · → civil-time (local day; ext) · Q0-2, Q0-5, S0-3 · M-Q6 (the default ceiling).
- **Q0-7** `runtime-limits` + `credentials` · L1/L2 · extended · 0 · B16/K1478 account references per cascade level.
  - The group level is the Worker secret `INSTANCE_CLAUDE_TOKEN` (runtime-limits R13, R17), plus a `kind` (subscription or API key).
  - Project and member levels: `credentials` holds a reference per project and member. BOB's technical ruling decides between keeping the member's token on the device, sent with the member's act (fits "never stores"), and sealing it at rest. Nothing exists today.
  - The B17 switch (K1479) is a field of the same reference: `suggestions: off` by default, settable only by the account's holder (the group's administrator; the project; the member). Nothing reads it until Q2. Built now so Q2 needs no migration.
  
  · 4–6 · none · — · M-Q5 (terms re-read decides the storage).
- **Q0-8** `installer` · L11 · extended · 0 · Install and update carry the group's Claude account.
  - `/begin` takes `instanceClaude?` beside `instanceAi` (R2), bound as a secret (R9, R10), never shown (R16, R19).
  - For a subscription, the token comes from Anthropic's own sign-in. The product never sees a Claude.ai password or session (K1429).
  - B16 (i)'s setup disclosure (D311; K1478): the assistant is optional, and questions and the material read for them, person facts included (constructs-2 §3 QUESTIONS), go to Anthropic under the group's account. The words are UX (NOTICE B26); the substrate states them.
  - The fleet step (R11, R12) learns a container-backed member (agent-runner).
  
  · 4–5 · none · Q0-3, Q0-7 · M-Q8 (can newgroup install a container member by API).
- **Q0-9** `instance-setup` · L11 · extended · 0 · Records the assistant switch (off unless chosen) and the disclosure shown at setup, with who and when. The plane refuses asks and runs while the assistant is off · 2 · none · Q0-7 · none.
- **Q0-10** `op-declarations` + `control-plane` · L11 · extended · 0 · Wiring only: route arms for `aiusage` and the account-reference ops, published by the owning modules (the K1122 pattern), so control-plane (3,735 lines) grows by under 50 · 1–2 · none · Q0-6, Q0-7 · none.
- **Q0-11** (verification, not code) · — · — · 0 · VF-4: CHECK's first live run on a deployed copy, under the instance's `ai` credential and its Claude account. Ends in Q0-5's `verification_recorded` · 0 · — · Q0-1 to Q0-10 · M-Q1, M-Q3.

### Stage 1a: ANALYSIS A1, "Check a claim" (ladder §8.4 L2; first synthesis §2.5; K1447, K1448, K1471)

- **A-1** `calc-grammar` · L1 · new (after civil-time) · 1a · Pure engine:
  - The figure parser moved from `consequences/figures.mjs` (93 lines), gaining `%`, sign, currency kept, and `as_read`.
  - Exact-decimal typed values, units and currencies, precision (exact, rounded, approximate, range).
  - The closed recipe grammar and evaluator: `select, count, sum, difference, ratio, share` (always with its denominator), `group`, `span` (by civil-time), `compare` (a labelled computed fact, never "breach", D275), `round`, `join` (only through an id space or crosswalk), and sort by a stated quantity (K1471).
  - Method `bio-calc/1`; result key `sha(recipe, inputs, method_version)`.
  - The summation-rule refusals by name: kind, phase or stage, basis, currency, period (K1463; for 1b).
  - No eval, no user code.
  
  · 15–18 · → record-grammar, civil-time, id-spaces · ext: civil-time · recipe coverage of the journeys; exactness against a decimal reference.
- **A-2** `calculations` · L5 · new (last in L5) · 1a ·
  - Tables: canonical RFC 4180 UTF-8 CSV plus Table Schema, sha256, header declared; a value that does not parse is undetermined. Bytes go to the evidence store, streamed.
  - `CALC-` objects: question, terms, period, inputs, kind, results with denominators, recompute status, lint slot, grade facts, method note, checks.
  - Results are stored by key and recomputed at acceptance, at publication and in the checker, never on read.
  - The reevaluation cause `calculation_input_changed`.
  - A threshold may cite a held standard at its version.
  - Visibility: withheld whole if any input is hidden (DEC-36, DEC-85).
  - Ops: declare a table, create, evaluate (non-persisting), accept.
  - Tables are declared under S0-3.
  - Registrations `registerOccurrenceEvidence` and `registerRosterSource` wait for their consumers (2a, 2b).
  
  · 20–25 · → calc-grammar, civil-time, content, record-core, promotion, provenance, entities, standards (ext: moved), id-spaces · A-1, S0-1, S0-3, ext: standards move · dataset census against 8 and 20 MiB; CPU and peak memory for 20 MiB.
- **A-3** `office-readers` · L1 · extended · 1a · Typed cells (value, type, cached value and formula kept; R10 unchanged: never recalculates) in `formats-xlsx.mjs` and `csv.mjs` · 2–3 · none · — · none.
- **A-4** `odf-reader` · L1 · extended · 1a · Typed cells, the same contract · 1–2 · none · — · none.
- **A-5** `content` · L4 · extended · 1a · A cell's or range's value is readable through its table. Today `passageText` of one cell is null (`content/notice.mjs`, `heldTextAt`) · 1–2 · none · A-3, A-4 · none.
- **A-6** `record-grammar` · L1 · extended · 1a · `OBJECT_TYPES` gains `calculation` (`types.mjs:20`); `CALC-` goes in the id table · 1 · none · S0-1 · none.
- **A-7** `inquiry-grammar` · L6 · extended · 1a · The `calculation` leg kind and its reference grammar (B13 (ii), K1447) · 1–2 · none · A-6 · none.
- **A-8** `inquiry` · L6 · extended (**split first**) · 1a · Accepts the `calculation` leg. Inquiry R4 widened (a leg cites a held standard; K1447 (iii), with ext). P6 fails: inquiry is 3,903 lines and also takes hypotheses (K1467, ext). Split before the job (K617); the leg dispatch is under 100 lines once validation sits in A-7 · 1–2 · → calculations · A-2, A-7 · none.
- **A-9** `strength` · L6 · extended · 1a · Grade facts for a calculation leg: the weakest input capture, each capped by its derivation; recipe arithmetic does not weaken; unbound inputs are D; the method is disclosed, not graded (K1447 (ii)) · 2 · → calculations · A-2 · none.
- **A-10** `reevaluation` · L7 · extended · 1a · Cause `calculation_input_changed` · 1 · → calculations · A-2 · none.
- **A-11** `consequences` · L9 · extended · 1a · R2 accepts calculation outputs as operands (K1448). Its own parser is deleted and imported from A-1, so the module shrinks · 1–2 · → calc-grammar, calculations · A-1, A-2 · none.
- **A-12** `case-grammar` · L8 · extended · 1a · The case file carries calculations: recipe, input hashes, method version, results · 2 · → calc-grammar · A-1 · none.
- **A-13** `case-checker` · L8 · extended · 1a · Recomputes recipes. `calc-grammar` is bundled into the one self-contained `program.mjs` (R13 kept, K1448) · 1–2 · → calc-grammar · A-1, A-12 · none.
- **A-14** `case-import` · L8 · extended · 1a · Recreates calculations and never trusts them (DEC-112, D312; R-3 A-O1) · 1–2 · → calculations · A-2, A-12 · none.
- **A-15** `case-authoring` (pre-flight) + `public-read` · L8 · extended · 1a · Pre-flight refuses only an undisclosed differing or unbound load-bearing calculation (K1448; DEC-76.4). public-read shows outputs with their denominators and "computed fact" labels. Nothing is added to `publication` (4,625 lines; constructs-2 §4.1) · 2–3 · → calculations · A-2 · none.
- **A-16** `op-declarations` + `affordances` + `control-plane` · L11 · extended · 1a · Op wiring and the affordances for A-2's ops (route arms published by `calculations`) · 1–2 · → calculations · A-2 · none.

### Stage 1a: QUESTIONS Q1, "ask the record" (ladder §9.4 L1; first synthesis §2.6, §3.3; K1450, K1474, K1478, K1479)

- **Q1-1** `answers` · L6 · new (after `skills`, before `agent-worker`) · 1a ·
  - The answer contract: a summary bound to its support, quotes beside it, per-level look states, the bound, truncation, out of view, the query shown, next acts, and the "machine work" label.
  - The asking scope as K1450's list (law, profiles, registry, lines, duties, frontier, bar; never `sources*`, member history, admin or export).
  - The interpretation shape (at most one clarifying question).
  - Unattributed tallies (B17 (iii)).
  - Checks `ANSWER_CITES_UNREAD`, `ANSWER_FIGURE_UNSOURCED` (only a `CALC-` or, from 1b, a money fact), `ANSWER_RULE_NOT_PLANE` and `ANSWER_ABSENCE_WITHOUT_LEVEL`, each a named refusal with its translation. An unsupported sentence is withheld with a note.
  - The closed book and the legal-information labels (K1474 (i)–(iii)).
  - `registerRuleService` is declared, filled at Q3.
  - Tables declared under S0-3 (tallies: `admin-only`).
  
  · 25–30 · → retrieval, query-language, observation-log, strength, inquiry, skills, run-rules, calculations, standards (ext), lines (ext) · A-2, Q0-6, ext: standards move, lines · M-Q9 (the 150-question set).
- **Q1-2** `run-rules` · L6 · extended · 1a · Mode `ask`: read-only, interactive, `deploys_apart` (own flag), with Q0-5's per-ask bounds · 2 · none · Q0-5 · none.
- **Q1-3** `credentials` · L2 · extended · 1a · A short-lived `ai` grant minted at the member's act, with the member as viewer, read-only, writing no run row (K1450). The ask op allow-list is held by the grant's class · 3 · none · Q0-7 · none.
- **Q1-4** `agent-worker` (shell) · L6 · extended · 1a · `POST /ask`: interpret, write queries, read through the grant, compose, then hand to the plane's `answers` for checks; progress streaming. Uses agent-model (both paths) and Q0-6's ceiling. About 800–1,200 lines in the shell, bringing it to about 2,500–2,900 · 4–6 · → answers (over the wire only; R37's `PLANE_OPS` gains `ask` reads) · Q0-1, Q0-4, Q1-1, Q1-3 · M-Q1.
- **Q1-5** `skills` · L6 · extended · 1a · The pack's `ask` layer (rendered by `renderPack`) · 2 · none · Q1-2 · none.
- **Q1-6** `control-plane` + `op-declarations` · L11 · extended · 1a · `op=ask` wiring; the arms come from `answers` · 1 · → answers · Q1-1 · none.
- **Q1-7** `plane` (`plane/screens.mjs`) + `wizard-scripts` + `affordances` · L11 · extended · 1a · The substrate for "explain a screen, a word, a refusal":
  - A screens registry (`SCREENS` is empty at `screens.mjs:4`).
  - Refusals explained from existing translations and affordances' dry runs.
  - The wizard registry form.
  
  The wizard *library* content (DEC-120/121) is design-stream work (K1430; design paused, K1475). It is not a precondition · 3–4 · none · Q1-1 · none.

### Stage 1b: ANALYSIS and QUESTIONS over identity and amounts (constructs-2 §5 stage 1b)

- **B-1** `calculations` · L5 · extended · 1b · Money totals are `CALC-` recipes over money facts, refused across kind, phase or stage, basis, currency and period (A-1's checks), never re-entered as money facts. The money ingest writer: rows of an adopted table binding become money facts only at a member's request (K1468; R-3 I-5), machine-attributed with identifiers at both ends (K1443 extension), through `money`'s write op down the order · 4–6 · → money (ext) · A-2, ext: money L1 · figure-parser exactness on 200 ACFR and budget figures; money-table census.
- **B-2** `calculations` · L5 · extended · 1b · Person-keyed rows join to `person` entities only through an id space or captured crosswalk (§2 ANALYSIS; K1452). Grouping by person is allowed in the record; publication follows DR6 (K1483) · 1–2 · → entities identifiers (ext) · A-2, ext: entities identifiers, people L1 · none.
- **B-3** `answers` · L6 · extended · 1b · `ANSWER_FIGURE_UNSOURCED` accepts a money fact. The asking scope's registry reads cover `person` entities with their identifiers. Member ties, the source↔person link and hidden-project rows stay out (constructs-2 §3). `holderAt` and `careerOf` as rule services are Q3 (see (c)) · 1–2 · → money (ext) · Q1-1, ext: money L1 · none.

## (b) P6 check (sizes are the module's own code; mark about 4,000)

| entry | module | today | after | P6 |
|---|---|---|---|---|
| S0-1, A-6 | record-grammar | 2,316 | ~2,450 | ok |
| S0-2, S0-3 | record-core | 1,733 | ~2,050 | ok |
| S0-4, A-7, C-6 | inquiry-grammar | 1,564 | ~1,700 | ok |
| S0-5, C-3, C-8 | actions | 2,886 | ~2,920 | ok |
| S0-6, C-3 | monitoring | 3,366 | ~3,380 | ok, close |
| S0-7 | connections | 2,687 | ≈ | ok |
| S0-8 | observation-log | 3,216 | ≈ | ok |
| S0-9 | bias | 1,850 | ≈ | ok |
| S0-10 | action-grammar | 1,800 | ≈ | ok |
| S0-11 | tasks | 958 | ≈ | ok |
| S0-12 | case-grammar | 1,765 | ~1,900 with A-12 | ok |
| S0-13 | signatures | 1,335 | ≈ | ok |
| S0-14 | about 52 modules | — | +1 line per table | ok |
| S0-15 | corpus-export | 361 | ~650 | ok |
| C-1, C-2 | action-clocks | 888 | ~800 (civil-time removes day math) | ok |
| C-5 | query-language | 2,737 | ~2,760 | ok |
| C-7 | jurisdictions | 3,175 | +data | ok; watch profile growth (K1445 rule sets) |
| C-8 | legacy-ui | 40,305 | — | legacy; exempt by status |
| Q0-1 to Q0-4 | agent-worker 3,766 → shell | — | ~1,700 (+Q1-4 → ~2,500–2,900) | ok after split; **fails without it** |
| Q0-1 | agent-harness | — | ~1,850 | ok |
| Q0-2 | agent-model | — | ~600–900 | ok |
| Q0-3 | agent-runner | — | ~300–500 | ok |
| Q0-5, Q1-2 | run-rules | 1,708 | ~1,850 | ok |
| Q0-6 | ai-runs | 2,725 | ~2,950 | ok |
| Q0-7, Q1-3 | credentials | 947 | ~1,250 | ok |
| Q0-7 | runtime-limits | 308 | ~340 | ok |
| Q0-8 | installer | its source (not the embedded release) | +~150 | ok |
| Q0-9 | instance-setup | 3,005 | ~3,080 | ok |
| Q0-10, Q1-6, A-16 | control-plane | 3,735 | <3,850 | **close**; wiring only, arms owned elsewhere; report it |
| Q0-10, Q1-6, A-16 | op-declarations | 2,684 | ok | ok |
| A-1 | calc-grammar | — | ~800–1,200 | ok |
| A-2, B-1, B-2 | calculations | — | ~2,000–3,000, +~400 at 1b | ok; measure at the 1b job (workbook bindings later would press it) |
| A-3 | office-readers | 3,524 | ~3,750 | **close**; if over, `formats-xlsx` splits (BOB's) |
| A-4 | odf-reader | 2,259 | ~2,400 | ok |
| A-5 | content | 3,533 | ~3,650 | **close**; report it |
| A-8 | inquiry | 3,903 | ~3,950 alone; with hypotheses (ext) **>4,000** | **fails**; split first (K617), seam named by BOB |
| A-9 | strength | 2,225 | ok | ok |
| A-10 | reevaluation | 3,042 | ok | ok |
| A-11 | consequences | 1,109 | ~1,050 | ok |
| A-13 | case-checker | 1,014 + generated program | grows by calc-grammar | ok (program is generated) |
| A-14 | case-import | 1,653 | ok | ok |
| A-15 | case-authoring | 2,930 | ok | ok |
| A-15 | public-read | 2,905 | ok | ok; publication untouched (4,625, already past the mark: its own split is owed, outside this scope) |
| Q1-1, B-3 | answers | — | ~1,500–2,500 | ok |
| Q1-5 | skills | 1,993 | ~2,100 | ok |
| Q1-7 | plane | 2,658 | ok | ok |
| Q1-7 | wizard-scripts | 1,588 | ok | ok |
| Q1-7 | affordances | 3,365 | ~3,450 | ok, close |

## (c) Later ANALYSIS and QUESTIONS items: the hard reason each is not in T33

**ANALYSIS L3, workbooks (stage 2a).**
- `sheet-worker`, IronCalc wasm, and the workbook path: binding, recompute, lint, method note, the second member's check, export from recipe to XLSX.
  - **Reason:** a measurement that can be done before T33 opens: which functions the 288 corpus workbooks use, IronCalc's agreement with their cached values, and the wasm's size. All of it runs locally, with no T33 code.
  - **Could join T33 if measured GO before opening.** It needs A-2 (in T33) and would come late in L1/L5. Bindings and lint push `calculations` toward 4,000, so they need their own seam.
  - Live use needs a deployed fleet member (a signed release), but an inert build is fine (the `ocr-worker` precedent).
  - The ladder's "A1 in use" is a trigger, and B1 (c) made triggers non-blocking.

**ANALYSIS L4, longitudinal (stage 3).**
- **Budget and financial-report readers:**
  - P6: `docprofile` is 4,969 lines, past the mark; its split is stage 2b.
  - Budget-reader feasibility against M-55 is desk research.
  - Not T33 unless the docprofile split joins T33.
- **Fiscal-year periods** (`fiscal_year`, TIME T2):
  - A dependency not built in T33 if T2 stays in 2a.
  - It is only profile data plus a civil-time function, so it **could join T33 if TIME's owner pulls T2's fiscal year forward.**
- **Fund and program joins:**
  - They rely on `entities` identifiers (ext, 1a, in T33) and captured crosswalks (A-2), so a dependency is not the reason.
  - The real reason is the multi-year fund case data (the 200-figure exactness measure at 1b first).
  - **Could join T33 late** as a recipe step (`bio-calc/1` → `/2`).
- **Recorded random draws with an exact interval:**
  - Ruled (K1448). They depend only on calc-grammar, calculations and civil-time, all in T33.
  - **Could join T33**, as about 3–5 requirements in A-1 and A-2.
- **Portal snapshots and keyed field diffs; dataset vintages as `validAt`:**
  - Uses civil-time `validAt` (ext, 1a) and the monitoring scheduler.
  - Watch monitoring's size (3,366).
  - **Could join T33** if `validAt` lands in 1a. Otherwise the reason is a dependency not built (civil-time's `validAt` is stage 3 in the first synthesis).
- **Vega-Lite charts with a data table:**
  - P6: `publication` is 4,625 lines, past the mark, and charts are regenerated at publication.
  - Not T33 unless publication's split is in T33. The render could go to `public-read` (2,905), but the publication-time regeneration needs publication.
- **Amount filters (intent R4; progressions R32, T32 A37):**
  - R32's commitments need money L2–L3 (2b), a dependency not built.
  - Intent R4's amount filter over money facts **could join T33** at 1b.
- **Pattern statements with a registry denominator (F2):**
  - A dependency not built: events' timelines and patterns (2a, stage 3) and progressions on own dates.
  - Counts over the record alone could join T33.
- **PROV-O for inputs and outputs in the case file:** stage 4 exchange (D224 is no longer blocking under B1 (c)). It **could join T33** as about 2 requirements in A-12, since it is a rendering of carried data. Flag it.
- **PDF table engine re-measure (TATR class):** a measurement, desk research before opening. Until it is GO, typed transcriptions (content R24–R25) serve.
- **A partner group's rerun (E3):** uses case-import's recreate path (A-14). It needs a real second group, a measurement with a real group.

**ANALYSIS L5, assisted (stage 3).**
- `tabledeclarepropose`, `calculationpropose`, `workbookcheck`, and EXTRACT `table(engine)` proposals.
- **Reason:** a dependency not built, QUESTIONS L2 (a propose-capable mode deployed), with acceptance measured on DEC-77.3's instrument. Both need a real group.

**ANALYSIS: machine detectors and interest checks (K1491, C8).**
- They are calculations (recipes), not model runs.
- **Reasons:**
  - A dependency not built: money L2–L3 (trails, `committedAgainstPaid`) and people L2–L3 ties, both 2b.
  - A measurement: the false-alarm rate on a gold set, gate set first (needs a deployed copy with real data).

**QUESTIONS Q2, set things up (stage 2a).**
- CREATE, conducted acts, runs started from the panel (a member-principal dispatch, lifting ai-runs R18's `MEMBER_PRINCIPAL_RUN` path for runs started at the member's act), translation and message drafts, and suggestions behind the B17 switch.
- **Reasons:**
  - Q1's bar met in use (a measurement that needs a real group).
  - investigate verified live: it needs VF-4 (in T33) and then investigate's own live verification (a deployed copy).
- The B17 switch itself is built in T33 (Q0-7).

**QUESTIONS Q3, rules applied (stage 3).**
- Rule services: `standard`, `standardinforce`, `profiles`, `deadlinecompute`, entities, lines, holders, duties, a non-persisting recipe evaluation, and the legal-information line labels (K1474).
- **Its prerequisites are mostly in T33:**
  - TIME, LAW, ORGANISATIONS and ANALYSIS first services are in T33 (1a), so a dependency is not the reason.
  - Sourced profile facts (C-7, plus K1445's first rule set: CPRA, Brown Act, OMC, Government Claims Act, FOIA) are desk research that can be done before or in T33.
  - `duties` and occurrence reads wait on 2a, a dependency not built.
- **COULD join T33** as the last L6 job for law, time, organisations and figures: about 10–15 requirements in `answers`/`affordances`.
- Switch-on would be gated on the 150-question set, extended with rule questions (needs T33 code and a deployed copy).
- The widened reads follow their owners:
  - `holderAt` and `careerOf` (people 1b, in T33) **could join**.
  - `timeline` and `eventsFor` (events 2a), and `moneyOf`, `committedAgainstPaid` and `explore` (2b), wait: a dependency not built.

**QUESTIONS Q4, investigative questions (stage 4).**
- The question-to-run hand-off and the backward question.
- **Reasons:**
  - Investigate must be verified live (a deployed copy).
  - Runs' cost must be measured (a deployed copy; runs are separate conversations, `subsession.mjs`).
  - COURTS C1 is needed for proceeding questions (2a), a dependency not built.
- **Flag (possibly a Bob question):** ladder §9.5 still lists the backward question (D-165) as Bob's deferred doctrine. K1474 (iv) rules procedural reasoning for the group's own situation. BOB should confirm whether K1474 (iv) covers D-165's work list. If it does, no Bob question remains.

**QUESTIONS L5, standing questions (B21, K1481; stage 4 in constructs-2 §5).**
- **Its prerequisites are all buildable in T33:**
  - Q1 (T33).
  - Q3, which could join T33.
  - A saved-query form in `query-language` and `retrieval`. This is the member's own saved object, seen only by its owner, the one exception to K1450's "nothing kept".
  - A scheduler consumer on the one alarm.
  - The ceiling and usage (Q0-6).
  - A queue item kind for a standing answer (`queue`, `queue-producers`, L11; queue-producers is 3,875 lines, so P6 is **close**: a new producer may force its split).
- **No hard reason excludes building it.**
- **Could join T33.** The mechanical half (saved search, cadence, end date, change detection) is low risk. The AI-on-new-finds half is built but switched off until the 150-question bar is met (a measurement that needs T33 code and a deployed copy), because its answers reach the queue unattended.
- Its cost per firing is measured on a deployed copy.

**Also later:**
- **Extract mode:** the gold-set precision measurement (a deployed copy and gold sets).
- **Investigate and plan deployment:** VF-4 then its own live verification.
- **Voice and translation (J):** part of Q2.
- **B20 answer panel:** the design stream; it is not a T33 reason (K1430).

## (d) Measurements, stages 0–1b, in scope

**Desk research before T33 opens:**

- **M-Q5, the terms re-read.** Re-fetch Anthropic's "Use the Claude Agent SDK with your Claude plan" and the legal-and-compliance page (ladder §1 step 4). Fix:
  - (i) which sign-in yields the token a group's copy holds (`claude setup-token`'s long-lived OAuth token);
  - (ii) whether binding it as the group's own Worker secret, or keeping a member's on their device, counts as "signed in through Anthropic's own flow", with the developer never collecting or routing it;
  - (iii) Team or Enterprise conditions for shared use.
  
  This decides Q0-7's storage.
- **M-Q4, the Agent SDK control shape.** Can a turn end at a tool call and return it to the caller, so the Worker's table keeps R16/R39 control, or must tool calls relay over the container connection? This is a local Node spike, with no deploy.
- **M-Q8, newgroup and containers.** Can newgroup install a container-backed fleet member through the Cloudflare API with the OAuth scopes it requests (Containers image registry push)? If not, group copies get the API-key path only until it can, and the subscription path runs only where a session or operator deploys.
- **Rate limits.** The Start-tier rate limits of a new Console account, against a multi-turn ask (published figures; confirmed in M-Q1).
- **Source item 7's rules** (C-7) and K1445's first rule set.
- **Recipe coverage** of every calculation in the journeys (A-1).
- **The dataset census** against the 8 and 20 MiB bounds (A-2).
- **Oakland's money sources:** the OpenGov export format and basis statement, whether a vendor ledger exists, and which ACFR years have a text layer. The money-table census (B-1).
- **The 150-question set and its bar,** set before measuring (Q1 gate). Its contents are assembled now.
- **The 200 ACFR and budget figures,** assembled now (measured with T33 code).
- **The opaque-tail length** against the collision bound (S0-1). A table census (S0-3, S0-14).
- **The IronCalc measures** (only if workbooks are to join T33; see (c)).

**Need T33-built code (run locally or in tests):**
- Exactness against a decimal reference (A-1).
- The figure parser on the 200 figures (B-1).
- Corpus-export paging cost on a large fixture (S0-15).
- The 10,000th-id tests (S0-1, S0-2).
- The derived-cache rebuild-and-compare (S0-3).

**Need a deployed copy:**
- **M-Q1:** one model turn through each path (API key; subscription in the container): latency, CPU, cost or plan usage.
- **M-Q2:** whether the container starts Claude Code reliably (cold start, spawn failures, memory).
- **M-Q3 = VF-4:** CHECK's first live run.
- **M-Q6:** the default use ceiling, from per-ask and per-run usage.
- **M-Q7:** per-ask bounds.
- **CPU and peak memory** to normalise and evaluate 20 MiB in the shared 128 MB isolate (A-2).
- **M-Q9:** the 150-question set on two models (Sonnet 5.5, Opus 5.5) for grounding, abstention, level statements, mistranslation, false refusals, latency and cost. This also picks the model per mode.
- **Everyday response budgets** (K1432): a baseline before T33 code lands, and re-run after.

**Need a real group:** none for stages 0–1b. Q1's "bar met in use" is Q2's precondition, not Q1's.

## (e) Acts only Bob can take for stage-0 items

1. **A Claude account for the test copy.** Two possibilities:
   - **Subscription path:** Bob signs in to his Claude plan through Anthropic's own browser sign-in (opened by a session running `claude setup-token`, its output piped straight into `wrangler secret put INSTANCE_CLAUDE_TOKEN` on the test copy, so no secret is printed). Bob's one act is to open the link and approve. Usage draws on his plan's limits (P14: his weekly meter).
   - **API-key path (optional, for M-Q1's comparison):** Bob creates a Console API key with credit, and pastes it into the copy's update page field, never into chat.
2. **Payment.** A Console account needs prepaid credit for the API-key path. If Containers is not already enabled on account `20b5…7f72` (Workers Paid is), enabling it in the Cloudflare dashboard is his.
3. **Approving the deploy** of the test copy and the agent runner's container image if this session's permission check asks. The handoff records that reviewed acts such as the fast-forward of `main` were refused by the permission check (K1454).
4. **A signed release.** This is only for group copies through newgroup (the new `agent-runner` member, the regenerated bundle of item 13). It needs the `bio-release` key, through `sign-release.html`. If its private half is held only by Bob, the signature is his act. This is not needed for the project's own test copy or VF-4.
5. **None of Bob's decisions are needed.** B16, B17, B21, B12 and C8 are all ruled. The only possible question is D-165's coverage by K1474 (iv) (see (c), Q4), which BOB can likely settle by reading.
