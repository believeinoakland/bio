/* capture-requests: the door (R1–R9, R34's door rows), driven at `captureRequest` and its op handler. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, T0 } from "./fixture.mjs";
import { CAPTURE_REQUEST_TTL_MS, CAPTURE_FIELDS, captureRequestsOps }
  from "../../../src/capture-requests/index.mjs";
import { CAPTURE_REQUEST_CHECKS as CATALOGUE } from "../../../checks/bio-checks.mjs";

const count = (w) => w.row(`SELECT count(*) AS n FROM capture_requests`).n;
const refusedWith = (a, code) => {
  assert.equal(a.ok, false);
  assert.equal(a.code, code);
  assert.equal(a.reason, code);
  assert.equal(a.check, CATALOGUE[code].check);
  assert.equal(a.translation, CATALOGUE[code].translation);
  assert.equal(typeof a.detail, "string");
};

test("R1 a run absent, unseen or not running is CAPTURE_REQUEST_NO_RUN (C-28.1), the unseen and never-minted alike but for the id; nothing is written", () => {
  const w = world().scene();
  w.run("R-HIDDEN", { hiddenFrom: [V("ann")] });
  w.run("R-DONE", { status: "finished" });
  const absent = w.ask({ run: "R-NONE" });
  const hidden = w.ask({ run: "R-HIDDEN" });
  refusedWith(absent, "CAPTURE_REQUEST_NO_RUN");
  refusedWith(hidden, "CAPTURE_REQUEST_NO_RUN");
  assert.deepEqual({ ...absent, run: null, detail: absent.detail.replace("R-NONE", "X") },
                   { ...hidden, run: null, detail: hidden.detail.replace("R-HIDDEN", "X") });
  refusedWith(w.ask({ run: "" }), "CAPTURE_REQUEST_NO_RUN");
  assert.equal(w.ask({ run: "" }).run, null);
  refusedWith(w.ask({ run: "R-DONE" }), "CAPTURE_REQUEST_NO_RUN");
  assert.equal(count(w), 0);
});

test("R1 a caller who is not the run's principal is ai-runs' runPrincipalGate refusal (AI_RUN_NOT_PRINCIPAL, C-22.12), relayed field by field; sight before position before status", () => {
  const w = world().scene();
  const a = w.ask({}, { caller: "member:bob/tok9" });
  assert.equal(a.ok, false);
  assert.equal(a.code, "AI_RUN_NOT_PRINCIPAL");
  assert.equal(a.check, "C-22.12");
  assert.equal(typeof a.translation, "string");
  assert.equal(a.run, "R-1");
  /* the principal's own other credential is the principal (REC-152: the token id is removed) */
  assert.equal(w.ask({}, { caller: "member:ann/tok2" }).ok, true);
  /* sight before position: a hidden run answers NO_RUN even to a stranger */
  w.run("R-H", { hiddenFrom: [V("bob")] });
  assert.equal(w.ask({ run: "R-H" }, { viewer: V("bob"), caller: "member:bob/t" }).code, "CAPTURE_REQUEST_NO_RUN");
  /* position before status: a finished run of another principal is the position refusal */
  w.run("R-F", { status: "finished" });
  assert.equal(w.ask({ run: "R-F" }, { caller: "member:bob/t" }).code, "AI_RUN_NOT_PRINCIPAL");
  assert.equal(count(w), 1);
});

test("R2 the address must be a public https locator with a readable host (C-28.2); the host is derived, lower-cased and stored", () => {
  const w = world().scene();
  for (const address of ["", "http://example.org/a", "https://127.0.0.1/x", "https://localhost/x",
                         "https://user:pw@example.org/x", "ftp://example.org/x", "not a url"])
    refusedWith(w.ask({ address }), "CAPTURE_REQUEST_NOT_PUBLIC");
  assert.equal(count(w), 0);
  const a = w.ask({ address: "https://Docs.Example.ORG/Path" });
  assert.equal(a.ok, true);
  assert.equal(a.host, "docs.example.org");
  assert.equal(w.req(a.request).host, "docs.example.org");
});

test("R3 the target must be an inquiry the viewer can see (C-28.3), an unseen and an absent one alike; a legacy spelling reads as an inquiry", () => {
  const w = world().scene();
  w.project("PROJ-H");
  w.bundle("PROJ-H-INQ", "inquiry");
  st(w).exec(`UPDATE bundles SET object_type='project' WHERE bundle_id='PROJ-H-INQ'`);
  w.bundle("FOCUS-1", "focus");
  refusedWith(w.ask({ target: "" }), "CAPTURE_REQUEST_NOT_AN_INQUIRY");
  refusedWith(w.ask({ target: "INQ-NONE" }), "CAPTURE_REQUEST_NOT_AN_INQUIRY");
  refusedWith(w.ask({ target: "DOC-1" }), "CAPTURE_REQUEST_NOT_AN_INQUIRY");
  const hidden = w.ask({ target: "PROJ-H" }), absent = w.ask({ target: "PROJ-X" });
  assert.equal(hidden.code, absent.code);
  assert.equal(w.ask({ target: "FOCUS-1" }).ok, true, "a legacy `focus` is an inquiry");
  assert.equal(w.ask({ target: "INQ-1" }, { viewer: null }).code, "CAPTURE_REQUEST_NO_RUN",
    "an absent viewer sees nothing, the run first");
});

