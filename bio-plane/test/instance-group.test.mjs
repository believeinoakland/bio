/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/instance-group.control.mjs` — deliberately NOT a `.test.mjs`, because it builds ARMED COPIES of the sources while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/instance-group.control.mjs [arm]`. Every arm patches a COPY of `src/` (asserting its anchor occurs exactly once), the real sources are hashed before and after, and what each arm MUST fail is declared in the driver before it arms.
   RESULTS: recorded in the driver's header and in IC-172 once run.
 * =========================================================================
 * D-436 / IC-172 — THE PRODUCING GROUP IS ONE RECORDED VALUE PER INSTANCE, AND NO BUNDLE THIS PLANE WRITES NAMES A
 * LITERAL ONE. BIO_State_Rules_Consistency_v1_5.md §3.1: `group` is the producing group's slug and travels with every
 * distributed copy — it is in the bytes that get signed. D-436's own row makes the design call: the slug is ONE value
 * in the Durable Object's durable state, written ONCE at the instance's first bootstrap from the slug the installer
 * holds; every default and every stamp reads it; it is NEVER a deploy-time var.
 *
 * THE DEFECT, measured 2026-09-21 on origin/main @ 2bd24da7 with `grep -a -c`: the literal slug `believe-in-oakland`
 * 23 times in src/store.mjs (18 `fm.group ||` fallbacks, 2 trimmed-argument defaults, and three UNCONDITIONAL stamps —
 * testify's bytes and meta, and a fork's meta), once in src/index.mjs (the monitor tick), three times in src/setup.mjs
 * (the instance's own intake page: its bytes, its creation meta and its edit meta) and once in src/livefire.mjs.
 * True of this project's instance, false of every instance `newgroup` installs.
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks:
 *   (a) RE-READ THE VALUE FROM THE DEPLOY VAR (INSTANCE_NAME) at every write. An install under a second slug then
 *       writes that slug everywhere, and every assertion about the FIRST install passes. So §3 boots the SAME
 *       persisted store again with the var MOVED, and asserts the recorded value did not move and that a document
 *       written after the move still names the first slug. The control's `reread-the-var` arm is that liar.
 *   (b) STAMP ONLY WHAT THE PLANE COMPOSES. testify's bytes then carry the right group while the member UI and the
 *       setup page — which compose their own bytes with the old literal — keep writing it. So §2's W1 sends the UI's
 *       exact shape (the literal in the bytes AND in meta) and asserts the STORED bytes name the recorded group.
 *   (c) SEED AN EXISTING STORE FROM THE VAR. This project's own instance is named for its worker, not its group, and a
 *       sovereign store installed earlier holds documents already stamped with the old literal — the var and the record
 *       can disagree. §4 reboots a store that already held the schema with the var bound and asserts NOTHING is
 *       recorded until the root of trust records it, once.
 *   (d) DEFAULT WHEN NOTHING IS RECORDED. §4 asserts a creation stating no group is REFUSED by name (C-64.1) and writes
 *       nothing, and that a caller's own statement is kept as the caller's — the plane supplies nothing.
 *
 * WHAT THIS CANNOT SEE, stated: a store written by a build older than this one is simulated by a store whose first
 * boot had no INSTANCE_NAME — equivalent BY THE RULE, because the first-boot witness is the `bundles` table, which
 * every build creates; a pre-D-436 build's store is not cut here. `divide`, the strength-bar pair's refusal arm and
 * the seventeen revision writers other than `conclude` are not driven one by one: every creation reaches the ONE
 * decision in `promote` (W1–W5 drive it from five callers), every revision keeps the group its creation wrote (W6),
 * and §0's census is what sees a literal reappear at any site. The monitor tick needs a fetch and is not driven.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, readdirSync, mkdtempSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { parseFrontmatter, INSTANCE_GROUP_CHECKS } from "../checks/bio-checks.mjs";
import { codeOnly } from "../scripts/declared-source.mjs";
import { withAdoptableReading, adoptedVersionParam } from "./adoptable-reading.mjs";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
/* The control driver points this at an ARMED copy of src/. */
const SRC_DIR = process.env.INSTANCE_GROUP_SRC || join(PLANE, "src");
const IDX = join(SRC_DIR, "index.mjs");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const LITERAL = "believe-in-oakland";
const SLUG = "oak-town", MOVED = "other-town", LATE = "late-town";
const ADM = "adm-d436-group-root", MEM = "mem-d436-group-member", PRB = "prb-d436-group-probe";   /* 16+ characters: livefire refuses a shorter configured token */
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const E = encodeURIComponent;
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
/* NULL-TOLERANT, so an arm that breaks an answer's shape NAMES the assertions it broke instead of ending the
   module on a TypeError. */
const codeOf = (r) => (r && typeof r.code === "string") ? r.code : (r && r.reason) || null;
const refusedAs = (r, code) => [codeOf(r), r && r.check ? r.check : null,
  !!(r && INSTANCE_GROUP_CHECKS[code] && r.translation === INSTANCE_GROUP_CHECKS[code].translation)];
const want = (code) => [code, INSTANCE_GROUP_CHECKS[code].check, true];
const groupIn = (text) => (typeof text === "string" ? parseFrontmatter(text).data?.group : undefined) ?? null;

/* Every Miniflare this suite builds, built here — one constructor site, one dispose per instance. */
const live = [], trees = [];
const planeAt = ({ name, persist = null }) => {
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    ...(persist ? { durableObjectsPersist: persist } : {}),
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, PROBE_TOKEN: PRB, VERSION: "test",
                ...(name === null ? {} : { INSTANCE_NAME: name }) },
  });
  live.push(mf);
  return mf;
};
const retire = async (mf) => { await mf.dispose(); live.splice(live.indexOf(mf), 1); };
const door = (mf) => ({
  POST: async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
    { method: "POST", body: JSON.stringify(body ?? {}) })).json()),
  GET: async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json()),
});

