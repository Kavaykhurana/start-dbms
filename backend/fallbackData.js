const palette = [
    { borderColor: '#00d2ff', backgroundColor: 'rgba(0, 210, 255, 0.22)' },
    { borderColor: '#00ff88', backgroundColor: 'rgba(0, 255, 136, 0.22)' },
    { borderColor: '#ffb347', backgroundColor: 'rgba(255, 179, 71, 0.22)' },
    { borderColor: '#ff6b6b', backgroundColor: 'rgba(255, 107, 107, 0.22)' },
    { borderColor: '#b388ff', backgroundColor: 'rgba(179, 136, 255, 0.22)' },
    { borderColor: '#5eead4', backgroundColor: 'rgba(94, 234, 212, 0.22)' }
];

const monthLabels = ['Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026'];

const startupDetailsById = {
    1: {
        id: 1,
        name: 'RupeeRoute',
        sector: 'Fintech',
        fundingStage: 'Series B',
        city: 'Bengaluru',
        state: 'Karnataka',
        foundedYear: 2020,
        founders: 'Aarav Menon, Diya Rao',
        businessModel: 'UPI-led SME payments and working-capital rails',
        revenueModel: 'Take-rate on transactions plus SaaS reconciliation fees',
        description: 'Processes high-volume payments for kirana chains and D2C sellers with embedded invoice financing.',
        partnerName: 'HDFC Bank',
        dealType: 'Pilot',
        marketTrend: 84,
        competitorScore: 62,
        impactScore: 9.1,
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
        customerCount: 114000,
        history: [62000000, 68000000, 72000000, 78000000, 84000000, 89000000]
    },
    2: {
        id: 2,
        name: 'LedgerLeap',
        sector: 'Fintech',
        fundingStage: 'Series A',
        city: 'Mumbai',
        state: 'Maharashtra',
        foundedYear: 2021,
        founders: 'Kabir Sethi, Neha Batra',
        businessModel: 'Credit analytics API for NBFCs and digital lenders',
        revenueModel: 'Per-decision API fee plus platform subscription',
        description: 'Gives lenders GST, banking, and bureau-enriched underwriting signals for MSME credit.',
        partnerName: 'ICICI Bank',
        dealType: 'Pilot',
        marketTrend: 76,
        competitorScore: 58,
        impactScore: 7.9,
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
        customerCount: 37000,
        history: [18000000, 20000000, 22000000, 24000000, 27000000, 30000000]
    },
    3: {
        id: 3,
        name: 'LearnNest',
        sector: 'Edtech',
        fundingStage: 'Series A',
        city: 'Gurugram',
        state: 'Haryana',
        foundedYear: 2019,
        founders: 'Rhea Malhotra, Sarthak Jain',
        businessModel: 'Hybrid K-12 test-prep platform for tier-2 cities',
        revenueModel: 'Annual learner subscriptions and school licensing',
        description: 'Combines adaptive practice, doubt-solving, and franchise learning hubs for board and entrance exams.',
        partnerName: 'Delhi Public School Network',
        dealType: 'LOI',
        marketTrend: 68,
        competitorScore: 60,
        impactScore: 8,
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
        customerCount: 51000,
        history: [26000000, 27500000, 29500000, 31500000, 33500000, 35500000]
    },
    4: {
        id: 4,
        name: 'MediMitra',
        sector: 'Healthtech',
        fundingStage: 'Series B',
        city: 'Bengaluru',
        state: 'Karnataka',
        foundedYear: 2018,
        founders: 'Dr. Ishaan Nair, Kavya Srinivasan',
        businessModel: 'AI triage and chronic-care operating system for clinics',
        revenueModel: 'Clinic SaaS, care-plan fees, and diagnostics referral margin',
        description: 'Supports family clinics with appointment routing, risk triage, and longitudinal patient monitoring.',
        partnerName: 'Apollo Clinics',
        dealType: 'Pilot',
        marketTrend: 71,
        competitorScore: 55,
        impactScore: 8.7,
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
        customerCount: 16400,
        history: [44000000, 46000000, 48000000, 50000000, 53000000, 56000000]
    },
    5: {
        id: 5,
        name: 'FleetMesh',
        sector: 'Logistics',
        fundingStage: 'Seed',
        city: 'Mumbai',
        state: 'Maharashtra',
        foundedYear: 2022,
        founders: 'Pranav Kulkarni, Sana Merchant',
        businessModel: 'Last-mile fleet orchestration for D2C and pharma deliveries',
        revenueModel: 'Per-shipment routing fee and monthly fleet dashboard subscription',
        description: 'Optimizes riders, cold-chain slots, and reverse logistics for dense urban delivery corridors.',
        partnerName: 'Blue Dart',
        dealType: 'Pilot',
        marketTrend: 59,
        competitorScore: 72,
        impactScore: 6.8,
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
        customerCount: 7200,
        history: [9000000, 10000000, 11000000, 12000000, 12500000, 13500000]
    },
    6: {
        id: 6,
        name: 'CarbonLoop',
        sector: 'ClimateTech',
        fundingStage: 'Seed',
        city: 'Pune',
        state: 'Maharashtra',
        foundedYear: 2022,
        founders: 'Mira Deshpande, Advait Roy',
        businessModel: 'Carbon accounting and supplier decarbonization workflow',
        revenueModel: 'Annual compliance SaaS and verified project marketplace fees',
        description: 'Helps mid-market exporters measure Scope 3 emissions and source lower-carbon suppliers.',
        partnerName: 'Tata Power Distribution',
        dealType: 'LOI',
        marketTrend: 74,
        competitorScore: 49,
        impactScore: 8.4,
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
        customerCount: 3900,
        history: [7000000, 8000000, 9000000, 10000000, 11500000, 12200000]
    },
    7: {
        id: 7,
        name: 'StackPilot',
        sector: 'SaaS',
        fundingStage: 'Series A',
        city: 'Bengaluru',
        state: 'Karnataka',
        foundedYear: 2020,
        founders: 'Vikram Shah, Aisha Thomas',
        businessModel: 'DevOps automation cockpit for Indian SaaS teams',
        revenueModel: 'Seat-based subscription and enterprise observability add-ons',
        description: 'Automates deployment checks, cloud-cost alerts, and release workflows for engineering teams.',
        partnerName: 'Zoho Marketplace',
        dealType: 'Pilot',
        marketTrend: 81,
        competitorScore: 57,
        impactScore: 7.6,
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
        customerCount: 22100,
        history: [30000000, 32000000, 35000000, 38000000, 41000000, 45000000]
    },
    8: {
        id: 8,
        name: 'AgriPulse',
        sector: 'Agritech',
        fundingStage: 'Seed',
        city: 'Nashik',
        state: 'Maharashtra',
        foundedYear: 2021,
        founders: 'Harsh Patil, Nandini Verma',
        businessModel: 'Farm advisory, mandi pricing, and input-credit workflow',
        revenueModel: 'Input marketplace margin and FPO subscription',
        description: 'Connects grape, onion, and tomato FPOs to crop intelligence, working capital, and buyer discovery.',
        partnerName: 'Mahindra Agri Solutions',
        dealType: 'LOI',
        marketTrend: 66,
        competitorScore: 53,
        impactScore: 7.7,
        valuation: 390000000,
        employeeCount: 48,
        totalFunding: 36000000,
        riskScore: 52,
        riskLevel: 'Medium',
        cac: 1900,
        ltv: 9300,
        burnRate: 5200000,
        runway: 8.8,
        churnRate: 5.2,
        customerCount: 18200,
        history: [6200000, 7100000, 7900000, 8600000, 9400000, 10800000]
    },
    9: {
        id: 9,
        name: 'SecureAuth',
        sector: 'Cybersecurity',
        fundingStage: 'Series A',
        city: 'Hyderabad',
        state: 'Telangana',
        foundedYear: 2020,
        founders: 'Nikhil Reddy, Samira Khan',
        businessModel: 'Passwordless identity layer for regulated enterprises',
        revenueModel: 'Annual contract value by active workforce identities',
        description: 'Delivers phishing-resistant authentication for banks, insurers, and healthcare administrators.',
        partnerName: 'NPCI Partner Program',
        dealType: 'Pilot',
        marketTrend: 79,
        competitorScore: 48,
        impactScore: 8.2,
        valuation: 920000000,
        employeeCount: 88,
        totalFunding: 95000000,
        riskScore: 34,
        riskLevel: 'Low',
        cac: 7600,
        ltv: 45200,
        burnRate: 8200000,
        runway: 13.4,
        churnRate: 1.6,
        customerCount: 860,
        history: [11500000, 13200000, 15400000, 17200000, 19800000, 23000000]
    },
    10: {
        id: 10,
        name: 'BazaarBridge',
        sector: 'Ecommerce',
        fundingStage: 'Seed',
        city: 'Jaipur',
        state: 'Rajasthan',
        foundedYear: 2022,
        founders: 'Tanvi Agarwal, Dhruv Mehta',
        businessModel: 'B2B catalog and fulfillment network for small retailers',
        revenueModel: 'Marketplace margin, logistics fee, and promoted catalog slots',
        description: 'Lets small fashion and home-goods retailers source inventory from verified Indian manufacturers.',
        partnerName: 'IndiaMART Seller Network',
        dealType: 'LOI',
        marketTrend: 63,
        competitorScore: 68,
        impactScore: 6.9,
        valuation: 610000000,
        employeeCount: 82,
        totalFunding: 58000000,
        riskScore: 62,
        riskLevel: 'Medium',
        cac: 2600,
        ltv: 9800,
        burnRate: 9600000,
        runway: 5.7,
        churnRate: 7.1,
        customerCount: 24800,
        history: [10500000, 11800000, 12900000, 14100000, 15400000, 16800000]
    },
    11: {
        id: 11,
        name: 'InsureVista',
        sector: 'Insurtech',
        fundingStage: 'Series A',
        city: 'Mumbai',
        state: 'Maharashtra',
        foundedYear: 2020,
        founders: 'Yash Gupta, Meera Iyer',
        businessModel: 'Embedded insurance APIs for travel, lending, and ecommerce',
        revenueModel: 'Policy commission and API platform fee',
        description: 'Bundles contextual insurance into digital checkout flows with automated claims routing.',
        partnerName: 'Bajaj Allianz',
        dealType: 'Pilot',
        marketTrend: 72,
        competitorScore: 54,
        impactScore: 8,
        valuation: 1040000000,
        employeeCount: 104,
        totalFunding: 118000000,
        riskScore: 37,
        riskLevel: 'Medium',
        cac: 3900,
        ltv: 21000,
        burnRate: 8700000,
        runway: 12.6,
        churnRate: 2.8,
        customerCount: 42000,
        history: [17800000, 19300000, 21100000, 23500000, 25900000, 28700000]
    },
    12: {
        id: 12,
        name: 'PayKart',
        sector: 'Fintech',
        fundingStage: 'Seed',
        city: 'Chennai',
        state: 'Tamil Nadu',
        foundedYear: 2023,
        founders: 'Arjun Krishnan, Lavanya Moorthy',
        businessModel: 'Offline merchant QR loyalty and micro-credit enablement',
        revenueModel: 'Merchant SaaS plus referral margin on credit products',
        description: 'Gives neighbourhood merchants a lightweight rewards stack tied to UPI payments and credit offers.',
        partnerName: 'Federal Bank',
        dealType: 'LOI',
        marketTrend: 70,
        competitorScore: 64,
        impactScore: 7.2,
        valuation: 430000000,
        employeeCount: 42,
        totalFunding: 41000000,
        riskScore: 58,
        riskLevel: 'Medium',
        cac: 1700,
        ltv: 7600,
        burnRate: 6100000,
        runway: 7.2,
        churnRate: 5.9,
        customerCount: 53000,
        history: [5200000, 6400000, 7800000, 9100000, 10400000, 12100000]
    },
    13: {
        id: 13,
        name: 'DroneKart',
        sector: 'Dronetech',
        fundingStage: 'Series A',
        city: 'Noida',
        state: 'Uttar Pradesh',
        foundedYear: 2021,
        founders: 'Raghav Bansal, Pari Saxena',
        businessModel: 'Drone-as-a-service for surveying, agri spraying, and inspections',
        revenueModel: 'Per-acre and per-site service revenue with maintenance contracts',
        description: 'Operates certified drone fleets for agri cooperatives, solar farms, and infrastructure teams.',
        partnerName: 'Adani Green Field Ops',
        dealType: 'Pilot',
        marketTrend: 69,
        competitorScore: 59,
        impactScore: 7.8,
        valuation: 760000000,
        employeeCount: 118,
        totalFunding: 88000000,
        riskScore: 49,
        riskLevel: 'Medium',
        cac: 9400,
        ltv: 31200,
        burnRate: 11800000,
        runway: 8.1,
        churnRate: 3.6,
        customerCount: 1320,
        history: [12800000, 14200000, 15800000, 17600000, 19600000, 21900000]
    },
    14: {
        id: 14,
        name: 'BioBloom',
        sector: 'Biotech',
        fundingStage: 'Seed',
        city: 'Hyderabad',
        state: 'Telangana',
        foundedYear: 2022,
        founders: 'Dr. Ananya Bose, Kunal Narang',
        businessModel: 'Synthetic biology workflow for enzyme discovery',
        revenueModel: 'Research contracts, IP licensing, and pilot manufacturing margin',
        description: 'Uses rapid wet-lab automation to build enzymes for specialty chemicals and food processing.',
        partnerName: 'CCMB Incubator',
        dealType: 'LOI',
        marketTrend: 62,
        competitorScore: 46,
        impactScore: 7.4,
        valuation: 580000000,
        employeeCount: 64,
        totalFunding: 64000000,
        riskScore: 67,
        riskLevel: 'High',
        cac: 18500,
        ltv: 54500,
        burnRate: 14200000,
        runway: 5.2,
        churnRate: 4.4,
        customerCount: 34,
        history: [4200000, 4900000, 5600000, 6600000, 7500000, 8900000]
    },
    15: {
        id: 15,
        name: 'SkillSprint',
        sector: 'Edtech',
        fundingStage: 'Seed',
        city: 'Bengaluru',
        state: 'Karnataka',
        foundedYear: 2023,
        founders: 'Pooja Kamat, Ishan Grover',
        businessModel: 'Outcome-linked skilling for entry-level tech and operations roles',
        revenueModel: 'Placement success fee and employer cohort sponsorship',
        description: 'Runs short-form job tracks for support, data ops, and QA roles with placement-linked pricing.',
        partnerName: 'NASSCOM FutureSkills',
        dealType: 'Pilot',
        marketTrend: 65,
        competitorScore: 61,
        impactScore: 7.5,
        valuation: 350000000,
        employeeCount: 38,
        totalFunding: 30000000,
        riskScore: 51,
        riskLevel: 'Medium',
        cac: 2100,
        ltv: 8200,
        burnRate: 4300000,
        runway: 9.3,
        churnRate: 5.5,
        customerCount: 16400,
        history: [3900000, 4700000, 5600000, 6800000, 7900000, 9100000]
    },
    16: {
        id: 16,
        name: 'Warewise',
        sector: 'Logistics',
        fundingStage: 'Series A',
        city: 'Delhi',
        state: 'Delhi',
        foundedYear: 2020,
        founders: 'Anmol Dua, Kritika Suri',
        businessModel: 'Warehouse intelligence and demand allocation for brands',
        revenueModel: 'Warehouse SaaS plus per-order optimization fee',
        description: 'Uses inventory velocity and demand forecasts to allocate stock across metro warehouses.',
        partnerName: 'Delhivery Fulfillment',
        dealType: 'Pilot',
        marketTrend: 73,
        competitorScore: 56,
        impactScore: 8.1,
        valuation: 980000000,
        employeeCount: 112,
        totalFunding: 104000000,
        riskScore: 41,
        riskLevel: 'Medium',
        cac: 5200,
        ltv: 24800,
        burnRate: 7600000,
        runway: 12.1,
        churnRate: 2.9,
        customerCount: 6700,
        history: [15000000, 16600000, 18300000, 20500000, 22800000, 25700000]
    },
    17: {
        id: 17,
        name: 'GreenGrid',
        sector: 'Energy',
        fundingStage: 'Series B',
        city: 'Ahmedabad',
        state: 'Gujarat',
        foundedYear: 2019,
        founders: 'Jay Shah, Riddhi Trivedi',
        businessModel: 'Battery analytics and demand response for C&I solar users',
        revenueModel: 'Energy savings share and equipment analytics subscription',
        description: 'Optimizes battery dispatch and peak shaving for commercial solar-plus-storage installations.',
        partnerName: 'Torrent Power',
        dealType: 'Pilot',
        marketTrend: 77,
        competitorScore: 51,
        impactScore: 8.6,
        valuation: 2100000000,
        employeeCount: 176,
        totalFunding: 220000000,
        riskScore: 35,
        riskLevel: 'Low',
        cac: 11800,
        ltv: 61800,
        burnRate: 15300000,
        runway: 15.5,
        churnRate: 1.8,
        customerCount: 720,
        history: [33500000, 35800000, 38400000, 42000000, 46100000, 50500000]
    },
    18: {
        id: 18,
        name: 'CloudKirana',
        sector: 'SaaS',
        fundingStage: 'Seed',
        city: 'Gurugram',
        state: 'Haryana',
        foundedYear: 2023,
        founders: 'Rohan Kapoor, Zoya Siddiqui',
        businessModel: 'Retail operating system for kirana procurement and ledgering',
        revenueModel: 'Store subscription and supplier promotion revenue',
        description: 'Gives small retailers procurement lists, digital ledgers, expiry alerts, and margin analytics.',
        partnerName: 'Metro Cash & Carry',
        dealType: 'LOI',
        marketTrend: 75,
        competitorScore: 60,
        impactScore: 7.3,
        valuation: 470000000,
        employeeCount: 46,
        totalFunding: 39000000,
        riskScore: 54,
        riskLevel: 'Medium',
        cac: 1500,
        ltv: 7900,
        burnRate: 5000000,
        runway: 8.4,
        churnRate: 6.1,
        customerCount: 31500,
        history: [4800000, 5900000, 7100000, 8300000, 9700000, 11200000]
    }
};

