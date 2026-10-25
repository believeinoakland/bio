/* journey-check R21 (K3803, K3813, K3815; DEC-330; amends R6, R13): the states of a carried screen that its default does not draw,
   each a LIVE and DESIGN pair at both widths. The design's state is drawn by setting the mock's own "In this mockup, show"
   control (`control`, the id of that select in the mock) to the option whose label matches `option`; the label is read from the
   mock, never copied here. The live screen is put in the state by `reach(page, ctx)` (the walk's own acts, or data the arm
   made), which answers true when it is there. A state the mock does not offer fails by its name; a state the walk cannot reach
   is a note "<screen>, <state>: not reached on this instance" on the live arm (never a pass, never a failure), listed for BOB's own live walk; on the
   local arm, which makes its own data, the same state fails by its name (kind `state`). */
import { join, relative } from "node:path";
import { FAIL } from "./walker.mjs";
import { localize } from "../setup-words/index.mjs";
import { pair, WIDTHS, viewportOf } from "./design.mjs";
import { settle } from "./walker.mjs";

export const CARRIED_STATES = Object.freeze([
  { screen: "document", state: "the held copy", control: "mk-dst", option: "held" },
  { screen: "project", state: "an owner standing down", control: "mk-eproject", option: "standing down" },
  { screen: "project", state: "an owner preparing a notice", control: "mk-eproject", option: "preparing" },
  { screen: "project", state: "an owner whose notice is published", control: "mk-eproject", option: "notice is published" },
  { screen: "project", state: "a project the member is not in", control: "mk-eproject", option: "isn't in this project" },
  { screen: "project", state: "the hidden project's rescue", control: "mk-eproject", option: "every owner is gone" },
  { screen: "question", state: "deferred for the project", control: "mk-qst", option: "deferred" },
  { screen: "question", state: "dismissed for the project", control: "mk-qst", option: "dismissed" },
  { screen: "question", state: "each passage is asked", control: "mk-qst", option: "each passage is asked" },
  { screen: "question", state: "concluded on a member's own reading", control: "mk-qst", option: "own reading" },
  { screen: "review-copy", state: "saved as a file", control: "mk-rcst", option: "as a file" },
  { screen: "plan", state: "the project's plans", control: "mk-plst", option: "several plans" },
  { screen: "plan", state: "none", control: "mk-plst", option: "no plan" },
  { screen: "action", state: "the date passed with no reply", control: "mk-actst", option: "no reply recorded" },
  { screen: "action", state: "asking about the silence", control: "mk-actst", option: "silence" },
  { screen: "action", state: "a member who may read and not act", control: "mk-actst", option: "read and not act" },
  { screen: "people", state: "other things the record follows", control: "mk-epeople", option: "other things" },
  { screen: "people", state: "adding one", control: "mk-epeople", option: "adding someone" },
  { screen: "person", state: "an ordinance", control: "mk-pest", option: "ordinance" },
  { screen: "person", state: "an office", control: "mk-pest", option: "office" },
  /* the states the carried features of screens-settings, screens-intake and screens-daily add, and counsel's (T51-116 to T51-118; op-declarations R78): the mock's first "show" control of each screen, every option but its default */
  { screen: "home", state: "on a new member's first visit (one who may start projects)", control: "mk-hmst", option: "on a new member's first visit \\(one who may start" },
  { screen: "home", state: "on a new member's first visit (one who may not start project", control: "mk-hmst", option: "on a new member's first visit \\(one who may not" },
  { screen: "home", state: "for a member who may not start projects, with no project ope", control: "mk-hmst", option: "for a member who" },
  { screen: "home", state: "for the founder of a new team", control: "mk-hmst", option: "for the" },
  { screen: "members", state: "as a member sees it", control: "mk-mbst", option: "as a member" },
  { screen: "members", state: "an administrator's removal under way", control: "mk-mbst", option: "an administrator's" },
  { screen: "security", state: "an ordinary week", control: "mk-secst", option: "an" },
  { screen: "account", state: "a newer version of Civicsmith is live", control: "mk-eacct", option: "a newer" },
  { screen: "account", state: "making your signing key", control: "mk-eacct", option: "making" },
  { screen: "connect", state: "a team offering its key; you connected your own API key", control: "mk-st", option: "a team offering its key; you connected" },
  { screen: "connect", state: "a team offering its key; you signed in with your own Claude ", control: "mk-st", option: "a team offering its key; you signed" },
  { screen: "connect", state: "your own Claude sign-in has expired", control: "mk-st", option: "your own Claude sign-in" },
  { screen: "connect", state: "a team that doesn't pay for the assistant: members bring the", control: "mk-st", option: "a team that doesn't" },
  { screen: "connect", state: "a team that keeps its material away from AI", control: "mk-st", option: "a team that keeps" },
  { screen: "teamai", state: "Ask every day", control: "mk-gex", option: "Ask" },
  { screen: "teamai", state: "Yes", control: "mk-gex", option: "Yes" },
  { screen: "places", state: "a state with no profile", control: "mk-plst", option: "a state with no" },
  { screen: "recovery", state: "new codes just issued", control: "mk-rst", option: "new" },
  { screen: "group-identity", state: "an older installation, no short name recorded", control: "mk-gist", option: "an" },
  { screen: "updates", state: "the same, seen by the administrator who holds it", control: "mk-upst", option: "the same," },
  { screen: "updates", state: "nothing ready", control: "mk-upst", option: "nothing" },
  { screen: "translations", state: "a team that uses only English", control: "mk-etl", option: "a" },
  { screen: "projects", state: "a new team with no projects", control: "mk-eprojects", option: "a new" },
  { screen: "projects", state: "for a member who may not start projects", control: "mk-eprojects", option: "for" },
  { screen: "unavailable", state: "something you may not see", control: "mk-ust", option: "something" },
  { screen: "unavailable", state: "your team's Civicsmith out of reach", control: "mk-ust", option: "your" },
  { screen: "elsewhere", state: "a place that lists none yet", control: "mk-elst", option: "a place" },
  { screen: "queue", state: "the queue with nothing waiting", control: "mk-equeue", option: "the queue" },
  { screen: "queue", state: "an invitation to a project, waiting", control: "mk-equeue", option: "an invitation" },
  { screen: "queue", state: "choosing several items", control: "mk-equeue", option: "choosing" },
  { screen: "queue", state: "what happened to the chosen items", control: "mk-equeue", option: "what happened" },
  { screen: "queue", state: "what you answered and set aside", control: "mk-equeue", option: "what you" },
  { screen: "queue", state: "an all-clear that cannot be given", control: "mk-equeue", option: "an all-clear" },
  { screen: "finder", state: "a search with no results", control: "mk-efinder", option: "a search with" },
  { screen: "finder", state: "Find with no words: browsing", control: "mk-efinder", option: "Find" },
  { screen: "finder", state: "citing the whole set you hold", control: "mk-efinder", option: "citing" },
  { screen: "finder", state: "the whole record as one table", control: "mk-efinder", option: "the whole record" },
  { screen: "finder", state: "a search answered by three routes, with what it covered", control: "mk-efinder", option: "a search answered" },
  { screen: "archive", state: "an archive that could not be opened", control: "mk-zst", option: "an archive that could" },
  { screen: "open-file", state: "a high-risk file", control: "mk-ost", option: "a high-risk" },
  { screen: "open-file", state: "a file held after a finding", control: "mk-ost", option: "a file held" },
  { screen: "open-file", state: "a file you added yourself", control: "mk-ost", option: "a file you" },
  { screen: "counsel", state: "a packet for a defense", control: "mk-cpst", option: "a packet for a defense" },
]);

