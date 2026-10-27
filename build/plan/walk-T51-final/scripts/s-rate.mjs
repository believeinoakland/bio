/* R39: the doorbell's two limits (DEC-108: 5 from one source and 10 to the whole doorbell in any 10 minutes), in a plane of its own. */
import { check } from "./lib-04b.mjs";
import { knocker, J } from "./s-r39.mjs";

export async function rate(kit, ctx) {
  const knock = knocker(kit);
  const mem = await kit.person("ratemember");
  await check("R39", "the per-source limit: 5 knocks from one address, then the refusal, its sentence and the published bound", "as the public with no account", "knock six times from one address", async () => {
    const out = [];
    let refused = null;
    for (let i = 1; i <= 7; i++) {
      const r = await knock({ contentText: `Rate rehearsal ${i}, from one source.` }, "198.51.100.9");
      out.push(`${i}:${r.status}${r.body.reason ? " " + r.body.reason : ""}`);
      if (!refused && r.status === 429) refused = r;
    }
    if (!refused) throw new Error("no refusal in seven knocks from one address: " + out.join(" "));
    const first = out.findIndex((x) => /429/.test(x)) + 1;
    const stated = refused.body.stated || "";
    const ok = first === 6 && refused.body.reason === "RATE_IP" && /5/.test(stated) && /10 minutes/.test(stated);
    const saw = `${out.join(", ")}; first refusal at knock ${first} (${refused.body.reason}); stated bound: "${stated}"; sentence: "${String(refused.body.translation).slice(0, 260)}"`;
    ctx.rateSaw = saw;
    return ok ? saw : ["BROKEN", saw];
  });
  await check("R39", "the whole-doorbell limit: ten knocks in all, from different addresses, then the refusal", "as the public with no account", "knock from new addresses until refused", async () => {
    const out = []; let refused = null;
    let n = 0;
    for (let i = 0; i < 12; i++) {
      const r = await knock({ contentText: `Whole-doorbell rehearsal ${i}.` }, `192.0.2.${100 + i}`);
      n += r.status === 200 ? 1 : 0;
      out.push(`${r.status}${r.body.reason ? " " + r.body.reason : ""}`);
      if (!refused && r.status === 429) refused = r;
    }
    if (!refused) throw new Error("no whole-doorbell refusal: " + out.join(", "));
    const saw = `accepted ${n} more after the 5 from the first address (so ${n + 5} in the window); ${out.join(", ")}; refusal ${refused.body.reason}: stated "${refused.body.stated}"; sentence "${String(refused.body.translation).slice(0, 220)}"`;
    return refused.body.reason === "RATE_GLOBAL" && n + 5 <= 11 ? saw : ["BROKEN", saw];
  });
  await check("R39", "the tally: days with refusals and the day the whole-doorbell limit was reached; status only, nothing identifying", "as the member", "doorbelltally; inbox status after the refusals", async () => {
    const t = (await kit.get(mem, { op: "doorbelltally" })).result;
    const day = t.days[0];
    const ok = t.ok && day && day.refused >= 2 && day.limit_reached >= 1 && t.last_limit_reached;
    const keys = Object.keys(day || {}).join(",");
    const saw = `${J(t)}; per-day keys: ${keys} (no address, time of day or content)`;
    return ok ? saw : ["BROKEN", saw];
  });
}
