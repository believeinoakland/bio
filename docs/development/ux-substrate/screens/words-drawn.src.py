# DEC-259: the remaining screens keyed (K3268): every sentence a member reads on a screen is a keyed word, word for word
# (check_words_drawn.mjs). DEC-257 keyed the eleven screens on T49's path; this file keys the other fifty-eight, by the same
# rules: where a module's adopted row (DEC-252) and the drawing differed slightly, the drawing governs and the row is reworded
# (REWRITE); where the row is a design ruling's, or the drawing inlined sample data the row has no placeholder for, the
# drawing was changed; otherwise a similar undrawn row under screen.<id>. is reworded, or a new key screen.<id>.<slug> is
# minted. A sentence that carries sample data is keyed as a template, the drawing an instance of it; a sample record (a
# document's title, a file's name, a member's words) is marked .mk-data in the drawing and is not keyed.
# Run: python3 words-drawn.src.py (after words-t49.src.py), then node build_words.mjs, which adds these rows after T49's and
# applies REWRITE in its add(), failing on a reworded key that no row carries.
import json, os
W = []
def w(key, en, prot=False, note=''):
    W.append(dict(key=key, en=en, protected=prot, note='DEC-259' + (': ' + note if note else '')))
REWRITE = {}

# account
w('screen.account.explain.help', 'Promptly: every explanation opens when you rest on something for half a second. On a longer pause: marks and names still do; what screens, sections, the rail and acts are waits a second and a half, so less opens while you move. Nothing is ever hidden, and keyboard focus or a tap shows everything at once. New members start with promptly; after a month Civicsmith asks once whether to keep it. Alt+Shift+I or the masthead switches it at any time.', False, 'under the Explanations choice')
w('screen.account.signout.note', "Everywhere ends your sign-in on every phone and computer, this one included. Use it if you lost a device or signed in somewhere you shouldn't have.", False, 'under the two sign-out buttons')
w('screen.account.passwordkey.heading', 'Password and signing key')
# answers
w('screen.answers.count.line', '{rows} rows · {count} with {rule} (a count, method shown)', False, "a table's count without the assistant: {rule} the counting rule as written")
# archive
w('screen.archive.capturedby', 'Captured by {name} from {source}, {date}', False, "under an archive's name: who captured it, from where and when")
w('screen.archive.samefingerprint', 'Anyone can cut the same file out with ordinary tools and get the same fingerprint.')
w('screen.archive.samename', '{count} entries share this name', False, 'two entries of the archive with one name')
w('screen.archive.samename.each', '{count} entries share this name; each is filed by its number')
w('screen.archive.notfiled.password', 'Not filed: the archive locks this file with a password. It is listed, never opened.')
w('screen.archive.notfiled.size', 'Not filed: {size}, over the {limit} limit for one file. Capture the {kind} from its own address.', False, '{kind} the kind of file, such as video')
w('screen.archive.higher.heading', 'A higher grade for one file')
w('screen.archive.higher.how', 'A file here can earn a higher grade only by being captured on its own, from its own source; the new capture lands beside this one, and nothing is regraded.')
w('screen.archive.higher.capture', 'Capture a file on its own', False, 'a link to Add to the record')
w('screen.archive.refused.head', 'Could not open this archive, because {reason}.', False, '{reason} such as "two of its entries claim the same bytes"')
w('screen.archive.refused.note', 'A damaged or tampered archive is refused whole rather than filed in part. If the city has a clean copy, capture it again from its address; it lands beside this one.')
REWRITE.update({
  'screen.archive.summary': 'Opened when it was captured: {filed} files filed and held for review beside it, {held} already held, {notfiled} not filed, {folders} folders.',
  'screen.archive.alreadyheld': 'Already held · the same file {name} captured directly on {date}; this copy is kept as a second sighting of it',
  'screen.archive.folder': 'A folder · its {count} files are listed and filed below it',
  'screen.archive.refused.none': 'Nothing in it is filed. The archive itself stays captured exactly as it arrived, with its grade, and anyone can check why it was refused.',
})
# assistant (the dock)
w('screen.assistant.alone', 'It works for you alone.', False, 'after "On your own account" in the dock: only when your own account serves you')
w('screen.assistant.ask.label', 'Ask about this screen', False, "the dock's question field")
# calculation
w('screen.calculation.sub', 'A computed fact · method shown · recomputed when an input changes', False, "under a calculation's name")
w('screen.calculation.checkedby', 'Checked by {name} ({expertise}, {standing}) on {date}.', False, "a second member's check; {standing} confirmed or declared")
w('screen.calculation.spot.about', "The {count} is {whose} own count: {what}. A spot-check asks whether {claim} meant {meaning}, by visiting a random sample of {items} on the street.", False, "{what} the calculation's question, as written")
w('screen.calculation.found.help', 'Each visit is recorded as what that member saw, with a photo where they took one.')
w('screen.calculation.range.all', 'So of the {size} {items} marked {claim}, between about {lowc} and {highc} were really {answer}, if the {unsure} that could not be judged are like the rest.')
REWRITE.update({
  'screen.calculation.counts': '{visited} of {n} visited: {yes} yes, {no} no, {unsure} could not tell',   # DEC-262
  'screen.calculation.range': '{share}% of the {judged} that could be judged were yes · exact {confidence}% range {low}% to {high}%',   # DEC-262
  'screen.calculation.notsays': 'It does not recount the {size} ({whose} check did that), says nothing certain about any one {item} no one visited, and nothing about the {outside} {items} not {what}.',
})
# case-editor
REWRITE.update({'screen.case-editor.changed': 'What changed since Edition {n}'})
# ceremony
w('screen.ceremony.disclosed.tension', 'An unresolved contradiction: {what}', True, 'disclosed with the case (protected: what readers are told)')
w('screen.ceremony.disclosed.timeline', 'The timeline, frozen at signing ({n} events)', True, 'disclosed with the case')
w('screen.ceremony.when.chosen', 'At a set time: {date}, {time} ({zone})', True, 'the choice of when it becomes public, once a time is set')
w('screen.ceremony.when.note', "Until then the signed edition waits, not public. At {time} Civicsmith checks again; if anything changed since you signed (a source, a member's confirmation of their ties, a hold), it does not publish and tells you once. You can cancel or move the time until then.", True, 'under the choice of when')
w('screen.ceremony.sign.edition', 'Sign and publish Edition {edition}', True, "the signing dialog's heading")
w('screen.ceremony.signs.lines', '{n} lines like these, one for each piece of evidence the {findings} findings rest on: {list}', True, 'what your key signs, after the lines drawn')
w('screen.ceremony.signs.linesabout', 'Each line names one thing and the fingerprint of its exact text. If anything in it changes before you sign, you are asked to sign again.', True)
w('screen.ceremony.publishat.button', 'Sign and publish at {time} on {date}', True, "publishat's button, once a time is chosen")
w('screen.ceremony.photos.rules', "A photo in a format whose areas can't be covered (some phones save HEIC or progressive JPEG) stops the signing, naming the photo: capture it again as an ordinary photo, or stop relying on it. If a mark changes after the case is prepared, prepare it again before signing; if it changes after signing, the case isn't published until it is prepared and signed again. Any member who can see a photo may mark it or withdraw a mark; only a member can, never the machine.", True)
w('screen.ceremony.device.head', 'Confirm on your device', True)
w('screen.ceremony.device.example', "Your device's own window (it looks different on each device)", False, "over a drawing of the device's own window; its words are the device's, not Civicsmith's")
w('screen.ceremony.device.cancel', "If you cancel there, or your device doesn't confirm, nothing is signed or published, and you are back at the last step with everything as it was.", True)
w('screen.ceremony.signed.evidence', 'The {n} pieces of evidence', False, 'a row of what was signed')
w('screen.ceremony.signedat.note', 'The case page and your queue show this until it goes public; then your queue tells you once that it is live. The public page shows when it was signed and when it was published.')
w('screen.ceremony.signednow.told', 'Members who follow this case are told once.')
w('screen.ceremony.nokey.keyfile', 'Unless you keep it on this device, you save it as a key file, protected by a passphrase you choose.')
w('screen.ceremony.nokey.elsewhere', 'Registered a key on another computer? Sign from that one, or register a key here too. Lost a key? Withdraw it under Settings › Your account and make a new one here; cases it already signed can still be checked. Your signing keys are listed there.')
REWRITE.update({
  'screen.ceremony.photo.facts': 'taken by {by} · relied on by {findings}',   # DEC-265 (B226 (2)): photosOf answers no date; .dated when it does
  'screen.ceremony.photos.copy': 'Mark anyone in a photo who is not part of a finding, and any number plate. The public copy shows those areas obscured, labeled “Faces, plates and camera details removed for publication; the team holds the original”, and the original stays inside the team. Every photo a published case carries goes out without its camera details (where and when it was taken, and on which device), labeled “Camera details removed for publication; the team holds the original”. City staff at work are part of what the case is about; obscure one only with a reason.',
  'screen.ceremony.signs.count': 'One confirmation signs all {n}: the edition, its {findings} findings, and the {evidence} pieces of evidence they rest on. Each signature can be checked on its own, so a reader can trust one finding without trusting the rest.',
  'screen.ceremony.signs.case': 'Edition {edition} of {case}',
})
# dash-action
w('screen.dash-action.sub', 'Every clock that is running, whose move it is, replies that came in, and what waits for a second approval.')
w('screen.dash-action.tile.noreply', '{n} with no reply recorded', False, "under the Their move tile")
w('screen.dash-action.nextready', "the plan's next step is ready")
w('screen.dash-action.clock.due', 'The {office} must answer by {date}: {days} days under the {law}, rolled past a holiday.', False, "an action's clock, as a sentence with its rule and date")
w('screen.dash-action.clock.sent', 'Sent {date}; the team gave until {due}.', False, "an action's clock where the team set the date")
w('screen.dash-action.clock.approve', "Approve by {day}, the plan's checkpoint.")
w('screen.dash-action.next.record', 'Record what came back', False, "an action's next step")
w('screen.dash-action.next.escalate', 'Escalate, as the plan sets', False, "an action's next step")
# dash-project
w('screen.dash-project.next.heading', 'Next for you here')
w('screen.dash-project.next.vouch', 'Vouch for the {count} photos you captured at {place}')
w('screen.dash-project.next.newer', 'Decide on the newer version of {document}')
w('screen.dash-project.next.prepare', 'Then Edition {edition} can be prepared: the {count} findings meet the bar')
w('screen.dash-project.glance.heading', 'This project at a glance')
w('screen.dash-project.story.heading', 'The story so far')
w('screen.dash-project.story.undetermined', 'Undetermined order: {events}, both dated by {precision}.', False, '{precision} month or year')
w('screen.dash-project.activity.events', '{name} added {count} events on {day}')
# docket
w('screen.docket.edition.published', 'Edition {n} published, superseding Edition {prior}', True, 'a docket entry (protected: public)')
REWRITE.update({'screen.docket.sub': "The case's public record of corrections, withdrawals and orders."})
# document
w('screen.document.capturedby', 'captured by {name} from {source}, {date}', False, "under a document's name, after its office and revision")
w('screen.document.pagetranscribe.button', 'Have the assistant read pages {pages}', False, "pagetranscribe's button, naming the pages")
w('screen.document.citedby.standard', 'cites {passage} as the standard {office} is held to', False, 'how a question cites this document')
w('screen.document.citedby.against', 'cites {passage}, cutting against {what}', False, 'how a question cites this document')
w('screen.document.links.one', '{n} links on this page; 1 points at a document the team holds.', False, 'document.links.says, where one link is held')
w('screen.document.theme.page', 'Page {page}, placed by {name}, {date}: “{note}”', False, "a theme placed on a page, with the member's note")
w('screen.document.theme.whole', 'The whole {kind}, placed by {name}, {date}', False, '{kind} the kind of document, such as report')
w('screen.document.theme.proposed', 'Page {page}, proposed by the assistant, {date}: “{note}”', False, "a theme the assistant proposed, with its note")
# due-date
w('screen.due-date.step.rolled', '{date} is {why} and {date2} {why2}, both from your profile: rolled to {due}, close of business.', False, 'two days skipped in a row, each from the team profile')
REWRITE.update({
  'screen.due-date.of': "{who}'s reply",   # DEC-262
  'screen.due-date.step.counted': 'Counted {amount} {units}.',   # DEC-262
})
# explore
w('screen.explore.sub', 'From {from} to {to}, through {kinds}, as of {date}', False, 'what the walk was asked: {kinds} the kinds followed, such as "money and votes"')
w('screen.explore.graph.from', 'From {name}, as a graph')
w('screen.explore.lead.short', 'a lead, not a finding', False, 'under a chain with a declared or suspected step')
w('screen.explore.stopped.short', 'Stopped at the limit, undetermined beyond {depth} steps.')
# finder
w('screen.finder.named', 'named in {n} documents, among them {document}', False, 'a person or organization among the results')
w('screen.finder.nobody.in', 'Nobody looked in {place} for this yet.', False, 'after the Nobody looked mark')
# forgot
w('screen.forgot.noadmin.heading', 'If no administrator can get in')
w('screen.forgot.noadmin.what', "Whoever holds your team's Cloudflare account can set a new one-time password and an administrator can claim again from it. That is the way back in when every administrator has lost both their password and their codes.")
# front
w('screen.front.allpublished', 'All our published cases', False, 'a link to the published cases')
w('screen.front.invited', 'Invited? Open the link you were sent: it brings you here to join.')
# team
w('screen.group.sub', 'Administrators only. The settings chosen at setup, all changeable here.')
w('screen.group.name.help', 'What people read: at the head of your pages, invitations and published cases. Your short name, {short}, stays fixed.')
w('screen.group.domain.help', 'Verified on {date}: readers can confirm a published case comes from your team. Remove it if your team would rather stay unnamed.')
w('screen.group.court.show', 'Show members the notice, before their first note and in their settings', True, 'the court notice (protected)')
w('screen.group.bar.line', 'Bar: {bar}, set by {name} on {date}')
REWRITE.update({'screen.group.court.field': 'Tell members what a court can reach'})
# group-identity
w('screen.group-identity.other.help', "For example “a tenants' union”, “a students' newspaper”, “a retired auditors' circle”. It helps Civicsmith offer what fits first; it locks nothing.")
w('screen.group-identity.ask.what', "It asks you a few questions about your team, then drafts the focus and the reasons in these fields, each marked “Draft · the assistant's, asked by {handle}”. Nothing is saved until you edit it and keep it; once kept, the words are your team's.")
REWRITE.update({
  'screen.group-identity.other.field': 'Describe your kind of team, in a few words',
  'screen.group-identity.focus.field': 'What you focus on',
  'screen.group-identity.purpose.field': 'Why the team exists, in your own words',
  'screen.group-identity.visibility.choice.public': 'Also our public page and the network directory',
})
# held
w('screen.held.setaside.why', 'Why set it aside?', False, "the reason field for heldsetaside")
REWRITE.update({
  'screen.held.archive.filed': '{count} files held beside it',
  'screen.held.ineligible': 'Not eligible for a batch: {reason}',
  'screen.held.waiting': "{asker}'s question is waiting for {capture}. Your reason is kept on the record and shown to {asker} on the question.",
})
# help-records: the law's particulars (its name, windows, reasons and sections) are the place's data, as placeholders
w('screen.help-records.title', 'How a records request works')
w('screen.help-records.sub', 'Help · for a request under the {law}, to an office in {place}')
w('screen.help-records.faster.in', 'The faster request in {place}')
w('screen.help-records.faster.what', "{place}'s {ordinance} adds the {request}: the office answers within {window}, and the ordinance sets the later limits when it needs more time ({cite}). It suits a small set of records you can describe exactly.", False, "the place's faster request, from its rules")
w('screen.help-records.portal.where', '{place} takes requests through its public records portal ({portal}).')
REWRITE.update({
  'screen.help-records.must.1': 'Answer within {days} days whether it holds records it can release, why or why not, and when they will be ready ({cite}).',
  'screen.help-records.must.2': 'Take longer only by written notice, saying why and when, for reasons the law lists ({reasons}); never more than {extra} extra days ({cite}).',
  'screen.help-records.must.3': 'Help you focus the request: identify the records that fit it, say where they are kept, and suggest ways past practical obstacles ({cite}).',
  'screen.help-records.must.4': 'Release the rest of a record that is partly exempt ({cite}), and refuse only in writing, naming who decided ({cite2}).',
  'screen.help-records.must.5': 'Give electronic records electronically, in a format it keeps them in, when you ask ({cite}).',
  'screen.help-records.must.6': 'Charge only the direct cost of copying ({cite}); for electronic records, of producing the copy, unless it must compile, extract or program data ({cite2}). You may photograph records you inspect, with your own equipment, at no charge ({cite3}).',
  'screen.help-records.must.7': "Never ask why you want them: access can't be limited because of the purpose of a request ({cite}).",
  'screen.help-records.portal.2': "Each request's page shows its full text to anyone, with its dates, the department and the city's contact. Write the request so you are content for anyone to read it.",
  'screen.help-records.portal.3': 'Contact details are optional. Without them you get no updates, and you can collect the records only if the department posts them publicly or you contact it yourself.',
  'screen.help-records.does': 'What Civicsmith does with it',
})
# imported
w('screen.imported.band', "Another team's case: {group} · Edition {edition} · read-only · {recreated} of {findings} findings recreated", False, 'the band across an imported case')
# inbox
w('screen.inbox.same.date', 'same knocker as {date}', False, 'beside a knock: the same sender handed in material on {date}')
# install (the installer's pages, before the team's Civicsmith exists)
def wi(k, en, prot=False, note=''): w('screen.install.' + k, en, prot, note)
wi('sub', 'Two choices here, then Cloudflare. What your team needs first is on civicsmith.org.')
wi('need.cloudflare', 'A Cloudflare account on the Workers Paid plan ($5 a month), with a payment method, belonging to your team rather than to one person.')
wi('need.claude', 'No Claude account: the assistant is optional.')
wi('need.link', 'What you need, on civicsmith.org')
wi('short.heading', "Your team's short name")
wi('names', 'Your team has two names. Its name, such as “{example}”, is what people read; you choose it in setup and can change it whenever you like. Its short name, chosen here, is the fixed label in its web addresses and beside every signature, and can never change.')
wi('permanent', "Your short name is in every address of your team's Civicsmith and beside every signature your members make. It can never be changed, by you or anyone, without setting up your team's Civicsmith again.", True, 'the warning before an irreversible choice')
wi('places.help', 'Each place brings its deadlines, holidays, offices and records laws, each with its source. You can change this later in Settings › Places and offices.')
wi('places.none', 'None of these: we enter due dates and offices ourselves')
wi('cf.title', 'Let this installer into your Cloudflare account')
wi('cf.sub', "Next you go to Cloudflare's own page, sign in there, and allow this installer to set up your team's Civicsmith in your account. Civicsmith never sees your Cloudflare password.", True)
wi('cf.asks', 'What Cloudflare will ask you to allow', True)
wi('cf.programs', "Putting your team's Civicsmith's programs in your account, and its storage for documents and evidence.", True)
wi('cf.plan', 'Reading which plan your account is on.', True)
wi('cf.containers', "Running its containers: the built-in file scanner, the safe view for risky files, and signing in with a Claude subscription. Without them, files are kept and shown but not scanned, and a high-risk file can't be opened.", True)
wi('cf.join', 'Joining its parts together inside your account.', True)
wi('hold.head', "Whoever can sign in to this Cloudflare account controls your team's Civicsmith", True, 'says who can see and control everything')
wi('hold.what', 'They can read everything and lock everyone out, and no vote of administrators can stop them. Use a team account, and add at least one other trusted person to it. It is also the way back in if every administrator is locked out.', True)
wi('progress.title', "Setting up your team's Civicsmith")
wi('progress.sub', 'In the Cloudflare account “{account}”. This takes a few minutes; leave this page open.')
wi('progress.single', 'Checked that this account holds no other Civicsmith')
wi('progress.plan', 'Checked the account is on Workers Paid')
wi('progress.storage', 'Made the storage for documents and evidence')
wi('progress.verified', "Checked the release is Civicsmith's own, signed and unaltered")
wi('progress.placing', "Putting your team's Civicsmith in place…")
wi('progress.scanner', 'Starting the file scanner and safe view')
wi('progress.address', 'Giving it its address')
wi('progress.answers', 'Checking it answers, and that nothing keeps a log of who opens which file')
wi('stopped.exists', "This account already holds a Civicsmith, so nothing was created or changed.", False, 'DEC-282: reworded (K3471); the page that follows is screen.install.exists.*')
wi('stopped.plan', "Stopped: this account is on Cloudflare's free plan.", False, 'DEC-282')
wi('stopped.plan.do', "Nothing was created. Switch it to Workers Paid in Cloudflare's dashboard, then start again.", False, 'DEC-282')
wi('stopped.others', "Other steps stop the same way and say what to do: no payment method; permission not granted on Cloudflare's page; a log in the account that would record who opens which file. A stop before setup has begun creates nothing.")
wi('ready.sub', 'It answered its own checks. One step is left: you become its first administrator.')
wi('ready.answers', 'It answers at its address')
wi('ready.scanner', 'File scanner and safe view running')
wi('ready.nolog', 'No log records who opens which file')
wi('ready.note', "These checks ran as part of the installation; the installer keeps nothing of your team's Civicsmith once it hands over.")
wi('otp.head', 'Your one-time password: save it now', True)
wi('otp.what', "This makes you your team's first administrator, in the next step. It is shown once, here, and is spent when you claim. Keep it to yourself: don't share, print or send it, because whoever has it before you claim can claim in your place. Save it somewhere safe, such as a password manager. Continuing below fills it in for you.", True, 'DEC-282: reworded (install situation S10)')
wi('otp.help', 'Works once. When you claim, it is spent and you sign in with a password you choose.')
wi('address.help', "Where you, and later your members, open your team's Civicsmith. Bookmark it.")
wi('probe.summary', 'A probe key, for a monitoring service (most teams never need it)')
wi('probe.help', "Lets a monitoring service check that your team's Civicsmith is running. It reaches only a separate test store, never your team's records. Shown once.")
wi('probe.copy', 'Copy the probe key')
wi('continue', "Continue to your team's Civicsmith: become its first administrator")
# join
w('screen.join.invited.by', '{name} invited you to contribute. This link works once and expires on {date}.')
w('screen.join.again.help', "So a typing slip can't lock you out. The two must match before you can continue.")
REWRITE.update({
  'screen.join.invited': "You're invited to {group}",
  'screen.join.language.help': "Chosen from your device's setting. You can change it any time.",
  'screen.join.handle.help': "The record shows your handle on your work. Choose it with care: it can't be changed after you join, and no one else can ever take it. It needn't be your legal name. Lower-case letters, digits and hyphens, 2 to 41 of them, starting with a letter or digit. Choosing a handle: a name people know lends your work credibility and lets reporters reach you, but puts it on public cases; a pen name shields you from pressure, while the administrators still know who you are.",
  'screen.join.codes.after': "When you join, you get ten recovery codes, shown once: save them, they are how you get back in if you forget your password. Then you are signed in and your team's home opens, with a short guided start you can take or leave.",
})
# notes
w('screen.notes.protects.link', 'What this protects, and from whom', True, 'a link beside "Only you can see these in your team" (protected: who can see)')
# money
w('screen.money.sub.flow', 'from {from}, mostly to {to}', False, "under a trail's name: where its figures run")
w('screen.money.graph.heading', 'Where the money went, as a graph')
w('screen.money.table.how', 'Open a figure to act on it; tick several to act on them together.')
w('screen.money.readby', 'Read by {by} from {source}, p. {page}: {as_read}.', False, '{as_read} the words as the source writes them')
w('screen.money.readby.noquote', 'Read by {by} from {source}, p. {page}.')
w('screen.money.moved.event', 'When it moved: {event}, recorded as an event with that passage.')
w('screen.money.budget.about', 'A budget figure says what was planned, not what happened. The {phase} figure from {source} sits beside it in this trail: {difference}; the two differ in {dims} and are compared, never merged. A later budget change would be read in as an adjustment naming this figure.', False, 'under a budget figure that has a paid figure beside it')
w('screen.money.moved.as', 'posted as {what}', False, 'under the date a figure moved, as the source describes the posting')
w('screen.money.saysneither', 'It says neither where the money went nor on what day.')
w('screen.money.gap.yearonly', 'Undetermined: the source gives only the year.')
w('screen.money.findin.date', 'Look for its date in this project', False, "findin's button, looking for the day a figure moved")
REWRITE.update({
  'screen.money.didnotmove': 'did not move: a {phase} figure',   # DEC-265 (B226 (4)): the figure carries no adoption date
  'screen.money.gap.to': 'Undetermined: not stated in {source}, the only source holding this figure.',
})
# open-file
w('screen.open-file.risk.low.short', "Fetched by your team's Civicsmith; nothing in it acts on its own.", False, 'beside the Low risk mark')
w('screen.open-file.risk.high.short', "Handed in, not fetched by your team's Civicsmith; {why}.", False, 'beside the High risk mark; {why} such as "it contains a macro"')
w('screen.open-file.handedin', 'Handed in at the doorbell, {date}')
w('screen.open-file.deeper.notasked', 'not asked for yet', False, 'the state of a deeper check')
w('screen.open-file.warn.why', "Why it is high risk: it was handed in, not fetched by your team's Civicsmith, and {why}. No scanner has found anything in it; the built-in scanner checked it on {date}.", True, 'the warning before opening a high-risk original')
w('screen.open-file.warn.accept', 'Open the original, accepting this', True, "openwithwarning's button inside the warning")
w('screen.open-file.found.by', 'The built-in scanner found {finding} on {date}, and so did {tool} in the deeper check.')
w('screen.open-file.found.resembles', 'Scanners report what a file resembles; sometimes a safe file is flagged, which is what a release is for.')
w('screen.open-file.found.sent', 'sent once to the members who can see it', True, 'who is told of a finding (protected: who can see)')
w('screen.open-file.held.about.outside', 'While it is held, its original cannot be opened, not even with a warning. An outside scanner found it too, so it is released only when two members each give a reason. (Had only the built-in scanner found it, a second, different scanner finding it clean would release it.) A release covers this finding only.', True)
w('screen.open-file.whole', 'The file read whole', False, 'the structure check of a deeper check')
w('screen.open-file.flagged', 'Flagged: {what}', False, 'what the structure check flagged, such as "an external link"')
w('screen.open-file.release.waiting', "{name} gave a reason on {date}; a second member's releases it. The machine never can.")
# people
w('screen.people.counts.three', 'named in {documents}, {questions} and {projects}', False, 'each a count with its noun, such as "14 documents"')
w('screen.people.counts.docsonly', 'named in {documents}, in no question or project yet')
REWRITE.update({
  'screen.people.notmembers': "The people and organizations your team's record follows: officials, staff, companies and public bodies. Your own team's members are not listed here; they are under Settings › Members.",
  'screen.people.today.seeded': "added at setup, from the public offices of your team's place",  # DEC-294: on People a line of its own, the row's kind beside the name; also an alias's source
})
# person
w('screen.person.testify.basis', 'How you know (for “I know this is them”)')
w('screen.person.same.because', 'claimed the same person, grade {grade}, because {basis}')
w('screen.person.expunge.title', 'Remove "{fact}" from {name}\'s page', True, 'the correction dialog (protected: irreversible)')
w('screen.person.expunge.button', 'Remove it for good, with this reason', True, "personexpunge's button inside the dialog")
w('screen.person.expunge.phone', 'On a phone this can be read but not done: like signing and publishing, it finishes on a larger screen, where the whole consequence is in view.', True)
w('screen.person.naming.it', 'Documents that may name it', False, 'entity.naming.title for an organization')
w('screen.person.testify.it', 'I know this is it…', False, 'entity.naming.testify for an organization')
REWRITE.update({
  'screen.person.facts': 'Career, credentials, memberships, interests',
  'screen.person.expunge.statement': 'This removes the recorded value for good. It cannot be undone, by you or anyone: the value is gone from this page, from every question that cited it, and from every export. A marker stays where it was: "Removed where the law requires, {date}, by {member}". Published cases are not changed; a court order for those is complied with on the docket.',
})
# places
w('screen.places.sub', "Administrators only. The places whose rules your team's Civicsmith follows, and the offices your team deals with.")
w('screen.places.profiles.help', 'Each place brings its deadlines, holidays, offices and records laws, each with its source. Changing places changes how dates and offices read from then on; what your team already recorded stays as it was.')
w('screen.places.offices.note', "Offices come from your places' rules, each marked with where it came from. After you change places, fill them in again; offices your team added itself stay.")
REWRITE.update({
  'screen.places.wanted.field': "A place you want that isn't listed (optional)",
  'screen.places.wanted.help': "Kept in your team's Civicsmith and never sent anywhere. When an update brings its rules and offices, administrators are told once in their queue and can choose it above.",
})
# plan
w('screen.plan.check.hostile', 'Scenario {scenario}: no branch answers a hostile response (refusal, obstruction, retaliation) to {item}.', False, "a plan check's finding")
w('screen.plan.subject.from', 'from the inquiry "{title}" ({status}, {date})', False, "where a plan's subject comes from; {status} such as suspected")
w('screen.plan.phase.checkpoint', '{item} → checkpoint: "{checkpoint}" (judged by a member)', False, "a scenario's phase")
w('screen.plan.item.untaken', 'nobody has taken it up', False, 'a started item no member has taken up')
REWRITE.update({'screen.plan.opened': 'opened {date} by {name}'})   # DEC-265 (B226 (3)): planopen records no reason
# proceeding
w('screen.proceeding.now', 'Now: awaiting the {event}', False, "where the proceeding stands, such as awaiting the hearing")
REWRITE.update({'screen.proceeding.login.note': "The court's register needs a login, so new filings come only by a member's own capture."})
# published
w('screen.published.howtoread.link', 'How to read a case', False, 'a link after the explanation of the two strengths')
w('screen.published.named', '{name}, by title: {reason} (finding {n}).', True, 'a person the case names by title, with the reason (protected: published)')
REWRITE.update({'screen.published.meets': "meets this project's bar (capture {capture}, connection {connection})"})
# projectai
def wp(k, en, prot=False, note=''): w('screen.projectai.' + k, en, prot, note)
wp('sub', "Optional. Who pays for the assistant's work in {project}, for which uses, and up to what limits.")
wp('state.key', "{project} has its own Anthropic API key (ending …{last4}) · {state} · set by {name}, {date}. Members' acts in this project are paid for by it, and the project is billed by Anthropic.", False, '{state} on or off')
wp('state.signin', 'Your own Claude sign-in serves {project} while you are its only member · {state} · set by you, {date}. It is your own use of your own subscription.')
wp('state.member', "{project} pays for the assistant's work here with its own API key, {state}. Its owners set what it pays for and its limits; they see how much it is used in total, never what you ask or who asked.", True, 'what a member who is not an owner sees (protected: who sees what)')
wp('paidby.key', 'An Anthropic API key for this project')
wp('paidby.signin', "My own Claude sign-in, while I am the project's only member")
wp('paidby.none', "No project account: members' own accounts, then the team's key, serve")
wp('key.help', "Made at console.anthropic.com by whoever pays for the project. Sealed in your team's Civicsmith, never shown again or exported, and used only for acts in this project. It starts switched off. Each member is told once, before the first act it pays for, that their questions go to Anthropic under the project's account.", True)
wp('owners.alone', 'Any one owner sets these alone. Every change is recorded with who and when, and every owner sees it below.')
wp('uses.heading', 'What it pays for')
wp('limit.ontop', 'on top of it', False, 'a limit on one use that is on top of the overall limit')
wp('meter.month', "This month on the project's account: {used} of the {limit} limit")
wp('meter.explore', 'Exploring this month, on top of it: {used} of the {limit} limit')
wp('limits.signin', 'Limits on your sign-in here')
wp('keepaway.member', 'Off. If an owner turns it on, you see their reason here, and the assistant stops for the uses they chose, whoever pays.')
wp('keepaway.which', "Keep this project's material away from AI")
wp('keepaway.button', "Keep this project's material away", False, "projectaikeepaway's button")
wp('changes.head', 'Changes, seen by every owner', True, 'says who sees the changes')
wp('change.ontop', '{name} set a limit of {limit} a month on {use}, on top of the overall limit')
wp('change.explore', '{name} set exploring to {setting}')
wp('change.held', "{name} held the project's API key and switched it on")
REWRITE.update({
  'screen.projectai.account.suspended': "Your sign-in no longer serves {project}. A second member joined, and a sign-in serves a project only while it has one member. Members' acts here now use their own accounts, or the team's key. Add an API key to give the project its own account again; if the project returns to just you, your sign-in serves it again.",
  'screen.projectai.notice.head': 'Before your first question here',
  'screen.projectai.key.field': "The project's API key",
})
# recovery
w('screen.recovery.sub', 'If you lose your password, one of these codes lets you set a new one. Each works once. Every member has their own.')
w('screen.recovery.lost.heading', 'If you lose your codes too')
w('screen.recovery.lost.what', 'An administrator can make you a one-time reset link instead. For administrators: if every administrator loses both password and codes, only whoever holds the hosting account can let one back in, so a second administrator is worth having.')
REWRITE.update({
  'screen.recovery.held': 'You hold recovery codes: {remaining} of {total} unused, issued {date}.',
  'screen.recovery.shown': 'Save these now: they are shown only this once. Keep them somewhere only you can reach, apart from your password. Civicsmith keeps only a fingerprint of each, so it can never show them again.',
})
# reset
w('screen.reset.dead.sub', 'A reset link works once, for seven days')
REWRITE.update({
  'screen.reset.keeps': "Your handle and everything you did stay as they are, and every other sign-in of yours ends. {name} can't see the password you choose. Your recovery codes still work; if you have lost them too, get ten new ones in Settings › Recovery codes once you are in.",
  'screen.reset.dead.what': 'It was used already, it expired, or an administrator withdrew it. Ask an administrator for a new one, in person or however your team talks. Nothing was changed.',
})
# review-copy
w('screen.review-copy.band', '{n} people outside the team can read this until {date}', True, 'the band across a draft shared for review (protected: who can see)')
w('screen.review-copy.sub', 'A named reader gets a view that you can stop at any time.')
w('screen.review-copy.link.line', 'For {who} · works until {until}, or until you stop sharing · Civicsmith sends no email: copy the link and send it yourself.', True, "under the reader's link")
REWRITE.update({
  'screen.review-copy.heading': 'Share Edition {edition} for review',
  'screen.review-copy.reads.until': 'can read until {until}',
})
# review-outside
w('screen.review-outside.sub', 'Before publishing, the team asks you to read this draft of its case and comment. It is not public: only people with this link can read it, until {date}.', True)
w('screen.review-outside.readall', 'Read the whole draft')
REWRITE.update({
  'screen.review-outside.heading': 'A review copy from {group}',
  'screen.review-outside.draft': 'The case: {case}, Edition {edition} (draft)',
})
# request
w('screen.request.law.help', "From your team's places. The faster request suits a small, clearly described set of records.")
REWRITE.update({
  'screen.request.describe': "Describe the records, not why you want them. The law doesn't let the office limit access because of why you ask ({cite}), and the city's portal shows this text to anyone.",
  'screen.request.howsend.1': "Open the city's public records portal ({portal}) and choose “{button}”.",
  'screen.request.howsend.2': 'Paste the approved text as the request description, and choose the department: {department}.',
  'screen.request.howsend.3': "Contact details are optional. Without them the request still goes in, but the city can't send you updates or ask you to clarify, and you can't sign in to collect the records. Give the address your team uses for its requests; staff see what you give.",
})
# security
def ws(k, en, prot=False, note=''): w('screen.security.' + k, en, prot, note)
ws('sub', "How hard your team's Civicsmith is being tried, against its usual. Only administrators see this.", True, 'says who can see it')
ws('summary.signin', 'Someone tried hard to sign in on {when}. Every attempt was refused.', False, 'the period summarized, when sign-ins were refused far above the usual')
ws('summary.detail', 'Refused sign-ins were about {times} times the usual between {from} and {to}, with requests coming too fast turned away at the same time. It was high from {highfrom} to {highto}, when administrators were told once. No new key, credential or administrator was made in the period.')
ws('heat.heading', 'By kind and by hour')
ws('heat.usual', 'at or below the usual', False, 'the key under the hours')
ws('heat.upto', 'up to {n} times the usual', False, 'the key under the hours')
ws('heat.note', 'Each square is one hour. Hover, focus or tap one for its count and the usual. “Usual” is your team\'s own median for the same hour over the four weeks before.')
ws('totals.heading', 'Totals for the period')
ws('totals.note', 'Counts only. Nothing here says who tried, and nothing your team holds is shown.')
ws('where.what', 'Refused sign-ins and keys, and requests turned away or blocked, by the country Cloudflare reports for them.')
ws('where.note', "A country is not proof of who is behind an attempt: anyone can borrow an address in another country. No address is ever kept or shown, and a member's own sign-ins are never placed: a mistyped password followed by the member signing in is counted without a country.")
ws('told.heading', 'When you are told')
ws('notice.signin', 'sign-in refusals far above the usual and still going on, all refused so far', False, "the administrators' notice when the level is high")
ws('notice.sent', 'sent to administrators once, at {time}, when the level became high · not sent again while it lasted', True, 'who was told (protected)')
ws('told.note', 'Administrators are told only when the level is high, never as a routine count. The notice opens this screen at that period.')
ws('tools.about', "Built in: a file scanner (ClamAV, which looks for viruses and other harmful code, with signatures fetched daily) and the safe view. Add your organization's own tools of any kind: file scanners, tools that make safe copies of files, sandboxes, address checks, a place to send security counts.")
ws('runs.own', "runs in your team's own account")
ws('runs.deeper', 'runs when a member asks for a deeper check')
ws('tool.sendsbytes', "sends the file's bytes, never its name", True, "a tool's handling: what leaves the team")
ws('tool.deletes', 'deletes the file when the scan ends', True)
ws('tool.results', 'results kept up to {days} days', True)
ws('tool.addresscheck', 'address check before a capture')
ws('tool.hosting', 'your hosting company already carries your traffic, so no one new learns an address', True)
ws('adding', 'Adding: {tool}, {kind}')
ws('adding.sends', "The file's bytes. Never its name, who captured it or your team's address.", True)
ws('adding.recipient', '{vendor}, in the region you choose; it uses no one else.', True)
ws('adding.keeps', 'Clean files up to {days} days. Files it judges malicious: kept by {vendor} in {region}, indefinitely, for its own research.', True)
ws('adding.when', "When it runs: only when a member asks for a deeper check. A tool on your organization's own servers may also check every file as it arrives.")
ws('adding.before', 'Before you turn it on')
ws('adding.understand', 'I understand that files {vendor} judges malicious are kept by {vendor} in {region} indefinitely', True)
ws('adding.test', 'Test it with a harmless test file', False, "securitytooltest's button while adding a tool")
ws('adding.private', "A service that shares by default is offered only with its private mode, which Civicsmith turns on and checks on every call; if it can't confirm private mode, nothing is sent.", True)
ws('notoffered', "Not offered, because they share what is sent to them: VirusTotal uploads, Jotti, Hybrid Analysis, and the public modes of ANY.RUN, Joe Sandbox and urlscan.io. A tool whose vendor does not say whether it shares what it is sent is not offered until it does. An address check never sends the full address to anyone new: only checks that send a scrambled fragment, or Cloudflare's own. A site known to be bad: the document is still captured, as high risk, opens only in the safe view, and the check's answer is noted on it.", True)
ws('logsink', 'Sending security counts elsewhere (a log service your organization uses) sends counts only, never who opened which file.', True)
ws('cando.heading', 'What you can do')
ws('cando', "A member who fears their password is weak can change it in Your account. An administrator can turn off the reusable join link or the team's key in Members. Whoever holds the hosting account can tighten Cloudflare's own settings there.")
REWRITE.update({
  'screen.security.kind.signin': 'Refused sign-ins',
  'screen.security.kind.credential': 'Refused keys and links',
  'screen.security.kind.rate': 'Requests over the limit',
  'screen.security.kind.handover': 'Refused hand-overs',
})
# settings
w('screen.settings.sub', "Your own settings first; then the team's, which only administrators change.")
# standard
REWRITE.update({'screen.standard.notyet': 'Not a standard until a member adopts it.'})
# start-send
w('screen.start-send.clock.law', '{days} days, from the law your profile names', False, "an action's clock, from the team profile")
w('screen.start-send.secondapproval', "If this project needs a second approval before sending, the text shows: “Waiting for a second member's approval. Any member of this project other than {approver} can give it.”")
# theme
w('screen.theme.declaredby', 'declared by {who}, {date}', False, "theme.declared within a theme's line")
w('screen.theme.placed.confirmed', 'Placed by {who}, {date}; confirmed a hunch the assistant proposed: “{note}”')
# ties
w('screen.ties.sub', 'Your work and family connections that could matter to a case, so your team can be open about them.')
w('screen.ties.summary', 'Why you are asked, and who sees it · so readers can trust a case · only you and the administrators see this list', True, 'says who sees the list')
w('screen.ties.who.change', 'You can change or remove a tie at any time. A case already published keeps what it said.')
w('screen.ties.row.says', 'a case would say: “{says}”', True, 'how a case would disclose the tie')
w('screen.ties.row.named', 'a case would name me', True)
REWRITE.update({
  'screen.ties.says.name.choice': 'Naming me by my handle: “{handle}, who worked on this case, is {tie}.”',
  'screen.ties.says.group.choice': 'Without naming me: “A member of the team who worked on this case is {tie}.”',
})
# timeline
w('screen.timeline.order.undetermined', 'Undetermined order: {events}, because both are dated only by {precision}.', False, '{precision} month or year')
w('screen.timeline.step.none.optional', 'None threaded; not every request has one.', False, 'a step that is only sometimes present')
w('screen.timeline.finding.missing', 'Step {n}, {step}: no document within {window} (by {date}).', False, 'a finding on a followed matter; it never says anyone is late')
w('screen.timeline.progression.sub', 'How the team expects {what} to go. Version {n}, declared by {name}, {date}.')
w('screen.timeline.step.within', 'within {days} days of step {n}', False, "a step's window")
w('screen.timeline.req.unless', 'Required: Unless a lawful exception applies')
w('screen.timeline.progression.prior', 'Version {n}, {date}, had no {step} step.', False, 'how the earlier version differed')
w('screen.timeline.progression.name.help', 'The kind of happening it follows, such as “{example}”.')
w('screen.timeline.progression.steps.note', 'Then add its steps, each with what comes before it, how soon, whether it is required, and how many documents it holds.')
REWRITE.update({'screen.timeline.order.evidence': 'More evidence could order them: a passage that gives either one its day (a ledger entry, a meeting\'s agenda, a letter\'s date), or a source that says which came first. Until a source orders them, both are kept as they are, never guessed into order; when one does, the timeline names it, and a source that disagrees is shown beside it, in tension.'})
# translations
def wt(k, en, prot=False, note=''): w('screen.translations.' + k, en, prot, note)
wt('who', 'Who may translate {language}')
wt('grantedby', 'granted by {name}, {date}')
wt('changedby', "changed from the assistant's draft by {name}")
wt('secondcheck', 'needs a second check', False, 'a protected word changed from its draft')
wt('localname', 'name kept; explanation translated', False, 'where a local name came from')
wt('draft.missing', 'Ask the assistant to draft the {n} missing', False, "translationdraft's button")
wt('drafts.note', "A speaker checks the assistant's drafts for errors. A protected word kept as the assistant drafted it shows once kept. Changed from the draft, it shows only after a second granted speaker confirms it, or an administrator confirms it after reading the assistant's translation of it back into English; until then members see the English.", True)
wt('typed.note', 'Type each word; a member who knows the language keeps it. A protected word shows only after a second granted speaker confirms it; until then members see the English.', True)
wt('marked.note', 'Any member can mark a word with “this translation looks wrong”; it is listed here for the granted members and the administrators. Every word records who adopted it, when and what it replaced.')
wt('localnames.note', "Names of offices, laws, programs and places stay as they are, with an explanation in the member's language beside them. Where the place publishes an official translation, it comes with the place's rules and shows its source. What goes to an office goes in the office's language, with a labeled translation beside it for the member.")
# unavailable
w('screen.unavailable.unreachable.note', "It tries again by itself every 30 seconds. If it stays out of reach for long, tell whoever holds your team's Cloudflare account.")
REWRITE.update({
  'shell.unavailable.nothing.says': "This address doesn't lead to anything in your team's Civicsmith. It may have been typed wrong, or the link is old.",
  'shell.unavailable.notyours.says': "It exists, or it may not: either way it isn't something you can see. A hidden project shows only to its own members; ask its owner if you think you should be in it.",
  'shell.unavailable.unreachable.title': "Your team's Civicsmith can't be reached",
  'shell.unavailable.unreachable.says': "Your device is offline, or your team's Civicsmith isn't answering. Nothing you did is lost: what you saved is kept there, and what you were typing is still on this page.",
})
# update (the installer's update page)
w('screen.update.sub', "For whoever holds your team's Cloudflare account. An update keeps every record, member and setting; it changes only Civicsmith's own programs.")
w('screen.update.note', "You go to Cloudflare's page to allow it, as when it was set up. If a step stops, your team's Civicsmith keeps running as it was.")
# wizards
w('screen.wizards.originalchanged', "Civicsmith's original changed since: see what changed")
REWRITE.update({'screen.wizards.basedon': "based on Civicsmith's “{name}”", 'screen.wizards.copy.note': "A copy becomes your team's own wizard: a draft until approved, like any wizard your team writes. The original stays as it is and is still offered; a required wizard stays required. The copy shows what it is based on, and when Civicsmith's original changes, your wizard editors are told and can bring the change across."})
# tour
w('screen.tour.what.says', '{group} looks into {focus}. We check what the city says against its own records, and publish what the records show.', False, "the walk-through's first step; {focus} the team's own words")
w('screen.timeline.threaded.owndate', '{document}, its own date {date}', False, 'a document threaded to a step, with the date it bears')
# --- end DEC-259

