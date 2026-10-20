/* credentials R82 (T51; K4168, K4202): each op this module declares in DECLARED_OPS is held true against the op as the door runs
   it (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is
   refused naming it, and a field outside accepts is dropped or refused naming it. The ops the ops map holds are called through
   it, `url` carrying the control plane's stamps and the fields as the body; `signerregisterown` and `signerrevokeown` are the
   screens' names for the arms the store door routes as `signerregister` and `signerrevoke` (op-declarations R21), which call
   this module's services with the body and the stamped `by`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, credentialsOps, Credentials } from "../../../src/credentials/index.mjs";
import { world, PASSWORD } from "./fixture.mjs";

/* two answers agree when they are both done or both refused for the same reason, whatever the instants and secrets in them */
const sameCode = (x, y) => !!x && !!y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
/* a refusal names a field by one of the field's codes (code, reason or error), the table's, never by guessing at its words */
const named = (codes) => (answer, field) => !!answer && typeof answer === "object"
  && (codes[field] || []).some((c) => answer.code === c || answer.reason === c || answer.error === c);

/* ann and bob active, the founder claimed; with `session`, ann signed in and her token held on the world */
const group = async () => world().group("ann", "bob");
const signedIn = async () => {
  const w = await group();
  const l = await w.c.login({ handle: "ann", password: PASSWORD("ann") });
  assert.equal(l.ok, true);
  w.token = l.token;
  return w;
};

/* the call as the door runs it: the stamps in the address, every field the caller sent as the body, the arm asked of a fresh world */
const mk = (op, { stamps = {}, setup = group, adapt = null, arm = null } = {}) => async (given) => {
  const env = await setup();
  const fields = adapt ? adapt(given, env) : given;
  const st = typeof stamps === "function" ? stamps(env) : stamps;
  const url = new URL("http://x/?" + new URLSearchParams({ op, ...st }));
  return arm ? await arm(env, fields, st) : await credentialsOps(env.c, url, fields, { VERSION: "test-build" })[op]();
};

const holds = (op, call, extra = {}) => declaredOpHolds({ op, declaration: DECLARED_OPS[op], call, same: sameCode, ...extra });

const TITLE = (op) => `R82 credentials declares ${op}: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused`;

test(TITLE("bootstrap"), async () => {
  await holds("bootstrap", mk("bootstrap", { stamps: { fp: "fp-1" }, setup: async () => world() }));
});

test(TITLE("claim"), async () => {
  await holds("claim", mk("claim", { stamps: { fp: "fp-1" }, setup: async () => world() }),
    { refusedNaming: named({ password: ["PASSWORD_TOO_SHORT"] }), values: { password: "a-long-enough-password" } });
});

test(TITLE("login"), async () => {
  /* R4's one refusal answers a call missing either field, and names neither (it must not tell which arm refused) */
  await holds("login", mk("login"), { refusedNaming: named({ handle: ["SIGN_IN_REFUSED"], password: ["SIGN_IN_REFUSED"] }),
    values: { handle: "ann", password: PASSWORD("ann") } });
});

test(TITLE("passwordreset"), async () => {
  const setup = async () => {
    const w = await group();
    const made = w.c.passwordResetLinkMake({ member: "ann", by: "admin" });
    assert.equal(made.ok, true);
    w.link = made.link;
    return w;
  };
  await holds("passwordreset", mk("passwordreset", { setup, adapt: (f, env) => ("link" in f ? { ...f, link: env.link } : f) }),
    { refusedNaming: named({ link: ["RESET_LINK_DEAD"], password: ["PASSWORD_TOO_SHORT"] }), values: { password: "a-brand-new-passphrase" } });
});

test(TITLE("passwordresetlink"), async () => {
  await holds("passwordresetlink", mk("passwordresetlink", { stamps: { by: "admin" } }),
    { refusedNaming: named({ member: ["RESET_LINK_MEMBER_NOT_ACTIVE"] }), values: { member: "ann" } });
});

test(TITLE("reauth"), async () => {
  await holds("reauth", mk("reauth", { setup: signedIn, stamps: (env) => ({ session: env.token }) }),
    { refusedNaming: named({ password: ["SIGN_IN_REFUSED"] }), values: { password: PASSWORD("ann") } });
});

test(TITLE("recover"), async () => {
  const setup = async () => {
    const w = await group();
    const issued = w.c.recoveryCodesIssue({ by: "ann" });
    assert.equal(issued.ok, true);
    w.code = issued.codes[0];
    return w;
  };
  await holds("recover", mk("recover", { setup, adapt: (f, env) => ("code" in f ? { ...f, code: env.code } : f) }),
    { refusedNaming: named({ handle: ["RECOVERY_REFUSED"], code: ["RECOVERY_REFUSED"], password: ["PASSWORD_TOO_SHORT"] }),
      values: { handle: "ann", password: "a-brand-new-passphrase" } });
});

