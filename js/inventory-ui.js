/**
 * Inventory list UI and part CRUD.
 */
import {
    setCurrentProjectFilter,
    getCurrentSearchQuery,
    setCurrentSearchQuery,
    setCurrentSortOrder,
    setPendingQtyUndo,
    getDeletingPartId,
    setDeletingPartId,
    getCurrentPartId,
    setCurrentPartId,
    getEditingPartId,
    setEditingPartId,
    getInventory,
    setInventory,
    getProjects,
    getSelectedPartId,
    setSelectedPartId,
    LOW_STOCK_THRESHOLD
} from './state.js';
import { DOM } from './dom-cache.js';
import { escapeHtml, isSafeHttpUrl, sanitizePurchaseUrl } from './utils.js';
import { saveInventory, saveProjects, normalizeValue, updateHeaderCompactMode } from './storage.js';
import { showNotification } from './notifications.js';
import { getSortedInventoryEntries } from './search.js';
import {
    getPartTypeCategory, populateTypeDropdown, updateTypeDropdownVisibility,
    updateTypeSuggestion, resetPartTypeFields, showModal, hideModal, hideMobileNav,
    showMobileNav, showAllProjectTagsModal, showQuickPasteBOM
} from './matching.js';
import { showProjectDetails, updateProjectFilter, showProjectNameModal } from './projects.js';
import { requestLoadBackup } from './backup.js';

// =============================================================================
// INVENTORY DISPLAY AND RENDERING
// =============================================================================

export function displayInventory() {
    const inventoryItems = document.getElementById('inventoryItems');
    
    // Ensure search state is synchronized with the actual input value
    const searchInput = DOM.get('searchInput');
    if (searchInput) {
        const actualSearchValue = searchInput.value.toLowerCase().trim();
        if (actualSearchValue !== getCurrentSearchQuery()) {
            setCurrentSearchQuery(actualSearchValue);
        }
    }
    
    inventoryItems.innerHTML = '';
    
    // Get filtered and sorted entries (filtering is already done in getSortedInventoryEntries)
    const sortedEntries = getSortedInventoryEntries();

    if (sortedEntries.length === 0) {
        if (Object.keys(getInventory()).length === 0) {
            renderEmptyState(inventoryItems, 'welcome');
        } else {
            renderEmptyState(inventoryItems, 'no-results');
        }
        inventoryItems.removeAttribute('role');
        inventoryItems.removeAttribute('aria-label');
        updateHeaderCompactMode();
        return;
    }

    inventoryItems.setAttribute('role', 'listbox');
    inventoryItems.setAttribute('aria-label', 'Inventory');
    renderFullInventory(sortedEntries, inventoryItems);
    updateHeaderCompactMode();
}

export function renderEmptyState(container, mode) {
    const isWelcome = mode === 'welcome';
    container.innerHTML = `
        <div class="empty-state">
            <h2 class="empty-state-title">${isWelcome ? 'Your workshop drawer is empty' : 'No matching parts'}</h2>
            <p class="empty-state-text">${isWelcome
                ? 'Import a BOM to check stock, or add your first part. Your data stays in this browser.'
                : 'Try a different search term, sort order, or project filter.'}</p>
            <div class="empty-state-actions">
                ${isWelcome ? `
                    <button type="button" class="btn import-btn empty-state-btn empty-state-primary" data-empty-action="import-bom">Import BOM &amp; Check Stock</button>
                    <button type="button" class="btn btn-add empty-state-btn" data-empty-action="add-part">+ Add First Part</button>
                    <details class="empty-state-more">
                        <summary>More options</summary>
                        <div class="empty-state-more-body">
                            <button type="button" class="btn import-btn empty-state-btn" data-empty-action="quick-paste">Quick Paste BOM</button>
                            <button type="button" class="btn import-btn empty-state-btn" data-empty-action="load-backup">Load Backup</button>
                            <button type="button" class="btn cancel-btn empty-state-btn" data-empty-action="sample">Load Sample Parts</button>
                        </div>
                    </details>
                ` : `
                    <button type="button" class="btn cancel-btn empty-state-btn" data-empty-action="clear-filters">Clear Search &amp; Filters</button>
                `}
            </div>
        </div>
    `;

    container.querySelectorAll('[data-empty-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-empty-action');
            if (action === 'add-part') showAddPartModal();
            else if (action === 'import-bom') document.getElementById('importBOM').click();
            else if (action === 'quick-paste') showQuickPasteBOM();
            else if (action === 'load-backup') requestLoadBackup();
            else if (action === 'sample') loadSampleInventory();
            else if (action === 'clear-filters') {
                setCurrentSearchQuery('');
                setCurrentProjectFilter('all');
                setCurrentSortOrder('name-asc');
                const searchInput = DOM.get('searchInput');
                const projectFilter = DOM.get('projectFilter');
                const sortDropdown = DOM.get('sortDropdown');
                if (searchInput) searchInput.value = '';
                if (projectFilter) projectFilter.value = 'all';
                if (sortDropdown) sortDropdown.value = 'name-asc';
                displayInventory();
            }
        });
    });
}

