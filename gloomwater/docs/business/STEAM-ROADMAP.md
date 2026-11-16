# Gloomwater on Steam: the roadmap

Researched 1 to 16 November 2026. Steam's rules change, so facts that could change carry a link; check the live page before acting. This is not legal or tax advice: where money, tax or trademarks are involved, check with an accountant or lawyer.

---

## 1. The short answer

- **Doable and cheap.** $100 per game; Valve keeps 30% of sales. The paperwork is the easy part.
- **It must become a desktop program:** Electron wrapper, bundled fonts, saves as files, debug tools removed, the loop as the only game. Roughly 2 to 4 weeks of agent work.
- **Don't sell M1 alone.** It runs about 2 hours, and Steam refunds any game played under 2 hours. Make M1 the free demo; sell a complete 1.0 of about 6 to 8 waters (12 to 20 hours) at $14.99 to $19.99.
- **Controller support is the biggest single job** (1 to 3 weeks). Steam Deck players expect it.
- **Calendar:** sign up now, Coming Soon page around January 2027, Steam Next Fest in June 2027, 1.0 around Q4 2027 to Q1 2028.
- **AI:** coding agents are fine; agent-written text, names and lore must be disclosed on the store page.

---

## 2. What Steam requires

**Account and money**
- Sign the NDA and distribution agreement, pay $100, then give bank, tax and identity details; Valve says 15 to 30 days. You can join as an individual ("Sole Proprietorship", legal name); the bank account must be in that name. ([Steam Direct](https://partner.steamgames.com/steamdirect), [Onboarding](https://partner.steamgames.com/doc/gettingstarted/onboarding))
- The $100 comes back once the game earns $1,000 adjusted gross revenue. ([App fee](https://partner.steamgames.com/doc/gettingstarted/appfee))
- Valve keeps 30% (25% above $10M, 20% above $50M). ([Valve](https://steamcommunity.com/groups/steamworks/announcements/detail/1697191267930157838)) Payment is monthly, about 30 days after the month of sales, once you are owed $100. ([Payments](https://partner.steamgames.com/doc/finance/payments_salesreporting))
- **Tax:** outside the US, a tax form sets how much of US sales is withheld: up to 30% without a treaty and a tax ID, and it is not refunded later. Do the tax interview with an accountant's help. ([Tax FAQ](https://partner.steamgames.com/doc/finance/taxfaq))

**Waiting periods (Valve's minimums)**
- 21 days between paying the fee and releasing. ([Onboarding](https://partner.steamgames.com/doc/gettingstarted/onboarding))
- Store page review: 3 to 5 business days; submit 7 business days ahead. ([Review process](https://partner.steamgames.com/doc/store/review_process))
- Coming Soon page public for at least 2 weeks before release. ([Coming Soon](https://partner.steamgames.com/doc/store/coming_soon))
- Build review: normally 3 to 5 business days, but on 3 Nov 2026 Valve said **up to 12**. You must first play the build through Steam's Play button for at least 5 minutes. ([Valve news](https://store.steampowered.com/news/group/4145017/view/696528162820984745))
- You press "Release App" yourself. ([Releasing](https://partner.steamgames.com/doc/store/releasing))

**Store page** ([Assets](https://partner.steamgames.com/doc/store/assets), [Standards](https://partner.steamgames.com/doc/store/assets/standard), [Trailer](https://partner.steamgames.com/doc/store/trailer), [Tags](https://partner.steamgames.com/doc/store/tags), [Description](https://partner.steamgames.com/doc/store/page/description))
- Capsules (game art plus a readable logo only): 920×430, 462×174, 1232×706, 748×896. Library: 600×900, 3840×1240 hero, logo PNG, 920×430. Event cover 800×450.
- At least 5 gameplay-only screenshots at 1920×1080+. At least one trailer, H.264 MP4, gameplay first (Steam cuts its 6-second preview from it).
- At least 5 tags (up to 20); plain short description; no links.
- **Only what ships.** Planned content must be marked as not yet released, so the 16-water road can't be shown as present. ([Review process](https://partner.steamgames.com/doc/store/review_process))

**Ratings.** No IARC. Steam's content survey generates the ratings Germany, Brazil and Indonesia need; Germany hides unrated games. Answer truthfully (mild peril, no blood or sex); some answers can't be changed after approval. ([Content survey](https://partner.steamgames.com/doc/gettingstarted/contentsurvey))

**AI disclosure** (rewritten January 2026). Valve: "Efficiency gains through the use of these tools is not the focus… it is concerned with the use of AI in creating content that ships with your game, and is consumed by players… artwork, sound, narrative, localization." Players read your answer on the store page; press reports say it also covers marketing and store material. ([Content survey](https://partner.steamgames.com/doc/gettingstarted/contentsurvey), [Game Developer](https://www.gamedeveloper.com/business/valve-tweaks-and-clarifies-ai-disclosure-rules-for-steam)) For Gloomwater:
- Agent-written code: not the focus.
- Agent-drafted on-screen text (lore, Murk's lines, fish names, item text): disclose as pre-generated narrative.
- Art and music made at runtime by AI-written procedural code: Valve doesn't say. One plain sentence disclosing it is the safe choice.
- State that nothing is AI-generated during play. Disclose AI-made capsule art or store copy if any.

**Forbidden:** content you lack rights to, ad-funded models, NFTs and crypto. ([Onboarding](https://partner.steamgames.com/doc/gettingstarted/onboarding))

---

## 3. Turning the browser game into a desktop Steam game

**Recommended:** **Electron**, pinned to the current 45.3.x and updated every 4 to 6 months (only the latest three majors get security fixes; [releases](https://releases.electronjs.org/)). Bridge to Steam with **steamworks-ffi-node** 0.11.3 ([GitHub](https://github.com/ArtyProf/steamworks-ffi-node)) in Electron's main process. Ship Windows plus a native Linux build for the Deck; leave macOS for later ($99 a year, notarization, about 2% of Steam players).

Why: Electron bundles the same Chromium you already test in; Tauri's Linux engine can silently fall back to software rendering ([Tauri docs](https://tauri.app/develop/debug/linux-graphics)). steamworks.js has had no release since August 2024 ([npm](https://registry.npmjs.org/steamworks.js)). Chromium games running as Windows builds under Proton on the Deck reportedly don't see its controls, while native Linux builds do ([Proton #8154](https://github.com/ValveSoftware/Proton/issues/8154)).

**The work, in order:**
1. **Release build (1 to 2 days).** The M1 loop is the only game; cut the old survival/combat code; remove `?v3`, `?loop`, `?redress`, `?debug=1`, the `gw.debug` flag and `window.__gw`. Keep the debug clock and Playwright hooks in a separate debug build. Today the default page is still the old roguelite (`src/core.js` lines 101, 178).
2. **Fonts (half a day).** Bundle the four fonts unmodified with their OFL.txt files; remove the Google Fonts links (`src/template.html` lines 9–11); play a full session offline.
3. **Electron shell (1 to 2 days).** New `desktop/` folder; context isolation on, Node integration off; a small bridge for save, load, Steam, fullscreen, quit. No DevTools, right-click menu or navigation in release. Music starts without a click; pause on focus loss.
4. **Saves (2 to 4 days).** Replace the localStorage wrapper (`src/core.js` lines 83–88) with a JSON file in app data: write to a temp file then rename, keep 3 rolling backups, warn when a save fails, migrate old saves once. Turn on Steam Auto-Cloud for that folder; keep graphics settings in an unsynced file. ([Steam Cloud](https://partner.steamgames.com/doc/features/cloud))
5. **Steam (2 to 4 days).** init and restartAppIfNecessary at startup; ship only Valve's redistributable libraries, never steam_appid.txt.
6. **Pipeline (2 to 3 days).** Windows and Linux folder builds with electron-builder or Forge; SteamPipe upload to a beta branch; run the Playwright suite against the packaged app.
7. **Crash safety (2 to 3 days).** Global error handlers, WebGL context-loss recovery, a crash log on disk, a calm "your catch is safe" screen; uploads opt-in only.
8. **Real hardware.** A Windows PC, an integrated-GPU laptop, a Steam Deck in Game Mode. Linux fixes are documented in [steam-electron-build](https://github.com/alexanderthurn/steam-electron-build).

**Must be tested, not yet verified:** gamepads through Steam Input on Windows with Electron 45; the Linux build inside Steam's Linux runtime; the Shift+Tab overlay, which Valve says browsers can't host ([Overlay](https://partner.steamgames.com/doc/features/overlay)). The fallback is overlay dialogs that the game opens itself.

---

## 4. What the game still needs before people pay for it

**The honest gap:** M1 measures about 2.04 hours; the full road is designed for 45 to 48. Steam refunds any purchase played under 2 hours within 14 days ([Refunds](https://store.steampowered.com/steam_refunds/)). M1 is a demo. The paid 1.0 needs more waters; comparables suggest 6 to 8 is enough (section 6).

**Must**
- **Content:** a complete arc with its own ending, and a strong first 2 hours (the refund window).
- **One game:** only the loop ships.
- **Shipped text fixed:** the meta description ("survival roguelite… survive the Gloomtide, descend"); the "The Long Dark" settings heading (`src/ui-screens.js:1804`), another studio's Steam game; "Memories, relics, trials" (`src/ui-loop.js:252`); the "try a recent Chrome" fatal screen; package.json's "fishing survival game".
- **Desktop basics:** fullscreen/windowed (F11, Alt+Enter), a Quit button, offline launch.
- **Saves** as files with backups and Steam Cloud.
- **Credits and licences screen** (section 5).

**Should**
- **Full controller support (1 to 3 weeks).** There is no gamepad code today. Needed: gamepad play, focus navigation on every screen (title, catch card, merchant, upgrades, Journal, Chart, barge, settings), Xbox/PlayStation/Deck glyphs that follow the active device, a published Steam Input configuration, mixed mouse/keyboard/pad.
- **Steam Deck pass (3 to 5 days).** The CSS goes down to 11.5 px; Valve wants no text under 9 px tall at 1280×800 (12 recommended). Add a Text size option, hold 30 fps at 800p by default, then request the compatibility review. ([Deck compatibility](https://partner.steamgames.com/doc/steamdeck/compat))
- **PC settings (4 to 6 days):** render scale, frame cap and vsync, key rebinding, mono audio, a colour-safe rarity option, Reduced motion everywhere.
- **Low-end performance (3 to 5 days):** a "Very low" tier, desktop Auto chosen from a GPU check instead of always High, measurements on a weak laptop and the Deck, honest system requirements.
- **Audio:** the known mix faults in QUEUE (catch-show loudness order, Elder card near −1.5 dBFS, cord ticks), plus a final limiter.

**Nice**
- Achievements (firsts, giants, each Wick's empty shelf), rich presence, Timeline markers on catch shows.
- An auto-strike option, which earns the "Playable without Quick Time Events" tag ([Accessibility](https://partner.steamgames.com/doc/accessibility_features)).
- String extraction for translation: about 97 UI strings are inline, and numbers are fixed to en-US.

---

## 5. Licences and the name

**Licences: fine, but the build doesn't honour them yet.**
- three.js 0.170 is MIT; its notice must ship, but `build.mjs` strips licence comments (`legalComments: 'none'`).
- All four fonts are SIL OFL 1.1, which allows bundling with a commercial game if the notice and licence ship too. Only Marcellus has a Reserved Font Name; shipping files unmodified avoids that rule. ([Marcellus SC](https://github.com/google/fonts/blob/main/ofl/marcellussc/OFL.txt), [IM Fell English SC](https://github.com/google/fonts/blob/main/ofl/imfellenglishsc/OFL.txt))
- Ship a THIRD-PARTY-NOTICES file (three.js, fonts, Electron/Chromium, steamworks-ffi-node) and an in-game Credits screen.
- All models, art and sound are procedural or synthesized: no other asset licences.

**The name: usable, not distinctive.** No Steam or itch.io game is titled Gloomwater ([Steam search](https://store.steampowered.com/search/?term=Gloomwater)). But the word appears in EverQuest, World of Warcraft, and MIO: Memories in Orbit (Steam, January 2026), where it names a poisonous liquid ([MIO wiki](https://mio.wiki.gg/wiki/Gloomwater)). Gloomhaven, Gloomwood and Gloomgrave are nearby. No trademark register was searched. **Get a clearance search** (USPTO, EUIPO, UK IPO, WIPO; classes 9, 28, 41), ideally through a trademark lawyer, **before** paying for logo art or a store page. Renaming later costs wishlists.

---

## 6. Money and marketing

**Comparables** (sales are third-party estimates; [Gamalytic](https://gamalytic.com/game/1562430), [Nodal](https://nodal.gg/game/cast-n-chill-3483740), [Steambase](https://steambase.io/games/best-fishing-steam-games)):

| Game | Launch price | Reviews | Playtime |
|---|---|---|---|
| Dredge | $24.99 | ~58k, 96% | ~7.6 h median, ~10.8 h average |
| Cast n Chill (small, self-published) | $14.99 | ~8.6k, ~95% | ~4.6 h median |
| WEBFISHING (solo) | $4.99 | ~70k | |
| Chillquarium (solo) | $5.99 | 8.5k | |
| Moonglow Bay | $24.99 | ~680, Mixed | the cautionary case |

About Fishing (Playstack) sits in the same calm-but-uneasy niche; its demo has 567 reviews at 96% ([Steam](https://store.steampowered.com/app/4362430/About_Fishing_Demo)).

**Price:** $14.99, or $19.99 with 15+ polished hours. No price change for 30 days after launch; the launch discount (10 to 40%, 7 to 14 days) is set before release, and 20%+ emails wishlisters. Start from Valve's suggested regional prices. ([Pricing](https://partner.steamgames.com/doc/store/pricing), [Discounts](https://partner.steamgames.com/doc/marketing/discounts))

**Realistic sales.** Median about 0.10 first-week sales per launch wishlist for games over $10, varying 10 to 20 times between games ([GameDiscoverCo](https://newsletter.gamediscover.co/p/the-state-of-steam-wishlist-conversions)). At $14.99, 10,000 wishlists gives about 1,000 week-one copies: about $9.7k net, and about $24k net in year one ([model](https://gamedevproducer.com/steam-wishlist-to-sales)). A $15 sale nets about 45% of list. Launch benchmarks start at 5k wishlists (Bronze) and 8k (Silver) ([benchmarks](https://howtomarketagame.com/benchmarks)).

**Wishlists come from traffic you bring;** Valve sells no ads.
- Coming Soon page early. Valve: "Players who wishlist your game two years ahead of release can be just as likely to purchase." ([Coming Soon](https://partner.steamgames.com/doc/store/coming_soon))
- Professional capsule art and a gameplay-first trailer.
- 1 to 3 short clips a week; the procedural looks and synthesized sound loop well.
- Free cozy and dark-cozy festivals ([tracker](https://howtomarketagame.com/festivals)); optionally a Steam Playtest before the fest.

**Demo.** Its own app built from the Mossmere: 30 to 60 minutes, strike and catch within 2 minutes, ending on the road reveal (the tow, the sealed next water) with a wishlist screen. Progress carries into the full game via shared cloud saves ([Demos](https://partner.steamgames.com/doc/store/application/demos)). Release it 2 to 3 months before Next Fest, bug-free.

**Next Fest** (one per game, ever). Target **June 2027 (14 to 21 June)**: register by 25 April, demo by 10 May for the press preview, everything by 24 May ([June 2027](https://partner.steamgames.com/doc/marketing/upcoming_events/nextfest/june_2027)). Skip February 2027: registration closes 10 January, with almost no wishlists by then.

**Early Access or full release: recommend a full, smaller 1.0.** Valve requires Early Access to be worth its price as it stands, so never M1 alone ([Early Access](https://partner.steamgames.com/doc/store/earlyaccess)). Early Access converts wishlists about a third worse; only about 20% of 2025's graduates did better at 1.0; and an authored ending fits it poorly. The rest of the road can follow as free updates or a paid expansion, as Dredge did.

**Cash costs: roughly $500 to $5,000.**

| Item | Cost |
|---|---|
| Steam fee | $100, paid back after $1,000 revenue |
| Professional capsule art | ~$300–1,000 |
| Trailer | $0 yourself (OBS, DaVinci Resolve); $500–3,000 freelance |
| US trademark filing | ~$350 per class in government fees (check) |
| Steam Deck for testing; accountant | not priced here |

Register locally as your country requires (sole trader or company), and ask an accountant about income tax and VAT on Steam payouts.

---

## 7. Timeline from today (16 Nov 2026)

| When | Milestone |
|---|---|
| **Nov–Dec 2026** | Decide the shape (section 8). Sign up and pay the fee. Start the name clearance and find an accountant. Agents do steps 1 to 4 of section 3 and a first Windows build on a Steam beta branch. Commission capsule art once the name is clear. |
| **Late Dec – early Jan** | Screenshots and trailer from the desktop build; store text; content survey including AI. Submit the page 7+ business days ahead, allowing for holidays. |
| **Mid–late Jan 2027** | **Coming Soon page live**, announced the same day (Reddit, Bluesky, TikTok, YouTube Shorts). |
| **Feb–Apr 2027** | Demo app, controller support, Deck pass, optional Playtest. Public demo by about March. Festivals. Agents keep building waters. |
| **25 Apr / 10 May / 24 May** | Next Fest registration / press-preview submission / final deadline. |
| **14–21 Jun 2027** | **Steam Next Fest.** Send the one demo wishlist email within 14 days of the demo going live. |
| **Summer–autumn 2027** | Finish the 1.0 waters and ending; performance and settings; Deck review; price and launch discount. |
| **~3 weeks before launch** | Submit the build (review up to 12 business days; 5 minutes of Steam play first). |
| **Q4 2027 – Q1 2028** | **1.0 release**, avoiding December, big sales and big launches. |

**The real unknown is how fast agents build a water.** Measure it after M1 and move the date to match. Early Access with 5 to 6 waters would land around September to October 2027.

---

## 8. Decisions only you can make

1. **What is sold:** M1 as free demo plus a 6 to 8 water 1.0, or Early Access with 5 to 6 waters. Which waters, and what ending?
2. **Price:** $14.99 or $19.99.
3. **Name:** keep Gloomwater after clearance, or rename before any art or page exists.
4. **Who sells it:** sole proprietor or company, and in which name (with an accountant).
5. **AI disclosure wording:** whether to mention the procedural art and music, and whether to rewrite any agent-drafted text by hand.
6. **Capsule art:** hire an illustrator (recommended; AI art must be disclosed and invites backlash) or not.
7. **The free web version:** web demo of M1 only, unlisted, or taken down. A free full version undercuts sales; no Valve rule against a web version was found.
8. **Platforms:** Windows plus Linux at launch; whether and when to do macOS.
9. **Hardware:** whether to buy a Steam Deck to test on.
10. **Your marketing time:** guides suggest 5 to 10 hours a week through the long middle.
