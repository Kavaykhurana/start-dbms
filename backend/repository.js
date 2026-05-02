import { pool, query } from './db.js';
import { fallbackData } from './fallbackData.js';

const riskLabelSql = `
    CASE
        WHEN COALESCE(rs.latest_risk_score, 50) < 35 THEN 'Low'
        WHEN COALESCE(rs.latest_risk_score, 50) < 65 THEN 'Medium'
        ELSE 'High'
    END
`;

const latestFundingJoinSql = `
    LEFT JOIN (
        SELECT
            startup_id,
            ROUND(SUM(invested_amount_inr), 2) AS total_funding_inr
        FROM investments
        GROUP BY startup_id
    ) inv ON inv.startup_id = s.startup_id
`;

const latestMetricJoinSql = `
    LEFT JOIN financial_metrics fm
        ON fm.metric_id = (
            SELECT fm2.metric_id
            FROM financial_metrics fm2
            WHERE fm2.startup_id = s.startup_id
            ORDER BY fm2.metric_month DESC
            LIMIT 1
        )
`;

const latestMarketJoinSql = `
    LEFT JOIN market_data md
        ON md.market_id = (
            SELECT md2.market_id
            FROM market_data md2
            WHERE md2.startup_id = s.startup_id
            ORDER BY md2.market_date DESC
            LIMIT 1
        )
`;

const latestRiskJoinSql = `
    LEFT JOIN (
        SELECT
            i.startup_id,
            ROUND(AVG(ra.risk_score), 2) AS latest_risk_score
        FROM investments i
        JOIN risk_analysis ra
            ON ra.investment_id = i.investment_id
        JOIN (
            SELECT
                investment_id,
                MAX(assessment_date) AS max_assessment_date
            FROM risk_analysis
            GROUP BY investment_id
        ) latest_ra
            ON latest_ra.investment_id = ra.investment_id
           AND latest_ra.max_assessment_date = ra.assessment_date
        GROUP BY i.startup_id
    ) rs ON rs.startup_id = s.startup_id
`;

export async function getHealthCheck() {
    try {
        const rows = await query('SELECT 1 AS ok');
        return {
            status: rows[0]?.ok === 1 ? 'ok' : 'degraded',
            database: process.env.DB_NAME || 'startup_investment_system'
        };
    } catch (_error) {
        return {
            status: 'fallback',
            database: process.env.DB_NAME || 'startup_investment_system'
        };
    }
}

export async function getDashboardData() {
    try {
        const [summaryRows, sectorRows, trendRows, stageRows, riskRows, recommendations] = await Promise.all([
            query(`
                SELECT
                    (SELECT COUNT(*) FROM startups) AS totalStartups,
                    (SELECT ROUND(COALESCE(SUM(invested_amount_inr), 0), 2) FROM investments) AS totalFundingInr,
                    (
                        SELECT ROUND(AVG(
                            ((COALESCE(fm.net_profit_inr, 0) * 12 * 5 * (i.equity_percentage / 100)) / NULLIF(i.invested_amount_inr, 0)) * 100
                        ), 2)
                        FROM investments i
                        JOIN financial_metrics fm
                            ON fm.metric_id = (
                                SELECT fm2.metric_id
                                FROM financial_metrics fm2
                                WHERE fm2.startup_id = i.startup_id
                                ORDER BY fm2.metric_month DESC
                                LIMIT 1
                            )
                    ) AS avgROI,
                    (
                        SELECT CASE
                            WHEN AVG(startup_risk.risk_score) < 35 THEN 'Low'
                            WHEN AVG(startup_risk.risk_score) < 65 THEN 'Medium'
                            ELSE 'High'
                        END
                        FROM (
                            SELECT
                                s.startup_id,
                                COALESCE(rs.latest_risk_score, 50) AS risk_score
                            FROM startups s
                            ${latestRiskJoinSql}
                        ) startup_risk
                    ) AS riskLevel
            `),
            query(`
                SELECT
                    sec.sector_name AS label,
                    ROUND(AVG(md.simulated_trend_value), 2) AS value
                FROM sectors sec
                JOIN startups s
                    ON s.sector_id = sec.sector_id
                ${latestMarketJoinSql}
                GROUP BY sec.sector_id, sec.sector_name
                ORDER BY value DESC, sec.sector_name
            `),
            query(`
                SELECT
                    DATE_FORMAT(investment_date, '%b %Y') AS label,
                    ROUND(SUM(invested_amount_inr) / 10000000, 2) AS amountInCrore
                FROM investments
                GROUP BY YEAR(investment_date), MONTH(investment_date), DATE_FORMAT(investment_date, '%b %Y')
                ORDER BY MIN(investment_date)
            `),
            query(`
                SELECT
                    funding_round AS label,
                    ROUND(SUM(invested_amount_inr) / 10000000, 2) AS value
                FROM investments
                GROUP BY funding_round
                ORDER BY value DESC
            `),
            query(`
                SELECT
                    riskLevel AS label,
                    COUNT(*) AS value
                FROM (
                    SELECT
                        s.startup_id,
                        ${riskLabelSql} AS riskLevel
                    FROM startups s
                    ${latestRiskJoinSql}
                ) risk_listing
                GROUP BY riskLevel
                ORDER BY FIELD(riskLevel, 'Low', 'Medium', 'High')
            `),
            getRecommendations()
        ]);

        const summary = summaryRows[0];

        return {
            summary: {
                totalStartups: Number(summary.totalStartups || 0),
                totalFundingInr: Number(summary.totalFundingInr || 0),
                avgROI: Number(summary.avgROI || 0),
                riskLevel: summary.riskLevel || 'Medium'
            },
            sectorGrowth: {
                labels: sectorRows.map((row) => row.label),
                data: sectorRows.map((row) => Number(row.value || 0))
            },
            investmentTrends: {
                labels: trendRows.map((row) => row.label),
                data: trendRows.map((row) => Number(row.amountInCrore || 0))
            },
            stageFunding: {
                labels: stageRows.map((row) => row.label),
                data: stageRows.map((row) => Number(row.value || 0))
            },
            riskDistribution: {
                labels: riskRows.map((row) => row.label),
                data: riskRows.map((row) => Number(row.value || 0))
            },
            topStartups: recommendations.items.slice(0, 5)
        };
    } catch (_error) {
        return fallbackData.dashboard;
    }
}

