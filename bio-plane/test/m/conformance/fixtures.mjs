/* conformance's published fixtures (K4990, K4993, K4995): each is made by conformance's real code over the real modules
   it uses (./fixture.mjs) when a test calls it, never stored. A user takes `conformance` (the real module on a real
   database) and the ids and viewers that answer to its reads. */
import { scene, V, F, DOC } from "./fixture.mjs";

/** R37: `curesOf` over a noncompliant determination, the later compliant determination that cures it, and the link a
 *  member recorded. `viewer` is a participant who sees both; `outsider` is a member who sees neither. */
export function curesOf() {
  const { w, std, ev, input } = scene();
  const target = w.c.determine(input());
  const later = w.event(ev, { date: "2026-04-01" });
  const cure = w.c.determine(input({ act: { ...input().act, event: later }, standards: [{ standard: std, outcome: "compliant" }],
                                      rows: [{ ...input().rows[0], reading: "aligns" }] }));
  const linked = w.c.cureLink({ determination: target.id, standard: std, cure: cure.id, author: V("olive"), viewer: V("olive") });
  if (!linked.ok) throw new Error(`fixture cure refused: ${JSON.stringify(linked).slice(0, 300)}`);
  return { conformance: w.c, determination: target.id, cure: cure.id, standard: std, link: linked.link,
           viewer: V("pat"), outsider: V("quinn"), world: w };
}

/** R9: `determinationRead` over a live determination, one a later determination superseded (and the superseding one),
 *  and one whose standard's outcome is unclear (an open question). */
export function determinationRead() {
  const { w, std, input } = scene();
  const live = w.c.determine(input());
  const old = w.c.determine(input());
  const next = w.c.determine(input({ supersedes: old.id, reason: "restated" }));
  const unclear = w.c.determine(input({ standards: [{ standard: std, outcome: "unclear" }],
    questions: [{ question: "Was notice posted on the city's site instead?" }], rows: [{ ...input().rows[0], reading: "open" }] }));
  for (const d of [live, old, next, unclear])
    if (!d.ok) throw new Error(`fixture determination refused: ${JSON.stringify(d).slice(0, 300)}`);
  return { conformance: w.c, live: live.id, superseded: old.id, supersededBy: next.id, unclear: unclear.id,
           viewer: V("pat"), outsider: V("quinn"), world: w };
}

/** R19: conformance over an empty store, where every id is NO_SUCH_DETERMINATION. */
export function noDeterminations() {
  const { w } = scene();
  return { conformance: w.c, viewer: V("pat"), world: w };
}

/** R43 (walk E C2a): `determine` noncompliant against a standard whose binding on the body is undetermined, in the shape the
 *  live walk met: an ordinance declared with a start and no end (`period {from, to: null}`), the body given as text. `asked` is
 *  that call; `askedByIssuerEntity` the same act against a standard whose issuer is an entity, the body typed as its name
 *  (`typed`, undetermined) and picked as the entity (`picked`, binds); `benchmarkAsked` a noncompliant outcome against a policy
 *  another body issued (`STANDARD_NOT_BINDING`) and `bindsAsked` one against a standard that binds (accepted). */
export function standardBindingUndetermined() {
  const { w, std, ev, input } = scene();
  const open = w.standard("Parks Code 12.08.099", { period: { from: "2020-01-01", to: null } });
  const dept = w.entity("body", "Parks Department", "government");
  const byEntity = w.standard("Parks Code 12.08.101", { issuer: dept, period: { from: "2020-01-01", to: "2030-12-31" } });
  const bench = w.standard("State Parks Board Guideline 4", { kind: "policy", issuer: "State Parks Board",
                                                              period: { from: "2020-01-01", to: "2030-12-31" } });
  const against = (standard, act = undefined) => input({ ...(act ? { act } : {}), standards: [{ standard, outcome: "noncompliant" }],
    rows: [{ ...input().rows[0], standard, content: [ev.content] }] });
  const act = (body) => ({ ...input().act, actor: { role: "Director of Parks", body } });
  return { conformance: w.c, standard: open, body: "Parks Department", asked: against(open),
           askedByIssuerEntity: { standard: byEntity, typed: against(byEntity, act("Parks Department")), picked: against(byEntity, act(dept)) },
           benchmarkAsked: against(bench), bindsAsked: against(std), viewer: V("olive"), world: w };
}

const IMPORT_SHA = "a".repeat(64);
const HELD = "INQ-2026-0201-held";
const made = (d) => { if (!d.ok) throw new Error(`fixture determination refused: ${JSON.stringify(d).slice(0, 300)}`); return d.id; };

