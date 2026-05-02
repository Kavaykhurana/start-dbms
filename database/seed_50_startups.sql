USE startup_investment_system;

-- Run this after mysql_startup_investment_system.sql.
-- It expands the demo database from the base sample to 50 Indian startup records.

INSERT IGNORE INTO sectors (sector_name, sector_description, base_risk_score) VALUES
('Agritech', 'Farm operations, FPO enablement, crop intelligence, and agri-marketplace platforms.', 52),
('AI/ML', 'Applied artificial intelligence products for enterprise automation and analytics.', 38),
('Biotech', 'Wet-lab, genomics, synthetic biology, and diagnostic workflow companies.', 63),
('Cybersecurity', 'Identity, zero-trust, compliance, and security operations products.', 34),
('Dronetech', 'Drone services, drone data, inspection, and agriculture spraying platforms.', 55),
('Ecommerce', 'Commerce enablement, marketplace infrastructure, and D2C operating systems.', 56),
('Energy', 'Clean-energy software, demand response, and grid analytics companies.', 40),
('Foodtech', 'Food supply-chain, cloud kitchen, and corporate food operating platforms.', 58),
('Gaming', 'Mobile gaming, creator tournaments, and digital entertainment platforms.', 61),
('HRTech', 'Hiring, workforce analytics, employee experience, and assessment products.', 43),
('Insurtech', 'Embedded insurance, renewal intelligence, and SME insurance platforms.', 42),
('LegalTech', 'Contract lifecycle, legal automation, and compliance workflow products.', 40),
('MediaTech', 'Creator tooling, AI video, marketing production, and media workflow platforms.', 51),
('Mobility', 'EV fleet, charging, route intelligence, and urban mobility operating systems.', 48),
('Proptech', 'Rental, property management, tenant verification, and real-estate workflows.', 54),
('Robotics', 'Warehouse, industrial, and service robotics systems with software orchestration.', 59),
('SpaceTech', 'Satellite data, geospatial analytics, and space-infrastructure products.', 57);

CREATE TEMPORARY TABLE extended_startup_seed (
    startup_name VARCHAR(120) NOT NULL,
    sector_name VARCHAR(60) NOT NULL,
    city VARCHAR(80) NOT NULL,
    state_name VARCHAR(80) NOT NULL,
    founding_year SMALLINT UNSIGNED NOT NULL,
    funding_stage VARCHAR(20) NOT NULL,
    annual_revenue_cr DECIMAL(10,2) NOT NULL,
    valuation_cr DECIMAL(10,2) NOT NULL,
    employee_count INT UNSIGNED NOT NULL,
    investor_name VARCHAR(120) NOT NULL,
    security_type VARCHAR(30) NOT NULL,
    investment_date DATE NOT NULL,
    funding_cr DECIMAL(10,2) NOT NULL,
    equity_pct DECIMAL(5,2) NOT NULL,
    revenue_nov_cr DECIMAL(10,2) NOT NULL,
    revenue_dec_cr DECIMAL(10,2) NOT NULL,
    revenue_jan_cr DECIMAL(10,2) NOT NULL,
    revenue_feb_cr DECIMAL(10,2) NOT NULL,
    revenue_mar_cr DECIMAL(10,2) NOT NULL,
    revenue_apr_cr DECIMAL(10,2) NOT NULL,
    net_profit_cr DECIMAL(10,2) NOT NULL,
    cash_cr DECIMAL(10,2) NOT NULL,
    customer_count INT UNSIGNED NOT NULL,
    cac_inr DECIMAL(12,2) NOT NULL,
    ltv_inr DECIMAL(12,2) NOT NULL,
    burn_cr DECIMAL(10,2) NOT NULL,
    runway_months DECIMAL(5,2) NOT NULL,
    churn_rate DECIMAL(5,2) NOT NULL,
    trend_value DECIMAL(5,2) NOT NULL,
    competitor_score DECIMAL(5,2) NOT NULL,
    partner_name VARCHAR(140) NOT NULL,
    deal_type VARCHAR(10) NOT NULL,
    impact_score DECIMAL(5,2) NOT NULL,
    risk_score DECIMAL(5,2) NOT NULL,
    risk_factors VARCHAR(500) NOT NULL
);