# --- DEC-273: what each explanation says (a control's data-tip, shown on hover, focus or tap) is a keyed word too, counted by
# check_words_drawn.mjs apart from the drawn text (words-drawn-tips-baseline.json, a ratchet). A drawing that paraphrased a
# key now draws the key; a sentence no key held is minted here. The shell's, on every screen:
def w273(key, en, prot=False, note=''):
    W.append(dict(key=key, en=en, protected=prot, note='DEC-273' + (': ' + note if note else '')))
w273('shell.queue.waiting', '{n} items wait on you in your queue: {todo} to do, {noticed} noticed, {status} status.', False, "the queue count's explanation in the masthead; {n} their sum")
w273('shell.queue.open', 'Click to open your queue.', False, "the queue count's explanation, its second line")
w273('shell.group.open', 'Click to see who your team is.', False, "the team's card in the masthead, its second line; the team's description and purpose are its own words (data)")
# --- end DEC-273

# --- DEC-275: explanations keyed, screens account to members. The tip of a reference card is now read as the tip shows it,
# its "Here:" line apart (.cs-tip .why is its own line). Words about a sample record (a project's, office's or team's own
# description, a person's role) are marked .mk-data in the drawing; the rest is keyed here, a template where it carries data.
def w275(key, en, prot=False, note=''):
    W.append(dict(key=key, en=en, protected=prot, note='DEC-275' + (': ' + note if note else '')))
