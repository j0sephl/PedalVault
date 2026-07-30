/**
 * Keyboard shortcuts — inventory list navigation and app jumps.
 *
 * ↑/↓ select part · ←/→ qty −/+ · Enter edit
 * / search · n/a add · p projects · b BOM · e export · ? about
 */
import {
    getSelectedPartId,
    setSelectedPartId
} from './state.js';
import {
    modalStack,
    showBOMAssistantModal,
    showAboutModal
} from './matching.js';
import {
    adjustStockInline,
    showAddPartModal,
    showEditPartModal,
    applyInventorySelection
} from './inventory-ui.js';
import { showProjectManagementModal } from './projects.js';
import { showExportModal } from './backup.js';

function isTypingTarget(el) {
    if (!el || el === document.body) return false;
    const tag = el.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (el.isContentEditable) return true;
    return false;
}

function getVisibleItems() {
    return Array.from(document.querySelectorAll('#inventoryItems .inventory-item'));
}

function moveSelection(delta) {
    const items = getVisibleItems();
    if (!items.length) return;

    const currentId = getSelectedPartId();
    let idx = items.findIndex((el) => el.getAttribute('data-part-id') === currentId);
    if (idx < 0) {
        idx = delta > 0 ? -1 : 0;
    }

    const next = Math.max(0, Math.min(items.length - 1, idx + delta));
    const id = items[next].getAttribute('data-part-id');
    setSelectedPartId(id);
    applyInventorySelection({ focus: true });
}

/**
 * Global shortcut handler. Modal Escape/Tab stay in handleModalKeydown.
 */
export function handleShortcutKeydown(e) {
    if (modalStack.length > 0) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    const typing = isTypingTarget(document.activeElement);

    if (e.key === '/' && !typing) {
        e.preventDefault();
        const search = document.getElementById('searchInput');
        if (search) search.focus();
        return;
    }

    if (typing) {
        if (e.key === 'Escape' && document.activeElement?.id === 'searchInput') {
            document.activeElement.blur();
            applyInventorySelection({ focus: true });
        }
        return;
    }

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            moveSelection(1);
            break;
        case 'ArrowUp':
            e.preventDefault();
            moveSelection(-1);
            break;
        case 'ArrowRight': {
            const id = getSelectedPartId();
            if (!id) {
                moveSelection(1);
                break;
            }
            e.preventDefault();
            adjustStockInline(id, 'add');
            applyInventorySelection({ focus: true });
            break;
        }
        case 'ArrowLeft': {
            const id = getSelectedPartId();
            if (!id) {
                moveSelection(1);
                break;
            }
            e.preventDefault();
            adjustStockInline(id, 'remove');
            applyInventorySelection({ focus: true });
            break;
        }
        case 'Enter': {
            const id = getSelectedPartId();
            if (!id) break;
            e.preventDefault();
            showEditPartModal(id);
            break;
        }
        case 'n':
        case 'N':
        case 'a':
        case 'A':
            e.preventDefault();
            showAddPartModal();
            break;
        case 'p':
        case 'P':
            e.preventDefault();
            showProjectManagementModal();
            break;
        case 'b':
        case 'B':
            e.preventDefault();
            showBOMAssistantModal();
            break;
        case 'e':
        case 'E':
            e.preventDefault();
            showExportModal();
            break;
        case '?':
            e.preventDefault();
            showAboutModal();
            break;
        default:
            break;
    }
}

export function initShortcuts() {
    document.addEventListener('keydown', handleShortcutKeydown);
}