export async function getStartups(filters) {
    const clauses = [];
    const params = [];

    if (filters.search) {
        clauses.push('LOWER(listing.name) LIKE ?');
        params.push(`%${String(filters.search).trim().toLowerCase()}%`);
    }

    if (filters.sector) {
        clauses.push('listing.sector = ?');
        params.push(filters.sector);
    }

    if (filters.risk) {
        clauses.push('listing.riskLevel = ?');
        params.push(filters.risk);
    }

    const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    try {
        const [startupRows, sectorRows] = await Promise.all([
            query(`
                SELECT *
                FROM (
                    SELECT
                        s.startup_id AS id,
                        s.startup_name AS name,
                        sec.sector_name AS sector,
                        s.funding_stage AS fundingStage,
                        s.city,
                        s.state,
                        s.current_valuation_inr AS valuation,
                        COALESCE(inv.total_funding_inr, 0) AS totalFunding,
                        COALESCE(rs.latest_risk_score, 50) AS riskScore,
                        ${riskLabelSql} AS riskLevel,
                        COALESCE(fm.runway_months, 0) AS runway,
                        CASE
                            WHEN COALESCE(fm.cac_inr, 0) = 0 THEN 0
                            ELSE ROUND(COALESCE(fm.ltv_inr, 0) / fm.cac_inr, 2)
                        END AS ltvCacRatio
                    FROM startups s
                    JOIN sectors sec
                        ON sec.sector_id = s.sector_id
                    ${latestFundingJoinSql}
                    ${latestMetricJoinSql}
                    ${latestRiskJoinSql}
                ) listing
                ${whereClause}
                ORDER BY listing.name
            `, params),
            query(`
                SELECT sector_name
                FROM sectors
                ORDER BY sector_name
            `)
        ]);

        return {
            sectors: sectorRows.map((row) => row.sector_name),
            items: startupRows.map((row) => ({
                id: row.id,
                name: row.name,
                sector: row.sector,
                fundingStage: row.fundingStage,
                city: row.city,
                state: row.state,
                valuation: Number(row.valuation || 0),
                totalFunding: Number(row.totalFunding || 0),
                riskScore: Number(row.riskScore || 0),
                riskLevel: row.riskLevel,
                runway: Number(row.runway || 0),
                ltvCacRatio: Number(row.ltvCacRatio || 0)
            }))
        };
    } catch (_error) {
        return filterFallbackStartups(filters);
    }
}

