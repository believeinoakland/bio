/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/nc-d475.mjs` — `node test/nc-d475.mjs [arm]` from `bio-plane/`. Four arms, each ALONE against a uniquely-named pristine copy of `src/index.mjs`, restore verified by sha256 AND by byte comparison with the byte count floored. (a) ARM A, THE ROW'S CONTROL — the parameter ignored again, `publicInstanceGroup(env, "bio")` as it stood: MUST FAIL at `A1: /?store=scratch serves the SCRATCH record's slug` BY NAME and at `A3: the two surfaces agree`, while A2 (no `store=` reads bio) stays GREEN, which is the whole point of pairing them. (b) ARM B, a HALF fix — the store passed through but the unknown-namespace gate not run, so `/?store=nonsense` serves `bio` again: MUST FAIL at C1, C2 and C3 and at nothing else. (c) ARM C, OVER-STRICTNESS — the gate refuses any named store, `bio` included: MUST FAIL at B1. (d) ARM D, OVER-STRICTNESS — the page reads scratch by DEFAULT (the ternary inverted): MUST FAIL at A2 and A3. RUN 2026-09-24 in worktree /home/user/bio on `e9b21be6` + this row (pristine src/index.mjs 807,869 B sha256 d3dcaee8fa37, restored sha256+cmp identical after every arm): 4/4 AS DECLARED, each arm's failure set COMPLETE (the driver reports undeclared failures as well as missing ones, and its first draft's arm C was silently also breaking B2 — now declared) — (a) the parameter ignored again: 16/18, A1 and A3 alone, A2 GREEN · (b) the gate not run at the route: 14/18, R4, C1, C2 and C3 alone, every arm in sections 1, 2 and 4 green · (c) any named store refused, `bio` included: 16/18, B1 and B2 alone · (d) the default inverted to scratch: 16/18, A2 and A3 alone, A1 GREEN.
 * =========================================================================
 * D-475 · THE `/` SETUP PAGE READS THE NAMESPACE THE CALLER NAMES (C-78.1 reused; D-456, D-461).
 *
 * THE DEFECT, measured. `/` is an HTML route. It answers in the control plane's `fetch` BEFORE `path`, `op` and
 * `spec` exist, so D-456's `namespaceGate` and D-461's `pinnedNamespaceGate` — which run at the op front door a few
 * lines further down — cannot reach it. Its read was written `publicInstanceGroup(env, "bio")`, a literal. So
 * `/?store=scratch` served `bio`'s slug as this copy's own, and `/?store=nonsense` did too: D-456's own defect (a
 * namespace that does not exist silently addressing the real record) surviving at the one route D-456 never saw.
 * Found by D-461's worker; read-only and public, which is why the row is low and not urgent.
 *
 * WHAT WAS DECIDED, and it is a decision rather than a convenience. The row's scope offered two fixes — pass the
 * store through, or PIN the page and refuse `store=scratch` by name. Passing it through is taken, because this page
 * and `op=instancegroup` are ONE READER (`publicInstanceGroup`, whose own header says it is the reader for "the two
 * surfaces that show it to a stranger"), and that op is one of D-461's four exemptions precisely BECAUSE it reads
 * `store=` itself. Pinning the page would have made `store=scratch` mean two things on one copy over one reader —
 * refused on the page, honoured on the op. So the page takes op=instancegroup's rule for an anonymous caller,
 * unchanged and not re-invented: `store=scratch` when named, `bio` otherwise, and a namespace that does not exist
 * refused BY NAME through the very gate (`namespaceGate`) every other caller meets.
 *
 * HOW A WEAKER SUITE WOULD BE FOOLED, stated before what this checks:
 *   (a) ONE-SIDED. A suite asserting only that `/?store=scratch` names scratch's slug passes a page that reads
 *       scratch ALWAYS — which is the same defect pointing the other way, and worse, because the copy's front door
 *       would then name a testing area's group to the public. So A1 and A2 are ASSERTED TOGETHER and the two stores
 *       are seeded with DIFFERENT slugs; control arm D inverts the default and must fail A2 alone among them.
 *   (b) THE FREE EQUALITY. Two stores that both record the installer's slug agree for nothing (CLAUDE.md §5). This
 *       plane is built with NO `INSTANCE_NAME`, so neither store records a group at its first boot, and each is
 *       seeded by the root of trust with a slug of its own. F1 pins that the fixture really is asymmetric before
 *       any page is read; without it every page arm would pass over a copy that reads one store.
 *   (c) A REFUSAL THAT IS MERELY AN ERROR. C1..C3 judge the unknown-namespace refusal by CODE, by C-NUMBER and by
 *       the catalogue's own sentence, IMPORTED from `checks/bio-checks.mjs` and never typed here, and they also
 *       assert the body names NEITHER slug — a 400 that leaked the record's group would pass a status check.
 *   (d) A GATE THAT SWALLOWS EVERYTHING. B1 drives `/?store=bio`, the named-and-valid case, and demands the page,
 *       not a refusal; control arm C is that liar.
 *   (e) A READ THAT WRITES. W1/W2 are the witness: both namespaces' counters read before and after every page arm,
 *       unmoved — and the witness is shown to SEE a write that does land, because an unmoved counter that could
 *       not have moved is no evidence.
 *
 * WHAT THIS CANNOT SEE, stated plainly. It does not run a browser layout engine (it reads served BYTES, as
 * `group-public.test.mjs` does). It does not reach the DEPLOYED plane: a live probe of `/?store=scratch` against an
 * instance is the row's live half and is not this suite's. The route sweep in §0 recognises a store-addressing
 * route by the two tokens that open one in this file — `idFromName(` and `publicInstanceGroup(` — over the
 * pre-gate span WITH COMMENTS BLANKED; it would NOT see a route that opened a store through some third helper
 * whose name contains neither token, and it is printed with its span's byte count so an empty read cannot pass.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { NAMESPACE_CHECKS } from "../checks/bio-checks.mjs";
import { stripComments } from "../scripts/walkfloor.mjs";

const SRC = (f) => fileURLToPath(new URL(`../src/${f}`, import.meta.url));
const ADM = "adm-d475-page-namespace";
const BIO_SLUG = "oak-town", SCRATCH_SLUG = "scratch-harbor";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* NO `INSTANCE_NAME`: neither store records a group at its first boot, so each is seeded separately and the two
   slugs differ. An equality between two stores that both recorded the installer's name would cost nothing. */
let MF;
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-d475-page-namespace", PROBE_TOKEN: "prb-d475-page-namespace",
              VERSION: "0.0.0-d475", GOVERNOR_APPETITE_PER_MIN: "600000",
              CAPTURE_REQUEST_TICK_MS: "3600000", MONITOR_TICK_MS: "3600000" },
  serviceBindings: { SELF: async (request) => MF.dispatchFetch(request) },
  outboundService() { return new Response("no outbound in this suite", { status: 599 }); },
});
MF = mf;

