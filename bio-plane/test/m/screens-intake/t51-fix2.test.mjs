/* screens-intake R49, R50, R53–R56, R7 (T51 fix round 2: C9, C10, C11, C14, C23, C25, C29, C45, C78, C90, C91; DEC-394 3b, 3c): the
 * capture, held, inbox and watching screens on the real served page. A sentence is asserted by its key (R26), never by its English. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open as openPage, text, main, btn, fill, press, ok, refused, word, says, saysIn, dayOf, untitled, DOCUMENT_STUB, MEMBER, ADMIN } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

const NOT_HELD = ok({ ok: true, held: false, copy: null, versions: 0, truncated: false, changed: { state: "undetermined", basis: "x", as_of: null, earlier_differs: false } });
const open = (path, o = {}) => openPage(path, { ...o, plane: { heldat: NOT_HELD, heldcaptures: ok({ ok: true, held: [], truncated: false }), ...(o.plane || {}) }, screens: [...SCREENS, DOCUMENT_STUB] });
const ADDRESS = "https://www.example.gov/reports/street-maintenance-2026.pdf";
const SHA = "a".repeat(64), USHA = "d".repeat(64);
const DOC = { capture: { sha256: SHA, bytes: 1200, encoding: "binary", content_type: "application/pdf" }, file: "snapshots/a.pdf", title: null };
const holder = (sha, document) => (req) => (req.query.sha256 === sha ? ok({ ok: true, held: true, copy: { sha256: sha, document, project: null, retrieved: "2026-10-01T10:00:00Z", actor: "member:x", grade: null, address: ADDRESS },
  versions: 1, truncated: false, changed: { state: "undetermined", basis: "x", as_of: null, earlier_differs: false } }) : NOT_HELD);
const CAPTURED = { allocid: ok({ ok: true, id: "INFO-2026-0001" }), promote: (req) => ok({ ok: true, bundleId: req.body.bundleId }) };
const PROJ = "PROJ-2026-0007", Q = "INQ-2026-0001-seven-days";
const md = (title, extra = []) => ["---", `title: ${JSON.stringify(title)}`, ...extra, "---", "", "## Summary", ""].join("\n");
const QPLANE = { search: ok({ hits: [{ bundle_id: Q, title: "Seven days" }] }),
  image: (r) => ok(r.query.id === Q ? { "bundle.md": md("Seven days", [`project: ${PROJ}`]) } : r.query.id === PROJ ? { "bundle.md": md("Pothole repairs") } : r.query.id === "INFO-2026-0099-elsewhere" ? { "bundle.md": md("The earlier minutes") } : null) };
import { hasWord } from "../../../src/setup-words/index.mjs";
const hasKey = (k) => hasWord(k);
const anchors = (p, id) => Array.from(main(p).querySelectorAll("a")).filter((a) => String(a.getAttribute("href")).includes(id));

/* ---------- C9, C10: R49 ---------- */

test("R49 (C9) a capture from a question sends the question as `for`; a document the viewer sees that holds the bytes is linked and none is written", async () => {
  const p = await open(`/app/capture/address/${Q}`, { plane: { ...CAPTURED, ...QPLANE, heldat: holder(SHA, "INFO-2026-0042-held"), acquire: ok({ ok: true, existed: true, document: DOC }) } });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  assert.deepEqual(p.byOp("acquire").map((r) => r.body), [{ locator: ADDRESS, for: Q }], "the plane records the capture as made for this question when `for` rides on acquire (acquisition R47)");
  assert.equal(p.byOp("capturerequest").length, 0);
  assert.equal(p.byOp("allocid").length + p.byOp("promote").length, 0, "no document is written");
  assert.equal(anchors(p, "INFO-2026-0042-held").length >= 1, true, "the holder is linked");
  assert.ok(saysIn(main(p), "screen.capture.address.existed.open"));
});

test("R49 (C9) control: with no question chosen acquire carries no `for`", async () => {
  const p = await open("/app/capture/address", { plane: { ...CAPTURED, heldat: holder(SHA, "INFO-2026-0042-held"), acquire: ok({ ok: true, existed: true, document: DOC }) } });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  assert.deepEqual(p.byOp("acquire").map((r) => r.body), [{ locator: ADDRESS }]);
});

