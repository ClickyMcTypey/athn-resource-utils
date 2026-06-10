export const DEFAULT_CONFIG = {
    debug: false,
    updateDelay: 150,

    selectors: {
        item: '[data-type]',
        countLabel: '[count]',
        section: '[athn-resource-section][content-type], [content-type]',
        empty: '.resource-empty',

        // Preferred new attribute
        anchor: '[athn_anchor]',

        // Optional support if your old buttons still use athn_filter
        legacyAnchor: '[athn_filter]'
    },

    classNames: {
        disabled: 'is-disabled'
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