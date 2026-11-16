# Where Gloomwater can be sold, and how it can make money

*Checked 16 Nov 2026. Prices and rules change, so each one has a source link next to it.*

## 1. Can a JavaScript game be on Steam?

**Yes. You do not need to rebuild it in Unity.** Steam installs and launches a desktop program, not a web page. So the game goes inside a wrapper, usually **Electron** or **NW.js**. Both bundle their own Chromium browser, so WebGL behaves the same on every PC. Achievements, cloud saves and the overlay come through **steamworks.js** or the older **Greenworks** ([guide](https://flockbay.com/blog/html5-game-on-steam), [Greenworks](https://github.com/greenheartgames/greenworks)).

Games already doing this:
- **CrossCode**: "100% HTML5. Regular JavaScript. No Asm.js, no Unity," running in NW.js. It has 93% positive reviews from 10,287 English reviewers ([developer](https://steamcommunity.com/app/368340/discussions/0/1291817208507901095), [NW.js note](https://www.radicalfishgames.com/?p=6904), [store](https://store.steampowered.com/app/368340/CrossCode)).
- **Cookie Clicker**: $4.99, 96% positive. Its Steam edition runs on Electron with Greenworks. That comes from a community project, not the developer ([NativeCookie](https://github.com/Kesefon/NativeCookie), [store](https://store.steampowered.com/app/1454400/Cookie_Clicker)).
- **Bitburner**: the official repository has an Electron build for Steam ([repo](https://github.com/bitburner-official/bitburner-src)).
- **Vampire Survivors**: built in Phaser (JavaScript). It went through Early Access and 1.0 on Steam before any Unity version existed ([RPS](https://www.rockpapershotgun.com/vampire-survivors-makes-its-full-leap-to-a-new-engine-next-month-bringing-better-performance-and-stability)).
- **3D three.js games on Steam via Electron**: Savanna Sam, and Void Cargo, reported at 60 fps on Steam Deck. These are developer forum posts ([three.js forum](https://discourse.threejs.org/t/3d-action-browser-game-made-with-three-js-savanna-sam/81902)).

**Cost and timing:** $100 per game, not refundable, but paid back once the game earns $1,000 ([Valve](https://partner.steamgames.com/doc/gettingstarted/appfee)). For a first game, Valve requires at least 21 days between paying and releasing, plus a public "coming soon" page for at least two weeks. Allow about a month ([Valve](https://partner.steamgames.com/steamdirect?l=english)).

**Changes Gloomwater needs for Steam:** move saves from localStorage to a file in the app-data folder, so Steam Cloud can sync them and an update cannot wipe them. Bundle every file so the game launches offline. Turn off browser behaviours such as right-click menus and text selection. Support controllers through the Gamepad API, and test on Steam Deck. The wrapper adds tens of MB or more to the download.

**When Unity or Godot would be worth it: consoles.** Switch, PlayStation and Xbox do not offer a supported way to run a browser game in their stores. CrossCode's console publisher said live-compiling JavaScript "is forbidden on most platforms". They had to build their own interpreter, and it was slow ([RPG Site](https://www.rpgsite.net/news/9249-deck13-and-radical-fish-games-provide-an-update-on-the-console-versions-of-crosscode)). Xbox's old web route is closed: "UWP based games are no longer accepted in the Xbox Store" ([Microsoft](https://learn.microsoft.com/en-us/windows/uwp/xbox-apps/frequently-asked-questions)).

Vampire Survivors is the model to follow. They proved the game on Steam first, then rebuilt it in Unity for Xbox and phones. They threw away a first port that didn't feel right, and only moved Steam to Unity in August 2023 ([Steam post](https://steamcommunity.com/games/1794680/announcements/detail/3637250052875666497)).

Console options and costs:
- **Unity**: console builds need Unity Pro at $210 a month ([Unity](https://unity.com/products)).
- **Godot**: console ports through W4 Games at $800 per console per year, or $2,000 for all of them ([W4](https://www.w4games.com/w4consoles)).
- **A porting studio**: quoted prices run from about $5k to over $100k per port ([StrikeTwo](https://striketwo.games/blog/cost-to-port-game-to-console), [Innovecs](https://www.innovecsgames.com/blog/game-porting-cost)). A full 3D rebuild from JavaScript would likely land at the high end.

Whichever route you take, Nintendo, Sony or Microsoft must approve you as a developer. About half of indie console ports are paid for by a partner who takes a share of console sales. So for consoles, wait until Steam sales prove demand.

## 2. Every channel compared

| Channel | How it works for Gloomwater | Platform's cut | Upfront cost | Effort | Audience | Fit with the quiet mood |
|---|---|---|---|---|---|---|
| **Steam** | Electron build, sold as a premium game | Typically 30% (not re-checked here) | $100, paid back at $1,000 ([Valve](https://partner.steamgames.com/doc/gettingstarted/appfee)) | Medium: wrapper, file saves, Deck testing | Largest PC audience for cozy indies | Strong |
| **iPhone / iPad** | Capacitor wrapper, all files bundled inside the app ([2.5.2](https://developer.apple.com/app-store/review/guidelines/)) | 15% with the Small Business Program ([Apple](https://developer.apple.com/app-store/small-business-program/)) | $99 a year ([Apple](https://developer.apple.com/programs/whats-included/)) | Medium-high: review risk, WebGL memory testing | Large, pays well | Strong if there are no ads |
| **Android** | Same Capacitor wrapper | 10% + 5% billing fee on the first $1M (US/UK/EEA, from 30 Jun 2026) ([Google](https://support.google.com/googleplay/android-developer/answer/112622?hl=en)) | $25 once; 14-day test with 12 testers first ([Google](https://support.google.com/googleplay/android-developer/answer/14151465)) | Medium: test on cheap phones | Huge, pays less per player | Strong if there are no ads |
| **itch.io** | Free browser Mossmere plus a paid download | You choose; 10% by default, plus about 2.9% + $0.30 ([itch](https://itch.io/docs/creators/payments)) | $0 | Low: upload the HTML file today | Smaller, indie-loving | Strong |
| **Web portals** (Poki, CrazyGames, GameDistribution) | Free to play, paid by ads through their SDK | Poki's share on its own traffic is unpublished ([Poki](https://developers.poki.com/guide/revenue-deal-types)); CrazyGames unpublished; GameDistribution pays you 33% ([GD](https://static.gamedistribution.com/terms/developer.html)) | $0 | Low-medium: SDK, ad breaks | Very large, quick sessions | Weak: Poki wants loops of about 3 minutes ([Poki](https://developers.poki.com/guide/engagement)) |
| **Own website** | Sell a download through Paddle or Lemon Squeezy | 5% + 50¢ ([Paddle](https://www.paddle.com/pricing), [LS](https://docs.lemonsqueezy.com/help/getting-started/fees)) | Domain and hosting | Low-medium | Only the people you bring | Strong |
| **Subscriptions** (Apple Arcade, Game Pass, Netflix) | Pitch it; they pay you a deal | Private terms | $0, but invitation only | High: pitching, contracts | Large | Strong (no ads or purchases), but uncertain ([Arcade](https://developer.apple.com/apple-arcade), [ID@Xbox](https://learn.microsoft.com/en-us/gaming/game-publishing/onboarding/onboarding-join-id-at-xbox)) |
| **Consoles (later)** | Native Unity or Godot rebuild, or a porting partner | About 30% (assumed for Sony and Nintendo) | $5k to $100k+ or a revenue share | Very high: 3 to 9 months | Switch suits cozy games | Strong, once demand is proven |

**AI rules to know:**
- **itch.io:** staff say AI-written code counts, so answer Yes and tick "Code" ([itch](https://itch.io/t/4309690/generative-ai-disclosure-tagging)).
- **Steam:** its survey focuses on AI-made art, sound and text that players see, not coding tools ([Valve](https://partner.steamgames.com/doc/gettingstarted/contentsurvey)).
- **Poki:** may ask for your prompts, and wants the developer to "keep full developer ownership of game logic" ([Poki](https://sdk.poki.com/working-with-ai)).
- **Newgrounds:** bans games "generated via an AI prompt" ([NG](https://www.newgrounds.com/wiki/help-information/terms-of-use/game-guidelines)).
- **Apple and Google:** do not ask how an app was built.

## 3. Business models for this game

**Premium (pay once).** This is the most natural fit for a quiet, 45-hour game with no failure states. Rough math: 1,000 sales at $4.99 after a 15% cut is about $4,240, before sales taxes. Steam and desktop buyers expect this model.

**Free first water, then a one-time unlock.** The Mossmere is about 2 hours long, which makes a good free chapter. DREDGE does this on iPhone: the first area is free, then you unlock the base game ([iGen](https://www.igen.fr/app-store/2025/02/jeu-dredge-fait-enfin-son-apparition-sur-lapp-store-pour-liphone-lipad-et-le-mac-148739)). Where each store allows it:
- **On phones** this is often the best choice. The unlock must go through Apple's and Google's own payments ([3.1.1](https://developer.apple.com/app-store/review/guidelines/)). US iPhone builds may also link out to a web checkout, which carries no Apple fee today. The court case over that fee is still running ([court filing](https://storage.courtlistener.com/recap/gov.uscourts.cand.364265/gov.uscourts.cand.364265.1708.0.pdf)).
- **On itch.io**, a browser game can only take donations. So pair a free browser chapter with a paid download ([itch](https://itch.io/docs/creators/html5)).
- **Expect 1 to 3 buyers per 100 installs.** These are anecdotal indie reports ([Game Developer](https://www.gamedeveloper.com/business/an-indie-perspective-launching-a-f2p-game)).

**Free with ads.** This is honestly a poor match.
- **Interstitials** are full-screen ads that interrupt play, which would break the wordless calm.
- **Rewarded ads** earn more ($8 to $18 per 1,000 views globally, $15 to $30 in rich countries, according to a [vendor blog](https://www.playwire.com/blog/admob-ecpm-benchmarks-what-publishers-should-expect)). But a game with automatic fishing and no failure states has few natural moments to offer a reward.
- **An illustration, not a forecast:** 1,000 daily players at 1.5 rewarded views each comes to about $12 to $45 a day, or roughly $360 to $1,350 a month. All ad rates are vendor estimates, and 1.5 views a day is an assumption.
- **Web portals** are the only place where ads are the whole model, and their short-session audience suits Gloomwater poorly.

**Supporter platforms.** Patreon takes 10% ([Patreon](https://support.patreon.com/hc/en-us/articles/36426991446797-A-standard-platform-plan-for-new-creators)). Ko-fi takes 0% on one-off tips in its Free mode and 5% on other income ([Ko-fi](https://help.ko-fi.com/hc/en-us/articles/360002506494-Does-Ko-fi-take-a-fee)). Card fees come on top of both. These are good for development updates and early builds, but they add to sales rather than replace them.

## 4. Recommended plan, in order

1. **Now: put the free Mossmere on itch.io in the browser.** It costs nothing, the game already works there, and it gives you feedback and an audience. Tick the AI Code disclosure.
2. **Next: open a Steam "coming soon" page early.** Wishlists build while M1 is finished, and Valve's waits (21 days, plus two weeks of a public page) run in parallel. Build the Electron version with file saves, and use the browser chapter as the demo.
3. **Launch on Steam and itch.io (paid download) as a premium game**, with the Mossmere as the free demo.
4. **Then phones: free first water plus a one-time unlock, with no ads.** Before submitting, add native saves, WebGL context-loss recovery and testing on older iPhones. Start Google's 14-day tester period early.
5. **Optional, alongside:** a Ko-fi page for fans, and a pitch to Apple Arcade once the game shows well.
6. **Consoles only after Steam sales prove demand**, through a porting partner on revenue share or a Unity or Godot rebuild that uses the JavaScript game as the spec.
7. **Skip ad-driven web portals**, or at most test one non-exclusive one (CrazyGames). Avoid Poki's 5-year web exclusive, which would cover itch.io's browser version too.

**Tax:** stores withhold tax and ask for tax forms (itch.io holds back 30% by default without a tax ID). Talk to an accountant before the first paid launch.

## 5. What could not be verified

- Steam's standard revenue share (not re-checked in this pass).
- Poki's and CrazyGames' actual ad-revenue percentages.
- Nintendo's and Sony's store cuts and devkit costs.
- Whether Xbox PC or Game Pass accepts an Electron build.
- Whether any vendor (such as QUByte) can run a three.js game on consoles.
- Capacitor's official docs and live App Store prices (blocked in this session).
- The AdMob 68% publisher share. Every ad eCPM figure is a vendor estimate.
- Whether Google's new 10% rate for the first $1M needs enrolment.
- Reports that Apple changed its EU fees on 1 Oct 2026.
