/* control-plane: the T18 action layer's stamps (R17, R29; K701, K711, K727). action-plans' acts, action-clocks' reminders,
   actions' two acts and filings' communication and template acts take `author` (the positional identity) from the query;
   their reads, and `optionpropose`, the `viewer`; `optionpropose` takes `proposer` (the label) and `principal` (the run's
   comparison). Each is driven for every kind of caller with every stamp forged. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { O, world, call, opCalls, aik, cred, FORGED, QUERY_STAMPS } from "./harness.mjs";

const { OPS, ACTION_PLANS_ACTIONS, ACTION_PLANS_READS, ACTION_CLOCKS_ACTIONS, ACTIONS_ACTIONS, ACTIONS_READS,
        PLAN_PROPOSAL_ACTIONS, FILINGS_ACTIONS } = O;

function callers() {
  const agent = aik();
  const w = world({ creds: { [agent]: cred({ tokenId: "agent-ann", principal: "member:ann", writes: Object.keys(OPS) }) } });
  return { w, list: [
    { name: "admin", token: w.env.ADMIN_TOKEN, params: {}, viewer: "class:admin", author: "class:admin",
      proposer: "class:admin", principal: "class:admin" },
    { name: "probe", token: w.env.PROBE_TOKEN, params: { store: "scratch" }, viewer: "class:probe", author: "class:probe",
      proposer: "class:probe", principal: "class:probe" },
    { name: "founder", token: w.S.founder, params: {}, viewer: "admin", author: "member:admin", proposer: "admin",
      principal: "member:admin" },
    { name: "ann", token: w.S.ann, params: {}, viewer: "member:ann", author: "member:ann", proposer: "ann", principal: "member:ann" },
    { name: "agent", token: agent, params: {}, viewer: "member:ann", author: "class:ai/agent-ann", proposer: "class:ai/agent-ann",
      principal: "member:ann/agent-ann" },
  ] };
}

const FORGE = { viewer: FORGED, author: FORGED, proposer: FORGED, principal: FORGED, identity: FORGED, by: FORGED };

test("R17, R29 (K711, K701): action-plans', action-clocks' and actions' acts and filings' communicationprepare and templatesave are stamped author (the positional identity, class:<cls> or class:ai/<tokenId> for a machine) and viewer; their reads, templates among them, the viewer; a caller's copies never reach the store", async () => {
  const acts = [...ACTION_PLANS_ACTIONS, ...ACTION_CLOCKS_ACTIONS, ...ACTIONS_ACTIONS, "communicationprepare", "templatesave"];
  const reads = [...ACTION_PLANS_READS, ...ACTIONS_READS, "templates"];
  assert.ok(acts.includes("planopen") && acts.includes("reminderanswer") && FILINGS_ACTIONS.includes("templatesave"));
  const { w, list } = callers();
  let driven = 0;
  for (const c of list) {
    for (const [op, kind] of [...acts.map((o) => [o, "act"]), ...reads.map((o) => [o, "read"])]) {
      assert.ok(Object.hasOwn(OPS, op), `${op} has a spec`);
      w.env.calls.length = 0;
      await call(w.env, { op, token: c.token, params: { ...c.params, ...FORGE }, method: OPS[op].mutating ? "POST" : "GET",
                          body: OPS[op].mutating ? { ...FORGE } : undefined });
      const inner = opCalls(w.env).filter((x) => x.route === op);
      if (!inner.length) continue;   /* a caller its row does not admit */
      driven++;
      const p = inner[0].params;
      assert.equal(p.viewer, c.viewer, `${op} viewer for ${c.name}`);
      if (kind === "act") assert.equal(p.author, c.author, `${op} author for ${c.name}`);
      else assert.equal("author" in p, false, `${op} carries no author for ${c.name}`);
      for (const k of QUERY_STAMPS) assert.notEqual(p[k], FORGED, `${op}: a forged ${k} reached the store for ${c.name}`);
    }
  }
  assert.ok(driven > 60, String(driven));
});

test("R17, R29 (K727; action-plans R11, R31): optionpropose is stamped proposer (the label, class:ai/<tokenId> for an agent) and principal (<principal>/<tokenId>, the run productions' expression), beside its viewer, for every caller its row admits; a caller's own proposer and principal never reach the store", async () => {
  assert.deepEqual([...PLAN_PROPOSAL_ACTIONS], ["optionpropose"]);
  const { w, list } = callers();
  let driven = 0;
  for (const c of list) {
    w.env.calls.length = 0;
    await call(w.env, { op: "optionpropose", token: c.token, params: { ...c.params, ...FORGE }, method: "POST", body: { ...FORGE } });
    const inner = opCalls(w.env).filter((x) => x.route === "optionpropose");
    if (!inner.length) continue;
    driven++;
    const p = inner[0].params;
    assert.deepEqual([p.proposer, p.principal, p.viewer], [c.proposer, c.principal, c.viewer], c.name);
    for (const k of [...QUERY_STAMPS, "proposer", "principal"]) assert.notEqual(p[k], FORGED, `${c.name} ${k}`);
  }
  assert.ok(driven >= 3, String(driven));
  /* negative control: another act carries neither stamp */
  const { w: v, list: [admin] } = callers();
  await call(v.env, { op: "planopen", token: admin.token, method: "POST", body: {} });
  const plain = opCalls(v.env).find((x) => x.route === "planopen").params;
  assert.equal("proposer" in plain || "principal" in plain, false);
});

