const STORAGE_KEY = "managers";

function createId(){
  return Date.now().toString();
}

function normalizeSchoolIds(schoolIds){
  if(!Array.isArray(schoolIds)) return [];

  return Array.from(
    new Set(
      schoolIds
        .filter(id => id !== null && id !== undefined)
        .map(id => String(id))
    )
  );
}

function normalizeManager(manager){
  if(!manager || typeof manager !== "object") return null;
  if(manager.id === null || manager.id === undefined) return null;

  return {
    id: String(manager.id),
    name: typeof manager.name === "string" ? manager.name : "",
    schoolIds: normalizeSchoolIds(manager.schoolIds)
  };
}

function normalizeManagers(items){
  if(!Array.isArray(items)) return [];

  return items
    .map(normalizeManager)
    .filter(Boolean);
}

export function loadManagers(){
  try {
    return normalizeManagers(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
  } catch {
    return [];
  }
}

export function saveManagers(managers){
  const normalized = normalizeManagers(managers);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function getManagerById(id){
  const managerId = String(id);
  return loadManagers().find(manager => manager.id === managerId) || null;
}

export function getManagersBySchoolId(schoolId){
  const normalizedSchoolId = String(schoolId);
  return loadManagers().filter(manager => manager.schoolIds.includes(normalizedSchoolId));
}

export function createManager(managerData = {}){
  const managers = loadManagers();

  const manager = {
    id: managerData.id === null || managerData.id === undefined ? createId() : String(managerData.id),
    name: typeof managerData.name === "string" ? managerData.name : "",
    schoolIds: normalizeSchoolIds(managerData.schoolIds)
  };

  managers.push(manager);
  saveManagers(managers);

  return manager;
}

export function updateManager(id, updates = {}){
  const managerId = String(id);
  const managers = loadManagers();
  const managerIndex = managers.findIndex(manager => manager.id === managerId);

  if(managerIndex === -1) return null;

  const current = managers[managerIndex];
  const nextSchoolIds = updates.schoolIds === undefined
    ? current.schoolIds
    : normalizeSchoolIds(updates.schoolIds);

  const updatedManager = {
    id: current.id,
    name: updates.name === undefined ? current.name : (typeof updates.name === "string" ? updates.name : ""),
    schoolIds: nextSchoolIds
  };

  managers[managerIndex] = updatedManager;
  saveManagers(managers);

  return updatedManager;
}

export function deleteManager(id){
  const managerId = String(id);
  const managers = loadManagers();
  const filtered = managers.filter(manager => manager.id !== managerId);
  const wasDeleted = filtered.length !== managers.length;

  if(wasDeleted){
    saveManagers(filtered);
  }

  return wasDeleted;
}

export function assignSchoolToManager(managerId, schoolId){
  if(schoolId === null || schoolId === undefined) return null;

  const manager = getManagerById(managerId);
  if(!manager) return null;

  const normalizedSchoolId = String(schoolId);
  if(manager.schoolIds.includes(normalizedSchoolId)) return manager;

  return updateManager(manager.id, {
    schoolIds: [...manager.schoolIds, normalizedSchoolId]
  });
}

export function removeSchoolFromManager(managerId, schoolId){
  const manager = getManagerById(managerId);
  if(!manager) return null;

  const normalizedSchoolId = String(schoolId);

  return updateManager(manager.id, {
    schoolIds: manager.schoolIds.filter(id => id !== normalizedSchoolId)
  });
}