/* ------------------------------------------------------------------ the fixture */
const enrol = async (D, memberId, caps, role = "member") => {
  const add = await D.POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role, capabilities: caps });
  const en = await D.POST("op=enroll", { invite: add?.invite, handle: memberId, password: `${memberId}-passphrase-d436` });
  if (!en?.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)} after memberadd ${JSON.stringify(add)}`);
  const lg = await D.POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-d436` });
  if (!lg?.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* An INFO document; `groupLine` is the whole line (or null for none), so the caller's own statement is explicit. */
const infoMd = (id, groupLine) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  ...(groupLine === null ? [] : [groupLine]),
  "references: []", "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting",
  "source:", '  locator: "https://oaklandca.opengov.com/transfer-memo"',
  '  authority: "Oakland OpenGov portal"', '  retrieved: "2026-07-01"',
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const inquiryMd = (id, question, info, groupLine) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  ...(groupLine === null ? [] : [groupLine]),
  "references:", `  - target: ${info}`, "    rel: cites", "    status: confirmed",
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "basis:", `  - target: ${info}`, "    role: supports", "    grade: D",
  "    grade_axis: connection", "    grade_source: testimony",
  "---", "", "## Question", "", question, "", "## What It Rests On", "", "## Conclusion", "",
  "## What Would Falsify This", "", "## Session Log", "",
  `### Session ${LATER} | Formation | agent`, "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");
