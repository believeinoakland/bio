# **Believe in Oakland**

**Communication and Publishing Platform Recommendations**

Working Document --- April 2026

## Design Principles for Platform Selection

The Believe in Oakland (BIO) architecture requires communication and
publishing infrastructure that satisfies several non-negotiable
constraints derived from the core values and design requirements:

**No single point of failure.** The system must function if any single
platform is compromised, censored, or goes offline. This means operating
across multiple platforms rather than depending on one.

**No centralized control.** No single administrator or moderator should
have the power to silence groups or remove work products.
Individual-level blocking of disruptive actors is acceptable; top-down
content control is not.

**Free and accessible.** Financial barriers to participation violate the
scaling requirement. Core platforms must be free for participants.
Modest infrastructure costs (hosting) are acceptable if they support
BIO-controlled infrastructure.

**Resilient under hostile conditions.** The platform architecture must
withstand organized disruption, astroturf campaigns, SLAPP-related
takedown requests, and platform-level censorship attempts.

**Usable by non-technical participants.** A person who has never used a
forum or a file-sharing platform must be able to participate within
their first session.

## Three Distinct Functions

BIO\'s communication needs are divided into three functions, each best
served by different infrastructure. Conflating them into a single
platform would create fragility and compromise.

### Function 1: Cross-Group Discussion and Discovery

This is where groups find each other, discuss methodology, share
observations, ask questions, and debate findings. It is the operational
hub of the BIO network.

**Primary Recommendation: Self-Hosted Discourse**

Discourse (discourse.org) is a 100% open-source community platform that
has been battle-tested for over a decade. It would be hosted at a
BIO-controlled domain such as forum.believeinoakland.org.

**Why Discourse:**

Discourse is fully open source under GPL v2 with the complete codebase
on GitHub. BIO would own and control its infrastructure with no
dependency on any company\'s terms of service or content policies.
Self-hosting on a basic cloud server costs approximately \$20/month
through services like Digital Ocean. Free hosted options are available
for qualifying community projects. All data is fully exportable at any
time, meaning the entire forum can be migrated to a new server from a
backup in hours if the current host is compromised.

The platform supports structured, threaded discussion with categories
and tags, which maps well to organizing conversations by area of
government, escalation stage, or group. Discourse includes a built-in
\"trust level\" system where participants earn moderation privileges
through sustained, constructive participation rather than being
appointed by administrators. This aligns with BIO\'s principle that
credibility is demonstrated by the work. Individual users can mute or
block other users without requiring moderator intervention. Full-text
search across all content means that findings, discussions, and
methodological debates are permanently discoverable.

Discourse supports email-based participation: users can read and reply
to forum posts entirely through email without ever visiting the website.
This dramatically lowers the barrier for participants who are unfamiliar
with forum interfaces. It also supports mobile browsers natively.

**Cost:** Approximately \$20/month for a basic Digital Ocean droplet, or
free through Discourse\'s community hosting program if BIO qualifies.
Domain registration for forum.believeinoakland.org is minimal (included
if believeinoakland.org is already registered).

**Secondary Channel: Reddit (r/BelieveInOakland)**

A BIO subreddit serves as a public-facing outreach and recruitment
channel. Reddit has enormous reach (over 50 million daily active users),
low barriers to entry, and strong threading for structured discussion.
However, Reddit should NOT serve as the primary operational platform for
several reasons: Reddit controls the platform and can quarantine or ban
subreddits at its sole discretion; the moderator structure is
hierarchical, creating a potential co-option vector; content is
algorithmically ranked by popularity rather than quality or rigor; and
data export options are limited.

The subreddit\'s role is to make BIO visible, to share published
findings with a broader public audience, and to direct interested
participants to the Discourse forum for operational work.

**Cost:** Free.

**Internal Group Communication: Group\'s Choice**

Individual groups communicate internally through whatever platform their
members prefer. Signal is recommended for groups that want encrypted,
private communication. Email works for groups that prefer simplicity.
In-person meetings require no platform at all. The civic OS does not
mandate internal communication tools. It only mandates that cross-group
communication and published work products flow through the shared
infrastructure described here.

**Cost:** Free (Signal, email) or group\'s choice.

### Function 2: Work Product Publishing

