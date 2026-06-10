export const DEFAULT_CONFIG = {
    debug: false,
    updateDelay: 150,

    selectors: {
        item: '[data-type]',
        countLabel: '[count]',
        section: '[athn-resource-section][content-type], [content-type]',
        empty: '.resource-empty',
        anchor: '[athn_anchor]',
        legacyAnchor: '[athn_filter]'
    },

    classNames: {
        disabled: 'is-disabled',

        // Add whatever active class your anchors use here.
        // w--current is useful if Webflow is adding current state.
        active: ['is-active', 'w--current']
    },

    behavior: {
        showEmptyState: true,
        hideSectionWhenEmpty: true,
        observeDomChanges: true,
        scrollOffset: 100,
        smoothScroll: true,
        updateHash: false
    }
};