w275('shell.icon.capture', 'A document or a capture', False, "a row's icon, its explanation")
w275('shell.icon.group', 'An office, a member or a team', False, "a row's icon, its explanation")
w275('shell.icon.clock', 'Something with a time limit', False, "a row's icon, its explanation")
w275('shell.icon.tension', 'Two things that disagree', False, "a row's icon, its explanation")
w275('shell.icon.hold', 'Held, not yet in the record', False, "a row's icon, its explanation")
w275('shell.crumb.back', 'Back to {place}.', False, "a step of the path, its explanation; {place} the step's own name")
w275('screen.account.tip.handle', 'shown on your work in the record and on any public case it is in', False, "your handle's card")
w275('screen.account.tip.handle_after', 'After that it is fixed.', False, "your handle's card, after handle.changeable")
w275('screen.account.tip.checks', 'a member asks another with declared expertise to check their work', False, "the card of checks by expertise")
w275('screen.account.tip.checks_why', 'Declaring yours, such as Spanish–English interpreting, lets members send you checks in that field.', False, "the card of checks by expertise")
w275('screen.account.tip.key', 'a key held in this browser', False, "the signing key's card")
w275('screen.account.tip.key_signs', 'signs what you approve under your handle, such as a case you own', False, "the signing key's card")
w275('screen.account.tip.key_why', "Without one registered here you cannot sign; revoking it ends this browser's key for good.", False, "the signing key's card")
w275('screen.action.tip.title', "{action}: your team's request to {office}, sent by {name} on {date}.", False, "the action's title, its explanation")
w275('screen.action.tip.title_holds', 'What was sent, when the reply is due and what came back are here.', False, "the action's title, its explanation")
w275('screen.action.tip.office_record', '{n} requests from your team, {m} answered on time', False, "an office's card: its record of answering the team")
w275('screen.action.tip.office_why', 'The office that must reply; its record with your team so far is {m} of {n} on time.', False, "an office's card")
w275('screen.action.tip.sent', 'recorded by {name} on the day it was sent', False, "the sending date's card")
w275('screen.action.tip.sent_why', 'The response clock counts from this date.', False, "the sending date's card")
w275('screen.action.tip.office_decides', "Its reply, or its silence by {date}, decides the plan's next step.", False, "the office's card on an action")
w275('screen.action.tip.ack', 'the office confirms it received the request', False, "an acknowledgment's card")
w275('screen.action.tip.ack_why', 'It is not the records: the {date} due date stands unless the office gives notice of an extension.', False, "an acknowledgment's card")
w275('screen.action.tip.reference', "{office}'s reference for this request", False, "the office's reference number's card")
w275('screen.action.tip.reference_from', 'from its acknowledgment of {date}', False, "the office's reference number's card")
w275('screen.action.tip.reference_why', 'Quote it in any follow-up so the office can find the request.', False, "the office's reference number's card")
w275('screen.archive.tip.title', "{title}: a ZIP archive {name} captured from {source} on {date}, for {project}.", False, "the archive's title, its explanation; {title} the archive's own name")
w275('screen.archive.tip.title_holds', 'Every file inside is listed with what happened to it: filed, held for review, or set aside.', False, "the archive's title, its explanation")
w275('screen.assistant.tip.title', "{question}: {name}'s question in {project}, opened {date}, with the assistant beside it.", False, "the title's explanation; {question} the question's own words")
w275('screen.assistant.tip.computed_fact', 'a figure worked out from captured data by a stated method', False, "a computed fact's card")
w275('screen.assistant.tip.computed_why', "The assistant can explain the method; only a member's check, like {name}'s, is recorded as a check.", False, "a computed fact's card, beside the assistant")
w275('screen.assistant.tip.hunch_why', "Ask the assistant what records would test {name}'s hunch; it stays a hunch until a source supports it.", False, "a hunch's card, beside the assistant")
w275('ai.serves.other_says', "Where the team's key or a project's account serves you instead, this says so.", False, "the account that serves you, its explanation (corrected: it showed a placeholder)")
w275('act.themeplace.here.question', "Pick one of this question's passages and the theme it belongs in, with an optional note.", False, "on a question: a question is not placed, its passages are")
w275('screen.question.tip.themes', 'A question is not placed in a theme; the passages it cites are.', False, "the themes section of a question, its explanation")
w275('screen.calculation.tip.title', "{title}: a fact your team worked out from {source}: {result}.", False, "the calculation's title, its explanation; {title} and {result} the calculation's own words")
w275('screen.calculation.tip.title_method', "Its method is shown below, {name} checked it on {date}, and it is worked out again if an input changes.", False, "the calculation's title, its explanation")
w275('screen.calculation.tip.closed_why', 'It counts “closed” as {government} records it: when the crew reports the work complete, not after an inspection.', False, "the result's card")
w275('screen.calculation.tip.expertise', "{name}'s declared expertise, {expertise}", False, "a member's expertise, its card")
w275('screen.calculation.tip.expertise_confirmed', 'confirmed in the team', False, "a member's expertise, its card")
w275('screen.calculation.tip.check_why', "{name}'s check is the second member's check; the result still needs a member to accept it.", False, "a member's expertise, its card")
w275('screen.calculation.tip.helpbelow', "“How spot-checks work” below explains it in general.", False, "the spot-check section's explanation, its second line")
w275('screen.question.tip.proposes', 'What a run produced. It is machine work, never evidence, until a member accepts it.', False, "the section of what the assistant proposes, its explanation")
w275('screen.question.tip.concluded', "The team's answer to this question, recorded with who concluded it, when, and what would change it.", False, "the concluded section, its explanation")
w275('screen.capture.tip.ownsite', 'the website of the office that issued the document', False, "the office's own site, its card")
w275('screen.capture.tip.ownsite_why', 'A copy fetched there carries its source with it, so a reader can fetch the same page and compare.', False, "the office's own site, its card")
w275('screen.capture.tip.archive', 'an outside service that keeps dated copies of public web pages', False, "a public archive, its card")
w275('screen.capture.tip.archive_who', 'not run by {government} or by your team', False, "a public archive, its card")
w275('screen.capture.tip.archive_why', 'It can rescue a page {government} has removed, but it learns which address your team asked for.', False, "a public archive, its card")
w275('screen.capture.tip.testimony', 'one of the four grade scales', False, "testimony, its card")
w275('screen.capture.tip.testimony_is', "a person's own account of what they saw or heard", False, "testimony, its card")
w275('screen.capture.tip.testimony_why', 'What you write here can support or cut against a question, labeled as yours, as {example} does.', False, "testimony, its card; {example} a member's own account")
w275('screen.capture.tip.graded_why', 'D does not mean doubtful: it tells a reader your account can be checked only by asking you.', False, "grade D, its card")
w275('screen.case-editor.tip.title', "{edition}: {name}'s draft of the next edition of your team's published case.", False, "the case's title, its explanation")
w275('screen.case-editor.tip.title_public', 'Nothing here is public until an owner signs and publishes it.', False, "the case's title, its explanation")
w275('screen.case-editor.tip.internal', "the case passes Civicsmith's own checks: bar met, people named with reasons, what it leaves out", False, "the readiness step Internally checked, its card")
w275('screen.case-editor.tip.internal_why', 'The missing reason for {name} would hold it back.', False, "the readiness step Internally checked, its card")
w275('screen.case-editor.tip.external', 'the case meets outside rules it must follow, such as court orders and sealing', False, "the readiness step Externally compliant, its card")
w275('screen.case-editor.tip.external_why', 'Checked before publishing, so nothing public breaks an order.', False, "the readiness step Externally compliant, its card")
w275('screen.case-editor.tip.reason', 'every person a case names needs the reason, drawn from its evidence', False, "a missing reason, its card")
w275('screen.case-editor.tip.reason_why', "The case can't pass its checks until {name} has a reason or is taken out.", False, "a missing reason, its card")
w275('screen.ceremony.tip.title', 'Publish {edition}: the last checks and the signing of {project}, {edition_2}.', False, "the publishing screen's title, its explanation")
w275('screen.ceremony.tip.bias', "the team's own statement of any stake it has in what it examines, in its own words", False, "declared bias, its card")
w275('screen.ceremony.tip.bias_carried', 'every published case carries it', False, "declared bias, its card")
w275('screen.ceremony.tip.bias_why', 'Readers judge the case knowing what the team may favor.', False, "declared bias, its card")
w275('screen.ceremony.tip.central_why', "The case's central claim; it meets the bar, so it can be relied on in public.", False, "a finding's card at publishing")
w275('screen.ceremony.tip.asked', '{name} asked it to {request}', False, "a finding's card: a reviewer's comment; {request} the reviewer's own words")
w275('screen.ceremony.tip.asked_why', "Check the reviewer's comment was answered before you sign.", False, "a finding's card at publishing")
w275('screen.ceremony.tip.bar', 'the least capture and connection a finding needs to be relied on', False, "the project's bar, its card")
w275('screen.ceremony.tip.bar_why', 'Every finding meets it, so none is published as weaker than the team claims.', False, "the project's bar, its card")
w275('act.publish.here.ceremony', 'Records your confirmation inside the edition you are about to sign and fixes its text, so what you sign next is exactly what was checked. It publishes nothing.', False, "the ties step's button, which prepares the edition and publishes nothing")
w275('shell.step.leave', 'You can leave and come back; nothing is lost.', False, "a step still to do, its explanation")
w275('screen.capture.tip.ownsite_name', "The office's own site", False, "the office's own site, its card")
w275('screen.connect.tip.groupkey_on', 'switched on by {name}, {date}', False, "the team's key, its card")
w275('screen.connect.tip.groupkey_pays', 'the team pays Anthropic for each use', False, "the team's key, its card")
w275('screen.connect.tip.groupkey_why', 'It serves you now; your own account, if you connect one, replaces it for you alone.', False, "the team's key, its card")
w275('screen.connect.tip.anthropic', 'the company that makes Claude', False, "Anthropic, its card")
w275('screen.connect.tip.anthropic_gets', 'receives your question and the material read to answer it, only when you ask', False, "Anthropic, its card")
w275('screen.connect.tip.anthropic_why', 'This is where your questions go, under whichever account serves you.', False, "Anthropic, its card")
w275('screen.connect.tip.limit', "set by your administrators for every member on the team's key", False, "the daily limit, its card")
w275('screen.connect.tip.limit_why', 'You have used {amount} of it today; when it is reached the assistant stops serving you until the next day.', False, "the daily limit, its card")
w275('screen.connect.tip.workers', "the Cloudflare plan your team's Civicsmith can run on", False, "Workers Paid, its card")
w275('screen.connect.tip.workers_cost', '{amount} a month, paid by the team', False, "Workers Paid, its card")
w275('screen.connect.tip.workers_why', 'Signing in with a subscription needs it; without it, connect with an API key instead.', False, "Workers Paid, its card")
w275('screen.connect.tip.plans', "Claude's paid subscription plans", False, "Pro or Max, its card")
w275('screen.connect.tip.plans_billed', 'billed to you by Anthropic, not to your team', False, "Pro or Max, its card")
w275('screen.connect.tip.plans_why', 'Only these plans can serve your questions through a subscription.', False, "Pro or Max, its card")
w275('screen.connect.tip.console', "Anthropic's Console, where API keys are made", False, "the Console, its card")
w275('screen.connect.tip.console_needs', 'needs a payment method', False, "the Console, its card")
w275('screen.connect.tip.console_why', 'Where you would make your own key; Anthropic then bills you for each use.', False, "the Console, its card")
w275('screen.dash-action.tip.yours', 'What is yours in Action: each item with whose move it is and its act.', False, "the section of what is yours, its explanation")
w275('screen.dash-action.tip.every', 'Every action your team has open, with whose move it is and its clock as a sentence with its rule and date, never a countdown.', False, "the section of every action, its explanation")
w275('screen.dash-project.tip.next', 'What comes next in this project, for you, in order. The first is the one to take now; each is the act itself.', False, "the section Next for you here, its explanation")
w275('screen.dash-project.tip.story', 'What they did above the line, what we did below it, in order. Anything undated is listed on the full timeline, never guessed into place.', False, "the section The story so far, its explanation")
w275('screen.docket.tip.withdrawal', 'the team withdraws a finding or a whole case, publicly', False, "a withdrawal, its card")
w275('screen.docket.tip.withdrawal_stays', 'the earlier edition stays visible, marked withdrawn', False, "a withdrawal, its card")
w275('screen.docket.tip.withdrawal_none', 'None so far for this case.', False, "a withdrawal, its card")
w275('screen.docket.tip.superseding', '{edition} replaced {edition_2} as the current edition', False, "superseding, its card")
w275('screen.docket.tip.superseding_stays', '{edition} stays public, marked as corrected', False, "superseding, its card")
w275('screen.docket.tip.superseding_why', "Every new edition is a docket entry; this is the case's first.", False, "superseding, its card")
w275('screen.docket.tip.draft', 'a draft docket entry', False, "an entry not yet posted, its card")
w275('screen.docket.tip.draft_public', 'public only once a member posts it, signed', False, "an entry not yet posted, its card")
w275('screen.docket.tip.draft_why', "Readers of the public case can't see this entry until it is posted.", False, "an entry not yet posted, its card")
w275('screen.document.tip.title', '{title}: {description}, captured by {name} from {site} on {date}.', False, "the document's title, its explanation; {title} and {description} the document's own")
w275('screen.document.tip.title_holds', 'It holds {rule} the {project} project tests {government} against.', False, "the document's title, its explanation")
w275('screen.document.tip.headed', 'headed by the {office}, today {name}', False, "a department's card")
w275('screen.document.tip.issuer_why', 'The department that issued this instruction is the one it binds.', False, "a department's card")
w275('screen.document.tip.ownwebsite', "{place}'s own website", False, "a website's card")
w275('screen.document.tip.publishes', 'where {government} publishes its policies', False, "a website's card")
w275('screen.document.tip.site_why', "Captured from the issuer's own site, so a reader can fetch the same page and compare its fingerprint.", False, "a website's card")
w275('screen.document.tip.version', 'the version this copy holds', False, "a document's version, its card")
w275('screen.document.tip.version_inforce', 'the version in force when captured on {date}', False, "a document's version, its card")
w275('screen.document.tip.version_why', '{period} repairs are tested against this version, so a later revision would not change past counts.', False, "a document's version, its card")
w275('screen.due-date.tip.title', "Due {date}: the day {office} must reply to your team's records request.", False, "the due date's title, its explanation")
w275('screen.due-date.tip.title_below', 'The law it comes from and how the days were counted are below.', False, "the due date's title, its explanation")
w275('screen.due-date.tip.cob', "the end of the office's working day on the due date", False, "close of business, its card")
w275('screen.due-date.tip.cob_why', 'A reply that arrives after then on {date} is late.', False, "close of business, its card")
w275('screen.doorbell.tip.title', 'Hand material to {group}: the page where anyone can give the team documents or information, without an account.', False, "the doorbell's title, its explanation")
w275('screen.doorbell.tip.title_says', 'It says exactly what happens to what is sent.', False, "the doorbell's title, its explanation")
w275('screen.doorbell.tip.civicsmith', "The team's own Civicsmith", False, "the team's own Civicsmith, its card")
w275('screen.doorbell.tip.civicsmith_runs', "runs on the team's own hosting account", False, "the team's own Civicsmith, its card")
w275('screen.doorbell.tip.civicsmith_sees', 'no other team sees it', False, "the team's own Civicsmith, its card")
w275('screen.doorbell.tip.civicsmith_why', "Only this team's members can open what you send.", False, "the team's own Civicsmith, its card")
w275('screen.doorbell.tip.member', "may use your material, or set it aside with a reason kept on the team's record", False, "a member, its card")
w275('screen.doorbell.tip.member_why', 'Nothing is published as it arrives: a member decides first, and anything used is checked like any other document.', False, "a member, its card")
w275('screen.doorbell.tip.phrase', 'any words you choose', False, "a secret phrase, its card")
w275('screen.doorbell.tip.phrase_same', 'a later delivery with the same phrase is marked as from the same sender', False, "a secret phrase, its card")
w275('screen.doorbell.tip.phrase_names', 'it never names you', False, "a secret phrase, its card")
w275('screen.doorbell.tip.phrase_why', 'Worth adding if you may send more: the team can weigh new material by how your earlier material held up.', False, "a secret phrase, its card")
w275('screen.doorbell.tip.court', 'a court can order the team to hand over what it holds, including what you send and when it arrived', False, "a court's reach, its card")
w275('screen.doorbell.tip.court_why', 'Think about what your files and note could reveal about you before you send them.', False, "a court's reach, its card")
w275('screen.find-in.tip.notfollowed', 'a person your team does not follow yet', False, "a name search does not know, its card")
w275('screen.find-in.tip.notfollowed_why', "Search does not know this name; the assistant's proposals, later, would.", False, "a name search does not know, its card")
w275('screen.finder.tip.portal', "{place}'s open-data portal", False, "an open-data portal, its card")
w275('screen.finder.tip.captured_where', 'where {name} captured {what} on {date}', False, "a source's card")
w275('screen.finder.tip.portal_why', "A copy from {government}'s own portal holds up better than one found elsewhere.", False, "an open-data portal, its card")
w275('screen.finder.tip.archivecopy', "captured from a public web archive, not {government}'s own site", False, "a public archive copy, its card")
w275('screen.finder.tip.archivecopy_why', "Capture it from {government}'s site before relying on it; that copy would hold up better.", False, "a public archive copy, its card")
w275('screen.finder.tip.held_until', 'held for you until {time} today', False, "documents held together, their card")
w275('screen.finder.tip.held_why', 'A held set can be counted, cited or acted on as one; let it go when you are done.', False, "documents held together, their card")
w275('connection.graph.grade.edge', "Its letter is the step's connection grade: how easily someone else could check the link.", False, "a line of the graph, its explanation's second line (A is easiest; D rests on a person's word.)")
w275('connection.graph.lead.means', 'A lead, not evidence: no finding rests on it until a source is attached.', False, "a declared or suspected line of the graph, its explanation's second line")
w275('screen.explore.tip.title', 'Explore connections: chains from {from} to {to}, through {kinds}, as of {date}, each step cited and graded.', False, "the screen's title, its explanation")
w275('screen.explore.tip.graph', 'The same connections as the chains below, drawn: {center} in the middle, what the record joins it to around it, and one ring further out.', False, "the graph section, its explanation")
w275('screen.explore.tip.graph_read', "Each line's color and pattern say the kind of connection, its word says the step, its letter the step's grade; the legend under the graph is always shown. Click anything to make it the center and follow on from it; the trail above walks back.", False, "the graph section, its explanation")
w275('screen.explore.tip.stepfrom', 'a step from {source}', False, "a step's card; {source} the record it is cited to")
w275('screen.explore.tip.vote_why', 'The step that ties {name} to the amendment, cited to the vote record.', False, "a step's card")
w275('screen.explore.tip.paid_why', 'Ties the amendment to the {amount} paid; open the report to check the line.', False, "a step's card")
w275('screen.explore.tip.weakest', 'a chain is graded by its weakest link', False, "the weakest step, its card")
w275('screen.explore.tip.weakest_here', 'here {grade} on connection', False, "the weakest step, its card")
w275('screen.explore.tip.weakest_why', 'No single strong step carries the chain; each must hold.', False, "the weakest step, its card")
w275('screen.explore.tip.declared', 'a link someone stated with no source attached', False, "a declared step, its card")
w275('screen.explore.tip.declared_why', 'Attaching a source could raise this step; until then the chain is a lead.', False, "a declared step, its card")
w275('screen.explore.tip.limit', 'longer chains are not followed', False, "the search's limit, its card")
w275('screen.explore.tip.limit_why', 'A link further out may exist; the search says it did not look rather than that there is none.', False, "the search's limit, its card")
w275('screen.home.tip.title', '{group}: your team, {description}, {n} members.', False, "the team's name on its home, its explanation; {description} the team's own words")
w275('screen.home.tip.focus', 'Its focus: {focus}.', False, "the team's name on its home, its explanation; {focus} the team's own words")
w275('screen.home.tip.fulldialog', 'Signing, sending and publishing still go through their full dialog, never one press here.', False, "the section of what needs you, its explanation")
w275('screen.home.tip.waits', 'What waits on someone, or on an office: whose move it is, and when it is due.', False, "the section of what waits on others, its explanation (offices too, so not screen.home.needsgroup.holds)")
w275('screen.home.tip.dashboard', "The name opens the area's dashboard.", False, "the areas section, its explanation")
w275('act.promote.here.home', 'Starts a project: one problem the team wants to get to the bottom of, with you as its owner. Questions, documents and plans gather under it.', False, "Start a project on Home, which starts a project rather than opening a question")
w275('ai.usage.meter.month_group', "This month on the team's key", False, "a use meter's name, its explanation's first line")
w275('screen.group-identity.tip.draft', 'a label on words the assistant wrote', False, "the assistant's draft label, its card")
w275('screen.group-identity.tip.draft_stays', 'stays until a member edits and keeps them', False, "the assistant's draft label, its card")
w275('screen.group-identity.tip.draft_why', "Nothing here is saved as the team's own until a member keeps it.", False, "the assistant's draft label, its card")
w275('screen.held.tip.vouching', 'a member signs that a capture is what it says it is', False, "vouching, its card")
w275('screen.held.tip.vouching_until', 'until then it is held and counts toward nothing', False, "vouching, its card")
w275('screen.held.tip.vouching_why', 'Nothing on this list supports or cuts against any question until a member vouches for it.', False, "vouching, its card")
w275('screen.held.tip.photo', 'The photo, as captured. Click to open it full size, in the safe view until it has been checked.', False, "a held photo's thumbnail, its explanation")
w275('screen.held.tip.crucial', 'Crucial to a finding', False, "a capture crucial to a finding, its card")
w275('screen.held.tip.crucial_is', 'a capture a finding would fall without', False, "a capture crucial to a finding, its card")
w275('screen.held.tip.crucial_vouched', 'vouched for one at a time, never in a batch', False, "a capture crucial to a finding, its card")
w275('screen.held.tip.crucial_why', '{document} carries a finding in {project}, so it gets its own look.', False, "a capture crucial to a finding, its card")
w275('screen.imported.tip.title', '{title}: a case published by {group} ({edition}), imported by {name} on {date}.', False, "the imported case's title, its explanation")
w275('screen.imported.tip.title_counts', 'Nothing in it counts for your team until a member accepts it.', False, "the imported case's title, its explanation")
w275('screen.imported.tip.publisher', 'its work counts here only as far as a member accepts it', False, "the publishing team, its card")
w275('screen.imported.tip.publisher_why', 'The publisher: if it corrects the case, a new edition appears on its docket.', False, "the publishing team, its card")
w275('screen.imported.tip.edition_of', 'the published case of {group}', False, "the imported edition, its card")
w275('screen.imported.tip.edition', 'the edition imported here', False, "the imported edition, its card")
w275('screen.imported.tip.edition_why', 'The edition recreated here; a later edition from them would need recreating again.', False, "the imported edition, its card")
w275('screen.imported.tip.recreated', "repeated here from the publisher's documents and method, with the same result", False, "Recreated, its card")
w275('screen.imported.tip.recreated_why', 'It still counts for your team only once a member accepts it, with a reason.', False, "Recreated, its card")
w275('screen.imported.tip.part', "some of the finding's support was repeated here from the publisher's documents and method, not all", False, "Recreated in part, its card")
w275('screen.imported.tip.part_why', 'Accept only what recreated, and say why in the reason.', False, "Recreated in part, its card")
w275('screen.imported.tip.no', "repeating it here from the publisher's documents and method did not give their result", False, "Did not recreate, its card")
w275('screen.imported.tip.no_why', 'Not a judgment that they are wrong: it just cannot count here.', False, "Did not recreate, its card")
w275('screen.inbox.tip.notyet', 'not yet in the record', False, "material handed in, its card")
w275('screen.inbox.tip.notyet_why', 'Nothing in them counts until a member moves them into the record and they are graded like any other document.', False, "material handed in, its card")
w275('screen.inbox.tip.phrase', 'recognized by the secret phrase the sender added', False, "the same knocker, its card")
w275('screen.inbox.tip.earlier', 'the sender also handed in material on {date}', False, "the same knocker, its card")
w275('screen.inbox.tip.earlier_why', 'Still unnamed, but how the earlier material held up tells you something about this.', False, "the same knocker, its card")
w275('screen.inbox.tip.stands', 'where this source stands', False, "the source's step, its card")
w275('screen.inbox.tip.stands_known', 'recognized across deliveries, nothing more known', False, "the source's step, its card")
w275('screen.inbox.tip.stands_why', 'Weigh the material by what can be checked in it, not by who might have sent it.', False, "the source's step, its card")
w275('screen.inbox.tip.partly', 'a member records what is known of the source, such as role or access, without naming them', False, "the step Partly known, its card")
w275('screen.inbox.tip.partly_why', 'Recording it helps weigh the material without exposing who sent it.', False, "the step Partly known, its card")
w275('shell.civicsmith.what', 'free software for teams that check whether a government keeps its own word: the laws it must obey, the court decisions that bind it, its own rules and its promises.', False, "Civicsmith's name or credit, its explanation")
w275('screen.install.tip.account', "your team's Civicsmith and all its records live in it", False, "the Cloudflare account, its card")
w275('screen.install.tip.account_free', 'the free plan is enough to start', False, "the Cloudflare account, its card")
w275('screen.install.tip.account_why', 'Whoever can sign in to it controls everything, so use a team account rather than a personal login.', False, "the Cloudflare account, its card")
w275('screen.install.tip.workers_cost', '{amount} a month, with a payment method', False, "Workers Paid, its card")
w275('screen.install.tip.workers_later', 'can be added later', False, "Workers Paid, its card")
w275('screen.install.tip.workers_why', "Needed only for recomputing members' spreadsheets and for members signing in with a Claude subscription.", False, "Workers Paid, its card")
w275('screen.install.tip.shortname', "your team's fixed label", False, "the short name, its card")
w275('screen.install.tip.shortname_where', 'in every web address and beside every signature', False, "the short name, its card")
w275('screen.install.tip.shortname_why', 'Chosen once, here: it can never change without installing again, so an unnamed team picks one that reveals nothing.', False, "the short name, its card")
w275('screen.install.tip.typed', 'the short name typed here', False, "the typed short name, its card")
w275('screen.install.tip.typed_becomes', 'becomes {address} and the label on every signature', False, "the typed short name, its card")
w275('screen.install.tip.typed_why', 'This exact label is what every case your team signs will carry.', False, "the typed short name, its card")
w275('screen.install.tip.otp', 'shown once, on this page', False, "the one-time password, its card")
w275('screen.install.tip.otp_spent', 'spent when you claim the team in the next part', False, "the one-time password, its card")
w275('screen.install.tip.otp_why', 'The only way to become the first administrator; if lost before claiming, only the Cloudflare account can set a new one.', False, "the one-time password, its card")
w275('screen.join.tip.title', "You're invited to {group}: {name}'s invitation for you to contribute to the team.", False, "the invitation's title, its explanation")
w275('screen.join.tip.handle', 'the name the record shows on your work', False, "a handle, its card")
w275('screen.join.tip.handle_legal', 'not your legal name unless you choose', False, "a handle, its card")
w275('screen.join.tip.handle_fixed', 'chosen when you join and never changed', False, "a handle, its card")
w275('screen.join.tip.handle_why', 'No other member can ever take it, so a handle always means the same person.', False, "a handle, its card")
w275('screen.join.tip.admins', 'members who invite and manage members', False, "administrators, their card")
w275('screen.join.tip.admins_count', '{group} has one, {name}', False, "administrators, their card")
w275('screen.join.tip.admins_why', 'They know who you are even under a pen name, and see the ties you declare.', False, "administrators, their card")
w275('screen.join.tip.contribute', 'what this invitation lets you do', False, "Contribute, its card")
w275('screen.join.tip.contribute_is', 'add to the record, open questions, take part in projects', False, "Contribute, a capability, its card")
w275('screen.join.tip.contribute_why', 'It sets what you can do once you join; an administrator can change it later.', False, "Contribute, its card")
w275('screen.join.tip.expires', 'an invitation lasts seven days', False, "the invitation's expiry, its card")
w275('screen.join.tip.expires_by', 'this one created by {name} on {date}', False, "the invitation's expiry, its card")
w275('screen.join.tip.expires_why', 'After that the link stops working and {name} must create a new one.', False, "the invitation's expiry, its card")
w275('screen.join.tip.penname', 'a handle that is not the name people know you by', False, "a pen name, its card")
w275('screen.join.tip.penname_known', 'the administrators still know who you are', False, "a pen name, its card")
w275('screen.join.tip.penname_why', 'Shields you from pressure if a published case names your work.', False, "a pen name, its card")
w275('screen.matter.tip.title', 'what your team is pursuing about this one problem, judged {determination} with {rule} and {status}, from the first letter to the outcome.', False, "the matter's title, its explanation, after the matter's own name")
w275('screen.matter.tip.noncompliant', 'the act did not meet the rule it is measured against', False, "Noncompliant, its card")
w275('screen.matter.tip.noncompliant_by', 'recorded by a member, with a reason', False, "Noncompliant, its card")
w275('screen.matter.tip.noncompliant_why', 'What the team has determined from its evidence, not what a court has decided.', False, "Noncompliant, its card")
w275('screen.matter.tip.established', 'the determination is settled on the record', False, "Established, its card")
w275('screen.matter.tip.established_bar', "its finding meets the project's bar, {bar}", False, "Established, its card")
w275('screen.matter.tip.established_why', 'Strong enough to act on: escalating does not wait for more evidence.', False, "Established, its card")
w275('screen.matter.tip.clock', 'a deadline {government} must answer by starts running, tracked in your queue', False, "the stage Clock starts, its card")
w275('screen.matter.tip.clock_why', 'Advancing to it is the next act offered here; it normally follows the reply due {date}, or its absence.', False, "the stage Clock starts, its card")
w275('screen.members.tip.hosting', "the Cloudflare account the team's Civicsmith runs in", False, "the hosting account, its card")
w275('screen.members.tip.hosting_holder', 'holder recorded at setup: {name}', False, "the hosting account, its card")
w275('screen.members.tip.hosting_why', 'Whoever signs in to it controls everything; with one administrator, the team depends on {name} and on whoever holds it.', False, "the hosting account, its card")
w275('screen.members.tip.cover_name', 'cover name {cover}', False, "a member's card")
w275('screen.members.tip.onlyadmin', "The team's only administrator: the team depends on her and the hosting account.", False, "the only administrator's card")
w275('screen.members.tip.cover', 'how the team knows a member, beside their handle', False, "a cover, its card")
w275('screen.members.tip.cover_legal', 'not a legal name', False, "a cover, its card")
w275('screen.members.tip.cover_when', 'recorded when they are invited', False, "a cover, its card")
w275('screen.members.tip.cover_why', 'Lets administrators know who each handle is without the record holding legal names.', False, "a cover, its card")
w275('screen.members.tip.contribute_why', 'Every member here holds it; it is what an invitation grants by default.', False, "Contribute, a capability, its card")
w275('screen.members.tip.administer', "invite and remove members, hold the team's key, change the team's settings", False, "Administer, a capability, its card")
w275('screen.members.tip.administer_why', 'Only {name} holds it, so the team depends on {name_2} alone.', False, "Administer, a capability, its card")
w275('screen.members.tip.owner', 'owner of {project}', False, "a member's card")
w275('screen.members.tip.owner_why', "Signs the team's cases for that project.", False, "a project owner's card")
w275('screen.members.tip.workson', 'works on {project}', False, "a member's card")
w275('screen.members.tip.waiting_why', 'Has a question waiting on a held document.', False, "a member's card")
w275('screen.members.tip.notconfirmed', 'not yet confirmed here', False, "declared expertise, its card")
w275('screen.members.tip.notconfirmed_why', 'Confirming it records that an administrator checked it; members ask her to check calculations either way.', False, "declared expertise, its card")
w275('screen.members.tip.story_why', 'Runs the story that cites {edition}.', False, "a reporter member's card")
w275('screen.members.tip.invited', 'invited to contribute as {handle}', False, "an invitation's card")
w275('screen.members.tip.invited_link', 'link works once, for seven days', False, "an invitation's card")
w275('screen.members.tip.invited_why', 'Withdraw it if it went to the wrong person; until it is used, anyone holding the link can join.', False, "an invitation's card")
# --- end DEC-275

