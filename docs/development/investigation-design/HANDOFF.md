# Investigation design lane: handoff to BOB

Numbered entries; BOB answers each in rulings (K) on `tranche/T<n>`. Decision states live in `DECISIONS.md`.

## H1 · 2026-10-07 · Bob's plan construct joined with the open decisions (page 1)

**Carries:** no ruling yet. Page 1 is rendered for Bob at https://claude.ai/artifact/EZoYvGdvkX2F6jNogG9vNP (source `page-1.html`). It folds in BOB #134's mapping (`build/plan/study-K2075-mapping.md` on `tranche/T36`), with its seven questions reviewed: kept as D25–D31, reshaped where Bob's K2075 words went further than the worker's options (D25 real subgoal teams with leaders, not a label; D29 stated figures with totals, not a free list; D30 system-drafted, leader-issued reports).

**Open with Bob, in unblocking order:** D25, D26, D27, D28, D23 (revised), D1, D17, D18 (stages 1–2); then D29, D30 (no AI); D31 with D12; the AI-stage decisions D2–D4, D6–D8, D12–D14, D16, D19–D22, D24 unchanged from K2064's page.

**For requirements when ruled (not yet):** the plan construct widens stage 2 (`enquiry`: subgoals, teams, leaders, assignment with accept/decline, step dependencies, deadlines, milestones, retire/delete, resources; `investigation`: issued status reports). Doctrine fences to carry regardless: DEC-68 (no measuring members), K1892 (no open/download record), DEC-69/DEC-94 (reminders only at the member's request; overdue once; no outside channel), D15 (never published), K1484 C2 row 2 (no role changes sight), Ladders §10 (group's own dates never findings), K1463 (group money unmarked in the world model).

**Owed to the UX stream (after rulings):** the plan's screens (subgoals and teams, assignment accept/decline, milestones, resources, report drafting), and the name that tells the investigation's plan from the action plan (D23).

## H2 · 2026-10-08 · Bob narrows K2075; the relationship study

**Carries:** Bob, 2026-10-08: "It was inaccurate of me to talk about members being assigned roles and for there to be subgoals within a project. As we look at filling in the capabilities of projects I think we should study the relationships between steps, basis, claims, findings, and any other elements." D25 and D26 withdrawn; D27–D31 paused until his wording of the plan settles. The study is `S1-relationships.md`, rendered at https://claude.ai/artifact/6cHHcybJpV3SPf25wVmeLN.

**For BOB to note (no ruling asked):** K2075's assignment and subgoal parts no longer stand as Bob's direction. The study finds no investigative step anywhere in canon or the built modules (the action plan's steps are post-finding); "basis" and "finding" each carry five or six senses across canon.

## H3 · 2026-10-08 · one working document; steps on questions

**Carries:** Bob asked for one document "that we can use to carry the research, questions, and design forward". It is `investigation-design.html`, rendered at https://claude.ai/artifact/QjSSFHE78G9PtwKhpW5ZEo; pages 1–3 now point to it. It holds Bob's direction in his words (K1627, K2075 as narrowed, D32, D33), the model, the open questions, the research and the register. From now on the lane updates that one page.

**Bob's direction, for BOB to note (no ruling asked yet):** D32 (a step is the work done in pursuit of an answer to a question; dead ends kept; steps also exist without a question; chance finds may be tied to a step afterwards) and D33 (members decide what becomes evidence; the system, including AI, may proactively explore a question, gauge its finds and offer them). This moves the plan from the project (synthesis `enquiry`) to the question, and D33's "proactively explore" meets K1481; open with Bob as D34–D36.

## H4 · 2026-10-08 · AI use across groups, projects and members (D34)

**Carries:** Bob's D34, in his words in `DECISIONS.md`: support the range of AI use across groups and members; projects may have their own account, limits and enabled AI capabilities; groups and members on their own accounts choose types of use, cost limits and enabled features, and track use; future releases may support other models. Read by this lane: a project's AI settings set by its owners (D37); D31 subsumed.

**For BOB to note:** this is a requirements change across `ai-runs` (R48–R52: a project level, money limits where the account reports cost, per-use enablement), `credentials`/`agent-model` (a project account; provider-neutral wording), `instance-setup`. Not ruled in full yet: D38 (precedence of group, project and member settings) and D39 (unasked exploration where enabled, revising K1481) are open with Bob.

## H5 · 2026-10-08 · D38 ruled

**Carries:** Bob, 2026-10-08: "D38: C". When group, project and member AI settings differ: the group and each project may set limits on what the AI may see of their material, and those bind everyone whoever pays; money limits bind only the account they belong to; each payer decides what its own spend is used for (examples on the working document). **Requirements must say:** two kinds of AI setting (material limits at group and project level, binding all accounts; money limits per account); a member's own account is never bound by the group's or project's money limits, always by their material limits.

## H6 · 2026-10-08 · D39 ruled

**Carries:** Bob, 2026-10-08 (words in `DECISIONS.md`): each account owner (group, project, member) can set an overall usage limit and limits on each type of usage; a limit on proactively exploring a question may be marked inclusive or exclusive of the overall limit. Read as option A: the system may explore unasked where an account owner enabled it, within its limit (revises K1481 for exploring; the standing question stays as it is). **Requirements must say:** per account owner, an overall limit and per-use limits, each per-use limit inclusive or exclusive; exploring enabled only with a limit; runs labelled with who enabled them; told once at a limit. Period and units are BOB's detail (money where the account reports cost, tokens and calls for a subscription, per D34's reading).

## H7 · 2026-10-08 · D39 settled: the exploring setting

**Carries:** Bob's words in `DECISIONS.md` (D39 entries of 2026-10-08). **Requirements must say:** per account owner (group, project, member), an exploring setting No / Ask every day / Yes; "No" means not paid from this account and does not inherit; "Ask every day" raises at most one queue item a day to the account's owner(s), only when something is worth exploring, silence meaning no; "Yes" runs within the overall limit and the exploring limit (inclusive or exclusive of the overall); a group administrator's "no AI at all" binds project and member levels, a group money setting binds only the group key (D38). **Owed to the UX stream:** one setting per account; an override only on an open project or question.