export function loadSampleInventory() {
    setInventory({
        'resistor_10k': { name: 'Resistor 10kΩ', quantity: 25 },
        'capacitor_100nf': { name: 'Capacitor 100nF', quantity: 15 },
        'op_amp_4558': { name: 'Op-Amp JRC4558', quantity: 8 },
        'led_3mm': { name: 'LED 3mm Red', quantity: 12 },
        'potentiometer_100k': { name: 'Potentiometer 100kΩ', quantity: 6 },
        'switch_3pdt': { name: '3PDT Footswitch', quantity: 3 }
    });
    saveInventory();
    displayInventory();
    showNotification('Loaded sample parts — replace with your own inventory anytime');
}

export function renderFullInventory(entries, container) {
    const fragment = document.createDocumentFragment();
    
    entries.forEach(([id, part]) => {
        const item = createInventoryItemElement(id, part);
        fragment.appendChild(item);
    });
    
    container.appendChild(fragment);

    const selectedId = getSelectedPartId();
    if (selectedId && !entries.some(([id]) => id === selectedId)) {
        setSelectedPartId(null);
    }
    applyInventorySelection({ focus: false });
}

/**
 * Sync .is-selected / aria-selected / tabindex with getSelectedPartId().
 */
export function applyInventorySelection({ focus = false } = {}) {
    const selectedId = getSelectedPartId();
    const items = document.querySelectorAll('#inventoryItems .inventory-item');
    let selectedEl = null;

    items.forEach((el) => {
        const id = el.getAttribute('data-part-id');
        const isSelected = Boolean(selectedId) && id === selectedId;
        el.classList.toggle('is-selected', isSelected);
        el.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        el.tabIndex = isSelected ? 0 : -1;
        if (isSelected) selectedEl = el;
    });

    if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
        if (focus) {
            selectedEl.focus({ preventScroll: true });
        }
    }
}

export function selectInventoryPart(partId, { focus = true } = {}) {
    setSelectedPartId(partId);
    applyInventorySelection({ focus });
}

