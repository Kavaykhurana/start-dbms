const startupDetailsById = {
    1: {
        id: 1,
        name: 'RupeeRoute',
        sector: 'Fintech',
        fundingStage: 'Series B',
        city: 'Bengaluru',
        state: 'Karnataka',
        valuation: 3200000000,
        employeeCount: 180,
        totalFunding: 300000000,
        riskScore: 29.5,
        riskLevel: 'Low',
        cac: 3200,
        ltv: 23600,
        burnRate: 7000000,
        runway: 18.2,
        churnRate: 1.9,
        customerCount: 114000
    },
    2: {
        id: 2,
        name: 'LedgerLeap',
        sector: 'Fintech',
        fundingStage: 'Series A',
        city: 'Mumbai',
        state: 'Maharashtra',
        valuation: 1150000000,
        employeeCount: 95,
        totalFunding: 110000000,
        riskScore: 39,
        riskLevel: 'Medium',
        cac: 4200,
        ltv: 19800,
        burnRate: 9000000,
        runway: 14.2,
        churnRate: 3.2,
        customerCount: 37000
    },
    3: {
        id: 3,
        name: 'LearnNest',
        sector: 'Edtech',
        fundingStage: 'Series A',
        city: 'Gurugram',
        state: 'Haryana',
        valuation: 1450000000,
        employeeCount: 140,
        totalFunding: 130000000,
        riskScore: 39.5,
        riskLevel: 'Medium',
        cac: 5400,
        ltv: 16200,
        burnRate: 11000000,
        runway: 11.5,
        churnRate: 4.1,
        customerCount: 51000
    },
    4: {
        id: 4,
        name: 'MediMitra',
        sector: 'Healthtech',
        fundingStage: 'Series B',
        city: 'Bengaluru',
        state: 'Karnataka',
        valuation: 2400000000,
        employeeCount: 210,
        totalFunding: 240000000,
        riskScore: 46,
        riskLevel: 'Medium',
        cac: 7800,
        ltv: 24800,
        burnRate: 17000000,
        runway: 7.8,
        churnRate: 2.3,
        customerCount: 16400
    },
    5: {
        id: 5,
        name: 'FleetMesh',
        sector: 'Logistics',
        fundingStage: 'Seed',
        city: 'Mumbai',
        state: 'Maharashtra',
        valuation: 520000000,
        employeeCount: 70,
        totalFunding: 43000000,
        riskScore: 73,
        riskLevel: 'High',
        cac: 6100,
        ltv: 12800,
        burnRate: 13000000,
        runway: 4.9,
        churnRate: 6.8,
        customerCount: 7200
    },
    6: {
        id: 6,
        name: 'CarbonLoop',
        sector: 'ClimateTech',
        fundingStage: 'Seed',
        city: 'Pune',
        state: 'Maharashtra',
        valuation: 480000000,
        employeeCount: 55,
        totalFunding: 52000000,
        riskScore: 56.5,
        riskLevel: 'Medium',
        cac: 3200,
        ltv: 14400,
        burnRate: 9000000,
        runway: 6.1,
        churnRate: 4.8,
        customerCount: 3900
    },
    7: {
        id: 7,
        name: 'StackPilot',
        sector: 'SaaS',
        fundingStage: 'Series A',
        city: 'Bengaluru',
        state: 'Karnataka',
        valuation: 1700000000,
        employeeCount: 125,
        totalFunding: 130000000,
        riskScore: 31,
        riskLevel: 'Low',
        cac: 2800,
        ltv: 18200,
        burnRate: 7500000,
        runway: 16.7,
        churnRate: 2.1,
        customerCount: 22100
    }
};

const startupHistory = {
    1: [62000000, 68000000, 72000000, 78000000, 84000000, 89000000],
    2: [18000000, 20000000, 22000000, 24000000, 27000000, 30000000],
    3: [26000000, 27500000, 29500000, 31500000, 33500000, 35500000],
    4: [44000000, 46000000, 48000000, 50000000, 53000000, 56000000],
    5: [9000000, 10000000, 11000000, 12000000, 12500000, 13500000],
    6: [7000000, 8000000, 9000000, 10000000, 11500000, 12200000],
    7: [30000000, 32000000, 35000000, 38000000, 41000000, 45000000]
};

