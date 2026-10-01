/* conformance: the reads (R9–R11), their visibility (R15), and the ops that route to the module's services. Every test
   drives `conformance` at its interface over the real modules it uses (./fixture.mjs). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { scene, V, U, MACHINE, F, DOC } from "./fixture.mjs";
import { Conformance, CONFORMANCE_CHECKS, DETERMINATIONS_PAGE_MAX, FLAG_SAYS,
         noSuchDetermination } from "../../../src/conformance/index.mjs";

const refused = (r, code) => {
  assert.equal(r.ok, false, `expected ${code}, got ${JSON.stringify(r).slice(0, 300)}`);
  assert.equal(r.reason, code);
  if (CONFORMANCE_CHECKS[code]) assert.equal(r.check, CONFORMANCE_CHECKS[code].check);
};
const quiet = (w, fn) => { const before = w.snapshot(); const r = fn(); assert.deepEqual(w.snapshot(), before, "a read writes nothing"); return r; };

test("R9 R19: determinationRead answers R1's fields, the per-standard outcomes, each finding's pinned edition with its frozen pair beside its live pair per axis (never composed), the author and time, the links and R10's flag", () => {
  const { w, proj, pin, std, ev, input } = scene();
  const d = w.c.determine(input({ questions: [{ question: "Was a sign posted?" }] }));
  const r = quiet(w, () => w.c.determinationRead({ id: d.id, viewer: V("pat") }));
  assert.equal(r.ok, true);
  assert.deepEqual([r.id, r.project, r.author, r.at, r.supersedes, r.superseded_by, r.live, r.basis_changed],
    [d.id, proj, V("olive"), "2026-09-28T01:00:00Z", null, null, true, null]);
  /* the one shape (K248): exactly these keys, which consequences, actions, filings and escalation read */
  assert.deepEqual(Object.keys(r).sort(), ["act", "at", "author", "basis_changed", "cause", "cause_says", "findings", "id",
    "live", "ok", "outcomes", "outcomes_differ", "outcomes_differ_says", "project", "proposal", "questions", "reason",
    "standards", "superseded_by", "supersedes"]);
  /* N345: no cause stated reads "cause not established" (R22); one standard, so the outcomes do not differ (R9) */
  assert.deepEqual([r.cause, r.cause_says, r.outcomes_differ, r.outcomes_differ_says],
    [null, "cause not established", false, null]);
  assert.deepEqual(r.outcomes, [{ standard: std, outcome: "noncompliant" }]);
  assert.deepEqual(r.act, { id: d.act.id, description: input().act.description,
    actor: { role: "Director of Parks", body: "Parks Department" }, at: "2026-03-02", period: null, evidence: [ev.content] });
  assert.deepEqual(r.standards, [{ standard: std, outcome: "noncompliant", in_force: "in_force", in_force_why: null,
    rows: [{ requires: "thirty days' public notice before a closure", did: "closed with no notice", reading: "diverges",
             content: [ev.content] }], disagreement: null }]);
  const [f] = r.findings;
  assert.deepEqual([f.finding, f.case, f.edition, f.version_sha, f.role], [F, "CASE-2026-0001", 1, pin, "load_bearing"]);
  assert.deepEqual(f.frozen, { capture: { state: "graded", grade: "B" }, connection: { state: "graded", grade: "C" }, testimony: null });
  const live = w.strength.inquiryStrength({ id: F, viewer: V("pat") });
  assert.deepEqual(f.live, { capture: { state: live.capture.state, grade: live.capture.grade },
    connection: { state: live.connection.state, grade: live.connection.grade },
    testimony: { state: live.testimony.state, grade: live.testimony.grade } });
  for (const k of ["strength", "grade", "score", "overall", "composed"]) { assert.equal(k in f, false, k); assert.equal(k in r, false, k); }
  assert.deepEqual(r.questions.map((q) => [q.question, q.opened]), [["Was a sign posted?", true]]);
  /* absent and unseen alike: NO_SUCH_DETERMINATION, one answer */
  for (const [id, viewer] of [["CONF-2026-0099-determination", V("pat")], [d.id, V("quinn")], [d.id, "nobody"], [null, V("pat")]])
    refused(w.c.determinationRead({ id, viewer }), "NO_SUCH_DETERMINATION");
  const a = w.c.determinationRead({ id: "CONF-2026-0099-determination", viewer: V("quinn") });
  const b = w.c.determinationRead({ id: d.id, viewer: V("quinn") });
  assert.deepEqual(a, noSuchDetermination("CONF-2026-0099-determination"), "R19: answered through noSuchDetermination");
  assert.deepEqual(b, noSuchDetermination(d.id));
  assert.deepEqual({ ...a, determination: null }, { ...b, determination: null });
  /* a machine credential and an administrator see it */
  assert.equal(w.c.determinationRead({ id: d.id, viewer: MACHINE }).ok, true);
  assert.equal(w.c.determinationRead({ id: d.id, viewer: V("ron") }).ok, true);
});

