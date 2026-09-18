# DEBT — closed rows, moved by the archiver

**Written only by `node tools/ledger.mjs archive <ID>`**, which moves a closed row with no
declared residue (the one definition is `isClosedDebtRow` in `tools/owed.mjs`) out of
`docs/development/DEBT.md` VERBATIM and appends it here, and refuses the move unless every id
occurs exactly as often in the live ledger plus its archive after the move as before. Rows
arrive in the order they were archived. Find any id with `node tools/ledger.mjs find <ID>`.
The August roll (`DEBT-closed-2026-08.md`) is a separate closed file and is never appended to.

| ID | Sev | Found | Item | Status |
|---|---|---|---|---|
