import { getAttr, qsAll, isSelfHidden } from '../utils/dom.js';

function getMaxScrollY() {
    return Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        0
    );
}

function clampScrollY(value) {
    return Math.min(Math.max(value, 0), getMaxScrollY());
}

function getUsableViewportHeight(config) {
    const offset = Number(config.behavior.scrollOffset) || 0;
    return Math.max(window.innerHeight - offset, 0);
}

function getAnchorScrollY(target, config) {
    const offset = Number(config.behavior.scrollOffset) || 0;
    const align = config.behavior.scrollAlign || 'start';

    const rect = target.getBoundingClientRect();
    const targetTop = rect.top + window.scrollY;

    if (align === 'center') {
        const usableHeight = getUsableViewportHeight(config);

        // Places the target's top/anchor point at the center
        // of the usable viewport below the navbar.
        return clampScrollY(targetTop - offset - usableHeight / 2);
    }

    return clampScrollY(targetTop - offset);
}

function getScrollSpyLineY(config) {
    const offset = Number(config.behavior.scrollOffset) || 0;
    const align = config.behavior.scrollAlign || 'start';

    if (align === 'center') {
        const usableHeight = getUsableViewportHeight(config);

        // Same visual line used by center scrolling.
        return window.scrollY + offset + usableHeight / 2;
    }

    const spyBuffer = Number(config.behavior.scrollSpyBuffer) || 8;

    return window.scrollY + offset + spyBuffer;
}

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

function getAnchorLabelTargets(anchor) {
    const targets = new Set();

    // New button setup:
    // <button athn_anchor="guide">
    //   <span class="w-form-label">Guides</span>
    // </button>
    anchor.querySelectorAll('.w-form-label').forEach((label) => {
        targets.add(label);
    });

    // Old setup:
    // <label>
    //   <input athn_anchor="guide">
    //   <span class="w-form-label">Guides</span>
    // </label>
    const parent = anchor.parentElement;

    if (parent) {
        Array.from(parent.children).forEach((sibling) => {
            if (sibling === anchor) return;

            if (sibling.matches('.w-form-label')) {
                targets.add(sibling);
            }
        });
    }

    // Fallback:
    // If the anchor itself is the label.
    if (anchor.matches('.w-form-label')) {
        targets.add(anchor);
    }

    return Array.from(targets);
}

function getAnchorStateTargets(anchor) {
    const targets = new Set();

    targets.add(anchor);

    const parent = anchor.parentElement;

    if (parent) {
        targets.add(parent);
    }

    getAnchorLabelTargets(anchor).forEach((label) => {
        targets.add(label);
    });

    return Array.from(targets);
}

function getAnchorActiveTargets(anchor) {
    return getAnchorLabelTargets(anchor);
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

export function scrollToAnchorTarget(target, config, onComplete) {
    if (!target) return;

    const duration = Number(config.behavior.scrollDuration) || 700;

    const startY = window.scrollY;
    const endY = getAnchorScrollY(target, config);
    const distance = endY - startY;

    function finish() {
        if (typeof onComplete === 'function') {
            onComplete();
        }
    }

    if (!config.behavior.smoothScroll || duration <= 0) {
        window.scrollTo(0, endY);
        finish();
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
            return;
        }

        finish();
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
        const isButton = anchor.tagName === 'BUTTON';

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

        if (isButton) {
            anchor.disabled = isDisabled;
        }

        if (isDisabled) {
            anchor.removeAttribute('aria-current');

            if (!isButton) {
                anchor.setAttribute('tabindex', '-1');
            }
        } else {
            if (!isButton) {
                anchor.removeAttribute('tabindex');
            }
        }
    });
}

export function clearActiveAnchorLabels(root, config) {
    const selector = getAnchorSelector(config);
    const activeClassNames = getActiveClassNames(config);

    qsAll(selector, root).forEach((anchor) => {
        const activeTargets = getAnchorActiveTargets(anchor);

        activeTargets.forEach((target) => {
            activeClassNames.forEach((className) => {
                target.classList.remove(className);
            });
        });

        anchor.removeAttribute('aria-current');
    });
}

export function setActiveAnchorByType(root, config, type, counts = {}) {
    if (!type) return;

    const selector = getAnchorSelector(config);
    const activeClassNames = getActiveClassNames(config);

    clearActiveAnchorLabels(root, config);

    qsAll(selector, root).forEach((anchor) => {
        const value = getAnchorValue(anchor);

        if (value !== type) return;

        const count = counts[value] || 0;
        const isDisabled =
            count === 0 ||
            anchor.disabled === true ||
            anchor.classList.contains(config.classNames.disabled) ||
            anchor.getAttribute('aria-disabled') === 'true' ||
            anchor.getAttribute('data-athn-disabled') === 'true';

        if (isDisabled) return;

        const activeTargets = getAnchorActiveTargets(anchor);

        activeTargets.forEach((target) => {
            activeClassNames.forEach((className) => {
                target.classList.add(className);
            });
        });

        anchor.setAttribute('aria-current', 'true');
    });
}

export function updateActiveAnchorFromScroll(root, config, counts = {}) {
    if (!config.behavior.scrollSpy) return;

    const sections = qsAll(config.selectors.section, root);

    const scrollLine = getScrollSpyLineY(config);

    let activeSection = null;
    let previousVisibleSection = null;
    let nextVisibleSection = null;

    sections.forEach((section) => {
        if (isSelfHidden(section)) return;

        const type = getAttr(section, 'content-type');

        if (!type) return;

        const count = counts[type] || 0;

        if (count === 0) return;

        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top + window.scrollY;
        const sectionBottom = sectionTop + rect.height;

        if (rect.height <= 0) return;

        const lineIsInsideSection =
            sectionTop <= scrollLine && sectionBottom > scrollLine;

        if (lineIsInsideSection) {
            activeSection = section;
            return;
        }

        if (sectionTop <= scrollLine) {
            previousVisibleSection = section;
            return;
        }

        if (!nextVisibleSection) {
            nextVisibleSection = section;
        }
    });

    const bestSection = activeSection || previousVisibleSection || nextVisibleSection;

    if (!bestSection) {
        clearActiveAnchorLabels(root, config);
        return;
    }

    const activeType = getAttr(bestSection, 'content-type');

    setActiveAnchorByType(root, config, activeType, counts);
}