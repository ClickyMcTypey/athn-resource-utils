import { qsAll, getAttr, setDisplay, isSelfHidden } from '../utils/dom.js';

export function getActiveContentTypes(root, config) {
    const activeTypes = new Set();

    qsAll(config.selectors.filter, root).forEach((el) => {
        if (!el.checked) return;

        const type = getAttr(el, 'athn_filter');

        if (type) {
            activeTypes.add(type);
        }
    });

    return activeTypes;
}

export function getResourceCounts(root, config) {
    const counts = {};

    qsAll(config.selectors.item, root).forEach((item) => {
        if (isSelfHidden(item)) return;

        const type = getAttr(item, 'data-type');

        if (!type) return;

        counts[type] = (counts[type] || 0) + 1;
    });

    return counts;
}

export function updateCountLabels(root, config, counts) {
    qsAll(config.selectors.countLabel, root).forEach((label) => {
        const type = getAttr(label, 'count');

        if (!type) return;

        label.textContent = counts[type] || 0;
    });
}

export function updateSections(root, config, counts, activeContentTypes) {
    qsAll(config.selectors.section, root).forEach((section) => {
        const type = getAttr(section, 'content-type');

        if (!type) return;

        const count = counts[type] || 0;
        const hasVisibleItems = count > 0;

        const contentTypeAllowed =
            activeContentTypes.size === 0 || activeContentTypes.has(type);

        const emptyEl = section.querySelector(config.selectors.empty);

        section.setAttribute('data-athn-count', String(count));
        section.setAttribute('data-athn-empty', hasVisibleItems ? 'false' : 'true');

        if (emptyEl && config.behavior.showEmptyState) {
            setDisplay(emptyEl, !hasVisibleItems);
        }

        const shouldShowSection =
            contentTypeAllowed &&
            (
                !config.behavior.hideSectionWhenEmpty ||
                hasVisibleItems
            );

        setDisplay(section, shouldShowSection);
    });
}