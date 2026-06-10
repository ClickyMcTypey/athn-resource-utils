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
    const targetTop = target.getBoundingClientRect().top + window.scrollY;
    const scrollTop = Math.max(targetTop - offset, 0);

    window.scrollTo({
        top: scrollTop,
        behavior: config.behavior.smoothScroll ? 'smooth' : 'auto'
    });
}

export function updateUrlHash(anchor, config) {
    if (!config.behavior.updateHash) return;

    const value = getAnchorValue(anchor);

    if (!value) return;

    window.history.pushState(null, '', `#${value}`);
}

export function updateAnchorStates(root, config, counts) {
    const selector = `${config.selectors.anchor}, ${config.selectors.legacyAnchor}`;

    qsAll(selector, root).forEach((anchor) => {
        const value = getAnchorValue(anchor);

        if (!value) return;

        const count = counts[value] || 0;
        const isDisabled = count === 0;

        anchor.classList.toggle(config.classNames.disabled, isDisabled);
        anchor.setAttribute('aria-disabled', isDisabled ? 'true' : 'false');
        anchor.setAttribute('data-athn-disabled', isDisabled ? 'true' : 'false');

        if (isDisabled) {
            anchor.setAttribute('tabindex', '-1');
        } else {
            anchor.removeAttribute('tabindex');
        }
    });
}