export async function getStartupDetails(startupId) {
    try {
        const startupRows = await query(`
            SELECT
                s.startup_id AS id,
                s.startup_name AS name,
                sec.sector_name AS sector,
                s.funding_stage AS fundingStage,
                s.city,
                s.state,
                s.current_valuation_inr AS valuation,
                s.employee_count AS employeeCount,
                COALESCE(inv.total_funding_inr, 0) AS totalFunding,
                COALESCE(rs.latest_risk_score, 50) AS riskScore,
                ${riskLabelSql} AS riskLevel,
                COALESCE(fm.cac_inr, 0) AS cac,
                COALESCE(fm.ltv_inr, 0) AS ltv,
                COALESCE(fm.burn_rate_inr, 0) AS burnRate,
                COALESCE(fm.runway_months, 0) AS runway,
                COALESCE(fm.churn_rate, 0) AS churnRate,
                COALESCE(fm.customer_count, 0) AS customerCount,
                COALESCE(md.simulated_trend_value, 0) AS marketTrend,
                COALESCE(md.competitor_score, 0) AS competitorScore
            FROM startups s
            JOIN sectors sec
                ON sec.sector_id = s.sector_id
            ${latestFundingJoinSql}
            ${latestMetricJoinSql}
            ${latestMarketJoinSql}
            ${latestRiskJoinSql}
            WHERE s.startup_id = ?
            LIMIT 1
        `, [startupId]);

        if (!startupRows.length) {
            return null;
        }

        const [financialHistory, investmentRounds, partnerships] = await Promise.all([
            query(`
                SELECT
                    DATE_FORMAT(metric_month, '%b %Y') AS label,
                    revenue_inr AS revenue
                FROM financial_metrics
                WHERE startup_id = ?
                ORDER BY metric_month
            `, [startupId]),
            query(`
                SELECT
                    i.investment_id AS investmentId,
                    inv.investor_name AS investorName,
                    i.funding_round AS fundingRound,
                    i.security_type AS securityType,
                    i.investment_date AS investmentDate,
                    i.invested_amount_inr AS amountInr,
                    i.equity_percentage AS equityPercentage,
                    i.status
                FROM investments i
                JOIN investors inv
                    ON inv.investor_id = i.investor_id
                WHERE i.startup_id = ?
                ORDER BY i.investment_date DESC, i.investment_id DESC
            `, [startupId]),
            query(`
                SELECT
                    partner_name AS partnerName,
                    deal_type AS dealType,
                    impact_score AS impactScore,
                    announced_date AS announcedDate
                FROM partnerships
                WHERE startup_id = ?
                ORDER BY impact_score DESC, announced_date DESC
            `, [startupId])
        ]);

        return {
            startup: {
                id: startupRows[0].id,
                name: startupRows[0].name,
                sector: startupRows[0].sector,
                fundingStage: startupRows[0].fundingStage,
                city: startupRows[0].city,
                state: startupRows[0].state,
                valuation: Number(startupRows[0].valuation || 0),
                employeeCount: Number(startupRows[0].employeeCount || 0),
                totalFunding: Number(startupRows[0].totalFunding || 0),
                riskScore: Number(startupRows[0].riskScore || 0),
                riskLevel: startupRows[0].riskLevel,
                cac: Number(startupRows[0].cac || 0),
                ltv: Number(startupRows[0].ltv || 0),
                burnRate: Number(startupRows[0].burnRate || 0),
                runway: Number(startupRows[0].runway || 0),
                churnRate: Number(startupRows[0].churnRate || 0),
                customerCount: Number(startupRows[0].customerCount || 0),
                marketTrend: Number(startupRows[0].marketTrend || 0),
                competitorScore: Number(startupRows[0].competitorScore || 0),
                partnerName: partnerships[0]?.partnerName || null,
                dealType: partnerships[0]?.dealType || null,
                impactScore: Number(partnerships[0]?.impactScore || 0),
                investmentRounds: investmentRounds.map(mapInvestmentRound),
                partnerships: partnerships.map(mapPartnership)
            },
            financialHistory: {
                labels: financialHistory.map((row) => row.label),
                data: financialHistory.map((row) => Number(row.revenue || 0))
            }
        };
    } catch (_error) {
        return getFallbackStartupDetails(startupId);
    }
}

export async function getRecommendations() {
    try {
        const [rows] = await pool.query('CALL sp_GetRecommendation()');
        const resultRows = firstResultSet(rows);

        return {
            items: resultRows.map((row) => ({
                rank: Number(row.recommendationRank || 0),
                startupId: Number(row.startupId || 0),
                name: row.startupName,
                sector: row.sector,
                fundingStage: row.fundingStage,
                decisionScore: Number(row.decisionScore || 0),
                signal: row.signal,
                riskScore: Number(row.riskScore || 0),
                ltvCacRatio: Number(row.ltvCacRatio || 0),
                reason: row.reason
            }))
        };
    } catch (_error) {
        return {
            items: fallbackData.recommendationItems
        };
    }
}

