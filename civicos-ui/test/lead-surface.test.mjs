/* D-194 — A MEMBER'S LEAD, DRIVEN THROUGH THE PAGE AGAINST THE REAL PLANE: a member writes a lead, records a look
 * that found nothing, and sees LOOKED_ABSENT against it — on the lead's own page and in the list — and the lead is
 * shared only by the member's own act.
 *
 * DESIGN: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §5. The plane half is MK-4's (IC-135, IC-136) and REC-129's
 * (IC-143): `op=lead`, `op=leadlook`, `op=leadread`, `op=leadshare` and `op=frontier&level=internet`. This item
 * changes none of them.
 *
 * ================= HOW A LIAR WOULD MAKE THIS SUITE GREEN =================
 *  (a) A PAGE THAT DRAWS THE STATE IT WAS TOLD TO — "LOOKED_ABSENT" rendered because the member clicked it, whether or
 *      not the plane recorded anything. So every state the page draws is compared to what the plane answers when asked
 *      DIRECTLY (`op=leadread` and `op=frontier`, read here with the member's own token), and the look must be on the
 *      WIRE as `op=leadlook` naming the lead the plane minted.
 *  (b) A LEAD WRITTEN BY THE PAGE — an id or an author the page made up. So the lead's id is the one `op=lead` answered
 *      on the wire, and its author is the plane's stamp, compared to `op=whoami`.
 *  (c) A SHARE AS A SIDE EFFECT — the write or the look quietly sharing the lead. So the wire is read for every request
 *      the page made before the member pressed the share control, and a second member is asked, through the plane,
 *      whether they can read it: they must be answered as for a lead that does not exist until the author shares it.
 *  (d) A FORM THAT GUESSES — the words, the place to look, the outcome of a look: each asserted empty and unchosen.
 *  (e) A REFUSAL RE-WORDED — the empty lead and the look with no outcome are sent to the plane, and what the page draws
 *      is asserted to be the plane's own translation, byte for byte (DEC-49).
 *  (f) THE PLANE'S VOCABULARY IMPROVED — the page's words for a state are its MIRROR of `OBSERVATION_STATES`; this
 *      suite imports the plane's table and fails if a key is missing there or a sentence is not the plane's own.
 *
 * WHY IT IS REAL: the plane is `bio-plane/src/index.mjs` under miniflare; every act goes through the page's own markup
 * (`onchange` and `onclick` strings read out of what it rendered, run in the page's context). WHAT IT CANNOT SEE: a real
 * browser's layout; a lead shared into a project whose look found a capture in another project the reader has not
 * joined (the plane's own `lead.test.mjs` owns that fence); nothing is live (no deploy is this item's).
 *
 * NEGATIVE CONTROL: `node civicos-ui/test/lead-surface.control.mjs` from the repo root — every arm ALONE, each anchor
 * matched EXACTLY ONCE, restored by cp from a per-arm pristine copy and verified by sha256 AND cmp. The row's own arm
 * stubs `op=lead` and the write-and-look arm fails by name. RUN 2026-09-25 by the D-194 worker, the FIRST run and unamended: 8/8 AS DECLARED against app.html 0c39845f92eaa2d5…
 * (1,650,102 B), IDENTICAL after every arm by sha256 AND cmp, driver exit 0. BASELINE GREEN 48/0 · (A) RED 10/15 · (B) RED
 * 47/1 · (C) RED 45/3 · (D) RED 46/2 · (E) RED 46/2 · (F) RED 43/5 · (G) GREEN 48/0. Every RED arm failed at the lines it
 * named and spared the ones it declared; (A), the row's own, ended at the budgeted look wait (M0-107) AFTER both
 * write-and-look arms had failed by name, and the foot line was reached.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: shared, for its side effect. */
import fs from "fs";
import vm from "vm";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";
import { until, budgetAssert } from "../../bio-plane/test/budget.mjs";   /* M0-107: a wait whose expiry is NOT MEASURED */
import { OBSERVATION_STATES } from "../../bio-plane/src/airun.mjs";

let pass = 0, fail = 0;
const ok = (label, cond, detail) => {
  if (cond) { console.log(`  PASS  ${label}`); pass++; }
  else { console.log(`  FAIL  ${label}${detail ? `\n         ${detail}` : ""}`); fail++; }
};
let mf = null;
const finish = async (code) => {
  console.log(`\nlead-surface.test.mjs: ${pass} pass, ${fail} fail`);
  if (mf) await mf.dispose();
  process.exit(code ?? (fail ? 1 : 0));
};