test("R3 a lead must be another inquiry the viewer can see (C-28.14) and never the target (C-28.15)", () => {
  const w = world().scene();
  refusedWith(w.ask({ lead_inquiry: "DOC-1" }), "CAPTURE_REQUEST_LEAD_NOT_AN_INQUIRY");
  refusedWith(w.ask({ lead: "INQ-NONE" }), "CAPTURE_REQUEST_LEAD_NOT_AN_INQUIRY");
  refusedWith(w.ask({ lead_inquiry: "INQ-1" }), "CAPTURE_REQUEST_LEAD_IS_THE_TARGET");
  assert.equal(count(w), 0);
  const a = w.ask({ lead: "INQ-2" });
  assert.equal(a.ok, true);
  assert.equal(a.lead_inquiry, "INQ-2");
  assert.equal(w.req(a.request).lead_inquiry, "INQ-2");
});

test("R4 a request carrying any capture field is CAPTURE_REQUEST_CARRIES_A_CAPTURE (C-28.4), naming every field; empty values are not carried", () => {
  const w = world().scene();
  for (const f of CAPTURE_FIELDS) {
    const a = w.ask({ [f]: "x" });
    refusedWith(a, "CAPTURE_REQUEST_CARRIES_A_CAPTURE");
    assert.deepEqual(a.fields, [f]);
  }
  const all = w.ask(Object.fromEntries(CAPTURE_FIELDS.map((f) => [f, 1])));
  assert.deepEqual(all.fields, [...CAPTURE_FIELDS]);
  assert.equal(count(w), 0);
  assert.equal(w.ask({ sha256: "", bytes: null, via: undefined }).ok, true);
});

test("R5 render absent, null or false is the served document, true the rendered page; any other value is C-28.16 and nothing is queued", () => {
  const w = world().scene();
  for (const render of ["yes", 1, 0, "true", {}, []]) refusedWith(w.ask({ render }), "CAPTURE_REQUEST_RENDER_MALFORMED");
  assert.equal(count(w), 0);
  const plain = w.ask({ address: "https://example.org/p" });
  const nul = w.ask({ address: "https://example.org/n", render: null });
  const no = w.ask({ address: "https://example.org/f", render: false });
  const yes = w.ask({ address: "https://example.org/r", render: true });
  assert.deepEqual([plain.render, nul.render, no.render, yes.render], [false, false, false, true]);
  assert.deepEqual([plain, nul, no, yes].map((a) => w.req(a.request).render), [0, 0, 0, 1]);
});

test("R6 idempotent on (run, address, render): a standing row in requested, draining or captured is answered as it stands and nothing is written", async () => {
  const w = world().scene();
  const first = w.ask({ lead: "INQ-2", purpose: "investigate" });
  assert.deepEqual([first.requested, first.already, first.state], [true, false, "requested"]);
  const again = w.ask({ purpose: "acquire", target: "INQ-2", lead: null, ua_mode: "member-browser" });
  assert.deepEqual([again.requested, again.already, again.request, again.target, again.purpose, again.ua_mode,
                    again.lead_inquiry, again.render, again.state],
                   [false, true, first.request, "INQ-1", "investigate", "civicos", "INQ-2", false, "requested"]);
  assert.deepEqual(again.principals, { plane: "member:ann/tok1", claude: "instance" });
  assert.equal(count(w), 1);
  /* a render ask is a different key */
  assert.equal(w.ask({ render: true }).already, false);
  /* draining and captured stand too; refused and expired do not */
  st(w).exec(`UPDATE capture_requests SET state='draining' WHERE request=?`, first.request);
  assert.equal(w.ask().already, true);
  st(w).exec(`UPDATE capture_requests SET state='captured' WHERE request=?`, first.request);
  assert.equal(w.ask().state, "captured");
  st(w).exec(`UPDATE capture_requests SET state='refused' WHERE request=?`, first.request);
  const fresh = w.ask();
  assert.equal(fresh.already, false);
  assert.notEqual(fresh.request, first.request);
});

