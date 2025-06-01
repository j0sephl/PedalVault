    let inventory = {};
    let currentPartId = null;
    let editingPartId = null;
    let deletingPartId = null;
    let currentSortOrder = 'name-asc';
    let projects = {};
    let currentProjectFilter = 'all';
    let pendingBomData = null;

    function saveProjects() {
        localStorage.setItem('guitarPedalProjects', JSON.stringify(projects));
    }

    function saveInventory() {
        localStorage.setItem('guitarPedalInventory', JSON.stringify(inventory));
    }

    // Initialize with some sample data
    function initializeInventory() {
        const savedInventory = localStorage.getItem('guitarPedalInventory');
        if (savedInventory) {
            inventory = JSON.parse(savedInventory);
        } else {
            // Sample data
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
        initializeProjects();
        displayInventory();
        checkUrlForPart();
        
        // Update sync buttons
        const syncButtonsContainer = document.querySelector('.sync-buttons');
        if (syncButtonsContainer) {
            syncButtonsContainer.innerHTML = createSyncButtons();
        }
    }

    function showExportModal() {
        document.getElementById('exportModal').style.display = 'block';
    }

    function hideExportModal() {
        document.getElementById('exportModal').style.display = 'none';
    }

    function exportInventory(format) {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
        let filename, dataStr, mimeType;
        
        if (format === 'csv') {
            filename = `guitar-pedal-inventory-${timestamp}.csv`;
            // Create CSV header
            const headers = ['Part ID', 'Name', 'Quantity', 'Purchase URL'];
            // Create CSV rows
            const rows = Object.entries(inventory).map(([id, part]) => [
                id,
                part.name,
                part.quantity,
                part.purchaseUrl || ''
            ]);
            // Combine header and rows
            dataStr = [headers, ...rows].map(row => row.join(',')).join('\n');
            mimeType = 'text/csv';
        } else {
            filename = `guitar-pedal-inventory-${timestamp}.json`;
            dataStr = JSON.stringify(inventory, null, 2);
            mimeType = 'application/json';
        }
        
        const dataBlob = new Blob([dataStr], {type: mimeType});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        hideExportModal();
        showNotification(`Exported inventory to ${filename}`);
    }

    function importInventory(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (typeof importedData === 'object' && importedData !== null) {
                    inventory = importedData;
                    saveInventory();
                    displayInventory();
                    
                    currentPartId = null;
                    hidePartInfoPanel();
                    
                    showNotification('Inventory imported successfully!');
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                showNotification('Error importing file: Invalid format', 'error');
            }
        };
        reader.readAsText(file);
        
        // Reset the file input
        event.target.value = '';
    }

    function getSortedInventoryEntries() {
        const entries = Object.entries(inventory);
        
        switch (currentSortOrder) {
            case 'name-asc':
                return entries.sort((a, b) => a[1].name.localeCompare(b[1].name));
            case 'name-desc':
                return entries.sort((a, b) => b[1].name.localeCompare(a[1].name));
            case 'quantity-asc':
                return entries.sort((a, b) => a[1].quantity - b[1].quantity);
            case 'quantity-desc':
                return entries.sort((a, b) => b[1].quantity - a[1].quantity);
            case 'stock-status':
                return entries.sort((a, b) => {
                    const aLowStock = a[1].quantity < 5;
                    const bLowStock = b[1].quantity < 5;
                    if (aLowStock && !bLowStock) return -1;
                    if (!aLowStock && bLowStock) return 1;
                    return a[1].name.localeCompare(b[1].name);
                });
            default:
                return entries;
        }
    }

    function changeSortOrder() {
        currentSortOrder = document.getElementById('sortDropdown').value;
        displayInventory();
    }

    function displayInventory() {
        const container = document.getElementById('inventoryItems');
        container.innerHTML = '';

        const sortedEntries = getSortedInventoryEntries();

        sortedEntries.forEach(([id, part]) => {
            // Skip if filtering by project and part doesn't belong to that project
            if (currentProjectFilter !== 'all' && (!part.projects || !part.projects[currentProjectFilter])) {
                return;
            }
            
            const item = document.createElement('div');
            item.className = 'inventory-item';
            
            const quantityClass = part.quantity < 5 ? 'item-quantity low' : 'item-quantity';
            
            // Get project tags for this part
            const projectTags = part.projects ? Object.keys(part.projects).map(projectId => {
                if (projects[projectId]) {  // Only show tags for existing projects
                    return `<span class="project-tag" onclick="showProjectDetails('${projectId}')">${projects[projectId].name}</span>`;
                }
                return '';
            }).filter(tag => tag !== '').join('') : '';
            
            item.innerHTML = `
                <div class="item-info">
                    <div>
                        <span class="item-name">${part.name}</span>
                        ${projectTags}
                    </div>
                    <div class="${quantityClass}" data-part-id="${id}">
                        <button class="quantity-btn" onclick="adjustStockInline('${id}', 'remove')">-</button>
                        <span class="quantity-number" onclick="showQuantityInput('${id}', ${part.quantity})">${part.quantity}</span>
                        <button class="quantity-btn" onclick="adjustStockInline('${id}', 'add')">+</button>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="action-icon shop-icon" onclick="openPurchaseLink('${id}')" title="Reorder part">
                        <svg viewBox="0 0 24 24">
                            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                    </button>
                    <button class="action-icon edit-icon" onclick="showEditPartModal('${id}')" title="Edit part">
                        <svg viewBox="0 0 24 24">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                    </button>
                    <button class="action-icon delete-icon" onclick="showDeletePartModal('${id}')" title="Delete part">
                        <svg viewBox="0 0 24 24">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                    </button>
                </div>
            `;
            
            container.appendChild(item);
        });
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
        document.getElementById('addPartModal').style.display = 'block';
    }

    function hideAddPartModal() {
        document.getElementById('addPartModal').style.display = 'none';
        document.getElementById('newPartName').value = '';
        document.getElementById('newPartQuantity').value = '';
        document.getElementById('newPartUrl').value = '';
        document.getElementById('newPartId').value = '';
    }

    function showEditPartModal(partId) {
        editingPartId = partId;
        const part = inventory[partId];
        
        document.getElementById('editPartName').value = part.name;
        document.getElementById('editPartQuantity').value = part.quantity;
        document.getElementById('editPartUrl').value = part.purchaseUrl || '';
        document.getElementById('editPartId').value = partId;
        document.getElementById('editPartModal').style.display = 'block';
    }

    function hideEditPartModal() {
        document.getElementById('editPartModal').style.display = 'none';
        editingPartId = null;
    }

    function saveEditPart() {
        if (!editingPartId) return;
        
        const newName = document.getElementById('editPartName').value.trim();
        const newQuantity = parseInt(document.getElementById('editPartQuantity').value) || 0;
        const newUrl = document.getElementById('editPartUrl').value.trim();
        const newId = document.getElementById('editPartId').value.trim();
        
        if (!newName) {
            showNotification('Please enter a part name', 'error');
            return;
        }
        
        if (!newId) {
            showNotification('Please enter a part ID', 'error');
            return;
        }
        
        // If ID is changing, check if new ID already exists
        if (newId !== editingPartId && inventory[newId]) {
            showNotification('Part ID already exists', 'error');
            return;
        }
        
        // If ID is changing, we need to create a new entry and delete the old one
        if (newId !== editingPartId) {
            const part = inventory[editingPartId];
            inventory[newId] = {
                name: newName,
                quantity: newQuantity,
                purchaseUrl: newUrl,
                projects: part.projects || {} // Preserve project tags
            };
            delete inventory[editingPartId];
            editingPartId = newId;
        } else {
            // Just update the existing entry
            inventory[editingPartId].name = newName;
            inventory[editingPartId].quantity = newQuantity;
            inventory[editingPartId].purchaseUrl = newUrl;
            // Preserve existing projects object
            if (!inventory[editingPartId].projects) {
                inventory[editingPartId].projects = {};
            }
        }
        
        if (currentPartId === editingPartId) {
            selectPart(editingPartId);
        }
        
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
        document.getElementById('deletePartModal').style.display = 'block';
    }

    function hideDeletePartModal() {
        document.getElementById('deletePartModal').style.display = 'none';
        deletingPartId = null;
    }

    function confirmDeletePart() {
        if (!deletingPartId) return;
        
        const partName = inventory[deletingPartId].name;
        
        if (currentPartId === deletingPartId) {
            currentPartId = null;
            hidePartInfoPanel();
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
        
        if (!name) {
            showNotification('Please enter a part name', 'error');
            return;
        }
        
        if (!id) {
            id = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        }
        
        if (inventory[id]) {
            showNotification('Part ID already exists', 'error');
            return;
        }
        
        inventory[id] = { 
            name, 
            quantity, 
            purchaseUrl,
            projects: {} // Initialize empty projects object
        };
        
        saveInventory();
        displayInventory();
        hideAddPartModal();
        showNotification(`Added ${name} to inventory`);
    }

    function openPurchaseLink(partId) {
        const part = inventory[partId];
        if (part.purchaseUrl) {
            window.open(part.purchaseUrl, '_blank');
        } else {
            showNotification('No purchase URL set for this part', 'error');
        }
    }

    function showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type === 'error' ? 'error' : ''}`;
        notification.classList.add('show');
        
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
            }
        }
    }

    function quickRemoveOne(partId) {
        const part = inventory[partId];
        if (part.quantity > 0) {
            part.quantity -= 1;
            document.getElementById('currentStock').textContent = part.quantity;
            saveInventory();
            displayInventory();
            showNotification(`Used 1 ${part.name} (${part.quantity} remaining)`);
        } else {
            showNotification(`No ${part.name} in stock!`, 'error');
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        const quantityInput = document.getElementById('quantityInput');
        quantityInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent default form submission
                adjustStock('add');
            }
        });
    });

    function initializeProjects() {
        const savedProjects = localStorage.getItem('guitarPedalProjects');
        if (savedProjects) {
            projects = JSON.parse(savedProjects);
            updateProjectFilter();
        }
    }

    function updateProjectFilter() {
        const filter = document.getElementById('projectFilter');
        if (!filter) return;
        
        // Store current selection
        const currentValue = filter.value;
        
        // Clear and rebuild options
        filter.innerHTML = '<option value="all">All Projects</option>';
        
        for (const projectId in projects) {
            const option = document.createElement('option');
            option.value = projectId;
            option.textContent = projects[projectId].name;
            filter.appendChild(option);
        }
        
        // Restore selection if it still exists
        if (currentValue !== 'all' && projects[currentValue]) {
            filter.value = currentValue;
        } else {
            filter.value = 'all';
        }
    }

    function filterByProject() {
        currentProjectFilter = document.getElementById('projectFilter').value;
        displayInventory();
    }

    function showProjectDetails(projectId) {
        const project = projects[projectId];
        const bom = project.bom;
        let totalParts = 0;
        let missingParts = 0;
        let lowStockParts = 0;
        
        document.getElementById('projectDetailsTitle').textContent = project.name;
        
        const partsContainer = document.getElementById('projectParts');
        partsContainer.innerHTML = '';
        
        for (const id in bom) {
            totalParts++;
            const required = bom[id].quantity;
            const part = inventory[id];
            let statusIcon;
            
            if (!part || part.quantity === 0) {
                missingParts++;
                statusIcon = `
                    <span class="status-icon status-error">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                    </span>
                `;
            } else if (part.quantity < required) {
                lowStockParts++;
                statusIcon = `
                    <span class="status-icon status-warning">
                        <svg viewBox="0 0 24 24">
                            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                        </svg>
                    </span>
                `;
            } else {
                statusIcon = `
                    <span class="status-icon status-success">
                        <svg viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                    </span>
                `;
            }
            
            const partElement = document.createElement('div');
            partElement.className = 'project-list-item';
            
            partElement.innerHTML = `
                <div>
                    <strong>${bom[id].name}</strong>
                    <div class="project-info">
                        Need: ${required} | Have: ${part ? part.quantity : 0}
                    </div>
                </div>
                <div class="project-actions">
                    ${statusIcon}
                    <button onclick="removeProjectTag('${id}', '${projectId}')" class="project-remove-btn">Remove</button>
                </div>
            `;
            
            partsContainer.appendChild(partElement);
        }
        
        const statusContainer = document.getElementById('projectStatus');
        statusContainer.innerHTML = `
            <div class="project-header">
                <div>Total Parts: ${totalParts}</div>
                <div>Missing: ${missingParts}</div>
                <div>Low Stock: ${lowStockParts}</div>
            </div>
            <div class="project-status-bar">
                <div class="project-status-progress" style="width: ${((totalParts - missingParts - lowStockParts) / totalParts * 100)}%"></div>
                <div class="project-status-warning" style="width: ${(lowStockParts / totalParts * 100)}%"></div>
            </div>
        `;
        
        document.getElementById('projectDetailsModal').style.display = 'block';
    }

    function hideProjectDetailsModal() {
        document.getElementById('projectDetailsModal').style.display = 'none';
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
        const modal = document.getElementById('projectNameModal');
        modal.classList.add('show');
        document.getElementById('projectNameInput').value = '';
        document.getElementById('projectNameInput').focus();
    }

    function hideProjectNameModal() {
        const modal = document.getElementById('projectNameModal');
        modal.classList.remove('show');
        pendingBomData = null;
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
        }
        
        hideProjectNameModal();
    }

    function createProjectFromBom(projectName, projectId, bom) {
        projects[projectId] = {
            name: projectName,
            bom: bom
        };
        
        // Tag parts in the main inventory with this project
        for (const id in bom) {
            // Find the part in inventory by name if ID doesn't match
            let partId = id;
            if (!inventory[id]) {
                // Try to find by name
                for (const existingId in inventory) {
                    if (inventory[existingId].name.toLowerCase() === bom[id].name.toLowerCase()) {
                        partId = existingId;
                        break;
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

        const missing = [];
        let totalParts = 0;
        let missingParts = 0;
        let lowStockParts = 0;

        // Check each part in the BOM against the main inventory
        for (const id in bom) {
            totalParts++;
            const required = bom[id].quantity;
            // Find the part in inventory by name if ID doesn't match
            let part = inventory[id];
            if (!part) {
                // Try to find by name
                for (const existingId in inventory) {
                    if (inventory[existingId].name.toLowerCase() === bom[id].name.toLowerCase()) {
                        part = inventory[existingId];
                        break;
                    }
                }
            }
            
            if (!part || part.quantity === 0) {
                missingParts++;
                missing.push(`
                    <li>
                        <span class="status-icon status-error">
                            <svg viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                        </span>
                        <strong>${bom[id].name}</strong>: Missing entirely (need ${required})
                    </li>
                `);
            } else if (part.quantity < required) {
                lowStockParts++;
                const have = part.quantity;
                missing.push(`
                    <li>
                        <span class="status-icon status-warning">
                            <svg viewBox="0 0 24 24">
                                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                            </svg>
                        </span>
                        <strong>${bom[id].name}</strong>: Have ${have}, need ${required}
                    </li>
                `);
            }
        }

        const resultsContainer = document.getElementById("bomResults");
        if (missing.length === 0) {
            resultsContainer.innerHTML = `
                <div class="project-info">
                    <li>
                        <span class="status-icon status-success">
                            <svg viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                        </span>
                        <strong>All parts in the BOM are sufficiently in stock.</strong>
                    </li>
                </div>
            `;
        } else {
            resultsContainer.innerHTML = `
                <div class="project-header">
                    <div>Total Parts: ${totalParts}</div>
                    <div>Missing: ${missingParts}</div>
                    <div>Low Stock: ${lowStockParts}</div>
                </div>
                <ul class="project-info">${missing.join("")}</ul>
            `;
        }

        document.getElementById("bomModal").style.display = "block";
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
                    // Parse CSV
                    const lines = fileContent.split('\n');
                    const headers = lines[0].split(',').map(h => h.trim());
                    
                    // Find required column indices
                    const nameIndex = headers.findIndex(h => h.toLowerCase().includes('name') || h.toLowerCase().includes('part'));
                    const quantityIndex = headers.findIndex(h => h.toLowerCase().includes('quantity') || h.toLowerCase().includes('qty'));
                    const idIndex = headers.findIndex(h => h.toLowerCase().includes('id') || h.toLowerCase().includes('part number'));
                    
                    if (nameIndex === -1 || quantityIndex === -1) {
                        throw new Error('CSV must contain name and quantity columns');
                    }

                    // Process each line
                    for (let i = 1; i < lines.length; i++) {
                        if (!lines[i].trim()) continue; // Skip empty lines
                        
                        const values = lines[i].split(',').map(v => v.trim());
                        const name = values[nameIndex];
                        const quantity = parseInt(values[quantityIndex]) || 0;
                        
                        // Generate ID from name if not provided
                        const id = idIndex !== -1 ? values[idIndex] : name.toLowerCase().replace(/[^a-z0-9]/g, '_');
                        
                        bom[id] = {
                            name: name,
                            quantity: quantity
                        };
                    }
                } else {
                    // Parse JSON
                    const parsedBom = JSON.parse(fileContent);
                    // Only include parts that have a quantity specified
                    for (const id in parsedBom) {
                        if (parsedBom[id].quantity !== undefined) {
                            bom[id] = parsedBom[id];
                        }
                    }
                }

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

    function hideBOMModal() {
        document.getElementById("bomModal").style.display = "none";
        window.currentBom = null; // Clear the stored BOM data
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
        
        document.getElementById('projectManagementModal').style.display = 'block';
    }

    function hideProjectManagementModal() {
        const modal = document.getElementById('projectManagementModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    let deletingProjectId = null;

    function showDeleteProjectModal(projectId) {
        deletingProjectId = projectId;
        const project = projects[projectId];
        const modal = document.getElementById('deleteProjectModal');
        const message = document.getElementById('deleteProjectMessage');
        
        if (modal && message) {
            message.textContent = `Are you sure you want to delete "${project.name}"? This action cannot be undone.`;
            modal.style.display = 'block';
        }
    }

    function hideDeleteProjectModal() {
        const modal = document.getElementById('deleteProjectModal');
        if (modal) {
            modal.style.display = 'none';
        }
        deletingProjectId = null;
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
        const deleteModal = document.getElementById('deleteProjectModal');
        const manageModal = document.getElementById('projectManagementModal');
        
        if (deleteModal) {
            deleteModal.style.display = 'none';
        }
        
        if (manageModal) {
            manageModal.style.display = 'none';
        }
        
        // Reset state
        deletingProjectId = null;
        
        // Show notification
        showNotification(`Deleted project: ${projectName}`);
    }

    function showAllProjectRequirements() {
        const partTotals = {};
        for (const projectId in projects) {
            const bom = projects[projectId].bom;
            for (const partId in bom) {
                if (!partTotals[partId]) {
                    partTotals[partId] = {
                        name: bom[partId].name,
                        total: 0,
                        projects: []
                    };
                }
                partTotals[partId].total += bom[partId].quantity;
                partTotals[partId].projects.push({
                    project: projects[projectId].name,
                    quantity: bom[partId].quantity
                });
            }
        }

        // Build HTML table
        let html = '<table id="allProjectRequirementsTable">';
        html += '<tr><th>Part Name</th><th>Total Needed</th><th>Projects</th></tr>';
        for (const partId in partTotals) {
            const part = partTotals[partId];
            // Check inventory for low stock
            let lowStock = false;
            if (inventory[partId] && inventory[partId].quantity < part.total) lowStock = true;
            html += `<tr${lowStock ? ' class="low-stock"' : ''}>`;
            html += `<td>${part.name}</td>`;
            html += `<td${lowStock ? ' class="low-stock"' : ''}>${part.total}</td>`;
            html += `<td>${part.projects.map(p => `${p.project} (${p.quantity})`).join(', ')}</td>`;
            html += '</tr>';
        }
        html += '</table>';
        
        // Update the modal title to include the explanation
        document.getElementById('allProjectRequirementsModal').querySelector('h2').innerHTML = 
            'All Project Requirements<br><span style="font-size:13px;color:#BF616A;font-weight:normal;">* Red means you do not have enough in stock for all projects.</span>';
        
        document.getElementById('allProjectRequirements').innerHTML = html;
        document.getElementById('allProjectRequirementsModal').style.display = 'block';
    }

    function hideAllProjectRequirementsModal() {
        document.getElementById('allProjectRequirementsModal').style.display = 'none';
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
        
        document.getElementById('exportBOMModal').style.display = 'block';
    }

    function hideExportBOMModal() {
        document.getElementById('exportBOMModal').style.display = 'none';
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
            // Create CSV rows
            const rows = Object.entries(bom).map(([id, part]) => {
                const inventoryPart = inventory[id];
                return [
                    part.name,
                    part.quantity,
                    inventoryPart ? inventoryPart.purchaseUrl || '' : ''
                ];
            });
            // Combine header and rows
            dataStr = [headers, ...rows].map(row => row.join(',')).join('\n');
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
        showNotification(`Exported BOM for ${project.name}`);
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
            <button class="sync-btn import-btn full-width" onclick="document.getElementById('importBOM').click()">
                <svg class="sync-icon" viewBox="0 0 24 24">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
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
                Import Data
            </button>
            <button class="sync-btn export-btn full-width" onclick="showExportModal()">
                <svg class="sync-icon" viewBox="0 0 24 24">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
                Export Data
            </button>
        `;
    }

    function showQuantityInput(partId, currentQuantity) {
        // Find the specific quantity span for this part
        const quantitySpan = document.querySelector(`.item-quantity[data-part-id="${partId}"] .quantity-number`);
        if (!quantitySpan) return;

        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.value = currentQuantity;
        input.className = 'quantity-input-inline';
        
        // Replace span with input
        quantitySpan.replaceWith(input);
        input.focus();
        input.select();

        // Handle input events
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                updateQuantity(partId, parseInt(input.value) || 0);
            }
        });

        input.addEventListener('blur', function() {
            updateQuantity(partId, parseInt(input.value) || 0);
        });

        // Prevent click propagation to avoid immediate blur
        input.addEventListener('click', function(e) {
            e.stopPropagation();
        });
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

    initializeInventory();
