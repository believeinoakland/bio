# M0-140 — THE COORD WRITE, prepared and NOT YET PERFORMED

This branch is a HANDOFF, not code. It holds the one act M0-140 could not perform itself, with the
reason it could not, so that the act does not depend on the worker session still being alive.

`DEBT-archive-append.md` is the body to append to `docs/archive/ledgers/DEBT-closed.md` on `coord`:
the live `docs/development/DEBT.md` VERBATIM, with the three closing dispositions written onto
D-313, D-391 and D-388, under a header saying what it is and why it moved whole.

## THE COMMAND, exactly

    node tools/coord.mjs write \
      -m "M0-140: retire the DEBT construct — D-313, D-391, D-388 closed; DEBT.md archived whole" \
      --append docs/archive/ledgers/DEBT-closed.md <path to DEBT-archive-append.md> \
      --delete docs/development/DEBT.md

Run it WITHOUT `--dry-run`. It was dry-run verified on 2026-09-24 against coord `a71ad8ce`:
`would push e9144d4c ... changing docs/archive/ledgers/DEBT-closed.md, docs/development/DEBT.md;
ledger checks passed`. Intents re-apply to the fresh tip on every attempt, so a moved tip is fine.

## IT MUST RUN **AFTER** `land/worker/M0-140` IS ON `origin/main`, NEVER BEFORE

This is not a preference; it is measured, and it is M0-140's own negative control (recorded on
`bio-plane/test/coord.test.mjs`). While `main` still carries the OLD readers, an absent `DEBT.md`
makes:

  * `plancheck` FAIL — `MISSING — docs/development/DEBT.md does not exist.` — for every lane; and
  * `coord.mjs`' LC-debt-token FAIL — `could not be read — an unreadable ledger is not an empty
    one` — which REFUSES EVERY COORD WRITE, by anyone, until the branch lands.

The branch retires both readers. Land it, then run this. The `--delete` intent this command uses
is itself new on that branch, so the command cannot even be run from an un-updated tree.

## WHY IT IS STILL OWED — do not skip it

Until it runs, `node tools/ledger.mjs find D-313` (and D-391, D-388) answers NOT FOUND: the rows
sit in a file nothing reads any more. That is the record claiming less than it can support, which
is the half of M0-140's accepts-when the branch alone does not satisfy. After it runs, all three
resolve from `docs/archive/ledgers/DEBT-closed.md`, closed, with their evidence.

Prepared by WORKER M0-140 (CONDUCT #20), 2026-09-24. Branch tip of the landing: d7809ed02.
