/* R2's first three CONDITION kinds and R3's grade note at conditionItems' interface (R1), copied from queue-producers'
   `conditions.test.mjs` (its R3, R22; K1850): the governor's cool-off condition (its item contract, its basis, its
   sentences, its subject the host, its documents gathered from that host), a parked capture and a machine-completed
   document, each clearing for every member at once when its own fact stops being true, with nothing written to clear
   it (R1, R7). The governor is a fake that answers `governorHolding({now})` as host-governor R14 does
   (`cooloff_until > now`); the capture ledger a fake in capture R46's shape; the manifest, the register, the captured
   addresses and membership are real. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";
import { homeOfHomed, sha } from "../provenance/fixtures.mjs";
import { word, hasWord } from "../../../src/setup-words/index.mjs";
import { MACHINE_AUTHOR_PREFIX } from "../../../src/record-grammar/actors.mjs";

const HOST = "www.example.gov";
const AGENDA = `https://${HOST}/documents/agenda.pdf`;

function corpus() {
  const holds = [];
  const sessions = [];
  const w = world({
    governor: { governorHolding: ({ now }) => holds.filter((h) => h.cooloff_until > now) },
    capture: { liveCaptureSessions: () => [...sessions] },
    provenance: homeOfHomed({ [sha("cap88")]: "INFO-88", [sha("capP")]: "PRJ-1" }) });
  w.member("carol"); w.member("dave");
  w.bundle("INFO-88", "information", { title: "Controller memo" });
  w.bundle("INQ-2", "inquiry"); w.bundle("INQ-1", "inquiry"); w.bundle("PRJ-1", "project");
  w.leg("INQ-2", "INFO-88"); w.leg("INQ-1", "INQ-2"); w.cite("PRJ-1", "INFO-88");
  w.join("PRJ-1", "carol", { owner: true });
  w.run(`INSERT INTO register (capture_sha, bundle_id, path, encoding, registered, bytes) VALUES ('cap88','INFO-88','snapshots/agenda.pdf','binary',?,10)`, iso(NOW));
  w.run(`INSERT INTO captured_locators (address_norm, address, capture_sha, via, first_retrieved, last_retrieved, observations) VALUES (?,?,?,?,?,?,1)`,
    AGENDA, AGENDA, "cap88", "direct", iso(NOW), iso(NOW));
  const manifest = (key, author, created) => w.run(`INSERT INTO manifest (bundle_id, snap_key, kind, base, author, created, files_json)
    VALUES ('INFO-88', ?, 'revision', 'b', ?, ?, '[]')`, key, author, created);
  return { w, holds, sessions, manifest };
}

test("R2: governor-holding-host is the governor's own cool-off, read at the read's instant: the item contract key for key, its basis the governor's row, its subject the host, its documents those captured from it", () => {
  const { w, holds } = corpus();
  assert.equal(w.read("carol").items.some((i) => i.class === "CONDITION"), false, "absent before any machinery fact exists, never stubbed");
  holds.push({ host: HOST, cooloff_until: NOW + 90000, refusals: 1, last_refusal_status: 429, last_refusal_at: NOW - 30000,
               appetite_per_min: 60, granted: 4, refused_total: 1 });
  const gov = byId(w.read("carol"))[`CONDITION::governor-holding-host::${HOST}`];
  assert.deepEqual(["id", "class", "kind", "case", "subject", "summary", "detail", "basis", "age", "assignee", "options"]
    .filter((k) => !(k in gov)), [], "the one item contract, key for key");
  assert.deepEqual([gov.class, gov.kind], ["CONDITION", "governor-holding-host"]);
  assert.deepEqual([gov.case.state, gov.case.ancestors.map((a) => [a.id, a.depth])],
    ["determined", [["INQ-1", 2], ["INQ-2", 1], ["PRJ-1", 1]]], "homed through the walk from the documents behind it");
  assert.deepEqual([gov.basis.source, gov.basis.host, gov.basis.refusals, gov.basis.last_refusal_status, gov.basis.cooloff_until,
    gov.basis.retry_in_ms, gov.basis.last_refusal_at], ["host_governor", HOST, 1, 429, NOW + 90000, 90000, NOW - 30000]);
  assert.deepEqual([gov.basis.detail.includes("OUR OWN machinery"), gov.summary.includes("PACED, not broken"),
    gov.detail.includes(HOST)], [true, true, true],
    "what a condition is for: our machinery, distinguishable from the source failing (D-104)");
  assert.deepEqual([gov.subject.kind, gov.subject.host, gov.subject.id, gov.subject.bundles], ["host", HOST, null, ["INFO-88"]]);
  assert.deepEqual(gov.options, [{ id: "opt", on: ["INFO-88"] }], "the acts on the documents behind it, and none of its own");
  assert.deepEqual([gov.assignee, gov.assignee_role], [null, null]);
  assert.deepEqual(gov.age, { state: "determined", since: iso(NOW - 30000).replace("Z", ".000Z"), ms: 30000 });
  // it resolves by the hold ending, for every member at once: the governor is asked at the read's own instant
  const after = NOW + 90000 + 60000;
  for (const who of ["carol", "dave"]) {
    assert.ok(byId(w.read(who))[`CONDITION::governor-holding-host::${HOST}`], `${who} holds it while the hold lasts`);
    assert.equal(byId(w.read(who, `member:${who}`, { now: after }))[`CONDITION::governor-holding-host::${HOST}`], undefined,
      `the hold expires and it is gone from ${who}'s feed`);
  }
});

test("R2: partial-capture-outstanding is the capture ledger's own row, about the document its bytes were registered under; withheld whole from a viewer who may not see it; gone when the session is", () => {
  const { w, sessions } = corpus();
  sessions.push({ session: "cs_partial", locator: AGENDA, primarySha: sha("cap88"), created: iso(NOW - 5000), updated: iso(NOW),
                  expires: iso(NOW + 60000), ticks: 2, state: { queue: ["a", "b", "c"], discovered: 41, spent: 45 } });
  sessions.push({ session: "cs_project", locator: `https://${HOST}/packet.pdf`, primarySha: sha("capP"), created: iso(NOW), updated: iso(NOW),
                  expires: iso(NOW + 60000), ticks: 1, state: { queue: ["z"] } });
  const c = byId(w.read("carol")), d = w.read("dave");
  const p = c["CONDITION::partial-capture-outstanding::cs_partial"];
  assert.deepEqual([p.subject.kind, p.subject.id], ["bundle", "INFO-88"]);
  assert.deepEqual([p.basis.source, p.basis.session, p.basis.primary_sha, p.basis.bundle_id, p.basis.outstanding,
    p.basis.discovered, p.basis.state_readable], ["capture_sessions", "cs_partial", sha("cap88"), "INFO-88", 3, 41, true]);
  assert.deepEqual([p.detail.includes(`tick ${p.basis.ticks}`), p.basis.detail.includes("SCRATCH and not record")], [true, true],
    "a partial capture is not a broken one");
  assert.ok(c["CONDITION::partial-capture-outstanding::cs_project"], "carol, who owns the project, gets the condition about its capture");
  assert.equal(byId(d)["CONDITION::partial-capture-outstanding::cs_project"], undefined, "dave gets nothing about it: withheld whole");
  assert.ok(!JSON.stringify(d).includes("PRJ-1"), "the project's id appears nowhere in dave's answer, no count included");
  sessions.length = 0;
  for (const who of ["carol", "dave"])
    assert.ok(!w.read(who).items.some((i) => i.kind === "partial-capture-outstanding"), `the session dropped, it clears for ${who}`);
});

test("R2: partial-capture-outstanding is not raised for a large fetch parked as owed work (fetch_pending, no primary yet); control: a real partial capture still is, beside it (G25, K4577)", () => {
  const { w, sessions } = corpus();
  const NO_PRIMARY = "0".repeat(64);
  sessions.push({ session: "cs_parked", locator: `https://${HOST}/big.pdf`, primarySha: NO_PRIMARY, created: iso(NOW - 5000), updated: iso(NOW),
                  expires: iso(NOW + 60000), ticks: 0,
                  state: { queue: ["https://x.example/a"], opened_by: "carol", fetch_pending: { since: iso(NOW - 5000), declared_bytes: 16000000, why: "large" } } });
  sessions.push({ session: "cs_failed", locator: `https://${HOST}/bigger.pdf`, primarySha: NO_PRIMARY, created: iso(NOW - 5000), updated: iso(NOW),
                  expires: iso(NOW + 60000), ticks: 0,
                  state: { queue: ["https://x.example/b"], fetch_pending: { since: iso(NOW - 5000), declared_bytes: 30000000, why: "large", failed: "TOO_BIG" } } });
  assert.deepEqual(w.read("carol").items.filter((i) => i.kind === "partial-capture-outstanding"), [],
    "a parked fetch, or one that ended in a stated refusal, has captured nothing: no ceiling was reached, so no partial capture");
  sessions.push({ session: "cs_partial", locator: AGENDA, primarySha: sha("cap88"), created: iso(NOW - 5000), updated: iso(NOW),
                  expires: iso(NOW + 60000), ticks: 2, state: { queue: ["a", "b", "c"], discovered: 41, spent: 45 } });
  assert.deepEqual(w.read("carol").items.filter((i) => i.kind === "partial-capture-outstanding").map((i) => i.id),
    ["CONDITION::partial-capture-outstanding::cs_partial"], "control: the real partial capture is still raised, and only it");
});

test("R2: capture-completed-unattended is the manifest's sequence, a person's document then a machine's revision, its writer named by the catalogue's one prefix; it clears when a person authors again", () => {
  const { w, manifest } = corpus();
  manifest("k1", "carol", "2026-07-31T12:00:00Z");
  const id = "CONDITION::capture-completed-unattended::INFO-88";
  assert.equal(byId(w.read("carol"))[id], undefined, "a person's own document, written last by a person, raises nothing");
  manifest("k2", `${MACHINE_AUTHOR_PREFIX}member`, "2026-07-31T18:00:00Z");
  const u = byId(w.read("carol"))[id];
  assert.deepEqual([u.kind, u.subject.kind, u.subject.id], ["capture-completed-unattended", "bundle", "INFO-88"]);
  assert.deepEqual([u.basis.source, u.basis.started_by, u.basis.completed_by, u.basis.started_created, u.basis.completed_created],
    ["manifest", "carol", `${MACHINE_AUTHOR_PREFIX}member`, "2026-07-31T12:00:00Z", "2026-07-31T18:00:00Z"],
    "both halves of the sequence: who left it and who finished it");
  assert.ok(u.basis.detail.includes("NAMED, never anonymous"));
  assert.deepEqual(u.age, { state: "determined", since: "2026-07-31T18:00:00Z", ms: NOW - Date.parse("2026-07-31T18:00:00Z") });
  assert.ok(byId(w.read("dave"))[id], "a shared fact: every member who sees the document holds it");
  // a document only ever written by a machine was never walked away from
  w.bundle("INFO-99");
  w.run(`INSERT INTO manifest (bundle_id, snap_key, kind, base, author, created, files_json) VALUES ('INFO-99','m1','revision','b',?,?,'[]')`,
    `${MACHINE_AUTHOR_PREFIX}daemon`, iso(NOW));
  assert.equal(byId(w.read("carol"))["CONDITION::capture-completed-unattended::INFO-99"], undefined);
  // the member comes back
  manifest("k3", "carol", "2026-08-01T09:00:00Z");
  for (const who of ["carol", "dave"]) assert.equal(byId(w.read(who))[id], undefined, `it clears for ${who} when a person authors again`);
});

test("R2, R1: the conditions report and never mutate: two reads answer the same items, and clearing one wrote nothing", () => {
  const { w, holds, sessions, manifest } = corpus();
  holds.push({ host: HOST, cooloff_until: NOW + 1000, refusals: 2 });
  sessions.push({ session: "s", locator: AGENDA, primarySha: sha("cap88"), created: iso(NOW), updated: iso(NOW), expires: iso(NOW + 1), ticks: 1, state: {} });
  manifest("k1", "carol", iso(NOW - 2)); manifest("k2", `${MACHINE_AUTHOR_PREFIX}member`, iso(NOW - 1));
  const before = w.statements.length;
  const a = w.read("dave").items.map((i) => i.id), b = w.read("dave").items.map((i) => i.id);
  assert.deepEqual(b, a); assert.equal(a.filter((x) => x.startsWith("CONDITION::")).length, 3);
  assert.ok(!w.statements.slice(before).some((q) => /^\s*(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\b/i.test(q)));
});

test("R3 (DEC-95 (1); K1105): each capture-completed-unattended item carries in its detail the grade note of each capture it names, capture's own words; a capture the viewer may not see carries none", async () => {
  const { ACQUIRE_GRADE_NOTE } = await import("../../../src/capture/index.mjs");
  const { w, manifest } = corpus();
  /* the first producer: a person's document completed by a machine; the capture it names is the one registered under it */
  manifest("k1", "carol", "2026-07-31T12:00:00Z"); manifest("k2", `${MACHINE_AUTHOR_PREFIX}member`, "2026-07-31T18:00:00Z");
  const u = byId(w.read("dave"))["CONDITION::capture-completed-unattended::INFO-88"];
  assert.ok(u.detail.endsWith(ACQUIRE_GRADE_NOTE), "the same words a member present at the capture read");
  assert.ok(u.detail.endsWith(word("queue.capture-completed-unattended.gradenote", { note: ACQUIRE_GRADE_NOTE })), "the note read by key (R15)");
  assert.deepEqual(u.basis.grade_notes, [{ capture_sha: "cap88", note: ACQUIRE_GRADE_NOTE }]);
  /* the second producer: a capture request, its own digest; one registered under a document dave may not see carries none */
  w.run(`INSERT INTO register (capture_sha, bundle_id, path, encoding, registered, bytes) VALUES ('caph','PRJ-1','snapshots/h','binary',?,1)`, iso(NOW));
  const req = (request, sha) => ({ request, run: "r", target: "INQ-1", address: `https://${HOST}/${request}`, host: HOST,
    purpose: "investigate", ua_mode: "civicos", capture_sha: sha, captured_at: iso(NOW), attribution: { ok: true, statement: "the daemon captured this" } });
  w.fakes.captureRequests.completed = () => ({ requests: [req("CR-1", "cap88"), req("CR-2", "caph"), req("CR-3", "capnone")] });
  const carol = byId(w.read("carol")), dave = byId(w.read("dave"));
  assert.deepEqual(carol["CONDITION::capture-completed-unattended::CR-1"].basis.grade_notes, [{ capture_sha: "cap88", note: ACQUIRE_GRADE_NOTE }]);
  assert.ok(carol["CONDITION::capture-completed-unattended::CR-1"].detail.endsWith(ACQUIRE_GRADE_NOTE));
  assert.deepEqual(carol["CONDITION::capture-completed-unattended::CR-2"].basis.grade_notes, [{ capture_sha: "caph", note: ACQUIRE_GRADE_NOTE }],
    "carol sees the project the capture is registered under");
  const hidden = dave["CONDITION::capture-completed-unattended::CR-2"];
  assert.ok(hidden, "the item stands: it is about the request, under a question dave sees");
  assert.deepEqual(hidden.basis.grade_notes, [], "a capture dave may not see carries no note");
  assert.ok(!hidden.detail.includes(ACQUIRE_GRADE_NOTE) && !hidden.detail.includes("caph)"));
  assert.deepEqual(dave["CONDITION::capture-completed-unattended::CR-3"].basis.grade_notes, [], "a capture no register row holds carries none");
  assert.ok(dave["CONDITION::capture-completed-unattended::CR-1"].detail.endsWith(ACQUIRE_GRADE_NOTE));
  /* the note is capture's: what op=gradenote answers for a held, seen capture (its R76) */
  assert.equal(typeof ACQUIRE_GRADE_NOTE, "string"); assert.ok(ACQUIRE_GRADE_NOTE.length > 20);
});

