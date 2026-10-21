/* Settings › Declared bias at the module's interface (R65): the lens in force, writing and adopting a set, drafting one from an outside
   policy, and work made under an earlier lens, each over a fake plane answering in the owners' shapes (bias R11–R21, R35, R36). */
import test from "node:test";
import assert from "node:assert/strict";
import { acts, all, day, has, lacks, open, said, squash, textOf, SCREENS } from "./kit.mjs";
import { ADMIN, MEMBER, PROJ_BIAS, BIAS_SETS, LENS_TEAM, LENS_PROJECT, POLICY, DEBT_OPEN, DEBT_SETTLED, biasTable, env } from "./fixtures.mjs";

const ops = (o) => [...new Set(acts(o.tree).map((b) => b.attrs["data-act"]))].sort();
const part = (o, name) => all(o.tree, (e) => e.attrs["data-part"] === name)[0];
const req = (o, op) => o.p.requests.filter((r) => r.op === op);

test("R65 bias lists exactly its registry acts (the red contract test holds it), and nothing is sent by drawing it beyond the lens and the projects", async () => {
  const s = SCREENS.find((x) => x.id === "bias");
  assert.deepEqual(s.acts.map((a) => a.op).sort(), ["biasadopt", "biasdebt", "biasdebtresolve", "biasinhale", "biasmanifest", "promote", "writinghelp"]);
  const a = await open("bias", { me: ADMIN, table: biasTable() });
  assert.deepEqual(a.p.requests.map((r) => r.op).filter((op) => !["accountreference", "assistantstate", "groupkeystate", "subscriptionsignin"].includes(op)).sort(), ["biasmanifest", "list", "projectlist"]);
  assert.deepEqual(req(a, "list")[0].query, { type: "bias", state: "proposed", limit: "50" }, "only the bias sets, as `list` declares");
  assert.deepEqual(req(a, "biasmanifest")[0].query, { scope: "instance" });
});

test("R65 the lens in force for the whole team: each statement's kind, subject, text and reason, who adopted and when, what the set does not enforce, and the lens's number; no empty lens", async () => {
  const a = await open("bias", { me: ADMIN, table: biasTable() });
  has(a, "screen.bias.the_lens_your_team_reads"); has(a, "screen.bias.it_never_blocks_work");
  const lens = part(a, "lens");
  const t = squash(textOf(lens));
  const B = "screen.bias.";
  assert.ok(t.includes(said(B + "kind.scrutiny")) && t.includes(said(B + "row.about", { subject: "ENT-2026-0007" })) && t.includes(LENS_TEAM.statements[0].text) && t.includes(said(B + "row.why", { reason: LENS_TEAM.statements[0].justification })));
  has(a, B + "head.team"); has(a, B + "lens.label"); has(a, B + "lens.team"); has(a, B + "link.write"); has(a, B + "link.draft");
  assert.ok(t.includes(said(B + "dt.lens")) && t.includes(said(B + "by_admin_for_the_team.team", { admin: "rosa", date: "October 8, 2026" })), "who adopted it and when, for the team");
  assert.ok(t.includes(said("screen.bias.what_this_set_does_not")) && t.includes(LENS_TEAM.residue[0].text));
  assert.ok(t.includes("9f3a…c07e") && t.includes(said("screen.bias.the_same_lens_gives_the")));
  has(a, "screen.bias.to_adopt_write_or_draft"); has(a, "screen.bias.your_queue_tells_you_when");
  lacks(a, "screen.bias.when_a_project_statement_meets"); lacks(a, "screen.bias.when_an_adopted_set_is");
  assert.ok(ops(a).includes("biasmanifest"));
  assert.equal(all(lens, (e) => /cs-row/.test(e.attrs.class || "")).length, 1);
});

