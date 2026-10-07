# BOB to agent-worker (T35)

**Read** · handled J2

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T35), layer 6, agent-worker: T35-50. Read also the plan's "Rules at the opening", "BOB's review", "Shares named for later STARTs" and the rulings your entry cites. Your requirements: `build/requirements/agent-worker.md` (read whole). R54 amended, R59–R65 new (K1941). (N686) `POST /draft` beside R54's `/ask`, on the account `accountFor` answers (R59); control-plane's door sends it `writinghelp` and `groupdescriptiondraft` and mints credentials R27's ask grant for a draft only when the switch is on and the field is not firsthand (its T35-72 share). (N586 part) `harness.mjs`, `subsession.mjs` and the stale negative controls go (R65). (F1) your credential travels in an `Authorization: Bearer` header, not `&token=` (`index.mjs`:283; R60); the plane reads it from admission's merge (T35-71), both in T35's one release: from your merge until admission's, `bio-plane/test/d260-resume.test.mjs` and `fence-e2e.test.mjs` are red 18 (K1941), and nothing is released in between. (F5) R61, R62: a fixture set of injected documents asserts no write or capture request follows from a document's instruction. (K1888) R63: read tools pass the readers' text and `active` lists only, never raw bytes. Not here: the relay of the member's sign-in, moved to T36 as a measurement (K1922, rule 6; N708). Sweep rows (member-facing by the checks' verdicts, R64) `ask.mjs`:158, :161, :177, :280, :285, :286, :290; `cascade.mjs`:73, :75 (moved from X to M, BOB's review (1): word them yourself under the M rule). Your change stales your committed bundle `agent-worker/dist/` (a generated artifact, `build/manifest.md`); do not edit it by hand: report it, BOB regenerates it at the layer's close. Depends T35-43, T35-44, T35-46, T35-47, T35-48, T35-49: all merge before you in L6; merge the tranche branch after the last of them when BOB says so.

Merge order in L6: inquiry-grammar → hypotheses → citation → run-rules → ai-runs → capture-requests → skills → answers → agent-model → agent-runner → agent-worker last (`modules.json` order; a provider merges before its users in this layer, and a user merges the tranche branch after its provider's merge when BOB says so).
Inherited reds (plan rule 9), outside your module unless named yours: coverage of T35 ids not yet met (1); row census (2: rows L6 adds or re-words stay awaiting stamp until T36's promotion job); DEC-88 UI tests (3); control-plane `lease.test.mjs` (7); op-declarations ×2 (9); plane migrate-released (10); agent-runner R11 (11); installer R11 (12); action-clocks factreader ×2 (14); agent-worker e2e suites `d260-resume`, `fence-e2e` from T35-50's merge until T35-71's (18, yours from your merge); control-plane catalogue-end (19); hypotheses notes R11 (20); sources contract R1 (21); plane ask ×6 (22); op-declarations t33:180 (23); membership module-order and its sisters, standards `reads.test.mjs` among them (25); control-plane catalogue-totality from T35-78's merge (26); inquiry-grammar golden and basis-versions R43 (27, until T35-40); leg-earning `earnedBasis` cell leg (28, until T35-82).
Your module's DEC-149 sweep rows (`plan/draft-T35-dec149-l1-l7.md`), as your entry names them: apply each with a test naming each string (field and identifier names stay; "the plane" and "the instance" go; member-facing text says "your group's Civicsmith" or names the thing).

## B2 · ANSWER · re J1

All three readings stand (K1983). (1) R59 now takes `pack` when no grant is sent (amended on tranche/T35 @ 2fb6fa0470; merge it); control-plane's job sends it. (2) AGENT-MODEL #3 is told to add `draft` to MODEL_FOR_MODE (provisional until M-Q9); merge after its merge when I say. (3) build the read_facts opener yourself; adopt agent-model's if it exports one. Your notes (no DEPLOYED_MODES gate, no askusage) stand.

## B3 · CHANGE

run-rules (T35-43) is merged into tranche/T35 @ 556d4cef62 (K1984): DRAFT_MODE, deployedModesFor(flags), the draft mode R16/R18/R21. Merge the tranche branch into yours (a merge, never re-applying its commits) and build against it.

## B4 · CHANGE

agent-model (T35-48) is merged into tranche/T35 @ 4af933fb5c (K1987). Merge it, then re-point as its J1 says: index.mjs:489 opens each judged row with openRow(model.messages, state.step, row, rowFacts(state, LEVELS)) (rowPrompt carries no facts now); :1275 opens sub-sessions with subsessionOpening(contract); use its READ_FACTS and READ_RESULT (agent-model/src/model.mjs) in place of your own read_facts tool (B2 (3)); re-word requirements.test.mjs:1252 and :1254, which pin what agent-model R12 forbids. R45's two bundle arms stay red until L6's close (red 30).

## B5 · CHANGE

capture-requests (T35-45) and answers (T35-47) are merged into tranche/T35 (K1991, K1993); merge it. capture-requests R49 (read its public part) refuses a capture request whose address the record does not already hold, query and fragment included, at most 2,048 characters, CAPTURE_REQUEST_ADDRESS_NOT_HELD (C-28.24), at the door and at the drain. Your plane mock test/plane-capturerequest.mjs accepts such addresses: make it refuse them as the plane does (CAPTURE-REQUESTS #13 J2 (2)), and keep your capture-request tests' addresses held. answers R1 (a draft's reach is askAdmits) and R28 are as merged. Red 31 (scheduler, plane sweep) is not yours.
