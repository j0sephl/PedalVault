/**
 * Cached DOM lookups.
 */
/**
 * Cache frequently accessed DOM elements for better performance
 * Avoids repeated getElementById calls throughout the application
 */
export const DOM = {
    get: function(id) {
        return document.getElementById(id);
    },
    // Main inventory display container
    inventoryItems: document.getElementById('inventoryItems'),
    // Search and filter controls
    searchInput: document.getElementById('searchInput'),
    sortDropdown: document.getElementById('sortDropdown'),
    projectFilter: document.getElementById('projectFilter'),
    inventoryList: document.querySelector('.inventory-list'),
    // Modal dialog references for quick access
    modals: {
        addPart: document.getElementById('addPartModal'),
        editPart: document.getElementById('editPartModal'),
        deletePart: document.getElementById('deletePartModal'),
        export: document.getElementById('exportModal'),
        bom: document.getElementById('bomModal'),
        projectManagement: document.getElementById('projectManagementModal'),
        projectName: document.getElementById('projectNameModal'),
        exportBOM: document.getElementById('exportBOMModal')
    }
};
