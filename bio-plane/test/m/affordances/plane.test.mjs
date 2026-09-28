/* affordances in the running plane (Miniflare, the Durable Object the product runs in). `affordanceFacts` (R13–R16,
   R23) is still answered by the store (`op=affordancefacts`, in-process) and the `op=affordances` composition (R17) by
   the control plane; both are measured here at those interfaces, as they stand (K208 Q1). What the acting modules
   answer when an act is performed is driven here too: the rung backing (R19), the machine map (R20), the agreement
   between an offer and its act (R18's roster half), and that asking writes nothing (R22). */
import { test, after, before } from "node:test";
import assert from "node:assert/strict";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ACTS, CAPTURE_ACTS, PER_ITEM_ACTS, VOCABULARIES, MACHINE_REFUSALS, JUSTIFICATION_REFUSALS, RUNGS,
         RUNG_ABSENT, deriveActs, decorate, PER_ITEM_MAX } from "../../../src/affordances.mjs";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "src");
const ADM = "adm-aff", MEM = "mem-aff";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: join(SRC, "index.mjs"),
  script: readFileSync(join(SRC, "index.mjs"), "utf8"), modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "aff-plane", ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000" },
});
after(() => mf.dispose());

const sha = (v) => createHash("sha256").update(v).digest("hex");
const unwrap = (r) => (r && typeof r === "object" && "result" in r ? r.result : r);
const call = async (q, body) => {
  const r = await mf.dispatchFetch(`http://x/api/?${q}`, body === undefined ? {} : { method: "POST", body: JSON.stringify(body) });
  return { status: r.status, body: await r.json() };
};
const GET = async (q) => unwrap((await call(q)).body);
const POST = async (q, body) => unwrap((await call(q, body ?? {})).body);
const DO = async (path, body) => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  return unwrap(await (await ns.get(ns.idFromName("bio")).fetch(`http://x/${path}`,
    { method: "POST", body: JSON.stringify(body ?? {}) })).json());
};
const E = encodeURIComponent;
const codeOf = (r) => (r && r.ok === true) ? "ok" : (r && typeof r.code === "string") ? r.code : (r && r.reason) || null;
const must = (l, r) => { if (!r || r.ok === false) throw new Error(`${l}: ${JSON.stringify(r).slice(0, 500)}`); return r; };
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const facts = (target, { viewer = "admin", identity, author, by } = {}) =>
  DO(`affordancefacts?target=${E(target)}&viewer=${E(viewer)}`
    + (identity !== undefined ? `&identity=${E(identity)}` : "")
    + (author !== undefined ? `&author=${E(author)}` : "") + (by !== undefined ? `&by=${E(by)}` : ""));
const offered = async (tok, target) => ((await GET(`op=affordances&token=${tok}&target=${E(target)}`))?.acts ?? []).map((a) => a.id);

