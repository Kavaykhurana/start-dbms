import { investmentApi } from './api.js';

const state = {
    items: [],
    sectors: [],
    selectedStartupId: null,
    filters: {
        search: '',
        sector: '',
        signal: '',
        sort: 'score'
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    setCurrentDate();

    try {
        const [payload, startupListing] = await Promise.all([
            investmentApi.getRecommendations(),
            investmentApi.getStartups()
        ]);

        const startupMap = new Map((startupListing.items || []).map((startup) => [startup.id, startup]));

        state.items = (payload.items || []).map((item) => ({
            ...item,
            ...(startupMap.get(item.startupId) || {})
        }));
        state.sectors = startupListing.sectors || [...new Set(state.items.map((item) => item.sector))].sort();

        populateSectorFilter();
        bindControls();
        renderSummary();
        renderRecommendations();

        if (state.items[0]) {
            state.selectedStartupId = state.items[0].startupId;
            renderExplanation(state.items[0]);
            renderRecommendations();
        }
    } catch (error) {
        renderPageError('.main-content', error.message);
    }
});

function bindControls() {
    const searchInput = document.getElementById('recommendation-search');
    const sectorSelect = document.getElementById('recommendation-sector');
    const signalSelect = document.getElementById('recommendation-signal');
    const sortSelect = document.getElementById('recommendation-sort');
    const resetButton = document.getElementById('recommendation-reset');
    const list = document.getElementById('recommendation-list');

    searchInput.addEventListener('input', () => {
        state.filters.search = searchInput.value.trim().toLowerCase();
        renderRecommendations();
    });

    sectorSelect.addEventListener('change', () => {
        state.filters.sector = sectorSelect.value;
        renderRecommendations();
    });

    signalSelect.addEventListener('change', () => {
        state.filters.signal = signalSelect.value;
        renderRecommendations();
    });

    sortSelect.addEventListener('change', () => {
        state.filters.sort = sortSelect.value;
        renderRecommendations();
    });

    resetButton.addEventListener('click', () => {
        state.filters = { search: '', sector: '', signal: '', sort: 'score' };
        searchInput.value = '';
        sectorSelect.value = '';
        signalSelect.value = '';
        sortSelect.value = 'score';
        renderRecommendations();
    });

    list.addEventListener('click', (event) => {
        const button = event.target.closest('[data-explain-id]');

        if (!button) {
            return;
        }

        const startup = state.items.find((item) => String(item.startupId) === button.dataset.explainId);

        if (startup) {
            state.selectedStartupId = startup.startupId;
            renderExplanation(startup);
            renderRecommendations();
            document.getElementById(`score-explanation-${startup.startupId}`)?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    });
}

function populateSectorFilter() {
    const sectorSelect = document.getElementById('recommendation-sector');

    state.sectors.forEach((sector) => {
        const option = document.createElement('option');
        option.value = sector;
        option.textContent = sector;
        sectorSelect.appendChild(option);
    });
}

function renderSummary() {
    const container = document.getElementById('recommendation-summary');
    const investCount = state.items.filter((item) => item.signal === 'INVEST').length;
    const watchCount = state.items.filter((item) => item.signal === 'WATCH').length;
    const avgScore = average(state.items.map((item) => item.decisionScore));
    const bestStartup = [...state.items].sort((a, b) => b.decisionScore - a.decisionScore)[0];

    container.innerHTML = `
        ${renderSummaryTile('Top pick', bestStartup?.name || '-', bestStartup ? `${bestStartup.sector} • ${bestStartup.signal}` : 'Waiting for data')}
        ${renderSummaryTile('Avg score', `${avgScore.toFixed(2)}/10`, 'Across ranked startup queue')}
        ${renderSummaryTile('Invest calls', `${investCount}`, 'Ready for due diligence')}
        ${renderSummaryTile('Watch calls', `${watchCount}`, 'Monitor before funding')}
    `;
}

function renderRecommendations() {
    const list = document.getElementById('recommendation-list');
    const count = document.getElementById('recommendation-count');
    const items = getFilteredItems();

    count.textContent = `${items.length} startups shown from ${state.items.length} recommendations`;

    if (!items.length) {
        list.innerHTML = `
            <div class="glass-card empty-state">
                <h3>No matching recommendations</h3>
                <p>Try removing the sector, signal, or search filter.</p>
            </div>
        `;
        return;
    }

    list.innerHTML = items.map((startup, index) => renderRecommendationCard(startup, index + 1)).join('');
}

function getFilteredItems() {
    const { search, sector, signal, sort } = state.filters;

    return state.items
        .filter((startup) => {
            const searchText = `${startup.name} ${startup.sector} ${startup.city || ''} ${startup.fundingStage}`.toLowerCase();
            const matchesSearch = !search || searchText.includes(search);
            const matchesSector = !sector || startup.sector === sector;
            const matchesSignal = !signal || startup.signal === signal;
            return matchesSearch && matchesSector && matchesSignal;
        })
        .sort((a, b) => {
            if (sort === 'ltv') {
                return b.ltvCacRatio - a.ltvCacRatio;
            }

            if (sort === 'risk') {
                return a.riskScore - b.riskScore;
            }

            if (sort === 'runway') {
                return Number(b.runway || 0) - Number(a.runway || 0);
            }

            return b.decisionScore - a.decisionScore;
        });
}

function renderRecommendationCard(startup, displayRank) {
    const signalClass = `signal-${startup.signal.toLowerCase()}`;
    const scoreWidth = Math.min(100, Math.max(0, startup.decisionScore * 10));
    const runway = Number(startup.runway || 0);
    const isSelected = String(state.selectedStartupId) === String(startup.startupId);

    return `
        <article class="glass-card recommendation-card ${signalClass}">
            <div class="recommendation-rank">
                <span>#${displayRank}</span>
                <small>${startup.signal}</small>
            </div>
            <div class="recommendation-main">
                <div class="recommendation-title-row">
                    <div>
                        <h2>${startup.name}</h2>
                        <p>${startup.sector} • ${startup.city || 'India'} • ${startup.fundingStage}</p>
                    </div>
                    <strong>${startup.decisionScore.toFixed(2)}/10</strong>
                </div>
                <div class="score-meter" aria-label="Decision score ${startup.decisionScore.toFixed(2)} out of 10">
                    <span style="width: ${scoreWidth}%"></span>
                </div>
                <p class="recommendation-reason">${startup.reason}</p>
                <div class="recommendation-metrics">
                    ${renderMetric('LTV/CAC', `${startup.ltvCacRatio.toFixed(2)}x`, 'Unit economics')}
                    ${renderMetric('Risk', startup.riskScore.toFixed(0), getRiskCopy(startup.riskScore))}
                    ${renderMetric('Runway', runway ? `${runway.toFixed(1)} mo` : '-', 'Cash buffer')}
                    ${renderMetric('Funding', startup.totalFunding ? formatCompactCurrency(startup.totalFunding) : '-', 'Capital raised')}
                </div>
                ${isSelected ? renderInlineExplanation(startup) : ''}
            </div>
            <div class="recommendation-actions">
                <button class="btn btn-primary" type="button" data-explain-id="${startup.startupId}">${isSelected ? 'Hide/Refresh Score' : 'Explain Score'}</button>
                <a href="/details?id=${startup.startupId}" class="btn btn-secondary">Open Details</a>
            </div>
        </article>
    `;
}

function renderInlineExplanation(startup) {
    const runway = Number(startup.runway || 0);
    const unitScore = Math.min(50, startup.ltvCacRatio * 8.33);
    const riskScore = Math.max(0, (100 - startup.riskScore) * 0.30);
    const runwayScore = Math.min(20, runway * 1.1);

    return `
        <div id="score-explanation-${startup.startupId}" class="inline-score-explanation">
            <strong>Score formula breakdown</strong>
            <div><span>LTV/CAC contribution</span><em>${unitScore.toFixed(1)} / 50</em></div>
            <div><span>Risk control contribution</span><em>${riskScore.toFixed(1)} / 30</em></div>
            <div><span>Runway and validation contribution</span><em>${runwayScore.toFixed(1)} / 20</em></div>
            <p>Final score becomes ${startup.decisionScore.toFixed(2)}/10, so the decision engine marks ${startup.name} as ${startup.signal}.</p>
        </div>
    `;
}

function renderExplanation(startup) {
    const container = document.getElementById('recommendation-explainer');
    const runway = Number(startup.runway || 0);

    container.innerHTML = `
        <div class="selected-startup">
            <span class="system-label">Selected startup</span>
            <h2>${startup.name}</h2>
            <p>${startup.sector} • ${startup.fundingStage} • ${startup.city || 'India'}</p>
        </div>
        <div class="explanation-step">
            <strong>1. Unit economics</strong>
            <span>LTV/CAC is ${startup.ltvCacRatio.toFixed(2)}x, so acquisition cost is justified by lifetime value.</span>
        </div>
        <div class="explanation-step">
            <strong>2. Risk control</strong>
            <span>Risk score is ${startup.riskScore.toFixed(0)}. Lower risk improves the final investment score.</span>
        </div>
        <div class="explanation-step">
            <strong>3. Runway check</strong>
            <span>${runway ? `${runway.toFixed(1)} months runway` : 'Runway data missing'} shows whether the startup can survive until the next round.</span>
        </div>
        <div class="explanation-step">
            <strong>4. Final call</strong>
            <span>Decision score ${startup.decisionScore.toFixed(2)}/10 produces the signal: ${startup.signal}.</span>
        </div>
    `;
}

function renderSummaryTile(label, value, helper) {
    return `
        <div>
            <span>${label}</span>
            <strong>${value}</strong>
            <small>${helper}</small>
        </div>
    `;
}

function renderMetric(label, value, helper) {
    return `
        <div>
            <span>${label}</span>
            <strong>${value}</strong>
            <small>${helper}</small>
        </div>
    `;
}

function getRiskCopy(riskScore) {
    if (riskScore < 35) {
        return 'Low risk';
    }

    if (riskScore < 65) {
        return 'Medium risk';
    }

    return 'High risk';
}

function average(values) {
    if (!values.length) {
        return 0;
    }

    return values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length;
}
