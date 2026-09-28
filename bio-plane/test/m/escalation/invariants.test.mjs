/* escalation's invariants: no machine acts (R17), append-only history (R18), no judgment of significance (R19),
   sight and purge and no place named (R20), a record object of its own type (R21). */
import test from "node:test";
import assert from "node:assert/strict";
import { list, get } from "../../../../jurisdictions/index.mjs";
import { BUNDLE_ID_RE, STATES } from "../../../checks/bio-checks.mjs";
import { seeded, opened, toStage, V, MACHINE, ms } from "./fixture.mjs";

/* Every act, called with `extra` over arguments that would otherwise land (at stage 4, with a response to read). */
function acts(w) {
  const base = { id: w.E, viewer: V("bob"), author: V("bob") };
  return {
    escalationOpen: (x) => w.esc.escalationOpen({ determination: w.D2, viewer: V("bob"), author: V("bob"), ...x }),
    escalationAttach: (x) => w.esc.escalationAttach({ ...base, id: w.E2, action: w.A2, ...x }),
    escalationEvaluate: (x) => w.esc.escalationEvaluate({ ...base, response: { action: w.N, ord: w.R }, reading: "denied", reason: "No.", ...x }),
    escalationAdvance: (x) => w.esc.escalationAdvance({ ...base, to: 5, reason: "Go.", ...x }),
    escalationDecline: (x) => w.esc.escalationDecline({ ...base, to: 5, reason: "Not now.", ...x }),
    escalationSuspend: (x) => w.esc.escalationSuspend({ ...base, reason: "Hold.", ...x }),
    escalationResume: (x) => w.esc.escalationResume({ ...base, ...x }),
    escalationEnd: (x) => w.esc.escalationEnd({ ...base, ...x }),
  };
}

function stage4() {
  const w = seeded();
  toStage(w, 4);
  w.D2 = w.determine({ project: w.P, outcomes: [{ standard: "STD-2026-0001-a", outcome: "noncompliant" }] });
  const D3 = w.determine({ project: w.P, outcomes: [{ standard: "STD-2026-0001-a", outcome: "noncompliant" }] });
  w.E2 = w.esc.escalationOpen({ determination: D3, author: V("bob"), viewer: V("bob") }).id;
  w.esc.escalationAdvance({ id: w.E2, to: 2, reason: "Go.", author: V("bob"), viewer: V("bob") });
  w.A2 = w.action({ project: w.P, restsOn: [D3] });
  return w;
}

test("R17 nothing a machine writes opens, attaches to, evaluates, advances, declines, suspends or ends an escalation, nor promotes its document; a proposal is the protocol's derivation, stated as such, never an act", () => {
  const w = stage4();
  const codes = { escalationOpen: "MACHINE_CANNOT_OPEN", escalationAttach: "MACHINE_CANNOT_ATTACH",
    escalationEvaluate: "MACHINE_CANNOT_EVALUATE", escalationAdvance: "MACHINE_CANNOT_ADVANCE",
    escalationDecline: "MACHINE_CANNOT_DECLINE", escalationSuspend: "MACHINE_CANNOT_SUSPEND",
    escalationResume: "MACHINE_CANNOT_RESUME", escalationEnd: "MACHINE_CANNOT_END" };
  const before = w.snapshot();
  for (const [name, call] of Object.entries(acts(w)))
    for (const author of [MACHINE, "token:run-7", "", undefined])
      assert.equal(call({ author }).reason, codes[name], `${name} ${author}`);
  assert.deepEqual(w.snapshot(), before);
  /* the document itself, promoted by a machine: refused before anything is written */
  const head = w.record.head(w.E);
  const text = w.text(w.E).replace("stage: 4", "stage: 5");
  const raw = w.promotion.promote({ bundleId: w.E, base: head.bundleSha, snapKey: "20260928T010000Z_0000aaaa", author: MACHINE,
                                    files: [{ path: "bundle.md", text }], meta: {} });
  assert.equal(raw.reason, "MACHINE_CANNOT_WRITE_ESCALATION");
  assert.deepEqual(w.snapshot(), before);
  /* a proposal says what it is */
  w.esc.escalationEvaluate({ id: w.E, response: { action: w.N, ord: w.R }, reading: "denied", reason: "No.", author: V("bob"), viewer: V("bob") });
  const p = w.esc.escalationRead({ id: w.E, viewer: V("bob") }).proposed;
  assert.equal(p.length, 2);
  for (const x of p) {
    assert.equal(x.by, "protocol");
    assert.match(x.says, /not an act/);
    assert.match(x.says, /A member advances it or declines it/);
  }
});

