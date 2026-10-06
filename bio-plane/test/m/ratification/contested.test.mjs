/* ratification R22's contested arm and R34, the one examination registered with capture (DEC-97 (3); K1019, K1025), at
   the module's interface over retrieval's fixture world: the real record-core, membership, promotion, retrieval and
   capture, and contradiction's `candidatesFor` answered by the test (its R25, R26) so a candidate's state is set
   directly. A real contradiction, its tables created and empty, is the release suite's (`release.test.mjs`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world as retrievalWorld, V, sha, infoMd } from "../retrieval/fixture.mjs";
import { ratificationOf, CLASS_REASONS } from "../../../src/ratification/index.mjs";
import { captureOf } from "../../../src/capture/index.mjs";
import { contradictionOf } from "../../../src/contradiction/index.mjs";
import { canonicalJson } from "../../../src/record-grammar/index.mjs";

const OWNER = "o";
const WHO = V("ann");
const ACK = "Batch of public jobs-board postings, uniform in kind; bulk-release risks weighed.";
const MIT = "Sampled 12 of 40; checked sender domains and posting dates against the board.";
const DATASET = JSON.stringify({ v: 1 });
const HASH = `sha256:${sha(canonicalJson(JSON.parse(DATASET)))}`;
const FULL = [{ path: "data/dataset.json", text: DATASET }, { path: "snapshots/capture.html", text: "<html/>" }];
const SIDE = "CAND-SECRET-SIDE";

/* `w.standing`: bundle id -> the state of a candidate with a side on it; `w.read`: what the test's `candidatesFor`
   answers instead (a failed or cut-short read). Every call is kept in `w.asked`. */
function setup() {
  const w = retrievalWorld();
  contradictionOf(w.host).migrate();
  w.standing = new Map();
  w.read = null;
  w.asked = [];
  const contradiction = {
    candidatesFor: (a) => {
      w.asked.push(a);
      if (w.read) return w.read(a);
      const st = w.standing.get(a.on?.bundle);
      return { ok: true, candidates: st === a.state ? [{ candidate: SIDE, state: st, weight: "lead" }] : [], truncated: false };
    },
  };
  w.r = ratificationOf(w.host, { storage: w.st, record: w.record, membership: w.membership, promotion: w.promotion,
                                 retrieval: w.retrieval, contradiction, publication: {} });
  let k = 0;
  w.info = (id, { criticality = "supporting", files = FULL } = {}) => {
    const res = w.promotion.promote({ bundleId: id, base: null, snapKey: `c${++k}`, author: WHO,
      files: [{ path: "bundle.md", text: infoMd(id, { content_hash: HASH, criticality }) }, ...files],
      meta: { object_type: "information", criticality } });
    if (!res.ok) throw new Error(`fixture promote refused: ${JSON.stringify(res).slice(0, 300)}`);
  };
  w.release = async (ids) => w.r.release({ handle: (await w.retrieval.selectionCreate({ owner: OWNER, viewer: WHO, ids })).handle,
                                           acknowledgment: ACK, mitigation: MIT, viewer: WHO, owner: OWNER, author: WHO });
  w.head = (id) => w.record.head(id)?.bundleSha ?? null;
  return w;
}

test("R22, R27: a batch holding a document a standing contradiction touches (open, explained_not_shown or taken_up) is refused CONTESTED_IN_BATCH (C-58.4) whole, offenders sorted, nothing released; resolved or dismissed, the same batch releases", async () => {
  for (const state of ["open", "explained_not_shown", "taken_up"]) {
    const w = setup();
    for (const id of ["INFO-2026-0703", "INFO-2026-0701", "INFO-2026-0702"]) w.info(id);
    w.standing.set("INFO-2026-0703", state).set("INFO-2026-0701", state);
    const before = ["INFO-2026-0701", "INFO-2026-0702", "INFO-2026-0703"].map(w.head);
    const r = await w.release(["INFO-2026-0703", "INFO-2026-0701", "INFO-2026-0702"]);
    assert.equal(r.ok, false, state);
    assert.equal(r.reason, "CONTESTED_IN_BATCH");
    assert.deepEqual({ code: r.code, check: r.check }, { code: "CONTESTED_IN_BATCH", check: "C-58.4" });
    assert.deepEqual(r.offenders, ["INFO-2026-0701", "INFO-2026-0703"]);
    assert.equal(r.detail, CLASS_REASONS.CONTESTED_IN_BATCH);
    assert.deepEqual(["INFO-2026-0701", "INFO-2026-0702", "INFO-2026-0703"].map(w.head), before, "every head unchanged");
    /* negative control: the contradiction resolved (or dismissed) touches nothing standing, and the batch releases */
    w.standing.set("INFO-2026-0703", "resolved").set("INFO-2026-0701", "dismissed");
    const ok = await w.release(["INFO-2026-0703", "INFO-2026-0701", "INFO-2026-0702"]);
    assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 200));
    assert.deepEqual(ok.released, ["INFO-2026-0701", "INFO-2026-0702", "INFO-2026-0703"]);
  }
});

