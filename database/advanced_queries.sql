USE startup_investment_system;

-- =========================================================
-- 5 COMPLEX JOINS
-- =========================================================

-- 1. Highest ROI investors in the Fintech sector.
SELECT
    invr.investor_name,
    s.startup_name,
    sec.sector_name,
    i.funding_round,
    i.invested_amount_inr,
    fm.metric_month,
    fm.net_profit_inr,
    ra.risk_score,
    ROUND(((fm.net_profit_inr * 12 * 5 * (i.equity_percentage / 100)) / i.invested_amount_inr) * 100, 2) AS roi_proxy_pct
FROM startups s
JOIN sectors sec
    ON sec.sector_id = s.sector_id
JOIN investments i
    ON i.startup_id = s.startup_id
JOIN investors invr
    ON invr.investor_id = i.investor_id
JOIN financial_metrics fm
    ON fm.metric_id = (
        SELECT fm2.metric_id
        FROM financial_metrics fm2
        WHERE fm2.startup_id = s.startup_id
        ORDER BY fm2.metric_month DESC
        LIMIT 1
    )
LEFT JOIN risk_analysis ra
    ON ra.risk_id = (
        SELECT ra2.risk_id
        FROM risk_analysis ra2
        WHERE ra2.investment_id = i.investment_id
        ORDER BY ra2.assessment_date DESC
        LIMIT 1
    )
WHERE sec.sector_name = 'Fintech'
ORDER BY roi_proxy_pct DESC;

-- 2. Partnership leverage by startup using startup, sector, partnership, market, and finance signals.
SELECT
    s.startup_name,
    sec.sector_name,
    p.partner_name,
    p.deal_type,
    p.impact_score,
    md.simulated_trend_value,
    md.competitor_score,
    ROUND(fm.ltv_inr / NULLIF(fm.cac_inr, 0), 2) AS ltv_cac_ratio
FROM startups s
JOIN sectors sec
    ON sec.sector_id = s.sector_id
JOIN partnerships p
    ON p.startup_id = s.startup_id
JOIN market_data md
    ON md.market_id = (
        SELECT md2.market_id
        FROM market_data md2
        WHERE md2.startup_id = s.startup_id
        ORDER BY md2.market_date DESC
        LIMIT 1
    )
JOIN financial_metrics fm
    ON fm.metric_id = (
        SELECT fm2.metric_id
        FROM financial_metrics fm2
        WHERE fm2.startup_id = s.startup_id
        ORDER BY fm2.metric_month DESC
        LIMIT 1
    )
ORDER BY p.impact_score DESC, ltv_cac_ratio DESC;

-- 3. Investor portfolio diversification by sector, including current risk and deployed capital.
SELECT
    invr.investor_name,
    sec.sector_name,
    COUNT(i.investment_id) AS active_bets,
    ROUND(SUM(i.invested_amount_inr) / 10000000, 2) AS deployed_capital_cr,
    ROUND(AVG(ra.risk_score), 2) AS avg_risk_score
FROM investors invr
JOIN investments i
    ON i.investor_id = invr.investor_id
JOIN startups s
    ON s.startup_id = i.startup_id
JOIN sectors sec
    ON sec.sector_id = s.sector_id
LEFT JOIN risk_analysis ra
    ON ra.risk_id = (
        SELECT ra2.risk_id
        FROM risk_analysis ra2
        WHERE ra2.investment_id = i.investment_id
        ORDER BY ra2.assessment_date DESC
        LIMIT 1
    )
WHERE i.status = 'Active'
GROUP BY invr.investor_name, sec.sector_name
ORDER BY deployed_capital_cr DESC, avg_risk_score DESC;

-- 4. Runway stress table combining founders, investors, finance, and market pressure.
SELECT
    s.startup_name,
    sec.sector_name,
    invr.investor_name,
    fm.runway_months,
    fm.burn_rate_inr,
    fm.churn_rate,
    md.competitor_score,
    ra.risk_score
FROM startups s
JOIN sectors sec
    ON sec.sector_id = s.sector_id
JOIN investments i
    ON i.startup_id = s.startup_id
JOIN investors invr
    ON invr.investor_id = i.investor_id
