/* The City of Oakland layer: every remaining fact of the first profile (R112), with the measurements it rests on, below. Cut from the unsplit `oakland-alameda` profile at T53 (R114): every fact keeps its basis.
 * Level: city. Plain data. */
/* (the unsplit profile's header, kept whole) The first jurisdiction profile: the City of Oakland and Alameda County, the one the project's own
 * instance uses (`build/layers.md`, "No jurisdiction in the product", rule 2). It holds every local
 * fact that was written into code at `snapshot/pre-refactor-2026-09-25` (R21, R30), each with the
 * measurement or ruling it rests on, or `UNMEASURED` where none exists:
 *
 *   spaces, systems, mixed_hosts   `bio-plane/src/idspaces.mjs` (M-119, M-132, M-157)
 *   vocabulary                     the `docprofile/doctypes/` recognisers: the agenda (the 2026-08-03
 *                                  measurement, FW-15), the minutes, staff report and ordinance or
 *                                  resolution (M-24, over the M-18 census corpus)
 *   practice.minutes_due_days      `MINUTES_DUE_DAYS` in `meeting-calendar.mjs`, which says it is unmeasured
 *   search_terms                   `readingNamePlan`'s default terms in `store.mjs`; no measurement found
 *   records_laws                   the law `cpra_request` names (D-149, `governingLawsOf`)
 *   action sections                `ACTION_KINDS` in `bio-checks.mjs`, tiers from Roadmap v5 §8 as D-182
 *                                  adopted it, the response period of State Rules v1.5 §4.4; the Tier 2
 *                                  and Tier 3 kinds and the advisory note that Design Requirement 8 and
 *                                  Roadmap v5 §8 name (R36)
 *   legal_organisations            the two Bob named (K283 (2), K303, R36); unmeasured
 *   locale                         the render locale every capture has asked for (R37); unmeasured
 *   systems[].links                REC-206's gateway shapes, measured on M-120's agenda (R38)
 *   time_zone, hours, holidays     the T20 calendar research (`build/plan/research-oakland-calendar.md`), filed
 *                                  as M-187–M-196 and read by K925; each `researched`, or absent where no source
 *                                  publishes the fact (R41–R45). No template: none is approved (K921 Q1, R45).
 *   the first sourced rule set     T33's desk research, `build/plan/measures-T33/time-law.md` (2026-10-05): every
 *                                  rule with its primary source, the closure lists it counts on, the weekend, CCP
 *                                  §12's computation, the receipt rule, the five counterparties re-based on their
 *                                  primary sources, `minutes_due_days` corrected (R56; K1445, K1504). A rule or fact
 *                                  with no primary source is absent, never `UNMEASURED` (R44).
 *   meeting markers, body variants Legistar's own body names (`measures-T33/legistar-events.md` §1–§2, 2026-10-05)
 *   lawful_demands                 Gov. Code §7928.215 as K1493 rules it (R53)
 *   policy series (T35)            the City's Administrative Instructions, OPD's General Orders, Special Orders and
 *                                  Training Bulletins, OUSD's Board Policies and Administrative Regulations, each read
 *                                  on its primary pages 2026-10-07 (the pages and the citations measured are in
 *                                  `test/fixtures/policies.mjs`), with the header labels they print (R67, R69), and
 *                                  the CALEA standards OPD's General Orders cite by designation (K1930).
 *   Legistar's ids (T34)           the `body` and `office` spaces, their schemes and the counterparties' BodyIds, from
 *                                  legistar-reader's captured `bodies` and `officerecords` (2026-10-05; R61). The
 *                                  MemberTypes measured (Member, Chair) mapped on the Council only: elsewhere they sit
 *                                  on elected and appointed holders alike (R60, K1729). No `vote_values`: two captured
 *                                  roll calls show only Aye and Excused, not the whole set (R58). No institution scheme
 *                                  until a registry is measured (N632, K1729).
 *   T45's action facts (R85)       each read on its primary source on 2026-10-11 (the operative text quoted, with its
 *                                  worked examples, in `test/fixtures/actions-law.mjs` and the job record
 *                                  `build/jobs/T45/jurisdictions.md`): whose duty each deadline is; the Brown Act's
 *                                  cure-and-correct demand and its periods; the grand jury's comment periods and the
 *                                  statuses Penal Code § 933.05 sets; the anti-SLAPP motion's period; the Claims Act
 *                                  board's 45 days; FOIA's appeal; the legal facts shown at their moment; the stages and
 *                                  requesters of each records law; FAC's defence scope; the federal 2027 list. What no
 *                                  source supports is absent, never `UNMEASURED` (R44, R83): no office keeps another time
 *                                  zone (M-T45-3); no 2027 judicial or City list is published; no procedure guide,
 *                                  template, venue fact or phrasing is written here.
 *   pointers (T48, R92)            where else a member is sent, each read on the body's own page on 2026-10-14 (the
 *                                  address read is its source; the reads, with the words each fact rests on, are in
 *                                  `test/fixtures/pointers.mjs` and the job record `build/jobs/T48/jurisdictions.md`):
 *                                  legal aid as the State Bar's Pro Bono Opportunities Directory lists it under Alameda
 *                                  County (every program there a Legal Services Trust Fund grantee); the Superior Court's
 *                                  and the Judicial Council's self-help pages; OAK 311; each office on the Council's
 *                                  roster; the offices whose own pages take one person's complaint; newsrooms' own tip
 *                                  pages. No emergency number is held (DEC-227 (4)).
 *
 * Plain data: patterns are `{re, flags?}` with a JavaScript regular-expression source. */