const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try { ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch (e) {
  console.error("lead-surface: the real plane could not be started — miniflare is not installed. Run `npm ci` in bio-plane/.");
  process.exit(1);
}
const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX.pathname,
  script: fs.readFileSync(IDX, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "d194-instance", ADMIN_TOKEN: "adm-d194", MEMBER_TOKEN: "mem-d194",
              PROBE_TOKEN: "prb-d194", DAEMON_TOKEN: "dmn-d194", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000" },
});
const rP = (j) => (j && typeof j === "object" && "result" in j) ? j.result : j;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const must = async (what, r) => {
  if (!r || r.ok !== true) { ok(`FIXTURE: ${what}`, false, JSON.stringify(r).slice(0, 400)); await finish(1); }
  return r;
};
const E = encodeURIComponent;

/* ============================================================
   0. THE GROUND — iris writes the lead; jon is a member she has not shared it with
   ============================================================ */
const member = async (id, caps) => {
  const add = await must(`memberadd ${id}`, await POST("op=memberadd&token=adm-d194",
    { memberId: id, cover: `cover for ${id}`, role: id === "jon" ? "member" : "admin", capabilities: caps }));
  await must(`enroll ${id}`, await POST("op=enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-1` }));
  const lg = await POST("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg?.token) { ok(`FIXTURE: login ${id}`, false, JSON.stringify(lg)); await finish(1); }
  return lg.token;
};
const IRIS = await member("iris", ["contribute", "publish"]);
/* A second administrator first: a group's second member must be one (ADMINS_FIRST). */
await member("kai", ["contribute"]);
const JON = await member("jon", ["contribute"]);
const irisMe = await GET(`op=whoami&token=${IRIS}`);
const jonMe = await GET(`op=whoami&token=${JON}`);

/* A project iris owns, which jon joins — so the share has somewhere to land and someone to reach. */
const NOW = "2026-07-01T00:00:00Z";
const projectMd = ["---", "object_type: project", "schema: project@1", 'title: "Oversight"',
  "current_state: investigating", "prior_state: null", `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: d194-instance", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", 'objective: "Follow what we were told."', "---", "", "## Thesis Summary", "",
  "A project.", "", "## Open Questions", "", "## Ruled Out", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const sha = async (t) => Buffer.from(await webcrypto.subtle.digest("SHA-256", new TextEncoder().encode(t))).toString("hex");
const pj = await POST(`op=promote&token=${IRIS}`, { base: null, snapKey: "proj-d194-1",
  files: [{ path: "bundle.md", text: projectMd, bytes: projectMd.length, sha256: await sha(projectMd) }], register: [],
  meta: { object_type: "project", group: "d194-instance", title: "Oversight", current_state: "investigating",
          created: NOW, last_updated: NOW } });
if (!pj?.ok || typeof pj.bundleId !== "string") { ok("FIXTURE: create the project", false, JSON.stringify(pj)); await finish(1); }
const PROJ = pj.bundleId;
await must("invite jon", await GET(`op=projectinvite&token=${IRIS}&projectId=${E(PROJ)}&handle=jon`));
const joined = await POST(`op=projectjoin&token=${JON}&projectId=${E(PROJ)}`);
if (!joined || joined.ok === false) { ok("FIXTURE: jon joins the project", false, JSON.stringify(joined)); await finish(1); }

/* ============================================================
   THE PAGE — app.html in a vm, its fetch routed to the real plane; every request recorded
   ============================================================ */
const APP = appScript();
const BLOCK = (() => {
  const a = APP.indexOf("/*__LEADS_START__*/"), b = APP.indexOf("/*__LEADS_END__*/");
  return a >= 0 && b > a ? APP.slice(a, b) : "";
})();
function page(hash, token, me) {
  const WIRE = [];
  const els = new Map();
  function el() {
    const e = { classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } }, style: {}, dataset: {},
      value: "", _html: "", textContent: "", scrollTop: 0, disabled: false, addEventListener() {},
      querySelector: () => el(), querySelectorAll: () => [], insertAdjacentHTML() {}, focus() {}, click() {}, remove() {},
      setAttribute() {}, onclick: null };
    Object.defineProperty(e, "innerHTML", { get() { return e._html; }, set(v) { e._html = v; } });
    return e;
  }
  const $$ = (s) => { if (!els.has(s)) els.set(s, el()); return els.get(s); };
  let HASH = hash || "";
  const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
    Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder, crypto: webcrypto, Blob: class {}, IntersectionObserver: undefined,
    setInterval: () => 1, clearInterval() {}, setTimeout: (fn) => { fn(); return 1; }, clearTimeout() {},
    requestAnimationFrame: (fn) => fn(), matchMedia: () => ({ matches: false }),
    document: { querySelector: $$, querySelectorAll: () => [], addEventListener() {}, documentElement: { setAttribute() {} },
      getElementById: () => el(), hidden: false, createElement: () => el(), body: { appendChild() {} } },
    location: { protocol: "https:", href: "https://civicos.example/" + (hash || ""),
                get hash() { return HASH; }, set hash(v) { HASH = v; } },
    history: { pushState() {}, back() {}, replaceState() {} },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    window: { addEventListener() {}, open: () => null },
    fetch: async (u, opts) => {
      const url = new URL(u, "http://x");
      const params = Object.fromEntries(url.searchParams.entries());
      let body = null;
      try { body = opts && opts.body ? JSON.parse(opts.body) : null; } catch (_) { body = null; }
      WIRE.push({ op: params.op, params, body, method: (opts && opts.method) || "GET" });
      return mf.dispatchFetch(url.toString(), opts);
    } };
  ctx.globalThis = ctx; vm.createContext(ctx);
  vm.runInContext(APP + `;globalThis.__U = { PLANE, get LDS(){ return LDS; }, LEAD_STATE_WORDS, LEAD_LOOK_CHOICES,
    SURFACES, renderLeads, ldOpen, leadRouteFromHash, go };`, ctx);
  const U = ctx.__U;
  U.PLANE.base = "http://x";
  if (token) { U.PLANE.token = token; U.PLANE.session = true; U.PLANE.me = me; }
  const html = (sel) => $$(sel)._html;
  /* Run a control's own handler string, as the browser would, with `this` standing for the control. */
  const run = async (code, value) => {
    const fn = vm.runInContext(`(function(){ return (${code}); })`, ctx);
    await fn.call({ value, checked: value });
  };
  return { ctx, U, WIRE, html, run, get hash() { return HASH; } };
}
const WAIT_MS = 8000;
const tb = (label, got, want) => ok(label, JSON.stringify(got) === JSON.stringify(want), JSON.stringify(got));
const drawn = async (name, pred) => {
  const w = await until(() => { try { return !!pred(); } catch (_) { return false; } }, WAIT_MS);
  if (!budgetAssert(tb, name, w, WAIT_MS, "every later assertion of this suite, each reading a page this wait did not see drawn"))
    await finish();
};
const unesc = (s) => String(s).replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
/* The handler string on the one control whose markup matches `re` — a control drawn twice, or not at all, fails. */
const handler = (h, attr, re) => {
  const all = [...String(h).matchAll(new RegExp(`<[^>]*${attr}="([^"]*)"[^>]*>`, "g"))]
    .filter((m) => re.test(m[0])).map((m) => unesc(m[1]));
  return all.length === 1 ? all[0] : null;
};
const strip = (h) => unesc(String(h).replace(/<[^>]*>/g, " ")).replace(/&middot;/g, "·").replace(/&rsquo;/g, "’")
  .replace(/\s+/g, " ").trim();
const flat = (s) => String(s).replace(/\s+/g, " ").trim();
const statesOn = (h) => [...String(h).matchAll(/data-lead-state="([^"]*)"/g)].map((m) => m[1]);
const field = async (P, id, value, attr = "onchange") => {
  const code = handler(P.html("#content"), attr, new RegExp(`id="${id}"`));
  ok(`the control #${id} is drawn exactly once, with a handler`, !!code);
  if (code) await P.run(code, value);
};

console.log("\n--- 1. the place: the rail reaches it, and the registry declares it ---");
const M = page("", IRIS, irisMe);
ok("REACH: the leads block was found and is the real one",
   BLOCK.length > 4000 && BLOCK.includes("function ldListHtml") && BLOCK.includes("function ldLook"), String(BLOCK.length));
const S = JSON.parse(JSON.stringify(M.U.SURFACES.lead || null));
tb("the surface registry declares the lead surface's routes", S && S.routes, ["screen:leads", "hash:leads", "hash:lead"]);
tb("and every lead op it reaches, plus the frontier it lists from", S && [...S.reads].sort(),
   ["frontier", "lead", "leadlook", "leadread", "leadshare"]);
await M.U.go("leads");
await drawn("the leads screen is drawn from the plane's list", () => M.U.LDS && !M.U.LDS.busy);
const list0 = M.html("#content");
const listCall0 = M.WIRE.find((w) => w.op === "frontier");
tb("the list is the plane's internet-level frontier, asked for by the page", listCall0 && listCall0.params.level, "internet");
const direct0 = await GET(`op=frontier&level=internet&token=${IRIS}`);
ok("an empty list says so in the PLANE's words (its stated cause), not the page's",
   direct0?.empty?.says && flat(strip(list0)).includes(flat(direct0.empty.says)), JSON.stringify(direct0?.empty));

console.log("\n--- 2. nothing prefilled (DEC-69) ---");
const wordsArea = /<textarea[^>]*id="lead-words"[^>]*>([\s\S]*?)<\/textarea>/.exec(list0);
const locInput = /<input[^>]*id="lead-locator"[^>]*>/.exec(list0);
ok("NOTHING PREFILLED: the lead's words are empty", !!wordsArea && wordsArea[1] === "", wordsArea && wordsArea[1]);
ok("NOTHING PREFILLED: where to look is empty", !!locInput && /value=""/.test(locInput[0]) && !/placeholder=/.test(locInput[0]),
   locInput && locInput[0]);

console.log("\n--- 3. a refusal is the plane's own (DEC-49) ---");
await M.run(handler(list0, "onclick", /id="lead-write"/));
const emptyCall = M.WIRE.filter((w) => w.op === "lead");
const directEmpty = await POST(`op=lead&token=${IRIS}`, { words: "" });
ok("AN EMPTY LEAD GOES TO THE PLANE: the page refused nothing itself — the write was sent",
   emptyCall.length === 1 && emptyCall[0].method === "POST", JSON.stringify(emptyCall));
ok("and the page draws the plane's translation of LEAD_NO_WORDS, verbatim",
   directEmpty?.code === "LEAD_NO_WORDS" && typeof directEmpty.translation === "string"
   && M.html("#content").includes(esc1(directEmpty.translation)), JSON.stringify(directEmpty));

console.log("\n--- 4. WRITE AND LOOK: a member writes a lead, records a look, and sees LOOKED_ABSENT against it ---");
const WORDS = "I was told the contract was amended in March; nobody has seen the amendment.";
const WHERE = "the Clerk's March agenda";
await field(M, "lead-words", WORDS);
await field(M, "lead-locator", WHERE);
await M.run(handler(M.html("#content"), "onclick", /id="lead-write"/));
const wrote = M.WIRE.filter((w) => w.op === "lead").pop();
/* Waited for by the page having FINISHED reading, not by it having read a lead: a page that drew a refusal is a
   page drawn, and the arms below are what say whether it drew the right thing. */
await drawn("the new lead's page is drawn", () => M.U.LDS && M.U.LDS.mode === "one" && !M.U.LDS.busy);
const LEAD = M.U.LDS && M.U.LDS.id;
ok("WRITE AND LOOK: the write is `op=lead` on the wire, carrying the member's words and place, and NO author field",
   !!wrote && wrote.body && wrote.body.words === WORDS && wrote.body.locator === WHERE && !("author" in wrote.body),
   JSON.stringify(wrote && wrote.body));
const read1 = await GET(`op=leadread&id=${E(LEAD || "")}&token=${IRIS}`);
ok("WRITE AND LOOK: the plane holds the lead the page now shows — its id, the member's words, and its author stamped by the plane as iris",
   read1?.ok === true && /^LEAD-/.test(LEAD || "") && read1.words === WORDS && read1.locator === WHERE
   && read1.author === (irisMe.memberId || irisMe.member || "iris"), JSON.stringify(read1).slice(0, 300));
ok("the page moved to the lead's own address", M.hash === "#lead/" + LEAD, M.hash);
const one1 = M.html("#content");
tb("WRITE AND LOOK: before any look the page draws the plane's state, NEVER_LOOKED", statesOn(one1), [read1?.state]);
ok("and the plane's own sentences about it: what the write said, and what the read says",
   one1.includes(esc1(read1?.says || "\u0000")) && one1.includes(esc1(M.U.LDS.written?.says || "\u0000")));
/* No outcome is chosen for the member. */
const radios = [...one1.matchAll(/<input type="radio" name="lead-look-state"[^>]*>/g)].map((m) => m[0]);
tb("NOTHING PRESELECTED: the look offers exactly the plane's four outcomes", radios.map((r) => /value="([^"]*)"/.exec(r)[1]),
   ["LOOKED_ABSENT", "LOOKED_INDETERMINATE", "partial", "PRESENT"]);
