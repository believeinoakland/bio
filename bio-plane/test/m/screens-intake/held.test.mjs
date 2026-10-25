/* screens-intake R4: the `held` screen (DEC-97) on the real served page: its read, its rows and picks, the hold strip's
 * acts and the restore. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open as openPage, html, text, main, btn, fill, press, ok, refused, rawKeys, word, hasWord, says, saysIn } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";
import { heldSetAside } from "../capture/fixtures.mjs";

/* B6: a row names its project by the project's name (`projectlist`), never by its record id */
const PROJECTS = ok({ projects: [{ id: "PROJ-2026-0001-pothole-repairs-at", name: "Pothole repairs" }, { id: "PROJ-2026-0002-sewer-fund-transfers", name: "Sewer" },
                                  { id: "PROJ-2026-0003-coliseum-lease-terms", name: "Coliseum" }] });
const open = (path, o = {}) => openPage(path, { ...o, plane: { projectlist: PROJECTS, ...(o.plane || {}) } });

/* cs.date's form (interface-shell R6), by its keys */
const day = (d, m, y) => word("date.daymonthyear", { day: String(d), month: word(`date.month.${m}`), year: String(y) });

const ROWS = [
  { bundle_id: "INFO-2026-0001-photo", title: "Photo · Seminary Ave", project: "PROJ-2026-0001-pothole-repairs-at", age_days: 2, eligible: true,
    source: { address: "upload:aa" }, captured_for: { questions: [], withheld: null } },
  { bundle_id: "INFO-2026-0002-budget", title: "City budget", project: null, age_days: 1, eligible: true,
    captured_for: { questions: [{ question: "INQ-1", title: "Were the transfers authorised?", asker: "Ana" }], withheld: null } },
  { bundle_id: "INFO-2026-0003-minutes", title: "Council minutes", project: "PROJ-2026-0002-sewer-fund-transfers", age_days: 3, eligible: true,
    captured_for: { questions: [], withheld: "withheld" } },
  { bundle_id: "INFO-2026-0004-lease", title: "Lease amendment", project: "PROJ-2026-0003-coliseum-lease-terms", age_days: 0, eligible: false, class: "CRUCIAL_IN_BATCH", reason: "crucial-criticality material is never batch-released (the catalogue's sentence).",
    captured_for: { questions: [], withheld: null } },
  { bundle_id: "INFO-2026-0005-packet", title: "Agenda packet (ZIP)", project: "PROJ-2026-0002-sewer-fund-transfers", age_days: 1, eligible: null, captured_for: null,
    captured_for_basis: "no reader answered",
    archive: { sha256: "d".repeat(64), entries: 41, filed: 36, already_held: 1, not_filed: 2, waiting: 0 },
    files: [{ document: "INFO-2026-0006-agenda", sha256: "e".repeat(64), index: 1, name: "01_Agenda.pdf", grade: "B", eligible: true }],
    files_total: 36, files_truncated: true },
];
const HELD = ok({ ok: true, held: ROWS, truncated: false });
const NONE = ok({ ok: true, held: [] });
/* capture R88: `state: "set_aside"` reads the set-aside list, any other query the held one */
const LISTS = (held, aside = NONE) => (req) => (req.query.state === "set_aside" ? aside : held);
const pick = async (p, id) => p.click(main(p).querySelector(`#pick-held-${id}`));

test("R4 the screen reads heldcaptures; a list with no row is drawn in the screen's own empty sentence", async () => {
  const p = await open("/app/held", { plane: { heldcaptures: LISTS(HELD) } });
  /* C14 (capture R102): the page as picker rows, the set-aside list, and the full fields of the rows the page draws; no other read */
  assert.deepEqual(p.byOp("heldcaptures").map((r) => (r.query.state ? "state:" + r.query.state : r.query.fields ? "fields:" + r.query.fields : r.query.bundle_ids ? "bundle_ids" : "page")).sort(), ["bundle_ids", "fields:picker", "state:set_aside"]);
  const e = await open("/app/held", { plane: { heldcaptures: ok({ ok: true, held: [] }) } });
  assert.ok(says(e, "screen.held.empty"));
  /* control: a read that failed is drawn as failed, never as empty */
  const f = await open("/app/held", { plane: { heldcaptures: refused("STORE_SILENT", "store silent (test fixture)") } });
  /* interface-shell R61: a refusal with its own words is drawn as those words alone */
  assert.match(text(f), /store silent \(test fixture\)/);
  assert.ok(main(f).querySelector('[data-state="failed"]'));
  assert.ok(!says(f, "state.failed", { reason: "x" }) && !text(f).includes(word("state.failed", { reason: "" }).split("{")[0].trim()));
  assert.ok(!says(f, "screen.held.empty"));
});

