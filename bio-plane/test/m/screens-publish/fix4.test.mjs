/* screens-publish, T51 fix round 4 (K4429), over a scripted plane: C40. The seam tests that need a provider's own instance are in
 * seam4.test.mjs. A sentence is asserted by its key (R24); every request is compared with its owner's declaration (interface-shell R104). */
import { registerDeclared } from "../../declared-ops.mjs";
import { registerDeclaredOps } from "../../../src/op-declarations/index.mjs";
await registerDeclared(new URL("../../../../", import.meta.url).pathname, registerDeclaredOps);
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, drew, press, ok, PREFLIGHT, F1, P, DR, rawKeys, main } from "./fixtures.mjs";

const CER = `/app/ceremony/${P}/${DR}`;
const B64 = "b".repeat(64);
const ROW = (o = {}) => ({ capture: B64, by: "dev", findings: [F1], timestamp_at: null, co_archive: null, missing: ["timestamp", "co_archive"], late: false, timestamp_late: false, late_words: null, ...o });
const STEP3 = (o = {}) => ({ step: 3, tensions: { candidates: [], count: 0 }, not_co_attested: [], self_attested: [], ...o });
const HELD_BACK = gateRefusal().CO_ATTESTATION_UNACKNOWLEDGED;
const pre = (row) => PREFLIGHT({ steps: [...PREFLIGHT().steps.slice(0, 5), STEP3({ not_co_attested: [row] }), ...PREFLIGHT().steps.slice(5)], ready: false, first: HELD_BACK, blockers: [] });

test("R74 R51 C40 after reattest the document's sentence is read again: it says 'neither' only while both proofs are missing, and no raw key is drawn", async () => {
  let again = false;
  const p = await open(CER, { plane: { publishpreflight: () => ok(pre(again ? ROW({ timestamp_at: "2026-10-20T10:00:00Z", missing: ["co_archive"] }) : ROW())),
    reattest: () => { again = true; return ok({ ok: true, captureSha: B64 }); }, captureaccounts: ok({ captureSha: B64, actors: [], accounts: [] }) } });
  assert.ok(drew(p, "screen.ceremony.conf.intro2", { finding: F1 }), "before: neither proof, so the sentence says so");
  await press(p, "reattest", { reason: "because" });
  assert.ok(drew(p, "screen.ceremony.conf.row.missing.co_archive"), "the proof still missing");
  assert.ok(!drew(p, "screen.ceremony.conf.intro2", { finding: F1 }), "the sentence is not left saying neither");
  assert.deepEqual(rawKeys(main(p)).filter((k) => k.startsWith("screen.ceremony.conf")), [], "no key of the row drawn raw");
});

/* ---------- C14: each screen's read set (R79): the frame's `bootstrap` and `queue` once, and no read of the screen's own repeated ---------- */
import { C } from "./fixtures.mjs";
const readsOf = (p) => { const c = {}; for (const r of p.requests) c[r.op] = (c[r.op] || 0) + 1; return c; };
for (const [screen, path, own] of [
  ["case-editor", `/app/case-editor/${P}/${DR}`, ["image", "casedrafts", "reviewcopy", "casecheck", "casedocument", "whatchangeddrafts", "accountdrafts", "casedetails"]],
  ["review-copy", `/app/review-copy/${P}/${DR}`, ["image", "casedrafts", "reviewcopy"]],
  ["ceremony", `/app/ceremony/${P}/${DR}`, ["image", "reviewcopy", "casedrafts", "publishpreflight", "publishtensions", "publishschedule", "casedetails", "casedocument", "photomarks"]],
  ["published", `/app/published/${C}`, ["publishedcase", "casedetailspublic"]],
]) {
  test(`R79 C14 ${screen} loads with one bootstrap, one queue and each of its own reads once: no read repeated`, async () => {
    const p = await open(path);
    const c = readsOf(p);
    if (screen !== "published") assert.deepEqual([c.bootstrap, c.queue], [1, 1], "the frame's reads, once");
    else assert.equal(c.bootstrap, 1);
    for (const op of own) assert.ok((c[op] || 0) <= 1, `${op} read ${c[op]} times`);
    assert.ok(!c.casecheck || !c.queuelist, "the list of queue items is the Queue screen's alone");
  });
}