export async function getAnalyticsData() {
    try {
        const [
            scatterRows,
            burnRunwayRows,
            sectorRows,
            stageRows,
            sectorRiskRows,
            valuationFundingRows,
            churnRows
        ] = await Promise.all([
            query(`
                SELECT
                    s.startup_name AS label,
                    COALESCE(fm.cac_inr, 0) AS x,
                    COALESCE(fm.ltv_inr, 0) AS y
                FROM startups s
                ${latestMetricJoinSql}
                ORDER BY s.startup_name
            `),
            query(`
                SELECT
                    s.startup_name AS label,
                    ROUND(COALESCE(fm.burn_rate_inr, 0) / 100000, 2) AS burnRateLakhs,
                    COALESCE(fm.runway_months, 0) AS runwayMonths
                FROM startups s
                ${latestMetricJoinSql}
                ORDER BY s.startup_name
            `),
            query(`
                SELECT
                    sec.sector_name AS sector,
                    ROUND(AVG(md.simulated_trend_value), 2) AS growth,
                    ROUND(AVG(COALESCE(rs.latest_risk_score, 50)), 2) AS risk,
                    ROUND(COALESCE(SUM(inv.total_funding_inr), 0), 2) AS totalFundingInr,
                    ROUND(AVG(COALESCE(p.avg_impact_score, 5)), 2) AS partnershipImpact,
                    ROUND(AVG(md.competitor_score), 2) AS competitorScore
                FROM sectors sec
                JOIN startups s
                    ON s.sector_id = sec.sector_id
                ${latestMarketJoinSql}
                ${latestRiskJoinSql}
                ${latestFundingJoinSql}
                LEFT JOIN (
                    SELECT
                        startup_id,
                        AVG(impact_score) AS avg_impact_score
                    FROM partnerships
                    GROUP BY startup_id
                ) p ON p.startup_id = s.startup_id
                GROUP BY sec.sector_id, sec.sector_name
                ORDER BY totalFundingInr DESC, sec.sector_name
                LIMIT 4
            `),
            query(`
                SELECT
                    funding_round AS label,
                    ROUND(SUM(invested_amount_inr) / 10000000, 2) AS value
                FROM investments
                GROUP BY funding_round
                ORDER BY value DESC
            `),
            query(`
                SELECT
                    sec.sector_name AS label,
                    ROUND(AVG(COALESCE(rs.latest_risk_score, 50)), 2) AS value
                FROM sectors sec
                JOIN startups s
                    ON s.sector_id = sec.sector_id
                ${latestRiskJoinSql}
                GROUP BY sec.sector_id, sec.sector_name
                ORDER BY value DESC
            `),
            query(`
                SELECT
                    s.startup_name AS label,
                    ROUND(COALESCE(inv.total_funding_inr, 0) / 10000000, 2) AS x,
                    ROUND(COALESCE(s.current_valuation_inr, 0) / 10000000, 2) AS y
                FROM startups s
                ${latestFundingJoinSql}
                ORDER BY s.startup_name
            `),
            query(`
                SELECT
                    sec.sector_name AS label,
                    ROUND(AVG(COALESCE(fm.churn_rate, 0)), 2) AS value
                FROM sectors sec
                JOIN startups s
                    ON s.sector_id = sec.sector_id
                ${latestMetricJoinSql}
                GROUP BY sec.sector_id, sec.sector_name
                ORDER BY value DESC
            `)
        ]);

        const palette = [
            { borderColor: '#00d2ff', backgroundColor: 'rgba(0, 210, 255, 0.20)' },
            { borderColor: '#00ff88', backgroundColor: 'rgba(0, 255, 136, 0.20)' },
            { borderColor: '#ffb347', backgroundColor: 'rgba(255, 179, 71, 0.20)' },
            { borderColor: '#ff6b6b', backgroundColor: 'rgba(255, 107, 107, 0.20)' }
        ];

        const maxSectorFunding = Math.max(
            ...sectorRows.map((row) => Number(row.totalFundingInr || 0)),
            1
        );

        return {
            scatter: {
                points: scatterRows.map((row) => ({
                    label: row.label,
                    x: Number(row.x || 0),
                    y: Number(row.y || 0)
                }))
            },
            burnRunway: {
                labels: burnRunwayRows.map((row) => row.label),
                burnRateLakhs: burnRunwayRows.map((row) => Number(row.burnRateLakhs || 0)),
                runwayMonths: burnRunwayRows.map((row) => Number(row.runwayMonths || 0))
            },
            radar: {
                labels: [
                    'Growth',
                    'Risk Buffer',
                    'Funding Strength',
                    'Partner Impact',
                    'Competition Headroom'
                ],
                datasets: sectorRows.map((row, index) => ({
                    label: row.sector,
                    data: [
                        Number(row.growth || 0),
                        round(100 - Number(row.risk || 0)),
                        round((Number(row.totalFundingInr || 0) / maxSectorFunding) * 100),
                        round(Number(row.partnershipImpact || 0) * 10),
                        round(100 - Number(row.competitorScore || 0))
                    ],
                    borderColor: palette[index % palette.length].borderColor,
                    backgroundColor: palette[index % palette.length].backgroundColor
                }))
            },
            fundingByStage: {
                labels: stageRows.map((row) => row.label),
                data: stageRows.map((row) => Number(row.value || 0))
            },
            riskBySector: {
                labels: sectorRiskRows.map((row) => row.label),
                data: sectorRiskRows.map((row) => Number(row.value || 0))
            },
            valuationFunding: {
                points: valuationFundingRows.map((row) => ({
                    label: row.label,
                    x: Number(row.x || 0),
                    y: Number(row.y || 0)
                }))
            },
            churnBySector: {
                labels: churnRows.map((row) => row.label),
                data: churnRows.map((row) => Number(row.value || 0))
            }
        };
    } catch (_error) {
        return fallbackData.analytics;
    }
}

