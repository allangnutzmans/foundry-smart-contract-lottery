export function getCssVar(name: string, fallback = ''): string {
    if (typeof window === 'undefined') return fallback;

    const root = document.documentElement;
    const value = getComputedStyle(root).getPropertyValue(name);

    return value?.trim() || fallback;
}