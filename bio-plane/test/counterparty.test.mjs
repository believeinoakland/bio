/* NEGATIVE CONTROL: (run 2026-08-04, rec23-agent) restore the pre-REC-23 arm in checks/bio-checks.mjs — replace the `checkCounterparty(fm, findings);` call in checkActionExtension with the old two lines `if (typeof fm.counterparty !== 'string' || fm.counterparty.trim() === '') findings.push(f('C-2.10','error','counterparty is missing or empty'));` (accept any non-empty string) -> the catalog INVERTS: `counterparty: to be named` draws [] and BOTH honest blocks draw ["C-2.10: counterparty is missing or empty"], because a map is not a string. 17 of this suite's assertions fail and it then throws at the op=audit offender sample (op=audit names ACTN-0001, the HONEST undetermined, and reports ACTN-0002, the PLACEHOLDER, among the clean — D-130 reproduced verbatim through a caller's own route); battery 83/86, 4457, also failing conformance.test.mjs (the intake action's one finding is gone) and check-firing.test.mjs (2: its conformant action base is no longer clean). Restored -> 86/86, 4499. */
/* D-130 / REC-23: the counterparty is three-valued, and C-2.10 stops accepting
 * a placeholder.
 *
 * WHAT WAS TRUE BEFORE THIS SUITE EXISTED. Two intake surfaces —
 * `civicos-ui/app.html`'s `mdFor` and `src/setup.mjs`'s — wrote the literal
 * string `counterparty: to be named` into EVERY action they created, and
 * C-2.10 refused only an EMPTY counterparty. So the placeholder satisfied the
 * gate by being a string, and the record asserted a counterparty it did not
 * have, in the one construct that reaches outside the system. That is the
 * overclaiming class this project's whole discipline exists to catch, and it
 * had shipped through a green battery: conformance.test.mjs asserted "a new
 * action bundle has zero errors" and that assertion was TRUE of the bytes and
 * FALSE about the record.
 *
 * WHAT THIS SUITE HOLDS THE CATALOG TO, in both directions on the same shape:
 *
 *   THE HONEST UNDETERMINED PASSES. `state: undetermined` with an authored
 *   basis draws no finding. This is the half that matters most: a check that
 *   refuses a placeholder without offering an honest way to say "we do not
 *   know yet" just forces the invention (D-97's lesson at the authority gate).
 *
 *   THE DISHONEST SHAPES ARE REFUSED BY NAME. Undetermined with no basis; named
 *   with no name; the literal `to be named` in the flat shape the machine wrote
 *   AND moved down into `name` and into `basis`; a state outside the pair; and
 *   the two COHERENCE failures, where the state and the content say different
 *   things about the same fact.
 *
 *   THE REFUSAL REACHES A CALLER. Every shape above is also promoted into a
 *   real store and judged by `op=audit`, the store's own conformance pass — a
 *   route a caller actually has, run inside the Durable Object where the gate's
 *   catalog runs. A catalog-only proof would not show that (D-43).
 *
 *   THE EMISSION SITES ARE GONE. Both `mdFor`s are read as SOURCE and asserted
 *   free of the literal, and setup.mjs's is EXECUTED and its action bundle
 *   judged: exactly one finding, C-2.10 naming the absent counterparty. The
 *   surface no longer lies; it is silent, and the gate says what is missing
 *   until UI-19 gives a member the control to fill it.
 *
 * NO COUNTERPARTY TABLE. `entity_id` is optional and points into the ONE
 * subject registry; its shape is checked and its resolution is not, and the
 * reason is stated at the check.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash, webcrypto } from "node:crypto";
import { checkBundle, withProducingGroup } from "../checks/bio-checks.mjs";

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

/* A conformant action bundle in every respect EXCEPT the counterparty block,
   which each case supplies. Everything else is the field set the intake
   surfaces write, so a finding here can only be about the subject. */
const actionMd = (id, cpLines) => [
  "---", `id: ${id}`, "object_type: action", "schema: action@1",
  'title: "Records request"', "current_state: planned", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []",
  /* CORRECTED 2026-09-25 by D-689, never exempted: this fixture created a `cpra_request` through an operator bearer token — a machine identity — and C-32.20 now refuses a machine stating the law a records request is made under (BOB #35, 2026-09-25: only a member's act states it; a machine may only propose). The kind is not this suite's subject, so the fixture is the law-neutral `records_request` stating no law, which a machine may create. */
  "action_kind: records_request", /* CORRECTED 2026-09-24 by REC-189, never exempted: `risk_tier: 1` ("file freely") was a tier this
     fixture states through a DEPLOY token — a machine identity — and C-32.19 now refuses a machine
     setting 1, 2 or 3 (D-182: only a member's authored act does). The tier is not this suite's subject,
     so the fixture states what an unassessed action honestly is. */
  "risk_tier: undetermined",
  ...cpLines,
  "---", "",
  "## Plan", "", "Ask for the transfer ledger.", "",
  "## Status", "", "## Correspondence", "", "## Session Log", "", "## Review Notes", "",
].join(NL);

