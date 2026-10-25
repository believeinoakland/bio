/* screens-intake R1–R3, R21–R25: the `capture` screen on the real served page (interface-shell's harness), its three tabs and
 * six acts as a member uses them, over the REAL store (fix round 10, K5054): the members are signed in by the real acts, an address is answered by the
 * world's network (an environment double, scripted: the bytes a site would serve), and `heldat`, `acquire`, `allocid`, `promote`, `captureupload`, `monitor`,
 * `monitorset`, `capturerequest`, `testify`, `opencaptures`, `heldcaptures`, `search` and `image` are the owners' own. What a test needs of a capture (its digest, the
 * document it was filed as, its title) it reads from what the page sent or from the owners' answers, never from a literal. A fault (an owner's refusal the real
 * acts cannot make, a silence, a held answer) is the only scripted answer, and each one says why. A sentence is asserted by its key through `setup-words` (R26),
 * never by its English. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { openWorld, members, dayOf, html, text, main, btn, fill, press, idle, ok, refused, refusedIn, rawKeys, word, hasWord, says, saysIn, DOCUMENT_STUB } from "./page.mjs";
import { silent, pending } from "../interface-shell/harness.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";
import { generate } from "../../pdfgen.mjs";

const CAN = ["contribute", "create_projects"];
const screens = [...SCREENS, DOCUMENT_STUB];
const failed = (p) => main(p).querySelector('[data-state="failed"][role="alert"]');

const ADDRESS = "https://www.example.gov/reports/street-maintenance-2026.pdf";
/* an address with no file part: a document found there with no title of its own is named by its host and the day it was captured (R54) */
const BARE = "https://www.example.gov/reports/";
/* the bytes a site serves at the address: a real PDF, so the owners read it as one */
const PDF = await generate({ kind: "pdf", seed: "street-maintenance-2026", size: { pages: 2, lines: 3 }, kinds: ["text"] }).bytes();
const sha256 = (t) => createHash("sha256").update(t).digest("hex");
const SHA = sha256(PDF);
const notice = (title) => `<html><head>${title === undefined ? "" : `<title>${title}</title>`}</head><body><p>The housing office posted this notice.</p></body></html>`;
/* the world's network answers an address with what a site would serve (store-assembly R94) */
const serve = (world, address = ADDRESS, body = PDF, type = "application/pdf", status = 200) =>
  world.script(address, async () => new Response(body.slice ? body.slice() : body, { status, headers: { "content-type": type } }));
const team = async (spec = { mai: CAN }, opts = {}) => members(spec, opts);
const at = (t, path = "/app/capture", plane = {}, as = t.mai, rest = {}) => openWorld(path, { world: t.world, as, plane, screens, ...rest });
/* the member's own press of "Capture it" on the address */
const capture = async (p, address = ADDRESS) => { fill(p, { "ci-address": address }); return press(p, "acquire"); };
/* what the page filed: the promote request it sent for the capture (its own, read from the request) */
const promoted = (p, n = 0) => p.byOp("promote")[n].body;
const mdOf = (p, n = 0) => promoted(p, n).files.find((f) => f.path === "bundle.md").text;
const YEAR = String(new Date().getUTCFullYear());
const slugOf = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40).replace(/-$/, "");
const idOf = (slug) => new RegExp(`^INFO-${YEAR}-\\d{4}-${slug}$`);
/* the owner's answer to a request the page could make, asked as a member of another world (so no governor or session of the page's world is touched) */
const refusalOf = async (spec, body, serveIt) => {
  const t = await team();
  if (serveIt) serveIt(t.world);
  try { await t.mai.act("acquire", { body }); } catch (e) { return JSON.parse(e.message.slice(e.message.indexOf("{"))); }
  throw new Error("the owner did not refuse");
};
/* record-grammar's canonical JSON, restated here for flat documents: keys sorted, no space */
const canon = (v) => Array.isArray(v) ? `[${v.map(canon).join(",")}]` : v && typeof v === "object"
  ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canon(v[k])}`).join(",")}}` : JSON.stringify(v);
/* what `ratification` R22 asks of a bundle for `verified` (`release.mjs`:192–197), asked of a promote request's files */
const entryMissing = (files) => {
  const md = files.find((f) => f.path === "bundle.md").text;
  const ch = /^content_hash: (.*)$/m.exec(md);
  return [!(ch && /^sha256:[0-9a-f]{64}$/.test(ch[1])) && "content_hash", !files.some((f) => f.path === "data/dataset.json") && "dataset",
          !files.some((f) => f.path.startsWith("snapshots/")) && "snapshots"].filter(Boolean);
};

test("R26 every key the capture screen reads is a word of the list", async () => {
  const { SCREENS } = await import("../../../src/screens-intake/index.mjs");
  const keys = SCREENS.find((s) => s.id === "capture").words;
  assert.ok(keys.length > 60);
  for (const k of keys) assert.ok(hasWord(k), k);
  assert.ok(Object.isFrozen(keys));
});

