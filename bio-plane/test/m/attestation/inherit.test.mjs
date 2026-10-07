/* attestation: a file cut out of a captured archive answers the archive's attestations as inherited (R7, as amended
   by N688; K1852 (1)): the archive's timestamp and co-archive, recursively through at most ARCHIVE_DEPTH_MAX archives,
   each with `inherited: {from, through}`. The world is the register as the unpack act records it (provenance R15,
   R42; K1940 (1): each file its own information document, its entry stating `capture.method: "unpacked"` and a
   `container` block), held by replay so the read is tested over what is recorded. Each at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha, provDoc } from "./fixture.mjs";
import { ARCHIVE_DEPTH_MAX } from "../../../src/ooxml.mjs";
import { TSA_ENDPOINTS, ARCHIVE_SERVICE } from "../../../src/tsa.mjs";

const PATH = "data/provenance.json";
const hex = (s) => Buffer.from(s, "utf8").toString("hex");

/* A register entry for a file cut out of `archive` at entry `index` (provenance R42's container block). */
function unpackedDoc(c, archive, index, extra = {}) {
  const bytes = Buffer.byteLength(c.text);
  return provDoc(c, {
    locator: `https://example.org/${archive.path}#zip:${index}`,
    capture: { method: "unpacked", grade: "B", actor_class: "session", sha256: c.sha, encoding: "utf8", bytes },
    container: { archive_sha256: archive.sha, index, compressed: bytes, uncompressed: bytes, local_offset: 0,
                 path: c.path.split("/").pop(), name_raw: hex(c.path.split("/").pop()), method: 0, crc32: 0,
                 member_sha256: c.sha, dos_time_stated: null },
    ...extra,
  });
}

/* What `op=attest`'s answer records on an entry: a token and, optionally, a co-archive, with their attempts. */
function attested(tag, { coArchive = true } = {}) {
  const tok = sha(`token of ${tag}`);
  const locator = `https://web.archive.org/web/2026/https://example.org/${tag}`;
  return {
    tok, locator,
    fields: {
      attestations: [{ file: `snapshots/timestamp-${tok.slice(0, 12)}.tsr`, kind: "rfc3161", service: TSA_ENDPOINTS[0],
                       sha256: tok, bytes: 11 }],
      ...(coArchive ? { co_archive: { service: ARCHIVE_SERVICE, locator } } : {}),
      attestation_attempts: [
        { service: TSA_ENDPOINTS[0], attempted: `2026-09-2${tag.length % 9}T01:00:00Z`, ok: true, kind: "rfc3161", token_sha256: tok },
        ...(coArchive ? [{ service: ARCHIVE_SERVICE, attempted: "2026-09-27T01:00:02Z", ok: true, kind: "co-archive",
                           archived_locator: locator }] : [])],
    },
  };
}

/* The answers an entry's attestations give, as R7 states them, in its bundle. */
function stated(a, bundle, inherited) {
  const where = { bundle, path: PATH };
  const at = (k) => a.fields.attestation_attempts.find((x) => x.kind === k)?.attempted;
  return [
    { kind: "rfc3161", service: TSA_ENDPOINTS[0], file: a.fields.attestations[0].file, token_sha: a.tok, at: at("rfc3161"),
      ...where, ...(inherited ? { inherited } : {}) },
    ...(a.fields.co_archive ? [{ kind: "co_archive", service: ARCHIVE_SERVICE, locator: a.locator, at: at("co-archive"),
                                 ...where, ...(inherited ? { inherited } : {}) }] : []),
  ];
}

const noNetwork = async (fn) => {
  const real = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("attestationsOf asked the network"); };
  try { return await fn(); } finally { globalThis.fetch = real; }
};

