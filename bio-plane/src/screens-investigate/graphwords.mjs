/* screens-investigate R18, R27: the shared keys the connection graph (`PARTS.graph`) reads, listed by each screen that draws
 * it (its four own sentences are `<screen prefix>g.<part>`, listed with that screen's keys). */
export const GRAPH_SHARED = Object.freeze([
  ...["pos", "part", "money", "ment", "same", "step_source", "lead"].flatMap((k) => ["connection.kind." + k + ".name", "connection.kind." + k + ".means"]),
  "connection.graph.limit", "connection.graph.limit.means", "connection.graph.trail.means", "connection.graph.grade.means", "connection.graph.center.means",
  "connection.graph.click", "connection.graph.trail.label", "connection.graph.legend.grade",
  "connection.thing.person", "connection.thing.office", "connection.thing.org", "connection.thing.fund", "connection.thing.doc", "connection.thing.pay", "connection.thing.gap",
]);
