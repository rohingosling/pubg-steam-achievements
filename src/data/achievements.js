//------------------------------------------------------------------------------------------------------------------------
// File:
//   data/achievements.js
//
// Description:
//   Source of truth for the PUBG: BATTLEGROUNDS achievement list.
//
//   Transcribed by hand from screen captures of the Steam client's achievement panel. There is no Steam Web API call
//   and no API key anywhere in this project — the data is static and is edited here directly.
//
//   Shipped as a `.js` file rather than `.json` so that a plain `<script>` tag can load it. A `fetch()` against a
//   `file://` URL is blocked by the browser's origin rules, so a `.json` data file would break the page when
//   `index.html` is opened directly from disk.
//
// Record fields:
//   slug          Stable identifier. Also the row-image filename stem. Unique across the list.
//   name          Achievement name, exactly as the Steam client renders it.
//   description   Achievement description, exactly as the Steam client renders it.
//   percentage    Global unlock rate — the percentage of all players who hold this achievement. Stored as a number, not
//                 a string; the trailing '%' is added at render time.
//   unlocked      Local unlock date and time, ISO 8601. Sorts correctly as a plain string comparison and parses with
//                 `new Date()`. The Steam-style display form is produced at render time, not stored.
//   image         Path to the achievement's row image, relative to the site root — the image the application renders
//                 for this record. Stated explicitly per record rather than derived at render time, so that the data
//                 file alone answers "which image belongs to this achievement". The path is site-root relative
//                 (`images/items/flat/...`), not repository relative: `index.html` sits beside this file at the root
//                 of the publish root, whose contents promotion copies to the root of the published repository, so
//                 the same path resolves both locally and on GitHub Pages.
//
// Notes:
//   37 records, listed in slug order. The application sorts at run time, so this order carries no meaning.
//------------------------------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------------------------------
// Row image location.
//------------------------------------------------------------------------------------------------------------------------

const ACHIEVEMENT_IMAGE_DIRECTORY = 'images/items/flat';
const ACHIEVEMENT_IMAGE_PREFIX    = 'achievement-';
const ACHIEVEMENT_IMAGE_EXTENSION = '.png';

//------------------------------------------------------------------------------------------------------------------------
// Achievement records.
//------------------------------------------------------------------------------------------------------------------------

