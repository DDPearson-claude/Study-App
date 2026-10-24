# How adults and qualified tradespeople learn and keep technical skills

Research note for choosing a new learning style for Dan's next course. Written 24 Oct 2026.
Analysis only: nothing in the app was changed.

How to read the strength ratings:
- **Strong**: several meta-analyses agree, including classroom or workplace studies.
- **Moderate**: one good meta-analysis, or consistent experiments that are mostly lab or student based.
- **Emerging**: a handful of careful experiments, a plausible mechanism, no settled synthesis.
- **Weak**: mostly opinion, satisfaction surveys, or old grey literature.

Effect sizes (Cohen's d, Hedges' g) are rough guides: about 0.2 is small, 0.5 medium, 0.8 large.
Most of the evidence comes from students and lab tasks. Evidence on qualified tradespeople
refreshing what they once knew is thin, and the note says so where it matters.

---

## 1. Bottom line for Dan's app

1. **Dan is a re-learner and part-expert, so the biggest lever is to stop teaching what he already knows.**
   The expertise-reversal effect is the finding most specific to him: explanations, worked examples and
   integrated text that help novices can *hurt* people who already hold the knowledge. A quick
   diagnostic that lets him skip known material has evidence behind it (section 4).
2. **Retrieval, spaced and repeated until correct, is the best-supported way to make it stick.** The app
   already does spaced review. "Successive relearning" (recall to a criterion, then again in later
   sessions) is the strongest version and matches how Dan re-learns his Level 4 material (section 2).
3. **Asking before telling works**: predictions, pretest questions and confidence ratings. Errors he
   was confident about are the ones most likely to be corrected (section 5).
4. **For fault-finding, teach a strategy plus a layered model of the system, then practise on medium-fidelity
   simulated faults.** The naval and Air Force evidence is the closest match to Dan's world (section 6).
5. **Less text, placed on the diagram, with nothing he already knows.** This supports the 21 Oct
   feedback and goes further: for an expert, the redundant explanation is the problem (section 9).
6. **Reference material used at the point of work is a different product from a lesson.** Job aids
   work well and cut training time, but the evidence says they work best *combined with* training,
   and complex fault-finding still needs understanding, not just a procedure (section 11).
7. **Things not to build on**: learning styles matched to the person (no evidence), "andragogy" as a
   design rule (weak evidence), and "microlearning" as a cause of learning in its own right (the
   evidence is weak; its benefit comes from the spacing and retrieval it contains).

---

## 2. Retrieval practice, spacing and successive relearning

**Finding.** Testing yourself beats re-reading. Spreading study over days beats cramming. The two
combine well.

- Dunlosky and colleagues rated ten study techniques. Only practice testing and distributed practice
  got "high utility". Elaborative interrogation, self-explanation and interleaving got "moderate".
  Re-reading, highlighting and summarising got "low".
  https://pubmed.ncbi.nlm.nih.gov/26173288 ;
  https://journals.sagepub.com/doi/abs/10.1177/1529100612453266
- The meta-analysis of testing versus restudy found recall tests give bigger benefits than recognition
  tests (multiple choice). https://psycnet.apa.org/record/2014-34845-001
- Practice testing meta-analysis (Adesope et al. 2017): benefits hold across many conditions, moderated by
  test format and setting. https://journals.sagepub.com/doi/10.3102/0034654316689306
- **Transfer is smaller than retention.** Pan and Rickard (2018), 192 effect sizes: testing yields
  transferable learning, d = 0.40. Transfer is more likely with elaborated feedback and good initial
  test performance. https://pubmed.ncbi.nlm.nih.gov/29733621/
- A 2025 study on complex concepts notes retention benefits are medium to large, transfer small to
  medium. It also warns that when retrieval mostly fails, learners engage less with the right answer.
  Complex material needs repeated retrieval with useful feedback.
  https://www.sciencedirect.com/science/article/pii/S0959475225001434
- **Spacing.** Cepeda et al. (2006) meta-analysis: spreading practice across days greatly improves
  retention. https://augmentingcognition.com/assets/Cepeda2006.pdf . Their 2008 study of 1,350+
  people found the best gap depends on how long you need to remember: about 20–40% of the delay for a
  1-week test, falling to about 5–10% for a 1-year test. https://pubmed.ncbi.nlm.nih.gov/19076480