test("R22: the contested arm reads as the plane, so a side the releasing member may not see still bars the batch, and nothing of any side is named", async () => {
  const w = setup();
  w.info("INFO-2026-0711");
  w.standing.set("INFO-2026-0711", "open");
  const r = await w.release(["INFO-2026-0711"]);
  assert.equal(r.reason, "CONTESTED_IN_BATCH");
  assert.ok(w.asked.length > 0);
  for (const a of w.asked) {
    assert.deepEqual(a.on, { bundle: "INFO-2026-0711" });
    assert.equal(a.viewer, "class:daemon", "the plane's viewer, never the member's");
  }
  assert.ok(!JSON.stringify(r).includes(SIDE), "no candidate or side is answered");
});

test("R22: a crucial and contested document is counted crucial; contested is asked after crucial and before the entry requirements", async () => {
  const w = setup();
  w.info("INFO-2026-0721", { criticality: "crucial" });
  w.standing.set("INFO-2026-0721", "open");
  const c = await w.release(["INFO-2026-0721"]);
  assert.deepEqual([c.reason, c.offenders], ["CRUCIAL_IN_BATCH", ["INFO-2026-0721"]]);
  w.info("INFO-2026-0722");
  w.standing.set("INFO-2026-0722", "open");
  w.info("INFO-2026-0723", { files: [] });
  const e = await w.release(["INFO-2026-0722", "INFO-2026-0723"]);
  assert.deepEqual([e.reason, e.offenders], ["CONTESTED_IN_BATCH", ["INFO-2026-0722"]], "contested before ENTRY_REQUIREMENTS");
  w.standing.delete("INFO-2026-0722");
  const n = await w.release(["INFO-2026-0722", "INFO-2026-0723"]);
  assert.equal(n.reason, "ENTRY_REQUIREMENTS", "negative control: uncontested, the entry requirements answer");
});

test("R22: a contradiction read that fails, throws or is cut short with none found counts the document contested (fail closed)", async () => {
  for (const read of [() => ({ ok: true, candidates: [], truncated: false, undetermined: true }),
                      () => { throw new Error("no table"); },
                      () => ({ ok: true, candidates: [], truncated: true }),
                      () => ({ ok: false, reason: "CANDIDATES_NO_SUBJECT" })]) {
    const w = setup();
    w.info("INFO-2026-0731");
    w.read = read;
    assert.equal((await w.release(["INFO-2026-0731"])).reason, "CONTESTED_IN_BATCH");
    w.read = null;
    assert.equal((await w.release(["INFO-2026-0731"])).ok, true, "negative control: a clean read releases");
  }
});

test("R34: capture's held list reads R22's own examination: a contested document eligible false with its class and reason, a crucial one with its class, a clean one eligible true; the release refuses an ineligible one under the same class", async () => {
  const w = setup();
  w.info("INFO-2026-0741");
  w.info("INFO-2026-0742", { criticality: "crucial" });
  w.info("INFO-2026-0743");
  w.standing.set("INFO-2026-0741", "open");
  captureOf(w.host).migrate();   /* as the plane's boot migrates it */
  const held = await captureOf(w.host).heldCaptures({ viewer: "class:admin" });
  assert.equal(held.ok, true, JSON.stringify(held).slice(0, 200));
  const by = Object.fromEntries(held.held.map((x) => [x.bundle_id, x]));
  const elig = (id) => ({ eligible: by[id].eligible, class: by[id].class, reason: by[id].reason });
  assert.deepEqual(elig("INFO-2026-0741"),
                   { eligible: false, class: "CONTESTED_IN_BATCH", reason: CLASS_REASONS.CONTESTED_IN_BATCH });
  assert.deepEqual(elig("INFO-2026-0742"),
                   { eligible: false, class: "CRUCIAL_IN_BATCH", reason: CLASS_REASONS.CRUCIAL_IN_BATCH });
  assert.equal(by["INFO-2026-0743"].eligible, true);
  for (const id of ["INFO-2026-0741", "INFO-2026-0742"])
    assert.equal((await w.release([id])).reason, by[id].class, `${id}: one examination, one class`);
  assert.equal((await w.release(["INFO-2026-0743"])).ok, true);
  /* the examination's answers, read directly: each class R22 counts */
  assert.deepEqual(w.r.examine("INFO-2026-0743"), { eligible: false, class: "ILLEGAL_TRANSITION",
                                                     reason: CLASS_REASONS.ILLEGAL_TRANSITION }, "released, it is verified now");
  assert.deepEqual(w.r.examine("INFO-2026-9999"), { eligible: false, class: "NOT_INFORMATION",
                                                     reason: CLASS_REASONS.NOT_INFORMATION });
});

test("R34: the examination is registered once, at start, in capture's batch-examination slot; a second registration is refused by capture", () => {
  const w = setup();
  const again = captureOf(w.host).registerReader("batch-examination", "someone-else", () => ({ eligible: true }));
  assert.equal(again.ok, false);
  assert.equal(ratificationOf(w.host), w.r, "one instance per host, so one registration");
});
