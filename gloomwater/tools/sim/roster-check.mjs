#!/usr/bin/env node
// tools/sim/roster-check.mjs: the coverage and ladder check for docs/loop/roster.json.
//
// The roster turns a researched list of real fish (docs/loop/research/*.json, one record per episode with its
// "target" and every animal seen, with a status) into the original fish of the drowned kingdom. This script
// fails (exit 1) when the roster breaks one of the user's rules or one of the roster's own ladder rules:
//
//   coverage   every researched fish with status "caught" has exactly one descendant (matched on the scientific
//              or common name recorded in the fish's `inspiredBy`); every caught animal that is not a fish has a
//              descendant among the fish or the curiosities
//   identity   ids and names are unique (fish and curiosities together); no name uses a real species' own name;
//              no roster file names the series or its presenter
//   fields     every fish has a water, a length ladder [typical low, typical high, record] and a rarity
//   giants     every regular episode whose main fish was landed has a giant descendant (giant: true, epic or
//              legendary, the episode named in giantOf); a main fish only hooked and lost has a giant with the
//              episode in gotAwayOf; a fish that is no episode's main fish is never a giant; only giants are
//              epic or legendary
//   waters     10 to 16 waters; each has at least one giant and exactly one legendary; giants live in old water,
//              night water or the crown (legends in the crown), each at a named place of its water; a place
//              holds at most one giant
//   sizes      a legend is at least 1.4 times the record of anything else in its water (the built legend rule);
//              a giant outgrows every ordinary fish of its own body plan in its water
//
// Every regular episode (it has a target and at least one fish landed) must appear in MAIN below, either with
// its main fish or with the reason it has none. MAIN is the editor's reading of each episode's target.
//
// Run from gloomwater/:   node tools/sim/roster-check.mjs          (the check; prints a summary)
//                         node tools/sim/roster-check.mjs --list   (also every researched fish and its descendant)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const RESEARCH_PATH = path.join(ROOT, 'docs/loop/research/river-monsters-fish.json');
export const ROSTER_PATH = path.join(ROOT, 'docs/loop/roster.json');
export const ROSTER_MD_PATH = path.join(ROOT, 'docs/loop/ROSTER.md');

