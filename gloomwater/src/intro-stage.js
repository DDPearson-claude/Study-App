// intro-stage.js — the opening cut scene's set and picture (LANE A "set and picture").
// docs/v3/intro/SPEC.md §4–§6 (binding), CONTRACT §13.13, DESIGN §25.4.9. v3 only: created by the director (src/intro.js), which
// main creates only when data.V3_ENABLED; with v3 off nothing here runs.
//
// THE RULE: the stage is a PURE FUNCTION OF TIMELINE TIME. setTime(t) puts everything this module draws, and the camera, exactly
// where the film has it at t (0 … INTRO.length), whatever was shown before: the director can seek, a skip can jump to the end, a
// test can shoot any moment. The stage never reads a clock, listens for input, touches the DOM, plays a sound, writes state or
// emits on the bus; it creates no light and no render target. One-shot garnish on other modules (water.splash at the contact) may
// fire only when `opts.live` is true and a mark is crossed going forward; nothing the film needs may depend on it.
//
// STATUS: the seam commit's STUB. The camera works (INTRO.cameras: takes of eased keys, portrait values, the blend into render's
// sail rig); the set draws nothing yet. Lane A builds the great lantern, the windows, the ink card, the ember, the pale flank and
// the Wick's kindling here (and in src/intro-models.js), keeping every export and the API below.
//
// API (createIntroStage(ctx)):
//   prebuild() -> bool      build geometry and materials and warm their programs; idempotent; may be called in idle slices under
//                           the title (returns true once everything is ready). Adds nothing visible.
//   ready -> bool
//   enter({replay, reduced}) the set goes live: its group joins ctx.render.scene. Builds at once whatever prebuild left. Idempotent.
//   setTime(t, {live, seek, reduced})   everything at timeline time t. Before INTRO.swapAt the stage shows nothing and leaves the
//                           title camera and the world's mood alone (the opening ink has not closed yet); from the swap on the
//                           world wears the first run's opening mood (world.setIntroMood).
//   exit()                  gives everything back: the camera (render.setIntroCamera(null)), the world's mood, the water light, the
//                           Wick's and the lantern's own light; hides the set. Idempotent; never throws.
//   dispose()               exit() + frees every geometry, material and texture this module created.
//   stats() -> {built, live, t, take, w, anchors, calls, triangles, geometries, textures}

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (a, b, x) => { const k = clamp01((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const inOutSine = (k) => -(Math.cos(Math.PI * clamp01(k)) - 1) / 2;
const EASES = { inOutSine, linear: clamp01, smooth: (k) => smooth(0, 1, k) };

/** The take (INTRO.cameras.takes entry) that owns timeline time t, or null before INTRO.swapAt / outside the film. Pure. */
export function introTake(INTRO, t) {
  const takes = INTRO?.cameras?.takes;
  if (!Array.isArray(takes) || !(t >= (INTRO.swapAt ?? 0))) return null;
  for (const tk of takes) if (t >= tk.from && t < tk.to) return tk;
  return t >= takes.at(-1).to ? takes.at(-1) : null;
}

/** How much of the `portrait` values applies at this viewport aspect: 1 at or under portraitBelow, 0 from 1.1 up. Pure. */
export function portraitWeight(INTRO, aspect) {
  const lo = Number(INTRO?.cameras?.portraitBelow) || 0.9;
  return 1 - smooth(lo, 1.1, Number(aspect) || 1);
}

/** One key's pose at this aspect: {pos: [anchor, x, y, z], look: [anchor, x, y, z], fov}. Pure. */
function keyPose(key, pw) {
  const P = key.portrait || {};
  const mix = (a, b) => (b && pw > 0 ? [a[0], lerp(a[1], b[1], pw), lerp(a[2], b[2], pw), lerp(a[3], b[3], pw)] : a);
  return { pos: mix(key.pos, P.pos), look: mix(key.look, P.look), fov: lerp(key.fov, P.fov ?? key.fov, pw) };
}

/** Catmull-Rom through the keys of one take (zero velocity at its two ends), per channel. Pure. */
function takePose(tk, t, pw) {
  const K = tk.keys, n = K.length;
  let i = 0;
  while (i < n - 2 && t >= K[i + 1].t) i++;
  const k0 = K[i], k1 = K[i + 1], span = k1.t - k0.t, u = clamp01((t - k0.t) / span);
  const p0 = keyPose(k0, pw), p1 = keyPose(k1, pw);
  const pm = i > 0 ? keyPose(K[i - 1], pw) : null, pn = i + 2 < n ? keyPose(K[i + 2], pw) : null;
  const tm = i > 0 ? K[i - 1].t : k0.t, tn = i + 2 < n ? K[i + 2].t : k1.t;
  const h = (a, b, am, an) => {
    const m0 = am === null ? 0 : ((b - am) / (k1.t - tm)) * span, m1 = an === null ? 0 : ((an - a) / (tn - k0.t)) * span;
    const u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * a + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * b + (u3 - u2) * m1;
  };
  const vec = (key) => [p0[key][0], ...[1, 2, 3].map((c) => h(p0[key][c], p1[key][c], pm ? pm[key][c] : null, pn ? pn[key][c] : null))];
  return { pos: vec('pos'), look: vec('look'), fov: h(p0.fov, p1.fov, pm ? pm.fov : null, pn ? pn.fov : null) };
}

/**
 * The film's camera at timeline time t for a viewport aspect. Pure (anchors are not resolved here):
 *   null                                              before INTRO.swapAt: the title's own camera
 *   { take, pos: [anchor, x, y, z], look: [...], fov, w, rig }   w = the weight of this pose over render's rig (1 → 0 in the last take)
 */
export function introCamera(INTRO, t, aspect = 16 / 9) {
  const tk = introTake(INTRO, t);
  if (!tk) return null;
  const pw = portraitWeight(INTRO, aspect);
  if (!tk.rig) return { take: tk.id, ...takePose(tk, Math.min(t, tk.to), pw), w: 1, rig: null };
  // the last take: the pose the film arrived with, fading into render's own rig
  const takes = INTRO.cameras.takes, prev = takes[takes.indexOf(tk) - 1];
  const from = prev && !prev.rig ? takePose(prev, prev.to, pw) : null;
  if (!from) return null;
  const [b0, b1] = tk.blend, ease = EASES[tk.ease] || inOutSine;
  return { take: tk.id, ...from, w: 1 - ease((t - b0) / (b1 - b0)), rig: tk.rig };
}

/** The film's two anchors in world metres: S the raft's spawn, G the Sunken Gate. null while the world cannot say. */
export function introAnchors(ctx) {
  const w = ctx?.world;
  if (!w || w.isStub) return null;
  let S = null, G = null;
  try { const sp = w.getSpawn?.(); if (sp?.position && Number.isFinite(sp.position.x)) S = { x: sp.position.x, z: sp.position.z }; } catch { S = null; }
  try { const h = w.getHeroAnchor?.(); if (h && Number.isFinite(h.x)) G = { x: h.x, z: h.z, face: h.face ?? 0, theme: h.theme ?? null }; } catch { G = null; }
  return S && G ? { S, G } : null;
}

/** [anchor, east, up, south] → [x, y, z] in world metres. Pure. */
export function resolvePoint(v, anchors) {
  const a = anchors?.[v[0]] || { x: 0, z: 0 };
  return [a.x + v[1], v[2], a.z + v[3]];
}

export function createIntroStage(ctx) {
  const I = () => ctx.data?.INTRO || null;
  const st = { built: false, live: false, t: -1, take: null, w: 0, anchors: null, replay: false, reduced: false, mood: false };
  const pose = { pos: [0, 0, 0], look: [0, 0, 0], fov: 46, w: 1 };
  const real = (m) => !!m && !m.isStub;

  function prebuild() {
    // lane A: build the set's geometry and materials here (sliced if it ever costs more than INTRO.set.budget.prebuildMs)
    st.built = true;
    return true;
  }

  function enter({ replay = false, reduced = false } = {}) {
    if (st.live) return;
    prebuild();
    st.live = true; st.replay = !!replay; st.reduced = !!reduced; st.t = -1;
    st.anchors = introAnchors(ctx);
  }

  /** From the swap on (the opening ink is full) the world wears the first run's opening mood: the last shot is lit as the run is. */
  function setMood(on) {
    if (on === st.mood) return;
    st.mood = on;
    try { if (real(ctx.world)) ctx.world.setIntroMood?.(on); } catch { /* optional */ }
  }

  function setCamera(t) {
    const R = ctx.render;
    if (!real(R) || typeof R.setIntroCamera !== 'function') return;
    const cam = R.camera, aspect = cam && cam.aspect > 0 ? cam.aspect : 16 / 9;
    if (!st.anchors) st.anchors = introAnchors(ctx);
    const c = st.anchors ? introCamera(I(), t, aspect) : null;
    if (!c) { st.take = null; st.w = 0; R.setIntroCamera(null); return; }
    pose.pos = resolvePoint(c.pos, st.anchors); pose.look = resolvePoint(c.look, st.anchors); pose.fov = c.fov; pose.w = c.w;
    st.take = c.take; st.w = c.w;
    R.setIntroCamera(pose);
  }

  function setTime(t, opts = {}) {
    if (!st.live || !I()) return;
    t = Math.max(0, Math.min(Number(t) || 0, I().length));
    st.t = t;
    setMood(t >= (I().swapAt ?? 0));
    setCamera(t);
    // a seek shows the settled picture: the rig under the film's pose is put at rest too (the last take blends into it)
    if (opts.seek) { try { ctx.render?.snapCamera?.(); } catch { /* optional */ } }
    // lane A: the set at t (the lantern and its fall, the windows, the mirror's memory, the contact, the ink card, the ember,
    // the pale flank, the spark and the Wick's kindling, the lifting ink) — every one a function of t alone
  }

  function exit() {
    try { if (real(ctx.render)) ctx.render.setIntroCamera?.(null); } catch { /* never throws */ }
    st.mood = false;
    try { if (real(ctx.world)) { ctx.world.setIntroMood?.(false); ctx.world.setIntroWaterLight?.(null); } } catch { /* never throws */ }
    try { if (real(ctx.actors)) ctx.actors.setIntroKindle?.(null); } catch { /* never throws */ }
    st.live = false; st.take = null; st.w = 0;
  }

  function dispose() {
    exit();
    // lane A: free every geometry, material and texture created by prebuild (renderer.info.memory returns to its baseline)
    st.built = false;
  }

  return {
    prebuild, enter, setTime, exit, dispose,
    get ready() { return st.built; },
    stats: () => ({ built: st.built, live: st.live, t: st.t, take: st.take, w: st.w, anchors: st.anchors, calls: 0, triangles: 0, geometries: 0, textures: 0 }),
  };
}
