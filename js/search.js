/**
 * Search, filter, sort.
 */
import {
    getCurrentProjectFilter,
    getCurrentSearchQuery,
    setCurrentSearchQuery,
    getCurrentSortOrder,
    setCurrentSortOrder,
    getInventory,
    LOW_STOCK_THRESHOLD
} from './state.js';
import { DOM } from './dom-cache.js';
import { displayInventory } from './inventory-ui.js';

// =============================================================================
// SEARCH AND FILTERING FUNCTIONALITY
// =============================================================================

/**
 * Handle search input changes
 * Updates the current search query and refreshes the inventory display
 */
export function searchParts() {
    const searchInput = DOM.get('searchInput');
    if (!searchInput) return;
    setCurrentSearchQuery(searchInput.value.toLowerCase().trim());
    displayInventory();
}

/**
 * Get inventory entries filtered and sorted according to current settings
 * Applies search query, project filter, and sort order in sequence
 * 
 * @returns {Array} Array of [partId, partData] tuples, filtered and sorted
 */
export function getSortedInventoryEntries() {
    const entries = Object.entries(getInventory());
    
    // Step 1: Filter by search query if one exists
    const filteredEntries = getCurrentSearchQuery() 
        ? entries.filter(([_, part]) => {
            const searchStr = part.name.toLowerCase();
            return searchStr.includes(getCurrentSearchQuery());
        })
        : entries;
    
    // Step 2: Apply project filter
    const projectFilteredEntries = getCurrentProjectFilter() !== 'all'
        ? filteredEntries.filter(([_, part]) => part.projects && part.projects[getCurrentProjectFilter()])
        : filteredEntries;
    
    // Step 3: Apply sorting based on current sort order
    switch (getCurrentSortOrder()) {
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
                const aLowStock = a[1].quantity < LOW_STOCK_THRESHOLD;
                const bLowStock = b[1].quantity < LOW_STOCK_THRESHOLD;
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
export function changeSortOrder() {
    setCurrentSortOrder(document.getElementById('sortDropdown').value);
    displayInventory();
}