# --- DEC-276: explanations keyed, screens money to wizards (and project, the last left). As DEC-275: words about a sample
# record are marked .mk-data in the drawing; an act's button that only restated its general help (act.<op>.does) now draws
# that help; an override that says more on its screen is keyed act.<op>.here.<screen>; the rest is keyed here, a template
# where it carries data.
def w276(key, en, prot=False, note=''):
    W.append(dict(key=key, en=en, protected=prot, note='DEC-276' + (': ' + note if note else '')))
w276('act.recordfact.here.money', 'Reads a new amount from a document into this trail, with its stage (budgeted, committed or paid), its accounting period, who paid and who received it, and the passage it comes from.', False, "Read a figure on a money trail, where no figure is open yet")
w276('act.recordfact.here.money_where', "Records where {figure} went, from a document that says so, citing its passage. It is added beside this figure as its own fact with its own source; {document}'s reading is not changed.", False, "Read it from another source, at a figure's undetermined payee")
w276('act.acquire.here.money', "Has your team's Civicsmith fetch {document} from {government}'s website itself and keep exactly what it sent. If it matches the uploaded copy, the figure's source can be graded A.", False, "Get the city's own copy, on a figure read from an uploaded copy")
w276('act.findin.here.money_where', 'Searches every document in {project} for where {figure} went: a fund, account or department receiving it. Each result shows its passage; nothing is recorded until you record it.', False, "Look for it in this project, at a figure's undetermined payee")
w276('act.findin.here.money_when', 'Searches every document in {project} for the day {figure} was posted: a ledger line, a journal entry, a {council} report. Each result shows its passage; nothing is recorded until you record it.', False, "Look for its date in this project, at a figure's undetermined date")
w276('act.hypothesishold.here.money', 'Saves what you think {figure} is, for example "{example}", beside it as your hunch. It is labeled as yours, is never evidence, and never changes the figure.', False, "Keep my reading as a hunch, on a figure (act.hypothesishold.does speaks of a question)")
w276('act.include.here.money_picked', "Brings every picked figure into this trail's comparison, with one reason you give for all of them; each can be left out again on its own.", False, "Include with a reason, in the hold strip of picked figures")
w276('act.exclude.here.money_picked', "Takes every picked figure out of this trail's comparison, with one reason you give for all of them. They stay listed, marked as left out.", False, "Leave out with a reason, in the hold strip of picked figures")
w276('act.reconcile.here.money_picked', 'With exactly two figures picked, sets them side by side and names every way they differ: amount, stage, basis, period, rounding. Nothing is merged or changed.', False, "Compare the two, in the hold strip of picked figures")
w276('screen.money.tip.title', "{name}'s money trail of {count} figures read from {sources}, following money out of {fund}, mostly to {fund_2}, in {period}.", False, "the trail's title, its explanation")
w276('screen.money.tip.graph', "The trail drawn: {fund} in the middle, each figure a double line to where it went with its amount, stage and date, and {council}'s adoption of the budget as a dotted step. A figure whose payee the source does not state ends at “Not stated”; {name}'s hunch is a dashed gray lead. Click a fund to follow the money on from it.", False, "the graph section, its explanation")
w276('screen.money.tip.gapfilter', 'Show only the figures with something undetermined, so you can add evidence to each in turn. Press again for every figure.', False, "the filter of figures with something undetermined, its explanation")
w276('screen.money.tip.gap', 'Open this figure at what is undetermined, with the evidence that would help.', False, "an undetermined cell, its explanation")
w276('screen.money.tip.fund_why', "Transfers out of it are what {name}'s question asks were authorized.", False, "a fund's card")
w276('screen.money.tip.adopted', 'the amount in the budget {council} adopted for the year', False, "the stage Adopted, its card")
w276('screen.money.tip.adopted_why', 'Set against the paid figure to show what moved beyond the budget.', False, "the stage Adopted, its card")
w276('screen.money.tip.paid', "what was paid, from {government}'s annual financial report", False, "the stage Actual (paid), its card")
w276('screen.money.tip.paid_why', '{amount} above the adopted figure for the same transfer.', False, "the stage Actual (paid), its card")
w276('screen.money.tip.gap_why', 'The gap the trail rests on; What authorized it looks for the act behind the extra.', False, "the gap between two figures, its card")
w276('screen.money.tip.budget', "{council}'s spending plan for the year", False, "the adopted budget, its card")
w276('screen.money.tip.budget_why', 'The source of the adopted figure.', False, "the adopted budget, its card")
w276('screen.money.tip.report', "{government}'s year-end accounts", False, "the annual financial report, its card")
w276('screen.money.tip.report_why', "The source of the paid figure; its basis differs from the budget's, so figures need matching first.", False, "the annual financial report, its card")
w276('screen.security.tip.raised', "Raised: well above your team's usual at some point in the period, and nothing got through.", False, "the level's explanation")
w276('screen.security.tip.high', 'High: well above the usual and still going on, or something unusual got through; only then are administrators told, in their queue.', False, "the level's explanation")
w276('screen.security.tip.ordinary', 'Ordinary: around the usual.', False, "the level's explanation")
w276('screen.security.tip.hour_signin', 'Refused sign-ins, {from}–{to} {day}: {n} refused sign-ins.', False, "an hour's square, its explanation")
w276('screen.security.tip.hour_credential', 'Refused keys and links, {from}–{to} {day}: {n} refused keys and links (an expired invitation, a wrong website key, a revoked agent credential).', False, "an hour's square, its explanation")
w276('screen.security.tip.hour_rate', 'Requests over the limit, {from}–{to} {day}: {n} requests turned away for coming too fast.', False, "an hour's square, its explanation")
w276('screen.security.tip.hour_blocked', "Blocked by Cloudflare, {from}–{to} {day}: {n} requests Cloudflare blocked before they reached your team's Civicsmith (where your plan reports it).", False, "an hour's square, its explanation")
w276('screen.security.tip.hour_handover', 'Refused hand-overs, {from}–{to} {day}: {n} hand-overs refused at the doorbell (too many, too large).', False, "an hour's square, its explanation")
w276('screen.security.tip.hour_usual', 'Usual for an hour: about {n}.', False, "an hour's square, its explanation's second sentence")
w276('shell.card.roster', "{post} since {date}, from {government}'s roster", False, "a person's card, the post they hold; {post} the office's own name")
w276('shell.card.cited', 'Cited in {n} documents your team holds.', False, "a person's card")
w276('screen.setup.tip.signed', 'Signed {n} documents your team holds; named in {questions}.', False, "an office holder's card")
w276('screen.setup.tip.account', "the hosting account your team's Civicsmith runs in", False, "the Cloudflare account, its card")
w276('screen.setup.tip.account_owner', 'owner recorded below: {name}', False, "the Cloudflare account, its card")
w276('screen.setup.tip.account_why', 'It is the way back in if the one-time password is lost, and whoever holds it controls everything.', False, "the Cloudflare account, its card")
w276('screen.setup.tip.shortname', "your team's short name", False, "the short name, its card")
w276('screen.setup.tip.shortname_why', 'Changing the team name here leaves it as it is.', False, "the short name, its card")
w276('screen.setup.tip.seat', 'a seat on {council}', False, "a council seat, its card")
w276('screen.setup.tip.seat_why', "Confirming the seat lets the record follow whoever holds it, not only today's holder.", False, "a council seat, its card")
w276('screen.setup.tip.claude', 'runs the assistant only if your team chooses one of the options below', False, "Claude, its card")
w276('screen.setup.tip.claude_why', "A member's question goes to Anthropic only when they ask, under whichever account serves them.", False, "Claude, its card")
w276('screen.setup.tip.workers_why', "Members can sign in with their own Claude subscription only if your team's Civicsmith is on it.", False, "Workers Paid, its card")
w276('screen.setup.tip.limit', "the most the assistant may spend per member each day on the team's key", False, "the daily limit, its card")
w276('screen.setup.tip.limit_why', "Caps what the team pays Anthropic; it binds only members served by the team's key.", False, "the daily limit, its card")
w276('screen.setup.tip.shield', 'laws in many states, California among them, that can protect journalists from being forced to reveal unpublished sources', False, "shield laws, their card")
w276('screen.setup.tip.shield_why', 'A member such as a reporter may have protections the rest of the team does not.', False, "shield laws, their card")
w276('screen.site.tip.current', 'the page you are on', False, "a page of civicsmith.org in its menu, when it is the one open")
w276('screen.site.tip.front', 'the front page of civicsmith.org: what Civicsmith is and how a team uses it', False, "What Civicsmith is, in the menu")
w276('screen.site.tip.start', 'for a team that has decided to create its own copy: what it needs, who holds what, what happens step by step, and what it costs', False, "Start a team, in the menu")
w276('screen.site.tip.groups', 'the teams that chose to be listed, with what each has published', False, "Teams at work, in the menu")
w276('screen.start-send.tip.title', 'Start "{action}": the first step of that option in the plan. Nothing is sent until you confirm; this shows what it will say and what it rests on.', False, "the screen's title, its explanation")
w276('screen.start-send.tip.kind', 'a kind of action', False, "a records request, its card")
w276('screen.start-send.tip.request', 'asks an office for copies of public records under the public records law', False, "a records request, its card")
w276('screen.start-send.tip.request_reply', 'the office must reply within its window', False, "a records request, its card")
w276('screen.start-send.tip.request_why', 'This action only asks for records; it accuses no one.', False, "a records request, its card")
w276('screen.start-send.tip.hypothetical', 'the matter is assumed, not shown', False, "a hypothetical matter, its card; never 'subject' (DEC-114)")
w276('screen.start-send.tip.hypothetical_none', 'no finding supports it yet', False, "a hypothetical subject, its card")
w276('screen.start-send.tip.hypothetical_why', 'Since nothing is shown, the request asserts no breach and asks only for records.', False, "a hypothetical subject, its card")
w276('screen.start-send.tip.law', 'The public records law', False, "the law the team's profile names, its card")
w276('screen.start-send.tip.law_answer', 'an office must answer a records request within {days}', False, "the law the team's profile names, its card")
w276('screen.start-send.tip.law_why', "The request is made under it, so the office's duty to reply comes from it, not from Civicsmith.", False, "the law the team's profile names, its card")
w276('screen.start-send.tip.breach', 'whether the action tells the office it broke a rule', False, "Asserts a breach, its card")
w276('screen.start-send.tip.breach_why', "A plain request can't be read as an accusation; a complaint later would be.", False, "Asserts a breach, its card")
w276('screen.start-send.tip.approving', 'fixes the text on the record exactly as it will be sent', False, "approving, its card")
w276('screen.start-send.tip.approving_version', 'a later change is a new version', False, "approving, its card")
w276('screen.start-send.tip.approving_why', 'What the office receives must match what the record says was sent, so approve only the final wording.', False, "approving, its card")
w276('screen.start-send.tip.hand', "every outward message goes by a member's own hand", False, "Civicsmith sends nothing, its card")
w276('screen.start-send.tip.hand_keeps', 'the record keeps the approved text and the date you record', False, "Civicsmith sends nothing, its card")
w276('screen.start-send.tip.hand_why', 'Record the sending on the day it goes: the {days} clock counts from it.', False, "Civicsmith sends nothing, its card")
w276('screen.request.tip.role', 'the request names the office, not the person', False, "addressed by role, its card")
w276('screen.request.tip.role_why', 'If the post changes hands before the reply, the request still stands.', False, "addressed by role, its card")
w276('screen.ties.tip.employer', 'disclosed without naming you', False, "your employer, a declared tie, its card")
w276('screen.ties.tip.employer_why', 'If a case the team publishes concerns it, the case says a member of the team works there.', False, "your employer, a declared tie, its card")
w276('screen.ties.tip.admins_why', 'Besides you, only she can see this list.', False, "administrators, their card")
w276('screen.translations.tip.undetermined', 'a status the record gives when it cannot settle something, and says why', False, "Undetermined, its card")
w276('screen.translations.tip.undetermined_why', 'A loose translation would change what members think the record shows.', False, "Undetermined, its card")
w276('screen.translations.tip.release', 'translated by Civicsmith and shipped with this version', False, "From the release, its card")
w276('screen.translations.tip.release_not', "not your team's own wording", False, "From the release, its card")
w276('screen.translations.tip.release_why', 'Your team can still change it; the change is recorded with what it replaced.', False, "From the release, its card")
w276('screen.translations.tip.second', 'a protected word changed by one speaker waits for another granted speaker or an administrator', False, "Second check, its card")
w276('screen.translations.tip.second_why', 'Until {name} or {name_2} confirms it, members reading {language} see the English.', False, "Second check, its card")
w276('screen.translations.tip.reasoned', 'the mark on an act that asks for a reason, which becomes part of the record', False, "Reasoned, its card")
w276('screen.translations.tip.reasoned_why', '{name}\'s suggestion, "{suggestion}", waits for a granted speaker to keep it or explain why not.', False, "Reasoned, its card; {suggestion} a member's own words")
w276('act.actionmove.here.queue', 'Marks this unsent request as dropped, with your reason, so it stops waiting. Nothing was sent, so the office never sees it.', False, "Drop the request, with a reason, on an unsent request in the queue")
w276('act.queuemute.here.queue_kind', 'Lets this kind of item reach your queue again, from now on.', False, "Turn back on, for a muted kind of item (act.queuemute.does describes muting)")
w276('act.queuemute.here.queue_project', "Lets this project's items reach your queue again, from now on.", False, "Turn back on, for a muted project (act.queuemute.does describes muting)")
w276('screen.queue.tip.securityfix_waits', "It still waits for an administrator's choice; Not now brings it back the next day instead of in two weeks.", False, "a security fix in the queue, its explanation's second sentence")
w276('screen.queue.tip.filings_why', 'The hint is only as complete as these filings; a missing year would hide a match.', False, "the filings a hint compared, their card")
w276('screen.queue.tip.false', "this check's past hints that members looked into and found false", False, "a hint's past false matches, their card")
w276('screen.queue.tip.false_why', "Check the firm's name in the filing yourself before opening a question.", False, "a hint's past false matches, their card")
w276('screen.updates.tip.running', "The release your team's Civicsmith runs, and when it last asked civicsmith.org for the list of releases. The check sends no team name, member, cookie or credential, and only a release signed by Civicsmith and newer than the one running is ever shown here.", False, "the section of the running release, its explanation")
w276('screen.updates.tip.history', 'Every release offered to your team and what was done with it: installed, with the date and who allowed it in Cloudflare, or skipped, with the reason given. Every administrator sees this list.', False, "the section of past releases, its explanation")
w276('screen.theme.tip.placed', 'What members placed in this theme, each with who placed it, when and their note. Documents you cannot open are left out.', False, "the section of placements, its explanation")
w276('screen.theme.tip.removed', 'Placements taken out and hunches rejected, each with who, when and why. They stay listed so the reason is never lost.', False, "the section of what was taken out, its explanation")
w276('screen.open-file.tip.title', "{title}: {government}'s PDF that {name} captured from its website on {date}. Before it opens, this says how risky opening it is and why.", False, "the file's title, its explanation; {title} the document's own")
w276('screen.open-file.tip.threat', "{threat}: the scanner's name for what it found. {format}: in {file}. {kind}: the kind of threat. {variant}: the scanner's own label for this variant.", False, "a scanner's finding, its explanation; {threat} the scanner's own name for it, {format}, {kind} and {variant} its parts")
w276('ai.usage.meter.month_project', "This month on the project's account", False, "a use meter's name, its explanation's first line")
w276('screen.projectai.tip.explore', 'Exploring this month, on top of it', False, "a use meter's name, its explanation's first line")
w276('shell.group.signed', 'its published cases are signed by its project owners', False, "the team's card on its public pages")
w276('shell.pubfoot.signature', "an owner of the project signed this edition with their key. Anyone can check it, and recreate the case, with the open checker, without the team's help.", False, "the signature at the foot of a public case, its explanation")
w276('shell.credit.neither', 'Civicsmith is software; it neither wrote nor checked this case.', False, "Made with Civicsmith, its explanation's second sentence")
w276('screen.project.tip.title', "your team's project asking {description}. Its questions, how strong each is against the project's bar, its members and its plan are here.", False, "the project's title, its explanation; {description} the project's own words")
w276('screen.project.tip.stage_why', 'The project stays here until a question reaches {bar}.', False, "the project's stage, its card")
w276('screen.project.tip.bar', '{grade} on capture and {grade_2} on connection', False, "the project's bar, its card")
w276('screen.project.tip.bar_meets', 'a question meets it when both of its grades reach {grade}', False, "the project's bar, its card")
w276('screen.project.tip.bar_why', 'The main question is at {grade} and {grade_2}: one step short, on {axis}.', False, "the project's bar, its card")
w276('act.promote.here.project', 'Opens the question and puts it in this project; it opens on its own page, ready for its first passage.', False, "Open a question, in a project's form for a new question (act.promote.does speaks of a hint, chain or suggestion)")
w276('screen.question.tip.title', "{question}: {name}'s question in {project}, opened {date}. It tests {government} against {rule}; what supports it and what cuts against it are listed below.", False, "the question's title, its explanation; {question} the question's own words")
w276('screen.question.tip.computed_why', 'Anyone can rerun {figure} from {source} and get the same count.', False, "a computed fact's card")
w276('screen.question.tip.hunch_why', "{name}'s hunch is what {action} is meant to test.", False, "a hunch's card")
w276('act.search.here.people', "Searches the people and organizations your team's record follows, by name, a name they are also known by, or office. To search inside documents, use Find.", False, "Search, on People (act.search.does speaks of everything the team holds)")
w276('screen.people.tip.yours', 'Named in {projects}, the projects you work on. Newest added first.', False, "the section of people in your projects, its explanation")
w276('act.explore.here.person', 'Looks for chains of links from {name} to another person, organization, payment or project you choose, each step cited and graded.', False, "Explore connections, on a person or organization")
w276('act.entitycreate.here.people', "Adds a person or organization your team's record should follow: the name, whether a person or an organization, and your note on who they are and why the team follows them. Facts about them are then added from documents, each cited.", False, "Add someone the record follows, on People")
w276('screen.person.tip.title', "{name}: {post} since {date}, named in {n} documents your team holds. Every fact about them here cites the document it comes from.", False, "the person's title, its explanation")
w276('screen.person.tip.graph_more', 'Money would show here too; their Form 700 for {year} reports no interests, so no money line is drawn. Click anything to make it the center.', False, "the graph section on a person, its explanation, after screen.person.connections.holds")
w276('screen.person.tip.roster', "{place}'s published list of officials and their posts", False, "a city roster, its card")
w276('screen.person.tip.roster_why', 'The source for the current post; when it changes, this page shows who holds the office next.', False, "a city roster, its card")
w276('screen.person.tip.minutes', "{council}'s official record of its meetings", False, "council minutes, their card")
w276('screen.person.tip.minutes_why', 'The source for the earlier post, {from} to {to}.', False, "council minutes, their card")
w276('screen.person.tip.post', 'a post in {department}', False, "a post, its card")
w276('screen.person.tip.post_held', 'held by {name} {from}–{to}, from {source}', False, "a post, its card")
w276('screen.person.tip.post_why', 'The post that links {name} to "{alias}" in {source}.', False, "a post, its card")
w276('screen.person.tip.register_why', 'Following it brings any change to this license into your queue.', False, "a license register, its card")
w276('screen.person.tip.alias_why', 'If the claim is wrong, the {year} facts belong to someone else; withdraw it with a reason.', False, "a name claimed as the same person, its card")
w276('screen.person.tip.match', 'rests on the same post held on the cited dates, not on a shared identifier', False, "a subject match grade, its card")
w276('screen.person.tip.match_why', 'A shared identifier, such as a license number on both records, would make it easier to check.', False, "a subject match grade, its card")
w276('screen.person.tip.voters', "the county's voter registration list", False, "a voter file, its card")
w276('screen.person.tip.voters_source', 'the source of the home address being removed', False, "a voter file, its card")
w276('screen.person.tip.voters_why', 'The value taken from it is what this removal erases for good.', False, "a voter file, its card")
w276('screen.timeline.tip.title', "what happened in {subject}, in order, {government}'s acts and your team's in two lanes.", False, "the timeline's title, its explanation")
w276('screen.timeline.tip.council', 'its votes are recorded in minutes on Legistar', False, "the council, its card")
w276('screen.timeline.tip.council_why', 'Approved {act} in {date}; no vote of {council} is recorded for {change}.', False, "the council, its card")
w276('screen.timeline.tip.month', 'the source gives a month but no day', False, "Month known, its card")
w276('screen.timeline.tip.month_never', 'never guessed to a day', False, "Month known, its card")
w276('screen.timeline.tip.month_why', 'Why this event and {event} cannot be put in order.', False, "Month known, its card")
w276('screen.timeline.tip.signed_why', 'Signed {act}; no vote of {council} stands behind it in this record.', False, "an office that signed an act, its card")
w276('screen.timeline.tip.dated', 'dated {month}, month only', False, "a document dated to the month, its card")
w276('screen.timeline.tip.dated_why', 'Its order against {event} is undetermined; a source dated to the day would help order them.', False, "a document dated to the month, its card")
w276('screen.timeline.tip.progressions', 'Each matter in this project the team follows through a progression: a declared run of steps, with the documents threaded to them.', False, "the section of matters followed through a progression, its explanation")
w276('screen.timeline.tip.steps', "The progression's steps in order, each with the documents threaded to it and its grade.", False, "the section of a matter's steps, its explanation")
w276('screen.timeline.tip.sure', 'Once two steps hold documents, the chain takes the grade of its weakest document.', False, "the section How sure the chain is, its explanation")
w276('screen.timeline.tip.findings', 'Each finding stays listed until a member sets it aside with a reason, deferred or dismissed; it is never hidden.', False, "the section of a progression's findings, its explanation")
w276('screen.timeline.tip.stepsdef', 'Each step: what must come before it, how soon, whether it is required, and how many documents it holds.', False, "the section of a progression's steps, its explanation")
w276('screen.timeline.tip.basis', "Where the steps come from. A step that is not in the basis is the team's own expectation, and says so.", False, "the section of a progression's basis, its explanation")
w276('screen.proceeding.tip.title', '{caption}: a {court} case the record follows, shown under a neutral label, "{label}". Its parties, filings and orders, with their dates, are here.', False, "the proceeding's title, its explanation; {caption} the case's own caption")
w276('screen.proceeding.tip.court', 'the state trial court for {place}', False, "a court, its card")
w276('screen.proceeding.tip.court_why', 'Where this case is heard; its register lists every filing.', False, "a court, its card")
w276('screen.proceeding.tip.label', 'a short name for a proceeding that takes no side', False, "a neutral label, its card")
w276('screen.proceeding.tip.label_used', 'used wherever the case is named', False, "a neutral label, its card")
w276('screen.proceeding.tip.label_why', 'Members and readers see "{label}", not either party\'s framing.', False, "a neutral label, its card")
w276('screen.proceeding.tip.petitioner', 'the name your team, {group}, is a party under', False, "the petitioner, its card")
w276('screen.proceeding.tip.petitioner_why', 'Your team is a party, so its own filings belong on this register.', False, "the petitioner, its card")
w276('screen.proceeding.tip.respondent', "the party the court's orders bind here", False, "the respondent, its card")
w276('screen.proceeding.tip.respondent_why', 'The party ordered to produce {records}.', False, "the respondent, its card")
w276('screen.proceeding.tip.order', 'the ruling on whether the petition states a claim the court can hear', False, "an order on demurrer, its card")
w276('screen.proceeding.tip.order_why', 'New on the register; {order} is held from it.', False, "an order on demurrer, its card")
w276('screen.proceeding.tip.opposition', 'a written answer to {filing}', False, "an opposition, its card")
w276('screen.proceeding.tip.opposition_why', 'The filing the {date} order ruled on, with {filing}.', False, "an opposition, its card")
w276('screen.standard.tip.title', "{standard}: a requirement {government} set itself, in {source}, a {department} policy in force since {year}. Your team's questions test {government} against it.", False, "the standard's title, its explanation; {standard} the standard's own words")
w276('screen.standard.tip.inforce', 'when this version of the instruction took effect', False, "In force since, its card")
w276('screen.standard.tip.inforce_copy', 'revised {year}, per the copy {name} captured', False, "In force since, its card")
w276('screen.standard.tip.inforce_why', 'Every report in {source} falls under this version, so one standard covers them all.', False, "In force since, its card")
w276('screen.standard.tip.department', 'run by {office}, held today by {name}', False, "a department, its card")
w276('screen.standard.tip.department_why', 'The department that set this standard for itself, and whose own work orders test it.', False, "a department, its card")
w276('screen.standard.tip.proposed', 'a requirement suggested for the record', False, "a proposed standard, its card")
w276('screen.standard.tip.proposed_held', 'held as a standard only once a member adopts it, with a reason', False, "a proposed standard, its card")
w276('screen.standard.tip.proposed_why', 'Until someone adopts it, nothing in the project is measured against it.', False, "a proposed standard, its card")
w276('screen.plan.tip.title', "{plan}: {name}'s action plan, opened {date} when the inquiry began, about {matter}. Its options, the order to try them and what to check are here.", False, "the plan's title, its explanation; {plan} and {subject} the plan's own words")
w276('screen.plan.tip.scenario', 'the scenario laid out so far', False, "a scenario, its card")
w276('screen.plan.tip.scenario_phase', 'phase {n}: {step}, then a checkpoint judged by a member', False, "a scenario, its card")
w276('screen.plan.tip.scenario_why', 'The check above is about this scenario: it has no branch for a refusal or a stall.', False, "a scenario, its card")
w276('screen.plan.tip.hostile', 'a refusal, obstruction or retaliation in answer to an action', False, "a hostile response, its card")
w276('screen.plan.tip.hostile_example', 'for example a blanket denial, or silence past the due date', False, "a hostile response, its card")
w276('screen.plan.tip.hostile_why', 'Scenario {scenario} says nothing about what follows one; a branch can be added before the reply is due on {date}.', False, "a hostile response, its card")
w276('screen.plan.tip.hypothetical', 'a matter the plan assumes', False, "a hypothetical matter, its card; never 'subject' (DEC-114)")
w276('screen.plan.tip.hypothetical_why', 'The options here rest on something unproven; the inspection logs could show it or rule it out.', False, "a hypothetical subject, its card")
w276('screen.plan.tip.enddate', 'the date a law or rule closes an option, such as a filing deadline or a response window', False, "a regulated end date, its card")
w276('screen.plan.tip.enddate_why', 'Sorting by it puts first the options that lapse if the team waits.', False, "a regulated end date, its card")
w276('screen.plan.tip.alternative', 'an alternative scenario, not laid out yet', False, "an alternative scenario, its card")
w276('screen.plan.tip.alternative_start', 'would start with {option}', False, "an alternative scenario, its card")
w276('screen.plan.tip.alternative_why', 'The fallback if {office} refuses or stalls on {action}.', False, "an alternative scenario, its card")
w276('screen.plan.tip.checkpoint', 'judged by a member, with a reason, once the reply comes', False, "a checkpoint, its card")
w276('screen.plan.tip.checkpoint_why', 'Dates of inspection and repair are what would show whether a report was closed before the repair.', False, "a checkpoint, its card")
w276('screen.review-copy.tip.title', "lets named outside readers see the draft of {case}, {edition}, before it is published. You can stop a reader's access at any time.", False, "the screen's title, its explanation")
w276('screen.review-copy.tip.reader', 'an outside reader named by {name}', False, "an outside reader, their card")
w276('screen.review-copy.tip.reader_reviewing', 'Reviewing {edition} before it is published.', False, "an outside reader, their card")
w276('screen.review-copy.tip.reader_why', 'An outside reader, not a member: the comment advises, and the team decides.', False, "an outside reader, their card")
w276('screen.published.tip.edition', 'the current edition of this case', False, "the edition, its card")
w276('screen.published.tip.edition_corrects', 'corrects {edition}, which stays readable', False, "the edition, its card")
w276('screen.published.tip.edition_why', "Corrections, if any, come as a new edition listed on the case's public docket.", False, "the edition, its card")
w276('screen.published.tip.group', 'the team that made this case', False, "the team, its card")
w276('screen.published.tip.group_why', 'The authors; the case is signed by one of them and can be checked without them.', False, "the team, its card")
w276('screen.published.tip.bar', 'here {grade} for both grades', False, "the project's bar, its card")
w276('screen.published.tip.bar_why', "This finding meets it; the bar is the team's own, set before publishing.", False, "the project's bar, its card")
w276('screen.published.tip.capture', 'how well a document is held, A to D', False, "a capture grade, its card")
w276('screen.published.tip.capture_why', 'A grade says how checkable the documents are, never whether the finding is true.', False, "a capture grade, its card")
w276('screen.published.tip.connection', 'how firmly the documents are linked to the claim, A to D', False, "a connection grade, its card")
w276('screen.published.tip.connection_why', 'The link from these documents to the finding is firm, though not the firmest.', False, "a connection grade, its card")
w276('screen.published.tip.lane', 'what the team itself did, kept apart from what the government did', False, "the team's lane, its card")
w276('screen.published.tip.lane_why', "The team's own acts are never mixed in with {government}'s.", False, "the team's lane, its card")
w276('screen.published.tip.approved', 'approved by {council} on {date}', False, "a lease amendment, its card")
w276('screen.published.tip.recorded', 'recorded in {council} minutes, item {n}', False, "a lease amendment, its card")
w276('screen.published.tip.approved_why', 'The change {council} did vote on; {change} had no vote of its own.', False, "a lease amendment, its card")
w276('screen.published.tip.title', 'the office, not the person who held it', False, "named by title, its card")
w276('screen.published.tip.title_why', "The finding concerns the office's act, not who held the post in {date}.", False, "named by title, its card")
w276('screen.review-copy.tip.ends', 'Review copy ends {date}', False, "the review copy's end, its card")
w276('screen.review-copy.tip.ends_stops', "after that the reader's view stops", False, "the review copy's end, its card")
w276('screen.review-copy.tip.ends_sooner', 'you can stop it sooner', False, "the review copy's end, its card")
w276('screen.review-copy.tip.ends_why', 'Comments must come in by then; a later reading needs a new review copy.', False, "the review copy's end, its card")
w276('screen.review-copy.tip.embargo', 'a newsroom may read it before publication but not report on it until it is public', False, "an embargoed advance copy, its card")
w276('screen.review-copy.tip.embargo_why', '{newsroom} can prepare its story; nothing runs before {edition} is published.', False, "an embargoed advance copy, its card")
w276('screen.review-copy.tip.links', "Made when you share with a named reader: one link for that reader, shown here once. It carries a secret, not the reader's name, so it works only while the sharing stands.", False, "the section of readers' links, its explanation")
w276('screen.review-copy.tip.link', 'opens the draft as it stands, for the reader you named, until {date} or until you stop sharing.', False, "the reader's link, its explanation")
w276('screen.review-copy.tip.noemail', 'Civicsmith sends no email: you copy the link and send it yourself, by whatever means you trust.', False, "the reader's link, its explanation")
# --- end DEC-276
# --- DEC-279 (Bob's review of the live setup screen, K3446, B240): setup rewritten for a newly made administrator. Every part
# says first what it is for; long explanations move into hover help; the parts are numbered cards that open and close.
def w279(key, en, prot=False, note=''):
    W.append(dict(key=key, en=en, protected=prot, note='DEC-279' + (': ' + note if note else '')))