test("R49 (C9) when the bytes have another home the sentence names the holder and links it where the plane names it, and says so without a name or link where it does not", async () => {
  const another = (holderId) => ({ ...CAPTURED, image: QPLANE.image, acquire: ok({ ok: true, existed: true, document: DOC }),
    promote: ok({ ok: false, reason: "CAPTURE_HELD_BY_ANOTHER_BUNDLE", code: "CAPTURE_HELD_BY_ANOTHER_BUNDLE", holder: holderId }) });
  const named = await open("/app/capture/address", { plane: another("INFO-2026-0099-elsewhere") });
  fill(named, { "ci-address": ADDRESS });
  await press(named, "acquire");
  assert.ok(says(named, "refusal.CAPTURE_HELD_BY_ANOTHER_BUNDLE"), "the sentence of the key");
  const link = anchors(named, "INFO-2026-0099-elsewhere");
  assert.equal(link.length, 1, "a link to the holder");
  assert.ok(link[0].textContent.includes("The earlier minutes"), "named by its title");
  const unnamed = await open("/app/capture/address", { plane: another(null) });
  fill(unnamed, { "ci-address": ADDRESS });
  await press(unnamed, "acquire");
  assert.ok(says(unnamed, "refusal.CAPTURE_HELD_BY_ANOTHER_BUNDLE"));
  assert.equal(anchors(unnamed, "INFO-").length, 0, "no name and no link where the plane names none");
});

const UPLOADED = { capture: { sha256: USHA, bytes: 14 }, receipt: { address: `upload:${USHA}`, via: "upload", retrieved: "2026-10-02T10:00:00Z" } };
const UDOC = { file: `snapshots/upload-${USHA}`, locator: `upload:${USHA}`, capture: { method: "uploaded", sha256: USHA, encoding: "binary", bytes: 14 }, provenance_chain: [{ who: "x", asserts: "y" }], source: { kind: "uploader" } };
const FILE = new File(["photo bytes"], "Seminary Ave.jpg", { type: "image/jpeg" });
const filled = { "ci-file": FILE, "ci-how-made": true, "ci-where": "6012 Seminary Ave", "ci-what": "The pothole." };

test("R49 (C10) an upload whose bytes the store holds links the document the viewer sees and writes none", async () => {
  const p = await open("/app/capture/file", { plane: { ...CAPTURED, heldat: holder(USHA, "INFO-2026-0042-held"), captureupload: ok({ ok: true, existed: true, ...UPLOADED }) } });
  fill(p, filled);
  await press(p, "captureupload");
  assert.deepEqual(p.byOp("heldat").map((r) => r.query), [{ op: "heldat", sha256: USHA }]);
  assert.equal(p.byOp("allocid").length + p.byOp("promote").length, 0);
  assert.equal(anchors(p, "INFO-2026-0042-held").length >= 1, true, "linked");
  assert.ok(says(p, "screen.capture.file.existed", { name: "Seminary Ave.jpg" }));
});

test("R49 (C10) an upload whose bytes the store holds, no document the viewer sees, and an answer that carries the document files one for the viewer and links it", async () => {
  const p = await open("/app/capture/file", { plane: { ...CAPTURED, captureupload: ok({ ok: true, existed: true, ...UPLOADED, document: UDOC }) } });
  fill(p, filled);
  await press(p, "captureupload");
  await p.settle();
  assert.equal(p.byOp("promote").length, 1, "promoted under the project");
  assert.equal(anchors(p, p.byOp("promote")[0].body.bundleId).length >= 1, true, "and linked");
});

test("R49 (C10) control: an upload that is new promotes as before and asks nothing by digest; held bytes with neither a holder nor a document write nothing", async () => {
  const fresh = await open("/app/capture/file", { plane: { ...CAPTURED, captureupload: ok({ ok: true, existed: false, ...UPLOADED, document: UDOC }) } });
  fill(fresh, filled);
  await press(fresh, "captureupload");
  await fresh.settle();
  assert.equal(fresh.byOp("promote").length, 1);
  assert.equal(fresh.byOp("heldat").length, 0);
  const bare = await open("/app/capture/file", { plane: { ...CAPTURED, captureupload: ok({ ok: true, existed: true, ...UPLOADED }) } });
  fill(bare, filled);
  await press(bare, "captureupload");
  assert.equal(bare.byOp("promote").length, 0);
});

/* ---------- C11: R50 ---------- */

