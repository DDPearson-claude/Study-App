# Proportional reasoning: visual ideas

Written 11 Oct 2026 alongside the build, as a menu of pictures for the six lessons in `brief.md`.
It does not change the brief. Each idea is checked against the kit (`app/kit/KIT.md`), the steps
lessons already shipped (Percentages lesson 3, Negative numbers lesson 8) and the sources in
`research-notes.md`. Three of the ideas are drawn as phone-sized mockups in `visual-mockups/`
(contact sheet: `visual-mockups/contact-sheet.png`).

## The short version

| # | Lesson | The brief's picture | My top pick | How it differs |
|---|---|---|---|---|
| 1 | Ratios as blocks | A row of blocks in two kinds | **Turns as blocks**: a transformer whose turns are the blocks, primary on the left, secondary on the right | The blocks become something Dan already handles, and the order of the ratio becomes left and right on the core |
| 2 | Equivalent ratios and scaling | A ratio table with ×2, ×3 | **The shape test**: a room plan on squared paper, its corner sliding along a line from the bottom-left corner | Adding the same to both sides visibly squashes the room, and its corner falls off the line |
| 3 | Sharing in a ratio | A bar cut into blocks | **The bar, with "cut it into how many?"**: Dan picks the number of equal blocks and the shares follow | Same picture as the brief, but Dan finds that 3 : 2 needs 5 blocks; cutting 40 L into 3 overfills the bar |
| 4 | Unit rates | A double number line | **The per-one tile**: a double number line where the "1 kWh" chunk is a tile Dan finds, then stamps along | "Per one" becomes a thing he holds and repeats, not a division he does in his head |
| 5 | Direct proportion | Table and double number line | **The doubling test**: two bars (or two meters), with a ×2 ghost copy of the first laid against the second | The fixed charge shows up as the piece of the bill that does not double |
| 6 | Inverse proportion | A fixed-area rectangle | **The cylinder and its area**: drag a piston; above it a rectangle as wide as the air and as tall as its absolute pressure | The brief's rectangle, but tied to the gas, and the gauge-pressure slip fails on screen |

The three ideas that differ most from the brief: the shape test (lesson 2), the cylinder whose
air sets the rectangle's width (lesson 6, which also shows why gauge pressure fails), and the
re-stacked blocks for inverse proportion (lesson 6, second choice). Across the course, the
transformer can grow one meter at a time from lesson 1 to lesson 6. And one rectangle on squared
paper can carry lessons 2, 5 and 6: its corner runs along a straight line from the corner when
the ratio is fixed, and along a curve when the product is fixed.

## What the shipped lessons tell us about fit

- One SVG scene per step, 340 units wide, 160 to 290 tall, under a bold task line and above
  2 or 3 big answer tiles, Check and Why. Anything that needs more height than about 290 units
  pushes Check below the fold on a 360 px phone.
- The pictures that work are calm and dark: a solid ink bar on a grey track, brackets and
  label pills, the working written as a short sum with the multiplier on the highlighter. One
  thing moves at a time, about 0.6 s apart, and a demonstration lasts 3 to 5 s.
- Each lesson reuses one drawing and changes its layout per step (`lay` in Negative numbers 8).
  So each pick below is a single drawing family, not a new picture per screen.
- Every wrong answer has its own hint naming the slip. The ideas below add a picture of the slip
  as well: what Dan's wrong answer would look like if it were true.
- Two quantities are told apart by solid ink and a light tint (`fill1`), each named on the
  drawing. Red and green stay off quantities. Amber is the highlighter and the "remember this" box.

---

## Lesson 1. Ratios as blocks

What Dan must see: 3 : 2 means three of one for every two of the other; the first number belongs
to the first thing named (a 10 : 1 transformer is not 1 : 10); both parts in the same units; and
3 : 2 (part to part) is not "3 out of 2", it is 3 out of 5 (part to whole).