SETUP279 = {
  'screen.setup.lede': "Welcome. Civicsmith is installed and waiting for you. First, claim it, so that only you can run it; it takes about two minutes. Then tell it a little about your team. Only the claim is needed today: every other part starts with a safe choice, and you can change any of it later in Settings.",
  'screen.setup.claim': 'Make it yours',
  'screen.setup.otp.help': 'Already filled in if you came straight from the installer.',
  'screen.setup.handle': 'Your handle',
  'screen.setup.handle.help': "The name you sign in with, shown on your work and on every case you sign. Choose it with care: it can't be changed later.",
  'screen.setup.own': 'Your password',
  'screen.setup.own.help': 'At least 12 characters. From now on you sign in with your handle and this password.',
  'screen.setup.name.field': "Your team's name",
  'screen.setup.name.help': 'Shown at the top of every page, on invitations and on everything your team publishes. You can change it any time.',
  'screen.setup.name.now': 'Saved. Your team is now called {name}.',
  'screen.setup.domain': 'Its address',
  'screen.setup.domain.help': "Civicsmith gives you one small file to put on your website. Once it's there, anyone reading what your team publishes can check that it really comes from you. Whoever looks after your website can do this in a few minutes.",
  'screen.setup.places': 'Where your team works',
  'screen.setup.places.choose': 'Your place',
  'screen.setup.places.now': 'Your place',
  'screen.setup.places.help': 'Not listed? Choose “Somewhere else”. Everything still works; you enter deadlines and offices yourself.',
  'screen.setup.places.chosen': 'You chose {place} when you installed. Change it if you need to.',
  'screen.setup.place.wanted': 'Where is your team?',
  'screen.setup.place.wanted.help': "When an update brings its rules, Civicsmith tells you, and you can switch to it here. What you type stays in your team's Civicsmith and is never sent anywhere.",
  'screen.setup.languages': 'Languages your members read',
  'screen.setup.offices': 'The officials you deal with',
  'screen.setup.offices.what': "Civicsmith can fill in the public offices of {place}, and who holds each one today, from the place's own records. Check the list, then confirm it. You can add others at any time.",
  'screen.setup.offices.none': "Civicsmith doesn't know the offices of {place} yet, so this list starts empty. Add the offices your team deals with, now or whenever they come up. When an update brings their rules, you'll be told, and the offices you added stay.",
  'screen.setup.office.note': 'Anything your team should know about it (optional)',
  'screen.setup.assistant': 'The AI assistant',
  'screen.setup.assistant.what': "Civicsmith can include an AI assistant, built on Anthropic's Claude. Members ask it, in everyday words, to find, read and check things in your team's material. It works only from what your team holds, gives legal information but never legal advice, and never decides, signs or sends anything. Everything in Civicsmith also works without it.",
  'screen.setup.keepaway': 'No, keep our material away from AI',
  'screen.setup.keepaway.why': 'Tell your members why',
  'screen.setup.keepaway.help': 'Required. Every member will see it.',
  'screen.setup.assistant.own': 'A member who wants the assistant connects their own Claude subscription or API key. It serves only them, at their own cost, and costs your team nothing.',
  'screen.setup.assistant.paid': "One Anthropic API key, paid for by your team, serves every member who has no account of their own. A member's own account still comes first.",
  'screen.setup.key': "Your team's Anthropic API key",
  'screen.setup.key.help': "Made in Anthropic's Console, under an account your team pays for. Civicsmith locks it away and never shows it again.",
  'screen.setup.limit': 'The most each member may use per day',
  'screen.setup.limit.help': "Applies only to your team's key, never to a member's own account. More limits are in Settings › Members.",
  'screen.setup.people.what': "Facts about a person that come from public documents are as visible as those documents are. Your team's own notes about a person stay inside the project where they were written.",
  'screen.setup.court': 'Privacy and the law',
  'screen.setup.court.what': "Civicsmith keeps your team's unpublished work private, from the public and from the people you look into. But a court order your team can't defeat can still require anything not public to be shown, such as members' notes, sources and hidden projects. Much work never draws such an order, and journalists, lawyers and auditors may have protections others lack.",
  'screen.setup.court.legend': 'Should members be told about this?',
  'screen.setup.court.tell': 'Yes, when they join, and the first time they save something not public',
  'screen.setup.court.dont': 'No, just keep the explanation one tap away',
  'screen.setup.admins.what': "Right now you're the only administrator. If you're away or lose access, no one else can run your team's Civicsmith. Invite someone you trust as a second administrator, now or later.",
  'screen.setup.security': 'Security',
  'screen.setup.security.scanner': "Civicsmith's own file scanner checks every file your team brings in, and risky ones open in a safe view. You don't need to do anything.",
  'screen.setup.security.what': 'If your organization already uses its own file scanner, a tool that makes safe copies of files, or a log service, you can connect it here or later in Settings › Security.',
  'screen.setup.security.add': 'Connect a tool',
  'screen.setup.finished': "You're ready",
  'screen.setup.finished.what': 'Anything you left is waiting in Settings. Next, invite your first members.',
}
REWRITE.update(SETUP279)
# DEC-279 (the standing tail, DEC-276's owed note): two acts' general explanations covered only one of what they do
REWRITE.update({
  'act.queuemute.does': "Stops this kind of item, or a project's items, reaching your queue, or lets muted ones reach it again. What you muted is listed under Muted at the foot of your queue.",
  'act.promote.does': 'Turns what you are looking at into something the team will work on: a hint, chain or suggestion into a question, or a problem into a project. Where it came from is kept with it.',
})
w279('screen.setup.after', 'Civicsmith is yours now. Each part below starts with a safe choice: open the ones you want to set today, and leave the rest for later.', False, 'under the title once claimed (the lede shows only before)')
w279('screen.setup.coming', 'Then, when you like, seven more parts. Each starts with a safe choice, and none has to be done today.', False, 'before the claim, above the parts to come')
w279('screen.setup.state.needed', 'Needed first', False, "a part's state")
w279('screen.setup.state.done', 'Done', False, "a part's state")
w279('screen.setup.state.optional', 'Optional', False, "a part's state")
w279('screen.setup.state.off', 'Kept out', False, "the assistant's part when AI is kept out")
w279('screen.setup.part.claim.why', 'So that only you can run it. About two minutes.', False, "the claim's one line")
w279('screen.setup.part.group', 'Your team', False, "the name and website's part")
w279('screen.setup.part.group.why', 'Its name, logo and website, as members and readers will see them.')
w279('screen.setup.part.places.why', 'So Civicsmith can count deadlines and fill in public offices for you.')
w279('screen.setup.part.offices.why', 'The public offices your team watches, and who holds each one.')
w279('screen.setup.part.assistant.why', 'Whether members may use it, and who pays.')
w279('screen.setup.part.court.why', 'What stays private, and what a court could still see.')
w279('screen.setup.part.security.why', 'Civicsmith checks every file. Add your own tools if you have them.')
w279('screen.setup.part.admins.why', 'So your team never depends on one person.')
w279('screen.setup.claim.intro', "The installer gave you a one-time password. Whoever holds it could take charge of your team's Civicsmith, so trade it now for a handle and a password of your own. You become your team's first administrator.")
w279('screen.setup.otp.tip', "It was shown once, on the installer's last page. Opening this page another way? Type the password you saved there. Lost it? Whoever can sign in to your team's Cloudflare account can set a new one.", False, "explains 'Already filled in'")
w279('screen.setup.handle.tip', "Lower-case letters, digits and hyphens, 2 to 41 of them, starting with a letter or digit. It needn't be your legal name, and no one else in your team can ever take it.", False, "explains 'Choose it with care'")
w279('screen.setup.codes.intro', "Save your ten recovery codes now. Civicsmith sends no email, so if you ever forget your password, one of these codes is your way back in. You'll see them only this once: keep them with your password, somewhere only you can reach.")
w279('screen.setup.name.tip', "Only the name people read changes. Your team's short name, chosen when you installed, stays the same in its web address and signatures.", False, "explains 'You can change it any time'")
w279('screen.setup.site.q', 'Does your team have a website of its own?')
w279('screen.setup.site.no', 'No, or not yet')
w279('screen.setup.site.yes', 'Yes')
w279('screen.setup.site.tip', 'Your public page will then name your website, so a team that wants to stay anonymous should choose “No”. You can add a website later in Settings.', False, "explains 'Yes'")
w279('screen.setup.places.intro', 'Civicsmith knows the rules of a number of cities, counties and states: the deadlines officials must meet, their holidays, their public offices and their public-records laws, each with its source. Choose your place, and Civicsmith counts deadlines and fills in offices for you.')
w279('screen.setup.place.other', 'Somewhere else', False, "the place list's last choice")
w279('screen.setup.ai.q', 'Should your team use the assistant?')
w279('screen.setup.ai.yes', 'Yes, members may use it')
w279('screen.setup.ai.yes.help', 'Nothing goes to Anthropic until a member asks a question.')
w279('screen.setup.ai.no.help', "No assistant may be used in your team: not the team's, and not a member's own. Searching, counting and your team's own templates take its place.")
w279('screen.setup.ai.off', 'The assistant is kept out, so nothing else about AI is asked here. You can change this later in Settings.')
w279('screen.setup.pay.q', 'Who pays for it?')
w279('screen.setup.pay.own', 'Each member, with their own Claude account')
w279('screen.setup.pay.group', 'Your team, with one API key for members who have none')
w279('screen.setup.key.tip', 'An administrator creates the key at console.anthropic.com, under an account that belongs to your team and has a payment method. Setting a monthly spending limit there too is wise.', False, "explains 'Made in Anthropic's Console'")
w279('screen.setup.hosting.help', "The account your team's Civicsmith runs on. Whoever holds it can reach everything, so write down who that is.")
# --- end DEC-279
# --- DEC-280 (Bob, 15 October): a pressed button answers at once; sounds are each member's choice, off to start (his "C")
def w280(key, en, prot=False, note=''):
    W.append(dict(key=key, en=en, protected=prot, note='DEC-280' + (': ' + note if note else '')))