test("R50 (C11) a refused acquire clears the working note at once, and its refusal stays drawn after the page redraws", async () => {
  const p = await open("/app/capture/address", { plane: { acquire: refused("FETCH_FAILED", "builder detail", 502), capturerequest: ok({ ok: true, drains: true }) } });
  fill(p, { "ci-address": ADDRESS });
  const r = await press(p, "acquire");
  assert.ok(!says(p, "screen.capture.address.working"), "the working note is gone");
  assert.ok(saysIn(r.slot(), "refusal.FETCH_FAILED"));
  await press(p, "capturerequest");
  assert.ok(saysIn(r.slot(), "refusal.FETCH_FAILED"), "still drawn after another act redrew the page");
});

/* ---------- C14: R77, R88 (the reads) ---------- */

test("R50 (C14) the capture screen reads the held and vouched documents once, as pickers, and an act does not read the list again", async () => {
  const rows = ok({ ok: true, held: [{ bundle_id: "INFO-2026-0003-a", title: "Housing notice", project: null, capture: { sha256: SHA }, standing: "collected" }], truncated: false });
  const p = await open("/app/capture/address", { plane: { ...CAPTURED, heldcaptures: rows, acquire: ok({ ok: true, document: DOC, reading: { title: "Housing notice" } }) } });
  assert.deepEqual(p.byOp("heldcaptures").map((r) => r.query), [{ op: "heldcaptures", limit: "200", state: "held_and_vouched", fields: "picker" }]);
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  assert.equal(p.byOp("heldcaptures").length, 1, "an act reads the list no more");
});

test("R4 (C14) the Held screen reads each of its two lists once, and an act reads only the list it changed", async () => {
  const p = await open("/app/held", { plane: { release: ok({ ok: true, released: [] }), select: ok({ ok: true, handle: "h1" }) } });
  const listed = () => p.byOp("heldcaptures").map((r) => r.query.state || "held");
  assert.deepEqual(listed().sort(), ["held", "set_aside"]);
  const before = p.byOp("heldcaptures").length;
  await p.click(btn(p, "heldcaptures"));
  assert.ok(p.byOp("heldcaptures").length - before <= 2, "the refresh asks the one list it shows (the act and the read it draws)");
  assert.equal(p.byOp("heldcaptures").filter((r) => r.query.state === "set_aside").length, 1, "the set-aside list is not read again");
});

/* ---------- C23: Held ---------- */

const ROW = (id, title, project) => ({ bundle_id: id, title, project, age_days: 1, source: { address: "https://x.example/a", via: "fetch" }, eligible: true, capture: { sha256: SHA, grade: null }, captured_for: null, actor: null, retrieved: null, bytes: null });

test("R4 (C23) the project filter: Held opened for a project reads that project's captures, each row says its state by the one word, and a project name opens the filter", async () => {
  const lists = (req) => ok({ ok: true, held: req.query.state === "set_aside" ? [] : [ROW("INFO-2026-0003-a", "Housing notice", PROJ)], truncated: false });
  const projects = ok({ projects: [{ id: PROJ, name: "Pothole repairs" }] });
  const all = await open("/app/held", { plane: { heldcaptures: lists, projectlist: projects, memberlist: ok({ members: [] }) } });
  assert.ok(says(all, "state.item.review.name"), "a held row is in the state the Find chip names");
  assert.ok(all.byOp("heldcaptures").every((r) => r.query.project === undefined), "unfiltered by default");
  const door = anchors(all, `/app/held/${PROJ}`);
  assert.equal(door.length >= 1, true, "the project name opens the filter");
  const one = await open(`/app/held/${PROJ}`, { plane: { heldcaptures: lists, projectlist: projects, memberlist: ok({ members: [] }) } });
  assert.ok(one.byOp("heldcaptures").length >= 1 && one.byOp("heldcaptures").every((r) => r.query.project === PROJ), "the filter reads the project's captures");
  assert.equal(anchors(one, "/app/held\"").length + Array.from(main(one).querySelectorAll("a")).filter((a) => a.getAttribute("href") === "/app/held").length >= 1, true, "and a way back to all");
});

/* ---------- C25: R54 ---------- */

