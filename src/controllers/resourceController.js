import { DEFAULT_CONFIG } from '../config/defaults.js';
import { mergeConfig } from '../utils/mergeConfig.js';
import {
    getResourceCounts,
    updateCountLabels,
    updateSections
} from '../services/resourceCounts.js';
import {
    getAnchorTarget,
    scrollToAnchorTarget,
    updateUrlHash,
    updateAnchorStates,
    updateActiveAnchorFromScroll,
    setActiveAnchorByType
} from '../services/anchorScroll.js';

export function createResourceController(userConfig = {}) {
    const config = mergeConfig(DEFAULT_CONFIG, userConfig);
    const root = config.root || document;

    let updateTimer = null;
    let observer = null;

    let scrollSpyFrame = null;
    let latestCounts = {};

    function log(...args) {
        if (!config.debug) return;
        console.log('[athn-resource-utils]', ...args);
    }

    function sync() {
        const counts = getResourceCounts(root, config);

        latestCounts = counts;

        updateCountLabels(root, config, counts);
        updateSections(root, config, counts);
        updateAnchorStates(root, config, counts);
        updateActiveAnchorFromScroll(root, config, counts);

        log('sync complete', { counts });
    }

    function scheduleScrollSpy() {
        if (!config.behavior.scrollSpy) return;
        if (scrollSpyFrame) return;

        scrollSpyFrame = window.requestAnimationFrame(() => {
            scrollSpyFrame = null;
            updateActiveAnchorFromScroll(root, config, latestCounts);
        });
    }

    function scheduleSync() {
        clearTimeout(updateTimer);

        updateTimer = window.setTimeout(() => {
            window.requestAnimationFrame(sync);
        }, config.updateDelay);
    }

    function handleAnchorClick(event) {
        const selector = `${config.selectors.anchor}, ${config.selectors.legacyAnchor}`;
        const anchor = event.target.closest(selector);

        if (!anchor) return;

        event.preventDefault();

        const isDisabled =
            anchor.classList.contains(config.classNames.disabled) ||
            anchor.getAttribute('aria-disabled') === 'true' ||
            anchor.getAttribute('data-athn-disabled') === 'true';

        if (isDisabled) return;

        const target = getAnchorTarget(anchor, root);

        if (!target) return;

        const type = target.getAttribute('content-type');

        setActiveAnchorByType(root, config, type, latestCounts);
        scrollToAnchorTarget(target, config);
        updateUrlHash(anchor, config);
    }

    function attachListeners() {
        root.addEventListener('click', handleAnchorClick, true);

        root.addEventListener('change', scheduleSync, true);
        root.addEventListener('input', scheduleSync, true);

        window.addEventListener('scroll', scheduleScrollSpy, { passive: true });
        window.addEventListener('resize', scheduleScrollSpy);
    }

    function attachObserver() {
        if (!config.behavior.observeDomChanges) return;

        const target = root === document ? document.body : root;

        if (!target) return;

        observer = new MutationObserver(() => {
            scheduleSync();
        });

        observer.observe(target, {
            subtree: true,
            childList: true,
            attributes: true,
            attributeFilter: ['style', 'class', 'hidden', 'aria-hidden']
        });
    }

    function init() {
        attachListeners();
        attachObserver();
        scheduleSync();

        log('initialized');

        return api;
    }

    function destroy() {
        clearTimeout(updateTimer);

        if (scrollSpyFrame) {
            window.cancelAnimationFrame(scrollSpyFrame);
            scrollSpyFrame = null;
        }

        window.removeEventListener('scroll', scheduleScrollSpy);
        window.removeEventListener('resize', scheduleScrollSpy);

        if (observer) {
            observer.disconnect();
            observer = null;
        }

        log('destroyed');
    }

    const api = {
        init,
        destroy,
        sync,
        scheduleSync,
        getCounts: () => getResourceCounts(root, config)
    };

    return api;
}