test("R13 (T49; N1138; DEC-272; K3366): capture-completed-unattended reads its summary and detail by key, the starter by handle, the title by its own, never an id", () => {
  const { w } = corpus();
  const add = (bundle, key, author, created) => w.run(`INSERT INTO manifest (bundle_id, snap_key, kind, base, author, created, files_json)
    VALUES (?, ?, 'revision', 'b', ?, ?, '[]')`, bundle, key, author, created);
  const starts = (bundle, author, title) => {
    /* R14: a captured document holds a register row; the fixtures give each one (INFO-88 holds cap88 already) */
    if (bundle !== "INFO-88") { w.bundle(bundle, "information", { title }); w.cite("PRJ-1", bundle);
      w.run(`INSERT INTO register (capture_sha, bundle_id, path, encoding, registered, bytes) VALUES (?,?,?,'binary',?,1)`, `cap${bundle.replace(/\D/g, "")}`, bundle, "snapshots/x", iso(NOW)); }
    add(bundle, `${bundle}-1`, author, "2026-07-31T12:00:00Z");
    add(bundle, `${bundle}-2`, `${MACHINE_AUTHOR_PREFIX}member`, "2026-07-31T18:00:00Z");
  };
  w.run(`UPDATE members SET handle=? WHERE member_id=?`, "Carol Ruiz", "carol");
  w.run(`INSERT INTO founder_handle (id, handle, at) VALUES (1,?,?)`, "Dana Founder", iso(NOW));
  starts("INFO-88", "carol", "Controller memo");
  starts("INFO-77", "admin", "");
  starts("INFO-66", "dave", "Board packet");
  const items = byId(w.read("carol"));
  const fills = (member, title) => ({ member, title });
  const k = (name) => `queue.capture-completed-unattended.${name}`;
  assert.ok(hasWord(k("summary")) && hasWord(k("detail")) && hasWord(k("who")), "the keys this item reads are in the word list");

  const held = items[`CONDITION::capture-completed-unattended::INFO-88`];
  assert.equal(held.summary, word(k("summary"), fills("Carol Ruiz", "Controller memo")), "the starter's handle and the title, from the key");
  assert.ok(held.detail.startsWith(word(k("detail"), fills("Carol Ruiz", "Controller memo"))), "the detail reads its key, then the grade note");

  const founder = items[`CONDITION::capture-completed-unattended::INFO-77`];
  assert.equal(founder.summary, word(k("summary"), fills("Dana Founder", word("screen.held.untitled"))),
    "the founder by her held handle; an untitled document by its own untitled word, never the bundle id");

  const nameless = items[`CONDITION::capture-completed-unattended::INFO-66`];
  assert.equal(nameless.summary, word(k("summary"), fills(word(k("who")), "Board packet")),
    "a starter with no handle held is named by the who word, never by id");

  for (const it of [held, founder, nameless])
    for (const s of [it.summary, it.detail])
      assert.ok(!/carol|admin|dave|token:|INFO-|member:/.test(s), `no id in: ${s}`);
});

