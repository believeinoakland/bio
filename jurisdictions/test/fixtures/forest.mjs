/* The test forest (R118): this module's published fixture of layers. Every layer is made up for tests: `test: true`, every basis
 * `TEST`, values unlike the shipped ones, hosts under `.example`, no place a real one. A module that takes the view is tested
 * against `combine(FOREST.all)` and the smaller sets here, never against a hand-built answer (`build/situations/job.md`, K4990).
 *
 *   chain      four layers, one per level: federal-like, state-like, county-like, city-like
 *   all        the chain, a second county-like and city-like layer on another branch, a state-like layer with nothing below it,
 *              a city-like layer in another test state, and the team layer
 *   conflict   a county-like layer on the chain's branch giving a value of a key the chain already gives, differently
 *   equal      the same layer giving the same value, with another citation and basis
 * Each level holds one law and one deadline; the state-like layer's rule counts on a closure list the federal-like layer holds;
 * two same-level layers each hold a closure list named `town`; the team layer holds entries about two governments, one with a
 * stated fiscal year. */
const R = "TEST";
const layer = (id, level, place, within, rest) => ({
  id, name: place, covers: [place], test: true,
  layer: { level, place, ...(within ? { within } : {}), origin: "civicsmith" },
  coverage: { as_of: "2026-01-01" },
  ...rest,
});
const LOWER = { federal: "fed", state: "state", county: "county", city: "city" };
const law = (level, name, response) => ({ level, name, citation: `${name} § 1`, response, stages: [{ stage: "request", label: `${name} request`, citation: `${name} § 2` }],
  governs: level === "city" ? ["city"] : level === "federal" ? ["federal"] : ["state", "county", "city", "district"], basis: R });
const rule = (name, amount, closures, level) => ({ rule: name, applies_to: "records_request", units: "days", amount, count: "business", direction: "forward",
  starts: "received", closures, citation: `${LOWER[level]} rule ${name} § 3`, status: "researched", basis: R });
const closureList = (name, year, dates) => ({ year, list: name, citation: `${name} list § 4`, days: dates.map((date) => ({ date, name: "closed" })), status: "researched", basis: R });
const kind = (laws) => ({ kind: "records_request", label: "records request", tier: 1, laws, basis: R });

