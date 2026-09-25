/* NEGATIVE CONTROL: DECLARED AND RUN BY `test/d563-promoted-title-state.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS COPIES OF THE SOURCES while it runs. Re-run from `bio-plane/`: `node test/d563-promoted-title-state.control.mjs [arm]`. Each anchor asserted to occur EXACTLY ONCE; the real sources hashed before and after. RESULTS, RUN 2026-09-25 by D-563's worker on origin/main 5e8a65a8 + D-563 (real `src/store.mjs` 3,480,632 B sha256 957d3a7e..., `src/index.mjs` 887,726 B sha256 18ff08d6..., `checks/bio-checks.mjs` 1,007,817 B sha256 559f5446..., UNCHANGED before and after): 10/10 AS DECLARED, exit 0. (a) baseline -> 26/0 · (b) name-envelope — THE ROW'S OWN ARM, 7.1's scan reads `meta.title` again -> 21/5, failing BY NAME at section 1's MISLABELLED and UNLABELLED NAME_TAKEN · (c) name-envelope-unnetted — (b) with C-86.3 also disarmed -> 17/9: the taken name LANDS ("…and no second project landed" red) · (d) owner-envelope, 7.11 reads `meta.current_state`/`meta.closed_reason` -> 22/4 at section 3's MISLABELLED/UNLABELLED NOT_THE_OWNER and "still stands" · (e) retire-envelope, REC-181 reads `meta.current_state` -> 23/3 at section 4's MISLABELLED/UNLABELLED CITED · (f) projection-envelope, the row written from `meta` -> 21/5 at every "the projection shows the document's" assertion · (g) no-refusal, C-86.3 and C-86.4 disarmed -> 17/9 at every ENVELOPE_*_DISAGREES arm · (h) exact-compare — OVER-STRICTNESS, a respacing treated as a contradiction -> 25/1 at the respacing arm · (i) no-question-title — OVER-STRICTNESS, an inquiry's question title not accepted -> 25/1 at that arm · (j) spelling — the derivation written another way -> 26/0. RECORDED, NOT SMOOTHED: arm (b) was first declared from the row ("the taken-title arm LANDS") and came back NOT AS DECLARED — the taken name under a free label is refused by name, but by C-86.3, the net this item puts behind the fences; the landing is arm (c). A first run of (b) also reddened section 3 through NO_TITLE (its envelopes named no title), a second variable; section 3 now labels the title truly and varies the state alone. BASELINE ON THE UNFIXED SOURCES (HEAD 5e8a65a8 via D563_SRC): 6 pass / 20 fail — the mislabelled taken-title project, retirement and deactivation all LANDED. */
/* D-563 — `op=promote` TAKES A BUNDLE'S TITLE AND STATE FROM THE DOCUMENT, NOT THE ENVELOPE.
 * `docs/architecture/BIO_Case_Making_v0_1.md` §2, with C-2.5 and D-510's derivation: the document states what it is,
 * and the envelope is a label. D-510/D-526 derived the TYPE from the bytes; this item extends that to the TITLE and the
 * STATE (`current_state`, `prior_state`, and `closed_reason`, which 7.11 reads beside the state).
 *
 * THE DEFECT, measured by D-526's worker and re-driven here on the unfixed tree (see the control's baseline): the
 * projection wrote `bundles.title` / `current_state` / `prior_state` from `meta`, and 7.1's name scan, 7.11's owner
 * test and REC-181's retirement arm asked `meta.title` / `meta.current_state` / `meta.closed_reason`. So a second
 * project whose bytes name a TAKEN title LANDED when `meta.title` named another, and the projection showed the
 * envelope's title over the bytes'.
 *
 * THE SHAPE OF EVERY FENCE ARM: one document, three envelopes — LABELLED (the envelope says what the bytes say),
 * MISLABELLED (the envelope says something else) and UNLABELLED (the envelope says nothing) — and each must meet THE
 * SAME fence. A MISLABELLED promotion that no fence speaks to is refused by name: ENVELOPE_TITLE_DISAGREES (C-86.3) or
 * ENVELOPE_STATE_DISAGREES (C-86.4), after every fence, before the first write.
 *
 * WHAT THIS SUITE CANNOT SEE: the bias state edge (`bias-state-edge`) now reads the derived state too, and so does the
 * adoption re-pin; driving either needs an ADOPTED bias set, which only op=biasadopt makes, and neither is driven
 * here — both are a one-token change beside the lines this suite drives, named in the report as D-546's shared sites.
 * A REPLAY's exemption from the refusal (not from the derivation) needs a verified replay creation (REC-173) and is
 * not driven. `created` and `last_updated` are NOT derived by this item: the documents state them (CORE_FIELDS), and
 * the projection still records the envelope's, which the report states. CORRECTED 2026-09-25 by D-615: that last clause
 * was true when written and is no longer — D-615 derives both dates from the document (C-86.7), and this suite's labels
 * already name its documents' dates, so nothing here moved.
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";

/* The control driver points this at an armed copy of the sources. */
const SRC_DIR = process.env.D563_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const ADM = "adm-d563", MTOK = "mem-d563";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const NL = "\n", NOW = "2026-07-24T00:00:00Z", LATER = "2026-07-25T00:00:00Z";
const E = encodeURIComponent;

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "believe-in-oakland", ADMIN_TOKEN: ADM, MEMBER_TOKEN: MTOK, VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const DO = async (path, body) => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  return rP(await (await ns.get(ns.idFromName("bio")).fetch(`http://x/${path}`,
    { method: "POST", body: JSON.stringify(body) })).json());
};
const must = (label, r) => { if (!r || r.ok === false) throw new Error(`${label}: ${JSON.stringify(r).slice(0, 600)}`); return r; };
const reasonOf = (r) => r?.ok === true ? "LANDED" : (r?.reason ?? JSON.stringify(r).slice(0, 160));