const startups = Object.values(startupDetailsById);
const startupHistory = Object.fromEntries(startups.map((startup) => [startup.id, startup.history]));
const sectors = [...new Set(startups.map((startup) => startup.sector))].sort();

const riskDistribution = ['Low', 'Medium', 'High'].map((riskLevel) => ({
    label: riskLevel,
    count: startups.filter((startup) => startup.riskLevel === riskLevel).length
}));

const sectorGroups = groupBy(startups, 'sector');
const stageGroups = groupBy(startups, 'fundingStage');
const totalFundingInr = startups.reduce((sum, startup) => sum + startup.totalFunding, 0);
const averageRisk = average(startups.map((startup) => startup.riskScore));

const sectorGrowth = sectors.map((sector) => ({
    label: sector,
    value: round(average(sectorGroups[sector].map((startup) => startup.marketTrend)))
}));

const stageFunding = Object.entries(stageGroups)
    .map(([stage, stageStartups]) => ({
        label: stage,
        value: round(stageStartups.reduce((sum, startup) => sum + startup.totalFunding, 0) / 10000000)
    }))
    .sort((a, b) => b.value - a.value);

const sectorRisk = sectors.map((sector) => ({
    label: sector,
    value: round(average(sectorGroups[sector].map((startup) => startup.riskScore)))
}));

