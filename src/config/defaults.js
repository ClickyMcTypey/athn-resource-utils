export const DEFAULT_CONFIG = {
    debug: false,
    updateDelay: 100,

    selectors: {
        form: '[athn_form]',
        filter: '[athn_filter]',
        item: '[data-type]',
        countLabel: '[count]',
        section: '[athn-resource-section][content-type], [content-type]',
        empty: '.resource-empty'
    },

    behavior: {
        showEmptyState: true,

        // Set this to true later if you want whole sections hidden
        // when their count becomes 0.
        hideSectionWhenEmpty: false,

        // Useful when Webflow/Finsweet/other filters hide/show CMS items.
        observeDomChanges: true
    }
};