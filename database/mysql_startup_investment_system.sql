DROP DATABASE IF EXISTS startup_investment_system;
CREATE DATABASE startup_investment_system
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE startup_investment_system;

SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

CREATE TABLE sectors (
    sector_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sector_name VARCHAR(60) NOT NULL UNIQUE,
    sector_description VARCHAR(255) NOT NULL,
    base_risk_score TINYINT UNSIGNED NOT NULL,
    CHECK (base_risk_score BETWEEN 0 AND 100)
);

CREATE TABLE investors (
    investor_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    investor_name VARCHAR(120) NOT NULL UNIQUE,
    investor_type ENUM('Angel', 'VC', 'Corporate VC', 'Family Office') NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    hq_city VARCHAR(80) NOT NULL,
    dry_powder_inr DECIMAL(15,2) NOT NULL,
    risk_preference ENUM('Low', 'Medium', 'High') NOT NULL,
    created_at DATE NOT NULL DEFAULT (CURRENT_DATE),
    CHECK (dry_powder_inr >= 0)
);

CREATE TABLE startups (
    startup_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sector_id BIGINT UNSIGNED NOT NULL,
    startup_name VARCHAR(120) NOT NULL UNIQUE,
    city VARCHAR(80) NOT NULL,
    state VARCHAR(80) NOT NULL,
    founding_year SMALLINT UNSIGNED NOT NULL,
    funding_stage ENUM('Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C') NOT NULL,
    annual_revenue_inr DECIMAL(15,2) NOT NULL DEFAULT 0,
    current_valuation_inr DECIMAL(15,2) NOT NULL DEFAULT 0,
    employee_count INT UNSIGNED NOT NULL DEFAULT 0,
    equity_committed_pct DECIMAL(5,2) NOT NULL DEFAULT 0,
    website VARCHAR(160) NOT NULL,
    CONSTRAINT fk_startups_sector
        FOREIGN KEY (sector_id) REFERENCES sectors (sector_id),
    CHECK (founding_year BETWEEN 2005 AND 2035),
    CHECK (annual_revenue_inr >= 0),
    CHECK (current_valuation_inr >= 0),
    CHECK (employee_count >= 0),
    CHECK (equity_committed_pct BETWEEN 0 AND 100)
);

CREATE TABLE investments (
    investment_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    investor_id BIGINT UNSIGNED NOT NULL,
    startup_id BIGINT UNSIGNED NOT NULL,
    funding_round ENUM('Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Bridge') NOT NULL,
    security_type ENUM('Equity', 'SAFE', 'Convertible Note') NOT NULL,
    investment_date DATE NOT NULL,
    invested_amount_inr DECIMAL(15,2) NOT NULL,
    equity_percentage DECIMAL(5,2) NOT NULL,
    post_money_valuation_inr DECIMAL(15,2) NOT NULL,
    status ENUM('Active', 'Exited', 'Written Off') NOT NULL DEFAULT 'Active',
    CONSTRAINT fk_investments_investor
        FOREIGN KEY (investor_id) REFERENCES investors (investor_id),
    CONSTRAINT fk_investments_startup
        FOREIGN KEY (startup_id) REFERENCES startups (startup_id),
    CHECK (invested_amount_inr > 0),
    CHECK (equity_percentage > 0 AND equity_percentage <= 100),
    CHECK (post_money_valuation_inr > 0)
);

CREATE TABLE financial_metrics (
    metric_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    startup_id BIGINT UNSIGNED NOT NULL,
    metric_month DATE NOT NULL,
    revenue_inr DECIMAL(15,2) NOT NULL DEFAULT 0,
    net_profit_inr DECIMAL(15,2) NOT NULL DEFAULT 0,
    cash_reserve_inr DECIMAL(15,2) NOT NULL DEFAULT 0,
    customer_count INT UNSIGNED NOT NULL DEFAULT 0,
    mrr_inr DECIMAL(15,2) NOT NULL DEFAULT 0,
    arr_inr DECIMAL(15,2) NOT NULL DEFAULT 0,
    cac_inr DECIMAL(12,2) NOT NULL DEFAULT 0,
    ltv_inr DECIMAL(12,2) NOT NULL DEFAULT 0,
    burn_rate_inr DECIMAL(15,2) NOT NULL DEFAULT 0,
    runway_months DECIMAL(5,2) NOT NULL DEFAULT 0,
    churn_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    CONSTRAINT fk_financial_metrics_startup
        FOREIGN KEY (startup_id) REFERENCES startups (startup_id),
    CONSTRAINT uq_financial_metrics_period
        UNIQUE (startup_id, metric_month),
    CHECK (revenue_inr >= 0),
    CHECK (cash_reserve_inr >= 0),
    CHECK (customer_count >= 0),
    CHECK (mrr_inr >= 0),
    CHECK (arr_inr >= 0),
    CHECK (cac_inr >= 0),
    CHECK (ltv_inr >= 0),
    CHECK (burn_rate_inr >= 0),
    CHECK (runway_months >= 0),
    CHECK (churn_rate BETWEEN 0 AND 100)
);