// ---------------------------------------------------------------------------------------------- the main fish
// title (shortened by shortTitle) -> patterns matched against "scientific | common" of that episode's animals.
// A pattern that matches a caught animal makes it a landed main fish; one that matches only a hooked-lost animal
// makes it a main fish that got away. A string value is the reason the episode has no fish giant.
export const MAIN = {
  'Piranha': [/Pygocentrus nattereri/],
  'Killer Catfish': [/Bagarius yarrelli/],                       // also its extended cut
  'Alligator Gar': [/Atractosteus spatula/],
  'European Maneater': [/Silurus glanis/],
  'Amazon Assassins': [/Arapaima/],
  'Amazon Flesh Eaters': [/Brachyplatystoma filamentosum/],
  'Freshwater Shark': [/Carcharhinus leucas/],
  'Demon Fish': [/Hydrocynus goliath/],
  'Death Ray': [/Urogymnus polylepis/],
  'Killer Snakehead': [/Channa micropeltes/],
  'Congo Killer': [/Chrysichthys cranchii/, /Heterobranchus longifilis/],   // the target names both, both landed
  'Alaskan Horror': [/Acipenser transmontanus/],
  'Rift Valley Killers': [/Lates niloticus/],
  'Hidden Predator': [/Carcharhinus leucas/],
  'The Mutilator': [/Piaractus brachypomus/],
  'Flesh Ripper': [/Anguilla dieffenbachii/],
  'Silent Assassin': [/Potamotrygon brachyura/],
  'Chainsaw Predator': [/Pristis pristis/],
  'Electric Executioner': [/Electrophorus electricus/],
  'Cold Blooded Horror': 'the headline animal is a salamander (a curiosity, not a fish); the giant lake catfish of the target was only seen, and the small catfish landed is by-catch',
  'Jungle Killer': [/Hoplias aimara/],
  'Goes Tribal': [/Carcharhinus amblyrhynchos/],
  'American Killers': [/Carcharhinus leucas/, /Ictalurus furcatus/, /Pylodictis olivaris/], // its gar was not landed here
  'Pack of Teeth': [/Hydrocynus vittatus/],
  'Invisible Executioner': [/Heterobranchus longifilis/],
  'Asian Slayer': [/Wallago attu/],                              // hooked and lost: the one that got away
  'Russian Killer': [/Huso dauricus/],
  'Mongolian Mauler': [/Hucho taimen/],
  'Phantom Assassin': [/Glyphis garricki/],
  'Lair of Giants': [/^Arapaima/],
  'Face Ripper': [/Pygocentrus nattereri/],
  'Atomic Assassin': [/Silurus glanis/],
  'Killer Torpedo': [/Megalops atlanticus/],
  'Colombian Slasher': [/Paratrygon aiereba/],
  'Vampires of the Deep': [/Entosphenus tridentatus/],
  'Legend of Loch Ness': [/Somniosus microcephalus/],
  'Amazon Apocalypse': [/Phractocephalus hemioliopterus/, /Brachyplatystoma filamentosum/],
  'Jungle Terminator': 'its headline fish was caught by others only; the landed fish are by-catch',
  'River of Blood': [/Salminus brasiliensis/],
  'Man-Eating Monster': [/Brachyplatystoma filamentosum/],
  'Bone Crusher': 'the headline animal is a snake (a sighting among the curiosities), not a fish',
  'Body Snatcher': [/^Arapaima/],
  'Canadian Horror': [/Esox masquinongy/],
  'Mekong Mutilator': [/Pao cochinchinensis/],
  'Prehistoric Terror': [/Atractosteus spatula/, /Istiophorus platypterus/, /Acipenser transmontanus/], // the living stand-ins
  "Alaska's Cold Water Killer": [/Hippoglossus stenolepis/],
  'South Pacific Terrors': [/Caranx ignobilis/, /Anguilla marmorata/],
  "Africa's Deadliest": [/Hydrocynus vittatus/],
  'Deep Sea Demon': 'its headline fish was only seen; the landed fish are by-catch',
  'Death Down Under': [/Galeocerdo cuvier/, /Epinephelus lanceolatus/],   // the landed suspects; the culprit is a jelly (a curiosity)
  'Razorhead': [/Sphyraena barracuda/],
  'Terror in Paradise': 'its headline animal was never caught; the landed fish are by-catch',
  'Devil of the Deep': 'the headline animal is a squid (a curiosity), not a fish; the landed fish are by-catch',
  'Killers from the Abyss': [/Thyrsites atun/, /Hexanchus griseus/],    // the suspects that were landed
  'Ice Cold Killer': [/Somniosus microcephalus/],
  'Coral Reef Killer': [/Belonidae/],
  'Return of the Killer Catfish': [/Bagarius yarrelli/],         // hooked and lost here (landed in other episodes)
  'Volcanic Island Terror': [/Lutjanus goldiei/],
  'Malaysian Lake Monster': [/Wallagonia leerii/],
  'Jurassic-Sized Prehistoric Terror': 'an extended cut; its new catches are by-catch and its stand-ins are counted under Prehistoric Terror',
  'The Lost Reels: Amazonian Giant': [/Arapaima gigas/],
  'The Lost Reels: Himalayan Giant': [/Bagarius yarrelli/, /Tor putitora/],
};