/* A project document; `extra` lines go into the front matter (a closed_reason, say). No id line on a creation: the
   plane mints it (REC-141). */
const projectMd = (title, { id = null, state = "forming", extra = [] } = {}) => ["---",
  ...(id ? [`id: ${id}`] : []), "object_type: project", `title: "${title}"`, `current_state: ${state}`,
  `created: "${NOW}"`, `last_updated: "${LATER}"`, "references: []", ...extra, "---", "",
  "## Thesis Summary", "", "A project.", "", "## Open Questions", "", "## Ruled Out", "",
  "## Session Log", "", "## Review Notes", ""].join(NL);
const infoMd = (id, title, { state = "collected", prior = null, history = [] } = {}) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "${title}"`, `current_state: ${state}`, `prior_state: ${prior === null ? "null" : prior}`,
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []",
  ...(history.length
    ? ["state_history:", ...history.flatMap((h) => [`  - timestamp: "${LATER}"`,
        `    from_state: ${h.from}`, `    to_state: ${h.to}`,
        `    blurb: "moved for the D-563 fixture"`, "    author: ruth"])]
    : ["state_history: []"]),
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "source_status: unchanged",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join(NL);
const inquiryMd = (id, title, question) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${title}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
  "---", "", "## Question", "", question, "", "## Session Log", ""].join(NL);

let seq = 0;
/* `env` is the envelope's title/state fields, spread over the type and dates; a key absent says nothing. */
const promote = async (tok, { id = null, base = null, text, type, env = {}, register = [] }) =>
  POST(`op=promote&token=${tok}`, {
    ...(id ? { bundleId: id } : {}), base, snapKey: `20260724T05${String(++seq).padStart(4, "0")}Z_d563`, author: "x",
    meta: { object_type: type, created: NOW, last_updated: LATER, ...env },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register });
const listed = async (id) => ((await GET(`op=list&token=${ADM}&limit=1000`)) || {}).bundles?.find((b) => b.bundle_id === id) ?? null;
const projectCount = async () => ((await GET(`op=list&token=${ADM}&limit=1000`)) || {}).bundles
  ?.filter((b) => b.object_type === "project").length ?? -1;
const proj = async (id) => GET(`op=projection&token=${ADM}&id=${E(id)}`);

try {

must("claim", await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-563" }));
const enrol = async (memberId, role) => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role,
    capabilities: ["contribute", "publish", "create_projects"] });
  must(`enroll ${memberId}`, await POST("op=enroll", { invite: add && add.invite, handle: memberId, password: `${memberId}-pass-563` }));
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-pass-563` });
  if (!lg || !lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* The founder counts as the first administrator, so the second enrolment must be one too (ADMINS_FIRST). */
const RUTH = await enrol("ruth", "admin");

/* ======================================================== 1. 7.1's name scan reads the DOCUMENT's title */
console.log("\n--- 1. a second project whose bytes name a TAKEN title meets NAME_TAKEN, whatever meta.title says ---");
{
  must("fixture project Sewer Fund", await promote(RUTH, { text: projectMd("Sewer Fund"), type: "project",
    env: { title: "Sewer Fund", current_state: "forming" } }));
  const before = await projectCount();
  for (const [label, env] of [["LABELLED", { title: "sewer  FUND" }], ["MISLABELLED", { title: "Harbor Lease" }],
                              ["UNLABELLED", {}]]) {
    const r = await promote(RUTH, { text: projectMd("sewer  FUND"), type: "project", env: { ...env, current_state: "forming" } });
    t(`${label}: refused NAME_TAKEN`, reasonOf(r), "NAME_TAKEN");
  }
  t("…and no second project landed under any label", await projectCount(), before);
}

/* ======================================================== 2. the projection writes the DOCUMENT's title */
console.log("\n--- 2. the projection shows the document's title; a label contradicting it is refused by name ---");
{
  const u = await promote(RUTH, { text: projectMd("Harbor Lease"), type: "project", env: { current_state: "forming" } });
  t("UNLABELLED: a project by a free name LANDS, and the projection shows the document's title",
    [reasonOf(u), (await proj(u?.bundleId ?? "none"))?.title], ["LANDED", "Harbor Lease"]);
  /* OVER-STRICTNESS: a respacing of the same title is not a contradiction. */
  const w = await promote(RUTH, { text: projectMd("Quay Lease"), type: "project",
    env: { title: "  Quay   Lease ", current_state: "forming" } });
  t("OVER-STRICTNESS: a label that only RESPACES the title LANDS, and the projection shows the document's spelling",
    [reasonOf(w), (await proj(w?.bundleId ?? "none"))?.title], ["LANDED", "Quay Lease"]);
  const before = await projectCount();
  const m = await promote(RUTH, { text: projectMd("Pier Lease"), type: "project",
    env: { title: "Sewer Fund", current_state: "forming" } });
  t("MISLABELLED (a free name under a TAKEN label): refused ENVELOPE_TITLE_DISAGREES, naming both titles",
    [reasonOf(m), m?.check, m?.document_title, m?.envelope_title],
    ["ENVELOPE_TITLE_DISAGREES", "C-86.3", "Pier Lease", "Sewer Fund"]);
  t("…and nothing landed", await projectCount(), before);

  const I = "INFO-2026-0563-titled";
  const mi = await promote(RUTH, { id: I, text: infoMd(I, "Council minutes"), type: "information",
    env: { title: "Bundle " + I, current_state: "collected" },
    register: [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${I}`), encoding: "binary", bytes: 10 }] });
  t("MISLABELLED information: refused ENVELOPE_TITLE_DISAGREES", reasonOf(mi), "ENVELOPE_TITLE_DISAGREES");
  t("…and nothing landed", await listed(I), null);
  const ui = await promote(RUTH, { id: I, text: infoMd(I, "Council minutes"), type: "information",
    env: { current_state: "collected" },
    register: [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${I}`), encoding: "binary", bytes: 10 }] });
  t("UNLABELLED information LANDS titled by its document", [reasonOf(ui), (await listed(I))?.title],
    ["LANDED", "Council minutes"]);

  /* OVER-STRICTNESS: an inquiry's title is the rendering of its question (C-16); a label naming THAT is no lie. */
  const Q = "INQ-2026-0563-question";
  const qi = await promote(RUTH, { id: Q, text: inquiryMd(Q, "Question " + Q, "Did the fund follow its adopted purpose?"),
    type: "inquiry", env: { title: "Did the fund follow its adopted purpose?", current_state: "open" } });
  t("OVER-STRICTNESS: an inquiry labelled with its QUESTION's title LANDS, titled by the question",
    [reasonOf(qi), (await listed(Q))?.title], ["LANDED", "Did the fund follow its adopted purpose?"]);
}

