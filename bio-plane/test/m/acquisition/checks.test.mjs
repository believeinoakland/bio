/* acquisition: its own rows (R29) and the one CivicOS user agent (R24), at the module's interface. The rows are driven by
   their refusals in acquire.test.mjs (R1, R4, R5, each with its negative control); here the table itself is checked
   whole, and every refusal the act answers with a row is driven once more and matched to the row it names. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, text, rendererEnv } from "./fixture.mjs";
import { ACQUISITION_CHECKS, CAPTURE_REQUEST_ARM_CHECKS, DRIVE_CAPTURE_CHECKS, RENDER_CAPTURE_CHECKS, CIVICOS_CONTACT_URL,
         civicosUserAgent, userAgent } from "../../../src/acquisition/index.mjs";

const EXPECTED = {
  CAPTURE_NOT_DRAINING: "C-28.13",
  RENDER_FLAG_MALFORMED: "C-83.1", RENDER_ARM_CONFLICT: "C-83.2", RENDER_NO_RENDERER: "C-83.3", RENDER_DEFERRED: "C-83.4",
  RENDER_HOST_COOLING_OFF: "C-83.5", RENDER_NOT_A_PAGE: "C-83.6", RENDER_FAILED: "C-83.7", RENDER_AT_CAPACITY: "C-83.8",
  DRIVE_HOP_FACT_SUPPLIED: "C-48.1", DRIVE_FOLDER_NOT_A_DOCUMENT: "C-48.2", DRIVE_KIND_UNDETERMINED: "C-48.3", DRIVE_SHAPE_UNRECOGNISED: "C-48.4",
  DRIVE_EXPORT_IS_THE_SHELL: "C-48.5", DRIVE_EXPORT_UNREACHABLE: "C-48.6", DRIVE_EXPORT_BYTES_ARE_THE_SHELL: "C-48.7",
};

test("R29: this module's table holds exactly C-48.1–C-48.7, C-83.1–C-83.8 and C-28.13, each with its code, number, a translation and a where naming this module's site", () => {
  assert.deepEqual(Object.fromEntries(Object.entries(ACQUISITION_CHECKS).map(([k, v]) => [k, v.check])), EXPECTED);
  assert.deepEqual(Object.keys(DRIVE_CAPTURE_CHECKS).sort(), Object.keys(EXPECTED).filter((k) => k.startsWith("DRIVE_")).sort(), "C-48.8 and C-48.9 are monitoring's");
  assert.deepEqual(Object.keys(RENDER_CAPTURE_CHECKS).sort(), Object.keys(EXPECTED).filter((k) => k.startsWith("RENDER_")).sort());
  assert.deepEqual(Object.keys(CAPTURE_REQUEST_ARM_CHECKS), ["CAPTURE_NOT_DRAINING"], "the rest of C-28 is capture-requests'");
  for (const [code, row] of Object.entries(ACQUISITION_CHECKS)) {
    assert.ok(typeof row.translation === "string" && row.translation.length > 40, code);
    assert.match(row.where, /^src\/acquisition\/index\.mjs acquire > is-[a-z-]+/, code);
    assert.ok(Object.isFrozen(row), `${code} is frozen`);
    assert.ok(!/oakland|alameda/i.test(row.translation), `${code}: R30, no place in outward text`);
  }
  assert.ok(Object.isFrozen(ACQUISITION_CHECKS) && Object.isFrozen(DRIVE_CAPTURE_CHECKS) && Object.isFrozen(RENDER_CAPTURE_CHECKS));
});

test("R29: every refusal carrying a row answers that row's check and translation, and each has a negative control", async () => {
  const env = rendererEnv({ ok: false, error: "crashed" });
  const exp = "https://docs.google.com/document/d/1AbCdEfGhIjKlMnOp/export?format=odt";
  const link = "https://docs.google.com/document/d/1AbCdEfGhIjKlMnOp/edit";
  const html = () => new Response("<!doctype html><html><body>x</body></html>", { headers: { "content-type": "text/html" } });
  const full = (w) => { for (let i = 0; i < 10; i++) w.store.renderAdmit({ allowanceMs: 1e12, reserveMs: 1000, cap: 10 }); return w; };
  /* [code, world, routes, body, opts, the same act without the condition] */
  const cases = [
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

test("R24: civicosUserAgent is the one spelling of the CivicOS agent, with its defaults; pure, and never throws", () => {
  assert.equal(civicosUserAgent("1.2.3", "inst", "acquire"), `CivicOS/1.2.3 (+${CIVICOS_CONTACT_URL}; instance inst; acquire)`);
  assert.equal(civicosUserAgent(undefined, undefined, "monitor"), `CivicOS/0.0.0 (+${CIVICOS_CONTACT_URL}; instance unnamed; monitor)`);
  assert.equal(civicosUserAgent("", "", "x"), `CivicOS/0.0.0 (+${CIVICOS_CONTACT_URL}; instance unnamed; x)`);
  assert.match(CIVICOS_CONTACT_URL, /^https:\/\/[a-z0-9.-]+\//, "the project's public address");
  for (const args of [[], [null, null, null], [{}, [], 7], [Symbol.iterator.description, 1, 2]])
    assert.doesNotThrow(() => civicosUserAgent(...args));
  assert.equal(civicosUserAgent("1", "i", "p"), civicosUserAgent("1", "i", "p"), "the same inputs, the same bytes");
  /* R9's agent is R24's, a delegated agent returned verbatim */
  assert.equal(userAgent({ VERSION: "2.0.0", INSTANCE_NAME: "grp" }, "acquire"), civicosUserAgent("2.0.0", "grp", "acquire"));
  assert.equal(userAgent(null), civicosUserAgent("0.0.0", "unnamed", "acquire"));
  assert.equal(userAgent({}, "acquire", "  Mozilla/5.0 Member  "), "Mozilla/5.0 Member");
  assert.equal(userAgent({}, "acquire", "   "), civicosUserAgent("0.0.0", "unnamed", "acquire"), "an empty delegation is no delegation");
});