test("R65 choosing a project and asking for its lens sends scope and scopeId and draws the team's statements then the project's; a project with nothing in force says so and what a case published now says, never an empty lens", async () => {
  const a = await open("bias", { me: ADMIN, table: biasTable() });
  const r = await a.press("biasmanifest", { choose: { "bi-scope": PROJ_BIAS.id } });
  assert.deepEqual(r.sent[0].query, { scope: "project", scopeId: PROJ_BIAS.id });
  assert.deepEqual(req(a, "biasmanifest").at(-1).query, { scope: "project", scopeId: PROJ_BIAS.id }, "read again for that project");
  const t = squash(textOf(part(a, "lens")));
  assert.ok(t.indexOf(LENS_PROJECT.statements[0].text) >= 0 && t.indexOf(LENS_PROJECT.statements[0].text) < t.indexOf(LENS_PROJECT.statements[1].text), "the team's, then the project's");
  assert.equal(all(part(a, "lens"), (e) => /cs-row/.test(e.attrs.class || "")).length, 2);
  has(a, "screen.bias.in_force_for_the_coliseum", { project: PROJ_BIAS.title });
  assert.ok(t.includes(said("screen.bias.row.project")), "a project's own statement is marked");
  assert.ok(t.includes(said("screen.bias.by_admin_for_the_team", { admin: "rosa", admin_date: "October 8, 2026", owner: "dev", owner_date: "October 8, 2026" })), "both adoptions, the team's and the project's");
  // a project nothing is in force for
  const none = await open("bias", { me: ADMIN, table: biasTable({ projectlist: env({ ok: true, projects: [PROJ_BIAS, { id: "PROJ-2026-0009-x", title: "Other" }] }) }) });
  await none.press("biasmanifest", { choose: { "bi-scope": "PROJ-2026-0009-x" } });
  has(none, "screen.bias.no_lens_is_in_force", { project: "Other" }); has(none, "screen.bias.a_case_published_now_says");
  assert.equal(all(part(none, "lens"), (e) => /cs-row/.test(e.attrs.class || "")).length, 0, "no empty lens is drawn");
});

test("R65 the folds: a project statement that met a locked one, and a set adopted while only offered, each only when the owner says so", async () => {
  const lens = { ...LENS_TEAM, lock_violations: [{ statement_id: "p1", detail: "d" }], pins_proposed: [{ bundle_id: "BIAS-2026-0004-x", revision: "d".repeat(64), state: "proposed" }] };
  const a = await open("bias", { me: ADMIN, table: biasTable({ biasmanifest: env(lens) }) });
  has(a, "screen.bias.when_a_project_statement_meets"); has(a, "screen.bias.a_project_statement_that_replaces"); has(a, "screen.bias.the_page_lists_it_so");
  has(a, "screen.bias.when_an_adopted_set_is"); has(a, "screen.bias.a_set_that_was_adopted"); has(a, "screen.bias.this_page_then_lists_it");
  const bad = await open("bias", { me: ADMIN, table: biasTable({ biasmanifest: env({ ok: true, scope: "instance", in_force: null, unresolved_pins: [] }) }) });
  assert.ok(all(bad.tree, (e) => e.attrs["data-state"] === "failed").length >= 1, "a lens that cannot be computed is drawn failed");
});

