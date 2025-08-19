/**
 * GUITAR PEDAL INVENTORY MANAGEMENT SYSTEM
 * 
 * This application manages electronic components for guitar pedal building projects.
 * Key features:
 * - Inventory tracking with quantities and purchase URLs
 * - Project management with Bill of Materials (BOM)
 * - BOM comparison and requirements analysis
 * - Data import/export (JSON/CSV)
 * - Duplicate detection and merging
 * - Responsive design for mobile and desktop
 */

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Debounce function to limit how often a function can be called
 * Prevents excessive API calls or DOM updates during rapid user input
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
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
 * Escape HTML to prevent XSS attacks
 * @param {string} str - String to escape
 * @returns {string} HTML-escaped string
 */
function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// =============================================================================
// DOM ELEMENT CACHE
// =============================================================================

/**
 * Cache frequently accessed DOM elements for better performance
 * Avoids repeated getElementById calls throughout the application
 */
const DOM = {
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

// =============================================================================
// APPLICATION INITIALIZATION
// =============================================================================

/**
 * Main application entry point
 * Waits for DOM to load, then initializes the application with a small delay
 * to ensure all elements are properly rendered
 */
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initializeApp();
    }, 100);
});

/**
 * Initialize the application by setting up event listeners and loading data
 * This function connects all UI elements to their corresponding functionality
 */
function initializeApp() {
    // Clear any stuck notifications from previous sessions
    clearStuckNotifications();
    
    // =============================================================================
    // BUTTON REFERENCES - Main action buttons
    // =============================================================================
    const addPartBtn = DOM.get('addPartBtn');
    const compareBOMBtn = DOM.get('compareBOMBtn');
    const exportBOMModalBtn = DOM.get('exportBOMModalBtn');
    const saveDataBtn = DOM.get('saveDataBtn');
    const loadDataBtn = DOM.get('loadDataBtn');
    
    // Project management specific buttons
    const manageProjectsBtn = DOM.get('manageProjectsBtn');
    const compareAllProjectsBtn = DOM.get('compareAllProjectsBtn');
    
    // Search and filter controls
    const searchInput = DOM.get('searchInput');
    const projectFilter = DOM.get('projectFilter');
    const sortDropdown = DOM.get('sortDropdown');

    // =============================================================================
    // EVENT LISTENER SETUP - Connect UI elements to functionality
    // =============================================================================
    
    // Add event listeners only if elements exist (defensive programming)
    if (addPartBtn) addPartBtn.addEventListener('click', showAddPartModal);
    if (compareBOMBtn) compareBOMBtn.addEventListener('click', () => DOM.get('importBOM').click());
    if (exportBOMModalBtn) exportBOMModalBtn.addEventListener('click', showExportBOMModal);
    if (saveDataBtn) saveDataBtn.addEventListener('click', showExportModal);
    
    // Load Data button with modern File System Access API support
    if (loadDataBtn) {
        loadDataBtn.addEventListener('click', async () => {
            try {
                // Try using the File System Access API first (Chrome/Edge)
                // This provides a better user experience with native file dialogs
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
                    const event = { target: { files: [file] } };
                    importInventory(event);
                } else {
                    // Fallback for browsers that don't support File System Access API
                    // Uses traditional hidden file input approach
                    const importFile = DOM.get('importFile');
                    if (importFile) {
                        importFile.value = '';
                        importFile.click();
                    }
                }
            } catch (err) {
                // User cancelled file selection - not an error
                if (err.name !== 'AbortError') {
                    console.error('Error opening file:', err);
                }
            }
        });
    }
    
    // Project management button event listeners
    if (manageProjectsBtn) manageProjectsBtn.addEventListener('click', showProjectManagementModal);
    if (compareAllProjectsBtn) compareAllProjectsBtn.addEventListener('click', showAllProjectRequirements);
    
    // Search and filter event listeners with performance optimization
    // Debounce search input to avoid excessive filtering during typing
    if (searchInput) searchInput.addEventListener('input', debounce(searchParts, 250));
    if (projectFilter) projectFilter.addEventListener('change', filterByProject);
    if (sortDropdown) sortDropdown.addEventListener('change', changeSortOrder);

    // Initialize performance optimizations
    initializeIntersectionObserver();
    detectDevicePerformance();
    checkBatteryOptimizations();
    
    // Initialize the application data and display
    initializeInventory();

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            clearStuckNotifications();
        }
        // Debug shortcut: Test notification with Ctrl+Shift+N (or Cmd+Shift+N on Mac)
        // Uncomment for debugging: 
        // if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
        //     e.preventDefault();
        //     testNotification();
        // }
    });

    // ... existing code ...
    const bomAssistantBtn = DOM.get('bomAssistantBtn');
    if (bomAssistantBtn) bomAssistantBtn.addEventListener('click', showBOMAssistantModal);
    // ... existing code ...
}

// =============================================================================
// GLOBAL STATE VARIABLES
// =============================================================================

/**
 * Main inventory data structure
 * Format: { partId: { name, quantity, purchaseUrl, projects: {projectId: quantity}, type } }
 */
let inventory = {};

/**
 * Projects data structure  
 * Format: { projectId: { name, bom: {partId: {name, quantity}} } }
 */
let projects = {};

// UI state tracking variables
let currentPartId = null;        // Currently selected part for detailed view
let editingPartId = null;        // Part currently being edited in modal
let deletingPartId = null;       // Part pending deletion confirmation
let deletingProjectId = null;    // Project pending deletion confirmation

// Display and filtering state
let currentSortOrder = 'name-asc';     // Current sort order for inventory display
let currentProjectFilter = 'all';      // Current project filter selection
let currentSearchQuery = '';           // Current search query string

// Temporary data holders for multi-step operations
let pendingBomData = null;             // BOM data awaiting project name assignment

// =============================================================================
// DATA NORMALIZATION AND PERSISTENCE
// =============================================================================

/**
 * Clean up invalid inventory entries
 * Removes parts with null data, missing names, or other corruption
 */
function cleanupInvalidInventoryEntries() {
    let removedCount = 0;
    const invalidIds = [];
    
    for (const [id, part] of Object.entries(inventory)) {
        // Check for invalid parts
        if (!part || !part.name || typeof part !== 'object') {
            invalidIds.push(id);
            removedCount++;
            continue;
        }
        
        // Check for invalid quantities
        if (typeof part.quantity !== 'number' || part.quantity < 0) {
            part.quantity = 0;
        }
        
        // Ensure projects is an object
        if (part.projects && !Array.isArray(part.projects) && typeof part.projects !== 'object') {
            part.projects = {};
        }
    }
    
    // Remove invalid entries
    invalidIds.forEach(id => {
        console.warn(`Removing invalid inventory entry with ID: ${id}`);
        delete inventory[id];
    });
    
    if (removedCount > 0) {
        console.log(`Cleaned up ${removedCount} invalid inventory entries`);
        saveInventory();
    }
    
    return removedCount;
}

/**
 * Normalize component names and values for consistent matching
 * This function standardizes electronic component names to help identify duplicates
 * and match components across different naming conventions
 * 
 * @param {string} str - The component name or value to normalize
 * @returns {string} Normalized string for comparison
 */
function normalizeValue(str) {
    if (!str) return '';
    
    let normalized = str.toLowerCase()
        // Remove all non-alphanumeric characters except spaces (which become empty)
        .replace(/[^a-z0-9]/g, '')
        // Standardize common electronic component terms
        .replace(/ohm/g, '')              // Remove 'ohm' suffix
        .replace(/ohms/g, '')             // Remove 'ohms' suffix
        .replace(/resistor/g, 'res')      // Shorten 'resistor' to 'res'
        .replace(/capacitor/g, 'cap')     // Shorten 'capacitor' to 'cap'
        .replace(/potentiometer/g, 'pot') // Shorten 'potentiometer' to 'pot'
        .replace(/kilo/g, 'k')            // Standardize 'kilo' to 'k'
        .replace(/mega/g, 'm')            // Standardize 'mega' to 'm'
        // Handle various resistor value formats (10k, 1M, etc.)
        .replace(/(\d+)k(?![a-z])/g, '$1k')
        .replace(/(\d+)m(?![a-z])/g, '$1m')
        .replace(/(\d+)r(?![a-z])/g, '$1r')
        // Clean up any remaining inconsistencies
        .replace(/[ur]$/g, '')
        // Ensure consistent format for component values
        .replace(/(\d+)k(?!\d)/g, '$1k')
        .replace(/(\d+)m(?!\d)/g, '$1m')
        .replace(/(\d+)r(?!\d)/g, '$1r');

    return normalized;
}

/**
 * Save projects data to browser's local storage
 * Persists project information including BOMs between browser sessions
 */
function saveProjects() {
    debouncedSaveProjects();
}

/**
 * Save inventory data to browser's local storage
 * Persists component inventory between browser sessions
 */
function saveInventory() {
    debouncedSaveInventory();
}

// =============================================================================
// APPLICATION DATA INITIALIZATION
// =============================================================================

/**
 * Initialize the inventory data from localStorage or create sample data
 * This function handles the initial setup of the application including:
 * - Loading saved inventory data
 * - Creating sample data for new users
 * - Merging duplicate entries
 * - Setting up project data
 * - Rendering the initial display
 */
function initializeInventory() {
    // Try to load existing inventory data from browser storage
    const savedInventory = localStorage.getItem('guitarPedalInventory');
    if (savedInventory) {
        try {
            inventory = decompressData(savedInventory);
        } catch (error) {
            console.warn('Failed to decompress inventory data, trying fallback:', error);
            inventory = JSON.parse(savedInventory);
        }
        // Clean up any invalid entries first
        cleanupInvalidInventoryEntries();
        // Auto-merge any duplicate entries that may have been created (silently)
        mergeDuplicateInventoryEntries(false);
    } else {
        // Create sample data for new users to demonstrate functionality
        inventory = {
            'resistor_10k': { name: 'Resistor 10kΩ', quantity: 25 },
            'capacitor_100nf': { name: 'Capacitor 100nF', quantity: 15 },
            'op_amp_4558': { name: 'Op-Amp JRC4558', quantity: 8 },
            'led_3mm': { name: 'LED 3mm Red', quantity: 12 },
            'potentiometer_100k': { name: 'Potentiometer 100kΩ', quantity: 6 },
            'switch_3pdt': { name: '3PDT Footswitch', quantity: 3 }
        };
        saveInventory();
    }
    
    // Initialize project data and relationships
    initializeProjects();
    
    // Ensure all BOM references use consistent part IDs
    normalizeAllBOMReferences();
    
    // Render the inventory display
    displayInventory();
    
    // Check if URL contains part-specific parameters (for deep linking)
    checkUrlForPart();
    
    // Update the sync buttons container with current functionality
    const syncButtonsContainer = document.querySelector('.sync-buttons');
    if (syncButtonsContainer) {
        syncButtonsContainer.innerHTML = createSyncButtons();
    }
}

// =============================================================================
// DATA EXPORT/IMPORT FUNCTIONALITY
// =============================================================================

/**
 * Show the export options modal dialog
 */
function showExportModal() {
    showModal('exportModal');
    hideMobileNav();
}

/**
 * Hide the export options modal dialog
 */
function hideExportModal() {
    hideModal('exportModal');
    showMobileNav();
}

/**
 * Export inventory data in the specified format (JSON or CSV)
 * Creates a downloadable file containing all inventory and project data
 * 
 * @param {string} format - Either 'csv' or 'json' (default)
 */
