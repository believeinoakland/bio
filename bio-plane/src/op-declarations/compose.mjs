/* op-declarations R3 (T49; K3298, K3339): THE COMPOSITION OF `NEEDS`. The table is two parts that share no op: the
   hand-written rows, `op-capabilities.needsRows()` (its R1), and each family op's row from its kind (R19). A later key
   wins in a spread, so a family row for an op the hand-written part holds would silently replace its row: it is refused
   instead, by name. The result is a fresh table (the hand-written part is frozen) for the aliases (R21) to be applied
   over, and for `index.mjs` to freeze. Data in, data out: nothing here reads a request, a store or the environment (R7). */
export function composeNeeds(handRows, familyRows) {
  const composed = { ...handRows };
  for (const [op, row] of Object.entries(familyRows)) {
    if (Object.hasOwn(handRows, op)) throw new TypeError(`op-declarations: ${op}: a family row and a hand-written row (R3)`);
    composed[op] = row;
  }
  return composed;
}