w280('shell.working', 'Working…', False, "said to a screen reader (a polite live region) from a button's press until Civicsmith answers; the button shows a turning ring")
w280('screen.account.sounds', 'Sounds', False, "Your account › Language and appearance")
w280('screen.account.sounds.off', 'Off')
w280('screen.account.sounds.on', 'On')
w280('screen.account.sounds.help', 'On: a soft click when you press a button, and a low tone when something is refused. New members start with it off.')
# --- end DEC-280
# --- DEC-282 (K3471; install situations S1, S10): an account that already holds a Civicsmith; the one-time password kept to oneself
def w282(key, en, prot=False, note=''):
    W.append(dict(key=key, en=en, protected=prot, note='DEC-282' + (': ' + note if note else '')))
X = 'screen.install.exists.'
w282(X + 'title', 'This account already holds a Civicsmith')
w282(X + 'sub', 'Nothing was created or changed. Here is what is in it, and the ways to go on.')
w282(X + 'here.heading', 'What is already here')
w282(X + 'whose', "{team}'s Civicsmith, at {address}", False, "{team}: its name as its members read it; {address}: its web address")
w282(X + 'release', 'Release {release}, installed {date}; last used {used}')
w282(X + 'holds', 'What it holds: {holdings}', False, '{holdings}: its counts, such as "3 projects, 412 documents, 1 published case, 6 members"')
w282(X + 'ask', "If it is your team's, ask its administrators before you choose: they may be using it today.")
w282(X + 'choose.heading', 'What would you like to do?')
w282(X + 'update.name', 'Update it')
w282(X + 'update.what', "If it is your team's: bring it up to date. Its records, members and settings are kept.")
w282(X + 'alongside.name', 'Install alongside it')
w282(X + 'alongside.what', "For a different team, in this same account. Each has its own short name, address, members and records; neither can read the other's.")
w282(X + 'remove.name', 'Remove it, then install')
w282(X + 'remove.what', 'Only if nobody needs what it holds. The next page lists exactly what would be deleted, and nothing is deleted before you confirm there.', True)
R = 'screen.install.remove.'
w282(R + 'title', 'Remove the Civicsmith already here?', True)
w282(R + 'sub', 'Read what would be deleted. Nothing has been deleted yet.', True)
w282(R + 'lost.heading', 'What would be deleted, for good', True)
w282(R + 'lost.records', "Everything {team}'s Civicsmith holds: {holdings}, with every note, question and finding in them.", True)
w282(R + 'lost.members', "Every member's account and sign-in, the administrators' too.", True)
w282(R + 'lost.published', 'Its own copies of what it published. Copies other teams imported, and pages anyone saved elsewhere, are not touched.', True)
w282(R + 'lost.address', 'Its address, which stops answering.', True)
w282(R + 'keep', "Nothing is kept by surprise: the installer keeps no copy. If anything should be kept, its administrators export it first, in their Civicsmith's Settings, before you come back here.", True)
w282(R + 'type.label', 'To confirm, type its short name', True)
w282(R + 'type.help', 'Its short name is {slug}. Typing it makes sure the right Civicsmith is removed.', True)
# --- end DEC-282
# --- DEC-283 (B241, K3459, K3468; the walk's D3, B244): the assistant's page: what serves you first, then parts that open and close
def w283(key, en, prot=False, note=''):
    W.append(dict(key=key, en=en, protected=prot, note='DEC-283' + (': ' + note if note else '')))