export async function getInvestorPortfolio() {
    try {
        const investorRows = await query(`
            SELECT
                inv.investor_id AS id,
                inv.investor_name AS name,
                inv.investor_type AS investorType,
                inv.hq_city AS hqCity,
                inv.risk_preference AS riskPreference,
                COUNT(DISTINCT i.startup_id) AS startupCount,
                ROUND(SUM(i.invested_amount_inr), 2) AS totalDeployedInr,
                ROUND(AVG(COALESCE(rs.latest_risk_score, 50)), 2) AS avgRiskScore,
                ROUND(AVG(CASE WHEN COALESCE(fm.cac_inr, 0) = 0 THEN 0 ELSE fm.ltv_inr / fm.cac_inr END), 2) AS avgLtvCac,
                ROUND(AVG(((COALESCE(fm.net_profit_inr, 0) * 12 * 5 * (i.equity_percentage / 100)) / NULLIF(i.invested_amount_inr, 0)) * 100), 2) AS roiProxy,
                GROUP_CONCAT(DISTINCT sec.sector_name ORDER BY sec.sector_name SEPARATOR ', ') AS sectors,
                GROUP_CONCAT(DISTINCT s.startup_name ORDER BY s.startup_name SEPARATOR ', ') AS startups
            FROM investors inv
            LEFT JOIN investments i ON i.investor_id = inv.investor_id
            LEFT JOIN startups s ON s.startup_id = i.startup_id
            LEFT JOIN sectors sec ON sec.sector_id = s.sector_id
            ${latestMetricJoinSql}
            ${latestRiskJoinSql}
            GROUP BY inv.investor_id, inv.investor_name, inv.investor_type, inv.hq_city, inv.risk_preference
            ORDER BY totalDeployedInr DESC, inv.investor_name
        `);

        return {
            items: investorRows.map(mapInvestorRow)
        };
    } catch (_error) {
        return getFallbackInvestorPortfolio();
    }
}

export async function getSqlDemo(queryId = 'top-startups') {
    const demo = sqlDemoDefinitions[queryId] || sqlDemoDefinitions['top-startups'];

    try {
        const rows = await query(demo.sql);

        return {
            queryId: demo.queryId,
            title: demo.title,
            sql: demo.sql.trim(),
            explanation: demo.explanation,
            columns: demo.columns,
            rows: rows.map((row) => normalizeSqlDemoRow(row, demo.columns))
        };
    } catch (_error) {
        return {
            queryId: demo.queryId,
            title: demo.title,
            sql: demo.sql.trim(),
            explanation: demo.explanation,
            columns: demo.columns,
            rows: demo.fallbackRows()
        };
    }
}

export async function getInvestmentROI(investmentId) {
    try {
        const connection = await pool.getConnection();

        try {
            await connection.query('CALL sp_CalculateROI(?, @p_roi_percentage)', [investmentId]);
            const [rows] = await connection.query('SELECT @p_roi_percentage AS roiPercentage');

            return {
                investmentId,
                roiPercentage: Number(rows[0]?.roiPercentage || 0)
            };
        } finally {
            connection.release();
        }
    } catch (_error) {
        return {
            investmentId,
            roiPercentage: Number(fallbackData.investmentRoiById[investmentId] || 0)
        };
    }
}

function firstResultSet(rows) {
    if (Array.isArray(rows) && Array.isArray(rows[0])) {
        return rows[0];
    }

    return rows;
}

