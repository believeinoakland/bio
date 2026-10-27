# T53 R1 · ai-accounts · rows

## plan-T53-draft.md

**ai-accounts**
- T53 · N1220 (K5457) · the account model (owner, provider, plan, means gateway/sealed/reference/issued/none, ordered entries); plan scope and the personal-subscription rule from the catalogue; the hop; disclosure per provider and host; checks P1-P7; free-tier acceptance; the gateway payer check · `lane-ai-design/draft-ai-accounts.md` R1-R64 (AI3-AI5 answered A, K5477-K5479)
- T53 · K5457 · R8, R12, R13, R18, R35 and twelve old ops retired, nineteen new declared, every user re-pointed in this tranche, no aliases (FOLD-AI §2 lists the sixteen modules) · `lane-ai-design/draft-ai-accounts.md` Part 1, R36, R38, R61
- T53 · DEC-465, DEC-466, K5471 · `aikeyseal` (R69), a member's own list order (R70), declared ops (R71), a share flag turned off (R72), `GATEWAY_UNAVAILABLE` naming who can grant it (R73), the readiness summary (R74); a member clears the payer flag on her own account (R68) · `lane-ai-design/draft-ai-accounts-dec465.md` (AI11 B, K5486: any project the member has joined; the draft's "owns" changed by AI-DESIGN)
- T53 · K5457 · migration: apikey to the Anthropic API plan (sealed), signin to subscription (issued), project sign-in accounts ended and told once · `lane-ai-design/draft-ai-accounts-dec465.md` R59
- T53 · K5478, DEC-471, K5493 · `aicreditsclear` replaces R68 ("Clear it and turn the account back on"); the credits stop a Queue item, kind `ai-credits-stop` (R75); a dated terms change is a notice, never a step (R76); the `membership` role-change listener (For BOB 3, decided K5501: below) · `lane-ai-design/draft-ai-accounts-dec465.md`
- T53 · K5501 · a member removed from a project (`projectRemove`) or revoked from the team loses her placements of shared accounts on its list in the same act, each a change, the project's owners told once; who placed an entry recorded (`placed_by`) (ai-accounts R77, R27 amended) · `planning/lines-K5501-role-change.md` (its five technical points decided as recommended, K5502)
- T53 · DEC-476 (AI15, K5493) · screens-ai: `aiconnect` step 4 asks no one to accept terms (the tick box undrawn), the free-tier acknowledgement kept, the fold quoting the binding terms; ai-accounts R76's dated change is `ai.notice.termschange` to whoever manages the account
**English in tests** (K5565) · every module with sites carries one conversion entry for its own, done in this tranche; 58 modules gain a job by it alone · `planning/plan-T53-tests-english.md`

## plan-T53-journeys.md

### Layer 11 modules named by the register that have no draft line of their own
- **people, hypotheses, filings, action-clocks, action-holds, action-replies, action-plans, plan-work, reading-guides, agent-steps, progressions, retrieval, reading-pipeline, credentials, ai-accounts, acquisition, attestation, instance-setup, setup-words, stewards**: named as co-owners in the register; the drafts write the line in the screen module and, only where the table above shows "(owner half)", in the owner module. The job for each reads the screen-module line's "owner" clause.

## plan-T53-tests-english.md

**The entry, the same for every module below** · T53 · K5565 · convert the module's English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (the text only in the module's own source) first gets its key in the module (a words row, UX-DESIGN's wording where it is shown to a member); a C site (in neither) is test input or a dead assertion: kept as input data, or removed with its reason; and every test the job touches for its other entries is converted with it (the words check refuses English in a new or changed test) · `tests-sweep/CENSUS.md`, `tests-sweep/CENSUS-RX.md` (the module's rows) · Test: the words check's baseline loses the module's files, and the module's suite is green.
**Literal sites** (CENSUS) are A / B files (A: already a `words.json` value; B: inline only). **Regex sites** (CENSUS-RX) are A / B / C sites (files). Counts are before TESTS-SWEEP's certain conversions, which remove 31 A literals and 34 A regexes. "only this · <model>": the job's model (BOB #324, K3518): `haiku-5-5` where the work is test-only, `sonnet-5-5` where a B site needs the module to give a key first (a source change). The module had no other T53 entry, so K5565 gives it a job in R1 (62 such modules before this file; four of them have carried entries the count missed, marked here without the note).
| layer | module | literal A / B files | regex A / B / C sites (files) | |
|---|---|---|---|---|
| 2 | ai-accounts | 0 / 0 | 12 / 7 / 4 (11) |  |