INSERT INTO extended_startup_seed (
    startup_name, sector_name, city, state_name, founding_year, funding_stage,
    annual_revenue_cr, valuation_cr, employee_count, investor_name, security_type,
    investment_date, funding_cr, equity_pct, revenue_nov_cr, revenue_dec_cr,
    revenue_jan_cr, revenue_feb_cr, revenue_mar_cr, revenue_apr_cr, net_profit_cr,
    cash_cr, customer_count, cac_inr, ltv_inr, burn_cr, runway_months, churn_rate,
    trend_value, competitor_score, partner_name, deal_type, impact_score, risk_score,
    risk_factors
) VALUES
('AgriPulse','Agritech','Nashik','Maharashtra',2021,'Seed',12.96,39.00,48,'Deccan Spark Ventures','SAFE','2025-01-16',3.60,9.23,0.47,0.52,0.65,0.71,0.87,1.08,0.56,3.60,18200,1900.00,9300.00,0.52,8.80,5.20,66.00,53.00,'Mahindra Agri Solutions','LOI',7.70,52.00,'Medium risk: runway 8.8 months, churn 5.2%, competitor score 53/100.'),
('SecureAuth','Cybersecurity','Hyderabad','Telangana',2020,'Series A',27.60,92.00,88,'ArthaLeap Capital','SAFE','2025-02-19',9.50,10.33,1.08,1.34,1.63,1.73,2.04,2.30,1.48,9.50,860,7600.00,45200.00,0.82,13.40,1.60,79.00,48.00,'NPCI Partner Program','Pilot',8.20,34.00,'Low risk: runway 13.4 months, churn 1.6%, competitor score 48/100.'),
('BazaarBridge','Ecommerce','Jaipur','Rajasthan',2022,'Seed',20.16,61.00,82,'Monsoon Peak Ventures','SAFE','2025-03-22',5.80,9.51,0.84,1.04,1.11,1.26,1.41,1.68,0.72,5.80,24800,2600.00,9800.00,0.96,5.70,7.10,63.00,68.00,'IndiaMART Seller Network','LOI',6.90,62.00,'Medium risk: runway 5.7 months, churn 7.1%, competitor score 68/100.'),
('InsureVista','Insurtech','Mumbai','Maharashtra',2020,'Series A',34.44,104.00,104,'Trident Horizon Fund','Equity','2025-04-25',11.80,11.35,1.44,1.65,1.91,2.17,2.53,2.87,2.00,11.80,42000,3900.00,21000.00,0.87,12.60,2.80,72.00,54.00,'Bajaj Allianz','Pilot',8.00,37.00,'Medium risk: runway 12.6 months, churn 2.8%, competitor score 54/100.'),
('PayKart','Fintech','Chennai','Tamil Nadu',2023,'Seed',14.52,43.00,42,'Lotus Grid Capital','SAFE','2025-05-10',4.10,9.53,0.56,0.67,0.80,0.92,1.08,1.21,0.60,4.10,53000,1700.00,7600.00,0.61,7.20,5.90,70.00,64.00,'Federal Bank','LOI',7.20,58.00,'Medium risk: runway 7.2 months, churn 5.9%, competitor score 64/100.'),
('DroneKart','Dronetech','Noida','Uttar Pradesh',2021,'Series A',26.28,76.00,118,'Banyan Catalyst Partners','Convertible Note','2025-06-13',8.80,11.58,1.26,1.41,1.52,1.71,1.87,2.19,1.01,8.80,1320,9400.00,31200.00,1.18,8.10,3.60,69.00,59.00,'Adani Green Field Ops','Pilot',7.80,49.00,'Medium risk: runway 8.1 months, churn 3.6%, competitor score 59/100.'),
('BioBloom','Biotech','Hyderabad','Telangana',2022,'Seed',10.68,58.00,64,'Deccan Spark Ventures','SAFE','2025-07-16',6.40,11.03,0.45,0.46,0.51,0.61,0.69,0.89,-0.53,6.40,34,18500.00,54500.00,1.42,5.20,4.40,62.00,46.00,'CCMB Incubator','LOI',7.40,67.00,'High risk: runway 5.2 months, churn 4.4%, competitor score 46/100.'),
('SkillSprint','Edtech','Bengaluru','Karnataka',2023,'Seed',10.92,35.00,38,'ArthaLeap Capital','SAFE','2025-08-19',3.00,8.57,0.40,0.45,0.54,0.64,0.78,0.91,0.48,3.00,16400,2100.00,8200.00,0.43,9.30,5.50,65.00,61.00,'NASSCOM FutureSkills','Pilot',7.50,51.00,'Medium risk: runway 9.3 months, churn 5.5%, competitor score 61/100.'),
('Warewise','Logistics','Delhi','Delhi',2020,'Series A',30.84,98.00,112,'Monsoon Peak Ventures','Convertible Note','2025-09-22',10.40,10.61,1.32,1.54,1.69,1.94,2.13,2.57,1.81,10.40,6700,5200.00,24800.00,0.76,12.10,2.90,73.00,56.00,'Delhivery Fulfillment','Pilot',8.10,41.00,'Medium risk: runway 12.1 months, churn 2.9%, competitor score 56/100.'),
('GreenGrid','Energy','Ahmedabad','Gujarat',2019,'Series B',60.60,210.00,176,'Trident Horizon Fund','Equity','2025-10-25',22.00,10.48,2.85,3.00,3.39,3.99,4.31,5.05,3.52,22.00,720,11800.00,61800.00,1.53,15.50,1.80,77.00,51.00,'Torrent Power','Pilot',8.60,35.00,'Low risk: runway 15.5 months, churn 1.8%, competitor score 51/100.'),
('CloudKirana','SaaS','Gurugram','Haryana',2023,'Seed',13.44,47.00,46,'Lotus Grid Capital','SAFE','2025-11-10',3.90,8.30,0.49,0.60,0.73,0.87,0.99,1.12,0.62,3.90,31500,1500.00,7900.00,0.50,8.40,6.10,75.00,60.00,'Metro Cash & Carry','LOI',7.30,54.00,'Medium risk: runway 8.4 months, churn 6.1%, competitor score 60/100.'),
('FarmLinker','Agritech','Lucknow','Uttar Pradesh',2021,'Series A',25.20,82.00,76,'Banyan Catalyst Partners','Convertible Note','2025-12-13',9.50,11.59,1.14,1.21,1.42,1.51,1.76,2.10,1.48,9.50,28600,2300.00,11800.00,0.62,10.80,4.60,72.00,52.00,'IFFCO Kisan','Pilot',7.80,44.00,'Medium risk: runway 10.8 months, churn 4.6%, competitor score 52/100.'),
('CreditSutra','Fintech','Ahmedabad','Gujarat',2020,'Series A',40.80,136.00,104,'Deccan Spark Ventures','Equity','2025-01-16',14.00,10.29,1.60,1.90,2.25,2.61,3.02,3.40,2.58,14.00,46000,3600.00,20700.00,0.82,14.90,2.90,78.00,61.00,'Axis Bank','Pilot',8.20,38.00,'Medium risk: runway 14.9 months, churn 2.9%, competitor score 61/100.'),
('TutorHive','Edtech','Pune','Maharashtra',2022,'Seed',11.04,44.00,42,'ArthaLeap Capital','SAFE','2025-02-19',4.80,10.91,0.42,0.48,0.56,0.66,0.79,0.92,0.51,4.80,14200,2900.00,10400.00,0.41,8.20,5.80,64.00,66.00,'Allen Career Partner Network','LOI',7.10,57.00,'Medium risk: runway 8.2 months, churn 5.8%, competitor score 66/100.'),
('MedGenomeX','Biotech','Bengaluru','Karnataka',2019,'Series A',32.40,168.00,132,'Monsoon Peak Ventures','Convertible Note','2025-03-22',18.00,10.71,1.50,1.55,1.66,1.93,2.15,2.70,1.42,18.00,420,14500.00,52600.00,1.28,9.60,3.40,70.00,47.00,'Narayana Health Labs','Pilot',8.50,48.00,'Medium risk: runway 9.6 months, churn 3.4%, competitor score 47/100.'),
('CityCharge','Mobility','Delhi','Delhi',2022,'Seed',14.16,68.00,58,'Trident Horizon Fund','SAFE','2025-04-25',7.20,10.59,0.50,0.57,0.68,0.81,0.99,1.18,0.44,7.20,9400,3100.00,14200.00,0.74,7.40,4.90,80.00,58.00,'Tata Power EV Charging','LOI',8.10,53.00,'Medium risk: runway 7.4 months, churn 4.9%, competitor score 58/100.'),
('SolarSetu','Energy','Jaipur','Rajasthan',2020,'Series A',50.40,150.00,116,'Lotus Grid Capital','SAFE','2025-05-10',16.00,10.67,1.89,2.05,2.45,3.10,3.42,4.20,3.28,16.00,1650,8200.00,44800.00,0.92,16.10,1.90,79.00,50.00,'Rajasthan Renewable Energy Corp','Pilot',8.30,36.00,'Medium risk: runway 16.1 months, churn 1.9%, competitor score 50/100.'),
('HireOrbit','HRTech','Noida','Uttar Pradesh',2023,'Seed',10.08,39.00,34,'Banyan Catalyst Partners','SAFE','2025-06-13',3.60,9.23,0.34,0.42,0.52,0.59,0.72,0.84,0.50,3.60,18800,1800.00,9900.00,0.34,9.70,4.20,73.00,59.00,'TeamLease Digital','Pilot',7.40,50.00,'Medium risk: runway 9.7 months, churn 4.2%, competitor score 59/100.'),
('LegalMind','LegalTech','Bengaluru','Karnataka',2022,'Seed',12.60,52.00,44,'Deccan Spark Ventures','SAFE','2025-07-16',5.10,9.81,0.39,0.47,0.59,0.75,0.90,1.05,0.57,5.10,610,4200.00,22800.00,0.48,11.30,2.70,71.00,54.00,'Cyril Amarchand Innovation Lab','LOI',7.90,43.00,'Medium risk: runway 11.3 months, churn 2.7%, competitor score 54/100.'),
('HomeHarbor','Proptech','Mumbai','Maharashtra',2020,'Series A',33.60,118.00,92,'ArthaLeap Capital','SAFE','2025-08-19',12.00,10.17,1.54,1.70,1.82,2.06,2.44,2.80,1.92,12.00,7600,5100.00,21800.00,0.88,10.60,3.80,69.00,63.00,'Godrej Properties Channel Partner','Pilot',7.20,47.00,'Medium risk: runway 10.6 months, churn 3.8%, competitor score 63/100.'),
('FoodSaathi','Foodtech','Hyderabad','Telangana',2022,'Seed',11.76,36.00,40,'Monsoon Peak Ventures','SAFE','2025-09-22',3.80,10.56,0.48,0.58,0.60,0.74,0.83,0.98,0.46,3.80,12500,2400.00,8600.00,0.52,6.20,7.50,67.00,70.00,'Swiggy Minis Partner Program','LOI',6.90,61.00,'Medium risk: runway 6.2 months, churn 7.5%, competitor score 70/100.'),
('GameGrid','Gaming','Pune','Maharashtra',2023,'Seed',14.64,58.00,51,'Trident Horizon Fund','SAFE','2025-10-25',6.00,10.34,0.56,0.76,0.73,0.95,1.03,1.22,0.65,6.00,280000,900.00,3400.00,0.57,8.00,8.40,76.00,73.00,'JioGames','Pilot',7.00,59.00,'Medium risk: runway 8.0 months, churn 8.4%, competitor score 73/100.'),
('VaaniAI','AI/ML','Chennai','Tamil Nadu',2021,'Series A',61.20,190.00,128,'Lotus Grid Capital','SAFE','2025-11-10',20.00,10.53,2.29,2.66,3.39,3.81,4.60,5.10,3.92,20.00,1400,6200.00,39200.00,1.18,15.80,1.80,86.00,57.00,'Freshworks Marketplace','Pilot',8.50,32.00,'Low risk: runway 15.8 months, churn 1.8%, competitor score 57/100.'),
('SpaceKart','SpaceTech','Ahmedabad','Gujarat',2020,'Series A',43.20,210.00,142,'Banyan Catalyst Partners','Convertible Note','2025-12-13',22.00,10.48,1.73,1.79,2.06,2.50,2.79,3.60,2.18,22.00,320,13200.00,68200.00,1.42,13.20,2.40,82.00,44.00,'ISRO IN-SPACe Incubation','LOI',8.60,41.00,'Medium risk: runway 13.2 months, churn 2.4%, competitor score 44/100.'),
('RoboWorks','Robotics','Coimbatore','Tamil Nadu',2022,'Seed',12.48,76.00,68,'Deccan Spark Ventures','SAFE','2025-01-16',8.00,10.53,0.44,0.47,0.59,0.64,0.83,1.04,0.08,8.00,84,14800.00,50600.00,0.96,7.90,3.10,74.00,55.00,'TVS Supply Chain','Pilot',8.10,56.00,'Medium risk: runway 7.9 months, churn 3.1%, competitor score 55/100.'),
('SupplySense','Logistics','Kolkata','West Bengal',2020,'Series A',30.60,104.00,92,'ArthaLeap Capital','SAFE','2025-02-19',11.00,10.58,1.33,1.55,1.69,1.94,2.12,2.55,1.80,11.00,5800,5200.00,23800.00,0.75,12.40,3.30,71.00,58.00,'TCI Express','Pilot',7.60,45.00,'Medium risk: runway 12.4 months, churn 3.3%, competitor score 58/100.'),
('TrustVault','Cybersecurity','Gurugram','Haryana',2019,'Series B',86.40,260.00,168,'Monsoon Peak Ventures','Convertible Note','2025-03-22',28.00,10.77,4.03,4.72,5.46,5.72,6.54,7.20,6.15,28.00,540,9200.00,61200.00,1.05,18.90,1.40,84.00,49.00,'Microsoft for Startups','Pilot',8.80,28.00,'Low risk: runway 18.9 months, churn 1.4%, competitor score 49/100.'),
('D2CFlow','Ecommerce','Bengaluru','Karnataka',2021,'Series A',37.20,126.00,98,'Trident Horizon Fund','Equity','2025-04-25',13.00,10.32,1.57,1.94,2.06,2.33,2.61,3.10,2.24,13.00,19800,3100.00,15600.00,0.86,12.80,4.10,77.00,62.00,'Shiprocket Partner Network','Pilot',7.70,42.00,'Medium risk: runway 12.8 months, churn 4.1%, competitor score 62/100.'),
('PolicyPulse','Insurtech','Mumbai','Maharashtra',2022,'Seed',10.80,42.00,36,'Lotus Grid Capital','SAFE','2025-05-10',4.20,10.00,0.36,0.44,0.54,0.64,0.77,0.90,0.52,4.20,9200,2800.00,14600.00,0.38,10.20,3.50,69.00,51.00,'HDFC ERGO','LOI',7.50,46.00,'Medium risk: runway 10.2 months, churn 3.5%, competitor score 51/100.'),
('CloudDesk','SaaS','Chennai','Tamil Nadu',2020,'Series A',45.60,142.00,112,'Banyan Catalyst Partners','Convertible Note','2025-06-13',14.50,10.21,1.71,2.08,2.51,2.94,3.39,3.80,3.12,14.50,15600,2700.00,17800.00,0.68,17.40,2.20,75.00,56.00,'Freshservice Marketplace','Pilot',7.80,34.00,'Low risk: runway 17.4 months, churn 2.2%, competitor score 56/100.'),
('WasteWise','ClimateTech','Indore','Madhya Pradesh',2022,'Seed',10.32,46.00,48,'Deccan Spark Ventures','SAFE','2025-07-16',4.90,10.65,0.36,0.41,0.52,0.59,0.72,0.86,0.40,4.90,1260,3900.00,17400.00,0.46,8.70,4.70,73.00,48.00,'Indore Municipal Corporation','Pilot',8.20,52.00,'Medium risk: runway 8.7 months, churn 4.7%, competitor score 48/100.'),
('DroneField','Dronetech','Nagpur','Maharashtra',2023,'Seed',8.16,34.00,38,'ArthaLeap Capital','SAFE','2025-08-19',3.20,9.41,0.32,0.37,0.42,0.49,0.56,0.68,0.24,3.20,980,6200.00,18800.00,0.44,6.80,5.30,68.00,60.00,'Krishi Vigyan Kendra Nagpur','LOI',7.10,60.00,'Medium risk: runway 6.8 months, churn 5.3%, competitor score 60/100.'),
('PharmaLink','Healthtech','Hyderabad','Telangana',2020,'Series A',34.80,122.00,96,'Monsoon Peak Ventures','Convertible Note','2025-09-22',12.80,10.49,1.41,1.53,1.76,2.13,2.44,2.90,2.12,12.80,6200,5600.00,26300.00,0.78,13.60,2.60,76.00,54.00,'Apollo Pharmacy','Pilot',8.10,40.00,'Medium risk: runway 13.6 months, churn 2.6%, competitor score 54/100.'),
('BharatLedger','Fintech','Surat','Gujarat',2023,'Seed',11.52,48.00,40,'Trident Horizon Fund','SAFE','2025-10-25',4.50,9.38,0.41,0.51,0.61,0.72,0.84,0.96,0.56,4.50,54000,1250.00,6900.00,0.40,8.60,5.10,74.00,64.00,'Bank of Baroda MSME Cell','LOI',7.40,55.00,'Medium risk: runway 8.6 months, churn 5.1%, competitor score 64/100.'),
('LearnLoop','Edtech','Jaipur','Rajasthan',2022,'Seed',9.84,40.00,36,'Lotus Grid Capital','SAFE','2025-11-10',3.90,9.75,0.35,0.40,0.48,0.57,0.70,0.82,0.46,3.90,11800,1900.00,9800.00,0.36,9.40,4.80,66.00,57.00,'Rajasthan Private Schools Association','Pilot',7.60,49.00,'Medium risk: runway 9.4 months, churn 4.8%, competitor score 57/100.'),
('BioTrace','Biotech','Pune','Maharashtra',2022,'Seed',11.40,55.00,52,'Banyan Catalyst Partners','SAFE','2025-12-13',5.60,10.18,0.44,0.46,0.50,0.62,0.71,0.95,0.24,5.60,540,7600.00,24600.00,0.71,7.10,4.00,65.00,50.00,'Thyrocare Integration Lab','LOI',7.70,58.00,'Medium risk: runway 7.1 months, churn 4.0%, competitor score 50/100.'),
('EVFleet','Mobility','Bengaluru','Karnataka',2020,'Series A',55.20,178.00,138,'Deccan Spark Ventures','Equity','2025-01-16',18.50,10.39,2.13,2.37,2.77,3.24,3.91,4.60,3.35,18.50,2100,10800.00,57800.00,1.25,14.50,2.50,83.00,59.00,'Ather Energy Fleet Program','Pilot',8.40,39.00,'Medium risk: runway 14.5 months, churn 2.5%, competitor score 59/100.'),
('GridMitra','Energy','Kochi','Kerala',2022,'Seed',10.56,49.00,43,'ArthaLeap Capital','SAFE','2025-02-19',5.20,10.61,0.34,0.37,0.47,0.62,0.69,0.88,0.46,5.20,8400,4600.00,22800.00,0.42,11.10,2.90,72.00,45.00,'KSEB Innovation Cell','LOI',7.90,46.00,'Medium risk: runway 11.1 months, churn 2.9%, competitor score 45/100.'),
('PeopleCraft','HRTech','Gurugram','Haryana',2021,'Series A',29.40,96.00,84,'Monsoon Peak Ventures','Convertible Note','2025-03-22',10.50,10.94,1.17,1.38,1.62,1.80,2.13,2.45,1.79,10.50,9800,3400.00,21800.00,0.66,15.20,2.30,70.00,53.00,'Darwinbox Marketplace','Pilot',7.80,37.00,'Medium risk: runway 15.2 months, churn 2.3%, competitor score 53/100.'),
('ContractIQ','LegalTech','Delhi','Delhi',2020,'Series A',31.80,112.00,88,'Trident Horizon Fund','Equity','2025-04-25',11.80,10.54,1.21,1.38,1.65,1.98,2.32,2.65,1.93,11.80,760,5800.00,35400.00,0.72,16.00,1.90,74.00,52.00,'NASSCOM Legal Innovation Forum','Pilot',8.00,35.00,'Medium risk: runway 16.0 months, churn 1.9%, competitor score 52/100.'),
('RentNest','Proptech','Pune','Maharashtra',2023,'Seed',8.76,32.00,29,'Lotus Grid Capital','SAFE','2025-05-10',3.40,10.63,0.35,0.40,0.44,0.52,0.62,0.73,0.34,3.40,19200,2200.00,7600.00,0.39,6.50,6.90,68.00,67.00,'NoBroker Partner Network','LOI',6.80,63.00,'Medium risk: runway 6.5 months, churn 6.9%, competitor score 67/100.'),
('MealMint','Foodtech','Mumbai','Maharashtra',2021,'Series A',27.00,86.00,78,'Banyan Catalyst Partners','Convertible Note','2025-06-13',8.90,10.35,1.17,1.37,1.44,1.72,1.93,2.25,1.65,8.90,36000,2600.00,13400.00,0.60,12.60,3.70,71.00,58.00,'Sodexo India Partner Network','Pilot',7.50,43.00,'Medium risk: runway 12.6 months, churn 3.7%, competitor score 58/100.'),
('RenderRush','MediaTech','Hyderabad','Telangana',2023,'Seed',12.24,46.00,37,'Deccan Spark Ventures','SAFE','2025-07-16',4.70,10.22,0.42,0.58,0.63,0.68,0.89,1.02,0.59,4.70,12600,1700.00,9400.00,0.43,9.10,5.20,78.00,65.00,'T-Hub Media Lab','LOI',7.60,51.00,'Medium risk: runway 9.1 months, churn 5.2%, competitor score 65/100.');

