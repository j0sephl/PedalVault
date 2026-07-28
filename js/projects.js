/**
 * Projects and BOM workflows.
 */
import {
    setCurrentProjectFilter,
    getDeletingProjectId,
    setDeletingProjectId,
    getPendingBomData,
    setPendingBomData,
    getEditingPartId,
    getInventory,
    getProjects,
    setProjects
} from './state.js';
import { DOM } from './dom-cache.js';
import { escapeHtml, csvEscape, sanitizePurchaseUrl, isSafeHttpUrl } from './utils.js';
import { saveInventory, saveProjects, normalizeValue, markBackupPending, decompressData } from './storage.js';
import { showNotification } from './notifications.js';
import { displayInventory } from './inventory-ui.js';
import {
    showModal, hideModal, hideMobileNav, showMobileNav, smartTruncateUsage, repairBOMData,
    levenshtein, hideBOMAssistantModal
} from './matching.js';

// =============================================================================
// PROJECT MANAGEMENT FUNCTIONALITY
// =============================================================================

/**
 * Initialize projects data from localStorage
 * Loads saved project information and updates the project filter dropdown
 */
export function initializeProjects() {
    const savedProjects = localStorage.getItem('guitarPedalProjects');
    if (savedProjects) {
        try {
            setProjects(decompressData(savedProjects));
        } catch (error) {
            console.warn('Failed to decompress projects data, trying fallback:', error);
            setProjects(JSON.parse(savedProjects));
        }
        updateProjectFilter();
    }
}

/**
 * Update the project filter dropdown with current projects
 * Rebuilds the dropdown options while preserving the current selection
 */
export function updateProjectFilter() {
    const filter = document.getElementById('projectFilter');
    if (!filter) return;
    
    // Store current selection to restore after rebuilding
    const currentValue = filter.value;
    
    // Clear existing options and add default "All Projects" option
    filter.innerHTML = '<option value="all">All Projects</option>';
    
    // Add option for each project
    for (const projectId in getProjects()) {
        const option = document.createElement('option');
        option.value = projectId;
        option.textContent = getProjects()[projectId].name;
        filter.appendChild(option);
    }
    
    // Restore previous selection if the project still exists
    if (currentValue !== 'all' && getProjects()[currentValue]) {
        filter.value = currentValue;
    } else {
        filter.value = 'all';
    }
}

/**
 * Handle project filter changes
 * Updates the current project filter and refreshes the inventory display
 */
export function filterByProject() {
    setCurrentProjectFilter(document.getElementById('projectFilter').value);
    displayInventory();
}