const sqlDemoDefinitions = {
    'top-startups': {
        queryId: 'top-startups',
        title: 'View Demo: vw_TopStartups',
        columns: ['startup_name', 'sector_name', 'funding_stage', 'ltv_cac_ratio', 'runway_months', 'risk_score'],
        explanation: 'Shows why a startup qualifies as investment-ready: strong LTV/CAC, enough runway, and controlled risk.',
        sql: `
            SELECT startup_name, sector_name, funding_stage, ltv_cac_ratio, runway_months, risk_score
            FROM vw_TopStartups
            ORDER BY ltv_cac_ratio DESC, runway_months DESC
            LIMIT 8
        `,
        fallbackRows: () => fallbackData.recommendationItems.slice(0, 8).map((startup) => ({
            startup_name: startup.name,
            sector_name: startup.sector,
            funding_stage: startup.fundingStage,
            ltv_cac_ratio: startup.ltvCacRatio,
            runway_months: fallbackData.startupDetailsById[startup.startupId]?.runway || 0,
            risk_score: startup.riskScore
        }))
    },
    'burn-alerts': {
        queryId: 'burn-alerts',
        title: 'Correlated Subquery: Burn Above Sector Average',
        columns: ['startup_name', 'sector_name', 'burn_rate_cr', 'sector_avg_burn_cr', 'runway_months'],
        explanation: 'Finds startups whose burn rate is higher than their own sector average, not the global average.',
        sql: `
            SELECT
                s.startup_name,
                sec.sector_name,
                ROUND(fm.burn_rate_inr / 10000000, 2) AS burn_rate_cr,
                (
                    SELECT ROUND(AVG(fm_sector.burn_rate_inr) / 10000000, 2)
                    FROM startups s_sector
                    JOIN financial_metrics fm_sector
                      ON fm_sector.startup_id = s_sector.startup_id
                    WHERE s_sector.sector_id = s.sector_id
                      AND fm_sector.metric_month = (
                          SELECT MAX(metric_month)
                          FROM financial_metrics
                          WHERE startup_id = s_sector.startup_id
                      )
                ) AS sector_avg_burn_cr,
                fm.runway_months
            FROM startups s
            JOIN sectors sec ON sec.sector_id = s.sector_id
            JOIN financial_metrics fm ON fm.startup_id = s.startup_id
            WHERE fm.metric_month = (
                SELECT MAX(metric_month)
                FROM financial_metrics
                WHERE startup_id = s.startup_id
            )
            HAVING burn_rate_cr > sector_avg_burn_cr
            ORDER BY burn_rate_cr DESC
            LIMIT 8
        `,
        fallbackRows: () => {
            const groups = groupBy(fallbackData.startups.map((startup) => fallbackData.startupDetailsById[startup.id]), 'sector');

            return Object.values(fallbackData.startupDetailsById)
                .map((startup) => ({
                    startup_name: startup.name,
                    sector_name: startup.sector,
                    burn_rate_cr: round(startup.burnRate / 10000000),
                    sector_avg_burn_cr: round(average(groups[startup.sector].map((item) => item.burnRate)) / 10000000),
                    runway_months: startup.runway
                }))
                .filter((row) => row.burn_rate_cr > row.sector_avg_burn_cr)
                .sort((a, b) => b.burn_rate_cr - a.burn_rate_cr)
                .slice(0, 8);
        }
    },
    'investor-exposure': {
        queryId: 'investor-exposure',
        title: 'Complex Join: Investor Exposure',
        columns: ['investor_name', 'startup_count', 'total_deployed_cr', 'avg_risk_score', 'roi_proxy_pct'],
        explanation: 'Joins investors, investments, startups, financial metrics, and risk analysis to explain portfolio exposure.',
        sql: `
            SELECT
                inv.investor_name,
                COUNT(DISTINCT i.startup_id) AS startup_count,
                ROUND(SUM(i.invested_amount_inr) / 10000000, 2) AS total_deployed_cr,
                ROUND(AVG(COALESCE(rs.latest_risk_score, 50)), 2) AS avg_risk_score,
                ROUND(AVG(((COALESCE(fm.net_profit_inr, 0) * 12 * 5 * (i.equity_percentage / 100)) / NULLIF(i.invested_amount_inr, 0)) * 100), 2) AS roi_proxy_pct
            FROM investors inv
            JOIN investments i ON i.investor_id = inv.investor_id
            JOIN startups s ON s.startup_id = i.startup_id
            LEFT JOIN financial_metrics fm ON fm.metric_id = (
                SELECT fm2.metric_id
                FROM financial_metrics fm2
                WHERE fm2.startup_id = s.startup_id
                ORDER BY fm2.metric_month DESC
                LIMIT 1
            )
            LEFT JOIN (
                SELECT i2.startup_id, AVG(ra.risk_score) AS latest_risk_score
                FROM investments i2
                JOIN risk_analysis ra ON ra.investment_id = i2.investment_id
                GROUP BY i2.startup_id
            ) rs ON rs.startup_id = s.startup_id
            GROUP BY inv.investor_id, inv.investor_name
            ORDER BY total_deployed_cr DESC
        `,
        fallbackRows: () => getFallbackInvestorPortfolio().items.map((investor) => ({
            investor_name: investor.name,
            startup_count: investor.startupCount,
            total_deployed_cr: round(investor.totalDeployedInr / 10000000),
            avg_risk_score: investor.avgRiskScore,
            roi_proxy_pct: investor.roiProxy
        }))
    }
};

