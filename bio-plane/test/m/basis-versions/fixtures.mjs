/* basis-versions' published fixtures (fix round 10; K4990, K4993, K4995, K5044): the answers this module's real code gives, made when a
 * test runs and never stored. A user takes the answer from here instead of hand-building basis-versions' answer. Each is checked by
 * `fixtures.test.mjs`, which calls it and compares the real answer. */
import { world, block, V } from "./fixture.mjs";

const DOCS = ["INFO-2026-0001-a", "INFO-2026-0002-b"];
const WORDS = "The council approved the transfer on the third reading.";

/** `concludeAct`: the real `basisVersions.conclude(args)` answer over a question of two cited passages, concluded by a member with no
 *  project (R19) on her own reading (R51). `kind` is `concluded` (`{ok: true, target, from: "open", to: "concluded", relationship:
 *  "no_project", project: null, own_reading: true, version, author, ...}`), `no_conclusion` (R16: `{ok: false, reason: "NO_CONCLUSION", code,
 *  check, translation, detail}`, nothing said to conclude) or `bad_reading` (R51: `{ok: false, reason: "BAD_READING", code, translation,
 *  detail}`, her words too short). `target` is the question's id in the answer. */
export function concludeAct({ kind = "concluded", target = "INQ-2026-0001-q" } = {}) {
  const w = world();
  for (const d of DOCS) w.doc(d);
  w.member("alice");
  const basis = DOCS.map((t) => ({ target: t, role: "supports" }));
  const made = w.inquiry(target, block({ basis, refs: DOCS }));
  if (!made.ok) throw new Error(`concludeAct: the fixture question was refused: ${JSON.stringify(made).slice(0, 300)}`);
  const act = (o) => w.bv.conclude({ target, author: V("alice"), viewer: V("alice"), identity: V("alice"), falsifier: "the minutes say otherwise", ...o });
  if (kind === "concluded") return act({ reading: WORDS });
  if (kind === "no_conclusion") return act({});
  if (kind === "bad_reading") return act({ reading: "too short" });
  throw new Error(`concludeAct: no kind "${kind}"`);
}
