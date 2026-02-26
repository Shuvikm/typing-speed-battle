import React, { useState, useEffect } from 'react';

const THEME_KEY = 'tsb_theme';

const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(() => {
        try {
            return (localStorage.getItem(THEME_KEY) ?? 'dark') !== 'light';
        } catch {
            return true;
        }
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.remove('light-theme');
            try { localStorage.setItem(THEME_KEY, 'dark'); } catch { }
        } else {
            root.classList.add('light-theme');
            try { localStorage.setItem(THEME_KEY, 'light'); } catch { }
        }
    }, [isDark]);

    const toggle = () => setIsDark(d => !d);

    return (
        <button
            onClick={toggle}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
                position: 'fixed',
                top: 16,
                left: 16,
                zIndex: 9990,
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: isDark ? '2px solid #B026FF60' : '2px solid #FFD70080',
                background: isDark
                    ? 'linear-gradient(135deg, #1a1a2e, #0a0a14)'
                    : 'linear-gradient(135deg, #fffde7, #fff3e0)',
                boxShadow: isDark
                    ? '0 0 16px #B026FF40'
                    : '0 0 16px #FFD70060',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(4px)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
            {isDark ? '☀️' : '🌙'}
        </button>
    );
};

export default ThemeToggle;
