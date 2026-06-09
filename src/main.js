import { createResourceController } from './controllers/resourceController.js';

const userConfig = window.ATHN_RESOURCE_UTILS_CONFIG || {};

const resourceUtils = createResourceController(userConfig);

window.AthnResourceUtils = resourceUtils;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        resourceUtils.init();
    }, { once: true });
} else {
    resourceUtils.init();
}