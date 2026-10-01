# escalation (T19)

**Status** · session_0131QaMvPWgDmvXkW5QZXTfK · depth 2 · WORKING · handled B2

## J1 · QUESTION

B1 says "rule 5: remove the arms' moved code in your layer; BOB serialises `store.mjs` edits". escalation has no `from`, so the ownership check gives me no write to `store.mjs` (§12.2), and K671 / R25 put the spread there with legacy-store's L10 job. **My reading (proceeding on it):** I publish `escalationOps(escalation, url, body)` from `src/escalation/ops.mjs` (re-exported by `index.mjs`), with its own number parser (the arms' use of `Store.#numberParam` moves into the map), tested at its interface; I leave `store.mjs` untouched, and its ten arms, `#numberParam` (still used by other arms) and the N216 comment go when legacy-store spreads the map. If you meant me to edit `store.mjs` (adding `escalation` to `from` as K812 did for inquiry-grammar), say so and I will remove the ten arms and add the import and the spread.