// Words that are a real species' own name (generic family words such as catfish, eel, ray, pike, gar, perch, carp,
// trout, salmon, bass, cod, shark, jack, snapper, grouper or sturgeon are allowed).
export const REAL_NAMES = ['arapaima', 'pirarucu', 'goonch', 'piranha', 'pacu', 'tambaqui', 'piraiba', 'lau-lau', 'jau',
  'redtail', 'sorubim', 'surubi', 'candiru', 'payara', 'dorado', 'mahseer', 'taimen', 'kaluga', 'wels', 'zander',
  'muskellunge', 'musky', 'tarpon', 'barramundi', 'wallago', 'sareng', 'mulley', 'tapah', 'tigerfish', 'vundu', 'kamba',
  'anjumara', 'aimara', 'trahira', 'lukanani', 'boga', 'pati', 'mandube', 'basha', 'sockeye', 'chinook', 'chum', 'lenok',
  'grayling', 'dace', 'bluegill', 'bowfin', 'redhorse', 'halibut', 'lingcod', 'ling', 'cusk', 'tusk', 'saithe', 'coalfish',
  'haddock', 'plaice', 'conger', 'hagfish', 'ratfish', 'mahi', 'skipjack', 'yellowfin', 'marlin', 'sailfish', 'snoek',
  'barracuda', 'needlefish', 'houndfish', 'bonefish', 'grunter', 'kob', 'tilapia', 'lungfish', 'sixgill', 'squeaker',
  'semutundu', 'rohu', 'tengara', 'seerfish', 'pouting', 'motoro', 'mussum', 'fidalgo', 'dawala', 'piracatinga',
  'tiger', 'bull', 'goliath', 'roach', 'chub', 'mackerel', 'tuna'].filter((w) => !['chub', 'mackerel', 'tuna'].includes(w));
// (chub, mackerel and tuna are kept as generic family words, like trout.)
const SERIES = /River Monsters|Jeremy|\bWade\b/;

const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const PLACES = ['open', 'day', 'old', 'night', 'crown'];
const BUILT_PLANS = ['minnow', 'perch', 'carp', 'pike', 'eel', 'angler', 'ray', 'puffer', 'jelly', 'crayfish', 'koi', 'ghost',
  'leviathan', 'sturgeon'];

// ------------------------------------------------------------------------------------------------ name matching
const NOT_GENUS = new Set(['Wikipedia', 'Indian', 'Official']);
const NOT_EPITHET = new Set(['sp', 'spp', 'cf', 'lists', 'says', 'per']);
export function binomial(sci) {
  if (!sci) return null;
  const s = String(sci).replace(/\bcf\.\s*/g, '');
  for (const m of s.matchAll(/\b([A-Z][a-z]+) ([a-z]{3,})\b/g)) {
    if (NOT_GENUS.has(m[1]) || NOT_EPITHET.has(m[2])) continue;
    return `${m[1]} ${m[2]}`;
  }
  return null;
}
const norm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
export function keysOf(a) {
  const k = new Set([`raw:${norm(a.scientific)}|${norm(a.common)}`]);
  const b = binomial(a.scientific);
  if (b) k.add(`sci:${b.toLowerCase()}`);
  return k;
}
export const shortTitle = (t) => String(t).replace(/^River Monsters /, '').replace(/ \((?:international title|Extended Cut|two-hour)[^)]*\)$/i, '').trim();
const rec = (f) => (Array.isArray(f.lengthCm) ? f.lengthCm[2] : 0);
const first = (f) => (Array.isArray(f.lengthCm) ? f.lengthCm[0] : 0);
const overlaps = (a, b) => { for (const x of a) if (b.has(x)) return true; return false; };

export function load() {
  const research = JSON.parse(fs.readFileSync(RESEARCH_PATH, 'utf8'));
  const roster = JSON.parse(fs.readFileSync(ROSTER_PATH, 'utf8'));
  return { research, roster };
}

// Every animal record of the research, with its episode.
export function animals(research) {
  const out = [];
  for (const ep of research.episodes) for (const a of ep.animals || []) out.push({ ...a, episode: shortTitle(ep.title), ep });
  return out;
}

// The roster entries (fish or curiosities) that descend from a research animal.
export function descendantsOf(a, list) {
  const ka = keysOf(a);
  return list.filter((f) => (f.inspiredBy || []).some((e) => overlaps(keysOf(e), ka)));
}

