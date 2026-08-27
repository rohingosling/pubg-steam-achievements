//------------------------------------------------------------------------------------------------------------------------
// File:
//   js/app.js
//
// Description:
//   Bootstrap. The only module with side effects on load, and the only one that binds an event.
//
//   Populates the dropdown from SORT_FIELDS, builds the rows, applies the default order before the rows are first
//   painted, binds the sort control's change handler, and announces each newly applied order to the live region.
//
//   The whole file is four short steps because the three modules below it already hold everything that is hard:
//   sort-fields.js decides order without knowing about the DOM, list-view.js moves elements without knowing why, and
//   this file is the only place that knows both. Nothing here re-implements either -- it reads the registry, calls
//   the sort, and hands the result to the view.
//
// Notes:
//   Loaded last of the four deferred scripts, so ACHIEVEMENTS, the sort registry, and the list view are all defined
//   by the time this file executes. Deferred scripts also run after the document has parsed, so no DOMContentLoaded
//   handler is required and the DOM can never be observed half-built.
//
//   A classic script, not an ES module -- an import fails under a file:// origin.
//------------------------------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------------------------------
// Element identifiers.
//
// The two elements index.html leaves empty for this file to fill: the dropdown, whose options come from the registry,
// and the live region, whose text comes from whichever registry entry was last applied.
//------------------------------------------------------------------------------------------------------------------------

const SORT_CONTROL_ELEMENT_ID      = 'sort-field';
const SORT_ANNOUNCEMENT_ELEMENT_ID = 'sort-announcement';

//------------------------------------------------------------------------------------------------------------------------
// Function:
//   populateSortControl
//
// Description:
//   Fill the sort control with one option per registry entry, in registry order.
//
//   Generated rather than written into index.html so that the registry stays the single definition of the sort option
//   set: a control built from it cannot offer an order the sort function does not implement, nor omit one it does.
//   The options are appended through a fragment for the same reason the rows are -- one insertion, one layout pass.
//
//   The default field is selected here rather than left to the browser's own "first option wins" behaviour. The two
//   happen to agree today, because the default field is the registry's first entry, but the agreement is a
//   coincidence of ordering rather than a rule, and relying on it would silently desynchronise the control from the
//   applied order the moment the registry is reordered.
//
// Parameters:
//   sortControl   The <select> element to fill.
//
// Returns:
//   Nothing.
//------------------------------------------------------------------------------------------------------------------------

function populateSortControl ( sortControl )
{
    const fragment = document.createDocumentFragment();

    SORT_FIELDS.forEach( field =>
    {
        const option = document.createElement( 'option' );

        option.value       = field.id;
        option.textContent = field.label;

        fragment.appendChild( option );
    } );

    sortControl.replaceChildren( fragment );

    sortControl.value = DEFAULT_SORT_FIELD_ID;
}

//------------------------------------------------------------------------------------------------------------------------
// Function:
//   applySortField
//
// Description:
//   Order the list by a sort field identifier.
//
//   The single path by which the displayed order ever changes: the first application at start-up and every subsequent
//   change of the control both come through here, so there is one ordering behaviour rather than an initial one and a
//   re-sort one that could drift apart.
//
//   ACHIEVEMENTS is passed every time, never the previously sorted array. sortAchievements copies before sorting, so
//   the source stays in its committed order for the life of the page and each selection is computed from the same
//   known starting point -- which is what makes selecting a field twice give the identical order twice.
//
//   The work is synchronous and there is no timer, transition, or animation frame anywhere on this path. The list is
//   reordered in the same task as the change event, so the browser has no opportunity to paint between emptying the
//   list and refilling it, and no intermediate empty or partial list can be seen.
//
// Parameters:
//   fieldId   A sort field identifier. An unknown one falls back to the default field.
//
// Returns:
//   Nothing.
//------------------------------------------------------------------------------------------------------------------------

