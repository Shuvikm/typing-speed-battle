import { useState, useEffect } from 'react';

/**
 * useDebounce — delays updating a value until after a wait period.
 * Useful for search inputs, live-filter fields, and WPM calculations
 * to avoid triggering expensive operations on every keystroke.
 *
 * @param {*}      value - The value to debounce
 * @param {number} delay - Debounce delay in milliseconds (default: 300)
 * @returns {*}    The debounced value
 */
const useDebounce = (value, delay = 300) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
};

export default useDebounce;
