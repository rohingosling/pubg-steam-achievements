//------------------------------------------------------------------------------------------------------------------------
// File:
//   js/sort-fields.js
//
// Description:
//   The sort field registry and the pure sort function. Knows nothing about the DOM.
//
//   The registry is the single definition of a sort option. `app.js` builds the dropdown out of it and looks the
//   selected option up in it, so the control and the ordering cannot disagree. Adding a fifth sort field is one array
//   entry and no other change.
//
// Exposes:
//
//     SORT_FIELDS              The four sort orders, in dropdown order. Each entry carries an identifier, the label
//                              the dropdown shows, the record key it reads, how that key is compared, its one fixed
//                              direction, and the sentence announced once it has been applied. There is no
//                              ascending/descending toggle, so direction is a property of the field rather than of
//                              the user interface state.
//     DEFAULT_SORT_FIELD_ID    The identifier applied on load -- percentage, ascending, rarest first.
//     resolveSortField         Looks an entry up by identifier, falling back to the default field. Used by the sort
//                              below and by app.js, which reads the resolved entry's announcement.
//     sortAchievements         Returns a new ordered array. Pure: always computed from the unmodified source array
//                              and never from the currently displayed order, so selecting a field twice yields the
//                              identical order both times.
//
// Notes:
//   A classic script, not an ES module -- an import fails under a file:// origin. Top-level declarations here are
//   visible to the scripts that load after it.
//------------------------------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------------------------------
// Sort direction.
//
// Held as the multiplier applied to a comparison result rather than as a name, so that reversing a field is one
// multiplication on the comparison's sign and no comparison needs a descending variant of itself.
//------------------------------------------------------------------------------------------------------------------------

const SORT_DIRECTION_ASCENDING  =  1;
const SORT_DIRECTION_DESCENDING = -1;

//------------------------------------------------------------------------------------------------------------------------
// Comparison kinds.
//
// A key's type does not determine how it is compared. `name` and `unlocked` are both strings, but one is human-readable
// text that must collate and the other is a machine timestamp that must not. So the kind is stated per field in the
// registry rather than inferred from the value.
//
//   NUMERIC   Arithmetic comparison. `percentage` is stored as a number, so 9.1 sorts before 13.2 rather than after it.
//   TEXT      Locale-aware collation through the shared collator. For anything a reader reads as words.
//   ORDINAL   Plain code-unit comparison. Correct for `unlocked` precisely because ISO 8601 is zero-padded and
//             fixed-width, so lexical order is already chronological order -- and no `Date` parsing appears on the
//             sort path.
//------------------------------------------------------------------------------------------------------------------------

const SORT_COMPARISON_NUMERIC = 'numeric';
const SORT_COMPARISON_TEXT    = 'text';
const SORT_COMPARISON_ORDINAL = 'ordinal';

//------------------------------------------------------------------------------------------------------------------------
// String collation.
//
// One collator, constructed once, pinned to a fixed locale. Pinned rather than left to the browser's default so that
// every visitor is shown the same order: a collator built from the visitor's own locale would place the punctuated
// names differently from one machine to the next, for a list whose content is English in every case.
//
// `sensitivity: 'variant'` distinguishes case and accent, which is what keeps the comparison a total order over names
// that differ only in those. Numeric collation is left off deliberately: `Agent 48` and `Top 10` are the only names
// carrying digits and neither belongs to a numbered series, so digit-aware ordering would change the order for no
// reason a reader could see.
//------------------------------------------------------------------------------------------------------------------------

const SORT_COLLATOR_LOCALE = 'en';

const SORT_COLLATOR = new Intl.Collator
(
    SORT_COLLATOR_LOCALE,
    {
        usage       : 'sort',
        sensitivity : 'variant',
        numeric     : false,
    }
);

//------------------------------------------------------------------------------------------------------------------------
// Sort field registry.
//
// Entry order is dropdown order. Each entry is the complete definition of one sort option:
//
//   id           Stable identifier. Used as the `<option>` value and as the key a field is looked up by.
//   label        The text the dropdown shows. Spelled out rather than abbreviated -- `Percentage` alone would not say
//                percentage of what.
//   key          The record field the comparison reads.
//   comparison   Which of the three comparison kinds above applies to that key.
//   direction    The field's one fixed direction. Not adjustable by the user; there is no toggle anywhere in the
//                interface, because each of these four fields has a single obviously-right direction.
//   announcement The sentence the live region speaks once this order has been applied. Held in the entry rather than
//                composed in app.js out of the label and the direction, because what a reader needs to hear is what
//                the order means -- `rarest first`, `A to Z`, `most recent first` -- and none of those is derivable
//                from a multiplier. Keeping it here also holds the registry to its one rule: a fifth sort field is
//                one array entry and no other change.
//------------------------------------------------------------------------------------------------------------------------

