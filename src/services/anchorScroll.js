import { getAttr, qsAll, isSelfHidden } from '../utils/dom.js';

function escapeCss(value) {
    if (window.CSS && CSS.escape) return CSS.escape(value);
    return value.replace(/["\\]/g, '\\$&');
}

function getAnchorSelector(config) {
    return [config.selectors.anchor, config.selectors.legacyAnchor]
        .filter(Boolean)
        .join(', ');
}

function getActiveClassNames(config) {
    return Array.isArray(config.classNames.active)
        ? config.classNames.active
        : [config.classNames.active].filter(Boolean);
}

function getAnchorParent(anchor) {
    return anchor?.parentElement || null;
}

function getAnchorStateTargets(anchor) {
    const targets = new Set();

    targets.add(anchor);

    const parent = anchor.parentElement;

    if (parent) {
        targets.add(parent);

        Array.from(parent.children).forEach((sibling) => {
            if (sibling === anchor) return;

            if (sibling.matches('.w-form-label')) {
                targets.add(sibling);
            }
        });
    }

    return Array.from(targets);
}

export function getAnchorValue(anchor) {
    const anchorValue = getAttr(anchor, 'athn_anchor');
    if (anchorValue) return anchorValue;

    const legacyValue = getAttr(anchor, 'athn_filter');
    if (legacyValue) return legacyValue;

    const href = getAttr(anchor, 'href');
    if (href.startsWith('#')) return href.slice(1);

    return '';
}

export function getAnchorTarget(anchor, root) {
    const value = getAnchorValue(anchor);

    if (!value) return null;

    return root.querySelector(`[content-type="${escapeCss(value)}"]`);
}

export function scrollToAnchorTarget(target, config) {
    if (!target) return;

    const offset = Number(config.behavior.scrollOffset) || 0;
    const duration = Number(config.behavior.scrollDuration) || 700;

    const startY = window.scrollY;
    const targetTop = target.getBoundingClientRect().top + window.scrollY;
    const endY = Math.max(targetTop - offset, 0);
    const distance = endY - startY;

    if (!config.behavior.smoothScroll || duration <= 0) {
        window.scrollTo(0, endY);
        return;
    }

    const startTime = performance.now();

    function easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeInOutCubic(progress);

        window.scrollTo(0, startY + distance * easedProgress);

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
}

export function updateUrlHash(anchor, config) {
    if (!config.behavior.updateHash) return;

    const value = getAnchorValue(anchor);

    if (!value) return;

    window.history.pushState(null, '', `#${value}`);
}

export function updateAnchorStates(root, config, counts = {}) {
    const selector = getAnchorSelector(config);
    const activeClassNames = getActiveClassNames(config);

    qsAll(selector, root).forEach((anchor) => {
        const value = getAnchorValue(anchor);

        if (!value) return;

        const count = counts[value] || 0;
        const isDisabled = count === 0;
        const stateTargets = getAnchorStateTargets(anchor);

        stateTargets.forEach((target) => {
            target.classList.toggle(config.classNames.disabled, isDisabled);
            target.setAttribute('data-athn-disabled', isDisabled ? 'true' : 'false');

            if (isDisabled) {
                activeClassNames.forEach((className) => {
                    target.classList.remove(className);
                });
            }
        });

        anchor.setAttribute('aria-disabled', isDisabled ? 'true' : 'false');

        if (isDisabled) {
            anchor.removeAttribute('aria-current');
            anchor.setAttribute('tabindex', '-1');
        } else {
            anchor.removeAttribute('tabindex');
        }
    });
}

export function clearActiveAnchorParents(root, config) {
    const selector = getAnchorSelector(config);
    const activeClassNames = getActiveClassNames(config);

    qsAll(selector, root).forEach((anchor) => {
        const parent = getAnchorParent(anchor);

        if (parent) {
            activeClassNames.forEach((className) => {
                parent.classList.remove(className);
            });
        }

        anchor.removeAttribute('aria-current');
    });
}

export function setActiveAnchorByType(root, config, type, counts = {}) {
    if (!type) return;

    const selector = getAnchorSelector(config);
    const activeClassNames = getActiveClassNames(config);

    clearActiveAnchorParents(root, config);

    qsAll(selector, root).forEach((anchor) => {
        const value = getAnchorValue(anchor);

        if (value !== type) return;

        const count = counts[value] || 0;
        const isDisabled =
            count === 0 ||
            anchor.classList.contains(config.classNames.disabled) ||
            anchor.getAttribute('aria-disabled') === 'true' ||
            anchor.getAttribute('data-athn-disabled') === 'true';

        if (isDisabled) return;

        const parent = getAnchorParent(anchor);

        if (!parent) return;

        activeClassNames.forEach((className) => {
            parent.classList.add(className);
        });

        anchor.setAttribute('aria-current', 'true');
    });
}

export function updateActiveAnchorFromScroll(root, config, counts = {}) {
    if (!config.behavior.scrollSpy) return;

    const sections = qsAll(config.selectors.section, root);

    let bestSection = null;
    let bestOverlap = 0;

    const offset = Number(config.behavior.scrollOffset) || 0;
    const viewportTop = window.scrollY + offset;
    const viewportBottom = window.scrollY + window.innerHeight;

    sections.forEach((section) => {
        if (isSelfHidden(section)) return;

        const type = getAttr(section, 'content-type');

        if (!type) return;

        const count = counts[type] || 0;

        if (count === 0) return;

        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top + window.scrollY;
        const sectionBottom = sectionTop + rect.height;

        const overlap = Math.max(
            0,
            Math.min(sectionBottom, viewportBottom) - Math.max(sectionTop, viewportTop)
        );

        if (overlap > bestOverlap) {
            bestOverlap = overlap;
            bestSection = section;
        }
    });

    if (!bestSection) {
        clearActiveAnchorParents(root, config);
        return;
    }

    const activeType = getAttr(bestSection, 'content-type');

    setActiveAnchorByType(root, config, activeType, counts);
}