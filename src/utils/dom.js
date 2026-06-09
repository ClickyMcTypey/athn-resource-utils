export function qsAll(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
}

export function getAttr(el, attr) {
    return el?.getAttribute(attr)?.trim() || '';
}

export function setDisplay(el, shouldShow, displayValue = '') {
    if (!el) return;

    const nextDisplay = shouldShow ? displayValue : 'none';

    if (el.style.display !== nextDisplay) {
        el.style.display = nextDisplay;
    }
}

/**
 * Checks only the item itself.
 *
 * Important:
 * Do not check parent visibility here.
 * If we check parent visibility, then hiding the whole [content-type]
 * section would make all children look hidden forever.
 */
export function isSelfHidden(el) {
    if (!el || !el.isConnected) return true;
    if (el.hidden) return true;
    if (el.getAttribute('aria-hidden') === 'true') return true;

    const style = window.getComputedStyle(el);

    return style.display === 'none' || style.visibility === 'hidden';
}