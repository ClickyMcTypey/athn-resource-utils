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
        active: 'is-active'
    },

    behavior: {
        showEmptyState: true,
        hideSectionWhenEmpty: true,
        observeDomChanges: true,

        scrollOffset: 200,
        scrollAlign: 'center',
        smoothScroll: true,
        scrollDuration: 800,
        updateHash: false,

        scrollSpy: true,
        scrollSpyBuffer: 8
    }
};