export default {
  "id": "us-ca-oakland",
  "name": "City of Oakland",
  "covers": [
    "Oakland"
  ],
  "test": false,
  "layer": {
    "level": "city",
    "place": "Oakland",
    "within": "us-ca-alameda-county",
    "origin": "civicsmith"
  },
  "coverage": {
    "as_of": "2026-12-25",
    "holidays_through": 2026
  },
  "records_laws": [
    {
      "level": "city",
      "name": "Oakland Sunshine Ordinance",
      "citation": "Oakland Mun. Code ch. 2.20",
      "stages": [
        {
          "stage": "request",
          "label": "Immediate Disclosure Request",
          "citation": "Oakland Mun. Code § 2.20.230(A), (B)"
        },
        {
          "stage": "extension_notice",
          "label": "advice that additional time is needed",
          "citation": "Oakland Mun. Code § 2.20.230(A), (B)"
        },
        {
          "stage": "production",
          "label": "disclosable records provided for inspection or copying",
          "citation": "Oakland Mun. Code § 2.20.230(B)"
        },
        {
          "stage": "denial",
          "label": "withholding justified in writing",
          "citation": "Oakland Mun. Code § 2.20.250"
        },
        {
          "stage": "court_filing",
          "label": "proceedings for injunctive relief, declaratory relief, or writ of mandate",
          "citation": "Oakland Mun. Code § 2.20.270(B)(1)"
        }
      ],
      "requesters": {
        "text": "any person; no reason or use need be stated",
        "citation": "Oakland Mun. Code §§ 2.20.230(D), 2.20.270(B)(1)",
        "status": "researched",
        "basis": "2026-10-11 actions-law"
      },
      "response": "immediate_disclosure",
      "basis": "2026-10-05 time-law",
      "governs": [
        "city"
      ]
    }
  ],
  "deadlines": [
    {
      "rule": "records_response",
      "applies_to": "records_request",
      "observed": {
        "closures": "city",
        "status": "researched",
        "basis": "2026-10-05 time-law"
      },
      "status": "researched",
      "basis": "2026-10-05 time-law"
    },
    {
      "rule": "immediate_disclosure",
      "applies_to": "records_request",
      "units": "days",
      "amount": 3,
      "count": "business",
      "direction": "forward",
      "starts": "received",
      "closures": "city",
      "owed_by": "body",
      "citation": "Oakland Mun. Code § 2.20.230",
      "status": "researched",
      "basis": "2026-10-05 time-law"
    },
    {
      "rule": "omc_special_meeting_notice",
      "applies_to": "public_comment",
      "units": "business_hours",
      "amount": 48,
      "direction": "backward",
      "starts": "act",
      "closures": "city",
      "owed_by": "body",
      "citation": "Oakland Mun. Code § 2.20.070",
      "status": "researched",
      "basis": "2026-10-05 time-law"
    },
    {
      "rule": "omc_special_meeting_monday",
      "applies_to": "public_comment",
      "units": "days",
      "amount": 3,
      "count": "calendar",
      "direction": "backward",
      "starts": "act",
      "applies_on": [
        "mon"
      ],
      "due_at": "12:00",
      "owed_by": "body",
      "citation": "Oakland Mun. Code § 2.20.070(C)",
      "status": "researched",
      "basis": "2026-10-05 time-law"
    }
  ],
  "holidays": [
    {
      "year": 2026,
      "offices": [
        "Controller",
        "City Council",
        "City Auditor"
      ],
      "days": [
        {
          "date": "2026-01-01",
          "name": "New Year's Day"
        },
        {
          "date": "2026-01-19",
          "name": "Dr. Martin Luther King, Jr. Day"
        },
        {
          "date": "2026-02-16",
          "name": "President's Day"
        },
        {
          "date": "2026-03-31",
          "name": "Cesar Chavez Day"
        },
        {
          "date": "2026-05-25",
          "name": "Memorial Day"
        },
        {
          "date": "2026-06-19",
          "name": "Juneteenth National Independence Day"
        },
        {
          "date": "2026-07-04",
          "name": "Independence Day"
        },
        {
          "date": "2026-09-07",
          "name": "Labor Day"
        },
        {
          "date": "2026-11-26",
          "name": "Thanksgiving Day"
        },
        {
          "date": "2026-11-27",
          "name": "Day After Thanksgiving"
        },
        {
          "date": "2026-12-25",
          "name": "Christmas Day"
        }
      ],
      "status": "researched",
      "basis": "M-190"
    },
    {
      "year": 2026,
      "list": "city",
      "citation": "City of Oakland holiday list (M-190); Oakland Mun. Code § 2.20.070 \"holidays\" (K1504 (5))",
      "days": [
        {
          "date": "2026-01-01",
          "name": "New Year's Day"
        },
        {
          "date": "2026-01-19",
          "name": "Dr. Martin Luther King, Jr. Day"
        },
        {
          "date": "2026-02-16",
          "name": "President's Day"
        },
        {
          "date": "2026-03-31",
          "name": "Cesar Chavez Day"
        },
        {
          "date": "2026-05-25",
          "name": "Memorial Day"
        },
        {
          "date": "2026-06-19",
          "name": "Juneteenth National Independence Day"
        },
        {
          "date": "2026-07-04",
          "name": "Independence Day"
        },
        {
          "date": "2026-09-07",
          "name": "Labor Day"
        },
        {
          "date": "2026-11-26",
          "name": "Thanksgiving Day"
        },
        {
          "date": "2026-11-27",
          "name": "Day After Thanksgiving"
        },
        {
          "date": "2026-12-25",
          "name": "Christmas Day"
        }
      ],
      "status": "researched",
      "basis": "M-190, 2026-10-05 time-law"
    }
  ],
  "counterparties": [
    {
      "role": "Controller",
      "body": "Finance Department",
      "level": "city",
      "elected": false,
      "ids": {
        "body": {
          "scheme": "legistar_body_id",
          "id": "171"
        }
      },
      "within": {
        "label": "City of Oakland",
        "kind": "institution",
        "ids": []
      },
      "basis": "2026-10-05 time-law, 2026-10-05 legistar-events"
    },
    {
      "role": "City Council",
      "body": "Oakland City Council",
      "level": "city",
      "elected": true,
      "ids": {
        "body": {
          "scheme": "legistar_body_id",
          "id": "1"
        }
      },
      "within": {
        "label": "City of Oakland",
        "kind": "institution",
        "ids": []
      },
      "organisation": "city_council",
      "basis": "2026-10-05 time-law, 2026-10-05 legistar-events"
    },
    {
      "role": "City Auditor",
      "body": "Office Of The City Auditor",
      "level": "city",
      "elected": true,
      "oversight": true,
      "hours": {
        "weekly": [
          {
            "day": "mon",
            "open": "08:30",
            "close": "17:00"
          },
          {
            "day": "tue",
            "open": "08:30",
            "close": "17:00"
          },
          {
            "day": "wed",
            "open": "08:30",
            "close": "17:00"
          },
          {
            "day": "thu",
            "open": "08:30",
            "close": "17:00"
          },
          {
            "day": "fri",
            "open": "08:30",
            "close": "17:00"
          }
        ],
        "status": "researched",
        "basis": "M-192"
      },
      "ids": {
        "body": {
          "scheme": "legistar_body_id",
          "id": "16"
        }
      },
      "within": {
        "label": "City of Oakland",
        "kind": "institution",
        "ids": []
      },
      "basis": "2026-10-05 time-law, 2026-10-05 legistar-events"
    }
  ],
  "fiscal_year": [
    {
      "body": "*",
      "start": "07-01",
      "named_by": "start",
      "label": "FY{start}-{end2}",
      "status": "researched",
      "basis": "2026-10-25 oakland-charter-s800, 2026-10-22 oaklandca.gov-fy2025-27-budget"
    },
    {
      "body": "Finance Department",
      "start": "07-01",
      "named_by": "start",
      "label": "FY{start}-{end2}",
      "status": "researched",
      "basis": "2026-10-22 oaklandca.gov-fy2025-27-budget"
    },
    {
      "body": "Oakland City Council",
      "start": "07-01",
      "named_by": "start",
      "label": "FY{start}-{end2}",
      "status": "researched",
      "basis": "2026-10-22 oaklandca.gov-fy2025-27-budget"
    },
    {
      "body": "Office Of The City Auditor",
      "start": "07-01",
      "named_by": "start",
      "label": "FY{start}-{end2}",
      "status": "researched",
      "basis": "2026-10-22 oaklandca.gov-fy2025-27-budget"
    }
  ],
  "standard_sources": [
    {
      "source": "Oakland Municipal Code",
      "kind": "ordinance",
      "issuer": "Oakland City Council",
      "cite": {
        "re": "\\b(?:O\\.?M\\.?C\\.?|Oakland\\s+Municipal\\s+Code)\\s+(?:Section|Chapter)\\s+[\\d.]+[\\w.]*",
        "flags": "i"
      },
      "level": "city",
      "code": "omc",
      "basis": "M-24"
    },
    {
      "source": "Ordinances and resolutions of the Oakland City Council",
      "kind": "ordinance",
      "issuer": "Oakland City Council",
      "level": "city",
      "cite": {
        "re": "\\b(?:Ordinance|Resolution)\\s+No\\.?\\s*\\d{3,6}(?:\\s*C\\.?\\s?M\\.?\\s?S\\.?)?",
        "flags": "i"
      },
      "basis": "M-24"
    },
    {
      "source": "City of Oakland Administrative Instructions",
      "kind": "policy",
      "issuer": "City Administrator",
      "level": "city",
      "key": "city-administrator",
      "series": {
        "key": "ai",
        "label": "Administrative Instruction"
      },
      "cite": {
        "re": "\\b(?:(?:City\\s+)?Administrative\\s+Instruction|A\\.I\\.|AI)\\s+(?:No\\.\\s*)?(?<number>\\d{1,4})\\b"
      },
      "basis": "2026-10-07 policies"
    },
    {
      "source": "Oakland Police Department Departmental General Orders",
      "kind": "policy",
      "issuer": "Office of Chief of Police, Oakland Police Department",
      "level": "city",
      "key": "opd",
      "series": {
        "key": "dgo",
        "label": "Departmental General Order"
      },
      "cite": {
        "re": "\\b(?:DGOs?|Departmental\\s+General\\s+Orders?(?:\\s+\\(DGO\\))?)\\s+(?<number>([A-Z])-(\\d{1,2})(\\.\\d{1,2})?)(?::\\s+(?<portion>[IVX]+(?:\\s[A-Z])?)\\b)?"
      },
      "normal": [
        {
          "group": 2
        },
        "-",
        {
          "group": 3,
          "unpad": true
        },
        {
          "group": 4,
          "default": ""
        }
      ],
      "basis": "2026-10-07 policies"
    },
    {
      "source": "Oakland Police Department Special Orders",
      "kind": "policy",
      "issuer": "Office of Chief of Police, Oakland Police Department",
      "level": "city",
      "key": "opd",
      "series": {
        "key": "so",
        "label": "Special Order"
      },
      "cite": {
        "re": "\\b(?:Special\\s+Orders?|SPECIAL\\s+ORDER|SO)\\s+(?:NO\\.\\s*)?(?<number>\\d{4})\\b"
      },
      "basis": "2026-10-07 policies"
    },
    {
      "source": "Oakland Police Department Training Bulletins",
      "kind": "policy",
      "issuer": "Office of Chief of Police, Oakland Police Department",
      "level": "city",
      "key": "opd",
      "series": {
        "key": "tb",
        "label": "Training Bulletin"
      },
      "cite": {
        "re": "\\b(?:Training\\s+Bulletins?|TB)\\s+(?<number>([IVX]+)[ -]([A-Z])(\\.\\d{1,2})?)\\b"
      },
      "normal": [
        {
          "group": 2
        },
        "-",
        {
          "group": 3
        },
        {
          "group": 4,
          "default": ""
        }
      ],
      "basis": "2026-10-07 policies"
    },
    {
      "source": "Oakland Unified School District Board Policies",
      "kind": "policy",
      "issuer": "Oakland Unified School District Governing Board",
      "sector": "government",
      "key": "ousd",
      "series": {
        "key": "bp",
        "label": "Board Policy"
      },
      "cite": {
        "re": "\\bBP(?:\\/AR)?\\s+(?<number>\\d{4}(?:\\.\\d{1,2})?)\\b"
      },
      "basis": "2026-10-07 policies"
    },
    {
      "source": "Oakland Unified School District Administrative Regulations",
      "kind": "policy",
      "issuer": "Oakland Unified School District",
      "sector": "government",
      "key": "ousd",
      "series": {
        "key": "ar",
        "label": "Administrative Regulation"
      },
      "cite": {
        "re": "\\b(?:BP\\/)?AR\\s+(?<number>\\d{4}(?:\\.\\d{1,2})?)\\b"
      },
      "basis": "2026-10-07 policies"
    },
    {
      "source": "CALEA Standards for Law Enforcement Agencies",
      "kind": "standard",
      "issuer": "Commission on Accreditation for Law Enforcement Agencies (CALEA)",
      "sector": "association",
      "key": "calea",
      "series": {
        "key": "standards",
        "label": "CALEA Standard"
      },
      "cite": {
        "re": "\\bCALEA[\\s:]+Standards?:?\\s+(?<number>\\d{1,3}\\.\\d{1,2}\\.\\d{1,2})\\b"
      },
      "basis": "2026-10-07 policies"
    }
  ],
  "legal_facts": [
    {
      "key": "lobbyist_registration",
      "trigger": "paid_attendee",
      "statement": "Anyone paid $1,000 or more in a calendar month to communicate with City officials to influence a City decision, or a salaried employee, officer or director of an organisation whose duties include doing so, is a local governmental lobbyist and must register with the Public Ethics Commission before lobbying.",
      "citation": "Oakland Mun. Code §§ 3.20.030(D), 3.20.040(A)",
      "threshold": {
        "amount": 1000,
        "unit": "USD in a calendar month"
      },
      "status": "researched",
      "basis": "2026-10-11 actions-law"
    }
  ],
  "forums": [
    {
      "label": "Oakland Public Ethics Commission",
      "forum_kind": "commission",
      "basis": "2026-10-25 oakland-pec-complaint-page"
    }
  ],
  "systems": [
    {
      "origin": "oakland.legistar",
      "name": "Legistar, the City of Oakland's legislative record",
      "hosts": [
        "webapi.legistar.com"
      ],
      "path": {
        "re": "^\\/v1\\/oakland(\\/|$)",
        "flags": "i"
      },
      "basis": "M-119 LEG"
    },
    {
      "origin": "oakland.legistar",
      "name": "Legistar, the City of Oakland's legislative record",
      "hosts": [
        "oakland.legistar.com",
        "oakland.legistar1.com"
      ],
      "links": {
        "item": {
          "re": "^\\/gateway\\.aspx\\?m=l&id=\\/matter\\.aspx\\?key=\\d+",
          "flags": "i"
        },
        "file": {
          "re": "^\\/gateway\\.aspx\\?m=f&id=[^&#]+",
          "flags": "i"
        }
      },
      "basis": "M-119 LEG, M-120"
    },
    {
      "origin": "oakland.budget",
      "name": "the City of Oakland's budget system (its Open Data line items)",
      "hosts": [
        "data.oaklandca.gov"
      ],
      "path": {
        "re": "vmzx-e5fe",
        "flags": "i"
      },
      "basis": "M-119 ODP"
    },
    {
      "origin": "oakland.permits",
      "name": "the City of Oakland's permit system (Accela)",
      "hosts": [
        "aca-prod.accela.com"
      ],
      "path": {
        "re": "\\/OAKLAND\\/",
        "flags": "i"
      },
      "basis": "M-157 (1)"
    },
    {
      "origin": "oakland.auditor",
      "name": "the Office of the City Auditor",
      "hosts": [
        "www.oaklandauditor.com"
      ],
      "basis": "M-119 AUD"
    },
    {
      "origin": "courtlistener_docket",
      "name": "CourtListener docket pages (Free Law Project)",
      "hosts": [
        "www.courtlistener.com"
      ],
      "path": {
        "re": "^\\/(?:docket\\/\\d+\\/|api\\/rest\\/v[34]\\/docket-entries\\/)"
      },
      "basis": "2026-10-05 courts-workbooks"
    },
    {
      "origin": "cpuc_proceeding",
      "name": "the California Public Utilities Commission's proceeding cards",
      "hosts": [
        "apps.cpuc.ca.gov"
      ],
      "path": {
        "re": "^\\/apex\\/f\\?p=401:5[67]:"
      },
      "basis": "2026-10-05 courts-workbooks"
    },
    {
      "origin": "oakland.opendata",
      "name": "the City of Oakland's open-data portal (campaign filing and lobbyist datasets)",
      "hosts": [
        "data.oaklandca.gov"
      ],
      "path": {
        "re": "^\\/(?:d|api\\/views|resource)\\/(?:3xq4-ermg|rsxe-vvuw|bvfu-nq99|ss9a-d595|ucs9-a92d|xvc7-ctj7|f4dq-mk8d)(?:[/.]|$)"
      },
      "gated": "none",
      "terms": "Creative Commons 1.0 Universal (Public Domain Dedication); attribution: City of Oakland Public Ethics Commission",
      "basis": "2026-10-21 M-R1"
    }
  ],
  "pointers": [
    {
      "kind": "service",
      "name": "OAK 311",
      "does": "The City of Oakland's line for reporting problems such as potholes, illegal dumping, graffiti and city building maintenance.",
      "contacts": [
        {
          "how": "phone",
          "value": "(510) 615-5566"
        },
        {
          "how": "web",
          "value": "https://www.oaklandca.gov/My-Household/Report-an-Issue-OAK-311"
        }
      ],
      "source": "https://www.oaklandca.gov/My-Household/Report-an-Issue-OAK-311",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    },
    {
      "kind": "representative",
      "name": "Oakland City Council, At-Large office",
      "does": "The office of the Councilmember elected at large, who represents the whole city on the Oakland City Council.",
      "contacts": [
        {
          "how": "phone",
          "value": "(510) 238-7008"
        },
        {
          "how": "email",
          "value": "atlarge@oaklandca.gov"
        }
      ],
      "source": "https://www.oaklandca.gov/Government/City-Council-Leadership/Leadership",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    },
    {
      "kind": "representative",
      "name": "Oakland City Council, District 1 office",
      "does": "The office of the Councilmember elected for District 1, who represents District 1 on the Oakland City Council.",
      "contacts": [
        {
          "how": "phone",
          "value": "510-238-7001"
        },
        {
          "how": "email",
          "value": "zunger@oaklandca.gov"
        }
      ],
      "source": "https://www.oaklandca.gov/Government/City-Council-Leadership/Leadership",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    },
    {
      "kind": "representative",
      "name": "Oakland City Council, District 2 office",
      "does": "The office of the Councilmember elected for District 2, who represents District 2 on the Oakland City Council.",
      "contacts": [
        {
          "how": "phone",
          "value": "510-238-7021"
        },
        {
          "how": "email",
          "value": "district2@oaklandca.gov"
        }
      ],
      "source": "https://www.oaklandca.gov/Government/City-Council-Leadership/Leadership",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    },
    {
      "kind": "representative",
      "name": "Oakland City Council, District 3 office",
      "does": "The office of the Councilmember elected for District 3, who represents District 3 on the Oakland City Council.",
      "contacts": [
        {
          "how": "phone",
          "value": "(510) 238-7003"
        },
        {
          "how": "email",
          "value": "District3@oaklandca.gov"
        }
      ],
      "source": "https://www.oaklandca.gov/Government/City-Council-Leadership/Leadership",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    },
    {
      "kind": "representative",
      "name": "Oakland City Council, District 4 office",
      "does": "The office of the Councilmember elected for District 4, who represents District 4 on the Oakland City Council.",
      "contacts": [
        {
          "how": "phone",
          "value": "510-238-7004"
        },
        {
          "how": "email",
          "value": "District4@oaklandca.gov"
        }
      ],
      "source": "https://www.oaklandca.gov/Government/City-Council-Leadership/Leadership",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    },
    {
      "kind": "representative",
      "name": "Oakland City Council, District 5 office",
      "does": "The office of the Councilmember elected for District 5, who represents District 5 on the Oakland City Council.",
      "contacts": [
        {
          "how": "phone",
          "value": "510-238-7005"
        },
        {
          "how": "email",
          "value": "Ngallo@oaklandca.gov"
        }
      ],
      "source": "https://www.oaklandca.gov/Government/City-Council-Leadership/Leadership",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    },
    {
      "kind": "representative",
      "name": "Oakland City Council, District 6 office",
      "does": "The office of the Councilmember elected for District 6, who represents District 6 on the Oakland City Council.",
      "contacts": [
        {
          "how": "phone",
          "value": "(510) 238-7006"
        },
        {
          "how": "email",
          "value": "District6@oaklandca.gov"
        }
      ],
      "source": "https://www.oaklandca.gov/Government/City-Council-Leadership/Leadership",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    },
    {
      "kind": "representative",
      "name": "Oakland City Council, District 7 office",
      "does": "The office of the Councilmember elected for District 7, who represents District 7 on the Oakland City Council.",
      "contacts": [
        {
          "how": "phone",
          "value": "510-238-7007"
        },
        {
          "how": "email",
          "value": "District7@oaklandca.gov"
        }
      ],
      "source": "https://www.oaklandca.gov/Government/City-Council-Leadership/Leadership",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    },
    {
      "kind": "agency",
      "name": "Community Police Review Agency",
      "does": "Takes a member of the public's complaint about the conduct of an Oakland police officer.",
      "contacts": [
        {
          "how": "phone",
          "value": "(510) 238-3159"
        },
        {
          "how": "web",
          "value": "https://apps.oaklandca.gov/CPRAPublic/"
        },
        {
          "how": "address",
          "value": "250 Frank Ogawa Plaza, Suite 6302, Oakland, CA 94612"
        }
      ],
      "hours": {
        "weekly": [
          {
            "day": "mon",
            "open": "09:00",
            "close": "17:00"
          },
          {
            "day": "tue",
            "open": "09:00",
            "close": "17:00"
          },
          {
            "day": "wed",
            "open": "09:00",
            "close": "17:00"
          },
          {
            "day": "thu",
            "open": "09:00",
            "close": "17:00"
          },
          {
            "day": "fri",
            "open": "09:00",
            "close": "17:00"
          }
        ],
        "status": "researched",
        "basis": "2026-10-14 pointers"
      },
      "source": "https://www.oaklandca.gov/Public-Safety-Streets/Report-Police-Misconduct",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    },
    {
      "kind": "agency",
      "name": "Public Ethics Commission",
      "does": "Takes complaints of violations of government ethics, campaign finance or transparency laws in the City of Oakland.",
      "contacts": [
        {
          "how": "phone",
          "value": "(510) 238-3593"
        },
        {
          "how": "email",
          "value": "ethicscommission@oaklandca.gov"
        },
        {
          "how": "address",
          "value": "250 Frank H Ogawa Plaza, Suite 6303, Oakland, CA 94612"
        }
      ],
      "source": "https://www.oaklandca.gov/Government/Boards-Commissions/Public-Ethics-Commission/File-a-Complaint-with-the-Public-Ethics-Commission",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    },
    {
      "kind": "agency",
      "name": "Rent Adjustment Program",
      "does": "Takes a tenant's petition challenging certain rent increases or seeking a decrease in rent for a loss in service, for units under the Rent Adjustment Ordinance.",
      "contacts": [
        {
          "how": "phone",
          "value": "(510) 238-3721"
        },
        {
          "how": "email",
          "value": "RAP@oaklandca.gov"
        },
        {
          "how": "address",
          "value": "250 Frank H. Ogawa Plaza, Suite 5313, Oakland, CA 94612"
        }
      ],
      "hours": {
        "weekly": [
          {
            "day": "mon",
            "open": "09:30",
            "close": "16:30"
          },
          {
            "day": "tue",
            "open": "09:30",
            "close": "16:30"
          },
          {
            "day": "wed",
            "open": "09:30",
            "close": "16:30"
          },
          {
            "day": "thu",
            "open": "09:30",
            "close": "16:30"
          }
        ],
        "status": "researched",
        "basis": "2026-10-14 pointers"
      },
      "source": "https://www.oaklandca.gov/Community/Housing-Programs-Support/Rent-Adjustment-Program-RAP/For-Tenants/File-a-Tenant-Petition",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    },
    {
      "kind": "agency",
      "name": "City Auditor's Whistleblower Program",
      "does": "A confidential hotline, open to residents, for complaints of fraud, waste and abuse in the City of Oakland, with interpreters.",
      "contacts": [
        {
          "how": "phone",
          "value": "1-888-329-6390"
        },
        {
          "how": "web",
          "value": "https://secure.ethicspoint.com/domain/media/en/gui/23089/issues.html?locationid=-1"
        }
      ],
      "source": "https://www.oaklandauditor.com/whistleblower/submit-a-complaint/",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    },
    {
      "kind": "tipline",
      "name": "San Francisco Chronicle",
      "does": "A daily newspaper that takes news tips, including sensitive tips to its investigative team.",
      "contacts": [
        {
          "how": "email",
          "value": "metro@sfchronicle.com"
        },
        {
          "how": "phone",
          "value": "(415) 777-7239"
        },
        {
          "how": "mail",
          "value": "News Tips, The San Francisco Chronicle, 901 Mission Street, San Francisco CA 94103"
        }
      ],
      "source": "https://projects.sfchronicle.com/newstips/",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    },
    {
      "kind": "tipline",
      "name": "KTVU Fox 2",
      "does": "A television newsroom in Oakland that takes news tips and story ideas.",
      "contacts": [
        {
          "how": "email",
          "value": "newstips@fox.com"
        },
        {
          "how": "phone",
          "value": "(510) 874-0242"
        }
      ],
      "source": "https://www.ktvu.com/about-us",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    },
    {
      "kind": "tipline",
      "name": "CalMatters",
      "does": "A newsroom covering California that takes news tips, by email or through confidential channels.",
      "contacts": [
        {
          "how": "email",
          "value": "tips@calmatters.org"
        },
        {
          "how": "web",
          "value": "https://calmatters.org/about/contact-us/#news-tips"
        }
      ],
      "source": "https://calmatters.org/about/contact-us/#news-tips",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    }
  ],
  "action_kinds": [
    {
      "kind": "records_request",
      "label": "public records request",
      "tier": 1,
      "laws": [
        "California Public Records Act",
        "Oakland Sunshine Ordinance"
      ],
      "venue": {
        "name": "the City's public records request portal (NextRequest)",
        "how": "portal",
        "basis": "2026-10-05 time-law",
        "receipt": {
          "rule": "next_business_day",
          "citation": "Oakland City Attorney, Public Records Act staff guide § 5 (2025-04-29)",
          "status": "researched",
          "basis": "2026-10-05 time-law"
        }
      },
      "basis": "D-182"
    },
    {
      "kind": "controller_referral",
      "label": "referral to the State Controller",
      "tier": 1,
      "basis": "D-182"
    },
    {
      "kind": "media",
      "label": "media outreach",
      "tier": 1,
      "basis": "D-182"
    },
    {
      "kind": "litigation_support",
      "label": "support for litigation",
      "basis": "UNMEASURED"
    },
    {
      "kind": "request_for_comment",
      "label": "request for comment on specific claims",
      "basis": "DEC-13"
    },
    {
      "kind": "other",
      "label": "other action",
      "basis": "UNMEASURED"
    },
    {
      "kind": "party_participation",
      "label": "taking part as a formal party before a venue",
      "tier": 2,
      "advisory": "File with caution: a party's filings are bound by the venue's own rules of practice and deadlines, and a procedural error can cost the party its standing. Legal review before filing is recommended.",
      "basis": "K2780"
    },
    {
      "kind": "assessment_challenge",
      "label": "challenge to a tax, assessment or fee under Proposition 218",
      "tier": 3,
      "basis": "D-182"
    },
    {
      "kind": "taxpayer_action",
      "label": "taxpayer action (Code of Civil Procedure § 526a)",
      "tier": 3,
      "basis": "D-182"
    },
    {
      "kind": "consent_decree_motion",
      "label": "motion under a federal consent decree",
      "tier": 3,
      "basis": "D-182"
    },
    {
      "kind": "constitutional_claim",
      "label": "claim involving constitutional interpretation or statutory construction",
      "tier": 3,
      "basis": "D-182"
    }
  ],
  "records_help": [
    {
      "law": "California Public Records Act",
      "portal": {
        "name": "the City of Oakland's public records request portal (NextRequest)",
        "url": "https://oaklandca.nextrequest.com/"
      },
      "faster": {
        "ordinance": "Oakland Sunshine Ordinance",
        "window": "three business days",
        "request": "Immediate Disclosure Request",
        "citation": "Oakland Mun. Code § 2.20.230(A)"
      },
      "status": "researched",
      "basis": "2026-10-25 leginfo-bulk-download, 2026-10-25 opd-dgo-m-9-1, 2026-10-11 actions-law"
    }
  ],
  "vocabulary": {
    "furniture": [
      {
        "pattern": {
          "re": "^City of Oakland$",
          "flags": "i"
        },
        "basis": "2026-08-03, M-24"
      },
      {
        "pattern": {
          "re": "^Office of the City Clerk$",
          "flags": "i"
        },
        "basis": "M-24"
      },
      {
        "pattern": {
          "re": "^View Report$",
          "flags": "i"
        },
        "basis": "2026-08-03, M-24"
      },
      {
        "pattern": {
          "re": "^View Legislation$",
          "flags": "i"
        },
        "basis": "M-24"
      },
      {
        "pattern": {
          "re": "^View (Attachment|Supplemental)\\b",
          "flags": "i"
        },
        "basis": "M-24"
      },
      {
        "pattern": {
          "re": "^Attachments:$",
          "flags": "i"
        },
        "basis": "2026-08-03, M-24"
      },
      {
        "pattern": {
          "re": "^Sponsors:$",
          "flags": "i"
        },
        "basis": "2026-08-03, M-24"
      }
    ],
    "bodies": [
      {
        "pattern": {
          "re": "(Committee|City Council|Commission|Board|Authority)\\s*$"
        },
        "basis": "2026-08-03, M-24"
      },
      {
        "pattern": {
          "re": "\\b(?:CITY\\s+COUNCIL|COUNCIL\\s+OF\\s+THE\\s+CITY|BOARD\\s+OF\\s+[A-Z]+|COMMISSION|AUTHORITY|CITY\\s+OF\\s+[A-Z]+)\\b"
        },
        "basis": "M-24"
      }
    ],
    "member_titles": [
      {
        "pattern": {
          "re": "^Councilmember",
          "flags": "i"
        },
        "basis": "2026-08-03, M-24"
      }
    ],
    "enactment_markers": [
      {
        "pattern": {
          "re": "C\\.?\\s?M\\.?\\s?S\\.?",
          "flags": "i"
        },
        "basis": "M-24, M-132"
      }
    ],
    "codes": [
      {
        "key": "omc",
        "label": "O.M.C.",
        "pattern": {
          "re": "O\\.?M\\.?C\\.?|Oakland\\s+Municipal\\s+Code",
          "flags": "i"
        },
        "copy": "codifier",
        "sections": {
          "number": {
            "re": "\\d+\\.\\d+\\.\\d+[A-Z]?"
          },
          "separators": ".",
          "markers": [
            "letter",
            "numeral",
            "letter",
            "roman",
            "paren_numeral"
          ]
        },
        "basis": "M-24, 2026-10-05 time-law, 2026-10-05 doctypes"
      },
      {
        "key": "charter",
        "label": "Oakland City Charter",
        "pattern": {
          "re": "(?:Oakland\\s+)?City\\s+Charter",
          "flags": "i"
        },
        "copy": "codifier",
        "sections": {
          "number": {
            "re": "\\d{3,4}"
          },
          "separators": "",
          "markers": [
            "paren_letter",
            "paren_numeral",
            "paren_letter",
            "roman"
          ]
        },
        "basis": "2026-10-05 time-law, 2026-10-05 doctypes"
      }
    ],
    "file_numbers": [
      {
        "pattern": {
          "re": "\\d{2}-\\d{4}"
        },
        "system": "oakland.legistar",
        "basis": "2026-08-03, M-24"
      }
    ],
    "report_titles": [
      {
        "pattern": {
          "re": "^AGENDA\\s+REPORT\\b",
          "flags": "i"
        },
        "basis": "M-24"
      },
      {
        "pattern": {
          "re": "^STAFF\\s+REPORT\\b",
          "flags": "i"
        },
        "basis": "M-24"
      },
      {
        "pattern": {
          "re": "^INFORMATIONAL\\s+REPORT\\b",
          "flags": "i"
        },
        "basis": "M-24"
      },
      {
        "pattern": {
          "re": "^CITY\\s+ADMINISTRATOR'?S?\\s+REPORT\\b",
          "flags": "i"
        },
        "basis": "M-24"
      }
    ],
    "report_sections": [
      {
        "pattern": {
          "re": "^RECOMMENDATION\\b",
          "flags": "i"
        },
        "basis": "M-24"
      },
      {
        "pattern": {
          "re": "^EXECUTIVE\\s+SUMMARY\\b",
          "flags": "i"
        },
        "basis": "M-24"
      },
      {
        "pattern": {
          "re": "^(BACKGROUND|LEGISLATIVE\\s+HISTORY|BACKGROUND\\s*\\/\\s*LEGISLATIVE\\s+HISTORY)\\b",
          "flags": "i"
        },
        "basis": "M-24"
      },
      {
        "pattern": {
          "re": "^ANALYSIS(\\s+AND\\s+POLICY\\s+ALTERNATIVES)?\\b",
          "flags": "i"
        },
        "basis": "M-24"
      },
      {
        "pattern": {
          "re": "^FISCAL\\s+IMPACT\\b",
          "flags": "i"
        },
        "basis": "M-24"
      },
      {
        "pattern": {
          "re": "^PUBLIC\\s+OUTREACH\\b",
          "flags": "i"
        },
        "basis": "M-24"
      },
      {
        "pattern": {
          "re": "^COORDINATION\\b",
          "flags": "i"
        },
        "basis": "M-24"
      },
      {
        "pattern": {
          "re": "^SUSTAINABLE\\s+OPPORTUNITIES\\b",
          "flags": "i"
        },
        "basis": "M-24"
      },
      {
        "pattern": {
          "re": "^ACTION\\s+REQUESTED\\b",
          "flags": "i"
        },
        "basis": "M-24"
      },
      {
        "pattern": {
          "re": "^REASON\\s+FOR\\b",
          "flags": "i"
        },
        "basis": "M-24"
      }
    ],
    "recommendation_openers": [
      {
        "pattern": {
          "re": "\\bStaff\\s+Recommends\\s+That\\b",
          "flags": "i"
        },
        "basis": "M-24"
      }
    ],
    "template_blanks": [
      {
        "pattern": {
          "re": "^\\s*INTRODUCED\\s+BY\\b[^\\]]*\\]",
          "flags": "i"
        },
        "basis": "M-24"
      }
    ],
    "meeting_markers": [
      {
        "marker": "cancelled",
        "pattern": {
          "re": "\\s*-\\s*CANCELL(?:ED|ATION)\\s*$",
          "flags": "i"
        },
        "basis": "2026-10-05 legistar-events"
      },
      {
        "marker": "special",
        "pattern": {
          "re": "\\bSpecial\\b",
          "flags": "i"
        },
        "basis": "2026-10-05 legistar-events"
      },
      {
        "marker": "concurrent",
        "pattern": {
          "re": "\\bConcurrent\\b",
          "flags": "i"
        },
        "basis": "2026-10-05 legistar-events"
      }
    ],
    "body_variants": [
      {
        "pattern": {
          "re": "^\\W*Meeting of the Oakland City Council\\b",
          "flags": "i"
        },
        "organisation": "city_council",
        "basis": "2026-10-05 legistar-events"
      },
      {
        "pattern": {
          "re": "Rules\\s+(?:&|and)\\s+Legislation\\s+Committee",
          "flags": "i"
        },
        "organisation": "rules_committee",
        "basis": "2026-10-05 legistar-events"
      },
      {
        "pattern": {
          "re": "Finance\\s+(?:&|and)\\s+Management\\s+Committee",
          "flags": "i"
        },
        "organisation": "finance_management_committee",
        "basis": "2026-10-05 legistar-events"
      },
      {
        "pattern": {
          "re": "Community\\s+(?:&|and)\\s+Economic\\s+Development\\s+Committee",
          "flags": "i"
        },
        "organisation": "community_economic_development_committee",
        "basis": "2026-10-05 legistar-events"
      },
      {
        "pattern": {
          "re": "Public\\s+Safety\\s+Committee",
          "flags": "i"
        },
        "organisation": "public_safety_committee",
        "basis": "2026-10-05 legistar-events"
      },
      {
        "pattern": {
          "re": "Life\\s+Enrichment\\s+Committee",
          "flags": "i"
        },
        "organisation": "life_enrichment_committee",
        "basis": "2026-10-05 legistar-events"
      },
      {
        "pattern": {
          "re": "Public\\s+Works\\s+(?:(?:&|and)\\s+Transportation\\s+)?Committee",
          "flags": "i"
        },
        "organisation": "public_works_committee",
        "basis": "2026-10-05 legistar-events"
      }
    ],
    "member_types": [
      {
        "member_type": "Member",
        "organisation": "city_council",
        "capacity": "elected",
        "basis": "2026-10-05 legistar-events, 2026-10-05 time-law"
      },
      {
        "member_type": "Chair",
        "organisation": "city_council",
        "capacity": "elected",
        "basis": "2026-10-05 legistar-events, 2026-10-05 time-law"
      }
    ],
    "roster_words": [
      {
        "pattern": {
          "re": "\\brosters?\\b",
          "flags": "i"
        },
        "kind": "roster",
        "basis": "2026-10-05 roster-reader"
      },
      {
        "pattern": {
          "re": "\\borgani[sz]ational\\s+chart\\b|\\borg\\s+chart\\b",
          "flags": "i"
        },
        "kind": "chart",
        "basis": "2026-10-05 roster-reader"
      }
    ],
    "staff_titles": [
      {
        "pattern": {
          "re": "\\b(?:Co-|Vice\\s+)?Chair\\b",
          "flags": "i"
        },
        "basis": "2026-10-05 roster-reader"
      },
      {
        "pattern": {
          "re": "\\b(?:(?:Assistant|Deputy)\\s+)?City\\s+Administrator\\b",
          "flags": "i"
        },
        "basis": "2026-10-05 roster-reader"
      },
      {
        "pattern": {
          "re": "\\bCity\\s+(?:Attorney|Clerk)\\b",
          "flags": "i"
        },
        "basis": "2026-10-05 roster-reader"
      },
      {
        "pattern": {
          "re": "\\b(?:Director|Manager|Chief|Supervisor|Coordinator|Analyst|Inspector|Engineer|Custodian|Leader|Officer|Parliamentarians?|Accountant|Intern)\\b",
          "flags": "i"
        },
        "basis": "2026-10-05 roster-reader"
      }
    ],
    "roster_headers": [
      {
        "role": "name",
        "pattern": {
          "re": "^(?:Full\\s+)?Name$",
          "flags": "i"
        },
        "basis": "2026-10-05 roster-reader"
      },
      {
        "role": "title",
        "pattern": {
          "re": "^(?:Title|Position|Job\\s+Title)$",
          "flags": "i"
        },
        "basis": "2026-10-05 roster-reader"
      },
      {
        "role": "unit",
        "pattern": {
          "re": "^(?:Department|Division|Organization)$",
          "flags": "i"
        },
        "basis": "2026-10-05 roster-reader"
      },
      {
        "role": "employee_id",
        "pattern": {
          "re": "^Employee\\s+ID$",
          "flags": "i"
        },
        "basis": "2026-10-05 roster-reader"
      },
      {
        "role": "contact",
        "pattern": {
          "re": "^(?:Phone|Email|Address)$",
          "flags": "i"
        },
        "basis": "2026-10-05 roster-reader"
      }
    ],
    "financial_report_titles": [
      {
        "pattern": {
          "re": "\\b(?:Annual\\s+Comprehensive|Comprehensive\\s+Annual)\\s+Financial\\s+Report\\b",
          "flags": "i"
        },
        "basis": "2026-10-05 money-people"
      }
    ],
    "budget_book_titles": [
      {
        "pattern": {
          "re": "\\b(?:Adopted|Proposed)\\s+(?:Policy\\s+)?Budget\\b",
          "flags": "i"
        },
        "basis": "2026-10-05 money-people"
      }
    ],
    "financial_headings": [
      {
        "pattern": {
          "re": "S\\s*t\\s*a\\s*t\\s*e\\s*m\\s*e\\s*n\\s*t\\s*o\\s*f\\s*N\\s*e\\s*t\\s*P\\s*o\\s*s\\s*i\\s*t\\s*i\\s*o\\s*n",
          "flags": "i"
        },
        "basis": "2026-10-05 money-people"
      },
      {
        "pattern": {
          "re": "S\\s*t\\s*a\\s*t\\s*e\\s*m\\s*e\\s*n\\s*t\\s*o\\s*f\\s*A\\s*c\\s*t\\s*i\\s*v\\s*i\\s*t\\s*i\\s*e\\s*s",
          "flags": "i"
        },
        "basis": "2026-10-05 money-people"
      },
      {
        "pattern": {
          "re": "S\\s*t\\s*a\\s*t\\s*e\\s*m\\s*e\\s*n\\s*t\\s*o\\s*f\\s*C\\s*a\\s*s\\s*h\\s*F\\s*l\\s*o\\s*w\\s*s",
          "flags": "i"
        },
        "basis": "2026-10-05 money-people"
      },
      {
        "pattern": {
          "re": "B\\s*a\\s*l\\s*a\\s*n\\s*c\\s*e\\s*S\\s*h\\s*e\\s*e\\s*t",
          "flags": "i"
        },
        "basis": "2026-10-05 money-people"
      },
      {
        "pattern": {
          "re": "B\\s*u\\s*d\\s*g\\s*e\\s*t\\s*a\\s*n\\s*d\\s*A\\s*c\\s*t\\s*u\\s*a\\s*l",
          "flags": "i"
        },
        "basis": "2026-10-05 money-people"
      },
      {
        "pattern": {
          "re": "S\\s*u\\s*m\\s*m\\s*a\\s*r\\s*y\\s*T\\s*a\\s*b\\s*l\\s*e\\s*B\\s*y\\s*F\\s*u\\s*n\\s*d",
          "flags": "i"
        },
        "basis": "2026-10-05 money-people"
      },
      {
        "pattern": {
          "re": "C\\s*i\\s*t\\s*y\\s*w\\s*i\\s*d\\s*e\\s*C\\s*l\\s*a\\s*s\\s*s\\s*i\\s*f\\s*i\\s*c\\s*a\\s*t\\s*i\\s*o\\s*n\\s*S\\s*u\\s*m\\s*m\\s*a\\s*r\\s*y",
          "flags": "i"
        },
        "basis": "2026-10-05 money-people"
      },
      {
        "pattern": {
          "re": "P\\s*r\\s*o\\s*p\\s*e\\s*r\\s*t\\s*y\\s*T\\s*a\\s*x\\s*L\\s*e\\s*v\\s*i\\s*e\\s*s\\s*a\\s*n\\s*d\\s*C\\s*o\\s*l\\s*l\\s*e\\s*c\\s*t\\s*i\\s*o\\s*n\\s*s",
          "flags": "i"
        },
        "basis": "2026-10-05 money-people"
      },
      {
        "pattern": {
          "re": "G\\s*e\\s*n\\s*e\\s*r\\s*a\\s*l\\s*P\\s*u\\s*r\\s*p\\s*o\\s*s\\s*e\\s*F\\s*u\\s*n\\s*d\\s*R\\s*e\\s*v\\s*e\\s*n\\s*u\\s*e",
          "flags": "i"
        },
        "basis": "2026-10-05 money-people"
      },
      {
        "pattern": {
          "re": "E\\s*x\\s*p\\s*e\\s*n\\s*d\\s*i\\s*t\\s*u\\s*r\\s*e\\s*s\\s*B\\s*y\\s*F\\s*u\\s*n\\s*d",
          "flags": "i"
        },
        "basis": "2026-10-05 money-people"
      }
    ],
    "fiscal_year_forms": [
      {
        "pattern": {
          "re": "\\bFY\\s?(\\d{2}|\\d{4})-(\\d{2})\\b",
          "flags": "i"
        },
        "basis": "2026-10-05 money-people, 2026-10-05 legistar-events"
      },
      {
        "pattern": {
          "re": "\\bFY\\s?(\\d{4})\\b(?!-)",
          "flags": "i"
        },
        "basis": "2026-10-05 money-people"
      }
    ],
    "policy_headers": [
      {
        "field": "type",
        "pattern": {
          "re": "\\bADMINISTRATIVE\\s+INSTRUCTION\\b"
        },
        "basis": "2026-10-07 policies"
      },
      {
        "field": "type",
        "pattern": {
          "re": "\\bDEPARTMENTAL\\s+GENERAL\\s+ORDER\\b"
        },
        "basis": "2026-10-07 policies"
      },
      {
        "field": "type",
        "pattern": {
          "re": "\\bSPECIAL\\s+ORDER\\s+(?:NO\\.\\s*)?\\d"
        },
        "basis": "2026-10-07 policies"
      },
      {
        "field": "type",
        "pattern": {
          "re": "\\bTRAINING\\s+BULLETIN\\b"
        },
        "basis": "2026-10-07 policies"
      },
      {
        "field": "type",
        "pattern": {
          "re": "^\\s*(?:Board\\s+Policy|Administrative\\s+Regulation)\\s*$"
        },
        "basis": "2026-10-07 policies"
      },
      {
        "field": "number",
        "pattern": {
          "re": "\\bNUMBER\\b|\\bIndex\\s+Number\\b"
        },
        "basis": "2026-10-07 policies"
      },
      {
        "field": "title",
        "pattern": {
          "re": "\\bSUBJECT(?:\\/AGENCY)?\\b|\\bIndex\\s+as\\b"
        },
        "basis": "2026-10-07 policies"
      },
      {
        "field": "effective",
        "pattern": {
          "re": "\\bEFFECTIVE(?:\\s+DATE)?\\b|\\bEffective\\s+Date\\b|\\bDATE\\b|\\bNew\\s+Order\\b|\\bRev\\."
        },
        "basis": "2026-10-07 policies"
      },
      {
        "field": "supersedes",
        "pattern": {
          "re": "\\bSUPERSEDE\\b"
        },
        "basis": "2026-10-07 policies"
      },
      {
        "field": "reference",
        "pattern": {
          "re": "\\bREFERENCE\\b|\\bRef\\b"
        },
        "basis": "2026-10-07 policies"
      },
      {
        "field": "coordinator",
        "pattern": {
          "re": "\\b(?:Evaluation\\s+)?Coordinator\\b"
        },
        "basis": "2026-10-07 policies"
      },
      {
        "field": "review_due",
        "pattern": {
          "re": "\\bEvaluation\\s+(?:Due\\s+)?Date\\b"
        },
        "basis": "2026-10-07 policies"
      },
      {
        "field": "revision_cycle",
        "pattern": {
          "re": "\\bAutomatic\\s+Revision\\s+Cycle\\b"
        },
        "basis": "2026-10-07 policies"
      }
    ],
    "budget_headers": [
      {
        "column": "fund",
        "pattern": {
          "re": "^fund(?:_code)?$",
          "flags": "i"
        },
        "basis": "2026-10-05 money-people, 2026-10-05 legistar-events"
      },
      {
        "column": "org",
        "pattern": {
          "re": "^org(?:_code)?$",
          "flags": "i"
        },
        "basis": "2026-10-05 money-people, 2026-10-05 legistar-events"
      },
      {
        "column": "program",
        "pattern": {
          "re": "^(?:program(?:_code)?|prog)$",
          "flags": "i"
        },
        "basis": "2026-10-05 money-people, 2026-10-05 legistar-events"
      },
      {
        "column": "account",
        "pattern": {
          "re": "^(?:account(?:_code)?|acct)$",
          "flags": "i"
        },
        "basis": "2026-10-05 money-people, 2026-10-05 legistar-events"
      },
      {
        "column": "project",
        "pattern": {
          "re": "^project(?:_code)?$",
          "flags": "i"
        },
        "basis": "2026-10-05 money-people, 2026-10-05 legistar-events"
      },
      {
        "column": "department",
        "pattern": {
          "re": "^department$",
          "flags": "i"
        },
        "basis": "2026-10-05 legistar-events"
      },
      {
        "column": "amount",
        "pattern": {
          "re": "^(?:amount|amt)$",
          "flags": "i"
        },
        "basis": "2026-10-05 money-people, 2026-10-05 legistar-events"
      },
      {
        "column": "amount",
        "pattern": {
          "re": "^fy\\d{2}_\\d{2}_[a-z0-9_]+$",
          "flags": "i"
        },
        "basis": "2026-10-05 money-people, 2026-10-05 legistar-events"
      },
      {
        "column": "period",
        "pattern": {
          "re": "^(?:budget|budget_year_name)$",
          "flags": "i"
        },
        "basis": "2026-10-05 money-people, 2026-10-05 legistar-events"
      }
    ]
  },
  "spaces": {
    "enactment": {
      "label": "resolution or ordinance number (C.M.S.)",
      "forms": [
        {
          "form": "cms",
          "pattern": {
            "re": "^(?:C\\.?\\s?M\\.?\\s?S\\.?\\s*)?(\\d{4,5})(?:\\s*C\\.?\\s?M\\.?\\s?S\\b\\.?)?$",
            "flags": "i"
          },
          "normal": [
            {
              "group": 1
            }
          ],
          "clean": {
            "spaces": "collapse"
          },
          "basis": "M-119, M-132"
        }
      ],
      "kinds": [
        {
          "kind": "ordinance",
          "prefix": {
            "re": "ordinance\\s+(?:no\\.?\\s*|number\\s+)?",
            "flags": "i"
          },
          "floor": {
            "first": 12274,
            "system": "oakland.legistar",
            "basis": "M-132"
          },
          "basis": "M-119, M-132"
        },
        {
          "kind": "resolution",
          "prefix": {
            "re": "resolution\\s+(?:no\\.?\\s*|number\\s+)?",
            "flags": "i"
          },
          "floor": {
            "first": 75950,
            "system": "oakland.legistar",
            "basis": "M-132"
          },
          "basis": "M-119, M-132"
        }
      ]
    },
    "project": {
      "label": "project or capital improvement number",
      "forms": [
        {
          "form": "C#####",
          "pattern": {
            "re": "^(C\\d{5,6})$"
          },
          "normal": [
            {
              "group": 1
            }
          ],
          "clean": {
            "strip": [
              {
                "re": "#\\s*"
              }
            ],
            "spaces": "remove",
            "upper": true
          },
          "basis": "M-132"
        },
        {
          "form": "P#####",
          "pattern": {
            "re": "^(P\\d{5,6})$"
          },
          "normal": [
            {
              "group": 1
            }
          ],
          "clean": {
            "strip": [
              {
                "re": "#\\s*"
              }
            ],
            "spaces": "remove",
            "upper": true
          },
          "basis": "M-132"
        },
        {
          "form": "100xxxx",
          "pattern": {
            "re": "^(100\\d{4})$"
          },
          "normal": [
            {
              "group": 1
            }
          ],
          "clean": {
            "strip": [
              {
                "re": "#\\s*"
              }
            ],
            "spaces": "remove",
            "upper": true
          },
          "basis": "M-132"
        },
        {
          "form": "100xxxx+suffix",
          "pattern": {
            "re": "^(100\\d{4}[A-Z])$"
          },
          "normal": [
            {
              "group": 1
            }
          ],
          "clean": {
            "strip": [
              {
                "re": "#\\s*"
              }
            ],
            "spaces": "remove",
            "upper": true
          },
          "basis": "M-157"
        }
      ]
    },
    "fund": {
      "label": "fund code",
      "forms": [
        {
          "form": "####",
          "pattern": {
            "re": "^(\\d{4})$"
          },
          "normal": [
            {
              "group": 1
            }
          ],
          "clean": {
            "spaces": "collapse"
          },
          "basis": "M-119"
        }
      ]
    },
    "person": {
      "label": "person identifier, by scheme",
      "forms": [
        {
          "form": "legistar-person",
          "pattern": {
            "re": "^(\\d{1,7})$"
          },
          "normal": [
            {
              "group": 1
            }
          ],
          "clean": {
            "spaces": "remove"
          },
          "basis": "2026-10-05 legistar-events"
        }
      ]
    },
    "body": {
      "label": "body number in the legislative record",
      "forms": [
        {
          "form": "legistar-body",
          "pattern": {
            "re": "^(\\d{1,6})$"
          },
          "normal": [
            {
              "group": 1
            }
          ],
          "clean": {
            "spaces": "remove"
          },
          "basis": "2026-10-05 legistar-events"
        }
      ]
    },
    "office": {
      "label": "office record number in the legislative record",
      "forms": [
        {
          "form": "legistar-office-record",
          "pattern": {
            "re": "^(\\d{1,7})$"
          },
          "normal": [
            {
              "group": 1
            }
          ],
          "clean": {
            "spaces": "remove"
          },
          "basis": "2026-10-05 legistar-events"
        }
      ]
    },
    "proceeding": {
      "label": "proceeding or case number",
      "forms": [
        {
          "form": "alameda-civil",
          "pattern": {
            "re": "^(\\d{2}CV\\d{6})$"
          },
          "normal": [
            {
              "group": 1
            }
          ],
          "clean": {
            "spaces": "remove",
            "upper": true
          },
          "basis": "2026-10-05 courts-workbooks"
        },
        {
          "form": "alameda-legacy",
          "pattern": {
            "re": "^((?:RG|HG)\\d{8})$"
          },
          "normal": [
            {
              "group": 1
            }
          ],
          "clean": {
            "spaces": "remove",
            "upper": true
          },
          "basis": "2026-10-05 courts-workbooks"
        },
        {
          "form": "federal-district",
          "pattern": {
            "re": "^(\\d):(\\d{2})-(cv|cr|mc|md|mj|bk|ap)-(\\d{5})((?:-[A-Z]{2,4})*)$"
          },
          "normal": [
            {
              "group": 1
            },
            ":",
            {
              "group": 2
            },
            "-",
            {
              "group": 3
            },
            "-",
            {
              "group": 4
            },
            {
              "group": 5,
              "default": ""
            }
          ],
          "clean": {
            "spaces": "remove"
          },
          "basis": "2026-10-05 courts-workbooks"
        },
        {
          "form": "docket-core",
          "pattern": {
            "re": "^(\\d{7,8})$"
          },
          "normal": [
            {
              "group": 1
            }
          ],
          "clean": {
            "spaces": "remove"
          },
          "basis": "2026-10-05 courts-workbooks"
        },
        {
          "form": "cpuc",
          "pattern": {
            "re": "^([ARICPK])\\.?(\\d{2})-?(\\d{2})-?(\\d{3})$"
          },
          "normal": [
            {
              "group": 1
            },
            {
              "group": 2
            },
            {
              "group": 3
            },
            {
              "group": 4
            }
          ],
          "clean": {
            "spaces": "remove",
            "upper": true
          },
          "basis": "2026-10-05 courts-workbooks"
        }
      ]
    }
  },
  "proceeding_kinds": [
    {
      "kind": "complaint",
      "label": "Administrative complaint",
      "forum_kind": "commission",
      "basis": "2026-10-25 oakland-pec-complaint-page"
    }
  ],
  "proceeding_flows": [
    {
      "kind": "complaint",
      "stages": [
        {
          "stage": "filed",
          "label": "complaint filed",
          "reached_by": [
            "filing"
          ]
        },
        {
          "stage": "decided",
          "label": "final action taken",
          "reached_by": [
            "order"
          ]
        }
      ],
      "citation": "Oakland Public Ethics Commission, File a Complaint",
      "basis": "2026-10-25 oakland-pec-complaint-page"
    }
  ],
  "mixed_hosts": [
    {
      "host": "www.oaklandca.gov",
      "why": "the City's general website, serving many offices' publications",
      "basis": "M-119 FIN, M-132"
    },
    {
      "host": "cao-94612.s3.us-west-2.amazonaws.com",
      "why": "the storage behind the City's general website, serving many offices' publications",
      "basis": "M-119 FIN, M-132"
    }
  ],
  "practice": {
    "minutes_due_days": {
      "value": 10,
      "count": "business",
      "closures": "city",
      "basis": "2026-10-05 time-law"
    }
  },
  "locale": {
    "value": "en-US",
    "basis": "UNMEASURED"
  },
  "search_terms": [
    {
      "term": "oakland",
      "basis": "UNMEASURED"
    },
    {
      "term": "police",
      "basis": "UNMEASURED"
    }
  ],
  "legal_organisations": [
    {
      "name": "Howard Jarvis Taxpayers Association",
      "evaluates": [
        "assessment_challenge",
        "taxpayer_action"
      ],
      "contacts": [
        {
          "how": "web",
          "value": "https://www.hjta.org"
        }
      ],
      "basis": "UNMEASURED"
    },
    {
      "name": "First Amendment Coalition",
      "evaluates": [
        "constitutional_claim"
      ],
      "defends": true,
      "contacts": [
        {
          "how": "web",
          "value": "https://firstamendmentcoalition.org"
        }
      ],
      "basis": "K303, 2026-10-11 actions-law"
    }
  ],
  "identifier_schemes": [
    {
      "scheme": "legistar_person_id",
      "label": "Legistar PersonId",
      "entity_kinds": [
        "person"
      ],
      "space": "person",
      "form": "legistar-person",
      "systems": [
        "oakland.legistar"
      ],
      "basis": "2026-10-05 legistar-events"
    },
    {
      "scheme": "legistar_body_id",
      "label": "Legistar BodyId",
      "entity_kinds": [
        "body"
      ],
      "space": "body",
      "form": "legistar-body",
      "systems": [
        "oakland.legistar"
      ],
      "basis": "2026-10-05 legistar-events"
    },
    {
      "scheme": "legistar_office_record_id",
      "label": "Legistar OfficeRecordId",
      "entity_kinds": [
        "office"
      ],
      "space": "office",
      "form": "legistar-office-record",
      "systems": [
        "oakland.legistar"
      ],
      "basis": "2026-10-05 legistar-events"
    }
  ],
  "classification_schemes": [
    {
      "scheme": "oakland_fund",
      "label": "fund",
      "kind": "fund",
      "forms": [
        {
          "re": "^FD_\\d{4}$"
        },
        {
          "re": "^\\d{4}$"
        }
      ],
      "codes": [
        {
          "code": "1010",
          "label": "General Purpose Fund"
        }
      ],
      "basis": "2026-10-05 money-people, 2026-10-05 legistar-events"
    },
    {
      "scheme": "oakland_org",
      "label": "organisation (org)",
      "kind": "organisation",
      "forms": [
        {
          "re": "^OR_\\d{5}$"
        },
        {
          "re": "^\\d{2,5}$"
        }
      ],
      "basis": "2026-10-05 money-people, 2026-10-05 legistar-events"
    },
    {
      "scheme": "oakland_department",
      "label": "department",
      "kind": "organisation",
      "forms": [
        {
          "re": "^DP(?:\\d{3,4}|CC0)$"
        }
      ],
      "codes": [
        {
          "code": "DP010",
          "label": "Mayor"
        },
        {
          "code": "DP1000",
          "label": "Police"
        },
        {
          "code": "DP350",
          "label": "Transportation"
        },
        {
          "code": "DP660",
          "label": "Police Commission"
        },
        {
          "code": "DP700",
          "label": "Violence Prevention"
        },
        {
          "code": "DPCC0",
          "label": "Council"
        }
      ],
      "basis": "2026-10-05 legistar-events"
    },
    {
      "scheme": "oakland_program",
      "label": "program",
      "kind": "program",
      "forms": [
        {
          "re": "^PG_[A-Z0-9]+$"
        }
      ],
      "basis": "2026-10-05 money-people"
    },
    {
      "scheme": "oakland_account",
      "label": "account",
      "kind": "account",
      "forms": [
        {
          "re": "^\\d{5}$"
        }
      ],
      "basis": "2026-10-05 money-people"
    },
    {
      "scheme": "oakland_project",
      "label": "project",
      "kind": "project",
      "forms": [
        {
          "re": "^PJ_\\d{7}$"
        },
        {
          "re": "^100\\d{4}$"
        }
      ],
      "basis": "2026-10-05 money-people"
    }
  ],
  "registers": [
    {
      "key": "oakland_form460_schedule_a",
      "label": "Campaign filings: Form 460 Schedule A, monetary contributions",
      "publisher": "City of Oakland Public Ethics Commission (OakData)",
      "system": "oakland.opendata",
      "url": "https://data.oaklandca.gov/d/3xq4-ermg",
      "delimiter": "comma",
      "gate": "none",
      "phase": "alpha",
      "pieces": [
        {
          "key": "all",
          "label": "the whole dataset, all years",
          "locator": "https://data.oaklandca.gov/api/views/3xq4-ermg/rows.csv?accessType=DOWNLOAD"
        }
      ],
      "columns": [
        {
          "name": "filer_id",
          "role": "filer_id",
          "keep": true
        },
        {
          "name": "filer_naml",
          "role": "organization",
          "keep": true
        },
        {
          "name": "report_num",
          "role": "other",
          "keep": true
        },
        {
          "name": "rpt_date",
          "role": "date",
          "keep": true
        },
        {
          "name": "form_type",
          "role": "form",
          "keep": true
        },
        {
          "name": "tran_id",
          "role": "other",
          "keep": true
        },
        {
          "name": "tran_naml",
          "role": "name",
          "keep": true
        },
        {
          "name": "tran_namf",
          "role": "name",
          "keep": true
        },
        {
          "name": "tran_adr1",
          "role": "home_address",
          "keep": false
        },
        {
          "name": "tran_adr2",
          "role": "home_address",
          "keep": false
        },
        {
          "name": "tran_city",
          "role": "city",
          "keep": true
        },
        {
          "name": "tran_state",
          "role": "state",
          "keep": true
        },
        {
          "name": "tran_zip4",
          "role": "zip5",
          "keep": true
        },
        {
          "name": "tran_emp",
          "role": "other",
          "keep": true
        },
        {
          "name": "tran_occ",
          "role": "other",
          "keep": true
        },
        {
          "name": "tran_date",
          "role": "date",
          "keep": true
        },
        {
          "name": "tran_amt1",
          "role": "amount",
          "keep": true,
          "currency": "USD"
        },
        {
          "name": "cmte_id",
          "role": "filer_id",
          "keep": true
        },
        {
          "name": "cand_naml",
          "role": "name",
          "keep": true
        },
        {
          "name": "cand_namf",
          "role": "name",
          "keep": true
        }
      ],
      "row_key": [
        "filer_id",
        "report_num",
        "tran_id"
      ],
      "row_key_basis": "content",
      "terms_basis": "2026-10-21 the dataset's catalogue licence: Creative Commons 1.0 Universal (Public Domain Dedication), attribution City of Oakland Public Ethics Commission",
      "listing": {
        "bytes": {
          "value": null,
          "basis": "not_stated"
        },
        "rows": {
          "value": 73043,
          "basis": "counted"
        },
        "measured_at": "2026-10-21"
      },
      "refresh": {
        "cadence_hours": 24,
        "validators": [
          "last_modified"
        ]
      },
      "basis": "2026-10-21 M-R1"
    },
    {
      "key": "oakland_form460_summary",
      "label": "Campaign filings: Form 460 summary totals",
      "publisher": "City of Oakland Public Ethics Commission (OakData)",
      "system": "oakland.opendata",
      "url": "https://data.oaklandca.gov/d/rsxe-vvuw",
      "delimiter": "comma",
      "gate": "none",
      "phase": "alpha",
      "pieces": [
        {
          "key": "all",
          "label": "the whole dataset, all years",
          "locator": "https://data.oaklandca.gov/api/views/rsxe-vvuw/rows.csv?accessType=DOWNLOAD"
        }
      ],
      "columns": [
        {
          "name": "filer_id",
          "role": "filer_id",
          "keep": true
        },
        {
          "name": "filer_naml",
          "role": "organization",
          "keep": true
        },
        {
          "name": "report_num",
          "role": "other",
          "keep": true
        },
        {
          "name": "rpt_date",
          "role": "date",
          "keep": true
        },
        {
          "name": "form_type",
          "role": "form",
          "keep": true
        },
        {
          "name": "line_item",
          "role": "other",
          "keep": true
        },
        {
          "name": "amount_a",
          "role": "amount",
          "keep": true,
          "currency": "USD"
        },
        {
          "name": "amount_b",
          "role": "amount",
          "keep": true,
          "currency": "USD"
        },
        {
          "name": "amount_c",
          "role": "amount",
          "keep": true,
          "currency": "USD"
        }
      ],
      "row_key": [
        "filer_id",
        "report_num",
        "line_item"
      ],
      "row_key_basis": "content",
      "terms_basis": "2026-10-21 the dataset's catalogue licence: Creative Commons 1.0 Universal (Public Domain Dedication), attribution City of Oakland Public Ethics Commission",
      "listing": {
        "bytes": {
          "value": null,
          "basis": "not_stated"
        },
        "rows": {
          "value": 100032,
          "basis": "counted"
        },
        "measured_at": "2026-10-21"
      },
      "refresh": {
        "cadence_hours": 24,
        "validators": [
          "last_modified"
        ]
      },
      "basis": "2026-10-21 M-R1"
    },
    {
      "key": "oakland_form460_schedule_e",
      "label": "Campaign filings: Form 460 Schedule E, payments made",
      "publisher": "City of Oakland Public Ethics Commission (OakData)",
      "system": "oakland.opendata",
      "url": "https://data.oaklandca.gov/d/bvfu-nq99",
      "delimiter": "comma",
      "gate": "none",
      "phase": "alpha",
      "pieces": [
        {
          "key": "all",
          "label": "the whole dataset, all years",
          "locator": "https://data.oaklandca.gov/api/views/bvfu-nq99/rows.csv?accessType=DOWNLOAD"
        }
      ],
      "columns": [
        {
          "name": "filer_id",
          "role": "filer_id",
          "keep": true
        },
        {
          "name": "filer_naml",
          "role": "organization",
          "keep": true
        },
        {
          "name": "report_num",
          "role": "other",
          "keep": true
        },
        {
          "name": "rpt_date",
          "role": "date",
          "keep": true
        },
        {
          "name": "form_type",
          "role": "form",
          "keep": true
        },
        {
          "name": "tran_id",
          "role": "other",
          "keep": true
        },
        {
          "name": "payee_naml",
          "role": "name",
          "keep": true
        },
        {
          "name": "payee_namf",
          "role": "name",
          "keep": true
        },
        {
          "name": "payee_adr1",
          "role": "home_address",
          "keep": false
        },
        {
          "name": "payee_adr2",
          "role": "home_address",
          "keep": false
        },
        {
          "name": "payee_city",
          "role": "city",
          "keep": true
        },
        {
          "name": "payee_state",
          "role": "state",
          "keep": true
        },
        {
          "name": "payee_zip4",
          "role": "zip5",
          "keep": true
        },
        {
          "name": "expn_date",
          "role": "date",
          "keep": true
        },
        {
          "name": "amount",
          "role": "amount",
          "keep": true,
          "currency": "USD"
        },
        {
          "name": "expn_dscr",
          "role": "other",
          "keep": true
        }
      ],
      "row_key": [
        "filer_id",
        "report_num",
        "tran_id"
      ],
      "row_key_basis": "content",
      "terms_basis": "2026-10-21 the dataset's catalogue licence: Creative Commons 1.0 Universal (Public Domain Dedication), attribution City of Oakland Public Ethics Commission",
      "listing": {
        "bytes": {
          "value": null,
          "basis": "not_stated"
        },
        "rows": {
          "value": 28292,
          "basis": "counted"
        },
        "measured_at": "2026-10-21"
      },
      "refresh": {
        "cadence_hours": 24,
        "validators": [
          "last_modified"
        ]
      },
      "basis": "2026-10-21 M-R1"
    },
    {
      "key": "oakland_lobbyist_clients",
      "label": "Lobbyist clients",
      "publisher": "City of Oakland Public Ethics Commission (OakData)",
      "system": "oakland.opendata",
      "url": "https://data.oaklandca.gov/d/ss9a-d595",
      "delimiter": "comma",
      "gate": "none",
      "phase": "alpha",
      "pieces": [
        {
          "key": "all",
          "label": "the whole dataset, all years",
          "locator": "https://data.oaklandca.gov/api/views/ss9a-d595/rows.csv?accessType=DOWNLOAD"
        }
      ],
      "columns": [
        {
          "name": "report_period",
          "role": "other",
          "keep": true
        },
        {
          "name": "filing_date",
          "role": "date",
          "keep": true
        },
        {
          "name": "lobbyist_name",
          "role": "name",
          "keep": true
        },
        {
          "name": "client_name",
          "role": "organization",
          "keep": true
        },
        {
          "name": "client_address_line_1",
          "role": "home_address",
          "keep": false
        },
        {
          "name": "client_address_line_2",
          "role": "home_address",
          "keep": false
        },
        {
          "name": "client_city",
          "role": "city",
          "keep": true
        },
        {
          "name": "client_state",
          "role": "state",
          "keep": true
        },
        {
          "name": "client_zipcode",
          "role": "zip5",
          "keep": true
        },
        {
          "name": "client_phone",
          "role": "phone",
          "keep": false
        },
        {
          "name": "client_type",
          "role": "other",
          "keep": true
        },
        {
          "name": "client_payments",
          "role": "amount",
          "keep": true,
          "currency": "USD"
        }
      ],
      "row_key": [
        "report_period",
        "lobbyist_name",
        "client_name"
      ],
      "row_key_basis": "content",
      "terms_basis": "2026-10-21 the dataset's catalogue licence: Creative Commons 1.0 Universal (Public Domain Dedication), attribution City of Oakland Public Ethics Commission",
      "listing": {
        "bytes": {
          "value": null,
          "basis": "not_stated"
        },
        "rows": {
          "value": 2912,
          "basis": "counted"
        },
        "measured_at": "2026-10-21"
      },
      "refresh": {
        "cadence_hours": 24,
        "validators": [
          "last_modified"
        ]
      },
      "basis": "2026-10-21 M-R1"
    },
    {
      "key": "oakland_lobbyist_contacts",
      "label": "Lobbyist contacts with public officials (Schedule A)",
      "publisher": "City of Oakland Public Ethics Commission (OakData)",
      "system": "oakland.opendata",
      "url": "https://data.oaklandca.gov/d/ucs9-a92d",
      "delimiter": "comma",
      "gate": "none",
      "phase": "alpha",
      "pieces": [
        {
          "key": "all",
          "label": "the whole dataset, all years",
          "locator": "https://data.oaklandca.gov/api/views/ucs9-a92d/rows.csv?accessType=DOWNLOAD"
        }
      ],
      "columns": [
        {
          "name": "report_period",
          "role": "other",
          "keep": true
        },
        {
          "name": "filing_date",
          "role": "date",
          "keep": true
        },
        {
          "name": "public_official_name",
          "role": "name",
          "keep": true
        },
        {
          "name": "public_official_department",
          "role": "other",
          "keep": true
        },
        {
          "name": "municipal_decision",
          "role": "other",
          "keep": true
        },
        {
          "name": "lobbyist_name",
          "role": "name",
          "keep": true
        },
        {
          "name": "client_name",
          "role": "organization",
          "keep": true
        }
      ],
      "row_key": [
        "report_period",
        "lobbyist_name",
        "client_name",
        "public_official_name"
      ],
      "row_key_basis": "content",
      "terms_basis": "2026-10-21 the dataset's catalogue licence: Creative Commons 1.0 Universal (Public Domain Dedication), attribution City of Oakland Public Ethics Commission",
      "listing": {
        "bytes": {
          "value": null,
          "basis": "not_stated"
        },
        "rows": {
          "value": 5501,
          "basis": "counted"
        },
        "measured_at": "2026-10-21"
      },
      "refresh": {
        "cadence_hours": 24,
        "validators": [
          "last_modified"
        ]
      },
      "basis": "2026-10-21 M-R1"
    },
    {
      "key": "oakland_lobbyist_contributions",
      "label": "Lobbyist political contributions (Schedule D)",
      "publisher": "City of Oakland Public Ethics Commission (OakData)",
      "system": "oakland.opendata",
      "url": "https://data.oaklandca.gov/d/xvc7-ctj7",
      "delimiter": "comma",
      "gate": "none",
      "phase": "alpha",
      "pieces": [
        {
          "key": "all",
          "label": "the whole dataset, all years",
          "locator": "https://data.oaklandca.gov/api/views/xvc7-ctj7/rows.csv?accessType=DOWNLOAD"
        }
      ],
      "columns": [
        {
          "name": "filing_date",
          "role": "date",
          "keep": true
        },
        {
          "name": "report_period",
          "role": "other",
          "keep": true
        },
        {
          "name": "lobbyist_name",
          "role": "name",
          "keep": true
        },
        {
          "name": "lobbyist_employer",
          "role": "organization",
          "keep": true
        },
        {
          "name": "official_name",
          "role": "name",
          "keep": true
        },
        {
          "name": "committee",
          "role": "organization",
          "keep": true
        },
        {
          "name": "fund_source",
          "role": "other",
          "keep": true
        }
      ],
      "row_key": [
        "filing_date",
        "lobbyist_name",
        "official_name",
        "committee"
      ],
      "row_key_basis": "content",
      "terms_basis": "2026-10-21 the dataset's catalogue licence: Creative Commons 1.0 Universal (Public Domain Dedication), attribution City of Oakland Public Ethics Commission",
      "listing": {
        "bytes": {
          "value": null,
          "basis": "not_stated"
        },
        "rows": {
          "value": 31,
          "basis": "counted"
        },
        "measured_at": "2026-10-21"
      },
      "refresh": {
        "cadence_hours": 24,
        "validators": [
          "last_modified"
        ]
      },
      "basis": "2026-10-21 M-R1"
    },
    {
      "key": "oakland_behested_payments",
      "label": "Behested payment reports (Form 803)",
      "publisher": "City of Oakland Public Ethics Commission (OakData)",
      "system": "oakland.opendata",
      "url": "https://data.oaklandca.gov/d/f4dq-mk8d",
      "delimiter": "comma",
      "gate": "none",
      "phase": "alpha",
      "pieces": [
        {
          "key": "all",
          "label": "the whole dataset, all years",
          "locator": "https://data.oaklandca.gov/api/views/f4dq-mk8d/rows.csv?accessType=DOWNLOAD"
        }
      ],
      "columns": [
        {
          "name": "id",
          "role": "other",
          "keep": true
        },
        {
          "name": "filing_date",
          "role": "date",
          "keep": true
        },
        {
          "name": "official",
          "role": "name",
          "keep": true
        },
        {
          "name": "office",
          "role": "other",
          "keep": true
        },
        {
          "name": "payor",
          "role": "organization",
          "keep": true
        },
        {
          "name": "payor_city",
          "role": "city",
          "keep": true
        },
        {
          "name": "payor_state",
          "role": "state",
          "keep": true
        },
        {
          "name": "payor_zip",
          "role": "zip5",
          "keep": true
        },
        {
          "name": "payee",
          "role": "organization",
          "keep": true
        },
        {
          "name": "payee_city",
          "role": "city",
          "keep": true
        },
        {
          "name": "payee_state",
          "role": "state",
          "keep": true
        },
        {
          "name": "payee_zip",
          "role": "zip5",
          "keep": true
        },
        {
          "name": "payment_date",
          "role": "date",
          "keep": true
        },
        {
          "name": "amount",
          "role": "amount",
          "keep": true,
          "currency": "USD"
        },
        {
          "name": "purpose",
          "role": "other",
          "keep": true
        }
      ],
      "row_key": [
        "id"
      ],
      "row_key_basis": "content",
      "terms_basis": "2026-10-21 the dataset's catalogue licence: Creative Commons 1.0 Universal (Public Domain Dedication), attribution City of Oakland Public Ethics Commission",
      "listing": {
        "bytes": {
          "value": null,
          "basis": "not_stated"
        },
        "rows": {
          "value": 226,
          "basis": "counted"
        },
        "measured_at": "2026-10-21"
      },
      "refresh": {
        "cadence_hours": 24,
        "validators": [
          "last_modified"
        ]
      },
      "basis": "2026-10-21 M-R1"
    }
  ]
};