CREATE TABLE market_data (
    market_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    startup_id BIGINT UNSIGNED NOT NULL,
    simulated_trend_value DECIMAL(5,2) NOT NULL,
    competitor_score DECIMAL(5,2) NOT NULL,
    market_date DATE NOT NULL,
    CONSTRAINT fk_market_data_startup
        FOREIGN KEY (startup_id) REFERENCES startups (startup_id),
    CONSTRAINT uq_market_data_period
        UNIQUE (startup_id, market_date),
    CHECK (simulated_trend_value BETWEEN 0 AND 100),
    CHECK (competitor_score BETWEEN 0 AND 100)
);

CREATE TABLE partnerships (
    partner_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    startup_id BIGINT UNSIGNED NOT NULL,
    partner_name VARCHAR(140) NOT NULL,
    deal_type ENUM('LOI', 'Pilot') NOT NULL,
    impact_score DECIMAL(5,2) NOT NULL,
    announced_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    CONSTRAINT fk_partnerships_startup
        FOREIGN KEY (startup_id) REFERENCES startups (startup_id),
    CHECK (impact_score BETWEEN 0 AND 10)
);

CREATE TABLE risk_analysis (
    risk_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    investment_id BIGINT UNSIGNED NOT NULL,
    risk_score DECIMAL(5,2) NOT NULL,
    factors VARCHAR(500) NOT NULL,
    assessment_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    CONSTRAINT fk_risk_analysis_investment
        FOREIGN KEY (investment_id) REFERENCES investments (investment_id),
    CONSTRAINT uq_risk_analysis_snapshot
        UNIQUE (investment_id, assessment_date),
    CHECK (risk_score BETWEEN 0 AND 100)
);

CREATE INDEX idx_startups_sector ON startups (sector_id);
CREATE INDEX idx_investments_startup ON investments (startup_id, status);
CREATE INDEX idx_investments_investor ON investments (investor_id);
CREATE INDEX idx_financial_metrics_startup_month ON financial_metrics (startup_id, metric_month);
CREATE INDEX idx_market_data_startup_date ON market_data (startup_id, market_date);
CREATE INDEX idx_partnerships_startup ON partnerships (startup_id);
CREATE INDEX idx_risk_analysis_investment_date ON risk_analysis (investment_id, assessment_date);

DELIMITER $$

CREATE TRIGGER trig_EquityCheck
BEFORE INSERT ON investments
FOR EACH ROW
BEGIN
    DECLARE v_total_equity DECIMAL(7,2);

    SELECT COALESCE(SUM(equity_percentage), 0)
    INTO v_total_equity
    FROM investments
    WHERE startup_id = NEW.startup_id
      AND status = 'Active';

    IF v_total_equity + NEW.equity_percentage > 100 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Investment rejected: startup equity allocation would exceed 100 percent.';
    END IF;
END$$

CREATE TRIGGER trig_RiskUpdate
AFTER UPDATE ON financial_metrics
FOR EACH ROW
BEGIN
    IF NEW.burn_rate_inr <> OLD.burn_rate_inr
       OR NEW.churn_rate <> OLD.churn_rate
       OR NEW.runway_months <> OLD.runway_months THEN
        UPDATE risk_analysis ra
        JOIN investments i
            ON i.investment_id = ra.investment_id
        JOIN (
            SELECT
                investment_id,
                MAX(assessment_date) AS max_assessment_date
            FROM risk_analysis
            GROUP BY investment_id
        ) latest_ra
            ON latest_ra.investment_id = ra.investment_id
           AND latest_ra.max_assessment_date = ra.assessment_date
        SET ra.risk_score = LEAST(
            100,
            ROUND(
                CASE
                    WHEN NEW.burn_rate_inr >= 20000000 THEN 35
                    WHEN NEW.burn_rate_inr >= 12000000 THEN 25
                    ELSE 15
                END
                + CASE
                    WHEN NEW.runway_months < 6 THEN 35
                    WHEN NEW.runway_months < 12 THEN 20
                    ELSE 10
                END
                + LEAST(30, NEW.churn_rate * 4),
                2
            )
        )
        WHERE i.startup_id = NEW.startup_id;
    END IF;
END$$

CREATE PROCEDURE sp_CalculateROI (
    IN p_investment_id BIGINT UNSIGNED,
    OUT p_roi_percentage DECIMAL(10,2)
)
BEGIN
    DECLARE v_invested_amount DECIMAL(15,2);
    DECLARE v_equity_percentage DECIMAL(5,2);
    DECLARE v_net_profit DECIMAL(15,2);

    SELECT
        i.invested_amount_inr,
        i.equity_percentage
    INTO
        v_invested_amount,
        v_equity_percentage
    FROM investments i
    WHERE i.investment_id = p_investment_id;

    SELECT fm.net_profit_inr
    INTO v_net_profit
    FROM financial_metrics fm
    JOIN investments i
        ON i.startup_id = fm.startup_id
    WHERE i.investment_id = p_investment_id
    ORDER BY fm.metric_month DESC
    LIMIT 1;

    SET p_roi_percentage = ROUND(
        ((COALESCE(v_net_profit, 0) * 12 * 5 * (v_equity_percentage / 100)) / NULLIF(v_invested_amount, 0)) * 100,
        2
    );
END$$