INSERT INTO startups (
    sector_id, startup_name, city, state, founding_year, funding_stage,
    annual_revenue_inr, current_valuation_inr, employee_count, equity_committed_pct, website
)
SELECT
    sec.sector_id,
    seed.startup_name,
    seed.city,
    seed.state_name,
    seed.founding_year,
    seed.funding_stage,
    seed.annual_revenue_cr * 10000000,
    seed.valuation_cr * 10000000,
    seed.employee_count,
    seed.equity_pct,
    CONCAT('https://', LOWER(REPLACE(seed.startup_name, ' ', '')), '.example')
FROM extended_startup_seed seed
JOIN sectors sec ON sec.sector_name = seed.sector_name
WHERE NOT EXISTS (
    SELECT 1 FROM startups s WHERE s.startup_name = seed.startup_name
);

INSERT INTO investments (
    investor_id, startup_id, funding_round, security_type, investment_date,
    invested_amount_inr, equity_percentage, post_money_valuation_inr, status
)
SELECT
    inv.investor_id,
    s.startup_id,
    seed.funding_stage,
    seed.security_type,
    seed.investment_date,
    seed.funding_cr * 10000000,
    seed.equity_pct,
    seed.valuation_cr * 10000000,
    'Active'
FROM extended_startup_seed seed
JOIN investors inv ON inv.investor_name = seed.investor_name
JOIN startups s ON s.startup_name = seed.startup_name
WHERE NOT EXISTS (
    SELECT 1
    FROM investments i
    WHERE i.startup_id = s.startup_id
      AND i.investor_id = inv.investor_id
      AND i.investment_date = seed.investment_date
);

