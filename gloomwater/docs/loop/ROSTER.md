# The Roster: the fish of the drowned kingdom

*164 fish, 8 curiosities, 16 waters. Data: `docs/loop/roster.json`. Checked by `node tools/sim/roster-check.mjs` (exit 1 on any broken rule). Design only: nothing in `src/` changed.*

Every kind of fish landed in the researched list (`docs/loop/research/`, 255 catch records, about 162 kinds) is the ancestor of exactly one fish of ours.
Our fish are original creatures of the Lamplit Kingdom: a new name, a silhouette that keeps what makes the real fish unmistakable, and the Starlit palette.
The descendant of each episode's main fish is a **rare giant** (★): 49 of them, 16 legendary (one per water, its crown) and 33 epic, found only at its own place and hours.
Everything else fills the ladder below them: 50 common, 40 uncommon, 25 rare.
The real animal is a design note only (`inspiredBy`); the game never names it, the series or its presenter.

## 1. Rules this roster keeps

| rule | value |
|---|---|
| one fish per kind | each researched kind with status "caught" has exactly one descendant; close relatives share one only when they are the same species |
| giants | the descendant of each episode's main fish that was landed: `giant: true`, epic, or legendary for the single greatest prize of a water. A main fish only hooked and lost (the sareng) is its water's *one that got away*. A fish that is no episode's main fish is never a giant, and only giants are epic or legendary |
| where giants live | only at one named place of their water, in its old water, night water or crown (a legend in the crown); one giant per place. A fourth giant in a water lives on a later sheet (SPEC §5.2) |
| sizes | the record (cm) comes from the real animal, or from the giant of its kind when the real fish is small beside the 85 cm Wick. It is the "said to reach" of the one size model (§25.7.1, z 3.6). The spread grows with rarity: σ 0.10 common, 0.12 uncommon, 0.14 rare, 0.16 epic, so a giant has the longest ladder of its water. "Typical" is the Keeper floor to the Prize top: what most landed fish measure |
| legends | authored sizes (σ 0.02): first landing, then +7% weight per landing to fully grown (×1.5 weight, ×1.145 length). Each first landing is at least 1.4 times the record of anything else in its water (the built legend rule) |
| kin | every giant outgrows every ordinary fish of its own body plan in its water |
| names | plain English compounds in the game's voice; generic words (catfish, eel, ray, pike, gar, perch, trout, cod, shark, jack, tuna) are fine; no real species' own name |
| hidden species (§25.6) | a behaviour only one fish has (a hum, a knock, a grumble, a pack boiling round it, birds over the water) is its place's dressing or a flourish at the reveal, never a tell during the play. Signs stay the six built ones. Legends are exempt |

## 2. The waters

| # | water | echoes | fish | giants | its great prize | built? |
|---|---|---|---|---|---|---|
| 1 | **The Mossmere** | Still northern waters: European rivers and lakes, a reactor cooling pond, a Scottish loch, the lakes of New England and Ontario. | 13 | 3 | The Belled Matriarch (260 cm) | yes (`mossmere`) |
| 2 | **Sporewood Pools** | Warm still water of south-east Asia and the forest pools of the Amazon: stocked lakes in Thailand, the tidal Mae Klong, Tonle Sap and the Mekong, a drying puddle in Brazil. | 12 | 4 | The Drifting Grove (300 cm) | yes (`sporewood`) |
| 3 | **Glasswater Vault** | Cold clear rivers and deep cold lakes: the Amur, a Mongolian rapid, Alaskan and Columbian salmon rivers, a Japanese lake, the glacier rivers of New Zealand. | 12 | 4 | The Glass Sovereign (380 cm) | yes (`glasswater`) |
| 4 | **The Pallid Deep** | The deep sea: the abyss off a mid-ocean island, deep-water traps and trawls of the Pacific, the rough ground of the English Channel. | 4 | 1 | The Lantern-Swallower (850 cm) | yes (`paleabyss`) |
| 5 | **Rushlight Fen** | Reed delta and dam lake: the Okavango, the Zambezi and its gorge, Lake Kariba and the pool below its dam. | 7 | 2 | The Long Thunder (228 cm) | new sheet |
| 6 | **The Thin Water** | Wide sandy rivers with marsh and a dam: the Parana and the Uruguay below a great dam, the Ibera marshes, the beaches of a Bolivian river. | 10 | 2 | The Buried Moon (255 cm) | new sheet |
| 7 | **Lampmoss Slough** | Warm slow rivers of the American south: the Trinity River, the canals at the edge of the Everglades, the Illinois River, the water below a Missouri dam, catfish dens in Oklahoma. | 9 | 3 | The Last Sentry (265 cm) | new sheet |
| 8 | **Pyrefall Gorge** | Himalayan snow rivers and their pools: the Kali, the Karnali and the Babai, a foothill reservoir; and a Japanese mountain stream for its one curiosity. | 7 | 3 | The Ashen Guest (245 cm) | new sheet |
| 9 | **The Thunder Stair** | Rapids and falls of the great African rivers: the Congo at Brazzaville, Murchison Falls and the White Nile, a Rift Valley lake. | 8 | 3 | The Last Lock (262 cm) | new sheet |
| 10 | **The Inkwood** | Blackwater flooded forest, forest lakes, oxbows and narrow jungle creeks: the Amazon near Manaus, the hidden ponds of Guyana, the creeks of Suriname, an oxbow in Bolivia. | 11 | 4 | The Banked Fire (325 cm) | new sheet |
| 11 | **The Siltway** | The great brown river and its deep holes: the Amazon main stem at Manaus, Obidos and Leticia, the meeting of two rivers, the Essequibo, a sunken ferry. | 15 | 3 | The Barge-Shadow (300 cm) | new sheet |
| 12 | **The Salt Gate** | River mouths where the sea comes in: the Breede, the Fitzroy and King Sound with their huge tides, a Brisbane river, a Fijian mountain river. | 14 | 4 | The Old Shipwright (610 cm) | new sheet |
| 13 | **Lanternroot Lagoon** | Brackish lagoons, mangrove creeks and flats: lagoons on the Caribbean coast of Nicaragua and Florida, the Bahamas flats, a Solomon Islands village lagoon, jungle rivers of New Britain and Malaysia. | 11 | 4 | The Silver Regent (310 cm) | new sheet |
| 14 | **The Waxen Reef** | Coral reefs, drop-offs and wrecks: Fiji, the islands off New Britain, Sulawesi, the Florida Keys, the Queensland coast. | 10 | 4 | The Waxen Abbot (250 cm) | new sheet |
| 15 | **The Last Light** | The open ocean: blue water off a mid-ocean island, Cape Point, the Sea of Cortez, the Indian Ocean, the Bahamas drop-off. | 10 | 3 | The Jetsam Shark (480 cm) | new sheet |
| 16 | **The Rime Sound** | Cold seas, fjords and sea ice: Norwegian fjords, the coast of Iceland, Greenland ice, Alaskan coastal water, the English Channel. | 12 | 2 | The Long Winter (560 cm) | new sheet |

The four built lakes come first and keep their order and prices (SPEC §5.2). The twelve new waters are later sheets, each a lake map with its four place maps, in the order above: the gentle fresh waters first (the smallest legends), then the great rivers, the sea and the far north last. Their prices follow the SPEC pattern and are set in `tools/sim/clams.mjs` when they are scheduled (SPEC §13, slice 6). Built lakes keep every built species that has no ancestor here (section 5).

## 3. The fish, water by water

Giants first (★), then by rarity. Lengths in cm; a legend shows its first landing → fully grown. *Inspired by* is a design note only († caught by others, ‡ hooked and lost). Hours: day, dusk, night or any. *Where*: open water, a kind of place, or a giant's own place.

### 1. The Mossmere (built)

*As built: the starlit moat. Its new fish are slate, pewter, rust and ivory, with no glow but the eel's and the lamprey's.*

Places: the Lily Maze (day) · Under the Span (old) · the Buoy Lights (night) · the Bell Pool (crown) · the Sluice Run (old, later sheet) · the Cupped Hands (old, later sheet) · the Gatehouse Door (night, later sheet).

| | fish | inspired by | plan | typical | record | rarity | hours | where | favours | journal |
|---|---|---|---|---|---|---|---|---|---|---|
| ★ | **The Belled Matriarch** | Wels catfish (*Silurus glanis*) | catfish | 260 → 298 | 298 | **legendary** | day, dusk | the Bell Pool | Her bait only: Heartmoss Ball. | A bell grew into her skull. She has tolled for the drowned ever since. |
| ★ | **Hullkiss Lamprey** | Pacific lamprey (*Entosphenus tridentatus*); Sea lamprey (*Petromyzon marinus*)† | lamprey | 67–99 | 185 | **epic** | night | the Buoy Lights | Predator: Cut Strip; Moth Popper. | It only wants to hold on to something. Anything. You will do. |
| ★ | **Thousandcast Pike** | Muskellunge (*Esox masquinongy*) | pike | 67–98 | 183 | **epic** | dusk | Under the Span | Predator: Harbour-Bell Spinner. Known to ignore it and take the plainest bait. | Follows the lure to the raft, looks at you, and leaves. Ten thousand times. |
|  | **Reedjaw Pike** | Northern pike (*Esox lucius*) | pike | 59–83 | 150 | rare | any | open water | Predator: Glimmer Spoon, Harbour-Bell Spinner, Cut Strip. | Lies in the reeds until it forgets it is not one. |
|  | **Gloam Eel** | European eel (*Anguilla anguilla*) | eel | 52–74 | 133 | rare | night | night water | Glow: bites on Lumen Moss only. | Crossed an ocean to be here, and will not say what for. |
|  | **Kissmark Trout** | Lake trout (*Salvelinus namaycush*) | trout | 64–86 | 150 | uncommon | any | open water | Predator: Glimmer Spoon fished deep. | Star-spotted, and wearing one round scar where something let go. |
|  | **Milkeye Perch** | Zander (*Sander lucioperca*) | perch | 51–69 | 120 | uncommon | dusk, night | open water | Predator: Glimmer Spoon, Cut Strip. | Eyes like two spilt saucers of milk. It sees you perfectly well. |
|  | **Weeping Carp** | Common carp (*Cyprinus carpio*) | carp | 51–69 | 120 | uncommon | any | open water | Bottom: Mire Worms, Bone Jig, Harbour-Bell Spinner. | They have never once said they were not mourning. |
|  | **Likely Chub** | European chub (*Squalius cephalus*) | minnow | 37–47 | 80 | common | day, dusk | open water | Insect: Feather Fly. | It looks like a chub. Nobody has checked. |
|  | **Rustfin Sucker** | Redhorse sucker (*Moxostoma valenciennesi*) | carp | 37–47 | 80 | common | any | open water | Bottom: Bone Jig, Mire Worms. | Kisses every stone on the bottom, in case one of them is home. |
|  | **Overbold Bass** | Smallmouth bass (*Micropterus dolomieu*) | perch | 32–41 | 69 | common | day, dusk | open water | Predator: Glimmer Spoon. | Attacks lures its own size. It has never once won. |
|  | **Mossback Perch** | European perch (*Perca fluviatilis*) | perch | 28–36 | 60 | common | any | open water | Bottom: Mire Worms, Bone Jig. | Wears a small garden on its back and takes the worm anyway. |
|  | **Dusk Minnow** | Small roach-like fish | minnow | 21–27 | 45 | common | any | open water | Insect: Feather Fly, Mire Worms. | Caught on a scrap of silver paper. It still thinks that was a fair trade. |

**Giants of The Mossmere:** The Belled Matriarch, the giant of *European Maneater*, *Atomic Assassin* · Hullkiss Lamprey, the giant of *Vampires of the Deep* · Thousandcast Pike, the giant of *Canadian Horror*.

- **The Belled Matriarch.** Vast flat-headed catfish, tiny eyes, a mouth wide as a door, two whiskers long as bell-ropes, body tapering to an eel tail. Tarnished bronze; a harbour bell sunk in her skull. Eyes glow lavender. *Play:* Steady. Authored: take, toll, run, toll, circle, last stand, lift. Slow, immovable; never better than a coin flip. *Haunt:* Crown: the Bell Pool, the deepest water. Sign: the pool's glimmer; a toll from below before the take.
- **Hullkiss Lamprey.** Jawless eel longer than the Wick is tall. A round sucker mouth ringed with amber teeth; seven gill holes in a row, lit lavender like windows. Ink back, stone-white belly. *Play:* Sulker. No runs: it latches and hangs as dead weight through long holds, then lets go all at once. Spat. *Haunt:* Night water at the Buoy Lights, on the lit buoys and under the hull. Sign: seven lavender points in a row.
- **Thousandcast Pike.** A pike half again as long and deeper, heavy jaw, pointed tail lobes. Stone-white flanks with dark upright bars, rust fins, an amber rim to the eye. No glow. *Play:* Thrasher. Follows and turns away before it ever bites. Slamming take, two leaps with head-shakes, a run under the raft. *Haunt:* Old water under the Span, beside one drowned rock. Sign: a long shadow that follows the float and turns away.

### 2. Sporewood Pools (built)

*As built: the ember garden. New fish in plum, amber, rose and cream.*

Places: the Lullaby (day) · the Gill Harp (old) · the Veilwater (night) · the Mother's Cup (crown) · the Puffball Vent (old, later sheet) · the Drowned Greenhouse (night, later sheet).

