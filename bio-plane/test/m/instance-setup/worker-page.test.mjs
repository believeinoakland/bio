/* The page at the root and its intake, end to end through the real Worker (Miniflare over `src/index.mjs`): the bytes
   served at `/` (R20), the one reader of the group behind them (R1, R3, R4), the tier chooser (R24, R32) and the
   question's intake (R24) written through the plane and read back, and the record browser the page keeps working
   (K102, ruling 4). Converts instance-setup's shares of `bio-plane/test/group-public.test.mjs` (P1–P7, G1, G3–G6),
   `risk-tier.test.mjs` (sections 5 and 6), `inquiry.test.mjs` (section 5) and `browse.test.mjs` (the page's sections
   and its pure functions); the per-credential projections of op=instancegroup are admission's share, and the source
   reads of those suites are dropped (P7). */
import test, { after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";
import { Miniflare } from "miniflare";
import { pageOver } from "./fixture.mjs";
import { deriveInquiryTitle } from "../../../src/record-grammar/index.mjs";
import { RISK_TIERS, riskTierState } from "../../../src/action-grammar/index.mjs";

const SRC = fileURLToPath(new URL("../../../src/index.mjs", import.meta.url));
const sha = (v) => createHash("sha256").update(v).digest("hex");
const ADM = "adm-instance-setup-page", MEM = "mem-instance-setup-page", PRB = "prb-instance-setup-page";
const FIRST = "river-town", SECOND = "harbor-watch", LATE = "late-town";
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";

/* The plane's Store, subclassed: its named Durable Object paths answer the store's own failure envelope (so a silence is
   a real one), and `__judge` runs record-grammar's checkBundle over a document with the grammars the record itself
   answers (record-core R67's `grammars()`, the registrations the plane's modules made at start: what promotion's gate
   and the audit pass), so a document is judged as the record judges it, never by the catalogue's wrapper. */
const FAILING = `import worker, { Store as PlaneStore } from "./index.mjs";
import { recordOf } from "./record-core/index.mjs";
import { checkBundle } from "./record-grammar/index.mjs";
const hex = async (v) => [...new Uint8Array(await crypto.subtle.digest("SHA-256",
  typeof v === "string" ? new TextEncoder().encode(v) : v))].map((b) => b.toString(16).padStart(2, "0")).join("");
export class FailingStore extends PlaneStore {
  async fetch(req) {
    const u = new URL(req.url);
    const path = u.pathname.slice(1);
    if (path === "__failpaths") {
      this.__fail = (u.searchParams.get("paths") || "").split(",").filter(Boolean);
      return Response.json({ ok: true, result: { failing: this.__fail } });
    }
    if (path === "__judge") {
      const { folderName, text } = await req.json();
      const grammars = recordOf(this.ctx).grammars();
      const { findings } = await checkBundle({ folderName, files: new Map([["bundle.md", text]]), sha256: hex,
        sha512: async () => new Uint8Array(64), resolveTarget: () => true }, { grammars });
      return Response.json({ ok: true, result: { grammars: grammars.map((g) => [g.module, [...g.ids]]),
        findings: findings.map((f) => ({ check: f.check, severity: f.severity, message: f.message })) } });
    }
    if ((this.__fail || []).includes(path)) return Response.json({ ok: false, error: "injected failure" }, { status: 500 });
    return super.fetch(req);
  }
}
export default {
  async fetch(req, env, ctx) {
    const u = new URL(req.url);
    if (u.pathname === "/__failpaths")
      return env.STORE.get(env.STORE.idFromName("bio")).fetch("http://ctl/__failpaths?paths=" + (u.searchParams.get("paths") || ""));
    if (u.pathname === "/__judge")
      return env.STORE.get(env.STORE.idFromName("bio")).fetch("http://ctl/__judge", { method: "POST", body: await req.text() });
    return worker.fetch(req, env, ctx);
  },
};
`;

const live = [];
after(async () => { for (const mf of live) await mf.dispose(); });
const planeAt = async ({ name = FIRST, failing = false } = {}) => {
  const mf = new Miniflare({
    modules: true, modulesRoot: "/",
    ...(failing ? { scriptPath: join(dirname(SRC), "instance-setup-failing-store.mjs"), script: FAILING }
                : { scriptPath: SRC, script: readFileSync(SRC, "utf8") }),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: failing ? "FailingStore" : "Store", useSQLite: true } },
    bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, PROBE_TOKEN: PRB, VERSION: "test",
                ...(name === null ? {} : { INSTANCE_NAME: name }) },
  });
  live.push(mf);
  await mf.ready;
  return mf;
};
const served = async (mf) => { const r = await mf.dispatchFetch("https://copy.example/"); return { status: r.status, type: r.headers.get("content-type") || "", body: await r.text() }; };
const api = async (mf, q, init) => {
  const r = await mf.dispatchFetch(`https://copy.example/api/?${q}`, init);
  return { status: r.status, j: await r.json().catch(() => null) };
};
const rP = (j) => (j && typeof j === "object" && "result" in j ? j.result : j);