function exportInventory(format) {
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
        function csvEscape(val) {
            if (val == null) return '';
            val = String(val);
            // Escape quotes by doubling them
            if (val.includes('"')) val = val.replace(/"/g, '""');
            // Wrap in quotes if contains comma, quote, or newline
            if (val.search(/[",\n]/) !== -1) return '"' + val + '"';
            return val;
        }
        
        // Convert inventory entries to CSV rows
        const rows = Object.entries(inventory).map(([id, part]) => [
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
        dataStr = JSON.stringify({ inventory, projects }, null, 2);
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
    showNotification(`Saved inventory to ${filename}`);
}

function importInventory(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const fileContent = e.target.result;
            let importedData;

            // Check if file is CSV
            if (file.name.toLowerCase().endsWith('.csv')) {
                // Use PapaParse to parse CSV
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
                    let projects = {};
                    const projectsRaw = row['Projects'] || row['projects'] || '';
                    if (projectsRaw) {
                        projectsRaw.split(';').forEach(pair => {
                            const [pid, qty] = pair.split(':').map(s => s.trim());
                            if (pid) projects[pid] = qty ? parseInt(qty) || 0 : 0;
                        });
                    }
                    importedData[id] = {
                        name: name,
                        type: type || undefined,
                        quantity: quantity,
                        purchaseUrl: purchaseUrl,
                        projects: projects
                    };
                });
            } else {
                // Parse JSON
                importedData = JSON.parse(fileContent);
            }
            
            if (importedData.inventory && importedData.projects) {
                inventory = importedData.inventory;
                projects = importedData.projects;
                // Auto-merge duplicates after import (silently)
                mergeDuplicateInventoryEntries(false);
                saveProjects();
                updateProjectFilter();
            } else if (typeof importedData === 'object' && importedData !== null) {
                // Fallback for old format or CSV import
                inventory = importedData;
                // --- Begin: Ensure projects are globally tagged and BOMs updated ---
                for (const partId in inventory) {
                    const part = inventory[partId];
                    if (part.projects) {
                        for (const projectId in part.projects) {
                            // Create project if missing
                            if (!projects[projectId]) {
                                projects[projectId] = {
                                    name: projectId,
                                    bom: {}
                                };
                            }
                            // Add part to project BOM with correct quantity
                            if (!projects[projectId].bom) projects[projectId].bom = {};
                            projects[projectId].bom[partId] = {
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
            currentPartId = null;
            showNotification('Inventory imported successfully!');
        } catch (err) {
            showNotification('Error importing inventory: ' + err.message, 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// =============================================================================
// SEARCH AND FILTERING FUNCTIONALITY
// =============================================================================

/**
 * Handle search input changes
 * Updates the current search query and refreshes the inventory display
 */
function searchParts() {
    const searchInput = DOM.get('searchInput');
    if (!searchInput) return;
    currentSearchQuery = searchInput.value.toLowerCase().trim();
    displayInventory();
}

/**
 * Get inventory entries filtered and sorted according to current settings
 * Applies search query, project filter, and sort order in sequence
 * 
 * @returns {Array} Array of [partId, partData] tuples, filtered and sorted
 */
function getSortedInventoryEntries() {
    const entries = Object.entries(inventory);
    
    // Step 1: Filter by search query if one exists
    const filteredEntries = currentSearchQuery 
        ? entries.filter(([_, part]) => {
            const searchStr = part.name.toLowerCase();
            return searchStr.includes(currentSearchQuery);
        })
        : entries;
    
    // Step 2: Apply project filter
    const projectFilteredEntries = currentProjectFilter !== 'all'
        ? filteredEntries.filter(([_, part]) => part.projects && part.projects[currentProjectFilter])
        : filteredEntries;
    
    // Step 3: Apply sorting based on current sort order
    switch (currentSortOrder) {
        case 'name-asc':
            return projectFilteredEntries.sort((a, b) => a[1].name.localeCompare(b[1].name));
        case 'name-desc':
            return projectFilteredEntries.sort((a, b) => b[1].name.localeCompare(a[1].name));
        case 'quantity-asc':
            return projectFilteredEntries.sort((a, b) => a[1].quantity - b[1].quantity);
        case 'quantity-desc':
            return projectFilteredEntries.sort((a, b) => b[1].quantity - a[1].quantity);
        case 'stock-status':
            // Sort by stock status (low stock first), then by name
            return projectFilteredEntries.sort((a, b) => {
                const aLowStock = a[1].quantity < 5;
                const bLowStock = b[1].quantity < 5;
                if (aLowStock && !bLowStock) return -1;
                if (!aLowStock && bLowStock) return 1;
                return a[1].name.localeCompare(b[1].name);
            });
        default:
            return projectFilteredEntries;
    }
}

/**
 * Handle sort order changes from dropdown
 * Updates the current sort order and refreshes the inventory display
 */
function changeSortOrder() {
    currentSortOrder = document.getElementById('sortDropdown').value;
    displayInventory();
}

// =============================================================================
// INVENTORY DISPLAY AND RENDERING
// =============================================================================

// Add virtual scrolling configuration
const VIRTUAL_SCROLLING = {
    enabled: false, // Will be enabled automatically for large inventories
    itemHeight: 80, // Approximate height of each inventory item
    visibleBuffer: 10 // Extra items to render outside viewport
};

function displayInventory() {
    const inventoryItems = document.getElementById('inventoryItems');
    const isMobile = window.innerWidth <= 1024;
    
    // Ensure search state is synchronized with the actual input value
    const searchInput = DOM.get('searchInput');
    if (searchInput) {
        const actualSearchValue = searchInput.value.toLowerCase().trim();
        if (actualSearchValue !== currentSearchQuery) {
            currentSearchQuery = actualSearchValue;
        }
    }
    
    inventoryItems.innerHTML = '';
    
    // Get filtered and sorted entries (filtering is already done in getSortedInventoryEntries)
    const sortedEntries = getSortedInventoryEntries();

    // Enable virtual scrolling for very large inventories (desktop only)
    // Increased threshold to avoid limiting display for normal-sized inventories
    const shouldUseVirtualScrolling = sortedEntries.length > 2000;
    
    if (shouldUseVirtualScrolling && !isMobile) {
        renderVirtualizedInventory(sortedEntries, inventoryItems);
    } else {
        renderFullInventory(sortedEntries, inventoryItems);
    }
}

function renderVirtualizedInventory(entries, container) {
    const containerHeight = container.offsetHeight || 600;
    const visibleItems = Math.ceil(containerHeight / VIRTUAL_SCROLLING.itemHeight) + VIRTUAL_SCROLLING.visibleBuffer;
    
    let startIndex = 0;
    let endIndex = Math.min(visibleItems, entries.length);
    
    function renderVisibleItems() {
        const fragment = document.createDocumentFragment();
        
        for (let i = startIndex; i < endIndex; i++) {
            const [id, part] = entries[i];
            const item = createInventoryItemElement(id, part);
            fragment.appendChild(item);
        }
        
        container.innerHTML = '';
        container.appendChild(fragment);
    }
    
    // Initial render
    renderVisibleItems();
    
    // Add scroll listener for virtual scrolling
    container.addEventListener('scroll', debounce(() => {
        const scrollTop = container.scrollTop;
        const newStartIndex = Math.floor(scrollTop / VIRTUAL_SCROLLING.itemHeight);
        const newEndIndex = Math.min(newStartIndex + visibleItems, entries.length);
        
        if (newStartIndex !== startIndex || newEndIndex !== endIndex) {
            startIndex = newStartIndex;
            endIndex = newEndIndex;
            renderVisibleItems();
        }
    }, 16)); // 60fps
}

function renderFullInventory(entries, container) {
    const fragment = document.createDocumentFragment();
    
    entries.forEach(([id, part]) => {
        const item = createInventoryItemElement(id, part);
        fragment.appendChild(item);
    });
    
    container.appendChild(fragment);
}

function createInventoryItemElement(id, part) {
    const isMobile = window.innerWidth <= 1024;
    const maxTags = isMobile ? 0 : (window.innerWidth > 1280 ? 3 : 1);
    
    const item = document.createElement('div');
    item.className = 'inventory-item';
    item.setAttribute('data-part-id', id);

    const projectEntries = part.projects ? Object.entries(part.projects) : [];
    let projectTagsHtml = '';
    if (projectEntries.length > 0) {
        if (isMobile) {
            // On mobile, always show a clickable tag for projects
            projectTagsHtml = `
                <span class="project-tag more-tags" data-part-id="${id}" title="Show all projects">
                    +${projectEntries.length} project${projectEntries.length > 1 ? 's' : ''}
                </span>
            `;
        } else {
            projectTagsHtml = projectEntries.slice(0, maxTags).map(([projectId, qty]) => {
                const project = projects[projectId];
                return project ? `
                    <span class="project-tag" data-project-id="${projectId}" title="${project.name} (${qty} needed)">
                        ${project.name.length > 12 ? project.name.slice(0, 10) + '…' : project.name} (${qty})
                    </span>
                ` : '';
            }).join('');
            
            if (projectEntries.length > maxTags) {
                const moreCount = projectEntries.length - maxTags;
                projectTagsHtml += `
                    <span class="project-tag more-tags" data-part-id="${id}" title="Show all projects">+${moreCount} more</span>
                `;
            }
        }
    }

    // --- Type pill logic ---
    let typePillHtml = '';
    const isCap = /\b(capacitor|cap)\b/i.test(part.name);
    if (isCap && part.type) {
        const typeClass = part.type.toLowerCase().replace(/\s/g, '');
        typePillHtml = `<span class="type-pill ${typeClass}">${part.type}</span>`;
    } else if (isCap && !part.type) {
        typePillHtml = `<span class="set-type-pill" data-set-type="${id}" title="Set capacitor type">Set Type</span>`;
    }

    // Responsive: type pill below name on mobile, inline on desktop
    if (isMobile) {
        item.innerHTML = `
            <div class="item-left">
                <div class="item-name" title="${escapeHtml(part.name)}">
                    <span class="part-name-text">${escapeHtml(part.name)}</span>
                    ${typePillHtml}
                </div>
                <div class="project-tags">${projectTagsHtml}</div>
            </div>
            <div class="item-controls">
                <div class="item-quantity ${part.quantity < 10 ? 'low' : ''}">
                    <button class="quantity-btn" data-action="decrease">-</button>
                    <span class="quantity-number">${part.quantity}</span>
                    <button class="quantity-btn" data-action="increase">+</button>
                </div>
                <div class="item-actions">
                    <button class="action-icon edit-icon" onclick="showEditPartModal('${id}')" title="Edit part">
                        <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                    </button>
                    <button class="action-icon delete-icon" onclick="showDeletePartModal('${id}')" title="Delete part">
                        <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                    </button>
                    <button class="action-icon shop-icon" onclick="handlePurchaseClick('${id}')" title="Open purchase link">
                        <svg viewBox="0 0 24 24"><path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8 4c0 .55-.45 1-1 1s-1-.45-1-1V8h2v2zm2-6c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm4 6c0 .55-.45 1-1 1s-1-.45-1-1V8h2v2z"/></svg>
                    </button>
                </div>
            </div>
        `;
    } else {
        item.innerHTML = `
            <div class="item-info">
                <div class="item-name" title="${escapeHtml(part.name)}">
                    <span class="part-name-text">${escapeHtml(part.name)}</span>
                    ${typePillHtml}
                </div>
                <div class="project-tags">${projectTagsHtml}</div>
            </div>
            <div class="item-quantity ${part.quantity < 10 ? 'low' : ''}">
                <button class="quantity-btn" data-action="decrease">-</button>
                <span class="quantity-number">${part.quantity}</span>
                <button class="quantity-btn" data-action="increase">+</button>
            </div>
            <div class="item-actions">
                <button class="action-icon edit-icon" onclick="showEditPartModal('${id}')" title="Edit part">
                    <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                </button>
                <button class="action-icon delete-icon" onclick="showDeletePartModal('${id}')" title="Delete part">
                    <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                </button>
                <button class="action-icon shop-icon" onclick="handlePurchaseClick('${id}')" title="Open purchase link">
                    <svg viewBox="0 0 24 24"><path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8 4c0 .55-.45 1-1 1s-1-.45-1-1V8h2v2zm2-6c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm4 6c0 .55-.45 1-1 1s-1-.45-1-1V8h2v2z"/></svg>
                </button>
            </div>
        `;
    }

    // Add event listeners
    const decreaseBtn = item.querySelector('[data-action="decrease"]');
    const increaseBtn = item.querySelector('[data-action="increase"]');
    
    if (decreaseBtn) decreaseBtn.addEventListener('click', () => adjustStockInline(id, 'remove'));
    if (increaseBtn) increaseBtn.addEventListener('click', () => adjustStockInline(id, 'add'));

    // Add project tag click handlers
    const projectTags = item.querySelectorAll('.project-tag');
    projectTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.stopPropagation();
            const projectId = tag.getAttribute('data-project-id');
            const partId = tag.getAttribute('data-part-id');
            
            if (projectId) {
                showProjectDetails(projectId);
            } else if (partId) {
                showAllProjectTagsModal(partId);
            }
        });
    });

    // Set type pill handler
    const setTypePill = item.querySelector('.set-type-pill');
    if (setTypePill) {
        setTypePill.addEventListener('click', (e) => {
            e.stopPropagation();
            showEditPartModal(id);
        });
    }

    return item;
}

function adjustStockInline(partId, action) {
    const part = inventory[partId];
    if (!part) return;
    
    if (action === 'add') {
        part.quantity += 1;
        showNotification(`Added 1 ${part.name}`);
    } else if (action === 'remove') {
        if (part.quantity > 0) {
            part.quantity -= 1;
            showNotification(`Removed 1 ${part.name}`);
        } else {
            showNotification('Cannot remove more items', 'error');
            return;
        }
    }
    
    saveInventory();
    displayInventory();
}

function showAddPartModal() {
    // Populate project assignments section
    populateNewPartProjectsSection();
    
    showModal('addPartModal');
    hideMobileNav();
}

function hideAddPartModal() {
    hideModal('addPartModal');
    document.getElementById('newPartName').value = '';
    document.getElementById('newPartQuantity').value = '';
    document.getElementById('newPartUrl').value = '';
    document.getElementById('newPartId').value = '';
    
    // Clear project assignments
    const projectRows = document.querySelectorAll('.new-project-qty');
    projectRows.forEach(input => {
        input.value = '0';
    });
    
    showMobileNav();
}

function showEditPartModal(partId) {
    editingPartId = partId;
    const part = inventory[partId];
    document.getElementById('editPartName').value = part.name;
    document.getElementById('editPartQuantity').value = part.quantity;
    document.getElementById('editPartUrl').value = part.purchaseUrl || '';
    document.getElementById('editPartId').value = partId;
    const typeDropdown = document.getElementById('editPartType');
    const typeSuggestion = document.getElementById('editPartTypeSuggestion');
    const editPartNameInput = document.getElementById('editPartName');
    if (typeDropdown && typeSuggestion && editPartNameInput) {
        typeDropdown.value = part.type || '';
        // Always update dropdown/suggestion visibility and content on modal open
        updateTypeDropdownVisibility(editPartNameInput, typeDropdown, typeSuggestion);
        // Also update suggestion text if visible
        if (!typeDropdown.classList.contains('hidden')) {
            const suggestion = suggestCapacitorType(editPartNameInput.value);
            if (suggestion) {
                typeSuggestion.textContent = `Suggested type: ${suggestion}`;
                if (!typeDropdown.value) {
                    for (const opt of typeDropdown.options) {
                        if (opt.value === suggestion) typeDropdown.value = suggestion;
                    }
                }
            } else {
                typeSuggestion.textContent = '';
            }
        } else {
            typeSuggestion.textContent = '';
        }
    }
    
    // Populate project assignments section
    populateEditPartProjectsSection(partId);
    
    showModal('editPartModal');
    hideMobileNav();
}

function populateEditPartProjectsSection(partId) {
    const part = inventory[partId];
    const projectsSection = document.getElementById('editPartProjectsDropdownSection');
    
    if (!projectsSection) return;
    
    // If no projects exist, show a message
    if (Object.keys(projects).length === 0) {
        projectsSection.innerHTML = `
            <div style="margin: 15px 0; padding: 10px; background: var(--nord1); border-left: 3px solid var(--nord13); color: var(--nord5);">
                <p style="margin: 0; font-size: 13px;">No projects available. Create a project first to assign parts.</p>
                <button class="btn btn-add" onclick="hideEditPartModal(); showProjectNameModal();" style="margin-top: 8px; padding: 6px 12px; font-size: 12px;">
                    Create Project
                </button>
            </div>
        `;
        return;
    }
    
    // Create project assignment controls
    let projectsHtml = `
        <div style="margin: 15px 0;">
            <h4 style="color: var(--nord8); font-size: 14px; margin-bottom: 10px;">Project Assignments</h4>
            <div class="nord-project-inv-list">
    `;
    
    for (const projectId in projects) {
        const project = projects[projectId];
        const currentQty = (part.projects && part.projects[projectId]) ? part.projects[projectId] : 0;
        
        projectsHtml += `
            <div class="nord-project-inv-row">
                <span class="nord-project-inv-name" title="${project.name}">${project.name}</span>
                <div class="modal-item-quantity">
                    <button type="button" class="quantity-btn" onclick="adjustProjectQty('${projectId}', -1)">-</button>
                    <input type="number" 
                           class="edit-project-qty" 
                           data-project-qty="${projectId}" 
                           value="${currentQty}" 
                           min="0" 
                           max="9999"
                           style="width: 60px; text-align: center; background: var(--nord2); color: var(--nord6); border: 1px solid var(--nord4); padding: 4px;">
                    <button type="button" class="quantity-btn" onclick="adjustProjectQty('${projectId}', 1)">+</button>
                </div>
            </div>
        `;
    }
    
    projectsHtml += `
            </div>
            <div style="margin-top: 10px; padding: 8px; background: var(--nord1); border-radius: 4px;">
                <p style="margin: 0; font-size: 11px; color: var(--nord4); line-height: 1.4;">
                    Set quantities needed for each project. Use 0 to remove from project.
                </p>
            </div>
        </div>
    `;
    
    projectsSection.innerHTML = projectsHtml;
}

function populateNewPartProjectsSection() {
    const projectsSection = document.getElementById('newPartProjectsDropdownSection');
    
    if (!projectsSection) return;
    
    // If no projects exist, show a message
    if (Object.keys(projects).length === 0) {
        projectsSection.innerHTML = `
            <div style="margin: 15px 0; padding: 10px; background: var(--nord1); border-left: 3px solid var(--nord13); color: var(--nord5);">
                <p style="margin: 0; font-size: 13px;">No projects available. Create a project first to assign parts.</p>
                <button class="btn btn-add" onclick="hideAddPartModal(); showProjectNameModal();" style="margin-top: 8px; padding: 6px 12px; font-size: 12px;">
                    Create Project
                </button>
            </div>
        `;
        return;
    }
    
    // Create project assignment controls
    let projectsHtml = `
        <div style="margin: 15px 0;">
            <h4 style="color: var(--nord8); font-size: 14px; margin-bottom: 10px;">Project Assignments</h4>
            <div class="nord-project-inv-list">
    `;
    
    for (const projectId in projects) {
        const project = projects[projectId];
        
        projectsHtml += `
            <div class="nord-project-inv-row">
                <span class="nord-project-inv-name" title="${project.name}">${project.name}</span>
                <div class="modal-item-quantity">
                    <button type="button" class="quantity-btn" onclick="adjustNewProjectQty('${projectId}', -1)">-</button>
                    <input type="number" 
                           class="new-project-qty" 
                           data-new-project-qty="${projectId}" 
                           value="0" 
                           min="0" 
                           max="9999"
                           style="width: 60px; text-align: center; background: var(--nord2); color: var(--nord6); border: 1px solid var(--nord4); padding: 4px;">
                    <button type="button" class="quantity-btn" onclick="adjustNewProjectQty('${projectId}', 1)">+</button>
                </div>
            </div>
        `;
    }
    
    projectsHtml += `
            </div>
            <div style="margin-top: 10px; padding: 8px; background: var(--nord1); border-radius: 4px;">
                <p style="margin: 0; font-size: 11px; color: var(--nord4); line-height: 1.4;">
                    Set quantities needed for each project. Use 0 to remove from project.
                </p>
            </div>
        </div>
    `;
    
    projectsSection.innerHTML = projectsHtml;
}

function adjustProjectQty(projectId, delta) {
    const input = document.querySelector(`[data-project-qty="${projectId}"]`);
    if (input) {
        const currentValue = parseInt(input.value) || 0;
        const newValue = Math.max(0, Math.min(9999, currentValue + delta));
        input.value = newValue;
    }
}

function adjustNewProjectQty(projectId, delta) {
    const input = document.querySelector(`[data-new-project-qty="${projectId}"]`);
    if (input) {
        const currentValue = parseInt(input.value) || 0;
        const newValue = Math.max(0, Math.min(9999, currentValue + delta));
        input.value = newValue;
    }
}

function hideEditPartModal() {
    hideModal('editPartModal');
    editingPartId = null;
    showMobileNav();
}

function saveEditPart() {
    if (!editingPartId) return;
    const newName = document.getElementById('editPartName').value.trim();
    const newQuantity = parseInt(document.getElementById('editPartQuantity').value) || 0;
    const newUrl = document.getElementById('editPartUrl').value.trim();
    let newId = document.getElementById('editPartId').value.trim();
    const newType = document.getElementById('editPartType').value;
    if (!newName) {
        showNotification('Please enter a part name', 'error');
        return;
    }
    // Generate ID: normalize name + _ + normalize type (if type is selected)
    if (!newId) {
        newId = normalizeValue(newName);
        if (newType) {
            newId += '_' + normalizeValue(newType);
        }
    }
    if (newId !== editingPartId && inventory[newId]) {
        showNotification('Part ID already exists', 'error');
        return;
    }
    if (newId !== editingPartId) {
        const part = inventory[editingPartId];
        inventory[newId] = {
            name: newName,
            quantity: newQuantity,
            purchaseUrl: newUrl,
            projects: part.projects || {},
            type: newType || undefined
        };
        delete inventory[editingPartId];
        editingPartId = newId;
    } else {
        inventory[editingPartId].name = newName;
        inventory[editingPartId].quantity = newQuantity;
        inventory[editingPartId].purchaseUrl = newUrl;
        if (!inventory[editingPartId].projects) {
            inventory[editingPartId].projects = {};
        }
        inventory[editingPartId].type = newType || undefined;
    }
    // --- Begin: Read project assignments from modal ---
    const projectRows = document.querySelectorAll('.edit-project-qty');
    const newProjects = {};
    projectRows.forEach(input => {
        const projectId = input.getAttribute('data-project-qty');
        const qty = parseInt(input.value) || 0;
        if (qty > 0) {
            newProjects[projectId] = qty;
        }
    });
    // Update part's projects
    inventory[newId].projects = newProjects;
    // Update project BOMs
    for (const projectId in projects) {
        if (!projects[projectId].bom) projects[projectId].bom = {};
        if (newProjects[projectId]) {
            projects[projectId].bom[newId] = {
                name: newName,
                quantity: newProjects[projectId]
            };
        } else {
            // Remove from BOM if not present
            delete projects[projectId].bom[newId];
        }
    }
    // --- End: Read project assignments from modal ---
    // Removed selectPart call as function doesn't exist
    saveProjects();
    saveInventory();
    displayInventory();
    hideEditPartModal();
    showNotification(`Updated ${newName}`);
}

function showDeletePartModal(partId) {
    deletingPartId = partId;
    const part = inventory[partId];
    document.getElementById('deletePartMessage').textContent = 
        `Are you sure you want to delete "${part.name}"? This action cannot be undone.`;
    showModal('deletePartModal');
    hideMobileNav();
}

function hideDeletePartModal() {
    hideModal('deletePartModal');
    deletingPartId = null;
    showMobileNav();
}

function confirmDeletePart() {
    if (!deletingPartId) return;
    
    const partName = inventory[deletingPartId].name;
    
    if (currentPartId === deletingPartId) {
        currentPartId = null;
        // Removed hidePartInfoPanel call as function doesn't exist
    }
    
    delete inventory[deletingPartId];
    saveInventory();
    displayInventory();
    hideDeletePartModal();
    showNotification(`Deleted ${partName}`);
}

function addNewPart() {
    const name = document.getElementById('newPartName').value.trim();
    const quantity = parseInt(document.getElementById('newPartQuantity').value) || 0;
    const purchaseUrl = document.getElementById('newPartUrl').value.trim();
    let id = document.getElementById('newPartId').value.trim();
    const type = document.getElementById('newPartType').value;
    
    // Input validation
    if (!name) {
        showNotification('Please enter a part name', 'error');
        return;
    }
    if (name.length > 200) {
        showNotification('Part name too long (max 200 characters)', 'error');
        return;
    }
    if (quantity < 0 || quantity > 999999) {
        showNotification('Invalid quantity (0-999999)', 'error');
        return;
    }
    // Generate ID: normalize name + _ + normalize type (if type is selected)
    if (!id) {
        id = normalizeValue(name);
        if (type) {
            id += '_' + normalizeValue(type);
        }
    }
    if (inventory[id]) {
        showNotification('Part ID already exists', 'error');
        return;
    }
    // Read project assignments from modal
    const projectRows = document.querySelectorAll('.new-project-qty');
    const newProjects = {};
    projectRows.forEach(input => {
        const projectId = input.getAttribute('data-new-project-qty');
        const qty = parseInt(input.value) || 0;
        if (qty > 0) {
            newProjects[projectId] = qty;
        }
    });
    
    inventory[id] = { 
        name, 
        quantity, 
        purchaseUrl,
        projects: newProjects,
        type: type || undefined
    };
    
    // Update project BOMs
    for (const projectId in projects) {
        if (!projects[projectId].bom) projects[projectId].bom = {};
        if (newProjects[projectId]) {
            projects[projectId].bom[id] = {
                name: name,
                quantity: newProjects[projectId]
            };
        }
    }
    
    saveProjects();
    saveInventory();
    displayInventory();
    hideAddPartModal();
    showNotification(`Added ${name} to inventory`);
}

function handlePurchaseClick(partId) {
    const part = inventory[partId];
    if (part && part.purchaseUrl) {
        window.open(part.purchaseUrl, '_blank');
    } else {
        showNotification('No purchase link available', 'error');
    }
}

// =============================================================================
// USER INTERFACE UTILITIES
// =============================================================================

/**
 * Display a notification message to the user
 * Shows a temporary notification that auto-hides after 5 seconds
 * 
 * @param {string} message - The message to display
 * @param {string} type - 'success' (default) or 'error' for styling
 */
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    
    // Clear any existing timeout to prevent conflicts
    if (notification.hideTimeout) {
        clearTimeout(notification.hideTimeout);
        notification.hideTimeout = null;
    }
    
    // Force reset the notification completely
    notification.className = 'notification';
    notification.classList.remove('show', 'error');
    notification.style.cssText = ''; // Clear any inline styles
    notification.textContent = '';
    
    // Force reflow to ensure reset is applied
    notification.offsetHeight;
    
    // Small delay to ensure the reset is complete before showing
    setTimeout(() => {
        notification.textContent = message;
        notification.className = `notification ${type === 'error' ? 'error' : ''}`;
        
        // Force another reflow before adding show class
        notification.offsetHeight;
        
        notification.classList.add('show');
        
        // Auto-hide notification after 5 seconds
        notification.hideTimeout = setTimeout(() => {
            notification.classList.remove('show');
            notification.hideTimeout = null;
        }, 5000);
    }, 100);
}

function clearStuckNotifications() {
    const notification = document.getElementById('notification');
    if (notification) {
        // Clear any timeouts
        if (notification.hideTimeout) {
            clearTimeout(notification.hideTimeout);
            notification.hideTimeout = null;
        }
        
        // Force reset everything about the notification
        notification.className = 'notification';
        notification.classList.remove('show', 'error');
        notification.textContent = '';
        notification.style.cssText = ''; // Clear any inline styles
        
        // Force reflow to ensure styles are applied
        notification.offsetHeight;
    }
}

// Test function to debug notifications (for development use)
function testNotification() {
    showNotification('✅ Test notification - this should slide in smoothly!', 'success');
}

/**
 * Check URL parameters for part-specific actions (deep linking support)
 * Supports actions like quickly removing stock for a specific part
 * Example: ?part=resistor_10k&remove=1
 */
function checkUrlForPart() {
    const urlParams = new URLSearchParams(window.location.search);
    const partId = urlParams.get('part');
    const quickRemove = urlParams.get('remove');
    
    if (partId && inventory[partId]) {
        if (quickRemove === '1') {
            adjustStockInline(partId, 'remove');
        }
    }
}



// =============================================================================
// PROJECT MANAGEMENT FUNCTIONALITY
// =============================================================================

/**
 * Initialize projects data from localStorage
 * Loads saved project information and updates the project filter dropdown
 */
function initializeProjects() {
    const savedProjects = localStorage.getItem('guitarPedalProjects');
    if (savedProjects) {
        try {
            projects = decompressData(savedProjects);
        } catch (error) {
            console.warn('Failed to decompress projects data, trying fallback:', error);
            projects = JSON.parse(savedProjects);
        }
        updateProjectFilter();
    }
}

/**
 * Update the project filter dropdown with current projects
 * Rebuilds the dropdown options while preserving the current selection
 */
function updateProjectFilter() {
    const filter = document.getElementById('projectFilter');
    if (!filter) return;
    
    // Store current selection to restore after rebuilding
    const currentValue = filter.value;
    
    // Clear existing options and add default "All Projects" option
    filter.innerHTML = '<option value="all">All Projects</option>';
    
    // Add option for each project
    for (const projectId in projects) {
        const option = document.createElement('option');
        option.value = projectId;
        option.textContent = projects[projectId].name;
        filter.appendChild(option);
    }
    
    // Restore previous selection if the project still exists
    if (currentValue !== 'all' && projects[currentValue]) {
        filter.value = currentValue;
    } else {
        filter.value = 'all';
    }
}

/**
 * Handle project filter changes
 * Updates the current project filter and refreshes the inventory display
 */
function filterByProject() {
    currentProjectFilter = document.getElementById('projectFilter').value;
    displayInventory();
}

function showProjectDetails(projectId) {
    hideMobileNav(); // Always hide nav bar when opening project details
    const project = projects[projectId];
    
    if (!project) {
        console.error('Project not found:', projectId);
        showNotification('Project not found', 'error');
        return;
    }
    
    const bom = project.bom;
    let totalParts = 0;
    let missingParts = 0;
    let lowStockParts = 0;
    
    document.getElementById('projectDetailsTitle').textContent = project.name;
    
    const partsContainer = document.getElementById('projectParts');
    partsContainer.innerHTML = '';
    
    const results = [];
    
    // Check if BOM exists and has entries
    if (!bom || Object.keys(bom).length === 0) {
        results.push(`
            <li>
                <span class="bom-part-label">
                    <span class="status-icon status-warning">
                        <svg viewBox="0 0 24 24"><polygon points="12,2 22,21 2,21" fill="currentColor" opacity="0.15"/><rect x="11" y="10" width="2" height="5" fill="currentColor"/><rect x="11" y="17" width="2" height="2" fill="currentColor"/></svg>
                    </span>
                    <strong>No components found</strong>
                </span>
                <span class="bom-part-status">: This project has no BOM data</span>
            </li>
        `);
    } else {
        for (const id in bom) {
            // Skip if BOM entry is invalid
            if (!bom[id] || typeof bom[id] !== 'object') {
                continue;
            }
        
        totalParts++;
        let part = inventory[id];
        let matchedId = id;
        let fuzzyNote = '';
        if (!part) {
            // Try normalized match
            const normId = normalizeValue(id);
            let found = false;
            for (const invId in inventory) {
                if (normalizeValue(invId) === normId) {
                    part = inventory[invId];
                    matchedId = invId;
                    fuzzyNote = `<span style='color:#EBCB8B;font-size:11px;'>(Auto-matched to: ${part.name})</span>`;
                    found = true;
                    break;
                }
            }
            // Try Levenshtein if not found
            if (!found) {
                let bestId = null, bestDist = 99;
                for (const invId in inventory) {
                    const dist = levenshtein(normId, normalizeValue(invId));
                    if (dist < bestDist) {
                        bestDist = dist;
                        bestId = invId;
                    }
                }
                if (bestDist <= 2 && bestId) {
                    part = inventory[bestId];
                    matchedId = bestId;
                    fuzzyNote = `<span style='color:#EBCB8B;font-size:11px;'>(Auto-matched to: ${part.name})</span>`;
                }
            }
        }
        
        // Handle cases where part exists but has no quantity property
        const partQuantity = part ? (part.quantity || 0) : 0;
        const bomQuantity = bom[id].quantity || 0;
        
        if (!part || partQuantity === 0) {
            // Missing entirely
            missingParts++;
            results.push(`
                <li>
                    <span class="bom-part-label">
                        <span class="status-icon status-error">
                            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15"/><line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/><line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/></svg>
                        </span>
                        <strong>${escapeHtml(bom[id].name || id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))}</strong>
                    </span>
                    <span class="bom-part-status">: Missing entirely (need ${bomQuantity})</span>
                </li>
            `);
        } else if (partQuantity < bomQuantity) {
            // Low stock
            lowStockParts++;
            results.push(`
                <li>
                    <span class="bom-part-label">
                        <span class="status-icon status-warning">
                            <svg viewBox="0 0 24 24"><polygon points="12,2 22,21 2,21" fill="currentColor" opacity="0.15"/><rect x="11" y="10" width="2" height="5" fill="currentColor"/><rect x="11" y="17" width="2" height="2" fill="currentColor"/></svg>
                        </span>
                        <strong>${escapeHtml(bom[id].name || id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))}</strong>
                    </span>
                    <span class="bom-part-status">: Have ${partQuantity}, need ${bomQuantity}</span>
                </li>
            `);
        } else {
            // Sufficient stock
            results.push(`
                <li>
                    <span class="bom-part-label">
                        <span class="status-icon status-success">
                            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15"/><polyline points="8 12.5 11 16 16 9" fill="none" stroke="currentColor" stroke-width="2"/></svg>
                        </span>
                        <strong>${escapeHtml(bom[id].name || id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))}</strong>
                    </span>
                    <span class="bom-part-status">: In stock (have ${partQuantity}, need ${bomQuantity})</span>
                </li>
            `);
        }
    }
    }
    
    // Add summary to the projectStatus element
    const statusContainer = document.getElementById('projectStatus');
    const sufficientParts = totalParts - missingParts - lowStockParts;
    statusContainer.innerHTML = `
        <div class="project-header">
            <div class="stat-item missing">
                <span class="stat-number">${missingParts}</span>
                <span class="stat-label">Missing</span>
            </div>
            <div class="stat-item low">
                <span class="stat-number">${lowStockParts}</span>
                <span class="stat-label">Low Stock</span>
            </div>
            <div class="stat-item sufficient">
                <span class="stat-number">${sufficientParts}</span>
                <span class="stat-label">Sufficient</span>
            </div>
        </div>
    `;
    
    // Add parts list
    const partsList = document.createElement('ul');
    partsList.className = 'project-parts-list';
    partsList.innerHTML = results.join('');
    partsContainer.appendChild(partsList);
    
    // Show the modal
    showModal('projectDetailsModal');
    hideMobileNav();
}

function hideProjectDetailsModal() {
    hideModal('projectDetailsModal');
    showMobileNav();
}

function removeProjectTag(partId, projectId) {
    if (!inventory[partId].projects) return;
    
    // Remove the tag from the inventory part
    delete inventory[partId].projects[projectId];
    if (Object.keys(inventory[partId].projects).length === 0) {
        delete inventory[partId].projects;
    }

    // Remove the part from the project's BOM
    if (projects[projectId] && projects[projectId].bom && projects[projectId].bom[partId]) {
        delete projects[projectId].bom[partId];
    }

    saveInventory();
    saveProjects();
    displayInventory();
    showProjectDetails(projectId);
    showNotification(`Removed ${inventory[partId].name} from ${projects[projectId].name}`);
}

function showProjectNameModal() {
    showModal('projectNameModal');
    document.getElementById('projectNameInput').value = '';
    document.getElementById('projectNameInput').focus();
}

function hideProjectNameModal() {
    hideModal('projectNameModal');
    pendingBomData = null;
    // Also clear the input for safety
    document.getElementById('projectNameInput').value = '';
}

function confirmProjectName() {
    const projectName = document.getElementById('projectNameInput').value.trim();
    if (!projectName) {
        showNotification('Please enter a project name', 'error');
        return;
    }
    const projectId = projectName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (projects[projectId]) {
        showNotification('Project name already exists', 'error');
        return;
    }
    if (pendingBomData) {
        createProjectFromBom(projectName, projectId, pendingBomData);
        pendingBomData = null;
    } else {
        // Create an empty project
        projects[projectId] = {
            name: projectName,
            bom: {}
        };
        saveProjects();
        updateProjectFilter();
        displayInventory();
        showNotification(`Created project: ${projectName}`);
        // If Edit Part modal is open, refresh it to show the new project
        if (document.getElementById('editPartModal').classList.contains('show') && editingPartId) {
            showEditPartModal(editingPartId);
        }
        // If Add Part modal is open, refresh it to show the new project
        if (document.getElementById('addPartModal').classList.contains('show')) {
            populateNewPartProjectsSection();
        }
        // If Project Management modal is open, refresh it to show the new project
        if (document.getElementById('projectManagementModal').classList.contains('show')) {
            showProjectManagementModal();
        }
    }
    hideProjectNameModal();
}

function createProjectFromBom(projectName, projectId, bom) {
    let totalParts = 0;
    let missingParts = 0;
    let lowStockParts = 0;
    projects[projectId] = {
        name: projectName,
        bom: bom
    };
    
    // Tag parts in the main inventory with this project
    for (const id in bom) {
        // Find the part in inventory using multiple matching strategies
        let partId = id;
        if (!inventory[id]) {
            // Strategy 1: Try exact name match
            let found = false;
            for (const existingId in inventory) {
                if (inventory[existingId].name.toLowerCase() === bom[id].name.toLowerCase()) {
                    partId = existingId;
                    found = true;
                    break;
                }
            }
            
            // Strategy 2: Try normalized matching if exact match failed
            if (!found) {
                const normalizedBomName = normalizeValue(bom[id].name);
                const normalizedBomId = normalizeValue(id);
                for (const existingId in inventory) {
                    const normalizedInvName = normalizeValue(inventory[existingId].name);
                    const normalizedInvId = normalizeValue(existingId);
                    if (normalizedInvName === normalizedBomName || normalizedInvId === normalizedBomId) {
                        partId = existingId;
                        found = true;
                        break;
                    }
                }
            }
        }
        
        if (inventory[partId]) {
            if (!inventory[partId].projects) {
                inventory[partId].projects = {};
            }
            inventory[partId].projects[projectId] = bom[id].quantity;
        } else {
            // Create the part if it doesn't exist
            inventory[id] = {
                name: bom[id].name,
                quantity: 0,
                projects: {
                    [projectId]: bom[id].quantity
                }
            };
        }
    }
    
    saveProjects();
    saveInventory();
    updateProjectFilter();
    displayInventory();

    // Store BOM data for comparison
    window.currentBom = bom;

    const results = [];
    for (const id in bom) {
        totalParts++;
        let part = inventory[id];
        let matchedId = id;
        let fuzzyNote = '';
        if (!part) {
            // Try normalized match
            const normId = normalizeValue(id);
            let found = false;
            for (const invId in inventory) {
                if (normalizeValue(invId) === normId) {
                    part = inventory[invId];
                    matchedId = invId;
                    fuzzyNote = `<span style='color:#EBCB8B;font-size:11px;'>(Auto-matched to: ${part.name})</span>`;
                    found = true;
                    break;
                }
            }
            // Try Levenshtein if not found
            if (!found) {
                let bestId = null, bestDist = 99;
                for (const invId in inventory) {
                    const dist = levenshtein(normId, normalizeValue(invId));
                    if (dist < bestDist) {
                        bestDist = dist;
                        bestId = invId;
                    }
                }
                if (bestDist <= 2 && bestId) {
                    part = inventory[bestId];
                    matchedId = bestId;
                    fuzzyNote = `<span style='color:#EBCB8B;font-size:11px;'>(Auto-matched to: ${part.name})</span>`;
                }
            }
        }
        if (!part || part.quantity === 0) {
            // Missing entirely
            missingParts++;
            results.push(`
                <li>
                    <span class="bom-part-label">
                        <span class="status-icon status-error">
                            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15"/><line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/><line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/></svg>
                        </span>
                        <strong>${bom[id].name}</strong>
                    </span>
                    <span class="bom-part-status">: Missing entirely (need ${bom[id].quantity})</span>
                </li>
            `);
        } else if (part.quantity < bom[id].quantity) {
            // Low stock
            lowStockParts++;
            const have = part.quantity;
            results.push(`
                <li>
                    <span class="bom-part-label">
                        <span class="status-icon status-warning">
                            <svg viewBox="0 0 24 24"><polygon points="12,2 22,21 2,21" fill="currentColor" opacity="0.15"/><rect x="11" y="10" width="2" height="5" fill="currentColor"/><rect x="11" y="17" width="2" height="2" fill="currentColor"/></svg>
                        </span>
                        <strong>${bom[id].name}</strong>
                    </span>
                    <span class="bom-part-status">: Have ${have}, need ${bom[id].quantity}</span>
                </li>
            `);
        } else {
            // Sufficient stock
            results.push(`
                <li>
                    <span class="bom-part-label">
                        <span class="status-icon status-success">
                            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15"/><polyline points="8 12.5 11 16 16 9" fill="none" stroke="currentColor" stroke-width="2"/></svg>
                        </span>
                        <strong>${bom[id].name}</strong>
                    </span>
                    <span class="bom-part-status">: In stock (have ${part.quantity}, need ${bom[id].quantity})</span>
                </li>
            `);
        }
    }

    const resultsContainer = document.getElementById("bomResults");
    resultsContainer.innerHTML = `
        <div class="project-header">
            <div>Total Parts: ${totalParts}</div>
            <div>Missing: ${missingParts}</div>
            <div>Low Stock: ${lowStockParts}</div>
        </div>
        <ul class="project-info">${results.join("")}</ul>
    `;
    showBOMModal();
}

function compareBOM(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            let bom = {};
            const fileContent = e.target.result;
            
            // Check if file is CSV
            if (file.name.toLowerCase().endsWith('.csv')) {
                // Use PapaParse to parse CSV
                const parsed = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
                if (parsed.errors.length) {
                    console.error('CSV parse errors:', parsed.errors);
                    throw new Error('CSV parse error: ' + parsed.errors[0].message);
                }
                parsed.data.forEach((row, index) => {
                    // Normalize headers
                    let id = row['Part ID'] || row['part id'] || row['ID'] || row['id'] || '';
                    const name = row['Name'] || row['name'] || row['Part Name'] || row['part name'] || row['Component'] || row['component'] || '';
                    if (!name) {
                        return; // skip if no name
                    }
                    const quantity = parseInt(row['Quantity'] || row['quantity'] || '0') || 0;
                    
                    // If no explicit ID provided, try to find matching part in inventory first
                    if (!id) {
                        // Try to find exact match by name first
                        let foundId = null;
                        for (const [invId, invPart] of Object.entries(inventory)) {
                            if (invPart.name.toLowerCase() === name.toLowerCase()) {
                                foundId = invId;
                                break;
                            }
                        }
                        
                        // If no exact match, try normalized matching
                        if (!foundId) {
                            const normalizedName = normalizeValue(name);
                            for (const [invId, invPart] of Object.entries(inventory)) {
                                if (normalizeValue(invPart.name) === normalizedName) {
                                    foundId = invId;
                                    break;
                                }
                            }
                        }
                        
                        // Use found ID or create a normalized one as fallback
                        id = foundId || normalizeValue(name);
                    }
                    
                    bom[id] = {
                        name: name,
                        quantity: quantity
                    };
                });
            } else {
                // Parse JSON
                const parsedBom = JSON.parse(fileContent);
                if (Array.isArray(parsedBom.parts)) {
                    // Handle exported format with metadata and parts array
                    parsedBom.parts.forEach(part => {
                        if (part.name && part.quantity !== undefined) {
                            // Use normalized name as ID
                            const id = normalizeValue(part.name);
                            bom[id] = { name: part.name, quantity: part.quantity };
                        }
                    });
                } else {
                    // Handle flat object format
                    for (const id in parsedBom) {
                        if (parsedBom[id] && parsedBom[id].quantity !== undefined) {
                            bom[id] = parsedBom[id];
                        }
                    }
                }
            }

            // Debug: Log the processed BOM data

            
            // Store the BOM data and show the project name modal
            pendingBomData = bom;
            showProjectNameModal();

        } catch (err) {
            showNotification("Error processing BOM file: " + err.message, "error");
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function addMissingParts() {
    if (!window.currentBom) return;
    
    let addedCount = 0;
    for (const id in window.currentBom) {
        if (!inventory[id]) {
            const part = window.currentBom[id];
            inventory[id] = {
                name: part.name,
                quantity: 0,
                purchaseUrl: part.purchaseUrl || '',
                projects: {}
            };
            addedCount++;
        }
    }
    
    if (addedCount > 0) {
        saveInventory();
        displayInventory();
        showNotification(`Added ${addedCount} new part(s) to inventory`);
    } else {
        showNotification('No new parts to add');
    }
    
    hideBOMModal();
}

function showBOMModal() {
    showModal('bomModal');
    hideMobileNav();
}

function hideBOMModal() {
    hideModal('bomModal');
    window.currentBom = null;
    showMobileNav();
}

// Add these new functions for project management
function showProjectManagementModal() {
    const projectList = document.getElementById('projectList');
    projectList.innerHTML = '';
    
    for (const projectId in projects) {
        const project = projects[projectId];
        const projectElement = document.createElement('div');
        projectElement.className = 'project-list-item';
        
        // Count parts tagged with this project
        let taggedParts = 0;
        for (const id in inventory) {
            if (inventory[id].projects && inventory[id].projects[projectId]) {
                taggedParts++;
            }
        }
        
        projectElement.innerHTML = `
            <div>
                <strong>${project.name}</strong>
                <div class="project-info">
                    ${taggedParts} parts tagged
                </div>
            </div>
            <div>
                <button onclick="showDeleteProjectModal('${projectId}')" class="project-delete-btn">Delete</button>
            </div>
        `;
        
        projectList.appendChild(projectElement);
    }
    
    showModal('projectManagementModal');
    hideMobileNav();
}

function hideProjectManagementModal() {
    hideModal('projectManagementModal');
    showMobileNav();
}

function showDeleteProjectModal(projectId) {
    deletingProjectId = projectId;
    const project = projects[projectId];
    const modal = document.getElementById('deleteProjectModal');
    const message = document.getElementById('deleteProjectMessage');
    
    if (modal && message) {
        message.textContent = `Are you sure you want to delete "${project.name}"? This action cannot be undone.`;
        showModal('deleteProjectModal');
    }
    hideMobileNav();
}

function hideDeleteProjectModal() {
    hideModal('deleteProjectModal');
    deletingProjectId = null;
    showMobileNav();
}

function confirmDeleteProject() {
    if (!deletingProjectId) return;
    
    const projectName = projects[deletingProjectId].name;
    
    // Remove project tags from all parts
    for (const id in inventory) {
        if (inventory[id].projects && inventory[id].projects[deletingProjectId]) {
            delete inventory[id].projects[deletingProjectId];
            // Remove projects object if empty
            if (Object.keys(inventory[id].projects).length === 0) {
                delete inventory[id].projects;
            }
        }
    }
    
    // Delete the project
    delete projects[deletingProjectId];
    
    // Save changes
    saveProjects();
    saveInventory();
    
    // Update UI
    updateProjectFilter();
    displayInventory();
    
    // Hide modals
    hideModal('deleteProjectModal');
    hideModal('projectManagementModal');
    
    // Reset state
    deletingProjectId = null;
    
    // Show notification
    showNotification(`Deleted project: ${projectName}`);
}

function showAllProjectRequirements() {
    // First repair any malformed BOM data
    repairBOMData();
    const partTotals = {};
    for (const projectId in projects) {
        const bom = projects[projectId].bom;
        for (const partId in bom) {
            const normId = normalizeValue(partId);
            const bomPart = bom[partId];
            const name = bomPart.name || partId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const quantity = typeof bomPart.quantity === 'number' ? bomPart.quantity : (typeof bomPart.quantity === 'string' ? parseInt(bomPart.quantity) || 0 : 0);
            if (!partTotals[normId]) {
                partTotals[normId] = {
                    name: name,
                    total: 0,
                    projects: [],
                    inventoryQty: 0,
                    status: 'missing'
                };
            } else {
                for (const id in inventory) {
                    if (normalizeValue(id) === normId) {
                        partTotals[normId].name = inventory[id].name;
                        break;
                    }
                }
            }
            partTotals[normId].total += quantity;
            partTotals[normId].projects.push({
                project: projects[projectId].name,
                quantity: quantity
            });
        }
    }
    for (const normId in partTotals) {
        const part = partTotals[normId];
        let foundInInventory = false;
        for (const id in inventory) {
            const invNormId = normalizeValue(id);
            if (invNormId === normId) {
                part.inventoryQty = inventory[id].quantity || 0;
                foundInInventory = true;
                break;
            }
        }
        if (!foundInInventory) {
            for (const id in inventory) {
                const invPart = inventory[id];
                if (normalizeValue(invPart.name) === normalizeValue(part.name)) {
                    part.inventoryQty = invPart.quantity || 0;
                    foundInInventory = true;
                    break;
                }
            }
        }
        if (!foundInInventory) {
            part.inventoryQty = 0;
        }
        if (part.inventoryQty === 0) {
            part.status = 'missing';
        } else if (part.inventoryQty < part.total) {
            part.status = 'low';
        } else {
            part.status = 'sufficient';
        }
    }
    const sortedParts = Object.entries(partTotals).sort(([, a], [, b]) => {
        const statusOrder = { missing: 0, low: 1, sufficient: 2 };
        if (statusOrder[a.status] !== statusOrder[b.status]) {
            return statusOrder[a.status] - statusOrder[b.status];
        }
        return a.name.localeCompare(b.name);
    });
    const groupedParts = {
        missing: sortedParts.filter(([, part]) => part.status === 'missing'),
        low: sortedParts.filter(([, part]) => part.status === 'low'),
        sufficient: sortedParts.filter(([, part]) => part.status === 'sufficient')
    };
    // Build HTML with organized sections
    let html = `
        <div class="requirements-summary">
            <div class="summary-stats">
                <div class="stat-item missing">
                    <span class="stat-number">${groupedParts.missing.length}</span>
                    <span class="stat-label">Missing</span>
                </div>
                <div class="stat-item low">
                    <span class="stat-number">${groupedParts.low.length}</span>
                    <span class="stat-label">Low Stock</span>
                </div>
                <div class="stat-item sufficient">
                    <span class="stat-number">${groupedParts.sufficient.length}</span>
                    <span class="stat-label">Sufficient</span>
                </div>
            </div>
        </div>
    `;
    function createSimpleListSection(title, parts, className) {
        if (parts.length === 0) return '';
        let sectionHtml = `
            <div class="requirements-section ${className}">
                <h3 class="section-title">${title} (${parts.length})</h3>
                <ul class="requirements-simple-list">
        `;
        parts.forEach(([normId, part]) => {
            let statusIcon = '';
            if (part.status === 'missing') {
                statusIcon = `<span class="status-icon status-error" title="Missing">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15"/><line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/><line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/></svg>
                </span>`;
            } else if (part.status === 'low') {
                statusIcon = `<span class="status-icon status-warning" title="Low Stock">
                    <svg viewBox="0 0 24 24"><polygon points="12,2 22,21 2,21" fill="currentColor" opacity="0.15"/><rect x="11" y="10" width="2" height="5" fill="currentColor"/><rect x="11" y="17" width="2" height="2" fill="currentColor"/></svg>
                </span>`;
            } else {
                statusIcon = `<span class="status-icon status-success" title="Sufficient">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15"/><polyline points="8 12.5 11 16 16 9" fill="none" stroke="currentColor" stroke-width="2"/></svg>
                </span>`;
            }
            let fullUsage = part.projects.map(p => `${p.project} (${p.quantity})`).join(', ');
            let truncatedUsage = smartTruncateUsage(part.projects, 35);
            let fullUsageText = `Used in: ${fullUsage}`;
            sectionHtml += `
                <li class="requirements-list-item ${part.status}">
                    ${statusIcon}
                    <span class="part-name">${part.name}</span>
                    <span class="part-qty-info">
                        Have: <b>${part.inventoryQty}</b> / Need: <b>${part.total}</b>
                        ${part.status !== 'sufficient' ? ` / Short: <b>${Math.max(0, part.total - part.inventoryQty)}</b>` : ''}
                    </span>
                    <span class="part-usage" title="${escapeHtml(fullUsageText)}">[${truncatedUsage}]</span>
                </li>
            `;
        });
        sectionHtml += '</ul></div>';
        return sectionHtml;
    }
    if (groupedParts.missing.length > 0) {
        html += createSimpleListSection('Missing Parts', groupedParts.missing, 'missing');
    }
    if (groupedParts.low.length > 0) {
        html += createSimpleListSection('Low Stock', groupedParts.low, 'low');
    }
    if (groupedParts.sufficient.length > 0) {
        html += createSimpleListSection('Sufficient Stock', groupedParts.sufficient, 'sufficient');
    }
    document.getElementById('allProjectRequirementsModal').querySelector('h2').innerHTML = 'All Project Requirements';
    document.getElementById('allProjectRequirements').innerHTML = html;
    showModal('allProjectRequirementsModal');
    hideMobileNav();
}

function hideAllProjectRequirementsModal() {
    hideModal('allProjectRequirementsModal');
    showMobileNav();
}

function showExportBOMModal() {
    const select = document.getElementById('exportBOMProject');
    select.innerHTML = '<option value="">Select a project...</option>';
    
    for (const projectId in projects) {
        const option = document.createElement('option');
        option.value = projectId;
        option.textContent = projects[projectId].name;
        select.appendChild(option);
    }
    
    showModal('exportBOMModal');
    hideMobileNav();
}

function hideExportBOMModal() {
    hideModal('exportBOMModal');
    showMobileNav();
}

function exportProjectBOM(format) {
    const projectId = document.getElementById('exportBOMProject').value;
    if (!projectId) {
        showNotification('Please select a project', 'error');
        return;
    }

    const project = projects[projectId];
    const bom = project.bom;
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    let filename, dataStr, mimeType;

    if (format === 'csv') {
        filename = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}-bom-${timestamp}.csv`;
        // Create CSV header
        const headers = ['Part Name', 'Quantity', 'Purchase URL'];
        
        // Helper function to escape CSV fields
        function csvEscape(val) {
            if (val == null) return '';
            val = String(val);
            if (val.includes('"')) val = val.replace(/"/g, '""');
            if (val.search(/[",\n]/) !== -1) return '"' + val + '"';
            return val;
        }

        // Create CSV rows
        const rows = Object.entries(bom).map(([id, part]) => {
            const inventoryPart = inventory[id];
            return [
                csvEscape(part.name),
                csvEscape(part.quantity),
                csvEscape(inventoryPart ? inventoryPart.purchaseUrl || '' : '')
            ];
        });
        // Combine header and rows
        dataStr = [headers.map(csvEscape), ...rows].map(row => row.join(',')).join('\n');
        mimeType = 'text/csv';
    } else {
        filename = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}-bom-${timestamp}.json`;
        // Create JSON with additional metadata
        const exportData = {
            projectName: project.name,
            exportDate: new Date().toISOString(),
            parts: Object.entries(bom).map(([id, part]) => {
                const inventoryPart = inventory[id];
                return {
                    name: part.name,
                    quantity: part.quantity,
                    purchaseUrl: inventoryPart ? inventoryPart.purchaseUrl || '' : ''
                };
            })
        };
        dataStr = JSON.stringify(exportData, null, 2);
        mimeType = 'application/json';
    }

    const dataBlob = new Blob([dataStr], {type: mimeType});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    hideExportBOMModal();
}

// Add this function to create the sync buttons HTML
function createSyncButtons() {
    return `
        <button class="add-part-btn" onclick="showAddPartModal()">
            <svg class="sync-icon" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Add New Part
        </button>
        <button class="add-part-btn" onclick="showBOMAssistantModal()">
            <svg class="sync-icon" viewBox="0 0 192 192">
                <polygon points="111.44 20.77 131.36 74.6 185.2 94.52 131.36 114.45 111.44 168.28 91.52 114.45 37.68 94.52 91.52 74.6 111.44 20.77"/>
                <polygon points="56.47 119.23 63.71 138.78 83.26 146.01 63.71 153.24 56.47 172.79 49.24 153.24 29.69 146.01 49.24 138.78 56.47 119.23"/>
                <polygon points="33.59 16.76 40.82 36.31 60.37 43.55 40.82 50.78 33.59 70.33 26.35 50.78 6.8 43.55 26.35 36.31 33.59 16.76"/>
            </svg>
            BOM Assistant
        </button>
        <button class="sync-btn import-btn full-width" onclick="document.getElementById('importBOM').click()">
            <svg class="sync-icon" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99c.41.41 1.09.41 1.5 0s.41-1.09 0-1.5l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            Compare BOM
        </button>
        <button class="sync-btn export-btn full-width" onclick="showExportBOMModal()">
            <svg class="sync-icon" viewBox="0 0 24 24">
                <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z"/>
            </svg>
            Export Project BOM
        </button>
        <button class="sync-btn import-btn full-width" onclick="document.getElementById('importFile').click()">
            <svg class="sync-icon" viewBox="0 0 24 24">
                <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
            </svg>
            Load Data
        </button>
        <button class="sync-btn export-btn full-width" onclick="showExportModal()">
            <svg class="sync-icon" viewBox="0 0 24 24">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            Save Data
        </button>
        <button class="sync-btn import-btn full-width" onclick="mergeDuplicateInventoryEntries()">
            <svg class="sync-icon" viewBox="0 0 24 24">
                <path d="M17 20.41L18.41 19 15 15.59 13.59 17 17 20.41zM7.5 8H11v5.59L5.59 19 7 20.41l6-6V8h3.5L12 3.5 7.5 8z"/>
            </svg>
            Merge Duplicates
        </button>
    `;
}



function updateQuantity(partId, newQuantity) {
    if (newQuantity < 0) newQuantity = 0;
    
    const part = inventory[partId];
    if (!part) return;

    const oldQuantity = part.quantity;
    part.quantity = newQuantity;
    
    saveInventory();
    displayInventory();
    
    if (newQuantity !== oldQuantity) {
        showNotification(`Updated ${part.name} quantity to ${newQuantity}`);
    }
}



// =============================================================================
// ALGORITHMS AND DATA PROCESSING
// =============================================================================

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching of component names to find potential duplicates
 * 
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} Edit distance between the strings
 */
function levenshtein(a, b) {
    // Create a matrix to store edit distances
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
    
    // Initialize first row with increasing values
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    
    // Fill the matrix using dynamic programming
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b[i - 1] === a[j - 1]) {
                // Characters match, no operation needed
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                // Choose minimum cost operation
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }
    
    // Return the final edit distance
    return matrix[b.length][a.length];
}

function showAllProjectTagsModal(partId) {
    const part = inventory[partId];
    if (!part || !part.projects) return;

    const modal = document.getElementById('allProjectTagsModal');
    const tagsList = document.getElementById('allProjectTagsList');
    tagsList.innerHTML = '';

    // Show all projects this part is assigned to (including qty = 0)
    const assignedProjects = Object.entries(part.projects);
    
    if (assignedProjects.length === 0) {
        tagsList.innerHTML = '<p class="no-projects">No projects assigned to this part.</p>';
    } else {
        assignedProjects.forEach(([projectId, qty]) => {
            const project = projects[projectId];
            if (project) {
                const tag = document.createElement('span');
                tag.className = 'project-tag';
                tag.setAttribute('data-project-id', projectId);
                tag.setAttribute('title', `${project.name} (${qty} needed)`);
                tag.textContent = `${project.name} (${qty})`;
                tag.onclick = (e) => {
                    e.stopPropagation();
                    hideAllProjectTagsModal(true); // Pass true to indicate another modal is opening
                    showProjectDetails(projectId);
                };
                tagsList.appendChild(tag);
            }
        });
    }

    showModal('allProjectTagsModal');
    hideMobileNav();
}

function hideAllProjectTagsModal(openingAnotherModal) {
    hideModal('allProjectTagsModal');
    if (!openingAnotherModal) {
        showMobileNav();
    }
}

function showAboutModal(event) {
    // Prevent any default behavior and event propagation
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    // Auto-close BOM Assistant modal if open
    const bomAssistantModal = document.getElementById('bomAssistantModal');
    if (bomAssistantModal && bomAssistantModal.classList.contains('show')) {
        hideModal('bomAssistantModal');
    }
    showModal('aboutModal');
    hideMobileNav();
}

function hideAboutModal() {
    hideModal('aboutModal');
    showMobileNav();
}

// Update tag display responsively on window resize
window.addEventListener('resize', debounce(displayInventory, 200));

function mergeDuplicateInventoryEntries(showNotifications = true) {
    const normalizedToCanonical = {};
    const duplicates = [];
    
    // Safety check: ensure inventory exists and is valid
    if (!inventory || typeof inventory !== 'object') {
        console.warn('Invalid inventory object in mergeDuplicateInventoryEntries');
        return;
    }
    
    // First pass: identify duplicates and choose canonical entries
    for (const [id, part] of Object.entries(inventory)) {
        // Skip null or invalid parts
        if (!part || !part.name) {
            console.warn(`Skipping invalid part with id: ${id}`, part);
            continue;
        }
        
        const normalizedId = normalizeValue(part.name);
        
        if (!normalizedToCanonical[normalizedId]) {
            normalizedToCanonical[normalizedId] = id;
        } else {
            const existingId = normalizedToCanonical[normalizedId];
            const existingPart = inventory[existingId];
            
            // Keep the part with more information as canonical
            if (part.purchaseUrl && !existingPart.purchaseUrl) {
                normalizedToCanonical[normalizedId] = id;
                duplicates.push({ canonical: id, duplicate: existingId });
            } else {
                duplicates.push({ canonical: existingId, duplicate: id });
            }
        }
    }
    
    if (duplicates.length === 0) {
        if (showNotifications) {
            showNotification('No duplicate entries found', 'info');
        }
        return;
    }
    
    // Second pass: merge duplicates
    for (const { canonical, duplicate } of duplicates) {
        const canonicalPart = inventory[canonical];
        const duplicatePart = inventory[duplicate];
        
        // Safety check: ensure both parts still exist
        if (!canonicalPart || !duplicatePart) {
            console.warn(`Skipping merge - missing parts: canonical=${!!canonicalPart}, duplicate=${!!duplicatePart}`);
            continue;
        }
        
        // Merge quantities
        canonicalPart.quantity = (canonicalPart.quantity || 0) + (duplicatePart.quantity || 0);
        
        // Merge projects - handle both array and object formats
        if (duplicatePart.projects) {
            canonicalPart.projects = canonicalPart.projects || {};
            
            // If projects is an array, convert to object format
            if (Array.isArray(duplicatePart.projects)) {
                duplicatePart.projects.forEach(projectId => {
                    canonicalPart.projects[projectId] = (canonicalPart.projects[projectId] || 0) + 1;
                });
            } else {
                // If projects is an object, merge quantities
                for (const [projectId, quantity] of Object.entries(duplicatePart.projects)) {
                    canonicalPart.projects[projectId] = (canonicalPart.projects[projectId] || 0) + (quantity || 1);
                }
            }
        }
        
        // Keep the longer purchase URL if available
        if (duplicatePart.purchaseUrl && (!canonicalPart.purchaseUrl || duplicatePart.purchaseUrl.length > canonicalPart.purchaseUrl.length)) {
            canonicalPart.purchaseUrl = duplicatePart.purchaseUrl;
        }
        
        // Keep the more specific type if available
        if (duplicatePart.type && (!canonicalPart.type || duplicatePart.type !== 'Other')) {
            canonicalPart.type = duplicatePart.type;
        }
        
        // Delete the duplicate entry
        delete inventory[duplicate];
    }
    
    // Update project BOMs to use canonical IDs
    for (const project of Object.values(projects)) {
        if (project.bom) {
            const updatedBom = {};
            for (const [id, quantity] of Object.entries(project.bom)) {
                // Check if the inventory item still exists
                if (inventory[id]) {
                    const normalizedId = normalizeValue(inventory[id].name || '');
                    const canonicalId = normalizedToCanonical[normalizedId];
                    if (canonicalId && inventory[canonicalId]) {
                        updatedBom[canonicalId] = (updatedBom[canonicalId] || 0) + quantity;
                    }
                } else {
                    // If the original part doesn't exist, try to find a canonical match by ID
                    const normalizedId = normalizeValue(id);
                    const canonicalId = normalizedToCanonical[normalizedId];
                    if (canonicalId && inventory[canonicalId]) {
                        updatedBom[canonicalId] = (updatedBom[canonicalId] || 0) + quantity;
                    }
                }
            }
            project.bom = updatedBom;
        }
    }
    
    // Save changes
    saveInventory();
    saveProjects();
    
    // Update display
    displayInventory();
    
    if (showNotifications) {
        showNotification(`Merged ${duplicates.length} duplicate entries`, 'success');
    }
}

// --- Auto-suggest capacitor type based on value ---
function suggestCapacitorType(partName) {
    // Extract value and unit (e.g., 100nF, 2.2uF, 1nF, 10uF, etc.)
    const match = partName.match(/([0-9.]+)\s*(pF|nF|uF|μF|mf|F)/i);
    if (!match) return null;
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    let valueUF = value;
    if (unit === 'pf') valueUF = value / 1e6;
    else if (unit === 'nf') valueUF = value / 1e3;
    else if (unit === 'μf' || unit === 'uf') valueUF = value;
    else if (unit === 'mf') valueUF = value * 1000;
    else if (unit === 'f') valueUF = value * 1e6;
    // Suggest type based on value in uF
    if (valueUF <= 0.001) return 'MLCC'; // ≤1nF
    if (valueUF > 0.001 && valueUF <= 2.2) return 'Box Film'; // >1nF to 2.2uF
    if (valueUF > 2.2) return 'Electrolytic';
    return null;
}

// Utility to show/hide type dropdown and suggestion based on part name
function updateTypeDropdownVisibility(nameInput, typeDropdown, typeSuggestion) {
    const name = nameInput.value.toLowerCase();
    const isCap = /\b(capacitor|cap)\b/i.test(name);
    if (isCap) {
        typeDropdown.classList.remove('hidden');
        typeSuggestion.classList.remove('hidden');
    } else {
        typeDropdown.classList.add('hidden');
        typeSuggestion.classList.add('hidden');
        typeDropdown.value = '';
        typeSuggestion.textContent = '';
    }
}

// Add Part Modal: Show/hide type dropdown
const newPartNameInput = document.getElementById('newPartName');
const newPartTypeDropdown = document.getElementById('newPartType');
const newPartTypeSuggestion = document.getElementById('newPartTypeSuggestion');
if (newPartNameInput && newPartTypeDropdown && newPartTypeSuggestion) {
    newPartTypeDropdown.classList.add('hidden');
    newPartTypeSuggestion.classList.add('hidden');
    newPartNameInput.addEventListener('input', () => {
        updateTypeDropdownVisibility(newPartNameInput, newPartTypeDropdown, newPartTypeSuggestion);
        const suggestion = suggestCapacitorType(newPartNameInput.value);
        if (suggestion && !newPartTypeDropdown.classList.contains('hidden')) {
            newPartTypeSuggestion.textContent = `Suggested type: ${suggestion}`;
            if (!newPartTypeDropdown.value) {
                for (const opt of newPartTypeDropdown.options) {
                    if (opt.value === suggestion) newPartTypeDropdown.value = suggestion;
                }
            }
        } else if (!newPartTypeDropdown.classList.contains('hidden')) {
            newPartTypeSuggestion.textContent = '';
        }
    });
}

// Edit Part Modal: Show/hide type dropdown
const editPartNameInput = document.getElementById('editPartName');
const editPartTypeDropdown = document.getElementById('editPartType');
const editPartTypeSuggestion = document.getElementById('editPartTypeSuggestion');
if (editPartNameInput && editPartTypeDropdown && editPartTypeSuggestion) {
    editPartTypeDropdown.classList.add('hidden');
    editPartTypeSuggestion.classList.add('hidden');
    editPartNameInput.addEventListener('input', () => {
        updateTypeDropdownVisibility(editPartNameInput, editPartTypeDropdown, editPartTypeSuggestion);
        const suggestion = suggestCapacitorType(editPartNameInput.value);
        if (suggestion && !editPartTypeDropdown.classList.contains('hidden')) {
            editPartTypeSuggestion.textContent = `Suggested type: ${suggestion}`;
            if (!editPartTypeDropdown.value) {
                for (const opt of editPartTypeDropdown.options) {
                    if (opt.value === suggestion) editPartTypeDropdown.value = suggestion;
                }
            }
        } else if (!editPartTypeDropdown.classList.contains('hidden')) {
            editPartTypeSuggestion.textContent = '';
        }
    });
}

// ... existing code ...
function normalizeAllBOMReferences() {
    // Build a map from normalized ID to canonical inventory ID
    const normToCanonical = {};
    for (const id in inventory) {
        const norm = normalizeValue(id);
        if (!normToCanonical[norm]) {
            normToCanonical[norm] = id;
        }
    }
    // For each project and BOM, update part IDs to canonical
    for (const projectId in projects) {
        const bom = projects[projectId].bom;
        if (!bom) continue;
        const newBOM = {};
        for (const partId in bom) {
            const norm = normalizeValue(partId);
            const canonicalId = normToCanonical[norm] || partId;
            if (newBOM[canonicalId]) {
                newBOM[canonicalId].quantity += bom[partId].quantity;
            } else {
                newBOM[canonicalId] = { ...bom[partId] };
            }
        }
        projects[projectId].bom = newBOM;
    }
    saveProjects();
}
// ... existing code ...

function repairBOMData() {
    for (const projectId in projects) {
        const bom = projects[projectId].bom;
        const newBom = {};
        
        for (const partId in bom) {
            const part = bom[partId];
            // Check if the part data is malformed (stored as string characters)
            if (part && typeof part === 'object' && part['0'] === '0' && part['1'] === '[') {
                // Try to find the part in inventory to get the correct data
                let found = false;
                for (const invId in inventory) {
                    if (normalizeValue(invId) === normalizeValue(partId)) {
                        // Get quantity from the part's projects
                        const quantity = inventory[invId].projects?.[projectId] || 0;
                        newBom[partId] = {
                            name: inventory[invId].name,
                            quantity: quantity
                        };
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    // If not found in inventory, create a basic entry
                    newBom[partId] = {
                        name: partId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                        quantity: 0
                    };
                }
            } else {
                // Keep valid entries as is
                newBom[partId] = part;
            }
        }
        
        // Update the project's BOM
        projects[projectId].bom = newBom;
    }
    
    // Save the repaired data
    saveProjects();
}

// Restore mobile navigation logic
function initializeMobileNav() {
    const navItems = document.querySelectorAll('.mobile-nav-item');
    const menus = document.querySelectorAll('.mobile-menu');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            // Remove active class from all items
            navItems.forEach(navItem => navItem.classList.remove('active'));
            // Hide all menus
            menus.forEach(menu => menu.classList.remove('show'));
            if (!isActive) {
                // Add active class to clicked item
                item.classList.add('active');
                // Show corresponding menu
                const menuId = item.dataset.tab + 'Menu';
                const menu = document.getElementById(menuId);
                if (menu) {
                    menu.classList.add('show');
                }
            }
            // If isActive, do nothing (all menus/items are now closed)
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.mobile-nav') && !e.target.closest('.mobile-menu')) {
            menus.forEach(menu => menu.classList.remove('show'));
            navItems.forEach(item => item.classList.remove('active'));
        }
    });

    // Close menu when clicking a menu item
    document.querySelectorAll('.mobile-menu-item').forEach(item => {
        item.addEventListener('click', () => {
            menus.forEach(menu => menu.classList.remove('show'));
            navItems.forEach(nav => nav.classList.remove('active'));
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeMobileNav();
    // Show mobile nav on mobile devices with animation
    if (window.innerWidth <= 1024) {
        showMobileNav();
    }
});

// Handle window resize for mobile nav visibility
window.addEventListener('resize', debounce(() => {
    const mobileNav = document.querySelector('.mobile-nav');
    if (window.innerWidth <= 1024) {
        if (mobileNav && !mobileNav.classList.contains('show')) {
            showMobileNav();
        }
    } else {
        // Force hide mobile nav when switching to desktop
        if (mobileNav && (mobileNav.classList.contains('show') || mobileNav.style.display === 'flex')) {
            mobileNav.classList.remove('show');
            mobileNav.style.display = 'none';
        }
    }
}, 200));

// ... existing code ...
function showBOMAssistantModal() {
    // Auto-close About modal if open
    const aboutModal = document.getElementById('aboutModal');
    if (aboutModal && aboutModal.classList.contains('show')) {
        hideModal('aboutModal');
    }
    showModal('bomAssistantModal');
    hideMobileNav();
}

function hideBOMAssistantModal() {
    hideModal('bomAssistantModal');
    showMobileNav();
}

// ... existing code ...
function hideMobileNav() {
    // Only hide on mobile devices
    if (window.innerWidth > 1024) return;
    
    const mobileNav = document.querySelector('.mobile-nav');
    if (mobileNav) {
        mobileNav.classList.remove('show');
        // Hide after animation completes
        setTimeout(() => {
            if (!mobileNav.classList.contains('show')) {
                mobileNav.style.display = 'none';
            }
        }, 300); // Match CSS transition duration
    }
}
function showMobileNav() {
    // Only show on mobile devices
    if (window.innerWidth > 1024) return;
    
    const mobileNav = document.querySelector('.mobile-nav');
    if (mobileNav) {
        mobileNav.style.display = 'flex';
        // Force reflow to ensure display:flex is applied before animation
        mobileNav.offsetHeight;
        mobileNav.classList.add('show');
    }
}

/**
 * Smart truncation for project usage lists
 * Prioritizes showing project names over quantities when space is limited
 */
function smartTruncateUsage(projects, maxLength = 40) {
    if (!projects || projects.length === 0) return '';
    
    // First try: full format with quantities
    let fullUsage = projects.map(p => `${p.project} (${p.quantity})`).join(', ');
    if (fullUsage.length <= maxLength) {
        return fullUsage;
    }
    
    // Second try: project names only
    let namesOnly = projects.map(p => p.project).join(', ');
    if (namesOnly.length <= maxLength) {
        return namesOnly;
    }
    
    // Third try: show first few projects + count
    let result = '';
    let count = 0;
    for (let i = 0; i < projects.length; i++) {
        let addition = (i === 0) ? projects[i].project : `, ${projects[i].project}`;
        if ((result + addition).length > maxLength - 10) { // Reserve space for " +X more"
            let remaining = projects.length - i;
            if (remaining > 0) {
                result += ` +${remaining} more`;
            }
            break;
        }
        result += addition;
        count++;
    }
    
    return result || projects[0].project; // Fallback to at least first project
}

/**
 * Show modal with slide-in animation
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.style.display = 'block';
    // Force reflow to ensure display:block is applied before animation
    modal.offsetHeight;
    modal.classList.add('show');
}

/**
 * Hide modal with slide-out animation
 */
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('show');
    // Wait for animation to complete before hiding
    setTimeout(() => {
        if (!modal.classList.contains('show')) {
            modal.style.display = 'none';
        }
    }, 300); // Match CSS transition duration
}

// =============================================================================
// MEMORY MANAGEMENT AND EVENT CLEANUP
// =============================================================================

// Store event listeners for cleanup
let activeEventListeners = new Map();

function addManagedEventListener(element, event, handler, options = false) {
    if (!element) return;
    
    element.addEventListener(event, handler, options);
    
    // Store for cleanup
    const key = `${element.id || element.className}_${event}`;
    if (!activeEventListeners.has(key)) {
        activeEventListeners.set(key, []);
    }
    activeEventListeners.get(key).push({ element, event, handler, options });
}

function cleanupEventListeners() {
    activeEventListeners.forEach((listeners, key) => {
        listeners.forEach(({ element, event, handler, options }) => {
            if (element && element.removeEventListener) {
                element.removeEventListener(event, handler, options);
            }
        });
    });
    activeEventListeners.clear();
}

// =============================================================================
// PERFORMANCE OPTIMIZATIONS
// =============================================================================

// Intersection Observer for lazy loading
let intersectionObserver = null;

function initializeIntersectionObserver() {
    if ('IntersectionObserver' in window) {
        intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const item = entry.target;
                    // Lazy load heavy computations here if needed
                    item.classList.add('visible');
                }
            });
        }, {
            rootMargin: '50px',
            threshold: 0.1
        });
    }
}