const W = {};
before(async () => {
  must("claim", await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-aff" }));
  W.FOUNDER = (await POST("op=login", { password: "founder-passphrase-aff" })).token;
  const enrol = async (memberId, role) => {
    const add = await POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role,
      capabilities: ["contribute", "publish", "create_projects"] });
    must(`enroll ${memberId}`, await POST("op=enroll", { invite: add && add.invite, handle: memberId, password: `${memberId}-pass-aff` }));
    const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-pass-aff` });
    if (!lg || !lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
    return lg.token;
  };
  W.RUTH = await enrol("ruth", "admin");   // an administrator holding no position anywhere
  W.IRIS = await enrol("iris", "member");  // owns PA and PC; joined PB
  W.PAM = await enrol("pam", "member");    // owns PB; joined PA; second owner of PC
  W.OLGA = await enrol("olga", "member");  // invited to PA, never joins
  W.ZED = await enrol("zed", "member");    // joined PA, then asked to leave
  W.VERA = await enrol("vera", "member");  // sole owner of PR, deactivated
  W.NELL = await enrol("nell", "member");  // on no roster; sees no hidden project
  let seq = 0;
  const promote = async (id, text, type, state, register = []) => must(`promote ${id ?? type}`, await POST(`op=promote&token=${type === "project" ? ADM : W.RUTH}`, {
    ...(id ? { bundleId: id } : {}), base: null, snapKey: `aff-${++seq}-${sha(text).slice(0, 6)}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register,
    meta: { object_type: type, group: "aff-plane", current_state: state, created: NOW, last_updated: LATER } }));
  const projectMd = (name) => ["---", "object_type: project", `title: "${name}"`, "current_state: forming",
    `created: "${NOW}"`, `last_updated: "${LATER}"`, `objective: "Establish what ${name} is for."`, "references: []",
    "required_strength:", "  capture: B", "  connection: C", "---", "", "## Summary", "", "A project.", "",
    "## Session Log", ""].join("\n");
  for (const p of ["PA", "PB", "PC", "PR"]) W[p] = (await promote(null, projectMd(`Affordances project ${p}`), "project", "forming")).bundleId;
  const own = (p, m) => DO("projectclaimowner", { projectId: W[p], memberId: m });
  const invite = (p, h, by) => DO(`projectinvite?projectId=${W[p]}&handle=${h}&by=${by}&viewer=admin`, {});
  must("iris owns PA", await own("PA", "iris")); must("pam owns PB", await own("PB", "pam"));
  must("iris owns PC", await own("PC", "iris")); must("vera owns PR", await own("PR", "vera"));
  for (const h of ["pam", "olga", "zed"]) must(`invite ${h}`, await invite("PA", h, "iris"));
  must("pam joins PA", await POST(`op=projectjoin&token=${W.PAM}&projectId=${W.PA}`));
  must("zed joins PA", await POST(`op=projectjoin&token=${W.ZED}&projectId=${W.PA}`));
  must("zed asks to leave PA", await POST(`op=projectleave&token=${W.ZED}&projectId=${W.PA}`));
  must("invite iris to PB", await invite("PB", "iris", "pam"));
  must("iris joins PB", await POST(`op=projectjoin&token=${W.IRIS}&projectId=${W.PB}`));
  must("invite pam to PC", await invite("PC", "pam", "iris"));
  must("pam joins PC", await POST(`op=projectjoin&token=${W.PAM}&projectId=${W.PC}`));
  must("pam second owner of PC", await POST(`op=projectowneradd&token=${W.IRIS}&projectId=${W.PC}&handle=pam`));
  must("vera deactivated", await POST(`op=memberset&token=${ADM}`, { memberId: "vera", status: "revoked" }));

  const fm = (id, type, state, extra = []) => ["---", `id: ${id}`, `object_type: ${type}`, `schema: ${type}@1`,
    `title: "${type} ${id}"`, `current_state: ${state}`, "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
    "produced_by:", "  mode: agent", "  capability_tier: high", "group: aff-plane", ...extra];
  const tail = ["state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
    "  source: null", "visuals: []"];
  const sc = (k, v) => v === null ? [`    ${k}: null`] : typeof v === "boolean" ? [`    ${k}: ${v}`] : [`    ${k}: "${String(v)}"`];
  const infoMd = (id) => [...fm(id, "information", "collected", ["references: []"]), ...tail, "---", "", "## Summary", "",
    "A captured document.", "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const inquiryMd = (id, basis, reading) => [...fm(id, "inquiry", "open", ["references:", `  - target: ${basis}`,
    "    rel: cites", "    status: confirmed"]), ...tail, "surfaced_by: agent", 'disposition_reason: ""',
    "basis:", `  - target: ${basis}`, "    role: supports",
    ...(reading ? ["basis_versions:", '  - name: "v1"', ...sc("description", "the ledger reading"),
      ...sc("relationship", "and"), ...sc("state", "suggested"), ...sc("derived_from", null), ...sc("hidden", false),
      ...sc("claim", "The transfer followed the process."), ...sc("author", "iris"), ...sc("at", NOW),
      "basis_version_grounds:", '  - version: "v1"', ...sc("ground", "g1"), ...sc("asserted_by", "iris"), ...sc("at", NOW),
      "basis_version_legs:", '  - version: "v1"', ...sc("target", basis), ...sc("role", "supports"),
      ...sc("ground", "g1"), ...sc("grade", "B"), ...sc("grade_axis", "capture"), ...sc("grade_source", "capture")] : []),
    "---", "", "## Question", "", "Did it?", "", "## What It Rests On", "", "## Conclusion", "",
    "## What Would Falsify This", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const actnMd = (id) => [...fm(id, "action", "planned", ["references: []"]), ...tail, "action_kind: cpra_request",
    "target_body:", "  name: The records office", "---", "", "## Request", "", "Records.", "", "## Session Log", "",
    "## Review Notes", ""].join("\n");
  W.INFO = "INFO-2026-9400-ledger"; W.INFO2 = "INFO-2026-9401-minutes";
  W.INQ = "INQ-2026-9400-transfer"; W.INQ2 = "INQ-2026-9401-follow"; W.ACTN = "ACTN-2026-9400-request";
  const reg = (id) => [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }];
  await promote(W.INFO, infoMd(W.INFO), "information", "collected", reg(W.INFO));
  await promote(W.INFO2, infoMd(W.INFO2), "information", "collected", reg(W.INFO2));
  await promote(W.INQ, inquiryMd(W.INQ, W.INFO, true), "inquiry", "open");
  await promote(W.INQ2, inquiryMd(W.INQ2, W.INQ, false), "inquiry", "open");   // a working inquiry resting on INQ
  await promote(W.ACTN, actnMd(W.ACTN), "action", "planned");
  /* iris's project PA cites both documents; the second citation is then severed. */
  const sel = async (tok, ids) => must("select", await POST(`op=select&token=${tok}&kind=enumerated`, { ids })).handle;
  W.sel = sel;
  must("PA cites INFO", await GET(`op=cite&token=${W.IRIS}&project=${W.PA}&handle=${await sel(W.IRIS, [W.INFO])}&note=basis`));
  must("PA cites INFO2", await GET(`op=cite&token=${W.IRIS}&project=${W.PA}&handle=${await sel(W.IRIS, [W.INFO2])}&note=basis`));
  must("PA severs INFO2", await GET(`op=sever&token=${W.IRIS}&project=${W.PA}&handle=${await sel(W.IRIS, [W.INFO2])}&reason=${E("no longer relied on")}`));
});