CREATE PROCEDURE sp_GetRecommendation ()
BEGIN
    SELECT
        ROW_NUMBER() OVER (ORDER BY recommendation_score DESC, startup_name) AS recommendationRank,
        startup_id AS startupId,
        startup_name AS startupName,
        sector_name AS sector,
        funding_stage AS fundingStage,
        ROUND(ltv_cac_ratio, 2) AS ltvCacRatio,
        ROUND(risk_score, 2) AS riskScore,
        ROUND(recommendation_score / 10, 2) AS decisionScore,
        CASE
            WHEN recommendation_score >= 75 THEN 'INVEST'
            WHEN recommendation_score >= 60 THEN 'WATCH'
            ELSE 'AVOID'
        END AS signal,
        CASE
            WHEN recommendation_score >= 75 THEN 'Strong unit economics with contained downside risk.'
            WHEN recommendation_score >= 60 THEN 'Promising fundamentals, but monitor risk and efficiency closely.'
            ELSE 'Risk-adjusted return profile is below the current portfolio threshold.'
        END AS reason
    FROM (
        SELECT
            s.startup_id,
            s.startup_name,
            sec.sector_name,
            s.funding_stage,
            (fm.ltv_inr / NULLIF(fm.cac_inr, 0)) AS ltv_cac_ratio,
            fm.cac_inr,
            COALESCE(rs.latest_risk_score, 50) AS risk_score,
            (
                0.50 * LEAST(100, (fm.ltv_inr / NULLIF(fm.cac_inr, 0)) * 16.67)
                + 0.20 * GREATEST(0, 100 - ((fm.cac_inr / max_cac.max_cac_inr) * 100))
                + 0.30 * (100 - COALESCE(rs.latest_risk_score, 50))
            ) AS recommendation_score
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
        LEFT JOIN (
            SELECT
                i.startup_id,
                AVG(ra.risk_score) AS latest_risk_score
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
        ) rs
            ON rs.startup_id = s.startup_id
        CROSS JOIN (
            SELECT MAX(cac_inr) AS max_cac_inr
            FROM (
                SELECT fm_latest.cac_inr
                FROM financial_metrics fm_latest
                JOIN (
                    SELECT
                        startup_id,
                        MAX(metric_month) AS latest_month
                    FROM financial_metrics
                    GROUP BY startup_id
                ) latest_metric
                    ON latest_metric.startup_id = fm_latest.startup_id
                   AND latest_metric.latest_month = fm_latest.metric_month
            ) max_cac_source
        ) max_cac
        WHERE fm.cac_inr > 0
    ) ranked
    ORDER BY recommendation_score DESC, startup_name
    LIMIT 5;
END$$

DELIMITER ;

INSERT INTO sectors (sector_name, sector_description, base_risk_score) VALUES
('Fintech', 'Digital lending, payments, treasury, and embedded finance platforms.', 42),
('Edtech', 'B2C and B2B learning businesses across K-12, upskilling, and workforce training.', 48),
('Healthtech', 'Healthcare delivery, diagnostics, and clinical workflow digitization.', 45),
('Logistics', 'Supply chain visibility, fulfillment, and route optimization platforms.', 57),
('ClimateTech', 'Energy transition, carbon operations, and industrial sustainability businesses.', 46),
('SaaS', 'Vertical and horizontal subscription software products sold to businesses.', 35);

INSERT INTO investors (investor_name, investor_type, email, hq_city, dry_powder_inr, risk_preference, created_at) VALUES
('Deccan Spark Ventures', 'VC', 'invest@deccanspark.vc', 'Bengaluru', 6000000000.00, 'High', '2023-01-15'),
('ArthaLeap Capital', 'VC', 'team@arthaleap.com', 'Mumbai', 4500000000.00, 'Medium', '2022-09-01'),
('Monsoon Peak Ventures', 'Angel', 'partners@monsoonpeak.in', 'Gurugram', 1200000000.00, 'Medium', '2024-03-18'),
('Trident Horizon Fund', 'Corporate VC', 'office@tridenthorizon.com', 'Hyderabad', 3000000000.00, 'Low', '2021-07-12'),
('Lotus Grid Capital', 'Family Office', 'portfolio@lotusgrid.in', 'Pune', 1800000000.00, 'Low', '2023-05-29'),
('Banyan Catalyst Partners', 'VC', 'hello@banyancatalyst.vc', 'Chennai', 2750000000.00, 'High', '2022-11-08');

INSERT INTO startups (
    sector_id,
    startup_name,
    city,
    state,
    founding_year,
    funding_stage,
    annual_revenue_inr,
    current_valuation_inr,
    employee_count,
    equity_committed_pct,
    website
) VALUES
((SELECT sector_id FROM sectors WHERE sector_name = 'Fintech'), 'RupeeRoute', 'Bengaluru', 'Karnataka', 2019, 'Series B', 980000000.00, 3200000000.00, 180, 9.75, 'https://rupeeroute.example'),
((SELECT sector_id FROM sectors WHERE sector_name = 'Fintech'), 'LedgerLeap', 'Mumbai', 'Maharashtra', 2020, 'Series A', 310000000.00, 1150000000.00, 95, 11.50, 'https://ledgerleap.example'),
((SELECT sector_id FROM sectors WHERE sector_name = 'Edtech'), 'LearnNest', 'Gurugram', 'Haryana', 2018, 'Series A', 420000000.00, 1450000000.00, 140, 9.50, 'https://learnnest.example'),
((SELECT sector_id FROM sectors WHERE sector_name = 'Healthtech'), 'MediMitra', 'Bengaluru', 'Karnataka', 2017, 'Series B', 760000000.00, 2400000000.00, 210, 9.00, 'https://medimitra.example'),
((SELECT sector_id FROM sectors WHERE sector_name = 'Logistics'), 'FleetMesh', 'Mumbai', 'Maharashtra', 2021, 'Seed', 160000000.00, 520000000.00, 70, 7.75, 'https://fleetmesh.example'),
((SELECT sector_id FROM sectors WHERE sector_name = 'ClimateTech'), 'CarbonLoop', 'Pune', 'Maharashtra', 2022, 'Seed', 110000000.00, 480000000.00, 55, 9.50, 'https://carbonloop.example'),
((SELECT sector_id FROM sectors WHERE sector_name = 'SaaS'), 'StackPilot', 'Bengaluru', 'Karnataka', 2020, 'Series A', 540000000.00, 1700000000.00, 125, 9.50, 'https://stackpilot.example');

