// Global logic and UI helpers
const THEME_STORAGE_KEY = 'ventureAnalytics.theme';
const SIDEBAR_VIEW_STORAGE_KEY = 'ventureAnalytics.sidebarFullView';

applyTheme(getStoredTheme());
applySidebarView(getStoredSidebarView());

document.addEventListener('DOMContentLoaded', () => {
    const currentPath = normalizePath(window.location.pathname);
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const hrefPath = normalizePath(new URL(link.href, window.location.origin).pathname);

        if (isActiveRoute(currentPath, hrefPath)) {
            link.classList.add('active');
        }
    });

    mountAcademicDataNote();
    mountTeacherDemo();
    mountSidebarViewToggle();
    mountThemeToggle();
});

function normalizePath(pathname) {
    if (pathname === '/') {
        return '/pages/index.html';
    }

    return pathname.replace(/\/$/, '');
}

function isActiveRoute(currentPath, hrefPath) {
    const cleanRoutes = {
        '/pages/index.html': ['/dashboard', '/index.html'],
        '/pages/startups.html': ['/startups', '/startups.html'],
        '/pages/details.html': ['/details', '/details.html'],
        '/pages/recommendations.html': ['/recommendations', '/recommendations.html'],
        '/pages/investors.html': ['/investors', '/investors.html'],
        '/pages/compare.html': ['/compare', '/compare.html'],
        '/pages/sql-demo.html': ['/sql-demo', '/sql-demo.html'],
        '/pages/analytics.html': ['/analytics', '/analytics.html'],
        '/pages/dbms.html': ['/dbms', '/dbms.html']
    };

    return currentPath === hrefPath || (cleanRoutes[hrefPath] || []).includes(currentPath);
}

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

function getStoredSidebarView() {
    return localStorage.getItem(SIDEBAR_VIEW_STORAGE_KEY) === 'true';
}

function applySidebarView(isEnabled) {
    document.documentElement.dataset.sidebarFullView = isEnabled ? 'true' : 'false';
}

function getSidebarControls() {
    const sidebar = document.querySelector('.sidebar');

    if (!sidebar) {
        return null;
    }

    let controls = sidebar.querySelector('.sidebar-controls');

    if (!controls) {
        controls = document.createElement('div');
        controls.className = 'sidebar-controls';
        sidebar.appendChild(controls);
    }

    return controls;
}

function mountThemeToggle() {
    const controls = getSidebarControls();

    if (!controls || document.getElementById('theme-toggle')) {
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
    controls.appendChild(wrapper);
}

function mountSidebarViewToggle() {
    const sidebar = document.querySelector('.sidebar');
    const logo = sidebar?.querySelector('.logo');

    if (!sidebar || !logo || document.getElementById('sidebar-full-view-toggle')) {
        return;
    }

    const topBar = document.createElement('div');
    topBar.className = 'sidebar-topbar';

    const button = document.createElement('button');
    button.id = 'sidebar-full-view-toggle';
    button.className = 'sidebar-full-view-toggle';
    button.type = 'button';
    button.setAttribute('aria-label', 'Toggle full screen view');
    button.title = 'Toggle full screen view';
    button.innerHTML = `
        <span class="sidebar-full-view-lines" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
        </span>
    `;

    function syncButton() {
        const isEnabled = document.documentElement.dataset.sidebarFullView === 'true';
        button.classList.toggle('is-active', isEnabled);
        button.setAttribute('aria-pressed', String(isEnabled));
    }

    button.addEventListener('click', () => {
        const isEnabled = document.documentElement.dataset.sidebarFullView !== 'true';
        localStorage.setItem(SIDEBAR_VIEW_STORAGE_KEY, String(isEnabled));
        applySidebarView(isEnabled);
        syncButton();
    });

    logo.insertAdjacentElement('beforebegin', topBar);
    topBar.appendChild(logo);
    topBar.appendChild(button);
    syncButton();
}

function mountAcademicDataNote() {
    const mainContent = document.querySelector('.main-content');

    if (!mainContent || document.querySelector('.academic-note')) {
        return;
    }

    const note = document.createElement('div');
    note.className = 'academic-note compact';
    note.innerHTML = 'Academic demo data: the 50 Indian startup, investor, market, and risk records are simulated for DBMS evaluation; the API can switch to hosted MySQL when Vercel env variables are added.';

    const header = mainContent.querySelector('.header');

    if (header) {
        header.insertAdjacentElement('afterend', note);
    } else {
        mainContent.prepend(note);
    }
}

function mountTeacherDemo() {
    const sidebar = document.querySelector('.sidebar');

    if (!sidebar || document.getElementById('teacher-demo-button')) {
        return;
    }

    const button = document.createElement('button');
    button.id = 'teacher-demo-button';
    button.className = 'teacher-demo-button';
    button.type = 'button';
    button.textContent = 'Teacher Demo Mode';

    const overlay = document.createElement('div');
    overlay.id = 'teacher-demo-modal';
    overlay.className = 'modal-backdrop is-hidden';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
        <div class="modal glass-card teacher-demo-modal" role="dialog" aria-modal="true" aria-labelledby="teacher-demo-title">
            <div class="section-heading">
                <div>
                    <span class="system-label">5-minute viva flow</span>
                    <h2 id="teacher-demo-title">Teacher Demo Mode</h2>
                    <p>Open these sections in order and explain the DBMS concept behind each screen.</p>
                </div>
                <button class="icon-button" id="teacher-demo-close" type="button" aria-label="Close teacher demo">×</button>
            </div>
            <div class="teacher-demo-grid">
                ${renderDemoStep('1', 'Dashboard', '/dashboard', 'Show KPIs, charts, sector growth, and how API aggregates SQL rows.')}
                ${renderDemoStep('2', 'Startups', '/startups', 'Show master table records, filters, Add Startup UI, risk and runway columns.')}
                ${renderDemoStep('3', 'Recommendations', '/recommendations', 'Click Explain Score and connect LTV/CAC, runway, and risk to the procedure.')}
                ${renderDemoStep('4', 'Investors', '/investors', 'Explain investor funding source table and investment transaction joins.')}
                ${renderDemoStep('5', 'Compare', '/compare', 'Compare three startups side-by-side using the same normalized metrics.')}
                ${renderDemoStep('6', 'SQL Demo', '/sql-demo', 'Run preset SQL views, joins, and correlated subqueries with result tables.')}
                ${renderDemoStep('7', 'DBMS Docs', '/dbms', 'Show ER diagram, normalization, tables, triggers, procedures, and PL/SQL.')}
            </div>
        </div>
    `;

    button.addEventListener('click', () => {
        overlay.classList.remove('is-hidden');
        overlay.setAttribute('aria-hidden', 'false');
    });

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay || event.target.closest('#teacher-demo-close')) {
            overlay.classList.add('is-hidden');
            overlay.setAttribute('aria-hidden', 'true');
        }
    });

    sidebar.appendChild(button);
    document.body.appendChild(overlay);
}

function renderDemoStep(step, title, href, description) {
    return `
        <a class="teacher-demo-step" href="${href}">
            <strong>${step}</strong>
            <span>${title}</span>
            <small>${description}</small>
        </a>
    `;
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
