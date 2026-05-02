// Global logic and UI helpers
const THEME_STORAGE_KEY = 'ventureAnalytics.theme';

applyTheme(getStoredTheme());

document.addEventListener('DOMContentLoaded', () => {
    // Set active link in sidebar
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        if (currentPath.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });

    mountThemeToggle();
});

function getStoredTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
    }

    return 'dark';
}

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
}

function mountThemeToggle() {
    const sidebar = document.querySelector('.sidebar');

    if (!sidebar || document.getElementById('theme-toggle')) {
        return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'theme-switcher';

    const button = document.createElement('button');
    button.id = 'theme-toggle';
    button.className = 'theme-toggle';
    button.type = 'button';

    function syncButton() {
        const isLight = document.documentElement.dataset.theme === 'light';
        button.textContent = isLight ? 'Dark Mode' : 'Light Mode';
        button.setAttribute('aria-pressed', String(isLight));
        button.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    }

    button.addEventListener('click', () => {
        const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        applyTheme(nextTheme);
        syncButton();
    });

    syncButton();
    wrapper.appendChild(button);
    sidebar.appendChild(wrapper);
}

// Helper function to format currency
function formatCurrency(value) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(value);
}

function formatCompactCurrency(value) {
    const numericValue = Number(value || 0);

    if (Math.abs(numericValue) >= 10000000) {
        return `₹${(numericValue / 10000000).toFixed(1)} Cr`;
    }

    if (Math.abs(numericValue) >= 100000) {
        return `₹${(numericValue / 100000).toFixed(1)} L`;
    }

    return formatCurrency(numericValue);
}

function formatPercent(value, digits = 1) {
    return `${Number(value || 0).toFixed(digits)}%`;
}

// Helper function to get risk badge class
function getRiskBadge(level) {
    const l = level.toLowerCase();
    if (l === 'low') return 'badge-low';
    if (l === 'medium' || l === 'med') return 'badge-med';
    return 'badge-high';
}

function getRiskAccent(level) {
    const l = level.toLowerCase();
    if (l === 'low') return 'var(--accent-green)';
    if (l === 'medium' || l === 'med') return 'var(--accent-yellow)';
    return 'var(--accent-red)';
}

function setCurrentDate(elementId = 'current-date') {
    const element = document.getElementById(elementId);

    if (!element) {
        return;
    }

    element.textContent = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function renderPageError(targetSelector, message) {
    const target = document.querySelector(targetSelector);

    if (!target) {
        return;
    }

    const errorCard = document.createElement('div');
    errorCard.className = 'glass-card';
    errorCard.innerHTML = `
        <h3 style="margin-bottom: 10px; color: var(--accent-red);">Data Load Error</h3>
        <p style="color: var(--text-secondary);">${message}</p>
    `;

    target.prepend(errorCard);
}