INSERT INTO investments (
    investor_id,
    startup_id,
    funding_round,
    security_type,
    investment_date,
    invested_amount_inr,
    equity_percentage,
    post_money_valuation_inr,
    status
) VALUES
((SELECT investor_id FROM investors WHERE investor_name = 'Deccan Spark Ventures'), (SELECT startup_id FROM startups WHERE startup_name = 'RupeeRoute'), 'Series B', 'Equity', '2025-05-14', 180000000.00, 5.50, 3200000000.00, 'Active'),
((SELECT investor_id FROM investors WHERE investor_name = 'ArthaLeap Capital'), (SELECT startup_id FROM startups WHERE startup_name = 'RupeeRoute'), 'Series A', 'Equity', '2025-01-20', 120000000.00, 4.25, 2500000000.00, 'Active'),
((SELECT investor_id FROM investors WHERE investor_name = 'Monsoon Peak Ventures'), (SELECT startup_id FROM startups WHERE startup_name = 'LedgerLeap'), 'Seed', 'SAFE', '2025-08-11', 35000000.00, 5.00, 350000000.00, 'Active'),
((SELECT investor_id FROM investors WHERE investor_name = 'Deccan Spark Ventures'), (SELECT startup_id FROM startups WHERE startup_name = 'LedgerLeap'), 'Series A', 'Equity', '2026-02-05', 75000000.00, 6.50, 1150000000.00, 'Active'),
((SELECT investor_id FROM investors WHERE investor_name = 'Banyan Catalyst Partners'), (SELECT startup_id FROM startups WHERE startup_name = 'LearnNest'), 'Series A', 'Equity', '2025-06-18', 90000000.00, 7.00, 1450000000.00, 'Active'),
((SELECT investor_id FROM investors WHERE investor_name = 'ArthaLeap Capital'), (SELECT startup_id FROM startups WHERE startup_name = 'LearnNest'), 'Bridge', 'Convertible Note', '2026-03-03', 40000000.00, 2.50, 1600000000.00, 'Active'),
((SELECT investor_id FROM investors WHERE investor_name = 'Trident Horizon Fund'), (SELECT startup_id FROM startups WHERE startup_name = 'MediMitra'), 'Series B', 'Equity', '2025-09-22', 150000000.00, 5.00, 2400000000.00, 'Active'),
((SELECT investor_id FROM investors WHERE investor_name = 'Lotus Grid Capital'), (SELECT startup_id FROM startups WHERE startup_name = 'MediMitra'), 'Series A', 'Equity', '2025-04-12', 90000000.00, 4.00, 1800000000.00, 'Active'),
((SELECT investor_id FROM investors WHERE investor_name = 'Monsoon Peak Ventures'), (SELECT startup_id FROM startups WHERE startup_name = 'FleetMesh'), 'Seed', 'SAFE', '2025-11-08', 25000000.00, 4.50, 520000000.00, 'Active'),
((SELECT investor_id FROM investors WHERE investor_name = 'Lotus Grid Capital'), (SELECT startup_id FROM startups WHERE startup_name = 'FleetMesh'), 'Seed', 'Equity', '2026-04-02', 18000000.00, 3.25, 560000000.00, 'Active'),
((SELECT investor_id FROM investors WHERE investor_name = 'Banyan Catalyst Partners'), (SELECT startup_id FROM startups WHERE startup_name = 'CarbonLoop'), 'Seed', 'SAFE', '2025-12-14', 30000000.00, 5.50, 480000000.00, 'Active'),
((SELECT investor_id FROM investors WHERE investor_name = 'Trident Horizon Fund'), (SELECT startup_id FROM startups WHERE startup_name = 'CarbonLoop'), 'Seed', 'Equity', '2026-01-19', 22000000.00, 4.00, 520000000.00, 'Active'),
((SELECT investor_id FROM investors WHERE investor_name = 'Deccan Spark Ventures'), (SELECT startup_id FROM startups WHERE startup_name = 'StackPilot'), 'Series A', 'Equity', '2025-07-10', 85000000.00, 6.00, 1700000000.00, 'Active'),
((SELECT investor_id FROM investors WHERE investor_name = 'ArthaLeap Capital'), (SELECT startup_id FROM startups WHERE startup_name = 'StackPilot'), 'Seed', 'SAFE', '2025-10-27', 45000000.00, 3.50, 1200000000.00, 'Active');

