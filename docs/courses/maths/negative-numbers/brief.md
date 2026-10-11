# Negative numbers: the course brief

Written 10 Oct 2026 for Dan, answering the course brief in tools/course/RUNBOOK.md section 0, and
revised the same night after a review. The short version is all you need to read. The details
below it are there if you want them. Numbers in square brackets point to the sources at the bottom.

## The short version
**Nine lessons**
1. Below zero
2. Gaps across zero
3. Adding
4. Taking away
5. Taking away a negative
6. Multiplying
7. Dividing
8. Order with negatives
9. Formulas and your calculator

**The main picture:** an upright number line, drawn like a thermometer. Up is bigger.

**The pilot:** lesson 1, plus one test screen of the trickiest picture (3 − (−2) with a marker
that faces a way). You try them on your phone before the rest is built.

**Five questions for you**
1. Are these nine lessons right?
2. Are you happy with the upright number line as the main picture?
3. Which course is your college running? See "Your college route" below: there is a current
   route either way.
4. Which calculator does your college require? Lesson 9 shows the Casio fx-991EX unless you say
   otherwise.
5. The lean build (about 2.5M tokens for this course) or the full process (about 15M, measured
   on Fractions lessons 4 to 8)? See "Size and cost".

## 1. The overall topic
Numbers below zero, and how to calculate with them: the readings, changes and answers that go
negative on a thermometer, a pressure gauge, a meter or a ship's stability sums. It covers
ordering, gaps and size, the four operations with whole numbers and decimals, the order of
operations with negatives, and putting negatives into formulas and a calculator. It stops there.
Negative powers of ten wait for Powers of ten and units if you want that course (see the roadmap),
or else Exponents and radicals. Plotting in four quadrants waits for The coordinate plane, and
rearranging formulas for Solving equations.

## 2. The lessons, in the order they build
1. **Below zero.** Place, read and order numbers below zero, whole or not (−3, −0.8, −3/4), on a
   thermometer, a gauge or a meter. Higher up is bigger, so −5 is warmer than −18. A minus can
   mean "the other way": a meter reads −12.0 V when its leads are swapped. Folded in: someone chose
   where zero is (0 °C, atmospheric pressure, midships) and which way counts as plus; and opposites
   (3 and −3 sit the same distance either side of zero).
2. **Gaps across zero.** Count through zero to find the gap between two readings. −20 °C to +4 °C
   is 24 degrees, and a gap is never negative. A reading's size leaves its sign off: the size of
   −12 V is 12. Optional extra: the bars, |−5| = 5.
3. **Adding.** Adding a positive moves up and adding a negative moves down (−6 + 2 = −4). Up 3,
   then down 3, lands where you started, so a number and its opposite cancel. A negative answer
   means "the other way".
4. **Taking away.** Take away past zero (2 − 5 = −3). A change is last minus first, so a fall
   comes out negative. A gap has no sign; a change does.
5. **Taking away a negative.** 3 − (−2) = 5. The rule is on screen in plain words, "taking away a
   negative is adding its opposite", and the marker shows why.
6. **Multiplying.** 3 × −4 = −12 and −3 × −4 = 12, and why minus times minus is plus.
7. **Dividing.** Divide by undoing a multiplication: ? × −3 = 12, so 12 ÷ −3 = −4. Check by
   multiplying back.
8. **Order with negatives.** Brackets, then powers, then times and divide, then add and take away.
   Equal partners go left to right, so 8 − 3 + 2 = 7. −3² = −9, but (−3)² = 9. A minus in front of
   a bracket: 10 − (3 − 5) = 12, and −(5 − 8) = 3.
9. **Formulas and your calculator.** Put a negative reading into a formula, bracket it when you
   key it in, and use the (−) key, not the take-away key.

Lessons 3 to 7 each have one decimal puzzle, because real readings are decimals. Lessons 3 and 5
each end with a chain like 5 − 3 + (−2) − (−4), the shape of a Kirchhoff or moments sum.

Lesson 2 comes early because gaps across zero turn up all over your route, and it makes lesson 5
make sense: 4 − (−20) is the 24-degree gap you already know. England's curriculum uses the same
order, with gaps across zero in Year 6, before the four operations at KS3 [1][2].

Lessons 8 and 9 matter most for college maths. The MCA maths syllabus names lesson 8's bracket
rule as a skill of its own [3].

## 3. Can it be taught mostly visually, through interaction?
Yes. Every lesson is a steps lesson, like Fractions: about 12 screens alternating SHOW (one to
three plain sentences and a softly animated picture) and DO (a puzzle with Check, a one-line hint,
Why?), ending with two or three mixed puzzles. Minimal writing.

No one picture does everything [4], and NRICH advises "one (or at most two)" models
[5]. So there is one main picture and one helper, and each lesson says where its picture
stops working.

- **The main picture: an upright number line, drawn like a thermometer** (lessons 1 to 7). Up is
  bigger. A line you move along beat counters in a trial with eight classes. It scored 11 points
  higher out of 100 straight after, and 13 points higher in a later test [6]. Upright lines
  are a tested model too [7], thermometers already work that way [8], and it
  fits a phone held upright. In The coordinate plane the same line becomes the y-axis.
- **The helper: a marker that faces a way (lessons 3 to 5).** Facing up means add, facing down
  means take away. It steps forwards for a positive number and backwards for a negative one
  [9]. You tap to turn it, then watch it hop. That's how you see 3 − (−2) = 5. The rule
  sits beside it in words: the marker is the why, not a replacement for the rule.
