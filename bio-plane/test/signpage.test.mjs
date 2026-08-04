/* NEGATIVE CONTROL: (run 2026-07-31) corrupt the SSHSIG signed-preimage magic in the page's own sshsig() ("SSHSIG" -> "SSHXIG") in the SOURCE tools/sign-release.html (this suite lifts the inline script from that file, NOT the generated src/signpage.mjs) -> 6 assertions fail (ssh-keygen rejects the page's release and ratification signatures); restored, 35 pass. */
/* The signing page, checked against OpenSSH.
 *
 * Negative-control detail: corrupt the SSHSIG signed-preimage magic in the page's own sshsig() ("SSHSIG" -> "SSHXIG") in the SOURCE tools/sign-release.html (this suite lifts the inline script from that file, NOT the generated src/signpage.mjs) -> 6 assertions fail (ssh-keygen rejects the page's release and ratification signatures); restored, 35 pass.
 *
 * Bob signs in a browser tab because he has no terminal, which means the
 * page reimplements SSHSIG construction in about forty lines of
 * WebCrypto. Reimplemented crypto is worth exactly what its conformance
 * tests are worth, so this suite runs the page's real functions, not a
 * copy of them: the inline script is lifted out of the HTML and executed
 * against a stub DOM, then its output is handed to stock ssh-keygen for
 * judgment. If the page and OpenSSH ever disagree, this suite is where
 * that shows up.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash, webcrypto } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import vm from "node:vm";
import { verifySshsig, NS_RELEASE, NS_RATIFY, ratifyStatement } from "../src/sshsig.mjs";

/* The whole point of this suite is to hand the page's WebCrypto output to stock
   ssh-keygen for judgment, so without ssh-keygen there is nothing to judge it
   against: SKIP LOUDLY WITH A NAMED REASON and exit 0 rather than dying with an
   unhandled spawn error (D-93). Same guard as ratify.test.mjs. */
if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- signpage ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("signpage: SKIPPED — ssh-keygen not on PATH; the page's reimplemented SSHSIG "
    + "output is only worth its conformance against stock ssh-keygen, which cannot run without it");
  process.exit(0);
}

const PAGE = fileURLToPath(new URL("../../tools/sign-release.html", import.meta.url));
let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* Lift the page's script out and run it, DOM and all. The stub is dumb on
   purpose: any element the page asks for exists and remembers what was set
   on it, so nothing is mocked away that the page actually relies on. */
const html = readFileSync(PAGE, "utf8");
const script = html.slice(html.lastIndexOf("<script>") + 8, html.lastIndexOf("</script>"));
const els = new Map();
const el = () => ({ value: "", innerHTML: "", disabled: false, files: [],
                    onclick: null, classList: { toggle() {} }, setAttribute() {} });
const sandbox = {
  crypto: webcrypto, TextEncoder, atob, btoa, console, setTimeout,
  navigator: { clipboard: { writeText: async () => {} } },
  document: {
    getElementById: (id) => (els.has(id) || els.set(id, el()), els.get(id)),
    addEventListener: () => {},
    createElement: () => ({ style: {}, select() {}, click() {} }),
    body: { appendChild() {}, removeChild() {} },
    execCommand: () => true,
  },
};
vm.createContext(sandbox);
/* Top-level const in a script does not land on the global object, so the
   page's own last line hands its helpers out by name. */
vm.runInContext(script + "\n;globalThis.__page = { sshsig, keysFromSeed, wrapKey, parseKeyString, rawKeyString, generateAll, keyReport, pubLine, JOBS, KEYS, hex };", sandbox);
const { sshsig, keysFromSeed, wrapKey, parseKeyString, rawKeyString, generateAll, keyReport, pubLine, JOBS, KEYS } = sandbox.__page;

t("the page exposes its signing primitives", [typeof sshsig, typeof keysFromSeed, typeof generateAll], ["function", "function", "function"]);

/* A fixed seed makes the whole suite reproducible, including the public key
   OpenSSH derives from the same seed. */
const seed = new Uint8Array(32).map((_, i) => (i * 37 + 11) % 256);
const { priv, raw32 } = await keysFromSeed(seed);
const pub = pubLine(raw32, "page-test");

const dir = mkdtempSync(join(tmpdir(), "signpage-"));
const allowed = join(dir, "allowed_signers");
writeFileSync(allowed, `bob@bio ${pub.split(/\s+/).slice(0, 2).join(" ")}\n`);

