/* NEGATIVE CONTROL: (RUN 2026-09-23 by the D-182 worker; each arm ALONE, restored from a per-arm pristine copy and verified by sha256 AND cmp; baseline 31 pass / 0 fail before and after) (A) THE ROW'S CONTROL, restore the default of 1 - in checks/bio-checks.mjs riskTierState return 1 instead of 'undetermined' for an absent/undetermined tier -> 5 FAIL, declared and actual: the no-tier arms fail BY NAME ("a stated undetermined READS UNDETERMINED through op=projection", "an action whose bytes carry no tier READS UNDETERMINED through op=projection", both words arms, and the riskTierState unit arm); the member's-2 and over-strictness arms stayed green, as declared. (B) THE WRITER'S DEFAULT - in src/setup.mjs write "risk_tier: 1" again -> 3 FAIL: the source arm and both driven-writer arms. (C) THE LIAR the row names, a read rendering UNDETERMINED whatever is stored - in src/store.mjs #actionDerived set risk_tier to the constant "undetermined" -> 1 FAIL, "a member's act sets 2, and op=projection reads 2"; every no-tier arm stays GREEN over the constant, which is declared and is why sections 2 and 3 also read the STORED column and bytes. Also found while writing, not by an arm: the first draft's risk:1 search arm was VACUOUS (it read a result key the answer does not carry, so it passed over an empty list); the risk:2 positive beside it caught that and the key was corrected. */
/* NEGATIVE CONTROL, D-483's section 6: (RUN 2026-09-24 by the D-483 worker; each arm ALONE in src/setup.mjs, restored from a per-arm pristine copy and verified by sha256 AND cmp at 96708072...; baseline 58 pass / 0 fail before and after every arm) (A) THE ROW'S CONTROL, default the group to 1 - render ' checked' on SETTABLE_TIERS[0] -> 1 FAIL, declared and actual: "THE DEFAULT IS UNSET: no rendered radio carries a checked attribute". The write arms stayed GREEN, AS DECLARED and not as slack: the driver supplies :checked itself, so markup cannot reach them - which is why arm B exists. (B) THE SAME LIE IN THE WRITER, chosenRiskTier() returning 1 when nothing is checked -> 5 FAIL by name: "reports NO CHOICE" and all four unset arms through the op; the three CHOSEN-tier arms stayed green, the over-strictness direction. (C) HARD-CODED LABELS, the row's second liar - render a literal 'file freely'/'file with caution'/'do not file without counsel' instead of RISK_TIERS[k] -> 2 FAIL: the literal arm and the mechanism arm. THE FINDING WORTH KEEPING, a surprising green: the BEHAVIOURAL label arm ("each label is the PLANE's sentence") stayed GREEN under C, because a hand copy agrees with the vocabulary for free (WORKER.md: an equality that costs nothing is not evidence). A suite holding only that arm would have gone green over a page that had stopped reading the vocabulary at all, which is the drift this row exists to prevent - so the textual and mechanism arms are the load-bearing ones and the behavioural arm is the one that proves they are about a control a member actually sees. */
/* D-182 (BIO_Case_Making_v0_1.md §2, "`risk_tier`, RULED 2026-09-21 by BOB #21"): an action's risk tier gains
 * UNDETERMINED, and the plane publishes the three words.
 *
 * WHAT WAS TRUE BEFORE THIS SUITE EXISTED. Both intake writers — `civicos-ui/app.html`'s `mdFor` and
 * `src/setup.mjs`'s — wrote `risk_tier: 1` into EVERY action they created, and C-2.10 admitted only 1, 2 or 3,
 * so the record had no way to say "nobody assessed this". Tier 1 means FILE FREELY (Roadmap §8, Bob's words),
 * so every action a member created told them it was safe to file with no one having looked: an overclaim on
 * the one field that carries legal exposure. D-130's counterparty, one field over, was the same class.
 *
 * WHAT THIS SUITE HOLDS THE ITEM TO, each in the direction that fails:
 *
 *   1. THE VALUE. `undetermined` is a tier the gate accepts, and so is its ABSENCE (both read undetermined);
 *      1, 2 and 3 stay; anything else is refused by C-2.10 BY NAME. Over-strictness is asserted beside it: a
 *      member's stated 2 must still pass.
 *   2. THROUGH THE OPS, A NO-TIER ACTION READS UNDETERMINED — and the arm reads the STORED ROW too, because the
 *      liar the row names is a surface rendering UNDETERMINED over a stored 1. The document's own bytes (op=image)
 *      and the projection column are both asked.
 *   3. A MEMBER'S ACT SETS 2 and it reads *file with caution*, in the plane's words and not a surface's.
 *   4. THE WORDS ARE PUBLISHED, by op=affordances, and are the catalogue's own map (identity, not equality).
 *   5. NOTHING WRITES 1 BY DEFAULT: setup.mjs's writer, driven, writes undetermined; neither writer's SOURCE
 *      carries the old default.
 *
 * WHAT IT CANNOT SEE. A row written BEFORE this landed at the old default reads 1, because its bytes say 1, and
 * nothing in the record distinguishes a stated 1 from a defaulted one; the row forbids back-filling an
 * assessment nobody made, so none is. CORRECTED 2026-09-24 by REC-189: this said no fence refused a MACHINE
 * credential's promote writing a determined tier. One does now — C-32.19 MACHINE_CANNOT_SET_RISK_TIER, in
 * `promote`'s action block — and `machine-fences.test.mjs` block (xiv) drives it; this suite's member arm is a
 * signed-in session for that reason.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash, webcrypto } from "node:crypto";
import { checkBundle, RISK_TIERS, riskTierState } from "../checks/bio-checks.mjs";
import { VOCABULARIES } from "../src/affordances.mjs";

const shaHex = async (v) => createHash("sha256")
  .update(typeof v === "string" ? Buffer.from(v, "utf8") : Buffer.from(v)).digest("hex");
const sha512Hex = async (b) => new Uint8Array(await webcrypto.subtle.digest("SHA-512", b));
const sha = (v) => createHash("sha256").update(v).digest("hex");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const NL = "\n";
const NOW = "2026-07-24T00:00:00Z";

/* A conformant action in every respect EXCEPT the tier line(s), which each case supplies. */
const actionMd = (id, tierLines) => [
  "---", `id: ${id}`, "object_type: action", "schema: action@1",
  'title: "Records request"', "current_state: planned", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []",
  "action_kind: cpra_request", ...tierLines,
  "counterparty:", "  state: named", "  name: City Clerk",
  "---", "",
  "## Plan", "", "Ask for the transfer ledger.", "",
  "## Status", "", "## Correspondence", "", "## Session Log", "", "## Review Notes", "",
].join(NL);

