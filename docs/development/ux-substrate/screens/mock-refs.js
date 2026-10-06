/* The per-screen references (DEC-160, widened 6 October): for each screen, the things it names, what each is, and why it
   matters to what the member is doing there. Merged into REFS from mock-shell.js; GLOBAL_REFS cover things named everywhere. */
const SCREEN_REFS = {
  "install": [
    ["Cloudflare account",null,"<b>Cloudflare account</b> · the hosting account · your group's Civicsmith and all its records live in it · the free plan is enough to start","Whoever can sign in to it controls everything, so use a group account rather than a personal login."],
    ["Workers Paid",null,"<b>Workers Paid</b> · Cloudflare's paid plan · $5 a month, with a payment method · can be added later","Needed only for recomputing members' spreadsheets and for members signing in with a Claude subscription."],
    ["short name",null,"<b>Short name</b> · your group's fixed label · in every web address and beside every signature","Chosen once, here: it can never change without installing again, so an unnamed group picks one that reveals nothing."],
    ["lakeshore-tenants",null,"<b>lakeshore-tenants</b> · the short name typed here · becomes lakeshore-tenants.rosa-m.workers.dev and the label on every signature","This exact label is what every case your group signs will carry."],
    ["Signed release verified",null,"<b>Signed release</b> · the Civicsmith release you installed · its signature checked before anything ran","Confirms the software in your account is the release as published, unaltered."],
    ["Record store ready",null,"<b>Record store</b> · where your group's records are kept · inside your own Cloudflare account, nowhere else","Your group's work is stored here from the moment you claim it."],
    ["The assistant's container",null,"<b>The assistant's container</b> · the part of your Cloudflare account that runs the optional assistant · not yet allowed","Only a group that will use the assistant needs it; setting up works without it."],
    ["one-time password",null,"<b>One-time password</b> · shown once, on this page · spent when you claim the group in the next part","The only way to become the first administrator; if lost before claiming, only the Cloudflare account can set a new one."],
    ["first administrator","setup","<b>First administrator</b> · the person who claims the group with the one-time password · invites members and can add administrators","That is you, in the next part; a second administrator later means the group never depends on one person."]
  ],
  "setup": [
    ["one-time password","install","<b>One-time password</b> · shown once on the installer's last page · spent when you claim","Claiming with it makes you the first administrator; after that you sign in only with your own password."],
    ["Cloudflare account",null,"<b>Cloudflare account</b> · the hosting account your group's Civicsmith runs in · owner recorded below: Rosa Medina","It is the way back in if the one-time password is lost, and whoever holds it controls everything."],
    ["lakeshore-tenants",null,"<b>lakeshore-tenants</b> · your group's short name · fixed at install · in every address and beside every signature","Changing the group name here leaves it as it is."],
    ["records laws","due-date","<b>Records laws</b> · each place's public records law, with its source · for Oakland, a 10-day response window","Civicsmith counts your requests' due dates from it, so the place you choose sets those clocks."],
    ["Council District 3",null,"<b>Council District 3</b> · a seat on the city council · held by J. Ortega since 2023, from Legistar","Confirming the seat lets the record follow whoever holds it, not only today's holder."],
    ["Anthropic's Claude",null,"<b>Claude</b> · Anthropic's AI model · runs the assistant only if your group chooses one of the options below","A member's question goes to Anthropic only when they ask, under whichever account serves them."],
    ["Workers Paid",null,"<b>Workers Paid</b> · Cloudflare's paid plan · $5 a month, with a payment method","Members can sign in with their own Claude subscription only if your group's Civicsmith is on it."],
    ["daily limit",null,"<b>Daily limit</b> · the most the assistant may spend per member each day on the group's key · $5.00 entered below","Caps what the group pays Anthropic; it binds only members served by the group's key."],
    ["published case","published","<b>A published case</b> · a signed, permanent edition of a project's findings · corrected only by a new edition","A verified website lets readers confirm a case under your group's name really comes from it."],
    ["shield laws",null,"<b>Shield laws</b> · laws in many states, California among them, that can protect journalists from being forced to reveal unpublished sources","A member such as a reporter may have protections the rest of the group does not."]
  ],
  "group-identity": [
    ["how members are welcomed","home","<b>The welcome</b> · what a member sees first on Home · “What brought you here?” and its starting points","The kind and focus you give here decide which starting points Home offers first."],
    ["Draft · the assistant's",null,"<b>Draft · the assistant's</b> · a label on words the assistant wrote · stays until a member edits and keeps them","Nothing here is saved as the group's own until a member keeps it."]
  ],
  "join": [
    ["13 October 2026",null,"<b>Expires 13 October 2026</b> · an invitation lasts seven days · this one created by Rosa on 6 October · works once","After that the link stops working and Rosa must create a new one."],
    ["contribute",null,"<b>Contribute</b> · what this invitation lets you do · add to the record, open questions, take part in projects","It sets what you can do once you join; an administrator can change it later."],
    ["handle",null,"<b>Handle</b> · the name the record shows on your work · not your legal name unless you choose · you can change it later","It appears on any public case your work is in, so choose it with that in mind."],
    ["pen name",null,"<b>Pen name</b> · a handle that is not the name people know you by · the administrators still know who you are","Shields you from pressure if a published case names your work."],
    ["administrators",null,"<b>Administrators</b> · members who invite and manage members · Lakeshore Tenants has one, Rosa","They know who you are even under a pen name, and see the ties you declare."],
    ["public cases","published","<b>Public cases</b> · a group's signed, published findings · permanent, corrected only by a new edition","A handle on your work there is public too; that is the choice the guidance weighs."]
  ],
  "home": [
    ["3 photos you captured on Seminary Avenue","held","<b>Photos · Seminary Avenue</b> · captured by you for Pothole repairs · capture B · held, not yet vouched for","Until you vouch for them they cannot support the pothole question."],
    ["records request","action","<b>Records request: inspection logs</b> · to the Office of the City Clerk · sent 2 October by Mai · acknowledged 3 October, ref. R26-0412","The reply decides the next step of the pothole plan."],
    ["due 14 October","due-date","<b>Due 14 October</b> · the 10-day public records window from 2 October · rolled past a Sunday and a city holiday","If no reply is recorded by then, your queue says so once and the plan can move on."],
    ["Rents and leases on city land, and the streets we live on.","group-identity","<b>Your group's focus</b> · written by Rosa in Who your group is · seen by members only","It shapes which starting points Home offers you first."]
  ],
  "members": [
    ["hosting account",null,"<b>Hosting account</b> · the Cloudflare account the group's Civicsmith runs in · holder recorded at setup: Rosa Medina","Whoever signs in to it controls everything; with one administrator, the group depends on Rosa and on whoever holds it."],
    ["cover",null,"<b>Cover</b> · how the group knows a member, beside their handle · not a legal name · recorded when they are invited","Lets administrators know who each handle is without the record holding legal names."],
    ["Mai K.",null,"<b>Mai K.</b> · invited to contribute as mai.k · cover: from the Seminary Ave block · link works once, for seven days","Withdraw it if it went to the wrong person; until it is used, anyone holding the link can join."],
    ["declared: CPA",null,"<b>Declared: CPA</b> · Ana's own statement · certified public accountant · not yet confirmed here","Confirming it records that an administrator checked it; members ask her to check calculations either way."],
    ["contribute",null,"<b>Contribute</b> · a capability · add to the record, open questions, take part in projects","Every member here holds it; it is what an invitation grants by default."],
    ["administer",null,"<b>Administer</b> · a capability · invite and remove members, hold the group's key, change the group's settings","Only Rosa holds it, so the group depends on her alone."],
    ["$31.40 this month",null,"<b>$31.40 this month</b> · Anthropic's charges to the group's key, October so far · split by member","The group pays it; administrators see who spent what, never what was asked."]
  ],
  "account": [
    ["mai.k",null,"<b>mai.k</b> · your handle · shown on your work in the record and on any public case it is in","Change it here before your work reaches a published case if you would rather use a pen name."],
    ["check work in your field",null,"<b>Checks by expertise</b> · a member asks another with declared expertise to check their work · e.g. Ana, a CPA, checked a calculation","Declaring yours, such as Spanish–English interpreting, lets members send you checks in that field."],
    ["signing key",null,"<b>Signing key</b> · a key held in this browser · signs what you approve under your handle, such as a case you own","Without one registered here you cannot sign; revoking it ends this browser's key for good."]
  ],
  "connect": [
    ["the group's key",null,"<b>The group's API key</b> · held by Lakeshore Tenants · switched on by Rosa, 6 October · the group pays Anthropic for each use","It serves you now; your own account, if you connect one, replaces it for you alone."],
    ["Anthropic",null,"<b>Anthropic</b> · the company that makes Claude · receives your question and the material read to answer it, only when you ask","This is where your questions go, under whichever account serves you."],
    ["$5.00 a day for each member",null,"<b>Daily limit · $5.00</b> · set by your administrators for every member on the group's key","You have used $0.80 of it today; when it is reached the assistant stops serving you until the next day."],
    ["Workers Paid",null,"<b>Workers Paid</b> · the Cloudflare plan your group's Civicsmith can run on · $5 a month, paid by the group","Signing in with a subscription needs it; without it, connect with an API key instead."],
    ["Pro or Max plan",null,"<b>Pro or Max</b> · Claude's paid subscription plans · billed to you by Anthropic, not to your group","Only these plans can serve your questions through a subscription."],
    ["console.anthropic.com",null,"<b>console.anthropic.com</b> · Anthropic's Console, where API keys are made · needs a payment method","Where you would make your own key; Anthropic then bills you for each use."]
  ],
  "ties": [
    ["East Bay Transit",null,"<b>East Bay Transit</b> · your employer · a declared tie · disclosed without naming you","If a case the group publishes concerns it, the case says a member of the group works there."],
    ["Planning Commission",null,"<b>Planning Commission</b> · a City of Oakland commission that reviews land-use and development decisions · its staff work for the city","A case about city land may concern it; this tie would be disclosed naming you."],
    ["disclosed to readers of the case","ceremony","<b>Disclosure of ties</b> · a published case lists its workers' ties to anyone it concerns · confirmed by the signer before publishing","A tie you declare here is what the owner checks at the ties step before signing."],
    ["administrators",null,"<b>Administrators</b> · Lakeshore Tenants has one: Rosa","Besides you, only she can see this list."]
  ],
  "notes": [
    ["closed","document","<b>“Closed”</b> · how the city's work orders mark a report done · Administrative Instruction 4.12, passage 5: when the crew reports the work complete","The open question whether “closed” means “repaired” turns on it; the foreman's answer could become an observation."],
    ["60th",null,"<b>Seminary Ave at 60th</b> · a block in Pothole repairs · one of the held photos was taken here","Members spot-checked closed reports on this stretch; what the crew says applies to them."]
  ],
  "translations": [
    ["Undetermined",null,"<b>Undetermined</b> · a status the record gives when it cannot settle something, and says why · a protected word","A loose translation would change what members think the record shows."],
    ["from the release",null,"<b>From the release</b> · translated by Civicsmith and shipped with this version · not your group's own wording","Your group can still change it; the change is recorded with what it replaced."],
    ["Nobody looked","finder","<b>Nobody looked</b> · a gap mark · no member has searched a source for this yet","Members act on it, so the Spanish must read as a gap, not as a finding."],
    ["needs a second check",null,"<b>Second check</b> · a protected word changed by one speaker waits for another granted speaker or an administrator","Until Teo or Rosa confirms it, members reading Español see the English."],
    ["Held together","finder","<b>Held together</b> · a set of documents a member holds in Find to count, cite or act on as one","Still untranslated: members reading Español see it in English."],
    ["Reasoned",null,"<b>Reasoned</b> · the mark on an act that asks for a reason, which becomes part of the record","Ana's suggestion, “Justificado”, waits for a granted speaker to keep it or explain why not."]
  ],
  "wizards": [
    ["Get a record, Oakland style","request","<b>Get a record, Oakland style</b> · your group's copy of Civicsmith's Get a record · approved by Rosa","Civicsmith's original changed since the copy; a wizard editor decides whether to bring the change across."],
    ["Get a record","request","<b>Get a record</b> · Civicsmith's wizard · walks a member through asking an office for records · finished by 14 members","The original your group's Oakland copy is based on."],
    ["Our council-meeting checklist",null,"<b>Our council-meeting checklist</b> · your group's own wizard · approved by Rosa","Written by your group, so only your group's approvals change it."],
    ["Check a pothole report","capture","<b>Check a pothole report</b> · a draft wizard by Dev · for visiting a closed report and recording what you see","Not offered to members until it is submitted and approved."]
  ],
  "queue": [
    ["The Coliseum lease","project","<b>The Coliseum lease</b> · project · owner: Dev · 3 items for you here","Waiting on you: a decision on the newer lease amendment; also a disagreement on dates and an overdue reply."],
    ["Pothole repairs","project","<b>Pothole repairs</b> · project · whether potholes are repaired within the seven days Administrative Instruction 4.12 sets · 3 items for you here","Waiting on you: Ana's request to check the 812 of 903 count, due 16 October."],
    ["the rent adjustment","matter","<b>The 2024 rent adjustment</b> · a matter in The Coliseum lease · signed by the City Administrator, March 2024, without a council vote","Two documents disagree on its date; a member must judge which one holds."],
    ["A council member","explore","<b>J. Ortega</b> · Council District 3 since 2023 · his Form 700 for 2025 lists income from Bayline Properties","A lead, never a finding: nothing is evidence until a member opens a question and cites the documents."],
    ["38 disclosure filings",null,"<b>38 disclosure filings</b> · Form 700 statements of economic interests your group holds · council members' filings","The hint is only as complete as these filings; a missing year would hide a match."],
    ["6 of 50",null,"<b>6 of 50</b> · this check's past hints that members looked into and found false · most often two firms with similar names","Check the firm's name in the filing yourself before opening a question."],
    ["standing question","finder","<b>Standing question</b> · a search kept running for you · “pothole work orders” · reports new matches in what your group holds","Its 3 new documents may change the input of the count Ana asked you to check."]
  ],
  "finder": [
    ["data.oaklandca.gov",null,"<b>data.oaklandca.gov</b> · the City of Oakland's open-data portal · where Dev captured the work orders on 2 October","A copy from the city's own portal holds up better than one found elsewhere."],
    ["passage 3","document","<b>Passage 3</b> of Administrative Instruction 4.12 · “within seven calendar days of the report, weather permitting”","The words your search matched; cite this passage, not the whole policy."],
    ["within seven calendar days","standard","<b>Repair reported potholes within seven calendar days</b> · a standard · Administrative Instruction 4.12, §3 · in force since 2023","The rule the city is checked against; the work orders show how often it was met."],
    ["public archive copy",null,"<b>Public archive copy</b> · captured from a public web archive, not the city's own site · hence capture C","Capture it from the city's site before relying on it; that copy would hold up better."],
    ["2 documents held together",null,"<b>2 documents held together</b> · the FY2025 work orders and Administrative Instruction 4.12 · held for you until 16:40 today","A held set can be counted, cited or acted on as one; let it go when you are done."]
  ],
  "capture": [
    ["the office's own site",null,"<b>The office's own site</b> · the website of the office that issued the document · for Oakland, oaklandca.gov","A copy fetched there carries its source with it, so a reader can fetch the same page and compare."],
    ["public archive",null,"<b>Public archive</b> · an outside service that keeps dated copies of public web pages · not run by the city or by your group","It can rescue a page the city has removed, but it learns which address your group asked for."],
    ["testimony",null,"<b>Testimony</b> · one of the four grade scales · a person's own account of what they saw or heard","What you write here can support or cut against a question, labelled as yours, as Mai's Seminary Ave visit does."],
    ["grade D",null,"<b>Grade D</b> · what rests on a person's word · A is easiest for someone else to check · a grade never says whether something is true","D does not mean doubtful: it tells a reader your account can be checked only by asking you."]
  ],
  "held": [
    ["Photo · Seminary Ave at 60th","document","<b>Photo · Seminary Ave at 60th</b> · a held capture · taken 4 October · capture B · Pothole repairs","Picked for this batch: vouching for it lets it stand beside Mai's account of the unrepaired pothole."],
    ["Photo · Seminary Ave at 61st","document","<b>Photo · Seminary Ave at 61st</b> · a held capture · taken 4 October · capture B · Pothole repairs","Picked for this batch with the 60th Street photo; both are vouched for in one act."],
    ["vouched for",null,"<b>Vouching</b> · a member signs that a capture is what it says it is · until then it is held and counts toward nothing","Nothing on this list supports or cuts against any question until a member vouches for it."],
    ["Were the FY2022 transfers authorised?","question","<b>Were the FY2022 transfers authorised?</b> · Ana's question in Sewer fund transfers · waiting on the FY2024–25 budget","Setting the budget aside sends your reason to Ana on this question."],
    ["FY2024–25 budget","document","<b>City budget FY2024–25, adopted</b> · PDF, 412 pages · captured 2 October · held, not yet vouched for","The third row above, not picked: vouching for it would end Ana's wait."],
    ["crucial to a finding",null,"<b>Crucial to a finding</b> · a capture a finding would fall without · vouched for one at a time, never in a batch","The March 2024 amendment carries a finding in The Coliseum lease, so it gets its own look."]
  ],
  "document": [
    ["Public Works",null,"<b>Public Works</b> · a city department · repairs streets and fills potholes · headed by the Director of Public Works, today L. Chen","The department that issued this instruction is the one it binds."],
    ["oaklandca.gov",null,"<b>oaklandca.gov</b> · the City of Oakland's own website · where the city publishes its policies","Captured from the issuer's own site, so a reader can fetch the same page and compare its fingerprint."],
    ["revised 2023",null,"<b>Revised 2023</b> · the version this copy holds · the version in force when captured on 2 October 2026","FY2025 repairs are tested against this version, so a later revision would not change past counts."],
    ["The Director",null,"<b>The Director</b> · in this instruction, the Director of Public Works · held today by L. Chen","Passage 3 puts the seven-day duty on an office, so it binds whoever holds the post."],
    ["seven calendar days","standard","<b>Seven calendar days</b> · the standard passage 3 sets · weekends and holidays count · held as a standard in Pothole repairs","The window the 812 of 903 count is measured against."],
    ["weather permitting",null,"<b>Weather permitting</b> · the instruction's own exception to the seven days · nothing shown here says how it is recorded","A late repair may fall under it; check the work order for a weather note before counting it against the city."],
    ["recorded as closed","question","<b>Closed</b> · the city's status for a report · per passage 5, set when the crew reports the work complete, not after an inspection","This passage is why the project asks whether \"closed\" in the city's records means \"repaired\"."],
    ["L. Chen","person","<b>L. Chen</b> · a person the record follows · Director of Public Works since March 2022 · named in 14 documents","This copy names L. Chen; claiming the same person links the document to that page."],
    ["2026 performance report","document","<b>Report to council: street maintenance performance</b> · 2026 · capture B · claims 90% of potholes filled","It counts reports \"closed\", which passage 5 sets at the crew's report, not an inspection."]
  ],
  "project": [
    ["its own policy","document","<b>Administrative Instruction 4.12</b> · Public Works' pothole repair policy · capture B · sets seven calendar days","The project measures the city against its own rule, not against an outside standard."],
    ["Bar: B/B",null,"<b>The project's bar</b> · B on capture and B on connection · a question meets it when both of its grades reach B","The main question is at B and C: one step short, on connection."],
    ["Investigating",null,"<b>Investigating</b> · the project's stage · after Forming · Matured comes when its questions meet the bar","The project stays here until a question reaches B/B."],
    ["2026 report","document","<b>Report to council: street maintenance performance</b> · 2026 · capture B · claims 90% of potholes filled","Its 90% means something different depending on which seven days it counted."],
    ["seven working days",null,"<b>Seven working days</b> · a looser count than the seven calendar days Administrative Instruction 4.12 sets · skips weekends and holidays","If the city counted working days, its 90% would not test the instruction's standard."]
  ],
  "question": [
    ["2024 budget PDF","held","<b>City budget FY2024–25, adopted</b> · PDF, 412 pages · a held capture · set aside by Ben, 6 October","This question waits on it; restoring it returns it to the held list for a member to vouch for."],
    ["Ben","members","<b>Ben</b> · member of your group","Set the budget PDF aside on 6 October; the reason, \"wrong year\", stays on the record."],
    ["seven calendar days","standard","<b>Seven calendar days</b> · the standard Administrative Instruction 4.12 sets in passage 3 · weekends and holidays count","The standard this question tests the city against."],
    ["passage 3","document","<b>Passage 3</b> of Administrative Instruction 4.12 · \"The Director shall repair each reported pothole within seven calendar days of the report, weather permitting.\"","The passage Dev cited as support."],
    ["computed fact",null,"<b>Computed fact</b> · a figure worked out from captured data by a stated method · recomputed when an input changes","Anyone can rerun the 812 from the city's work orders and get the same count."],
    ["Ana","members","<b>Ana</b> · member of your group · owns Sewer fund transfers · declared expertise: accounting (CPA, confirmed)","Checked the 812 of 903 calculation on 5 October."],
    ["marked closed on 15 September",null,"<b>Report at 6012 Seminary Ave</b> · reported 12 September · marked closed 15 September · still open when Mai visited on 4 October","A closed report that was not repaired: the kind of case the 812 cannot show."],
    ["Mai","members","<b>Mai</b> · member of your group · translates Español · joined 2 October","Visited 6012 Seminary Ave on 4 October; that account cuts against the count as testimony, grade D."],
    ["Hunch",null,"<b>Hunch</b> · a member's suspicion, kept on the record · supports nothing and counts toward no grade","Dev's hunch is what the records request for inspection logs is meant to test."]
  ],
  "assistant": [
    ["812 of 903 reports closed within 7 days","calculation","<b>Reports closed within seven days, FY2025</b> · a calculation from the city's work orders · checked by Ana","Ask the assistant how it was counted; it answers from the method and the work orders your group holds."],
    ["2024 budget PDF","held","<b>City budget FY2024–25, adopted</b> · PDF, 412 pages · a held capture · set aside by Ben, 6 October","The assistant can search what your group holds for another source; restoring this one is a member's act."],
    ["Ben","members","<b>Ben</b> · member of your group","Ben's reason, \"wrong year\", is on the record; ask the assistant which year this question needs."],
    ["seven calendar days","standard","<b>Seven calendar days</b> · the standard Administrative Instruction 4.12 sets in passage 3 · weekends and holidays count","Ask the assistant whether the city's 2026 report counted calendar or working days; it says where it looked."],
    ["passage 3","document","<b>Passage 3</b> of Administrative Instruction 4.12 · \"The Director shall repair each reported pothole within seven calendar days of the report, weather permitting.\"","Ask the assistant to set it beside passage 5, which says when a report counts as closed."],
    ["computed fact",null,"<b>Computed fact</b> · a figure worked out from captured data by a stated method · recomputed when an input changes","The assistant can explain the method; only a member's check, like Ana's, is recorded as a check."],
    ["Ana","members","<b>Ana</b> · member of your group · owns Sewer fund transfers · declared expertise: accounting (CPA, confirmed)","Checked the count on 5 October; the assistant's work is labelled machine work and is not a check."],
    ["marked closed on 15 September",null,"<b>Report at 6012 Seminary Ave</b> · reported 12 September · marked closed 15 September · still open when Mai visited on 4 October","Ask the assistant for this report's work order: it would show what the crew recorded on 15 September."],
    ["Mai","members","<b>Mai</b> · member of your group · translates Español · joined 2 October","Mai's account is testimony; the assistant can find related records but cannot raise its grade."],
    ["Hunch",null,"<b>Hunch</b> · a member's suspicion, kept on the record · supports nothing and counts toward no grade","Ask the assistant what records would test Dev's hunch; it stays a hunch until a source supports it."]
  ],
  "answers": [
    ["work orders","document","<b>Public Works work orders, FY2025</b> · CSV, 903 rows · from the city's open-data portal · captured by Dev","The only source this answer counts; it records closing dates, not repair dates."],
    ["903 reports",null,"<b>903 reports</b> · every row in the FY2025 work orders · each with a reported date and a closed date","The whole that the 812 is counted against."],
    ["812 were closed within 7 calendar days","calculation","<b>Reports closed within seven days, FY2025</b> · a calculation · 812 of 903 · checked by Ana","The same count as the calculation; open it to see the method rather than rely on this answer."],
    ["passage 5","document","<b>Passage 5</b> of Administrative Instruction 4.12 · \"Repairs are recorded as closed when the crew reports the work complete.\"","Why the answer warns that it counts \"closed\" as the city records it."],
    ["14 documents","finder","<b>14 documents</b> · what the assistant searched for this answer · all held by your group","None of them is an inspection record, so the answer cannot say whether closed reports were repaired."],
    ["inspection records","action","<b>Records request: inspection logs</b> · to the Office of the City Clerk · sent 2 October by Mai · response due 14 October","What this answer lacks; the request asks the city for them."],
    ["812 with closed − reported ≤ 7 days","calculation","<b>Reports closed within seven days, FY2025</b> · a calculation · 812 of 903 · checked by Ana","The count behind the question's 812 of 903; open it for the method and Ana's check."],
    ["your queue","queue","<b>Your queue</b> · what waits on you · new matches arrive there as one list","Keep asking this sends new matching rows there instead of interrupting you."]
  ],
  "person": [
    ["14 documents","finder","<b>14 documents</b> · held by your group · each names L. Chen · among them Administrative Instruction 4.12","Each fact on this page cites one of them."],
    ["city roster",null,"<b>City roster</b> · the City of Oakland's published list of officials and their posts","The source for the current post; when it changes, this page shows who holds the office next."],
    ["council minutes",null,"<b>Council minutes</b> · the council's official record of its meetings · published on Legistar","The source for the earlier post, 2018 to 2022."],
    ["Deputy Director, Transportation",null,"<b>Deputy Director, Transportation</b> · a post in Public Works · held by L. Chen 2018–2022, from council minutes","The post that links L. Chen to \"Lin Chen\" in the 2019 minutes."],
    ["state licence register",null,"<b>State licence register</b> · California's public register of licensed engineers","Following it brings any change to this licence into your queue."],
    ["Form 700",null,"<b>Form 700</b> · California's Statement of Economic Interests · filed yearly by officials · lists income, property and gifts","The 2025 filing reports none; a later filing would show any change."],
    ["Lin Chen",null,"<b>“Lin Chen”</b> · a name in the 2019 council minutes · claimed as the same person · subject match B","If the claim is wrong, the 2019 facts belong to someone else; withdraw it with a reason."],
    ["grade B",null,"<b>Subject match B</b> · rests on the same post held on the cited dates, not on a shared identifier","A shared identifier, such as a licence number on both records, would make it easier to check."],
    ["2019 voter file",null,"<b>2019 voter file</b> · the county's voter registration list · the source of the home address being removed","The value taken from it is what this removal erases for good."],
    ["the docket","docket","<b>The docket</b> · each published case's public record of corrections, withdrawals and orders","Published cases that cite the address are dealt with there, openly, not by this removal."]
  ],
  "timeline": [
    ["Rent adjusted without a vote","matter","<b>The 2024 rent adjustment, made without a council vote</b> · a matter · noncompliant, established · against lease §7.2","The event the project's main finding rests on; its date is known only to the month."],
    ["month known",null,"<b>Month known</b> · the source gives a month but no day · never guessed to a day","Why this event and the April notice cannot be put in order."],
    ["Council",null,"<b>Council</b> · Oakland City Council · its votes are recorded in minutes on Legistar","Approved amendment 1 in January 2024; no council vote is recorded for the March rent change."],
    ["City Administrator",null,"<b>City Administrator</b> · an office · runs the city's departments and answers to the council","Signed the March 2024 adjustment; no council vote stands behind it in this record."],
    ["We requested the rent schedules","action","<b>Request: the rent schedules</b> · a records request to the Office of the City Clerk · 4 September 2026 · answered 18 September","The group's own act, in its own lane, beside the reply it got."],
    ["April notice",null,"<b>April notice</b> · the city's notice of the new rent · dated April 2024, month only","Its order against the March adjustment is undetermined; a source dated to the day would settle it."],
    ["Memo on rent indexing","document","<b>Memo on rent indexing</b> · a document · no date on its face","Kept apart until a source dates it; it may show how the 2024 rent was set."]
  ],
  "money": [
    ["Sewer Fund 3100",null,"<b>Sewer Fund 3100</b> · the city fund that holds sewer-fee revenue · kept apart from the general fund","Transfers out of it are what Ana's question asks were authorised."],
    ["adopted",null,"<b>Adopted</b> · a stage · the amount in the budget the council adopted for the year","Set against the paid figure to show what moved beyond the budget."],
    ["actual (paid)",null,"<b>Actual (paid)</b> · a stage · what was paid, from the city's annual financial report","$550,000 above the adopted figure for the same transfer."],
    ["Overhead charge",null,"<b>Overhead charge</b> · what the sewer fund pays for shared city services · recorded apart from transfers","Left out by Ana as a different transfer; the reason stays on the record."],
    ["$550,000 more paid than adopted",null,"<b>$550,000</b> · $4,750,000 paid against $4,200,000 adopted · FY2022 · Sewer Fund 3100","The gap the trail rests on; What authorised it looks for the act behind the extra."],
    ["the budget",null,"<b>Adopted budget, FY2022</b> · the council's spending plan for the year · reports by fund","The source of the adopted figure."],
    ["the financial report",null,"<b>Annual financial report, FY2022</b> · the city's year-end accounts · reports by department","The source of the paid figure; its basis differs from the budget's, so figures need matching first."],
    ["Ana","members","<b>Ana</b> · member of your group · owns Sewer fund transfers · declared expertise: accounting (CPA, confirmed)","Started this trail for the question \"Were the FY2022 transfers authorised?\""]
  ],
  "calculation": [
    ["812 of 903",null,"<b>812 of 903</b> · reports whose closed date is within 7 calendar days of the reported date · FY2025","It counts \"closed\" as the city records it: when the crew reports the work complete, not after an inspection."],
    ["7 calendar days","standard","<b>Seven calendar days</b> · the standard Administrative Instruction 4.12 sets in passage 3 · weekends and holidays count","The window the method counts from report to close."],
    ["Public Works work orders FY2025","document","<b>Public Works work orders, FY2025</b> · CSV, 903 rows · from the city's open-data portal · captured 2 October","The only input; if the city changes the file, the count is recomputed and your queue says so."],
    ["CPA, confirmed",null,"<b>CPA, confirmed</b> · Ana's declared expertise, certified public accountant · confirmed in the group","Ana's check is the second member's check; the result still needs a member to accept it."],
    ["recorded random draw",null,"<b>Recorded random draw</b> · a sample picked from a recorded seed · anyone with the seed gets the same picks","It keeps members from visiting only the reports they expect to fail."],
    ["40 of 812 closed reports",null,"<b>40 of 812</b> · the closed reports drawn for members to visit · seed 2026-10-05-7f31","Visits like Mai's on Seminary Ave test whether closed reports were repaired."]
  ],
  "explore": [
    ["Coliseum lease","project","<b>The Coliseum lease</b> · a project · whether the city kept the terms of its lease of the Coliseum land · owner: Dev","The end point of this search; each chain found ends in a payment under the lease."],
    ["voted for",null,"<b>Voted for</b> · a step from the council minutes of 12 January 2024, item 7 · 5 for, 2 against","The step that ties J. Ortega to the amendment, cited to the vote record."],
    ["paid under",null,"<b>Paid under</b> · a step from the city's annual financial report, FY2024 · capture B","Ties the amendment to the $1.2M paid; open the report to check the line."],
    ["weakest step B",null,"<b>Weakest step</b> · a chain is graded by its weakest link · here B on connection","No single strong step carries the chain; each must hold."],
    ["declared, not evidenced",null,"<b>Declared, not evidenced</b> · a link someone stated with no source attached · connection D","Attaching a source could raise this step; until then the chain is a lead."],
    ["four steps",null,"<b>Four steps</b> · the search's limit · longer chains are not followed","A link further out may exist; the search says it did not look rather than that there is none."]
  ],
  "proceeding": [
    ["Superior Court",null,"<b>Superior Court</b> · Alameda County Superior Court · the state trial court for Oakland","Where this case is heard; its register lists every filing."],
    ["a neutral label",null,"<b>Neutral label</b> · a short name for a proceeding that takes no side · used wherever the case is named","Members and readers see \"the lease rent case\", not either party's framing."],
    ["Lakeshore Tenants Association",null,"<b>Lakeshore Tenants Association</b> · the petitioner · the name your group, Lakeshore Tenants, is a party under","Your group is a party, so its own filings belong on this register."],
    ["City of Oakland",null,"<b>City of Oakland</b> · the respondent · the party the court's orders bind here","The party ordered to produce the 2024 rent schedules."],
    ["Hon. M. Ferris","person","<b>Hon. M. Ferris</b> · a person the record follows · judge of the Superior Court · from the court's register","Issued the 1 October order on demurrer."],
    ["Order on demurrer",null,"<b>Order on demurrer</b> · 1 October 2026 · the ruling on whether the petition states a claim the court can hear","New on the register; the order to produce the rent schedules is held from it."],
    ["Opposition filed",null,"<b>Opposition</b> · 14 September 2026 · a written answer to the demurrer","The filing the 1 October order ruled on, with the demurrer."],
    ["The City shall produce the 2024 rent schedules",null,"<b>Order to produce the 2024 rent schedules</b> · held as an obligation on the city · reply due 30 October","Held as an obligation, a missed date reaches your queue like any other."]
  ],
  "due-date": [
    ["your records request","action","<b>Records request: inspection logs</b> · to the Office of the City Clerk · sent 2 October by Mai · acknowledged 3 October, reference R26-0412","The request this date belongs to; a reply recorded there meets it."],
    ["public records law",null,"<b>Public records act</b> · the law named in your group's profile · sets the time an office has to respond","The basis of this count; a different law would give a different date."],
    ["10-day response window",null,"<b>10-day response window</b> · counted in calendar days from the day the office receives the request","Counted from 2 October, the day you recorded sending it."],
    ["your group's profile","group-identity","<b>Your group's profile</b> · names the law your requests go under and your city's holidays","The 10 days come from it; correct it there if the law is wrong."],
    ["your profile","group-identity","<b>Your group's profile</b> · names the law your requests go under and your city's holidays","The 13 October holiday comes from it; correct it there if the date is wrong."],
    ["close of business",null,"<b>Close of business</b> · the end of the office's working day on the due date","A reply that arrives after then on 14 October is late."],
    ["your queue","queue","<b>Your queue</b> · what waits on you","Once confirmed, this date waits there and is flagged once if no reply comes."]
  ],
  "standard": [
    ["§3","document","<b>Passage 3</b> of Administrative Instruction 4.12 · Public Works · capture B · the sentence quoted below","The exact passage this standard holds; passage 5 of the same instruction defines “closed” as the crew reporting the work complete."],
    ["in force since 2023",null,"<b>In force since 2023</b> · when this version of the instruction took effect · revised 2023, per the copy Dev captured","Every report in the FY2025 work orders falls under this version, so one standard covers them all."],
    ["Public Works",null,"<b>Public Works</b> · a city department · repairs streets · run by the Director of Public Works, held today by L. Chen","The department that set this standard for itself, and whose own work orders test it."],
    ["Director","person","<b>The Director</b> · the Director of Public Works · held today by L. Chen, since March 2022","The duty falls on the office, so it binds whoever holds the post on the date of each report."],
    ["seven calendar days","calculation","<b>Seven calendar days</b> · the measure this standard sets · counted from the report, weekends included","The calculation “812 of 903 reports closed within 7 days” counts the same calendar days."],
    ["weather permitting",null,"<b>Weather permitting</b> · the one exception in passage 3 · the instruction does not define it","If the city answers that weather delayed repairs, this is the clause it would rely on."],
    ["90% of potholes filled within 72 hours",null,"<b>90% of potholes filled within 72 hours</b> · a performance target in the 2026 budget · proposed by the assistant, not adopted","A budget target, not a rule: adopt it only if the group judges the city bound itself to it."],
    ["Proposed standard",null,"<b>Proposed standard</b> · a requirement suggested for the record · held as a standard only once a member adopts it, with a reason","Until someone adopts it, nothing in the project is measured against it."]
  ],
  "plan": [
    ["Scenario A",null,"<b>Scenario A · Records first</b> · the scenario laid out so far · phase 1: the records request, then a checkpoint judged by a member","The check above is about this scenario: it has no branch for a refusal or a stall."],
    ["hostile response",null,"<b>Hostile response</b> · a refusal, obstruction or retaliation in answer to an action · for example a blanket denial, or silence past the due date","Scenario A says nothing about what follows one; a branch can be added before the reply is due on 14 October."],
    ["Is the city repairing…?","question","<b>Is the city repairing reported potholes within seven days?</b> · question · capture B, connection C · short on connection","The inquiry this plan comes from; its weak link is why the plan starts with records."],
    ["Pothole reports marked closed before repair","question","<b>Subject 1</b> · the suspected breach this plan addresses · against passage 3 of Administrative Instruction 4.12 · rests on the question whether “closed” means “repaired”","Every option is chosen against it; if the logs show closed means repaired, the plan has nothing to address."],
    ["hypothetical: not yet shown",null,"<b>Hypothetical</b> · a subject the plan assumes · no finding shows it yet","The options here rest on something unproven; the inspection logs could show it or rule it out."],
    ["regulated end date",null,"<b>Regulated end date</b> · the date a law or rule closes an option, such as a filing deadline or a response window","Sorting by it puts first the options that lapse if the group waits."],
    ["Story with a reporter",null,"<b>Story with a reporter</b> · an option · awareness · undecided · Teo, a member, reports for the Bay Courier","Going public before the logs arrive is scenario B; a story by a member's own newsroom needs his tie declared."],
    ["agendize",null,"<b>Agendize</b> · to put an item on a public meeting's agenda · a council committee can discuss and act only on what is on it","The assistant's suggestion: a way to get repair performance discussed in public, not yet in the plan."],
    ["B · Go public",null,"<b>Scenario B · Go public</b> · an alternative scenario, not laid out yet · would start with the story with a reporter","The fallback if the City Clerk refuses or stalls on the records request."],
    ["logs show inspection dates",null,"<b>Checkpoint</b> · “logs show inspection dates” · judged by a member, with a reason, once the reply comes","Dates of inspection and repair are what would show whether a report was closed before the repair."],
    ["Response due 14 Oct","due-date","<b>Due 14 October 2026</b> · close of business · 10 calendar days under the public records law the group's profile names, rolled past a Sunday and a city holiday","Phase 1's checkpoint can't be judged before the reply, or before this date passes without one."]
  ],
  "start-send": [
    ["records request",null,"<b>Records request</b> · a kind of action · asks an office for copies of public records under the public records law · the office must reply within its window","This action only asks for records; it accuses no one."],
    ["Subject 1: reports closed before repair","plan","<b>Subject 1</b> of the plan “Repairs: closed is not repaired” · reports marked closed before repair, against Administrative Instruction 4.12 §3","The action rests on it, so the request asks for the records that could show it or rule it out."],
    ["hypothetical: not yet shown",null,"<b>Hypothetical</b> · the subject is assumed, not shown · no finding supports it yet","Since nothing is shown, the request asserts no breach and asks only for records."],
    ["the law your profile names",null,"<b>The public records law</b> · named in your group's profile · an office must answer a records request within 10 days","The request is made under it, so the office's duty to reply comes from it, not from Civicsmith."],
    ["10 days","due-date","<b>The response clock</b> · 10 calendar days from the day the office receives the request · rolled past weekends and city holidays","The due date is worked out from the day you record sending it."],
    ["Asserts a breach",null,"<b>Asserts a breach</b> · whether the action tells the office it broke a rule · here, no","A plain request can't be read as an accusation; a complaint later would be."],
    ["Approving fixes the text",null,"<b>Approving</b> · fixes the text on the record exactly as it will be sent · a later change is a new version","What the office receives must match what the record says was sent, so approve only the final wording."],
    ["Civicsmith sends nothing",null,"<b>Civicsmith sends nothing</b> · every outward message goes by a member's own hand · the record keeps the approved text and the date you record","Record the sending on the day it goes: the 10-day clock counts from it."]
  ],
  "request": [
    ["Look first","finder","<b>Find</b> · searches everything your group holds · the FY2025 work orders came from the city's open-data portal","Inspection logs may already be public; a search costs nothing and tells no office what you are looking at."],
    ["capture it instead","capture","<b>Capture</b> · adding a copy of a public record from its address · a copy from the office's own site holds up best","A capture needs no request and no wait, and gives the record a fingerprinted copy."],
    ["by its role",null,"<b>Addressed by role</b> · the request names the office, not the person · City Clerk, held today by Asha Rao","If the post changes hands before the reply, the request still stands."],
    ["City Clerk",null,"<b>City Clerk</b> · an office · keeps the city's records and answers records requests · held today by Asha Rao","The office that answers records requests and can route this one to Public Works, which keeps the inspection logs."],
    ["anyone it shares the request with",null,"<b>Who else sees a request</b> · an office may forward it to the department holding the records · a request is itself usually a public record","Write it so it reads well to anyone, including the department whose records you ask about."]
  ],
  "action": [
    ["Office of the City Clerk",null,"<b>Office of the City Clerk</b> · keeps the city's records and answers records requests · held today by Asha Rao · 4 requests from your group, 3 answered on time","The office that must reply; its record with your group so far is 3 of 4 on time."],
    ["sent 2 October",null,"<b>Sent 2 October 2026</b> · recorded by Mai on the day she sent it","The response clock counts from this date."],
    ["Mai","members","<b>Mai</b> · member of your group · owns Pothole repairs · sent this request and recorded the sending","A reply that reaches her by mail or in person should be recorded here, so the clock stops."],
    ["Response due 14 October","due-date","<b>Due 14 October 2026</b> · close of business · 10 calendar days from receipt on 2 October, rolled past Sunday 12 October and a city holiday on 13 October","If no reply is recorded by then, the queue says so once; the plan's checkpoint waits on it."],
    ["City Clerk",null,"<b>City Clerk</b> · an office · keeps the city's records and answers records requests · held today by Asha Rao","Its reply, or its silence by 14 October, decides the plan's next step."],
    ["acknowledgment",null,"<b>Acknowledgment</b> · a reply · the office confirms it received the request · not an answer","It is not the records: the 14 October due date stands unless the office gives notice of an extension."],
    ["R26-0412",null,"<b>R26-0412</b> · the City Clerk's reference for this request · from its acknowledgment of 3 October","Quote it in any follow-up so the office can find the request."]
  ],
  "matter": [
    ["noncompliant",null,"<b>Noncompliant</b> · a determination · the act did not meet the rule it is measured against · recorded by a member, with a reason","What the group has determined from its evidence, not what a court has decided."],
    ["established",null,"<b>Established</b> · the determination is settled on the record · its finding meets the project's bar, B/B","Strong enough to act on: escalating does not wait for more evidence."],
    ["lease §7.2","document","<b>Lease §7.2</b> · a clause of the Coliseum lease · a change to the rent needs a council vote","The rule this matter is measured against; the 2024 adjustment had no vote."],
    ["Notification","action","<b>Stage 2 · Notification</b> · the city has been told · the letter “Demand to rescind”, sent to the City Administrator 19 September · reply due 9 October","The stage the matter is at; its reply decides whether stage 3 is needed."],
    ["Clock starts",null,"<b>Stage 3 · Clock starts</b> · the next stage · a deadline the city must answer by starts running, tracked in your queue","Advancing to it is the next act offered here; it normally follows the reply due 9 October, or its absence."],
    ["$38,000 in rent above the schedule","calculation","<b>Rent above the schedule, 2024–2026</b> · a calculation · $38,000 · from the rent schedules, capture B","The consequence the group would cite on escalating; check it still holds before stage 3."],
    ["the rent schedules","document","<b>Rent schedules</b> · released by the City Clerk on 18 September in answer to the group's request · capture B","The source of the $38,000: a different schedule would change the figure."]
  ],
  "case-editor": [
    ["Shared for review","review-copy","<b>Shared for review</b> · the next step · a named outside reader gets a view you can stop at any time · nothing public yet","After this draft, an outside reader can catch what the group missed before it is permanent."],
    ["Internally checked",null,"<b>Internally checked</b> · a readiness step · the case passes Civicsmith's own checks: bar met, people named with reasons, what it leaves out · not run yet","The missing reason for J. Ortega would hold it back."],
    ["Externally compliant",null,"<b>Externally compliant</b> · a readiness step · the case meets outside rules it must follow, such as court orders and sealing · not run yet","Checked before publishing, so nothing public breaks an order."],
    ["Whether the rents are fair",null,"<b>Left out: whether the rents are fair</b> · a policy question · the case asks only whether the lease's own rules were followed","Saying so keeps readers from taking the case as a view on rent levels."],
    ["the 2019 negotiation",null,"<b>The 2019 negotiation</b> · the talks that produced the Coliseum lease · before the scope, January 2024 to September 2026","Left out on purpose; readers see that it was considered and set aside."],
    ["City Administrator",null,"<b>City Administrator</b> · an office · runs the city's departments and answers to the council","Named by title, not by name: the case concerns the office's act, whoever held the post."],
    ["signed the March 2024 adjustment","timeline","<b>March 2024: rent adjusted without a vote</b> · an event on the timeline · signed by the City Administrator · capture B · dated by month only","The reason the office is named; a reason must come from the case's own evidence."],
    ["J. Ortega","person","<b>J. Ortega</b> · Council District 3 since 2023 · voted for Lease amendment 1 on 12 January 2024 · his Form 700 for 2025 lists income from Bayline Properties","A person named needs a reason the findings show; a lead from a hint is not one."],
    ["reason missing",null,"<b>Reason missing</b> · every person a case names needs the reason, drawn from its evidence","The case can't pass its checks until J. Ortega has a reason or is taken out."],
    ["Edition 1","published","<b>Edition 1</b> of The Coliseum lease · a published case · stays public, marked as corrected, once Edition 2 is published","Its readers see “what changed” first: say what is new and what it corrects."]
  ],
  "review-copy": [
    ["can read until 20 October",null,"<b>Review copy ends 20 October</b> · after that the reader's view stops · you can stop it sooner","Comments must come in by then; a later reading needs a new review copy."],
    ["Teo","members","<b>Teo</b> · member of your group · a reporter at the Bay Courier · declared expertise: journalism","The advance copy goes to his newsroom, so his tie to it is declared on the case."],
    ["embargoed advance copy",null,"<b>Embargoed advance copy</b> · a newsroom may read it before publication but not report on it until it is public","The Bay Courier can prepare its story; nothing runs before Edition 2 is published."],
    ["Finding 2",null,"<b>Finding 2</b> of Edition 2 · that two rent adjustments had no council vote · meets the bar, B/B","The reviewer asks it to name its schedule; answer or change it before publishing."],
    ["which schedule the council approved","document","<b>The schedule the council approved</b> · the rent terms in Lease amendment 1, approved 12 January 2024 · Council minutes, item 7","Naming it lets a reader compare the approved rent with the March 2024 rent directly."],
    ["Prof. Iyer",null,"<b>Prof. N. Iyer</b> · housing-law professor · an outside reader named by Dev · can read until 20 October","An outside reader, not a member: the comment advises, and the group decides."],
    ["Published","published","<b>Published</b> · the last step · permanent and public · corrected only by a new edition","Deal with reviewers' comments before this step; after it, any change needs Edition 3."]
  ],
  "ceremony": [
    ["a new edition","docket","<b>A new edition</b> · how a published case is corrected · posted on the case's docket · the earlier edition stays public","Nothing here can be unpublished; a mistake found later costs a new edition."],
    ["Bias", null, "<b>Declared bias</b> · the group's own statement of any stake it has in what it examines, in its own words · every published case carries it", "Readers judge the case knowing what the group may favour."],
    ["Ties","ties","<b>Ties</b> · a step · each member confirms any tie to people or firms the case concerns · Teo's tie to the Bay Courier is declared","If a member's confirmation changes after you sign, a scheduled publish stops."],
    ["Finding 1",null,"<b>Finding 1</b> · the 2024 rent adjustments were made without the council vote the lease requires · capture B, connection B","The case's central claim; it meets the bar, so it can be relied on in public."],
    ["Finding 2",null,"<b>Finding 2</b> · two rent adjustments had no council vote · capture B, connection B · Prof. Iyer asked it to name which schedule the council approved","Check the reviewer's comment was answered before you sign."],
    ["meets the bar",null,"<b>The project's bar</b> · B/B · the least capture and connection a finding needs to be relied on","Every finding meets it, so none is published as weaker than the group claims."],
    ["An unresolved contradiction","timeline","<b>Two dates for the rent notice</b> · two documents disagree · in tension, not resolved · both dated only by month","Disclosed with the case, so readers see it; it does not stop publishing."],
    ["The timeline, frozen at signing","timeline","<b>Timeline of The Coliseum lease</b> · 9 events · fixed as it stands when you sign","Events recorded after you sign go into the next edition, not this one."],
    ["the key registered in this browser",null,"<b>Your signing key</b> · registered in this browser for Dev · anyone can check the signature on the public page","Signing from another device needs that device's key registered first."],
    ["owner of the project",null,"<b>Owner of The Coliseum lease</b> · Dev · only an owner signs the project's cases","Your signature stands for the group; readers see “signed by an owner of the project”."]
  ],
  "published": [
    ["Edition 2",null,"<b>Edition 2</b> · the current edition of this case · published 14 November 2026 · corrects Edition 1, which stays readable","Corrections, if any, come as a new edition listed on the case's public docket."],
    ["Lakeshore Tenants",null,"<b>Lakeshore Tenants</b> · the group that made this case · tenants near the Oakland Coliseum, meeting since 2025","The authors; the case is signed by one of them and can be checked without them."],
    ["council vote the lease requires",null,"<b>Lease §7.2</b> · a clause of the Coliseum lease · a change to the rent needs a council vote","The rule this finding measures the rent adjustments against."],
    ["this project's bar",null,"<b>The project's bar</b> · the least strength a finding needs before the group relies on it · here B for both grades","This finding meets it; the bar is the group's own, set before publishing."],
    ["capture B",null,"<b>Capture grade B</b> · how well a document is held, A to D · A is easiest for anyone to check; D rests on a person's word","A grade says how checkable the documents are, never whether the finding is true."],
    ["connection B",null,"<b>Connection grade B</b> · how firmly the documents are linked to the claim, A to D","The link from these documents to the finding is firm, though not the firmest."],
    ["What we did",null,"<b>The group's lane</b> · what the group itself did, kept apart from what the government did","The group's own acts are never mixed in with the city's."],
    ["Council approves amendment 1",null,"<b>Lease amendment 1</b> · approved by the city council on 12 January 2024 · recorded in the council minutes, item 7","The change the council did vote on; the March 2024 rent adjustment had no vote of its own."],
    ["Rent adjusted",null,"<b>The March 2024 rent adjustment</b> · signed by the City Administrator · dated by month only in the documents","The act finding 1 is about."],
    ["We requested the schedules",null,"<b>The group's records request</b> · for the rent schedules · made 4 September 2026 · the City Clerk released them 18 September","How the group got its documents: anyone can make the same request."],
    ["by title",null,"<b>Named by title</b> · the office, not the person who held it","The finding concerns the office's act, not who held the post in March 2024."]
  ],
  "imported": [
    ["West Oakland Neighbors",null,"<b>West Oakland Neighbors</b> · another group · published this case · its work counts here only as far as a member accepts it","The publisher: if it corrects the case, a new edition appears on its docket."],
    ["Edition 2",null,"<b>Edition 2</b> of Port lease revenue · West Oakland Neighbors' published case · the edition imported here","The edition recreated here; a later edition from them would need recreating again."],
    ["The shortfall was not reported to council",null,"<b>The shortfall was not reported to council</b> · West Oakland Neighbors' finding · recreated in part","Only the part that recreated can count here, once a member accepts it."],
    ["The 2025 calculation of arrears",null,"<b>The 2025 calculation of arrears</b> · West Oakland Neighbors' calculation · could not be repeated from what they published","It cannot count for your group; flag the issue so the publisher can see it."],
    ["Recreated in part",null,"<b>Recreated in part</b> · some of the finding's support was repeated here from the publisher's documents and method, not all","Accept only what recreated, and say why in the reason."],
    ["Did not recreate",null,"<b>Did not recreate</b> · repeating it here from the publisher's documents and method did not give their result","Not a judgment that they are wrong: it just cannot count here."],
    ["Recreated",null,"<b>Recreated</b> · repeated here from the publisher's documents and method, with the same result","It still counts for your group only once a member accepts it, with a reason."]
  ],
  "docket": [
    ["withdrawals",null,"<b>Withdrawal</b> · the group withdraws a finding or a whole case, publicly · the earlier edition stays visible, marked withdrawn","None so far for this case."],
    ["superseding",null,"<b>Superseding</b> · Edition 2 replaced Edition 1 as the current edition · Edition 1 stays public, marked as corrected","Every new edition is a docket entry; this is the case's first."],
    ["Order of 20 November","proceeding","<b>Order of 20 November 2026</b> · Superior Court · in the lease rent case · captured by a member","It binds the group's published case; posting it here is how the group complies in the open."],
    ["Superior Court","proceeding","<b>Superior Court</b> · the state trial court for Alameda County · hears the lease rent case, RG26-114502","Its orders reach what the group publishes as well as what it files."],
    ["exhibit 4",null,"<b>Exhibit 4</b> · a document in Edition 2's evidence · contains a tenant's address · the order seals it","Sealing removes that address from the public case; the next edition says what was sealed and why."],
    ["not yet posted",null,"<b>Not yet posted</b> · a draft docket entry · public only once a member posts it, signed","Readers of the public case can't see this entry until it is posted."],
    ["the next edition","case-editor","<b>The next edition</b> · Edition 3, not yet started · would carry a stamp saying what was sealed and why","Complying with the order needs a new edition; prepare it once the entry is posted."]
  ],
  "inbox": [
    ["doorbell","doorbell","<b>Your doorbell</b> · the group's public page where anyone can hand over material, without an account","Everything here came through it, so the sender may be anyone."],
    ["3 PDFs",null,"<b>3 PDFs</b> · handed in 3 October · not yet in the record","Nothing in them counts until a member moves them into the record and they are graded like any other document."],
    ["inspection sheets","action","<b>Inspection sheets</b> · what the sender calls these files · claimed, not checked · the group's records request asks the City Clerk for inspection logs, due 14 October","Compare them with what the City Clerk releases; sheets that match would raise their standing."],
    ["same knocker as 12 September",null,"<b>Same knocker</b> · recognised by the secret phrase the sender added · the sender also handed in material on 12 September","Still unnamed, but how the earlier material held up tells you something about this."],
    ["Same knocker",null,"<b>Same knocker</b> · where this source stands · recognised across deliveries, nothing more known","Weigh the material by what can be checked in it, not by who might have sent it."],
    ["Partly known",null,"<b>Partly known</b> · the next step · a member records what is known of the source, such as role or access, without naming them","Recording it helps weigh the material without exposing who sent it."]
  ],
  "doorbell": [
    ["Lakeshore Tenants","published","<b>Lakeshore Tenants</b> · a tenants' group near the Oakland Coliseum, meeting since 2025 · checks whether the city keeps its own rules and promises","The group that receives what you send; its published case shows how it uses material."],
    ["this group's own Civicsmith",null,"<b>The group's own Civicsmith</b> · runs on the group's own hosting account · no other group sees it","Only this group's members can open what you send."],
    ["A member reads them",null,"<b>A member</b> · one of the group's members · may use your material, or set it aside with a reason kept on the group's record","Nothing is published as it arrives: a member decides first, and anything used is checked like any other document."],
    ["a secret phrase",null,"<b>A secret phrase</b> · any words you choose · a later delivery with the same phrase is marked as from the same sender · it never names you","Worth adding if you may send more: the group can weigh new material by how your earlier material held up."],
    ["beyond a court's reach",null,"<b>A court's reach</b> · a court can order the group to hand over what it holds, including what you send and when it arrived","Think about what your files and note could reveal about you before you send them."]
  ]
};
for (const [k, v] of Object.entries(SCREEN_REFS)) REFS[k] = (REFS[k] || []).concat(v);