test("R4 each row with its title, age and project; the questions it waits for; withheld and refused marks with their reasons", async () => {
  const p = await open("/app/held", { plane: { heldcaptures: LISTS(HELD) } });
  const t = text(p);
  for (const r of ROWS) assert.ok(main(p).querySelector(`#pick-held-${r.bundle_id}`), r.bundle_id);
  assert.ok(t.includes(`${word("screen.held.age", { days: 2 })} · ${word("screen.held.project", { project: "Pothole repairs" })}`));
  assert.ok(t.includes(`${word("screen.held.age.today")} · ${word("screen.held.project", { project: "Coliseum" })}`));
  assert.ok(t.includes(word("screen.held.for", { asker: "Ana", title: "Were the transfers authorised?" })));
  assert.ok(main(p).querySelector('[data-gap="withheld"]'));
  assert.ok(t.includes(word("screen.held.withheld")));
  assert.ok(main(p).querySelector('[data-gap="refused"]'));
  assert.ok(t.includes(`${word("screen.held.ineligible", { reason: word("screen.held.ineligible.crucial") })} ${word("screen.held.ineligible.alone")}`));
  assert.ok(!t.includes("the catalogue"), "R23: never the catalogue's sentence");
  assert.ok(main(p).querySelector('[data-gap="undetermined"]'), "an undetermined eligibility is stated, never drawn eligible");
  assert.deepEqual(rawKeys(p), []);
  /* control: an eligible row with nothing withheld carries no gap mark */
  const one = await open("/app/held", { plane: { heldcaptures: LISTS(ok({ ok: true, held: [ROWS[0]] })) } });
  assert.equal(main(one).querySelector("[data-gap]"), null);
});

test("R4 rows are picked (shell R19) and the hold strip offers heldsetaside and release; an archive's files open open-file", async () => {
  const p = await open("/app/held", { plane: { heldcaptures: LISTS(HELD) } });
  assert.equal(btn(p, "release"), null, "no strip before a pick");
  await pick(p, "INFO-2026-0001-photo");
  const strip = main(p).querySelector(".cs-hold");
  assert.ok(strip.querySelector('button[data-act="heldsetaside"]'));
  assert.ok(strip.querySelector('button[data-act="release"]'));
  assert.ok(strip.textContent.includes(word("shell.picked", { n: 1 })));
  const file = main(p).querySelector(`a.cs-ref[href="/app/open-file/${"e".repeat(64)}"]`);
  assert.equal(file.textContent, "01_Agenda.pdf");
  /* a document's screen is screens-inquiry's: registered alone, this module's page draws its card (shell R16) */
  assert.ok(main(p).querySelectorAll(".cs-card, a.cs-ref").some((e) => e.textContent === "City budget"));
  assert.ok(says(p, "screen.held.archive", { parts: `${word("screen.held.archive.filed", { count: 36 })}, ${word("screen.held.archive.notfiled", { count: 2 })}` }));
  assert.ok(says(p, "screen.held.archivemore", { shown: 1, total: 36 }));
});

test("R4 release: an enumerated selection of the picked rows, then the release over its handle, with the member's acknowledgment and mitigation", async () => {
  const p = await open("/app/held", { plane: { heldcaptures: LISTS(HELD), select: ok({ ok: true, handle: "SEL-1", n: 2 }),
    release: ok({ ok: true, released: ["INFO-2026-0001-photo", "INFO-2026-0002-budget"] }) } });
  await pick(p, "INFO-2026-0001-photo");
  await pick(p, "INFO-2026-0002-budget");
  fill(p, { "ch-ack": "Each copy is what its source gave.", "ch-mitigation": "Compared with the site." });
  await press(p, "release");
  assert.deepEqual(p.byOp("select")[0].body, { ids: ["INFO-2026-0001-photo", "INFO-2026-0002-budget"] });
  /* K3017: ratification's map reads handle, acknowledgment and mitigation from the query alone */
  const rq = p.byOp("release")[0];
  assert.equal(rq.query.handle, "SEL-1");
  assert.equal(rq.query.acknowledgment, "Each copy is what its source gave.");
  assert.equal(rq.query.mitigation, "Compared with the site.");
  assert.equal(rq.method, "POST");
  assert.ok(says(p, "screen.held.released", { count: 2 }));
  assert.ok(p.byOp("heldcaptures").length >= 2, "read again after the act (R8)");
});