test("R54 (C25) a document is named by its title, else its file name, else its host and the day it was captured: a PDF and a web page by one rule", async () => {
  const named = async (answer) => {
    const p = await open("/app/capture/address", { plane: { ...CAPTURED, acquire: ok({ ok: true, ...answer }) } });
    fill(p, { "ci-address": ADDRESS });
    await press(p, "acquire");
    await p.settle();
    return p;
  };
  const titled = await named({ document: DOC, reading: { title: "Housing notice 2026-118" } });
  assert.ok(says(titled, "screen.capture.address.done", { title: "Housing notice 2026-118" }), "its own title");
  const filedAs = await named({ document: { ...DOC, capture: { ...DOC.capture, file_name: "annual-report.pdf" } }, reading: null });
  assert.ok(says(filedAs, "screen.capture.address.done", { title: "annual-report.pdf" }), "its file name");
  for (const content_type of ["application/pdf", "text/html"]) {
    const none = await named({ document: { ...DOC, capture: { ...DOC.capture, content_type } }, reading: null });
    assert.ok(says(none, "screen.capture.address.done", { title: untitled() }), `${content_type}: host and day`);
    assert.ok(!text(none).includes("street-maintenance-2026"), "never the file part of the address");
  }
});

test("R54 (C25) control: two documents from one host with different titles are told apart by their names", async () => {
  const a = await open("/app/capture/address", { plane: { ...CAPTURED, acquire: ok({ ok: true, document: DOC, reading: { title: "Minutes, 4 March" } }) } });
  fill(a, { "ci-address": ADDRESS });
  await press(a, "acquire");
  const b = await open("/app/capture/address", { plane: { ...CAPTURED, acquire: ok({ ok: true, document: DOC, reading: { title: "Minutes, 1 April" } }) } });
  fill(b, { "ci-address": ADDRESS });
  await press(b, "acquire");
  assert.ok(says(a, "screen.capture.address.done", { title: "Minutes, 4 March" }) && says(b, "screen.capture.address.done", { title: "Minutes, 1 April" }));
});

/* ---------- C29, C45 ---------- */

test("R3 (C29) the testimony's result links the document it made, and draws no link and no raw number where the answer names none", async () => {
  const words = "I saw the pothole at 6012 Seminary Ave still open.";
  const fillSaw = { "ci-words": words, "ci-where": "6012 Seminary Ave", "ci-when": "2026-10-01T09:00:00Z" };
  const p = await open("/app/capture/saw", { plane: { testify: ok({ ok: true, bundle_id: "INFO-2026-0005-saw" }) } });
  fill(p, fillSaw);
  await press(p, "testify");
  assert.equal(anchors(p, "INFO-2026-0005-saw").length, 1, "a link to the document");
  assert.ok(!text(p).includes("INFO-2026-0005-saw"), "no raw record number");
  const q = await open("/app/capture/saw", { plane: { testify: ok({ ok: true }) } });
  fill(q, fillSaw);
  await press(q, "testify");
  assert.equal(main(q).querySelectorAll('a[href*="INFO-"]').length, 0, "no id, no link");
  assert.ok(!/:\s*\./.test(text(q)), "and no blank where the number was");
});

test("R25 (C45) \"For which question\" shows the question's title, not its id; a question whose title cannot be read shows the word for a question", async () => {
  const withTitle = await open(`/app/capture/address/${Q}`, { plane: { ...QPLANE, search: ok({ hits: [] }) } });
  const option = () => text(withTitle);
  assert.ok(option().includes("Seven days"));
  assert.ok(!Array.from(withTitle.doc.getElementById("ci-for").parentNode.querySelectorAll("*")).some((e) => e.children.length === 0 && e.textContent.trim() === Q), "the id is no one's label");
  const without = await open(`/app/capture/address/${Q}`, { plane: { search: ok({ hits: [] }), image: ok(null) } });
  assert.ok(!Array.from(without.doc.getElementById("ci-for").parentNode.querySelectorAll("*")).some((e) => e.children.length === 0 && e.textContent.trim() === Q), "still not the id");
  assert.ok(says(without, "shell.card.question"));
});

/* ---------- C78 ---------- */