/* The page's one group line, found by its id: its state, its text with tags stripped, and how many there are. */
const lineOf = (html) => {
  const count = (html.match(/\bid="instance-group"/g) || []).length;
  const m = /<([a-z][a-z0-9]*)\b([^>]*\bid="instance-group"[^>]*)>([\s\S]*?)<\/\1>/.exec(html);
  if (!m) return { count, state: null, text: "" };
  return { count, state: /\bdata-group="([a-z]+)"/.exec(m[2])?.[1] ?? null,
           text: m[3].replace(/<[^>]*>/g, " ").replace(/&middot;/g, "·").replace(/\s+/g, " ").trim() };
};

/* An information document stating no group of its own, so the group its stored bytes name is the store's stamp. */
const infoMd = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@1", `title: "Info ${id}"`,
  "current_state: collected", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "references: []", "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "criticality: supporting",
  "source:", '  locator: "https://records.example.org/memo"', '  authority: "A records office"', '  retrieved: "2026-07-01"',
  "monitoring:", "  enabled: false", "  frequency: none", "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const groupOf = (text) => (/^group: (.*)$/m.exec(String(text ?? "")) || [])[1]?.trim().replace(/^"|"$/g, "") ?? null;

/* The page's script run with the plane behind its fetch; `sent` records each op and body the page asked. */
const until = async (cond, what) => {
  for (let i = 0; i < 500; i++) { if (cond()) return; await new Promise((r) => setTimeout(r, 10)); }
  assert.fail(`the page never reached: ${what}`);
};
const pageOn = async (mf, { hash = "", sent = [] } = {}) => pageOver({ html: (await served(mf)).body, hash,
  fetch: async (url, init) => {
    const u = new URL(url, "https://copy.example");
    sent.push({ op: u.searchParams.get("op"), body: init && init.body ? JSON.parse(init.body) : null });
    return mf.dispatchFetch(u.href, init);
  } });
/* The founder claims the copy on the page and is signed in, as R21 and R22 drive it. */
const founderPage = async (mf, sent = []) => {
  const p = await pageOn(mf, { hash: `#boot=${ADM}`, sent });
  await until(() => p.el("#boot").value === ADM, "the claim form");
  p.el("#pw1").value = "the-founders-password"; p.el("#pw2").value = "the-founders-password";
  await p.el("#do-claim").fire();
  await until(() => p.sandbox.sessionStorage.getItem("bio-session"), "the signed-in panel");
  await until(() => p.el("#go-new").hidden === false, "the contribute capability");
  return { ...p, token: JSON.parse(p.sandbox.sessionStorage.getItem("bio-session")).t, sent };
};

/* ================================================================== R20 R1 R3 R4: the page and the one reader */

test("R20 R1 R3 through the Worker: signed out, the page served at / names the recorded slug in its one group line, and the public op=instancegroup answers that slug and nothing else; a second install names its own and not the first's", async () => {
  const A = await planeAt({ name: FIRST });
  const p = await served(A);
  const g = lineOf(p.body);
  assert.deepEqual([p.status, /text\/html/.test(p.type), g.state, g.text.includes(FIRST), g.count], [200, true, "recorded", true, 1]);
  const r = await api(A, "op=instancegroup");
  assert.deepEqual([r.status, r.j.ok, r.j.store, r.j.result], [200, true, "bio", { ok: true, group: FIRST }]);
  const s = await api(A, "op=instancegroup&store=scratch");
  assert.deepEqual([s.j.store, s.j.result], ["scratch", { ok: true, group: FIRST }]);
  /* nothing invented beside the slug: no display name made from it, no domain */
  assert.equal(g.text.includes("River Town"), false);
  assert.doesNotMatch(g.text, /\b[a-z0-9-]+\.(?:org|com|net|gov|us|io|info)\b/i);
  const B = await planeAt({ name: SECOND });
  const q = await served(B);
  const h = lineOf(q.body);
  assert.deepEqual([h.state, h.text.includes(SECOND)], ["recorded", true]);
  assert.equal(q.body.includes(FIRST), false, "the second install's served bytes, script included, name not the first's slug");
  assert.equal(p.body.includes(SECOND), false);
  assert.equal((await api(B, "op=instancegroup")).j.result.group, SECOND);
});