test("R4 (K3114; ratification R51) release as ratification reads it: the three from the body, else the query; carried by neither, refused (control)", async () => {
  /* the plane stand-in reads as ratification R51 does: each of the three the body's string, else the query's */
  const field = (req, k) => (req.body && typeof req.body[k] === "string" ? req.body[k] : req.query[k]);
  const asR51 = (req) => (field(req, "handle") && field(req, "acknowledgment") && field(req, "mitigation")
    ? ok({ ok: true, released: ["INFO-2026-0001-photo"] }) : refused("NO_ACKNOWLEDGMENT", "Say what you vouch for."));
  const p = await open("/app/held", { plane: { heldcaptures: LISTS(HELD), select: ok({ ok: true, handle: "SEL-1" }), release: asR51 } });
  await pick(p, "INFO-2026-0001-photo");
  fill(p, { "ch-ack": "Each copy is what its source gave.", "ch-mitigation": "Compared with the site." });
  await press(p, "release");
  assert.ok(says(p, "screen.held.released", { count: 1 }));
  const rq = p.byOp("release")[0];
  assert.deepEqual([rq.body.handle, rq.body.acknowledgment, rq.body.mitigation], ["SEL-1", "Each copy is what its source gave.", "Compared with the site."]);
  /* controls, each both ways: the three in the body alone, or in the query alone, answer alike; in neither, refused */
  const F = { handle: "SEL-1", acknowledgment: "a", mitigation: "m" };
  assert.equal(asR51({ query: { op: "release" }, body: F }).json.ok, true);
  assert.equal(asR51({ query: { op: "release", ...F }, body: {} }).json.ok, true);
  assert.equal(asR51({ query: { op: "release" }, body: {} }).json.reason, "NO_ACKNOWLEDGMENT");
});

test("R4 release sends nothing with a field missing, or a field outside ratification R20's bounds", async () => {
  const cases = [[{ "ch-ack": "", "ch-mitigation": "" }, ["screen.held.vouchmissing", { fields: `${word("screen.held.ack")}, ${word("screen.held.mitigation")}` }]],
                 [{ "ch-ack": "a", "ch-mitigation": "" }, ["screen.held.vouchmissing", { fields: word("screen.held.mitigation") }]],
                 [{ "ch-ack": 'has a " quote', "ch-mitigation": "ok" }, ["screen.held.vouchbad", { field: word("screen.held.ack") }]],
                 [{ "ch-ack": "two\nlines", "ch-mitigation": "ok" }, ["screen.held.vouchbad", { field: word("screen.held.ack") }]],
                 [{ "ch-ack": "x".repeat(501), "ch-mitigation": "ok" }, ["screen.held.vouchbad", { field: word("screen.held.ack") }]]];
  for (const [values, [key, vars]] of cases) {
    const p = await open("/app/held", { plane: { heldcaptures: LISTS(HELD), select: ok({ ok: true, handle: "SEL" }) } });
    await pick(p, "INFO-2026-0001-photo");
    fill(p, values);
    const r = await press(p, "release");
    assert.equal(p.byOp("select").length + p.byOp("release").length, 0, JSON.stringify(values));
    assert.ok(saysIn(r.slot(), key, vars), JSON.stringify(values));
  }
  /* control: at 500 characters it is sent; a refused selection sends no release */
  const p = await open("/app/held", { plane: { heldcaptures: LISTS(HELD), select: ok({ ok: true, handle: "SEL" }) } });
  await pick(p, "INFO-2026-0001-photo");
  fill(p, { "ch-ack": "x".repeat(500), "ch-mitigation": "ok" });
  await press(p, "release");
  assert.equal(p.byOp("release").length, 1);
  const q = await open("/app/held", { plane: { heldcaptures: LISTS(HELD), select: refused("TOO_LARGE") } });
  await pick(q, "INFO-2026-0001-photo");
  fill(q, { "ch-ack": "a", "ch-mitigation": "b" });
  const r = await press(q, "release");
  assert.equal(q.byOp("release").length, 0);
  assert.ok(saysIn(r.slot(), "screen.held.selectfailed"));
});

