/**
 * Application state — private vars with getters/setters.
 * Reassignment of inventory/projects/UI state MUST go through setters.
 */

let inventory = {};
let projects = {};
let pendingQtyUndo = null;
let pendingImportFile = null;
let pendingBomData = null;
let currentPartId = null;
let editingPartId = null;
let deletingPartId = null;
let deletingProjectId = null;
let currentSortOrder = 'name-asc';
let currentProjectFilter = 'all';
let currentSearchQuery = '';
let backupExportPending = false;
let inventoryDirty = false;
let projectsDirty = false;

export const LOW_STOCK_THRESHOLD = 10;

export function getInventory() { return inventory; }
export function setInventory(data) { inventory = data; }

export function getProjects() { return projects; }
export function setProjects(data) { projects = data; }

export function getPendingQtyUndo() { return pendingQtyUndo; }
export function setPendingQtyUndo(fn) { pendingQtyUndo = fn; }

export function getPendingImportFile() { return pendingImportFile; }
export function setPendingImportFile(file) { pendingImportFile = file; }

export function getPendingBomData() { return pendingBomData; }
export function setPendingBomData(data) { pendingBomData = data; }

export function getCurrentPartId() { return currentPartId; }
export function setCurrentPartId(id) { currentPartId = id; }

export function getEditingPartId() { return editingPartId; }
export function setEditingPartId(id) { editingPartId = id; }

export function getDeletingPartId() { return deletingPartId; }
export function setDeletingPartId(id) { deletingPartId = id; }

export function getDeletingProjectId() { return deletingProjectId; }
export function setDeletingProjectId(id) { deletingProjectId = id; }

export function getCurrentSortOrder() { return currentSortOrder; }
export function setCurrentSortOrder(order) { currentSortOrder = order; }

export function getCurrentProjectFilter() { return currentProjectFilter; }
export function setCurrentProjectFilter(filter) { currentProjectFilter = filter; }

export function getCurrentSearchQuery() { return currentSearchQuery; }
export function setCurrentSearchQuery(query) { currentSearchQuery = query; }

export function getBackupExportPending() { return backupExportPending; }
export function setBackupExportPending(value) { backupExportPending = value; }

export function getInventoryDirty() { return inventoryDirty; }
export function setInventoryDirty(value) { inventoryDirty = value; }

export function getProjectsDirty() { return projectsDirty; }
export function setProjectsDirty(value) { projectsDirty = value; }
