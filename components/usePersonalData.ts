"use client";

import { useEffect, useRef, useState } from "react";
import { emptyData, loadData, saveChanges, storageKeys, type DataKey, type PersonalData } from "@/domain/data/storage";
import { exportData } from "@/domain/data/actions";

export type StorageNotice = "loading" | "unreadable" | "saveFailed" | "partialFailure" | "saved" | "exportFailed" | null;

export function usePersonalData() {
  const [data, setData] = useState(emptyData);
  const current = useRef(data);
  const invalid = useRef<DataKey[]>([]);
  const pending = useRef(false);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState<StorageNotice>("loading");

  useEffect(() => {
    function refresh() {
      try {
        const loaded = loadData(window.localStorage);
        current.current = loaded.data;
        invalid.current = loaded.invalidKeys;
        setData(loaded.data);
        setNotice(loaded.invalidKeys.length ? "unreadable" : null);
      } catch {
        invalid.current = Object.keys(storageKeys) as DataKey[];
        setNotice("unreadable");
      }
      setReady(true);
    }
    refresh();
    function onStorage(event: StorageEvent) {
      if (event.key === null || Object.values(storageKeys).includes(event.key)) refresh();
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  async function update(transform: (data: PersonalData) => PersonalData, clear = false) {
    if (!ready || pending.current) return false;
    pending.current = true;
    try {
      // Serialize cooperating tabs and read inside the lock, not from a stale React snapshot.
      if (!navigator.locks) { setNotice("saveFailed"); return false; }
      return await navigator.locks.request("soothespot-personal-data", () => commit(transform, clear));
    } catch {
      setNotice("saveFailed");
      return false;
    } finally { pending.current = false; }
  }

  function commit(transform: (data: PersonalData) => PersonalData, clear: boolean) {
    const loaded = loadData(window.localStorage);
    current.current = loaded.data;
    invalid.current = loaded.invalidKeys;
    setData(loaded.data);
    const next = transform(loaded.data);
    const changes: Partial<PersonalData> = {};
    for (const key of Object.keys(storageKeys) as DataKey[]) {
      if (clear || next[key] !== current.current[key]) {
        if (!clear && invalid.current.includes(key)) {
          setNotice("unreadable");
          return false;
        }
        Object.assign(changes, { [key]: next[key] });
      }
    }
    try {
      const result = saveChanges(window.localStorage, changes, clear);
      if (!result.ok) {
        if (result.rollbackFailed) {
          const loaded = loadData(window.localStorage);
          current.current = loaded.data;
          invalid.current = loaded.invalidKeys;
          setData(loaded.data);
        }
        setNotice(result.rollbackFailed ? "partialFailure" : "saveFailed");
        return false;
      }
      current.current = next;
      setData(next);
      if (clear) invalid.current = [];
      setNotice(invalid.current.length ? "unreadable" : "saved");
      return true;
    } catch {
      setNotice("saveFailed");
      return false;
    }
  }

  async function download() {
    try {
      if (!navigator.locks) throw new Error("Storage locking unavailable");
      await navigator.locks.request("soothespot-personal-data", () => {
      const loaded = loadData(window.localStorage);
      const unreadable: Record<string, string | null> = {};
      for (const key of loaded.invalidKeys) unreadable[storageKeys[key]] = window.localStorage.getItem(storageKeys[key]);
      const blob = new Blob([exportData(loaded.data, unreadable)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `soothespot-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      });
    } catch { setNotice("exportFailed"); }
  }

  return { data, ready, notice, update, download };
}
