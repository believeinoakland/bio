/* acquisition: its own rows (R29), the one Civicsmith user agent (R24) and the one first hop's who (R33), at the module's interface. The rows are driven by
   their refusals in acquire.test.mjs (R1, R4, R5, each with its negative control); here the table itself is checked
   whole, and every refusal the act answers with a row is driven once more and matched to the row it names. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, text, rendererEnv } from "./fixture.mjs";
import { readFileSync, readdirSync } from "node:fs";
import { ACQUISITION_CHECKS, CAPTURE_REQUEST_ARM_CHECKS, DRIVE_CAPTURE_CHECKS, RENDER_CAPTURE_CHECKS, INSTALLATION_CHECKS, SWEEP_SCOPE_CHECKS, CIVICSMITH_CONTACT_URL,
         civicsmithUserAgent, firstHopWho, userAgent, evidenceStorageAbsent } from "../../../src/acquisition/index.mjs";
import * as acquisition from "../../../src/acquisition/index.mjs";
import * as checksTable from "../../../src/acquisition/checks.mjs";

const EXPECTED = {
  CAPTURE_NOT_DRAINING: "C-28.13",
  RENDER_FLAG_MALFORMED: "C-83.1", RENDER_ARM_CONFLICT: "C-83.2", RENDER_NO_RENDERER: "C-83.3", RENDER_DEFERRED: "C-83.4",
  RENDER_HOST_COOLING_OFF: "C-83.5", RENDER_NOT_A_PAGE: "C-83.6", RENDER_FAILED: "C-83.7", RENDER_AT_CAPACITY: "C-83.8",
  DRIVE_HOP_FACT_SUPPLIED: "C-48.1", DRIVE_FOLDER_NOT_A_DOCUMENT: "C-48.2", DRIVE_KIND_UNDETERMINED: "C-48.3", DRIVE_SHAPE_UNRECOGNISED: "C-48.4",
  DRIVE_EXPORT_IS_THE_SHELL: "C-48.5", DRIVE_EXPORT_UNREACHABLE: "C-48.6", DRIVE_EXPORT_BYTES_ARE_THE_SHELL: "C-48.7",
  EVIDENCE_STORAGE_NOT_CONFIGURED: "C-68.1",
  SWEEP_SCOPE_MISSING: "C-128.1", SWEEP_REDIRECT_OUT_OF_SCOPE: "C-128.2",
};

test("R29 R31: this module's table holds exactly C-48.1–C-48.7, C-83.1–C-83.8, C-28.13, C-68.1 and R31's C-128.1–C-128.2, each with its code, number, a translation and a where naming this module's site (C-68.1's its one raiser's, K850)", () => {
  assert.deepEqual(Object.fromEntries(Object.entries(ACQUISITION_CHECKS).map(([k, v]) => [k, v.check])), EXPECTED);
  assert.deepEqual(Object.keys(DRIVE_CAPTURE_CHECKS).sort(), Object.keys(EXPECTED).filter((k) => k.startsWith("DRIVE_")).sort(), "C-48.8 and C-48.9 are monitoring's");
  assert.deepEqual(Object.keys(RENDER_CAPTURE_CHECKS).sort(), Object.keys(EXPECTED).filter((k) => k.startsWith("RENDER_")).sort());
  assert.deepEqual(Object.keys(CAPTURE_REQUEST_ARM_CHECKS), ["CAPTURE_NOT_DRAINING"], "the rest of C-28 is capture-requests'");
  assert.deepEqual(Object.keys(INSTALLATION_CHECKS), ["EVIDENCE_STORAGE_NOT_CONFIGURED"], "the rest of C-68 is control-plane's and publication's");
  assert.deepEqual(Object.keys(SWEEP_SCOPE_CHECKS), ["SWEEP_SCOPE_MISSING", "SWEEP_REDIRECT_OUT_OF_SCOPE"], "R31's two rows");
  for (const [code, row] of Object.entries(ACQUISITION_CHECKS)) {
    assert.ok(typeof row.translation === "string" && row.translation.length > 40, code);
    assert.match(row.where, /^src\/acquisition\/index\.mjs (acquire|evidenceStorageAbsent) > is-[a-z-]+/, code);
    assert.ok(Object.isFrozen(row), `${code} is frozen`);
    assert.ok(!/oakland|alameda/i.test(row.translation), `${code}: R30, no place in outward text`);
  }
  assert.ok(Object.isFrozen(ACQUISITION_CHECKS) && Object.isFrozen(DRIVE_CAPTURE_CHECKS) && Object.isFrozen(RENDER_CAPTURE_CHECKS) && Object.isFrozen(INSTALLATION_CHECKS) && Object.isFrozen(SWEEP_SCOPE_CHECKS));
  /* K794, K850: C-68.1 is the catalogue's row with its number and translation unchanged, its where the one raiser's region */
  assert.deepEqual({ ...INSTALLATION_CHECKS.EVIDENCE_STORAGE_NOT_CONFIGURED }, {
    check: "C-68.1", where: "src/acquisition/index.mjs evidenceStorageAbsent > is-storage-absent",
    translation: "This copy was installed without the storage it keeps captured documents in, so it cannot "
      + "keep or read the bytes of a captured document. That is a fact about how the copy was set up, not "
      + "about this request: whoever installed it can connect that storage in the hosting account. Nothing "
      + "was changed." });
});