/* ---------- C49: the chosen draft heads the page on the editor, the review copy and the ceremony (R73) ---------- */
import { COPY, C as CASE, word, day, fill, text } from "./fixtures.mjs";
const OLD = "RVD-2026-0000";
const TWO = { kind: "review-drafts", project: P, drafts: [
  { draft_id: OLD, case: null, created_by: "dev", updated_by: "dev", created_at: "2026-09-18T10:00:00Z" },
  { draft_id: DR, case: null, created_by: "dev", updated_by: "dev", created_at: "2026-10-12T10:00:00Z" }] };
const copyOf = (req) => { const d = req.query.draft; return ok(COPY({ draft: d, case: { case_id: null }, title: "T-" + d, authored: { scope: d === OLD ? "A second scope" : "The newest scope" } })); };
for (const screen of ["case-editor", "review-copy", "ceremony"]) {
  test(`R73 C49 ${screen}: pressing the chooser for the earlier draft heads the page with that draft's scope and day, and its own title; the newest keeps its own (control)`, async () => {
    const p = await open(`/app/${screen}/${P}`, { plane: { casedrafts: ok(TWO), reviewcopy: copyOf } });
    const head = () => (main(p).querySelector("[data-draft-head]") || { textContent: "" }).textContent.replace(/\s+/g, " ").trim();
    assert.ok(head().includes("The newest scope") && head().includes(day("2026-10-12")), "the newest at first");
    fill(p, { [`drafts-${screen}`]: OLD });
    await press(p, "casedrafts");
    assert.ok(head().includes("A second scope") && head().includes(day("2026-09-18")), "the chosen draft's scope and day");
    assert.ok(!head().includes("The newest scope"));
    assert.equal(main(p).querySelector("h1").textContent.trim(), "T-" + OLD, "and its own heading");
  });
}
test("R73 C49 control: a project with one draft draws no draft head", async () => {
  const p = await open(`/app/case-editor/${P}`, { plane: { casedrafts: ok({ ...TWO, drafts: TWO.drafts.slice(1) }), reviewcopy: copyOf } });
  assert.equal(main(p).querySelector("[data-draft-head]"), null);
});

/* ---------- C51: a key file loaded at the Sign step is a key the page has; the signed strings are told apart (R72, R78) ---------- */
import { until, tick, signDialog } from "./fixtures.mjs";
const KEYFILE = ["BIOKEY-RAW1", "bio-ratify", Buffer.from(new Uint8Array(32).fill(7)).toString("base64")].join(".");
test("R72 R78 C51 once a key file is chosen the page no longer says this browser holds no key; its signed strings are listed apart from their labels; the progress line is a word, never its key", async () => {
  const p = await open(CER);
  tick(p, "ce-tie", "yes");
  await press(p, "publish", { reason: "because" });
  await until(p, () => p.doc.getElementById("ce-keyfile"));
  assert.ok(p.doc.querySelector("[data-nokey]"), "before: no key held, none loaded");
  p.doc.getElementById("ce-keyfile").files = [{ name: "bio-signing-key.txt", size: KEYFILE.length, text: async () => KEYFILE }];
  p.fire(p.doc.getElementById("ce-keyfile"), "input");
  await p.clock.tick(600);
  await p.settle();
  assert.equal(p.doc.querySelector("[data-nokey]"), null, "after: a key file is loaded, so the page does not say it holds none");
  await press(p, "caseratify", { reason: "because" });
  await until(p, () => signDialog(p));
  const labels = [...signDialog(p).querySelectorAll("li b")].map((b) => b.textContent);
  assert.ok(labels.length > 1 && labels.every((l) => /:\s*$/.test(l)), "each label ends in a separator before the string it labels");
  assert.deepEqual(rawKeys(main(p)).filter((k) => k.includes("registering")), [], "no progress key drawn raw");
});

