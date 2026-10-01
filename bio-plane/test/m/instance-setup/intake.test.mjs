/* R45 (N397, K573; D-62): the intake form's bundle writer states a captured document's digest as `content_hash`, and
   R46 (D-110): the form explains each capture refusal the plane makes, and none it no longer makes. Driven at the
   page's interface: the served page's script in the fixture's sandbox, its intake form filled and saved against
   scripted `acquire`, `attest`, `allocid` and `promote` answers; what it sends to `promote` is checked by
   record-grammar's `checkBundle` with capture's C-2.7 grammar in its slot (capture R37, K767), the one authority over
   C-2.7 the record registers. Carries `bio-plane/test/setup-honesty.test.mjs`; that suite's
   source-text arms (the emission's spelling and guard, a token's absence from the served bytes) are dropped (P7). */
import test from "node:test";
import assert from "node:assert/strict";
import { setupPage } from "../../../src/setup.mjs";
import { checkBundle, createSha256 } from "../../../src/record-grammar/index.mjs";
import { INFORMATION_GRAMMAR } from "../../../src/capture/index.mjs";
import { pageOver } from "./fixture.mjs";

const tick = () => new Promise((r) => setTimeout(r, 0));
const settle = async () => { for (let i = 0; i < 20; i++) await tick(); };
const enc = (s) => new TextEncoder().encode(s);
const shaHex = async (s) => createSha256().update(typeof s === "string" ? enc(s) : s).hex();

/* The page signed in as a contributor; `acquire(body)` scripts the capture's answer, and `promoted` records what the
   form sent to op=promote. */
async function intake({ acquire = null } = {}) {
  const promoted = [], acquired = [];
  const fetch = async (url, init) => {
    const u = new URL(url, "https://copy.example");
    const op = u.searchParams.get("op");
    const body = init && init.body ? JSON.parse(init.body) : null;
    let out = { result: { ok: true } };
    if (op === "bootstrap") out = { claimed: true, version: "v1" };
    else if (op === "whoami") out = { result: { capabilities: ["contribute"], administer: false } };
    else if (op === "allocid") out = { result: { id: "INFO-2026-0001" } };
    else if (op === "acquire") { acquired.push(body); out = await acquire(body); }
    else if (op === "attest") out = { attempts: [] };
    else if (op === "promote") { promoted.push(body); out = { result: { ok: true } }; }
    else if (op === "image") out = { result: {} };
    return { ok: true, status: 200, json: async () => out };
  };
  const p = pageOver({ html: setupPage({ answered: true, result: { ok: true, group: "river-town" } }),
                       session: { t: "sess-1", e: 0, w: "ada" }, fetch });
  await settle();
  const save = async ({ title = "A captured document", body = "what the member wrote", loc = "", auth = "" } = {}) => {
    p.el("#n-type").value = "information"; p.el("#n-title").value = title; p.el("#n-body").value = body;
    p.el("#n-loc").value = loc; p.el("#n-auth").value = auth;
    await p.el("#n-save").fire(); await settle();
    return p.el("#n-err").textContent;
  };
  return { ...p, promoted, acquired, save };
}

/* The C-2.7 finding the D-62 defect raised, over a bundle as the release flow would hold it at `verified`: judged by
   record-grammar's checkBundle with capture's grammar registered, as the record registers it (capture R37). */
const C27_HASH = /requires a well-formed content_hash/;
const GRAMMARS = [{ module: "capture", ...INFORMATION_GRAMMAR }];
const verifiedFindings = async (md) => {
  const text = md.replace(/^current_state: .*$/m, "current_state: verified");
  const { findings } = await checkBundle({ files: new Map([["bundle.md", text]]), folderName: "INFO-2026-0001-doc",
    sha256: shaHex, nowMs: Date.parse("2026-09-30T00:00:00Z") }, { grammars: GRAMMARS });
  return findings.filter((x) => x.check === "C-2.7");
};