const recommendationItems = startups
    .map((startup) => {
        const ltvCacRatio = startup.ltv / startup.cac;
        const decisionScore = Math.min(9.6, Math.max(3.2,
            (ltvCacRatio * 0.78) +
            (startup.runway * 0.14) +
            ((100 - startup.riskScore) * 0.035) +
            (startup.marketTrend * 0.018)
        ));
        const signal = decisionScore >= 8
            ? 'INVEST'
            : decisionScore >= 6.4
                ? 'WATCH'
                : 'AVOID';

        return {
            startupId: startup.id,
            name: startup.name,
            sector: startup.sector,
            fundingStage: startup.fundingStage,
            decisionScore: round(decisionScore),
            signal,
            riskScore: startup.riskScore,
            ltvCacRatio: round(ltvCacRatio),
            reason: buildRecommendationReason(startup, ltvCacRatio, signal)
        };
    })
    .sort((a, b) => b.decisionScore - a.decisionScore)
    .slice(0, 8)
    .map((startup, index) => ({ ...startup, rank: index + 1 }));

const radarSectors = sectors
    .map((sector) => {
        const entries = sectorGroups[sector];
        const funding = entries.reduce((sum, startup) => sum + startup.totalFunding, 0);
        return { sector, entries, funding };
    })
    .sort((a, b) => b.funding - a.funding)
    .slice(0, 6);

