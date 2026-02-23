import { useState, useCallback } from 'react';

/**
 * A generic hook that syncs state to localStorage.
 * @param {string} key - The localStorage key
 * @param {*} defaultValue - The initial value if nothing is stored
 * @returns {[value, setValue]} - Like useState, but persisted
 */
const useLocalStorage = (key, defaultValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = localStorage.getItem(key);
            return item !== null ? JSON.parse(item) : defaultValue;
        } catch {
            return defaultValue;
        }
    });

    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (err) {
            console.warn(`useLocalStorage: failed to save key "${key}"`, err);
        }
    }, [key, storedValue]);

    return [storedValue, setValue];
};

export default useLocalStorage;