JOIN financial_metrics fm
    ON fm.metric_id = (
        SELECT fm2.metric_id
        FROM financial_metrics fm2
        WHERE fm2.startup_id = s.startup_id
        ORDER BY fm2.metric_month DESC
        LIMIT 1
    )
JOIN market_data md
    ON md.market_id = (
        SELECT md2.market_id
        FROM market_data md2
        WHERE md2.startup_id = s.startup_id
        ORDER BY md2.market_date DESC
        LIMIT 1
    )
LEFT JOIN risk_analysis ra
    ON ra.risk_id = (
        SELECT ra2.risk_id
        FROM risk_analysis ra2
        WHERE ra2.investment_id = i.investment_id
        ORDER BY ra2.assessment_date DESC
        LIMIT 1
    )
WHERE fm.runway_months < 12
ORDER BY fm.runway_months ASC, ra.risk_score DESC;

-- 5. Funding efficiency and partner leverage across six entities.
SELECT
    s.startup_name,
    sec.sector_name,
    ROUND(SUM(i.invested_amount_inr) / 10000000, 2) AS total_funding_cr,
    ROUND(fm.ltv_inr / NULLIF(fm.cac_inr, 0), 2) AS ltv_cac_ratio,
    ROUND(AVG(p.impact_score), 2) AS avg_partner_impact,
    md.simulated_trend_value,
    ra.risk_score
FROM startups s
JOIN sectors sec
    ON sec.sector_id = s.sector_id
JOIN investments i
    ON i.startup_id = s.startup_id
JOIN financial_metrics fm
    ON fm.metric_id = (
        SELECT fm2.metric_id
        FROM financial_metrics fm2
        WHERE fm2.startup_id = s.startup_id
        ORDER BY fm2.metric_month DESC
        LIMIT 1
    )
LEFT JOIN partnerships p
    ON p.startup_id = s.startup_id
JOIN market_data md
    ON md.market_id = (
        SELECT md2.market_id
        FROM market_data md2
        WHERE md2.startup_id = s.startup_id
        ORDER BY md2.market_date DESC
        LIMIT 1
    )
LEFT JOIN risk_analysis ra
    ON ra.risk_id = (
        SELECT ra2.risk_id
        FROM risk_analysis ra2
        WHERE ra2.investment_id = i.investment_id
        ORDER BY ra2.assessment_date DESC
        LIMIT 1
    )
GROUP BY
    s.startup_name,
    sec.sector_name,
    fm.ltv_inr,
    fm.cac_inr,
    md.simulated_trend_value,
    ra.risk_score
ORDER BY ltv_cac_ratio DESC, total_funding_cr DESC;

-- =========================================================
-- 5 SUBQUERIES
-- =========================================================

-- 1. Correlated subquery: startups whose burn rate is above the average of their own sector.
SELECT
    s.startup_name,
    sec.sector_name,
    fm.burn_rate_inr,
    fm.runway_months
FROM startups s
JOIN sectors sec
    ON sec.sector_id = s.sector_id
JOIN financial_metrics fm
    ON fm.metric_id = (
        SELECT fm2.metric_id
        FROM financial_metrics fm2
        WHERE fm2.startup_id = s.startup_id
        ORDER BY fm2.metric_month DESC
        LIMIT 1
    )
WHERE fm.burn_rate_inr > (
    SELECT AVG(fm_sector.burn_rate_inr)
    FROM startups s_sector
    JOIN financial_metrics fm_sector
        ON fm_sector.metric_id = (
            SELECT fm3.metric_id
            FROM financial_metrics fm3
            WHERE fm3.startup_id = s_sector.startup_id
            ORDER BY fm3.metric_month DESC
            LIMIT 1
        )
    WHERE s_sector.sector_id = s.sector_id
);

-- 2. Startups with a latest LTV/CAC ratio above the average ratio of their sector.
SELECT
    s.startup_name,
    sec.sector_name,
    ROUND(fm.ltv_inr / NULLIF(fm.cac_inr, 0), 2) AS startup_ratio
FROM startups s
JOIN sectors sec
    ON sec.sector_id = s.sector_id
JOIN financial_metrics fm
    ON fm.metric_id = (
        SELECT fm2.metric_id
        FROM financial_metrics fm2
        WHERE fm2.startup_id = s.startup_id
        ORDER BY fm2.metric_month DESC
        LIMIT 1
    )