/** R9, R14, R31, R32, R33: `determinationRead` over each state a determination reads in: one resting on a finding checked
 *  for publication and held unsigned (basis `checked_held`), one on another group's accepted finding (basis `accepted`),
 *  a compliant one, one a later determination superseded (`superseded_by` set) with its successor, and a live one
 *  (`superseded_by: null`). None is void here (see `voidDetermination`). */
export function determinationVariants() {
  const { w, proj, std, input } = scene();
  w.inquiry(HELD, { legs: [{ target: DOC }] });
  w.hold(HELD, proj);
  const ref = w.accept(IMPORT_SHA, "INQ-2026-0001-theirs");
  const held = made(w.c.determine(input({ findings: [HELD] })));
  const accepted = made(w.c.determine(input({ findings: [{ ref, edition: 1 }] })));
  const compliant = made(w.c.determine(input({ standards: [{ standard: std, outcome: "compliant" }],
                                                rows: [{ ...input().rows[0], reading: "aligns" }] })));
  const superseded = made(w.c.determine(input()));
  const supersededBy = made(w.c.determine(input({ supersedes: superseded, reason: "restated" })));
  return { conformance: w.c, held, accepted, compliant, superseded, supersededBy, live: supersededBy,
           viewer: V("pat"), outsider: V("quinn"), world: w };
}

/** R9, R14, R31, R32: one determination resting on a finding checked for publication and held unsigned (basis `checked_held`)
 *  and on another group's accepted finding (basis `accepted`) together, as one action resting on both reads it. */
export function determinationBothBases() {
  const { w, proj, input } = scene();
  w.inquiry(HELD, { legs: [{ target: DOC }] });
  w.hold(HELD, proj);
  const ref = w.accept(IMPORT_SHA, "INQ-2026-0001-theirs");
  const both = made(w.c.determine(input({ findings: [HELD, { ref, edition: 1 }] })));
  return { conformance: w.c, both, viewer: V("pat"), outsider: V("quinn"), world: w };
}

const MATTER_STAKE = { stake: "We gain if the contract is voided.", set_by: "alice", set_at: "2026-10-01T10:00:00Z", source: "project" };
const GROUP_FIELDS = { group: "hayward-parents", name: "Hayward Parents for Accountability", domain: "haywardparents.org",
                       domain_verified_at: "2026-09-01T00:00:00Z", stake: "We campaign for the measure this case examines.",
                       detail: null, read_at: "2026-09-19T12:00:00Z" };

/** R32, R41 (T50): one determination per accepted basis, each on another group's finding of an import whose source facts
 *  are the three states case-import answers: its matter stake recorded at import, recorded with none, and not recorded at
 *  all (so `matter_stake` reads "undetermined"). The import facts are conformance's stand-in for case-import's `importedCase`
 *  (`w.imports.editions`), the shape its R25 records (matter-stake.test.mjs). */
export function matterStakeBases() {
  const { w, input } = scene();
  const WITH = "d".repeat(64), WITHOUT = "e".repeat(64), UNDET = "f".repeat(64);
  w.imports.editions.set(`${WITH}|1`, { group_fields: { ...GROUP_FIELDS, matter_stake: MATTER_STAKE } });
  w.imports.editions.set(`${WITHOUT}|1`, { group_fields: { ...GROUP_FIELDS, matter_stake: null } });
  const basisOf = (imp, finding) => made(w.c.determine(input({ findings: [{ ref: w.accept(imp, finding), edition: 1 }] })));
  return { conformance: w.c, withStake: basisOf(WITH, "INQ-2026-0301-theirs"), withoutStake: basisOf(WITHOUT, "INQ-2026-0302-theirs"),
           undetermined: basisOf(UNDET, "INQ-2026-0303-theirs"), matterStake: MATTER_STAKE, viewer: V("pat"), outsider: V("quinn"),
           world: w };
}

/** R33: a determination resting on a held check whose source then lapsed: it reads void, its outcome undetermined with the
 *  recorded one beside it, still live and unedited. `control` is a published-finding determination that reads not void. */
export function voidDetermination() {
  const { w, proj, input } = scene();
  w.inquiry(HELD, { legs: [{ target: DOC }] });
  w.hold(HELD, proj);
  const voided = made(w.c.determine(input({ findings: [HELD] })));
  const control = made(w.c.determine(input({ findings: [F] })));
  w.lapse.sources = [{ source: "lapsed" }];
  return { conformance: w.c, voided, control, viewer: V("pat"), outsider: V("quinn"), world: w };
}
