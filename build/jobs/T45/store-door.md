# store-door (T45)

**Status** · session_01HmjbtHsdNjMqVSvbrVW1Yf · depth 2 · COMPLETE · handled B1

## Record

**How the reading set was read** (mechanics §17). Read whole by me: `roles/JOB.md`; `build/requirements/store-door.md`; BOB's START (B1); `op-declarations`' `t45.mjs` (all 67 ops); my code (`dispatch.mjs`, `pull.mjs`, `step.mjs`) and tests (`dispatch.test.mjs`, `pull.test.mjs`, `purge-hold.test.mjs`, `promotion-step.test.mjs`, `routes.test.mjs`, `harness.mjs`, `record.mjs`), all whole (P20). Of the owners whose reads I classified: each read's route arm in its owner's ops map and the requirement it cites (`plan-work`, `consequences` R20, `conformance` R37, `actions`, `filings`, `following` R24, `duties` R31, `reading-guides` R13, `case-check` R2, `local-facts` R12, R13, `case-account` R13, `agent-worker` R76, `plane` R40, R41), and `membership.visibilityOf`.

**Entry applied (T45-50; K2891).** The criterion is the table's own (its header comment, REC-196): a read is listed by the parameters that carry a BUNDLE id, the only parameters that can name a project; `visibilityOf` answers `discoverable` only for a project's own id, so an object inside a project (a plan, an action, a determination) passes to its route unchanged and only a project's id is answered at EXISTENCE. Of the 67 T45 ops, 43 are writes (`member`, `own`, `admin`, `owners`, `proposal`, `publishgate`), each checked by its owner, and none is listed — among them `projectscopeset`, `projectapprovalset`, `pressurerecord`, `successrecord`, `advocacycheck` and `arosefrom` from OP-DECLARATIONS #20's list. The 24 reads:

- **Added to `PROJECT_NAMING_READS` (14):** `successrecords` (`project`, `plan`); `cures` (`determination`, a bundle, as `determination: ["id"]` already is); `openitemswith` and `templatesforaction` (`action`, a bundle); plan-work's ten reads (`plan`, a `PLN-` record object): `matters`, `plantimeline`, `planreviewopen`, `planreviews`, `prepitems`, `plancomments`, `whereitstands`, `statusreportdraft`, `statusreports`, `matterpromiseduties`.
- **Added to `PROJECT_NAMING_READS_NOT`, with the reason (7):** `watchquestions` (a cursor and a count), `dutiesarising` (captures' digests, a date), `procedureguides` (a kind of action), `successread` (a success record's id, a row inside a project), `casecheck` (a case id, an edition and a check id, the case's own fence, as `casedocument`), `ruleoffer` (a `GR-` group rule id), `grouprules` (a section name).
- **In neither table (3):** `infractiondraft` and `bearingdraft` are the plane's `/draft` door's (`plane` R41), never a route of the store's door, as `writinghelp` is in neither; `advocacychecks` has no route arm on this branch and its parameters are not stated in `case-account` R13 ("No map: the plane routes both", T45-47), so it cannot be classified until its route exists (reported below).

Note: `planWorkOps` and `caseCheckOps` are not yet spread into the plane's map on this branch (T45-47); the rows apply once they are, and are harmless before.

**Tests.** A new explicit test, "R2 (T45-50; …)", names each new row with its exact parameters and drives each parameter, in the query and in the body: a project the viewer sees only at EXISTENCE is answered `PROJECT_SEEN_NOT_A_PARTICIPANT` before the route; controls: one she sees whole is asked and admitted to the route, a hidden one is routed and never asked; each new `_NOT` row's reason names its parameters and membership is never asked. The general R2 sweep covers every row too. The test cannot drive the owners' own maps (`plan-work`, `consequences`, `conformance`, `actions`, `filings` are not in my Uses); see below.

**Flaws in my own module:** none found. Deferred: none.

**Other modules / for BOB:**
- `case-account` / `plane` (T45-47): when `advocacychecks` gets its route, if it takes a parameter that can carry a bundle id it needs a row here; I would add it under a CHANGE.
- If BOB wants the new rows' parameter names tested against the owners' own maps (as the file-safety test does), store-door's Uses would need `plan-work`, `consequences`, `conformance`, `actions` and `filings` (tests only; all earlier in the order). Not needed for R2.
- `action-holds`' record asks store-door R4 to re-point `purgeHeld` to `action-holds`: R4 reads `store.purgeHeld` as the plane composes it (B1: "not yours"), so nothing here changes.
- Generated artifacts: none staled.

**Tests and checks run** (on the commit below):
- `node --test bio-plane/test/m/store-door/`: tests 45, pass 45, fail 0. No layer tests are named in `build/manifest.md`. No service I provide changed.
- `node checks/format.mjs`: 153 modules, 152 requirements files; 0 failures.
- `node checks/architecture.mjs … store-door`: 10 product files, 106 relative imports; 0 failures.
- `node checks/coverage.mjs … store-door`: 13 of 13 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … store-door tranche/T45`: 0 failures.

Size (session_01HmjbtHsdNjMqVSvbrVW1Yf): test runs 3, module lines 631

## J1 · COMPLETE

T45-50 done. Added to PROJECT_NAMING_READS (14): successrecords (project, plan), cures (determination), openitemswith and templatesforaction (action), plan-work's ten reads (plan). Added to _NOT with reasons (7): watchquestions, dutiesarising, procedureguides, successread, casecheck, ruleoffer, grouprules. In neither: infractiondraft and bearingdraft (plane's /draft door, not a store route), advocacychecks (no route arm or stated parameters yet; needs a row under a CHANGE if its route takes a bundle id). The 43 writes are their owners'. Explicit test per new row with controls; 45/45 tests; format, architecture, coverage, ownership 0 failures. Details and the Uses note (owners' maps not testable from here) in my record.

**B3 · CHANGE (K2900), processed.** Merged `tranche/T45` first (it changed no file of mine). `advocacychecks` is now a route of the plane's map (`plane/store.mjs`, reading `project` from the query, else the body), so it moves from "in neither" to `PROJECT_NAMING_READS` as `advocacychecks: ["project"]`; `advocacycheck` stays a write, its owner's. The T45 R2 test names the row with its parameter and drives it like the others: refused at EXISTENCE before the route (query and body), controls a project seen whole admitted and a hidden one never asked. Re-run on the commit below: `node --test bio-plane/test/m/store-door/` tests 45, pass 45, fail 0; format 0 failures; architecture 0 failures; coverage 13 of 13, 0 failures; ownership 0 failures.

Size (session_01HmjbtHsdNjMqVSvbrVW1Yf): test runs 4, module lines 633

## J2 · COMPLETE · re B3

B3 done: tranche/T45 merged first; advocacychecks added to PROJECT_NAMING_READS with key project, test and controls (refused at EXISTENCE before the route, query and body; seen-whole admitted; hidden never asked). advocacycheck left to its owner. 45/45 tests; format, architecture, coverage, ownership 0 failures.
