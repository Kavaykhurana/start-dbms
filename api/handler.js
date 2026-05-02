import {
    getAnalyticsData,
    getDashboardData,
    getHealthCheck,
    getInvestorPortfolio,
    getInvestmentROI,
    getRecommendations,
    getSqlDemo,
    getStartupDetails,
    getStartups
} from '../backend/repository.js';

export default async function handler(req, res) {
    try {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const rewrittenPath = url.searchParams.get('path');
        const pathname = rewrittenPath ? `/${rewrittenPath}` : (url.pathname.replace(/^\/api/, '') || '/');

        if (req.method !== 'GET') {
            return res.status(405).json({ error: 'Method not allowed.' });
        }

        if (pathname === '/health') {
            return res.status(200).json(await getHealthCheck());
        }

        if (pathname === '/dashboard') {
            return res.status(200).json(await getDashboardData());
        }

        if (pathname === '/startups') {
            return res.status(200).json(await getStartups({
                search: url.searchParams.get('search') || '',
                sector: url.searchParams.get('sector') || '',
                risk: url.searchParams.get('risk') || ''
            }));
        }

        const startupMatch = pathname.match(/^\/startups\/(\d+)$/);
        if (startupMatch) {
            const payload = await getStartupDetails(Number(startupMatch[1]));

            if (!payload) {
                return res.status(404).json({ error: 'Startup not found.' });
            }

            return res.status(200).json(payload);
        }

        if (pathname === '/recommendations') {
            return res.status(200).json(await getRecommendations());
        }

        if (pathname === '/investors') {
            return res.status(200).json(await getInvestorPortfolio());
        }

        const sqlDemoMatch = pathname.match(/^\/sql-demo\/([a-z0-9-]+)$/);
        if (sqlDemoMatch) {
            return res.status(200).json(await getSqlDemo(sqlDemoMatch[1]));
        }

        if (pathname === '/analytics') {
            return res.status(200).json(await getAnalyticsData());
        }

        const roiMatch = pathname.match(/^\/investments\/(\d+)\/roi$/);
        if (roiMatch) {
            return res.status(200).json(await getInvestmentROI(Number(roiMatch[1])));
        }

        return res.status(404).json({ error: 'Route not found.' });
    } catch (error) {
        return res.status(500).json({
            error: 'Unable to complete the request.',
            detail: error.message
        });
    }
}