/* Guidance (proposed information level 2, question S8): what each screen is and what a member can do there, on its heading;
   and what each section of the rail holds. */
const SCREEN_HELP = {
  install: 'Installs Civicsmith in a Cloudflare account your group controls. Here you choose the group\'s permanent short name and let the installation test itself.',
  setup: 'The first administrator\'s setup: claim the installation, then name the group, choose its places and languages, and decide how members reach the assistant.',
  'group-identity': 'What kind of group yours is, what it focuses on and why it exists. It shapes how members are welcomed and locks nothing.',
  join: 'Your invitation to join a group. Choose your language, the name the group will know you by, and a password.',
  home: 'Your group\'s home: what it is working on and what is waiting on you. Start here each day.',
  members: 'Everyone in your group and what each may do. Administrators invite members, set what they may do, and see who holds the hosting account.',
  account: 'Your own settings: your handle, password, signing key, language and expertise.',
  connect: 'Whether and how the assistant serves you: on your group\'s key, your own Claude account, or not at all. Set your limit and suggestions here.',
  ties: 'Your own ties to people or organisations the group may look into. Only you and the administrators see this list.',
  notes: 'Your private notes. Only you can see them in your group; turn one into an observation, a hunch or a question when you choose.',
  translations: 'The words members see, in your group\'s languages. Members given the grant translate them, the assistant drafts where it can, and protected words are checked twice.',
  wizards: 'Step-by-step walk-throughs of the real screens. Civicsmith\'s own come with each release; your group can write its own or copy one and change the copy.',
  queue: 'Your queue: everything waiting on you, in one list. To do needs your act, Noticed is something new nobody has judged, and Status tells you where something stands.',
  finder: 'Find what your group holds, or look outside for something it doesn\'t yet. Capture what you find into the record.',
  capture: 'Add something to the record: a document from its address, a file, or what you saw yourself, in your own words.',
  held: 'Captures waiting for a member to vouch for them before they enter the record. Release them, or set them aside with a reason.',
  document: 'One document as captured: its grade, its passages, its versions and what cites it. Cite a passage from here.',
  project: 'A project: its questions, their strength against the project\'s bar, its members and its stage. Open a question or a plan from here.',
  question: 'One question: what supports it and what cuts against it, its strength against the bar, and what would change the answer.',
  answers: 'Ask in plain words, with the assistant, or find and count without it. Answers come only from what your group holds, and show where they looked.',
  assistant: 'A question with the assistant beside it. It answers only from what your group holds and never concludes, signs or sends.',
  person: 'A person the record follows: positions over time, what they decided and signed, each fact dated and cited.',
  timeline: 'What happened, in order: the city\'s acts and your group\'s acts in two lanes, never mixed. Undated items are listed apart.',
  money: 'A money trail: figures from budgets and reports, each with its stage and period, included or left out with a reason.',
  calculation: 'A calculation shown with its method and inputs, each tied to the record and recomputed when an input changes.',
  explore: 'Chains of connections between people, votes, contracts and payments, each step cited and graded. A chain is a lead until a member cites its documents.',
  proceeding: 'A court case or legal proceeding: its parties, its register of filings, and orders with their reply dates.',
  'due-date': 'One due date and how it was worked out: the law or commitment it comes from and how the days were counted.',
  standard: 'A standard the city set itself, held from its document, that questions can test the city against.',
  plan: 'An action plan: the options for what to do about a problem, the order to try them, and what each waits on.',
  'start-send': 'Start an option from a plan: prepare what is sent, check who it goes to today, and send it after the warning.',
  request: 'Ask an office for records under the law that requires it to answer. The due date is worked out for you.',
  action: 'One action your group took: what was sent, to whom, when a reply is due, and what came back.',
  matter: 'A matter: what the group is pursuing about one problem, from the first letter to the outcome.',
  'case-editor': 'Prepare a case for publishing: its scope, statement, findings, the people it names and why, its timeline and what it leaves out.',
  'review-copy': 'A draft case shared with named outside readers before publishing. Their comments come back here.',
  ceremony: 'The publication ceremony: the last checks, then signing. Publishing is permanent; corrections come as a new edition.',
  published: 'A case your group published, as anyone reads it: findings, their strength, the evidence, and how to check it without the group.',
  imported: 'Another group\'s published case, recreated here. Nothing in it counts for your group until a member accepts it with a reason.',
  docket: 'The public record of every edition, correction and withdrawal of your group\'s cases.',
  inbox: 'Material handed to your group through its doorbell. Move it into the record, or discard it with a reason.',
  doorbell: 'Hand material to the group. You need no account; the page says what will happen to what you send.',
};
const RAIL_HELP = {
  home: 'Home: what your group is working on and what is waiting on you.',
  queue: 'Queue: everything waiting on you, in one list.',
  find: 'Find: search what your group holds, or look outside for something new.',
  add: 'Add: capture a document, a file, or what you saw yourself.',
  projects: 'Projects: your group\'s investigations, their questions, plans and cases.',
  people: 'People: the people and organisations the record follows. Your own group\'s members are under Settings.',
  settings: 'Settings: your account, your group\'s members, the assistant, translations and wizards.',
};