const TIER = {
  undetermined: ["risk_tier: undetermined"],
  absent: [],
  one: ["risk_tier: 1"],
  two: ["risk_tier: 2"],
  three: ["risk_tier: 3"],
  nine: ["risk_tier: 9"],
  quotedTwo: ['risk_tier: "2"'],
  unknown: ["risk_tier: unknown"],
};

const c210 = async (tierLines, id = "ACTN-2026-0001-records-request") => {
  const { findings } = await checkBundle({
    folderName: id, files: new Map([["bundle.md", actionMd(id, tierLines)]]),
    sha256: shaHex, sha512: sha512Hex, resolveTarget: (x) => x === id,
  });
  return findings.filter((f) => f.severity === "error" && f.check === "C-2.10").map((f) => f.message);
};

/* ------------------------------------------------------------- 1. the value */
console.log("\n--- 1. the value: undetermined is a tier, and absence reads as it ---");
{
  t("the three words are Bob's, from Roadmap §8, and the fourth is UNDETERMINED",
    [RISK_TIERS[1], RISK_TIERS[2], RISK_TIERS[3], typeof RISK_TIERS.undetermined],
    ["file freely", "file with caution", "do not file without counsel", "string"]);
  t("riskTierState: absent, null and the literal all read undetermined; 1-3 read as themselves",
    [riskTierState(undefined), riskTierState(null), riskTierState("undetermined"),
     riskTierState(1), riskTierState(2), riskTierState(3)],
    ["undetermined", "undetermined", "undetermined", 1, 2, 3]);
  t("riskTierState: a value the vocabulary does not hold is null, never coerced to a tier",
    [riskTierState(9), riskTierState("2"), riskTierState(0), riskTierState("unknown")], [null, null, null, null]);
  t("C-2.10 accepts a stated undetermined", await c210(TIER.undetermined), []);
  t("C-2.10 accepts the ABSENCE of a tier — refusing it would press a writer to invent one", await c210(TIER.absent), []);
  t("OVER-STRICTNESS: a member's stated 1, 2 and 3 all still pass",
    [await c210(TIER.one), await c210(TIER.two), await c210(TIER.three)], [[], [], []]);
  const nine = await c210(TIER.nine);
  t("C-2.10 refuses a tier out of range BY NAME, listing the vocabulary",
    nine.length === 1 && /risk_tier '9' is not one of 1, 2, 3, undetermined/.test(nine[0]), true);
  t("C-2.10 refuses a quoted \"2\" exactly as it did before this row (no widening)",
    (await c210(TIER.quotedTwo)).length, 1);
  t("C-2.10 refuses a spelling of undetermined the vocabulary does not hold", (await c210(TIER.unknown)).length, 1);
}