INSERT INTO financial_metrics (
    startup_id,
    metric_month,
    revenue_inr,
    net_profit_inr,
    cash_reserve_inr,
    customer_count,
    mrr_inr,
    arr_inr,
    cac_inr,
    ltv_inr,
    burn_rate_inr,
    runway_months,
    churn_rate
) VALUES
((SELECT startup_id FROM startups WHERE startup_name = 'RupeeRoute'), '2025-11-01', 62000000.00, 6000000.00, 260000000.00, 86000, 58000000.00, 696000000.00, 3600.00, 19800.00, 12000000.00, 15.00, 2.60),
((SELECT startup_id FROM startups WHERE startup_name = 'RupeeRoute'), '2025-12-01', 68000000.00, 7000000.00, 268000000.00, 91000, 62000000.00, 744000000.00, 3500.00, 20500.00, 11000000.00, 15.80, 2.50),
((SELECT startup_id FROM startups WHERE startup_name = 'RupeeRoute'), '2026-01-01', 72000000.00, 8500000.00, 279000000.00, 96000, 66000000.00, 792000000.00, 3400.00, 21400.00, 10000000.00, 16.40, 2.30),
((SELECT startup_id FROM startups WHERE startup_name = 'RupeeRoute'), '2026-02-01', 78000000.00, 9800000.00, 292000000.00, 101000, 71000000.00, 852000000.00, 3350.00, 22100.00, 9000000.00, 17.00, 2.20),
((SELECT startup_id FROM startups WHERE startup_name = 'RupeeRoute'), '2026-03-01', 84000000.00, 11200000.00, 308000000.00, 107000, 76000000.00, 912000000.00, 3300.00, 22800.00, 8000000.00, 17.50, 2.00),
((SELECT startup_id FROM startups WHERE startup_name = 'RupeeRoute'), '2026-04-01', 89000000.00, 12600000.00, 326000000.00, 114000, 82000000.00, 984000000.00, 3200.00, 23600.00, 7000000.00, 18.20, 1.90),
((SELECT startup_id FROM startups WHERE startup_name = 'LedgerLeap'), '2025-11-01', 18000000.00, -2000000.00, 98000000.00, 24000, 17000000.00, 204000000.00, 4600.00, 16800.00, 14000000.00, 10.50, 4.50),
((SELECT startup_id FROM startups WHERE startup_name = 'LedgerLeap'), '2025-12-01', 20000000.00, -500000.00, 104000000.00, 26000, 18500000.00, 222000000.00, 4500.00, 17500.00, 13000000.00, 11.20, 4.20),
((SELECT startup_id FROM startups WHERE startup_name = 'LedgerLeap'), '2026-01-01', 22000000.00, 1000000.00, 111000000.00, 28000, 20500000.00, 246000000.00, 4400.00, 18200.00, 12000000.00, 12.00, 4.00),
((SELECT startup_id FROM startups WHERE startup_name = 'LedgerLeap'), '2026-02-01', 24000000.00, 1800000.00, 118000000.00, 31000, 22500000.00, 270000000.00, 4300.00, 18800.00, 11000000.00, 12.90, 3.80),
((SELECT startup_id FROM startups WHERE startup_name = 'LedgerLeap'), '2026-03-01', 27000000.00, 2600000.00, 126000000.00, 34000, 25000000.00, 300000000.00, 4250.00, 19300.00, 10000000.00, 13.60, 3.50),
((SELECT startup_id FROM startups WHERE startup_name = 'LedgerLeap'), '2026-04-01', 30000000.00, 3500000.00, 135000000.00, 37000, 28000000.00, 336000000.00, 4200.00, 19800.00, 9000000.00, 14.20, 3.20),
((SELECT startup_id FROM startups WHERE startup_name = 'LearnNest'), '2025-11-01', 26000000.00, 1000000.00, 150000000.00, 38000, 24000000.00, 288000000.00, 5900.00, 14500.00, 16000000.00, 9.50, 5.00),
((SELECT startup_id FROM startups WHERE startup_name = 'LearnNest'), '2025-12-01', 27500000.00, 1500000.00, 156000000.00, 40000, 25500000.00, 306000000.00, 5800.00, 14800.00, 15000000.00, 10.00, 4.80),
((SELECT startup_id FROM startups WHERE startup_name = 'LearnNest'), '2026-01-01', 29500000.00, 2000000.00, 162000000.00, 42000, 27000000.00, 324000000.00, 5700.00, 15200.00, 14000000.00, 10.40, 4.60),
((SELECT startup_id FROM startups WHERE startup_name = 'LearnNest'), '2026-02-01', 31500000.00, 2500000.00, 169000000.00, 45000, 29000000.00, 348000000.00, 5600.00, 15600.00, 13000000.00, 10.80, 4.40),
((SELECT startup_id FROM startups WHERE startup_name = 'LearnNest'), '2026-03-01', 33500000.00, 3000000.00, 176000000.00, 48000, 31000000.00, 372000000.00, 5500.00, 15900.00, 12000000.00, 11.10, 4.30),
((SELECT startup_id FROM startups WHERE startup_name = 'LearnNest'), '2026-04-01', 35500000.00, 3500000.00, 184000000.00, 51000, 33000000.00, 396000000.00, 5400.00, 16200.00, 11000000.00, 11.50, 4.10),
((SELECT startup_id FROM startups WHERE startup_name = 'MediMitra'), '2025-11-01', 44000000.00, -5000000.00, 210000000.00, 12000, 41000000.00, 492000000.00, 8200.00, 22500.00, 22000000.00, 6.50, 3.20),
((SELECT startup_id FROM startups WHERE startup_name = 'MediMitra'), '2025-12-01', 46000000.00, -4000000.00, 216000000.00, 12800, 43000000.00, 516000000.00, 8100.00, 23000.00, 21000000.00, 6.70, 3.00),
((SELECT startup_id FROM startups WHERE startup_name = 'MediMitra'), '2026-01-01', 48000000.00, -3000000.00, 221000000.00, 13600, 45000000.00, 540000000.00, 8000.00, 23500.00, 20000000.00, 7.00, 2.90),
((SELECT startup_id FROM startups WHERE startup_name = 'MediMitra'), '2026-02-01', 50000000.00, -2000000.00, 227000000.00, 14500, 47000000.00, 564000000.00, 7900.00, 24000.00, 19000000.00, 7.20, 2.70),
((SELECT startup_id FROM startups WHERE startup_name = 'MediMitra'), '2026-03-01', 53000000.00, -800000.00, 234000000.00, 15400, 50000000.00, 600000000.00, 7850.00, 24400.00, 18000000.00, 7.50, 2.50),
((SELECT startup_id FROM startups WHERE startup_name = 'MediMitra'), '2026-04-01', 56000000.00, 500000.00, 242000000.00, 16400, 53000000.00, 636000000.00, 7800.00, 24800.00, 17000000.00, 7.80, 2.30),
((SELECT startup_id FROM startups WHERE startup_name = 'FleetMesh'), '2025-11-01', 9000000.00, -6000000.00, 72000000.00, 4800, 8500000.00, 102000000.00, 6800.00, 10500.00, 15000000.00, 5.80, 7.60),
((SELECT startup_id FROM startups WHERE startup_name = 'FleetMesh'), '2025-12-01', 10000000.00, -5500000.00, 71000000.00, 5200, 9300000.00, 111600000.00, 6600.00, 11200.00, 14500000.00, 5.60, 7.40),
((SELECT startup_id FROM startups WHERE startup_name = 'FleetMesh'), '2026-01-01', 11000000.00, -5000000.00, 70000000.00, 5600, 10100000.00, 121200000.00, 6500.00, 11800.00, 14000000.00, 5.40, 7.20),
((SELECT startup_id FROM startups WHERE startup_name = 'FleetMesh'), '2026-02-01', 12000000.00, -4800000.00, 69000000.00, 6100, 10900000.00, 130800000.00, 6350.00, 12200.00, 13800000.00, 5.20, 7.00),
((SELECT startup_id FROM startups WHERE startup_name = 'FleetMesh'), '2026-03-01', 12500000.00, -4500000.00, 67500000.00, 6600, 11500000.00, 138000000.00, 6200.00, 12500.00, 13500000.00, 5.00, 6.90),
((SELECT startup_id FROM startups WHERE startup_name = 'FleetMesh'), '2026-04-01', 13500000.00, -4200000.00, 64000000.00, 7200, 12500000.00, 150000000.00, 6100.00, 12800.00, 13000000.00, 4.90, 6.80),
((SELECT startup_id FROM startups WHERE startup_name = 'CarbonLoop'), '2025-11-01', 7000000.00, -4500000.00, 78000000.00, 2100, 6500000.00, 78000000.00, 3600.00, 12600.00, 11500000.00, 5.20, 5.60),
((SELECT startup_id FROM startups WHERE startup_name = 'CarbonLoop'), '2025-12-01', 8000000.00, -4000000.00, 79000000.00, 2400, 7400000.00, 88800000.00, 3500.00, 13100.00, 11000000.00, 5.50, 5.40),
((SELECT startup_id FROM startups WHERE startup_name = 'CarbonLoop'), '2026-01-01', 9000000.00, -3500000.00, 80000000.00, 2700, 8300000.00, 99600000.00, 3425.00, 13600.00, 10500000.00, 5.70, 5.20),
((SELECT startup_id FROM startups WHERE startup_name = 'CarbonLoop'), '2026-02-01', 10000000.00, -3000000.00, 80500000.00, 3100, 9200000.00, 110400000.00, 3350.00, 14000.00, 10000000.00, 5.90, 5.00),
((SELECT startup_id FROM startups WHERE startup_name = 'CarbonLoop'), '2026-03-01', 11500000.00, -2500000.00, 81200000.00, 3500, 10500000.00, 126000000.00, 3275.00, 14250.00, 9500000.00, 6.00, 4.90),
((SELECT startup_id FROM startups WHERE startup_name = 'CarbonLoop'), '2026-04-01', 12200000.00, -2000000.00, 82000000.00, 3900, 11200000.00, 134400000.00, 3200.00, 14400.00, 9000000.00, 6.10, 4.80),
((SELECT startup_id FROM startups WHERE startup_name = 'StackPilot'), '2025-11-01', 30000000.00, 2000000.00, 165000000.00, 15000, 28000000.00, 336000000.00, 3100.00, 15800.00, 10000000.00, 13.80, 2.70),
((SELECT startup_id FROM startups WHERE startup_name = 'StackPilot'), '2025-12-01', 32000000.00, 2500000.00, 171000000.00, 16200, 30000000.00, 360000000.00, 3000.00, 16400.00, 9500000.00, 14.40, 2.50),
((SELECT startup_id FROM startups WHERE startup_name = 'StackPilot'), '2026-01-01', 35000000.00, 3500000.00, 178000000.00, 17600, 33000000.00, 396000000.00, 2950.00, 17000.00, 9000000.00, 15.00, 2.40),
((SELECT startup_id FROM startups WHERE startup_name = 'StackPilot'), '2026-02-01', 38000000.00, 4500000.00, 186000000.00, 19000, 36000000.00, 432000000.00, 2900.00, 17500.00, 8500000.00, 15.50, 2.30),
((SELECT startup_id FROM startups WHERE startup_name = 'StackPilot'), '2026-03-01', 41000000.00, 5500000.00, 195000000.00, 20500, 39000000.00, 468000000.00, 2850.00, 17900.00, 8000000.00, 16.10, 2.20),
((SELECT startup_id FROM startups WHERE startup_name = 'StackPilot'), '2026-04-01', 45000000.00, 6500000.00, 205000000.00, 22100, 43000000.00, 516000000.00, 2800.00, 18200.00, 7500000.00, 16.70, 2.10);