const projectMd = (title, groupLine) => ["---", "object_type: project", "schema: project@1",
  `title: "${title}"`, "current_state: forming", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  ...(groupLine === null ? [] : [groupLine]),
  "references: []", "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", 'objective: "Decide whether to refer this to the auditor."',
  "---", "", "## Thesis Summary", "", "A project.", "", "## Open Questions", "", "## Ruled Out", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");
let snapSeq = 0;
/* A creation through the control plane. `metaGroup` undefined sends NO meta group key at all. */
const create = (D, tok, { id, text, type, state, metaGroup, replay } = {}) => D.POST(`op=promote&token=${tok}`, {
  ...(id === undefined ? {} : { bundleId: id }), base: null,
  snapKey: `20260921T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
  meta: { object_type: type, ...(metaGroup === undefined ? {} : { group: metaGroup }), title: `t ${id ?? "new"}`,
          current_state: state, created: NOW, last_updated: LATER },
  files: [{ path: "bundle.md", text, bytes: Buffer.byteLength(text), sha256: sha(text) }],
  register: [], ...(replay ? { replay: true } : {}) });
const fileOf = async (D, id) => {
  const r = await D.GET(`op=file&token=${ADM}&id=${E(id)}&path=bundle.md`);
  return r && typeof r.text === "string" ? r.text : (typeof r === "string" ? r : r?.content ?? null);
};
const groupIdOf = async (D, id) => (await D.GET(`op=projection&token=${ADM}&id=${E(id)}`))?.group_id ?? null;
/* EVERY bundle in a store, and every text file of each — live AND history (op=image serves both). */
const everyText = async (D, store = "bio") => {
  const s = store === "bio" ? "" : `&store=${store}`;
  const listed = await D.GET(`op=list&token=${ADM}${s}`);
  const rows = Array.isArray(listed) ? listed : (listed?.bundles ?? []);
  const texts = [];
  for (const r of rows) {
    const img = await D.GET(`op=image&token=${ADM}&id=${E(r.bundle_id)}${s}`);
    for (const [path, v] of Object.entries(img || {}))
      if (typeof v === "string") texts.push({ id: r.bundle_id, path, v });
  }
  return { bundles: rows.length, files: texts.length, texts };
};
const holding = (scan, needle) => scan.texts.filter((x) => x.v.includes(needle)).map((x) => `${x.id}:${x.path}`);

try {

/* ======================================================================= 0. THE SOURCE */
console.log("\n--- 0. the plane's source names no group of its own, and the value is written once ---");
{
  const files = readdirSync(SRC_DIR).filter((f) => f.endsWith(".mjs"));
  const bytes = files.reduce((n, f) => n + readFileSync(join(SRC_DIR, f)).length, 0);
  const hits = files.flatMap((f) => {
    const n = readFileSync(join(SRC_DIR, f), "latin1").split(LITERAL).length - 1;
    return n ? [`${f}:${n}`] : [];
  });
  console.log(`         (corpus: ${files.length} module(s), ${bytes} B under ${SRC_DIR === join(PLANE, "src") ? "src/" : "an ARMED copy of src/"})`);
  t("S0: the corpus the census reads is the plane's source and is not empty (a census over nothing proves nothing)",
    [files.length >= 25, files.includes("store.mjs"), files.includes("index.mjs"), files.includes("setup.mjs")],
    [true, true, true, true]);
  t(`S1: the literal slug occurs NOWHERE in the plane's source — code or comment, any module (it stood 28 times on the base)`,
    hits, []);
  const store = codeOnly(readFileSync(join(SRC_DIR, "store.mjs"), "utf8"));
  const writes = [...store.matchAll(/(INSERT(?:\s+OR\s+\w+)?\s+INTO\s+instance_group\b[\s\S]*?)[`"]/g)].map((m) => m[1]);
  const allCode = readdirSync(SRC_DIR).filter((f) => f.endsWith(".mjs"))
    .map((f) => codeOnly(readFileSync(join(SRC_DIR, f), "utf8"))).join("\n");
  const writeOnce = (w) => /ON\s+CONFLICT\s*\(\s*id\s*\)\s+DO\s+NOTHING/i.test(w) || /^INSERT\s+OR\s+IGNORE\b/i.test(w);
  t("S2: the value is WRITTEN ONCE — every statement writing instance_group is an insert that does nothing on "
    + "conflict, and no statement anywhere updates, replaces or deletes it",
    [writes.length >= 2, writes.every(writeOnce),
     /\bUPDATE\s+instance_group\b|\bDELETE\s+FROM\s+instance_group\b|\bREPLACE\s+INTO\s+instance_group\b|\bINSERT\s+OR\s+REPLACE\s+INTO\s+instance_group\b/i.test(allCode)],
    [true, true, false]);
  const reader = /#producingGroup\(\)\s*\{([\s\S]*?)\n  \}/.exec(store);
  t("S3: THE ONE READER reads the store and nothing else — never the environment a redeploy can move",
    [!!reader, !!reader && /instance_group/.test(reader[1]), !!reader && /\benv\b|INSTANCE_NAME/.test(reader[1])],
    [true, true, false]);
  /* Read RAW, both: `codeOnly`'s lexer blanks a regex literal along with the comments, so the pattern is taken from
     the source text itself (measured: through `codeOnly` the plane's line reads `static GROUP_SLUG_RE = ;`). */
  const installer = /const SLUG_RE = (\/[^\n]+\/);/.exec(readFileSync(join(REPO, "newgroup", "src", "index.mjs"), "utf8"));
  const plane = /static GROUP_SLUG_RE = (\/[^\n]+\/);/.exec(readFileSync(join(SRC_DIR, "store.mjs"), "utf8"));
  t("S4: the plane checks a slug by the INSTALLER'S OWN grammar — the two sources are byte-equal, so neither moves alone",
    [!!installer, !!plane, installer && plane ? installer[1] === plane[1] : false], [true, true, true]);
}

/* ======================================================================= 1. FIRST BOOT */
console.log(`\n--- 1. an install under a second slug: the store's first boot records '${SLUG}', once ---`);
const PA = mkdtempSync(join(tmpdir(), "instance-group-a-")); trees.push(PA);
let A = planeAt({ name: SLUG, persist: PA });
let DA = door(A);
{
  const g = await DA.GET(`op=instancegroup&token=${ADM}`);
  t(`B1: the store records '${SLUG}', learned at its FIRST BOOT from the installer's binding, recorded by nobody`,
    [g?.group, g?.source, g?.recorded_by], [SLUG, "bootstrap", null]);
  const gs = await DA.GET(`op=instancegroup&token=${ADM}&store=scratch`);
  t("B2: the scratch namespace — a Durable Object no claim ever reaches — records it at its OWN first boot",
    [gs?.group, gs?.source], [SLUG, "bootstrap"]);
  const claim = await DA.POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-d436" });
  const after = await DA.GET(`op=instancegroup&token=${ADM}`);
  t("B3: claiming the instance (the operator's first act) records nothing and moves nothing",
    [claim?.ok, after?.group, after?.source], [true, SLUG, "bootstrap"]);
}

/* ======================================================================= 2. EVERY WRITER */
console.log(`\n--- 2. every writer names '${SLUG}', and nothing names the literal ---`);
const IRIS = await enrol(DA, "iris", ["contribute", "publish", "create_projects"], "admin");
{
  /* W1 — THE MEMBER UI'S EXACT SHAPE (civicos-ui/app.html mdFor + its meta): the literal in the bytes AND in meta. */
  const idW1 = "INFO-2026-4361-ui-shaped", textW1 = infoMd(idW1, `group: ${LITERAL}`);
  const w1 = await create(DA, ADM, { id: idW1, text: textW1, type: "information", state: "collected", metaGroup: LITERAL });
  const storedW1 = await fileOf(DA, idW1);
  t(`W1: a creation whose bytes AND meta carry the literal (the member UI's shape) is STORED naming '${SLUG}' — the `
    + "store stamps the producer; the caller does not choose it",
    [w1?.ok, groupIn(storedW1), await groupIdOf(DA, idW1), String(storedW1).includes(LITERAL)],
    [true, SLUG, SLUG, false]);
  t("W1b: and the sha the answer carries is the sha of the bytes HELD (the stamp re-hashed; the caller's sha is not registered)",
    [w1?.bundleSha, w1?.bundleSha === sha(textW1)], [storedW1 ? sha(storedW1) : null, false]);
  t("W1c: the stamp REPLACED the caller's line rather than adding a second one (one top-level group key)",
    String(storedW1).split("\n").filter((l) => l.startsWith("group:")).length, 1);

  /* W2 — a creation that states NO group anywhere (the setup page's shape since this landing). */
  const idW2 = "INFO-2026-4362-no-group", textW2 = infoMd(idW2, null);
  const w2 = await create(DA, ADM, { id: idW2, text: textW2, type: "information", state: "collected" });
  const storedW2 = await fileOf(DA, idW2);
  t(`W2: a creation stating NO group is written naming '${SLUG}' in its bytes and its projection`,
    [w2?.ok, groupIn(storedW2), await groupIdOf(DA, idW2), w2?.bundleSha === (storedW2 ? sha(storedW2) : null)],
    [true, SLUG, SLUG, true]);

  /* W3 — a creation ALREADY naming the recorded group, in a spelling the stamp did not write (quoted). */
  const idW3 = "INFO-2026-4363-says-so", textW3 = infoMd(idW3, `group: "${SLUG}"`);
  const w3 = await create(DA, ADM, { id: idW3, text: textW3, type: "information", state: "collected", metaGroup: "some-other" });
  t("W3: a creation that already names the recorded group — in ANY spelling the catalogue's parser reads as it — is "
    + "left BYTE-IDENTICAL (its own sha is the sha registered)",
    [w3?.ok, w3?.bundleSha, await groupIdOf(DA, idW3)], [true, sha(textW3), SLUG]);

  /* W4 — the plane's OWN composer: a member's firsthand observation (op=testify; an unconditional literal before). */
  const tx = await DA.POST(`op=testify&token=${IRIS}`, { words: "At the 12 September meeting the vendor's "
    + "representative sat with staff at the dais. I was in the third row.", observedAt: "2026-09-12",
    title: "Vendor at the dais" });
  const obs = tx?.bundle_id;
  const storedW4 = obs ? await fileOf(DA, obs) : null;
  t(`W4: op=testify's own bytes name '${SLUG}' (they named the literal UNCONDITIONALLY), and so does the projection`,
    [tx?.ok, groupIn(storedW4), obs ? await groupIdOf(DA, obs) : null], [true, SLUG, SLUG]);

  /* W5 — a PROJECT through a member session (REC-141 mints its id into the bytes too), then a FORK (an
     unconditional literal in its meta before). */
  const made = await create(DA, IRIS, { text: projectMd("Sewer Fund Transfers", `group: ${LITERAL}`), type: "project",
                                         state: "forming", metaGroup: LITERAL });
  const P = made?.bundleId;
  const storedP = P ? await fileOf(DA, P) : null;
  t(`W5: a new project is written once for its minted id and once for '${SLUG}', hashed from what is held`,
    [made?.ok, parseFrontmatter(String(storedP)).data?.id === P, groupIn(storedP), made?.bundleSha === (storedP ? sha(storedP) : null)],
    [true, true, SLUG, true]);
  const fork = await DA.GET(`op=projectfork&token=${IRIS}&projectId=${E(P)}&title=${E("Fork One")}`);
  const storedF = fork?.newId ? await fileOf(DA, fork.newId) : null;
  t(`W5b: a fork of it names '${SLUG}' in its bytes and its projection (its meta carried the literal unconditionally)`,
    [fork?.ok, groupIn(storedF), fork?.newId ? await groupIdOf(DA, fork.newId) : null], [true, SLUG, SLUG]);

  /* W6 — a REVISION written by the plane itself (op=conclude, one of the seventeen fallback sites): the group its
     creation wrote is kept in the bytes AND the projection, and the revision's meta named none. */
  const INFO = "INFO-2026-4364-memo", INQ = "INQ-2026-4365-question";
  await create(DA, ADM, { id: INFO, text: infoMd(INFO, null), type: "information", state: "collected" });
  const q = await create(DA, ADM, { id: INQ, text: withAdoptableReading(inquiryMd(INQ, "Was the transfer authorised?", INFO, null)),
                                    type: "inquiry", state: "open" });
  const c = await DA.GET(`op=conclude&token=${IRIS}&target=${E(INQ)}`
    + `&conclusion=${E(`The answer to ${INQ} is on the memo.`)}`
    + `&falsifier=${E(`An adopted resolution would overturn ${INQ}.`)}` + adoptedVersionParam());
  const storedQ = await fileOf(DA, INQ);
  t(`W6: a revision the plane writes (op=conclude) keeps '${SLUG}' in the bytes and the projection`,
    [q?.ok, c?.ok, parseFrontmatter(String(storedQ)).data?.current_state, groupIn(storedQ), await groupIdOf(DA, INQ)],
    [true, true, "concluded", SLUG, SLUG]);

  /* W7 — the live-fire battery's canary, written into SCRATCH through the probe class. */
  const lf = await DA.GET(`op=livefire&token=${PRB}`);
  const scratch = await everyText(DA, "scratch");
  const canary = scratch.texts.filter((x) => x.path.startsWith("_history/") && /livefire/.test(x.id));
  t(`W7: op=livefire (its canary's meta carried the literal) passes whole in scratch, and the canary's CREATION names `
    + `scratch's own '${SLUG}' — with nothing in scratch naming the literal`,
    [lf?.ok, lf?.store, scratch.bundles >= 1, canary.some((x) => groupIn(x.v) === SLUG), holding(scratch, LITERAL)],
    [true, "scratch", true, true, []]);

  /* W8 — THE ROW'S ACCEPTANCE, over the WHOLE record: every bundle this install wrote, every file, live and history. */
  const all = await everyText(DA);
  console.log(`         (scanned: ${all.bundles} bundle(s), ${all.files} text file(s) incl. history)`);
  t(`W8: AN INSTALL UNDER A SECOND SLUG WRITES NO '${LITERAL}' INTO ANY BUNDLE IT WRITES — every bundle, every text `
    + "file, live and history (a floor on the corpus, so an empty store cannot pass)",
    [all.bundles >= 8, all.files >= 10, holding(all, LITERAL)], [true, true, []]);
  const docs = all.texts.filter((x) => x.path === "bundle.md");
  t(`W8b: and every live bundle.md names '${SLUG}' and nothing else`,
    [...new Set(docs.map((x) => groupIn(x.v)))], [SLUG]);

  /* W9 — a whole-store purge clears the corpus and leaves whose store it is. */
  const pg = await DA.POST(`op=purge&token=${ADM}&confirm=bio`, {});
  const emptied = await everyText(DA);
  const g = await DA.GET(`op=instancegroup&token=${ADM}`);
  t("W9: a whole-store purge empties the corpus and does NOT clear the producing group (identity, exempt beside "
    + "bootstrap and seq)", [pg?.ok, emptied.bundles, g?.group, g?.source], [true, 0, SLUG, "bootstrap"]);
}
await retire(A);

/* ======================================================================= 3. THE LIAR'S ARM */
console.log(`\n--- 3. the var moves to '${MOVED}' over the SAME store: the recorded value does not ---`);
A = planeAt({ name: MOVED, persist: PA });
DA = door(A);
{
  const g = await DA.GET(`op=instancegroup&token=${ADM}`);
  t(`L1: after a redeploy that MOVED INSTANCE_NAME, the store still records '${SLUG}', as it was recorded`,
    [g?.group, g?.source], [SLUG, "bootstrap"]);
  const idL = "INFO-2026-4366-after-move", textL = infoMd(idL, null);
  const wl = await create(DA, ADM, { id: idL, text: textL, type: "information", state: "collected" });
  const stored = await fileOf(DA, idL);
  t(`L2: a document written AFTER the move names '${SLUG}', not the moved var`,
    [wl?.ok, groupIn(stored), await groupIdOf(DA, idL)], [true, SLUG, SLUG]);
  const tokIris = (await DA.POST("op=login", { role: "member:iris", password: "iris-passphrase-d436" }))?.token;
  const tx = await DA.POST(`op=testify&token=${tokIris}`, { words: "On 14 September the clerk read the amended "
    + "contract into the record after the vote. I was present.", observedAt: "2026-09-14", title: "After the vote" });
  const storedT = tx?.bundle_id ? await fileOf(DA, tx.bundle_id) : null;
  t(`L3: the plane's own composer, after the move, names '${SLUG}'`, [tx?.ok, groupIn(storedT)], [true, SLUG]);
  const all = await everyText(DA);
  t(`L4: nothing in the store names the moved var or the literal`,
    [all.bundles >= 2, holding(all, MOVED), holding(all, LITERAL)], [true, [], []]);
}
await retire(A);

/* ======================================================================= 4. A STORE THAT PREDATES THE VALUE */
console.log("\n--- 4. a store that recorded nothing: undetermined is STATED, nothing defaulted, one seed ---");
const PB = mkdtempSync(join(tmpdir(), "instance-group-b-")); trees.push(PB);
let B = planeAt({ name: null, persist: PB });
let DB = door(B);
{
  const g = await DB.GET(`op=instancegroup&token=${ADM}`);
  t("P1: a store whose first boot had no installer binding records NO group, and says so in words",
    [g?.ok, g?.group, typeof g?.detail === "string" && /no producing group is recorded/.test(g.detail)], [true, null, true]);
  const idC1 = "INFO-2026-4367-caller-says", textC1 = infoMd(idC1, "group: caller-said");
  const c1 = await create(DB, ADM, { id: idC1, text: textC1, type: "information", state: "collected" });
  t("C1: recording none, a creation that STATES its group keeps its own statement — bytes untouched, projection its own",
    [c1?.ok, c1?.bundleSha, await groupIdOf(DB, idC1)], [true, sha(textC1), "caller-said"]);
  const c1m = await create(DB, ADM, { id: "INFO-2026-4368-meta-says", text: infoMd("INFO-2026-4368-meta-says", null),
                                      type: "information", state: "collected", metaGroup: "meta-said" });
  t("C1b: …and one stating it only in its meta keeps that statement (the caller's words, as before)",
    [c1m?.ok, await groupIdOf(DB, "INFO-2026-4368-meta-says")], [true, "meta-said"]);
  const idC2 = "INFO-2026-4369-says-nothing";
  const c2 = await create(DB, ADM, { id: idC2, text: infoMd(idC2, null), type: "information", state: "collected" });
  t("C2: recording none, a creation stating NO group is REFUSED by name — C-64.1 with its canned translation — and "
    + "the plane supplies no default", refusedAs(c2, "GROUP_UNDETERMINED"), want("GROUP_UNDETERMINED"));
  t("C2b: and NOTHING was written: the id is free, and the same creation stating a group then lands",
    [await groupIdOf(DB, idC2),
     (await create(DB, ADM, { id: idC2, text: infoMd(idC2, "group: stated-later"), type: "information", state: "collected" }))?.ok],
    [null, true]);
  const RUTH = await enrol(DB, "ruth", ["contribute", "publish"], "admin");
  const tx = await DB.POST(`op=testify&token=${RUTH}`, { words: "I saw the notice posted after the deadline.",
                                                          observedAt: "2026-09-01", title: "Late notice" });
  t("C3: recording none, the plane's OWN composer (op=testify) is refused by name rather than naming a group",
    refusedAs(tx, "GROUP_UNDETERMINED"), want("GROUP_UNDETERMINED"));
  const bar = await DB.POST(`op=strengthbar&token=${RUTH}`, { capture: "C", connection: "C" });
  const barOf = await DB.GET(`op=strengthbarof&token=${ADM}`);
  t("C4: recording none, the group DEFAULT bar with no group named is refused by name, and its read says undetermined",
    [...refusedAs(bar, "GROUP_UNDETERMINED"), barOf?.ok, barOf?.group, barOf?.bar],
    [...want("GROUP_UNDETERMINED"), true, null, null]);
}
await retire(B);
B = planeAt({ name: LATE, persist: PB });
DB = door(B);
{
  const g = await DB.GET(`op=instancegroup&token=${ADM}`);
  t(`P2: DECISION (b) — a store that already held the schema records NOTHING at a later boot, even with the var bound `
    + `('${LATE}'): the binding and the record may disagree, and choosing is a person's act`, g?.group, null);
  const mem = await DB.POST(`op=instancegroupseed&token=${MEM}`, { slug: LATE });
  t("P3: a MEMBER bearer cannot record it (the class list is the root of trust's alone)", codeOf(mem), "CLASS_FORBIDDEN");
  const founder = await DB.POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-d436" });
  const fsess = (await DB.POST("op=login", { role: "admin", password: "founder-passphrase-d436" }))?.token;
  const fs = await DB.POST(`op=instancegroupseed&token=${fsess}`, { slug: LATE });
  t("P4: nor the FOUNDER's own session — the verb answers to the credential held in the hosting account, and the "
    + "refusal cites where that is decided",
    [founder?.ok, typeof fsess === "string", codeOf(fs), typeof fs?.recorded === "string" && fs.recorded.includes("instancegroupseed")],
    [true, true, "MACHINE_CREDENTIAL_REQUIRED", true]);
  const bad = await DB.POST(`op=instancegroupseed&token=${ADM}`, { slug: "Late Town!" });
  t("P5: a seed naming something that is not a slug in the installer's grammar is refused by name (C-64.2)",
    refusedAs(bad, "GROUP_SLUG_MALFORMED"), want("GROUP_SLUG_MALFORMED"));
  const seed = await DB.POST(`op=instancegroupseed&token=${ADM}&author=${E("someone-else")}`, { slug: LATE, author: "forged" });
  const g2 = await DB.GET(`op=instancegroup&token=${ADM}`);
  t(`P6: THE ROOT OF TRUST records '${LATE}' ONCE — source seed, recorded by the SERVER's stamp (a caller's author in `
    + "the query or the body is overwritten)",
    [seed?.ok, seed?.group, g2?.group, g2?.source, g2?.recorded_by], [true, LATE, LATE, "seed", "token:admin"]);
  const again = await DB.POST(`op=instancegroupseed&token=${ADM}`, { slug: "second-name" });
  const g3 = await DB.GET(`op=instancegroup&token=${ADM}`);
  t("P7: a SECOND seed is refused by name (C-64.3), naming what is held — and the value does not move",
    [...refusedAs(again, "GROUP_ALREADY_RECORDED"), again?.group, g3?.group, g3?.source],
    [...want("GROUP_ALREADY_RECORDED"), LATE, LATE, "seed"]);
  const idP8 = "INFO-2026-4370-after-seed";
  const p8 = await create(DB, ADM, { id: idP8, text: infoMd(idP8, null), type: "information", state: "collected" });
  const ruth = (await DB.POST("op=login", { role: "member:ruth", password: "ruth-passphrase-d436" }))?.token;
  const tx = await DB.POST(`op=testify&token=${ruth}`, { words: "I saw the notice posted after the deadline.",
                                                          observedAt: "2026-09-01", title: "Late notice" });
  const bar = await DB.POST(`op=strengthbar&token=${ruth}`, { capture: "C", connection: "C" });
  const barOf = await DB.GET(`op=strengthbarof&token=${ADM}`);
  t(`P8: once recorded, every refusal lifts and every writer names '${LATE}' — a creation stating none, testify, and `
    + "the group default bar (declared and read under it)",
    [p8?.ok, groupIn(await fileOf(DB, idP8)), tx?.ok, tx?.bundle_id ? groupIn(await fileOf(DB, tx.bundle_id)) : null,
     bar?.ok, bar?.group, barOf?.group, barOf?.bar?.capture ?? null],
    [true, LATE, true, LATE, true, LATE, LATE, "C"]);
  const kept = await fileOf(DB, "INFO-2026-4367-caller-says");
  t("P9: a document written BEFORE the seed is NOT rewritten by it — its bytes are what it was written under",
    [groupIn(kept), await groupIdOf(DB, "INFO-2026-4367-caller-says")], ["caller-said", "caller-said"]);
}
await retire(B);

/* ======================================================================= 5. REPLAY, AND A MALFORMED BINDING */
console.log("\n--- 5. a replay carries the past verbatim; a malformed installer binding records nothing ---");
{
  const C = planeAt({ name: SLUG });
  const DC = door(C);
  const idR = "INFO-2026-4371-replayed", textR = infoMd(idR, "group: a-past-group");
  const r = await create(DC, ADM, { id: idR, text: textR, type: "information", state: "collected", replay: true });
  t("R1: a REPLAYED creation — historical replay is not authorship — keeps the past's bytes BYTE-IDENTICAL, and its "
    + "projection names what they name", [r?.ok, r?.bundleSha, await groupIdOf(DC, idR)], [true, sha(textR), "a-past-group"]);
  await retire(C);
  const M = planeAt({ name: "Oak Town!" });
  const g = await door(M).GET(`op=instancegroup&token=${ADM}`);
  t("R2: a first boot whose installer binding is not a slug in the installer's grammar records NOTHING — an invented "
    + "or mangled value in signed bytes is the defect", g?.group, null);
  await retire(M);
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  for (const mf of [...live]) await mf.dispose();
  for (const root of trees) rmSync(root, { recursive: true, force: true });
}
console.log(`\ninstance-group: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