/* ============================================================ R13–R16, R23: the facts */
test("R13: no target is NO_TARGET; an absent bundle and one the viewer may not see are both NO_SUCH_BUNDLE, alike", async () => {
  assert.equal((await DO("affordancefacts?viewer=admin")).reason, "NO_TARGET");
  const absent = await facts("PRJ-2026-9999-nowhere", { viewer: "member:nell" });
  const hidden = await facts(W.PA, { viewer: "member:nell" });
  assert.equal(absent.reason, "NO_SUCH_BUNDLE"); assert.equal(hidden.reason, "NO_SUCH_BUNDLE");
  assert.deepEqual(Object.keys(hidden).sort(), Object.keys(absent).sort());
  assert.deepEqual({ ...hidden, target: null }, { ...absent, target: null });
  const seen = await facts(W.PA, { viewer: "member:iris" });
  assert.equal(seen.ok, true);
});

const FACT_KEYS = ["ok", "target", "object_type", "declared_type", "current_state", "criticality", "case_member",
  "project_owner", "project_target_owner", "project_participant", "roster", "actor_is_machine", "concludes_for_project",
  "concluded_for_project", "edition_warranted_for_project", "basis_legs", "rested_on", "basis_version_states",
  "basis_versions", "cites_in", "cites_out", "cited_by_case"].sort();
test("R14: the answer carries exactly R14's facts, with their sub-keys", async () => {
  for (const id of [W.INFO, W.INQ, W.ACTN, W.PA]) {
    const f = await facts(id, { identity: "member:iris", author: "member:iris", by: "iris" });
    assert.deepEqual(Object.keys(f).sort(), FACT_KEYS, id);
    assert.deepEqual(Object.keys(f.rested_on).sort(), ["frozen", "severed", "working"]);
    assert.deepEqual(Object.keys(f.cites_in).sort(), ["confirmed", "severed"]);
    assert.deepEqual(Object.keys(f.cites_out).sort(), ["confirmed", "severed", "severed_reinstatable"]);
    assert.deepEqual(Object.keys(f.cited_by_case).sort(), ["confirmed", "severed"]);
    assert.equal(f.target, id);
  }
});

test("R14: declared_type, basis_legs and the reading states come from the document's own front matter", async () => {
  const q = await facts(W.INQ);
  assert.deepEqual([q.object_type, q.declared_type, q.current_state, q.basis_legs, q.basis_version_states, q.basis_versions],
    ["inquiry", "inquiry", "open", 1, ["suggested"], 1]);
  const q2 = await facts(W.INQ2);
  assert.deepEqual([q2.basis_legs, q2.basis_version_states, q2.basis_versions], [1, [], 0]);
});

test("R14: the citation facts are the ones the acts refuse on — a live and a severed citation from a project, counted "
   + "on both ends, and a severed edge onto a live target reinstatable", async () => {
  const pa = await facts(W.PA, { identity: "member:iris", by: "iris" });
  assert.deepEqual(pa.cites_out, { confirmed: 1, severed: 1, severed_reinstatable: 1 });
  const i1 = await facts(W.INFO), i2 = await facts(W.INFO2);
  assert.deepEqual([i1.cited_by_case, i2.cited_by_case], [{ confirmed: 1, severed: 0 }, { confirmed: 0, severed: 1 }]);
  /* agreement: sever is offered on INFO and reinstate on INFO2, and each act is accepted there. */
  assert.ok((await offered(W.IRIS, W.INFO)).includes("sever"));
  assert.ok((await offered(W.IRIS, W.INFO2)).includes("reinstate"));
  assert.ok(!(await offered(W.IRIS, W.INFO)).includes("reinstate"));
});

test("R14: what rests on an inquiry is counted through inquiry's live-leg predicate — the working inquiry resting on it", async () => {
  const q = await facts(W.INQ);
  assert.equal(q.rested_on.working, 1);
  assert.equal((await facts(W.INQ2)).rested_on.working, 0);
  /* and divide, which refuses while a working leg rests on the question, is withheld there (R8's condition) */
  assert.ok(!(await offered(W.IRIS, W.INQ)).includes("inquirydivide"));
});

test("R14 R15: machine is asked of `author` through isMachineIdentity, null when no author was sent", async () => {
  assert.equal((await facts(W.INQ, { author: "member:iris" })).actor_is_machine, false);
  assert.equal((await facts(W.INQ, { author: "token:member" })).actor_is_machine, true);
  assert.equal((await facts(W.INQ)).actor_is_machine, null);
});

test("R15: positional facts are asked of who the caller is (identity), not of what it may see (viewer)", async () => {
  /* the administrator's sight, asked as olga (who owns nothing and joined nothing) and as iris (owner of PA) */
  const asOlga = await facts(W.PA, { viewer: "admin", identity: "member:olga" });
  const asIris = await facts(W.PA, { viewer: "admin", identity: "member:iris" });
  assert.deepEqual([asOlga.project_owner, asOlga.project_target_owner, asOlga.project_participant], [false, false, false]);
  assert.deepEqual([asIris.project_owner, asIris.project_target_owner, asIris.project_participant], [true, true, true]);
  /* identity absent: the viewer's own member answers */
  const viewerOnly = await facts(W.PA, { viewer: "member:iris" });
  assert.deepEqual([viewerOnly.project_owner, viewerOnly.project_target_owner], [true, true]);
  /* a caller with no roster position (a class credential) reads null */
  const cls = await facts(W.PA, { viewer: "admin", identity: "class:member" });
  assert.deepEqual([cls.project_owner, cls.project_target_owner, cls.project_participant], [null, null, null]);
});