test("R18 every stage move, evaluation, decline, suspension and end is appended with who, when and why; the history is never edited, by an act or a raw promotion", () => {
  const w = seeded();
  const texts = [];
  const snap = () => texts.push(w.text(w.E));
  w.clock.now = "2026-09-28T01:00:00Z"; opened(w); snap();
  w.clock.now = "2026-09-28T02:00:00Z";
  w.esc.escalationDecline({ id: w.E, to: 2, reason: "Wait a day.", author: V("alice"), viewer: V("alice") }); snap();
  w.clock.now = "2026-09-28T03:00:00Z";
  w.esc.escalationSuspend({ id: w.E, reason: "Counsel first.", author: V("bob"), viewer: V("bob") }); snap();
  w.clock.now = "2026-09-28T04:00:00Z";
  w.esc.escalationResume({ id: w.E, reason: "Counsel done.", author: V("alice"), viewer: V("alice") }); snap();
  w.clock.now = "2026-09-28T05:00:00Z";
  w.esc.escalationAdvance({ id: w.E, to: 2, reason: "Notify now.", author: V("bob"), viewer: V("bob") }); snap();
  const n = w.action({ project: w.P, restsOn: [w.D] });
  w.clock.now = "2026-09-28T06:00:00Z";
  w.esc.escalationAttach({ id: w.E, action: n, author: V("bob"), viewer: V("bob") }); snap();
  w.correspond(n, "sent", "2026-09-02");
  w.clock.now = "2026-09-28T07:00:00Z";
  w.esc.escalationAdvance({ id: w.E, to: 3, reason: "Sent.", author: V("bob"), viewer: V("bob") }); snap();
  const R = w.correspond(n, "received", "2026-09-10");
  w.clock.now = "2026-09-28T08:00:00Z";
  w.esc.escalationAdvance({ id: w.E, to: 4, reason: "Replied.", author: V("bob"), viewer: V("bob") }); snap();
  w.clock.now = "2026-09-28T09:00:00Z";
  w.esc.escalationEvaluate({ id: w.E, response: { action: n, ord: R }, reading: "partial", reason: "Half.", author: V("alice"), viewer: V("alice") }); snap();
  const h = w.esc.escalationRead({ id: w.E, viewer: V("bob") }).history;
  assert.deepEqual(h.map((x) => [x.seq, x.kind, x.author, x.at, x.reason ?? null]), [
    [1, "open", V("bob"), "2026-09-28T01:00:00Z", null],
    [2, "decline", V("alice"), "2026-09-28T02:00:00Z", "Wait a day."],
    [3, "suspend", V("bob"), "2026-09-28T03:00:00Z", "Counsel first."],
    [4, "resume", V("alice"), "2026-09-28T04:00:00Z", "Counsel done."],
    [5, "advance", V("bob"), "2026-09-28T05:00:00Z", "Notify now."],
    [6, "attach", V("bob"), "2026-09-28T06:00:00Z", null],
    [7, "advance", V("bob"), "2026-09-28T07:00:00Z", "Sent."],
    [8, "advance", V("bob"), "2026-09-28T08:00:00Z", "Replied."],
    [9, "evaluate", V("alice"), "2026-09-28T09:00:00Z", "Half."]]);
  /* each act kept every byte of the log before it */
  const logOf = (t) => t.slice(t.indexOf("## Escalation Log"), t.indexOf("## Session Log"));
  for (let i = 1; i < texts.length; i++) assert.ok(logOf(texts[i]).startsWith(logOf(texts[i - 1]).trimEnd()), `act ${i}`);
  /* one manifest entry per act, none rewritten */
  const manifest = JSON.parse(w.record.readImage(w.E)["_history/manifest.json"].text ?? w.record.readImage(w.E)["_history/manifest.json"]);
  const entries = Array.isArray(manifest) ? manifest : manifest.entries ?? Object.values(manifest);
  assert.equal(entries.length, texts.length);
  /* the projections are appended, never updated: every earlier row is unchanged */
  const rowsNow = w.rows(`SELECT * FROM escalation_moves ORDER BY seq`);
  assert.deepEqual(rowsNow.map((r) => [r.seq, r.kind]), [[1, "open"], [3, "suspend"], [4, "resume"], [5, "advance"], [7, "advance"], [8, "advance"]]);
  assert.deepEqual(w.rows(`SELECT seq, reason, author FROM escalation_declines`), [{ seq: 2, reason: "Wait a day.", author: V("alice") }]);
  /* a member's raw promotion editing the log is refused, and so is one that only appends outside the acts */
  const head = w.record.head(w.E);
  const edited = w.text(w.E).replace("Wait a day.", "Never mind.");
  const r1 = w.promotion.promote({ bundleId: w.E, base: head.bundleSha, snapKey: "20260928T100000Z_0000bbbb", author: V("bob"),
                                   files: [{ path: "bundle.md", text: edited }], meta: {} });
  assert.equal(r1.reason, "ESCALATION_BY_ACT_ONLY");
  assert.equal(w.text(w.E), texts.at(-1));
});