test("R20 the group line sits inside <main> before the first section the script switches between, and the script never addresses it, so every state of the page, signed in or out, shows it", async () => {
  const p = (await served(await planeAt())).body;
  const at = p.indexOf('id="instance-group"'), main = p.indexOf("<main"), sec = p.indexOf("<section");
  const script = p.slice(p.lastIndexOf("<script>") + 8, p.lastIndexOf("</script>"));
  assert.ok(main > -1 && at > main && at < sec, `main ${main}, line ${at}, first section ${sec}`);
  assert.ok(script.length > 1000);
  assert.doesNotMatch(script, /instance-group|eyebrow/);
});

test("R1 R3 one reader: the group the page shows, the group the public op answers and the group the plane stamps into a document it creates stating none are one value", async () => {
  const A = await planeAt({ name: FIRST });
  const id = "INFO-2026-1631-one-reader";
  const text = infoMd(id);
  const made = rP((await api(A, `op=promote&token=${ADM}`, { method: "POST", body: JSON.stringify({
    bundleId: id, base: null, snapKey: "20260922T101631Z_onereadr",
    meta: { object_type: "information", current_state: "collected", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text, bytes: Buffer.byteLength(text), sha256: sha(text) }], register: [] }) })).j);
  assert.equal(made.ok, true, JSON.stringify(made));
  const stored = rP((await api(A, `op=image&token=${ADM}&id=${id}`)).j)["bundle.md"];
  assert.equal(groupOf(text), null, "the document states no group of its own");
  assert.equal(groupOf(stored), FIRST);
  assert.equal((await api(A, "op=instancegroup")).j.result.group, FIRST);
  assert.ok(lineOf((await served(A)).body).text.includes(groupOf(stored)));
});

test("R20 R3 R4 a store recording no group: the page says so in words and the public op answers group null with the stated absence; once the root of trust seeds a slug, the next page served names it", async () => {
  const C = await planeAt({ name: null });
  const g = lineOf((await served(C)).body);
  assert.equal(g.state, "none");
  assert.match(g.text, /\b(?:no|not|none)\b/i);
  assert.match(g.text, /recorded/i);
  assert.equal(g.text.includes(FIRST), false);
  const r = await api(C, "op=instancegroup");
  assert.deepEqual([r.status, r.j.result.group, Object.keys(r.j.result).sort()], [200, null, ["detail", "group", "ok"]]);
  assert.match(r.j.result.detail, /no producing group is recorded/);
  const seed = await api(C, `op=instancegroupseed&token=${ADM}`, { method: "POST", body: JSON.stringify({ slug: LATE }) });
  assert.equal(rP(seed.j).ok, true, JSON.stringify(seed.j));
  const g2 = lineOf((await served(C)).body);
  assert.deepEqual([g2.state, g2.text.includes(LATE)], ["recorded", true]);
});

test("R20 R3 a store that does not answer: the page is still served and its line says it could not read the group, never 'none' and never a name; the public op answers the silence as STORE_DID_NOT_ANSWER; cleared, both name the slug", async () => {
  const D = await planeAt({ name: FIRST, failing: true });
  const armed = await (await D.dispatchFetch("https://copy.example/__failpaths?paths=instancegrouppublic,groupidentitypublic")).json();
  assert.deepEqual(armed.result.failing, ["instancegrouppublic", "groupidentitypublic"]);
  const p = await served(D);
  const g = lineOf(p.body);
  assert.deepEqual([p.status, g.state, /recorded/i.test(g.text), p.body.includes(FIRST)], [200, "unread", false, false]);
  const r = await api(D, "op=instancegroup");
  assert.deepEqual([r.status, r.j.reason, "result" in r.j && r.j.result !== undefined], [502, "STORE_DID_NOT_ANSWER", false]);
  await D.dispatchFetch("https://copy.example/__failpaths?paths=");
  assert.deepEqual([lineOf((await served(D)).body).state, (await api(D, "op=instancegroup")).j.result.group], ["recorded", FIRST]);
});

/* ================================================================== R24 R32: the tier chooser, through the plane */

