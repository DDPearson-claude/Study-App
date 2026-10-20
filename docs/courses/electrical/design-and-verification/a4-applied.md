# The A4 audit, applied

20 Oct 2026. Applied from `build/electrical/bs7671-amendments/dv-audit.md` / `dv-audit.json` so the course is right to
BS 7671:2018+A4:2026. Lessons i1, i3, i4 and i5 needed nothing. No figure changed. C7's maximum Zs stays 3.64 Ω,
and 3h (1.84 V), 3i (1.129 Ω) and 3j (0.50 mm², 1.43 mm² at the DBL2 end) all stand. Each lesson's verified and
final JSON were changed together. Where the audit's draft broke the plain-writing rule or a validator limit,
it was reworded and the facts kept.

## New sources (research.json, added at the end as n 518 to 528, quotes checked word for word)

All quotes come from web_fetch/web_search calls harvested into `tools/99` to `tools/104`.
`sources.mjs --quotes` reported 11 of 11 ok.
- 518 to 520: SELECT A4 overview, 536.4.202 (the three conditions; diversity is never overload protection).
- 521: BEAMA A4 presentation, an RDC-PD to BS IEC 62955 as an alternative to the RCD (722.531.3.101).
- 522: SELECT, 722.421.1.7.201, no AFDD for EV charging equipment.
- 523: Hager A4 guide, 714.411.3.4, public-reach lighting needs a 30 mA RCD unless SELV.
- 524: SELECT, 522.8.10, N750 underground conduit counts as equal protection.
- 525: SELECT, 434.2.1, "inherently short-circuit proof and earth fault proof".
- 526: IET A4 model EIC, TN-C-S (PME) and TN-C-S (PNB) boxes.
- 527, 528: IET (Table 41.3 covers the RCBO's overcurrent part) and BEAMA (an RCBO has the MCB's overcurrent characteristics).

Each source has a note in `ideas` (i2, i6, i7, i8, i9).

## i2, Maximum demand
- (must) Section B point 4: "supply, submains and switchgear" → "supply and submains", plus "A board is different. Its rating must
  cover the device that feeds it, or its whole connected load taken at 100%. Otherwise load management must cap its demand."
  The cite now adds 536.4.202.
- (must) Model answer: the same switch to "supply and submains", plus "A board's own rating is not cut by diversity. …unless
  load management caps the demand."
- (should) Keep this rule: added the line "A board is never sized by diversity. …or load management caps it." (675 of the
  690 characters allowed.)
- (should) Sixth trap: **merged, not added.** The card allows at most five traps, so trap 1 now ends "Nor does it ever
  keep a board, or an RCCB in it, from overload." Its cite adds 536.4.202.
- (should) Practice: new last bullet "Check each board against the device that feeds it. …never the board."

## i6, Shock protection and Zs
- (should) Section B (2) point 4: "RCD protection … over 6 mA" → "its own RCD of 30 mA or less, Type A, F or B. An RDC-PD to
  BS IEC 62955 may take its place. …DC fault current of 6 mA or more…". The cite adds 722.531.3.101. The final JSON's
  older wording was replaced with the same text.
- (should) AFDD point: **merged into point 1, not added as a sixth point.** A written question allows at most five
  points. Point 1 now adds "It needs no AFDD where the charger has standard charging sockets or connectors." The cite adds
  722.421.1.7.201. "Any three" is unchanged.
- (should) Model answer, last sentences: own RCD of 30 mA or less or an RDC-PD; DC protection as its own sentence; "No AFDD
  is needed on the charging circuit." Dropped "Section 722 has changed… Check it against the amendment you work to."

## i7, Surviving the fault (page only)
- (should) Page, step 2(c): after "Its 1.5 mm² cpc holds too." added "The 25 A breaker at DBP2 guards this smaller leg
  against fault current. That works because the leg can take the fault's heat. Regulation 434.2.1 sets the conditions for
  a device placed upstream of a step down in size." The lesson JSON is unchanged. Adding the same words to its
  whatAmILookingAt would break that field's length limit (14 001 characters against the 13 800 allowed).

## i8, The showroom, end to end
- (must) Page, 3(h): "A 6 A type C breaker protects it, because LED drivers draw a surge…" → "A 6 A type C RCBO protects it.
  LED drivers draw a surge at switch-on, so it is type C. The public can reach the bollards and they are not SELV, so it
  needs a 30 mA RCD. Its overcurrent part has a 6 A type C breaker's maximum Zs, 3.64 Ω." The 3.64 Ω is drawn from the
  case file. "…a real design would pick a cable fit for that run" → "A buried cable to them needs earthed armour, or an
  equally strong duct. Here, assume the same singles run all the way." This is shorter than the audit's draft so that
  whatAmILookingAt, which quotes it, stays within its limit.
