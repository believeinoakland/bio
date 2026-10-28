/* The first jurisdiction profile, kept as a held id: the City of Oakland and Alameda County, the one the project's own
 * instance uses (`build/layers.md`, "No jurisdiction in the product", rule 2). Since T53 it is a package (R114): a profile
 * of one field, the ids of the four layers that hold its facts, federal first. Every setting, test and caller that names
 * `oakland-alameda` is unchanged; `get`, `list` and `combine` resolve it to the layers. The unsplit profile's facts, each with
 * the measurement or ruling it rests on, are in the layers: ./layers/us-federal.mjs, ./layers/us-california.mjs,
 * ./layers/us-ca-alameda-county.mjs and ./layers/us-ca-oakland.mjs (whose header carries the unsplit profile's own). */
export default {
  id: "oakland-alameda",
  name: "City of Oakland and Alameda County",
  covers: ["City of Oakland", "Alameda County"],
  test: false,
  package: ["us-federal", "us-california", "us-ca-alameda-county", "us-ca-oakland"],
};
