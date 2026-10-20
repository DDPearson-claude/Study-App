## Refresher lessons: typed answers, written answers, the case file, the summary

A refresher course's steps lesson (a ready-made course built in Claude Code) has four more kit
pieces. The app passes the page two pieces of checked data, as it passes the theme: the course's
case file (`K.caseFile`) and the lesson's own `{written, summary}` (`K.lesson`). Name what you want
by id; the kit draws the checked words, so never retype a figure, a point or a summary line.

```
K.figure(id) -> {id, label, value, unit, text, part, lesson, rule, work}   a given or worked figure; print f.text ("23.08 A"), f.work its working
K.scenario({into, open?})                                        the case's scenario panel (folds)
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
it is the first page of the chapter in his Book. Then the Finish button calls `K.complete()`.

**STEPS entries** (tools/course/guide.mjs reads them for the Book): a typed-answer step keeps
`want` (the answer as printed, '13.33 A'); a written step is `{kind: 'written', written: 'b1',
name, task}`; the summary step is `{kind: 'summary', name: 'Keep this'}`; the recall opener is a
DO step like any other. The Book and the read-through show each step as it looks finished (a step
drawn in HTML is kept as still HTML), with its own words; when those words ask him to do something
("Drag…", "Work each step yourself first, then show it"), give the entry a `read` sentence that
says the same for reading it through.