export function showProjectDetails(projectId) {
    hideMobileNav(); // Always hide nav bar when opening project details
    const project = getProjects()[projectId];
    
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
        let part = getInventory()[id];
        let matchedId = id;
        let fuzzyNote = '';
        if (!part) {
            // Try normalized match
            const normId = normalizeValue(id);
            let found = false;
            for (const invId in getInventory()) {
                if (normalizeValue(invId) === normId) {
                    part = getInventory()[invId];
                    matchedId = invId;
                    fuzzyNote = `<span style='color:#EBCB8B;font-size:11px;'>(Auto-matched to: ${escapeHtml(part.name)})</span>`;
                    found = true;
                    break;
                }
            }
            // Try Levenshtein if not found
            if (!found) {
                let bestId = null, bestDist = 99;
                for (const invId in getInventory()) {
                    const dist = levenshtein(normId, normalizeValue(invId));
                    if (dist < bestDist) {
                        bestDist = dist;
                        bestId = invId;
                    }
                }
                if (bestDist <= 2 && bestId) {
                    part = getInventory()[bestId];
                    matchedId = bestId;
                    fuzzyNote = `<span style='color:#EBCB8B;font-size:11px;'>(Auto-matched to: ${escapeHtml(part.name)})</span>`;
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

export function hideProjectDetailsModal() {
    hideModal('projectDetailsModal');
    showMobileNav();
}

export function removeProjectTag(partId, projectId) {
    if (!getInventory()[partId].projects) return;
    
    // Remove the tag from the inventory part
    delete getInventory()[partId].projects[projectId];
    if (Object.keys(getInventory()[partId].projects).length === 0) {
        delete getInventory()[partId].projects;
    }

    // Remove the part from the project's BOM
    if (getProjects()[projectId] && getProjects()[projectId].bom && getProjects()[projectId].bom[partId]) {
        delete getProjects()[projectId].bom[partId];
    }

    saveInventory();
    saveProjects();
    displayInventory();
    showProjectDetails(projectId);
    showNotification(`Removed ${inventory[partId].name} from ${projects[projectId].name}`);
}

export function showProjectNameModal() {
    const title = document.getElementById('projectNameModal-title');
    const hint = document.getElementById('projectNameModalHint');
    const confirmBtn = document.querySelector('#projectNameModal .btn-add');

    if (getPendingBomData()) {
        if (title) title.textContent = 'Name Your Build Project';
        if (hint) {
            hint.textContent = 'Your BOM will be saved as a new project, then compared against parts on hand.';
            hint.classList.remove('hidden');
        }
        if (confirmBtn) confirmBtn.textContent = 'Create Project & Check Stock';
    } else {
        if (title) title.textContent = 'New Project';
        if (hint) {
            hint.textContent = '';
            hint.classList.add('hidden');
        }
        if (confirmBtn) confirmBtn.textContent = 'Create Project';
    }

    showModal('projectNameModal');
    document.getElementById('projectNameInput').value = '';
    document.getElementById('projectNameInput').focus();
}

export function hideProjectNameModal() {
    hideModal('projectNameModal');
    setPendingBomData(null);
    document.getElementById('projectNameInput').value = '';
    const hint = document.getElementById('projectNameModalHint');
    if (hint) {
        hint.textContent = '';
        hint.classList.add('hidden');
    }
    const confirmBtn = document.querySelector('#projectNameModal .btn-add');
    if (confirmBtn) confirmBtn.textContent = 'Create Project';
}

export function confirmProjectName() {
    const projectName = document.getElementById('projectNameInput').value.trim();
    if (!projectName) {
        showNotification('Please enter a project name', 'error');
        return;
    }
    const projectId = projectName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (getProjects()[projectId]) {
        showNotification('Project name already exists', 'error');
        return;
    }
    if (getPendingBomData()) {
        createProjectFromBom(projectName, projectId, getPendingBomData());
        setPendingBomData(null);
    } else {
        // Create an empty project
        getProjects()[projectId] = {
            name: projectName,
            bom: {}
        };
        saveProjects();
        updateProjectFilter();
        displayInventory();
        showNotification(`Created project: ${projectName}`);
        // If Edit Part modal is open, refresh it to show the new project
        if (document.getElementById('editPartModal').classList.contains('show') && getEditingPartId()) {
            showEditPartModal(getEditingPartId());
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

export function createProjectFromBom(projectName, projectId, bom) {
    let totalParts = 0;
    let missingParts = 0;
    let lowStockParts = 0;
    getProjects()[projectId] = {
        name: projectName,
        bom: bom
    };
    
    // Tag parts in the main inventory with this project
    for (const id in bom) {
        // Find the part in inventory using multiple matching strategies
        let partId = id;
        if (!getInventory()[id]) {
            // Strategy 1: Try exact name match
            let found = false;
            for (const existingId in getInventory()) {
                if (getInventory()[existingId].name.toLowerCase() === bom[id].name.toLowerCase()) {
                    partId = existingId;
                    found = true;
                    break;
                }
            }
            
            // Strategy 2: Try normalized matching if exact match failed
            if (!found) {
                const normalizedBomName = normalizeValue(bom[id].name);
                const normalizedBomId = normalizeValue(id);
                for (const existingId in getInventory()) {
                    const normalizedInvName = normalizeValue(getInventory()[existingId].name);
                    const normalizedInvId = normalizeValue(existingId);
                    if (normalizedInvName === normalizedBomName || normalizedInvId === normalizedBomId) {
                        partId = existingId;
                        found = true;
                        break;
                    }
                }
            }
        }
        
        if (getInventory()[partId]) {
            if (!getInventory()[partId].projects) {
                getInventory()[partId].projects = {};
            }
            getInventory()[partId].projects[projectId] = bom[id].quantity;
        } else {
            // Create the part if it doesn't exist
            getInventory()[id] = {
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
        let part = getInventory()[id];
        let matchedId = id;
        let fuzzyNote = '';
        if (!part) {
            // Try normalized match
            const normId = normalizeValue(id);
            let found = false;
            for (const invId in getInventory()) {
                if (normalizeValue(invId) === normId) {
                    part = getInventory()[invId];
                    matchedId = invId;
                    fuzzyNote = `<span style='color:#EBCB8B;font-size:11px;'>(Auto-matched to: ${escapeHtml(part.name)})</span>`;
                    found = true;
                    break;
                }
            }
            // Try Levenshtein if not found
            if (!found) {
                let bestId = null, bestDist = 99;
                for (const invId in getInventory()) {
                    const dist = levenshtein(normId, normalizeValue(invId));
                    if (dist < bestDist) {
                        bestDist = dist;
                        bestId = invId;
                    }
                }
                if (bestDist <= 2 && bestId) {
                    part = getInventory()[bestId];
                    matchedId = bestId;
                    fuzzyNote = `<span style='color:#EBCB8B;font-size:11px;'>(Auto-matched to: ${escapeHtml(part.name)})</span>`;
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
                        <strong>${escapeHtml(bom[id].name)}</strong>
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
                        <strong>${escapeHtml(bom[id].name)}</strong>
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
                        <strong>${escapeHtml(bom[id].name)}</strong>
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

export function compareBOM(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            let bom = {};
            const fileContent = e.target.result;
            
            // Check if file is CSV
            if (file.name.toLowerCase().endsWith('.csv')) {
                // Use the shared CSV parsing function
                bom = parseBOMFromCSV(fileContent);
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
            setPendingBomData(bom);
            showProjectNameModal();

        } catch (err) {
            showNotification("Error processing BOM file: " + err.message, "error");
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

/**
 * Parse BOM data from CSV content (either file content or pasted text)
 * @param {string} csvContent - The CSV content to parse
 * @returns {Object} Parsed BOM data
 */
export function parseBOMFromCSV(csvContent) {
    const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
    if (parsed.errors.length) {
        console.error('CSV parse errors:', parsed.errors);
        throw new Error('CSV parse error: ' + parsed.errors[0].message);
    }
    
    let bom = {};
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
            for (const [invId, invPart] of Object.entries(getInventory())) {
                if (invPart.name.toLowerCase() === name.toLowerCase()) {
                    foundId = invId;
                    break;
                }
            }
            
            // If no exact match, try normalized matching
            if (!foundId) {
                const normalizedName = normalizeValue(name);
                for (const [invId, invPart] of Object.entries(getInventory())) {
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
    
    if (Object.keys(bom).length === 0) {
        throw new Error('No valid part data found. Expected columns: Name/Part/Component and Quantity');
    }
    
    return bom;
}

/**
 * Process pasted BOM data from the textarea input
 * Reuses the same CSV parsing logic as compareBOM function
 */
export function processPastedBOM() {
    const bomTextInput = document.getElementById('bomTextInput');
    if (!bomTextInput) {
        console.error('BOM text input not found');
        return;
    }
    
    const pastedText = bomTextInput.value.trim();
    if (!pastedText) {
        showNotification('Paste BOM CSV data first', 'error');
        return;
    }
    
    try {
        // Use the shared CSV parsing function
        const bom = parseBOMFromCSV(pastedText);
        
        // Store the BOM data and show the project name modal - same as compareBOM
        setPendingBomData(bom);
        showProjectNameModal();
        
        // Clear the input
        bomTextInput.value = '';
        
        // Hide the BOM assistant modal
        hideBOMAssistantModal();
        
    } catch (err) {
        showNotification("Error processing pasted BOM: " + err.message, "error");
    }
}

export function addMissingParts() {
    if (!window.currentBom) return;
    
    let addedCount = 0;
    for (const id in window.currentBom) {
        if (!getInventory()[id]) {
            const part = window.currentBom[id];
            getInventory()[id] = {
                name: part.name,
                quantity: 0,
                purchaseUrl: sanitizePurchaseUrl(part.purchaseUrl || ''),
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

export function showBOMModal() {
    showModal('bomModal');
    hideMobileNav();
}

export function hideBOMModal() {
    hideModal('bomModal');
    window.currentBom = null;
    showMobileNav();
}

// Add these new functions for project management
export function showProjectManagementModal() {
    const projectList = document.getElementById('projectList');
    projectList.innerHTML = '';
    
    for (const projectId in getProjects()) {
        const project = getProjects()[projectId];
        const projectElement = document.createElement('div');
        projectElement.className = 'project-list-item';
        
        // Count parts tagged with this project
        let taggedParts = 0;
        for (const id in getInventory()) {
            if (getInventory()[id].projects && getInventory()[id].projects[projectId]) {
                taggedParts++;
            }
        }
        
        projectElement.innerHTML = `
            <div>
                <strong>${escapeHtml(project.name)}</strong>
                <div class="project-info">
                    ${taggedParts} parts tagged
                </div>
            </div>
            <div>
                <button class="project-delete-btn">Delete</button>
            </div>
        `;
        
        projectElement.querySelector('.project-delete-btn')
            .addEventListener('click', () => showDeleteProjectModal(projectId));
        
        projectList.appendChild(projectElement);
    }
    
    showModal('projectManagementModal');
    hideMobileNav();
}

export function hideProjectManagementModal() {
    hideModal('projectManagementModal');
    showMobileNav();
}

export function showDeleteProjectModal(projectId) {
    setDeletingProjectId(projectId);
    const project = getProjects()[projectId];
    const modal = document.getElementById('deleteProjectModal');
    const message = document.getElementById('deleteProjectMessage');
    
    if (modal && message) {
        message.textContent = `Are you sure you want to delete "${project.name}"? This action cannot be undone.`;
        showModal('deleteProjectModal');
    }
    hideMobileNav();
}

export function hideDeleteProjectModal() {
    hideModal('deleteProjectModal');
    setDeletingProjectId(null);
    showMobileNav();
}

export function confirmDeleteProject() {
    if (!getDeletingProjectId()) return;
    
    const projectName = getProjects()[getDeletingProjectId()].name;
    
    // Remove project tags from all parts
    for (const id in getInventory()) {
        if (getInventory()[id].projects && getInventory()[id].projects[getDeletingProjectId()]) {
            delete getInventory()[id].projects[getDeletingProjectId()];
            // Remove projects object if empty
            if (Object.keys(getInventory()[id].projects).length === 0) {
                delete getInventory()[id].projects;
            }
        }
    }
    
    // Delete the project
    delete getProjects()[getDeletingProjectId()];
    
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
    setDeletingProjectId(null);
    
    // Show notification
    showNotification(`Deleted project: ${projectName}`);
}

export function showAllProjectRequirements() {
    // First repair any malformed BOM data
    repairBOMData();
    const partTotals = {};
    for (const projectId in getProjects()) {
        const bom = getProjects()[projectId].bom;
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
                for (const id in getInventory()) {
                    if (normalizeValue(id) === normId) {
                        partTotals[normId].name = getInventory()[id].name;
                        break;
                    }
                }
            }
            partTotals[normId].total += quantity;
            partTotals[normId].projects.push({
                project: getProjects()[projectId].name,
                quantity: quantity
            });
        }
    }
    for (const normId in partTotals) {
        const part = partTotals[normId];
        let foundInInventory = false;
        for (const id in getInventory()) {
            const invNormId = normalizeValue(id);
            if (invNormId === normId) {
                part.inventoryQty = getInventory()[id].quantity || 0;
                foundInInventory = true;
                break;
            }
        }
        if (!foundInInventory) {
            for (const id in getInventory()) {
                const invPart = getInventory()[id];
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
                    <span class="part-name">${escapeHtml(part.name)}</span>
                    <span class="part-qty-info">
                        Have: <b>${part.inventoryQty}</b> / Need: <b>${part.total}</b>
                        ${part.status !== 'sufficient' ? ` / Short: <b>${Math.max(0, part.total - part.inventoryQty)}</b>` : ''}
                    </span>
                    <span class="part-usage" title="${escapeHtml(fullUsageText)}">[${escapeHtml(truncatedUsage)}]</span>
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
    document.getElementById('allProjectRequirementsModal').querySelector('h2').textContent = 'All Project Requirements';
    document.getElementById('allProjectRequirements').innerHTML = html;
    showModal('allProjectRequirementsModal');
    hideMobileNav();
}

export function hideAllProjectRequirementsModal() {
    hideModal('allProjectRequirementsModal');
    showMobileNav();
}

export function showExportBOMModal() {
    const select = document.getElementById('exportBOMProject');
    select.innerHTML = '<option value="">Select a project...</option>';
    
    for (const projectId in getProjects()) {
        const option = document.createElement('option');
        option.value = projectId;
        option.textContent = getProjects()[projectId].name;
        select.appendChild(option);
    }
    
    showModal('exportBOMModal');
    hideMobileNav();
}

export function hideExportBOMModal() {
    hideModal('exportBOMModal');
    showMobileNav();
}

export function exportProjectBOM(format) {
    const projectId = document.getElementById('exportBOMProject').value;
    if (!projectId) {
        showNotification('Please select a project', 'error');
        return;
    }

    const project = getProjects()[projectId];
    const bom = project.bom;
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    let filename, dataStr, mimeType;

    if (format === 'csv') {
        filename = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}-bom-${timestamp}.csv`;
        // Create CSV header
        const headers = ['Part Name', 'Quantity', 'Purchase URL'];
        
        // Helper function to escape CSV fields
        // Create CSV rows
        const rows = Object.entries(bom).map(([id, part]) => {
            const inventoryPart = getInventory()[id];
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
                const inventoryPart = getInventory()[id];
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
export function createSyncButtons() {
    return `
        <button type="button" class="add-part-btn" onclick="showAddPartModal()">
            <svg class="sync-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Add New Part
        </button>
        <button type="button" class="sync-btn import-btn sync-btn-secondary full-width" onclick="document.getElementById('importBOM').click()" title="Upload a BOM file, create a project, and compare against your stock">
            <svg class="sync-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99c.41.41 1.09.41 1.5 0s.41-1.09 0-1.5l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            Import BOM &amp; Check Stock
        </button>
        <details class="sync-group">
            <summary class="sync-group-summary">BOM tools</summary>
            <div class="sync-group-body">
                <button type="button" class="sync-btn import-btn full-width" onclick="showBOMAssistantModal()">
                    <svg class="sync-icon" viewBox="0 0 192 192" aria-hidden="true">
                        <polygon points="111.44 20.77 131.36 74.6 185.2 94.52 131.36 114.45 111.44 168.28 91.52 114.45 37.68 94.52 91.52 74.6 111.44 20.77"/>
                        <polygon points="56.47 119.23 63.71 138.78 83.26 146.01 63.71 153.24 56.47 172.79 49.24 153.24 29.69 146.01 49.24 138.78 56.47 119.23"/>
                        <polygon points="33.59 16.76 40.82 36.31 60.37 43.55 40.82 50.78 33.59 70.33 26.35 50.78 6.8 43.55 26.35 36.31 33.59 16.76"/>
                    </svg>
                    BOM Assistant
                </button>
                <button type="button" class="sync-btn import-btn full-width" onclick="showQuickPasteBOM()" title="Paste CSV from an AI tool and check stock">
                    <svg class="sync-icon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M19 2H8c-1.1 0-2 .9-2 2v3H5c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2h-1V4c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V6h10v2z"/>
                    </svg>
                    Quick Paste BOM
                </button>
                <button type="button" class="sync-btn export-btn full-width" onclick="showExportBOMModal()">
                    <svg class="sync-icon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z"/>
                    </svg>
                    Export Project BOM
                </button>
            </div>
        </details>
        <details class="sync-group">
            <summary class="sync-group-summary">Backup &amp; cleanup</summary>
            <div class="sync-group-body">
                <button type="button" class="sync-btn import-btn full-width" onclick="requestLoadBackup()">
                    <svg class="sync-icon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
                    </svg>
                    Load Backup
                </button>
                <button type="button" class="sync-btn export-btn full-width" onclick="showExportModal()">
                    <svg class="sync-icon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                    </svg>
                    Export Backup
                </button>
                <button type="button" class="sync-btn import-btn full-width" onclick="mergeDuplicateInventoryEntries()">
                    <svg class="sync-icon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M17 20.41L18.41 19 15 15.59 13.59 17 17 20.41zM7.5 8H11v5.59L5.59 19 7 20.41l6-6V8h3.5L12 3.5 7.5 8z"/>
                    </svg>
                    Merge Duplicates
                </button>
            </div>
        </details>
    `;
}



export function updateQuantity(partId, newQuantity) {
    if (newQuantity < 0) newQuantity = 0;
    
    const part = getInventory()[partId];
    if (!part) return;

    const oldQuantity = part.quantity;
    part.quantity = newQuantity;
    
    saveInventory();
    displayInventory();
    
    if (newQuantity !== oldQuantity) {
        showNotification(`Updated ${part.name} quantity to ${newQuantity}`);
    }
}