test("R19 no input or answer carries a significance, severity, priority, urgency, rank or score; a stage act's purpose is only enforcing a pursued standard", () => {
  const w = stage4();
  const before = w.snapshot();
  for (const key of ["significance", "severity", "priority", "urgency", "score", "rank"])
    for (const [name, call] of Object.entries(acts(w))) {
      const r = call({ [key]: "high" });
      assert.equal(r.reason, "ESCALATION_CARRIES_NO_JUDGMENT", `${name} ${key}`);
      assert.deepEqual(r.keys, [key]);
    }
  assert.deepEqual(w.snapshot(), before);
  /* every answer, walked: no such key anywhere */
  w.esc.escalationEvaluate({ id: w.E, response: { action: w.N, ord: w.R }, reading: "partial", reason: "Half.", author: V("bob"), viewer: V("bob") });
  const answers = [w.esc.escalationRead({ id: w.E, viewer: V("bob") }), w.esc.escalationsDue({ viewer: V("bob") }),
    w.esc.escalationAdvance({ id: w.E, to: 7, reason: "Go.", author: V("bob"), viewer: V("bob") }),
    w.esc.escalationRead({ id: w.E, viewer: V("bob") })];
  const walk = (v, path) => {
    if (Array.isArray(v)) return v.forEach((x, i) => walk(x, `${path}[${i}]`));
    if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) {
      assert.ok(!["significance", "severity", "priority", "urgency", "score", "rank"].includes(k), `${path}.${k}`);
      walk(x, `${path}.${k}`);
    }
  };
  answers.forEach((a, i) => walk(a, `answer${i}`));
  /* stage 7's purposes are the five, each aimed at a pursued standard (R12's refusals) */
  const a = w.action({ project: w.P, restsOn: [w.D] });
  assert.equal(w.esc.escalationAttach({ id: w.E, action: a, purpose: "candidate_support", standards: ["STD-2026-0001-a"], author: V("bob"), viewer: V("bob") }).reason, "NOT_ACCOUNTABILITY");
  assert.equal(w.esc.escalationAttach({ id: w.E, action: a, purpose: "testimony", standards: ["STD-2026-0003-c"], author: V("bob"), viewer: V("bob") }).reason, "NOT_THE_BREACH");
});

