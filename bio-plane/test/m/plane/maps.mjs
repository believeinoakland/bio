/* R5's statement, for the tests: each module's own ops map, built on a host as its module offers it, in the order the
   plane's route map spreads them (today's order: `src/plane/store.mjs`' `routes`, then instance-setup's, then control-plane's). */
import { actionsOf, actionsOps } from "../../../src/actions/index.mjs";
import { actionClocksOf, actionClocksOps } from "../../../src/action-clocks/index.mjs";
import { localFactsOf, localFactsOps } from "../../../src/local-facts/index.mjs";
import { filingTemplatesOf, filingTemplatesOps } from "../../../src/filing-templates/index.mjs";
import { standardsOf, standardsOps } from "../../../src/standards/index.mjs";
import { conformanceOf, conformanceOps } from "../../../src/conformance/index.mjs";
import { consequencesModule, consequencesOps } from "../../../src/consequences/index.mjs";
import { filingsOf, filingsOps } from "../../../src/filings/index.mjs";
import { escalationOf, escalationOps } from "../../../src/escalation/index.mjs";
import { actionPlansOf, actionPlansOps } from "../../../src/action-plans/index.mjs";
import { promotionOf, promotionOps } from "../../../src/promotion/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { provenanceOps } from "../../../src/provenance/ops.mjs";
import { provenanceRoutesOf, provenanceRouteOps } from "../../../src/provenance-routes/index.mjs";
import { membershipOf, membershipOps, viewerPredicate } from "../../../src/membership/index.mjs";
import { credentialsOf, credentialsOps } from "../../../src/credentials/index.mjs";
import { observationLogOf, observationLogOps, OBSERVATION_LOG_MODULE } from "../../../src/observation-log/index.mjs";
import { runProductionsOf, runProductionsOps } from "../../../src/run-productions/index.mjs";
import { captureRequestsOf, captureRequestsOps } from "../../../src/capture-requests/index.mjs";
import { recordOf, recordCoreOps } from "../../../src/record-core/index.mjs";
import { governorOf, governorRoutes } from "../../../src/host-governor/index.mjs";
import { captureOf, captureOps } from "../../../src/capture/index.mjs";
import { monitoringOf, monitoringOps } from "../../../src/monitoring/index.mjs";
import { linkSweepOf, linkSweepOps } from "../../../src/link-sweep/index.mjs";
import { connectionsOf, connectionsOps } from "../../../src/connections/index.mjs";
import { inquiryOf, inquiryOps } from "../../../src/inquiry/index.mjs";
import { citationOf, citationOps } from "../../../src/citation/index.mjs";
import { extractionOf, extractionOps } from "../../../src/extraction/index.mjs";
import { entitiesOf, entitiesOps } from "../../../src/entities/index.mjs";
import { basisVersionsOf, basisVersionsOps } from "../../../src/basis-versions/index.mjs";
import { contradictionOf, contradictionOps } from "../../../src/contradiction/index.mjs";
import { calibrationOf, calibrationOps } from "../../../src/calibration/index.mjs";
import { progressionsOf, progressionOps } from "../../../src/progressions/index.mjs";
import { intentOf, intentOps } from "../../../src/intent/index.mjs";
import { strengthOf, strengthOps } from "../../../src/strength/index.mjs";
import { reevaluationOf, reevaluationOps } from "../../../src/reevaluation/index.mjs";
import { reviewOf, reviewOps } from "../../../src/review/index.mjs";
import { caseAuthoringOf, caseAuthoringOps } from "../../../src/case-authoring/index.mjs";
import { ratificationOf, ratificationOps } from "../../../src/ratification/index.mjs";
import { publicationOf, publicationOps } from "../../../src/publication/index.mjs";
import { publicReadOf, publicReadOps } from "../../../src/public-read/index.mjs";
import { projectStageOf, projectStageOps } from "../../../src/project-stage/index.mjs";
import { networkNoticesOf, networkNoticesOps } from "../../../src/network-notices/index.mjs";
import { corpusExportOf, corpusExportOps } from "../../../src/corpus-export/index.mjs";
import { biasOf, biasOps } from "../../../src/bias/index.mjs";
import { aiRunsOf, aiRunsOps } from "../../../src/ai-runs/index.mjs";
import { contentOf, contentOps } from "../../../src/content/index.mjs";
import { retrievalOf, retrievalRoutes } from "../../../src/retrieval/index.mjs";
import { instanceSetupOf, instanceSetupOps } from "../../../src/setup.mjs";
import { controlPlaneRoutes } from "../../../src/control-plane/dispatch.mjs";

