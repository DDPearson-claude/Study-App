// actors-looks.js — M1 step 5b (lane 5b-home): the looks M1 sells, worn where they say (docs/loop/SPEC.md §6.3; M1.md §2.6): the
// Slate Cloak Dye on the Wick's cloak, the Oxblood Pennant on the raft's pennant (undyed bone-grey cloth until it is bought) and the
// Amber Lantern Glass in the raft lantern's glass. Built only under the loop (actors.js creates it beside the home barge); off the
// loop nothing here runs and the raft and the Wick keep their built colours. No new mesh, material or light: each look recolours
// the built part's own material (so the frame's draw calls never move).
//
//   createLooks({raft, wick}) → {dress(character, look), update(metaLoop) → changed, owned()}
//   LOOK_COLOURS (the palette's: slate a cool lavender-grey, oxblood the built cloth, the amber a deeper candle amber)
import * as THREE from 'three';

export const LOOK_COLOURS = Object.freeze({
  slate: 0x4a4e60,        // the cloak dyed slate (the Clear Night palette's cool stone)
  oxblood: 0x6e2020,      // the pennant's built oxblood
  undyed: 0x8c8478,       // the pennant before the dye: weathered bone-grey cloth
  amber: 0xff9a2e,        // the lantern's glass in deep amber
});
const arr = (v) => (Array.isArray(v) ? v : []);
/** The looks a save owns (meta.loop.looks), sorted: the signature the actor compares. */
export function lookSig(metaLoop) { return JSON.stringify(arr(metaLoop?.looks).filter((x) => typeof x === 'string').sort()); }

export function createLooks({ raft = null, wick = null } = {}) {
  let owned = new Set(), sig = null, lastC = null, lastLook = null;
  // the pennant: the raft's pole parts are [pole, iron, glass, flame, halo, pennant, stick, chime] (actors-raft.js)
  const pennantMat = () => { const m = raft?.poleParts?.items?.[5]?.material; return m?.color && m.side === THREE.DoubleSide ? m : null; };
  const api = {
    /** After the built applyCharacter: the cloak's dye and the glass's colour for what is owned (the character's own look kept). */
    dress(c, look) {
      lastC = c || lastC; lastLook = look || lastLook;
      try {
        if (owned.has('slate_dye') && wick?.setLook && lastLook) wick.setLook({ ...lastLook, cloak: LOOK_COLOURS.slate });
        if (owned.has('amber_glass') && raft?.glassMat) raft.glassMat.color.set(LOOK_COLOURS.amber).multiplyScalar(1.9);
        const pm = pennantMat();
        if (pm) pm.color.set(owned.has('oxblood_pennant') ? LOOK_COLOURS.oxblood : LOOK_COLOURS.undyed);
      } catch { /* a look never breaks the scene */ }
    },
    /** What is owned (read every frame cheaply: only a changed signature re-dresses). → true when it changed. `reapply` re-runs the
     *  built applyCharacter (so taking a look off a cloak, which never happens in M1, would restore the character's own colour). */
    update(metaLoop, reapply = null) {
      const s = lookSig(metaLoop);
      if (s === sig) return false;
      sig = s; owned = new Set(JSON.parse(s));
      if (typeof reapply === 'function' && lastC) reapply(lastC); else api.dress(lastC, lastLook);
      return true;
    },
    owned: () => [...owned],
  };
  return api;
}
