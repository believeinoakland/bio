/* R5's statement, for the tests: each module's own ops map, built on a host as its module offers it, in the order the
   plane's route map spreads them (today's order: `src/plane/store.mjs`' `routes`, then instance-setup's, admission's, then store-door's, K2043). */
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
import { acquisitionOf } from "../../../src/acquisition/index.mjs";
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
import { docketOf, docketOps } from "../../../src/docket/index.mjs";
import { caseCarriageOps } from "../../../src/case-carriage/index.mjs";
import { caseImportOf, caseImportOps } from "../../../src/case-import/index.mjs";
import { publicReadOf, publicReadOps } from "../../../src/public-read/index.mjs";
import { projectStageOf, projectStageOps } from "../../../src/project-stage/index.mjs";
import { networkNoticesOf, networkNoticesOps } from "../../../src/network-notices/index.mjs";
import { corpusExportOf, corpusExportOps } from "../../../src/corpus-export/index.mjs";
import { biasOf, biasOps } from "../../../src/bias/index.mjs";
import { aiRunsOf, aiRunsOps } from "../../../src/ai-runs/index.mjs";
import { contentOf, contentOps } from "../../../src/content/index.mjs";
import { retrievalOf, retrievalRoutes } from "../../../src/retrieval/index.mjs";
import { wizardScriptsOf, wizardScriptsOps } from "../../../src/wizard-scripts/index.mjs";
import { instanceSetupOf, instanceSetupOps } from "../../../src/setup.mjs";
import { controlPlaneRoutes } from "../../../src/store-door/dispatch.mjs";
import { admissionOf, admissionOps } from "../../../src/admission/window.mjs";
import { eventsOf, eventsOps } from "../../../src/events/index.mjs";
import { linesOf, linesOps } from "../../../src/lines/index.mjs";
import { moneyOf, moneyOps } from "../../../src/money/index.mjs";
import { moneyChecksOf, moneyChecksOps } from "../../../src/money-checks/index.mjs";
import { dutiesOf, dutiesOps } from "../../../src/duties/index.mjs";
import { peopleOf, peopleOps } from "../../../src/people/index.mjs";
import { exploreOf, exploreOps } from "../../../src/explore/index.mjs";
import { calculationsOf, calculationsOps } from "../../../src/calculations/index.mjs";
import { workbooksOf, workbooksOps } from "../../../src/workbooks/index.mjs";
import { legEarningOf, legEarningOps } from "../../../src/leg-earning/index.mjs";
import { hypothesesOf, hypothesesOps } from "../../../src/hypotheses/index.mjs";
import { answersOf, answersOps } from "../../../src/answers/index.mjs";
import { caseTensionsOf, caseTensionsOps } from "../../../src/case-tensions/index.mjs";
import { followingOf, followingOps } from "../../../src/following/index.mjs";
import { fileSafetyOf, fileSafetyOps } from "../../../src/file-safety/index.mjs";

