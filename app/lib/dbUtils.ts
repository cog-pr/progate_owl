export async function setDB(key: string, val: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("owl_db", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("store");
    req.onsuccess = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("store")) return resolve(); // Should not happen
      const tx = db.transaction("store", "readwrite");
      tx.objectStore("store").put(val, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getDB<T>(key: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("owl_db", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("store");
    req.onsuccess = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("store")) return resolve(undefined);
      const tx = db.transaction("store", "readonly");
      const getReq = tx.objectStore("store").get(key);
      getReq.onsuccess = () => resolve(getReq.result);
      getReq.onerror = () => reject(getReq.error);
    };
    req.onerror = () => reject(req.error);
  });
}
