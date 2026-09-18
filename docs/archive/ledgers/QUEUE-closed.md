# QUEUE — closed rows, moved by the archiver

**Written only by `node tools/ledger.mjs archive <ID>`**, which moves a closed row (`done` or
`superseded`) out of `docs/development/QUEUE.md` VERBATIM and appends it here, and refuses the
move unless every id occurs exactly as often in the live ledger plus its archive after the move
as before. Rows arrive in the order they were archived. Find any id, live or archived, with
`node tools/ledger.mjs find <ID>`; rulings in these rows stay indexed by `tools/decided.mjs`.
The August roll (`QUEUE-2026-08.md`) is a separate closed file and is never appended to.

