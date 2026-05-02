const mockData = {
    summary: {
        totalStartups: 124,
        totalFunding: "$42.5M",
        avgROI: "18.4%",
        riskLevel: "Medium-Low"
    },
    startups: [
        {
            id: 1,
            name: "CyberShield AI",
            sector: "Cybersecurity",
            fundingStage: "Series A",
            totalFunding: 5500000,
            riskLevel: "Low",
            cac: 450,
            ltv: 2800,
            burnRate: 120000,
            runway: 18,
            decisionScore: 9.2,
            signal: "INVEST",
            reason: "Strong retention rates and high LTV/CAC ratio.",
            financialHistory: [120, 150, 180, 210, 240, 300, 350, 420, 500, 580, 650, 720]
        },
        {
            id: 2,
            name: "EcoLogistics",
            sector: "Logistics",
            fundingStage: "Seed",
            totalFunding: 1200000,
            riskLevel: "Medium",
            cac: 800,
            ltv: 1500,
            burnRate: 45000,
            runway: 12,
            decisionScore: 6.5,
            signal: "AVOID",
            reason: "High operational costs and low unit margins.",
            financialHistory: [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95]
        },
        {
            id: 3,
            name: "FinFlow",
            sector: "Fintech",
            fundingStage: "Series B",
            totalFunding: 12000000,
            riskLevel: "Low",
            cac: 1200,
            ltv: 9500,
            burnRate: 350000,
            runway: 24,
            decisionScore: 8.8,
            signal: "INVEST",
            reason: "Dominant market position and scalable infrastructure.",
            financialHistory: [800, 850, 920, 1050, 1200, 1400, 1650, 1900, 2200, 2600, 3100, 3800]
        },
        {
            id: 4,
            name: "HealthGenic",
            sector: "Healthtech",
            fundingStage: "Series A",
            totalFunding: 3800000,
            riskLevel: "High",
            cac: 2500,
            ltv: 4000,
            burnRate: 200000,
            runway: 8,
            decisionScore: 4.2,
            signal: "AVOID",
            reason: "Short runway and high regulatory hurdles.",
            financialHistory: [200, 210, 205, 220, 215, 230, 225, 240, 235, 250, 245, 260]
        },
        {
            id: 5,
            name: "SolarGrid",
            sector: "Energy",
            fundingStage: "Seed",
            totalFunding: 800000,
            riskLevel: "Medium",
            cac: 300,
            ltv: 1200,
            burnRate: 30000,
            runway: 15,
            decisionScore: 7.9,
            signal: "INVEST",
            reason: "Innovative storage tech with low customer acquisition cost.",
            financialHistory: [10, 15, 25, 40, 60, 90, 130, 180, 240, 310, 390, 480]
        }
    ],
    sectorGrowth: {
        labels: ["Fintech", "Healthtech", "Cybersecurity", "Logistics", "Energy", "SaaS"],
        data: [25, 18, 32, 12, 28, 22]
    },
    investmentTrends: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        data: [1.2, 1.5, 1.8, 2.4, 2.1, 2.9, 3.5, 3.2, 3.8, 4.5, 4.2, 5.1]
    }
};

export default mockData;