// Memory-efficient search with caching
let searchCache = new Map();
let searchCacheTimeout = null;

function getCachedSearchResults(query) {
    const cached = searchCache.get(query);
    if (cached && Date.now() - cached.timestamp < 30000) { // 30 second cache
        return cached.results;
    }
    return null;
}

function setCachedSearchResults(query, results) {
    // Limit cache size
    if (searchCache.size > 50) {
        const firstKey = searchCache.keys().next().value;
        searchCache.delete(firstKey);
    }
    
    searchCache.set(query, {
        results: results,
        timestamp: Date.now()
    });
    
    // Clear cache periodically
    if (searchCacheTimeout) clearTimeout(searchCacheTimeout);
    searchCacheTimeout = setTimeout(() => {
        searchCache.clear();
    }, 300000); // 5 minutes
}

// Optimized search function
function optimizedSearch(query, entries) {
    if (!query) return entries;
    
    const cached = getCachedSearchResults(query);
    if (cached) return cached;
    
    const lowerQuery = query.toLowerCase();
    const results = entries.filter(([id, part]) => {
        return part.name.toLowerCase().includes(lowerQuery) ||
               id.toLowerCase().includes(lowerQuery);
    });
    
    setCachedSearchResults(query, results);
    return results;
}

// =============================================================================
// BATTERY AND PERFORMANCE AWARENESS
// =============================================================================

