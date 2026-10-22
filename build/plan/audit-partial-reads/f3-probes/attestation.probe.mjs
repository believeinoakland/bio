import test from "node:test";
const R = "/home/user/bio/bio-plane/test/m";
const { world, infoMd, sha } = await import(`${R}/attestation/fixture.mjs`);
const { multipart, mpFiles } = await import("./mp.mjs");
test("attestation whole", () => {
  const w = world();
  const m = multipart("b", { extra: { timestamp: { service: "https://tsa.example", token_file: "snapshots/b.tsr" }, attestations: [{ kind: "rfc3161", service: "https://tsa.example", file: "snapshots/b.tsr" }] } });
  const { files, register } = mpFiles(m, { md: infoMd("INFO-2026-0001-big") });
  const r = w.promotion.promote({ bundleId: "INFO-2026-0001-big", base: null, snapKey: "k", author: "member:alice", meta: { object_type: "information" }, files, register });
  console.log("promote", r.ok, r.reason ?? "");
  const a = w.att.attestationsOf(m.whole);
  console.log("whole", JSON.stringify(a));
  const c = w.cap("single");
  const doc = { file: c.path, locator: "https://example.org/x", retrieved: "2026-09-27T00:00:00Z", authority: "p", authority_state: "determined", authority_basis: "n", capture: { method: "acquire", grade: "B", actor_class: "session", sha256: c.sha, encoding: "utf8", bytes: Buffer.byteLength(c.text) }, origin: { kind: "named_request" }, timestamp: { service: "https://tsa.example", token_file: "snapshots/c.tsr" } };
  console.log("ctl promote", w.promoteInfo("INFO-2026-0002-ctl", { captures: [c], docs: [doc] }).ok);
  console.log("control", JSON.stringify(w.att.attestationsOf(c.sha)));
  console.log("unknown", JSON.stringify(w.att.attestationsOf(sha("zzz"))));
});
