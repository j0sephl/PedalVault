/**
 * Backup export/import.
 */
import {
    getPendingImportFile,
    setPendingImportFile,
    setCurrentPartId,
    getInventory,
    setInventory,
    getProjects,
    setProjects
} from './state.js';
import { DOM } from './dom-cache.js';
import { sanitizePurchaseUrl, csvEscape } from './utils.js';
import { saveInventory, saveProjects, clearBackupPending } from './storage.js';
import { showNotification } from './notifications.js';
import { displayInventory } from './inventory-ui.js';
import { mergeDuplicateInventoryEntries, hideMobileNav, showMobileNav, showModal, hideModal } from './matching.js';
import { updateProjectFilter } from './projects.js';

// =============================================================================
// DATA EXPORT/IMPORT FUNCTIONALITY
// =============================================================================

/**
 * Show the export options modal dialog
 */
export function showExportModal() {
    showModal('exportModal');
    hideMobileNav();
}

/**
 * Hide the export options modal dialog
 */
export function hideExportModal() {
    hideModal('exportModal');
    showMobileNav();
}

/**
 * Export inventory data in the specified format (JSON or CSV)
 * Creates a downloadable file containing all inventory and project data
 * 
 * @param {string} format - Either 'csv' or 'json' (default)
 */
export function exportInventory(format) {
    // Create timestamp for unique filename
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    let filename, dataStr, mimeType, defaultName;
    
    // Handle CSV format export
    if (format === 'csv') {
        defaultName = `guitar-pedal-inventory-${timestamp}.csv`;
        
        // Define CSV column headers
        const headers = ['Part ID', 'Name', 'Type', 'Quantity', 'Purchase URL', 'Projects'];
        
        /**
         * Escape CSV field values to handle commas, quotes, and newlines
         * @param {*} val - Value to escape
         * @returns {string} Properly escaped CSV field
         */
        
        // Convert inventory entries to CSV rows
        const rows = Object.entries(getInventory()).map(([id, part]) => [
            id,
            part.name,
            part.type || '',
            part.quantity,
            part.purchaseUrl || '',
            // Serialize project assignments as "projectId:quantity" pairs
            part.projects ? Object.entries(part.projects).map(([pid, qty]) => `${pid}:${qty}`).join(';') : ''
        ].map(csvEscape));
        
        // Combine headers and data rows
        dataStr = [headers.map(csvEscape), ...rows].map(row => row.join(',')).join('\n');
        mimeType = 'text/csv';
    } else {
        // Handle JSON format export (default)
        defaultName = `guitar-pedal-inventory-${timestamp}.json`;
        // Export both inventory and projects data with pretty formatting
        dataStr = JSON.stringify({ inventory: getInventory(), projects: getProjects() }, null, 2);
        mimeType = 'application/json';
    }
    
    // Use default filename for better UX (avoids prompt dialog)
    filename = defaultName;
    // Ensure correct extension
    if (format === 'csv' && !filename.endsWith('.csv')) filename += '.csv';
    if (format !== 'csv' && !filename.endsWith('.json')) filename += '.json';

    const dataBlob = new Blob([dataStr], {type: mimeType});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    hideExportModal();
    clearBackupPending();
    showNotification(`Exported backup to ${filename}`);
}

/**
 * Drop non-http(s) purchase URLs from imported inventory data.
 * Imported files are untrusted; a javascript: URL here would execute
 * when the user clicks the part's shop button.
 */
export function sanitizeImportedPurchaseUrls(inventoryData) {
    for (const partId in inventoryData) {
        const part = inventoryData[partId];
        if (part && part.purchaseUrl) {
            part.purchaseUrl = sanitizePurchaseUrl(String(part.purchaseUrl));
        }
    }
}

export function importInventory(event) {
    const file = event.target.files[0];
    if (!file) return;

    const partCount = Object.keys(getInventory()).length;
    const projectCount = Object.keys(getProjects()).length;
    if (partCount > 0 || projectCount > 0) {
        setPendingImportFile(file);
        const message = document.getElementById('loadBackupConfirmMessage');
        if (message) {
            message.textContent = `Replace ${partCount} part${partCount === 1 ? '' : 's'} and ${projectCount} project${projectCount === 1 ? '' : 's'} with “${file.name}”? This overwrites data stored in this browser.`;
        }
        showModal('loadBackupConfirmModal');
        hideMobileNav();
        // Keep the input value so Cancel can clear it; confirm proceeds from pendingImportFile
        return;
    }

    proceedImportInventory(file, event.target);
}