INSERT INTO market_data (startup_id, simulated_trend_value, competitor_score, market_date) VALUES
((SELECT startup_id FROM startups WHERE startup_name = 'RupeeRoute'), 84.00, 62.00, '2026-04-01'),
((SELECT startup_id FROM startups WHERE startup_name = 'LedgerLeap'), 76.00, 58.00, '2026-04-01'),
((SELECT startup_id FROM startups WHERE startup_name = 'LearnNest'), 68.00, 60.00, '2026-04-01'),
((SELECT startup_id FROM startups WHERE startup_name = 'MediMitra'), 71.00, 55.00, '2026-04-01'),
((SELECT startup_id FROM startups WHERE startup_name = 'FleetMesh'), 59.00, 72.00, '2026-04-01'),
((SELECT startup_id FROM startups WHERE startup_name = 'CarbonLoop'), 74.00, 49.00, '2026-04-01'),
((SELECT startup_id FROM startups WHERE startup_name = 'StackPilot'), 81.00, 57.00, '2026-04-01');

INSERT INTO partnerships (startup_id, partner_name, deal_type, impact_score, announced_date) VALUES
((SELECT startup_id FROM startups WHERE startup_name = 'RupeeRoute'), 'State Bank of India', 'LOI', 8.80, '2026-03-15'),
((SELECT startup_id FROM startups WHERE startup_name = 'RupeeRoute'), 'HDFC Bank', 'Pilot', 9.10, '2026-04-05'),
((SELECT startup_id FROM startups WHERE startup_name = 'LedgerLeap'), 'ICICI Bank', 'Pilot', 7.90, '2026-02-12'),
((SELECT startup_id FROM startups WHERE startup_name = 'LearnNest'), 'Delhi Public School Network', 'LOI', 8.00, '2026-01-22'),
((SELECT startup_id FROM startups WHERE startup_name = 'LearnNest'), 'Skill India Mission Partner', 'Pilot', 7.60, '2026-03-09'),
((SELECT startup_id FROM startups WHERE startup_name = 'MediMitra'), 'Apollo Clinics', 'Pilot', 8.70, '2026-02-26'),
((SELECT startup_id FROM startups WHERE startup_name = 'FleetMesh'), 'Blue Dart', 'Pilot', 6.80, '2026-04-08'),
((SELECT startup_id FROM startups WHERE startup_name = 'CarbonLoop'), 'Tata Power Distribution', 'LOI', 8.40, '2026-03-28'),
((SELECT startup_id FROM startups WHERE startup_name = 'StackPilot'), 'Zoho Marketplace', 'Pilot', 7.60, '2026-04-03');