const SORT_FIELDS =
[
    {
        id           : 'percentage',
        label        : 'Percentage of players who have this achievement',
        key          : 'percentage',
        comparison   : SORT_COMPARISON_NUMERIC,
        direction    : SORT_DIRECTION_ASCENDING,
        announcement : 'Sorted by percentage of players who have the achievement, rarest first.',
    },
    {
        id           : 'name',
        label        : 'Achievement Name',
        key          : 'name',
        comparison   : SORT_COMPARISON_TEXT,
        direction    : SORT_DIRECTION_ASCENDING,
        announcement : 'Sorted by achievement name, A to Z.',
    },
    {
        id           : 'description',
        label        : 'Achievement Description',
        key          : 'description',
        comparison   : SORT_COMPARISON_TEXT,
        direction    : SORT_DIRECTION_ASCENDING,
        announcement : 'Sorted by achievement description, A to Z.',
    },
    {
        id           : 'unlocked',
        label        : 'Unlocked Date',
        key          : 'unlocked',
        comparison   : SORT_COMPARISON_ORDINAL,
        direction    : SORT_DIRECTION_DESCENDING,
        announcement : 'Sorted by unlocked date, most recent first.',
    },
];

//------------------------------------------------------------------------------------------------------------------------
// Default sort field.
//
// Rarest first. The list leads with the achievements the fewest players hold, which is the end of the list worth
// looking at.
//------------------------------------------------------------------------------------------------------------------------

const DEFAULT_SORT_FIELD_ID = 'percentage';

//------------------------------------------------------------------------------------------------------------------------
// Function:
//   resolveSortField
//
// Description:
//   Look a registry entry up by identifier, falling back to the default field when the identifier is not one the
//   registry knows. The fallback is what keeps an unexpected control value from throwing or from rendering an empty
//   list -- an unknown identifier degrades to the default order, which is the same order a fresh load shows.
//
// Parameters:
//   fieldId   A sort field identifier. Any value; it need not be a known one.
//
// Returns:
//   The matching entry of SORT_FIELDS, or the default entry.
//------------------------------------------------------------------------------------------------------------------------

function resolveSortField ( fieldId )
{
    return SORT_FIELDS.find( field => field.id === fieldId ) ??
           SORT_FIELDS.find( field => field.id === DEFAULT_SORT_FIELD_ID );
}

//------------------------------------------------------------------------------------------------------------------------
// Function:
//   compareValues
//
// Description:
//   Compare two values of the same record key, by the comparison kind that key is registered with. Always ascending --
//   direction is applied by the caller, so this function has one behaviour per kind rather than two.
//
// Parameters:
//   valueA       The first value.
//   valueB       The second value.
//   comparison   One of the SORT_COMPARISON_* kinds.
//
// Returns:
//   Negative if valueA sorts first, positive if valueB sorts first, zero if the two are equal under that kind.
//------------------------------------------------------------------------------------------------------------------------

function compareValues ( valueA, valueB, comparison )
{
    if ( comparison === SORT_COMPARISON_NUMERIC )
    {
        return valueA - valueB;
    }

    if ( comparison === SORT_COMPARISON_TEXT )
    {
        return SORT_COLLATOR.compare( valueA, valueB );
    }

    // SORT_COMPARISON_ORDINAL, and the fallback for a kind the registry does not name. A code-unit comparison is
    // defined for every value the records hold, so an unrecognised kind degrades to a consistent order rather than to
    // an exception.

    if ( valueA < valueB )
    {
        return -1;
    }

    if ( valueA > valueB )
    {
        return 1;
    }

    return 0;
}

//------------------------------------------------------------------------------------------------------------------------
// Function:
//   compareAchievements
//
// Description:
//   The comparator for one sort field: compare on the field's key in the field's direction, then break a tie on `name`
//   ascending.
//
//   The tiebreak is what makes a sort a deterministic function of the field alone. Achievement names are unique, so
//   applying `name` last leaves no pair of records genuinely equal, and two records sharing a percentage cannot swap
//   places between two selections of the same field. On the `name` field itself the tiebreak cannot fire -- reaching
//   it would mean the two names had already compared equal, which uniqueness rules out.
//
// Parameters:
//   recordA   The first achievement record.
//   recordB   The second achievement record.
//   field     The registry entry being sorted by.
//
// Returns:
//   Negative if recordA sorts first, positive if recordB sorts first. Zero only for a record against itself.
//------------------------------------------------------------------------------------------------------------------------

function compareAchievements ( recordA, recordB, field )
{
    const difference = compareValues( recordA[ field.key ], recordB[ field.key ], field.comparison ) * field.direction;

    if ( difference !== 0 )
    {
        return difference;
    }

    return compareValues( recordA.name, recordB.name, SORT_COMPARISON_TEXT );
}

//------------------------------------------------------------------------------------------------------------------------
// Function:
//   sortAchievements
//
// Description:
//   Order a set of achievement records by a sort field.
//
//   Pure, and that property is load-bearing rather than stylistic. The caller always passes the same unmodified source
//   array -- never the currently displayed order -- and this function copies before sorting, so `ACHIEVEMENTS` stays in
//   its committed order for the life of the page and every sort is computed from the same known starting point. A
//   sequence of selections therefore cannot drift, and returning to a field returns to exactly the order it gave
//   before.
//
// Parameters:
//   achievements   The source array of achievement records. Not modified.
//   fieldId        A sort field identifier. An unknown one falls back to the default field.
//
// Returns:
//   A new array holding the same records in the field's order.
//------------------------------------------------------------------------------------------------------------------------

function sortAchievements ( achievements, fieldId )
{
    const field = resolveSortField( fieldId );

    return achievements.slice().sort( ( recordA, recordB ) => compareAchievements( recordA, recordB, field ) );
}
