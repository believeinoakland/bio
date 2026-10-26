/* The field names an op's owner declares (`DECLARED_OPS`, read through the harness's one collector, never hand-listed; K3268). */
import { collectOwnerRows } from "../interface-shell/harness.mjs";

export const DECLARED_FIELDS = (op) => {
  const row = collectOwnerRows()[op];
  const f = row && row.fields ? row.fields : { accepts: [], requires: [] };
  return [...(f.accepts || []), ...(f.requires || [])].flat();
};