| | fish | inspired by | plan | typical | record | rarity | hours | where | favours | journal |
|---|---|---|---|---|---|---|---|---|---|---|
| ★ | **The Drifting Grove** | Giant freshwater stingray (*Urogymnus polylepis*) | disc | 300 → 345 | 345 | **legendary** | day, dusk | the Mother's Cup | Her bait only: Glowcap Bulb. | A whole meadow rides on her back. It blooms where no one sees. |
| ★ | **Harpstring Eel** | Electric eel (*Electrophorus electricus*) | eel | 77–112 | 210 | **epic** | any, best at night | the Gill Harp | Glow: Lantern Lure. Also Cut Strip. | It hums one note along the line. You feel it in your teeth, if you have teeth. |
| ★ | **Emberbrood Snakehead** | Giant snakehead (*Channa micropeltes*) | snakehead | 66–96 | 180 | **epic** | day, dusk | the Puffball Vent | Predator: Glimmer Spoon worked on top. | Keeps a cloud of pink sparks at the surface and dares you near them. |
| ★ | **Festival Puffer** | Freshwater pufferfish (*Pao cochinchinensis*) | puffer | 44–64 | 120 | **epic** | night | the Veilwater | Bottom: Bone Jig. | Puffed, it is the last paper lantern of a festival nobody finished. |
|  | **Lostsea Mackerel** | Chinese seerfish (*Scomberomorus sinensis*) | tuna | 75–105 | 190 | rare | day, dusk | open water | Predator: Glimmer Spoon. | A sea fish that swam upriver and never found the way back. |
|  | **Downcast Catfish** | Mekong giant catfish (*Pangasianodon gigas*) | catfish | 75–105 | 190 | rare | day, dusk | open water | Bottom: Spore Cake under a float. | Its eyes are set low. It has only ever looked where it will sink. |
|  | **Nightbloom Carp** | Giant barb (*Catlocarpio siamensis*) | carp | 71–100 | 180 | rare | night | night water | Bottom: Spore Cake, Spore-Lamp Fly. | By day it is just a carp, and a little embarrassed about it. |
|  | **Threadling Eel** | Mussum (*Synbranchus marmoratus*); Snakefish | eel | 64–86 | 150 | uncommon | any | open water | Spore Cake. | Mostly root, a little fish. Often taken for the Harpstring, for one bad second. |
|  | **Cindertail Catfish** | Asian redtail catfish (*Hemibagrus wyckioides*) | catfish | 55–74 | 130 | uncommon | any | open water | Predator: Cut Strip, Glimmer Spoon. | Its tail is the last coal of a fire it does not remember. |
|  | **Velvet Ray** | Ocellated river stingray (*Potamotrygon motoro*) | disc | 47–63 | 110 | uncommon | any | open water | Bottom: Spore Cake, Bone Jig. | A dozen eyes on its back and none of them work. It watches you with the other two. |
|  | **Falsesmile Barb** | Pacu-like fish | bream | 21–27 | 45 | common | day, dusk | open water | Insect: Spore Cake, Feather Fly. | Looks just like a Smilejaw until it smiles. |
|  | **Netcloud Fry** | Assorted small net fish | minnow | 6.5–8.5 | 14 | common | any | open water | Insect: Feather Fly, Spore Cake. | Caught by the netful. Each one certain it is the exception. |

**Giants of Sporewood Pools:** The Drifting Grove, the giant of *Death Ray* · Harpstring Eel, the giant of *Electric Executioner* · Emberbrood Snakehead, the giant of *Killer Snakehead* · Festival Puffer, the giant of *Mekong Mutilator*.

- **The Drifting Grove.** A round disc nearly as wide as the raft, with a pointed snout tip, small eyes on top, a whip tail with one barbed sting. Plum back with a whole meadow growing on it; cream beneath. The meadow glows amber. *Play:* Leaper. Authored: take, clamp to the bottom, blooming dive, leap, run, blooming dive, lift. Never better than a coin flip. *Haunt:* Crown: the Mother's Cup, the floor of the Grove Well. Sign: the pool's glimmer; the float stops as if set down.
- **Harpstring Eel.** Thick as a mooring rope, with a flat blunt head, no back fin and one long ribbon fin beneath. Plum-dark with a rose throat, and three lit strings down each flank that brighten when it hums. *Play:* Sulker. The line hums before the take. Long coiling holds. Every surge is a jolt: the rod trembles, the lantern flickers, the line slackens. *Haunt:* Old water: the Gill Harp, among the stalks. Mid to deep. Sign: a glow trail at night.
- **Emberbrood Snakehead.** Wick-tall muscular tube, flat plated head, wide toothed jaw, long fins above and below, round tail. Ink body with a broken lavender side band. Its fry are a cloud of nebula-pink sparks. *Play:* Thrasher. Explodes on a surface lure, then bores for the stalks. Violent head-shakes; fouled or snapped. *Haunt:* Old water: the Puffball Vent (a later sheet), among the stalks near the surface. Sign: a ball of pink sparks with a dark shape under it.
- **Festival Puffer.** A puffer the size of a festival lantern: round, blunt, a beak of four fused teeth, small fins, short prickles. Plum back, cream belly, an amber-ringed eye-spot on each flank. Puffed, it glows amber like paper. *Play:* Sulker. Swells and hangs like a bucket of water. Its beak cuts the line: snapped. *Haunt:* Night water: the Veilwater's still shallows. Sign: an amber globe glowing just under the surface.

### 3. Glasswater Vault (built)

*As built: sapphire crystal. New fish in indigo, ice and violet; glows are sapphire, never aqua; the one warm colour is the Wolfwake's tail.*

Places: the Stilled Cascade (day) · the Mirror Nave (old) · the Broken Hymnal (night) · the Fallen Chandelier (crown) · the Well of Ledgers (old, later sheet) · the Bell-Chapel Window (night, later sheet).

| | fish | inspired by | plan | typical | record | rarity | hours | where | favours | journal |
|---|---|---|---|---|---|---|---|---|---|---|
| ★ | **The Glass Sovereign** | Kaluga sturgeon (*Huso dauricus*) | sturgeon | 380 → 435 | 435 | **legendary** | night | the Fallen Chandelier | Its bait only: Prism Moth. | Each scale is a window with no one behind it. |
| ★ | **Prismdrop Sturgeon** | White sturgeon (*Acipenser transmontanus*) | sturgeon | 98–144 | 270 | **epic** | any | the Well of Ledgers | Bottom: Bone Jig, Ember Roe. | Older than the Vault. It leaps to see whether the sky came back. |
| ★ | **Wolfwake Trout** | Taimen (*Hucho taimen*) | trout | 77–112 | 210 | **epic** | dusk, night | the Broken Hymnal | Predator: Moth Popper skated on top; Glimmer Spoon. | The Vault's one warm colour is its tail, and it is leaving. |
| ★ | **Shardspine Eel** | New Zealand longfin eel (*Anguilla dieffenbachii*) | eel | 73–107 | 200 | **epic** | dusk, night | the Mirror Nave | Predator: Mirror Shard, Cut Strip. | A hundred years old and still angry about one of them. |
|  | **Vesper Gar** | Longnose gar (*Lepisosteus osseus*) | gar | 72–101 | 183 | rare | night | night water | Predator: Glimmer Spoon, Moth Popper. | It sang vespers. It only ever sang the one note. |
|  | **Pilgrim Salmon** | Chinook salmon (*Oncorhynchus tshawytscha*) | trout | 59–83 | 150 | rare | dusk | open water | Predator: Ember Roe. | Always going up the river. Never once coming back. |
|  | **Rainglass Darter** | Arctic grayling (*Thymallus arcticus*) | trout | 30–42 | 76 | rare | day, dusk | day water | Insect: Feather Fly. | Carries the last rain on its sail and will not let it dry. |
|  | **Tremor Catfish** | Amur catfish (*Silurus asotus*) | catfish | 55–74 | 130 | uncommon | night | open water | Bottom: Bone Jig, Mire Worms. | The water shivers a moment before it bites. It is sorry about that. |
|  | **Rosefleck Trout** | Lenok (*Brachymystax lenok*) | trout | 43–57 | 100 | uncommon | day, dusk | open water | Insect: Feather Fly. Takes the Glimmer Spoon too. | Blunt-nosed and rose-flecked, like something pressed in a book. |
|  | **Redhome Salmon** | Sockeye salmon (*Oncorhynchus nerka*)‡ | trout | 36–48 | 84 | uncommon | day, dusk | open water | Ember Roe. Rarely takes a lure. | Turns red to go home. Something is usually waiting on the way. |
|  | **Duskbar Salmon** | Chum salmon (*Oncorhynchus keta*) | trout | 50–65 | 109 | common | day, dusk | open water | Predator: Ember Roe, Glimmer Spoon. | Wears the dusk in bars down its side, and is going home in it. |
|  | **Prism Minnow** | Siberian dace (*Leuciscus baicalensis*) | minnow | 15–19.5 | 33 | common | any | open water | Insect: Feather Fly, Glass Larvae. | The first fish of a far river. It is used to being a beginning. |

**Giants of Glasswater Vault:** The Glass Sovereign, the giant of *Russian Killer* · Prismdrop Sturgeon, the giant of *Alaskan Horror*, *Prehistoric Terror* · Wolfwake Trout, the giant of *Mongolian Mauler* · Shardspine Eel, the giant of *Flesh Ripper*.

- **The Glass Sovereign.** A great predatory sturgeon: blunt snout, wide crescent mouth, shark tail, five rows of scutes. Ink-indigo body; every scute a lit sapphire window. It glows from within. *Play:* Leaper. Authored: take, leap, shatter-run, leap, hold, leap, lift. Never better than a coin flip. *Haunt:* Crown: the Fallen Chandelier, the north trench. Sign: a crown of light rising under the float.
- **Prismdrop Sturgeon.** Long shark-tailed fish, shovel snout, four barbels before a toothless tube mouth, five rows of bony scutes. Stone-white body; scutes like chandelier drops, each catching sapphire light. *Play:* Runner. Slow take, long heavy runs, then a full breach clear of the water. Slips free at the raft: spat. *Haunt:* Old water: the Well of Ledgers (a later sheet), the deepest channel. Sign: a huge slow bubble trail; a breach far off.
- **Wolfwake Trout.** Huge long trout with a flat wolf's head and a wide jaw. Slate-indigo back, ink crescents, ice-white belly; tail and lower fins burn candle-red. The tail alone glows amber. *Play:* Thrasher. The loudest take in the Vault, on top. Head-shakes, one run for the snag; thrown hooks. *Haunt:* Night water at the Broken Hymnal: the tail of a rapid. Sign: a V-wake on the surface, then a strike splash.
- **Shardspine Eel.** Thick dark eel, broad head, small eyes, a back fin that starts far forward and runs to the tail. Indigo-black; the fin a crest of sapphire crystal. The crest glows sapphire. *Play:* Thrasher. Bites, then spins on the line. Backs into cracks and knots: fouled or snapped. *Haunt:* Old water after dark: the cracks of the Mirror Nave. Sign: a sapphire glow trail close to the bottom.

### 4. The Pallid Deep (built)

*As built: near-black water, bone, ink and gold, a candle requiem. Three built fish gain real ancestors; one common is added.*

Places: the Bier Barge (day) · the Chain Garden (old) · the Sunken Belfry (night) · the Bottomless (crown) · the Empty Ferry Slip (old, later sheet) · the Long Pier of Names (night, later sheet).

| | fish | inspired by | plan | typical | record | rarity | hours | where | favours | journal |
|---|---|---|---|---|---|---|---|---|---|---|
| ★ | **The Lantern-Swallower** | Bluntnose sixgill shark (*Hexanchus griseus*) | leviathan | 850 → 973 | 973 | **legendary** | night | the Bottomless | Its own bait only: the Last Candle (built). | It swallowed the great lantern. The ember still shows through its six gills. |
|  | **Gilt-Eyed Eel** | European conger eel (*Conger conger*) | eel | 128–172 | 300 | uncommon | any | old water | Predator, as built: Ember Roe, Cut Strip, the Ferryman's Coin. | Two gold coins for eyes, saved for a crossing it keeps putting off. |
|  | **Pallid Wraithfin** | Spotted ratfish (*Hydrolagus colliei*) | ghost | 45–58 | 97 | common | any | open water | Predator, as built; Lumen Moss draws it, as built. | It flies through the dark on two pale wings, looking for a window. |
|  | **Slipknot Eel** | Pacific hagfish (*Eptatretus stoutii*) | eel | 29–37 | 63 | common | any | open water | Bottom: Mire Worms, Bone Jig. | It ties itself in a knot to remember something, and has forgotten what. |

**Giants of The Pallid Deep:** The Lantern-Swallower, the giant of *Killers from the Abyss*.

- **The Lantern-Swallower.** A deep-water shark older than sharks: broad blunt head, one dorsal set far back, a long tail, six gill slits each side. The swallowed lantern's ember glows through the six slits. Bone and ink. *Play:* Legend, a sinker (the built set piece): ember surges, the grasping dark, one long run, a still, a last stand. *Haunt:* The crown: the Bottomless (as built). Six lines of ember-light rising under the raft.

### 5. Rushlight Fen

*A fen of tall lavender rushes above the kingdom's great dam, their seed heads glowing amber like rushlights. Pale birds, black still lanes, and beyond them the pale stone dam with one amber lamp and a black pool at its foot.*

Places: the Reed Lanes (day) · the Run (old) · the Night Lanes (night) · the Dam Foot (crown).

