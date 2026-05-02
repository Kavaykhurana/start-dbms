import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import {
    getAnalyticsData,
    getDashboardData,
    getHealthCheck,
    getInvestmentROI,
    getRecommendations,
    getStartupDetails,
    getStartups
} from './backend/repository.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 3000);

app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/pages', express.static(path.join(__dirname, 'pages')));

app.get('/', (_req, res) => {
    res.redirect('/pages/index.html');
});

app.get('/api/health', asyncHandler(async (_req, res) => {
    const health = await getHealthCheck();
    res.json(health);
}));

app.get('/api/dashboard', asyncHandler(async (_req, res) => {
    const payload = await getDashboardData();
    res.json(payload);
}));

app.get('/api/startups', asyncHandler(async (req, res) => {
    const payload = await getStartups({
        search: req.query.search,
        sector: req.query.sector,
        risk: req.query.risk
    });

    res.json(payload);
}));

app.get('/api/startups/:id', asyncHandler(async (req, res) => {
    const startup = await getStartupDetails(Number(req.params.id));

    if (!startup) {
        res.status(404).json({ error: 'Startup not found.' });
        return;
    }

    res.json(startup);
}));

app.get('/api/recommendations', asyncHandler(async (_req, res) => {
    const payload = await getRecommendations();
    res.json(payload);
}));

app.get('/api/analytics', asyncHandler(async (_req, res) => {
    const payload = await getAnalyticsData();
    res.json(payload);
}));

app.get('/api/investments/:id/roi', asyncHandler(async (req, res) => {
    const roi = await getInvestmentROI(Number(req.params.id));
    res.json(roi);
}));

app.use((err, _req, res, _next) => {
    const status = err.statusCode || 500;

    res.status(status).json({
        error: err.publicMessage || 'Unable to complete the request.',
        detail: err.message
    });
});

function asyncHandler(handler) {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
}

export { app };

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
    app.listen(port, host, () => {
        console.log(`Startup Investment System is running on http://${host}:${port}`);
    });
}