test("R15: roster is asked of `by`, never of identity", async () => {
  const f = await facts(W.PA, { viewer: "admin", identity: "member:olga", by: "iris" });
  assert.deepEqual([f.roster.owner, f.roster.state], [true, "joined"]);
  const g = await facts(W.PA, { viewer: "admin", identity: "member:iris", by: "olga" });
  assert.deepEqual([g.roster.owner, g.roster.state], [false, "invited"]);
  assert.equal((await facts(W.PA, { viewer: "admin", identity: "member:iris" })).roster, null);
});

test("R15: each positional fact is null on a target of the wrong type", async () => {
  const inq = await facts(W.INQ, { identity: "member:iris", by: "iris" });
  assert.deepEqual([inq.project_target_owner, inq.project_participant, inq.roster], [null, null, null]);
  const pa = await facts(W.PA, { identity: "member:iris", by: "iris" });
  assert.deepEqual([pa.concludes_for_project, pa.concluded_for_project, pa.edition_warranted_for_project], [null, null, null]);
  for (const id of [W.INFO, W.ACTN]) {
    const f = await facts(id, { identity: "member:iris", by: "iris" });
    assert.deepEqual([f.project_target_owner, f.project_participant, f.roster, f.concludes_for_project,
      f.concluded_for_project, f.edition_warranted_for_project], [null, null, null, null, null, null], id);
  }
});

test.todo("R16 R14: facts are counts, never ids — not yet met: `cites_in.confirmed` and `cites_in.severed` carry the ids "
  + "of the bundles citing the target (legacy-store's affordanceFacts passes `#citesInto`'s answer through); "
  + "`deriveActs` already reads a count (REPORT to BOB)");

test("R16: apart from cites_in, no fact names a bundle other than the target", async () => {
  for (const id of [W.INFO, W.INFO2, W.INQ, W.INQ2, W.ACTN, W.PA]) {
    const { cites_in: _, ...rest } = await facts(id, { identity: "member:iris", by: "iris", author: "member:iris" });
    const text = JSON.stringify({ ...rest, target: null });
    for (const other of [W.INFO, W.INFO2, W.INQ, W.INQ2, W.ACTN, W.PA, W.PB, W.PC, W.PR]) assert.ok(!text.includes(other), `${id}: ${other}`);
  }
});

test("R23: the joined-project predicates are asked only for the caller's own member id, over projects the viewer can see", async () => {
  /* PA (iris owns and joined it; hidden) cites INFO, which INQ rests on — PA does not cite INQ, so iris concludes nothing yet */
  const own = await facts(W.INQ, { viewer: "member:iris", identity: "member:iris" });
  const olga = await facts(W.INQ, { viewer: "member:olga", identity: "member:olga" });
  assert.equal(olga.concludes_for_project, false);
  assert.equal(typeof own.concludes_for_project, "boolean");
  /* PA cites INQ: iris, who joined PA, now concludes for a project; olga (invited, never joined) does not;
     and iris's identity asked under nell's sight (who sees no hidden project) concludes nothing */
  must("PA cites INQ", await GET(`op=cite&token=${W.IRIS}&project=${W.PA}&handle=${await W.sel(W.IRIS, [W.INQ])}&note=basis`));
  assert.equal((await facts(W.INQ, { viewer: "member:iris", identity: "member:iris" })).concludes_for_project, true);
  assert.equal((await facts(W.INQ, { viewer: "member:olga", identity: "member:olga" })).concludes_for_project, false);
  assert.equal((await facts(W.INQ, { viewer: "member:nell", identity: "member:iris" })).concludes_for_project, false);
  assert.equal((await facts(W.INQ, { viewer: "admin", identity: "member:olga" })).concludes_for_project, false);
});

/* ============================================================ R17, R21: op=affordances */
test("R17: with no target, the catalogue — each act decorated with appliesTo, the vocabularies, the capture acts and "
   + "the set acts with set_key, item_keys, shared_keys and max_items", async () => {
  const r = await GET(`op=affordances&token=${W.IRIS}`);
  assert.deepEqual(Object.keys(r).sort(), ["capture_acts", "catalog", "detail", "set_acts", "target", "vocabularies"]);
  assert.equal(r.target, null);
  assert.deepEqual(r.catalog.map((a) => a.id), ACTS.map((a) => a.id));
  for (const [i, a] of r.catalog.entries()) {
    const d = decorate(ACTS[i], null);
    assert.deepEqual(a.appliesTo, ACTS[i].types);
    for (const k of ["id", "label", "weight", "rung", "rung_absence", "prompt"]) assert.deepEqual(a[k], d[k], `${a.id}.${k}`);
    assert.ok(["session", "admin-session", "machine"].includes(a.mode));
  }
  assert.deepEqual(r.capture_acts.map((a) => a.id), CAPTURE_ACTS.map((a) => a.id));
  assert.deepEqual(r.set_acts.map((a) => [a.id, a.set_key, a.item_keys, a.shared_keys, a.max_items]),
    PER_ITEM_ACTS.map((a) => [a.id, a.set_key, a.item_keys, a.shared_keys, PER_ITEM_MAX]));
  assert.deepEqual(r.vocabularies, JSON.parse(JSON.stringify(VOCABULARIES)));
});