/* ---- the page's public key is the one OpenSSH would compute ---- */
const openssh = (() => {
  /* Build an OpenSSH private key file from the same seed, then let
     ssh-keygen tell us the public half. Agreement here means the page's
     JWK round trip derives the right key, not merely a consistent one. */
  const f = join(dir, "from-seed");
  const sshPub = Buffer.concat([
    Buffer.from([0, 0, 0, 11]), Buffer.from("ssh-ed25519"),
    Buffer.from([0, 0, 0, 32]), Buffer.from(raw32),
  ]);
  const check = Buffer.from([1, 2, 3, 4, 1, 2, 3, 4]);
  const unpadded = Buffer.concat([
    check, sshPub,
    Buffer.from([0, 0, 0, 64]), Buffer.from(seed), Buffer.from(raw32),
    Buffer.from([0, 0, 0, 0]),
  ]);
  /* The private section is padded to the cipher block size with 1,2,3,... */
  const padLen = (8 - (unpadded.length % 8)) % 8;
  const privBlob = Buffer.concat([unpadded, Buffer.from(Array.from({ length: padLen }, (_, i) => i + 1))]);
  const body = Buffer.concat([
    Buffer.from("openssh-key-v1\0"),
    Buffer.from([0, 0, 0, 4]), Buffer.from("none"),
    Buffer.from([0, 0, 0, 4]), Buffer.from("none"),
    Buffer.from([0, 0, 0, 0]),
    Buffer.from([0, 0, 0, 1]),
    Buffer.from([0, 0, 0, sshPub.length]), sshPub,
    Buffer.from([0, 0, 0, privBlob.length]), privBlob,
  ]);
  writeFileSync(f, "-----BEGIN OPENSSH PRIVATE KEY-----\n"
    + body.toString("base64").replace(/(.{70})/g, "$1\n") + "\n-----END OPENSSH PRIVATE KEY-----\n",
    { mode: 0o600 });
  return execFileSync("ssh-keygen", ["-y", "-f", f], { encoding: "utf8" }).trim();
})();
t("the page derives the same public key ssh-keygen does",
  openssh.split(/\s+/)[1], pub.split(/\s+/)[1]);

/* ---- release signatures verify under stock ssh-keygen ---- */
const asset = new Uint8Array(9000).map((_, i) => (i * 13) % 256);
const relSig = await sshsig(priv, raw32, "bio-release", asset);
const assetFile = join(dir, "asset.bin"), relSigFile = join(dir, "asset.bin.sig");
writeFileSync(assetFile, asset); writeFileSync(relSigFile, relSig);
const verifyWith = (ns, sigFile, msgFile) => {
  try {
    execFileSync("ssh-keygen",
      ["-Y", "verify", "-f", allowed, "-I", "bob@bio", "-n", ns, "-s", sigFile],
      { input: readFileSync(msgFile), stdio: ["pipe", "ignore", "ignore"] });
    return true;
  } catch { return false; }
};
t("ssh-keygen accepts the page's release signature", verifyWith("bio-release", relSigFile, assetFile), true);
t("the armor is the shape OpenSSH writes", /^-----BEGIN SSH SIGNATURE-----\n[A-Za-z0-9+/=\n]+\n-----END SSH SIGNATURE-----\n$/.test(relSig), true);

/* ---- ratification signatures verify too, and the namespaces are sealed ---- */
const ID = "INFO-2026-5460-sewer-fund-transfers";
const SHA = createHash("sha256").update("a bundle").digest("hex");
const ratSig = await sshsig(priv, raw32, "bio-ratify", ratifyStatement(ID, SHA));
const stmtFile = join(dir, "stmt"), ratSigFile = join(dir, "stmt.sig");
writeFileSync(stmtFile, ratifyStatement(ID, SHA)); writeFileSync(ratSigFile, ratSig);
t("ssh-keygen accepts the page's ratification signature", verifyWith("bio-ratify", ratSigFile, stmtFile), true);
t("a ratification signature is not a release signature", verifyWith("bio-release", ratSigFile, stmtFile), false);

/* ---- and the plane accepts what the page produces ---- */
t("the plane verifies the page's release signature",
  (await verifySshsig(relSig, asset, NS_RELEASE, [pub])).ok, true);
t("the plane names the signer",
  (await verifySshsig(relSig, asset, NS_RELEASE, [pub])).keyB64, pub.split(/\s+/)[1]);
t("the plane verifies the page's ratification",
  (await verifySshsig(ratSig, ratifyStatement(ID, SHA), NS_RATIFY, [pub])).ok, true);
t("altered bytes fail",
  (await verifySshsig(relSig, asset.map((b, i) => (i === 5 ? b ^ 1 : b)), NS_RELEASE, [pub])).reason, "BAD_SIGNATURE");
t("a different bundle hash fails",
  (await verifySshsig(ratSig, ratifyStatement(ID, "0".repeat(64)), NS_RATIFY, [pub])).reason, "BAD_SIGNATURE");
t("an unlisted key fails",
  (await verifySshsig(relSig, asset, NS_RELEASE, [])).reason, "UNKNOWN_KEY");