const ID = "ACTN-2026-0001-records-request";
const findingsFor = async (cpLines, id = ID) => {
  const { findings } = await checkBundle({
    folderName: id, files: new Map([["bundle.md", actionMd(id, cpLines)]]),
    sha256: shaHex, sha512: sha512Hex, resolveTarget: (x) => x === id,
  });
  return findings.filter((f) => f.severity === "error");
};
/* Every case is judged on C-2.10 ALONE. A case that broke some OTHER check
   would otherwise look like a pass or a fail for the wrong reason. */
const c210 = async (cpLines, id) => (await findingsFor(cpLines, id))
  .filter((f) => f.check === "C-2.10").map((f) => f.message);
const names = (msgs, re) => msgs.some((m) => re.test(m));

/* The shapes, named once and reused by BOTH the catalog block and the op
   block, so the two cannot drift into testing different documents. */
const CASES = {
  undeterminedWithBasis: ["counterparty:", "  state: undetermined",
    "  basis: The city has three departments that could hold this; the clerk's index will say which."],
  undeterminedNoBasis: ["counterparty:", "  state: undetermined"],
  undeterminedEmptyBasis: ["counterparty:", "  state: undetermined", '  basis: ""'],
  named: ["counterparty:", "  state: named", "  name: City Clerk"],
  namedWithEntity: ["counterparty:", "  state: named", "  name: City Clerk", "  entity_id: ENT-2026-0007"],
  namedNoName: ["counterparty:", "  state: named"],
  namedEmptyName: ["counterparty:", "  state: named", '  name: ""'],
  placeholderFlat: ["counterparty: to be named"],
  placeholderInName: ["counterparty:", "  state: named", "  name: to be named"],
  placeholderInBasis: ["counterparty:", "  state: undetermined", "  basis: To Be Named"],
  bareString: ["counterparty: City Clerk"],
  missing: [],
  badState: ["counterparty:", "  state: pending", "  name: City Clerk"],
  badEntityId: ["counterparty:", "  state: named", "  name: City Clerk", "  entity_id: INFO-2026-0001-nope"],
  undeterminedButNamed: ["counterparty:", "  state: undetermined",
    "  name: City Clerk", "  basis: Not yet confirmed as the holder."],
  undeterminedWithEntity: ["counterparty:", "  state: undetermined",
    "  entity_id: ENT-2026-0007", "  basis: Not yet confirmed as the holder."],
};

/* ---------------------------------------------------------------- the shape */
console.log("--- the restricted grammar carries this block, and it is source's shape ---");
{
  const { parseFrontmatter } = await import("../checks/bio-checks.mjs");
  const { data } = parseFrontmatter(actionMd(ID, CASES.namedWithEntity));
  /* One-level map of scalars at two spaces: exactly what `source: {locator,
     authority, retrieved}` already is. Nothing nests further, so this needed no
     second top-level key the way `completeness`/`completeness_excluded` and
     `division`/`division_apportionment` did (REC-14, REC-16). */
  t("counterparty parses as a MAP, not a string", typeof data.counterparty, "object");
  t("with the four scalars the shape declares",
    Object.keys(data.counterparty).sort(), ["entity_id", "name", "state"].sort());
  t("and source, the shape it copies, parses the same way", typeof parseFrontmatter(
    ["---", "id: INFO-2026-0001-x", "source:", "  locator: in hand", "  authority: member-entered",
     `  retrieved: ${NOW}`, "---", ""].join(NL)).data.source, "object");
}

/* ------------------------------------------------------ the honest direction */
console.log("\n--- what PASSES: an action that says what it knows ---");
t("undetermined WITH an authored basis draws no C-2.10 finding",
  await c210(CASES.undeterminedWithBasis), []);
t("and no finding of ANY family, so the pass is about the counterparty and nothing else",
  (await findingsFor(CASES.undeterminedWithBasis)).map((f) => f.check), []);
t("a named counterparty with a name passes", await c210(CASES.named), []);
t("a named counterparty may ALSO point into the subject registry (entity_id is optional)",
  await c210(CASES.namedWithEntity), []);
t("and the optional field is genuinely optional: omitting it changes nothing",
  await c210(CASES.named), await c210(CASES.namedWithEntity));