This is where groups host their published analyses, evidence packages,
and other work products. The requirement is persistent, linkable,
version-controlled file hosting that anyone can access.

**Default Recommendation: an accessible shared-folder service**

The default is whatever mainstream shared-folder service the group's
members already use: near-zero onboarding cost, support for all file
types (spreadsheets, PDFs, documents, images), built-in version history
providing an automatic audit trail, and folders organized by group, area
of government, and date. A standardized metadata form accompanies each
published work product.

**Limitation:** the vendor controls the infrastructure and could
theoretically restrict access to a shared folder. Groups hosting
sensitive work products (particularly evidence packages related to
active legal matters) should maintain copies on at least one additional
platform.

**Cost:** free at typical volumes on every mainstream service; paid
tiers are a few dollars a month.

**Advanced Option: Open Science Framework (OSF)**

The Open Science Framework at osf.io is purpose-built for transparent,
reproducible research. It is free, supports file hosting with version
control, has built-in project structure with components and
cross-references, supports preregistration (which maps to the
discovery/documentation phase of the escalation protocol), and
everything is openly accessible and exportable.

OSF is philosophically aligned with BIO\'s values: it was built by the
Center for Open Science specifically to make research processes
transparent, reproducible, and accessible. For groups doing rigorous
analytical work that want formal version control and reproducibility
infrastructure, OSF is the stronger choice.

**Limitation:** OSF was designed for academic researchers. The interface
is functional but unfamiliar to non-academic users. It is not
technically difficult, but the learning curve is slightly steeper than a
mainstream shared-folder service.

**Cost:** Free. Operated by the nonprofit Center for Open Science.

**Other Viable Options**

Groups are free to host work products on any platform they choose,
provided the work product is publicly accessible via a stable URL and
the standardized metadata form is completed. Other viable options
include Dropbox (free tier: 2 GB), a group\'s own website, or document
hosting through the Discourse forum itself (Discourse supports file
uploads). The key requirement is that the work product has a persistent,
publicly accessible link that the directory can point to.

### Function 3: The Directory (Index of All Published Work)

The directory is the searchable index of all published work products
across all groups. It lives at believeinoakland.org and links to work
products wherever they are hosted. The directory is what makes the
distributed publishing architecture navigable.

**Recommendation: believeinoakland.org**

The BIO website serves multiple functions: public-facing identity
(mission statement, core values, operational principles), the directory
of published work products searchable by area of government, status,
date, content type, and producing group, links to the Discourse forum
and subreddit, the starter kit (tutorials, templates, guides), and a
simple submission form for groups to add their work products to the
directory.

The directory data should be maintained in a structured, downloadable
format (CSV or JSON) so that any group can maintain a local mirror. This
ensures the directory survives even if believeinoakland.org is
temporarily unavailable.

**As a gateway for new groups:** The website should provide default
onramps so that a newly formed group (or an individual working alone)
can get operational immediately. A \"Getting Started\" page should offer
one-click or near-one-click pathways: \"Join the discussion\" (link to
Discourse forum), \"Set up a workspace\" (instructions for creating a
shared folder workspace with the standard naming convention),
\"Communicate securely\" (link to download Signal with setup guidance),
\"Publish your first work product\" (link to the metadata template and
submission form).

**Cost:** Domain already registered. Website hosting via a static site
generator (GitHub Pages, Netlify, or Cloudflare Pages) is free. If a
more dynamic site is needed, basic hosting is \$5-20/month.

## Platform Comparison Summary

  ------------------------------------------------------------------------------------------------------------------
  **Platform**               **Function**   **Cost**       **BIO       **Ease of  **Resilience**   **Recommended**
                                                           Control**   Use**                       
  -------------------------- -------------- -------------- ----------- ---------- ---------------- -----------------
  **Discourse                Discussion hub \~\$20/mo      Full        Moderate   High             Primary
  (self-hosted)**                                                                                  

  **Reddit**                 Public         Free           None        High       Low              Secondary
                             outreach                                                              

  **Signal**                 Group internal Free           Full        High       High             Internal default

  **Shared-folder service**  Work product   Free           Moderate    High       Moderate         Default hosting
                             hosting                                                               

  **OSF (osf.io)**           Work product   Free           Full export Moderate   High             Advanced option
                             hosting                                                               

  **believeinoakland.org**   Directory /    Free-\$20/mo   Full        High       Moderate         Primary
                             gateway                                                               
  ------------------------------------------------------------------------------------------------------------------

