/* D-202's closing half — the plane's deployed bindings DERIVE from
 * `bio-plane/wrangler.jsonc`, with the instance slug substituted (D-292's
 * rule), instead of living as a second hand-carried list inside deploy.mjs.
 *
 * WHY THIS FILE EXISTS APART FROM deploy.mjs: deploy.mjs is a top-level script
 * that acts on import, so nothing can test its derivation without deploying.
 * This module is pure — config in, bindings out — and the battery drives it
 * (`test/deploybindings.test.mjs`). Same reasoning as tools/jsonc.mjs's "one
 * copy": the logic a deploy uses is the logic the suite proves.
 *
 * WHAT IT DELIBERATELY DOES NOT EMIT, so the deploy's contract is unchanged
 * where it must be:
 *   - NO durable_object_namespace: deploy.mjs never sends STORE — it rides
 *     keep_bindings, because re-sending new_sqlite_classes at a live store is
 *     how a record gets endangered (deploy.mjs's own header rule).
 *   - NO secret_text beyond the cascade token: secrets ride keep_bindings.
 *     A deploy neither sets nor clears the instance's credentials.
 *
 * THE SUBSTITUTION (D-292): a plane is never deployed under the config's
 * `name` — the slug is the worker name (D-102). So any service target naming
 * `bio-plane` is the phantom and becomes the slug. Member targets stay
 * literal: members ARE deployed under their member names, by deploy-fleet on
 * this account and by the installer's fleet half in a group's (D-297/IC-82).
 *
 * THE REFUSAL: a binding class this derivation does not carry is REFUSED BY
 * NAME, never dropped. Sending a config's bindings minus a class it declares
 * is D-201's silent deletion arriving through the front door — the exact
 * defect that left biosmoke7 with zero service bindings for a month.
 */

const CARRIED = new Set(["vars", "r2_buckets", "services", "durable_objects"]);
/* Binding-declaring wrangler keys this derivation would MISCARRY if present.
   Listed explicitly so a new class in the config fails the deploy loudly in
   the same turn it appears, instead of deploying a plane quietly missing it. */
const KNOWN_BINDING_KEYS = [
  "kv_namespaces", "d1_databases", "queues", "analytics_engine_datasets",
  "ai", "browser", "vectorize", "hyperdrive", "dispatch_namespaces",
  "mtls_certificates", "send_email", "wasm_modules", "data_blobs", "text_blobs",
];

/**
 * Derive the bindings deploy.mjs sends, from the parsed wrangler config.
 * `version` comes from the deploy argument (resolve-version has already
 * refused any skew against the config's own vars.VERSION, so the two agree
 * by the time this runs — the argument is used because it is the one the
 * rollout gate waits for). `instanceClaudeToken` is DS-3's cascade value,
 * included only when the operator's environment carries it.
 */
export function deriveBindings(cfg, { slug, version, instanceClaudeToken } = {}) {
  if (!slug) throw new Error("REFUSED [NO_SLUG]: the binding derivation needs the instance slug — a default would be the hardcoded name D-292 exists to forbid.");
  if (!version) throw new Error("REFUSED [NO_VERSION]: the binding derivation needs the version the rollout gate will wait for.");

  const present = KNOWN_BINDING_KEYS.filter((k) =>
    cfg[k] !== undefined && (Array.isArray(cfg[k]) ? cfg[k].length > 0 : true));
  if (present.length) {
    throw new Error(
      `REFUSED [UNKNOWN_BINDING_CLASS]: wrangler.jsonc declares ${present.join(", ")}, `
      + "which this derivation does not carry. Deploying without a declared class is D-201's "
      + "silent deletion through the front door — teach deriveBindings the class in the same "
      + "change that adds it to the config.");
  }

  const bindings = [
    { type: "plain_text", name: "VERSION", text: String(version) },
    /* D-102: the instance name IS the worker name; bound from the slug because
       a worker cannot learn its own name. */
    { type: "plain_text", name: "INSTANCE_NAME", text: String(slug) },
  ];

  for (const [k, v] of Object.entries(cfg.vars || {})) {
    if (k === "VERSION") continue; /* the argument's, see above */
    bindings.push({ type: "plain_text", name: k, text: String(v) });
  }
  for (const b of cfg.r2_buckets || []) {
    bindings.push({ type: "r2_bucket", name: b.binding, bucket_name: b.bucket_name });
  }
  for (const s of cfg.services || []) {
    bindings.push({ type: "service", name: s.binding,
                    service: s.service === "bio-plane" ? slug : s.service });
  }
  if (instanceClaudeToken) {
    bindings.push({ type: "secret_text", name: "INSTANCE_CLAUDE_TOKEN", text: instanceClaudeToken });
  }

  /* The phantom must not survive derivation in any position. */
  for (const b of bindings) {
    if (b.service === "bio-plane") {
      throw new Error("REFUSED [PHANTOM_TARGET]: a derived binding still targets 'bio-plane', a name nothing is ever deployed under (D-292).");
    }
  }
  return bindings;
}

/** The service targets a deploy must pre-flight (deploy-fleet's pattern: the
 *  refusal should be ours and name the missing worker, not Cloudflare's 10143).
 *  The instance's own slug is excluded — the PUT that carries the binding is
 *  the PUT that creates/updates that very worker (the installer's noSelf
 *  lesson: the self-reference is the one target that cannot pre-exist). */
export function serviceTargets(bindings, slug) {
  return bindings.filter((b) => b.type === "service" && b.service !== slug)
                 .map((b) => b.service);
}