ok("NOTHING PRESELECTED: and none is checked", radios.length === 4 && radios.every((r) => !/\bchecked\b/.test(r)));
/* A look with no outcome goes to the plane, whose refusal is drawn. */
await M.run(handler(one1, "onclick", /id="lead-look"/));
const noState = await POST(`op=leadlook&token=${IRIS}`, { lead: LEAD, state: "" });
ok("A LOOK WITH NO OUTCOME GOES TO THE PLANE and the page draws its LEAD_LOOK_STATE translation verbatim",
   noState?.code === "LEAD_LOOK_STATE" && M.html("#content").includes(esc1(noState.translation)), JSON.stringify(noState).slice(0, 300));
/* The look that found nothing. */
const absentRadio = handler(M.html("#content"), "onchange", /name="lead-look-state"[^>]*value="LOOKED_ABSENT"/);
ok("the LOOKED_ABSENT choice is drawn once, with a handler", !!absentRadio);
if (absentRadio) await M.run(absentRadio, true);
await field(M, "lead-look-detail", "Read the March agenda and minutes; no amendment is listed.");
await M.run(handler(M.html("#content"), "onclick", /id="lead-look"/));
const looked = M.WIRE.filter((w) => w.op === "leadlook").pop();
ok("WRITE AND LOOK: the look is `op=leadlook` on the wire, naming the lead the plane minted and the state the member chose",
   !!looked && looked.body && looked.body.lead === LEAD && looked.body.state === "LOOKED_ABSENT" && !("looker" in looked.body),
   JSON.stringify(looked && looked.body));