- **Opposites cancel on the same line:** up 3, then down 3, and you're back where you started.
- **Multiplying (lesson 6): a pattern, then a half-turn.** Step the multiplier down 3, 2, 1, 0,
  −1, −2 and watch the answer keep moving by the same amount past zero
  [10][11]. Then times −1 turns the line half a turn about zero, so two
  half-turns put it back [12]. The marker stops working here, and the screen says so. If your electrical course
  uses the j-operator (not yet confirmed for your syllabus), this half-turn is j² = −1 [13].
  The Why? gives the brackets argument: 5 × (3 + −3) has to equal 5 × 0 [14].
- **Dividing (lesson 7): undo a multiplication.** ? × −3 = 12, so −4. Check by multiplying back
  [15]. Hops work only when the signs match (how many hops of −3 land on −12?), and the
  screen says so: 12 ÷ −3 has no hop picture.
- **Lessons 8 and 9: brackets and a calculator.** Toggle the brackets on −3² and watch the answer
  change. Drag a reading into a formula and watch each step work through.
- **Settings, not models.** Cold rooms, reefer boxes, gauges, a ship's length from midships and
  the mains waveform give the puzzles a home. They don't do the explaining.
- **Colour.** Negatives aren't red. In the app red means a mistake, and "Negative does not mean
  'bad'" [16].

**Pictures to avoid, and why:**
- **Money and debt as the explanation.** It breaks at multiplying, because you can't multiply a
  debt by a sum of money [17].
- **Temperature to explain minus times minus.** "Taking away cold" can explain −(−5) = 5, but not
  why negative times negative is positive [18].
- **Counters or zero-pair tiles.** They'd be a third model, and counters did worse in the trial
  [6].
- **"Two minuses make a plus" in place of meaning.** It's "a rote-learned phrase that is often
  misapplied" [5], and Oak lists it as a common misconception [19].

**Teaching an adult.** Most of the teaching research studied children. One study had college
students: they did well, and "many tended to use rules or order-based reasoning", not the number
line [20][21]. So every lesson states the rule in words beside the picture. That the rest
of the research holds for an adult is my judgement, not a finding.

## 4. What else
- **Benchmark.** Brilliant's Negative Numbers is 44 lessons and 569 exercises [22]. I
  couldn't confirm its level names. Lesson titles seen in search excerpts include "Positives and
  Negatives", "Zero", "Opposites", "Making Integers", "Subtracting Negatives", "Adding The
  Opposite" and "Longer Expressions", with sections on absolute value and distance [22].
  Its description promises multiplying and dividing, but no lesson title I could see names them.
  Brilliant's standards page may send multiplying signed numbers to its Exponents and Radicals and
  Linear Equations courses [23], but I couldn't confirm that page.

  Khan Academy, Oak National Academy (Year 7) and BBC Bitesize all run in one order: the number
  line and ordering, then adding, then taking away, then multiplying and dividing. Khan and Oak go
  on to powers and order of operations [24][25][8][11]. None of the
  pages I read uses engineering examples.

  This course follows that shared order and adds what you need:
  - gaps across zero as a skill of its own, with size in one screen (Brilliant gives absolute
    value whole sections)
  - multiplying and dividing, with the why
  - order of operations with negatives
  - formulas and the calculator
  - examples from ships, engines and electrics
- **Starting point.** You already read temperatures below zero. Your meter shows a minus when the
  leads are swapped [26], and cable datasheets give ranges like −40 °C to +65 °C [27].
  England teaches negatives from Year 5, gaps across zero in Year 6, and all four operations at
  KS3 [1][2]. So you've met them before, but I won't assume they're second nature. Fractions
  lesson 1 (live) put fractions on a number line, and lesson 1 here builds on it. Fractions lesson
  8 (dividing as "how many fit") is still being built. If it's live first, lesson 7 can point back
  to it; if not, nothing here depends on it. Nothing about electrics is taught.
- **Your aim.** The MCA's Second Engineer maths syllabus asks you to add and subtract "algebraic
  quantities, both positive and negative". It also asks for "the effect of plus or minus signs in
  front of a bracketed quantity" (lesson 8) and for the signs "in the multiplication and division
  of quantities" [3]. The small-vessel General Engineering Science I syllabus asks for
  "addition, subtraction and product of positive and negative numbers" [28]. The
  electro-technology syllabus asks you to tell the temperature coefficient at 0 °C from one at a
  stated temperature (lesson 9) [29]. SQA's HND Marine Engineering gave exemptions from the
  maths paper and others [30], but not for new entries since 31 August 2025 (next point).
  The other papers use negatives throughout.
- **Your college route (question 3).** SQA's HNC/HND Marine Engineering stopped counting toward a
  certificate of competency for new entries from 31 August 2025. Anyone already enrolled must
  finish by 31 August 2030 [31]. That isn't the end of the HND route. A new MCA cadet
  syllabus has been taught since September 2025 [32], and Solent, for one, says its engineer
  cadet HND is aligned to it [33]. Its draft maths is published on gov.uk as consultation
  templates. The one I found, "09 Marine Engineering – Engineering Mathematics 2" (updated 12 July
  2023), starts with trigonometric and hyperbolic functions [34]. I haven't yet found the
  template for the basics; that's my next lead. This course is needed either way.
