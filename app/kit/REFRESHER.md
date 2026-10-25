## Refresher lessons: typed answers, written answers, the case file, the summary

A refresher course's steps lesson (a ready-made course built in Claude Code) has four more kit
pieces. The app passes the page two pieces of checked data, as it passes the theme: the course's
case file (`K.caseFile`) and the lesson's own `{written, summary}` (`K.lesson`). Name what you want
by id; the kit draws the checked words, so never retype a figure, a point or a summary line.

```
K.figure(id) -> {id, label, value, unit, text, part, lesson, rule, work, practice}   a given or worked figure; print f.text ("23.08 A"), f.work its working; practice is true for a practice value
K.scenario({into, open?, title?, text?})                         the case's scenario panel (folds); a lesson may give its own
K.carried({parts: ['1a'], into})  -> {el, refresh()}             earlier Section A parts at the course's figures
K.answer({id, label?, unit, answer, decimals?, tolerance?, accept?, slips?, into, onCheck?, onEnter?})
    -> {el, input, check(), result, right(), missed(), reveal(), reset(), set(text)}
K.answer.grade(text, spec) -> {state: 'right'|'wrong'|'empty'|'unreadable', value, accepted?, slip?, hint?}
K.written({id, into, onMark?}) -> {el, id, stage(), answered()}
K.summary({into, kept?})
```

**Typed answers** (Section A, where a C&G paper has him write a figure). A decimal-keypad field;
your Check button calls `a.check()` (Enter does too) and you write the feedback from the result.
`answer` is the course's figure, each line worked from the rounded figures shown; it is accepted
within half a unit in its last place (`decimals`, default 2). `accept: [13.32]` adds the answer
worked from unrounded figures; `slips: [{value: 50, hint: 'You left out √3.'}]` names a usual slip
and its hint (`r.hint`). A unit typed after the number ("13.33 A") is fine. Give the part's
case-file id as the answer's id ('1b'), so `K.carried` knows when he missed it: a part got wrong
and never right, or shown with `a.reveal()`, is carried forward at the course's figure and says so.
After two wrong tries, show the working and `reveal()`; Continue once `right()`.
Dan's calculator (the app's) can type its result into the field for him: the field with focus, else
the one showing on the current step. It fires the field's input event like his typing and never
presses Check, so grade only from your Check button (or Enter), never as he types.
The self-test grades every answer: its figure and each accepted one right (with the unit too), a
near miss and each slip refused, and the figure typed into the field and checked on its step.

**Written answers** (Section B: "Explain why…", "State two…"). `K.written({id: 'b1', into})` shows
`lesson.written.b1`'s question, a box for his words and Check my answer. Claude marks them against
the lesson's points through the app (never from the page): each point comes back with an ink tick
or a dashed ring, a statement that is wrong named in red, one line on what he did well and one
nudge; one more go, then the model answer. Without Claude, the points are a checklist he ticks.
No marks, no grades, nothing to score. `onMark(r)` runs when a result is drawn; let him Continue
once `answered()`.

**The summary** (Keep this, the last step). `K.summary({into: '#keep'})` draws `lesson.summary`
as a card (what it is for, the rule, the traps, the case's figures so far, where it lives) and says
it is the first page of the chapter in his Book. A figure resting on a practice value is tagged so; the
traps' and points' cites stay as data and are never shown. Then the Finish button calls `K.complete()`.

**STEPS entries** (tools/course/guide.mjs reads them for the Book and the read-through): a
typed-answer step keeps `want` (the answer as printed, '13.33 A'); a written step is `{kind:
'written', written: 'b1', name, task}`; the summary step is `{kind: 'summary', name: 'Keep this'}`;
the recall opener is a DO step like any other. The read-through (and the Book) shows each step as
it looks finished, as a still picture with no controls, and its words in its place. Three fields
make that read as plain sense (Dan, 20 Oct: "some of the text doesn't make sense… the images are
blank"):
- `read` on a SHOW step: its sentence for reading, when its own words ask him to act ("Drag…",
  "Work each step yourself first, then show it"). Say what the finished picture shows.
- `read` on a DO step only when its task asks him to act on the screen: the same question, asked
  for reading. Never the answer: the read-through shows the question, the choices, the answer
  and why on their own (guide.mjs keeps the task and warns when a `read` gives the answer away).
- `still`: the state the picture shows, when the step's end needs his moves: `{control id: value}`
  (`{h: 35}`), or a function that sets it (`still: () => runTo(SPLIT)`, cards placed in their
  phases; `still: () => pick(...)`, a second question on the step answered too). The state is the
  one its sentence ends on. `still: false` leaves the picture out. guide.mjs leaves out a still
  that would show an empty box (a lane with no cards), and warns about it and about choices on
  the screen that nobody chose, so give those steps a `still`.
The guide drops a sentence that tells him to drag, tap, press or choose, a "Right." or "Still
there." verdict, and the scenario after its first showing; write the step so it still reads
whole without them.