test("R29 R31: every refusal carrying a row answers that row's check and translation, and each has a negative control", async () => {
  const env = rendererEnv({ ok: false, error: "crashed" });
  const exp = "https://docs.google.com/document/d/1AbCdEfGhIjKlMnOp/export?format=odt";
  const link = "https://docs.google.com/document/d/1AbCdEfGhIjKlMnOp/edit";
  const html = () => new Response("<!doctype html><html><body>x</body></html>", { headers: { "content-type": "text/html" } });
  const full = (w) => { for (let i = 0; i < 10; i++) w.store.renderAdmit({ allowanceMs: 1e12, reserveMs: 1000, cap: 10 }); return w; };
  /* [code, world, routes, body, opts, the same act without the condition] */
  const cases = [
    ["EVIDENCE_STORAGE_NOT_CONFIGURED", world({ evidence: false }), { "https://a.example/x": text("x") }, { locator: "https://a.example/x" }, {}, [{ "https://a.example/x": text("x") }, { locator: "https://a.example/x" }]],
    ["CAPTURE_NOT_DRAINING", world(), {}, { via: "capture-request", locator: "https://a.example/x" }, {}, [{ "https://a.example/x": text("x") }, { locator: "https://a.example/x" }]],
    ["RENDER_FLAG_MALFORMED", world(), {}, { locator: "https://a.example/x", render: "true" }, {}, [{ "https://a.example/x": text("x") }, { locator: "https://a.example/x", render: false }]],
    ["RENDER_ARM_CONFLICT", world({ env }), {}, { locator: link, render: true }, {}, [{ [exp]: new Response(new Uint8Array([0x50, 0x4b, 3, 4])) }, { locator: link }]],
    ["RENDER_NO_RENDERER", world(), {}, { locator: "https://a.example/x", render: true }, {}, [{ "https://a.example/x": text("x") }, { locator: "https://a.example/x" }]],
    ["RENDER_DEFERRED", world({ env: { ...env, RENDER_DAILY_ALLOWANCE_MS: "0" } }), {}, { locator: "https://a.example/x", render: true }, {}, [{ "https://a.example/x": text("x") }, { locator: "https://a.example/x" }]],
    ["RENDER_HOST_COOLING_OFF", world({ env, gov: { refuse: ["a.example"] } }), {}, { locator: "https://a.example/x", render: true }, {}, null],
    ["RENDER_NOT_A_PAGE", world({ env }), { "https://a.example/x": text("x") }, { locator: "https://a.example/x", render: true }, {}, null],
    ["RENDER_FAILED", world({ env }), { "https://a.example/x": html }, { locator: "https://a.example/x", render: true }, {}, null],
    ["RENDER_AT_CAPACITY", full(world({ env })), {}, { locator: "https://a.example/x", render: true }, {}, null],
    ["DRIVE_HOP_FACT_SUPPLIED", world(), {}, { locator: link, drive_kind: "document" }, {}, [{ [exp]: new Response(new Uint8Array([0x50, 0x4b, 3, 4])) }, { locator: link, driveKind: "document" }]],
    ["DRIVE_FOLDER_NOT_A_DOCUMENT", world(), {}, { locator: "https://drive.google.com/drive/folders/1AbCdEfGhIjK" }, {}, null],
    ["DRIVE_KIND_UNDETERMINED", world(), {}, { locator: "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOp/view" }, {}, null],
    ["DRIVE_SHAPE_UNRECOGNISED", world(), {}, { locator: "https://docs.google.com/weird/path" }, {}, null],
    ["DRIVE_EXPORT_IS_THE_SHELL", world(), { [exp]: html }, { locator: link }, {}, [{ "https://a.example/x": html }, { locator: "https://a.example/x" }]],
    ["DRIVE_EXPORT_UNREACHABLE", world(), { [exp]: new Response("no", { status: 404 }) }, { locator: link }, {}, [{ [exp]: new Response(new Uint8Array([0x50, 0x4b, 3, 4])) }, { locator: link }]],
    ["DRIVE_EXPORT_BYTES_ARE_THE_SHELL", world(), { [exp]: () => new Response("<html><body>app</body></html>", { headers: { "content-type": "application/vnd.oasis.opendocument.text" } }) },
     { locator: link }, {}, [{ [exp]: () => new Response(new Uint8Array([0x50, 0x4b, 3, 4]), { headers: { "content-type": "application/vnd.oasis.opendocument.text" } }) }, { locator: link }]],
    /* R31's two, on the in-process arm (their negative controls are sweep-scope.test.mjs's) */
    ["SWEEP_SCOPE_MISSING", world(), { "https://s.example/a": text("x") }, {}, { cls: "daemon", member: false, captureRequest: { locator: "https://s.example/a",
      origin: { kind: "sweep", matched_sweep: "INFO-2026-0001-l#s", deeming_actor: "bio-monitor" } } }, null],
    ["SWEEP_REDIRECT_OUT_OF_SCOPE", world(), { "https://s.example/a": () => new Response("", { status: 302, headers: { location: "https://t.example/" } }) }, {},
     { cls: "daemon", member: false, captureRequest: { locator: "https://s.example/a", scope: ["https://s.example/"],
      origin: { kind: "sweep", matched_sweep: "INFO-2026-0001-l#s", deeming_actor: "bio-monitor" } } }, null],
  ];
  assert.deepEqual(cases.map((c) => c[0]).sort(), Object.keys(EXPECTED).sort(), "every row is driven");
  for (const [code, w, routes, body, opts, control] of cases) {
    const r = await run(w, routes, body, opts);
    assert.deepEqual([r.body.ok, r.body.reason, r.body.check, r.body.translation], [false, code, ACQUISITION_CHECKS[code].check, ACQUISITION_CHECKS[code].translation], code);
    if (control) {
      const ok = await run(world({ env }), control[0], control[1]);
      assert.equal(ok.body.ok, true, `${code}'s negative control: ${JSON.stringify(ok.body).slice(0, 200)}`);
    }
  }
});

