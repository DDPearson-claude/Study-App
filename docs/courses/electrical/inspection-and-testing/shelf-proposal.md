# Where Inspection and testing sits on the Electrical engineering shelf

Written 20 Oct 2026 with `brief.md` and `sections.json`. A proposal only: nothing here changes
`docs/shelves-electrical.json` until you agree it.

## The proposal

- **Shelf:** Electrical engineering (`docs/shelves-electrical.json`).
- **New folder:** id `inspection-and-testing`, titled "Inspection and testing (BS 7671)", blurb:
  "Verifying, certifying and reporting on installations ashore to BS 7671, taught back from your
  Level 3 awards, with the emergency lighting you meet on the same jobs."
- **Place:** the fourth folder, straight after "Installation design (BS 7671)". The two are a pair:
  design predicts the readings, inspection and testing takes them. Design and verification's lesson 9
  (verification and handover) is the bridge, and Initial verification's lessons use its Cmin and
  fault-loop figures with a one-line reminder.
- **Order inside the folder:** Initial verification first (the test methods), then Periodic
  inspection (which reuses them in an occupied building), then Emergency lighting (new ground, built
  last). PAT is not listed until its materials arrive; listing it with `tid: null` would show it as
  planned, which you may prefer (option below).

## The courses: titles and blurbs

| id | Title | Blurb |
|---|---|---|
| `initial-verification` | Initial verification and certification, a refresher | Your Level 3 inspection and testing taught back to you: the dead and live tests in their order, why each reads what it reads, and a new unit tested and certified. |
| `periodic-inspection` | Periodic inspection and the EICR, a refresher | Your Level 3 periodic inspection taught back to you: what the inspection is for, how far it goes, testing an installation in use, coding what you find, and a 1970s house reported in full. |
| `emergency-lighting` | Emergency lighting: design, testing and the logbook | What the emergency lights must do when the mains fails, where they go and how bright, and the tests and records that keep them ready, on the same unit you certified. |
| `in-service-testing` (option, waits) | In-service inspection and testing (PAT), a refresher | Your Level 3 PAT award taught back to you: equipment classes, the formal visual inspection, the tests and the records. |

## The folder, as it would go into `docs/shelves-electrical.json`

Appended to `folders` after `installation-design`. Each `tid` stays `null` until the course is built
and written to the db.

```json
{
  "id": "inspection-and-testing",
  "title": "Inspection and testing (BS 7671)",
  "blurb": "Verifying, certifying and reporting on installations ashore to BS 7671, taught back from your Level 3 awards, with the emergency lighting you meet on the same jobs.",
  "courses": [
    {
      "id": "initial-verification",
      "title": "Initial verification and certification, a refresher",
      "blurb": "Your Level 3 inspection and testing taught back to you: the dead and live tests in their order, why each reads what it reads, and a new unit tested and certified.",
      "tid": null
    },
    {
      "id": "periodic-inspection",
      "title": "Periodic inspection and the EICR, a refresher",
      "blurb": "Your Level 3 periodic inspection taught back to you: what the inspection is for, how far it goes, testing an installation in use, coding what you find, and a 1970s house reported in full.",
      "tid": null
    },
    {
      "id": "emergency-lighting",
      "title": "Emergency lighting: design, testing and the logbook",
      "blurb": "What the emergency lights must do when the mains fails, where they go and how bright, and the tests and records that keep them ready, on the same unit you certified.",
      "tid": null
    }
  ]
}
```

**Option:** add PAT now as a planned course, so the shelf shows the whole of your inspection and
testing awards:

```json
{
  "id": "in-service-testing",
  "title": "In-service inspection and testing (PAT), a refresher",
  "blurb": "Your Level 3 PAT award taught back to you: equipment classes, the formal visual inspection, the tests and the records.",
  "tid": null
}
```

## How it relates to the rest of the shelf

| Course | Link |
|---|---|
| Design and verification | Uses its Cmin, trip multiples and fault loop (lesson 6) and its expected readings (lesson 9). Nothing is taught twice: there, the design predicts Zs; here, the test measures it and compares. |
| AC circuits | Not needed. RCD operation is explained from currents that do not balance, which needs no phasors. |
| Three-phase power systems at sea | Insulated and earthed neutrals and insulation monitoring are left to it. A screen here says "at sea it differs" only where research has a source, and points there. |
| Maintenance and fault-finding | Takes fault finding, which a periodic inspection deliberately does not do, and insulation resistance trending at sea. |
| HV Subsea Cable Testing | Its four-wire measurement and insulation resistance at high voltage get a one-line pointer from Initial verification lessons 2 and 4. |

## Why a folder of its own

The Installation design folder is about one standard's design method. Inspection and testing is a
different job with its own certificates and reports, and a third of it (periodic inspection, coding)
has no design content at all. As its own folder it can also take PAT when that arrives, and any later
inspection course you need for the Navy's own installations once you share those syllabi.
