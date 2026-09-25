/* NEGATIVE CONTROL: DECLARED IN, AND RUN BY, `test/setup-signeradd.control.mjs` — deliberately NOT a `.test.mjs`, because it builds ARMED COPIES of the sources while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/setup-signeradd.control.mjs [arm]`. RESULTS, RUN 2026-09-25 on branch land/worker/D-605 over base `37430658` (land/worker/D-596; real src/index.mjs 858,501 B sha256 6540df8700f4, src/store.mjs 3,350,113 B sha256 814819cb085a, src/setup.mjs 85,670 B sha256 962d2992a3bd; untouched: YES), all five AS DECLARED, none failed to arm: (a) baseline 9/0 · (b) whole-line, THE ROW'S CONTROL — the page posts the whole pasted line as keyB64 again: 4/5, K2, K3, K4, K5 and K7 failing BY NAME, K3 reading `[false,"BAD_KEY",null]` · (c) handler-bypasses, the pre-D-605 call restored verbatim beside a correct builder: 8/1, K0 alone · (d) label-dropped: 6/3 (K2, K3, K4) · (e) respelled, the split in D-134's own regex spelling (the over-strictness direction): 9/0.
 * =========================================================================
 * D-605 — A SIGNING KEY REGISTERED FROM THE SETUP PAGE. `BIO_Membership_Architecture_v2.md` §4.9 (signeradd), with the
 * setup page as D-596 leaves it.
 *
 * THE DEFECT: the setup page's key form posted the WHOLE pasted `ssh-ed25519 AAAA… label` line as `keyB64`, and
 * `Store#signerAdd` takes only the line's base64 field (`/^AAAA[A-Za-z0-9+/=]+$/`), so every registration from the page
 * was refused BAD_KEY. The fix splits the line in the page (`signerAddBody`), as the member UI's custodial dialog does
 * (D-134): the second token is `keyB64`, the label is `comment`. `op=signeradd` is unchanged, and K1 pins that it still
 * refuses a whole line — which is why the page must split it.
 *
 * READ THROUGH THE SERVED PAGE: the page is fetched at `/?store=scratch` as the plane serves it; `signerAddBody` is
 * taken from those SERVED BYTES (never from the source file) and run on a real ed25519 public-key line; the body it
 * builds is posted to `op=signeradd` by an administrator's session, and the roster is read back.
 *
 * WHAT THIS CANNOT SEE, stated: a browser's click (the handler's call to `signerAddBody` is pinned by name in K0, not
 * driven through a DOM); the page's `post` helper, which sends no `store` — every call here names `store=scratch`
 * instead (D-325); and a key line from the signing page itself (the line here is built from a Node ed25519 key in the
 * OpenSSH wire format the signing page emits: string "ssh-ed25519", string 32-byte key).
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { generateKeyPairSync } from "node:crypto";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
/* The control driver points this at an ARMED copy of src/. */
const SRC_DIR = process.env.SETUP_SIGNERADD_SRC || join(PLANE, "src");
const IDX = join(SRC_DIR, "index.mjs");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-d605-setup-signer", MEM = "mem-d605-setup-signer", PRB = "prb-d605-setup-signer";
const ORIGIN = "http://x";
const S = "&store=scratch";                      /* D-325: named on EVERY call */
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;

/* A REAL ed25519 public key in the OpenSSH line format: base64(string "ssh-ed25519" + string key32). */
const sshLine = (label) => {
  const { publicKey } = generateKeyPairSync("ed25519");
  const raw = Buffer.from(publicKey.export({ format: "jwk" }).x, "base64url");
  const str = (b) => { const n = Buffer.alloc(4); n.writeUInt32BE(b.length); return Buffer.concat([n, b]); };
  const b64 = Buffer.concat([str(Buffer.from("ssh-ed25519")), str(raw)]).toString("base64");
  return { b64, line: label ? `ssh-ed25519 ${b64} ${label}` : `ssh-ed25519 ${b64}` };
};

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, PROBE_TOKEN: PRB, VERSION: "test", INSTANCE_NAME: "oak-town",
              GOVERNOR_APPETITE_PER_MIN: "60000" },
});
const POST = async (q, body) => {
  const r = await mf.dispatchFetch(`${ORIGIN}/api/?${q}`, { method: "POST", body: JSON.stringify(body ?? {}) });
  try { return rP(JSON.parse(await r.text())); } catch { return null; }
};
const GET = async (q) => {
  const r = await mf.dispatchFetch(`${ORIGIN}/api/?${q}`);
  try { return rP(JSON.parse(await r.text())); } catch { return null; }
};