const FED = layer("forest-federal", "federal", "Fedland", null, {
  records_laws: [law("federal", "Fed Records Act", "fed_answer")],
  deadlines: [rule("fed_answer", 20, "fed", "federal")],
  holidays: [closureList("fed", 2026, ["2026-01-01", "2026-07-03"]), closureList("fed", 2027, ["2027-01-01"])],
  weekend: { days: ["sat", "sun"], citation: "Fed weekend § 5", status: "researched", basis: R },
  action_kinds: [kind(["Fed Records Act"])],
});
const STATE = layer("forest-state", "state", "Stateia", "forest-federal", {
  records_laws: [law("state", "State Records Act", "state_answer")],
  /* counts on the list the federal-like layer holds, and holds its own */
  deadlines: [rule("state_answer", 7, "fed", "state")],
  holidays: [closureList("state", 2026, ["2026-03-31"])],
  time_zone: { value: "America/Chicago", status: "researched", basis: R },
  weekend: { days: ["sat", "sun"], citation: "State weekend § 6", status: "researched", basis: R },
  action_kinds: [kind(["State Records Act"])],
});
const COUNTY_A = layer("forest-county-a", "county", "Aville County", "forest-state", {
  records_laws: [law("county", "Aville County Records Rule", "county_a_answer")],
  deadlines: [rule("county_a_answer", 5, "state", "county")],
  counterparties: [{ role: "Clerk", body: "Aville County Clerk", level: "county", elected: true, basis: R }],
  action_kinds: [kind(["Aville County Records Rule"])],
});
const COUNTY_B = layer("forest-county-b", "county", "Bville County", "forest-state", {
  records_laws: [law("county", "Bville County Records Rule", "county_b_answer")],
  deadlines: [rule("county_b_answer", 6, "state", "county")],
  fiscal_year: [{ body: "*", start: "07-01", named_by: "start", label: "FY{start}-{end2}", status: "researched", basis: R }],
  action_kinds: [kind(["Bville County Records Rule"])],
});
/* two city-like layers each hold a closure list named `town`, and a rule counting on it */
const CITY_A = layer("forest-city-a", "city", "Aburg", "forest-county-a", {
  records_laws: [law("city", "Aburg Sunshine Rule", "city_a_answer")],
  deadlines: [rule("city_a_answer", 2, "town", "city")],
  holidays: [closureList("town", 2026, ["2026-05-04"])],
  counterparties: [{ role: "Mayor", body: "Aburg Mayor's Office", level: "city", elected: true, basis: R }],
  fiscal_year: [{ body: "*", start: "10-01", named_by: "start", label: "FY{start}-{end2}", status: "researched", basis: R }],
  action_kinds: [kind(["Aburg Sunshine Rule"])],
});
const CITY_B = layer("forest-city-b", "city", "Bburg", "forest-county-b", {
  records_laws: [law("city", "Bburg Sunshine Rule", "city_b_answer")],
  deadlines: [rule("city_b_answer", 3, "town", "city")],
  holidays: [closureList("town", 2026, ["2026-06-08"])],
  action_kinds: [kind(["Bburg Sunshine Rule"])],
});
/* a state-like layer with nothing below it, and a city-like layer in another test state */
const STATE_ALONE = layer("forest-state-alone", "state", "Lonestate", "forest-federal", {
  records_laws: [law("state", "Lonestate Records Act", "lone_answer")],
  deadlines: [rule("lone_answer", 9, "fed", "state")],
  action_kinds: [kind(["Lonestate Records Act"])],
});
const STATE_OTHER = layer("forest-state-other", "state", "Otherstate", "forest-federal", {
  records_laws: [law("state", "Otherstate Records Act", "other_answer")],
  deadlines: [rule("other_answer", 4, "fed", "state")],
  action_kinds: [kind(["Otherstate Records Act"])],
});
const COUNTY_OTHER = layer("forest-county-other", "county", "Ostate County", "forest-state-other", {});
const CITY_OTHER = layer("forest-city-other", "city", "Oburg", "forest-county-other", {
  records_laws: [law("city", "Oburg Sunshine Rule", "city_o_answer")],
  deadlines: [rule("city_o_answer", 1, "fed", "city")],
  action_kinds: [kind(["Oburg Sunshine Rule"])],
});
/* the team layer: entries about two governments, one with a stated fiscal year */
const TEAM = {
  id: "team", name: "The team's own layer (test)", covers: ["the team"], test: true,
  layer: { origin: "team" },
  deadlines: [{ rule: "team_answer", applies_to: "records_request", units: "days", amount: 12, count: "calendar", starts: "received", citation: "team rule § 7",
    status: "researched", basis: `team:${"ab".repeat(32)}`, government: { level: "county", place: "Aville County" } },
  { rule: "team_answer", applies_to: "records_request", units: "days", amount: 14, count: "calendar", starts: "received", citation: "team rule § 8",
    status: "researched", basis: `team:${"cd".repeat(32)}`, government: { level: "city", place: "Bburg" } }],
  fiscal_year: [{ body: "Bburg", start: "04-01", named_by: "start", label: "FY{start}-{end2}", how: "the town's own budget page, read by the member",
    government: { level: "city", place: "Bburg" } }],
};

/* a conflicting pair: a layer on the chain's branch giving the state-like layer's zone differently; an equal pair: the same zone, another basis */
const CONFLICT = layer("forest-county-conflict", "county", "Cville County", "forest-state", {
  time_zone: { value: "America/Los_Angeles", status: "researched", basis: R },
  weekend: { days: ["fri", "sat"], citation: "Cville weekend § 9", status: "researched", basis: R },
});
const EQUAL = layer("forest-county-equal", "county", "Dville County", "forest-state", {
  time_zone: { value: "America/Chicago", status: "researched", basis: R },
  weekend: { days: ["sun", "sat"], citation: "Dville weekend § 10", status: "researched", basis: R },
});

export const FOREST = Object.freeze({
  chain: Object.freeze([FED, STATE, COUNTY_A, CITY_A]),
  all: Object.freeze([FED, STATE, COUNTY_A, COUNTY_B, CITY_A, CITY_B, STATE_ALONE, STATE_OTHER, COUNTY_OTHER, CITY_OTHER, TEAM]),
  conflict: CONFLICT,
  equal: EQUAL,
  team: TEAM,
});
/** A deep copy of a fixture list, so a test may change what it is handed. */
export const forestCopy = (list) => structuredClone([...list]);
