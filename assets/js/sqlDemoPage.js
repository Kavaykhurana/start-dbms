import { investmentApi } from './api.js';

const state = {
    currentDemo: null
};

document.addEventListener('DOMContentLoaded', async () => {
    const select = document.getElementById('sql-query-select');
    const runButton = document.getElementById('sql-run-button');
    const copyButton = document.getElementById('sql-copy-button');
    const roiButton = document.getElementById('roi-run-button');

    select.addEventListener('change', () => loadDemo(select.value));
    runButton.addEventListener('click', () => loadDemo(select.value));
    copyButton.addEventListener('click', copySql);
    roiButton.addEventListener('click', runRoiProcedure);

    await Promise.all([
        loadHealth(),
        loadDemo(select.value),
        runRoiProcedure()
    ]);
});

async function loadHealth() {
    const container = document.getElementById('sql-health-card');

    try {
        const health = await investmentApi.getHealth();
        const isLive = health.status === 'ok';

        container.innerHTML = `
            <span class="system-label">${isLive ? 'Live MySQL mode' : 'Fallback demo mode'}</span>
            <strong>${isLive ? 'Database connected' : 'Bundled dataset active'}</strong>
            <p>${isLive ? `Reading from ${escapeHtml(health.database)}.` : 'Set DATABASE_URL or DB_* variables in Vercel to switch this page to hosted MySQL.'}</p>
        `;
    } catch (error) {
        container.innerHTML = `
            <span class="system-label">Health check unavailable</span>
            <strong>API fallback still works</strong>
            <p>${escapeHtml(error.message)}</p>
        `;
    }
}

async function loadDemo(queryId) {
    const code = document.getElementById('sql-demo-code');
    const explanation = document.getElementById('sql-demo-explanation');
    const result = document.getElementById('sql-demo-result');
    const helper = document.getElementById('sql-result-helper');

    code.textContent = 'Running query...';
    explanation.innerHTML = '';
    result.innerHTML = '';
    helper.textContent = 'Waiting for query response...';

    try {
        const demo = await investmentApi.getSqlDemo(queryId);
        state.currentDemo = demo;

        document.getElementById('sql-result-title').textContent = demo.title;
        helper.textContent = `${demo.rows.length} result rows returned`;
        explanation.innerHTML = `
            <strong>Why this query matters</strong>
            <span>${escapeHtml(demo.explanation)}</span>
        `;
        code.textContent = demo.sql;
        result.innerHTML = renderResultTable(demo.columns, demo.rows);
    } catch (error) {
        code.textContent = 'Unable to load SQL.';
        helper.textContent = 'No result rows returned.';
        renderPageError('.main-content', error.message);
    }
}

function renderResultTable(columns, rows) {
    if (!rows.length) {
        return `
            <div class="empty-state">
                <h3>No rows returned</h3>
                <p>The query is valid, but the current dataset has no matching rows.</p>
            </div>
        `;
    }

    return `
        <table class="schema-table sql-result-table">
            <thead>
                <tr>${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join('')}</tr>
            </thead>
            <tbody>
                ${rows.map((row) => `
                    <tr>${columns.map((column) => `<td>${escapeHtml(formatCell(row[column]))}</td>`).join('')}</tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

async function copySql() {
    if (!state.currentDemo) {
        return;
    }

    const button = document.getElementById('sql-copy-button');

    try {
        await navigator.clipboard.writeText(state.currentDemo.sql);
        button.textContent = 'Copied';
    } catch (_error) {
        button.textContent = 'Copy failed';
    }

    window.setTimeout(() => {
        button.textContent = 'Copy SQL';
    }, 1200);
}

async function runRoiProcedure() {
    const input = document.getElementById('roi-investment-id');
    const result = document.getElementById('roi-demo-result');
    const investmentId = Number(input.value || 1);

    result.innerHTML = `
        <span>ROI result</span>
        <strong>Running...</strong>
    `;

    try {
        const payload = await investmentApi.getInvestmentROI(investmentId);
        result.innerHTML = `
            <span>Investment #${payload.investmentId}</span>
            <strong>${Number(payload.roiPercentage || 0).toFixed(2)}%</strong>
            <small>Computed by sp_CalculateROI logic using latest net profit, investment amount, and equity percentage.</small>
        `;
    } catch (error) {
        result.innerHTML = `
            <span>Procedure failed</span>
            <strong>${escapeHtml(error.message)}</strong>
        `;
    }
}

function formatCell(value) {
    if (value === null || value === undefined || value === '') {
        return '-';
    }

    if (typeof value === 'number') {
        return Number.isInteger(value) ? String(value) : value.toFixed(2);
    }

    return value;
}

function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[char]));
}
