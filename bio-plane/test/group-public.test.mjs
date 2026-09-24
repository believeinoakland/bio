/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/group-public.control.mjs` — deliberately NOT a `.test.mjs`, because it builds ARMED COPIES of the sources while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/group-public.control.mjs [arm]`. Every arm patches a COPY of `src/` (asserting its anchor occurs exactly once), the real sources are hashed before and after, and what each arm MUST fail is declared in the driver before it arms. RESULTS, RUN 2026-09-22 in worktree agent-a1e1ea8fd9d66c92a on `1611bdbf` + REC-163 (real src/index.mjs 703,674 B sha256 58c9aee185d0…, src/setup.mjs 77,369 B sha256 70ddf6a2e0a0…; every real source and checks/bio-checks.mjs untouched: YES), all ten rows AS DECLARED, on the first run (25 assertions) and again after C6 was added (26, the figures here): (a) baseline 26/0 · (b) literal-restored, THE ROW'S CONTROL — the template's line put back as it stood: 13/13, every page arm failing BY NAME with THE SECOND-SLUG ARM (P2) among them, and the source census (S1), while every op arm stays green · (c) css-hidden, THE LIAR THE ROW NAMES — the old name kept in a CSS-hidden span, built at run time so the census cannot see it: 24/2, P1b and P2b ALONE, the page READING right (P1, P2 green) and only the served-bytes arms seeing it · (d) static-page, a page that reads nothing: 20/6 (P1, G3, P2, P3, P3b, P4b) — the silence arm P4 passes it, which is why P4b exists · (e) silence-as-none on the page: 25/1, P4 alone · (f) op-public-refused, the OPS row back to three classes: 17/9 (G1, G2, G3, C3, C5, G4, G5, G6, P4b), the page green · (g) public-gets-provenance: 21/5 (G1, G2, C3, C5, G5), every value arm green · (h) op-silence-as-none on the wire: 25/1, G6 alone · (i) page-reads-scratch: 24/2 (P3b, P4) — only the seed and the silence, both made in bio, can tell which record the page reads · (j) over-strict — other markup, an entity for the dot, all three lines reworded: 26/0. RE-RUN 2026-09-24 by D-475 in worktree /home/user/bio on `e9b21be6` + that row, after the `/` route stopped writing its namespace as a literal (the driver's PAGE_READ re-anchored, and `page-reads-scratch` re-armed on the line that now decides the namespace): all ten rows AS DECLARED and EVERY FIGURE UNMOVED from the run above — 26/0, 13/13, 24/2, 20/6, 25/1, 17/9, 21/5, 25/1, 24/2, 26/0 (real index.mjs 807,869 B sha256 d3dcaee8fa37, setup.mjs 83,079 B sha256 96708072ccc7; every real source untouched: YES). ON THE UNTOUCHED PLANE (`1611bdbf`'s src/, extracted with git archive) this suite reads 6/20: S0, P7 and the four credentialed arms C1, C2, C4, C6 pass there — the credentialed answer is unchanged, which is what makes the row additive.
 * =========================================================================
 * REC-163 / IC-174 — THE PUBLISHING GROUP'S SLUG IS PUBLIC, AND THE INSTANCE'S OWN FRONT DOOR SHOWS IT.
 * `BIO_Publication_v0_1.md` §7 point 1 (BOB #24, 2026-09-21), over `BIO_State_Rules_Consistency_v1_5.md` §3.1 (D-436).
 *
 * THE DEFECT, measured by CONDUCT #12 on origin/main and again on this base (`0ce7447b`): `src/setup.mjs`, served
 * publicly at `/` by every installed instance, opened with ONE group's name as a literal eyebrow line, while D-436 had
 * already made the producing group ONE recorded value per store (`Store#instanceGroup`, read by op=instancegroup) and
 * the page never read it. And op=instancegroup admitted only the admin, member and probe classes, so nothing a
 * stranger holds could read the slug §7 rules public.
 *
 * THE ROW'S ACCEPTANCE, asserted here in the row's own terms: signed out, the page served at `/` renders the recorded
 * slug and no trace of that literal (P1, P1b, and P2/P2b — THE SECOND-SLUG ARM, an install under a slug that is not the
 * first one); under a store recording none it SAYS so (P3); a public op=instancegroup answers the slug (G1).
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks:
 *   (a) HIDE THE LITERAL WITH CSS. A page that keeps the old name in a hidden span and shows the slug beside it reads
 *       right in a browser. So every "names no other group" arm reads the SERVED BYTES — the whole response body,
 *       script included — and never a rendered DOM's visible text. The control's `css-hidden` arm is that liar, and it
 *       builds the name at run time so the source census cannot be what catches it: P1b and P2b must.
 *   (b) SERVE A PAGE THAT SAYS NOTHING. A page with the literal deleted and no group read at all passes every "no
 *       literal" arm. So the recorded arms demand the SLUG, per install, and the none arm demands WORDS (`static-page`).
 *   (c) CALL A SILENCE "NONE". A page that renders "no group is recorded" whenever the read fails is right on a store
 *       that records none and wrong on a store that did not answer. §4 makes the store FAIL FOR REAL (a subclass of the
 *       shipped Store answering the store's own failure envelope — REC-52's instrument, inlined so an armed copy of
 *       `src/` is what it wraps) and pairs every silence arm with the same store answering (`silence-as-none`).
 *   (d) GIVE THE STRANGER THE WHOLE ROW. The slug is public by §7's own reason — it is already published and served —
 *       and that reason covers nothing else in the row. So the public answer is pinned to its exact key set (G1, G5)
 *       while every credential the admission gate admitted keeps the whole row (C1–C4, C6): `public-gets-provenance`.
 *
 * WHAT THIS CANNOT SEE, stated: the member UI (`civicos-ui/app.html`, whose public header still names a group by
 * literal) — that is UI-77's row, queued directly after this one, and it reads this op; a page as a BROWSER renders it
 * (nothing here runs a layout engine: the placement arm P5 reads the structure, and the bytes arms are the ones the row
 * asks for); and any served surface other than `/` and the signing page, whose two modules are the whole of S1's corpus.
 * A store written by a build older than D-436 is simulated by a store whose first boot had no INSTANCE_NAME, which is
 * equivalent by D-436's own rule (instance-group.test.mjs states the same limit).
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { parseFrontmatter } from "../checks/bio-checks.mjs";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
/* The control driver points this at an ARMED copy of src/. */
const SRC_DIR = process.env.GROUP_PUBLIC_SRC || join(PLANE, "src");
const IDX = join(SRC_DIR, "index.mjs");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const FIRST = "oak-town", SECOND = "harbor-watch", LATE = "late-town";
const ADM = "adm-rec163-group-root", MEM = "mem-rec163-group-member", PRB = "prb-rec163-group-probe";   /* 16+ characters */
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
/* THE LITERAL THIS ROW REMOVES, in EVERY spelling a group's identity takes — the display name, the slug, a domain's
   stem — in any case. Built from its parts, so this suite's own text is not a site of it. */
const LITERAL = new RegExp(["believe", "in", "oakland"].join("[\\s\\-_]*"), "i");
const E = encodeURIComponent;
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;

/* THE SILENT STORE — REC-52's instrument (`fixtures/do-fail-worker.mjs`), inlined rather than imported because that
   fixture wraps the REAL `src/`, and the control driver must be able to point this suite at an ARMED copy. A subclass
   of the shipped Store that answers named Durable Object paths with the store's OWN failure envelope; every other
   path is the genuine store. The switch lives on the Durable Object instance that will be consulted. */
const FAILING = `import worker, { Store as PlaneStore } from "./index.mjs";
export class FailingStore extends PlaneStore {
  async fetch(req) {
    const u = new URL(req.url);
    const path = u.pathname.slice(1);
    if (path === "__failpaths") {
      this.__fail = (u.searchParams.get("paths") || "").split(",").filter(Boolean);
      return Response.json({ ok: true, result: { failing: this.__fail } });
    }
    if ((this.__fail || []).includes(path))
      return Response.json({ ok: false, error: "Error: REC-163 injected Durable Object failure at /" + path }, { status: 500 });
    return super.fetch(req);
  }
}
export default {
  async fetch(req, env, ctx) {
    const u = new URL(req.url);
    if (u.pathname === "/__failpaths")
      return env.STORE.get(env.STORE.idFromName(u.searchParams.get("store") || "bio"))
        .fetch("http://ctl/__failpaths?paths=" + encodeURIComponent(u.searchParams.get("paths") || ""));
    return worker.fetch(req, env, ctx);
  },
};
`;

/* Every Miniflare this suite builds, built here — one constructor site, one dispose per instance. */
const live = [];
const planeAt = ({ name = null, failing = false } = {}) => {
  const mf = new Miniflare({
    modules: true, modulesRoot: "/",
    ...(failing ? { scriptPath: join(SRC_DIR, "rec163-failing-store.mjs"), script: FAILING }
                : { scriptPath: IDX, script: readFileSync(IDX, "utf8") }),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: failing ? "FailingStore" : "Store", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, PROBE_TOKEN: PRB, VERSION: "test",
                ...(name === null ? {} : { INSTANCE_NAME: name }) },
  });
  live.push(mf);
  return mf;
};

