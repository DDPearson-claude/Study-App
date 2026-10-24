# The bench: one data file a Fault Bench lesson

A Fault Bench lesson is built from one file, `$D/iN.bench.json`. It holds everything Dan reads or
plays on the bench. `tools/course/bench.mjs` checks it and computes every reading. It then writes the
bench into the course's case file, so the lesson page reads words and readings as data and never
retypes them. A worked example is `tests/fixtures/bench/i1.bench.json`, lesson 1 cut down.

```
node tools/course/bench.mjs --dir $D --idea iN [--research $D/research.json]   # check: {ok, problems, warnings, readings}
node tools/course/bench.mjs --dir $D --idea iN --emit-case [--emit-lesson $D/iN.lesson.json] [--table out.json]
```
The bench author runs the check in a loop until `ok`. `readings` lists each job's route with its
reading, rule and the faults left after each step. `--table` writes the full table. Nothing is
written while there are problems.

## Shape

Ids are short. `src` is always a list of source ids: a `research.json` number (`60`), or a material
page locator (`"material:hsg85#p16"`) that is a checked source there. `"TBS: …"` is refused: research
finds a checked quote, or the line is cut. Any `note` or `_comment` key is for builders and is dropped.

| Key | Shape | Notes |
|---|---|---|
| `supply` | `{line, neutral, volts}` | `volts` names a sourced quantity |
| `quantities` | `[{id, label, value, unit, src \| example: true \| compute + inputs, round?, sayAsExample?}]` | Every number on screen is one of these. `compute`: `ratio`, `product`, `sum`, `difference`, `halvingWorst`, `pieceWorst`. Inputs are quantity ids; only a count may be a bare number. `example: true` is a case value such as the 400 V coil. `sayAsExample` is a maker's figure, so every sentence with it says "for example" |
| `coilBand` | `{lo, hi}` | Sourced quantities in % of the coil's rating. Below the band the coil buzzes |
| `points` | `[{id, label}]` | Tap targets, at most about 9. Each is a node |
| `parts` | `[{id, name, kind, a, b, rating?, with?, src?}]` | `kind`: `wire`, `core`, `fuse`, `link` (closed), `nc`, `no`, `aux` (closes with coil `with`), `coil` (`rating`: a quantity) |
| `toggles` | `[{id, part, label, drawn?}]` | Holds an `nc` open or an `no` closed. `drawn: false` is used only by play checks |
| `classes` | `{"near zero": "Near zero: a path", …}` | Dan's words for every class the meter can show: `near zero`, `over range`, `coil`, `floating`, or a lookup's own. No digits |
| `kinds` | `["Open circuit", …]` | The kinds he names a fault as |
| `faults` | `[{id, part, effect, kind, name, nodes?, rating?, role?}]` | `effect`: `open`, `short` (part becomes a link), `bridge` (`nodes` joined), `rating` (coil's `rating` swapped). `role: "distractor"` for one no job hides |
| `alike` | `[{faults: [a, b], why}]` | Only where the brief says two faults may read the same |
| `tests` | `[{id, kind, label, needs?, hold?, reason?: {words?, src}}]` | See the rules below. `needs`: `dead`, `live`, `any` or `on` |
| `isolation` | `{steps: [{id, text, stage, src}], shown, asBefore}` | `stage` in the sourced order: `identify`, `isolate`, `lock`, `notice`, `proveTester`, `testDead`, `reproveTester`. `shown` is the dealt order and is never already solved |
| `restore` | `{text, src}` | Locks off, people told, supply back |
| `intro` | `{text, buttons}` | The bench screen |
| `jobs` | `[{id, title, faults, mode, report, offer, candidates?, liveReason?, notes, route, others?}]` | `faults` in the order they show, so `["f4", "f1"]` is a staged pair. `offer`: the tests he may use. `others`: `[{id, label, route}]`, other routes the page offers or a check plays |
| `notes` | `[{id, title, words, trigger, src \| uses}]` | `trigger`, one or a list: `{on: wrong \| notSure, screen}`, `{on: pieceByPiece, count, job?}`, `{on: surprise, job?, test?, a?, b?}`, `{on: namedWrong \| askRoute \| named \| always, job?}`. `uses` names the quantities or tests a computed card rests on |
| `screens` | `[{id, kind, job?, report?, text, options?, buttons?, after?, hint?, sure?, review?}]` | `kind`: `look`, `choose`, `pickAll`, `chips`, `order`, `loop`, `name`, `proof`, `written`, `keep`. Option: `{text, right?, why?, slip?, warn?, src?}`. A red `warn` option carries its source. `review: {text, options}` is the review card. `report: true` shows the job's report on top |
| `written` | `{b1: {q, points: [{text, src} \| {text, plain: true}], need, model}}` | The teach-back. 3 to 5 points |
| `keep` | `{title, for, rule, traps: [{text, src}], where}` | Keep this. `rule` is one line a point |

**Route steps**: `{do: "safe"}` isolates and proves dead, in full on the first job's order
screen and in one tap after that. `{do: "test", test, a?, b?, hold?, target?, check?, reads?, thought?}`
is one reading. `reads` is optional, and the check refuses it when the rule gives something else.
`{do: "name", fault, kind}`, `{do: "fix", fault}` and `{do: "restore"}` complete the set. A thought is at most 25 words.

## The rules (each reading's source)

- `continuity`, dead, any two points, any drawn toggles held. Closed parts are links. A path of
  links reads `near zero`. A path only through a coil reads `coil`, a class, because no coil
  resistance is sourced. No path reads `over range`. Aux contacts are open when dead.
- `voltageToN`, live, with `hold`. A node linked to the line reads the supply quantity. A node
  that reaches neutral, through links or a coil, reads 0 V. Anything else is `floating`.
- `voltageAcross`, live: the difference of two `voltageToN` readings.
- `look`: `targets: [{id, label, needs?, shows: {healthy, <fault id>: text}, src}]`. It reads the
  text for whichever active fault has one.
- `play`, with the supply on: `checks: [{id, label, seq: [["on" | "off", toggle]], words?}]` plus
  `words: {runs, buzzes, off}`. The contactor settles after each step. A coil fed line to neutral
  seats inside `coilBand` (rule `coilBand`) and closes its aux contacts.
- `lookup`: `at: [{id, label, needs, readings: {healthy, <fault id>: {class} | {value, unit, src}}}]`,
  for later benches such as insulation readings. A value with no `src` is refused.

## What the check refuses

- A number with no rule, source or example mark. This covers quantities, lookups and any number
  with a unit on screen. A decimal on screen must also be a rule's output.
- A fault that reads like a healthy circuit, or like another fault, on every offered test.
- In any route: a dead test or a dead look before `safe`, a live test while isolated, a live test
  with no sourced `reason` on the test or `liveReason` on the job, play while isolated, or a fix while live.
  In the expert route, a `name` the readings so far do not pin to exactly that fault, a fault left
  unfixed, or no `restore` and healthy play after the last fix.
- Isolation steps out of the sourced order, missing a needed stage, without a source, or dealt
  already in order. A job that isolates before any order screen has taught the steps.
- Writing: a screen over 90 words, counting text, report, buttons, options and its longest feedback.
  Also a report over 40 words, a thought over 25 or a note over 90. Narrated sources ("your slides
  say", "one site warns", "according to"), page or paragraph refs, "the course", citation markers,
  brackets and footnotes are refused. `[[term]]` is allowed. So is a `{name}` placeholder. Any
  sentence over 25 words is refused, and so is more than a fifth of them over 20. A choice needs
  one right option, and the right option must not always be in one place.
- Source ids missing from `research.json`.

## How a bench reaches the page

There is no app change. The case file already reaches every lesson page of the course as `K_CASE`
(`app/kit/REFRESHER.md`). `--emit-case` writes into `$D/case.json`:
- `benches.iN`: the checked bench without builder notes. Each job's `route` has `reads`, `rule`,
  `key` and `left` filled in. It also carries `table: {columns: ["healthy", "f1", …, "f4+f1"],
  rows}`. A row key is `<test id>:<a>-<b>[+<held toggles, sorted>]`, with points in the bench's
  order; held toggles count only for continuity. Other keys are `<test id>:<point>` for voltage to N,
  `<test id>:<target>` for a look or lookup and `<test id>:<check>` for play. Each value is a class, a
  reading such as "230 V", a look's text or a play status. The page reads it as
  `K.caseFile.benches.iN`. It looks up the column for the job's active faults and keeps the hidden
  fault out of what Ask Claude sees until Dan names it.
- `figures`: each quantity as `iN.<id>` (`K.figure('i1.coilShare')` gives "58%", with its rule and working).
  Other lessons' figures are kept.
`--emit-lesson` copies `written` and `keep` into the lesson JSON's `written` and `summary`
(`K.written`, `K.summary`). Their sources become the `cite` text, which is never shown. Both outputs
are checked with the app's own validators, and the case file stays under 250 KB. A wording fix is a
bench edit, then the check, then `--emit-case`. It needs no page rebuild.
