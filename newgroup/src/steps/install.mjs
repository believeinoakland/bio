/* R17, R19, R20, R22, R23: every verified member installed beside the plane, then the plane bound to them. */
import { apiOf, special, approve } from "./api.mjs";
import { listScripts } from "./account.mjs";
import { PLAN_PROBE } from "./probes.mjs";
import { BINDING_OF } from "./bindings.mjs";
import { uploadUpdate } from "./uploads.mjs";
import { uploadMember } from "./members.mjs";
import { containerPartsOf, withLacks, WORKER_PART_LACKS, VPC_MEMBER, VPC_BINDING, vpcServiceOk, containerConditions, placeContainer, setSchedules } from "./containers.mjs";

/* Install (or refresh — the PUT is the same act) every member `loadFleet` verified. DEGRADES PER MEMBER, never fails the
   install: a team's plane must not be lost over a member it can add at the next update, and what was left out is SAID
   (D-115's "quietly doing less" is the defect; the cure is the saying, not the refusing). `ctx.vpc`: the Workers VPC service
   the operator named (R45), or none. `ctx.names`: the copy's names (R64). Answers `{done, left, imageLags, completed}`. */
async function installFleet(emit, token, acct, slug, release, loaded, ctx = {}) {
  await emit.step("fleet", "Installing the capability workers beside your team's Civicsmith");
  if (loaded.skip) { emit.ok("fleet", loaded.skip); return; }
  const names = ctx.names;
  const man = release.man;
  const done = [], left = [], notes = [], imageLags = [], completed = [];
  const classOf = new Map();
  let conditions = null, leftover = false, vpcTaken = false;
  const scripts = await listScripts(apiOf(token, acct)).catch((e) => { if (approve(e)) throw e; return new Map(); });
  for (const L of loaded.members) {
    const m = L.m;
    /* R15, R38 (K3793): a container member that never reached its upload (its image not pullable or not pinned, no Containers
       scope, not Workers Paid, a part missing or unreadable) is LEFT OUT, named here with why and what the copy lacks; it is
       not a failed upload and the verdict does not wait on it (`out`). A member whose upload was attempted and failed is. */
    const isContainer = containerPartsOf(m).length > 0;
    if (L.error) { left.push({ member: m.member, why: withLacks(m, L.error), ...(isContainer ? { out: true } : {}) }); continue; }
    let uploaded = false, attempted = false;
    try {
      const { box, limits, own, classes } = L;
      /* R18: this member's bytes, fetched again at its first upload and let go with the member. */
      let held = null;
      const fetchHeld = async () => {
        try { held = await L.bytes(); }
        catch (e) { if (special(e)) throw e; throw new Error("its files could not be read again for the upload (" + String(e && e.message || e) + ")"); }
      };
      /* Said once the member is installed (a member left out is named with its own reason). */
      const lacking = !L.workerPart && WORKER_PART_LACKS[m.member] ? `${m.member}: ${WORKER_PART_LACKS[m.member]}` : null;
      const ownBindings = own.r2_buckets.map((b) => ({ type: "r2_bucket", name: b.binding, bucket_name: names.role(b.bucket) }));
      const vpcBindings = vpcServiceOk(ctx.vpc) && m.member === VPC_MEMBER ? [{ type: "vpc_service", name: VPC_BINDING, service_id: ctx.vpc }] : [];
      const heldTag = scripts.get(names.member(m.member))?.migration_tag ?? null;
      const send = (extra) => uploadMember(token, acct, slug, m, String(man.version), held.bundle, held.partBytes,
        { ...extra, names, fleet: loaded.fleet, heldTag });
      /* R45: a VPC binding refused (the permission may not reach the service, or the id names none) leaves out that
         binding alone, named; the member is uploaded again without it. */
      const upload = async (extra) => {
        const bindings = [...(extra.bindings || []), ...ownBindings];
        if (!vpcBindings.length) return send({ ...extra, bindings });
        try {
          await send({ ...extra, bindings: [...bindings, ...vpcBindings] });
          vpcTaken = true;
          notes.push(`${m.member} is connected to the Workers VPC service you named (${VPC_BINDING})`);
        } catch (e) {
          if (special(e)) throw e;
          await send({ ...extra, bindings });
          vpcTaken = true;
          notes.push(`${m.member} could not be connected to the Workers VPC service you named (Cloudflare said: ${e.message}), so it `
            + "was installed without it, and a security tool reached through a tunnel answers REACH_NOT_BOUND until the updater connects it");
        }
      };
      const schedule = async () => {
        if (!own.crons.length) return;
        try { await setSchedules(token, acct, names.member(m.member), own.crons); }
        catch (e) { if (special(e)) throw e; notes.push(`${m.member} was installed, but its schedule (${own.crons.join("; ")}) could not be set (Cloudflare said: ${e.message}); the next update sets it`); }
      };
      if (scripts.has(names.member(m.member))) completed.push(m.member);
      if (!box.length) {
        await fetchHeld();
        attempted = true;
        await upload({ bindings: classOf.get(m.member), limits });
        uploaded = true;
        await schedule();
        done.push(m.member);
        if (lacking) notes.push(lacking);
        continue;
      }
      const multi = box.length > 1;
      /* A class bound into its own member is bound in that member's own upload (no script name); one bound into
         another member is bound cross-script into it, after its class exists. */
      const binds = () => { for (const d of classes) for (const b of d.bind) if (b.member !== m.member)
        classOf.set(b.member, [...(classOf.get(b.member) || []),
          { type: "durable_object_namespace", name: b.binding, class_name: d.class_name, script_name: names.member(m.member) }]); };
      const selfBinds = classes.flatMap((d) => d.bind.filter((b) => b.member === m.member)
        .map((b) => ({ type: "durable_object_namespace", name: b.binding, class_name: d.class_name })));
      const fresh = !scripts.has(names.member(m.member));
      conditions ??= await containerConditions(token, acct, ctx);
      leftover = !!conditions.leftover;
      if (!conditions.ok) {
        /* Left out this time; a container an earlier act installed keeps serving, so its bindings are restated (a
           member re-uploaded without one would lose it). */
        if (!fresh) binds();
        throw new Error(conditions.why);
      }
      await fetchHeld();
      attempted = true;
      await upload({ limits, bindings: [...(classOf.get(m.member) || []), ...selfBinds],
        ...(fresh ? { migrations: { new_tag: "v1", new_sqlite_classes: classes.map((d) => d.class_name) } } : {}) });
      uploaded = true;
      for (const d of classes) {
        const placed = await placeContainer(token, acct, m, d, names.app(m.member, d.class_name, multi), names);
        if (placed.lag) imageLags.push(placed.lag);
      }
      await schedule();
      binds();
      done.push(m.member);
      if (lacking) notes.push(lacking);
    } catch (e) {
      if (special(e)) throw e;
      left.push({ member: m.member, why: withLacks(m, String(e && e.message || e)), ...(isContainer && !attempted ? { out: true } : {}) });
    }
  }
  /* R45: a VPC service named that no member installed here takes is said, never dropped in silence. */
  if (vpcServiceOk(ctx.vpc) && !vpcTaken)
    notes.push(`the Workers VPC service you named was not connected: ${VPC_MEMBER} was not installed this time, so a tool reached `
      + "through a tunnel answers REACH_NOT_BOUND in your team's Civicsmith until the updater connects it");
  const probeNote = leftover ? " One cleanup note: the tiny probe script \"" + PLAN_PROBE + "\" could not be deleted "
    + "automatically — it is harmless, and you can remove it from Workers & Pages any time." : "";
  /* Each note begins with a member's name or a capital, as written; a name is never re-cased. */
  const noteText = notes.length ? " " + notes.map((n) => (/^[a-z]+-[a-z]/.test(n) ? n : n[0].toUpperCase() + n.slice(1)) + ".").join(" ") : "";
  if (left.length === 0) {
    emit.ok("fleet", "All " + done.length + " capability workers installed and verified: "
      + done.join(", ") + "." + noteText + probeNote);
  } else {
    emit.ok("fleet", (done.length ? done.length + " capability worker(s) installed (" + done.join(", ") + "); " : "")
      + left.length + " left out: "
      + left.map((l) => l.member + " (" + l.why + ")").join("; ")
      + ". Your team's Civicsmith works without them; the next update retries exactly this step." + noteText + probeNote);
  }
  /* D-116: WHICH members this act uploaded, so the verify step can require each of them to answer THROUGH the plane's
     binding. Every early return above uploads nothing and returns undefined, which the caller reads as none. */
  return { done, left, imageLags, completed };
}