| | fish | inspired by | plan | typical | record | rarity | hours | where | favours | journal |
|---|---|---|---|---|---|---|---|---|---|---|
| ★ | **The Long Thunder** | Vundu catfish (*Heterobranchus longifilis*) | catfish | 228 → 260 | 260 | **legendary** | night | the Dam Foot | Its own bait: the Storm Candle, a ball of tallow soap round a hook. | You feel it before you hear it, and it goes on a long time. |
| ★ | **Packtooth** | African tigerfish (*Hydrocynus vittatus*) | dogtooth | 55–80 | 150 | **epic** | day, dusk | the Run | Predator: Glimmer Spoon. | They hunt as fifty and are caught as one. That is the sad part. |
|  | **Reedwalker Catfish** | African sharptooth catfish (*Clarias gariepinus*) | catfish | 60–80 | 140 | uncommon | dusk, night | night water | Bottom and predator: Cut Strip. It took a steak. | On wet nights it walks between pools. It says the exercise does it good. |
|  | **Foamnest Pike** | African pike (*Hepsetus cuvieri*) | pike | 21–29 | 50 | uncommon | day | day water | Predator: Glimmer Spoon. | It builds a nest of foam in the reeds and guards it. The foam does not thank it. |
|  | **Blushing Bream** | Tilapia (*Coptodon rendalli*)† | bream | 21–27 | 45 | common | day, dusk | open water | Insect and bottom: Mire Worms. | It blushes when lifted. Nobody knows what it did. |
|  | **Hingecreak** | Brown squeaker (*Synodontis zambezensis*) | catfish | 18.5–24 | 40 | common | any | open water | Bottom: Mire Worms. | It creaks like an old sluice hinge. It is the only one on the dam still working. |
|  | **Basket Fry** | Small fish | minnow | 6–7.5 | 13 | common | day | open water | Insect: Mire Worms, Feather Fly. | It likes to be caught by the basketful, by people who are laughing. It misses them. |

**Giants of Rushlight Fen:** The Long Thunder, the giant of *Congo Killer*, *Invisible Executioner* · Packtooth, the giant of *Pack of Teeth*, *Africa's Deadliest*.

- **The Long Thunder.** A long heavy catfish with a flat bony shield of a head, eight pale whiskers forked like lightning, a low fin the length of its back and a second fatty one. Storm-violet above, pale stone below. *Play:* Runner. A slow take under the wall, then long stubborn runs along the dam, towing the raft. Deep holds. A last stand at the raft. *Haunt:* The crown: the Dam Foot, the black pool under the dam wall. Bottom. Sign: a long bubble trail; a boil against the wall.
- **Packtooth.** A lean silver hunter as long as the Wick is tall, ruled with ink lines from gill to tail, with meshing dagger teeth and a forked tail lit ember-orange. They run fifty together. *Play:* Leaper. A slashing take just under the surface. Leaps at once and again, shaking. Most losses are a thrown hook on the first leap. *Haunt:* Old water: the Run, where the reed lanes funnel into one channel. Surface. Sign: nervous water. Over the Run, pale birds wheel above it.

### 6. The Thin Water

*Below a broken royal weir the river lies a hand deep over pale sand for miles, the nebula pink on it, reed islands in lavender. At the weir, white water lit amber by one sluice lamp. Rays lie on the sand like the shadows of moons.*

Places: the Marsh Lanes (day) · the Broken Weir (old) · the Lamp Ford (night) · the Moonbed (crown).

| | fish | inspired by | plan | typical | record | rarity | hours | where | favours | journal |
|---|---|---|---|---|---|---|---|---|---|---|
| ★ | **The Buried Moon** | Short-tailed river stingray (*Potamotrygon brachyura*) | disc | 255 → 290 | 290 | **legendary** | day, dusk | the Moonbed | Her own bait: the Lamp Snail. | A moon that comes down to see the water and stays for the sand. Nobody can talk her back. |
| ★ | **Weirflame** | Golden dorado (*Salminus brasiliensis*) | dogtooth | 60–88 | 165 | **epic** | day, dusk | the Broken Weir | Predator: Glimmer Spoon, Feather Fly. | It jumps the weir every dusk to see if upstream is still there. It is. It checks again. |
|  | **Blotback Catfish** | Spotted sorubim (*Pseudoplatystoma corruscans*); Surubi catfish | catfish | 57–80 | 145 | rare | night | night water | Predator: Cut Strip, Moth Popper. | Blotted like a page someone gave up on. It has a spine for anyone who says so. |
|  | **Slipwhisker** | Pati catfish (*Luciopimelodus pati*) | catfish | 44–59 | 103 | uncommon | dusk, night | open water | Bottom: Cut Strip, Mire Worms. | Smooth as a wet step. Most people meet it the same way. |
|  | **Thorntail Ray** | Freshwater stingray, a kind new to him; River stingrays on a multi-hook line; River stingray | disc | 31–41 | 72 | uncommon | dusk, night | open water | Bottom: Mire Worms. | No sting, only thorns. It is not sure this is an improvement. |
|  | **Grumbleplate** | Armoured catfish (*Pterodoras granulosus*) | catfish | 30–40 | 70 | uncommon | any | open water | Bottom: Mire Worms, Bone Jig. | It grumbles when lifted, like Murk before his tea. |
|  | **Frostfleck Nipper** | Palometa | bream | 16–22 | 38 | uncommon | any | open water | Predator: Cut Strip. | It bites in cold water too. It wants that known. |
|  | **Coinback Ray** | Freshwater stingray (*Potamotrygon falkneri*) | disc | 41–53 | 90 | common | any | open water | Bottom: Mire Worms, Bone Jig. | Coins on its back and not one to spend. Murk feels for it. |
|  | **Inkthumb** | Boga (*Leporinus obtusidens*) | minnow | 32–41 | 70 | common | day | day water | Bottom and insect: Mire Worms. | Three thumbprints on each side. Someone is always trying to hold on to it. |
|  | **Flatbill Catfish** | Mandube catfish | catfish | 23–30 | 50 | common | dusk, night | open water | Predator: Cut Strip, Glimmer Spoon. | A face like a spoon. It knows all the jokes. |

**Giants of The Thin Water:** The Buried Moon, the giant of *Silent Assassin* · Weirflame, the giant of *River of Blood*.

- **The Buried Moon.** A round disc wider than the raft and thick as a mattress, with a short stout tail. Pale stone, ringed with dusk like a moon's seas. She glows faintly through the sand she lies under. *Play:* Sulker. A flat slide, then she seals herself to the bottom. The longest holds in the game, slow heavy runs, the raft towed. *Haunt:* The crown: the Moonbed, the one deep pan in the shoals. Bottom, under sand. Sign: a pale round glow under the sand, and a dome when she lifts.
- **Weirflame.** A thick-shouldered hunter with a big blunt head, a tight row of teeth and a black bar through the tail. Every scale is candle-gold: the one warm thing in the white water. *Play:* Leaper. Hits at full speed in the white water. Leap after leap, then runs for the rocks. Losses: thrown hooks, lines fouled on stone. *Haunt:* Old water: the Broken Weir, in the fast white water under the sill. Surface to mid. Sign: strike splashes, and small fish spraying out of the foam.

### 7. Lampmoss Slough

*A drowned millstream that barely moves, under dead trees hung with stone-white lamp-moss. Violet-dusk water, lavender haze, amber fireflies caught in the moss, nebula-pink lilies; green only as a trace on the pads. A straight stone canal, a broken weir, a drowned lock gate, a log that is not a log.*

Places: the Straight Canal (day) · Under the Weir (old) · the Lock Gate (night) · the Sentry's Reach (crown).

| | fish | inspired by | plan | typical | record | rarity | hours | where | favours | journal |
|---|---|---|---|---|---|---|---|---|---|---|
| ★ | **The Last Sentry** | Alligator gar (*Atractosteus spatula*) | gar | 265 → 305 | 305 | **legendary** | day, dusk | the Sentry's Reach | His bait only: a Carp Cutlet (a new legend bait). | Still at his post in full mail. Nobody told him the kingdom drowned. |
| ★ | **Weirshadow Catfish** | Blue catfish (*Ictalurus furcatus*) | catfish | 60–88 | 165 | **epic** | any | Under the Weir | Predator: Cut Strip. | Lives in the push of the water, leaning on it like a door. |
| ★ | **Old Portcullis** | Flathead catfish (*Pylodictis olivaris*) | catfish | 56–83 | 155 | **epic** | night | the Lock Gate | Bottom: Bone Jig, lowered into the den. | It has not let anyone through since the Fall. |
|  | **Lampspot Snakehead** (from Pyrefall Gorge) | Bullseye snakehead (*Channa marulius*) | snakehead | 59–83 | 150 | rare | day, dusk | open water | Predator: Glimmer Spoon, Cut Strip. | Carries one small lamp on its tail, for whoever is following. |
|  | **Spotmail Gar** | Florida gar (*Lepisosteus platyrhincus*)† | gar | 56–76 | 132 | uncommon | day | day water | Predator: Glimmer Spoon, Cut Strip. | A small sentry in spotted mail, guarding a canal nobody wants. |
|  | **Tailwatch Mudfish** | Bowfin (*Amia calva*) | snakehead | 46–62 | 109 | uncommon | any | open water | Predator: Cut Strip, Glimmer Spoon. | Keeps one painted eye on where it has been. |
|  | **Startle Carp** | Silver carp (*Hypophthalmichthys molitrix*) | carp | 64–83 | 140 | common | day, dusk | open water | No bait moves it much. Insect family, weakly: Feather Fly. | The sound of oars sends the whole shoal into the air. |
|  | **Scrapwhisker Catfish** | Channel catfish (*Ictalurus punctatus*) | catfish | 55–71 | 120 | common | any | open water | Bottom: Mire Worms, Bone Jig. | Eats anything that falls in. Considers this a philosophy. |
|  | **Hearsay Sunfish** | Bluegill (*Lepomis macrochirus*)† | bream | 19–24 | 41 | common | day | open water | Insect: Feather Fly, Mire Worms. | Named for the sun. It has only heard of it. |

**Giants of Lampmoss Slough:** The Last Sentry, the giant of *Alligator Gar*, *Prehistoric Terror* · Weirshadow Catfish, the giant of *American Killers* · Old Portcullis, the giant of *American Killers*.

- **The Last Sentry.** A raft-long armoured cylinder in diamond mail, a broad alligator snout with two rows of teeth, fins far back by a round tail. Stone-white and slate; each scale edged candle-amber. No glow. *Play:* Leaper. Authored: slow take, carry, run, tail-walk, gill-rattle, last stand, lift. Bony jaw throws hooks. Never better than a coin flip. *Haunt:* Crown: the Sentry's Reach, the widest bend. Sign: a log that rolls over and gulps air.
- **Weirshadow Catfish.** Heavy humped catfish, small head, eight whiskers, a deeply forked tail and a long straight-edged fin beneath. Slate-blue fading to ivory, unspotted. No glow. *Play:* Runner. Takes and goes with the current in one long run, then holds broadside in the flow. Spooled. *Haunt:* Old water under the broken weir, in the hard current. Sign: a boil that does not drift.
- **Old Portcullis.** Wide flattened head with a jutting lower jaw, small eyes, square tail. Mottled rust and ink; whiskers hang like a broken portcullis. No glow. *Play:* Sulker. Will not leave its den: long still holds among the chains, then one surge. Fouled or snapped. *Haunt:* Night water: one den in the drowned lock gate. Sign: a slow breath of silt from the door.

### 8. Pyrefall Gorge

*A river stepping down a gorge of stone-white rock. On every step a floating pyre gutters candle amber; ash drifts like snow through violet dusk; temple stairs walk down into the water. The head of the river that feeds the Pallid Deep.*

Places: the Alms Steps (day) · the Coin Run (old) · the Boulder Garden (night) · the Last Pyre (crown).

| | fish | inspired by | plan | typical | record | rarity | hours | where | favours | journal |
|---|---|---|---|---|---|---|---|---|---|---|
| ★ | **The Ashen Guest** | Goonch catfish (*Bagarius yarrelli*) | catfish | 245 → 280 | 280 | **legendary** | night | the Last Pyre | Her bait only: a Charred Offering (a new legend bait). | Uninvited to every funeral. Never once absent. |
| ★ ‡ | **The Unfinished** | Sareng catfish (*Wallago attu*)‡ | catfish | 64–94 | 175 | **epic** | night | the Boulder Garden | Predator: Cut Strip. | Everyone in the gorge has a story about it. None has an ending. |
| ★ | **Pyregold Carp** | Golden mahseer (*Tor putitora*) | carp | 62–91 | 170 | **epic** | day, dusk | the Coin Run | Predator: Glimmer Spoon. Small ones rise to the Feather Fly. | Every scale is a coin someone left on the water. It kept them all. |
|  | **Lampspot Snakehead** | Bullseye snakehead (*Channa marulius*) | snakehead | 59–83 | 150 | rare | day, dusk | open water | Predator: Glimmer Spoon, Cut Strip. | Carries one small lamp on its tail, for whoever is following. |
|  | **Almsfed Carp** | Rohu (*Labeo rohita*) | carp | 51–69 | 120 | uncommon | day, dusk | day water | Bottom: Mire Worms, Bone Jig. | Fed at funerals so long it thinks every splash is kindness. |
|  | **Puddle Snakehead** | Snakehead | snakehead | 13–16.5 | 28 | common | any | open water | Predator: any small bait. | Can live in a footprint full of rain. Has. |
|  | **Pipsqueak Catfish** | Tengara catfish (*Mystus tengara*) | catfish | 8.5–10.5 | 18 | common | any | open water | Bottom: Mire Worms. | Squeaks when lifted, as if someone should be told. |

**Giants of Pyrefall Gorge:** The Ashen Guest, the giant of *Killer Catfish*, *The Lost Reels: Himalayan Giant*; the one that got away in *Return of the Killer Catfish* · The Unfinished, the one that got away in *Asian Slayer* · Pyregold Carp, the giant of *The Lost Reels: Himalayan Giant*.