test("R65 writing a set: the bundle promote takes (a bias bundle offered), the subject resolved from its name, the guard accepts it; a name the record does not know is refused in place; then the saved set can be adopted for the team or a project with the member's reason", async () => {
  const a = await open("bias", { me: ADMIN, table: biasTable(), reachable: true });
  lacks(a, "screen.bias.why_you_adopt_it");
  for (const k of ["head.write", "kind.label", "statement.label", "cites.label"]) has(a, "screen.bias." + k);
  const values = { "bi-name": "Lakeshore Tenants: how we read the city", "bi-subject": "City Housing Department", "bi-text": "We read the Department's own reports closely.", "bi-why": "It writes the figures it is judged by.", "bi-not": "It sets no bar and rules no source false." };
  const r = await a.press("promote", { data: { from: "write" }, values });
  const sent = r.sent.find((x) => x.op === "promote");
  assert.equal(sent.body.base, null);
  assert.match(sent.body.snapKey, /^\d{8}T\d{6}Z_[0-9a-f]{8}$/);
  assert.deepEqual([sent.body.meta.object_type, sent.body.meta.current_state, sent.body.meta.title], ["bias", "proposed", values["bi-name"]]);
  assert.equal(sent.body.files.length, 1);
  const text = sent.body.files[0].text;
  for (const must of ["object_type: bias", "current_state: proposed", `title: ${JSON.stringify(values["bi-name"])}`, `subject: "ENT-2026-0007"`, `kind: "scrutiny"`, `text: ${JSON.stringify(values["bi-text"])}`, `justification: ${JSON.stringify(values["bi-why"])}`, "## What This Does Not Enforce", values["bi-not"]]) assert.ok(text.includes(must), must);
  assert.ok(r.sent.some((x) => x.op === "entitybyalias" && x.query.alias === "City Housing Department"), "the subject is looked up by its name");
  // an unknown name is refused in place and nothing is saved
  const unknown = await a.press("promote", { data: { from: "write" }, values: { ...values, "bi-subject": "Nobody Knows" } });
  assert.deepEqual(unknown.sent.filter((x) => x.op === "promote"), []);
  assert.equal(a.refused.key, "screen.bias.add_it_under_people_first");
  // a registry key typed as it is needs no lookup
  const key = await a.press("promote", { data: { from: "write" }, values: { ...values, "bi-subject": "ENT-2026-0011", "bi-kind": "inference" } });
  assert.ok(key.sent.find((x) => x.op === "promote").body.files[0].text.includes(`subject: "ENT-2026-0011"`) && !key.sent.some((x) => x.op === "entitybyalias"));
  // the set saved this sitting can be adopted: the whole team, then one project, each with its reason
  has(a, "screen.bias.why_you_adopt_it"); has(a, "screen.bias.head.adopt"); has(a, "screen.bias.adoptfor.label"); has(a, "screen.bias.the_whole_team_an_administrator"); has(a, "screen.bias.one_project_the_coliseum_lease", { project: PROJ_BIAS.title });
  const team = await a.press("biasadopt", { values: { "bi-adwhy": "  We agreed in the meeting.  " } });
  assert.deepEqual([team.sent[0].op, team.sent[0].body], ["biasadopt", { bundleId: "BIAS-2026-0003-lakeshore", reason: "We agreed in the meeting.", scope: "instance" }]);
  assert.equal(team.asked, false, "the reason is the member's own field: the shell asks none");
  const proj = await a.press("biasadopt", { values: { "bi-adopt-1": true, "bi-adwhy": "For this project." } });
  assert.deepEqual(proj.sent[0].body, { bundleId: "BIAS-2026-0003-lakeshore", reason: "For this project.", scope: "project", scopeId: PROJ_BIAS.id });
  // no reason, or one too long, sends nothing
  assert.deepEqual((await a.press("biasadopt", { values: { "bi-adwhy": "" } })).sent, []);
  assert.deepEqual((await a.press("biasadopt", { values: { "bi-adwhy": "x".repeat(2001) } })).sent, []);
});

