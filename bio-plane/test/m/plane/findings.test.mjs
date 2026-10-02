/* plane R12 (K1061; inquiry R53, bias R40): at start, after `bias` is built with its environment, the composition root
   registers `inquiry`'s findings with it as kind `finding`. Driven on the composition root itself (the Durable Object
   class constructed for real, every module it builds real): a question concluded under its project's lens carries a
   debt when that lens changes (bias R33–R38), swept by the scheduler the plane hands its alarm to (R4) and by bias's own
   sweep; a host whose `finding` kind is not inquiry's raises none (the negative control); and bias keeps the
   environment it was built with (`BIAS_DEBT_DELAY_MS`, `BIAS_DEBT_BATCH`, bias R33, R41). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { store, storage, Store } from "./fixture.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { biasOf, BIAS_DEBT_DELAY_MS, BIAS_DEBT_BATCH } from "../../../src/bias/index.mjs";
import { inquiryFindings } from "../../../src/inquiry/index.mjs";
import { instanceSetupOf } from "../../../src/setup.mjs";

const GROUP = "lens-watch";
const DOC = "INFO-2026-1201-doc", LENS = "BIAS-2026-1201-lens";
const WHY = "We adopt this lens because the office is a party to matters this group examines.";
const TEXT0 = "Claims from this office need a second, independent record before they bear load.";
const TEXT1 = "Claims from this office need two independent records before they bear load.";

const head = ["---", `created: "2026-09-27T00:00:00Z"`, `last_updated: "2026-09-27T00:00:00Z"`];
const projMd = (title) => [...head, "object_type: project", "schema: project@1", `title: "${title}"`,
  "current_state: forming", "prior_state: null", `objective: "Find out what happened."`, "references: []", "state_history: []",
  "---", "", "## Objective", "",
  "Find out.", ""].join("\n");
const infoMd = (id) => [...head, `id: ${id}`, "object_type: information", "schema: information@1", `title: "Document ${id}"`,
  "current_state: collected", "prior_state: null", "references: []", "state_history: []", "criticality: supporting", "---",
  "", "## Summary", "", "A document.", ""].join("\n");
const lensMd = (state, prior, text) => [...head, `id: ${LENS}`, "object_type: bias", `title: "Project lens"`,
  `current_state: ${state}`, `prior_state: ${prior}`, `group: ${GROUP}`, "statements:", `  - id: "s1"`,
  `    kind: "scrutiny"`, `    subject: "ENT-2026-0007"`, `    text: ${JSON.stringify(text)}`,
  `    justification: "The office is a party to matters this group examines."`, "    citations: []", "    locked: false",
  "---", "", "## Statements", "", "The lens.", "", "## Adoption", "", "Adopted.", "", "## What This Does Not Enforce", "",
  "It does not check whether a second source was independent of the first.", "", "## Session Log", "", "## Review Notes",
  ""].join("\n");
/** A question citing DOC and stating project `P`, open or concluded. */
const inquiryMd = (id, P, concluded) => [...head, `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Was the transfer made (${id})?"`, `current_state: ${concluded ? "concluded" : "open"}`,
  `prior_state: ${concluded ? "open" : "null"}`, `group: ${GROUP}`, "references:", `  - target: ${DOC}`, "    rel: cites",
  "    status: confirmed", "state_history: []", "surfaced_by: human", `disposition_reason: ""`, "basis:",
  `  - target: ${DOC}`, "    role: supports", `project: ${P}`,
  ...(concluded ? ['conclusion: "the transfer was made"', 'falsifier: "a ledger showing no transfer"'] : []),
  "---", "", "## Question", "", "Was the transfer made?", "", "## What It Rests On", "", "## Conclusion", "",
  "## What Would Falsify This", "", "## Session Log", "", "## Review Notes", ""].join("\n");

/** The world on one composed object `x`: the group, member ruth, her project, one document, and helpers to promote the
 *  lens, adopt it for the project, read the lens in force and conclude a question under it. */
