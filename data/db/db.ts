import { Pool } from 'pg';

let pool: Pool;

const config = {
    user: process.env.DB_USER || 'unstock',
    // host: process.env.DB_HOST || 'database-2.cfoer6mioajy.us-east-2.rds.amazonaws.com',
    host: 'database-2.cfoer6mioajy.us-east-2.rds.amazonaws.com',
    database: process.env.DB_NAME || 'unstock',
    password: process.env.DB_PASSWORD || 'unstock',
    port: 5432,
};

export function getConnection(): Pool {
    if (!pool) {
        pool = new Pool(config);
    }

    return pool;
}

export async function closeConnection() {
    if (!!pool) {
        pool.end();
    }
}

export async function runQuery(query: string, values?: any[]) {
    const client = await getConnection().connect();
    const res = await client.query(query, values);
    client.release();
    return res;
}