export const MODULE_MAPS = [
  ["membership", (c, u, b, e) => membershipOps(membershipOf(c), u, b, e)],
  ["credentials", (c, u, b, e) => credentialsOps(credentialsOf(c), u, b, e)],
  /* K2042 (acquisition R43): the group's co-archive setting, acquisition's two acts. acquisition exports no ops map of
     its own (its ops are reached through capture's and control-plane's doors), so the pair is named here as the module's
     whose methods answer them: the plane adds no behaviour, only the entry (plane R9). */
  ["acquisition", (c, u, b) => ({ coarchiveset: () => acquisitionOf(c).coArchiveSet({ on: b ? b.on : undefined, by: u.searchParams.get("by") }),
                                  coarchivestate: () => acquisitionOf(c).coArchiveState() })],
  ["capture", (c, u, b, e) => captureOps(captureOf(c), u, b, e)],
  ["file-safety", (c, u, b, e) => fileSafetyOps(fileSafetyOf(c), u, b, e)],   /* R26: directly after capture's */
  ["calibration", (c, u, b) => calibrationOps(calibrationOf(c), u, b)],
  ["bias", (c, u, b) => biasOps(biasOf(c), u, b)],
  ["extraction", (c, u, b, e) => extractionOps(extractionOf(c), u, b, e)],
  ["connections", (c, u, b, e) => connectionsOps(connectionsOf(c), u, b, e)],
  ["inquiry", (c, u, b) => inquiryOps(inquiryOf(c), u, b)],
  ["leg-earning", (c, u) => legEarningOps(legEarningOf(c), u)],
  ["hypotheses", (c, u, b) => hypothesesOps(hypothesesOf(c), u, b)],
  ["citation", (c, u) => citationOps(citationOf(c), u)],
  ["observation-log", (c, u, b) => observationLogOps(observationLogOf(c), u, b)],
  ["run-productions", (c, u, b) => runProductionsOps(runProductionsOf(c), u, b)],
  ["entities", (c, u, b) => entitiesOps(entitiesOf(c), u, b)],
  ["events", (c, u, b) => eventsOps(eventsOf(c), u, b)],
  ["lines", (c, u, b) => linesOps(linesOf(c), u, b)],
  ["money", (c, u, b) => moneyOps(moneyOf(c), u, b)],
  ["money-checks", (c, u, b) => moneyChecksOps(moneyChecksOf(c), u, b)],
  ["duties", (c, u, b) => dutiesOps(dutiesOf(c), u, b)],
  ["people", (c, u, b) => peopleOps(peopleOf(c), u, b)],
  ["explore", (c, u, b) => exploreOps(exploreOf(c), u, b)],
  ["calculations", (c, u, b) => calculationsOps(calculationsOf(c), u, b)],
  ["workbooks", (c, u, b) => workbooksOps(workbooksOf(c), u, b)],
  ["contradiction", (c, u, b) => contradictionOps(contradictionOf(c), u, b)],
  ["progressions", (c, u, b) => progressionOps(progressionsOf(c), u, b)],
  ["intent", (c, u, b) => intentOps(intentOf(c), u, b)],
  ["basis-versions", (c, u, b) => basisVersionsOps(basisVersionsOf(c), u, b)],
  ["strength", (c, u, b) => strengthOps(strengthOf(c), u, b)],
  ["reevaluation", (c, u, b) => reevaluationOps(reevaluationOf(c), u, b)],
  ["case-authoring", (c, u, b) => caseAuthoringOps(caseAuthoringOf(c), u, b)],
  ["ratification", (c, u, b) => ratificationOps(ratificationOf(c), u, b)],
  ["case-import", (c, u, b) => caseImportOps(caseImportOf(c), u, b)],
  ["corpus-export", (c, u) => corpusExportOps(corpusExportOf(c), (k) => u.searchParams.get(k))],
  ["case-tensions", (c, u, b) => caseTensionsOps(caseTensionsOf(c), u, b)],
  ["publication", (c, u, b) => publicationOps(publicationOf(c), u, b)],
  /* plane R18 (T37; K2226): case-carriage's map, over the one instance publication's factory made */
  ["case-carriage", (c, u, b) => caseCarriageOps(publicationOf(c).caseCarriage, u, b)],
  ["docket", (c, u, b) => docketOps(docketOf(c), u, b)],
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
  ["answers", (c, u, b) => answersOps(answersOf(c), u, b)],
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
  ["following", (c, u, b) => followingOps(followingOf(c), u, b)],
  ["review", (c, u, b) => reviewOps(reviewOf(c), u, b)],
  ["wizard-scripts", (c, u, b) => wizardScriptsOps(wizardScriptsOf(c), u, b)],
  ["instance-setup", (c, u, b, e) => instanceSetupOps(instanceSetupOf(c, e), u, b)],
  ["admission", (c, u, b) => admissionOps(admissionOf(c), u, b)],
  ["store-door", (c, u, b) => controlPlaneRoutes(c, u, b)],
];

/** Each module's map on host `ctx` for one request, as `[module, map]`, in R5's order. */
export const ownMaps = (ctx, url, body, env = {}) => MODULE_MAPS.map(([m, f]) => [m, f(ctx, url, body, env)]);