/* ---------- C48 (R80): what the record states, with the case it belongs to (case-authoring R83 `editions.case`) ---------- */
import { DOCUMENT } from "./fixtures.mjs";
test("R80 C48 a draft naming no case whose pre-flight refused first still reads its prepared edition by `editions.case`: 'Edition n is prepared', no reasons beside it, Sign offered", async () => {
  const refusedFirst = PREFLIGHT({ steps: [{ stated: "not reached: op=publish refuses first (NO_STATEMENT)" }, ...PREFLIGHT().steps.slice(1)], ready: false, first: HELD_BACK, blockers: [],
    editions: { prepared: 2, published: null, case: CASE } });
  const p = await open(CER, { plane: { reviewcopy: ok(COPY({ case: { case_id: null, edition: 1, identity: "derivation-0031" } })), publishpreflight: ok(refusedFirst),
    casedocument: ok(DOCUMENT({ citations: { state: "signed", rows: [{ target: "FND-2026-0031", version: "no_bytes", capture: null }] } })), captureaccounts: ok({ actors: [] }) } });
  assert.ok(drew(p, "screen.ceremony.prepared", { edition: "2" }));
  assert.equal(main(p).querySelector("[data-blockers]"), null);
  assert.ok(main(p).querySelector('[data-act="caseratify"]'), "Sign is offered");
  assert.ok(!drew(p, "review.body.nocase"));
});

/* ---------- C81 (R120 of interface-shell; R79): the walker's two screens at 390 px with a live-sized count of rows ---------- */
import { measure } from "./phone.mjs";
import { GRANT_UNTIL } from "./fixtures.mjs";
import { gateRefusal } from "../case-disclosures/fixtures.mjs";
const refsMd = ["---", `id: ${P}`, "title: \"The Coliseum lease\"", "references:", ...Array.from({ length: 12 }, (_, i) => [`  - target: INQ-2026-00${10 + i}-what-does-the-federal-freedom-of-information-act-require-agencies`, "    rel: cites", "    status: live"]).flat(), "---", ""].join("\n");
const manyGrants = Array.from({ length: 6 }, (_, i) => ({ grant_id: "GRT-" + i, recipient: "Professor Reader Number " + i + " of the Housing Law Clinic · housing law and tenant organizing", until: GRANT_UNTIL, zone: "America/Los_Angeles" }));
test("R79 C81 at 390 px the case editor's 'Remove a citation' and the review copy's 'Stop sharing' are each one line, over 200 px wide, inside the screen, with a live-sized number of rows", { timeout: 120000 }, async () => {
  const body = (act) => `(W) => { const bs = [...document.querySelectorAll('#cs-main button[data-act="${act}"]')].map((b) => b.getBoundingClientRect());
    return { n: bs.length, minW: Math.min(...bs.map((r) => r.width)), maxH: Math.max(...bs.map((r) => r.height)), right: Math.max(...bs.map((r) => r.right)), main: document.getElementById("cs-main").scrollWidth }; }`;
  const one = (act) => new Function("return " + body(act))();
  const ed = await measure(`/app/case-editor/${P}/${DR}`, 390, { answers: { image: ok({ "bundle.md": refsMd }) }, inspect: one("sever") });
  const rc = await measure(`/app/review-copy/${P}/${DR}`, 390, { answers: { reviewcopy: ok(COPY({ grants: manyGrants })) }, inspect: one("reviewrevoke") });
  for (const [who, m, n] of [["editor", ed, 12], ["review copy", rc, 6]]) {
    assert.equal(m.n, n, who + ": every row has its button");
    assert.ok(m.minW >= 200, who + ": the button is over 200 px wide (a squeezed one is 44): " + m.minW);
    assert.ok(m.maxH <= 70, who + ": the button's text is on one line: " + m.maxH);
    assert.ok(m.right <= 390 && m.main <= 390, who + ": inside the screen");
  }
});