test("R6 a new row is written requested, attempts 0, requested_at and updated now, expires now + 24 h, on this instance's clock and never a body's `at`, answered as written", () => {
  const w = world().scene();
  const a = w.ask({ at: "2001-01-01T00:00:00Z", purpose: "  investigate  ", ua_mode: " civicos " });
  const r = w.req(a.request);
  const now = new Date(T0).toISOString().replace(/\.\d+Z$/, "Z");
  const exp = new Date(T0 + CAPTURE_REQUEST_TTL_MS).toISOString().replace(/\.\d+Z$/, "Z");
  assert.deepEqual([r.state, r.attempts, r.requested_at, r.updated, r.expires], ["requested", 0, now, now, exp]);
  assert.deepEqual([a.requested_at, a.expires, a.purpose, a.ua_mode], [now, exp, "investigate", "civicos"],
    "the answer is the row as written, not the call as sent");
  assert.equal(a.target, r.target);
  assert.equal(a.address, r.address);
});

test("R7 the id is minted here (CR-<instant>-<random>), never a body's `request`; a held id never makes the door throw", () => {
  const w = world().scene();
  const a = w.ask({ address: "https://example.org/1", request: "CR-MINE" });
  assert.match(a.request, /^CR-\d{14}-[0-9a-f]{12}$/);
  assert.equal(w.req("CR-MINE"), null);
  const b = w.ask({ address: "https://example.org/2", request: a.request });
  assert.equal(b.ok, true);
  assert.notEqual(b.request, a.request);
  assert.equal(count(w), 2);
  /* never throws, whatever it is handed */
  for (const junk of [null, undefined, 42, "x", { run: { toString: null } }, { run: "R-1", address: "https://e.org/j",
                      target: "INQ-1", render: 10n }, { run: "R-1", address: "https://e.org/k", target: "INQ-1", render: Symbol("s") }])
    assert.doesNotThrow(() => w.cr.captureRequest(junk, {}));
});

test("R8 principal_plane is the caller stamp and principal_claude the run's; neither is read from the body; purpose and ua_mode are recorded as sent", () => {
  const w = world().scene();
  const a = w.ask({ principal_plane: "member:eve", principal_claude: "eve-pays", caller: "member:eve", purpose: "whatever",
                    ua_mode: "made-up" });
  const r = w.req(a.request);
  assert.deepEqual([r.principal_plane, r.principal_claude], ["member:ann/tok1", "instance"]);
  assert.deepEqual([r.purpose, r.ua_mode], ["whatever", "made-up"], "judged only at the drain (R14)");
  /* the op handler takes the stamps from the query string only */
  const url = new URL("http://x/capturerequest?viewer=member%3Aann&principal=member%3Aann%2Ftok1");
  const b = captureRequestsOps(w.cr, url, { run: "R-1", address: "https://example.org/op", target: "INQ-1",
                                           purpose: "investigate", viewer: "class:admin", caller: "member:eve" })
    .capturerequest();
  assert.equal(b.ok, true);
  assert.equal(w.req(b.request).principal_plane, "member:ann/tok1");
  const c = captureRequestsOps(w.cr, new URL("http://x/capturerequest"), { run: "R-1", address: "https://example.org/op2",
    target: "INQ-1", viewer: "class:admin", caller: "member:ann/tok1" }).capturerequest();
  assert.equal(c.code, "CAPTURE_REQUEST_NO_RUN", "a body's viewer is never the viewer");
});

test("R9 the door makes no outbound request of any kind and runs no conduct or attribution check", () => {
  const w = world().scene();
  const touched = [];
  w.capture.acquire = async () => { touched.push("capture"); return {}; };
  const heldBefore = w.governor.isHeld;
  w.governor.isHeld = (...a) => { touched.push("governor"); return heldBefore.apply(w.governor, a); };
  if (w.creds) w.creds.credentialsForFetch = async () => { touched.push("credentials"); return { credentials: [] }; };
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => { touched.push("fetch"); throw new Error("no"); };
  try {
    /* a row the drain would refuse for conduct and attribution is accepted at the door */
    w.run("R-HALF", { claude: "   " });
    const a = w.ask({ run: "R-HALF", purpose: "nonsense", ua_mode: "invented" });
    assert.equal(a.ok, true);
    assert.equal(w.ask({ render: true }).ok, true);
  } finally { globalThis.fetch = realFetch; }
  assert.deepEqual(touched, []);
});

test("R34 every door refusal carries its catalogue row: the code, its C-28 check and its translation", () => {
  for (const code of ["CAPTURE_REQUEST_NO_RUN", "CAPTURE_REQUEST_NOT_PUBLIC", "CAPTURE_REQUEST_NOT_AN_INQUIRY",
                      "CAPTURE_REQUEST_CARRIES_A_CAPTURE", "CAPTURE_REQUEST_LEAD_NOT_AN_INQUIRY",
                      "CAPTURE_REQUEST_LEAD_IS_THE_TARGET", "CAPTURE_REQUEST_RENDER_MALFORMED"])
    assert.match(CATALOGUE[code].check, /^C-28\.\d+$/);
  const checks = Object.values(CATALOGUE).map((r) => r.check);
  assert.equal(checks.includes("C-28.5"), false);
  assert.equal(checks.includes("C-28.12"), false);
});

function st(w) { return w.st.sql; }