test("R20 every read and act answers an escalation in a project the viewer may not see as absent; the tables are declared to purge; no place, office or law is named in the module's outward text", () => {
  const w = stage4();
  /* carol sees neither the project nor, so, its escalations */
  const absent = w.esc.escalationRead({ id: "ESC-2026-0999-escalation", viewer: V("bob") });
  assert.deepEqual(w.esc.escalationRead({ id: w.E, viewer: V("carol") }), absent);
  for (const [name, call] of Object.entries(acts(w))) {
    if (name === "escalationOpen") continue;
    const r = call({ author: V("carol"), viewer: V("carol") });
    assert.equal(r.reason, "NO_SUCH_ESCALATION", name);
    const r2 = call({ author: V("carol"), viewer: V("carol"), id: "ESC-2026-0999-escalation" });
    assert.deepEqual({ ...r, id: null }, { ...r2, id: null }, `${name}: absent and unseen are one answer`);
  }
  assert.deepEqual(w.esc.escalationsDue({ nowMs: ms("2026-12-01T00:00:00Z"), viewer: V("carol") }).items, []);
  /* purge: a single-bundle purge of one escalation clears its rows only; the whole-store form clears every row */
  const tables = ["escalations", "escalation_moves", "escalation_evaluations", "escalation_attachments", "escalation_declines"];
  const count = (id) => tables.map((t) => w.rows(`SELECT COUNT(*) AS n FROM ${t} WHERE escalation_id=?`, id)[0].n);
  assert.ok(count(w.E).every((n, i) => n > 0 || tables[i] === "escalation_evaluations" || tables[i] === "escalation_declines"));
  const one = w.record.purge({ bundleId: w.E2 });
  for (const t of tables) assert.ok(t in one.removed, `${t} is declared`);
  assert.deepEqual(count(w.E2), [0, 0, 0, 0, 0]);
  assert.ok(count(w.E)[0] === 1);
  w.record.purge({});
  for (const t of tables) assert.equal(w.count(t), 0, t);
  /* no place named: every sentence the module answers, with no profile and with the test profile, names none of the
     places any held profile covers */
  const places = list().flatMap((p) => [...(get(p.id).covers || []), p.name]).filter(Boolean);
  const x = stage4();
  x.record.setSetting("jurisdiction_profiles", [], "test");
  x.esc.escalationEvaluate({ id: x.E, response: { action: x.N, ord: x.R }, reading: "denied", reason: "No.", author: V("bob"), viewer: V("bob") });
  const answers = [x.esc.escalationRead({ id: x.E, viewer: V("bob") }), ...Object.values(acts(x)).map((c) => c({})),
    ...Object.values(acts(x)).map((c) => c({ author: MACHINE })), x.esc.escalationEnd({ id: x.E, author: V("bob"), viewer: V("bob") })];
  const sentences = [];
  const walk = (v, k) => {
    if (Array.isArray(v)) return v.forEach((y) => walk(y, k));
    if (v && typeof v === "object") return Object.entries(v).forEach(([kk, y]) => walk(y, kk));
    if (typeof v === "string" && ["says", "detail", "why", "missing"].includes(k)) sentences.push(v);
  };
  answers.forEach((a) => walk(a, ""));
  assert.ok(sentences.length >= 15, String(sentences.length));
  for (const s of sentences) for (const p of places) assert.ok(!s.includes(p), `"${p}" in "${s}"`);
});

