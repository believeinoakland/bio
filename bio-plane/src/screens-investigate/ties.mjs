/* screens-investigate R9: the member's own ties (Settings › Your ties; registry screen `ties`, its 2 acts; K1490). Reads
 * `people`' `memberties` (the member's own ties, seen only by her and the administrators), with why she is asked and who
 * sees the list in the screen's own sentences. A tie is added with its kind, who, and whether a case that concerns it
 * names her by her handle or says "a member of the group", the disclosure stated either way. */

import { row } from "./row.mjs";

function reads() {
  return { ties: { op: "memberties", query: {}, empty: (v) => !v || !Array.isArray(v.ties) || !v.ties.filter((t) => !t.withdrawn).length } };
}

function render(cs, view) {
  const S = "screen.ties.";
  const me = (view.me && view.me.handle) || "";
  const out = [cs.title()];
  out.push(cs.sec(S + "why", `<ul class="mk-list">${["why.1", "why.2", "why.3", "why.4"].map((k) => `<li>${cs.w(S + k)}</li>`).join("")}</ul>`));
  out.push(cs.sec(S + "who", `<ul class="mk-list">${["who.1", "who.2", "who.3"].map((k) => `<li>${cs.w(S + k)}</li>`).join("")}</ul>`));
  out.push(cs.sec(S + "list", cs.state("ties", view, (v) => cs.rows({ id: "ties", items: (v.ties || []).filter((t) => !t.withdrawn), key: (t) => t.tie_id,
    name: (t) => cs.w(S + "kind." + (["employer", "relative", "business", "other"].includes(t.kind) ? t.kind : "other")),
    cols: [S + "col.kind", S + "col.who", S + "col.disclosed"],
    cells: (t) => [cs.w(S + "kind." + (["employer", "relative", "business", "other"].includes(t.kind) ? t.kind : "other")),
      cs.ref("person", t.entity, t.entity, [t.note || ""]) + (t.note ? ` <span class="cs-meta">${cs.esc(t.note)}</span>` : ""),
      cs.w(t.attribution === "name" ? S + "says.name" : S + "says.group", { handle: me })],
    acts: (t) => cs.act("withdrawtie", { label: "act.withdrawtie.label.ties", data: { tie: t.tie_id } }) }), { empty: S + "none" })));
  out.push(cs.sec(S + "add", cs.choice("tie-kind", S + "kind", [["employer", S + "kind.employer"], ["relative", S + "kind.relative"], ["business", S + "kind.business"], ["other", S + "kind.other"]], {})
    + cs.field("tie-who", S + "whofield", { help: S + "whofield.help" })
    + cs.field("tie-note", S + "note", { area: true, rec: true, help: S + "note.help" })
    + cs.checks("tie-says", S + "says", [["name", S + "says.name.choice", false], ["group", S + "says.group.choice", true]], { radio: true })
    + `<p class="cs-note">${cs.w(S + "either", { handle: me })}</p>`
    + cs.act("declaretie", { label: "act.declaretie.label.ties", tone: "primary" })));
  return out.join("");
}

const acts = [
  /* "Add this tie": its kind, who, the member's note (her own words serve as the reason, DEC-88) and how a case says it */
  { op: "declaretie", label: "act.declaretie.label.ties", reasonField: "note",
    send(view, el, cs) {
      const entity = String(cs.value("tie-who") || "").trim(), note = String(cs.value("tie-note") || "").trim();
      if (!entity || !note) return { refuse: "screen.ties.add.empty" };
      return { body: { entity, kind: String(cs.value("tie-kind") || "other"), note, attribution: cs.value("tie-says-0") === true ? "name" : "group" } };
    } },
  /* "Remove a tie", from its row, with a reason */
  { op: "withdrawtie", label: "act.withdrawtie.label.ties",
    send(view, el) { return { body: { tieId: String(el.dataset.tie || "") } }; } },
];

export const TIES_WORDS = [
  ["why", "Why you are asked"],
  ["why.1", "A published case is trusted only if readers know of anything that could pull the people behind it one way. Saying so openly protects you and the group."],
  ["why.2", "When a case your group publishes concerns one of your ties, the case says so, in the way you choose below."],
  ["why.3", "Before the group publishes, each member who signs confirms they have no tie they have not listed here."],
  ["why.4", "Only what could matter: an employer, a relative in a public body, a business you have an interest in. Not your opinions, politics or private life."],
  ["who", "Who sees it"],
  ["who.1", "Inside the group: only you and the group's administrators. Other members never see this list.", true],
  ["who.2", "Outside the group: no one, unless a published case concerns the tie. Then its readers see the tie, with or without your handle, as you chose.", true],
  ["who.3", "It is kept with your group's records, so a court order could reach it like the rest of them.", true],
  ["list", "Your ties"],
  ["none", "You have listed no tie."],
  ["col.kind", "Kind"],
  ["col.who", "Who"],
  ["col.disclosed", "A case would say"],
  ["kind", "Kind"],
  ["kind.employer", "Employer"],
  ["kind.relative", "Relative"],
  ["kind.business", "A business I have an interest in"],
  ["kind.other", "Other"],
  ["add", "Add a tie"],
  ["whofield", "Who"],
  ["whofield.help", "The person or organisation the record follows, by its record id."],
  ["note", "The tie, in your words"],
  ["note.help", "For example \"member-owner\", or \"my cousin works on its staff\"."],
  ["says", "If a case the group publishes concerns them, the case discloses this tie", true],
  ["says.name.choice", "Naming me by my handle", true],
  ["says.group.choice", "Without naming me: \"a member of the group\"", true],
  ["says.name", "naming you: \"{handle}, who worked on this case, has this tie\"", true],
  ["says.group", "\"a member of the group who worked on this case has this tie\"", true],
  ["either", "Either way the tie is disclosed to readers of the case. Inside the group, only you ({handle}) and the administrators see this list.", true],
  ["add.empty", "Name who the tie is with and describe it."],
].map(([k, en, p]) => row("screen.ties." + k, en, !!p));

const words = ["screen.ties.name", "screen.ties.purpose",
  ...["declaretie", "withdrawtie"].flatMap((op) => ["act." + op + ".label.ties", "act." + op + ".does"]),
  "state.empty", "state.loading", "state.failed", ...TIES_WORDS];

export const TIES_SCREEN = Object.freeze({ id: "ties", reads, render, acts, words });
