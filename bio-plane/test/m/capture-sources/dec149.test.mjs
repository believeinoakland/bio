/* capture-sources: the DEC-149 wording of plan entry T35-20 (N691; `build/plan/draft-T35-dec149-l1-l7.md`), tested at
 * the module's interface. Each of the entry's nineteen strings is reached through the service that answers it and
 * named here by its source line on `tranche/T34`; member-facing text says "your group's Civicsmith" (or "your group")
 * and never "the plane", "this plane", "this instance" or "the instance". The five rows of
 * `capture-sources/credentials.mjs` are tested beside the credentials' world, in `credentials.test.mjs`. The wording
 * changes no requirement (plan rule 4); each test names the requirement whose answer carries the string. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readDriveAddress, driveHop, classifyDriveBaseline } from "../../../src/drive.mjs";
import { keepRenderBodies, renderBlock } from "../../../src/render.mjs";
import { mementoHop, readMementoAnswer, mementoRow } from "../../../src/capture-sources/memento.mjs";
import { selectCapture } from "../../../src/cdx.mjs";

const OLD = /\b(?:the|this) (?:plane|instance)\b/i;
const CIVICSMITH = "your group's Civicsmith";
const ID = "1AbCdEfGhIjKlMnOpQrStUvWxYz_-0123456789";
const DOC = `https://docs.google.com/document/d/${ID}/edit`;
const EXPORT = `https://docs.google.com/document/d/${ID}/export?format=odt`;
const drive = readDriveAddress(DOC);
const row = (locator, profile = {}) => ({ locator, profile, capture: { sha256: "b".repeat(64) }, retrieved: "2026-09-01T00:00:00Z" });
const fromExport = [{ address: DOC, via: "direct", retrieval_locator: EXPORT }];
const fromPage = [{ address: DOC, via: "direct", retrieval_locator: null }];
const html = { format: { format: "html" } }, odt = { format: { format: "odt" } };

test("R40 (DEC-149, drive.mjs:216): an unread Drive shape is not a document your group's Civicsmith can promise to have captured", () => {
  const v = readDriveAddress("https://drive.google.com/some/new/shape");
  assert.equal(v.shape, "unknown");
  assert.ok(v.why.endsWith(`A Drive address whose shape is unread is not a document ${CIVICSMITH} can promise to have captured.`), v.why);
  assert.doesNotMatch(v.why, OLD);
});

test("R42 (DEC-149, drive.mjs:254): the export address was COMPOSED BY YOUR GROUP'S CIVICSMITH", () => {
  const h = driveHop(drive, { retrieved: "2026-09-27T01:00:00Z" });
  const line = h.evidence.split("; ").find((p) => p.startsWith("the export address was COMPOSED BY"));
  assert.equal(line, `the export address was COMPOSED BY YOUR GROUP'S CIVICSMITH from the file id and the kind carried in ${DOC}, `
    + "and no part of it was read from the request (D-112)");
  assert.doesNotMatch(h.evidence, OLD);
});

test("R46 (DEC-149, drive.mjs:444, :445, :448, :449, :451, :454, :456, :458): every basis names your group's Civicsmith", () => {
  const said = { html: "the register's profile says HTML", odt: "the register's profile says odt", none: "the register's profile names no format" };
  const cases = [
    [":444", [row(EXPORT, html)], fromExport,
      `${CIVICSMITH} recorded fetching the export address, but ${said.html}; the two disagree and neither is taken over the other`],
    [":445", [row(EXPORT, odt)], fromExport, `${CIVICSMITH} recorded fetching the export address ${EXPORT} (CAP-8), and ${said.odt}`],
    [":448", [row(DOC, odt)], fromPage,
      `${CIVICSMITH} recorded fetching ${DOC}, not the export, but ${said.odt}; the two disagree and neither is taken over the other`],
    [":449", [row(DOC)], fromPage,
      `${CIVICSMITH} recorded fetching ${DOC}, not the export address — Google serves the application there, not the document — and ${said.none}`],
    [":451", [row(DOC)], [...fromExport, { address: DOC, via: "direct", retrieval_locator: DOC }],
      `${CIVICSMITH} recorded these bytes from BOTH the export and ${EXPORT}; which one the baseline is cannot be told`],
    [":454", [row(EXPORT, odt)], [], `the register row names the export address and ${said.odt}; ${CIVICSMITH} holds no retrieval record for these bytes`],
    [":456", [row(DOC, html)], [],
      `${said.html} for a row at the document address; ${CIVICSMITH} holds no retrieval record for these bytes, so this rests on the register alone`],
    [":458", [row(DOC)], [], `${CIVICSMITH} holds no direct retrieval record for these bytes and ${said.none}`],
  ];
  for (const [line, rows, retrievals, basis] of cases) {
    const v = classifyDriveBaseline({ drive, locator: DOC, rows, retrievals });
    assert.equal(v.basis, basis, line);
    assert.doesNotMatch(v.basis, OLD, line);
  }
});

const ANSWER = { ok: true, html: "<html></html>", navigated_to: "https://portal.example.gov/a", status: 200,
  requests: [{ url: "https://portal.example.gov/a.json", type: "xhr", outcome: "completed", body_text: "{}", body_as: "decoded_text" }],
  scripts: [], wait: { condition: { until: "networkidle", timeout_ms: 15000 }, fired: "networkidle" } };

test("R9 (DEC-149, render.mjs:343): bytes that could not be kept say your group's Civicsmith could not keep them", async () => {
  const [entry] = await keepRenderBodies(ANSWER, { put: async () => { throw new Error("store full"); }, sha256: async () => "c".repeat(64) });
  assert.equal(entry.sha256, "undetermined");
  assert.equal(entry.digest_reason, `${CIVICSMITH} could not keep the bytes (store full)`);
  assert.doesNotMatch(entry.digest_reason, OLD);
});

test("R12 (DEC-149, render.mjs:384): with no digests passed, your group's Civicsmith did not keep this render's subresource bytes", () => {
  const b = renderBlock(ANSWER, { pageUrl: "https://portal.example.gov/a", shellSha: "0".repeat(64), at: "2026-10-07T00:00:00Z" });
  assert.equal(b.render.subresources[0].sha256, "undetermined");
  assert.equal(b.render.subresources[0].digest_reason, `${CIVICSMITH} did not keep this render's subresource bytes`);
  assert.doesNotMatch(JSON.stringify(b.render), OLD);
});

test("R14 (DEC-149, render.mjs:480): a wait word never seen is neither the condition your group's Civicsmith asked for nor a timeout", () => {
  const b = renderBlock({ ...ANSWER, wait: { fired: "dom_settled" } },
    { pageUrl: "https://portal.example.gov/a", shellSha: "0".repeat(64), at: "2026-10-07T00:00:00Z" });
  assert.equal(b.render.completeness, "undetermined");
  const said = b.render.undetermined.find((u) => u.startsWith("completeness:"));
  assert.ok(said.includes("the renderer reported the wait fired on `dom_settled`, which is neither the `networkidle` condition "
    + `${CIVICSMITH} asked for nor a timeout`), said);
  assert.doesNotMatch(said, OLD);
});

test("R37 (DEC-149, memento.mjs:256): the memento's digest is computed by your group's Civicsmith over the bytes it received", () => {
  const SHA = "a".repeat(64), ORIG = "https://records.example.gov/m.pdf";
  const answer = readMementoAnswer({ url: `https://web.archive.org/web/20260303120000id_/${ORIG}`, status: 200,
    headers: { "Memento-Datetime": "Tue, 03 Mar 2026 12:00:00 GMT", Link: `<${ORIG}>; rel="original"` } });
  const chosen = selectCapture([mementoRow(answer, { sha256: SHA, bytes: 10 })]).chosen;
  const h = mementoHop(chosen, answer.memento_uri, { answer });
  assert.ok(h.evidence.includes(`SHA-256 ${SHA}, computed by ${CIVICSMITH} over the bytes it received, not a digest the archive stated`), h.evidence);
  assert.doesNotMatch(h.evidence, OLD);
});