export const MODULE_MAPS = [
  ["membership", (c, u, b, e) => membershipOps(membershipOf(c), u, b, e)],
  ["credentials", (c, u, b, e) => credentialsOps(credentialsOf(c), u, b, e)],
  ["capture", (c, u, b, e) => captureOps(captureOf(c), u, b, e)],
  ["calibration", (c, u, b) => calibrationOps(calibrationOf(c), u, b)],
  ["bias", (c, u, b) => biasOps(biasOf(c), u, b)],
  ["extraction", (c, u, b, e) => extractionOps(extractionOf(c), u, b, e)],
  ["connections", (c, u, b, e) => connectionsOps(connectionsOf(c), u, b, e)],
  ["inquiry", (c, u, b) => inquiryOps(inquiryOf(c), u, b)],
  ["citation", (c, u) => citationOps(citationOf(c), u)],
  ["observation-log", (c, u, b) => observationLogOps(observationLogOf(c), u, b)],
  ["run-productions", (c, u, b) => runProductionsOps(runProductionsOf(c), u, b)],
  ["entities", (c, u, b) => entitiesOps(entitiesOf(c), u, b)],
  ["contradiction", (c, u, b) => contradictionOps(contradictionOf(c), u, b)],
  ["progressions", (c, u, b) => progressionOps(progressionsOf(c), u, b)],
  ["intent", (c, u, b) => intentOps(intentOf(c), u, b)],
  ["basis-versions", (c, u, b) => basisVersionsOps(basisVersionsOf(c), u, b)],
  ["strength", (c, u, b) => strengthOps(strengthOf(c), u, b)],
  ["reevaluation", (c, u, b) => reevaluationOps(reevaluationOf(c), u, b)],
  ["case-authoring", (c, u, b) => caseAuthoringOps(caseAuthoringOf(c), u, b)],
  ["ratification", (c, u, b) => ratificationOps(ratificationOf(c), u, b)],
  ["corpus-export", (c, u) => corpusExportOps(corpusExportOf(c), (k) => u.searchParams.get(k))],
  ["publication", (c, u, b) => publicationOps(publicationOf(c), u, b)],
  ["public-read", (c, u) => publicReadOps(publicReadOf(c), u)],
  ["project-stage", (c, u) => projectStageOps(projectStageOf(c), u)],
  ["network-notices", (c, u, b) => networkNoticesOps(networkNoticesOf(c), u, b)],
  ["promotion", (c, u, b) => promotionOps(promotionOf(c), u, b)],
  ["record-core", (c, u, b) => recordCoreOps(recordOf(c), u, b, { sight: viewerPredicate })],
  ["provenance", (c, u, b) => provenanceOps(provenanceOf(c), u, b, { observer: OBSERVATION_LOG_MODULE })],
  ["provenance-routes", (c, u, b) => provenanceRouteOps(provenanceRoutesOf(c), u, b)],
  ["content", (c, u, b) => contentOps(contentOf(c), u, b)],
  ["capture-requests", (c, u, b) => captureRequestsOps(captureRequestsOf(c), u, b)],
  ["host-governor", (c, u, b) => governorRoutes(governorOf(c), u, b)],
  ["ai-runs", (c, u, b, e) => aiRunsOps(aiRunsOf(c, e), u, b)],
  ["retrieval", (c, u, b) => retrievalRoutes(retrievalOf(c), u, b)],
  ["actions", (c, u, b) => actionsOps(actionsOf(c), u, b)],
  ["action-clocks", (c, u, b) => actionClocksOps(actionClocksOf(c), u, b)],
  ["local-facts", (c, u, b) => localFactsOps(localFactsOf(c), u, b)],
  ["standards", (c, u, b) => standardsOps(standardsOf(c), u, b)],
  ["conformance", (c, u, b) => conformanceOps(conformanceOf(c), u, b)],
  ["consequences", (c, u, b) => consequencesOps(consequencesModule(c), u, b)],
  ["filings", (c, u, b) => filingsOps(filingsOf(c), u, b)],
  ["filing-templates", (c, u, b) => filingTemplatesOps(filingTemplatesOf(c), u, b)],
  ["action-plans", (c, u, b) => actionPlansOps(actionPlansOf(c), u, b)],
  ["escalation", (c, u, b) => escalationOps(escalationOf(c), u, b)],
  ["monitoring", (c, u, b) => monitoringOps(monitoringOf(c), u, b)],
  ["link-sweep", (c, u) => linkSweepOps(linkSweepOf(c), u)],
  ["review", (c, u, b) => reviewOps(reviewOf(c), u, b)],
  ["instance-setup", (c, u, b, e) => instanceSetupOps(instanceSetupOf(c, e), u, b)],
  ["control-plane", (c, u, b) => controlPlaneRoutes(c, u, b)],
];

/** Each module's map on host `ctx` for one request, as `[module, map]`, in R5's order. */
export const ownMaps = (ctx, url, body, env = {}) => MODULE_MAPS.map(([m, f]) => [m, f(ctx, url, body, env)]);