/* THE PAGE AS SERVED — status, content type and the BODY's bytes, never a rendered DOM. */
const page = async (q) => {
  const r = await mf.dispatchFetch(`http://x/${q}`);
  const body = await r.text();
  let j = null; try { j = JSON.parse(body); } catch { j = null; }
  return { status: r.status, type: r.headers.get("content-type") || "", body, j };
};
const api = async (q, body, method) => {
  const r = await mf.dispatchFetch(`http://x/api/?${q}`,
    body === undefined ? { method: method ?? "GET" } : { method: method ?? "POST", body: JSON.stringify(body) });
  let j = null; try { j = await r.json(); } catch { j = null; }
  return { status: r.status, j };
};
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;

/* The ONE element the page states its group in, found by its id WHATEVER its tag — `group-public.test.mjs`'s own
   reader, so a faithful markup this suite did not anticipate is not a failure. NULL-TOLERANT. */
const groupLine = (html) => {
  const body = String(html ?? "");
  const count = (body.match(/\bid="instance-group"/g) || []).length;
  const m = /<([a-z][a-z0-9]*)\b([^>]*\bid="instance-group"[^>]*)>([\s\S]*?)<\/\1>/.exec(body);
  if (!m) return { count, state: null, text: "" };
  return { count, state: /\bdata-group="([a-z]+)"/.exec(m[2])?.[1] ?? null,
           text: m[3].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() };
};
/* WHICH RECORD ANSWERED, judged from the served bytes: the slug named, and the slug NOT named. Both, always —
   a page naming both would pass either half alone. */
const named = (body) => [String(body).includes(BIO_SLUG), String(body).includes(SCRATCH_SLUG)];