test("R4 R13 heldsetaside: one reason (the shell's reason field, no writing help) for every picked row; they move to the Set aside list", async () => {
  let asideNow = NONE;
  /* capture's real answer for a document a question waits on (its published fixture, K5077): the document by `document`, `waiting` being `{questions, withheld}` */
  const SET_ASIDE = await heldSetAside({ ids: ["INFO-2026-0002-budget"], reason: "Wrong year.", author: "member:mai",
    waiting: [{ question: "INQ-1", title: "Were the transfers authorised?", asker: "Ana" }] });
  const AFTER = ok({ ok: true, held: [{ ...ROWS[1], set_aside: { reason: "Wrong year.", author: "mai", at: "2026-10-13T10:00:00Z" } }] });
  const p = await open("/app/held", { reachable: true, plane: { heldcaptures: (req) => (req.query.state === "set_aside" ? asideNow : HELD),
    heldsetaside: () => { asideNow = AFTER; return ok(SET_ASIDE); } } });
  assert.ok(!says(p, "screen.held.setaside"), "R19: an empty Set aside is not drawn");
  await pick(p, "INFO-2026-0002-budget");
  const r = await press(p, "heldsetaside", { reason: "Wrong year.", sel: ":not([data-id])" });
  assert.equal(r.slot() && r.slot().querySelector('[data-act="writinghelp"]'), null, "no writing help on a reason (K1841)");
  assert.deepEqual(p.byOp("heldsetaside")[0].body, { ids: ["INFO-2026-0002-budget"], reason: "Wrong year." });
  assert.ok(says(p, "screen.held.setasidecount", { count: 1 }));
  assert.ok(says(p, "screen.held.waiting", { asker: "Ana", capture: "City budget" }));
  assert.ok(text(p).includes(`${word("screen.held.asideby", { author: "mai", reason: "Wrong year." })} ${day(13, "october", 2026)}`), "read again, the row names who, why and when");
});

test("R13 the Set aside list: heldcaptures with state set_aside, each row naming who set it aside, when and why; heldrestore with a reason, in its panel and for picked rows", async () => {
  const ASIDE = ok({ ok: true, held: [
    { bundle_id: "INFO-2026-0002-budget", title: "City budget", project: "Sewer", capture: null, set_aside: { reason: "Wrong year.", author: "ben", at: "2026-09-30T12:00:00Z" } },
    { bundle_id: "INFO-2026-0007-memo", title: "Memo", project: null, capture: null, set_aside: { reason: "Duplicate.", author: "ana", at: "2026-10-01T12:00:00Z" } }] });
  const p = await open("/app/held", { plane: { heldcaptures: LISTS(HELD, ASIDE), heldrestore: (req) => ok({ ok: true, act: "restore", ids: req.body.ids }) } });
  assert.equal(p.byOp("heldcaptures").find((r) => r.query.state === "set_aside").query.state, "set_aside");
  const t = text(p);
  assert.ok(t.includes(`${word("screen.held.asideby", { author: "ben", reason: "Wrong year." })} ${day(30, "september", 2026)}`));
  assert.ok(t.includes(`${word("screen.held.asideby", { author: "ana", reason: "Duplicate." })} ${day(1, "october", 2026)}`));
  /* in its row's panel: the one row, set aside in an earlier visit */
  await press(p, "heldrestore", { reason: "Right year after all.", sel: '[data-id="INFO-2026-0002-budget"]' });
  assert.deepEqual(p.byOp("heldrestore")[0].body, { ids: ["INFO-2026-0002-budget"], reason: "Right year after all." });
  assert.ok(says(p, "screen.held.restored", { count: 1 }));
  /* in the hold strip, for the picked rows */
  const q = await open("/app/held", { plane: { heldcaptures: LISTS(HELD, ASIDE), heldrestore: (req) => ok({ ok: true, act: "restore", ids: req.body.ids }) } });
  await q.click(main(q).querySelector("#pick-aside-INFO-2026-0002-budget"));
  await q.click(main(q).querySelector("#pick-aside-INFO-2026-0007-memo"));
  await press(q, "heldrestore", { reason: "Both belong.", sel: ":not([data-id])" });
  assert.deepEqual(q.byOp("heldrestore")[0].body, { ids: ["INFO-2026-0002-budget", "INFO-2026-0007-memo"], reason: "Both belong." });
  assert.ok(says(q, "screen.held.restored", { count: 2 }));
  /* control: the Held list offers no restore, and a failed set-aside read is drawn failed, never empty */
  const f = await open("/app/held", { plane: { heldcaptures: (req) => (req.query.state === "set_aside" ? refused("STORE_SILENT", "store silent (test fixture)") : HELD) } });
  assert.equal(btn(f, "heldrestore"), null);
  assert.ok(!says(f, "screen.held.asideempty"));
  /* interface-shell R61: a refusal with its own words is drawn as those words alone */
  assert.match(text(f), /store silent \(test fixture\)/);
  assert.ok(main(f).querySelector('[data-state="failed"]'));
});