test("R17: with a target, R13's refusal as given, else the target's type, state, acts (R8–R10 decorated), the "
   + "vocabularies and the capture acts, never filtered by the target", async () => {
  const absent = await call(`op=affordances&token=${W.NELL}&target=PRJ-2026-9999-nowhere`);
  const hidden = await call(`op=affordances&token=${W.NELL}&target=${W.PA}`);
  assert.deepEqual([absent.status, hidden.status], [404, 404]);
  assert.deepEqual([absent.body.reason, hidden.body.reason], ["NO_SUCH_BUNDLE", "NO_SUCH_BUNDLE"]);
  let captureActs = null;
  for (const [tok, who] of [[W.IRIS, "iris"], [W.OLGA, "olga"], [W.PAM, "pam"]])
    for (const id of [W.INFO, W.INFO2, W.INQ, W.INQ2, W.ACTN, W.PA]) {
      const r = await GET(`op=affordances&token=${tok}&target=${E(id)}`);
      if (!r || !r.acts) continue;   // not visible to this caller: R13's answer, above
      assert.deepEqual(Object.keys(r).sort(), ["acts", "capture_acts", "current_state", "object_type", "target", "vocabularies"]);
      const f = await facts(id, { viewer: `member:${who}`, identity: `member:${who}`, author: `member:${who}`, by: who });
      assert.deepEqual([r.target, r.object_type, r.current_state], [f.target, f.object_type, f.current_state]);
      assert.deepEqual(r.acts.map((a) => a.id), deriveActs(f).map((a) => a.id), `${who} on ${id}`);
      for (const a of r.acts) {
        const d = decorate(ACTS.find((x) => x.id === a.id), null);
        assert.deepEqual(Object.keys(a).sort(), Object.keys(d).sort());
        for (const k of ["label", "weight", "rung", "rung_absence", "prompt"]) assert.deepEqual(a[k], d[k]);
      }
      captureActs ??= r.capture_acts;
      assert.deepEqual(r.capture_acts, captureActs);
      assert.deepEqual(r.capture_acts.map((a) => a.id), CAPTURE_ACTS.map((a) => a.id));
    }
});

test("R21: every label, prompt, ground and vocabulary op=affordances hands a surface is this module's own value", async () => {
  const r = await GET(`op=affordances&token=${W.IRIS}`);
  for (const a of [...r.catalog, ...r.capture_acts, ...r.set_acts]) {
    const src = [...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS].find((x) => x.id === a.id);
    assert.equal(a.label, src.label); assert.equal(a.prompt, src.prompt ?? null);
    if (a.rung_absence !== null) assert.ok(Object.hasOwn(r.vocabularies.rung_absence_grounds, a.rung_absence));
  }
  assert.deepEqual(r.vocabularies.rung_absence_grounds, VOCABULARIES.rung_absence_grounds);
  assert.equal(r.vocabularies.rung_correction_path, VOCABULARIES.rung_correction_path);
});

/* ============================================================ R18: the roster agreement */
test("R18: each roster act is offered exactly where its act accepts the caller (the release precedent: refused only "
   + "by a parameter), for every caller and project in the fixture — projectleave apart, which the todo below names", async () => {
  const CALLERS = [["iris", W.IRIS], ["pam", W.PAM], ["olga", W.OLGA], ["zed", W.ZED], ["ruth", W.RUTH],
    ["founder", W.FOUNDER], ["MEM", MEM], ["ADM", ADM]];
  const PROJECTS = ["PA", "PB", "PC", "PR"];
  const NOBODY = "__no_such_handle_aff__";
  const PARAM_ONLY = new Set(["NO_SUCH_HANDLE", "VOTES_SHORT"]);
  const probe = {
    projectinvite: (tok, p) => POST(`op=projectinvite&token=${tok}&projectId=${p}&handle=${NOBODY}`),
    projectremove: (tok, p) => POST(`op=projectremove&token=${tok}&projectId=${p}&handle=${NOBODY}`),
    projectowneradd: (tok, p) => POST(`op=projectowneradd&token=${tok}&projectId=${p}&handle=${NOBODY}`),
    projectownerrescue: (tok, p) => POST(`op=projectownerrescue&token=${tok}&projectId=${p}&handle=${NOBODY}&reason=${E("stranded")}`),
    projectownerremove: (tok, p, who) => POST(`op=projectownerremove&token=${tok}&projectId=${p}&handle=${E(who)}&reason=${E("probe")}`),
  };
  const offer = new Map();
  for (const [, tok] of CALLERS) for (const p of PROJECTS) offer.set(`${tok}|${p}`, await offered(tok, W[p]));
  const bad = [], seen = {};
  for (const act of Object.keys(probe))
    for (const [who, tok] of CALLERS) for (const p of PROJECTS) {
      const reason = codeOf(await probe[act](tok, W[p], who));
      const accepted = PARAM_ONLY.has(reason);
      const off = offer.get(`${tok}|${p}`).includes(act);
      (seen[act] ??= new Set()).add(off);
      if (off !== accepted) bad.push(`${act} ${who}@${p}: offered ${off}, ${reason}`);
    }
  assert.deepEqual(bad, []);
  assert.deepEqual(Object.keys(seen).filter((a) => seen[a].size !== 2), [], "each act offered somewhere and withheld somewhere");
});

