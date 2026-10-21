# Where Motors sits on the Electrical engineering shelf

Written 20 Oct 2026 with `brief.md`. A proposal only: `docs/shelves-electrical.json` is not changed.

## The proposal: Motors becomes the planned "Machines and drives" course

The "Power and machines at sea" folder already plans `machines-and-drives`, "Machines and drives":
"Induction motors, generators and the drives that start and control them" (`tid: null`, nothing
built). Motors covers most of that promise: induction motors, the DOL starter and star-delta, the
variable speed drive, plus single-phase and DC motors. It does not cover generators.

So I propose Motors **takes that slot**, under the name you asked for:

```json
{
 "id": "motors",
 "title": "Motors",
 "blurb": "What you need to know on each motor: how it works, how it behaves, where it is used, how it fails, and the starter and drive that control it.",
 "tid": null
}
```

- **The id becomes `motors`**, matching `docs/courses/electrical/motors/`, as `ac-circuits` and
  `design-and-verification` match their folders. Nothing in `app/` or `tools/` reads the old id, and
  no topic was ever made for it.
- **Generators move to "Three-phase power systems at sea".** Its blurb already holds "Generators in
  parallel", and the AC circuits brief sends alternator excitation, synchronising and load sharing
  there. The alternator's poles and speed arithmetic fits there too, next to the same 120f ÷ p that
  Motors lesson 1 teaches. I suggest its blurb becomes: "Generators, their speed and excitation,
  running in parallel, insulated and earthed neutrals, and earth fault detection."
- **Place in the folder: first.** Motors needs only AC circuits, and you want it now. Three-phase
  power systems at sea is not planned yet and gains from Motors (the generator is the motor's
  mirror; the DOL lesson's "the supply sets the size limit" leads into it). New folder order: Motors,
  Three-phase power systems at sea, Instrumentation and control, Maintenance and fault-finding.
- **The folder's blurb stays:** "Generation, distribution, motors and drives, and the instruments
  that watch over them."

## One loose end in a built lesson

AC circuits lesson 10, already built, says a motor's star and delta windings are something "the
Machines and drives course takes up". With the rename it should say "the Motors course". That is a
one-sentence text patch (`tools/course/patch_text.py`) when AC circuits is next published; until
then the pointer still leads to the right place. The AC circuits brief's other pointers to Machines
and drives split the same way: motors and star-delta to Motors, alternators to Three-phase power
systems at sea.

## How it relates to the other courses

- **AC circuits** (before it): lessons 1, 4, 5, 6, 8, 9 and 10 are used, never re-taught (brief
  section 1 has the table).
- **Design and verification** (beside it): Motors uses the showroom motor's 23.08 A in the star-delta
  screen and names motor circuits' device types; it teaches no cable sizing.
- **Maintenance and fault-finding** (after it): Motors names the tests (insulation resistance,
  winding balance) and what a bad result means for each machine; the method of fault-finding stays
  in that course.
- **Instrumentation and control**: the VSD's harmonics get one line in Motors; the theory stays
  there, as the AC circuits brief already agreed.
