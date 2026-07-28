/**
 * Toasts and NFC deep-link entry.
 */
import {
    getPendingQtyUndo,
    setPendingQtyUndo,
    getInventory
} from './state.js';
import { adjustStockInline } from './inventory-ui.js';

// =============================================================================
// USER INTERFACE UTILITIES
// =============================================================================

/**
 * Display a notification message to the user
 * Shows a temporary notification that auto-hides after 5 seconds
 * 
 * @param {string} message - The message to display
 * @param {string} type - 'success' (default) or 'error' for styling
 * @param {{ undo?: Function }} [options] - Optional undo callback for qty adjustments
 */
export function showNotification(message, type = 'success', options = {}) {
    const notification = document.getElementById('notification');
    if (!notification) return;

    // Clear any existing timeouts so rapid notifications don't race
    if (notification.hideTimeout) {
        clearTimeout(notification.hideTimeout);
        notification.hideTimeout = null;
    }
    if (notification.showTimeout) {
        clearTimeout(notification.showTimeout);
        notification.showTimeout = null;
    }

    setPendingQtyUndo(typeof options.undo === 'function' ? options.undo : null);

    // Force reset without destroying structured children (message + undo)
    notification.className = 'notification';
    notification.classList.remove('show', 'error', 'has-undo');
    notification.style.cssText = '';
    const messageEl = notification.querySelector('.notification-message');
    const undoBtn = document.getElementById('notificationUndoBtn');
    if (messageEl) messageEl.textContent = '';
    if (undoBtn) undoBtn.classList.add('hidden');

    // Force reflow to ensure reset is applied
    notification.offsetHeight;

    // Small delay to ensure the reset is complete before showing
    notification.showTimeout = setTimeout(() => {
        notification.showTimeout = null;
        const liveMessage = notification.querySelector('.notification-message');
        const liveUndo = document.getElementById('notificationUndoBtn');
        if (liveMessage) liveMessage.textContent = message;
        notification.className = `notification${type === 'error' ? ' error' : ''}`;
        notification.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

        if (liveUndo) {
            if (getPendingQtyUndo()) {
                liveUndo.classList.remove('hidden');
                notification.classList.add('has-undo');
            } else {
                liveUndo.classList.add('hidden');
            }
        }

        notification.offsetHeight;
        notification.classList.add('show');

        const hideMs = getPendingQtyUndo() ? 8000 : 5000;
        notification.hideTimeout = setTimeout(() => {
            notification.classList.remove('show');
            notification.hideTimeout = null;
            setPendingQtyUndo(null);
            const btn = document.getElementById('notificationUndoBtn');
            if (btn) btn.classList.add('hidden');
        }, hideMs);
    }, 100);
}

export function clearStuckNotifications() {
    const notification = document.getElementById('notification');
    if (notification) {
        if (notification.hideTimeout) {
            clearTimeout(notification.hideTimeout);
            notification.hideTimeout = null;
        }
        if (notification.showTimeout) {
            clearTimeout(notification.showTimeout);
            notification.showTimeout = null;
        }

        setPendingQtyUndo(null);

        notification.className = 'notification';
        notification.classList.remove('show', 'error', 'has-undo');
        const messageEl = notification.querySelector('.notification-message');
        if (messageEl) messageEl.textContent = '';
        const undoBtn = document.getElementById('notificationUndoBtn');
        if (undoBtn) undoBtn.classList.add('hidden');
        notification.style.cssText = '';

        notification.offsetHeight;
    }
}

/**
 * Check URL parameters for part-specific actions (deep linking support)
 * Supports actions like quickly removing stock for a specific part
 * Example: ?part=resistor_10k&remove=1
 */
export function checkUrlForPart() {
    const urlParams = new URLSearchParams(window.location.search);
    const partId = urlParams.get('part');
    const quickRemove = urlParams.get('remove');
    
    if (partId && getInventory()[partId]) {
        if (quickRemove === '1') {
            adjustStockInline(partId, 'remove');
        }
    }
}



