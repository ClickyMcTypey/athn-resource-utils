import { getAttr } from '../utils/dom.js';

export function getAnchorValue(anchor, config) {
    const anchorValue = getAttr(anchor, 'athn_anchor');

    if (anchorValue) return anchorValue;

    // Temporary support for old markup.
    const legacyValue = getAttr(anchor, 'athn_filter');

    if (legacyValue) return legacyValue;

    const href = getAttr(anchor, 'href');

    if (href?.startsWith('#')) {
        return href.slice(1);
    }

    return '';
}

export function getAnchorTarget(anchor, root, config) {
    const value = getAnchorValue(anchor, config);

    if (!value) return null;

    return root.querySelector(`[content-type="${CSS.escape(value)}"]`);
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

export function updateUrlHash(target, anchor, config) {
    if (!config.behavior.updateHash) return;

    const value = getAnchorValue(anchor, config);

    if (!value) return;

    window.history.pushState(null, '', `#${value}`);
}