/* The page AS SERVED: status, type and the BODY — bytes, never a rendered DOM. */
const page = async (mf, path = "/") => {
  const r = await mf.dispatchFetch(`http://x${path}`);
  return { status: r.status, type: r.headers.get("content-type") || "", body: await r.text() };
};
/* An op, its HTTP status and its whole envelope (NOT unwrapped: the envelope's `store` and `tokenClass` are asserted). */
const api = async (mf, q, init) => {
  const r = await mf.dispatchFetch(`http://x/api/?${q}`, init);
  let j = null;
  try { j = JSON.parse(await r.text()); } catch { j = null; }
  return { status: r.status, j };
};
const post = async (mf, q, body) => rP((await api(mf, q, { method: "POST", body: JSON.stringify(body ?? {}) })).j);
const get = async (mf, q) => rP((await api(mf, q)).j);
const keysOf = (o) => (o && typeof o === "object" ? Object.keys(o).sort() : null);

/* THE ONE ELEMENT THE PAGE STATES ITS GROUP IN, found by its id WHATEVER ITS TAG, so a different but faithful markup
   is not a failure (the control's over-strictness arm): its state, its text with tags stripped, and how many there
   are. NULL-TOLERANT, so an arm that removes it NAMES the assertions it broke instead of ending the module. */