/* ----------------------------------------------------- the refusing direction */
console.log("\n--- what is REFUSED, each by name ---");
{
  const noBasis = await c210(CASES.undeterminedNoBasis);
  t("undetermined with NO basis is refused", noBasis.length, 1);
  t("and the refusal names the basis, not merely the block",
    names(noBasis, /counterparty\.basis is empty/), true);
  t("an EMPTY basis string is the same refusal — absent and blank are one claim here",
    await c210(CASES.undeterminedEmptyBasis), noBasis);

  const noName = await c210(CASES.namedNoName);
  t("named with NO name is refused", noName.length, 1);
  t("and the refusal names the name", names(noName, /counterparty\.name is empty/), true);
  t("an empty name string is the same refusal", await c210(CASES.namedEmptyName), noName);
}
{
  /* The item's third accepts-when, and the reason this suite exists: the exact
     string the machine used to write. */
  const flat = await c210(CASES.placeholderFlat);
  t("the literal 'to be named' is refused", flat.length, 1);
  t("and the refusal says WHY it is not an honest undetermined",
    names(flat, /placeholder 'to be named'/), true);
  t("moving the same literal into name does not launder it",
    names(await c210(CASES.placeholderInName), /counterparty\.name is the placeholder/), true);
  t("nor into basis, and the comparison is case-folded",
    names(await c210(CASES.placeholderInBasis), /counterparty\.basis is the placeholder/), true);
}
{
  const bare = await c210(CASES.bareString);
  t("a bare string that is NOT the placeholder is still refused — the shape is the rule", bare.length, 1);
  t("and it is told apart from the placeholder, because the repair differs",
    names(bare, /placeholder/), false);
  t("an absent counterparty block is refused",
    names(await c210(CASES.missing), /counterparty block is missing/), true);
  t("a state outside {named, undetermined} is refused, naming the pair",
    names(await c210(CASES.badState), /is not one of: named, undetermined/), true);
  t("an entity_id that is not a subject registry key is refused",
    names(await c210(CASES.badEntityId), /is not a subject registry key/), true);
}
{
  /* The coherence rule: the state and the content must say the same thing. */
  t("undetermined carrying a NAME is refused — it asserts and denies in one breath",
    names(await c210(CASES.undeterminedButNamed), /undetermined and counterparty\.name is/), true);
  t("undetermined carrying an entity_id is refused — pointing at a registry subject IS a determination",
    names(await c210(CASES.undeterminedWithEntity), /undetermined and counterparty\.entity_id is/), true);
}

/* ------------------------------------------------------- through a real op */
console.log("\n--- and a caller reaches the refusal: op=audit, the store's own conformance pass ---");
{
  const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    bindings: { ADMIN_TOKEN: "adm-cp", MEMBER_TOKEN: "mem-cp", PROBE_TOKEN: "prb-cp", VERSION: "test" },
  });
  const post = async (op, body) => (await mf.dispatchFetch("http://x/api/?op=" + op + "&token=mem-cp",
    { method: "POST", body: JSON.stringify(body) })).json();
  const get = async (qs) => (await mf.dispatchFetch("http://x/api/?token=mem-cp&" + qs)).json();

  /* CORRECTED 2026-09-25 by D-717, never exempted. Two things were wrong here, and the second hid the first.
     (1) The stance "promotion is NOT the gate … a draft may be written and corrected" held for every counterparty
     shape; D-717 (C-101.3, COUNTERPARTY_REFUSED) moves every shape but the MISSING block to the act, because a
     placeholder or an incoherent block ASSERTS something the record cannot support, where an absent one asserts
     nothing. The draft half of the old stance survives exactly there: a missing counterparty still lands and the
     audit still names it. (2) This helper's guard read `r.ok` on the ENVELOPE, `{result: {...}}`, where `ok` is
     never present — so it could not throw, and a refusal would have passed as a landing. It now reads the result,
     and returns it, so the refusal is asserted by name rather than thrown past. */
  const promoteAction = async (n, cpLines) => {
    const id = `ACTN-2026-${String(n).padStart(4, "0")}-records-request`;
    const text = actionMd(id, cpLines);
    const r = (await post("promote", {
      bundleId: id, base: null, snapKey: "20260724T010000Z_aaaa1111", author: "seed",
      meta: { object_type: "action", group: "believe-in-oakland", title: "Records request",
              current_state: "planned", created: NOW, last_updated: NOW },
      files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
      register: [],
    })).result;
    return { id, r };
  };

  const honest = await promoteAction(1, CASES.undeterminedWithBasis);
  const placeholder = await promoteAction(2, CASES.placeholderFlat);
  const noBasis = await promoteAction(3, CASES.undeterminedNoBasis);
  const missing = await promoteAction(4, CASES.missing);
  t("the honest undetermined lands", honest.r?.ok, true);
  t("the placeholder is refused AT THE ACT by name (D-717, C-101.3), with the placeholder sentence verbatim",
    [placeholder.r?.reason, placeholder.r?.check,
     /placeholder 'to be named'/.test((placeholder.r?.findings ?? []).map((e) => e.detail).join(" "))],
    ["COUNTERPARTY_REFUSED", "C-101.3", true]);
  t("undetermined with no basis is refused at the act by the same name", noBasis.r?.reason, "COUNTERPARTY_REFUSED");
  t("a MISSING counterparty still lands — it asserts nothing, and stays the audit's (D-717's scope)", missing.r?.ok, true);

  const audit = (await get("op=audit&limit=1000")).result;
  t("the pass sees the two actions that landed", audit.checked, 2);
  t("exactly one is clean, and it is the honest undetermined", audit.clean, 1);
  t("one carries errors", audit.withErrors, 1);
  t("and the check that caught it is C-2.10", Object.keys(audit.tally).sort(), ["C-2.10"]);
  const offenders = audit.offenders.map((o) => o.bundleId).sort();
  t("the offender is named — the missing counterparty — and the honest action is not among them",
    offenders, [missing.id]);
  t("the missing action is reported with the missing-block finding verbatim",
    /counterparty block is missing/.test(
      (audit.offenders.find((o) => o.bundleId === missing.id)?.errors ?? []).map((e) => e.detail).join(" ")), true);
  t("and the honest one is genuinely in the store, not merely absent from the tally",
    (await get(`op=image&id=${encodeURIComponent(honest.id)}`)).result["bundle.md"].includes("state: undetermined"), true);

  await mf.dispose();
}

