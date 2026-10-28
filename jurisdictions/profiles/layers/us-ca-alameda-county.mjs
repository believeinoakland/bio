/* The Alameda County layer: the county's own facts (R111). Cut from the unsplit `oakland-alameda` profile at T53 (R114): every fact keeps its basis.
 * Level: county. Plain data. */
export default {
  "id": "us-ca-alameda-county",
  "name": "Alameda County",
  "covers": [
    "Alameda County"
  ],
  "test": false,
  "layer": {
    "level": "county",
    "place": "Alameda County",
    "within": "us-california",
    "origin": "civicsmith"
  },
  "coverage": {
    "as_of": "2026-12-25",
    "holidays_through": 2026
  },
  "holidays": [
    {
      "year": 2026,
      "offices": [
        {
          "venue": "records_petition"
        }
      ],
      "days": [
        {
          "date": "2026-01-01",
          "name": "New Year's Day"
        },
        {
          "date": "2026-01-19",
          "name": "Martin Luther King Jr.'s Birthday"
        },
        {
          "date": "2026-02-12",
          "name": "Lincoln's Birthday"
        },
        {
          "date": "2026-02-16",
          "name": "Washington's Birthday"
        },
        {
          "date": "2026-03-31",
          "name": "Pursuant to Code of Civil Procedure Section 135"
        },
        {
          "date": "2026-05-25",
          "name": "Memorial Day"
        },
        {
          "date": "2026-06-19",
          "name": "Juneteenth"
        },
        {
          "date": "2026-07-03",
          "name": "Independence Day"
        },
        {
          "date": "2026-09-07",
          "name": "Labor Day"
        },
        {
          "date": "2026-09-25",
          "name": "Native American Day"
        },
        {
          "date": "2026-11-11",
          "name": "Veteran's Day"
        },
        {
          "date": "2026-11-26",
          "name": "Thanksgiving Day"
        },
        {
          "date": "2026-11-27",
          "name": "Day after Thanksgiving"
        },
        {
          "date": "2026-12-25",
          "name": "Christmas Day"
        }
      ],
      "status": "researched",
      "basis": "M-189"
    }
  ],
  "counterparties": [
    {
      "role": "Civil Grand Jury",
      "body": "Alameda County Civil Grand Jury",
      "level": "county",
      "elected": false,
      "oversight": true,
      "basis": "2026-10-05 time-law"
    }
  ],
  "fiscal_year": [
    {
      "body": "Alameda County Civil Grand Jury",
      "start": "07-01",
      "named_by": "start",
      "label": "FY{start}-{end2}",
      "status": "researched",
      "basis": "2026-10-22 acgov.org-budget-press-release, 2026-10-22 budget.alamedacountyca.gov-fy2025-26-board-letter"
    }
  ],
  "forums": [
    {
      "label": "Superior Court of California, County of Alameda",
      "forum_kind": "court",
      "basis": "2026-10-25 alameda-superior-court"
    }
  ],
  "systems": [
    {
      "origin": "alameda.assessor",
      "name": "the Alameda County Assessor's parcel layer, republished by the City of Oakland's portal (the portal does not state its provenance; its schema, keys and 2012-13 vintage are the county's)",
      "hosts": [
        "data.oaklandca.gov"
      ],
      "path": {
        "re": "c3xp-qcgn",
        "flags": "i"
      },
      "republishes": true,
      "provenance_stated": false,
      "basis": "M-132, M-157"
    },
    {
      "origin": "alameda.assessor",
      "name": "the Alameda County Assessor's own publications (Open Data Hub)",
      "hosts": [
        "services5.arcgis.com",
        "data.acgov.org"
      ],
      "path": {
        "re": "(ROBnTHSNjoZ2Wm1P\\/.*(Parcel|Assessor_Office))",
        "flags": "i"
      },
      "basis": "M-157 (4)"
    },
    {
      "origin": "ecourt_roa",
      "name": "the Alameda County Superior Court's eCourt public portal",
      "hosts": [
        "eportal.alameda.courts.ca.gov"
      ],
      "basis": "2026-10-05 courts-workbooks"
    }
  ],
  "pointers": [
    {
      "kind": "legalaid",
      "name": "AIDS Legal Referral Panel",
      "does": "Civil legal services for people living with HIV/AIDS in the Bay Area: direct representation, placement with volunteer attorneys, and connection to non-legal service providers.",
      "contacts": [
        {
          "how": "phone",
          "value": "(415) 701-1100"
        },
        {
          "how": "address",
          "value": "1663 Mission Street, Suite 720, San Francisco, California 94103"
        },
        {
          "how": "web",
          "value": "https://www.alrp.org/get-legal-help/"
        }
      ],
      "source": "https://www.alrp.org/",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    },
    {
      "kind": "legalaid",
      "name": "Homeless Action Center",
      "does": "Free public benefits advocacy for unhoused and disabled residents of Alameda County.",
      "contacts": [
        {
          "how": "phone",
          "value": "510-775-0035"
        },
        {
          "how": "address",
          "value": "2601 San Pablo Avenue, Oakland, CA 94612"
        },
        {
          "how": "web",
          "value": "https://homelessactioncenter.org/"
        }
      ],
      "hours": {
        "weekly": [
          {
            "day": "mon",
            "open": "13:00",
            "close": "17:00"
          },
          {
            "day": "tue",
            "open": "13:00",
            "close": "17:00"
          },
          {
            "day": "wed",
            "open": "13:00",
            "close": "17:00"
          },
          {
            "day": "thu",
            "open": "13:00",
            "close": "17:00"
          }
        ],
        "status": "researched",
        "basis": "2026-10-14 pointers"
      },
      "source": "https://homelessactioncenter.org/",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    },
    {
      "kind": "legalaid",
      "name": "API Legal Outreach",
      "does": "Culturally competent and linguistically appropriate legal representation, social services and advocacy for low-income women, seniors, recent immigrants and youth.",
      "contacts": [
        {
          "how": "phone",
          "value": "(510) 251-2846"
        },
        {
          "how": "address",
          "value": "310 8th St., Suite 305, Oakland, CA 94607"
        },
        {
          "how": "web",
          "value": "https://www.apilegaloutreach.org/contact/"
        }
      ],
      "source": "https://www.apilegaloutreach.org/contact/",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    },
    {
      "kind": "legalaid",
      "name": "Bay Area Legal Aid",
      "does": "Free civil legal help to low-income people in the Bay Area, including advice, self-help clinics and representation.",
      "contacts": [
        {
          "how": "phone",
          "value": "800-551-5554"
        },
        {
          "how": "address",
          "value": "1735 Telegraph Avenue, Oakland, CA 94612"
        },
        {
          "how": "web",
          "value": "https://baylegal.org/"
        }
      ],
      "source": "https://baylegal.org/",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    },
    {
      "kind": "legalaid",
      "name": "Centro Legal de la Raza",
      "does": "A legal aid nonprofit giving bilingual legal representation, education and advocacy to low-income, immigrant communities and communities of color in the Bay Area.",
      "contacts": [
        {
          "how": "phone",
          "value": "510-437-1554"
        },
        {
          "how": "address",
          "value": "3400 E. 12th Street, Oakland, CA 94601"
        },
        {
          "how": "web",
          "value": "https://www.centrolegal.org/"
        }
      ],
      "source": "https://www.centrolegal.org/",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    },
    {
      "kind": "legalaid",
      "name": "Family Violence Law Center",
      "does": "Survivor-centered legal and crisis intervention services for people in Alameda County facing domestic violence and sexual assault.",
      "contacts": [
        {
          "how": "phone",
          "value": "800-947-8301"
        },
        {
          "how": "address",
          "value": "470 27th Street, Oakland, CA 94612"
        },
        {
          "how": "web",
          "value": "https://fvlc.org/"
        }
      ],
      "source": "https://fvlc.org/",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    },
    {
      "kind": "legalaid",
      "name": "Justice & Diversity Center of the Bar Association of San Francisco",
      "does": "Pro bono legal services for low-income people.",
      "contacts": [
        {
          "how": "phone",
          "value": "(415) 982-1600"
        },
        {
          "how": "address",
          "value": "50 Fremont St., Suite 1700, San Francisco, California 94105"
        },
        {
          "how": "web",
          "value": "https://www.sfbar.org/jdc/"
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
      "source": "https://www.sfbar.org/jdc/jdc-contact-us/",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    },
    {
      "kind": "legalaid",
      "name": "La Raza Centro Legal",
      "does": "Free legal services and advocacy that advance civil and human rights and access to justice.",
      "contacts": [
        {
          "how": "phone",
          "value": "415-575-3500"
        },
        {
          "how": "email",
          "value": "info@lrcl.org"
        },
        {
          "how": "address",
          "value": "474 Valencia Street, Suite 295, San Francisco, CA 94103"
        }
      ],
      "source": "https://www.lrcl.org/",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    },
    {
      "kind": "legalaid",
      "name": "Lawyers' Committee for Civil Rights of the San Francisco Bay Area",
      "does": "Free legal services, direct representation and legal education for low-income and historically marginalized communities.",
      "contacts": [
        {
          "how": "phone",
          "value": "415.543.9444"
        },
        {
          "how": "address",
          "value": "131 Steuart Street, Suite 400, San Francisco, CA 94105"
        },
        {
          "how": "web",
          "value": "https://lccrsf.org/"
        }
      ],
      "source": "https://lccrsf.org/",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    },
    {
      "kind": "legalaid",
      "name": "Legal Access Alameda",
      "does": "The pro bono arm of the Alameda County Bar Association: free legal assistance for Alameda County's low-income litigants from volunteer attorneys.",
      "contacts": [
        {
          "how": "phone",
          "value": "(510) 302-2222 *4"
        },
        {
          "how": "web",
          "value": "https://www.legalaccess.org/"
        }
      ],
      "source": "https://www.legalaccess.org/",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    },
    {
      "kind": "legalaid",
      "name": "Legal Services for Children",
      "does": "Legal and social work services for children and youth in crisis in the San Francisco Bay Area.",
      "contacts": [
        {
          "how": "phone",
          "value": "(415) 780-6366"
        },
        {
          "how": "phone",
          "value": "(415) 780-6367"
        },
        {
          "how": "address",
          "value": "870 Market Street, Suite 356, San Francisco, CA 94102"
        }
      ],
      "hours": {
        "weekly": [
          {
            "day": "mon",
            "open": "13:30",
            "close": "16:30"
          },
          {
            "day": "thu",
            "open": "13:30",
            "close": "16:30"
          }
        ],
        "status": "researched",
        "basis": "2026-10-14 pointers"
      },
      "languages": [
        "en",
        "es"
      ],
      "source": "https://lsc-sf.org/",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    },
    {
      "kind": "legalaid",
      "name": "Asian Law Alliance",
      "does": "Free legal services, education about key rights, and advocacy with and for underserved community members.",
      "contacts": [
        {
          "how": "phone",
          "value": "(408) 287-9710"
        },
        {
          "how": "address",
          "value": "991 W. Hedding Street #202, San Jose, CA 95126"
        },
        {
          "how": "web",
          "value": "https://asianlawalliance.org/"
        }
      ],
      "source": "https://asianlawalliance.org/",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    },
    {
      "kind": "legalaid",
      "name": "Social Justice Collaborative",
      "does": "Free and low-cost legal representation for immigrant families across Northern and Central California, in clients' languages.",
      "contacts": [
        {
          "how": "phone",
          "value": "(510) 992-3964"
        },
        {
          "how": "email",
          "value": "office@socialjusticecollaborative.org"
        },
        {
          "how": "address",
          "value": "1832 Second Street, Berkeley, CA 94710"
        }
      ],
      "source": "https://www.socialjusticecollaborative.org/en",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    },
    {
      "kind": "selfhelp",
      "name": "Self-Help Center of the Superior Court of California, County of Alameda",
      "does": "Procedural information and help with forms for people with a case in the court who do not have a lawyer; no legal advice.",
      "contacts": [
        {
          "how": "phone",
          "value": "(510) 272-1393"
        },
        {
          "how": "web",
          "value": "https://www.alameda.courts.ca.gov/self-help"
        }
      ],
      "hours": {
        "weekly": [
          {
            "day": "mon",
            "open": "14:00",
            "close": "16:00"
          },
          {
            "day": "tue",
            "open": "14:00",
            "close": "16:00"
          },
          {
            "day": "wed",
            "open": "14:00",
            "close": "16:00"
          },
          {
            "day": "thu",
            "open": "14:00",
            "close": "16:00"
          }
        ],
        "status": "researched",
        "basis": "2026-10-14 pointers"
      },
      "source": "https://www.alameda.courts.ca.gov/self-help",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    }
  ],
  "action_kinds": [
    {
      "kind": "records_petition",
      "label": "court petition to enforce a public records request",
      "tier": 2,
      "laws": [
        "California Public Records Act"
      ],
      "venue": {
        "name": "Alameda County Superior Court",
        "how": "court",
        "basis": "2026-10-05 time-law",
        "hours": {
          "weekly": [
            {
              "day": "mon",
              "open": "08:30",
              "close": "15:00"
            },
            {
              "day": "tue",
              "open": "08:30",
              "close": "15:00"
            },
            {
              "day": "wed",
              "open": "08:30",
              "close": "15:00"
            },
            {
              "day": "thu",
              "open": "08:30",
              "close": "15:00"
            },
            {
              "day": "fri",
              "open": "08:30",
              "close": "14:00"
            }
          ],
          "status": "researched",
          "basis": "M-193"
        }
      },
      "advisory": "File with caution: a procedural error can have the petition dismissed, usually without prejudice, so refiling is possible but costs time and money. Legal review before filing is recommended.",
      "basis": "D-182"
    }
  ],
  "spaces": {
    "parcel": {
      "label": "assessor's parcel number (APN)",
      "forms": [
        {
          "form": "alameda-apn",
          "pattern": {
            "re": "^0*(\\d{1,3}[A-Z]?|[A-Z])-0*(\\d{1,4})-0*(\\d{1,3}[A-Z]?)(?:-0*(\\d{1,2}))?$"
          },
          "normal": [
            {
              "group": 1,
              "unpad": true
            },
            "-",
            {
              "group": 2,
              "unpad": true
            },
            "-",
            {
              "group": 3,
              "unpad": true
            },
            "-",
            {
              "group": 4,
              "unpad": true,
              "default": "0"
            }
          ],
          "clean": {
            "strip": [
              {
                "re": "APN\\s*",
                "flags": "i"
              }
            ],
            "spaces": "remove",
            "upper": true
          },
          "basis": "M-157"
        }
      ]
    }
  }
};