test("R14 (R085-19; K3501 (b)): capture-completed-unattended is raised only for a bundle holding a capture; a question carrying a run's machine-written proposal raises none, and a machine-written capture still does", () => {
  const { w, manifest } = corpus();
  /* a question a person started, then a run's proposal finished: no capture is registered under it */
  w.bundle("INQ-9", "inquiry", { title: "Pothole question" }); w.cite("PRJ-1", "INQ-9");
  const q = (key, author, created) => w.run(`INSERT INTO manifest (bundle_id, snap_key, kind, base, author, created, files_json)
    VALUES ('INQ-9', ?, 'revision', 'b', ?, ?, '[]')`, key, author, created);
  q("q1", "carol", "2026-07-31T12:00:00Z"); q("q2", `${MACHINE_AUTHOR_PREFIX}ai`, "2026-07-31T18:00:00Z");
  const id = "CONDITION::capture-completed-unattended::INQ-9";
  for (const who of ["carol", "dave"]) assert.equal(byId(w.read(who))[id], undefined, `the run's proposal raises no item for ${who}`);
  assert.equal(w.read("carol").items.filter((i) => i.kind === "capture-completed-unattended" && i.subject.id === "INQ-9").length, 0);
  /* control: the same sequence on a question holding a capture (a register row under it) raises the item */
  w.run(`INSERT INTO register (capture_sha, bundle_id, path, encoding, registered, bytes) VALUES ('capq','INQ-9','snapshots/q','binary',?,1)`, iso(NOW));
  assert.ok(byId(w.read("carol"))[id], "a question holding a capture is a document a daemon finished: the item stands");
  /* control: a machine-written capture still raises it */
  manifest("k1", "carol", "2026-07-31T12:00:00Z"); manifest("k2", `${MACHINE_AUTHOR_PREFIX}member`, "2026-07-31T18:00:00Z");
  assert.ok(byId(w.read("dave"))["CONDITION::capture-completed-unattended::INFO-88"], "a machine-written capture still raises its item");
});