/* ------------------------------------------------------- the emission sites */
console.log("\n--- the placeholder is not written anywhere any more ---");
{
  /* D-130 named ONE site. There were TWO, and the second is the one the battery
     actually exercised (conformance.test.mjs runs setup.mjs's mdFor). Both are
     asserted, as SOURCE, so a future edit that reintroduces the literal fails
     here rather than at a ratification months later. */
  const setupSrc = readFileSync(fileURLToPath(new URL("../src/setup.mjs", import.meta.url)), "utf8");
  const appSrc = readFileSync(fileURLToPath(new URL("../../civicos-ui/app.html", import.meta.url)), "utf8");
  const emits = (src) => /counterparty:\s*to be named/.test(src) || /"counterparty: to be named"/.test(src);
  t("src/setup.mjs's mdFor no longer emits the literal", emits(setupSrc), false);
  t("civicos-ui/app.html's mdFor no longer emits the literal", emits(appSrc), false);

  /* And the surface's actual output, judged: not "the string is gone" but "what
     it writes now is honestly incomplete rather than dishonestly complete". */
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
  const id = "ACTN-2026-0009-intake-check";
  /* CORRECTED 2026-09-21 BY D-436 (IC-172), never exempted: the page no longer writes a producing group — it wrote a
     LITERAL one, true of one instance only — and the plane stamps the store's recorded group into every creation. So
     "exactly one finding" is asked of the document AS THE PLANE HOLDS IT (the page's bytes through the catalogue's
     `withProducingGroup`, the function the store's stamp calls); asked of the page's bytes alone it would count the
     group the plane supplies as a second gap, which is a different division of labour, not a second invention. */
  const own = ui.mdFor(id, "action", ui.FIRST_STATE.action, "Intake check", "What the member wrote.", NOW);
  const text = withProducingGroup(own, "intake-fixture");   /* a slug that cannot match the counterparty pins */
  t("…and the page's own bytes name no producing group — the plane writes it at creation (D-436)",
    /^group:/m.test(own), false);
  const { findings } = await checkBundle({ folderName: id, files: new Map([["bundle.md", text]]),
    sha256: shaHex, sha512: sha512Hex, resolveTarget: () => true });
  const errs = findings.filter((f) => f.severity === "error");
  t("the intake surface writes NO counterparty at all", /counterparty/.test(text), false);
  t("so its action draws exactly one finding", errs.length, 1);
  t("and it is C-2.10 naming the missing block — the gap is stated, not filled with an invention",
    errs[0].check === "C-2.10" && /counterparty block is missing/.test(errs[0].message), true);
  /* Why nothing replaces it: an `undetermined` basis this function invented
     would be the same lie one field down. The control belongs to UI-19. */
  t("and the surface did not invent an undetermined state either", /state: undetermined/.test(text), false);
}

console.log(`\ncounterparty: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