/* DIST-6, step 3 of the order at BINDING_OF: RE-PUT the plane bound to every bindable member now present — those
   bound at step 1 and those `installFleet` just uploaded. The re-PUT takes the UPDATE's shape on both paths (no
   `migrations`, the team's passwords and the Durable Object kept by `keep_bindings`), because that is the shape
   already proven against an existing script on every update; an install's own shape would restate its `v1` migration
   against a script that already carries it, which nothing here has established Cloudflare accepts. Nothing to add ->
   no PUT. A refusal DEGRADES, never fails the act: the members stay installed, the step is marked, and the verify step
   names each member the plane cannot reach (servingVerdict) — never a success over it. */
async function bindMembers(emit, token, acct, slug, release, already, fleet, opts) {
  const want = [...BINDING_OF.keys()]
    .filter((m) => already.includes(m) || (fleet?.done || []).includes(m));
  const added = want.filter((m) => !already.includes(m));
  /* R47: on the install, this is also the upload that first tells the copy its own hosts, so it runs when they are
     known even with no member to add. An update states them in its own upload, and restates them here. */
  const hosts = opts.writeHosts && Array.isArray(opts.ownHosts) && opts.ownHosts.length ? opts.ownHosts : null;
  if (added.length === 0 && !hosts) return { bound: already, unbound: [] };
  await emit.step("bind", added.length ? "Connecting your team's Civicsmith to its capability workers"
    : "Telling your team's Civicsmith its own address");
  try {
    await uploadUpdate(token, acct, slug, opts.withR2, release,
      { members: want, daemon: opts.daemon, noSelf: opts.noSelf, profiles: opts.profiles, ownHosts: opts.ownHosts, names: opts.names });
    emit.ok("bind", [added.length ? "Your team's Civicsmith is connected to " + added.join(", ") + "." : "",
      hosts ? "Your team's Civicsmith now knows its own address (" + hosts.join(", ") + "), which it reads as its own." : ""]
      .filter(Boolean).join(" "));
    return { bound: want, unbound: [], put: true, hosts: !!hosts };
  } catch (e) {
    emit.no("bind", [added.length ? "The capability workers were installed, but connecting your team's Civicsmith to them was refused ("
      + added.join(", ") + "). Your team's Civicsmith works without them; running the updater connects them." : "",
      hosts ? "Telling your team's Civicsmith its own address was refused, so it does not know it yet; running the updater tells it." : "",
      "(Cloudflare said: " + e.message + ")"].filter(Boolean).join(" "));
    return { bound: already, unbound: added, hosts: false };
  }
}
export { installFleet, bindMembers };