/* ------------------------------------------------------------ 2-4. the ops */
console.log("\n--- 2-4. through the ops: the no-tier action, a member's 2, and the published words ---");
{
  const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    bindings: { ADMIN_TOKEN: "adm-d182", MEMBER_TOKEN: "mem-d182", PROBE_TOKEN: "prb-d182", VERSION: "test" },
  });
  const post = async (op, body) => (await mf.dispatchFetch("http://x/api/?op=" + op + "&token=mem-d182",
    { method: "POST", body: JSON.stringify(body) })).json();
  const get = async (qs) => (await mf.dispatchFetch("http://x/api/?token=mem-d182&" + qs)).json();
  const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;

  /* CORRECTED 2026-09-24 by REC-189, never exempted: section 3's "a member's authored act sets 2" was driven
     through `token=mem-d182` — the MEMBER_TOKEN DEPLOY credential, which the control plane stamps `token:member`,
     a MACHINE identity by REC-46's one predicate. The arm was asserting the ruling's OWN overclaim as its positive:
     a machine setting 2 read as a member doing so. REC-189's fence (C-32.19) refuses exactly that, so the member's
     act is now a SIGNED-IN SESSION's, and the writers' no-tier creations stay on the machine credential (they state
     no tier, which the fence does not refuse). AND THE THROW BELOW WAS VACUOUS: the answer arrives wrapped in
     `result`, so `r.ok === false` read `undefined` and a refused promote went on as if it had landed — which is
     how the refusal surfaced as five read-back FAILs rather than one named throw. It now reads through `rP`. */
  const RUTH = await (async () => {
    const add = rP(await (await mf.dispatchFetch("http://x/api/?op=memberadd&token=adm-d182",
      { method: "POST", body: JSON.stringify({ memberId: "ruth", cover: "cover for ruth", role: "admin",
                                               capabilities: ["contribute"] }) })).json());
    const en = rP(await (await mf.dispatchFetch("http://x/api/?op=enroll",
      { method: "POST", body: JSON.stringify({ invite: add.invite, handle: "ruth", password: "ruth-passphrase-1" }) })).json());
    if (!en?.ok) throw new Error(`enroll ruth: ${JSON.stringify(en)}`);
    const lg = rP(await (await mf.dispatchFetch("http://x/api/?op=login",
      { method: "POST", body: JSON.stringify({ role: "member:ruth", password: "ruth-passphrase-1" }) })).json());
    if (!lg?.token) throw new Error(`login ruth: ${JSON.stringify(lg)}`);
    return lg.token;
  })();

  let seq = 0;
  const promoteAction = async (id, tierLines, base = null, token = "mem-d182") => {
    const text = actionMd(id, tierLines);
    const r = rP(await (await mf.dispatchFetch("http://x/api/?op=promote&token=" + token, { method: "POST", body: JSON.stringify({
      bundleId: id, base, snapKey: `20260724T010000Z_d182${String(++seq).padStart(4, "0")}`, author: "member-ruth",
      meta: { object_type: "action", group: "believe-in-oakland", title: "Records request",
              current_state: "planned", created: NOW, last_updated: NOW },
      files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
      register: [],
    }) })).json());
    if (r?.ok !== true) throw new Error(`promote ${id}: ${JSON.stringify(r)}`);
    return r;
  };
  const projection = async (id) => rP(await get(`op=projection&id=${encodeURIComponent(id)}`));
  const stored = async (id) => (await get(`op=image&id=${encodeURIComponent(id)}`)).result["bundle.md"];

  /* 2. The no-tier action, both spellings the writers may produce. */
  const STATED = "ACTN-2026-0001-stated-undetermined";
  const ABSENT = "ACTN-2026-0002-no-tier-key";
  await promoteAction(STATED, TIER.undetermined);
  await promoteAction(ABSENT, TIER.absent);
  for (const [label, id] of [["a stated undetermined", STATED], ["an action whose bytes carry no tier", ABSENT]]) {
    const p = await projection(id);
    t(`${label} READS UNDETERMINED through op=projection`, p.action.risk_tier, "undetermined");
    t(`${label} carries the plane's words for it, not a surface's`, p.action.risk_tier_words, RISK_TIERS.undetermined);
    /* THE LIAR'S ARM: the row names a surface rendering UNDETERMINED over a stored 1. So the STORED ROW is read. */
    t(`${label}: the stored projection column holds NO tier (not 1)`, p.action_risk_tier, null);
    t(`${label}: the stored bytes carry no tier 1`, /^risk_tier:\s*1\s*$/m.test(await stored(id)), false);
  }
  t("the stated one's bytes say undetermined in the document itself",
    /^risk_tier: undetermined$/m.test(await stored(STATED)), true);

  /* 3. A member's authored act sets 2: a new version of the same action, promoted by the member. */
  const before = await projection(STATED);
  await promoteAction(STATED, TIER.two, before.bundle_sha, RUTH);
  const after = await projection(STATED);
  t("a member's act sets 2, and op=projection reads 2", after.action.risk_tier, 2);
  t("…in the plane's words: file with caution", after.action.risk_tier_words, "file with caution");
  t("…and the stored row agrees: the column and the bytes both say 2",
    [after.action_risk_tier, /^risk_tier: 2$/m.test(await stored(STATED))], [2, true]);
  t("the version moved — it was the act, not a read, that set it", after.bundle_sha !== before.bundle_sha, true);

  /* A `risk:` search matches only a STATED tier: the undetermined action is not found at 1. */
  const at1 = rP(await get(`op=search&q=${encodeURIComponent("risk:1")}`));
  const ids1 = (at1?.hits ?? []).map((r) => r.bundle_id);
  t("a search for risk:1 finds neither undetermined action (nothing reads as tier 1 by default)",
    [ids1.includes(ABSENT), ids1.includes(STATED)], [false, false]);
  /* The positive beside it, so an empty answer cannot pass the arm above for free. */
  const at2 = rP(await get(`op=search&q=${encodeURIComponent("risk:2")}`));
  const ids2 = (at2?.hits ?? []).map((r) => r.bundle_id);
  t("…while a search for risk:2 DOES find the action a member set to 2 (the search is live)",
    [ids2.includes(STATED), ids2.includes(ABSENT)], [true, false]);

  /* 4. The words are published through the op, and are the catalogue's map. */
  const aff = await get("op=affordances");
  t("op=affordances publishes vocabularies.risk_tiers with the catalogue's words",
    aff.result?.vocabularies?.risk_tiers, JSON.parse(JSON.stringify(RISK_TIERS)));

  const audit = (await get("op=audit&limit=1000")).result;
  t("op=audit: neither action draws C-2.10 — undetermined is an honest state, not a gap",
    audit.tally?.["C-2.10"] ?? 0, 0);

  await mf.dispose();
}
t("VOCABULARIES.risk_tiers IS the catalogue's map (identity, not a copy)", VOCABULARIES.risk_tiers === RISK_TIERS, true);