export function createInventoryItemElement(id, part) {
    const isMobile = window.innerWidth <= 1024;
    const maxTags = isMobile ? 0 : (window.innerWidth > 1280 ? 3 : 1);
    
    const item = document.createElement('div');
    const qty = part.quantity;
    const stockClass = qty <= 0 ? 'stock-out' : (qty < LOW_STOCK_THRESHOLD ? 'stock-low' : 'stock-ok');
    item.className = `inventory-item ${stockClass}`;
    item.setAttribute('data-part-id', id);
    item.setAttribute('role', 'option');
    item.setAttribute('aria-selected', 'false');
    item.tabIndex = -1;

    const projectEntries = part.projects ? Object.entries(part.projects) : [];
    let projectTagsHtml = '';
    if (projectEntries.length > 0) {
        if (isMobile) {
            // On mobile, always show a clickable tag for projects
            projectTagsHtml = `
                <span class="project-tag more-tags" data-part-id="${escapeHtml(id)}" title="Show all projects">
                    +${projectEntries.length} project${projectEntries.length > 1 ? 's' : ''}
                </span>
            `;
        } else {
            projectTagsHtml = projectEntries.slice(0, maxTags).map(([projectId, qtyNeeded]) => {
                const project = getProjects()[projectId];
                return project ? `
                    <span class="project-tag" data-project-id="${escapeHtml(projectId)}" title="${escapeHtml(project.name)} (${qtyNeeded} needed)">
                        ${escapeHtml(project.name.length > 12 ? project.name.slice(0, 10) + '…' : project.name)} (${qtyNeeded})
                    </span>
                ` : '';
            }).join('');
            
            if (projectEntries.length > maxTags) {
                const moreCount = projectEntries.length - maxTags;
                projectTagsHtml += `
                    <span class="project-tag more-tags" data-part-id="${escapeHtml(id)}" title="Show all projects">+${moreCount} more</span>
                `;
            }
        }
    }

    // --- Type pill logic ---
    let typePillHtml = '';
    const typeCategory = getPartTypeCategory(part.name);
    if (typeCategory && part.type) {
        // Restrict the CSS class to safe characters; the visible label is escaped
        const typeClass = part.type.toLowerCase().replace(/[^a-z0-9_-]/g, '');
        typePillHtml = `<span class="type-pill ${typeClass}">${escapeHtml(part.type)}</span>`;
    } else if (typeCategory && !part.type) {
        typePillHtml = `<span class="set-type-pill" title="Set ${typeCategory} type">Set Type</span>`;
    }

    const stockLabel = qty <= 0
        ? '<span class="stock-label" aria-label="Out of stock">OUT</span>'
        : (qty < LOW_STOCK_THRESHOLD
            ? '<span class="stock-label" aria-label="Low stock">LOW</span>'
            : '');
    const qtyClass = qty < LOW_STOCK_THRESHOLD ? 'item-quantity low' : 'item-quantity';

    const quantityHtml = `
        <div class="${qtyClass}">
            <button class="quantity-btn" data-action="decrease" aria-label="Decrease quantity">-</button>
            <span class="quantity-value">
                ${stockLabel}
                <span class="quantity-number">${qty}</span>
            </span>
            <button class="quantity-btn" data-action="increase" aria-label="Increase quantity">+</button>
        </div>
    `;

    const actionsHtml = `
        <div class="item-actions">
            <button class="action-icon edit-icon" aria-label="Edit part" title="Edit part">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            </button>
            <button class="action-icon shop-icon" aria-label="Open purchase link" title="Open purchase link">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8 4c0 .55-.45 1-1 1s-1-.45-1-1V8h2v2zm2-6c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm4 6c0 .55-.45 1-1 1s-1-.45-1-1V8h2v2z"/></svg>
            </button>
            <button class="action-icon delete-icon" aria-label="Delete part" title="Delete part">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
        </div>
    `;

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
                ${quantityHtml}
                ${actionsHtml}
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
            ${quantityHtml}
            ${actionsHtml}
        `;
    }

    // Add event listeners
    const decreaseBtn = item.querySelector('[data-action="decrease"]');
    const increaseBtn = item.querySelector('[data-action="increase"]');
    
    if (decreaseBtn) decreaseBtn.addEventListener('click', () => {
        selectInventoryPart(id, { focus: false });
        adjustStockInline(id, 'remove');
    });
    if (increaseBtn) increaseBtn.addEventListener('click', () => {
        selectInventoryPart(id, { focus: false });
        adjustStockInline(id, 'add');
    });

    // Action buttons (previously inline onclick handlers, which allowed
    // JS injection via crafted part IDs)
    const editBtn = item.querySelector('.edit-icon');
    const deleteBtn = item.querySelector('.delete-icon');
    const shopBtn = item.querySelector('.shop-icon');
    if (editBtn) editBtn.addEventListener('click', () => showEditPartModal(id));
    if (deleteBtn) deleteBtn.addEventListener('click', () => showDeletePartModal(id));
    if (shopBtn) shopBtn.addEventListener('click', () => handlePurchaseClick(id));

    // Row click selects for keyboard follow-up (↑↓←→)
    item.addEventListener('click', (e) => {
        if (e.target.closest('button, a, .project-tag, .set-type-pill')) return;
        selectInventoryPart(id, { focus: true });
    });

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

export function adjustStockInline(partId, action) {
    const part = getInventory()[partId];
    if (!part) return;

    const previousQuantity = part.quantity;
    
    if (action === 'add') {
        part.quantity += 1;
        showNotification(`Added 1 ${part.name}`, 'success', {
            undo: () => restoreQuantity(partId, previousQuantity)
        });
    } else if (action === 'remove') {
        if (part.quantity > 0) {
            part.quantity -= 1;
            showNotification(`Removed 1 ${part.name}`, 'success', {
                undo: () => restoreQuantity(partId, previousQuantity)
            });
        } else {
            showNotification('Cannot remove more items', 'error');
            return;
        }
    }
    
    saveInventory();
    displayInventory();
}

export function restoreQuantity(partId, quantity) {
    const part = getInventory()[partId];
    if (!part) return;
    part.quantity = quantity;
    setPendingQtyUndo(null);
    saveInventory();
    displayInventory();
    showNotification(`Restored ${part.name} to ${quantity}`);
}

export function showAddPartModal() {
    // Populate project assignments section
    populateNewPartProjectsSection();

    const typeDropdown = document.getElementById('newPartType');
    const typeSuggestion = document.getElementById('newPartTypeSuggestion');
    const nameInput = document.getElementById('newPartName');
    if (typeDropdown && typeSuggestion && nameInput) {
        updateTypeDropdownVisibility(nameInput, typeDropdown, typeSuggestion);
        updateTypeSuggestion(nameInput, typeDropdown, typeSuggestion);
    }
    
    showModal('addPartModal');
    hideMobileNav();
}

export function hideAddPartModal() {
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

    const typeDropdown = document.getElementById('newPartType');
    const typeSuggestion = document.getElementById('newPartTypeSuggestion');
    if (typeDropdown && typeSuggestion) {
        resetPartTypeFields(typeDropdown, typeSuggestion);
    }
    
    showMobileNav();
}

export function showEditPartModal(partId) {
    setEditingPartId(partId);
    const part = getInventory()[partId];
    document.getElementById('editPartName').value = part.name;
    document.getElementById('editPartQuantity').value = part.quantity;
    document.getElementById('editPartUrl').value = part.purchaseUrl || '';
    document.getElementById('editPartId').value = partId;
    const typeDropdown = document.getElementById('editPartType');
    const typeSuggestion = document.getElementById('editPartTypeSuggestion');
    const editPartNameInput = document.getElementById('editPartName');
    if (typeDropdown && typeSuggestion && editPartNameInput) {
        // Always update dropdown/suggestion visibility and content on modal open
        updateTypeDropdownVisibility(editPartNameInput, typeDropdown, typeSuggestion, part.type || '');
        updateTypeSuggestion(editPartNameInput, typeDropdown, typeSuggestion);
    }
    
    // Populate project assignments section
    populateEditPartProjectsSection(partId);
    
    showModal('editPartModal');
    hideMobileNav();
}

export function populateEditPartProjectsSection(partId) {
    const part = getInventory()[partId];
    const projectsSection = document.getElementById('editPartProjectsDropdownSection');
    
    if (!projectsSection) return;
    
    // If no projects exist, show a message
    if (Object.keys(getProjects()).length === 0) {
        projectsSection.innerHTML = `
            <div style="margin: 15px 0; padding: 10px; background: var(--nord1); border-left: 1px solid var(--nord13); color: var(--nord5);">
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
    
    for (const projectId in getProjects()) {
        const project = getProjects()[projectId];
        const currentQty = (part.projects && part.projects[projectId]) ? part.projects[projectId] : 0;
        
        projectsHtml += `
            <div class="nord-project-inv-row">
                <span class="nord-project-inv-name" title="${escapeHtml(project.name)}">${escapeHtml(project.name)}</span>
                <div class="modal-item-quantity">
                    <button type="button" class="quantity-btn" data-qty-delta="-1">-</button>
                    <input type="number" 
                           class="edit-project-qty" 
                           data-project-qty="${escapeHtml(projectId)}" 
                           value="${Number(currentQty) || 0}" 
                           min="0" 
                           max="9999"
                           style="width: 60px; text-align: center; background: var(--nord2); color: var(--nord6); border: 1px solid var(--nord4); padding: 4px;">
                    <button type="button" class="quantity-btn" data-qty-delta="1">+</button>
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
    attachQtyDeltaHandler(projectsSection);
}

/**
 * Delegated click handler for the +/- buttons in modal project rows.
 * Adjusts the sibling number input directly, so no project IDs need to
 * be embedded in inline handlers or query selectors.
 * Uses .onclick assignment so repeated modal opens don't stack listeners.
 */
export function attachQtyDeltaHandler(container) {
    container.onclick = (e) => {
        const btn = e.target.closest('[data-qty-delta]');
        if (!btn || !container.contains(btn)) return;
        const input = btn.parentElement.querySelector('input[type="number"]');
        if (!input) return;
        const delta = parseInt(btn.getAttribute('data-qty-delta'), 10) || 0;
        const currentValue = parseInt(input.value) || 0;
        input.value = Math.max(0, Math.min(9999, currentValue + delta));
    };
}

export function populateNewPartProjectsSection() {
    const projectsSection = document.getElementById('newPartProjectsDropdownSection');
    
    if (!projectsSection) return;
    
    // If no projects exist, show a message
    if (Object.keys(getProjects()).length === 0) {
        projectsSection.innerHTML = `
            <div style="margin: 15px 0; padding: 10px; background: var(--nord1); border-left: 1px solid var(--nord13); color: var(--nord5);">
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
    
    for (const projectId in getProjects()) {
        const project = getProjects()[projectId];
        
        projectsHtml += `
            <div class="nord-project-inv-row">
                <span class="nord-project-inv-name" title="${escapeHtml(project.name)}">${escapeHtml(project.name)}</span>
                <div class="modal-item-quantity">
                    <button type="button" class="quantity-btn" data-qty-delta="-1">-</button>
                    <input type="number" 
                           class="new-project-qty" 
                           data-new-project-qty="${escapeHtml(projectId)}" 
                           value="0" 
                           min="0" 
                           max="9999"
                           style="width: 60px; text-align: center; background: var(--nord2); color: var(--nord6); border: 1px solid var(--nord4); padding: 4px;">
                    <button type="button" class="quantity-btn" data-qty-delta="1">+</button>
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
    attachQtyDeltaHandler(projectsSection);
}

export function hideEditPartModal() {
    hideModal('editPartModal');

    const typeDropdown = document.getElementById('editPartType');
    const typeSuggestion = document.getElementById('editPartTypeSuggestion');
    if (typeDropdown && typeSuggestion) {
        resetPartTypeFields(typeDropdown, typeSuggestion);
    }

    setEditingPartId(null);
    showMobileNav();
}

export function saveEditPart() {
    if (!getEditingPartId()) return;
    const newName = document.getElementById('editPartName').value.trim();
    const newQuantity = parseInt(document.getElementById('editPartQuantity').value) || 0;
    const rawNewUrl = document.getElementById('editPartUrl').value.trim();
    const newUrl = sanitizePurchaseUrl(rawNewUrl);
    let newId = document.getElementById('editPartId').value.trim();
    const newType = document.getElementById('editPartType').value;
    if (!newName) {
        showNotification('Please enter a part name', 'error');
        return;
    }
    if (rawNewUrl && !newUrl) {
        showNotification('Purchase link must be a valid http(s) URL', 'error');
        return;
    }
    // Generate ID: normalize name + _ + normalize type (if type is selected)
    if (!newId) {
        newId = normalizeValue(newName);
        if (newType) {
            newId += '_' + normalizeValue(newType);
        }
    }
    if (newId !== getEditingPartId() && getInventory()[newId]) {
        showNotification('Part ID already exists', 'error');
        return;
    }
    const previousPartId = getEditingPartId();
    if (newId !== getEditingPartId()) {
        const part = getInventory()[getEditingPartId()];
        getInventory()[newId] = {
            name: newName,
            quantity: newQuantity,
            purchaseUrl: newUrl,
            projects: part.projects || {},
            type: newType || undefined
        };
        delete getInventory()[getEditingPartId()];
        setEditingPartId(newId);
    } else {
        getInventory()[getEditingPartId()].name = newName;
        getInventory()[getEditingPartId()].quantity = newQuantity;
        getInventory()[getEditingPartId()].purchaseUrl = newUrl;
        if (!getInventory()[getEditingPartId()].projects) {
            getInventory()[getEditingPartId()].projects = {};
        }
        getInventory()[getEditingPartId()].type = newType || undefined;
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
    getInventory()[newId].projects = newProjects;
    // Update project BOMs
    for (const projectId in getProjects()) {
        if (!getProjects()[projectId].bom) getProjects()[projectId].bom = {};
        // If the part ID changed, remove the entry stored under the old ID
        // so BOMs don't keep orphaned references to it
        if (newId !== previousPartId) {
            delete getProjects()[projectId].bom[previousPartId];
        }
        if (newProjects[projectId]) {
            getProjects()[projectId].bom[newId] = {
                name: newName,
                quantity: newProjects[projectId]
            };
        } else {
            // Remove from BOM if not present
            delete getProjects()[projectId].bom[newId];
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

export function showDeletePartModal(partId) {
    setDeletingPartId(partId);
    const part = getInventory()[partId];
    document.getElementById('deletePartMessage').textContent = 
        `Are you sure you want to delete "${part.name}"? This action cannot be undone.`;
    showModal('deletePartModal');
    hideMobileNav();
}

export function hideDeletePartModal() {
    hideModal('deletePartModal');
    setDeletingPartId(null);
    showMobileNav();
}

export function confirmDeletePart() {
    if (!getDeletingPartId()) return;
    
    const partName = getInventory()[getDeletingPartId()].name;
    
    if (getCurrentPartId() === getDeletingPartId()) {
        setCurrentPartId(null);
        // Removed hidePartInfoPanel call as function doesn't exist
    }
    
    delete getInventory()[getDeletingPartId()];
    saveInventory();
    displayInventory();
    hideDeletePartModal();
    showNotification(`Deleted ${partName}`);
}

export function addNewPart() {
    const name = document.getElementById('newPartName').value.trim();
    const quantity = parseInt(document.getElementById('newPartQuantity').value) || 0;
    const rawPurchaseUrl = document.getElementById('newPartUrl').value.trim();
    const purchaseUrl = sanitizePurchaseUrl(rawPurchaseUrl);
    if (rawPurchaseUrl && !purchaseUrl) {
        showNotification('Purchase link must be a valid http(s) URL', 'error');
        return;
    }
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
    if (getInventory()[id]) {
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
    
    getInventory()[id] = { 
        name, 
        quantity, 
        purchaseUrl,
        projects: newProjects,
        type: type || undefined
    };
    
    // Update project BOMs
    for (const projectId in getProjects()) {
        if (!getProjects()[projectId].bom) getProjects()[projectId].bom = {};
        if (newProjects[projectId]) {
            getProjects()[projectId].bom[id] = {
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

export function handlePurchaseClick(partId) {
    const part = getInventory()[partId];
    if (part && part.purchaseUrl) {
        // Validate at click time too: URLs may come from imported files
        // saved before sanitization existed
        const safeUrl = sanitizePurchaseUrl(part.purchaseUrl);
        if (!safeUrl) {
            showNotification('Purchase link is not a valid web address', 'error');
            return;
        }
        window.open(safeUrl, '_blank', 'noopener');
    } else {
        showNotification('No purchase link available', 'error');
    }
}

