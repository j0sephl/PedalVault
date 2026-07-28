/**
 * Matching, part types, merge, mobile nav, modal infrastructure.
 */
import {
    getInventory,
    getProjects
} from './state.js';
import { debounce, escapeHtml } from './utils.js';
import { DOM } from './dom-cache.js';
import { saveInventory, saveProjects, normalizeValue } from './storage.js';
import { showNotification, clearStuckNotifications } from './notifications.js';
import {
    displayInventory, hideAddPartModal, hideEditPartModal, hideDeletePartModal
} from './inventory-ui.js';
import {
    updateProjectFilter, showProjectDetails, processPastedBOM,
    hideBOMModal, hideProjectManagementModal, hideDeleteProjectModal,
    hideProjectDetailsModal, hideAllProjectRequirementsModal,
    hideExportBOMModal, hideProjectNameModal
} from './projects.js';
import { hideExportModal } from './backup.js';
import { updateBackupReminderUI } from './storage.js';

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
export function levenshtein(a, b) {
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

export function showAllProjectTagsModal(partId) {
    const part = getInventory()[partId];
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
            const project = getProjects()[projectId];
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

export function hideAllProjectTagsModal(openingAnotherModal) {
    hideModal('allProjectTagsModal');
    if (!openingAnotherModal) {
        showMobileNav();
    }
}

export function showAboutModal(event) {
    // Prevent any default behavior and event propagation
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    // Auto-close BOM Assistant modal if open
    const bomAssistantModal = document.getElementById('bomAssistantModal');
    if (bomAssistantModal && bomAssistantModal.classList.contains('show')) {
        hideBOMAssistantModal();
    }
    showModal('aboutModal');
    hideMobileNav();
}

export function hideAboutModal() {
    hideModal('aboutModal');
    showMobileNav();
}

// Update tag display responsively on window resize
window.addEventListener('resize', debounce(displayInventory, 200));

export function mergeDuplicateInventoryEntries(showNotifications = true) {
    const normalizedToCanonical = {};
    const duplicates = [];
    
    // Safety check: ensure inventory exists and is valid
    if (!getInventory() || typeof getInventory() !== 'object') {
        console.warn('Invalid inventory object in mergeDuplicateInventoryEntries');
        return;
    }
    
    // First pass: identify duplicates and choose canonical entries
    for (const [id, part] of Object.entries(getInventory())) {
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
            const existingPart = getInventory()[existingId];
            
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
        const canonicalPart = getInventory()[canonical];
        const duplicatePart = getInventory()[duplicate];
        
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
        delete getInventory()[duplicate];
    }
    
    // Update project BOMs to use canonical IDs
    // BOM entries are objects: { name, quantity }. Entries pointing at merged
    // duplicates are remapped to the canonical ID (summing quantities if both
    // exist); entries with no canonical match are kept as-is, since a BOM may
    // legitimately reference parts that aren't in the inventory yet.
    for (const project of Object.values(getProjects())) {
        if (project.bom) {
            const updatedBom = {};
            for (const [id, entry] of Object.entries(project.bom)) {
                const isObjectEntry = entry && typeof entry === 'object';
                const entryName = isObjectEntry ? entry.name : undefined;
                // Tolerate legacy numeric entries by coercing them to a quantity
                const entryQuantity = isObjectEntry ? (entry.quantity || 0) : (Number(entry) || 0);
                
                // Resolve the canonical ID via the part's name if it's in inventory,
                // otherwise via the BOM entry's own name or raw ID
                const lookupName = getInventory()[id] ? (getInventory()[id].name || '') : (entryName || id);
                const canonicalId = normalizedToCanonical[normalizeValue(lookupName)] ||
                    normalizedToCanonical[normalizeValue(id)];
                
                const targetId = (canonicalId && getInventory()[canonicalId]) ? canonicalId : id;
                const targetName = (getInventory()[targetId] && getInventory()[targetId].name) || entryName || id;
                
                if (updatedBom[targetId]) {
                    updatedBom[targetId].quantity = (updatedBom[targetId].quantity || 0) + entryQuantity;
                } else {
                    updatedBom[targetId] = { name: targetName, quantity: entryQuantity };
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

// --- Part type categories (capacitors & resistors) ---
const CAPACITOR_TYPES = ['MLCC', 'Box Film', 'Electrolytic', 'Tantalum', 'Other'];
const RESISTOR_TYPES = ['Metal Film', 'Carbon Film', 'Carbon Comp', 'Other'];

const PART_TYPE_LABELS = {
    'MLCC': 'MLCC (Ceramic)',
    'Box Film': 'Box Film',
    'Electrolytic': 'Electrolytic',
    'Tantalum': 'Tantalum',
    'Metal Film': 'Metal Film',
    'Carbon Film': 'Carbon Film',
    'Carbon Comp': 'Carbon Comp',
    'Other': 'Other'
};

export function isCapacitorPart(name) {
    return /\b(capacitor|cap)\b/i.test(name);
}

export function isResistorPart(name) {
    return /\b(resistor|res)\b/i.test(name);
}

export function getPartTypeCategory(name) {
    if (isCapacitorPart(name)) return 'capacitor';
    if (isResistorPart(name)) return 'resistor';
    return null;
}

export function getTypeOptionsForCategory(category) {
    if (category === 'capacitor') return CAPACITOR_TYPES;
    if (category === 'resistor') return RESISTOR_TYPES;
    return [];
}

export function populateTypeDropdown(dropdown, category, selectedValue) {
    dropdown.innerHTML = '';
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = '-- Select Type (optional) --';
    dropdown.appendChild(defaultOpt);

    for (const type of getTypeOptionsForCategory(category)) {
        const opt = document.createElement('option');
        opt.value = type;
        opt.textContent = PART_TYPE_LABELS[type] || type;
        if (type === selectedValue) opt.selected = true;
        dropdown.appendChild(opt);
    }
}

export function suggestPartType(partName, category) {
    if (category === 'capacitor') return suggestCapacitorType(partName);
    return null;
}

export function updateTypeSuggestion(nameInput, typeDropdown, typeSuggestion) {
    const category = getPartTypeCategory(nameInput.value);
    const suggestion = category ? suggestPartType(nameInput.value, category) : null;
    if (suggestion && !typeDropdown.classList.contains('hidden')) {
        typeSuggestion.textContent = `Suggested type: ${suggestion}`;
        if (!typeDropdown.value) {
            for (const opt of typeDropdown.options) {
                if (opt.value === suggestion) typeDropdown.value = suggestion;
            }
        }
    } else if (!typeDropdown.classList.contains('hidden')) {
        typeSuggestion.textContent = '';
    } else {
        typeSuggestion.textContent = '';
    }
}

// --- Auto-suggest capacitor type based on value ---
export function suggestCapacitorType(partName) {
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

export function resetPartTypeFields(typeDropdown, typeSuggestion) {
    if (!typeDropdown || !typeSuggestion) return;
    typeDropdown.classList.add('hidden');
    typeSuggestion.classList.add('hidden');
    typeDropdown.innerHTML = '';
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = '-- Select Type (optional) --';
    typeDropdown.appendChild(defaultOpt);
    typeDropdown.value = '';
    typeSuggestion.textContent = '';
}

// Utility to show/hide type dropdown and suggestion based on part name
export function updateTypeDropdownVisibility(nameInput, typeDropdown, typeSuggestion, preserveValue) {
    const category = getPartTypeCategory(nameInput.value);
    if (category) {
        const options = getTypeOptionsForCategory(category);
        const valueToKeep = preserveValue !== undefined ? preserveValue : typeDropdown.value;
        const validSelected = options.includes(valueToKeep) ? valueToKeep : '';
        populateTypeDropdown(typeDropdown, category, validSelected);
        typeDropdown.classList.remove('hidden');
        typeSuggestion.classList.remove('hidden');
    } else {
        resetPartTypeFields(typeDropdown, typeSuggestion);
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
        updateTypeSuggestion(newPartNameInput, newPartTypeDropdown, newPartTypeSuggestion);
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
        updateTypeSuggestion(editPartNameInput, editPartTypeDropdown, editPartTypeSuggestion);
    });
}

export function normalizeAllBOMReferences() {
    // Build a map from normalized ID to canonical inventory ID
    const normToCanonical = {};
    for (const id in getInventory()) {
        const norm = normalizeValue(id);
        if (!normToCanonical[norm]) {
            normToCanonical[norm] = id;
        }
    }
    // For each project and BOM, update part IDs to canonical
    for (const projectId in getProjects()) {
        const bom = getProjects()[projectId].bom;
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
        getProjects()[projectId].bom = newBOM;
    }
    saveProjects();
}

export function repairBOMData() {
    for (const projectId in getProjects()) {
        const bom = getProjects()[projectId].bom;
        const newBom = {};
        
        for (const partId in bom) {
            const part = bom[partId];
            // Check if the part data is malformed (stored as string characters)
            if (part && typeof part === 'object' && part['0'] === '0' && part['1'] === '[') {
                // Try to find the part in inventory to get the correct data
                let found = false;
                for (const invId in getInventory()) {
                    if (normalizeValue(invId) === normalizeValue(partId)) {
                        // Get quantity from the part's projects
                        const quantity = getInventory()[invId].projects?.[projectId] || 0;
                        newBom[partId] = {
                            name: getInventory()[invId].name,
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
        getProjects()[projectId].bom = newBom;
    }
    
    // Save the repaired data
    saveProjects();
}

// Restore mobile navigation logic
export function initializeMobileNav() {
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
    updateBackupReminderUI();
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

export function showQuickPasteBOM() {
    showBOMAssistantModal();
    requestAnimationFrame(() => {
        const textarea = document.getElementById('bomTextInput');
        const modal = document.getElementById('bomAssistantModal');
        if (textarea) {
            textarea.focus();
            textarea.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
        if (modal) {
            const content = modal.querySelector('.modal-content');
            if (content && textarea) {
                const offset = textarea.offsetTop - 24;
                content.scrollTop = Math.max(0, offset);
            }
        }
    });
}

export function showBOMAssistantModal() {
    // Auto-close About modal if open
    const aboutModal = document.getElementById('aboutModal');
    if (aboutModal && aboutModal.classList.contains('show')) {
        hideModal('aboutModal');
    }
    showModal('bomAssistantModal');
    hideMobileNav();
}

export function hideBOMAssistantModal() {
    hideModal('bomAssistantModal');
    showMobileNav();
}

export function hideMobileNav() {
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
export function showMobileNav() {
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
export function smartTruncateUsage(projectList, maxLength = 40) {
    if (!projectList || projectList.length === 0) return '';
    
    // First try: full format with quantities
    let fullUsage = projectList.map(p => `${p.project} (${p.quantity})`).join(', ');
    if (fullUsage.length <= maxLength) {
        return fullUsage;
    }
    
    // Second try: project names only
    let namesOnly = projectList.map(p => p.project).join(', ');
    if (namesOnly.length <= maxLength) {
        return namesOnly;
    }
    
    // Third try: show first few projects + count
    let result = '';
    let count = 0;
    for (let i = 0; i < projectList.length; i++) {
        let addition = (i === 0) ? projectList[i].project : `, ${projectList[i].project}`;
        if ((result + addition).length > maxLength - 10) { // Reserve space for " +X more"
            let remaining = projectList.length - i;
            if (remaining > 0) {
                result += ` +${remaining} more`;
            }
            break;
        }
        result += addition;
        count++;
    }
    
    return result || projectList[0].project; // Fallback to at least first project
}

/**
 * Modal accessibility: focus management, scroll lock, Escape, and Tab trap
 */
export let modalStack = [];
let modalPreviousFocus = null;

const MODAL_CLOSE_HANDLERS = {
    addPartModal: hideAddPartModal,
    editPartModal: hideEditPartModal,
    deletePartModal: hideDeletePartModal,
    exportModal: hideExportModal,
    bomModal: hideBOMModal,
    projectManagementModal: hideProjectManagementModal,
    deleteProjectModal: hideDeleteProjectModal,
    projectDetailsModal: hideProjectDetailsModal,
    allProjectRequirementsModal: hideAllProjectRequirementsModal,
    exportBOMModal: hideExportBOMModal,
    projectNameModal: hideProjectNameModal,
    allProjectTagsModal: () => hideAllProjectTagsModal(false),
    bomAssistantModal: hideBOMAssistantModal,
    aboutModal: hideAboutModal
};

export function getFocusableElements(container) {
    return Array.from(container.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(el => el.offsetParent !== null || el === document.activeElement);
}

export function handleModalKeydown(e) {
    if (e.key === 'Escape') {
        if (closeTopModal()) {
            e.preventDefault();
            return;
        }
        clearStuckNotifications();
        return;
    }

    if (e.key !== 'Tab' || modalStack.length === 0) return;

    const modal = document.getElementById(modalStack[modalStack.length - 1]);
    if (!modal || !modal.classList.contains('show')) return;

    const focusables = getFocusableElements(modal);
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
    }
}

export function closeTopModal() {
    const topId = modalStack[modalStack.length - 1];
    if (!topId) return false;
    const handler = MODAL_CLOSE_HANDLERS[topId];
    if (handler) {
        handler();
        return true;
    }
    hideModal(topId);
    return true;
}

export function handleModalBackdropClick(e) {
    if (e.target !== e.currentTarget) return;
    const modalId = e.currentTarget.id;
    const handler = MODAL_CLOSE_HANDLERS[modalId];
    if (handler) handler();
    else hideModal(modalId);
}

/**
 * Show modal with slide-in animation
 */
export function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    if (!modalStack.includes(modalId)) {
        if (modalStack.length === 0) {
            modalPreviousFocus = document.activeElement;
        }
        modalStack.push(modalId);
    }

    modal.style.display = 'block';
    modal.offsetHeight;
    modal.classList.add('show');
    document.body.classList.add('modal-open');

    if (!modal.dataset.backdropBound) {
        modal.addEventListener('click', handleModalBackdropClick);
        modal.dataset.backdropBound = 'true';
    }

    const focusables = getFocusableElements(modal);
    if (focusables.length) {
        requestAnimationFrame(() => focusables[0].focus());
    }
}

/**
 * Hide modal with slide-out animation
 */
export function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('show');
    modalStack = modalStack.filter(id => id !== modalId);

    if (modalStack.length === 0) {
        document.body.classList.remove('modal-open');
        if (modalPreviousFocus && typeof modalPreviousFocus.focus === 'function') {
            modalPreviousFocus.focus();
        }
        modalPreviousFocus = null;
    }

    setTimeout(() => {
        if (!modal.classList.contains('show')) {
            modal.style.display = 'none';
        }
    }, 300);
}