test("R47 (C78) the explanation of \"Show the stored logins\" sits directly under its own button, before the list it explains", async () => {
  const entries = [{ credential: "c1", host: "records.example.gov", supplied_by: "member:mai", supplied_at: "2026-10-01T10:00:00Z" }];
  const p = await open("/app/capture/address", { plane: { capturecredentiallist: ok({ ok: true, entries }), capturerequests: ok({ ok: true, requests: [], truncated: false }), memberlist: ok({ members: [] }) } });
  assert.ok(!says(p, "screen.capture.cred.listnote1"), "nothing is explained before the button is pressed");
  await press(p, "capturecredentiallist");
  const under = btn(p, "capturecredentiallist").closest(".mk-acts").nextElementSibling;
  assert.ok(under && under.textContent.includes(word("screen.capture.cred.listnote1")), "the note is the next thing under the button");
  assert.ok(text(p).indexOf(word("screen.capture.cred.listnote1")) < text(p).indexOf("records.example.gov"));
});

/* ---------- C90, C91 ---------- */

test("R46 (C90) \"Pause the watching\" is drawn for an administrator and not for a member, whom the plane would refuse", async () => {
  const plane = { monitoring: ok({ items: [], counts: {}, paused: { paused: false } }), sweeps: ok({ sweeps: [] }), memberlist: ok({ members: [] }), namedrequests: ok({ items: [] }), projectlist: ok({ projects: [] }) };
  const admin = await open("/app/watching", { me: ADMIN, plane });
  assert.ok(btn(admin, "monitorpause"));
  const member = await open("/app/watching", { me: MEMBER, plane });
  assert.equal(btn(member, "monitorpause"), null);
  assert.ok(says(member, "screen.watching.running"), "the state is still said");
});

test("R44 R46 (C91) Add has doors to Watched addresses and Leads for an administrator and a member, and none for a viewer who may not use them", async () => {
  for (const me of [ADMIN, MEMBER]) {
    const p = await open("/app/capture/address", { me });
    assert.equal(anchors(p, "/app/watching").length, 1, `${me.member}: watching`);
    assert.equal(anchors(p, "/app/leads").length, 1, `${me.member}: leads`);
    assert.ok(says(p, "screen.watching.name") && says(p, "screen.leads.name"));
  }
  const none = await open("/app/capture/address", { me: { ...MEMBER, capabilities: [] } });
  assert.equal(anchors(none, "/app/watching").length + anchors(none, "/app/leads").length, 0);
});

/* ---------- DEC-394 (3c): requests for later ---------- */

test("R55 (DEC-394 3c) \"Your requests for later\" lists the member's capture requests by their three states, from the one capturerequests read", async () => {
  const mine = "member:mai";
  const rows = [
    { request: "CR-1", address: "https://a.example/waiting", host: "a.example", state: "requested", principal_plane: mine, requested_at: "2026-10-01T10:00:00Z", attempts: 0 },
    { request: "CR-2", address: "https://b.example/done", host: "b.example", state: "captured", principal_plane: mine, requested_at: "2026-10-01T11:00:00Z", attempts: 1 },
    { request: "CR-3", address: "https://c.example/no", host: "c.example", state: "refused", source_reason: "login", principal_plane: mine, requested_at: "2026-10-01T12:00:00Z", attempts: 2 },
    { request: "CR-4", address: "https://d.example/theirs", host: "d.example", state: "requested", principal_plane: "member:other", requested_at: "2026-10-01T13:00:00Z", attempts: 0 },
  ];
  const p = await open("/app/capture/address", { plane: { capturerequests: ok({ ok: true, requests: rows, truncated: false }), memberlist: ok({ members: [] }) } });
  assert.equal(p.byOp("capturerequests").length, 1, "one read serves the list and the logins asked for");
  for (const k of ["screen.capture.later.head", "screen.capture.later.about", "screen.capture.later.waiting", "screen.capture.later.captured", "screen.capture.later.turned"]) assert.ok(says(p, k), k);
  for (const a of ["a.example/waiting", "b.example/done", "c.example/no"]) assert.ok(text(p).includes(a), a);
  assert.ok(!text(p).includes("d.example/theirs"), "another member's request is not listed");
  const none = await open("/app/capture/address", { plane: { capturerequests: ok({ ok: true, requests: [], truncated: false }) } });
  assert.ok(!says(none, "screen.capture.later.head"), "control: none to list draws no section");
});

/* ---------- C28: R7, R32 ---------- */

