# setup-page (T36)

**Status** · session_01KpmmveDcVwoSp31P7oGuzY · depth 2 · COMPLETE · handled B3

## Record (SETUP-PAGE #3)

**Reading (mechanics §17).** The set was over 300 KB (own code 145 KB and tests 191 KB alone), so as B1's (3) asks: read whole myself `build/requirements/setup-page.md`, layer 11's row and contract in `build/layers.md`, K2130's draft section and "BOB's review" in `build/plan/draft-T36-L11-reqs.md`, the rulings K1939, K1957, K2063, K2130, K2147, K2152, plan entry T36-33, `credentials` R33–R37, R51, R52 (Purpose and those services), `file-safety`'s Purpose, Terms and R27–R32 (and `securityToolCatalogue`/`securityToolAdd`'s code, for the shapes), the whole of `bio-plane/src/setup-page/index.mjs`, and the tests this entry changes: `fixture.mjs`, `claim.test.mjs`, `settings.test.mjs`. A worker read in full the other nine test files (`page`, `session`, `guide`, `worker-page`, `loads`, `intake`, `keys`, `nonce`, `words`) and wrote a 9 KB summary for T36-33, every statement citing file and line; it named the four places the change would break (the fixture's `openAssistant`, `session`'s and `loads`' op lists, `words`' rows :304, :1585, :1590 and the R25 drawn list) and the scans new text must pass (R12, R26, R28, R21). Nothing it left out mattered: I then read and edited `session`, `loads`, `nonce` and `words` where they changed.

**Entries applied (T36-33).**
- **R18** (DEC-172): the four-way assistant choice is gone; the claim's section offers two separate blocks after R15 and R17, each also in members and keys: whether the group pays (nothing preselected; "the group pays" asks the key, sends it once in the body through `op=groupkeyset` then `op=groupkeyswitch` on, empties the field; "does not pay" sends nothing and says so; `op=groupkeystate` shown, never the key) and "Keep our material away from AI" (off and shown off; turning it on asks a reason of 1 to 2,000 characters and says what it does first, then `op=aikeepaway {on: true, reason}`; credentials' refusals in their words). The statement that a member may always connect their own account unless the group keeps its material away from AI is in the pay block. The page never sends `op=assistantset`, nor reads `op=assistantstate`.
- **R24**: the panel's "The assistant" switch is replaced by "Keeping your group's material away from AI": every signed-in member sees `op=aikeepawaystate` (who, when, the reason as text, "If you think this should change, ask an administrator"); only a session that administers (the founder at the claim) is offered the act, on with a reason, off without; a read that did not answer or answered `on` neither `true` nor `false` is said as not read and offers nothing. R23's help is offered exactly while keep-away is `false` (instance-setup R53), read fail-closed.
- **R30**: the optional security tools step after R29 and R15–R18, and in members and keys (with `op=securitytools` and `op=securitytoolremove`). Words: UX-DESIGN U125 (3)'s first form (B3, K2159). The catalogue is drawn as file-safety answers it (handling in words: sent, never sent, recipient, others, region, file and result retention, sharing; services not offered with their words; a template is shown with a note, not added). Adding asks the entry's credentials only (password fields, emptied once read), settings the vendor names (optional `name = value` lines, as `config`), the retention confirmation only for `vendor_internal_research`, "every file" only where file-safety's `onOwnServers` says (injected, K2155), the monthly limit prefilled with `DEEPER_CHECKS_PER_MONTH` (empty sends none: file-safety's default); then `op=securitytooladd` with `handlingDigest` and `op=securitytooltest`, saying passed and on, or why off. Every refusal in file-safety's words; the step goes on.
- R21: rows :304, :1585, :1590 were the switch's sentences; they left with it and are held in `words.test.mjs` as retired (neither old nor DEC-149 words remain); new sentences pass the whole-page scan ("a safe copy" and "safe-copy maker" are a document's copy).

**Deferred.** None.