const groupLine = (html) => {
  const body = String(html ?? "");
  const count = (body.match(/\bid="instance-group"/g) || []).length;
  const m = /<([a-z][a-z0-9]*)\b([^>]*\bid="instance-group"[^>]*)>([\s\S]*?)<\/\1>/.exec(body);
  if (!m) return { count, state: null, text: "" };
  const text = m[3].replace(/<[^>]*>/g, " ").replace(/&middot;/g, "·").replace(/&amp;/g, "&")
    .replace(/\s+/g, " ").trim();
  return { count, state: /\bdata-group="([a-z]+)"/.exec(m[2])?.[1] ?? null, text };
};

/* ------------------------------------------------------------------ the fixture */
const enrol = async (mf, memberId) => {
  /* An ADMINISTRATOR, because Membership v2 §4 admits no ordinary member until two administrators exist — and an
     enrolled administrator's session is a MEMBER session to the admission gate (`kind` is "admin" for the founder
     alone), which is the class the credentialed arm below names. */
  const add = await post(mf, `op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role: "admin",
                                                             capabilities: ["contribute"] });
  const en = await post(mf, "op=enroll", { invite: add?.invite, handle: memberId, password: `${memberId}-passphrase-rec163` });
  if (!en?.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)} after memberadd ${JSON.stringify(add)}`);
  const lg = await post(mf, "op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-rec163` });
  if (!lg?.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* An INFO document stating NO group of its own, so the group its stored bytes name is the one the store stamps. */
const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "references: []", "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting",
  "source:", '  locator: "https://oaklandca.opengov.com/transfer-memo"',
  '  authority: "Oakland OpenGov portal"', '  retrieved: "2026-07-01"',
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const create = (mf, id, text) => post(mf, `op=promote&token=${ADM}`, {
  bundleId: id, base: null, snapKey: `20260922T101631Z_${sha(id).slice(0, 8)}`,
  meta: { object_type: "information", title: `t ${id}`, current_state: "collected", created: NOW, last_updated: LATER },
  files: [{ path: "bundle.md", text, bytes: Buffer.byteLength(text), sha256: sha(text) }], register: [] });
const fileOf = async (mf, id) => {
  const r = await get(mf, `op=file&token=${ADM}&id=${E(id)}&path=bundle.md`);
  return r && typeof r.text === "string" ? r.text : (typeof r === "string" ? r : r?.content ?? null);
};
const groupIn = (text) => (typeof text === "string" ? parseFrontmatter(text).data?.group : undefined) ?? null;

try {

/* ======================================================================= 0. THE SOURCE */
console.log("\n--- 0. the page modules the plane serves name no group of their own ---");
{
  /* REACH FIRST: a matcher that finds nothing passes every corpus. It must recognise the literal in every spelling a
     group's identity takes, and must NOT recognise another group's slug. */
  const planted = [["Believe", "in", "Oakland"].join(" "), ["believe", "in", "oakland"].join("-"),
                   ["believe", "in", "oakland"].join("") + ".org", ["BELIEVE", "IN", "OAKLAND"].join(" ")];
  t("S0: the literal's matcher recognises the display name, the slug, the domain stem and the capitals, and not "
    + "another group's slug", [planted.map((s) => LITERAL.test(s)), LITERAL.test(FIRST), LITERAL.test(SECOND)],
    [[true, true, true, true], false, false]);
  const mods = ["setup.mjs", "signpage.mjs"];
  const texts = mods.map((f) => readFileSync(join(SRC_DIR, f), "latin1"));
  const hits = mods.flatMap((f, i) => { const m = LITERAL.exec(texts[i]); return m ? [`${f}: ${JSON.stringify(m[0])}`] : []; });
  const bytes = texts.reduce((n, s) => n + s.length, 0);
  console.log(`         (corpus: ${mods.join(" + ")}, ${bytes} B under ${SRC_DIR === join(PLANE, "src") ? "src/" : "an ARMED copy of src/"})`);
  t("S1: neither page module the plane serves — the setup page, the signing page — names a group of its own, in any "
    + "spelling, code or comment (a floor on the corpus, so an empty read cannot pass)",
    [bytes > 50000, hits], [true, []]);
  /* The TEMPLATE's own line, before anything is read: a page served without a read must name nobody and claim nothing. */
  const { SETUP_HTML } = await import(pathToFileURL(join(SRC_DIR, "setup.mjs")).href);
  const u = groupLine(SETUP_HTML);
  t("U1: the page's TEMPLATE, before any read, carries the UNREAD line — so a page served without reading the record "
    + "says it did not read, names nobody, and claims nothing about what is recorded",
    [u.count, u.state, /recorded/i.test(u.text), u.text.length > 10], [1, "unread", false, true]);
}

/* ======================================================================= 1. FIRST INSTALL */
console.log(`\n--- 1. an install under '${FIRST}': the page and the public op name it, and nothing else ---`);
const A = planeAt({ name: FIRST });
{
  const p = await page(A);
  const g = groupLine(p.body);
  t(`P1: signed out, the page served at / names the recorded slug '${FIRST}' in its group line, read from the SERVED BYTES`,
    [p.status, /text\/html/.test(p.type), g.state, g.text.includes(FIRST)], [200, true, "recorded", true]);
  t("P1b: and those bytes — every byte of the response, the script included — name no other group in any spelling, so "
    + "a literal hidden by CSS still fails here", LITERAL.test(p.body), false);

  const r = await api(A, "op=instancegroup");
  t(`G1: a PUBLIC op=instancegroup — no credential at all — answers the slug '${FIRST}' from bio, and the slug is ALL it `
    + "answers: no recorded_at, no source, no recorded_by",
    [r.status, r.j?.ok, r.j?.store, r.j?.result?.group, keysOf(r.j?.result)], [200, true, "bio", FIRST, ["group", "ok"]]);

  const ps = await api(A, "op=instancegroup&store=scratch");
  t("G2: a stranger naming store=scratch reads the scratch namespace's own slug, and the answer says which store answered",
    [ps.status, ps.j?.store, ps.j?.result?.group, keysOf(ps.j?.result)], [200, "scratch", FIRST, ["group", "ok"]]);

  /* ONE READER: the page, the op and the store's own stamp. */
  const id = "INFO-2026-1631-one-reader";
  const w = await create(A, id, infoMd(id));
  const stored = await fileOf(A, id);
  t("G3: ONE READER — the group the page shows, the group the public op answers and the group the store stamps into a "
    + "document it creates (one stating no group of its own) are the same value",
    [w?.ok, groupIn(stored), r.j?.result?.group, g.text.includes(groupIn(stored) ?? " ")], [true, FIRST, FIRST, true]);

  /* THE CREDENTIALED ANSWERS, UNCHANGED — the row is ADDITIVE: a class was admitted, and nobody lost a field. */
  const a = await api(A, `op=instancegroup&token=${ADM}`);
  t("C1: the ROOT OF TRUST's credential is answered the WHOLE ROW exactly as before — provenance included, its store "
    + "and its class named",
    [a.status, a.j?.store, a.j?.tokenClass, a.j?.result?.group, a.j?.result?.source, a.j?.result?.recorded_by,
     typeof a.j?.result?.recorded_at], [200, "bio", "admin", FIRST, "bootstrap", null, "string"]);
  const as = await api(A, `op=instancegroup&token=${ADM}&store=scratch`);
  t("C2: and with store=scratch it reads the scratch namespace's own row", [as.j?.store, as.j?.result?.group, as.j?.result?.source],
    ["scratch", FIRST, "bootstrap"]);
  const pr = await api(A, `op=instancegroup&token=${PRB}`);
  const pb = await api(A, `op=instancegroup&token=${PRB}&store=bio`);
  t("C3: a PROBE credential keeps its confinement — naming no store it reads SCRATCH's whole row, as before; asking for "
    + "bio it is answered what any stranger is answered there, the public projection, and never bio's provenance",
    [pr.j?.store, pr.j?.tokenClass, pr.j?.result?.source, pb.status, pb.j?.store, keysOf(pb.j?.result)],
    ["scratch", "probe", "bootstrap", 200, "bio", ["group", "ok"]]);
  const vera = await enrol(A, "vera");
  const m = await api(A, `op=instancegroup&token=${vera}`);
  t("C4: an enrolled member's signed-in SESSION is answered the whole row, as before, named as the gate names it",
    [m.status, m.j?.store, m.j?.tokenClass, m.j?.result?.group, m.j?.result?.source], [200, "bio", "member", FIRST, "bootstrap"]);
  const minted = await post(A, `op=aicredentialmint&token=${vera}`, { tokenId: "rec163-reader", principalKind: "member",
    principalMember: "vera", taskScope: "reads whose record this is", writes: [],
    note: "REC-163's agent: reads only, so its credentialed answer can be compared with a stranger's" });
  const ai = await api(A, `op=instancegroup&token=${E(minted?.token ?? "")}`);
  t("C6: an AGENT credential a member minted is answered the whole row, as before, named as the gate names it",
    [typeof minted?.token === "string", ai.status, ai.j?.store, ai.j?.tokenClass, ai.j?.result?.group, ai.j?.result?.source],
    [true, 200, "bio", "ai", FIRST, "bootstrap"]);
  const bad = await api(A, `op=instancegroup&token=${"f".repeat(64)}`);
  t("C5: a credential this instance does not recognise is not refused — it is answered what a stranger is answered",
    [bad.status, bad.j?.result?.group, keysOf(bad.j?.result)], [200, FIRST, ["group", "ok"]]);

  /* SIGNED IN OR OUT: the line is outside every section the page's script switches between, and the script never
     addresses it — so every state of the page (signed out, claiming, signed in, browsing, joining) shows it. */
  const at = p.body.indexOf('id="instance-group"'), main = p.body.indexOf("<main"), sec = p.body.indexOf("<section");
  const script = p.body.slice(p.body.lastIndexOf("<script>") + 8, p.body.lastIndexOf("</script>"));
  t("P5: SIGNED IN OR OUT — the group line sits inside <main> and before the first section the page's script shows or "
    + "hides, and the script never addresses it",
    [main > -1 && at > main, sec > -1 && at > -1 && at < sec, script.length > 1000, /instance-group|eyebrow/.test(script)],
    [true, true, true, false]);
  t("P6: the page states its group ONCE — exactly one group line", g.count, 1);
  /* NOTHING INVENTED: a display name (§7 point 2) and a verified domain (§7 point 3) are later rows. */
  const titled = FIRST.split("-").map((x) => x[0].toUpperCase() + x.slice(1)).join(" ");
  t("P7: nothing is INVENTED beside the slug — no display name made from it, and no domain",
    [g.text.includes(titled), /\b[a-z0-9-]+\.(?:org|com|net|gov|us|io|info)\b/i.test(g.text)], [false, false]);
}

/* ======================================================================= 2. THE SECOND-SLUG ARM */
console.log(`\n--- 2. a SECOND install, under '${SECOND}': its own page names its own group ---`);
const B = planeAt({ name: SECOND });
{
  const p = await page(B);
  const g = groupLine(p.body);
  t(`P2: THE SECOND-SLUG ARM — an install under '${SECOND}' serves a page naming '${SECOND}' in its group line, and not `
    + `'${FIRST}'`, [p.status, g.state, g.text.includes(SECOND), p.body.includes(FIRST)], [200, "recorded", true, false]);
  t("P2b: and its served bytes name no other group in any spelling — read as BYTES, so a literal hidden by CSS fails here",
    LITERAL.test(p.body), false);
  const r = await api(B, "op=instancegroup");
  t(`G4: its public op=instancegroup answers '${SECOND}'`, [r.status, r.j?.result?.group], [200, SECOND]);
}

/* ======================================================================= 3. NONE RECORDED */
console.log("\n--- 3. a store recording NO group: both surfaces SAY so, and the page follows the record ---");
const C = planeAt({ name: null });
{
  const p = await page(C);
  const g = groupLine(p.body);
  t("P3: on a store recording NO group, the page SAYS so in its group line — in words, not a blank, not a default, and "
    + "not another group's name",
    [p.status, g.state, g.text.length > 10, /recorded/i.test(g.text) && /\b(?:no|not|none)\b/i.test(g.text),
     p.body.includes(FIRST) || p.body.includes(SECOND), LITERAL.test(p.body)],
    [200, "none", true, true, false, false]);
  const r = await api(C, "op=instancegroup");
  t("G5: its public op=instancegroup answers group null and says in words that none is recorded — that statement and "
    + "nothing else",
    [r.status, r.j?.result?.group, /no producing group is recorded/.test(r.j?.result?.detail ?? ""), keysOf(r.j?.result)],
    [200, null, true, ["detail", "group", "ok"]]);
  const seed = await api(C, `op=instancegroupseed&token=${ADM}`, { method: "POST", body: JSON.stringify({ slug: LATE }) });
  const g2 = groupLine((await page(C)).body);
  t(`P3b: once the root of trust records '${LATE}', the NEXT page served names it — the page is read from the record `
    + "when it is served, never built once", [seed.j?.result?.ok, g2.state, g2.text.includes(LATE)], [true, "recorded", true]);
}

/* ======================================================================= 4. A SILENT STORE */
console.log("\n--- 4. a store that does NOT ANSWER: a silence is said as a silence, on both surfaces ---");
const D = planeAt({ name: FIRST, failing: true });
{
  const armed = await (await D.dispatchFetch("http://x/__failpaths?paths=instancegrouppublic")).json();
  const p = await page(D);
  const g = groupLine(p.body);
  t("P4: when the record does NOT ANSWER, the page is still served, and its group line says it could not read the group "
    + "— never that none is recorded, and never a name",
    [armed?.result?.failing, p.status, g.state, /recorded/i.test(g.text), g.text.length > 10, p.body.includes(FIRST),
     LITERAL.test(p.body)], [["instancegrouppublic"], 200, "unread", false, true, false, false]);
  const r = await api(D, "op=instancegroup");
  t("G6: and a PUBLIC op=instancegroup answers the silence as a silence (REC-52) — STORE_DID_NOT_ANSWER at 502, carrying "
    + "no group at all, rather than 'none recorded'",
    [r.status, r.j?.reason, !!r.j && "group" in r.j, r.j?.result === undefined], [502, "STORE_DID_NOT_ANSWER", false, true]);
  await D.dispatchFetch("http://x/__failpaths?paths=");
  const g2 = groupLine((await page(D)).body);
  const r2 = await api(D, "op=instancegroup");
  t("P4b: the SAME store with the injection cleared names its slug on both surfaces — so the arm above measured a "
    + "silence, and not a store that records nothing", [g2.state, g2.text.includes(FIRST), r2.j?.result?.group],
    ["recorded", true, FIRST]);
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  for (const mf of [...live]) await mf.dispose();
}
console.log(`\ngroup-public: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
