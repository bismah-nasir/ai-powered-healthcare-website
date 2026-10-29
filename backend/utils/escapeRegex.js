/**
 * Escapes regex special characters so user input is matched literally
 * (e.g. "Vitamin C (500mg)" no longer produces an invalid pattern).
 */
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export default escapeRegex;
