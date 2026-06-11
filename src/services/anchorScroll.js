import { getAttr, qsAll } from '../utils/dom.js';

function escapeCss(value) {
    if (window.CSS && CSS.escape) return CSS.escape(value);
    return value.replace(/["\\]/g, '\\$&');
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

export function updateAnchorStates(root, config, counts) {
    const selector = `${config.selectors.anchor}, ${config.selectors.legacyAnchor}`;

    const activeClassNames = Array.isArray(config.classNames.active)
        ? config.classNames.active
        : [config.classNames.active].filter(Boolean);

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