## Resilience Architecture

The multi-platform approach ensures that no single failure compromises
the system:

**If the Discourse forum goes down:** Groups communicate through the
subreddit, email, or Signal while the forum is restored from backup. All
forum data is exportable and can be redeployed on a new server.

**If Reddit bans the subreddit:** Public outreach continues through the
website, social media, and direct media engagement. The subreddit is a
convenience, not a necessity.

**If a hosting vendor restricts a group\'s folders:** Work products also
exist on other platforms (OSF, group websites) and in other groups\'
accepted bodies of work. No single hosting platform contains the
complete corpus.

**If believeinoakland.org is taken down:** The directory data exists in
downloadable structured format. Any group can republish it. The
Discourse forum continues to function independently. Work products
continue to be hosted wherever individual groups placed them.

**If a key individual is targeted:** No individual controls the
infrastructure. Forum administration can be shared among multiple
trusted participants. Website hosting and domain registration can be
transferred. The distributed architecture ensures continuity regardless
of what happens to any one person.

## Evidence Package Publication and Risk Classification

Evidence packages present a unique publication challenge. The evidence
itself (facts, source documents, analysis) should be fully public.
However, the legal strategy for acting on that evidence carries risk if
mishandled by inexperienced or nefarious actors. A poorly filed legal
action could create adverse precedent that makes future, properly
constructed cases more difficult or impossible.

The solution is to separate the evidence from the legal packaging and to
classify available actions by risk level:

**Tier 1 --- File Freely.** Actions where incorrect filing creates no
lasting legal harm. Includes: CPRA requests, grand jury complaints,
State Controller referrals, City Auditor complaints, Brown Act violation
reports, public comment, and media outreach. Templates for these actions
are included in the evidence package.

**Tier 2 --- File with Caution.** Actions where procedural errors could
result in dismissal, typically without prejudice (meaning refiling is
possible). Includes: CPRA court petitions. Templates are included with
advisory notes recommending legal review before filing.

**Tier 3 --- Do Not File Without Counsel.** Actions where a loss on the
merits could create adverse precedent binding on future litigants.
Includes: Proposition 218 challenges, CCP Section 526a taxpayer actions,
federal consent decree motions, and any claim involving constitutional
interpretation. The evidence package identifies that these actions are
available and explains why they require competent legal counsel. It does
NOT include pre-populated filing templates for Tier 3 actions. Instead,
it provides contact information for legal organizations equipped to
evaluate and file such actions (HJTA, ACTA, First Amendment Coalition,
Prop 218 specialist attorneys).

The risk classification is included in the evidence package metadata so
that the public record reflects BIO\'s explicit guidance about
appropriate use of the evidence. This serves a protective function: if a
court later considers whether a prior poorly litigated case should
preclude a subsequent, well-constructed case, the published risk
classification is evidence that the prior filing was undertaken contrary
to the evidence source\'s recommendation.

## Immediate Next Steps

**1.** Set up believeinoakland.org as a basic website with the mission
statement, core values, operational principles, and links to the
communication platforms. A static site (GitHub Pages, Netlify, or
Cloudflare Pages) is sufficient to start and is free.

**2.** Evaluate whether BIO qualifies for free Discourse hosting through
their community program, or provision a basic Digital Ocean droplet
(\$20/month) for self-hosting. Set up the forum at
forum.believeinoakland.org with categories for different areas of
government, methodology discussion, and escalation tracking.

**3.** Create r/BelieveInOakland as the public-facing Reddit presence.

**4.** Create a \"Getting Started\" page on the website with default
onramps for new groups: join the forum, set up a shared-folder
workspace, download Signal, access the metadata template.

**5.** Develop the metadata template and submission form for the work
product directory.

**6.** Publish the sewer fund evidence (Tier 1 materials: City Auditor
report, CPRA request and nonresponse record, OpenGov data, Municipal
Code provisions) as the first work product in the directory, serving as
both a real case and a tutorial example.

**believeinoakland.org** \| Working Document \| April 2026