- **Where each is used.**
  - **1 Below zero.**
    - Reefer claims have come from confusing positive and negative temperatures [35]. That's
      a good opening line, once I've read the bulletin's exact words.
    - Cold rooms: the vegetable room is kept at +4 to +6 °C, the fish and meat rooms at −18 to
      −20 °C [36]. Frozen cargo is carried "at or below -18°C" [35].
    - A compound gauge shows "both positive and negative (vacuum) pressures" on one dial
      [37].
    - Midships is a zero someone chose, and so is which way is plus. One stability booklet takes
      forward as plus [38]; one trim calculator takes aft as plus [39].
  - **2 Gaps across zero.**
    - The meat room to the vegetable room is 24 degrees (−20 to +4, computed).
    - 230 V mains peaks at about 325 V [40], so it swings about 650 V peak to peak
      (computed). The MCA electro-technology syllabus asks for peak-to-peak values [29].
    - A 20-foot reefer runs from −30 °C to +30 °C [41], a 60-degree span (computed).
  - **3 Adding.**
    - Absolute pressure is gauge plus atmospheric [42]. So −0.8 bar gauge is
      −0.8 + 1.013 = 0.213 bar (computed), "roughly 213 mbar absolute" [43].
    - Kirchhoff's laws and moments add chains of signed amounts. A negative answer means the
      current or the turning goes the other way: "The negative value of I 2 does not indicate a
      mistake" [44][45].
  - **4 Taking away.**
    - "change in velocity = final velocity - initial velocity", so slowing down gives a negative
      change [46].
    - The MCA syllabus says an unstable ship's GM "is regarded as negative" [47].
  - **5 Taking away a negative.**
    - A reefer is built to hold cargo at the temperature it was loaded at, not to cool it
      [35]. In one claim, cargo loaded at about −5 °C had to come down to −18 °C [35] (to
      re-check). That's a change of −18 − (−5) = −13 degrees (computed). It's taught as the case
      that went wrong, not as normal practice.
    - Kept off the screens: the first law (ΔU = Q − W). It needs three new symbols, and textbooks
      differ on the sign of work [48][49].
  - **6 Multiplying.** Cold raises a solar panel's voltage. One worked example gives
    "-65 x (-0.245) = 15.9%" [50].
  - **7 Dividing.** Acceleration is the change in velocity divided by the time (v = u + at
    [51]). Slowing from 12 to 4 m/s in 4 s gives (4 − 12) ÷ 4 = −2 m/s² (computed).
  - **8 Order with negatives.**
    - Stability: GMeff = KM − KG − FSC [52], worked left to right.
    - In v² = u² + 2as [51], u² comes before the adding, and u can be negative.
  - **9 Formulas and your calculator.**
    - Copper's resistance: R = R20[1 + α20(t − 20)] [53], with α20 = 0.00393 per °C,
      copper's coefficient at 20 °C [54]. At −20 °C, t − 20 = −40, so R = 0.843 R20
      (computed). The syllabus asks for this sum, and for α at 0 °C told apart from α at a stated
      temperature [29].
    - Kelvin = °C + 273.15 [55]. LNG is carried at "approximately -162°C" [56], so
      about 111 K (computed). The Applied Heat syllabus asks you to tell Celsius from Kelvin
      [57].
    - To square a negative on the fx-991EX, put it in brackets: (−3)² [58].