**Found in other modules (REPORT J2).** (1) `file-safety` R27 / `file-scanner` R19, R29: a catalogue entry names its credentials but not the config fields its adapter reads (Defender's `tenant_id`, Intelix's `region`, K2085's list), so the page cannot ask "only what that tool's spec needs" field by field; it offers an optional settings box, and a generic template cannot be completed from the page. A `config` list on the descriptor would let the page draw them. (2) R18 as worded gives an administrator no act on this page to stop paying once the group key is on ("does not pay" sets nothing; `groupkeyswitch` off and `groupkeyremove` exist): a requirement/UX matter, not changed here. (3) Generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` is stale (this module's source changed); not touched (mechanics §14).

**Tests and checks.**
- `node --test bio-plane/test/m/setup-page/*.test.mjs`: tests 81, pass 81, fail 0, skipped 0 (was 75 before: R18 ×3, R24 ×3, R30 ×6 replacing R18 ×1, R24 ×1).
- Users: `node --test bio-plane/test/m/instance-setup/`: 108 pass, 0 fail, before and after this change. Layer tests: none named in the manifest.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs bio setup-page`: 0 failures. `checks/coverage.mjs bio setup-page`: 30 of 30 live ids named; 0 failures. `checks/ownership.mjs bio setup-page tranche/T36`: 10 files; 0 failures.
- P6: `index.mjs` 2,375 → 2,587 lines (+212, within the +150–250 estimate; far from 4,000).

Size (session_01KpmmveDcVwoSp31P7oGuzY): test runs 18, module lines 2587

## J1 · QUESTION

R30 offers "every file" (`use: "routine"`) only for a tool on the organization's own servers (file-safety R32), with a monthly limit defaulting to `DEEPER_CHECKS_PER_MONTH`. The catalogue entry (R27) carries `handling.recipient` but no flag saying whether it is the organization's own; that rule is file-safety's exported `onOwnServers(recipient)`. My Uses says file-safety is "for its tests only".

Best reading (carrying on with it): the page injects file-safety's `onOwnServers` (by its `toString()`, as it injects action-grammar's `riskTierState`) and `DEEPER_CHECKS_PER_MONTH`, never a copy, so setup-page's code imports file-safety (the `modules.json` edge exists; layer 3 before 11). That makes the Uses line "R30's rule for `routine` and the monthly limit's default, injected; and for its tests, R30's ops" rather than "tests only". If you would rather keep the edge tests-only, the alternative is to offer "every file" for every tool and state file-safety's `USE_NOT_ALLOWED` when it refuses, which R30's "only for" forbids.

## J2 · REPORT

Found while applying T36-33 (details in my record):
1. file-safety R27 / file-scanner R19, R29: a catalogue entry names its credentials but not the config fields its adapter reads (Defender's `tenant_id`, Intelix's `region`, K2085's list). The page cannot ask "only what that tool's spec needs" field by field, so it offers an optional "settings its vendor names" box (`name = value` lines, sent as `config`); a generic template cannot be completed from the page and is shown with a note. A `config` field list on the descriptor, answered in the catalogue, would let the page draw each field.
2. R18 as worded: once the group key is on, an administrator has no act on this page to stop paying ("the group does not pay" sets nothing; `groupkeyswitch` off and `groupkeyremove` exist). A requirement/UX matter; not changed here.
3. Generated artifact stale: `bio-plane/dist/bio-plane.bundled.mjs` (this module's source changed). Not touched (mechanics §14).

## J3 · COMPLETE

T36-33 complete on `job/T36/setup-page` (tranche merged after B2). R18 (two separate choices: the group pays, and "Keep our material away from AI"; no `op=assistantset`), R24 (the keep-away line to every signed-in member, the act to administrators, not-read stated), R30 (the security tools step, U125 (3)'s first form, `onOwnServers` and `DEEPER_CHECKS_PER_MONTH` injected per K2155). Tests: setup-page 81/0, instance-setup 108/0 before and after; format, architecture, coverage (30/30), ownership: 0 failures. 2,375 → 2,587 lines. Deferred: none. REPORT J2 names two other-module points and the stale plane bundle. Record: `build/jobs/T36/setup-page.md`.