test.todo("R18: projectleave is offered to an owner only while another owner is committed (not leaving), when membership "
  + "R35 accepts it — not yet met (N45): the offer reads `roster.owner_floor_clear`, which legacy-store's affordanceFacts "
  + "computes from every owner, leaving ones included (REPORT to BOB)");

/* ============================================================ R19: the rung backing */
test("R19: every `reasoned` op this fixture can reach, called well-formed but without its authored reason, is refused "
   + "with a code in JUSTIFICATION_REFUSALS", async () => {
  const INQ = W.INQ, ACTN = W.ACTN;
  const DRIVE = {
    release: async () => GET(`op=release&token=${W.IRIS}&handle=${await W.sel(W.IRIS, [W.INFO])}&mitigation=m`),
    dispose: async () => GET(`op=dispose&token=${W.IRIS}&handle=${await W.sel(W.IRIS, [INQ])}&to=deferred`),
    sever: async () => GET(`op=sever&token=${W.IRIS}&project=${W.PA}&handle=${await W.sel(W.IRIS, [W.INFO])}`),
    reinstate: async () => GET(`op=reinstate&token=${W.IRIS}&project=${W.PA}&handle=${await W.sel(W.IRIS, [W.INFO2])}`),
    conclude: () => GET(`op=conclude&token=${W.IRIS}&target=${E(INQ)}&falsifier=f`),
    reopen: () => GET(`op=reopen&token=${W.IRIS}&target=${E(INQ)}`),
    inquirydivide: () => POST(`op=inquirydivide&token=${W.IRIS}&target=${E(W.INQ2)}`,
      { children: [{ title: "a", legs: [W.INQ] }, { title: "b", legs: [W.INQ] }] }),
    /* a RESTRUCTURE: the first grouping is made (accepted without a reason: the todo below), then replaced */
    inquiryground: async () => {
      must("first grouping", await POST(`op=inquiryground&token=${W.IRIS}&target=${E(INQ)}`, { grounds: [{ ground: "g1", legs: [0] }] }));
      return POST(`op=inquiryground&token=${W.IRIS}&target=${E(INQ)}`, { grounds: [{ ground: "g2", legs: [0] }] });
    },
    actionmove: () => GET(`op=actionmove&token=${W.IRIS}&target=${E(ACTN)}&to=active`),
    versionreject: () => GET(`op=versionreject&token=${W.IRIS}&target=${E(INQ)}&version=v1`),
    versionconsider: () => GET(`op=versionconsider&token=${W.IRIS}&target=${E(INQ)}&version=v1`),
    withdrawconclusion: () => GET(`op=withdrawconclusion&token=${W.IRIS}&target=${E(INQ)}&project=${W.PA}`),
    projectownerremove: () => POST(`op=projectownerremove&token=${W.IRIS}&projectId=${W.PC}&handle=pam`),
    projectownerrescue: () => POST(`op=projectownerrescue&token=${W.RUTH}&projectId=${W.PR}&handle=ruth`),
    adminremove: () => POST(`op=adminremove&token=${W.FOUNDER}`, { memberId: "ruth" }),
    connectionassert: () => POST(`op=connectionassert&token=${W.IRIS}`, { a: W.INFO, b: W.INFO2 }),
    filemembershipjudge: () => POST(`op=filemembershipjudge&token=${W.IRIS}`, { id: 1, verdict: "confirm" }),
  };
  const got = {};
  for (const [op, f] of Object.entries(DRIVE)) got[op] = codeOf(await f());
  const off = Object.entries(got).filter(([, c]) => !JUSTIFICATION_REFUSALS.includes(c));
  assert.deepEqual(off, []);
  assert.deepEqual(Object.keys(DRIVE).filter((op) => RUNGS[op] !== "reasoned" && op !== "release"), []);
});

