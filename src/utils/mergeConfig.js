export function mergeConfig(base, override = {}) {
    return {
        ...base,
        ...override,

        selectors: {
            ...base.selectors,
            ...(override.selectors || {})
        },

        behavior: {
            ...base.behavior,
            ...(override.behavior || {})
        }
    };
}