test("R7 R32 (C28) a knock's detail shows its fingerprint, labelled, before the member decides; the list rows do not", async () => {
  const K = { knock_id: "KNOCK-2026-10-03-9c1f0a2b", sha256: "1".repeat(64), bytes: 3 * 1048576, note: "Sheets.", received: "2026-10-03T10:00:00Z", status: "new", pseudonym: null, knocker_digest: null };
  const plane = { inbox: ok({ inbox: [K] }), inboxget: ok({ ok: true, item: K }) };
  const one = await open(`/app/inbox/${K.knock_id}`, { plane });
  assert.ok(says(one, "screen.document.fingerprint"), "its label, by key");
  assert.ok(Array.from(main(one).querySelectorAll(".mk-data")).some((e) => e.textContent.trim() === K.sha256), "the fingerprint itself");
  assert.ok(btn(one, "inboxresolve") && btn(one, "inboxpull"), "and the acts of the decision");
  const list = await open("/app/inbox", { plane });
  assert.ok(!text(list).includes(K.sha256) && !says(list, "screen.document.fingerprint"));
});

/* ---------- acquisition R5, R20: what was kept but is not finished ---------- */

test("R50 a render RENDER-NOTE-X and an attestation that ATTEST-NOTE-X are said as they stand; a capture with neither says neither", async () => {
  const doc = { ...DOC, render_pending: { session: "rs_x", since: "2026-10-01T10:00:00Z", note: "RENDER-NOTE-X" },
    attestation_attempts: [{ service: "attest", attempted: true, ok: false, pending: true, at: "2026-10-01T10:00:00Z", note: "ATTEST-NOTE-X" }] };
  const p = await open("/app/capture/address", { plane: { ...CAPTURED, acquire: ok({ ok: true, document: doc, reading: { title: "Housing notice" } }) } });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  await p.settle();
  assert.ok(text(p).includes("RENDER-NOTE-X") && text(p).includes("ATTEST-NOTE-X"));
  const q = await open("/app/capture/address", { plane: { ...CAPTURED, acquire: ok({ ok: true, document: { ...DOC, attestation_attempts: [{ service: "attest", attempted: true, ok: true }] }, reading: { title: "Housing notice" } }) } });
  fill(q, { "ci-address": ADDRESS });
  await press(q, "acquire");
  await q.settle();
  assert.ok(!text(q).includes("RENDER-NOTE-X") && !text(q).includes("ATTEST-NOTE-X"));
});

/* ---------- control-plane R105, R116 (K4326): what a timed-out capture kept ---------- */

test("R50 a timed-out capture is drawn by what it kept: held and undetermined by their keys (where the table holds them), nothing by the base words", async () => {
  for (const kept of ["held", "undetermined", "nothing", undefined]) {
    const p = await open("/app/capture/address", { plane: { acquire: refused("ACQUIRE_TIMED_OUT", "builder detail", 504, kept ? { kept } : {}) } });
    fill(p, { "ci-address": ADDRESS });
    const r = await press(p, "acquire");
    const key = kept === "held" || kept === "undetermined" ? `refusal.ACQUIRE_TIMED_OUT.${kept}` : "refusal.ACQUIRE_TIMED_OUT";
    assert.ok(saysIn(r.slot(), hasKey(key) ? key : "refusal.ACQUIRE_TIMED_OUT"), String(kept));
    assert.ok(!r.slot().textContent.includes("builder detail"));
  }
});

test("R7 (C28) a discarded knock offers put-back once the design's keys exist, sending status new; a new knock offers discard and no put-back", async () => {
  const K = { knock_id: "KNOCK-2026-10-03-9c1f0a2b", sha256: "1".repeat(64), bytes: 500, note: "n", received: "2026-10-03T10:00:00Z", status: "discarded", resolve_reason: "dup", pseudonym: null, knocker_digest: null };
  const at = (k) => open(`/app/inbox/${k.knock_id}`, { plane: { inbox: ok({ inbox: [k] }), inboxget: ok({ ok: true, item: k }), inboxresolve: ok({ ok: true, status: "new" }) } });
  const p = await at(K);
  const put = main(p).querySelector('button[data-act="inboxresolve"]');
  if (hasKey("act.inboxresolve.label.inbox.putback")) {
    await press(p, "inboxresolve", { reason: "Mistake." });
    assert.equal(p.byOp("inboxresolve")[0].body.status, "new");
  } else assert.equal(put, null, "no raw key is drawn while the row is missing");
  const n = await at({ ...K, status: "new" });
  assert.ok(btn(n, "inboxresolve") && btn(n, "inboxpull"), "control: a new knock offers discard");
});
