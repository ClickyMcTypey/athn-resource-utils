export const DEFAULT_CONFIG = {
    debug: false,
    updateDelay: 150,

    selectors: {
        form: '[athn_form]',
        item: '[data-type]',
        countLabel: '[count]',
        section: '[athn-resource-section][content-type], [content-type]',
        empty: '.resource-empty',

        // New anchor controls.
        anchor: '[athn_anchor]',

        // Optional legacy support if your old buttons still use athn_filter.
        legacyAnchor: '[athn_filter]'
    },

    behavior: {
        showEmptyState: true,
        observeDomChanges: true,

        scrollOffset: 100,
        smoothScroll: true,
        updateHash: false
    }
};