function normalizeSqlDemoRow(row, columns) {
    return columns.reduce((normalized, column) => {
        normalized[column] = row[column];
        return normalized;
    }, {});
}

function mapInvestmentRound(row) {
    return {
        investmentId: Number(row.investmentId || 0),
        investorName: row.investorName,
        fundingRound: row.fundingRound,
        securityType: row.securityType,
        investmentDate: row.investmentDate,
        amountInr: Number(row.amountInr || 0),
        equityPercentage: Number(row.equityPercentage || 0),
        status: row.status
    };
}

function mapPartnership(row) {
    return {
        partnerName: row.partnerName,
        dealType: row.dealType,
        impactScore: Number(row.impactScore || 0),
        announcedDate: row.announcedDate
    };
}

function mapInvestorRow(row) {
    return {
        id: Number(row.id || 0),
        name: row.name,
        investorType: row.investorType,
        hqCity: row.hqCity,
        riskPreference: row.riskPreference,
        startupCount: Number(row.startupCount || 0),
        totalDeployedInr: Number(row.totalDeployedInr || 0),
        avgRiskScore: Number(row.avgRiskScore || 0),
        avgLtvCac: Number(row.avgLtvCac || 0),
        roiProxy: Number(row.roiProxy || 0),
        sectors: String(row.sectors || '').split(', ').filter(Boolean),
        startups: String(row.startups || '').split(', ').filter(Boolean)
    };
}

function getFallbackInvestorPortfolio() {
    const investorSeed = [
        ['Bharat Growth Ventures', 'VC', 'Bengaluru', 'High'],
        ['Mumbai Fintech Angels', 'Angel', 'Mumbai', 'Medium'],
        ['Karnataka SaaS Capital', 'VC', 'Bengaluru', 'Medium'],
        ['SouthBridge Corporate Ventures', 'Corporate VC', 'Hyderabad', 'Low'],
        ['Indus Seed Partners', 'VC', 'Delhi', 'High'],
        ['Chennai DeepTech Partners', 'VC', 'Chennai', 'High'],
        ['Gurugram Impact Capital', 'Family Office', 'Gurugram', 'Medium'],
        ['Pune Climate Growth Fund', 'Family Office', 'Pune', 'Low']
    ];
    const startups = Object.values(fallbackData.startupDetailsById);
    const items = investorSeed.map(([name, investorType, hqCity, riskPreference], investorIndex) => {
        const portfolio = startups.filter((startup, startupIndex) => startupIndex % investorSeed.length === investorIndex);
        const totalDeployedInr = portfolio.reduce((sum, startup) => sum + startup.totalFunding, 0);

        return {
            id: investorIndex + 1,
            name,
            investorType,
            hqCity,
            riskPreference,
            startupCount: portfolio.length,
            totalDeployedInr,
            avgRiskScore: round(average(portfolio.map((startup) => startup.riskScore))),
            avgLtvCac: round(average(portfolio.map((startup) => startup.ltv / startup.cac))),
            roiProxy: round(average(portfolio.map((startup) => {
                const latestRevenue = startup.history[startup.history.length - 1] || 0;
                const monthlyProfit = latestRevenue - startup.burnRate;
                return ((monthlyProfit * 12 * 5 * 0.08) / Math.max(1, startup.totalFunding)) * 100;
            }))),
            sectors: [...new Set(portfolio.map((startup) => startup.sector))].sort(),
            startups: portfolio.map((startup) => startup.name)
        };
    });

    return { items };
}

function round(value) {
    return Number(Number(value || 0).toFixed(2));
}

function average(values) {
    if (!values.length) {
        return 0;
    }

    return values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length;
}

function groupBy(items, key) {
    return items.reduce((groups, item) => {
        const value = item[key] || 'Unknown';
        groups[value] = groups[value] || [];
        groups[value].push(item);
        return groups;
    }, {});
}

function filterFallbackStartups(filters) {
    const search = String(filters.search || '').trim().toLowerCase();
    const sector = String(filters.sector || '');
    const risk = String(filters.risk || '');

    const items = fallbackData.startups.filter((startup) => {
        const searchable = [
            startup.name,
            startup.sector,
            startup.city,
            startup.state,
            startup.fundingStage
        ].join(' ').toLowerCase();
        const matchesSearch = !search || searchable.includes(search);
        const matchesSector = !sector || startup.sector === sector;
        const matchesRisk = !risk || startup.riskLevel === risk;

        return matchesSearch && matchesSector && matchesRisk;
    });

    return {
        sectors: fallbackData.sectors,
        items
    };
}