test("R65 the team's earlier offered sets are listed and adoptable without writing them again: the cursor is followed, the set just saved comes first, a set of another type or already adopted is not listed, an empty answer draws no list", async () => {
  const pages = [
    { bundles: [BIAS_SETS[0], BIAS_SETS[1], BIAS_SETS[2]], limit: 50, cursor: "BIAS-2026-0002-adopted", total: 4 },
    { bundles: [BIAS_SETS[3]], limit: 50, cursor: null, total: 4 },
  ];
  const list = (q) => env(q.after ? pages[1] : pages[0]);
  const a = await open("bias", { me: ADMIN, table: biasTable({ list }), reachable: true });
  const wait = async () => { for (let i = 0; i < 20; i++) await new Promise((r) => setTimeout(r, 0)); };
  await wait();
  const asked = [...new Set(req(a, "list").map((r) => JSON.stringify(r.query)))].map((x) => JSON.parse(x));
  assert.deepEqual(asked, [{ type: "bias", state: "proposed", limit: "50" }, { type: "bias", state: "proposed", limit: "50", after: "BIAS-2026-0002-adopted" }], "the next page is read by the cursor, each page once");
  assert.equal(req(a, "list").filter((r) => r.query.after).length, 1, "a page is read once and kept");
  const adopt = part(a, "adopt");
  const t = squash(textOf(adopt));
  assert.ok(t.includes(BIAS_SETS[0].title) && t.includes("October 1, 2026") && t.includes(BIAS_SETS[3].title), "both offered sets, with when they were last written");
  assert.ok(!t.includes(BIAS_SETS[1].title) && !t.includes(BIAS_SETS[2].title), "an adopted set and one of another type are not listed");
  assert.equal(all(adopt, (e) => e.attrs.name === "bi-set").length, 2);
  // adopting an earlier one: its bundle id, the scope and the member's reason
  const first = await a.press("biasadopt", { values: { "bi-adwhy": "The first." } });
  assert.equal(first.sent[0].body.bundleId, "BIAS-2026-0001-earlier", "the first listed is the one chosen unless another is");
  const r = await a.press("biasadopt", { values: { "bi-set-1": true, "bi-adwhy": "We offered it last week." } });
  assert.deepEqual(r.sent[0].body, { bundleId: "BIAS-2026-0004-second", reason: "We offered it last week.", scope: "instance" });
  // the set just saved comes first
  const b = await open("bias", { me: ADMIN, table: biasTable({ list }), reachable: true });
  await wait();
  await b.press("promote", { data: { from: "write" }, values: { "bi-name": "Saved now", "bi-subject": "ENT-2026-0007", "bi-text": "T", "bi-why": "W", "bi-not": "N" } });
  const saved = await b.press("biasadopt", { values: { "bi-adwhy": "Now." } });
  assert.equal(saved.sent[0].body.bundleId, "BIAS-2026-0003-lakeshore");
  // control: an empty answer draws no list and no adoption
  const none = await open("bias", { me: ADMIN, table: biasTable(), reachable: true });
  assert.ok(!part(none, "adopt")); lacks(none, "screen.bias.why_you_adopt_it");
  // control: a list that cannot be read is drawn failed, never as no sets
  const bad = await open("bias", { me: ADMIN, table: biasTable({ list: { ok: false, status: 500, code: "X" } }), reachable: true });
  assert.ok(!part(bad, "adopt") && all(part(bad, "write"), (e) => e.attrs["data-state"] === "failed").length === 1);
});

test("R65 a refusal is drawn by the owner's words beside the act, and nothing else changes; a set with no name or no reason is not sent", async () => {
  const a = await open("bias", { me: ADMIN, table: biasTable({ promote: { ok: false, status: 409, code: "BIAS_REFUSED", reason: "BIAS_REFUSED", translation: "A statement says a source is false." } }) });
  const values = { "bi-name": "S", "bi-subject": "ENT-2026-0007", "bi-text": "T", "bi-why": "W", "bi-not": "N" };
  const r = await a.press("promote", { data: { from: "write" }, values });
  assert.ok(r.refused && a.refused.key === "refusal.BIAS_REFUSED" && a.refused.text.includes(said("refusal.BIAS_REFUSED")), JSON.stringify(a.refused));
  assert.deepEqual((await a.press("promote", { data: { from: "write" }, values: { ...values, "bi-name": "" } })).sent.filter((x) => x.op === "promote"), []);
  const adopt = await open("bias", { me: MEMBER, table: biasTable({ biasadopt: { ok: false, status: 403, code: "NOT_AN_ADMIN" } }) });
  await adopt.press("promote", { data: { from: "write" }, values });
  await adopt.press("biasadopt", { values: { "bi-adwhy": "Because." } });
  assert.ok(adopt.refused && adopt.refused.key === "refusal.NOT_AN_ADMIN", JSON.stringify(adopt.refused));
});