const ACHIEVEMENTS =
[
    {
        slug        : 'agent-48',
        name        : "Agent 48",
        description : "Kill 50 players with suppressed weapons.",
        percentage  : 13.2,
        unlocked    : '2023-06-20T21:03:00',
        image       : 'images/items/flat/achievement-agent-48.png',
    },
    {
        slug        : 'airborne',
        name        : "Airborne",
        description : "Jump out from an airplane 101 times.",
        percentage  : 25.2,
        unlocked    : '2019-08-03T17:42:00',
        image       : 'images/items/flat/achievement-airborne.png',
    },
    {
        slug        : 'blood-on-my-hands',
        name        : "Blood on My Hands",
        description : "Kill a player by any means.",
        percentage  : 64.4,
        unlocked    : '2019-07-29T23:31:00',
        image       : 'images/items/flat/achievement-blood-on-my-hands.png',
    },
    {
        slug        : 'collateral-damage',
        name        : "Collateral Damage",
        description : "Kill 100 players by any means.",
        percentage  : 27.3,
        unlocked    : '2019-10-20T04:24:00',
        image       : 'images/items/flat/achievement-collateral-damage.png',
    },
    {
        slug        : 'cqb-expert',
        name        : "CQB Expert",
        description : "Kill 50 players with a shotgun, a submachine gun, and/or a pistol.",
        percentage  : 17.0,
        unlocked    : '2026-04-14T00:42:00',
        image       : 'images/items/flat/achievement-cqb-expert.png',
    },
    {
        slug        : 'cqb-master',
        name        : "CQB Master",
        description : "Kill 200 players with a shotgun, a submachine gun, and/or a pistol.",
        percentage  : 8.1,
        unlocked    : '2026-06-08T02:34:00',
        image       : 'images/items/flat/achievement-cqb-master.png',
    },
    {
        slug        : 'cqb-novice',
        name        : "CQB Novice",
        description : "Kill 10 players with a shotgun, a submachine gun, and/or a pistol.",
        percentage  : 29.3,
        unlocked    : '2019-09-25T02:20:00',
        image       : 'images/items/flat/achievement-cqb-novice.png',
    },
    {
        slug        : 'cruising-with-the-enemy',
        name        : "Cruising with the Enemy",
        description : "Get into a vehicle where an enemy player is already in.",
        percentage  : 11.7,
        unlocked    : '2023-08-31T16:13:00',
        image       : 'images/items/flat/achievement-cruising-with-the-enemy.png',
    },
    {
        slug        : 'devil-inside-me',
        name        : "Devil Inside Me",
        description : "Kill 10 players by any means.",
        percentage  : 49.6,
        unlocked    : '2019-08-04T16:38:00',
        image       : 'images/items/flat/achievement-devil-inside-me.png',
    },
    {
        slug        : 'dont-pan-me-bro',
        name        : "Don't Pan Me Bro!",
        description : "Kill another player with the frying pan.",
        percentage  : 8.8,
        unlocked    : '2026-05-11T19:46:00',
        image       : 'images/items/flat/achievement-dont-pan-me-bro.png',
    },
    {
        slug        : 'dynamic-duo',
        name        : "Dynamic Duo",
        description : "Obtain a Chicken Dinner in Duos.",
        percentage  : 21.3,
        unlocked    : '2026-07-06T05:26:00',
        image       : 'images/items/flat/achievement-dynamic-duo.png',
    },
    {
        slug        : 'fantastic-four',
        name        : "Fantastic Four",
        description : "Obtain a Chicken Dinner in Squads.",
        percentage  : 40.9,
        unlocked    : '2019-09-14T03:00:00',
        image       : 'images/items/flat/achievement-fantastic-four.png',
    },
    {
        slug        : 'fast-and-furious',
        name        : "Fast and Furious",
        description : "Kill 10 players by hitting them with a vehicle.",
        percentage  : 7.8,
        unlocked    : '2024-10-19T03:04:00',
        image       : 'images/items/flat/achievement-fast-and-furious.png',
    },
    {
        slug        : 'first-blood',
        name        : "First Blood",
        description : "Get the first kill of a match.",
        percentage  : 30.2,
        unlocked    : '2026-02-13T10:32:00',
        image       : 'images/items/flat/achievement-first-blood.png',
    },
    {
        slug        : 'first-come-first-served',
        name        : "First Come, First Served",
        description : "Loot 50 items from the carepackage.",
        percentage  : 18.9,
        unlocked    : '2025-07-20T20:50:00',
        image       : 'images/items/flat/achievement-first-come-first-served.png',
    },
    {
        slug        : 'fury-road',
        name        : "Fury Road",
        description : "Kill 10 players with a gun while in a vehicle.",
        percentage  : 3.8,
        unlocked    : '2026-05-20T05:13:00',
        image       : 'images/items/flat/achievement-fury-road.png',
    },
    {
        slug        : 'ghost',
        name        : "Ghost",
        description : "Equip a suppressed weapon in every weapon slot. Let's find out which weapon is suppressed!",
        percentage  : 6.2,
        unlocked    : '2019-09-15T01:28:00',
        image       : 'images/items/flat/achievement-ghost.png',
    },
    {
        slug        : 'guardian-angel',
        name        : "Guardian Angel",
        description : "Revive a knocked-downed teammate.",
        percentage  : 52.8,
        unlocked    : '2019-09-13T01:32:00',
        image       : 'images/items/flat/achievement-guardian-angel.png',
    },
    {
        slug        : 'health-junkie',
        name        : "Health Junkie",
        description : "Charge your boost gauge to the max with energy drink and painkiller overdose.",
        percentage  : 53.9,
        unlocked    : '2019-08-02T02:17:00',
        image       : 'images/items/flat/achievement-health-junkie.png',
    },
    {
        slug        : 'killing-spree',
        name        : "Killing Spree",
        description : "Kill at least 4 players in a single match.",
        percentage  : 50.0,
        unlocked    : '2026-01-15T22:54:00',
        image       : 'images/items/flat/achievement-killing-spree.png',
    },
    {
        slug        : 'last-survivor',
        name        : "Last Survivor",
        description : "Win a game 10 times.",
        percentage  : 18.4,
        unlocked    : '2026-01-14T23:43:00',
        image       : 'images/items/flat/achievement-last-survivor.png',
    },
    {
        slug        : 'long-and-winding-road',
        name        : "Long and Winding Road",
        description : "Kill 1000 players by any means.",
        percentage  : 9.6,
        unlocked    : '2026-05-06T21:43:00',
        image       : 'images/items/flat/achievement-long-and-winding-road.png',
    },
    {
        slug        : 'marksman-expert',
        name        : "Marksman Expert",
        description : "Kill 30 players with an assault rifle and/or a sniper rifle from over 100 meters away.",
        percentage  : 29.2,
        unlocked    : '2019-09-01T02:56:00',
        image       : 'images/items/flat/achievement-marksman-expert.png',
    },
    {
        slug        : 'marksman-master',
        name        : "Marksman Master",
        description : "Kill 100 players with an assault rifle and/or a sniper rifle from over 100 meters away.",
        percentage  : 19.3,
        unlocked    : '2021-04-13T14:17:00',
        image       : 'images/items/flat/achievement-marksman-master.png',
    },
    {
        slug        : 'marksman-novice',
        name        : "Marksman Novice",
        description : "Kill 10 players with an assault rifle and/or a sniper rifle from over 100 meters away.",
        percentage  : 39.8,
        unlocked    : '2019-08-07T02:14:00',
        image       : 'images/items/flat/achievement-marksman-novice.png',
    },
    {
        slug        : 'nade-king-expert',
        name        : "Nade King Expert",
        description : "Kill 30 players with grenades.",
        percentage  : 7.3,
        unlocked    : '2026-06-11T02:27:00',
        image       : 'images/items/flat/achievement-nade-king-expert.png',
    },
    {
        slug        : 'nade-king-master',
        name        : "Nade King Master",
        description : "Kill 50 players with grenades.",
        percentage  : 5.1,
        unlocked    : '2026-06-16T14:52:00',
        image       : 'images/items/flat/achievement-nade-king-master.png',
    },
    {
        slug        : 'nade-king-novice',
        name        : "Nade King Novice",
        description : "Kill 10 players with grenades.",
        percentage  : 13.6,
        unlocked    : '2026-04-23T17:32:00',
        image       : 'images/items/flat/achievement-nade-king-novice.png',
    },
    {
        slug        : 'now-you-see-me-now-you-dont',
        name        : "Now You See Me, Now You Don't",
        description : "Equip a ghillie suit for the first time.",
        percentage  : 31.5,
        unlocked    : '2023-06-26T05:20:00',
        image       : 'images/items/flat/achievement-now-you-see-me-now-you-dont.png',
    },
    {
        slug        : 'okay-now-im-ready',
        name        : "Okay, Now I'm Ready",
        description : "Equip a Lv.3 Helmet, Military Vest, and Backpack in 10 matches.",
        percentage  : 16.6,
        unlocked    : '2026-03-07T23:35:00',
        image       : 'images/items/flat/achievement-okay-now-im-ready.png',
    },
    {
        slug        : 'pacifist',
        name        : "Pacifist",
        description : "Reach the top 10 without killing anyone.",
        percentage  : 47.2,
        unlocked    : '2019-07-30T22:44:00',
        image       : 'images/items/flat/achievement-pacifist.png',
    },
    {
        slug        : 'shoot-the-knee',
        name        : "Shoot the Knee",
        description : "Kill 10 players with the crossbow.",
        percentage  : 0.7,
        unlocked    : '2019-12-22T20:03:00',
        image       : 'images/items/flat/achievement-shoot-the-knee.png',
    },
    {
        slug        : 'the-first-rule-is',
        name        : "The First Rule Is…",
        description : "Kill 20 players with bare hands.",
        percentage  : 5.8,
        unlocked    : '2026-05-10T17:23:00',
        image       : 'images/items/flat/achievement-the-first-rule-is.png',
    },
    {
        slug        : 'top-10',
        name        : "Top 10",
        description : "Reach the top 10 10 times.",
        percentage  : 34.7,
        unlocked    : '2019-08-07T00:57:00',
        image       : 'images/items/flat/achievement-top-10.png',
    },
    {
        slug        : 'trigonometry-involved',
        name        : "Trigonometry Involved",
        description : "Headshot and kill 10 enemy players with a sniper rifle.",
        percentage  : 18.4,
        unlocked    : '2026-01-21T00:19:00',
        image       : 'images/items/flat/achievement-trigonometry-involved.png',
    },
    {
        slug        : 'winner-winner-chicken-dinner',
        name        : "Winner Winner Chicken Dinner!",
        description : "Obtain a Chicken Dinner in Solo.",
        percentage  : 12.0,
        unlocked    : '2019-08-07T04:11:00',
        image       : 'images/items/flat/achievement-winner-winner-chicken-dinner.png',
    },
    {
        slug        : 'you-complete-me',
        name        : "You Complete Me",
        description : "Wear the outfit of a dead player.",
        percentage  : 46.6,
        unlocked    : '2019-08-04T04:31:00',
        image       : 'images/items/flat/achievement-you-complete-me.png',
    },
];

//------------------------------------------------------------------------------------------------------------------------
// Function:
//   achievementImagePath
//
// Description:
//   Resolve the path of an achievement's row image. Returns the record's own `image` field, which is the authoritative
//   value. The slug-derived fallback covers a record added without an `image` field, so that a new entry renders rather
//   than showing a broken image.
//
// Parameters:
//   achievement   An element of ACHIEVEMENTS.
//
// Returns:
//   Path to the row image, relative to the site root.
//------------------------------------------------------------------------------------------------------------------------

function achievementImagePath ( achievement )
{
    return achievement.image || `${ACHIEVEMENT_IMAGE_DIRECTORY}/${ACHIEVEMENT_IMAGE_PREFIX}${achievement.slug}${ACHIEVEMENT_IMAGE_EXTENSION}`;
}