INSERT INTO financial_metrics (
    startup_id, metric_month, revenue_inr, net_profit_inr, cash_reserve_inr,
    customer_count, mrr_inr, arr_inr, cac_inr, ltv_inr, burn_rate_inr,
    runway_months, churn_rate
)
SELECT
    s.startup_id,
    month_map.metric_month,
    (CASE month_map.month_no
        WHEN 1 THEN seed.revenue_nov_cr
        WHEN 2 THEN seed.revenue_dec_cr
        WHEN 3 THEN seed.revenue_jan_cr
        WHEN 4 THEN seed.revenue_feb_cr
        WHEN 5 THEN seed.revenue_mar_cr
        ELSE seed.revenue_apr_cr
    END) * 10000000,
    ((CASE month_map.month_no
        WHEN 1 THEN seed.revenue_nov_cr
        WHEN 2 THEN seed.revenue_dec_cr
        WHEN 3 THEN seed.revenue_jan_cr
        WHEN 4 THEN seed.revenue_feb_cr
        WHEN 5 THEN seed.revenue_mar_cr
        ELSE seed.revenue_apr_cr
    END) - seed.burn_cr) * 10000000,
    GREATEST(0, (seed.cash_cr - ((6 - month_map.month_no) * seed.burn_cr * 0.35)) * 10000000),
    GREATEST(1, ROUND(seed.customer_count * (CASE month_map.month_no
        WHEN 1 THEN seed.revenue_nov_cr
        WHEN 2 THEN seed.revenue_dec_cr
        WHEN 3 THEN seed.revenue_jan_cr
        WHEN 4 THEN seed.revenue_feb_cr
        WHEN 5 THEN seed.revenue_mar_cr
        ELSE seed.revenue_apr_cr
    END) / NULLIF(seed.revenue_apr_cr, 0))),
    (CASE month_map.month_no
        WHEN 1 THEN seed.revenue_nov_cr
        WHEN 2 THEN seed.revenue_dec_cr
        WHEN 3 THEN seed.revenue_jan_cr
        WHEN 4 THEN seed.revenue_feb_cr
        WHEN 5 THEN seed.revenue_mar_cr
        ELSE seed.revenue_apr_cr
    END) * 10000000,
    (CASE month_map.month_no
        WHEN 1 THEN seed.revenue_nov_cr
        WHEN 2 THEN seed.revenue_dec_cr
        WHEN 3 THEN seed.revenue_jan_cr
        WHEN 4 THEN seed.revenue_feb_cr
        WHEN 5 THEN seed.revenue_mar_cr
        ELSE seed.revenue_apr_cr
    END) * 12 * 10000000,
    ROUND(seed.cac_inr * (1 + ((6 - month_map.month_no) * 0.025)), 2),
    ROUND(seed.ltv_inr * (0.88 + (month_map.month_no * 0.02)), 2),
    ROUND(seed.burn_cr * (1 + ((6 - month_map.month_no) * 0.04)) * 10000000, 2),
    GREATEST(0.50, ROUND(seed.runway_months - ((6 - month_map.month_no) * 0.45), 2)),
    LEAST(100, ROUND(seed.churn_rate + ((6 - month_map.month_no) * 0.18), 2))