/* ======================================================== 3. 7.11's owner test reads the DOCUMENT's state */
console.log("\n--- 3. a non-owner closing a project as abandoned meets NOT_THE_OWNER, whatever meta says ---");
{
  const c = must("fixture project Storm Drains", await promote(RUTH, { text: projectMd("Storm Drains"), type: "project",
    env: { title: "Storm Drains", current_state: "forming" } }));
  const P = c.bundleId;
  const closedMd = projectMd("Storm Drains", { id: P, state: "closed", extra: ["closed_reason: abandoned"] });
  for (const [label, env] of [["LABELLED", { current_state: "closed", closed_reason: "abandoned" }],
                              ["MISLABELLED state", { current_state: "forming" }],
                              ["MISLABELLED reason", { current_state: "closed", closed_reason: "resolved" }],
                              ["UNLABELLED", {}]]) {
    const head = await listed(P);
    /* The title is LABELLED truly in every arm here, so this section varies the STATE's label alone: the control's
       first run left it out, and the name-envelope arm then met NO_TITLE here — a second variable (recorded above). */
    const r = await promote(MTOK, { id: P, base: head?.bundle_sha, text: closedMd, type: "project",
                                    env: { title: "Storm Drains", ...env } });
    t(`${label}: a machine credential deactivating is refused NOT_THE_OWNER`, reasonOf(r), "NOT_THE_OWNER");
  }
  t("…and the project still stands where it was", (await listed(P))?.current_state, "forming");
  /* OVER-STRICTNESS: the OWNER deactivates, unlabelled, and the projection takes the document's state. */
  const o = await promote(RUTH, { id: P, base: (await listed(P))?.bundle_sha, text: closedMd, type: "project", env: {} });
  t("OVER-STRICTNESS UNLABELLED: its owner deactivates it, and the projection shows the document's state",
    [reasonOf(o), (await listed(P))?.current_state], ["LANDED", "closed"]);
}