export function check({ research, roster }, { list = false } = {}) {
  const fails = [], warns = [], info = [];
  const fail = (m) => fails.push(m), warn = (m) => warns.push(m);
  const fish = roster.fish || [], curios = roster.curiosities || [], waters = roster.waters || [];
  const all = [...fish, ...curios];
  const waterNames = new Set(waters.map((w) => w.name));
  const plans = new Set([...BUILT_PLANS, ...(roster.newBodyPlans || []).map((p) => p.name)]);
  const A = animals(research);

  // identity
  const seen = new Map();
  for (const f of all) {
    for (const [k, v] of [['id', f.id], ['name', f.name]]) {
      const key = `${k}:${norm(v)}`;
      if (!v) fail(`${f.id || f.name}: no ${k}`);
      else if (seen.has(key)) fail(`two entries share the ${k} "${v}"`);
      else seen.set(key, f);
    }
    const words = norm(f.name).split(' ');
    for (const w of REAL_NAMES) if (words.includes(w)) fail(`${f.id}: the name "${f.name}" uses the real name "${w}"`);
  }
  for (const p of [ROSTER_PATH, ROSTER_MD_PATH]) {
    if (!fs.existsSync(p)) { if (p === ROSTER_MD_PATH) warn('docs/loop/ROSTER.md is missing'); continue; }
    const text = fs.readFileSync(p, 'utf8');
    const m = text.match(SERIES);
    if (m) fail(`${path.basename(p)} names the series or its presenter ("${m[0]}")`);
  }

  // fields
  for (const f of fish) {
    if (!Array.isArray(f.water) || !f.water.length) fail(`${f.id}: no water`);
    else for (const w of f.water) if (!waterNames.has(w)) fail(`${f.id}: unknown water "${w}"`);
    const L = f.lengthCm;
    if (!Array.isArray(L) || L.length !== 3 || !L.every((x) => Number.isFinite(x) && x > 0) || !(L[0] <= L[1] && L[1] <= L[2]))
      fail(`${f.id}: lengthCm must be [typical low, typical high, record] in cm, got ${JSON.stringify(L)}`);
    if (!RARITIES.includes(f.rarity)) fail(`${f.id}: rarity "${f.rarity}" is missing or unknown`);
    if (!PLACES.includes(f.place)) fail(`${f.id}: place "${f.place}" is not one of ${PLACES.join(', ')}`);
    if (!plans.has(f.bodyPlan)) fail(`${f.id}: body plan "${f.bodyPlan}" is neither built nor named in newBodyPlans`);
    if (!f.inspiredBy || !f.inspiredBy.length) fail(`${f.id}: no inspiredBy`);
    for (const e of f.inspiredBy || []) if (!A.some((a) => overlaps(keysOf(a), keysOf(e)))) fail(`${f.id}: inspiredBy "${e.common} / ${e.scientific}" matches nothing in the research`);
    if (f.giant && !['epic', 'legendary'].includes(f.rarity)) fail(`${f.id}: a giant must be epic or legendary`);
    if (!f.giant && ['epic', 'legendary'].includes(f.rarity)) fail(`${f.id}: only giants are epic or legendary`);
    if (f.giant && !['old', 'night', 'crown'].includes(f.place)) fail(`${f.id}: a giant lives in old water, night water or the crown, not "${f.place}"`);
    if (f.rarity === 'legendary' && f.place !== 'crown') fail(`${f.id}: a legend lives in the crown`);
  }
  for (const c of curios) {
    if (!c.inspiredBy || !c.inspiredBy.length) fail(`${c.id}: curiosity without inspiredBy`);
    if (c.water && !c.water.every((w) => waterNames.has(w))) fail(`${c.id}: unknown water`);
  }

  // coverage
  const rows = [];
  for (const a of A) {
    if (a.status !== 'caught') continue;
    const d = descendantsOf(a, a.isFish ? fish : all);
    if (!d.length) fail(`no descendant for ${a.isFish ? 'the fish' : 'the animal'} "${a.common}" (${a.scientific || 'no scientific name'}), ${a.episode}`);
    const ids = [...new Set(d.map((x) => x.id))];
    if (a.isFish && ids.length > 1) fail(`"${a.common}" (${a.scientific || '-'}) has ${ids.length} descendants: ${ids.join(', ')} (one species, one fish)`);
    rows.push([a.episode, a.common, a.scientific || '-', ids.join(', ') || 'NONE']);
  }

  // giants
  const giantSources = new Map();               // fish id -> episodes
  const regular = research.episodes.filter((e) => e.target && (e.animals || []).some((a) => a.status === 'caught' && a.isFish));
  for (const ep of regular) {
    const t = shortTitle(ep.title);
    if (!(t in MAIN)) { fail(`regular episode "${t}" is not in MAIN (name its main fish or the reason it has none)`); continue; }
  }
  for (const [t, pats] of Object.entries(MAIN)) {
    const eps = research.episodes.filter((e) => shortTitle(e.title) === t);
    if (!eps.length) { fail(`MAIN names "${t}", which is not in the research`); continue; }
    if (typeof pats === 'string') continue;
    const anim = eps.flatMap((e) => e.animals || []);
    for (const p of pats) {
      const hit = anim.filter((a) => p.test(`${a.scientific || ''} | ${a.common}`) && a.isFish);
      const landed = hit.filter((a) => a.status === 'caught');
      const lost = hit.filter((a) => a.status === 'hooked-lost');
      if (!landed.length && !lost.length) { fail(`${t}: its main fish ${p} is neither landed nor hooked in the research`); continue; }
      const src = landed.length ? landed : lost;
      const desc = [...new Set(src.flatMap((a) => descendantsOf(a, fish)))];
      if (!desc.length) { fail(`${t}: its main fish (${src[0].common}) has no descendant`); continue; }
      for (const f of desc) {
        if (!f.giant || !['epic', 'legendary'].includes(f.rarity)) fail(`${t}: the descendant of its main fish, ${f.id}, is not a giant (giant: true, epic or legendary)`);
        const field = landed.length ? 'giantOf' : 'gotAwayOf';
        if (!(f[field] || []).includes(t)) fail(`${f.id}: ${field} should name "${t}"`);
        if (!giantSources.has(f.id)) giantSources.set(f.id, []);
        giantSources.get(f.id).push(t);
      }
    }
  }
  for (const f of fish) {
    if (f.giant && !giantSources.has(f.id)) fail(`${f.id} is a giant but descends from no episode's main fish`);
    for (const t of [...(f.giantOf || []), ...(f.gotAwayOf || [])]) if (!(t in MAIN)) fail(`${f.id}: giantOf/gotAwayOf names "${t}", which MAIN does not know`);
  }

  // waters
  if (waters.length < 10 || waters.length > 16) fail(`${waters.length} waters (aim for 10 to 16)`);
  const inWater = (w) => fish.filter((f) => (f.water || []).includes(w));
  for (const w of waters) {
    const fs_ = inWater(w.name);
    const giants = fs_.filter((f) => f.giant), legends = fs_.filter((f) => f.rarity === 'legendary' && f.water[0] === w.name);
    if (!giants.length) fail(`${w.name}: no giant`);
    if (legends.length !== 1) fail(`${w.name}: ${legends.length} legendaries at home (one, the water's great prize)`);
    const byPlace = new Map();
    for (const g of giants.filter((x) => x.water[0] === w.name)) {
      const p = (w.places || []).find((q) => q.name === g.placeName);
      if (!p) { fail(`${g.id}: a giant needs a placeName among ${w.name}'s places, got "${g.placeName}"`); continue; }
      if (p.kind !== g.place) fail(`${g.id}: ${g.placeName} is ${p.kind} water, not ${g.place}`);
      if (byPlace.has(p.name)) fail(`${w.name}: two giants at ${p.name} (${byPlace.get(p.name)}, ${g.id}); a fourth giant lives on a later sheet`);
      byPlace.set(p.name, g.id);
    }
    for (const L of legends) {
      const rest = fs_.filter((f) => f !== L);
      const top = Math.max(0, ...rest.map(rec));
      if (first(L) < 1.4 * top - 1e-9) fail(`${w.name}: the legend ${L.id} (${first(L)} cm at first landing) is under 1.4 times the longest other record (${top} cm)`);
    }
    for (const g of giants) for (const f of fs_.filter((x) => !x.giant && x.bodyPlan === g.bodyPlan))
      if (rec(f) >= rec(g)) fail(`${w.name}: the giant ${g.id} (${rec(g)} cm) does not outgrow ${f.id} (${rec(f)} cm), same body plan`);
    const by = Object.fromEntries(RARITIES.map((r) => [r, fs_.filter((f) => f.rarity === r).length]));
    if (by.common < 2) warn(`${w.name}: only ${by.common} common fish in the roster (built species may fill the rest)`);
    info.push(`${w.name.padEnd(20)} ${String(fs_.length).padStart(3)} fish · ${RARITIES.map((r) => `${by[r]} ${r}`).join(' · ')} · ${giants.length} giants${w.existingLake ? ` · built lake (${w.existingLake})` : ''}`);
  }

  // the size model (BALANCE.size: L = L50·e^(σz + 0.06·max(0, z − 1.04)²); the record is the "said to reach" at z 3.6)
  for (const f of fish) {
    const m = f.sizeModel;
    if (!m || !(m.L50 > 0) || !(m.sigma > 0)) { fail(`${f.id}: no sizeModel {L50, sigma}`); continue; }
    if (f.rarity === 'legendary') { if (m.L50 !== first(f)) fail(`${f.id}: a legend's L50 is its first landing`); continue; }
    if (m.sigma < 0.09 || m.sigma > 0.175) fail(`${f.id}: σ ${m.sigma} is outside the built range 0.09 to 0.175`);
    const said = m.L50 * Math.exp(3.6 * m.sigma + 0.06 * (3.6 - 1.04) ** 2);
    if (Math.abs(said / rec(f) - 1) > 0.03) fail(`${f.id}: its size model reaches ${said.toFixed(0)} cm, not its record ${rec(f)} cm`);
    if (f.giant && !(m.sigma >= Math.max(...fish.filter((x) => !x.giant && x.water[0] === f.water[0]).map((x) => x.sizeModel?.sigma || 0))))
      fail(`${f.id}: a giant has the widest size spread of its water`);
  }

  return { fails, warns, info, rows, giantSources };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const list = process.argv.includes('--list');
  const data = load();
  const { fails, warns, info, rows, giantSources } = check(data, { list });
  const fish = data.roster.fish;
  const caughtFish = new Set(animals(data.research).filter((a) => a.status === 'caught' && a.isFish).map((a) => [...keysOf(a)].find((k) => k.startsWith('sci:')) || [...keysOf(a)][0]));
  if (list) for (const r of rows) console.log(r.join(' | '));
  console.log(`roster: ${fish.length} fish, ${(data.roster.curiosities || []).length} curiosities, ${data.roster.waters.length} waters, ${fish.filter((f) => f.giant).length} giants (${fish.filter((f) => f.rarity === 'legendary').length} legendary)`);
  console.log(`research: ${rows.length} catch records, about ${caughtFish.size} distinct kinds of fish landed`);
  for (const l of info) console.log('  ' + l);
  console.log(`giants from ${new Set([...giantSources.values()].flat()).size} episodes`);
  for (const w of warns) console.log('WARN ' + w);
  for (const f of fails) console.log('FAIL ' + f);
  console.log(fails.length ? `\n${fails.length} failure(s)` : '\nroster-check: all rules pass');
  process.exit(fails.length ? 1 : 0);
}
