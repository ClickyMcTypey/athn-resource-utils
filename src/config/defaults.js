export const DEFAULT_CONFIG = {
    debug: false,
    updateDelay: 150,

    selectors: {
        form: '[athn_form]',
        filter: '[athn_filter]',
        item: '[data-type]',
        countLabel: '[count]',
        section: '[athn-resource-section][content-type], [content-type]',
        empty: '.resource-empty',

        // Generic click targets.
        // This lets the utility react to topic filters, search, buttons, etc.
        interactive:
            'input, select, textarea, button, a, label, [role="button"], [tabindex]'
    },

    behavior: {
        showEmptyState: true,

        // Main behavior you want:
        // hide content-type sections when their visible item count is 0.
        hideSectionWhenEmpty: true,

        // Watches for any external script hiding/showing items.
        observeDomChanges: true
    }
};