function getFallbackStartupDetails(startupId) {
    const startup = fallbackData.startupDetailsById[startupId];

    if (!startup) {
        return null;
    }

    return {
        startup: {
            ...startup,
            partnerships: buildFallbackPartnerships(startup),
            investmentRounds: buildFallbackInvestmentRounds(startup)
        },
        financialHistory: {
            labels: ['Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026'],
            data: fallbackData.startupHistory[startupId] || []
        }
    };
}

function buildFallbackPartnerships(startup) {
    return [
        {
            partnerName: startup.partnerName,
            dealType: startup.dealType,
            impactScore: Number(startup.impactScore || 0),
            announcedDate: '2026-04-08'
        },
        {
            partnerName: getSecondaryPartner(startup),
            dealType: startup.dealType === 'Pilot' ? 'LOI' : 'Pilot',
            impactScore: Math.max(5.8, Number(startup.impactScore || 7) - 0.6),
            announcedDate: '2026-03-18'
        }
    ].filter((partnership) => partnership.partnerName);
}

function buildFallbackInvestmentRounds(startup) {
    const leadInvestors = [
        'Bharat Growth Ventures',
        'Mumbai Fintech Angels',
        'Karnataka SaaS Capital',
        'SouthBridge Corporate Ventures',
        'Indus Seed Partners',
        'Chennai DeepTech Partners',
        'Gurugram Impact Capital',
        'Pune Climate Growth Fund'
    ];
    const leadInvestor = leadInvestors[Number(startup.id || 0) % leadInvestors.length];
    const coInvestor = leadInvestors[(Number(startup.id || 0) + 3) % leadInvestors.length];
    const totalFunding = Number(startup.totalFunding || 0);
    const latestAmount = Math.round(totalFunding * (startup.fundingStage === 'Seed' ? 0.72 : 0.64));
    const earlierAmount = Math.max(0, totalFunding - latestAmount);
    const latestDate = startup.fundingStage === 'Series B' ? '2026-03-21' : startup.fundingStage === 'Series A' ? '2026-02-14' : '2026-01-18';
    const earlierRound = startup.fundingStage === 'Series B' ? 'Series A' : 'Seed';

    return [
        {
            investmentId: Number(startup.id || 0),
            investorName: leadInvestor,
            fundingRound: startup.fundingStage,
            securityType: startup.fundingStage === 'Seed' ? 'SAFE' : 'Equity',
            investmentDate: latestDate,
            amountInr: latestAmount,
            equityPercentage: Number(((latestAmount / Math.max(1, startup.valuation)) * 100).toFixed(2)),
            status: 'Active'
        },
        {
            investmentId: 1000 + Number(startup.id || 0),
            investorName: coInvestor,
            fundingRound: earlierRound,
            securityType: earlierRound === 'Seed' ? 'SAFE' : 'Convertible Note',
            investmentDate: '2025-08-24',
            amountInr: earlierAmount,
            equityPercentage: Number(((earlierAmount / Math.max(1, startup.valuation)) * 100).toFixed(2)),
            status: 'Active'
        }
    ].filter((round) => round.amountInr > 0);
}

function getSecondaryPartner(startup) {
    const sectorPartners = {
        'AI/ML': 'NASSCOM AI Foundry',
        Agritech: 'NABARD Innovation Hub',
        Biotech: 'BIRAC BioNEST',
        ClimateTech: 'TERI Clean Energy Lab',
        Cybersecurity: 'CERT-In Innovation Program',
        Dronetech: 'Drone Federation India',
        Ecommerce: 'ONDC Seller Network',
        Edtech: 'NSDC Digital Learning',
        Energy: 'India Smart Grid Forum',
        Fintech: 'NPCI Sandbox',
        Foodtech: 'FSSAI Food Innovation Lab',
        Gaming: 'India Game Developer Conference',
        Healthtech: 'Ayushman Bharat Digital Mission',
        HRTech: 'NASSCOM FutureSkills Prime',
        Insurtech: 'IRDAI Sandbox Partner',
        LegalTech: 'India LegalTech Association',
        Logistics: 'Gati Shakti Logistics Cell',
        MediaTech: 'T-Hub Media Lab',
        Mobility: 'SIAM EV Program',
        Proptech: 'CREDAI Innovation Cell',
        Robotics: 'CII Industrial Robotics Forum',
        SaaS: 'SaaSBoomi Growth Program',
        SpaceTech: 'IN-SPACe Technical Centre'
    };

    return sectorPartners[startup.sector] || 'Startup India Market Access Program';
}
