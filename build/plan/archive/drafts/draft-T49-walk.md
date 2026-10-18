# Discovery walk of T48's code (K3320)

**Status** · A worker's report for BOB #176 (2026-10-14), reviewed and kept as a source of T49's plan (K3324). The walk ran the assembled product locally (the installer and the plane under Miniflare, a fake Cloudflare account; journey-check's `local.mjs`), on `tranche/T48` @ ed97944ac2, as the founder/administrator (`admin`) and a member (`mai-k`), through the screens' own controls only (ops called directly only to observe). Journey 28 passes (22 steps, 0 failures). Past it, Bob's goal (K3320) fails before an investigation can do real work. **10 BLOCKER, 19 MAJOR, 3 MINOR groups.** The walk's script, harness, fake model and screenshots were in the worker's scratch (not kept); journey-check's extension (T49) re-makes the walk as a tested requirement.

Scratch-only workarounds the walk used to continue: control-plane strips `member` only for `stepsource`/`stepsourcewithdraw` (D1); find-in's cite sends `role:"supports"` (D7); the dock's zero bounds dropped (D3); a `reloadPlane()` hook in `local.mjs` binding a stub city site and AGENT_WORKER; agent-worker under Miniflare with `agent-worker/test/inprocess.mjs`'s fake model completed to the answers contract.

## BLOCKER

- **D1 · own API key refused** (`/app/connect`, both roles). Body `{"member":"member:admin","kind":"apikey",…}` → HTTP 200 `{ok:true,result:{ok:false,code:"NOT_YOUR_ACCOUNT",check:"C-29.14"}}`. `control-plane/index.mjs:2477` strips `member` for every op declaring it (T48 R92 asks only `stepsource`). After the fix it works for both roles. (N1095)
- **D2 · the founder cannot Ask** (`/app/answers`, administrator): 403 NOT_YOUR_ACCOUNT ("an ask's grant is minted only under the member's own live session"); her session role is `admin`, `credentials/index.mjs:1316` requires `member:<id>`. Owners: credentials, membership's founder identity.
- **D3 · the dock's run refused while it says it runs.** `airunopen` → `{started:false, code:"AI_RUN_BOUND_NO_ALLOWANCE", C-22.16}` because `screens-inquiry/assistant.mjs:228` sends `fetches:0`, `subsessions:0`; `refused()` ignores `started:false`; it then calls `airundispatch` ("no such run") and draws "A run of yours is working on this … The run could not be started:" with an empty reason.
- **D4 · no run on an API key.** `airundispatch` → `withheld:"MEMBER_PRINCIPAL_RUN"` (`ai-runs/index.mjs:2222–2225`): only a member's own subscription sign-in dispatches (K2892), and the sign-in needs agent-runner; connect says "Runs · on". BOB's reading (K3324): K2892's "member's account" covers her own API key (K1755), for her own runs only.
- **D5 · planning help refused** for the project's owner and a joined member: `planask` → `AI_RUN_NOT_PROJECT_MEMBER` though `projectparticipants` shows both; probable cause `ai-runs/index.mjs:806–820` passes `member:<id>`, participants keyed by handle. The plan screen still says "The assistant is looking for options." Owners: ai-runs, screens-action `plan.mjs`.
- **D6 · HTML and text captures have no text units.** `/app/document/<INFO>` shows no words or passages (design: mock ~l.820–841); Find-in "no text"; Find misses its words. `reading-pipeline/index.mjs:1175–1215` records a reading with no `textUnits`, so `capture_text` stays empty (`extraction/index.mjs:727`); HTML has no format `text()` entry. A real defect; PDFs to be checked live.
- **D7 · Find-in's cite sends no role**: NO_ROLE (C-33.16); `screens-daily/find-in.mjs:223–231` draws no supports/against choice; the question's "Cite a passage" opens Find-in, the only path to cite.
- **D8 · a question can never be concluded**: NO_CLAIM (C-33.34); no screen draws `versionaccept`, `versioncurrent` and the rest (`basis-versions/index.mjs:1930`); readings are machine-proposed only. Owners: screens-inquiry `question.mjs` (DEC-235's readings, N1089), basis-versions.
- **D9 · uploads vanish**: `captureupload` stores the bytes but no INFO bundle is made; the screen says "It waits in Held captures" (`screens-intake/capture.mjs:199–215` never promotes; the address path does).
- **D10 · a non-test install opens no run**: run-rules R19's test bar on an empty Civicsmith set (N829) → AI_RUN_MODE_NOT_DEPLOYED; only `CIVICSMITH_TEST_INSTANCE==INSTANCE_NAME` admits untested parts (`ai-runs/index.mjs:331`, `run-rules/test-bar.mjs:127`). For biosmoke8 the deployer sets it (K2816 (2)); a public release waits on N829.

## MAJOR

- **D11** project titles drawn as raw `PROJ-…` on project, question, projectai, find-in: Home's promote writes no `title:` (`screens-daily/home.mjs:318`; `project.mjs:93` reads `doc.title`).
- **D12** no act files a capture into a project or question; the project's Find says "Nothing here" (captures: 0) for words its captures hold.
- **D13** vouching (`release`) refused ENTRY_REQUIREMENTS (`data/dataset.json` never written; `ratification/release.mjs:195`); every held row "Refused" with raw "verified state has entry requirements … (C-2.7) … catalog" (`screens-intake/held.mjs:21`).
- **D14** Supports lists no citation made (`basisversions` → `versions:[]`; `question.mjs:160–196`); strength text raw ("UNRATED on capture … Not load-bearing: INFO-…-observation").
- **D15** the document page: grade "Unrated" while the note says B (`document.mjs:117`, the note a string); "Its versions" fails with developer prose; the address in literal quotes (`document.mjs:56`); title the URL slug; a testimony offers Watch and Check-version, no Find-in, no words; raw ISO times in titles.
- **D16** Find-in shows the 64-hex sha as its scope and 12-hex labels on results; a testimony reaches Find-in only by typing its address.
- **D17** Ask draws a refusal as "This could not be read", `not_established` not drawn; agent-worker's answer tool requires only `question_as_read` (`agent-worker/src/ask.mjs:86`) while `answers/check.mjs:42–47` requires all 15 fields: a real model's ANSWER_MALFORMED likely.
- **D18** the dock leaves the reason blank for AGENT_WORKER_UNBOUND and MEMBER_PRINCIPAL_RUN, and keeps "A run of yours is working on this" for an hour.
- **D19** after `planopen` the question says "Its screen comes later" though the plan screen exists and nothing links to it; the project lists no plan.
- **D20** the plan screen shows raw `INQ-…` and `inquiry:INQ-…`, asks the person to type a reference, shows lowercase category codes.
- **D21** queue and Home to-do items are a bare URL with "Act on an item".
- **D22** the capture result has no link; every capture calls `web.archive.org/save` without asking (BOB to confirm against canon).
- **D23** `/app/setup` tells a member "you are your group's first administrator, signed in as admin" and offers "Show my recovery codes" (`screens-entry/setup.mjs`).
- **D24** the door's rate limit (300 per 10 min per source, `admission/index.mjs:866`) is hit after ~70 page loads: 429 on `bootstrap`, `groupidentity`; Members "could not be read". Live check needed.
- **D25** a project invitation raises no queue item.
- **D26** the founder never chooses a handle ("admin" everywhere: N1072, T49-1/-4/-17); Members "Active members: 1", the administrator omitted.
- **D27** connect gives the administrator no pointer to the group key (on Members); "My Claude subscription" offered while the screen says it is not installed.
- **D28** an expected REAUTH_DUE 403 logs a console error.
- **D29** `journey-check/walker.mjs:73` misses refusals nested in HTTP 200 (D1, D3, D5, D7, D8, D13 would pass it).

## MINOR

- **D30** wording: door cards run title into description ("A problem I live withPotholes"); "1 questions"; Updates "allowed by set at setup"; Explore "no centre is named…"; Connect "you held the key"; header "Explain promptly"; an empty Translations screen.
- **D31** layout: a tooltip stays open after a click over the next field; at 390 px chip and sha clipping; closed door buttons have no accessible text.
- **D32** a member not joined sees "What pays" failed with "No project answers to that id".

## Walked and passed

Journey 28 whole; Home for both roles (no placeholders or keys, no console errors, every link real); start a project and open it; open a question; the API key connects (after D1's fix) with re-ask, uses, limits and usage; capture from an address (grade B, Held, queue); testimony and Find-in over it; citation (after D7's fix); plan open, the plan screen, adding an option; project invite and join; a run opens on the test instance (after D3's fix); a member's Ask end to end through agent-worker and the fake model (4 turns, the plane's answer check, labelled "Not yet tested" and "Machine work"); every registry screen drawn bare and with subjects, both roles; phone width, no page scroll.

## Not walkable locally (the live walk must cover)

The installer's fleet step installing and binding the six capability workers (the fake account's release repository answers 404); PDF text through pdf-worker, scanning and safe view; the subscription sign-in through agent-runner (a Container) and then a real check or plan run (steps, `airunlog`, results, suggested readings, accepting one, D8); real model answers against the contract (D17); a copy without the test mark (D10); outbound timestamping and Wayback; rate limits with real sources (D24); publishing (no act opens `case-editor`; blocked by D8).