### 1a. The brief's blocks
- **Shows:** a row of equal blocks, ink for one thing and tint for the other, names on them.
- **Dan does:** taps + / − under each kind; the ratio and the total update.
- **Slip it exposes:** part : whole, with a bracket over all five blocks ("3 of these 5") set
  against a bracket over each kind ("3 : 2").
- **Motion:** blocks slide in from the edge one at a time; brackets draw left to right.
- **Risks:** generic. Nothing in it says why order matters, because two rows of blocks look the
  same either way round. Fine as the course's bookkeeping picture, weak as the hook.

### 1b. Turns as blocks (top pick; mockup 1)
- **Shows:** a transformer core drawn as a square frame, the primary winding on the left leg and
  the secondary on the right. Each turn is a short bar wrapped across the leg, so a winding is a
  stack of blocks you can count: ink turns for the primary, tinted turns for the secondary,
  numbered. "Supply in" on the left, "out" on the right. Under the core the ratio is written
  with each number sitting under its own winding: 5 under the primary, 2 under the secondary.
- **Dan does:** − / + under each leg adds or removes a turn (44 px buttons). Puzzles: "Wind it
  3 : 1, primary to secondary"; "This one is wound 2 : 8. Is it 1 : 4 or 4 : 1?"; a picture of a
  core, "which ratio is this?", with the swap as the wrong tile.
- **Slip it exposes:** order. A wrong answer lays a dashed ghost of the turns on the other leg
  ("1 : 3 would put 3 turns here, on the secondary"), so the slip is a different machine, not a
  different string of digits. The research names order as the transformer slip (notes 2.2 and 3.4).
- **Motion:** turns wind on one by one, bottom to top, each settling in about 0.3 s; the number
  under the leg counts up with them.
- **Risks:** real windings have far more turns; the drawing must say "a sketch" and never claim a
  turn count. Above about 12 turns a leg is too crowded at 360 px, so ratios stay small (10 : 1 at
  most, drawn as 10 and 1). Part : whole is awkward here (adding primary and secondary turns
  means little), so the part-to-whole screens need 1a or 1c. The turns ratio is only about turns
  in lesson 1; volts wait for lesson 5.

### 1c. The scoop and the jug (part to whole)
- **Shows:** scoops of two things tipped into a jug with five equal marks. Three scoops of one,
  two of the other, stacked as bands (before it is stirred).
- **Dan does:** taps a scoop to add it; the jug's marks re-space so each scoop is one mark.
- **Slip it exposes:** part : whole. The jug holds 5 scoops, so one kind is 3 of the 5 marks, and
  "3 out of 2" has nowhere to sit.
- **Motion:** a scoop tips, its band slides down into the jug.
- **Risks:** liquids do not layer when mixed; it must be drawn as scoops, not as a real mix. The
  trade use of mixes is unsourced, so no screen says "on site you will". A bit childish for Dan
  if it looks like a kitchen.

### 1d. Two rods, same units (a single screen)
- **Shows:** a 50 cm rod and a 2 m rod drawn to scale, and beside them "50 : 2" drawn as blocks.
  The blocks are wildly wrong for the rods; rewritten as 50 : 200 they match (then 1 : 4).
- **Slip it exposes:** mixing units. Source: Bitesize, "both measurements need to have the same units".
- **Risks:** a one-screen idea, not a lesson's picture.

**Pick: 1b, turns as blocks, with 1a's brackets for the two part-to-whole screens.** The brief's
blocks stay as the plain picture; the transformer gives them a body, makes order something you
can see (which side the supply comes in), and starts the running example the brief already
plans for lessons 5 and 6.

---

## Lesson 2. Equivalent ratios and scaling

What Dan must see: multiplying both parts by the same number keeps the ratio; adding the same
number to both does not; dividing both simplifies. Worked context: a scale drawing at 1 : 100.