/* Each carried state: its design drawing at both widths; paired with the live screen where `reach` puts it in the state.
   `reach` is `{ "<screen>, <state>": async (page, base) => boolean }`. Answers the pairs written (relative to `out`). */
export async function walkStates(walk, b, mock, { out, page = null, base = null, reach = {}, states = CARRIED_STATES }) {
  walk.journey = "R21 the carried states";
  const written = [];
  for (const st of states) {
    const name = `${st.screen}, ${st.state}`;
    const design = {};
    for (const width of WIDTHS) {
      const d = await mock.drawState(st.screen, st.control, st.option, width);
      if (d.why) { walk.fail(FAIL.DESIGN, localize("journey-check.states.name_why_the_design_mock_at", "{name}: {why} (the design mock at {commit})", { name: String(name), why: String(d.why), commit: String(mock.commit) })); break; }
      design[width] = d.png;
    }
    if (!design[WIDTHS[0]] || !design[WIDTHS[1]]) continue;
    const reached = reach[name];
    let ok = false;
    const livePng = {};
    if (reached && page) {
      for (const width of WIDTHS) {
        await page.setViewportSize(viewportOf(width));
        ok = await reached(page, base);
        if (!ok) break;
        await settle(page);
        livePng[width] = await page.screenshot();
      }
      await page.setViewportSize(viewportOf(WIDTHS[0]));
    }
    if (!ok && walk.arm === "local") { walk.fail(FAIL.STATE, localize("journey-check.states.name_not_reached_on_the_local", "{name}: not reached on the local arm, which makes its own data", { name: String(name) })); continue; }
    if (!ok) { walk.notes.push(localize("journey-check.states.name_not_reached_on_this_instance", "{name}: not reached on this instance", { name: String(name) })); continue; }
    for (const width of WIDTHS)
      written.push(relative(out, await pair(b, livePng[width], design[width], join(out, "pairs", `state-${st.screen}-${st.state.replace(/[^a-z0-9]+/gi, "-")}-${width}.png`), { title: `${name}, ${width}px` })));
  }
  return written;
}