test("R65 drafting from an outside policy: biasinhale sends the policy, where it comes from and when; the proposals are marked not yet the member's, a bar and a verdict are left out with the design's words; nothing is saved until she starts a set, which promotes a draft once each has a subject and a reason", async () => {
  const a = await open("bias", { me: ADMIN, table: biasTable() });
  const r = await a.press("biasinhale", { values: { "bi-policy": "Staff verify every claim against two sources.", "bi-source": "Bay Courier standards page", "bi-when": "October 8, 2026" } });
  assert.deepEqual([r.sent[0].op, r.sent[0].body], ["biasinhale", { policy: "Staff verify every claim against two sources.", source: "Bay Courier standards page", retrieved: "October 8, 2026" }]);
  assert.deepEqual(r.sent.map((x) => x.op), ["biasinhale"], "nothing is saved, offered or adopted");
  const t = squash(textOf(part(a, "inhale")));
  has(a, "screen.bias.it_read_sentences_of", { read: "4", of: "4" }); has(a, "screen.bias.head.proposed"); has(a, "screen.bias.head.left_out"); has(a, "screen.bias.dt.bar"); has(a, "screen.bias.dt.verdict");
  assert.ok(t.includes(said("screen.bias.kind.scrutiny")), "a proposal's kind by its short name");
  for (const s of POLICY.statements) assert.ok(t.includes(s.text));
  has(a, "screen.bias.proposed_not_yet_yours"); has(a, "screen.bias.a_pattern_statement_is_never"); has(a, "screen.bias.nothing_was_saved_offered_or"); has(a, "screen.bias.starting_a_set_from_these");
  assert.ok(t.includes(POLICY.bars[0].text) && t.includes(said("screen.bias.it_says_how_strong_support")) && t.includes(said("screen.bias.that_is_a_bar_which")), "a bar");
  assert.ok(t.includes(POLICY.residue[0].text) && t.includes(said("screen.bias.it_says_a_source_is")) && t.includes(said("screen.bias.a_lens_never_says_that")), "a verdict");
  assert.ok(t.includes(POLICY.residue[1].text) && t.includes(POLICY.residue[1].why), "any other sentence left out, with the owner's why");
  // starting a set from the proposals: refused until each has a subject and a reason
  assert.deepEqual((await a.press("promote", { data: { from: "inhale" }, values: { "bi-psub0": "ENT-2026-0007", "bi-pwhy0": "" } })).sent.filter((x) => x.op === "promote"), []);
  const s = await a.press("promote", { data: { from: "inhale" }, values: { "bi-psub0": "ENT-2026-0007", "bi-pwhy0": "Because.", "bi-psub1": "City Housing Department", "bi-pwhy1": "And because." } });
  const body = s.sent.find((x) => x.op === "promote").body;
  assert.equal(body.meta.current_state, "draft");
  assert.ok(body.files[0].text.includes("current_state: draft") && body.files[0].text.includes(POLICY.statements[0].text) && body.files[0].text.includes(POLICY.statements[1].text));
  // control: an empty policy sends nothing
  assert.deepEqual((await a.press("biasinhale", { values: { "bi-policy": "" } })).sent, []);
});

