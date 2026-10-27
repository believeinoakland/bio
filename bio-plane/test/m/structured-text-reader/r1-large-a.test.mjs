/* structured-text-reader R1: a generated file at the text bound of JSON, NDJSON, GeoJSON, XML and SVG reads whole, in
 * byte windows with a carry, and the last record's token is found. (KML and the line formats: r1-large-b.) */
import { test } from "node:test";
import { readsWholeAtBound } from "./large.mjs";

for (const kind of ["json", "ndjson", "geojson", "xml", "svg"]) {
  test(`R1 a generated ${kind} file at the text bound reads whole and its last record's token is found`, () => readsWholeAtBound(kind));
}