/* A Conformance over the scene's modules whose sight withholds what `hidden(id, viewer)` names (membership R43 shows every
   non-project bundle to a member, so these arms are reached through a sight rule given as this module's membership). */
const withholding = (w, hidden) => new Conformance({ storage: w.st, record: w.record, promotion: w.promotion, host: w.host,
  membership: new Proxy(w.membership, { get: (t, p) => (p === "inSight"
    ? (id, viewer) => (hidden(id, viewer) ? false : t.inSight(id, viewer))
    : typeof t[p] === "function" ? t[p].bind(t) : t[p]) }),
  content: w.content, inquiry: w.k, strength: w.strength, reevaluation: w.reevaluation, publication: w.publication,
  standards: w.standards, now: () => w.clock.now });

test("R9 R11 R24: a finding or standard the viewer may not see is withheld whole, with its outcome, rows and disagreement, and the read and each R11 item state out_of_view: true (no id, no placeholder, no count); a viewer who sees all is answered as before", () => {
  const { w, std, input } = scene();
  const d = w.c.determine(input());
  const c = withholding(w, (id, viewer) => (id === F || id === std) && viewer === V("pat"));
  const r = c.determinationRead({ id: d.id, viewer: V("pat") });
  const item = c.determinationsFor({ viewer: V("pat") }).items[0];
  assert.deepEqual([r.findings, r.outcomes, r.standards, r.out_of_view], [[], [], [], true]);
  assert.deepEqual([item.findings, item.outcomes, item.out_of_view], [[], [], true]);
  for (const a of [r, item]) {
    const s = JSON.stringify(a);
    for (const gone of [F, std, "an object you may not see"]) assert.equal(s.includes(gone), false, gone);
  }
  /* what is authored on the determination stands: the act, author, time, links, live and outcomes_differ */
  const full = w.c.determinationRead({ id: d.id, viewer: V("olive") });
  for (const k of ["act", "author", "at", "supersedes", "superseded_by", "live", "outcomes_differ", "cause_says"])
    assert.deepEqual(r[k], full[k], k);
  /* the negative control: olive sees all, gets no out_of_view key and today's answer */
  for (const a of [c.determinationRead({ id: d.id, viewer: V("olive") }), full]) {
    assert.equal("out_of_view" in a, false);
    assert.deepEqual(a.outcomes, [{ standard: std, outcome: "noncompliant" }]);
    assert.deepEqual(a.findings.map((f) => f.finding), [F]);
  }
  assert.deepEqual(c.determinationRead({ id: d.id, viewer: V("olive") }), full);
  assert.equal("out_of_view" in c.determinationsFor({ viewer: V("olive") }).items[0], false);
});