test("R21 an escalation is a record object of its own type: an ESC- bundle of type escalation promoted through promotion, its states the catalogue's, with history, audit and export; only a replay promotes it outside the acts, and its tables follow the document", async () => {
  const w = seeded();
  toStage(w, 4);
  assert.match(w.E, BUNDLE_ID_RE);
  const head = w.record.head(w.E);
  assert.deepEqual([head.type, head.currentState], ["escalation", "open"]);
  assert.deepEqual(STATES.escalation.legal, ["open", "suspended", "ended"]);
  const fm = w.fm(w.E);
  assert.deepEqual([fm.object_type, fm.project, fm.determination, fm.stage], ["escalation", w.P, w.D, 4]);
  /* export: the image carries every snapshot and the manifest */
  const img = w.record.readImage(w.E);
  assert.equal(Object.keys(img).filter((k) => /^_history\/bundle_/.test(k)).length, 4, "one snapshot per revision");
  assert.ok("_history/manifest.json" in img);
  /* audit: the record's catalogue finds nothing wrong with it */
  const audit = await w.record.auditPass({ after: "", limit: 50, visible: () => true });
  assert.ok(!(audit.offenders || []).some((o) => o.bundleId === w.E), JSON.stringify((audit.offenders || []).find((o) => o.bundleId === w.E)));
  /* a state move through the catalogue's table: open → suspended → open, never out of ended */
  w.esc.escalationSuspend({ id: w.E, reason: "Hold.", author: V("bob"), viewer: V("bob") });
  assert.equal(w.record.head(w.E).currentState, "suspended");
  w.esc.escalationResume({ id: w.E, author: V("bob"), viewer: V("bob") });
  /* a member's raw promotion outside the acts is refused */
  const h = w.record.head(w.E);
  const raw = w.promotion.promote({ bundleId: w.E, base: h.bundleSha, snapKey: "20260928T110000Z_0000cccc", author: V("bob"),
                                    files: [{ path: "bundle.md", text: w.text(w.E) }], meta: {} });
  assert.equal(raw.reason, "ESCALATION_BY_ACT_ONLY");
  /* a replay restores the document, and the tables follow it */
  const text = w.text(w.E);
  const rows = w.snapshot();
  for (const t of ["escalations", "escalation_moves", "escalation_evaluations", "escalation_attachments", "escalation_declines"])
    w.rows(`DELETE FROM ${t}`);
  const rep = w.promotion.promote({ bundleId: w.E, base: h.bundleSha, snapKey: "20260928T120000Z_0000dddd", author: V("bob"),
                                    replay: true, files: [{ path: "bundle.md", text }], meta: {} });
  assert.equal(rep.ok, true, JSON.stringify(rep));
  for (const t of ["escalation_moves", "escalation_attachments", "escalation_evaluations", "escalation_declines"])
    assert.equal(w.snapshot()[t], rows[t], t);
  const back = w.esc.escalationRead({ id: w.E, viewer: V("bob") });
  assert.deepEqual([back.stage, back.state, back.actions.length], [4, "open", 1]);
});

test("R17 R20 every refusal this module mints carries its code, its C-116 row and the member's translation, and each row names one site", async () => {
  const { ESCALATION_CHECKS } = await import("../../../src/escalation/index.mjs");
  const rows = Object.entries(ESCALATION_CHECKS);
  assert.equal(new Set(rows.map(([, r]) => r.check)).size, rows.length, "one row per code");
  for (const [code, row] of rows) {
    assert.match(row.check, /^C-116\.\d+$/, code);
    assert.match(row.where, /^src\/escalation\/index\.mjs \S+ > is-[a-z-]+$/, code);
    assert.ok(row.translation.length > 20, code);
  }
  /* a sample of every family of site, driven: each answer's row is its code's */
  const w = stage4();
  const answers = [...Object.values(acts(w)).map((c) => c({ author: MACHINE })), ...Object.values(acts(w)).map((c) => c({ rank: 1 })),
    ...Object.values(acts(w)).map((c) => c({ author: V("carol"), viewer: V("carol") })),
    w.esc.escalationEvaluate({ id: w.E, reading: "x", reason: "r", author: V("bob"), viewer: V("bob") }),
    w.esc.escalationAdvance({ id: w.E, to: 6, reason: "r", author: V("bob"), viewer: V("bob") })];
  for (const a of answers) {
    if (a.ok !== false || a.reason === "PROJECT_ACT_NOT_A_PARTICIPANT") continue;
    const row = ESCALATION_CHECKS[a.reason];
    assert.ok(row, a.reason);
    assert.deepEqual([a.code, a.check, a.translation], [a.reason, row.check, row.translation], a.reason);
  }
});