/* ---- one press produces two usable keys, and nothing has to be typed ---- */
console.log("\n--- one-press generation ---");
const made = await generateAll();
t("both jobs get a key", Object.keys(made).sort(), ["bio-ratify", "bio-release"]);
t("both keys are loaded and ready to sign", [!!KEYS.release, !!KEYS.ratify], [true, true]);
t("the two keys are different", made["bio-release"].pub === made["bio-ratify"].pub, false);
t("public keys are authorized_keys lines", /^ssh-ed25519 AAAAC3NzaC1lZDI1NTE5[A-Za-z0-9+/=]+ bio-release$/.test(made["bio-release"].pub), true);
t("private keys name their own job", made["bio-ratify"].priv.startsWith("BIOKEY-RAW1.bio-ratify."), true);

/* The generated release key must actually verify under OpenSSH, not merely
   look well formed: generation and signing are one path or neither is trusted. */
const genAsset = new Uint8Array(512).map((_, i) => (i * 31) % 256);
const genSig = await sshsig(KEYS.release.priv, KEYS.release.raw32, "bio-release", genAsset);
const genAllowed = join(dir, "gen_signers");
writeFileSync(genAllowed, `bob@bio ${made["bio-release"].pub.split(/\s+/).slice(0, 2).join(" ")}\n`);
const genAssetFile = join(dir, "gen.bin"), genSigFile = join(dir, "gen.bin.sig");
writeFileSync(genAssetFile, genAsset); writeFileSync(genSigFile, genSig);
let genOk = true;
try {
  execFileSync("ssh-keygen", ["-Y", "verify", "-f", genAllowed, "-I", "bob@bio", "-n", "bio-release", "-s", genSigFile],
    { input: readFileSync(genAssetFile), stdio: ["pipe", "ignore", "ignore"] });
} catch { genOk = false; }
t("ssh-keygen accepts a signature from a freshly generated key", genOk, true);

t("two presses never produce the same key",
  (await generateAll())["bio-release"].priv === made["bio-release"].priv, false);

/* ---- keys round trip with no passphrase, and with one ---- */
console.log("\n--- keeping and reloading a key ---");
const loaded = await parseKeyString(made["bio-release"].priv);
t("a raw key reloads", loaded.label, "bio-release");
const reKeys = await keysFromSeed(loaded.seed);
t("and is byte-identical to the original",
  pubLine(reKeys.raw32, loaded.label), made["bio-release"].pub);
t("a reloaded key signs the same way",
  (await verifySshsig(await sshsig(reKeys.priv, reKeys.raw32, "bio-release", genAsset),
                      genAsset, NS_RELEASE, [made["bio-release"].pub])).ok, true);

const wrapped = await wrapKey(loaded.seed, "a-long-enough-passphrase", "bio-release");
t("a protected key still names its job", wrapped.startsWith("BIOKEY1.bio-release."), true);
t("the protected blob does not contain the seed",
  wrapped.includes(Buffer.from(loaded.seed).toString("base64")), false);
t("it reopens with the passphrase",
  Buffer.from((await parseKeyString(wrapped, "a-long-enough-passphrase")).seed).toString("hex"),
  Buffer.from(loaded.seed).toString("hex"));
const refuse = async (blob, pass) => { try { await parseKeyString(blob, pass); return null; } catch (e) { return e.message; } };
t("the wrong passphrase is refused in plain words", /wrong passphrase/.test(await refuse(wrapped, "nope") || ""), true);
t("a protected key with no passphrase says what to do", /protected with a passphrase/.test(await refuse(wrapped) || ""), true);
t("a key for an unknown job is refused",
  /does not name a job/.test(await refuse("BIOKEY-RAW1.bio-nonsense.AAAA") || ""), true);
t("something that is not a key at all says so",
  /does not look like a BIO private key/.test(await refuse("hello") || ""), true);

/* ---- the saved file carries everything needed to sign again ---- */
const report = keyReport(made);
t("the download names both jobs",
  [report.includes("Release key"), report.includes("Ratification key")], [true, true]);
t("the download carries both private keys",
  [report.includes(made["bio-release"].priv), report.includes(made["bio-ratify"].priv)], [true, true]);

/* ---- the page is a local file with no network reach ---- */
t("the page loads no remote resource", /<(script|link|img|iframe)[^>]+(src|href)\s*=\s*["']https?:/i.test(html), false);
t("the page makes no outbound call", /\b(fetch|XMLHttpRequest|navigator\.sendBeacon|WebSocket)\s*\(/.test(script), false);
t("the page never stores anything", /\b(localStorage|sessionStorage|indexedDB|document\.cookie)\b/.test(script), false);
t("generating a key needs no typed input", /id="gen"[^>]*>Generate my keys</.test(html.replace(/\n\s*/g, " ")), true);

console.log(`\nsignpage: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