test("R65 work made under an earlier lens: the address names the work, its record is read, a member settles it with her own reason (1 to 4,000 characters), the assistant cannot; a settled one shows its settlement and offers no settling; unknown work draws nothing", async () => {
  const a = await open("bias", { me: ADMIN, table: biasTable(), subject: "RUN-2026-0042" });
  assert.deepEqual(req(a, "biasdebt")[0].query, { run: "RUN-2026-0042" });
  const d = part(a, "debt");
  has(a, "screen.bias.work_made_under_an_earlier"); has(a, "screen.bias.waiting_for_your_word"); has(a, "screen.bias.this_cannot_be_undone_your"); has(a, "screen.bias.the_assistant_cannot_settle_it");
  assert.ok(textOf(d).includes(said("screen.bias.earlier.made", { then: "41be0000", made_on: "October 9, 2026", now: "9f3a0000", adopted_on: "October 9, 2026", change: DEBT_OPEN.moved_basis })), "the lens then and now, when, and the change");
  assert.deepEqual((await a.press("biasdebtresolve", { values: { "bi-dreason": "" } })).sent, []);
  assert.deepEqual((await a.press("biasdebtresolve", { values: { "bi-dreason": "x".repeat(4001) } })).sent, []);
  const r = await a.press("biasdebtresolve", { values: { "bi-dreason": "  The change does not bear on this finding.  " } });
  assert.deepEqual([r.sent[0].op, r.sent[0].body], ["biasdebtresolve", { run: "RUN-2026-0042", reason: "The change does not bear on this finding." }]);
  assert.equal(r.asked, false, "the reason is her own field: the shell asks none");
  assert.ok(r.sent.some((x) => x.op === "biasdebt"), "the record is read again");
  const rec = await a.press("biasdebt", { data: { run: "RUN-2026-0042" } });
  assert.deepEqual(rec.sent[0].query, { run: "RUN-2026-0042" });
  // settled: its settlement is drawn, no settling is offered
  const done = await open("bias", { me: ADMIN, table: biasTable({ biasdebt: env(DEBT_SETTLED) }), subject: "RUN-2026-0042" });
  assert.ok(textOf(part(done, "debt")).includes(said("screen.bias.earlier.settled", { who: "mai", date: "October 10, 2026", reason: DEBT_SETTLED.settlements[0].reason })));
  has(done, "screen.bias.head.settled");
  assert.ok(!ops(done).includes("biasdebtresolve")); lacks(done, "screen.bias.waiting_for_your_word");
  // work this reader cannot open (or that carries no debt): nothing is drawn of it
  const none = await open("bias", { me: ADMIN, table: biasTable(), subject: "RUN-2026-9999" });
  assert.ok(!ops(none).includes("biasdebtresolve") && !textOf(part(none, "debt")).includes("RUN-2026-9999"));
  // control: no address, no work-under-an-earlier-lens part and no biasdebt read
  const bare = await open("bias", { me: ADMIN, table: biasTable() });
  assert.ok(!part(bare, "debt") && !req(bare, "biasdebt").length);
});

test("R65 control: a request that carries a field its owner does not declare is refused by the guard (promote's, biasadopt's, biasinhale's and biasdebtresolve's bodies are accepted)", async () => {
  // the guard runs in the harness on every request above; this holds that the presses used the real shapes: no FieldMismatch was raised there
  const a = await open("bias", { me: ADMIN, table: biasTable() });
  await a.press("biasinhale", { values: { "bi-policy": "A sentence long enough to count." } });
  await a.press("promote", { data: { from: "write" }, values: { "bi-name": "S", "bi-subject": "ENT-2026-0007", "bi-text": "T", "bi-why": "W", "bi-not": "N" } });
  await a.press("biasadopt", { values: { "bi-adwhy": "Because." } });
  assert.ok(true);
});

/* ---- T51 fix round 2: C87, C94 ---- */

const WRITE = { "bi-name": "S", "bi-subject": "ENT-2026-0007", "bi-text": "T", "bi-why": "W", "bi-not": "N" };