INSERT INTO risk_analysis (investment_id, risk_score, factors, assessment_date) VALUES
((SELECT investment_id FROM investments WHERE startup_id = (SELECT startup_id FROM startups WHERE startup_name = 'RupeeRoute') AND investor_id = (SELECT investor_id FROM investors WHERE investor_name = 'Deccan Spark Ventures')), 28.00, 'Strong payback profile, healthy runway, low churn.', '2026-04-15'),
((SELECT investment_id FROM investments WHERE startup_id = (SELECT startup_id FROM startups WHERE startup_name = 'RupeeRoute') AND investor_id = (SELECT investor_id FROM investors WHERE investor_name = 'ArthaLeap Capital')), 31.00, 'Execution risk exists, but retention and margins are improving.', '2026-04-15'),
((SELECT investment_id FROM investments WHERE startup_id = (SELECT startup_id FROM startups WHERE startup_name = 'LedgerLeap') AND investor_id = (SELECT investor_id FROM investors WHERE investor_name = 'Monsoon Peak Ventures')), 42.00, 'Still scaling credit quality and collections operations.', '2026-04-15'),
((SELECT investment_id FROM investments WHERE startup_id = (SELECT startup_id FROM startups WHERE startup_name = 'LedgerLeap') AND investor_id = (SELECT investor_id FROM investors WHERE investor_name = 'Deccan Spark Ventures')), 36.00, 'Strong Series A momentum with improving profitability.', '2026-04-15'),
((SELECT investment_id FROM investments WHERE startup_id = (SELECT startup_id FROM startups WHERE startup_name = 'LearnNest') AND investor_id = (SELECT investor_id FROM investors WHERE investor_name = 'Banyan Catalyst Partners')), 38.00, 'Steady monetization and moderate customer concentration.', '2026-04-15'),
((SELECT investment_id FROM investments WHERE startup_id = (SELECT startup_id FROM startups WHERE startup_name = 'LearnNest') AND investor_id = (SELECT investor_id FROM investors WHERE investor_name = 'ArthaLeap Capital')), 41.00, 'Bridge capital improves runway, but growth pace remains moderate.', '2026-04-15'),
((SELECT investment_id FROM investments WHERE startup_id = (SELECT startup_id FROM startups WHERE startup_name = 'MediMitra') AND investor_id = (SELECT investor_id FROM investors WHERE investor_name = 'Trident Horizon Fund')), 47.00, 'Regulatory cycle and clinical onboarding keep execution complexity elevated.', '2026-04-15'),
((SELECT investment_id FROM investments WHERE startup_id = (SELECT startup_id FROM startups WHERE startup_name = 'MediMitra') AND investor_id = (SELECT investor_id FROM investors WHERE investor_name = 'Lotus Grid Capital')), 45.00, 'Care delivery model is scaling, but cash conversion is still maturing.', '2026-04-15'),
((SELECT investment_id FROM investments WHERE startup_id = (SELECT startup_id FROM startups WHERE startup_name = 'FleetMesh') AND investor_id = (SELECT investor_id FROM investors WHERE investor_name = 'Monsoon Peak Ventures')), 72.00, 'Short runway, high churn, and pricing pressure from larger incumbents.', '2026-04-15'),
((SELECT investment_id FROM investments WHERE startup_id = (SELECT startup_id FROM startups WHERE startup_name = 'FleetMesh') AND investor_id = (SELECT investor_id FROM investors WHERE investor_name = 'Lotus Grid Capital')), 74.00, 'Last-mile economics need improvement before the next institutional round.', '2026-04-15'),
((SELECT investment_id FROM investments WHERE startup_id = (SELECT startup_id FROM startups WHERE startup_name = 'CarbonLoop') AND investor_id = (SELECT investor_id FROM investors WHERE investor_name = 'Banyan Catalyst Partners')), 58.00, 'Promising climate tailwinds, but hardware deployment cycles remain slow.', '2026-04-15'),
((SELECT investment_id FROM investments WHERE startup_id = (SELECT startup_id FROM startups WHERE startup_name = 'CarbonLoop') AND investor_id = (SELECT investor_id FROM investors WHERE investor_name = 'Trident Horizon Fund')), 55.00, 'Commercial pipeline looks healthy, though installation risk persists.', '2026-04-15'),
((SELECT investment_id FROM investments WHERE startup_id = (SELECT startup_id FROM startups WHERE startup_name = 'StackPilot') AND investor_id = (SELECT investor_id FROM investors WHERE investor_name = 'Deccan Spark Ventures')), 29.00, 'Low churn, attractive CAC, and strong product-led expansion.', '2026-04-15'),
((SELECT investment_id FROM investments WHERE startup_id = (SELECT startup_id FROM startups WHERE startup_name = 'StackPilot') AND investor_id = (SELECT investor_id FROM investors WHERE investor_name = 'ArthaLeap Capital')), 33.00, 'Healthy enterprise pipeline with manageable support burden.', '2026-04-15');