test("R1 R16 the address tab draws acquire, capturerequest, and the two watching acts, monitorset and monitor", async () => {
  const t = await team();
  serve(t.world);
  const p = await at(t, "/app/capture/address");
  for (const op of ["acquire", "capturerequest"]) assert.ok(btn(p, op), op);
  assert.ok(!btn(p, "monitorset") && !btn(p, "monitor"), "R18: watching waits for a captured address");
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  for (const op of ["acquire", "capturerequest", "monitorset", "monitor"]) assert.ok(btn(p, op), op);
  assert.ok(btn(p, "monitorset").textContent.includes(word("act.monitorset.label.capture")));
  assert.ok(btn(p, "monitor").textContent.includes(word("act.monitor.label.capture")));
  /* the frequency is a word of MONITOR_FREQ (monitoring R14), "none" never offered for watching */
  const opts = p.doc.getElementById("ci-freq").querySelectorAll("option").map((o) => o.getAttribute("value"));
  assert.deepEqual(opts.sort(), ["daily", "hourly", "monthly", "per_meeting", "weekly"]);
  assert.deepEqual(rawKeys(p), []);
});

test("R1 R25 acquire sends the address as the locator; an empty address sends nothing and draws capture.fieldneeded with its label", async () => {
  const t = await team();
  serve(t.world);
  const p = await at(t);
  fill(p, { "ci-address": `  ${ADDRESS} ` });
  await press(p, "acquire");
  assert.deepEqual(p.byOp("acquire").map((r) => r.body), [{ locator: ADDRESS }]);
  const q = await at(t);
  const r = await press(q, "acquire");
  assert.equal(q.byOp("acquire").length, 0);
  assert.ok(saysIn(r.slot(), "capture.fieldneeded", { field: word("screen.capture.address.label") }));
  /* control: the same word for the other acts that read the address */
  const e = await at(t);
  assert.ok(saysIn((await press(e, "capturerequest")).slot(), "capture.fieldneeded", { field: word("screen.capture.address.label") }));
  assert.equal(e.byOp("capturerequest").length, 0);
});

test("R1 R25 each of acquire's five refusals is drawn by its key beside the address; any other code is the shell's (R13)", async () => {
  const seen = new Set();
  /* the five are the ones the screen declares by key (BAD_FOR is a function of its own, R29) */
  const own = SCREENS.find((x) => x.id === "capture").acts.find((a) => a.op === "acquire").refusals;
  const codes = Object.keys(own).filter((c) => typeof own[c] === "string");
  assert.equal(codes.length, 5);
  /* each is caused by a real act: an address that is not https on a public host, a site that refuses (403), no site at all, a site that serves nothing, and a source that declares more than a capture takes */
  const NOWHERE = "https://nowhere.example/a.pdf", FORBIDDEN = "https://forbidden.example/a.pdf", EMPTY = "https://empty.example/a.pdf", HUGE = "https://huge.example/a.pdf";
  const sites = (w) => {
    serve(w, FORBIDDEN, "no", "text/plain", 403);
    serve(w, EMPTY, "", "application/pdf");
    w.script(HUGE, async () => new Response("xx", { status: 200, headers: { "content-type": "application/pdf", "content-length": String(400 * 1024 * 1024) } }));
  };
  const causes = { BAD_LOCATOR: "ftp://files.example/a.pdf", SOURCE_REFUSED: FORBIDDEN, FETCH_FAILED: NOWHERE, EMPTY, TOO_LARGE: HUGE };
  for (const code of codes) {
    const owner = await refusalOf(null, { locator: causes[code] }, sites);
    assert.equal(owner.reason, code, `the owner refuses ${causes[code]} with ${code}`);
    assert.ok(hasWord(own[code]), code);
    const t = await team();
    sites(t.world);
    const p = await at(t);
    const r = await capture(p, causes[code]);
    await idle(p);
    assert.ok(saysIn(r.slot(), own[code]), code);
    if (typeof owner.detail === "string" && owner.detail) assert.ok(!r.slot().textContent.includes(owner.detail), `${code}: the owner's detail is never drawn`);
    seen.add(r.slot().textContent);
  }
  assert.equal(seen.size, 5, "five distinct sentences");
  /* control: a code outside the five is drawn by the shell's rule: the table's word for it (K3810: compared with the row by key). The owner's governor holds
     the host after its refusal (HOST_COOLING_OFF), so the same press again is answered with it */
  const t = await team();
  serve(t.world, FORBIDDEN, "no", "text/plain", 403);
  const p = await at(t);
  await capture(p, FORBIDDEN);
  const r = await capture(p, FORBIDDEN);
  assert.ok(hasWord("refusal.HOST_COOLING_OFF"));
  assert.ok(saysIn(r.slot(), "refusal.HOST_COOLING_OFF"));
  assert.doesNotMatch(r.slot().textContent, /per-host governor/);
});
