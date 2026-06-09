import { DEFAULT_CONFIG } from '../config/defaults.js';
import { mergeConfig } from '../utils/mergeConfig.js';
import { qsAll } from '../utils/dom.js';
import {
    getActiveContentTypes,
    getResourceCounts,
    updateCountLabels,
    updateSections
} from '../services/resourceCounts.js';

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
        const activeContentTypes = getActiveContentTypes(root, config);
        const counts = getResourceCounts(root, config);

        updateCountLabels(root, config, counts);
        updateSections(root, config, counts, activeContentTypes);

        log('sync complete', {
            activeContentTypes: Array.from(activeContentTypes),
            counts
        });
    }

    function scheduleSync() {
        clearTimeout(updateTimer);

        updateTimer = window.setTimeout(() => {
            window.requestAnimationFrame(sync);
        }, config.updateDelay);
    }

    function attachListeners() {
        root.addEventListener('change', scheduleSync, true);
        root.addEventListener('input', scheduleSync, true);

        root.addEventListener(
            'click',
            (event) => {
                const clickedInteractiveElement = event.target.closest(
                    config.selectors.interactive
                );

                if (!clickedInteractiveElement) return;

                scheduleSync();
            },
            true
        );
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
        getCounts: () => getResourceCounts(root, config)
    };

    return api;
}