test("R19: the reasoned registry, progression and theme acts, and intent's three (through the store's dispatch, "
   + "which routes intent's ops until the control plane admits them), refuse without the authored account", async () => {
  const theme = await POST(`op=themedeclare&token=${W.IRIS}`, { name: "Transfers", test: "the document concerns a transfer" });
  must("themedeclare", theme);
  const themeId = theme.theme?.id ?? theme.theme_id ?? theme.id ?? theme.theme;
  must("themeplace", await POST(`op=themeplace&token=${W.IRIS}`, { theme: themeId, target: W.INFO, note: "it concerns one" }));
  const iris = "member:iris";
  const goal = must("goaldeclare", await DO(`goaldeclare?viewer=${E(iris)}`, { statement: "A goal", bounds: "This year", author: iris }));
  const asp = must("aspirationdeclare", await DO(`aspirationdeclare?viewer=admin`,
    { scope: "group", statement: "An aspiration of the group", author: "member:ruth" }));
  const goalId = goal.goal ?? goal.id, aspId = asp.aspiration ?? asp.id;
  const DRIVE = {
    relationdeclare: () => POST(`op=relationdeclare&token=${W.IRIS}`, { fromEntity: "ENT-a", toEntity: "ENT-b", relation: "proxy_for", citation: "c" }),
    aliaswithdraw: () => POST(`op=aliaswithdraw&token=${W.IRIS}`, { entityId: "ENT-a", alias: "A" }),
    relationwithdraw: () => POST(`op=relationwithdraw&token=${W.IRIS}`, { relationId: "REL-1" }),
    discharge: () => POST(`op=discharge&token=${W.IRIS}`, { progressionKey: "p", entityId: "ENT-a", stageKey: "s", captureSha: sha("x"), citation: "c" }),
    proposedispose: () => POST(`op=proposedispose&token=${W.IRIS}`, { progressionKey: "p", stageKey: "s", to: "deferred" }),
    themewithdraw: () => POST(`op=themewithdraw&token=${W.IRIS}`, { theme: themeId, target: W.INFO }),
    goalclose: () => DO(`goalclose?viewer=${E(iris)}`, { goal: goalId, author: iris }),
    aspirationdepart: () => DO(`aspirationdepart?viewer=${E(iris)}`, { project: W.PA, aspiration: aspId, author: iris }),
    aspirationretire: () => DO(`aspirationretire?viewer=admin`, { aspiration: aspId, author: "member:ruth" }),
    biasdebtresolve: () => POST(`op=biasdebtresolve&token=${W.IRIS}`, { run: "RUN-aff-1" }),
    actionrisktier: () => POST(`op=actionrisktier&token=${W.IRIS}&target=${E(W.ACTN)}`, { tier: 2 }),
  };
  const got = {};
  for (const [op, f] of Object.entries(DRIVE)) got[op] = codeOf(await f());
  assert.deepEqual(Object.entries(got).filter(([, c]) => !JUSTIFICATION_REFUSALS.includes(c)), []);
});

test("R19: together the two drives reach every op RUNGS grades `reasoned`", () => {
  const driven = ["release", "dispose", "sever", "reinstate", "conclude", "reopen", "inquirydivide", "inquiryground",
    "actionmove", "versionreject", "versionconsider", "withdrawconclusion", "projectownerremove", "projectownerrescue",
    "adminremove", "connectionassert", "filemembershipjudge", "relationdeclare", "aliaswithdraw", "relationwithdraw",
    "discharge", "proposedispose", "themewithdraw", "goalclose", "aspirationdepart", "aspirationretire",
    "biasdebtresolve", "actionrisktier", "narrow" /* narrow: backing.test.mjs */];
  assert.deepEqual(Object.keys(RUNGS).filter((op) => RUNGS[op] === "reasoned" && !driven.includes(op)), []);
});

test("R19 R2: inquiryground is `reasoned` where it revises what stands — a FIRST grouping replaces nothing and asks no "
   + "reason; a restructure without one is refused with a code in JUSTIFICATION_REFUSALS (K212)", async () => {
  const q = W.INQ2;
  const first = await POST(`op=inquiryground&token=${W.IRIS}&target=${E(q)}`, { grounds: [{ ground: "g1", legs: [0] }] });
  assert.equal(codeOf(first), "ok");
  const again = await POST(`op=inquiryground&token=${W.IRIS}&target=${E(q)}`, { grounds: [{ ground: "g2", legs: [0] }] });
  assert.ok(JUSTIFICATION_REFUSALS.includes(codeOf(again)), codeOf(again));
  const withWhy = await POST(`op=inquiryground&token=${W.IRIS}&target=${E(q)}`,
    { grounds: [{ ground: "g2", legs: [0] }], reason: "the second group says it better" });
  assert.equal(codeOf(withWhy), "ok");
  assert.equal(RUNGS.inquiryground, "reasoned");
});

