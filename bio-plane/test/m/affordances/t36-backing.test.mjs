/* affordances: R19's backing for every op op-grades' `t36.mjs` grades `reasoned` (its R23–R25; K2092, K2130), each driven
   at its owning module's own interface over that module's own fixture, as t35-backing.test.mjs drives T35's: called
   well-formed but without its authored reason, it is refused with its owner's code, which is in JUSTIFICATION_REFUSALS;
   called with it, it is accepted. The last test holds the list driven here to the ops `t36.mjs` grades `reasoned`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { JUSTIFICATION_REFUSALS, RUNGS } from "../../../src/op-grades/index.mjs";
import { T36_RUNGS } from "../../../src/op-grades/t36.mjs";

/* Each op driven below, by its owner; the last test holds this list to t36.mjs. */
const DRIVEN = ["standardinforcethrough", "standardinforcethroughwithdraw", "spotcheckvisit", "releasescanhold", "aikeepaway"];

/* The backing of one op: graded `reasoned`; without its reason refused with `code`, in the family; with it accepted. */
function backed(op, code, refused, accepted) {
  assert.ok(DRIVEN.includes(op), op);
  assert.equal(RUNGS[op], "reasoned", op);
  const got = refused?.code ?? refused?.reason;
  assert.notEqual(refused?.ok, true, `${op}: accepted without its reason: ${JSON.stringify(refused).slice(0, 300)}`);
  assert.equal(got, code, `${op}: ${JSON.stringify(refused).slice(0, 300)}`);
  assert.ok(JUSTIFICATION_REFUSALS.includes(got), `${op}: ${got} is not in JUSTIFICATION_REFUSALS`);
  assert.equal(accepted?.ok, true, `${op}: refused with its reason: ${JSON.stringify(accepted).slice(0, 300)}`);
}

/* ---- standards (R50) ---- */
import * as stFix from "../standards/fixture.mjs";

test("R19: standards' standardinforcethrough and standardinforcethroughwithdraw, graded `reasoned` (op-grades R23), are "
   + "refused without their reason with STANDARD_NO_REASON, in JUSTIFICATION_REFUSALS, and accepted with it", () => {
  const w = stFix.seeded();
  const B = stFix.V("bob"), REASON = stFix.REASON;
  const PAGE0 = { kind: "pdf-page", page: 0 };
  const src = w.passage("portal", { address: "https://ex.org/portal", retrieved: "2026-09-01T18:00:00Z" });
  const standard = w.declare({ period: { from: "2020-01-01", to: null } }).id;
  const record = (x) => w.s.inForceThroughRecord({ standard, through: "2026-09-01", source: { captureSha: src.capSha, extent: PAGE0 },
                                                   author: B, viewer: B, ...x });
  const rec = record({ reason: REASON });
  backed("standardinforcethrough", "STANDARD_NO_REASON", record({ reason: "  " }), rec);
  const withdraw = (x) => w.s.inForceThroughWithdraw({ record: rec.record.id, author: B, ...x });
  backed("standardinforcethroughwithdraw", "STANDARD_NO_REASON", withdraw({ reason: "" }),
         withdraw({ reason: "The portal page was the draft." }));
});

/* ---- calculations (R38) ---- */
import * as caFix from "../calculations/fixture.mjs";

test("R19: calculations' spotcheckvisit, graded `reasoned` (op-grades R23), whose reason is the visitor's own testimony "
   + "(as testify's words are), is refused without it with NOT_TESTIMONY, in JUSTIFICATION_REFUSALS, and accepted with it", async () => {
  const w = caFix.seeded();
  const t = await w.table(`site\n${Array.from({ length: 20 }, (_, i) => `bench-${i}`).join("\n")}\n`, [{ name: "site", type: "string" }]);
  const d = w.c.draw({ set: t.sha, n: 6, seed: "spot", question: "Is the bench at this site repaired and usable?", by: caFix.V("bob") });
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  const words = w.prov.testify({ words: "At the site I looked at the bench myself.", observedAt: "2026-10-01", title: "visit",
                                 author: caFix.V("bob") });
  assert.equal(words.ok, true, JSON.stringify(words).slice(0, 300));
  const visit = (x) => w.c.recordVisit({ draw: d.draw, item: d.sample[0], finding: "yes", by: caFix.V("bob"), ...x });
  backed("spotcheckvisit", "NOT_TESTIMONY", visit({ testimony: null }), visit({ testimony: words.capture_sha }));
});

/* ---- file-safety (R17) ---- */
import * as fsFix from "../file-safety/fixture.mjs";

test("R19: file-safety's releasescanhold, graded `reasoned` (op-grades R24), is refused without its reason with "
   + "HOLD_NO_REASON, in JUSTIFICATION_REFUSALS, and accepted with it", async () => {
  const held = fsFix.sha(fsFix.pdf(false, "h"));
  const w = fsFix.world({ scan: { clamav: (s) => (s === held ? { result: "found", findings: ["Doc.Dropper.Agent-1"] } : { result: "clean" }) } });
  const s = await w.capture(fsFix.pdf(false, "h"));
  await w.fs.scanBatch({});
  const release = (x) => w.fs.releaseScanHold({ captureSha: s, by: "m1", ...x });
  backed("releasescanhold", "HOLD_NO_REASON", release({ reason: " " }), release({ reason: "read it; a false match" }));
});

/* ---- credentials (R51) ---- */
import * as crFix from "../credentials/fixture.mjs";

test("R19: credentials' aikeepaway, graded `reasoned` (op-grades R25), is refused when turned on without its reason with "
   + "AI_KEEP_AWAY_NO_REASON (credentials R51), in JUSTIFICATION_REFUSALS (op-grades, T37-26), and accepted with it", async () => {
  const w = await crFix.world().group("ann");
  const set = (x) => w.c.aiKeepAwaySet({ on: true, by: "admin", ...x });
  backed("aikeepaway", "AI_KEEP_AWAY_NO_REASON", set({ reason: "" }), set({ reason: "We hold a source's material under a promise." }));
});

/* ---- the list ---- */
test("R19: every op op-grades' t36.mjs grades `reasoned` is driven here", () => {
  const graded = Object.keys(T36_RUNGS).filter((op) => T36_RUNGS[op] === "reasoned").sort();
  assert.deepEqual([...new Set(DRIVEN)].sort(), graded);
});