const maxSectorFunding = Math.max(...radarSectors.map((entry) => entry.funding), 1);

export const fallbackData = {
    dashboard: {
        summary: {
            totalStartups: startups.length,
            totalFundingInr,
            avgROI: 31.6,
            riskLevel: averageRisk < 35 ? 'Low' : averageRisk < 65 ? 'Medium' : 'High'
        },
        sectorGrowth: {
            labels: sectorGrowth.map((entry) => entry.label),
            data: sectorGrowth.map((entry) => entry.value)
        },
        investmentTrends: {
            labels: ['Jan 2025', 'Mar 2025', 'May 2025', 'Jul 2025', 'Sep 2025', 'Nov 2025', 'Jan 2026', 'Mar 2026', 'Apr 2026'],
            data: [21, 18, 31, 26, 42, 36, 48, 54, 61]
        },
        stageFunding: {
            labels: stageFunding.map((entry) => entry.label),
            data: stageFunding.map((entry) => entry.value)
        },
        riskDistribution: {
            labels: riskDistribution.map((entry) => entry.label),
            data: riskDistribution.map((entry) => entry.count)
        },
        topStartups: recommendationItems.slice(0, 5)
    },
    sectors,
    startups: startups.map((startup) => ({
        id: startup.id,
        name: startup.name,
        sector: startup.sector,
        fundingStage: startup.fundingStage,
        city: startup.city,
        state: startup.state,
        valuation: startup.valuation,
        totalFunding: startup.totalFunding,
        riskScore: startup.riskScore,
        riskLevel: startup.riskLevel,
        runway: startup.runway,
        ltvCacRatio: round(startup.ltv / startup.cac)
    })),
    startupDetailsById,
    startupHistory,
    recommendationItems,
    analytics: {
        scatter: {
            points: startups.map((startup) => ({
                label: startup.name,
                x: startup.cac,
                y: startup.ltv
            }))
        },
        burnRunway: {
            labels: startups.map((startup) => startup.name),
            burnRateLakhs: startups.map((startup) => round(startup.burnRate / 100000)),
            runwayMonths: startups.map((startup) => startup.runway)
        },
        radar: {
            labels: [
                'Growth',
                'Risk Buffer',
                'Funding Strength',
                'Partner Impact',
                'Competition Headroom'
            ],
            datasets: radarSectors.map((entry, index) => ({
                label: entry.sector,
                data: [
                    round(average(entry.entries.map((startup) => startup.marketTrend))),
                    round(100 - average(entry.entries.map((startup) => startup.riskScore))),
                    round((entry.funding / maxSectorFunding) * 100),
                    round(average(entry.entries.map((startup) => startup.impactScore)) * 10),
                    round(100 - average(entry.entries.map((startup) => startup.competitorScore)))
                ],
                borderColor: palette[index % palette.length].borderColor,
                backgroundColor: palette[index % palette.length].backgroundColor
            }))
        },
        fundingByStage: {
            labels: stageFunding.map((entry) => entry.label),
            data: stageFunding.map((entry) => entry.value)
        },
        riskBySector: {
            labels: sectorRisk.map((entry) => entry.label),
            data: sectorRisk.map((entry) => entry.value)
        },
        valuationFunding: {
            points: startups.map((startup) => ({
                label: startup.name,
                x: round(startup.totalFunding / 10000000),
                y: round(startup.valuation / 10000000)
            }))
        },
        churnBySector: {
            labels: sectors,
            data: sectors.map((sector) => round(average(sectorGroups[sector].map((startup) => startup.churnRate))))
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

function groupBy(items, key) {
    return items.reduce((groups, item) => {
        const groupKey = item[key];
        groups[groupKey] = groups[groupKey] || [];
        groups[groupKey].push(item);
        return groups;
    }, {});
}

function average(values) {
    if (!values.length) {
        return 0;
    }

    return values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length;
}

function round(value) {
    return Number(Number(value || 0).toFixed(2));
}

function buildRecommendationReason(startup, ltvCacRatio, signal) {
    if (signal === 'INVEST') {
        return `${startup.sector} traction is strong: ${ltvCacRatio.toFixed(1)}x LTV/CAC, ${startup.runway.toFixed(1)} months runway, and ${startup.partnerName} ${startup.dealType}.`;
    }

    if (signal === 'WATCH') {
        return `Promising market signal (${startup.marketTrend}/100), but risk score ${startup.riskScore.toFixed(0)} and churn ${startup.churnRate.toFixed(1)}% need monitoring.`;
    }

    return `High-risk profile: short runway, heavier churn, or capital-intensive execution before the next round.`;
}
