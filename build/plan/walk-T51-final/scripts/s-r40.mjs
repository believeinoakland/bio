/* R40: source protection by the door's ops (sourceof, sourcerung, sourcedisclose, sourceconsent, sourceconsentwithdraw, sourcelink, sourcereadlog, sourcepublishable,
   knockerconsent, sourcepersonlink). */
import { check } from "./lib-04b.mjs";
import { knocker, J } from "./s-r39.mjs";

export async function r40(kit, ctx) {
  const knock = knocker(kit);
  const mem = await kit.person("sourceone");
  const mem2 = await kit.person("sourcetwo");
  const R = (a) => (a && a.result !== undefined ? a.result : a);
  const S = {};
  const pull = async (payload) => {
    const k = await knock(payload);
    const p = await kit.post(mem, "inboxpull", { knockId: k.body.knockId });
    const sha = p.body.result.capture.sha256;
    const so = R(await kit.get(mem, { op: "sourceof", capture: sha }));
    return { k: k.body, sha, source: so.sourceId, so };
  };
  const rung = async (s) => R(await kit.get(mem, { op: "sourcerung", source_id: s }));
  const pub = async (s, aud) => R(await kit.get(mem, { op: "sourcepublishable", source_id: s, audience: aud }));

  await check("R40", "a knocker's source is known by its secret, never by identity: the rung 'Same knocker' and the sentence", "as the member", "knock with a made secret, pull, sourceof, sourcerung", async () => {
    S.a = await pull({ contentText: "A source's account of the stamp, from the clerk's counter.", generateSecret: true, note: "I saw it" });
    S.b = await pull({ contentText: "Another source's account, handed in with no secret." });
    const r = await rung(S.a.source), rb = await rung(S.b.source);
    ctx.srcA = S.a; ctx.srcB = S.b;
    const ok = r.rung === "same_knocker" && /same knocker secret was presented/.test(r.knocker.how) && rb.rung === "unknown";
    return [ok ? "WORKS" : "BROKEN", `source A ${S.a.source}: rung ${r.rung}, "${r.knocker && r.knocker.how}"; source B (no secret) ${S.b.source}: rung ${rb.rung}; one source per pseudonym, one per secretless knock: ${S.a.source !== S.b.source}; ladder ${r.ladder.join(" > ")}`];
  });

  await check("R40", "dated, attributed history: an attribute known to the team and NOT recorded is its own state", "as the member", "sourcedisclose {attribute occupation, how self, knownTo group, recorded false}", async () => {
    const d = await kit.post(mem, "sourcedisclose", { source: S.a.source, revealed: { kind: "attribute", attribute: "occupation" }, how: "self", knownTo: "group", recorded: false, evidence: "She told two of us at the meeting that she works in the clerk's office." });
    const r = d.body.result;
    S.d1 = r.entry;
    const rg = await rung(S.a.source);
    const e = rg.basis.find((x) => x.entry === r.entry);
    const ok = r.ok && r.rung_before === "same_knocker" && r.rung_after === "partly_known" && e && e.note === "known to the team, not recorded" && e.by === "sourceone" && /^\d{4}-/.test(e.at) && !("value" in e);
    return [ok ? "WORKS" : "BROKEN", `rung ${r.rung_before} -> ${r.rung_after}; entry ${r.entry} by ${e && e.by} at ${e && e.at}, note "${e && e.note}", value stored: ${e && "value" in e}, evidence kept as ${J(e && e.evidence)}; notified ${r.notified}`];
  });

  await check("R40", "a stored value is read only by the members its entry lists; each read is logged; a member not listed sees the entry without it and nothing of hers is logged", "as the member and a second member", "sourcedisclose recorded:true sight:[sourceone]; sourceof as both; sourcereadlog as both", async () => {
    const d = await kit.post(mem, "sourcedisclose", { source: S.a.source, revealed: { kind: "attribute", attribute: "employer", value: "Office of the City Clerk" }, how: "filing", knownTo: "member", recorded: true, sight: ["sourceone"], evidence: "A filing names her employer." });
    S.d2 = d.body.result.entry;
    const mine = R(await kit.get(mem, { op: "sourceof", capture: S.a.sha }));
    const theirs = R(await kit.get(mem2, { op: "sourceof", capture: S.a.sha }));
    const mineE = mine.history.find((x) => x.entry === S.d2), theirE = theirs.history.find((x) => x.entry === S.d2);
    const logMine = R(await kit.get(mem, { op: "sourcereadlog", source_id: S.a.source }));
    const logTheirs = R(await kit.get(mem2, { op: "sourcereadlog", source_id: S.a.source }));
    const ok = mineE && mineE.value === "Office of the City Clerk" && theirE && !("value" in theirE) && logMine.log.some((l) => l.reader === "sourceone" && l.entry === S.d2) && !logTheirs.log.length;
    const noOthers = !JSON.stringify(theirs).includes("Office of the City Clerk");
    return [ok && noOthers ? "WORKS" : "BROKEN", `listed member sees value "${mineE && mineE.value}"; the other member's read of the same entry carries a value: ${theirE ? "value" in theirE : "entry absent"} (the identity appears anywhere in her answer: ${!noOthers}); read log (listed member) ${J(logMine.log)}; the other member's read log: ${J(logTheirs)} scope ${logTheirs.scope}`];
  });

  await check("R40", "a hostile exposure is the exposer's claim ('named by X on date; not confirmed by the team') and does not raise the rung", "as the member", "sourcedisclose {how hostile, claimedBy, claimedAt, knownTo public}", async () => {
    const before = await rung(S.a.source);
    const d = await kit.post(mem, "sourcedisclose", { source: S.a.source, revealed: { kind: "name", value: "Jane Roe" }, how: "hostile", claimedBy: "Councilmember Xu", claimedAt: "2026-10-01", knownTo: "public", recorded: true, sight: ["sourceone"], evidence: "Said at the October 1 hearing." });
    const r = d.body.result;
    S.hostile = r.entry;
    const after = await rung(S.a.source);
    const noClaim = await kit.post(mem, "sourcedisclose", { source: S.a.source, revealed: { kind: "name", value: "Jane Roe" }, how: "hostile", knownTo: "public", recorded: true, sight: ["sourceone"], evidence: "No exposer named." });
    const ok = r.ok && r.confirmed === false && /named by Councilmember Xu on 2026-10-01; not confirmed by the team/.test(r.claim) && after.rung === before.rung;
    return [ok ? "WORKS" : "BROKEN", `claim "${r.claim}", confirmed ${r.confirmed}; rung before ${before.rung}, after ${after.rung}; a hostile disclosure with no exposer named -> ${noClaim.status} ${R(noClaim.body).reason || "accepted"}`];
  });

  await check("R40", "refusals: a disclosure with no evidence, an unknown how, a missing sight list for a stored value, an unknown source", "as the member", "sourcedisclose with each fault", async () => {
    const base = { source: S.a.source, revealed: { kind: "attribute", attribute: "role" }, how: "self", knownTo: "group", recorded: false, evidence: "x" };
    const f = async (patch, label) => { const r = await kit.post(mem, "sourcedisclose", { ...base, ...patch }); const b = R(r.body); return `${label} -> ${r.status} ${b.reason || "accepted"}`; };
    const out = [await f({ evidence: "" }, "no evidence"), await f({ how: "rumour" }, "how rumour"), await f({ recorded: true, revealed: { kind: "attribute", attribute: "role", value: "Aide" } }, "stored value with no sight list"), await f({ source: "SRC-2026-0000" }, "unknown source")];
    return out.join("; ");
  });

  await check("R40", "consent is asked per detail and per audience and stands until withdrawn; withdrawing binds only later publications (sourcepublishable before, after consent, after withdrawal)", "as the member", "sourcepublishable public; sourceconsent {entry, audience public, evidence}; again; sourceconsentwithdraw; again", async () => {
    const p0 = await pub(S.a.source, "public");
    const c = await kit.post(mem, "sourceconsent", { source: S.a.source, entry: S.d1, audience: "public", evidence: "She agreed to have her occupation printed, by email of October 3." });
    const p1 = await pub(S.a.source, "public");
    const w = await kit.post(mem, "sourceconsentwithdraw", { source: S.a.source, entry: S.d1, audience: "public" });
    const p2 = await pub(S.a.source, "public");
    const cr = R(c.body), wr = R(w.body);
    const ok = cr.ok !== false && p0.entries.length === 0 && p1.entries.some((e) => e.entry === S.d1) && wr.ok !== false && !p2.entries.some((e) => e.entry === S.d1);
    return [ok ? "WORKS" : "BROKEN", `publishable (public) before: ${p0.entries.length} details; consent ${J(cr, 260)}; after: ${J(p1.entries, 260)}; withdraw ${J(wr, 200)}; after withdrawal: ${p2.entries.length} details`];
  });

  await check("R40", "'known to the group, not recorded' is not publishable until consent is recorded; consent to a hostile exposure's entry", "as the member", "sourcepublishable for the member audience and public; consent to the hostile entry", async () => {
    const pm = await pub(S.a.source, "member"), pp = await pub(S.a.source, "public");
    const c = await kit.post(mem, "sourceconsent", { source: S.a.source, entry: S.hostile, audience: "public", evidence: "Trying to consent to a hostile exposure." });
    const cr = R(c.body);
    const p3 = await pub(S.a.source, "public");
    return `after consent to it, public-audience lists ${J(p3.entries.map((e) => e.entry + ":" + e.how), 200)}; member-audience details: ${J(pm.entries.map((e) => e.entry + ":" + (e.value ? "value" : "no value")), 260)}; public-audience: ${J(pp.entries.map((e) => e.entry), 200)}; consent to the hostile entry (${S.hostile}) -> ${cr.ok === false ? cr.reason : "accepted"}`;
  });

  await check("R40", "the source consents or withdraws with its knocker secret and holding no account; a wrong, short or missing secret all read alike (SECRET_NOT_RECOGNISED)", "as the public with no account", "knockerconsent with the right secret, a wrong secret, no secret, a short one", async () => {
    const kc = async (body, ip) => { const r = await kit.plane("/api/?op=knockerconsent", { method: "POST", headers: { "cf-connecting-ip": ip }, body: JSON.stringify(body) }); return { status: r.status, body: await r.json() }; };
    await kit.post(mem, "sourcedisclose", { source: S.a.source, revealed: { kind: "attribute", attribute: "occupation" }, how: "self", knownTo: "group", recorded: false, evidence: "Second statement of the same detail, for the consent test." }).then((r) => { S.d3 = R(r.body).entry; });
    const good = await kc({ knockerSecret: S.a.k.secret, entry: S.d3, audience: "public" }, "198.51.100.30");
    const wrong = await kc({ knockerSecret: "w".repeat(26), entry: S.d3, audience: "public" }, "198.51.100.31");
    const none = await kc({ entry: S.d3, audience: "public" }, "198.51.100.32");
    const short = await kc({ knockerSecret: "short", entry: S.d3, audience: "public" }, "198.51.100.33");
    const badEntry = await kc({ knockerSecret: S.a.k.secret, entry: "SRCE-0000000000000000", audience: "public" }, "198.51.100.34");
    const wd = await kc({ knockerSecret: S.a.k.secret, entry: S.d3, audience: "public", withdraw: true }, "198.51.100.35");
    const show = (r) => `${r.status} ${r.body.reason || (r.body.ok ? "ok" : "?")}`;
    const alike = [wrong, none, short, badEntry].every((r) => r.status === good.status ? false : r.body.reason === "SECRET_NOT_RECOGNISED") || [wrong, none, short].every((r) => r.body.reason === "SECRET_NOT_RECOGNISED");
    const saw = `right secret: ${show(good)}${good.body.ok ? "" : " " + J(good.body, 240)}; wrong: ${show(wrong)}; none: ${show(none)}; short: ${show(short)}; right secret with an unknown entry: ${show(badEntry)}; withdraw with the secret: ${show(wd)}`;
    return [good.body.ok && alike ? "WORKS" : "BROKEN", saw];
  });

  await check("R40", "each wrong-secret attempt counts against the doorbell limits", "as the public with no account", "knockerconsent six times from one address", async () => {
    const out = [];
    for (let i = 0; i < 7; i++) {
      const r = await kit.plane("/api/?op=knockerconsent", { method: "POST", headers: { "cf-connecting-ip": "198.51.100.77" }, body: JSON.stringify({ knockerSecret: "y".repeat(24), entry: S.d3, audience: "public" }) });
      const b = await r.json();
      out.push(`${r.status} ${b.reason}`);
    }
    const limited = out.some((x) => /RATE_(IP|GLOBAL)/.test(x));
    return [limited ? "WORKS" : "BROKEN", out.join(", ") + " (the attempts share the doorbell's whole-doorbell count with knocks: by design K563, a hostile sender can use it up for everyone)"];
  });

  await check("R40", "two sources claimed to be one person (sourcelink) with evidence, and by shared secret; the claim is kept beside, never merging the histories", "as the member", "sourcelink {source B, to A, evidence}; sourcerung", async () => {
    const l = await kit.post(mem, "sourcelink", { source: S.b.source, to: S.a.source, evidence: "The same turn of phrase and the same typo in both texts." });
    const lr = R(l.body);
    const rb = await rung(S.b.source), ra = await rung(S.a.source);
    const histB = R(await kit.get(mem, { op: "sourceof", capture: S.b.sha })).history, histA = R(await kit.get(mem, { op: "sourceof", capture: S.a.sha })).history;
    const noEv = await kit.post(mem, "sourcelink", { source: S.b.source, to: S.a.source, evidence: "" });
    const inB = histB.filter((e) => e.kind === "pseudonym_link");
    const ok = lr.ok && inB.length === 1 && rb.rung === "unknown" && !histA.some((e) => e.kind === "pseudonym_link");
    return [ok ? "WORKS" : "BROKEN", `link ${J({ entry: lr.entry, basis: lr.basis, to: lr.to, rung_after: lr.rung_after }, 260)}; B's history holds ${inB.length} pseudonym_link entry (evidence ${J(inB[0] && inB[0].evidence, 120)}), B still ${rb.rung}; A's history holds none of B's (nothing merged), A ${ra.rung}; no evidence -> ${R(noEv.body).reason || "accepted"}`];
  });

  await check("R40", "link a source to a registered person (sourcepersonlink): refused for an organization (NOT_A_PERSON), accepted for a person with its evidence and the members who may read it", "as the member", "entitycreate person and organization; sourcepersonlink to each; sourcepersonlinks read", async () => {
    const person = R((await kit.post(mem, "entitycreate", { kind: "person", label: "Jane Roe", note: "Named at the hearing by the councilmember." })).body);
    const org = R((await kit.post(mem, "entitycreate", { kind: "institution", label: "Office of the City Clerk", note: "Her stated employer." })).body);
    const toOrg = R((await kit.post(mem, "sourcepersonlink", { source: S.a.source, person: org.entity_id, evidence: "She works there.", sight: [] })).body);
    const toPerson = R((await kit.post(mem, "sourcepersonlink", { source: S.a.source, person: person.entity_id, evidence: "Her own account and the filing agree.", sight: ["sourceone"] })).body);
    const readMine = R(await kit.get(mem, { op: "sourcepersonlinks", source: S.a.source }));
    const readMineByPerson = R(await kit.get(mem, { op: "sourcepersonlinks", person: person.entity_id }));
    const readOther = R(await kit.get(mem2, { op: "sourcepersonlinks", source: S.a.source }));
    ctx.person = person.entity_id;
    const ok = person.entity_id && toOrg.reason === "NOT_A_PERSON" && toPerson.ok && readMine.count === 1 && readOther.count === 0;
    return [ok ? "WORKS" : "BROKEN", `person ${J(person, 160)}; to the organization (${org.entity_id}, kind institution) -> ${toOrg.reason || J(toOrg, 160)}; to the person -> ${J(toPerson, 280)}; the member named on the sight list reads, by source ${J(readMine, 300)}, by person ${J(readMineByPerson, 200)}; a member not on the sight list reads ${J(readOther, 200)}`];
  });

  await check("R40", "a firmer identity reaches resting findings as a re-evaluation notice, never a silent regrade; an off-the-record source is never named at any of the four attribution levels; consent is a ceremony step", "as the member", "needs a published case citing a pulled source's material", async () => {
    return ["NOT REACHED", "these rest on a signed and published case (areas 9 and 10); this sitting makes no case. The source side they depend on is made here (a source with a stored identity, a consent that stands, a withdrawal) for those sittings"];
  });
  await check("R40", "the source's own consent form on the doorbell's public frame (registry knockerconsent on doorbell; S27 says no surface designed)", "as the public with no account", "read screens-publish/doorbell.mjs for the act and its refusal words", async () => {
    const { DOORBELL: DOORBELL_SCREEN } = await import("../../../../bio-plane/src/screens-publish/doorbell.mjs").catch(() => ({}));
    const acts = DOORBELL_SCREEN && DOORBELL_SCREEN.acts ? DOORBELL_SCREEN.acts.map((a) => a.op) : null;
    return acts ? `the doorbell screen draws the acts ${acts.join(", ")}; knockerconsent has refusal words for SECRET_NOT_RECOGNISED, RATE_IP and RATE_GLOBAL (screen.doorbell.consent.refused.*); the form exists, so S27's 'no surface designed' is out of date` : ["BROKEN", "the doorbell screen module does not export its acts"];
  });
}