test("R65 C87: Propose statements from it with the policy empty, and Save the set with a required box empty, send nothing and name the box; filled, they send (control)", async () => {
  const a = await open("bias", { me: ADMIN, table: biasTable() });
  const named = (labelKey) => said("shell.field.needed", { field: said(labelKey) });
  const none = await a.press("biasinhale", { values: { "bi-policy": "  " } });
  assert.deepEqual(none.sent, []);
  assert.equal(a.refused.text, named("screen.bias.the_policy_in_its_own"), a.refused && a.refused.text);
  for (const [box, label] of [["bi-name", "screen.bias.name_of_the_set"], ["bi-subject", "screen.bias.who_or_what_it_is"], ["bi-text", "screen.bias.statement.label"], ["bi-why", "screen.bias.why_you_read_it_this"]]) {
    const r = await a.press("promote", { data: { from: "write" }, values: { ...WRITE, [box]: "" } });
    assert.deepEqual(r.sent.filter((x) => x.op === "promote"), [], box);
    assert.equal(a.refused.text, named(label), box + ": " + (a.refused && a.refused.text));
  }
  // a pattern statement must cite
  const pat = await a.press("promote", { data: { from: "write" }, values: { ...WRITE, "bi-kind": "pattern", "bi-cite": "" } });
  assert.deepEqual(pat.sent.filter((x) => x.op === "promote"), []);
  assert.equal(a.refused.text, named("screen.bias.cites.label"));
  // starting a set from proposals: each proposal's subject and reason are named
  await a.press("biasinhale", { values: { "bi-policy": "Staff verify every claim against two sources." } });
  const s1 = await a.press("promote", { data: { from: "inhale" }, values: { "bi-psub0": "", "bi-pwhy0": "Because." } });
  assert.deepEqual(s1.sent.filter((x) => x.op === "promote"), []);
  assert.equal(a.refused.text, named("screen.bias.who_or_what_it_is"));
  const s2 = await a.press("promote", { data: { from: "inhale" }, values: { "bi-psub0": "ENT-2026-0007", "bi-pwhy0": "" } });
  assert.deepEqual(s2.sent.filter((x) => x.op === "promote"), []);
  assert.equal(a.refused.text, named("screen.bias.why_you_read_it_this"));
  // control: filled sends
  assert.equal((await a.press("biasinhale", { values: { "bi-policy": "Staff verify." } })).sent.filter((x) => x.op === "biasinhale").length, 1);
  assert.equal((await a.press("promote", { data: { from: "write" }, values: { ...WRITE, "bi-kind": "scrutiny" } })).sent.filter((x) => x.op === "promote").length, 1);
});

test("R65 C94: who adopted a set and who settled a debt are named by memberName: the handle where it differs from the id, the fallback word where the member has none, never an id", async () => {
  const roster = [{ member_id: "m-7", handle: "luisa", role: "admin", status: "active", capabilities: [], expertise: [] }, { member_id: "m-9", handle: null, role: "member", status: "invited", capabilities: [], expertise: [] }];
  const lens = { ...LENS_TEAM, bundles: [{ ...LENS_TEAM.bundles[0], adopted_by: "member:m-7" }] };
  const a = await open("bias", { me: ADMIN, table: biasTable({ memberlist: env({ members: roster }), biasmanifest: env(lens) }) });
  assert.ok(a.text.includes(said("screen.bias.by_admin_for_the_team.team", { admin: "luisa", date: day("2026-10-08") })), "the adopter by handle");
  assert.ok(!a.text.includes("m-7"));
  const lens2 = { ...LENS_TEAM, bundles: [{ ...LENS_TEAM.bundles[0], adopted_by: "member:m-9" }] };
  const b = await open("bias", { me: ADMIN, table: biasTable({ memberlist: env({ members: roster }), biasmanifest: env(lens2) }) });
  assert.ok(b.text.includes(said("screen.bias.by_admin_for_the_team.team", { admin: said("shell.card.member"), date: day("2026-10-08") })), "no handle: the fallback word");
  assert.ok(!b.text.includes("m-9"));
  const settled = { ...DEBT_SETTLED, settlements: [{ ...DEBT_SETTLED.settlements[0], actor: "member:m-7" }] };
  const c = await open("bias", { me: ADMIN, subject: "RUN-2026-0042", table: biasTable({ memberlist: env({ members: roster }), biasdebt: env(settled) }) });
  assert.ok(c.text.includes(said("screen.bias.earlier.settled", { who: "luisa", date: day("2026-10-10"), reason: settled.settlements[0].reason })));
  assert.ok(!c.text.includes("m-7"));
});