/* ============================================================ R20: the machine map */
test("R20: MACHINE_REFUSALS equals, both ways, the acts whose method answers a machine credential with a MACHINE_* "
   + "code, and each code is that answer; a machine is offered none of them", async () => {
  const sel = (ids) => W.sel(MEM, ids);
  const INQ = W.INQ, INFO = W.INFO, ACTN = W.ACTN, PA = W.PA;
  const DRIVE = {
    release: async () => GET(`op=release&token=${MEM}&handle=${await sel([INFO])}&acknowledgment=a&mitigation=m`),
    retire: async () => GET(`op=retire&token=${MEM}&handle=${await sel([W.INFO2])}&reason=r`),
    dispose: async () => GET(`op=dispose&token=${MEM}&handle=${await sel([W.INQ2])}&to=deferred&reason=r`),
    conclude: () => GET(`op=conclude&token=${MEM}&target=${E(INQ)}&conclusion=c&falsifier=f`),
    withdrawconclusion: () => GET(`op=withdrawconclusion&token=${MEM}&target=${E(INQ)}&project=${PA}&reason=r`),
    reopen: () => GET(`op=reopen&token=${MEM}&target=${E(INQ)}&reason=r`),
    publish: () => POST(`op=publish&token=${MEM}`, { target: INQ, project: PA, roles: { [INQ]: "load_bearing" } }),
    inquirydivide: () => POST(`op=inquirydivide&token=${MEM}&target=${E(INQ)}&reason=r`, { children: [] }),
    inquiryground: () => POST(`op=inquiryground&token=${MEM}&target=${E(INQ)}&reason=r`, { grounds: [] }),
    actionmove: () => GET(`op=actionmove&token=${MEM}&target=${E(ACTN)}&to=active&reason=r`),
    actioncorrespond: () => GET(`op=actioncorrespond&token=${MEM}&target=${E(ACTN)}&direction=sent&at=2026-07-01&account=x`),
    actionlaws: () => POST(`op=actionlaws&token=${MEM}&target=${E(ACTN)}`, { laws: [{ level: "state", citation: "a statute" }] }),
    actionrisktier: () => POST(`op=actionrisktier&token=${MEM}&target=${E(ACTN)}`, { tier: 3, reason: "a machine's view" }),
    versionaccept: () => GET(`op=versionaccept&token=${MEM}&target=${E(INQ)}&version=v1&reason=r`),
    versionreject: () => GET(`op=versionreject&token=${MEM}&target=${E(INQ)}&version=v1&reason=r`),
    versionconsider: () => GET(`op=versionconsider&token=${MEM}&target=${E(INQ)}&version=v1&reason=r`),
    versionrevert: () => GET(`op=versionrevert&token=${MEM}&target=${E(INQ)}&version=v1&reason=r`),
    versioncurrent: () => GET(`op=versioncurrent&token=${MEM}&target=${E(INQ)}&version=v1&project=${PA}&reason=r`),
    versionhide: () => GET(`op=versionhide&token=${MEM}&target=${E(INQ)}&version=v1&reason=r`),
    cite: async () => GET(`op=cite&token=${MEM}&project=${PA}&handle=${await sel([INFO])}&note=basis`),
    sever: async () => GET(`op=sever&token=${MEM}&project=${PA}&handle=${await sel([INFO])}&reason=r`),
    reinstate: async () => GET(`op=reinstate&token=${MEM}&project=${PA}&handle=${await sel([INFO])}&reason=r`),
    projectvisibilityset: () => POST(`op=projectvisibilityset&token=${MEM}&projectId=${PA}&setting=discoverable`),
  };
  const ROSTER = ["projectinvite", "projectjoin", "projectleave", "projectremove", "projectowneradd",
    "projectownerremove", "projectownerrescue"];
  const objectActs = ACTS.map((a) => a.id).filter((k) => !ROSTER.includes(k));
  assert.deepEqual(objectActs.filter((k) => !(k in DRIVE)), [], "every object-directed act is driven");
  /* the offer side first, before any drive moves an object */
  const leak = [];
  for (const tok of [MEM, ADM]) for (const id of [INFO, INQ, ACTN, PA])
    for (const k of await offered(tok, id)) if (k in MACHINE_REFUSALS || ROSTER.includes(k)) leak.push(`${id}:${k}`);
  assert.deepEqual(leak, []);
  const answered = {};
  for (const k of objectActs) answered[k] = codeOf(await DRIVE[k]());
  const refused = Object.fromEntries(Object.entries(answered).filter(([, c]) => /^MACHINE_/.test(String(c))));
  assert.deepEqual(refused, Object.fromEntries(objectActs.filter((k) => k in MACHINE_REFUSALS).map((k) => [k, MACHINE_REFUSALS[k]])));
  assert.ok(Object.keys(refused).length > 0 && objectActs.some((k) => !(k in refused)));
});

/* ============================================================ R22: nothing here writes */
test("R22: asking for facts and affordances writes nothing — the store's counts are unchanged by a hundred asks", async () => {
  const stats = async () => JSON.stringify(await DO("stats?viewer=admin"));
  const before = await stats();
  for (let i = 0; i < 10; i++)
    for (const id of [W.INFO, W.INQ, W.ACTN, W.PA, "PRJ-2026-9999-nowhere"]) {
      await facts(id, { identity: "member:iris", author: "member:iris", by: "iris" });
      await GET(`op=affordances&token=${W.IRIS}&target=${E(id)}`);
    }
  assert.equal(await stats(), before);
});

test("R24: no act in any answer carries a null rung without a stated absence", async () => {
  const r = await GET(`op=affordances&token=${W.IRIS}`);
  const all = [...r.catalog, ...r.capture_acts, ...r.set_acts];
  for (const id of [W.INFO, W.INQ, W.ACTN, W.PA]) all.push(...(await GET(`op=affordances&token=${W.IRIS}&target=${E(id)}`)).acts);
  assert.deepEqual(all.filter((a) => a.rung === null && a.rung_absence === null).map((a) => a.id), []);
  assert.ok(all.every((a) => a.rung === null || Object.hasOwn(RUNGS, a.id)));
  assert.ok(all.every((a) => a.rung_absence === null || Object.hasOwn(RUNG_ABSENT, a.id)));
});
