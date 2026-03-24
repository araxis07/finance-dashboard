import { createJSONStorage, type StateStorage } from "zustand/middleware";

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined
};

export function createBrowserJSONStorage() {
  return createJSONStorage(() =>
    typeof window === "undefined" ? noopStorage : window.localStorage
  );
}