test("R15 (T50; N1143; DEC-274): a completed capture request is told by key: a member's request and a run's draw their details, the run's naming the member; an untitled document draws the untitled word", () => {
  const { w } = corpus();
  w.run(`UPDATE members SET handle=? WHERE member_id=?`, "Carol Ruiz", "carol");
  w.run(`INSERT INTO founder_handle (id, handle, at) VALUES (1,?,?)`, "Dana Founder", iso(NOW));
  w.bundle("INFO-UNT", "information", { title: "" });
  w.run(`INSERT INTO register (capture_sha, bundle_id, path, encoding, registered, bytes) VALUES ('capunt','INFO-UNT','snapshots/u','binary',?,1)`, iso(NOW));
  const at = (extra) => ({ ok: true, statement: "the daemon captured this", ...extra });
  const req = (request, sha, attribution) => ({ request, run: "r", target: "INQ-1", address: `https://${HOST}/${request}`, host: HOST,
    purpose: "investigate", ua_mode: "civicos", capture_sha: sha, captured_at: iso(NOW), attribution });
  w.fakes.captureRequests.completed = () => ({ requests: [
    req("CR-M", "cap88", at({ at_the_request_of: { member: "carol", inquiry: "INQ-1" }, principals: { plane: "member:carol" } })),
    req("CR-R", "cap88", at({ at_the_request_of: { run: "run-1", inquiry: "INQ-1" }, principals: { plane: "member:carol/tok-9", claude: "acct" } })),
    req("CR-F", "capunt", at({ at_the_request_of: { member: "admin", inquiry: "INQ-1" }, principals: { plane: "member:admin" } }))] });
  const k = (name) => `queue.capture-completed-unattended.request.${name}`;
  for (const n of ["summary", "summary.unnamed", "detail", "detail.assistant", "detail.unnamed"]) assert.ok(hasWord(k(n)), `${k(n)} is in the word list`);
  assert.ok(hasWord("queue.capture-completed-unattended.gradenote"));
  const items = byId(w.read("carol"));
  const note = " " + word("queue.capture-completed-unattended.gradenote", { note: (items["CONDITION::capture-completed-unattended::CR-M"].basis.grade_notes[0] || {}).note });
  const m = items["CONDITION::capture-completed-unattended::CR-M"];
  assert.equal(m.summary, word(k("summary"), { member: "Carol Ruiz", title: "Controller memo" }), "a member's request: her handle, the document's title");
  assert.equal(m.detail, word(k("detail"), { member: "Carol Ruiz" }) + note, "the detail, then the grade note once");
  const r = items["CONDITION::capture-completed-unattended::CR-R"];
  assert.equal(r.summary, word(k("summary"), { member: "Carol Ruiz", title: "Controller memo" }));
  assert.equal(r.detail, word(k("detail.assistant"), { member: "Carol Ruiz" }) + note, "a run's request names the member read from the run's principal, not the credential");
  const f = items["CONDITION::capture-completed-unattended::CR-F"];
  assert.equal(f.summary, word(k("summary"), { member: "Dana Founder", title: word("screen.held.untitled") }), "the founder by her handle; an untitled document by the untitled word");
  for (const it of [m, r, f]) assert.ok(!/carol|admin|run-1|tok-9|token:|INFO-|CR-|member:/.test(it.summary + it.detail), `no id in: ${it.summary} ${it.detail}`);
});