test("R45 a bundle written from the intake form with a captured document states content_hash: sha256:<the capture's own digest>, and so clears C-2.7's verified-state content_hash requirement", async () => {
  const docSha = await shaHex(enc("the captured document bytes"));
  const doc = { file: "captures/doc.pdf", capture: { sha256: docSha, bytes: 27, encoding: "binary" } };
  const p = await intake({ acquire: () => ({ ok: true, document: doc }) });
  assert.equal(await p.save({ loc: "https://example.org/doc.pdf", auth: "City Auditor" }), "");
  assert.deepEqual(p.acquired, [{ locator: "https://example.org/doc.pdf", authority: "City Auditor" }]);
  assert.equal(p.promoted.length, 1);
  const md = p.promoted[0].files.find((f) => f.path === "bundle.md").text;
  assert.deepEqual(md.match(/^content_hash: .*$/gm), [`content_hash: sha256:${docSha}`]);
  assert.match(md, /^schema: information@2$/m);
  assert.deepEqual((await verifiedFindings(md)).filter((f) => C27_HASH.test(f.message)), []);
  assert.deepEqual((await verifiedFindings(md)).filter((f) => /content_hash/.test(f.message)), []);
  /* the writer itself, for every document digest it is handed */
  for (const sha of [docSha, "0".repeat(64)])
    assert.match(p.ui.mdFor("INFO-2026-0002-x", "information", "collected", "t", "b", "2026-09-30T00:00:00Z", true,
                            { content_hash: sha }, null), new RegExp(`\\ncontent_hash: sha256:${sha}\\n`));
});

test("R45 typed intake, with no document, writes no content_hash: none is invented, and the same bundle advanced to verified is refused by C-2.7 for the missing hash, by name", async () => {
  const p = await intake();
  assert.equal(await p.save(), "");
  assert.deepEqual(p.acquired, []);
  const md = p.promoted[0].files.find((f) => f.path === "bundle.md").text;
  assert.doesNotMatch(md, /content_hash/);
  assert.match(md, /^schema: information@1$/m);
  /* the refusal D-62 was about: a verified bundle with no hash is refused by C-2.7 by name */
  assert.equal((await verifiedFindings(md)).filter((f) => C27_HASH.test(f.message)).length, 1);
  for (const src of [null, {}, { content_hash: "" }, { content_hash: null }])
    assert.doesNotMatch(p.ui.mdFor("INFO-2026-0002-x", "information", "collected", "t", "b", "2026-09-30T00:00:00Z",
                                   false, src, null), /content_hash/, JSON.stringify(src));
  /* only an information bundle carries it */
  for (const type of ["inquiry", "project", "action"])
    assert.doesNotMatch(p.ui.mdFor("X", type, "draft", "t", "b", "2026-09-30T00:00:00Z", false, { content_hash: "a".repeat(64) },
                                   { counterparty: { state: "undetermined", basis: "b" } }), /content_hash/, type);
});

test("R46 the intake form states each capture refusal acquire makes in its own sentence and writes nothing; any other reason, the removed NO_AUTHORITY included, is stated by its code and never explained", async () => {
  const REFUSALS = {
    BAD_LOCATOR: [{ reason: "BAD_LOCATOR" }, /cannot be fetched[^]*https address on a public site/],
    SOURCE_REFUSED: [{ reason: "SOURCE_REFUSED", status: 403 }, /answered with an error \(403\)/],
    FETCH_FAILED: [{ reason: "FETCH_FAILED" }, /could not be reached just now\. Nothing was written\./],
    EMPTY: [{ reason: "EMPTY" }, /returned an empty document/],
    TOO_LARGE: [{ reason: "TOO_LARGE", bytes: 999 }, /too large to capture this way \(999 bytes\)/],
  };
  for (const [code, [answer, sentence]] of Object.entries(REFUSALS)) {
    const p = await intake({ acquire: () => ({ ok: false, ...answer }) });
    const err = await p.save({ loc: "https://example.org/doc", auth: "City Auditor" });
    assert.match(err, sentence, code);
    assert.doesNotMatch(err, new RegExp(code), code);
    assert.equal(p.promoted.length, 0, code);
  }
  for (const code of ["NO_AUTHORITY", "SOMETHING_NEW"]) {
    const p = await intake({ acquire: () => ({ ok: false, reason: code }) });
    assert.equal(await p.save({ loc: "https://example.org/doc", auth: "City Auditor" }),
                 `The document could not be captured: ${code}`);
    assert.equal(p.promoted.length, 0);
  }
  /* D-97 removed the refusal: nothing in the form's sentence for it asks the member to name the issuer */
  const p = await intake();
  assert.match(p.ui.acquireWhy({ reason: "NO_AUTHORITY" }), /^The document could not be captured: NO_AUTHORITY$/);
  assert.doesNotMatch(p.ui.acquireWhy({ reason: "NO_AUTHORITY" }), /Say who issued/);
});
