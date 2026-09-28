/* ratification R8, R9: what this module registers at creation, driven through the modules it registers with. The
   case-document catalogue is the one promotion's `runCaseGate` runs (R8, promotion R47); C-2.8's case-member arm is a
   promotion check that refuses a promotion of malformed case-member bytes, replays exempt, and an audit check the
   record's audit sweep counts (R9, promotion R39, record-core R59). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, inqMd, V } from "./fixture.mjs";
import { checkCaseDocument } from "../../../src/ratification/index.mjs";

const Q = "INQ-2026-0001-member";
/* bytes that claim to be a case member (a frozen published_strength pair) and carry nothing else a member must */
const claiming = (edition = 0) => inqMd(Q, { extra: [`edition: ${edition}`, "published_strength:",
  "  - axis: capture", "    state: graded", "    grade: B", "  - axis: connection", "    state: unrated", "    grade: null"] });

test("R8: promotion's case gate runs this module's catalogue, and a second catalogue is refused", () => {
  const w = world();
  const fm = { format: "bio-case-document/4", case_id: "CASE-2026-0001", case_edition: 1 };
  const g = w.promotion.runCaseGate({ caseId: "CASE-2026-0001", edition: 1, fm, body: null, memberBasis: null, priorCase: null });
  assert.equal(g.ok, false);
  assert.deepEqual(g.findings.map((x) => x.check),
    checkCaseDocument(fm, { caseId: "CASE-2026-0001", edition: 1 }).filter((x) => x.severity === "error").map((x) => x.check));
  assert.ok(g.findings.some((x) => x.check === "C-41.4"));
  const again = w.promotion.registerCaseCatalogue("someone-else", () => []);
  assert.equal(again.ok, false);
  assert.match(again.detail, /already registered by ratification/);
});

test("R9: a promotion of bytes claiming to be a case member that do not carry what one must is refused CASE_MEMBER_REFUSED, naming each C-2.8 finding; nothing is written", () => {
  const w = world();
  const res = w.promotion.promote({ bundleId: Q, base: null, snapKey: "k1", author: V("alice"),
    files: [{ path: "bundle.md", text: claiming() }], meta: { object_type: "inquiry" } });
  assert.equal(res.reason, "CASE_MEMBER_REFUSED");
  assert.ok(res.findings.length >= 3 && res.findings.every((x) => x.check === "C-2.8"), JSON.stringify(res.findings));
  assert.ok(res.findings.some((x) => /integer edition/.test(x.detail)));
  assert.equal(w.record.head(Q), null);
});

test("R9: ordinary working bytes, and a replay of the record's own past, are not asked", () => {
  const w = world();
  assert.equal(w.inquiry(Q).ok, true);
  const replay = w.promotion.promote({ bundleId: "INQ-2026-0002-old", base: null, snapKey: "k9", author: V("alice"),
    replay: true, files: [{ path: "bundle.md", text: claiming().replaceAll(Q, "INQ-2026-0002-old") }],
    meta: { object_type: "inquiry" } });
  assert.equal(replay.reason === "CASE_MEMBER_REFUSED", false, JSON.stringify(replay).slice(0, 300));
});

test("R9: the audit sweep counts the case-member arm over a held bundle, and each registration is made once", async () => {
  const w = world();
  const id = "INQ-2026-0003-held";
  w.promotion.promote({ bundleId: id, base: null, snapKey: "k1", author: V("alice"), replay: true,
    files: [{ path: "bundle.md", text: claiming().replaceAll(Q, id) }], meta: { object_type: "inquiry" } });
  assert.ok(w.record.head(id), "held through the replay");
  const pass = await w.record.auditPass({});
  assert.equal(pass.tally["C-2.8"], 3, "the edition, the completeness block and the exclusion field");
  const control = world();
  control.promotion.promote({ bundleId: id, base: null, snapKey: "k1", author: V("alice"), replay: true,
    files: [{ path: "bundle.md", text: inqMd(id) }], meta: { object_type: "inquiry" } });
  assert.equal((await control.record.auditPass({})).tally["C-2.8"], undefined, "working bytes draw none");
  assert.equal(w.promotion.registerStep("ratification", { check: () => null }).ok, false);
  assert.equal(w.record.registerAuditCheck("ratification", () => []).ok, false);
});