WHERE (fm.ltv_inr / NULLIF(fm.cac_inr, 0)) > (
    SELECT AVG(fm_sector.ltv_inr / NULLIF(fm_sector.cac_inr, 0))
    FROM startups s_sector
    JOIN financial_metrics fm_sector
        ON fm_sector.metric_id = (
            SELECT fm3.metric_id
            FROM financial_metrics fm3
            WHERE fm3.startup_id = s_sector.startup_id
            ORDER BY fm3.metric_month DESC
            LIMIT 1
        )
    WHERE s_sector.sector_id = s.sector_id
);

-- 3. Investors whose deployed capital is above the average of their investor type.
SELECT
    invr.investor_name,
    invr.investor_type,
    (
        SELECT COALESCE(SUM(i.invested_amount_inr), 0)
        FROM investments i
        WHERE i.investor_id = invr.investor_id
    ) AS deployed_capital
FROM investors invr
WHERE (
    SELECT COALESCE(SUM(i.invested_amount_inr), 0)
    FROM investments i
    WHERE i.investor_id = invr.investor_id
) > (
    SELECT AVG(investor_totals.total_invested)
    FROM (
        SELECT
            invr2.investor_id,
            invr2.investor_type,
            COALESCE(SUM(i2.invested_amount_inr), 0) AS total_invested
        FROM investors invr2
        LEFT JOIN investments i2
            ON i2.investor_id = invr2.investor_id
        GROUP BY invr2.investor_id, invr2.investor_type
    ) investor_totals
    WHERE investor_totals.investor_type = invr.investor_type
);

-- 4. Startups with more partnership traction than the average in their sector.
SELECT
    s.startup_name,
    sec.sector_name,
    (
        SELECT COUNT(*)
        FROM partnerships p
        WHERE p.startup_id = s.startup_id
    ) AS partnership_count
FROM startups s
JOIN sectors sec
    ON sec.sector_id = s.sector_id
WHERE (
    SELECT COUNT(*)
    FROM partnerships p
    WHERE p.startup_id = s.startup_id
) > (
    SELECT AVG(sector_partner_counts.partner_count)
    FROM (
        SELECT
            s2.startup_id,
            s2.sector_id,
            COUNT(p2.partner_id) AS partner_count
        FROM startups s2
        LEFT JOIN partnerships p2
            ON p2.startup_id = s2.startup_id
        GROUP BY s2.startup_id, s2.sector_id
    ) sector_partner_counts
    WHERE sector_partner_counts.sector_id = s.sector_id
);

-- 5. Investments whose latest risk score is above the average for the same funding round.
SELECT
    i.investment_id,
    s.startup_name,
    i.funding_round,
    (
        SELECT ra.risk_score
        FROM risk_analysis ra
        WHERE ra.investment_id = i.investment_id
        ORDER BY ra.assessment_date DESC
        LIMIT 1
    ) AS latest_risk_score
FROM investments i
JOIN startups s
    ON s.startup_id = i.startup_id
WHERE (
    SELECT ra.risk_score
    FROM risk_analysis ra
    WHERE ra.investment_id = i.investment_id
    ORDER BY ra.assessment_date DESC
    LIMIT 1
) > (
    SELECT AVG(round_risk.latest_risk_score)
    FROM (
        SELECT
            i2.investment_id,
            i2.funding_round,
            (
                SELECT ra2.risk_score
                FROM risk_analysis ra2
                WHERE ra2.investment_id = i2.investment_id
                ORDER BY ra2.assessment_date DESC
                LIMIT 1
            ) AS latest_risk_score
        FROM investments i2
    ) round_risk
    WHERE round_risk.funding_round = i.funding_round
);

-- =========================================================
-- VIEWS AND PROCEDURES
-- =========================================================

SELECT * FROM vw_TopStartups ORDER BY ltv_cac_ratio DESC;
SELECT * FROM vw_HighRiskAlerts ORDER BY runway_months ASC;

CALL sp_CalculateROI(1, @roi_result);
SELECT @roi_result AS investment_1_roi;

CALL sp_GetRecommendation();