await drawn("the lead's page is redrawn after the look", () => M.U.LDS && !M.U.LDS.busy && M.U.LDS.read && M.U.LDS.read.looks.length === 1);
const read2 = await GET(`op=leadread&id=${E(LEAD)}&token=${IRIS}`);
const one2 = M.html("#content");
ok("WRITE AND LOOK: the plane records the look, LOOKED_ABSENT, by iris", read2?.state === "LOOKED_ABSENT"
   && (read2.looks || []).length === 1 && read2.looks[0].state === "LOOKED_ABSENT", JSON.stringify(read2?.looks));
tb("WRITE AND LOOK: and the member SEES LOOKED_ABSENT against the lead — as where it stands, and on the look itself",
   statesOn(one2), ["LOOKED_ABSENT", "LOOKED_ABSENT"]);
ok("in the plane's own words for that state", strip(one2).includes(OBSERVATION_STATES.LOOKED_ABSENT));
/* The list the rail opens. */
await M.run(handler(one2, "onclick", /renderLeads\(\)/));
await drawn("the list is drawn again", () => M.U.LDS && M.U.LDS.mode === "list" && !M.U.LDS.busy && M.U.LDS.list);
const list1 = M.html("#content");
const front1 = await GET(`op=frontier&level=internet&token=${IRIS}`);
const frow = (front1?.looked || []).find((r) => r.lead === LEAD);
const rowHtml = (new RegExp(`<div class="card" data-lead-row="${LEAD}"[\\s\\S]*?</div></div>`).exec(list1) || [""])[0];
ok("WRITE AND LOOK: the plane's frontier lists the lead as LOOKED_ABSENT, found nothing",
   frow && frow.state === "LOOKED_ABSENT" && frow.found_nothing === true, JSON.stringify(front1?.looked));