- **The Ashen Guest.** A man-long catfish like a river boulder: wide flat head, tiny eyes, a mouth of backward teeth, eight whiskers, fins trailing long threads. Mottled stone-white and ash, flecked ember-amber. No glow. *Play:* Sinker. Authored: take, still as a rock, a long tow downstream, hold, last stand, lift. Fouls on rock. Never better than a coin flip. *Haunt:* Crown: the pool below the Last Pyre, in the push of the current. Sign: ash on the water circling the wrong way.
- **The Unfinished.** Long silver blade of a catfish: a mouth that opens past the eyes, rows of teeth, two long whiskers, a fin running the whole belly, forked tail. Silver, ink back. No glow. *Play:* Thrasher. A slashing take, then it bites through or cuts the line on rock. The hardest play in the gorge: it lands less often than any fish but a legend. Snapped. *Haunt:* Night water: the Boulder Garden, slack water behind rocks. Sign: bait fish spraying from the surface.
- **Pyregold Carp.** Long powerful carp, thick fleshy lips, four barbels, huge scales each the size of a coin. Candle-amber gold, ink back, rose-gold fins. The scales catch light; no glow. *Play:* Runner. The longest first run in the game, straight down the rapid. Tests the reel: spooled. *Haunt:* Old water: the Coin Run, the tongue of the rapid. Sign: a gold flash turning in white water.

### 9. The Thunder Stair

*The kingdom's stair of locks, broken: a river falls down pale stone steps in a roar. Spray hangs nebula pink; heat lightning in violet cloud, no rain. Amber signal lamps still burn on two lock towers.*

Places: the Step Pools (day) · the Cauldron (old) · the Soap Landing (night) · the Throat (crown).

| | fish | inspired by | plan | typical | record | rarity | hours | where | favours | journal |
|---|---|---|---|---|---|---|---|---|---|---|
| ★ | **The Last Lock** | Goliath tigerfish (*Hydrocynus goliath*) | dogtooth | 262 → 300 | 300 | **legendary** | day, dusk | the Throat | Its own bait: the Wired Bream, a whole bait fish on wire. | Thirty-two teeth and none of them hidden. Nothing passes the lock. |
| ★ | **Lampeye Perch** | Nile perch (*Lates niloticus*) | perch | 67–99 | 185 | **epic** | dusk, night | the Cauldron | Predator: Cut Strip, fished as a live bait; Glimmer Spoon worked deep. | Its eyes keep the light after the lamp has gone. It is not giving it back. |
| ★ | **Soapthief** | Kamba catfish (*Chrysichthys cranchii*) | catfish | 58–86 | 160 | **epic** | night | the Soap Landing | Bottom: Tallow Soap (a new bait). It was caught on soap. | It eats soap and candle ends. The Wick keeps its feet out of the water here. |
|  | **Cocoon Sleeper** | Lungfish (*Protopterus aethiopicus*)† | eel | 72–97 | 170 | uncommon | any | open water | Bottom: Mire Worms, Cut Strip. Villagers took it on a palm nut. | It sleeps through the dry years in a jacket of mud. It always asks what year it is. |
|  | **Swallowtail Catfish** | Semutundu catfish (*Bagrus docmak*) | catfish | 47–63 | 110 | uncommon | dusk, night | open water | Predator: Cut Strip, Glimmer Spoon. | It bites best in thunder. Nobody else wants to be out. |
|  | **Cradlemouth Bream** | Nile tilapia (*Oreochromis niloticus*) | bream | 28–36 | 60 | common | day | day water | Insect and bottom: Mire Worms. | It carries its young in its mouth. Never ask it a question in spring. |
|  | **Sidepool Snakehead** | Obscure snakehead (*Parachanna obscura*)† | snakehead | 23–30 | 50 | common | any | day water | Predator: Cut Strip. | The river forgets its side pools. The snakehead does not. |
|  | **Stairhopper** | Kaki (*Steatocranus casuarius*) | perch | 7–9 | 15 | common | day | open water | Insect: Mire Worms. | It climbs the stair one hop at a time. The bump is from the last step. |

**Giants of The Thunder Stair:** The Last Lock, the giant of *Demon Fish* · Lampeye Perch, the giant of *Rift Valley Killers* · Soapthief, the giant of *Congo Killer*.

- **The Last Lock.** A huge pewter-silver hunter, salmon-shaped, with thirty-two dagger teeth that mesh outside its shut jaws. Scales like shields, fins flushed ember, a deep forked tail. An amber glint behind every tooth. *Play:* Leaper. Hits in the heaviest water, hard enough to cut a bait in half. Blistering runs down the chute, leaps, head-shakes. Throws hooks, snaps lines. *Haunt:* The crown: the Throat, the main chute of the rapids. Mid-water, in the fastest current. Sign: one great strike splash; a bait that comes back as half a fish.
- **Lampeye Perch.** A humped silver-violet perch with a dished forehead, a mouth like a bucket and a round tail. Its eyes take in lantern light and give it back amber, long after. *Play:* Thrasher. A thump under the falls and a deep heavy run. Then up to the top, gills flared, shaking its whole head. *Haunt:* Old water: the Cauldron, the deep pool under the falls. Deep. Sign: a boil.
- **Soapthief.** A big-headed, wide-mouthed catfish the yellow of old tallow, dusk on the back, with short thick whiskers and a tall first fin. *Play:* Sinker. Mouths the bait a long while, then a deep rolling pull and stubborn holds. Heavy for its length. *Haunt:* Night water: the Soap Landing, the washing steps below the stair. Bottom. Sign: slow nibbles and a bubble trail.

### 10. The Inkwood

*The kingdom's orchard forest, drowned to its crowns. Tea-black mirror water between violet-dusk trunks, curtains of pale roots, nebula-pink blossom on the surface, amber lantern-gourds that still ripen and drop in. Leaves are plum and dusk, never green.*

Places: the Windfall (day) · the Kitchen Stair (old) · Rootgate Creek (night) · the Breathing Mere (crown) · the Overhang (old, later sheet).

| | fish | inspired by | plan | typical | record | rarity | hours | where | favours | journal |
|---|---|---|---|---|---|---|---|---|---|---|
| ★ | **The Banked Fire** | Arapaima (*Arapaima gigas*); Arapaima | pike | 325 → 370 | 370 | **legendary** | day, dusk | the Breathing Mere | Its own bait: the Blossom Fly, fished on the surface. | It must come up for air, like any fire. It burns low and waits for morning. |
| ★ | **Emberbelly** | Red-bellied piranha (*Pygocentrus nattereri*) | bream | 62–91 | 170 | **epic** | day, dusk | the Kitchen Stair | Predator: Cut Strip above all; Glimmer Spoon. | It still waits under the kitchen steps for scraps. It is owed a hundred years of seconds. |
| ★ | **Nightcreek Hound** | Anjumara (*Hoplias aimara*) | dogtooth | 47–70 | 130 | **epic** | night | Rootgate Creek | Predator: Cut Strip; a Moth Popper worked along the bank. | It bites the bait, the line, the raft and the dark. It is not angry. It is thorough. |
| ★ | **Smilejaw Bream** | Red-bellied pacu (*Piaractus brachypomus*) | bream | 42–61 | 115 | **epic** | day, dusk | the Overhang | A fruit bait: the Windfall Plum, dropped where the gourds fall. Ignores lures. | Smiles with a full set of teeth. Nobody has ever smiled back. |
|  | **Gourdcracker** | Tambaqui (*Colossoma macropomum*) | bream | 43–60 | 108 | rare | day, dusk | day water | A fruit bait (new: Windfall Plum). Spore Cake does in its place. | Teeth like a person and the patience of a tree. It waits for the fruit to fall. |
|  | **Starback Ray** | Spotted river stingray (*Potamotrygon henlei*) | disc | 43–57 | 100 | uncommon | any, best at night | open water | Bottom: Bone Jig, Mire Worms. | A piece of the night sky that lies on the bottom and will not get up. |
|  | **Windowtail Perch** | Butterfly peacock bass (*Cichla ocellaris*) | perch | 31–42 | 74 | uncommon | day | open water | Predator at the surface: Feather Fly, Glimmer Spoon. | It wears a lit window on its tail, so that whatever follows it bites the wrong end. |
|  | **Inkside Nipper** | Black piranha (*Serrasalmus rhombeus*) | bream | 22–30 | 52 | uncommon | any | open water | Predator: Glimmer Spoon, Cut Strip. | One red eye each side, like a raft's lamps from below. It knows a lot of rafts. |
|  | **Ditch Hound** | Trahira (*Hoplias malabaricus*) | dogtooth | 25–33 | 55 | common | any | open water | Predator: Cut Strip. Cut it and it is good bait itself. | Lives in a ditch. Dreams of a creek. Bites like both. |
|  | **Petal Bream** | Pink pacu | bream | 19.5–25 | 42 | common | day | open water | Insect and fruit: Feather Fly, Windfall Plum. | It eats the blossom that falls on the water. Somebody has to tidy up. |
|  | **Gourdseed Minnow** | Small bait fish | minnow | 8.5–10.5 | 18 | common | any | open water | Insect: Mire Worms, Feather Fly. It cuts into good strips. | The bottom of every food chain in the Inkwood. It bears this well. |

**Giants of The Inkwood:** The Banked Fire, the giant of *Amazon Assassins*, *Lair of Giants*, *Body Snatcher*, *The Lost Reels: Amazonian Giant* · Emberbelly, the giant of *Piranha*, *Face Ripper* · Nightcreek Hound, the giant of *Jungle Killer* · Smilejaw Bream, the giant of *The Mutilator*.

- **The Banked Fire.** Three metres of armour. A flat bone-plated head, an upturned mouth, back fins bunched into a paddle at the tail. Dusk-pewter scales rimmed in ember, brighter toward the tail. Amber glow under the gill plates. *Play:* Leaper. Gulps the bait off the surface. Long runs across the mere, heavy breaches, head-shakes at the raft. Comes up to breathe mid-play. Throws hooks. *Haunt:* The crown: the Breathing Mere, a hidden pond behind the root curtains. Surface. Sign: a slow boil and a loud sigh every few minutes, where it comes up for air.
- **Emberbelly.** A deep disc as long as the Wick is tall. A blunt bulldog face and an underslung jaw with one row of triangle teeth. Pewter flanks flecked like starlight. A belly the red of a live coal. *Play:* Thrasher. The float chatters, then goes. Tight circles and sawing head-shakes while the pack boils round it. Losses are bitten-through lines: snapped. *Haunt:* Old water: the Kitchen Stair, the scullery steps of a drowned stilt village. Mid-water. Sign: nervous water that seems to boil.
- **Nightcreek Hound.** A log with a face. A round ink-violet body, a blunt bulldog head, dog teeth that never quite close, a round paddle tail. Pale amber eyes that hold the lantern. *Play:* Thrasher. Slams the bait under the bank. Short brutal surges, head-shakes, dives for the roots and wraps. Losses are snapped or fouled lines. *Haunt:* Night water: Rootgate Creek, the narrow run under the little fall. Shallow, tight to the bank. Sign: one heavy strike splash by the roots.
- **Smilejaw Bream.** Deep round flat-sided fish, small head, and a full set of square, human-looking teeth. Plum-slate back, rose-red belly and breast, ink-edged fins. No glow. *Play:* Thrasher. Short crushing surges in tight circles. Bites through line and straightens hooks at the lift: snapped or spat. *Haunt:* Old water: the Overhang (a later sheet), deep water under the fruiting boughs, where things fall in. Mid-water. Sign: a loud plop, then a crunch.

### 11. The Siltway

*The kingdom's barge road: a slow wide river the colour of candle tallow under violet dusk. Sunk barges, one ferry with a lamp still lit under water, pale stone mile-posts. Along one line amber water runs beside ink water and does not mix.*

Places: the Seam (day) · the Sunk Ferry (old) · the Lamp Bar (night) · the Long Hole (crown).

| | fish | inspired by | plan | typical | record | rarity | hours | where | favours | journal |
|---|---|---|---|---|---|---|---|---|---|---|
| ★ | **The Barge-Shadow** | Piraíba (*Brachyplatystoma filamentosum*) | catfish | 300 → 345 | 345 | **legendary** | night | the Long Hole | Its own bait: the Bargeman's Supper, a whole salted fish on tarred cord. | It follows the last barge down the road. The barge sank long ago. It follows anyway. |
| ★ | **Dapplewheel Ray** | Discus ray (*Paratrygon aiereba*) | disc | 73–107 | 200 | **epic** | night | the Lamp Bar | Bottom: Bone Jig, Cut Strip. | Round as a wheel and dappled like shade. It has never been anywhere it could not roll. |
| ★ | **Sternlamp Catfish** | Redtail catfish (*Phractocephalus hemioliopterus*) | catfish | 66–96 | 180 | **epic** | any, best at night | the Sunk Ferry | Bottom: Cut Strip, Bone Jig. | It keeps one red lamp lit at the stern, as barges do. Nobody tells it the barges stopped. |
|  | **Millstone Catfish** | Jau catfish (*Zungaro zungaro*) | catfish | 59–83 | 150 | rare | dusk, night | open water | Bottom: Cut Strip, Bone Jig. | It does not fight. It declines. |
|  | **Tallyside Catfish** | Tiger sorubim (*Pseudoplatystoma tigrinum*) | catfish | 51–72 | 130 | rare | night | night water | Predator: Cut Strip, Moth Popper. | Each bar on its side is a barge it counts through. It loses count and keeps the bars. |
|  | **Snufferjaw** | Payara (*Hydrolycus armatus*) | dogtooth | 47–66 | 120 | rare | day, dusk | day water | Predator: Glimmer Spoon, Cut Strip. | Two long teeth, shaped for putting out small lights. It looks at the Wick kindly. |
|  | **Gill Lodger** | Candiru (*Vandellia cirrhosa*) | eel | 6.5–9.5 | 17 | rare | any | open water | Nothing. Land a big catfish and look. | It lodges in the gills of bigger fish and pays no rent. Murk says he knows the type. |
|  | **Boathook Catfish** | Ripsaw catfish (*Oxydoras niger*) | catfish | 43–57 | 100 | uncommon | any | open water | Bottom: Mire Worms, Bone Jig. | It catches more nets than nets catch it. |
|  | **Waxcomb Ray** | Smoothback river stingray (*Potamotrygon orbignyi*) | disc | 36–49 | 85 | uncommon | any | open water | Bottom: Mire Worms, Bone Jig. | Patterned like honeycomb. Somebody down here still remembers bees. |
|  | **Hullknock Perch** | Basha (*Cynoscion acoupa*) | perch | 34–46 | 80 | uncommon | dusk, night | open water | Predator: Cut Strip, Glimmer Spoon. | It knocks twice on the hull at dusk. Nobody is ever in. |
|  | **Silkwhisker** | Barbado (*Pinirampus pirinampu*) | catfish | 41–53 | 90 | common | night | open water | Bottom: Mire Worms, Cut Strip. | Its whiskers are longer than it is. It trips on them and pretends it did not. |
|  | **Bareface Catfish** | Fidalgo catfish (*Ageneiosus inermis*) | catfish | 28–36 | 60 | common | day, dusk | day water | Predator: Glimmer Spoon, Cut Strip. | No whiskers. It gets by on mouth. |
|  | **Vigil Catfish** | Piracatinga (*Calophysus macropterus*) | catfish | 23–30 | 50 | common | any | open water | Bottom: Cut Strip. | It comes to whatever sinks and stays to the end. Someone should. |
|  | **Lacework Catfish** | Catfish | catfish | 19.5–25 | 42 | common | night | open water | Bottom: Mire Worms. | Far too pretty for the bottom of a river. It goes back there anyway. |
|  | **Tallow Borer** | Candiru-açu (*Cetopsis candiru*) | catfish | 14–18 | 30 | common | any | open water | Bottom: Cut Strip. | It turns as it bites, like a key. It opens worse things than your bait. |