function world(x) {
  const promotion = promotionOf(x.ctx), bias = biasOf(x.ctx);
  let n = 0;
  const promote = (bundleId, text, object_type, author = "member:ruth", extra = {}) => {
    const h = recordOf(x.ctx).head(bundleId);
    const r = promotion.promote({ bundleId, base: h ? h.bundleSha : null, snapKey: `k${++n}`, author,
      files: [{ path: "bundle.md", text }], meta: { object_type }, ...extra });
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 600));
    return r;
  };
  assert.equal(instanceSetupOf(x.ctx).instanceGroupSeed({ slug: GROUP, author: "admin" }).ok, true);
  x.ctx.storage.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                          VALUES ('ruth', 'Cover ruth', 'h_ruth', 'member', 'active', '["contribute"]', 't', 't')`);
  const made = promotion.promote({ base: null, snapKey: `k${++n}`, author: "member:ruth", ownerMemberId: "ruth",
    files: [{ path: "bundle.md", text: projMd("Sewer fund") }], meta: { object_type: "project" } });
  assert.equal(made.ok, true, JSON.stringify(made).slice(0, 600));
  const P = made.bundleId;
  promote(DOC, infoMd(DOC), "information");
  const lensAt = (state, prior, text = TEXT0) => promote(LENS, lensMd(state, prior, text), "bias");
  return {
    P, bias,
    adopt() {
      lensAt("draft", "null"); lensAt("proposed", "draft"); lensAt("adopted", "proposed");
      const a = bias.biasAdopt({ reason: WHY, bundleId: LENS, scope: "project", scopeId: P, author: "ruth",
                                 identity: "member:ruth", viewer: "member:ruth" });
      assert.equal(a.ok, true, JSON.stringify(a).slice(0, 400));
    },
    changeLens: () => lensAt("adopted", "proposed", TEXT1),
    lensNow: () => bias.biasManifest({ scope: "project", scopeId: P, viewer: "admin", limit: 1 }).statements_sha,
    conclude(id) { promote(id, inquiryMd(id, P, false), "inquiry"); promote(id, inquiryMd(id, P, true), "inquiry"); },
    debt: (run) => [...x.ctx.storage.sql.exec(`SELECT * FROM bias_debts WHERE run = ?`, run)][0] ?? null,
  };
}

test("R12: on the composition root, a question concluded under its project's lens carries a debt when the lens changes, raised by the alarm the plane hands the scheduler (bias R33–R38)", async () => {
  const x = await store();
  const w = world(x);
  w.adopt();
  const then = w.lensNow();
  assert.match(then, /^[0-9a-f]{64}$/);
  const Q = "INQ-2026-1201-lens";
  w.conclude(Q);
  /* bias holds inquiry's findings as kind `finding`: the question's finding is offered, with the lens it was made under */
  const src = inquiryFindings(x.ctx);
  assert.deepEqual(src.list("", 50), [`finding:${Q}`]);
  assert.deepEqual((await src.read(`finding:${Q}`)).lens, { basis: "at_open", statements_sha: then });
  assert.equal(w.bias.registerWorkProducts("finding", src).reason, "WORK_PRODUCTS_DECLARED", "the plane registered the kind");
  /* the lens unchanged: no debt */
  assert.equal(w.debt(`finding:${Q}`), null);
  /* the project's lens changes: the plane's alarm reaches the scheduler, whose bias-debt tick raises the finding's debt */
  w.changeLens();
  const now = w.lensNow();
  assert.notEqual(now, then);
  assert.equal(w.bias.biasDebtDue(1), 1, "the sweep is pending");
  const at = Date.now();
  const r = await x.s.onAlarm(at);
  assert.ok(JSON.stringify(r).includes(`finding:${Q}`), JSON.stringify(r).slice(0, 800));
  const d = w.debt(`finding:${Q}`);
  assert.ok(d, "the debt is raised");
  assert.deepEqual([d.context_type, d.context_id, d.moved_basis, d.lens_then, d.lens_now, JSON.parse(d.recipients), d.cleared_at],
                   ["project", w.P, "at_open", then, now, ["ruth"], null]);
  /* disclosed through the door: the debt reads back to the member who concluded it */
  const shown = await x.call(`/biasdebt?run=${encodeURIComponent(`finding:${Q}`)}&viewer=member:ruth`);
  assert.deepEqual([shown.found, shown.open], [true, true], JSON.stringify(shown).slice(0, 400));
});

test("R12 negative control: on a composed host whose `finding` kind is not inquiry's, the same lens change raises no debt on the finding", async () => {
  const st = storage();
  const env = { STORE: { idFromName: (n) => n } };
  /* the kind is taken before the plane registers it: the plane's registration is refused, so inquiry's findings are
     not bias's work products on this host */
  const empty = { list: () => [], read: async () => null, visible: async () => false };
  assert.equal(biasOf(st.ctx, { env }).registerWorkProducts("finding", empty).ok, true);
  new Store(st.ctx, env);
  for (const p of st.blocked) await p;
  const w = world({ ctx: st.ctx });
  w.adopt();
  const Q = "INQ-2026-1202-unregistered";
  w.conclude(Q);
  w.changeLens();
  const s = await w.bias.biasDebtSweep(Date.now());
  assert.equal(JSON.stringify(s).includes(Q), false, JSON.stringify(s).slice(0, 400));
  assert.equal(w.debt(`finding:${Q}`), null, "no registration, no debt");
});

test("R12: the registration does not create bias first: bias keeps its environment's BIAS_DEBT_DELAY_MS and BIAS_DEBT_BATCH, and with none set, its defaults", async () => {
  for (const [env, delay, batch] of [[{ BIAS_DEBT_DELAY_MS: "7000", BIAS_DEBT_BATCH: "3" }, 7000, 3],
                                     [{}, BIAS_DEBT_DELAY_MS, BIAS_DEBT_BATCH]]) {
    const x = await store({ env });
    const w = world(x);
    w.adopt();
    w.conclude("INQ-2026-1203-env");
    w.changeLens();
    assert.equal(w.bias.biasDebtWake(1000), 1000 + delay, `the delay is ${delay}`);
    const s = await w.bias.biasDebtSweep(Date.now());
    assert.equal(s.batch, batch, `the batch is ${batch}`);
    assert.deepEqual(s.raised, ["finding:INQ-2026-1203-env"]);
  }
});
