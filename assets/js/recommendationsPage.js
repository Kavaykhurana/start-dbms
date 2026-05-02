import { investmentApi } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('recommendation-list');

    try {
        const payload = await investmentApi.getRecommendations();

        if (!payload.items.length) {
            container.innerHTML = `
                <div class="glass-card">
                    <h3 style="margin-bottom: 10px;">No Recommendations Available</h3>
                    <p style="color: var(--text-secondary);">Load seed data into MySQL to generate ranked startup recommendations.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';

        payload.items.forEach((startup) => {
            const card = document.createElement('div');
            card.className = 'glass-card';
            card.style.marginBottom = '20px';
            card.style.display = 'flex';
            card.style.justifyContent = 'space-between';
            card.style.alignItems = 'center';

            const signalColor = startup.signal === 'INVEST'
                ? 'var(--accent-green)'
                : startup.signal === 'WATCH'
                    ? 'var(--accent-yellow)'
                    : 'var(--accent-red)';

            card.innerHTML = `
                <div style="display: flex; align-items: center; gap: 30px;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--text-secondary);">#${startup.rank}</div>
                    <div>
                        <h2 style="margin-bottom: 5px;">${startup.name}</h2>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 6px;">${startup.sector} • ${startup.fundingStage}</p>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">${startup.reason}</p>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 5px;">Decision Score</div>
                    <div style="font-size: 1.8rem; font-weight: 700; color: var(--accent-blue);">${startup.decisionScore.toFixed(2)}/10</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">LTV/CAC ${startup.ltvCacRatio.toFixed(2)} • Risk ${startup.riskScore.toFixed(0)}</div>
                    <div style="font-weight: 700; color: ${signalColor}; margin-top: 5px;">${startup.signal}</div>
                </div>
            `;

            container.appendChild(card);
        });
    } catch (error) {
        renderPageError('.main-content', error.message);
    }
});
