/* structured-text-reader R3: KML and KMZ placemarks (name, description, extended data, coordinates as data); GeoJSON
 * features (properties, geometry type, bounding box). No map is drawn. A KMZ's KML is read through ooxml's archive route. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as S from "../../../src/structured-text-reader/index.mjs";
import { makeZip } from "../../make-zip.mjs";
import { enc, unitsOf, countingSource } from "./fixtures.mjs";

const parcels = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: { APN: "012-0345-006", zoning: "RM-2" }, geometry: { type: "Polygon", coordinates: [[[-122.27, 37.80], [-122.26, 37.81], [-122.25, 37.79], [-122.27, 37.80]]] } },
    { type: "Feature", properties: { APN: "012-0345-007", zoning: "CN-1" }, geometry: { type: "Point", coordinates: [-122.2, 37.7] } },
  ],
};

test("R3 a parcels GeoJSON's property is found; each feature keeps its geometry type and bounding box; coordinates are not text", async () => {
  for (const budget of [null, { bytes: 9 }]) {
    const r = await unitsOf(S.geojsonEntry, JSON.stringify(parcels), budget);
    const prop = r.units.find((u) => u.text === "012-0345-007");
    assert.equal(prop.path, "$.features[1].properties.APN");
    const features = r.units.filter((u) => u.kind === "feature");
    assert.equal(features.length, 2);
    assert.equal(features[0].geometry_type, "Polygon");
    assert.deepEqual(features[0].bbox, [-122.27, 37.79, -122.25, 37.81]);
    assert.deepEqual(features[0].properties, { APN: "012-0345-006", zoning: "RM-2" });
    assert.equal(features[1].path, "$.features[1]");
    assert.ok(!r.units.some((u) => u.kind === "value" && /coordinates/.test(u.path)), "no coordinate is a text unit");
    assert.equal(r.final.facts.features, 2);
  }
});

const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>Sites</name>
<Placemark><name>Pump station 4</name><description><![CDATA[<p>Rebuilt <b>2019</b></p>]]></description>
<ExtendedData><Data name="owner"><value>Water district</value></Data><SchemaData><SimpleData name="capacity">40</SimpleData></SchemaData></ExtendedData>
<Point><coordinates>-122.1,37.5,0</coordinates></Point></Placemark>
<Placemark><name>Outfall</name><LineString><coordinates>-122.0,37.0 -121.5,37.25</coordinates></LineString></Placemark>
</Document></kml>`;

test("R3 KML: a placemark's name, description and extended data are read, its coordinates kept as data", async () => {
  const r = await unitsOf(S.kmlEntry, kml, { bytes: 13 });
  const pm = r.units.filter((u) => u.kind === "placemark");
  assert.equal(pm.length, 2);
  assert.equal(pm[0].name, "Pump station 4");
  assert.equal(pm[0].description, "<p>Rebuilt <b>2019</b></p>");
  assert.deepEqual(pm[0].data, { owner: "Water district", capacity: "40" });
  assert.deepEqual(pm[0].coordinates, [[-122.1, 37.5, 0]]);
  assert.equal(pm[0].geometry, "Point");
  assert.ok(pm[0].text.includes("Rebuilt 2019") && pm[0].text.includes("owner: Water district"));
  assert.deepEqual(pm[1].bbox, [-122.0, 37.0, -121.5, 37.25]);
  assert.ok(!pm[0].text.includes("-122.1"), "coordinates are data, not text");
});

test("R3 a KMZ's placemark is found, its KML read through the archive route", async () => {
  const zip = makeZip([{ name: "doc.kml", data: enc(kml) }, { name: "files/icon.png", data: new Uint8Array([0x89, 0x50, 0x4e, 0x47]) }]);
  const src = countingSource(zip);
  const r = await S.kmzEntry.read(src, null, null);
  assert.equal(r.ok, true, JSON.stringify(r));
  const pm = r.units.find((u) => u.kind === "placemark" && u.name === "Outfall");
  assert.ok(pm);
  assert.equal(pm.member, "doc.kml");
  assert.equal(r.final.whole, true);
  assert.equal(S.kmzEntry.detect(zip, null)?.format, "kmz");
  const t = await S.kmzEntry.text(zip);
  assert.ok(t.text.includes("Pump station 4"));
});

test("R3 a KMZ that holds no KML is refused by name, final", async () => {
  const zip = makeZip([{ name: "readme.txt", data: enc("hello") }]);
  const r = await S.kmzEntry.read(countingSource(zip), null, null);
  assert.equal(r.ok, false);
  assert.equal(r.reason, "KMZ_NO_KML");
  assert.equal(r.failure, "final");
  assert.equal(typeof r.detail, "string");
});