function applySortField ( fieldId )
{
    applyAchievementOrder( sortAchievements( ACHIEVEMENTS, fieldId ) );
}

//------------------------------------------------------------------------------------------------------------------------
// Function:
//   announceSortOrder
//
// Description:
//   Speak the newly applied order into the polite live region.
//
//   The list is 37 raster images and the sort control is the only thing on the page that says anything about their
//   order, so a reader who cannot see the rows re-arrange has no other evidence that the selection took effect. The
//   region carries the registry entry's own sentence, which states what the order means rather than which field was
//   chosen -- `rarest first` rather than `percentage, ascending`.
//
//   Polite rather than assertive, and written after the rows have been moved. The reader is not interrupted mid-word,
//   and the announcement is never made ahead of the thing it describes.
//
//   Called only from the control's change handler, never from start-up. The default order is not a change, and a
//   region that already holds text when the page loads either says nothing or talks over the reader's own first pass
//   across the page, depending on the screen reader -- neither of which is an announcement anyone asked for.
//
// Parameters:
//   fieldId   A sort field identifier. An unknown one falls back to the default field, so the announcement always
//             describes the order that was actually applied.
//
// Returns:
//   Nothing.
//------------------------------------------------------------------------------------------------------------------------

function announceSortOrder ( fieldId )
{
    const announcement = document.getElementById( SORT_ANNOUNCEMENT_ELEMENT_ID );

    if ( announcement !== null )
    {
        announcement.textContent = resolveSortField( fieldId ).announcement;
    }
}

//------------------------------------------------------------------------------------------------------------------------
// Function:
//   bindSortControl
//
// Description:
//   Re-sort the list whenever the control's value changes.
//
//   Bound to `change` rather than to `input`, and there is no apply button, no confirmation, and no second control:
//   choosing an option is the whole interaction. The handler reads the control rather than closing over a value, so
//   the applied order is always the order the control is displaying.
//
//   Order first, then announce. This is the only place the two are paired -- start-up applies an order without
//   announcing one -- which is what keeps the live region a report of a change the reader made rather than a
//   description of the page's initial state.
//
// Parameters:
//   sortControl   The <select> element to bind.
//
// Returns:
//   Nothing.
//------------------------------------------------------------------------------------------------------------------------

function bindSortControl ( sortControl )
{
    sortControl.addEventListener( 'change', () =>
    {
        applySortField   ( sortControl.value );
        announceSortOrder( sortControl.value );
    } );
}

//------------------------------------------------------------------------------------------------------------------------
// Function:
//   startApplication
//
// Description:
//   Bring the page up.
//
//   Four steps, and the order of the middle two is the point. The rows are built and then ordered before either is
//   inserted, so the first time the list is painted it is already in the default order -- there is no moment at which
//   the source order is on screen and no re-order visible to the reader. buildAchievementRows constructs the elements
//   detached from the document, and applyAchievementOrder performs the one insertion that puts them in it, replacing
//   the markup the list was parsed with.
//
//   Missing elements are tolerated rather than asserted. If the control is absent the list is still built and sorted,
//   which leaves a correct page minus its control instead of an empty one; applyAchievementOrder guards the list the
//   same way.
//
// Returns:
//   Nothing.
//------------------------------------------------------------------------------------------------------------------------

function startApplication ()
{
    const sortControl = document.getElementById( SORT_CONTROL_ELEMENT_ID );

    if ( sortControl !== null )
    {
        populateSortControl( sortControl );
        bindSortControl( sortControl );
    }

    buildAchievementRows( ACHIEVEMENTS );

    applySortField( sortControl !== null ? sortControl.value : DEFAULT_SORT_FIELD_ID );
}

//------------------------------------------------------------------------------------------------------------------------
// Entry point.
//
// The one statement in the behaviour layer that runs on load. Everything else in js/ is a declaration waiting to be
// called from here.
//------------------------------------------------------------------------------------------------------------------------

startApplication();