C = 'screen.connect.'
w283(C + 'connected', 'Connected', False, 'beside the card that says which account serves you')
w283(C + 'own.until.again', 'Then you sign in again here.', False, 'after screen.connect.own.until')
w283(C + 'part.notice.why', 'Read once: what happens to what you ask.')
w283(C + 'part.allowance', 'Your daily allowance')
w283(C + 'part.allowance.why', 'Set by your administrators.')
w283(C + 'part.use', 'Your use')
w283(C + 'part.use.why', 'Only you see this.')
w283(C + 'part.before', 'Before you connect')
w283(C + 'part.before.why', 'Read once: what connecting means.')
w283(C + 'way.subscription.help', 'Billed to you by Anthropic, not your team.')
w283(C + 'way.apikey.help', 'Anthropic bills you for each use.')
w283(C + 'part.uses', 'What the assistant may do for you')
w283(C + 'part.uses.why', "Everyday help is on. Switch off anything you'd rather do yourself.")
w283(C + 'uses.everyday', 'Everyday help')
w283(C + 'uses.unasked', 'Without being asked')
w283(C + 'uses.unasked.help', 'Off to start. Each of these uses your account without a question from you.')
w283(C + 'part.limit', 'A limit, if you want one')
w283(C + 'part.limit.why.subscription', "None set: only your plan's own allowance applies.")
w283(C + 'part.limit.why.apikey', "None set: only Anthropic's own spending limit on your key applies.")
w283(C + 'limit.per', 'Per')
w283(C + 'limit.day', 'day')
w283(C + 'limit.month', 'month')
w283(C + 'limit.more', 'More choices')
w283(C + 'limit.binds', "Your limits bind only your own account; the team's and a project's limits never bind it. The first time a limit is reached in a period, you are told once in your queue.")
w283(C + 'use.last30', 'Last 30 days')
w283(C + 'use.subscription', 'On your subscription')
w283(C + 'whopays.summary', 'Which account pays, and when')
# --- end DEC-283
# --- DEC-284 (the walk's D2, B244): the team's key leaves Members for its own page, The team's assistant
def w284(key, en, prot=False, note=''):
    W.append(dict(key=key, en=en, protected=prot, note='DEC-284' + (': ' + note if note else '')))
T = 'screen.teamai.'
w284(T + 'sub', "The team's API key serves members who have no account of their own.")
w284(T + 'held', "The team's API key is held and on.")
w284(T + 'setby', '{who} set it on {date}.')
w284(T + 'on', 'On')
w284(T + 'uses.why', 'Everyday help is {everyday}; exploring is {explore}.', False, '{everyday}: on, off or partly on; {explore}: on, off or asked each day')
w284(T + 'limits.why', '{overall} overall; {each} for each member.', False, 'when no limit is set: screen.teamai.limits.none')
w284(T + 'limits.none', 'None set.')
w284(T + 'use.why', 'Summed over members; nobody is named.')
w284(T + 'key', 'The key itself')
w284(T + 'key.why', 'Replace it, switch it off or remove it.')
w284(T + 'changes.why', 'Every change, with who made it and when.')
# --- end DEC-284
# --- DEC-285 (the walk's D7, B244): Home's first visit for a new team: the next steps numbered, in order; the doors start directly
def w285(key, en, prot=False, note=''):
    W.append(dict(key=key, en=en, protected=prot, note='DEC-285' + (': ' + note if note else '')))
