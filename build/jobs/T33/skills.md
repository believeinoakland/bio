# skills (T33)

**Status** · session_01GmSBs9c4ZXTh8Wo9f4QZWg · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Six readings of R33–R35 (T33-52). I am building on them now; please answer only where you read otherwise.

1. **R34, where `answers`' checks arrive in `published`.** No requirement gives them a key in `op=affordances`' no-target answer (affordances R17, R37, R39 name none). My reading: the key is `answer_checks`, holding `answers`' family as its R24 table holds it, `{CODE: {check, translation}}`. The layer carries it unchanged, every row included, and names no code itself (R23). If the key is absent or empty, the layer is a stated absence in R9's form. Something has to publish it, so I am filing a REPORT for affordances (a no-target `answer_checks`, read from `answers`' table).
2. **R34, next acts "by their catalogue ids".** No requirement lists which acts these are. My reading: the layer states that each next act is named by its id as the published catalogue (the `acts` layer) gives it. It types no id and carries no list.
3. **R33's acts.** `standardpropose` and `standardadopt` reuse R28's selectors, so each id stays one literal (R23, and R28's test holds this). `capturerequest` is named once, with `defined_by` "capture-requests R30" (the op's admission; the door itself has no R number). R33 says it is read "as R28's are", so with `standardpropose` published, a missing `capturerequest` or `standardadopt` throws (R1).
4. **R34, the legal-information labels.** In §9.4 they appear only in the L3 paragraph: "The legal-information line (B12 (ii), (iii)): labelled readings of held text, procedural facts from the profile shown as facts, never a member's rights, an outcome or what to file". R34 cites "§9.4 L1 and §10", so I take §9.4 whole (L1 and L3) as the source.
5. **R35, DEC-27's clause.** The ladders hold no sentence saying "structure only what the member said". The canon sentence is in `BIO_Assistant_and_AI_Roles_v0_1.md` §3 rule 7: "The assistant may only structure what the member SAID". I quote that, pinned to that document. The suggestion switch clause is quoted from ladders §2 "The suggestion switch".
6. **R33, when investigate is not deployed.** The investigate mode's name is read from run-rules' imported `DEPLOYMENT_SEQUENCE` (the mode after `first_deployed_mode`), never typed. Whether it is deployed is read from `DEPLOYED_MODES`. While it is not deployed, `load_when` is R33's sentence followed by a clause saying the layer is deployable only once that mode is deployed, with a member's account.

Also found: the K1516 red's cause. K1500 re-worded Action §4 rules 6 and 10, so R28's quoted sentences no longer match. I am re-quoting both from the canon as it now stands (wording only; R28's meaning is unchanged).

## J2 · QUESTION

One more reading (R35), separate from J1, which B2 answered.

R35 says: "The `ask` and every other layer carry, unconditionally, DEC-27's clause." My reading: the clause, "The assistant may only structure what the member SAID" (Roles §3 rule 7), is one object. It is carried in the `ask` layer's clauses and in the `suggestions` layer's clauses, and it is carried whether or not any switch is on. The suggestions layer's note says it governs wherever the switch is off.

I am not adding it to the bodies of the judgement, planning, filing, edition, wizard and legal-lookup layers. Two reasons: those are run modes, where DEC-60 supersedes DEC-27 for the investigative session (Roles §3 rule 7's own last sentence), and R2 fixes the resident layer's five keys. If you meant every disclosed layer's body, say so and I will add the clause to each one.

## Completion (T33-52)

**Entries applied.**
- **K1516, the red "R28 the action_planning layer":** the cause was K1500's re-wording of Action §4 rules 6 and 10, not the code. `ACTION_RULES` re-quotes both from the canon as it now stands. This changes wording only; R28's meaning is unchanged (accepted in K1601).
- **R33, the `legal_lookup` layer:** placed after `wizard_authoring`; `authored`. Its body quotes the ladders' §6.4 skill text whole, §6.4's "The AI's part", and §10's closed-book row. Its acts are `standardpropose` and `standardadopt` (R28's selectors, shared, so each id is still one literal) and `capturerequest` (capture-requests R30), each read by id from `published.catalog`. With `standardpropose` published, a missing act throws (R1). With none published, the layer is a stated absence. The mode it is deployable in is read from run-rules' order (`LEGAL_LOOKUP_MODE`). While that mode is not in `DEPLOYED_MODES`, `load_when` says so.
- **R34, the `ask` layer:** placed after `legal_lookup`. Its body quotes the ladders' §9.4 (the answer contract, the interpretation shape, the checks' limit, record content treated as data, the legal-information line) and §10 (the closed book, four-level absence), plus DEC-27's limit (Roles §3 rule 7). It carries `published.answer_checks` unchanged and types no code. Next acts are named by their catalogue ids, which the layer reads from the `acts` layer. With no checks published, the layer is a stated absence (K1601).
- **R35, the `suggestions` layer:** placed after `ask`. It quotes the ladders' §2 suggestion switch and DEC-27's limit. DEC-27's limit is one shared clause, carried in `ask` and `suggestions` only (K1602). The pack reads no switch, so it is identical for every member.
- `SOURCING` gains the new layers' labels.

**Deferred.** None.

**Found in another module.**
- `bio-plane/dist/bio-plane.bundled.mjs` (and `release/bio-plane.bundled.mjs`) bundle `skillpack.mjs`/`skilldoctrine.mjs` and are stale after this job. BOB regenerates them at layer close (§14).
- The `ask` layer stays absent until affordances publishes `answer_checks` in its no-target answer. BOB says this is in affordances' L11 START (B2).

**Uses.** No change: record-grammar, observation-log, strength, run-productions (doctrine), basis-versions, inquiry-grammar, run-rules, contradiction. Newly imported from run-rules: `DEPLOYED_MODES`.

**Tests and checks**, on `job/T33/skills` after merging `tranche/T33`:
- `node --test bio-plane/test/m/skills/`: tests 67, pass 67, fail 0 (new: `lookup.test.mjs`, `ask.test.mjs`).
- The tests of the users of the pack (agent-worker requirements and wire-vocabulary; affordances plane; ai-runs converts; control-plane catalogue-end and affordances-pack; system fleetbundles): pass 42, fail 2. These are the same two failures as before this job, both named accepted reds: control-plane's "R43, R22 … every published fence" (K1572) and fleetbundles' "agent-worker's 13 inputs" (K1598).
- `format`: 126 modules, 125 requirements files; 0 failures.
- `architecture`: 0 failures.
- `coverage`: 35 of 35 live requirement ids named by a test; 0 failures.
- `ownership`: 9 files changed by skills; 0 failures.

Size (session_01GmSBs9c4ZXTh8Wo9f4QZWg): test runs 10, module lines 2192
