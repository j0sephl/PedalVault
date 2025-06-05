// Utility functions
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

function normalizeValue(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .replace(/[.,]/g, '')
        .replace(/([0-9]+)[ ]*([kmru])([0-9]*)/g, (m, p1, p2, p3) => p1 + p2 + (p3 || ''))
        .replace(/[^a-z0-9]/g, '');
}

function levenshtein(a, b) {
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b[i - 1] === a[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

// Cache DOM elements
const DOM = {
    get: function(id) {
        return document.getElementById(id);
    },
    inventoryItems: document.getElementById('inventoryItems'),
    searchInput: document.getElementById('searchInput'),
    sortDropdown: document.getElementById('sortDropdown'),
    projectFilter: document.getElementById('projectFilter'),
    syncButtonsContainer: document.getElementById('syncButtonsContainer'),
    modals: {
        addPart: document.getElementById('addPartModal'),
        editPart: document.getElementById('editPartModal'),
        deletePart: document.getElementById('deletePartModal'),
        exportData: document.getElementById('exportModal'),
        bomDisplay: document.getElementById('bomModal'),
        projectManagement: document.getElementById('projectManagementModal'),
        projectNameInput: document.getElementById('projectNameModal'),
        exportBOM: document.getElementById('exportBOMModal'),
        deleteProject: document.getElementById('deleteProjectModal'),
        allProjectRequirements: document.getElementById('allProjectRequirementsModal')
    }
};

// Application State
let inventory = {};
let projects = {};
let appState = {
    editingPartId: null,
    deletingPartId: null,
    deletingProjectId: null,
    currentSortOrder: 'name-asc',
    currentProjectFilter: 'all',
    pendingBomData: null,
    currentSearchQuery: '',
    currentBomForModal: null
};


function initializeApp() {
    DOM.searchInput?.addEventListener('input', debounce(searchParts, 250));
    DOM.projectFilter?.addEventListener('change', filterByProject);
    DOM.sortDropdown?.addEventListener('change', changeSortOrder);

    DOM.get('manageProjectsBtn')?.addEventListener('click', showProjectManagementModal);
    DOM.get('compareAllProjectsBtn')?.addEventListener('click', showAllProjectRequirementsModal);

    DOM.get('importBOMFile')?.addEventListener('change', compareBOM);
    DOM.get('importInventoryFile')?.addEventListener('change', importInventory);

    initializeData();
}

function setModalVisibility(modalKey, visible) {
    const modal = DOM.modals[modalKey];
    if (modal) {
        modal.style.display = visible ? 'block' : 'none';

        if (visible) {
            const firstInput = modal.querySelector('input[type="text"]:not([disabled]):not([readonly]), input[type="search"]:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly]), input[type="number"]:not([disabled]):not([readonly]), select:not([disabled])');
            if (firstInput) {
                firstInput.focus();
            }
            if (modalKey === 'projectNameInput') DOM.get('projectNameInput')?.focus();
            else if (modalKey === 'addPart') DOM.get('newPartName')?.focus();
            else if (modalKey === 'editPart') DOM.get('editPartName')?.focus();
        }
    } else {
        console.warn(`Modal for key '${modalKey}' not found in DOM.modals.`);
    }
}

function saveProjects() {
    localStorage.setItem('guitarPedalProjects', JSON.stringify(projects));
}

function saveInventory() {
    localStorage.setItem('guitarPedalInventory', JSON.stringify(inventory));
}

function initializeData() {
    const savedInventory = localStorage.getItem('guitarPedalInventory');
    if (savedInventory) {
        inventory = JSON.parse(savedInventory);
    } else {
        inventory = {
            'res_10k': { name: 'Resistor 10kΩ', quantity: 10, purchaseUrl: '', projects: {} }
        };
        saveInventory();
    }

    const savedProjects = localStorage.getItem('guitarPedalProjects');
    if (savedProjects) {
        projects = JSON.parse(savedProjects);
    } else {
        projects = {};
        saveProjects();
    }

    updateProjectFilter();
    displayInventory();
    checkUrlForPart();
    setupSyncButtons(DOM.syncButtonsContainer);
}

function createAndSetupButton(config) {
    const button = document.createElement('button');
    button.className = config.className; // Ensure this matches original HTML classes
    if (config.id) button.id = config.id;

    if (config.svgPath) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "icon"); // Original class for SVG
        svg.setAttribute("viewBox", "0 0 24 24");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", config.svgPath);
        svg.appendChild(path);
        button.appendChild(svg);
        // Add a space before the text node if SVG is present
        button.appendChild(document.createTextNode(" " + config.text));
    } else {
        button.textContent = config.text;
    }

    if (config.title) button.title = config.title;
    button.addEventListener('click', config.onClick);
    return button;
}

function setupSyncButtons(container) {
    if (!container) return;
    container.innerHTML = ''; // Clear existing

    // Button configurations with corrected classNames
    const buttonConfigs = [
        {
            className: 'action-btn add-part-btn', // Corrected: Original classes
            id: 'addPartBtnMain',
            text: 'Add New Part',
            svgPath: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
            onClick: showAddPartModal
        },
        {
            className: 'action-btn import-btn full-width', // Corrected
            id: 'compareBOMBtnMain',
            text: 'Import & Compare BOM',
            svgPath: "M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z",
            onClick: () => DOM.get('importBOMFile').click()
        },
        {
            className: 'action-btn export-btn full-width', // Corrected
            id: 'exportBOMModalBtnMain',
            text: 'Export Project BOM',
            svgPath: "M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z",
            onClick: showExportBOMModal
        },
        // Placeholder for HR
        { type: 'hr' },
        {
            className: 'action-btn import-btn full-width', // Corrected
            id: 'importDataBtnMain',
            text: 'Import Full Data',
            svgPath: "M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z",
            onClick: () => DOM.get('importInventoryFile').click()
        },
        {
            className: 'action-btn export-btn full-width', // Corrected
            id: 'exportDataBtnMain',
            text: 'Export Full Data',
            svgPath: "M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z",
            onClick: showExportDataModal
        }
    ];

    buttonConfigs.forEach(config => {
        if (config.type === 'hr') {
            const hr = document.createElement('hr');
            // hr.style.borderColor = 'var(--nord4)'; // CSS should handle this from style.css
            // hr.style.margin = '10px 0';
            container.appendChild(hr);
        } else {
            container.appendChild(createAndSetupButton(config));
        }
    });
}