const recommendationItems = [
    {
        rank: 1,
        startupId: 1,
        name: 'RupeeRoute',
        sector: 'Fintech',
        fundingStage: 'Series B',
        decisionScore: 8.92,
        signal: 'INVEST',
        riskScore: 29.5,
        ltvCacRatio: 7.38,
        reason: 'High transaction velocity, strong retention, and one of the best risk-adjusted unit economics profiles.'
    },
    {
        rank: 2,
        startupId: 7,
        name: 'StackPilot',
        sector: 'SaaS',
        fundingStage: 'Series A',
        decisionScore: 8.56,
        signal: 'INVEST',
        riskScore: 31,
        ltvCacRatio: 6.50,
        reason: 'Product-led SaaS motion keeps CAC low while churn stays contained.'
    },
    {
        rank: 3,
        startupId: 2,
        name: 'LedgerLeap',
        sector: 'Fintech',
        fundingStage: 'Series A',
        decisionScore: 7.61,
        signal: 'INVEST',
        riskScore: 39,
        ltvCacRatio: 4.71,
        reason: 'Credit infrastructure business is maturing well and profitability is trending up.'
    },
    {
        rank: 4,
        startupId: 6,
        name: 'CarbonLoop',
        sector: 'ClimateTech',
        fundingStage: 'Seed',
        decisionScore: 7.08,
        signal: 'WATCH',
        riskScore: 56.5,
        ltvCacRatio: 4.50,
        reason: 'Strong tailwinds and commercial traction, but deployment cycles still add execution risk.'
    },
    {
        rank: 5,
        startupId: 4,
        name: 'MediMitra',
        sector: 'Healthtech',
        fundingStage: 'Series B',
        decisionScore: 6.89,
        signal: 'WATCH',
        riskScore: 46,
        ltvCacRatio: 3.18,
        reason: 'Large market and improving economics, but healthcare adoption cycles remain slower than Fintech and SaaS.'
    }
];

export const fallbackData = {
    dashboard: {
        summary: {
            totalStartups: 7,
            totalFundingInr: 1005000000,
            avgROI: 27.8,
            riskLevel: 'Medium'
        },
        sectorGrowth: {
            labels: ['Fintech', 'SaaS', 'ClimateTech', 'Healthtech', 'Edtech', 'Logistics'],
            data: [80, 81, 74, 71, 68, 59]
        },
        investmentTrends: {
            labels: ['Jan 2025', 'Apr 2025', 'May 2025', 'Jun 2025', 'Jul 2025', 'Aug 2025', 'Sep 2025', 'Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026'],
            data: [12, 9, 18, 9, 8.5, 3.5, 15, 4.5, 2.5, 3, 2.2, 7.5, 4, 1.8]
        }
    },
    sectors: ['ClimateTech', 'Edtech', 'Fintech', 'Healthtech', 'Logistics', 'SaaS'],
    startups: Object.values(startupDetailsById).map((startup) => ({
        id: startup.id,
        name: startup.name,
        sector: startup.sector,
        fundingStage: startup.fundingStage,
        totalFunding: startup.totalFunding,
        riskScore: startup.riskScore,
        riskLevel: startup.riskLevel
    })),
    startupDetailsById,
    startupHistory,
    recommendationItems,
    analytics: {
        scatter: {
            points: Object.values(startupDetailsById).map((startup) => ({
                label: startup.name,
                x: startup.cac,
                y: startup.ltv
            }))
        },
        burnRunway: {
            labels: Object.values(startupDetailsById).map((startup) => startup.name),
            burnRateLakhs: Object.values(startupDetailsById).map((startup) => Number((startup.burnRate / 100000).toFixed(2))),
            runwayMonths: Object.values(startupDetailsById).map((startup) => startup.runway)
        },
        radar: {
            labels: [
                'Growth',
                'Risk Buffer',
                'Funding Strength',
                'Partner Impact',
                'Competition Headroom'
            ],
            datasets: [
                {
                    label: 'Fintech',
                    data: [80, 65, 100, 89, 40],
                    borderColor: '#00d2ff',
                    backgroundColor: 'rgba(0, 210, 255, 0.20)'
                },
                {
                    label: 'SaaS',
                    data: [81, 69, 43, 76, 43],
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0, 255, 136, 0.20)'
                },
                {
                    label: 'Healthtech',
                    data: [71, 54, 24, 87, 45],
                    borderColor: '#ffb347',
                    backgroundColor: 'rgba(255, 179, 71, 0.20)'
                },
                {
                    label: 'ClimateTech',
                    data: [74, 43, 5, 84, 51],
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.20)'
                }
            ]
        }
    },
    investmentRoiById: {
        1: 210,
        2: 167.3,
        3: 60,
        4: 280,
        5: 233.33,
        6: 150,
        7: 10,
        8: 13.33,
        9: -100.8,
        10: -116.67,
        11: -40,
        12: -54.55,
        13: 229.41,
        14: 252.78
    }
};