try {

/* ======================================================================= 0 · the route corpus, ahead of the gates */
console.log("\n--- 0 · the routes that answer BEFORE the op front door, and which of them address a store ---");
{
  const raw = readFileSync(SRC("index.mjs"), "utf8");
  const code = stripComments(raw);                                   /* M0-155's lexer: a comment is not code */
  const open = code.indexOf("export default {\n  async fetch(req, env) {");
  const gate = code.indexOf("const path = url.pathname.replace(", open);   /* no regex in the anchor: the lexer blanks regex literals too */
  const span = open >= 0 && gate > open ? code.slice(open, gate) : "";
  const routes = [...span.matchAll(/url\.pathname === "([^"]*)"/g)].map((m) => m[1]);
  const opens = [...span.matchAll(/\b(idFromName|publicInstanceGroup)\(/g)].map((m) => m[1]);
  console.log(`         (pre-gate span: ${span.length} B of comment-blanked code; routes ${JSON.stringify([...new Set(routes)])}; `
    + `store-opening calls ${JSON.stringify(opens)})`);
  t("R1: the pre-gate span was found and read, and it really does carry the routes that answer ahead of the op "
    + "front door — a sweep over nothing is not a sweep", [span.length > 500, [...new Set(routes)].sort()],
    [true, ["", "/", "/sign", "/sign/", "/version", "/version/"]]);
  t("R2: EXACTLY ONE call in that span opens a store, and it is the setup page's read — so `/` is the whole of this "
    + "row's corpus, and `/version` and `/sign`, which address no namespace, are correctly left alone",
    [opens, span.includes("setupPage(await publicInstanceGroup(env, pageStore))")], [["publicInstanceGroup"], true]);
  t("R3: and that one read takes no namespace LITERAL any more — the defect was `publicInstanceGroup(env, \"bio\")` "
    + "written into the route (floored on the span, so an empty read cannot pass this for free)",
    [span.length > 500, /publicInstanceGroup\(env, "bio"\)/.test(span)], [true, false]);
  t("R4: the route runs D-456's own gate rather than a second copy of it — one governed span mints NAMESPACE_UNKNOWN",
    [span.includes("const pageNamespace = namespaceGate(url);"),
     (code.match(/function namespaceGate\(url\)/g) || []).length], [true, 1]);
}

/* ======================================================================= the fixture */
console.log("\n--- fixture · two stores, two DIFFERENT slugs (an equality between two identical stores is free) ---");
const seedBio = rP((await api(`op=instancegroupseed&token=${ADM}`, { slug: BIO_SLUG })).j);
const seedScr = rP((await api(`op=instancegroupseed&token=${ADM}&store=scratch`, { slug: SCRATCH_SLUG })).j);
t("F1: the root of trust recorded a DIFFERENT producing group in each namespace, and op=instancegroup reads each "
  + "back from its own store — so a page arm below can say WHICH record answered",
  [seedBio?.ok, seedScr?.ok, rP((await api("op=instancegroup")).j)?.group,
   rP((await api("op=instancegroup&store=scratch")).j)?.group, BIO_SLUG !== SCRATCH_SLUG],
  [true, true, BIO_SLUG, SCRATCH_SLUG, true]);

/* THE WITNESS — the record's counters in both namespaces, read before the page arms and after them. */
const counters = async (store) => {
  const s = rP((await api(`op=stats&token=${ADM}&store=${store}`)).j);
  const inbox = rP((await api(`op=inbox&token=${ADM}&store=${store}`)).j)?.inbox;
  const m = rP((await api(`op=memberlist&token=${ADM}&store=${store}`)).j);
  return { stats: s, inbox: Array.isArray(inbox) ? inbox.length : `unreadable:${JSON.stringify(inbox)}`,
           members: Array.isArray(m) ? m.length : (m?.members?.length ?? `unreadable:${JSON.stringify(m)}`) };
};
const bioBefore = await counters("bio"), scrBefore = await counters("scratch");
t("W0: the witness can READ both namespaces before anything is served (a witness that cannot read is no witness)",
  [typeof bioBefore.stats, typeof bioBefore.inbox, typeof bioBefore.members, typeof scrBefore.inbox],
  ["object", "number", "number", "number"]);

/* ======================================================================= 1 · the accepts-when, both halves together */
console.log("\n--- 1 · `/?store=scratch` reads SCRATCH's slug, and `/` still reads the record's ---");
{
  const s = await page("?store=scratch");
  const g = groupLine(s.body);
  t(`A1: /?store=scratch serves the SCRATCH record's slug '${SCRATCH_SLUG}' in its group line and in its served `
    + `bytes, and names '${BIO_SLUG}' nowhere — the page follows the namespace the caller named`,
    [s.status, s.type.startsWith("text/html"), g.count, g.state, g.text.includes(SCRATCH_SLUG), named(s.body)],
    [200, true, 1, "recorded", true, [false, true]]);

  const b = await page("");
  const gb = groupLine(b.body);
  t("A2: and / with NO store= still serves the RECORD's own slug '" + BIO_SLUG + "' and not the scratch area's — "
    + "the default is unmoved, so the copy's front door does not name a testing area's group to the public",
    [b.status, gb.count, gb.state, gb.text.includes(BIO_SLUG), named(b.body)],
    [200, 1, "recorded", true, [true, false]]);

  const opScr = await api("op=instancegroup&store=scratch");
  const opBio = await api("op=instancegroup");
  t("A3: THE TWO SURFACES OVER ONE READER AGREE — for each namespace the page's group line and a public "
    + "op=instancegroup name the SAME slug, which is why the page was not pinned instead",
    [groupLine(s.body).text.includes(opScr.j?.result?.group ?? "\u0000"), opScr.j?.result?.group,
     groupLine(b.body).text.includes(opBio.j?.result?.group ?? "\u0000"), opBio.j?.result?.group],
    [true, SCRATCH_SLUG, true, BIO_SLUG]);
}

/* ======================================================================= 2 · over-strictness: a valid named store */
console.log("\n--- 2 · `/?store=bio` is the page, not a refusal ---");
{
  const r = await page("?store=bio");
  const g = groupLine(r.body);
  t(`B1: /?store=bio serves the page and names '${BIO_SLUG}' — a namespace that EXISTS is never refused, and the `
    + "gate is not a fence on any named store",
    [r.status, r.type.startsWith("text/html"), g.state, g.text.includes(BIO_SLUG), named(r.body)],
    [200, true, "recorded", true, [true, false]]);
  t("B2: and the page is still served with `no-store`, on the namespace-named request as on the bare one — the bytes "
    + "carry a fact the record can change",
    (await mf.dispatchFetch("http://x/?store=bio")).headers.get("cache-control"), "no-store");
  t("B3: the page is NOT in D-461's pinned set — `/?store=scratch` is answered, never NAMESPACE_PINNED, because its "
    + "one reader's other surface (op=instancegroup) is exempt for reading `store=` itself, which the page now does",
    [(await page("?store=scratch")).status, (await page("?store=scratch")).j?.reason ?? null], [200, null]);
}

/* ======================================================================= 3 · a namespace that does not exist */
console.log("\n--- 3 · an unknown namespace is refused BY NAME at the page too (D-456's gate, C-78.1) ---");
{
  const ROW = NAMESPACE_CHECKS.NAMESPACE_UNKNOWN;                    /* imported, never typed here */
  t("C0: the catalogue really holds the row this section judges by (C-78.1, with a sentence of at least eight words)",
    [!!ROW, ROW?.check, (ROW?.translation ?? "").trim().split(/\s+/).length >= 8], [true, "C-78.1", true]);
  for (const [label, q, why] of [
    ["C1", "?store=nonsense", "a namespace that never existed"],
    ["C2", "?store=Scratch", "a CASE variant — a Durable Object name is an exact string, never folded"],
    ["C3", "?store=", "an EMPTY value, which is the shape a brief's unset variable takes"],
  ]) {
    const r = await page(q);
    t(`${label}: GET /${q} (${why}) -> 400 NAMESPACE_UNKNOWN with C-78.1 and the catalogue's own sentence, and the `
      + "body names NEITHER namespace's slug — nothing was read, and nothing leaked",
      [r.status, r.j?.reason, r.j?.check, r.j?.translation === ROW.translation, named(r.body)],
      [400, "NAMESPACE_UNKNOWN", "C-78.1", true, [false, false]]);
  }
}

/* ======================================================================= 4 · the witness */
console.log("\n--- 4 · nothing the page did wrote to either record ---");
{
  const bioAfter = await counters("bio"), scrAfter = await counters("scratch");
  t("W1: after every page arm above, the counters in BOTH namespaces — stats, inbox, roster — are exactly where "
    + "they were: the page's read is a read",
    [JSON.stringify(bioAfter) === JSON.stringify(bioBefore), JSON.stringify(scrAfter) === JSON.stringify(scrBefore)],
    [true, true]);
  await api("op=knock", { contentText: "D-475: a knock the witness must see land in the record", note: "d475" });
  const bioMoved = await counters("bio"), scrMoved = await counters("scratch");
  t("W2: and the witness SEES a write that does land — a knock filed in `bio` moves bio's inbox and leaves scratch "
    + "alone, so W1's unmoved counters are evidence and not an instrument that cannot move",
    [bioMoved.inbox > bioAfter.inbox, JSON.stringify(scrMoved) === JSON.stringify(scrAfter)], [true, true]);
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nd475-page-namespace: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