test("R11 R24: determinationsFor states out_of_view on the item that withheld something, never on the page", () => {
  const { w, std, input } = scene();
  const second = w.standard("Parks Code 12.08.040", { period: { from: "2020-01-01", to: "2030-12-31" } });
  const a = w.c.determine(input());
  const b = w.c.determine(input({ standards: [{ standard: second, outcome: "compliant" }],
    rows: [{ standard: second, requires: "a sign", did: "a sign", reading: "aligns" }] }));
  const c = withholding(w, (id, viewer) => id === std && viewer === V("pat"));
  const page = c.determinationsFor({ viewer: V("pat") });
  assert.deepEqual(Object.keys(page).sort(), ["cursor", "items", "limit", "ok", "truncated"]);
  assert.deepEqual(page.items.map((i) => [i.id, i.out_of_view, i.outcomes.length]), [[a.id, true, 0], [b.id, undefined, 1]]);
  assert.equal("out_of_view" in page.items[1], false);
  /* each item is still a subset of determinationRead's shape */
  const read = c.determinationRead({ id: a.id, viewer: V("pat") });
  assert.deepEqual([read.out_of_view, read.outcomes, read.outcomes_differ], [true, [], false]);
});

test("R6 R9 R24: a question whose inquiry the viewer may not see keeps its question and opened, and loses its inquiry key; the read states out_of_view: true", () => {
  const { w, std, input } = scene();
  const d = w.c.determine(input({ standards: [{ standard: std, outcome: "unclear" }],
                                  questions: [{ question: "Was a sign posted?" }] }));
  const opened = d.questions[0].inquiry;
  assert.ok(opened);
  const c = withholding(w, (id, viewer) => id === opened && viewer === V("pat"));
  const r = c.determinationRead({ id: d.id, viewer: V("pat") });
  assert.deepEqual([r.questions, r.out_of_view], [[{ question: "Was a sign posted?", opened: true }], true]);
  assert.equal(JSON.stringify(r).includes(opened), false);
  const o = c.determinationRead({ id: d.id, viewer: V("olive") });
  assert.deepEqual([o.questions, "out_of_view" in o], [[{ question: "Was a sign posted?", inquiry: opened, opened: true }], false]);
});

test("R10 R24: a pinned finding hidden from the viewer and reopened: its cause is withheld with it, the read holds no trace of it and states out_of_view: true; basis_changed stands while another cause is left", () => {
  const { w, proj, input } = scene();
  const G = "INQ-2026-0300-deferred";
  w.inquiry(G, { state: "deferred", disposition: '"waiting on the minutes"', legs: [{ target: DOC }] });
  w.publish(G, proj, { caseId: "CASE-2026-0004" });
  const d = w.c.determine(input({ findings: [F, G] }));
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  const re = w.promotion.reopen({ target: G, reason: "the minutes arrived", viewer: V("olive"), author: V("olive") });
  assert.equal(re.ok, true, JSON.stringify(re).slice(0, 300));
  const c = withholding(w, (id, viewer) => id === G && viewer === V("pat"));
  const pat = c.determinationRead({ id: d.id, viewer: V("pat") });
  const olive = c.determinationRead({ id: d.id, viewer: V("olive") });
  assert.deepEqual(olive.basis_changed.causes.map((x) => `${x.kind}:${x.subject}:${x.source}`), [`finding:${G}:reopened`]);
  assert.equal("out_of_view" in olive, false);
  assert.deepEqual([pat.basis_changed, pat.findings.map((f) => f.finding), pat.out_of_view], [null, [F], true]);
  assert.equal(JSON.stringify(pat).includes(G), false);
  /* a cause pat may see stands beside the withheld one: basis_changed stands, naming only it */
  w.inquiry(F, { legs: [{ target: DOC }], question: "Revised?" });
  w.publish(F, proj, { edition: 2 });
  const later = c.determinationRead({ id: d.id, viewer: V("pat") });
  assert.deepEqual(later.basis_changed.causes.map((x) => `${x.kind}:${x.subject}:${x.source}`), [`finding:${F}:edition`]);
  assert.equal(later.out_of_view, true);
  assert.equal(JSON.stringify(later).includes(G), false);
  assert.deepEqual(c.determinationRead({ id: d.id, viewer: V("olive") }).basis_changed.causes
    .map((x) => `${x.kind}:${x.subject}:${x.source}`).sort(), [`finding:${F}:edition`, `finding:${G}:reopened`]);
});