test("R11 each row's grade is one mark from capture.grade, never a received or authored capture drawn as measured; its thumbnail opens open-file", async () => {
  const S1 = "1".repeat(64), S2 = "2".repeat(64), S3 = "3".repeat(64), S4 = "4".repeat(64);
  const rows = [
    { bundle_id: "INFO-A", title: "Fetched", capture: { sha256: S1, grade: { grade: "B", route: "direct", determined: true, basis: null } } },
    { bundle_id: "INFO-B", title: "Uploaded", capture: { sha256: S2, grade: { grade: null, route: "upload", determined: false, basis: "CAPTURE_RECEIVED_NOT_FETCHED" } } },
    { bundle_id: "INFO-C", title: "Seen", capture: { sha256: S3, grade: { grade: null, route: "unrecorded", determined: false, basis: "CAPTURE_AXIS_AUTHORED" } } },
    { bundle_id: "INFO-D", title: "Stated", capture: { sha256: S4, grade: { grade: "C", route: "unrecorded", determined: false, basis: null } } },
    { bundle_id: "INFO-E", title: "Nothing filed", capture: null },
  ];
  const p = await open("/app/held", { plane: { heldcaptures: LISTS(ok({ ok: true, held: rows })) } });
  const row = (id) => main(p).querySelector(`#pick-held-${id}`).parentNode.parentNode;
  const grades = (id) => row(id).querySelectorAll(".cs-grade");
  assert.equal(grades("INFO-A").length, 1);
  assert.match(grades("INFO-A")[0].textContent, /B$/);
  assert.equal(grades("INFO-B").length, 0, "a received capture earns no letter");
  assert.ok(saysIn(row("INFO-B"), "screen.held.grade.received"));
  assert.equal(grades("INFO-C").length, 0);
  assert.ok(saysIn(row("INFO-C"), "screen.held.grade.testimony"));
  assert.ok(row("INFO-D").textContent.includes(word("screen.held.grade.stated")) && grades("INFO-D")[0].textContent.endsWith("C"));
  assert.ok(saysIn(row("INFO-E"), "state.undetermined", { reason: word("screen.held.grade.nocapture") }));
  /* the thumbnail opens open-file for capture.sha256; a row with no capture has none */
  for (const [id, sha] of [["INFO-A", S1], ["INFO-B", S2], ["INFO-C", S3], ["INFO-D", S4]])
    assert.ok(row(id).querySelector(`a.cs-ref[href="/app/open-file/${sha}"]`), id);
  assert.equal(row("INFO-E").querySelector('a.cs-ref[href^="/app/open-file/"]'), null);
  assert.deepEqual(rawKeys(p), []);
});

test("R4 heldcaptures (\"See held captures\") asks the list again", async () => {
  const p = await open("/app/held", { plane: { heldcaptures: LISTS(HELD) } });
  await press(p, "heldcaptures", { reason: "refresh" });
  assert.ok(p.byOp("heldcaptures").length >= 3);
});

