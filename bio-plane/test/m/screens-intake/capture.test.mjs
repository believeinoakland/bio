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
  /* four are caused by a real act: a site that refuses (403), no site at all, a site that serves nothing, and a source that declares more than a capture takes. The fifth, BAD_LOCATOR,
     is the owner's refusal of an address that is not a public https one; `heldat`, which the press asks first, refuses such an address before `acquire` is ever sent
     (REQUIRED_ARGUMENT_MISSING), so no real press reaches it: it stays the one scripted answer (a fault) */
  const NOWHERE = "https://nowhere.example/a.pdf", FORBIDDEN = "https://forbidden.example/a.pdf", EMPTY = "https://empty.example/a.pdf", HUGE = "https://huge.example/a.pdf";
  const sites = (w) => {
    serve(w, FORBIDDEN, "no", "text/plain", 403);
    serve(w, EMPTY, "", "application/pdf");
    w.script(HUGE, async () => new Response("xx", { status: 200, headers: { "content-type": "application/pdf", "content-length": String(400 * 1024 * 1024) } }));
  };
  const causes = { BAD_LOCATOR: ADDRESS, SOURCE_REFUSED: FORBIDDEN, FETCH_FAILED: NOWHERE, EMPTY, TOO_LARGE: HUGE };
  for (const code of codes) {
    const scripted = code === "BAD_LOCATOR";
    const owner = scripted ? { detail: "the owner's words" } : await refusalOf(null, { locator: causes[code] }, sites);
    if (!scripted) assert.equal(owner.reason, code, `the owner refuses ${causes[code]} with ${code}`);
    assert.ok(hasWord(own[code]), code);
    const t = await team();
    sites(t.world);
    const p = await at(t, "/app/capture", scripted ? { acquire: refused(code, owner.detail) } : {});
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

/* R1 (N747): an archive's members are promoted by the Worker door (control-plane R58, `promoteAcquired`), which the store-request world's door does not wire, so the real
   `acquire` of an archive here never answers `promoted`: that answer is the one scripted entry of this file for `acquire` (reported) */
const ARCHIVED = { ok: true, document: { capture: { sha256: SHA, bytes: PDF.length, encoding: "binary", content_type: "application/pdf" }, file: "snapshots/a.pdf", title: null },
                   promoted: [{ sha256: "b".repeat(64), bundleId: "INFO-2026-0002" }], not_promoted: [{ sha256: "c".repeat(64), code: "X" }] };
test("R1 (N747) an answer carrying promoted is not promoted again by the screen", async () => {
  const t = await team();
  const p = await at(t, "/app/capture", { acquire: ok(ARCHIVED) });
  await capture(p);
  assert.equal(p.byOp("allocid").length, 0);
  assert.equal(p.byOp("promote").length, 0);
  assert.ok(says(p, "screen.capture.address.archive", { filed: 1 }));
  assert.ok(says(p, "screen.capture.address.notpromoted", { count: 1 }));
});

test("R1 R21 R23 R24 (N747) an answer without promoted is promoted as an information bundle at collected that meets verified's entry, and links the document", async () => {
  const t = await team();
  serve(t.world);
  const p = await at(t);
  await capture(p);
  await p.settle();
  assert.deepEqual(p.byOp("allocid")[0].query, { op: "allocid", prefix: "INFO", year: YEAR });
  const b = promoted(p);
  assert.match(b.bundleId, idOf(slugOf(b.meta.title)), "the number is the owner's allocid, the slug the title's");
  const title = b.meta.title;
  assert.ok(title && title.length > 0);
  assert.equal(b.base, null);
  assert.equal(b.meta.object_type, "information");
  assert.equal(b.meta.current_state, "collected");
  const md = b.files.find((f) => f.path === "bundle.md");
  assert.match(md.text, /^schema: information@2$/m);
  assert.match(md.text, /^current_state: collected$/m);
  assert.match(md.text, /^## Summary$/m);
  assert.doesNotMatch(md.text, /^project:/m, "R22 control: a capture with no subject is filed under no project");
  assert.equal(md.bytes, Buffer.byteLength(md.text, "utf8"));
  assert.equal(md.sha256, sha256(md.text), "cs.digest over the UTF-8 bytes");
  assert.ok(b.files.some((f) => f.path === "data/provenance.json"));
  assert.equal(b.register.length, 1);
  assert.deepEqual([b.register[0].sha256, b.register[0].encoding, b.register[0].bytes], [SHA, "binary", PDF.length], "the register holds the bytes the site served");
  assert.match(b.register[0].path, /^snapshots\//);
  /* R23: every file `verified` names, a well-formed content_hash that the canonical dataset hashes to */
  assert.deepEqual(entryMissing(b.files), []);
  const ds = b.files.find((f) => f.path === "data/dataset.json");
  assert.equal(ds.text, canon(JSON.parse(ds.text)), "the dataset is written in its canonical form");
  assert.equal(JSON.parse(ds.text).documents[0].sha256, SHA);
  assert.match(md.text, new RegExp(`^content_hash: sha256:${sha256(ds.text)}$`, "m"));
  assert.equal(ds.sha256, sha256(ds.text));
  assert.equal(ds.bytes, Buffer.byteLength(ds.text, "utf8"));
  /* R21 R24: said only once the promotion answered; the result links the document it made, which the owner holds */
  assert.ok(says(p, "screen.capture.address.done", { title }));
  assert.ok(main(p).querySelector(`a[href*="${b.bundleId}"]`), "R24: the result links the document");
  assert.equal((await t.mai.read("heldat", { query: { sha256: SHA } })).copy.document, b.bundleId, "the owner holds the document the page promoted");
  /* control: a refused promote is drawn on the tab with the owner's words, says nothing waits, and links nothing. The owner's refusal of a bundle the page built is a
     fault no real press causes: the one scripted answer */
  const u = await team();
  serve(u.world);
  const q = await at(u, "/app/capture", { promote: refused("UNWORDED_PROMOTE_CODE", "The checks refused it.") });
  await capture(q);
  await q.settle();
  assert.match(text(q), /The checks refused it\./);
  assert.ok(!says(q, "screen.capture.address.done", { title }));
  assert.equal(main(q).querySelector('a[href*="INFO-"]'), null, "R24 control: a refused promotion draws no link");
  /* DEC-342: a code the table holds is drawn by its word, never by the builder's detail; a coded refusal with neither is the shell's uncatalogued path */
  assert.ok(hasWord("refusal.GATE_REFUSED"));
  const gt = await team();
  serve(gt.world);
  const g = await at(gt, "/app/capture", { promote: refused("GATE_REFUSED", "builder detail that is never drawn") });
  await capture(g);
  await g.settle();
  assert.ok(says(g, "refusal.GATE_REFUSED"));
  assert.doesNotMatch(text(g), /builder detail/);
  // fixtures-generic: NO_WORD_NO_TRANSLATION
  const bt = await team();
  serve(bt.world);
  const bare = await at(bt, "/app/capture", { promote: { status: 409, json: { ok: false, reason: "NO_WORD_NO_TRANSLATION", detail: "builder detail that is never drawn" } } });
  await capture(bare);
  await bare.settle();
  assert.ok(says(bare, "refusal.uncatalogued"));
  assert.ok(text(bare).includes("NO_WORD_NO_TRANSLATION"), "the code, as the act gave it");
  assert.doesNotMatch(text(bare), /builder detail/);
  /* control: a refusal with no words of its own is the shell's own failure word, never a silent tab */
  const nt = await team();
  serve(nt.world);
  const r = await at(nt, "/app/capture", { promote: ok({ ok: false }) });
  await capture(r);
  await r.settle();
  assert.ok(failed(r), "a failure with no words is still drawn as failed");
  assert.ok(!says(r, "screen.capture.address.done", { title }));
});

/* the file tab's pieces (R2): a photo, its three answers, and the bytes the member sends */
const PHOTO = "ÿØ photo bytes";
const FILE = new File([PHOTO], "Seminary Ave.jpg", { type: "image/jpeg" });
const USHA = sha256(Buffer.from(PHOTO, "utf8"));
const filled = { "ci-file": FILE, "ci-how-made": true, "ci-where": "6012 Seminary Ave, 4 October", "ci-what": "The pothole, still open." };
const STATEMENT = `${word("screen.capture.file.how")}: ${word("screen.capture.file.how.made")}\n`
  + `${word("screen.capture.file.where")}: 6012 Seminary Ave, 4 October\n${word("screen.capture.file.what")}: The pothole, still open.`;

test("R1 R21 (D29) an answer of ok: true that carries ok: false is a refusal at either step of a promotion, never a capture that waits", async () => {
  /* the owner's allocid and promote do not answer a nested refusal for the page's real request: the nested shape is a fault, the one scripted answer */
  const nested = (words) => refusedIn("NOT_NOW", words);
  for (const [plane, words] of [[{ allocid: nested("No number now.") }, "No number now."], [{ promote: nested("Not kept now.") }, "Not kept now."]]) {
    const t = await team();
    serve(t.world);
    const p = await at(t, "/app/capture", plane);
    await capture(p);
    await p.settle();
    assert.ok(!text(p).includes(word("screen.capture.address.done", { title: "\u0000" }).split("\u0000")[0]), `${words}: the capture is not said to wait`);
    assert.ok(failed(p), `${words}: drawn failed`);
    assert.equal(main(p).querySelector('a[href*="INFO-"]'), null, `${words}: no link`);
    const u = await at(t, "/app/capture/file", plane);
    fill(u, filled);
    await press(u, "captureupload");
    await u.settle();
    assert.ok(!says(u, "screen.capture.file.done", { name: "Seminary Ave.jpg" }), `${words}: upload`);
    assert.ok(failed(u), `${words}: upload drawn failed`);
  }
});

test("R16 \"Watch this address\" sends monitorset alone, enabled with the frequency chosen, for the bundle the address was captured into", async () => {
  const t = await team();
  serve(t.world);
  const p = await at(t);
  await capture(p);
  fill(p, { "ci-freq": "daily" });
  await press(p, "monitorset", { reason: "To see when it changes." });
  const bundleId = promoted(p).bundleId, title = promoted(p).meta.title;
  /* its friction is op-grades' (an ungraded op is reasoned, interface-shell R11): a reason the shell asks rides beside */
  const { reason, ...sent } = p.byOp("monitorset")[0].body;
  assert.deepEqual(sent, { bundleId, enabled: true, frequency: "daily" });
  assert.equal(p.byOp("monitorset").length, 1);
  assert.equal(p.byOp("monitor").length, 0, "watching sends no check");
  assert.ok(says(p, "screen.capture.address.watching", { title, frequency: word("screen.capture.address.freq.daily") }));
  /* the owner now watches it, daily */
  const kept = await t.mai.read("heldat", { query: { address: ADDRESS } });
  assert.equal(kept.copy.document, bundleId);
  /* the frequency left as drawn is weekly */
  const u = await team();
  serve(u.world);
  const q = await at(u);
  await capture(q);
  await press(q, "monitorset", { reason: "r" });
  assert.equal(q.byOp("monitorset")[0].body.frequency, "weekly");
});

test("R16 \"Check it now\" sends monitor alone, for the same bundle", async () => {
  const t = await team();
  serve(t.world);
  const p = await at(t);
  await capture(p);
  /* the member has set watching (the owner's monitor answers only a document asked to be monitored), and the site has since stopped answering: the owner's check
     names no status but its note, the could-not-be-told sentence (R42) */
  await press(p, "monitorset", { reason: "r" });
  t.world.script(ADDRESS, async () => new Response("no", { status: 403 }));
  await press(p, "monitor");
  assert.deepEqual(p.byOp("monitor").map((r) => r.body), [{ bundleId: promoted(p).bundleId }]);
  assert.equal(p.byOp("monitorset").length, 1, "checking sets no watching");
  const unknown = word("screen.capture.address.checked.unknown", { title: promoted(p).meta.title, note: "\u0000" }).split("\u0000")[0];
  assert.ok(text(p).includes(unknown), "R42: an answer naming no status is the could-not-be-told sentence");
  assert.ok(!says(p, "screen.capture.address.checked.unchanged", { title: promoted(p).meta.title }));
});

const OTHER = "https://other.example/captured-now";
const PAGE_AT = (world, address, title = "Another page") => serve(world, address, notice(title), "text/html");

test("R14 an address not captured this visit is watched through the held document for that address; none known, nothing is sent", async () => {
  const t = await team();
  serve(t.world);
  PAGE_AT(t.world, OTHER);
  /* the document held for the address, captured in an earlier visit */
  const earlier = await at(t);
  await capture(earlier);
  const held = promoted(earlier).bundleId;
  const p = await at(t);
  /* a different address is captured this visit (its document is another); the watched one is found among the held */
  await capture(p, OTHER);
  const here = promoted(p).bundleId;
  assert.notEqual(here, held);
  fill(p, { "ci-address": ADDRESS });
  await press(p, "monitorset", { reason: "r" });
  assert.equal(p.byOp("monitorset")[0].body.bundleId, held);
  await press(p, "monitor");
  assert.equal(p.byOp("monitor")[0].body.bundleId, held);
  /* control: an address no held document names: nothing is sent, and the member is told to capture it first */
  const THIRD = "https://third.example/c";
  PAGE_AT(t.world, THIRD, "A third page");
  const q = await at(t);
  await capture(q, THIRD);
  fill(q, { "ci-address": "https://never.example/z" });
  const r = await press(q, "monitorset", { reason: "r" });
  assert.equal(q.byOp("monitorset").length, 0);
  assert.ok(saysIn(r.slot(), "screen.capture.address.watchafter"));
  fill(q, { "ci-address": "" });
  assert.ok(saysIn((await press(q, "monitor")).slot(), "capture.fieldneeded", { field: word("screen.capture.address.label") }));
  assert.equal(q.byOp("monitor").length, 0);
});

test("R14 NOT_MONITORED, NO_LOCATOR and MONITOR_SET_REFUSED are drawn by the shell's rule (R13): the code's refusal word where held, else the answer's own words", async () => {
  const { WORD_ROWS } = await import("../../../src/setup-words/index.mjs");
  for (const [op, code] of [["monitor", "NOT_MONITORED"], ["monitorset", "NO_LOCATOR"], ["monitorset", "MONITOR_SET_REFUSED"]]) {
    const t = await team();
    serve(t.world);
    /* NOT_MONITORED is the owner's own answer to a check of a document nobody set watching on (a real press). NO_LOCATOR and MONITOR_SET_REFUSED are the owner's
       refusals of a document with no address and of a frequency the page never sends: no real press of this screen causes them, so each is the one scripted answer (a fault) */
    const p = await at(t, "/app/capture", code === "NOT_MONITORED" ? {} : { [op]: refused(code, `Words for ${code}.`, 400, { field: "frequency" }) });
    await capture(p);
    const r = await press(p, op, { reason: "r" });
    const held = WORD_ROWS.find((w) => w[0] === `refusal.${code}`);
    const expected = held ? held[1].split("{")[0].trim() : `Words for ${code}.`;
    assert.ok(r.slot().textContent.includes(expected), `${code}: ${r.slot().textContent}`);
    assert.ok(!says(p, "screen.capture.address.watching", { title: promoted(p).meta.title, frequency: word("screen.capture.address.freq.weekly") }), code);
    assert.ok(!text(p).includes(word("screen.capture.address.checked.unchanged", { title: promoted(p).meta.title })), code);
  }
});

test("R14 \"Ask for this later\" sends capturerequest with the address and no run, and says when the request waits (drains: false)", async () => {
  const t = await team();
  /* the team's Civicsmith drains nothing while no daemon or administrator credential is bound (capture-requests R56): the credentials are unbound after the sign-ins */
  t.world.env.DAEMON_TOKEN = "";
  t.world.env.ADMIN_TOKEN = "";
  const p = await at(t);
  fill(p, { "ci-address": ADDRESS });
  await press(p, "capturerequest");
  assert.deepEqual(p.byOp("capturerequest")[0].body, { address: ADDRESS }, "no run named");
  assert.ok(says(p, "screen.capture.address.requested.waits", { address: ADDRESS }));
  /* control: a request that drains is asked for later, with no waiting sentence */
  const u = await team();
  const q = await at(u);
  fill(q, { "ci-address": ADDRESS });
  await press(q, "capturerequest");
  await idle(q);
  assert.ok(says(q, "screen.capture.address.requested", { address: ADDRESS }));
  assert.ok(!says(q, "screen.capture.address.requested.waits", { address: ADDRESS }));
  /* nothing is sent with no address */
  const e = await at(u);
  await press(e, "capturerequest");
  assert.equal(e.byOp("capturerequest").length, 0);
});

test("R2 the file tab: accept and capture attributes, four choices none preselected, the downloaded offer, the photo reminder", async () => {
  const t = await team();
  const p = await at(t, "/app/capture/file");
  const f = p.doc.getElementById("ci-file");
  assert.equal(f.getAttribute("type"), "file");
  assert.match(f.getAttribute("accept"), /image\/\*/);
  assert.equal(f.getAttribute("capture"), "environment");
  const radios = main(p).querySelectorAll('input[type="radio"]');
  assert.equal(radios.length, 4);
  assert.ok(radios.every((r) => !r.checked), "none preselected");
  assert.ok(says(p, "screen.capture.file.downloaded"));
  assert.ok(main(p).querySelector('a[href="/app/capture/address"][data-nav]'), "the address tab offered");
  assert.ok(says(p, "photo.reminder"), "photo.reminder by its key");
  assert.ok(btn(p, "captureupload").textContent.includes(word("act.captureupload.label.capture")));
  assert.deepEqual(rawKeys(p), []);
});

test("R2 the statement is composed from the three answers in order, each with its label, sent with the raw bytes", async () => {
  const t = await team();
  const p = await at(t, "/app/capture/file");
  fill(p, filled);
  await press(p, "captureupload");
  const r = p.byOp("captureupload")[0];
  assert.equal(r.init.body, FILE, "the file's bytes are the raw body");
  assert.equal(r.headers["content-type"], undefined, "no JSON content type");
  assert.equal(r.query.name, "Seminary Ave.jpg");
  assert.equal(r.query.statement, STATEMENT);
  assert.match(r.headers.Authorization, /^Bearer /);
});

test("R27 the upload sends the file's declared media type as type, beside statement and name", async () => {
  const TXT = new File(["plain words"], "notes.txt", { type: "text/plain" });
  const t = await team();
  const p = await at(t, "/app/capture/file");
  fill(p, { ...filled, "ci-file": TXT });
  await press(p, "captureupload");
  const r = p.byOp("captureupload")[0];
  assert.equal(r.query.type, "text/plain", "R27: the browser's file.type is sent as type");
  assert.equal(r.query.name, "notes.txt");
  assert.equal(r.query.statement, STATEMENT);
});

test("R27 control: a file whose declared type is empty sends no type", async () => {
  const BLOB = new File(["unknown bytes"], "scan.bin", { type: "" });
  const t = await team();
  const p = await at(t, "/app/capture/file");
  fill(p, { ...filled, "ci-file": BLOB });
  await press(p, "captureupload");
  const r = p.byOp("captureupload")[0];
  assert.equal(Object.prototype.hasOwnProperty.call(r.query, "type"), false, "R27 control: no type key when the browser declares none");
  assert.equal(r.query.name, "scan.bin");
});

test("R28 a name whose 40-character cut ends at a hyphen promotes under an id with no trailing hyphen, its slug beginning and ending with a letter or digit", async () => {
  const NAMED = new File([PDF], `${"a".repeat(39)}-b.pdf`, { type: "application/pdf" });
  const t = await team();
  const p = await at(t, "/app/capture/file");
  fill(p, { ...filled, "ci-file": NAMED });
  await press(p, "captureupload");
  await p.settle();
  const id = promoted(p).bundleId;
  assert.match(id, idOf("a".repeat(39)), "R28: the cut is trimmed of its trailing hyphen");
  assert.match(id, /^INFO-\d{4}-\d{4}-[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, "R28: a canonical id that cite accepts");
});

test("R28 control: a name of 41 plain characters is cut to 40 characters of slug", async () => {
  const LONG = new File([PDF], `${"c".repeat(41)}.pdf`, { type: "application/pdf" });
  const t = await team();
  const p = await at(t, "/app/capture/file");
  fill(p, { ...filled, "ci-file": LONG });
  await press(p, "captureupload");
  await p.settle();
  assert.match(promoted(p).bundleId, idOf("c".repeat(40)), "R28 control: cut to 40");
});

test("R2 nothing is sent while a file or any answer is missing, saying which, or over 2,000 characters", async () => {
  const labels = (...ks) => ks.map((k) => word(k)).join(", ");
  const cases = [[{ ...filled, "ci-file": null }, "screen.capture.file.nofile", {}],
                 [{ "ci-file": FILE }, "screen.capture.file.missing", { fields: labels("screen.capture.file.how", "screen.capture.file.where", "screen.capture.file.what") }],
                 [{ ...filled, "ci-where": "" }, "screen.capture.file.missing", { fields: labels("screen.capture.file.where") }],
                 [{ ...filled, "ci-what": "x".repeat(2000) }, "screen.capture.file.toolong", { count: [...`${STATEMENT.slice(0, STATEMENT.lastIndexOf(": ") + 2)}${"x".repeat(2000)}`].length }]];
  const t = await team();
  for (const [values, key, vars] of cases) {
    const p = await at(t, "/app/capture/file");
    fill(p, values);
    const r = await press(p, "captureupload");
    assert.equal(p.byOp("captureupload").length, 0);
    assert.ok(saysIn(r.slot(), key, vars), key);
  }
  /* control: at the bound it is sent */
  const head = `${STATEMENT.slice(0, STATEMENT.lastIndexOf(": ") + 2).replace("The pothole, still open.", "")}`;
  const p = await at(t, "/app/capture/file");
  fill(p, { ...filled, "ci-what": "x".repeat(2000 - [...head].length) });
  await press(p, "captureupload");
  assert.equal([...p.byOp("captureupload")[0].query.statement].length, 2000);
});

test("R2 R21 R24 the answer: existed says the record already held the bytes and promotes nothing; otherwise the upload is promoted and then waits in Held captures, linked", async () => {
  /* the bytes are already held: a real upload of the same file made them so */
  const t = await team();
  await t.world.recipes.hold(t.mai, "Seminary Ave.jpg", Buffer.from(PHOTO, "utf8"), "", { type: "image/jpeg" });
  const p = await at(t, "/app/capture/file");
  fill(p, filled);
  await press(p, "captureupload");
  await idle(p);
  assert.ok(says(p, "screen.capture.file.existed"));
  assert.equal(p.byOp("allocid").length, 0, "existed: true promotes nothing new");
  assert.equal(p.byOp("promote").length, 0);
  const u = await team();
  const q = await at(u, "/app/capture/file");
  fill(q, filled);
  await press(q, "captureupload");
  await q.settle();
  assert.ok(says(q, "screen.capture.file.done", { name: "Seminary Ave.jpg" }));
  assert.ok(!says(q, "screen.capture.file.existed"));
  assert.deepEqual(q.byOp("allocid")[0].query, { op: "allocid", prefix: "INFO", year: YEAR });
  const b = promoted(q);
  assert.match(b.bundleId, idOf("seminary-ave-jpg"));
  assert.equal(b.meta.current_state, "collected");
  assert.equal(b.register.length, 1);
  assert.deepEqual([b.register[0].sha256, b.register[0].encoding, b.register[0].bytes], [USHA, "binary", Buffer.byteLength(PHOTO, "utf8")], "the register holds the bytes the member sent");
  assert.match(b.register[0].path, /^snapshots\//);
  assert.deepEqual(entryMissing(b.files), [], "R23: the upload's bundle meets verified's entry too");
  const md = b.files.find((f) => f.path === "bundle.md").text;
  assert.match(md, new RegExp(`^  locator: "upload:${USHA}"$`, "m"));
  const ds = b.files.find((f) => f.path === "data/dataset.json");
  assert.match(md, new RegExp(`^content_hash: sha256:${sha256(ds.text)}$`, "m"));
  assert.ok(main(q).querySelector(`a[href*="${b.bundleId}"]`), "R24: the result links the document");
  assert.equal((await u.mai.read("heldat", { query: { sha256: USHA } })).copy.document, b.bundleId, "the owner holds the document the page promoted");
  /* control: a refused promotion draws its refusal, not "It waits", and no link (the owner's refusal of a bundle the page built is a fault no real upload causes: scripted) */
  const w = await team();
  const r = await at(w, "/app/capture/file", { promote: refused("UNWORDED_PROMOTE_CODE", "The checks refused it.") });
  fill(r, filled);
  await press(r, "captureupload");
  await r.settle();
  assert.match(text(r), /The checks refused it\./);
  assert.ok(!says(r, "screen.capture.file.done", { name: "Seminary Ave.jpg" }));
  assert.equal(main(r).querySelector('a[href*="INFO-"]'), null);
});

/* R66 (G143; K4836, K4787): a screen's text is read only once the screen has drawn what the act answered. The door's answer to `captureupload` is held behind a gate
   the test releases after the first read (a delay no real act makes: the answer, once released, is the owner's own): a read made straight after the press (the old
   test's) finds nothing drawn and is red; the test waits for the drawn state (`idle`, which counts answers and requests, never a time) and is green however the machine
   is loaded. */
test("R66 the existed answer is drawn only after the plane answers, and a test reads it once the screen has drawn it", async () => {
  let release;
  const gate = new Promise((r) => { release = r; });
  const t = await team();
  await t.world.recipes.hold(t.mai, "Seminary Ave.jpg", Buffer.from(PHOTO, "utf8"), "", { type: "image/jpeg" });
  const real = t.world.boot(t.mai);
  let answered;
  const done = new Promise((r) => { answered = r; });
  const p = await at(t, "/app/capture/file", { captureupload: async (req) => { await gate; const a = await real.door(req); answered(); return a; } });
  fill(p, filled);
  await press(p, "captureupload");
  assert.ok(!says(p, "screen.capture.file.existed"), "R66: the old test's read, straight after the press, finds nothing drawn: the answer is still held"); // R66 gate
  release();
  await done;
  await idle(p);
  assert.ok(says(p, "screen.capture.file.existed"), "R66: after the drawn state, the sentence is there");
  assert.equal(p.byOp("allocid").length, 0, "existed: true promotes nothing new");
});

test("R66 control: no test of this module's capture file reads what a screen drew straight after an act, with no wait for the drawn state", async () => {
  const { readFileSync } = await import("node:fs");
  const lines = readFileSync(new URL("./capture.test.mjs", import.meta.url), "utf8").split("\n");
  const bad = [];
  lines.forEach((l, i) => {
    if (!/await press\(/.test(l)) return;
    let j = i + 1;
    while (j < lines.length && !lines[j].trim()) j++;
    if (/\b(says|saysIn|text|html)\(|\.textContent|\.innerHTML|querySelector/.test(lines[j] || "") && !/settle\(|idle\(|R66 gate/.test(lines[j])) bad.push(i + 1);
  });
  assert.deepEqual(bad, [], "a read after a press with no settle or idle between");
});

test("R2 UPLOAD_NO_STATEMENT, EMPTY, TOO_LARGE and MEMBER_SESSION_REQUIRED are each drawn in its own sentence", async () => {
  const keys = { UPLOAD_NO_STATEMENT: "screen.capture.refusal.UPLOAD_NO_STATEMENT", EMPTY: "screen.capture.refusal.upload.EMPTY",
                 TOO_LARGE: "screen.capture.refusal.upload.TOO_LARGE", MEMBER_SESSION_REQUIRED: "screen.capture.refusal.MEMBER_SESSION_REQUIRED" };
  const texts = new Set();
  for (const [code, key] of Object.entries(keys)) {
    const t = await team();
    /* EMPTY is caused by a real act: a file of no bytes. The other three are the owner's refusals no real press of a member's page causes: UPLOAD_NO_STATEMENT of a
       statement the page always composes, TOO_LARGE of a file past the capture bound (hundreds of megabytes), MEMBER_SESSION_REQUIRED of a caller that is not a member's
       session (a signed-out page is sent to sign in instead of drawing it): each is the one scripted answer (a fault) */
    const faulty = code !== "EMPTY";
    const p = await at(t, "/app/capture/file", faulty ? { captureupload: refused(code, "the owner's words") } : {});
    fill(p, code === "EMPTY" ? { ...filled, "ci-file": new File([], "empty.jpg", { type: "image/jpeg" }) } : filled);
    const r = await press(p, "captureupload");
    await idle(p);
    assert.ok(saysIn(r.slot(), key), code);
    assert.ok(!r.slot().textContent.includes("the owner's words"), code);
    texts.add(r.slot().textContent);
  }
  assert.equal(texts.size, 4);
  /* control: another code is the shell's */
  const t = await team();
  const p = await at(t, "/app/capture/file", { captureupload: refused("SOME_CODE_WITH_NO_WORD", "A name over 300 characters.") });
  fill(p, filled);
  assert.match((await press(p, "captureupload")).slot().textContent, /A name over 300 characters\./);
});

/* R22 (BOB's reading of J2: the subject rides the path, `/app/capture/<tab>/<id>`): a project and a question in it, made by the real acts */
async function subjects(opts = {}) {
  const t = await team();
  serve(t.world);
  const project = await t.world.recipes.project(t.mai, "Pothole repairs");
  const question = (await t.world.recipes.question(t.mai, project, { title: "Seven days" })).id;
  return { ...t, project, question };
}

test("R22 a capture made from a question is filed under the question's project and offers Cite a passage over the document with the question", async () => {
  const t = await subjects();
  const { project: PROJ, question: Q } = t;
  const p = await at(t, `/app/capture/address/${Q}`);
  await capture(p);
  await p.settle();
  assert.deepEqual(p.byOp("image").map((r) => r.query.id), [Q, PROJ], "the project and question are read once, as the page draws what it files under");
  assert.match(mdOf(p), new RegExp(`^project: ${PROJ}$`, "m"));
  const cite = main(p).querySelector(`a[href="/app/find-in/${SHA}/${Q}"]`);
  assert.ok(cite, "R35: Cite a passage opens find-in over the document by its capture's fingerprint, with the question");
  assert.equal(main(p).querySelector(`a[href="/app/find-in/${promoted(p).bundleId}/${Q}"]`), null, "R35 control: never the record id");
  assert.ok(cite.textContent.includes(word("capture.cite")));
  assert.equal(cite.getAttribute("data-tip"), word("capture.cite.tip").replace(/'/g, "&#39;").replace(/&#39;/g, "'"), "its tip");
  assert.ok(says(p, "capture.filed.question", { project: "Pothole repairs", question: "Seven days" }), "where it is filed, and for which question");
  /* the subject rides every tab link, so the tabs keep the question */
  assert.ok(main(p).querySelector(`a[href="/app/capture/file/${Q}"][data-nav]`));
  /* the owner holds the document under that project */
  assert.equal((await t.mai.read("heldat", { query: { sha256: SHA } })).copy.project, PROJ);
  /* the upload tab files it the same way */
  const u = await at(t, `/app/capture/file/${Q}`);
  fill(u, filled);
  await press(u, "captureupload");
  await u.settle();
  assert.match(mdOf(u), new RegExp(`^project: ${PROJ}$`, "m"));
});

test("R22 a capture made from a project is filed under it and says so, with no question read and no Cite a passage", async () => {
  const t = await subjects();
  const p = await at(t, `/app/capture/address/${t.project}`);
  await capture(p);
  await p.settle();
  assert.deepEqual(p.byOp("image").map((r) => r.query.id), [t.project], "only the project's title is read");
  assert.match(mdOf(p), new RegExp(`^project: ${t.project}$`, "m"));
  assert.ok(says(p, "capture.filed.project", { project: "Pothole repairs" }));
  assert.equal(main(p).querySelector('a[href^="/app/find-in/"]'), null, "no question to cite into");
});

/* the promotion follows the capture's answer after the page's own rounds, so it is waited for (bounded), never read after a fixed settle */
async function promoteSent(p, ms = 20000) {
  const end = Date.now() + ms;
  while (p.byOp("promote").length === 0 && Date.now() < end) { await p.settle(20); await new Promise((r) => setTimeout(r, 10)); }
  return p.byOp("promote")[0];
}

test("R22 controls: no subject, a subject that is neither a project nor a question, and a question stating no project file it under none; a question that cannot be read files nothing", async () => {
  for (const path of ["/app/capture/address", "/app/capture/address/INFO-2026-0004-lease", "/app/capture/address/"]) {
    const t = await team();
    serve(t.world);
    const p = await at(t, path);
    await capture(p);
    assert.doesNotMatch((await promoteSent(p)).body.files.find((f) => f.path === "bundle.md").text, /^project:/m, path);
    await p.settle();
    assert.equal(p.byOp("image").length, 0, path);
    assert.ok(!text(p).includes(word("capture.filed.project", { project: "" }).split("{")[0].trim()), `${path}: says nothing is filed`);
    assert.equal(main(p).querySelector('a[href^="/app/find-in/"]'), null, `${path}: nothing to cite into`);
  }
  const t = await team();
  serve(t.world);
  /* a question of no project */
  const loose = (await t.world.recipes.question(t.mai, null, { title: "A loose question" })).id;
  const n = await at(t, `/app/capture/address/${loose}`);
  await capture(n);
  assert.doesNotMatch((await promoteSent(n)).body.files.find((f) => f.path === "bundle.md").text, /^project:/m);
  /* the question's read fails: the owner holds no such question, so nothing is promoted and nothing is filed where the member did not mean */
  const w = await team();
  serve(w.world);
  const u = await at(w, `/app/capture/address/INQ-${YEAR}-9999-nothing-here`);
  await capture(u);
  await u.settle();
  await idle(u);
  assert.equal(u.byOp("promote").length, 0);
  assert.ok(failed(u), "a failure with no words is still drawn as failed");
});

/* ---- R3: what I saw ---- */
test("R3 (K3171) the recorded testimony is named by the bundle_id provenance's testify answers", async () => {
  const t = await team();
  const p = await at(t, "/app/capture/saw");
  fill(p, { "ci-words": "The pothole is still open.", "ci-where": "6012 Seminary Ave", "ci-when": "2026-10-04T09:10:00Z" });
  await press(p, "testify");
  await idle(p);
  const link = main(p).querySelector('a[href*="INFO-"]');
  assert.ok(link && text(p).includes(word("screen.capture.saw.done", { id: "\u0000" }).split("\u0000")[0]), "C29: the result links the document it made");
  const id = /INFO-[\w-]+/.exec(link.getAttribute("href"))[0];
  assert.match((await t.mai.read("image", { query: { id } }))["bundle.md"], new RegExp(`^id: ${id}$`, "m"), "the link names a document the owner holds");
  assert.doesNotMatch(text(p), /[0-9a-f]{16}/, "never the capture's digest");
  /* control: an answer naming no bundle draws no testimony id. The owner's testify always names the bundle it made, so an answer without one is no real act's: the one
     scripted answer (a fault), reported */
  const u = await team();
  const q = await at(u, "/app/capture/saw", { testify: ok({ ok: true, id: "INFO-2026-0010-x" }) });
  fill(q, { "ci-words": "x", "ci-where": "y", "ci-when": "2026-10-04T09:10:00Z" });
  await press(q, "testify");
  await idle(q);
  assert.doesNotMatch(text(q), /INFO-2026-0010-x/);
});

test("R3 testify sends the member's words with where, and when as observedAt; never a time after now", async () => {
  const t = await team();
  const p = await at(t, "/app/capture/saw");
  fill(p, { "ci-words": "The pothole is still open.", "ci-where": "6012 Seminary Ave", "ci-when": "2026-10-04T09:10:00Z" });
  await press(p, "testify");
  assert.deepEqual(p.byOp("testify")[0].body, { words: `The pothole is still open.\n\n${word("screen.capture.saw.wherein", { where: "6012 Seminary Ave" })}`, observedAt: "2026-10-04T09:10:00Z" });
  assert.ok(main(p).querySelector('a[href*="INFO-"]') && text(p).includes(word("screen.capture.saw.done", { id: "\u0000" }).split("\u0000")[0]), "C29: the result links the document it made");
  const q = await at(t, "/app/capture/saw");
  fill(q, { "ci-words": "x", "ci-where": "y", "ci-when": "2999-01-01T00:00:00Z" });
  assert.ok(saysIn((await press(q, "testify")).slot(), "screen.capture.saw.badwhen"));
  fill(q, { "ci-words": "x", "ci-where": "", "ci-when": "" });
  assert.ok(saysIn((await press(q, "testify")).slot(), "screen.capture.saw.missing", { fields: `${word("screen.capture.saw.where")}, ${word("screen.capture.saw.when")}` }));
  assert.equal(q.byOp("testify").length, 0);
});

/* The assistant reachable for this member (interface-shell R20), by the real acts: the administrator sets and switches on the team's Claude key and reads its notice
   (`reauth`, `groupkeyset`, `groupkeyswitch`, `groupkeynoticeseen`); the member reads it too */
async function reachable(t) {
  const admin = await t.world.signIn("admin");
  await admin.act("reauth", { body: { password: admin.password } });
  await admin.act("groupkeyset", { body: { key: "sk-ant-api03-" + "w".repeat(40) } });
  await admin.act("groupkeyswitch", { body: { on: true } });
  await admin.act("groupkeynoticeseen", { body: {} });
  await t.mai.act("groupkeynoticeseen", { body: {} });
}
const assisted = () => team({ mai: CAN }, { ai: true });

/* The draft itself is the one answer the world's door cannot make: the Worker door's half of `writinghelp` (control-plane R57, draft.mjs: the owner's
   ASSISTANT_DRAFT_UNAVAILABLE, then the object's `draft` through the agent worker) is not wired in the store-request world's door, so the real `writinghelp` always
   answers the owner's "cannot draft yet". Each draft below is the one scripted `writinghelp` answer (reported); the testify that keeps it is the owner's own. */
test("R3 R10 writinghelp under the words only while reachable; its draft filled into the words field itself, labelled, kept only by testify", async () => {
  const off = await team();
  const o = await at(off, "/app/capture/saw");
  assert.equal(btn(o, "writinghelp"), null);
  const t = await assisted();
  await reachable(t);
  const p = await at(t, "/app/capture/saw", { writinghelp: ok({ ok: true, text: "The pothole is still open, about 60 cm across.", label: { kind: "machine", asked_by: "mai" } }) });
  const h = html(p);
  assert.ok(h.indexOf('data-act="writinghelp"') > h.indexOf('id="ci-words"'), "under the words field");
  assert.ok(h.indexOf('data-act="writinghelp"') < h.indexOf('id="ci-where"'));
  const label = word("screen.capture.saw.draft", { handle: "mai" });
  assert.ok(!text(p).includes(label.split(" · ")[0] + " ·"), "no label before a draft");
  fill(p, { "ci-words": "pothole still open 60cm" });
  await press(p, "writinghelp");
  assert.deepEqual(p.byOp("writinghelp")[0].body, { op: "testify", field: "words", told: "pothole still open 60cm" });
  /* R10: the same field, filled (cs.fill); no field of a new id */
  assert.equal(p.doc.getElementById("ci-words").value, "The pothole is still open, about 60 cm across.");
  assert.equal(main(p).querySelectorAll("textarea.rec").length, 1);
  assert.ok(text(p).includes(label));
  assert.equal(p.byOp("testify").length, 0, "nothing is kept by the draft itself");
  /* the member's own act keeps the draft as edited */
  fill(p, { "ci-words": "The pothole is still open.", "ci-where": "Seminary Ave", "ci-when": "2026-10-04T09:10:00Z" });
  await press(p, "testify");
  assert.match(p.byOp("testify")[0].body.words, /^The pothole is still open\./);
  assert.ok(!text(p).includes(label), "the label leaves once the member's own act kept it");
  /* control: nothing typed, nothing asked */
  const q = await at(t, "/app/capture/saw");
  await press(q, "writinghelp");
  assert.equal(q.byOp("writinghelp").length, 0);
});

test("R3 R10 (K2816 (2); wizard-scripts R34) a writing-help draft carries the test-instance label exactly when its answer carries untested", async () => {
  const t = await assisted();
  await reachable(t);
  for (const [answer, labelled] of [[{ ok: true, text: "X.", untested: true }, true], [{ ok: true, text: "X.", untested: "untested", label: { kind: "machine", asked_by: "mai" } }, true], [{ ok: true, text: "X." }, false]]) {
    const p = await at(t, "/app/capture/saw", { writinghelp: ok(answer) });
    fill(p, { "ci-words": "x" });
    await press(p, "writinghelp");
    await idle(p);
    assert.equal(!!main(p).querySelector('[data-label="untested"]'), labelled, JSON.stringify(answer));
    if (labelled) assert.ok(says(p, "ai.label.untested"));
  }
});

test("R26 what the capture screen draws for a sample of its keys equals word(key, vars)", async () => {
  const t = await team();
  const p = await at(t, "/app/capture/address");
  for (const k of ["screen.capture.sub", "screen.capture.tab.address", "screen.capture.tab.file", "screen.capture.tab.saw", "screen.capture.address.label",
                   "screen.capture.address.help", "screen.capture.address.note", "act.acquire.label.capture", "act.capturerequest.label.capture"])
    assert.ok(says(p, k) || btn(p, k.split(".")[1]) && btn(p, k.split(".")[1]).textContent.includes(word(k)), k);
  const f = await at(t, "/app/capture/file");
  for (const k of ["screen.capture.file.choose", "screen.capture.file.choosehelp", "screen.capture.file.how", "screen.capture.file.how.made", "screen.capture.file.how.handed",
                   "screen.capture.file.how.sent", "screen.capture.file.how.downloaded", "screen.capture.file.where", "screen.capture.file.what", "screen.capture.file.note"])
    assert.ok(says(f, k), k);
  const s = await at(t, "/app/capture/saw");
  for (const k of ["screen.capture.saw.note", "screen.capture.saw.words", "screen.capture.saw.where", "screen.capture.saw.when", "screen.capture.saw.whenhelp", "screen.capture.saw.after"])
    assert.ok(says(s, k), k);
});

/* ---- T50 (T50-30): R29, R31, R33, R34, R35, R36 ---- */
/* a project and two questions in it (the second the one a choice can move the capture to), and a second project with a question of its own */
async function twoQuestions() {
  const t = await team();
  serve(t.world);
  const project = await t.world.recipes.project(t.mai, "Pothole repairs");
  const question = (await t.world.recipes.question(t.mai, project, { title: "Seven days" })).id;
  const other = (await t.world.recipes.question(t.mai, project, { title: "Other question" })).id;
  const elsewhere = await t.world.recipes.project(t.mai, "Lease records");
  const away = (await t.world.recipes.question(t.mai, elsewhere, { title: "A question of another project" })).id;
  return { ...t, project, question, other, elsewhere, away };
}

test("R29 opened from a question, the address tab draws \"For which question\" preset to it, changeable among the questions the member may see; the choice is sent as acquire's for, and no capturerequest is made", async () => {
  const t = await twoQuestions();
  const { question: Q, other, project: PROJ } = t;
  const p = await at(t, `/app/capture/address/${Q}`);
  assert.ok(says(p, "capture.forquestion"), "its label, by key");
  assert.ok(says(p, "capture.forquestion.help"));
  const sel = p.doc.getElementById("ci-for");
  const offered = sel.querySelectorAll("option").map((o) => o.getAttribute("value"));
  assert.ok(offered.includes(Q) && offered.includes(other), "the questions the member may see");
  assert.deepEqual([...offered].sort(), [Q, other, t.away].sort(), "every question of hers, and no other");
  assert.equal(sel.querySelectorAll("option").find((o) => o.getAttribute("value") === Q).textContent, "Seven days", "a question's title, drawn as data");
  assert.equal(p.byOp("search")[0].query.q, "type:inquiry");
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  assert.deepEqual(p.byOp("acquire").map((r) => r.body), [{ locator: ADDRESS, for: Q, project: PROJ }], "the preset question rides as for");
  assert.equal(p.byOp("capturerequest").length, 0, "R29: no capturerequest is made for it");
  /* changeable: another question is the one sent */
  const u = await twoQuestions();
  const q = await at(u, `/app/capture/address/${u.question}`);
  fill(q, { "ci-address": ADDRESS, "ci-for": u.other });
  await press(q, "acquire");
  assert.equal(q.byOp("acquire")[0].body.for, u.other);
  /* the routed question stays chosen though the list of questions does not name it (the list failing is the one fault that leaves it out: scripted) */
  const w = await twoQuestions();
  const r = await at(w, `/app/capture/address/${w.question}`, { search: refused("SEARCH_UNAVAILABLE", "the list failed", 500) });
  fill(r, { "ci-address": ADDRESS });
  await press(r, "acquire");
  assert.equal(r.byOp("acquire")[0].body.for, w.question);
});

test("R29 controls: the file tab draws no such choice and sends no for; with no subject for is absent and the question list is not read", async () => {
  const t = await twoQuestions();
  const f = await at(t, `/app/capture/file/${t.question}`);
  assert.equal(f.doc.getElementById("ci-for"), null);
  assert.ok(!says(f, "capture.forquestion"));
  fill(f, filled);
  await press(f, "captureupload");
  assert.ok(!("for" in f.byOp("captureupload")[0].query), "the upload sends no for");
  assert.ok(!("for" in (f.byOp("captureupload")[0].body || {})));
  for (const subject of [null, "project"]) {
    const u = await twoQuestions();
    const path = subject ? `/app/capture/address/${u.project}` : "/app/capture/address";
    const p = await at(u, path);
    assert.equal(p.doc.getElementById("ci-for"), null, path);
    assert.equal(p.byOp("search").length, 0, path);
    fill(p, { "ci-address": ADDRESS });
    await press(p, "acquire");
    assert.deepEqual(p.byOp("acquire").map((r) => r.body), [subject ? { locator: ADDRESS, project: u.project } : { locator: ADDRESS }], `${path}: for absent (a project subject rides as project, G2)`);
  }
});

test("R29 BAD_FOR is drawn by refusal.BAD_FOR beside the field in a fold titled capture.forquestion.refused.summary, open; nothing is shown as captured", async () => {
  const t = await twoQuestions();
  const p = await at(t, `/app/capture/address/${t.question}`);
  /* the member moves the capture to a question of another project: the owner's own refusal */
  fill(p, { "ci-address": ADDRESS, "ci-for": t.away });
  const r = await press(p, "acquire");
  await idle(p);
  assert.ok(saysIn(r.slot(), "refusal.BAD_FOR"));
  const fold = r.slot().querySelector("details");
  assert.ok(fold && fold.hasAttribute("open"), "a fold, open whenever drawn");
  assert.ok(saysIn(fold.querySelector("summary"), "capture.forquestion.refused.summary"));
  assert.equal(p.byOp("promote").length, 0);
  assert.ok(!text(p).includes(word("screen.capture.address.done", { title: "\u0000" }).split("\u0000")[0]), "nothing was captured");
  assert.equal(main(p).querySelector('a[href*="INFO-"]'), null);
});