**Giants of The Siltway:** The Barge-Shadow, the giant of *Amazon Flesh Eaters*, *Amazon Apocalypse*, *Man-Eating Monster* · Dapplewheel Ray, the giant of *Colombian Slasher* · Sternlamp Catfish, the giant of *Amazon Apocalypse*.

- **The Barge-Shadow.** Three metres of grey, shark-shaped catfish. A wide flat head, whiskers as long as the raft, a deep forked tail whose tips trail into threads. Dusk-slate above, pale stone below, small candle-yellow eyes. *Play:* Runner. A slow take, then one unstoppable run down the channel that tows the raft. Long holds on the bottom. A head-shake at the lift. *Haunt:* The crown: the Long Hole, the deepest cut of the channel. Bottom. Sign: a faint still ring, and a dome when it turns.
- **Dapplewheel Ray.** An almost perfect round disc wider than the Wick is tall, plum-dark and dappled like a forest floor, with a thread of a tail and two small close-set eyes. *Play:* Sulker. Takes a bait on the sand after dark and clamps to the bottom. Long holds, one slow run, a heavy lift that bends the rod to the water. *Haunt:* Night water: the Lamp Bar, on the sand under the leaning lamp. Bottom. Sign: a pale round print and a puff of silt.
- **Sternlamp Catfish.** A broad flat head a third of its length, long whiskers, a dusk-slate back over a pale stone side band, and a tail lit ember-red like a barge's stern lamp. It grunts when lifted. *Play:* Sinker. Takes hard and bores straight back into the sunken timber. Heavy bulldog surges; it wraps the line. Half its losses are fouled. *Haunt:* Old water: the Sunk Ferry and its drift timber. Bottom, in the wood. Sign: a bubble trail by day, a glow trail at night.

### 12. The Salt Gate

*The kingdom's sea-gate, left open: drowned sluices, a harbour stair going down into violet tide water, pale stone quays, the stump of a harbour light still amber, and inside the gate a drowned shipyard where the ribs of unfinished hulls stand in the water.*

Places: the Bar (day) · the Sluice Throat (old) · the Harbour Stump (night) · the Slipway (crown) · the Turning Tide (night, later sheet).

| | fish | inspired by | plan | typical | record | rarity | hours | where | favours | journal |
|---|---|---|---|---|---|---|---|---|---|---|
| ★ | **The Old Shipwright** | Largetooth sawfish (*Pristis pristis*) | sawfish | 610 → 700 | 700 | **legendary** | dusk, night | the Slipway | His bait only: a Tide Mullet (a new legend bait). | Still cutting ribs for a fleet that will never sail. |
| ★ | **Sweetwater Shark** | Bull shark (*Carcharhinus leucas*) | shark | 146–214 | 400 | **epic** | dusk, night | the Sluice Throat | Predator: Cut Strip first, then Ember Roe. | A sea thing that learned to love fresh water. It is not loved back. |
| ★ | **Tideghost Shark** | Northern river shark (*Glyphis garricki*) | shark | 109–160 | 300 | **epic** | night | the Turning Tide | Predator: Cut Strip. Lights and lures do nothing. | Hunts where nothing can be seen, and has never been seen doing it. |
| ★ | **Inkmarble Eel** | Giant mottled eel (*Anguilla marmorata*) | eel | 73–107 | 200 | **epic** | night | the Harbour Stump | Predator: Cut Strip. | Marbled like the endpapers of a book nobody opens. |
|  | **Longlash Ray** | Freshwater whipray (*Urogymnus dalyensis*) | ray | 110–155 | 280 | rare | any | open water | Bottom: Bone Jig, Cut Strip. | Wears the river bed as a blanket, pulled up to the eyes. |
|  | **Dusk Drummer** | Dusky kob (*Argyrosomus japonicus*)† | perch | 71–100 | 180 | rare | night | night water | Predator: Cut Strip, Moth Popper. | It drums for the tide every evening. The tide comes. It takes the credit. |
|  | **Old Breather** | Queensland lungfish (*Neoceratodus forsteri*) | snakehead | 59–83 | 150 | rare | dusk, night | open water | Bottom: Mire Worms, Bone Jig. | Comes up once an hour, sighs, and goes back to remembering. |
|  | **Embereye Bass** | Barramundi (*Lates calcarifer*) | perch | 77–103 | 180 | uncommon | dusk, night | open water | Predator: Glimmer Spoon, Cut Strip. | Its eyes catch your lantern and keep a little of it. |
|  | **Kitewing Ray** | Backwater butterfly ray (*Gymnura natalensis*) | ray | 68–92 | 160 | uncommon | day, dusk | open water | Bottom: Mire Worms, Bone Jig. | Mostly wing. It flies the tide like a kite nobody is holding. |
|  | **Creekling Shark** | Unidentified small shark | shark | 64–86 | 150 | uncommon | any | open water | Predator: Glimmer Spoon, Cut Strip. | Even the scholars could not name it. It answers to nothing, gladly. |
|  | **Tidetable Ray** | Bluespotted stingray (*Neotrygon kuhlii*) | ray | 30–40 | 70 | uncommon | any, best at night | open water | Bottom and glow: Lantern Lure, Mire Worms. | Small blue lights in rows, lit at high water. It still keeps the tide table. |
|  | **Sandblower** | Spotted grunter (*Pomadasys commersonnii*) | perch | 39–50 | 85 | common | day, dusk | day water | Bottom: Mire Worms. | It blows the sand away to find its supper, tail waving at the sky. Dignity can wait. |
|  | **Brinewhisker** | White sea catfish (*Galeichthys feliceps*) | catfish | 25–33 | 55 | common | any | open water | Bottom: Cut Strip, Mire Worms. | The fathers hold the eggs in their mouths for weeks and eat nothing. Lift one gently. |
|  | **Saltroot Bream** | Bream and other bait fish† | bream | 18.5–24 | 40 | common | any | open water | Insect: Mire Worms, Feather Fly. | Thrown back by better anglers than you. It bears no grudge. |

**Giants of The Salt Gate:** The Old Shipwright, the giant of *Chainsaw Predator* · Sweetwater Shark, the giant of *Freshwater Shark*, *Hidden Predator*, *American Killers* · Tideghost Shark, the giant of *Phantom Assassin* · Inkmarble Eel, the giant of *South Pacific Terrors*.

- **The Old Shipwright.** A shark-tailed ray as long as two rafts, flat head and wings, and a long flat saw with twenty teeth a side. Stone-white and slate; every saw tooth tipped candle-amber. No glow. *Play:* Thrasher. Authored: tap, weight, saw-slashes side to side, long tow, still on the bottom, last stand, lift alongside. Never better than a coin flip. *Haunt:* Crown: the Slipway, among the ribs of unfinished hulls. Sign: a row of amber points sweeping under the surface.
- **Sweetwater Shark.** A thick, blunt-snouted shark with small eyes, a broad back fin and wide pectoral wings. Dusk-violet above, pale stone below, ink fin edges. Broken wire leaders trail from her jaw, their old hooks glinting amber. *Play:* Runner. A slow take, then she tows the raft upriver against the tide: the longest runs in the water. Head-shakes at the raft. Losses are bitten-through or spooled lines. *Haunt:* Old water: the Sluice Throat, where the tide pushes in past the broken sluices. Mid-water. Sign: a wide slow wake against the tide; the small fish stop rising.
- **Tideghost Shark.** Stocky shark with a broad blunt snout and eyes no bigger than seeds; the second back fin almost as tall as the first. Lavender-grey above, ivory below. No glow at all. *Play:* Sinker. Stays deep and never shows: no glimpses before the reveal. Heavy, steady, strange. Tests the line. *Haunt:* Night water: the Turning Tide (a later sheet), the murkiest reach. Sign: none. The float simply goes.
- **Inkmarble Eel.** Eel half again as long as the Wick, thick as an arm, broad blunt head. Stone-white skin marbled all over with ink, like a book's endpapers. No glow. *Play:* Sulker. Backs into its hole and ties itself in knots; long holds, sudden rolls. Fouled. *Haunt:* Night water: the rock holes under the Harbour Stump. Sign: a slow swirl at a hole mouth.

### 13. Lanternroot Lagoon

*A drowned orchard standing in brackish water on arched roots. Stilt houses hang paper lanterns low: candle amber on glass-calm dusk water. Pale sand flats, ankle deep, lavender under the stars; blossom drifts nebula pink.*

Places: the Bright Flats (day) · the Sunken Orchard (old) · the Stilt Shrine (night) · the Sighing Pool (crown) · the Monsoon Cut (night, later sheet).

| | fish | inspired by | plan | typical | record | rarity | hours | where | favours | journal |
|---|---|---|---|---|---|---|---|---|---|---|
| ★ | **The Silver Regent** | Atlantic tarpon (*Megalops atlanticus*) | minnow | 310 → 360 | 360 | **legendary** | day, dusk | the Sighing Pool | Her own bait only (a new legend bait: a Moth-Wing Fly). | She rolls at the surface to sip the air, and the whole lagoon hears her sigh. |
| ★ | **Votive Shark** | Grey reef shark (*Carcharhinus amblyrhynchos*) | shark | 80–118 | 220 | **epic** | night | the Stilt Shrine | Predator: Cut Strip first, then Ember Roe or the Glimmer Spoon. | The stilt village feeds it and asks nothing. It is not sure it likes being loved. |
| ★ | **Rootjaw Catfish** | Tapah (*Wallagonia leerii*) | catfish | 73–107 | 200 | **epic** | night | the Monsoon Cut | Predator: Cut Strip. | Lengthwise it just goes on and on, like a wet season. |
| ★ | **Snagheart Bass** | Papuan black bass (*Lutjanus goldiei*)‡ | perch | 58–86 | 160 | **epic** | dusk, night | the Sunken Orchard | Predator: Glimmer Spoon, Cut Strip. | It breaks lines, lures and hearts, in that order. |
|  | **Stiltshadow Shark** | Caribbean reef shark (*Carcharhinus perezi*) | shark | 79–111 | 200 | rare | dusk, night | night water | Predator: Glimmer Spoon, Cut Strip. | It patrols under the stilt houses and knows every floorboard from below. |
|  | **Harbourdrum Grouper** | Atlantic goliath grouper (*Epinephelus itajara*) | perch | 59–83 | 150 | rare | night | old water | Predator: Cut Strip, Ember Roe. | It booms like a drum under the roots. Nobody has asked it to stop. |
|  | **Sandghost** | Bonefish (*Albula vulpes*) | minnow | 44–60 | 104 | uncommon | day, dusk | day water | Insect: Feather Fly. | You see its shadow first. Often that is all you see. |
|  | **Wide-Eyed Stray** | Horse-eye jack (*Caranx latus*) | jack | 43–57 | 100 | uncommon | any | open water | Predator: Glimmer Spoon, Cut Strip; the Moth Popper at night. | A sea fish ten miles inland, eyes wide, sure the sea is round the next bend. |
|  | **Rootshade Snapper** | Mangrove snapper (*Lutjanus griseus*) | perch | 41–53 | 89 | common | any | open water | Predator: Glimmer Spoon, Cut Strip. | It lives in the shade of the roots and takes everything personally. |
|  | **Frownlip Mullet** | Fringelip mullet (*Crenimugil crenilabis*) | minnow | 28–36 | 60 | common | day, dusk | open water | Insect: Feather Fly. | It looks disappointed in you. It looks disappointed in everyone. |
|  | **Flicker Trevally** | Trevally | jack | 28–36 | 60 | common | day, dusk | open water | Predator: Glimmer Spoon. | A school of them turns at once, like one thought changing its mind. |

**Giants of Lanternroot Lagoon:** The Silver Regent, the giant of *Killer Torpedo* · Votive Shark, the giant of *Goes Tribal* · Rootjaw Catfish, the giant of *Malaysian Lake Monster* · Snagheart Bass, the giant of *Volcanic Island Terror*.