test("R10 R24: a standard superseded by one the viewer may not see keeps its cause without the detail naming it; a passage cause the viewer may not see is withheld; each states out_of_view: true", () => {
  const { w, std, ev, input } = scene();
  w.at(ev.cap.sha, "ex.org/notice", "2026-09-01T00:00:00Z");
  const d = w.c.determine(input());
  const next = w.standard("Parks Code 12.08.030 (amended)", { period: { from: "2026-06-01", to: "2030-12-31" }, supersedes: std });
  const [b] = w.doc("INFO-2026-0500-notice2", [w.cap("INFO-2026-0500-notice2-0", "newer bytes")]);
  w.read(b.sha, [U(0, "page one"), U(1, "something else entirely")]);
  w.at(b.sha, "ex.org/notice", "2026-09-20T00:00:00Z");
  const full = w.c.determinationRead({ id: d.id, viewer: V("pat") });
  assert.deepEqual(full.basis_changed.causes.map((x) => `${x.kind}:${x.subject}`).sort(),
                   [`passage:${ev.content}`, `standard:${std}`].sort());
  assert.match(full.basis_changed.causes.find((x) => x.kind === "standard").detail, new RegExp(next));
  const c = withholding(w, (id, viewer) => (id === next || id === DOC) && viewer === V("pat"));
  const r = c.determinationRead({ id: d.id, viewer: V("pat") });
  const [only] = r.basis_changed.causes;
  assert.deepEqual([r.basis_changed.causes.length, only.kind, only.subject, "detail" in only, r.out_of_view],
                   [1, "standard", std, false, true]);
  /* the act's and the row's evidence, a passage of the hidden document, leave their lists */
  assert.deepEqual([r.act.evidence, r.standards[0].rows[0].content], [[], []]);
  for (const gone of [next, ev.content, DOC]) assert.equal(JSON.stringify(r).includes(gone), false, gone);
  assert.deepEqual(c.determinationRead({ id: d.id, viewer: V("olive") }), w.c.determinationRead({ id: d.id, viewer: V("olive") }));
});