test("R23 a held row's refusal is drawn by its words, never the catalogue's text; a crucial capture is still refused, in words", async () => {
  const CAT = "the catalogue's own sentence for a class (never the member's)";
  const rows = [
    { bundle_id: "INFO-X1", title: "Crucial", eligible: false, class: "CRUCIAL_IN_BATCH", reason: CAT },
    { bundle_id: "INFO-X2", title: "Contested", eligible: false, class: "CONTESTED_IN_BATCH", reason: CAT },
    { bundle_id: "INFO-X3", title: "Incomplete", eligible: false, class: "ENTRY_REQUIREMENTS", reason: CAT },
    { bundle_id: "INFO-X4", title: "Odd", eligible: false, class: "SOMETHING_NEW", reason: CAT },
    { bundle_id: "INFO-X5", title: "Plain", eligible: false, reason: CAT },
  ];
  const p = await open("/app/held", { plane: { heldcaptures: LISTS(ok({ ok: true, held: rows })) } });
  const row = (id) => main(p).querySelector(`#pick-held-${id}`).parentNode.parentNode;
  assert.ok(!text(p).includes(CAT), "no row draws the catalogue's text");
  assert.ok(saysIn(row("INFO-X1"), "screen.held.ineligible.crucial"));
  assert.ok(saysIn(row("INFO-X2"), "screen.held.ineligible.contested"));
  for (const id of ["INFO-X1", "INFO-X2", "INFO-X3", "INFO-X4", "INFO-X5"]) {
    assert.ok(row(id).querySelector('[data-gap="refused"]'), id);
    assert.ok(saysIn(row(id), "screen.held.ineligible.alone"), id);
  }
  /* control: the other class's sentence is not drawn for a crucial one */
  assert.ok(!saysIn(row("INFO-X1"), "screen.held.ineligible.contested"));
  /* the release over a crucial pick is refused CRUCIAL_IN_BATCH and drawn in its words, counting the offenders */
  const q = await open("/app/held", { plane: { heldcaptures: LISTS(ok({ ok: true, held: rows })), select: ok({ ok: true, handle: "SEL" }),
    release: refused("CRUCIAL_IN_BATCH", CAT, 400, { offenders: ["INFO-X1"] }) } });
  await pick(q, "INFO-X1");
  fill(q, { "ch-ack": "a", "ch-mitigation": "b" });
  const r = await press(q, "release");
  assert.ok(saysIn(r.slot(), "refusal.CRUCIAL_IN_BATCH", { count: 1 }), r.slot().textContent);
  assert.ok(!r.slot().textContent.includes("{count}"));
  assert.ok(!r.slot().textContent.includes(CAT));
  /* ENTRY_REQUIREMENTS names each offender with what it lacks */
  const e = await open("/app/held", { plane: { heldcaptures: LISTS(ok({ ok: true, held: rows })), select: ok({ ok: true, handle: "SEL" }),
    release: refused("ENTRY_REQUIREMENTS", CAT, 400, { offenders: [{ id: "INFO-X3", missing: ["data/dataset.json"] }] }) } });
  await pick(e, "INFO-X3");
  fill(e, { "ch-ack": "a", "ch-mitigation": "b" });
  const s = await press(e, "release");
  assert.ok(saysIn(s.slot(), "refusal.ENTRY_REQUIREMENTS", { offenders: "INFO-X3 (data/dataset.json)" }), s.slot().textContent);
  /* control: any other code is the shell's (R13): the answer's own words */
  const o = await open("/app/held", { plane: { heldcaptures: LISTS(ok({ ok: true, held: rows })), select: ok({ ok: true, handle: "SEL" }),
    release: refused("SOMETHING_ELSE", "The owner's own words.") } });
  await pick(o, "INFO-X4");
  fill(o, { "ch-ack": "a", "ch-mitigation": "b" });
  assert.match((await press(o, "release")).slot().textContent, /The owner's own words\./);
});

test("R26 every key the held screen reads is a word of the list, and its rows draw word(key, vars)", async () => {
  const keys = SCREENS.find((x) => x.id === "held").words;
  for (const k of keys) assert.ok(hasWord(k), k);
  const p = await open("/app/held", { plane: { heldcaptures: LISTS(HELD) } });
  for (const k of ["screen.held.sub"]) assert.ok(says(p, k), k);
  assert.ok(says(p, "screen.held.age.today"));
  assert.ok(says(p, "screen.held.noproject"));
});

/* ---- T50 (T50-30): R35, R37; T51 (T51-117): R40 ---- */
/* capture R77 (T51): a row answers `actor`, `retrieved` and `bytes` of its own; `memberlist` gives the uploader's handle */
const UP = (more = {}) => ({ bundle_id: "INFO-2026-0020-up", title: "Pothole photo", project: null, age_days: 2, eligible: true, collected_since: "2026-10-02T10:00:00Z",
  source: { address: `upload:${"a".repeat(64)}`, via: "upload", retrieved: "2026-10-04T10:00:00Z" }, captured_for: { questions: [], withheld: null },
  capture: { sha256: "a".repeat(64), grade: null }, actor: "member:rosa", retrieved: "2026-10-04T10:00:00Z", bytes: 2300, ...more });
const ROSTER = ok({ members: [{ member_id: "rosa", handle: "rosa-h", role: "member", status: "active" }] });
const heldOf = (rows, roster = ROSTER) => open("/app/held", { plane: { heldcaptures: LISTS(ok({ ok: true, held: rows, truncated: false })), memberlist: roster } });

test("R35 R40 a held upload reads uploaded by its member's handle and the day of retrieved, then its size, never upload:<hex>", async () => {
  const p = await heldOf([UP()]);
  const t = text(p);
  const by = word("document.uploaded.by", { member: "rosa-h", date: day(4, "october", 2026) });
  assert.ok(t.includes(`${by} · ${word("size.kb", { n: "2" })}`), "the uploader, then the size, in the same row");
  assert.ok(!t.includes("upload:") && !t.includes("a".repeat(16)), "no raw fingerprint, no upload:<hex>");
  assert.ok(!t.includes(day(2, "october", 2026)), "the row's own collected_since is not the upload's date");
  assert.ok(!t.includes("member:rosa") && !/\brosa\b(?!-)/.test(t), "the handle, never the stamp's id");
  /* the size words: below 1 KB, KB, MB */
  for (const [bytes, expected] of [[200, word("size.small")], [3 * 1048576, word("size.mb", { n: "3.0" })]]) {
    const q = await heldOf([UP({ bytes })]);
    assert.ok(text(q).includes(expected), String(bytes));
    assert.ok(!/\b\d+ B\b/.test(text(q)), "never a byte count");
  }
  assert.ok(p.byOp("memberlist").length >= 1, "the shell's roster gives the handle (interface-shell R111)");
});

test("R35 R40 controls: a fetched row still names its address; an upload row answering none of the three draws no raw source and no sentence with a blank; an archive's row draws the archive's size", async () => {
  const fetched = UP({ source: { address: "https://city.example/notice.pdf", via: "fetch" }, actor: null, retrieved: null, bytes: null });
  const p = await heldOf([fetched]);
  assert.ok(text(p).includes(word("screen.held.from", { address: "https://city.example/notice.pdf" })));
  assert.ok(!text(p).includes(word("document.uploaded.by", { member: "x", date: "y" }).split("x")[0].trim()));
  const q = await heldOf([UP({ actor: null, retrieved: null, bytes: null })]);
  assert.ok(!text(q).includes("upload:") && !text(q).includes("a".repeat(16)));
  assert.ok(!text(q).includes(word("document.uploaded.by", { member: "x", date: "y" }).split("x")[0].trim()));
  assert.ok(!text(q).includes(word("size.small")) && !text(q).includes(word("size.kb", { n: "2" })), "no size where the row answers none");
  /* C94: an uploader the roster does not name is not named by an id; the fallback word stands for her */
  const stranger = await heldOf([UP({ actor: "member:nobody" })]);
  assert.ok(!text(stranger).includes("nobody") && text(stranger).includes(word("document.uploaded.by", { member: word("shell.card.member"), date: day(4, "october", 2026) })));
  assert.ok(text(stranger).includes(word("size.kb", { n: "2" })));
  /* an archive's row draws the archive's size */
  const zip = await heldOf([UP({ bytes: 5 * 1048576, archive: { sha256: "d".repeat(64), entries: 3, filed: 3, already_held: 0, not_filed: 0, waiting: 0 }, files: [], files_total: 3, files_truncated: false })]);
  assert.ok(text(zip).includes(word("size.mb", { n: "5.0" })));
  /* held's own two lists stay held and set_aside: it lists no vouched row */
  assert.ok(p.byOp("heldcaptures").every((r) => r.query.state === undefined || r.query.state === "set_aside"), "held reads no vouched row");
});

const ZIP = (more = {}) => ({ bundle_id: "INFO-2026-0030-packet", title: "Agenda packet (ZIP)", project: "PROJ-2026-0002-sewer-fund-transfers", age_days: 1, eligible: true, captured_for: { questions: [], withheld: null },
  archive: { sha256: "d".repeat(64), entries: 38, filed: 36, already_held: 0, not_filed: 2, waiting: 0 },
  files: [{ document: "INFO-2026-0031-agenda", sha256: "e".repeat(64), index: 1, name: "01_Agenda.pdf", grade: "B", eligible: true }], files_total: 36, files_truncated: false, ...more });

test("R37 a held ZIP draws its summary in both parts and one door, Open its files, a reference of kind archive for the archive's digest; the files it lists sit under it", async () => {
  const p = await heldOf([ZIP()]);
  assert.ok(text(p).includes(word("screen.held.archive", { parts: `${word("screen.held.archive.filed", { count: 36 })}, ${word("screen.held.archive.notfiled", { count: 2 })}` })));
  assert.ok(text(p).includes(word("screen.held.archivefiles")), "the door's words");
  const door = main(p).querySelectorAll("[data-tip]").find((e) => e.textContent === word("screen.held.archivefiles"));
  assert.ok(door && door.getAttribute("data-tip").startsWith(`<b>${word("shell.card.archive")}</b>`), "the door is a reference of kind archive, with its card");
  assert.ok(text(p).includes("01_Agenda.pdf"), "its files listed beside it");
  assert.deepEqual(rawKeys(p), []);
});

test("R37 the door opens archive with the archive's own digest as its subject (needs interface-shell R81's kind)", async () => {
  const p = await heldOf([ZIP()]);
  const door = main(p).querySelector(`a.cs-ref[href="/app/archive/${"d".repeat(64)}"][data-nav]`);
  assert.ok(door, "a link to archive for the archive's digest");
  assert.equal(door.textContent, word("screen.held.archivefiles"));
});

test("R37 controls: no not-filed part at zero, no summary at all at zero both; truncation said with shown and total; a row whose files is null says nothing of a count", async () => {
  const a = await heldOf([ZIP({ archive: { sha256: "d".repeat(64), entries: 36, filed: 36, already_held: 0, not_filed: 0, waiting: 0 } })]);
  assert.ok(text(a).includes(word("screen.held.archive", { parts: word("screen.held.archive.filed", { count: 36 }) })));
  assert.ok(!text(a).includes(word("screen.held.archive.notfiled", { count: 0 })) && !text(a).includes("0 not filed"));
  const z = await heldOf([ZIP({ archive: { sha256: "d".repeat(64), entries: 3, filed: 0, already_held: 3, not_filed: 0, waiting: 0 } })]);
  assert.ok(!text(z).includes(word("screen.held.archive", { parts: "x" }).split("x")[0].trim()), "no summary line with nothing in it");
  assert.ok(text(z).includes(word("screen.held.archivefiles")), "the door remains");
  const t = await heldOf([ZIP({ files_truncated: true })]);
  assert.ok(text(t).includes(word("screen.held.archivemore", { shown: 1, total: 36 })));
  const n = await heldOf([ZIP({ files: null, files_total: undefined, files_truncated: false })]);
  assert.ok(text(n).includes(word("screen.held.archivefiles")), "the summary and the door");
  const tail = word("screen.held.archivemore", { shown: "@", total: "#" }).split("#")[1].trim();
  assert.ok(!text(n).includes(tail), "no count it does not hold");
});

test("R37 control: an ordinary row, and a file cut out of an archive (archive: {sha256} alone), draw no door", async () => {
  const p = await heldOf([UP(), { bundle_id: "INFO-2026-0032-cut", title: "A file from a ZIP", project: null, age_days: 1, eligible: true, captured_for: { questions: [], withheld: null }, archive: { sha256: "d".repeat(64) } }]);
  assert.ok(!text(p).includes(word("screen.held.archivefiles")));
});

test("B6 a row names its project by its name, never its record id; a project the list does not name is not named at all; no project says so", async () => {
  const id = "PROJ-2026-0001-pothole-repairs-at";
  const p = await heldOf([UP({ project: id })]);
  assert.ok(text(p).includes(word("screen.held.project", { project: "Pothole repairs" })));
  assert.ok(!text(p).includes(id) && !text(p).includes("pothole-repairs-at"), "no slug, no id");
  const unnamed = await heldOf([UP({ project: "PROJ-2026-0099-roof-repairs-at-city-hall" })]);
  assert.ok(!text(unnamed).includes("roof-repairs") && !text(unnamed).includes("PROJ-"), "an unnamed project is not drawn as its id");
  assert.ok(!text(unnamed).includes(word("screen.held.noproject")), "and is not said to be no project");
  const none = await heldOf([UP({ project: null })]);
  assert.ok(text(none).includes(word("screen.held.noproject")));
  /* an archive's listed file with no name is not drawn as its record id */
  const zip = await heldOf([UP({ archive: { sha256: "d".repeat(64), entries: 1, filed: 1, already_held: 0, not_filed: 0, waiting: 0 }, files: [{ document: "INFO-2026-0031-roof-repairs-at", sha256: "e".repeat(64), index: 1, name: null, grade: "B", eligible: true }], files_total: 1, files_truncated: false })]);
  assert.ok(!text(zip).includes("INFO-2026-0031") && !text(zip).includes("roof-repairs-at"));
});