- **Successive relearning.** Practise recall until correct, then relearn to one correct recall in later
  spaced sessions. Rawson and Dunlosky (2011, 533 students) recommend 3 correct recalls at first, then
  relearning in later sessions. Relearning gave large gains in long-term retention for little extra
  practice. https://pubmed.ncbi.nlm.nih.gov/21707204 . Later work found successive relearning beat
  single-session learning by d = 1.52 to 4.19. Relearning also "overrides" weak initial learning.
  https://psycnet.apa.org/record/2018-05792-001 ; review: https://journals.sagepub.com/doi/10.1177/09637214221100484 ;
  course-exam evidence: https://eric.ed.gov/?id=EJ1036741

**Strength.** Strong for retention of facts and concepts. Moderate for transfer to new problems.

**Contested or limited.** Cepeda, Pashler and colleagues say they found no studies supporting the
claim that spacing improves *concept* learning. Their own studies failed to support it.
https://home.cs.colorado.edu/~mozer/Research/Selected%20Publications/reprints/Cepedaetal2009.pdf .
Most evidence uses word lists, definitions and student exams, not technical procedures.

**For Dan.** His "I'll never forget that now" about the digitised Level 4 course fits the relearning
evidence. The cheapest strong upgrade is to make spaced review *successive relearning*: each due item
is recalled (typed or chosen), checked, and repeated in-session until right, with feedback that
explains *why*. Use recall more than multiple choice. Feedback should be elaborated, because that is
what helps transfer.

---

## 3. Interleaving

**Finding.** Mixing problem types in practice beats doing them in blocks, *when the types are easy to
confuse*.

- Brunmair and Richter (2019), 59 studies: overall g = 0.42. Paintings and visual material g = 0.67,
  maths g = 0.34. For word lists, blocking was *better* (g = −0.39). Effects are strongest when
  categories look alike but differ in what matters. https://pubmed.ncbi.nlm.nih.gov/31556629
- Rohrer et al. (2014), grade 7 classroom over 9 weeks: interleaved 72% vs blocked 38% on a delayed
  test (d = 1.05), even with dissimilar problem types. https://pubmed.ncbi.nlm.nih.gov/24578089
- A 2021 systematic review found the benefit for interleaving individual items. Interleaving *longer
  blocks* of several minutes per topic was not supported.
  https://bera-journals.onlinelibrary.wiley.com/doi/10.1002/rev3.3265
- Benefits may not extend to more complex problems.
  https://www.sciencedirect.com/science/article/abs/pii/S0959475222000044

**Strength.** Moderate. **Contested**: maths results vary strongly between studies, and practice
feels harder and scores lower while learning.
https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.02296/full

**For Dan.** Use it where the job is *choosing*: which motor fault, which test, which protective device,
which formula. Mixed review across courses already does this. Don't interleave long lesson sections.

---

## 4. Worked examples, fading and the expertise-reversal effect

**Finding.** Novices learn best from worked examples. As knowledge grows, steps should be removed
(fading), and eventually examples become a hindrance.

- Kalyuga, Ayres, Chandler and Sweller (2003) named the expertise-reversal effect: techniques highly
  effective with inexperienced learners can lose effect or harm more experienced learners.
  https://www.tandfonline.com/doi/abs/10.1207/s15326985EP3801_4
