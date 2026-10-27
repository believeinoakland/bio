# AI-DESIGN · Bob's decisions this lane carries

One line per decision (LANES.md §1): id · date · his words, quoted, never reworded · source (where his words are kept · the K ruling that recorded them). Ellipses mark words left out, never words changed. Earlier rulings these vary are in `RULINGS-FOR-BOB.md`. Started by AI-DESIGN #3, 2026-10-27, from `REQUIREMENTS.md` §1–§17, `PROCESS.md` §1, §8, `HANDOFF-A1-A41.md` (archive) and `build/rulings.md`.

## The direction and its standing
- AD1 · 2026-10-17 · "The general AI provider support must be general enough and the interface abstracted sufficiently to... enable any AI provider to be used ... Include an optimal UX for team leaders and individual users to configure which AIs to list as options that can be used in the Civicsmith workflow." (whole text in `REQUIREMENTS.md` §1; AIR1–AIR10) · REQUIREMENTS §1 · K3735
- AD2 · 2026-10-17 · "I agree with your recommendations for now, though this is a conversation in which they're bound to evolve." (AIR1–AIR10 and §4's four recommendations) · A4 · K3735
- AD3 · 2026-10-18 · "The AI design lane is on a different schedule. I'm still researching those issues separately." · K3804
- AD4 · 2026-10-22 · "this work is beta level and won't be added until after the alpha release has been deployed." · A41, HANDOVER · K4581
- AD5 · 2026-10-22 · "A" (send the UX needs to the UX design lane now, marked beta, below every T51 item) · K4623
- AD6 · 2026-10-27 · "let's get all of this designed, then integrated into a comprehensive build plan, and THEN start building it" (naming AI provider selection and full support for the assistant) · K5417

## Evidence, gates and testing
- AD7 · 2026-10-19 · "the means by which a team or member choose an AI provide for their assistant must also be evidence-based." ... "The first gate an AI model must meet is that it must be capable of meeting Civicsmith's requirements and metrics" ... "Those tests must be run under Civicsmith control, with no opportunity for the results to be gamed." (whole text `PROCESS.md` §1; AIR11–AIR16) · PROCESS §1 · K4421
- AD8 · 2026-10-19 · "AI tests run and submitted by outside teams/members will run in a locked CS container that can't (easily) be hacked. The results bundle will be generated and locked in the same context." · PROCESS §8 · K4421
- AD9 · 2026-10-20 · "Any OpenRouter support or direct support for models that we add to CS should limit the model choices to those that meet our privacy requirements, and the conformance suite and the characterization measurements demonstrate them to be capable and efficient enough to use." (AIR17–AIR19; its privacy part varied by AD27–AD30) · REQUIREMENTS §7 · K4421
- AD10 · 2026-10-20 · "as recommended" (a team's own unlisted endpoint only through the test flow; whether OpenRouter names its serving host verified by test) · A9 · K4421
- AD11 · 2026-10-21 · "The gate check and capabilities confirmation process should be standardized and controlled by CS, with the capability for results bundles to be centrally consolidated so that they're available for teams to access." (AIR22) · REQUIREMENTS §8 · K4421
- AD12 · 2026-10-21 · "The central results service is similar to filing templates." (AIR36) · REQUIREMENTS §10 (9) · K4421
- AD13 · 2026-10-21 · Gate 1 thresholds (Bob sets them after measurement): "ok" · REQUIREMENTS §10 (10) · K4421
- AD14 · 2026-10-21 · "BTW, I agree with all of your recommendations." (reasonableness reading outside Gate 1; "civic work not refused" group G9; a switched-off use refuses, never fails over; disclosure per provider and host; provider-first grouping) · REQUIREMENTS §12 · K4443
- AD15 · 2026-10-21 · "I like it" (the results library: parts passed and limits, speed, cost of standard jobs, who tested and when; transcripts and the sending team's name private) · REQUIREMENTS §15 · K4443
- AD16 · 2026-10-21 · live test L1 (gateway-held key) agreed: "yes" · A36 · K4443

## Providers, plans and connection
- AD17 · 2026-10-21 · "It should support OpenRouter and Cloudflare AI APIs as well as individual providers and plans - both API and subscription. The set of supported providers/plans/types is as expansive as it is because some teams and individuals may want their CS assistant to use the AI provider relationships they already have in place." (AIR20) · REQUIREMENTS §8 · K4421
- AD18 · 2026-10-21 · "The connection configuration UX should be organized at the top level around the provider then each of their supported plans - which is like the way the cybersecurity UX is currently structured." (AIR21, AIR29) · REQUIREMENTS §8 · K4421
- AD19 · 2026-10-21 · "Anthropic support will be included just like all other providers. It'll be included because some teams may already have a relationship that they want to further leverage in CS." (AIR23; varies K3717) · REQUIREMENTS §9 · K4421
- AD20 · 2026-10-21 · "The CS UX must either describe or guide the user through the connection process. It should never let the user to sort it out unsupported." (AIR30) · REQUIREMENTS §10 (1) · K4421
- AD21 · 2026-10-21 · "Free tiers that allow the provider to read and train on CS content should only be allowed if a plain warning has been presented and accepted." (AIR31) · REQUIREMENTS §10 (3) · K4421
- AD22 · 2026-10-21 · "As I've experienced with CC, a read of the latest fine-print reveals that many providers to in fact allow the use of subscription plans in apps, though with restrictions." (AIR34) · REQUIREMENTS §10 (4) · K4421
- AD23 · 2026-10-21 · "As we found with CC, there are other means of storing and presenting AI tokens that don't involve the app holding it, but rather referring to it in a password manager or some other allowed means." (AIR32) · REQUIREMENTS §10 (5) · K4421
- AD24 · 2026-10-21 · "We should add OpenRouter support to CS's AI support. With that support in place, we can then open an OpenRouter account to get the information we need." · REQUIREMENTS §10 (7) · K4421
- AD25 · 2026-10-21 · "The latest catalogue updates should be accessible at all times regardless of the CD software release schedule." (AIR33) · REQUIREMENTS §10 (11) · K4421
- AD26 · 2026-10-21 · "Agreed on how teams connect and Personal subscriptions." (pasted key, provider sign-in, built-in Cloudflare; built-in the default for a team with no outside account) · REQUIREMENTS §13 · K4443
- AD27 · 2026-10-21 · "What makes it a personal account is that I run it. ... So CS members will decide whether a personal subscription can be used by them (but not at the project or team levels)." (AIR41) · REQUIREMENTS §13 · K4443
- AD28 · 2026-10-21 · "When we say 'Never at project or team level' that means that no CS members other then the personal subscription owner will be able to run their assistant using a member's personal subscription." · REQUIREMENTS §13 · K4443
- AD29 · 2026-10-21 · "Agreed, we should understand how Cloudflare can keep a key so that the application doesn't - thus abiding by the restrictions some plans have." · REQUIREMENTS §14 · K4443
- AD30 · 2026-10-21 · "Okay: C." (a key reaches the gateway by Civicsmith's own screen, passed straight to Cloudflare's store and never kept, the default, or by the Cloudflare dashboard; AIR45) · REQUIREMENTS §17 · K4464

## Privacy and origin checks
- AD31 · 2026-10-21 · "At this point in time, Chinese models should not be considered as capable." (varied by AD34) · REQUIREMENTS §10 (2) · K4421
- AD32 · 2026-10-21 · "The member choosing which AI providers/plans/types to select from should see the full list of the 6 privacy checks you've listed. All 6 should default to being required. However the member should be able to select any of these checks to not be required, at their discretion." (who sets them varied by AD33) · REQUIREMENTS §14 · K4443
- AD33 · 2026-10-21 · "That's the team's decision. A side-effect of that is that the team may choose to untick some of those privacy checks. If they do, then those unticked checks can ticked or unticked by a project or member. All checks that the administrator leaves checked can't be unticked at the project or member level." · REQUIREMENTS §15 · K4443
- AD34 · 2026-10-21 · "A project owner that ticks a check is thus indicating that all work done directly in that project (not in the record or in other areas that aren't project-specific) can only be done using an AI provider/plan/type that meets that privacy check." and "Yes, models from Chinese developers follow the same rules as the privacy checks." · REQUIREMENTS §16 · K4443
- AD35 · 2026-10-21 · "Yes" (the team's and a project's required checks bind every account used for that work, a member's personal subscription included) · REQUIREMENTS §16, A34 · K4443

## Accounts, failover and limits
- AD36 · 2026-10-21 · "Failover versus K2352: allowed" (an owner-declared ordered list of accounts may carry work onward; AIR25, AIR27) · REQUIREMENTS §11 · K4421
- AD37 · 2026-10-21 · cross-owner failover only with the other owner's standing opt-in, off by default: "agreed"; turn-level progress where an AI cannot stream: "agreed" · A22 · K4421
- AD38 · 2026-10-21 · health reports opt-in and content-free: "ok" · A20 · K4421
- AD39 · 2026-10-21 · "Agreed" (who may set an ordered list: team administrators for team accounts, a project's owner for project accounts, each member for their own) · REQUIREMENTS §14 (4) · K4443

## The beta's bar
- AD44 · 2026-10-27 · "as recommended" (AI1, option B: a part reaches members once the chosen AI passes Gate 1 at marks Bob sets after the first measuring run; the real public-matters set, once written, is a standing accuracy check shown to teams, a part below its mark there switched off for that AI) · QUESTIONS-FOR-BOB AQ1, BOB #322's relay · K5475

## Costs
- AD43 · 2026-10-27 · "If the team or project is paying for the AI usage, then they should see who's using what so that they can manage usage with that member before it gets out of control." (option A of UX-DESIGN's cost-visibility question; personal subscriptions stay private) · BOB #321's relay · K5459

## The lane's scope
- AD40 · 2026-10-21 · "This session … isn't going to be making decisions relating to UX design for the AI assisted features. The requirements related to UX that we should document here should include reference to the AI provider/plan/type options being presented in a way similar to cybersecurity options." · REQUIREMENTS §9 · K4421
- AD41 · 2026-10-21 · "These aren't issues that need to be addressed in this lane" (provider-document research stopped; remaining gaps OPEN, restricting nothing) · A18 · K4421
- AD42 · 2026-10-21 · packaging: "a technical question" (BOB's) · A20 · K4421