/* ======================================================== 4. REC-181's retirement arm reads the DOCUMENT's state */
console.log("\n--- 4. retiring a CITED item by promote meets CITED, whatever meta.current_state says ---");
{
  const C = "INFO-2026-0563-cited";
  const reg = [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${C}`), encoding: "binary", bytes: 10 }];
  must("fixture info", await promote(RUTH, { id: C, text: infoMd(C, "Transfer ledger"), type: "information",
    env: { title: "Transfer ledger", current_state: "collected" }, register: reg }));
  const H1 = [{ from: "collected", to: "verified" }], H2 = [...H1, { from: "verified", to: "retired" }];
  must("fixture verify", await promote(RUTH, { id: C, base: (await listed(C)).bundle_sha, type: "information",
    text: infoMd(C, "Transfer ledger", { state: "verified", prior: "collected", history: H1 }),
    env: { title: "Transfer ledger", current_state: "verified" } }));
  const pc = must("fixture case", await promote(RUTH, { text: projectMd("Ledger case"), type: "project",
    env: { title: "Ledger case", current_state: "forming" } }));
  const s = await POST(`op=select&token=${RUTH}`, { ids: [C] });
  must("the case cites the item", await GET(`op=cite&token=${RUTH}&project=${E(pc.bundleId)}&handle=${s?.handle}`));
  const retiredMd = infoMd(C, "Transfer ledger", { state: "retired", prior: "verified", history: H2 });
  for (const [label, env] of [["LABELLED", { current_state: "retired" }], ["MISLABELLED", { current_state: "verified" }],
                              ["UNLABELLED", {}]]) {
    const r = await promote(RUTH, { id: C, base: (await listed(C)).bundle_sha, type: "information", text: retiredMd, env });
    t(`${label}: refused CITED`, reasonOf(r), "CITED");
  }
  t("…and the item is still verified", (await listed(C))?.current_state, "verified");
}

/* ======================================================== 5. the projection writes the DOCUMENT's state */
console.log("\n--- 5. the projection writes the document's state; a label contradicting it is refused by name ---");
{
  const V = "INFO-2026-0563-walked";
  const reg = [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${V}`), encoding: "binary", bytes: 10 }];
  must("fixture info", await promote(RUTH, { id: V, text: infoMd(V, "Budget book"), type: "information",
    env: { current_state: "collected" }, register: reg }));
  const H1 = [{ from: "collected", to: "verified" }];
  const verified = infoMd(V, "Budget book", { state: "verified", prior: "collected", history: H1 });
  const head = (await listed(V)).bundle_sha;
  const ms = await promote(RUTH, { id: V, base: head, type: "information", text: verified, env: { current_state: "collected" } });
  t("MISLABELLED current_state: refused ENVELOPE_STATE_DISAGREES, naming the field and both values",
    [reasonOf(ms), ms?.check, ms?.field, ms?.document_value, ms?.envelope_value],
    ["ENVELOPE_STATE_DISAGREES", "C-86.4", "current_state", "verified", "collected"]);
  const mp = await promote(RUTH, { id: V, base: head, type: "information", text: verified,
    env: { current_state: "verified", prior_state: null } });
  t("MISLABELLED prior_state: refused ENVELOPE_STATE_DISAGREES on prior_state",
    [reasonOf(mp), mp?.field, mp?.document_value, mp?.envelope_value],
    ["ENVELOPE_STATE_DISAGREES", "prior_state", "collected", null]);
  t("…and nothing was written (the head is unchanged, still collected)",
    [(await listed(V))?.bundle_sha, (await listed(V))?.current_state], [head, "collected"]);
  const us = await promote(RUTH, { id: V, base: head, type: "information", text: verified, env: {} });
  const row = await proj(V);
  t("UNLABELLED: LANDS, and the projection shows the document's current_state and prior_state",
    [reasonOf(us), row?.current_state, row?.prior_state], ["LANDED", "verified", "collected"]);
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nd563-promoted-title-state: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
