/* The fixtures money publishes for its users (K4990, K4993, K5044): each is made by money's real code when it is called,
 * never stored, and each is checked by `fixtures.test.mjs`. Named with the requirement each answer carries. */
import { seeded, ANN } from "./fixture.mjs";

/** `money.readFact` for an id an empty money record does not hold: `{ok:true, found:false, fact_id, fact:null}` (R8). */
export function readFactNotFound() {
  const s = seeded();
  return s.m.readFact({ factId: "MNY-2026-0000000000000000", viewer: ANN });
}

/** `money.readFact({factId})` for a fact recorded over the seeded world (fields of the fact overridden by `over`):
 *  `{ok:true, found:true, fact}`, the fact as money answers it (R8). */
export function readFactOf(over = {}) {
  const s = seeded();
  return s.m.readFact({ factId: s.rec(over), viewer: ANN });
}

/** `money.checkConstant` for a value money can read (R7): `{ok:true, role}`. */
export function checkConstantOk(role = "period", value = "2026-01-01/2026-12-31") {
  return seeded().m.checkConstant({ role, value });
}

/** `money.checkConstant` for a value money cannot read (R7): money's own refusal beside the role, `MONEY_BAD_PERIOD` for the
 *  period `"2026"`. */
export function checkConstantRefused(role = "period", value = "2026") {
  return seeded().m.checkConstant({ role, value });
}

/** `money.factBySource` for a source row a live fact was written from (R7): `{ok:true, found:true, fact_id}`; `fact_id` is
 *  the fact's. */
export function factBySourceFound() {
  const s = seeded();
  s.bindings.set("BIND-1", { adopted: true, table: "T-1", roles: {}, capture_sha: s.cap });
  s.rec({ source: { table: "T-1", row: "1", binding: "BIND-1" } });
  return s.m.factBySource({ table: "T-1", row: "1", binding: "BIND-1" });
}

/** `money.factBySource` for a source row no live fact was written from (R7): `{ok:true, found:false}`. */
export function factBySourceNone() {
  return seeded().m.factBySource({ table: "T-1", row: "1", binding: "BIND-1" });
}