- **The Silver Regent.** Deep silver flank of hand-sized scales like hammered lamp reflectors, a huge upturned bucket mouth, one long thread trailing from the dorsal, a deeply forked tail. She throws moonlight back in coins. *Play:* Legend, a leaper. Rolls and sighs, then breach after breach with rattling head-shakes and long runs; she spins free at the raft. *Haunt:* The crown: the Sighing Pool. She rolls at the surface: a slow silver back and a sigh.
- **Votive Shark.** Stocky grey shark with a broad round snout; the whole trailing edge of its tail is ink-black, as if dipped. Slate-lavender back, white belly, one pale smear of candle wax on the dorsal. *Play:* Thrasher. Short violent rushes and tight circles, biting at the line; deep head-shakes and a last stand at the raft. *Haunt:* Night water only: the Stilt Shrine, the channel under the offering posts, mid-depth. Strike splash.
- **Rootjaw Catfish.** Very long flat-sided catfish, a jaw that opens past the eyes, two long whiskers, a tiny back fin, a fin along the whole belly, forked tail. Plum-silver, cream belly. No glow. *Play:* Sinker. Seizes and turns for the drowned stalks, wrapping the line round them. Fouled. *Haunt:* Night water: the Monsoon Cut (a later sheet), among sunken trunks. Sign: a slow swirl beside timber; a mauled bait.
- **Snagheart Bass.** Deep, thick-shouldered bass, ink-black with a dusk-violet sheen; a heavy jaw with dog teeth that pit hard lures; broad square tail; old scars. Eyes ember-amber. *Play:* Thrasher. Hits like a dropped anchor and bolts for the snags to wrap the line; brutal short surges, deep head-shakes. *Haunt:* Old water only: the drowned trunks of the Sunken Orchard, mid-depth. Strike splash.

### 14. The Waxen Reef

*The roofs and spires of a drowned harbour town, grown over with pale coral like run candle wax. Sea fans in lavender and nebula pink; at night the polyps open as thousands of small amber flames. A wreck lies across the drop-off into violet dark.*

Places: the Chimney Gardens (day) · the Broken Keel (old) · Lamp Row (night) · the Abbot's Cellar (crown) · the Drowned Spire (old, later sheet).

| | fish | inspired by | plan | typical | record | rarity | hours | where | favours | journal |
|---|---|---|---|---|---|---|---|---|---|---|
| ★ | **The Waxen Abbot** | Giant grouper (*Epinephelus lanceolatus*) | perch | 250 → 285 | 285 | **legendary** | night | the Abbot's Cellar | Its own bait only (a new legend bait: a Lantern-Fry, one live lit fish). | It opens its mouth and the reef leans in. It has swallowed bigger than you. |
| ★ | **Spirewatch Pike** | Great barracuda (*Sphyraena barracuda*) | pike | 64–94 | 175 | **epic** | day, dusk | the Drowned Spire | Predator: Cut Strip first, then Ember Roe or the Glimmer Spoon. | It hangs beside the drowned spire for hours, perfectly still, judging. |
| ★ | **Mothlance Gar** | Needlefish (*Tylosurus crocodilus*); Needlefish‡ | gar | 64–94 | 175 | **epic** | night | Lamp Row | Predator; the Moth Popper at night; best on a proposed new lure, the Unpicked Rope. | It flies at lanterns like a moth, only narrower and much faster. |
| ★ | **Anvil Trevally** | Giant trevally (*Caranx ignobilis*) | jack | 62–91 | 170 | **epic** | day, dusk | the Broken Keel | Predator: Glimmer Spoon, Cut Strip. | It hits the surface like a dropped anvil and expects the sea to apologise. |
|  | **Cabin Grouper** | Grouper | perch | 59–83 | 150 | rare | any | old water | Bottom: Mire Worms, Bone Jig. | It has moved into the captain's cabin and changed nothing. |
|  | **Picket Pike** | Barracuda | pike | 64–86 | 150 | uncommon | day, dusk | open water | Predator: Glimmer Spoon. | They hang in a row along the reef like a fence that bites. |
|  | **Nebula Trout** | Coral trout (*Plectropomus leopardus*) | perch | 51–69 | 120 | uncommon | day, dusk | day water | Predator: Glimmer Spoon, Cut Strip. | Pink as the far nebula, spotted with its stars, and hiding under a ledge. |
|  | **Amberside Snapper** | Golden snapper (*Lutjanus johnii*) | perch | 45–58 | 97 | common | any | open water | Predator: Glimmer Spoon, Cut Strip. | The colour of candlelight on a wall. It does not know it is pretty. |
|  | **Pebble Grouper** | Grouper | perch | 28–36 | 61 | common | any | open water | Bottom: Mire Worms, Bone Jig. | It takes the first cast of every evening. Somebody has to. |
|  | **Waxdrop Damsel** | Reef fish | perch | 16–21 | 35 | common | day, dusk | open water | Insect: Feather Fly. | Each keeps one coral chimney and defends it against the entire sea. |

**Giants of The Waxen Reef:** The Waxen Abbot, the giant of *Death Down Under* · Spirewatch Pike, the giant of *Razorhead* · Mothlance Gar, the giant of *Coral Reef Killer* · Anvil Trevally, the giant of *South Pacific Terrors*.

- **The Waxen Abbot.** A fish the size of a cellar door: vast mouth, thick lips, tiny eyes, rounded fins; pale stone mottled dusk-violet, fins amber-yellow like old wax. Coral grows on its brow like a mitre. *Play:* Legend, a sinker. Inhales the bait and bores for the cellar; immense slow surges, wraps on the wreck, long stills, a last stand. *Haunt:* The crown: the Abbot's Cellar, the hold of the wreck on the drop-off, bottom. A boil that lifts the whole pool.
- **Spirewatch Pike.** A long silver lance of a pike: flat-topped head, jutting underjaw full of fangs, scattered ink blots on the lower flank, forked dark tail. A pale glint runs its length. *Play:* Leaper. One searing run, then long greyhounding leaps with open jaws; slashing head-shakes at the raft. *Haunt:* Old water: the Drowned Spire (a later sheet), hanging beside the spire in mid-water. Sign: a still silver line under the surface, then a strike splash.
- **Mothlance Gar.** Arm-thin body and a long needle beak of fine teeth, fins set far back like arrow flights; silver-lavender with a dusk-violet stripe, the beak tip faintly amber. *Play:* Leaper. Skips and tail-walks toward any light, then needle-fast runs; its bony beak shrugs off hooks. *Haunt:* Night water only: Lamp Row, at the surface, where the drowned lamps still burn. Rise rings in a line.
- **Anvil Trevally.** Deep, steel-plated jack with a steep blunt forehead like an anvil, sickle fins and a hard keel of plates before the tail; pewter going to ink with age, lavender flecks. *Play:* Runner. A surface explosion, a brutal straight run for the reef edge, then heavy side-on circles; a last stand. *Haunt:* Old water only: the drop-off beside the Broken Keel, surface to mid, on the running tide. Strike splash, the loudest on the reef.

### 15. The Last Light

*Open sea. One lighthouse on a rock, the last lamp of the kingdom, its amber beam turning over a long violet swell under the whole star field. A drift line of wreckage and pale weed where two currents meet. No shore anywhere.*

Places: the Lamp Rock (day) · the Drift Line (old) · the Beam (night) · the Unlit Mile (crown).

| | fish | inspired by | plan | typical | record | rarity | hours | where | favours | journal |
|---|---|---|---|---|---|---|---|---|---|---|
| ★ | **The Jetsam Shark** | Tiger shark (*Galeocerdo cuvier*) | shark | 480 → 550 | 550 | **legendary** | night | the Unlit Mile | Its own bait only (a new legend bait: the Lighthouse Ration, a whole salted fish hung from a lamp-chain). | It has swallowed half the kingdom's lost things, and kept them all. |
| ★ | **Nightsail Lancer** | Indo-Pacific sailfish (*Istiophorus platypterus*) | billfish | 124–182 | 340 | **epic** | day, dusk | the Drift Line | Predator: Cut Strip first, then Ember Roe or the Glimmer Spoon. | It raises a sail the colour of dusk and still goes nowhere it is told. |
| ★ | **Castaway Pike** | Snoek (*Thyrsites atun*) | pike | 80–118 | 220 | **epic** | dusk, night | the Beam | Predator: Glimmer Spoon (it takes a jig), Cut Strip. | It follows wrecks and rafts alike, patient as weather. |
|  | **Starbar Lancer** | Striped marlin (*Kajikia audax*) | billfish | 126–177 | 320 | rare | day, dusk | old water | Predator: Cut Strip first, then Ember Roe or the Glimmer Spoon. | When it is angry its stripes light up. It is nearly always angry. |
|  | **Ambersickle Tuna** | Yellowfin tuna (*Thunnus albacares*) | tuna | 94–132 | 239 | rare | dusk, night | open water | Predator: Glimmer Spoon, Cut Strip. | It has crossed the whole sea twice and still seems late for something. |
|  | **Fadegold** | Mahi-mahi (*Coryphaena hippurus*) | jack | 89–120 | 210 | uncommon | day, dusk | open water | Predator: Glimmer Spoon, Cut Strip. | Its gold goes out in your hands, like a candle carried into the wind. |
|  | **Soot Jack** | Black jack (*Caranx lugubris*) | jack | 43–57 | 100 | uncommon | day, dusk | day water | Predator: Glimmer Spoon. | Black as a snuffed wick, and about as cheerful. |
|  | **Pinstripe Tuna** | Skipjack tuna (*Katsuwonus pelamis*) | tuna | 51–65 | 110 | common | day, dusk | open water | Predator: Glimmer Spoon. | It never stops swimming, even asleep. Especially asleep. |
|  | **Grey Latchfin** | Oceanic triggerfish (*Canthidermis sufflamen*) | perch | 30–39 | 65 | common | day, dusk | day water | Insect: Feather Fly. | It locks its spine upright, like a door bolted from the inside. |
|  | **Scribbleback Mackerel** | Atlantic mackerel (*Scomber scombrus*) | tuna | 28–36 | 60 | common | day, dusk | open water | Insect: Feather Fly. | Its back is covered in writing. Nobody has read a mackerel in years. |

**Giants of The Last Light:** The Jetsam Shark, the giant of *Death Down Under* · Nightsail Lancer, the giant of *Prehistoric Terror* · Castaway Pike, the giant of *Killers from the Abyss*.

- **The Jetsam Shark.** Huge shark with a broad square snout, big dark eyes and a long upper tail lobe; slate-violet back crossed by faded ink bars like candle shadows; pale belly. *Play:* Legend, a runner. Slow, wide, unstoppable circles and a long tow; heavy rolling head-shakes, a pass under the raft, two last stands. *Haunt:* The crown: the Unlit Mile, beyond the reach of the beam. Surface to mid. Sign: a tall fin crossing the last of the light.
- **Nightsail Lancer.** Long spear bill and a vast sail fin taller than its body, dusk-violet and sown with ink spots like a star chart; slim silver flank with lavender bars; crescent tail. *Play:* Leaper. Raises the sail and dances: breach after breach, tail-walks, bill-slashing head-shakes, long fast runs between. *Haunt:* Old water only: the Drift Line, at the surface. A sail cutting the swell; nervous water where it herds bait.
- **Castaway Pike.** Long, lean, ink-violet pike of the open sea: jutting underjaw, long fang teeth, a long low spiny dorsal, finlets before a forked tail; silver belly, lavender sheen. *Play:* Thrasher. Comes in packs: slashing head-shakes, twisting short runs and sudden slack; its teeth fray the line. *Haunt:* Night water: the Beam, where the lamp's light crosses the swell, in packs. Mid-water. Sign: nervous water, then a strike splash.

### 16. The Rime Sound

*A drowned fjord between pale stone cliffs, sea ice across its head with one fishing hole and a lantern beside it: amber on lavender snow. Frozen bell-buoys, a breath of mist, long nebula-pink ribbons in the sky. Black-violet water half a mile deep.*

Places: the Net Racks (day) · the Fjord Floor (old) · the Lantern Hole (night) · the Half-Mile Line (crown).