### 2a. The brief's ratio table
- **Shows:** two linked rows (say width and height, or two parts of a mix); ×2, ×3, ÷2 buttons
  scale both; a "+2 to both" button.
- **Slip it exposes:** adding, by showing that 5 : 4 is not in the table built from 3 : 2.
- **Motion:** a new column slides in with its ×2 arrows.
- **Risks:** the failure is only numbers. Nothing on screen *looks* wrong after "+2", so Dan has to
  do the reasoning the picture should have done. The table is still the best record of working,
  so keep it as a small strip under a picture.

### 2b. Batches
- **Shows:** 3 : 2 as one framed batch (three ink, two tint). ×3 lays three identical batches
  side by side; 6 : 4 regroups into two frames of 3 : 2 (simplifying).
- **Dan does:** taps ×2, ×3, or "add 2 to both".
- **Slip it exposes:** adding. "Add 2 to both" leaves two ink and two tint blocks that cannot be
  closed into a frame: the frame tries, fails, and the loose blocks stay outside it.
- **Motion:** batches stamp in from the right; the failed frame draws, stops short, and the loose
  blocks sit outside it.
- **Risks:** fine to 4 or 5 batches, useless for 1 : 100 (a hundred blocks). Strong for mixes and
  for lesson 3 (sharing is counting batches).

### 2c. The shape test (top pick; mockup 2)
- **Shows:** a room plan on squared paper, 3 by 2, its bottom-left corner pinned to the corner of
  the paper. A thin line runs from that corner through the plan's far corner and on.
- **Dan does:** drags the far corner (`K.drag`, snapping to whole squares), or taps ×2, ÷2,
  "add 2 to both". Puzzle: "A plan is 3 by 2. Which bigger plan is the same room?" (6 by 4,
  5 by 4, 6 by 5).
- **Slip it exposes:** adding, visibly. ×2 gives 6 by 4: same shape, its corner still on the line.
  "Add 2" gives 5 by 4: a squarer room, its corner off the line. Dan can see the room is wrong
  before he does any sums. Simplifying is the reverse: 6 by 4 shrinks along the line to 3 by 2.
- **The scale-drawing screens:** the same paper, labelled in metres on one edge and centimetres on
  the other: 1 cm to 1 m is 1 : 100 (Bitesize). A 4.5 m by 3 m room drawn 4.5 cm by 3 cm keeps
  its shape because every length was divided by 100.
- **Motion:** the plan grows from its pinned corner along the line, about 1.5 s with easing;
  the "add 2" ghost grows first along the line, then bends off it (the squash is the motion).
- **Risks:** it is a graph in disguise, and the brief leaves graphs for The coordinate plane.
  Keep it as a drawing: no axes, no "y = kx", just squares and a pencil line. It shows ratios of
  two lengths well and mixes less naturally (pair it with a table strip for those). Grid of about
  9 by 6 squares at 28 units fits 340 wide and 170 tall.

### 2d. A photocopier enlargement
- **Shows:** a small drawing (a junction box with a cable entry) beside its copy at 200% and a copy
  "made 2 cm bigger each way", which is fatter and with its entry in the wrong place.
- **Risks:** pretty but busy, and it repeats 2c with more ink. A good SHOW screen inside 2c's
  lesson if a "real thing" is wanted.

**Pick: 2c, the shape test, with a one-row ratio table under it as the working.** The brief's
table records the multipliers, which the NCETM backs (notes 1.4); the shape test makes the
additive slip *look* wrong, which the table cannot. It also sets up lessons 5 and 6 (see the
cross-course ideas).

---

## Lesson 3. Sharing in a ratio

What Dan must see: the parts add to give the number of blocks in the whole (3 : 2 makes 5), one
block is the whole ÷ that number, each share is its blocks times one block.

### 3a. The brief's bar model
- **Shows:** a bar for the whole (40 L), cut into 5 equal blocks, 3 ink and 2 tint, each block
  labelled 8 L; the shares bracketed below, 24 L and 16 L.
