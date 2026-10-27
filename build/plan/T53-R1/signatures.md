# T53 R1 · signatures · rows

## plan-T53-draft.md

**signatures**
- T53 · K5457, K5471 · three more namespaces: the catalogue's, the Gate 1 suite's and the AI run's (`NS_AI_RUN`) (R49-R53 as AI-DESIGN lists them; the run-key check the issuer's R12 needs) · `lane-ai-design/draft-ai-catalogue.md` (signatures), `draft-ai-gate.md` R54-R64; the five as lines in `lane-ai-design/draft-signatures.md` R49-R53 (READY)
**English in tests** (K5565) · every module with sites carries one conversion entry for its own, done in this tranche; 58 modules gain a job by it alone · `planning/plan-T53-tests-english.md`

## plan-T53-tests-english.md

**The entry, the same for every module below** · T53 · K5565 · convert the module's English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (the text only in the module's own source) first gets its key in the module (a words row, UX-DESIGN's wording where it is shown to a member); a C site (in neither) is test input or a dead assertion: kept as input data, or removed with its reason; and every test the job touches for its other entries is converted with it (the words check refuses English in a new or changed test) · `tests-sweep/CENSUS.md`, `tests-sweep/CENSUS-RX.md` (the module's rows) · Test: the words check's baseline loses the module's files, and the module's suite is green.
**Literal sites** (CENSUS) are A / B files (A: already a `words.json` value; B: inline only). **Regex sites** (CENSUS-RX) are A / B / C sites (files). Counts are before TESTS-SWEEP's certain conversions, which remove 31 A literals and 34 A regexes. "only this · <model>": the job's model (BOB #324, K3518): `haiku-5-5` where the work is test-only, `sonnet-5-5` where a B site needs the module to give a key first (a source change). The module had no other T53 entry, so K5565 gives it a job in R1 (62 such modules before this file; four of them have carried entries the count missed, marked here without the note).
| layer | module | literal A / B files | regex A / B / C sites (files) | |
|---|---|---|---|---|
| 1 | signatures | 0 / 0 | 0 / 0 / 1 (1) |  |

## build/rulings.md

- K5577 · 2026-10-27 · layer 1 requirement lines (BOB's; K5571's l1 group) · `bob/T53-req-l1` @ c997abbd's 17 requirement files taken into `tranche/T53` before layer 1's START (K5571), reviewed: (1) bundler R43 (c): the release's `worker.json` carries no provider bindings; the agent Worker's AI Gateway and Workers AI bindings deploy from its own configuration (R19, R20); (2) register-readers R4: the street types are data the caller passes from the active layers (jurisdictions' federal layer holds the USPS street suffixes), never words in the module's code (`build/layers.md` rule 1); `contactShape(text, streetTypes)`; jurisdictions' job adds the federal layer's `street_types` section as data; (3) structured-text-reader: text and HTML stay where they are read now; (4) the worker-drafted lines csv-reader R28, text-chain R108, court-doctypes R19, jurisdictions R137, R139 stand as drafted; names marked "BOB's" (`kindTable`, `photoFactsOf`, `redrawPicture`'s refusal) are the jobs' to choose; (5) signatures R50: layer 1 does not wait on the catalogue key ceremony: the job builds `CATALOGUE_KEYS` with test keys; Bob makes the catalogue signing and recovery keys on the signer page during layer 1 (as K2922), and BOB sends their public lines to the running signatures job as a CHANGE. Checks after: format 0, architecture 0, coverage 17 findings, all layer 1's new not-yet-met lines (met by its jobs), channels 0, words 0 · P5, P10, P17, P19; K2922, K5567, K5571