- **The mistakes to catch, each with its own puzzle and hint.** A "check" is a puzzle for a skill
  where no source names the slip.
  - **1 Below zero.**
    - **Mistake:** reading −18 as bigger than −5, because 18 is bigger. Two close negatives, like
      −5 and −6, are the hardest pair of all [59][60].
      **Puzzle:** drag −5 °C and −18 °C onto the thermometer, then tap the warmer.
      **Hint:** "Higher up is bigger. −5 sits above −18."
    - **Mistake:** reading "least cold" as "the least of the cold" [61].
      **Puzzle:** three cold rooms at −29, −18 and −12 °C [62][36]. Tap the least cold.
      **Hint:** "Least cold means warmest: the one nearest the top."
    - **Mistake:** taking a negative reading for a mistake [44].
      **Puzzle:** a meter on a 12 V battery reads −12.0 V. What happened [26]?
      **Hint:** "The leads are the other way round. Here a minus means 'the other way', not
      'wrong'."
  - **2 Gaps across zero.**
    - **Mistake:** giving the gap a minus sign, so −5 °C to 3 °C comes out as "−8 °C" [63].
      **Puzzle:** drag two markers to −20 and +4. How far apart are they?
      **Hint:** "A gap is a distance, never negative. Count up from the lower one: 20 to zero,
      then 4 more."
    - **Check:** what size is −12 V?
      **Hint:** "Size leaves the sign off: 12."
  - **3 Adding.**
    - **Mistake:** using "two negatives make a positive" when adding, so −10 + −30 comes out as
      +40 [64][5].
      **Puzzle:** −10 + (−30) with the marker.
      **Hint:** "Adding a negative moves you down. Down 10, then 30 more: −40."
    - **Mistake:** making the answer negative because there's a negative in it, so
      6 + (−2) = −8 [65].
      **Puzzle:** 6 + (−2) with the marker.
      **Hint:** "Adding −2 moves you down 2 from 6. You stop at 4, still above zero."
    - **Mistake:** dropping the minus, so −6 + 2 = 4 [66].
      **Puzzle:** −6 + 2.
      **Hint:** "Up 2 from −6 only reaches −4. You're still below zero."
    - **Checks to finish:** −0.8 + 1.013 = 0.213, and the chain 5 + (−3) + (−2) + 4 = 4.
      Brilliant's course has a lesson called "Longer Expressions" [22].
      **Hint (chain):** "One step at a time, left to right: 2, then 0, then 4."
  - **4 Taking away.**
    - **Mistake:** skipping zero, so 2 − 5 = −4 [67].
      **Puzzle:** hop 2 − 5 one step at a time.
      **Hint:** "Zero counts as a step: 1, 0, −1, −2, −3."
    - **Mistake:** always taking the smaller from the bigger, so 3 − 5 = 2 [67].
      **Puzzle:** 3 − 5.
      **Hint:** "Start at 3 and go down 5. You end below zero, at −2."
    - **Mistake:** "two minuses make a plus" again, so −7 − 3 becomes 7 + 3 [67][68].
      **Puzzle:** −7 − 3.
      **Hint:** "One minus says where you start, the other says go down. From −7, down 3: −10."
    - **Mistake:** mixing up the minus as a sign with the minus as take away. "Students must be
      able to interpret the minus sign in at least three ways" [4].
      **Puzzle:** in −7 − 3, tap the minus that means "below zero".
      **Hint:** "The one stuck to the 7 is a sign. The one between them means take away."
    - **Check: a gap or a change?** The same two readings both ways round. −20 → +4 is a gap of
      24 and a change of +24. +4 → −20 is a gap of 24 and a change of −24.
      **Hint:** "A gap has no sign. A change is last minus first, so a fall is negative."
    - **Check:** 0.5 − 1.2 = −0.7.
      **Hint:** "Down 1.2 from 0.5 takes you past zero: −0.7."
  - **5 Taking away a negative.**
    - **Mistake:** going the wrong way, so 3 − (−2) = 1 [67].
      **Puzzle:** turn the marker to face down, then step backwards 2.
      **Hint:** "Facing down and stepping backwards takes you up: 5."
    - **Mistake:** 0 − (−5) = −5 [68].
      **Puzzle:** 0 − (−5).
      **Hint:** "Taking away −5 is the same as adding 5: 5."
    - **Mistake:** thinking taking away always makes a number smaller [66].
      **Puzzle:** is 5 − (−2) more or less than 5?
      **Hint:** "Taking away a step down leaves you higher: 7."
    - **Checks to finish:** −2.5 − (−4) = 1.5, and the chain 5 − 3 + (−2) − (−4) = 4.
      **Hint (chain):** "Left to right: 2, then 0, then taking away −4 adds 4."
  - **6 Multiplying.**
    - **Mistake:** making −3 × −4 negative "because there's a negative". A study records this slip
      for dividing [65]. I expect it here too, but no source shows it for multiplying.
      **Puzzle:** carry on the pattern 3 × −4 = −12, 2 × −4, 1 × −4, 0 × −4, −1 × −4.
      **Hint:** "Each step adds 4. After 0 comes 4, 8, 12."
    - **Mistake:** carrying the times rule back to adding, so −3 + −4 = 7 [64][5].
      **Puzzle:** −3 × −4 and −3 + −4 side by side.
      **Hint:** "Times: two half-turns, so 12. Adding: two moves down, so −7."
    - **Check:** three negatives, (−2) × (−3) × (−4) = −24 [69].
      **Hint:** "Three half-turns leave the line flipped: −24."
    - **Check:** −65 × −0.245, the solar panel sum [50].
      **Hint:** "Two negatives, so positive. Then 65 × 0.245 = 15.925."
  - **7 Dividing.**
    - **Mistake:** −8 ÷ −4 = −2 "because there is negative" [65].
      **Puzzle:** how many hops of −4 land on −8? The signs match, so hops work.
      **Hint:** "Two hops of −4 make −8, so it's 2. Check: 2 × −4 = −8."
    - **Check:** 12 ÷ −3, asked as ? × −3 = 12.
      **Hint:** "−4 × −3 = 12, so it's −4. No hops here: the signs differ."
    - **Check:** −1.2 ÷ 0.6 = −2.
      **Hint:** "2 × 0.6 = 1.2, and the signs differ, so −2."
  - **8 Order with negatives.**
    - **Mistake:** taking −3² as 9, as if the sign "sticks" to the 3. This slip lasts into college
      calculus [70].
      **Puzzle:** toggle the brackets on −3² and pick the answer each time.
      **Hint:** "The power belongs to the 3 alone. Square first, then the minus: −9. Brackets make
      it (−3) × (−3) = 9."
    - **Mistake:** adding before taking away, because BIDMAS lists A before S. "BIDMAS suggests
      something that simply isn't true (that division is before multiplication and addition
      before subtraction)" [71].
      **Puzzle:** 8 − 3 + 2.
      **Hint:** "Equal partners go left to right. 8 − 3 = 5, then 5 + 2 = 7."
    - **Checks: a minus in front of a bracket** (a named syllabus skill [3]):
      10 − (3 − 5) and −(5 − 8).
      **Hints:** "Brackets first: 3 − 5 = −2, and taking away −2 adds 2: 12." "5 − 8 = −3, and
      the opposite of −3 is 3."
    - **Check:** (−2)³ = −8.
      **Hint:** "Count the half-turns: three, so negative."
  - **9 Formulas and your calculator.**
    - **Mistake:** dropping the minus when putting a reading in [66].
      **Puzzle:** a copper wire at −20 °C. Is its resistance more or less than R20?
      **Hint:** "t − 20 = −40, so the bracket is less than 1. Less: about 0.843 R20."
    - **Mistake:** keying a negative into a formula without brackets [58].
      **Puzzle:** v² = u² + 2as with u = −4. Which keying gives u² = 16?
      **Hint:** "Put brackets round −4. Without them the calculator squares 4, then makes it
      negative."
    - **Mistake:** using the take-away key for a negative. Calculators have "two different minus
      sign keys" [72].
      **Puzzle:** tap the key that makes −3.
      **Hint:** "(−) makes a number negative. − takes away."
    - **SHOW: tools disagree.** "Maths and your Casio say −3² is −9. Excel says 9. Brackets
      always settle it." [58][73]