- **Slip it exposes:** confusion about the whole, the most frequent misconception in one study
  (notes 3.2), only if a wrong answer is drawn too (see 3b).
- **Risks:** none in the picture; it is sourced (NCETM's "divide the whole into five parts").

### 3b. The bar, with "cut it into how many?" (top pick)
- **Shows:** the 40 L bar uncut, with the ratio 3 : 2 above it.
- **Dan does:** a small choice of 2 to 8 cuts. The bar splits into that many equal blocks, each
  labelled; the first 3 go to one share, the rest to the other; a readout says what ratio that
  makes ("3 : 4", "3 : 2", "3 : 0").
- **Slip it exposes:** part : whole and dividing by one part. Cut into 3 and the first share takes
  the whole bar, leaving nothing. The DO puzzle's wrong tile "one block = 40 ÷ 3" is drawn as it
  would be: three blocks of 13.3 L fill the bar, and the other share's 2 blocks hang off its end,
  past the 40 L mark, with "66.7 L in all: more than you have".
- **Motion:** cuts appear left to right, about 0.15 s apart; blocks then slide down to their share.
  The overflow blocks slide out past the end and stop, outlined in a dashed style keyed as
  "would need".
- **Risks:** a choice control of 7 options is near the kit's limit; 2 to 7 is enough. The overflow
  must stay inside 340 units: shorten the bar to about 200 units so a hang of up to about 2/3 of it fits.

### 3c. Dealing out in rounds
- **Shows:** 40 litre-cups dealt "3 to one jug, 2 to the other" round after round; a round counter.
  8 rounds use them up: 24 and 16.
- **Slip it exposes:** none sharply; it shows the build-up method, which the IES guide pairs with
  the ratio table (notes 3.5).
- **Risks:** slow (8 rounds) and fiddly to count at 360 px. Good as a 4 s SHOW, played fast,
  linking batches (2b) to the bar.

**Pick: 3b.** It is the brief's bar with one control added, so the build stays simple; Dan
discovers that the number of blocks is 3 + 2 rather than being told, and the most frequent
misconception fails on screen as a bar that overflows.

---

## Lesson 4. Unit rates

What Dan must see: a rate is a ratio of two different units; "per one" is the rate's size for one
of the second unit; once he has it, he scales by multiplying; and a rate holds only where it is steady.

### 4a. The brief's double number line
- **Shows:** kWh on the top line, grams of fuel on the bottom, locked together.
- **Dan does:** drags a marker; the other line reads off.
- **Risks:** the "1" on the top line is just another tick; the per-one idea is easy to miss.

### 4b. The per-one tile (top pick)
- **Shows:** the double number line, with a framed tile spanning 0 to 1 kWh on the top and 0 to
  the matching grams on the bottom.
- **Dan does:** first finds the tile: given "1,000 g for 5 kWh", he drags the tile's right edge
  until 5 copies fill 0 to 5 kWh (it snaps at 1; the bottom reads 200 g). Then ×7 stamps 7 tiles
  end to end, and the bottom reads 1,400 g.
- **Slip it exposes:** dividing the wrong way (5 ÷ 1,000 = 0.005 kWh per gram is a real rate, but
  not the one asked for: the tile is drawn for "per gram" and is a sliver). And the additive slip
  again: "6 kWh is 1,000 + 1 g" draws a single extra gram where a whole tile should be.
- **Steady only where it holds:** a SHOW screen draws the tiles up to "good load", then a run of
  tiles marked "?" near zero load. The research says only that fuel per kWh "increases greatly
  at low power" (notes 2.5), so no tile there gets a number. Honest, and it teaches the limit.
- **Numbers:** 200 g/kWh sits inside the sourced 155 to 225 g/kWh. Label the source as a
  consultancy blog, as the brief says.
- **Motion:** tiles stamp in at about 0.25 s each, with the bottom total counting up in step.
- **Risks:** two lines plus tiles plus labels at 360 px is about the limit; keep tick labels to
  every whole kWh and every 1,000 g.

### 4c. Gears, per turn
- **Shows:** a small gear meshing with a bigger one, teeth in teeth (the kit asks for parts drawn
  fitting). 12 teeth and 36 teeth.
- **Dan does:** drags the small gear round; a counter shows turns of each. One turn of the small
  gear is 1/3 turn of the big one: the rate "big turns per small turn".
- **Slip it exposes:** which way round a rate is (3 small turns per big turn, or 1/3 big turn per
  small turn).
- **Motion:** smooth rotation, teeth staying meshed (each gear's angle set from the other's, so
  the teeth never pass through each other).
- **Risks:** the rule (one tooth passes the meeting point for one tooth) is shown by the drawing,
  not sourced; the research sources only that gearboxes "reduce speed" by meshing teeth and the
  ratios 2 : 1 to 3 : 1 and 1,300 to 280 rpm (notes 2.3). Do not say the gearbox raises torque
  (unsourced; see flags). Harder to build than 4b (tooth geometry, phase), and it belongs as
  much to lesson 6.

### 4d. Volts per turn
- **Shows:** lesson 1's transformer with 100 turns drawn as 10 bundles, 230 V across them.
  2.3 V per turn; a 10-turn secondary gives 23 V.
- **Slip it exposes:** the per-one step that most turns-ratio sums skip.
- **Risks:** see flags: the arithmetic follows from the sourced "turns ratio = voltage ratio", but
  the reason (every turn sees the same changing flux) is not in the research and must not be said.
  It also spends lesson 5's surprise early. Good as one late screen if the build wants the
  transformer here.

**Pick: 4b, the per-one tile, with 4d as an optional transformer screen.** It is the brief's
double number line plus one object, the tile, which turns "find the rate per one, then scale"
into two things Dan does with his thumb.

---

## Lesson 5. Direct proportion

What Dan must see: double one, the other doubles; zero gives zero; the same multiplier links every
pair; a fixed charge plus a rate rises steadily but is not proportional (NCETM, notes 3.3).

### 5a. The brief's table and double number line
- **Risks:** a table can show "×2 here, ×2 there", but the fixed-charge case is easy to miss if
  the numbers merely look a bit off.

### 5b. The doubling test (top pick)
- **Shows:** two quantities as bars (or as the transformer's two meters, 5c). A ×2 button lays a
  dashed copy of the first bar twice end to end against the second.
- **Dan does:** sets the hours (or the primary volts), then presses ×2 and watches the copy
  arrive. Puzzles: "Is this in proportion?" for a few pairs, with a Yes / No tile.
- **Slip it exposes:** "every straight line is proportional". An electrician's job priced at a
  £40 call-out plus £30 an hour (example values): 2 hours is £100 and 4 hours is £160, and two
  copies of the £100 bar make £200. The £40 call-out block, drawn as its own piece at the start
  of the bar, is the part that does not double, and the gap between the copy and the real bar is
  exactly one more £40. For the transformer the copy fits exactly, every time.
- **Motion:** the copy lifts off the first bar, slides along, and settles against the second
  (about 1.2 s); the gap, if any, is bracketed last.
- **Risks:** "standing charge on an electricity bill" would need a source to call it real; an
  example call-out price does not. Keep bars to about 260 units so two copies fit.

### 5c. The transformer's two meters
- **Shows:** lesson 1's transformer, now with a voltmeter on each side. A slider sets the primary
  volts (0 to 400 V); the secondary needle follows at the turns ratio. At 0 V both read 0.
- **Slip it exposes:** none on its own; it is the direct proportion Dan knows from the job, and it
  sources cleanly ("turns ratio ... same as its voltage ratio", notes 2.2).
- **Motion:** needles swing with soft easing as the slider moves.
- **Risks:** two dials plus a core is busy at 360 px: draw the meters as small upright bar meters
  beside each leg instead of round dials. Good as the SHOW screens of 5b.

### 5d. Pinned at zero
- **Shows:** two rulers, hours above and £ below, pinned together at their zeros; stretching the
  top one stretches the bottom in step. The call-out rule moves the bottom ruler's zero to £40,
  and the pin no longer holds.
- **Risks:** a clever idea, but it asks Dan to read a shifted scale, which is harder than the
  thing being taught. Keep in reserve.

### 5e. The corner on a line
- **Shows:** lesson 2's squared paper; each (hours, £) pair is a corner. In proportion, every
  corner lies on one line from the paper's corner; the call-out pairs lie on a line that starts
  £40 up.
- **Risks:** this is the graph that the brief leaves to The coordinate plane. Strong as a single
  "one last look" screen if lesson 2 used 2c; otherwise skip.

**Pick: 5b, the doubling test, with 5c's transformer meters for the SHOW screens.** It is the
multiplicative link the Bitesize method asks for ("number of times greater"), done as a
physical copy, and the fixed charge fails on screen as a piece that will not double.

---

## Lesson 6. Inverse proportion

What Dan must see: one up, the other down, the product fixed; double one and the other halves;
Boyle's law at absolute pressure; a transformer's current goes the other way to its voltage; a
reduction gearbox is a ratio of speeds.

### 6a. The brief's fixed-area rectangle
- **Shows:** a rectangle; drag one side and the other follows so the area stays the same.
- **Slip it exposes:** inverse treated as direct, if a wrong answer is drawn as a rectangle of the
  wrong area.
- **Risks:** abstract. Why should pressure × volume be an area? The rectangle asserts the fixed
  product; nothing in it makes Dan believe it. Tie it to something (6b, 6c).

### 6b. The cylinder and its area (top pick; mockup 3)
- **Shows:** a cylinder of air drawn on its side, a piston and its rod, litre marks along the
  barrel. Above it, a rectangle whose width is locked to the air's length in the barrel (the same
  scale, a dashed guide down to the piston face) and whose height is the air's absolute pressure,
  from absolute zero. A dashed line at 1.013 bar marks the atmosphere; the strip of the rectangle
  above that line is the gauge pressure, hatched and labelled. The starting rectangle stays as a
  dashed outline.
- **Dan does:** drags the piston (`K.drag`, snaps at whole litres); readouts give volume, absolute
  and gauge pressure. Puzzles: "6 L at 1.013 bar absolute, squeezed to 3 L: absolute pressure?"
  with 2.03, 0.51 (direct) and 1.01 (gauge) as tiles; then "a gauge reads 1 bar: what goes into
  Boyle's law?"
- **Slips it exposes:**
  - *Inverse treated as direct:* the wrong tile is drawn: half the width *and* half the height,
    a rectangle a quarter of the start, so three quarters of the air's product has vanished.
  - *Gauge for absolute* (the MCA line "gauge and absolute and vice versa", notes 2.1): at the
    start the gauge strip has no height at all (0 bar gauge), so gauge × volume = 0, yet after
    squeezing it is not zero. Only the whole rectangle, measured from absolute zero, keeps its
    area. This is a new picture of why Boyle's law needs absolute pressure.
- **Motion:** while the piston moves, the rectangle narrows with it and grows taller in step;
  the area readout does not change. A demonstration pushes from 6 L to 3 L in about 2 s,
  pauses, then the gauge strip is bracketed.
- **Risks:** two linked drawings in about 280 units of height is the most this lesson can carry;
  the mockup fits with room for 3 tiles below. Show the air as a tint, with at most a few dots
  labelled "the same air": the research does not source the molecule story, so the drawing must
  not explain pressure by collisions. A fast squeeze heats air (that is how a diesel lights its
  fuel), so Boyle's law needs "at the same temperature", which the research's quotes do not
  state; see flags. Never pair this picture with the diesel compression ratio.

### 6c. Re-stacked blocks (the product as a count)
- **Shows:** a job of 12 electrician-days as 12 blocks in a grid: 2 columns (electricians) by
  6 rows (days). A control sets the columns to 1, 2, 3, 4, 6 or 12, and the same 12 blocks
  re-flow into the new shape.
- **Slip it exposes:** inverse as direct. "Twice the people, twice the days" is drawn as 4 columns
  by 12 rows: 48 blocks, 36 of them dashed, "work that is not in the job".
- **Motion:** blocks lift and fly to their new places along soft curves, about 1 s.
- **Risks:** it assumes everyone works at the same rate (say so). Whole numbers only. It is the
  best way to make "the product is fixed" obvious, because the product is a count of blocks that
  are only moving, and it reuses lesson 1 to 3's blocks; use it as the lesson's opening SHOW
  before 6b.

### 6d. Meshing gears, teeth × speed
- **Shows:** a 20-tooth pinion driving a wheel whose teeth Dan sets (20 to 60). A counter at the
  meeting point counts teeth passing per minute, the same for both gears; so teeth × rpm is the
  same for both, and the bigger wheel turns slower.
- **Slip it exposes:** inverse as direct ("bigger gear, faster").
- **Risks:** the teeth rule is shown, not sourced; the sourced figures are 2 : 1 to 3 : 1 and
  1,300 to 280 rpm (4.6 : 1 is not a whole tooth ratio for small gears; use example teeth, labelled).
  No torque. Hard to build (tooth shapes that mesh at any count). Better as one SHOW than as the
  lesson's picture.

### 6e. The transformer's two rectangles (needs a source)
- **Shows:** a rectangle for each winding, volts across and amps up: 230 V × 1 A on the primary,
  23 V × 10 A on the secondary, same area. A wrong "the current steps down too" answer draws the
  secondary as 23 V × 0.1 A, a tiny rectangle.
- **Slip it exposes:** the brief's own hook ("why does the current go up ten times instead of
  down?"), which is where inverse-as-direct really bites for an electrician.
- **Risks:** the area is power (volt-amps), and "the same on both sides of an ideal transformer"
  is not in the research; the notes source only the 10 : 1 example. Needs a source at build time
  before any screen says it. Without one, show the 10 : 1 current as a ratio only.

**Pick: 6b, the cylinder and its area, opened by 6c's re-stacked blocks.** The brief's rectangle
earns its place once its width *is* the air in the barrel; Dan can then watch the product hold,
and watch the gauge reading fail to hold. The blocks give the fixed product a reason before the
gas arrives.

---

## Cross-course ideas

1. **The transformer, one meter at a time.** Draw one core, primary on the left with the supply
   arrow, in every lesson that uses it, and add a layer each time:
   - lesson 1: turns as blocks (order is left and right);
   - lesson 2: simplify 2,300 : 230 turns to 10 : 1 (dividing; an example winding, labelled);
   - lesson 4 (optional): volts per turn;
   - lesson 5: a voltmeter on each side, the secondary following;
   - lesson 6: an ammeter on each side, the current going the other way (as a ratio; as areas
     only with a source).
   Dan learns one machine whose parts he can count, and each lesson adds a number to it.
2. **One sheet of squared paper, three rules.** A rectangle pinned at the corner of the paper:
   - lesson 2: keep the shape. The far corner runs along a straight line from the pinned corner.
   - lesson 5: in proportion, every (amount, amount) corner lies on that kind of line; a fixed
     charge starts the line part-way up the edge.
   - lesson 6: keep the area. The corner runs along a curve instead.
   Both slips become "your corner left the path": adding leaves the straight line; treating
   inverse as direct follows the straight line when it should follow the curve. It previews
   The coordinate plane without teaching graphs; keep axes and equations out.
3. **Blocks that never change size.** The same block from lesson 1 is a turn (lesson 1), a batch
   member (lesson 2), a share of the bar (lesson 3), a per-one tile (lesson 4) and a unit of work
   (lesson 6). One visual grammar for "a part".
4. **A ghost for every slip.** In each lesson a wrong answer is also drawn, as a dashed outline
   keyed "what that answer would mean": the transformer wound the other way, the squashed room,
   the overflowing bar, the gram where a tile should be, the bill copy that overshoots, the
   quarter-size rectangle. The hint text stays as now; the ghost makes it visible. Muted and
   dashed, not red, since it is a quantity; the "Not quite" line carries the mistake.
5. **The gearbox as a second machine.** If one machine is not enough, the gearbox can recur: the
   order of a 3 : 1 reduction (engine turns first, lesson 1), propeller turns per engine turn
   (lesson 4), and teeth against speed (lesson 6). It costs more to build than the transformer
   and is less well sourced, so it is the second choice.

## Facts a visual would need that the research does not source

Each is flagged so the build does not slip it in through a picture.

- **A gearbox raises torque as it lowers speed.** Not sourced (the brief already says so). No gear
  picture may show a bigger turning force on the slow shaft.
- **Tooth counts set the speed ratio** (teeth × rpm the same on both gears). Shown by counting
  teeth at the meeting point, so it can be taught as a rule the drawing derives, but no source says
  marine gearboxes have particular tooth counts. Use example teeth, labelled.
- **Why turns ratio equals voltage ratio** (each turn sees the same changing flux). Not sourced.
  "Volts per turn" as arithmetic follows from the sourced ratio; the reason must not be stated.
- **Volts × amps the same on both sides of a transformer** (ideal, losses ignored). Not sourced;
  needed for 6e's two rectangles. Only the 10 : 1 example is sourced.
- **Boyle's law holds at constant temperature, for the same amount of gas.** The research's quotes
  say only "the volume of the gas varies inversely with the absolute pressure"; the build's own
  calibration question says "at the same temperature", which needs a quote. Engineering ToolBox
  (already a source) is the likely place.
- **A fast compression heats the gas, so a diesel's compression is not Boyle's law.** Not sourced,
  and the reason never to put the compression ratio (14 : 1 to 24 : 1) next to Boyle's law: Dan
  would conclude a 16 : 1 diesel reaches 16 times its starting pressure. The compression ratio
  stays a ratio of two volumes (Britannica), in lessons 1 or 2 only.
- **Gas pressure as molecules hitting the walls.** Not sourced. Draw the air as a tint, with no
  explanation of why it pushes back.
- **How far fuel per kWh rises at low load.** Only "increases greatly" and "dramatically at idle"
  are sourced; any curve or number there would be invented. Use "?" tiles.
- **Paint mixing to a shade.** A computed in-between colour is not how pigments mix and breaks
  the colour rules; not used.
- **A standing charge on a real electricity bill.** Would need a source; the call-out example
  (example values) does not.
- **Velocity ratio of a pulley block** (pull 4 m of rope, lift 1 m). The MCA syllabus names
  velocity ratio and lifting machines (notes 2.1), which would make a fine lesson 4 or 6 picture,
  but how a pulley block gives its ratio is not sourced. A candidate for a later Mechanics course.

## Mockups

In `visual-mockups/`, 360 px wide, light mode, D4 tokens (ink #1D1F22, grey #F2F3F4, teal
small labels, tint for the second quantity, amber only on the highlighter):

- `l1-turns-as-blocks.svg`: lesson 1, a SHOW screen with − / + under each winding.
- `l2-shape-test.svg`: lesson 2, a puzzle just answered: ×2 on the line, "add 2" off it.
- `l6-cylinder-area.svg`: lesson 6, the piston at 3 L, the rectangle above it, the gauge strip.
- `contact-sheet.png`: the three side by side.

They are static sketches of the idea, not kit code; sizes and spacing follow the shipped steps
lessons so the build can lift them straight into a `lay`.
