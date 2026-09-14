/* D-202's closing half — the plane's deployed bindings derive from
 * wrangler.jsonc with the slug substituted, and this suite is why that logic
 * lives in `scripts/derive-bindings.mjs` instead of inside deploy.mjs: a
 * script that acts on import cannot be driven without deploying.
 *
 * Arms run against SYNTHETIC configs built to disagree in one specific way
 * each (the resolveversion.test.mjs lesson: a suite that only asserts "the
 * real tree agrees" proves nothing about the predicate), plus one live arm
 * against the real wrangler.jsonc, which is the ratchet.
 *
 * NEGATIVE CONTROL: RUN 2026-09-14, two hand arms against the module itself,
 * pristine copy taken first, restore verified by sha256 both times —
 * (a) remove the bio-plane→slug substitution -> 16 of 20 FAIL, every one
 * NAMED and none a crash: the module's own PHANTOM_TARGET guard turns every
 * derivation into a refusal, so the module fails CLOSED (a deploy under this
 * arm would refuse, not ship the phantom) and the suite reports it. The
 * arm's FIRST firing crashed the suite instead — bare deriveBindings calls
 * let the guard's throw eat the tally (D-93 inside a control, the third
 * sighting in this session's own instruments in one day) — which is why every
 * should-succeed call now goes through derive()/named() and a refusal shows
 * as a failing value. (b) make the unknown-binding-class refusal a silent
 * drop -> 1 of 20 FAIL, the refusal arm alone — honest and sufficient: the
 * drop only manifests when an unknown class is PRESENT, and that arm is the
 * one that presents one. The header's first draft predicted 4/20 and 2/20
 * before the arms ran; these are the measured figures.
 * Restored byte-identically after each, 20/20 green.
 */
import "./stdio.mjs";
import "./sandbox.mjs";
import { readFileSync } from "node:fs";
import { deriveBindings, serviceTargets } from "../scripts/derive-bindings.mjs";
import { stripJsonc } from "../../tools/jsonc.mjs";

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) console.log(`        got ${JSON.stringify(got)} want ${JSON.stringify(want)}`);
};
const refusal = (fn) => { try { fn(); return "no refusal"; } catch (e) { return String(e.message).match(/REFUSED \[([A-Z_]+)\]/)?.[1] ?? "unrecognised: " + e.message; } };
/* A should-succeed derivation observed safely: a refusal comes back as a value
   the assertions FAIL on by name, never as a crash that eats the tally (the
   D-93-inside-a-control lesson, paid three times in one day before this line). */
const derive = (cfg, opts) => { try { return deriveBindings(cfg, opts); } catch (e) { return { REFUSED: String(e.message).slice(0, 80) }; } };
const named = (b, name) => Array.isArray(b) ? b.find((x) => x.name === name) : { REFUSED: b.REFUSED };

console.log("\n--- derive-bindings: the config deploys, the phantom does not ---");

const CFG = {
  name: "bio-plane",
  vars: { VERSION: "9.9.9", EXTRA_VAR: "kept" },
  durable_objects: { bindings: [{ name: "STORE", class_name: "Store" }] },
  r2_buckets: [
    { binding: "CAPTURES", bucket_name: "bio-captures" },
    { binding: "PUBLISHED", bucket_name: "bio-published" },
  ],
  services: [
    { binding: "PDF_WORKER", service: "pdf-worker" },
    { binding: "SELF", service: "bio-plane" },
  ],
};