test("R15 control: a request naming no member, and a run whose principal cannot be read, draw the unnamed forms and name no id", () => {
  const { w } = corpus();
  const at = (extra) => ({ ok: true, statement: "s", ...extra });
  const req = (request, attribution) => ({ request, run: "r", target: "INQ-1", address: `https://${HOST}/${request}`, host: HOST,
    purpose: "investigate", ua_mode: "civicos", capture_sha: "cap88", captured_at: iso(NOW), attribution });
  w.fakes.captureRequests.completed = () => ({ requests: [
    req("CR-1", at({ at_the_request_of: { run: "run-2", inquiry: "INQ-1" }, principals: { plane: "class:ai/tok-3", claude: "acct" } })),
    req("CR-2", at({ at_the_request_of: { run: "run-3", inquiry: "INQ-1" }, principals: { plane: "member:ghost", claude: "acct" } })),
    req("CR-3", at({ at_the_request_of: { member: "ghost", inquiry: "INQ-1" }, principals: { plane: "member:ghost" } })),
    req("CR-4", at({ at_the_request_of: { run: "run-4", inquiry: "INQ-1" } }))] });
  const k = (name) => `queue.capture-completed-unattended.request.${name}`;
  const items = byId(w.read("carol"));
  for (const id of ["CR-1", "CR-2", "CR-3", "CR-4"]) {
    const it = items[`CONDITION::capture-completed-unattended::${id}`];
    assert.equal(it.summary, word(k("summary.unnamed"), { title: "Controller memo" }), id);
    assert.ok(it.detail.startsWith(word(k("detail.unnamed"))), id);
    assert.ok(!/ghost|run-|tok-|class:|member:|CR-/.test(it.summary + it.detail), `no id in: ${it.summary} ${it.detail}`);
  }
});

test("R15: a request's title is hidden from a viewer who may not see its document; the item stands under the untitled word", () => {
  const { w } = corpus();
  w.bundle("PRJ-H", "project", { title: "Hidden project" });
  w.run(`INSERT INTO register (capture_sha, bundle_id, path, encoding, registered, bytes) VALUES ('caph','PRJ-H','snapshots/h','binary',?,1)`, iso(NOW));
  w.fakes.captureRequests.completed = () => ({ requests: [{ request: "CR-H", run: "r", target: "INQ-1", address: `https://${HOST}/h`, host: HOST,
    purpose: "investigate", ua_mode: "civicos", capture_sha: "caph", captured_at: iso(NOW),
    attribution: { ok: true, statement: "s", at_the_request_of: { member: "carol", inquiry: "INQ-1" }, principals: { plane: "member:carol" } } }] });
  const seen = byId(w.read("dave"))["CONDITION::capture-completed-unattended::CR-H"];
  assert.ok(seen && !seen.summary.includes("Hidden project"), "dave may not see the document: its title is not told");
  assert.ok(seen.summary.includes(word("screen.held.untitled")));
});
