/* screens-publish, T51 fix round 4 (K4429), the seam tests: the page's own act into the real merged provider, no scripted double of it.
 * C28 (R9): "Hand it over" through the page into the real doorbell, and the Inbox list the real doorbell answers. */
import { registerDeclared } from "../../declared-ops.mjs";
import { registerDeclaredOps } from "../../../src/op-declarations/index.mjs";
await registerDeclared(new URL("../../../../", import.meta.url).pathname, registerDeclaredOps);
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, press, choose, until, last } from "./fixtures.mjs";
import { fresh, bucket } from "../doorbell/fixture.mjs";
import { doorbellOps } from "../../../src/doorbell/index.mjs";
import { knockOp } from "../../../src/doorbell/door.mjs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const doAnswer = async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
  return out && out.ok === true ? { answered: true, result: out.result } : { answered: false, result: undefined }; };
const helpers = { json, requiredArgument: (op, argument, shape, error) => ({ reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error }),
  storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502), doAnswer };

/* the real doorbell behind the page's `knock`: the control plane's own door handler over the module's store routes */
function doorbell() {
  const f = fresh({ evidence: bucket(), env: { INSTANCE_NAME: "inst" } });
  const store = { async fetch(req) {
    const url = new URL(req.url), body = req.method === "POST" ? JSON.parse(await req.text() || "null") : null;
    return json({ ok: true, result: await doorbellOps(f.c, url, body)[url.pathname.slice(1)]() });
  } };
  let n = 0;
  const knock = async (req) => {
    const res = await knockOp(new Request("https://plane/?op=knock", { method: "POST", headers: { "cf-connecting-ip": `203.0.113.${++n}` }, body: JSON.stringify(req.body) }), f.c.env, store, helpers);
    return { status: res.status, json: await res.json() };
  };
  return { f, knock };
}
const PUBLIC = { session: null };

test("R9 C28 through the page into the real doorbell, a JPEG named notice.jpg is handed in and the Inbox row carries file_name and media_type image/jpeg; the detail carries them too", async () => {
  const d = doorbell();
  const p = await open("/app/doorbell", { boot: PUBLIC, plane: { knock: d.knock } });
  choose(p, "db-file", new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]), "notice.jpg", "image/jpeg");
  await press(p, "knock");
  await until(p, () => d.f.c.inboxList(null).inbox.length > 0);
  const sent = last(p, "knock").body;
  assert.equal(sent.fileName, "notice.jpg");
  assert.equal(sent.mediaType, "image/jpeg");
  const id = d.f.c.inboxList(null).inbox[0];
  assert.equal(id.file_name, "notice.jpg");
  assert.equal(id.media_type, "image/jpeg");
  const got = d.f.c.inboxGet(id.knock_id).item;
  assert.deepEqual([got.file_name, got.media_type], ["notice.jpg", "image/jpeg"]);
});

test("R9 C28 control: a file that states no type sends no mediaType, and the row's type is absent (null)", async () => {
  const d = doorbell();
  const p = await open("/app/doorbell", { boot: PUBLIC, plane: { knock: d.knock } });
  choose(p, "db-file", new Uint8Array([1, 2, 3]), "memo.bin");
  await press(p, "knock");
  await until(p, () => d.f.c.inboxList(null).inbox.length > 0);
  const sent = last(p, "knock").body;
  assert.equal(sent.fileName, "memo.bin");
  assert.ok(!("mediaType" in sent));
  assert.equal(d.f.c.inboxList(null).inbox[0].media_type, null);
});

/* ---------- C47 (R80, R76): the evidence entry names the document and the paragraph; no stray separator ---------- */
import { main, text, drew, drewIn, FINDING, publishedPlane, findingPath, leg, word, C } from "./fixtures.mjs";

test("R80 R76 C47 the case page names an evidence entry by the document's title and the paragraph it cites, and a finding stating only its role draws no trailing separator", async () => {
  const f = FINDING("FND-2026-0031", { strength: [], standing: { role: "load_bearing", bar: null, meets: null },
    basis: [leg("INFO-2026-0004", "supports", "B", "capture", { document: { name: "FOIA frequently asked questions", place: { kind: "doc-para", para: 3 } } }),
      leg("INFO-2026-0005", "supports", "B", "capture", { document: { name: "FOIA frequently asked questions", place: { kind: "pdf-page", page: 1 } } })] });
  const p = await open(`/app/published/${encodeURIComponent(C + "/2")}`, { boot: PUBLIC, plane: publishedPlane([f]) });
  const names = [...main(p).querySelectorAll("[data-evidence-names] li")].map((li) => li.textContent.replace(/\s+/g, " ").trim());
  assert.equal(names.length, 2);
  assert.ok(names[0].includes("FOIA frequently asked questions") && names[0].includes(word("screen.question.leg.paragraph", { n: "4" })), "Paragraph 4, counted from the zero of the file");
  assert.ok(names[1].includes(word("screen.document.passage.where", { page: "2" })), "a page of a PDF is still a page");
  const card = main(p).querySelectorAll("[data-finding] p")[1].textContent.replace(/\s+/g, " ").trim();
  assert.equal(card, word("case-grammar.load_bearing"), "the role alone, no trailing separator");
});

test("R80 C47 control: a finding that states its role and both grades keeps the separator between the role and the grades only", async () => {
  const p = await open(`/app/published/${encodeURIComponent(C + "/2")}`, { boot: PUBLIC, plane: publishedPlane([FINDING("FND-2026-0031")]) });
  const card = main(p).querySelectorAll("[data-finding] p")[1].textContent.replace(/\s+/g, " ").trim();
  assert.ok(card.startsWith(word("case-grammar.load_bearing") + " · ") && !/·\s*$/.test(card));
});