| | fish | inspired by | plan | typical | record | rarity | hours | where | favours | journal |
|---|---|---|---|---|---|---|---|---|---|---|
| ★ | **The Long Winter** | Greenland shark (*Somniosus microcephalus*) | shark | 560 → 640 | 640 | **legendary** | any | the Half-Mile Line | Its own bait only (a new legend bait: an Old Ration, the older the better). | It was old when the kingdom was built. It has not hurried once since. |
| ★ | **Icedoor Flounder** | Pacific halibut (*Hippoglossus stenolepis*) | flatfish | 97–143 | 267 | **epic** | day, dusk | the Fjord Floor | Bottom: Mire Worms, Bone Jig. | A door of ice lying on the seabed. Knock, and it comes up swinging. |
|  | **Coalwing Skate** | Norwegian skate (*Dipturus nidarosiensis*) | ray | 83–116 | 210 | rare | any | old water | Bottom: Bone Jig. | Black on both sides, like a letter nobody has written yet. |
|  | **Bellrope Cod** | Common ling (*Molva molva*) | cod | 79–111 | 200 | rare | any | old water | Bottom: Mire Worms, Bone Jig. | Long as a bell rope. Pull, and something far below pulls back. |
|  | **Bouldermouth** | Lingcod (*Ophiodon elongatus*) | pike | 65–87 | 152 | uncommon | day, dusk | open water | Predator: Glimmer Spoon, Cut Strip. | Mostly head, and the head is mostly mouth. It guards its nest all winter. |
|  | **Hemstitch Cod** | Cusk (*Brosme brosme*) | cod | 51–69 | 120 | uncommon | any | open water | Bottom: Mire Worms, Bone Jig. | Every fin is hemmed in pale thread, by someone careful and long gone. |
|  | **Rosedeep Rockfish** | Redfish | perch | 43–57 | 100 | uncommon | any | night water | Glow: Lantern Lure, Lumen Moss. | Brought up from the dark, it blushes all over at being seen. |
|  | **Greybeard Cod** | Atlantic cod (*Gadus morhua*) | cod | 92–119 | 200 | common | any | open water | Bottom: Mire Worms, Bone Jig. | One whisker on its chin, and the look of someone who has seen winters. |
|  | **Ashline Cod** | Coalfish (*Pollachius virens*) | cod | 60–77 | 130 | common | any | open water | Predator: Glimmer Spoon (it takes a jig). | Dark as cold ash, with one pale line to show where the fire was. |
|  | **Thumbprint Cod** | Haddock (*Melanogrammus aeglefinus*) | cod | 51–66 | 112 | common | day, dusk | open water | Bottom: Mire Worms, Bone Jig. | Somebody once picked it up to look, and it has kept the thumbprint. |
|  | **Emberspot Flounder** | European plaice (*Pleuronectes platessa*) | flatfish | 46–59 | 100 | common | any | day water | Bottom: Mire Worms, Bone Jig. | It lies on the sand wearing a few small embers, hoping to pass for a hearth. |
|  | **Wickstripe Rockfish** | China rockfish (*Sebastes nebulosus*) | perch | 21–27 | 45 | common | any | open water | Bottom: Mire Worms, Bone Jig. | Black, with one amber stripe, like a candle seen through a keyhole. |

**Giants of The Rime Sound:** The Long Winter, the giant of *Legend of Loch Ness*, *Ice Cold Killer* · Icedoor Flounder, the giant of *Alaska's Cold Water Killer*.

- **The Long Winter.** A grey, cigar-shaped bulk with a short blunt snout, small fins set far back, and no hurry. Frost-pale mottling; each milky eye trails one small pale thread that glows like a candle end. *Play:* Legend, a sulker. No runs: a slow, endless weight rising from half a mile down; long stills, heavy rolls, two last stands. *Haunt:* The crown: the Half-Mile Line, the deepest water under the ice. No sign but the float going down, very slowly.
- **Icedoor Flounder.** A flatfish as wide as a door: long diamond body, both eyes on the dark side, big jaws, a crescent tail. Slate-violet above with pale frost marbling; the underside is white as lamp-lit ice. *Play:* Sinker. Dead weight, then planing dives straight back to the bottom, again and again; it slams its tail at the raft. A last stand. *Haunt:* Old water only: the sand and gravel shelves of the Fjord Floor, bottom, on the turn of the tide. A boil; a door-sized shadow lifting.

## 4. New body plans

Built today (`FISH_SHAPES`): minnow, perch, carp, pike, eel, angler, ray, puffer, jelly, crayfish, koi, ghost, leviathan; `sturgeon` is named in `FISH_SHAPES_V3` and not yet built. The roster needs these new plans, each named once and reused.

| plan | the silhouette | parameters | fish | what `src/models-fish.js` needs |
|---|---|---|---|---|
| **catfish** | Broad flat head over a wide mouth, whiskers, scaleless skin, small eyes, a low body tapering to the tail. | whisker pairs (0 to 4) and length; head (shovel, duck bill, bullet, bony shield, jutting jaw); tail (fork, round, threads, eel taper with a long belly fin); fatty fin; side plates and locking spines; eye height. | 31: The Belled Matriarch, Cindertail Catfish, Downcast Catfish, Tremor Catfish, The Barge-Shadow, Sternlamp Catfish, Millstone Catfish, Tallyside Catfish, Silkwhisker, Vigil Catfish, Tallow Borer, Boathook Catfish, Bareface Catfish, Lacework Catfish, Blotback Catfish, Slipwhisker, Flatbill Catfish, Grumbleplate, Soapthief, Swallowtail Catfish, The Long Thunder, Reedwalker Catfish, Hingecreak, Weirshadow Catfish, Old Portcullis, Scrapwhisker Catfish, The Ashen Guest, The Unfinished, Pipsqueak Catfish, Brinewhisker, Rootjaw Catfish | A new builder from the pike profile with a flattened head; reuse the barbels helper from the carp; side-plate and spine extras. |
| **disc** | River ray: a near-round disc, eyes on two small turrets, a tail shorter than the disc or a thin whip. | roundness, thickness, tail (stout sting, stub, thread, whip, thorns), back pattern (eye-rings, coins, stars, honeycomb, mottle, moon rings, a meadow). | 8: The Drifting Grove, Velvet Ray, Starback Ray, Dapplewheel Ray, Waxcomb Ray, The Buried Moon, Coinback Ray, Thorntail Ray | The built ray with a rounder width profile and a tail parameter; the built ray stays for kite and diamond rays. |
| **dogtooth** | Toothed river hunter: a torpedo body, one dorsal at mid-back and a small fatty fin, a big bony head, teeth that show with the mouth shut. | teeth (meshing daggers, two lower sabres, a tight row, dog teeth); head (steep, bulldog, salmon); body (slim to log-round); tail (fork or paddle); side lines. | 6: Nightcreek Hound, Ditch Hound, Snufferjaw, Weirflame, The Last Lock, Packtooth | The perch profile stretched, with a teeth mesh row outside the lips. |
| **bream** | A deep, thin, plate-shaped body, half to almost as tall as it is long, a blunt head and a belly keel. | depth; jaw (underslung with one row of triangle teeth, small mouth with square teeth, toothless); eye size; tail (fork or scythe); ear-flap. | 11: Falsesmile Barb, Emberbelly, Smilejaw Bream, Inkside Nipper, Gourdcracker, Petal Bream, Frostfleck Nipper, Cradlemouth Bream, Blushing Bream, Hearsay Sunfish, Saltroot Bream | The perch with a depth parameter and a jaw parameter. |
| **shark** | A torpedo with the mouth under the snout, five or six gill slits, a stiff triangular first dorsal, pectoral wings and a tail with a long upper lobe. | snout (blunt, round, pointed, square); girth; second-dorsal height; gill count; flank bars; a sleeper setting with small fins set far back. | 7: Sweetwater Shark, Tideghost Shark, Creekling Shark, Votive Shark, Stiltshadow Shark, The Jetsam Shark, The Long Winter | A new builder. The sawfish is built on it. |
| **sawfish** | The shark plan flattened in front like a ray, with a long flat saw. | saw length as a share of the body; teeth per side; a glow point per tooth. | 1: The Old Shipwright | Shark plus a flattened head and a saw extra. |
| **gar** | A long armoured cylinder in diamond scales, a toothy snout, back and belly fins set far back by a round tail. | snout (broad alligator, short, needle). | 4: Vesper Gar, The Last Sentry, Spotmail Gar, Mothlance Gar | The pike with a snout parameter and a diamond-scale texture. |
| **trout** | Spindle body, one dorsal at mid-length, a small fatty fin, a square or lightly forked tail. | hooked jaw with dog teeth; humped back; tall sail fin; flat wolf head; blunt snout. | 7: Kissmark Trout, Wolfwake Trout, Rosefleck Trout, Duskbar Salmon, Redhome Salmon, Rainglass Darter, Pilgrim Salmon | The minnow profile with a fatty fin and a jaw parameter. |
| **snakehead** | A long cylinder, a flat scaled head with the eyes far forward, one ribbon fin above and one below, a round tail. | false eye on the tail; bony head plate; four fleshy paddle fins and a wrapped pointed tail (lungfish). | 6: Emberbrood Snakehead, Sidepool Snakehead, Tailwatch Mudfish, Puddle Snakehead, Lampspot Snakehead, Old Breather | The eel profile thickened, with ribbon fins top and bottom. |
| **lamprey** | An eel body with no jaws and no paired fins: a round sucker disc ringed with teeth and seven gill holes in a row. | disc size; gill-hole glow. | 1: Hullkiss Lamprey | The eel with a mouth parameter. |
| **jack** | A deep, flat-sided body with a steep forehead, long sickle pectorals, a row of bony plates along a narrow tail stalk and a deeply forked tail. | forehead (steep, anvil); depth; eye size; a full-length crest fin with a tapering body (the Fadegold). | 5: Flicker Trevally, Wide-Eyed Stray, Anvil Trevally, Fadegold, Soot Jack | The perch with a tail-stalk keel and sickle fins. |
| **tuna** | A rigid teardrop, pointed head, two dorsals, finlets above and below a thin keeled tail stalk, a stiff crescent tail. | girth; sickle-fin length; belly stripes or back scribbles. | 4: Lostsea Mackerel, Pinstripe Tuna, Scribbleback Mackerel, Ambersickle Tuna | The minnow profile with finlets and a crescent tail. |
| **billfish** | A deep-shouldered body tapering to a keeled tail stalk and crescent tail; the upper jaw drawn out into a spear. | bill length; dorsal (sail taller than the body, tall point, low); flank bars that can light. | 3: Nightsail Lancer, Starbar Lancer, The Unlit Lance | The tuna plus a bill and a sail fin. |
| **cod** | Soft, big-headed, pot-bellied, with three dorsals and two anal fins in a row, a square tail and one chin whisker. | a long setting that stretches the body and joins the fins (two dorsals, or one continuous fin). | 5: Greybeard Cod, Thumbprint Cod, Ashline Cod, Hemstitch Cod, Bellrope Cod | The carp profile with three dorsal fins and one barbel. |
| **flatfish** | An oval or diamond body lying on one side, both eyes on top, a fringe of fin all round, coloured above and white below. | outline (oval, diamond); tail (fan, crescent); spots. | 2: Icedoor Flounder, Emberspot Flounder | A new builder: a flattened disc with both eyes on one face; it hangs like a plate when held up. |
| **softshell** | Curiosity only. A flat leathery shell, long neck, snorkel nose, paddle feet. | none | 1: Potlid Turtle | One small model; low priority. |
| **salamander** | Curiosity only. A broad flat head, four stubby legs, loose skin folds and a paddle tail. | none | 1: The Stone Lodger | One small model; low priority. |
| **squid** | Curiosity only. A long mantle, eight arms and two tentacles, a colour flicker. | none | 1: Guttering Squid | The jelly plan run backwards, or one small model. |

Built plans carry the rest: perch 22, minnow 10, eel 9, pike 8, carp 6, ray 4, sturgeon 2, puffer 1, leviathan 1, ghost 1. The sturgeon plan (3 here, plus the built Bridgechain and Candlewake Sturgeon) should be built with the first of these. Order of work by fish served: catfish, perch settings, bream, disc, shark, then the rest.

## 5. Existing species: kept, re-founded, moved

**Re-founded (21).** The id, the name and the built set pieces stay; the fish gains a real ancestor. Changes the build must make are in bold.

| id | built (lake · rarity · shape · L50 cm) | now (water · rarity · plan · L50 or first landing) | ancestor |
|---|---|---|---|
| `dusk_minnow` | The Mossmere · common · minnow · 22 | The Mossmere · common · minnow · 21 | Small roach-like fish |
| `mossback_perch` | The Mossmere · common · perch · 36 | The Mossmere · common · perch · **28** | European perch (*Perca fluviatilis*) |
| `weeping_carp` | The Mossmere · uncommon · carp · 56 | The Mossmere · uncommon · carp · 53 | Common carp (*Cyprinus carpio*) |
| `reedjaw_pike` | The Mossmere · rare · pike · 70 | The Mossmere · rare · pike · 61 | Northern pike (*Esox lucius*) |
| `gloam_eel` | The Mossmere · rare · eel · 72 | The Mossmere · rare · eel · **54** | European eel (*Anguilla anguilla*) |
| `old_portcullis` | The Mossmere · rare · carp · 58 | **Lampmoss Slough** · **epic** · **catfish** · 59 | Flathead catfish (*Pylodictis olivaris*) |
| `belled_matriarch` | The Mossmere · legendary · carp · 260 | The Mossmere · legendary · **catfish** · 260 | Wels catfish (*Silurus glanis*) |
| `velvet_ray` | Sporewood Pools · uncommon · ray · 67 | Sporewood Pools · uncommon · **disc** · **48** | Ocellated river stingray (*Potamotrygon motoro*) |
| `threadling_eel` | Sporewood Pools · uncommon · eel · 86 | Sporewood Pools · uncommon · eel · **66** | Mussum (*Synbranchus marmoratus*); Snakefish |
| `nightbloom_carp` | Sporewood Pools · uncommon · carp · 58 | Sporewood Pools · **rare** · carp · **73** | Giant barb (*Catlocarpio siamensis*) |
| `harpstring_eel` | Sporewood Pools · rare · eel · 82 | Sporewood Pools · **epic** · eel · 80 | Electric eel (*Electrophorus electricus*) |
| `drifting_grove` | Sporewood Pools · legendary · ray · 300 | Sporewood Pools · legendary · **disc** · 300 | Giant freshwater stingray (*Urogymnus polylepis*) |
| `prism_minnow` | Glasswater Vault · common · minnow · 23 | Glasswater Vault · common · minnow · **16** | Siberian dace (*Leuciscus baicalensis*) |
| `shardspine_eel` | Glasswater Vault · rare · eel · 85 | Glasswater Vault · **epic** · eel · 76 | New Zealand longfin eel (*Anguilla dieffenbachii*) |
| `vesper_gar` | Glasswater Vault · rare · pike · 70 | Glasswater Vault · rare · **gar** · 75 | Longnose gar (*Lepisosteus osseus*) |
| `rainglass_darter` | Glasswater Vault · rare · minnow · 39 | Glasswater Vault · rare · **trout** · **31** | Arctic grayling (*Thymallus arcticus*) |
| `glass_sovereign` | Glasswater Vault · legendary · koi · 300 | Glasswater Vault · legendary · **sturgeon** · **380** | Kaluga sturgeon (*Huso dauricus*) |
| `pallid_wraithfin` | The Pallid Deep · common · ghost · 46 | The Pallid Deep · common · ghost · 46 | Spotted ratfish (*Hydrolagus colliei*) |
| `gilt_eyed_eel` | The Pallid Deep · uncommon · eel · 131 | The Pallid Deep · uncommon · eel · 131 | European conger eel (*Conger conger*) |
| `lantern_swallower` | The Pallid Deep · legendary · leviathan · 850 | The Pallid Deep · legendary · leviathan · 850 | Bluntnose sixgill shark (*Hexanchus griseus*) |
| `pilgrim_salmon` | a Wanderer · rare · pike · 66/76/87 | **Glasswater Vault** · rare · **trout** · 61 | Chinook salmon (*Oncorhynchus tshawytscha*) |