export function requestLoadBackup() {
    const importFile = document.getElementById('importFile');
    if (!importFile) return;

    // Prefer File System Access API when available (desktop Chrome/Edge)
    (async () => {
        try {
            if ('showOpenFilePicker' in window) {
                const [fileHandle] = await window.showOpenFilePicker({
                    types: [{
                        description: 'Inventory Files',
                        accept: {
                            'application/json': ['.json'],
                            'text/csv': ['.csv']
                        }
                    }]
                });
                const file = await fileHandle.getFile();
                importInventory({ target: { files: [file], value: '' } });
                return;
            }
        } catch (err) {
            if (err.name === 'AbortError') return;
            console.error('Error opening file:', err);
        }
        importFile.value = '';
        importFile.click();
    })();
}

export function hideLoadBackupConfirmModal() {
    hideModal('loadBackupConfirmModal');
    setPendingImportFile(null);
    const importFile = document.getElementById('importFile');
    if (importFile) importFile.value = '';
    showMobileNav();
}

export function confirmLoadBackup() {
    const file = getPendingImportFile();
    hideModal('loadBackupConfirmModal');
    setPendingImportFile(null);
    const importFile = document.getElementById('importFile');
    if (!file) {
        if (importFile) importFile.value = '';
        showMobileNav();
        return;
    }
    proceedImportInventory(file, importFile);
    showMobileNav();
}

export function proceedImportInventory(file, inputEl) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const fileContent = e.target.result;
            let importedData;

            // Check if file is CSV
            if (file.name.toLowerCase().endsWith('.csv')) {
                // Use PapaParse to parse CSV
                if (typeof Papa === 'undefined') {
                    throw new Error('CSV parser unavailable offline. Reload while online once, or use JSON backup.');
                }
                const parsed = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
                if (parsed.errors.length) {
                    throw new Error('CSV parse error: ' + parsed.errors[0].message);
                }
                importedData = {};
                parsed.data.forEach(row => {
                    // Normalize headers
                    const id = row['Part ID'] || row['part id'] || row['ID'] || row['id'] || normalizeValue(row['Name'] || row['name'] || '');
                    const name = row['Name'] || row['name'] || '';
                    if (!name) return; // skip if no name
                    const type = row['Type'] || row['type'] || '';
                    const quantity = parseInt(row['Quantity'] || row['quantity'] || '0') || 0;
                    const purchaseUrl = row['Purchase URL'] || row['purchase url'] || '';
                    let projectsMap = {};
                    const projectsRaw = row['Projects'] || row['projects'] || '';
                    if (projectsRaw) {
                        projectsRaw.split(';').forEach(pair => {
                            const [pid, qty] = pair.split(':').map(s => s.trim());
                            if (pid) projectsMap[pid] = qty ? parseInt(qty) || 0 : 0;
                        });
                    }
                    importedData[id] = {
                        name: name,
                        type: type || undefined,
                        quantity: quantity,
                        purchaseUrl: purchaseUrl,
                        projects: projectsMap
                    };
                });
            } else {
                // Parse JSON
                importedData = JSON.parse(fileContent);
            }
            
            if (importedData.inventory && importedData.projects) {
                setInventory(importedData.inventory);
                setProjects(importedData.projects);
                sanitizeImportedPurchaseUrls(getInventory());
                // Auto-merge duplicates after import (silently)
                mergeDuplicateInventoryEntries(false);
                saveProjects();
                updateProjectFilter();
            } else if (typeof importedData === 'object' && importedData !== null) {
                // Fallback for old format or CSV import
                setInventory(importedData);
                sanitizeImportedPurchaseUrls(getInventory());
                // --- Begin: Ensure projects are globally tagged and BOMs updated ---
                for (const partId in getInventory()) {
                    const part = getInventory()[partId];
                    if (part.projects) {
                        for (const projectId in part.projects) {
                            // Create project if missing
                            if (!getProjects()[projectId]) {
                                getProjects()[projectId] = {
                                    name: projectId,
                                    bom: {}
                                };
                            }
                            // Add part to project BOM with correct quantity
                            if (!getProjects()[projectId].bom) getProjects()[projectId].bom = {};
                            getProjects()[projectId].bom[partId] = {
                                name: part.name,
                                quantity: part.projects[projectId]
                            };
                        }
                    }
                }
                // Auto-merge duplicates after import (silently)
                mergeDuplicateInventoryEntries(false);
                saveProjects();
                updateProjectFilter();
            } else {
                throw new Error('Invalid file format');
            }
            saveInventory();
            displayInventory();
            setCurrentPartId(null);
            showNotification('Inventory imported successfully!');
            clearBackupPending();
        } catch (err) {
            showNotification('Error importing inventory: ' + err.message, 'error');
        } finally {
            if (inputEl) inputEl.value = '';
        }
    };
    reader.readAsText(file);
}