// Reduce animations and effects on low battery
function checkBatteryOptimizations() {
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            if (battery.level < 0.2 || !battery.charging) {
                document.body.classList.add('low-battery-mode');
                // Disable non-essential animations
                document.documentElement.style.setProperty('--animation-duration', '0s');
            }
        });
    }
}

// Detect slow devices and adjust accordingly
function detectDevicePerformance() {
    const start = performance.now();
    
    // Simple CPU benchmark
    for (let i = 0; i < 100000; i++) {
        Math.random();
    }
    
    const time = performance.now() - start;
    
    if (time > 50) { // Slow device detected
        document.body.classList.add('slow-device');
        // Reduce virtual scrolling threshold
        VIRTUAL_SCROLLING.enabled = false;
        return 'slow';
    } else if (time > 20) {
        return 'medium';
    }
    return 'fast';
}

// =============================================================================
// LOCALSTORAGE PERFORMANCE OPTIMIZATIONS
// =============================================================================

// Debounced save functions to prevent excessive localStorage writes
const debouncedSaveInventory = debounce(() => {
    try {
        const compressed = compressData(inventory);
        localStorage.setItem('guitarPedalInventory', compressed);
    } catch (error) {
        console.warn('Failed to save inventory:', error);
        // Fallback to uncompressed if compression fails
        localStorage.setItem('guitarPedalInventory', JSON.stringify(inventory));
    }
}, 1000);