- **Size and cost.** 9 lessons of about 12 screens, so about 108 screens. There are two ways to
  build (question 5):
  - **Lean,** your standard since Fractions: one writer who drafts, critiques and rewrites, one
    fresh fact-checker, one builder. Fractions' eight lessons took about 2.2M tokens, about 275k a
    lesson (docs/NEXT.md). Here that's about 2.5M.
  - **Full:** lean plus a teaching review, a motion review, fixes and an independent confirm.
    Measured on Fractions lessons 4 to 8 (built on the night of 10 Oct): about 8.3M tokens for the
    five, about 1.65M a lesson, so about 15M here. It is what caught the errors: every lesson had
    corrections from its fact-check, and the reviewers found 5 to 14 things to fix per lesson.
    The motion review and the confirm aren't in the RUNBOOK yet.

  Either way, I'll measure the pilot's tokens and re-estimate before the overnight build.
- **Pilot first.** Lesson 1, Below zero, is built and put live for you to try on your phone. With
  it comes one test screen of the facing marker on 3 − (−2). The new risks are that marker and a
  tall upright line, with sentences and a Check button, fitting on a 360 × 640 screen. The pilot
  passes only if no screen scrolls at 360 px wide. Before lesson 1 is written I'll fetch the
  reefer bulletin's exact words for its opening line. Lessons 2 to 9 follow overnight once you're
  happy.

## Sources
Quotes are word for word. (excerpt) means the page was read through a search excerpt because the site blocks direct fetching here. (search summary) means the words came from a search tool's summary, not the page, and are checked against the page before a lesson uses them.