**Kept as they are (32).** No researched fish is their natural ancestor; they sit beside the new fish in their lakes and keep their places: Gutter Crayfish (The Mossmere), Lampsipper (The Mossmere), Candlefin Koi (The Mossmere), Cupbearer (The Mossmere), Bridgechain Sturgeon (The Mossmere), Sporebelly Puffer (Sporewood Pools), Plumgill Perch (Sporewood Pools), Capshell Crayfish (Sporewood Pools), Mildew Angler (Sporewood Pools), Sleepspore Jelly (Sporewood Pools), Hushcap Koi (Sporewood Pools), The Remembered Sun (Sporewood Pools), Glassgill Perch (Glasswater Vault), Glassblown Puffer (Glasswater Vault), Chime Jelly (Glasswater Vault), Mirror Pike (Glasswater Vault), The Blind Scrivener (Glasswater Vault), The Unreflected (Glasswater Vault), The Footnote (Glasswater Vault), The Sexton (Glasswater Vault), Ossuary Fry (The Pallid Deep), Bonecrook Crayfish (The Pallid Deep), Shroud Ray (The Pallid Deep), Funeral Veil (The Pallid Deep), Lampwarden Angler (The Pallid Deep), The Clapper (The Pallid Deep), The Wax-Bearer (The Pallid Deep), The Unpaid Fare (The Pallid Deep), Candlewake Sturgeon (The Pallid Deep), The Namesake (The Pallid Deep), Hearthfish (Wanderer), Quayling (the Landing).

**Retired: none.** Nothing built is removed. Where a new fish shares an idea with a built one (the Foamnest Pike and the Reedjaw Pike, the Festival Puffer and the Sporebelly Puffer, the Tremor Catfish and the Sexton), they stay different creatures.

**Notes for the build.** The Glass Sovereign becomes a sturgeon (its built leaps, Prism Moth and pool stay; it is first landed at 380 cm, not 300, so that it keeps the legend rule over the Prismdrop Sturgeon). The Belled Matriarch and Old Portcullis become catfish (they were carp). Old Portcullis moves from the Mossmere's later Gatehouse Door to Lampmoss Slough's Lock Gate. Harpstring Eel and Shardspine Eel rise from rare to epic giants. Every re-founded species takes the real animal's record as its "said to reach", so several built L50s change (bold).

## 6. Curiosities and the ones that got away

Not fish, or never landed. A curiosity that bites shows its size class like a fish; **Keep** takes one slot and Murk pays a flat curio price (its water's rare Keeper price); every one writes a page in the Journal's *Not fish* section. Nothing here hurts and nothing attacks.

| curiosity | inspired by | kind | water | size cm | rarity | where and how | journal |
|---|---|---|---|---|---|---|---|
| **Potlid Turtle** | Indian narrow-headed softshell turtle (*Chitra indica*); Spiny softshell turtle (*Apalone spinifera*); Softshell turtle; Softshell/flapshell turtle (*Lissemys punctata*) | bites | Pyrefall Gorge, Lampmoss Slough | 25 / 45 / 110 | rare | The Boulder Garden and the Last Pyre at night; the bends of the Slough. It takes the giants' own baits. | Takes the bait meant for the monster, every time, without shame. |
| **Little Logjaw** | Caiman (*Caiman crocodilus*) | bites | The Inkwood | 60 / 75 / 90 | rare | Rootgate Creek after dark, on a Cut Strip in the shallows. Pairs of eyes at the edge of the light are atmosphere, always. | Pairs of amber eyes sit at the edge of the lantern light every night. This one came closer. |
| **The Stone Lodger** | Japanese giant salamander (*Andrias japonicus*) | bites | Pyrefall Gorge | 55 / 100 / 150 | rare | Under one boulder in the Boulder Garden, at night, on a Bone Jig lowered at the rock. | Has rented the same rock for a hundred years and never paid. |
| **Mudlark Crab** | Mangrove crab (*Scylla serrata*) | bites | The Salt Gate | 10 / 16 / 28 | uncommon | The mud among the roots of the Salt Gate, any hour, on any bottom bait. | Steals your bait, then comes up to see who to thank. |
| **Paper-Lantern Jelly** | Box jellyfish (*Chironex fleckeri*) | bites | The Waxen Reef | 15 / 25 / 35 | rare | Lamp Row at night, drawn by the Lantern Lure. | A lantern somebody let go of. It is still looking for the hand. |
| **Guttering Squid** | Humboldt squid (*Dosidicus gigas*) | bites | The Last Light | 80 / 150 / 250 | rare | The Beam at night, on a jig or the Lantern Lure. | It goes pink, then white, then pink, like a candle deciding. |
| **The Long Coil** | Green anaconda (*Eunectes murinus*) | sighting | The Inkwood | 400 / 500 / 600 | rare | Rootgate Creek, once in a long while. It costs no bait and no good bite and writes one Journal line. | Something long went under the raft. It did not stop. |
| **The Unlit Lance** | Black marlin (*Istiompax indica*)‡ | got-away | The Last Light | 250 / 380 / 460 | rare | The Unlit Mile at night. Rarely a Trophy-class play there ends at the raft with a thrown hook and this got-away note; it never lands, takes no slot and costs only the cast. | Everyone has hooked it once. In every telling it is a little longer. |

**Got-away notes** (hooked and lost in the research; no new fish, no new odds; each is the authored line the card shows when that fish escapes):

| what was lost | becomes |
|---|---|
| the sareng, never landed as a giant (it bit through the leader) | **The Unfinished** (★ ‡), Pyrefall Gorge's one that got away: the scarcest giant of the gorge, the hardest play, no bait ticket |
| the bigger goonch of the last season and of the extended cut (never seen, line round a rock) | the Ashen Guest's own story: the same species, so one giant (the user's rule). Her losses are always "fouled" on rock, and each escape wounds her (the built legend rule) |
| the black marlin spat beside the boat after an hour | **The Unlit Lance**, a curiosity: never lands (above). It is not a giant: it was a first suspect, not its episode's main fish |
| the giant stingray that broke the rod at the net | the Drifting Grove's lore: "Something broke the rod at the net. She was bigger than the net." |
| goliath tigerfish, three takes lost, one bait bitten in half | the Last Lock's sign: a bait that comes back as half a fish |
| bull sharks that bit through wire | the Sweetwater Shark trails broken leaders; its usual loss is a bitten-through line |
| the tribe's sacred shark that bit through the handline | the oldest Votive Shark, first met as a got-away note: "It took the line and the hook and the prayer." |
| the tiger shark lost at the boat; the tuna and the amberjack eaten off the line | Jetsam Shark notes at the Unlit Mile: "Only the head came up." |
| the tarpon that spun free at the raft; the arapaima that threw the hook on its first jump; the dorado that cut lines on rock | the Silver Regent's, the Banked Fire's and the Weirflame's usual losses (spat, thrown, fouled) |
| the first anjumara, lost while it was dragged ashore | the Nightcreek Hound's note: "Something else wanted it more." |
| the sockeye taken off the hook by a bear | the Redhome Salmon, an ordinary uncommon fish whose own got-away line is "Something took your salmon." |
| unidentified big fish lost on rocks (the Essequibo, India, New Britain) | the Mile Rock in the Siltway: a Prize or bigger lost there leaves a note with no name until the Barge-Shadow is first landed |

Atmosphere only, never hooked: amber eyes of caiman at the edge of the light (the Inkwood), a slow dark back of a hippo or a crocodile (Rushlight Fen), a pale roll of a river dolphin (the Siltway), an upright ribbon of an oarfish beside the raft at the Unlit Mile, a white-tipped fin that circles at the Drift Line. Nothing attacks.

## 7. What the roster asks of the SPEC and the build

| # | ask | why |
|---|---|---|
| 1 | **A giant may reach Elder at its own place**, whatever the kind of place (the built `giantsKept` rule). SPEC §5.1 rule 3 ("Elders bite only in old water") stays true for every other fish. | 14 giants live in night water and 16 legends in crowns; without it their ladders stop at Trophy |
| 2 | **A map card names the place's giant** when it has one (SPEC §5.1 rule 9 still names one fish). Under the Span names the Thousandcast Pike; the Bridgechain Sturgeon stays its own species. | the map promises the big fish |
| 3 | Six waters keep a fourth giant on a later sheet: Sporewood's Puffball Vent (its Prize cap does not bind its giant), Glasswater's Well of Ledgers, the Inkwood's Overhang, the Salt Gate's Turning Tide, Lanternroot Lagoon's Monsoon Cut, the Waxen Reef's Drowned Spire. | one giant per place |
| 4 | New baits: **Windfall Plum** (fruit, for the Inkwood's fruit eaters), **Tallow Soap** (whiskered scavengers). New legend baits, one per new water: Blossom Fly, Bargeman's Supper, Lamp Snail, Wired Bream, Storm Candle, Carp Cutlet, Charred Offering, Tide Mullet, Moth-Wing Fly, Lantern-Fry, Lighthouse Ration, Old Ration. | the built pattern: her bait, her hour, her pool |
| 5 | One giants' lure per new water in the built pattern (+10 Hold on three named fish), named when its sheet is scheduled. | the built giants' lures |
| 6 | Each new water needs a lake Fight term (`CATCH_V3.lake`) and a value tier before it ships. | the economy is the SPEC's, not the roster's |
| 7 | The Gill Lodger is never hooked: about 1 in 8 Prize-or-bigger Siltway catfish carries one, shown on the card after the main fish with its own Keep or Let go. | the real candiru was pulled from a landed catfish's gills |

## 8. How the three drafts were merged

| call | decision |
|---|---|
| bull shark (three drafts, six episodes) | one giant, the **Sweetwater Shark** (epic, the Salt Gate). Its water's legend is the sawfish |
| giant freshwater stingray (two drafts) | the built **Drifting Grove** (Sporewood's crown): she gave birth as she was landed, and a meadow rides on her back |
| discus ray (it had claimed the Drifting Grove) | a new epic, the **Dapplewheel Ray**, the Siltway's night water |
| tarpon (two drafts) and kaluga | the tarpon is **the Silver Regent** (Lanternroot Lagoon's crown); the kaluga is the built **Glass Sovereign** (cold water, mirror scutes, the Prism Moth) |
| redtail catfish (two drafts) | one fish, the **Sternlamp Catfish** (the Siltway); the Thai pond fish is the same species |
| peacock bass (two drafts) | one fish, the **Windowtail Perch** (the Inkwood) |
| horse-eye jack, grunter, sea catfish, bluespotted ray, butterfly ray, barramundi, whipray, river shark, sawfish, black bass, small shark (two drafts each) | one fish each, the better name kept: Wide-Eyed Stray, Sandblower, Brinewhisker, Tidetable Ray, Kitewing Ray, Embereye Bass, Longlash Ray, Tideghost Shark, the Old Shipwright, Snagheart Bass, Creekling Shark |
| the three estuary drafts' waters | one water, **the Salt Gate**: a sea-gate with a drowned shipyard inside it |
| tiger shark | the Last Light's legend (the black marlin was a suspect, not a main fish) |
| the salamander | a curiosity, not a giant: the user named it among the non-fish; its episode's target catfish was only seen |
| name clashes | "Lampeye Perch" stays the Nile perch; the barramundi is the Embereye Bass. Two "Basket Fry": the Okavango one keeps it, the Mekong one is the Netcloud Fry. "Pouting" is a real fish: the Frownlip Mullet. "Blushing" twice: the Rosedeep Rockfish |
| new fillers | the Sidepool Snakehead (a common for the Thunder Stair, from a snakehead the villagers caught) |
| giants of their kind | Emberbelly (real piranha about 50 cm), Packtooth, Hullkiss Lamprey, Festival Puffer, Emberbrood Snakehead, Smilejaw Bream, Mothlance Gar, Snagheart Bass: large beside the Wick |
| capped to keep the ladder | by-catch kept under its water's giants (Downcast Catfish 190, Nightbloom Carp 180, Harbourdrum Grouper 150, Stiltshadow Shark 200, Starbar Lancer 320); some giants capped under their legend (Prismdrop Sturgeon 270, Pyregold Carp 170, the Unfinished 175, Votive Shark 220, Spirewatch Pike and Mothlance Gar 175, Hullkiss Lamprey 185) |

## 9. Coverage

`node tools/sim/roster-check.mjs` reads the research and this roster. Today: 243 catch records of fish and 12 of other animals; every fish record has exactly one descendant and every other animal has a curiosity or a fold (the unidentified "snakefish" is folded into the Threadling Eel). 55 episodes have a main fish; 7 have none, each with its reason in the script (`MAIN`). Result: all rules pass. `--list` prints every catch record and its descendant.

Interim research: the last season is thinner than the rest. When the research grows, re-run the check; a new kind of fish without a descendant fails it.