test("R10: flagged basis_changed, naming each cause (a finding reopened, superseded or published in a later edition; a standard superseded; a newer capture of a text or evidence passage that does not carry it); the determination and its outcome do not change", () => {
  const { w, proj, std, ev, input } = scene();
  /* the evidence and the standard's text each held at an address, so a newer capture can be told */
  w.at(ev.cap.sha, "ex.org/notice", "2026-09-01T00:00:00Z");
  const t = w.evidence("INFO-2026-0200-code", "the code requires thirty days");
  w.at(t.cap.sha, "ex.org/code", "2026-09-01T00:00:00Z");
  const coded = w.standard("Parks Code 12.08.050", { period: { from: "2020-01-01", to: "2030-12-31" }, text: t.content });
  /* a finding at a disposition, published, so it can be reopened */
  const G = "INQ-2026-0300-deferred";
  w.inquiry(G, { state: "deferred", disposition: '"waiting on the minutes"', legs: [{ target: DOC }] });
  w.publish(G, proj, { caseId: "CASE-2026-0004" });
  const d = w.c.determine(input({ findings: [F, G],
    standards: [{ standard: std, outcome: "noncompliant" }, { standard: coded, outcome: "noncompliant" }],
    rows: [...input().rows, { standard: coded, requires: "thirty days", did: "none", reading: "diverges" }] }));
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  const control = w.c.determine(input());
  assert.equal(d.basis_changed, null);
  const docBefore = w.text(d.id);
  const causes = () => w.c.determinationRead({ id: d.id, viewer: V("olive") }).basis_changed.causes
    .map((c) => `${c.kind}:${c.subject}:${c.source}`).sort();
  /* a finding reopened: reevaluation tells this module (its R8), and the record answers it too */
  const re = w.promotion.reopen({ target: G, reason: "the minutes arrived", viewer: V("olive"), author: V("olive") });
  assert.equal(re.ok, true, JSON.stringify(re).slice(0, 300));
  assert.deepEqual(causes(), [`finding:${G}:reopened`]);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM determination_flags WHERE determination_id=? AND subject=?`, d.id, G).n, 1,
    "reevaluation's notice is recorded");
  /* a finding published in a later edition of its case */
  w.inquiry(F, { legs: [{ target: DOC }], question: "Revised?" });
  w.publish(F, proj, { edition: 2 });
  /* a finding superseded: the reopened finding (no longer a case member at its current version, inquiry R35) divided by
     a member through inquiry's own act (its R23–R26), whose children supersede it (its R16) */
  const div = w.k.divide({ target: G, reason: "it was two questions", viewer: V("olive"), author: V("olive"),
    children: [{ id: "INQ-2026-0400-child", question: "Was the notice posted?", legs: [0] },
               { id: "INQ-2026-0401-child", question: "Was it posted thirty days ahead?", legs: [0] }] });
  assert.equal(div.ok, true, JSON.stringify(div).slice(0, 300));
  assert.deepEqual(w.k.supersededBy(G), ["INQ-2026-0400-child", "INQ-2026-0401-child"]);
  /* a standard superseded */
  w.standard("Parks Code 12.08.030 (amended)", { period: { from: "2026-06-01", to: "2030-12-31" }, supersedes: std });
  /* a newer capture of the act's evidence and of the standard's text, neither carrying the passage */
  for (const [addr, id] of [["ex.org/notice", "INFO-2026-0500-notice2"], ["ex.org/code", "INFO-2026-0501-code2"]]) {
    const [b] = w.doc(id, [w.cap(`${id}-0`, `newer bytes of ${addr}`)]);
    w.read(b.sha, [U(0, "page one"), U(1, "something else entirely")]);
    w.at(b.sha, addr, "2026-09-20T00:00:00Z");
  }
  assert.deepEqual(causes(), [`finding:${F}:edition`, `finding:${G}:reopened`, `finding:${G}:superseded`,
    `passage:${ev.content}:newer_capture`, `passage:${t.content}:newer_capture`, `standard:${std}:superseded`].sort());
  const r = w.c.determinationRead({ id: d.id, viewer: V("olive") });
  assert.equal(r.basis_changed.says, FLAG_SAYS);
  assert.ok(r.basis_changed.causes.every((c) => typeof c.detail === "string" && c.detail));
  assert.equal(r.basis_changed.causes.find((c) => c.kind === "passage").affects, "affected");
  /* a notice only: the determination, its outcomes and its pins are as recorded */
  assert.deepEqual(r.standards.map((s) => s.outcome), ["noncompliant", "noncompliant"]);
  assert.deepEqual(r.findings.map((f) => f.edition), [1, 1]);
  assert.equal(w.text(d.id), docBefore);
  assert.equal(w.record.head(d.id).rowVersion, 1);
  assert.equal(r.live, true);
  /* a determination resting on none of it is flagged only for what it rests on */
  assert.deepEqual(w.c.determinationRead({ id: control.id, viewer: V("olive") }).basis_changed.causes
    .map((c) => `${c.kind}:${c.subject}:${c.source}`).sort(),
    [`finding:${F}:edition`, `passage:${ev.content}:newer_capture`, `standard:${std}:superseded`].sort());
});

test("R10: reevaluation's notice is recorded once per cause, and one that names nothing this module holds flags nothing", () => {
  const { w, input } = scene();
  const d = w.c.determine(input());
  const e = { kind: "finding", subject: F, source: "supersession", since: "2026-09-28T02:00:00Z", detail: "moved", dependents: [] };
  assert.deepEqual(w.c.basisChanged(e), { flagged: 1 });
  w.c.basisChanged(e);
  assert.equal(w.count("determination_flags"), 1);
  assert.deepEqual(w.c.basisChanged({ ...e, subject: "INQ-2026-0099-none" }), { flagged: 0 });
  assert.deepEqual(w.c.basisChanged({ kind: "passage", subject: "a".repeat(64), affects: "affected" }), { flagged: 0 });
  assert.deepEqual(w.c.basisChanged({ kind: "passage", subject: input().act.evidence[0], affects: "unaffected" }), { flagged: 0 });
  assert.deepEqual(w.c.basisChanged({ kind: "passage", subject: input().act.evidence[0], affects: "affected" }), { flagged: 1 });
  assert.deepEqual(w.c.basisChanged(null), { flagged: 0 });
  const r = w.c.determinationRead({ id: d.id, viewer: V("olive") });
  /* reevaluation's `supersession` is read in this module's word for it, `superseded`, so one cause is named once (the
     R10 test above: a real division, told and read); the notice is stored as it was told */
  assert.deepEqual(r.basis_changed.causes.map((c) => [c.kind, c.source]).sort(), [["finding", "superseded"], ["passage", "newer_capture"]]);
  assert.equal(w.row(`SELECT source FROM determination_flags WHERE kind='finding'`).source, "supersession");
});

test("R11 R15: determinationsFor lists at most 200 a page in id order (a lower limit honoured, a higher not), truncated by reading one past, with its filters, and only determinations in projects the viewer sees", () => {
  const { w, proj, std, input } = scene();
  const second = w.standard("Parks Code 12.08.040", { period: { from: "2020-01-01", to: "2030-12-31" } });
  const a = w.c.determine(input());
  const b = w.c.determine(input({ act: { id: a.act.id }, supersedes: a.id, reason: "restated",
    standards: [{ standard: second, outcome: "compliant" }],
    rows: [{ standard: second, requires: "a sign", did: "a sign", reading: "aligns" }] }));
  const c = w.c.determine(input({ standards: [{ standard: std, outcome: "unclear" }], questions: [{ question: "Q?" }] }));
  const ids = (x) => x.items.map((i) => i.id);
  const all = quiet(w, () => w.c.determinationsFor({ viewer: V("pat") }));
  assert.deepEqual([ids(all), all.truncated, all.limit, all.cursor], [[a.id, b.id, c.id], false, DETERMINATIONS_PAGE_MAX, null]);
  assert.deepEqual(all.items[0], { id: a.id, project: proj, act: a.act, outcomes: [{ standard: std, outcome: "noncompliant" }],
    findings: [{ finding: F, case: "CASE-2026-0001", edition: 1, version_sha: a.findings[0].version_sha, role: "load_bearing" }],
    author: V("olive"), at: a.at, supersedes: null, superseded_by: b.id, live: false });
  /* each item is a subset of determinationRead's one shape */
  const read = w.c.determinationRead({ id: a.id, viewer: V("pat") });
  for (const [k, v] of Object.entries(all.items[0]))
    if (k === "findings") assert.deepEqual(v, read.findings.map(({ finding, case: c, edition, version_sha, role }) =>
      ({ finding, case: c, edition, version_sha, role })));
    else assert.deepEqual(v, read[k], k);
  assert.deepEqual(ids(w.c.determinationsFor({ live: true, viewer: V("pat") })), [b.id, c.id]);
  assert.deepEqual(ids(w.c.determinationsFor({ act: a.act.id, viewer: V("pat") })), [a.id, b.id]);
  assert.deepEqual(ids(w.c.determinationsFor({ standard: second, viewer: V("pat") })), [b.id]);
  assert.deepEqual(ids(w.c.determinationsFor({ outcome: "unclear", viewer: V("pat") })), [c.id]);
  assert.deepEqual(ids(w.c.determinationsFor({ finding: F, viewer: V("pat") })), [a.id, b.id, c.id]);
  assert.deepEqual(ids(w.c.determinationsFor({ finding: DOC, viewer: V("pat") })), []);
  assert.deepEqual(ids(w.c.determinationsFor({ project: proj, viewer: V("pat") })), [a.id, b.id, c.id]);
  /* a lower limit honoured, the cursor continues */
  const p1 = w.c.determinationsFor({ limit: 2, viewer: V("pat") });
  assert.deepEqual([ids(p1), p1.truncated, p1.cursor, p1.limit], [[a.id, b.id], true, b.id, 2]);
  assert.deepEqual(ids(w.c.determinationsFor({ limit: 2, after: p1.cursor, viewer: V("pat") })), [c.id]);
  /* R15: an outsider sees none; naming the project answers as membership says */
  assert.deepEqual(ids(w.c.determinationsFor({ viewer: V("quinn") })), []);
  assert.deepEqual(ids(w.c.determinationsFor({ viewer: "nobody" })), []);
  refused(w.c.determinationsFor({ project: proj, viewer: V("quinn") }), "NO_SUCH_PROJECT");
  refused(w.c.determinationsFor({ project: "PROJ-2026-9999-none", viewer: V("pat") }), "NO_SUCH_PROJECT");
  assert.deepEqual(ids(w.c.determinationsFor({ viewer: V("ron") })), [a.id, b.id, c.id], "an administrator sees every project");
  /* the cap: 200 a page whatever limit is asked; the 201st is behind the cursor */
  for (let i = 0; i < DETERMINATIONS_PAGE_MAX; i++)
    w.st.sql.exec(`INSERT INTO determinations (determination_id, project_id, act_id, act_description, act_role, act_body,
                     act_evidence, author, at) VALUES (?,?,?,?,?,?,?,?,?)`,
                  `CONF-2027-${String(i).padStart(4, "0")}-determination`, proj, "ACT-2027-0001", "d", "r", "b", "[]",
                  V("olive"), "2027-01-01T00:00:00Z");
  for (const limit of [undefined, 500, 201]) {
    const page = w.c.determinationsFor({ limit, viewer: V("pat") });
    assert.deepEqual([page.items.length, page.truncated, page.limit], [DETERMINATIONS_PAGE_MAX, true, DETERMINATIONS_PAGE_MAX]);
  }
  const rest = w.c.determinationsFor({ after: w.c.determinationsFor({ viewer: V("pat") }).cursor, viewer: V("pat") });
  assert.deepEqual([rest.items.length, rest.truncated], [3, false]);
});

test("R15: every read answers a determination in a project the viewer may not see as an absent one; a hidden project's determinations reach nobody outside it", () => {
  const { w, input } = scene();
  const d = w.c.determine(input());
  const hidden = w.project("Hidden", "olive");
  w.join(hidden, "olive", "pat");
  const H = "INQ-2026-0600-hidden";
  w.inquiry(H);
  w.publish(H, hidden, { caseId: "CASE-2026-0006" });
  const h = w.c.determine(input({ project: hidden, findings: [H] }));
  assert.equal(h.ok, true, JSON.stringify(h).slice(0, 200));
  for (const viewer of [V("quinn"), V("sam"), "nobody", "", null]) {
    for (const id of [d.id, h.id]) refused(w.c.determinationRead({ id, viewer }), "NO_SUCH_DETERMINATION");
    assert.deepEqual(w.c.determinationsFor({ viewer }).items, []);
  }
  /* pat is in both, olive owns both; a machine sees every one */
  for (const viewer of [V("pat"), V("olive"), MACHINE])
    assert.deepEqual(w.c.determinationsFor({ viewer }).items.map((i) => i.id), [d.id, h.id]);
  /* participation, not the determination's author, decides: a member who leaves the project entirely loses sight */
  w.membership.projectRemove({ projectId: hidden, handle: "h_pat", by: "olive", comment: "left", viewer: V("olive") });
  refused(w.c.determinationRead({ id: h.id, viewer: V("pat") }), "NO_SUCH_DETERMINATION");
  assert.deepEqual(w.c.determinationsFor({ viewer: V("pat") }).items.map((i) => i.id), [d.id]);
});

test("R1 R9 R11 R12 R18 R21: the ops route to the services, and the author, proposer and viewer are the control plane's stamps, never the body's", () => {
  const { w, proj, input } = scene();
  const body = { ...input(), author: V("pat"), viewer: V("pat") };
  delete body.author;
  const machineBody = { ...body, author: V("olive") };
  refused(w.op("determine", { author: MACHINE, viewer: MACHINE }, machineBody), "MACHINE_CANNOT_DETERMINE");
  const d = w.op("determine", { author: V("olive"), viewer: V("olive") }, { ...body, author: MACHINE });
  assert.deepEqual([d.ok, d.author], [true, V("olive")]);
  assert.equal(w.op("determination", { id: d.id, viewer: V("pat") }).id, d.id);
  refused(w.op("determination", { id: d.id, viewer: V("quinn") }), "NO_SUCH_DETERMINATION");
  assert.deepEqual(w.op("determinations", { project: proj, live: "true", viewer: V("pat") }).items.map((i) => i.id), [d.id]);
  const p = w.op("comparisonpropose", { author: MACHINE, viewer: MACHINE },
                 { project: proj, proposer: V("olive"), rows: [], standards: [] });
  assert.deepEqual([p.ok, p.proposal.proposer, p.proposal.machine_work], [true, MACHINE, true]);
  assert.equal(w.op("comparison", { id: p.proposal.id, viewer: V("pat") }).proposal.id, p.proposal.id);
  /* R21 (N345): comparisonfacts, the viewer the control plane's stamp; the body's viewer never wins */
  const x = w.contradicted();
  const f = w.op("comparisonfacts", { viewer: V("pat") }, { contradiction: x.inquiry, standardSide: "b", viewer: "nobody" });
  assert.deepEqual([f.ok, f.contradiction, f.standard_side], [true, x.inquiry, "b"]);
  refused(w.op("comparisonfacts", { viewer: "nobody" }, { contradiction: x.inquiry, standardSide: "b", viewer: V("pat") }),
          "NO_SUCH_CONTRADICTION_INQUIRY");
  assert.equal(w.op("comparisonfacts", { viewer: V("pat"), contradiction: x.inquiry, standardSide: "a" }).standard_side, "a");
});

test("R12 R24: comparisonRead withholds whole a standard the viewer may not see, with its rows, and an evidence id or question inquiry the same, stating out_of_view: true; a viewer who sees all is answered as before", () => {
  const { w, proj, std, ev, input } = scene();
  const second = w.standard("Parks Code 12.08.040", { period: { from: "2020-01-01", to: "2030-12-31" } });
  const q = "INQ-2026-0610-asked";
  w.inquiry(q);
  const p = w.c.comparisonPropose({ project: proj, act: input().act, standards: [std, second],
    rows: [input().rows[0], { standard: second, requires: "a sign", did: "a sign", reading: "aligns", content: [ev.content] }],
    questions: [{ question: "Was a sign posted?", inquiry: q }], proposer: V("olive"), viewer: V("olive") });
  assert.equal(p.ok, true, JSON.stringify(p).slice(0, 300));
  const c = withholding(w, (id, viewer) => [std, DOC, q].includes(id) && viewer === V("pat"));
  const r = c.comparisonRead({ id: p.proposal.id, viewer: V("pat") }).proposal;
  assert.deepEqual([r.standards, r.rows.map((x) => [x.standard, x.content]), r.act.evidence, r.questions, r.out_of_view],
    [[second], [[second, []]], [], [{ question: "Was a sign posted?" }], true]);
  for (const gone of [std, ev.content, q]) assert.equal(JSON.stringify(r).includes(gone), false, gone);
  const full = w.c.comparisonRead({ id: p.proposal.id, viewer: V("pat") }).proposal;
  assert.deepEqual([full.standards, "out_of_view" in full, full.contradiction], [[std, second], false, null]);
  assert.deepEqual(c.comparisonRead({ id: p.proposal.id, viewer: V("olive") }).proposal, full);
});
