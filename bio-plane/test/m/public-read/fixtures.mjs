/* public-read's published fixtures (fix-round 10, Wave A; K4990, K4993, K5044, K5074): the answers this module gives to
 * its users, made by its real code each time a test calls one, never stored. A user module takes its value from here
 * and never builds one by hand. Each export returns the real answers the module gave, so a user names no code of its own. */
import { world, stubOf, bucket } from "./fixture.mjs";
import { bindPublishedPlane, assembleCaseContainer } from "../../../src/publication/worker.mjs";

const enc = (s) => new TextEncoder().encode(s);
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
bindPublishedPlane({
  json, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER", STORE_SILENT_DETAIL: "silent", PUBLISHED_STORE: "bio",
  doAnswer: async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
                             return out && out.ok === true ? { answered: true, result: out.result } : { answered: false }; },
  storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502),
  requiredArgument: (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error }),
});

const CASE = "CASE-2026-0001", F = "INQ-2026-0001", DOC = "INFO-2026-0001-minutes", GONE = "INFO-2026-0404-gone";
const IDENTITY = () => ({ ok: true, group: "parks-group", display_name: "Friends of the Parks", domain: "parks.example",
                          domain_verified_at: "2026-10-01T00:00:00Z" });

/** The registration refusals of the one identity source (R34): the answer to a malformed registration, the first
 *  registration that stands, and the answer to a second one, which is refused because the first holds. */
export function groupIdentityRegistrar() {
  const w = world();
  const malformed = w.pr.registerGroupIdentity({});
  const first = w.pr.registerGroupIdentity({ identity: IDENTITY });
  const declared = w.pr.registerGroupIdentity({ identity: () => ({ ...IDENTITY(), group: "squatter" }) });
  return { malformed, first, declared, group: w.pr.groupFields().group };
}

/* A complete edition over F resting on DOC (and on `extra` rows), signed, F's bytes in the bucket unless `noFinding`:
 * the case file's own inputs, as publication's commit leaves them. */
function scene({ extra = [], noFinding = false } = {}) {
  const w = world(), env = { PUBLISHED: bucket() };
  w.doc(DOC);
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry(F, { legs: [{ target: DOC }] });
  const pin = w.head(F);
  const sha = w.row(`SELECT capture_sha FROM register WHERE bundle_id=?`, DOC).capture_sha;
  const materials = [{ ref: DOC, kind: "document", sha, text_sha: null, origin: null, archived_copy: null, included: true,
                       rests_under: "load_bearing" }, ...extra];
  w.prepare(CASE, 1, { format: "bio-case-document/7", project: proj, roles: [{ target: F, version_sha: pin }], materials });
  const roster = [{ bundle_id: F, version_sha: pin }];
  if (w.signCase(CASE, 1, { project: proj, roster }).ok !== true) throw new Error("fixture: the case did not sign");
  if (w.signFinding(F).ok !== true) throw new Error("fixture: the finding did not sign");
  if (!noFinding) env.PUBLISHED.m.set(`bio/published/${pin}`, enc(w.text(F)));
  env.PUBLISHED.m.set(`bio/published/${sha}`, enc(`the text of ${DOC}`));
  return { w, env };
}
const cs = (w) => w.p.caseEditionState(CASE, 1, "parks-group");
const call = (w, env, extra = {}) => ({ env, stub: stubOf(w), storeName: "bio", cs: cs(w), via: "fixture", ...extra });

/** The case-file build refusals `assembleCaseContainer` gives (R6, R23, G54), each made by the real assembly over a real
 *  edition: a material the case lists and this copy does not hold (MATERIAL_MISSING, at step materials); a bucket that
 *  refuses its write (BUCKET_FAILED, at step bucket_put); and a finding whose bytes are absent, so no case file is
 *  built at all (CASE_FILE_NOT_ASSEMBLED, naming the finding). */
export async function assembleCaseContainerRefusal() {
  const missing = scene({ extra: [{ ref: GONE, kind: "document", sha: "b".repeat(64), text_sha: null, origin: null,
                                    archived_copy: null, included: true, rests_under: "supporting" }] });
  const materialMissing = await assembleCaseContainer(call(missing.w, missing.env));

  const failing = scene();
  failing.env.PUBLISHED.put = async () => { throw new Error("bucket write refused"); };
  const bucketFailed = await assembleCaseContainer(call(failing.w, failing.env));

  const absent = scene({ noFinding: true });
  const notAssembled = await assembleCaseContainer(call(absent.w, absent.env));
  return { materialMissing, bucketFailed, notAssembled };
}
