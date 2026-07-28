/**
 * Persistence, normalization, init load.
 */
import {
    getBackupExportPending,
    setBackupExportPending,
    getInventoryDirty,
    setInventoryDirty,
    getProjectsDirty,
    setProjectsDirty,
    getInventory,
    setInventory,
    getProjects
} from './state.js';
import { debounce } from './utils.js';
import { mergeDuplicateInventoryEntries, normalizeAllBOMReferences } from './matching.js';
import { initializeProjects, createSyncButtons } from './projects.js';
import { displayInventory } from './inventory-ui.js';
import { checkUrlForPart } from './notifications.js';
import { DOM } from './dom-cache.js';

// =============================================================================
// DATA NORMALIZATION AND PERSISTENCE
// =============================================================================

/**
 * Clean up invalid inventory entries
 * Removes parts with null data, missing names, or other corruption
 */
export function cleanupInvalidInventoryEntries() {
    let removedCount = 0;
    const invalidIds = [];
    
    for (const [id, part] of Object.entries(getInventory())) {
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
        delete getInventory()[id];
    });
    
    if (removedCount > 0) {
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
export function normalizeValue(str) {
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

// Dirty flags so pending debounced saves can be flushed if the page is
// hidden or closed before the debounce timer fires

const BACKUP_PENDING_KEY = 'pedalvault-backup-pending';
const COMPACT_HEADER_KEY = 'pedalvault-compact-header';
const VISITED_KEY = 'pedalvault-visited';

export function markBackupPending() {
    setBackupExportPending(true);
    try {
        localStorage.setItem(BACKUP_PENDING_KEY, '1');
    } catch (e) { /* ignore quota errors */ }
    updateBackupReminderUI();
}

export function clearBackupPending() {
    setBackupExportPending(false);
    try {
        localStorage.removeItem(BACKUP_PENDING_KEY);
    } catch (e) { /* ignore */ }
    updateBackupReminderUI();
}

export function loadBackupPendingState() {
    try {
        setBackupExportPending(localStorage.getItem(BACKUP_PENDING_KEY) === '1');
    } catch (e) {
        setBackupExportPending(false);
    }
}

export function updateBackupReminderUI() {
    const banner = document.getElementById('mobileBackupReminder');
    const badge = document.getElementById('dataTabBadge');
    const isMobile = window.innerWidth <= 1024;
    const show = getBackupExportPending() && isMobile;

    if (banner) {
        banner.classList.toggle('hidden', !show);
    }
    if (badge) {
        badge.classList.toggle('hidden', !getBackupExportPending());
    }
}

export function updateHeaderCompactMode() {
    const header = document.querySelector('.header');
    if (!header) return;

    const hasInventory = Object.keys(getInventory()).length > 0;
    let compact = false;
    try {
        compact = localStorage.getItem(COMPACT_HEADER_KEY) === '1'
            || localStorage.getItem(VISITED_KEY) === '1'
            || hasInventory;
    } catch (e) {
        compact = hasInventory;
    }

    header.classList.toggle('header-compact', compact);

    try {
        localStorage.setItem(VISITED_KEY, '1');
        if (hasInventory) {
            localStorage.setItem(COMPACT_HEADER_KEY, '1');
        }
    } catch (e) { /* ignore */ }
}

/**
 * Save projects data to browser's local storage
 * Persists project information including BOMs between browser sessions
 */
export function saveProjects() {
    setProjectsDirty(true);
    markBackupPending();
    debouncedSaveProjects();
}

/**
 * Save inventory data to browser's local storage
 * Persists component inventory between browser sessions
 */
export function saveInventory() {
    setInventoryDirty(true);
    markBackupPending();
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
export function initializeInventory() {
    // Try to load existing inventory data from browser storage
    const savedInventory = localStorage.getItem('guitarPedalInventory');
    if (savedInventory) {
        try {
            setInventory(decompressData(savedInventory));
        } catch (error) {
            console.warn('Failed to decompress inventory data, trying fallback:', error);
            setInventory(JSON.parse(savedInventory));
        }
        // Clean up any invalid entries first
        cleanupInvalidInventoryEntries();
        // Auto-merge any duplicate entries that may have been created (silently)
        mergeDuplicateInventoryEntries(false);
    } else {
        setInventory({});
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
// LOCALSTORAGE PERFORMANCE OPTIMIZATIONS
// =============================================================================

// Synchronous writers used by both the debounced saves and the unload flush
export function writeInventoryToStorage() {
    try {
        const compressed = compressData(getInventory());
        localStorage.setItem('guitarPedalInventory', compressed);
    } catch (error) {
        console.warn('Failed to save inventory:', error);
        // Fallback to uncompressed if compression fails
        localStorage.setItem('guitarPedalInventory', JSON.stringify(getInventory()));
    }
    setInventoryDirty(false);
}

export function writeProjectsToStorage() {
    try {
        const compressed = compressData(getProjects());
        localStorage.setItem('guitarPedalProjects', compressed);
    } catch (error) {
        console.warn('Failed to save projects:', error);
        // Fallback to uncompressed if compression fails
        localStorage.setItem('guitarPedalProjects', JSON.stringify(getProjects()));
    }
    setProjectsDirty(false);
}

// Debounced save functions to prevent excessive localStorage writes
export const debouncedSaveInventory = debounce(writeInventoryToStorage, 1000);
export const debouncedSaveProjects = debounce(writeProjectsToStorage, 1000);

// Flush any pending debounced saves immediately so edits made within the
// debounce window aren't lost when the tab is hidden, closed, or navigated away
export function flushPendingSaves() {
    if (getInventoryDirty()) writeInventoryToStorage();
    if (getProjectsDirty()) writeProjectsToStorage();
}

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        flushPendingSaves();
    }
});

// pagehide covers browsers/situations where visibilitychange doesn't fire on close
window.addEventListener('pagehide', flushPendingSaves);

// Simple compression for localStorage
export function compressData(data) {
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

export function decompressData(data) {
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
