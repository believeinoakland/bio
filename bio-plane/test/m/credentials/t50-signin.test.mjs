/* T50 (T50-5; N1060, K3218, K3224) and T53 (K5457; `ai-accounts` R26, R60), at the interface: an account cleared, refused,
   revoked or found to resolve to nothing revokes the run credentials carrying its `account_id` and, for a member's own
   account, every run credential of that member (R63, R73); a standing grant ends when no other account of hers serves.
   Every path is driven through ai-accounts' real acts (removal, disconnection, the Worker's failure report); every
   refusal has a control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha } from "./fixture.mjs";

const look = (w, token) => w.c.aiCredentialLook({ secretSha: sha(token) }).credential;
const run = (w, member, id, account_id) => w.c.aiRunCredentialMint({ member, run: id, writes: ["airuntick"], account_id });

/* How each reason is brought about, by ai-accounts' own acts. */
const CLEARINGS = {
  removed: (w, set, by) => w.a.accountRemove({ account_id: set.account_id, by }),
  disconnected: (w, set, by) => w.a.issuedTokenDrop({ account_id: set.account_id, by }),
  refused: (w, set) => w.a.accountCredentialFailed({ account_id: set.account_id, why: "refused" }),
  unresolved: (w, set) => w.a.accountCredentialFailed({ account_id: set.account_id, why: "unresolved" }),
};

for (const why of Object.keys(CLEARINGS)) {
  test(`R63 R73 an account cleared (${why}) revokes the run credentials of the runs it served, inside the act; control: a run on another account, another member's and her own R12 credential stay live`, async () => {
    const w = await world().group("ann", "bob");
    const sa = await w.signin("ann");
    const sb = await w.signin("bob");
    assert.equal(sa.ok, true);
    const a = run(w, "ann", "RUN-A", sa.account_id);
    const b = run(w, "bob", "RUN-B", sb.account_id);
    const own = w.c.aiCredentialMint({ who: "ann", tokenId: "ann-own", secretSha: "d".repeat(64), principalKind: "member" });
    assert.equal(own.ok, true);
    assert.deepEqual([look(w, a.token).revoked, look(w, b.token).revoked], [false, false]);
    assert.equal((await CLEARINGS[why](w, sa, "ann")).ok, true);
    const gone = look(w, a.token);
    assert.equal(gone.revoked, true, "her run's");
    assert.equal(gone.revokedBy, why === "removed" || why === "disconnected" ? "ann" : null, "named for its actor, if a person acted");
    assert.equal(look(w, b.token).revoked, false, "control: bob's");
    assert.equal(w.c.aiCredentialLook({ secretSha: "d".repeat(64) }).credential.revoked, false, "control: her R12 credential");
  });
}

test("R63 R73 a run credential minted for one of a member's accounts is revoked when that account is cleared, and so is every run credential of hers; control: another member's account cleared leaves it, and a run credential minted with no account stays unrelated to the account's id", async () => {
  const w = await world().group("ann", "bob");
  const one = await w.on(w.own("ann"), "ann");
  const two = await w.on(w.own("ann", { secret: "sk-second-ann-key-0123456789" }), "ann");
  const bs = await w.signin("bob");
  const r1 = run(w, "ann", "RUN-1", one.account_id);
  const r2 = run(w, "ann", "RUN-2", two.account_id);
  const rb = run(w, "bob", "RUN-B", bs.account_id);
  w.a.accountCredentialFailed({ account_id: bs.account_id, why: "refused" });
  assert.deepEqual([look(w, r1.token).revoked, look(w, r2.token).revoked, look(w, rb.token).revoked], [false, false, true], "control: ann's stand");
  w.a.accountCredentialFailed({ account_id: one.account_id, why: "unresolved" });
  assert.deepEqual([look(w, r1.token).revoked, look(w, r2.token).revoked], [true, true], "a member-owned account clears every run credential of hers");
});

test("R32 R73 an account cleared while another of the member's accounts still serves leaves her standing grant; cleared with none left, it ends it; an ask grant is never a standing one", async () => {
  const w = await world().group("ann");
  const one = await w.on(w.own("ann"), "ann");
  const two = await w.on(w.own("ann", { secret: "sk-second-ann-key-0123456789" }), "ann");
  for (const set of [one, two]) assert.equal(w.a.accountUsesSet({ account_id: set.account_id, switch: "standing", on: true, by: "ann" }).ok, true);
  const g = await w.c.aiGrantMintStanding({ member: "ann", question: "what is new?" });
  assert.equal(g.ok, true);
  const held = async () => (await w.c.aiGrantHeld({ token: g.token })).ok;
  w.a.accountCredentialFailed({ account_id: one.account_id, why: "refused" });
  assert.equal(await held(), true, "another account of hers still serves");
  w.a.accountCredentialFailed({ account_id: two.account_id, why: "unresolved" });
  assert.equal(await held(), false, "none serves: ended");
});

test("R73 a failure reported for an account with nothing held tells no one: a run credential minted for it stays live; control: a first report for the account that holds its token revokes", async () => {
  const w = await world().group("ann");
  const sa = await w.signin("ann");
  w.a.accountCredentialFailed({ account_id: sa.account_id, why: "refused" });
  const later = run(w, "ann", "RUN-L", sa.account_id);
  assert.equal(w.a.accountCredentialFailed({ account_id: sa.account_id, why: "refused" }).dropped, false);
  assert.equal(look(w, later.token).revoked, false, "nothing held: nothing to clear");
  assert.deepEqual(w.a.accountCredentialFailed({ account_id: "no-such-account", why: "refused" }), { ok: true, dropped: false });
});
