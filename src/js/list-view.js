//------------------------------------------------------------------------------------------------------------------------
// File:
//   js/list-view.js
//
// Description:
//   Turns records into row elements once, and reorders those same elements on demand. Knows nothing about why an
//   order was chosen.
//
// Exposes:
//
//     buildAchievementRows     Constructs the 37 row elements from ACHIEVEMENTS a single time at start-up.
//     applyAchievementOrder    Reorders the existing elements to match a sorted record array.
//
// Notes:
//   Build once, then reorder. Appending an element that is already in the document moves it rather than copying it,
//   so the rows are appended into a fragment and inserted once -- a re-order in a single layout pass, with no image
//   destroyed, re-created, or re-assigned a src. Clearing innerHTML and rebuilding would instead re-create 37 img
//   elements on every sort, which costs fresh decode work and shows a visible flash of empty rows.
//
//   A classic script, not an ES module -- an import fails under a file:// origin. Reads `achievementImagePath` from
//   data/achievements.js, which loads before it.
//------------------------------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------------------------------
// Row geometry and identifiers.
//
// The width and height are stated on the element as attributes rather than left to the image's own header, so that the
// list reserves its full scroll height before a single image has arrived and does not reflow as they load. They are the
// row slices' native dimensions -- the same 794 x 80 the layout arithmetic pins the list's content box to, so the
// browser renders each image 1 : 1 with no resample.
//------------------------------------------------------------------------------------------------------------------------

const ACHIEVEMENT_LIST_ELEMENT_ID  = 'achievement-list';
const ACHIEVEMENT_ROW_CLASS        = 'achievement-row';
const ACHIEVEMENT_ROW_IMAGE_CLASS  = 'achievement-row__image';
const ACHIEVEMENT_ROW_IMAGE_WIDTH  = 794;
const ACHIEVEMENT_ROW_IMAGE_HEIGHT = 80;

//------------------------------------------------------------------------------------------------------------------------
// Alternative text formatting.
//
// The row is a raster image, so its alt string is the only form in which the achievement's content reaches a screen
// reader. It carries everything the picture shows -- name, description, rarity, unlock date -- rather than a label.
//
// One formatter, constructed once, pinned to a fixed locale, for the same reason the collator in sort-fields.js is:
// the date a reader is read should not depend on the machine they read it on. `en-GB` with a long month gives the
// `20 June 2023` form, which is unambiguous in a way that any all-numeric form is not.
//
// The rarity is fixed to one decimal place so that the spoken figure matches the printed one exactly. Every record
// carries one decimal, and 12.0 would otherwise be spoken as `12%` against an image that reads `12.0%`.
//------------------------------------------------------------------------------------------------------------------------

const UNLOCKED_DATE_LOCALE          = 'en-GB';
const ACHIEVEMENT_PERCENTAGE_DIGITS = 1;
const SENTENCE_TERMINATORS          = '.!?…';

const UNLOCKED_DATE_FORMATTER = new Intl.DateTimeFormat
(
    UNLOCKED_DATE_LOCALE,
    {
        day   : 'numeric',
        month : 'long',
        year  : 'numeric',
    }
);

//------------------------------------------------------------------------------------------------------------------------
// Row elements, by slug.
//
// Module state rather than a parameter, because `applyAchievementOrder` takes an order and nothing else -- its caller
// holds the sorted records and has no reason to also carry the element map around. `buildAchievementRows` fills this
// once at start-up and it is not written again.
//------------------------------------------------------------------------------------------------------------------------

let achievementRowsBySlug = new Map();

//------------------------------------------------------------------------------------------------------------------------
// Function:
//   formatUnlockedDate
//
// Description:
//   Render a record's `unlocked` timestamp as the date a reader would say aloud.
//
//   This is the one place a `Date` is constructed. It is off the sort path -- the ordering compares the ISO string
//   directly -- so the cost and the timezone question arise once per record at start-up rather than once per
//   comparison. An ISO date-time carrying no offset, which is the form the records use, is parsed as local time and
//   then formatted as local time, so the value makes the round trip unchanged.
//
// Parameters:
//   unlocked   A record's `unlocked` field: ISO 8601, no offset.
//
// Returns:
//   The date in day-month-year long form, e.g. `20 June 2023`.
//------------------------------------------------------------------------------------------------------------------------

function formatUnlockedDate ( unlocked )
{
    return UNLOCKED_DATE_FORMATTER.format( new Date( unlocked ) );
}

//------------------------------------------------------------------------------------------------------------------------
// Function:
//   terminateSentence
//
// Description:
//   End a fragment with a full stop unless it already ends with punctuation that closes a sentence.
//
//   The alt string is built by joining record fields into sentences, and three of the names close themselves --
//   `Don't Pan Me Bro!`, `Winner Winner Chicken Dinner!`, `The First Rule Is…`. Appending unconditionally would
//   produce `Chicken Dinner!.`, which a screen reader reads as a stumble rather than as a pause.
//
// Parameters:
//   text   A fragment of the alt string.
//
// Returns:
//   The fragment, sentence-terminated exactly once.
//------------------------------------------------------------------------------------------------------------------------

