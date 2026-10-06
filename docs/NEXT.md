# Next version: what is left

Version 7 (published 6 Oct 2026, commit 1c71102) wrapped up at Dan's request ("Wrap this version up
soon"). These are the known items for the next version, most important first. Findings are
numbered as in `docs/review/audit-round3.md`.

## Security and correctness
1. **Audit 22 (major):** an interactive can escape its CSP by navigating its own frame, and the
   page it lands on stays mounted in the lesson by posting `ready` (`32-sandbox.js`).
2. **Learn it again across devices:** whether the rewritten lesson is "fresh" compares
   `lesson.startedAt` (writer's clock) with `progress.relearnAt` (asker's clock). Clock skew can
   show the old lesson as the new round, or rewrite repeatedly. Use a request token
   (`relearnId` on progress, stamped on the doc the rewrite writes) and cap rewrites per screen.
   Also two devices with the request open can both bump the round (`newRound`).
3. **Duplicate tab** copies sessionStorage, so two tabs share `mu.tab` and the lease holder; the
   duplicate can restart the other tab's live job. Detect a duplicate (BroadcastChannel) and take
   a fresh tab id.
4. The rest of the kit and sandbox group: audit 17-21, 41-45, 50 (NaN shown outside readouts,
   unreachable controls passing, sound started from K.update, K.color with `var(--k-…)`, K.stage
   squashing canvases, false positives for sr-only regions and rotated labels, halo over a
   label's own stroke, K.choice reading digit names, 40 px choice controls). Also K.anim's
   Play/Pause posts no `change`, so study minutes stop while an animation runs.
5. Lesson screen: audit 3 (results not announced to screen readers; focus drops to body), 9 (a
   weeks-old Today flag rebuilds a lesson Dan opens to reread), 23 (Ask Claude re-reads the whole
   log on every streamed chunk), 34, 36, 46, 48.
6. Views: audit 24 ("In one breath", hook and warm-up are unchecked and shown next to "Sources
   checked"), 40, 49 (Learn's level chips ignore arrow keys), 51 (Learn says about 3 minutes and
   Today about 6 for the same reviews).

## Lesson quality (the big one)
7. Apply `docs/eval/run2-panel.md`'s 21 ranked changes (predict that does not give itself away,
   checks that test reasoning, interactives that draw the cause, claims true across the range,
   the real why, research that reaches every lesson that needs it, legible labels) and add the
   fact-check step. The plan, with the contracts between prompts, kit and app, is in
   `docs/plans-lesson-quality.md` (prompt group P, kit group K, app group A; contract Q for quiz
   mode on target checks, contract V for the verify-lesson step, which now runs in parallel with
   the interactive build and is saved with the whole lesson).
8. Eval round 3: fresh topics plus two run-2 topics, live research, the same three-judge panel;
   compare with run 2's overall 3.13 and iterate until every part scores 4+.

## Small polish seen in the release check
9. The "Idea learned" cheer can follow Dan to the next screen if he leaves within 1.5 s.
10. A review card's "where it is from" line is cut with an ellipsis on phones; let it wrap.
11. A failed "(try 3 of 3)" build line gets a tick before "Finishing without the interactive".
12. With no built interactive, "What happens" shows twice on Play.
13. Ask Claude's starter row on a phone looks cut at the edge under a conversation (it scrolls,
    with a fade); consider wrapping when only two or three chips are left.