FROM extended_startup_seed seed
JOIN startups s ON s.startup_name = seed.startup_name
JOIN (
    SELECT 1 AS month_no, '2025-11-01' AS metric_month
    UNION ALL SELECT 2, '2025-12-01'
    UNION ALL SELECT 3, '2026-01-01'
    UNION ALL SELECT 4, '2026-02-01'
    UNION ALL SELECT 5, '2026-03-01'
    UNION ALL SELECT 6, '2026-04-01'
) month_map
WHERE NOT EXISTS (
    SELECT 1
    FROM financial_metrics fm
    WHERE fm.startup_id = s.startup_id
      AND fm.metric_month = month_map.metric_month
);

INSERT INTO market_data (startup_id, simulated_trend_value, competitor_score, market_date)
SELECT
    s.startup_id,
    seed.trend_value,
    seed.competitor_score,
    '2026-04-01'
FROM extended_startup_seed seed
JOIN startups s ON s.startup_name = seed.startup_name
WHERE NOT EXISTS (
    SELECT 1
    FROM market_data md
    WHERE md.startup_id = s.startup_id
      AND md.market_date = '2026-04-01'
);

INSERT INTO partnerships (startup_id, partner_name, deal_type, impact_score, announced_date)
SELECT
    s.startup_id,
    seed.partner_name,
    seed.deal_type,
    seed.impact_score,
    '2026-04-08'
FROM extended_startup_seed seed
JOIN startups s ON s.startup_name = seed.startup_name
WHERE NOT EXISTS (
    SELECT 1
    FROM partnerships p
    WHERE p.startup_id = s.startup_id
      AND p.partner_name = seed.partner_name
);

INSERT INTO risk_analysis (investment_id, risk_score, factors, assessment_date)
SELECT
    i.investment_id,
    seed.risk_score,
    seed.risk_factors,
    '2026-04-15'
FROM extended_startup_seed seed
JOIN startups s ON s.startup_name = seed.startup_name
JOIN investments i ON i.startup_id = s.startup_id
WHERE NOT EXISTS (
    SELECT 1
    FROM risk_analysis ra
    WHERE ra.investment_id = i.investment_id
      AND ra.assessment_date = '2026-04-15'
);

DROP TEMPORARY TABLE extended_startup_seed;

SELECT COUNT(*) AS startup_count_after_seed FROM startups;