CREATE OR REPLACE VIEW vw_TopStartups AS
SELECT
    s.startup_id,
    s.startup_name,
    sec.sector_name,
    s.funding_stage,
    fm.metric_month,
    fm.ltv_inr,
    fm.cac_inr,
    ROUND(fm.ltv_inr / NULLIF(fm.cac_inr, 0), 2) AS ltv_cac_ratio,
    fm.runway_months,
    COALESCE(rs.latest_risk_score, 50) AS risk_score
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
LEFT JOIN (
    SELECT
        i.startup_id,
        AVG(ra.risk_score) AS latest_risk_score
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
) rs
    ON rs.startup_id = s.startup_id
WHERE fm.cac_inr > 0
  AND (fm.ltv_inr / NULLIF(fm.cac_inr, 0)) >= 3.00;

CREATE OR REPLACE VIEW vw_HighRiskAlerts AS
SELECT
    s.startup_id,
    s.startup_name,
    sec.sector_name,
    fm.metric_month,
    fm.runway_months,
    fm.burn_rate_inr,
    fm.churn_rate,
    COALESCE(rs.latest_risk_score, 50) AS risk_score,
    md.competitor_score
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
LEFT JOIN market_data md
    ON md.market_id = (
        SELECT md2.market_id
        FROM market_data md2
        WHERE md2.startup_id = s.startup_id
        ORDER BY md2.market_date DESC
        LIMIT 1
    )
LEFT JOIN (
    SELECT
        i.startup_id,
        AVG(ra.risk_score) AS latest_risk_score
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
) rs
    ON rs.startup_id = s.startup_id
WHERE fm.runway_months < 6.00;

UPDATE startups s
SET s.equity_committed_pct = (
    SELECT COALESCE(SUM(i.equity_percentage), 0)
    FROM investments i
    WHERE i.startup_id = s.startup_id
      AND i.status = 'Active'
);