- Kalyuga's 2007 review lists the evidence. Several studies are close to Dan's trade:
  https://www.uky.edu/~gmswan3/EDC608/Kalyuga2007_Article_ExpertiseReversalEffectAndItsI.pdf
  - Narrated explanations with diagrams in mechanical engineering helped novices but became redundant
    and reduced learning as learners gained knowledge.
  - The advantage of worked examples for programmable logic controllers disappeared as trainees
    gained experience.
  - Knowledgeable learners did better with fast transition to problem solving. Low-knowledge learners
    needed slow transition. (Reisslein's studies were on electrical circuit analysis.)
  - Experts benefited from *imagining* procedures rather than studying them; novices the reverse.
  - A rapid "first-step" test (show a task, ask for the first step) predicted expertise well
    (correlations .71 and .75) and cut testing time by a factor of about 3. Instruction adapted with
    it gave better gains than fixed instruction (effect size 0.46).
- Backward fading (removing the *last* steps first) works better than forward fading.
  https://www.tandfonline.com/doi/abs/10.1080/00220970209599510
- Fading plus self-explanation prompts gave medium to large effects on near *and* far transfer, with no
  extra time. https://psycnet.apa.org/record/2003-09576-009?doi=1
- Workplace adults: in financial-services training, fading beat example–problem pairs and pure problem
  solving, and the advantage grew on delayed tests.
  https://www.tandfonline.com/doi/abs/10.1080/01443410802322069
- Adaptive fading (by the learner's progress) beat fixed fading in a tutor.
  https://link.springer.com/article/10.1007/s11251-009-9107-8
- Sweller's 20-year review links the guidance-fading and expertise-reversal effects.
  https://link.springer.com/article/10.1007/s10648-019-09465-5

**Strength.** Worked examples for novices: strong. Fading: moderate. Expertise reversal: moderate; the
review reports large effects but from many small studies.

**Contested.** An experiment that induced expertise found the reversal for transfer but not for
retention. https://link.springer.com/article/10.1007/s11251-012-9237-2 . Most studies are short lab
sessions. None looked at someone refreshing knowledge after a gap, which is Dan's case: he may be
"expert" in some parts and "rusty novice" in others.

**For Dan.** This is the case for a *diagnose first* style. Each idea opens with a quick check (a
first-step or confidence-rated question). If he gets it, he gets a harder case or the short
version. If he misses it, he gets the full worked explanation. Use backward-faded examples rather
than full ones, and "picture yourself doing this test" prompts for procedures he once did often.

---

## 5. Predicting, pretesting and productive failure

**Prediction and pretesting.**
- Generating a prediction before seeing an outcome improved learning. Outcomes that refuted the prediction
  caused a measurable surprise reaction, and the size of the surprise predicted learning.
  https://www.sciencedirect.com/science/article/pii/S0959475217303468
- Predictions raise curiosity, and curiosity predicts memory.
  https://pmc.ncbi.nlm.nih.gov/articles/PMC6803639
- Explicit predictions help most for information that violates expectations.
  https://pmc.ncbi.nlm.nih.gov/articles/PMC9722848
- Brod's 2021 review calls the evidence "initial". The benefit seems to come from surprise and
  attention to the feedback, not just from retrieval. https://pubmed.ncbi.nlm.nih.gov/33768503
- Prequestion meta-analysis (2023, preregistered): answering questions before study gives g = 0.54
  for the questioned material, but almost nothing (g = 0.04) for material not asked about.
  https://link.springer.com/article/10.3758/s13423-023-02353-8 ; review:
  https://link.springer.com/article/10.1007/s10648-023-09814-5
- **Hypercorrection**: errors made with high confidence are *more* likely to be corrected after feedback.
  https://www.ovid.com/journals/jeplm/fulltext/00004786-200111000-00014~errors-committed-with-high-confidence-are-hypercorrected .
  Familiarity with the domain seems to drive it, which suits an experienced learner.
  https://www.columbia.edu/cu/psychology/metcalfe/PDFs/MetcalfeFinn2011.pdf

**Productive failure (problem first, then teaching).**
- Sinha and Kapur (2021), 53 studies: problem-solving first gives g = 0.36 for conceptual knowledge and
  transfer, up to 0.58 when done faithfully. For procedural knowledge it made no difference (g = −0.03).
  https://journals.sagepub.com/doi/full/10.3102/00346543211019105
- **Contested.** Ashman, Kalyuga and Sweller (2020) found instruction-first better when material is
  highly complex. https://link.springer.com/article/10.1007/s10648-019-09500-5 .
  The debate is described as "passionate". Whether it depends on prior knowledge is still being tested.
  https://link.springer.com/article/10.1007/s10648-025-09993-3
- Studying *someone else's* failed attempt ("vicarious failure") gave the same conceptual gains as
  failing yourself. https://onlinelibrary.wiley.com/doi/10.1002/acp.4004

**Strength.** Prequestions: moderate. Prediction: emerging. Hypercorrection: moderate (lab).
Productive failure: moderate for concepts, contested, no help for procedures.

**For Dan.** "Predict, then see" already fits. Add a **confidence rating** to predictions. A
confident miss is a teachable moment, and the evidence says it sticks. Keep productive failure for
*why* questions (why a motor runs hot on a weak supply), not for procedures (test sequences), where
telling first is at least as good. "Here's how an apprentice got this wrong, spot the error" is a
cheap form of it.

---

## 6. Fault-finding training: cognitive apprenticeship, structured troubleshooting, simulation

This is the closest evidence to Dan's work.

- **Cognitive apprenticeship** (Collins, Brown and Newman 1989): modelling, coaching, scaffolding,
  then articulation and reflection, then exploration. The aim is to make an expert's hidden thinking
  visible. https://www.isls.org/research-topics/cognitive-apprenticeship ;
  https://www.aft.org/ae/winter1991/collins_brown_holum
- **Sherlock** (US Air Force, F-15 avionics test station fault-finding) was built on this model:
  coached practice on realistic faults.
  https://sites.cc.gatech.edu/aimosaic/OLD/education/courses/cs8113R/presentations/sherlock-app.html .
  In the field test, about 20 hours of coached practice brought airmen (average 28 months'
  experience) close to highly experienced technicians (about 114 months). The gains held six months later.
  The control group continued normal on-the-job training. https://ntrs.nasa.gov/citations/19900016252 .
  Caution: these numbers were read from a search summary of the report, not the full text. The
  popular claim that "25 hours equals four years on the job" was **not** confirmed.
- A later Air Force project on accelerating troubleshooting skill found untutored airmen swapped parts
  without testing far more than tutored ones. https://files.eric.ed.gov/fulltext/ED382817.pdf
- **Structured troubleshooting** (Schaafstal, Schraagen and van Berlo 2000). A cognitive task analysis
  led to training that combines a general troubleshooting strategy with a layered functional
  breakdown of the system. Trained technicians solved **twice as many faults, in less time**, and
  the method took less time to teach. https://pubmed.ncbi.nlm.nih.gov/10917147 . The companion study
  on naval maintenance technicians found that novices struggled to reach the right system knowledge
  at each stage and to keep track of where they were. Coaching on strategy alone did not help without
  basic skills. https://research.utwente.nl/en/publications/training-of-systematic-diagnosis-a-case-study-in-electronics-trou/
- Jonassen and Hung (2006) proposed a troubleshooting design with three parts: a layered conceptual
  model of the system, a simulator where the learner states, tests and interprets a hypothesis for
  every action, and a case library of experienced troubleshooters' stories. They argue traditional
  methods fail to build transferable skill. This is a design proposal, not a tested result.
  https://eric.ed.gov/?id=EJ747007
- Functional flow diagrams during technical instruction helped learners build more accurate knowledge
  of how system parts work. https://files.eric.ed.gov/fulltext/ED389948.pdf
- **Simulation fidelity** meta-analysis for troubleshooting professionals (military, aviation, power
  plant): no fidelity level is always best. **Medium fidelity gave the highest overall transfer**,
  especially for less skilled trainees. Higher fidelity helped only trainees with high prior skill,
  and only for electronic systems. Low fidelity was worst.
  https://www.tandfonline.com/doi/abs/10.1080/24725838.2022.2099483 . An older study separated
  "looks like" from "acts like" fidelity. https://journals.sagepub.com/doi/10.1177/001872088602800501
- **Marine and naval simulators.** A Finnish review found formal evaluation of transfer from naval
  machinery simulators to be missing. https://jyx.jyu.fi/bitstreams/855679da-4d71-465e-8b4d-801d8799caa6/download .
  Engine-room simulator studies are mostly descriptive.
  https://www.transnav.eu/files/Maritime_Education_and_Training_A_SimulationBased_Approach_for_Enhancing_Ship_Electric_Load_Management_Competency_Through_Emergency_Scenario_Familiarizations_Quo_and_Outlook,1472.pdf .
  The US Navy's Aegis maintenance trainer found simulation alone was not enough and added hands-on
  part-task trainers. (This is a news piece, not research.)
  https://www.navy.mil/Press-Office/News-Stories/Article/3367830/the-navys-aegis-virtual-maintenance-trainer

**Strength.** Structured troubleshooting and Sherlock: moderate. They are strong, well-known results,
but each is essentially one programme. Fidelity meta-analysis: moderate. Marine-specific evidence: weak.

**For Dan.** A fault-finding lesson should (a) give the system as layers (whole system, then
subsystem, then component), (b) teach one explicit strategy (symptoms, likely causes, the cheapest
discriminating test, interpret, narrow down), and (c) let him work simulated faults where every test
costs something and he must say what he expects before seeing the reading. Medium fidelity (a
schematic that *behaves* correctly, not a photo-real panel) is what the evidence favours, and it
is also the cheaper thing to build.

---

## 7. Scenario-based and case-based learning

- Case-based learning evidence is mostly from health professions. Students report higher satisfaction
  than with lectures. Knowledge results are less consistent.
  https://pmc.ncbi.nlm.nih.gov/articles/PMC11940068
- 4C/ID (van Merriënboer's whole-task model: realistic tasks from simple to complex, with
  supportive information, step-by-step information and part-task practice). A meta-analysis found
  d = 0.79 on performance, stronger in higher and technical education. The meta-analysis is small, so
  treat the number with care. https://link.springer.com/article/10.1007/s10984-021-09373-y
- Caution: vivid but irrelevant story details in a case can reduce transfer (seductive details; one
  study tested this in case-based instruction).
  https://link.springer.com/article/10.1007/s10648-025-10099-z

**Strength.** Weak to moderate. The real support comes from the parts inside a good case: retrieval,
worked examples, whole-task practice.

**For Dan.** Cases should be short, realistic (a ship's system, a job he would meet) and stripped of
colour that doesn't help the decision. This fits his "I don't want it as a job card" and "reference
in the real world" comments: a case is a reason to recall and apply, not a story to read.

---

## 8. Elaboration and self-explanation

- Bisra et al. (2018), 64 studies and about 6,000 people: prompting learners to explain gives
  g = 0.55. https://eric.ed.gov/?id=EJ1186664
- Breakdown by prompt type: "conceptualise" prompts g = 0.87, "explain" 0.68, "justify" 0.42.
  Metacognitive prompts (0.19) and multiple-choice self-explanation (0.24) were not significant.
  Prompts while studying text gave 0.79; with worked examples 0.36.
  https://www.clearinghouse.edu.tum.de/wp-content/uploads/2023/09/KR_25_ENG_Table.pdf
- Dunlosky rated self-explanation and elaborative interrogation "moderate", partly because they take
  time. https://pubmed.ncbi.nlm.nih.gov/26173288
- Expertise reversal applies here too: extra "germane" activities can overload novices, while experts
  benefit from imagining procedures (Kalyuga 2007, above).

**Strength.** Moderate to strong.

**For Dan.** "Say it back" is supported. Make the prompt conceptual ("why does the loop impedance
limit the disconnection time?"), not "how confident are you?". Typed free answers checked by Claude
are closer to the effective forms than picking an explanation from a list.

---

## 9. Cognitive load: split attention, redundancy, coherence

- **Split attention.** Putting words on or next to the diagram, rather than separately, helps:
  g = 0.63 across 58 comparisons. https://link.springer.com/article/10.1007/s10648-018-9435-9
- **Redundancy.** Repeating the same words as on-screen text and narration impairs learning.
  Unnecessary information interferes too.
  https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2023.1148035/full
- **Coherence / seductive details.** Interesting but irrelevant material hurts retention (small to
  medium) and transfer (medium).
  https://www.sciencedirect.com/science/article/abs/pii/S1747938X12000413 ;
  https://www.jstor.org/stable/48728573
- A meta-meta-analysis of multimedia design found robust evidence for modality, coherence and related
  principles. https://journals.sagepub.com/doi/10.3102/00346543211052329
- **Caution.** A 2025 meta-analysis of Mayer's own research found an overall g = 0.37, with effect
  sizes declining year by year, and less consistent effects for animation, games and simulation.
  https://www.sciencedirect.com/science/article/pii/S1747938X25000673
- **The expertise twist** (Kalyuga 2007). For more knowledgeable learners, an integrated diagram plus
  text can become redundant. The effective format can flip to the diagram alone.

**Strength.** Split attention and coherence: strong. Redundancy: moderate. Effect sizes are probably
smaller than the early studies suggested.

**For Dan.** "A bit too much text after the diagrams" is the textbook split-attention and redundancy
complaint. The evidence supports: labels on the diagram, short captions next to the part they
describe, no text that repeats what the diagram shows, and, for topics he knows, the diagram
*alone* with explanation behind a tap.

---

## 10. Microlearning on phones

- Scoping reviews describe microlearning loosely defined and its effects underexplored.
  https://pubmed.ncbi.nlm.nih.gov/39882484/ ; https://eric.ed.gov/?id=EJ1337772
- In health professions, 94% of 17 studies measured learner reactions, 82% knowledge, 29% behaviour,
  and none measured results at work. https://pubmed.ncbi.nlm.nih.gov/31339105
- Mobile learning meta-analysis: g = 0.52 versus traditional methods (110 studies, 1993–2013).
  https://www.sciencedirect.com/science/article/pii/S0360131515300804 . But a review of the quality
  of mobile-learning experiments found widespread design weaknesses.
  https://www.sciencedirect.com/science/article/pii/S1747938X18300757

**Strength.** Weak as a cause in itself. Short, phone-sized sessions are a good *delivery* for spacing
and retrieval, which are strong.

**For Dan.** Keep sessions short because they fit his life and allow spacing, not because "micro"
teaches better. A 3–5 minute "due today" round of successive relearning is the evidence-backed
version.

---

## 11. Job aids, performance support and reference at the point of work

This is how Dan uses Design and verification and Motors: "a reference for myself in the real world",
"just gives me what I need to know on each motor".

- A US Navy review of job performance aid research (late 1970s) found two-way comparisons
  "almost always show that aiding enhances on-the-job performance".
  https://files.eric.ed.gov/fulltext/ED158006.pdf . Within it:
  - Electronics technicians using FORECAST aids matched conventionally trained technicians with
    training cut from 30 to 12 weeks. JOBTRAIN aids allowed a 50% cut in training time.
  - In one of the few direct comparisons, **combining training and aiding gave almost double the
    improvement of either alone**.
  - A wallet-size electrical measurement chart raised untrained technicians' conversion performance.
  - Finding information often takes about 20% of a maintenance technician's time.
  - Fully step-by-step aids did **not** cover complex electronic fault-finding (perhaps 25% of the
    workload). That still needed training and less rigid aids. Experienced troubleshooters may
    reject rigid procedures.
- A 1967 review found job aids had most impact on complex or lengthy tasks.
  https://eric.ed.gov/?id=ED015316
- Checklists: the WHO surgical checklist study cut deaths from 1.5% to 0.8% and complications from 11%
  to 7%. https://www.nejm.org/doi/full/10.1056/NEJMsa0810119 . But a systematic review in acute
  hospital settings found limited and inconsistent evidence, and implementation quality explains much
  of the effect. https://pubmed.ncbi.nlm.nih.gov/21884618 ; https://pubmed.ncbi.nlm.nih.gov/21398154

**Strength.** Job aids improve performance on the job: moderate, but the evidence is old and mostly
military grey literature. Training plus aid beats either alone: weak to moderate (few direct studies).

**For Dan.** Each course could end in a **purpose-built reference card**: tables, limits, test
sequences and decision trees, laid out for looking up on a job, separate from the lessons. The
lessons then teach the *why* and the judgement the card can't hold, which is what the review says
aids can't replace for complex fault-finding. Going from card back to the lesson ("why is this
limit here?") joins the two.

---

## 12. How fast does it fade, and what keeps it

- Procedural skill meta-analysis (Tatel and Ackerman 2025): almost no loss within a day, growing loss
  with months of non-use. In Arthur et al.'s 1998 data, cognitive tasks decayed more than physical ones
  (δ −1.15 vs −0.75). Real-world tasks decayed more slowly than lab tasks. Opportunities to perform in
  between showed a trend toward less decay (not significant).
  https://psycnet.apa.org/manuscript/2026-23054-001.pdf ; https://psycnet.apa.org/doi/10.1037/bul0000481
- A review of competence retention in safety-critical jobs (Dutch MoD funded): complex competences
  decline without practice, especially in novices. Key factors are the quality of first training,
  practice or refreshers, personal factors and task complexity. Objective data on the best refresher
  interval "are hardly available". Refreshers tend to keep licences current rather than keep people
  proficient. https://www.sciencedirect.com/science/article/abs/pii/S1747938X19304026
- Relearning is faster than first learning ("savings"), and sleep between sessions halved the practice
  needed in one study. https://pubmed.ncbi.nlm.nih.gov/27530500

**Strength.** Decay: strong. Best refresher interval for complex skills: unknown.

**For Dan.** Calculation and test-sequence knowledge (cognitive, procedural) is the part most at
risk between uses. That is where spaced relearning should focus, more than on concepts he uses daily.

---

## 13. Ideas to avoid building on

- **Matching teaching to a "learning style"** (visual, auditory): no adequate evidence. Studies with
  the right design contradict it. https://pubmed.ncbi.nlm.nih.gov/26162104 ;
  https://pmc.ncbi.nlm.nih.gov/articles/PMC11270031 . Dan's "quiz me / read through" choice is fine
  as a *preference*. It should not be sold as a learning-style match.
- **Andragogy** (Knowles' adult-learning assumptions): popular, but its supporters accept it lacks
  empirical support. https://onlinelibrary.wiley.com/doi/full/10.1002/ace.20546

---

## 14. Ingredients for a new learning style (for the planner to choose from)

Each is ranked by evidence and marked for build cost. "Cheap" means mostly text and small interactives;
"dear" means a new kind of interactive.

| Ingredient | Evidence | Cost | What it looks like |
|---|---|---|---|
| Diagnose first, skip what he knows (first-step or confidence check per idea) | Moderate (expertise reversal, adaptive fading) | Cheap | One question opens each idea; right and confident means the short version or a harder case |
| Successive relearning in review | Strong | Cheap | Due items recalled until right in-session, elaborated feedback |
| Predict with confidence rating | Moderate/emerging (prequestions, hypercorrection) | Cheap | "What will the meter read? How sure?" before the reveal |
| Backward-faded worked examples | Moderate | Cheap | First case fully worked, next missing the last step, then two steps |
| Conceptual self-explanation, typed | Moderate–strong | Cheap | "Why does…" checked by Claude |
| Imagine the procedure (for well-known tasks) | Moderate (lab) | Cheap | "Picture the test sequence; which step comes before…" |
| Diagram-first, words on the diagram, explanation on tap | Strong (split attention) plus expertise twist | Cheap | Fixes the 21 Oct complaint at its root |
| Structured fault-finding on medium-fidelity simulated faults | Moderate (naval and Air Force studies, fidelity meta-analysis) | Dear | Layered system view plus a "choose the next test, predict the reading" fault game |
| Spot the apprentice's mistake (vicarious failure) | Emerging | Cheap | A worked fault-find with one wrong step to find |
| Interleaved "which one is it?" practice | Moderate | Cheap | Mixed set where the skill is choosing the method |
| Purpose-built reference card per course | Moderate (dated) | Cheap–medium | Lookup tables and decision trees, linked back to lessons |

Two coherent styles fall out of this:

- **"Fault-finder's casebook"** for a fault-finding topic (marine electrical systems, motors, the subsea
  material): structured troubleshooting, layered system model, medium-fidelity fault simulations,
  predict-before-test, and an apprentice's mistake. It is the closest match to the naval evidence,
  but the simulation interactives are the expensive part.
- **"Test-out refresher"** for material Dan once knew (like Design and verification): every idea opens
  with a diagnostic, he gets only the gaps, faded examples replace full explanations, and the course
  ends in a reference card plus a successive-relearning set. It is the closest match to the
  expertise-reversal evidence and is likely *cheaper* per lesson, because less teaching text is
  written for ideas he already knows.

## 15. Gaps and honesty notes

- No study looks at an AI-built, per-person course or at a qualified electrician refreshing
  after a gap. Everything here is extrapolated.
- The troubleshooting evidence rests on a few programmes (Sherlock, structured troubleshooting) from
  the 1980s to 2000s. They are strong but not replicated at scale.
- Several numbers above come from abstracts and search extracts, not full papers. The Sherlock numbers
  in particular were read from a search summary and should be checked before being quoted to Dan as fact.
- Effect sizes from multimedia research seem to have declined over time, so treat the bigger
  numbers as upper bounds.