test("R24 R9: civicsmithUserAgent is the one spelling of the Civicsmith agent, with its defaults; pure, and never throws; R9's agent is it", () => {
  assert.equal(civicsmithUserAgent("1.2.3", "inst", "acquire"), `Civicsmith/1.2.3 (+${CIVICSMITH_CONTACT_URL}; instance inst; acquire)`);
  assert.equal(civicsmithUserAgent(undefined, undefined, "monitor"), `Civicsmith/0.0.0 (+${CIVICSMITH_CONTACT_URL}; instance unnamed; monitor)`);
  assert.equal(civicsmithUserAgent("", "", "x"), `Civicsmith/0.0.0 (+${CIVICSMITH_CONTACT_URL}; instance unnamed; x)`);
  assert.equal(CIVICSMITH_CONTACT_URL, "https://github.com/believeinoakland/bio", "the project's public address, unchanged by the rename");
  for (const args of [[], [null, null, null], [{}, [], 7], [Symbol.iterator.description, 1, 2]]) {
    assert.doesNotThrow(() => civicsmithUserAgent(...args));
    assert.match(civicsmithUserAgent(...args), /^Civicsmith\/.* \(\+https:\/\/github\.com\/believeinoakland\/bio; instance /s);
  }
  assert.equal(civicsmithUserAgent("1", "i", "p"), civicsmithUserAgent("1", "i", "p"), "the same inputs, the same bytes");
  assert.doesNotMatch(civicsmithUserAgent("1", "i", "p"), /CivicOS/, "the old name is sent nowhere");
  /* R9's agent is R24's, a delegated agent returned verbatim */
  assert.equal(userAgent({ VERSION: "2.0.0", INSTANCE_NAME: "grp" }, "acquire"), civicsmithUserAgent("2.0.0", "grp", "acquire"));
  assert.equal(userAgent(null), civicsmithUserAgent("0.0.0", "unnamed", "acquire"));
  assert.equal(userAgent({}, "acquire", "  Mozilla/5.0 Member  "), "Mozilla/5.0 Member");
  assert.equal(userAgent({}, "acquire", "   "), civicsmithUserAgent("0.0.0", "unnamed", "acquire"), "an empty delegation is no delegation");
});

test("R34 (N539): civicosUserAgent and CIVICOS_CONTACT_URL are exported neither by the module nor by its table; the Civicsmith names are the only ones", () => {
  for (const ns of [acquisition, checksTable]) {
    assert.equal("civicosUserAgent" in ns, false);
    assert.equal("CIVICOS_CONTACT_URL" in ns, false);
    assert.deepEqual(Object.keys(ns).filter((k) => /civicos/i.test(k)), [], "no export carries the old name");
    /* negative control: the Civicsmith names are there, the one function and the one constant */
    assert.equal(ns.civicsmithUserAgent, civicsmithUserAgent);
    assert.equal(ns.CIVICSMITH_CONTACT_URL, CIVICSMITH_CONTACT_URL);
  }
});

test("R33 R16 (N541): firstHopWho answers `instance <name> (Civicsmith/<version>)` with R24's defaults; pure, never throws; it is the who acquire's first hop carries", async () => {
  assert.equal(firstHopWho("inst", "9.9.9"), "instance inst (Civicsmith/9.9.9)");
  assert.equal(firstHopWho("Oakland Watch", "1.60.0"), "instance Oakland Watch (Civicsmith/1.60.0)", "the name as given");
  for (const [n, v] of [[undefined, undefined], [null, null], ["", ""], ["  ", " "]])
    assert.equal(firstHopWho(n, v), "instance unnamed (Civicsmith/0.0.0)", JSON.stringify([n, v]));
  assert.equal(firstHopWho("inst"), "instance inst (Civicsmith/0.0.0)");
  assert.equal(firstHopWho(undefined, "2.0.0"), "instance unnamed (Civicsmith/2.0.0)");
  for (const args of [[], [{}, []], [7, 8], [Symbol("s"), Symbol("v")], [{ toString() { throw new Error("x"); } }, 1]]) {
    assert.doesNotThrow(() => firstHopWho(...args));
    assert.match(firstHopWho(...args), /^instance .+ \(Civicsmith\/.+\)$/);
  }
  assert.equal(firstHopWho("i", "1"), firstHopWho("i", "1"), "the same inputs, the same bytes");
  assert.doesNotMatch(firstHopWho("i", "1"), /CivicOS/);
  assert.equal(checksTable.firstHopWho, firstHopWho, "one function, from the module and its table");
  /* R16 reads it: the first hop of a capture on a named instance and on a bare one */
  const env = { INSTANCE_NAME: "grp", VERSION: "3.1.4" };
  const direct = await run(world({ env }), { "https://a.example/x": text("x") }, { locator: "https://a.example/x" });
  assert.equal(direct.body.document.provenance_chain[0].who, firstHopWho("grp", "3.1.4"));
  const bare = await run(world({ env: { INSTANCE_NAME: "", VERSION: "" } }), { "https://a.example/x": text("x") }, { locator: "https://a.example/x" });
  assert.equal(bare.body.document.provenance_chain[0].who, firstHopWho(undefined, undefined));
});

test("R29 (C-68.1, K794): acquire with no evidence storage is refused 503 with its row before anything is fetched or filed, whatever the arm; with storage the same act files", async () => {
  const row = INSTALLATION_CHECKS.EVIDENCE_STORAGE_NOT_CONFIGURED;
  for (const [body, o] of [[{ locator: "https://a.example/x" }, {}], [{ via: "archive.org", address: "https://a.example/x" }, { cls: "admin", member: false }],
                           [{ locator: "https://a.example/x", render: true }, {}], [{}, { cls: "daemon", member: false, captureRequest: { locator: "https://a.example/x" } }]]) {
    const w = world({ evidence: false });
    const r = await run(w, { "https://a.example/x": text("x") }, body, o);
    assert.deepEqual([r.status, r.body.ok, r.body.reason, r.body.check, r.body.translation, r.body.op, r.body.error],
                     [503, false, "EVIDENCE_STORAGE_NOT_CONFIGURED", row.check, row.translation, "acquire", "this instance has no evidence storage configured"], JSON.stringify(body));
    assert.deepEqual([r.net.seen.length, w.prov.receipts.length, w.b.calls.length], [0, 0, 0], "nothing fetched, filed or stored");
  }
  /* negative control: the same act with storage bound is a filed capture carrying no row */
  const ok = await run(world(), { "https://a.example/x": text("x") }, { locator: "https://a.example/x" });
  assert.deepEqual([ok.status, ok.body.ok, "check" in ok.body], [200, true, false]);
});

/* K850: the door's answer as control-plane's `storageAbsent` gives it through its `json` today, for each op it hands the
   raiser to, with the error each site passes byte-identical (capture/ops.mjs, extraction/ops.mjs, attestation/ops.mjs; provenance/ops.mjs before N512). */
const C681 = INSTALLATION_CHECKS.EVIDENCE_STORAGE_NOT_CONFIGURED;
const doorBody = (op, error) => ({ ok: false, reason: "EVIDENCE_STORAGE_NOT_CONFIGURED", code: "EVIDENCE_STORAGE_NOT_CONFIGURED",
                                   check: C681.check, translation: C681.translation, error, op });
const acquireBody = (error) => ({ ok: false, reason: "EVIDENCE_STORAGE_NOT_CONFIGURED", check: C681.check, translation: C681.translation,
                                  op: "acquire", error });

test("R29 (C-68.1, K850): the exported raiser answers the door's body for the op and error it is given, key for key and in order, 503; with {code: false} it answers acquire's; never throws", () => {
  for (const [op, error] of [["capture", "R2 is not configured on this instance"], ["pdfstructure", "R2 is not configured on this instance"],
                             ["acquire", "this instance has no evidence storage configured"], ["attest", "this instance has no evidence storage configured"]]) {
    const a = evidenceStorageAbsent(op, error);
    assert.equal(a.status, 503, op);
    assert.deepEqual(a.body, doorBody(op, error), op);
    assert.equal(JSON.stringify(a.body), JSON.stringify(doorBody(op, error)), `${op}: the door's bytes, its keys in their order`);
    assert.deepEqual(Object.keys(a), ["status", "body"], `${op}: a status and a body, as the door's json takes them`);
    const b = evidenceStorageAbsent(op, error, { code: false });
    assert.equal(b.status, 503);
    assert.equal(JSON.stringify(b.body), JSON.stringify({ ...acquireBody(error), op }), `${op}: acquire's shape, no code`);
    assert.equal("code" in b.body, false);
  }
  /* the op and error are the caller's, passed through unchanged, whatever they are; each call answers a fresh body */
  for (const [op, error] of [[undefined, undefined], [null, ""], ["x", { not: "a string" }]]) {
    const a = evidenceStorageAbsent(op, error);
    assert.deepEqual([a.status, a.body.op, a.body.error, a.body.check], [503, op, error, "C-68.1"]);
  }
  assert.notEqual(evidenceStorageAbsent("a", "e").body, evidenceStorageAbsent("a", "e").body, "a caller may decorate its own body");
  assert.doesNotThrow(() => evidenceStorageAbsent());
  /* negative control: the explicit default is the door's body */
  assert.equal(JSON.stringify(evidenceStorageAbsent("capture", "e", { code: true }).body), JSON.stringify(doorBody("capture", "e")));
  assert.equal(JSON.stringify(evidenceStorageAbsent("capture", "e", {}).body), JSON.stringify(doorBody("capture", "e")));
});

test("R29 (C-68.1, K850): acquire without evidence storage answers as before, byte for byte, and its answer is the raiser's own", async () => {
  const error = "this instance has no evidence storage configured";
  const r = await run(world({ evidence: false }), { "https://a.example/x": text("x") }, { locator: "https://a.example/x" });
  assert.equal(r.status, 503);
  assert.equal(JSON.stringify(r.body), JSON.stringify(acquireBody(error)), "acquire's body unchanged: ok, reason, check, translation, op, error; no code");
  assert.deepEqual({ status: r.status, body: r.body }, evidenceStorageAbsent("acquire", error, { code: false }), "raised through the export");
});

test("R29 (C-68.1, K850): the module's source holds exactly one is-storage-absent region, inside evidenceStorageAbsent, and the row's where names it", () => {
  const dir = new URL("../../../src/acquisition/", import.meta.url);
  const files = readdirSync(dir).filter((f) => f.endsWith(".mjs"));
  const opens = [], closes = [];
  for (const f of files) {
    const src = readFileSync(new URL(f, dir), "utf8");
    for (const m of src.matchAll(/DEC-49 REGION is-storage-absent\b/g)) opens.push([f, m.index, src]);
    for (const m of src.matchAll(/END DEC-49 REGION is-storage-absent\b/g)) closes.push([f, m.index]);
  }
  /* each END line also matches the opening pattern; one region is one opening and one END */
  assert.deepEqual([opens.length - closes.length, closes.length], [1, 1], "exactly one is-storage-absent region");
  const [file, at, src] = opens.find(([f, i]) => !closes.some(([g, j]) => g === f && j + 4 === i));
  assert.equal(file, "index.mjs");
  const fn = src.lastIndexOf("export function evidenceStorageAbsent(", at);
  assert.ok(fn >= 0 && !/\nexport (async )?function /.test(src.slice(fn + 1, at)), "the region is inside evidenceStorageAbsent");
  assert.ok(closes[0][1] > at && !/\nexport (async )?function /.test(src.slice(at, closes[0][1])), "and closes inside it");
  assert.equal(C681.where, "src/acquisition/index.mjs evidenceStorageAbsent > is-storage-absent");
});
