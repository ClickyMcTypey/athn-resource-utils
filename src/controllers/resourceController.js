import { DEFAULT_CONFIG } from '../config/defaults.js';
import { mergeConfig } from '../utils/mergeConfig.js';
import { qsAll } from '../utils/dom.js';
import {
    getResourceCounts,
    updateCountLabels,
    updateEmptyStates
} from '../services/resourceCounts.js';
import {
    getAnchorTarget,
    scrollToAnchorTarget,
    updateUrlHash
} from '../services/anchorScroll.js';

export function createResourceController(userConfig = {}) {
    const config = mergeConfig(DEFAULT_CONFIG, userConfig);
    const root = config.root || document;

    let updateTimer = null;
    let observer = null;

    function log(...args) {
        if (!config.debug) return;
        console.log('[athn-resource-utils]', ...args);
    }

    function sync() {
        const counts = getResourceCounts(root, config);

        updateCountLabels(root, config, counts);
        updateEmptyStates(root, config, counts);

        log('sync complete', { counts });
    }

    function scheduleSync() {
        clearTimeout(updateTimer);

        updateTimer = window.setTimeout(() => {
            window.requestAnimationFrame(sync);
        }, config.updateDelay);
    }

    function handleAnchorClick(event) {
        const anchor = event.target.closest(
            `${config.selectors.anchor}, ${config.selectors.legacyAnchor}`
        );

        if (!anchor) return;

        const target = getAnchorTarget(anchor, root, config);

        if (!target) return;

        event.preventDefault();

        scrollToAnchorTarget(target, config);
        updateUrlHash(target, anchor, config);
    }

    function attachListeners() {
        root.addEventListener('click', handleAnchorClick, true);

        root.addEventListener('change', scheduleSync, true);
        root.addEventListener('input', scheduleSync, true);
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
        scrollTo: (type) => {
            const target = root.querySelector(`[content-type="${CSS.escape(type)}"]`);
            scrollToAnchorTarget(target, config);
        },
        getCounts: () => getResourceCounts(root, config)
    };

    return api;
}