test(TITLE("recoverycodesissue"), async () => {
  await holds("recoverycodesissue", mk("recoverycodesissue", { stamps: { by: "ann" } }));
});

test(TITLE("securitymap"), async () => {
  /* a missing or unreadable bound is refused SECURITY_PERIOD_INVALID, whose `what` names it (R45, R49) */
  const to = new Date(Math.floor(Date.now() / 3600e3) * 3600e3).toISOString(), from = new Date(Date.parse(to) - 6 * 3600e3).toISOString();
  await holds("securitymap", mk("securitymap", { stamps: { by: "admin" } }),
    { refusedNaming: named({ from: ["SECURITY_PERIOD_INVALID"], to: ["SECURITY_PERIOD_INVALID"] }), values: { from, to } });
});

test(TITLE("setpassword"), async () => {
  await holds("setpassword", mk("setpassword", { setup: signedIn, stamps: (env) => ({ by: "member:ann", session: env.token }) }),
    { refusedNaming: named({ current: ["CURRENT_PASSWORD_WRONG"], password: ["PASSWORD_TOO_SHORT"] }),
      values: { current: PASSWORD("ann"), password: "a-brand-new-passphrase" } });
});

test(TITLE("signeradd"), async () => {
  await holds("signeradd", mk("signeradd", { stamps: { by: "admin" } }),
    { refusedNaming: named({ keyB64: ["BAD_KEY"], memberId: ["NO_SUCH_MEMBER"] }), values: { keyB64: "AAAAnewkey", memberId: "ann" } });
});

test(TITLE("signerset"), async () => {
  const setup = async () => {
    const w = await group();
    assert.equal(w.c.signerAdd({ keyB64: "AAAAannkey", memberId: "ann", by: "admin" }).ok, true);
    return w;
  };
  await holds("signerset", mk("signerset", { setup, stamps: { by: "admin" } }),
    { refusedNaming: named({ keyB64: ["NO_SUCH_KEY"], status: ["BAD_STATUS"] }), values: { keyB64: "AAAAannkey", status: "revoked" } });
});

test(TITLE("signerregisterown"), async () => {
  await holds("signerregisterown", mk("signerregisterown", { stamps: { by: "ann" }, arm: (env, fields, st) => env.c.signerRegisterOwn({ ...fields, by: st.by }) }),
    { refusedNaming: named({ keyB64: ["BAD_KEY"] }), values: { keyB64: "AAAAannnewkey" } });
});

test(TITLE("signerrevokeown"), async () => {
  const setup = async () => {
    const w = await group();
    assert.equal(w.c.signerRegisterOwn({ keyB64: "AAAAannkey", by: "ann" }).ok, true);
    return w;
  };
  await holds("signerrevokeown", mk("signerrevokeown", { setup, stamps: { by: "ann" }, arm: (env, fields, st) => env.c.signerRevokeOwn({ ...fields, by: st.by }) }),
    { refusedNaming: named({ keyB64: ["NO_SUCH_KEY"] }), values: { keyB64: "AAAAannkey" } });
});

test(TITLE("signout"), async () => {
  await holds("signout", mk("signout", { setup: signedIn, stamps: (env) => ({ session: env.token }) }));
});

test(TITLE("signouteverywhere"), async () => {
  await holds("signouteverywhere", mk("signouteverywhere", { setup: signedIn, stamps: (env) => ({ session: env.token }) }));
});

test(TITLE("unlock"), async () => {
  await holds("unlock", mk("unlock", { setup: signedIn, stamps: (env) => ({ session: env.token }) }),
    { refusedNaming: named({ password: ["SIGN_IN_REFUSED"] }), values: { password: PASSWORD("ann") } });
});

test("R82 every declared op is one this module serves: an arm of its ops map, or the service the store door's arm calls for the screens' own-key names; control: an op it does not serve is not declared", async () => {
  const w = await group();
  const arms = credentialsOps(w.c, new URL("http://x/?"), null, {});
  const viaDoor = { signerregisterown: "signerRegisterOwn", signerrevokeown: "signerRevokeOwn" };
  for (const op of Object.keys(DECLARED_OPS)) {
    if (viaDoor[op]) assert.equal(typeof Credentials.prototype[viaDoor[op]], "function", op);
    else assert.equal(typeof arms[op], "function", op);
  }
  /* an op served elsewhere (the control plane's route to the member's own runner) has no arm here and no row */
  assert.equal(typeof arms.subscriptionsignin, "undefined");
  assert.equal(Object.hasOwn(DECLARED_OPS, "subscriptionsignin"), false);
  /* every row states the shape the registry takes */
  for (const [op, row] of Object.entries(DECLARED_OPS)) {
    assert.equal(typeof row.mutating, "boolean", op);
    assert.ok(Array.isArray(row.fields.accepts) && Array.isArray(row.fields.requires), op);
    for (const r of row.fields.requires) assert.ok([r].flat().every((f) => row.fields.accepts.includes(f)), `${op}: ${r} is required, so accepted`);
  }
});