w285('screen.home.first.invite', 'Make an invitation link for each person and send it yourself: Civicsmith sends no email.')
w285('screen.home.first.identity', 'Its kind, focus and purpose, in a few words: it shapes how each new member is welcomed.')
w285('screen.home.first.project', 'Open your first project: choose below what happened.')
# --- end DEC-285
# --- DEC-286 (the member walk's M-D5 and M-D6, B246): a member who may not start projects is shown how to get into one, and
#     who can let them start their own, named; asking to join a findable project (Membership §7.14) drawn; the visibility
#     choice preselects neither (DEC-24)
def w286(key, en, prot=False, note=''):
    W.append(dict(key=key, en=en, protected=prot, note='DEC-286' + (': ' + note if note else '')))
ADM = "{admins}: the handles of the team's active administrators, joined with commas and “and”"
w286('screen.home.join.heading', 'Getting into a project', False, "Home's section for a member who may not start projects")
w286('screen.home.join.says', "Every project you can get into: the ones you were invited to, and the findable ones, whose owners let every member see their names. A project's owners decide who joins it.")
w286('screen.home.join.lead', "Your team's work happens in projects, and you're not in one yet. Join one you were invited to, or ask to join one the team can find.")
w286('screen.home.join.nocreate', "Starting a project of your own is for members your team's administrators allow. Yours: {admins}. Ask if you have a problem to bring.", False, ADM)
w286('screen.home.join.none', "No project is open to you yet. A project's owners can invite you, and your team's administrators can let you start your own. Yours: {admins}.", False, 'when no project is invited or findable; ' + ADM)
w286('projects.findable.head', 'Findable')
w286('projects.findable.says', 'Projects you are not in whose owners let every member see their names. Nothing else about them shows until you are in. Ask to join, with a word on why if you like; its owners grant or decline it, and you can withdraw your request while it waits.')
w286('projects.findable.meta', 'Findable: only its name shows until its owners let you in.')
w286('projects.request.asked', 'You asked to join on {date}. Its owners decide.', False, 'a findable project the member asked to join; the request is open')
w286('screen.projects.nocreate', "Starting a project is for members your team's administrators allow. Yours: {admins}. Ask if you have a problem to bring.", False, "in place of “Start a project” for a member who may not start one; " + ADM)
w286('queue.project-request.summary', '{who} asks to join {project}', False, "in the owners' queue; the member's word follows as their own words")
w286('queue.project-request.detail', 'Grant it to invite them, or decline it. They see your answer and any word you add.')
w286('screen.home.request.grant', 'Grant', True, 'grants a request to join (projectrequestanswer)')
w286('screen.home.request.decline', 'Decline', True, 'declines a request to join (projectrequestanswer)')
REWRITE.update({
  'project.visibility.start.later': 'Choose one: neither is chosen for you. You can change it later, with a reason.',
  'screen.updates.admins': "Only your team's administrators install updates. Yours: {admins}. If something needs updating, ask one of them.",
  'screen.security.admins': "Security is set by your team's administrators. Yours: {admins}. Ask one of them about anything here.",
})
# --- end DEC-286
# --- DEC-287 (the member walk's M-D4, B246): a member's Members page is the roster, its columns explained; what each may do in
#     plain words; Settings' rail line true for a member
def w287(key, en, prot=False, note=''):
    W.append(dict(key=key, en=en, protected=prot, note='DEC-287' + (': ' + note if note else '')))
w287('screen.members.cap.all', 'all of it, as every administrator may', False, "an administrator's row: every administrator holds every working capability (Membership §5)")
w287('screen.members.member.note', 'Administrators add members and change what each may do.', False, "under the roster, for a member who is not an administrator")
REWRITE.update({
  'screen.members.cap.contribute': 'add and revise work',
  'screen.members.cap.publish': 'sign and publish cases',
  'screen.members.cap.administer': "look after the team's Civicsmith",
})
# --- end DEC-287
# --- DEC-288 (the walk's D6, B244): the question page's three steps, the next one plain; the rest folded
def w288(key, en, prot=False, note=''):
    W.append(dict(key=key, en=en, protected=prot, note='DEC-288' + (': ' + note if note else '')))
w288('question.steps.source', 'Bring in a source', False, "the question's first step: a document that answers it")
w288('question.steps.mark', 'Mark what it says', False, 'the second step: the part of a document that answers, cited')
w288('question.steps.conclude', 'Say what you conclude', False, 'the third step: the conclusion')
w288('question.more', 'More you can do with this question', False, 'folds narrowing, another source, a check by expertise and a plan')
w288('question.around', 'Themes and what relies on this', False, "folds the themes the question's passages are in and the projects that rely on it")
REWRITE.update({
  'question.empty.heading': 'Next: bring in a source',
  'question.empty.note': "A question is answered from documents: your government's own records, a report, what a member saw. Start with one; you can add more at any time.",
  'question.empty.capture': 'Add a document',
  'question.empty.capture.line': 'Its web address, a file, or what you saw yourself. Civicsmith keeps the copy for you to confirm, then you mark the part that answers.',
  'question.empty.find': 'Find one the team has',
  'question.empty.find.line': "Search the team's documents, open one, and mark the part that answers.",
  'question.empty.ask.line': 'It reads what the team holds and suggests the parts that answer, and an answer. Nothing counts until a member accepts it.',
})
# --- end DEC-288
# --- DEC-289 (the walk's D5, the member walk's M-D3): a held copy says what to do next and what vouching is; attest and retire
#     in plain words, retire apart; a file a member added says why it is high risk and what to do next
def w289(key, en, prot=False, note=''):
    W.append(dict(key=key, en=en, protected=prot, note='DEC-289' + (': ' + note if note else '')))
w289('document.held.says', 'Held until you vouch for it. Only you can see this copy. Read it below; if it is exactly what its source gave, vouch for it under your name, and your team can use it.', False, 'a copy the viewer captured, not yet vouched for (release)')
w289('document.attest.when', 'Useful when someone may later claim the document was changed after it was captured.', False, 'beside the timestamp button; what it does is its own explanation')
w289('document.attest.label', 'Get an independent timestamp', True, 'the act attest')
w289('document.retire.fold', 'Stop using this copy', False, 'folds the act retire, apart from the copy\'s other acts')
w289('document.retire.when', 'For a copy that should no longer be relied on, such as one captured from the wrong page. It stays in the record with your reason.')
w289('document.retire.label', 'Stop using this copy…', True, 'the act retire')
w289('document.thiscopy.says', 'What you can do with this copy itself, apart from reading and citing it.')
w289('screen.open-file.byyou', 'Added by you, {date} · {project}', False, "a file the viewer added: when, and the project it was added in")
w289('screen.open-file.high.yours', "Added by you, not fetched by your team's Civicsmith: every such file is high risk, yours included.", False, 'file-safety R6, R8: a received file is graded high on its source')
w289('screen.open-file.next.head', 'What to do next')
w289('screen.open-file.next.yours', 'Read it in the safe view below. To open the original itself, ask for a deeper check first.')
w289('screen.open-file.check.notyet', 'Not checked yet: its first check is waiting. The original never opens before a check.', False, "in place of a scanner's raw state (not_scanned)")
# --- end DEC-289
# --- DEC-290 (the walk's D8, the member walk's M-D3 in part): team-wide terms defined where used; the wizard mark says what it does
def w290(key, en, prot=False, note=''):
    W.append(dict(key=key, en=en, protected=prot, note='DEC-290' + (': ' + note if note else '')))
w290('term.bar.team.means', "The bar is how strong an answer must be before the team relies on it: one letter for how well its documents were obtained, one for how firmly they connect to the answer. A project can set its own.", False, "on the word Bar on Your team's page (a card)")
w290('term.bar.project.means', "How strong each answer in this project must be before the project relies on it: one letter for how well its documents were obtained, one for how firmly they connect to the answer. With no bar of its own, the team\'s applies.", False, "on the word Bar on a project's page (a card)")
w290('term.hostingaccount.means', "The Cloudflare account your team\'s Civicsmith runs in. Whoever holds it can reach everything the team keeps.", False, 'on the words "the hosting account" (a card)')
w290('screen.group.hosting.says', "The hosting account is the Cloudflare account your team's Civicsmith runs in.")
w290('screen.group.court.says', 'The notice tells each member plainly that a court order could reach what the team keeps that is not public.', False, "Bob's ruling of 5 October (DEC-136): members understand a court order can expose non-public records")
REWRITE.update({
  'wizard.marks.chip': 'Show me how ({n})',
  'wizard.marks.chip.one': 'Show me how',
})
# --- end DEC-290
# --- DEC-291 (the walk's D4, B244): Security leads with how things stand in one plain sentence; file checking said once; the
#     counts and the adding of outside checkers folded
def w291(key, en, prot=False, note=''):
    W.append(dict(key=key, en=en, protected=prot, note='DEC-291' + (': ' + note if note else '')))
w291('screen.security.ordinary.head', 'Nothing unusual. There is nothing for you to do.', False, 'the lead in an ordinary period')
w291('screen.security.ordinary.line', "In the last {period} every kind of attempt stayed near your team's usual, and no new key, credential or administrator was made.", False, '{period}: the period chosen, such as "7 days"')
w291('screen.security.files.on', "Files are checked. The built-in scanner checks every file when it arrives and again each week. A file your team's Civicsmith did not fetch itself opens in the safe view until a deeper check passes.")
w291('screen.security.counts.fold', 'The counts, by kind, hour and place')
w291('screen.security.add.fold', 'Add another checker (advanced)', False, 'folds adding an outside tool and the catalog of kinds')
w291('screen.security.risk.means.ordinary', "Ordinary: around your team's usual. Raised: well above the usual at some point, and nothing got through. High: well above the usual and still going on, or something unusual got through; only then are administrators told, in their queue.", False, 'the risk mark in an ordinary period: its own state first')
# --- end DEC-291
# --- DEC-292 (the walk's minors D9, D12, D14, D15, D16; D13 reaffirmed): smaller pages said plainly
def w292(key, en, prot=False, note=''):
    W.append(dict(key=key, en=en, protected=prot, note='DEC-292' + (': ' + note if note else '')))
w292('screen.capture.forq', 'What you add here is filed under {project}, for the question {question}', False, 'above the tabs when Add is opened from a question; {question} in quotation marks')
w292('screen.recovery.onlyyou', "They were shown once, to you alone, when they were issued. Nobody else has seen them, an administrator included, and Civicsmith can't show them again. If you didn't keep them, get new ones.")
w292('screen.wizards.own.fold', 'Writing your own wizards')
w292('screen.wizards.own.says', 'Most teams use the wizards Civicsmith comes with. Write your own only for a way of working your team repeats.')
w292('project.settings.fold', "This project's settings", False, "folds the bar, who can find it, at the project page's foot")
w292('shell.level.button.prompt', 'Explanations: prompt', False, "the header's explanations button while explanations open promptly (level.prompt.name names the choice itself)")
w292('shell.level.button.pause', 'Explanations: on a pause', False, "the header's explanations button while they open on a longer pause")
# --- end DEC-292
# --- DEC-293 (screens-inquiry R45, R085): each way an assistant's run can end, in plain words, as {why} in
#     screen.assistant.run.ended ("The run ended: {why}."); keyed by the run's stopped bound (run-rules RUN_BOUNDS, RUN_ENDINGS)
def w293(key, en, prot=False, note=''):
    W.append(dict(key=key, en=en, protected=prot, note='DEC-293' + (': ' + note if note else '')))
E = 'ai.run.ending.'
w293(E + 'completed', 'it went through everything it could', False, 'RUN_ENDINGS completed, the run left proposals (DEC-297: reworded in place; drawn above them, screens-inquiry R47)')
w293(E + 'completed.none', 'it went through everything it could and has nothing to propose', False, 'DEC-297: RUN_ENDINGS completed, the run left no proposal')
w293(E + 'cancelled', 'you stopped it', False, 'RUN_ENDINGS cancelled: the member pressed Stop')
w293(E + 'mode-not-deployed', "this kind of work isn't switched on in your team's Civicsmith yet, so nothing was spent", False, 'RUN_ENDINGS mode-not-deployed')
w293(E + 'fetches', 'it reached its limit on pages it may fetch from the web', False, 'RUN_BOUNDS fetches')
w293(E + 'subsessions', 'it reached its limit on separate searches it may start', False, 'RUN_BOUNDS subsessions')
w293(E + 'wallclock', 'it reached its time limit', False, 'RUN_BOUNDS wallclock')
w293(E + 'runtime', "it reached the most computing your team's hosting account allows in one go", False, 'RUN_BOUNDS runtime')
w293(E + 'mints', 'it reached its limit on passages it may mark for citing', False, 'RUN_BOUNDS mints')
w293(E + 'surfaces', 'it reached its limit on questions it may open', False, 'RUN_BOUNDS surfaces')
w293(E + 'proposals', 'it reached its limit on options it may propose', False, 'RUN_BOUNDS proposals')
w293(E + 'pages', 'it reached its limit on pages of documents it may read', False, 'RUN_BOUNDS pages')
w293(E + 'lease', 'it stopped answering partway, so Civicsmith ended it', False, 'RUN_BOUNDS lease: the reaper ended a run that stopped checking in')
w293(E + 'unknown', 'Civicsmith could not tell why', False, 'any other value, including a bare status')
# --- end DEC-293
# --- DEC-294 (the walk's D18, DEC-292): the People page for a new team and its add form
def w294(key, en, prot=False, note=''):
    W.append(dict(key=key, en=en, protected=prot, note='DEC-294' + (': ' + note if note else '')))
w294('screen.people.counts.none', 'not named in any document yet', False, 'a row no document names; such a row offers no "Explore connections"')
w294('screen.people.add.submit', 'Follow them', False, "the add form's button")
REWRITE.update({
  'screen.people.add.kind': 'A person or an organization?',
})
# --- end DEC-294
# --- DEC-296 (BOB's B251, N1167; ai-runs R76): a run's cost on the question page and the assistant panel, to the paying
#     account's owners only: {cost} from ai.run.cost.<form>, {account} from ai.run.cost.on.<kind>
def w296(key, en, prot=False, note=''):
    W.append(dict(key=key, en=en, protected=prot, note='DEC-296' + (': ' + note if note else '')))
w296('screen.assistant.run.cost.sofar', 'So far: {cost}, on {account}.', False, 'after the run\'s working line, on the question page and in the panel, while it runs')
w296('screen.assistant.run.cost.final', 'It used {cost}, on {account}.', False, 'after "The run ended: {why}." once session.cost is final')
w296('ai.run.cost.money', '{amount} in {calls} calls', False, 'when the account reports money; {amount} such as "$1.49"')
w296('ai.run.cost.money.one', '{amount} in 1 call')
w296('ai.run.cost.tokens', '{tokens} tokens in {calls} calls', False, 'when the account reports no money')
w296('ai.run.cost.tokens.one', '{tokens} tokens in 1 call')
w296('ai.run.cost.on.subscription', 'your Claude subscription')
w296('ai.run.cost.on.apikey', 'your API key')
w296('ai.run.cost.on.team', "the team's key", False, "to the team account's owners")
w296('ai.run.cost.on.project', "{project}'s own account", False, "to the project account's owners")
w296('ai.run.cost.means', "What this run has cost the account that pays for it. Only that account\'s owners see it, never another member.", False, 'the explanation on the cost line')
w296('ai.run.cost.tokens.means', "Your subscription reports tokens and calls, not money. They count against your plan's own allowance.", False, 'added to the explanation when the cost is in tokens')
# --- end DEC-296
# --- DEC-298 (Bob's K3602 "Choice A", BOB's B260, N1195): the assistant's progress drawn live, step by step as it arrives,
#     on the question page and in the assistant panel; its answer drawn only after Civicsmith's check, never unchecked words
def w298(key, en, prot=False, note=''):
    W.append(dict(key=key, en=en, protected=prot, note='DEC-298' + (': ' + note if note else '')))
w298('ai.progress.means', "Each step shows as the assistant takes it. What it writes is held until Civicsmith has checked every passage it cites against the document itself; only then is it shown.", False, 'the explanation on the progress list')
w298('ai.progress.reading', 'Reading {document} · {n} of {total}', False, 'the current step while it reads; {document} its title')
w298('ai.progress.read', 'Read {total} documents', False, 'a finished reading step')
w298('ai.progress.read.one', 'Read 1 document')
w298('ai.progress.found', 'Found {count} passages that bear on this question')
w298('ai.progress.found.one', 'Found 1 passage that bears on this question')
w298('ai.progress.found.none', 'Found no passage that bears on this question')
w298('ai.progress.composing', 'Writing its proposal…', False, 'on the question page, a run composing')
w298('ai.progress.composing.answer', 'Writing its answer…', False, 'in the panel, an ask composing')
w298('ai.progress.checking', 'Civicsmith checks it before you see it', False, 'the check step, waiting or under way')
w298('ai.progress.check.ok', '{passage}: found in the document, word for word', False, "one tick of the check, as it arrives")
w298('ai.progress.check.fail', '{passage}: not found in the document as quoted, so it is left out', False, 'one failed tick; the rest is still shown')
w298('ai.progress.checked', 'Checked by Civicsmith: {ok} of {total} passages it cites found as quoted', False, 'the finished check, when some failed')
w298('ai.progress.checked.all', 'Checked by Civicsmith before it was shown', False, 'the finished check, all passages found; under each answer in the panel')
w298('ai.progress.check.failed', "Civicsmith's check failed, so nothing it wrote is shown: none of the passages it cites was found as quoted.", False, 'the check failed whole')
w298('ai.progress.hold', 'Its proposal shows here once Civicsmith has checked it. You never see unchecked words.', False, 'below the steps on the question page')
w298('ai.progress.hold.answer', 'Its answer shows here once Civicsmith has checked it.', False, 'in the panel while it works')
w298('ai.progress.checked.all.means', 'Every passage this answer cites was found, word for word, in the document it names, by Civicsmith itself and not by the assistant.', False, "the explanation on the panel's checked line")
# --- end DEC-298
keys = [x['key'] for x in W]
dup = sorted({k for k in keys if keys.count(k) > 1})
assert not dup, 'duplicate keys: ' + ', '.join(dup)
assert not set(REWRITE) & set(keys), 'a minted key is also reworded'
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'words-drawn.json')
open(out, 'w').write(json.dumps(dict(rows=W, rewrite=REWRITE), indent=1, ensure_ascii=False) + '\n')
print(f'words-drawn.json: {len(W)} rows, {len(REWRITE)} reworded')