test("R7: a file cut out of an archive answers the archive's timestamp and co-archive as inherited {from, through}, its own first, asking nothing and writing nothing", async () => {
  await noNetwork(() => {
    const w = world();
    const zip = w.cap("records-zip", "the archive's bytes");
    const za = attested("records-zip");
    assert.equal(w.promoteInfo("INFO-2026-0001-records", { captures: [zip], docs: [provDoc(zip, za.fields)], replay: true }).ok, true);
    /* A file with no attestation of its own: it answers the archive's, each saying whose it is. */
    const f = w.cap("minutes", "a file cut out of the archive");
    assert.equal(w.promoteInfo("INFO-2026-0002-minutes", { captures: [f], docs: [unpackedDoc(f, zip, 3)], replay: true }).ok, true);
    const fa = w.att.attestationsOf(f.sha);
    assert.deepEqual({ ...fa, note: undefined }, { ok: true, sha256: f.sha, registered: true, note: undefined,
      attestations: stated(za, "INFO-2026-0001-records", { from: zip.sha, through: [3] }) });
    assert.match(fa.note, /no timestamp authority or archive was asked, and no token's signature was verified/);
    assert.match(fa.note, /cut out of a captured archive/);
    assert.match(fa.note, /token proves the archive existed at its instant, and so every byte cut out of it/);
    /* A file with an attestation of its own (a later direct capture's, K1852 (3)): its own first, with no `inherited`. */
    const g = w.cap("agenda", "another file of the archive");
    const ga = attested("agenda", { coArchive: false });
    assert.equal(w.promoteInfo("INFO-2026-0003-agenda", { captures: [g], docs: [unpackedDoc(g, zip, 0, ga.fields)], replay: true }).ok, true);
    const gb = w.att.attestationsOf(`sha256:${g.sha.toUpperCase()}`);
    assert.deepEqual(gb.attestations, [...stated(ga, "INFO-2026-0003-agenda", null),
                                       ...stated(za, "INFO-2026-0001-records", { from: zip.sha, through: [0] })]);
    assert.equal(gb.attestations[0].inherited, undefined, "the capture's own carry no inherited");
    assert.equal(gb.undetermined, undefined);
    /* Every answer says whose it is: its own (no inherited) or the archive's (inherited.from). */
    for (const a of [...fa.attestations, ...gb.attestations]) assert.ok(a.bundle && a.path === PATH);
    /* The archive's own answer is unchanged: nothing inherited, the note as before. */
    const z = w.att.attestationsOf(zip.sha);
    assert.deepEqual(z.attestations, stated(za, "INFO-2026-0001-records", null));
    assert.doesNotMatch(z.note, /inherited|cut out/);
    /* An archive with nothing recorded: the file inherits nothing, and that is the earned empty answer. */
    const bare = w.cap("bare-zip", "an archive never attested");
    w.promoteInfo("INFO-2026-0004-bare", { captures: [bare], replay: true });
    const h = w.cap("leaf", "a file of the bare archive");
    w.promoteInfo("INFO-2026-0005-leaf", { captures: [h], docs: [unpackedDoc(h, bare, 1)], replay: true });
    assert.deepEqual([w.att.attestationsOf(h.sha).attestations, w.att.attestationsOf(h.sha).undetermined], [[], undefined]);
    /* It writes nothing. */
    const before = w.snapshot();
    w.att.attestationsOf(f.sha); w.att.attestationsOf(g.sha);
    assert.deepEqual(w.snapshot(), before);
  });
});

test("R7: inheritance is recursive through at most ARCHIVE_DEPTH_MAX archives, `through` outermost first; a chain past the bound is undetermined beside what was read", async () => {
  await noNetwork(() => {
    const w = world();
    /* archives[0] is the outermost; each next one is cut out of the one before it at entry index i + 2. One more
       archive than the bound, so the innermost file's chain runs past it. */
    const n = ARCHIVE_DEPTH_MAX + 1;
    const archives = [], marks = [];
    for (let i = 0; i < n; i++) {
      const a = w.cap(`zip${i}`, `archive ${i}`);
      const m = attested(`zip${i}`, { coArchive: i % 2 === 0 });
      const doc = i === 0 ? provDoc(a, m.fields) : unpackedDoc(a, archives[i - 1], i + 1, m.fields);
      assert.equal(w.promoteInfo(`INFO-2026-000${i + 1}-zip`, { captures: [a], docs: [doc], replay: true }).ok, true);
      archives.push(a); marks.push(m);
    }
    const leaf = w.cap("leaf", "the innermost file");
    w.promoteInfo("INFO-2026-0099-leaf", { captures: [leaf], docs: [unpackedDoc(leaf, archives[n - 1], 7)], replay: true });
    const r = w.att.attestationsOf(leaf.sha);
    /* The nearest archive first, each `through` from that archive down to the leaf, outermost first. */
    const expected = [];
    let through = [7];
    for (let k = n - 1; k >= n - ARCHIVE_DEPTH_MAX; k--) {
      expected.push(...stated(marks[k], `INFO-2026-000${k + 1}-zip`, { from: archives[k].sha, through }));
      through = [k + 1, ...through];
    }
    assert.deepEqual(r.attestations, expected);
    /* The archive past the bound is not read, and the answer says so, naming it. */
    const past = archives[n - 1 - ARCHIVE_DEPTH_MAX];
    assert.equal(r.attestations.some((a) => a.inherited?.from === past.sha), false);
    assert.match(r.undetermined, new RegExp(`ARCHIVE_DEPTH_MAX \\(${ARCHIVE_DEPTH_MAX}\\)`));
    assert.match(r.undetermined, new RegExp(past.sha));
    /* One level up the chain fits the bound: every archive above it is answered, and nothing is undetermined. */
    const inner = w.att.attestationsOf(archives[n - 1].sha);
    assert.equal(inner.undetermined, undefined);
    assert.deepEqual(inner.attestations.slice(0, marks[n - 1].fields.co_archive ? 2 : 1),
                     stated(marks[n - 1], `INFO-2026-000${n}-zip`, null));
    assert.deepEqual(inner.attestations.filter((a) => a.inherited).map((a) => [a.inherited.from, a.inherited.through]),
      archives.slice(0, n - 1).reverse().flatMap((a, j) => {
        const k = n - 2 - j;
        const t = Array.from({ length: n - 1 - k }, (_, x) => k + 1 + x + 1);
        return Array(marks[k].fields.co_archive ? 2 : 1).fill([a.sha, t]);
      }));
    /* A chain that names itself again is bounded the same way: the read ends and says why. */
    const loop = w.cap("loop", "a file whose container names itself");
    w.promoteInfo("INFO-2026-0098-loop", { captures: [loop], docs: [unpackedDoc(loop, loop, 0)], replay: true });
    const l = w.att.attestationsOf(loop.sha);
    assert.equal(l.ok, true);
    assert.match(l.undetermined, /ARCHIVE_DEPTH_MAX/);
  });
});

test("R7: an archive whose register cannot be read, an archive no register names, and a container block naming no archive are each stated in undetermined beside what was read", async () => {
  await noNetwork(() => {
    const w = world();
    /* An archive whose home's register cannot be read. */
    const broken = w.cap("broken-zip", "an archive with a broken register");
    w.promotion.promote({ bundleId: "INFO-2026-0001-broken", base: null, snapKey: "b", author: "member:alice", replay: true,
      meta: { object_type: "information" }, register: [{ sha256: broken.sha, path: broken.path, encoding: "utf8", bytes: 9 }],
      files: [{ path: "bundle.md", text: [
        "---", "id: INFO-2026-0001-broken", "object_type: information", "schema: information@1", 'title: "B"',
        "current_state: collected", "prior_state: null", 'created: "2026-09-27T00:00:00Z"',
        'last_updated: "2026-09-27T00:00:00Z"', "references: []", "state_history: []", "criticality: supporting",
        "---", "", "## Summary", "", "A document.", ""].join("\n") },
        { path: broken.path, text: broken.text }, { path: PATH, text: "{broken" }] });
    const own = attested("m1", { coArchive: false });
    const m1 = w.cap("m1", "a file of the broken archive");
    w.promoteInfo("INFO-2026-0002-m1", { captures: [m1], docs: [unpackedDoc(m1, broken, 2, own.fields)], replay: true });
    const a = w.att.attestationsOf(m1.sha);
    assert.deepEqual([a.registered, a.attestations], [true, stated(own, "INFO-2026-0002-m1", null)], "what was read stands");
    assert.match(a.undetermined, new RegExp(`for the archive ${broken.sha} it was cut out of \\(through entries 2\\)`));
    assert.match(a.undetermined, /cannot be read as a register/);
    /* An archive no register row names. */
    const ghost = { sha: sha("an archive the record never registered"), path: "snapshots/ghost.zip" };
    const m2 = w.cap("m2", "a file of an unregistered archive");
    w.promoteInfo("INFO-2026-0003-m2", { captures: [m2], docs: [unpackedDoc(m2, ghost, 0)], replay: true });
    const b = w.att.attestationsOf(m2.sha);
    assert.deepEqual([b.registered, b.attestations], [true, []]);
    assert.match(b.undetermined, new RegExp(`for the archive ${ghost.sha}`));
    assert.match(b.undetermined, /no register row names/);
    /* A container block naming no archive digest, or none at all: whose attestations it carries cannot be read. */
    const m3 = w.cap("m3", "a file whose container names no archive");
    const bad = unpackedDoc(m3, { sha: "not a digest", path: "x" }, 1);
    const m4 = w.cap("m4", "an unpacked file with no container block");
    const missing = unpackedDoc(m4, broken, 1);
    delete missing.container;
    const m5 = w.cap("m5", "a file whose container's index is not a whole number");
    const noIndex = unpackedDoc(m5, broken, -1);
    w.promoteInfo("INFO-2026-0004-m3", { captures: [m3, m4, m5], docs: [bad, missing, noIndex], replay: true });
    for (const c of [m3, m4, m5]) {
      const r = w.att.attestationsOf(c.sha);
      assert.deepEqual([r.ok, r.attestations], [true, []], c.path);
      assert.match(r.undetermined, /names no archive digest of 64 hex and whole entry index/, c.path);
      assert.match(r.note, /cut out of a captured archive/, c.path);
    }
  });
});