test("R32 R24 the tier chooser as a member first meets it: one radio per settable tier in the vocabulary's order, each labelled with the plane's sentence, none checked; with nothing chosen the page reports no choice and states the undetermined sentence", async () => {
  const mf = await planeAt();
  const p = await founderPage(mf);
  const html = p.el("#n-risk-choices").innerHTML;
  const SETTABLE = Object.keys(RISK_TIERS).filter((k) => riskTierState(Number(k)) === Number(k));
  assert.deepEqual(SETTABLE, ["1", "2", "3"]);
  assert.deepEqual([...html.matchAll(/value="([^"]+)"/g)].map((m) => m[1]), SETTABLE);
  assert.deepEqual([...html.matchAll(/<span>([^<]*)<\/span>/g)].map((m) => m[1]), SETTABLE.map((k) => RISK_TIERS[k]));
  assert.doesNotMatch(html, /\bchecked\b/);
  assert.equal(p.ui.chosenRiskTier(), null);
  assert.ok(p.el("#n-risk-unset").textContent.includes(RISK_TIERS.undetermined));
});

test("R24 R32 driven through the form and the real plane: an action saved with tier 1, 2 or 3 chosen reads that tier and the plane's words through op=projection, its bytes stating it; saved with none chosen it reads undetermined, the bytes saying so and no tier 1", async () => {
  const mf = await planeAt();
  const p = await founderPage(mf);
  const save = async (title, tier) => {
    /* the radios the chooser drew, as a browser holds them: each its tier as its value, the chosen one checked */
    for (const k of ["1", "2", "3"]) Object.assign(p.el(`#n-risk-${k}`), { value: k, checked: String(tier) === k });
    p.el("#n-type").value = "action"; p.el("#n-title").value = title; p.el("#n-body").value = "What the member wrote.";
    p.el("#n-cp-undet").checked = true; p.el("#n-cp-named").checked = false;
    p.el("#n-cp-basis").value = "The clerk's index will say which office holds it.";
    const before = p.sent.filter((c) => c.op === "promote").length;
    await p.el("#n-save").fire();
    await until(() => p.sent.filter((c) => c.op === "promote").length > before, `the promote for ${title}`);
    await until(() => p.el("#crumb-id").textContent, `the bundle page for ${title}`);
    assert.equal(p.el("#n-err").textContent, "");
    const id = p.el("#crumb-id").textContent;
    p.el("#crumb-id").textContent = "";
    const proj = rP((await api(mf, `op=projection&token=${p.token}&id=${encodeURIComponent(id)}`)).j);
    const bytes = rP((await api(mf, `op=image&token=${p.token}&id=${encodeURIComponent(id)}`)).j)["bundle.md"];
    return { proj, bytes, sent: p.sent.filter((c) => c.op === "promote").at(-1).body };
  };
  for (const tier of [1, 2, 3]) {
    const { proj, bytes } = await save(`Chose ${tier}`, tier);
    assert.deepEqual([proj.action.risk_tier, proj.action.risk_tier_words, proj.action_risk_tier], [tier, RISK_TIERS[tier], tier]);
    assert.match(bytes, new RegExp(`^risk_tier: ${tier}$`, "m"));
  }
  const none = await save("Chose nothing", null);
  assert.deepEqual([none.proj.action.risk_tier, none.proj.action.risk_tier_words, none.proj.action_risk_tier],
                   ["undetermined", RISK_TIERS.undetermined, null]);
  assert.match(none.bytes, /^risk_tier: undetermined$/m);
  assert.doesNotMatch(none.bytes, /^risk_tier:\s*1\s*$/m);
  assert.match(none.sent.files[0].text, /^action_kind: other$/m);
  /* none of the four actions draws the tier's catalogue row */
  const audit = rP((await api(mf, `op=audit&token=${ADM}&limit=1000`)).j);
  assert.equal(audit.tally?.["C-2.10"] ?? 0, 0);
});

/* ================================================================== R24: the question's intake */

test("R24 a Question through the form: no Title control, record-grammar's first state, the INQ prefix and inquiry@1; the question written under ## Question with no group line, the plane stamping its group, conformant as the record judges it, and projecting the title derived from the question", async () => {
  const mf = await planeAt({ failing: true });
  const p = await founderPage(mf);
  assert.deepEqual([p.ui.FIRST_STATE.inquiry, p.ui.PREFIX.inquiry, p.ui.SCHEMA_OF.inquiry], ["open", "INQ", "inquiry@1"]);
  for (const q of ["Where does the transfer basis come from?", "  A   question\nwith noise  ", "x".repeat(200) + " tail"])
    assert.equal(p.ui.deriveInquiryTitle(q), deriveInquiryTitle(q), JSON.stringify(q));
  p.el("#n-type").value = "inquiry";
  await p.el("#n-type").fire("change");
  assert.deepEqual([p.el("#n-title").hidden, p.el("#n-title-label").hidden], [true, true]);
  assert.equal(p.el("#n-body-label").textContent, "What do you want to know?");
  const QUESTION = "Where does the sewer fund transfer basis come from?";
  p.el("#n-body").value = QUESTION; p.el("#n-loc").value = ""; p.el("#n-auth").value = "";
  await p.el("#n-save").fire();
  await until(() => p.el("#crumb-id").textContent, "the question's bundle page");
  assert.equal(p.el("#n-err").textContent, "");
  const id = p.el("#crumb-id").textContent;
  assert.match(id, /^INQ-\d{4}-\d{4}-where-does-the-sewer-fund-transfer-basis$/);
  const sent = p.sent.filter((c) => c.op === "promote").at(-1).body.files[0].text;
  assert.ok(sent.includes("## Question\n\n" + QUESTION));
  assert.doesNotMatch(sent, /^group:/m, "the page writes no producing group");
  const proj = rP((await api(mf, `op=projection&token=${p.token}&id=${encodeURIComponent(id)}`)).j);
  assert.deepEqual([proj.object_type, proj.title, proj.current_state], ["inquiry", deriveInquiryTitle(QUESTION), "open"]);
  const stored = rP((await api(mf, `op=image&token=${p.token}&id=${encodeURIComponent(id)}`)).j)["bundle.md"];
  assert.equal(groupOf(stored), FIRST);
  /* judged by record-grammar's checkBundle with the grammars the record registered: the inquiry's own among them */
  const judged = rP(await (await mf.dispatchFetch("https://copy.example/__judge", { method: "POST",
    body: JSON.stringify({ folderName: id, text: stored }) })).json());
  assert.ok(judged.grammars.some(([module, ids]) => module === "inquiry-grammar" && ids.includes("C-2.8")), JSON.stringify(judged.grammars));
  assert.ok(judged.grammars.some(([module, ids]) => module === "capture" && ids.includes("C-2.7")), JSON.stringify(judged.grammars));
  assert.deepEqual(judged.findings.filter((f) => f.severity === "error").map((f) => `${f.check}: ${f.message}`), []);
  /* not vacuous: the same document with its ## Question heading taken out is refused by name */
  const broken = rP(await (await mf.dispatchFetch("https://copy.example/__judge", { method: "POST",
    body: JSON.stringify({ folderName: id, text: stored.replace("## Question\n", "") }) })).json());
  assert.ok(broken.findings.some((f) => f.severity === "error"), JSON.stringify(broken.findings));
});

/* ================================================================== the record browser (K102, ruling 4) */

test("K102 the record browser the page keeps working: the served page ships the browse, bundle, intake, revise, inbox, members and enrolment sections, the doors to them, and the notes that publishing needs a signature and history is append-only", async () => {
  const page = (await served(await planeAt())).body;
  for (const id of ["s-browse", "s-bundle", "go-browse", "s-new", "s-edit", "s-inbox", "s-members", "s-enroll", "lwho"])
    assert.ok(page.includes(`id="${id}"`), id);
  for (const words of ["append-only", "Paste the signature from the signing page.", "Where a key comes from", 'href="/sign"'])
    assert.ok(page.includes(words), words);
});

test("K102 the served script's pure functions: splitFm reads the frontmatter, mdRender renders headings, lists, bold and code and escapes markup; describeKey accepts a ratification key line by its label and refuses the release key by name, a private key, prose and an empty box", async () => {
  const mf = await planeAt();
  const p = await pageOn(mf);
  const doc = "---\ntitle: \"A title\"\ncurrent_state: verified\n---\n\n## Heading\n\nBody **bold** and `code`.\n\n- one\n- two\n";
  const { fm, body } = p.ui.splitFm(doc);
  assert.deepEqual([fm.title, fm.current_state], ["A title", "verified"]);
  const html = p.ui.mdRender(body);
  for (const want of ["<h2>Heading</h2>", "<li>one</li>", "<b>bold</b>", "<code>code</code>"]) assert.ok(html.includes(want), want);
  assert.ok(p.ui.mdRender("<img src=x>").includes("&lt;img"));
  assert.doesNotMatch(p.ui.mdRender("<img src=x>"), /<img/);
  const dk = p.ui.describeKey;
  const ratify = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKGAY test-ratify";
  assert.deepEqual([dk(ratify).ok, dk(ratify).label], [true, "test-ratify"]);
  assert.equal(dk("  ssh-ed25519   AAAAC3Nz   lbl  ").ok, true);
  assert.match(dk("ssh-ed25519 AAAAC3Nz bio-release").why, /RELEASE key/);
  for (const bad of ["BIOKEY-RAW1.bio-ratify.abc", "here is my key", ""]) assert.equal(dk(bad).ok, false, JSON.stringify(bad));
});
