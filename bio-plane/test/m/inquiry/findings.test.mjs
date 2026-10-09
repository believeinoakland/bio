/* R53 (A9; bias R40): a question's findings made under a project lens are bias's work products, kind `finding`. A finding
   is a question's conclusion, recorded with the lens in force for the project its document states; registered with the
   real bias module as `plane` registers it (`inquiryFindings`, the fixture's `bias` world), and swept by bias's own
   `biasDebtSweep`. Driven through the real promotion. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, inquiryMd, NOW } from "./fixture.mjs";
import { inquiryFindings, INTERNAL_VIEWER } from "../../../src/inquiry/index.mjs";

const DOC = "INFO-2026-5301-doc", LENS = "BIAS-2026-5301-lens";
const WHY = "We adopt this lens because the office is a party to matters this group examines.";
const CONCLUDED = ['conclusion: "the transfer was made"', 'falsifier: "a ledger showing no transfer"'];
const SWEEP_AT = Date.parse("2026-09-29T00:00:00Z");

/** A bias set's bundle.md in the record's grammar, one statement whose text is `text`. */
const lensMd = (state, prior, text) => ["---", `id: ${LENS}`, "object_type: bias", `title: "Project lens"`,
  `current_state: ${state}`, `prior_state: ${prior}`, `created: "2026-09-27T00:00:00Z"`, `last_updated: "2026-09-27T00:00:00Z"`,
  "group: test-group", "statements:", `  - id: "s1"`, `    kind: "scrutiny"`, `    subject: "ENT-2026-0007"`,
  `    text: ${JSON.stringify(text)}`, `    justification: "The office is a party to matters this group examines."`,
  "    citations: []", "    locked: false", "---", "", "## Statements", "", "The lens.", "", "## Adoption", "", "Adopted.", "",
  "## What This Does Not Enforce", "", "It does not check whether a second source was independent of the first.", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");
const TEXT0 = "Claims from this office need a second, independent record before they bear load.";

function lensWorld({ bias = true } = {}) {
  const w = world({ bias });
  w.member("ruth"); w.member("sam");
  const P = w.project("Sewer fund", "ruth");
  w.doc(DOC);
  w.lensAt = (state, prior, text = TEXT0) => {
    const r = w.promote(LENS, lensMd(state, prior, text), undefined, { author: "member:ruth", meta: { object_type: "bias" } });
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  };
  w.adopt = () => {
    w.lensAt("draft", "null"); w.lensAt("proposed", "draft"); w.lensAt("adopted", "proposed");
    const a = w.bias.biasAdopt({ reason: WHY, bundleId: LENS, scope: "project", scopeId: P, author: "ruth",
                                 identity: "member:ruth", viewer: "member:ruth" });
    assert.equal(a.ok, true, JSON.stringify(a).slice(0, 400));
  };
  /* the lens as an internal read sees it (a machine viewer): the project is hidden (no visibility recorded, membership
     R85) and ruth's alone, so the founder's `admin` is blind to it (D54, K2442) */
  w.lensNow = () => w.bias.biasManifest({ scope: "project", scopeId: P, viewer: INTERNAL_VIEWER, limit: 1 }).statements_sha;
  /** A question stating `project` (none when null), created open and then concluded by `author`. */
  w.conclude = (id, project, author = "member:ruth") => {
    const extra = project ? [`project: ${project}`] : [];
    const legs = [{ target: DOC }];
    assert.equal(w.promote(id, inquiryMd(id, { legs, extra }), undefined, { author }).ok, true);
    const r = w.promote(id, inquiryMd(id, { legs, state: "concluded", prior: "open", extra: [...extra, ...CONCLUDED] }),
      undefined, { author });
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  };
  w.P = P;
  return w;
}

test("R53 bias R40: a project-lens change raises a debt on a question's finding through bias's real sweep; a finding made under no project lens raises none", async () => {
  const w = lensWorld();
  const Q0 = "INQ-2026-5301-nolens", Q1 = "INQ-2026-5302-lens", QX = "INQ-2026-5303-noproject", QO = "INQ-2026-5304-open";
  w.conclude(Q0, w.P);                    /* concluded before any lens is in force for the project */
  w.adopt();
  const then = w.lensNow();
  assert.match(then, /^[0-9a-f]{64}$/);
  w.conclude(Q1, w.P);                    /* concluded under the project's lens */
  w.conclude(QX, null);                   /* a question stating no project: no project lens to be made under */
  assert.equal(w.promote(QO, inquiryMd(QO, { legs: [{ target: DOC }], extra: [`project: ${w.P}`] })).ok, true);

  const src = inquiryFindings(w.host);
  assert.deepEqual(src.list("", 50), [`finding:${Q0}`, `finding:${Q1}`], "each concluded question stating a project, ascending");
  assert.deepEqual(src.list(`finding:${Q0}`, 50), [`finding:${Q1}`], "resumes after the cursor");
  assert.deepEqual(src.list("", 1), [`finding:${Q0}`], "at most the limit");
  assert.deepEqual(await src.read(`finding:${Q1}`), { context: { type: "project", id: w.P }, principal: "ruth",
    lens: { basis: "at_open", statements_sha: then }, ranUnder: null, rerunOf: null, registered: NOW });
  assert.equal((await src.read(`finding:${Q0}`)).lens, null, "made under no project lens: undetermined, never filled in");
  assert.equal(await src.read(`finding:${QX}`), null);
  assert.equal(await src.read("RUN-1"), null, "a key of another kind names no finding");
  assert.equal(await src.visible(`finding:${Q1}`, "member:ruth"), true);
  assert.equal(await src.visible(`finding:${Q1}`, "member:sam"), false, "the question's own sight: sam is not in the project");

  /* registered once: a second registration of the kind is bias's refusal */
  assert.equal(w.bias.registerWorkProducts("finding", src).reason, "WORK_PRODUCTS_DECLARED");

  /* the lens unchanged: nothing raised */
  const quiet = await w.bias.biasDebtSweep(SWEEP_AT);
  assert.deepEqual([quiet.raised, quiet.undetermined], [[], [`finding:${Q0}`]]);
  assert.equal(w.count("bias_debts"), 0);

  /* the project's lens changes: the finding made under it carries a debt; the one made under none does not */
  w.lensAt("adopted", "proposed", "Claims from this office need two independent records before they bear load.");
  const now = w.lensNow();
  assert.notEqual(now, then);
  const s = await w.bias.biasDebtSweep(SWEEP_AT + 1000);
  assert.deepEqual([s.raised, s.undetermined], [[`finding:${Q1}`], [`finding:${Q0}`]]);
  const d = w.row(`SELECT * FROM bias_debts WHERE run=?`, `finding:${Q1}`);
  assert.deepEqual([d.context_type, d.context_id, d.moved_basis, d.lens_then, d.lens_now, JSON.parse(d.recipients)],
                   ["project", w.P, "at_open", then, now, ["ruth"]]);
  assert.equal(w.row(`SELECT count(*) AS n FROM bias_debts WHERE run=?`, `finding:${Q0}`).n, 0, "negative control");
  /* disclosed, and never blocking: the debt reads back, and the question still moves */
  const shown = w.bias.biasDebt({ run: `finding:${Q1}`, viewer: "member:ruth" });
  assert.deepEqual([shown.found, shown.open], [true, true]);
  assert.equal(w.promote(Q1, w.text(Q1).replace("the transfer was made", "the transfer was made in March")).ok, true);
});

test("R53 the lens recorded: a re-revision of a concluded question keeps its finding; a host with no bias bound records no lens; a purged project or question takes its finding", async () => {
  const w = lensWorld();
  w.adopt();
  const Q = "INQ-2026-5311-kept";
  w.conclude(Q, w.P);
  const row = () => w.row(`SELECT project_id, lens_state, lens_sha, principal, at FROM inquiry_findings WHERE bundle_id=?`, Q);
  const made = row();
  assert.deepEqual(made, { project_id: w.P, lens_state: "recorded", lens_sha: w.lensNow(), principal: "ruth", at: NOW });
  w.clock.now = "2026-09-28T02:00:00Z";
  w.lensAt("adopted", "proposed", "A changed lens.");
  assert.equal(w.promote(Q, w.text(Q).replace("the transfer was made", "the transfer was made twice")).ok, true);
  assert.deepEqual(row(), made, "a revision that stays concluded is not a new finding");

  /* a machine's conclusion names no principal */
  const M = "INQ-2026-5312-machine";
  w.conclude(M, w.P, "class:daemon");
  assert.equal(w.row(`SELECT principal FROM inquiry_findings WHERE bundle_id=?`, M).principal, null);

  /* a concluded question with no recorded finding (concluded before findings were recorded) is offered, undetermined */
  w.st.sql.exec(`DELETE FROM inquiry_findings WHERE bundle_id=?`, M);
  assert.deepEqual(await inquiryFindings(w.host).read(`finding:${M}`), { context: { type: "project", id: w.P },
    principal: null, lens: null, ranUnder: null, rerunOf: null, registered: null });

  /* purge: the question's row goes with it, and with the project every finding read under its lens */
  w.record.purge({ bundleId: Q });
  assert.equal(row(), null);
  w.conclude("INQ-2026-5313-again", w.P);
  w.record.purge({ bundleId: w.P });
  assert.equal(w.count("inquiry_findings"), 0);

  /* no bias bound to the host: the finding is recorded, its lens is not read, and it offers none */
  const bare = lensWorld({ bias: false });
  bare.conclude(Q, bare.P);
  assert.deepEqual(bare.row(`SELECT lens_state, lens_sha FROM inquiry_findings WHERE bundle_id=?`, Q),
                   { lens_state: "unreadable", lens_sha: null });
  assert.equal((await inquiryFindings(bare.host).read(`finding:${Q}`)).lens, null);
  assert.equal(bare.k.bindBias({}), null, "bindBias takes only a bias instance");
});

test("R53 D54 K2442: the lens of a finding in a HIDDEN project is read as an internal read (a machine viewer), never as the founder, who is blind to it; a member's own read stays fenced", () => {
  const w = lensWorld();
  assert.equal(w.membership.visibilityOf(w.P), "hidden", "the fixture's project is hidden");
  w.adopt();
  const Q = "INQ-2026-5321-hidden";
  w.conclude(Q, w.P);
  const row = w.row(`SELECT lens_state, lens_sha FROM inquiry_findings WHERE bundle_id=?`, Q);
  assert.deepEqual(row, { lens_state: "recorded", lens_sha: w.lensNow() });
  assert.match(row.lens_sha, /^[0-9a-f]{64}$/);
  assert.match(INTERNAL_VIEWER, /^class:/, "a machine credential's viewer");
  /* negative controls: the founder and a member outside the project are fenced from that manifest (bias R13, membership
     R43), so a finding read as either would have recorded no lens */
  for (const v of ["admin", "member:admin", "member:sam"]) {
    const m = w.bias.biasManifest({ scope: "project", scopeId: w.P, viewer: v, limit: 1 });
    assert.notEqual(m.in_force, true, v);
    assert.notEqual(m.statements_sha, row.lens_sha, v);
  }
  /* and the project's own participant still reads it */
  assert.equal(w.bias.biasManifest({ scope: "project", scopeId: w.P, viewer: "member:ruth", limit: 1 }).statements_sha, row.lens_sha);
});
