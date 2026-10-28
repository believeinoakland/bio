/* structured-text-reader R1: a generated file at the text bound of KML, ICS, VCF, SRT and VTT reads whole, in byte
 * windows with a carry, and the last record's token is found. (JSON, NDJSON, GeoJSON, XML, SVG: r1-large-a.) */
import { test } from "node:test";
import { readsWholeAtBound } from "./large.mjs";

for (const kind of ["kml", "ics", "vcf", "srt", "vtt"]) {
  test(`R1 a generated ${kind} file at the text bound reads whole and its last record's token is found`, () => readsWholeAtBound(kind));
}
