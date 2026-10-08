/* acquisition: the eighteen DEC-149 strings of plan T35's sweep (N664, N693; `build/plan/draft-T35-dec149-l1-l7.md`, its
   acquisition rows; plan rule 4): what a member reads names "your group's Civicsmith", never "this instance" or "this
   copy". Each string is named here and checked where a member meets it: the row's translation (R29) or the refusal's
   `detail` the act answers (R1, R4, R5, R29, R36). The rule changes no requirement; the ids named are the requirements
   whose answers carry the words. Field and identifier names stay (the sweep's M rule). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, text } from "./fixture.mjs";
import { ACQUISITION_CHECKS, keyedFetch } from "../../../src/acquisition/index.mjs";

const OLD = /this instance|this copy|the copy\b/i;
const tr = (code) => ACQUISITION_CHECKS[code].translation;

/* [plan row, row code, the old words, the new words] */
const ROWS = [
  ["checks.mjs:45", "CAPTURE_NOT_DRAINING", "Only this instance's own background worker fetches documents", "Only the background worker of your group's Civicsmith fetches documents"],
  ["checks.mjs:66", "RENDER_FLAG_MALFORMED", "a rendered capture in a form this instance does not recognise", "a rendered capture in a form your group's Civicsmith does not recognise"],
  ["checks.mjs:84", "RENDER_NO_RENDERER", "This instance has no working page renderer", "Your group's Civicsmith has no working page renderer"],
  ["checks.mjs:94 (C-83.4)", "RENDER_DEFERRED", "held by renders this instance is running right now", "held by renders your group's Civicsmith is running right now"],
  ["checks.mjs:103", "RENDER_HOST_COOLING_OFF", "This instance is giving that website a rest after it asked us to slow down", "Your group's Civicsmith is giving that website a rest after it asked us to slow down"],
  ["checks.mjs:131", "RENDER_AT_CAPACITY", "This instance is already rendering as many pages at once as it allows", "Your group's Civicsmith is already rendering as many pages at once as it allows"],
  ["checks.mjs:155", "DRIVE_HOP_FACT_SUPPLIED", "Those are facts this instance establishes by doing the fetch itself", "Those are facts your group's Civicsmith establishes by doing the fetch itself"],
  ["checks.mjs:183", "DRIVE_SHAPE_UNRECOGNISED", "a Google Drive address in a form this instance does not recognise", "a Google Drive address in a form your group's Civicsmith does not recognise"],
  ["checks.mjs:212", "DRIVE_EXPORT_BYTES_ARE_THE_SHELL", "This instance checks the bytes rather than taking the label", "Your group's Civicsmith checks the bytes rather than taking the label"],
  ["checks.mjs:226", "EVIDENCE_STORAGE_NOT_CONFIGURED", "This copy was installed without the storage it keeps captured documents in", "Your group's Civicsmith was installed without the storage it keeps captured documents in"],
  ["checks.mjs:227", "EVIDENCE_STORAGE_NOT_CONFIGURED", "That is a fact about how the copy was set up", "That is a fact about how your group's Civicsmith was set up"],
  ["checks.mjs:242", "SWEEP_SCOPE_MISSING", "A sweep asked this instance to fetch a document", "A sweep asked your group's Civicsmith to fetch a document"],
];

for (const [at, code, was, now] of ROWS)
  test(`R29 (DEC-149, ${at}): ${code}'s translation says "${now}", never "${was}"`, () => {
    assert.ok(tr(code).includes(now), tr(code));
    assert.ok(!tr(code).includes(was));
  });

test("R29 (DEC-149): no row this module holds speaks of \"this instance\" or \"this copy\"; each sentence that names the copy names your group's Civicsmith", () => {
  for (const [code, row] of Object.entries(ACQUISITION_CHECKS)) assert.doesNotMatch(row.translation, OLD, code);
  assert.equal(ROWS.length, 12, "the sweep's twelve checks.mjs rows");
});

test("R29 (DEC-149, index.mjs:569): acquire without evidence storage says \"your group's Civicsmith has no evidence storage configured\", never \"this instance has no evidence storage configured\"", async () => {
  const r = await run(world({ evidence: false }), {}, { locator: "https://a.example/x" });
  assert.equal(r.body.error, "your group's Civicsmith has no evidence storage configured");
  assert.doesNotMatch(JSON.stringify(r.body), OLD);
});

test("R1 (DEC-149, index.mjs:577): the capture-request arm's refusal says \"your group's Civicsmith fetches a requested document only from inside its own drain\"", async () => {
  const r = await run(world(), {}, { via: "capture-request", locator: "https://a.example/x" });
  assert.match(r.body.detail, /^your group's Civicsmith fetches a requested document only from inside its own drain/);
  assert.doesNotMatch(r.body.detail, /this instance fetches a requested document/);
});

test("R4 (DEC-149, index.mjs:658): a supplied hop fact's refusal says the facts are \"DERIVED by your group's Civicsmith\"", async () => {
  const r = await run(world(), {}, { locator: "https://docs.google.com/document/d/1AbCdEfGhIjKlMnOp/edit", export_address: "https://x.example/" });
  assert.equal(r.body.reason, "DRIVE_HOP_FACT_SUPPLIED");
  assert.match(r.body.detail, /the producer are DERIVED by your group's Civicsmith from the file id/);
  assert.doesNotMatch(r.body.detail, /DERIVED by this instance/);
});

test("R5 (DEC-149, index.mjs:752): a render over the concurrency cap says \"renders are running in your group's Civicsmith, which runs at most\"", async () => {
  const env = { RENDERER: { fetch: async () => new Response("{}") } };
  const w = world({ env });
  for (let i = 0; i < 10; i++) w.store.renderAdmit({ allowanceMs: 1e12, reserveMs: 1000, cap: 10 });
  const r = await run(w, {}, { locator: "https://a.example/x", render: true });
  assert.equal(r.body.reason, "RENDER_AT_CAPACITY");
  assert.match(r.body.detail, /^\d+ renders are running in your group's Civicsmith, which runs at most \d+ at once; /);
  assert.doesNotMatch(r.body.detail, /running on this instance/);
});

test("R4 (DEC-149, index.mjs:878): an unreachable Drive export says the export address \"your group's Civicsmith composed from the\" document's id", async () => {
  const exp = "https://docs.google.com/document/d/1AbCdEfGhIjKlMnOp/export?format=odt";
  const r = await run(world(), { [exp]: new Response("no", { status: 404 }) }, { locator: "https://docs.google.com/document/d/1AbCdEfGhIjKlMnOp/edit" });
  assert.equal(r.body.reason, "DRIVE_EXPORT_UNREACHABLE");
  assert.match(r.body.detail, /, which your group's Civicsmith composed from the document id in /);
  assert.doesNotMatch(r.body.detail, /which this instance composed/);
});

test("R36 (DEC-149, keyed.mjs:65): an unknown keyed service's refusal says \"the keyed services your group's Civicsmith speaks to are\"", async () => {
  const r = await keyedFetch({}, { service: "nowhere" });
  assert.equal(r.reason, "UNKNOWN_KEYED_SERVICE");
  assert.match(r.detail, /^the keyed services your group's Civicsmith speaks to are courtlistener; nothing was fetched$/);
  assert.doesNotMatch(r.detail, /this copy/);
});
