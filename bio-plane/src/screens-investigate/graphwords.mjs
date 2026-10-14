/* screens-investigate R18: the four sentences the connection graph (`PARTS.graph`) draws beside a step, held once per
 * screen that draws the graph under that screen's own keys (`<screen prefix>g.<part>`). */
import { row } from "./row.mjs";

export const graphRows = (prefix) => [
  row(prefix + "g.cited", "the cited passage"),
  row(prefix + "g.declared", "declared, not evidenced"),
  row(prefix + "g.hunch", "a hunch, not evidence"),
  row(prefix + "g.nosource", "this step names no source"),
];
/** The word keys a screen hands `PARTS.graph` for those sentences, and the shared connection words it lists. */
export const graphKeys = (prefix) => ({ cited: prefix + "g.cited", declared: prefix + "g.declared", hunch: prefix + "g.hunch", nosource: prefix + "g.nosource" });
export const GRAPH_SHARED = Object.freeze([
  ...["pos", "part", "money", "ment", "same", "lead"].flatMap((k) => ["connection.kind." + k + ".name", "connection.kind." + k + ".means"]),
  "connection.graph.limit", "connection.graph.limit.means", "connection.graph.trail.means", "connection.graph.grade.means", "connection.graph.centre.means",
  "connection.graph.click", "connection.graph.trail.label", "connection.graph.legend.grade",
  "connection.thing.person", "connection.thing.office", "connection.thing.org", "connection.thing.fund", "connection.thing.doc", "connection.thing.pay", "connection.thing.gap",
]);
