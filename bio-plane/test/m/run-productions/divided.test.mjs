/* run-productions R26 (T51; N1070; K3264; `inquiry` R64; `basis-versions` R52): a suggestion on a question in the state
   `divided` answers inquiry's refusal `DIVIDED_CANNOT_RESTRUCTURE`, relayed unchanged as `basis-versions.appendVersion`
   answers it, and writes no version (R7: only R2's memo of the refusal). The question's document stays byte-identical. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, Q, DOC, RUN, ALICE } from "./fixture.mjs";

const LEG = { target: DOC, role: "supports", ground: "paper" };
const PART = [{ ground: "paper", statement: "the paper trail of the approval" }];

const bundleSha = (w) => [...w.st.sql.exec(`SELECT bundle_sha FROM bundles WHERE bundle_id=?`, Q)][0].bundle_sha;
const liveText = (w) => [...w.st.sql.exec(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, Q)][0].content;
const versionRows = (w) => [...w.st.sql.exec(`SELECT COUNT(*) AS n FROM inquiry_basis_versions`)][0].n;

/* The real `inquiry` and `basis-versions` over the fixture's record, so the refusal is the one the module really gives;
   the fixture's stand-in promotion (its R28 is not in this fixture's tables) for the control, which needs only that
   the suggestion reaches the write. */
function setup({ divided = false, real = true } = {}) {
  const w = world(real ? { realInquiry: true, realBasisVersions: true } : {});
  w.inquiry(Q);
  w.doc(DOC);
  w.run(RUN);
  if (divided) w.st.sql.exec(`UPDATE bundles SET current_state='divided' WHERE bundle_id=?`, Q);
  return w;
}

test("R26: a suggestion on a divided question is refused with inquiry's DIVIDED_CANNOT_RESTRUCTURE, relayed unchanged, and the question's document is byte-identical", () => {
  const w = setup({ divided: true });
  const sha = bundleSha(w), text = liveText(w), versions = versionRows(w);
  const r = w.suggest({ legs: [LEG], grounds: PART });
  assert.deepEqual([r.ok, r.reason, r.code, r.from, r.target], [false, "DIVIDED_CANNOT_RESTRUCTURE", "DIVIDED_CANNOT_RESTRUCTURE", "divided", Q],
    JSON.stringify(r).slice(0, 300));
  assert.equal(r.check, undefined, "the code has no catalogue row, so none is minted here");
  assert.equal(r.translation, undefined, "no translation is minted here either");
  assert.deepEqual([r.evaluated, r.wrote], [true, false]);
  assert.equal(bundleSha(w), sha, "bundle_sha unchanged");
  assert.equal(liveText(w), text, "the document's bytes unchanged");
  assert.equal(versionRows(w), versions, "no version row written");
});

test("R26: the refusal is stored for R2 as the one memo of it, and a verbatim resubmit answers it unchanged", () => {
  const w = setup({ divided: true });
  const first = w.suggest({ legs: [LEG], grounds: PART });
  const again = w.suggest({ legs: [LEG], grounds: PART });
  assert.deepEqual([again.repeated, again.evaluated, again.code], [true, false, "DIVIDED_CANNOT_RESTRUCTURE"]);
  const { repeated, evaluated, wrote, repeats, first_refused_at, ...stored } = again;
  const { repeated: r0, evaluated: e0, wrote: w0, ...firstStored } = first;
  assert.deepEqual(stored, firstStored, "the stored refusal, unchanged");
});

test("R26 control: the same suggestion on an open question reaches the write and lands as R4 says", () => {
  const w = setup({ divided: false, real: false });
  const r = w.suggest({ legs: [LEG], grounds: PART });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(r.wrote, true);
  assert.equal(w.basisVersions.appended.length, 1, "one version appended");
  assert.equal(w.basisVersions.appended[0].target, Q);
});