test("R17, R29 (N407; ratification R18): op=publishpreflight carries the agent caller's credential beside its viewer as aiCred (token id and principal, never the value), for an agent alone; a caller's own aiCred never reaches the store, on this op or any other", async () => {
  const { w, list } = callers();
  for (const c of list) {
    w.env.calls.length = 0;
    await call(w.env, { op: "publishpreflight", token: c.token, params: { ...c.params, aiCred: FORGED, project: "PROJ-1" }, method: "POST", body: {} });
    const inner = opCalls(w.env).find((x) => x.route === "publishpreflight");
    if (!inner) continue;
    if (c.name === "agent") {
      assert.deepEqual(JSON.parse(inner.params.aiCred), { tokenId: "agent-ann", principal: "member:ann" });
      assert.equal(inner.params.viewer, "member:ann");
      assert.equal(JSON.stringify(inner).includes(c.token), false, "the credential's value never travels");
    } else assert.equal("aiCred" in inner.params, false, c.name);
  }
  /* negative control: another op never carries one, the agent's included */
  const agent = list.find((c) => c.name === "agent");
  w.env.calls.length = 0;
  await call(w.env, { op: "index", token: agent.token, params: { aiCred: FORGED } });
  assert.equal("aiCred" in opCalls(w.env)[0].params, false);
});

test("R17, R29 (K921; op-declarations R8): filing-templates' admitted acts (FILING_TEMPLATES_ACTIONS) are stamped author (the positional identity, class:<cls> or class:ai/<tokenId> for a machine; filing-templates reads it as author and by) and viewer; templatepropose (TEMPLATE_PROPOSAL_ACTIONS) proposer, the label, also as the author key filing-templates reads it from; factconfirm (LOCAL_FACTS_ACTIONS) its body `by`, the positional expression, an empty body included; the reads (FILING_TEMPLATES_READS, LOCAL_FACTS_READS) the viewer; a caller's copies never reach the store", async () => {
  const { FILING_TEMPLATES_ACTIONS, TEMPLATE_PROPOSAL_ACTIONS, LOCAL_FACTS_ACTIONS, FILING_TEMPLATES_READS, LOCAL_FACTS_READS } = O;
  assert.deepEqual([...FILING_TEMPLATES_ACTIONS].sort(), ["templateapprove", "templatedraft", "templategrantrevoke", "templateretire",
                                                         "templatereviewgrant", "templaterevise", "templatesubmit"]);
  assert.deepEqual([[...TEMPLATE_PROPOSAL_ACTIONS], [...LOCAL_FACTS_ACTIONS], [...FILING_TEMPLATES_READS], [...LOCAL_FACTS_READS].sort()],
                   [["templatepropose"], ["factconfirm"], ["templates"], ["factsdue", "factstatus"]]);
  const reads = [...FILING_TEMPLATES_READS, ...LOCAL_FACTS_READS];
  const { w, list } = callers();
  let driven = 0;
  for (const c of list) {
    for (const op of [...FILING_TEMPLATES_ACTIONS, ...TEMPLATE_PROPOSAL_ACTIONS, ...LOCAL_FACTS_ACTIONS, ...reads]) {
      assert.ok(Object.hasOwn(OPS, op), `${op} has a spec`);
      for (const body of OPS[op].mutating ? [{ ...FORGE, path: "p" }, undefined] : [undefined]) {
        w.env.calls.length = 0;
        await call(w.env, { op, token: c.token, params: { ...c.params, ...FORGE }, method: OPS[op].mutating ? "POST" : "GET", body });
        const inner = opCalls(w.env).filter((x) => x.route === op);
        if (!inner.length) continue;   /* a caller its row does not admit */
        driven++;
        const p = inner[0].params;
        assert.equal(p.viewer, c.viewer, `${op} viewer for ${c.name}`);
        if (FILING_TEMPLATES_ACTIONS.includes(op)) assert.equal(p.author, c.author, `${op} author for ${c.name}`);
        else if (TEMPLATE_PROPOSAL_ACTIONS.includes(op)) assert.deepEqual([p.proposer, p.author], [c.proposer, c.proposer], `${op} for ${c.name}`);
        else assert.equal("author" in p, false, `${op} carries no author for ${c.name}`);
        if (LOCAL_FACTS_ACTIONS.includes(op)) {
          assert.equal(inner[0].body?.by, c.author, `${op}'s body by for ${c.name}`);
          if (body) assert.equal(inner[0].body.path, "p");
          for (const k of QUERY_STAMPS) assert.notEqual(inner[0].body[k], FORGED, `${op}: a forged body ${k} for ${c.name}`);
        }
        for (const k of QUERY_STAMPS) assert.notEqual(p[k], FORGED, `${op}: a forged ${k} reached the store for ${c.name}`);
      }
    }
  }
  assert.ok(driven > 40, String(driven));
});