function terminateSentence ( text )
{
    if ( SENTENCE_TERMINATORS.includes( text.slice( -1 ) ) )
    {
        return text;
    }

    return `${text}.`;
}

//------------------------------------------------------------------------------------------------------------------------
// Function:
//   composeAchievementAltText
//
// Description:
//   Compose a row image's alternative text from its record.
//
//   Assembled from the record rather than stored alongside it, so that the text a screen reader is given cannot drift
//   from the data the image was cut from.
//
// Parameters:
//   achievement   An element of ACHIEVEMENTS.
//
// Returns:
//   A sentence conveying the achievement's name, description, rarity, and unlock date.
//------------------------------------------------------------------------------------------------------------------------

function composeAchievementAltText ( achievement )
{
    const name        = terminateSentence( achievement.name );
    const description = terminateSentence( achievement.description );
    const rarity      = `${achievement.percentage.toFixed( ACHIEVEMENT_PERCENTAGE_DIGITS )}%`;
    const unlocked    = formatUnlockedDate( achievement.unlocked );

    return `${name} ${description} ${rarity} of players have this achievement. Unlocked ${unlocked}.`;
}

//------------------------------------------------------------------------------------------------------------------------
// Function:
//   buildAchievementRow
//
// Description:
//   Construct one row: an `<li>` holding exactly one `<img>`.
//
//   The row carries no interactive affordance of any kind -- no handler, no tabindex, no title. There is nothing to
//   activate, because everything the row has to say is already in the image and, for a reader who cannot see it, in
//   the alt string.
//
//   `loading="lazy"` is set on every row rather than on the rows below the fold alone. The attribute is a hint the
//   browser resolves against its own viewport arithmetic, so the ones already in view are fetched immediately anyway,
//   and which rows those are changes with the viewport and with the sort.
//
// Parameters:
//   achievement   An element of ACHIEVEMENTS.
//
// Returns:
//   The row element. Not attached to the document.
//------------------------------------------------------------------------------------------------------------------------

function buildAchievementRow ( achievement )
{
    const image = document.createElement( 'img' );

    image.className = ACHIEVEMENT_ROW_IMAGE_CLASS;
    image.src       = achievementImagePath( achievement );
    image.width     = ACHIEVEMENT_ROW_IMAGE_WIDTH;
    image.height    = ACHIEVEMENT_ROW_IMAGE_HEIGHT;
    image.loading   = 'lazy';
    image.decoding  = 'async';
    image.alt       = composeAchievementAltText( achievement );

    const row = document.createElement( 'li' );

    row.className = ACHIEVEMENT_ROW_CLASS;
    row.appendChild( image );

    return row;
}

//------------------------------------------------------------------------------------------------------------------------
// Function:
//   buildAchievementRows
//
// Description:
//   Construct every row element, once, and keep them keyed by slug.
//
//   Called a single time at start-up. The elements it returns are the only row elements the page will ever have: a
//   sort moves them, and nothing destroys them or re-creates them. Keyed by slug rather than by index because the
//   index is a property of an order, and the order is exactly what changes.
//
// Parameters:
//   achievements   The source array of achievement records.
//
// Returns:
//   A Map of slug to row element, in the order the records were given.
//------------------------------------------------------------------------------------------------------------------------

function buildAchievementRows ( achievements )
{
    achievementRowsBySlug = new Map
    (
        achievements.map( achievement => [ achievement.slug, buildAchievementRow( achievement ) ] )
    );

    return achievementRowsBySlug;
}

//------------------------------------------------------------------------------------------------------------------------
// Function:
//   applyAchievementOrder
//
// Description:
//   Put the existing row elements into the given order.
//
//   Each row is appended to a fragment, which moves it out of the list rather than copying it, and the fragment is
//   then inserted in one go -- so 37 moves cost one layout pass, no `<img>` is re-created, and nothing flashes. The
//   list ends up holding exactly the ordered rows and nothing else, which is also what makes this the initial
//   insertion: the rows are built detached from the document, so the first call is what puts them into it and no
//   separate append step exists to keep in step with this one.
//
//   The scroll position is not carried across. A sort exists to bring a different set of rows to the front, so
//   leaving the viewport where it was would hide the very rows the sort was asked for.
//
// Parameters:
//   orderedAchievements   Achievement records in the order to display. Not modified.
//
// Returns:
//   Nothing.
//------------------------------------------------------------------------------------------------------------------------

function applyAchievementOrder ( orderedAchievements )
{
    const list = document.getElementById( ACHIEVEMENT_LIST_ELEMENT_ID );

    // Nothing to order before the rows are built. Guarded so that a call in the wrong order leaves the list as it
    // stands instead of emptying it.

    if ( list === null || achievementRowsBySlug.size === 0 )
    {
        return;
    }

    const fragment = document.createDocumentFragment();

    orderedAchievements.forEach( achievement =>
    {
        const row = achievementRowsBySlug.get( achievement.slug );

        if ( row !== undefined )
        {
            fragment.appendChild( row );
        }
    } );

    list.replaceChildren( fragment );
    list.scrollTop = 0;
}
