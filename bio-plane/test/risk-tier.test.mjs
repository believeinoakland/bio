/* NEGATIVE CONTROL: (RUN 2026-09-23 by the D-182 worker; each arm ALONE, restored from a per-arm pristine copy and verified by sha256 AND cmp; baseline 31 pass / 0 fail before and after) (A) THE ROW'S CONTROL, restore the default of 1 - in checks/bio-checks.mjs riskTierState return 1 instead of 'undetermined' for an absent/undetermined tier -> 5 FAIL, declared and actual: the no-tier arms fail BY NAME ("a stated undetermined READS UNDETERMINED through op=projection", "an action whose bytes carry no tier READS UNDETERMINED through op=projection", both words arms, and the riskTierState unit arm); the member's-2 and over-strictness arms stayed green, as declared. (B) THE WRITER'S DEFAULT - in src/setup.mjs write "risk_tier: 1" again -> 3 FAIL: the source arm and both driven-writer arms. (C) THE LIAR the row names, a read rendering UNDETERMINED whatever is stored - in src/store.mjs #actionDerived set risk_tier to the constant "undetermined" -> 1 FAIL, "a member's act sets 2, and op=projection reads 2"; every no-tier arm stays GREEN over the constant, which is declared and is why sections 2 and 3 also read the STORED column and bytes. Also found while writing, not by an arm: the first draft's risk:1 search arm was VACUOUS (it read a result key the answer does not carry, so it passed over an empty list); the risk:2 positive beside it caught that and the key was corrected. */
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

console.log(`\nrisk-tier: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