/* ---- the substitution, both directions ---------------------------------- */
{
  const b = derive(CFG, { slug: "oak-town", version: "0.57.0" });
  t("the derivation succeeds on the healthy config", Array.isArray(b), true);
  t("SELF's phantom target becomes the instance slug",
    named(b, "SELF")?.service, "oak-town");
  t("a member target stays literal — members deploy under their own names",
    named(b, "PDF_WORKER")?.service, "pdf-worker");
  t("VERSION is the deploy argument, the string the rollout gate waits for",
    named(b, "VERSION")?.text, "0.57.0");
  t("INSTANCE_NAME is the slug (D-102)",
    named(b, "INSTANCE_NAME")?.text, "oak-town");
  t("other config vars are carried",
    named(b, "EXTRA_VAR")?.text, "kept");
  t("both buckets derive",
    (Array.isArray(b) ? b : []).filter((x) => x.type === "r2_bucket").map((x) => x.bucket_name).sort(),
    ["bio-captures", "bio-published"]);
  /* the census: nothing declared was dropped, nothing undeclared appeared */
  t("nothing dropped, nothing invented — the derived set is exactly the declared one plus the two deploy-owned names",
    (Array.isArray(b) ? b : [b.REFUSED]).map((x) => x.name ?? x).sort(),
    ["CAPTURES", "EXTRA_VAR", "INSTANCE_NAME", "PDF_WORKER", "PUBLISHED", "SELF", "VERSION"]);
  t("no durable_object_namespace is SENT — STORE rides keep_bindings, deliberately",
    (Array.isArray(b) ? b : []).some((x) => x.type === "durable_object_namespace"), false);
  t("the phantom survives nowhere — and a refusal here is a FAILURE with the refusal shown, not a crash",
    Array.isArray(b) ? b.some((x) => x.service === "bio-plane") : b, false);
}

/* ---- the cascade token: environment-conditional, exactly one ------------- */
{
  const withTok = derive(CFG, { slug: "s", version: "1", instanceClaudeToken: "tok-x" });
  const without = derive(CFG, { slug: "s", version: "1" });
  t("the cascade secret is sent only when the environment carries it",
    [(Array.isArray(withTok) ? withTok : []).filter((x) => x.type === "secret_text").length,
     (Array.isArray(without) ? without : []).filter((x) => x.type === "secret_text").length], [1, 0]);
}

/* ---- the refusals: loud, by name, never a silent drop -------------------- */
{
  t("no slug refuses — a default would be D-292's hardcoded name",
    refusal(() => deriveBindings(CFG, { version: "1" })), "NO_SLUG");
  t("no version refuses",
    refusal(() => deriveBindings(CFG, { slug: "s" })), "NO_VERSION");
  t("a config binding class the derivation does not carry REFUSES by name",
    refusal(() => deriveBindings({ ...CFG, kv_namespaces: [{ binding: "KV", id: "x" }] },
      { slug: "s", version: "1" })), "UNKNOWN_BINDING_CLASS");
  t("an EMPTY declared class is not a refusal — absent and empty differ",
    refusal(() => deriveBindings({ ...CFG, kv_namespaces: [] }, { slug: "s", version: "1" }))
      === "no refusal", true);
}

/* ---- pre-flight targets: everything except the self-reference ------------ */
{
  const b = derive(CFG, { slug: "oak-town", version: "1" });
  t("pre-flight lists the member target and skips the self-reference (the noSelf lesson)",
    Array.isArray(b) ? serviceTargets(b, "oak-town") : b, ["pdf-worker"]);
}

/* ---- the live arm, the ratchet: the real config derives cleanly ---------- */
{
  const real = JSON.parse(stripJsonc(
    readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8")));
  const b = derive(real, { slug: "biosmoke7", version: real.vars.VERSION });
  t("the real config derives without refusal and SELF targets the instance",
    named(b, "SELF")?.service, "biosmoke7");
  t("the real config's four service bindings all derive",
    (Array.isArray(b) ? b : [b]).filter((x) => x.type === "service").map((x) => x.name).sort(),
    ["AGENT_WORKER", "OCR_WORKER", "PDF_WORKER", "SELF"]);
  t("the real config's fleet targets pre-flight (self excluded)",
    Array.isArray(b) ? serviceTargets(b, "biosmoke7").sort() : b, ["agent-worker", "ocr-worker", "pdf-worker"]);
  t("no phantom leaves the real derivation",
    Array.isArray(b) ? b.some((x) => x.service === "bio-plane") : b, false);
}

console.log(`\ndeploybindings: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