1. Maths National Curriculum Coverage (Y5/Y6 statements), Balderstone School. https://www.balderstoneschool.co.uk/attachments/download.asp?file=78&type=pdf. Year 5: "count forwards and backwards with positive and negative whole numbers, including through zero"; Year 6: "use negative numbers in context, and calculate intervals across zero".
2. Mathematics programmes of study: key stage 3, DfE. https://assets.publishing.service.gov.uk/media/5a7c1408e5274a1f5cc75a68/SECONDARY_national_curriculum_-_Mathematics.pdf. "use the four operations ... applied to integers, decimals, proper and improper fractions, and mixed numbers, all both positive and negative".
3. Mathematics Written Examination Syllabus (Second Engineer), MCA. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus. 2.1.2 "Adds algebraic quantities, both positive and negative."; 2.1.4 "States the effect of plus or minus signs in front of a bracketed quantity or quantities."; 2.1.5 "States the effect of the plus or minus signs in the multiplication and division of quantities."
4. Talking Point: introducing negative numbers, Cambridge Mathematics Espresso 15. https://www.cambridgemaths.org/Images/espresso_15_introducing_negative_numbers.pdf. "no one is totally representative on its own and all have limitations"; "students must be able to interpret the minus sign in at least three ways".
5. Adding and Subtracting Positive and Negative Numbers, NRICH. https://nrich.maths.org/articles/adding-and-subtracting-positive-and-negative-numbers. "We would advise choosing one (or at most two) models at first"; "a rote-learned phrase that is often misapplied ... \"minus four minus two equals six, because two minuses make a plus!\"".
6. Nurnberger-Haag (2015), Walk a Path or Collect Chips, PME-NA. https://files.eric.ed.gov/fulltext/ED584208.pdf. "scored 11 points higher on this 100-point test than students using chips ... and 13 points higher in the longer-term"; chips struggled where "-4 × - 3 and - 2 - - 5 require students to put in enough chips to represent zero". The learners were children.
7. Stephan & Akyuz (2012), integer addition and subtraction, JRME (ERIC record). https://eric.ed.gov/?id=EJ977683. "an empty, vertical number line (VNL) is posited as a potentially viable model".
8. KS3 Maths: How to add and subtract positive and negative numbers, BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zrjsn9q. "A thermometer is a number line that depicts temperature and often uses a vertical number line".
9. Walking the number line, Instructional Science (2025). https://link.springer.com/article/10.1007/s11251-025-09707-w. Students "orient their body towards the positive side of the NL for addition or the negative side of the NL for subtraction; (c) walk forwards if the second number ... is positive".
10. Multiplying Negatives, Resourceaholic. https://www.resourceaholic.com/2016/08/multiplying-negatives.html. "Draw a standard multiplication table and extend it backwards to include negative numbers."
11. How to multiply and divide positive and negative numbers, BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/z8x44xs. "Follow the pattern to see the effect of multiplying by negative numbers."
12. Why is negative times negative = positive?, Mathematics Stack Exchange. https://math.stackexchange.com/questions/9933/why-is-negative-times-negative-positive. "Rotation of the number line by 180° is the equivalent of multiplying by -1. Now do the rotation twice. The number line is unchanged."
13. Complex Numbers and Phasors, Electronics Tutorials. https://www.electronics-tutorials.ws/accircuits/complex-numbers.html. "multiplying an imaginary number by j² will rotate the vector by 180° anticlockwise".
14. Why a negative times a negative is a positive (video), Khan Academy. https://www.khanacademy.org/math/cc-seventh-grade-math/cc-7th-negative-numbers-multiply-and-divide/x6b17ba59%3Amultiply-with-negatives/v/why-a-negative-times-a-negative-is-a-positive. Transcript fragment: "you add three to negative three you're going to get zero, so this is going to be equal to five times zero" (only partly seen).
15. Multiply and Divide Integers, OpenStax Prealgebra 2e 3.4. https://openstax.org/books/prealgebra-2e/pages/3-4-multiply-and-divide-integers. "Division is the inverse operation of multiplication."; "you can always check the answer to a division problem by multiplying."
16. Negative numbers, 6th grade, Khan Academy. https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-negative-number-topic. "Negative does not mean \"bad.\""
17. Negative Numbers: Obstacles in their Evolution from Intuitive to Intellectual Constructs, For the Learning of Mathematics (author not confirmed). https://flm-journal.org/Articles/1D990791426D7502008745BD5F027.pdf. "How can this person gain 5 000 000, that is, five million, by multiplying a debt of 10 000 francs by 500 francs?"
18. Why is negative times negative positive?, G'Day Math (James Tanton). https://gdaymath.com/lessons/powerarea/1-5-why-is-negative-times-negative-positive. "taking away five degrees of cold ... might work for some to explain why -(-5) should equal 5, but it is not explaining ... why negative times negative is dubbed positive."
19. Subtraction of positive and negative integers, Y7, Oak National Academy. https://www.thenational.academy/teachers/programmes/maths-secondary-ks3/units/arithmetic-procedures-with-integers-and-decimals/lessons/subtraction-of-positive-and-negative-integers. "Common misconception: Minus and a minus make a plus ... The use of additive inverses should avoid this common misconception."
20. Lamb et al., Integers 7th grade (working paper, Project Z, San Diego State University). https://sci.sdsu.edu/crmse/projectz/documents/integers-7th-grade.pdf. Groups earlier studies by age: "college students (Bofferding & Richardson, 2013; Chiu, 2001)"; those students did well, and "many tended to use rules or order-based reasoning" (search summary).
21. Bofferding & Richardson (2013), Integer Addition and Subtraction: A Task Analysis. https://files.eric.ed.gov/fulltext/ED584472.pdf. The learners were college students [20]. They used the number line for positives: "However, they did not use it to add or subtract negative numbers".
22. Practice Negative Numbers, Brilliant. https://brilliant.org/courses/negative-numbers. "44 Lessons", 569 exercises; promises "how the rules of addition, subtraction, multiplication, and division extend to integers". Lesson titles seen include "Positives and Negatives", "Zero", "Opposites", "Making Integers", "Subtracting Negatives", "Adding The Opposite" and "Longer Expressions", with sections on absolute value and distance. No title seen names multiplying or dividing. Level names not confirmed (excerpt and search summaries).
23. Common Core math coverage, Brilliant. https://brilliant.org/help/standards-alignment/common-core-math-coverage. An earlier excerpt read "7.NS.2.a | Understand multiplication of signed numbers | Exponents and Radicals ... Linear Equations". Not confirmed on a second check.
24. 7th grade maths, Khan Academy. https://www.khanacademy.org/math/cc-seventh-grade-math. Unit 5 runs "Multiplying negative numbers, Dividing negative numbers ... Exponents with integer bases ... Order of operations with negative numbers".
25. Arithmetic procedures with integers and decimals, Y7, Oak National Academy. https://www.thenational.academy/teachers/programmes/maths-secondary-ks3/units/arithmetic-procedures-with-integers-and-decimals/lessons. Lessons on adding, subtracting, then multiplying and dividing with one and with two or more negatives, then "priority of operations, including brackets, powers and exponents with positive and negative integers and decimals".
26. How to Measure DC Voltage with a Digital Multimeter, Fluke. https://www.fluke.com/en-ph/learn/blog/digital-multimeters/how-to-measure-dc-voltage-with-a-digital-multimeter. "if the probes touch opposite terminals, a negative symbol will appear in the display."
27. BS5308 Part 1 Type 1 cable datasheet, Anixter. https://objects.eanixter.com/PD379230-AN.PDF. "operate satisfactorily at temperatures between -40°C and +65°C providing that at temperatures below 0°C they are not subject to movement or impact."
28. General Engineering Science I Syllabus, MCA. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/general-engineering-science-i-written-examination-syllabuses. 1.2.1 "Solve problems related to addition, subtraction and product of positive and negative numbers."
29. Marine Electro-Technology Syllabus (Second Engineer), MCA. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus. "Defines temperature coefficient of resistance at 0°C (αο) and also at a stated temperature (αt)"; "Calculates change in conductor resistance using the temperature coefficients"; "indicates peak value; peak to peak value".
30. HNC/HND Marine Engineering, SQA. https://www.sqa.org.uk/sqa/79333.html. "The HND will give exemptions for the STCW Management Level Engineer in the following subjects: Mathematics; Applied Mechanics; Applied Heat; Engineering Drawing; Electro-Technology; and Naval Architecture."
31. SQA Advanced Certificate/Diploma Marine Engineering, SQA. https://www.sqa.org.uk/sqa/81770.html. "will not be recognised as part of their certificate of competency (CoC) from 31 August 2025"; "must complete these qualifications by 31 August 2030." A search summary adds "You should not make any new entries for these qualifications after that date if they are required to be part of MCA CoC recognition."
32. Seafarer cadets ... new maritime syllabus, GOV.UK (MCA). https://www.gov.uk/government/news/seafarer-cadets-become-first-in-uk-to-follow-new-futureproofed-maritime-syllabus. "Lessons began in September this year using the updated syllabus."
33. Engineer cadet HND, Solent University. https://maritime.solent.ac.uk/courses/engineering-and-electro-technical/engineer-cadet-hnd. Aligned to the new UK cadetship syllabus "effective from September 2025" (search summary).
34. 09 Marine Engineering – Engineering Mathematics 2 (consultation outcome), MCA. https://www.gov.uk/government/consultations/cadet-training-modernisation-programmesyllabus-review-sixth-group-of-consultation-templates/09-marine-engineering-engineering-mathematics-2. A draft maths template for the new syllabus, updated 12 July 2023; its first outcome is trigonometric and hyperbolic functions (search summary; not yet read).
35. The Carriage of Reefer Containers, West of England P&I Club. https://www.westpandi.com/news-and-resources/loss-prevention-bulletins/the-carriage-of-reefer-containers. "normally carried at or below -18°C (0°F)". Search summaries say claims have come from confusion "between positive (+) and negative (-) temperatures", and that a reefer is meant to hold cargo at the temperature it was loaded at, not to cool warm cargo. An earlier read gave "The cargo temperature at the time of loading was around -5°C. The exterior of the cargo reached the set point of -18°C"; a later search could not find it. To be fetched word for word before lessons 1 and 5 are written.
36. Refrigeration system working, Mucky Mariners (MEO Class 4 notes). https://muckymariners.com/app/meo-class-4-subjects/function-4b-meol/auxiliary-machines/15-refrigeration/refrigeration-6-12-system-working. "The vegetable room is maintained at a temperature of +4°c to +6° c while fish room and meat room is at a temperature of -18°c to -20°c."
37. Compound Pressure Gauge, Cross Company. https://www.crossco.com/resources/glossary/metrology-glossary-compound-pressure-gauge. "uses a dial to exhibit both positive and negative (vacuum) pressures."
38. Loading Manual / Trim and Stability Booklet (FSO), Horizon Offshore Services. https://horizonoffshoreservices.com/wp-content/uploads/2024/10/FSO_MANUAL-REV.1.pdf. "All longitudinal distances are measured from amidships with +ve forward amidships -ve aft amidships".
39. Ship Trim, Draft Change & Longitudinal Balance Calculator, ShipUniverse. https://www.shipuniverse.com/?p=17984. "x from midships, positive aft" (search summary).
40. RMS vs Peak, Risentric. https://risentric.com/rms-vs-peak. "a 230 V AC supply reaches about 325 V peak".
41. Reefer container temperature range, Maersk. https://www.maersk.com/support/faqs/reefer-container-temperature-range. "20' Standard Reefer: -30C to +30C".
42. Gauge Pressure, Absolute Pressure, OpenStax College Physics 2e 11.6. https://openstax.org/books/college-physics-2e/pages/11-6-gauge-pressure-absolute-pressure-and-pressure-measurement. "Gauge pressure is positive for pressures above atmospheric pressure, and negative for pressures below it."
43. Vacuum Pressure Gauge Selection, Manogauge. https://www.manogauge.com/insights/vacuum-pressure-gauge-selection. "A vacuum gauge reading −0.8 bar is therefore at roughly 213 mbar absolute".
44. Kirchhoff's Rules, MSU Open Books. https://openbooks.lib.msu.edu/collegephysics2/chapter/kirchhoffs-rules-2. "the calculated current will simply be negative, indicating that the actual current flows opposite to the assumed direction"; "The negative value of I 2 does not indicate a mistake."
45. Moments Cheat Sheet, Physics & Maths Tutor. https://pmt.physicsandmathstutor.com/download/Maths/A-level/Mechanics/Moments-2/Cheat-Sheets/Moments.pdf. "You must pick one direction to be positive and the other to be negative".
46. Velocity and acceleration, BBC Bitesize (AQA GCSE). https://www.bbc.co.uk/bitesize/guides/zwc7pbk/revision/2. "change in velocity = final velocity - initial velocity"; "If an object is slowing down, it is decelerating (and its acceleration has a negative value)."
47. Naval Architecture Syllabus (Second Engineer), MCA. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/naval-architecture-written-examination-syllabus. 3.2.11 "Explains that if a ship is initially unstable the metacentric height is regarded as negative."
48. First Law of Thermodynamics, OpenStax University Physics 2, 3.3. https://openstax.org/books/university-physics-volume-2/pages/3-3-first-law-of-thermodynamics. "Q is positive when it is added to the system and negative when it is removed"; "W is positive when work is done by the system and negative when work is done on the system."
49. Work (thermodynamics), Wikipedia. https://en.wikipedia.org/wiki/Work_(thermodynamics). "An alternate sign convention is to consider the work performed on the system by its surroundings as positive." (excerpt)
50. PV Modules Part 2: Calculations, IAEI Magazine. https://iaeimagazine.org/columns/photovoltaic/pv-modules-part-2-calculations-this-wont-hurt-much. "-65 x (-0.245) = 15.9% change in the Voc module voltage as the temperature drops from 25°C to -40°C".
51. Applied Mechanics Syllabus (Second Engineer), MCA. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus. 3.1.6 "Derives the equations: ν = u + at, s = ut + 1/2(at ² ), v ² = u ² + 2as".
52. EN455 Chapter 2, Intact Statical Stability, US Naval Academy. https://www.usna.edu/NAOE/_files/documents/Courses/EN455/EN455_Chapter2.pdf. "GMeff = GM — FSC = KM — KG — FSC."
53. Resistance: Temperature Coefficient, HyperPhysics. https://hyperphysics.gsu.edu/hbase/electric/restmp.html. "Resistance = R(initial)[1+ alpha (T(final) - T(initial)]", with its calculator set up for copper at 20 C (search summary).
54. Resistivity and Temperature Coefficient at 20 C, HyperPhysics. https://hyperphysics.gsu.edu/hbase/Tables/rstiv.html. "Copper, annealed | 1.72 | x10-8 | .00393" (search summary): copper's coefficient at 20 °C.
55. SI Units: Temperature, NIST. https://www.nist.gov/pml/owm/si-units-temperature. Celsius to kelvin: "°C + 273.15".
56. LNG Operations risk alert RA120, Steamship Mutual. https://www.steamshipmutual.com/sites/default/files/medialibrary/files/RA120%20-%20LNG%20Operations_2.pdf. "LNG is natural gas cooled to approximately -162°C".
57. Applied Heat Syllabus (Second Engineer), MCA. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/applied-heat-written-examination-syllabus. 1.2.3 "Differentiates between Celsius and Kelvin Scales."
58. CASIO fx-991EX User's Guide (UK), hosted copy. https://m.media-amazon.com/images/I/B1TdnL2rjZL.pdf. "When squaring a negative value (such as -2), the value being squared must be enclosed in parentheses".
59. Whitacre et al. (2017), Integer comparisons across the grades, J. Mathematical Behavior. https://repository.lib.fsu.edu/islandora/object/fsu:588646/datastream/PDF/view. "The comparison of two negative numbers that were close in magnitude (−5 cf. −6) was more difficult".
60. Directed Numbers, WJEC. https://resource.download.wjec.co.uk/vtc/2022-23/ko22-23_1-1/pdf/_eng/directed-numbers_foundation-and-intermediate.pdf. "For negative numbers, a bigger value after the '−' means that the number is smaller. For example, −10 is lower than −5."
61. Bofferding & Farmer (2019), Most and Least, IJSME. https://link.springer.com/article/10.1007/s10763-018-9880-4. "students often chose the least of the cold as opposed to the least cold".
62. Marine Refrigeration, ASHRAE Handbook ch. 26. https://handbook.ashrae.org/Handbooks/R26/SI/R26_Ch26/R26_Ch26_si.aspx. Freezer rooms "Meats/poultry | –29", "Ice cream cabinet | –12" (°C).
63. Calculate intervals, Y5, Oak National Academy. https://www.thenational.academy/teachers/programmes/maths-primary-ks2/units/negative-numbers/lessons/use-knowledge-of-positive-and-negative-numbers-to-calculate-intervals. "Pupils sometimes answer a question like 'What is the difference between −5℃ and 3℃?' with '−8℃'. Remind pupils that these differences are always positive".
64. The Catchy Nonsense of "Two Negatives Make a Positive", Math with Bad Drawings. https://mathwithbaddrawings.com/2016/12/14/the-catchy-nonsense-of-two-negatives-make-a-positive. "-10 + -30 does NOT equal +40 (although I have seen students claim that it does".
65. Khalid & Embong, Errors and Misconceptions in Operations of Integers, IEJME. https://files.eric.ed.gov/fulltext/EJ1235423.pdf. "those who answer 6 + (–2) = – 8 argue that 2 added to 6 is 8, yet there is a minus sign"; "Q32: -8/-4 = -2 ... 8/4 =2, so it changes to -2 because there is negative".
66. What Is Adding and Subtracting Integers?, Think Academy. https://www.thethinkacademy.com/blog/edubriefs-math-what-is-adding-and-subtracting-integers. "Dropping the negative sign: In -6 + 2 , the result is -4 , not 4."; "Thinking subtraction is always 'make smaller'".
67. Can AI Chatbots anticipate student misconceptions?, Craig Barton. https://tipsforteachers.co.uk/can-ai-chatbots-anticipate-student-misconceptions. "-7 – 3 becomes 7 + 3"; "3 – (-2) = 1"; "Skip 0 when counting, so 2 – 5 = -4"; "3 – 5 becomes 5 – 3 = 2."
68. Makonye & Fakude (2016), Errors in Addition and Subtraction of Directed Numbers, SAGE Open. https://journals.sagepub.com/doi/10.1177/2158244016671375. "(d) 0 − (−5) = −5✘ (e) −7 − (+3) = 4✘".
69. Multiplying Negatives Makes A Positive, Maths is Fun. https://www.mathsisfun.com/multiplying-negatives.html. "Result: (−2) × (−3) × (−4) = −24".
70. Cangelosi et al. (2013), The negative sign and exponential expressions, J. Mathematical Behavior (preprint). http://mathedseminar.pbworks.com/w/file/fetch/45027027/Exponents_2011_0901.pdf. "we categorize errors where students inappropriately include the negative sign as part of base as the sticky sign".
71. When BIDMAS goes bad, Flying Colours Maths. https://blog.flyingcoloursmaths.co.uk/bidmas-goes-bad/. "BIDMAS suggests something that simply isn't true (that division is before multiplication and addition before subtraction)" (search summary).
72. Using a scientific calculator, OpenLearn (Open University). https://www.open.edu/openlearn/mod/oucontent/view.php?id=4256&printable=1. "there are two different minus sign keys on the calculator".
73. Calculation operators and precedence, Microsoft Support. https://support.microsoft.com/en-us/excel/calculation-operators-and-precedence. The precedence table puts "Negation (as in –1)" above "^ Exponentiation", so Excel works out =-3^2 as 9 (search summary).
