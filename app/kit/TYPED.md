## Typed answers (every ready-made course from 28 Oct)

Dan works each puzzle on paper, then types his answer (Dan, 27-28 Oct). So a DO puzzle whose answer
is a figure (a number with at most a unit: "0.70 V", "24 m²", "9.26 V") is typed into a field,
never picked from options. Options stay for answers in words, a direction, an expression
("4i − 2j"), an order, or where choosing between named things is the skill being taught ("Which
pole leaks?"). Never write "About" in a typed answer: give the figure to the places you want.

```
K.answer({id, label?, unit, answer, decimals?, tolerance?, accept?, slips?, into, onCheck?, onEnter?})
    -> {el, input, check(), result, right(), missed(), reveal(), reset(), set(text)}
K.answer.grade(text, spec) -> {state: 'right'|'wrong'|'empty'|'unreadable', value, accepted?, slip?, hint?}
```

- A decimal-keypad field with the unit beside it. `answer` is the lesson's figure, worked from the
  rounded figures the lesson shows; it is accepted within half a unit in its last place
  (`decimals`, default 2: give `decimals: 0` for a whole number, 1 for "0.7"). `accept: [13.32]`
  adds the answer worked from unrounded figures. A unit typed after the number ("0.70 V") is fine.
- The wrong options you would have offered become `slips`: `[{value: 0.07, hint: 'That is 7 mΩ
  read as 0.7 Ω. Milli is a thousandth.'}]`, each with the hint that names the mistake.
- Your Check button calls `a.check()` (Enter does too); never grade as he types (the app's
  calculator can type its result into the field for him). Write the feedback from `a.result`:
  right, "That's it." and Continue; wrong, the slip's hint (`r.hint`) or the step's one-line hint,
  and the field kept for another go; after two wrong tries, the working (Why?) and `a.reveal()`,
  then Continue. Continue only once `a.right()` (a revealed answer counts).
- Give each field its own `id` (the step's name in a few letters is fine).
- Nothing on screen gives the answer before it is checked: a readout that would show the figure
  shows "?" until then.
- STEPS: the typed step keeps `want`, the answer as printed with its unit ('0.70 V'). The lesson's
  read-through, its Book chapter and its problem set (the app asks it again, typed) read it.
- The self-test grades every field: its answer and each accepted one right (with the unit too),
  a near miss and each slip refused, and the answer typed into the field and checked on its step.
- A worked example of the field in use: docs/courses/electrical/design-and-verification/i2.body.final.html.