tb("WRITE AND LOOK: and the list draws LOOKED_ABSENT against that lead, once", statesOn(rowHtml), ["LOOKED_ABSENT"]);
const boundP = (/<p class="subj-note" data-lead-bound>([^<]*)<\/p>/.exec(list1) || [])[1] || "";
ok("THE BOUND IS THE RECORD'S: the list states the limit op=frontier published, and whether it cut",
   Number.isFinite(front1?.limit) && boundP.includes(`a bound of ${front1.limit}.`)
   && (front1.truncated === true) === /was cut/.test(boundP), boundP);
ok("the list's row opens the lead it names", handler(list1, "onclick", new RegExp(`data-lead-row="${LEAD}"`)) === `ldOpen('${LEAD}')`);

console.log("\n--- 5. shared only by the member's act ---");
ok("NO SHARE AS A SIDE EFFECT: writing, looking and listing sent no `op=leadshare`",
   M.WIRE.length > 5 && !M.WIRE.some((w) => w.op === "leadshare"), JSON.stringify(M.WIRE.map((w) => w.op)));
const jonBefore = await GET(`op=leadread&id=${E(LEAD)}&token=${JON}`);
ok("UNSHARED: jon, a joined member of iris's project, is answered as for a lead that does not exist",
   jonBefore?.code === "LEAD_NOT_FOUND", JSON.stringify(jonBefore).slice(0, 200));
