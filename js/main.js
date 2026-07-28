/**
 * PedalVault entry point.
 * Exposes onclick-compatible globals (HTML + generated markup still use inline handlers).
 */
import { DOM } from './dom-cache.js';
import { debounce, copyPromptTemplate } from './utils.js';
import { getPendingQtyUndo } from './state.js';
import { clearStuckNotifications } from './notifications.js';
import { detectDevicePerformance, checkBatteryOptimizations } from './device.js';
import {
    loadBackupPendingState,
    initializeInventory,
    updateHeaderCompactMode,
    updateBackupReminderUI
} from './storage.js';
import { searchParts, changeSortOrder } from './search.js';
import {
    hideLoadBackupConfirmModal,
    confirmLoadBackup,
    showExportModal,
    hideExportModal,
    exportInventory,
    importInventory,
    requestLoadBackup
} from './backup.js';
import {
    showProjectManagementModal,
    hideProjectManagementModal,
    showAllProjectRequirements,
    hideAllProjectRequirementsModal,
    filterByProject,
    showProjectNameModal,
    hideProjectNameModal,
    confirmProjectName,
    showDeleteProjectModal,
    hideDeleteProjectModal,
    confirmDeleteProject,
    hideProjectDetailsModal,
    showExportBOMModal,
    hideExportBOMModal,
    exportProjectBOM,
    compareBOM,
    processPastedBOM,
    addMissingParts,
    hideBOMModal,
    showBOMModal
} from './projects.js';
import {
    handleModalKeydown,
    showAboutModal,
    hideAboutModal,
    showBOMAssistantModal,
    hideBOMAssistantModal,
    showQuickPasteBOM,
    mergeDuplicateInventoryEntries,
    hideAllProjectTagsModal
} from './matching.js';
import {
    showAddPartModal,
    hideAddPartModal,
    addNewPart,
    saveEditPart,
    hideEditPartModal,
    confirmDeletePart,
    hideDeletePartModal
} from './inventory-ui.js';

/**
 * Initialize the application by setting up event listeners and loading data
 */
export function initializeApp() {
    clearStuckNotifications();

    const manageProjectsBtn = DOM.get('manageProjectsBtn');
    const compareAllProjectsBtn = DOM.get('compareAllProjectsBtn');
    const searchInput = DOM.get('searchInput');
    const projectFilter = DOM.get('projectFilter');
    const sortDropdown = DOM.get('sortDropdown');

    if (manageProjectsBtn) manageProjectsBtn.addEventListener('click', showProjectManagementModal);
    if (compareAllProjectsBtn) compareAllProjectsBtn.addEventListener('click', showAllProjectRequirements);

    if (searchInput) searchInput.addEventListener('input', debounce(searchParts, 250));
    if (projectFilter) projectFilter.addEventListener('change', filterByProject);
    if (sortDropdown) sortDropdown.addEventListener('change', changeSortOrder);

    const cancelLoadBackupBtn = DOM.get('cancelLoadBackupBtn');
    const confirmLoadBackupBtn = DOM.get('confirmLoadBackupBtn');
    if (cancelLoadBackupBtn) cancelLoadBackupBtn.addEventListener('click', hideLoadBackupConfirmModal);
    if (confirmLoadBackupBtn) confirmLoadBackupBtn.addEventListener('click', confirmLoadBackup);

    const notificationUndoBtn = DOM.get('notificationUndoBtn');
    if (notificationUndoBtn) {
        notificationUndoBtn.addEventListener('click', () => {
            const undo = getPendingQtyUndo();
            if (typeof undo === 'function') {
                undo();
            }
        });
    }

    detectDevicePerformance();
    checkBatteryOptimizations();

    loadBackupPendingState();
    initializeInventory();
    updateHeaderCompactMode();
    updateBackupReminderUI();

    document.addEventListener('keydown', handleModalKeydown);
}

// Inline onclick= handlers in index.html and generated markup expect globals.
Object.assign(window, {
    showExportModal,
    hideExportModal,
    exportInventory,
    importInventory,
    requestLoadBackup,
    showAboutModal,
    hideAboutModal,
    addNewPart,
    hideAddPartModal,
    showAddPartModal,
    saveEditPart,
    hideEditPartModal,
    confirmDeletePart,
    hideDeletePartModal,
    hideBOMModal,
    showBOMModal,
    showProjectNameModal,
    hideProjectNameModal,
    confirmProjectName,
    showProjectManagementModal,
    hideProjectManagementModal,
    confirmDeleteProject,
    hideDeleteProjectModal,
    showDeleteProjectModal,
    hideProjectDetailsModal,
    showAllProjectRequirements,
    hideAllProjectRequirementsModal,
    exportProjectBOM,
    showExportBOMModal,
    hideExportBOMModal,
    hideAllProjectTagsModal,
    copyPromptTemplate,
    processPastedBOM,
    hideBOMAssistantModal,
    showBOMAssistantModal,
    showQuickPasteBOM,
    mergeDuplicateInventoryEntries,
    compareBOM,
    addMissingParts
});

document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        initializeApp();
    }, 100);
});