const debouncedSaveProjects = debounce(() => {
    try {
        const compressed = compressData(projects);
        localStorage.setItem('guitarPedalProjects', compressed);
    } catch (error) {
        console.warn('Failed to save projects:', error);
        // Fallback to uncompressed if compression fails
        localStorage.setItem('guitarPedalProjects', JSON.stringify(projects));
    }
}, 1000);

// Simple compression for localStorage
function compressData(data) {
    const jsonString = JSON.stringify(data);
    
    // Only compress if data is large enough to benefit
    if (jsonString.length < 1000) {
        return jsonString;
    }
    
    // Simple RLE compression for repetitive JSON data
    let compressed = jsonString.replace(/("quantity":|"name":|"projects":)/g, match => {
        switch(match) {
            case '"quantity":': return 'q:';
            case '"name":': return 'n:';
            case '"projects":': return 'p:';
            default: return match;
        }
    });
    
    // Mark as compressed
    return `COMPRESSED:${compressed}`;
}

function decompressData(data) {
    if (!data.startsWith('COMPRESSED:')) {
        return JSON.parse(data);
    }
    
    let decompressed = data.slice(11); // Remove 'COMPRESSED:' prefix
    
    // Reverse the compression
    decompressed = decompressed.replace(/(q:|n:|p:)/g, match => {
        switch(match) {
            case 'q:': return '"quantity":';
            case 'n:': return '"name":';
            case 'p:': return '"projects":';
            default: return match;
        }
    });
    
    return JSON.parse(decompressed);
}

// Batch localStorage operations
let pendingOperations = [];
let flushTimeout = null;

function queueStorageOperation(key, data) {
    pendingOperations.push({ key, data });
    
    if (flushTimeout) clearTimeout(flushTimeout);
    flushTimeout = setTimeout(flushPendingOperations, 100);
}

function flushPendingOperations() {
    const operations = [...pendingOperations];
    pendingOperations = [];
    
    requestIdleCallback(() => {
        operations.forEach(({ key, data }) => {
            try {
                localStorage.setItem(key, compressData(data));
            } catch (error) {
                console.warn(`Failed to save ${key}:`, error);
            }
        });
    }, { timeout: 1000 });
}