const J = page("#lead/" + LEAD, JON, jonMe);
J.U.leadRouteFromHash();
await drawn("jon's page at the lead's address is drawn", () => J.U.LDS && !J.U.LDS.busy);
const jOne = J.html("#content");
ok("and jon's page draws the plane's refusal verbatim — nothing of the lead's words, nothing of its state",
   jOne.includes(esc1(jonBefore.translation)) && !jOne.includes(esc1(WORDS)) && statesOn(jOne).length === 0, strip(jOne).slice(0, 300));
await J.U.go("leads");
await drawn("jon's list is drawn", () => J.U.LDS && J.U.LDS.mode === "list" && !J.U.LDS.busy && J.U.LDS.list);
ok("and jon's list does not carry it", !J.html("#content").includes(LEAD));
/* Iris shares it, by the page's own control. */
await M.U.ldOpen(LEAD);
await field(M, "lead-share-project", PROJ);
await M.run(handler(M.html("#content"), "onclick", /id="lead-share"/));
const shared = M.WIRE.filter((w) => w.op === "leadshare");
ok("THE MEMBER'S ACT: one `op=leadshare`, naming the lead and the project the member typed",
   shared.length === 1 && shared[0].body.lead === LEAD && shared[0].body.project === PROJ && !("sharer" in shared[0].body),
   JSON.stringify(shared));
await drawn("the lead's page is redrawn after the share", () => M.U.LDS && !M.U.LDS.busy && M.U.LDS.read
  && (M.U.LDS.read.shared_to || []).length === 1);
ok("the page lists the project it is shared to", new RegExp(`data-lead-share="${PROJ}"`).test(M.html("#content")));
const jonAfter = await GET(`op=leadread&id=${E(LEAD)}&token=${JON}`);
ok("SHARED: jon now reads it, LOOKED_ABSENT", jonAfter?.ok === true && jonAfter.state === "LOOKED_ABSENT", JSON.stringify(jonAfter).slice(0, 200));

console.log("\n--- 6. the page's words for a state are the plane's ---");
const W = JSON.parse(JSON.stringify(M.U.LEAD_STATE_WORDS));
const storeSrc = fs.readFileSync(new URL("../../bio-plane/src/store.mjs", import.meta.url), "latin1");
const outcomes = JSON.parse(((/static LEAD_LOOK_OUTCOMES = (\[[^\]]*\]);/.exec(storeSrc) || [])[1] || "null"));
ok("REACH: the plane's outcome list was read off store.mjs and is non-empty", Array.isArray(outcomes) && outcomes.length === 4,
   JSON.stringify(outcomes));
tb("the look's choices are the plane's outcomes, in its order", JSON.parse(JSON.stringify(M.U.LEAD_LOOK_CHOICES)), outcomes);
const keys = Object.keys(W);
ok("MIRROR: every state the page has words for is a state the plane defines, and every state a lead can carry has words",
   keys.length === 5 && keys.every((k) => k in OBSERVATION_STATES) && [...(outcomes || []), "NEVER_LOOKED"].every((k) => k in W),
   JSON.stringify(keys));
const off = keys.filter((k) => !(String(OBSERVATION_STATES[k] || "").startsWith(W[k]) && W[k].length > 10));
ok("MIRROR: each of the page's sentences IS the plane's sentence (the plane may continue past it; the page may not differ) — off: "
   + (off.length ? off.join(", ") : "none"), off.length === 0);

/* app.html's own `esc`, character for character: it escapes & < > " and NOT the apostrophe. */
function esc1(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
await finish();