function showExportDataModal() {
    setModalVisibility('exportData', true);
}

function hideExportDataModal() {
    setModalVisibility('exportData', false);
}

function exportInventory(format) {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    let filename, dataStr, mimeType;

    if (format === 'csv') {
        filename = `guitar-pedal-inventory-${timestamp}.csv`;
        const headers = ['Part ID', 'Name', 'Quantity', 'Purchase URL', 'Projects'];
        function csvEscape(val) {
            if (val == null) return '';
            val = String(val);
            if (val.includes('"')) val = val.replace(/"/g, '""');
            if (val.search(/[",\n]/) !== -1) return '"' + val + '"';
            return val;
        }
        const rows = Object.entries(inventory).map(([id, part]) => [
            id, part.name, part.quantity, part.purchaseUrl || '',
            part.projects ? Object.entries(part.projects).map(([pid, qty]) => `${pid}:${qty}`).join(';') : ''
        ].map(csvEscape));
        dataStr = [headers.map(csvEscape), ...rows].map(row => row.join(',')).join('\n');
        mimeType = 'text/csv';
    } else {
        filename = `guitar-pedal-inventory-${timestamp}.json`;
        dataStr = JSON.stringify({ inventory, projects }, null, 2);
        mimeType = 'application/json';
    }

    const dataBlob = new Blob([dataStr], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    hideExportDataModal();
    showNotification(`Exported inventory to ${filename}`);
}

function importInventory(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const fileContent = e.target.result;
            let importedInventoryData;
            let importedProjectsData = null;

            if (file.name.toLowerCase().endsWith('.csv')) {
                const parsed = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
                if (parsed.errors.length) throw new Error('CSV parse error: ' + parsed.errors[0].message);

                importedInventoryData = {};
                parsed.data.forEach(row => {
                    const name = row['Name'] || row['name'] || '';
                    if (!name) return;
                    const id = row['Part ID'] || row['part id'] || row['ID'] || row['id'] || normalizeValue(name);
                    const quantity = parseInt(row['Quantity'] || row['quantity'] || '0') || 0;
                    const purchaseUrl = row['Purchase URL'] || row['purchase url'] || '';
                    let itemProjects = {};
                    const projectsRaw = row['Projects'] || row['projects'] || '';
                    if (projectsRaw) {
                        projectsRaw.split(';').forEach(pair => {
                            const [pid, qtyStr] = pair.split(':').map(s => s.trim());
                            if (pid) itemProjects[pid] = qtyStr ? parseInt(qtyStr) || 0 : 0;
                        });
                    }
                    importedInventoryData[id] = { name, quantity, purchaseUrl, projects: itemProjects };
                });
            } else {
                const jsonData = JSON.parse(fileContent);
                if (jsonData.inventory && jsonData.projects) {
                    importedInventoryData = jsonData.inventory;
                    importedProjectsData = jsonData.projects;
                } else if (typeof jsonData === 'object' && jsonData !== null) {
                    importedInventoryData = jsonData;
                } else {
                    throw new Error('Invalid JSON file format');
                }
            }

            inventory = importedInventoryData;
            if (importedProjectsData) {
                projects = importedProjectsData;
            } else {
                const tempProjects = {};
                for (const partId in inventory) {
                    const part = inventory[partId];
                    if (part.projects) {
                        for (const projectId in part.projects) {
                            if (!tempProjects[projectId]) {
                                tempProjects[projectId] = { name: projectId, bom: {} };
                            }
                            if (!tempProjects[projectId].bom) tempProjects[projectId].bom = {};
                            tempProjects[projectId].bom[partId] = { name: part.name, quantity: part.projects[projectId] };
                        }
                    }
                }
                projects = tempProjects;
            }

            saveInventory();
            saveProjects();
            updateProjectFilter();
            displayInventory();
            showNotification('Inventory imported successfully!');
        } catch (error) {
            showNotification('Error importing file: ' + error.message, 'error');
            console.error("Import Error:", error);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function searchParts() {
    appState.currentSearchQuery = DOM.searchInput.value.toLowerCase().trim();
    displayInventory();
}

function getSortedInventoryEntries() {
    let entries = Object.entries(inventory);

    if (appState.currentSearchQuery) {
        entries = entries.filter(([_, part]) => part.name.toLowerCase().includes(appState.currentSearchQuery));
    }

    if (appState.currentProjectFilter !== 'all') {
        entries = entries.filter(([_, part]) => part.projects && part.projects[appState.currentProjectFilter]);
    }

    switch (appState.currentSortOrder) {
        case 'name-asc': return entries.sort((a, b) => a[1].name.localeCompare(b[1].name));
        case 'name-desc': return entries.sort((a, b) => b[1].name.localeCompare(a[1].name));
        case 'quantity-asc': return entries.sort((a, b) => a[1].quantity - b[1].quantity);
        case 'quantity-desc': return entries.sort((a, b) => b[1].quantity - a[1].quantity);
        case 'stock-status':
            return entries.sort((a, b) => {
                const aLowStock = a[1].quantity < 5;
                const bLowStock = b[1].quantity < 5;
                if (aLowStock && !bLowStock) return -1;
                if (!aLowStock && bLowStock) return 1;
                return a[1].name.localeCompare(b[1].name);
            });
        default: return entries;
    }
}

function changeSortOrder() {
    appState.currentSortOrder = DOM.sortDropdown.value;
    displayInventory();
}

function displayInventory() {
    const fragment = document.createDocumentFragment();
    const sortedItems = getSortedInventoryEntries();

    sortedItems.forEach(([id, part]) => {
        const item = document.createElement('div');
        item.className = 'inventory-item';
        item.dataset.id = id;

        const projectTagsHtml = part.projects ? Object.entries(part.projects)
            .map(([projectId, qty]) => {
                const project = projects[projectId];
                return project ? `<span class="project-tag" data-project-id="${projectId}" title="${project.name} (${qty} needed)">${project.name} (${qty})</span>` : '';
            }).join('') : '';

        item.innerHTML = `
            <div class="item-info">
                <div class="item-name">
                    ${part.name}
                    ${projectTagsHtml ? `<div class="project-tags">${projectTagsHtml}</div>` : ''}
                </div>
                <div class="item-quantity ${part.quantity < 5 ? 'low' : ''}">
                    <button class="quantity-btn" data-action="decrease" aria-label="Decrease quantity">-</button>
                    <span class="quantity-number" role="status" aria-live="polite">${part.quantity}</span>
                    <button class="quantity-btn" data-action="increase" aria-label="Increase quantity">+</button>
                </div>
            </div>
            <div class="item-actions">
                ${part.purchaseUrl ? `
                    <button class="action-icon shop-icon" title="Purchase">
                        <svg viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
                    </button>
                ` : ''}
                <button class="action-icon edit-icon" title="Edit">
                    <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                </button>
                <button class="action-icon delete-icon" title="Delete">
                    <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                </button>
            </div>
        `;

        item.querySelector('.edit-icon')?.addEventListener('click', () => showEditPartModal(id));
        item.querySelector('.delete-icon')?.addEventListener('click', () => showDeletePartModal(id));
        item.querySelector('.shop-icon')?.addEventListener('click', () => openPurchaseLink(id));

        item.querySelectorAll('.project-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.stopPropagation();
                const projectId = tag.dataset.projectId;
                if (projectId) showProjectDetailsModal(projectId);
            });
        });

        item.querySelector('[data-action="decrease"]')?.addEventListener('click', () => adjustStockInline(id, 'remove'));
        item.querySelector('[data-action="increase"]')?.addEventListener('click', () => adjustStockInline(id, 'add'));

        fragment.appendChild(item);
    });

    DOM.inventoryItems.innerHTML = '';
    DOM.inventoryItems.appendChild(fragment);
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
            showNotification(`${part.name} is already at 0 quantity.`, 'error');
            return;
        }
    }
    saveInventory();
    displayInventory();
}

function showAddPartModal() {
    setModalVisibility('addPart', true);
}

function hideAddPartModal() {
    setModalVisibility('addPart', false);
    DOM.get('newPartName').value = '';
    DOM.get('newPartQuantity').value = '';
    DOM.get('newPartUrl').value = '';
    DOM.get('newPartId').value = '';
}

function addNewPart() {
    const name = DOM.get('newPartName').value.trim();
    const quantity = parseInt(DOM.get('newPartQuantity').value) || 0;
    const purchaseUrl = DOM.get('newPartUrl').value.trim();
    let id = DOM.get('newPartId').value.trim();

    if (!name) {
        showNotification('Please enter a part name', 'error');
        return;
    }
    if (!id) id = normalizeValue(name);
    if (inventory[id]) {
        showNotification('Part ID already exists. Please choose a unique ID.', 'error');
        return;
    }

    inventory[id] = { name, quantity, purchaseUrl, projects: {} };
    saveInventory();
    displayInventory();
    hideAddPartModal();
    showNotification(`Added ${name} to inventory`);
}

function showEditPartModal(partId) {
    appState.editingPartId = partId;
    const part = inventory[partId];
    if (!part) {
        showNotification('Part not found for editing.', 'error');
        return;
    }

    DOM.get('editPartName').value = part.name;
    DOM.get('editPartQuantity').value = part.quantity;
    DOM.get('editPartUrl').value = part.purchaseUrl || '';
    DOM.get('editPartId').value = partId;

    const projectsDropdownSection = DOM.get('editPartProjectsDropdownSection');
    projectsDropdownSection.innerHTML = '';
    if (Object.keys(projects).length === 0) {
        projectsDropdownSection.innerHTML = '<div style="color:#888;font-size:13px;">No projects yet. Create one in Project Management.</div>';
    } else {
        let html = '<div class="nord-project-inv-list">';
        for (const projectId in projects) {
            const project = projects[projectId];
            const qtyInProject = part.projects && part.projects[projectId] ? part.projects[projectId] : 0;
            html += `
                <div class="nord-project-inv-row" data-project-id="${projectId}">
                    <span class="nord-project-inv-name">${project.name}</span>
                    <div class="modal-item-quantity" style="margin-left:auto;">
                        <button type="button" class="quantity-btn" data-action="decrement" aria-label="Decrease quantity for ${project.name}">-</button>
                        <input type="number" min="0" class="quantity-input-inline edit-project-qty" data-project-id="${projectId}" value="${qtyInProject}" aria-label="Quantity for ${project.name}" />
                        <button type="button" class="quantity-btn" data-action="increment" aria-label="Increase quantity for ${project.name}">+</button>
                    </div>
                </div>`;
        }
        html += '</div>';
        projectsDropdownSection.innerHTML = html;

        projectsDropdownSection.querySelectorAll('.nord-project-inv-row').forEach(row => {
            const qtyInput = row.querySelector('.edit-project-qty');
            row.querySelector('[data-action="decrement"]').addEventListener('click', () => {
                let val = parseInt(qtyInput.value) || 0;
                if (val > 0) qtyInput.value = val - 1;
            });
            row.querySelector('[data-action="increment"]').addEventListener('click', () => {
                let val = parseInt(qtyInput.value) || 0;
                qtyInput.value = val + 1;
            });
        });
    }
    setModalVisibility('editPart', true);
}

function hideEditPartModal() {
    setModalVisibility('editPart', false);
    appState.editingPartId = null;
}

function saveEditPart() {
    if (!appState.editingPartId) return;

    const newName = DOM.get('editPartName').value.trim();
    const newQuantity = parseInt(DOM.get('editPartQuantity').value) || 0;
    const newUrl = DOM.get('editPartUrl').value.trim();
    const newId = DOM.get('editPartId').value.trim();

    if (!newName || !newId) {
        showNotification('Part Name and Part ID are required.', 'error');
        return;
    }

    const oldPartData = inventory[appState.editingPartId];
    let targetId = appState.editingPartId;

    if (newId !== appState.editingPartId) {
        if (inventory[newId]) {
            showNotification('New Part ID already exists. Please choose a unique ID.', 'error');
            return;
        }
        inventory[newId] = { ...oldPartData };
        delete inventory[appState.editingPartId];
        targetId = newId;

        for (const projId in projects) {
            if (projects[projId].bom && projects[projId].bom[appState.editingPartId]) {
                projects[projId].bom[newId] = projects[projId].bom[appState.editingPartId];
                delete projects[projId].bom[appState.editingPartId];
            }
        }
    }

    inventory[targetId].name = newName;
    inventory[targetId].quantity = newQuantity;
    inventory[targetId].purchaseUrl = newUrl;
    if (!inventory[targetId].projects) inventory[targetId].projects = {};

    const projectsDropdownSection = DOM.get('editPartProjectsDropdownSection');
    const updatedPartProjects = {};
    projectsDropdownSection.querySelectorAll('.nord-project-inv-row').forEach(row => {
        const projectId = row.dataset.projectId;
        const qtyInput = row.querySelector('.edit-project-qty');
        const qtyForProject = Math.max(0, parseInt(qtyInput.value) || 0);

        if (qtyForProject > 0) {
            updatedPartProjects[projectId] = qtyForProject;
            if (!projects[projectId].bom) projects[projectId].bom = {};
            projects[projectId].bom[targetId] = { name: newName, quantity: qtyForProject };
        } else {
            if (projects[projectId] && projects[projectId].bom && projects[projectId].bom[targetId]) {
                delete projects[projectId].bom[targetId];
            }
        }
    });
    inventory[targetId].projects = updatedPartProjects;

    saveInventory();
    saveProjects();
    displayInventory();
    hideEditPartModal();
    showNotification(`Updated ${newName}`);
    appState.editingPartId = null;
}

function showDeletePartModal(partId) {
    appState.deletingPartId = partId;
    const part = inventory[partId];
    if (!part) return;
    DOM.get('deletePartMessage').textContent = `Are you sure you want to delete "${part.name}"? This action cannot be undone.`;
    setModalVisibility('deletePart', true);
}

function hideDeletePartModal() {
    setModalVisibility('deletePart', false);
    appState.deletingPartId = null;
}

function confirmDeletePart() {
    if (!appState.deletingPartId || !inventory[appState.deletingPartId]) return;

    const partName = inventory[appState.deletingPartId].name;

    for (const projectId in projects) {
        if (projects[projectId].bom && projects[projectId].bom[appState.deletingPartId]) {
            delete projects[projectId].bom[appState.deletingPartId];
        }
    }

    delete inventory[appState.deletingPartId];
    saveInventory();
    saveProjects();
    displayInventory();
    hideDeletePartModal();
    showNotification(`Deleted ${partName}`);
}

function openPurchaseLink(partId) {
    const part = inventory[partId];
    if (part && part.purchaseUrl) {
        window.open(part.purchaseUrl, '_blank', 'noopener,noreferrer');
    } else {
        showNotification('No purchase URL set for this part.', 'error');
    }
}

function showNotification(message, type = 'success') {
    const notification = DOM.get('notification');
    if (!notification) return;
    notification.textContent = message;
    notification.className = `notification ${type === 'error' ? 'error' : ''} show`;
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function checkUrlForPart() {
    const urlParams = new URLSearchParams(window.location.search);
    const partId = urlParams.get('part');
    const quickRemove = urlParams.get('remove');

    if (partId && inventory[partId]) {
        if (quickRemove === '1') {
            adjustStockInline(partId, 'remove');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
}

function updateProjectFilter() {
    const filter = DOM.projectFilter;
    if (!filter) return;

    const currentValue = filter.value;
    filter.innerHTML = '<option value="all">All Projects</option>';
    for (const projectId in projects) {
        const option = document.createElement('option');
        option.value = projectId;
        option.textContent = projects[projectId].name;
        filter.appendChild(option);
    }
    filter.value = (currentValue !== 'all' && projects[currentValue]) ? currentValue : 'all';
    appState.currentProjectFilter = filter.value;
}

function filterByProject() {
    appState.currentProjectFilter = DOM.projectFilter.value;
    displayInventory();
}

function generateBomComparisonHtml(bomToCompare, currentInventory) {
    let totalParts = 0, missingParts = 0, lowStockParts = 0;
    const resultsListItems = [];

    for (const idInBom in bomToCompare) {
        totalParts++;
        const bomEntry = bomToCompare[idInBom];
        let inventoryPart = currentInventory[idInBom];
        let fuzzyNote = '';

        if (!inventoryPart) {
            const normId = normalizeValue(idInBom);
            let foundMatch = null;
            for (const invId in currentInventory) {
                if (normalizeValue(invId) === normId) {
                    inventoryPart = currentInventory[invId];
                    fuzzyNote = `<span style='color:#EBCB8B;font-size:11px;'>(Auto-matched ID: ${invId} for ${inventoryPart.name})</span>`;
                    foundMatch = invId;
                    break;
                }
            }
            if (!foundMatch) {
                const normNameBom = normalizeValue(bomEntry.name);
                 for (const invId in currentInventory) {
                    if (normalizeValue(currentInventory[invId].name) === normNameBom) {
                        inventoryPart = currentInventory[invId];
                        fuzzyNote = `<span style='color:#D08770;font-size:11px;'>(Matched by name: ${inventoryPart.name})</span>`;
                        foundMatch = invId;
                        break;
                    }
                }
            }
            if (!foundMatch) {
                let bestDist = Infinity, bestId = null;
                const normNameBom = normalizeValue(bomEntry.name);
                for (const invId in currentInventory) {
                    const dist = levenshtein(normNameBom, normalizeValue(currentInventory[invId].name));
                    if (dist < bestDist && dist <= 2) {
                        bestDist = dist;
                        bestId = invId;
                    }
                }
                if (bestId) {
                    inventoryPart = currentInventory[bestId];
                    fuzzyNote = `<span style='color:#EBCB8B;font-size:11px;'>(Fuzzy name match: ${inventoryPart.name})</span>`;
                }
            }
        }

        const requiredQuantity = bomEntry.quantity;
        const partNameDisplay = bomEntry.name + (fuzzyNote ? ` ${fuzzyNote}` : '');
        let statusIcon, statusClass, statusText;

        if (!inventoryPart || inventoryPart.quantity === 0) {
            missingParts++;
            statusIcon = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>';
            statusClass = 'status-error';
            statusText = `: Missing (need ${requiredQuantity})`;
        } else if (inventoryPart.quantity < requiredQuantity) {
            lowStockParts++;
            statusIcon = '<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>';
            statusClass = 'status-warning';
            statusText = `: Have ${inventoryPart.quantity}, need ${requiredQuantity}`;
        } else {
            statusIcon = '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
            statusClass = 'status-success';
            statusText = `: In stock (have ${inventoryPart.quantity}, need ${requiredQuantity})`;
        }
        resultsListItems.push(`
            <li>
                <span class="bom-part-label">
                    <span class="status-icon ${statusClass}">${statusIcon}</span>
                    <strong>${partNameDisplay}</strong>
                </span>
                <span class="bom-part-status">${statusText}</span>
            </li>`);
    }

    const summaryHtml = `
        <div class="project-header">
            <div>Total Unique Parts: ${totalParts}</div>
            <div>Missing: ${missingParts}</div>
            <div>Low Stock: ${lowStockParts}</div>
        </div>`;
    const listHtml = `<ul class="project-info">${resultsListItems.join("")}</ul>`;
    return { summaryHtml, listHtml, missingParts, lowStockParts, totalParts };
}


function showProjectDetailsModal(projectId) {
    const project = projects[projectId];
    if (!project || !project.bom) {
        showNotification(`Project '${projectId}' or its BOM not found.`, 'error');
        return;
    }

    DOM.get('projectDetailsTitle').textContent = project.name;

    const bomComparison = generateBomComparisonHtml(project.bom, inventory);

    const resultsContainer = DOM.get("bomResults");
    if (resultsContainer) {
        resultsContainer.innerHTML = bomComparison.summaryHtml + bomComparison.listHtml;
    }

    appState.currentBomForModal = project.bom;

    setModalVisibility('bomDisplay', true);
}

function hideBomDisplayModal() {
    setModalVisibility('bomDisplay', false);
    appState.currentBomForModal = null;
    const resultsContainer = DOM.get("bomResults");
    if(resultsContainer) resultsContainer.innerHTML = '';
    const projectDetailsTitle = DOM.get('projectDetailsTitle');
    if(projectDetailsTitle) projectDetailsTitle.textContent = 'Bill of Materials';
}

function showProjectNameModal() {
    appState.pendingBomData = appState.pendingBomData || {};
    setModalVisibility('projectNameInput', true);
}

function hideProjectNameModal() {
    setModalVisibility('projectNameInput', false);
    DOM.get('projectNameInput').value = '';
    appState.pendingBomData = null;
}

function confirmProjectName() {
    const projectName = DOM.get('projectNameInput').value.trim();
    if (!projectName) {
        showNotification('Please enter a project name', 'error');
        return;
    }
    const projectId = normalizeValue(projectName);
    if (projects[projectId]) {
        showNotification(`Project name '${projectName}' (ID: ${projectId}) already exists.`, 'error');
        return;
    }

    if (appState.pendingBomData && Object.keys(appState.pendingBomData).length > 0) {
        createProjectFromBom(projectName, projectId, appState.pendingBomData);
    } else {
        projects[projectId] = { name: projectName, bom: {} };
        saveProjects();
        updateProjectFilter();
        showNotification(`Created empty project: ${projectName}`);
        if (DOM.modals.editPart.style.display === 'block' && appState.editingPartId) {
            showEditPartModal(appState.editingPartId);
        }
        if (DOM.modals.projectManagement.style.display === 'block') {
            showProjectManagementModal();
        }
    }
    hideProjectNameModal();
}

function createProjectFromBom(projectName, projectId, bomData) {
    projects[projectId] = { name: projectName, bom: bomData };
    appState.currentBomForModal = bomData;

    for (const bomPartIdRaw in bomData) {
        const bomEntry = bomData[bomPartIdRaw];
        let inventoryPartId = bomPartIdRaw;
        let partInInventory = inventory[inventoryPartId];

        if (!partInInventory) {
            const normBomPartId = normalizeValue(bomPartIdRaw);
            const normBomName = normalizeValue(bomEntry.name);
            let foundMatch = null;

            for (const invId in inventory) {
                if (normalizeValue(invId) === normBomPartId) {
                    partInInventory = inventory[invId];
                    inventoryPartId = invId;
                    foundMatch = true; break;
                }
            }
            if (!foundMatch) {
                for (const invId in inventory) {
                    if (normalizeValue(inventory[invId].name) === normBomName) {
                        partInInventory = inventory[invId];
                        inventoryPartId = invId;
                        foundMatch = true; break;
                    }
                }
            }
        }

        if (partInInventory) {
            if (!partInInventory.projects) partInInventory.projects = {};
            partInInventory.projects[projectId] = bomEntry.quantity;
        } else {
            inventory[inventoryPartId] = {
                name: bomEntry.name,
                quantity: 0,
                purchaseUrl: bomEntry.purchaseUrl || '',
                projects: { [projectId]: bomEntry.quantity }
            };
        }
    }

    saveProjects();
    saveInventory();
    updateProjectFilter();
    displayInventory();

    DOM.get('projectDetailsTitle').textContent = `BOM for new project: ${projectName}`;
    const bomComparison = generateBomComparisonHtml(bomData, inventory);
    const resultsContainer = DOM.get("bomResults");
    if (resultsContainer) {
        resultsContainer.innerHTML = bomComparison.summaryHtml + bomComparison.listHtml;
    }
    setModalVisibility('bomDisplay', true);
    showNotification(`Project '${projectName}' created from BOM.`);
}


function compareBOM(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const fileContent = e.target.result;
            let parsedBomData = {};

            if (file.name.toLowerCase().endsWith('.csv')) {
                const parsedCsv = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
                if (parsedCsv.errors.length) {
                    throw new Error('CSV parse error: ' + parsedCsv.errors[0].message);
                }
                parsedCsv.data.forEach(row => {
                    const name = row['Name'] || row['name'] || row['Part Name'] || row['part name'];
                    if (!name) return;
                    const id = row['Part ID'] || row['part id'] || row['ID'] || row['id'] || normalizeValue(name);
                    const quantity = parseInt(row['Quantity'] || row['quantity'] || '0');
                    const purchaseUrl = row['Purchase URL'] || row['purchase url'] || '';
                    if (id && quantity > 0) {
                        parsedBomData[id] = { name, quantity, purchaseUrl };
                    }
                });
            } else {
                const jsonData = JSON.parse(fileContent);
                if (jsonData.projectName && Array.isArray(jsonData.parts)) {
                    jsonData.parts.forEach(part => {
                        const id = normalizeValue(part.name);
                        if (part.quantity !== undefined) {
                            parsedBomData[id] = { name: part.name, quantity: part.quantity, purchaseUrl: part.purchaseUrl || '' };
                        }
                    });
                } else {
                    for (const id in jsonData) {
                        if (jsonData[id] && jsonData[id].quantity !== undefined && jsonData[id].name) {
                            parsedBomData[id] = { name: jsonData[id].name, quantity: jsonData[id].quantity, purchaseUrl: jsonData[id].purchaseUrl || '' };
                        }
                    }
                }
            }
            if (Object.keys(parsedBomData).length === 0) {
                throw new Error("No valid BOM data found in the file.");
            }
            appState.pendingBomData = parsedBomData;
            showProjectNameModal();
        } catch (err) {
            showNotification("Error processing BOM file: " + err.message, "error");
            console.error("BOM processing error:", err);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}


function addMissingPartsFromBomModal() {
    if (!appState.currentBomForModal) {
        showNotification('No BOM loaded in the modal to add parts from.', 'error');
        return;
    }

    let addedCount = 0;
    for (const idInBom in appState.currentBomForModal) {
        const bomEntry = appState.currentBomForModal[idInBom];
        let partExists = !!inventory[idInBom];

        if (!partExists) {
            const normId = normalizeValue(idInBom);
            const normName = normalizeValue(bomEntry.name);
            for (const invId in inventory) {
                if (normalizeValue(invId) === normId || normalizeValue(inventory[invId].name) === normName) {
                    partExists = true;
                    break;
                }
            }
        }

        if (!partExists) {
            inventory[idInBom] = {
                name: bomEntry.name,
                quantity: 0,
                purchaseUrl: bomEntry.purchaseUrl || '',
                projects: {}
            };
            addedCount++;
        }
    }

    if (addedCount > 0) {
        saveInventory();
        displayInventory();
        showNotification(`Added ${addedCount} new part(s) to inventory (quantity set to 0).`);

        const projectDetailsTitleEl = DOM.get('projectDetailsTitle');
        const activeProjectName = projectDetailsTitleEl ? projectDetailsTitleEl.textContent : "";

        if (activeProjectName.startsWith("BOM for new project:")) {
             const bomComparison = generateBomComparisonHtml(appState.currentBomForModal, inventory);
             const resultsContainer = DOM.get("bomResults");
             if (resultsContainer) resultsContainer.innerHTML = bomComparison.summaryHtml + bomComparison.listHtml;
        } else {
            const projectId = Object.keys(projects).find(pid => projects[pid].name === activeProjectName);
            if(projectId) showProjectDetailsModal(projectId);
        }

    } else {
        showNotification('All parts from the BOM already exist in inventory (though stock levels may vary).');
    }
}


function showProjectManagementModal() {
    const projectList = DOM.get('projectList');
    if (!projectList) return;
    projectList.innerHTML = '';

    if (Object.keys(projects).length === 0) {
        projectList.innerHTML = '<div>No projects created yet.</div>';
    } else {
        for (const projectId in projects) {
            const project = projects[projectId];
            const projectElement = document.createElement('div');
            projectElement.className = 'project-list-item';

            let taggedPartsCount = 0;
            for (const partId in inventory) {
                if (inventory[partId].projects && inventory[partId].projects[projectId]) {
                    taggedPartsCount++;
                }
            }
            const bomPartsCount = project.bom ? Object.keys(project.bom).length : 0;

            projectElement.innerHTML = `
                <div>
                    <strong>${project.name}</strong> (ID: ${projectId})
                    <div class="project-info">
                        ${bomPartsCount} parts in BOM, ${taggedPartsCount} inventory items tagged.
                    </div>
                </div>
                <div>
                    <button class="project-action-btn view-btn" data-project-id="${projectId}" title="View Project BOM">View</button>
                    <button class="project-action-btn delete-btn" data-project-id="${projectId}" title="Delete Project">Delete</button>
                </div>`;
            projectElement.querySelector('.view-btn').addEventListener('click', () => showProjectDetailsModal(projectId));
            projectElement.querySelector('.delete-btn').addEventListener('click', () => showDeleteProjectModal(projectId));
            projectList.appendChild(projectElement);
        }
    }
    setModalVisibility('projectManagement', true);
}

function hideProjectManagementModal() {
    setModalVisibility('projectManagement', false);
}


function showDeleteProjectModal(projectId) {
    appState.deletingProjectId = projectId;
    const project = projects[projectId];
    if (!project) return;
    DOM.get('deleteProjectMessage').textContent = `Are you sure you want to delete project "${project.name}"? This will remove it from all associated parts. This action cannot be undone.`;
    setModalVisibility('deleteProject', true);
}

function hideDeleteProjectModal() {
    setModalVisibility('deleteProject', false);
    appState.deletingProjectId = null;
}

function confirmDeleteProject() {
    if (!appState.deletingProjectId || !projects[appState.deletingProjectId]) return;

    const projectName = projects[appState.deletingProjectId].name;

    for (const partId in inventory) {
        if (inventory[partId].projects && inventory[partId].projects[appState.deletingProjectId]) {
            delete inventory[partId].projects[appState.deletingProjectId];
            if (Object.keys(inventory[partId].projects).length === 0) {
                delete inventory[partId].projects;
            }
        }
    }

    delete projects[appState.deletingProjectId];

    saveProjects();
    saveInventory();
    updateProjectFilter();
    displayInventory();

    hideDeleteProjectModal();
    showProjectManagementModal();
    showNotification(`Deleted project: ${projectName}`);
}


function showAllProjectRequirementsModal() {
    const partTotals = {};
    for (const projectId in projects) {
        const project = projects[projectId];
        if (!project.bom) continue;
        for (const bomPartId in project.bom) {
            const bomEntry = project.bom[bomPartId];
            let inventoryPartId = bomPartId;
            let inventoryPartName = bomEntry.name;

            let canonicalPart = inventory[bomPartId];
            if (!canonicalPart) {
                const normBomId = normalizeValue(bomPartId);
                const normBomName = normalizeValue(bomEntry.name);
                for(const invId in inventory) {
                    if(normalizeValue(invId) === normBomId || normalizeValue(inventory[invId].name) === normBomName) {
                        canonicalPart = inventory[invId];
                        inventoryPartId = invId;
                        inventoryPartName = canonicalPart.name;
                        break;
                    }
                }
            } else {
                inventoryPartName = canonicalPart.name;
            }

            if (!partTotals[inventoryPartId]) {
                partTotals[inventoryPartId] = {
                    name: inventoryPartName,
                    total: 0,
                    projectsInfo: []
                };
            }
            partTotals[inventoryPartId].total += bomEntry.quantity;
            partTotals[inventoryPartId].projectsInfo.push({
                projectName: project.name,
                quantity: bomEntry.quantity
            });
        }
    }

    let tableHtml = '<table id="allProjectRequirementsTable"><thead><tr><th>Part Name (ID)</th><th>Total Needed</th><th>Current Stock</th><th>Deficit</th><th>Projects</th></tr></thead><tbody>';
    for (const partId in partTotals) {
        const data = partTotals[partId];
        const stock = inventory[partId] ? inventory[partId].quantity : 0;
        const deficit = Math.max(0, data.total - stock);
        const rowClass = deficit > 0 ? 'low-stock' : '';

        tableHtml += `<tr class="${rowClass}">
            <td>${data.name} (${partId})</td>
            <td>${data.total}</td>
            <td>${stock}</td>
            <td${deficit > 0 ? ' style="color:var(--nord11); font-weight:bold;"' : ''}>${deficit}</td>
            <td>${data.projectsInfo.map(p => `${p.projectName} (${p.quantity})`).join('; ')}</td>
        </tr>`;
    }
    tableHtml += '</tbody></table>';

    const modalTitle = DOM.modals.allProjectRequirements.querySelector('h2');
    if (modalTitle) {
         modalTitle.innerHTML = 'All Project Requirements <br><span style="font-size:13px;color:var(--nord11);font-weight:normal;">* Highlighted rows indicate insufficient stock for combined project needs.</span>';
    }
    const contentContainer = DOM.get('allProjectRequirementsContent') || DOM.get('allProjectRequirementsModal').querySelector('.modal-content div:not(.modal-buttons)'); // Try to find content area
    if (contentContainer) contentContainer.innerHTML = tableHtml;
    setModalVisibility('allProjectRequirements', true);
}

function hideAllProjectRequirementsModal() {
    setModalVisibility('allProjectRequirements', false);
}


function showExportBOMModal() {
    const select = DOM.get('exportBOMProjectSelect');
    if (!select) return;
    select.innerHTML = '<option value="">Select a project...</option>';
    for (const projectId in projects) {
        const option = document.createElement('option');
        option.value = projectId;
        option.textContent = projects[projectId].name;
        select.appendChild(option);
    }
    setModalVisibility('exportBOM', true);
}

function hideExportBOMModal() {
    setModalVisibility('exportBOM', false);
    const select = DOM.get('exportBOMProjectSelect');
    if (select) select.value = '';
}

function exportProjectBOM(format) {
    const projectId = DOM.get('exportBOMProjectSelect').value;
    if (!projectId) {
        showNotification('Please select a project to export.', 'error');
        return;
    }

    const project = projects[projectId];
    if (!project || !project.bom) {
        showNotification('Selected project or its BOM is invalid.', 'error');
        return;
    }

    const bom = project.bom;
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const safeProjectName = project.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    let filename, dataStr, mimeType;

    if (format === 'csv') {
        filename = `${safeProjectName}_bom_${timestamp}.csv`;
        const headers = ['Part ID', 'Part Name', 'Quantity', 'Purchase URL'];
        const csvEscape = (val) => {
            if (val == null) return '';
            val = String(val);
            if (val.includes('"')) val = val.replace(/"/g, '""');
            return /[",\n\r]/.test(val) ? `"${val}"` : val;
        };
        const rows = Object.entries(bom).map(([id, partData]) => {
            const inventoryPart = inventory[id] || {};
            return [id, partData.name, partData.quantity, inventoryPart.purchaseUrl || ''].map(csvEscape);
        });
        dataStr = [headers.map(csvEscape), ...rows].map(row => row.join(',')).join('\r\n');
        mimeType = 'text/csv;charset=utf-8;';
    } else {
        filename = `${safeProjectName}_bom_${timestamp}.json`;
        const exportData = {
            projectName: project.name,
            projectId: projectId,
            exportDate: new Date().toISOString(),
            parts: Object.entries(bom).map(([id, partData]) => {
                const inventoryPart = inventory[id] || {};
                return {
                    id: id,
                    name: partData.name,
                    quantity: partData.quantity,
                    purchaseUrl: inventoryPart.purchaseUrl || ''
                };
            })
        };
        dataStr = JSON.stringify(exportData, null, 2);
        mimeType = 'application/json;charset=utf-8;';
    }

    const dataBlob = new Blob([dataStr], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    hideExportBOMModal();
    showNotification(`Exported BOM for ${project.name} as ${filename}`);
}

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();

    DOM.get('saveAddPartBtn')?.addEventListener('click', addNewPart);
    DOM.get('cancelAddPartBtn')?.addEventListener('click', hideAddPartModal);

    DOM.get('saveEditPartBtn')?.addEventListener('click', saveEditPart);
    DOM.get('cancelEditPartBtn')?.addEventListener('click', hideEditPartModal);

    DOM.get('confirmDeletePartBtn')?.addEventListener('click', confirmDeletePart);
    DOM.get('cancelDeletePartBtn')?.addEventListener('click', hideDeletePartModal);

    DOM.get('exportJsonBtn')?.addEventListener('click', () => exportInventory('json'));
    DOM.get('exportCsvBtn')?.addEventListener('click', () => exportInventory('csv'));
    DOM.get('cancelExportBtn')?.addEventListener('click', hideExportDataModal);

    DOM.get('closeBomDisplayBtn')?.addEventListener('click', hideBomDisplayModal);
    DOM.get('addMissingPartsBtn')?.addEventListener('click', addMissingPartsFromBomModal);


    DOM.get('createNewProjectManagementBtn')?.addEventListener('click', () => {
        appState.pendingBomData = {};
        showProjectNameModal();
    });
    DOM.get('closeProjectManagementBtn')?.addEventListener('click', hideProjectManagementModal);

    DOM.get('confirmDeleteProjectBtn')?.addEventListener('click', confirmDeleteProject);
    DOM.get('cancelDeleteProjectBtn')?.addEventListener('click', hideDeleteProjectModal);

    DOM.get('closeAllProjectRequirementsBtn')?.addEventListener('click', hideAllProjectRequirementsModal);

    DOM.get('exportProjectBOMJsonBtn')?.addEventListener('click', () => exportProjectBOM('json'));
    DOM.get('exportProjectBOMCsvBtn')?.addEventListener('click', () => exportProjectBOM('csv'));
    DOM.get('cancelExportBOMBtn')?.addEventListener('click', hideExportBOMModal);

    DOM.get('confirmProjectNameBtn')?.addEventListener('click', confirmProjectName);
    DOM.get('cancelProjectNameBtn')?.addEventListener('click', hideProjectNameModal);
});