import mysql from 'mysql2/promise';

const poolConfig = buildPoolConfig();

export const pool = mysql.createPool({
    ...poolConfig,
    ssl: poolConfig.ssl,
    host: process.env.DB_HOST || poolConfig.host || '127.0.0.1',
    port: Number(process.env.DB_PORT || poolConfig.port || 3306),
    user: process.env.DB_USER || poolConfig.user || 'root',
    password: process.env.DB_PASSWORD || poolConfig.password || '',
    database: process.env.DB_NAME || poolConfig.database || 'startup_investment_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true,
    dateStrings: true
});

export async function query(sql, params = []) {
    const [rows] = await pool.execute(sql, params);
    return rows;
}

function buildPoolConfig() {
    const config = {};

    if (process.env.DATABASE_URL) {
        const databaseUrl = new URL(process.env.DATABASE_URL);
        config.host = databaseUrl.hostname;
        config.port = databaseUrl.port ? Number(databaseUrl.port) : 3306;
        config.user = decodeURIComponent(databaseUrl.username);
        config.password = decodeURIComponent(databaseUrl.password);
        config.database = databaseUrl.pathname.replace(/^\//, '');

        const sslMode = databaseUrl.searchParams.get('ssl') || databaseUrl.searchParams.get('sslmode');
        if (sslMode && sslMode !== 'false' && sslMode !== 'disable') {
            config.ssl = { rejectUnauthorized: false };
        }
    }

    if (String(process.env.DB_SSL || '').toLowerCase() === 'true') {
        config.ssl = { rejectUnauthorized: false };
    }

    return config;
}
