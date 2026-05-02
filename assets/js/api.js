async function apiGet(path) {
    const response = await fetch(path);

    if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}.`;

        try {
            const body = await response.json();
            errorMessage = body.error || body.detail || errorMessage;
        } catch (_error) {
            // Use the default message when the response is not JSON.
        }

        throw new Error(errorMessage);
    }

    return response.json();
}

function buildQueryString(filters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.set(key, value);
        }
    });

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
}

export const investmentApi = {
    getHealth() {
        return apiGet('/api/health');
    },

    getDashboard() {
        return apiGet('/api/dashboard');
    },

    getStartups(filters = {}) {
        return apiGet(`/api/startups${buildQueryString(filters)}`);
    },

    getStartup(startupId) {
        return apiGet(`/api/startups/${startupId}`);
    },

    getRecommendations() {
        return apiGet('/api/recommendations');
    },

    getInvestors() {
        return apiGet('/api/investors');
    },

    getSqlDemo(queryId) {
        return apiGet(`/api/sql-demo/${encodeURIComponent(queryId)}`);
    },

    getAnalytics() {
        return apiGet('/api/analytics');
    },

    getInvestmentROI(investmentId) {
        return apiGet(`/api/investments/${investmentId}/roi`);
    }
};