- (must) Every place naming C7's device now says RCBO. That covers 3(i) "so the RCBO opens within 0.1 s", and in 3(j)
  the hint, the slip hint and "the RCBO clears well inside 0.1 s". The why picture and the changed-numbers circuit are
  not C7, so they keep "breaker".
- (should) Checklist: added "Each board rated at least the device that feeds it."; ticked as "DBL2 on a 10 A breaker, far
  inside its rating." The 10 A is drawn from IN_SUB.
- (should) Keep this: the RCD line went into summary.for, not summary.rule. The rule was already 677 characters, so
  adding it would break the 690 limit. summary.for now ends "Lighting the public can reach also needs a 30 mA RCD,
  unless it is SELV."
- whatAmILookingAt (lesson) follows the page: the 3(h) quote, eight checklist lines, and RCBO in 3(i) and 3(j). Its list
  of ticked figures is now one sentence ("from 20.0 m and 23.8 m … to 6 kA against 4.6 kA …, and DBL2 on a 10 A
  breaker…") to stay within the length limit.

## i9, Verification and handover
- (should) Section B (2) point 5: "The supply's characteristics, such as the declared Ze and the earthing. On a TN-C-S supply,
  say whether it is PME or PNB." The cite adds the IET A4 model certificate.
- (should) Model: "…such as the declared Ze of 0.1 Ω. I would say whether the TN-C-S supply is PME or PNB."
- (should) summary.for: "the supply's characteristics" → "the supply's Ze and earthing: PME or PNB". The audit's longer
  "…characteristics, including PME or PNB" would break the 460-character limit.
- (should) Page, Handing over list: "The supply's characteristics." → "The supply's characteristics, including PME or PNB."
  The lesson's whatAmILookingAt matches.
- Page scenario: C7 "on a 6 A type C breaker" → "on a 6 A type C RCBO", so the device agrees with i8.

## case.json
- (must) edition: "Whether A3:2024 changes anything here is not checked." → "Checked against A3:2024 and A4:2026 on 20 Oct 2026
  (…dv-audit.md). No figure changes. Word fixes in lessons 2, 6, 7, 8 and 9."
- (should) a.pme added: "Assume the TN-C-S supply is PME, the usual public supply. The certificate now asks whether a
  TN-C-S supply is PME or PNB."
- (should) a.c7rcd added: "Assume the walkway bollards can be reached by the public and are not SELV, so C7 is on a 6 A type C
  RCBO with a 30 mA residual rating. Its overcurrent part has the same maximum Zs as a 6 A type C breaker, 3.64 Ω. So every
  C7 sum stands."
- a.lightCable: the device is now "a 6 A type C RCBO with a 30 mA residual rating (a.c7rcd)". Added: "Any buried length to
  the bollards would need earthed armour, or a duct of equal strength such as N750 conduit. The sums take the singles
  all the way."
- p.dev.final (C7's device): "6 A type C circuit-breaker to BS EN 60898" → "6 A type C RCBO to BS EN 61009-1, 30 mA". The
  cite and note now name 714.411.3.4 and research sources 523, 527 and 528.
- g.zmax.C6 note: Table 41.3 gives the 6 A type C RCBO's overcurrent part the same 3.64 Ω. The value is unchanged.

## Dropped
Nothing dropped outright. Two "should" items were merged into an existing entry instead of added: the i2 sixth trap and
the i6 sixth point, because the validator allows at most five. Two were placed differently: the i8 rule line went into
summary.for, and the i7 lesson description was left unchanged. All four moves were made to stay within length limits.

## Checks
- validate.mjs lesson … --final --case: ok for i2, i6, i8 and i9 (verified and final). i7's lesson is unchanged and still ok.
- validate.mjs case: ok.
- Re-film (attempt 8, from iN.bodyF.html): i7, i8 and i9 verdicts ok. The first i7 run timed out starting the harness;
  the second passed. The passing iN.body8.x.html was copied to iN.body.final.html, and iN.a8.verdict.json to
  iN.verdict.final.json. attempts.txt was not touched.
- build, guide.mjs, assemble docs: ok (30 docs).

## Files changed
build/electrical/design-and-verification/ (and the same names under docs/courses/electrical/design-and-verification/):
case.json, research.json, i2/i6/i8/i9.lesson.verified.json and .lesson.final.json, i7/i8/i9.body.final.html, .bodyF.html,
.body8.x.html, i8.verdict.final.json, i7/i8/i9 a8 report/verdict/film files, i2/i6/i7/i8/i9.guide.json, out/* (rebuilt),
this file. Build only: tools/99 to 104 (harvested tool calls) and the a8 PNGs.
