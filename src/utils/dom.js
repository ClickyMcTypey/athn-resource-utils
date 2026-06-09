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
 * This intentionally checks the item itself, not the parent section.
 * That prevents our own section hiding from making counts become 0.
 */
export function isItemAvailable(item) {
    if (!item || !item.isConnected) return false;
    if (item.hidden) return false;
    if (item.getAttribute('aria-hidden') === 'true') return false;

    const style = window.getComputedStyle(item);

    return style.display !== 'none' && style.visibility !== 'hidden';
}