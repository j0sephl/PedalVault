/**
 * Shared utilities.
 */

/**
 * Debounce function to limit how often a function can be called
 * Prevents excessive API calls or DOM updates during rapid user input
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Escape HTML to prevent XSS attacks.
 * Also escapes quotes so the result is safe inside double- or
 * single-quoted attribute values, not just text content.
 * @param {string} str - String to escape
 * @returns {string} HTML-escaped string
 */
export function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Check that a URL is safe to open or save as a purchase link.
 * Only http: and https: are allowed (blocks javascript:, data:, etc.).
 * @param {string} url - URL to validate
 * @returns {boolean} True if the URL parses and uses http(s)
 */
export function isSafeHttpUrl(url) {
    if (typeof url !== 'string' || !url) return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (e) {
        return false;
    }
}

/**
 * Normalize a user-entered purchase URL for storage.
 * Adds https:// to scheme-less input like "www.mouser.com/...".
 * Returns '' for anything that still isn't a valid http(s) URL.
 * @param {string} url - Raw user input
 * @returns {string} A safe http(s) URL, or ''
 */
export function sanitizePurchaseUrl(url) {
    if (typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (isSafeHttpUrl(trimmed)) return trimmed;
    // Tolerate scheme-less input (the old code stored it as-is,
    // which produced a broken relative link anyway)
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
        const withScheme = 'https://' + trimmed;
        if (isSafeHttpUrl(withScheme)) return withScheme;
    }
    return '';
}

/**
 * Escape a value for inclusion in a CSV cell
 * Doubles quotes and wraps the value when it contains a comma,
 * quote, or newline
 * @param {*} val - Value to escape
 * @returns {string} CSV-safe cell value
 */
export function csvEscape(val) {
    if (val == null) return '';
    val = String(val);
    if (val.includes('"')) val = val.replace(/"/g, '""');
    if (val.search(/[",\n]/) !== -1) return '"' + val + '"';
    return val;
}

/**
 * Generic utility function to copy text to clipboard
 * Uses modern clipboard API with fallback to execCommand
 * @param {string} text - Text to copy to clipboard
 * @param {Function} onSuccess - Optional callback for success
 * @param {Function} onError - Optional callback for error
 * @returns {Promise<boolean>} Promise that resolves to true if successful
 */
export function copyToClipboard(text, onSuccess, onError) {
    if (!text) {
        console.error('No text provided to copy');
        if (onError) onError('No text provided');
        return Promise.resolve(false);
    }
    
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text)
            .then(() => {
                if (onSuccess) onSuccess();
                return true;
            })
            .catch(err => {
                console.error('Failed to copy with clipboard API:', err);
                // Fallback to execCommand
                return fallbackCopyTextToClipboard(text, onSuccess, onError);
            });
    } else {
        // Fallback for older browsers or non-secure contexts
        return fallbackCopyTextToClipboard(text, onSuccess, onError);
    }
}

/**
 * Copy the prompt template to clipboard
 * Uses the generic copyToClipboard utility function
 */
export function copyPromptTemplate() {
    const promptTemplate = document.getElementById('promptTemplate');
    if (!promptTemplate) {
        console.error('Prompt template element not found');
        return;
    }
    
    const textToCopy = promptTemplate.textContent;
    
    copyToClipboard(
        textToCopy,
        () => import('./notifications.js').then(({ showNotification }) => {
            showNotification('Prompt template copied to clipboard!', 'success');
        }),
        () => import('./notifications.js').then(({ showNotification }) => {
            showNotification('Failed to copy prompt template', 'error');
        })
    );
}

/**
 * Fallback copy method using execCommand
 * @param {string} text - Text to copy
 * @param {Function} onSuccess - Optional callback for success
 * @param {Function} onError - Optional callback for error
 * @returns {Promise<boolean>} Promise that resolves to true if successful
 */
export function fallbackCopyTextToClipboard(text, onSuccess, onError) {
    return new Promise((resolve) => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                if (onSuccess) onSuccess();
                resolve(true);
            } else {
                console.error('Fallback copy command failed');
                if (onError) onError('Copy command failed');
                resolve(false);
            }
        } catch (err) {
            console.error('Fallback copy failed:', err);
            if (onError) onError('Copy failed');
            resolve(false);
        }
        
        document.body.removeChild(textArea);
    });
}