/* ------------------------------------------------------- 5. the writers */
console.log("\n--- 5. nothing writes 1 by default ---");
{
  const setupSrc = readFileSync(fileURLToPath(new URL("../src/setup.mjs", import.meta.url)), "utf8");
  const appSrc = readFileSync(fileURLToPath(new URL("../../civicos-ui/app.html", import.meta.url)), "utf8");
  const defaultsOne = (src) => /["']risk_tier:\s*1["']/.test(src);
  t("src/setup.mjs's writer carries no default of 1", defaultsOne(setupSrc), false);
  t("civicos-ui/app.html's writer carries no default of 1", defaultsOne(appSrc), false);

  /* And setup.mjs's writer DRIVEN, as counterparty.test.mjs drives it: what it writes, judged. */
  const { SETUP_HTML } = await import("../src/setup.mjs");
  const script = SETUP_HTML.slice(SETUP_HTML.lastIndexOf("<script>") + 8, SETUP_HTML.lastIndexOf("</script>"));
  const el = () => ({ addEventListener() {}, classList: { add() {}, remove() {} },
    textContent: "", innerHTML: "", value: "", style: {}, hidden: false, dataset: {} });
  const sandbox = {
    document: { querySelector: () => el(), querySelectorAll: () => [], getElementById: () => el(),
                addEventListener() {}, createElement: () => el(), body: { appendChild() {}, removeChild() {} } },
    location: { hash: "", pathname: "/", origin: "https://x" }, history: { replaceState() {} },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    fetch: async () => ({ ok: true, status: 200, json: async () => ({ ok: true }) }),
    URLSearchParams, console, JSON, Date, RegExp, String, Number, Object, Array, crypto: webcrypto,
    setTimeout, TextEncoder, navigator: { clipboard: { writeText: async () => {} } },
  };
  sandbox.window = sandbox;
  const ui = new Function(...Object.keys(sandbox),
    script + "\n;return { mdFor, FIRST_STATE };")(...Object.values(sandbox));
  const text = ui.mdFor("ACTN-2026-0009-intake-check", "action", ui.FIRST_STATE.action,
    "Intake check", "What the member wrote.", NOW);
  t("setup.mjs's writer, driven, writes risk_tier: undetermined", /^risk_tier: undetermined$/m.test(text), true);
  t("…and no tier 1", /^risk_tier:\s*1\s*$/m.test(text), false);
}

/* ------------------------------------- 6. D-483: the member's chooser on the setup page */
/* D-483 (the same design section, BOB #21's ruling): D-182 left this page writing UNDETERMINED because it
 * had no control to ask with. That is truthful and it is also a MISSING AFFORDANCE — a member who HAS
 * assessed the action could not say so at the one surface a sovereign copy serves at `/`. The row adds a
 * radio group over the published vocabulary, UNSET by default, and unset still writes undetermined.
 *
 * THE TWO LIARS THIS SECTION REFUSES, both named by the row:
 *   A PRESELECTED TIER, so nothing is ever undetermined — D-182's overclaim re-entering through the
 *   control built to remove it. The rendered markup is read for `checked` and the page's own reader is
 *   asked what it reports with nothing chosen.
 *   HARD-CODED LABELS, so the page decides what 2 MEANS. The rendered choices and their words are compared
 *   against the catalogue's map, the settable keys are derived INDEPENDENTLY here and compared with the
 *   page's own derivation, and the source is read for the sentences as literals.
 *
 * AND IT IS DRIVEN THROUGH THE OP, not judged as markup: what the page's writer produces for a chosen tier
 * and for no choice is promoted into a real store and read back through op=projection, because a control
 * that collects a value the write path drops would satisfy every markup arm above.
 *
 * WHAT THIS SECTION CANNOT SEE. It drives `mdFor` with what `chosenRiskTier()` returns, as the save handler
 * does; it does not dispatch the button's click event, so the wiring between them is pinned STRUCTURALLY
 * (the save path is read for the call) rather than executed. And the markup arms compare raw sentences, so
 * an arm asserts the vocabulary carries no markup-significant byte that the page's escaper would move.
 */
console.log("\n--- 6. D-483: the tier chooser, unset by default, over the published vocabulary ---");
{
  const setupSrc = readFileSync(fileURLToPath(new URL("../src/setup.mjs", import.meta.url)), "utf8");
  const { SETUP_HTML } = await import("../src/setup.mjs");
  const script = SETUP_HTML.slice(SETUP_HTML.lastIndexOf("<script>") + 8, SETUP_HTML.lastIndexOf("</script>"));

  /* The settable tiers, derived HERE from the catalogue and never read from the page, so the comparison
     below is between two derivations rather than a value compared with itself. */
  const SETTABLE = Object.keys(RISK_TIERS).filter((k) => riskTierState(Number(k)) === Number(k));
  console.log(`  corpus: ${SETTABLE.length} settable tiers ${JSON.stringify(SETTABLE)}; vocabulary has ${Object.keys(RISK_TIERS).length} keys`);
  t("the vocabulary offered is NON-EMPTY and holds the three tiers (no arm below may pass over nothing)",
    [SETTABLE.length, SETTABLE.includes("undetermined")], [3, false]);

  /* A DOM stub that REMEMBERS its elements, unlike section 5's: this arm reads back what the page WROTE
     into the choices container, and a fresh stub per query would discard the subject. `checked` is the
     member's state: null is a form nobody has touched. */
  const drive = (checked) => {
    const nodes = new Map();
    const node = () => ({ addEventListener() {}, classList: { add() {}, remove() {} }, checked: false,
      textContent: "", innerHTML: "", value: "", style: {}, hidden: false, dataset: {} });
    const querySelector = (sel) => {
      if (sel === "input[name=n-risk]:checked")
        return checked === null ? null : { value: String(checked), checked: true };
      if (!nodes.has(sel)) nodes.set(sel, node());
      return nodes.get(sel);
    };
    const sandbox = {
      document: { querySelector, querySelectorAll: () => [], getElementById: () => node(),
                  addEventListener() {}, createElement: () => node(),
                  body: { appendChild() {}, removeChild() {} } },
      location: { hash: "", pathname: "/", origin: "https://x" }, history: { replaceState() {} },
      sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
      fetch: async () => ({ ok: true, status: 200, json: async () => ({ ok: true }) }),
      URLSearchParams, console, JSON, Date, RegExp, String, Number, Object, Array, crypto: webcrypto,
      setTimeout, TextEncoder, navigator: { clipboard: { writeText: async () => {} } },
    };
    sandbox.window = sandbox;
    const ui = new Function(...Object.keys(sandbox),
      script + "\n;return { mdFor, FIRST_STATE, chosenRiskTier, SETTABLE_TIERS };")(...Object.values(sandbox));
    return { ui, nodes };
  };

  /* --- the control as a member first meets it: nothing touched --- */
  const fresh = drive(null);
  const html = fresh.nodes.get("#n-risk-choices").innerHTML;
  t("the chooser RENDERED: one radio per settable tier, and the container is not empty",
    (html.match(/type="radio"/g) || []).length, SETTABLE.length);
  t("THE DEFAULT IS UNSET: no rendered radio carries a checked attribute",
    /\bchecked\b/.test(html), false);
  t("…and with nothing chosen the page reports NO CHOICE, never a tier", fresh.ui.chosenRiskTier(), null);
  t("the page's own derivation of the settable tiers matches the catalogue's, key for key",
    fresh.ui.SETTABLE_TIERS, SETTABLE);

  /* --- the choices are the vocabulary's, and the words are the plane's --- */
  const values = [...html.matchAll(/value="([^"]+)"/g)].map((m) => m[1]);
  t("the choices ARE the vocabulary's settable keys, in its own order", values, SETTABLE);
  const labels = [...html.matchAll(/<span>([^<]*)<\/span>/g)].map((m) => m[1]);
  t("…and each label is the PLANE's sentence for that tier, not a word this page chose",
    labels, SETTABLE.map((k) => RISK_TIERS[k]));
  t("what leaving it alone will write is stated in the vocabulary's OWN undetermined sentence",
    fresh.nodes.get("#n-risk-unset").textContent.includes(RISK_TIERS.undetermined), true);
  /* THE SENTENCES ARE NOT WRITTEN IN THE PAGE. Judged over the source with its COMMENTS REMOVED, and the
     narrowing is a finding rather than a convenience: the first form of this arm read the whole file and
     failed on D-182's own history comment in mdFor, which says an old default "told a member the action
     was safe to file freely" — prose EXPLAINING the rule, cited by the arm enforcing it (WORKER.md's
     sweep-arm shape). A comment cannot become a label; only a literal can. The stripper's limit, stated:
     it can only over-strip, which WEAKENS this arm and can never make it fail falsely, so the floor below
     guards that it did not eat the file, and the two arms after it pin the mechanism and the behaviour. */
  const nocomment = setupSrc.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/<!--[\s\S]*?-->/g, " ");
  console.log(`  setup.mjs: ${setupSrc.length} B, ${nocomment.length} B with comments stripped`);
  t("the comment stripper left a real file behind (it cannot fail this arm falsely, only weaken it)",
    nocomment.length > setupSrc.length * 0.5, true);
  t("src/setup.mjs carries NONE of the tier sentences as a literal — the words arrive from the catalogue",
    SETTABLE.map((k) => nocomment.includes(RISK_TIERS[k])).concat(nocomment.includes(RISK_TIERS.undetermined)),
    [false, false, false, false]);
  t("…and the one expression that becomes a label reads the MAP, by key, through the page's escaper",
    /escH\(RISK_TIERS\[k\]\)/.test(setupSrc), true);
  /* THE MATCHER'S DECLARED LIMIT: the two arms above compare raw sentences against rendered markup, which
     is only sound while no sentence carries a byte the page's escaper moves. Asserted, so a future
     sentence with one fails HERE by name instead of quietly weakening those arms. */
  t("…(the arms above compare raw text: the vocabulary carries no markup-significant byte)",
    Object.values(RISK_TIERS).map((w) => /[&<>"]/.test(w)), [false, false, false, false]);
  /* The wiring between the control and the writer, pinned structurally: this section drives mdFor the way
     the save handler does, so an arm is owed that the save handler really does it that way. */
  t("the form's save path sends the chosen tier alongside the counterparty (the page's real route)",
    /risk_tier:\s*chosenRiskTier\(\)/.test(setupSrc), true);

  /* --- and through the op: what the page WRITES for each answer, promoted and read back --- */
  const bytesFor = (checked, id) => {
    const { ui } = drive(checked);
    return ui.mdFor(id, "action", ui.FIRST_STATE.action, "Intake check", "What the member wrote.", NOW,
      false, null, { counterparty: { state: "named", name: "City Clerk" }, risk_tier: ui.chosenRiskTier() });
  };

  const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    bindings: { ADMIN_TOKEN: "adm-d483", MEMBER_TOKEN: "mem-d483", PROBE_TOKEN: "prb-d483", VERSION: "test" },
  });
  const post = async (op, body) => (await mf.dispatchFetch("http://x/api/?op=" + op + "&token=mem-d483",
    { method: "POST", body: JSON.stringify(body) })).json();
  const get = async (qs) => (await mf.dispatchFetch("http://x/api/?token=mem-d483&" + qs)).json();
  const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
  let seq = 0;
  const promoteText = async (id, text) => {
    const r = await post("promote", {
      bundleId: id, base: null, snapKey: `20260724T020000Z_d483${String(++seq).padStart(4, "0")}`,
      author: "member-ruth",
      meta: { object_type: "action", group: "believe-in-oakland", title: "Intake check",
              current_state: "planned", created: NOW, last_updated: NOW },
      files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [],
    });
    if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r)}`);
    return r;
  };
  const projection = async (id) => rP(await get(`op=projection&id=${encodeURIComponent(id)}`));
  const stored = async (id) => (await get(`op=image&id=${encodeURIComponent(id)}`)).result["bundle.md"];

  /* THE ROW'S accepts-when, both halves, through a route a caller has. Tier 1 is driven as well as 2: the
     control must still let a member author FILE FREELY, which is the over-strictness direction — a fix that
     made the riskiest-sounding value unwritable would pass every arm about undetermined. */
  const CHOSEN = [[1, "ACTN-2026-0011-member-chose-1"], [2, "ACTN-2026-0012-member-chose-2"],
                  [3, "ACTN-2026-0013-member-chose-3"]];
  for (const [tier, id] of CHOSEN) {
    await promoteText(id, bytesFor(tier, id));
    const p = await projection(id);
    t(`a member choosing tier ${tier} has it WRITTEN THROUGH THE OP: op=projection reads ${tier}`,
      p.action.risk_tier, tier);
    t(`…in the plane's words for ${tier}, not the page's`, p.action.risk_tier_words, RISK_TIERS[tier]);
    t(`…and the stored column and the document's own bytes both say ${tier}`,
      [p.action_risk_tier, new RegExp("^risk_tier: " + tier + "$", "m").test(await stored(id))], [tier, true]);
  }

  const NONE = "ACTN-2026-0014-member-chose-nothing";
  await promoteText(NONE, bytesFor(null, NONE));
  const pn = await projection(NONE);
  t("a member choosing NOTHING still writes undetermined: op=projection reads undetermined",
    pn.action.risk_tier, "undetermined");
  t("…carrying the plane's undetermined sentence", pn.action.risk_tier_words, RISK_TIERS.undetermined);
  t("…and the stored column holds NO tier while the bytes SAY undetermined (absence stated, not omitted)",
    [pn.action_risk_tier, /^risk_tier: undetermined$/m.test(await stored(NONE))], [null, true]);
  t("…and no tier 1 reached those bytes", /^risk_tier:\s*1\s*$/m.test(await stored(NONE)), false);

  const audit = (await get("op=audit&limit=1000")).result;
  t("op=audit: none of the four actions this page wrote draws C-2.10", audit.tally?.["C-2.10"] ?? 0, 0);

  await mf.dispose();
}

console.log(`\nrisk-tier: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