try {
  /* An administrator's SESSION, as the setup page holds one. op=enroll and op=login are pinned to the record
     (NAMESPACE_PINNED, D-461), so ruth is enrolled in BOTH namespaces of this throwaway Miniflare, as
     group-identity.test.mjs enrols its members; every signer act below names scratch. */
  for (const st of ["", S]) {
    const add = await POST(`op=memberadd&token=${ADM}${st}`, { memberId: "ruth", cover: "cover for ruth", role: "admin",
                                                             capabilities: ["contribute", "publish"] });
    if (!add?.invite) throw new Error(`memberadd${st}: ${JSON.stringify(add)}`);
    const en = await POST(`op=enroll${st}`, { invite: add.invite, handle: "ruth", password: "ruth-passphrase-d605" });
    if (!en?.ok) throw new Error(`enroll${st}: ${JSON.stringify(en)}`);
  }
  const lg = await POST("op=login", { role: "member:ruth", password: "ruth-passphrase-d605" });
  if (!lg?.token) throw new Error(`login: ${JSON.stringify(lg)}`);
  const SESS = `token=${encodeURIComponent(lg.token)}`;
  const roster = async () => (await GET(`op=signerlist&${SESS}${S}`))?.signers || [];
  /* The label is compared with its whitespace runs collapsed: a page that keeps a pasted label's spacing and one that
     tidies it both register the label (the control's `respelled` arm keeps it). */
  const rowOf = async (b64) => {
    const r = (await roster()).find((x) => x.key_b64 === b64);
    return r ? { member: r.member_id, comment: r.comment == null ? null : String(r.comment).replace(/\s+/g, " "),
                 status: r.status } : null;
  };

  /* THE PAGE AS SERVED, and the key form's body builder out of its bytes. */
  const res = await mf.dispatchFetch(`${ORIGIN}/?store=scratch`);
  const page = await res.text();
  const defs = page.match(/function signerAddBody\(line, who\)\{[\s\S]*?\n\}/g) || [];
  const handler = page.split('post("signeradd", signerAddBody($("#k-key").value, $("#k-who").value))').length - 1;
  t("K0: the setup page served at / (store=scratch) defines the key form's body builder ONCE, and the form's "
    + "handler posts op=signeradd through it", { status: res.status, defs: defs.length, handler }, { status: 200, defs: 1, handler: 1 });
  let signerAddBody = () => ({ keyB64: null });
  try { if (defs.length) signerAddBody = new Function(`${defs[0]}\nreturn signerAddBody;`)(); }
  catch (e) { console.log(`  (the served signerAddBody did not compile: ${e.message})`); }

  const A = sshLine("bio-ratify");
  console.log(`  (fixture: ${A.b64.length}-char base64 field ${A.b64.slice(0, 20)}…; line ${A.line.length} chars)`);
  t("K0b: the fixture is a real ssh-ed25519 line whose base64 field the op's own shape admits",
    [A.b64.length, /^AAAA[A-Za-z0-9+/=]+$/.test(A.b64), A.line.split(" ").length], [68, true, 3]);

  /* THE PREMISE: the op is unchanged and refuses a whole line — what the page used to send. */
  const whole = await POST(`op=signeradd&${SESS}${S}`, { keyB64: A.line, memberId: "ruth" });
  t("K1: op=signeradd given the WHOLE line (the pre-D-605 page's body) is refused BAD_KEY, and nothing is written",
    [whole?.ok ?? null, whole?.reason ?? null, await rowOf(A.line), await rowOf(A.b64)], [false, "BAD_KEY", null, null]);

  /* THE ROW: a whole line pasted into the page registers the key. */
  const bodyA = signerAddBody(A.line, "ruth");
  t("K2: the served page sends a pasted line's SECOND token as keyB64 and its label as comment",
    bodyA, { keyB64: A.b64, memberId: "ruth", comment: "bio-ratify" });
  const addA = await POST(`op=signeradd&${SESS}${S}`, bodyA);
  t("K3: a whole public-key line pasted into the setup page REGISTERS the key: the op answers ok (not BAD_KEY) and the "
    + "roster reads it active under ruth with its label",
    [addA?.ok ?? null, addA?.reason ?? null, await rowOf(A.b64)],
    [true, null, { member: "ruth", comment: "bio-ratify", status: "active" }]);

  /* OVER-STRICTNESS: a correct paste in spellings the page did not have to anticipate. */
  const B = sshLine(null);
  const bodyB = signerAddBody(`  ssh-ed25519\t${B.b64}\t ruth's  laptop   bio-ratify \n`, "  Ruth ");
  const addB = await POST(`op=signeradd&${SESS}${S}`, bodyB);
  t("K4: a line pasted with tabs, runs of spaces, a trailing newline and a many-word label, for \" Ruth \", registers "
    + "too, the label's words kept",
    [bodyB.keyB64 === B.b64, addB?.ok ?? null, await rowOf(B.b64)],
    [true, true, { member: "ruth", comment: "ruth's laptop bio-ratify", status: "active" }]);
  const C = sshLine(null);
  const bodyC = signerAddBody(C.line, "ruth");
  const addC = await POST(`op=signeradd&${SESS}${S}`, bodyC);
  t("K5: a line with no label registers with no comment sent and none stored",
    ["comment" in bodyC, addC?.ok ?? null, await rowOf(C.b64)], [false, true, { member: "ruth", comment: null, status: "active" }]);

  /* WHAT IS NOT A LINE is sent as pasted, and the plane — not the page — says what it makes of it. */
  const bodyD = signerAddBody("  not a key at all ", "ruth");
  const addD = await POST(`op=signeradd&${SESS}${S}`, bodyD);
  t("K6: text that is not a key line is sent as pasted and the plane refuses it BAD_KEY",
    [bodyD, addD?.reason ?? null], [{ keyB64: "not a key at all", memberId: "ruth" }, "BAD_KEY"]);

  t("K7: the roster holds exactly the three keys registered here, and no whole line",
    (await roster()).map((r) => r.key_b64).sort(), [A.b64, B.b64, C.b64].sort());
} catch (e) {
  console.log(`  FAIL  suite aborted: ${e.stack || e}`); fail++;
} finally {
  await mf.dispose();
}
console.log(`\nsetup-signeradd: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
